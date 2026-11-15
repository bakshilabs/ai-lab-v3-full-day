// Drone delivery (js/modules/drone): the places, the instructions, what happens when the drone flies them, the words,
// the record and the route kept in the town. All pure: no page and no 3D.
import test from 'node:test'; import assert from 'node:assert/strict';
import * as TER from '../js/world/terrain.js';
import { seedTo } from '../js/game/seed.js';
import { cleanResult, cleanState, cleanTown } from '../js/modules/contract.js';
import * as G from '../js/modules/drone/geo.js';
import { pickPlaces, pickVisit, candidates, placesKey, visitKey, cleanProgram, addStep, insertStep, moveStep, removeStep, bumpStep, stepText, fly, corners, verdict, hintLevel,
  fewestTiles, fewestSteps, noFlyZone, compareLines, AUTOMATE, PEOPLE, practisedLines, shortSteps, makeRecord, townData, routeStillThere, restore, usedOf, finishState, cleanHand, MAX_STEPS } from '../js/modules/drone/route.js';
import { mapSvg, placeBadges, BADGE } from '../js/modules/drone/picture.js';
import drone from '../js/modules/drone/index.js';

const terrain = TER.makeTerrain('home'); const tiles = [...terrain.tiles.values()]; const keys = new Set(tiles.map((t) => t.k));
const cell = (item, mark = 'town') => ({ mark, item, mods: [] });
const up = { op: 'up' }, drop = { op: 'drop' }; const go = (dir, n) => ({ op: 'go', dir, n });
const SMALL = [['6,3', cell('timber')], ['7,3', cell('straw')], ['7,4', cell('timber')], ['11,5', cell('cohousing')], ['8,5', cell('market')], ['11,3', cell('school')]];
const HEART = [...seedTo(terrain, 'heart')]; // Florence's practice town: many homes with the same name
// a route of single-axis moves between two tiles that stays on the island and off a no-fly zone (breadth-first)
function routeSteps(from, to, block = new Set(), dirs0 = G.DIR_IDS) {
  const prev = new Map([[G.key(from.gx, from.gz), null]]); const q = [from];
  while (q.length) { const c = q.shift(); if (c.gx === to.gx && c.gz === to.gz) break; for (const d of dirs0) { const n = { gx: c.gx + G.DIRS[d].dx, gz: c.gz + G.DIRS[d].dz, d, p: c }; const k = G.key(n.gx, n.gz); if (keys.has(k) && !block.has(k) && !prev.has(k)) { prev.set(k, n); q.push(n); } } }
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
  assert.equal(G.dirWords({ gx: 2, gz: 5 }, { gx: 3, gz: 3 }), 'north and east'); assert.equal(G.dirWords({ gx: 5, gz: 5 }, { gx: 1, gz: 5 }), 'west'); assert.equal(G.dirWords({ gx: 1, gz: 1 }, { gx: 1, gz: 1 }), '');
  assert.equal(G.arrowFor(0), '↑'); assert.equal(G.arrowFor(Math.PI / 2), '→'); assert.equal(G.arrowFor(-Math.PI / 2), '←'); assert.equal(G.arrowFor(Math.PI), '↓');
  assert.ok(Math.abs(G.bearing(0, 0, 0, -5)) < 1e-9, 'north is 0'); assert.ok(Math.abs(G.bearing(0, 0, 5, 0) - Math.PI / 2) < 1e-9, 'east is a quarter turn');
  assert.ok(Math.abs(G.turnTo(3, -3) - (2 * Math.PI - 6)) < 1e-9, 'the short way round');
  const [x, z] = G.pullInside(80, 0); assert.ok(Math.abs(x - G.SAFE_RX) < 1e-6 && z === 0); assert.deepEqual(G.pullInside(3, 4), [3, 4]);
  const [x2] = G.pullInside(80, 0, 0.5); assert.ok(x2 < 80 && x2 > G.SAFE_RX, 'a gentle pull, not a wall');
  assert.equal(G.sideWord({ gx: 12, gz: 5 }), 'east'); assert.equal(G.sideWord({ gx: 6, gz: 0 }), 'north');
  // a tap on the map: one straight flight to a square in line, nothing for a square that is not
  assert.deepEqual(G.stepTo({ gx: 5, gz: 5 }, { gx: 5, gz: 2 }), go('n', 3)); assert.deepEqual(G.stepTo({ gx: 5, gz: 5 }, { gx: 9, gz: 5 }), go('e', 4));
  assert.equal(G.stepTo({ gx: 5, gz: 5 }, { gx: 6, gz: 6 }), null); assert.equal(G.stepTo({ gx: 5, gz: 5 }, { gx: 5, gz: 5 }), null); assert.equal(G.stepTo({ gx: 0, gz: 5 }, { gx: 12, gz: 5 }), null, 'more than nine tiles is two steps');
});

