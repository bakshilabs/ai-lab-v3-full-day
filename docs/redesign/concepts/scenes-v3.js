// Third version of the seven play-break concept screens (owner, 22-23 Nov 2026), in the town and look of the test picture
// alt-style/pictures-5/eco-C.jpg: one street of low homes with plain walls that runs to the school, far things flat and
// unlit, pale see-through sheets in the distance in place of fog, a close palette with a few bright accents, a pale blue
// sunny sky, and see-through leaves near the camera. The owner said "do not keep its present design", so:
//   * Land, Getting around (the path), the walk to school, Homes and Power are designed afresh in the new street;
//   * Food and A school for everyone keep their activity (the owner liked the farm idea, and the school was the strongest
//     screen) and are re-coloured in the new look.
// scenes-v2.js and every earlier attempt are left as they are. These are proposals; the words on them are placeholders.
import { THREE, blk, group, hash, soft, fig, SKIN, HAIR, place, frame, W, H, css, I, top, row, tok, sws, mouse, band, plate } from './kit-v2.js';
import { farm, control, school } from './rooms-v2.js';
import { walk } from './walk-v2.js';
import * as V2 from './scenes-v2.js';
const SKY = '#cfe6f2', SHEET = '#e3f0f6', NO = { shadow: false };
const c0 = new THREE.Color(), hsl = {};
const toneC = (c, sat = 0.74, sq = 0.7) => { c.getHSL(hsl, THREE.SRGBColorSpace); return c.setHSL(hsl.h, hsl.s * sat, 0.66 + (hsl.l - 0.66) * sq, THREE.SRGBColorSpace); };
const tone = (hex) => '#' + toneC(c0.set(hex)).getHexString();
// colours that stay as they are: the child's red top and other reds used as accents, the yellow places and their dashes, faces, white
const KEEP = new Set(['e0503a', 'ffdf3d', 'ffd257', 'ffb400', '1f2a44', 'f1c9a0', 'c98d5e', '8a5a3c', 'f6d7b8', 'f3a593', 'c23a4a', 'ffffff', 'e8402f', 'e02a4a', 'ffe27a', 'fff0a0']);
// ---- the colouring, applied to a finished scene just before it is drawn ------------------------------------------------
const OUT = { sheets: [46, 60, 78, 100], op: [0.12, 0.16, 0.2, 0.24], far: 52, flat: true };
function treat(scene, cam) { if (scene.userData.done) return; scene.userData.done = true; const C = scene.userData.cfg || OUT; if (C.skip) return;
  const cache = new Map(), p = new THREE.Vector3(), fwd = cam.getWorldDirection(new THREE.Vector3()); scene.updateMatrixWorld(true); if (scene.background && scene.background.isColor && !C.keepSky) scene.background.set(SKY);
  scene.traverse((o) => { if (o.isHemisphereLight) o.intensity *= 0.96; if (o.isDirectionalLight) o.intensity *= 0.9; if (!o.isMesh || !o.material.color || o.material.map) return; const m = o.material, hex = m.color.getHexString(), basic = m.isMeshBasicMaterial;
    const dist = o.getWorldPosition(p).sub(cam.position).dot(fwd), unlit = basic || dist > C.far, keep = KEEP.has(hex) || (basic && !C.flat), key = hex + (unlit ? 'u' : 'l') + (m.transparent ? m.opacity : '') + (m.fog === false ? 'n' : '');
    if (!cache.has(key)) { const col = m.color.clone(); if (!keep) toneC(col); const n = unlit ? new THREE.MeshBasicMaterial({ color: col }) : new THREE.MeshLambertMaterial({ color: col }); if (m.transparent) { n.transparent = true; n.opacity = m.opacity; n.depthWrite = m.depthWrite; } cache.set(key, n); }
    o.material = cache.get(key); });
  (C.sheets || []).forEach((d, k) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), soft(SHEET, C.op[k])); s.position.copy(cam.position).addScaledVector(fwd, d); s.quaternion.copy(cam.quaternion); scene.add(s); }); }

