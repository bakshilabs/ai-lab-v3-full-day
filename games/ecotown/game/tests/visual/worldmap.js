// A PROPOSAL, not part of the camp: one world of six towns, one per hour of the day, at the scale of the start page's
// island (one square is one unit; each town is about the size of that island). Nothing here is used by the game.
// Map: drag to turn, wheel or pinch to zoom, tap a town's name to fly there. Walk: W A S D or arrows, Shift, Space.
import * as THREE from '../../vendor/three.module.min.js';

const C = (h) => new THREE.Color(h);
const PAL = {
  grass: ['#8fcf73', '#86c86b', '#9bd57e', '#7ec064'], grassDeep: '#6fb257', sand: '#ecd29a', water: '#5cb8e6', road: '#8d8378', plank: '#c9925a',
  soil: '#b98a55', soilDark: '#a27443', rock: ['#e8b77c', '#dfa76b', '#d4975e', '#c98a55', '#bd7d4b', '#b07145', '#a2663f'],
  wall: ['#fff4dc', '#fbecd0', '#f6e1bd'], timber: '#c9925a', roof: ['#c8643f', '#b5553a', '#d0774a'], green: '#5aa35a', solar: '#2f4f8f',
  leaf: ['#5fa35a', '#4f9550', '#74b56a'], trunk: '#7a5a33', fruit: '#e0503a', white: '#fbfbf7', navy: '#2b3a55', sun: '#ffd257', parcel: '#c8955a',
  pave: ['#dcd6ca', '#d5cfc2', '#e2dccf'], glass: '#7fb6d9', steel: '#c9d2da', kerb: '#cfc7b8',
};
const rand = (s => () => ((s = (s * 16807) % 2147483647) / 2147483647))(20261118);
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const shade = (h, k) => '#' + C(h).multiplyScalar(k).getHexString();

// ---------- the six towns: centre and half-size in squares (the start page's island is 15 by 11)
export const TOWNS = [
  { id: 'eco', n: 1, name: 'Eco Town', c: [0, 0], r: [15, 11], tint: '#c8643f', top: 5 },
  { id: 'drone', n: 2, name: 'Drone City', c: [3, -20], r: [14, 10.5], tint: '#3f78b5', top: 15 },
  { id: 'robot', n: 3, name: 'Robot Farm', c: [-21, 13], r: [14, 10.5], tint: '#6f9a3a', top: 5 },
  { id: 'roads', n: 4, name: 'Crossways', c: [25, -6], r: [13, 11], tint: '#8d6f9c', top: 6 },
  { id: 'film', n: 5, name: 'Studio Bay', c: [19, 15], r: [13, 10], tint: '#d0558a', top: 6 },
  { id: 'power', n: 6, name: 'Power Ridge', c: [-25, -8], r: [13, 11], tint: '#c79a2e', top: 12 },
];
const T = Object.fromEntries(TOWNS.map((t) => [t.id, t]));

const canvas = document.getElementById('map');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.BasicShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 1, 900);
scene.add(new THREE.HemisphereLight('#fff6e8', '#8a7a5a', 1.55));
const sun = new THREE.DirectionalLight('#fff0d0', 2.1); sun.position.set(-45, 80, 50); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -62, right: 62, top: 52, bottom: -52, near: 1, far: 260 }); sun.shadow.bias = -0.002; sun.shadow.normalBias = 0.05;
scene.add(sun);
const world = new THREE.Group(); scene.add(world);

