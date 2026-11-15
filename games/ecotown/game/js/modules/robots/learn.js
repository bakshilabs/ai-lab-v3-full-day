// Robot training: the learning itself. Pure: no page, no 3D, no clock, no chance beyond a seed.
// The robot only knows the examples it has been shown. To sort a new thing it finds the example that shares the most
// features with it (nearest neighbour by counting matches) and uses that example's bin. If nothing it was shown has
// anything in common, or two bins are equally close, it does not guess: it asks for help.

export const BINS = [
  { id: 'paper', name: 'Paper and card', noun: 'paper and card', colour: '#3a6fc9' },
  { id: 'glass', name: 'Glass', noun: 'glass', colour: '#2e9b5a' },
  { id: 'food', name: 'Food scraps', noun: 'food scraps', colour: '#a9743f' },
  { id: 'repair', name: 'Repair café', noun: 'things to repair', colour: '#d9533d' },
];
export const binsFor = (junior) => BINS.slice(0, junior ? 3 : 4);
export const binById = (id) => BINS.find((b) => b.id === id) || null;

// What the robot's camera and gripper can tell about a thing. Ages 13–17 have one more: its condition.
export const FEATURES = {
  colour: { label: 'Colour', same: 'same colour' },
  shape: { label: 'Shape', same: 'same shape' },
  feel: { label: 'Feel', same: 'same feel' },
  state: { label: 'Condition', same: 'same condition' },
};
export const featuresFor = (junior) => (junior ? ['colour', 'shape', 'feel'] : ['colour', 'shape', 'feel', 'state']);

// Every kind of thing. start: on the bench from the beginning. hard: always in the test tray. senior: ages 13–17 only.
const K = (id, name, bin, colour, shape, feel, state = 'good', o = {}) => ({ id, name, bin, f: { colour, shape, feel, state }, ...o });
export const KINDS = [
  K('newspaper', 'newspaper', 'paper', 'white', 'flat', 'papery', 'good', { start: 1 }),
  K('cardbox', 'cardboard box', 'paper', 'brown', 'box', 'papery', 'good', { start: 1 }),
  K('comic', 'comic', 'paper', 'red', 'flat', 'papery'),
  K('paperbag', 'paper bag', 'paper', 'white', 'bag', 'papery'),
  K('paperball', 'paper ball', 'paper', 'white', 'ball', 'papery'),
  K('clearjar', 'clear jar', 'glass', 'clear', 'jar', 'see-through', 'good', { start: 1 }),
  K('clearbottle', 'clear bottle', 'glass', 'clear', 'bottle', 'see-through', 'good', { start: 1 }),
  K('greenbottle', 'green bottle', 'glass', 'green', 'bottle', 'see-through', 'good', { hard: 1 }),
  K('brownbottle', 'brown bottle', 'glass', 'brown', 'bottle', 'see-through'),
  K('bluejar', 'blue jar', 'glass', 'blue', 'jar', 'see-through'),
  K('banana', 'banana skin', 'food', 'yellow', 'peel', 'squashy', 'good', { start: 1 }),
  K('lettuce', 'lettuce leaf', 'food', 'green', 'leaf', 'squashy', 'good', { start: 1 }),
  K('applecore', 'apple core', 'food', 'red', 'core', 'squashy'),
  K('orangepeel', 'orange peel', 'food', 'orange', 'peel', 'squashy'),
  K('eggshell', 'eggshell', 'food', 'white', 'shell', 'hard', 'good', { hard: 1 }),
  K('teabag', 'teabag', 'food', 'brown', 'bag', 'squashy', 'good', { hard: 1 }),
  K('pizzabox', 'greasy pizza box', 'food', 'brown', 'box', 'papery', 'greasy', { hard: 1, senior: 1 }),
  K('toaster', 'broken toaster', 'repair', 'silver', 'box', 'hard', 'broken', { start: 1, senior: 1 }),
  K('teddy', 'torn teddy', 'repair', 'brown', 'toy', 'soft', 'broken', { start: 1, senior: 1 }),
  K('radio', 'broken radio', 'repair', 'red', 'box', 'hard', 'broken', { senior: 1 }),
  K('lamp', 'broken lamp', 'repair', 'yellow', 'lamp', 'hard', 'broken', { senior: 1 }),
  K('tornbook', 'torn book', 'repair', 'blue', 'flat', 'papery', 'broken', { hard: 1, senior: 1 }),
];
const BY_ID = new Map(KINDS.map((k) => [k.id, k]));
export const kind = (id) => BY_ID.get(id) || null;
export const kindsFor = (junior) => KINDS.filter((k) => !junior || !k.senior);
export const starters = (junior) => kindsFor(junior).filter((k) => k.start).map((k) => k.id);
export const TRAY_SIZE = (junior) => (junior ? 8 : 10);
export const STREET_SIZE = (junior) => (junior ? 5 : 6);
export const ROOM = (junior) => (junior ? 4 : 5); // how many more examples fit on the bench in each later round
export const MAX_TESTS = 4;

