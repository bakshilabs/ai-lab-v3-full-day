// The "roads" module's six missions (js/modules/roads): the mission list and what is kept, each mission's rules,
// the honest feedback (never the answer on the first miss), and the hour's record.
import test from 'node:test'; import assert from 'node:assert/strict';
import { MISSIONS, cleanHub, openable, nextUp, allDone, streetResult, hourLines, hourPractised, hourTitle, hourPicture } from '../js/modules/roads/missions.js';
import { SENSORS, ROUNDS, roundsFor, m1Line, answer, check, missSay, cover, kitSay, sees } from '../js/modules/roads/sensors.js';
import { EASY, HARD, CASES, TEST, test as carTest, testFor, hardFor, m2Line, reviewSay, LABELS } from '../js/modules/roads/labels.js';
import { SCENES, scenesFor, resultSay, stopM, HUMAN_M } from '../js/modules/roads/rules.js';
import { START, STAGES, runAll, day, changed, cleanCfg, runSay as simSay } from '../js/modules/roads/simtest.js';
import { simulate as fleetSim, fleetSay, ROUNDS as FLEET, meets, cleanPlan, curve, travel, CALLS, shareWords } from '../js/modules/roads/fleet.js';
import { cameraView, radarView, lidarView, boxOf } from '../js/modules/roads/art.js';
import { scenePic } from '../js/modules/roads/m3-rules.js';
import { cleanResult, cleanState } from '../js/modules/contract.js';

const L = (s) => [...s].map((c) => ({ d: 'drop', b: 'bay', w: 'walk', c: 'cycle' }[c] || null));

test('roads missions: six missions in the curriculum’s order, each with its job, how and what the child can now do', () => {
  assert.deepEqual(MISSIONS.map((m) => m.use), ['How a self-driving car sees', 'Teaching the car to recognise things', 'Rules of the road', 'Testing in simulation', 'A shared fleet', 'Redesigning the street']);
  for (const m of MISSIONS) for (const k of ['job', 'how', 'now']) for (const j of ['j', 's']) { assert.ok(m[k][j].length > 20 && m[k][j].length < 260, `${m.id} ${k}`); assert.doesNotMatch(m[k][j], /£|coins?|budget/i); }
});

test('roads missions: missions open in order; finished ones can be replayed; old saves become mission 6', () => {
  assert.deepEqual(openable([false, false, false, false, false, false]), [true, false, false, false, false, false]);
  assert.deepEqual(openable([true, true, false, false, false, false]), [true, true, true, false, false, false]);
  assert.equal(nextUp([true, true, false, false, false, false]), 3); assert.equal(nextUp(Array(6).fill(true)), null); assert.ok(allDone(Array(6).fill(true)));
  const old = { v: 2, stage: 'design', layout: L('.bd..wc...'), plots: ['park', null, null], runs: 2, changes: 1 };
  const h = cleanHub(old, true); assert.deepEqual(h.done, Array(6).fill(false)); assert.equal(h.m6, old);
  const bad = cleanHub({ v: 3, done: [true, 'yes', true], rec: { 1: { first: 3 }, 9: {} }, m6: { v: 9 } }); assert.deepEqual(bad.done, [true, false, true, false, false, false]); assert.deepEqual(Object.keys(bad.rec), ['1']); assert.equal(bad.m6, null);
  assert.deepEqual(cleanHub(null).done, Array(6).fill(false));
});

