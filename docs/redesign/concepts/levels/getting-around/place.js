// The place of the "Getting around" level: the row of shops in the middle of the neighbourhood on a bright spring morning,
// with the ten homes, the old blossom trees, the stream, and the board of squares between the homes and the shops.
// Everything here belongs to this level. The page, Florence's band, the order of the steps and the block style come from ../../level-kit/.
// The left of the picture is +x and the camera looks along +z, away from the shops' forecourt and towards the homes.
import { THREE, blk, group, hash, fig, tone, M, B, texBox, tileMat, patTex, FAMILY, familyGroup, SHIRTS, SKIN, HAIR } from '../../level-kit/blocks.js';
import { run, glide, tw, wait, ease, back, plate, hitBox, hot, glowMarks, newScene, canvas, view } from '../../level-kit/stage.js';
import { beep, chime } from '../../level-kit/sound.js';
import * as BD from './board.js';

const { N, key, cOf, rOf, cx: X, cz: Z, GATES, SHOP } = BD;
// the four sides of a square as steps in the world: away from the shops, right, towards the shops, left
const DX = [0, -1, 0, 1], DZ = [1, 0, -1, 0];
const T = (g, x, z, w, d, y, h, kind, hex, U = 1.6, V = 1.6) => texBox(g, x, z, w, d, y, h, tileMat(kind, tone(hex)), U, V);
const NS = { shadow: false };

// ---- colours: a spring morning in pink, cream, fresh green and awning red ------------------------------------------------------------
const GRASS = '#8fd468', GRASS2 = '#7cc65c', BLOSSOM = ['#ffc4dc', '#ffe3ee', '#ff9fc6', '#fff4f8'], BARK = '#7b5136', PAVE = '#efe0bf', ROAD = '#9ea2aa', BUSY = '#5f636c';
const DOORS = ['#d2553a', '#3f78b5', '#2e9b5a', '#e9ad1c', '#8a5fc2', '#16a3a3', '#e0703a', '#c2577a', '#5a8f3a', '#3f5fb5'];
const WALLS = ['#f4e6c8', '#f7dcc8', '#e6ecd8', '#f1e0d4'], ROOFS = ['#c8643f', '#b5553f', '#d0774a', '#a8564a'];
const CARS = ['#8d8f96', '#7d7468', '#6f7f8c', '#9a8f86', '#75787f', '#8a8478', '#70747c'];
export const PAVINGS = ['#efe0bf', '#e9b58c', '#b9c8dc'];
// the views. Each is { eye, at, fov }
export const VIEW = {
  job: { eye: [-13.5, 3.5, -10.5], at: [-4, 2.3, 12], fov: 44 },
  ask: { eye: [-11, 11.5, -21], at: [-3, 0, 25], fov: 46 },
  board: { eye: [-1.6, 4.2, -6.5], at: [-1.6, 3.9, 7.5], fov: 38 },
  test: { eye: [-7.5, 10.5, -14], at: [2, 0.5, 17], fov: 46 },
  play: { eye: [0, 35, -8.5], at: [0, 0, 26.5], fov: 46 },
  shops: { eye: [-6.5, 2.6, -9], at: [9, 2.4, 1.5], fov: 44 } };

// ---- small things made of blocks ----------------------------------------------------------------------------------------------------------
function blossomTree(g, x, z, k = 1, seed = 0) {
  const t = group(g, x, 0, z), c = (n) => BLOSSOM[Math.floor(hash(seed + n, 3.1) * 4)], lean = (hash(seed, 5) - 0.5) * 0.5;
  T(t, 0, 0, 0.62 * k, 0.62 * k, 0, 2.5 * k, 'bark', BARK, 0.7, 1.4);
  B(t, 0.9 * k, 0.1, 1.5 * k, 0.3 * k, 1.75 * k, 0.3 * k, BARK);
  B(t, 0, 0, 3.9 * k, 3.9 * k, 2.3 * k, 1.5 * k, c(1), { tex: 'leaf' }); B(t, lean, -lean, 3.1 * k, 3.1 * k, 3.7 * k, 1.2 * k, c(2), { tex: 'leaf' });
  B(t, -lean, lean * 0.6, 2 * k, 2 * k, 4.8 * k, 0.9 * k, c(3), { tex: 'leaf' }); B(t, 1.5 * k, 0.4 * k, 1.7 * k, 1.7 * k, 1.9 * k, 1 * k, c(4), { tex: 'leaf' });
  // fallen petals on the grass under the tree
  for (let i = 0; i < 7; i++) { const a = hash(seed + i, 9) * 6.3, r = (0.8 + hash(seed + i, 11) * 1.6) * k; B(t, Math.cos(a) * r, Math.sin(a) * r, 0.22, 0.22, 0.01, 0.04, '#ffd3e4', { ...NS, unlit: true }); }
  return t;
}
function youngTree(g, x, z, seed = 0) { const t = group(g, x, 0, z); B(t, 0, 0, 0.16, 0.16, 0, 1.1, BARK); B(t, 0.2, 0, 0.08, 0.08, 0, 1.3, '#c9a36a'); B(t, 0, 0, 0.9, 0.9, 1, 0.7, BLOSSOM[seed % 4], { tex: 'leaf' }); return t; }
function stump(g, x, z, k = 1) { const t = group(g, x, 0, z); T(t, 0, 0, 0.9 * k, 0.9 * k, 0, 0.45, 'bark', BARK, 0.7, 0.7); B(t, 0, 0, 0.7 * k, 0.7 * k, 0.45, 0.04, '#e8c99a', NS); B(t, 0, 0, 0.3 * k, 0.3 * k, 0.49, 0.02, '#c9a36a', NS);
  for (let i = 0; i < 4; i++) B(t, (hash(x + i, z) - 0.5) * 2.2, (hash(z + i, x) - 0.5) * 2.2, 0.5, 0.18, 0.01, 0.12, '#a8794e'); return t; }
// A home with two floors, a tiled roof that steps up, a coloured door and a small front garden with a gate. Its front looks towards +z before it is turned
function cottage(g, x, z, face, i) {
  const h = group(g, x, 0, z), wall = WALLS[i % 4], roof = ROOFS[i % 4], door = DOORS[i]; h.rotation.y = face;
  B(h, 0, 0, 6.3, 5.9, 0, 0.4, '#b9ad9c'); B(h, 0, 0, 6, 5.6, 0.4, 4.7, wall); B(h, 0, 0, 6.12, 5.72, 2.65, 0.2, '#d8c39c', NS);
  T(h, 0, 0, 6.9, 6.5, 5.1, 0.42, 'tile', roof); T(h, 0, 0, 5.1, 6.5, 5.52, 0.5, 'tile', roof); T(h, 0, 0, 3, 6.5, 6.02, 0.5, 'tile', roof); T(h, 0, 0, 1, 6.5, 6.52, 0.3, 'tile', roof);
  B(h, 1.9, -1.2, 0.8, 0.8, 5.5, 1.9, '#b98a72'); B(h, 1.9, -1.2, 1, 1, 7.4, 0.22, '#7b6a5e');
  B(h, 0, 2.83, 1.25, 0.08, 0.4, 2.2, door, NS); B(h, 0, 2.86, 0.14, 0.06, 1.4, 0.14, '#ffd257', { ...NS, unlit: true }); B(h, 0, 3.1, 1.9, 0.6, 0, 0.4, '#c9bba6'); B(h, 0, 3.0, 1.9, 0.5, 2.75, 0.14, door, NS);
  const G = { unlit: true, raw: true, shadow: false, tex: 'win' }, win = (wx, wy, ww = 1.3, wh = 1.3) => { B(h, wx, 2.83, ww + 0.24, 0.06, wy - 0.12, wh + 0.24, '#fffaf0', NS); B(h, wx, 2.86, ww, 0.06, wy, wh, '#bfe3f5', G); B(h, wx, 2.95, ww + 0.4, 0.26, wy - 0.3, 0.2, '#8a6a4a'); for (let q = 0; q < 3; q++) B(h, wx - 0.4 + q * 0.4, 2.98, 0.22, 0.22, wy - 0.12, 0.24, ['#ff6f8f', '#ffd257', '#ff9fc6'][(q + i) % 3], { ...NS, unlit: true }); };
  win(-1.9, 1.1); win(1.9, 1.1); win(-1.6, 3.2); win(1.6, 3.2);
  for (const sx of [-1, 1]) for (const wy of [1.1, 3.2]) { B(h, sx * 3.03, 0, 0.06, 1.3, wy, 1.3, '#bfe3f5', G); }
  // the front garden: a hedge with a gate in the middle, and a path of stones to the door
  for (const sx of [-1, 1]) { B(h, sx * 2.05, 4.3, 2.2, 0.5, 0, 0.8, '#5aa84a', { tex: 'leaf' }); B(h, sx * 3.05, 3.6, 0.5, 1.9, 0, 0.8, '#5aa84a', { tex: 'leaf' }); }
  T(h, 0, 3.9, 1.3, 1.3, 0, 0.07, 'pave', PAVE, 1.3, 1.3);
  const gate = group(h, -0.65, 0, 4.3); B(gate, 0.65, 0, 1.3, 0.12, 0.15, 0.75, door); B(gate, 0.65, 0, 1.4, 0.16, 0.9, 0.1, '#fffaf0', NS); h.userData.gate = gate;
  return h;
}
// a car in a dull colour. Nothing about it is meant to look better than a person on foot
function car(g, i) { const c = group(g), col = CARS[i % CARS.length]; B(c, 0, 0, 2, 4.3, 0.45, 0.8, col); B(c, 0, -0.3, 1.8, 2.3, 1.25, 0.7, col); B(c, 0, -0.3, 1.84, 1.9, 1.33, 0.5, '#3d4350', NS); B(c, 0, 0.92, 1.7, 0.1, 1.33, 0.5, '#3d4350', NS);
  for (const sx of [-1, 1]) for (const sz of [-1.3, 1.3]) B(c, sx * 0.95, sz, 0.3, 0.8, 0, 0.8, '#2a2d34'); B(c, 0, 2.16, 1.7, 0.06, 0.75, 0.2, '#d8d2c4', NS); return c; }