// ---- the street: every screen out of doors is this one street at a different moment --------------------------------------
const mats = new Map(), FARX = -30, M = (hex, x, o = {}) => { const unlit = o.unlit || x < FARX, col = o.raw ? hex : tone(hex), k = col + (unlit ? 'u' : 'l') + (o.op || ''); if (!mats.has(k)) { const m = unlit ? new THREE.MeshBasicMaterial({ color: col }) : new THREE.MeshLambertMaterial({ color: col }); if (o.op) { m.transparent = true; m.opacity = o.op; m.depthWrite = false; } mats.set(k, m); } return mats.get(k); };
const B = (g, x, z, w, d, y, h, hex, o = {}) => blk(g, x, z, w, d, y, h, hex, { shadow: o.shadow !== false && !o.op, mat: M(hex, x, o) });
const WALL = ['#ecd9b4', '#e4cfa6', '#f0e0c0', '#dcc69c'], ROOF = ['#c8643f', '#3f78b5', '#2e9b5a', '#e0a23a'], LEAF = ['#77c765', '#84d072', '#6cbd5b'], GRASS = ['#8fcf73', '#93d277', '#8bcb6f'], DOOR = ['#7a5a33', '#3f78b5', '#c8643f', '#2e9b5a'];
const LX = (k) => 14 - k * 7.6, LZ = 11.4, RZ = -12.7;
// a low home: one plain wall, a roof of two slabs, a door and five windows. face is +1 when the front looks towards -z.
// win is 'day', 'lit' or 'dark' (the last two are for the evening).
function home(g, x, z, face, k, win = 'day', o = {}) { const w = 7.3, d = 7, h = 4.9, fz = z - face * (d / 2 + 0.03), wc = win === 'lit' ? '#ffe27a' : win === 'dark' ? '#56627e' : '#a9d3ee';
  B(g, x, z, w, d, 0, h, WALL[k % 4]); if (o.roof !== false) { const rc = o.roofC || ROOF[k % 4]; B(g, x, z, w + 0.5, d + 0.9, h, 0.55, rc); B(g, x, z, w + 0.5, d * 0.45, h + 0.55, 0.5, rc); }
  B(g, x + 2.2, fz, 1.25, 0.08, 0, 2.5, DOOR[(k + 1) % 4], NO); for (const [a, y] of [[-1.6, 0.9], [0.4, 0.9], [-1.6, 3.0], [0.4, 3.0], [2.2, 3.0]]) B(g, x + a, fz, 1.2, 0.06, y, 1.25, wc, { unlit: true, raw: win !== 'day', shadow: false }); }
// leaves are flat and unlit, so that they stay a fresh green on their shaded side
function tree(g, x, z, k = 1, op) { B(g, x, z, 0.4 * k, 0.4 * k, 0, 4.6 * k, '#8a6a44'); B(g, x, z, 2.8 * k, 2.8 * k, 4.4 * k, 2.3 * k, LEAF[Math.floor(hash(x, z) * 3)], { op, unlit: true, raw: true }); B(g, x + 0.1, z - 0.1, 1.8 * k, 1.8 * k, 6.7 * k, 1.2 * k, LEAF[1], { op, unlit: true, raw: true }); }
const lamp = (g, x, z) => { B(g, x, z, 0.18, 0.18, 0, 4.4, '#2b3a55'); B(g, x, z, 0.55, 0.55, 4.4, 0.45, '#ffe9a0', { unlit: true, raw: true }); };
function rider(g, x, z, c) { const p = group(g, x, 0, z); p.rotation.y = Math.PI; for (const a of [-0.55, 0.55]) blk(p, a, 0, 0.7, 0.1, 0, 0.7, '#2a2a2a', { mat: M('#3a3a3a', x) }); blk(p, 0, 0, 1.1, 0.1, 0.5, 0.12, c, { mat: M(c, x) }); blk(p, 0.5, 0, 0.1, 0.6, 1.05, 0.08, '#2a2a2a', { mat: M('#3a3a3a', x) }); fig(p, -0.1, 0.5, 0, { k: 1.05, shirt: c, sit: true, arms: ['fwd', 'fwd'], turn: Math.PI / 2, cap: '#e0a23a' }); }
const SH = ['#3f78b5', '#8a5fc2', '#2e9b5a', '#e0a23a', '#16a3a3', '#c98a5a'];
const fam = (g, x, z, t, o = {}) => { const s = o.s || 0; fig(g, x, 0.06, z, { k: 1.25, shirt: o.kid || '#e0503a', legs: '#2b3a55', skin: SKIN[s], hair: HAIR[(s + 1) % 5], cap: o.cap || '#3f78b5', pack: '#ffd257', turn: t, arms: o.arms || ['up', 'down'] });
  fig(g, x - Math.sin(t) * 0.9 + Math.cos(t) * 1.3, 0.06, z - Math.cos(t) * 0.9 - Math.sin(t) * 1.3, { k: 1.62, shirt: o.mum || '#8a5fc2', legs: '#2b3a55', skin: SKIN[s ? s : 3], hair: HAIR[4 - s], long: true, turn: t - 0.2 }); fig(g, x - Math.sin(t) * 0.9 - Math.cos(t) * 1.3, 0.06, z - Math.cos(t) * 0.9 + Math.sin(t) * 1.3, { k: 1.68, shirt: o.dad || '#2e9b5a', legs: '#4a556e', skin: SKIN[s], hair: HAIR[s], turn: t + 0.3, arms: ['down', o.wave ? 'up' : 'down'] }); };
