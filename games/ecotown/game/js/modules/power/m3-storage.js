// Mission 3, storage: the town battery run by hand through three days that get harder. Pure: no page, no 3D.
//   1  Today: the battery starts a quarter full; a windy morning and a sunny midday give plenty to store.
//   2  A still day, battery empty at dawn: the wind dies before lunch, so the store must be filled at the right time.
//   3  A winter day, battery empty: dark at 4 pm, demand up a quarter, a short weak sun.
// The goal for each day is honest: it comes from the best any plan can do on that day in this town (worked out below),
// so a goal is never impossible, and "charge at midday, use in the evening" is not enough on days 2 and 3.
import { MODES, HOURS, forecast, stepHour, isWinter, runModes, clockAt } from './model.js';
import { clockWord } from './words.js';

export const STORE_ROUNDS = [
  { day: 'today', start: 0.25 },
  { day: 'still', start: 0 },
  { day: 'winter', start: 0 },
];
const pick = (o, j) => (j ? o.j : o.s);

// The best plan for a day: the most lit home-hours any choice of charge / hold / use can give, hour by hour.
// A search over the battery level (to a quarter of a unit), so it is exact enough and quick (well under a second).
export function bestPlan(kit, dayId, start, seed = 1) {
  const fc = forecast(dayId, seed); const winter = isWinter(dayId);
  let states = new Map([[0, { level: kit.cap * start, lit: 0, modes: '' }]]);
  for (const f of fc) {
    const next = new Map();
    for (const s of states.values()) for (const m of MODES) {
      const h = stepHour(kit, f, s.level, m, { winter }); const k = Math.round(h.level * 4);
      const v = { level: h.level, lit: s.lit + h.litCount + (h.schoolLit ? 0.001 : 0), modes: s.modes + m[0] }; const o = next.get(k);
      if (!o || o.lit < v.lit || (o.lit === v.lit && v.modes < o.modes)) next.set(k, v);
    }
    states = next;
  }
  const b = [...states.values()].reduce((a, c) => (c.lit > a.lit ? c : a));
  const modes = [...b.modes].map((c) => ({ c: 'charge', h: 'hold', u: 'use' }[c]));
  return { lit: runModes(kit, dayId, modes, { seed, startLevel: start }).litHours, modes };
}
// What a day asks for: the most dark home-hours allowed. Even the best plan may leave some dark (best < total);
// a little room is given on top, because a child steers by eye, not by search.
export function storeGoal(kit, round, seed = 1) {
  const best = bestPlan(kit, round.day, round.start, seed); const total = kit.homes.length * HOURS;
  const slack = Math.max(2, Math.round(total * 0.02)); const bestDark = total - best.lit;
  return { total, best: best.lit, bestDark, maxDark: bestDark + slack, plan: best.modes };
}
export const storeMet = (day, goal) => day.darkHours <= goal.maxDark;

// Florence's plan, said in spans: "Hold until 8 am. Charge from 8 am to 5 pm. Use the battery from 5 pm to midnight."
export function planSpans(modes) {
  const out = []; let from = 0;
  for (let i = 1; i <= HOURS; i++) if (i === HOURS || modes[i] !== modes[from]) { out.push({ mode: modes[from], from: clockAt(from), to: clockAt(i % HOURS), i: from, n: i - from }); from = i; }
  return out;
}
const MODE_WORD = { charge: { j: 'charge', s: 'charge' }, hold: { j: 'hold', s: 'hold' }, use: { j: 'use the battery', s: 'use the battery' } };
export function planLine(modes, j) {
  const spans = planSpans(modes).filter((s) => s.n >= 1);
  return spans.map((s, n) => `${n ? '' : ''}${s.mode === 'hold' ? (j ? 'Hold' : 'Hold') : s.mode === 'charge' ? 'Charge' : 'Use the battery'} from ${clockWord(s.from, j)} to ${clockWord(s.to, j)}.`).join(' ');
}
// When the child misses a goal: first a nudge, then where the trouble was, then Florence's plan in words.
// (On the fourth day run she also marks her choice on the buttons each hour.)
export function storeHint(tries, day, goal, j) {
  const spell = [...day.spells].sort((a, b) => b.to - b.from - (a.to - a.from))[0];
  const when = spell ? clockWord(day.hours[spell.from].clock, j) : '';
  if (tries <= 1) return j ? 'Not yet. Look at the chart: when is there power to spare, and when is the town short? Store the spare for the short hours.' : 'Not yet. Find the surplus hours and the shortfall hours on the chart, and move energy from one to the other.';
  if (tries === 2) return spell ? (j ? `The longest dark spell started at ${when}. Was the battery full before then? Did charging take power the homes needed?` : `The longest outage began at ${when}. Was the store full by then, and did charging ever take supply the homes needed?`) : (j ? 'So close. Try charging a little later, when there is lots to spare.' : 'Close. Charge only on a clear surplus.');
  return `${j ? 'Here is a plan that works. ' : 'A plan that meets the goal: '}${planLine(goal.plan, j)}`;
}
export function storeGoalLine(goal, j) {
  if (goal.maxDark <= 0) return j ? 'Goal: every square in the Lights row stays yellow.' : 'Goal: no home-hours without power.';
  if (j) return `Goal: the numbers in the dark squares of the Lights row add up to ${goal.maxDark} or less.${goal.bestDark > 0 ? ` Even the best plan has ${goal.bestDark}.` : ''}`;
  return goal.bestDark > 0 ? `Goal: at most ${goal.maxDark} home-hours unsupplied (the best possible is ${goal.bestDark}).` : `Goal: at most ${goal.maxDark} home-hours unsupplied over the whole day.`;
}
export const STORE_DAY = {
  today: { j: 'Day 1 of 3: today. The battery starts a quarter full.', s: 'Day 1 of 3: today, battery at 25%.' },
  still: { j: 'Day 2 of 3: a still day. The battery starts empty.', s: 'Day 2 of 3: a still day, battery empty at dawn.' },
  winter: { j: 'Day 3 of 3: a winter day. The battery starts empty, and it gets dark at 4 pm.', s: 'Day 3 of 3: a winter day, battery empty, dark from 16:00, demand up 25%.' },
};
export const storeDayLine = (round, j) => pick(STORE_DAY[round.day] || STORE_DAY.today, j);
export { MODES };
