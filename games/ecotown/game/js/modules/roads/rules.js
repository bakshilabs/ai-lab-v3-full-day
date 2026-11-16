// Mission 3, "Rules of the road": set what the car does in six places, test each, and turn the settings into the
// car's own rules. Pure: no page. The rules are the UK Highway Code's (2022 edition):
// - Rule 195: look out for people waiting at a zebra crossing and be ready to slow down or stop; you MUST give way
//   when someone has moved onto it.
// - Many streets by schools are 20 mph. Rule 126 (typical stopping distances): braking distance is about 6 m at
//   20 mph, 14 m at 30 mph and 24 m at 40 mph. A self-driving car reacts quickly, so here it needs the braking
//   distance plus 2 m.
// - Rule 163: leave at least 1.5 metres when overtaking a cyclist at up to 30 mph, and wait behind if you cannot.
// - Rule 126: leave at least a two-second gap behind the vehicle in front, and at least double that on wet roads.
// - Rule H2: at a junction, give way to people crossing or waiting to cross the road you are turning into.

export const BRAKE_M = { 20: 6, 30: 14, 40: 24 };
export const REACT_M = 2;
export const stopM = (mph) => BRAKE_M[mph] + REACT_M;

// each scene: the question, the choices (one control each), which choices are safe, and what happens with each
export const SCENES = [
  { id: 'zebra', icon: '🦓', title: { j: 'The zebra crossing', s: 'Zebra crossing' },
    ask: { j: 'Someone is waiting to cross at the zebra crossing. What does the car do?', s: 'A pedestrian is waiting at a zebra crossing. Set the car’s behaviour.' },
    opts: [{ v: 'go', j: 'Drive on: they can wait', s: 'Continue: they can wait' }, { v: 'stop', j: 'Slow down and stop for them', s: 'Slow down and stop to let them cross' }],
    safe: (v) => v === 'stop',
    happen: { go: { j: 'The car drove on. The person had to jump back onto the kerb.', s: 'The car continued; the pedestrian had to step back.' }, stop: { j: 'The car slowed, stopped, and the person crossed safely.', s: 'The car stopped short of the crossing; the pedestrian crossed.' } },
    hint: [{ j: 'Who should go first at a zebra crossing?', s: 'Who has priority at a zebra crossing?' }, { j: 'The Highway Code says drivers must be ready to stop for people waiting.', s: 'Highway Code rule 195: be ready to slow down or stop for people waiting.' }],
    rule: { j: 'At a zebra crossing: if someone is waiting, slow down and stop.', s: 'IF a pedestrian waits at a zebra crossing THEN slow down and stop.' } },
  { id: 'school', icon: '🏫', title: { j: 'Past the school', s: 'School street' },
    ask: { j: 'It is home time at the school. How fast does the car go? A child might step out between parked cars.', s: 'School home time. Choose the car’s speed. A child may step out 12 m ahead.' },
    opts: [{ v: 20, j: 'Slow: 20 mph', s: '20 mph' }, { v: 30, j: 'Medium: 30 mph', s: '30 mph' }, { v: 40, j: 'Fast: 40 mph', s: '40 mph' }],
    safe: (v) => stopM(v) <= 12,
    happen: { 20: { j: 'A child stepped out. At 20 mph the car stopped in time, with room to spare.', s: `Child steps out 12 m ahead. Stopping distance at 20 mph: ${stopM(20)} m. Stopped in time.` },
      30: { j: 'A child stepped out. At 30 mph the car could not stop in time. A near miss.', s: `Stopping distance at 30 mph: ${stopM(30)} m, more than 12 m. Could not stop in time.` },
      40: { j: 'A child stepped out. At 40 mph the car could not stop in time. A near miss.', s: `Stopping distance at 40 mph: ${stopM(40)} m, twice the space there was. Could not stop in time.` } },
    hint: [{ j: 'The faster a car goes, the further it needs to stop.', s: 'Compare each speed’s stopping distance with the 12 m available.' }, { j: 'Many school streets in the UK have a 20 mph limit.', s: 'Braking distance: 20 mph 6 m, 30 mph 14 m, 40 mph 24 m, plus 2 m to react.' }],
    rule: { j: 'Near the school: 20 mph.', s: 'IF in a school street THEN at most 20 mph.' } },
  { id: 'cyclist', icon: '🚲', title: { j: 'Passing a cyclist', s: 'Overtaking a cyclist' },
    ask: { j: 'A cyclist is ahead. How much space does the car leave when it goes past?', s: 'Set the side gap when overtaking a cyclist at 30 mph.' },
    opts: [{ v: 0.5, j: 'Half a metre', s: '0.5 m' }, { v: 1, j: 'One metre', s: '1.0 m' }, { v: 1.5, j: 'One and a half metres', s: '1.5 m' }, { v: 2, j: 'Two metres', s: '2.0 m' }],
    safe: (v) => v >= 1.5,
    happen: { 0.5: { j: 'Too close! The cyclist wobbled and nearly fell.', s: '0.5 m: the cyclist was pushed towards the kerb. Too close.' }, 1: { j: 'Still too close. The cyclist had to swerve.', s: '1.0 m: the cyclist swerved. Still too close.' },
      1.5: { j: 'The car passed with plenty of room. The cyclist rode on calmly.', s: '1.5 m: a safe pass.' }, 2: { j: 'Lots of room. A very safe pass.', s: '2.0 m: a safe pass with room to spare.' } },
    hint: [{ j: 'A cyclist can wobble, or swerve round a pothole.', s: 'Allow for a wobble or a pothole.' }, { j: 'The Highway Code asks for more than one metre.', s: 'Highway Code rule 163 gives a minimum in metres, above 1 m.' }],
    rule: { j: 'Passing a cyclist: leave at least 1.5 metres.', s: 'IF overtaking a cyclist THEN side gap ≥ 1.5 m.' } },
  { id: 'narrow', icon: '↔', title: { j: 'No room to pass', s: 'Oncoming traffic' },
    ask: { j: 'Now a car is coming the other way. There is not room to leave 1.5 metres. What does our car do?', s: 'An oncoming car leaves less than 1.5 m to pass the cyclist. Set the behaviour.' },
    opts: [{ v: 'squeeze', j: 'Squeeze past', s: 'Pass with a smaller gap' }, { v: 'wait', j: 'Wait behind the cyclist', s: 'Hold back until it is clear' }],
    safe: (v) => v === 'wait',
    happen: { squeeze: { j: 'The car squeezed past, far too close to the cyclist.', s: 'Squeezed past at under 1 m. Unsafe.' }, wait: { j: 'The car waited a few seconds, then passed with lots of room.', s: 'Held back about 6 s, then passed at 1.5 m.' } },
    hint: [{ j: 'Is a few seconds’ wait worth it?', s: 'What does the 1.5 m rule mean when there is no room?' }, { j: 'If there is not room, the rule says wait.', s: 'Rule 163: wait behind if it is not safe to pass.' }],
    rule: { j: 'No room to pass a cyclist safely? Wait behind.', s: 'IF gap < 1.5 m THEN wait behind.' } },
  { id: 'rain', icon: '🌧', title: { j: 'Rain', s: 'Wet road' },
    ask: { j: 'It is raining. How far back does the car stay behind the car in front?', s: 'Wet road. Set the gap behind the car in front, in seconds.' },
    opts: [{ v: 1, j: 'Very close (1 second)', s: '1 s' }, { v: 2, j: 'Close (2 seconds)', s: '2 s' }, { v: 4, j: 'Far back (4 seconds)', s: '4 s' }],
    safe: (v) => v >= 4,
    happen: { 1: { j: 'The car in front braked. On the wet road our car slid much too close.', s: '1 s: braking on a wet road, the gap closed completely. Unsafe.' }, 2: { j: 'The car in front braked. Our car only just stopped. Fine when dry, too close in rain.', s: '2 s: enough when dry, but wet stopping takes about twice as far. Only just stopped.' }, 4: { j: 'The car in front braked. Our car had plenty of room to stop.', s: '4 s: stopped with room to spare.' } },
    hint: [{ j: 'Do cars stop as quickly on a wet road?', s: 'How does rain change stopping distance?' }, { j: 'On a wet road, stopping takes about twice as far.', s: 'Rule 126: two seconds dry; at least double on wet roads.' }],
    rule: { j: 'In the rain: stay 4 seconds behind.', s: 'IF the road is wet THEN gap ≥ 4 s.' } },
  { id: 'turn', icon: '↪', title: { j: 'Turning a corner', s: 'Turning at a junction' },
    ask: { j: 'The car turns into a side road. Someone is crossing that side road. Who goes first?', s: 'Turning left into a side road while a pedestrian is crossing it. Who has priority?' },
    opts: [{ v: 'car', j: 'The car turns first', s: 'The car' }, { v: 'person', j: 'The person crossing', s: 'The pedestrian' }],
    safe: (v) => v === 'person',
    happen: { car: { j: 'The car turned in front of the person. They had to stop in the road.', s: 'The car cut across the pedestrian’s path.' }, person: { j: 'The car waited at the corner. The person crossed, then the car turned.', s: 'The car gave way, then turned.' } },
    hint: [{ j: 'The person is already crossing.', s: 'Think about who can do the most harm.' }, { j: 'Since 2022, the Highway Code says to give way to people crossing a road you turn into.', s: 'Highway Code rule H2 (2022).' }],
    rule: { j: 'Turning into a side road: give way to people crossing.', s: 'IF turning and a pedestrian is crossing THEN give way.' } },
];
export const optOf = (scene, v) => scene.opts.find((o) => String(o.v) === String(v));
// the line after a test. misses: wrong tests so far in this scene (the answer is never given on the first or second miss)
export function resultSay(scene, v, misses, j) {
  const p = (o) => (j ? o.j : o.s); const h = scene.happen[String(v)];
  if (scene.safe(v)) return p(h);
  if (misses >= 3) { const ok = scene.opts.find((o) => scene.safe(o.v)); return `${p(h)} ${j ? 'The safe choice is' : 'Safe setting:'} ${p(ok)}. ${p(scene.rule)}`; }
  return `${p(h)} ${p(scene.hint[misses - 1])}`;
}
export const M3 = { done: { j: 'These are your car’s rules. The car will follow every one, every time.', s: 'Your settings, as the rules the car now follows.' } };
export function m3Line(rec, j) { return j ? `Set ${rec?.rules ?? 0} road rules for the car, safe first time in ${rec?.first ?? 0}` : `${rec?.rules ?? 0} driving rules set from the Highway Code (${rec?.first ?? 0} safe on the first test)`; }
