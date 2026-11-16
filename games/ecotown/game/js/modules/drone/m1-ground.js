// Mission 1, ground school: the pre-flight check and the airspace map. Pure: no page (tests/drone-hour.test.mjs).
// The rules are the real ones, kept general: the UK Drone and Model Aircraft Code says to check the drone and the
// weather before flying, keep the drone in sight, stay below 120 metres, never fly over crowds, keep away from people,
// and stay clear of airports and other aircraft. Disturbing wild birds on their nests is against the law in the UK.

// ---------------------------------------------------------------- part 1: three drones to check
// Each check has a state per day: ok, or a problem (fix: what puts it right, or null when it cannot be put right today).
export const CHECKS = ['battery', 'props', 'weather', 'area'];
export const CHECK_NAMES = { battery: 'Battery', props: 'Propellers', weather: 'Weather', area: 'Where you will fly' };
export const DRONE_LIMIT_KMH = 38; // the most wind this (made-up) drone is built to fly in, as a maker would say
export const DAYS = [
  { id: 'mon', name: 'Monday', job: 'Photos of the school roof for the builders', state: { battery: 'ok', props: 'ok', weather: 'ok', area: 'ok' } },
  { id: 'tue', name: 'Tuesday', job: 'A video of the new orchard', state: { battery: 'low', props: 'chipped', weather: 'ok', area: 'ok' } },
  { id: 'wed', name: 'Wednesday', job: 'Photos of the beach after a storm', state: { battery: 'ok', props: 'ok', weather: 'gale', area: 'ok' } },
];
// What the child sees when they look closely: the facts, never the verdict. Ages 13-17 get the numbers.
export function look(check, state, junior = true) {
  switch (`${check}:${state}`) {
    case 'battery:ok': return junior ? 'All four lights on the battery are lit. It is fully charged.' : 'Battery 100%: about 25 minutes of flying.';
    case 'battery:low': return junior ? 'Only one of the four lights on the battery is lit.' : 'Battery 30%: about 7 minutes of flying, and the drone keeps some back to land safely.';
    case 'props:ok': return 'All four propellers are smooth, with no cracks or chips, and they are screwed on tight.';
    case 'props:chipped': return junior ? 'One propeller has a small chip out of its tip.' : 'One propeller has a chip out of its tip. A damaged propeller can shake the drone or break in flight.';
    case 'weather:ok': return junior ? 'Sunny, with a gentle breeze. The windsock hangs down.' : `Sunny. Wind 10 km/h, gusts 14 km/h. This drone is built for wind up to ${DRONE_LIMIT_KMH} km/h.`;
    case 'weather:gale': return junior ? 'Rain showers, and the windsock is sticking straight out. The trees are bending. This drone is not built for strong wind or rain.' : `Showers. Wind 35 km/h, gusts 52 km/h. This drone is built for wind up to ${DRONE_LIMIT_KMH} km/h and is not waterproof.`;
    case 'area:ok': return 'An empty field, away from roads and people, with nothing above it. You can see the whole flight from where you stand.';
    default: return '';
  }
}
export const isProblem = (state) => state !== 'ok';
// What puts a problem right before flying. null: it cannot be put right today (the weather), so the drone stays down.
export const FIX = { 'battery:low': 'Swap in a fully charged battery', 'props:chipped': 'Fit a new propeller', 'weather:gale': null };
export const fixFor = (check, state) => FIX[`${check}:${state}`] ?? null;
// The right call for a day once fixable problems are fixed: 'fly' or 'stay'.
export const dayAnswer = (day) => (CHECKS.some((c) => isProblem(day.state[c]) && !fixFor(c, day.state[c])) ? 'stay' : 'fly');

// A check marked wrongly. tries: how many times this check has been marked wrongly before (0 the first time).
// The first reply points where to look; the second says what it is.
export function checkReply(check, state, said, tries, junior = true) {
  const problem = isProblem(state); const right = (said === 'problem') === problem;
  if (right) {
    if (!problem) return { right, text: 'Good. Nothing wrong there.' };
    const fix = fixFor(check, state);
    return { right, text: fix ? `Yes, that is a problem. It can be put right: ${fix.charAt(0).toLowerCase() + fix.slice(1)}.` : 'Yes, that is a problem, and it cannot be put right today.' };
  }
  if (tries === 0) {
    const where = { battery: 'Look at how many lights are lit.', props: 'Look closely at the tips of the blades.', weather: junior ? 'Look at the windsock and the sky.' : 'Compare the gusts with what the drone is built for.', area: 'Look for people, roads and anything above the field.' }[check];
    return { right, text: problem ? `Look again. ${where}` : `Look again. Is anything really wrong here? ${where}` };
  }
  const tell = { 'battery:low': 'The battery is low. A drone needs a full battery, with plenty kept back for landing.', 'props:chipped': 'The chipped propeller is a problem. Even a small chip can make a propeller break.', 'weather:gale': 'The wind is stronger than this drone is built for, and it is raining.' }[`${check}:${state}`];
  return { right, told: true, text: problem ? `This one is a problem. ${tell}` : `This one is fine. ${look(check, state, junior)}` };
}
export function dayReply(day, said, tries) {
  const answer = dayAnswer(day); const right = said === answer;
  if (right) return { right, text: answer === 'fly' ? 'Everything is ready. The drone is safe to fly today.' : 'Right. The drone stays on the ground today. Saying no is part of a pilot\'s job.' };
  if (answer === 'stay') return { right, text: tries ? 'The drone must stay down today. The weather cannot be fixed, and flying in it could lose the drone or hurt someone.' : 'Look at the checks again. Can every problem be put right before the flight?' };
  return { right, text: tries ? 'Every problem has been put right, so the drone can fly today.' : 'Look at the checks again. Is anything still wrong now that the problems are fixed?' };
}

