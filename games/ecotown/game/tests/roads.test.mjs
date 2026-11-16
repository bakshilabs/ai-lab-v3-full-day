// The "roads" module (js/modules/roads): the street model, the morning's simulation, the freed land, the words and the record.
import test from 'node:test'; import assert from 'node:assert/strict';
import { SLOTS, JUNCTION, HOMES, LINES, BAY_CARS, CARPARK_SPACES, EXIT, emptyLayout, cleanLayout, canPlace, place, counts, crossings, tripsFor, fleetFor, fleetRange, cleanFleet, tripsPerCar, route, simulate, grade, goods, nextStep, timeline, stills, clock, land, cleanPlots, cleanSaved, USES, BEFORE, townSpot, townRun, kindsFor, fitView, SLOW_REAL, FAST_REAL } from '../js/modules/roads/street.js';
import { PIECES, USE, LANDMARKS, measures, resultsHead, comment, whereSay, marks, landSummary, landGain, landClose, landIntro, newHomesAsk, rideStops, rideEnd, madeLines, madeTitle, practised, picture, wait, intro, rules, firstAsk, afterFirst, designAsk, runSay, stillSay, fleetSay, T } from '../js/modules/roads/words.js';
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
  assert.deepEqual(crossings(L('.w.....w..')).map((c) => c.at), [1, -1, 7], 'each safe place knows which crossing serves it');
  assert.deepEqual(crossings(L('.w.....w..'), true).map((c) => c.safe), [true, true, true], 'ages 8–12: one crossing serves everyone');
  assert.deepEqual(crossings(L('..w.......')).map((c) => c.safe), [false, false, false], 'two places away is too far');
  assert.equal(LINES.length, 3);
});

test('roads: the street "before" has no marked crossing, in the model, the record and the picture', () => {
  assert.equal(BEFORE.safe, 0); assert.equal(BEFORE.safe, crossings(BEFORE.layout).filter((c) => c.safe).length, 'the "before" number is the model’s own');
  assert.deepEqual(BEFORE.layout, emptyLayout());
  const res = simulate(GOOD, { families: 30 });
  assert.match(madeLines(GOOD, res, ['homes', 'park', 'garden'], true)[3], /Safe crossings: 3 of 3 \(before: 0 of 3\)/);
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
  assert.equal(nextStep(r), 'drop'); assert.equal(grade(r).wait, 'poor'); assert.deepEqual(r.where, { walk: null, queue: null, wait: null });
  assert.equal(marks(r, true).length, 3, 'only the crossing flags are drawn'); assert.deepEqual(stills(r), []);
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
  const more = simulate(GOOD, { families: 24, extraFamilies: 8 }); assert.equal(more.trips, 32); assert.equal(more.extra, 8); assert.equal(simulate(GOOD, { families: 24 }).extra, 0);
});

test('roads: each number knows where on the street it happened', () => {
  const r = simulate(L('..d.......'), { families: 24 });
  assert.deepEqual(r.where.walk, { home: 9, drop: 2 }, 'the furthest home and the point it walks to');
  assert.equal(Math.abs(r.where.walk.home - r.where.walk.drop) * 25, r.furthestWalk);
  assert.equal(r.where.wait.board - r.where.wait.ready, r.longestWait); assert.equal(r.where.wait.drop, 2);
  assert.equal(r.where.queue.drop, 2); assert.ok(r.where.queue.t > 0);
  const m = marks(r, true); assert.deepEqual(m.map((x) => x.id), ['safe', 'safe', 'safe', 'walk', 'wait', 'queue']);
  assert.match(m[3].text, /Furthest walk: 175 m/); assert.match(m[4].text, /Longest wait: 10 minutes/); assert.match(m[5].text, /Longest queue: 2 cars/);
  assert.ok(m.slice(0, 3).every((x) => x.text === 'No safe crossing' && x.tone === 'warn'));
  const g = marks(simulate(GOOD, { families: 24 }), false); assert.ok(g.slice(0, 3).every((x) => x.text === 'Safe to cross' && x.tone === 'good')); assert.deepEqual(g.slice(0, 3).map((x) => x.slot), [0, 6, 8]);
  for (const j of [true, false]) for (const id of ['wait', 'walk', 'queue', 'safe', 'avg', 'use']) { const line = whereSay(id, r, j); assert.ok(line.length > 20 && line.length < 200, line); assert.doesNotMatch(line, /undefined|NaN|null/); }
  assert.match(whereSay('walk', r, true), /The home opposite the school is furthest from a car: 175 m to the drop-off point by the homes opposite the car park/);
  assert.match(whereSay('queue', simulate(L('d.d.d..d.d'), { families: 24 }), true), /No car had to queue|longest queue/);
});

