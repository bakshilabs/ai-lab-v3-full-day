// Eco Town on the Six Towns World Map (map.js is the film's copy of games/ecotown/game/tests/visual/worldmap.js).
// The town starts as empty land on the map and grows through the six levels. The layout, sizes and colours follow
// docs/redesign/design/art-direction.md.
// makeIsland() returns update({ stage, t, night }): the whole part of stage is the number of finished levels, and its
// fraction is how far the next one has been built. t is the time in seconds, and night is 0 by day and 1 after dark.
import { THREE, PAL, blk, group, person, place, glow, mat, clamp, ease, span, lerp, back, hash } from './vox.js';
import * as MAP from './map.js';

const TOP = 2; // the height of the far hill where the town stands
const wob = (x, z) => Math.sin(x * 0.63 + z * 0.31) * 0.05 + Math.sin(z * 0.87 - x * 0.41) * 0.05;
const inside = (x, z, s = 1) => (x / (15 * s)) ** 2 + (z / (11 * s)) ** 2 + wob(x, z) < 1;
// the height of the ground, with the stair that climbs the cliff at x = 3
export const heightAt = (x, z) => (x >= 13.6 ? 1 : x >= 4 ? TOP : x >= 3 && z >= -1 && z < 1 ? 1 : 0);
export const YAW = -1.2, TILT = 0.95; // the camera stands above the river and looks towards the hill
export const VIEWS = [ // where the camera looks in each level: [x, y, z, distance]
  [3, 1, -0.5, 46], [8, 2, 0.5, 32], [8.5, 2, 0, 30], [5.5, 1, 0.5, 36], [3.5, 1, -1.5, 40], [7, 2, 2, 34], [5, 1, -3.5, 34], [3.5, 1, -0.5, 46],
];
// the map's own scene, with a sky that can turn to night: n is 0 in daylight and 1 after dark
export function makeScene() {
  const day = new THREE.Color('#dff1f7'), dark = new THREE.Color('#1c2647'), hd = new THREE.Color('#fff6e8'), hn = new THREE.Color('#7f95d6'), sd = new THREE.Color('#fff0d0'), sn = new THREE.Color('#9fb4ff');
  MAP.scene.background = day.clone();
  return { scene: MAP.scene, light(n) { MAP.hemi.intensity = lerp(1.55, 0.62, n); MAP.sun.intensity = lerp(2.1, 0.5, n); MAP.hemi.color.copy(hd).lerp(hn, n); MAP.sun.color.copy(sd).lerp(sn, n); MAP.scene.background.copy(day).lerp(dark, n); } };
}

const CLOTHES = ['#e0503a', '#3f78b5', '#ffd257', '#8a5fc2', '#2e9b5a', '#16a3a3'];
const walker = (root, c) => { const g = person(root, c); g.children.forEach((m) => { m.scale.multiplyScalar(0.82); m.position.y *= 0.82; }); return g; };

