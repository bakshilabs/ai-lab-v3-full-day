// The "power" module (js/modules/power): the hour-by-hour model, the forecast, the rule interpreter, the comparison,
// the words and the chart. All pure: no page, no 3D.
import test from 'node:test'; import assert from 'node:assert/strict';
import { HOURS, START, MODES, TEST_DAYS, DAY_IDS, WIND_STRONG, WIND_LOW, clockAt, blockOf, afterDark, forecast, homeNeed, schoolNeed, kitFrom, stepHour, runDay, runModes, tally, signSpot, START_LEVEL, WIND_FLOOR, STORE_FLOOR, PRACTICE_TO } from '../js/modules/power/model.js';
import { TESTS, whensFor, maxRules, cleanRules, decide, runRules, testRules, explain, mainGap, draftFromHand, compare, sameRules } from '../js/modules/power/rules.js';
import { T, clockWord, kitLines, intro, HINT, darkNames, handSummary, ruleLine, whenWord, whenNote, thenWord, gapLines, gapFix, resultsSay, compareLines, compareSay, madeTitle, madeLines, practised, rulesSpoken, unusedLine } from '../js/modules/power/words.js';
import { daySvg, picture, dialSvg, legend, needLine } from '../js/modules/power/chart.js';
import { cleanResult, cleanMade, cleanTown } from '../js/modules/contract.js';
import { ITEMS } from '../js/world/catalog.js';
import mod from '../js/modules/power/index.js';

// ---- towns to test on
const tiles = new Map(); for (let x = 0; x < 14; x++) for (let z = 0; z < 12; z++) tiles.set(`${x},${z}`, { k: `${x},${z}`, gx: x, gz: z, zone: x === 2 ? 'river' : 'field', fixed: x === 9 && z === 8 ? 'oldschool' : x === 10 && z === 9 ? 'ailab' : null });
const cell = (item, mods = []) => ({ mark: 'town', item, mods });
const EMPTY = [];
const MID = [['3,3', cell('timber', ['solar'])], ['3,4', cell('straw')], ['4,4', cell('earth', ['heatpump'])], ['5,4', cell('timber', ['solar'])], ['6,4', cell('cohousing')], ['6,5', cell('timber')], ['7,5', cell('reclaimed')], ['8,5', cell('timber', ['solar'])], ['0,1', cell('wind')], ['0,2', cell('wind')], ['1,2', cell('battery')]];
const FULL = [...Array(14)].map((_, i) => [`${(i % 7) + 3},${3 + Math.floor(i / 7)}`, cell('timber', i % 2 ? ['solar'] : [])]).concat([...Array(6)].map((_, i) => [`0,${i}`, cell('wind')]), [...Array(8)].map((_, i) => [`1,${i}`, cell('battery')]), [['7,7', cell('school')]]);
const kitE = kitFrom(EMPTY, tiles), kitM = kitFrom(MID, tiles), kitF = kitFrom(FULL, tiles);
const R = (...pairs) => ({ list: pairs.map(([when, then]) => ({ when, then })), school: false });
const NAIVE = R(['calm', 'use'], ['midday', 'charge']);       // the plan's own two examples, in that order
const GOOD = R(['morning', 'hold'], ['windy', 'charge'], ['sunny', 'charge'], ['always', 'use']);
const darkMap = (day) => day.hours.map((h) => `${h.dark}${h.schoolLit ? '' : 's'}`).join(',');

