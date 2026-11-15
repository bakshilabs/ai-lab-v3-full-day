// Drone delivery (js/modules/drone): the places, the instructions, what happens when the drone flies them, the words,
// the record and the route kept in the town. All pure: no page and no 3D.
import test from 'node:test'; import assert from 'node:assert/strict';
import * as TER from '../js/world/terrain.js';
import { cleanResult, cleanState, cleanTown } from '../js/modules/contract.js';
import * as G from '../js/modules/drone/geo.js';
import { pickPlaces, candidates, placesKey, cleanProgram, addStep, removeStep, bumpStep, stepText, fly, corners, verdict, fewestTiles, compareLines, AUTOMATE,
  practisedLines, programLines, makeRecord, townData, routeStillThere, restore, cleanHand, MAX_STEPS } from '../js/modules/drone/route.js';
import { mapSvg } from '../js/modules/drone/picture.js';
import drone from '../js/modules/drone/index.js';

const terrain = TER.makeTerrain('home'); const tiles = [...terrain.tiles.values()]; const keys = new Set(tiles.map((t) => t.k));
const cell = (item, mark = 'town') => ({ mark, item, mods: [] });
const up = { op: 'up' }, drop = { op: 'drop' }; const go = (dir, n) => ({ op: 'go', dir, n });
// a route of single-axis moves between two tiles that stays on the island (breadth-first over the tiles)
function routeSteps(from, to) {
  const prev = new Map([[G.key(from.gx, from.gz), null]]); const q = [from];
  while (q.length) { const c = q.shift(); if (c.gx === to.gx && c.gz === to.gz) break; for (const d of G.DIR_IDS) { const n = { gx: c.gx + G.DIRS[d].dx, gz: c.gz + G.DIRS[d].dz, d, p: c }; const k = G.key(n.gx, n.gz); if (keys.has(k) && !prev.has(k)) { prev.set(k, n); q.push(n); } } }
  const dirs = []; let n = prev.get(G.key(to.gx, to.gz)); while (n) { dirs.unshift(n.d); n = prev.get(G.key(n.p.gx, n.p.gz)); }
  let prog = []; for (const d of dirs) prog = addStep(prog, go(d, 1)); return prog;
}

test('the module\'s grid is the game\'s grid', () => {
  assert.deepEqual([G.T, G.X0, G.Z0, G.GW, G.GH], [TER.T, TER.X0, TER.Z0, TER.GW, TER.GH]);
  assert.deepEqual(G.tileXZ(9, 8), TER.tileCenter(9, 8)); assert.equal(G.key(3, 4), TER.key(3, 4));
  const [gx, gz] = G.toGrid(...G.tileXZ(5, 7)); assert.deepEqual([gx, gz], [5, 7]);
  for (const t of tiles) { const [x, z] = G.tileXZ(t.gx, t.gz); assert.ok(Math.hypot(x / (G.SAFE_RX + 6), z / (G.SAFE_RZ + 6)) <= 1.02, `tile ${t.k} can be reached by hand`); }
});

test('words and angles', () => {
  assert.equal(G.offsetWords({ gx: 2, gz: 5 }, { gx: 3, gz: 3 }), '2 tiles north and 1 tile east');
  assert.equal(G.offsetWords({ gx: 5, gz: 5 }, { gx: 1, gz: 5 }), '4 tiles west'); assert.equal(G.offsetWords({ gx: 1, gz: 1 }, { gx: 1, gz: 1 }), '');
  assert.equal(G.arrowFor(0), '↑'); assert.equal(G.arrowFor(Math.PI / 2), '→'); assert.equal(G.arrowFor(-Math.PI / 2), '←'); assert.equal(G.arrowFor(Math.PI), '↓');
  assert.ok(Math.abs(G.bearing(0, 0, 0, -5)) < 1e-9, 'north is 0'); assert.ok(Math.abs(G.bearing(0, 0, 5, 0) - Math.PI / 2) < 1e-9, 'east is a quarter turn');
  assert.ok(Math.abs(G.turnTo(3, -3) - (2 * Math.PI - 6)) < 1e-9, 'the short way round');
  const [x, z] = G.pullInside(80, 0); assert.ok(Math.abs(x - G.SAFE_RX) < 1e-6 && z === 0); assert.deepEqual(G.pullInside(3, 4), [3, 4]);
  const [x2] = G.pullInside(80, 0, 0.5); assert.ok(x2 < 80 && x2 > G.SAFE_RX, 'a gentle pull, not a wall');
});

