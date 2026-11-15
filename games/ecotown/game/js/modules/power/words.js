// Power control room: every word the module says, and the take-home record. Pure: no page, no 3D.
// Florence writes no free text: each line here is built in, and only numbers and built-in names are put into it.
// j: ages 8-12, s: ages 13-17.
import { KW, TEST_DAYS } from './model.js';
import { LOW_BATTERY, HIGH_BATTERY } from './rules.js';

const pick = (o, j) => (j ? o.j : o.s);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const list = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ---- the clock
export function clockWord(clock, j) {
  const h = ((clock % 24) + 24) % 24;
  if (!j) return `${String(h).padStart(2, '0')}:00`;
  return h === 0 ? 'midnight' : h === 12 ? '12 noon' : h < 12 ? `${h} am` : `${h - 12} pm`;
}
export const clockShort = (clock, j) => { const h = ((clock % 24) + 24) % 24; return j ? (h === 0 ? '12' : h <= 12 ? String(h) : String(h - 12)) : String(h).padStart(2, '0'); };

export const T = {
  title: { j: 'Power control room', s: 'Power control room' },
  who: 'Florence',
  next: 'Next ➜', start: { j: 'Start the day ▶', s: 'Start the day ▶' }, skip: { j: 'Go to my rules ➜', s: 'Go to my rules ➜' },
  nextHour: { j: 'Next hour ➜', s: 'Next hour ➜' }, pause: 'Pause', resume: 'Carry on ▶',
  again: { j: 'Run the day again', s: 'Run the day again' }, toRules: { j: 'Write rules ➜', s: 'Write rules ➜' },
  test: { j: 'Test on three days ▶', s: 'Test on three days ▶' }, change: { j: '✎ Change the rules', s: '✎ Change the rules' }, keep: { j: 'Keep these rules ➜', s: 'Keep these rules ➜' },
  finish: { j: 'Finish ➜', s: 'Finish ➜' }, addRule: '＋ Add a rule', done: 'Done', remove: 'Remove', up: 'Move up', down: 'Move down',
  nextDay: 'Next day ➜', seeResults: 'See what happened ➜', skipRun: 'Skip to the end ➜',
  stage: { intro: 'At the control desk', hand: 'Running the day by hand', handDone: 'Looking at the hand-run day', rules: 'Writing rules', test: 'Watching the rules run three days', results: 'Finding where homes went dark', compare: 'Comparing hand and rules', done: 'Finished: rules are running the town' },
  mode: { charge: { j: 'Charge', s: 'Charge' }, hold: { j: 'Hold', s: 'Hold' }, use: { j: 'Use battery', s: 'Use battery' } },
  modeHint: {
    charge: { j: 'The battery fills up. It takes its share first.', s: 'The battery fills first; the town gets the rest.' },
    hold: { j: 'The battery waits.', s: 'The battery does nothing.' },
    use: { j: 'The battery helps when the town is short.', s: 'The battery covers the shortfall while it lasts.' },
  },
  modeIcon: { charge: '🔋', hold: '⏳', use: '💡' },
  dial: { wind: 'Wind', sun: 'Sun', battery: 'Battery', homes: { j: 'Homes lit', s: 'Homes with power' }, made: { j: 'Power made', s: 'Supply' }, need: { j: 'Power needed', s: 'Demand' } },
  level: { wind: ['Calm', 'Some', 'Strong'], sun: ['None', 'Some', 'Bright'] },
  forecast: { j: 'Forecast for the day', s: 'Forecast: supply and demand' },
  window: { j: 'Your town', s: 'The town' },
  school: 'the school',
  day: { today: { j: 'Today', s: 'Today' }, windy: { j: 'A windy day', s: 'A windy day' }, still: { j: 'A still day', s: 'A still day' }, winter: { j: 'A winter night', s: 'A winter night' } },
  dayNote: {
    today: { j: 'Windy morning. Sunny midday. A still evening.', s: 'Windy morning, sunny midday, a still evening.' },
    windy: { j: 'Strong wind all day. Grey sky.', s: 'Strong wind all day, little sun.' },
    still: { j: 'The wind dies before lunch. Bright sun.', s: 'The wind dies before midday; bright sun.' },
    winter: { j: 'Cold. Dark early. The wind fades in the afternoon.', s: 'Cold (demand up a quarter), short weak sun, wind fades mid-afternoon.' },
  },
  block: { morning: 'Morning', midday: 'Midday', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' },
  rulesHead: { j: 'Rules for the system', s: 'Rules for the control system' },
  rulesHow: { j: 'Each hour it reads from the top and follows the first rule that fits.', s: 'Each hour it reads from the top and follows the first rule whose condition is true.' },
  noRuleRow: { j: 'If no rule fits: the battery waits.', s: 'If no rule fits: the battery does nothing.' },
  whenLabel: 'When', thenLabel: 'Do',
  pickWhen: { j: 'Choose when', s: 'Choose a condition' }, pickThen: { j: 'Choose what to do', s: 'Choose an action' },
  schoolRule: { j: 'After dark, light the school first', s: 'After dark, supply the school first' },
  schoolHint: { j: 'Evening club is on at the school. Without this it is last in line.', s: 'The school hosts evening clubs. Without this rule it is last in the queue.' },
  on: 'On', off: 'Off',
  litHours: { j: 'lit hours', s: 'home-hours supplied' },
  allLit: { j: 'Every home stayed lit.', s: 'Every home stayed supplied.' },
  byHand: { j: 'By hand', s: 'By hand' }, byRules: { j: 'Your rules', s: 'Your rules' },
};

// ---- the kit, said plainly (and what was lent for the exercise)
export function kitLines(kit, j) {
  const own = { t: kit.turbines - kit.lent.turbines, b: kit.batteries - kit.lent.batteries, h: kit.homes.length - kit.lent.homes, r: kit.roofs - kit.lent.roofs };
  const has = []; if (own.h) has.push(plural(own.h, 'home', 'homes')); if (own.t) has.push(plural(own.t, 'wind turbine', 'wind turbines')); if (own.r) has.push(plural(own.r, 'solar roof', 'solar roofs')); if (own.b) has.push(plural(own.b, 'battery', 'batteries'));
  const lent = []; if (kit.lent.homes) lent.push(plural(kit.lent.homes, 'practice home', 'practice homes')); if (kit.lent.turbines) lent.push(plural(kit.lent.turbines, own.t ? 'more turbine' : 'wind turbine', own.t ? 'more turbines' : 'wind turbines')); if (kit.lent.roofs) lent.push(plural(kit.lent.roofs, own.r ? 'more solar roof' : 'solar roof', own.r ? 'more solar roofs' : 'solar roofs')); if (kit.lent.batteries) lent.push(plural(kit.lent.batteries, own.b ? 'more battery' : 'battery', own.b ? 'more batteries' : 'batteries'));
  const out = [];
  out.push(has.length ? `${j ? 'Your town has' : 'The town has'} ${list(has)}${j ? ', and the school' : ', plus the school'}.` : (j ? 'Your town has no homes or power yet.' : 'The town has no homes or generation yet.'));
  if (lent.length) out.push(`${j ? 'For this exercise it is lent' : 'For this exercise it is lent'} ${list(lent)}.`);
  return out;
}

// ---- Florence at the desk
export function intro(kit, j, again) {
  return [
    j ? (again ? 'Welcome back to the control room. You keep the lights on in your town.' : 'Welcome to the control room. From here you keep the lights on in your town.')
      : (again ? 'Welcome back to the control room: you balance the town’s supply and demand.' : 'This is the control room. From here you balance the town’s supply and demand.'),
    ...kitLines(kit, j),
    j ? 'First, run one day by hand. Charge the battery when there is power to spare. Use it when the town is short.'
      : 'First, run one day by hand: charge the battery on a surplus, discharge it on a shortfall.',
  ];
}
export const handAsk = (j) => (j ? 'Look at the forecast. Then choose: Charge, Hold or Use battery. Change it whenever you like.' : 'Read the forecast, then set the battery: Charge, Hold or Use. Change it at any hour.');
export const handAskStep = (j) => (j ? 'Choose Charge, Hold or Use battery. Then press Next hour.' : 'Set the battery, then press Next hour.');
// built-in hints while the day runs (each said at most once a day)
export const HINT = {
  spare: { j: 'There is power to spare right now. Charge would save it for later.', s: 'There is a surplus now. Charge would store it.' },
  short: { j: 'Homes have gone dark. The town is short of power. Use battery can help.', s: 'Homes are off: demand is above supply. Use battery covers the gap.' },
  robbed: { j: 'Charging takes its share first. There is not enough left for every home.', s: 'Charging takes priority, and supply cannot cover both. Hold or Use would keep the homes on.' },
  empty: { j: 'The battery is empty. It can only give what was put in.', s: 'The battery is empty: it can only return what was stored.' },
  full: { j: 'The battery is full.', s: 'The battery is full.' },
  back: { j: 'Every home is lit again.', s: 'Every home is supplied again.' },
  dusk: { j: 'The sun is going down. Watch the windows.', s: 'Dusk: the evening peak is coming.' },
};

// ---- naming who went dark
const HOME = { timber: ['timber terrace', 'timber terraces'], straw: ['straw cottage', 'straw cottages'], earth: ['earth home', 'earth homes'], reclaimed: ['brick terrace', 'brick terraces'], cohousing: ['cohousing court', 'cohousing courts'], concrete: ['block of flats', 'blocks of flats'], practice: ['practice home', 'practice homes'] };
// the homes that are dark this hour, named by kind: "2 timber terraces and 1 straw cottage" (or "5 homes" when it would be a long list)
export function darkNames(kit, hour, { school = true } = {}) {
  const count = {}; let n = 0; kit.homes.forEach((h, i) => { if (!hour.lit[i]) { count[h.item] = (count[h.item] || 0) + 1; n++; } });
  const kinds = Object.keys(count); const parts = [];
  if (n) parts.push(kinds.length <= 2 ? list(kinds.map((k) => plural(count[k], ...(HOME[k] || ['home', 'homes'])))) : plural(n, 'home', 'homes'));
  if (school && !hour.schoolLit) parts.push(T.school);
  return list(parts);
}
export function spellLine(sp, hours, j) {
  const a = clockWord(hours[sp.from].clock, j), b = clockWord((hours[sp.to].clock + 1) % 24, j);
  const who = sp.most ? `${j ? 'up to ' : 'up to '}${plural(sp.most, 'home', 'homes')}${sp.school ? ' and the school' : ''}` : 'the school';
  return `${cap(a)} to ${b}: ${who} dark.`;
}

// ---- the hand-run day, summed up (no pass or fail: only what happened)
export function handSummary(kit, day, j) {
  const out = [`${j ? 'Your homes had' : 'Homes had'} ${day.litHours} ${pick(T.litHours, j)} out of ${day.total}.`];
  if (day.allLit) out.push(pick(T.allLit, j) + (j ? ' The school too.' : ' The school as well.'));
  else { const sp = [...day.spells].sort((x, y) => (y.to - y.from) * 2 + y.most - ((x.to - x.from) * 2 + x.most))[0]; out.push((j ? 'The longest dark spell: ' : 'Longest outage: ') + spellLine(sp, day.hours, j)); }
  return out;
}
export const handDoneSay = (j) => (j ? 'That was one day by hand. Now write rules, so the system can do it by itself.' : 'That was one day by hand. Next, write rules so the system can run by itself.');

// ---- rules in plain words
const WHEN = {
  windy: { j: 'If the wind is strong', s: 'If the wind is strong' }, calm: { j: 'If the wind drops', s: 'If the wind is low' }, sunny: { j: 'If the sun is bright', s: 'If the sun is bright' },
  low: { j: `If the battery is below ${LOW_BATTERY * 100}%`, s: `If the battery is below ${LOW_BATTERY * 100}%` }, high: { j: `If the battery is ${HIGH_BATTERY * 100}% or more`, s: `If the battery is ${HIGH_BATTERY * 100}% or more` },
  morning: { j: 'In the morning', s: 'In the morning' }, midday: { j: 'At midday', s: 'At midday' }, afternoon: { j: 'In the afternoon', s: 'In the afternoon' }, evening: { j: 'In the evening', s: 'In the evening' }, night: { j: 'At night', s: 'At night' },
  always: { j: 'At any other time', s: 'Otherwise' },
};
const WHEN_NOTE = { morning: { j: '6 am to 10 am', s: '06:00–10:00' }, midday: { j: '10 am to 2 pm', s: '10:00–14:00' }, afternoon: { j: '2 pm to 6 pm', s: '14:00–18:00' }, evening: { j: '6 pm to 10 pm', s: '18:00–22:00' }, night: { j: '10 pm to 6 am', s: '22:00–06:00' },
  windy: { j: 'the turbines spin fast', s: 'turbines near full output' }, calm: { j: 'the turbines barely turn', s: 'turbines below 40%' }, sunny: { j: 'the solar roofs work well', s: 'solar above half output' }, low: { j: 'nearly empty', s: 'a threshold' }, high: { j: 'nearly full', s: 'a threshold' }, always: { j: 'when no rule above fits', s: 'when nothing above is true' } };
const WHEN_ICON = { windy: '🌬️', calm: '🍃', sunny: '☀️', low: '🪫', high: '🔋', morning: '🌅', midday: '🕛', afternoon: '🌤️', evening: '🌆', night: '🌙', always: '⋯' };
const THEN = { charge: { j: 'charge the battery', s: 'charge the battery' }, use: { j: 'use the battery', s: 'use the battery' }, hold: { j: 'let the battery wait', s: 'hold the battery' } };
export const whenWord = (id, j) => pick(WHEN[id] || WHEN.always, j);
export const whenNote = (id, j) => pick(WHEN_NOTE[id] || WHEN_NOTE.always, j);
export const whenIcon = (id) => WHEN_ICON[id] || '';
export const thenWord = (id, j) => pick(THEN[id] || THEN.hold, j);
export const ruleLine = (r, j) => `${whenWord(r.when, j)}, ${thenWord(r.then, j)}.`;
export const rulesSpoken = (rules, j) => (rules.list.length ? rules.list.map((r, n) => `Rule ${n + 1}. ${ruleLine(r, j)}`).join(' ') + (rules.school ? ` ${pick(T.schoolRule, j)}.` : '') : (j ? 'No rules yet.' : 'No rules yet.'));

export function rulesAsk(j, draft, first) {
  if (draft && draft.length) return j ? `I watched you. I wrote ${draft.length === 1 ? 'the first rule' : 'the first two rules'} from what you did. Add more, or change ${draft.length === 1 ? 'it' : 'them'}.` : `I drafted ${draft.length === 1 ? 'one rule' : 'two rules'} from what you did by hand. Edit ${draft.length === 1 ? 'it' : 'them'} and add more.`;
  if (first) return j ? 'Write rules from the tiles. The system does exactly what they say, and nothing more.' : 'Build rules from the tiles. The system does exactly what they say and nothing more.';
  return j ? 'Change a rule, add one, or move one up. Then test again.' : 'Edit, add or reorder a rule, then test again.';
}
export const needRule = (j) => (j ? 'Add one rule first.' : 'Add at least one rule.');
export const maxSay = (n, j) => (j ? `That is all ${n} rules. Change one, or remove one.` : `${n} rules is the limit: edit or remove one.`);
export const testSay = (dayId, j) => `${pick(T.day[dayId], j)}. ${pick(T.dayNote[dayId], j)}`;

// ---- where homes went dark, and why (built from rules.explain)
export function gapLines(kit, day, gap, rules, j) {
  if (!gap) return [pick(T.allLit, j)];
  const h = day.hours[gap.i]; const t = clockWord(gap.clock, j); const who = darkNames(kit, h);
  const out = [`${cap(j ? `at ${t}` : `at ${t}`)}, ${who} ${j ? 'went dark' : 'lost power'}.`];
  const n = gap.rule + 1;
  if (gap.why === 'norule') out.push(j ? `No rule fitted ${t}, so the battery waited${gap.had ? '. It still had power in it' : ''}.` : `No rule matched at ${t}, so the battery did nothing${gap.had ? ', though it held charge' : ''}.`);
  else if (gap.why === 'hold') out.push(j ? `Rule ${n} said wait, so the battery waited${gap.had ? '. It still had power in it' : ''}.` : `Rule ${n} said hold, so the battery did nothing${gap.had ? ', though it held charge' : ''}.`);
  else if (gap.why === 'charge') out.push(j ? `Rule ${n} said charge. The battery took power the homes needed.` : `Rule ${n} said charge, and charging took supply the homes needed.`);
  else if (gap.why === 'empty') out.push(gap.missed !== undefined
    ? (j ? `Rule ${n} said use the battery, but it was empty. At ${clockWord(gap.missed, j)} there was power to spare, and no rule said charge.` : `Rule ${n} said use the battery, but it was empty. At ${clockWord(gap.missed, j)} there was a surplus and no rule charged.`)
    : (j ? `Rule ${n} said use the battery, but it ran out at ${clockWord(gap.ranOut, j)}.` : `Rule ${n} said use the battery, but it ran out at ${clockWord(gap.ranOut, j)}.`));
  else out.push(j ? 'The battery gave all it can in one hour. There was not enough to go round.' : 'The battery was at its full output; supply still fell short.');
  return out;
}
export function gapFix(gap, j) {
  if (!gap) return '';
  if (gap.why === 'norule') return j ? 'Try: add a rule for that time.' : 'Try: add a rule that covers that hour.';
  if (gap.why === 'hold') return j ? 'Try: change that rule, or put another above it.' : 'Try: change that rule or put another above it.';
  if (gap.why === 'charge') return j ? 'Try: charge only when there is plenty of power.' : 'Try: charge only when there is a clear surplus.';
  if (gap.why === 'empty' && gap.missed !== undefined) return j ? 'Try: a rule that charges at that time.' : 'Try: a rule that charges in that surplus.';
  if (gap.why === 'empty') return j ? 'Try: save the battery for the busy evening.' : 'Try: hold the battery back for the evening peak.';
  return j ? 'The rules did all they could with this battery.' : 'The rules did all this battery allows.';
}
export function resultsSay(test, j, prev) {
  const dark = test.days.filter((d) => !d.allLit).length;
  let s = dark === 0 ? (j ? 'The system followed your rules for three days. Every home stayed lit.' : 'The system followed your rules for three days. Every home stayed supplied.')
    : (j ? `The system did exactly what your rules said. On ${dark === 1 ? 'one day' : `${dark} days`} some homes went dark. Tap a day to see when.` : `The system did exactly what the rules said. On ${dark === 1 ? 'one day' : `${dark} days`} homes lost power. Select a day to see when.`);
  if (prev) { const d = test.litHours - prev.litHours; s += d > 0 ? ` ${j ? `That is ${d} more lit hours than last time.` : `That is ${d} more home-hours than last time.`}` : d < 0 ? ` ${j ? `That is ${-d} fewer lit hours than last time.` : `That is ${-d} fewer home-hours than last time.`}` : ` ${j ? 'The same as last time.' : 'No change from last time.'}`; }
  return s;
}
export const unusedLine = (n, j) => (j ? `Rule ${n} was never used. A rule above it always fitted first, or its time never came.` : `Rule ${n} never fired: an earlier rule always matched first, or its condition never came true.`);
export const dayScore = (day, j) => `${day.litHours} / ${day.total} ${pick(T.litHours, j)}`;

// ---- the last screen: hand and rules side by side, in plain words
export function compareLines(cmp, j, hadHand) {
  const out = [];
  if (hadHand) {
    out.push(`${j ? 'By hand, today' : 'By hand, today'}: ${cmp.hand.litHours} ${pick(T.litHours, j)} out of ${cmp.hand.total}.`);
    out.push(`${j ? 'Your rules, on the same day' : 'Your rules, same day'}: ${cmp.auto.litHours} out of ${cmp.auto.total}.` + (cmp.diff > 0 ? ` ${j ? `That is ${cmp.diff} more.` : `${cmp.diff} more.`}` : cmp.diff < 0 ? ` ${j ? `That is ${-cmp.diff} fewer: you saw something your rules do not say yet.` : `${-cmp.diff} fewer: your judgement covered something the rules do not.`}` : ` ${j ? 'The same.' : 'The same.'}`));
  }
  out.push(`${j ? 'On the three test days' : 'Across the three test days'}: ${cmp.test.days.map((d) => `${pick(T.day[d.dayId], j).replace(/^A /, '').toLowerCase()} ${d.litHours}/${d.total}`).join(', ')}.`);
  return out;
}
export const compareSay = (cmp, j, hadHand) => (j
  ? `${hadHand ? (cmp.diff > 0 ? 'Your rules kept more lights on than you did by hand.' : cmp.diff < 0 ? 'By hand you kept more lights on than your rules.' : 'Your rules did as well as you did by hand.') : 'Your rules are ready.'} From tonight the town’s lights follow your rules.`
  : `${hadHand ? (cmp.diff > 0 ? 'The rules supplied more home-hours than the hand-run day.' : cmp.diff < 0 ? 'The hand-run day supplied more than the rules.' : 'Rules and hand-run day came out level.') : 'The rules are set.'} From tonight the town’s lights follow them.`);

// ---- the take-home record
export const madeTitle = (j) => (j ? 'My control room rules' : 'My control room rules');
const pct = (d) => Math.round(d.share * 100);
export function madeLines(rules, cmp, j, hadHand) {
  const out = []; const rl = rules.list.map((r, n) => `${n + 1}. ${ruleLine(r, j)}`);
  for (let i = 0; i < rl.length; i += 2) out.push(rl.slice(i, i + 2).join(' '));
  if (rules.school) out.push(`${pick(T.schoolRule, j)}.`);
  const res = `Homes lit: ${cmp.test.days.map((d) => `${pick(T.day[d.dayId], j).replace(/^A /, '')} ${pct(d)}%`).join(', ')}.`;
  const hand = hadHand ? `By hand ${pct(cmp.hand)}% lit; the rules on the same day ${pct(cmp.auto)}%.` : '';
  while (out.length > (hand ? 4 : 5)) out.pop();
  out.push(res); if (hand) out.push(hand);
  return out.slice(0, 6);
}
// "You practised ...": built from what the child did. did: { hand, charged, used, rules, tests, changed, improved }
export function practised(did, j) {
  const out = [];
  if (did.hand) out.push(did.charged && did.used ? 'reading a forecast to choose when to charge a battery and when to use it' : 'running a town’s power by hand through a whole day');
  out.push(`writing ${did.rules === 1 ? 'a rule' : `${did.rules} rules`} for a system that runs by itself`);
  out.push(did.tests > 1 ? `testing the rules ${did.tests === 2 ? 'twice' : `${did.tests} times`} on a windy day, a still day and a winter night` : 'testing the rules on a windy day, a still day and a winter night');
  if (did.improved) out.push('finding the hour homes went dark and changing a rule to fix it');
  else if (did.changed) out.push('changing a rule and testing again to see what it did');
  return out.slice(0, 4);
}
export const units = (x, j) => (j ? String(Math.round(x * 10) / 10) : `${Math.round(x * KW)} kW`);
export const energy = (x, j) => (j ? String(Math.round(x)) : `${Math.round(x * KW)} kWh`);
export { TEST_DAYS };