const BOX = new THREE.BoxGeometry(1, 1, 1);
const mats = new Map(); const mat = (h) => { if (!mats.has(h)) mats.set(h, new THREE.MeshLambertMaterial({ color: h })); return mats.get(h); };
const box = (parent, w, h, d, x, y, z, color, shadow = true) => { const m = new THREE.Mesh(BOX, mat(color)); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const VC = new THREE.MeshLambertMaterial({ vertexColors: true }), CLOUD = new THREE.MeshBasicMaterial({ vertexColors: true });
// bake a group's still boxes into one mesh with vertex colours: one draw call per build
const bake = (g, keep = [], material = VC) => {
  g.updateMatrix();
  const parts = g.children.filter((c) => c.isMesh && !keep.includes(c)); if (parts.length < 2) return g;
  let n = 0; const geos = parts.map((m) => { m.updateMatrix(); const ge = m.geometry.toNonIndexed().applyMatrix4(m.matrix); n += ge.attributes.position.count; return [ge, m.material.color]; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
  for (const [ge, c] of geos) { const cnt = ge.attributes.position.count; pos.set(ge.attributes.position.array, o * 3); nor.set(ge.attributes.normal.array, o * 3); for (let i = o; i < o + cnt; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } o += cnt; ge.dispose(); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mesh = new THREE.Mesh(geo, material); mesh.castShadow = material !== CLOUD && parts.some((p) => p.castShadow); mesh.receiveShadow = material !== CLOUD;
  parts.forEach((p) => g.remove(p)); g.add(mesh); return g;
};

// ---------- the land: each town is a rounded plot; roads join them and carry a strip of land with them
const wob = (x, z) => Math.sin(x * 0.63 + z * 0.31) * 0.05 + Math.sin(z * 0.87 - x * 0.41) * 0.05;
const ell = (t, x, z, s = 1) => ((x - t.c[0]) / (t.r[0] * s)) ** 2 + ((z - t.c[1]) / (t.r[1] * s)) ** 2;
const landVal = (x, z, s = 1) => { let m = 9; for (const t of TOWNS) m = Math.min(m, ell(t, x, z, s)); return m + wob(x, z); };
const owner = (x, z) => { let m = 9, o = TOWNS[0]; for (const t of TOWNS) { const v = ell(t, x, z); if (v < m) { m = v; o = t; } } return o; };
const key = (x, z) => x + ',' + z;
// roads, as straight runs between square centres
const ROADS = [
  [1.5, -7.5, 12.5, -7.5], [12.5, -7.5, 12.5, 5.5], [12.5, 5.5, 1.5, 5.5], [1.5, 5.5, 1.5, -7.5],            // Eco Town's ring
  [6.5, -7.5, 6.5, -28.5], [-7.5, -19.5, 15.5, -19.5], [-7.5, -19.5, -7.5, -14.5],                          // Drone City
  [-24.5, 7.5, -24.5, -14.5], [-24.5, -14.5, -15.5, -14.5],                                                // Power Ridge
  [1.5, -0.5, -24.5, -0.5], [1.5, 5.5, 1.5, 7.5], [1.5, 7.5, -30.5, 7.5],                                   // to the ridge and the farm
  [12.5, -5.5, 36.5, -5.5], [16.5, -11.5, 34.5, -11.5], [16.5, 0.5, 34.5, 0.5], [18.5, -11.5, 18.5, 0.5], [32.5, -11.5, 32.5, 0.5], [25.5, -15.5, 25.5, 11.5], // Crossways
  [11.5, 5.5, 11.5, 11.5], [11.5, 11.5, 25.5, 11.5],                                                       // Studio Bay
];
const BRIDGE = [-15.5, -14.5, -7.5, -14.5]; // the high bridge from the ridge to Drone City, over open sky
const cellsOf = ([x1, z1, x2, z2]) => { const out = []; const n = Math.round(Math.abs(x2 - x1) + Math.abs(z2 - z1)); for (let i = 0; i <= n; i++) out.push([Math.floor(x1 + (x2 - x1) * (n ? i / n : 0)), Math.floor(z1 + (z2 - z1) * (n ? i / n : 0))]); return out; };
const roadSet = new Set(), neckSet = new Set(), bridgeSet = new Set();
for (const r of ROADS) for (const [x, z] of cellsOf(r)) { roadSet.add(key(x, z)); for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) neckSet.add(key(x + a, z + b)); }
for (const [x, z] of cellsOf(BRIDGE)) bridgeSet.add(key(x, z));

const riverX = (z) => -3.2 + Math.sin(z * 0.33) * 2.2;
const LAKE = [-21, -5.2, 2.6, 2], LAGOON = [24, 20, 5, 3];
const inEll = ([cx, cz, rx, rz], x, z, k = 1) => ((x - cx) / (rx * k)) ** 2 + ((z - cz) / (rz * k)) ** 2 < 1;
const wet = (x, z, w) => (z > -4.5 && Math.abs(x - riverX(z)) < w) || (Math.abs(z + 4.5) < w && x > -19 && x < riverX(-4.5) + w);
// the ridge rises in three steps
const tier = (x, z) => { const o = owner(x, z); if (o.id !== 'power') return 0; const e = ell(o, x, z) + wob(x, z); return e < 0.42 ? 3 : e < 0.62 ? 2 : e < 0.82 ? 1 : 0; };
const inRect = (x, z, x1, z1, x2, z2) => x >= x1 && x <= x2 && z >= z1 && z <= z2;

const top = new Map(); // square -> height of its top (for walking and for standing things on)
const cells = [];
const colourOf = (ix, iz, x, z, o, t) => {
  if (roadSet.has(key(ix, iz))) return wet(x, z, 1.15) ? PAL.plank : PAL.road;
  if (inEll(LAKE, x, z) || inEll(LAGOON, x, z) || wet(x, z, 1.15)) return 'water';
  if (wet(x, z, 1.9) || inEll(LAGOON, x, z, 1.35)) return PAL.sand;
  const g = PAL.grass[Math.floor(rand() * 4)];
  if (o.id === 'drone') return inRect(x, z, 8, -13, 13, -10) || inRect(x, z, -10, -29, -6, -26) ? g : PAL.pave[Math.floor(rand() * 3)];
  if (o.id === 'roads') { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (roadSet.has(key(ix + a, iz + b))) return PAL.kerb; return inRect(x, z, 26.5, -10.5, 31.5, -6.5) ? '#9a958c' : g; }
  if (o.id === 'robot') return inRect(x, z, -34, 9.5, -15.5, 22) ? (iz % 2 ? PAL.soil : PAL.soilDark) : PAL.grassDeep;
  if (o.id === 'film') return inRect(x, z, 8, 12.5, 22.5, 18.5) ? '#e3d3b0' : ['#a9d27c', '#9fcb73'][Math.floor(rand() * 2)];
  if (o.id === 'power') return [g, '#9cc470', '#b9c27a', '#d8c58e'][t];
  return inRect(x, z, -13, 1.5, -6, 6.5) ? PAL.grassDeep : g;
};
for (let ix = -42; ix <= 41; ix++) for (let iz = -36; iz <= 29; iz++) {
  const x = ix + 0.5, z = iz + 0.5, lv = landVal(x, z), neck = lv >= 1;
  if (neck && !neckSet.has(key(ix, iz))) continue;
  const o = owner(x, z), t = neck ? 0 : tier(x, z); let col = colourOf(ix, iz, x, z, o, t); const water = col === 'water'; if (water) col = PAL.water;
  const h = t - (water ? 0.38 : 0); top.set(key(ix, iz), h);
  cells.push([x, h - 0.5, z, col]);
  for (let k = 1; k <= t; k++) cells.push([x, h - 0.5 - k, z, k === t ? PAL.rock[1] : ['#cdb37c', '#c4a26b', '#b99562'][k - 1]]);
  for (let d = 1; d <= (neck ? 2 : 11); d++) {
    const s = 1 - d * 0.082 + Math.sin(x * 1.3 + d) * 0.02;
    if (!neck && landVal(x, z, s) >= 1) break;
    const inner = !neck && landVal(x + 1, z, s - 0.09) < 1 && landVal(x - 1, z, s - 0.09) < 1 && landVal(x, z + 1, s - 0.09) < 1 && landVal(x, z - 1, s - 0.09) < 1;
    if (inner && d < 11 && d > 1) continue;
    cells.push([x, -0.5 - d - (water && !t ? 0.38 : 0), z, PAL.rock[Math.min(PAL.rock.length - 1, Math.floor(d * 0.62 + rand() * 0.8))]]);
  }
}
const ground = new THREE.InstancedMesh(BOX, new THREE.MeshLambertMaterial({ color: '#ffffff' }), cells.length);
const m4 = new THREE.Matrix4();
cells.forEach(([x, y, z, c], i) => { m4.makeTranslation(x, y, z); ground.setMatrixAt(i, m4); ground.setColorAt(i, C(c)); });
ground.receiveShadow = true; ground.castShadow = true; world.add(ground);
const H = (x, z) => top.get(key(Math.floor(x), Math.floor(z))) ?? 0;
const isLand = (x, z) => top.has(key(Math.floor(x), Math.floor(z))) || bridgeSet.has(key(Math.floor(x), Math.floor(z)));

// ---------- building kit
const solids = [], posts = []; // what a walker cannot pass: [x, z, halfW, halfD] and [x, z, r]
const grp = (x, z, rot = 0) => { const g = new THREE.Group(); g.position.set(x, Math.max(0, Math.ceil(H(x, z) - 0.01)), z); g.rotation.y = rot; world.add(g); return g; };
const solid = (x, z, w, d, rot = 0) => solids.push(Math.abs(Math.sin(rot)) > 0.5 ? [x, z, d / 2, w / 2] : [x, z, w / 2, d / 2]);
// a stepped roof like the main game's: one course per step, in two shades, overhanging by a step; the end walls step up too
const stepRoof = (g, w, d, y, col, wallCol, { n = 4, pitch = 1, tiles = false, sunTiles = false } = {}) => {
  const u = w / 2 / n, v = u * pitch, dark = shade(col, 0.86), cnt = Math.max(1, Math.round((d + 2 * u) / u));
  for (let r = 0; r <= n; r++) {
    if (r < n) box(g, 2 * (w / 2 - r * u), v, d, 0, y + (r + 0.5) * v, 0, wallCol);
    for (const sd of r < n ? [1, -1] : [1]) {
      const cx = r < n ? sd * (w / 2 + (0.5 - r) * u) : 0, cw = r < n ? u : 2 * u;
      if (!tiles) { box(g, cw, v, d + 2 * u, cx, y + (r + 0.5) * v, 0, r % 2 ? col : dark); continue; }
      for (let k = 0; k < cnt; k++) { const s = sunTiles && sd > 0 && r >= 1 && r < n && k >= 2 && k <= cnt - 3; box(g, cw, v, u, cx, y + (r + 0.5) * v, (k - (cnt - 1) / 2) * u, s ? PAL.solar : (k + r) % 2 ? col : dark); }
    }
  }
  return y + (n + 1) * v;
};
const house = (x, z, i) => {
  const rot = (i % 2) * Math.PI / 2, g = grp(x, z, rot), wall = i % 4 === 2 ? PAL.timber : PAL.wall[i % 3], tall = i % 3 === 1 ? 2.1 : 1.45;
  box(g, 1.9, tall, 1.9, 0, tall / 2, 0, wall);
  stepRoof(g, 1.9, 1.9, tall, i % 5 === 3 ? PAL.green : PAL.roof[i % 3], wall, { tiles: true, sunTiles: i % 3 === 0 });
  box(g, 0.42, 0.75, 0.06, 0.4, 0.38, 0.97, '#7a5a33', false); box(g, 0.42, 0.38, 0.06, -0.45, tall * 0.62, 0.97, '#9fd0f5', false);
  if (i % 3) { box(g, 0.24, 0.86, 0.24, -0.6, tall + 0.78, -0.6, '#9a5a3c'); box(g, 0.31, 0.12, 0.31, -0.6, tall + 1.27, -0.6, '#5b4a40', false); }
  bake(g); solid(x, z, 1.9, 1.9);
};
const tree = (x, z, fruit = false, k = 1) => {
  if (!isLand(x, z) || H(x, z) % 1 !== 0 || roadSet.has(key(Math.floor(x), Math.floor(z)))) return; const g = grp(x, z);
  box(g, 0.3, 0.9, 0.3, 0, 0.45, 0, PAL.trunk); box(g, 1.25 * k, 1.05 * k, 1.25 * k, 0, 1.25, 0, PAL.leaf[Math.floor(rand() * 3)]); box(g, 0.8 * k, 0.6 * k, 0.8 * k, 0.1, 1.95, -0.05, PAL.leaf[2], false);
  if (fruit) for (const [a, b, c] of [[0.6, 1.3, 0.2], [-0.5, 1.5, 0.55], [0.2, 1.1, -0.62]]) box(g, 0.2, 0.2, 0.2, a, b, c, PAL.fruit, false);
  bake(g); posts.push([x, z, 0.3]);
};
const blades = [];
const turbine = (x, z, h, ph) => {
  const g = grp(x, z);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.24, h, 8), mat(PAL.white)); tower.position.y = h / 2; tower.castShadow = true; g.add(tower);
  box(g, 0.45, 0.4, 0.8, 0, h, 0.05, PAL.white);
  const hub = new THREE.Group(); hub.position.set(0, h, 0.5); g.add(hub);
  for (let k = 0; k < 3; k++) { const a = (k * Math.PI * 2) / 3; box(hub, 0.2, 2.9, 0.07, -Math.sin(a) * 1.5, Math.cos(a) * 1.5, 0, PAL.white).rotation.z = a; }
  box(hub, 0.3, 0.3, 0.3, 0, 0, 0.05, PAL.white, false); bake(hub); g.rotation.y = 0.5; blades.push([hub, ph]); posts.push([x, z, 0.35]);
};
// a tower or block: a band of wall and a band of glass per floor
const tower = (x, z, w, d, floors, wallC, glassC, roofTop, fh = 0.8) => {
  const g = grp(x, z); box(g, w + 0.3, 0.3, d + 0.3, 0, 0.15, 0, '#bfb8aa');
  for (let f = 0; f < floors; f++) { box(g, w, fh * 0.4, d, 0, 0.3 + f * fh + fh * 0.2, 0, wallC); box(g, w - 0.1, fh * 0.6, d - 0.1, 0, 0.3 + f * fh + fh * 0.7, 0, glassC, false); }
  const y = 0.3 + floors * fh; box(g, w, 0.25, d, 0, y + 0.125, 0, wallC);
  if (roofTop === 'pad') { box(g, Math.min(w, 1.5), 0.08, Math.min(d, 1.5), 0, y + 0.29, 0, PAL.sun, false); box(g, 0.9, 0.09, 0.2, 0, y + 0.3, 0, PAL.navy, false); }
  if (roofTop === 'mast') { box(g, 0.12, 2.4, 0.12, 0, y + 1.45, 0, PAL.navy); box(g, 0.3, 0.3, 0.3, 0, y + 2.7, 0, PAL.fruit, false); }
  if (roofTop === 'garden') { box(g, w - 0.4, 0.22, d - 0.4, 0, y + 0.36, 0, PAL.leaf[0], false); box(g, 0.7, 0.6, 0.7, w / 4, y + 0.7, -d / 4, PAL.leaf[1]); }
  bake(g); solid(x, z, w + 0.3, d + 0.3); return y + 0.25;
};
const car = (c, glass = '#cfe9f7') => {
  const g = new THREE.Group(); world.add(g);
  box(g, 1.15, 0.38, 0.62, 0, 0.36, 0, c); box(g, 0.62, 0.32, 0.56, -0.05, 0.7, 0, glass);
  for (const [a, b] of [[0.36, 0.3], [-0.36, 0.3], [0.36, -0.3], [-0.36, -0.3]]) box(g, 0.28, 0.28, 0.1, a, 0.17, b, '#3b2a1e', false);
  bake(g); return g;
};
const robotBot = () => {
  const g = new THREE.Group(); world.add(g);
  box(g, 0.9, 0.55, 0.7, 0, 0.55, 0, PAL.navy); box(g, 0.55, 0.42, 0.5, 0, 1.05, 0, '#e9eef5');
  box(g, 0.12, 0.12, 0.05, -0.12, 1.08, 0.26, '#2b3a55', false); box(g, 0.12, 0.12, 0.05, 0.12, 1.08, 0.26, '#2b3a55', false);
  box(g, 0.06, 0.35, 0.06, 0, 1.42, 0, PAL.navy, false); box(g, 0.14, 0.14, 0.14, 0, 1.62, 0, PAL.sun, false);
  for (const [a, b] of [[0.38, 0.32], [-0.38, 0.32], [0.38, -0.32], [-0.38, -0.32]]) box(g, 0.26, 0.3, 0.14, a, 0.2, b, '#3b2a1e', false);
  box(g, 0.1, 0.1, 0.7, 0.48, 0.7, 0.3, PAL.sun, false); bake(g); return g;
};
const droneBot = () => {
  const g = new THREE.Group(); world.add(g);
  box(g, 0.8, 0.28, 0.8, 0, 0, 0, PAL.sun); box(g, 1.9, 0.08, 0.12, 0, 0.05, 0, PAL.navy, false).rotation.y = Math.PI / 4; box(g, 1.9, 0.08, 0.12, 0, 0.05, 0, PAL.navy, false).rotation.y = -Math.PI / 4;
  const rotors = [[0.67, 0.67], [-0.67, 0.67], [0.67, -0.67], [-0.67, -0.67]].map(([a, b]) => box(g, 0.75, 0.03, 0.12, a, 0.14, b, '#3b4a66', false));
  box(g, 0.04, 0.5, 0.04, 0, -0.38, 0, PAL.trunk, false); box(g, 0.5, 0.42, 0.5, 0, -0.82, 0, PAL.parcel); bake(g, rotors); return { g, rotors };
};
const pad = (x, z) => { const y = H(x, z); box(world, 1.6, 0.12, 1.6, x, y + 0.06, z, PAL.sun, false); box(world, 1.0, 0.13, 0.2, x, y + 0.07, z, PAL.navy, false); };

// ---------- 1. Eco Town: low homes with stepped roofs, an orchard, the river
[[4, -5.5], [7.2, -5.5], [10, -5], [4, -2.2], [7.5, -2], [4.2, 1.6], [7.3, 2], [10, 1.2], [10.2, -2.3]].forEach(([x, z], i) => house(x, z, i));
for (let x = -12.5; x <= -7; x += 2.2) for (const z of [2.6, 5]) tree(x + (rand() - 0.5) * 0.4, z, true, 0.9);
[[4.2, 8.6], [-1.5, -8.5], [13.6, -2.2], [6.8, 8.6], [-9, -7.2], [13.7, 3.4], [-12.5, -2.4], [0.2, 3.2], [-8, -2.6], [-0.4, -6]].forEach(([x, z]) => tree(x, z, false, 1.1));
pad(9.3, 8.2);

// ---------- 2. Drone City: towers with landing pads on their roofs, a drone port, a hospital
const roofs = [];
[[-4, -25, 3, 3, 12, 'pad'], [0.5, -26, 3, 3, 16, 'mast'], [-7.5, -23.2, 2.5, 2.5, 8, 'garden'], [3, -23, 2.5, 2.5, 10, 'pad'], [10.5, -25.5, 3, 3, 14, 'pad'], [14, -23, 2.5, 2.5, 9, 'garden'],
  [10.5, -22, 2.5, 2.5, 7, 'pad'], [-4, -16.4, 3, 3, 10, 'garden'], [0, -16.6, 2.5, 2.5, 13, 'pad'], [3.2, -15.6, 2.5, 2.5, 6, 'pad']].forEach(([x, z, w, d, f, t], i) => {
  const y = tower(x, z, w, d, f, ['#eef2f5', '#dfe6ec', '#f6f1e6'][i % 3], i % 2 ? '#6fa8d6' : PAL.glass, t); if (t === 'pad') roofs.push([x, y + 0.6, z]);
});
{ // the hospital: low and wide, with a cross
  const g = grp(-3, -12.6); box(g, 4.2, 1.9, 2.4, 0, 0.95, 0, PAL.white); box(g, 4.3, 0.5, 2.5, 0, 1.2, 0, '#bfe0f0', false); box(g, 4.4, 0.2, 2.6, 0, 2, 0, '#e9eef5');
  box(g, 0.9, 0.28, 0.1, 0, 1.55, 1.26, PAL.fruit, false); box(g, 0.28, 0.9, 0.1, 0, 1.55, 1.27, PAL.fruit, false); bake(g); solid(-3, -12.6, 4.2, 2.4);
}
{ // the drone port: a hall with a mast of landing decks
  const g = grp(11.5, -15.5); box(g, 5, 1.7, 3.6, 0, 0.85, 0, '#e9eef5'); box(g, 5.05, 0.7, 3.65, 0, 0.9, 0, PAL.glass, false); box(g, 5.2, 0.2, 3.8, 0, 1.8, 0, PAL.navy);
  box(g, 0.7, 11, 0.7, 0, 7.3, 0, PAL.steel);
  [[5, 1.5, 0], [8, -1.5, 0.6], [11, 1.2, -0.8]].forEach(([y, a, b]) => { box(g, 2.2, 0.16, 2.2, a, y, b, PAL.sun); box(g, 1.2, 0.17, 0.25, a, y + 0.01, b, PAL.navy, false); box(g, Math.abs(a), 0.14, 0.3, a / 2, y - 0.12, b / 2, PAL.steel); roofs.push([11.5 + a, y + 0.7, -15.5 + b]); });
  box(g, 0.4, 0.4, 0.4, 0, 13, 0, PAL.fruit, false); bake(g); solid(11.5, -15.5, 5, 3.6);
}
[[9.5, -11.6], [12, -11.2], [-8.5, -27.5], [-6.8, -28.2]].forEach(([x, z]) => tree(x, z, false, 1));

// ---------- 3. Robot Farm: long crop rows, glasshouses, a barn, robots at work
const crops = [], CROPC = ['#7cc04a', '#e2c04a', '#9a7fd1', '#e8923a'];
for (let z = 10.5, r = 0; z <= 21.5; z += 1, r++) for (let x = -33.2; x <= -16; x += 0.75) if (r % 2 === 0 && top.has(key(Math.floor(x), Math.floor(z))) && landVal(x, z) < 0.93) crops.push([x, z, CROPC[(r / 2) % 4]]);
const cropMesh = new THREE.InstancedMesh(BOX, new THREE.MeshLambertMaterial({ color: '#ffffff' }), crops.length); cropMesh.castShadow = true; world.add(cropMesh);
const q0 = new THREE.Quaternion(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
crops.forEach(([x, z, c], i) => { m4.compose(v1.set(x, 0.25, z), q0, v2.set(0.4, 0.5, 0.4)); cropMesh.setMatrixAt(i, m4); cropMesh.setColorAt(i, C(c)); });
const glasshouse = (x, z) => { const g = grp(x, z, Math.PI / 2); box(g, 2.4, 1, 5, 0, 0.5, 0, '#cfeaf2'); for (let k = -2; k <= 2; k++) box(g, 2.46, 1.02, 0.1, 0, 0.51, k * 1.2, PAL.white, false); stepRoof(g, 2.4, 5, 1, '#bfe3ee', '#cfeaf2', { n: 4, pitch: 0.6 }); bake(g); solid(x, z, 2.4, 5, Math.PI / 2); };
glasshouse(-11.5, 16); glasshouse(-11.5, 19.6);
{ const g = grp(-10.5, 11); box(g, 3.4, 2, 2.6, 0, 1, 0, '#b5483a'); box(g, 1, 1.3, 0.08, 0, 0.65, 1.31, PAL.white, false); stepRoof(g, 3.4, 2.6, 2, '#7a3b30', '#b5483a', { n: 5, pitch: 0.8 }); bake(g); solid(-10.5, 11, 3.4, 2.6); } // barn
for (const [x, z] of [[-8.2, 13.6], [-8.2, 12.2]]) { const g = grp(x, z); box(g, 1.1, 3.2, 1.1, 0, 1.6, 0, PAL.steel); box(g, 0.8, 0.3, 0.8, 0, 3.35, 0, '#aeb9c2'); bake(g); solid(x, z, 1.1, 1.1); } // silos
{ // packing shed with a robot arm, and the sorting shed with its belt
  const g = grp(-19, 4.6); box(g, 3.6, 1.5, 2.2, 0, 0.75, 0, '#e9e2d0'); stepRoof(g, 3.6, 2.2, 1.5, '#5f8fb5', '#e9e2d0', { n: 5, pitch: 0.5 }); bake(g); solid(-19, 4.6, 3.6, 2.2);
  const a = grp(-16.2, 4.8); box(a, 0.7, 0.3, 0.7, 0, 0.15, 0, PAL.navy); box(a, 0.22, 1.3, 0.22, 0, 0.9, 0, PAL.sun); box(a, 1.3, 0.2, 0.2, 0.55, 1.5, 0, PAL.sun).rotation.z = -0.35; box(a, 0.3, 0.3, 0.3, 1.15, 1.2, 0, PAL.navy); bake(a); posts.push([-16.2, 4.8, 0.45]);
  const b = grp(-13.6, 4.4); box(b, 3.2, 0.5, 0.8, 0, 0.45, 0, '#4a5568'); for (let k = 0; k < 4; k++) box(b, 0.4, 0.3, 0.4, -1.2 + k * 0.8, 0.85, 0, [PAL.fruit, PAL.sun, '#5aa35a', '#5cb8e6'][k], false); bake(b); solid(-13.6, 4.4, 3.2, 0.8);
}
[[-29.5, 5.6], [-33, 9], [-13, 22.6], [-27, 5.4], [-8.4, 8.6]].forEach(([x, z]) => tree(x, z, false, 1.1));
const robots = [0, 1, 2, 3].map((i) => ({ g: robotBot(), z: 11.5 + i * 3 - 0.9, x1: -31 + i * 1.5, x2: -17, off: i * 0.27 }));

// ---------- 4. Crossways: a grid of streets, crossings, a school, a car park, a charging depot
const WARM = ['#d9a273', '#c98562', '#e6c79a', '#b9735a'];
[[15.6, -8.6, 2.4, 3, 3], [15.6, -2.6, 2.4, 3, 2], [35.2, -8.6, 2.4, 3, 3], [35.2, -2.6, 2.4, 3, 4], [22, -14, 4, 2.2, 3], [29, -14, 4, 2.2, 2], [22, 3, 4, 2.2, 2], [29, 3, 4, 2.2, 3],
  [28, -2, 2.6, 2.6, 4], [30.6, -2.6, 1.6, 2.6, 2]].forEach(([x, z, w, d, f], i) => tower(x, z, w, d, f, WARM[i % 4], '#f3e9d2', i % 3 === 0 ? 'garden' : null, 0.9));
{ // school: yellow walls, a stepped roof, a flag
  const g = grp(22, -8.6); box(g, 3.6, 1.6, 2.6, 0, 0.8, 0, '#ffd76a'); box(g, 3.65, 0.5, 2.65, 0, 1, 0, '#9fd0f5', false); stepRoof(g, 3.6, 2.6, 1.6, PAL.roof[0], '#ffd76a', { n: 5, pitch: 0.8, tiles: false });
  box(g, 0.08, 3, 0.08, 2.2, 1.5, 1.5, PAL.steel); box(g, 0.7, 0.4, 0.05, 2.58, 2.75, 1.5, PAL.fruit, false); bake(g); solid(22, -8.6, 3.6, 2.6);
}
{ // car park and charging depot
  const g = grp(29, -8.5); for (let k = 0; k < 5; k++) box(g, 0.06, 0.02, 1.3, -2 + k, 0.02, -0.9, PAL.white, false); bake(g);
  ['#e0a43a', '#4f7fc4', '#2e9b5a', '#c8643f'].forEach((c, k) => { const m = car(c); m.position.set(27.5 + k, 0, -9.4); m.rotation.y = Math.PI / 2; });
  const d = grp(22, -2.4); for (const [a, b] of [[-1.7, -1], [1.7, -1], [-1.7, 1], [1.7, 1]]) box(d, 0.15, 1.6, 0.15, a, 0.8, b, PAL.steel); box(d, 4, 0.18, 2.6, 0, 1.7, 0, '#2aa198'); box(d, 3.6, 0.05, 2.2, 0, 1.82, 0, PAL.solar, false);
  for (let k = -1; k <= 1; k++) box(d, 0.2, 0.8, 0.2, k * 1.2, 0.4, -0.9, PAL.white); bake(d);
  for (let k = -1; k <= 1; k += 2) { const m = car(PAL.white, '#2aa198'); m.position.set(22 + k * 0.6, 0, -2.2); m.rotation.y = Math.PI / 2; }
}
const zebra = (x, z, alongX) => { for (let k = -2; k <= 2; k++) box(world, alongX ? 0.16 : 0.8, 0.02, alongX ? 0.8 : 0.16, x + (alongX ? k * 0.3 : 0), 0.011, z + (alongX ? 0 : k * 0.3), PAL.white, false); };
[[21.5, -5.5, true], [29.5, -5.5, true], [25.5, -8.5, false], [25.5, -2.5, false], [18.5, -8.5, false], [32.5, -2.5, false], [22, -11.5, true], [29, 0.5, true]].forEach((a) => zebra(...a));
for (const [x, z] of [[24.6, -6.4], [26.4, -4.6], [17.6, -12.4], [33.4, 1.4]]) { const g = grp(x, z); box(g, 0.1, 1.5, 0.1, 0, 0.75, 0, PAL.navy); box(g, 0.24, 0.6, 0.24, 0, 1.7, 0, PAL.navy); box(g, 0.14, 0.14, 0.26, 0, 1.88, 0, PAL.fruit, false); box(g, 0.14, 0.14, 0.26, 0, 1.7, 0, PAL.sun, false); box(g, 0.14, 0.14, 0.26, 0, 1.52, 0, '#5aa35a', false); bake(g); }
[[20, -13.6], [31.5, 3.6], [36.5, -5.5 + 2], [15.2, 1.4], [24, 4.6]].forEach(([x, z]) => tree(x, z, false, 0.95));

// ---------- 5. Studio Bay: sound stages, a street of false fronts, a crane, an open-air screen, a lagoon
[[11.4, 15.6, '#2aa198'], [16.6, 15.6, '#d0558a']].forEach(([x, z, c]) => { const g = grp(x, z); box(g, 4.4, 2.6, 3.6, 0, 1.3, 0, '#f1ebe0'); box(g, 1.6, 1.9, 0.08, 0, 0.95, -1.81, c, false); stepRoof(g, 4.4, 3.6, 2.6, c, '#f1ebe0', { n: 6, pitch: 0.45 }); bake(g); solid(x, z, 4.4, 3.6); });
{ const g = grp(18, 8.8); ['#f2b05e', '#7fc4a8', '#e8785e', '#8fb6e8', '#f0d778'].forEach((c, k) => { const h = 2 + (k % 3) * 0.6; box(g, 1.6, h, 0.16, -3.6 + k * 1.8, h / 2, 0, c); box(g, 0.4, 0.7, 0.05, -3.6 + k * 1.8, 0.35, 0.1, '#7a5a33', false); box(g, 0.4, 0.4, 0.05, -3.9 + k * 1.8, h - 0.6, 0.1, PAL.white, false); box(g, 0.1, h * 1.1, 0.1, -3.6 + k * 1.8, h * 0.45, -0.5, PAL.trunk).rotation.x = -0.45; }); bake(g); solid(18, 8.8, 9, 0.5); }
const crane = grp(20.5, 13); { box(crane, 9, 0.06, 0.12, -3, 0.03, -0.35, '#4a5568', false); box(crane, 9, 0.06, 0.12, -3, 0.03, 0.35, '#4a5568', false); bake(crane); }
const dolly = new THREE.Group(); crane.add(dolly); box(dolly, 1.1, 0.35, 0.9, 0, 0.25, 0, PAL.navy); box(dolly, 0.2, 1.1, 0.2, 0, 0.95, 0, PAL.steel);
const boom = new THREE.Group(); boom.position.y = 1.5; dolly.add(boom); box(boom, 3.2, 0.16, 0.16, 0.9, 0, 0, PAL.sun); box(boom, 0.5, 0.36, 0.36, 2.55, -0.05, 0, '#2b3a55'); box(boom, 0.4, 0.4, 0.4, -0.75, 0, 0, '#4a5568'); bake(boom); bake(dolly, [boom]);
{ const g = grp(30.2, 14.5); box(g, 0.2, 3.4, 5.2, 0, 2.5, 0, PAL.white); box(g, 0.3, 0.2, 5.6, 0, 4.3, 0, PAL.navy); for (const k of [-2.3, 2.3]) box(g, 0.2, 0.9, 0.2, 0, 0.45, k, PAL.navy); bake(g); solid(30.2, 14.5, 0.5, 5.2);
  const s = grp(25.6, 14.5); for (let k = 0; k < 3; k++) box(s, 0.9, 0.3 * (k + 1), 3.6, -k * 0.9, 0.15 * (k + 1), 0, k % 2 ? '#d0558a' : '#e58bb0'); bake(s); solid(24.7, 14.5, 2.7, 3.6); }
{ const g = grp(12, 21.4); ['#e0503a', PAL.white, '#e0503a', PAL.white].forEach((c, k) => box(g, 1.3 - k * 0.2, 1, 1.3 - k * 0.2, 0, 0.5 + k, 0, c)); box(g, 0.9, 0.5, 0.9, 0, 4.25, 0, PAL.sun, false); box(g, 1.1, 0.15, 1.1, 0, 4.6, 0, PAL.navy); bake(g); solid(12, 21.4, 1.3, 1.3); } // lighthouse
{ const g = new THREE.Group(); world.add(g); for (let k = 0; k < 6; k++) box(g, 0.9, 0.12, 1.2, 18.6 + k, 0.02, 19.6, PAL.plank); for (const k of [20, 22.4]) box(g, 0.14, 0.9, 0.14, k, -0.3, 20.3, PAL.trunk); bake(g); } // pier
for (const [x, z, r] of [[9.2, 12.9, 0.5], [22.6, 18]]) { const g = grp(x, z); box(g, 0.1, 1.4, 0.1, 0, 0.7, 0, PAL.navy); box(g, 0.5, 0.4, 0.4, 0, 1.5, 0, PAL.navy).rotation.z = 0.4; box(g, 0.1, 0.3, 0.3, 0.25, 1.6, 0, PAL.sun, false); bake(g); }
[[8.5, 18.6], [15, 21.6], [29.5, 20], [28.6, 9.6], [21.4, 22.6], [9.2, 9.6]].forEach(([x, z]) => tree(x, z, false, 1));

// ---------- 6. Power Ridge: wind on the high ground, a solar field, the town batteries, the control room, the dam
[[-31, -12, 8, 0], [-27, -17, 9, 1], [-21, -17, 7.5, 2], [-33, -6, 7, 3], [-29.5, -2.6, 8.5, 4], [-19, -10.6, 9, 5]].forEach((a) => turbine(...a));
{ const g = new THREE.Group(); world.add(g); for (const z of [-0.2, 1.2, 2.6]) for (let x = -31.2; x <= -27; x += 1.8) { if (!isLand(x, z)) continue; const y = H(x, z); box(g, 1.6, 0.07, 1, x, y + 0.6, z, PAL.solar).rotation.x = 0.5; box(g, 0.1, 0.6, 0.1, x - 0.6, y + 0.3, z, PAL.steel, false); box(g, 0.1, 0.6, 0.1, x + 0.6, y + 0.3, z, PAL.steel, false); } bake(g); }
for (const [x, z] of [[-28.6, -8.2], [-28.6, -6.6], [-30.8, -8.2], [-30.8, -6.6]]) { const g = grp(x, z); box(g, 1.7, 0.95, 0.9, 0, 0.55, 0, PAL.white); box(g, 1.72, 0.14, 0.92, 0, 0.75, 0, '#5aa35a', false); box(g, 1.8, 0.1, 1, 0, 0.05, 0, '#4a5568', false); bake(g); solid(x, z, 1.7, 0.9); }
{ const g = grp(-22.4, -10.2); box(g, 3.8, 1.7, 2.6, 0, 0.85, 0, '#e9eef5'); box(g, 3.85, 0.8, 2.65, 0, 1, 0, '#2f6f8f', false); box(g, 4.1, 0.2, 2.9, 0, 1.8, 0, PAL.sun); box(g, 0.12, 3, 0.12, 1.2, 3.4, -0.6, PAL.navy); box(g, 0.9, 0.9, 0.12, -0.9, 2.5, -0.5, PAL.white).rotation.x = -0.5; box(g, 0.3, 0.3, 0.3, 1.2, 5, -0.6, PAL.fruit, false); bake(g); solid(-22.4, -10.2, 3.8, 2.6); }
{ const g = new THREE.Group(); world.add(g); box(g, 0.7, 2.7, 5, -17.1, 2.25, -5.2, '#cfd3d6'); box(g, 1, 0.2, 5.4, -17.1, 3.7, -5.2, '#aeb4b9'); bake(g); solid(-17.1, -5.2, 0.7, 5); } // dam wall
const pylon = (x, z) => { const g = grp(x, z); for (const k of [-0.3, 0.3]) box(g, 0.12, 4.8, 0.12, k, 2.4, 0, '#6b7785').rotation.z = -k * 0.1; box(g, 2, 0.12, 0.12, 0, 4.2, 0, '#6b7785'); box(g, 1.3, 0.12, 0.12, 0, 4.8, 0, '#6b7785'); bake(g); posts.push([x, z, 0.4]); return new THREE.Vector3(x, g.position.y + 4.2, z); };
const wire = (a, b) => { for (const k of [-0.9, 0.9]) { const p = a.clone().add(b).multiplyScalar(0.5), m = box(world, 0.05, 0.05, a.distanceTo(b), p.x + k, p.y, p.z, '#4a5568', false); m.receiveShadow = false; m.lookAt(b.x + k, b.y, b.z); } };
const LINES = [[[-20.4, -8.2], [-14, -2.2], [-7, -2.2], [-0.6, -1.8]], [[-20.4, -8.2], [-9.6, -17.4], [-2, -21.6]], [[-20.4, -8.2], [-26.8, 2.4], [-27, 8.8]], [[-0.6, -1.8], [14.2, -4.2], [20, -4.2]], [[-0.6, -1.8], [8.2, 10], [14, 12.6]]];
const pyl = new Map(); for (const line of LINES) line.map(([x, z]) => { const k = key(x, z); if (!pyl.has(k)) pyl.set(k, pylon(x, z)); return pyl.get(k); }).forEach((p, i, a) => { if (i) wire(a[i - 1], p); });

// ---------- the high bridge, the waterfalls, clouds
{ const g = new THREE.Group(); world.add(g); box(g, 9.4, 0.25, 1.7, -11.5, -0.13, -14.5, PAL.road); for (const s of [-0.8, 0.8]) { box(g, 9.4, 0.1, 0.1, -11.5, 0.75, -14.5 + s, PAL.white); for (let x = -15.5; x <= -7.5; x += 1) box(g, 0.1, 0.8, 0.1, x, 0.35, -14.5 + s, PAL.white, false); }
  for (const x of [-15.4, -7.6]) for (const s of [-1, 1]) box(g, 0.4, 5, 0.4, x, 1.6, -14.5 + s, '#c8643f'); for (const x of [-15.4, -7.6]) box(g, 0.4, 0.4, 2.4, x, 4.1, -14.5, '#c8643f'); bake(g); }
const FALLS = [[riverX(10.6) + 0.2, 0, 11.2, 0, 1], [-16.5, 2.9, -4.6, 1, 0]]; // x, y, z, and which way it spills
const drops = new THREE.InstancedMesh(BOX, new THREE.MeshLambertMaterial({ color: '#8fd3f4' }), 40); drops.castShadow = false; world.add(drops);
const dropSeed = Array.from({ length: 40 }, () => [rand() * 1.6 - 0.8, rand(), 0.35 + rand() * 0.3]);
const clouds = [];
for (let i = 0; i < 12; i++) {
  const g = new THREE.Group(); const a = (i / 12) * Math.PI * 2; g.userData = { a, r: 58 + rand() * 20, y: -12 + rand() * 8, s: 0.008 + rand() * 0.01 };
  for (let k = 0; k < 4; k++) box(g, 3 + rand() * 3, 1.2 + rand(), 2.4 + rand() * 2, k * 2 - 3, rand() * 0.6, rand() - 0.5, PAL.white, false);
  bake(g, [], CLOUD); world.add(g); clouds.push(g);
}

// ---------- things that move: drones between the towns, cars on the streets
const curve = (pts) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), true, 'catmullrom', 0.4);
const R = (i) => roofs[i % roofs.length];
const drones = [
  [curve([R(0), [-2, 12, -12], [9.3, 5, 8.2], [9.3, 1.4, 8.2], [9.3, 5, 8.2], [4, 13, -8]]), 0.03],                                   // a delivery to Eco Town
  [curve([R(4), [-6, 9, 2], [-18, 5, 11], [-32, 5, 11], [-32, 5, 14], [-18, 5, 14], [-18, 5, 17], [-32, 5, 17], [-20, 8, 8], [-4, 12, -8]]), 0.016], // a survey of the farm
  [curve([R(2), [-12, 9, -16], [-21, 10.5, -15.5], [-27, 12, -15.6], [-30, 11, -11], [-19, 12, -9.4], [-11.5, 3, -13], [-6, 9, -18]]), 0.02],  // inspecting the turbines and the bridge
  [curve([R(7), R(8), [16, 9, -10], [25, 6, -6], [20, 7, 12], [12, 9, 4], R(9)]), 0.022],
].map(([c, s], i) => ({ ...droneBot(), c, s, off: i * 0.31 }));
const loopOf = (pts) => { const legs = pts.map((p, i) => { const q = pts[(i + 1) % pts.length]; return Math.hypot(q[0] - p[0], q[1] - p[1]); }), len = legs.reduce((a, b) => a + b, 0);
  return (u) => { let d = (((u % 1) + 1) % 1) * len; for (let i = 0; i < pts.length; i++) { if (d <= legs[i]) { const p = pts[i], q = pts[(i + 1) % pts.length], k = d / legs[i]; return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, Math.atan2(-(q[1] - p[1]), q[0] - p[0])]; } d -= legs[i]; } return [pts[0][0], pts[0][1], 0]; }; };
