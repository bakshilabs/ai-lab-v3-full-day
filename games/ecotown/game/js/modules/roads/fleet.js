// Mission 5, "A shared fleet": choose how many shared cars the town runs, where they wait and where they charge, run
// the morning, and read the waiting times and empty trips. Pure: no page.
//
// How it is simplified: the town is a small grid; a car takes 1 minute per block. Calls come at fixed times (the
// same every run, so runs can be compared). The nearest free car answers each call; after a drop-off it drives back
// to the nearest waiting place (an empty trip). Each car charges once in the hour, for 15 minutes. What is true: these
// are the real levers of fleet planning, and the real trade-off: more cars cut waits but stand idle more, and where
// cars wait and charge decides how much driving is done with nobody inside.

export const BLOCK_MIN = 1, CHARGE_MIN = 15;
export const PLACES = {
  homesW: { x: 0, y: 1, icon: '🏘', name: { j: 'West homes', s: 'West homes' } },
  homesN: { x: 3, y: 0, icon: '🏘', name: { j: 'North homes', s: 'North homes' } },
  shops: { x: 3, y: 2, icon: '🛒', name: { j: 'Shops', s: 'High street' } },
  school: { x: 6, y: 1, icon: '🏫', name: { j: 'School', s: 'School' } },
  station: { x: 1, y: 3, icon: '🚉', name: { j: 'Station', s: 'Station' } },
  depot: { x: 7, y: 3, icon: '🏭', name: { j: 'Depot (edge of town)', s: 'Depot (edge of town)' } },
};
export const WAIT_SPOTS = ['depot', 'homesW', 'homesN', 'shops', 'station'];
export const CHARGERS = ['depot', 'shops', 'station'];
export const travel = (a, b) => (Math.abs(PLACES[a].x - PLACES[b].x) + Math.abs(PLACES[a].y - PLACES[b].y)) * BLOCK_MIN;

// the morning's calls, 7:30 to 8:30: [minute, from, to]. Families go to school, the station and the shops; at 8:10 a
// train comes in and six people want to go home.
export const CALLS = (() => {
  const out = [];
  for (let t = 0; t < 48; t += 4) out.push([t, 'homesW', ['school', 'station', 'shops'][(t / 4) % 3]]);
  for (let t = 2; t < 48; t += 5) out.push([t, 'homesN', ['school', 'shops', 'station'][((t - 2) / 5) % 3]]);
  for (let i = 0; i < 6; i++) out.push([40, 'station', i % 2 ? 'homesN' : 'homesW']);
  return out.sort((a, b) => a[0] - b[0]);
})();

export const ROUNDS = [
  { id: 'size', show: ['cars'], goal: { wait: 15 } },
  { id: 'where', show: ['cars', 'spots'], goal: { wait: 8, empty: 50 } },
  { id: 'charge', show: ['cars', 'spots', 'charger'], charge: true, goal: { wait: 10, empty: 55 } },
];
export const CARS = { min: 2, max: 14 };
export const START = { cars: 8, spots: ['depot'], charger: 'depot' };
export function cleanPlan(p) {
  const cars = Math.max(CARS.min, Math.min(CARS.max, Math.round(Number(p?.cars)) || START.cars));
  const spots = [...new Set((Array.isArray(p?.spots) ? p.spots : []).filter((s) => WAIT_SPOTS.includes(s)))].slice(0, 2);
  return { cars, spots: spots.length ? spots : ['depot'], charger: CHARGERS.includes(p?.charger) ? p.charger : 'depot' };
}

// the morning. Returns waits (minutes), the longest and average wait, empty and full driving minutes, how busy the cars were.
export function simulate(plan, { charge = false } = {}) {
  const { cars: n, spots, charger } = cleanPlan(plan);
  const nearestSpot = (p) => spots.reduce((b, s) => (travel(p, s) < travel(p, b) ? s : b), spots[0]);
  const cars = Array.from({ length: n }, (_, i) => ({ i, at: spots[i % spots.length], free: 0, trips: 0, charged: !charge, empty: 0, full: 0, busy: 0 }));
  const waits = []; let worst = null;
  for (const [t, from, to] of CALLS) {
    // the car that can reach the caller soonest
    let best = null, bestT = Infinity;
    for (const c of cars) { const reach = Math.max(t, c.free) + travel(c.at, from); if (reach < bestT || (reach === bestT && c.i < best.i)) { best = c; bestT = reach; } }
    const c = best; const leg = travel(c.at, from), ride = travel(from, to);
    c.empty += leg; c.full += ride; c.busy += leg + ride;
    const wait = bestT - t; waits.push(wait); if (!worst || wait > worst.wait) worst = { wait, from, t };
    let done = bestT + ride; c.trips++;
    // after its second trip, a car that has not charged goes to the charger, then back to a waiting place
    if (!c.charged && c.trips >= 2) { const go = travel(to, charger), back = travel(charger, nearestSpot(charger)); c.empty += go + back; c.busy += go + CHARGE_MIN + back; done += go + CHARGE_MIN + back; c.charged = true; c.at = nearestSpot(charger); }
    else { const home = nearestSpot(to); const back = travel(to, home); c.empty += back; c.busy += back; done += back; c.at = home; }
    c.free = done;
  }
  const empty = cars.reduce((s, c) => s + c.empty, 0), full = cars.reduce((s, c) => s + c.full, 0), busy = cars.reduce((s, c) => s + c.busy, 0);
  const span = Math.max(60, ...cars.map((c) => c.free));
  return { cars: n, calls: CALLS.length, longest: Math.max(...waits), average: Math.round((waits.reduce((a, b) => a + b, 0) / waits.length) * 10) / 10, worst, emptyPct: Math.round((100 * empty) / Math.max(1, empty + full)), busyPct: Math.round((100 * busy) / (n * span)), emptyMin: empty, fullMin: full };
}
// does a run meet the round's goal?
export function meets(round, r) { return r.longest <= round.goal.wait && (round.goal.empty === undefined || r.emptyPct <= round.goal.empty); }

