// Mission 6, search and rescue: the sensor, the search pattern, what the heat camera finds and the way for the team on
// the ground. Pure (tests/drone-hour.test.mjs). Real practice, kept simple: rescue teams use drones with heat (thermal)
// cameras because people show up warm against cooler ground, especially after dark. Two standard search patterns are
// parallel lines over a whole area, and an "expanding square" that starts where the person was last known to be and
// grows outwards: the square is quicker when the last sighting is good, the lines when nobody knows where to start.
// Heat cameras also see animals, so each warm spot is checked. The drone pilot then guides the team on the ground,
// who can only walk where it is safe (the river can be crossed only at the bridge, the crags not at all).
export const W = 12, H = 9;            // a search area in squares (each about 50 m)
export const SQUARE_M = 50;
// Two searches. The first (both ages): the walker's phone last had signal at the footbridge. The second (ages 13-17):
// after dark, a second walker whose phone had no signal at all; only their car at the car park is known.
// river: { axis: 'x' (a column of squares) or 'z' (a row), at, bridge: where it can be crossed }.
export const SCENES = [
  { id: 'moor', name: 'the moor', lastSeen: { x: 6, z: 2, label: 'Last seen' }, known: true, team: { x: 1, z: 8 },
    river: { axis: 'x', at: 6, bridge: 2 }, crag: ['7,4', '7,5', '7,6', '8,7', '9,7'], wood: ['1,0', '2,0', '3,0', '1,1', '2,1', '3,1', '2,2', '10,8', '11,8', '11,7'],
    spots: [{ id: 'deer', shape: 'deer', x: 3, z: 4, kind: 'animal' }, { id: 'sheep', shape: 'sheep', x: 10, z: 1, kind: 'animal' }, { id: 'walker', shape: 'walker', x: 9, z: 6, kind: 'person' }] },
  { id: 'forest', name: 'the forest edge', lastSeen: { x: 1, z: 8, label: 'Car found' }, known: false, team: { x: 1, z: 8 },
    river: { axis: 'z', at: 5, bridge: 3 }, crag: ['6,3', '6,4', '7,3', '9,6', '10,6'], wood: ['4,0', '5,0', '4,1', '5,1', '0,2', '0,3', '9,8', '10,8', '11,8', '8,1'],
    spots: [{ id: 'fox', shape: 'deer', x: 4, z: 2, kind: 'animal' }, { id: 'cows', shape: 'sheep', x: 7, z: 7, kind: 'animal' }, { id: 'walker', shape: 'walker', x: 10, z: 4, kind: 'person' }] },
];
const S0 = SCENES[0];
export const LAST_SEEN = S0.lastSeen, TEAM = S0.team, SPOTS = S0.spots;
export const isRiver = (x, z, sc = S0) => { const r = sc.river; return r.axis === 'x' ? x === r.at && z !== r.bridge : z === r.at && x !== r.bridge; };
export const isBridge = (x, z, sc = S0) => { const r = sc.river; return r.axis === 'x' ? x === r.at && z === r.bridge : z === r.at && x === r.bridge; };
export const isCrag = (x, z, sc = S0) => sc.crag.includes(`${x},${z}`);
export const isWood = (x, z, sc = S0) => sc.wood.includes(`${x},${z}`);
export const inside = (x, z) => x >= 0 && z >= 0 && x < W && z < H;
export const passable = (x, z, sc = S0) => inside(x, z) && !isRiver(x, z, sc) && !isCrag(x, z, sc);
export const walkerOf = (sc = S0) => sc.spots.find((s) => s.kind === 'person');

// ---------------------------------------------------------------- the sensor
export const SENSORS = [
  { id: 'camera', label: 'Normal camera', see: 'As it gets dark, the normal camera picture turns dim and grey. A person in dark clothes is very hard to pick out.' },
  { id: 'zoom', label: 'Zoom camera', see: 'The zoom camera sees further, but as it gets dark it still needs light: a person in dark clothes is hard to pick out.' },
  { id: 'heat', label: 'Heat camera', see: 'The heat camera shows warm things as bright shapes, even in the dark. People and animals stand out against the cooler ground.' },
];
export function sensorReply(id, tries, junior = true) {
  if (id === 'heat') return { right: true, text: `Yes. A heat camera finds people by their warmth, so it works as it gets dark and at night. Rescue teams use them for exactly this.${junior ? '' : ' It works best once the ground has cooled, and a drone flying at night must carry a light so others can see it.'}` };
  const s = SENSORS.find((x) => x.id === id);
  return { right: false, told: tries > 0, text: tries ? `${s.see} The heat camera is the one to use: people are warmer than the ground around them.` : `${s.see} Try another camera.` };
}

