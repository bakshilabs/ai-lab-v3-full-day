// Every word the "roads" module shows or says, the take-home record and its picture. Pure: no page, no 3D.
// Florence writes nothing freely: each line here is built in, with the child's own numbers put into it.
// j: ages 8–12, s: ages 13–17.
import { SLOTS, JUNCTION, LINES, CARPARK, CARPARK_SPACES, PLOT_M2, PLOT_SPACES, BAY_CARS, USES, counts, land, grade, nextStep, crossings, BEFORE } from './street.js';

const pick = (o, j) => (j ? o.j : o.s);
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const list = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);

export const PIECES = {
  drop: { icon: '🚏', letter: 'D', color: '#2f6fd8', name: { j: 'Drop-off point', s: 'Drop-off point' },
    desc: { j: 'A shared car stops here to pick people up. A car can only stop at a marked point.', s: 'Pick-up and drop-off. A shared car only stops at a marked point, and one car loads at a time.' } },
  bay: { icon: '🚙', letter: 'B', color: '#2e9b5a', name: { j: 'Waiting bay', s: 'Waiting bay' },
    desc: { j: `${BAY_CARS} shared cars wait here, close to the homes. Cars with no bay wait far outside the street.`, s: `Holds ${BAY_CARS} shared cars near the homes. A car with no bay waits four minutes away.` } },
  walk: { icon: '🚸', letter: 'C', color: '#e6a15a', name: { j: 'Crossing', s: 'Walkers’ crossing' },
    desc: { j: 'A marked place to cross, on foot or by bike. The cars always stop here for people.', s: 'For people on foot. Every car stops at it, which adds about 12 seconds to a trip that passes it.' } },
  cycle: { icon: '🚲', letter: 'Y', color: '#c8553d', name: { j: 'Cycle crossing', s: 'Cycle crossing' },
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
export const lineName = (id) => ({ shop: 'by the shop', track: 'on the cycle track', school: 'by the school' }[id]);

export const USE = {
  homes: { icon: '🏘', name: 'Homes', gain: `homes for ${USES.homes.families} families` },
  park: { icon: '🌳', name: 'Park', gain: `${USES.park.play} m² to play` },
  garden: { icon: '🥕', name: 'Market garden', gain: `vegetables for ${USES.garden.feeds} families` },
  parking: { icon: '🅿', name: 'Keep parking', gain: `${USES.parking.spaces} spaces for visitors` },
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
  stage: { intro: 'Meeting the street', design: 'Designing the street', run: 'Running the morning', results: 'Reading the numbers', land: 'Choosing what the freed land becomes', ride: 'Riding along the street', done: 'Street finished' },
  start: { j: 'Start ➜', s: 'Start ➜' },
  run: { j: '▶ Run the morning', s: '▶ Run the morning' },
  skip: 'Skip to the numbers',
  change: { j: 'Change my street', s: 'Change the street' },
  keep: { j: 'Keep this street ➜', s: 'Keep this street ➜' },
  build: { j: 'Build it ➜', s: 'Build it ➜' },
  next: 'Next ➜', finish: 'Finish ➜', rideGo: { j: 'Take a ride ➜', s: 'Ride the street ➜' },
};

export function intro(j, families, trips) {
  const who = families >= trips ? `Your town has ${families} families. ${trips} of them need a ride from this street each morning.` : `${trips} families on this street need a ride each morning.`;
  return j
    ? ['This is Maple Street as it is now. Cars are parked all along it, and the car park is full all day.',
      'Soon the town will share self-driving cars. A car picks a family up, takes them into town, then comes back for someone else.',
      'The cars are good drivers, and they follow the street’s markings exactly. So the street needs the right markings. That is your job.',
      who]
    : ['This is Maple Street today: parked cars along both kerbs and a 40-space car park that is full all day.',
      'The town is moving to shared self-driving cars. Each car carries one family into town, then returns for the next call.',
      'The cars drive well, and they keep exactly to the street’s markings. Designing those markings is your job.',
      who];
}
export const rules = (j) => (j
  ? ['A shared car can only stop at a marked drop-off point.', 'A shared car always stops at a marked crossing.', 'Nothing can go in the side road.']
  : ['A shared car only stops at a marked drop-off point.', 'A shared car always gives way at a marked crossing.', 'Nothing can be placed in the junction.']);
export const designAsk = (j) => (j
  ? 'Choose a piece, then tap a place on the street. Put in at least one drop-off point. Then press Run the morning.'
  : 'Choose a piece, then tap a place on the street. You need at least one drop-off point before you run the morning.');
export const needDrop = (j) => (j ? 'The cars have nowhere to stop yet. Put in a drop-off point first.' : 'The cars cannot stop anywhere yet. Place a drop-off point first.');
export const noJunction = (j) => (j ? 'That is the side road. Nothing can go there.' : 'That is the junction. Nothing can be placed there.');
export const placed = (kind, slot, on, j) => `${pieceName(kind, j)} ${on ? 'placed by' : 'taken away from'} ${beside(slot, j).text}.`;
export const runSay = (j, trips, fleet) => (j ? `Here comes the morning. ${trips} families call a car. ${fleet} shared cars do the work.` : `The morning rush: ${trips} calls in half an hour, served by ${fleet} shared cars.`);

// the numbers after a run: [{ id, label, value, grade, was }]
export function measures(res, j, prev = null) {
  const g = grade(res); const pg = prev && prev.ran ? prev : null;
  const out = [
    { id: 'wait', label: j ? 'Longest wait for a car' : 'Longest wait for a car', value: wait(res.longestWait, j), grade: g.wait, was: pg ? wait(pg.longestWait, j) : null },
    { id: 'walk', label: j ? 'Furthest walk to a drop-off' : 'Furthest walk to a drop-off', value: `${res.furthestWalk} m`, grade: g.walk, was: pg ? `${pg.furthestWalk} m` : null },
    { id: 'safe', label: j ? 'Safe crossings' : 'Crossing places made safe', value: `${res.safe} of ${res.lines}`, grade: g.safe, was: prev ? `${prev.safe} of ${prev.lines}` : null },
    { id: 'queue', label: j ? 'Most cars in a queue' : 'Longest queue at a drop-off', value: plural(res.queue, 'car'), grade: g.queue, was: pg ? plural(pg.queue, 'car') : null },
  ];
  if (!j) out.push({ id: 'avg', label: 'Average wait', value: wait(res.averageWait, false), grade: res.averageWait <= 60 ? 'good' : res.averageWait <= 180 ? 'fair' : 'poor', was: pg ? wait(pg.averageWait, false) : null });
  return out;
}
// Florence's one comment after a run: what the numbers say and the one thing most worth trying
export function comment(res, j) {
  const step = nextStep(res); const unsafe = res.crossings.filter((c) => !c.safe).map((c) => lineName(c.id));
  switch (step) {
    case 'safe': return j ? `People still cross ${list(unsafe)} with no markings. The cars stop at every marked crossing, so mark one there.` : `People still cross ${list(unsafe)} without a marked crossing${res.crossings.some((c) => !c.safe && c.who === 'cycle') ? ' (the track needs a cycle crossing)' : ''}. The cars give way at every marked one.`;
    case 'walk': return j ? `The furthest home walks ${res.furthestWalk} metres to a car. Another drop-off point near those homes would help.` : `The furthest home is ${res.furthestWalk} m from a drop-off point. A second point nearer those homes shortens the walk.`;
    case 'queue': return j ? `${res.queue} cars queued at a drop-off point. Only one car can load at a time. Another drop-off point shares the work.` : `${res.queue} cars queued at one point, because one car loads at a time. Another drop-off point spreads the load.`;
    case 'bay': return j ? `Someone waited ${wait(res.longestWait, true)}. ${res.carsOutside} of the cars have no bay, so they wait far outside the street. A waiting bay keeps cars close.` : `The longest wait was ${wait(res.longestWait, false)}. ${res.carsOutside} of ${res.fleet} cars have no bay and start four minutes away. Another bay holds ${BAY_CARS} more nearby.`;
    case 'wait': return j ? `Someone waited ${wait(res.longestWait, true)}. Every crossing a car passes slows it a little. Try the bays nearer the drop-off points.` : `The longest wait was ${wait(res.longestWait, false)}. Each crossing a car passes adds about 12 seconds. Try bays closer to the drop-off points.`;
    default: return j ? 'This street works well, for the cars and for the people. You can keep it, or try another idea.' : 'This layout works for the cars and for people on foot and on bikes. Keep it, or test another idea.';
  }
}

export function landIntro(j, fleet) {
  return j
    ? `The shared cars do not park all day. ${fleet} shared cars now do the work of ${CARPARK_SPACES} parked cars. They charge on one plot at night. Three plots are free. Choose what each one becomes.`
    : `Shared cars are in use, not parked. ${fleet} of them replace ${CARPARK_SPACES} parked cars and charge on one plot overnight. Three plots of ${PLOT_M2} m² are free. Decide what each becomes.`;
}
// what the choices add up to, and what was not chosen
export function landGain(plots) {
  const L = land(plots); const out = [];
  if (L.families) out.push(`homes for ${L.families} families`);
  if (L.play) out.push(`${L.play} m² to play`);
  if (L.feeds) out.push(`vegetables for ${L.feeds} families`);
  if (L.parking) out.push(`${L.parking * PLOT_SPACES} visitor spaces`);
  return out;
}
export function landSummary(plots, j, effect = null) {
  const L = land(plots); const out = [];
  if (!L.chosen) return [j ? 'Tap a use under each plot.' : 'Choose a use for each plot.'];
  out.push(`${j ? 'You gain' : 'Gained'}: ${list(landGain(plots))}.`);
  out.push(`${j ? 'Parking spaces' : 'Parking'}: ${CARPARK_SPACES} before, ${L.spaces} now.`);
  if (L.done && L.notChosen.length) out.push(`${j ? 'You gave up the chance of' : 'Given up'}: ${list(L.notChosen.map((id) => USE[id].name.toLowerCase().replace('keep parking', 'visitor parking')))}.`);
  if (effect && L.families) out.push(j ? `${L.families} more families will call a car each morning. Longest wait: ${wait(effect.before, true)} now, ${wait(effect.after, true)} with them.` : `${L.families} more families add ${L.families} morning calls. Longest wait: ${wait(effect.before, false)} now, ${wait(effect.after, false)} with them.`);
  return out;
}

// the ride: one caption for each thing the car passes, in order along the street
export function rideStops(layout, plots, j) {
  const out = [{ at: -1, text: j ? 'Here we go. You are riding in a shared car along your street.' : 'A ride in a shared car along the street you designed.' }];
  const L = land(plots);
  for (let s = 0; s < SLOTS; s++) {
    const k = layout[s];
    if (k === 'drop') out.push({ at: s, kind: k, pause: true, text: j ? `Your drop-off point by ${beside(s, j).text}. The car stops here because you marked it.` : `Your drop-off point by ${beside(s, j).text}: the car stops only where it is marked.` });
    if (k === 'bay') out.push({ at: s, kind: k, text: j ? `Your waiting bay by ${beside(s, j).text}. Cars rest here until someone calls.` : `Your waiting bay by ${beside(s, j).text}, where cars wait for the next call.` });
    if (k === 'walk' || k === 'cycle') out.push({ at: s, kind: k, pause: true, text: j ? `Your crossing by ${beside(s, j).text}. The car stops and lets people cross.` : `Your ${pieceName(k, false).toLowerCase()} by ${beside(s, j).text}: the car gives way.` });
    if (s === 2) out.push({ at: 2.5, kind: 'land', text: `${j ? 'On the right, the old car park. Now it has' : 'On the right, the former car park:'} ${list(landGain(plots)) || 'parking'}${L.parking === 3 ? '' : ', and one plot for the shared cars'}.` });
  }
  out.push({ at: SLOTS, text: j ? 'That is your street. Well planned!' : 'That is the street, as you designed it.' });
  return out;
}

// ---- the take-home record
export function madeLines(layout, res, plots, j) {
  const c = counts(layout); const L = land(plots);
  return [
    `${plural(c.drop, 'drop-off point')}, ${plural(c.bay, 'waiting bay')}, ${plural(c.crossings, 'crossing')}`,
    `Longest wait for a shared car: ${wait(res.longestWait, j)}`,
    `Furthest walk to a drop-off point: ${res.furthestWalk} m`,
    `Safe crossings: ${res.safe} of ${res.lines} (before: ${BEFORE.safe} of ${BEFORE.lines})`,
    `Car park: ${CARPARK_SPACES} spaces before, ${L.spaces} now, ${res.fleet} shared cars`,
    `Freed land: ${list(landGain(plots)) || 'kept as parking'}`,
  ];
}
// "You practised …": built from what the child did
export function practised(layout, plots, did, j) {
  const c = counts(layout); const L = land(plots);
  const parts = [c.drop && plural(c.drop, 'drop-off point'), c.bay && plural(c.bay, 'waiting bay'), c.crossings && plural(c.crossings, 'crossing')].filter(Boolean);
  const out = [`designing a street for self-driving cars, with ${list(parts)}`];
  out.push(did.runs > 1 && did.changes > 0 ? `testing a design and improving it: you ran the morning ${did.runs} times` : 'testing a design with real numbers: waiting time, walking distance and safe crossings');
  const uses = ['homes', 'park', 'garden', 'parking'].filter((id) => L[id]).map((id) => ({ homes: 'homes', park: 'a park', garden: 'a market garden', parking: 'visitor parking' }[id]));
  out.push(`weighing what freed land is best used for: you chose ${list(uses)}`);
  if (did.rode) out.push(j ? 'checking your design from inside a shared car' : 'reviewing a design from the user’s point of view');
  return out;
}
export const madeTitle = (j) => (j ? 'My street for shared cars' : 'A street for shared self-driving cars');

// the picture: the street before and after, seen from above. Inline SVG, no script.
const USE_FILL = { homes: '#d98b5f', park: '#7cc46a', garden: '#b89a4a', parking: '#8a9099' };
function strip(y, layout, plots, before, title) {
  const W = 36, X = 30; const s = [`<text x="${X}" y="${y - 6}" font-size="13" font-weight="700" fill="#3b2a1e">${title}</text>`];
  s.push(`<rect x="${X}" y="${y}" width="${W * SLOTS}" height="112" fill="#cfe6b8"/>`);
  for (let i = 0; i < SLOTS; i++) if (i !== 6) s.push(`<rect x="${X + i * W + 6}" y="${y + 4}" width="24" height="18" fill="#e9c9a0" stroke="#9a6a4a"/><path d="M${X + i * W + 4} ${y + 6}L${X + i * W + 18} ${y - 1}L${X + i * W + 32} ${y + 6}Z" fill="#b5523b"/>`);
  s.push(`<rect x="${X + 6 * W + 12}" y="${y}" width="12" height="112" fill="#d98b7a"/>`);                     // the cycle track
  s.push(`<rect x="${X}" y="${y + 26}" width="${W * SLOTS}" height="10" fill="#e6dcc8"/><rect x="${X}" y="${y + 66}" width="${W * SLOTS}" height="10" fill="#e6dcc8"/>`);
  s.push(`<rect x="${X}" y="${y + 36}" width="${W * SLOTS}" height="30" fill="#6b7178"/><rect x="${X + JUNCTION * W + 6}" y="${y + 66}" width="24" height="46" fill="#6b7178"/>`);
  s.push(`<rect x="${X + 3}" y="${y + 80}" width="30" height="24" fill="#f0d27a" stroke="#9a6a4a"/><text x="${X + 18}" y="${y + 96}" font-size="9" text-anchor="middle" fill="#3b2a1e">Shop</text>`);
  s.push(`<rect x="${X + 7 * W + 2}" y="${y + 80}" width="${W * 3 - 6}" height="26" fill="#f2b8a0" stroke="#9a6a4a"/><text x="${X + 8.5 * W}" y="${y + 97}" font-size="9" text-anchor="middle" fill="#3b2a1e">School</text>`);
  CARPARK.forEach((slot, n) => {
    const x = X + slot * W + 1; const use = before ? 'parking' : n < plots.length ? plots[n] || 'parking' : 'parking';
    s.push(`<rect x="${x}" y="${y + 78}" width="${W - 2}" height="30" fill="${USE_FILL[use]}" stroke="#5a4a3a"/>`);
    if (before) for (let c = 0; c < 6; c++) s.push(`<rect x="${x + 3 + (c % 3) * 10}" y="${y + 81 + Math.floor(c / 3) * 13}" width="8" height="11" rx="2" fill="#${['c8553d', '3d6e8a', 'e8d9b0'][c % 3]}"/>`);
    else s.push(`<text x="${x + W / 2 - 1}" y="${y + 97}" font-size="8" text-anchor="middle" fill="#fff" font-weight="700">${n === 3 ? 'Shared' : USE[use].name.replace('Keep parking', 'Parking').replace('Market garden', 'Garden')}</text>`);
  });
  for (let i = 0; i < SLOTS; i++) {
    const x = X + i * W; const k = layout[i];
    if (before && i !== JUNCTION && k !== 'walk') s.push(`<rect x="${x + 8}" y="${y + 37}" width="20" height="8" rx="3" fill="#${['c8553d', '3d6e8a', 'e8d9b0', '5a6d50'][i % 4]}"/><rect x="${x + 8}" y="${y + 57}" width="20" height="8" rx="3" fill="#${['e6a15a', '6b5b8a', 'c8553d', '3d6e8a'][i % 4]}"/>`);
    if (k === 'walk' || k === 'cycle') for (let b = 0; b < 4; b++) s.push(`<rect x="${x + 5 + b * 7}" y="${y + 36}" width="4" height="30" fill="${k === 'cycle' ? '#f2a08c' : '#fff'}"/>`);
    if (k === 'drop') s.push(`<rect x="${x + 4}" y="${y + 37}" width="28" height="9" fill="none" stroke="#fff" stroke-width="2"/><circle cx="${x + 18}" cy="${y + 30}" r="7" fill="${PIECES.drop.color}"/><text x="${x + 18}" y="${y + 33.5}" font-size="9" text-anchor="middle" fill="#fff" font-weight="700">D</text>`);
    if (k === 'bay') s.push(`<rect x="${x + 4}" y="${y + 56}" width="28" height="9" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 2"/><circle cx="${x + 18}" cy="${y + 71}" r="7" fill="${PIECES.bay.color}"/><text x="${x + 18}" y="${y + 74.5}" font-size="9" text-anchor="middle" fill="#fff" font-weight="700">B</text>`);
  }
  return s.join('');
}
export function picture(layout, plots, res, j) {
  const c = crossings(layout, j).filter((x) => x.safe).length; const L = land(plots);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 330" width="420" height="330" font-family="Inter, Arial, sans-serif"><rect width="420" height="330" fill="#fff9ec"/>`
    + strip(26, BEFORE.layout, [], true, `Before: parked cars, ${CARPARK_SPACES} spaces, ${BEFORE.safe} safe crossing`)
    + strip(174, layout, L.plots, false, `After: ${res.fleet} shared cars, ${L.spaces} spaces, ${plural(c, 'safe crossing')}`)
    + `<text x="30" y="304" font-size="10" fill="#3b2a1e">D drop-off point   B waiting bay   stripes: crossing</text>`
    + `<text x="30" y="320" font-size="10" fill="#3b2a1e">Gained: ${list(landGain(plots)) || 'parking kept'}</text></svg>`;
}
