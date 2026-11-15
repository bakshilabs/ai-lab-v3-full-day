// Power control room: the six missions of the hour, in order, and what is kept between visits. Pure: no page, no 3D.
// Each mission is a different real use of a power control room, teaching a different real skill (docs/curriculum.md,
// section 6). They open in order; a finished mission may be played again.
import { cleanRules } from './rules.js';
import { HOURS } from './model.js';

export const MISSIONS = [
  { id: 'balance', icon: '⚖️',
    use: { j: 'The grid must balance', s: 'The grid must balance' },
    job: { j: 'Grid control engineers keep the power made level with the power used, every minute of every day.', s: 'Grid control engineers match supply to demand every second; if they drift apart, the grid’s frequency moves away from 50 Hz.' },
    how: { j: 'Each ten minutes, set the town battery so the scale is level. Three rounds, faster each time.', s: 'Every ten minutes, set battery output so supply equals demand. Three rounds of eight steps.' },
    can: { j: 'You can keep supply level with demand as it changes.', s: 'You can balance supply and demand as both change, reading frequency as the sign of imbalance.' } },
  { id: 'forecast', icon: '🌦️',
    use: { j: 'Forecasting', s: 'Forecasting' },
    job: { j: 'Energy forecasters read the weather forecast to say when wind and sun will not make enough power.', s: 'Energy analysts turn weather forecasts into a forecast of generation, so shortfalls are planned for, not discovered.' },
    how: { j: 'Read the chart. Tap every hour when the town will be short of power.', s: 'Read each forecast chart and mark every hour of shortfall; then size it in kWh.' },
    can: { j: 'You can read a forecast chart and say when power will be short.', s: 'You can read a supply and demand forecast, find the shortfall and turn kW into kWh.' } },
  { id: 'storage', icon: '🔋',
    use: { j: 'Storage', s: 'Storage' },
    job: { j: 'Battery operators store spare wind and sun power, and give it back when the town needs it.', s: 'Storage operators decide when to charge and discharge, moving energy from hours of surplus to hours of shortfall.' },
    how: { j: 'Run the town battery by hand: Charge, Hold or Use, hour by hour. Three days, each harder.', s: 'Set the battery hour by hour (charge, hold, use) through three harder days.' },
    can: { j: 'You can choose when to store power and when to use it.', s: 'You can schedule a store against a forecast so the energy is there when demand peaks.' } },
  { id: 'rules', icon: '📋', built: true,
    use: { j: 'Automation rules', s: 'Automation rules' },
    job: { j: 'Control engineers write rules, so the system can run itself day and night.', s: 'Control engineers write the rules automated systems follow, then test them on many kinds of day.' },
    how: { j: 'Write rules from tiles. Test them on a windy day, a still day and a winter night.', s: 'Build rules from tiles, test them on three days, find the gaps and fix them.' },
    can: { j: 'You can write rules for a machine and test them.', s: 'You can write, test and debug the rules an automated system follows.' } },
  { id: 'demand', icon: '🔌',
    use: { j: 'Smart demand', s: 'Smart demand' },
    job: { j: 'Energy planners help people run washing and car charging when there is spare clean power.', s: 'Demand-response planners shift flexible demand into hours of surplus renewable power, within what people need.' },
    how: { j: 'Move the jobs to times with spare wind and sun. Keep to the times people need.', s: 'Move each flexible job into surplus hours, inside its time window.' },
    can: { j: 'You can move power use to greener times and still meet people’s needs.', s: 'You can shift flexible demand to surplus hours while respecting each user’s constraints.' } },
  { id: 'storm', icon: '⛈️',
    use: { j: 'Storm night', s: 'Storm night' },
    job: { j: 'Emergency planners and engineers decide who gets power first after a storm, and bring it back safely.', s: 'Emergency planners and network engineers isolate faults, restore priority sites first and re-energise safely.' },
    how: { j: 'Find the broken line, choose who gets power first, then bring everyone back safely.', s: 'Isolate the fault, restore by priority within capacity, then repair and restore safely.' },
    can: { j: 'You can put people’s safety first in an emergency and restore a system step by step.', s: 'You can prioritise in an emergency and restore a network safely, one step at a time.' } },
];
export const MISSION_IDS = MISSIONS.map((m) => m.id);
const pick = (o, j) => (j ? o.j : o.s);