function lorry(g) { const c = group(g); B(c, 0, -0.6, 2.3, 4.4, 0.6, 2.3, '#8b8f98'); B(c, 0, 2.4, 2.2, 1.5, 0.6, 1.6, '#6b7079'); B(c, 0, 3.17, 1.9, 0.06, 1.3, 0.7, '#3d4350', NS); for (const sx of [-1, 1]) for (const sz of [-1.9, 0.2, 2.3]) B(c, sx * 1.05, sz, 0.34, 0.9, 0, 0.9, '#2a2d34'); return c; }

// ---- one shop: a window with a shutter, a door, a sign, a striped awning that rolls out, and its goods on the forecourt ----------------
function shop(g, z0, o) {
  const zc = z0 + 3.5, s = group(g), G = { unlit: true, raw: true, shadow: false };
  B(s, 13.5, zc, 7, 6.92, 0, 4, o.wall); B(s, 13.5, zc, 7, 6.92, 4, 3.5, o.wall2); B(s, 13.5, zc, 7.14, 7, 3.9, 0.24, '#fffaf0', NS);
  T(s, 13.5, zc, 7.6, 7.3, 7.5, 0.4, 'tile', o.roof); T(s, 14, zc, 5.6, 7.3, 7.9, 0.5, 'tile', o.roof); T(s, 14.6, zc, 3.4, 7.3, 8.4, 0.5, 'tile', o.roof);
  B(s, 9.96, zc - 0.95, 0.1, 3.9, 0.75, 2.3, '#3d4350', NS); B(s, 9.92, zc - 0.95, 0.1, 3.6, 0.9, 2, '#cfeaf7', { ...G, tex: 'pane' }); B(s, 9.86, zc - 0.95, 0.4, 4.1, 0.5, 0.26, '#8a6a4a');
  B(s, 9.95, zc + 2.3, 0.1, 1.4, 0, 2.6, o.door, NS); B(s, 9.9, zc + 2.3, 0.06, 0.9, 1.3, 1, '#cfeaf7', { ...G, tex: 'pane' }); B(s, 9.7, zc + 2.3, 0.7, 1.8, 0, 0.14, '#c9bba6');
  B(s, 9.88, zc, 0.24, 6.5, 3.05, 0.8, o.sign); for (const sz of [-1.75, 1.75]) { B(s, 9.96, zc + sz, 0.08, 1.5, 4.85, 1.7, '#fffaf0', NS); B(s, 9.93, zc + sz, 0.08, 1.26, 4.97, 1.46, '#bfe3f5', { ...G, tex: 'win' }); }
  // the sign carries a small picture made of blocks, in place of words
  const pic = group(s, 9.72, 3.2, zc); o.pic(pic);
  // the shutter is down until the shops open
  const shutter = group(s, 9.84, 2.95, zc - 0.95); B(shutter, 0, 0, 0.12, 3.7, -2.1, 2.1, '#aab2bc', { tex: 'stripe' }); const doorShut = B(s, 9.86, zc + 2.3, 0.08, 1.3, 0.1, 2.4, '#aab2bc', { tex: 'stripe' });
  // the awning: stripes in the shop's colour and cream. It is rolled up against the wall until the shops open
  const aw = group(s, 9.98, 0, zc); for (let k = 0; k < 8; k++) { const c = k % 2 ? '#fffaf0' : o.awning, z = -2.975 + k * 0.85; B(aw, -0.55, z, 1.1, 0.85, 3.05, 0.14, c); B(aw, -1.55, z, 0.95, 0.85, 2.83, 0.14, c); B(aw, -2.02, z, 0.08, 0.85, 2.55, 0.3, c); }
  for (const z of [-3.3, 3.3]) B(aw, -1.9, z, 0.1, 0.1, 0, 2.85, '#fffaf0');
  // the bell over the door
  const bell = group(s, 9.6, 2.75, zc + 2.3); B(bell, 0, 0, 0.1, 0.1, 0, 0.3, '#6b5a3a', NS); B(bell, 0, 0, 0.34, 0.34, -0.3, 0.3, '#ffd257', { unlit: true, raw: true });
  const goods = group(s); o.goods(goods, zc); goods.visible = false;
  const keeper = fig(s, 8.9, 0, zc + 0.9, { k: 1.25, shirt: '#fffaf0', legs: '#4a556e', skin: SKIN[o.n % 4], hair: HAIR[(o.n + 2) % 5], hat: o.hat, turn: -1.9, arms: ['up', 'down'] }); keeper.visible = false;
  const set = (k) => { aw.scale.x = 0.08 + 0.92 * k; shutter.scale.y = 1 - 0.94 * k; doorShut.visible = k < 0.6; goods.visible = k > 0.5; keeper.visible = k > 0.8; };
  set(0); return { set, bell, keeper, zc };
}
const crate = (g, x, z, cols, y = 0) => { B(g, x, z, 1.1, 0.9, y, 0.5, '#b98a52', { tex: 'board' }); for (let i = 0; i < 6; i++) B(g, x - 0.33 + (i % 3) * 0.33, z - 0.2 + Math.floor(i / 3) * 0.4, 0.28, 0.28, y + 0.42, 0.26, cols[i % cols.length], { unlit: true, raw: true, shadow: false }); };
const SHOPS = [
  { n: 0, wall: '#f3e2d0', wall2: '#bcd9e6', roof: '#7f8fa8', door: '#3f78b5', sign: '#3f78b5', awning: '#3f78b5', hat: null,
    pic: (p) => { for (const z of [-0.45, 0.45]) { B(p, 0, z, 0.1, 0.5, 0.1, 0.5, '#1f2a44', NS); B(p, 0, z, 0.12, 0.26, 0.22, 0.26, '#fffaf0', NS); } B(p, 0, 0, 0.1, 0.9, 0.42, 0.1, '#ffd257', NS); },
    goods: (g, zc) => { for (const z of [-2.2, -0.6]) { const b = group(g, 8.6, 0, zc + z); B(b, 0, -0.5, 0.12, 0.7, 0, 0.7, '#2a2d34'); B(b, 0, 0.5, 0.12, 0.7, 0, 0.7, '#2a2d34'); B(b, 0, 0, 0.1, 1.1, 0.6, 0.12, z < -1 ? '#e0503a' : '#2e9b5a'); B(b, 0, -0.3, 0.1, 0.1, 0.6, 0.5, '#4a556e'); B(b, 0, 0.45, 0.4, 0.1, 1.0, 0.1, '#4a556e'); B(b, 0, -0.3, 0.26, 0.4, 1.08, 0.1, '#3a2a1c'); } } },
  { n: 1, wall: '#f7e7c6', wall2: '#f9d9c2', roof: '#c8643f', door: '#c8443a', sign: '#c8443a', awning: '#d9453c', hat: '#fffaf0',
    pic: (p) => { B(p, 0, 0, 0.1, 1.1, 0.12, 0.44, '#d99a4e', NS); B(p, 0, 0, 0.1, 0.8, 0.5, 0.12, '#e8b46a', NS); for (const z of [-0.3, 0, 0.3]) B(p, -0.02, z, 0.1, 0.08, 0.3, 0.24, '#b77a36', NS); },
    goods: (g, zc) => { B(g, 8.4, zc - 1, 1.2, 3.2, 0.9, 0.14, '#d9b684', { tex: 'board' }); for (const z of [-2.3, 0.3]) for (const x of [7.95, 8.85]) B(g, x, zc + z, 0.12, 0.12, 0, 0.9, '#8a6a4a'); B(g, 8.4, zc - 1, 1.25, 3.25, 0.72, 0.2, '#fffaf0', NS);
      for (let i = 0; i < 8; i++) { const z = zc - 2.2 + (i % 4) * 0.8, x = 8.1 + Math.floor(i / 4) * 0.6; B(g, x, z, 0.4, 0.62, 1.04, 0.28, ['#d99a4e', '#c98a3e', '#e8b46a'][i % 3], { unlit: true, raw: true }); } } },
  { n: 2, wall: '#eef0d8', wall2: '#d7e8c0', roof: '#a8564a', door: '#2e7b4a', sign: '#2e9b5a', awning: '#2e9b5a', hat: null,
    pic: (p) => { B(p, 0, -0.2, 0.1, 0.44, 0.14, 0.44, '#e23b2e', NS); B(p, 0, -0.2, 0.1, 0.1, 0.58, 0.12, '#2e7b4a', NS); B(p, 0, 0.3, 0.1, 0.4, 0.14, 0.34, '#f0a030', NS); B(p, 0, 0.3, 0.1, 0.16, 0.48, 0.16, '#5fb04e', NS); },
    goods: (g, zc) => { crate(g, 8.7, zc - 2.3, ['#e23b2e', '#e8402f']); crate(g, 8.7, zc - 1.2, ['#f0a030', '#ffd257']); crate(g, 8.7, zc - 0.1, ['#5fb04e', '#8fd46a']); crate(g, 7.5, zc - 1.75, ['#e02a4a', '#ff6f8f'], 0); crate(g, 8.7, zc - 1.75, ['#c4ee8e', '#5fb04e'], 0.55); } }];

