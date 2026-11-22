// The six Eco Town levels as small 3D scenes. Each level draws one plate of land for each plan.
// build(plate, i) draws plan i and returns update({ show, u, t }): show is how far the plan has appeared (0 to 1),
// u is how far the test has run (0 to 1), and t is the time in seconds, for things that keep moving.
import { THREE, PAL, blk, group, land, house, tree, person, car, turbine, place, glow, clear, mat, clamp, ease, span, lerp, back, hash } from './vox.js';

const pop = (g, show) => { const s = Math.max(0.0001, back(show)); g.scale.set(s, s, s); };
const KID = ['#e0503a', '#3f78b5', '#f4b73b', '#8a5fc2', '#2e9b5a', '#d9533d', '#16a3a3'];

// ---- Level 1, Land: the river rises -------------------------------------------------------------------------------
function landLevel(plate, i) {
  const H = (x) => (x <= -4 ? -0.45 : x <= -2 ? 0.7 : x <= 2 ? 0 : x === 3 ? 0.9 : 1.8);
  const bankFront = [];
  land(plate, (x, z) => (x <= -4 ? { c: PAL.water, h: -0.45 } : x <= -2 ? { c: PAL.sand, h: 0 } : { h: 0 }));
  for (let z = -5; z <= 5; z++) { bankFront.push(blk(plate, -3, z, 1, 1, 0, 0.7, PAL.sand)); blk(plate, -2, z, 1, 1, 0, 0.7, PAL.grass[z & 3 ? 1 : 2]); blk(plate, 3, z, 1, 1, 0, 0.9, PAL.grassDeep); for (const x of [4, 5]) blk(plate, x, z, 1, 1, 0, 1.8, PAL.grass[Math.floor(hash(x, z) * 4)]); }
  for (const [x, z] of [[0, -4], [1, 4], [4, -4.5], [5, 4.5], [-1, -4.6]]) tree(plate, x, z, 0.9, H(Math.round(x)));
  const spot = [[-2.6, 0.7], [0.3, 0], [4.5, 1.8]][i], town = group(plate, spot[0], spot[1], 0), homes = [];
  for (const [dx, dz] of [[-0.35, -1.7], [0.45, -0.55], [-0.35, 0.6], [0.45, 1.75]]) homes.push(house(town, dx, dz, { w: 1 }));
  const water = blk(plate, 0, 0, 10.98, 10.98, -0.5, 0.1, PAL.water, { shadow: false, mat: clear(PAL.water, 0.82) });
  const rain = group(plate), drops = [...Array(70)].map((_, k) => blk(rain, hash(k, 1) * 11 - 5.5, hash(k, 2) * 11 - 5.5, 0.09, 0.09, 0, 0.7, '#ffffff', { shadow: false, mat: glow('#eaf7ff') }));
  return ({ show, u, t, live }) => {
    pop(town, show);
    const rise = ease(span(u, 0.1, 0.75)), wet = live && u > 0.02 && u < 0.97;
    water.scale.y = 0.1 + rise * 0.9; water.position.y = -0.5 + water.scale.y / 2; water.visible = rise > 0.01;
    rain.visible = wet; drops.forEach((d, k) => { d.position.y = 9 - ((t * 9 + hash(k, 3) * 9) % 9); });
    const wear = ease(span(u, 0.45, 0.9));
    bankFront.forEach((b) => { b.position.y = 0.35 - wear * 0.75; });
    if (i === 0) homes.forEach((h, k) => { const front = k % 2 === 0; h.rotation.z = front ? wear * 0.42 : 0; h.position.y = front ? -wear * 0.45 : 0; });
  };
}

