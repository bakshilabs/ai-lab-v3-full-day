// The start page's living island (start.html, loaded by js/hub.js after the first paint). A light voxel Eco Town in
// the game's palette: it builds itself, turbines turn, a drone delivers, a robot weeds, cars go round, and the camera
// glides to each part of the day as the page scrolls. three.js only (no game engine), about 3,500 boxes in a few
// draw calls. It sends nothing and stores nothing. The page decides when it runs (start/stop) and which part is shown.
import * as THREE from '../../vendor/three.module.min.js';

const C = (h) => new THREE.Color(h);
const PAL = {
  grass: ['#8fcf73', '#86c86b', '#9bd57e', '#7ec064'], grassDeep: '#6fb257', sand: '#ecd29a', water: '#5cb8e6', waterDeep: '#49a6d8',
  road: '#8d8378', soil: '#b98a55', soilDark: '#a27443',
  rock: ['#e8b77c', '#dfa76b', '#d4975e', '#c98a55', '#bd7d4b', '#b07145', '#a2663f'],
  wall: ['#fff4dc', '#fbecd0', '#f6e1bd'], timber: '#c9925a', roof: ['#c8643f', '#b5553a', '#d0774a'], green: '#5aa35a', solar: '#2f4f8f', frame: '#e8e2d6',
  leaf: ['#5fa35a', '#4f9550', '#74b56a'], trunk: '#7a5a33', fruit: '#e0503a', white: '#fbfbf7', navy: '#2b3a55', sun: '#ffd257', parcel: '#c8955a',
};
const rand = (s => () => ((s = (s * 16807) % 2147483647) / 2147483647))(20261118);
const easeBack = (t) => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

