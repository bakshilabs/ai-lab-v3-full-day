// A SECOND SMALL TEST (owner, 22 Nov 2026: version B of the first test "is going in the right direction").
// It keeps B's colour treatment (unlit far things and windows, pale see-through sheets in the distance, a close palette
// with a few bright accents, a pale blue sky on a sunny day) and changes two things to stand beside car town:
//   1. fewer and larger shapes: a line of low homes with plain walls along the path to the school, a row of trees and
//      lamps and people walking and cycling leading the eye to one point, and almost nothing scattered on the lawn;
//   2. see-through layers near the camera (opacity about 0.78), so the foreground is soft, as it is in car town.
// The camera is car town's own. There are no cars, and nothing here is used by the game.
import { THREE, blk, group, hash, GL, soft, fig, SKIN, HAIR } from '../kit-v2.js';
const W = 1280, H = 720, VW = 640, VH = 494, FAR = -30, NO = { shadow: false };
const c0 = new THREE.Color(), hsl = {};
// B's palette rule: every colour is pulled towards one value and lower saturation; accents are passed through tone() untouched
const tone = (hex) => { c0.set(hex).getHSL(hsl, THREE.SRGBColorSpace); c0.setHSL(hsl.h, hsl.s * 0.72, 0.66 + (hsl.l - 0.66) * 0.68, THREE.SRGBColorSpace); return '#' + c0.getHexString(); };
const mats = new Map(), M = (hex, x, o = {}) => { const unlit = o.unlit || x < FAR, col = o.raw ? hex : tone(hex), k = col + (unlit ? 'u' : 'l') + (o.op || ''); if (!mats.has(k)) { const m = unlit ? new THREE.MeshBasicMaterial({ color: col }) : new THREE.MeshLambertMaterial({ color: col }); if (o.op) { m.transparent = true; m.opacity = o.op; m.depthWrite = false; } mats.set(k, m); } return mats.get(k); };
const B = (g, x, z, w, d, y, h, hex, o = {}) => blk(g, x, z, w, d, y, h, hex, { shadow: o.shadow !== false && !o.op, mat: M(hex, x, o) });
const WALL = ['#ecd9b4', '#e4cfa6', '#f0e0c0', '#dcc69c'], ROOF = ['#c8643f', '#3f78b5', '#2e9b5a', '#e0a23a'], LEAF = ['#b9f29c', '#c4f7a8', '#aeea92'], GRASS = ['#8fcf73', '#93d277', '#8bcb6f'];
// a low home: one plain wall, one roof slab with a ridge, a door and two windows a floor. face is +1 when the front looks towards -z.
function home(g, x, z, face, k) { const w = 7.3, d = 7, h = 4.9, fz = z - face * (d / 2 + 0.03);
  B(g, x, z, w, d, 0, h, WALL[k % 4]); B(g, x, z, w + 0.5, d + 0.9, h, 0.55, ROOF[k % 4]); B(g, x, z, w + 0.5, d * 0.45, h + 0.55, 0.5, ROOF[k % 4]);
  B(g, x + 2.2, fz, 1.25, 0.08, 0, 2.5, ['#7a5a33', '#3f78b5', '#c8643f', '#2e9b5a'][(k + 1) % 4], NO);
  for (const [a, y] of [[-1.6, 0.9], [0.4, 0.9], [-1.6, 3.0], [0.4, 3.0], [2.2, 3.0]]) B(g, x + a, fz, 1.2, 0.06, y, 1.25, '#a9d3ee', { unlit: true, shadow: false }); }