test('roads: a car’s drive stops at every marked crossing between its start and its end', () => {
  const lay = L('w.d.w.c.d.');
  const r = route(EXIT, 2, lay); assert.equal(r.pauses.length, 2, 'the crossings at places 6 and 4; not the one beyond the drop-off');
  assert.deepEqual(r.pauses.map((p) => p.slot), [6, 4]); assert.equal(r.dur, 8 * 5 + 2 * 12);
  assert.equal(r.pos(0), EXIT); assert.equal(r.pos(r.dur), 2); assert.equal(r.pos(r.dur + 50), 2);
  assert.ok(Math.abs(r.pos(r.pauses[0].from + 6) - 6.6) < 1e-9, 'it waits at the stop line, just before the crossing');
  let last = EXIT; for (let t = 0; t <= r.dur; t += 0.5) { const p = r.pos(t); assert.ok(p <= last + 1e-9, 'it never goes backwards'); last = p; }
  const east = route(2, EXIT, lay); assert.deepEqual(east.pauses.map((p) => p.slot), [4, 6]); assert.equal(east.dur, 8 * 5 + 2 * 12);
  assert.equal(route(3, 3, lay).dur, 0); assert.equal(route(1, 3, L('..........')).pauses.length, 0);
  // the drawing's times are the simulation's own
  const sim = simulate(lay, { families: 24 }); for (const t of sim.log) assert.equal(t.out - t.leave, route(t.drop, EXIT, lay).dur);
});

test('roads: ages 8–12 are graded on the whole minutes they are shown', () => {
  const res = (s) => ({ ...simulate(GOOD, { families: 24 }), longestWait: s });
  assert.equal(wait(200, true), '3 minutes'); assert.equal(grade(res(200), true).wait, 'good', '3 minutes shown, 3 minutes graded');
  assert.equal(wait(209, true), '3 minutes'); assert.equal(grade(res(209), true).wait, 'good');
  assert.equal(wait(211, true), '4 minutes'); assert.equal(grade(res(211), true).wait, 'fair');
  assert.equal(grade(res(389), true).wait, 'fair'); assert.equal(grade(res(391), true).wait, 'poor');
  // the same shown value never reads two ways
  const seen = new Map(); for (let s = 0; s < 900; s++) { const k = wait(s, true), g = grade(res(s), true).wait; if (seen.has(k)) assert.equal(seen.get(k), g, k); seen.set(k, g); }
  // ages 13–17 see seconds and are graded on them
  assert.equal(grade(res(181), false).wait, 'fair'); assert.equal(grade(res(180), false).wait, 'good');
  assert.equal(measures(res(200), true).find((m) => m.id === 'wait').grade, 'good');
});

test('roads: grades and the next thing to try follow the numbers', () => {
  const none = simulate(L('..d.......'), { families: 24 }); assert.equal(nextStep(none), 'safe'); assert.equal(grade(none).safe, 'poor');
  const far = simulate(L('w...d.c.w.'), { families: 24 }); assert.equal(grade(far).walk, 'poor'); assert.equal(nextStep(far), 'walk');
  const noBay = simulate(L('w.d...cdw.'), { families: 24 }); assert.equal(grade(noBay).walk, 'good'); assert.equal(nextStep(noBay), 'bay');
  const good = simulate(GOOD, { families: 24, junior: true }); assert.deepEqual(grade(good, true), { wait: 'good', walk: 'good', queue: 'good', safe: 'good' }); assert.equal(nextStep(good, true), 'none');
  assert.deepEqual(goods(good, true), { good: 4, of: 4 }); assert.deepEqual(goods(none, true), { good: 1, of: 4 });
  const queue = simulate(L('wbbbd.cdw.'), { families: 36 }); assert.ok(['walk', 'queue', 'wait', 'bay', 'none', 'fewer'].includes(nextStep(queue)));
});

