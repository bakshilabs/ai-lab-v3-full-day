// Mission 2, forecasting: read tomorrow's wind and sun forecast and the town's usual demand, and mark the hours when
// the town will be short of power (before any battery helps). Pure: no page, no 3D.
//   1  Today: one short spell in the evening.
//   2  A grey, still morning: two short spells (breakfast and the evening).
//   3  A winter day when the wind dies after lunch: a long spell from mid-afternoon.
// Ages 13-17 then turn the chart into energy: how many kilowatt-hours the shortfall adds up to (power x hours).
import { forecast, isWinter, KW, HOURS } from './model.js';
import { needLine } from './chart.js';
import { clockWord } from './words.js';

export const FORECAST_ROUNDS = ['today', 'grey', 'front'];
export const CLOSE = 0.08; // within 8% either way an hour is "close": either answer is counted as right

// Each hour: made (wind + sun), need, and the truth: 'short', 'enough' or 'close'.
export function hoursOf(kit, dayId, seed = 1) {
  const fc = forecast(dayId, seed); const need = needLine(kit, dayId, seed);
  return fc.map((f, i) => { const made = kit.wind * f.wind + kit.solar * f.sun; const r = need[i] ? made / need[i] : 9; return { i, clock: f.clock, made, need: need[i], truth: r < 1 - CLOSE ? 'short' : r > 1 + CLOSE ? 'enough' : 'close' }; });
}
// Check the child's marks (a set of hour indexes marked short). wrong: hours marked wrongly either way.
export function checkMarks(hours, marked) {
  const set = new Set(marked); const wrong = []; let missed = 0, extra = 0;
  for (const h of hours) {
    const m = set.has(h.i);
    if (h.truth === 'short' && !m) { wrong.push(h.i); missed++; } else if (h.truth === 'enough' && m) { wrong.push(h.i); extra++; }
  }
  return { right: wrong.length === 0, wrong, missed, extra, shortCount: hours.filter((h) => h.truth === 'short').length };
}
// The short spells, as runs of short (or close) hours that contain at least one clearly short hour.
export function spells(hours) {
  const out = []; let cur = null;
  for (const h of hours) { if (h.truth !== 'enough') { if (!cur) { cur = { from: h.i, to: h.i, sure: false }; out.push(cur); } cur.to = h.i; if (h.truth === 'short') cur.sure = true; } else cur = null; }
  return out.filter((s) => s.sure);
}
// Energy short over the day, in kWh (ages 13-17): the gap in each short hour, power x one hour, added up.
export const shortKwh = (hours) => Math.round(hours.reduce((n, h) => n + Math.max(0, h.need - h.made), 0) * KW);
export const peakGapKw = (hours) => Math.round(Math.max(0, ...hours.map((h) => h.need - h.made)) * KW);
// Three choices for the energy question: the right total, the biggest gap in kW written as if it were kWh (the
// common mix-up), and the total for only half the spell. Shuffled by a fixed order so a replay looks the same.
export function energyChoices(hours, round = 0) {
  const right = shortKwh(hours); const peak = peakGapKw(hours); const half = Math.max(1, Math.round(right / 2));
  let opts = [{ v: right, ok: true, why: 'right' }, { v: peak, ok: false, why: 'peak' }, { v: half, ok: false, why: 'half' }];
  const seen = new Set(); opts = opts.filter((o) => (seen.has(o.v) ? false : seen.add(o.v)));
  if (opts.length < 3) opts.push({ v: right * 2, ok: false, why: 'double' });
  const order = [[1, 0, 2], [2, 1, 0], [0, 2, 1]][round % 3];
  return order.map((k) => opts[k]).filter(Boolean);
}

