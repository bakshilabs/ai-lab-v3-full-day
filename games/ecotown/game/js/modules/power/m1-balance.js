// Mission 1, the grid must balance: keep the power made level with the power used, ten minutes at a time, as the
// town wakes up. Pure: no page, no 3D.
// Power is counted in blocks (ages 13-17: one block is 5 kW, as in missions 2-4). Each step the wind and the sun make what they make,
// the homes and the school use what they use, and the child sets the one thing a control room can steer here: the
// town battery, which can give power (up to 6 blocks) or soak up spare power by charging (up to 3 blocks).
// Real grids: supply and demand must match all the time. In Great Britain the grid runs at 50 Hz; when demand is more
// than supply the frequency falls, and when supply is more it rises. Control rooms keep it close to 50 Hz (normally
// between 49.8 and 50.2 Hz). Below that band reserve power is called in; only at 48.8 Hz are homes switched off
// automatically. Here every block out of balance moves the frequency by 0.1 Hz: a model, made simple. Homes going
// dark when the town is short is the game's warning sign, and the game says so.
export const BLOCK_KW = 5;   // the same unit as missions 2-4 (one unit = 5 kW)
export const FLEX_MIN = -3, FLEX_MAX = 6;
export const HZ_PER_BLOCK = 0.1;
export const ROUND_GOAL = 6; // steps of 8 that must be level

// Each round: 8 steps of 10 minutes. use: power used; wind, sun: power made. event: something to say at that step.
export const BALANCE_ROUNDS = [
  { id: 'wake', from: [6, 0], use: [4, 5, 5, 6, 7, 7, 8, 8], wind: [3, 3, 3, 3, 3, 3, 3, 3], sun: [0, 0, 0, 1, 1, 1, 1, 2], events: { 1: 'kettles', 4: 'showers' } },
  { id: 'school', from: [7, 30], use: [8, 9, 10, 10, 9, 8, 7, 7], wind: [3, 3, 2, 2, 2, 3, 3, 3], sun: [2, 2, 3, 3, 4, 4, 5, 5], events: { 2: 'school', 6: 'sunup' } },
  { id: 'storm', from: [9, 0], use: [7, 7, 6, 6, 6, 7, 7, 6], wind: [3, 5, 5, 0, 0, 2, 3, 3], sun: [5, 5, 4, 2, 1, 2, 3, 4], events: { 1: 'gust', 3: 'cutout', 5: 'restart' } },
];
export const STEPS = 8;
export const clockOf = (round, i) => { const m = round.from[0] * 60 + round.from[1] + i * 10; return { h: Math.floor(m / 60), m: m % 60 }; };
// What the battery must do to make this step level (the answer the child works out by reading the scale).
export const needFlex = (round, i) => round.use[i] - round.wind[i] - round.sun[i];
// Out of balance by: positive = more made than used (frequency up), negative = short (frequency down).
export const gap = (round, i, flex) => round.wind[i] + round.sun[i] + flex - round.use[i];
export const hz = (diff) => Math.round((50 + diff * HZ_PER_BLOCK) * 100) / 100;
export const clampFlex = (x) => Math.max(FLEX_MIN, Math.min(FLEX_MAX, Math.round(x)));
// Every step of every round can be made level with the battery's range: checked by the tests.
export const reachable = (round) => round.use.every((_, i) => needFlex(round, i) >= FLEX_MIN && needFlex(round, i) <= FLEX_MAX);
// A round's result: which steps were level. levels: the flex the child had set at the end of each step.
export function judge(round, flexes) {
  const steps = round.use.map((_, i) => { const d = gap(round, i, flexes[i] ?? 0); return { i, diff: d, level: d === 0 }; });
  const level = steps.filter((s) => s.level).length;
  return { steps, level, of: STEPS, met: level >= ROUND_GOAL, short: steps.filter((s) => s.diff < 0).length, over: steps.filter((s) => s.diff > 0).length };
}
// When short, the grid protects itself by switching some homes off (real grids do this as a last resort):
// out of n homes, how many go dark for a shortfall of `blocks`.
export const darkFor = (round, i, diff, n) => (diff >= 0 ? 0 : Math.min(n, Math.max(1, Math.round((-diff / round.use[i]) * n * 1.5))));

