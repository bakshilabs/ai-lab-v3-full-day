// The contract every "Eco Town of the future" module is built against (docs/MODULES.md). Pure: no page, no 3D.
// It names the modules, and checks and trims what a module hands back, so one module's mistake cannot spoil the save.
// DO NOT CHANGE while module work is in progress: three modules are built against exactly this.

export const MODULE_IDS = ['drone', 'robots', 'roads', 'film', 'power'];
// Modules shown on the board in the game. A module is added here only once it is built and merged, so a child never
// meets a placeholder. (film and power were added to the contract on 15 Nov 2026; the interface did not change.)
export const ON_BOARD = ['drone', 'robots', 'roads'];
export const CONTRACT = 1;

const text = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max) : '');
const small = (v, maxBytes) => { try { const s = JSON.stringify(v); return s !== undefined && s.length <= maxBytes ? JSON.parse(s) : null; } catch { return null; } };

// What a module made, for the take-home page: a title, up to six short lines, and an optional picture
// (inline SVG markup or a data:image/png address, at most 200 KB). Never anything the child typed.
export function cleanMade(made) {
  if (!made || typeof made !== 'object') return null;
  const title = text(made.title, 60); if (!title) return null;
  const lines = (Array.isArray(made.lines) ? made.lines : []).map((l) => text(l, 120)).filter(Boolean).slice(0, 6);
  const p = typeof made.picture === 'string' && made.picture.length <= 200000 && (/^<svg[\s>]/.test(made.picture) || /^data:image\/png;base64,/.test(made.picture)) && !/<script|on\w+\s*=|javascript:/i.test(made.picture) ? made.picture : null;
  return { title, lines, ...(p ? { picture: p } : {}) };
}
// "You practised…": two to four lines, built from what the child did. Each line completes "You practised …".
export function cleanPractised(list) {
  const out = (Array.isArray(list) ? list : []).map((l) => text(l, 120)).filter(Boolean).slice(0, 4);
  return out.length >= 2 ? out : null;
}
// The one visible result a module leaves in the town: { kind, data }. data is the module's own, at most 4 KB.
export function cleanTown(town) {
  if (!town || typeof town !== 'object') return null;
  const kind = text(town.kind, 30); const data = small(town.data ?? {}, 4000);
  return kind && data !== null ? { kind, data } : null;
}
// What run() resolves with. finished: the loop was completed (false: the child left early; nothing is recorded as done).
export function cleanResult(result) {
  if (!result || typeof result !== 'object') return null;
  const made = cleanMade(result.record?.made); const practised = cleanPractised(result.record?.practised);
  return { finished: !!result.finished && !!made && !!practised, record: made && practised ? { made, practised } : null, town: cleanTown(result.town) };
}
// A module's own progress between visits: anything JSON, at most 8 KB. Never anything typed.
export const cleanState = (state) => small(state ?? null, 8000);
// What the leader's list shows while a child is in a module.
export function cleanReport(id, r = {}) {
  return { module: id, stage: text(r.stage, 80), state: ['playing', 'finished'].includes(r.state) ? r.state : 'playing', finished: !!r.finished };
}
// Is this object a module? (used by the loader and by tests/modules.test.mjs)
export function checkModule(mod, id) {
  const bad = [];
  if (!mod || typeof mod !== 'object') return ['not an object'];
  if (mod.id !== id) bad.push(`id must be "${id}"`);
  if (!MODULE_IDS.includes(mod.id)) bad.push('unknown id');
  for (const k of ['title', 'blurb']) if (!mod[k] || !text(mod[k].j, 80) || !text(mod[k].s, 80)) bad.push(`${k} needs { j, s } text`);
  if (!text(mod.icon, 8)) bad.push('icon missing');
  if (typeof mod.run !== 'function') bad.push('run(ctx) missing');
  if (mod.show !== undefined && typeof mod.show !== 'function') bad.push('show must be a function');
  if (mod.css !== undefined && typeof mod.css !== 'string') bad.push('css must be a string');
  return bad;
}
// The record kept in the save for one module (G.modules[id]). The picture is kept apart, on the device only.
export function storedModule(prev, result, state, at = Date.now()) {
  const out = { ...(prev || {}), at, state: cleanState(state) };
  if (result?.finished) { out.done = true; out.times = (prev?.times || 0) + 1; }
  if (result?.record) out.record = { made: { title: result.record.made.title, lines: result.record.made.lines }, practised: result.record.practised };
  if (result?.town) out.town = result.town;
  return out;
}
