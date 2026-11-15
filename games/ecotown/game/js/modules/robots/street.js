// Robot training: the robot at work in the town, in 3D. A small voxel robot, a row of bins, a pallet of things and
// a "help" crate, all standing on one tile. Used for the module's last scene (run) and for the town afterwards (show).
// three.js comes from the engine the loader hands over (engine.THREE), so this file also loads where there is no 3D.
// Movement runs on real elapsed time (the page's clock), so a slow machine shows fewer frames, not a slower robot.
import { binById, kind } from './learn.js';
import { COLOURS } from './pictures.js';
import { LOW } from './spot.js';

// Town scenes left by show(). The module hides them while it plays its own street scene on the same tile.
const live = new Set();
export const hideTownShows = (hide) => { for (const g of live) g.visible = !hide; };
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
const HOME_YAW = -40 * Math.PI / 180; // the direction the island is usually seen from (the game's starting view)
const SIGN_Y = 12;                    // the height of the robot sign left in the town, above roofs and trees

function kit(THREE) {
  const geos = []; const mats = new Map();
  const mat = (c) => { if (!mats.has(c)) { const col = new THREE.Color(c); mats.set(c, new THREE.MeshLambertMaterial({ color: col, emissive: col, emissiveIntensity: 0.12 })); } return mats.get(c); };
  const box = (parent, w, h, d, c, x = 0, y = 0, z = 0) => { const g = new THREE.BoxGeometry(w, h, d); geos.push(g); const m = new THREE.Mesh(g, mat(c)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  return { mat, box, dispose() { for (const g of geos) g.dispose(); for (const m of mats.values()) m.dispose(); } };
}
function buildRobot(THREE, k) {
  const g = new THREE.Group(); g.name = 'robots-robot'; const body = new THREE.Group(); g.add(body);
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
  else if (s === 'jar' || s === 'cup') { k.box(g, 0.26, 0.28, 0.26, c, 0, 0.14, 0); if (s === 'jar') k.box(g, 0.22, 0.06, 0.22, '#8d98a3', 0, 0.31, 0); }
  else if (s === 'flat') k.box(g, 0.42, 0.06, 0.32, c, 0, 0.03, 0);
  else if (s === 'box' || s === 'tray') { k.box(g, 0.38, s === 'tray' ? 0.12 : 0.26, 0.34, c, 0, s === 'tray' ? 0.06 : 0.13, 0); if (it.f.state === 'greasy') k.box(g, 0.2, 0.02, 0.16, '#6b4420', 0, s === 'tray' ? 0.13 : 0.27, 0); }
  else if (s === 'lamp' || s === 'umbrella') { k.box(g, 0.24, 0.04, 0.24, '#8d98a3', 0, 0.02, 0); k.box(g, 0.05, 0.3, 0.05, '#3b2a1e', 0, 0.19, 0); k.box(g, 0.3, 0.16, 0.3, c, 0, 0.42, 0); }
  else if (s === 'toy' || s === 'kettle' || s === 'clock') { k.box(g, 0.26, 0.26, 0.2, c, 0, 0.13, 0); k.box(g, 0.2, 0.16, 0.18, s === 'toy' ? c : '#3b4656', 0, 0.34, 0); }
  else if (s === 'bag') { k.box(g, 0.26, 0.3, 0.14, c, 0, 0.15, 0); k.box(g, 0.1, 0.05, 0.04, '#f6f2e6', 0, 0.33, 0); }
  else if (s === 'shell') { k.box(g, 0.24, 0.14, 0.24, c, 0, 0.07, 0); k.box(g, 0.12, 0.1, 0.12, c, 0.1, 0.19, 0.04); }
  else if (s === 'peel' || s === 'leaf') { k.box(g, 0.36, 0.06, 0.2, c, 0, 0.03, 0); k.box(g, 0.14, 0.06, 0.3, c, 0.04, 0.09, 0); }
  else k.box(g, 0.26, 0.2, 0.24, c, 0, 0.1, 0);
  return g;
}
// The tile's own ground cover and plants are put away while the yard stands on it, and come back afterwards
// (unless the child has built on the tile since). also: more tiles whose loose plants are put away (in front of the camera).
function clearTile(world, key, also = []) {
  const undo = []; const hide = (o) => { if (o && o.visible) { o.visible = false; undo.push(o); } };
  let L = null; try { L = world?.layers?.get(key) || null; } catch { L = null; }
  const was = L ? { build: L.build, item: L.cellItem } : null;
  if (L) { hide(L.build); hide(L.deco); hide(L.hedge); }
  for (const k of also) { let N = null; try { N = world?.layers?.get(k) || null; } catch { N = null; } if (N && !N.build) hide(N.deco); }
  const same = () => !L || (L.build === was.build && L.cellItem === was.item);
  return { same, restore() { if (same()) for (const o of undo) o.visible = true; undo.length = 0; } };
}

// Build the scene on one tile. sp: from spot.js. binIds: which bins stand there. Returns null when the tile is gone.
// town: the version left in the town, seen from far above: a bigger robot and bins, and a tall sign to find it by.
export function buildScene(engine, sp, binIds, { still = false, town = false } = {}) {
  let top = null; try { top = engine.world.tileTop(sp.key); } catch { top = null; } if (!top) return null;
  const THREE = engine.THREE; const k = kit(THREE); const outer = new THREE.Group(); outer.name = 'robots-scene'; outer.position.copy(top); outer.rotation.y = Math.atan2(sp.look[0], sp.look[1]); // the scene's front faces the camera side
  const [tx, tz] = sp.key.split(',').map(Number); const front = `${tx + sp.look[0]},${tz + sp.look[1]}`;
  const cleared = clearTile(engine.world, sp.key, town ? [] : [front]);
  k.box(outer, 5.5, 0.5, 5.5, '#cdbf9f', 0, 0.05, 0); k.box(outer, 5.1, 0.06, 5.1, '#e9dfc6', 0, 0.33, 0);      // a paved yard over the tile, a step above the ground
  for (const [x, z] of [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]]) k.box(outer, 0.3, 0.3, 0.3, '#b3a17c', x, 0.42, z); // corner stones
  const g = new THREE.Group(); g.position.y = 0.36; outer.add(g);
  const u = town ? 1.35 : 1; const ru = town ? 1.8 : 1;                                                      // how much bigger the bins and the robot are in the town
  const n = binIds.length; const binAt = new Map(); const BZ = -1.55; const gap = (town ? 4.4 : 3.0) / Math.max(1, n - 1 || 1); const mid = town ? 0.2 : 0.75;
  binIds.forEach((id, i) => { const b = binById(id); const x = mid + (i - (n - 1) / 2) * Math.min(gap, 1.0 * u + 0.05); const bg = new THREE.Group(); bg.position.set(x, 0, BZ); bg.scale.setScalar(u); g.add(bg);
    k.box(bg, 0.8, 0.82, 0.72, b.colour, 0, 0.41, 0); k.box(bg, 0.66, 0.04, 0.58, '#2a1f17', 0, 0.83, 0); k.box(bg, 0.4, 0.32, 0.03, '#fffaf0', 0, 0.44, 0.37);
    const lid = new THREE.Group(); lid.position.set(0, 0.86, -0.38); bg.add(lid); k.box(lid, 0.88, 0.1, 0.8, '#3b2a1e', 0, 0, 0.4); k.box(lid, 0.3, 0.06, 0.08, b.colour, 0, 0.06, 0.74);
    binAt.set(id, { x, n: 0, lid, bg }); });
  const pile = { x: town ? -1.3 : -0.9, z: 1.45 }; const help = { x: 1.95, z: 1.35, n: 0 }; const home = { x: town ? -1.7 : -2.0, z: town ? 0.7 : 0.15 };
  k.box(g, 1.0, 0.1, 0.8, '#b98a52', pile.x, 0.05, pile.z); k.box(g, 0.12, 0.1, 0.8, '#8a6336', pile.x - 0.3, 0.06, pile.z); k.box(g, 0.12, 0.1, 0.8, '#8a6336', pile.x + 0.3, 0.06, pile.z); // the pallet the things arrive on
  k.box(g, 0.84, 0.3, 0.72, '#f4b73b', help.x, 0.15, help.z); k.box(g, 0.7, 0.03, 0.58, '#c98d1c', help.x, 0.3, help.z); k.box(g, 0.5, 0.2, 0.03, '#fffaf0', help.x, 0.16, help.z + 0.37); // the open crate for things to ask a person about
  const robot = buildRobot(THREE, k); robot.g.position.set(home.x, 0, home.z); robot.g.scale.setScalar(ru); g.add(robot.g);
  let sign = null;
  if (town) { // a sign to find the robot by from far above: a tall pole with a robot's head on it, the face on all four sides
    const px = 2.2; const pz = 2.0; k.box(g, 0.7, 0.24, 0.7, '#8a6336', px, 0.12, pz); k.box(g, 0.3, 10.4, 0.3, '#3b2a1e', px, 5.2, pz);
    sign = new THREE.Group(); sign.position.set(px, SIGN_Y, pz); sign.scale.setScalar(1.65); sign.name = 'robots-sign'; sign.rotation.y = HOME_YAW - outer.rotation.y; g.add(sign);
    k.box(sign, 2.3, 1.9, 2.3, '#16c79a'); k.box(sign, 2.5, 0.22, 2.5, '#0f9b78', 0, -1.0, 0); k.box(sign, 0.16, 0.6, 0.16, '#3b2a1e', 0, 1.25, 0); k.box(sign, 0.5, 0.5, 0.5, '#f08a2c', 0, 1.75, 0);
    for (let s = 0; s < 4; s++) { const f = new THREE.Group(); f.rotation.y = s * Math.PI / 2; sign.add(f); k.box(f, 1.8, 1.25, 0.06, '#243447', 0, 0, 1.16); for (const x of [-0.45, 0.45]) k.box(f, 0.4, 0.4, 0.06, '#bfeaff', x, 0.1, 1.2); k.box(f, 0.7, 0.12, 0.06, '#ffffff', 0, -0.36, 1.2); }
  }
  engine.scene.add(outer);

  // ---------- passers-by: the town's people and animals keep walking, but none stands in the yard (or, for the module's
  // own view, in the strip in front of it) while the robot works there. They are moved onto a layer the camera does not
  // draw, never touched otherwise, and given back as soon as they walk on or the scene is removed.
  const HIDE = 30; const hidden = new Set(); const loc = new THREE.Vector3();
  const crowd = () => { const r = engine.life?.residents?.[0]?.g?.parent || engine.life?.family?.members?.[0]?.parent; return r && r !== engine.scene ? r : null; };
  const setLayer = (o, on) => o.traverse((q) => { if (on) q.layers.set(HIDE); else q.layers.set(0); });
  function tidy() {
    const r = crowd(); if (!r) return;
    for (const o of r.children) {
      if (o.isPoints) continue; loc.setFromMatrixPosition(o.matrixWorld); outer.worldToLocal(loc);
      const inYard = Math.abs(loc.x) < 3.3 && loc.z > -3.3 && loc.z < (town ? 3.3 : 9.5) && loc.y > -2 && loc.y < 8;
      if (inYard && !hidden.has(o)) { setLayer(o, true); hidden.add(o); } else if (!inYard && hidden.has(o)) { setLayer(o, false); hidden.delete(o); }
    }
  }
  const giveBack = () => { for (const o of hidden) setLayer(o, false); hidden.clear(); };

  // ---------- the robot's moves: a queue, run on real time. finish() ends every queued move at once.
  const acts = []; let last = now();
  const push = (a) => acts.push({ ...a, dur: still ? 0 : a.dur });
  const drive = (x, z, dur, end) => push({ x, z, dur, end });
  const run = (a, q) => { // put move a at progress q (0 to 1)
    if (a.t0 === undefined) { a.t0 = 1; a.fx = robot.g.position.x; a.fz = robot.g.position.z; if (a.x !== undefined) { const dx = a.x - a.fx; const dz = a.z - a.fz; if (Math.abs(dx) + Math.abs(dz) > 0.01) robot.g.rotation.y = Math.atan2(dx, dz); } a.begin?.(); }
    const e = q * q * (3 - 2 * q);
    if (a.x !== undefined) { robot.g.position.x = a.fx + (a.x - a.fx) * e; robot.g.position.z = a.fz + (a.z - a.fz) * e; }
    a.step?.(e);
  };
  function update() {
    tidy(); if (still && !acts.length) return;
    const t = now(); let dt = Math.max(0, t - last); last = t; const idle = !acts.length;
    if (!still) { robot.head.rotation.z = idle ? Math.sin(t * 1.3) * 0.05 : 0; if (sign) sign.position.y = SIGN_Y + Math.sin(t * 1.1) * 0.22; }
    while (acts.length) {
      const a = acts[0]; a.t = (a.t || 0) + dt; const q = a.dur > 0 ? Math.min(1, a.t / a.dur) : 1; run(a, q);
      robot.body.position.y = still || q >= 1 || a.x === undefined ? 0 : Math.abs(Math.sin(a.t * 12)) * 0.025;
      if (q < 1) break;
      dt = a.dur > 0 ? a.t - a.dur : dt; acts.shift(); a.end?.(); if (a.dur > 0 && dt <= 0) break; // time left over goes to the next move
    }
  }
  function finish() { let guard = 0; while (acts.length && guard++ < 200) { const a = acts.shift(); run(a, 1); a.end?.(); } robot.body.position.y = 0; last = now(); }
  // One thing: from the pallet to its bin (the lid opens and it drops in), or to the help crate when the robot does not know.
  // keep: the thing stays where it was put, in view. Otherwise the lid closes over it (the town's endless round).
  function sortOne(id, binId, done, keep = true) {
    const m = itemMesh(THREE, k, id); m.position.set(pile.x, 0.1, pile.z); g.add(m);
    robot.ball.material = k.mat(binId ? '#f08a2c' : '#f4b73b');
    drive(pile.x - 0.95 * ru * 0.75, pile.z - 0.1, 0.7, () => { robot.g.rotation.y = Math.PI / 2; robot.hold.add(m); m.position.set(0, 0, 0); m.scale.setScalar(1 / ru * (town ? 1.5 : 1)); });
    const b = binId ? binAt.get(binId) : null;
    if (b) {
      drive(b.x, BZ + 0.95 * Math.max(u, ru * 0.8), 1.0, () => { robot.g.rotation.y = Math.PI; });
      const slot = () => { const i = b.n % 4; return [((i % 2) - 0.5) * 0.3, 0.72 + Math.floor(b.n / 4) * 0.12, (Math.floor(i / 2) - 0.5) * 0.24]; };
      push({ dur: 0.45, step: (e) => { b.lid.rotation.x = -1.75 * e; }, end: () => { const [sx, sy, sz] = slot(); b.bg.add(m); m.scale.setScalar(town ? 1.2 : 1); m.position.set(sx, sy + 0.5, sz); m.rotation.y = b.n * 0.9; m.userData.to = sy; } });
      push({ dur: 0.3, step: (e) => { m.position.y = m.userData.to + 0.5 * (1 - e); }, end: () => { b.n++; } });
      if (!keep) push({ dur: 0.35, step: (e) => { b.lid.rotation.x = -1.75 * (1 - e); }, end: () => { b.bg.remove(m); b.n--; } });
    } else {
      drive(help.x - 1.0, help.z - 0.1, 1.0, () => { robot.g.rotation.y = Math.PI / 2; });
      push({ dur: 0.3, end: () => { g.add(m); m.scale.setScalar(1); m.position.set(help.x + ((help.n % 2) - 0.5) * 0.32, 0.31 + Math.floor(help.n / 2) * 0.2, help.z - 0.05); m.rotation.y = help.n * 0.8; help.n++; } });
    }
    drive(home.x, home.z, 0.7, () => { robot.g.rotation.y = 0.5; done?.(); });
  }
  // The camera for the module's own scene: raised, just past the tile's edge on its open side, looking down across the
  // yard to the bins. It stays within the next tile (which spot.js has checked is clear), so nothing stands in its way.
  outer.updateMatrixWorld(true);
  let lift = 0; try { const ft = engine.world.tileTop(front); if (ft) lift = Math.max(0, ft.y - top.y); } catch { lift = 0; }
  const P = (x, y, z) => g.localToWorld(new THREE.Vector3(x, y, z));
  const wide = { a: P(1.3, 4.5 + lift, 7.3), b: P(-0.7, 4.5 + lift, 7.3), aim: P(0.15, 0.55, -0.35), fov: 36 };
  const tallV = { a: P(0.6, 6.2 + lift, 8.3), b: P(-0.4, 6.2 + lift, 8.3), aim: P(0.1, -0.6, 0.2), fov: 50 };   // an upright screen: further back, a wider lens
  const tmp = new THREE.Vector3();
  function view(camera, t) {
    const v = camera.aspect < 1 ? tallV : wide; const s = still ? 0.35 : 0.5 - 0.5 * Math.cos(t * 0.18);
    tmp.lerpVectors(v.a, v.b, s); camera.position.copy(tmp); camera.up.set(0, 1, 0); camera.lookAt(v.aim);
    if (camera.fov !== v.fov) { camera.fov = v.fov; camera.updateProjectionMatrix(); }
  }
  robot.g.rotation.y = 0.5;
  return { g: outer, robot, update, finish, sortOne, view, busy: () => acts.length > 0, same: cleared.same,
    hold(id) { const m = itemMesh(THREE, k, id); m.scale.setScalar(town ? 1.5 / ru : 1); robot.hold.add(m); },
    remove() { acts.length = 0; giveBack(); engine.scene.remove(outer); k.dispose(); cleared.restore(); } };
}

// The robot left working in the town: it carries one thing after another to the bins. With reduced motion it stands
// still by its bins, holding one thing. If the child builds on its tile, it is put away. Returns a function that removes everything.
export function townScene(engine, sp, binIds, things, still) {
  const sc = buildScene(engine, sp, binIds, { still, town: true }); if (!sc) return () => {};
  live.add(sc.g); let raf = 0; let n = 0; let gone = false; let timer = 0;
  const list = things.filter((id) => kind(id) && binIds.includes(kind(id).bin)); if (!list.length) list.push('newspaper');
  const frame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null;
  let L = null; try { L = engine.world?.layers?.get(sp.key) || null; } catch { L = null; }
  const stillOpen = () => !L || !L.cellItem || LOW.has(L.cellItem);
  if (still) sc.hold(list[0]);
  const next = () => { if (gone) return; const id = list[n++ % list.length]; sc.sortOne(id, kind(id).bin, () => { timer = setTimeout(next, 1400); }, false); };
  const tick = () => { if (gone) return; if (!stillOpen()) sc.g.visible = false; else if (sc.g.visible) sc.update(); raf = frame(tick); };
  if (!still) next(); if (frame) raf = frame(tick);
  return () => { if (gone) return; gone = true; if (frame) cancelAnimationFrame(raf); clearTimeout(timer); live.delete(sc.g); sc.remove(); };
}