// ---- Level 2, Getting around: the shops open ----------------------------------------------------------------------
function streetsLevel(plate, i) {
  const path = new Set(), road = new Set(), key = (x, z) => `${x},${z}`;
  const line = (set, x0, z0, x1, z1) => { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) set.add(key(x, z)); };
  let homes, trees, movers;
  const shop = [4, 0];
  if (i === 0) { for (const v of [-3, 0, 3]) { line(path, v, -5, v, 5); line(path, -5, v, 5, v); }
    homes = [[-4.5, -1.5], [-4.5, 1.5], [-1.5, -4.5], [-1.5, 4.4], [-1.5, -1.5], [-1.5, 1.5]]; trees = [[1.5, -4.5], [1.5, 4.5]];
    movers = homes.map(([x, z], k) => ({ walk: true, pts: [[x, z], [x, z < 0 ? -3 : 3], [x < -3 ? -3 : 0, z < 0 ? -3 : 3], [x < -3 ? -3 : 0, 0], shop].filter((p, n, a) => !n || p[0] !== a[n - 1][0] || p[1] !== a[n - 1][1]), d: k * 0.05 })); }
  if (i === 1) { line(road, -5, -5, 5, -5); line(road, -5, 5, 5, 5); line(road, -5, -5, -5, 5); line(road, 5, -5, 5, 5);
    homes = [[-3.7, -3.6], [-3.7, -1.2], [-3.7, 1.2], [-3.7, 3.6], [2.4, -3.6], [2.4, 3.6]]; trees = [[-1.5, -2.5], [-0.5, 0], [-1.5, 2.5], [0.8, -1.6], [0.8, 1.6], [-2, -0.6], [0, 3], [0, -3.2]];
    movers = homes.map(([x, z], k) => (x < 0 ? { walk: false, pts: [[-5, z], [-5, z < 0 ? -5 : 5], [5, z < 0 ? -5 : 5], [5, 0]], d: k * 0.07 } : { walk: true, pts: [[x, z], [3.6, z], [3.6, 0], shop], d: k * 0.05 })); }
  if (i === 2) { line(road, -5, -5, 5, -5); line(road, -5, 5, 5, 5); line(road, -5, -5, -5, 5); line(road, 5, -5, 5, 5); line(path, -4, 0, 3, 0); line(path, -3, -3, -3, 3);
    homes = [[-3.8, -3.3], [-3.8, -1.3], [-3.8, 1.3], [-3.8, 3.3], [-1.6, -3.6], [-1.6, 3.6]]; trees = [[-1, -1.6], [0.5, -2.2], [2, -1.5], [-1, 1.6], [0.5, 2.2], [2, 1.5], [0.6, -3.7], [0.6, 3.7]];
    movers = homes.map(([x, z], k) => ({ walk: true, pts: [[x, z], [-3, z], [-3, 0], shop], d: k * 0.05 })); }
  land(plate, (x, z) => (road.has(key(x, z)) ? { c: PAL.road } : path.has(key(x, z)) ? { c: PAL.sand } : i ? { c: Math.abs(x) < 3 && Math.abs(z) < 4 ? PAL.grassDeep : undefined } : undefined));
  blk(plate, 4, 0, 1.3, 2.6, 0, 1.1, PAL.wall[1]); blk(plate, 4, 0, 1.6, 2.9, 1.1, 0.2, '#16a3a3'); blk(plate, 3.2, 0, 0.5, 2.6, 0.75, 0.1, '#f4b73b');
  const plan = group(plate); homes.forEach(([x, z]) => house(plan, x, z, { w: 1 })); trees.forEach(([x, z]) => tree(plan, x, z, 0.85));
  const things = movers.map((m, k) => Object.assign(m, { o: m.walk ? person(plate, KID[k]) : car(plate, KID[k]) }));
  return ({ show, u, t }) => {
    pop(plan, show);
    things.forEach((m, k) => { const g = span(u, 0.05 + m.d, 0.8 + m.d * 0.5); place(m.o, m.pts, ease(g), m.walk ? Math.abs(Math.sin(t * 9 + k)) * 0.09 : 0.02, u > 0.04 + m.d && show > 0.9); });
  };
}