// The light is made soft, so that shaded walls stay pale.
function street(g, o = {}) { g.parent.userData.cfg = { skip: true }; g.parent.traverse((l) => { if (l.isHemisphereLight) { l.intensity *= 1.3; l.groundColor.set('#d9cfb8'); } if (l.isDirectionalLight) l.intensity *= 0.62; });
  const ev = o.evening, win = (side, k) => (ev ? ((o.dark || []).includes(side + k) ? 'dark' : 'lit') : 'day');
  for (let x = -96; x <= 24; x += 8) for (let z = -40; z <= 40; z += 8) B(g, x + 4, z + 4, 8, 8, -1.6, 1.6, GRASS[Math.floor(hash(x, z) * 3)]);
  // the path: laid all the way, or only as far as pathTo; before any path there is a worn track
  const p0 = o.pathTo ?? -92, len = 22 - p0, cx = (22 + p0) / 2; B(g, -36, 0, 120, 3.6, 0, 0.04, '#cfc79f', NO);
  if (o.path !== false) { B(g, cx, 0, len, 5.2, 0, 0.07, '#f3e9d2', NO); for (const z of [-2.75, 2.75]) B(g, cx, z, len, 0.3, 0, 0.11, '#d9cdb2', NO); for (let x = p0 + 2; x < 22; x += 4) B(g, x, 0, 0.12, 5.2, 0.07, 0.02, '#e2d6bb', NO); }
  if (o.stream) { B(g, -15, 0, 4.4, 90, 0.02, 0.07, '#7cc4ea', { raw: true, unlit: true, shadow: false }); for (const x of [-17.5, -12.5]) B(g, x, 0, 0.7, 90, 0, 0.16, '#cfc79f', NO); for (const [x, z] of [[-17.9, 5.5], [-12.2, -5.2], [-17.8, -8.4]]) for (const a of [-0.2, 0.2]) B(g, x, z + a, 0.14, 0.14, 0, 0.9, '#7fbf6a', NO); }
  for (const k of o.L || []) home(g, LX(k), LZ, 1, k, win('L', k), (o.opt || {})['L' + k]); for (const k of o.R || []) home(g, LX(k), RZ, -1, k + 2, win('R', k), (o.opt || {})['R' + k]);
  if (o.trees !== false) for (let k = 0; k < 7; k++) { const x = -13 - k * 7.6; if (o.stream && Math.abs(x + 15) < 4.5) continue; for (const s of [-1, 1]) { tree(g, x, s * 6.3, 1); lamp(g, x - 3.8, s * 3.4); } }
  // the school at the end of the street: the goal of every view. Large, yellow, with a red roof, a bell tower and a flag.
  { const x = -62, U = { raw: true, unlit: true }; B(g, x, 0, 6, 22, 0, 7.5, ev ? '#e9c98a' : '#ffd76a', U); B(g, x, 0, 6.6, 23, 7.5, 1.2, '#d2553a', U); B(g, x, 0, 6.6, 12, 8.7, 1.1, '#d2553a', U); B(g, x, 0, 3, 3, 9.8, 4.4, ev ? '#e9c98a' : '#ffd76a', U); B(g, x, 0, 3.8, 3.8, 14.2, 0.8, '#d2553a', U);
    B(g, x + 3.1, 0, 0.1, 2.8, 0, 3.6, '#7a5a33', { unlit: true, shadow: false }); for (const z of [-7, -4, 4, 7]) B(g, x + 3.1, z, 0.1, 1.8, 2.4, 2, ev ? '#ffe27a' : '#a9d3ee', { unlit: true, raw: !!ev, shadow: false }); B(g, x + 3.6, 9, 0.2, 0.2, 0, 12, '#fbfbf7', U); B(g, x + 3.6, 10.4, 0.1, 2.6, 10, 1.7, '#e0503a', U); }
  for (const [z, w, hh] of [[-36, 30, 9], [22, 30, 10]]) for (let q = 0; q < 3; q++) B(g, -110, z, 8, w * (1 - q * 0.26), q * hh / 3, hh / 3, ['#a9c6a0', '#b9cdb8', '#cdd8d0'][q], NO);
  if (!ev) for (const [y, z] of [[30, -18], [33, 16]]) { B(g, -108, z, 2, 12, y, 2, '#ffffff', { raw: true, unlit: true }); B(g, -108, z + 2, 2, 6, y + 2, 1.5, '#ffffff', { raw: true, unlit: true }); }
  // people going along both edges of the path, so that the school stays in view between them; never cars
  for (let k = 0; k < (o.walkers ?? 0); k++) { const x = (o.from ?? -15) - k * 5.4, z = (k % 2 ? -1 : 1) * 1.7, c = SH[k % 6]; if (k % 3 === 1) { rider(g, x, z, c); continue; }
    fig(g, x, 0.06, z, { k: 1.5, shirt: c, skin: SKIN[k % 4], hair: HAIR[k % 5], turn: -Math.PI / 2, step: 0.12, long: k % 2 === 0 }); fig(g, x + 0.2, 0.06, z + (z > 0 ? 0.8 : -0.8), { k: 1.05, shirt: SH[(k + 2) % 6], skin: SKIN[k % 4], hair: HAIR[(k + 1) % 5], pack: SH[(k + 4) % 6], turn: -Math.PI / 2, step: -0.1 }); }
  // see-through leaves near the camera that hang over the homes and blend with them
  for (const [x, z] of o.near || []) { B(g, x, z, 5.6, 4.6, 5.4, 3, LEAF[0], { op: 0.8, unlit: true, raw: true }); B(g, x + 1, z - 0.4, 3.4, 3, 8.4, 1.8, LEAF[1], { op: 0.8, unlit: true, raw: true }); B(g, x, z, 0.5, 0.5, 0, 5.4, '#8a6a44'); }
  [-22, -36, -50].forEach((x, k) => blk(g, x, 0, 0.1, 100, 0, 50, ev ? '#f6dcc0' : SHEET, { shadow: false, mat: soft(ev ? '#f6dcc0' : SHEET, [0.12, 0.15, 0.18][k]) })); }