const L1 = loopOf([[1.5, -7.5], [12.5, -7.5], [12.5, 5.5], [1.5, 5.5]]), L2 = loopOf([[18.5, -11.5], [32.5, -11.5], [32.5, 0.5], [18.5, 0.5]]), L3 = loopOf([[12.5, -5.5], [25.5, -5.5], [25.5, 11.5], [11.5, 11.5], [11.5, 5.5], [12.5, 5.5]]);
const cars = [[L1, '#2e9b5a', 0, 0.03], [L1, '#e0a43a', 0.5, 0.03], [L2, '#4f7fc4', 0, 0.035], [L2, '#c8643f', 0.33, 0.035], [L2, PAL.white, 0.66, 0.035], [L3, PAL.white, 0.2, 0.02], [L3, '#e0a43a', 0.7, 0.02]]
  .map(([f, c, off, s]) => ({ g: car(c, c === PAL.white ? '#2aa198' : undefined), f, off, s }));

// ---------- the walker (the same figure as the island walk test)
const part = (p, w, h, d, x, y, z, c) => box(p, w, h, d, x, y, z, c);
const limb = (p, w, h, d, x, y, z, c) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); part(g, w, h, d, 0, -h / 2, 0, c); return g; };
const player = new THREE.Group(); world.add(player); const body = new THREE.Group(); player.add(body);
part(body, 0.42, 0.46, 0.26, 0, 0.63, 0, '#e0503a'); part(body, 0.36, 0.34, 0.34, 0, 1.03, 0, '#f2c79a'); part(body, 0.4, 0.12, 0.38, 0, 1.24, 0, '#7a5a33');
const legL = limb(body, 0.17, 0.4, 0.2, -0.11, 0.4, 0, '#2b3a55'), legR = limb(body, 0.17, 0.4, 0.2, 0.11, 0.4, 0, '#2b3a55'), armL = limb(body, 0.13, 0.42, 0.16, -0.28, 0.84, 0, '#e0503a'), armR = limb(body, 0.13, 0.42, 0.16, 0.28, 0.84, 0, '#e0503a');
player.position.set(6.5, 0, 6.8);
const free = (x, z, y) => {
  if (!isLand(x, z) || landVal(x, z) > 1.02 && !neckSet.has(key(Math.floor(x), Math.floor(z))) && !bridgeSet.has(key(Math.floor(x), Math.floor(z)))) return false;
  if (Math.abs(Math.max(0, H(x, z)) - Math.max(0, y)) > 1.05) return false;
  for (const [a, b, hw, hd] of solids) if (Math.abs(x - a) < hw + 0.24 && Math.abs(z - b) < hd + 0.24) return false;
  for (const [a, b, r] of posts) if ((x - a) ** 2 + (z - b) ** 2 < (r + 0.24) ** 2) return false;
  return true;
};