// the trade-off, for ages 13–17: the longest wait for every fleet size, with the rest of the plan as it is
export const curve = (plan, charge) => Array.from({ length: CARS.max - CARS.min + 1 }, (_, i) => ({ cars: CARS.min + i, longest: simulate({ ...plan, cars: CARS.min + i }, { charge }).longest }));
// ages 8–12 read shares as words, not percentages
// the words line up with the goals: 'no more than half' (round 2) and 'not much more than half' (round 3)
export const shareWords = (pct) => (pct < 45 ? 'less than half' : pct <= 50 ? 'half or a little less' : pct <= 55 ? 'just over half' : pct < 70 ? 'well over half' : 'about three quarters');
export const idleWords = (busyPct) => (busyPct >= 80 ? 'hardly ever' : busyPct >= 60 ? 'sometimes' : 'often');

const p = (o, j) => (j ? o.j : o.s);
export const GOAL = {
  size: { j: 'Goal: nobody waits more than 15 minutes.', s: 'Goal: longest wait ≤ 15 min.' },
  where: { j: 'Goal: nobody waits more than 8 minutes, and no more than half the driving is empty.', s: 'Goal: longest wait ≤ 8 min and empty driving ≤ 50%.' },
  charge: { j: 'Goal: nobody waits more than 10 minutes, even with charging, and not much more than half the driving is empty.', s: 'Goal: longest wait ≤ 10 min and empty driving ≤ 55%, with charging.' },
};
export const M5 = {
  size: { j: 'The town’s shared cars all wait at the depot, at the edge of town. How many cars do we need? Choose a number and run the morning.', s: 'All cars start and wait at the depot on the edge of town. Choose the fleet size and run the morning.' },
  where: { j: 'Cars driving back to the depot spend a lot of time empty. Choose up to two places in town where they wait instead.', s: 'Returning to the depot means a lot of empty driving. Choose up to two waiting places in town.' },
  charge: { j: 'Electric cars need charging. Each car charges once in the morning for 15 minutes. Choose where the chargers go.', s: 'Each car must charge for 15 minutes in the hour. Choose the charging hub.' },
};
// Florence's line after a run
export function fleetSay(round, r, prev, plan, j) {
  const ok = meets(round, r); const lead = j ? `Longest wait: ${r.longest} minutes. Cars drove empty for ${shareWords(r.emptyPct)} of the time.` : `Longest wait ${r.longest} min, average ${r.average} min; ${r.emptyPct}% of driving empty; cars busy ${r.busyPct}% of the hour.`;
  const worst = r.worst && r.longest > 0 ? (j ? ` The longest wait was at the ${PLACES[r.worst.from].name.j.toLowerCase()}.` : ` Worst wait: ${PLACES[r.worst.from].name.s}.`) : '';
  // Florence asks whether fewer cars would do only when one car fewer really would still meet the goal
  const fewer = plan.cars > CARS.min && meets(round, simulate({ ...plan, cars: plan.cars - 1 }, { charge: !!round.charge }));
  if (ok) return `${lead}${worst} ${j ? `Goal met with ${plan.cars} cars!` : `Goal met with ${plan.cars} cars.`}${fewer ? (j ? ' Some cars stand idle a lot. Could fewer do?' : ' Utilisation is low: could fewer cars do it?') : (j ? ' One car fewer would not be enough.' : ' One car fewer would miss the goal: this is the smallest fleet that works.')}`;
  const why = r.longest > round.goal.wait ? (j ? ' Too long a wait.' : ' Waits too long.') : (j ? ' Too much empty driving.' : ' Too much empty driving.');
  const tip = r.longest > round.goal.wait && round.id === 'size' ? (j ? ' More cars means shorter waits.' : '') : r.longest > round.goal.wait ? (j ? ' Where do most people call from?' : '') : (j ? ' Are the cars waiting near where people call?' : '');
  return `${lead}${worst}${why}${tip}`;
}
export function m5Line(rec, j) {
  return j ? `Planned a fleet of ${rec?.cars ?? 0} shared cars: longest wait ${rec?.longest ?? 0} minutes` : `Fleet of ${rec?.cars ?? 0}: longest wait ${rec?.longest ?? 0} min, ${rec?.emptyPct ?? 0}% empty driving, waiting at ${(rec?.spots || []).map((s) => PLACES[s].name.s).join(' and ')}`;
}