test('roads mission 1: each round has one clear answer, and a wrong answer gets a hint, not the answer, until the third miss', () => {
  assert.deepEqual(ROUNDS.map((r) => answer(r).join('+')), ['camera', 'radar+lidar', 'radar', 'radar', 'camera+lidar', 'radar+lidar', 'lidar']);
  assert.equal(roundsFor(true).length, 5); assert.equal(roundsFor(false).length, 7, 'ages 13–17 also measure range and see through spray');
  assert.equal(sees('camera', { kind: 'person', z: 30 }, 'rain'), false, 'spray blurs far things for the camera, as mission 4 says');
  for (const r of ROUNDS) {
    const wrong = SENSORS.filter((s) => !answer(r).includes(s)).slice(0, 1); const res = check(r, wrong.length ? wrong : []);
    assert.equal(res.right, false);
    for (const j of [true, false]) {
      for (const n of [1, 2]) { const t = missSay(r, res, n, j); for (const s of answer(r)) if (!wrong.includes(s)) assert.doesNotMatch(t, new RegExp(`answer is|Answer:`, 'i')); }
      assert.match(missSay(r, res, 3, j), /answer is|Answer:/i);
    }
    assert.ok(check(r, answer(r)).right);
  }
  // what each picture shows agrees with the answer: the camera loses the person in the dark, radar sees through fog
  assert.equal(sees('camera', ROUNDS[1].target, 'dark'), false); assert.equal(sees('radar', ROUNDS[2].target, 'fog'), true); assert.equal(sees('lidar', ROUNDS[2].target, 'fog'), false);
  for (const r of ROUNDS) for (const v of [cameraView, radarView, lidarView]) assert.match(v([...r.things, r.target], r.cond), /^<rect/);
});

test('roads mission 1: all three sensors leave the fewest gaps, and Florence says so honestly', () => {
  const g = (k) => cover(k).gaps;
  assert.ok(g(['camera', 'radar', 'lidar']) < g(['camera', 'radar'])); assert.ok(g(['camera', 'radar']) < g(['camera']));
  assert.equal(g(['camera', 'radar', 'lidar']), 2, 'thick fog still hides far shapes and signs from every sensor');
  assert.match(kitSay(['camera'], true), /gaps/); assert.match(kitSay(['camera'], false), /^Camera: /, 'sensor names start with a capital');
  assert.doesNotMatch(m1Line({ first: 0, rounds: 5, kit: ['radar'] }, true), /of 5|1 sensors|first time/); assert.match(m1Line({ rounds: 5, kit: ['radar'] }, true), /chose radar/); assert.match(kitSay(['camera', 'radar', 'lidar'], false), /fog/);
});

test('roads mission 2: training on everyday pictures misses the hard cases; labelling the edge cases fixes them', () => {
  const lab = (pics) => pics.flatMap((p) => p.things.map((t) => ({ case: t.case, label: CASES[t.case].label })));
  const a = carTest(lab(EASY)), b = carTest(lab([...EASY, ...HARD]));
  assert.equal(a.of, TEST.length); assert.ok(a.right < b.right); assert.equal(b.right, TEST.length);
  assert.equal(a.rows.find((r) => r.case === 'mirror').ok, false); assert.equal(a.rows.find((r) => r.case === 'person').ok, true);
  // the second test is on fresh pictures with two new hard cases nobody labelled: never 100%
  for (const j of [true, false]) {
    const t2 = carTest(lab([...EASY, ...hardFor(j)]), testFor(j, 2));
    assert.equal(t2.of - t2.right, 2, 'the two new cases fail'); assert.ok(t2.rows.some((r) => r.case === 'scooter' && !r.ok));
    assert.ok(!testFor(j, 1).includes('scooter'));
    assert.doesNotMatch(m2Line({ labels: 16, pics: 6, hard: 5, a: 4, aOf: 9, b: 9, bOf: 11 }, j), /100%/);
  }
  assert.equal(carTest(lab(EASY), testFor(false, 1)).falseAlarms, 2, 'reflection and poster are false alarms'); assert.equal(testFor(false, 1).length, 10);
  assert.match(reviewSay(EASY[0], new Set(), {}, 1, true).text, /There are 3 more things/);
  // a wrong label teaches nothing about that case
  assert.equal(carTest([{ case: 'mirror', label: 'person' }]).rows.find((r) => r.case === 'mirror').ok, false);
  for (const pic of [...EASY, ...HARD]) for (const t of pic.things) { assert.ok(LABELS.includes(CASES[t.case].label)); const bx = boxOf(t); assert.ok(bx.w > 10 && bx.h > 10 && bx.x > -20 && bx.x + bx.w < 840, `${t.kind} box on the picture`); }
});

