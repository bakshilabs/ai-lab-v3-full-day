// Every word the "roads" module shows or says, the take-home record and its picture. Pure: no page, no 3D.
// Florence writes nothing freely: each line here is built in, with the child's own numbers put into it.
// j: ages 8–12, s: ages 13–17.
import { SLOTS, JUNCTION, CARPARK, CARPARK_SPACES, PLOT_M2, PLOT_SPACES, BAY_CARS, USES, SLOT_M, counts, land, grade, goods, nextStep, crossings, tripsPerCar, clock, BEFORE } from './street.js';

const pick = (o, j) => (j ? o.j : o.s);
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const list = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);

export const PIECES = {
  drop: { icon: '🚏', letter: 'D', color: '#2f6fd8', name: { j: 'Drop-off point', s: 'Drop-off point' },
    desc: { j: 'A shared car stops here to pick people up. A car can only stop at a marked point.', s: 'Pick-up and drop-off. A shared car only stops at a marked point, and one car loads at a time.' } },
  bay: { icon: '🚙', letter: 'B', color: '#1f7f49', name: { j: 'Waiting bay', s: 'Waiting bay' },
    desc: { j: `${BAY_CARS} shared cars wait here, close to the homes. Cars with no bay wait far outside the street.`, s: `Holds ${BAY_CARS} shared cars near the homes. A car with no bay waits four minutes away.` } },
  walk: { icon: '🚸', letter: 'C', color: '#a4520a', name: { j: 'Crossing', s: 'Walkers’ crossing' },
    desc: { j: 'A marked place to cross, on foot or by bike. The cars always stop here for people.', s: 'For people on foot. Every car stops at it, which adds about 12 seconds to a trip that passes it.' } },
  cycle: { icon: '🚲', letter: 'Y', color: '#b23a26', name: { j: 'Cycle crossing', s: 'Cycle crossing' },
    desc: { j: 'A marked place for bikes to cross.', s: 'For the cycle track. Every car stops at it, which adds about 12 seconds to a trip that passes it.' } },
};
export const pieceName = (kind, j) => pick(PIECES[kind].name, j);

// what stands beside each place on the street
export function beside(slot, j) {
  if (slot === JUNCTION) return { icon: '↘', text: j ? 'the side road' : 'the junction' };
  if (slot === 0) return { icon: '🛒', text: 'the shop' };
  if (CARPARK.includes(slot)) return { icon: '🅿', text: 'the car park' };
  if (slot === 6) return { icon: '🚲', text: 'the cycle track' };
  if (slot >= 7) return { icon: '🏫', text: 'the school' };
  return { icon: '🏠', text: 'homes' };
}
// the helper strip's headings: what stands on the south side, and how many places each spans
export const LANDMARKS = [{ icon: '🛒', text: 'Shop', span: 1 }, { icon: '🅿', text: 'Car park', span: 4 }, { icon: '↘', text: 'Side road', span: 1 }, { icon: '🚲', text: 'Cycle track', span: 1 }, { icon: '🏫', text: 'School', span: 3 }];
export const lineName = (id) => ({ shop: 'by the shop', track: 'on the cycle track', school: 'by the school' }[id]);

export const USE = {
  homes: { icon: '🏘', name: 'Homes', gain: { j: `homes for ${USES.homes.families} families`, s: `homes for ${USES.homes.families} families` } },
  park: { icon: '🌳', name: 'Park', gain: { j: 'a play space the size of a tennis court', s: `${USES.park.play} m² to play` } },
  garden: { icon: '🥕', name: 'Garden', gain: { j: `a market garden: vegetables for ${USES.garden.feeds} families`, s: `a market garden: vegetables for ${USES.garden.feeds} families` } },
  parking: { icon: '🅿', name: 'Parking', gain: { j: `${USES.parking.spaces} parking spaces for visitors`, s: `${USES.parking.spaces} visitor spaces` } },
};

