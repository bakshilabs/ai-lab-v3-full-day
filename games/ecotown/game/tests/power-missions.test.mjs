// The "power" module's six missions (js/modules/power): the pure models, goals, hints, saved progress and record.
import test from 'node:test'; import assert from 'node:assert/strict';
import { kitFrom, forecast, runModes, DAY_IDS, isWinter, HOURS } from '../js/modules/power/model.js';
import { stepSay, BAL, BALANCE_ROUNDS, STEPS, FLEX_MIN, FLEX_MAX, ROUND_GOAL, needFlex, gap, hz, judge, reachable, darkFor, balanceHint, stateWord, clockText } from '../js/modules/power/m1-balance.js';
import { FORECAST_ROUNDS, hoursOf, checkMarks, spells, shortKwh, peakGapKw, energyChoices, checkSay, energySay } from '../js/modules/power/m2-forecast.js';
import { STORE_ROUNDS, bestPlan, storeGoal, storeMet, storeHint, planLine, planSpans, storeGoalLine } from '../js/modules/power/m3-storage.js';
import { batteryWord } from '../js/modules/power/shell.js';
import { DEMAND_ROUNDS, JOBS, SLOTS, startPlan, layout, solve, minGas, inWindow, runSay, refuseSay, jobSize, DEM } from '../js/modules/power/m5-demand.js';
import { PREP, PREP_GOOD, prepCheck, prepSay, STORM, IDS, FAULT, BATTERY_ONLY, GRID_BACK, SECTIONS, live, loadOf, indicators, r1Start, r1Flip, r1Done, r2Start, r2Flip, r2Done, r2Best, prioOn, crewSteps, crewShuffled, crewCheck, r3Start, r3Switch, r3Done } from '../js/modules/power/m6-storm.js';
import { MISSIONS, cleanProgress, packProgress, nextMission, isOpen, allDone, recordLines, practisedLines, madeTitle } from '../js/modules/power/missions.js';
import { hourPicture } from '../js/modules/power/chart.js';
import { cleanResult, cleanState } from '../js/modules/contract.js';

const tiles = new Map(); for (let x = 0; x < 14; x++) for (let z = 0; z < 12; z++) tiles.set(`${x},${z}`, { k: `${x},${z}`, gx: x, gz: z, zone: x === 2 ? 'river' : 'field', fixed: x === 9 && z === 8 ? 'oldschool' : null });
const cell = (item, mods = []) => ({ mark: 'town', item, mods });
const MID = [['3,3', cell('timber', ['solar'])], ['3,4', cell('straw')], ['4,4', cell('earth', ['heatpump'])], ['5,4', cell('timber', ['solar'])], ['6,4', cell('cohousing')], ['6,5', cell('timber')], ['7,5', cell('reclaimed')], ['8,5', cell('timber', ['solar'])], ['0,1', cell('wind')], ['0,2', cell('wind')], ['1,2', cell('battery')]];
const FULL = [...Array(14)].map((_, i) => [`${(i % 7) + 3},${3 + Math.floor(i / 7)}`, cell('timber', i % 2 ? ['solar'] : [])]).concat([...Array(6)].map((_, i) => [`0,${i}`, cell('wind')]), [...Array(8)].map((_, i) => [`1,${i}`, cell('battery')]), [['7,7', cell('school')]]);
const BIG = [...Array(24)].map((_, i) => [`${(i % 8) + 3},${3 + Math.floor(i / 8)}`, cell('timber')]).concat([['0,1', cell('wind')]]);
const KITS = [[], MID, FULL, BIG].map((c) => kitFrom(c, tiles));
const TEXT = (o) => (typeof o === 'string' ? [o] : o && typeof o === 'object' ? Object.values(o).flatMap(TEXT) : []);

test('six missions in the curriculum order, each with its real job, how and what the child can now do', () => {
  assert.deepEqual(MISSIONS.map((m) => m.id), ['balance', 'forecast', 'storage', 'rules', 'demand', 'storm']);
  assert.equal(MISSIONS.filter((m) => m.built).map((m) => m.id).join(), 'rules', 'mission 4 is the first version, kept');
  for (const m of MISSIONS) for (const k of ['use', 'job', 'how', 'can']) for (const a of ['j', 's']) { assert.ok(m[k][a] && m[k][a].length < 170, `${m.id}.${k}.${a}`); }
  for (const m of MISSIONS) assert.ok(!/kWh|kW\b/.test(m.job.j + m.how.j + m.can.j), `${m.id}: no kilowatts for ages 8-12`);
});

