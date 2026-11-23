// Level 6, "A school for everyone": the parts that both pictures of this level are built from. The valley seen from across
// the river (valley.js) and the walking bus (bus.js) use the same homes, trees, school, cars and children, so that
// the child sees the same world from far away and from close by. Everything is made of the shared blocks in ../../level-kit/blocks.js.
import { THREE, B, blk, group, fig, M, hash, FAMILY, SHIRTS, SKIN, HAIR, tone } from '../../level-kit/blocks.js';
import { hot } from '../../level-kit/stage.js';

// ---- the weather of this level: a bright, crisp autumn morning with a high clear sky ----------------------------------------------------
export const SKY = [['#1763c8', '#58a8ee', '#d9eefc'], ['#1763c8', '#58a8ee', '#d9eefc'], ['#1763c8', '#58a8ee', '#d9eefc']];
export const LIGHT = { skies: SKY, haze: 0.0042, sunColour: '#fff2d6', sunPower: 3.5, skyLight: '#dbe9ff', groundLight: '#e9c88e', lightPower: 1.35 };
export const AUTUMN = ['#f08a24', '#d9472b', '#f2b632', '#e2662a', '#c9a227', '#7fae3c'];
export const GRASS = '#86bf4c', INK = '#1f2a44';

// the colours the child can give the flag and the bright vests. Two materials are shared by everything that carries the child's colour
export const FLAGS = [['Lime', '#a6e22e'], ['Pink', '#ff5fa8'], ['Blue', '#2aa8ff'], ['Orange', '#ff8a1f']];
export const flagMat = new THREE.MeshLambertMaterial({ color: FLAGS[0][1] }), vestMat = new THREE.MeshLambertMaterial({ color: FLAGS[0][1] });
flagMat.emissive = new THREE.Color(FLAGS[0][1]).multiplyScalar(0.25); vestMat.emissive = new THREE.Color(FLAGS[0][1]).multiplyScalar(0.3);
export let flagN = 0; export const setFlag = (n) => { flagN = n; for (const m of [flagMat, vestMat]) { m.color.set(FLAGS[n][1]); m.emissive.set(FLAGS[n][1]).multiplyScalar(m === vestMat ? 0.3 : 0.25); } };

// ---- trees, hay and small things ----------------------------------------------------------------------------------------------------------
export function tree(g, x, z, h = 6, col = AUTUMN[0]) { const p = group(g, x, 0, z), w = h * 0.52; B(p, 0, 0, h * 0.11, h * 0.11, 0, h * 0.5, '#6e4a2c', { tex: 'bark' });
  B(p, 0, 0, w, w, h * 0.4, h * 0.34, col, { tex: 'leaf' }); B(p, w * 0.08, -w * 0.05, w * 0.72, w * 0.72, h * 0.74, h * 0.2, col, { tex: 'leaf' }); B(p, -w * 0.3, w * 0.2, w * 0.5, w * 0.5, h * 0.3, h * 0.22, col, { tex: 'leaf' }); return p; }
export function appleTree(g, x, z, h = 4.4) { const p = tree(g, x, z, h, '#6fae3a'), w = h * 0.52; for (let k = 0; k < 7; k++) B(p, (hash(k, x) - 0.5) * w, w / 2 + 0.03, 0.26, 0.1, h * (0.44 + hash(x, k) * 0.24), 0.26, '#e23b2e', { raw: true }); return p; }
export function bale(g, x, z, k = 1) { const p = group(g, x, 0, z); p.scale.setScalar(k); B(p, 0, 0, 1.5, 1.1, 0, 1, '#e9c04e', { tex: 'stripe' }); return p; }
export function reeds(g, x, z, y = 0, n = 5) { for (let k = 0; k < n; k++) { const h = 1.3 + hash(x + k, z) * 1.3, a = x + (hash(k, x) - 0.5) * 1.6, b = z + (hash(x, k * 3) - 0.5) * 0.8; B(g, a, b, 0.12, 0.12, y, h, k % 2 ? '#a8a23a' : '#7f9a3a', { shadow: false }); if (k % 2) B(g, a, b, 0.2, 0.2, y + h, 0.5, '#7a4a22', { shadow: false }); } }
export function duck(g, x, y, z, k = 1) { const p = group(g, x, y, z); p.scale.setScalar(k); B(p, 0, 0, 0.9, 0.55, 0, 0.42, '#fffdf4'); B(p, 0.38, 0, 0.36, 0.36, 0.36, 0.38, '#fffdf4'); B(p, 0.62, 0, 0.2, 0.2, 0.44, 0.1, '#f2932b', { raw: true }); B(p, -0.48, 0, 0.14, 0.3, 0.3, 0.2, '#fffdf4'); blk(p, 0.44, 0.19, 0.06, 0.02, 0.56, 0.07, INK, { shadow: false, mat: M(INK, { unlit: true, raw: true }) }); return p; }
export function cloud(g, x, y, z, k = 1) { const p = group(g, x, y, z), m = { unlit: true, raw: true, shadow: false }; p.scale.setScalar(k); B(p, 0, 0, 9, 3, 0, 1.6, '#ffffff', m); B(p, -1.5, 0, 4.5, 3, 1.6, 1.3, '#ffffff', m); B(p, 2.6, 0, 3, 3, 1.6, 0.8, '#ffffff', m); return p; }