test('a day is 24 hours from 6 in the morning, and the forecast is the same every time', () => {
  assert.equal(HOURS, 24); assert.equal(START, 6); assert.equal(clockAt(0), 6); assert.equal(clockAt(18), 0); assert.equal(clockAt(23), 5);
  for (const d of DAY_IDS) {
    const a = forecast(d, 3), b = forecast(d, 3); assert.deepEqual(a, b, `${d}: seeded`); assert.equal(a.length, 24);
    assert.ok(a.every((f) => f.wind >= 0 && f.wind <= 1.4 && f.sun >= 0 && f.sun <= 1), `${d}: in range`);
    assert.deepEqual(a.map((f) => f.clock), [...Array(24)].map((_, i) => (6 + i) % 24));
    // another seed may shift the numbers a little, but never across "strong" or "low": rules read the same on any seed
    const c = forecast(d, 99); a.forEach((f, i) => { assert.equal(f.wind >= WIND_STRONG, c[i].wind >= WIND_STRONG); assert.equal(f.wind < WIND_LOW, c[i].wind < WIND_LOW); });
  }
  assert.deepEqual(forecast('nonsense', 1), forecast('today', 1));
  assert.equal(blockOf(6), 'morning'); assert.equal(blockOf(9), 'morning'); assert.equal(blockOf(10), 'midday'); assert.equal(blockOf(13), 'midday'); assert.equal(blockOf(14), 'afternoon'); assert.equal(blockOf(18), 'evening'); assert.equal(blockOf(22), 'night'); assert.equal(blockOf(3), 'night');
  assert.ok(afterDark(20) && !afterDark(12) && afterDark(16, true) && !afterDark(16, false));
});

test('the three test days are different kinds of day', () => {
  const w = forecast('windy'), s = forecast('still'), n = forecast('winter');
  assert.ok(w.every((f) => f.wind >= WIND_STRONG), 'windy: strong wind all day');
  assert.ok(s.filter((f) => f.clock >= 12 || f.clock < 6).every((f) => f.wind < WIND_LOW), 'still: no wind from midday on');
  assert.ok(s.some((f) => f.wind >= WIND_STRONG), 'still: some wind in the morning');
  assert.ok(Math.max(...s.map((f) => f.sun)) > 0.9 && Math.max(...w.map((f) => f.sun)) < 0.5 && Math.max(...n.map((f) => f.sun)) <= 0.3);
  assert.ok(n.filter((f) => f.sun > 0).length < s.filter((f) => f.sun > 0).length, 'winter: a short day');
  assert.ok(homeNeed(19, 1, true) > homeNeed(19, 1, false) && schoolNeed(10, true) > schoolNeed(10), 'winter: more is needed');
  assert.ok(homeNeed(19) > homeNeed(12) && homeNeed(12) > homeNeed(3), 'the evening is the busy time');
  assert.equal(homeNeed(19, 1.5), 1.5);
});

test('the kit is read from the town with the catalogue', () => {
  assert.equal(kitM.homes.length, 8); assert.equal(kitM.roofs, 3); assert.equal(kitM.lent.roofs, 0); assert.equal(kitM.school.k, '9,8'); assert.equal(kitM.school.built, false);
  assert.equal(kitM.turbines - kitM.lent.turbines, 2); assert.equal(kitM.batteries - kitM.lent.batteries, 1);
  assert.equal(kitM.wind, ITEMS.wind.avg * kitM.turbines); assert.equal(kitM.cap, 3 * ITEMS.battery.store * kitM.batteries);
  assert.equal(kitM.homes.find((h) => h.k === '4,4').base, 1 + ITEMS.heatpump.demand, 'a heat pump needs more');
  assert.equal(kitM.homes[0].k, '8,5', 'homes are in order, nearest the school first');
  assert.equal(kitF.school.k, '7,7'); assert.equal(kitF.school.built, true, 'a school the child built is the school');
  assert.deepEqual(kitF.lent, { homes: 0, turbines: 0, roofs: 0, batteries: 0 }, 'a full town is lent nothing');
  assert.equal(kitF.homes.length, 14);
  // cells may be given as a Map too, and nonsense gives the floor, not an error
  assert.equal(kitFrom(new Map(MID), tiles).homes.length, 8); assert.equal(kitFrom(null, null).homes.length, PRACTICE_TO); assert.equal(kitFrom([['1,1', null], ['2,2', { item: 'nonsense' }]], tiles).homes.length, PRACTICE_TO);
});