const pick = (o, j) => (j ? o.j : o.s);
export const FC = {
  day: {
    today: { j: 'Forecast 1 of 3: today', s: 'Forecast 1 of 3: today' },
    grey: { j: 'Forecast 2 of 3: a grey, still morning', s: 'Forecast 2 of 3: a grey, still morning' },
    front: { j: 'Forecast 3 of 3: a winter day', s: 'Forecast 3 of 3: a winter day' },
  },
  note: {
    today: { j: 'Windy morning. Sunny midday. The wind drops in the evening.', s: 'Windy morning, sunny midday, the wind easing by evening.' },
    grey: { j: 'No wind at breakfast. Cloudy. A breeze until teatime. Windy at night.', s: 'Calm, overcast dawn; a breeze late morning to teatime; windy overnight.' },
    front: { j: 'Cold, so more power is used. The wind dies after lunch. It comes back in the night.', s: 'Cold (demand +25%); the wind dies after lunch and returns before dawn.' },
  },
  how: { j: 'Tap each hour when the bars will be lower than the red line. Those hours will be short.', s: 'Mark each hour where forecast supply (bars) is below demand (red line).' },
  check: { j: 'Check my forecast ➜', s: 'Check forecast ➜' }, clear: { j: 'Clear', s: 'Clear' },
  shortTag: { j: 'Short', s: 'Short' },
};
export const fcDay = (id, j) => pick(FC.day[id], j);
export const fcNote = (id, j) => pick(FC.note[id], j);
// A spell said from its first clearly short hour to the end of its last one (close hours at the edges are left out,
// so the words match the marks a child was asked to make).
export function sureSpells(hours) {
  return spells(hours).map((s) => { let a = s.from, b = s.to; while (hours[a].truth !== 'short') a++; while (hours[b].truth !== 'short') b--; return { from: a, to: b }; });
}
export function spellWords(hours, j) {
  return sureSpells(hours).map((s) => `${clockWord(hours[s.from].clock, j)} to ${clockWord((hours[s.to].clock + 1) % 24, j)}`);
}
// The reveal after a right answer: when homes would start going dark with no battery, and the worst hour.
export function revealLine(hours, j) {
  const worst = hours.reduce((a, h) => (h.need - h.made > a.need - a.made ? h : a), hours[0]);
  const sp = sureSpells(hours).find((s) => s.from <= worst.i && worst.i <= s.to) || sureSpells(hours)[0];
  const from = clockWord(hours[sp ? sp.from : worst.i].clock, j), at = clockWord(worst.clock, j);
  return { worst, line: j ? `Without a battery, homes would start going dark at ${from}, and it is worst at ${at}. Now the control room knows to plan for it.` : `With no storage: shortfall from ${from}, worst at ${at}, with a gap of ${Math.round((worst.need - worst.made) * KW)} kW. That is the case to plan for.` };
}
export function checkSay(res, tries, hours, j) {
  if (res.right) {
    const sp = spellWords(hours, j);
    return j ? `Right. The town will be short ${sp.length === 1 ? `from ${sp[0]}` : `twice: ${sp.join(', and ')}`}.` : `Correct: shortfall ${sp.length === 1 ? sp[0] : sp.join(' and ')}.`;
  }
  const n = res.wrong.length;
  if (tries <= 1) return j ? `${n === 1 ? 'One hour is' : `${n} hours are`} not right yet. Look again: where are the bars below the red line?` : `${n} hour${n === 1 ? ' is' : 's are'} wrong. Compare each bar with the demand line again.`;
  if (tries === 2) return res.missed >= res.extra
    ? (j ? `You missed ${res.missed === 1 ? 'one short hour' : `${res.missed} short hours`}. I have put a ring round the hours to look at.` : `${res.missed} short hour${res.missed === 1 ? '' : 's'} missed; the hours to recheck are ringed.`)
    : (j ? `${res.extra === 1 ? 'One hour you marked has' : `${res.extra} hours you marked have`} enough power. I have put a ring round the hours to look at.` : `${res.extra} marked hour${res.extra === 1 ? ' has' : 's have'} enough supply; the hours to recheck are ringed.`);
  return j ? 'Here are the short hours. Tap the ringed ones to match, then check.' : 'The ringed hours are the ones to change. Match them, then check.';
}
export function energyAsk(hours, j) {
  return j ? '' : `How much energy is the town short over the whole day? Each hour, the gap in kW for one hour is that many kWh. Add them up.`;
}
export function energySay(choice, hours) {
  const right = shortKwh(hours); const peak = peakGapKw(hours);
  if (choice.ok) return `Right: about ${right} kWh. That is the energy a battery would have to store in advance to cover it.`;
  if (choice.why === 'peak') return `That mixes up kW and kWh. ${peak} kW is the biggest gap in a single hour. Energy (kWh) is power over time: add the gap for every short hour.`;
  if (choice.why === 'half') return 'That is only part of the spell. Add every short hour, to the end.';
  return 'That is too much. Add the gap for each short hour once.';
}
export const winterDay = isWinter;
export { HOURS };