// ---- what is kept between visits (never anything typed: there is no typing here)
const LETTER = { c: 'charge', h: 'hold', u: 'use' };
export const readHand = (s) => (typeof s === 'string' && s.length === HOURS && [...s].every((c) => LETTER[c]) ? [...s].map((c) => LETTER[c]) : null);
export const writeHand = (modes) => (modes ? modes.map((m) => m[0]).join('') : '');
const num = (x, lo, hi) => (Number.isFinite(x) ? Math.max(lo, Math.min(hi, Math.round(x))) : null);
// The saved progress, cleaned. A save from the first version (one ten-minute loop: the hand-run day and the rules)
// becomes mission 4 done, with its rules and its hand-run day kept.
export function cleanProgress(saved, junior = true) {
  const s = saved && typeof saved === 'object' ? saved : {};
  const done = MISSION_IDS.map((_, i) => !!(Array.isArray(s.done) && s.done[i]));
  if (s.v === 1 && s.stage === 'done') done[3] = true;
  const r = s.res && typeof s.res === 'object' ? s.res : {};
  const res = {
    balance: r.balance ? { level: num(r.balance.level, 0, 24), of: num(r.balance.of, 1, 24) } : null,
    forecast: r.forecast ? { tries: num(r.forecast.tries, 0, 99), kwh: !!r.forecast.kwh, spells: num(r.forecast.spells, 0, 9) } : null,
    storage: r.storage && Array.isArray(r.storage.dark) ? { dark: r.storage.dark.slice(0, 3).map((x) => num(x, 0, 999)), total: num(r.storage.total, 1, 999) } : null,
    rules: r.rules ? { share: num(r.rules.share, 0, 100), diff: num(r.rules.diff, -999, 999) } : null,
    demand: r.demand ? { moved: num(r.demand.moved, 0, 99), kwh: num(r.demand.kwh, 0, 9999) } : null,
    storm: r.storm ? { trips: num(r.storm.trips, 0, 99) } : null,
  };
  return { v: 2, done, res, hand: readHand(s.hand), rules: cleanRules(s.rules, junior), changed: !!s.changed, improved: !!s.improved };
}
export const packProgress = (p) => ({ v: 2, done: p.done, res: p.res, hand: writeHand(p.hand), rules: p.rules, changed: p.changed, improved: p.improved });
// The first mission not yet done (or -1 when all six are done). Missions up to it are open; later ones are locked.
export const nextMission = (done) => done.findIndex((d) => !d);
export const isOpen = (done, i) => { const n = nextMission(done); return n < 0 || i <= n; };
export const allDone = (done) => done.every(Boolean);
export const doneCount = (done) => done.filter(Boolean).length;

// ---- the take-home record
export const madeTitle = () => 'My power control room';
const pct = (a, b) => Math.round((a / Math.max(1, b)) * 100);
export function recordLines(p, j) {
  const r = p.res; const out = [];
  out.push(r.balance ? (j ? `Balanced the grid: ${r.balance.level} of ${r.balance.of} ten-minute steps level.` : `Balancing: ${r.balance.level} of ${r.balance.of} steps held at 50 Hz.`) : 'Balanced the grid as the town woke up.');
  out.push(r.forecast?.spells ? (j ? `Read three forecasts and found every hour of short power.` : `Forecasting: found every shortfall hour on three days${r.forecast.kwh ? ', and sized it in kWh' : ''}.`) : 'Read three forecasts and found the short hours.');
  out.push(r.storage ? (j ? `Ran the town battery for three days: homes lit ${r.storage.dark.map((d) => `${pct(r.storage.total - d, r.storage.total)}%`).join(', ')}.` : `Storage: three days by hand, ${r.storage.dark.map((d) => `${pct(r.storage.total - d, r.storage.total)}%`).join(' / ')} of home-hours supplied.`) : 'Ran the town battery by hand for three days.');
  const n = p.rules?.list?.length || 0;
  out.push(r.rules ? (j ? `Wrote ${n} rule${n === 1 ? '' : 's'}. On the test days they kept ${r.rules.share}% of homes lit.` : `Automation: ${n} rule${n === 1 ? '' : 's'}, ${r.rules.share}% of home-hours supplied on the three test days.`) : `Wrote ${n || 'some'} rules for the system to follow.`);
  out.push(r.demand ? (j ? `Moved ${r.demand.moved} jobs to spare wind and sun. None used gas.` : `Demand response: ${r.demand.moved} jobs (${r.demand.kwh} kWh) moved onto surplus renewables.`) : 'Moved jobs to times with spare clean power.');
  out.push(j ? 'Storm night: cut off the broken line, lit the health centre and shelter first, brought everyone back.' : 'Storm night: isolated the fault, restored priority sites first, re-energised safely.');
  return out.slice(0, 6);
}
// "You practised ...": two to four lines, from what the child did.
export function practisedLines(p, j) {
  const out = [];
  if (p.done[0] || p.done[1]) out.push(p.done[1] ? 'keeping supply level with demand, and reading a forecast to see shortfalls coming' : 'keeping supply level with demand as it changes');
  if (p.done[2] || p.done[3]) out.push(p.done[3] ? 'choosing when to store energy, then writing and testing rules so a system does it by itself' : 'choosing when to store energy and when to use it');
  if (p.done[4]) out.push('moving power use to greener hours while meeting what people need');
  if (p.done[5]) out.push('putting people’s safety first in an emergency and restoring a system step by step');
  while (out.length < 2) out.push('running a town’s power from a control room');
  return out.slice(0, 4);
}
export const missionUse = (i, j) => pick(MISSIONS[i].use, j);
export { pick };
