// Drones at work: the hour of six missions (js/modules/drone). The rules of each mission, the progress kept between
// visits and the take-home record. The 3D flying and the pages are checked by tests/playwright/drone.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { MISSIONS, IDS, restoreHour, nextMission, isOpen, allDone, finishMission, hourRecord, hourPicture, practisedFor, lineFor } from '../js/modules/drone/missions.js';
import { CHECKS, DAYS, look, dayAnswer, checkReply, dayReply, PLANS, plansFor, planReply, fixReply } from '../js/modules/drone/m1-ground.js';
import { vertical } from '../js/modules/drone/fly-physics.js';
import { TAKEOFF, HOVERS, windAt, course, landing, pickOpen, RING } from '../js/modules/drone/m2-hand.js';
import { FIELDS, plan, result, overlapOf, NEED, tapReply, SICK, sickShare, adviceReply, health, PLOTS, frontOf } from '../js/modules/drone/m4-survey.js';
import { SAFE, SPOT_R, clearance, turbineParts, turbineSpots, bridgeShape, bridgeSpots, photoReply, isDamage, actionFor, actionReply, photoSvg } from '../js/modules/drone/m5-inspect.js';
import { sensorReply, PATTERNS, finds, minutesToFind, covered, W, H, kindReply, SPOTS, extend, TEAM, shortest, passable, SCENES, compareSearch, walkerOf } from '../js/modules/drone/m6-rescue.js';
import { cleanResult, cleanState } from '../js/modules/contract.js';
import mod from '../js/modules/drone/index.js';
import { makeTerrain } from '../js/world/terrain.js';

const terrain = makeTerrain(); const tiles = [...terrain.tiles.values()];

test('the hour: six missions, each a different real use, with its job, how and what the child can now do', () => {
  assert.deepEqual(IDS, ['ground', 'hand', 'delivery', 'survey', 'inspect', 'rescue']);
  assert.equal(mod.title.j, 'Drones at work');
  for (const m of MISSIONS) { assert.ok(m.open.length > 40 && m.after.startsWith('You can now'), m.id); assert.ok(m.how.j && m.how.s, m.id); }
  assert.equal(new Set(MISSIONS.map((m) => m.use)).size, 6);
});

test('progress: missions open in order, a finished one can be played again, and the hour is finished only with all six', () => {
  let st = restoreHour(null); assert.equal(nextMission(st), 'ground'); assert.ok(isOpen(st, 'ground')); assert.ok(!isOpen(st, 'hand'));
  st = finishMission(st, 'ground', { checked: 3 }); assert.ok(isOpen(st, 'hand') && isOpen(st, 'ground') && !isOpen(st, 'delivery'));
  for (const id of IDS.slice(1, 5)) st = finishMission(st, id, {}); assert.ok(!allDone(st));
  st = finishMission(st, 'rescue', { sensor: 'heat' }); assert.ok(allDone(st)); assert.equal(nextMission(st), null);
  // a replay keeps the newest summary and the order of the list
  st = finishMission(st, 'ground', { checked: 3, fixed: 2 }); assert.deepEqual(st.done, IDS); assert.equal(st.sum.ground.fixed, 2);
  // what is saved is small, and comes back the same
  assert.ok(JSON.stringify(st).length < 8000); assert.deepEqual(restoreHour(cleanState(st)).done, IDS);
  // the first version's progress (the delivery alone) becomes the delivery mission's own; nothing counts as done
  const old = restoreHour({ v: 2, done: true, round: 1, used: ['3,4'] }); assert.deepEqual(old.done, []); assert.equal(old.m3.round, 1);
  // nonsense is dropped
  assert.deepEqual(restoreHour({ v: 3, done: ['ground', 'fly', 7] }).done, ['ground']);
});

