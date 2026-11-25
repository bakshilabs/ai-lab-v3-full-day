// Eco Town on the Six Towns World Map (map.js is the film's copy of games/ecotown/game/tests/visual/worldmap.js).
// The town starts as empty land on the map and grows through the six levels. The layout, sizes and colours follow
// docs/redesign/design/art-direction.md, and the way things arrive follows docs/redesign/design/motion.md.
// makeIsland() returns update(S). S.done is the number of finished levels. S.build is the number of seconds since the
// next level began to be built (below 0 when nothing is being built). S.t is the time in seconds, and S.night is 0 by
// day and 1 after dark. The other fields of S are described where update is defined. Nothing is kept between frames.
import { THREE, PAL, blk, group, person, place, glow, clamp, ease, span, lerp, hash } from './vox.js';
import * as MAP from './map.js';
import { drop, layTile, dust as dustAt, hop, hopSquash, springAt, SPRING, ring } from '../design/motion-curves.js';

export const TOP = 2; // the height of the far hill where the town stands
const wob = (x, z) => Math.sin(x * 0.63 + z * 0.31) * 0.05 + Math.sin(z * 0.87 - x * 0.41) * 0.05;
export const inside = (x, z, s = 1) => (x / (15 * s)) ** 2 + (z / (11 * s)) ** 2 + wob(x, z) < 1;
// the height of the ground, with the stair that climbs the cliff at x = 3
export const heightAt = (x, z) => (x >= 13.6 ? 1 : x >= 4 ? TOP : x >= 3 && z >= -1 && z < 1 ? 1 : 0);
export const YAW = -1.2, TILT = 0.95; // the camera stands above the river and looks towards the hill
export const VIEWS = [ // where the camera looks in each level: [x, y, z, distance]
  [3, 1, -0.5, 46], [8, 2, 0.5, 32], [8.5, 2, 0, 30], [5.5, 1, 0.5, 36], [3.5, 1, -1.5, 40], [7, 2, 2, 34], [5, 1, -3.5, 34], [3.5, 1, -0.5, 46],
];
// the map's own scene, with a sky that can turn to night: n is 0 in daylight and 1 after dark, and the sky passes
// through a warm peach on the way. dim is 0 to 1 under a rain cloud.
// The map draws its ground as about ten thousand copies of one box. The software renderer that records the film draws
// such copies very slowly, so the ground is turned once into a single fixed shape with the same boxes and colours.
function bakeGround() {
  let big = null; MAP.scene.traverse((o) => { if (o.isInstancedMesh && o.instanceColor && (!big || o.count > big.count)) big = o; }); if (!big || big.count < 2000) return;
  const src = big.geometry, P = src.attributes.position, Nn = src.attributes.normal, I = src.index, n = big.count, m = new THREE.Matrix4(), v = new THREE.Vector3(), c = new THREE.Color(), p0 = new THREE.Vector3(), q0 = new THREE.Quaternion(), s0 = new THREE.Vector3();
  // the top of the highest box in each column, so that the faces nobody can see (undersides, and sides against a neighbour) are left out
  const key = (x, z) => `${Math.round(x * 2)},${Math.round(z * 2)}`, tops = new Map(), boxes = [];
  for (let k = 0; k < n; k++) { big.getMatrixAt(k, m); m.decompose(p0, q0, s0); const top = p0.y + s0.y / 2, kk = key(p0.x, p0.z); boxes.push([p0.x, p0.z, s0.x, s0.z, top]); tops.set(kk, Math.max(tops.get(kk) ?? -99, top)); }
  const pos = [], nor = [], col = [], idx = [], DIR = [[1, 0], [-1, 0], null, null, [0, 1], [0, -1]];
  for (let k = 0; k < n; k++) { const [bx, bz, sx, sz, top] = boxes[k]; big.getMatrixAt(k, m); big.getColorAt(k, c);
    for (let f = 0; f < 6; f++) { if (f === 3) continue; if (f !== 2) { const d = DIR[f], nt = tops.get(key(bx + d[0] * sx, bz + d[1] * sz)); if (nt !== undefined && nt >= top - 0.01) continue; }
      const base = pos.length / 3; for (let j = 0; j < 4; j++) { const vi = f * 4 + j; v.fromBufferAttribute(P, vi).applyMatrix4(m); pos.push(v.x, v.y, v.z); nor.push(Nn.getX(vi), Nn.getY(vi), Nn.getZ(vi)); col.push(c.r, c.g, c.b); }
      for (let j = 0; j < 6; j++) idx.push(base + I.getX(f * 6 + j) - f * 4); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
  const mat = big.material.clone(); mat.vertexColors = true; const mesh = new THREE.Mesh(g, mat); mesh.castShadow = big.castShadow; mesh.receiveShadow = big.receiveShadow; mesh.position.copy(big.position); big.parent.add(mesh); big.parent.remove(big);
}
export function makeScene() {
  bakeGround();
  const day = new THREE.Color('#dff1f7'), dark = new THREE.Color('#1c2647'), peach = new THREE.Color('#f6c9a0'), grey = new THREE.Color('#b9c6d2'), hd = new THREE.Color('#fff6e8'), hn = new THREE.Color('#7f95d6'), sd = new THREE.Color('#fff0d0'), sn = new THREE.Color('#9fb4ff'), sw = new THREE.Color('#ffb070');
  MAP.scene.background = day.clone();
  return { scene: MAP.scene, light(n, dim = 0) { const w = Math.sin(clamp(n) * Math.PI) * 0.8; MAP.hemi.intensity = lerp(1.55, 0.62, n) * (1 - dim * 0.3); MAP.sun.intensity = lerp(2.1, 0.5, n) * (1 - dim * 0.45); MAP.hemi.color.copy(hd).lerp(hn, n); MAP.sun.color.copy(sd).lerp(sn, n).lerp(sw, w * 0.6); MAP.scene.background.copy(day).lerp(dark, n).lerp(peach, w * 0.7).lerp(grey, dim * 0.55); } };
}

export const CLOTHES = ['#e0503a', '#3f78b5', '#ffd257', '#8a5fc2', '#2e9b5a', '#16a3a3'];
export const walker = (root, c, k = 0.82) => { const g = person(root, c); g.children.forEach((m) => { m.scale.multiplyScalar(k); m.position.y *= k; }); return g; };
// where things stand (art-direction.md, section 3)
export const SPOTS = [[5.95, -3, 1], [11.05, -3, 1], [5.95, 4, -1], [11.05, 4, -1], [8, -3, 1], [8, 4, -1]]; // the six homes: x, z and which way the door faces
export const FARMS = [[0.3, -1.3], [2.7, -1.3]], STALL = [5.7, 1.6], MILL = [1.5, 2.6], SCHOOL = [6.2, -7.1], BATTERY = [4.9, 6.8], TURBINES = [[6.6, 7.2], [9.3, 6.8]];
export const PARK_TREES = [[6.2, -1.2], [8.2, -1.3], [10.8, -1.2], [7.7, 1.8], [10.9, 1.9]];
export const CARTWAY = [[1.2, -3.2], [1.6, -0.5], [3.5, -0.5], [4.5, -0.5], [4.5, 1.6], [5, 1.6]];
// halfway to white: the colour of a plan that is only being tried
const C0 = new THREE.Color(), CW = new THREE.Color('#ffffff');
export const pale = (h) => '#' + C0.set(h).lerp(CW, 0.55).getHexString();

// The building kit. tint changes every colour (the town uses its true colours, and a plan that is only being tried is pale).
export function makeKit(root, tint = (c) => c) {
  const box = (p, w, h, d, x, y, z, c, sh) => MAP.box(p, w, h, d, x, y, z, tint(c), sh), B = (p, x, z, w, d, y, h, c, o) => blk(p, x, z, w, d, y, h, tint(c), o);
  return {
    // a home at the map's own size: 1.9 wide, walls 1.45 high, a roof of four steps. face is +1 when the door looks south.
    home(x, z, y, wall, face, roofCol) {
      const g = group(root, x, y, z), body = group(g); box(body, 1.9, 1.45, 1.9, 0, 0.725, 0, wall);
      MAP.stepRoof(body, 1.9, 1.9, 1.45, tint(roofCol), tint(wall), { tiles: true });
      if (wall === PAL.timber) for (const yy of [0.5, 1.0]) box(body, 1.94, 0.07, 1.94, 0, yy, 0, '#a9743f', false);
      box(body, 0.42, 0.75, 0.06, 0.4, 0.38, 0.97 * face, PAL.trunk, false); MAP.bake(body);
      const wm = glow(tint('#9fd0f5')); g.wm = wm; g.pools = [];
      for (const [wx, wz, w, d] of [[-0.42, 0.97 * face, 0.5, 0.06], [-0.97, 0.3, 0.06, 0.5], [-0.97, -0.45, 0.06, 0.5], [0.3, -0.97 * face, 0.5, 0.06]]) blk(g, wx, wz, w, d, 0.62, 0.45, '#9fd0f5', { shadow: false, mat: wm });
      for (const [px, pz] of [[0.4, 1.55 * face], [-1.55, 0]]) { const pm = new THREE.MeshBasicMaterial({ color: '#e8b84a', transparent: true, opacity: 0 }); g.pools.push(pm); blk(g, px, pz, 1.1, 0.9, 0.02, 0.02, '#e8b84a', { shadow: false, mat: pm }); }
      return g;
    },
    // the market stall: the only striped thing in the town. g.awning opens when the shops open.
    stall(x, y, z) {
      const g = group(root, x, y, z); B(g, 0, 0, 1.2, 1.9, 0, 0.55, PAL.timber); for (const dz of [-0.9, 0.9]) B(g, -0.55, dz, 0.1, 0.1, 0, 1.3, PAL.trunk);
      g.awning = group(g, 0, 1.3, 0); for (let k = 0; k < 5; k++) B(g.awning, 0, -0.84 + k * 0.42, 1.5, 0.42, 0, 0.14, k % 2 ? PAL.white : PAL.roof[0]); return g;
    },
    // the sawmill: the only dark timber roof. g.saw turns while the mill works.
    sawmill(x, y, z) {
      const g = group(root, x, y, z); B(g, 0, 0, 2.8, 1.8, 0, 1.2, PAL.timber); B(g, 0, 0, 3.1, 2.1, 1.2, 0.2, '#8a5a34'); B(g, 0, 0, 3.1, 1.3, 1.4, 0.2, '#8a5a34'); B(g, 0, 0.92, 0.9, 0.06, 0, 0.85, PAL.trunk, { shadow: false });
      for (let k = 0; k < 3; k++) B(g, -0.5 + k * 0.5, 1.9, 0.4, 1.6, 0, 0.4, '#a9743f'); for (let k = 0; k < 2; k++) B(g, -0.25 + k * 0.5, 1.9, 0.4, 1.6, 0.4, 0.4, '#b9824a');
      B(g, -1.9, 0, 0.7, 1.2, 0, 0.5, PAL.timber); g.saw = group(g, -1.9, 0.75, 0); for (let k = 0; k < 2; k++) { const b = B(g.saw, 0, 0, 0.08, 0.9, -0.45, 0.9, '#c9d2da', { shadow: false }); b.rotation.x = k * Math.PI / 4; } return g;
    },
    school(x, y, z) {
      const g = group(root, x, y, z); g.bell = B(g, -1, 0, 0.42, 0.42, 2.3, 0.5, PAL.sun, tint === pale ? {} : { mat: glow('#ffd257') });
      const b = group(g); box(b, 3.2, 1.5, 1.9, 0, 0.75, 0, '#ffd76a'); MAP.stepRoof(b, 1.9, 3.2, 1.5, tint(PAL.roof[0]), tint('#ffd76a'), { tiles: true }); b.rotation.y = Math.PI / 2;
      B(g, -1, 0, 0.7, 0.7, 1.5, 0.8, '#ffd76a'); B(g, 0, 0.97, 0.6, 0.06, 0, 0.85, PAL.trunk, { shadow: false }); for (const dx of [-1, 1]) B(g, dx, 0.97, 0.5, 0.06, 0.62, 0.45, PAL.glass, { shadow: false });
      B(g, 1.9, 0.6, 0.08, 0.08, 0, 2.7, PAL.white); g.flag = B(g, 2.25, 0.6, 0.6, 0.05, 2.2, 0.42, '#ffd257', { shadow: false }); return g;
    },
    turbine(x, y, z) {
      const g = group(root, x, y, z); B(g, 0, 0, 0.6, 0.6, 0, 0.3, PAL.navy); B(g, 0, 0, 0.36, 0.36, 0.3, 3.75, PAL.white);
      const hub = group(g, -0.3, 4.05, 0); hub.rotation.y = Math.PI / 2; B(hub, 0, 0, 0.5, 0.36, -0.25, 0.5, PAL.white); for (let i = 0; i < 3; i++) { const b = group(hub); b.rotation.z = i * Math.PI * 2 / 3; B(b, 0, 0, 0.28, 0.1, 0.15, 1.6, PAL.white); } g.hub = hub; return g;
    },
    // the battery: the only white box. Three green bars on the side that faces the camera show how full it is.
    battery(x, y, z) {
      const g = group(root, x, y, z); B(g, 0, 0, 1.1, 1.7, 0, 1.3, PAL.white); B(g, 0, 0, 1.2, 1.8, 1.3, 0.14, '#5aa35a');
      g.bars = [0, 1, 2].map((k) => { const m = glow('#7dffa8'); const b = blk(g, -0.57, 0, 0.05, 1.3, 0.18 + k * 0.37, 0.28, '#7dffa8', { shadow: false, mat: m }); b.userData.m = m; return b; }); return g;
    },
    solar(home) { const s = B(home, -0.52, 0, 0.72, 1.3, 1.9, 0.07, PAL.solar); s.rotation.z = Math.PI / 4; return s; },
    tile(x, z, c, y = TOP, h = 0.06) { return B(root, x + 0.5, z + 0.5, 1, 1, y, h, c, { shadow: false }); },
    tree(x, z, y) { const g = MAP.tree(x, z, false, 1); g.position.y = y; return g; },
    car(c) { const g0 = group(root), g = group(g0); B(g, 0, 0, 1.25, 0.7, 0.12, 0.34, c); B(g, -0.05, 0, 0.66, 0.6, 0.46, 0.3, PAL.glass); for (const [x, z] of [[-0.4, 0.36], [0.4, 0.36], [-0.4, -0.36], [0.4, -0.36]]) blk(g, x, z, 0.28, 0.1, 0, 0.28, '#2a2a2a', { shadow: false }); return g0; },
    cart() { const g = group(root); B(g, 0, 0, 1.1, 0.7, 0.22, 0.32, PAL.timber); g.load = [['#e0503a', -0.28], ['#4f9550', 0.02], ['#e2c04a', 0.3]].map(([c, x]) => blk(g, x, 0, 0.24, 0.5, 0.54, 0.24, c)); for (const [x, z] of [[-0.32, 0.38], [0.32, 0.38], [-0.32, -0.38], [0.32, -0.38]]) blk(g, x, z, 0.3, 0.08, 0, 0.3, '#2a2a2a', { shadow: false }); const f = walker(g, CLOTHES[1]); f.position.set(0.85, 0, 0); return g; },
  };
}

export function makeIsland() {
  const root = MAP.world, kit = makeKit(root);
  // the map's sample homes, its ring cars and the trees that stand where the child's town will be make way
  MAP.ecoHomes.forEach((g) => { g.visible = false; }); const ringCars = MAP.cars.slice(0, 2), outCars = MAP.cars.slice(5);
  for (const [x, z, g] of MAP.ecoTrees) if (g && (x > 3.4 || (x > -2.6 && x < 3.6 && z < -2.8) || (x > -0.5 && x < 3 && z > 1 && z < 5))) g.visible = false;

  // ---- what each level adds. A part begins to arrive d seconds into the building of its level. ----------------------
  // kind 'drop' lands with weight and dust, 'tile' is laid flat, and 'pop' springs up (plants and small things).
  const parts = [[], [], [], [], [], [], []], add = (lv, o, d, kind = 'drop') => { parts[lv].push({ o, d, kind, s: o.scale.clone(), y: o.position.y }); return o; };
  const tile = (lv, x, z, c, d, y = TOP, h = 0.06) => add(lv, kit.tile(x, z, c, y, h), d, 'tile');
  // level 1: four homes on the far hill. The gaps between them shorten like a drum roll.
  const firstHomes = SPOTS.slice(0, 4).map(([x, z, f], k) => { const h = kit.home(x, z, TOP, PAL.wall[k % 3], f, PAL.roof[k % 3]); h.k = k; return add(1, h, [0.3, 0.95, 1.5, 1.95][k]); });
  // the wild trees of the hilltop stand there from the start; level 2 keeps them as the trees of the park
  const parkTrees = PARK_TREES.map(([x, z]) => { const g = kit.tree(x, z, TOP); g.stump = blk(root, x, z, 0.3, 0.3, TOP, 0.25, PAL.trunk); return g; });
  // level 2: the road around the outside, the park in the middle with a cross of paths, the stair and the shops
  for (let x = 4; x <= 12; x++) for (const z of [-5, 5]) tile(2, x, z, PAL.road, 0.1 + (x - 4) * 0.045);
  for (let z = -4; z <= 4; z++) for (const x of [4, 12]) tile(2, x, z, PAL.road, 0.55 + (z + 4) * 0.045);
  for (let x = 5; x <= 11; x++) for (let z = -2; z <= 2; z++) tile(2, x, z, x === 9 || z === 0 ? PAL.sand : PAL.grassDeep, 1.3 + (x - 5) * 0.13 + (z + 2) * 0.04, TOP, x === 9 || z === 0 ? 0.07 : 0.05);
  for (const z of [-4, -3, 3, 4]) tile(2, 9, z, PAL.sand, 2.3 + Math.abs(z) * 0.06, TOP, 0.07);
  for (const z of [-1, 0]) add(2, blk(root, 3.5, z + 0.5, 1, 1, 0, 1, PAL.sand), 1.0 + (z + 1) * 0.3);
  for (const z of [-2.4, 0.4, 3.2]) { const g = MAP.tree(13.5, z, false, 1); if (g) add(2, g, 2.9 + z * 0.05, 'pop'); }
  const stall = kit.stall(STALL[0], TOP, STALL[1]); add(2, stall, 3.4);
  // level 3: the first homes are clad in timber, two more homes rise, and a sawmill stands on the low land
  const timberHomes = SPOTS.map(([x, z, f], k) => { const h = kit.home(x, z, TOP, PAL.timber, f, PAL.roof[k % 3]); h.k = k; if (k >= 4) add(3, h, 2.6 + (k - 4) * 0.6); return h; });
  const mill = kit.sawmill(MILL[0], 0, MILL[1]); add(3, mill, 0.3);
  // level 4: farms on open land under the hill, two farm houses, produce on the stall, and the meadow in bloom
  for (let x = -2; x <= 3; x++) for (let z = -8; z <= -3; z++) if (inside(x + 0.5, z + 0.5, 0.95)) { tile(4, x, z, z & 1 ? PAL.soil : PAL.soilDark, 0.1 + (x + 2) * 0.2 + (z + 8) * 0.03, 0); add(4, blk(root, x + 0.5, z + 0.5, 0.5, 0.5, 0.06, 0.34, ['#7cc04a', '#e2c04a', '#4f9550'][(x + z + 20) % 3]), 1.3 + (x + 2) * 0.2 + hash(x, z) * 0.4, 'pop'); }
  const farmHomes = FARMS.map(([x, z], k) => { const h = kit.home(x, z, 0, PAL.wall[k], 1, PAL.roof[k + 1]); h.k = 6 + k; return add(4, h, 2.8 + k * 0.5); });
  [['#e0503a', -0.5], ['#4f9550', 0], ['#e2c04a', 0.5]].forEach(([c, dz], k) => add(4, blk(stall, 0, dz, 0.9, 0.36, 0.55, 0.26, c), 4.0 + k * 0.12, 'pop'));
  const FLOWER = ['#f08ab8', '#ffd257', '#ffffff', '#c98be0'], flowers = [];
  for (let k = 0; k < 90; k++) { const x = 0.3 + hash(k, 1) * 3.5, z = 5.4 + hash(k, 2) * 3.6; if (!inside(x, z, 0.95) || Math.abs(x - MAP.riverX(z)) < 2.1) continue; const f = blk(root, x, z, 0.26, 0.26, 0, 0.36, FLOWER[k % 4], { shadow: false }); f.early = k < 26; flowers.push(f); if (!f.early) add(4, f, 1.6 + hash(k, 3) * 2.4, 'pop'); }
  // bees live in the meadow. They are drawn large, because they are signs and not models.
  const beeMat = glow('#ffcf2e'), bees = [...Array(8)].map(() => { const g = group(root); blk(g, 0, 0, 0.34, 0.26, 0, 0.26, '#ffcf2e', { shadow: false, mat: beeMat }); blk(g, 0.02, 0, 0.1, 0.27, 0, 0.27, '#2a2a2a', { shadow: false }); blk(g, 0, 0, 0.2, 0.5, 0.24, 0.05, '#ffffff', { shadow: false }); return g; });
  const cart = kit.cart();
  // level 5: two turbines and a battery at the south end of the hill, and solar panels on the roofs
  for (let x = 5; x <= 10; x++) for (const z of [6, 7]) if (inside(x + 0.5, z + 0.5, 0.97)) tile(5, x, z, PAL.grassDeep, 0.1 + (x - 5) * 0.1, TOP, 0.05);
  const turbs = TURBINES.map(([x, z], k) => add(5, kit.turbine(x, TOP, z), 0.9 + k * 0.7));
  timberHomes.forEach((h, k) => add(5, kit.solar(h), 2.6 + k * 0.22, 'pop'));
  const battery = add(5, kit.battery(BATTERY[0], TOP, BATTERY[1]), 2.1);
  // level 6: the school on the corner above the farm, the one yellow building in the town
  const school = add(6, kit.school(SCHOOL[0], TOP, SCHOOL[1]), 0.4);
  const homes = [...timberHomes, ...farmHomes, ...firstHomes];
  // when the building of each level has finished arriving, in seconds
  const ARRIVE = { drop: 0.82, tile: 0.22, pop: 0.4 };
  parts.forEach((list) => { list.end = Math.max(0, ...list.map((p) => p.d + ARRIVE[p.kind])); });
  parts[3].end = Math.max(parts[3].end, 2.6);

  // the children of the town and of the farms, who walk to school; the first is the child in the yellow coat
  const ROADW = 4.5, GATE = [6.2, -5.9], kids = [
    ...SPOTS.map(([x, z, f]) => [[x + 0.4, z + 1.3 * f], [x + 0.4, f > 0 ? -1.4 : 3], [ROADW, f > 0 ? -1.4 : 3], [ROADW, -5.5]]),
    ...FARMS.map(([x, z]) => [[x + 0.4, z + 1.3], [3.2, -0.5], [ROADW, -0.5], [ROADW, -5.5]]),
  ].map((pts, k) => { pts.push([GATE[0] - 1.4 + k * 0.42, -5.5], [GATE[0] - 1.4 + k * 0.42, GATE[1]]); let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return { o: walker(root, k === 0 ? '#ffd257' : CLOTHES[(k + 3) % 6 === 2 ? 0 : (k + 3) % 6]), pts, len, d: k * 0.12 }; });
  // people who stroll on the cross of paths once it is there
  const strollers = [[[5.5, 0.5], [11.5, 0.5]], [[9.5, -3.5], [9.5, 3.5]], [[5.5, 0.5], [9.5, 0.5], [9.5, 3.5]]].map((pts, k) => ({ o: walker(root, CLOTHES[[3, 4, 5][k]]), pts }));
  // the child in the yellow coat and a parent, for the moments between the levels
  const coat = walker(root, '#ffd257', 0.74), parent = walker(root, CLOTHES[0], 0.92);
  const dust = [...Array(48)].map(() => blk(root, 0, 0, 0.28, 0.28, 0, 0.28, '#f6ecd8', { shadow: false, mat: glow('#fff6e4') }));

  const onC = new THREE.Color('#ffd257'), dayC = new THREE.Color('#9fd0f5'), offC = new THREE.Color('#2b3350'), w = new THREE.Vector3();
  // S: done, build, t and night as above, and these, which all have defaults:
  //   lights(k): how bright the windows of home k are, 0 to 1 (homes 0 to 5 on the hill, 6 and 7 at the farm)
  //   treeCut: 0 to 1, how far the trees of the hilltop have been cut (all but the first); treeHop: seconds since they hopped
  //   meadowLost: 0 to 1, how far the meadow has been covered; meadowHop: seconds since the flowers hopped
  //   bees: 0 or 1; beesAway: 0 to 1, how far the bees have flown up and away
  //   cart: how far the food cart is along its way, 0 to 1, or -1 to hide it; kids: seconds since the children set off for school, or -1
  //   stroll: whether people stroll in the park; bell: seconds since the school bell rang; coat and parent: [x, z, turn, walking] or null
  //   batt: how many bars of the battery are lit (0 to 3); wind: how fast the turbines turn (1 is usual); world: the whole map is in view
  function update(S) {
    const { done, build = -1, t, night = 0 } = S, lit = S.lights || (() => 1);
    MAP.animate(t + 8); ringCars.forEach((c) => { c.g.visible = false; }); outCars.forEach((c) => { c.g.visible = done >= 2 || c.g.position.x > 14.5; });
    MAP.drones.forEach((d) => { d.g.visible = !inside(d.g.position.x, d.g.position.z, 1.15); });
    let nd = 0; dust.forEach((d) => { d.visible = false; });
    const puff = (x, y, z, a, n = 8, reach = 1.6) => { for (let i = 0; i < n && nd < dust.length; i++) { const p = dustAt(a, i, n, reach); if (!p) continue; const q = dust[nd++]; q.visible = true; q.position.set(x + p.x, y + p.y, z + p.z); q.scale.setScalar(Math.max(0.01, p.size)); } };
    parts.forEach((list, lv) => { if (!lv) return; const full = lv <= done, a0 = lv === done + 1 ? build : -1, tw = a0 - list.end - 0.5, n = list.length;
      list.forEach((p, k) => { const { o, s } = p, a = full ? 99 : a0 - p.d; o.visible = a > 0; if (a <= 0) return; let y = p.y, sx = 1, sy = 1;
        if (p.kind === 'drop') { const d = drop(a); y += d.y; sx = d.sx; sy = d.sy; if (d.landed && a < 0.75) { o.getWorldPosition(w); puff(w.x, p.y + (o.parent === root ? 0 : w.y - o.position.y), w.z, a - 0.3); } }
        else if (p.kind === 'tile') y += layTile(a);
        else sx = sy = Math.max(0.001, springAt(a, 0, SPRING.pop));
        // when the last piece has landed, everything new hops once, one piece after another
        if (!full && tw > 0 && p.kind !== 'tile') { const th = tw - (k / n) * 0.6; y += hop(th, 0.2, 300); const q = hopSquash(th, 300); sy *= q; sx /= Math.sqrt(q); }
        o.position.y = y; o.scale.set(s.x * sx, s.y * sy, s.z * sx); }); });
    // the four first homes are clad in timber one after another: the cream walls give way to the timber ones, in a puff of dust
    firstHomes.forEach((h, k) => { const th = timberHomes[k], b = done >= 3 ? 99 : done === 2 ? build : -1, c = ease(span(b, 0.5 + k * 0.4, 0.95 + k * 0.4));
      if (b > 0) { h.visible = c < 0.5; th.visible = c >= 0.5; const sq = 1 + Math.sin(c * Math.PI) * 0.12; (c < 0.5 ? h : th).scale.set(sq, 2 - sq, sq); puff(h.position.x, TOP, h.position.z, b - (0.72 + k * 0.4), 8, 2); } else th.visible = false; });
    // the trees of the hilltop: cut in one of the street plans, and kept as the park
    parkTrees.forEach((g, k) => { const cut = k ? clamp((S.treeCut || 0) * 1.6 - (k - 1) * 0.15) : 0, th = (S.treeHop ?? -1) - k * 0.06, q = hopSquash(th, 300); g.visible = cut < 0.98; g.scale.set(1 / Math.sqrt(q), Math.max(0.02, 1 - cut) * q, 1 / Math.sqrt(q)); g.position.y = TOP + hop(th, 0.3, 300); g.stump.visible = cut > 0.5; });
    turbs.forEach((tb, k) => { tb.hub.rotation.z = t * 2.3 * (S.wind ?? 1) + k; }); school.flag.scale.x = 0.6 + Math.sin(t * 5) * 0.06;
    mill.saw.rotation.x = t * 7;
    const bars = S.batt ?? 3; battery.bars.forEach((b, k) => { b.userData.m.color.set(k < bars ? '#7dffa8' : '#31503c'); });
    homes.forEach((h) => { const v = clamp(night * 1.6 - (h.k % 8) * 0.07), l = lit(h.k); h.wm.color.copy(dayC).lerp(offC, v).lerp(onC, v * l); h.pools.forEach((m) => { m.opacity = 0.75 * v * l; }); });
    // the meadow: its flowers can be covered by a farm, and its bees can leave
    const lost = S.meadowLost || 0; flowers.forEach((f, k) => { if (!f.early && done < 4 && !(done === 3 && build > 0)) { f.visible = false; return; } if (f.early) { f.visible = true; f.scale.set(0.26, 0.36, 0.26); f.position.y = 0.18; }
      const th = (S.meadowHop ?? -1) - (k % 12) * 0.05, l = clamp(lost * 1.4 - (k % 7) * 0.05); f.position.y += hop(th, 0.35, 300); if (l > 0) { f.scale.y *= Math.max(0.01, 1 - l); f.position.y -= 0.18 * l; f.visible = l < 0.98; } });
    const beeOn = S.bees ?? (done >= 3 ? 1 : 0), away = S.beesAway || 0; bees.forEach((b, k) => { const a = clamp(away * 1.5 - k * 0.06), e = a * a; b.visible = beeOn > 0 && a < 1; b.position.set(2.1 + Math.sin(k * 2.1) * 1.3 + Math.sin(t * 1.3 + k) * 0.45 + e * 5, 0.9 + Math.sin(t * 2.3 + k * 2) * 0.22 + e * 10, 7.1 + Math.cos(k * 1.7) * 1.4 + Math.cos(t * 1.1 + k) * 0.45 + e * (3 + k * 0.4)); b.rotation.y = t * 1.2 + k; });
    // the food cart: it keeps making the same journey once the farms are there
    const cu = S.cart ?? (done >= 4 ? Math.min(1, ((t * 0.05) % 1) * 1.5) : done === 3 && build > parts[4].end ? ease(span(build, parts[4].end + 0.3, parts[4].end + 3)) : -1);
    place(cart, CARTWAY, Math.max(0, cu), 0, cu >= 0); cart.position.y = heightAt(cart.position.x, cart.position.z);
    // the children walk to school at about three squares a second, and then stand in a row at the gate
    const kt = S.kids ?? -1; kids.forEach((m, k) => { const u = clamp((kt - m.d) * 3 / m.len), there = u >= 1, out = springAt(kt, m.d, SPRING.pop); place(m.o, m.pts, u, 0, kt > m.d); m.o.position.y = heightAt(m.o.position.x, m.o.position.z) + (there ? hop(kt - m.d - m.len / 3, 0.35, 300) : Math.abs(Math.sin(t * 9 + k)) * 0.1); m.o.scale.setScalar(Math.max(0.01, out)); if (there) m.o.rotation.y = Math.PI / 2; });
    school.bell.rotation.z = ring(S.bell ?? -1, 3.5, 2.2, 0.6);
    const stroll = S.stroll ?? (done >= 2 && night < 0.3); strollers.forEach((m, k) => { const u = (t * 0.06 + k * 0.37) % 2, g = u < 1 ? u : 2 - u; place(m.o, m.pts, g, TOP + Math.abs(Math.sin(t * 9 + k)) * 0.1, stroll); if (u >= 1) m.o.rotation.y += Math.PI; });
    [[coat, S.coat], [parent, S.parent]].forEach(([o, p], k) => { o.visible = !!p; if (p) { o.position.set(p[0], heightAt(p[0], p[1]) + (p[3] ? Math.abs(Math.sin(t * 9 + k)) * 0.1 : 0), p[1]); o.rotation.y = p[2] ?? 0; } });
  }
  update.buildEnd = parts.map((l) => l.end);
  return update;
}
// The places in the town that can be tapped in each level's recap: [x, y, z]. The first is the place the sample child taps.
export const TAPS = [
  [[8.5, TOP + 1.2, 0.5], [0.15, 0.6, 0.3], [1.75, 0.6, -7.65]],
  [[9.5, TOP + 0.3, 0.5], [4.5, TOP + 0.3, -3.5], [5.95, TOP + 1.3, 4]],
  [[MILL[0], 1.2, MILL[1]], [8, TOP + 1.3, -3], [STALL[0], TOP + 1, STALL[1]]],
  [],
  [[BATTERY[0], TOP + 1, BATTERY[1]], [9.3, TOP + 3, 6.8], [8, TOP + 1.6, 4]],
  [[SCHOOL[0], TOP + 1.4, SCHOOL[1]], [STALL[0], TOP + 1, STALL[1]], [9.5, TOP + 0.5, -1]],
];