test('mission order: missions open one after another; a finished one stays open to replay', () => {
  const done = [true, true, false, false, false, false];
  assert.equal(nextMission(done), 2); assert.deepEqual(done.map((_, i) => isOpen(done, i)), [true, true, true, false, false, false]);
  assert.ok(!allDone(done)); assert.ok(allDone(Array(6).fill(true))); assert.equal(nextMission(Array(6).fill(true)), -1);
  assert.ok(Array(6).fill(0).every((_, i) => isOpen(Array(6).fill(true), i)));
});

test('saved progress: cleaned, small, and a first-version save becomes mission 4 done with its rules kept', () => {
  const v1 = { v: 1, stage: 'done', hand: 'hhcccccccccuuuuuuuhhhhhh', rules: { list: [{ when: 'evening', then: 'use' }, { when: 'bogus', then: 'use' }], school: true }, changed: true };
  const p = cleanProgress(v1, true); assert.deepEqual(p.done, [false, false, false, true, false, false]); assert.equal(p.rules.list.length, 1); assert.equal(p.hand.length, 24); assert.ok(p.rules.school);
  const packed = packProgress(p); assert.equal(packed.hand, 'hhcccccccccuuuuuuuhhhhhh'); assert.ok(JSON.stringify(packed).length < 2000); assert.deepEqual(cleanState(packed), packed);
  assert.deepEqual(cleanProgress(null).done, Array(6).fill(false)); assert.deepEqual(cleanProgress({ done: 'nonsense', res: 5, hand: 'zz' }).done, Array(6).fill(false));
  const full = cleanProgress({ v: 2, done: Array(6).fill(true), res: { balance: { level: 99, of: 24 }, storage: { dark: [1, 2, 3, 4], total: 144 } } });
  assert.equal(full.res.balance.level, 24, 'numbers are clamped'); assert.equal(full.res.storage.dark.length, 3);
});

test('mission 1: every step can be made level, the rounds get harder, and the frequency follows the gap', () => {
  assert.equal(BALANCE_ROUNDS.length, 3);
  for (const r of BALANCE_ROUNDS) { assert.ok(reachable(r), r.id); assert.equal(r.use.length, STEPS); assert.equal(r.wind.length, STEPS); assert.equal(r.sun.length, STEPS); }
  const changes = BALANCE_ROUNDS.map((r) => r.use.slice(1).reduce((n, _, i) => n + Math.abs(needFlex(r, i + 1) - needFlex(r, i)), 0));
  assert.ok(changes[0] < changes[1] && changes[1] < changes[2], `harder each round: ${changes}`);
  assert.ok(BALANCE_ROUNDS[1].use.some((_, i) => needFlex(BALANCE_ROUNDS[1], i) < 0), 'round 2: the battery must switch to storing');
  assert.ok(BALANCE_ROUNDS[2].wind.includes(0), 'round 3: the turbines cut out');
  const r = BALANCE_ROUNDS[0]; const right = r.use.map((_, i) => needFlex(r, i));
  assert.deepEqual(judge(r, right), { ...judge(r, right), level: 8, met: true });
  const nearly = right.map((x, i) => (i < 2 ? x + 1 : x)); assert.equal(judge(r, nearly).level, 6); assert.ok(judge(r, nearly).met, `${ROUND_GOAL} of 8 is the goal`);
  assert.ok(!judge(r, Array(8).fill(0)).met);
  assert.equal(hz(0), 50); assert.equal(hz(-2), 49.8); assert.equal(hz(1), 50.1); assert.equal(gap(r, 0, right[0]), 0);
  assert.equal(darkFor(r, 3, 0, 6), 0); assert.ok(darkFor(r, 3, -2, 6) >= 1); assert.equal(darkFor(r, 3, 3, 6), 0, 'too much power darkens nobody');
  assert.ok(FLEX_MIN < 0 && FLEX_MAX > 0);
  assert.notEqual(balanceHint(1, judge(r, Array(8).fill(0)), true), balanceHint(2, judge(r, Array(8).fill(0)), true));
  assert.ok(/kW/.test(stateWord(-1, false)) && !/Hz|kW/.test(stateWord(-1, true)));
  assert.ok(!/switched off|disconnected/.test(stepSay(-3, false) + stepSay(-1, true)), 'a small shortfall calls in reserve, it does not cut homes off');
  assert.ok(/48\.8/.test(BAL.warn.s) && /In this game/.test(BAL.warn.j));
  assert.equal(clockText(r, 0, true), '6:00 am'); assert.equal(clockText(BALANCE_ROUNDS[1], 3, false), '08:00');
});

