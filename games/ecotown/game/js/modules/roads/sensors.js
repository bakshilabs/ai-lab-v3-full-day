// Mission 1, "How a self-driving car sees": the three sensors, what each picks up in sun, rain, fog and dark, the
// rounds the child plays and every word of the mission. Pure: no page. Tests: tests/roads-missions.test.mjs.
//
// The facts, kept general (they hold for the sensors most self-driving cars carry):
// - A camera sees colour and detail: it can read signs and tell a red light from a green one. Like our eyes, it
//   struggles in thick fog, and in the dark it only sees what is lit.
// - Radar sends out radio waves. It works in rain, fog and the dark, and measures how far away something is and how
//   fast it is moving. Its picture is blurry: it cannot read a sign or see a colour.
// - Lidar sends out pulses of laser light and builds a 3D picture of points. It sees shapes and distances well, in the
//   dark too, but thick fog scatters the light. It cannot see colours, so it cannot read a traffic light.

export const SENSORS = ['camera', 'radar', 'lidar'];
export const SENSOR = {
  camera: { icon: '📷', name: 'Camera', does: { j: 'Sees colours and details, like your eyes.', s: 'Colour and detail: reads signs and lights. Needs light and clear air.' } },
  radar: { icon: '📡', name: 'Radar', does: { j: 'Radio waves. Finds things and how fast they move, in any weather.', s: 'Radio waves: distance and speed, in any weather. A blurry picture.' } },
  lidar: { icon: '🔦', name: 'Lidar', does: { j: 'Laser light. Makes a 3D picture of shapes, even in the dark.', s: 'Laser pulses: a 3D point picture of shapes and distances. Fog scatters it.' } },
};
export const CONDS = ['sun', 'rain', 'fog', 'dark'];
export const COND = { sun: { icon: '☀️', name: 'Sun' }, rain: { icon: '🌧', name: 'Rain' }, fog: { icon: '🌫', name: 'Fog' }, dark: { icon: '🌙', name: 'Dark' } };

// does this sensor pick up this thing at all, in this weather? (what its picture shows)
export function sees(sensor, t, cond) {
  if (t.kind === 'bag') return sensor === 'camera' ? cond !== 'fog' && cond !== 'dark' : sensor === 'lidar' ? cond !== 'fog' : false; // a paper bag: radar waves pass through it
  if (sensor === 'camera') { if (cond === 'fog') return t.z < 12 || !!t.lit; if (cond === 'dark') return t.z < 14 || !!t.lit; return true; }
  if (sensor === 'radar') return true;
  if (sensor === 'lidar') return cond === 'fog' ? t.z < 12 : true;
  return false;
}
// what each sensor can tell about a thing it picks up
export const CAN = {
  camera: { there: true, colour: true, shape: true, speed: false },
  radar: { there: true, colour: false, shape: false, speed: true },
  lidar: { there: true, colour: false, shape: true, speed: false },
};
// the right answer to a question: every sensor that picks the thing up and can tell what is asked
export const answer = (q) => SENSORS.filter((s) => sees(s, q.target, q.cond) && CAN[s][q.ask]);

