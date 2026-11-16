// Mission 5, smart demand: move flexible jobs (washing, dishwashers, car charging, hot water, heating) to the hours
// with spare clean power, while still meeting what people need. Pure: no page, no 3D.
// The day is 12 slots of two hours from 6 am. Spare clean power (wind and sun left over once the homes and the school
// have what they need right then) is counted in blocks per slot (ages 13-17: one block is 5 kW, as in the other missions). A job uses a number of
// blocks for one or more slots. What spare power cannot cover comes from a gas power station far away: real grids
// still fill gaps that way, which is why moving demand to windy and sunny hours cuts carbon.
// Each job has a window: when people allow it to run (the cars are out at work, the washing must dry before dark).
export const SLOTS = 12;
export const slotClock = (s) => (6 + s * 2) % 24;
export const BLOCK_KW = 5;

export const JOBS = {
  wash: { icon: '👕', p: 1, len: 1, win: [0, 6] },        // 6 am to 6 pm: dry on the line before dark
  dish: { icon: '🍽️', p: 1, len: 1, win: [0, 12] },       // any time
  water: { icon: '🚿', p: 1, len: 1, win: [0, 6] },       // hot water ready for the evening baths
  carA: { icon: '🚗', p: 1, len: 2, win: [6, 12] },       // plugged in at home from 6 pm; needed again at 6 am
  carB: { icon: '🚙', p: 1, len: 2, win: [6, 12] },
  nightWater: { icon: '🚿', p: 1, len: 1, win: [8, 12] }, // hot water ready for 6 am showers: heat it from 10 pm
  heat: { icon: '♨️', p: 2, len: 1, win: [2, 5] },        // warm the homes before the cold evening: 10 am to 4 pm
  nurse: { icon: '🚑', p: 1, len: 1, win: [6, 8] },      // a nurse's car, needed by 10 pm for a night shift: it cannot wait for the wind
};
// spare: blocks of spare clean power in each slot. jobs: [id, usual start slot] (where people would run it out of habit).
export const DEMAND_ROUNDS = [
  { id: 'sunny', spare: [0, 1, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0], jobs: [['wash', 5], ['dish', 7], ['water', 5], ['heat', 4]] },
  { id: 'windy', spare: [1, 0, 0, 1, 1, 0, 0, 1, 2, 3, 3, 2], jobs: [['carA', 6], ['carB', 6], ['wash', 5], ['dish', 7]] },
  { id: 'scarce', spare: [0, 1, 1, 2, 1, 0, 0, 0, 1, 2, 1, 1], jobs: [['carA', 6], ['carB', 6], ['nightWater', 8], ['wash', 5], ['dish', 7], ['heat', 4]] },
  // a person's need that cannot move: the nurse's car must charge before 10 pm, when there is no spare power at all.
  // The best plan uses a little gas; the job is to use no more than that.
  { id: 'shift', spare: [0, 1, 1, 2, 1, 0, 0, 0, 1, 2, 2, 1], jobs: [['nurse', 6], ['carA', 6], ['carB', 6], ['nightWater', 8], ['wash', 5], ['dish', 7], ['heat', 4]] },
];
export const inWindow = (id, start) => { const j = JOBS[id]; return start >= j.win[0] && start + j.len <= j.win[1]; };
// Where each job starts at first: the usual time, out of habit (inside its window, but often at the busy 6 pm peak).
export function startPlan(round) { return Object.fromEntries(round.jobs.map(([id, s]) => [id, s])); }
// Fill each slot: jobs take spare blocks in the order they are listed; what is left over comes from gas.
export function layout(round, plan) {
  const slots = round.spare.map((spare, s) => ({ s, spare, jobs: [], clean: 0, gas: 0 }));
  const perJob = {};
  for (const [id] of round.jobs) {
    const job = JOBS[id]; const start = plan[id]; let clean = 0, gas = 0;
    for (let k = 0; k < job.len; k++) {
      const slot = slots[start + k]; if (!slot) { gas += job.p; continue; }
      for (let b = 0; b < job.p; b++) { const free = slot.spare - slot.clean > 0; if (free) { slot.clean++; clean++; slot.jobs.push({ id, clean: true }); } else { slot.gas++; gas++; slot.jobs.push({ id, clean: false }); } }
    }
    perJob[id] = { clean, gas, ok: inWindow(id, start) };
  }
  const gas = Object.values(perJob).reduce((n, x) => n + x.gas, 0); const clean = Object.values(perJob).reduce((n, x) => n + x.clean, 0);
  const outside = Object.entries(perJob).filter(([, x]) => !x.ok).map(([id]) => id);
  const least = minGas(round);
  return { slots, perJob, gas, clean, total: gas + clean, outside, least, done: gas <= least && outside.length === 0 };
}
// The plan that burns the least gas while every job stays inside its window (searched over every start; a few
// thousand layouts at most). Days 1-3 can be run on clean power alone; day 4 cannot.
const best = new WeakMap();
function gasOf(round, plan) {
  const used = round.spare.map(() => 0); let gas = 0;
  for (const [id] of round.jobs) { const j = JOBS[id]; for (let k = 0; k < j.len; k++) { const s = plan[id] + k; for (let b = 0; b < j.p; b++) { if (used[s] < round.spare[s]) used[s]++; else gas++; } } }
  return gas;
}
export function solve(round) {
  if (best.has(round)) return { ...best.get(round).plan };
  const ids = round.jobs.map(([id]) => id); const plan = startPlan(round); let top = null;
  const go = (n) => { if (n === ids.length) { const g = gasOf(round, plan); if (!top || g < top.gas) top = { gas: g, plan: { ...plan } }; return; }
    const j = JOBS[ids[n]]; for (let s = j.win[0]; s + j.len <= j.win[1]; s++) { plan[ids[n]] = s; go(n + 1); if (top && top.gas === 0) return; } };
  go(0); best.set(round, top); return { ...top.plan };
}
export const minGas = (round) => { solve(round); return best.get(round).gas; };