test('the floor: a town with no homes, generators or batteries is lent enough to practise on', () => {
  assert.equal(kitE.homes.length, PRACTICE_TO); assert.ok(kitE.homes.every((h) => h.practice && h.k)); assert.equal(kitE.lent.homes, PRACTICE_TO);
  assert.equal(new Set(kitE.homes.map((h) => h.k)).size, PRACTICE_TO, 'each practice home has its own tile');
  for (const h of kitE.homes) { const t = tiles.get(h.k); assert.ok(t && !t.fixed && t.zone === 'field', 'practice homes stand on open land'); }
  assert.ok(kitE.lent.turbines >= 1 && kitE.lent.batteries >= 1); assert.equal(kitE.turbines, kitE.lent.turbines); assert.ok(kitE.lent.roofs >= 1 && kitE.roofs === kitE.lent.roofs && kitE.solar > 0, 'and some solar roofs, so the sun on the forecast means something');
  for (const k of [kitE, kitM, kitF]) { assert.ok(k.wind >= WIND_FLOOR * k.peak - 1e-9, 'enough wind'); assert.ok(k.cap >= STORE_FLOOR * k.peak - 1e-9, 'enough battery'); assert.ok(k.rate > k.fill && k.fill > 0); }
  // a town with three homes is topped up; a town with four is left as it is
  assert.equal(kitFrom(MID.slice(0, 3), tiles).lent.homes, PRACTICE_TO - 3); assert.equal(kitFrom(MID.slice(0, 4), tiles).lent.homes, 0);
  // the exercise is worth doing in the lent town: rules change the result, and good rules keep nearly everything lit
  const none = testRules(kitE, R()), good = testRules(kitE, GOOD);
  assert.ok(good.litHours > none.litHours + 20); assert.ok(good.share > 0.93, `good rules: ${good.share}`); assert.ok(none.share < 0.92);
  const lines = kitLines(kitE, true).join(' '); assert.match(lines, /no homes or power yet/); assert.match(lines, /lent 6 practice homes, \d wind turbines?, \d solar roofs? and \d batter/);
  assert.match(kitLines(kitM, true).join(' '), /8 homes, 2 wind turbines, 3 solar roofs and 1 battery, and the school\. For this exercise it is lent \d more turbines? and \d more batter/);
  assert.equal(kitLines(kitF, true).length, 1, 'nothing lent, nothing said about lending');
});

test('one hour: charge, hold and use do what they say', () => {
  const kit = kitM; const fc = { i: 0, clock: 12, wind: 0.9, sun: 0.8, block: 'midday', dark: false };
  const hold = stepHour(kit, fc, 10, 'hold'), charge = stepHour(kit, fc, 10, 'charge'), use = stepHour(kit, fc, 10, 'use');
  assert.equal(hold.made, kit.wind * 0.9 + kit.solar * 0.8); assert.ok(hold.spare > 0);
  assert.equal(hold.level, 10); assert.equal(hold.dark, 0); assert.ok(hold.schoolLit);
  assert.equal(charge.level, 10 + kit.fill); assert.equal(charge.toBattery, kit.fill); assert.equal(charge.dark, 0, 'with plenty to spare, charging costs no home its light');
  assert.equal(use.level, 10, 'with a surplus, "use" leaves the battery alone'); assert.equal(use.fromBattery, 0);
  // a still evening: the battery makes the difference
  const eve = { i: 13, clock: 19, wind: 0.2, sun: 0, block: 'evening', dark: true };
  const h2 = stepHour(kit, eve, 30, 'hold'), u2 = stepHour(kit, eve, 30, 'use'), c2 = stepHour(kit, eve, 30, 'charge'), e2 = stepHour(kit, eve, 0, 'use');
  assert.ok(h2.dark > 0 && h2.level === 30); assert.equal(u2.dark, 0); assert.ok(u2.level < 30 && u2.fromBattery > 0);
  assert.ok(c2.dark > h2.dark, 'charging when the town is short takes power from homes'); assert.equal(c2.litCount, 0);
  assert.equal(e2.dark, h2.dark, 'an empty battery gives nothing');
  assert.ok(stepHour(kit, eve, kit.cap, 'use').fromBattery <= kit.rate + 1e-9, 'the battery gives at most its hourly rate');
  assert.equal(stepHour(kit, fc, kit.cap, 'charge').toBattery, 0, 'a full battery takes nothing');
  // homes are lit in order from the school; the school is last in line unless the rule puts it first after dark
  assert.ok(!h2.schoolLit); const first = stepHour(kit, eve, 30, 'hold', { schoolFirst: true }); assert.ok(first.schoolLit); assert.ok(first.dark >= h2.dark);
  const i = h2.lit.indexOf(false); assert.ok(h2.lit.slice(0, i).every(Boolean), 'the nearest homes are lit first');
  assert.equal(stepHour(kit, fc, 10, 'hold', { schoolFirst: true }).dark, 0, 'by day the school-first rule changes nothing');
});

