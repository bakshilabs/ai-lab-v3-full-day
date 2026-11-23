// The place of the Food level: the market square at the edge of Eco Town. Three stalls stand in front. The community gardens are on the
// left of the square, the indoor farm with its open front is on the right, and straight ahead, through the town gate, one long road
// crosses the valley and climbs a far hillside to the big farm. The year can turn from summer through autumn to winter.
// This file only builds the place and gives handles to it. What happens in it is in level.js.
import { THREE, B, blk, group, fig, frame, place, M, hash, soft, texBox, tileMat, patTex, FAMILY, SHIRTS, SKIN, HAIR } from '../../level-kit/blocks.js';
import { newScene, drawSky, hot, glowMarks, plate } from '../../level-kit/stage.js';
import { lettuce } from '../../kit-v2.js';

const C = (h) => new THREE.Color(h), GL = (c) => new THREE.MeshBasicMaterial({ color: c });
export const MAIN = { eye: [0, 3.3, 26], at: [0, 5.4, -14], fov: 46 };
export const STALLX = [-7.2, 0, 7.2], STALLZ = 11;
// the three skies of the year, each as [top, middle, horizon], and the sky of a summer evening
const SKY = [['#2f8fe6', '#a3d5f6', '#ffeccb'], ['#5d8fc4', '#cfd8dc', '#ffd7a0'], ['#8b9fc4', '#cdd6e6', '#eef0f5']], EVENING = ['#33469a', '#d98f86', '#ffcf8c'];

// ---- the five crops, and a tray or bed of each ----------------------------------------------------------------------------------------
export const CROPS = [{ id: 'tomato', name: 'Tomatoes', tall: true, col: '#e23b2e' }, { id: 'lettuce', name: 'Lettuce', col: '#6cc257' }, { id: 'strawberry', name: 'Strawberries', col: '#e02a4a' },
  { id: 'pepper', name: 'Peppers', col: '#f2b21c' }, { id: 'herbs', name: 'Herbs', col: '#2f9a58' }];
export const crop = (id) => CROPS.find((c) => c.id === id);
// A row of plants about 2 wide. set(k) grows it from a seedling (0) to ripe (1), and pick() takes the food away and leaves the plant bare.
// roots adds white roots that hang under the tray, for plants that grow in water
export function mkPlant(parent, x, y, z, c, o = {}) { const g = group(parent, x, y, z), leaves = group(g), fruit = group(g), q = { g, crop: c, k: 1, picked: false }, L = '#3f9a4a', L2 = '#58b85a';
  if (c.id === 'tomato') for (const dx of [-0.7, 0, 0.7]) { B(leaves, dx, 0, 0.1, 0.1, 0, 1.9, '#2e7b3a'); for (let j = 0; j < 4; j++) { B(leaves, dx + (j % 2 ? 0.14 : -0.14), 0, 0.46, 0.4, 0.25 + j * 0.42, 0.24, j % 2 ? L : L2); blk(fruit, dx + (j % 2 ? -0.2 : 0.2), 0.16, 0.24, 0.24, 0.3 + j * 0.42, 0.24, c.col, { mat: GL('#ea3d2d'), shadow: false }); } }
  else if (c.id === 'lettuce') { for (const dx of [-0.7, 0, 0.7]) lettuce(fruit, dx, 0, 0, 1.15); }
  else if (c.id === 'strawberry') for (const dx of [-0.7, 0, 0.7]) { B(leaves, dx, 0, 0.56, 0.5, 0, 0.26, L); B(leaves, dx, 0, 0.36, 0.34, 0.26, 0.14, L2); for (const s of [-1, 1]) blk(fruit, dx + s * 0.2, 0.3, 0.17, 0.17, 0.06, 0.2, c.col, { mat: GL('#e8284c'), shadow: false }); }
  else if (c.id === 'pepper') for (const dx of [-0.7, 0, 0.7]) { B(leaves, dx, 0, 0.1, 0.1, 0, 0.5, '#2e7b3a'); B(leaves, dx, 0, 0.56, 0.5, 0.36, 0.5, L); for (const s of [-1, 1]) blk(fruit, dx + s * 0.18, 0.27, 0.2, 0.18, 0.3, 0.34, c.col, { mat: GL('#f6b81e'), shadow: false }); }
  else for (const dx of [-0.75, -0.25, 0.25, 0.75]) { B(leaves, dx, 0, 0.3, 0.34, 0, 0.3, '#2f8a4c'); blk(fruit, dx, 0, 0.4, 0.44, 0.3, 0.32, c.col, { mat: GL('#37b061'), shadow: false }); blk(fruit, dx, 0.05, 0.24, 0.26, 0.62, 0.16, c.col, { mat: GL('#62cf7c'), shadow: false }); }
  if (o.roots) for (let j = 0; j < 7; j++) blk(g, -0.9 + j * 0.3, 0.1 * ((j % 3) - 1), 0.06, 0.06, -0.52 - hash(j, x) * 0.1, 0.4 + hash(j, x) * 0.1, '#ffffff', { mat: GL('#ffffff'), shadow: false });
  q.set = (k) => { q.k = k; const sc = 0.22 + 0.78 * k; leaves.scale.setScalar(sc); fruit.scale.setScalar(sc); fruit.visible = !q.picked && (k > 0.9 || c.id === 'lettuce' || c.id === 'herbs'); };
  q.pick = () => { q.picked = true; fruit.visible = false; }; q.regrow = () => { q.picked = false; q.set(1); }; q.set(o.k ?? 1); return q; }