test('roads: ages 13–17 choose the number of cars, and it is a real trade-off', () => {
  assert.deepEqual(fleetRange(36), { min: 8, def: 12, max: 18 }); assert.deepEqual(fleetRange(24), { min: 6, def: 8, max: 12 });
  assert.equal(cleanFleet(null, 36), 12); assert.equal(cleanFleet(undefined, 36), 12); assert.equal(cleanFleet(3, 36), 8); assert.equal(cleanFleet(99, 36), 18); assert.equal(cleanFleet('x', 36), 12);
  const lay = L('wbdbb.cdwb'); const at = (f) => simulate(lay, { families: 36, fleet: f });
  assert.equal(at(10).fleet, 10); assert.equal(at(10).cars.length, 10); assert.equal(simulate(lay, { families: 36, fleet: 10, junior: true }).fleet, 12, 'ages 8–12 always have the standard fleet');
  // fewer cars: each does more trips, but people wait longer
  assert.ok(at(8).longestWait > at(10).longestWait && at(10).longestWait >= at(14).longestWait);
  assert.equal(tripsPerCar(at(8)), 4.5); assert.equal(tripsPerCar(at(12)), 3); assert.equal(tripsPerCar(at(18)), 2);
  assert.equal(grade(at(8)).use, 'good'); assert.equal(grade(at(12)).use, 'fair'); assert.equal(grade(at(18)).use, 'poor');
  assert.equal(grade(at(8)).wait, 'fair', 'too few cars: the wait suffers'); assert.equal(nextStep(at(12)), 'fewer');
  // a best street exists, and it is not the default
  assert.deepEqual(goods(at(10)), { good: 5, of: 5 }); assert.equal(nextStep(at(10)), 'none'); assert.ok(goods(at(12)).good < 5);
  const ms = measures(at(12), false, at(10)); assert.equal(ms.length, 6); assert.deepEqual(ms.map((m) => m.id), ['wait', 'walk', 'safe', 'queue', 'avg', 'use']);
  assert.equal(ms[5].value, '3'); assert.equal(ms[5].was, '3.6'); assert.equal(measures(at(12), true).length, 4);
  assert.match(comment(at(12), false), /Each of the 12 cars makes 3 trips\. Try fewer cars/);
  assert.match(fleetSay(10, 36), /10 shared cars for 36 calls: 3\.6 trips for each car/);
  assert.equal('use' in grade(at(12), true), false);
});

test('roads: the morning is shown slowly at first, then fast, and always ends on time', () => {
  for (const s of ['..d.......', 'wbdbb.cdw.']) {
    const res = simulate(L(s), { families: 24 }); const tl = timeline(res);
    assert.ok(tl.slowReal > 0 && tl.slowReal <= SLOW_REAL + 1e-9); assert.equal(tl.total, tl.slowReal + FAST_REAL); assert.ok(tl.total <= 24.001, 'at most 24 seconds on the wall');
    assert.equal(tl.at(0), tl.start); assert.equal(tl.at(tl.total), tl.end); assert.equal(tl.at(999), tl.end); assert.ok(tl.end > res.end);
    let last = -1; for (let r = 0; r <= tl.total; r += 0.1) { const t = tl.at(r); assert.ok(t >= last, 'time never runs backwards'); last = t; }
    assert.ok(tl.at(1) - tl.at(0) <= 20.001, 'the opening runs 20 times faster than life, slow enough to watch');
    assert.ok(tl.start <= res.log.reduce((m, t) => Math.min(m, t.ask), Infinity), 'it opens just before the first call');
  }
  assert.equal(clock(0), '7:30'); assert.equal(clock(29 * 60 + 59), '7:59'); assert.equal(clock(30 * 60), '8:00'); assert.equal(clock(45 * 60), '8:15');
});