test('a whole day by hand: charging at midday and using at night beats holding', () => {
  for (const kit of [kitE, kitM]) {
    const fc = forecast('today', 3);
    const hold = runModes(kit, 'today', fc.map(() => 'hold'), { seed: 3 });
    const plan = runModes(kit, 'today', fc.map((f) => (f.block === 'midday' ? 'charge' : f.block === 'evening' || f.block === 'afternoon' || f.block === 'night' ? 'use' : 'hold')), { seed: 3 });
    assert.ok(plan.litHours > hold.litHours + 8, `charge at midday, use at night: ${plan.litHours} > ${hold.litHours}`);
    assert.ok(hold.spells.length >= 1 && hold.worst >= 0 && !hold.allLit, 'holding all day leaves a dark evening');
    assert.ok(['afternoon', 'evening'].includes(blockOf(hold.hours[hold.worst].clock)));
    assert.equal(hold.total, kit.homes.length * 24); assert.equal(hold.litHours + hold.darkHours, hold.total);
    const allCharge = runModes(kit, 'today', fc.map(() => 'charge'), { seed: 3 });
    assert.ok(allCharge.litHours < plan.litHours, 'charging all day is worse than a plan');
    assert.deepEqual(runModes(kit, 'today', fc.map(() => 'hold'), { seed: 3 }).hours, hold.hours, 'the same day twice is the same');
    assert.equal(hold.hours[0].levelBefore, Math.round(kit.cap * START_LEVEL * 100) / 100);
  }
  assert.equal(runDay(kitM, 'today', () => ({ mode: 'nonsense' })).hours[0].mode, 'hold', 'an unknown choice is "hold"');
  const t = tally(kitM, runModes(kitM, 'windy', Array(24).fill('use')).hours); assert.ok(t.allLit); assert.equal(t.worst, -1); assert.equal(t.spells.length, 0); assert.equal(t.share, 1);
});

test('the rule interpreter: first rule that fits, nothing else', () => {
  const x = { clock: 12, block: 'midday', wind: 0.2, sun: 0.9, battery: 0.5 };
  assert.deepEqual(decide(NAIVE, x), { mode: 'use', rule: 0 }, 'the first rule that fits wins');
  assert.deepEqual(decide(R(['midday', 'charge'], ['calm', 'use']), x), { mode: 'charge', rule: 0 }, 'order matters');
  assert.deepEqual(decide(R(['windy', 'charge']), x), { mode: 'hold', rule: -1 }, 'no rule fits: the battery waits');
  assert.deepEqual(decide(R(), x), { mode: 'hold', rule: -1 }); assert.deepEqual(decide(null, x), { mode: 'hold', rule: -1 });
  assert.deepEqual(decide(R(['windy', 'charge'], ['always', 'use']), x), { mode: 'use', rule: 1 });
  assert.ok(TESTS.low({ battery: 0.2 }) && !TESTS.low({ battery: 0.3 }) && TESTS.high({ battery: 0.8 }) && !TESTS.high({ battery: 0.79 }));
  assert.ok(TESTS.sunny(x) && TESTS.calm(x) && !TESTS.windy(x) && TESTS.midday(x) && !TESTS.night(x));
  // ages 13-17 have one more rule kind (a threshold) and more rules
  assert.ok(!whensFor(true).includes('low') && whensFor(false).includes('low') && whensFor(false).includes('high')); assert.ok(maxRules(false) > maxRules(true));
  for (const w of whensFor(false)) { assert.equal(typeof TESTS[w], 'function'); assert.ok(whenWord(w, true) && whenWord(w, false) && whenNote(w, true)); }
  // what was saved is cleaned: unknown tiles go, the count is capped, a junior keeps no threshold rule
  const dirty = { list: [{ when: 'low', then: 'use' }, { when: 'calm', then: 'explode' }, { when: 'calm', then: 'use' }, null, ...Array(9).fill({ when: 'night', then: 'hold' })], school: 1 };
  assert.deepEqual(cleanRules(dirty, true).list.slice(0, 2), [{ when: 'calm', then: 'use' }, { when: 'night', then: 'hold' }]); assert.equal(cleanRules(dirty, true).list.length, maxRules(true)); assert.equal(cleanRules(dirty, true).school, true);
  assert.equal(cleanRules(dirty, false).list[0].when, 'low'); assert.deepEqual(cleanRules(null, true), { list: [], school: false }); assert.deepEqual(cleanRules('x', true), { list: [], school: false });
  assert.ok(sameRules(R(['calm', 'use']), R(['calm', 'use'])) && !sameRules(R(['calm', 'use']), R(['calm', 'hold'])) && !sameRules(R(['calm', 'use']), { ...R(['calm', 'use']), school: true }));
});

