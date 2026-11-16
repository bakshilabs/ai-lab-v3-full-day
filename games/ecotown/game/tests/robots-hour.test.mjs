// Robots at work (js/modules/robots): the hour's six missions, their rules and what the record says. No page, no 3D.
import test from 'node:test'; import assert from 'node:assert/strict';
import { MISSIONS, cleanProgress, fresh, open, nextMission, allDone, stageOf, pick } from '../js/modules/robots/missions.js';
import * as M1 from '../js/modules/robots/m1-sense.js';
import * as M2 from '../js/modules/robots/m2-arm.js';
import * as M3 from '../js/modules/robots/m3-rules.js';
import * as M5 from '../js/modules/robots/m5-weeds.js';
import * as M6 from '../js/modules/robots/m6-flood.js';
import { missionLine, hourRecord, hourPicture, practisedLines } from '../js/modules/robots/record.js';
import { cleanResult, cleanState, cleanReport } from '../js/modules/contract.js';
import mod from '../js/modules/robots/index.js';

const WORDS = (s) => s.split(/\s+/).length;
test('six missions, each a different real job, with an opening line, how to play and what the child can now do', () => {
  assert.equal(MISSIONS.length, 6); assert.deepEqual(MISSIONS.map((m) => m.n), [1, 2, 3, 4, 5, 6]);
  assert.equal(new Set(MISSIONS.map((m) => m.use)).size, 6);
  for (const m of MISSIONS) for (const j of [true, false]) {
    assert.ok(pick(m.job, j).length > 40 && pick(m.can, j).startsWith('You can now'), m.id);
    assert.ok(pick(m.how, j).length >= 2); for (const s of [pick(m.job, j), ...pick(m.how, j), pick(m.can, j)]) { assert.doesNotMatch(s, /coin|budget|£|\$|catch|wrong on purpose/i, s); if (j) for (const sent of s.split(/(?<=[.!?])\s+/)) assert.ok(WORDS(sent) <= 22, `long sentence for 8–12: ${sent}`); }
  }
  assert.equal(mod.title.j, 'Robots at work'); assert.ok(mod.blurb.j.length <= 80 && mod.blurb.s.length <= 80);
  for (let n = 1; n <= 6; n++) assert.ok(cleanReport('robots', { stage: stageOf(n, 'checking the robot’s confidence in the carrot field') }).stage.length <= 80);
});

test('progress: missions open in order, finished ones replay, a bad or foreign save starts again', () => {
  const p = fresh(true); assert.ok(open(p.done, 1)); assert.ok(!open(p.done, 2)); assert.equal(nextMission(p.done), 1);
  p.done = [1, 1, 0, 0, 0, 0]; assert.ok(open(p.done, 1) && open(p.done, 3) && !open(p.done, 4)); assert.equal(nextMission(p.done), 3);
  assert.equal(cleanProgress(null, true).done.join(), '0,0,0,0,0,0');
  assert.equal(cleanProgress({ v: 2, plays: 3 }, true).plays, 3, 'the first version’s save keeps its play count only');
  const s = { v: 3, j: true, plays: 1, done: [1, 0, 1, 0, 0, 0], sum: { 1: { mr: 1 }, 3: { rules: [] } }, cur: { n: 5, part: 1, d: {} } };
  const c = cleanProgress(s, true); assert.deepEqual(c.done, [1, 0, 0, 0, 0, 0], 'a tick after a gap is not believed'); assert.equal(c.cur, null, 'a mission that is not open cannot be resumed');
  assert.equal(cleanProgress({ ...s, done: [1, 1, 1, 1, 1, 1] }, true).done.join(), '1,0,0,0,0,0', 'a tick without its summary is not believed');
  assert.equal(cleanProgress(s, false).done.join(), '0,0,0,0,0,0', 'the other age route starts again');
  const all = { v: 3, j: false, plays: 0, done: [1, 1, 1, 1, 1, 1], sum: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} }, cur: { n: 2, part: 1, d: { prog: [] } } };
  const a = cleanProgress(all, false); assert.ok(allDone(a.done)); assert.equal(a.cur.n, 2, 'a finished mission being replayed resumes');
  // each mission keeps its own half-done progress: replaying mission 1 does not lose mission 4's place
  const half = cleanProgress({ v: 3, j: true, plays: 0, done: [1, 1, 1, 0, 0, 0], sum: { 1: {}, 2: {}, 3: {} }, cur: { n: 1, part: 1, d: {} }, parts: { 1: { part: 1, d: {} }, 3: { part: 2, d: { x: 1 } }, 5: { part: 1, d: {} } } }, true);
  assert.deepEqual(Object.keys(half.parts).sort(), ['1', '3'], 'a mission that is not open keeps nothing'); assert.equal(half.parts[3].part, 2);
});