function tree(g, x, z, k = 1, op) { B(g, x, z, 0.4 * k, 0.4 * k, 0, 4.6 * k, '#8a6a44'); const c = LEAF[Math.floor(hash(x, z) * 3)]; B(g, x, z, 2.8 * k, 2.8 * k, 4.4 * k, 2.3 * k, c, { op }); B(g, x + 0.1, z - 0.1, 1.8 * k, 1.8 * k, 6.7 * k, 1.2 * k, c, { op }); }
const lamp = (g, x, z) => { B(g, x, z, 0.18, 0.18, 0, 4.4, '#2b3a55'); B(g, x, z, 0.55, 0.55, 4.4, 0.45, '#ffe9a0', { unlit: true, raw: true }); };
function rider(g, x, z, c, dir) { const p = group(g, x, 0, z); p.rotation.y = dir; for (const a of [-0.55, 0.55]) blk(p, a, 0, 0.7, 0.1, 0, 0.7, '#2a2a2a', { mat: M('#3a3a3a', x) }); blk(p, 0, 0, 1.1, 0.1, 0.5, 0.12, c, { mat: M(c, x) }); blk(p, 0.5, 0, 0.1, 0.6, 1.05, 0.08, '#2a2a2a', { mat: M('#3a3a3a', x) }); fig(p, -0.1, 0.5, 0, { k: 1.05, shirt: c, sit: true, arms: ['fwd', 'fwd'], turn: Math.PI / 2, cap: '#e0a23a' }); }
function street(g) {
  // ground: large quiet planes of grass, and one wide pale path to the school
  for (let x = -96; x <= 24; x += 8) for (let z = -40; z <= 40; z += 8) B(g, x + 4, z + 4, 8, 8, -1.6, 1.6, GRASS[Math.floor(hash(x, z) * 3)]);
  B(g, -36, 0, 120, 5.2, 0, 0.06, '#f3e9d2', NO); for (const z of [-2.75, 2.75]) B(g, -36, z, 120, 0.3, 0, 0.1, '#d9cdb2', NO); for (let x = -92; x < 22; x += 4) B(g, x, 0, 0.12, 5.2, 0.06, 0.02, '#e2d6bb', NO);
  for (const s of [-1, 1]) B(g, -36, s * 8.3, 120, 1.5, 0, 0.05, '#efe4cb', NO);
  // a line of low homes on each side, running to one point
  for (let k = 0; k < 13; k++) { const x = 14 - k * 7.6; if (x < 9.5) home(g, x, 12.7, 1, k); if (x < -5) home(g, x, -12.7, -1, k + 2); }
  // the repeated shapes that lead the eye: a tree and a lamp, again and again, on both sides of the path
  for (let k = 0; k < 9; k++) { const x = -5 - k * 7.6; for (const s of [-1, 1]) { tree(g, x, s * 6.3, 1, k === 0 ? 0.78 : undefined); lamp(g, x - 3.8, s * 3.4); } }
  // the school at the end of the path: yellow, with a red roof and a flag, flat in the distance
  { const x = -78; B(g, x, 0, 6, 16, 0, 6, '#ffd76a'); B(g, x, 0, 6.6, 17, 6, 1, '#c8643f'); B(g, x, 0, 6.6, 9, 7, 0.9, '#c8643f'); B(g, x, 0, 2.4, 2.4, 7.9, 4, '#ffd76a'); B(g, x, 0, 3, 3, 11.9, 0.6, '#c8643f'); B(g, x + 3.1, 0, 0.1, 2.4, 0, 3, '#7a5a33', NO); B(g, x + 3.4, 6.4, 0.16, 0.16, 0, 9, '#fbfbf7'); B(g, x + 3.4, 7.4, 0.1, 1.8, 7.6, 1.2, '#e0503a', { raw: true, unlit: true }); }
  for (const [z, w, hh] of [[-36, 30, 9], [-8, 34, 13], [22, 30, 10]]) for (let q = 0; q < 3; q++) B(g, -110, z, 8, w * (1 - q * 0.26), q * hh / 3, hh / 3, ['#a9c6a0', '#b9cdb8', '#cdd8d0'][q], NO);
  for (const [y, z] of [[26, -16], [30, 14]]) { B(g, -108, z, 2, 12, y, 2, '#ffffff', { raw: true, unlit: true }); B(g, -108, z + 2, 2, 6, y + 2, 1.5, '#ffffff', { raw: true, unlit: true }); } B(g, -112, 30, 1, 8, 27, 8, '#ffe07a', { raw: true, unlit: true });
  // people going to school along the path, further and further away: walkers and people on cycles, never cars
  const SH = ['#3f78b5', '#8a5fc2', '#2e9b5a', '#e0a23a', '#16a3a3', '#c98a5a'];
  for (let k = 0; k < 9; k++) { const x = -7 - k * 6.2, z = (k % 2 ? -1 : 1) * (0.9 + hash(k, 2) * 0.7), c = SH[k % 6]; if (k % 3 === 1) { rider(g, x, z, c, Math.PI); continue; }
    fig(g, x, 0.06, z, { k: 1.5, shirt: c, skin: SKIN[k % 4], hair: HAIR[k % 5], turn: -Math.PI / 2, step: 0.12, long: k % 2 === 0 }); fig(g, x + 0.2, 0.06, z + (z > 0 ? -1 : 1) * 0.9, { k: 1.05, shirt: SH[(k + 2) % 6], skin: SKIN[k % 4], hair: HAIR[(k + 1) % 5], pack: SH[(k + 4) % 6], turn: -Math.PI / 2, step: -0.1 }); }
  // the family in front, where car town has the friend's car: the child with a red top between mum and dad, turned towards us
  fig(g, 1.3, 0.06, 1.7, { k: 1.25, shirt: '#e0503a', legs: '#2b3a55', skin: SKIN[0], hair: HAIR[1], cap: '#3f78b5', pack: '#ffd257', turn: 1.0, arms: ['up', 'down'], head: 0.2 });
  fig(g, 0.2, 0.06, 0.4, { k: 1.62, shirt: '#8a5fc2', legs: '#2b3a55', skin: SKIN[3], hair: HAIR[4], long: true, turn: 0.8, head: 0.3 }); fig(g, 0.5, 0.06, 3.0, { k: 1.68, shirt: '#2e9b5a', legs: '#4a556e', skin: SKIN[0], hair: HAIR[0], turn: 1.3, head: -0.3, arms: ['down', 'up'] });
  // see-through layers near the camera, as car town has: a hedge along the near edge, and leaves overhead
  for (const [x, z, w, d, h] of [[3.4, -4.0, 2.4, 2.2, 1.1], [2.0, -5.2, 2.6, 2.4, 1.6], [4.6, -5.6, 2.2, 2.2, 1.9], [0.4, -4.4, 2, 2, 0.8], [3.4, 6.6, 2.6, 2.4, 1.2], [1.6, 7.4, 2.2, 2, 0.8]]) B(g, x, z, w, d, 0, h, LEAF[Math.floor(hash(x, z) * 3)], { op: 0.78 });
  B(g, 4.5, -8.5, 4.6, 4.2, 6.2, 3, LEAF[1], { op: 0.78 }); B(g, 3.4, -7.6, 3, 2.8, 9.2, 1.8, LEAF[0], { op: 0.78 }); B(g, 4.5, -8.5, 0.5, 0.5, 0, 6.2, '#8a6a44');
  // pale see-through sheets across the street in place of fog, tinted like clean distance
  [-22, -36, -50, -64].forEach((x, k) => blk(g, x, 0, 0.1, 100, 0, 46, '#e3f0f6', { shadow: false, mat: soft('#e3f0f6', [0.14, 0.18, 0.22, 0.26][k]) }));
}
export function show() { const st = film.dbg, cam = st.camera, r = st.renderer, sz = r.getSize(new THREE.Vector2()), k = sz.x / W;
  document.head.insertAdjacentHTML('beforeend', '<style>.stage > .ui, .stage > canvas.fx { visibility: hidden; }</style>');
  const n = st.newScene(44); n.light(0.12); n.scene.background.set('#cfe6f2'); street(group(n.scene));
  cam.clearViewOffset(); cam.fov = 40; cam.aspect = VW / VH; cam.updateProjectionMatrix(); cam.position.set(11.5, 4.8, 6.4); cam.lookAt(-10, 1.9, 0.2); cam.updateMatrixWorld();
  r.setScissorTest(true); r.setViewport(0, sz.y - VH * k, VW * k, VH * k); r.setScissor(0, sz.y - VH * k, VW * k, VH * k); r.render(n.scene, cam); r.setScissorTest(false); r.setViewport(0, 0, sz.x, sz.y); cam.aspect = W / H; cam.fov = 26; cam.updateProjectionMatrix(); return 'eco-C'; }