test('the rules truly drive the run: different rules give different dark hours on the three test days', () => {
  for (const kit of [kitE, kitM]) {
    const sets = { none: R(), naive: NAIVE, swapped: R(['midday', 'charge'], ['calm', 'use']), good: GOOD, use: R(['always', 'use']), charge: R(['always', 'charge']) };
    const out = Object.fromEntries(Object.entries(sets).map(([n, r]) => [n, testRules(kit, r, { seed: 3 })]));
    for (const d of [0, 1, 2]) assert.equal(out.good.days[d].dayId, TEST_DAYS[d]);
    const maps = ['none', 'naive', 'swapped', 'use', 'charge'].map((n) => out[n].days.map(darkMap).join('|')); assert.equal(new Set(maps).size, maps.length, 'five rule sets, five different results');
    assert.ok(!maps.slice(0, 2).includes(out.good.days.map(darkMap).join('|')));
    assert.notEqual(darkMap(out.naive.days[1]), darkMap(out.swapped.days[1]), 'the same two rules in another order light different hours on the still day');
    assert.ok(out.naive.litHours > out.none.litHours && out.good.litHours > out.use.litHours && out.use.litHours > out.charge.litHours && out.use.litHours > out.none.litHours, 'rules that fit the weather light more hours');
    // every hour of a run follows the rule the interpreter picked, and the hours are in clock order
    for (const day of out.naive.days) for (const h of day.hours) { const want = h.rule < 0 ? 'hold' : NAIVE.list[h.rule].then; assert.equal(h.mode, want); }
    assert.equal(out.none.none, 72); assert.deepEqual(out.none.used, []); assert.equal(out.use.used[0], 72);
    assert.equal(testRules(kit, R(['always', 'use'], ['calm', 'charge'])).used[1], 0, 'a rule under "any other time" is never reached');
    assert.deepEqual(testRules(kit, GOOD, { seed: 3 }), out.good, 'the same rules twice give the same three days');
    assert.ok(out.good.share > 0.9);
  }
});

test('a gap in the rules shows on the still day as dark homes at a particular hour, with its reason', () => {
  const kit = kitM;
  // "charge at midday" and nothing else: no rule covers the still evening
  const gapRules = R(['midday', 'charge']); const still = runRules(kit, 'still', gapRules, { seed: 3 }); const gap = mainGap(kit, still);
  assert.ok(gap, 'homes went dark'); assert.equal(gap.why, 'norule'); assert.equal(gap.rule, -1); assert.ok(gap.dark >= 3); assert.ok(gap.had, 'the battery had power in it, unused');
  assert.ok(gap.clock >= 16 && gap.clock <= 21, `at a particular evening hour (${gap.clock})`);
  assert.ok(runRules(kit, 'windy', gapRules, { seed: 3 }).allLit, 'the same rules look fine on the windy day: only the still day shows the gap');
  const said = gapLines(kit, still, gap, gapRules, true); assert.match(said[0], /^At \d+ pm, .*(home|terrace|cottage|court).* went dark\.$/); assert.match(said[1], /No rule fitted \d+ pm, so the battery waited\. It still had power in it\./);
  assert.match(gapFix(gap, true), /add a rule for that time/);
  // adding the missing rule closes the gap
  const fixed = runRules(kit, 'still', R(['midday', 'charge'], ['calm', 'use']), { seed: 3 }); assert.ok(fixed.litHours > still.litHours + 10); assert.ok(fixed.hours[gap.i].dark < gap.dark);
  // the other reasons
  const robbed = runRules(kit, 'still', R(['always', 'charge']), { seed: 3 }); const g2 = explain(kit, robbed, 0); assert.equal(g2.why, 'charge'); assert.equal(g2.rule, 0); assert.match(gapLines(kit, robbed, g2, null, true)[1], /Rule 1 said charge\. The battery took power the homes needed\./);
  const drained = runRules(kit, 'still', R(['always', 'use']), { seed: 3 }); const g3 = mainGap(kit, drained); assert.equal(g3.why, 'empty'); assert.ok(g3.missed !== undefined, 'it names an earlier hour with power to spare'); assert.match(gapLines(kit, drained, g3, null, true)[1], /it was empty\. At .* there was power to spare, and no rule said charge\./);
  const waited = runRules(kit, 'still', R(['evening', 'hold']), { seed: 3 }); const g4 = explain(kit, waited, 13); assert.equal(g4.why, 'hold'); assert.match(gapLines(kit, waited, g4, null, false)[1], /Rule 1 said hold/);
  assert.equal(explain(kit, still, 0), null, 'a lit hour has no gap'); assert.equal(mainGap(kit, runRules(kit, 'windy', GOOD)), null);
  for (const why of ['norule', 'hold', 'charge', 'empty', 'full', 'short']) for (const j of [true, false]) assert.ok(gapFix({ why }, j).length > 10);
  // the school: last in line unless the rule says otherwise
  const noSchool = runRules(kit, 'still', R(['midday', 'charge'])), withSchool = runRules(kit, 'still', { ...R(['midday', 'charge']), school: true });
  assert.ok(withSchool.schoolHours > noSchool.schoolHours); assert.ok(withSchool.litHours <= noSchool.litHours, 'lighting the school first costs a home its light: a choice, not a mistake');
});