// how long, in words a child can read aloud
export function wait(sec, j) {
  if (sec === null || sec === undefined) return '—';
  if (j) { const m = Math.round(sec / 60); return m < 1 ? 'under 1 minute' : plural(m, 'minute'); }
  const m = Math.floor(sec / 60), s = Math.round(sec % 60); return m ? `${m} min ${String(s).padStart(2, '0')} s` : `${s} s`;
}
export const GRADE = { good: 'Good', fair: 'Could be better', poor: 'Needs work' };

export const T = {
  title: { j: 'Roads for self-driving cars', s: 'Roads for self-driving cars' },
  stage: { intro: 'Meeting the street', design: 'Designing the street', run: 'Running the morning', results: 'Reading the numbers', land: 'Choosing what the freed land becomes', rerun: 'Testing the street with the new homes', ride: 'Riding along the street', done: 'Street finished' },
  start: { j: 'Start ➜', s: 'Start ➜' },
  run: { j: '▶ Run the morning', s: '▶ Run the morning' },
  clear: 'Clear the street',
  skip: 'Skip to the numbers',
  change: { j: 'Change my street', s: 'Change the street' },
  keep: { j: 'Keep this street ➜', s: 'Keep this street ➜' },
  build: { j: 'Build it ➜', s: 'Build it ➜' },
  rerun: '▶ Run the morning with the new homes',
  next: 'Next ➜', finish: 'Finish ➜', rideGo: { j: 'Take a ride ➜', s: 'Ride the street ➜' },
  strip: 'Or choose a place here:',
  keys: (n) => `Keys: 1 to ${n} choose a piece, the arrows move along the street, Enter places it.`,
  legend: { j: 'Press a number to see where it happened. Green flag: safe to cross. Orange flag: no marked crossing.', s: 'Press a number to see where it comes from. Green flag: a marked crossing. Orange flag: none.' },
  fleet: 'Shared cars',
};

// one screen before the child starts
export function intro(j) {
  return j
    ? 'This is Maple Street today. Parked cars fill it all day. Soon the town will share self-driving cars. They drive well, and they follow the street’s markings exactly. So the street needs the right markings. That is your job.'
    : 'Maple Street today: parked cars along both kerbs and a 40-space car park, full all day. The town is moving to shared self-driving cars. They drive well and keep exactly to the street’s markings. Designing those markings is your job.';
}
// the three rules, each taught when it comes up (the drop-off rule first, the others when a piece is chosen or the junction is tapped)
export const rules = (j) => (j
  ? ['A shared car can only stop at a marked drop-off point.', 'A shared car always stops at a marked crossing.', 'Nothing can go in the side road.']
  : ['A shared car only stops at a marked drop-off point.', 'A shared car always gives way at a marked crossing.', 'Nothing can be placed in the junction.']);
export const firstAsk = (j, trips) => (j
  ? `${trips} families here call a car each morning. A car can only stop at a marked drop-off point. Tap the street outside the homes to put one in.`
  : `${trips} families on this street call a car each morning. A car only stops at a marked drop-off point. Tap the street outside the homes to place one.`);
export const afterFirst = (j) => (j
  ? 'A car can stop there now. Add waiting bays and crossings where you think they help. Then press Run the morning.'
  : 'A car can stop there now. Add waiting bays and crossings where they help, then run the morning.');
export const designAsk = (j) => (j
  ? 'Choose a piece, then tap a place on the street. Tap a piece again to take it away. Then press Run the morning.'
  : 'Choose a piece, then tap a place on the street. Tap a piece again to remove it. Then run the morning.');