test('mission 1: every job has one right sensor, a miss never names the answer at first, and the rule decides the trip', () => {
  for (const job of M1.JOBS) {
    assert.ok(M1.sensor(job.want)); assert.ok(job.j && job.s && job.need);
    for (const s of M1.SENSORS) { const first = M1.matchLine(job, s.id, 0, true); const second = M1.matchLine(job, s.id, 1, true);
      assert.equal(first.ok, s.id === job.want);
      if (!first.ok) { assert.match(first.text, /Try another\.$/); assert.doesNotMatch(first.text, new RegExp(M1.sensor(job.want).name, 'i')); assert.match(second.text, new RegExp(job.need)); } }
  }
  for (const s of M1.SENSORS) assert.equal(M1.JOBS.filter((j) => j.want === s.id).length, 2, `two jobs for the ${s.name}`);
  assert.equal(M1.drive(M1.ROOM, 1).end, 'home'); assert.equal(M1.drive(M1.ROOM, 0).end, 'bump'); assert.equal(M1.drive(M1.ROOM, 2).end, 'circles');
  const trip = M1.drive(M1.ROOM, 1); const asks = M1.askAt(trip);
  assert.ok(asks.length >= 3); assert.ok(asks.some((i) => trip.steps[i].think === 'turn') && asks.some((i) => trip.steps[i].think === 'forward'));
  for (const s of trip.steps) assert.equal(s.think === 'turn', s.sense < 1, 'the rule: turn when something is right in front');
  assert.equal(M1.reading(1, false), 75); assert.match(M1.endLine('bump', 0, true), /bump switch/);
  // room 2: the rule shown in room 1 fails; turning left when something is right in front gets it home
  assert.notEqual(M1.drive(M1.ROOM2, 1, 40, 'right').end, 'home'); assert.equal(M1.drive(M1.ROOM2, 1, 40, 'left').end, 'home');
  for (const dir of ['left', 'right']) for (const t of [0, 2, 3]) assert.notEqual(M1.drive(M1.ROOM2, t, 40, dir).end, 'home', `${dir} ${t}`);
  assert.deepEqual(M1.CM.map(M1.cmToT), [0, 1, 1, 2, 2, 3]); assert.equal(M1.ruleText('left', 1, false, 50), 'If the distance is under 50 cm, turn left. Otherwise go forward.');
});

test('mission 2: the arm does what each step really does, the bug is real, and only a repeat of 4 packs the tray', () => {
  const good = [{ op: 'move', to: 0 }, { op: 'down' }, { op: 'close' }, { op: 'up' }, { op: 'move', to: 'box' }, { op: 'down' }, { op: 'open' }, { op: 'up' }];
  const [one, debug, tray] = M2.TASKS;
  assert.equal(M2.judge(one, good).done, true);
  assert.equal(M2.judge(debug, debug.start).done, false, 'the given program really is broken'); assert.equal(M2.firstBad(debug, debug.start), 2);
  const fixed = [...debug.start]; fixed[2] = { op: 'close' }; const fixed2 = fixed.map((c) => (c.op === 'move' && c.to === 0 ? { op: 'move', to: 1 } : c));
  assert.equal(M2.judge(debug, fixed2).done, true);
  // the tiles of each task are enough to solve it
  for (const t of M2.TASKS) for (const c of t.tiles) assert.ok(M2.isCmd(c.x === null ? { ...c, x: 10 } : c));
  const body = [{ op: 'move', to: 'next' }, ...good.slice(1)];
  for (const r of [1, 2, 3]) assert.equal(M2.judge(tray, body, r).done, false); assert.equal(M2.judge(tray, body, 4).done, true);
  // faults are what the arm would do
  assert.equal(M2.judge(one, [{ op: 'move', to: 0 }, { op: 'down' }, { op: 'move', to: 'box' }]).r.stopped, true);
  const drop = M2.run([{ op: 'move', to: 0 }, { op: 'down' }, { op: 'close' }, { op: 'up' }, { op: 'move', to: 'box' }, { op: 'open' }]); assert.equal(drop.arm.dropped, 1); assert.equal(drop.arm.box, 0);
  assert.match(M2.step(M2.startArm(), { op: 'close' }, true).text, /thin air/);
  assert.equal(M2.label({ op: 'move', to: 2 }, false), 'Move to x = 30'); assert.equal(M2.label({ op: 'move', to: 'next' }, true), 'Move to the next seedling');
  assert.deepEqual(M2.cleanProgram([{ op: 'down' }, { op: 'fly' }, null, { op: 'move', to: 9 }, { op: 'move', to: 'box' }]), [{ op: 'down' }, { op: 'move', to: 'box' }]);
  // ages 13–17: an order by coordinates. Only the ordered seedlings, and only by the right x.
  assert.equal(M2.tasksFor(true).length, 3); assert.equal(M2.tasksFor(false).length, 4); const order = M2.tasksFor(false)[3];
  const pick = (x) => [{ op: 'move', x }, { op: 'down' }, { op: 'close' }, { op: 'up' }, { op: 'move', x: 70 }, { op: 'down' }, { op: 'open' }, { op: 'up' }];
  assert.equal(M2.judge(order, [...pick(20), ...pick(40)], 1, false).done, true); assert.ok([...pick(20), ...pick(40)].length <= M2.maxFor(order));
  assert.match(M2.judge(order, [...pick(20), ...pick(30)], 1, false).text, /did not ask for/); assert.equal(M2.judge(order, pick(25), 1, false).done, false);
  assert.match(M2.step({ ...M2.startArm(), down: true, x: 25, at: 'air' }, { op: 'close' }, false).text, /no seedling at x = 25/);
  assert.deepEqual(M2.cleanProgram([{ op: 'move', x: 35 }, { op: 'move', x: 33 }, { op: 'move', x: 200 }], 18), [{ op: 'move', x: 35 }]);
});

