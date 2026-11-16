// Mission 1, how any robot works: sensors, and the sense–think–act loop. Pure: no page.
// Part A: match each job to the one sensor that can do it. Part B: a robot drives to its charger with a distance sensor,
// a bump switch and one rule; the child predicts its moves, then chooses the rule's distance and watches what happens.

export const SENSORS = [
  { id: 'camera', name: 'Camera', icon: '📷', can: 'sees colours, shapes and writing', cant: 'It cannot see in the dark, and it cannot tell how hot something is.' },
  { id: 'distance', name: 'Distance sensor', icon: '📏', can: 'measures how far away something is', how: 'It sends out a sound and times the echo.', cant: 'It cannot tell colours or read writing.' },
  { id: 'bump', name: 'Bump switch', icon: '🔘', can: 'feels when it has touched something', cant: 'It only knows after it has touched. It cannot warn before.' },
  { id: 'thermo', name: 'Thermometer', icon: '🌡️', can: 'measures how hot or cold it is', cant: 'It cannot tell where things are or what they look like.' },
];
export const sensor = (id) => SENSORS.find((s) => s.id === id) || null;

// The jobs, easiest first. need: what the robot must find out (said after a second miss, never after the first).
export const JOBS = [
  { id: 'hot', want: 'thermo', j: 'Open the greenhouse window when the air gets too hot.', s: 'Open the greenhouse vent when the air goes above 30 °C.', need: 'how hot the air is' },
  { id: 'ripe', want: 'camera', j: 'Pick only the red tomatoes, not the green ones.', s: 'Pick only the ripe red tomatoes, and leave the green ones.', need: 'what colour each tomato is' },
  { id: 'wall', want: 'distance', j: 'Slow down before it reaches a wall.', s: 'Slow down when a wall is less than 1 metre ahead.', need: 'how far away the wall is, before it gets there' },
  { id: 'vacuum', want: 'bump', j: 'A robot vacuum must know it has bumped into a chair leg.', s: 'A robot vacuum must know for certain that it has touched a chair leg.', need: 'whether it has touched something' },
  { id: 'dark', want: 'distance', j: 'Find a box in the way in a dark storeroom.', s: 'Notice a box in its path in a storeroom with the lights off.', need: 'how far away the box is, even in the dark' },
  { id: 'tea', want: 'thermo', j: 'Wait until a cup of tea has cooled before handing it over.', s: 'Hand over a cup of tea only once it has cooled below 60 °C.', need: 'how hot the tea is' },
  { id: 'door', want: 'camera', j: 'Read the room number on a door.', s: 'Read the number on a hotel room door to deliver towels.', need: 'what is written on the door' },
  { id: 'mower', want: 'bump', j: 'A robot lawnmower must notice it has hit a fence post.', s: 'A robot lawnmower must stop as soon as it touches a fence post.', need: 'whether it has touched something' },
];
// The line after a choice. tries: how many wrong choices before this one on this job.
export function matchLine(job, sensorId, tries, junior) {
  const s = sensor(sensorId); const right = job.want === sensorId;
  if (right) return { ok: true, text: `Yes. A ${s.name.toLowerCase()} ${s.can}.${s.how && !junior ? ` ${s.how}` : ''}` };
  const base = `A ${s.name.toLowerCase()} ${s.can}. ${s.cant}`;
  return { ok: false, text: tries >= 1 ? `${base} This robot needs to know ${job.need}.` : `${base} Try another.` };
}

