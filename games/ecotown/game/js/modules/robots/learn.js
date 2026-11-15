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

// Every kind of thing. Each has one role, and the roles never mix, so what the game says about them stays true:
//   start   on the bench from the beginning (the first examples a child may show)
//   more    offered on the shelf in later rounds: relatives of the test things, never the test things themselves
//   test    the test tray. Never offered as an example, so the tray is unseen in every test, however often it is run
//   street  what the robot meets in the town at the end. In neither the tray nor the examples: truly new
// hard: always in the tray. senior: ages 13–17 only. pic: which drawing it uses (pictures.js), in its own colour.
const K = (id, name, bin, role, colour, shape, feel, o = {}) => ({ id, name, bin, role, pic: o.pic || id, f: { colour, shape, feel, state: o.state || 'good' }, ...(o.hard ? { hard: 1 } : {}), ...(o.senior ? { senior: 1 } : {}) });
const SR = { senior: 1, state: 'broken' };
export const KINDS = [
  // paper and card
  K('newspaper', 'newspaper', 'paper', 'start', 'white', 'flat', 'papery'),
  K('cardbox', 'cardboard box', 'paper', 'start', 'brown', 'box', 'papery'),
  K('comic', 'comic', 'paper', 'test', 'red', 'flat', 'papery'),
  K('paperbag', 'paper bag', 'paper', 'test', 'white', 'bag', 'papery'),
  K('paperball', 'paper ball', 'paper', 'test', 'white', 'ball', 'papery'),
  K('eggbox', 'green egg box', 'paper', 'test', 'green', 'box', 'bumpy', { hard: 1 }),
  K('greyeggbox', 'grey egg box', 'paper', 'more', 'grey', 'box', 'bumpy', { pic: 'eggbox' }),
  K('magazine', 'magazine', 'paper', 'more', 'blue', 'flat', 'papery', { pic: 'comic' }),
  K('envelope', 'brown envelope', 'paper', 'more', 'brown', 'flat', 'papery'),
  K('card', 'birthday card', 'paper', 'street', 'pink', 'flat', 'papery'),
  K('cerealbox', 'cereal box', 'paper', 'street', 'yellow', 'box', 'papery'),
  K('whiteeggbox', 'white egg box', 'paper', 'street', 'white', 'box', 'bumpy', { pic: 'eggbox' }),
  // glass
  K('clearjar', 'clear jar', 'glass', 'start', 'clear', 'jar', 'see-through', { pic: 'jar' }),
  K('clearbottle', 'clear bottle', 'glass', 'start', 'clear', 'bottle', 'see-through', { pic: 'bottle' }),
  K('greenbottle', 'green bottle', 'glass', 'test', 'green', 'bottle', 'see-through', { pic: 'bottle' }),
  K('bluejar', 'blue jar', 'glass', 'test', 'blue', 'jar', 'see-through', { pic: 'jar' }),
  K('brownjar', 'brown jar', 'glass', 'test', 'brown', 'jar', 'see-through', { pic: 'jar' }),
  K('brownbottle', 'brown bottle', 'glass', 'more', 'brown', 'bottle', 'see-through', { pic: 'bottle' }),
  K('greenjar', 'green jar', 'glass', 'more', 'green', 'jar', 'see-through', { pic: 'jar' }),
  K('bluebottle', 'blue bottle', 'glass', 'street', 'blue', 'bottle', 'see-through', { pic: 'bottle' }),
  K('glass', 'drinking glass', 'glass', 'street', 'clear', 'cup', 'see-through'),
  K('pinkjar', 'pink jar', 'glass', 'street', 'pink', 'jar', 'see-through', { pic: 'jar' }),
  // food scraps
  K('banana', 'banana skin', 'food', 'start', 'yellow', 'peel', 'squashy'),
  K('lettuce', 'lettuce leaf', 'food', 'start', 'green', 'leaf', 'squashy'),
  K('applecore', 'apple core', 'food', 'test', 'red', 'core', 'squashy'),
  K('orangepeel', 'orange peel', 'food', 'test', 'orange', 'peel', 'squashy'),
  K('eggshell', 'eggshell', 'food', 'test', 'white', 'shell', 'hard', { hard: 1 }),
  K('teabag', 'teabag', 'food', 'test', 'brown', 'bag', 'soggy', { hard: 1 }),
  K('browneggshell', 'brown eggshell', 'food', 'more', 'brown', 'shell', 'hard', { pic: 'eggshell' }),
  K('herbalteabag', 'herbal teabag', 'food', 'more', 'green', 'bag', 'soggy', { pic: 'teabag' }),
  K('melonrind', 'melon rind', 'food', 'more', 'green', 'peel', 'squashy', { pic: 'orangepeel' }),
  K('cabbage', 'cabbage leaf', 'food', 'more', 'red', 'leaf', 'squashy', { pic: 'lettuce' }),
  K('blueeggshell', 'blue eggshell', 'food', 'street', 'blue', 'shell', 'hard', { pic: 'eggshell' }),
  K('fruitteabag', 'fruit teabag', 'food', 'street', 'red', 'bag', 'soggy', { pic: 'teabag' }),
  K('pearcore', 'pear core', 'food', 'street', 'green', 'core', 'squashy', { pic: 'applecore' }),
  K('potatopeel', 'potato peel', 'food', 'street', 'brown', 'peel', 'squashy', { pic: 'orangepeel' }),
  // ages 13–17: condition counts, and broken things go to the repair café
  K('pizzabox', 'greasy pizza box', 'food', 'test', 'white', 'box', 'papery', { hard: 1, senior: 1, state: 'greasy' }),
  K('burgerbox', 'greasy burger box', 'food', 'more', 'red', 'box', 'papery', { senior: 1, state: 'greasy', pic: 'pizzabox' }),
  K('chiptray', 'greasy chip tray', 'food', 'street', 'brown', 'tray', 'papery', { senior: 1, state: 'greasy' }),
  K('toaster', 'broken toaster', 'repair', 'start', 'silver', 'box', 'hard', SR),
  K('teddy', 'torn teddy', 'repair', 'start', 'brown', 'toy', 'soft', SR),
  K('radio', 'broken radio', 'repair', 'test', 'red', 'box', 'hard', SR),
  K('lamp', 'broken lamp', 'repair', 'test', 'yellow', 'lamp', 'hard', SR),
  K('tornbook', 'torn book', 'repair', 'test', 'blue', 'flat', 'papery', { ...SR, hard: 1 }),
  K('tornmap', 'torn map', 'repair', 'more', 'green', 'flat', 'papery', SR),
  K('kettle', 'broken kettle', 'repair', 'more', 'silver', 'kettle', 'hard', SR),
  K('jeans', 'ripped jeans', 'repair', 'more', 'blue', 'clothes', 'soft', SR),
  K('clock', 'broken clock', 'repair', 'street', 'white', 'clock', 'hard', SR),
  K('umbrella', 'torn umbrella', 'repair', 'street', 'red', 'umbrella', 'soft', SR),
  K('tornposter', 'torn poster', 'repair', 'street', 'yellow', 'flat', 'papery', { ...SR, pic: 'tornmap' }),
];
const BY_ID = new Map(KINDS.map((k) => [k.id, k]));
export const kind = (id) => BY_ID.get(id) || null;
export const kindsFor = (junior) => KINDS.filter((k) => !junior || !k.senior);
const role = (junior, r) => kindsFor(junior).filter((k) => k.role === r);
export const starters = (junior) => role(junior, 'start').map((k) => k.id);
export const mores = (junior) => role(junior, 'more').map((k) => k.id);
export const testPool = (junior) => role(junior, 'test').map((k) => k.id);
export const streetPool = (junior) => role(junior, 'street').map((k) => k.id);
export const canBeExample = (id, junior) => { const k = kind(id); return !!k && (!junior || !k.senior) && (k.role === 'start' || k.role === 'more'); };
export const TRAY_SIZE = (junior) => (junior ? 8 : 10);
export const STREET_SIZE = (junior) => (junior ? 5 : 6);
export const ROOM = (junior) => (junior ? 4 : 5); // how many more examples fit on the bench in each later round
export const MAX_TESTS = 4;