// the rounds, in order: each a weather, a few things in the street, one thing to find out, and what is asked of it
export const ROUNDS = [
  { id: 'light', cond: 'sun', ask: 'colour', target: { kind: 'light', x: 4.4, z: 17, lamp: 'red', lit: true },
    things: [{ kind: 'car', x: -1.8, z: 30, colour: '#c8553d', mph: 0 }, { kind: 'person', x: 5.4, z: 16, colour: '#1c6fd0' }],
    q: { j: 'The traffic light ahead: is it red or green? Which sensors can tell?', s: 'Is the traffic light ahead red or green? Tick every sensor that can tell.' },
    why: { j: 'Only the camera sees colours. Radar and lidar show the light’s shape, but not which lamp is on.', s: 'Only the camera sees colour. Radar and lidar find the pole and the box, not which lamp is lit.' },
    hint: [{ j: 'Look at each view. Which one shows any colours at all?', s: 'Compare the three views. Which one shows colour?' }, { j: 'Radar and lidar draw shapes and blobs, never colours.', s: 'Radar and lidar return shapes and distances, never colour.' }] },
  { id: 'dark', cond: 'dark', ask: 'there', target: { kind: 'person', x: 1.2, z: 30, colour: '#2a2f35', i: 2 },
    things: [{ kind: 'post', x: -4.2, z: 9 }, { kind: 'car', x: -1.8, z: 52, colour: '#3d6e8a', mph: 18 }],
    q: { j: 'Night. Someone in a dark coat is crossing, past the headlights. Which sensors can see them?', s: 'Night. A person in dark clothes is crossing beyond the headlights. Tick every sensor that detects them.' },
    why: { j: 'Radar and lidar make their own waves and light, so the dark does not stop them. The camera needs light.', s: 'Radar and lidar send out their own signal, so darkness does not matter. A camera needs light on the scene.' },
    hint: [{ j: 'Look at the camera view first. Can you see the person?', s: 'Check the camera view: is the person in it?' }, { j: 'Two sensors send out their own light or waves.', s: 'Two of the sensors are active: they light the scene themselves.' }] },
  { id: 'fog', cond: 'fog', ask: 'there', target: { kind: 'car', x: 0.4, z: 34, colour: '#8a9099', mph: 0 },
    things: [{ kind: 'sign', x: -4.6, z: 9, text: '20' }, { kind: 'person', x: 5, z: 22, colour: '#1f7442' }],
    q: { j: 'Thick fog. A car has stopped further up the road. Which sensors can see it?', s: 'Thick fog. A car has stopped 34 m ahead. Tick every sensor that detects it.' },
    why: { j: 'Radar waves go through fog. The fog hides the car from the camera and scatters the lidar’s laser.', s: 'Radio waves pass through fog. Fog blocks the camera and scatters lidar pulses, so both only see close up.' },
    hint: [{ j: 'Look at the far end of the road in each view.', s: 'Look past the first 12 metres in each view.' }, { j: 'Only one view still shows something far away.', s: 'One sensor still returns a long-range echo.' }] },
  { id: 'speed', cond: 'rain', ask: 'speed', target: { kind: 'cyclist', x: 1.4, z: 22, colour: '#b23a26', mph: 12 },
    things: [{ kind: 'car', x: -1.8, z: 44, colour: '#1f7f49', mph: 20 }, { kind: 'dog', x: 5.2, z: 12 }],
    q: { j: 'Rain. How fast is the cyclist going? Which sensor can measure it?', s: 'Rain. Which sensor measures the cyclist’s speed directly?' },
    why: { j: 'Radar measures speed straight away, from how its waves bounce back. The others only show where things are.', s: 'Radar measures speed directly, from the shift in the returning wave (the Doppler effect). Camera and lidar only give position at one moment.' },
    hint: [{ j: 'Which view has arrows that show movement?', s: 'Which view reports a speed?' }, { j: 'It is the sensor that also works in any weather.', s: 'The same sensor that sees through fog.' }] },
  { id: 'shape', cond: 'sun', ask: 'shape', target: { kind: 'child', x: 2.2, z: 16, colour: '#e0a020' },
    things: [{ kind: 'post', x: 3.3, z: 15 }, { kind: 'bag', x: -1, z: 12 }, { kind: 'car', x: -1.8, z: 40, colour: '#3d6e8a', mph: 10 }],
    q: { j: 'Something small is by the kerb. Is it a child or a post? Which sensors can tell?', s: 'A small object by the kerb: child or bollard? Tick every sensor that can tell the shape.' },
    why: { j: 'The camera and the lidar both show shapes. Radar only shows a blob, so it cannot tell a child from a post.', s: 'Camera and lidar both resolve shape. Radar returns a blob of about the same size for both.' },
    hint: [{ j: 'In which views do the child and the post look different?', s: 'In which views can you tell the two objects apart?' }, { j: 'More than one sensor can tell. Radar just shows two blobs.', s: 'More than one is right. Radar gives two similar blobs.' }] },
];