export function createIsland(canvas, { reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: (window.devicePixelRatio || 1) < 2, powerPreference: 'default', preserveDrawingBuffer: false });
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr); renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 400);
  scene.add(new THREE.HemisphereLight('#fff6e8', '#8a7a5a', 1.55));
  const sun = new THREE.DirectionalLight('#fff0d0', 2.1); sun.position.set(-18, 34, 20); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 18, bottom: -18, near: 1, far: 90 }); sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const world = new THREE.Group(); scene.add(world);

  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const mats = new Map(); const mat = (h) => { if (!mats.has(h)) mats.set(h, new THREE.MeshLambertMaterial({ color: h })); return mats.get(h); };
  const box = (parent, w, h, d, x, y, z, color, shadow = true) => { const m = new THREE.Mesh(BOX, mat(color)); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
  // bake a group's still boxes into one mesh with vertex colours: one draw call per build, not one per box
  const VC = new THREE.MeshLambertMaterial({ vertexColors: true }), CLOUD = new THREE.MeshBasicMaterial({ vertexColors: true });
  const bake = (g, keep = [], material = VC) => {
    const parts = g.children.filter((c) => c.isMesh && !keep.includes(c)); if (parts.length < 2) return g;
    let n = 0; const geos = parts.map((m) => { m.updateMatrix(); const ge = m.geometry.toNonIndexed().applyMatrix4(m.matrix); n += ge.attributes.position.count; return [ge, m.material.color]; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
    for (const [ge, c] of geos) { const cnt = ge.attributes.position.count; pos.set(ge.attributes.position.array, o * 3); nor.set(ge.attributes.normal.array, o * 3); for (let i = o; i < o + cnt; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } o += cnt; ge.dispose(); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mesh = new THREE.Mesh(geo, material); mesh.castShadow = material !== CLOUD && parts.some((p) => p.castShadow); mesh.receiveShadow = material !== CLOUD;
    parts.forEach((p) => g.remove(p)); g.add(mesh); return g;
  };
  const pops = []; // things that build themselves: { o, at, s }
  const pop = (o, at) => { pops.push({ o, at, s: o.scale.clone() }); o.scale.setScalar(0.0001); return o; };

  // ---------- the ground: one instanced mesh of voxels (grass top, river, road, field, sandstone layers below)
  const GX = 15, GZ = 11; const cells = [];
  const wob = (x, z) => Math.sin(x * 0.63 + z * 0.31) * 0.05 + Math.sin(z * 0.87 - x * 0.41) * 0.05;
  const inside = (x, z, s) => (x / (GX * s)) ** 2 + (z / (GZ * s)) ** 2 + wob(x, z) < 1;
  const riverX = (z) => -3.2 + Math.sin(z * 0.33) * 2.2;
  const onRoad = (x, z) => ((x === 1 || x === 12) && z >= -8 && z <= 5) || ((z === -8 || z === 5) && x >= 1 && x <= 12);
  const zone = (x, z) => {
    const cx = x + 0.5, cz = z + 0.5;
    if (Math.abs(cx - riverX(cz)) < 1.15) return 'water';
    if (Math.abs(cx - riverX(cz)) < 1.9) return 'sand';
    if (onRoad(x, z)) return 'road';
    if (x >= -13 && x <= -7 && z >= 1 && z <= 8) return (z % 2 ? 'soil' : 'soilDark');
    if (x >= -13 && x <= -6 && z >= -8 && z <= -2) return 'deep';
    return 'grass';
  };
  for (let x = -GX - 1; x <= GX; x++) for (let z = -GZ - 1; z <= GZ; z++) {
    if (!inside(x + 0.5, z + 0.5, 1)) continue;
    const zn = zone(x, z); const top = zn === 'water' ? -0.38 : 0;
    const col = zn === 'water' ? PAL.water : zn === 'sand' ? PAL.sand : zn === 'road' ? PAL.road : zn === 'soil' ? PAL.soil : zn === 'soilDark' ? PAL.soilDark : zn === 'deep' ? PAL.grassDeep : PAL.grass[Math.floor(rand() * 4)];
    cells.push([x + 0.5, top - 0.5, z + 0.5, col]);
    for (let d = 1; d <= 11; d++) {
      const s = 1 - d * 0.082 + Math.sin(x * 1.3 + d) * 0.02;
      if (!inside(x + 0.5, z + 0.5, s)) break;
      // only the outer shell is ever seen: skip voxels with neighbours all round on the layer below
      const inner = inside(x + 1.5, z + 0.5, s - 0.09) && inside(x - 0.5, z + 0.5, s - 0.09) && inside(x + 0.5, z + 1.5, s - 0.09) && inside(x + 0.5, z - 0.5, s - 0.09);
      if (inner && d < 11 && d > 1) continue;
      cells.push([x + 0.5, top - 0.5 - d, z + 0.5, PAL.rock[Math.min(PAL.rock.length - 1, Math.floor(d * 0.62 + rand() * 0.8))]]);
    }
  }
  const ground = new THREE.InstancedMesh(BOX, new THREE.MeshLambertMaterial({ color: '#ffffff' }), cells.length);
  const m4 = new THREE.Matrix4();
  cells.forEach(([x, y, z, c], i) => { m4.makeTranslation(x, y, z); ground.setMatrixAt(i, m4); ground.setColorAt(i, C(c)); });
  ground.receiveShadow = true; ground.castShadow = true; world.add(ground);
  // the river spills off the edge: a small waterfall of falling blocks
  const fallsX = riverX(GZ - 1) + 0.2, fallsZ = GZ - 0.6;
  const drops = new THREE.InstancedMesh(BOX, new THREE.MeshLambertMaterial({ color: '#8fd3f4' }), 26); drops.castShadow = false; world.add(drops);
  const dropSeed = Array.from({ length: 26 }, () => [rand() * 1.6 - 0.8, rand(), 0.35 + rand() * 0.3]);

  // ---------- builds
  const houses = [], trees = [], crops = [];
  const house = (x, z, i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = (i % 2) * Math.PI / 2; world.add(g);
    const wall = PAL.wall[i % 3]; const tall = i % 3 === 1 ? 2.1 : 1.45;
    box(g, 1.9, tall, 1.9, 0, tall / 2, 0, i % 4 === 2 ? PAL.timber : wall);
    const roof = box(g, 1.45, 1.45, 2.15, 0, tall, 0, i % 5 === 3 ? PAL.green : PAL.roof[i % 3]); roof.rotation.z = Math.PI / 4;
    box(g, 0.42, 0.75, 0.06, 0.4, 0.38, 0.97, '#7a5a33', false);
    box(g, 0.42, 0.38, 0.06, -0.45, tall * 0.62, 0.97, '#9fd0f5', false);
    if (i % 3 === 0) { const p = box(g, 0.08, 0.9, 1.7, 0.55, tall + 0.48, 0, PAL.solar, false); p.rotation.z = Math.PI / 4; }
    bake(g); houses.push(g); return g;
  };
  [[4, -5.5], [7.2, -5.5], [10, -5], [4, -2.2], [7.5, -2], [4.2, 1.6], [7.3, 2], [10, 1.2], [10.2, -2.3]].forEach(([x, z], i) => house(x, z, i));
  const tree = (x, z, fruit, k = 1) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    box(g, 0.3, 0.9, 0.3, 0, 0.45, 0, PAL.trunk);
    box(g, 1.25 * k, 1.05 * k, 1.25 * k, 0, 1.25, 0, PAL.leaf[Math.floor(rand() * 3)]);
    box(g, 0.8 * k, 0.6 * k, 0.8 * k, 0.1, 1.95, -0.05, PAL.leaf[2], false);
    if (fruit) for (const [a, b, c] of [[0.6, 1.3, 0.2], [-0.5, 1.5, 0.55], [0.2, 1.1, -0.62]]) box(g, 0.2, 0.2, 0.2, a, b, c, PAL.fruit, false);
    bake(g); trees.push(g); return g;
  };
  for (let x = -12.5; x <= -7; x += 2.2) for (let z = -7.5; z <= -2.5; z += 2.4) tree(x + (rand() - 0.5) * 0.4, z, true, 0.9);
  [[-1, -9], [2.5, 8], [-1.5, 6.5], [13.5, -1], [-6, 9], [6.5, 8.5], [-14, 1.5], [0.5, -4], [13.6, 3.6], [-0.2, 2.5]].forEach(([x, z]) => tree(x, z, false, 1.1));
  // crops for the field (the robot's job)
  const cropMesh = new THREE.InstancedMesh(BOX, new THREE.MeshLambertMaterial({ color: '#ffffff' }), 64); cropMesh.castShadow = true; world.add(cropMesh);
  let ci = 0; for (let z = 1; z <= 8; z += 2) for (let x = -12.6; x <= -7; x += 0.75) if (ci < 64) { crops.push([x, z + 0.5]); cropMesh.setColorAt(ci++, C(z % 4 === 1 ? '#7cc04a' : '#e2c04a')); }
  cropMesh.count = ci; let cropT0 = 1.2, cropInit = false;
  // wind turbines
  const blades = [];
  const turbine = (x, z, h, ph) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.24, h, 8), mat(PAL.white)); tower.position.y = h / 2; tower.castShadow = true; g.add(tower);
    box(g, 0.45, 0.4, 0.8, 0, h, 0.05, PAL.white);
    const hub = new THREE.Group(); hub.position.set(0, h, 0.5); g.add(hub);
    for (let k = 0; k < 3; k++) { const a = (k * Math.PI * 2) / 3; box(hub, 0.2, 2.9, 0.07, -Math.sin(a) * 1.5, Math.cos(a) * 1.5, 0, PAL.white).rotation.z = a; }
    box(hub, 0.3, 0.3, 0.3, 0, 0, 0.05, PAL.white, false); bake(hub); bake(g); g.rotation.y = 0.5; blades.push([hub, ph]); return g;
  };
  const turbines = [turbine(-10.5, -0.6, 7.5, 0), turbine(12.5, 7, 6.5, 1), turbine(-5.5, -9, 6.8, 2)];
  // the drone's pad and the drone
  box(world, 1.6, 0.12, 1.6, 9.5, 0.06, 8, PAL.sun, false); box(world, 1.0, 0.13, 0.2, 9.5, 0.07, 8, PAL.navy, false);
  const drone = new THREE.Group(); world.add(drone);
  box(drone, 0.8, 0.28, 0.8, 0, 0, 0, PAL.sun); box(drone, 1.9, 0.08, 0.12, 0, 0.05, 0, PAL.navy, false).rotation.y = Math.PI / 4; box(drone, 1.9, 0.08, 0.12, 0, 0.05, 0, PAL.navy, false).rotation.y = -Math.PI / 4;
  const rotors = [[0.67, 0.67], [-0.67, 0.67], [0.67, -0.67], [-0.67, -0.67]].map(([a, b]) => { const r = box(drone, 0.75, 0.03, 0.12, a, 0.14, b, '#3b4a66', false); return r; });
  box(drone, 0.04, 0.5, 0.04, 0, -0.38, 0, PAL.trunk, false); const parcel = box(drone, 0.5, 0.42, 0.5, 0, -0.82, 0, PAL.parcel); bake(drone, [...rotors, parcel]);
  const dronePath = new THREE.CatmullRomCurve3([[9.5, 1.2, 8], [9.5, 6, 6], [6, 6.8, 1], [4.2, 4.2, 1.6], [3, 6.5, -4], [-2, 7.2, -6], [-9, 7.5, -4], [-6, 6.5, 4], [2, 6.2, 7.5], [8, 4, 8.5]].map((p) => new THREE.Vector3(...p)), true, 'catmullrom', 0.4);
  // the weeding robot
  const robot = new THREE.Group(); world.add(robot);
  box(robot, 0.9, 0.55, 0.7, 0, 0.55, 0, PAL.navy); box(robot, 0.55, 0.42, 0.5, 0, 1.05, 0, '#e9eef5');
  box(robot, 0.12, 0.12, 0.05, -0.12, 1.08, 0.26, '#2b3a55', false); box(robot, 0.12, 0.12, 0.05, 0.12, 1.08, 0.26, '#2b3a55', false);
  box(robot, 0.06, 0.35, 0.06, 0, 1.42, 0, PAL.navy, false); box(robot, 0.14, 0.14, 0.14, 0, 1.62, 0, PAL.sun, false);
  for (const [a, b] of [[0.38, 0.32], [-0.38, 0.32], [0.38, -0.32], [-0.38, -0.32]]) box(robot, 0.26, 0.3, 0.14, a, 0.2, b, '#3b2a1e', false);
  const arm = new THREE.Group(); arm.position.set(0.48, 0.7, 0); robot.add(arm); box(arm, 0.1, 0.1, 0.7, 0, 0, 0.3, PAL.sun, false); box(arm, 0.22, 0.22, 0.12, 0, 0, 0.66, PAL.navy, false); bake(arm); bake(robot);
  // cars on the ring road
  const cars = ['#2e9b5a', '#e0a43a', '#4f7fc4'].map((c, i) => {
    const g = new THREE.Group(); world.add(g);
    box(g, 1.15, 0.38, 0.62, 0, 0.36, 0, c); box(g, 0.62, 0.32, 0.56, -0.05, 0.7, 0, '#cfe9f7');
    for (const [a, b] of [[0.36, 0.3], [-0.36, 0.3], [0.36, -0.3], [-0.36, -0.3]]) box(g, 0.28, 0.28, 0.1, a, 0.17, b, '#3b2a1e', false);
    bake(g); return { g, off: i / 3 };
  });
  const loop = [[1.5, -7.5], [12.5, -7.5], [12.5, 5.5], [1.5, 5.5]]; const legs = loop.map((p, i) => { const q = loop[(i + 1) % 4]; return Math.hypot(q[0] - p[0], q[1] - p[1]); }); const LEN = legs.reduce((a, b) => a + b, 0);
  const onLoop = (u) => { let d = (((u % 1) + 1) % 1) * LEN; for (let i = 0; i < 4; i++) { if (d <= legs[i]) { const p = loop[i], q = loop[(i + 1) % 4], k = d / legs[i]; return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, Math.atan2(-(q[1] - p[1]), q[0] - p[0])]; } d -= legs[i]; } return [loop[0][0], loop[0][1], 0]; };
  // clouds
  const clouds = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group(); const a = (i / 6) * Math.PI * 2; const r = 23 + rand() * 9; g.userData = { a, r, y: -9 + rand() * 6, s: 0.02 + rand() * 0.02 };
    for (let k = 0; k < 4; k++) box(g, 2 + rand() * 2, 1 + rand(), 1.6 + rand() * 1.4, k * 1.3 - 2, rand() * 0.6, rand() - 0.5, PAL.white, false);
    bake(g, [], CLOUD); world.add(g); clouds.push(g);
  }

  // the build order: land first, then homes, trees, turbines, then the machines
  houses.forEach((h, i) => pop(h, 0.25 + i * 0.09)); trees.forEach((t, i) => pop(t, 0.6 + i * 0.035)); turbines.forEach((t, i) => pop(t, 1.0 + i * 0.15));
  pop(drone, 1.5); pop(robot, 1.6); cars.forEach((c, i) => pop(c.g, 1.7 + i * 0.1));
  world.scale.setScalar(0.92); world.position.y = -2;

  // ---------- the camera: one framing per part of the day; the page picks the part, the camera glides there
  const SHOTS = {
    hero: { t: [1.5, -2.5, 0.5], r: 40, phi: 1.14, th: 0.62 },
    town: { t: [7, 0, -1.8], r: 25, phi: 1.0, th: 0.95 },
    drone: { follow: 'drone', r: 21, phi: 1.12, th: 0.4 },
    robots: { follow: 'robot', r: 18, phi: 1.0, th: -0.35 },
    roads: { follow: 'car', r: 20, phi: 1.02, th: 1.4 },
  };
  let shot = 'hero'; const cam = { t: new THREE.Vector3(1.5, -1.5, 0.5), r: 70, phi: 1.2, th: 0.2, sx: 0, sy: 0 };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }; let heroP = 0, zoom = 1, shift = { x: 0, y: 0 }; let orbit = 0;
  const tmp = new THREE.Vector3(), wp = new THREE.Vector3(), Q0 = new THREE.Quaternion();
  let W = 1, H = 1; let T = 0, last = 0, running = false, raf = 0, ema = 0.016, frames = 0, downgraded = false;

  function resize() {
    const r = canvas.getBoundingClientRect(); W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
  }
  function animate(dt) {
    T += dt;
    for (const p of pops) { const k = easeBack((T - p.at) / 0.7); p.o.scale.set(p.s.x * k + 1e-4, p.s.y * k + 1e-4, p.s.z * k + 1e-4); }
    for (const [hub, ph] of blades) hub.rotation.z = -T * (1.3 + ph * 0.25) - ph;
    // drone: round its delivery route, rotors a blur, a gentle bob
    const u = (T * 0.022) % 1; dronePath.getPointAt(u, tmp); drone.position.copy(tmp); drone.position.y += Math.sin(T * 2.4) * 0.15;
    dronePath.getPointAt((u + 0.01) % 1, wp); drone.rotation.y = Math.atan2(wp.x - tmp.x, wp.z - tmp.z); drone.rotation.z = Math.sin(T * 1.3) * 0.05;
    rotors.forEach((r, i) => { r.rotation.y = T * 30 * (i % 2 ? 1 : -1); }); parcel.rotation.y = Math.sin(T) * 0.2;
    // robot: up and down the rows, its arm busy
    const row = Math.floor(T / 7) % 4; const ph = (T % 7) / 7; const dir = row % 2 ? -1 : 1; const px = dir > 0 ? -12.8 + ph * 5.8 : -7 - ph * 5.8;
    robot.position.set(px, 0, 1.5 + row * 2 - 0.05); robot.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; arm.rotation.x = Math.sin(T * 6) * 0.35;
    // crops grow
    if (T - cropT0 < 3 || !cropInit) { cropInit = true; crops.forEach(([x, z], i) => { const g = easeBack((T - cropT0 - i * 0.02) / 0.6); m4.compose(wp.set(x, 0.25 * g, z), Q0, tmp.set(0.4, 0.5 * g + 1e-4, 0.4)); cropMesh.setMatrixAt(i, m4); });
    cropMesh.instanceMatrix.needsUpdate = true; }
    for (const c of cars) { const [x, z, a] = onLoop(T * 0.035 + c.off); c.g.position.set(x, 0, z); c.g.rotation.y = a; }
    for (const g of clouds) { const d = g.userData; d.a += d.s * dt; g.position.set(Math.cos(d.a) * d.r, d.y, Math.sin(d.a) * d.r * 0.7); }
    for (let i = 0; i < dropSeed.length; i++) { const [ox, ph0, s] = dropSeed[i]; const f = (ph0 + T * 0.45) % 1; m4.compose(wp.set(fallsX + ox, -0.5 - f * 9, fallsZ + f * 0.6), Q0, tmp.setScalar(s * (1 - f * 0.6))); drops.setMatrixAt(i, m4); }
    drops.instanceMatrix.needsUpdate = true;
  }
  function frameCamera(dt) {
    const s = SHOTS[shot]; let target;
    if (s.follow === 'drone') target = tmp.copy(drone.position).multiplyScalar(world.scale.x).add(world.position);
    else if (s.follow === 'robot') target = tmp.copy(robot.position).multiplyScalar(world.scale.x).add(world.position);
    else if (s.follow === 'car') target = tmp.copy(cars[0].g.position).multiplyScalar(world.scale.x).add(world.position);
    else target = tmp.set(...s.t);
    const k = reduced ? 60 : 2.3;
    cam.t.x = damp(cam.t.x, target.x, k, dt); cam.t.y = damp(cam.t.y, target.y, k, dt); cam.t.z = damp(cam.t.z, target.z, k, dt);
    cam.r = damp(cam.r, s.r * zoom * (1 + (shot === 'hero' ? heroP * 0.35 : 0)), k, dt); cam.phi = damp(cam.phi, s.phi - (shot === 'hero' ? heroP * 0.12 : 0), k, dt);
    orbit += dt * (reduced ? 0 : shot === 'hero' ? 0.045 : 0.025);
    cam.th = damp(cam.th, s.th, k * 0.7, dt);
    pointer.x = damp(pointer.x, pointer.tx, 3, dt); pointer.y = damp(pointer.y, pointer.ty, 3, dt);
    const th = cam.th + orbit + pointer.x * 0.22, phi = Math.min(1.35, Math.max(0.55, cam.phi + pointer.y * 0.07));
    camera.position.set(cam.t.x + cam.r * Math.sin(phi) * Math.sin(th), cam.t.y + cam.r * Math.cos(phi), cam.t.z + cam.r * Math.sin(phi) * Math.cos(th));
    camera.lookAt(cam.t);
    cam.sx = damp(cam.sx, shift.x, k, dt); cam.sy = damp(cam.sy, shift.y, k, dt);
    camera.setViewOffset(W, H, -cam.sx * W, -cam.sy * H, W, H);
  }
  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const raw = Math.min(0.25, (now - (last || now)) / 1000); const dt = raw; last = now; // real time, so a slow device still builds in about two seconds
    animate(reduced ? 0 : dt); frameCamera(raw || 0.016); renderer.render(scene, camera);
    // a slow device gets fewer pixels and no shadows, once
    ema = ema * 0.95 + dt * 0.05; frames++;
    if (!downgraded && frames > 90 && ema > 0.034) { downgraded = true; dpr = 1; renderer.setPixelRatio(1); renderer.shadowMap.enabled = false; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); resize(); }
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
  if (reduced) T = 5; // everything already built

  return {
    start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(raf); },
    setShot(name) { if (!SHOTS[name] || name === shot) return; shot = name;
      // the part's own things build again as the camera arrives
      if (!reduced) { const again = name === 'town' ? houses : name === 'roads' ? cars.map((c) => c.g) : name === 'drone' ? [drone] : name === 'robots' ? [robot] : [];
        for (const p of pops) if (again.includes(p.o)) { const i = again.indexOf(p.o); p.at = T + 0.35 + i * 0.08; } if (name === 'robots') { cropT0 = T + 0.3; } } },
    setPointer(x, y) { pointer.tx = x; pointer.ty = y; },
    setHero(p) { heroP = p; },
    setShift(x, y, z = 1) { shift = { x, y }; zoom = z; },
    // for still pictures: jump straight to a shot at a given time
    still(name, t = 8) { shot = name; T = t; animate(0); for (let i = 0; i < 400; i++) frameCamera(0.05); renderer.render(scene, camera); },
    dispose() { this.stop(); ro.disconnect(); renderer.dispose(); },
  };
}