test('mission 3: the first rule that fits is used, every rule must be safe on its own, and stopping for everyone is too late', () => {
  const best = { person: 'slow', block: 'wait', lift: 'call', step: 'stop' }; const mk = (o, order) => order.map((c) => ({ cond: c, act: o[c] }));
  for (const [i, r] of M3.ROUNDS.entries()) for (const j of [true, false]) {
    const order = i === 2 ? ['step', 'person', 'block', 'lift'] : r.conds; const t = M3.trip(r, mk(best, order), j);
    assert.ok(M3.passed(t), `round ${i + 1}`); assert.doesNotMatch(M3.tripLine(t, r, j), /not safe|unsafe|did not reach|too late/);
    for (const c of r.conds) for (const a of M3.CONDS[c].acts) assert.ok(M3.ACTS[a]);
  }
  assert.equal(new Set(M3.ROUNDS[0].events.map((e) => e.kind)).size, 2, 'trip 1 has two kinds of event');
  // trip 3: the safe rules in the wrong order are not safe (slowing is used when someone steps in front)
  const r3 = M3.ROUNDS[2]; const wrongOrder = mk(best, ['person', 'block', 'lift', 'step']);
  const t = M3.trip(r3, wrongOrder, true); assert.equal(M3.passed(t), false);
  const e = t.events.find((x) => x.kind === 'step'); assert.equal(e.cond, 'person'); assert.match(M3.orderNote(e, wrongOrder, true), /first one in its list/);
  // the review's shortcut: stop for people, beep for someone in front (never used). It does not pass, and the beep rule is named.
  const beep = mk({ ...best, person: 'stop', step: 'beep' }, ['person', 'block', 'lift', 'step']); const tb = M3.trip(r3, beep, true);
  assert.equal(M3.passed(tb), false); assert.ok(tb.late, 'stopping for every person is too late'); assert.deepEqual(tb.bad, [3]); assert.match(M3.unusedLine(beep, 3, true), /Rule 4 was not used/);
  const beepSlow = mk({ ...best, step: 'beep' }, ['step', 'person', 'block', 'lift']); assert.equal(M3.passed(M3.trip(r3, beepSlow, false)), false);
  // from trip 2, stopping for every nurse misses the time limit; in trip 1 it is allowed but noted
  for (const i of [1, 2]) { const order = i === 2 ? ['step', 'person', 'block', 'lift'] : M3.ROUNDS[i].conds; const tt = M3.trip(M3.ROUNDS[i], mk({ ...best, person: 'stop' }, order), false); assert.ok(tt.late && !M3.passed(tt), `trip ${i + 1}`); assert.match(M3.tripLine(tt, M3.ROUNDS[i], false), /limit/); }
  const t1 = M3.trip(M3.ROUNDS[0], mk({ ...best, person: 'stop' }, ['person', 'block']), true); assert.ok(M3.passed(t1)); assert.match(M3.tripLine(t1, M3.ROUNDS[0], true), /safe but slow/);
  const fast = M3.trip(M3.ROUNDS[0], mk({ ...best, person: 'full' }, ['person', 'block']), true); assert.equal(fast.arrived, true); assert.equal(M3.passed(fast), false); assert.match(M3.tripLine(fast, M3.ROUNDS[0], true), /Arriving is not enough/);
  assert.equal(M3.trip(M3.ROUNDS[1], mk({ ...best, lift: 'stairs' }, ['person', 'block', 'lift']), true).arrived, false);
  assert.deepEqual(M3.cleanRules([{ cond: 'lift', act: 'call' }, { cond: 'person', act: 'zoom' }], ['person', 'block', 'lift']).map((r) => [r.cond, r.act]), [['lift', 'call'], ['person', null], ['block', null]]);
  // the record counts only safe rules
  assert.match(missionLine(3, { rules: [['step', 'beep'], ['person', 'slow'], ['block', 'wait'], ['lift', 'call']], secs: 150 }, true), /^Wrote 3 rules/);
});