test('mission 2: the forecast days differ, the marks are checked fairly, and the energy question has one right answer', () => {
  assert.deepEqual(FORECAST_ROUNDS, ['today', 'grey', 'front']); assert.ok(DAY_IDS.includes('grey') && isWinter('front') && !isWinter('grey'));
  for (const kit of KITS) {
    const sp = FORECAST_ROUNDS.map((d) => spells(hoursOf(kit, d, 3)));
    assert.equal(sp[1].length, 2, 'the grey morning has two short spells'); assert.ok(sp[0].length >= 1);
    const len = (d) => hoursOf(kit, d, 3).filter((h) => h.truth === 'short').length; assert.ok(len('front') > len('today'), 'the winter spell is longer');
    for (const d of FORECAST_ROUNDS) {
      const h = hoursOf(kit, d, 3); const short = h.filter((x) => x.truth === 'short').map((x) => x.i); const close = h.filter((x) => x.truth === 'close').map((x) => x.i);
      assert.ok(checkMarks(h, short).right); assert.ok(checkMarks(h, short.concat(close)).right, 'close hours count either way');
      const miss = checkMarks(h, short.slice(1)); assert.ok(!miss.right && miss.missed === 1); assert.equal(checkMarks(h, short.concat([h.find((x) => x.truth === 'enough').i])).extra, 1);
      const ch = energyChoices(h, 1); assert.equal(ch.length, 3); assert.equal(ch.filter((c) => c.ok).length, 1); assert.equal(new Set(ch.map((c) => c.v)).size, 3);
      assert.ok(ch.some((c) => c.v === peakGapKw(h) && !c.ok), 'the kW-for-kWh mix-up is one of the wrong answers'); assert.equal(ch.find((c) => c.ok).v, shortKwh(h));
    }
  }
  const h = hoursOf(KITS[0], 'today', 3); const res = checkMarks(h, []);
  const say1 = checkSay(res, 1, h, true), say2 = checkSay(res, 2, h, true);
  assert.ok(!/\d+ am|\d+ pm/.test(say1), 'the first miss does not give the answer'); assert.notEqual(say1, say2);
  assert.ok(/kWh/.test(energySay(energyChoices(h, 0).find((c) => c.why === 'peak'), h)));
});

test('mission 3: every day has an honest goal the best plan meets, and "midday charge, evening use" no longer passes days 2 and 3', () => {
  for (const kit of KITS) {
    for (const [n, round] of STORE_ROUNDS.entries()) {
      const g = storeGoal(kit, round, 3); const best = runModes(kit, round.day, g.plan, { seed: 3, startLevel: round.start });
      assert.ok(storeMet(best, g), `best plan meets the goal (${n})`); assert.equal(g.plan.length, HOURS);
      assert.ok(!storeMet(runModes(kit, round.day, Array(HOURS).fill('hold'), { seed: 3, startLevel: round.start }), g), 'holding all day is not enough');
      if (n > 0) { const fc = forecast(round.day, 3); const naive = fc.map((f) => (f.block === 'midday' ? 'charge' : f.block === 'evening' ? 'use' : 'hold')); assert.ok(!storeMet(runModes(kit, round.day, naive, { seed: 3, startLevel: round.start }), g), `the simple plan fails day ${n + 1}`); }
    }
  }
  const g = storeGoal(KITS[0], STORE_ROUNDS[2], 3); const spans = planSpans(g.plan); assert.equal(spans.reduce((a, s) => a + s.n, 0), 24);
  assert.ok(/Charge from/.test(planLine(g.plan, true)));
  assert.ok(/Lights row/.test(storeGoalLine(g, true)) || /yellow/.test(storeGoalLine(g, true)), 'ages 8-12: the goal is said in what the chart shows');
  assert.deepEqual([0, 0.2, 0.5, 0.8, 1].map(batteryWord), ['Empty', 'Low', 'Half full', 'Nearly full', 'Full']);
  const day = runModes(KITS[0], 'winter', Array(24).fill('hold'), { seed: 3, startLevel: 0 });
  assert.ok(!/Charge from/.test(storeHint(1, day, g, true)) && !/Charge from/.test(storeHint(2, day, g, true)), 'the plan is not given after one or two misses');
  assert.ok(/Charge from/.test(storeHint(3, day, g, true)));
  const t = Date.now(); bestPlan(KITS[3], 'winter', 0, 3); assert.ok(Date.now() - t < 2000, 'the search is quick');
});