// ---- a home with a garden gate. It gives back its door, which opens when the bell is heard -----------------------------------------------
const WALLS = ['#f6e2b8', '#f3c9a2', '#e8d3c0', '#f7eccb', '#dfe6c8', '#f2d6d0'], ROOFC = ['#c9502f', '#3f78b5', '#8a5fc2', '#b5553a', '#2e7f8a', '#a8452f'], DOORS = ['#2e7f8a', '#c9502f', '#3f78b5', '#8a5fc2', '#2e9b5a', '#e0a23a'];
export function home(g, x, z, n = 0, o = {}) { const p = group(g, x, 0, z), wall = o.wall || WALLS[n % 6], roof = o.roof || ROOFC[n % 6];
  B(p, 0, 0, 3, 3, 0, 3, wall, { tex: 'board' }); B(p, 0, 0, 3.2, 3.2, 0, 0.25, '#b9a58a');
  B(p, 0, 0, 3.7, 3.7, 3, 0.55, roof, { tex: 'tile' }); B(p, 0, 0, 2.7, 3.7, 3.55, 0.55, roof, { tex: 'tile' }); B(p, 0, 0, 1.6, 3.7, 4.1, 0.5, roof, { tex: 'tile' }); B(p, 0, 0, 0.6, 3.7, 4.6, 0.3, roof, { tex: 'tile' });
  B(p, 0.9, -0.6, 0.5, 0.5, 3.5, 1.6, '#b9775a'); B(p, 0.9, -0.6, 0.64, 0.64, 5.0, 0.16, '#8a5a44');
  B(p, 0.65, 1.52, 1.0, 0.08, 0.25, 1.95, '#fffaf0'); const door = B(p, 0.65, 1.56, 0.8, 0.08, 0.25, 1.8, DOORS[n % 6]); B(p, 0.65, 1.8, 1.2, 0.5, 0, 0.25, '#cdb99c');
  B(p, -0.75, 1.52, 1.15, 0.08, 1.15, 1.25, '#fffaf0'); B(p, -0.75, 1.56, 0.95, 0.06, 1.25, 1.05, '#bfe3ff', { tex: 'win' }); B(p, -0.75, 1.62, 1.2, 0.22, 0.95, 0.2, ['#e23b2e', '#f2b632', '#8a5fc2'][n % 3]);
  if (o.farm) { B(p, -2.4, -0.4, 1.3, 2.2, 0, 2, '#b5553a', { tex: 'board' }); B(p, -2.4, -0.4, 1.5, 2.4, 2, 0.3, '#8a3f2a'); }
  p.door = door; return p; }
// a low fence along x from x0 to x1 at depth z, with gaps where the gates are
export function fence(g, x0, x1, z, gaps = [], col = '#fffaf0', h = 0.9) { for (let x = x0; x <= x1 + 0.01; x += 0.8) { if (gaps.some((q) => Math.abs(x - q) < 0.75)) continue; B(g, x, z, 0.16, 0.16, 0, h, col); B(g, x + 0.4, z, 0.8, 0.08, h * 0.62, 0.14, col, { shadow: false }); } }