test('mission 5: only the best setting (or one weed off it after three tries) passes, the words rise, and every line is true', () => {
  const [lettuce, carrot] = M5.FIELDS;
  assert.equal(M5.best(lettuce).pull, 70); assert.equal(M5.best(carrot).pull, 80, 'the best setting depends on the field');
  assert.deepEqual(M5.SETTINGS.map((t) => M5.SURE[t]), ['A little sure', 'Fairly sure', 'Quite sure', 'Very sure', 'Extremely sure']);
  for (const t of M5.SETTINGS) assert.match(M5.sureWords(t), new RegExp(M5.SURE[t].toLowerCase()), 'the row uses the same words as the setting');
  for (const f of M5.FIELDS) for (const t of M5.SETTINGS) for (const j of [true, false]) {
    const r = M5.weed(f, t); const g = M5.grade(f, r, false, 0); const l = M5.resultLine(f, r, j, false, 0);
    if (r.cropsPulled) { assert.equal(g, 'lost'); assert.match(l, /lost/); } else assert.doesNotMatch(l, /lost for good|lost crop/);
    if (g === 'weedy') assert.match(l, /water and light/); if (g === 'best') assert.match(l, /best/);
    assert.equal(M5.passes(g), t === M5.best(f).pull, `${f.id} ${t}`); assert.equal(r.weedsPulled + r.weedsLeft, r.weeds);
  }
  // the most cautious setting never passes straight away (the review's shortcut)
  for (const f of M5.FIELDS) assert.equal(M5.passes(M5.grade(f, M5.weed(f, 90), false, 1)), false);
  // one weed more than the best is accepted after three tries, with a hint
  assert.equal(M5.grade(lettuce, M5.weed(lettuce, 80), false, 3), 'near'); assert.equal(M5.grade(lettuce, M5.weed(lettuce, 80), false, 2), 'weedy');
  // ages 13–17: flags for the farmer, who has time for three
  const r = M5.weed(carrot, 80, 50); assert.equal(r.flags, 4); assert.equal(r.unchecked, 1); assert.equal(r.cropsPulled, 0); assert.equal(M5.best(carrot, true).weedsLeft, r.weedsLeft); assert.equal(M5.grade(carrot, r, true), 'best');
  const tb = M5.table(r); assert.equal(tb.weed.reduce((a, b) => a + b, 0), r.weeds); assert.equal(tb.crop.reduce((a, b) => a + b, 0), r.crops);
  for (const p of [...lettuce.plants, ...carrot.plants]) { assert.ok(M5.NAMES[p.pic]); if (p.hid) assert.ok(M5.whyUnsure[p.hid]); }
  for (const f of M5.FIELDS) for (const p of f.plants) if (p.p >= 40 && p.p <= 74) assert.ok(p.hid || p.pic === 'cowparsley' || p.pic === 'chickweed', p.id);
});