// how the child's answer compares with the right one
export function check(round, picked) {
  const want = answer(round); const got = SENSORS.filter((s) => picked.includes(s));
  return { right: want.length === got.length && want.every((s) => got.includes(s)), want, missing: want.filter((s) => !got.includes(s)), extra: got.filter((s) => !want.includes(s)) };
}
// the line after a wrong answer: never the answer on the first or second miss
export function missSay(round, res, misses, j) {
  const p = (o) => (j ? o.j : o.s);
  if (misses >= 3) return `${j ? 'The answer is' : 'Answer:'} ${res.want.map((s) => SENSOR[s].name).join(' and ')}. ${p(round.why)}`;
  const part = res.extra.length && !res.missing.length ? (j ? 'Not quite: you ticked one too many.' : 'Close: one ticked sensor cannot do it.') : res.missing.length && !res.extra.length ? (j ? 'Not quite: another sensor can do it too.' : 'Close: one more sensor can do it.') : (j ? 'Not yet.' : 'Not yet.');
  return `${part} ${p(round.hint[misses - 1])}`;
}

// the last part: choose the sensors for the car. The table says which jobs are covered in which weather.
export const JOBS = ['there', 'shape', 'colour', 'speed'];
export const JOB = { there: { j: 'Find people and cars', s: 'Detect objects' }, shape: { j: 'Tell a child from a post', s: 'Recognise shapes' }, colour: { j: 'Read lights and signs', s: 'Read lights and signs' }, speed: { j: 'Tell how fast', s: 'Measure speed' } };
export function cover(kit) {
  const rows = JOBS.map((job) => ({ job, by: CONDS.map((c) => kit.some((s) => CAN[s][job] && (job === 'colour' ? s === 'camera' && c !== 'fog' : sees(s, { kind: 'person', z: 30, lit: job === 'colour' }, c)))) }));
  const gaps = rows.reduce((n, r) => n + r.by.filter((x) => !x).length, 0);
  return { rows, gaps };
}
// With all three, two gaps are left, both in thick fog far ahead: shapes and signs. That is true of real cars too, so they slow down in fog.
export function kitSay(kit, j) {
  const { gaps } = cover(kit); const names = kit.map((s) => SENSOR[s].name.toLowerCase());
  if (!kit.length) return j ? 'Tick at least one sensor.' : 'Choose at least one sensor.';
  if (kit.length === 3) return j ? 'All three. Each one covers what the others miss. Only thick fog still hides far-off shapes and signs, so the car slows down in fog, as you would.' : 'All three: each covers the others’ gaps. Two gaps are left, both in thick fog: far-off shapes and signs. So the car slows down in fog, as a careful driver would.';
  return j ? `With ${names.join(' and ')}, there ${gaps === 1 ? 'is 1 gap' : `are ${gaps} gaps`} in the table. A gap is a time the car cannot tell something.` : `${names.join(' + ')}: ${gaps} ${gaps === 1 ? 'gap' : 'gaps'} in the table. Each gap is a condition where the car is blind to that job.`;
}

export const M1 = {
  intro: { j: 'Let’s see the street the way the car does. Tap Camera, Radar and Lidar to switch views. Then tick every sensor that can answer the question.', s: 'Switch between the three sensor views of the same street. Then tick every sensor that can answer the question.' },
  right: { j: 'Yes!', s: 'Correct.' },
  kitAsk: { j: 'Last job: choose the sensors for our car. Tick them, and look at the table.', s: 'Final step: choose the car’s sensor set and read the coverage table.' },
};
// one line for the take-home record
export function m1Line(rec, j) {
  const n = rec?.first ?? 0, of = ROUNDS.length;
  return j ? `Sensors: right first time in ${n} of ${of} views, and chose ${rec?.kit?.length === 3 ? 'all three sensors' : `${rec?.kit?.length || 0} sensors`}` : `Sensor views: ${n}/${of} right first time; sensor set: ${(rec?.kit || []).map((s) => SENSOR[s].name).join(' + ') || 'none'}`;
}