test('the hand flight has hoops to fly through, inside the island and off the straight line', () => {
  const a = { gx: 10, gz: 9 }, b = { gx: 3, gz: 6 }; const hs = G.hoopsFor(a, b, 3); assert.equal(hs.length, 3);
  const [x0, z0] = G.tileXZ(a.gx, a.gz), [x1, z1] = G.tileXZ(b.gx, b.gz); const sides = [];
  for (const h of hs) {
    assert.ok(Math.hypot(h.x / G.SAFE_RX, h.z / G.SAFE_RZ) < 1, 'inside the part of the island the drone can reach');
    assert.ok(G.segDist(h.x, h.z, x0, z0, x1, z1) > 3, 'a hoop is off the straight line, so the flight needs steering');
    sides.push(Math.sign((x1 - x0) * (h.z - z0) - (z1 - z0) * (h.x - x0))); assert.ok(Number.isFinite(h.facing));
  }
  assert.deepEqual(sides, [sides[0], -sides[0], sides[0]], 'left, right, left: a zigzag');
  assert.equal(G.hoopsFor(a, { gx: 8, gz: 9 }, 3).length, 0, 'no hoops for a hop next door'); assert.equal(G.hoopsFor(a, { gx: 7, gz: 8 }, 3).length, 2, 'two for a short flight');
  for (const cells of [[], SMALL, HEART]) for (const junior of [true, false]) { const v = pickVisit(cells, tiles, junior); assert.ok(G.hoopsFor(v.from, v.deliveries[0].drops[0], 3).length >= 2, 'every first delivery has hoops'); }
});