test('roads mission 2: the reviewer never points at a missed thing on the first miss', () => {
  const pic = HARD[0]; const found = new Set(['a']); const labels = { a: 'car' };
  const r1 = reviewSay(pic, found, labels, 1, true); assert.equal(r1.ok, false); assert.doesNotMatch(r1.text, /van|left|right/);
  assert.match(reviewSay(pic, found, labels, 2, true).text, /van/);
  assert.equal(reviewSay(pic, found, labels, 3, true).reveal, 'b');
  const all = new Set(pic.things.map((t) => t.id)); const right = Object.fromEntries(pic.things.map((t) => [t.id, CASES[t.case].label]));
  assert.equal(reviewSay(pic, all, right, 1, false).ok, true);
  const wrong = { ...right, b: 'notreal' }; assert.doesNotMatch(reviewSay(pic, all, wrong, 1, true).text, /person/i); assert.equal(reviewSay(pic, all, wrong, 3, true).fix, 'person');
});

test('roads mission 3: the safe choices are the Highway Code’s, and stopping distances are the code’s', () => {
  assert.deepEqual([stopM(20), stopM(30), stopM(40)], [8, 17, 28], 'braking 6/14/24 m plus 0.2 s of reaction'); assert.deepEqual(HUMAN_M, { 20: 12, 30: 23, 40: 36 }, 'Highway Code typical stopping distances');
  const safe = Object.fromEntries(SCENES.map((s) => [s.id, s.opts.filter((o) => s.safe(o.v)).map((o) => o.v)]));
  assert.deepEqual(safe, { zebra: ['stop'], school: [20], cyclist: [1.5, 2], narrow: ['wait'], rain: [4], turn: ['person'], ambulance: ['pull'], ice: [20] });
  assert.equal(scenesFor(true).length, 7); assert.equal(scenesFor(false).length, 8, 'ages 13–17 also get the icy road');
  assert.ok(SCENES.some((sc) => sc.opts.some((o) => !sc.safe(o.v) && /stop/.test(o.v))), 'one scene where stopping dead is wrong: caution is not always safe');
  for (const s of SCENES) for (const o of s.opts) {
    for (const j of [true, false]) {
      const t1 = resultSay(s, o.v, 1, j); if (!s.safe(o.v)) assert.doesNotMatch(t1, /safe choice is|Safe setting/);
      assert.ok(scenePic(s.id, o.v, 0.5, s.safe(o.v)).length > 500);
    }
  }
});

test('roads mission 4: the factory car fails, each stage needs a new change, and two changes at once are named', () => {
  assert.ok(runAll(STAGES[0], START).some((r) => !r.pass));
  let cfg = { ...START, gap: 4, sensors: 'cr' }; assert.ok(runAll(STAGES[0], cfg).every((r) => r.pass)); assert.ok(runAll(STAGES[1], cfg).some((r) => !r.pass));
  cfg = { ...cfg, speed: 20, brake: 'maybe' }; assert.ok(runAll(STAGES[1], cfg).every((r) => !r.pass), 'braking for anything means too many needless stops');
  cfg = { ...cfg, brake: 'fairly' }; assert.ok(runAll(STAGES[1], cfg).every((r) => r.pass)); assert.ok(runAll(STAGES[2], cfg).some((r) => !r.pass));
  cfg = { ...cfg, sensors: 'crl' }; assert.ok(runAll(STAGES[2], cfg).every((r) => r.pass));
  assert.deepEqual(changed(START, { ...START, gap: 4 }), ['gap']);
  assert.match(simSay(runAll(STAGES[0], { ...START, gap: 4, speed: 20 }), runAll(STAGES[0], START), ['gap', 'speed'], START, START, true), /cannot tell/);
  assert.deepEqual(cleanCfg({ speed: 99, gap: '4' }), { ...START, gap: 4 });
  assert.equal(day('sunny', START).near, 0);
});