// ---- the school: cream walls, a red roof, a bell in a small tower and a flag in the child's colour ---------------------------------------
export const bellMat = new THREE.MeshBasicMaterial({ color: hot('#ffc23a', 1.25) });
export function school(g, x, z) { const p = group(g, x, 0, z), body = group(p, 0, 0, 0);
  B(body, 0, 0, 4.6, 3.2, 0, 3.4, '#fff3d6', { tex: 'board' }); B(body, 0, 0, 4.8, 3.4, 0, 0.3, '#c9502f');
  B(body, 0, 0, 5.2, 3.8, 3.4, 0.5, '#d2553a', { tex: 'tile' }); B(body, 0, 0, 4.2, 3.8, 3.9, 0.5, '#d2553a', { tex: 'tile' }); B(body, 0, 0, 3.0, 3.8, 4.4, 0.45, '#d2553a', { tex: 'tile' });
  B(body, 0, 1.62, 1.3, 0.1, 0.3, 2.2, '#fffaf0'); B(body, 0, 1.67, 1.05, 0.08, 0.3, 2.0, '#2e7f8a'); B(body, 0, 2.0, 1.9, 0.7, 0, 0.3, '#e8d9bd');
  for (const s of [-1, 1]) { B(body, s * 1.55, 1.62, 1.1, 0.08, 1.2, 1.5, '#fffaf0'); B(body, s * 1.55, 1.66, 0.9, 0.06, 1.3, 1.3, '#bfe3ff', { tex: 'win' }); }
  // the bell tower: four posts, a gold bell that swings, a small roof and a flag
  B(body, 0, 0, 1.5, 1.5, 4.85, 1.0, '#fff3d6', { tex: 'board' }); for (const a of [-1, 1]) for (const b of [-1, 1]) B(body, a * 0.62, b * 0.62, 0.22, 0.22, 5.85, 1.3, '#fffaf0');
  B(body, 0, 0, 1.9, 1.9, 7.15, 0.35, '#d2553a', { tex: 'tile' }); B(body, 0, 0, 1.2, 1.2, 7.5, 0.35, '#d2553a', { tex: 'tile' }); B(body, 0, 0, 0.5, 0.5, 7.85, 0.3, '#d2553a');
  const bell = group(body, 0, 7.1, 0); blk(bell, 0, 0, 0.7, 0.7, -0.95, 0.6, '#ffc23a', { mat: bellMat }); blk(bell, 0, 0, 0.46, 0.46, -0.4, 0.3, '#ffc23a', { mat: bellMat }); blk(bell, 0, 0, 0.16, 0.16, -1.1, 0.16, '#8a5a22', { mat: M('#8a5a22') });
  B(body, 0, 0, 0.1, 0.1, 8.1, 2.0, '#fffaf0'); const flag = blk(body, 0.62, 0, 1.2, 0.06, 9.3, 0.75, '#fff', { mat: flagMat });
  p.body = body; p.bell = bell; p.flag = flag; return p; }

// ---- a grey car with a child's head at the window. Cars are plain and dull on purpose: walking must look nicer ---------------------------
export function car(g, x, z, n = 0) { const p = group(g, x, 0, z), c = ['#9aa1ab', '#8b9199', '#a7a39c'][n % 3], D = M('#30343c');
  B(p, 0, 0, 2.6, 1.3, 0.28, 0.62, c); B(p, -0.15, 0, 1.5, 1.2, 0.9, 0.55, c); B(p, -0.15, 0, 1.3, 1.24, 0.96, 0.4, '#cfd6dd', { tex: 'pane' });
  for (const a of [-0.8, 0.8]) for (const b of [-0.6, 0.6]) blk(p, a, b, 0.5, 0.16, 0, 0.5, '#30343c', { mat: D }); B(p, 1.31, 0, 0.04, 0.9, 0.5, 0.2, '#e8e4d8');
  const kid = group(p, -0.3, 0.95, 0); p.kid = kid; p.pipe = [-1.45, 0.35, 0.4]; return p; }
export function tractor(g, x, z) { const p = group(g, x, 0, z), D = M('#30343c'); B(p, 0.3, 0, 1.6, 1.0, 0.5, 0.7, '#3f9b4a'); B(p, -0.5, 0, 1.0, 1.1, 0.9, 1.0, '#3f9b4a'); B(p, -0.5, 0, 0.9, 1.14, 1.2, 0.6, '#cfe9ff', { tex: 'pane' });
  for (const b of [-0.62, 0.62]) { blk(p, -0.5, b, 1.0, 0.2, 0, 1.0, '#30343c', { mat: D }); blk(p, 0.85, b, 0.6, 0.18, 0, 0.6, '#30343c', { mat: D }); } B(p, -2.5, 0, 2.2, 1.3, 0.35, 0.5, '#b5553a', { tex: 'board' });
  for (let k = 0; k < 5; k++) B(p, -3.3 + k * 0.42, (k % 2 - 0.5) * 0.5, 0.4, 0.4, 0.85, 0.34, '#f08a24', { raw: true }); for (const b of [-0.66, 0.66]) blk(p, -2.5, b, 0.5, 0.14, 0, 0.5, '#30343c', { mat: D }); return p; }