test('mission 5: each day starts at the usual times (on gas), has a clean answer inside every window, and refuses times people cannot use', () => {
  for (const r of DEMAND_ROUNDS) {
    const start = layout(r, startPlan(r)); assert.ok(start.gas > 0 && !start.done, `${r.id}: the usual times burn gas`); assert.equal(start.outside.length, 0, 'the usual times are allowed times');
    const s = solve(r); assert.ok(s, `${r.id}: solvable`); const l = layout(r, s); assert.ok(l.done && l.gas === minGas(r)); for (const id of Object.keys(s)) assert.ok(inWindow(id, s[id]));
    assert.equal(minGas(r), r.id === 'shift' ? 1 : 0, `${r.id}: only the night shift needs gas`);
    assert.equal(r.spare.length, SLOTS);
  }
  const scarce = DEMAND_ROUNDS[2]; const spare = scarce.spare.reduce((a, b) => a + b, 0); const need = scarce.jobs.reduce((a, [id]) => a + JOBS[id].p * JOBS[id].len, 0);
  assert.ok(need >= spare - 1, 'day 3 is tight: almost every spare square is needed');
  assert.ok(!inWindow('carA', 2) && inWindow('carA', 8) && !inWindow('wash', 6) && !inWindow('heat', 6));
  assert.ok(/6 pm/.test(refuseSay('carA', true))); assert.ok(/kWh/.test(jobSize('carA', false)) && jobSize('carA', true) === '');
  assert.equal(DEMAND_ROUNDS.length, 4); assert.equal(DEMAND_ROUNDS[0].jobs.length, 4, 'day 1 has four jobs, one needing two squares');
  const shift = DEMAND_ROUNDS[3]; const sl = layout(shift, solve(shift)); assert.ok(sl.done && sl.perJob.nurse.gas === 1 && /nurse/i.test(runSay(sl, 1, true)));
  assert.ok(!inWindow('nurse', 8) && inWindow('nurse', 7));
  const l = layout(DEMAND_ROUNDS[0], startPlan(DEMAND_ROUNDS[0])); assert.notEqual(runSay(l, 1, true), runSay(l, 2, true)); assert.ok(!/kWh/.test(runSay(l, 1, true)));
});