test('places: an empty town still has a visit of two deliveries from the AI Lab', () => {
  for (const layout of TER.ISLANDS) {
    const t = [...TER.makeTerrain(layout).tiles.values()];
    for (const junior of [true, false]) {
      const v = pickVisit([], t, junior); assert.ok(v, layout); assert.equal(v.from.fixed, 'ailab'); assert.equal(v.deliveries.length, 2);
      const p = v.deliveries[0]; assert.equal(p.drops.length, junior ? 1 : 2); assert.equal(v.deliveries[1].drops.length, 2, 'the second delivery has two parcels');
      const all = [v.from, ...v.deliveries.flatMap((x) => x.drops)]; assert.equal(new Set(all.map((x) => x.k)).size, all.length, 'different tiles');
      assert.equal(new Set(all.map((x) => x.label)).size, all.length, 'different names');
      for (const x of v.deliveries) { for (const d of x.drops) assert.ok(G.manhattan(x.from, d) >= 3, 'far enough to be a flight'); assert.equal(x.from.k, v.from.k, 'the same landing pad'); }
      assert.ok(G.manhattan(p.from, p.drops[0]) >= 6, 'the hand flight is a real flight');
    }
  }
  assert.equal(pickVisit([], [], true), null); assert.equal(pickPlaces([], [], true), null);
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

test('places: a pad with a flight worth planning is preferred to a market next door', () => {
  const near = pickPlaces([['8,5', cell('market')], ['6,3', cell('timber')]], tiles, true);
  assert.equal(near.from.fixed, 'ailab'); assert.equal(near.drops[0].item, 'timber'); assert.ok(G.manhattan(near.from, near.drops[0]) >= 6);
  const far = pickPlaces([['8,5', cell('market')], ['3,2', cell('timber')]], tiles, true); assert.equal(far.from.item, 'market');
});

test('places: a name shared by many buildings says which one', () => {
  for (const junior of [true, false]) {
    const v = pickVisit(HEART, tiles, junior); const all = [v.from, ...v.deliveries.flatMap((p) => p.drops)];
    assert.equal(new Set(all.map((p) => p.label)).size, all.length, 'no two places of a visit share a name');
    for (const p of all) if (p.item && candidates(HEART, tiles).filter((c) => c.item === p.item).length > 1) assert.match(p.label, / by the | on the \w+ side$/, p.label);
    for (const p of all) assert.ok(p.label.length <= 60, p.label);
  }
  const lone = pickPlaces([['6,3', cell('market')], ['11,6', cell('timber')]], tiles, true); assert.equal(lone.drops[0].label, 'the timber terrace', 'a name of its own needs nothing added');
});

test('places: playing again goes somewhere else', () => {
  for (const cells of [[], SMALL, HEART]) for (const junior of [true, false]) {
    let saved = null; const seen = [];
    for (let round = 0; round < 3; round++) {
      const v = pickVisit(cells, tiles, junior, usedOf(saved)); const st = restore(saved, v); assert.equal(st.round, round); assert.equal(st.hand, null);
      const drops = v.deliveries.flatMap((p) => p.drops.map((d) => d.k)); assert.equal(new Set(drops).size, drops.length);
      if (seen.length) { const prev = seen[seen.length - 1]; assert.ok(!drops.some((k) => prev.includes(k)), `visit ${round + 1} shares no drop-off with the one before`); assert.notEqual(visitKey(v), prev.key); }
      assert.deepEqual(pickVisit(cells, tiles, junior, usedOf(saved)), v, 'the same until the visit is finished: leaving and coming back resumes');
      seen.push(Object.assign(drops, { key: visitKey(v) })); saved = JSON.parse(JSON.stringify(finishState(st, v)));
      assert.equal(saved.done, true); assert.equal(saved.round, round + 1); assert.ok(saved.used.length <= 8 && cleanState(saved));
    }
  }
  assert.deepEqual(usedOf({ v: 2, used: ['3,4', 5, 'x', '12,10', '<b>'] }), ['3,4', '12,10']); assert.deepEqual(usedOf({ v: 1, used: ['3,4'] }), []); assert.deepEqual(usedOf(null), []);
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

test('instructions: a step can go in before another, and steps can change places', () => {
  const p = [go('w', 4), go('n', 3), drop]; // the commonest first try: no "Go up"
  assert.deepEqual(insertStep(p, 0, up), [up, go('w', 4), go('n', 3), drop], 'Go up goes in first, and nothing is lost');
  assert.deepEqual(insertStep(p, 2, go('e', 1)), [go('w', 4), go('n', 3), go('e', 1), drop]);
  assert.deepEqual(insertStep(p, 1, go('w', 1)), [go('w', 5), go('n', 3), drop], 'the same direction as the step before: that step grows');
  assert.deepEqual(insertStep(p, 1, go('n', 2)), [go('w', 4), go('n', 5), drop], 'the same direction as the step after: that step grows');
  assert.deepEqual(insertStep(p, 3, up), [...p, up]); assert.deepEqual(insertStep(p, 99, up), [...p, up]); assert.deepEqual(insertStep(p, -1, up), [...p, up], 'no place chosen: at the end');
  assert.deepEqual(insertStep(p, 0, { op: 'explode' }), p); assert.deepEqual(p, [go('w', 4), go('n', 3), drop], 'the list given is never changed');
  let full = []; for (let i = 0; i < MAX_STEPS; i++) full.push(i % 2 ? up : drop);
  assert.deepEqual(insertStep(full, 3, drop), full, 'a full list takes no more'); assert.equal(insertStep([...full.slice(0, 11), go('n', 2)], 11, go('n', 1))[11].n, 3, 'but a flight in a full list can still grow');
  assert.deepEqual(moveStep(p, 2, -1), [go('w', 4), drop, go('n', 3)]); assert.deepEqual(moveStep(p, 0, 1), [go('n', 3), go('w', 4), drop]);
  assert.deepEqual(moveStep(p, 0, -1), p); assert.deepEqual(moveStep(p, 2, 1), p); assert.deepEqual(moveStep(p, 7, 1), p);
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
  assert.match(verdict(ground, places).text, /Step 1 says fly, but the drone is still on its landing pad/); assert.match(verdict(ground, places).text, /Tap the number 1 beside that step, then tap Go up/, 'and how to put the step in');
  const short = fly([up, go('w', 4), go('n', 1), drop], places, keys); assert.equal(short.all, false); assert.equal(short.misses.length, 1);
  assert.equal(verdict(short, places).kind, 'short'); assert.match(verdict(short, places).text, /nobody was waiting/);
  const nodrop = fly([up, go('w', 4), go('n', 3)], places, keys); assert.equal(verdict(nodrop, places).kind, 'nodrop'); assert.match(verdict(nodrop, places).text, /no step told it to lower the parcel/);
  const edge = fly([up, go('s', 9), go('w', 4)], places, keys); assert.equal(edge.stop.reason, 'edge'); assert.equal(edge.stop.step, 1); assert.ok(keys.has(G.key(edge.end.gx, edge.end.gz)), 'it stops on the island');
  assert.match(verdict(edge, places).text, /stopped on step 2\. It will not fly past the edge of the island/); assert.doesNotMatch(verdict(edge, places).text, /sea/); assert.equal(edge.stepsRun, 1);
  assert.equal(verdict(fly([], places, keys), places).kind, 'empty');
  assert.equal(fly([up, up, go('w', 4), go('n', 3), drop, drop], places, keys).all, true, 'extra steps do no harm');
  assert.equal(fly([drop, up, go('w', 4), go('n', 3), drop], places, keys).all, true, 'lowering at the start delivers nothing');
  for (const r of [good, ground, short, nodrop, edge]) for (const w of ['wrong', 'fail', 'mistake', 'Wrong', 'Fail']) assert.ok(!verdict(r, places).text.includes(w), 'no marks, only what happened');
});

test('hints: the way to go first; the numbers only after a second miss, and never for ages 13-17', () => {
  assert.equal(hintLevel(0, true), 0); assert.equal(hintLevel(1, true), 1); assert.equal(hintLevel(5, true), 1); for (const m of [0, 1, 2, 9]) assert.equal(hintLevel(m, false), 0);
  const short = fly([up, go('w', 2), go('n', 1)], places, keys); // stops 2 tiles north and 2 tiles west short
  const first = verdict(short, places, { junior: true, miss: 0 });
  assert.match(first.text, /To reach the timber terrace, it still has to go north and west\. Count the squares on the map\./); assert.doesNotMatch(first.text, /\d tiles/, 'no numbers after the first miss'); assert.equal(first.away, true);
  const second = verdict(short, places, { junior: true, miss: 1 });
  assert.match(second.text, /it still has to go 2 tiles north and 2 tiles west\./); assert.doesNotMatch(second.text, /Count the squares/);
  for (const miss of [0, 1, 4]) { const s = verdict(short, places, { junior: false, miss }); assert.doesNotMatch(s.text, /\d tiles? (north|south|east|west)/, 'ages 13-17 count for themselves'); assert.match(s.text, /north and west/); }
  const edge = fly([up, go('s', 9)], places, keys);
  assert.doesNotMatch(verdict(edge, places, { junior: true, miss: 0 }).text, /\d tiles/); assert.match(verdict(edge, places, { junior: true, miss: 1 }).text, /\d tiles? north/);
  // a plural name reads properly ("the cottages is ..." is gone)
  const plural = { from: places.from, drops: [{ ...places.drops[0], label: 'the straw-bale cottages' }] };
  assert.doesNotMatch(verdict(short, plural).text, /cottages is/); assert.match(verdict(short, plural).text, /To reach the straw-bale cottages, it still has to go/);
});

test('flying: two deliveries in either order', () => {
  const two = { from: places.from, drops: [places.drops[0], { k: '9,8', gx: 9, gz: 8, label: 'the old school', fixed: 'oldschool' }] };
  const a = fly([up, go('n', 1), go('w', 1), drop, go('w', 3), go('n', 2), drop], two, keys); assert.equal(a.all, true); assert.deepEqual(a.delivered, ['9,8', '6,6']);
  const half = fly([up, go('n', 1), go('w', 1), drop], two, keys); assert.equal(half.all, false);
  const v = verdict(half, two, { junior: true, miss: 1 }); assert.match(v.text, /One parcel arrived/); assert.match(v.text, /To reach the timber terrace, it still has to go 2 tiles north and 3 tiles west/);
  assert.equal(fly([up, go('n', 1), go('w', 1), drop, drop], two, keys).delivered.length, 1, 'one parcel for each place');
  assert.equal(fewestTiles(two), 2 + 5); assert.equal(fewestTiles(places), 7); assert.equal(fewestTiles(two, keys), 7); assert.equal(fewestSteps(places, keys), 4); assert.equal(fewestSteps(two, keys), 7);
});

test('ages 13-17: a battery limit and a no-fly zone to route round', () => {
  // the battery: the drone stops when it has flown all the tiles it holds
  const limited = { ...places, battery: 8 };
  assert.equal(fly([up, go('w', 4), go('n', 3), drop], limited, keys).all, true, 'seven tiles fit');
  const wander = fly([up, go('n', 3), go('w', 4), go('s', 1), go('n', 1), drop], limited, keys); assert.deepEqual(wander.stop, { reason: 'battery', step: 4 }); assert.equal(wander.tiles, 8); assert.equal(wander.all, false);
  assert.match(verdict(wander, limited, { junior: false }).text, /The battery ran low on step 5, so the drone stopped\. It holds enough for 8 tiles\. Look for a shorter way\./);
  // the no-fly zone: the drone stops in front of it
  const zoned = { ...places, nofly: ['8,8', '8,9', '8,10'] };
  const into = fly([up, go('w', 4), go('n', 3), drop], zoned, keys); assert.deepEqual(into.stop, { reason: 'nofly', step: 1 }); assert.deepEqual(into.end, { gx: 9, gz: 9 });
  assert.match(verdict(into, zoned, { junior: false }).text, /stopped on step 2\. Birds are nesting ahead, and it will not fly over them\. Plan a way round the striped squares\./);
  assert.equal(fly([up, go('n', 3), go('w', 4), drop], zoned, keys).all, true, 'round the other way');
  // every visit for ages 13-17: both deliveries have a battery with some room, the second has a zone that needs a way round
  for (const cells of [[], SMALL, HEART]) for (const used of [[], ['3,6', '5,4', '6,3', '11,5']]) {
    const v = pickVisit(cells, tiles, false, used); assert.equal(v.deliveries.length, 2);
    for (const [i, p] of v.deliveries.entries()) {
      const f = fewestTiles(p, keys); assert.ok(Number.isFinite(f)); assert.equal(p.battery, f + (i ? 3 : 4), 'a few tiles more than the fewest');
      assert.ok(fewestSteps(p, keys) <= MAX_STEPS - 2, 'it fits the step limit with room to spare');
    }
    assert.equal(v.deliveries[0].nofly, undefined, 'the first delivery has no zone');
    const p = v.deliveries[1]; assert.ok(p.nofly?.length >= 1 && p.nofly.length <= 6, JSON.stringify(p));
    for (const k of p.nofly) assert.ok(keys.has(k) && k !== p.from.k && !p.drops.some((d) => d.k === k), 'the zone is on the island and on no place');
    assert.ok(fewestTiles(p, keys) > fewestTiles({ ...p, nofly: [] }, keys), 'the zone makes the shortest way longer: there is something to work out');
    assert.deepEqual(noFlyZone({ from: p.from, drops: p.drops }, keys), p.nofly, 'the same zone every time');
  }
  // ages 8-12 get neither
  for (const cells of [[], SMALL, HEART]) for (const p of pickVisit(cells, tiles, true).deliveries) { assert.equal(p.battery, undefined); assert.equal(p.nofly, undefined); }
});

test('every delivery the module can choose can be flown from tiles within the step limit', () => {
  const towns = [[], SMALL, HEART, [['6,3', cell('market')], ['11,6', cell('timber')], ['12,3', cell('school')]], [['0,5', cell('straw')], ['13,5', cell('hall')]], [['3,1', cell('earth')], ['1,7', cell('park')]]];
  for (const cells of towns) for (const junior of [true, false]) for (const used of [[], ['3,6', '5,4', '11,2']]) for (const p of pickVisit(cells, tiles, junior, used).deliveries) {
    const block = new Set(p.nofly || []); let bestProg = null;
    for (const order of [p.drops, [...p.drops].reverse()]) for (const dirs of [['n', 'e', 's', 'w'], ['w', 's', 'e', 'n'], ['e', 'n', 'w', 's'], ['s', 'w', 'n', 'e']]) { // either parcel first, by a few different ways round
      let prog = [up]; let at = p.from;
      for (const d of order) { for (const s of routeSteps(at, d, block, dirs)) prog = addStep(prog, s); prog = addStep(prog, drop); at = d; }
      const r = fly(prog, p, keys); assert.ok(!r.stop || r.stop.reason === 'battery', 'a route found on the map never meets the edge or the no-fly zone');
      if (r.all && (!bestProg || prog.length < bestProg.length)) bestProg = prog;
    }
    assert.ok(bestProg, `a route that delivers inside the battery: ${JSON.stringify(p)}`); assert.ok(bestProg.length <= MAX_STEPS, `${bestProg.length} steps for ${JSON.stringify(p.drops.map((d) => d.k))}`);
  }
});

test('the comparison says what happened, with no marks', () => {
  const auto = fly([up, go('w', 4), go('n', 3), drop], places, keys);
  const longer = compareLines({ secs: 30, tiles: 11 }, auto, places, true);
  assert.equal(longer[0], 'By hand you flew 11 tiles in 30 seconds.'); assert.match(longer[1], /Following your 4 steps, the drone flew 7 tiles in \d+ seconds/); assert.equal(longer[2], 'The planned route was 4 tiles shorter.');
  assert.match(compareLines({ secs: 9, tiles: 6 }, auto, places, true)[2], /Your hand flight was 1 tile shorter/);
  assert.equal(compareLines({ secs: 9, tiles: 7 }, auto, places, true)[2], 'Both flights were the same length.');
  assert.ok(compareLines({ secs: 9, tiles: 7 }, auto, places, false, keys).includes('That is the fewest tiles this delivery can take (7).'), 'ages 13-17 also see the shortest possible');
  const round = fly([up, go('n', 4), go('w', 4), go('s', 1), drop], { ...places, battery: 11 }, keys); assert.equal(round.all, true);
  const gap = compareLines(null, round, { ...places, battery: 11 }, false, keys);
  assert.ok(gap.includes('The fewest tiles this delivery can take is 7. Yours took 9: 2 more.'), 'the gap to the target is shown'); assert.ok(gap.includes('It used 9 of the 11 tiles the battery holds.'));
  const alone = compareLines(null, auto, places, true); assert.equal(alone.length, 3); assert.match(alone[1], /planned this one from the map alone/, 'the second delivery has no hand flight to compare');
  for (const q of [AUTOMATE, PEOPLE]) { assert.equal(q.options.length, 2); for (const o of q.options) assert.ok(o.reply.length > 20 && !/wrong|correct|right answer/i.test(o.reply)); }
});

test('the record is built from what the child did and fits the contract', () => {
  const program = [up, go('w', 4), go('n', 3), drop]; const auto = fly(program, places, keys); const hand = cleanHand({ secs: 31.6, tiles: 9.2, trail: [[10, 9], [8.44, 7.51], [6, 6]], hoops: 2, of: 3 });
  assert.deepEqual(hand, { secs: 32, tiles: 9, trail: [[10, 9], [8.4, 7.5], [6, 6]], hoops: 2, of: 3 }); assert.deepEqual(cleanHand({ secs: 5, tiles: 3 }), { secs: 5, tiles: 3, trail: [] });
  const first = practisedLines({ hand: true, steps: 4, flights: 1, changed: false, chose: false }, places);
  assert.deepEqual(first, ['flying a parcel by hand from the AI Lab to the timber terrace', 'planning a route on a map and breaking it into 4 steps a drone can follow', 'comparing a hand-flown delivery with an automated one']);
  const more = practisedLines({ hand: true, parcels: 2, runs: 2, steps: 13, flights: 5, changed: true, chose: true, nofly: true, battery: true }, { from: places.from, drops: [places.drops[0], { ...places.drops[0], label: 'the old school' }] });
  assert.equal(more.length, 4); assert.equal(more[0], 'flying two parcels by hand from the AI Lab to the timber terrace and the old school', 'two parcels are not "a parcel"');
  assert.equal(more[1], 'planning two routes on a map, round a no-fly zone and inside a battery limit, as 13 steps a drone can follow');
  assert.ok(more.includes('testing the steps, seeing where the drone stopped and changing them')); assert.match(more[3], /choosing what to automate/);
  assert.equal(practisedLines({ hand: true, runs: 2, steps: 9, flights: 2 }, places)[1], 'planning two routes on a map and breaking them into 9 steps a drone can follow');
  assert.ok(!practisedLines({ hand: true, runs: 2, steps: 9, flights: 2 }, places).some((l) => /testing/.test(l)), 'two deliveries flown once each is not "changing the steps"');
  assert.equal(practisedLines({ hand: false, steps: 4, flights: 1 }, places).length, 2, 'always at least two');
  for (const l of more) assert.ok(l.length <= 120 && !/learn|improv|better/.test(l), l);
  // the steps as one line that only breaks between whole steps
  assert.equal(shortSteps(program), 'Up → west 4 → north 3 → lower');
  let long = []; for (let i = 0; i < MAX_STEPS; i++) long.push(i % 2 ? go('n', 9) : go('w', 9)); assert.ok(shortSteps(long).length <= 120);
  for (const piece of shortSteps(long).split(' ')) assert.match(piece, /^\w+ \d ?→?$/, 'a line can only wrap after an arrow, never inside a step');
  // one delivery, ages 8-12
  const runs = [{ places, program, auto }];
  const picture = mapSvg({ tiles, cells: [['6,6', cell('timber')]], hand: hand.trail, runs: runs.map((r) => ({ places: r.places, route: r.auto.path })), steps: [{ title: 'The drone\'s steps', steps: program.map(stepText) }] });
  const rec = makeRecord({ runs, hand, did: { hand: true, runs: 1, steps: 4, flights: 2, changed: true, chose: true }, picture });
  const clean = cleanResult({ finished: true, record: rec, town: { kind: 'drone-route', data: townData(places, auto) } });
  assert.equal(clean.finished, true); assert.equal(clean.record.made.title, 'My drone route'); assert.equal(clean.record.made.picture, picture, 'the picture passes the contract\'s checks');
  assert.deepEqual(clean.record.made.lines, rec.made.lines, 'no line is cut');
  assert.deepEqual(rec.made.lines.slice(0, 2), ['From the AI Lab to the timber terrace: 4 steps, 7 tiles', shortSteps(program)]);
  assert.match(rec.made.lines[2], /^By hand: 9 tiles in 32 seconds\. The drone by itself: 7 tiles in \d+ seconds\.$/); assert.equal(rec.made.lines.length, 3);
  // two deliveries with the longest names and the longest steps, ages 13-17: still six lines of at most 120 characters, none cut
  for (const cells of [[], SMALL, HEART]) {
    const v = pickVisit(cells, tiles, false); const big = v.deliveries.map((p) => ({ places: p, program: long, auto: fly(long, p, keys) }));
    const r = makeRecord({ runs: big, hand, did: { hand: true, parcels: 2, runs: 2, steps: 24, flights: 9, changed: true, chose: true, nofly: true, battery: true }, picture, junior: false, tileKeys: keys });
    assert.equal(r.made.lines.length, 6); assert.ok(r.made.lines.every((l) => l.length <= 120), JSON.stringify(r.made.lines)); assert.match(r.made.lines[2], /^Then to /); assert.match(r.made.lines[5], /^Fewest tiles possible: \d+ and \d+\. The drone flew \d+ and \d+\.$/);
    assert.deepEqual(cleanResult({ finished: true, record: r }).record.made.lines, r.made.lines); assert.ok(r.practised.every((l) => l.length <= 120));
  }
});

test('the map: pins are rings with a letter beside them, clear of each other and of the lines', () => {
  const clearOf = (pins, lines = []) => {
    const spots = placeBadges(pins, lines); assert.equal(spots.length, pins.length);
    spots.forEach((s, i) => {
      assert.ok(s.x >= -0.85 && s.x <= G.GW - 0.15 && s.z >= -0.85 && s.z <= G.GH - 0.15, `letter ${i} is on the map`);
      assert.ok(Math.hypot(s.x - pins[i].gx, s.z - pins[i].gz) < 1, 'beside its own ring');
      pins.forEach((p, j) => { if (j !== i) assert.ok(Math.hypot(s.x - p.gx, s.z - p.gz) >= BADGE.ring + BADGE.disc, `letter ${i} is off pin ${j}`); });
      spots.forEach((o, j) => { if (j > i) assert.ok(Math.hypot(s.x - o.x, s.z - o.z) >= BADGE.disc * 2, `letters ${i} and ${j} do not overlap`); });
      for (const line of lines) for (let k = 1; k < line.length; k++) assert.ok(G.segDist(s.x, s.z, ...line[k - 1], ...line[k]) >= BADGE.disc, `letter ${i} is off the line`);
    });
  };
  clearOf([{ gx: 10, gz: 9 }, { gx: 6, gz: 6 }]);
  clearOf([{ gx: 10, gz: 9 }, { gx: 9, gz: 8 }, { gx: 5, gz: 8 }], [[[10, 9], [10, 8], [9, 8], [5, 8]]]); // the empty town: the AI Lab, the old school next door, the ferry dock
  clearOf([{ gx: 5, gz: 5 }, { gx: 6, gz: 5 }, { gx: 5, gz: 6 }]);                                            // three in a huddle
  clearOf([{ gx: 0, gz: 4 }, { gx: 13, gz: 5 }, { gx: 6, gz: 0 }, { gx: 6, gz: 10 }]);                         // the island's four edges
  clearOf([{ gx: 13, gz: 0 }, { gx: 0, gz: 10 }, { gx: 13, gz: 10 }, { gx: 0, gz: 0 }]);                       // the map's corners
  // every visit the module can choose, with a route drawn through the pins
  for (const cells of [[], SMALL, HEART]) for (const junior of [true, false]) for (const p of pickVisit(cells, tiles, junior).deliveries) {
    let prog = [up]; let at = p.from; for (const d of p.drops) { for (const s of routeSteps(at, d, new Set(p.nofly || []))) prog = addStep(prog, s); prog = addStep(prog, drop); at = d; }
    clearOf([p.from, ...p.drops], [fly(prog, { ...p, battery: undefined }, keys).path.map((q) => [q.gx, q.gz])]);
  }
});

test('the map is one safe SVG, with every name in a key and none on the map', () => {
  const auto = fly([up, go('w', 4), go('n', 3), drop], places, keys); const long = 'the reclaimed-brick terrace by the community hall';
  const svg = mapSvg({ tiles, cells: [['6,6', cell('timber')], ['5,5', cell(null)]], places: { from: places.from, drops: [{ ...places.drops[0], label: 'the <b> & "terrace"' }] }, plan: auto.path, end: { gx: 6, gz: 7 }, hand: [[10, 9], [6, 6]] });
  assert.match(svg, /^<svg[\s>]/); assert.match(svg, /<\/svg>$/); assert.doesNotMatch(svg, /<script|on\w+\s*=|javascript:/i); assert.ok(svg.length < 60000, `${svg.length} characters`);
  assert.ok(svg.includes('the &lt;b&gt; &amp; &quot;terrace&quot;')); assert.equal((svg.match(/<rect /g) || []).length >= tiles.length, true);
  for (const k of ['Start: the AI Lab', 'flown by hand', 'where your steps go', 'where the drone stopped']) assert.ok(svg.includes(k), `the key names "${k}"`);
  // every piece of writing is inside the picture: a name can not be cut off at its edge
  const inside = (s) => {
    const [, W, H] = s.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
    for (const m of s.matchAll(/<text x="([\d.]+)" y="([\d.]+)" font-size="([\d.]+)"([^>]*)>([^<]*)<\/text>/g)) {
      const [x, y, size] = [+m[1], +m[2], +m[3]]; const text = m[5].replace(/&\w+;/g, 'x'); const w = [...text].length * size * 0.6; const mid = /text-anchor="middle"/.test(m[4]);
      assert.ok((mid ? x - w / 2 : x) >= 0 && (mid ? x + w / 2 : x + w) <= W && y <= H - 2 && y - size >= 0, `"${text}" fits in ${W} x ${H}`);
    }
  };
  inside(svg);
  const two = { from: { ...places.from, label: long }, drops: [{ ...places.drops[0], label: long }, { k: '9,8', gx: 9, gz: 8, label: long }], nofly: ['8,8', '8,9'] };
  for (const keySide of [false, true]) { const s = mapSvg({ tiles, places: two, plan: auto.path, end: { gx: 6, gz: 7 }, hand: [[10, 9], [6, 6]], keySide }); inside(s); assert.ok(s.includes('birds nesting: no flying')); assert.ok(s.includes('Parcel 2: ')); assert.doesNotMatch(s, /<script|on\w+\s*=|javascript:/i); }
  const [, wide, short] = mapSvg({ tiles, places: two, plan: auto.path, keySide: true }).match(/viewBox="0 0 (\d+) (\d+)"/).map(Number); assert.ok(wide / short > 1.7, 'the key beside the map makes a wide, short picture for an upright screen');
  // the take-home picture: both deliveries, pins numbered on, the steps of each
  const p2 = { from: places.from, drops: [{ k: '3,6', gx: 3, gz: 6, label: 'the river meadow' }, { k: '5,4', gx: 5, gz: 4, label: 'the dry field' }] };
  const home = mapSvg({ tiles, runs: [{ places, route: auto.path }, { places: p2, route: fly([up, go('w', 5), go('n', 5), drop, go('w', 2), go('s', 2), drop], p2, keys).path }], hand: [[10, 9], [6, 6]],
    steps: [{ title: 'Delivery 1: the steps', steps: Array(12).fill('Fly north 9 tiles') }, { title: 'Delivery 2: the steps', steps: Array(12).fill('Lower the parcel') }] });
  inside(home); for (const k of ['Parcel 1: the timber terrace', 'Parcel 3: the dry field', 'delivery 2', 'Delivery 2: the steps', '12. Lower the parcel']) assert.ok(home.includes(k), k);
  assert.ok(home.length < 200000); assert.equal(cleanResult({ finished: true, record: { made: { title: 'x', picture: home }, practised: ['a', 'b'] } }).record.made.picture, home);
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
  const visit = pickVisit(SMALL, tiles, true); const fresh = restore(null, visit);
  assert.deepEqual(fresh, { v: 2, places: visitKey(visit), round: 0, used: [], d: 0, hand: null, program: [], first: null, flights: 0, changed: false, miss: 0 });
  const saved = { ...fresh, hand: { secs: 20, tiles: 8, trail: [[10, 9], [6, 6]] }, program: [up, go('w', 4), { op: 'bad' }], flights: 2, changed: true, miss: 3 };
  const back = restore(JSON.parse(JSON.stringify(saved)), visit); assert.equal(back.hand.tiles, 8); assert.deepEqual(back.program, [up, go('w', 4)]); assert.equal(back.flights, 2); assert.equal(back.miss, 3); assert.equal(back.d, 0);
  // in the middle of the second delivery: the first one's steps are kept, so the record can still show both
  const mid = restore(JSON.parse(JSON.stringify({ ...saved, d: 1, first: [up, go('w', 4), go('n', 6), drop], program: [up] })), visit); assert.equal(mid.d, 1); assert.equal(mid.first.length, 4); assert.deepEqual(mid.program, [up]);
  assert.equal(restore({ ...saved, d: 1, first: [] }, visit).d, 0, 'no steps kept for the first delivery: start it again');
  assert.deepEqual(restore(saved, pickVisit([], tiles, true)).program, [], 'another town, another delivery: start again');
  assert.deepEqual(restore({ v: 1, places: fresh.places, hand: saved.hand, program: saved.program }, visit), fresh, 'progress saved by the first version is not carried over');
  const again = restore({ v: 2, done: true, round: 2, used: ['6,3', '7,3'] }, visit); assert.equal(again.hand, null); assert.equal(again.round, 2); assert.deepEqual(again.used, ['6,3', '7,3'], 'a finished visit played again starts with a new hand flight');
  assert.equal(cleanHand({ secs: 'x' }), null); assert.equal(cleanHand(null), null);
  const trail = Array.from({ length: 300 }, (_, i) => [i / 10, 5]); let full = []; for (let i = 0; i < MAX_STEPS; i++) full.push(go('n', 9));
  assert.ok(cleanState({ ...fresh, used: Array(8).fill('12,10'), d: 1, hand: cleanHand({ secs: 600, tiles: 400, trail, hoops: 6, of: 6 }), program: full, first: full, flights: 50, changed: true, miss: 9 }), 'the largest state fits the contract\'s 8 KB');
});
