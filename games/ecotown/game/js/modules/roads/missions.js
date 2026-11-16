// The six missions of "Self-driving cars" (docs/curriculum.md, section 4), what is kept between visits, and the
// take-home record for the hour. Pure: no page. Tests: tests/roads-missions.test.mjs.
import { m1Line } from './sensors.js';
import { m2Line } from './labels.js';
import { m3Line } from './rules.js';
import { m4Line } from './simtest.js';
import { m5Line } from './fleet.js';
import { cleanSaved, land, counts, simulate, cleanLayout, cleanPlots } from './street.js';
import { madeLines, wait, picture as streetPicture } from './words.js';

export const MISSIONS = [
  { n: 1, id: 'see', icon: '📷', use: 'How a self-driving car sees',
    job: { j: 'Self-driving cars see with cameras, radar and lidar. Engineers must know what each one misses, or the car could miss a person.', s: 'Autonomous cars sense the street with cameras, radar and lidar. Engineers must know each sensor’s blind spots, because the car is only as safe as what it senses.' },
    how: { j: 'Switch between the three views of the same street, in sun, rain, fog and dark. Tick every sensor that can answer.', s: 'Compare the three sensor views in four conditions, tick every sensor that can answer, then choose the car’s sensor set.' },
    now: { j: 'Say what a camera, radar and lidar can each see, and why cars use more than one.', s: 'Explain each sensor’s strengths and limits, and why cars fuse several.' } },
  { n: 2, id: 'label', icon: '🏷', use: 'Teaching the car to recognise things',
    job: { j: 'People label thousands of street pictures so the car learns what a person, a cyclist or a dog looks like.', s: 'Data labellers mark up street images so the car’s recognition model can learn; the hard cases matter most.' },
    how: { j: 'Tap each thing in a picture to box it, then choose its label. Then test the car.', s: 'Box and label each object, train, test on unseen pictures, then find and label the edge cases.' },
    now: { j: 'Label pictures for a machine to learn from, and look for the hard ones it will get wrong.', s: 'Label training data and hunt for the edge cases a model fails on.' } },
  { n: 3, id: 'rules', icon: '🚦', use: 'Rules of the road',
    job: { j: 'Engineers turn the Highway Code into rules the car follows: how fast, how much room, who goes first.', s: 'Engineers translate the Highway Code into behaviour: speeds, gaps and priorities the car follows every time.' },
    how: { j: 'Choose what the car does in six places, then test it.', s: 'Set the behaviour for six situations and test each one.' },
    now: { j: 'Choose safe speeds and gaps, and say who goes first.', s: 'Turn road rules into clear, testable behaviour.' } },
  { n: 4, id: 'test', icon: '🧪', use: 'Testing in simulation',
    job: { j: 'Test engineers drive the car millions of times in a computer before it goes on a real road.', s: 'Test engineers run the car through millions of simulated miles to find failures safely.' },
    how: { j: 'Run the tests, watch the replay of a failure, change one setting, run again.', s: 'Run the scenarios, review failures, change one setting per run.' },
    now: { j: 'Test something, find where it fails, and change one thing at a time.', s: 'Test a system in simulation and isolate causes by changing one variable at a time.' } },
  { n: 5, id: 'fleet', icon: '🚕', use: 'A shared fleet',
    job: { j: 'Transport planners decide how many shared cars a town needs, and where they wait and charge.', s: 'Fleet planners size a shared fleet and choose where it waits and charges, trading waiting time against idle cars.' },
    how: { j: 'Choose the number of cars, where they wait and where they charge. Run the morning and read the numbers.', s: 'Set fleet size, waiting places and charging hub; run the morning; read waits and empty driving.' },
    now: { j: 'Plan a fleet of shared cars and read waiting times.', s: 'Size a fleet and read the trade-off between waiting time and the number of cars.' } },
  { n: 6, id: 'street', icon: '🚏', use: 'Redesigning the street',
    job: { j: 'This is Maple Street. Parked cars fill it all day. Soon shared self-driving cars will run here, and they stop only where the street is marked. Street designers plan those markings, so the street works for everyone.', s: 'Maple Street today: parked cars and a 40-space car park. Shared self-driving cars will stop only where the street is marked. Street designers lay out stops, bays and crossings for passengers, walkers and cyclists.' },
    how: { j: 'Tap the 3D street to put in drop-off points, waiting bays and crossings. Run the morning, then choose what the old car park becomes.', s: 'Place stops, bays and crossings on the 3D street, run the morning, read the numbers, and decide what the car park becomes.' },
    now: { j: 'Design a street for everyone who uses it, and test it with real numbers.', s: 'Design a street for every user and test it against measured outcomes.' } },
];

