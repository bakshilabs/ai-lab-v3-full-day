// The "roads" module (js/modules/roads): the street model, the morning's simulation, the freed land, the words and the record.
import test from 'node:test'; import assert from 'node:assert/strict';
import { SLOTS, JUNCTION, HOMES, LINES, BAY_CARS, CARPARK_SPACES, emptyLayout, cleanLayout, canPlace, place, counts, crossings, tripsFor, fleetFor, simulate, grade, nextStep, land, cleanPlots, USES, BEFORE, townSpot, kindsFor } from '../js/modules/roads/street.js';
import { PIECES, measures, comment, landSummary, landGain, rideStops, madeLines, madeTitle, practised, picture, wait, intro, rules, designAsk, T } from '../js/modules/roads/words.js';
import { cleanResult, cleanState, cleanReport } from '../js/modules/contract.js';
import roads from '../js/modules/roads/index.js';

const L = (s) => [...s].map((c) => ({ d: 'drop', b: 'bay', w: 'walk', c: 'cycle' }[c] || null));
const GOOD = L('wbdbb.cdw.');

test('roads: the street has ten places and nothing goes in the junction', () => {
  assert.equal(emptyLayout().length, SLOTS); assert.equal(canPlace(JUNCTION), false); assert.equal(canPlace(0), true); assert.equal(canPlace(10), false); assert.equal(canPlace(-1), false);
  let l = place(emptyLayout(), 2, 'drop'); assert.equal(l[2], 'drop');
  assert.equal(place(l, 2, 'drop')[2], null, 'the same piece again takes it away');
  assert.equal(place(l, 2, 'bay')[2], 'bay', 'another piece replaces it');
  assert.deepEqual(place(l, JUNCTION, 'drop'), l); assert.deepEqual(place(l, 3, 'rocket'), l);
  assert.equal(l === place(l, 4, 'walk'), false, 'place returns a new layout');
  assert.deepEqual(counts(GOOD), { drop: 2, bay: 3, walk: 2, cycle: 1, crossings: 3, pieces: 8 });
  assert.equal(HOMES.includes(6), false, 'the cycle track has no home');
});

test('roads: a saved layout is cleaned, and ages 8–12 have no separate cycle crossing', () => {
  assert.deepEqual(kindsFor(true), ['drop', 'bay', 'walk']); assert.equal(kindsFor(false).length, 4);
  const dirty = ['drop', 'x', 7, 'cycle', null, 'drop', 'bay']; const c = cleanLayout(dirty);
  assert.equal(c.length, SLOTS); assert.equal(c[1], null); assert.equal(c[3], 'cycle'); assert.equal(c[JUNCTION], null);
  assert.equal(cleanLayout(dirty, true)[3], null);
  assert.deepEqual(cleanLayout('nonsense'), emptyLayout()); assert.deepEqual(cleanLayout(null), emptyLayout());
  assert.deepEqual(cleanPlots(['homes', 'castle']), ['homes', null, null]); assert.deepEqual(cleanPlots(undefined), [null, null, null]);
});

test('roads: a crossing place is safe with the right marked crossing at it or next to it', () => {
  assert.equal(crossings(emptyLayout()).filter((c) => c.safe).length, 0);
  assert.deepEqual(crossings(L('w.....c.w.')).map((c) => c.safe), [true, true, true]);
  assert.deepEqual(crossings(L('.w.....w..')).map((c) => c.safe), [true, false, true], 'next door counts; a walkers’ crossing does not serve the cycle track');
  assert.deepEqual(crossings(L('.w.....w..'), true).map((c) => c.safe), [true, true, true], 'ages 8–12: one crossing serves everyone');
  assert.deepEqual(crossings(L('..w.......')).map((c) => c.safe), [false, false, false], 'two places away is too far');
  assert.equal(BEFORE.safe, crossings(BEFORE.layout).filter((c) => c.safe).length, 'the "before" number is the model’s own');
  assert.equal(LINES.length, 3);
});

