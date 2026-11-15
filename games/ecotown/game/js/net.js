// The learner's session with the server, and the copy of their progress kept there.
//   - Each learner has their own town on a device: when a different learner joins on the same browser, the earlier
//     learner's saved things are put away and the new learner's are brought out (swapLearner).
//   - A copy of the progress goes to the server after each save and when the page is hidden. It never holds anything
//     the player typed: the town's name, instructions, the diary and the reflection stay on the device (forServer).
//   - On start the newer of the two copies is used (pull).
// The pure parts (forServer, mergeFromServer, swapLearner, statusOf) are tested in tests/net.test.mjs.
// A copy run from the source files or a static site has no server: every call here then does nothing.

export const SAVE_KEY = 'ecotown.save.v3';
export const FMT = 1; // the save's layout number; a save written by a newer layout is never loaded or overwritten
const BOX = 'ecotown.box.'; const WHO = 'ecotown.learner';
const OWN = (k) => k.startsWith('ecotown.') && !k.startsWith(BOX) && k !== WHO && k !== 'ecotown.prefs'; // settings belong to the device, not the learner

// Fields of a save that may go to the server: the town and its progress. Nothing typed, nothing that quotes typed words.
const SAFE = ['band', 'li', 'at', 'fmt', 'badges', 'bestScore', 'medal', 'milestones', 'placements', 'catches', 'trusted', 'introDone', 'levelStars', 'starMarks', 'bonus',
  'extra', 'credits', 'inputMode', 'paths', 'labs', 'ever', 'classMode', 'day', 'movedIn', 'completeShown', 'reflectDone', 'shop', 'chSeen', 'eps', 'pauses', 'sessionDone', 'modules'];
export function forServer(save) {
  if (!save || typeof save !== 'object') return null;
  const out = { cells: save.cells || [] };
  for (const k of SAFE) if (save[k] !== undefined) out[k] = save[k];
  if (save.outcomes) out.outcomes = Object.fromEntries(Object.entries(save.outcomes).map(([id, o]) => [id, { kind: o?.kind || 'clean' }])); // what happened, without the sentence that quotes the instruction
  return out;
}
// The copy to use on this device: the newer of the two. Typed things only ever come from the device's own copy.
export function mergeFromServer(local, remote) {
  if (!remote || !remote.data) return { save: local || null, from: 'device' };
  const lAt = local?.at || 0; const rAt = remote.at || remote.data.at || 0;
  if (local && lAt >= rAt) return { save: local, from: 'device' };
  const save = { ...(local || {}), ...remote.data, at: rAt };
  if (local?.outcomes && remote.data.outcomes) save.outcomes = Object.fromEntries(Object.entries(remote.data.outcomes).map(([id, o]) => [id, { ...(local.outcomes[id] || { detail: '' }), kind: o.kind }]));
  else if (remote.data.outcomes) save.outcomes = Object.fromEntries(Object.entries(remote.data.outcomes).map(([id, o]) => [id, { kind: o.kind, detail: '' }]));
  if (!save.townName) save.townName = 'Eco Town';
  return { save, from: 'server' };
}
// Another learner on this browser: put the earlier learner's things in their own box and bring this learner's out.
// storage: the localStorage interface. Returns 'same' | 'first' | 'swapped'.
export function swapLearner(storage, learner) {
  if (!learner) return 'same';
  const was = storage.getItem(WHO);
  if (was === learner) return 'same';
  const keys = []; for (let i = 0; i < storage.length; i++) { const k = storage.key(i); if (k && OWN(k)) keys.push(k); }
  if (!was) { storage.setItem(WHO, learner); return 'first'; } // things saved before learners existed belong to the first learner here
  const mine = {}; for (const k of keys) { mine[k] = storage.getItem(k); storage.removeItem(k); }
  if (keys.length) storage.setItem(BOX + was, JSON.stringify(mine));
  let theirs = {}; try { theirs = JSON.parse(storage.getItem(BOX + learner) || '{}'); } catch { theirs = {}; }
  for (const [k, v] of Object.entries(theirs)) storage.setItem(k, v);
  storage.removeItem(BOX + learner); storage.setItem(WHO, learner);
  return 'swapped';
}
// What the group's leader sees for this learner: where they are and whether something is wrong. No typed text.
const cut = (s, n) => String(s || '').slice(0, n);
export function statusOf(x) {
  return { module: cut(x.module || 'ecotown', 20), band: cut(x.band, 20), stage: cut(x.stage, 80), missionsDone: Math.max(0, Math.min(6, x.missionsDone | 0)), goalsMet: Math.max(0, Math.min(8, x.goalsMet | 0)),
    state: cut(x.state || 'building', 20), problem: x.problem ? cut(x.problem, 80) : null, stuck: !!x.stuck, finished: !!x.finished, at: x.at || Date.now() };
}