test('Florence drafts the first rules from the hand-run day, and the comparison is plain facts', () => {
  const fc = forecast('today', 3); const modes = fc.map((f) => (f.block === 'midday' ? 'charge' : f.block === 'evening' ? 'use' : 'hold'));
  assert.deepEqual(draftFromHand(modes, 'today', 3), [{ when: 'midday', then: 'charge' }, { when: 'evening', then: 'use' }]);
  assert.deepEqual(draftFromHand(fc.map(() => 'hold')), [], 'nothing done by hand: nothing drafted'); assert.deepEqual(draftFromHand(null), []);
  assert.deepEqual(draftFromHand(fc.map((f, i) => (i === 3 ? 'charge' : 'hold'))), [], 'one hour is not a habit');
  const cmp = compare(kitM, modes, GOOD, { seed: 3 });
  assert.equal(cmp.hand.dayId, 'today'); assert.equal(cmp.auto.dayId, 'today'); assert.equal(cmp.diff, cmp.auto.litHours - cmp.hand.litHours); assert.equal(cmp.test.days.length, 3);
  const lines = compareLines(cmp, true, true); assert.equal(lines.length, 3); assert.match(lines[0], /^By hand, today: \d+ lit hours out of 192\.$/); assert.match(lines[2], /windy day \d+\/192, still day \d+\/192, winter night \d+\/192/);
  assert.equal(compareLines(cmp, true, false).length, 1, 'no hand-run day this time: only the test days');
  for (const j of [true, false]) for (const diff of [5, 0, -5]) { const s = compareSay({ ...cmp, diff }, j, true) + compareLines({ ...cmp, diff }, j, true).join(' '); assert.doesNotMatch(s, /pass|fail|wrong|score|well done|correct/i, 'no pass or fail'); }
});

