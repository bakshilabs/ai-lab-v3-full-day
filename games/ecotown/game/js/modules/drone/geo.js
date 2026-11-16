// Drone delivery: the island's grid as plain numbers. Pure: no page, no 3D.
// The same grid as js/world/terrain.js (a module may not import that file; tests/drone.test.mjs checks they agree).
export const T = 6;              // world units per tile side
export const X0 = -42, Z0 = -33; // world position of the grid's north-west corner
export const GW = 14, GH = 11;   // grid size in tiles
export const SAFE_RX = 37, SAFE_RZ = 28; // the hand-flown drone is pulled back inside this ellipse (the built-on part of the island)

export const key = (gx, gz) => gx + ',' + gz;
export const parseKey = (k) => { const [gx, gz] = String(k).split(',').map(Number); return { gx, gz }; };
export const tileXZ = (gx, gz) => [X0 + gx * T + T / 2, Z0 + gz * T + T / 2];           // centre of a tile in the world
export const toGrid = (x, z) => [(x - X0) / T - 0.5, (z - Z0) / T - 0.5];               // world point -> tile coordinates (fractions)

// North is up the map and away from the default camera: smaller gz.
export const DIRS = {
  n: { dx: 0, dz: -1, word: 'north', arrow: '↑' },
  e: { dx: 1, dz: 0, word: 'east', arrow: '→' },
  s: { dx: 0, dz: 1, word: 'south', arrow: '↓' },
  w: { dx: -1, dz: 0, word: 'west', arrow: '←' },
};
export const DIR_IDS = ['n', 'e', 's', 'w'];

export const tilesWord = (n) => `${n} ${n === 1 ? 'tile' : 'tiles'}`;
export const manhattan = (a, b) => Math.abs(a.gx - b.gx) + Math.abs(a.gz - b.gz);

// "2 tiles south and 1 tile east": how to get from one tile to another, in words. '' when they are the same tile.
export function offsetWords(from, to) {
  const dx = to.gx - from.gx, dz = to.gz - from.gz; const parts = [];
  if (dz) parts.push(`${tilesWord(Math.abs(dz))} ${dz < 0 ? 'north' : 'south'}`);
  if (dx) parts.push(`${tilesWord(Math.abs(dx))} ${dx > 0 ? 'east' : 'west'}`);
  return parts.join(' and ');
}

// Keep a hand-flown point inside the island: returns the point moved a fraction `pull` (0..1) of the way back to the edge.
export function pullInside(x, z, pull = 1) {
  const e = Math.hypot(x / SAFE_RX, z / SAFE_RZ); if (e <= 1) return [x, z];
  const f = 1 - Math.min(1, Math.max(0, pull)) * (1 - 1 / e); return [x * f, z * f];
}

// One of eight arrows pointing the way, for an angle in radians (0 = straight ahead / north, clockwise).
export function arrowFor(angle) {
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'][Math.round(a / (Math.PI / 4)) % 8];
}
// The angle (0 = north, clockwise) from one world point to another.
export const bearing = (x0, z0, x1, z1) => Math.atan2(x1 - x0, -(z1 - z0));
// Smallest signed turn from angle a to angle b, in -π..π.
export const turnTo = (a, b) => { let d = (b - a) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; };

// "north and west": which way to go from one tile to another, without the numbers. '' when they are the same tile.
export function dirWords(from, to) {
  const dx = to.gx - from.gx, dz = to.gz - from.gz; const parts = [];
  if (dz) parts.push(dz < 0 ? 'north' : 'south'); if (dx) parts.push(dx > 0 ? 'east' : 'west');
  return parts.join(' and ');
}
// One "fly" step that goes straight from one tile to another, or null when they are not in a line (or too far apart).
export function stepTo(from, to, max = 9) {
  const dx = to.gx - from.gx, dz = to.gz - from.gz; if ((dx && dz) || (!dx && !dz)) return null;
  const n = Math.abs(dx || dz); if (n > max) return null;
  return { op: 'go', dir: dx ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n'), n };
}
// Which side of the island a tile is on, in words: 'north', 'south', 'east' or 'west'.
export function sideWord(p) {
  const dx = p.gx - (GW - 1) / 2, dz = (p.gz - (GH - 1) / 2) * (GW / GH);
  return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'east' : 'west') : (dz > 0 ? 'south' : 'north');
}
// Hoops to fly through by hand on the way from one tile to another: a gentle zigzag, each hoop kept well inside the
// island. Returns [{ x, z, facing }] in world units; facing is the way through the hoop (0 = north, clockwise).
export function hoopsFor(from, to, count = 3) {
  const [x0, z0] = tileXZ(from.gx, from.gz), [x1, z1] = tileXZ(to.gx, to.gz); const len = Math.hypot(x1 - x0, z1 - z0);
  if (len < T * 2.5) return []; const n = len < T * 5 ? Math.min(count, 2) : count;
  const ux = (x1 - x0) / len, uz = (z1 - z0) / len; const swing = Math.min(11, len * 0.24); const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 1) / (n + 1); const side = i % 2 ? -1 : 1;
    let x = x0 + (x1 - x0) * t - uz * swing * side, z = z0 + (z1 - z0) * t + ux * swing * side;
    const e = Math.hypot(x / (SAFE_RX - 6), z / (SAFE_RZ - 6)); if (e > 1) { x /= e; z /= e; }
    pts.push({ x, z });
  }
  const all = [{ x: x0, z: z0 }, ...pts, { x: x1, z: z1 }];
  return pts.map((p, i) => ({ x: Math.round(p.x * 10) / 10, z: Math.round(p.z * 10) / 10, facing: bearing(all[i].x, all[i].z, all[i + 2].x, all[i + 2].z) }));
}
// Distance from a point to a line segment (all in the same units).
export function segDist(px, pz, ax, az, bx, bz) {
  const vx = bx - ax, vz = bz - az; const l2 = vx * vx + vz * vz; const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * vx + (pz - az) * vz) / l2)) : 0;
  return Math.hypot(px - ax - vx * t, pz - az - vz * t);
}