// ---------------- the calls (browser only)
const local = () => typeof location === 'undefined' || /^(localhost|127\.0\.0\.1)$|github\.io$/.test(location.hostname);
const state = { on: null, me: null, lastPush: 0, timer: null, statusFn: null, onLock: null };
async function call(path, opt = {}) {
  if (state.on === false || (local() && !globalThis.__ecoApi)) { state.on = false; return null; }
  let r; try { r = await fetch(path, { credentials: 'same-origin', ...opt }); } catch { return null; } // offline: keep playing
  if (state.on === null && [404, 405, 501].includes(r.status)) { state.on = false; return null; }    // no session server here
  state.on = true;
  let d = {}; try { d = await r.json(); } catch { /* not JSON */ }
  if (r.status === 409 && d.reason === 'other') { if (typeof location !== 'undefined') location.reload(); return null; } // another learner joined in this browser: start again as them (this learner's town stays in its box)
  if (r.status === 409) { state.onLock?.(d); return null; }
  return r.ok ? d : null;
}
export const net = {
  // who am I: { learner, badge, group } or null (no server, or not signed in)
  async me() { if (state.me) return state.me; const d = await call('/api/me'); if (d?.ok) state.me = d; return state.me; },
  badge: () => state.me?.badge || null,
  onLock(fn) { state.onLock = fn; }, setStatus(fn) { state.statusFn = fn; },
  // bring this learner's things out, then take the newer of the device's and the server's copy of the town
  async pull(storage = localStorage) {
    const me = await net.me(); if (!me) return 'off';
    try {
      swapLearner(storage, me.learner);
      const d = await call('/api/save'); let mine = null; try { mine = JSON.parse(storage.getItem(SAVE_KEY) || 'null'); } catch { mine = null; }
      const m = mergeFromServer(mine, d?.save); if (m.from === 'server') storage.setItem(SAVE_KEY, JSON.stringify(m.save));
      return m.from;
    } catch { return 'device'; } // storage off: play on without it
  },
  // send the copy soon (at most one every 20 seconds), or now when the page is being hidden
  push(save, { now = false } = {}) {
    if (state.on === false || !state.me) return;
    const send = () => { state.lastPush = Date.now(); const body = JSON.stringify({ learner: state.me.learner, at: save.at || Date.now(), v: FMT, data: forServer(save), status: state.statusFn ? statusOf(state.statusFn()) : undefined });
      if (body.length > 60000) return; call('/api/save', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body, keepalive: now && body.length < 60000 }); };
    clearTimeout(state.timer);
    if (now) return send();
    state.timer = setTimeout(send, Math.max(1500, 20000 - (Date.now() - state.lastPush)));
  },
  // every minute: still signed in? and where the learner is, for the leader's list
  async beat() { return call('/api/heartbeat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ learner: state.me?.learner, status: state.statusFn ? statusOf(state.statusFn()) : undefined }) }); },
  logout: () => call('/api/logout', { method: 'POST' }),
  get on() { return state.on === true; },
};