const pick = (o, j) => (j ? o.j : o.s);
export const JOB_WORD = {
  wash: { name: { j: 'Washing machines', s: 'Washing machines' }, need: { j: 'Must finish by 6 pm, so it dries before dark.', s: 'Window 06:00–18:00 (drying before dark).' } },
  dish: { name: { j: 'Dishwashers', s: 'Dishwashers' }, need: { j: 'Any time today.', s: 'Window: any time.' } },
  water: { name: { j: 'Hot water tanks', s: 'Hot water tanks' }, need: { j: 'Hot for the evening baths: heat it before 6 pm.', s: 'Window 06:00–18:00 (hot for the evening).' } },
  carA: { name: { j: 'Electric cars, Mill Lane', s: 'EV charging, Mill Lane' }, need: { j: 'Home from 6 pm. Needed again at 6 am. Takes 4 hours.', s: 'Plugged in 18:00–06:00; 4 hours of charging.' } },
  carB: { name: { j: 'Electric cars, River Row', s: 'EV charging, River Row' }, need: { j: 'Home from 6 pm. Needed again at 6 am. Takes 4 hours.', s: 'Plugged in 18:00–06:00; 4 hours of charging.' } },
  nightWater: { name: { j: 'Hot water tanks', s: 'Hot water tanks' }, need: { j: 'Hot for the 6 am showers: heat it after 10 pm.', s: 'Window 22:00–06:00 (hot for morning showers).' } },
  heat: { name: { j: 'Heat pumps (warm the homes early)', s: 'Heat pumps: pre-heating' }, need: { j: 'Warm the homes before the cold evening: between 10 am and 4 pm.', s: 'Window 10:00–16:00 (warm before the cold evening).' } },
  nurse: { name: { j: 'The nurse’s car', s: 'Nurse’s car (night shift)' }, need: { j: 'Home at 6 pm. Needed at 10 pm for her night shift.', s: 'Plugged in 18:00–22:00; must be charged for a night shift.' } },
};
export const DEM = {
  round: {
    sunny: { j: 'Day 1 of 4: a sunny Saturday', s: 'Day 1 of 4: a sunny Saturday' },
    windy: { j: 'Day 2 of 4: a windy night', s: 'Day 2 of 4: a windy night' },
    scarce: { j: 'Day 3 of 4: a still winter day', s: 'Day 3 of 4: a still winter day' },
    shift: { j: 'Day 4 of 4: the night shift', s: 'Day 4 of 4: the night shift' },
  },
  note: {
    sunny: { j: 'Lots of sun at midday. People usually run these jobs in the afternoon and evening.', s: 'Solar surplus around midday; habit puts the jobs in the afternoon and evening.' },
    windy: { j: 'The wind gets up after dark. The cars plug in at 6 pm.', s: 'Wind surplus overnight; every car plugs in at 18:00.' },
    scarce: { j: 'Only a little spare power, at odd times. Every block counts.', s: 'Little surplus, scattered: fit each job into the gaps.' },
    shift: { j: 'A nurse needs her car charged by 10 pm. There is no spare power then. People’s needs come first: use as little gas as you can.', s: 'One need cannot move to a greener hour. Meet every window and burn as little gas as possible.' },
  },
  how: { j: 'Tap a job, then tap a time on the chart to move it. Green squares are spare clean power.', s: 'Select a job, then a slot to move it. Green: spare clean power; red: met from gas.' },
  check: { j: 'Run the day ➜', s: 'Run the day ➜' },
};
export const jobName = (id, j) => pick(JOB_WORD[id].name, j);
export const jobNeed = (id, j) => pick(JOB_WORD[id].need, j);
export function jobSize(id, j) { const x = JOBS[id]; if (j) return ''; const kw = x.p * BLOCK_KW, h = x.len * 2; return `${kw} kW × ${h} h = ${kw * h} kWh`; }
export function slotWord(s, j) { const c = slotClock(s); return j ? (c === 0 ? 'midnight' : c === 12 ? '12 noon' : c < 12 ? `${c} am` : `${c - 12} pm`) : `${String(c).padStart(2, '0')}:00`; }
// the short form for a column label: 6am, 12pm, 12am (ages 8-12) or 06 (ages 13-17)
export function slotShort(s, j) { const c = slotClock(s); return j ? `${c % 12 === 0 ? 12 : c % 12}${c < 12 ? 'am' : 'pm'}` : `${String(c).padStart(2, '0')}:00`; }
export function refuseSay(id, j) {
  if (id === 'carA' || id === 'carB') return j ? 'The cars are out until 6 pm, and needed again at 6 am. Pick a time between.' : 'The cars are only plugged in from 18:00 to 06:00.';
  if (id === 'wash') return j ? 'The washing must be done by 6 pm, so it can dry before dark.' : 'Washing must finish by 18:00.';
  if (id === 'water') return j ? 'The water must be hot before the evening baths at 6 pm.' : 'The tanks must be hot by 18:00.';
  if (id === 'nightWater') return j ? 'Heat the water after 10 pm, so it is still hot for the 6 am showers.' : 'Heat between 22:00 and 06:00.';
  if (id === 'nurse') return j ? 'The nurse needs her car at 10 pm. It must charge between 6 pm and 10 pm.' : 'The night shift starts at 22:00: charge between 18:00 and 22:00.';
  if (id === 'heat') return j ? 'Warm the homes between 10 am and 4 pm, before the cold evening.' : 'Pre-heating runs 10:00–16:00.';
  return j ? 'That time does not work for this job.' : 'Outside this job’s window.';
}
export function runSay(res, tries, j) {
  if (res.outside.length) return j ? `${res.outside.length === 1 ? 'One job is' : `${res.outside.length} jobs are`} at a time people cannot use. Move ${res.outside.length === 1 ? 'it' : 'them'} first.` : `${res.outside.length} job${res.outside.length === 1 ? ' is' : 's are'} outside the hours people allow.`;
  if (res.done && res.gas > 0) return j ? 'Every job that could wait ran on spare wind and sun. The nurse’s car had to use gas power, because she cannot wait. That is the least gas possible.' : `Minimum gas: ${res.gas * 2 * BLOCK_KW} kWh, only for the load that could not move. Everything else ran on surplus renewables.`;
  if (res.done) return j ? 'Every job ran on spare wind and sun. No gas was burned for them.' : `All ${res.total * 2 * BLOCK_KW} kWh of flexible demand met from surplus renewables; no gas needed.`;
  const g = res.gas - res.least;
  if (tries <= 1) return j ? `${g === 1 ? 'One square more than needed comes' : `${g} squares more than needed come`} from the gas power station. Look for green spare power that is not used yet.` : `${g * 2 * BLOCK_KW} kWh more than necessary comes from gas. Some surplus is unused.`;
  const bad = Object.entries(res.perJob).filter(([id, x]) => x.gas > 0 && id !== 'nurse').map(([id]) => jobName(id, j));
  if (tries === 2) return j ? `Still on gas: ${bad.join(', ')}. Can ${bad.length === 1 ? 'it' : 'they'} go somewhere greener, at a time people can use?` : `Still drawing on gas: ${bad.join(', ')}. Find surplus inside each window.`;
  return j ? 'I have marked a good time for one job with a star. Try it there.' : 'A starred slot shows one job’s best position.';
}
export const demDay = (id, j) => pick(DEM.round[id], j);
export const demNote = (id, j) => pick(DEM.note[id], j);