// what is kept: { v: 3, done: [6 booleans], rec: { 1..5: small results }, m6: the street mission's own state }
// An old save (v 1 or 2: the street loop on its own) becomes mission 6's state.
export function cleanHub(v, junior = false) {
  const out = { v: 3, done: [false, false, false, false, false, false], rec: {}, m6: null };
  if (!v || typeof v !== 'object') return out;
  if (v.v === 1 || v.v === 2) { out.m6 = cleanSaved(v, junior) ? v : null; return out; }
  if (v.v !== 3) return out;
  if (Array.isArray(v.done)) for (let i = 0; i < 6; i++) out.done[i] = v.done[i] === true;
  const rec = v.rec && typeof v.rec === 'object' ? v.rec : {};
  for (const n of [1, 2, 3, 4, 5, 6]) if (rec[n] && typeof rec[n] === 'object') out.rec[n] = rec[n];
  out.m6 = v.m6 && typeof v.m6 === 'object' && cleanSaved(v.m6, junior) ? v.m6 : null;
  return out;
}
// which missions can be opened: every finished one (to replay) and the first unfinished one
export const openable = (done) => MISSIONS.map((m, i) => done[i] || done.slice(0, i).every(Boolean));
export const nextUp = (done) => { const i = done.findIndex((d) => !d); return i < 0 ? null : i + 1; };
export const allDone = (done) => done.every(Boolean);

// the street mission's record numbers, worked out again from what was kept
export function streetResult(m6, families, junior) {
  const sv = cleanSaved(m6, junior); if (!sv) return null;
  const layout = cleanLayout(sv.layout, junior), plots = cleanPlots(sv.plots); const L = land(plots);
  const res = simulate(layout, { families, extraFamilies: L.done ? L.families : 0, seed: 7, junior, fleet: sv.fleet });
  return { layout, plots, res, runs: sv.runs, changes: sv.changes };
}

// the take-home record for the whole hour: one line per mission, a picture, and two to four practised lines
export function hourLines(rec, j, street) {
  const out = [m1Line(rec[1], j), m2Line(rec[2], j), m3Line(rec[3], j), m4Line(rec[4], j), m5Line(rec[5], j)];
  if (street) { const c = counts(street.layout); out.push(j ? `Redesigned the street: ${c.drop} drop-off ${c.drop === 1 ? 'point' : 'points'}, ${c.crossings} ${c.crossings === 1 ? 'crossing' : 'crossings'}, longest wait ${wait(street.res.longestWait, true)}` : `${madeLines(street.layout, street.res, street.plots, j)[0]}; crossings marked where people cross${street.res.safe === street.res.lines ? '' : ` (${street.res.safe} of ${street.res.lines} places)`}`); }
  return out.map((l) => l.slice(0, 120));
}
export function hourPractised(rec, j, street) {
  const out = [
    j ? 'telling what a camera, radar and lidar can each see, and labelling pictures for a machine to learn from' : 'comparing sensors and labelling training data, including the edge cases',
    j ? `turning the Highway Code into rules, and testing a car in ${rec[4]?.runs ?? 'several'} computer runs, one change at a time` : `turning road rules into behaviour and testing it over ${rec[4]?.runs ?? 'several'} simulation runs, one change at a time`,
    j ? `planning a fleet of ${rec[5]?.cars ?? 'shared'} cars and reading the waiting times` : 'sizing a shared fleet and reading the trade-off between waiting time and the number of cars',
  ];
  if (street) out.push(j ? 'designing a street for everyone who uses it, and testing it with numbers' : `designing a street for every user and testing it against measured outcomes${street.runs > 1 ? ` over ${street.runs} runs` : ''}`);
  return out;
}
export const hourTitle = (j) => (j ? 'My hour with self-driving cars' : 'Self-driving cars: six missions');
// the picture: the street the child designed (it is what is left in the town too)
export function hourPicture(street, j) { return street ? streetPicture(street.layout, street.plots, street.res, j) : null; }