test('the record: one line per mission, two to four practised lines, a small picture, and it passes the contract', () => {
  let st = restoreHour(null); const sums = { ground: { checked: 3, fixed: 2, grounded: 1, jobs: 6 }, hand: { hover: 80, wind: 24, hoops: 4, of: 4, landing: 1.2 }, delivery: { line: 'from the market to the school: 9 steps, 20 tiles.' }, survey: { lanes: 3, overlap: 60 }, inspect: { photos: 6, close: 0, found: 2 }, rescue: { sensor: 'heat', pattern: 'square', path: 18 } };
  for (const id of IDS) st = finishMission(st, id, sums[id]);
  for (const junior of [true, false]) {
    const rec = hourRecord(st, junior, hourPicture(st));
    assert.equal(rec.made.lines.length, 6); assert.ok(rec.made.lines.every((l) => l.length <= 120), rec.made.lines.join('\n'));
    assert.ok(rec.practised.length >= 2 && rec.practised.length <= 4); assert.ok(rec.practised.every((l) => l.length <= 120 && !/learn/.test(l)));
    const r = cleanResult({ finished: true, record: rec, town: { kind: 'drone-route', data: { v: 1 } } }); assert.equal(r.finished, true); assert.ok(r.record.made.picture.startsWith('<svg'));
    assert.ok(rec.made.picture.length < 20000);
  }
  assert.match(lineFor('hand', sums.hand, false), /24 km\/h/); assert.doesNotMatch(lineFor('hand', sums.hand, true), /km\/h|m\/s/);
  // with no summary, a line says what the mission is, never a result the child did not have
  for (const id of IDS) for (const j of [true, false]) { const l = lineFor(id, {}, j); assert.ok(l.length <= 120, l); assert.doesNotMatch(l, /\b\d+\b/, l); }
  assert.ok(lineFor('rescue', { pattern: 'square', searches: 2, path: 35 }, false).length <= 120);
  assert.equal(practisedFor(restoreHour(null)).length, 0);
});

test('ground school: four days with a different problem each; replies point where to look before they tell', () => {
  assert.deepEqual(DAYS.map(dayAnswer), ['fly', 'fly', 'stay', 'fly']); assert.equal(DAYS[3].state.area, 'people');
  for (const d of DAYS) for (const c of CHECKS) { assert.ok(look(c, d.state[c], true).length > 10); assert.ok(look(c, d.state[c], false).length > 10); }
  assert.doesNotMatch(look('weather', 'gale', true), /km\/h|\d/); assert.match(look('weather', 'gale', false), /km\/h/);
  const first = checkReply('props', 'chipped', 'ok', 0); assert.equal(first.right, false); assert.match(first.text, /Look again/); assert.doesNotMatch(first.text, /chip/);
  const second = checkReply('props', 'chipped', 'ok', 1); assert.ok(second.told); assert.match(second.text, /chip/);
  assert.equal(checkReply('battery', 'ok', 'ok', 0).right, true);
  assert.match(dayReply(DAYS[2], 'fly', 0).text, /Look at the checks again/); assert.equal(dayReply(DAYS[2], 'stay', 0).right, true);
});

test('ground school: flight plans judged against the Drone Code, airfields and emergencies included', () => {
  assert.equal(plansFor(true).length, 8); assert.equal(plansFor(false).length, 9); assert.ok(PLANS.some((p) => p.id === 'airfield' && p.answer === 'no'));
  assert.match(PLANS.find((p) => p.id === 'cliffs').rule, /Many nesting birds are protected by law/); assert.doesNotMatch(PLANS.find((p) => p.id === 'cliffs').rule, /Disturbing wild birds .* is against the law/);
  assert.match(planReply(PLANS.find((p) => p.id === 'airfield'), 'no', 0, false).text, /safety map/); assert.doesNotMatch(planReply(PLANS.find((p) => p.id === 'airfield'), 'no', 0, true).text, /safety map/); assert.deepEqual([...new Set(PLANS.map((p) => p.answer))].sort(), ['change', 'fly', 'no']);
  for (const p of PLANS) {
    const wrong = ['fly', 'no', 'change'].find((x) => x !== p.answer);
    assert.match(planReply(p, wrong, 0).text, /^Look again/); assert.ok(planReply(p, wrong, 1).told);
    if (p.answer === 'change') { assert.equal(fixReply(p, p.fixes[0].id, 0).right, true); assert.equal(fixReply(p, p.fixes[1].id, 0).right, false); }
  }
  assert.match(PLANS.find((p) => p.id === 'high').rule, /120 metres/); assert.match(PLANS.find((p) => p.id === 'sight').rule, /see it/);
});

