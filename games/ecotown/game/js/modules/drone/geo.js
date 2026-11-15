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