// ---- Level 3, Homes: the materials are made ------------------------------------------------------------------------
function homesLevel(plate, i) {
  land(plate, (x, z) => (z === 0 ? { c: PAL.sand } : z <= -2 ? { c: PAL.grassDeep } : undefined));
  const plan = group(plate), wall = [PAL.timber, PAL.brick, PAL.concrete][i], amount = [0, 0.55, 1][i];
  for (const x of [-3.9, -1.3, 1.3, 3.9]) house(plan, x, 2.6, { wall: i === 0 ? '#dcae72' : wall, w: 1.5, tall: 1.05, roof: ['#8a5a34', '#7a3526', '#8b8b86'][i] });
  let top = [0, 0, 0], saw = null;
  if (i === 0) { blk(plan, -1, -3, 5, 2.4, 0, 1.3, PAL.timber); blk(plan, -1, -3, 5.3, 2.7, 1.3, 0.2, '#8a5a34'); for (let k = 0; k < 3; k++) blk(plan, 3.2, -3.8 + k * 0.7, 2.2, 0.5, 0, 0.5, '#a9743f');
    blk(plan, 3.2, -3.4, 2.2, 0.5, 0.5, 0.5, '#b98450'); saw = blk(plan, -1, -1.75, 1.1, 0.08, 0.35, 1.1, '#d9dde0'); blk(plan, -4.6, -4.6, 0.16, 0.16, 0, 3, PAL.trunk); blk(plan, -4.6, -4.6, 1.2, 0.1, 2.7, 0.1, PAL.trunk); blk(plan, -3.3, -1.75, 0.5, 0.06, 1.5, 0.5, PAL.sun, { shadow: false }); }
  if (i === 1) { blk(plan, -1, -3, 3.6, 2.6, 0, 1, PAL.brick); blk(plan, -1, -3, 2.8, 2, 1, 0.7, '#a24a33'); blk(plan, -1, -3, 1.8, 1.3, 1.7, 0.5, PAL.brick); blk(plan, -1, -3, 0.7, 0.7, 2.2, 1.3, '#8a3f2c'); top = [-1, 3.5, -3];
    blk(plan, -1, -1.65, 0.9, 0.1, 0, 0.6, '#3a2a22', { shadow: false }); for (let k = 0; k < 4; k++) blk(plan, 2.6 + (k % 2) * 0.9, -3.6 + Math.floor(k / 2) * 0.9, 0.8, 0.8, 0, 0.5, '#c7694a'); }
  if (i === 2) { blk(plan, 0.5, -3, 3, 2.4, 0, 1.6, '#a8a7a1'); for (const x of [-3.4, -2.2]) { blk(plan, x, -3, 1, 1, 0, 3, '#c9c8c2'); blk(plan, x, -3, 1.2, 1.2, 3, 0.2, '#8b8b86'); } blk(plan, 1.3, -3, 0.8, 0.8, 1.6, 2.4, '#8b8b86'); top = [1.3, 4, -3];
    blk(plan, 3.6, -1.9, 1.6, 1.2, 0, 0.6, '#d6d4cc'); }
  const haze = glow(PAL.haze), puffs = [...Array(amount ? Math.round(6 + amount * 16) : 0)].map((_, k) => blk(plate, 0, 0, 1, 1, 0, 1, PAL.haze, { shadow: false, mat: haze }));
  return ({ show, u, t }) => {
    pop(plan, show); if (saw) saw.rotation.z = u > 0.02 && u < 0.98 ? t * 9 : 0;
    puffs.forEach((p, k) => {
      const n = puffs.length, born = 0.06 + (k / n) * 0.6, age = clamp((u - born) / 0.4), drift = hash(k, 7) - 0.5, rise = ease(age), s = (0.35 + rise * (0.5 + amount * 0.9)) * (age > 0 ? 1 : 0);
      p.visible = age > 0 && show > 0.9; p.scale.set(s, s * 0.8, s); p.position.set(top[0] + drift * rise * (2 + amount * 4) + Math.sin(t * 0.7 + k) * 0.08, top[1] + rise * (1.2 + hash(k, 9) * (1 + amount * 2)), top[2] + (hash(k, 11) - 0.5) * rise * 2.4);
    });
  };
}

