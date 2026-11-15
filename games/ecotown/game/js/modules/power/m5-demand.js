// Mission 5, smart demand: move flexible jobs (washing, dishwashers, car charging, hot water, heating) to the hours
// with spare clean power, while still meeting what people need. Pure: no page, no 3D.
// The day is 12 slots of two hours from 6 am. Spare clean power (wind and sun left over once the homes and the school
// have what they need right then) is counted in blocks per slot (ages 13-17: one block is 10 kW). A job uses a number of
// blocks for one or more slots. What spare power cannot cover comes from a gas power station far away: real grids
// still fill gaps that way, which is why moving demand to windy and sunny hours cuts carbon.
// Each job has a window: when people allow it to run (the cars are out at work, the washing must dry before dark).
export const SLOTS = 12;
export const slotClock = (s) => (6 + s * 2) % 24;
export const BLOCK_KW = 10;

export const JOBS = {
  wash: { icon: '👕', p: 1, len: 1, win: [0, 6] },        // 6 am to 6 pm: dry on the line before dark
  dish: { icon: '🍽️', p: 1, len: 1, win: [0, 12] },       // any time
  water: { icon: '🚿', p: 1, len: 1, win: [0, 6] },       // hot water ready for the evening baths
  carA: { icon: '🚗', p: 1, len: 2, win: [6, 12] },       // plugged in at home from 6 pm; needed again at 6 am
  carB: { icon: '🚙', p: 1, len: 2, win: [6, 12] },
  nightWater: { icon: '🚿', p: 1, len: 1, win: [8, 12] }, // hot water ready for 6 am showers: heat it from 10 pm
  heat: { icon: '♨️', p: 2, len: 1, win: [2, 5] },        // warm the homes before the cold evening: 10 am to 4 pm
};
// spare: blocks of spare clean power in each slot. jobs: [id, usual start slot] (where people would run it out of habit).
export const DEMAND_ROUNDS = [
  { id: 'sunny', spare: [0, 1, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0], jobs: [['wash', 5], ['dish', 7], ['water', 5]] },
  { id: 'windy', spare: [1, 0, 0, 1, 1, 0, 0, 1, 2, 3, 3, 2], jobs: [['carA', 6], ['carB', 6], ['wash', 5], ['dish', 7]] },
  { id: 'scarce', spare: [0, 1, 1, 2, 1, 0, 0, 0, 1, 2, 1, 1], jobs: [['carA', 6], ['carB', 6], ['nightWater', 8], ['wash', 5], ['dish', 7], ['heat', 4]] },
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
  return { slots, perJob, gas, clean, total: gas + clean, outside, done: gas === 0 && outside.length === 0 };
}
// A plan that runs every job on spare clean power inside its window (the tests prove one exists for every round).
export function solve(round) {
  const ids = round.jobs.map(([id]) => id); const plan = startPlan(round);
  const go = (n) => { if (n === ids.length) return layout(round, plan).done; const id = ids[n]; const j = JOBS[id];
    for (let s = j.win[0]; s + j.len <= j.win[1]; s++) { plan[id] = s; const l = layout(round, Object.fromEntries(ids.slice(0, n + 1).map((k) => [k, plan[k]]).concat(ids.slice(n + 1).map((k) => [k, -99])))); const okSoFar = ids.slice(0, n + 1).every((k) => l.perJob[k].gas === 0); if (okSoFar && go(n + 1)) return true; }
    return false; };
  return go(0) ? { ...plan } : null;
}