export const needDrop = (j) => (j ? 'The cars have nowhere to stop yet. Put in a drop-off point first.' : 'The cars cannot stop anywhere yet. Place a drop-off point first.');
export const noJunction = (j) => (j ? 'That is the side road. Nothing can go there.' : 'That is the junction. Nothing can be placed there.');
export const placed = (kind, slot, on, j) => `${pieceName(kind, j)} ${on ? 'placed by' : 'taken away from'} ${beside(slot, j).text}.`;
export const cleared = (j) => (j ? 'The street is clear. Start with a drop-off point.' : 'The street is clear. Start with a drop-off point.');
export const fleetSay = (fleet, trips) => `${fleet} shared cars for ${trips} calls: ${Math.round((trips / fleet) * 10) / 10} trips for each car. Fewer cars each do more trips, but people may wait longer.`;
export function runSay(j, res) {
  const far = res.bays === 0 ? (j ? ' No car has a bay, so the first car comes from outside the street, four minutes away.' : ' No car has a bay, so the first car starts four minutes away.') : '';
  const who = res.extra ? (j ? `${res.trips} families call a car, with the ${res.extra} new ones.` : `${res.trips} calls in half an hour, ${res.extra} of them from the new homes.`) : (j ? `${res.trips} families call a car.` : `${res.trips} calls in half an hour.`);
  return j ? `Here comes the morning. ${who} ${res.fleet} shared cars do the work. Watch the first family.${far}` : `The morning rush: ${who} ${res.fleet} shared cars serve them. Watch the first call.${far}`;
}
export const runFast = (j) => (j ? 'Now the rest of the morning, speeded up.' : 'The rest of the half hour, speeded up.');
export const runCount = (waiting, onStreet) => `Waiting for a car: ${waiting}. Cars on the street: ${onStreet}.`;
// the reduced-motion morning: one line for each still picture
export function stillSay(still, res, j) {
  const at = `the drop-off point by ${beside(still.drop, j).text}`; const time = clock(still.t);
  if (still.kind === 'queue') return j ? `${time}. The longest queue: ${plural(res.queue, 'car')} at ${at}. Only one car can load at a time.` : `${time}. The longest queue: ${plural(res.queue, 'car')} at ${at}, because one car loads at a time.`;
  if (still.kind === 'wait') return j ? `${time}. This family waited ${wait(res.longestWait, true)} at ${at}. That was the longest wait of the morning.` : `${time}. The longest wait of the morning: ${wait(res.longestWait, false)} at ${at}.`;
  return j ? `${time}. The first family gets into a shared car at ${at}.` : `${time}. The first family boards at ${at}.`;
}