// ---- Level 4, Food: the food goes to market -----------------------------------------------------------------------
function foodLevel(plate, i) {
  const inM = (x, z) => x >= 1 && x <= 5 && z >= -3 && z <= 0, areas = [[1, 5, -3, 0], [-3, 0, 2, 5], [-5, -2, -5, -2]], a = areas[i];
  const inF = (x, z) => x >= a[0] && x <= a[1] && z >= a[2] && z <= a[3];
  const far = (x, z) => (x === -5 && z >= -5) || (z === 5 && x >= -5 && x <= 3);
  land(plate, (x, z) => (i === 2 && far(x, z) ? { c: PAL.road } : inM(x, z) && i !== 0 ? { c: PAL.grassDeep } : undefined));
  for (const [x, z] of [[2.2, 2.2], [4.4, 2.2], [4.6, 4.4]]) house(plate, x, z, { w: 1.1 });
  blk(plate, 2.6, 4.3, 1.6, 1, 0, 0.5, PAL.timber); blk(plate, 2.6, 4.3, 1.9, 1.3, 1.1, 0.14, '#d9533d'); for (const dx of [-0.8, 0.8]) blk(plate, 2.6 + dx, 4.8, 0.1, 0.1, 0, 1.1, PAL.trunk);
  const plan = group(plate);
  for (let x = a[0]; x <= a[1]; x++) for (let z = a[2]; z <= a[3]; z++) { blk(plan, x, z, 1, 1, 0, 0.06, z & 1 ? PAL.soil : PAL.soilDark, { shadow: false }); blk(plan, x, z, 0.5, 0.5, 0.06, 0.28, '#4f9550'); }
  const wild = group(plate), flowers = [], bees = [];
  if (i !== 0) for (let x = 1; x <= 5; x++) for (let z = -3; z <= 0; z++) for (let k = 0; k < 2; k++) flowers.push(blk(wild, x + hash(x * 3 + k, z) - 0.5, z + hash(z * 5 + k, x) - 0.5, 0.2, 0.2, 0, 0.3, ['#f08ab8', '#ffd257', '#ffffff', '#c98be0'][Math.floor(hash(x + k, z * 7) * 4)], { shadow: false }));
  if (i !== 0) { tree(wild, 4.6, -2.6, 0.8); tree(wild, 1.4, -0.4, 0.7); }
  const yellow = glow('#ffcf2e'); for (let k = 0; k < 9; k++) bees.push(blk(plate, 0, 0, 0.14, 0.14, 0, 0.14, '#ffcf2e', { shadow: false, mat: yellow }));
  const market = [2.6, 3.4], start = [(a[0] + a[1]) / 2, (a[2] + a[3]) / 2];
  const route = i === 0 ? [start, [3, 1], market] : i === 1 ? [start, [0.8, 3.4], market] : [[-5, -3.5], [-5, 5], [1.2, 5], [1.6, 3.6]];
  const mover0 = group(plate), mover = group(mover0); mover.scale.set(1.45, 1.45, 1.45);
  if (i < 2) { blk(mover, 0, 0, 0.9, 0.6, 0.18, 0.28, PAL.timber); for (const [x, c] of [[-0.22, '#e0503a'], [0.02, '#4f9550'], [0.26, '#f4b73b']]) blk(mover, x, 0, 0.2, 0.44, 0.46, 0.2, c); for (const [x, z] of [[-0.28, 0.32], [0.28, 0.32], [-0.28, -0.32], [0.28, -0.32]]) blk(mover, x, z, 0.26, 0.08, 0, 0.26, '#5b4a40'); const p = person(mover, '#3f78b5'); p.position.set(0.7, 0, 0); }
  else { blk(mover, -0.25, 0, 1.3, 0.75, 0.16, 0.85, PAL.white); blk(mover, 0.72, 0, 0.55, 0.7, 0.16, 0.6, '#3f78b5'); blk(mover, -0.25, 0.38, 0.5, 0.03, 0.45, 0.3, '#5cb8e6', { shadow: false }); for (const [x, z] of [[-0.6, 0.4], [0.6, 0.4], [-0.6, -0.4], [0.6, -0.4]]) blk(mover, x, z, 0.28, 0.1, 0, 0.28, '#2a2a2a'); }
  const crates = i === 2 ? [...Array(4)].map(() => blk(plate, 0, 0, 0.4, 0.4, 0, 0.36, '#c8955a')) : [];
  return ({ show, u, t }) => {
    pop(plan, show);
    const go = i === 2 ? ease(span(u, 0.34, 0.97)) : ease(span(u, 0.1, 0.55)); place(mover0, route, go, 0.02, show > 0.9);
    crates.forEach((c, k) => { const h = span(u, 0.05 + k * 0.07, 0.14 + k * 0.07); c.visible = show > 0.9 && h < 1 && u > 0.02; c.position.set(lerp(-3.4, -4.6, ease(h)), 0.2 + Math.sin(h * Math.PI) * 1.1, lerp(-3, -3.5, ease(h))); });
    bees.forEach((b, k) => { const cx = 3 + Math.sin(k * 2.1) * 1.6, cz = -1.5 + Math.cos(k * 1.7) * 1.2, leave = i === 0 ? ease(span(show, 0.3, 1)) : 0;
      b.position.set(cx + Math.sin(t * 1.9 + k) * 0.5 + leave * 7, 0.7 + Math.sin(t * 3.1 + k * 2) * 0.2 + leave * 5, cz + Math.cos(t * 1.6 + k) * 0.5 - leave * 4); b.visible = leave < 0.98; });
  };
}

