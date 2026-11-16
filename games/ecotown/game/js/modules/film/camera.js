// Town film studio: where the camera is at each moment of a shot. Pure numbers: no page, no 3D.
// poseFor(shot, set, u, live) gives { pos, look, fov } for u from 0 (the shot's first frame) to 1 (its last).
// Angles: `a` is where the camera stands round its subject (0 = due south of it, positive = towards the east),
// `p` is how steeply it looks down, `d` is how far away it is.
import { CENTRE, SIDES_OUT, placeOf, riverX } from './kit.js';

const DEG = Math.PI / 180;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const smooth = (t) => t * t * (3 - 2 * t);
// a camera move that is already under way when the shot starts and still moving when it ends: mostly even, eased a little
export const ease = (u) => { const t = clamp(u); return lerp(t, smooth(t), 0.55); };
const HOME = -30; // the side the island is usually seen from (the south-west)

const around = (c, d, p, a) => [c[0] + d * Math.cos(p * DEG) * Math.sin(a * DEG), c[1] + d * Math.sin(p * DEG), c[2] + d * Math.cos(p * DEG) * Math.cos(a * DEG)];
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// How far back the camera must stand to see the whole island on this screen (narrow screens need more room).
export const wideDist = (aspect = 1.6) => 136 * clamp(1.6 / (aspect || 1.6), 1, 2.2);

// Outside the built-on part of the island there are hills and rock towers: out there the camera keeps above them.
function lift(pos) {
  const e = Math.hypot(pos[0] / 40, pos[2] / 31); if (e <= 1) return pos;
  const k = smooth(clamp((e - 1) / 0.18)); return [pos[0], Math.max(pos[1], lerp(pos[1], 17, k)), pos[2]];
}

// The point a shot looks at. live: { florence, family, otters } positions from the 3D town this frame (optional).
export function targetOf(shot, set, live) {
  const [kind, id] = String(shot.sub).split(':');
  if (kind === 'place') { const p = placeOf(set, id); if (p) return [p.x, p.y + 2.6, p.z]; }
  if (kind === 'who') { const at = live?.[id] || set.who[id]?.pos; if (at) return [at[0], at[1] + (id === 'florence' ? 3.6 : id === 'family' ? 0.6 : 0.2), at[2]]; }
  return [set.town[0], set.town[1], set.town[2]];
}

// ages 13-17 see the numbers: how far a pan turns and how far a tilt looks up
export const PAN_DEG = 70, TILT_DEG = 36;
// where a close shot or a medium shot of someone aims: a face for a close-up, the middle of the body for a medium shot
function whoLook(id, P, size) {
  if (id === 'florence') return [P[0], P[1] + (size === 'close' ? 2.1 : 0.7), P[2]];
  if (id === 'family') return [P[0], P[1] + (size === 'close' ? 0.45 : 0.15), P[2]];
  return [P[0], P[1] + 0.2, P[2]];
}
// A real camera's lens for this view: the focal length (mm) that gives the same picture height on a full-frame camera
// (a 24 mm tall sensor). fov is the view's height in degrees, as three.js uses it.
export const lensMm = (fov) => Math.round(12 / Math.tan(fov / 2 * DEG));
export const distOf = (pose) => Math.round(Math.hypot(pose.pos[0] - pose.look[0], pose.pos[1] - pose.look[1], pose.pos[2] - pose.look[2]));