test('roads: the number of trips is the child’s town, with a floor and a ceiling', () => {
  assert.equal(tripsFor(0), 24); assert.equal(tripsFor(undefined), 24); assert.equal(tripsFor(30), 30); assert.equal(tripsFor(400), 36);
  assert.equal(fleetFor(24), 8); assert.equal(fleetFor(36), 12);
  assert.ok(fleetFor(36) < CARPARK_SPACES / 3, 'far fewer shared cars than parked ones');
});

test('roads: the morning is deterministic and every family is picked up', () => {
  const a = simulate(GOOD, { families: 30 }), b = simulate(GOOD, { families: 30 });
  assert.deepEqual(a, b); assert.equal(a.ran, true); assert.equal(a.served, 30); assert.equal(a.log.length, 30);
  assert.notDeepEqual(simulate(GOOD, { families: 30, seed: 8 }).log.map((t) => t.ask), a.log.map((t) => t.ask));
  for (const t of a.log) {
    assert.ok(t.ask <= t.ready && t.ready <= t.board && t.board < t.leave && t.leave < t.out && t.out < t.back, 'times run forwards');
    assert.ok(t.arrive <= t.board && t.set <= t.arrive && t.wait === t.board - t.ready && t.wait >= 0);
    assert.equal(GOOD[t.drop], 'drop', 'a car only stops at a marked drop-off point');
    assert.ok(Math.abs(t.drop - t.home) === Math.min(...[2, 7].map((d) => Math.abs(d - t.home))), 'people walk to the nearest point');
  }
  // one car loads at a point at a time
  for (const d of [2, 7]) { const at = a.log.filter((t) => t.drop === d).sort((x, y) => x.board - y.board); for (let i = 1; i < at.length; i++) assert.ok(at[i].board >= at[i - 1].leave); }
  // a car is never on two trips at once
  for (const c of a.cars) { const mine = a.log.filter((t) => t.car === c.i).sort((x, y) => x.set - y.set); for (let i = 1; i < mine.length; i++) assert.ok(mine[i].set >= mine[i - 1].back - 1e-9); }
  assert.equal(a.cars.length, a.fleet); assert.equal(a.carsInBays, Math.min(a.fleet, 3 * BAY_CARS)); assert.equal(a.carsInBays + a.carsOutside, a.fleet);
});

test('roads: with no drop-off point the cars cannot stop, and the game says so', () => {
  const r = simulate(L('w.b...c.w.'), { families: 24 });
  assert.equal(r.ran, false); assert.equal(r.served, 0); assert.equal(r.longestWait, null); assert.equal(r.safe, 3);
  assert.equal(nextStep(r), 'drop'); assert.equal(grade(r).wait, 'poor');
});

test('roads: the numbers truly depend on the layout', () => {
  const sim = (s, f = 24) => simulate(L(s), { families: f });
  // one drop-off for the whole street: a long walk; two well spread: a short one
  assert.equal(sim('d.........').furthestWalk, 225); assert.equal(sim('....d.....').furthestWalk, 125); assert.equal(sim('..d....d..').furthestWalk, 50);
  // waiting bays keep cars close: the wait falls
  assert.ok(sim('..d.b..d..').longestWait < sim('..d....d..').longestWait);
  assert.ok(sim('.bdbb..d..').longestWait < sim('..d.b..d..').longestWait);
  assert.ok(sim('.bdbb..d..').longestWait <= 180, 'a street with enough bays has a short wait');
  assert.ok(sim('..d....d..').longestWait > 360, 'a street with no bay has a long one');
  // in a big town one drop-off point makes a queue; a second one shares it
  assert.ok(sim('bbbbd.....', 36).queue > sim('bbdbb..d..', 36).queue); assert.ok(sim('bbbbd.....', 36).queue >= 5);
  // crossings make it safe but each one slows the cars that pass it
  assert.ok(sim('wwdww.wdww').longestWait > sim('..d....d..').longestWait);
  assert.equal(sim('w.db..cdw.').safe, 3); assert.equal(sim('..db...d..').safe, 0);
  // more families, more trips and more cars
  assert.equal(sim('..d.b..d..', 36).trips, 36); assert.equal(sim('..d.b..d..', 36).fleet, 12);
  // new homes on the freed land add calls
  assert.equal(simulate(GOOD, { families: 24, extraFamilies: 8 }).trips, 32);
});