const pick = (o, j) => (j ? o.j : o.s);
export const pad = (n) => String(n).padStart(2, '0');
export const clockText = (round, i, j) => { const { h, m } = clockOf(round, i); return j ? `${h > 12 ? h - 12 : h}:${pad(m)} ${h < 12 ? 'am' : 'pm'}` : `${pad(h)}:${pad(m)}`; };
export const BAL = {
  round: {
    wake: { j: 'Round 1 of 3: the town wakes up', s: 'Round 1 of 3: the town wakes up' },
    school: { j: 'Round 2 of 3: the school run', s: 'Round 2 of 3: the school run' },
    storm: { j: 'Round 3 of 3: a gusty morning', s: 'Round 3 of 3: a gusty morning' },
  },
  roundNote: {
    wake: { j: 'Kettles, showers, breakfast. More power is used every ten minutes.', s: 'Demand climbs as homes wake up; the sun starts to help.' },
    school: { j: 'The school opens, then the sun climbs. Watch both sides.', s: 'The school load arrives, then solar rises past demand: the battery must switch from giving to storing.' },
    storm: { j: 'Gusts of wind, and clouds over the sun. Things change fast.', s: 'Gusty, with passing cloud. One turbine group will shut itself down.' },
  },
  event: {
    kettles: { j: 'Kettles are on all over town.', s: 'Breakfast: kettles and toasters add demand.' },
    showers: { j: 'Showers and hairdryers: more power used.', s: 'Showers and heat pumps: demand rises again.' },
    school: { j: 'The school opens its doors: lights, computers, the kitchen.', s: 'The school opens: lighting, computers and the kitchen add demand.' },
    sunup: { j: 'The sun is high now. Lots of solar power.', s: 'Solar output now exceeds what the town needs: store the surplus.' },
    gust: { j: 'A gust! The turbines spin faster.', s: 'A gust: wind output jumps.' },
    cutout: { j: 'The wind is too strong. The turbines have stopped themselves to stay safe.', s: 'Wind above the safe limit: the turbines have cut out to protect themselves.' },
    restart: { j: 'The wind has calmed. The turbines are starting again.', s: 'Wind back in range: the turbines restart.' },
  },
  how: { j: 'Make the scale level. ▲ More: the battery gives power. ▼ Less: it gives less, or stores the spare.', s: 'Keep supply equal to demand. ▲ raises battery output; ▼ lowers it, below zero it charges.' },
  warn: { j: 'In this game, homes go dark when you are short, so you can see it. A real grid calls in back-up power first.', s: 'In this game, homes go dark when supply is short, as a warning you can see. Real grids call reserve first; automatic disconnection starts only at 48.8 Hz.' },
  more: { j: '▲ More', s: '▲ More' }, less: { j: '▼ Less', s: '▼ Less' }, ready: { j: 'Ready ➜', s: 'Ready ➜' }, next: { j: 'Next ➜', s: 'Next ➜' },
  made: { j: 'Power made', s: 'Supply' }, used: { j: 'Power used', s: 'Demand' },
};
export function flexWord(flex, j) {
  if (flex > 0) return j ? `The battery gives ${flex}` : `Battery output ${flex * BLOCK_KW} kW`;
  if (flex < 0) return j ? `The battery stores ${-flex}` : `Battery charging ${-flex * BLOCK_KW} kW`;
  return j ? 'The battery rests' : 'Battery idle (0 kW)';
}
export function stateWord(diff, j) {
  if (diff === 0) return j ? 'Level' : 'Balanced';
  if (diff < 0) return j ? `Short by ${-diff}` : `Short by ${-diff * BLOCK_KW} kW`;
  return j ? `${diff} too much` : `Surplus of ${diff * BLOCK_KW} kW`;
}
export function stepSay(diff, j) {
  if (diff === 0) return j ? 'Level. Well balanced.' : 'Balanced at 50 Hz.';
  if (diff < 0) return j ? 'Short of power. Back-up power had to rush in.' : `Short: frequency fell to ${hz(diff).toFixed(2)} Hz${hz(diff) < 49.8 ? ', outside the normal 49.8–50.2 Hz band, so reserve power was called in' : ', still inside the normal band'}.`;
  return j ? 'Too much power. The turbines were told to slow down.' : `Surplus: frequency rose to ${hz(diff).toFixed(2)} Hz${hz(diff) > 50.2 ? ', outside the normal band' : ''}; generators were asked to cut back.`;
}
export function roundSay(res, j) {
  return res.met
    ? (j ? `${res.level} of ${res.of} steps level. That is the goal.` : `${res.level} of ${res.of} steps balanced: goal met.`)
    : (j ? `${res.level} of ${res.of} steps level. The goal is ${ROUND_GOAL}.` : `${res.level} of ${res.of} steps balanced; the goal is ${ROUND_GOAL}.`);
}
// After a missed round: a nudge, then a way to work it out, then Florence marks the level on the battery.
export function balanceHint(tries, res, j) {
  if (tries <= 1) return res.short >= res.over
    ? (j ? 'Most misses were short of power. When the town uses more, press More to keep up.' : 'Most misses were shortfalls: raise battery output as soon as demand rises.')
    : (j ? 'Some steps had too much power. When the sun or wind give more, press Less. Below zero, the battery stores it.' : 'Several steps were surpluses: lower the output when wind or sun rise; below zero the battery absorbs the surplus.');
  if (tries === 2) return j ? 'Count the blocks. Power used, take away the wind and sun blocks. What is left is what the battery must give.' : 'Work it out: battery output = demand − wind − solar. Negative means charge.';
  return j ? 'This time I will mark where the battery should be. Watch for the dotted line.' : 'I will mark the balancing output on the battery this round.';
}