// ---------------------------------------------------------------- the search patterns
// The camera sees a 3 x 3 block of squares round the drone. A path is the list of squares the drone stops over.
export const VIEW = 1; // squares either side
const clampPt = (x, z) => ({ x: Math.max(VIEW, Math.min(W - 1 - VIEW, x)), z: Math.max(VIEW, Math.min(H - 1 - VIEW, z)) });
export function linesPath() {
  const out = []; let flip = false;
  for (let z = VIEW; z < H; z += 2 * VIEW + 1) { const row = []; for (let x = VIEW; x < W; x += 2 * VIEW + 1) row.push({ x: Math.min(x, W - 1 - VIEW), z: Math.min(z, H - 1 - VIEW) }); out.push(...(flip ? row.reverse() : row)); flip = !flip; }
  return out;
}
export function squarePath(start = LAST_SEEN) {
  const out = [clampPt(start.x, start.z)]; const step = 2 * VIEW + 1; let x = start.x, z = start.z; const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  for (let leg = 1, d = 0; leg <= 10 && out.length < 60; leg++) {
    for (let rep = 0; rep < 2; rep++, d++) { const [dx, dz] = dirs[d % 4]; for (let i = 0; i < leg; i++) { x += dx * step; z += dz * step; const p = clampPt(x, z); const last = out[out.length - 1]; if (p.x !== last.x || p.z !== last.z) out.push(p); } }
    if (covered(out).size >= W * H) break;
  }
  return out;
}
export const PATTERNS = [
  { id: 'square', label: 'Squares growing out from where they were last known to be', path: (sc = S0) => squarePath(sc.lastSeen) },
  { id: 'lines', label: 'Lines back and forth over the whole area', path: () => linesPath() },
];
export function covered(path, upto = path.length) {
  const set = new Set(); for (const p of path.slice(0, upto)) for (let dx = -VIEW; dx <= VIEW; dx++) for (let dz = -VIEW; dz <= VIEW; dz++) if (inside(p.x + dx, p.z + dz)) set.add(`${p.x + dx},${p.z + dz}`); return set;
}
// The warm spots in the order the drone's camera first sees them: [{ spot, at (index on the path) }].
export function finds(path, sc = S0) {
  const out = []; const seen = new Set();
  path.forEach((p, i) => { for (const s of sc.spots) if (!seen.has(s.id) && Math.abs(s.x - p.x) <= VIEW && Math.abs(s.z - p.z) <= VIEW) { seen.add(s.id); out.push({ spot: s, at: i }); } });
  return out;
}
export const MIN_PER_STOP = 1; // about a minute from one stop to the next, at a careful search speed
export const minutesToFind = (path, sc = S0) => { const f = finds(path, sc).find((x) => x.spot.kind === 'person'); return f ? (f.at + 1) * MIN_PER_STOP : null; };
// After a search: both times side by side, and which pattern suited this search. In words, never a mark.
export function compareSearch(sc, chose) {
  const mins = Object.fromEntries(PATTERNS.map((p) => [p.id, minutesToFind(p.path(sc), sc)]));
  const best = mins.square <= mins.lines ? 'square' : 'lines'; const other = chose === 'square' ? 'lines' : 'square';
  const why = sc.known ? 'The last sighting was a good place to start, so the growing squares searched the likeliest ground first.' : 'The walker had walked all day, so they were probably far from the car. Squares spent the first minutes near the car; lines covered the whole area steadily.';
  const text = `Your pattern found the walker in about ${mins[chose]} minutes. The other pattern would have taken about ${mins[other]}. ${why}`;
  return { mins, best, text };
}

// ---------------------------------------------------------------- what is it? (each warm spot)
export const KINDS = [{ id: 'person', label: 'A person' }, { id: 'animal', label: 'An animal' }];
const SHAPE = { deer: 'Four legs and a long neck: an animal, not a person.', sheep: 'Two round shapes on four short legs, close together: animals.', walker: 'A person sitting on the ground, waving one arm: that is the walker.' };
export function kindReply(spot, said, tries) {
  const right = said === spot.kind;
  if (right) return { right, text: spot.kind === 'person' ? 'Yes! That is the walker, sitting down and waving. Now get the team there.' : `Right: ${SHAPE[spot.shape]} Animals are warm too, so every warm spot has to be checked.` };
  return { right, told: tries > 0, text: tries ? SHAPE[spot.shape] : 'Look at the shape. How many legs? Is it standing or sitting?' };
}

// ---------------------------------------------------------------- guiding the team
export const STEPS = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
// Add one square to the team's way. Returns { ok, path, text, reached }.
export function extend(path, x, z, sc = S0) {
  const end = path[path.length - 1]; const walker = walkerOf(sc);
  if (Math.abs(end.x - x) + Math.abs(end.z - z) !== 1) return { ok: false, path, text: 'Choose a square next to the end of the team\'s way.' };
  if (!inside(x, z)) return { ok: false, path, text: 'That is outside the search area.' };
  if (isRiver(x, z, sc)) return { ok: false, path, text: 'The river is too deep and fast to wade across, especially in the dark. The team must use the bridge.' };
  if (isCrag(x, z, sc)) return { ok: false, path, text: 'Those are steep crags. The team cannot climb them safely in the dark: go round.' };
  const back = path.length > 1 && path[path.length - 2].x === x && path[path.length - 2].z === z;
  const next = back ? path.slice(0, -1) : [...path, { x, z }];
  return { ok: true, path: next, reached: x === walker.x && z === walker.z && !back };
}
// The fewest squares from the team to the walker (for the comparison, ages 13-17).
export function shortest(sc = S0) {
  const from = sc.team, to = walkerOf(sc); const d = new Map([[`${from.x},${from.z}`, 0]]); const q = [from];
  for (let i = 0; i < q.length; i++) { const c = q[i]; for (const [dx, dz] of Object.values(STEPS)) { const x = c.x + dx, z = c.z + dz; const k = `${x},${z}`; if (!passable(x, z, sc) || d.has(k)) continue; d.set(k, d.get(`${c.x},${c.z}`) + 1); q.push({ x, z }); } }
  return d.get(`${to.x},${to.z}`) ?? null;
}
export const walkMinutes = (squares) => Math.round(squares * SQUARE_M / 1000 / 3 * 60); // about 3 km/h over rough ground in the dark