test('words: plain, short, built in, and nothing about catching anyone out', () => {
  assert.equal(clockWord(6, true), '6 am'); assert.equal(clockWord(12, true), '12 noon'); assert.equal(clockWord(0, true), 'midnight'); assert.equal(clockWord(19, true), '7 pm'); assert.equal(clockWord(19, false), '19:00'); assert.equal(clockWord(24, true), 'midnight');
  assert.equal(ruleLine({ when: 'calm', then: 'use' }, true), 'If the wind drops, use the battery.'); assert.equal(ruleLine({ when: 'midday', then: 'charge' }, true), 'At midday, charge the battery.'); assert.equal(ruleLine({ when: 'low', then: 'hold' }, false), 'If the battery is below 30%, hold the battery.');
  assert.match(rulesSpoken({ list: NAIVE.list, school: true }, true), /^Rule 1\. If the wind drops, use the battery\. Rule 2\. At midday, charge the battery\. After dark, light the school first\.$/);
  const all = [];
  for (const j of [true, false]) {
    for (const k of [kitE, kitM, kitF]) all.push(...intro(k, j, false), ...intro(k, j, true));
    for (const id of Object.keys(HINT)) all.push(j ? HINT[id].j : HINT[id].s);
    for (const d of DAY_IDS) all.push(j ? T.day[d].j : T.day[d].s, j ? T.dayNote[d].j : T.dayNote[d].s);
    for (const m of MODES) all.push(j ? T.mode[m].j : T.mode[m].s, j ? T.modeHint[m].j : T.modeHint[m].s, thenWord(m, j));
    for (const r of [R(), NAIVE, GOOD]) { const t = testRules(kitM, r); all.push(resultsSay(t, j), resultsSay(t, j, testRules(kitM, R()))); for (const d of t.days) { const g = mainGap(kitM, d); all.push(...gapLines(kitM, d, g, r, j), gapFix(g, j)); } }
    all.push(unusedLine(2, j), ...handSummary(kitM, runModes(kitM, 'today', Array(24).fill('hold')), j), ...handSummary(kitM, runModes(kitM, 'windy', Array(24).fill('hold')), j));
  }
  for (const s of all) {
    assert.equal(typeof s, 'string'); assert.ok(s.length <= 190, `short: ${s}`);
    assert.doesNotMatch(s, /coin|budget|£|\$|credit/i, `no money: ${s}`);
    assert.doesNotMatch(s, /\b(mistakes?|wrong|tricks?|catch|lied|fooled|fail\w*)\b|undefined|NaN|\[object/i, `no catching out, no broken text: ${s}`);
    assert.doesNotMatch(s, /\b(color|center|program|gray)\b/, `British spelling: ${s}`);
  }
  for (const id of Object.keys(T.stage)) assert.ok(T.stage[id].length <= 80, 'stage lines fit the leader’s list');
  // who went dark is named plainly
  const still = runRules(kitM, 'still', R()); const h = still.hours[still.worst]; const names = darkNames(kitM, h);
  assert.match(names, /\d (home|timber terrace|straw cottage|earth home|brick terrace|cohousing court)s?/); assert.equal(darkNames(kitM, { lit: kitM.homes.map(() => false), schoolLit: false }), '8 homes and the school');
  const one = { lit: kitM.homes.map((_, i) => i !== 0), schoolLit: true }; assert.equal(darkNames(kitM, one), '1 timber terrace');
  assert.equal(darkNames(kitE, { lit: kitE.homes.map(() => false), schoolLit: true }), '6 practice homes');
  assert.equal(darkNames(kitM, { lit: kitM.homes.map(() => true), schoolLit: false }), 'the school');
});

test('the record: the rules as lines, the results, a chart of the three test days, and what was practised', () => {
  for (const j of [true, false]) {
    const rules = { list: (j ? GOOD.list : [...GOOD.list.slice(0, 3), { when: 'low', then: 'hold' }, { when: 'evening', then: 'use' }, { when: 'always', then: 'use' }]), school: true };
    const cmp = compare(kitM, Array(24).fill('hold'), rules, { seed: 3 });
    const lines = madeLines(rules, cmp, j, true); assert.ok(lines.length <= 6 && lines.length >= 3); assert.ok(lines.every((l) => l.length <= 120), lines.join(' | '));
    assert.match(lines[0], /^1\. In the morning, .* 2\. If the wind is strong, charge the battery\.$/); assert.ok(lines.some((l) => /^Homes lit: windy day \d+%, still day \d+%, winter night \d+%\.$/.test(l))); assert.ok(lines.some((l) => /^By hand \d+% lit; the rules on the same day \d+%\.$/.test(l)));
    assert.ok(!madeLines(rules, cmp, j, false).some((l) => /By hand/.test(l)));
    const pic = picture(kitM, cmp.test.days, j); assert.ok(pic.startsWith('<svg') && pic.length < 200000, `picture size ${pic.length}`);
    assert.doesNotMatch(pic, /<script|on\w+\s*=|javascript:|NaN|undefined/i); assert.match(pic, /A windy day/); assert.match(pic, /A still day/); assert.match(pic, /A winter night/);
    const did = { hand: true, charged: true, used: true, rules: rules.list.length, tests: 2, changed: true, improved: true };
    const r = cleanResult({ finished: true, record: { made: { title: madeTitle(j), lines, picture: pic }, practised: practised(did, j) }, town: { kind: 'power-rules', data: { v: 1, rules } } });
    assert.equal(r.finished, true); assert.equal(r.record.made.picture, pic, 'the contract keeps the picture'); assert.equal(r.record.made.lines.length, lines.length); assert.equal(r.record.practised.length, 4); assert.deepEqual(r.town.data.rules, rules);
    assert.ok(cleanMade({ title: madeTitle(j), picture: daySvg(kitM, 'today', { junior: j }) }).picture, 'the desk drawing is clean too');
  }
  // practised lines follow what was done
  const least = practised({ hand: false, rules: 1, tests: 1 }, true); assert.equal(least.length, 2); assert.match(least[0], /^writing a rule for a system/); assert.match(least[1], /^testing the rules on a windy day/);
  assert.match(practised({ hand: true, charged: false, used: true, rules: 3, tests: 1 }, true)[0], /^running a town’s power by hand/);
  assert.match(practised({ hand: true, charged: true, used: true, rules: 3, tests: 3, changed: true, improved: false }, true)[3], /^changing a rule and testing again/);
  assert.match(practised({ hand: true, charged: true, used: true, rules: 3, tests: 3, changed: true, improved: true }, true)[3], /^finding the hour homes went dark/);
  for (const l of practised({ hand: true, charged: true, used: true, rules: 4, tests: 9, changed: true, improved: true }, false)) { assert.ok(l.length <= 120); assert.doesNotMatch(l, /learn|improv|better/i, 'what was practised, never what was learned'); }
});

test('drawings: the day chart shows the hours that happened, and the dial and key are plain SVG', () => {
  const day = runRules(kitM, 'still', R());
  const before = daySvg(kitM, 'still', { junior: true }), after = daySvg(kitM, 'still', { junior: true, hours: day.hours, cursor: 5, mark: day.worst });
  assert.ok(after.length > before.length); assert.match(after, new RegExp(`>${day.hours[day.worst].dark}</text>`), 'a dark hour carries its number of homes');
  assert.match(before, /Morning/); assert.match(before, /6am/); assert.match(daySvg(kitM, 'still', { junior: false }), /kW/);
  assert.equal(needLine(kitM, 'winter').length, 24); assert.ok(needLine(kitM, 'winter')[13] > needLine(kitM, 'still')[13]);
  for (const s of [before, after, dialSvg('wind', '#000'), legend(true), legend(false)]) { assert.ok(s.startsWith('<svg')); assert.doesNotMatch(s, /NaN|undefined|<script|on\w+\s*=/); }
});

test('the module object, and what it leaves in the town', () => {
  assert.equal(mod.id, 'power'); assert.equal(typeof mod.run, 'function'); assert.equal(typeof mod.show, 'function'); assert.ok(mod.css.length > 500);
  for (const rule of mod.css.split('}').map((r) => r.trim()).filter((r) => r && !r.startsWith('@'))) for (const sel of rule.split('{')[0].split(',')) { const s = sel.replace(/^@media[^{]*\{/, '').trim(); if (s) assert.ok(s.startsWith('#module[data-module="power"]'), `css stays inside the module: ${s}`); }
  // show() draws nothing, and breaks nothing, when it is given nothing to stand on
  assert.equal(typeof mod.show(null, null), 'function'); assert.equal(typeof mod.show({ engine: {} }, { rules: NAIVE }), 'function');
  assert.ok(cleanTown({ kind: 'power-rules', data: { v: 1, rules: { list: Array(6).fill({ when: 'afternoon', then: 'charge' }), school: true } } }), 'the town data is small');
  // the cabinet stands on the nearest open tile to the town's battery (or the school), never on something built
  assert.equal(signSpot(MID, tiles, kitM), '1,1'); const k = signSpot(EMPTY, tiles, kitE); assert.ok(k && !tiles.get(k).fixed && k !== '9,8');
  assert.equal(signSpot(EMPTY, new Map(), kitE), null);
});