// the numbers after a run: [{ id, label, value, grade, was }]
export function measures(res, j, prev = null) {
  const g = grade(res, j); const pg = prev && prev.ran ? prev : null;
  const out = [
    { id: 'wait', label: 'Longest wait for a car', value: wait(res.longestWait, j), grade: g.wait, was: pg ? wait(pg.longestWait, j) : null },
    { id: 'walk', label: 'Furthest walk to a drop-off', value: `${res.furthestWalk} m`, grade: g.walk, was: pg ? `${pg.furthestWalk} m` : null },
    { id: 'safe', label: j ? 'Safe crossings' : 'Crossing places made safe', value: `${res.safe} of ${res.lines}`, grade: g.safe, was: prev ? `${prev.safe} of ${prev.lines}` : null },
    { id: 'queue', label: j ? 'Most cars in a queue' : 'Longest queue at a drop-off', value: plural(res.queue, 'car'), grade: g.queue, was: pg ? plural(pg.queue, 'car') : null },
  ];
  if (!j) {
    out.push({ id: 'avg', label: 'Average wait', value: wait(res.averageWait, false), grade: res.averageWait <= 60 ? 'good' : res.averageWait <= 180 ? 'fair' : 'poor', was: pg ? wait(pg.averageWait, false) : null });
    out.push({ id: 'use', label: 'Trips for each car', value: `${tripsPerCar(res)}`, grade: g.use, was: prev ? `${tripsPerCar(prev)}` : null });
  }
  return out;
}
// the heading over the numbers, with how many read Good and the best so far
export function resultsHead(res, j, best = null) {
  const g = goods(res, j); const b = best && best.of === g.of && best.good > g.good ? ` Best so far: ${best.good} of ${best.of}.` : '';
  const who = j ? `${res.trips} families${res.extra ? ` (${res.extra} in the new homes)` : ''}, ${res.fleet} shared cars` : `${res.trips} calls${res.extra ? ` (${res.extra} from the new homes)` : ''}, ${res.fleet} shared cars (${res.carsInBays} in bays, ${res.carsOutside} outside the street)`;
  return `${who}. Good: ${g.good} of ${g.of}.${b}`;
}
// Florence's one comment after a run: what the numbers say and the one thing most worth trying
export function comment(res, j) {
  const step = nextStep(res, j); const unsafe = res.crossings.filter((c) => !c.safe).map((c) => lineName(c.id));
  switch (step) {
    case 'safe': return j ? `People still cross ${list(unsafe)} with no markings. The cars stop at every marked crossing, so mark one there.` : `People still cross ${list(unsafe)} without a marked crossing${res.crossings.some((c) => !c.safe && c.who === 'cycle') ? ' (the track needs a cycle crossing)' : ''}. The cars give way at every marked one.`;
    case 'walk': return j ? `The furthest home walks ${res.furthestWalk} metres to a car. Another drop-off point near those homes would help.` : `The furthest home is ${res.furthestWalk} m from a drop-off point. A second point nearer those homes shortens the walk.`;
    case 'queue': return j ? `${res.queue} cars queued at a drop-off point. Only one car can load at a time. Another drop-off point shares the work.` : `${res.queue} cars queued at one point, because one car loads at a time. Another drop-off point spreads the load.`;
    case 'bay': return j ? `Someone waited ${wait(res.longestWait, true)}. ${res.carsOutside} of the cars have no bay, so they wait far outside the street. A waiting bay keeps cars close.` : `The longest wait was ${wait(res.longestWait, false)}. ${res.carsOutside} of ${res.fleet} cars have no bay and start four minutes away. Another bay holds ${BAY_CARS} more nearby${res.fleet > Math.ceil(res.trips / 3) ? '' : ', or run more cars'}.`;
    case 'wait': return j ? `Someone waited ${wait(res.longestWait, true)}. Every crossing a car passes slows it a little. Try the bays nearer the drop-off points.` : `The longest wait was ${wait(res.longestWait, false)}. Each crossing a car passes adds about 12 seconds. Try bays closer to the drop-off points, or one more car.`;
    case 'fewer': return `The street works for people. Each of the ${res.fleet} cars makes ${tripsPerCar(res)} trips. Try fewer cars and see whether the wait holds.`;
    default: return j ? 'This street works well, for the cars and for the people. You can keep it, or try another idea.' : 'This layout works for the cars and for people on foot and on bikes. Keep it, or test another idea.';
  }
}
// what pressing a number card says: where on the street the number comes from
export function whereSay(id, res, j) {
  const at = (d) => `the drop-off point by ${beside(d, j).text}`; const w = res.where;
  switch (id) {
    case 'wait': return !res.ran ? needDrop(j) : `The longest wait was at ${at(w.wait.drop)}: ${wait(res.longestWait, j)}.${res.carsOutside ? ` ${plural(res.carsOutside, 'car')} had no bay and started four minutes away.` : ''}`;
    case 'walk': return !res.ran ? needDrop(j) : `The home by ${beside(w.walk.home, j).text} is furthest from a car: ${res.furthestWalk} m to ${at(w.walk.drop)}.`;
    case 'queue': return !res.ran ? needDrop(j) : res.queue && w.queue ? `The longest queue was at ${at(w.queue.drop)}: ${plural(res.queue, 'car')} at ${clock(w.queue.t)}. One car loads at a time.` : 'No car had to queue at a drop-off point.';
    case 'safe': return `${res.safe} of ${res.lines} crossing places are safe. A green flag has a marked crossing at it or next to it. An orange flag has none.`;
    case 'avg': return `All ${res.trips} waits added up and shared out: ${wait(res.averageWait, false)} each.`;
    case 'use': return `${res.trips} trips shared by ${res.fleet} cars: ${tripsPerCar(res)} trips for each car. Fewer cars each do more, but people may wait longer.`;
    default: return '';
  }
}
// the signs that stand on the street with the numbers: [{ id, slot, text, tone, side }]
export function marks(res, j) {
  const out = res.crossings.map((c) => ({ id: 'safe', slot: c.safe ? c.at : c.slot, line: c.slot, who: c.who, text: c.safe ? 'Safe to cross' : 'No safe crossing', tone: c.safe ? 'good' : 'warn' }));
  if (!res.ran) return out; const g = grade(res, j); const tone = (x) => (x === 'good' ? 'good' : x === 'fair' ? 'warn' : 'poor');
  out.push({ id: 'walk', slot: res.where.walk.home, to: res.where.walk.drop, text: `Furthest walk: ${res.furthestWalk} m`, tone: tone(g.walk) });
  out.push({ id: 'wait', slot: res.where.wait.drop, text: `Longest wait: ${j ? wait(res.longestWait, true) : wait(res.longestWait, false)}`, tone: tone(g.wait) });
  if (res.queue && res.where.queue) out.push({ id: 'queue', slot: res.where.queue.drop, n: res.queue, text: `Longest queue: ${plural(res.queue, 'car')}`, tone: tone(g.queue) });
  return out;
}