export function makeIsland() {
  const root = MAP.world, box = MAP.box;
  // the map's sample homes, its ring cars and the trees that stand where the child's town will be make way
  MAP.ecoHomes.forEach((g) => { g.visible = false; }); const ringCars = MAP.cars.slice(0, 2), outCars = MAP.cars.slice(5);
  for (const [x, z, g] of MAP.ecoTrees) if (g && (x > 3.4 || (x > -2.6 && x < 3.6 && z < -2.8) || (x > -0.5 && x < 3 && z > 1 && z < 5))) g.visible = false;

  // ---- what each level adds. A part appears when the level's progress passes its delay d. -------------------------
  const parts = [[], [], [], [], [], [], []], add = (lv, o, d) => { parts[lv].push({ o, d, s: o.scale.clone() }); return o; };
  const tile = (lv, x, z, c, d, y = TOP, h = 0.06) => add(lv, blk(root, x + 0.5, z + 0.5, 1, 1, y, h, c, { shadow: false }), d);
  const winMats = [], pools = [];
  // a home at the map's own size: 1.9 wide, walls 1.45 high, a roof of four steps. face is +1 when the door looks south.
  const home = (x, z, y, wall, face, roofCol) => {
    const g = group(root, x, y, z), body = group(g); box(body, 1.9, 1.45, 1.9, 0, 0.725, 0, wall);
    MAP.stepRoof(body, 1.9, 1.9, 1.45, roofCol, wall, { tiles: true });
    if (wall === PAL.timber) for (const yy of [0.5, 1.0]) box(body, 1.94, 0.07, 1.94, 0, yy, 0, '#a9743f', false);
    box(body, 0.42, 0.75, 0.06, 0.4, 0.38, 0.97 * face, PAL.trunk, false); MAP.bake(body);
    const wm = glow('#9fd0f5'); winMats.push(wm);
    for (const [wx, wz, w, d] of [[-0.42, 0.97 * face, 0.5, 0.06], [-0.97, 0.3, 0.06, 0.5], [-0.97, -0.45, 0.06, 0.5], [0.3, -0.97 * face, 0.5, 0.06]]) blk(g, wx, wz, w, d, 0.62, 0.45, '#9fd0f5', { shadow: false, mat: wm });
    for (const [px, pz] of [[0.4, 1.55 * face], [-1.55, 0]]) { const pm = new THREE.MeshBasicMaterial({ color: '#e8b84a', transparent: true, opacity: 0 }); pools.push(pm); blk(g, px, pz, 1.1, 0.9, 0.02, 0.02, '#e8b84a', { shadow: false, mat: pm }); }
    return g;
  };
  // level 1: four homes on the far hill
  const SPOTS = [[5.95, -3, 1], [11.05, -3, 1], [5.95, 4, -1], [11.05, 4, -1], [8, -3, 1], [8, 4, -1]];
  const firstHomes = SPOTS.slice(0, 4).map(([x, z, f], k) => add(1, home(x, z, TOP, PAL.wall[k % 3], f, PAL.roof[k % 3]), 0.15 + k * 0.17));
  // level 2: the road around the outside, the park in the middle with a cross of paths, the stair and the shops
  for (let x = 4; x <= 12; x++) for (const z of [-5, 5]) tile(2, x, z, PAL.road, 0.03 + (x - 4) * 0.02);
  for (let z = -4; z <= 4; z++) for (const x of [4, 12]) tile(2, x, z, PAL.road, 0.12 + (z + 4) * 0.02);
  for (let x = 5; x <= 11; x++) for (let z = -2; z <= 2; z++) tile(2, x, z, x === 9 || z === 0 ? PAL.sand : PAL.grassDeep, 0.3 + (x - 5) * 0.03 + (z + 2) * 0.01, TOP, x === 9 || z === 0 ? 0.07 : 0.05);
  for (const z of [-4, -3, 3, 4]) tile(2, 9, z, PAL.sand, 0.5 + Math.abs(z) * 0.02, TOP, 0.07);
  for (const z of [-1, 0]) add(2, blk(root, 3.5, z + 0.5, 1, 1, 0, 1, PAL.sand), 0.25);
  for (const [x, z] of [[6.2, -1.2], [8.2, -1.3], [10.8, -1.2], [7.7, 1.8], [10.9, 1.9]]) { const g = MAP.tree(x, z, false, 1); if (g) { g.position.y = TOP; add(2, g, 0.62 + hash(x, z) * 0.2); } }
  for (const z of [-2.4, 0.4, 3.2]) { const g = MAP.tree(13.5, z, false, 1); if (g) add(2, g, 0.8); }
  const stall = group(root, 5.7, TOP, 1.6); { blk(stall, 0, 0, 1.2, 1.9, 0, 0.55, PAL.timber); for (const dz of [-0.9, 0.9]) blk(stall, -0.55, dz, 0.1, 0.1, 0, 1.3, PAL.trunk); for (let k = 0; k < 5; k++) blk(stall, 0, -0.84 + k * 0.42, 1.5, 0.42, 1.3, 0.14, k % 2 ? PAL.white : PAL.roof[0]); add(2, stall, 0.85); }
  // level 3: the first homes are clad in timber, two more homes rise, and a sawmill stands on the low land
  const timberHomes = SPOTS.map(([x, z, f], k) => { const h = home(x, z, TOP, PAL.timber, f, PAL.roof[k % 3]); if (k >= 4) add(3, h, 0.5 + (k - 4) * 0.15); return h; });
  { const g = group(root, 1.5, 0, 2.6); blk(g, 0, 0, 2.8, 1.8, 0, 1.2, PAL.timber); blk(g, 0, 0, 3.1, 2.1, 1.2, 0.2, '#8a5a34'); blk(g, 0, 0, 3.1, 1.3, 1.4, 0.2, '#8a5a34'); blk(g, 0, 0.92, 0.9, 0.06, 0, 0.85, PAL.trunk, { shadow: false });
    for (let k = 0; k < 3; k++) blk(g, -0.5 + k * 0.5, 1.9, 0.4, 1.6, 0, 0.4, '#a9743f'); for (let k = 0; k < 2; k++) blk(g, -0.25 + k * 0.5, 1.9, 0.4, 1.6, 0.4, 0.4, '#b9824a'); add(3, g, 0.1); }
  // level 4: farms on open land under the hill, two farm houses, produce on the stall, and the meadow in bloom
  for (let x = -2; x <= 3; x++) for (let z = -8; z <= -3; z++) if (inside(x + 0.5, z + 0.5, 0.95)) { tile(4, x, z, z & 1 ? PAL.soil : PAL.soilDark, 0.05 + (x + 2) * 0.05, 0); add(4, blk(root, x + 0.5, z + 0.5, 0.5, 0.5, 0.06, 0.34, ['#7cc04a', '#e2c04a', '#4f9550'][(x + z + 20) % 3]), 0.3 + (x + 2) * 0.05 + hash(x, z) * 0.1); }
  const FARMS = [[0.3, -1.3], [2.7, -1.3]]; FARMS.forEach(([x, z], k) => add(4, home(x, z, 0, PAL.wall[k], 1, PAL.roof[k + 1]), 0.6 + k * 0.12));
  [['#e0503a', -0.5], ['#4f9550', 0], ['#e2c04a', 0.5]].forEach(([c, dz], k) => add(4, blk(stall, 0, dz, 0.9, 0.36, 0.55, 0.26, c), 0.9 + k * 0.03));
  const FLOWER = ['#f08ab8', '#ffd257', '#ffffff', '#c98be0'];
  for (let k = 0; k < 90; k++) { const x = 0.3 + hash(k, 1) * 3.5, z = 5.4 + hash(k, 2) * 3.6; if (!inside(x, z, 0.95) || Math.abs(x - MAP.riverX(z)) < 2.1) continue; const f = blk(root, x, z, 0.22, 0.22, 0, 0.32, FLOWER[k % 4], { shadow: false }); if (k >= 10) add(4, f, 0.45 + hash(k, 3) * 0.4); }
  const beeMat = glow('#ffcf2e'), bees = [...Array(10)].map(() => blk(root, 0, 0, 0.16, 0.16, 0, 0.16, '#ffcf2e', { shadow: false, mat: beeMat }));
  const cart = group(root); blk(cart, 0, 0, 1.1, 0.7, 0.22, 0.32, PAL.timber); [['#e0503a', -0.28], ['#4f9550', 0.02], ['#e2c04a', 0.3]].forEach(([c, x]) => blk(cart, x, 0, 0.24, 0.5, 0.54, 0.24, c)); for (const [x, z] of [[-0.32, 0.38], [0.32, 0.38], [-0.32, -0.38], [0.32, -0.38]]) blk(cart, x, z, 0.3, 0.08, 0, 0.3, '#2a2a2a', { shadow: false }); { const f = walker(cart, CLOTHES[1]); f.position.set(0.85, 0, 0); }
  const CARTWAY = [[1.2, -3.2], [1.6, -0.5], [3.5, -0.5], [4.5, -0.5], [4.5, 1.6], [5, 1.6]];
  // level 5: two turbines and a battery at the south end of the hill, and solar panels on the roofs
  for (let x = 5; x <= 10; x++) for (const z of [6, 7]) if (inside(x + 0.5, z + 0.5, 0.97)) tile(5, x, z, PAL.grassDeep, 0.02 + (x - 5) * 0.02, TOP, 0.05);
  const turbs = [[6.6, 7.2], [9.3, 6.8]].map(([x, z], k) => { const g = group(root, x, TOP, z); blk(g, 0, 0, 0.6, 0.6, 0, 0.3, PAL.navy); blk(g, 0, 0, 0.36, 0.36, 0.3, 3.75, PAL.white);
    const hub = group(g, -0.3, 4.05, 0); hub.rotation.y = Math.PI / 2; blk(hub, 0, 0, 0.5, 0.36, -0.25, 0.5, PAL.white); for (let i = 0; i < 3; i++) { const b = group(hub); b.rotation.z = i * Math.PI * 2 / 3; blk(b, 0, 0, 0.28, 0.1, 0.15, 1.6, PAL.white); } g.hub = hub; return add(5, g, 0.1 + k * 0.2); });
  timberHomes.forEach((h, k) => { const s = blk(h, -0.52, 0, 0.72, 1.3, 1.9, 0.07, PAL.solar); s.rotation.z = Math.PI / 4; add(5, s, 0.45 + k * 0.06); });
  const lamp = glow('#5aa35a'); { const g = group(root, 4.9, TOP, 6.8); blk(g, 0, 0, 1.1, 1.7, 0, 1.3, PAL.white); blk(g, 0, 0, 1.2, 1.8, 1.3, 0.14, '#5aa35a'); for (let k = 0; k < 3; k++) blk(g, -0.57, -0.5 + k * 0.5, 0.05, 0.3, 0.3, 0.75, '#5aa35a', { shadow: false, mat: lamp }); add(5, g, 0.7); }
  // level 6: the school on the corner above the farm, the one yellow building in the town
  const school = group(root, 6.2, TOP, -7.1), bell = blk(school, -1, 0, 0.42, 0.42, 2.3, 0.5, PAL.sun, { mat: glow('#ffd257') });
  { const b = group(school); box(b, 3.2, 1.5, 1.9, 0, 0.75, 0, '#ffd76a'); MAP.stepRoof(b, 1.9, 3.2, 1.5, PAL.roof[0], '#ffd76a', { tiles: true }); b.rotation.y = Math.PI / 2;
    blk(school, -1, 0, 0.7, 0.7, 1.5, 0.8, '#ffd76a'); blk(school, 0, 0.97, 0.6, 0.06, 0, 0.85, PAL.trunk, { shadow: false }); for (const dx of [-1, 1]) blk(school, dx, 0.97, 0.5, 0.06, 0.62, 0.45, PAL.glass, { shadow: false });
    blk(school, 1.9, 0.6, 0.08, 0.08, 0, 2.7, PAL.white); }
  const flag = blk(school, 2.25, 0.6, 0.6, 0.05, 2.2, 0.42, '#ffd257', { shadow: false }); add(6, school, 0.05);
  const ROADW = 4.5, kids = [
    ...SPOTS.map(([x, z, f]) => [[x + 0.4, z + 1.3 * f], [x + 0.4, f > 0 ? -1.4 : 3], [ROADW, f > 0 ? -1.4 : 3], [ROADW, -5.5], [6.2, -5.5], [6.2, -6.1]]),
    ...FARMS.map(([x, z]) => [[x + 0.4, z + 1.3], [3.2, -0.5], [ROADW, -0.5], [ROADW, -5.5], [6.2, -5.5], [6.2, -6.1]]),
  ].map((pts, k) => ({ o: walker(root, k === 0 ? '#ffd257' : CLOTHES[(k + 3) % 6 === 2 ? 0 : (k + 3) % 6]), pts, d: k * 0.045 }));
  // people who stroll on the cross of paths once it is there
  const strollers = [[[5.5, 0.5], [11.5, 0.5]], [[9.5, -3.5], [9.5, 3.5]], [[5.5, 0.5], [9.5, 0.5], [9.5, 3.5]]].map((pts, k) => ({ o: walker(root, CLOTHES[[3, 4, 5][k]]), pts }));
  const dust = [...Array(36)].map(() => blk(root, 0, 0, 0.28, 0.28, 0, 0.28, '#f6ecd8', { shadow: false, mat: glow('#fff6e4') }));

  const onC = new THREE.Color('#ffd257'), dayC = new THREE.Color('#9fd0f5'), w = new THREE.Vector3();
  return ({ stage, t, night = 0 }) => {
    MAP.animate(t + 8); ringCars.forEach((c) => { c.g.visible = false; }); outCars.forEach((c) => { c.g.visible = stage >= 2 || c.g.position.x > 14.5; });
    MAP.drones.forEach((d) => { d.g.visible = !inside(d.g.position.x, d.g.position.z, 1.05); });
    let nd = 0; dust.forEach((d) => { d.visible = false; });
    parts.forEach((list, lv) => { if (!lv) return; const p = clamp(stage - (lv - 1));
      list.forEach(({ o, d, s }, k) => { const a = span(p, d * 0.8, d * 0.8 + 0.16), b = Math.max(0.0001, back(a)); o.scale.set(s.x * b, s.y * b, s.z * b); o.visible = a > 0;
        if (a > 0 && a < 1 && nd < dust.length - 3 && (k % 3 === 0 || lv !== 2 && lv !== 4)) { o.getWorldPosition(w); for (let n = 0; n < 3; n++) { const q = dust[nd++], ang = n * 2.1 + k; q.visible = true; q.position.set(w.x + Math.cos(ang) * a * 1.4, w.y + 0.3 + a * 0.9, w.z + Math.sin(ang) * a * 1.4); q.scale.setScalar(0.34 * (1 - a) + 0.02); } } }); });
    // the four first homes are clad in timber one after another: the cream walls give way to the timber ones
    firstHomes.forEach((h, k) => { const c = ease(span(stage, 2.12 + k * 0.07, 2.24 + k * 0.07)), th = timberHomes[k]; if (stage > 2) { h.visible = c < 0.5; th.visible = c >= 0.5; const sq = 1 + Math.sin(c * Math.PI) * 0.12; (c < 0.5 ? h : th).scale.set(sq, 2 - sq, sq);
        if (c > 0 && c < 1 && nd < dust.length - 4) for (let n = 0; n < 4; n++) { const q = dust[nd++], ang = n * 1.57 + k; q.visible = true; q.position.set(h.position.x + Math.cos(ang) * (1 + c), TOP + 0.4 + c, h.position.z + Math.sin(ang) * (1 + c)); q.scale.setScalar(0.4 * (1 - c) + 0.02); } } else th.visible = false; });
    turbs.forEach((tb, k) => { tb.hub.rotation.z = t * 2.3 + k; }); flag.scale.x = 0.6 + Math.sin(t * 5) * 0.06; lamp.color.set(Math.sin(t * 4) > -0.3 ? '#7dffa8' : '#5aa35a');
    winMats.forEach((m, k) => m.color.copy(dayC).lerp(onC, clamp(night * 1.6 - (k % 8) * 0.07))); pools.forEach((m, k) => { m.opacity = 0.75 * clamp(night * 1.6 - (k % 8) * 0.07); });
    const pFood = clamp(stage - 3); bees.forEach((b, k) => { b.visible = pFood > 0.6; b.position.set(2.1 + Math.sin(k * 2.1) * 1.4 + Math.sin(t * 1.9 + k) * 0.5, 0.8 + Math.sin(t * 3.1 + k * 2) * 0.22, 7.2 + Math.cos(k * 1.7) * 1.5 + Math.cos(t * 1.6 + k) * 0.5); });
    const run = (t * 0.05) % 1; place(cart, CARTWAY, stage >= 4 ? Math.min(1, run * 1.5) : ease(span(pFood, 0.8, 1)), 0, pFood > 0.8); cart.position.y = heightAt(cart.position.x, cart.position.z);
    const pSch = clamp(stage - 5); kids.forEach((m, k) => { const g = span(pSch, 0.3 + m.d, 0.97); place(m.o, m.pts, ease(g), 0, pSch > 0.3 + m.d && g < 0.999); m.o.position.y = heightAt(m.o.position.x, m.o.position.z) + Math.abs(Math.sin(t * 9 + k)) * 0.1; });
    bell.rotation.z = pSch > 0.28 && pSch < 0.7 ? Math.sin(t * 22) * 0.5 : 0;
    strollers.forEach((m, k) => { const u = (t * 0.06 + k * 0.37) % 2, g = u < 1 ? u : 2 - u; place(m.o, m.pts, g, TOP + Math.abs(Math.sin(t * 9 + k)) * 0.1, stage >= 2); if (u >= 1) m.o.rotation.y += Math.PI; });
  };
}
// the place in the town that the sample child taps in each level's recap: [x, y, z]
export const TAPS = [[8.5, TOP + 1.5, 0.5], [8.5, TOP + 0.3, 0.5], [1.5, 1.4, 2.6], [2.1, 0.5, 7.2], [4.9, TOP + 1.4, 6.8], [6.2, TOP + 1.6, -7.1]];
