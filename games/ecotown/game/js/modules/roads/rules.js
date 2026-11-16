// Mission 3, "Rules of the road": set what the car does in six places, test each, and turn the settings into the
// car's own rules. Pure: no page. The rules are the UK Highway Code's (2022 edition):
// - Rule 195: look out for people waiting at a zebra crossing and be ready to slow down or stop; you MUST give way
//   when someone has moved onto it.
// - Many streets by schools are 20 mph. Rule 126 (typical stopping distances): a person driving needs about 12 m at
//   20 mph, 23 m at 30 mph and 36 m at 40 mph (thinking distance plus braking distance: 6, 14 and 24 m of braking).
//   A self-driving car reacts faster than a person; here it reacts in 0.2 s, so its stopping distance is the braking
//   distance plus about 2, 3 or 4 m. (Real reaction times vary; 0.2 s is this game's simplification.)
// - Rule 163: leave at least 1.5 metres when overtaking a cyclist at up to 30 mph, and wait behind if you cannot.
// - Rule 126: leave at least a two-second gap behind the vehicle in front, and at least double that on wet roads.
// - Rule H2: at a junction, give way to people crossing or waiting to cross the road you are turning into.
// - Rule 219: let an emergency vehicle pass; pull to the side where it is safe (not stopping dead in its way).
// - Rule 230 (ages 13–17 only): on ice, stopping distances can be ten times greater than on dry roads, so the
//   two-second gap becomes up to twenty seconds.
// UK traffic drives on the left: the pictures show the car on the left of the road (the north lane, driving east).

export const BRAKE_M = { 20: 6, 30: 14, 40: 24 };
export const HUMAN_M = { 20: 12, 30: 23, 40: 36 };          // Highway Code typical stopping distances, a person driving
export const reactM = (mph) => Math.round(mph * 0.447 * 0.2);   // 0.2 s at this speed, in metres: 2, 3, 4
export const stopM = (mph) => BRAKE_M[mph] + reactM(mph);      // the self-driving car's stopping distance

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
    happen: { 20: { j: 'A child stepped out. At 20 mph the car stopped in time. A person driving needs more room: they react more slowly.', s: `Child steps out 12 m ahead. The car’s stopping distance at 20 mph: ${stopM(20)} m. Stopped in time. A person driving needs about ${HUMAN_M[20]} m (Highway Code), exactly the room there was.` },
      30: { j: 'A child stepped out. At 30 mph the car could not stop in time. A near miss.', s: `The car’s stopping distance at 30 mph: ${stopM(30)} m, more than the 12 m there was. Could not stop in time. (A person driving: about ${HUMAN_M[30]} m.)` },
      40: { j: 'A child stepped out. At 40 mph the car could not stop in time. A near miss.', s: `The car’s stopping distance at 40 mph: ${stopM(40)} m, more than twice the room. Could not stop in time. (A person driving: about ${HUMAN_M[40]} m.)` } },
    hint: [{ j: 'The faster a car goes, the further it needs to stop.', s: 'Compare each speed’s stopping distance with the 12 m available.' }, { j: 'Many school streets in the UK have a 20 mph limit.', s: `Braking distance (Highway Code): 20 mph 6 m, 30 mph 14 m, 40 mph 24 m. The car adds about ${reactM(20)}–${reactM(40)} m while it reacts.` }],
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
  { id: 'ambulance', icon: '🚑', title: { j: 'An ambulance behind', s: 'Emergency vehicle' },
    ask: { j: 'An ambulance with blue lights comes up behind the car. What does the car do?', s: 'An ambulance on a blue-light call is closing from behind. Set the car’s behaviour.' },
    opts: [{ v: 'stop', j: 'Stop at once, right where it is', s: 'Brake to a stop in the lane' }, { v: 'keep', j: 'Keep going at the same speed', s: 'Continue at the same speed' }, { v: 'pull', j: 'Pull in to the side where it is safe, and let it pass', s: 'Pull to the side where safe and let it pass' }],
    safe: (v) => v === 'pull',
    happen: { stop: { j: 'The car stopped in the middle of the lane. Now the ambulance is stuck behind it.', s: 'Stopped dead in the lane: the ambulance was blocked behind it. Being cautious is not always safe.' }, keep: { j: 'The car kept going. The ambulance was stuck behind it all the way.', s: 'The ambulance was held up behind the car.' }, pull: { j: 'The car pulled in to the side. The ambulance went past quickly.', s: 'The car pulled in where it was safe; the ambulance passed.' } },
    hint: [{ j: 'What does the ambulance need: for us to stop, or for the road to be clear?', s: 'The aim is not to stop; it is to clear the way.' }, { j: 'The Highway Code says: help it pass. Pull to the side where it is safe.', s: 'Highway Code rule 219: take action to let it pass; pull to the side where safe.' }],
    rule: { j: 'Ambulance behind: pull in to the side where it is safe and let it pass.', s: 'IF an emergency vehicle approaches THEN pull aside where safe and let it pass.' } },
  { id: 'ice', icon: '🧊', only: 's', title: { j: 'Ice', s: 'Icy road' },
    ask: { j: 'The road is icy. How far back does the car stay?', s: 'Icy road. Dry roads need a 2-second gap. On ice, stopping can take up to ten times as far. Set the gap.' },
    opts: [{ v: 4, j: '4 seconds', s: '4 s (the wet-road gap)' }, { v: 10, j: '10 seconds', s: '10 s' }, { v: 20, j: '20 seconds', s: '20 s' }],
    safe: (v) => v >= 20,
    happen: { 4: { j: 'Far too close on ice.', s: '4 s: fine in rain, but on ice the car slid into the gap. Unsafe.' }, 10: { j: 'Still too close.', s: '10 s: five times the dry gap. The car only just stopped short.' }, 20: { j: 'Enough room.', s: '20 s: ten times the dry gap. Stopped with room to spare.' } },
    hint: [{ j: 'Ice is far worse than rain.', s: 'Up to ten times as far, times the 2-second gap.' }, { j: 'Ten times two seconds.', s: 'Highway Code rule 230: stopping distances can be ten times greater on ice: 10 × 2 s.' }],
    rule: { j: 'On ice: stay twenty seconds behind.', s: 'IF the road is icy THEN gap up to 20 s.' } },
];
// the scenes for one age route (some are for ages 13–17 only)
export const scenesFor = (j) => SCENES.filter((sc) => !(j && sc.only === 's'));
export const optOf = (scene, v) => scene.opts.find((o) => String(o.v) === String(v));
// the line after a test. misses: wrong tests so far in this scene (the answer is never given on the first or second miss)
export function resultSay(scene, v, misses, j) {
  const p = (o) => (j ? o.j : o.s); const h = scene.happen[String(v)];
  if (scene.safe(v)) return p(h);
  if (misses >= 3) { const ok = scene.opts.find((o) => scene.safe(o.v)); return `${p(h)} ${j ? 'The safe choice is' : 'Safe setting:'} ${p(ok)}. ${p(scene.rule)}`; }
  return `${p(h)} ${p(scene.hint[misses - 1])}`;
}
export const M3 = { done: { j: 'These are your car’s rules. The car will follow every one, every time.', s: 'Your settings, as the rules the car now follows.' } };
export function m3Line(rec, j) { return j ? `Set ${rec?.rules ?? 0} road rules for the car, from the Highway Code, and tested each one` : `${rec?.rules ?? 0} driving rules set from the Highway Code and tested in simulation`; }