export function landIntro(j, fleet) {
  return j
    ? `${fleet} shared cars now do the work of ${CARPARK_SPACES} parked cars. They charge on one plot at night. Plots A, B and C are free. Each is about the size of a tennis court. Choose what each one becomes.`
    : `Shared cars are in use, not parked. ${fleet} of them replace ${CARPARK_SPACES} parked cars and charge on one plot overnight. Plots A, B and C, ${PLOT_M2} m² each, are free. Decide what each becomes.`;
}
// what the choices add up to, and what was not chosen
export function landGain(plots, j = false) {
  const L = land(plots); const out = [];
  if (L.families) out.push(`homes for ${L.families} families`);
  if (L.play) out.push(j ? (L.park === 1 ? 'a play space the size of a tennis court' : `play space the size of ${L.park} tennis courts`) : `${L.play} m² to play`);
  if (L.feeds) out.push(`vegetables for ${L.feeds} families`);
  if (L.parking) out.push(`${L.parking * PLOT_SPACES} visitor spaces`);
  return out;
}
const GIVEN = { homes: 'homes', park: 'a park', garden: 'a market garden', parking: 'visitor parking' };
export function landSummary(plots, j, effect = null) {
  const L = land(plots); const out = [];
  if (!L.chosen) return [j ? 'Tap a use for each plot.' : 'Choose a use for each plot.'];
  out.push(`${j ? 'You gain' : 'Gained'}: ${list(landGain(plots, j))}.`);
  out.push(`${j ? 'Parking spaces' : 'Parking'}: ${CARPARK_SPACES} before, ${L.spaces} now.`);
  if (L.done && L.notChosen.length) out.push(`${j ? 'Not chosen' : 'Given up'}: ${list(L.notChosen.map((id) => GIVEN[id]))}.`);
  if (effect && L.families) out.push(j ? `${L.families} more families will call a car each morning. Longest wait: ${wait(effect.before, true)} now, ${wait(effect.after, true)} with them.` : `${L.families} more families add ${L.families} morning calls. Longest wait: ${wait(effect.before, false)} now, ${wait(effect.after, false)} with them.`);
  return out;
}
// the last line once the land is built: no option is marked right; keeping all the parking has its own line
export function landClose(plots, j) {
  const L = land(plots);
  if (L.parking === L.plots.length) return j ? `All three plots stay as parking, so the car park keeps its ${CARPARK_SPACES} spaces. Nothing new is built. That is a choice too.` : `All three plots stay as parking: the car park keeps its ${CARPARK_SPACES} spaces and no land changes use. That is a choice too.`;
  return j ? 'There is no single right answer. This is your choice for your town.' : `No option is the right one: ${L.freed} m² now does a different job.`;
}
// the land choice has a consequence: new homes mean more calls. Florence offers to run the morning with them.
export const newHomesAsk = (j, fam) => (j
  ? `The new homes bring ${fam} more families. Will your street still work? Run the morning with them and see.`
  : `The new homes add ${fam} families and ${fam} morning calls. Run the morning with them to test the street.`);