test('hand flying: a course on open ground, two winds, and honest landings', () => {
  const spot = pickOpen([], tiles); assert.ok(spot && terrain.tiles.get(spot.k).zone !== 'river');
  const busy = tiles.filter((t) => t.zone !== 'river' && !t.fixed).slice(0, 60).map((t) => [t.k, { mark: 'town', item: 'timber' }]);
  const s2 = pickOpen(busy, tiles); assert.ok(s2 && !busy.some(([k]) => k === s2.k));
  const c = course(spot); assert.equal(c.hoops.length, 4); assert.ok(new Set(c.hoops.map((h) => h.h)).size >= 3); // different heights
  assert.ok(TAKEOFF.lo < TAKEOFF.hi && RING > 2);
  const w0 = windAt(0, 1), w1 = [0, 1, 2, 3, 4, 5].map((t) => windAt(1, t).kmh); assert.ok(w0.x > 0 && Math.abs(w0.z) < 1e-9); assert.ok(Math.max(...w1) > HOVERS[1].kmh && Math.min(...w1) < HOVERS[1].kmh);
  // every landing counts, however gently it comes down (review: slow descents used to rest on the pad without landing)
  for (const fps of [60, 30, 15]) for (const tap of [0, 0.15, 0.4, 0.8, 3]) {
    const S = { y: 3, vy: 0, floor: 0, airborne: true }; let t = 0, press = 0, touched = null; const dt = 1 / fps;
    for (let i = 0; i < fps * 60 && touched === null; i++) { t += dt; if (Math.abs(S.vy) < 0.05 && t > press + 0.1) press = t + tap; touched = vertical(S, tap === 0 ? (S.y > 0.5 ? -1 : 0) : t < press ? -1 : 0, dt); if (tap === 0 && S.y <= 0.5 && Math.abs(S.vy) < 0.01) { /* let go near the pad: it settles */ } }
    assert.ok(touched !== null, `fps ${fps}, taps of ${tap}s: no landing`); if (tap <= 0.4 && tap > 0) assert.ok(touched < 1.8, `fps ${fps} taps ${tap}: ${touched}`);
  }
  { const S = { y: 0, vy: 0, floor: 0, airborne: false }; assert.equal(vertical(S, 0, 1 / 60), null); vertical(S, 1, 0.5); assert.ok(S.y > 0); } // resting: no landing; climbing works
  assert.equal(landing(1, 0).kind, 'soft'); assert.equal(landing(2.2, 1).kind, 'firm'); assert.equal(landing(4, 0).ok, false); assert.equal(landing(1, 4).kind, 'off');
});

test('farm survey: overlap, gaps and the battery decide whether the photos join', () => {
  const [meadow, farm] = FIELDS;
  assert.equal(overlapOf(2), 60); assert.equal(overlapOf(5), 0);
  assert.ok(plan(meadow, { spacing: 6 }).gaps > 0); assert.equal(result(meadow, plan(meadow, { spacing: 6 })).kind, 'gaps');
  assert.equal(result(meadow, plan(meadow, { spacing: 4 })).kind, 'overlap'); assert.equal(result(meadow, plan(meadow, { spacing: 2 })).ok, true);
  // the farm: only lines along the long side, close enough, fit the battery with enough overlap
  const ok = []; for (const dir of farm.dirs) for (const spacing of [1, 2, 3, 4, 5, 6]) if (result(farm, plan(farm, { dir, spacing })).ok) ok.push(`${dir}${spacing}`);
  assert.deepEqual(ok, ['ew2']); assert.equal(result(farm, plan(farm, farm.start)).kind, 'battery');
  assert.match(result(farm, plan(farm, { dir: 'ew', spacing: 2 }), false).text, /60% overlap/); assert.doesNotMatch(result(farm, plan(farm, { dir: 'ew', spacing: 2 }), true).text, /%/);
  assert.ok(NEED >= 60);
  // ages 13-17 also need the photos to overlap along the line
  assert.equal(frontOf(1), 75); assert.equal(result(farm, plan(farm, { dir: 'ew', spacing: 2, along: 2 }), false).kind, 'front'); assert.equal(result(farm, plan(farm, { dir: 'ew', spacing: 2, along: 1 }), false).ok, true);
});