const pick = (o, j) => (j ? o.j : o.s);
export const JOB_WORD = {
  wash: { name: { j: 'Washing machines', s: 'Washing machines' }, need: { j: 'Must finish by 6 pm, so it dries before dark.', s: 'Window 06:00–18:00 (drying before dark).' } },
  dish: { name: { j: 'Dishwashers', s: 'Dishwashers' }, need: { j: 'Any time today.', s: 'Window: any time.' } },
  water: { name: { j: 'Hot water tanks', s: 'Hot water tanks' }, need: { j: 'Hot for the evening baths: heat it before 6 pm.', s: 'Window 06:00–18:00 (hot for the evening).' } },
  carA: { name: { j: 'Electric cars, Mill Lane', s: 'EV charging, Mill Lane' }, need: { j: 'Home from 6 pm. Needed again at 6 am. Takes 4 hours.', s: 'Plugged in 18:00–06:00; 4 hours of charging.' } },
  carB: { name: { j: 'Electric cars, River Row', s: 'EV charging, River Row' }, need: { j: 'Home from 6 pm. Needed again at 6 am. Takes 4 hours.', s: 'Plugged in 18:00–06:00; 4 hours of charging.' } },
  nightWater: { name: { j: 'Hot water tanks', s: 'Hot water tanks' }, need: { j: 'Hot for the 6 am showers: heat it after 10 pm.', s: 'Window 22:00–06:00 (hot for morning showers).' } },
  heat: { name: { j: 'Heat pumps (warm the homes early)', s: 'Heat pumps: pre-heating' }, need: { j: 'Warm the homes before the cold evening: between 10 am and 4 pm.', s: 'Window 10:00–16:00 (warm before the cold evening).' } },
};
export const DEM = {
  round: {
    sunny: { j: 'Day 1 of 3: a sunny Saturday', s: 'Day 1 of 3: a sunny Saturday' },
    windy: { j: 'Day 2 of 3: a windy night', s: 'Day 2 of 3: a windy night' },
    scarce: { j: 'Day 3 of 3: a still winter day', s: 'Day 3 of 3: a still winter day' },
  },
  note: {
    sunny: { j: 'Lots of sun at midday. Everyone usually runs jobs at 6 pm.', s: 'Solar surplus around midday; habit puts every job at the 18:00 peak.' },
    windy: { j: 'The wind gets up after dark. The cars plug in at 6 pm.', s: 'Wind surplus overnight; every car plugs in at 18:00.' },
    scarce: { j: 'Only a little spare power, at odd times. Every block counts.', s: 'Little surplus, scattered: fit each job into the gaps.' },
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
  if (id === 'heat') return j ? 'Warm the homes between 10 am and 4 pm, before the cold evening.' : 'Pre-heating runs 10:00–16:00.';
  return j ? 'That time does not work for this job.' : 'Outside this job’s window.';
}
export function runSay(res, tries, j) {
  if (res.outside.length) return j ? `${res.outside.length === 1 ? 'One job is' : `${res.outside.length} jobs are`} at a time people cannot use. Move ${res.outside.length === 1 ? 'it' : 'them'} first.` : `${res.outside.length} job${res.outside.length === 1 ? ' is' : 's are'} outside the hours people allow.`;
  if (res.done) return j ? 'Every job ran on spare wind and sun. No gas was burned for them.' : `All ${res.total * 2 * BLOCK_KW} kWh of flexible demand met from surplus renewables; no gas needed.`;
  const g = res.gas;
  if (tries <= 1) return j ? `${g === 1 ? 'One square still comes' : `${g} squares still come`} from the gas power station. Look for green spare power that is not used yet.` : `${g * 2 * BLOCK_KW} kWh still comes from gas. Some surplus is unused.`;
  const bad = Object.entries(res.perJob).filter(([, x]) => x.gas > 0).map(([id]) => jobName(id, j));
  if (tries === 2) return j ? `Still on gas: ${bad.join(', ')}. Can ${bad.length === 1 ? 'it' : 'they'} go somewhere greener, at a time people can use?` : `Still drawing on gas: ${bad.join(', ')}. Find surplus inside each window.`;
  return j ? 'I have marked a good time for one job with a star. Try it there.' : 'A starred slot shows one job’s best position.';
}
export const demDay = (id, j) => pick(DEM.round[id], j);
export const demNote = (id, j) => pick(DEM.note[id], j);