// ---- the place ----------------------------------------------------------------------------------------------------------------------------
// W holds the level's words, which are placeholders. hooks.postcard(i, url) is called when the picture of morning i has been taken.
export function makePlace(W, hooks) {
  const s = newScene(60, { sun: [-26, 46, -20], skies: [['#2f86e0', '#8fcbf6', '#fdeeda'], ['#2f86e0', '#8fcbf6', '#fdeeda'], ['#2f86e0', '#8fcbf6', '#fdeeda']], haze: 0.0062, sunColour: '#fff1d8', sunPower: 3.3, skyLight: '#e8f0ff', groundLight: '#f0d8c0', lightPower: 1.5 }), g = s.g;
  s.sun.target.position.set(0, 0, 20); s.sun.position.set(-26, 46, 0); Object.assign(s.sun.shadow.camera, { left: -62, right: 62, top: 62, bottom: -62 }); s.sun.shadow.camera.updateProjectionMatrix();
  Object.assign(s, { ...VIEW.job, bloom: 0.45, ao: 0.8, style: 1, park: 2, child: null, shown: -1, paving: 0 });

  // the ground, the forecourt, the river and the stream
  T(g, 0, 40, 260, 260, -1, 1, 'grass', GRASS, 5, 5);
  for (let i = 0; i < 26; i++) B(g, (hash(i, 1) - 0.5) * 110, 10 + hash(i, 2) * 75, 5 + hash(i, 3) * 8, 4 + hash(i, 4) * 7, 0, 0.02, i % 2 ? GRASS2 : '#9bdc72', NS);
  T(g, -1.5, -4, 23, 30, 0, 0.1, 'pave', '#f1e4c8', 2.2, 2.2); T(g, 0, 10.6, 5, 1.2, 0, 0.1, 'pave', '#f1e4c8', 2.2, 2.2);
  B(g, -34.5, 30, 5, 180, 0, 0.05, '#63bdea', { ...NS, unlit: true }); for (let i = 0; i < 22; i++) B(g, -34.5 + (hash(i, 6) - 0.5) * 3.6, -40 + i * 7.3, 0.9, 2.2, 0.05, 0.02, '#a8e0fa', { ...NS, unlit: true });
  for (const sx of [-31.6, -37.4]) B(g, sx, 30, 0.9, 180, 0, 0.14, '#6fb24f');
  B(g, -1, 28.5, 62, 2.2, 0, 0.06, '#63bdea', { ...NS, unlit: true }); for (let i = 0; i < 16; i++) B(g, -30 + i * 3.9 + hash(i, 8), 28.5 + (hash(i, 9) - 0.5) * 1.3, 1.5, 0.3, 0.06, 0.02, '#a8e0fa', { ...NS, unlit: true });
  for (const sz of [27.2, 29.8]) B(g, -1, sz, 62, 0.5, 0, 0.12, '#6fb24f'); B(g, 0, 28.5, 3.6, 3.6, 0, 0.07, '#63bdea', { ...NS, unlit: true });
  for (let i = 0; i < 9; i++) { const x = -27 + i * 6.3 + hash(i, 4) * 2; B(g, x, 27.2, 0.14, 0.14, 0, 0.9 + hash(i, 2) * 0.5, '#4f9a3f'); B(g, x + 0.3, 29.9, 0.14, 0.14, 0, 0.8, '#4f9a3f'); B(g, x, 27.2, 0.2, 0.2, 0.9 + hash(i, 2) * 0.5, 0.3, '#8a5a3c'); }
  // the road for cars, which goes around the outside of the neighbourhood and comes to the forecourt from the right
  const rd = (x, z, w, d) => B(g, x, z, w, d, 0, 0.06, ROAD, NS); rd(29, 28, 3, 62); rd(0, 58.5, 61, 3); rd(-29, 31, 3, 58); rd(-21, 3.5, 16, 3);
  // far away: low hills in steps, with a pale town and more blossom on them, and a few clouds
  B(g, 0, 100, 300, 44, 0, 3.5, '#8ed07a'); B(g, -50, 118, 150, 40, 0, 9, '#84c88a'); B(g, 62, 124, 130, 40, 0, 13, '#86c49c'); B(g, 0, 150, 320, 40, 0, 19, '#8fc4ae');
  for (let i = 0; i < 26; i++) { const x = -105 + i * 8.4 + hash(i, 3) * 5, z = 84 + hash(i, 5) * 34, y = z > 104 ? (x < 0 ? 9 : 13) : 3.5, h = 3 + hash(i, 7) * 4; if (i % 3) { B(g, x, z, 5, 5, y, h, WALLS[i % 4]); B(g, x, z, 5.6, 5.6, y + h, 0.9, ROOFS[i % 4]); } else { B(g, x, z, 0.8, 0.8, y, 2.5, BARK); B(g, x, z, 5, 5, y + 2, 3, BLOSSOM[i % 3], { tex: 'leaf' }); } }
  const cloudM = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false, transparent: true, opacity: 0.9 }); for (let i = 0; i < 7; i++) { const x = -150 + i * 50 + hash(i, 2) * 20, y = 46 + hash(i, 3) * 26; for (const [dx, dy, w, h] of [[0, 0, 26, 5], [5, 4, 14, 4], [-7, 3, 10, 3]]) blk(g, x + dx, 230, w, 4, y + dy, h, '#fff', { shadow: false, mat: cloudM }); }

  // the three shops stand along the left of the forecourt and face it
  const shops = SHOPS.map((o, i) => shop(g, -11 + i * 7, o));
  // things on the forecourt: lamps, a bench, tubs of tulips and a rack for bikes
  for (const [x, z] of [[-10.5, -12], [-10.5, 6], [6.5, 10.2]]) { B(g, x, z, 0.24, 0.24, 0, 4.2, '#2f3a52'); B(g, x, z, 0.8, 0.8, 4.2, 0.14, '#2f3a52'); B(g, x, z, 0.56, 0.56, 3.75, 0.45, '#fff6d8', { unlit: true, raw: true }); }
  for (const [x, z] of [[-11.2, -3], [-11.2, 1.2], [-6.5, 10.3], [3.6, 10.3]]) { B(g, x, z, 1.5, 1.5, 0, 0.7, '#c98a5a'); B(g, x, z, 1.3, 1.3, 0.7, 0.12, '#5a3d2a'); for (let q = 0; q < 9; q++) { const px = x - 0.42 + (q % 3) * 0.42, pz = z - 0.42 + Math.floor(q / 3) * 0.42; B(g, px, pz, 0.08, 0.08, 0.8, 0.45, '#4f9a3f'); B(g, px, pz, 0.26, 0.26, 1.22, 0.3, ['#ff5f7f', '#ffd257', '#ff9fc6', '#ffffff'][(q + Math.round(x)) & 3], { unlit: true, raw: true }); } }
  { const b = group(g, -11.3, 0, -8); B(b, 0, 0, 0.7, 2.6, 0.5, 0.12, '#b98a52', { tex: 'board' }); B(b, -0.3, 0, 0.1, 2.6, 0.62, 0.6, '#b98a52', { tex: 'board' }); for (const z of [-1.1, 1.1]) B(b, 0, z, 0.6, 0.14, 0, 0.5, '#2f3a52'); }

  // the ten homes, each with the person who lives there and the car behind it
  const homeAt = GATES.map((q) => (q.side === 3 ? [22.5, Z(q.r), -Math.PI / 2] : q.side === 1 ? [-22.5, Z(q.r), Math.PI / 2] : [X(q.c), 51.5, Math.PI]));
  const gatePt = GATES.map((q) => [X(q.c) + DX[q.side] * 2.9, Z(q.r) + DZ[q.side] * 2.9]), doorPt = GATES.map((q, i) => [homeAt[i][0] - DX[q.side] * 2.4, homeAt[i][1] - DZ[q.side] * 2.4]);
  const homes = GATES.map((q, i) => cottage(g, homeAt[i][0], homeAt[i][1], homeAt[i][2], i));
  const people = GATES.map((q, i) => { const p = q.gran ? fig(g, 0, 0, 0, { k: 1.16, shirt: '#e86a9a', legs: '#5a556e', skin: SKIN[3], hair: '#e2e2ea', bag: '#ffd257', hat: '#8a5fc2' }) : fig(g, 0, 0, 0, { k: 1.12 + hash(i, 4) * 0.22, shirt: SHIRTS[i % 6], legs: i % 2 ? '#2b3a55' : '#4a556e', skin: SKIN[i % 4], hair: HAIR[(i * 2 + 1) % 5], bag: DOORS[i], long: i % 3 === 1, arms: i % 4 === 2 ? ['down', 'up'] : ['down', 'down'] }); return p; });
  const cars = GATES.map((q, i) => car(g, i)), backPt = GATES.map((q, i) => [homeAt[i][0] + DX[q.side] * 4.2, homeAt[i][1] + DZ[q.side] * 4.2]);
  const granI = GATES.findIndex((q) => q.gran), granPlate = plate(s, W.gran, [0, 0, 0], 'on'), granHome = plate(s, W.granHome, [homeAt[granI][0], 8.6, homeAt[granI][1]], '');
  // the family waits on the forecourt
  const family = familyGroup(group(g, -9.3, 0, 3.6), 0.6), famPlate = plate(s, W.family, [-9.5, 3.3, 3.4], 'on');
  // where people stand when they have reached the shops, and where cars stop: right across the front of the shops
  const SLOT = [[8.7, -0.6], [7.4, -0.4], [8.7, 6.4], [6.1, -0.7], [7.3, 6.2], [4.8, -0.4], [-1.5, 4.5], [5.9, 6.5], [-3.8, 2.4], [-2.2, 7.6], [-7.2, 5.6]], PARK = [[6, 3], [6, -4.2], [5.6, 8.9], [1.2, 5.2], [0.6, -2.6], [-3.4, 7.4]];

  // ---- the old trees, the stumps, and the park when it is put somewhere else -------------------------------------------------------------
  const trees = new Map(), stumps = new Map(); for (const k of BD.TREES) { const big = k === BD.OAK; trees.set(k, blossomTree(g, X(cOf(k)), Z(rOf(k)), big ? 1.32 : 0.92 + hash(k, 2) * 0.2, k)); const st = stump(g, X(cOf(k)) + (big ? 0 : 1.5), Z(rOf(k)) + (big ? 0 : 1.4), big ? 1.6 : 1); st.visible = false; stumps.set(k, st); }
  const setTrees = (kept) => { const on = new Set(kept); for (const k of BD.TREES) { trees.get(k).visible = on.has(k); stumps.get(k).visible = !on.has(k); } };
  // wild flowers in the grass of the middle, so that the land reads as a green place before anything is built
  for (let i = 0; i < 46; i++) { const x = (hash(i, 21) - 0.5) * 32, z = 12 + hash(i, 22) * 33; if (Math.abs(z - 28.5) < 2) continue; B(g, x, z, 0.2, 0.2, 0, 0.16, ['#ffffff', '#ffd257', '#ff9fc6'][i % 3], { ...NS, unlit: true }); }
  const zone = [null, null];   // 0: the park at the far edge, 1: the park on the other side of the river
  { const a = group(g, 0, 0, 66); B(a, 0, 0, 34, 9, 0, 0.5, '#9bdc72'); for (let i = 0; i < 7; i++) youngTree(a, -13.5 + i * 4.5, (i % 2) * 2.4 - 1.2, i).position.y = 0.5; B(a, 0, -3.2, 3, 1.6, 0.5, 0.06, '#63bdea', { ...NS, unlit: true }); zone[0] = a;
    const b = group(g, -47, 0, 30); B(b, 0, 0, 14, 28, 0, 0.5, '#9bdc72'); for (let i = 0; i < 7; i++) youngTree(b, -3.6 + (i % 2) * 7, -11 + i * 3.6, i + 2).position.y = 0.5; B(b, 0, 0, 3, 3, 0.5, 0.06, '#63bdea', { ...NS, unlit: true }); B(b, 9.9, 0, 6.8, 1.8, 0.3, 0.2, '#b98a52', { tex: 'board' }); for (const z of [-0.9, 0.9]) B(b, 9.9, z, 6.8, 0.12, 0.5, 0.6, '#8a5a3c'); zone[1] = b; a.visible = b.visible = false; }
  const ZONES = [[0, 66, 35, 10], [-47, 30, 15, 29], [0, 28.5, 26, 26]], zonePlate = plate(s, W.parkHere, [0, 3, 0], 'on'); zonePlate.hide = true;
  const outline = group(g); const drawOutline = (i) => { outline.clear(); const [x, z, w, d] = ZONES[i], n = Math.round(w / 2.4), m = Math.round(d / 2.4), mat = M('#ffdf3d', { unlit: true, raw: true });
    for (let k = 0; k < n; k++) for (const sz of [-1, 1]) blk(outline, x - w / 2 + (k + 0.5) * w / n, z + sz * d / 2, w / n * 0.6, 0.5, i < 2 ? 0.5 : 0.02, 0.22, '#ffdf3d', { shadow: false, mat }); for (let k = 0; k < m; k++) for (const sx of [-1, 1]) blk(outline, x + sx * w / 2, z - d / 2 + (k + 0.5) * d / m, 0.5, d / m * 0.6, i < 2 ? 0.5 : 0.02, 0.22, '#ffdf3d', { shadow: false, mat });
    glowMarks(outline); zonePlate.pos.set(x, i === 2 ? 3 : 5, z + (i === 2 ? -9 : 0)); };

  // ---- the path pieces --------------------------------------------------------------------------------------------------------------------
  // Paving that belongs to the child's own paths takes the colour the child chose; everything else is cream.
  const paveMat = (hex) => { const t = patTex('pave').clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; return new THREE.MeshLambertMaterial({ color: tone(hex), map: t }); };
  const stone = paveMat(PAVE), mine = paveMat(PAVINGS[0]), roadM = M(ROAD), busyM = M(BUSY), dashM = M('#fffaf0', { unlit: true, raw: true });
  // a flat slab that runs from a0 to a1 away from the middle of the square towards side sd, off to one side by off, and wid wide
  const slab = (p, sd, a0, a1, off, wid, y, h, mat, sh = true) => { const along = DZ[sd] !== 0, m = (a0 + a1) / 2, len = a1 - a0; return texBox(p, along ? off : DX[sd] * m, along ? DZ[sd] * m : off, along ? wid : len, along ? len : wid, y, h, mat, 1.5, 1.5).castShadow = sh; };
  // draws one piece on its square. road: 0 a footpath alone, 1 a quiet street with a path on each side, 2 a busy road with a path on each side. wig: the path winds
  function drawPiece(parent, k, piece, { road, wig, mat, bridgeLike }) {
    const p = group(parent, X(cOf(k)), 0, Z(rOf(k))), pw = road ? 0.75 : 2, po = road ? (road === 2 ? 2.1 : 1.85) : 0, rw = road === 2 ? 3.5 : 3, halves = wig ? [[0, 1.35, 0.62], [1.15, 2.5, -0.62]] : [[0, 2.5, 0]];
    if (bridgeLike) { const wd = road ? 4.4 : 2.5, wood = tileMat('board', tone('#c9975a')); texBox(p, 0, 0, wd, 5.6, 0.32, 0.2, wood, 1.2, 1.2); for (const sx of [-1, 1]) { B(p, sx * (wd / 2 - 0.08), 0, 0.14, 5.6, 0.95, 0.14, '#d2553a'); for (const z of [-2.5, -1.25, 0, 1.25, 2.5]) B(p, sx * (wd / 2 - 0.08), z, 0.16, 0.16, 0.5, 0.5, '#d2553a'); } for (const z of [-2.75, 2.75]) texBox(p, 0, z, wd, 0.7, 0.05, 0.2, wood, 1.2, 1.2); return p; }
    const n = piece.sides.filter(Boolean).length;
    for (let sd = 0; sd < 4; sd++) if (piece.sides[sd]) for (const [a0, a1, o] of halves) {
      if (road) { slab(p, sd, a0, a1, o, rw, 0.02, 0.07, road === 2 ? busyM : roadM, false); for (const e of [-1, 1]) slab(p, sd, a0, a1, o + e * po, pw, 0.02, 0.17, mat); if (road === 2 && a1 > 2) slab(p, sd, 0.9, 1.9, o, 0.16, 0.09, 0.02, dashM, false); }
      else slab(p, sd, a0, a1, o, pw, 0.02, 0.15, mat);
    } else if (road) slab(p, sd, po - pw / 2, po + pw / 2, 0, rw + pw * 2 + 0.7, 0.02, 0.17, mat);   // the path runs across a side that the street does not leave by
    if (road) { texBox(p, 0, 0, rw + (wig ? 1.2 : 0), rw + (wig ? 1.2 : 0), 0.02, 0.07, road === 2 ? busyM : roadM, 1.5, 1.5).castShadow = false; for (const ex of [-1, 1]) for (const ez of [-1, 1]) texBox(p, ex * po, ez * po, pw + (wig ? 1 : 0), pw + (wig ? 1 : 0), 0.02, 0.17, mat, 1.5, 1.5); }
    else if (n !== 2 || piece.sides[0] !== piece.sides[2] || wig) texBox(p, 0, 0, wig ? 3.2 : pw, wig ? 3.2 : pw, 0.02, 0.15, mat, 1.5, 1.5);
    return p;
  }
  const layer = group(g); let lorries = [];
  // draws a whole board of pieces. plan decides whether the pieces are streets or footpaths; the child's words decide whether they wind and whether the road is busy
  function drawBoard(b, own = false) { layer.clear(); lorries = []; const road = s.style === 2 ? 2 : b.plan === 2 ? 0 : 1, wig = s.style === 0;
    b.cells.forEach((p, k) => { if (p) drawPiece(layer, k, p, { road, wig, mat: own ? mine : stone, bridgeLike: p.kind === 'bridge' || b.ground[k] === 'road-bridge' }); });
    // the last stretch from the first square to the forecourt
    if (b.cells[key(SHOP.c, SHOP.r)]) texBox(layer, 0, 10.6, road ? 5.2 : 2, 1.2, 0.02, 0.16, own ? mine : stone, 1.5, 1.5);
    if (s.style === 2) for (let i = 0; i < 3; i++) { const l = lorry(layer); l.visible = false; lorries.push({ l, i }); } }
  // the middle of a square, as a point on the ground
  const mid = (k) => [X(cOf(k)), Z(rOf(k))];
  // the way a person walks from a home to the shops: out of the door, through the gate, along the squares, and across the forecourt to a place to stand
  function walkWay(i, way, slot) { const pts = [doorPt[i], gatePt[i]];
    way.forEach((k, j) => { const a = mid(k); if (s.style === 0 && j > 0) { const b0 = mid(way[j - 1]), dx = Math.sign(a[0] - b0[0]), dz = Math.sign(a[1] - b0[1]); for (const [t, o] of [[1.3, 0.62], [1.5, -0.62], [3.5, -0.62], [3.7, 0.62]]) pts.push([b0[0] + dx * t + (dz ? o : 0), b0[1] + dz * t + (dx ? o : 0)]); } pts.push(a); });
    pts.push([0, 10.6], [SLOT[slot][0] > 3 ? 1.5 : SLOT[slot][0], SLOT[slot][1] + (SLOT[slot][0] > 3 ? 0 : 1)], SLOT[slot]); return pts; }
  // the way a car drives: out of the back of the home onto the outside road, round to the right of the forecourt, and across it to the front of the shops
  function driveWay(i, spot) { const q = GATES[i], b0 = backPt[i], pts = [b0]; if (q.side === 3) pts.push([29, b0[1]], [29, 58.5], [-29, 58.5]); else if (q.side === 0) pts.push([b0[0], 58.5], [-29, 58.5]); else pts.push([-29, b0[1]]); pts.push([-29, 3.5], [-12, 3.5], [-6, PARK[spot][1]], PARK[spot]); return pts; }
  const lengthOf = (pts) => pts.slice(1).reduce((n, p, j) => n + Math.hypot(p[0] - pts[j][0], p[1] - pts[j][1]), 0);
  // puts a thing at a share k (0 to 1) of the way along a list of points, facing the way it goes. A person bobs as they walk
  function along(o, pts, k, bob = 0) { const L = lengthOf(pts); let d = Math.max(0, Math.min(1, k)) * L, j = 0; while (j < pts.length - 2) { const l = Math.hypot(pts[j + 1][0] - pts[j][0], pts[j + 1][1] - pts[j][1]); if (d <= l) break; d -= l; j++; }
    const a = pts[j], b = pts[j + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, t = Math.min(1, d / l); o.position.set(a[0] + (b[0] - a[0]) * t, bob ? Math.abs(Math.sin(k * L * 1.5)) * bob : 0, a[1] + (b[1] - a[1]) * t); if (l > 0.01 && k < 1) o.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); }
  const faceShops = (o, slot) => { o.rotation.y = slot === 10 ? -1.9 : SLOT[slot][0] > 3 ? Math.PI / 2 : 0.9; };

  // ---- showing a plan, and a morning ------------------------------------------------------------------------------------------------------
  // Florence's own drawing of each plan, or the child's own paths for the plan the child built
  const layout = (i) => (s.child && s.child.plan === i ? s.child.board : BD.florence(i, s.park === 2));
  const model = (i) => { const b = layout(i), hs = BD.homes(b), walk = BD.walkers(b, s.style); return { b, hs, walk, walkers: walk.filter(Boolean).length, kept: BD.keptTrees(i, s.park === 2).length }; };
  s.model = (i) => { const b = BD.florence(i, s.park === 2), walk = BD.walkers(b, s.style); return { walkers: walk.filter(Boolean).length, kept: BD.keptTrees(i, s.park === 2).length }; };
  const atHome = () => { GATES.forEach((q, i) => { people[i].position.set(doorPt[i][0], 0, doorPt[i][1]); people[i].rotation.y = homeAt[i][2]; people[i].visible = true; cars[i].visible = false; homes[i].userData.gate.rotation.y = 0; }); granPlate.hide = true; };
  const openGate = (i, k) => { homes[i].userData.gate.rotation.y = -1.5 * k; };
  // the land as it is before anything is built: every old tree, nobody out yet
  function bare() { layer.clear(); lorries = []; setTrees(BD.TREES); zone[0].visible = zone[1].visible = false; atHome(); s.shown = -1; }
  // draws plan i on the ground at once
  function showPlan(i) { const m = model(i); drawBoard(m.b, !!(s.child && s.child.plan === i)); setTrees(BD.keptTrees(i, s.park === 2)); zone[0].visible = s.park === 0; zone[1].visible = s.park === 1; s.shown = i; return m; }
  // the order in which people reach the shops, and where each stands or parks
  function places(m) { const order = m.hs.map((h, i) => [h.steps ?? 99, i]).sort((a, b) => a[0] - b[0]).map((p) => p[1]); let w = 0, c = 0; const at = []; for (const i of order) at[i] = m.walk[i] ? { slot: i === granI ? 10 : w++ } : { spot: c++ }; return at; }
  // everybody where they end up, at once: for the town and for "Try another plan"
  function settle(i) { const m = showPlan(i), at = places(m); GATES.forEach((q, j) => { openGate(j, 1); if (m.walk[j]) { const pts = walkWay(j, m.hs[j].way, at[j].slot); along(people[j], pts, 1); faceShops(people[j], at[j].slot); people[j].visible = true; cars[j].visible = false; } else { people[j].visible = false; cars[j].visible = true; along(cars[j], driveWay(j, at[j].spot), 0.999); } });
    granPlate.hide = false; granPlate.el.textContent = m.walk[granI] ? W.gran : W.granCar; (m.walk[granI] ? people : cars)[granI].getWorldPosition(granPlate.pos); granPlate.pos.y += 2.9; return m; }
  // one morning: every door opens, and each family walks to the shops or takes the car
  async function morning(i) { const me = run, m = showPlan(i), at = places(m); atHome(); granPlate.hide = false; beep(700, 0.08);
    const jobs = GATES.map(async (q, j) => { await wait(0.25 + hash(j, 8) * 0.7); openGate(j, 1);
      if (m.walk[j]) { const pts = walkWay(j, m.hs[j].way, at[j].slot), sec = 2.6 + lengthOf(pts) * 0.085; await tw(sec, (k) => { along(people[j], pts, k, 0.14); if (j === granI) { granPlate.pos.copy(people[j].position); granPlate.pos.y += 2.9; } }); faceShops(people[j], at[j].slot); beep(880 + j * 30, 0.05, 'sine', 0.04); }
      else { people[j].visible = false; cars[j].visible = true; const pts = driveWay(j, at[j].spot), sec = 3.4 + lengthOf(pts) * 0.035; await tw(sec, (k) => { along(cars[j], pts, ease(k) * 0.999); if (j === granI) { granPlate.pos.copy(cars[j].position); granPlate.pos.y += 3; } }); beep(150, 0.12, 'sawtooth', 0.03); } });
    granPlate.el.textContent = m.walk[granI] ? W.gran : W.granCar; await Promise.all(jobs); if (me !== run) return false;
    if (m.walk[granI]) { chime(); await tw(0.7, (k) => { family.position.y = Math.abs(Math.sin(k * Math.PI * 2)) * 0.35; }); }
    return me === run; }

  // ---- a picture of the moment, for the postcard ----------------------------------------------------------------------------------------------
  // The picture is taken in the same turn in which the stage has drawn it, because the drawing is not kept afterwards.
  const flashEl = document.createElement('i'); flashEl.className = 'flash'; view.append(flashEl);
  let snapWant = null; const snap = () => new Promise((res) => { snapWant = res; });
  const takeNow = (res) => requestAnimationFrame(() => { try { const c = document.createElement('canvas'); c.width = 640; c.height = Math.round(640 * canvas.height / canvas.width); c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.86)); } catch (e) { res(''); } });
  const flash = () => { flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go'); beep(1400, 0.03, 'square', 0.05); setTimeout(() => beep(900, 0.05, 'square', 0.04), 70); };

  // ---- the board of Florence's three plans, as three small maps on a notice board ----------------------------------------------------------
  const nb = group(g, -1, 0, 7.5); nb.visible = false; for (const x of [-5.3, 5.3]) B(nb, x, 0, 0.3, 0.3, 0, 4.9, '#8a5a3c'); B(nb, 0, 0, 11.2, 0.24, 0.9, 3.9, '#b98a52', { tex: 'board' }); B(nb, 0, 0, 11.8, 0.9, 4.8, 0.24, '#d2553a'); B(nb, 0, 0, 11, 0.6, 5.04, 0.2, '#d2553a');
  const maps = [0, 1, 2].map((i) => { const c = document.createElement('canvas'); c.width = c.height = 384; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.BoxGeometry(3.3, 3.3, 0.1), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(3.55 - i * 3.55, 2.85, -0.17); nb.add(m); B(nb, 3.55 - i * 3.55, -0.13, 3.5, 0.06, 1.1, 3.5, '#fffaf0', NS); return { c, tex, m }; });
  function drawMap(i) { const { c, tex } = maps[i], x = c.getContext('2d'), b = BD.florence(i, s.park === 2), kept = new Set(BD.keptTrees(i, s.park === 2)), S = 44, px = (cc) => 38 + cc * S + S / 2, py = (r) => 330 - r * S - S / 2 - 14, road = s.style === 2 || i !== 2;
    x.fillStyle = '#c4ea9c'; x.fillRect(0, 0, 384, 384); x.fillStyle = '#f1e4c8'; x.fillRect(60, 330, 264, 54); x.fillStyle = '#6cc3ee'; x.fillRect(0, py(3) - 7, 384, 14);
    ['#3f78b5', '#d9453c', '#2e9b5a'].forEach((col, q) => { x.fillStyle = col; x.fillRect(74 + q * 82, 346, 70, 30); x.fillStyle = '#fffaf0'; for (let k = 0; k < 4; k++) x.fillRect(74 + q * 82 + 9 + k * 18, 346, 8, 12); });
    const line = (w, col) => { x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; b.cells.forEach((p, k) => { if (!p) return; const cc = cOf(k), r = rOf(k); for (let sd = 0; sd < 4; sd++) if (p.sides[sd]) { x.beginPath(); x.moveTo(px(cc), py(r)); const ex = px(cc) + [0, 1, 0, -1][sd] * S / 2, ey = py(r) - [1, 0, -1, 0][sd] * S / 2; if (s.style === 0) x.quadraticCurveTo((px(cc) + ex) / 2 + (sd % 2 ? 0 : 9), (py(r) + ey) / 2 + (sd % 2 ? 9 : 0), ex, ey); else x.lineTo(ex, ey); x.stroke(); } }); x.beginPath(); x.moveTo(px(3), py(0)); x.lineTo(px(3), 334); x.stroke(); };
    if (road) { line(17, '#1f2a44'); line(13, s.style === 2 ? '#5f636c' : '#fff3d0'); if (s.style !== 2) line(6, '#aeb2ba'); } else { line(12, '#1f2a44'); line(7, '#fff3d0'); }
    for (const k of BD.TREES) { const cc = cOf(k), r = rOf(k), big = k === BD.OAK ? 15 : 11; if (kept.has(k)) { x.fillStyle = '#ff8fbe'; x.strokeStyle = '#1f2a44'; x.lineWidth = 3; x.beginPath(); x.arc(px(cc), py(r), big, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#ffe3ee'; x.beginPath(); x.arc(px(cc) - 3, py(r) - 3, big / 2.4, 0, 7); x.fill(); } else { x.strokeStyle = '#8a5a3c'; x.lineWidth = 3; x.fillStyle = '#e8c99a'; x.beginPath(); x.arc(px(cc) + 12, py(r) + 12, 5, 0, 7); x.fill(); x.stroke(); } }
    GATES.forEach((q, j) => { const hx = px(q.c) + [0, 1, 0, -1][q.side] * 30, hy = py(q.r) - [1, 0, -1, 0][q.side] * 30; x.fillStyle = '#fffaf0'; x.strokeStyle = '#1f2a44'; x.lineWidth = 3; x.fillRect(hx - 9, hy - 7, 18, 16); x.strokeRect(hx - 9, hy - 7, 18, 16); x.fillStyle = DOORS[j]; x.beginPath(); x.moveTo(hx - 13, hy - 6); x.lineTo(hx, hy - 17); x.lineTo(hx + 13, hy - 6); x.fill(); x.stroke(); });
    x.strokeStyle = '#1f2a44'; x.lineWidth = 8; x.strokeRect(0, 0, 384, 384); tex.needsUpdate = true; }
  const tagPl = [0, 1, 2].map((i) => { const t = plate(s, '', [2.55 - i * 3.55, 5.75, 7.3], 'pl'); t.el.innerHTML = hooks.tag(i); t.hide = true; return t; });

  // ---- drifting petals, and the things that move by themselves ------------------------------------------------------------------------------
  const PN = 110, petalM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.03, 0.16), new THREE.MeshBasicMaterial({ color: hot('#ffd9e8', 1.15) }), PN), dummy = new THREE.Object3D(), petal = Array.from({ length: PN }, (_, i) => ({ x: (hash(i, 31) - 0.5) * 56, z: -18 + hash(i, 32) * 66, y: hash(i, 33) * 12, v: 0.5 + hash(i, 34) * 0.7, ph: hash(i, 35) * 6 }));
  petalM.frustumCulled = false; g.add(petalM);
  let strollers = [], ambN = 0;
  s.tick = (t, dt) => { if (snapWant) { const r = snapWant; snapWant = null; takeNow(r); } petal.forEach((p, i) => { p.y -= p.v * dt; if (p.y < 0.05) p.y = 9 + hash(i, t) * 4; dummy.position.set(p.x + Math.sin(t * 0.7 + p.ph) * 0.9, p.y, p.z + Math.cos(t * 0.5 + p.ph) * 0.6); dummy.rotation.set(t * p.v + p.ph, p.ph, t * 0.8 + p.ph); dummy.updateMatrix(); petalM.setMatrixAt(i, dummy.matrix); }); petalM.instanceMatrix.needsUpdate = true;
    for (const sh of shops) { sh.bell.rotation.x = Math.sin(t * 9) * 0.5 * (sh.ring || 0); sh.ring = Math.max(0, (sh.ring || 0) - dt * 0.7); }
    for (const q of strollers) { const k = (t * q.v + q.ph) % 2, u = k < 1 ? k : 2 - k; along(q.o, k < 1 ? q.pts : q.back, k < 1 ? u : 1 - u, 0.12); }
    for (const q of lorries) if (q.pts) { q.l.visible = true; const k = (t * 0.05 + q.i * 0.37) % 1; along(q.l, q.pts, k); } };
  // a few extra people stroll along the paths of the plan that is in the town, and lorries drive along a busy road
  const extra = [0, 1, 2, 3].map((i) => { const p = fig(g, 0, 0, 0, { k: 0.95 + (i % 2) * 0.3, shirt: SHIRTS[(i + 3) % 6], legs: '#4a556e', skin: SKIN[(i + 1) % 4], hair: HAIR[i % 5], cap: i % 2 ? null : '#e9ad1c', bag: i % 2 ? '#2e9b5a' : null }); p.visible = false; return p; });
  function ambient(m) { ambN++; strollers = []; const ok = m ? m.hs.map((h, i) => (m.walk[i] ? i : -1)).filter((i) => i >= 0) : []; extra.forEach((p, i) => { p.visible = !!ok.length; if (!ok.length) return; const j = ok[(i * 3 + 1) % ok.length], pts = [gatePt[j], ...m.hs[j].way.map(mid), [0, 10.6], [-4 + i * 1.6, 5]]; strollers.push({ o: p, pts, back: pts, v: 0.045 + i * 0.012, ph: i * 0.55 }); });
    if (m) for (const q of lorries) { const far = m.hs.filter((h) => h.joined).sort((a, b) => b.steps - a.steps)[q.i % 3]; q.pts = far ? [...far.way.map(mid), [0, 10.6]].map(([x, z]) => [x + 0.6, z]) : null; } }
  const quiet = () => { strollers = []; for (const p of extra) p.visible = false; };

  // ---- the hooks that the order of the steps calls ---------------------------------------------------------------------------------------
  const sample = group(g);   // a short stretch of path beside the forecourt that shows the kind of path the child is asking for
  s.asking = () => { bare(); quiet(); nb.visible = false; for (const t of tagPl) t.hide = true; famPlate.hide = true; granHome.hide = false; hooks.clear(); s.child = null; glide(VIEW.ask, 1.6); };
  s.words = (list) => { s.style = list[0] ?? 1; s.park = list[1] ?? 2; sample.clear(); outline.clear(); zonePlate.hide = true;
    if (list[0] !== undefined) { const b = BD.newBoard(2, true); b.cells[key(3, 0)] = { kind: 'bend', sides: [false, true, true, false] }; b.cells[key(4, 0)] = { kind: 'straight', sides: [false, true, false, true] }; b.cells[key(5, 0)] = { kind: 'bend', sides: [true, false, false, true] }; b.cells[key(5, 1)] = { kind: 'straight', sides: [true, false, true, false] }; const road = s.style === 2 ? 2 : 0; b.cells.forEach((p, k) => { if (p) drawPiece(sample, k, p, { road, wig: s.style === 0, mat: stone }); }); texBox(sample, 0, 10.6, road ? 5.2 : 2, 1.2, 0.02, 0.16, stone, 1.5, 1.5); if (road) { const l = lorry(sample); l.position.set(X(4) + 0.3, 0.05, Z(0)); l.rotation.y = Math.PI / 2; } trees.get(key(5, 1)).visible = false; } else trees.get(key(5, 1)).visible = true;
    if (list[1] !== undefined) { drawOutline(s.park); zonePlate.hide = false; } };
  s.showPlans = async () => { const me = run; sample.clear(); outline.clear(); zonePlate.hide = true; granHome.hide = true; bare(); [0, 1, 2].forEach(drawMap); nb.visible = true; for (const m of maps) m.m.scale.setScalar(0.01); glide(VIEW.board, 1.5); await wait(0.9);
    for (const i of [0, 1, 2]) { if (me !== run) return; beep(420 + i * 90, 0.08); tagPl[i].hide = false; await tw(0.4, (k) => maps[i].m.scale.setScalar(Math.max(0.01, back(k)))); } };
  s.test = async (api) => { const me = run; for (const t of tagPl) t.hide = true; await glide(VIEW.test, 1.5); if (me !== run) return false; nb.visible = false;
    // the shutters roll up, the awnings come out and the bells ring
    await tw(1.5, (k) => shops.forEach((sh, i) => sh.set(Math.max(0, Math.min(1, ease(k) * 1.4 - i * 0.2))))); shops.forEach((sh) => { sh.set(1); sh.ring = 1; }); chime(); await wait(0.6); if (me !== run) return false;
    for (const i of [0, 1, 2]) { if (new URLSearchParams(location.search).has('hold')) await new Promise((res) => { window.gaNext = res; }); api.step(W.short[i]); api.say(W.morning[i]); if (!await morning(i)) return false; await wait(0.5); flash(); const url = await snap(); if (me !== run) return false; hooks.postcard(i, url); await wait(1.1); if (me !== run) return false; }
    return true; };

  // ---- the play break: the child fits path pieces together on the board -------------------------------------------------------------------------
  const lines = group(g); lines.visible = false; for (let i = 0; i <= N; i++) { B(lines, 17.5 - i * 5, 28.5, 0.1, 35, 0.03, 0.03, '#ffffff', { ...NS, unlit: true, op: 0.55 }); B(lines, 0, 11 + i * 5, 35, 0.1, 0.03, 0.03, '#ffffff', { ...NS, unlit: true, op: 0.55 }); }
  const marks = []; const markAt = (k) => { if (!marks[k]) { const m = group(g, X(cOf(k)), 0.2, Z(rOf(k))), y = M('#ffdf3d', { unlit: true, raw: true, op: 0.86 }), ink = M('#1f2a44', { unlit: true, raw: true }); blk(m, 0, 0, 4.3, 4.3, 0, 0.06, '#ffdf3d', { shadow: false, mat: y }); for (let q = 0; q < 4; q++) for (const e of [-1, 1]) { blk(m, -1.6 + q * 1.07, e * 2.15, 0.6, 0.2, 0, 0.1, '#1f2a44', { shadow: false, mat: ink }); blk(m, e * 2.15, -1.6 + q * 1.07, 0.2, 0.6, 0, 0.1, '#1f2a44', { shadow: false, mat: ink }); } glowMarks(m); marks[k] = m; } return marks[k]; };
  s.playBreak = async (pick, api) => { const me = run, b = BD.newBoard(pick, s.park === 2), left = BD.stock(pick, s.park === 2), state = GATES.map(() => 'home'), toks = {}; let sel = pick === 2 ? 'fork' : 'straight', told = '', finished = false, slotN = 0;
    s.child = { plan: pick, board: b }; quiet(); showPlan(pick); atHome(); lines.visible = true; granHome.hide = false; glide(VIEW.play, 1.8);
    GATES.forEach((q, i) => { people[i].position.set(gatePt[i][0] + DX[q.side] * 0.9, 0, gatePt[i][1] + DZ[q.side] * 0.9); people[i].rotation.y = Math.atan2(-DX[q.side], -DZ[q.side]); });
    const kinds = ['straight', 'bend', 'fork', ...(left.bridge ? ['bridge'] : []), 'lift'];
    const targets = () => (sel === 'lift' ? b.cells.map((p, k) => (p ? k : -1)).filter((k) => k >= 0) : left[sel] > 0 ? BD.places(b, sel) : []);
    const show = () => { const tg = new Set(targets().filter((k) => sel === 'lift' ? false : !b.cells[k])); marks.forEach((m, k) => { if (m) m.visible = false; }); for (const k of tg) markAt(k).visible = true;
      for (const kd of kinds) { const el = toks[kd]; el.className = `tok mini${kd === sel ? ' on' : ''}${kd !== 'lift' && !left[kd] ? ' used' : ''}`; if (kd !== 'lift') el.querySelector('small').textContent = W.left(left[kd]); }
      const hs = BD.homes(b), joined = hs.filter((h) => h.joined).length, n = tg.size;
      const how = sel === 'lift' ? W.liftHow : !left[sel] ? W.noneLeft : n ? W.pieceHow[sel] : b.cells.some(Boolean) ? W.noPlace : W.firstPiece;
      api.say(finished ? [doneSay(), W.doneHow] : [told || W.joined(joined), how]); };
    const doneSay = () => (state.every((q) => q === 'walked') ? W.doneAll : W.doneSome); let nextBtn = null;
    // what happens at each home when the paths change: a family whose walk is short enough sets off for the shops; if the way is too long, the car comes out
    const react = () => { const hs = BD.homes(b); drawBoard(b, true); hs.forEach((h, i) => { const within = h.joined && h.steps <= BD.LIMIT[s.style];
        if (within && state[i] !== 'walked') { state[i] = 'walked'; cars[i].visible = false; people[i].visible = true; openGate(i, 1); const sl = h.gran ? 10 : slotN++ % 10, pts = walkWay(i, h.way, sl); tw(2 + lengthOf(pts) * 0.07, (k) => along(people[i], pts, k, 0.14)).then(() => faceShops(people[i], sl)); told = h.gran ? W.granWalks : W.homeWalks; beep(660, 0.1); setTimeout(() => beep(880, 0.12), 110); }
        else if (h.joined && !within && state[i] === 'home') { state[i] = 'car'; openGate(i, 1); cars[i].visible = true; cars[i].position.set(backPt[i][0], 0, backPt[i][1]); cars[i].rotation.y = homeAt[i][2]; told = W.tooFar; beep(200, 0.15, 'sawtooth', 0.04); }
        else if (!h.joined && state[i] === 'car') { state[i] = 'home'; cars[i].visible = false; } });
      const all = hs.every((h) => h.joined); if (all && !finished) { finished = true; chime(); api.done([doneSay(), W.doneHow]); nextBtn = document.querySelector('#tray .btn.sun'); setTray(); } else if (!all && finished) { finished = false; setTray(); } show(); };
    const act = (k) => { const c = cOf(k), r = rOf(k), p = b.cells[k]; told = '';
      if (sel === 'lift') { const kd = BD.lift(b, c, r); if (kd) { left[kd === 'cross' ? 'fork' : kd]++; beep(300, 0.08); } }
      else if (p && p.kind === sel) { if (BD.turn(b, c, r)) beep(520, 0.06); else told = W.oneWay; }
      else if (left[sel] > 0) { const old = BD.lay(b, c, r, sel); if (old) { left[sel]--; if (typeof old === 'string') left[old === 'cross' ? 'fork' : old]++; beep(440 + (k % 5) * 40, 0.09); } else told = W.noFit; }
      react(); };
    for (let k = 0; k < N * N; k++) hitBox(s, g, X(cOf(k)), 0, Z(rOf(k)), 4.9, 0.7, 4.9, () => me === run && s.child && s.child.board === b && (sel === 'lift' ? !!b.cells[k] : !!b.cells[k] || (left[sel] > 0 && BD.ways(b, cOf(k), rOf(k), sel).length > 0)), () => act(k));
    // the tray: one button for each kind of piece, one to take a piece back, the colours of the paving, and a quiet button that shows one way to do it
    for (const kd of kinds) { const el = document.createElement('button'); el.innerHTML = `${hooks.pieceIcon(kd)}<span>${W.piece[kd]}<small></small></span>`; el.onclick = () => { sel = kd; told = ''; show(); }; toks[kd] = el; }
    const sw = document.createElement('div'); sw.innerHTML = `<div class="sws-h">${W.colour}</div>`; const row = document.createElement('div'); row.className = 'sws three'; sw.append(row);
    PAVINGS.forEach((hex, i) => { const el = document.createElement('button'); el.className = `sw${i === s.paving ? ' on' : ''}`; el.style.background = hex; el.setAttribute('aria-label', W.colours[i]); el.onclick = () => { s.paving = i; mine.color.set(tone(hex)); [...row.children].forEach((q, j) => q.classList.toggle('on', j === i)); beep(600 + i * 80, 0.06); }; row.append(el); }); mine.color.set(tone(PAVINGS[s.paving]));
    const help = hooks.btn(W.showMe, '', () => { const at = b.cells.findIndex((p) => p && p.kind === 'bridge'), f = BD.florence(pick, s.park === 2, at >= 0 ? cOf(at) : null); b.cells = f.cells; for (const kd of ['straight', 'bend', 'fork', 'bridge']) left[kd] = 0; told = W.shown; react(); });
    const setTray = () => api.tray([...kinds.map((kd) => toks[kd]), sw, ...(finished && nextBtn ? [nextBtn] : [help])]);
    s.spot = (name, i) => (name === 'cell' ? [X(i % N), 0.3, Z(Math.floor(i / N))] : [0, 0, 0]);
    s.playState = () => ({ joined: BD.homes(b).filter((h) => h.joined).length, left: { ...left } });
    await wait(1.2); if (me !== run) return; setTray(); show(); };

  // ---- the town, another plan, the recap and the end --------------------------------------------------------------------------------------
  const endPlay = () => { lines.visible = false; marks.forEach((m) => { if (m) m.visible = false; }); granHome.hide = true; };
  s.town = async (pick) => { endPlay(); const m = settle(pick); ambient(m); await glide(VIEW.test, 2); };
  s.swap = (pick) => { endPlay(); const m = settle(pick); ambient(m); };
  s.recap = (answer) => { let open = true; quiet(); [0, 1, 2].forEach(drawMap); nb.visible = true; for (const m of maps) m.m.scale.setScalar(1); glide(VIEW.board, 1.6); const signs = [];
    s.spot = (name, i) => [2.55 - i * 3.55, 2.9, 7.3];
    [0, 1, 2].forEach((i) => { const ok = s.model(i).walkers === GATES.length, pl = plate(s, W.short[i], [2.55 - i * 3.55, 5.75, 7.3], 'tap'), go = () => { if (!open) return; open = false; for (const q of signs) q.hide = true; beep(ok ? 880 : 300, 0.15); const any = [0, 1, 2].filter((j) => s.model(j).walkers === GATES.length); W.recapYes = W.recapYesOf(W.short[i]); W.recapNo = any.length ? W.recapNoOf(any.map((j) => W.short[j])) : W.recapNone; answer(ok); };
      signs.push(pl); pl.el.onclick = go; hitBox(s, nb, 3.55 - i * 3.55, 1.1, -0.2, 3.5, 3.5, 0.6, () => open, go); }); };
  // the last picture: the family and Gran walk the last stretch of the path to the shops, with the camera low behind them
  s.walkHome = async (pick) => { const me = run; nb.visible = false; const m = settle(pick); quiet(); famPlate.hide = true; granPlate.hide = true; const h = m.hs[granI], way = (h.joined ? h.way : m.hs[0].way).map(mid), pts = [...way.slice(-5), [0, 10.6], [0.5, 2]], withGran = m.walk[granI];
    const gr = people[granI]; family.rotation.y = 0; family.scale.setScalar(1);
    const tmp = { position: new THREE.Vector3(), rotation: { y: 0 } };
    await tw(11, (k) => { const u = ease(k); along(tmp, pts, u, 0.1); family.position.copy(tmp.position); family.rotation.y = tmp.rotation.y - 0.5; if (withGran) { const q = { position: gr.position, rotation: gr.rotation }; along(q, pts, Math.min(1, u + 0.07), 0.1); gr.position.x += 1.3; }
      const L = lengthOf(pts), d = (o) => { const t = { position: new THREE.Vector3(), rotation: { y: 0 } }; along(t, pts, Math.max(0, Math.min(1, u + o / L))); return t.position; }, b0 = d(-7), a0 = d(7);
      s.eye = [b0.x - 0.6, 2.3, b0.z]; s.at = [a0.x, 1.5, a0.z]; s.fov = 50; });
    if (me !== run) return; family.rotation.y = 0; if (withGran) gr.rotation.y = Math.PI / 2; glide(VIEW.shops, 2.4); };
  // for the script that records the level
  s.spot = () => [0, 0, 0];
  s.start = () => { bare(); shops.forEach((sh) => sh.set(0)); granHome.hide = false; };
  s.start();
  return s;
}
