// Town film studio: how Florence puts a cut together, and how each piece of feedback changes it. Pure: no page, no 3D.
// A shot is { id, move, sub, secs, keep }: a camera move from the kit (kit.js), a subject ('town', 'place:<id>' or
// 'who:<id>') and a length. keep marks a shot the child asked for, so "shorter" cuts something else first.
// A cut is { n, mood, shots, tags, gone, moodWas, dirty, next }: tags, gone and moodWas say what changed since the
// cut before, which is what the storyboard shows.
import { MOVES, MOOD_IDS, WHO_IDS, moodOf, placeOf, whoHere } from './kit.js';

export const MIN_SHOTS = 3, MAX_SHOTS = 6, MIN_SECS = 2.5, LONG_SECS = 7;

// The first cut for each mood: [move, subject]. 'place' and 'who' are the child's choices.
const RECIPES = {
  calm:     [['wide', 'town'], ['push', 'place'], ['close', 'who'], ['orbit', 'place']],
  curious:  [['street', 'place'], ['rise', 'place'], ['close', 'who'], ['orbit', 'place'], ['glide', 'town']],
  cheerful: [['wide', 'town'], ['push', 'place'], ['street', 'place'], ['close', 'who'], ['orbit', 'place']],
  party:    [['glide', 'town'], ['push', 'place'], ['street', 'place'], ['close', 'who'], ['rise', 'place'], ['orbit', 'place']],
};
// What "shorter" (or making room for a new shot) cuts first.
const CUT_FIRST = ['glide', 'rise', 'street', 'orbit', 'wide', 'push', 'pull', 'close'];

// The feedback tiles, in the order shown. short: how the storyboard and the take-home page name it.
export const FEEDBACK = [
  { id: 'shorter',  icon: '✂️', label: 'Shorter',               short: 'shorter' },
  { id: 'school',   icon: '🏫', label: 'Start at the school',   short: 'start at the school' },
  { id: 'otters',   icon: '🦦', label: 'Show the otters',       short: 'show the otters' },
  { id: 'family',   icon: '👪', label: 'Show a family',         short: 'show a family' },
  { id: 'florence', icon: '🤖', label: 'Show Florence',         short: 'show Florence' },
  { id: 'town',     icon: '🏝️', label: 'End on the whole town', short: 'end on the whole town' },
  { id: 'calmer',   icon: '🎵', label: 'Calmer music',          short: 'calmer music' },
  { id: 'livelier', icon: '🎶', label: 'Livelier music',        short: 'livelier music' },
];
export const feedbackOf = (id) => FEEDBACK.find((f) => f.id === id) || null;

const subOf = (what, brief) => (what === 'place' ? `place:${brief.place}` : what === 'who' ? `who:${brief.who}` : 'town');
const round = (n) => Math.round(n * 2) / 2;

// Is the brief something Florence can film? (a place that exists, someone who is there, a mood)
export function briefOk(brief, set) {
  return !!brief && !!placeOf(set, brief.place) && !!set.who[brief.who]?.here && MOOD_IDS.includes(brief.mood);
}

// Florence's first cut: four to six shots from the kit, chosen by the mood, of the place and who the child picked.
export function firstCut(brief, set) {
  if (!briefOk(brief, set)) return null;
  const mood = moodOf(brief.mood); let next = 1;
  const shots = RECIPES[mood.id].map(([move, what]) => ({ id: 's' + next++, move, sub: subOf(what, brief), secs: mood.secs }));
  // the brief itself is kept when the film is made shorter: who is in it, and one shot of the place
  shots.find((s) => s.sub.startsWith('who:')).keep = true; shots.find((s) => s.sub.startsWith('place:')).keep = true;
  return { n: 1, mood: mood.id, shots, tags: {}, gone: [], moodWas: null, dirty: false, next };
}

export const cutSecs = (cut) => round((cut?.shots || []).reduce((s, x) => s + x.secs, 0));