const CAM = { half: 44, fov: 31, eye: [15, 5.4, 2.6], at: [-12, 2.6, 0.4], bg: SKY, night: 0.1 };   // down the middle of the street, among the people
const houses = (n, of) => row([...Array(of)].map((_, k) => I.home(ROOF[k % 4])), n);

// 1. Land: the street is empty land beside a track. Two families wait with their cases; the child gives each one a home.
function land(g) { street(g, { path: false, trees: false, L: [1, 2], R: [1], near: [[6.5, 9.2]], opt: { L2: { roofC: ROOF[1] } } });
  for (const k of [3, 4, 5]) place(g, LX(k), LZ, 6.9, 6.6, 0.05); for (const k of [2, 3, 4, 5]) place(g, LX(k), RZ, 6.9, 6.6, 0.05);
  { const k = 3, t = group(g, 0, 1.6, 0); home(t, LX(k), RZ, -1, 4, 'day', { roofC: ROOF[2] }); }                         // the home under the mouse
  tree(g, -30, 6, 1); tree(g, -38, -6.4, 1); tree(g, -46, 6.2, 1);
  fam(g, 3.4, 2.6, 1.9, { wave: true }); fam(g, 0.2, -2.2, 1.2, { s: 1, kid: '#ffd257', mum: '#16a3a3', dad: '#c98a5a', cap: '#e0503a' });
  for (const [x, z, c] of [[5.4, 4.6, '#b5553a'], [4.6, 0.6, '#c9925a'], [1.6, -4.4, '#3f78b5'], [2.6, -0.4, '#c9925a']]) { B(g, x, z, 0.9, 0.6, 0, 0.8, c); B(g, x, z, 0.95, 0.12, 0.8, 0.14, '#7a5a33'); }
  fig(g, LX(1) + 1, 0.06, RZ + 5.4, { k: 1.6, shirt: '#3f78b5', skin: SKIN[2], hair: HAIR[3], arms: ['up', 'down'], turn: 1.2 });       // a neighbour who has moved in
  return { ghost: [LX(3) + 1, 4.6, RZ + 3.6], wait: [2, 3.8, 0] }; }
