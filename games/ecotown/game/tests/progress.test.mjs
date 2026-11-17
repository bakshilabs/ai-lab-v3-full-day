// Free building: unlock tiers, town goals, Florence's tips (cooldown, no repeats), and the AI Lab's
// practice island (every mission's vague instruction still shows its mistake there; the clear one passes).
// node --test tests/progress.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadPlotter } from '../js/ai/model.js';
import { setModelForTests, ask } from '../js/ai/plotter.js';
import { makeTerrain } from '../js/world/terrain.js';
import { simulate } from '../js/sim/sim.js';
import { accessCheck } from '../js/sim/access.js';
import { LEVELS, LEVEL_ORDER } from '../js/game/levels.js';
import { LEVEL_TEXT, SANDBOX } from '../js/game/content.js';
import { ITEMS } from '../js/world/catalog.js';
import { TIERS, unlocked, newlyUnlocked, missionReady, nextMission, townGoals, townComplete, SANDBOX_TOWN_CAP, nextUnlock } from '../js/game/progress.js';
import { RULES, newAdvisor, nextTip, tipText, COOLDOWN } from '../js/game/advisor.js';
import { seedTo, florenceStart, florenceTownFor, CLEAR } from '../js/game/seed.js';
import { plan, applyPlacements } from '../js/sim/planner.js';

setModelForTests(await loadPlotter({ json: JSON.parse(readFileSync(new URL('../models/plotter.json', import.meta.url), 'utf8')), bin: readFileSync(new URL('../models/plotter.bin', import.meta.url)) }));
const terrain = makeTerrain();
const ctxFor = (cells, id) => ({ moveTiles: [...cells.values()].filter((c) => c.item && ITEMS[c.item].level === 'move').length, hasSchool: [...cells.values()].some((c) => c.item === 'school'), access: id === 'move' ? accessCheck(terrain, cells) : null });
const tiles = [...terrain.tiles.values()];
const mark = (cells, n, zones = ['field', 'slope', 'coast']) => { let i = 0; for (const t of tiles) if (i < n && zones.includes(t.zone) && !t.fixed && !cells.get(t.k)) { cells.set(t.k, { mark: 'town', item: null, mods: [], locked: false }); i++; } return cells; };

// Florence first, then your own town (docs/ecotown-florence-first.md)
test('nothing is open in the player’s town until Florence’s mission for it is done', () => {
  assert.deepEqual(unlocked({}), [], 'a new town: every build tab waits for its mission');
  assert.deepEqual(unlocked({ land: { stars: 2 } }), ['land']);
  assert.deepEqual(newlyUnlocked(unlocked({ land: {} }), unlocked({ land: {}, move: {} })), ['move']);
  assert.equal(unlocked({}, [], true).length, TIERS.length, 'sandbox=full opens everything');
  assert.ok(unlocked({}, ['food']).includes('food'), 'a tab a saved town had opened stays open');
  assert.ok(SANDBOX_TOWN_CAP > 18);
});

test('a level’s own-town builds stay locked until its mission is done, however much the town grows', () => {
  // a big town (36 families, fed) with only the first two missions done: homes, food, power and the town heart stay shut
  const cells = mark(new Map(), 10); let n = 0; for (const [, c] of cells) if (n++ < 9) c.item = 'timber';
  for (const t of tiles) if (t.zone === 'field' && !t.fixed && !cells.get(t.k) && n < 24) { cells.set(t.k, { mark: null, item: 'mixed', mods: [], locked: false }); n++; }
  const s = simulate(terrain, cells); assert.ok(s.families >= 36 && s.food >= s.foodNeed);
  const labs = { land: { stars: 1 }, move: { stars: 1 } };
  assert.deepEqual(unlocked(labs), ['land', 'move']);
  for (const id of ['food', 'power', 'heart']) assert.equal(missionReady(id, labs, s, ctxFor(cells)), false, `${id} mission waits for the homes mission`);
  assert.equal(missionReady('homes', labs, s, { moveTiles: 0 }), false, 'the homes mission waits for two paths in the player’s town');
  assert.equal(missionReady('homes', labs, s, { moveTiles: 2 }), true);
  assert.ok(!unlocked(labs).includes('homes'), 'and homes open only after it');
  assert.ok(unlocked({ ...labs, homes: { stars: 3 } }).includes('homes'));
});

test('the missions go in order, each after a small step in the player’s own town', () => {
  const empty = simulate(terrain, new Map());
  assert.equal(nextMission({}), 'land'); assert.ok(missionReady('land', {}, empty, {}), 'the first mission is ready at once');
  assert.ok(!missionReady('move', {}, empty, {}), 'not before the first');
  const labs = { land: { stars: 1 } };
  const nu = nextUnlock(empty, labs, {}); assert.equal(nu.id, 'move'); assert.equal(nu.ready, false); assert.equal(nu.need, 6);
  const six = simulate(terrain, mark(new Map(), 6)); assert.ok(missionReady('move', labs, six, {}) && nextUnlock(six, labs, {}).ready);
  assert.equal(nextUnlock(six, Object.fromEntries(LEVEL_ORDER.map((l) => [l, {}])), {}), null, 'all six done: no next mission');
  assert.ok(missionReady('land', Object.fromEntries(LEVEL_ORDER.map((l) => [l, {}])), empty, {}), 'a finished mission can be replayed');
});