// The first change after a cut has been watched starts the next cut, and clears the marks of the one before.
function open(cut) {
  const c = { ...cut, shots: cut.shots.map((s) => ({ ...s })), tags: { ...cut.tags }, gone: cut.gone.slice() };
  if (!c.dirty) { c.n = cut.n + 1; c.tags = {}; c.gone = []; c.moodWas = null; c.dirty = true; }
  return c;
}
// The shot to cut: one the child did not ask for, the least needed kind first, the later of two the same.
function spare(shots, protect = []) {
  const pick = (list) => list.slice().sort((a, b) => CUT_FIRST.indexOf(a.move) - CUT_FIRST.indexOf(b.move) || shots.indexOf(b) - shots.indexOf(a))[0] || null;
  const free = shots.filter((s) => !protect.includes(s.id));
  return pick(free.filter((s) => !s.keep)) || pick(free);
}
function drop(c, shot) { const at = c.shots.indexOf(shot); c.shots.splice(at, 1); delete c.tags[shot.id]; c.gone.push({ move: shot.move, sub: shot.sub, at }); return shot; }
function add(c, at, move, sub, secs) {
  const shot = { id: 's' + c.next++, move, sub, secs, keep: true }; c.shots.splice(at, 0, shot); c.tags[shot.id] = 'new';
  let dropped = null; if (c.shots.length > MAX_SHOTS) dropped = drop(c, spare(c.shots, [shot.id]));
  return { shot, dropped };
}
const numberOf = (c, shot) => c.shots.indexOf(shot) + 1;

// One piece of feedback. Returns { cut, ok, code, … }: ok is false when nothing changed (code says why), and the
// rest is what the words need (words.js). The cut that comes back is a new object; the one passed in is untouched.
export function applyFeedback(cut, id, set, brief) {
  const no = (code, more = {}) => ({ cut, ok: false, code, ...more });
  const c = open(cut); const yes = (code, more = {}) => ({ cut: c, ok: true, code, ...more });
  const secs = moodOf(c.mood).secs;
  if (id === 'shorter') {
    if (c.shots.length > MIN_SHOTS) { const s = drop(c, spare(c.shots)); return yes('shorter-cut', { shot: s }); }
    if (c.shots.some((s) => s.secs > MIN_SECS)) { for (const s of c.shots) if (s.secs > MIN_SECS) { s.secs = Math.max(MIN_SECS, s.secs - 1); c.tags[s.id] = c.tags[s.id] || 'changed'; } return yes('shorter-trim'); }
    return no('shorter-limit');
  }
  if (id === 'school') {
    if (!set.school) return no('school-none');
    const sub = `place:${set.school}`; const at = c.shots.findIndex((s) => s.sub === sub);
    if (at === 0) return no('school-already');
    if (at > 0) { const [s] = c.shots.splice(at, 1); s.keep = true; c.shots.unshift(s); c.tags[s.id] = c.tags[s.id] === 'new' ? 'new' : 'moved'; return yes('school-moved', { shot: s }); }
    const r = add(c, 0, 'push', sub, secs); return yes('school-new', r);
  }
  if (WHO_IDS.includes(id)) {
    if (!set.who[id]?.here) return no('who-missing', { who: id, offers: whoHere(set) });
    const sub = `who:${id}`; const have = c.shots.find((s) => s.sub === sub);
    if (have) {
      if (have.secs >= LONG_SECS) return no('who-already', { who: id, number: numberOf(c, have) });
      have.secs = Math.min(LONG_SECS, have.secs + 2); have.keep = true; c.tags[have.id] = c.tags[have.id] || 'changed';
      return yes('who-longer', { who: id, number: numberOf(c, have) });
    }
    const r = add(c, Math.min(2, c.shots.length), 'close', sub, secs); return yes('who-new', { who: id, ...r, number: numberOf(c, r.shot) });
  }
  if (id === 'town') {
    const last = c.shots[c.shots.length - 1];
    if (last && (last.move === 'pull' || (last.move === 'wide' && last.sub === 'town'))) return no('town-already');
    const r = add(c, c.shots.length, 'pull', `place:${brief.place}`, Math.max(secs, 4.5)); return yes('town-new', r);
  }
  if (id === 'calmer' || id === 'livelier') {
    const i = MOOD_IDS.indexOf(c.mood) + (id === 'calmer' ? -1 : 1);
    if (i < 0 || i >= MOOD_IDS.length) return no('music-limit', { dir: id });
    if (c.moodWas === null) c.moodWas = c.mood;
    c.mood = MOOD_IDS[i]; if (c.moodWas === c.mood) c.moodWas = null;
    return yes('music', { dir: id, mood: c.mood });
  }
  return no('unknown');
}