// ---------- Part B: the robot and its rule
// The greenhouse: # a wall or a plant pot, . floor, S the robot (facing east), G its charger.
export const ROOM = ['#######', '#S...##', '####.##', '#G...##', '#######'];
// The second room, where the child sets the rule: the charger is round the other way, so the rule from room 1 fails.
export const ROOM2 = ['########', '#G....##', '#####.##', '#S....##', '########'];
export const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // east, south, west, north (turning right goes to the next)
export const DIR_NAME = ['east', 'south', 'west', 'north'];
export const SQUARE_CM = 50;
// the rule's distance: turn right when the clear space ahead is less than this many squares (0: never turn)
export const RULES = [
  { t: 1, j: 'If something is right in front, turn right. If not, go forward.', s: 'If the distance is under 50 cm, turn right. Otherwise go forward.' },
  { t: 2, j: 'If something is near (one square away or less), turn right. If not, go forward.', s: 'If the distance is under 100 cm, turn right. Otherwise go forward.' },
  { t: 0, j: 'Never turn. Always go forward.', s: 'Ignore the distance: always go forward.' },
];
export const rule = (t) => RULES.find((r) => r.t === t);
// Room 2: which way to turn, and when (ages 8–12: three choices; ages 13–17: a distance in cm, 25 to 150)
export const WHEN = [{ t: 1, j: 'when something is right in front' }, { t: 2, j: 'when something is near (one square away or less)' }, { t: 0, j: 'never: always go forward' }];
export const CM = [25, 50, 75, 100, 125, 150];
export const cmToT = (cm) => Math.max(0, Math.ceil((cm - 25) / SQUARE_CM)); // turn when the reading is under cm
export function ruleText(dir, t, junior, cm = null) {
  const way = dir === 'left' ? 'left' : 'right';
  if (junior) return t === 0 ? 'Never turn. Always go forward.' : `Turn ${way} ${WHEN.find((w) => w.t === t).j}. If not, go forward.`;
  return cm <= 25 ? 'Never turn (no reading is under 25 cm).' : `If the distance is under ${cm} cm, turn ${way}. Otherwise go forward.`;
}
const at = (room, x, y) => (room[y] && room[y][x]) || '#';
export function startOf(room = ROOM) { for (let y = 0; y < room.length; y++) { const x = room[y].indexOf('S'); if (x >= 0) return { x, y, d: 0 }; } return null; }
// clear squares straight ahead before something is in the way
export function sense(room, st) { const [dx, dy] = DIRS[st.d]; let n = 0; let x = st.x + dx; let y = st.y + dy; while (at(room, x, y) !== '#' && n < 20) { n++; x += dx; y += dy; } return n; }
export const reading = (n, junior) => (junior ? n : n * SQUARE_CM + 25); // centimetres to the middle of the gap, ages 13–17
// one turn of the loop: { sense, think: 'turn' | 'forward', act, st, bump, home }
export function tick(room, st, t, dir = 'right') {
  const n = sense(room, st); const turn = t > 0 && n < t;
  if (turn) return { sense: n, think: 'turn', st: { ...st, d: (st.d + (dir === 'left' ? 3 : 1)) % 4 }, bump: false, home: false };
  const [dx, dy] = DIRS[st.d]; const nx = st.x + dx; const ny = st.y + dy;
  if (at(room, nx, ny) === '#') return { sense: n, think: 'forward', st, bump: true, home: false };
  return { sense: n, think: 'forward', st: { x: nx, y: ny, d: st.d }, bump: false, home: at(room, nx, ny) === 'G' };
}
// the whole trip: { steps: [tick…], end: 'home' | 'bump' | 'circles' }
export function drive(room, t, max = 40, dir = 'right') {
  let st = startOf(room); const steps = []; const seen = new Set([`${st.x},${st.y},${st.d}`]);
  while (steps.length < max) {
    const s = tick(room, st, t, dir); steps.push(s); st = s.st;
    if (s.home) return { steps, end: 'home' }; if (s.bump) return { steps, end: 'bump' };
    const k = `${st.x},${st.y},${st.d}`; if (seen.has(k)) return { steps, end: 'circles' }; seen.add(k);
  }
  return { steps, end: 'circles' };
}
// Which ticks of the trip the child is asked to predict: a forward, the first turn, and one more of each. Indexes.
export function askAt(trip) { const f = trip.steps.findIndex((s) => s.think === 'forward'); const t = trip.steps.findIndex((s) => s.think === 'turn'); const f2 = trip.steps.findIndex((s, i) => i > t && s.think === 'forward' && s.sense > 0); const t2 = trip.steps.findIndex((s, i) => i > t && s.think === 'turn');
  return [...new Set([f, t, f2, t2].filter((i) => i >= 0))].sort((a, b) => a - b); }
export function endLine(end, t, junior) {
  if (end === 'home') return junior ? 'It reached its charger without touching anything. Sense, think, act, over and over.' : 'It reached the charger with no contact. The loop ran once per move.';
  if (end === 'bump') return junior ? 'Bump! It drove into the pot. The bump switch felt it and stopped the robot. A distance sensor could have warned it sooner, if the rule used it.' : 'Contact: the bump switch stopped it. The rule never used the distance sensor in time, so nothing warned it.';
  return junior ? 'It went round in circles and never reached its charger. Look at when it turns, and which way.' : 'It looped: with this rule it never reaches the charger. Check the turn direction and the distance.';
}
// the leader's list and the record
export const m1Summary = (matchRight, ofJobs, predRight, predOf, rules) => ({ mr: matchRight, mo: ofJobs, pr: predRight, po: predOf, tried: rules });
