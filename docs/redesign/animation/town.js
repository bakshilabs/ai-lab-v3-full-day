// Eco Town on the Six Towns World Map (map.js is the film's copy of games/ecotown/game/tests/visual/worldmap.js).
// The town starts as empty land on the map and grows through the six levels.
// makeIsland() returns update({ stage, t, night }): the whole part of stage is the number of finished levels, and its
// fraction is how far the next one has been built. t is the time in seconds.
import { THREE, PAL, blk, group, house, tree, person, turbine, place, glow, mat, clamp, ease, span, lerp, back, hash } from './vox.js';
import * as MAP from './map.js';

const TOP = 2; // the height of the far hill where the town stands
const wob = (x, z) => Math.sin(x * 0.63 + z * 0.31) * 0.05 + Math.sin(z * 0.87 - x * 0.41) * 0.05;
const inside = (x, z, s = 1) => (x / (15 * s)) ** 2 + (z / (11 * s)) ** 2 + wob(x, z) < 1;
export const heightAt = (x, z) => (x >= 13.6 ? 1 : x >= 6 ? TOP : x >= 5 ? 1 : 0);
// the map's own scene, with a sky that can turn to night: n is 0 in daylight and 1 after dark
export function makeScene() {
  const day = new THREE.Color('#dff1f7'), dusk = new THREE.Color('#27365c'); MAP.scene.background = day.clone();
  return { scene: MAP.scene, light(n) { MAP.hemi.intensity = lerp(1.55, 1.05, n); MAP.sun.intensity = lerp(2.1, 0.35, n); MAP.hemi.color.set(n > 0.5 ? '#8fa6d8' : '#fff6e8'); MAP.scene.background.copy(day).lerp(dusk, n); } };
}
export const VIEWS = [ // where the camera looks in each level: [x, y, z, distance]
  [1, 0, 0, 50], [9.5, TOP, 0, 34], [9, TOP, 0, 35], [3, 0.4, -3.5, 36], [8.5, TOP, -2.5, 36], [7.5, TOP, -3, 34], [3, 0.5, 0, 46],
];