// 2. Getting around: the path is laid as far as the stream. The school is on the other side: one bridge, two places for it.
function paths(g) { street(g, { pathTo: -11.6, stream: true, L: [1, 2, 3, 4, 5, 6], R: [1, 2, 3, 4, 5, 6], near: [[6.5, 9.2]], walkers: 0 });
  B(g, -40, 0, 44, 5.2, 0, 0.07, '#f3e9d2', NO);                                                 // the path beyond the stream, already there
  place(g, -15, 0, 5.6, 5, 0.12); place(g, -15, -5.6, 5.6, 3.6, 0.12);
  { const b = group(g, -15.6, 3.4, 2.2); for (let k = 0; k < 6; k++) { const a = Math.sin((k + 0.5) / 6 * Math.PI) * 0.5; B(b, -2.5 + k, 0, 1.03, 4.6, a, 0.3, '#c9925a'); for (const s of [-1, 1]) { B(b, -2.5 + k, s * 2.2, 0.16, 0.16, a + 0.3, 0.9, '#7a5a33'); B(b, -2.5 + k, s * 2.2, 1.03, 0.12, a + 1.1, 0.14, '#7a5a33'); } } }
  fam(g, -8.6, 0.6, 1.4, { wave: true }); fig(g, -9.4, 0.06, -1.8, { k: 1.5, shirt: SH[0], skin: SKIN[2], hair: HAIR[3], turn: -Math.PI / 2 }); fig(g, -8.2, 0.06, -1.9, { k: 1.05, shirt: SH[3], skin: SKIN[2], hair: HAIR[0], pack: '#e0503a', turn: -Math.PI / 2 });
  rider(g, -3, 1.8, SH[4]);
  fig(g, -21, 0.06, 1.2, { k: 1.6, shirt: '#16a3a3', skin: SKIN[1], hair: HAIR[3], long: true, arms: ['up', 'down'], turn: Math.PI / 2 });   // the teacher waves from the far bank
  return { br: [-14.4, 4.6, 2.6], school: [-62, 9, -9], fam: [-8.6, 3.4, 0.6] }; }