// ---------- a small seeded generator, so a tray is the same every time for the same seed
export function rng(seed) { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function seedFrom(text) { let h = 2166136261; for (const c of String(text)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function shuffle(list, r) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// a draw from one pool: the hard kinds, then at least `each` for every bin, then filled up to size
function draw(pool, junior, size, each, r) {
  const out = pool.filter((k) => k.hard).map((k) => k.id); const rest = shuffle(pool.filter((k) => !k.hard), r);
  const count = (b) => out.filter((id) => kind(id).bin === b).length;
  for (const b of binsFor(junior)) for (const k of rest) { if (count(b.id) >= each) break; if (k.bin === b.id && !out.includes(k.id)) out.push(k.id); }
  for (const k of rest) { if (out.length >= size) break; if (!out.includes(k.id)) out.push(k.id); }
  return shuffle(out.slice(0, size), r);
}
// The test tray: only "test" kinds, which are never offered as examples. The hard kinds, and at least two for each bin.
export const makeTray = (seed, junior) => draw(role(junior, 'test'), junior, TRAY_SIZE(junior), 2, rng(seed));
// The things the robot meets in the street afterwards: only "street" kinds, at least one for each bin.
export const makeStreet = (seed, junior) => draw(role(junior, 'street'), junior, STREET_SIZE(junior), 1, rng((seed ^ 0x5bd1e995) >>> 0));

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

// ---------- why a thing was not sorted right, worked out from the classifier itself (never from a fixed list)
// what is on the shelf to choose from in a round (round 0: the first examples; later: those not yet shown, and the "more" kinds)
export function shelf(examples, round, junior) {
  const shown = new Set(examples.map((e) => e.kind));
  return kindsFor(junior).filter((k) => !shown.has(k.id) && (k.role === 'start' || (round > 0 && k.role === 'more'))).map((k) => k.id);
}
// explain(id, examples, feats, onShelf) for a thing the robot did not put in its own bin:
//   bin      the bin it belongs in
//   mine     the closest example it was shown for that bin: { kind, same, n } (same may be empty), or null when it was shown none
//   helpers  the things on the shelf that would, shown by themselves, make the robot sort this thing right:
//            [{ kind, same, n }], the closest first. Empty when no single thing on the shelf settles it.
export function explain(id, examples, feats, onShelf = []) {
  const item = kind(id); const bin = item.bin; let mine = null;
  for (const e of examples) { if (e.bin !== bin) continue; const s = alike(item, kind(e.kind), feats); if (!mine || s.n > mine.n) mine = { kind: e.kind, same: s.same, n: s.n }; }
  const helpers = [];
  for (const h of onShelf) { const k = kind(h); if (!k || k.bin !== bin || examples.some((e) => e.kind === h)) continue;
    if (classify(id, [...examples, { kind: h, bin }], feats).bin === bin) { const s = alike(item, k, feats); helpers.push({ kind: h, same: s.same, n: s.n }); } }
  helpers.sort((a, b) => b.n - a.n);
  return { bin, mine, helpers };
}
// The shelf things worth a star after a test: each would, by itself, turn at least one missed thing right. Best first.
export function starsFor(test, examples, feats, junior) {
  const on = shelf(examples, 1, junior); const score = new Map();
  for (const r of test.results) if (!r.ok) for (const h of explain(r.kind, examples, feats, on).helpers) score.set(h.kind, (score.get(h.kind) || 0) + 1 + h.n / 10);
  return [...score].sort((a, b) => b[1] - a[1] || on.indexOf(a[0]) - on.indexOf(b[0])).map(([k]) => k);
}
// Which bin went where: rows are the right bin, columns where the robot put it ('ask' when it asked). For ages 13–17.
export function confusion(test, junior) {
  const cols = [...binsFor(junior).map((b) => b.id), 'ask']; const rows = binsFor(junior).map((b) => ({ bin: b.id, cells: cols.map(() => 0) }));
  for (const r of test.results) { const row = rows.find((x) => x.bin === r.truth); if (row) row.cells[cols.indexOf(r.got === null ? 'ask' : r.got)]++; }
  return { cols, rows };
}
// The features the robot looks at once some are switched off (ages 13–17). At least one always stays on.
export function featsOn(junior, off = []) { const all = featuresFor(junior); const on = all.filter((f) => !off.includes(f)); return on.length ? on : all; }
export const cleanOff = (off, junior) => { if (junior || !Array.isArray(off)) return []; const all = featuresFor(false); const out = all.filter((f) => off.includes(f)); return out.length < all.length ? out : []; };

// ---------- the bench rules
// May this thing be added as an example now? (examples: all shown so far; added: how many in this round; round 0 is the first)
export function canShow(id, bin, examples, round, added, junior) {
  const k = kind(id); if (!canBeExample(id, junior)) return { ok: false, why: 'unknown' };
  if (examples.some((e) => e.kind === id)) return { ok: false, why: 'shown' };
  if (round === 0 && k.role !== 'start') return { ok: false, why: 'later' };
  if (round > 0 && added >= ROOM(junior)) return { ok: false, why: 'full' };
  if (k.bin !== bin) return { ok: false, why: 'bin', right: k.bin };
  return { ok: true };
}
// The first round can be tested once every bin has an example. Later rounds need at least one more example.
export function readyToTest(examples, round, added, junior) {
  return round === 0 ? binsFor(junior).every((b) => examples.some((e) => e.bin === b.id)) : added > 0;
}
// A helper's choice for a later round (used by tests and by the browser run): the starred things, as many as fit.
export function fillGaps(test, examples, junior, feats = featuresFor(junior)) {
  const out = []; let ex = [...examples];
  while (out.length < ROOM(junior)) { // one at a time: a star earned by a thing already fixed is not needed twice
    const t = runTest(test.results.map((r) => r.kind), ex, feats); const next = starsFor(t, ex, feats, junior)[0]; if (!next) break;
    out.push(next); ex = [...ex, { kind: next, bin: kind(next).bin }];
  }
  return out;
}

// ---------- progress kept between visits (through the loader). Only ids and numbers: nothing typed.
export const STAGES = ['teach', 'test', 'review', 'result', 'street'];
export function cleanSaved(s, junior) {
  if (!s || typeof s !== 'object' || s.v !== 2 || !!s.j !== !!junior || !Number.isFinite(s.seed)) return null;
  const seen = new Set();
  const rounds = (Array.isArray(s.rounds) ? s.rounds : []).slice(0, MAX_TESTS).map((r, i) => (Array.isArray(r) ? r : []).filter((id) => canBeExample(id, junior) && (i > 0 || kind(id).role === 'start') && !seen.has(id) && seen.add(id)).slice(0, i ? ROOM(junior) : 99));
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
  return { v: 2, j: !!junior, seed: s.seed >>> 0, rounds, tests, stage, off: cleanOff(s.off, junior) };
}
export const examplesOf = (rounds, upTo = rounds.length) => rounds.slice(0, upTo).flat().map((id) => ({ kind: id, bin: kind(id).bin }));