// grey puffs of pollution that rise behind a car and fade. emit() starts one; tick(dt) moves them all
export function puffs(g, n = 40) { const mat = new THREE.MeshBasicMaterial({ color: '#8b8f96', transparent: true, opacity: 0.62, depthWrite: false }), list = []; let next = 0;
  for (let k = 0; k < n; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat); m.visible = false; g.add(m); list.push({ m, age: 9 }); }
  return { emit(x, y, z, k = 1) { const q = list[next = (next + 1) % n]; q.age = 0; q.k = k; q.m.position.set(x, y, z); q.m.visible = true; }, tick(dt) { for (const q of list) { if (q.age > 2.4) { q.m.visible = false; continue; } q.age += dt; q.m.position.y += dt * 0.9 * q.k; q.m.position.x += dt * 0.25 * q.k; q.m.scale.setScalar(q.k * (0.3 + q.age * 0.5) * Math.max(0, 1 - Math.pow(q.age / 2.4, 3))); } }, clear() { for (const q of list) { q.age = 9; q.m.visible = false; } } }; }

// ---- the twelve children: six live in the town and six live by the farms. Child 6 is the child of the family, who live by the farms ------
const PACK = ['#ffd257', '#e23b2e', '#2aa8ff', '#8a5fc2', '#2e9b5a', '#ff8a1f'];
export const KIDS = Array.from({ length: 12 }, (_, i) => (i === 6 ? { ...FAMILY[0], pack: '#ffd257' } : { k: 0.92 + hash(i, 4) * 0.12, shirt: SHIRTS[(i * 5 + 1) % 6], legs: ['#2b3a55', '#4a556e', '#5a4636'][i % 3], skin: SKIN[(i * 3 + 1) % 4], hair: HAIR[(i * 2 + 1) % 5], long: i % 2 === 1, pack: PACK[i % 6] }));
// A person who can walk: person(parent, look, { vest }) gives a group with stride(phase), which swings the legs and arms, and a vest that can be shown
export function person(g, o, x = 0, y = 0, z = 0) { const p = fig(g, x, y, z, o), c = p.children; p.legs = [[c[0], c[1]], [c[2], c[3]]]; p.armsDown = !o.arms || o.arms.every((a) => a === 'down') ? c.slice(-4) : [];
  for (const m of [...p.legs.flat(), ...p.armsDown]) m.userData.z = m.position.z;
  p.stride = (ph, amt = 1) => { p.legs.forEach((l, i) => { const d = Math.sin(ph + i * Math.PI) * 0.17 * amt; l[0].position.z = l[0].userData.z + d; l[1].position.z = l[1].userData.z + d; l[1].position.y = 0.05 + Math.max(0, Math.cos(ph + i * Math.PI)) * 0.07 * amt; });
    p.armsDown.forEach((m, i) => { m.position.z = m.userData.z - Math.sin(ph + (i < 2 ? 0 : Math.PI)) * 0.12 * amt; }); };
  const vest = group(p, 0, 0, 0); blk(vest, 0, 0, 0.62, 0.4, 0.66, 0.46, '#fff', { mat: vestMat, shadow: false }); blk(vest, 0, 0, 0.64, 0.42, 0.82, 0.08, '#fff', { mat: M('#f4f6f8', { unlit: true, raw: true }), shadow: false }); vest.visible = !!o.vest; p.vest = vest; return p; }
// the teacher who leads a walking bus carries a flag in the child's colour
export const TEACHER = { k: 1.3, shirt: '#16a3a3', legs: '#30343c', skin: SKIN[1], hair: HAIR[3], long: true, arms: ['down', 'fwd'] }, TEACHER2 = { k: 1.3, shirt: '#c98a5a', legs: '#30343c', skin: SKIN[0], hair: HAIR[2], arms: ['down', 'fwd'] };
export function teacher(g, o = TEACHER) { const p = person(g, { ...o, vest: true }); B(p, 0.37, 0.52, 0.07, 0.07, 0.7, 2.1, '#fffaf0'); blk(p, 0.37, 0.14, 0.06, 0.7, 2.25, 0.52, '#fff', { mat: flagMat }); return p; }