test('roads: with reduced motion the morning is two or three still pictures', () => {
  const bad = simulate(L('..d.......'), { families: 24, junior: true }); const s = stills(bad);
  assert.deepEqual(s.map((x) => x.kind), ['first', 'queue', 'wait']); assert.ok(s.every((x) => x.drop === 2 && x.t > 0 && x.t <= bad.end));
  assert.ok(s[2].t >= bad.where.wait.ready && s[2].t < bad.where.wait.board, 'the family is still waiting in the picture');
  const good = stills(simulate(L('dbdbd.cdwb'), { families: 24 })); assert.ok(good.length >= 1 && good.length <= 3); assert.equal(good[0].kind, 'first');
  for (const j of [true, false]) for (const x of s) { const line = stillSay(x, bad, j); assert.match(line, /^\d:\d\d\. /); assert.doesNotMatch(line, /undefined|NaN|null/); assert.ok(line.length < 200); }
  assert.match(stillSay(s[1], bad, true), /The longest queue: 2 cars at the drop-off point by the homes opposite the car park/);
  assert.match(stillSay(s[2], bad, true), /waited 10 minutes/);
});

test('roads: the freed land adds up, and no choice is marked right or wrong', () => {
  const a = land(['homes', 'homes', 'park']);
  assert.equal(a.families, 2 * USES.homes.families); assert.equal(a.play, 250); assert.equal(a.feeds, 0); assert.equal(a.spaces, 10); assert.equal(a.freed, 750); assert.equal(a.done, true);
  assert.deepEqual(a.notChosen, ['garden', 'parking']);
  const b = land(['parking', 'parking', 'parking']); assert.equal(b.spaces, 40); assert.equal(b.freed, 0);
  const c = land(['garden', null, null]); assert.equal(c.done, false); assert.equal(c.chosen, 1); assert.equal(c.feeds, 3);
  assert.equal('score' in a || 'best' in a || 'right' in a, false);
});

test('roads: keeping every plot as parking has its own line, with no "0 m²"', () => {
  for (const j of [true, false]) {
    const all = landClose(['parking', 'parking', 'parking'], j); assert.match(all, /All three plots stay as parking/); assert.match(all, /40 spaces/); assert.match(all, /That is a choice too/); assert.doesNotMatch(all, /0 m²|right/);
    const mix = landClose(['homes', 'parking', 'parking'], j); assert.doesNotMatch(mix, /All three/); assert.match(mix, j ? /no single right answer/ : /250 m² now does a different job/);
    assert.match(rideStops(GOOD, ['parking', 'parking', 'parking'], j).find((s) => s.kind === 'land').text, /kept/);
  }
  assert.match(landClose(['homes', 'park', 'garden'], false), /750 m²/);
});

test('roads: the land choice has a consequence the child can test', () => {
  const lay = L('w.d.b.cdw.'); const before = simulate(lay, { families: 24, junior: true }), after = simulate(lay, { families: 24, extraFamilies: 8, junior: true });
  assert.equal(after.trips, before.trips + 8); assert.ok(after.longestWait > before.longestWait, 'more families, a longer wait on a thin street');
  const sum = landSummary(['homes', 'homes', 'park'], true, { before: before.longestWait, after: after.longestWait });
  assert.match(sum[sum.length - 1], /8 more families will call a car each morning\. Longest wait: \d+ minutes now, \d+ minutes with them/);
  assert.match(newHomesAsk(true, 8), /8 more families.*Run the morning with them/); assert.match(newHomesAsk(false, 8), /Run the morning with them/); assert.match(T.rerun, /Run the morning with the new homes/);
  assert.match(runSay(true, after), /32 families call a car, with the 8 new ones/); assert.match(resultsHead(after, true), /32 families \(8 in the new homes\)/);
  // the number goes into the record
  assert.match(madeLines(lay, after, ['homes', 'homes', 'park'], true)[1], /^Longest wait for a shared car: \d+ minutes, with 8 new families$/);
  assert.doesNotMatch(madeLines(lay, before, ['park', 'park', 'park'], true)[1], /new families/);
  assert.equal(landSummary(['park', 'park', 'garden'], true, null).some((l) => /more families/.test(l)), false, 'no homes, no extra calls');
});