// 3. The walk to school, Eco Town half: the finished street, with the junction and the family reading their map.
function walkStreet(g) { street(g, { L: [1, 2, 4, 5, 6, 7], R: [3, 4, 5, 6, 7, 8], near: [[4.8, 8.6]], walkers: 8 }); B(g, -6, 9, 3.6, 13, 0, 0.07, '#f3e9d2', NO); lamp(g, -1.2, -3.4); tree(g, -2.4, -6.3, 1, 0.8);
  fig(g, 1.3, 0.06, 1.2, { k: 1.25, shirt: '#e0503a', legs: '#2b3a55', skin: SKIN[0], hair: HAIR[1], cap: '#3f78b5', pack: '#ffd257', turn: 1.0, arms: ['up', 'down'], head: 0.2 });
  fig(g, 0.2, 0.06, -0.1, { k: 1.62, shirt: '#8a5fc2', legs: '#2b3a55', skin: SKIN[3], hair: HAIR[4], long: true, turn: 0.8, head: 0.3 }); fig(g, 0.5, 0.06, 2.5, { k: 1.68, shirt: '#2e9b5a', legs: '#4a556e', skin: SKIN[0], hair: HAIR[0], turn: 1.3, head: -0.3, arms: ['down', 'up'] });
  place(g, -12, 0, 2.6, 2.6, 0.12); place(g, -6, 6.4, 2.6, 2.6, 0.12); return { me: [1.3, 2.4, 1.2], up: [-12, 0.3, 0], left: [-6, 0.3, 6.4] }; }
// 4. Homes: one home is built on its plot in the street, large in the frame, while the family it is for looks on.
function build(g) { street(g, { L: [], R: [], trees: false, walkers: 0 }); const U = { unlit: true, shadow: false };
  B(g, 0, -4, 12.4, 9, 0, 0.3, '#d9d2c2'); B(g, 0, -4, 11.6, 8.2, 0.3, 5.6, WALL[0]); B(g, 0, -4, 11.7, 8.3, 5.5, 0.4, '#ffe27a', { raw: true });                     // thick walls with a warm layer on top
  B(g, 2.9, 0.12, 1.7, 0.1, 0.3, 3.1, '#5a4630', NO);                                              // the doorway, waiting for its door
  for (const [x, y] of [[-3.6, 1.2], [-0.4, 1.2], [-3.6, 3.7], [2.9, 3.9]]) frame(g, x, y, 0.2, 1.9, 1.7, true);            // four yellow places for two windows
  { const w = group(g, -0.9, 2.6, 2.6); blk(w, 0, 0, 2, 0.22, 0, 1.8, '#fbfbf7', { mat: M('#fbfbf7', 0, { raw: true }) }); blk(w, 0, 0.05, 1.7, 0.2, 0.15, 1.5, '#a9d3ee', { shadow: false, mat: M('#a9d3ee', 0, U) }); blk(w, 0, 0.1, 0.1, 0.2, 0.15, 1.5, '#fbfbf7', { shadow: false, mat: M('#fbfbf7', 0, { raw: true }) }); }
  { const r = group(g, 0, 7.6, -4); blk(r, 0, 0, 12.6, 9.6, 0, 0.6, ROOF[2], { mat: M(ROOF[2], 0) }); blk(r, 0, 0, 12.6, 4.4, 0.6, 0.55, ROOF[2], { mat: M(ROOF[2], 0) }); for (const x of [-5, 5]) blk(r, x, 0, 0.08, 0.08, 1.1, 5, '#2b3a55', { shadow: false }); }     // the roof waits on its ropes
  home(g, -12.6, -4.4, -1, 1); home(g, 12.6, -4.4, -1, 3);                                         // the neighbours' finished homes
  tree(g, -8.6, -12, 1.2); tree(g, 9, -12.4, 1.2); tree(g, 19.4, 1.4, 1, 0.8);
  fam(g, 7.6, 5.2, -0.9, { arms: ['up', 'down'], wave: true }); fig(g, -6.4, 0.06, 3.4, { k: 1.65, shirt: '#e0a23a', legs: '#3f78b5', skin: SKIN[1], hair: HAIR[3], hat: '#ffd257', arms: ['up', 'down'], turn: 0.5 });
  { const c = group(g, -8.6, 0, 6.2); blk(c, 0, 0, 3.2, 1.7, 0.5, 0.2, '#c9925a', { mat: M('#c9925a', 0) }); for (const a of [-1.1, 1.1]) blk(c, a, 0.9, 0.9, 0.2, 0, 0.9, '#2a2a2a', { mat: M('#3a3a3a', 0) }); blk(c, 0.3, 0, 0.2, 1.4, 0.7, 2.6, DOOR[1], { mat: M(DOOR[1], 0) }); blk(c, -0.4, 0, 0.2, 1.4, 0.7, 1.7, '#fbfbf7', { mat: M('#fbfbf7', 0, { raw: true }) }); blk(c, -0.3, 0.02, 0.1, 1.2, 0.85, 1.4, '#a9d3ee', { shadow: false, mat: M('#a9d3ee', 0, U) }); }
  return { win: [-0.4, 3.3, 2.8], fam: [7.6, 3.6, 5.2] }; }