export function poseFor(shot, set, u = 0.5, live = null) {
  const t = ease(u); const P = targetOf(shot, set, live); const aspect = live?.aspect || 1.6; const D = wideDist(aspect);
  const far = aspect < 1 ? 1.35 : 1; // an upright screen is narrow: stand a little further back from a place
  const [kind, id] = String(shot.sub).split(':'); const place = kind === 'place' ? placeOf(set, id) : null;
  let pos, look = P, fov = 36;
  switch (shot.move) {
    case 'wide': pos = around(set.town, D, 31, lerp(HOME - 9, HOME + 9, t)); look = set.town; fov = 40; break;
    case 'push': pos = around(P, lerp(64, 30, t) * far, lerp(33, 24, t), HOME); fov = 34; break;
    case 'orbit': pos = around(P, 26 * far, 28, lerp(-12, 92, t)); fov = 36; break;
    case 'rise': pos = around(P, lerp(15, 31, t) * far, lerp(9, 40, t), 22); fov = 40; break;
    case 'glide': { const c = set.town; pos = [lerp(c[0] - 30, c[0] + 30, t), 31, c[2] + 46 * far]; look = [c[0], 2, c[2]]; fov = 38; break; }
    case 'pull': { // from close on the place out to the whole town
      const k = smooth(clamp(u)); look = mix(P, set.town, k);
      pos = around(look, lerp(30 * far, D, k), lerp(24, 31, k), HOME); fov = lerp(34, 40, k); break;
    }
    case 'street': { // along the most open side of the place, at head height (or over the roofs if no side is open)
      // across the street (the open tile beside the place, not the place's own edge), a little above head height and
      // looking slightly down, so stalls and roofs in front do not fill the frame
      const [nx, nz] = SIDES_OUT[place?.side ?? 0]; const clear = place ? place.clear : true; const out = clear ? 10 : 12; const along = lerp(-8, 8, t);
      const g = place ? P[1] - 2.6 : P[1]; pos = [P[0] + nx * out - nz * along, g + (clear ? 3.6 : 10), P[2] + nz * out + nx * along];
      look = [P[0], g + (clear ? 1.8 : 1.5), P[2]]; fov = 50; break;
    }
    // ---- the film crew's words (mission 1): the same subject at three sizes, and the three camera moves
    case 'cw-wide': if (kind === 'who') { const L = [P[0], P[1] - 0.6, P[2]]; look = L; pos = around(L, 46 * far, 20, lerp(HOME - 4, HOME + 4, t)); fov = 38; } else { pos = around(set.town, D, 31, HOME); look = set.town; fov = 40; } break;
    case 'cw-medium': if (kind === 'who') { const L = whoLook(id, P, 'medium'); look = L; const a = id === 'family' ? (live?.familyFace ?? 0) : id === 'otters' ? 83 : HOME; pos = around(L, (id === 'florence' ? 10.5 : id === 'family' ? 3.6 : 7) * far, id === 'otters' ? 22 : 7, lerp(a - 6, a + 2, t)); fov = 30; } else { pos = around(P, 30 * far, 20, lerp(HOME - 4, HOME + 4, t)); fov = 34; } break;
    case 'cw-close': if (kind === 'who') {
        const L = whoLook(id, P, 'close'); look = L; fov = 24;
        if (id === 'family') { const face = live?.familyFace ?? 0; pos = around(L, 2.8 * far, 10, lerp(face - 8, face + 8, t)); }  // from their door side: they face the camera
        else if (id === 'otters') pos = around(L, 4.5 * far, 22, lerp(70, 96, t));                                                 // from the east bank
        else pos = around(L, 10.5 * far, 5, lerp(HOME - 5, HOME + 3, t));
      } else { pos = around(P, 11 * far, 16, lerp(HOME - 4, HOME + 4, t)); fov = 28; } break;
    case 'pan': { // the camera stands still and turns from one side to the other
      const c = place ? [P[0], P[1] - 1.6, P[2]] : set.town; const st = around(c, (place ? 42 : 70) * far, place ? 24 : 22, HOME); pos = st;
      const [dx, dz] = [c[0] - st[0], c[2] - st[2]]; const L = Math.hypot(dx, dz) || 1; const side = Math.tan(PAN_DEG / 2 * DEG) * L * lerp(-1, 1, t);
      look = [c[0] - dz / L * side, c[1], c[2] + dx / L * side]; fov = 36; break;
    }
    case 'tilt': { // the camera stands still at the foot of something tall and turns from its foot up to its top
      const g = P[1] - 2.6; const base = [P[0], g, P[2]]; pos = around(base, 19 * far, 0, HOME); pos[1] = g + 1.8;
      const [dx, dz] = [P[0] - pos[0], P[2] - pos[2]]; const L = Math.hypot(dx, dz) || 1; const up = Math.tan(lerp(-8, TILT_DEG - 8, t) * DEG) * L;
      look = [P[0], pos[1] + up, P[2]]; fov = 40; break;
    }
    case 'track': { // the camera itself moves along beside what it films: here, down the river at the water's edge
      const z = lerp(-14, 14, t); const rx = riverX(z); pos = [rx + 10, 7.5, z - 4]; look = [rx, 0.6, z + 6]; fov = 44; break;
    }
    // a close-up anywhere in the hour is filmed as mission 1 teaches it: a face, or one detail
    case 'close': default: return poseFor({ ...shot, move: 'cw-close' }, set, u, live);
  }
  return { pos: lift(pos), look, fov };
}

// With reduced motion a shot is one still view: the frame that shows its subject best.
export const stillAt = (move) => (move === 'pull' ? 1 : move === 'push' ? 0.85 : move === 'rise' ? 0.7 : 0.5);

// The otters' place in the river at game time t (as js/engine/life.js moves them): the camera follows the first one.
export function otterAt(t, riverX) { const z = -20 + ((t * 1.6) % 44); return [riverX(z) - 0.4, 0.5, z]; }

export { CENTRE };