export function makeIsland() {
  const root = MAP.world;
  // the map's nine sample homes and its two cars make way: the child's own town is built here instead
  MAP.ecoHomes.forEach((g) => { g.visible = false; }); const ringCars = MAP.cars.slice(0, 2), outCars = MAP.cars.slice(5); ringCars.forEach((c) => { c.g.visible = false; });
  for (const [x, z, g] of MAP.ecoTrees) if (g && ((x > 12.9 && x < 14.4) || (x > -2.6 && x < 3.6 && z < -2.8))) g.visible = false;
  const flowers = group(root); for (let k = 0; k < 90; k++) { const x = 0.3 + hash(k, 1) * 4.3, z = 4 + hash(k, 2) * 5.2; if (inside(x, z, 0.95)) blk(flowers, x, z, 0.22, 0.22, 0, 0.32, ['#f08ab8', '#ffd257', '#ffffff', '#c98be0'][k % 4], { shadow: false }); }
  const beeMat = glow('#ffcf2e'), bees = [...Array(10)].map(() => blk(root, 0, 0, 0.16, 0.16, 0, 0.16, '#ffcf2e', { shadow: false, mat: beeMat }));

  // ---- what each level adds. A part appears when the level's progress passes its delay d. -------------------------
  const parts = [[], [], [], [], [], [], []], add = (lv, o, d) => { parts[lv].push({ o, d, s: o.scale.clone() }); return o; };
  const tile = (lv, x, z, c, d, y = TOP) => add(lv, blk(root, x + 0.5, z + 0.5, 1, 1, y, 0.07, c, { shadow: false }), d);
  // level 1: the first homes on the far hill, and a sign
  const firstHomes = [[9.5, -1.6], [11.6, -1.2], [9.4, 1.4], [11.8, 1.8]].map(([x, z], k) => add(1, house(root, x, z, { y: TOP, w: 1.3 }), 0.15 + k * 0.16));
  { const g = group(root, 7.2, TOP, 0.4); blk(g, 0, 0, 0.14, 0.14, 0, 1.5, PAL.trunk); blk(g, 0, 0.1, 1.5, 0.1, 0.9, 0.7, '#fff4dc'); blk(g, 0, 0.16, 1.1, 0.04, 1.15, 0.2, '#c8643f', { shadow: false }); add(1, g, 0.75); }
  // level 2: a road around the outside, a park in the middle, and paths across it
  for (let x = 8; x <= 13; x++) for (const z of [-7, 6]) tile(2, x, z, PAL.road, 0.05 + (x - 8) * 0.03);
  for (let z = -6; z <= 5; z++) for (const x of [7, 13]) if (inside(x + 0.5, z + 0.5, 0.97)) tile(2, x, z, PAL.road, 0.2 + (z + 6) * 0.02);
  for (let x = 8; x <= 12; x++) tile(2, x, -1, PAL.sand, 0.45 + (x - 8) * 0.04); for (let z = -6; z <= 5; z++) if (z !== -1) tile(2, 10, z, PAL.sand, 0.5 + (z + 6) * 0.03);
  for (const [x, z] of [[9.4, -3.2], [11.6, -3.4], [9.3, 2.6], [11.7, 2.4], [11.6, 0.4], [9.4, 0.5]]) add(2, tree(root, x, z, 0.9, TOP), 0.7 + hash(x, z) * 0.2);
  // level 3: timber homes
  const HOMES = [[8.6, -5], [8.6, -2.6], [8.6, 1.2], [8.6, 3.9], [12.3, -5], [12.3, -2.6], [12.3, 1.2], [12.3, 3.9]], winMats = [], roofs = [];
  HOMES.forEach(([x, z], k) => { const wm = glow('#9fd0f5'); winMats.push(wm); const h = house(root, x, z, { y: TOP, w: 1.35, tall: 1.05, wall: '#dcae72', roof: '#8a5a34', winMat: wm }); h.rotation.y = x < 10 ? 0 : 0; roofs.push(h); add(3, h, 0.25 + k * 0.08); });
  { const g = group(root, 1.6, 0, 0.8); blk(g, 0, 0, 2.6, 1.6, 0, 1.1, PAL.timber); blk(g, 0, 0, 2.9, 1.9, 1.1, 0.18, '#8a5a34'); for (let k = 0; k < 3; k++) blk(g, 2.3, -0.5 + k * 0.5, 1.6, 0.4, 0, 0.4, '#a9743f'); blk(g, 2.3, -0.25, 1.6, 0.4, 0.4, 0.4, '#b98450'); blk(g, -0.6, 0.86, 0.5, 0.06, 0.9, 0.5, PAL.sun, { shadow: false }); add(3, g, 0.05); }
  // level 4: farms on open land close to the town, two farm houses and a market stall
  for (let x = -2; x <= 3; x++) for (let z = -8; z <= -3; z++) if (inside(x + 0.5, z + 0.5, 0.95)) { tile(4, x, z, z & 1 ? PAL.soil : PAL.soilDark, 0.05 + (x + 2) * 0.05, 0); add(4, blk(root, x + 0.5, z + 0.5, 0.5, 0.5, 0.07, 0.32, ['#7cc04a', '#e2c04a', '#4f9550'][(z + 9) % 3]), 0.3 + (x + 2) * 0.05 + hash(x, z) * 0.1); }
  const FARMS = [[-3.2, -6.3], [-2.7, -2.2]]; FARMS.forEach(([x, z], k) => add(4, house(root, x, z, { w: 1.3, wall: PAL.timber, roof: '#8a5a34' }), 0.6 + k * 0.12));
  { const g = group(root, 6.6, TOP, -2.4); blk(g, 0, 0, 1.1, 1.7, 0, 0.5, PAL.timber); blk(g, 0, 0, 1.4, 2, 1.15, 0.14, '#d9533d'); for (const dz of [-0.85, 0.85]) blk(g, -0.5, dz, 0.1, 0.1, 0, 1.15, PAL.trunk); for (const [dz, c] of [[-0.5, '#e0503a'], [0, '#f4b73b'], [0.5, '#4f9550']]) blk(g, 0, dz, 0.5, 0.36, 0.5, 0.2, c); add(4, g, 0.8); }
  const cart = group(root); blk(cart, 0, 0, 1.1, 0.7, 0.22, 0.32, PAL.timber); for (const [x, c] of [[-0.28, '#e0503a'], [0.02, '#4f9550'], [0.3, '#f4b73b']]) blk(cart, x, 0, 0.24, 0.5, 0.54, 0.24, c); for (const [x, z] of [[-0.32, 0.38], [0.32, 0.38], [-0.32, -0.38], [0.32, -0.38]]) blk(cart, x, z, 0.3, 0.1, 0, 0.3, '#5b4a40'); const carter = person(cart, '#3f78b5'); carter.position.set(0.85, 0, 0);
  // level 5: wind turbines, solar roofs and a battery
  const turbs = [[7.4, -8.6], [9.6, -8.4]].map(([x, z], k) => add(5, turbine(root, x, z, TOP, 1.15), 0.1 + k * 0.2));
  roofs.forEach((h, k) => { if (k % 2 === 0) { const s = blk(h, 0.38, 0, 0.55, 1.1, 1.4, 0.07, PAL.solar); s.rotation.z = -0.5; add(5, s, 0.45 + k * 0.05); } });
  const lamp = glow('#2e9b5a'); { const g = group(root, 6.8, TOP, 3.2); blk(g, 0, 0, 1, 1.6, 0, 1.25, PAL.white); blk(g, 0, 0, 1.1, 1.7, 1.25, 0.13, '#2e9b5a'); for (let k = 0; k < 3; k++) blk(g, 0.52, -0.5 + k * 0.5, 0.05, 0.3, 0.25, 0.75, '#2e9b5a', { shadow: false, mat: lamp }); add(5, g, 0.75); }
  // level 6: the school between the town and the farms
  const school = group(root, 6.6, TOP, -5.6), bell = blk(school, 0, 0, 0.4, 0.4, 1.66, 0.5, PAL.sun);
  blk(school, 0, 0, 1.6, 2.4, 0, 1.25, '#ffe9a8'); blk(school, 0, 0, 1.9, 2.7, 1.25, 0.22, '#d9533d'); blk(school, 0, 0, 1.9, 1.7, 1.47, 0.2, '#d9533d'); blk(school, 0.82, 0, 0.05, 0.5, 0, 0.75, PAL.trunk, { shadow: false });
  for (const dz of [-0.75, 0.75]) blk(school, 0.82, dz, 0.05, 0.42, 0.45, 0.42, PAL.glass, { shadow: false }); blk(school, 0.6, 1.5, 0.08, 0.08, 0, 2.5, PAL.white); const flag = blk(school, 0.95, 1.5, 0.6, 0.05, 2.05, 0.4, '#f4b73b', { shadow: false }); add(6, school, 0.2);
  const KID = ['#e0503a', '#3f78b5', '#f4b73b', '#8a5fc2', '#2e9b5a', '#d9533d', '#16a3a3', '#e0803a'];
  const kids = [...HOMES.slice(0, 5).map(([x, z]) => [[x, z + 0.9], [x < 10 ? 7.6 : 13.4, z + 0.9], [x < 10 ? 7.6 : 13.4, -6.5], [7.6, -6.5], [7.6, -5.6]]), ...FARMS.map(([x, z]) => [[x + 1, z], [-1, -2.2], [4.6, -4.4], [5.6, -5.4]])].map((pts, k) => ({ o: person(root, KID[k]), pts, d: k * 0.05 }));
  // people who stroll once there are paths
  const strollers = [[[8.5, -0.5], [12.5, -0.5]], [[10.5, -5.5], [10.5, 4.5]], [[8.5, -0.5], [10.5, -0.5], [10.5, 4.5]]].map((pts, k) => ({ o: person(root, KID[k + 3]), pts }));
  const dust = [...Array(36)].map(() => blk(root, 0, 0, 0.28, 0.28, 0, 0.28, '#f6ecd8', { shadow: false, mat: glow('#fff6e4') }));

  const onC = new THREE.Color('#ffd257'), dayC = new THREE.Color('#9fd0f5');
  return ({ stage, t, night = 0 }) => {
    MAP.animate(t + 8); ringCars.forEach((c) => { c.g.visible = false; }); outCars.forEach((c) => { c.g.visible = stage >= 2 || c.g.position.x > 14.5; });
    let nd = 0; dust.forEach((d) => { d.visible = false; });
    parts.forEach((list, lv) => { if (!lv) return; const p = clamp(stage - (lv - 1));
      list.forEach(({ o, d, s }, k) => { const a = span(p, d * 0.8, d * 0.8 + 0.16), b = Math.max(0.0001, back(a)); o.scale.set(s.x * b, s.y * b, s.z * b); o.visible = a > 0;
        if (a > 0 && a < 1 && nd < dust.length - 3 && (k % 3 === 0 || lv !== 2 && lv !== 4)) { const w = new THREE.Vector3(); o.getWorldPosition(w); for (let n = 0; n < 3; n++) { const q = dust[nd++], ang = n * 2.1 + k; q.visible = true; q.position.set(w.x + Math.cos(ang) * a * 1.4, w.y + 0.3 + a * 0.9, w.z + Math.sin(ang) * a * 1.4); q.scale.setScalar(0.34 * (1 - a) + 0.02); } } }); });
    // the first homes give way to the timber homes
    const swap = 1 - ease(span(stage, 2.02, 2.2)); if (stage > 2) firstHomes.forEach((h) => { h.scale.setScalar(Math.max(0.0001, swap)); h.visible = swap > 0.01; });
    turbs.forEach((tb, k) => { tb.hub.rotation.z = t * 2.3 + k; }); flag.scale.x = 0.6 + Math.sin(t * 5) * 0.06; lamp.color.set(Math.sin(t * 4) > -0.3 ? '#7dffa8' : '#2e9b5a');
    winMats.forEach((m) => m.color.copy(dayC).lerp(onC, night));
    bees.forEach((b, k) => { b.position.set(2.4 + Math.sin(k * 2.1) * 1.8 + Math.sin(t * 1.9 + k) * 0.6, 0.8 + Math.sin(t * 3.1 + k * 2) * 0.22, 6.6 + Math.cos(k * 1.7) * 2 + Math.cos(t * 1.6 + k) * 0.6); });
    const pFood = clamp(stage - 3), run = ((t * 0.07) % 1); place(cart, [[1, -2.4], [4.6, -2.4], [6, -2.4]], stage >= 4 ? Math.min(1, run * 1.6) : ease(span(pFood, 0.85, 1)), 0, pFood > 0.85); cart.position.y = heightAt(cart.position.x, 0);
    const pSch = clamp(stage - 5); kids.forEach((m, k) => { const g = span(pSch, 0.35 + m.d, 0.95); place(m.o, m.pts, ease(g), 0, pSch > 0.35 + m.d && g < 0.999); m.o.position.y = heightAt(m.o.position.x, m.o.position.z) + Math.abs(Math.sin(t * 9 + k)) * 0.1; });
    bell.rotation.x = pSch > 0.3 && pSch < 0.7 ? Math.sin(t * 22) * 0.5 : 0;
    strollers.forEach((m, k) => { const u = (t * 0.06 + k * 0.37) % 2, g = u < 1 ? u : 2 - u; place(m.o, m.pts, g, TOP + Math.abs(Math.sin(t * 9 + k)) * 0.1, stage >= 2); if (u >= 1) m.o.rotation.y += Math.PI; });
  };
}
// the place on the island that the sample child taps in each level's recap: [x, y, z]
export const TAPS = [[10.5, TOP + 1, 0], [10.5, TOP + 0.3, -0.5], [1.6, 1.2, 0.8], [2.4, 0.5, 6.5], [6.8, TOP + 1.2, 3.2], [6.6, TOP + 1.4, -5.6]];