test('places: an empty town still has a delivery, from the AI Lab to another fixed place', () => {
  for (const layout of TER.ISLANDS) {
    const t = [...TER.makeTerrain(layout).tiles.values()];
    for (const junior of [true, false]) {
      const p = pickPlaces([], t, junior); assert.ok(p, layout); assert.equal(p.from.fixed, 'ailab'); assert.equal(p.drops.length, junior ? 1 : 2);
      const all = [p.from, ...p.drops]; assert.equal(new Set(all.map((x) => x.k)).size, all.length, 'different tiles');
      for (const d of p.drops) assert.ok(G.manhattan(p.from, d) >= 3, 'far enough to be a flight');
      assert.equal(new Set(p.drops.map((d) => d.label)).size, p.drops.length, 'different names');
    }
  }
  assert.equal(pickPlaces([], [], true), null);
  const bare = pickPlaces([], tiles.map(({ fixed, ...t }) => t), true); assert.ok(bare && bare.drops.length === 1, 'even with no buildings at all');
});

test('places: the child\'s own town comes first', () => {
  const cells = [['6,3', cell('market')], ['11,6', cell('timber')], ['7,3', cell('straw')], ['12,3', cell('school')], ['4,4', cell(null)], ['8,6', cell('road')]];
  const j = pickPlaces(cells, tiles, true);
  assert.equal(j.from.item, 'market'); assert.equal(j.from.label, 'the market square'); assert.equal(j.drops[0].item, 'timber', 'the far home, not the one next door');
  const s = pickPlaces(cells, tiles, false); assert.equal(s.drops.length, 2); assert.equal(s.drops[1].item, 'school');
  assert.ok(!candidates(cells, tiles).some((c) => c.item === 'road'), 'a road is not a place');
  assert.notEqual(placesKey(j), placesKey(s)); assert.deepEqual(pickPlaces(cells, tiles, true), j, 'the same town gives the same delivery');
  // two homes of the same kind get different names
  const twins = pickPlaces([['11,2', cell('timber')], ['4,3', cell('timber')]], tiles, false);
  assert.equal(new Set(twins.drops.map((d) => d.label)).size, 2);
});

test('places: a start with a flight worth planning is preferred to a market next door', () => {
  const near = pickPlaces([['8,5', cell('market')], ['6,3', cell('timber')]], tiles, true);
  assert.equal(near.from.fixed, 'ailab'); assert.equal(near.drops[0].item, 'timber'); assert.ok(G.manhattan(near.from, near.drops[0]) >= 6);
  const far = pickPlaces([['8,5', cell('market')], ['3,2', cell('timber')]], tiles, true); assert.equal(far.from.item, 'market');
});

test('instructions: tiles add, grow, shrink and stay within limits', () => {
  let p = addStep([], up); p = addStep(p, go('e', 1)); p = addStep(p, go('e', 1)); p = addStep(p, go('n', 1)); p = addStep(p, drop);
  assert.deepEqual(p, [up, go('e', 2), go('n', 1), drop]);
  assert.deepEqual(p.map(stepText), ['Go up above the roofs', 'Fly east 2 tiles', 'Fly north 1 tile', 'Lower the parcel']);
  assert.equal(bumpStep(p, 1, 20)[1].n, 9); assert.equal(bumpStep(p, 1, -20)[1].n, 1); assert.deepEqual(bumpStep(p, 0, 1), p, 'only a flight has a length');
  assert.deepEqual(removeStep(p, 0), [go('e', 2), go('n', 1), drop]); assert.deepEqual(removeStep(p, 9), p);
  let long = []; for (let i = 0; i < 40; i++) long = addStep(long, i % 2 ? up : drop); assert.equal(long.length, MAX_STEPS);
  let east = []; for (let i = 0; i < 12; i++) east = addStep(east, go('e', 1)); assert.deepEqual(east, [go('e', 9), go('e', 3)], 'a long flight spills into a second step');
  assert.deepEqual(cleanProgram([up, { op: 'jump' }, go('x', 2), go('n', 0), go('n', 2.5), null, 'x', go('s', 3)]), [up, go('s', 3)]);
  assert.deepEqual(cleanProgram('nonsense'), []); assert.deepEqual(addStep(p, { op: 'explode' }), p);
});