// ---------- a small seeded generator, so a tray is the same every time for the same seed
export function rng(seed) { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function seedFrom(text) { let h = 2166136261; for (const c of String(text)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function shuffle(list, r) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// The test tray: things kept apart from the examples. It always holds the hard kinds, and at least two for each bin.
export function makeTray(seed, junior) {
  const r = rng(seed); const pool = kindsFor(junior); const bins = binsFor(junior); const size = TRAY_SIZE(junior);
  const tray = pool.filter((k) => k.hard).map((k) => k.id); const rest = shuffle(pool.filter((k) => !k.hard), r);
  const count = (b) => tray.filter((id) => kind(id).bin === b).length;
  for (const b of bins) for (const k of rest) { if (count(b.id) >= 2) break; if (k.bin === b.id && !tray.includes(k.id)) tray.push(k.id); }
  for (const k of rest) { if (tray.length >= size) break; if (!tray.includes(k.id)) tray.push(k.id); }
  return shuffle(tray.slice(0, size), r);
}
// The things the robot meets in the street afterwards: a fresh draw, one for each bin first.
export function makeStreet(seed, junior) {
  const r = rng((seed ^ 0x5bd1e995) >>> 0); const pool = shuffle(kindsFor(junior), r); const out = [];
  for (const b of binsFor(junior)) { const k = pool.find((x) => x.bin === b.id && !out.includes(x.id)); if (k) out.push(k.id); }
  for (const k of pool) { if (out.length >= STREET_SIZE(junior)) break; if (!out.includes(k.id)) out.push(k.id); }
  return shuffle(out, r);
}

// ---------- the classifier
// How alike two things are: the features they share.
export function alike(a, b, feats) { const same = feats.filter((f) => a.f[f] === b.f[f]); return { n: same.length, same }; }
// examples: [{ kind: id, bin: id }] in the order shown. Returns what the robot does with the thing:
//   { bin, match, same, n }             it found one closest example (or several, all in one bin)
//   { bin: null, why: 'none' }          nothing it was shown has anything in common
//   { bin: null, why: 'tie', rivals }   examples in two bins are equally close: [{ kind, bin, same }, …]
export function classify(id, examples, feats) {
  const item = kind(id); let best = 0; const scored = [];
  for (const ex of examples) { const k = kind(ex.kind); if (!k || !item) continue; const s = alike(item, k, feats); scored.push({ kind: ex.kind, bin: ex.bin, same: s.same, n: s.n }); if (s.n > best) best = s.n; }
  if (!best) return { bin: null, why: 'none', n: 0 };
  const top = scored.filter((s) => s.n === best); const bins = [...new Set(top.map((s) => s.bin))];
  if (bins.length > 1) return { bin: null, why: 'tie', n: best, rivals: bins.slice(0, 2).map((b) => top.find((s) => s.bin === b)) };
  return { bin: bins[0], match: top[0].kind, same: top[0].same, n: best, exact: best === feats.length };
}
// Run a tray. Each result: { kind, truth, got (bin or null), ok, …what classify said }.
export function runTest(tray, examples, feats) {
  const results = tray.map((id) => { const c = classify(id, examples, feats); const truth = kind(id).bin; return { kind: id, truth, got: c.bin, ok: c.bin === truth, ...c }; });
  return { results, right: results.filter((x) => x.ok).length, asked: results.filter((x) => x.got === null).length, of: results.length };
}

// What was missing for a thing the robot did not get right.
//   { type: 'bin' }                     it was shown nothing at all for the right bin
//   { type: 'nothing' }                 nothing it was shown for the right bin shares any feature with this
//   { type: 'lacks', feat, value, seen } in the right bin it has only seen other values of this feature (seen: [values])
//   { type: 'closer' }                  it has seen every feature, but an example in another bin is as close or closer
export function gap(id, examples, feats) {
  const item = kind(id); const mine = examples.filter((e) => e.bin === item.bin).map((e) => kind(e.kind));
  if (!mine.length) return { type: 'bin' };
  const lacking = feats.filter((f) => !mine.some((k) => k.f[f] === item.f[f]));
  if (lacking.length === feats.length) return { type: 'nothing' };
  if (!lacking.length) return { type: 'closer' };
  const feat = ['state', 'colour', 'shape', 'feel'].find((f) => lacking.includes(f));
  return { type: 'lacks', feat, value: item.f[feat], seen: [...new Set(mine.map((k) => k.f[feat]))] };
}

// ---------- the bench rules
// May this thing be added as an example now? (examples: all shown so far; added: how many in this round; round 0 is the first)
export function canShow(id, bin, examples, round, added, junior) {
  const k = kind(id); if (!k || (junior && k.senior)) return { ok: false, why: 'unknown' };
  if (examples.some((e) => e.kind === id)) return { ok: false, why: 'shown' };
  if (round === 0 && !k.start) return { ok: false, why: 'later' };
  if (round > 0 && added >= ROOM(junior)) return { ok: false, why: 'full' };
  if (k.bin !== bin) return { ok: false, why: 'bin', right: k.bin };
  return { ok: true };
}
// The first round can be tested once every bin has an example. Later rounds need at least one more example.
export function readyToTest(examples, round, added, junior) {
  return round === 0 ? binsFor(junior).every((b) => examples.some((e) => e.bin === b.id)) : added > 0;
}
// What is on the shelf to choose from in a round.
export function shelf(examples, round, junior) {
  const shown = new Set(examples.map((e) => e.kind));
  return kindsFor(junior).filter((k) => !shown.has(k.id) && (round > 0 || k.start)).map((k) => k.id);
}
// A helper's choice for a later round (used by tests and by the browser run): the missed kinds first.
export function fillGaps(test, examples, junior) {
  const shown = new Set(examples.map((e) => e.kind));
  return [...new Set(test.results.filter((r) => !r.ok).map((r) => r.kind))].filter((id) => !shown.has(id)).slice(0, ROOM(junior));
}

// ---------- progress kept between visits (through the loader). Only ids and numbers: nothing typed.
export const STAGES = ['teach', 'test', 'review', 'result', 'street'];
export function cleanSaved(s, junior) {
  if (!s || typeof s !== 'object' || s.v !== 1 || !!s.j !== !!junior || !Number.isFinite(s.seed)) return null;
  const ok = new Set(kindsFor(junior).map((k) => k.id)); const seen = new Set();
  const rounds = (Array.isArray(s.rounds) ? s.rounds : []).slice(0, MAX_TESTS).map((r) => (Array.isArray(r) ? r : []).filter((id) => ok.has(id) && !seen.has(id) && seen.add(id)));
  if (!rounds.length) rounds.push([]);
  let tests = Math.max(0, Math.min(Number.isInteger(s.tests) ? s.tests : 0, rounds.length, MAX_TESTS)); let stage = STAGES.includes(s.stage) ? s.stage : 'teach';
  if (!readyToTest(examplesOf([rounds[0]]), 0, rounds[0].length, junior)) { rounds.length = 1; tests = 0; stage = 'teach'; } // no test can have run yet
  const ready = () => readyToTest(examplesOf(rounds), rounds.length - 1, rounds[rounds.length - 1].length, junior);
  if (['review', 'result', 'street'].includes(stage) && !(tests >= 1 && tests === rounds.length)) stage = 'teach';
  if (stage === 'test' && !(rounds.length === tests + 1 && ready())) stage = 'teach';
  if (stage === 'teach') { // the round being filled is the one after the last finished test
    if (rounds.length > tests + 1) tests = rounds.length - 1;
    if (rounds.length === tests) { if (tests >= MAX_TESTS) stage = 'result'; else rounds.push([]); }
  }
  return { v: 1, j: !!junior, seed: s.seed >>> 0, rounds, tests, stage };
}
export const examplesOf = (rounds, upTo = rounds.length) => rounds.slice(0, upTo).flat().map((id) => ({ kind: id, bin: kind(id).bin }));