export const withHomes = (j, fam) => (j ? `With the ${fam} new families: ` : `With ${fam} more families: `);

// the ride: one caption for each stop, in order along the street. Waiting bays share one caption.
export function rideStops(layout, plots, j, res = null) {
  const out = [{ at: -1, text: j ? 'Here we go. You are riding in a shared car along your street.' : 'A ride in a shared car along the street you designed.' }];
  const L = land(plots); const seen = {}; const c = counts(layout);
  for (let s = 0; s < SLOTS; s++) {
    const k = layout[s]; const again = k && seen[k]; if (k) seen[k] = true;
    if (k === 'drop') out.push({ at: s, kind: k, pause: true, text: again ? `Another drop-off point, by ${beside(s, j).text}.` : j ? `Your drop-off point by ${beside(s, j).text}. The car stops here because you marked it.` : `Your drop-off point by ${beside(s, j).text}: the car stops only where it is marked.` });
    if (k === 'bay' && !again) out.push({ at: s, kind: k, text: j ? `${c.bay === 1 ? 'Your waiting bay' : `The first of your ${c.bay} waiting bays`}, by ${beside(s, j).text}. Cars rest here until someone calls.` : `${c.bay === 1 ? 'Your waiting bay' : `The first of your ${c.bay} waiting bays`}, by ${beside(s, j).text}, where cars wait for the next call.` });
    if (k === 'walk' || k === 'cycle') out.push({ at: s, kind: k, pause: true, text: again ? `Another ${pieceName(k, j).toLowerCase()}, by ${beside(s, j).text}. The car gives way again.` : j ? `Your crossing by ${beside(s, j).text}. The car stops and lets people cross.` : `Your ${pieceName(k, false).toLowerCase()} by ${beside(s, j).text}: the car gives way.` });
    if (s === 2) out.push({ at: 2.5, kind: 'land', pause: true, text: L.parking === L.plots.length ? (j ? 'On the right, the old car park. You kept it all as parking.' : 'On the right, the car park, kept as parking.') : `${j ? 'On the right, the old car park. Now it has' : 'On the right, the former car park:'} ${list(landGain(plots, j))}, and one plot for the shared cars.` });
  }
  out.push({ at: SLOTS, text: rideEnd(res, j) });
  return out;
}
// the ride's last line says what the street does. It praises the plan only when every number reads Good.
export function rideEnd(res, j) {
  if (!res || !res.ran) return j ? 'That is your street.' : 'That is the street, as you designed it.';
  const g = goods(res, j); const facts = `${res.safe} of ${res.lines} crossing places are safe, and the longest wait is ${wait(res.longestWait, j)}`;
  if (g.good === g.of) return j ? `That is your street. ${facts}. Every number is Good. Well planned!` : `That is the street: ${facts}. Every number reads Good.`;
  return j ? `That is your street. ${facts}. You can come back and change it another day.` : `That is the street: ${facts}. It can be redesigned another time.`;
}