const places = { from: { k: '10,9', gx: 10, gz: 9, label: 'the AI Lab', fixed: 'ailab' }, drops: [{ k: '6,6', gx: 6, gz: 6, label: 'the timber terrace', item: 'timber' }] };

test('flying: the drone does exactly what the steps say', () => {
  const good = fly([up, go('w', 4), go('n', 3), drop], places, keys);
  assert.equal(good.all, true); assert.equal(good.tiles, 7); assert.deepEqual(good.end, { gx: 6, gz: 6 }); assert.equal(good.path.length, 8); assert.equal(good.stop, null);
  assert.deepEqual(good.legs.map((l) => l.kind), ['up', 'go', 'go', 'drop']); assert.ok(good.secs > 4 && good.secs < 20);
  assert.equal(verdict(good, places).kind, 'delivered');
  assert.deepEqual(corners(good.path), [[10, 9], [6, 9], [6, 6]]);
  // its honest limits, each said in words that point at the next change
  const ground = fly([go('w', 4), up], places, keys); assert.deepEqual(ground.stop, { reason: 'ground', step: 0 }); assert.equal(ground.tiles, 0);
  assert.match(verdict(ground, places).text, /Step 1 says fly, but the drone is still on its landing pad/);
  const short = fly([up, go('w', 4), go('n', 1), drop], places, keys); assert.equal(short.all, false); assert.equal(short.misses.length, 1);
  assert.equal(verdict(short, places).kind, 'short'); assert.match(verdict(short, places).text, /The timber terrace is 2 tiles north of there/); assert.match(verdict(short, places).text, /nobody was waiting/);
  const nodrop = fly([up, go('w', 4), go('n', 3)], places, keys); assert.equal(verdict(nodrop, places).kind, 'nodrop'); assert.match(verdict(nodrop, places).text, /no step told it to lower the parcel/);
  const edge = fly([up, go('s', 9), go('w', 4)], places, keys); assert.equal(edge.stop.reason, 'edge'); assert.equal(edge.stop.step, 1); assert.ok(keys.has(G.key(edge.end.gx, edge.end.gz)), 'it stops on the island');
  assert.match(verdict(edge, places).text, /edge of the island on step 2/); assert.equal(edge.stepsRun, 1);
  assert.equal(verdict(fly([], places, keys), places).kind, 'empty');
  assert.equal(fly([up, up, go('w', 4), go('n', 3), drop, drop], places, keys).all, true, 'extra steps do no harm');
  assert.equal(fly([drop, up, go('w', 4), go('n', 3), drop], places, keys).all, true, 'lowering at the start delivers nothing');
  for (const r of [good, ground, short, nodrop, edge]) for (const w of ['wrong', 'fail', 'mistake', 'Wrong', 'Fail']) assert.ok(!verdict(r, places).text.includes(w), 'no marks, only what happened');
});

test('flying: two deliveries in either order', () => {
  const two = { from: places.from, drops: [places.drops[0], { k: '9,8', gx: 9, gz: 8, label: 'the old school', fixed: 'oldschool' }] };
  const a = fly([up, go('n', 1), go('w', 1), drop, go('w', 3), go('n', 2), drop], two, keys); assert.equal(a.all, true); assert.deepEqual(a.delivered, ['9,8', '6,6']);
  const half = fly([up, go('n', 1), go('w', 1), drop], two, keys); assert.equal(half.all, false);
  const v = verdict(half, two); assert.match(v.text, /One parcel arrived/); assert.match(v.text, /The timber terrace is 2 tiles north and 3 tiles west/);
  assert.equal(fly([up, go('n', 1), go('w', 1), drop, drop], two, keys).delivered.length, 1, 'one parcel for each place');
  assert.equal(fewestTiles(two), 2 + 5); assert.equal(fewestTiles(places), 7);
});

test('every delivery the module can choose can be flown from tiles within the step limit', () => {
  const towns = [[], [['6,3', cell('market')], ['11,6', cell('timber')], ['12,3', cell('school')]], [['0,5', cell('straw')], ['13,5', cell('hall')]], [['3,1', cell('earth')], ['1,7', cell('park')]]];
  for (const cells of towns) for (const junior of [true, false]) {
    const p = pickPlaces(cells, tiles, junior); let prog = [up]; let at = p.from;
    for (const d of p.drops) { for (const s of routeSteps(at, d)) prog = addStep(prog, s); prog = addStep(prog, drop); at = d; }
    const r = fly(prog, p, keys); assert.equal(r.all, true, JSON.stringify(p)); assert.ok(prog.length <= MAX_STEPS, `${prog.length} steps for ${JSON.stringify(p.drops.map((d) => d.k))}`);
  }
});