test('roads: every word is short, built in and spoken; ages 8–12 see no money', () => {
  for (const j of [true, false]) {
    const res = simulate(GOOD, { families: 30, junior: j }); const bad = simulate(L('....d.....'), { families: 30, junior: j });
    const all = [intro(j), firstAsk(j, 30), afterFirst(j), ...rules(j), designAsk(j), runSay(j, res), runSay(j, bad), comment(res, j), comment(bad, j), landIntro(j, 10), ...landSummary(['homes', 'park', 'garden'], j, { before: 100, after: 200 }), ...rideStops(GOOD, ['homes', 'park', 'garden'], j, res).map((s) => s.text), ...Object.values(PIECES).map((p) => (j ? p.desc.j : p.desc.s)), ...Object.values(T.stage), ...Object.values(USE).map((u) => (j ? u.gain.j : u.gain.s)), T.keys(3), T.legend.j, T.legend.s];
    for (const line of all) { assert.ok(line && line.length <= 260, line); assert.doesNotMatch(line, /undefined|NaN|null|\bcoins?\b|budget|£|\bcost|cheap|wrong|mistake/i, line); }
    for (const st of Object.values(T.stage)) assert.ok(cleanReport('roads', { stage: st }).stage === st, 'a stage fits the leader’s list');
    const ms = measures(bad, j, res); assert.equal(ms.length, j ? 4 : 6); assert.ok(ms.every((m) => ['good', 'fair', 'poor'].includes(m.grade) && m.value && m.was));
    assert.equal(measures(res, j).every((m) => m.was === null), true, 'a first run has nothing to compare with');
    assert.ok(intro(j).split(/\s+/).length <= 45, 'one short screen before the child starts');
  }
  assert.equal(wait(25, true), 'under 1 minute'); assert.equal(wait(60, true), '1 minute'); assert.equal(wait(185, true), '3 minutes'); assert.equal(wait(185, false), '3\u00a0min 05\u00a0s', 'non-breaking spaces keep a duration on one line'); assert.equal(wait(40, false), '40\u00a0s');
  assert.match(comment(simulate(L('..d....d..'), { families: 24 }), true), /by the shop, on the cycle track and by the school/);
  assert.match(comment(simulate(GOOD, { families: 24, junior: true }), true), /works well/);
  assert.deepEqual(landGain(['homes', 'homes', 'parking']), ['homes for 8 families', '10 visitor spaces']);
  assert.match(landIntro(true, 8), /about the size of a tennis court/); assert.match(USE.park.gain.j, /tennis court/); assert.deepEqual(landGain(['park', 'park', 'garden'], true)[0], 'play space the size of 2 tennis courts');
  assert.match(firstAsk(true, 24), /24 families.*Tap the street/); assert.match(runSay(true, simulate(L('..d.......'), { families: 24 })), /No car has a bay/);
  assert.equal(LANDMARKS.reduce((s, m) => s + m.span, 0), SLOTS, 'the helper strip’s headings cover the ten places'); assert.deepEqual(LANDMARKS.map((m) => m.text), ['Shop', 'Car park', 'Side road', 'Cycle track', 'School']);
  // results heading: how many read Good, and the best so far when this run is below it
  const thin = simulate(L('..d.......'), { families: 24, junior: true });
  assert.match(resultsHead(thin, true, { good: 3, of: 4 }), /Good: 1 of 4\. Best so far: 3 of 4\./); assert.doesNotMatch(resultsHead(thin, true, { good: 1, of: 4 }), /Best so far/); assert.doesNotMatch(resultsHead(thin, true, null), /Best so far/);
});