// 6. Power: the control room, with the new street outside the window in the evening.
const eveningStreet = (g) => { street(g, { evening: true, L: [1, 2, 3, 4, 5, 6], R: [3, 4, 5, 6, 7], dark: ['L3', 'R5'], walkers: 0 }); for (const [x, z] of [[-40, 24], [-52, -26], [-64, 30]]) { B(g, x, z, 0.7, 0.7, 0, 18, '#fbfbf7', { raw: true, unlit: true }); for (let i = 0; i < 3; i++) { const b = group(g, x + 0.5, 18, z); b.rotation.x = i * 2.094 + 0.4; blk(b, 0, 0, 0.3, 0.9, 0.4, 8, '#fbfbf7', { shadow: false, mat: M('#fbfbf7', x, { raw: true, unlit: true }) }); } } B(g, -100, -14, 1, 9, 5, 9, '#ff9a2e', { raw: true, unlit: true }); };

// ---- the seven scenes ------------------------------------------------------------------------------------------------------
const cfgOf = (room, cfg) => (g, view) => { g.parent.userData.cfg = cfg; return room(g, view); };
const V = V2.SCENES, car = walk.split[1];
const D = 'stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"', L2 = 'stroke="#8a93a8" stroke-width="2.5" stroke-dasharray="6 5" stroke-linejoin="round"';
const dia = `<div class="diagram"><svg viewBox="0 0 220 150"><path d="M30 52L110 12l80 40z" fill="#efe6d2" ${L2}/><rect x="42" y="62" width="136" height="70" fill="#ecd9b4" ${D}/><rect x="42" y="62" width="136" height="9" fill="#ffe27a" ${D}/><rect x="140" y="92" width="24" height="40" fill="#efe6d2" ${L2}/>
  <rect x="56" y="78" width="24" height="20" fill="#ffd257" stroke="#1f2a44" stroke-width="4"/><rect x="96" y="78" width="24" height="20" fill="#ffd257" stroke="#1f2a44" stroke-width="4"/><rect x="56" y="106" width="24" height="20" fill="#ffd257" stroke="#1f2a44" stroke-width="4"/><rect x="96" y="106" width="24" height="20" fill="#ffd257" stroke="#1f2a44" stroke-width="4"/><rect x="34" y="134" width="152" height="10" fill="#bdbcb6" ${D}/></svg></div>`;