test('the comparison says what happened, with no marks', () => {
  const auto = fly([up, go('w', 4), go('n', 3), drop], places, keys);
  const longer = compareLines({ secs: 30, tiles: 11 }, auto, places, true);
  assert.equal(longer[0], 'By hand you flew 11 tiles in 30 seconds.'); assert.match(longer[1], /Following your 4 steps, the drone flew 7 tiles in \d+ seconds/); assert.equal(longer[2], 'The planned route was 4 tiles shorter.');
  assert.match(compareLines({ secs: 9, tiles: 6 }, auto, places, true)[2], /Your hand flight was 1 tile shorter/);
  assert.equal(compareLines({ secs: 9, tiles: 7 }, auto, places, true)[2], 'Both flights were the same length.');
  assert.ok(compareLines({ secs: 9, tiles: 7 }, auto, places, false).some((l) => /fewest tiles this route can take/.test(l)), 'ages 13-17 also see the shortest possible');
  assert.equal(compareLines(null, auto, places, true).length, 2, 'no hand flight to compare (a town that changed)');
  assert.equal(AUTOMATE.options.length, 2); for (const o of AUTOMATE.options) assert.ok(o.reply.length > 20 && !/wrong|correct|right answer/i.test(o.reply));
});

test('the record is built from what the child did and fits the contract', () => {
  const program = [up, go('w', 4), go('n', 3), drop]; const auto = fly(program, places, keys); const hand = cleanHand({ secs: 31.6, tiles: 9.2, trail: [[10, 9], [8.44, 7.51], [6, 6]] });
  assert.deepEqual(hand, { secs: 32, tiles: 9, trail: [[10, 9], [8.4, 7.5], [6, 6]] });
  const first = practisedLines({ hand: true, steps: 4, flights: 1, changed: false, chose: false }, places);
  assert.deepEqual(first, ['flying a parcel by hand from the AI Lab to the timber terrace', 'planning a route on a map and breaking it into 4 steps a drone can follow', 'comparing a hand-flown delivery with an automated one']);
  const more = practisedLines({ hand: true, steps: 6, flights: 3, changed: true, chose: true }, places);
  assert.equal(more.length, 4); assert.ok(more.includes('testing the steps, seeing where the drone stopped and changing them')); assert.match(more[3], /choosing what to automate/);
  assert.equal(practisedLines({ hand: false, steps: 4, flights: 1 }, places).length, 2, 'always at least two');
  for (const l of more) assert.ok(l.length <= 120 && !/learn|improv|better/.test(l), l);
  const picture = mapSvg({ tiles, cells: [['6,6', cell('timber')]], places, hand: hand.trail, route: auto.path, steps: program.map(stepText) });
  const rec = makeRecord({ places, program, hand, auto, did: { hand: true, steps: 4, flights: 2, changed: true, chose: true }, picture });
  const clean = cleanResult({ finished: true, record: rec, town: { kind: 'drone-route', data: townData(places, auto) } });
  assert.equal(clean.finished, true); assert.equal(clean.record.made.title, 'My drone route'); assert.equal(clean.record.made.picture, picture, 'the picture passes the contract\'s checks');
  assert.deepEqual(clean.record.made.lines, rec.made.lines, 'no line is cut'); assert.equal(rec.made.lines[0], 'From the AI Lab to the timber terrace');
  assert.equal(rec.made.lines[1], '1. Go up above the roofs; 2. Fly west 4 tiles; 3. Fly north 3 tiles; 4. Lower the parcel');
  assert.match(rec.made.lines[2], /^By hand: 9 tiles in 32 seconds\. The drone by itself: 7 tiles in \d+ seconds\.$/);
  // the longest possible set of steps still fits
  let long = []; for (let i = 0; i < MAX_STEPS; i++) long.push(i % 2 ? go('n', 9) : go('w', 9));
  const lines = programLines(long); assert.ok(lines.length <= 3 && lines.every((l) => l.length <= 120));
  const big = makeRecord({ places, program: long, hand, auto: fly(long, places, keys), did: { hand: true, steps: 12, flights: 9, changed: true, chose: true }, picture });
  assert.ok(big.made.lines.length <= 6 && big.made.lines.every((l) => l.length <= 120));
});