test('roads: the ride passes each piece the child placed, in order, and its last line fits the result', () => {
  const stops = rideStops(GOOD, ['park', 'park', 'homes'], true, simulate(GOOD, { families: 24, junior: true }));
  assert.deepEqual(stops.map((s) => s.kind || 'edge'), ['edge', 'walk', 'bay', 'drop', 'land', 'cycle', 'drop', 'walk', 'edge'], 'three bays share one caption');
  assert.deepEqual(stops.map((s) => s.at), [...stops.map((s) => s.at)].sort((a, b) => a - b));
  assert.equal(stops.filter((s) => s.pause).length, 6, 'the car stops at two drop-off points, three crossings and the old car park');
  assert.match(stops.find((s) => s.kind === 'land').text, /play space the size of 2 tennis courts/); assert.match(stops.find((s) => s.kind === 'bay').text, /The first of your 3 waiting bays/);
  // "Well planned!" only when every number reads Good
  assert.match(stops[stops.length - 1].text, /3 of 3 crossing places are safe.*Every number is Good\. Well planned!/);
  const poor = simulate(L('....d.....'), { families: 24, junior: true }); const end = rideEnd(poor, true);
  assert.equal(poor.safe, 0); assert.doesNotMatch(end, /Well planned|Good/); assert.match(end, /0 of 3 crossing places are safe, and the longest wait is \d+ minutes/); assert.match(end, /come back and change it/);
  assert.equal(rideStops(L('....d.....'), ['park', 'park', 'park'], true, poor).pop().text, end);
  assert.match(rideEnd(simulate(L('wbdbb.cdwb'), { families: 36, fleet: 10 }), false), /Every number reads Good/); assert.doesNotMatch(rideEnd(simulate(GOOD, { families: 36 }), false), /Every number/);
  assert.equal(typeof rideEnd(null, true), 'string');
});

test('roads: the record is built from what the child did and passes the contract', () => {
  for (const j of [true, false]) {
    const plots = ['homes', 'park', 'garden']; const res = simulate(GOOD, { families: 30, junior: j });
    const pr = practised(GOOD, plots, { runs: 3, changes: 4, rode: true }, j);
    const result = { finished: true, record: { made: { title: madeTitle(j), lines: madeLines(GOOD, res, plots, j), picture: picture(GOOD, plots, res, j) }, practised: pr }, town: { kind: 'roads-street', data: { layout: GOOD, plots, safe: 3 } } };
    const clean = cleanResult(result);
    assert.equal(clean.finished, true); assert.deepEqual(clean.record.made.lines, result.record.made.lines, 'six lines, none cut'); assert.deepEqual(clean.record.practised, pr);
    assert.ok(clean.record.made.picture, 'the picture is accepted'); assert.ok(clean.record.made.picture.length < 200000); assert.deepEqual(clean.town, result.town);
    assert.match(pr[0], /2 drop-off points, 3 waiting bays and 3 crossings/); assert.equal(pr[1], 'testing a design and improving it over 3 runs'); assert.equal(pr[2], 'weighing what freed land is best used for: homes, a park and a market garden');
    assert.match(result.record.made.lines[4], /40 spaces before, 10 now, 10 shared cars/);
    // each line completes "You practised …" (or "I practised …" on the take-home page): no "you", no "your"
    for (const l of pr) { assert.doesNotMatch(l, /\b(you|your|yours|i|my)\b/i, l); assert.doesNotMatch(l, /learn|improved|better at/i, 'what was practised, never what was learned'); assert.match(l, /^[a-z]+ing /, l); }
    const pic = result.record.made.picture; assert.match(pic, /^<svg[\s>]/); assert.match(pic, /Before: 40 parked cars/); assert.match(pic, /After: 10 shared cars/);
    // readable when shown about 220 px wide: no small print
    const sizes = [...pic.matchAll(/font-size="([\d.]+)"/g)].map((m) => +m[1]); assert.ok(sizes.length >= 5 && Math.min(...sizes) >= 17, `smallest text ${Math.min(...sizes)}`);
  }
  const once = practised(L('....d.....'), ['parking', 'parking', 'parking'], { runs: 1, changes: 0, rode: false }, true);
  assert.equal(once.length, 3); assert.match(once[0], /with 1 drop-off point$/); assert.match(once[1], /real numbers/); assert.match(once[2], /visitor parking$/);
  assert.equal(practised(GOOD, ['park', 'park', 'park'], { runs: 5, changes: 0, rode: true }, true)[1], 'testing a design with real numbers: waiting time, walking distance and safe crossings', 'running again without a change is not improving');
});