test('roads: grades and the next thing to try follow the numbers', () => {
  const none = simulate(L('..d.......'), { families: 24 }); assert.equal(nextStep(none), 'safe'); assert.equal(grade(none).safe, 'poor');
  const far = simulate(L('w...d.c.w.'), { families: 24 }); assert.equal(grade(far).walk, 'poor'); assert.equal(nextStep(far), 'walk');
  const noBay = simulate(L('w.d...cdw.'), { families: 24 }); assert.equal(grade(noBay).walk, 'good'); assert.equal(nextStep(noBay), 'bay');
  const good = simulate(GOOD, { families: 24 }); assert.deepEqual(grade(good), { wait: 'good', walk: 'good', queue: 'good', safe: 'good' }); assert.equal(nextStep(good), 'none');
  const queue = simulate(L('wbbbd.cdw.'), { families: 36 }); assert.ok(['walk', 'queue', 'wait', 'bay', 'none'].includes(nextStep(queue)));
});

test('roads: the freed land adds up, and no choice is marked right or wrong', () => {
  const a = land(['homes', 'homes', 'park']);
  assert.equal(a.families, 2 * USES.homes.families); assert.equal(a.play, 250); assert.equal(a.feeds, 0); assert.equal(a.spaces, 10); assert.equal(a.freed, 750); assert.equal(a.done, true);
  assert.deepEqual(a.notChosen, ['garden', 'parking']);
  const b = land(['parking', 'parking', 'parking']); assert.equal(b.spaces, 40); assert.equal(b.freed, 0);
  const c = land(['garden', null, null]); assert.equal(c.done, false); assert.equal(c.chosen, 1); assert.equal(c.feeds, 3);
  assert.equal('score' in a || 'best' in a || 'right' in a, false);
});

test('roads: every word is short, built in and spoken; ages 8–12 see no money', () => {
  for (const j of [true, false]) {
    const res = simulate(GOOD, { families: 30, junior: j }); const bad = simulate(L('....d.....'), { families: 30, junior: j });
    const all = [...intro(j, 30, 30), ...intro(j, 0, 24), ...rules(j), designAsk(j), comment(res, j), comment(bad, j), ...landSummary(['homes', 'park', 'garden'], j, { before: 100, after: 200 }), ...rideStops(GOOD, ['homes', 'park', 'garden'], j).map((s) => s.text), ...Object.values(PIECES).map((p) => (j ? p.desc.j : p.desc.s)), ...Object.values(T.stage)];
    for (const line of all) { assert.ok(line && line.length <= 260, line); assert.doesNotMatch(line, /undefined|NaN|null|\bcoins?\b|budget|£|\bcost|cheap|wrong|mistake/i, line); }
    for (const st of Object.values(T.stage)) assert.ok(cleanReport('roads', { stage: st }).stage === st, 'a stage fits the leader’s list');
    const ms = measures(bad, j, res); assert.equal(ms.length, j ? 4 : 5); assert.ok(ms.every((m) => ['good', 'fair', 'poor'].includes(m.grade) && m.value && m.was));
    assert.equal(measures(res, j).every((m) => m.was === null), true, 'a first run has nothing to compare with');
  }
  assert.equal(wait(25, true), 'under 1 minute'); assert.equal(wait(60, true), '1 minute'); assert.equal(wait(185, true), '3 minutes'); assert.equal(wait(185, false), '3 min 05 s'); assert.equal(wait(40, false), '40 s');
  assert.match(comment(simulate(L('..d....d..'), { families: 24 }), true), /by the shop, on the cycle track and by the school/);
  assert.match(comment(simulate(GOOD, { families: 24 }), true), /works well/);
  assert.deepEqual(landGain(['homes', 'homes', 'parking']), ['homes for 8 families', '10 visitor spaces']);
});

test('roads: the ride passes each piece the child placed, in order', () => {
  const stops = rideStops(GOOD, ['park', 'park', 'homes'], true);
  assert.equal(stops.length, 8 + 3); assert.deepEqual(stops.map((s) => s.at), [...stops.map((s) => s.at)].sort((a, b) => a - b));
  assert.equal(stops.filter((s) => s.pause).length, 5, 'the car stops at two drop-off points and three crossings');
  assert.match(stops.find((s) => s.kind === 'land').text, /500 m² to play/);
});

