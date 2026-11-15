// Robot training: the robot at work in the town, in 3D. A small voxel robot, a row of bins, a pallet of things and
// a "help" crate, all standing on one tile. Used for the module's last scene (run) and for the town afterwards (show).
// three.js comes from the engine the loader hands over (engine.THREE), so this file also loads where there is no 3D.
import { binById, kind } from './learn.js';
import { COLOURS } from './pictures.js';

// Town scenes left by show(). The module hides them while it plays its own street scene on the same tile.
const live = new Set();
export const hideTownShows = (hide) => { for (const g of live) g.visible = !hide; };

function kit(THREE) {
  const geos = []; const mats = new Map();
  const mat = (c) => { if (!mats.has(c)) { const col = new THREE.Color(c); mats.set(c, new THREE.MeshLambertMaterial({ color: col, emissive: col, emissiveIntensity: 0.12 })); } return mats.get(c); };
  const box = (parent, w, h, d, c, x = 0, y = 0, z = 0) => { const g = new THREE.BoxGeometry(w, h, d); geos.push(g); const m = new THREE.Mesh(g, mat(c)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  return { mat, box, dispose() { for (const g of geos) g.dispose(); for (const m of mats.values()) m.dispose(); } };
}
function buildRobot(THREE, k) {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  for (const x of [-0.46, 0.46]) { k.box(g, 0.3, 0.3, 1.15, '#3b4656', x, 0.15, 0); k.box(g, 0.32, 0.1, 0.8, '#232b36', x, 0.33, 0); }
  k.box(body, 0.9, 0.75, 0.8, '#fff7e6', 0, 0.76, 0); k.box(body, 0.92, 0.14, 0.82, '#16c79a', 0, 0.52, 0); k.box(body, 0.42, 0.3, 0.04, '#2e9b5a', 0, 0.86, 0.41);
  k.box(body, 0.26, 0.14, 0.26, '#b9c2cb', 0, 1.2, 0);
  const head = new THREE.Group(); head.position.set(0, 1.5, 0); body.add(head);
  k.box(head, 0.78, 0.5, 0.62, '#16c79a'); k.box(head, 0.6, 0.32, 0.04, '#243447', 0, 0, 0.32);
  for (const x of [-0.15, 0.15]) k.box(head, 0.13, 0.13, 0.03, '#bfeaff', x, 0.03, 0.345);
  for (const x of [-0.43, 0.43]) k.box(head, 0.08, 0.2, 0.2, '#b9c2cb', x, 0, 0);
  k.box(head, 0.05, 0.22, 0.05, '#3b2a1e', 0, 0.36, 0); const ball = k.box(head, 0.14, 0.14, 0.14, '#f08a2c', 0, 0.52, 0);
  for (const x of [-0.52, 0.52]) { k.box(body, 0.12, 0.14, 0.7, '#b9c2cb', x, 0.86, 0.3); k.box(body, 0.16, 0.2, 0.12, '#3b4656', x * 0.86, 0.86, 0.68); }
  const hold = new THREE.Group(); hold.position.set(0, 0.92, 0.74); body.add(hold);
  return { g, body, head, hold, ball };
}
function itemMesh(THREE, k, id) {
  const it = kind(id); const c = COLOURS[it?.f.colour] || '#cccccc'; const s = it?.f.shape; const g = new THREE.Group();
  if (s === 'bottle') { k.box(g, 0.18, 0.34, 0.18, c, 0, 0.17, 0); k.box(g, 0.09, 0.14, 0.09, c, 0, 0.41, 0); }
  else if (s === 'jar') { k.box(g, 0.26, 0.28, 0.26, c, 0, 0.14, 0); k.box(g, 0.22, 0.06, 0.22, '#8d98a3', 0, 0.31, 0); }
  else if (s === 'flat') k.box(g, 0.42, 0.06, 0.32, c, 0, 0.03, 0);
  else if (s === 'box') { k.box(g, 0.38, 0.26, 0.34, c, 0, 0.13, 0); if (it.f.state === 'greasy') k.box(g, 0.2, 0.02, 0.16, '#6b4420', 0, 0.27, 0); }
  else if (s === 'lamp') { k.box(g, 0.24, 0.04, 0.24, '#8d98a3', 0, 0.02, 0); k.box(g, 0.05, 0.3, 0.05, '#3b2a1e', 0, 0.19, 0); k.box(g, 0.28, 0.18, 0.28, c, 0, 0.42, 0); }
  else if (s === 'toy') { k.box(g, 0.24, 0.26, 0.18, c, 0, 0.13, 0); k.box(g, 0.2, 0.18, 0.18, c, 0, 0.35, 0); }
  else k.box(g, 0.26, 0.2, 0.24, c, 0, 0.1, 0);
  return g;
}

// Build the scene on one tile. sp: from spot.js. binIds: which bins stand there. Returns null when the tile is gone.
// town: the version left in the town, seen from far above: a bigger robot and a flag to find it by.
export function buildScene(engine, sp, binIds, { still = false, town = false } = {}) {
  let top = null; try { top = engine.world.tileTop(sp.key); } catch { top = null; } if (!top) return null;
  const THREE = engine.THREE; const k = kit(THREE); const outer = new THREE.Group(); outer.position.copy(top); outer.rotation.y = Math.atan2(sp.look[0], sp.look[1]); // the scene's front faces the camera side
  k.box(outer, 5.6, 0.3, 5.0, '#d9ccb0', 0, 0.15, -0.1); k.box(outer, 5.3, 0.04, 4.7, '#e6dcc4', 0, 0.31, -0.1);  // a paved yard, a step above the ground
  const g = new THREE.Group(); g.position.y = 0.32; outer.add(g);
  const n = binIds.length; const binAt = new Map(); const BZ = -1.6;
  binIds.forEach((id, i) => { const b = binById(id); const x = 0.55 + (i - (n - 1) / 2) * 1.05; const bg = new THREE.Group(); bg.position.set(x, 0, BZ); g.add(bg);
    k.box(bg, 0.78, 0.8, 0.7, b.colour, 0, 0.4, 0); k.box(bg, 0.86, 0.1, 0.78, '#3b2a1e', 0, 0.85, 0); k.box(bg, 0.36, 0.3, 0.03, '#fffaf0', 0, 0.46, 0.36); binAt.set(id, { x, n: 0 }); });
  const pile = { x: -2.0, z: 0.0 }; const help = { x: 1.95, z: 1.2, n: 0 }; const home = { x: -0.95, z: 1.3 };
  k.box(g, 0.9, 0.1, 0.8, '#b98a52', pile.x, 0.05, pile.z);                                       // the pallet the things arrive on
  k.box(g, 0.8, 0.34, 0.7, '#f4b73b', help.x, 0.17, help.z); k.box(g, 0.82, 0.08, 0.3, '#fffaf0', help.x, 0.24, help.z + 0.21); // the crate for things to ask a person about
  const robot = buildRobot(THREE, k); robot.g.position.set(home.x, 0, home.z); g.add(robot.g);
  if (town) { robot.g.scale.setScalar(1.35); k.box(g, 0.12, 3.6, 0.12, '#3b2a1e', -2.3, 1.8, BZ); k.box(g, 1.1, 0.7, 0.06, '#2e9b5a', -1.72, 3.2, BZ); k.box(g, 0.34, 0.34, 0.08, '#fffaf0', -1.72, 3.2, BZ); }
  engine.scene.add(outer);
  const acts = []; let clock = 0;
  const drive = (x, z, dur, end) => acts.push({ x, z, dur: still ? 0 : dur, end });
  function update(dt) {
    clock += dt; const a = acts[0];
    if (!still) robot.head.rotation.z = a ? 0 : Math.sin(clock * 1.3) * 0.05;
    if (!a) return;
    if (a.t === undefined) { a.t = 0; a.fx = robot.g.position.x; a.fz = robot.g.position.z; const dx = a.x - a.fx; const dz = a.z - a.fz; if (Math.abs(dx) + Math.abs(dz) > 0.01) robot.g.rotation.y = Math.atan2(dx, dz); }
    a.t += dt; const q = a.dur > 0 ? Math.min(1, a.t / a.dur) : 1; const e = q * q * (3 - 2 * q);
    robot.g.position.x = a.fx + (a.x - a.fx) * e; robot.g.position.z = a.fz + (a.z - a.fz) * e; robot.body.position.y = still || q >= 1 ? 0 : Math.abs(Math.sin(a.t * 12)) * 0.025;
    if (q >= 1) { acts.shift(); a.end?.(); }
  }
  // One thing: from the pallet to its bin, or to the help crate when the robot does not know. keep: leave it on show.
  function sortOne(id, binId, done, keep = true) {
    const m = itemMesh(THREE, k, id); m.position.set(pile.x, 0.1, pile.z); g.add(m);
    robot.ball.material = k.mat(binId ? '#f08a2c' : '#f4b73b');
    drive(pile.x + 0.95, pile.z + 0.25, 0.9, () => { robot.g.rotation.y = -Math.PI / 2; robot.hold.add(m); m.position.set(0, 0, 0); });
    const b = binId ? binAt.get(binId) : null;
    if (b) drive(b.x, BZ + 1.0, 1.1, () => { robot.g.rotation.y = Math.PI; g.add(m); m.position.set(b.x + ((b.n % 2) - 0.5) * 0.3, 0.9 + Math.floor(b.n / 2) * 0.2, BZ); m.rotation.y = b.n * 0.7; b.n++; if (!keep) { g.remove(m); b.n--; } });
    else drive(help.x - 0.95, help.z, 1.1, () => { robot.g.rotation.y = Math.PI / 2; g.add(m); m.position.set(help.x + ((help.n % 2) - 0.5) * 0.3, 0.36 + Math.floor(help.n / 2) * 0.2, help.z - 0.1); help.n++; });
    drive(home.x, home.z, 0.8, () => { robot.g.rotation.y = 0.3; done?.(); });
  }
  // the camera for the module's own scene: low, just outside the tile, looking across the yard to the bins
  outer.updateMatrixWorld(true);
  const eye = g.localToWorld(new THREE.Vector3(1.2, 3.7, 9.0)); const eyeB = g.localToWorld(new THREE.Vector3(-1.0, 3.7, 9.0)); const aim = g.localToWorld(new THREE.Vector3(0.1, 0.3, -0.3)); const tmp = new THREE.Vector3();
  function view(camera, t) {
    const s = still ? 0 : 0.5 - 0.5 * Math.cos(t * 0.18); tmp.lerpVectors(eye, eyeB, s); camera.position.copy(tmp); camera.up.set(0, 1, 0); camera.lookAt(aim);
    const fov = camera.aspect < 1 ? 58 : 34; if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  }
  robot.g.rotation.y = 0.3;
  return { g: outer, robot, update, sortOne, view, idle: () => !acts.length,
    hold(id) { const m = itemMesh(THREE, k, id); robot.hold.add(m); },
    remove() { acts.length = 0; engine.scene.remove(outer); k.dispose(); } };
}

// The robot left working in the town: it carries one thing after another to the bins. With reduced motion it stands
// still by its bins, holding one thing. Returns a function that removes everything.
export function townScene(engine, sp, binIds, things, still) {
  const sc = buildScene(engine, sp, binIds, { still, town: true }); if (!sc) return () => {};
  live.add(sc.g); let raf = 0; let last = 0; let n = 0; let gone = false;
  const list = things.filter((id) => kind(id) && binIds.includes(kind(id).bin)); if (!list.length) list.push('newspaper');
  if (still) sc.hold(list[0]);
  else {
    const next = () => { if (gone) return; const id = list[n++ % list.length]; sc.sortOne(id, kind(id).bin, () => setTimeout(next, 1400), false); };
    const tick = (now) => { if (gone) return; const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; if (sc.g.visible) sc.update(dt); raf = requestAnimationFrame(tick); };
    next(); raf = requestAnimationFrame(tick);
  }
  return () => { if (gone) return; gone = true; cancelAnimationFrame(raf); live.delete(sc.g); sc.remove(); };
}