test('farm survey: reading the map, with the sick patch only seen in the health view', () => {
  assert.equal(tapReply('dry', 2, 2, 'normal', 0).right, true); assert.equal(tapReply('dry', 12, 7, 'normal', 0).right, false);
  assert.match(tapReply('sick', 0, 6, 'normal', 0).text, /health view/);
  assert.equal(tapReply('sick', SICK.x, SICK.z, 'health', 0).right, true);
  assert.ok(health(SICK.x, SICK.z) < 0.45 && health(14, 7) > 0.75); assert.ok(health(0, 8) > 0.6 && health(0, 8) < 0.75); // a stressed corner that is not the sick patch
  assert.equal(sickShare(), Math.round(9 / 40 * 100)); assert.equal(PLOTS.length, 4);
  assert.equal(adviceReply('target').right, true); assert.equal(adviceReply('all').right, false);
});

test('inspection: every photo point can be reached from a safe distance, and only the damage counts', () => {
  const base = { x: 0, y: 2, z: 0 }; const parts = turbineParts(base);
  for (const s of turbineSpots(base)) assert.ok(clearance(s.at, parts) >= SAFE + SPOT_R - 0.3, `${s.id} ${clearance(s.at, parts)}`);
  const b = bridgeShape({ x: 42, y: 3, z: -0 }); for (const s of bridgeSpots(b)) assert.ok(clearance(s.at, b.parts) >= SAFE + SPOT_R - 0.3, `${s.id} ${clearance(s.at, b.parts)}`);
  assert.ok(clearance({ x: 0, y: 12, z: 0.5 }, parts) < 0); // inside the tower
  assert.deepEqual(turbineSpots(base).filter((s) => isDamage(s.photo)).length, 1); assert.equal(bridgeSpots(b).filter((s) => isDamage(s.photo)).length, 1);
  const r1 = photoReply('hub-bird', 0, 'the tip'); assert.equal(r1.right, false); assert.doesNotMatch(r1.text, /the tip/);
  assert.match(photoReply('hub-bird', 1, 'the tip').text, /the tip/); assert.equal(photoReply('blade-crack', 0, '').right, true);
  assert.equal(actionFor('blade-crack'), 'now'); assert.equal(actionFor('wood-crack'), 'watch'); assert.equal(actionReply('wood-crack', 'now').right, false);
  for (const ph of ['blade-clean', 'blade-crack', 'hub-bird', 'wood-moss', 'wood-clean', 'wood-crack']) assert.match(photoSvg(ph, { scale: true, ring: true }), /^<svg[^]*<\/svg>$/);
});

test('search and rescue: the heat camera, two real patterns with honest times, warm animals, and a safe way for the team', () => {
  assert.equal(sensorReply('heat', 0).right, true); assert.equal(sensorReply('camera', 0).told, false); assert.equal(sensorReply('zoom', 1).told, true);
  for (const p of PATTERNS) { const path = p.path(); assert.equal(covered(path).size, W * H, p.id); assert.ok(finds(path).some((f) => f.spot.id === 'walker')); }
  const sq = minutesToFind(PATTERNS[0].path()), ln = minutesToFind(PATTERNS[1].path()); assert.ok(sq < ln, `${sq} ${ln}`);
  // the second search (ages 13-17): no last sighting, so the lines are quicker; each pattern is a real choice
  assert.equal(compareSearch(SCENES[0], 'square').best, 'square'); assert.equal(compareSearch(SCENES[1], 'lines').best, 'lines');
  for (const sc of SCENES) { assert.ok(shortest(sc) > 0, sc.id); assert.ok(passable(walkerOf(sc).x, walkerOf(sc).z, sc)); for (const p of PATTERNS) { const f = finds(p.path(sc), sc); assert.ok(f.findIndex((x) => x.spot.kind === 'animal') < f.findIndex((x) => x.spot.kind === 'person'), `${sc.id} ${p.id}`); } }
  assert.doesNotMatch(sensorReply('camera', 0).text, /almost nothing/);
  assert.equal(kindReply(SPOTS[0], 'person', 0).right, false); assert.equal(kindReply(SPOTS[0], 'person', 1).told, true);
  const walker = SPOTS.find((s) => s.id === 'walker'); assert.ok(passable(walker.x, walker.z)); assert.ok(shortest() > 0);
  assert.equal(extend([TEAM], TEAM.x + 2, TEAM.z).ok, false); // not next to the end
  assert.match(extend([{ x: 5, z: 4 }], 6, 4).text, /bridge/); assert.match(extend([{ x: 8, z: 4 }], 7, 4).text, /crags/);
  const back = extend([TEAM, { x: 2, z: 8 }], 1, 8); assert.equal(back.path.length, 1); // stepping back takes the last square off
});
