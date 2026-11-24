// Level 6, "A school for everyone": the play break. The child leads a walking bus, which is a real thing that schools do:
// a teacher and a line of children walk to school together and pick up friends on the way.
// The camera has crossed the river and travels beside the children at their shoulder height.
// The child's hands: choose the colour of the flag and the vests, click each friend who waits at a garden gate with a grown-up,
// choose one of two good ways at the fork, click the button on the crossing and wait for the green figure, and drag the bell rope.
// There is no score, no timer and no way to fail. After three minutes Florence offers to walk the rest of the way.
import { THREE, B, blk, group, fig, place, frame, M, hash, texBox, tileMat, FAMILY, SHIRTS, SKIN, HAIR } from '../../level-kit/blocks.js';
import { newScene, tw, wait, run, ease, back, hitBox, plate, glowMarks, glide, hot, canvas, project } from '../../level-kit/stage.js';
import { btn } from '../../level-kit/shell.js';
import { beep, chime } from '../../level-kit/sound.js';
import { LIGHT, AUTUMN, GRASS, INK, FLAGS, flagMat, flagN, setFlag, tree, appleTree, bale, duck, cloud, home, fence, school, car, tractor, puffs, KIDS, person, teacher, TEACHER2, badgeMat, bellMat, leaves } from './parts.js';

// the bell rope is dragged down with the mouse. A plain click on it rings the bell too, so that nobody gets stuck
let ROPE = null, drag = null;
canvas.addEventListener('pointerdown', (e) => { if (!ROPE || !ROPE.can()) return; const r = canvas.getBoundingClientRect(), p = project(...ROPE.at(), r); if (Math.hypot(e.clientX - p[0], e.clientY - p[1]) < 110) drag = { y: e.clientY }; });
canvas.addEventListener('pointermove', (e) => { if (!drag || !ROPE) return; const k = Math.max(0, Math.min(1, (e.clientY - drag.y) / 70)); ROPE.pull(k); if (k >= 1) { drag = null; ROPE.ring(); } });
addEventListener('pointerup', () => { if (drag && ROPE && ROPE.can()) ROPE.pull(0); drag = null; });

const bell = () => { beep(830, 1.5, 'sine', 0.13); beep(1245, 1.1, 'sine', 0.06); beep(1660, 0.7, 'sine', 0.03); };
const W = {   // every word here is a placeholder. Florence says one short sentence for each step
  colour: ['This is a walking bus. Choose a colour for the flag and the vests, and then set off.'], go: 'Set off', swatch: 'Flag and vests',
  friend: 'A friend is waiting at the gate. Click the friend.', family: 'Your family is waiting at the gate. Click the child.', joined: (k, n) => (k === n ? 'Everyone is on the walking bus.' : k === 1 ? 'The first friend is on the walking bus.' : `${k} of ${n} friends are on the walking bus.`),
  fork: 'Two good ways lead to school. Click the way you want.', ways: ['Through the orchard', 'Over the footbridge'], took: ['There is an apple for everyone in the orchard.', 'The ducks are following the walking bus.'],
  cross: 'Click the button on the crossing.', waiting: 'The red figure is showing. Everyone waits with the teacher.', green: 'The green figure is showing. The bus crosses with the teacher.',
  board: 'Every child hangs a badge. A shoe means walked, and a car means driven.', rope: 'Drag the bell rope down to ring the bell.', end: ['The walking bus picked apples in the orchard.', 'The ducks followed you all the way to school.'],
  skip: 'Florence, please walk us there' };