test('Florence’s town: each mission starts from what she built; a replay is practice; an old save gets her clear plans', () => {
  const after = (id, cells) => applyPlacements(cells, plan(id, CLEAR[id], { terrain, cells, numbers: { minutes: 10 } }).placements);
  let town = new Map();
  for (const id of LEVEL_ORDER) {
    const st = florenceStart(terrain, id, town, { first: true });
    if (town.size) assert.equal(st.from, 'town', `${id}: she builds on her own town`);
    for (const [k, c] of town) assert.equal(st.cells.get(k)?.item || null, c.item || null, `${id}: her town is kept (${k})`);
    town = after(id, st.cells);
  }
  assert.equal(florenceStart(terrain, 'homes', town, { first: false }).from, 'practice', 'a replay runs on her tidy practice town');
  // a town that cannot pass a mission (all her land on the flood meadow, say) falls back to her practice town
  const wet = new Map(tiles.filter((t) => t.zone === 'meadow').map((t) => [t.k, { mark: 'town', item: null, mods: [], locked: true }]));
  assert.equal(florenceStart(terrain, 'homes', wet, { first: true }).from, 'practice');
  assert.equal(florenceTownFor(terrain, {}).size, 0, 'no missions done: her town is empty');
  assert.deepEqual([...florenceTownFor(terrain, { land: {}, move: {} })].map(([k]) => k).sort(), [...seedTo(terrain, 'homes')].map(([k]) => k).sort(), 'two done: her land and paths');
  assert.deepEqual([...florenceTownFor(terrain, { land: {}, homes: {} })].map(([k]) => k).sort(), [...seedTo(terrain, 'move')].map(([k]) => k).sort(), 'only the unbroken run from the first mission');
});

test('the six clear plans, plus a hall and a market on two more tiles of town land, make a complete town', () => {
  let cells = new Map();
  for (const id of LEVEL_ORDER) cells = ask(id, LEVEL_TEXT[id].cards[1][0], { terrain, cells }).after;
  assert.ok(!townComplete(simulate(terrain, cells), ctxFor(cells)), 'the missions alone leave something for the player to build');
  const town = [...cells].filter(([, c]) => c.mark === 'town').map(([k]) => terrain.tiles.get(k));
  const near = (t) => Math.min(...town.map((u) => Math.abs(u.gx - t.gx) + Math.abs(u.gz - t.gz)));
  const spare = tiles.filter((t) => ['field', 'slope'].includes(t.zone) && !t.fixed && !cells.get(t.k)?.mark && !cells.get(t.k)?.item).sort((a, b) => near(a) - near(b)).slice(0, 2);
  assert.equal(spare.length, 2);
  cells.set(spare[0].k, { mark: 'town', item: 'hall', mods: [], locked: false }); cells.set(spare[1].k, { mark: 'town', item: 'market', mods: [], locked: false });
  const s = simulate(terrain, cells); const goals = townGoals(s, ctxFor(cells));
  assert.ok(townComplete(s, ctxFor(cells)), JSON.stringify(goals.filter((g) => !g.ok)));
});

test('every town goal and tip has words in both versions', () => {
  const s = simulate(terrain, mark(new Map(), 8));
  for (const band of ['junior', 'senior']) {
    for (const g of townGoals(s, ctxFor(new Map()))) assert.ok(SANDBOX[band].goal[g.id](s).length > 3, `${band} ${g.id}`);
    for (const r of RULES) assert.ok(tipText(r, { ...s, species: { bees: false, deer: true }, power: { winterSupply: 1, demand: 2 } }, band === 'junior').length > 10, `${band} ${r.id}`);
    for (const t of TIERS) assert.ok(SANDBOX[band].unlockTip[t.id], `${band} unlock advice ${t.id}`);
    for (const t of TIERS.slice(1)) assert.ok(t.need[band === 'junior' ? 'j' : 's'] && SANDBOX[band].invite[t.id] && SANDBOX[band].nextStep.florence(t.id), `${band} ${t.id}`);
  }
});

test('Florence’s tips: first one straight away, then a cooldown, and never the same one twice in a row', () => {
  const st = newAdvisor(); const ctx = { open: ['land', 'move'], hasSchool: false };
  const empty = simulate(terrain, new Map());
  assert.equal(nextTip(st, empty, ctx, 0).id, 'start');
  assert.equal(nextTip(st, empty, ctx, COOLDOWN * 2), null, 'shown once, not repeated while still true');
  // floodplain town land: a new problem, but the cooldown holds it back
  const wet = mark(new Map(), 6, ['meadow']); const sw = simulate(terrain, wet);
  assert.ok(sw.townFlooded >= 2);
  const st2 = newAdvisor(); nextTip(st2, empty, ctx, 0);
  assert.equal(nextTip(st2, sw, ctx, 1000), null, 'cooldown');
  const r = nextTip(st2, sw, ctx, 1000 + COOLDOWN); assert.equal(r.id, 'flood'); assert.equal(r.lab, 'land');
  // solved, then back: it may come back
  nextTip(st2, simulate(terrain, new Map()), ctx, 1000 + COOLDOWN * 2);
  assert.equal(nextTip(st2, sw, ctx, 1000 + COOLDOWN * 4)?.id, 'flood');
});

