// What the "roads" module leaves in the town: the child's rebuilt street, drawn simply at the town's own scale
// across up to three empty tiles in a row: one stretch of road with their crossings, drop-off shelters and waiting
// bays, one shared car driving along it, a block for each use of the freed land, and a sign. Scenery only.
import { KINDS, SLOTS, JUNCTION, cleanPlots, townRun } from './street.js';
import { kit, pod } from './scene.js';

const TILE = 6;                 // a town tile is 6 units across
const LEN = 3 * TILE - 0.6;     // the model is drawn three tiles long and scaled down when fewer are free
const ROAD_Z = -0.9;            // the road runs along the north half; the freed land's blocks stand to the south

export function show(townCtx, data) {
  const nothing = () => {};
  const { THREE, scene, world } = townCtx?.engine || {};
  if (!THREE || !scene || !world?.tileTop || !data || !Array.isArray(data.layout)) return nothing;
  const layout = Array.from({ length: SLOTS }, (_, i) => (i !== JUNCTION && KINDS.includes(data.layout[i]) ? data.layout[i] : null));
  if (!layout.includes('drop')) return nothing;
  // which side of the island faces the viewer: the street goes there, where it is plain to see
  let front = [1, 1];
  try {
    const all = [...(townCtx.town?.terrain?.tiles?.values?.() || [])]; const cam = townCtx.engine.stage?.camera;
    if (all.length && cam) { const t0 = all[0], p0 = world.tileTop(t0.k); const cx = all.reduce((s, t) => s + t.gx, 0) / all.length, cz = all.reduce((s, t) => s + t.gz, 0) / all.length; const dx = cam.position.x - (p0.x + (cx - t0.gx) * TILE), dz = cam.position.z - (p0.z + (cz - t0.gz) * TILE); const len = Math.hypot(dx, dz); if (len > 1) front = [dx / len, dz / len]; }
  } catch { /* the default side will do */ }
  const spot = townRun(townCtx.town?.cells, townCtx.town?.terrain?.tiles, front); if (!spot) return nothing;
  let tops; try { tops = spot.keys.map((key) => world.tileTop(key)); } catch { return nothing; }
  const n = tops.length; const plots = cleanPlots(data.plots); const still = !!townCtx.reduceMotion;
  const k = kit(THREE); const { box, group } = k;
  const root = new THREE.Group(); root.name = 'roads-street'; root.userData = { tiles: n, length: (LEN * n) / 3 };
  root.position.set(tops.reduce((s, t) => s + t.x, 0) / n, Math.max(...tops.map((t) => t.y)) + 0.02, tops.reduce((s, t) => s + t.z, 0) / n);
  root.rotation.y = spot.axis === 'z' ? -Math.PI / 2 : 0; root.scale.setScalar(n / 3);
  const at = (slot) => -7.4 + slot * 1.62;    // where a place on the street falls along the model

  // the ground it stands on, the road and its pavements
  box(root, LEN, 1.6, 5.4, '#cdbf9f', 0, -1.3, 0); box(root, LEN - 0.3, 0.08, 5.1, '#8fcf74', 0, 0.3, 0);
  box(root, LEN - 0.3, 0.1, 1.9, '#5b6168', 0, 0.34, ROAD_Z); for (let x = -8; x <= 8; x += 1.6) box(root, 0.7, 0.03, 0.1, '#f3efe2', x, 0.44, ROAD_Z);
  box(root, LEN - 0.3, 0.16, 0.5, '#e3d8c2', 0, 0.34, ROAD_Z - 1.2); box(root, LEN - 0.3, 0.16, 0.5, '#e3d8c2', 0, 0.34, ROAD_Z + 1.2);
  // the child's pieces
  layout.forEach((kind, s) => {
    const x = at(s);
    if (kind === 'drop') { box(root, 1.3, 0.03, 0.6, '#7fb0ff', x, 0.44, ROAD_Z - 0.6); for (const dx of [-0.55, 0.55]) box(root, 0.1, 1.3, 0.1, '#2f4f7a', x + dx, 0.5, ROAD_Z - 1.3); box(root, 1.4, 0.14, 0.7, '#2f6fd8', x, 1.8, ROAD_Z - 1.25); box(root, 1.2, 0.8, 0.06, '#bfe6ff', x, 0.9, ROAD_Z - 1.42); }
    else if (kind === 'bay') { box(root, 1.5, 0.18, 0.6, '#4f565d', x, 0.34, ROAD_Z + 1.2); box(root, 1.5, 0.03, 0.08, '#2e9b5a', x, 0.52, ROAD_Z + 0.94); box(root, 0.16, 0.7, 0.16, '#2e9b5a', x + 0.6, 0.5, ROAD_Z + 1.4); }
    else if (kind) { for (let i = -1.5; i <= 1.5; i++) box(root, 0.22, 0.03, 1.8, kind === 'cycle' ? '#f2a08c' : '#f7f4ea', x + i * 0.36, 0.44, ROAD_Z); for (const dz of [-1.25, 1.25]) { box(root, 0.1, 1.5, 0.1, '#22262a', x + 0.75, 0.5, ROAD_Z + dz); box(root, 0.3, 0.3, 0.3, kind === 'cycle' ? '#2f6fd8' : '#ffb000', x + 0.75, 2, ROAD_Z + dz); } }
  });
  // the freed land: a block for each plot, then the shared cars' charging plot
  const BZ = 1.55; const house = (g, x, z, c) => { box(g, 1.1, 1.1, 1.1, c, x, 0, z); box(g, 1.3, 0.3, 1.3, '#b5523b', x, 1.1, z); box(g, 0.8, 0.3, 0.8, '#b5523b', x, 1.4, z); };
  plots.forEach((use, i) => {
    const g = group(root, -6.4 + i * 3.5, 0.38, BZ); const W = 3.1, D = 1.9;
    if (use === 'homes') { box(g, W, 0.08, D, '#a7d48c', 0, 0, 0); house(g, -0.8, 0, '#f4e6d2'); house(g, 0.8, 0, '#e9c9a0'); }
    else if (use === 'park') { box(g, W, 0.1, D, '#6fbf5f', 0, 0, 0); box(g, 0.3, 0.9, 0.3, '#8a5a3c', -0.8, 0, 0); box(g, 1.4, 1.1, 1.4, '#4f9a45', -0.8, 0.9, 0); box(g, 0.9, 0.6, 0.9, '#6fbf5f', -0.8, 2, 0); for (const dx of [0.5, 1.2]) box(g, 0.1, 1, 0.1, '#d9534f', dx, 0, 0.2); box(g, 0.8, 0.1, 0.1, '#d9534f', 0.85, 1, 0.2); box(g, 0.3, 0.08, 0.24, '#f0ad4e', 0.85, 0.4, 0.2); }
    else if (use === 'garden') { box(g, W, 0.1, D, '#8a6a48', 0, 0, 0); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) box(g, 0.3, 0.3, 0.3, r % 2 ? '#5aa84f' : '#8fd06a', -1.2 + c * 0.5, 0.1, -0.6 + r * 0.6); box(g, 0.9, 0.8, 1.1, '#cfeee6', 1, 0.1, 0); box(g, 1, 0.14, 1.2, '#9ad6c8', 1, 0.9, 0); }
    else { box(g, W, 0.1, D, '#7a8088', 0, 0, 0); for (const [dx, c] of [[-0.9, '#c8553d'], [0.2, '#3d6e8a']]) { box(g, 0.7, 0.4, 1.2, c, dx, 0.15, 0); box(g, 0.6, 0.3, 0.7, '#9fd0ee', dx, 0.55, 0); } box(g, 0.1, 1.2, 0.1, '#5a6068', 1.2, 0.1, -0.6); box(g, 0.5, 0.5, 0.08, '#2f6fd8', 1.2, 1.1, -0.6); }
  });
  { const g = group(root, 4.1, 0.38, BZ); box(g, 2.6, 0.1, 1.9, '#7a8088', 0, 0, 0); box(g, 2.2, 0.1, 1.5, '#2c4a5e', 0, 1.5, 0); for (const dx of [-1, 1]) for (const dz of [-0.6, 0.6]) box(g, 0.1, 1.5, 0.1, '#5a6068', dx, 0.1, dz); pod(k, g, 0, 0, Math.PI / 2).scale.setScalar(0.62); }
  // a tall sign to find it by: a teal board with a white shared car on it, and the street's name
  box(root, 0.2, 5.4, 0.2, '#3b2a1e', 7.5, 0.38, BZ); box(root, 2.4, 1.6, 0.14, '#18a999', 7.5, 4.3, BZ); box(root, 1.5, 0.5, 0.2, '#f6f3ea', 7.5, 4.75, BZ); box(root, 1.1, 0.3, 0.2, '#2c4a5e', 7.5, 5.1, BZ); for (const dx of [-0.45, 0.45]) box(root, 0.34, 0.3, 0.22, '#22262a', 7.5 + dx, 4.55, BZ);
  k.label(root, 'Shared-car street', { tone: 'plain', world: 2.2, x: 7.5, y: 6.1, z: BZ });   // big enough to read from the usual island view
  // one shared car drives along the street: it stops at the first drop-off point, goes on, turns and comes back
  const car = pod(k, root, 0, ROAD_Z); car.position.y = 0.44; car.scale.setScalar(0.8); car.name = 'roads-car';
  const stop = at(layout.indexOf('drop')); const A = -7.6, B = 7.6; car.position.x = stop;
  scene.add(root);
  // the town may change after this is drawn: if something is built on one of the tiles, the street steps aside
  const taken = () => { try { return typeof world.walkCost === 'function' && spot.keys.some((key) => world.walkCost(key) === Infinity); } catch { return false; } };
  root.visible = !taken();
  let raf = 0, gone = false, last = 0, since = 0, x = A, dir = 1, hold = 0;
  const tick = (now) => {
    if (gone) return; raf = requestAnimationFrame(tick); const dt = Math.min(0.25, last ? (now - last) / 1000 : 0); last = now;
    since += dt; if (since > 1) { since = 0; root.visible = !taken(); }
    if (still || !root.visible) return;
    if (hold > 0) { hold -= dt; return; }
    const before = x; x += dir * dt * 2.4;
    if (dir > 0 && before < stop && x >= stop) { x = stop; hold = 1.4; }
    if (x >= B) { x = B; dir = -1; hold = 0.5; } else if (x <= A) { x = A; dir = 1; hold = 0.5; }
    car.position.x = x; car.position.z = ROAD_Z + (dir > 0 ? -0.42 : 0.42);
  };
  if (typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(tick);
  return () => { gone = true; if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf); root.removeFromParent(); k.dispose(); };
}