// cfg: ids are the children of this bus in the order they are picked up, other are the children of the bus from the other end, cars are the children who are driven
export function walkingBus(s, cfg, api) { const n = cfg.ids.length, nb = n > 3 ? 3 : 2, gates = []; for (let j = 0; j < nb; j++) gates.push(3 + 6 * j); const xf = 3 + 6 * nb; for (let j = 0; j < n - nb; j++) gates.push(xf + 19 + 6 * j);
  const xc = gates[n - 1] + 1.3 * n + 5.6,   /* the road is well beyond the place where the teacher stops for the last friend, so nobody stands on it */ xs = xc + 11, L = xs + 30, c = cfg.cars.length, m = cfg.other.length, me = run;
  const b = newScene(56, { ...LIGHT, tx: L / 2 - 4, sun: [-14, 36, 30] }), g = b.g, G = (hex) => tileMat('grass', hex);
  // ---- the ground, the river behind the camera, the path and the land behind ----
  texBox(g, L / 2, -46, L + 160, 108, -1, 1, G(GRASS), 3, 3); B(g, L / 2, 38, L + 160, 60, -1.3, 1.05, '#2b7fd8'); texBox(g, L / 2, 0, L + 80, 1.8, 0, 0.1, tileMat('pave', '#f3dfae'), 0.9, 0.9);
  for (let k = 0; k < 60; k++) B(g, -12 + hash(k, 41) * (L + 30), 1.6 + hash(k, 42) * 5.6, 0.16, 0.16, 0, 0.2, ['#fff', '#ffd257', '#ff8fb8'][k % 3], { raw: true, shadow: false });
  texBox(g, L / 2, -26, L + 160, 10, 0, 2.4, G('#93c450'), 3, 3); for (let k = 0; k < (L + 60) / 4.6; k++) { tree(g, -30 + k * 4.6 + hash(k, 4) * 2, -24 - hash(k, 5) * 4, 6 + hash(k, 6) * 4, AUTUMN[Math.floor(hash(k, 7) * 6)]).position.y = 2.4; B(g, -30 + k * 4.6, -20.6, 4.7, 0.7, 0, 1.3, '#5f9a3c', { tex: 'leaf' }); }
  texBox(g, L / 2, -44, L + 200, 14, 0, 7, G('#a3c657'), 4, 4); for (let k = 0; k < (L + 80) / 9; k++) { B(g, -40 + k * 9 + hash(k, 8) * 3, -37.4, 7.4, 1.4, 2.4, 4.6, ['#e9c04e', '#b7c94f', '#c98a4a', '#f0d06a'][k % 4], { tex: 'stripe', shadow: false }); tree(g, -40 + k * 9 + hash(k, 9) * 4, -44, 8 + hash(k, 10) * 4, AUTUMN[k % 5]).position.y = 7; }
  B(g, L / 2, -75, L + 260, 30, 0, 13, '#98b96a', { shadow: false }); B(g, L / 2, -120, L + 400, 30, 0, 22, '#a9c2d2', { shadow: false }); for (let k = 0; k < 6; k++) cloud(g, -50 + k * 44 + hash(k, 3) * 20, 34 + hash(k, 2) * 8, -150, 1.4 + hash(k, 1));
  const blow = leaves(g, 46, { w: 34, size: 0.2, y: 0.2, h: 3.2, z0: -5, zd: 11 });
  // ---- small things that answer a tap, for a child who looks around: grown-ups hop, ducks quack, an apple drops from a tree ----
  const toy = (o, w, h, fn) => { hitBox(s, o, 0, 0, 0, w / o.scale.x, h / o.scale.y, w / o.scale.x, () => true, () => fn(o)); return o; }, hop = (o, k = 0.45) => { const y0 = o.userData.y0 ??= o.position.y; tw(0.45, (t) => { o.position.y = y0 + Math.sin(t * Math.PI) * k; }); }, quack = () => { beep(520, 0.07, 'square', 0.04); setTimeout(() => beep(410, 0.1, 'square', 0.04), 90); };
  const fallen = []; const drop = (x, z) => { const a = B(g, x + (Math.random() - 0.5), z, 0.26, 0.26, 3, 0.26, '#e23b2e', { raw: true }); fallen.push({ a, v: 0 }); beep(300, 0.08); }, falls = (dt) => { for (const f of fallen) { if (f.done) continue; f.v += dt * 14; f.a.position.y -= f.v * dt; if (f.a.position.y < 0.23) { f.a.position.y = 0.23; if (f.v > 2) f.v = -f.v * 0.35; else f.done = true; } } };
  // ---- a home, a gate, a walking bus stop and a waiting friend for every child of the bus ----
  const marks = [], walkers = [], waiting = [];
  gates.forEach((gx, j) => { const id = cfg.ids[j], h = home(g, gx - 0.98, -8.6, id, { farm: cfg.farm }); h.scale.setScalar(1.5); B(g, gx, -4.3, 1.2, 4, 0, 0.06, '#e8d9bd', { shadow: false });
    B(g, gx - 1.5, -2.5, 0.12, 0.12, 0, 2.3, '#fffaf0'); blk(g, gx - 1.5, -2.5, 0.8, 0.1, 2.3, 0.8, '#fff', { mat: flagMat }); tree(g, gx + 3.4, -5.4 - (j % 2), 4.6 + (j % 3) * 0.6, AUTUMN[(j * 2 + 1) % 5]);
    const w = person(g, { ...KIDS[id], arms: ['up', 'down'], turn: 0.25 }, gx, 0.1, -1.6); waiting.push(w); const p = person(g, { ...KIDS[id], vest: true }); p.visible = false; walkers.push(p); p.apple = B(p, 0.42, 0.2, 0.2, 0.2, 0.6, 0.2, '#e23b2e', { raw: true }); p.apple.visible = false;
    if (id === 6) { fig(g, gx + 1.2, 0.1, -3.2, { ...FAMILY[1], turn: 0.1, arms: ['down', 'up'] }); fig(g, gx - 0.4, 0.1, -3.4, { ...FAMILY[2], turn: 0.3, arms: ['up', 'down'] }); }
    else toy(fig(g, gx + 1.1, 0.1, -3.2, { k: 1.28, shirt: SHIRTS[(id + 2) % 6], skin: SKIN[(id + 1) % 4], hair: HAIR[id % 5], long: id % 2 === 0, turn: 0.1, arms: ['down', 'up'] }), 1.2, 2.4, (o) => { hop(o); beep(660, 0.1); });
    const mk = group(g, gx, 0, -1.6); glowMarks(place(mk, 0, 0, 2.1, 2.1, 0.1)); const ar = group(mk, 0, 2.5, 0); B(ar, 0, 0, 0.5, 0.5, 0.3, 0.5, '#ffdf3d', { unlit: true, raw: true, shadow: false }); B(ar, 0, 0, 0.26, 0.26, 0, 0.3, '#ffdf3d', { unlit: true, raw: true, shadow: false }); glowMarks(ar); mk.arrow = ar; mk.visible = false; marks.push(mk);
    hitBox(s, g, gx, 0, -1.6, 2.6, 3.4, 2.6, () => want === 'friend' && at === j, () => answer()); });
  fence(g, -12, xf - 1.4, -2.5, gates); fence(g, xf + 16.6, xc - 0.9, -2.5, gates); for (let x = gates[n - 1] + 6.4, k = 0; x < xc - 2.5; x += 3.6, k++) tree(g, x, -5.6 - (k % 2) * 1.4, 4.4 + (k % 3) * 0.7, AUTUMN[(k * 2) % 5]);
  for (let k = 0; k < 4; k++) { home(g, -6 - k * 6.2, -8.6, k + 3).scale.setScalar(1.5); tree(g, -9 - k * 6.2, -5.6, 5, AUTUMN[k % 5]); }
  // ---- the fork: one way goes through the orchard, the other goes over the footbridge by the duck pond. Both are good ----
  const slabs = (pts) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], len = Math.hypot(x1 - x0, z1 - z0), nn = Math.ceil(len / 0.95); for (let k = 0; k <= nn; k++) texBox(g, x0 + (x1 - x0) * k / nn, z0 + (z1 - z0) * k / nn, 1.5, 1.5, 0, 0.09, tileMat('pave', '#f3dfae'), 0.75, 0.75); } };
  slabs([[xf + 0.5, 0], [xf + 3.5, -4.6], [xf + 12.5, -4.6], [xf + 15.5, 0]]); slabs([[xf + 0.5, 0], [xf + 3.5, 3.6]]); slabs([[xf + 12.5, 3.6], [xf + 15.5, 0]]);
  for (let k = 0; k < 6; k++) toy(appleTree(g, xf + 3 + k * 2.1, -7.6 - (k % 2) * 1.6, 4.8 + (k % 3) * 0.4), 2.6, 5, (o) => { hop(o, 0.12); drop(o.position.x, o.position.z + 1.5); }); appleTree(g, xf + 1.6, -4.4, 3.6); appleTree(g, xf + 14.6, -4.6, 3.8);
  for (const [x, z] of [[xf + 6, -6], [xf + 10, -6.2]]) { B(g, x, z, 0.9, 0.7, 0, 0.5, '#b98a5a', { tex: 'board' }); for (let k = 0; k < 4; k++) B(g, x - 0.25 + (k % 2) * 0.5, z - 0.15 + Math.floor(k / 2) * 0.3, 0.26, 0.26, 0.5, 0.2, '#e23b2e', { raw: true }); }
  B(g, xf + 8, 5.4, 9.4, 6.4, 0.0, 0.05, '#3c8de0', { shadow: false }); B(g, xf + 8, 5.4, 9.8, 6.8, 0, 0.03, '#b79a62', { shadow: false });
  texBox(g, xf + 8, 3.6, 9.4, 1.7, 0.32, 0.14, tileMat('board', '#c79a62'), 0.9, 0.9); for (const x of [xf + 3.4, xf + 12.6]) texBox(g, x, 3.6, 0.7, 1.7, 0.1, 0.2, tileMat('board', '#c79a62'), 0.9, 0.9);
  for (let k = 0; k < 6; k++) { B(g, xf + 3.6 + k * 1.76, 2.66, 0.14, 0.14, 0.4, 0.8, '#8a5a34'); if (k < 5) B(g, xf + 4.48 + k * 1.76, 2.66, 1.76, 0.08, 1.05, 0.1, '#8a5a34', { shadow: false }); }
  const ducks = [duck(g, xf + 6, 0.05, 5.6, 0.9), duck(g, xf + 9.4, 0.05, 6.4, 0.7), duck(g, xf + 7.6, 0.05, 6.9, 0.55)]; for (const q of ducks) toy(q, 1.8, 1.5, (o) => { const k0 = o.userData.k0 ??= o.scale.x; tw(0.45, (t) => o.scale.setScalar(k0 * (1 + Math.sin(t * Math.PI) * 0.6))); quack(); });
  const ways = [[xf + 2.6, -3.2], [xf + 2.6, 2.4]].map(([x, z], i) => { const p = group(g, x, 0, z); glowMarks(place(p, 0, 0, 2.6, 2.2, 0.11)); B(p, -1.3, i ? 0.9 : -0.9, 0.14, 0.14, 0, 2.4, '#fffaf0'); B(p, -0.9, i ? 0.9 : -0.9, 1.1, 0.1, 1.7, 0.7, '#fffaf0');
    if (i) { const d = duck(p, -0.9, 1.85, 0.98, 0.5); d.rotation.y = 0; } else { B(p, -0.9, -0.84, 0.4, 0.06, 1.85, 0.4, '#e23b2e', { raw: true }); B(p, -0.86, -0.84, 0.1, 0.06, 2.25, 0.12, '#2e9b5a', { raw: true }); }
    p.visible = false; const sign = plate(s, W.ways[i], [x + (i ? 1.2 : -2.6), i ? 2.6 : 4.2, z], 'tap'); sign.hide = true; sign.el.onclick = () => { if (want === 'fork') { forkPick = i; answer(); } }; hitBox(s, g, x, 0, z, 3.4, 3, 3, () => want === 'fork', () => { forkPick = i; answer(); }); return { p, sign, at: [x, 0.6, z] }; });
  // ---- the crossing, with a button, a red figure and a green figure. Cars wait behind the line while the bus crosses ----
  B(g, xc + 2, -40, 4, 96, 0, 0.06, '#8d9299'); for (let z = -84; z < -4; z += 3) B(g, xc + 2, z, 0.14, 1.3, 0.06, 0.02, '#e9e6dc', { shadow: false }); B(g, xc + 2, 0, 4, 2.2, 0.06, 0.03, '#8d9299', { shadow: false });
  for (let k = 0; k < 5; k++) B(g, xc + 0.4 + k * 0.8, 0, 0.46, 2.1, 0.09, 0.03, '#fffdf4', { unlit: true, raw: true, shadow: false }); B(g, xc + 2, -2.2, 3.6, 0.3, 0.06, 0.03, '#fffdf4', { shadow: false });
  const lampM = (hex) => new THREE.MeshBasicMaterial({ color: hex }), redM = lampM('#ff3b30'), greenM = lampM('#2a5a36'), carM = lampM('#2a5a36');
  for (const [x, z] of [[xc - 0.7, -1.5], [xc + 4.7, -1.5]]) { B(g, x, z, 0.16, 0.16, 0, 3.4, '#30343c'); B(g, x, z, 0.7, 0.4, 2.2, 1.5, '#30343c');
    const r = group(g, x, 3.0, z + 0.21); blk(r, 0, 0, 0.16, 0.04, 0.34, 0.16, '#f00', { mat: redM, shadow: false }); blk(r, 0, 0, 0.26, 0.04, 0.06, 0.28, '#f00', { mat: redM, shadow: false }); blk(r, 0, 0, 0.1, 0.04, -0.06, 0.14, '#f00', { mat: redM, shadow: false });
    const w = group(g, x, 2.32, z + 0.21); blk(w, 0, 0, 0.16, 0.04, 0.4, 0.16, '#0f0', { mat: greenM, shadow: false }); blk(w, 0, 0, 0.22, 0.04, 0.14, 0.26, '#0f0', { mat: greenM, shadow: false }); blk(w, -0.1, 0, 0.09, 0.04, 0, 0.16, '#0f0', { mat: greenM, shadow: false }); blk(w, 0.11, 0, 0.09, 0.04, 0.02, 0.16, '#0f0', { mat: greenM, shadow: false }); blk(w, 0.17, 0, 0.1, 0.04, 0.24, 0.07, '#0f0', { mat: greenM, shadow: false }); }
  B(g, xc + 4.7, -3.6, 0.16, 0.16, 0, 3.6, '#30343c'); B(g, xc + 4.7, -3.6, 0.5, 0.5, 3.6, 1.1, '#30343c'); blk(g, xc + 4.7, -3.6, 0.56, 0.56, 3.76, 0.34, '#0f0', { mat: carM, shadow: false });
  B(g, xc - 0.7, -1.28, 0.34, 0.12, 1.0, 0.44, '#ffdf3d', { raw: true }); const press = group(g, xc - 0.7, 0, -1.2); glowMarks(frame(press, 0, 0.6, 0, 1.3, 1.3)); glowMarks(place(press, 0, 0.5, 1.8, 1.4, 0.11)); press.visible = false;
  hitBox(s, g, xc - 0.7, 0, -1.0, 2.6, 3, 2.4, () => want === 'button', () => answer());
  const vs = (c ? cfg.cars : [-1]).map((id, k) => { const v = c ? car(g, 0, 0, k) : tractor(g, 0, 0); v.scale.setScalar(1.5); v.rotation.y = -Math.PI / 2; v.position.set(xc + 2, 0, -8 - k * 9); if (c) { const o = KIDS[id]; B(v.kid, 0, 0, 0.42, 0.42, 0, 0.42, o.skin); B(v.kid, 0, 0, 0.46, 0.46, 0.34, 0.12, o.hair); if (o.cap) B(v.kid, 0, 0, 0.48, 0.48, 0.4, 0.1, o.cap); } v.len = c ? 4.7 : 8.6; return v; }), smoke = puffs(g, 50);
  const STOPZ = c ? -4.4 : -4.0; let halt = false;
  // ---- the school, its yard, the board for the badges and the bell with its rope ----
  const sc = school(g, xs + 10, -15.5); sc.scale.setScalar(2.2); texBox(g, xs + 12, -6.8, 30, 8.4, 0, 0.07, tileMat('pave', '#f0e2c0'), 1.2, 1.2); fence(g, xc + 5.2, xs + 27, -2.5, [xs - 0.4, xs + 0.4, xs + 21.6, xs + 22.4]);
  for (const x of [xs - 1.2, xs + 1.2]) { B(g, x, -2.5, 0.4, 0.4, 0, 1.9, '#d2553a'); B(g, x, -2.5, 0.56, 0.56, 1.9, 0.2, '#fffaf0'); } tree(g, xs + 24.5, -9, 7, AUTUMN[1]); tree(g, xs + 19, -12.6, 6, AUTUMN[2]);
  const board = group(g, xs + 10.2, 0, -8.8); B(board, -3.6, 0, 0.2, 0.2, 0, 4.6, '#8a5a34'); B(board, 3.6, 0, 0.2, 0.2, 0, 4.6, '#8a5a34'); B(board, 0, 0, 7.6, 0.16, 1.9, 2.7, '#fffaf0'); B(board, 0, -0.02, 7.9, 0.2, 4.6, 0.25, '#d2553a'); B(board, 0, -0.02, 7.9, 0.2, 1.75, 0.18, '#8a5a34');
  const slots = Array.from({ length: 12 }, (_, k) => { const x = -3.05 + (k % 6) * 1.22, y = 3.35 - Math.floor(k / 6) * 1.25; blk(board, x, 0.1, 0.16, 0.06, y + 0.9, 0.16, INK, { mat: M(INK), shadow: false }); const q = blk(board, x, 0.12, 0.98, 0.04, y - 0.1, 0.98, '#fff', { mat: badgeMat('shoe'), shadow: false }); q.visible = false; return q; });
  const bx = xs + 3.1, bz = -3.6, tower = group(g, bx, 0, bz); for (const a of [-0.8, 0.8]) B(tower, a, 0, 0.22, 0.22, 0, 3.7, '#fffaf0'); B(tower, 0, 0, 2.2, 0.3, 3.7, 0.22, '#fffaf0'); B(tower, 0, 0, 2.7, 1.3, 3.92, 0.3, '#d2553a', { tex: 'tile' }); B(tower, 0, 0, 1.7, 1.3, 4.22, 0.3, '#d2553a', { tex: 'tile' });
  const bellG = group(tower, 0, 3.7, 0); blk(bellG, 0, 0, 0.9, 0.9, -1.15, 0.7, '#ffc23a', { mat: bellMat }); blk(bellG, 0, 0, 0.6, 0.6, -0.5, 0.4, '#ffc23a', { mat: bellMat }); blk(bellG, 0, 0, 0.2, 0.2, -1.35, 0.2, '#8a5a22', { mat: M('#8a5a22') });
  const rope = group(tower, 0.52, 2.3, 0.3), cord = B(rope, 0, 0, 0.07, 0.07, -0.9, 0.9, '#e8d9bd', { shadow: false }), grip = group(rope, 0, -0.9, 0); B(grip, 0, 0, 0.3, 0.3, -0.36, 0.36, '#ffdf3d', { unlit: true, raw: true }); const ropeMark = glowMarks(frame(grip, 0, -0.9, 0.2, 1.4, 1.5)); ropeMark.visible = false;
  const rings = [0, 1, 2].map(() => { const q = new THREE.Mesh(new THREE.RingGeometry(0.955, 1, 64), new THREE.MeshBasicMaterial({ color: '#ffd257', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); q.visible = false; g.add(q); return q; });
  hitBox(s, g, bx + 0.52, 0.2, bz + 0.3, 2.2, 3, 2, () => want === 'rope', () => ROPE && ROPE.ring());
  // ---- the people: the teacher with the flag, the bus from the other end, and the children who are driven ----
  const lead = teacher(g), lead2 = teacher(g, TEACHER2), others = cfg.other.map((id) => person(g, { ...KIDS[id], vest: true })), driven = cfg.cars.map((id) => { const p = person(g, KIDS[id]); p.visible = false; return p; }); lead2.visible = false; for (const p of others) p.visible = false;

  // ---- the route. It grows when the child has chosen a way at the fork ----
  const pts = [[-4, 0, 0], [xf + 0.5, 0, 0]], cum = [0]; const grow = (more) => { for (const p of more) { const a = pts[pts.length - 1]; pts.push(p); cum.push(cum[cum.length - 1] + Math.hypot(p[0] - a[0], p[2] - a[2])); } }; cum.push(xf + 4.5);
  const pos = (d) => { d = Math.max(0, Math.min(cum[cum.length - 1], d)); let i = 0; while (i < cum.length - 2 && cum[i + 1] < d) i++; const a = pts[i], q = pts[i + 1], k = (d - cum[i]) / Math.max(0.001, cum[i + 1] - cum[i]); return { x: a[0] + (q[0] - a[0]) * k, y: a[1] + (q[1] - a[1]) * k, z: a[2] + (q[2] - a[2]) * k, turn: Math.atan2(q[0] - a[0], q[2] - a[2]) }; };
  const dOf = (x) => { for (let i = pts.length - 2; i >= 0; i--) if (pts[i][0] <= x) return cum[i] + (cum[i + 1] - cum[i]) * Math.min(1, (x - pts[i][0]) / Math.max(0.001, pts[i + 1][0] - pts[i][0])); return 0; };
  const GAP = 1.3; let cheer = 0, took = false, apples = false, said = false, follow = false; let d = dOf(1.2), moving = false, joined = 0, at = -1, want = null, forkPick = 0, auto = false, pending = null, done = false, showSkip = false, started = false, camOn = true, yard = null;
  const answer = () => { want = null; if (pending) pending(); };
  const until = (what) => new Promise((res) => { if (auto) return res(); pending = () => { pending = null; res(); }; want = what; });
  const walkTo = async (to) => { const d0 = d, sec = Math.max(0.3, (to - d0) / 3.3); moving = true; await tw(sec, (k) => { d = d0 + (to - d0) * k; }); moving = false; };
  const poseLine = (t) => { const q = pos(d); lead.position.set(q.x, q.y + 0.1 + (moving ? Math.abs(Math.sin(d * 2.6)) * 0.05 : 0), q.z); lead.rotation.y = moving || !yard ? q.turn : 0.35; lead.stride(d * 2.6, moving ? 1 : 0);
    for (let j = 0; j < joined; j++) { const p = walkers[j]; if (p.busy) continue; const dj = d - GAP * (j + 1), w = pos(dj); p.position.set(w.x, w.y + 0.1 + (moving ? Math.abs(Math.sin(dj * 2.9 + j)) * 0.06 : 0), w.z); p.rotation.y = moving || !yard ? w.turn : 0.2; p.stride(dj * 2.9 + j, moving ? 1 : 0); if (cheer > 0) p.position.y += Math.abs(Math.sin(t * 11 + j)) * 0.25 * cheer;
      if (took && !forkPick && !p.apple.visible && w.x > xf + 5 + j * 0.3) { p.apple.visible = true; apples = true; beep(700 + j * 60, 0.07); if (!said) { said = true; api.say(W.took[0]); } } }
    if (took && forkPick && !said && q.x > xf + 9) { said = true; follow = true; quack(); api.say(W.took[1]); } };

  // ---- the band: the colours, the button that starts, and Florence's offer after three minutes ----
  const tray = () => { const box = document.createElement('div'), h = document.createElement('div'), sw = document.createElement('div'); h.className = 'sws-h'; h.textContent = W.swatch; sw.className = 'sws four';
    FLAGS.forEach(([name, hex], k) => { const q = document.createElement('button'); q.className = `sw${k === flagN ? ' on' : ''}`; q.style.background = hex; q.setAttribute('aria-label', `${name} flag`); q.onclick = () => { setFlag(k); beep(500 + k * 80, 0.08); tray(); }; sw.append(q); }); box.append(h, sw);
    api.tray([box, ...(started ? [] : [btn(W.go, 'sun', () => { started = true; tray(); answer(); })]), ...(showSkip && !done ? [btn(W.skip, '', () => { auto = true; showSkip = false; tray(); answer(); })] : [])], false); };

  async function play() { const live = () => me === run; s.wants = () => want; s.spot = (name, i = 0) => ({ friend: () => [gates[at], 1.1, -1.6], fork: () => ways[i].at, button: () => [xc - 0.7, 1.1, -1.2], rope: () => ROPE.at() }[name]());
    tw(180, () => {}).then(() => { if (live() && !done) { showSkip = true; tray(); } });
    api.say(W.colour); tray(); await until('go'); if (!live()) return; started = true; tray(); chime();
    const stopAt = async (j) => { await walkTo(dOf(gates[j]) + GAP * (j + 1) + 1.7); if (!live()) return; at = j; marks[j].visible = true; api.say(cfg.ids[j] === 6 ? W.family : W.friend); await until('friend'); if (!live()) return; marks[j].visible = false; beep(620 + j * 60, 0.1);
      const p = walkers[j], w0 = waiting[j], to = pos(d - GAP * (j + 1)); w0.visible = false; p.visible = true; p.busy = true; joined = j + 1; const hopH = [0.5, 0.3, 0.75, 0.4, 0.3, 0.9][j % 6], spin = [0, 1, 0, -1, 0, 2][j % 6]; beep([523, 587, 659, 698, 784, 880][j % 6], 0.18); await tw(0.7, (k) => { const e = ease(k); p.position.set(gates[j] + (to.x - gates[j]) * e, 0.1 + Math.abs(Math.sin(k * Math.PI * (j % 3 === 2 ? 2 : 1))) * hopH, -1.6 + (to.z + 1.6) * e); p.rotation.y = 0.25 + (to.turn - 0.25) * e + spin * Math.PI * 2 * e; }); p.busy = false; if (apples) p.apple.visible = true; if (j % 2 || j === n - 1) { cheer = 1; chime(); } api.say(W.joined(j + 1, n)); await wait(0.2); };
    for (let j = 0; j < nb; j++) { await stopAt(j); if (!live()) return; }
    // the fork
    await walkTo(dOf(xf - 0.4)); if (!live()) return; camOn = false; glide({ eye: [xf - 5.5, 3.8, 13], at: [xf + 3.2, 1.0, 0.2], fov: 44 }, 1.4); for (const w of ways) { w.p.visible = true; w.sign.hide = false; } api.say(W.fork); await until('fork'); if (!live()) return; for (const w of ways) { w.p.visible = false; w.sign.hide = true; } beep(700, 0.1); camOn = true;
    grow(forkPick ? [[xf + 3.5, 0, 3.6], [xf + 4.2, 0.36, 3.6], [xf + 11.8, 0.36, 3.6], [xf + 12.5, 0, 3.6], [xf + 15.5, 0, 0]] : [[xf + 3.5, 0, -4.6], [xf + 12.5, 0, -4.6], [xf + 15.5, 0, 0]]);
    grow([[xs - 1.6, 0, 0], [xs, 0, -2.5], [xs + 1.8, 0, -4.8], [xs + 5.6 + GAP * n, 0, -4.8]]); took = true;
    for (let j = nb; j < n; j++) { await stopAt(j); if (!live()) return; }
    // the crossing: press the button, wait for the green figure, cross with the teacher
    await walkTo(dOf(xc - 2.6)); if (!live()) return; at = -1; camOn = false; glide({ eye: [xc - 6, 3.4, 12.5], at: [xc - 3.5, 1.5, -2.5], fov: 40 }, 1.6); press.visible = true; api.say(W.cross); await until('button'); if (!live()) return; press.visible = false; beep(440, 0.12); halt = true; carM.color.set('#ff3b30'); api.say(W.waiting);
    for (let k = 0; k < 60; k++) { await wait(0.25); if (!live()) return; if (k >= 5 && !vs.some((v) => v.position.z > STOPZ + 0.6 && v.position.z < 9.5)) break; }
    redM.color.set('#5a2320'); greenM.color.copy(hot('#35e06a', 1.5)); beep(880, 0.12); beep(1100, 0.2); api.say(W.green); await wait(0.5);
    yard = null; const wait2 = (async () => { if (!m) return; lead2.visible = true; for (const p of others) p.visible = true; await tw((c2[c2.length - 1] - 8) / 3.5, (k) => { o2 = k; }); })();
    await walkTo(dOf(xc + 5.6)); if (!live()) return; glide({ eye: [xs + 10.5, 3.3, 8.6], at: [xs + 9.6, 2.1, -6], fov: 44 }, 2.4); await walkTo(cum[cum.length - 1]); if (!live()) return; yard = true; await wait2; if (!live()) return;
    // the children who were driven get out and walk in from the road
    await Promise.all(driven.map(async (p, j) => { const v = vs[j], x1 = xs + 4 + GAP * j, z0 = v.position.z; await wait(j * 0.25); if (!live()) return; v.kid.visible = false; p.visible = true; await tw(1.8 + Math.abs(z0) * 0.12, (k) => { const a = Math.min(1, k * 2), e = Math.max(0, k * 2 - 1); p.position.set(xc + 5.4 + (x1 - xc - 5.4) * e, 0.1, z0 + (-6.6 - z0) * a); p.rotation.y = a < 1 ? 0 : e < 1 ? Math.PI / 2 : 0.1; p.stride(k * 30, k < 1 ? 1 : 0); }); })); if (!live()) return;
    // every child hangs a badge
    api.say(W.board); const kinds = [...cfg.ids.map(() => 'shoe'), ...cfg.other.map(() => 'shoe'), ...cfg.cars.map(() => 'car')];
    for (const [k, kind] of kinds.entries()) { const q = slots[k]; q.material = badgeMat(kind); q.visible = true; beep(kind === 'shoe' ? 700 + k * 25 : 300, 0.07); await tw(0.22, (u) => q.scale.setScalar(Math.max(0.01, back(u)))); if (!live()) return; } await wait(auto ? 0.6 : 1.6); if (!live()) return;
    // the bell
    glide({ eye: [bx + 3.4, 2.5, 4.6], at: [bx + 1.2, 2.5, bz], fov: 44 }, 1.8); api.say(W.rope); ropeMark.visible = true; let rung = false, res0 = null; const rang = new Promise((r) => { res0 = r; });
    ROPE = { can: () => want === 'rope' && !rung, at: () => [bx + 0.52, 1.25 - 0.0, bz + 0.3], pull: (k) => { grip.position.y = -0.9 - k * 0.5; cord.scale.y = 1 + k * 0.55; cord.position.y = -0.45 - k * 0.25; bellG.rotation.z = k * 0.3; }, ring: () => { if (rung) return; rung = true; want = null; res0(); } };
    await Promise.race([until('rope'), rang]); if (!live()) return; rung = true; want = null; ropeMark.visible = false; bell(); ROPE.pull(1);
    glide({ eye: [xs + 10.5, 3.3, 9.4], at: [xs + 8.6, 2.6, -6], fov: 46 }, 2.2);
    await tw(3, (k) => { const t = k * 3; ROPE.pull(Math.max(0, 1 - t * 2)); bellG.rotation.z = Math.sin(t * 9) * 0.6 * (1 - k); sc.bell.rotation.z = Math.sin(t * 9) * 0.5 * (1 - k); rings.forEach((q, i) => { const r = (t - i * 0.4) * 9; q.visible = r > 0; q.position.set(bx, 2.8, bz + 0.6); q.scale.setScalar(Math.max(0.01, r)); q.material.opacity = 0.9 * Math.max(0, 1 - r / 24); });
      [...walkers, ...others, ...driven].forEach((p, i) => { if (p.visible) p.position.y = 0.1 + Math.abs(Math.sin(t * 6 + i)) * 0.22 * (1 - k); }); }); if (!live()) return; for (const q of rings) q.visible = false; ROPE = null; done = true; tray(); chime();
    api.done([cfg.doneSay, ...(took ? [W.end[forkPick]] : [])]); }
  // the bus from the other end walks in through the second gate and lines up behind
  let o2 = 0; const R2 = [[xs + 46, 0, 0], [xs + 23.4, 0, 0], [xs + 22, 0, -2.5], [xs + 20.5, 0, -6.6], [xs + 4.4 + GAP * c, 0, -6.6]], c2 = [0]; for (let i = 1; i < R2.length; i++) c2.push(c2[i - 1] + Math.hypot(R2[i][0] - R2[i - 1][0], R2[i][2] - R2[i - 1][2]));
  const pos2 = (dd) => { dd = Math.max(0, Math.min(c2[c2.length - 1], dd)); let i = 0; while (i < c2.length - 2 && c2[i + 1] < dd) i++; const a = R2[i], q = R2[i + 1], k = (dd - c2[i]) / (c2[i + 1] - c2[i]); return { x: a[0] + (q[0] - a[0]) * k, z: a[2] + (q[2] - a[2]) * k, turn: Math.atan2(q[0] - a[0], q[2] - a[2]) }; };
  const poseOther = () => { if (!lead2.visible) return; const T = c2[c2.length - 1], d2 = 8 + (T - 8) * o2, mv = o2 < 1; [lead2, ...others].forEach((p, k) => { const dk = d2 - GAP * k, q = pos2(dk); p.position.set(q.x, 0.1 + (mv ? Math.abs(Math.sin(dk * 2.7 + k)) * 0.05 : 0), q.z); p.rotation.y = mv ? q.turn : 0.1; p.stride(dk * 2.7 + k, mv ? 1 : 0); }); };

  let pt = 0; const tick = (t, dt) => { poseLine(t); poseOther(); blow(t, lead.position.x); smoke.tick(dt); cheer = Math.max(0, cheer - dt * 1.2); falls(dt); ducks.forEach((q, k) => { if (follow) { const w = pos(Math.max(dOf(xf + 5), d - GAP * (joined + 1.7 + k * 0.85))), e = 1 - Math.exp(-dt * 4); q.position.x += (w.x - q.position.x) * e; q.position.z += (w.z - q.position.z) * e; q.position.y = w.y + 0.1 + Math.abs(Math.sin(t * 9 + k)) * 0.06; q.rotation.y = w.turn - Math.PI / 2; } else { q.position.x += Math.sin(t * 0.4 + k * 2) * dt * 0.4; q.position.y = 0.05 + Math.sin(t * 2 + k) * 0.02; } });
    for (const [j, w] of waiting.entries()) if (w.visible) w.position.y = 0.1 + Math.abs(Math.sin(t * 3.2 + j)) * 0.12; for (const mk of marks) if (mk.visible) { mk.arrow.position.y = 2.5 + Math.sin(t * 5) * 0.16; mk.arrow.rotation.y = t * 2; }
    sc.flag.rotation.y = Math.sin(t * 5) * 0.25; if (press.visible) press.scale.setScalar(1 + Math.sin(t * 5) * 0.05);
    // the cars come down the side road. When the button has been pressed they stop behind the line, one behind another
    const sorted = [...vs].sort((a, q) => q.position.z - a.position.z); let rank = 0; for (const v of sorted) { let z = v.position.z + dt * (c ? 6 : 4.2); if (halt && v.position.z <= STOPZ + 0.01) { z = Math.min(z, STOPZ - rank * (v.len + 0.6)); rank++; } if (z > 13) z -= 60; v.idle = z === v.position.z; v.position.z = z; }
    pt += dt; if (pt > 0.4) { pt = 0; if (c) for (const v of vs) smoke.emit(v.position.x + 0.3, 0.8, v.position.z - 2.3, 1.1); }
    if (camOn) { const q = pos(d - GAP * (joined + 1) * 0.5), k = 1 - Math.exp(-dt * 3), to = [[q.x + 5.4, 3.0, 12.8 + Math.max(0, q.z) * 0.5], [q.x - 1.0, 1.75, q.z - 0.6]]; s.fov += (36 - s.fov) * k; s.eye = s.eye.map((v, i) => v + (to[0][i] - v) * k); s.at = s.at.map((v, i) => v + (to[1][i] - v) * k); } };
  const q0 = pos(d); Object.assign(s, { eye: [q0.x + 5.4, 3.0, 12.8], at: [q0.x - 1.0, 1.75, -0.6], fov: 36, minAspect: 1.9, drop: 0 });
  return { scene: b.scene, play, tick }; }