// ---------------------------------------------------------------- part 2: the airspace map and six flight plans
// The map is a made-up stretch of coast (drawn in m1-ui.js). Places have an id the drawing and the plans share.
export const PLACES = {
  you: { label: 'You (the pilot)' }, school: { label: 'The school' }, hospital: { label: 'The hospital and its helipad' },
  cliffs: { label: 'Cliffs where seabirds nest' }, wood: { label: 'The old wood' }, hill: { label: 'The hill' }, town: { label: 'The houses' }, beach: { label: 'The beach' },
};
// answer: 'fly', 'no' or 'change'. fixes (for 'change'): the right fix first in the data; the page shuffles nothing.
// rule: the line from the Drone Code (or the law) that decides it, said after the child's choice.
export const PLANS = [
  { id: 'wood', ask: 'Take photos of the old wood for the nature club, from the field beside it.', height: 60, answer: 'fly',
    rule: 'This one is fine: you can see the drone the whole time, it stays low and it keeps away from people.' },
  { id: 'sports', ask: 'Film sports day by flying right above the crowd at the school.', height: 40, answer: 'no',
    rule: 'The Drone Code says never fly over crowds. If the drone fell, it could hurt someone.' },
  { id: 'cliffs', ask: 'Film the seabirds on their nests on the cliffs in May.', height: 30, answer: 'no',
    rule: 'Disturbing wild birds on their nests is against the law. Wildlife needs space, so this flight should not happen.' },
  { id: 'high', ask: { j: 'Fly the drone up as high as it will go, to get the whole town in one photo.', s: 'Fly up to 200 m to get the whole town in one photo.' }, height: 200, answer: 'change',
    fixes: [{ id: 'lower', label: 'Fly no higher than the limit and take a few photos instead' }, { id: 'quick', label: 'Go up high, but only for a minute' }],
    rule: 'The Drone Code says stay below 120 metres. Higher up is where planes and helicopters fly.' },
  { id: 'sight', ask: 'Check a roof on the far side of the hill, where you would not be able to see the drone.', height: 50, answer: 'change',
    fixes: [{ id: 'walk', label: 'Walk up the hill first, so you can see the drone the whole time' }, { id: 'screen', label: 'Watch the drone\'s camera on the screen instead' }],
    rule: 'The Drone Code says always keep the drone where you can see it with your own eyes. The camera screen does not count.' },
  { id: 'hospital', ask: 'Fly straight over the hospital helipad to reach the beach.', height: 50, answer: 'change',
    fixes: [{ id: 'round', label: 'Fly round the hospital, well clear of the helipad' }, { id: 'fast', label: 'Fly over it quickly while no helicopter is there' }],
    rule: 'Air ambulances land at the helipad with little warning. Drones must stay well clear of other aircraft, so go round.' },
];
export const HEIGHT_LIMIT = 120;
export function planReply(plan, said, tries) {
  const right = said === plan.answer;
  if (right) return { right, text: plan.answer === 'change' ? 'Yes, it can fly once the plan is changed. Which change?' : plan.rule };
  if (!tries) {
    const where = { wood: 'Look at where the drone goes on the map. Is anyone or anything in the way?', sports: 'Look at who is under the drone on the map.', cliffs: 'Look at what lives on the cliffs, and the time of year.', high: 'Look at the side view: how high is the plan?', sight: 'Think about where you stand and where the drone goes.', hospital: 'Look at what is under the flight path on the map.' }[plan.id];
    return { right, text: `Look again. ${where}` };
  }
  const answer = plan.answer === 'fly' ? 'it can fly as planned' : plan.answer === 'no' ? 'this flight should not happen' : 'it can fly if the plan is changed';
  return { right, told: true, text: `Here, ${answer}. ${plan.rule}` };
}
export function fixReply(plan, fixId, tries) {
  const right = plan.fixes?.[0]?.id === fixId;
  if (right) return { right, text: plan.rule };
  return { right, told: tries > 0, text: tries ? `The safe change is: ${plan.fixes[0].label.charAt(0).toLowerCase() + plan.fixes[0].label.slice(1)}. ${plan.rule}` : 'That still breaks the rule. Try the other change.' };
}