// ---- the take-home record
export function madeLines(layout, res, plots, j) {
  const c = counts(layout); const L = land(plots);
  return [
    `${plural(c.drop, 'drop-off point')}, ${plural(c.bay, 'waiting bay')}, ${plural(c.crossings, 'crossing')}`,
    `Longest wait for a shared car: ${wait(res.longestWait, j)}${res.extra ? `, with ${res.extra} new families` : ''}`,
    `Furthest walk to a drop-off point: ${res.furthestWalk} m`,
    `Safe crossings: ${res.safe} of ${res.lines} (before: ${BEFORE.safe} of ${BEFORE.lines})`,
    `Car park: ${CARPARK_SPACES} spaces before, ${L.spaces} now, ${res.fleet} shared cars`,
    `Freed land: ${list(landGain(plots, j)) || 'kept as parking'}`,
  ];
}
// "You practised …": each line completes that sentence, and is built from what the child did
export function practised(layout, plots, did, j) {
  const c = counts(layout); const L = land(plots);
  const parts = [c.drop && plural(c.drop, 'drop-off point'), c.bay && plural(c.bay, 'waiting bay'), c.crossings && plural(c.crossings, 'crossing')].filter(Boolean);
  const out = [`designing a street for self-driving cars, with ${list(parts)}`];
  out.push(did.runs > 1 && did.changes > 0 ? `testing a design and improving it over ${did.runs} runs` : 'testing a design with real numbers: waiting time, walking distance and safe crossings');
  const uses = ['homes', 'park', 'garden', 'parking'].filter((id) => L[id]).map((id) => GIVEN[id]);
  out.push(`weighing what freed land is best used for: ${list(uses)}`);
  if (did.rode) out.push(j ? 'checking the design from inside a shared car' : 'reviewing a design from the passenger’s point of view');
  return out;
}
export const madeTitle = (j) => (j ? 'My street for shared cars' : 'A street for shared self-driving cars');