// an open wooden crate; fill(n, colours) shows n pieces of food in it
function mkCrate(parent, x, y, z, k = 1) { const g = group(parent, x, y, z), bits = []; g.scale.setScalar(k);
  texBox(g, 0, 0, 0.9, 0.7, 0, 0.34, tileMat('board', '#c99a5e'), 0.6, 0.6); B(g, 0, 0, 0.78, 0.58, 0.3, 0.06, '#5a3d24');
  for (let j = 0; j < 6; j++) bits.push(blk(g, -0.26 + (j % 3) * 0.26, -0.13 + Math.floor(j / 3) * 0.26, 0.24, 0.24, 0.34, 0.2 + hash(j, 4) * 0.08, '#fff', { mat: GL('#ea3d2d'), shadow: false }));
  g.fill = (n, cols = ['#ea3d2d', '#8fd86c', '#f6b81e']) => { bits.forEach((b, j) => { b.visible = j < n; b.material = GL(cols[j % cols.length]); }); return g; }; return g.fill(6); }
// a sealed cold box: white, with a blue lid and a pale blue mark on the front
function mkCold(parent, x, y, z, k = 1) { const g = group(parent, x, y, z); g.scale.setScalar(k); B(g, 0, 0, 0.9, 0.7, 0, 0.5, '#eef3f7'); B(g, 0, 0, 0.94, 0.74, 0.5, 0.12, '#4f8fd0');
  for (const [w, h] of [[0.36, 0.08], [0.08, 0.3]]) blk(g, 0, 0.36, w, 0.02, 0.25 - h / 2, h, '#9cc8ee', { mat: GL('#8ec3f0'), shadow: false }); return g; }
function mkBasket(parent, x, y, z) { const g = group(parent, x, y, z); texBox(g, 0, 0, 0.62, 0.46, 0, 0.26, tileMat('board', '#a8743f'), 0.3, 0.3); blk(g, -0.12, 0, 0.12, 0.3, 0.26, 0.1, '#f08a2a', { mat: GL('#f08a2a'), shadow: false }); blk(g, 0.12, 0, 0.2, 0.26, 0.26, 0.14, '#2f7a48', { mat: GL('#2f7a48'), shadow: false }); return g; }
const wheel = (g, x, y, z, r = 0.4, t = 0.12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 12), M('#2b2f3a')); m.rotation.z = Math.PI / 2; m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };

export function buildPlace() { const s = newScene(38, { sun: [-20, 34, 26], haze: 0.0044, skies: SKY }), g = s.g; Object.assign(s, { ...MAIN, eye: [...MAIN.eye], at: [...MAIN.at], bloom: 0.55 });
  // ---- materials that change with the season: each has a colour for summer, autumn and winter ------------------------------------------
  const seasonal = [], sm = (su, au, wi, base) => { const m = base ? base.clone() : new THREE.MeshLambertMaterial(); seasonal.push({ m, c: [C(su), C(au), C(wi)] }); m.color.set(su); return m; };
  const leafM = [0, 1, 2].map((i) => { const m = sm(['#4fae48', '#3f9d40', '#63bd50'][i], ['#e8962e', '#d9702a', '#f0b63a'][i], ['#e9eff6', '#dfe7f1', '#f4f7fb'][i]); m.map = patTex('leaf'); return m; });
  const grassM = sm('#74c458', '#9dba55', '#eef2f6'), grassM2 = sm('#69b84f', '#93b04c', '#e6ecf3'), paveM = sm('#f1e0bd', '#efdcb4', '#f3f2ee', tileMat('pave', '#ffffff')), soilM = sm('#6b4a2e', '#6b4a2e', '#f2f4f7'), snowM = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  const tree = (p, x, y, z, k = 1) => { const t = group(p, x, y, z); t.scale.setScalar(k); B(t, 0, 0, 0.5, 0.5, 0, 2.6, '#7a5230', { tex: 'bark' }); const i = Math.floor(hash(x, z) * 3); blk(t, 0, 0, 3, 3, 2.4, 2.2, '', { mat: leafM[i] }); blk(t, 0.2, -0.1, 2, 2, 4.6, 1.3, '', { mat: leafM[(i + 1) % 3] }); return t; };
  const snowCaps = [], cap = (p, x, z, w, d, y) => { const c = blk(p, x, z, w, d, y, 0.3, '', { mat: snowM }); c.userData.y = y; snowCaps.push(c); return c; };

  // ---- the ground, the valley, the far hill and the long road ---------------------------------------------------------------------------
  texBox(g, 0, 12, 90, 48, -1, 1, paveM, 2.4, 2.4); blk(g, 0, -31, 700, 38, -1, 1, '', { mat: grassM });
  const NS = 13, stepH = (k) => 3 * (k + 1), stepZ = (k) => -50 - 8 * k;                                    // the hill rises in thirteen steps, each 8 deep and 3 high
  for (let k = 0; k < NS; k++) blk(g, 0, stepZ(k) - 4, 460 - k * 16, 8, -1, stepH(k) + 1, '', { mat: k % 2 ? grassM : grassM2, shadow: false });
  blk(g, -250, -150, 240, 60, -1, 30, '', { mat: grassM2, shadow: false }); blk(g, 260, -170, 260, 60, -1, 36, '', { mat: grassM, shadow: false }); blk(g, 0, -250, 900, 40, -1, 58, '', { mat: sm('#8fc2a0', '#b9c08a', '#e3e9f2'), shadow: false });
  s.roadY = (z) => (z > -50 ? 0.08 : 3 * ((-50 - z) / 8 + 1) + 0.25);                                          // the height of the road at z
  const roadM = sm('#ecd9a8', '#e9d5a0', '#b7b0a3'); blk(g, 0, -31, 4.6, 38.5, 0, 0.08, '', { mat: roadM, shadow: false });
  { const len = Math.hypot(104, 39), r = blk(g, 0, -102, 5.4, len, 0, 0.4, '', { mat: roadM, shadow: false }); r.position.y = 3 + 19.5; r.rotation.x = Math.atan2(39, 104); for (const sx of [-1, 1]) { const e = blk(g, sx * 3, -102, 0.6, len, 0, 0.5, '', { mat: sm('#c9a970', '#c9a970', '#b9b4aa'), shadow: false }); e.position.y = 22.5; e.rotation.x = Math.atan2(39, 104); } }
  for (const [x, z, k] of [[-60, -44, 2], [62, -40, 2], [-52, -30, 1.8], [48, -28, 1.7], [-75, -34, 2], [-66, -22, 1.6], [58, -20, 1.6]]) tree(g, x, 0, z, k);
  for (const [x, w] of [[-22, 26], [24, 30]]) blk(g, x, -36, w, 1, 0, 1.1, '', { mat: leafM[1] });        // hedges across the valley
  for (let k = 0; k < NS; k++) for (const sx of [-1, 1]) if (k < 2 || k > 10) for (let j = 0; j < 4; j++) tree(g, sx * ((k < 2 ? 56 : 14) + j * 17 + hash(k, j) * 8), stepH(k), stepZ(k) - 1.5, 2.4 + hash(j, k) * 0.8);
  for (let k = 2; k <= 10; k++) for (const sx of [-1, 1]) for (let j = 0; j < 3; j++) tree(g, sx * (66 + j * 16 + hash(k, j) * 9), stepH(k), stepZ(k) - 1.5, 2.6 + hash(j, k));

  // ---- the big farm far away -----------------------------------------------------------------------------------------------------------
  // Each field is the front of two steps of the hill, on one side of the road. From the square only the fronts of the steps can be seen, so the rows of the crop are drawn on them
  const farm = group(g), farmOn = group(farm), FIELD = ['#e8c24a', '#7cc552', '#c9843f', '#b6d94c', '#58a84a', '#f0d368', '#9a6a3a', '#8fd05c'];
  const stripeM = (hex) => { const m = tileMat('stripe', '#ffffff').clone(); m.color.set(hex); return m; };
  s.fields = []; for (let j = 0; j < 4; j++) for (const sx of [-1, 1]) { const k = 2 + 2 * j, f = { g: group(farm), mat: stripeM(FIELD[s.fields.length]), k, x: sx < 0 ? -25 : 17, w: sx < 0 ? 42 : 26, y: stepH(k) - 3, z: stepZ(k), sown: true };
    for (const dk of [0, 1]) { texBox(f.g, f.x, stepZ(k + dk) + 0.2, f.w, 0.4, stepH(k + dk) - 3, 3, f.mat, 1.5, 3); }
    f.mark = group(farm); for (const dk of [0, 1]) blk(f.mark, f.x, stepZ(k + dk) + 0.5, f.w, 0.3, stepH(k + dk) - 3, 3, '', { mat: soft('#ffdf3d', 0.85), shadow: false }); glowMarks(f.mark); f.mark.visible = false; s.fields.push(f); }
  // the barn and its silos always stand on the hill; the packing shed, the harvester and the lorry belong to the plan
  { const y = stepH(10), z = stepZ(10) - 4; B(farm, -22, z, 20, 7, y, 9, '#c94f3a', { shadow: false }); B(farm, -22, z, 22, 8, y + 9, 1.6, '#7a2f26', { shadow: false }); B(farm, -22, z, 15, 6, y + 10.6, 1.6, '#7a2f26', { shadow: false }); B(farm, -22, z, 8, 4, y + 12.2, 1.4, '#7a2f26', { shadow: false }); B(farm, -22, z + 3.6, 5.5, 0.3, y, 6.4, '#fff4dc', { shadow: false });
    for (const x of [-37, -43.5]) { B(farm, x, z, 5, 5, y, 16, '#d7dde3', { shadow: false }); B(farm, x, z, 5.6, 5.6, y + 16, 1.2, '#8f9aa6', { shadow: false }); B(farm, x, z, 3.4, 3.4, y + 17.2, 1.2, '#8f9aa6', { shadow: false }); }
    B(farmOn, 16, z, 20, 7, y, 7.5, '#eef0f2', { shadow: false }); B(farmOn, 16, z + 3.6, 20, 0.3, y + 5.2, 1.3, '#4f8fd0', { shadow: false }); B(farmOn, 16, z, 21, 8, y + 7.5, 1.2, '#9aa5b1', { shadow: false }); B(farmOn, 11, z + 3.6, 6, 0.3, y, 4.6, '#5a6676', { shadow: false });
    s.shed = [16, y, z + 3.6]; s.coldPile = group(farmOn, 27.4, y, z + 3); for (let j = 0; j < 6; j++) mkCold(s.coldPile, (j % 3) * 2.6, Math.floor(j / 3) * 1.7, 0, 2.6); }
  const hv = group(farmOn, 16, stepH(5), stepZ(5) - 2.2); s.harvester = hv; B(hv, 0, 0, 6, 3.2, 0.8, 3.2, '#d2452f', { shadow: false }); B(hv, -1.2, 0, 2.6, 2.8, 4, 2.2, '#bfe3f2', { shadow: false, tex: 'pane' }); B(hv, 1.8, 0, 1, 1, 4, 2.6, '#8a2f22', { shadow: false }); B(hv, 0, 2.2, 11, 1.6, 0.2, 1.3, '#f2b21c', { shadow: false }); for (const x of [-2, 2]) B(hv, x, 0, 1.6, 3.6, 0, 1.8, '#2b2f3a', { shadow: false });
  // the lorry: plain and grey, so that it is never the prettiest thing in the picture. It is drawn larger while it is far away, so that it can be found
  const lorry = group(g); s.lorry = lorry; B(lorry, 0, -1.2, 2.8, 5.2, 0.7, 3, '#aeb6c0'); B(lorry, 0, 2.4, 2.7, 1.9, 0.7, 2.3, '#5f6b7a'); B(lorry, 0, 3.36, 2.2, 0.06, 1.8, 0.9, '#bfe3f2', { tex: 'pane' }); B(lorry, 0, -1.2, 2.84, 5.24, 2.2, 0.5, '#4f8fd0'); for (const [x, z] of [[-1.3, 2.2], [1.3, 2.2], [-1.3, -2.6], [1.3, -2.6]]) wheel(lorry, x, 0.55, z, 0.55, 0.4);
  const puffs = []; for (let j = 0; j < 18; j++) { const m = new THREE.MeshBasicMaterial({ color: '#57524f', transparent: true, opacity: 0, depthWrite: false }), p = blk(g, 0, 0, 1, 1, 0, 1, '', { mat: m, shadow: false }); p.visible = false; puffs.push({ p, m, t: 9 }); }
  let puffN = 0, puffT = 0; s.lorryAt = (z, on = true, back = false) => { lorry.rotation.y = back ? Math.PI : 0; const k = 1 + 1.7 * Math.min(1, Math.max(0, (-z - 24) / 90)); lorry.visible = on; lorry.position.set(0, s.roadY(z), z); lorry.scale.setScalar(k); lorry.rotation.x = z < -50 ? Math.atan2(39, 104) : 0; s.lorryPlate.pos.set(0, s.roadY(z) + 4.6 * k, z); };
  s.puff = () => { const q = puffs[puffN++ % puffs.length], k = lorry.scale.x; q.t = 0; q.k = k; q.p.visible = true; q.p.position.set((hash(puffN, 1) - 0.5) * 2.4 * k, lorry.position.y + 4.2 * k, lorry.position.z - 3 * k); };

  // ---- the town gate and the walls on either side of it ---------------------------------------------------------------------------------
  for (const sx of [-1, 1]) { texBox(g, sx * 5, -12, 1.5, 1.5, 0, 4.4, tileMat('pave', '#e2cfa6'), 1, 1); B(g, sx * 5, -12, 1.9, 1.9, 4.4, 0.4, '#b98f5a'); cap(g, sx * 5, -12, 1.9, 1.9, 4.8); blk(g, sx * 5, -12, 0.7, 0.7, 4.8, 0.8, '', { mat: new THREE.MeshBasicMaterial({ color: hot('#ffe9a8', 1.5) }), shadow: false });
    texBox(g, sx * 7.4, -12, 3.4, 0.8, 0, 1.3, tileMat('pave', '#e2cfa6'), 1, 1); }

  // ---- the homes on the left, and the town on both sides -----------------------------------------------------------------------------
  const home = (x, z, w, d, h, wall, roof, fl = 2) => { const p = group(g, x, 0, z); texBox(p, 0, 0, w, d, 0, h, wall === 'brick' ? null || tileMat('board', '#e8b98a') : tileMat('board', wall), 1.6, 0.8); for (let j = 0; j < 3; j++) texBox(p, 0, 0, w + 0.8 - j * (w * 0.3), d + 0.8 - j * 1.6, h + j * 0.9, 0.9, tileMat('tile', roof), 0.8, 0.8); cap(p, 0, 0, w * 0.4 + 0.2, d - 2.2, h + 2.7);
    for (let f = 0; f < fl; f++) for (let i = 0; i < Math.floor(w / 2.4); i++) B(p, -w / 2 + 1.3 + i * 2.4, d / 2 + 0.03, 1.1, 0.06, 0.9 + f * (h / fl), 1.3, '#bfe3f2', { tex: 'win', shadow: false }); return p; };
  home(-20.5, -19.5, 7, 6, 5.2, '#f3d9a4', '#d2553a'); home(-29.5, -15, 8, 7, 7.5, '#efc9a0', '#3f78b5', 3); home(-30.5, -3, 7, 10, 6.4, '#f6e2b5', '#2e9b5a'); home(-31, 9, 7, 9, 8, '#eec79b', '#d2553a', 3);
  home(27.5, -16, 8, 8, 8.6, '#f3d9a4', '#3f78b5', 3); home(31, -4, 7, 10, 6.6, '#efc9a0', '#d2553a'); home(31.5, 8, 7, 9, 8.2, '#f6e2b5', '#2e9b5a', 3);
  tree(g, -23, 0, -9.5, 1.25); tree(g, -24.5, 0, 2, 1.35); tree(g, 24.5, 0, 0.5, 1.3); tree(g, 23.5, 0, -8, 1.1); tree(g, 27, 0, -26, 1.6); tree(g, -26, 0, -25, 1.7);
  for (const x of [-21, 23.5]) { B(g, x, 5, 0.3, 0.3, 0, 3.6, '#2b2f3a'); B(g, x, 5, 1, 1, 3.6, 0.16, '#2b2f3a'); blk(g, x, 5, 0.7, 0.7, 3.1, 0.5, '', { mat: new THREE.MeshBasicMaterial({ color: hot('#ffe9a8', 1.3) }), shadow: false }); }

  // ---- the community gardens: eight raised beds between the homes --------------------------------------------------------------------
  const gardenOn = group(g), gardenOff = group(g); s.beds = [];
  [-9.4, -6.4].forEach((z, r) => [-18.6, -15.4, -12.2, -9].forEach((x, i) => { texBox(gardenOn, x, z, 2.8, 2, 0, 0.5, tileMat('board', '#c99a5e'), 0.7, 0.5); blk(gardenOn, x, z, 2.5, 1.7, 0.4, 0.14, '', { mat: soilM });
    const b = { x, y: 0.54, z, tall: r === 0, plant: null, pg: group(gardenOn, x, 0.54, z) }; b.mark = glowMarks(place(gardenOn, x, z, 2.7, 1.9, 0.56)); b.mark.visible = false; s.beds.push(b); }));
  B(gardenOn, -21.2, -8, 1.3, 1.3, 0, 1.7, '#3f78b5'); B(gardenOn, -21.2, -8, 1.45, 1.45, 1.7, 0.12, '#2a5a94'); B(gardenOn, -21.2, -7.3, 0.2, 0.3, 0.5, 0.2, '#e9ad1c'); s.barrel = [-21.2, 0, -8];
  for (let j = 0; j < 4; j++) { B(gardenOn, -18.6 + j * 3.2, -10.6, 0.1, 0.1, 0, 2.3, '#a8743f'); } B(gardenOn, -13.8, -10.6, 9.8, 0.08, 2.2, 0.08, '#a8743f');
  s.neighbours = [fig(gardenOn, -20, 0.06, -5.6, { k: 1.25, shirt: '#e0a23a', legs: '#4a556e', skin: SKIN[2], hair: '#d8d8d8', hat: '#f1e0a8', turn: 0.9, arms: ['fwd', 'down'] }), fig(gardenOn, -10.6, 0.06, -7.9, { k: 0.95, shirt: '#16a3a3', skin: SKIN[1], hair: HAIR[3], turn: -0.5, arms: ['down', 'fwd'] }), fig(gardenOn, -16.9, 0.06, -7.9, { k: 1.3, shirt: '#c98a5a', legs: '#2b3a55', skin: SKIN[3], hair: HAIR[4], long: true, turn: 0.3, arms: ['fwd', 'fwd'] })];
  // without the plan the corner is an ordinary corner of the square: two benches and a tree in a planter
  for (const x of [-17, -11]) { B(gardenOff, x, -8, 2.6, 0.7, 0.45, 0.14, '#b98f5a'); B(gardenOff, x, -8.3, 2.6, 0.12, 0.6, 0.6, '#b98f5a'); for (const dx of [-1.1, 1.1]) B(gardenOff, x + dx, -8, 0.14, 0.6, 0, 0.45, '#5a3d24'); } B(gardenOff, -14, -8, 2, 2, 0, 0.6, '#e2cfa6'); tree(gardenOff, -14, 0.5, -8, 0.9);
  // the handcart, pushed by a gardener
  const cart = group(g, -8.6, 0, -4.4); s.cart = cart; texBox(cart, 0, 0.5, 1.5, 1.9, 0.55, 0.42, tileMat('board', '#c99a5e'), 0.6, 0.4); for (const sx of [-1, 1]) { wheel(cart, sx * 0.86, 0.42, 0.6, 0.42); B(cart, sx * 0.6, -0.9, 0.08, 1, 0.9, 0.08, '#5a3d24'); }
  fig(cart, 0, 0.06, -1.25, { k: 1.25, shirt: '#2e9b5a', legs: '#4a556e', skin: SKIN[1], hair: HAIR[0], hat: '#f1e0a8', arms: ['push', 'push'] });
  s.cartLoad = { crates: [mkCrate(cart, 0, 0.97, 0.95, 0.95), mkCrate(cart, 0, 0.97, 0.15, 0.95)], basket: mkBasket(cart, 0, 0.97, 0.6) };

  // ---- the indoor farm: three floors of shelves behind an open front --------------------------------------------------------------------
  const DX = 2, ig = group(g, DX, 0, 0), inOn = group(ig), inOff = group(ig), X0 = 6.5, X1 = 20.5, ZF = -12, ZB = -19.5, FH = 3.4, XM = (X0 + X1) / 2, fy = (f) => f * FH + 0.3; s.fy = fy;
  B(ig, XM, (ZF + ZB) / 2, X1 - X0, ZF - ZB, 0, 0.3, '#e9e4dc'); const backM = new THREE.MeshLambertMaterial({ color: '#3a2d58' }); blk(ig, XM, ZB, X1 - X0 + 0.4, 0.4, 0, 3 * FH + 0.6, '', { mat: backM }); const poolM = soft('#ff7fe0', 0); blk(ig, XM, ZF + 2.2, X1 - X0 - 1, 4.4, 0.02, 0.04, '', { mat: poolM, shadow: false }); for (const x of [X0, X1]) { B(ig, x, (ZF + ZB) / 2, 0.4, ZF - ZB, 0, 3 * FH + 0.6, '#f6f3ee'); B(ig, x, ZF + 0.02, 0.6, 0.5, 0, 3 * FH + 0.6, '#ffffff'); }
  for (let f = 1; f <= 3; f++) B(ig, XM, (ZF + ZB) / 2, X1 - X0 + 0.5, ZF - ZB + 0.3, f * FH, 0.3, f === 3 ? '#f6f3ee' : '#e9e4dc'); B(ig, XM, (ZF + ZB) / 2, X1 - X0 + 1.2, ZF - ZB + 1, 3 * FH + 0.3, 0.5, '#2e9b5a'); cap(ig, XM, (ZF + ZB) / 2, X1 - X0 + 1.2, ZF - ZB + 1, 3 * FH + 0.8);
  B(ig, 18.1, (ZF + ZB) / 2 - 0.5, 0.2, ZF - ZB - 1.2, 0.3, 3 * FH, '#d9d2c6');                                // the wall of the lift shaft
  // shelves: three bays on each floor. The ground floor has low benches with tall room above them; the upper floors have high benches
  s.shelves = []; const pinkBars = [], pipeFill = []; s.pink = [];
  for (let f = 0; f < 3; f++) { const ty = fy(f) + (f === 0 ? 0.75 : 1.55);
    for (let b = 0; b < 3; b++) { const x = 9.9 + b * 2.8; B(inOn, x, -14.2, 2.5, 1.5, ty - 0.14, 0.14, '#ffffff'); blk(inOn, x, -14.2, 2.4, 1.3, ty - 0.62, 0.48, '', { mat: soft('#9fdcff', 0.33), shadow: false }); for (const dx of [-1.15, 1.15]) B(inOn, x + dx, -14.2, 0.12, 1.4, fy(f), ty - fy(f) - 0.14, '#b8c0c8');
      const sh = { x: x + DX, y: ty, z: -14.2, tall: f === 0, plant: null, pg: group(inOn, x, ty, -14.2), f }; sh.mark = glowMarks(frame(inOn, x, ty + 0.05, -13.3, 2.6, f === 0 ? 2.3 : 1.45, true, { fill: 0.3 })); sh.mark.visible = false; s.shelves.push(sh); }
    // the water pipe along the front of the trays: clear at first, and blue once the water runs (the blue grows from the left)
    B(inOn, 13.1, -13.4, 9.6, 0.16, ty - 0.5, 0.16, '#d6dde3'); const pg = group(inOn, 8.3, ty - 0.52, -13.38); blk(pg, 4.8, 0, 9.6, 0.2, 0, 0.2, '', { mat: new THREE.MeshBasicMaterial({ color: hot('#39a8ff', 1.25) }), shadow: false }); pg.scale.x = 0.001; pipeFill.push(pg);
    const bar = new THREE.MeshBasicMaterial({ color: '#6a5a78' }); blk(inOn, 13.1, -14.2, 9.4, 0.5, fy(f) + FH - 0.62, 0.16, '', { mat: bar, shadow: false }); B(inOn, 13.1, -14.2, 9.6, 0.7, fy(f) + FH - 0.46, 0.14, '#cfd6dc', { shadow: false }); pinkBars.push(bar); }
  { const riser = group(inOn, 8.3, 0.5, -13.38); blk(riser, 0, 0, 0.2, 0.2, 0, 1, '', { mat: new THREE.MeshBasicMaterial({ color: hot('#39a8ff', 1.25) }), shadow: false }).position.y = 0.5; riser.scale.y = 0.001; s.riser = riser; B(inOn, 8.3, -13.4, 0.16, 0.16, 0.5, fy(2) + 1.1, '#d6dde3'); }
  B(inOn, 7.5, -13.3, 1.3, 1.3, 0.3, 2.1, '#3f78b5'); B(inOn, 7.5, -13.3, 1.45, 1.45, 2.4, 0.14, '#2a5a94'); blk(inOn, 7.5, -12.6, 0.7, 0.1, 1.2, 0.7, '', { mat: GL('#ffd257'), shadow: false }); blk(inOn, 7.5, -12.52, 0.2, 0.1, 1.45, 0.2, '', { mat: GL('#1f2a44'), shadow: false }); s.tank = [7.5 + DX, 0.3, -12.8];
  B(inOn, 19.3, -12.3, 1, 0.3, 1.3, 1.2, '#cfd6dc'); const lever = blk(inOn, 19.3, -12.1, 0.3, 0.3, 1.5, 0.7, '', { mat: GL('#ffd257'), shadow: false }); s.lever = lever; s.switchAt = [19.3 + DX, 1.2, -12.2];
  const lift = group(inOn, 19.3, fy(1), -14.5); s.lift = lift; B(lift, 0, 0, 2, 2, 0, 0.14, '#ffd257'); for (const [dx, dz] of [[-0.95, -0.95], [0.95, -0.95]]) B(lift, dx, dz, 0.1, 0.1, 0, 2.6, '#e9ad1c'); B(lift, 0, -0.95, 2, 0.1, 2.6, 0.1, '#e9ad1c');
  s.grower = fig(lift, 0, 0.14, 0, { k: 1.2, shirt: '#ffffff', legs: '#3f78b5', skin: SKIN[2], hair: HAIR[3], cap: '#2e9b5a', arms: ['fwd', 'fwd'] }); s.liftCrate = mkCrate(lift, 0, 1.25, 0.75, 0.8); s.liftCrate.fill(0); s.liftCrate.visible = false;
  fig(inOn, 17.45, fy(2), -13.5, { k: 1.2, shirt: '#ffffff', legs: '#3f78b5', skin: SKIN[0], hair: HAIR[4], long: true, cap: '#2e9b5a', turn: -0.5, arms: ['fwd', 'down'] }); fig(inOn, 17.45, fy(0), -13.5, { k: 1.2, shirt: '#ffffff', legs: '#3f78b5', skin: SKIN[1], hair: HAIR[0], cap: '#2e9b5a', turn: -0.4, arms: ['fwd', 'down'] });
  // without the plan the building has an ordinary front of boards and windows
  { texBox(inOff, XM, ZF + 0.1, X1 - X0 + 0.2, 0.5, 0, 3 * FH + 0.3, tileMat('board', '#e8b98a'), 1.6, 0.8); for (let f = 0; f < 3; f++) for (let i = 0; i < 5; i++) if (f || i !== 2) B(inOff, X0 + 1.8 + i * 2.6, ZF + 0.38, 1.4, 0.06, fy(f) + 0.9, 1.6, '#bfe3f2', { tex: 'win', shadow: false }); B(inOff, XM, ZF + 0.38, 2, 0.08, 0, 2.6, '#3f78b5', { shadow: false }); }
  // The growing lights are glowing bars. Their light on the back wall and on the paving in front is painted, not worked out lamp by lamp, which keeps the picture quick to draw
  s.lights = (k) => { pinkBars.forEach((m) => m.color.set('#6a5a78').lerp(hot('#ff5fd0', 2.4), k)); backM.color.set('#3a2d58').lerp(new THREE.Color('#8a3f9e'), k); backM.emissive.set('#ff5fd0').multiplyScalar(0.13 * k); poolM.opacity = 0.2 * k; s.lightsOn = k; };
  s.water = (k) => { s.riser.scale.y = Math.max(0.001, Math.min(1, k * 2.5) * (fy(2) + 1.1)); pipeFill.forEach((p, f) => { p.scale.x = Math.max(0.001, Math.min(1, Math.max(0, k * 2.5 - 0.4 - f * 0.5))); }); };
  // the cargo bike: a box on two wheels in front, and a rider
  const bike = group(g, 7.6, 0, -9.6); s.bike = bike; texBox(bike, 0, 0.9, 1.2, 1.3, 0.4, 0.5, tileMat('board', '#c99a5e'), 0.6, 0.4); for (const sx of [-1, 1]) wheel(bike, sx * 0.7, 0.42, 0.9, 0.42); wheel(bike, 0, 0.42, -1.2, 0.42); B(bike, 0, -0.2, 0.14, 1.9, 0.5, 0.14, '#16a3a3'); B(bike, 0, -0.7, 0.14, 0.14, 0.5, 0.6, '#16a3a3'); B(bike, 0, -0.75, 0.4, 0.5, 1.08, 0.1, '#2b2f3a'); B(bike, 0, 0.2, 1, 0.1, 1.25, 0.1, '#2b2f3a');
  fig(bike, 0, 0.72, -0.75, { k: 1.15, shirt: '#16a3a3', legs: '#2b3a55', skin: SKIN[2], hair: HAIR[3], cap: '#ffd257', sit: true, arms: ['fwd', 'fwd'] }); s.bikeLoad = [mkCrate(bike, 0, 0.9, 0.9, 1), mkCrate(bike, 0, 1.3, 0.9, 0.9)];

  // ---- the three market stalls: each has a summer side with a sun and a winter side with a snowflake --------------------------------
  s.stalls = STALLX.map((x) => { const st = group(g, x, 0, STALLZ), q = { g: st, x, sides: [] }; texBox(st, 0, 0, 5.3, 1.7, 0.88, 0.14, tileMat('board', '#d9b684'), 0.8, 0.5); for (const dx of [-2.4, 2.4]) for (const dz of [-0.7, 0.7]) B(st, dx, dz, 0.16, 0.16, 0, 0.88, '#8a6238');
    B(st, -1.33, 0.86, 2.62, 0.06, 0.04, 0.84, '#ffd257'); B(st, 1.33, 0.86, 2.62, 0.06, 0.04, 0.84, '#cfe6f8');
    blk(st, -1.33, 0.9, 0.36, 0.04, 0.3, 0.36, '', { mat: GL('#f08a2a'), shadow: false }); for (const [dx, dy] of [[-0.42, 0], [0.42, 0], [0, 0.4], [0, -0.4]]) blk(st, -1.33 + dx, 0.9, dy ? 0.1 : 0.2, 0.04, 0.48 - (dy ? 0.1 : 0.05) + dy * 0.75, dy ? 0.2 : 0.1, '', { mat: GL('#f08a2a'), shadow: false });
    for (const [w, h, r] of [[0.62, 0.09, 0], [0.09, 0.62, 0], [0.5, 0.08, 0.785], [0.5, 0.08, -0.785]]) { const m = blk(st, 1.33, 0.9, w, 0.04, 0.48 - h / 2, h, '', { mat: GL('#3f78b5'), shadow: false }); m.rotation.z = r; }
    for (const side of [0, 1]) { const cx = side ? 1.33 : -1.33, crates = [-0.82, 0, 0.82].map((dx) => mkCrate(st, cx + dx, 1.02, 0)), colds = [-0.82, 0, 0.82].map((dx) => mkCold(st, cx + dx, 1.02, 0)), basket = mkBasket(st, cx, 1.02, 0); basket.scale.setScalar(1.7); q.sides.push({ crates, colds, basket }); }
    // set(side, kind, colours) puts three crates, three cold boxes, one small basket or nothing on a side of the stall. It gives back what was put there, so that it can pop
    q.set = (side, kind, cols) => { const o = q.sides[side]; o.crates.forEach((c) => { c.visible = kind === 'crate'; if (cols) c.fill(6, cols); }); o.colds.forEach((c) => { c.visible = kind === 'cold'; }); o.basket.visible = kind === 'basket'; return kind === 'crate' ? o.crates : kind === 'cold' ? o.colds : kind === 'basket' ? [o.basket] : []; };
    q.set(0, null); q.set(1, null); return q; });
  // the people who carry the cold boxes from the lorry
  s.carriers = [0, 1].map((i) => { const c = group(g, i ? 1.2 : -1.2, 0, -15); fig(c, 0, 0.06, 0, { k: 1.25, shirt: '#7f8b99', legs: '#2b3a55', skin: SKIN[i ? 0 : 2], hair: HAIR[i ? 1 : 3], cap: '#4f8fd0', arms: ['fwd', 'fwd'] }); mkCold(c, 0, 1.15, 0.62, 0.9); c.visible = false; return c; });
  // the family stand behind the stalls and look at the food, with their faces to the child
  s.family = group(g, 3.6, 0, 8.7); fig(s.family, 0, 0.06, 0, { ...FAMILY[0], pack: '#ffd257', arms: ['up', 'down'] }); fig(s.family, -1.5, 0.06, -0.5, { ...FAMILY[1], turn: 0.25, arms: ['down', 'fwd'] }); fig(s.family, 1.4, 0.06, -0.6, { ...FAMILY[2], turn: -0.3 });
  // a few other people in the square
  s.walkers = [[-3.5, -6, 0.6, 0], [4.5, -3.5, -2.4, 2], [-14, 4, 1.2, 4]].map(([x, z, t, i]) => fig(g, x, 0.06, z, { k: 1.2, shirt: SHIRTS[i], legs: '#4a556e', skin: SKIN[i % 4], hair: HAIR[(i + 1) % 5], turn: t, bag: '#e0a23a', step: 0.12 }));

  // ---- snow in the air ------------------------------------------------------------------------------------------------------------------
  const flakes = group(g), FL = []; for (let j = 0; j < 170; j++) { const f = blk(flakes, 0, 0, 0.14, 0.14, 0, 0.14, '', { mat: GL('#ffffff'), shadow: false }); FL.push({ f, x: (hash(j, 1) - 0.5) * 70, z: -18 + hash(j, 2) * 42, y: hash(j, 3) * 18, v: 1.2 + hash(j, 4) * 1.4 }); } flakes.visible = false;

  // ---- which plans stand in the town, and the season -----------------------------------------------------------------------------------
  // show([gardens, big farm, indoor farm]) says which of the three plans is in the town; the others go back to an ordinary corner, pasture and an ordinary building
  s.shown = [false, false, false];
  s.show = (on) => { s.shown = [...on]; gardenOn.visible = on[0]; gardenOff.visible = !on[0]; cart.visible = on[0]; farmOn.visible = on[1]; s.fields.forEach((f) => { f.g.visible = on[1] && f.sown; }); if (!on[1]) { lorry.visible = false; s.lorryPlate.hide = true; } inOn.visible = on[2]; inOff.visible = !on[2]; bike.visible = on[2]; s.lights(on[2] ? (s.lightsOn || 1) : 0); };
  s.parts = { gardenOn, gardenOff, farmOn, inOn, inOff };
  s.lorryPlate = plate(s, 'The lorry', [0, 0, 0]); s.lorryPlate.hide = true;
  const fogC = new THREE.Color(), sunC = [C('#ffe7c2'), C('#ffd49a'), C('#e4ecff')], evC = C('#ffb070');
  // season(a, w): a is how far into autumn the year is and w how far into winter (each from 0 to 1). evening darkens a summer day
  s.season = (a, w, evening = 0) => { s.a = a; s.w = w; for (const q of seasonal) q.m.color.copy(q.c[0]).lerp(q.c[1], a).lerp(q.c[2], w);
    const air = evening ? drawSky(evening, 0, [SKY[0], EVENING, EVENING]) : drawSky(a, w, SKY); s.scene.fog.color.copy(air); s.sun.color.copy(sunC[0]).lerp(sunC[1], a).lerp(sunC[2], w).lerp(evC, evening); s.sun.intensity = 3.2 - 0.3 * a - 1.2 * w - 1.9 * evening; s.hemi.intensity = 1.4 + 0.15 * w - 0.55 * evening;
    snowCaps.forEach((c) => { c.visible = w > 0.02; c.scale.y = Math.max(0.01, 0.3 * w); c.position.y = c.userData.y + 0.15 * w; }); flakes.visible = w > 0.04;
    s.beds.forEach((b) => { if (b.plant) b.plant.g.scale.setScalar(Math.max(0.02, 1 - w)); }); s.neighbours.forEach((n, i) => { n.visible = w < 0.5 || i === 0; }); };
  s.flakes = (dt) => { if (!flakes.visible) return; for (const q of FL) { q.y -= q.v * dt; if (q.y < 0) q.y += 18; q.f.position.set(q.x + Math.sin(q.y + q.z) * 0.4, q.y, q.z); q.f.visible = Math.hypot(q.x - s.eye[0], q.y - s.eye[1], q.z - s.eye[2]) > 5; } };   /* a flake right in front of the camera would look like a white block */
  s.puffs = (dt) => { for (const q of puffs) { if (q.t > 5) { q.p.visible = false; continue; } q.t += dt; const k = q.k * (1.3 + q.t * 1.1); q.p.scale.set(k, k, k); q.p.position.y += dt * 0.6 * q.k; q.m.opacity = 0.78 * Math.max(0, 1 - q.t / 5); } };
  s.mkCrate = mkCrate; s.tree = tree; return s; }