for (const id of LEVEL_ORDER) test(`AI Lab practice island, ${id}: the vague card shows a mistake and the clear card passes`, () => {
  const base = seedTo(terrain, id); const L = LEVEL_TEXT[id]; const lv = LEVELS[id];
  const v = ask(id, L.cards[0][0], { terrain, cells: base }); const sv = simulate(terrain, v.after); const cv = ctxFor(v.after, id);
  assert.ok(Object.keys(lv.reveal(sv, simulate(terrain, base), cv)).length > 0 || !lv.pass(sv, cv), 'vague plan is flawed');
  const c = ask(id, L.cards[1][0], { terrain, cells: base }); const sc = simulate(terrain, c.after); const cc = ctxFor(c.after, id);
  assert.ok(lv.pass(sc, cc), 'clear plan passes');
  assert.equal(Object.keys(lv.reveal(sc, simulate(terrain, base), cc)).length, 0, 'clear plan shows no problem');
});

test('every build has a picture for its button, and the AI Lab building has one', async () => {
  const { existsSync } = await import('node:fs');
  for (const id of [...Object.keys(ITEMS), 'ailab']) assert.ok(existsSync(new URL(`../img/thumbs/${id}.png`, import.meta.url)), `img/thumbs/${id}.png`);
  assert.ok(existsSync(new URL('../img/florence.png', import.meta.url)));
});

test('Florence’s intro has every line in both versions', () => {
  const beats = ['tag', 'next', 'skip', 'hello', 'towns', 'how', 'lab', 'overToYou', 'go'];
  for (const band of ['junior', 'senior']) for (const b of beats) assert.ok(SANDBOX[band].intro[b]?.length > 1, `${band} intro.${b}`);
});

test('the island has an AI Lab building on a tile no mission plan uses', () => {
  assert.ok(terrain.lab && terrain.tiles.get(terrain.lab).fixed === 'ailab');
  let cells = new Map(); for (const id of LEVEL_ORDER) { cells = ask(id, LEVEL_TEXT[id].cards[1][0], { terrain, cells }).after; assert.ok(!cells.get(terrain.lab)?.item && !cells.get(terrain.lab)?.mark, id); }
});

test('build videos, when recorded, have a poster and a caption timeline', async () => {
  const fs = await import('node:fs'); const dir = new URL('../videos/', import.meta.url);
  if (!fs.existsSync(dir)) return;
  const idx = JSON.parse(fs.readFileSync(new URL('index.json', dir), 'utf8'));
  for (const id of idx.items) {
    assert.ok(ITEMS[id], `video for a real item: ${id}`);
    for (const ext of ['mp4', 'jpg', 'json']) assert.ok(fs.existsSync(new URL(`${id}.${ext}`, dir)), `${id}.${ext}`);
    const tl = JSON.parse(fs.readFileSync(new URL(`${id}.json`, dir), 'utf8')); assert.ok(tl.stages.length >= 1 && tl.stages.every((s) => s.text.j && s.text.s), `${id} captions`);
  }
});

// a lazy instruction that names the goal but not the thing that matters must not pass clean (a reviewer got 3 stars
// for "grow enough food for everyone")
for (const [id, text] of [['food', 'grow enough food for everyone'], ['heart', 'put the school on top of the mountain']]) test(`AI Lab ${id}: a lazy instruction shows a mistake`, () => {
  const base = seedTo(terrain, id); const lv = LEVELS[id];
  const v = ask(id, text, { terrain, cells: base }); const sv = simulate(terrain, v.after); const cv = ctxFor(v.after, id);
  assert.ok(Object.keys(lv.reveal(sv, simulate(terrain, base), cv)).length > 0 || !lv.pass(sv, cv), `"${text}" is flawed`);
});

test('each "your turn" step is small and has words, a progress count and a build for the hint', () => {
  for (const t of TIERS.slice(1)) { assert.ok(t.tool && t.goal, t.id); const [have, need] = t.progress(simulate(terrain, new Map()), { moveTiles: 0 }); assert.ok(have < need && need <= 12, `${t.id} ${have}/${need}`); }
  const fedTown = mark(new Map(), 4); let n = 0; for (const [, c] of fedTown) if (n++ < 3) c.item = 'timber';
  const s = simulate(terrain, fedTown); const nu = nextUnlock(s, { land: {}, move: {}, homes: {}, food: {} }, {});
  assert.equal(nu.id, 'power'); assert.equal(nu.ready, false, 'not fed yet, or too few families');
});