// ---------- views and input
const VIEWS = { world: { t: [-2, 0, -3], r: 100, phi: 0.92, th: 0.42 } };
for (const t of TOWNS) VIEWS[t.id] = { t: [t.c[0], 1.5, t.c[1]], r: t.id === 'drone' ? 52 : 44, phi: 1.02, th: 0.42 };
const cam = { t: new THREE.Vector3(-2, 0, -3), r: 170, phi: 0.8, th: 0.1 }, want = { t: new THREE.Vector3(-2, 0, -3), r: 100, phi: 0.92, th: 0.42 };
let view = 'world', walking = false, touched = false, T0 = 0;
const listeners = [];
export const onView = (fn) => listeners.push(fn);
export function setView(name) {
  if (!VIEWS[name]) return; view = name; walking = false; const v = VIEWS[name];
  want.t.set(...v.t); want.r = v.r; want.phi = v.phi; listeners.forEach((f) => f(view, walking));
}
export function setWalk(on) {
  walking = on; if (on) { const t = view === 'world' ? T.eco : T[view], s = { eco: [6.5, 6.8], drone: [6.5, -18], robot: [-14, 7.5], roads: [25.5, -4], film: [14, 11.5], power: [-24.5, -3] }[t.id]; player.position.set(s[0], H(s[0], s[1]), s[1]); want.r = 11; want.phi = 1.05; }
  else setView(view); listeners.forEach((f) => f(view, walking));
}
const keys = new Set();
addEventListener('keydown', (e) => { if (!walking || e.target.closest?.('input, textarea')) return; keys.add(e.code); if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault(); });
addEventListener('keyup', (e) => keys.delete(e.code)); addEventListener('blur', () => keys.clear());
const ptrs = new Map(); const stick = { id: null, x0: 0, y0: 0, x: 0, y: 0 }, stickEl = document.getElementById('stick'); let pinch = 0, jumpAsked = false;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId); touched = true; const r = canvas.getBoundingClientRect();
  if (walking && e.pointerType === 'touch' && e.clientX - r.left < r.width * 0.45 && stick.id === null) { Object.assign(stick, { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: 0, y: 0 }); if (stickEl) { stickEl.hidden = false; stickEl.style.left = e.clientX - r.left + 'px'; stickEl.style.top = e.clientY - r.top + 'px'; } return; }
  ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); } if (walking && ptrs.size === 2) jumpAsked = true;
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId === stick.id) { let dx = e.clientX - stick.x0, dy = e.clientY - stick.y0; const d = Math.hypot(dx, dy), max = 45; if (d > max) { dx *= max / d; dy *= max / d; } stick.x = dx / max; stick.y = dy / max; if (stickEl) stickEl.firstElementChild.style.transform = `translate(${dx}px, ${dy}px)`; return; }
  const p = ptrs.get(e.pointerId); if (!p) return;
  if (ptrs.size === 1) { want.th -= (e.clientX - p[0]) * 0.006; cam.th -= (e.clientX - p[0]) * 0.006; want.phi = Math.min(1.45, Math.max(0.3, want.phi - (e.clientY - p[1]) * 0.005)); }
  ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (ptrs.size === 2 && !walking) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) want.r = Math.min(220, Math.max(8, want.r * pinch / d)); pinch = d; }
});
const up = (e) => { if (e.pointerId === stick.id) { stick.id = null; stick.x = stick.y = 0; if (stickEl) stickEl.hidden = true; } ptrs.delete(e.pointerId); pinch = 0; };
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
canvas.addEventListener('wheel', (e) => { e.preventDefault(); touched = true; want.r = Math.min(220, Math.max(walking ? 5 : 8, want.r * (e.deltaY > 0 ? 1.1 : 0.9))); }, { passive: false });