test('roads: what is kept between visits holds the run count and the best result, and reads old saves', () => {
  const now = { v: 2, stage: 'built', layout: GOOD, plots: ['homes', 'park', 'garden'], runs: 4, changes: 7, best: { good: 3, of: 4 }, fleet: 10, built: true };
  assert.ok(cleanState(now), 'the saved progress fits the contract');
  const s = cleanSaved(cleanState(now), false);
  assert.equal(s.runs, 4, 'the run count survives a resume'); assert.equal(s.changes, 7); assert.deepEqual(s.best, { good: 3, of: 4 }); assert.equal(s.fleet, 10); assert.equal(s.stage, 'built'); assert.equal(s.built, true); assert.deepEqual(s.layout, GOOD);
  assert.match(practised(s.layout, s.plots, { runs: s.runs + 1, changes: s.changes, rode: true }, false)[1], /over 5 runs/);
  const jr = cleanSaved(now, true); assert.equal(jr.fleet, null); assert.equal(jr.layout[6], null, 'ages 8–12 have no cycle crossing');
  const old = cleanSaved({ v: 1, stage: 'land', layout: GOOD, plots: ['homes', null, null] }, false); assert.equal(old.stage, 'land'); assert.equal(old.runs, 0); assert.equal(old.best, null); assert.equal(old.fleet, null); assert.equal(old.built, false);
  assert.equal(cleanSaved(null), null); assert.equal(cleanSaved({ v: 9 }), null); assert.equal(cleanSaved('x'), null);
  const odd = cleanSaved({ v: 2, stage: 'moon', layout: 'x', plots: 3, runs: -4, changes: 'many', best: { good: 9, of: 4 }, fleet: 'lots' }, false);
  assert.deepEqual(odd, { stage: 'design', layout: emptyLayout(), plots: [null, null, null], runs: 0, changes: 0, best: { good: 4, of: 4 }, fleet: null, built: false });
});

test('roads: the street left in the town takes up to three free tiles in a row, on the side nearest the viewer', () => {
  const tiles = new Map(); for (let gx = 0; gx < 6; gx++) for (let gz = 0; gz < 4; gz++) tiles.set(`${gx},${gz}`, { k: `${gx},${gz}`, gx, gz, zone: gx === 0 ? 'river' : 'field', h: 0 });
  tiles.get('5,3').fixed = 'dock';
  const cells = [['3,2', { mark: 'town', item: 'road' }], ['3,1', { mark: 'town', item: 'timber' }], ['2,2', { mark: 'town', item: null }]];
  const run = townRun(cells, tiles); assert.equal(run.keys.length, 3, 'three tiles'); assert.equal(run.axis, 'x');
  for (const k of run.keys) { assert.equal(cells.some(([c]) => c === k), false, 'never on a marked or built tile'); assert.notEqual(tiles.get(k).zone, 'river'); assert.equal(tiles.get(k).fixed, undefined); }
  const [a, b, c] = run.keys.map((k) => tiles.get(k)); assert.ok(a.gz === b.gz && b.gz === c.gz && b.gx === a.gx + 1 && c.gx === b.gx + 1, 'in a row');
  assert.deepEqual(townRun(cells, tiles, [-1, -1]).keys, ['1,0', '2,0', '3,0'], 'the side nearest the viewer');
  assert.deepEqual(townRun(cells, [...tiles.values()]), run, 'a list of tiles works too');
  // level ground is preferred to a row that climbs
  const hilly = new Map([...tiles].map(([k, t]) => [k, { ...t, h: t.gz === 3 ? 0 : t.gx + 2 * t.gz }])); assert.ok(townRun([], hilly).keys.every((k) => k.endsWith(',3')));
  // fewer free tiles: two in a row, then one, then nothing
  const fill = (keep) => [...tiles.keys()].filter((k) => !keep.includes(k)).map((k) => [k, { mark: 'town', item: 'park' }]);
  assert.deepEqual(townRun(fill(['2,1', '2,2']), tiles), { keys: ['2,1', '2,2'], axis: 'z' });
  assert.deepEqual(townRun(fill(['4,0']), tiles), { keys: ['4,0'], axis: 'x' });
  assert.equal(townRun(fill([]), tiles), null); assert.equal(townRun([], new Map()), null); assert.equal(townRun(null, null), null);
  // the single-tile fallback keeps its old rule
  assert.equal(townSpot(cells, tiles), '3,3'); assert.equal(townSpot([], new Map()), null);
});