test('the map is one safe SVG', () => {
  const auto = fly([up, go('w', 4), go('n', 3), drop], places, keys);
  const svg = mapSvg({ tiles, cells: [['6,6', cell('timber')], ['5,5', cell(null)]], places: { from: places.from, drops: [{ ...places.drops[0], label: 'the <b> & "terrace"' }] }, plan: auto.path, end: { gx: 6, gz: 7 }, hand: [[10, 9], [6, 6]] });
  assert.match(svg, /^<svg[\s>]/); assert.match(svg, /<\/svg>$/); assert.doesNotMatch(svg, /<script|on\w+\s*=|javascript:/i); assert.ok(svg.length < 60000, `${svg.length} characters`);
  assert.ok(svg.includes('the &lt;b&gt; &amp; &quot;terrace&quot;')); assert.equal((svg.match(/<rect /g) || []).length >= tiles.length, true);
  assert.ok(mapSvg({ tiles, places, steps: ['Go up above the roofs'] }).includes('The drone\'s steps'));
});

test('the route kept in the town: small, and drawn only while its places are still there', () => {
  const auto = fly([up, go('w', 4), go('n', 3), drop], places, keys); const data = townData(places, auto);
  assert.deepEqual(data, { v: 1, from: { k: '10,9' }, drops: [{ k: '6,6', item: 'timber' }], pts: [[10, 9], [6, 9], [6, 6]] });
  assert.deepEqual(cleanTown({ kind: 'drone-route', data }).data, data);
  assert.equal(routeStillThere(data, [['6,6', cell('timber')]], keys), true);
  assert.equal(routeStillThere(data, [['6,6', cell('park')]], keys), false, 'the home was replaced');
  assert.equal(routeStillThere(data, [], keys), false, 'the home was removed');
  assert.equal(routeStillThere({ ...data, pts: [[10, 9], [99, 9]] }, [['6,6', cell('timber')]], keys), false);
  for (const bad of [null, {}, { v: 2 }, { v: 1, from: { k: '10,9' }, drops: [], pts: [[1, 1]] }, 'x']) assert.equal(routeStillThere(bad, [], keys), false);
  // the longest route still fits the contract's 4 KB
  let zig = [up]; for (let i = 0; i < 11; i++) zig.push(go(i % 2 ? 'n' : 'w', 1)); assert.ok(cleanTown({ kind: 'drone-route', data: townData(places, fly(zig, places, keys)) }));
  // show() draws nothing, and does not throw, when the place is gone or there is no data
  const off = drone.show({ engine: {}, town: { cells: [], terrain }, junior: true, reduceMotion: true }, data); assert.equal(typeof off, 'function'); off();
  assert.equal(typeof drone.show({ engine: {}, town: { cells: [], terrain } }, null), 'function');
});

test('progress between visits: kept small, and dropped when the town\'s places changed', () => {
  const fresh = restore(null, places); assert.deepEqual(fresh, { v: 1, places: '10,9|6,6', hand: null, program: [], flights: 0, changed: false });
  const saved = { ...fresh, hand: { secs: 20, tiles: 8, trail: [[10, 9], [6, 6]] }, program: [up, go('w', 4), { op: 'bad' }], flights: 2, changed: true };
  const back = restore(JSON.parse(JSON.stringify(saved)), places); assert.equal(back.hand.tiles, 8); assert.deepEqual(back.program, [up, go('w', 4)]); assert.equal(back.flights, 2);
  assert.deepEqual(restore(saved, { ...places, drops: [{ ...places.drops[0], k: '5,5' }] }).program, [], 'another delivery: start again');
  assert.deepEqual(restore({ ...saved, done: true }, places), fresh, 'a finished loop played again starts with a new hand flight');
  assert.equal(cleanHand({ secs: 'x' }), null); assert.equal(cleanHand(null), null);
  const trail = Array.from({ length: 300 }, (_, i) => [i / 10, 5]); let full = []; for (let i = 0; i < MAX_STEPS; i++) full.push(go('n', 9));
  assert.ok(cleanState({ ...fresh, hand: cleanHand({ secs: 600, tiles: 400, trail }), program: full, flights: 50, changed: true }), 'the largest state fits the contract\'s 8 KB');
});