// ---------- labels: one per town, placed over it each frame
const labels = TOWNS.map((t) => { const el = document.querySelector(`[data-town="${t.id}"]`); return el ? { el, p: new THREE.Vector3(t.c[0], t.top, t.c[1]) } : null; }).filter(Boolean);
let W = 1, Hh = 1;
const resize = () => { const r = canvas.getBoundingClientRect(); W = Math.max(1, Math.round(r.width)); Hh = Math.max(1, Math.round(r.height)); renderer.setSize(W, Hh, false); camera.aspect = W / Hh; camera.updateProjectionMatrix(); };
new ResizeObserver(resize).observe(canvas); resize();

let vy = 0, facing = Math.PI, stride = 0, moving = 0, last = 0, running = true;
const tmp = new THREE.Vector3(), wp = new THREE.Vector3();
function frame(now) {
  if (!running) return; requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - (last || now)) / 1000) || 0.016; last = now; const t = reduced ? 8 : (T0 += dt) + 8;
  for (const [hub, ph] of blades) hub.rotation.z = -t * (1.3 + ph * 0.2) - ph;
  for (const d of drones) { const u = (t * d.s + d.off) % 1; d.c.getPointAt(u, tmp); d.g.position.copy(tmp); d.g.position.y += Math.sin(t * 2.4 + d.off * 9) * 0.15; d.c.getPointAt((u + 0.005) % 1, wp); d.g.rotation.y = Math.atan2(wp.x - tmp.x, wp.z - tmp.z); d.rotors.forEach((r, i) => { r.rotation.y = t * 30 * (i % 2 ? 1 : -1); }); }
  for (const c of cars) { const [x, z, a] = c.f(t * c.s + c.off); c.g.position.set(x, 0, z); c.g.rotation.y = a; }
  for (const r of robots) { const ph = ((t / 9 + r.off) % 2), fwd = ph < 1, k = fwd ? ph : 2 - ph; r.g.position.set(r.x1 + (r.x2 - r.x1) * k, 0, r.z); r.g.rotation.y = fwd ? Math.PI / 2 : -Math.PI / 2; }
  dolly.position.x = -3 + Math.sin(t * 0.25) * 3.6; boom.rotation.y = Math.sin(t * 0.4) * 0.9; boom.rotation.z = 0.2 + Math.sin(t * 0.3) * 0.15;
  for (const g of clouds) { const d = g.userData; d.a += d.s * dt; g.position.set(Math.cos(d.a) * d.r, d.y, Math.sin(d.a) * d.r * 0.8 - 3); }
  for (let i = 0; i < dropSeed.length; i++) { const [ox, ph0, s] = dropSeed[i], F = FALLS[i % 2], f = (ph0 + t * 0.45) % 1, len = i % 2 ? 2.6 : 9; m4.compose(wp.set(F[0] + (F[4] ? ox : f * 0.5), F[1] - 0.5 - f * len, F[2] + (F[4] ? f * 0.6 : ox * 1.6)), q0, tmp.setScalar(s * (1 - f * 0.6))); drops.setMatrixAt(i, m4); }
  drops.instanceMatrix.needsUpdate = true;

  const pos = player.position;
  if (walking) {
    let ix = stick.x + (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), iz = -stick.y + (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
    const len = Math.hypot(ix, iz); if (len > 1) { ix /= len; iz /= len; }
    const g1 = H(pos.x, pos.z), speed = (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 6 : 3.4) * (g1 % 1 !== 0 && pos.y < g1 + 0.3 ? 0.55 : 1);
    const dx = (-Math.sin(cam.th) * iz + Math.cos(cam.th) * ix) * speed * dt, dz = (-Math.cos(cam.th) * iz - Math.sin(cam.th) * ix) * speed * dt;
    if (free(pos.x + dx, pos.z + dz, g1)) { pos.x += dx; pos.z += dz; } else if (free(pos.x + dx, pos.z, g1)) pos.x += dx; else if (free(pos.x, pos.z + dz, g1)) pos.z += dz;
    const g2 = H(pos.x, pos.z); if ((keys.has('Space') || jumpAsked) && pos.y <= g2 + 0.01) vy = 5.2; jumpAsked = false;
    vy -= 15 * dt; pos.y += vy * dt; if (pos.y <= g2) { pos.y = damp(pos.y, g2, 18, dt); if (pos.y < g2) pos.y = Math.max(pos.y, g2 - 0.02); vy = Math.max(0, vy); if (Math.abs(pos.y - g2) < 0.03) pos.y = g2; }
    const wantMove = Math.min(1, Math.hypot(ix, iz)); moving = damp(moving, wantMove, 10, dt);
    if (wantMove > 0.05) { let d = Math.atan2(dx, dz) - facing; d = Math.atan2(Math.sin(d), Math.cos(d)); facing += d * (1 - Math.exp(-12 * dt)); }
    player.rotation.y = facing; stride += dt * speed * 3.1 * wantMove; const sw = Math.sin(stride) * 0.75 * moving; legL.rotation.x = sw; legR.rotation.x = -sw; armL.rotation.x = -sw; armR.rotation.x = sw;
    want.t.set(pos.x, Math.max(pos.y, 0) + 0.9, pos.z);
  } else if (!touched && !reduced) { want.th += dt * 0.02; }
  const k = walking ? 9 : 2.6;
  cam.t.x = damp(cam.t.x, want.t.x, k, dt); cam.t.y = damp(cam.t.y, want.t.y, k, dt); cam.t.z = damp(cam.t.z, want.t.z, k, dt);
  cam.r = damp(cam.r, want.r, 3, dt); cam.phi = damp(cam.phi, want.phi, 4, dt); cam.th = damp(cam.th, want.th, 3, dt);
  const rr = cam.r * (walking ? 1 : Math.max(1, 1.3 / (W / Hh))); // a tall, narrow screen stands further back so the view still fits
  camera.position.set(cam.t.x + rr * Math.sin(cam.phi) * Math.sin(cam.th), cam.t.y + rr * Math.cos(cam.phi), cam.t.z + rr * Math.sin(cam.phi) * Math.cos(cam.th));
  camera.lookAt(cam.t); renderer.render(scene, camera);
  for (const l of labels) { tmp.copy(l.p).project(camera); const show = !walking && view === 'world' && tmp.z < 1; l.el.hidden = !show; if (show) l.el.style.transform = `translate(-50%, -100%) translate(${((tmp.x + 1) / 2 * W).toFixed(1)}px, ${((1 - tmp.y) / 2 * Hh).toFixed(1)}px)`; }
}
requestAnimationFrame(frame);
document.addEventListener('visibilitychange', () => { const on = document.visibilityState === 'visible'; if (on && !running) { running = true; last = 0; requestAnimationFrame(frame); } else if (!on) running = false; });

// the page's buttons
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { touched = true; setView(b.dataset.view); }));
document.querySelectorAll('[data-town]').forEach((b) => b.addEventListener('click', () => { touched = true; setView(b.dataset.town); }));
const walkBtn = document.querySelector('[data-walk]'); walkBtn?.addEventListener('click', () => { touched = true; setWalk(!walking); });
onView((v, w) => { document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(!w && b.dataset.view === v))); walkBtn?.setAttribute('aria-pressed', String(w)); document.documentElement.dataset.walking = w ? 'on' : 'off'; });
listeners.forEach((f) => f(view, walking));
window.worldmap = { setView, setWalk, player, cells: cells.length, cam, want, snap() { cam.t.copy(want.t); cam.r = want.r; cam.phi = want.phi; cam.th = want.th; } }; // for checks