export const SCENES = [
  { id: 'land', split: [{ ...CAM, room: land }],
    html: (p) => top('Land', 'Give everyone a home', houses(3, 6)) + mouse(p.ghost[0], p.ghost[1]) + plate(p.wait, 'Two families are waiting', 'tip', 0, -6)
      + band('Two families need a home. Drag a home to a yellow place.', `<div class="grp">${tok(I.home(ROOF[2]), 'Home', 'on', '3 left')}<h4>Roof colour</h4>${sws(ROOF, 2)}</div>` + tok(I.tree(), 'Park', '', '1 left')) },
  { id: 'paths', split: [{ ...CAM, room: paths }],
    html: (p) => top('Getting around', 'Finish the way to school') + mouse(p.br[0], p.br[1]) + plate(p.school, 'School', 'tip', 0, 0) + plate(p.fam, 'Your family', 'on tip', 0, -4)
      + band('The school is across the stream. Drag the bridge to a yellow place.', tok(I.path(), 'Path', 'used', 'Laid') + tok(I.bridge(), 'Bridge', 'on', '1 left') + tok(I.tree(), 'Tree', '', '4 left')) },
  { ...walk, id: 'walk', split: [{ room: walkStreet, half: 44, fov: 40, eye: [11.5, 4.8, 6.4], at: [-10, 2.2, 1.0], bg: SKY, night: 0.1 }, { ...car, room: cfgOf(car.room, { skip: true }) }] },
  { id: 'homes', split: [{ half: 44, fov: 30, eye: [5.5, 4.4, 24], at: [1.2, 4.2, -2], bg: SKY, night: 0.1, room: build }],
    html: (p) => top('Homes', 'Build a home') + mouse(p.win[0], p.win[1]) + plate(p.fam, 'Your family', 'on tip', 0, -6)
      + band('You have two windows. Drag each one to a yellow place.', dia + `<div class="grp">${tok(I.win(), 'Window', 'on', '2 left')}${tok(I.roof(ROOF[2]), 'Roof', '', '1 left')}${tok(I.door(DOOR[1]), 'Door', '', '1 left')}</div><div class="grp"><h4>Door colour</h4>${sws(DOOR.slice(0, 2), 1)}${sws(DOOR.slice(2), 9)}</div>`) },
  { id: 'food', band: 226, split: [{ ...V[4].split[0], room: cfgOf(farm.room, { sheets: [34], op: [0.3], far: 32 }) }], html: farm.html },
  { id: 'power', band: 226, view: eveningStreet, split: [{ ...V[5].split[0], room: cfgOf(control.room, { sheets: [], op: [], far: 99 }) }], html: control.html },
  { id: 'school', band: 226, split: [{ ...V[6].split[0], room: cfgOf(school.room, { sheets: [38], op: [0.22], far: 36 }) }], html: school.html },
];
let ui = null;
export function show(i) { const s = SCENES[i], st = film.dbg, cam = st.camera, r = st.renderer, bandH = 226; film.seek(film.segs[1].start + 1);
  const sz = r.getSize(new THREE.Vector2()), nv = s.split.length, vw = sz.x / nv, vh = sz.y * (1 - bandH / H), p = {}; cam.clearViewOffset(); r.setScissorTest(false); r.setViewport(0, 0, sz.x, sz.y); let view = null;
  if (s.view) { const n = st.newScene(44); n.light(0.45); n.scene.background.set('#f7cfa2'); s.view(group(n.scene)); cam.fov = 40; cam.aspect = W / H; cam.updateProjectionMatrix(); cam.position.set(13, 5.2, 5); cam.lookAt(-12, 4.4, 0.6); cam.updateMatrixWorld(); r.render(n.scene, cam);
    const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(r.domElement, 0, 0, W, H); view = new THREE.CanvasTexture(c); view.colorSpace = THREE.SRGBColorSpace; }
  r.setClearColor('#fffaf0'); r.clear(); r.setScissorTest(true);
  s.split.forEach((h, k) => { const n = st.newScene(h.half || 30); n.light(h.night || 0); if (h.bg) n.scene.background.set(h.bg); const pts = h.room(group(n.scene), view) || {};
    cam.fov = h.fov || 26; cam.aspect = vw / vh; cam.updateProjectionMatrix(); if (h.eye) { cam.position.set(...h.eye); cam.lookAt(...h.at); } else st.look(...h.cam); cam.updateMatrixWorld(); treat(n.scene, cam);
    r.setViewport(k * vw, sz.y - vh, vw, vh); r.setScissor(k * vw, sz.y - vh, vw, vh); r.render(n.scene, cam);
    for (const q in pts) { const v = new THREE.Vector3(...pts[q]).project(cam); p[q] = [k * W / nv + (v.x + 1) / 2 * (W / nv), (1 - v.y) / 2 * (H - bandH)]; } });
  r.setScissorTest(false); r.setViewport(0, 0, sz.x, sz.y); cam.aspect = W / H; cam.fov = 26; cam.updateProjectionMatrix();
  if (!ui) { const stage = document.querySelector('.stage'); document.head.insertAdjacentHTML('beforeend', `<style>${css} .stage > .ui:not(.cx), .stage > canvas.fx { visibility: hidden; }</style>`); ui = document.createElement('div'); ui.className = 'ui cx'; ui.style.setProperty('--ui-florence-sprite', `url(${new URL('../animation/florence-sprite.webp', import.meta.url)})`); stage.append(ui); }
  ui.innerHTML = s.html(p); return s.id; }