test('mission 6: only real trade-offs: street 1 has several answers, street 2 needs floats and a big battery and no extra weight', () => {
  const all = []; for (const body of Object.keys(M6.BODIES)) for (const sensors of [['camera'], ['heat'], ['camera', 'heat']]) for (const floats of [false, true]) for (const battery of ['small', 'big']) all.push(M6.cleanDesign({ body, sensors, floats, battery }));
  const pass = (st) => all.filter((d) => M6.simulate(st, d, true).end === 'found');
  assert.ok(pass(M6.STREETS[0]).length >= 4); assert.ok(pass(M6.STREETS[1]).length >= 1);
  for (const d of pass(M6.STREETS[1])) { assert.ok(d.floats && d.battery === 'big' && d.sensors.includes('heat')); }
  const heavy = M6.simulate(M6.STREETS[1], M6.cleanDesign({ body: 'tracks', sensors: ['camera', 'heat'], floats: true, battery: 'big' }), false); assert.equal(heavy.end, 'sank'); assert.match(heavy.parts.at(-1).why, /26 kg/);
  const dark = M6.simulate(M6.STREETS[0], M6.cleanDesign({ body: 'tracks', sensors: ['camera'], battery: 'small' }), true); assert.equal(dark.end, 'dark'); assert.match(M6.testLine(dark, true), /dark/);
  for (const d of all) for (const st of M6.STREETS) { const r = M6.simulate(st, d, false); assert.ok(r.used <= r.wh); assert.doesNotMatch(M6.testLine(r, false) + M6.testLine(M6.simulate(st, d, true), true), /undefined|NaN/); }
  assert.equal(M6.cleanDesign({ body: 'legs', floats: true, sensors: ['heat', 'x'], battery: 'huge' }).floats, false);
  assert.equal(M6.ready(M6.cleanDesign({ body: 'boat', sensors: [] })), false);
});

test('the record: one true line per mission, four practised lines, a picture the contract accepts, a small save', () => {
  for (const j of [true, false]) {
    const sum = { 1: { mr: 6, mo: 8, pr: 3, po: 4, tried: [0, 1] }, 2: { fixed: true, steps: 8, rep: 4, runs: 5 }, 3: { rules: [['step', 'stop'], ['person', 'slow'], ['block', 'wait'], ['lift', 'call']], tests: 4, secs: 128 },
      4: { ex: 10, first: 5, last: 8, of: 8, sr: 4, so: 5, asked: 1 }, 5: { checks: 4, of: 4, f1: { pull: 70, ask: null, left: 1, weeds: 5, best: 1 }, f2: { pull: 80, ask: j ? null : 50, left: 1, weeds: 6, best: 1 }, tries: 4 },
      6: { d1: { body: 'tracks', sensors: ['heat'], floats: false, battery: 'small' }, d2: { body: 'tracks', sensors: ['heat'], floats: true, battery: 'big' }, tests: [3, 3] } };
    const prog = { ...fresh(j), done: [1, 1, 1, 1, 1, 1], sum };
    const rec = hourRecord(prog, j); assert.equal(rec.lines.length, 6); assert.equal(rec.practised.length, 4);
    for (const l of [...rec.lines, ...rec.practised]) { assert.ok(l.length <= 120, l); assert.doesNotMatch(l, /undefined|NaN|null|learn|improved/i, l); }
    assert.match(rec.lines[3], /5 of 8|5\/8/); assert.match(rec.lines[5], /6 tests/);
    const pic = hourPicture(prog.done); const out = cleanResult({ finished: true, record: { made: { title: rec.title, lines: rec.lines, picture: pic }, practised: rec.practised }, town: { kind: 'recycling-robot', data: { key: '6,5', bins: ['paper'], things: [] } } });
    assert.equal(out.finished, true); assert.equal(out.record.made.picture, pic); assert.deepEqual(out.record.made.lines, rec.lines);
    // a whole save, with a sorter in progress, fits in 8 KB
    const big = { ...prog, cur: { n: 2, part: 2, d: { prog: Array(12).fill({ op: 'move', to: 'next' }), rep: 4 } }, m4: { v: 2, j, seed: 1, rounds: [['newspaper', 'cardbox', 'clearjar'], ['greyeggbox', 'magazine', 'envelope', 'brownbottle']], tests: 1, stage: 'teach', off: [] }, town: { key: '6,5', bins: ['paper', 'glass', 'food', 'repair'], things: Array(16).fill('newspaper') } };
    assert.ok(cleanState(big)); assert.ok(JSON.stringify(big).length < 4000);
  }
  assert.deepEqual(practisedLines([1, 0, 0, 0, 0, 0]), ['choosing sensors and following a robot’s sense, think, act loop']);
  assert.equal(missionLine(5, { f1: null }, true), 'Set how sure a weeding robot must be before it pulls a plant.');
});
