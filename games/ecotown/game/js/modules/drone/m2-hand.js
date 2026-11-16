// Mission 2, hand flying: the training course and its rules. Pure: no page, no 3D (tests/drone-hour.test.mjs).
// Real pilots practise with the drone's position hold off (in the UK this is part of training for some licences), so
// the wind moves the drone and the pilot has to push back. Take-off, a steady hover, a hoop course and a gentle
// landing are the basic manoeuvres. One world unit is about one metre.
import { ITEMS } from '../../world/catalog.js';
import { tileXZ, SAFE_RX, SAFE_RZ } from './geo.js';

// The hoops and the landing pad, round the training place: offsets in metres, height above the ground.
const HOOPS = [{ dx: 0, dz: -14, h: 7 }, { dx: 13, dz: -8, h: 12 }, { dx: 13, dz: 8, h: 5 }, { dx: -1, dz: 13, h: 10 }];
const LAND = { dx: -12, dz: 2 };

// ---------------------------------------------------------------- where on the island to train
// An open tile, as far as possible from buildings and the island's fixed buildings, and not on the river.
// avoid: tile keys not to choose (another mission's place). Returns { gx, gz, x, z } or null.
export function pickOpen(cells, tiles, avoid = []) {
  const cellOf = new Map(cells || []); const no = new Set(avoid); const solid = [];
  for (const t of tiles) { const it = cellOf.get(t.k)?.item; if (t.fixed || (it && ITEMS[it]?.kind === 'build')) solid.push(t); }
  let top = null, best = -Infinity;
  for (const t of tiles) {
    if (t.zone === 'river' || t.fixed || no.has(t.k) || (cellOf.get(t.k)?.item && ITEMS[cellOf.get(t.k).item]?.kind === 'build')) continue;
    const [x, z] = tileXZ(t.gx, t.gz); const inner = Math.hypot(x / SAFE_RX, z / SAFE_RZ);
    const clear = solid.length ? Math.min(...solid.map((s) => Math.max(Math.abs(s.gx - t.gx), Math.abs(s.gz - t.gz)))) : 6;
    // the course round it should fit on the island without being squeezed, and trees and slopes make a poor field
    const squeezed = [...HOOPS, LAND].filter((o) => Math.hypot((x + o.dx) / (SAFE_RX - 5), (z + o.dz) / (SAFE_RZ - 5)) > 1).length;
    const v = Math.min(clear, 3) * 10 - inner * 30 - squeezed * 12 + (t.zone === 'meadow' || t.zone === 'field' || t.zone === 'coast' ? 6 : t.zone === 'wood' || t.zone === 'slope' ? -12 : 0);
    if (v > best) { best = v; top = { gx: t.gx, gz: t.gz, x, z, k: t.k }; }
  }
  return top;
}

// ---------------------------------------------------------------- the course
export const TAKEOFF = { lo: 4, hi: 7, hold: 1.5 };       // the height band to climb into (metres) and how long to stay there
export const RING = 3.2;                                    // the hover ring's radius: keep the drone's shadow inside it
export const HOVERS = [                                     // two rounds: a steady breeze, then a stronger gusty wind
  { from: 'west', kmh: 12, gust: 0, need: 5 },
  { from: 'north-east', kmh: 24, gust: 0.4, need: 6 },
];
const FROM = { west: [1, 0], east: [-1, 0], north: [0, 1], south: [0, -1], 'north-east': [-Math.SQRT1_2, Math.SQRT1_2], 'south-west': [Math.SQRT1_2, -Math.SQRT1_2] };
export const DRIFT = 0.12;                                  // metres a second of drift for each km/h of wind
// The wind at time t (seconds) in a round: { x, z } in metres a second (the way it blows), and its speed in km/h.
export function windAt(round, t) {
  const r = HOVERS[round] || HOVERS[0]; const [dx, dz] = FROM[r.from];
  const k = 1 + r.gust * (0.6 * Math.sin(t * 1.3) + 0.4 * Math.sin(t * 3.1 + 1)); const kmh = Math.max(0, r.kmh * k);
  return { x: dx * kmh * DRIFT, z: dz * kmh * DRIFT, kmh: Math.round(kmh) };
}
// The hoops and the landing pad, round the training place: offsets in metres, height above the ground.
// clear(x, z) (optional): whether a point is open ground for the landing pad (not the river, not a building).
export function course(origin, clear = () => true) {
  const at = (o) => { let x = origin.x + o.dx, z = origin.z + o.dz; const e = Math.hypot(x / (SAFE_RX - 5), z / (SAFE_RZ - 5)); if (e > 1) { x /= e; z /= e; } return { x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10 }; };
  const hoops = HOOPS.map((h, i) => { const p = at(h); const prev = i ? at(HOOPS[i - 1]) : { x: origin.x, z: origin.z }; return { ...p, h: h.h, facing: Math.atan2(p.x - prev.x, -(p.z - prev.z)) }; });
  // the landing pad: the first of a few spots round the field that is open ground
  const spots = [LAND, { dx: 12, dz: 2 }, { dx: -2, dz: -12 }, { dx: -2, dz: 12 }, { dx: -10, dz: -8 }, { dx: 10, dz: 10 }, { dx: -8, dz: 9 }].map(at).filter((p) => Math.hypot(p.x - origin.x, p.z - origin.z) > 7);
  const land = spots.find((p) => clear(p.x, p.z)) || spots[0] || at(LAND);
  return { pad: { x: origin.x, z: origin.z }, hoops, land };
}
export const HOOP_R = 3.4;                                  // a hoop counts when the drone passes this close to its middle
export const PAD_R = 2.6;                                   // the landing pad's radius
// A touchdown: speed in metres a second (downwards), off = how far from the pad's middle.
export function landing(speed, off) {
  if (off > PAD_R) return { ok: false, kind: 'off', text: 'The drone landed off the pad. Go up a little, move over the pad, and come down again.' };
  if (speed > 3) return { ok: false, kind: 'hard', text: 'Bump! That was too fast. Go up a little and try again. Let go of Down just before the ground.' };
  if (speed > 1.8) return { ok: true, kind: 'firm', text: 'Landed on the pad. It was a little firm: next time, let go of Down a moment sooner.' };
  return { ok: true, kind: 'soft', text: 'A gentle landing, right on the pad.' };
}
export const windWords = (round, junior) => {
  const r = HOVERS[round]; if (!junior) return `Wind from the ${r.from}, ${r.kmh} km/h${r.gust ? `, gusting to ${Math.round(r.kmh * (1 + r.gust))} km/h` : ''}.`;
  return round ? 'A strong, gusty wind is blowing.' : 'A gentle wind is blowing.';
};