// the picture: the street before and after, seen from above. Inline SVG, no script. It is often shown about 220 px
// wide, so it has two big headings, big letters on the pieces and no small print.
const USE_FILL = { homes: '#d98b5f', park: '#7cc46a', garden: '#b89a4a', parking: '#8a9099' };
function strip(y, layout, plots, before, title) {
  const W = 38, X = 20; const s = [`<text x="${X}" y="${y - 10}" font-size="22" font-weight="800" fill="#3b2a1e">${title}</text>`];
  s.push(`<rect x="${X}" y="${y}" width="${W * SLOTS}" height="112" rx="6" fill="#cfe6b8"/>`);
  for (let i = 0; i < SLOTS; i++) if (i !== 6) s.push(`<rect x="${X + i * W + 7}" y="${y + 5}" width="24" height="17" fill="#e9c9a0" stroke="#9a6a4a"/><path d="M${X + i * W + 5} ${y + 7}L${X + i * W + 19} ${y}L${X + i * W + 33} ${y + 7}Z" fill="#b5523b"/>`);
  s.push(`<rect x="${X + 6 * W + 13}" y="${y}" width="12" height="112" fill="#d98b7a"/>`);                     // the cycle track
  s.push(`<rect x="${X}" y="${y + 26}" width="${W * SLOTS}" height="10" fill="#e6dcc8"/><rect x="${X}" y="${y + 66}" width="${W * SLOTS}" height="10" fill="#e6dcc8"/>`);
  s.push(`<rect x="${X}" y="${y + 36}" width="${W * SLOTS}" height="30" fill="#6b7178"/><rect x="${X + JUNCTION * W + 7}" y="${y + 66}" width="24" height="46" fill="#6b7178"/>`);
  s.push(`<rect x="${X + 4}" y="${y + 80}" width="30" height="26" fill="#f0d27a" stroke="#9a6a4a"/>`);                                 // the shop
  s.push(`<rect x="${X + 7 * W + 2}" y="${y + 80}" width="${W * 3 - 6}" height="26" fill="#f2b8a0" stroke="#9a6a4a"/>`);              // the school
  CARPARK.forEach((slot, n) => {
    const x = X + slot * W + 1; const use = before ? 'parking' : n < plots.length ? plots[n] || 'parking' : 'parking';
    s.push(`<rect x="${x}" y="${y + 78}" width="${W - 2}" height="30" fill="${USE_FILL[use]}" stroke="#5a4a3a"/>`);
    if (before || use === 'parking') for (let c = 0; c < (before ? 6 : n === 3 ? 4 : 3); c++) s.push(`<rect x="${x + 4 + (c % 3) * 10}" y="${y + 81 + Math.floor(c / 3) * 13}" width="8" height="11" rx="2" fill="#${before ? ['c8553d', '3d6e8a', 'e8d9b0'][c % 3] : n === 3 ? 'f6f3ea' : 'e8d9b0'}"/>`);
    else if (use === 'homes') for (let c = 0; c < 4; c++) s.push(`<rect x="${x + 5 + (c % 2) * 15}" y="${y + 81 + Math.floor(c / 2) * 13}" width="11" height="10" fill="#fff3e0" stroke="#7a4a33"/>`);
    else if (use === 'park') s.push(`<circle cx="${x + 11}" cy="${y + 88}" r="7" fill="#3f8f3a"/><circle cx="${x + 26}" cy="${y + 98}" r="7" fill="#3f8f3a"/>`);
    else if (use === 'garden') for (let c = 0; c < 4; c++) s.push(`<rect x="${x + 4}" y="${y + 81 + c * 6.5}" width="${W - 10}" height="3.5" fill="#4f7f2f"/>`);
  });
  for (let i = 0; i < SLOTS; i++) {
    const x = X + i * W; const k = layout[i];
    if (before && i !== JUNCTION) s.push(`<rect x="${x + 9}" y="${y + 37}" width="20" height="8" rx="3" fill="#${['c8553d', '3d6e8a', 'e8d9b0', '5a6d50'][i % 4]}"/><rect x="${x + 9}" y="${y + 57}" width="20" height="8" rx="3" fill="#${['e6a15a', '6b5b8a', 'c8553d', '3d6e8a'][i % 4]}"/>`);
    if (k === 'walk' || k === 'cycle') for (let b = 0; b < 4; b++) s.push(`<rect x="${x + 6 + b * 7}" y="${y + 36}" width="4" height="30" fill="${k === 'cycle' ? '#f2a08c' : '#fff'}"/>`);
    if (k === 'drop') s.push(`<circle cx="${x + 19}" cy="${y + 42}" r="12" fill="${PIECES.drop.color}" stroke="#fff" stroke-width="2"/><text x="${x + 19}" y="${y + 48}" font-size="17" text-anchor="middle" fill="#fff" font-weight="800">D</text>`);
    if (k === 'bay') s.push(`<circle cx="${x + 19}" cy="${y + 61}" r="12" fill="${PIECES.bay.color}" stroke="#fff" stroke-width="2"/><text x="${x + 19}" y="${y + 67}" font-size="17" text-anchor="middle" fill="#fff" font-weight="800">B</text>`);
  }
  return s.join('');
}
export function picture(layout, plots, res, j) {
  const L = land(plots);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 360" width="420" height="360" font-family="Inter, Arial, sans-serif"><rect width="420" height="360" fill="#fff9ec"/>`
    + strip(38, BEFORE.layout, [], true, `Before: ${CARPARK_SPACES} parked cars`)
    + strip(196, layout, L.plots, false, `After: ${res.fleet} shared cars`)
    + `<circle cx="32" cy="336" r="12" fill="${PIECES.drop.color}"/><text x="32" y="342" font-size="17" text-anchor="middle" fill="#fff" font-weight="800">D</text><text x="50" y="343" font-size="19" font-weight="700" fill="#3b2a1e">drop-off</text>`
    + `<circle cx="158" cy="336" r="12" fill="${PIECES.bay.color}"/><text x="158" y="342" font-size="17" text-anchor="middle" fill="#fff" font-weight="800">B</text><text x="176" y="343" font-size="19" font-weight="700" fill="#3b2a1e">bay</text>`
    + `<rect x="232" y="324" width="34" height="24" fill="#6b7178"/>` + [0, 1, 2, 3].map((b) => `<rect x="${237 + b * 7}" y="324" width="4" height="24" fill="#fff"/>`).join('') + `<text x="272" y="343" font-size="19" font-weight="700" fill="#3b2a1e">crossing</text></svg>`;
}
export { SLOT_M };