test('roads: the camera fits the whole scene into the free part of the screen', () => {
  const street = [[-3.5, 0, -10.4], [43.5, 0, -10.4], [-3.5, 0, 13.8], [43.5, 0, 13.8], [-3.5, 5.4, -10.4], [43.5, 5.4, -10.4]]; const dir = [0, Math.sin(0.8), Math.cos(0.8)];
  const full = fitView(street, [20, 0, 1.6], dir, 34, 1.6, { l: 0, r: 1, t: 0, b: 1 }); assert.equal(full.ox, 0); assert.equal(full.oy, 0); assert.ok(full.d > 20 && full.d < 200);
  // a tall tray leaves less room: the camera stands further back and the picture moves up
  const tray = fitView(street, [20, 0, 1.6], dir, 34, 1.6, { l: 0, r: 1, t: 0.12, b: 0.6 }); assert.ok(tray.d > full.d); assert.ok(tray.oy < 0, 'the picture is shifted up, above the tray'); assert.ok(Math.abs(tray.oy - (0.36 - 0.5)) < 1e-9);
  // every point really lands inside the free part
  const check = (pts, target, d3, fov, aspect, free) => {
    const f = fitView(pts, target, d3, fov, aspect, free); const n = Math.hypot(...d3); const D = d3.map((v) => v / n); const fw = D.map((v) => -v); const r = [-fw[2], 0, fw[0]].map((v, _, a) => v / Math.hypot(...a)); const u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]]; const th = Math.tan((fov * Math.PI) / 360);
    for (const p of pts) { const v = p.map((x, i) => x - target[i] - D[i] * f.d); const z = v[0] * fw[0] + v[1] * fw[1] + v[2] * fw[2]; const sx = 0.5 + f.ox + (v[0] * r[0] + v[2] * r[2]) / (z * th * aspect) / 2, sy = 0.5 + f.oy - (v[0] * u[0] + v[1] * u[1] + v[2] * u[2]) / (z * th) / 2; assert.ok(z > 0 && sx >= free.l - 1e-6 && sx <= free.r + 1e-6 && sy >= free.t - 1e-6 && sy <= free.b + 1e-6, `${p} → ${sx.toFixed(3)}, ${sy.toFixed(3)}`); }
    return f;
  };
  check(street, [20, 0, 1.6], dir, 34, 1.6, { l: 0.01, r: 0.99, t: 0.12, b: 0.6 });
  check(street, [20, 0, 1.6], dir, 34, 0.75, { l: 0.01, r: 0.99, t: 0.15, b: 0.7 });
  const plots = [[3.4, 0, 5.2], [20.6, 0, 5.2], [3.4, 0, 13.6], [20.6, 0, 13.6], [3.4, 6.2, 13.6], [20.6, 6.2, 13.6]];
  const landView = check(plots, [12, 0, 9.4], [0, 0.64, 0.77], 34, 1024 / 768, { l: 0.01, r: 0.99, t: 0.2, b: 0.52 }); assert.ok(landView.d < 120);
});

test('roads: the module object and its drawing files load without a page', async () => {
  assert.equal(roads.id, 'roads'); assert.equal(typeof roads.run, 'function'); assert.equal(typeof roads.show, 'function');
  for (const rule of roads.css.split('}').map((r) => r.trim()).filter((r) => r && !r.startsWith('@'))) assert.ok(rule.replace(/^@media[^{]*\{\s*/, '').startsWith('#module[data-module="roads"]'), rule.slice(0, 60));
  assert.equal(typeof roads.show({ engine: {} }, { layout: GOOD }), 'function'); assert.equal(typeof roads.show(null, null), 'function', 'nothing to draw on: only a remover comes back');
  // the crossing and bay chips carry white letters: dark enough to read (at least 4.5 to 1)
  const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  for (const p of Object.values(PIECES)) assert.ok(1.05 / (lum(p.color) + 0.05) >= 4.5, `${p.letter} on ${p.color}`);
});