test('mission 6: the fault is found from the flags, priority comes first within the battery, and the crew order is the safe one', () => {
  assert.equal(PREP.length, 8); assert.equal(PREP_GOOD.size, 4); assert.ok(prepCheck([...PREP_GOOD]).done); assert.ok(!prepCheck(PREP).done);
  const r = prepCheck(['charge', 'crewsout']); assert.equal(r.bad.length, 1); assert.equal(r.missing, 3); assert.ok(/storm|safe/i.test(prepSay(r, 2, [], true)), 'the second miss says why the unsafe one is unsafe');
  assert.ok(/early calls|phone them early/.test(STORM.psr.s + STORM.psr.j), 'the register is explained as calls and help, not a switch');
  assert.equal(FAULT, '3B'); const flags = indicators(); assert.ok(flags['3A'] && flags['3B'] && !flags['1A'] && !flags['2B']);
  let sw = r1Start(); assert.ok(!live(sw)['3A'] && !live(sw)['3B'] && live(sw)['1B']);
  let o = r1Flip(sw, '3A'); assert.equal(o.event, 'tripped'); assert.ok(!o.sw['3A'], 'reclosing onto the fault trips again');
  o = r1Flip(sw, '3B'); sw = o.sw; o = r1Flip(sw, '3A'); sw = o.sw; assert.ok(r1Done(sw) && live(sw)['3A'] && !live(sw)['3B']);
  assert.ok(!r1Done(r1Flip(sw, '1B').sw), 'a healthy section opened is not done');
  sw = r2Start(); for (const id of ['1A', '1B', '2A']) sw = r2Flip(sw, id).sw; assert.equal(loadOf(sw), 7);
  o = r2Flip(sw, '2B'); assert.equal(o.event, 'overload'); assert.equal(loadOf(o.sw), 0, 'an overload drops everything');
  assert.equal(r2Flip(r2Start(), FAULT).event, 'locked');
  sw = r2Start(); for (const id of ['1A', '2A', '2B']) sw = r2Flip(sw, id).sw; assert.ok(r2Done(sw) && prioOn(sw) && !r2Best(sw)); sw = r2Flip(sw, '3A').sw; assert.ok(r2Best(sw)); assert.equal(loadOf(sw), BATTERY_ONLY);
  assert.equal(IDS.filter((id) => SECTIONS[id].prio).length, 3);
  for (const j of [true, false]) { assert.ok(crewCheck(crewSteps(j), j).done); assert.ok(!crewCheck(crewShuffled(j), j).done); assert.equal(crewSteps(j)[0], 'off'); assert.equal(crewSteps(j).at(-1), 'on'); assert.ok(crewSteps(j).indexOf('dead') < crewSteps(j).indexOf('mend')); }
  sw = r3Start(); assert.equal(r3Switch(sw, ['1B', '3B']).event, 'overload', 'both at once: the start-up surge is too much');
  o = r3Switch(sw, ['1B']); assert.equal(o.event, 'closed'); o = r3Switch(o.sw, ['3B']); assert.equal(o.event, 'closed'); assert.ok(r3Done(o.sw)); assert.ok(loadOf(o.sw) <= GRID_BACK);
});

test('the record: a title, one line per mission, a small picture and two to four practised lines; it passes the contract', () => {
  const p = cleanProgress({ v: 2, done: Array(6).fill(true), rules: { list: [{ when: 'evening', then: 'use' }] }, res: { balance: { level: 22, of: 24 }, forecast: { tries: 1, kwh: false, spells: 4 }, storage: { dark: [1, 3, 2], total: 144 }, rules: { share: 91, diff: 4 }, demand: { moved: 9, kwh: 560 }, storm: { trips: 1 } } }, true);
  for (const j of [true, false]) {
    const lines = recordLines(p, j); assert.equal(lines.length, 6); assert.ok(lines.every((l) => l.length <= 120), lines.join('\n'));
    if (j) assert.ok(!lines.some((l) => /kWh|kW\b|%/.test(l)), 'no kilowatts or percentages for ages 8-12');
    const pr = practisedLines(p, j); assert.ok(pr.length >= 2 && pr.length <= 4);
    const pic = hourPicture(p, j); assert.ok(pic.startsWith('<svg') && pic.length < 20000);
    const res = cleanResult({ finished: true, record: { made: { title: madeTitle(j), lines, picture: pic }, practised: pr }, town: { kind: 'power-rules', data: { v: 1, rules: p.rules } } });
    assert.ok(res.finished && res.record.made.picture && res.record.made.lines.length === 6);
  }
  assert.equal(practisedLines(cleanProgress(null), true).length, 2);
});

test('words: plain, built in, no catching anyone out, no money for ages 8-12', async () => {
  const all = [];
  for (const f of ['m1-balance', 'm2-forecast', 'm3-storage', 'm5-demand', 'm6-storm', 'missions']) { const m = await import(`../js/modules/power/${f}.js`); for (const v of Object.values(m)) all.push(...TEXT(v)); }
  const text = all.join(' ');
  assert.ok(!/catch (her|florence|the ai)|wrong on purpose|trick/i.test(text));
  assert.ok(!/£|\bpence\b|\bcost\b|\bbudget\b|\bcoins?\b/i.test(text), 'no money');
});