// ---- the badges: a shoe in a round badge for a child who walked, a car in a square badge for a child who was driven ----------------------
// The two differ in shape and in picture, not only in colour. The same pictures are used on the sign over the school, on the result cards and on the board at the gate
export const SHOE = '<path d="M5.5 16.5v-5.5c1.6 0 2.6-.9 3-2.6l3.2 3.1c1.6 1.4 6.8 1.2 7.3 4v1z" fill="#fff"/>', CARP = '<path d="M3.5 15.5v-3.2l2.2-.8 2-3.2h7.2l2.6 3.2 3 1v3z" fill="#fff"/><circle cx="8" cy="16" r="2.1" fill="#1f2a44"/><circle cx="16.5" cy="16" r="2.1" fill="#1f2a44"/>';
export const badge = (kind) => (kind === 'shoe' ? `<svg class="bdg" viewBox="0 0 24 24" role="img" aria-label="walked"><circle cx="12" cy="12" r="10.5" fill="#1c7a45" stroke="#1f2a44" stroke-width="2"/>${SHOE}</svg>` : kind === 'car' ? `<svg class="bdg" viewBox="0 0 24 24" role="img" aria-label="went by car"><rect x="1.5" y="1.5" width="21" height="21" rx="3" fill="#7d8591" stroke="#1f2a44" stroke-width="2"/>${CARP}</svg>` : '<svg class="bdg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#9aa1ab" stroke-width="2" stroke-dasharray="3 3"/></svg>');
export const badgeRow = (list, n = 12) => `<span class="bdgs">${Array.from({ length: n }, (_, k) => badge(list[k])).join('')}</span>`;
// the same two badges as small pictures for the board in the walking bus
const BT = {}; export function badgeMat(kind) { if (BT[kind]) return BT[kind]; const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'); x.lineWidth = 8; x.strokeStyle = INK; x.fillStyle = kind === 'shoe' ? '#1c7a45' : '#7d8591';
  if (kind === 'shoe') { x.beginPath(); x.arc(48, 48, 42, 0, 7); x.fill(); x.stroke(); } else { x.beginPath(); x.roundRect(6, 6, 84, 84, 12); x.fill(); x.stroke(); }
  x.save(); x.scale(4, 4); x.fillStyle = '#fff'; x.fill(new Path2D(kind === 'shoe' ? 'M5.5 16.5v-5.5c1.6 0 2.6-.9 3-2.6l3.2 3.1c1.6 1.4 6.8 1.2 7.3 4v1z' : 'M3.5 15.5v-3.2l2.2-.8 2-3.2h7.2l2.6 3.2 3 1v3z')); if (kind !== 'shoe') { x.fillStyle = INK; for (const a of [8, 16.5]) { x.beginPath(); x.arc(a, 16, 2.1, 0, 7); x.fill(); } } x.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return (BT[kind] = new THREE.MeshBasicMaterial({ map: t, transparent: true })); }

// leaves that blow across the picture in the light breeze. tick(t, cx) keeps them around the place the camera looks at
export function leaves(g, n, o = {}) { const W = o.w || 40, list = [], size = o.size || 0.22; for (let k = 0; k < n; k++) { const m = B(g, 0, 0, size, size * 0.2, 0, size, AUTUMN[k % 5], { raw: true, shadow: false }); list.push({ m, a: hash(k, 1), b: hash(k, 2), c: hash(k, 3) }); }
  return (t, cx = 0) => { for (const q of list) { const u = (q.a * W + t * (2.2 + q.b * 2.4) * (o.speed || 1)) % W; q.m.position.set(cx - W / 2 + u, (o.y || 0.3) + (0.5 + 0.5 * Math.sin(t * (1.2 + q.c) + q.a * 9)) * (o.h || 3) * q.b + 0.2, (o.z0 ?? -8) + q.c * (o.zd || 14)); q.m.rotation.set(t * (1 + q.a * 2), t * (0.6 + q.b), q.c * 6); } }; }
export { tone };