test('roads: the record is built from what the child did and passes the contract', () => {
  for (const j of [true, false]) {
    const plots = ['homes', 'park', 'garden']; const res = simulate(GOOD, { families: 30, junior: j });
    const pr = practised(GOOD, plots, { runs: 3, changes: 4, rode: true }, j);
    const result = { finished: true, record: { made: { title: madeTitle(j), lines: madeLines(GOOD, res, plots, j), picture: picture(GOOD, plots, res, j) }, practised: pr }, town: { kind: 'roads-street', data: { layout: GOOD, plots, safe: 3 } } };
    const clean = cleanResult(result);
    assert.equal(clean.finished, true); assert.deepEqual(clean.record.made.lines, result.record.made.lines, 'six lines, none cut'); assert.deepEqual(clean.record.practised, pr);
    assert.ok(clean.record.made.picture, 'the picture is accepted'); assert.ok(clean.record.made.picture.length < 200000); assert.deepEqual(clean.town, result.town);
    assert.match(pr[0], /2 drop-off points, 3 waiting bays and 3 crossings/); assert.match(pr[1], /ran the morning 3 times/); assert.match(pr[2], /homes, a park and a market garden/);
    assert.match(result.record.made.lines[3], /Safe crossings: 3 of 3 \(before: 1 of 3\)/); assert.match(result.record.made.lines[4], /40 spaces before, 10 now, 10 shared cars/);
    for (const l of pr) assert.doesNotMatch(l, /learn|improved|better at/i, 'what was practised, never what was learned');
    assert.match(result.record.made.picture, /^<svg[\s>]/); assert.match(result.record.made.picture, /Before:/); assert.match(result.record.made.picture, /After:/);
  }
  const once = practised(L('....d.....'), ['parking', 'parking', 'parking'], { runs: 1, changes: 0, rode: false }, true);
  assert.equal(once.length, 3); assert.match(once[0], /with 1 drop-off point$/); assert.match(once[1], /real numbers/); assert.match(once[2], /visitor parking/);
  assert.ok(cleanState({ v: 1, stage: 'land', layout: GOOD, plots: ['homes', 'park', 'garden'] }), 'the saved progress fits');
});

test('roads: the model in the town stands on an empty tile by a road, or at the edge, or nowhere', () => {
  const tiles = new Map(); for (let gx = 0; gx < 6; gx++) for (let gz = 0; gz < 4; gz++) tiles.set(`${gx},${gz}`, { k: `${gx},${gz}`, gx, gz, zone: gx === 0 ? 'river' : 'field' });
  tiles.get('5,3').fixed = 'dock';
  const cells = [['3,2', { mark: 'town', item: 'road' }], ['3,1', { mark: 'town', item: 'timber' }], ['2,2', { mark: 'town', item: null }]];
  assert.equal(townSpot(cells, tiles), '3,3', 'beside the road, not on town land or a build');
  const edge = townSpot([], tiles); assert.ok(['1,0', '5,0', '1,3'].includes(edge), edge); assert.equal(tiles.get(edge).fixed, undefined);
  assert.equal(townSpot(cells, [...tiles.values()]), '3,3', 'a list of tiles works too');
  const full = [...tiles.keys()].map((k) => [k, { mark: 'town', item: 'park' }]); assert.equal(townSpot(full, tiles), null);
  assert.equal(townSpot([], new Map()), null); assert.equal(townSpot(null, null), null);
});

test('roads: the module object and its drawing files load without a page', async () => {
  assert.equal(roads.id, 'roads'); assert.equal(typeof roads.run, 'function'); assert.equal(typeof roads.show, 'function');
  for (const rule of roads.css.split('}').map((r) => r.trim()).filter((r) => r && !r.startsWith('@'))) assert.ok(rule.replace(/^@media[^{]*\{\s*/, '').startsWith('#module[data-module="roads"]'), rule.slice(0, 60));
  assert.equal(typeof roads.show({ engine: {} }, { layout: GOOD }), 'function'); assert.equal(typeof roads.show(null, null), 'function', 'nothing to draw on: only a remover comes back');
});