// ---- Level 5, Power: a dark winter night ---------------------------------------------------------------------------
function powerLevel(plate, i) {
  const H = (x, z) => (x >= 2 && z <= -2 ? (x >= 3 && z <= -3 ? 1.6 : 0.8) : 0);
  land(plate, (x, z) => (H(x, z) ? { c: PAL.grassDeep, h: H(x, z) } : z === 1 ? { c: PAL.sand } : undefined));
  const plan = group(plate), wins = [], spots = [[-4, -3], [-1.5, -3], [-4, -0.7], [-1.5, -0.7], [1, -0.7], [-4, 3.2], [-1.5, 3.2], [1, 3.2], [3.6, 3.2]];
  spots.forEach(([x, z], k) => { const m = glow('#33405c'); wins.push(m); house(plan, x, z, { w: 1.3, tall: 1.15, winMat: m, solar: i === 0 || (i === 2 && k % 2 === 0) }); });
  const turbs = (i === 1 ? [[2.4, -4.6], [4.6, -4.6], [3.4, -2.8], [5, -2.6]] : i === 2 ? [[3.2, -4.4], [4.8, -3]] : []).map(([x, z]) => turbine(plan, x, z, H(Math.round(x), Math.round(z)), 0.85));
  let lamp = null; if (i === 2) { blk(plan, 3.8, 0.2, 1.5, 1, 0, 1.2, PAL.white); blk(plan, 3.8, 0.2, 1.6, 1.1, 1.2, 0.12, '#2e9b5a'); lamp = glow('#2e9b5a'); for (let k = 0; k < 3; k++) blk(plan, 3.3 + k * 0.5, 0.72, 0.3, 0.05, 0.25 + 0, 0.7, '#2e9b5a', { shadow: false, mat: lamp }); }
  const on = new THREE.Color('#ffd257'), off = new THREE.Color('#33405c'), dim = new THREE.Color('#1b2233');
  return ({ show, u, t }) => {
    pop(plan, show); turbs.forEach((tb, k) => { tb.hub.rotation.z = t * (i === 1 ? 2.6 : 2.2) + k; });
    const dark = ease(span(u, 0.08, 0.4)), lit = span(u, 0.3, 0.42);
    wins.forEach((m, k) => {
      let c = off.clone().lerp(on, lit > k / wins.length * 0.8 ? 1 : 0);
      if (i === 0 && u > 0.55) { const fl = span(u, 0.55, 0.75); c = (fl < 1 && Math.sin(t * 30 + k * 2) > fl * 2 - 1) ? on.clone() : dim.clone(); }
      if (dark < 0.3) c = off.clone(); m.color.copy(c);
    });
    if (lamp) lamp.color.set(Math.sin(t * 4) > -0.3 ? '#7dffa8' : '#2e9b5a');
  };
}

