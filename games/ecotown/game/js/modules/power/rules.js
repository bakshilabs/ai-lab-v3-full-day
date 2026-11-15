// Power control room: the rules a child writes from tiles, and the small interpreter that runs them. Pure.
// A rule is { when, then }: "when <condition>, <action>". Each hour the system reads the rules from the top and
// follows the FIRST one whose condition is true. If none is true the battery waits. That is the system's honest
// limit: it does exactly what the rules say and nothing more.
import { MODES, TEST_DAYS, WIND_STRONG, WIND_LOW, SUN_BRIGHT, BLOCKS, runDay, runModes, forecast, clockAt, HOURS } from './model.js';

export const LOW_BATTERY = 0.3, HIGH_BATTERY = 0.8;
// condition id -> test on what the desk can see this hour
export const TESTS = {
  morning: (x) => x.block === 'morning', midday: (x) => x.block === 'midday', afternoon: (x) => x.block === 'afternoon', evening: (x) => x.block === 'evening', night: (x) => x.block === 'night',
  windy: (x) => x.wind >= WIND_STRONG, calm: (x) => x.wind < WIND_LOW, sunny: (x) => x.sun >= SUN_BRIGHT,
  low: (x) => x.battery < LOW_BATTERY, high: (x) => x.battery >= HIGH_BATTERY,
  always: () => true,
};
const JUNIOR_WHEN = ['windy', 'calm', 'sunny', 'morning', 'midday', 'afternoon', 'evening', 'night', 'always'];
const SENIOR_WHEN = ['windy', 'calm', 'sunny', 'low', 'high', 'morning', 'midday', 'afternoon', 'evening', 'night', 'always'];
export const whensFor = (junior) => (junior ? JUNIOR_WHEN : SENIOR_WHEN);
export const maxRules = (junior) => (junior ? 4 : 6);

// Keep only what a rule set may hold (also used on what was saved last time).
export function cleanRules(raw, junior = true) {
  const whens = whensFor(junior); const list = [];
  for (const r of Array.isArray(raw?.list) ? raw.list : []) { if (r && whens.includes(r.when) && MODES.includes(r.then) && list.length < maxRules(junior)) list.push({ when: r.when, then: r.then }); }
  return { list, school: !!raw?.school };
}
// What the system does this hour: the first rule that fits, or nothing.
export function decide(rules, info) {
  const list = rules?.list || [];
  for (let n = 0; n < list.length; n++) if (TESTS[list[n].when]?.(info)) return { mode: list[n].then, rule: n };
  return { mode: 'hold', rule: -1 };
}
export const runRules = (kit, dayId, rules, { seed = 1 } = {}) => runDay(kit, dayId, (info) => decide(rules, info), { seed, schoolFirst: !!rules?.school });
// The three test days, and how often each rule was followed across them.
export function testRules(kit, rules, opts) {
  const days = TEST_DAYS.map((d) => runRules(kit, d, rules, opts)); const used = (rules?.list || []).map(() => 0); let none = 0;
  for (const d of days) for (const h of d.hours) { if (h.rule >= 0) used[h.rule]++; else none++; }
  const litHours = days.reduce((n, d) => n + d.litHours, 0), total = days.reduce((n, d) => n + d.total, 0);
  return { days, used, none, litHours, total, share: total ? litHours / total : 1, allLit: days.every((d) => d.allLit) };
}

// Why were homes dark at this hour? A plain reason the words can be built from:
//   norule  no rule fitted, so the battery waited          hold    a rule said wait
//   charge  a rule said charge, and charging took power    empty   the rule said use, but the battery was empty
//   full    the battery gave all it can in one hour        short   (nothing to blame: there was not enough to go round)
// With 'empty' comes the hour it ran out, and an earlier hour with power to spare when the rules did not charge.
export function explain(kit, day, i) {
  const h = day.hours[i]; if (!h || (h.dark === 0 && h.schoolLit)) return null;
  const out = { i, clock: h.clock, dark: h.dark, school: !h.schoolLit, rule: h.rule, why: 'short' };
  if (h.mode === 'hold') out.why = h.rule < 0 ? 'norule' : 'hold';
  else if (h.mode === 'charge') out.why = h.toBattery > 0.01 ? 'charge' : h.rule < 0 ? 'norule' : 'hold';
  else if (h.levelBefore <= 0.05) out.why = 'empty';
  else if (h.fromBattery >= kit.rate - 0.01) out.why = 'full';
  else out.why = 'empty'; // it gave the little it had left
  if (out.why !== 'charge' && h.levelBefore > 0.05 && h.mode !== 'use') out.had = true; // there was power in the battery, unused
  if (out.why === 'empty') {
    let ran = i; while (ran > 0 && day.hours[ran - 1].level <= 0.05) ran--; out.ranOut = day.hours[ran].clock;
    const missed = day.hours.slice(0, i).filter((x) => x.spare > 0.5 && x.mode !== 'charge' && x.levelBefore < kit.cap - 0.5); if (missed.length) { out.missed = missed[0].clock; out.missedHours = missed.length; }
    const drained = day.hours.slice(0, i).filter((x) => x.fromBattery > 0.01 && !x.dark); // (using it earlier is not a fault; kept for the words)
    out.usedEarlier = drained.length;
  }
  return out;
}
// The hour worth looking at for a day: the worst dark hour, with its reason. null when everything stayed lit.
export const mainGap = (kit, day) => (day.worst < 0 ? null : explain(kit, day, day.worst));

// A first rule Florence can offer, read from the day the child ran by hand: the part of the day in which they
// charged most becomes "when <that part>, charge" (and the same for using the battery). Built in, never free text.
export function draftFromHand(modes, dayId = 'today', seed = 1) {
  const fc = forecast(dayId, seed); const count = {}; const list = [];
  fc.forEach((f, i) => { const m = modes?.[i]; if (m === 'charge' || m === 'use') { const k = `${m}:${f.block}`; count[k] = (count[k] || 0) + 1; } });
  for (const m of ['charge', 'use']) { let best = null; for (const b of BLOCKS) { const n = count[`${m}:${b}`] || 0; if (n >= 2 && (!best || n > best.n)) best = { b, n }; } if (best) list.push({ when: best.b, then: m }); }
  return list;
}

// Plain facts for the last screen: the hand-run day beside the same day run by the rules, and the three test days.
export function compare(kit, handModes, rules, opts) {
  const hand = runModes(kit, 'today', handModes, opts); const auto = runRules(kit, 'today', rules, opts); const test = testRules(kit, rules, opts);
  return { hand, auto, test, diff: auto.litHours - hand.litHours };
}
export const sameRules = (a, b) => JSON.stringify(cleanRules(a, false)) === JSON.stringify(cleanRules(b, false));
export { clockAt, HOURS };