test('roads mission 5: more cars cut the wait, waiting near the homes cuts empty driving, and each round can be won', () => {
  const at = (n, extra = {}) => fleetSim({ cars: n, spots: ['depot'], ...extra });
  assert.ok(at(4).longest > at(8).longest && at(8).longest > at(12).longest);
  assert.ok(meets(FLEET[0], at(11)) && !meets(FLEET[0], at(4)));
  const near = fleetSim({ cars: 8, spots: ['homesW', 'homesN'] }); assert.ok(near.emptyPct < at(8).emptyPct); assert.ok(meets(FLEET[1], near));
  assert.ok(meets(FLEET[2], fleetSim({ cars: 11, spots: ['homesW', 'homesN'], charger: 'shops' }, { charge: true })), 'the test’s plan for round 3 meets the goal');
  assert.ok(!meets(FLEET[2], fleetSim({ cars: 11, spots: ['homesW', 'homesN'], charger: 'depot' }, { charge: true })), 'a charger at the depot means too much empty driving');
  assert.equal(curve({ cars: 4, spots: ['depot'] }, false).length, 13);
  const peak = (pl) => fleetSim(pl, { charge: true, peak: true });
  assert.ok(!meets(FLEET[3], peak({ cars: 11, spots: ['homesW', 'homesN'], charger: 'shops' })), 'the peak round needs a re-plan');
  assert.ok(meets(FLEET[3], peak({ cars: 11, spots: ['homesN', 'station'], charger: 'station' })), 'cars waiting at the station meet it');
  assert.equal(FLEET[3].only, 's');
  assert.deepEqual(cleanPlan({ cars: 99, spots: ['x', 'shops', 'station', 'homesN'] }), { cars: 14, spots: ['shops', 'station'], charger: 'depot' });
  assert.equal(travel('homesW', 'depot'), 9); assert.ok(CALLS.length >= 25); assert.equal(shareWords(48), 'half or a little less'); assert.equal(shareWords(52), 'just over half', '52% fails a no-more-than-half goal, and the words say so');
  const at8 = fleetSim({ cars: 8, spots: ['homesW', 'homesN'] }); assert.doesNotMatch(fleetSay(FLEET[1], at8, null, { cars: 8, spots: ['homesW', 'homesN'] }, true), /Could fewer do/, 'no fewer-cars nudge at the smallest fleet that works');
});

test('roads missions: the hour’s record passes the contract and fits the save', () => {
  const families = 24; const m6 = { v: 2, stage: 'design', layout: L('wbdbb.cdw.'), plots: ['homes', 'park', 'garden'], runs: 3, changes: 4, best: null, fleet: null, built: false };
  for (const j of [true, false]) {
    const st = streetResult(m6, families, j); assert.ok(st.res.ran);
    const rec = { 1: { first: 4, kit: ['camera', 'radar', 'lidar'], gaps: 2 }, 2: { labels: 16, pics: 6, hard: 7, a: 4, b: 9 }, 3: { rules: 6, first: 5 }, 4: { runs: 8, cfg: { speed: 20, gap: 4, sensors: 'crl', brake: 'fairly' } }, 5: { cars: 11, spots: ['homesW', 'homesN'], charger: 'shops', longest: 8, emptyPct: 54 }, 6: { runs: 3 } };
    const lines = hourLines(rec, j, st); assert.equal(lines.length, 6); for (const l of lines) { assert.ok(l.length <= 120); assert.doesNotMatch(l, /undefined|NaN/); }
    const pr = hourPractised(rec, j, st); for (const l of pr) assert.doesNotMatch(l, /\byou\b|\byour\b|undefined/i);
    const r = cleanResult({ finished: true, record: { made: { title: hourTitle(j), lines, picture: hourPicture(st, j) }, practised: pr }, town: { kind: 'roads-street', data: { layout: st.layout } } });
    assert.equal(r.finished, true); assert.equal(r.record.made.lines.length, 6); assert.ok(r.record.made.picture);
    if (j) for (const l of lines) assert.doesNotMatch(l, /%/, 'ages 8–12 see no percentages');
    assert.ok(cleanState({ v: 3, done: Array(6).fill(true), rec, m6 }), 'the whole save fits in 8 KB');
  }
});