// ---- Level 6, A school for everyone: the bell rings ---------------------------------------------------------------
function schoolLevel(plate, i) {
  land(plate, (x, z) => (z === 1 ? { c: PAL.sand } : z === 2 ? { c: PAL.road } : x >= 3 && z <= -1 ? { c: z & 1 ? PAL.soil : PAL.soilDark } : x <= -2 && z <= -3 ? { c: PAL.grassDeep } : undefined));
  const town = [[-4.6, -0.6], [-3.1, -1.8], [-4.4, 3.8], [-2.6, 3.9]], farm = [[3.2, 3.9], [4.8, 0.2], [4.9, 3.9]];
  town.forEach(([x, z]) => house(plate, x, z, { w: 1.1 })); farm.forEach(([x, z]) => house(plate, x, z, { w: 1.1, wall: PAL.timber, roof: '#8a5a34' }));
  for (const [x, z] of [[-4.5, -4.5], [-3, -4.2], [-2.2, -3.3]]) tree(plate, x, z, 0.85);
  for (let x = 3; x <= 5; x++) for (const z of [-4, -2]) blk(plate, x, z, 0.5, 0.5, 0, 0.3, '#4f9550');
  const sx = [-3.4, -0.9, 0.6][i], sz = i === 1 ? -2.6 : -0.9, plan = group(plate, sx, 0, sz);
  blk(plan, 0, 0, 2.3, 1.5, 0, 1.2, '#ffe9a8'); blk(plan, 0, 0, 2.6, 1.8, 1.2, 0.22, '#d9533d'); blk(plan, 0, 0, 1.6, 1.8, 1.42, 0.2, '#d9533d'); blk(plan, 0, 0.76, 0.5, 0.05, 0, 0.7, PAL.trunk, { shadow: false });
  for (const dx of [-0.75, 0.75]) blk(plan, dx, 0.76, 0.4, 0.05, 0.45, 0.4, PAL.glass, { shadow: false });
  blk(plan, 1.4, 0.6, 0.08, 0.08, 0, 2.4, PAL.white); const flag = blk(plan, 1.75, 0.6, 0.6, 0.05, 1.95, 0.4, '#f4b73b', { shadow: false });
  const bell = blk(plan, 0, 0, 0.4, 0.4, 1.62, 0.5, PAL.sun);
  const drives = [[4, 5, 6], [5, 6], []][i], door = [sx, sz + 1.1];
  const kids = [...town, ...farm].map(([x, z], k) => { const walk = !drives.includes(k), lane = walk ? 1 : 2;
    return { walk, o: walk ? person(plate, KID[k]) : car(plate, KID[k]), pts: [[x, z + (z > lane ? -0.8 : 0.8)], [x, lane], [sx, lane], door], d: (k % 4) * 0.04 }; });
  return ({ show, u, t }) => {
    pop(plan, show); flag.scale.x = 0.6 + Math.sin(t * 5) * 0.06; bell.rotation.z = u > 0.01 && u < 0.3 ? Math.sin(t * 22) * 0.5 : 0;
    kids.forEach((m, k) => { const g = span(u, 0.1 + m.d, 0.85 + m.d); place(m.o, m.pts, ease(g), m.walk ? Math.abs(Math.sin(t * 9 + k)) * 0.09 : 0.02, u > 0.09 + m.d && g < 0.999 && show > 0.9); });
  };
}

export const builders = [landLevel, streetsLevel, homesLevel, foodLevel, powerLevel, schoolLevel];
// how dark the sky is during the test, for the level where night falls
export const nightOf = (li, u) => (li === 4 ? ease(span(u, 0.08, 0.4)) : 0);
// the place on the chosen plate that the sample child taps in the recap: [x, height, z]
export const points = [[4.5, 2.4, 0], [0.5, 0.5, 0], [-1, 1.4, -3], [3, 0.5, -1.5], [3.8, 1.2, 0.2], [0.6, 1.2, -0.9]];