// Ages 13–17: move a shot one place earlier (-1) or later (+1).
export function moveShot(cut, shotId, dir) {
  const at = cut.shots.findIndex((s) => s.id === shotId); const to = at + dir;
  if (at < 0 || to < 0 || to >= cut.shots.length) return { cut, ok: false };
  const c = open(cut); const [s] = c.shots.splice(at, 1); c.shots.splice(to, 0, s); s.keep = true; c.tags[s.id] = c.tags[s.id] === 'new' ? 'new' : 'moved';
  return { cut: c, ok: true, shot: s, number: to + 1 };
}
// After a cut has been watched it is no longer "new": the next change starts another cut. The marks stay on show.
export const watched = (cut) => ({ ...cut, dirty: false });

// ---- the module's saved progress: the brief, the cut, and what was asked between cuts. Never anything typed.
export function fresh() { return { v: 1, brief: { place: null, who: null, mood: null }, cut: null, plays: 0, log: [], cant: [], title: 0, moved: 0, titled: false }; }
const okShot = (s, set) => s && typeof s.id === 'string' && !!MOVES[s.move] && Number.isFinite(s.secs)
  && (s.sub === 'town' || (String(s.sub).startsWith('place:') && !!placeOf(set, s.sub.slice(6))) || (String(s.sub).startsWith('who:') && !!set.who[s.sub.slice(4)]?.here));
// Last visit's progress, checked against the town as it is now (a place may have been knocked down since).
export function restore(saved, set) {
  const st = fresh(); if (!saved || typeof saved !== 'object' || saved.done || saved.v !== 1) return st;
  const b = saved.brief || {};
  if (placeOf(set, b.place)) st.brief.place = b.place; else return st;
  if (set.who[b.who]?.here) st.brief.who = b.who; else return st;
  if (MOOD_IDS.includes(b.mood)) st.brief.mood = b.mood; else return st;
  const c = saved.cut;
  if (c && Array.isArray(c.shots) && MOOD_IDS.includes(c.mood)) {
    const shots = c.shots.filter((s) => okShot(s, set)).slice(0, MAX_SHOTS).map((s) => ({ id: s.id, move: s.move, sub: s.sub, secs: Math.max(MIN_SECS, Math.min(LONG_SECS + 1, s.secs)), ...(s.keep ? { keep: true } : {}) }));
    if (shots.length >= MIN_SHOTS && new Set(shots.map((s) => s.id)).size === shots.length) {
      const ids = new Set(shots.map((s) => s.id));
      st.cut = { n: Math.max(1, c.n | 0), mood: c.mood, shots, tags: Object.fromEntries(Object.entries(c.tags || {}).filter(([k, v]) => ids.has(k) && ['new', 'moved', 'changed'].includes(v))),
        gone: (Array.isArray(c.gone) ? c.gone : []).filter((g) => g && MOVES[g.move]).slice(0, 6).map((g) => ({ move: g.move, sub: String(g.sub), at: g.at | 0 })),
        moodWas: MOOD_IDS.includes(c.moodWas) ? c.moodWas : null, dirty: !!c.dirty, next: Math.max(c.next | 0, shots.length + 1, ...shots.map((s) => (parseInt(s.id.slice(1), 10) || 0) + 1)) };
      st.plays = Math.max(0, saved.plays | 0); st.title = Math.max(0, saved.title | 0); st.moved = Math.max(0, saved.moved | 0); st.titled = !!saved.titled;
      st.log = (Array.isArray(saved.log) ? saved.log : []).filter((l) => l && Number.isFinite(l.n) && (feedbackOf(l.id) || l.id === 'moved')).slice(-40).map((l) => ({ n: l.n | 0, id: l.id }));
      st.cant = (Array.isArray(saved.cant) ? saved.cant : []).filter((w) => WHO_IDS.includes(w)).slice(0, 3);
    }
  }
  if (!st.cut && briefOk(st.brief, set)) st.cut = firstCut(st.brief, set);
  return st;
}

// What stays in the town: enough to draw the film's frames again (screen.js), well under 4 KB.
export function townData(st, set, title) {
  return { title, mood: st.cut.mood, by: set.square, shots: st.cut.shots.map((s) => [s.move, s.sub]) };
}
