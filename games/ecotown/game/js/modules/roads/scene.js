// The 3D street for the "roads" module: a small close-up set in the game's voxel look, built from plain boxes.
// Drawing only: every rule and number lives in street.js. The same set, scaled down, is the model left in the town.
import { SLOTS, JUNCTION, HOMES, LINES, CARPARK, BAY_CARS } from './street.js';

export const S = 4;                               // one place on the street is 4 units long
export const slotX = (i) => i * S + S / 2;
const CARC = ['#c8553d', '#3d6e8a', '#e8d9b0', '#5a6d50', '#e6a15a', '#6b5b8a'];
const SHIRT = ['#d9534f', '#3a7bd5', '#f0ad4e', '#5cb85c', '#9b59b6', '#e67e22'];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (t) => t * t * (3 - 2 * t);

export function createStreet(THREE, { ground = true } = {}) {
  const root = new THREE.Group(); root.name = 'roads-street';
  const geo = new THREE.BoxGeometry(1, 1, 1); const mats = new Map();
  const mat = (c) => { if (!mats.has(c)) mats.set(c, new THREE.MeshLambertMaterial({ color: c })); return mats.get(c); };
  // a box by its size and the centre of its base
  const box = (parent, w, h, d, c, x, y, z) => { const m = new THREE.Mesh(geo, mat(c)); m.scale.set(w, h, d); m.position.set(x, y + h / 2, z); parent.add(m); return m; };
  const group = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

  // ---------- small things used again and again
  function car(parent, c, x, z, turn = 0) {
    const g = group(parent, x, 0.12, z); g.rotation.y = turn;
    box(g, 2.2, 0.55, 1.2, c, 0, 0.25, 0); box(g, 1.3, 0.5, 1.1, '#9fd0ee', -0.1, 0.8, 0); box(g, 1.2, 0.1, 1.15, c, -0.1, 1.3, 0);
    for (const dx of [-0.7, 0.7]) for (const dz of [-0.6, 0.6]) box(g, 0.45, 0.45, 0.2, '#22262a', dx, 0, dz);
    return g;
  }
  // a shared self-driving car: a rounded white pod with a teal band, the same at both ends
  function pod(parent, x = 0, z = 0, turn = 0) {
    const g = group(parent, x, 0.12, z); g.rotation.y = turn;
    box(g, 2.3, 0.5, 1.25, '#f6f3ea', 0, 0.25, 0); box(g, 2.3, 0.16, 1.27, '#18a999', 0, 0.42, 0); box(g, 1.9, 0.62, 1.15, '#2c4a5e', 0, 0.75, 0); box(g, 1.7, 0.12, 1.2, '#f6f3ea', 0, 1.37, 0);
    box(g, 0.3, 0.14, 0.3, '#ffd166', 0, 1.49, 0);
    for (const dx of [-0.75, 0.75]) for (const dz of [-0.62, 0.62]) box(g, 0.45, 0.45, 0.2, '#22262a', dx, 0, dz);
    return g;
  }
  function person(parent, i, x, z) {
    const g = group(parent, x, 0.25, z);
    box(g, 0.34, 0.4, 0.26, '#3b4a5a', 0, 0, 0); box(g, 0.44, 0.5, 0.3, SHIRT[i % SHIRT.length], 0, 0.4, 0); box(g, 0.34, 0.34, 0.32, ['#f1c9a5', '#c68e5f', '#8a5a3c', '#e0ac7e'][i % 4], 0, 0.9, 0);
    box(g, 0.38, 0.1, 0.36, ['#3b2a1e', '#1f1a17', '#a8642a', '#d8b25a'][(i * 3) % 4], 0, 1.24, 0);
    return g;
  }
  function tree(parent, x, z, s = 1) {
    const g = group(parent, x, 0, z); box(g, 0.4 * s, 1.2 * s, 0.4 * s, '#8a5a3c', 0, 0, 0); box(g, 1.8 * s, 1.3 * s, 1.8 * s, '#5aa84f', 0, 1.1 * s, 0); box(g, 1.2 * s, 0.8 * s, 1.2 * s, '#6fbf5f', 0, 2.3 * s, 0); return g;
  }
  function house(parent, x, z, w, d, h, wall, roof, doorSide = 1) {
    const g = group(parent, x, 0, z);
    box(g, w, h, d, wall, 0, 0, 0); box(g, w + 0.4, 0.5, d + 0.4, roof, 0, h, 0); box(g, w - 0.6, 0.5, d - 0.6, roof, 0, h + 0.5, 0);
    box(g, 0.7, 1.2, 0.12, '#6b4a33', -w / 4, 0, doorSide * d / 2); box(g, 0.8, 0.7, 0.12, '#bfe6ff', w / 4, h * 0.45, doorSide * d / 2);
    return g;
  }

  // ---------- the street that never changes
  const fixed = group(root);
  if (ground) box(fixed, 400, 1, 400, '#8fcf74', 20, -1.02, 0); else box(fixed, 50, 0.8, 34, '#8fcf74', 20, -0.82, 1);
  box(fixed, 52, 0.12, 6, '#5b6168', 20, 0, 0);                          // the street
  box(fixed, 3.4, 0.12, ground ? 30 : 12, '#5b6168', slotX(JUNCTION), 0, ground ? 18 : 9);   // the side road
  box(fixed, 52, 0.25, 2, '#e3d8c2', 20, 0, -4);                         // pavements
  box(fixed, slotX(JUNCTION) - 1.7 + 6, 0.25, 2, '#e3d8c2', (slotX(JUNCTION) - 1.7 - 6) / 2, 0, 4);
  box(fixed, 46 - (slotX(JUNCTION) + 1.7), 0.25, 2, '#e3d8c2', (46 + slotX(JUNCTION) + 1.7) / 2, 0, 4);
  for (let x = -5; x < 46; x += 3) box(fixed, 1.2, 0.02, 0.16, '#f3efe2', x, 0.12, 0);   // centre line
  box(fixed, 1.5, 0.14, ground ? 30 : 9, '#d98b7a', slotX(6), 0, ground ? -20 : -9.5);   // the cycle track, north and south
  box(fixed, 1.5, 0.14, ground ? 30 : 9, '#d98b7a', slotX(6), 0, ground ? 20 : 9.5);
  HOMES.forEach((s, n) => { house(fixed, slotX(s), -8.2, 3, 3.4, 2.4 + (n % 3) * 0.5, ['#f0dfc0', '#e9c9a0', '#f4e6d2', '#e6d2b0'][n % 4], ['#b5523b', '#9a4a3a', '#7a5a4a'][n % 3]); box(fixed, 0.8, 0.06, 1.6, '#e3d8c2', slotX(s) - 0.75, 0, -5.8); });
  for (const [x, z, s] of [[-3, -9, 1.2], [slotX(6) + 1.6, -9.5, 1], [42.5, -8, 1.3], [12, -12.5, 1.1], [30, -12.8, 1.2], [-4, 9, 1.1], [43, 12, 1.2]]) tree(fixed, x, z, s);
  { // the shop
    const g = group(fixed, slotX(0), 0, 8.4); box(g, 3.4, 2.4, 3.6, '#f0d27a', 0, 0, 0); box(g, 3.8, 0.4, 4, '#9a6a4a', 0, 2.4, 0);
    for (let i = 0; i < 4; i++) box(g, 0.9, 0.16, 1, i % 2 ? '#fff' : '#d9534f', -1.35 + i * 0.9, 1.7, -2.2); box(g, 1.6, 1, 0.1, '#bfe6ff', 0.4, 0.5, -1.82); box(g, 0.7, 1.3, 0.1, '#6b4a33', -1.1, 0, -1.82);
  }
  { // the school
    const g = group(fixed, slotX(8), 0, 10); box(g, 9.5, 3, 4.6, '#f2b8a0', 0, 0, 0); box(g, 10, 0.5, 5.1, '#8a4a3a', 0, 3, 0); box(g, 2, 1.2, 1.6, '#f2b8a0', 0, 3.5, 0); box(g, 2.4, 0.4, 2, '#8a4a3a', 0, 4.7, 0);
    for (let i = -3; i <= 3; i += 2) box(g, 1.1, 1, 0.1, '#bfe6ff', i * 1.15, 1.2, -2.32); box(g, 1.2, 1.6, 0.1, '#6b4a33', 0, 0, -2.34);
    box(g, 0.12, 3, 0.12, '#d8d2c4', 5.6, 0, -2.6); box(g, 1, 0.6, 0.06, '#f0ad4e', 6.15, 2.4, -2.6);
    for (let x = -5.5; x <= 5.5; x += 1) if (Math.abs(x) > 1) box(g, 0.14, 0.8, 0.14, '#6b8f5a', x, 0, -4);
  }

  // ---------- the pieces the child places
  const pieces = group(root); let pieceSlots = [];
  function drawPiece(kind, s, idle) {
    const g = group(pieces, slotX(s), 0, 0);
    if (kind === 'drop') {
      box(g, 3.5, 0.03, 1.5, '#2f6fd8', 0, 0.12, -2.2); box(g, 3.1, 0.035, 1.1, '#7fb0ff', 0, 0.12, -2.2);
      for (const dx of [-1.3, 1.3]) box(g, 0.14, 1.9, 0.14, '#2f4f7a', dx, 0.25, -4.6); box(g, 3.1, 0.16, 1.3, '#2f6fd8', 0, 2.15, -4.3); box(g, 2.6, 1.2, 0.08, '#bfe6ff', 0, 0.7, -4.75); box(g, 2, 0.14, 0.4, '#b08a55', 0, 0.75, -4.5);
      box(g, 0.12, 2.4, 0.12, '#2f4f7a', 1.75, 0.25, -3.3); box(g, 0.7, 0.7, 0.1, '#2f6fd8', 1.75, 2.3, -3.3); box(g, 0.4, 0.4, 0.12, '#fff', 1.75, 2.45, -3.3);
      if (idle) person(g, s + 2, -0.5, -4.2);
    } else if (kind === 'bay') {
      box(g, 3.8, 0.27, 2, '#4f565d', 0, 0, 4);                           // a lay-by cut into the pavement
      for (const dx of [-1.9, -0.63, 0.63, 1.9]) box(g, 0.08, 0.03, 1.9, '#9be7c0', dx, 0.27, 4);
      box(g, 3.8, 0.03, 0.14, '#2e9b5a', 0, 0.27, 3.08); box(g, 0.3, 1.1, 0.3, '#2e9b5a', 1.6, 0.27, 5.2); box(g, 0.34, 0.2, 0.34, '#9be7c0', 1.6, 1.37, 5.2);
      if (idle) for (let i = 0; i < BAY_CARS; i++) pod(g, -1.26 + i * 1.26, 4, Math.PI / 2).scale.set(0.8, 0.8, 0.8);
    } else {
      const cyc = kind === 'cycle';
      for (let i = -2; i <= 2; i++) box(g, 0.42, 0.03, 5.9, cyc ? '#f2a08c' : '#f7f4ea', i * 0.75, 0.12, 0);
      for (const dz of [-3.5, 3.5]) { box(g, 0.14, 2, 0.14, cyc ? '#2f6fd8' : '#22262a', 1.9, 0.25, dz); box(g, 0.14, 0.4, 0.15, '#f7f4ea', 1.9, 1.05, dz); box(g, cyc ? 0.6 : 0.45, cyc ? 0.6 : 0.45, cyc ? 0.12 : 0.45, cyc ? '#2f6fd8' : '#ffb000', 1.9, 2.25, dz); }
    }
    return g;
  }
  let layoutNow = Array(SLOTS).fill(null), idleNow = true;
  function setLayout(layout, { idle = true } = {}) {
    layoutNow = layout.slice(); idleNow = idle; pieces.clear(); pieceSlots = [];
    layout.forEach((k, s) => { if (k) pieceSlots[s] = drawPiece(k, s, idle); });
  }

  // ---------- the old street: parked cars along both kerbs
  const old = group(root);
  for (let s = 0; s < SLOTS; s++) { if (s === JUNCTION || s === 8) continue; car(old, CARC[s % 6], slotX(s) - 0.2, -2.2); car(old, CARC[(s + 3) % 6], slotX(s) + 0.3, 2.2); }
  const setOld = (on) => { old.visible = !!on; };

  // ---------- the car park: four plots. 'full' (before), null (empty, waiting for a choice), or a use
  const plots = group(root);
  function drawPlot(n, use) {
    const g = group(plots, slotX(CARPARK[n]), 0, 9.6); const W = 3.7, D = 7.6;
    const lot = () => { box(g, W, 0.14, D, '#7a8088', 0, 0, 0); for (let i = -1; i <= 1; i++) box(g, W, 0.02, 0.08, '#f3efe2', 0, 0.14, i * 2.4); };
    if (use === 'full') { lot(); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) car(g, CARC[(n * 5 + r * 2 + c) % 6], -0.9 + c * 1.8, -2.5 + r * 2.4 + 0.1, Math.PI / 2).scale.set(0.72, 0.72, 0.72); }
    else if (use === 'shared') { lot(); for (let c = 0; c < 2; c++) { pod(g, -0.9 + c * 1.8, -2.4, Math.PI / 2).scale.set(0.72, 0.72, 0.72); box(g, 0.25, 1, 0.25, '#2e9b5a', -0.9 + c * 1.8, 0.14, -0.9); } box(g, 2.6, 0.1, 2.2, '#2c4a5e', 0, 1.9, 2.2); for (const dx of [-1.2, 1.2]) for (const dz of [1.2, 3.2]) box(g, 0.14, 1.8, 0.14, '#5a6068', dx, 0.14, dz); pod(g, 0, 2.2, Math.PI / 2).scale.set(0.72, 0.72, 0.72); }
    else if (use === 'homes') { box(g, W, 0.1, D, '#a7d48c', 0, 0, 0); for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) house(g, -0.92 + c * 1.84, -1.9 + r * 3.9, 1.7, 2.6, 2.2 + ((r + c) % 2) * 0.5, ['#f4e6d2', '#e9c9a0'][(r + c) % 2], ['#b5523b', '#7a5a4a'][(r + c + 1) % 2], -1); }
    else if (use === 'park') { box(g, W, 0.14, D, '#7cc46a', 0, 0, 0); tree(g, -1, -2.6, 0.9); tree(g, 1, 2.6, 1); box(g, 1.6, 0.1, 1.6, '#e8d9a8', 0.7, 0.14, -0.6); box(g, 0.14, 1.4, 0.14, '#d9534f', 0.2, 0.14, -0.6); box(g, 0.14, 1.4, 0.14, '#d9534f', 1.2, 0.14, -0.6); box(g, 1.2, 0.14, 0.14, '#d9534f', 0.7, 1.5, -0.6); box(g, 0.4, 0.1, 0.3, '#f0ad4e', 0.7, 0.6, -0.6); box(g, 1.3, 0.3, 0.4, '#b08a55', -0.9, 0.14, 1.2); person(g, n + 1, -0.3, 0.2).scale.set(0.8, 0.8, 0.8); }
    else if (use === 'garden') { box(g, W, 0.12, D, '#8a6a48', 0, 0, 0); for (let r = 0; r < 5; r++) { box(g, W - 0.6, 0.18, 0.6, '#6b4a33', 0, 0.12, -3 + r * 1.1); for (let c = 0; c < 5; c++) box(g, 0.34, 0.3, 0.34, r % 2 ? '#5aa84f' : '#8fd06a', -1.3 + c * 0.65, 0.3, -3 + r * 1.1); } box(g, 2.2, 1.2, 1.5, '#cfeee6', 0, 0.12, 2.8); box(g, 2.4, 0.2, 1.7, '#9ad6c8', 0, 1.32, 2.8); }
    else if (use === 'parking') { lot(); for (let r = 0; r < 2; r++) car(g, CARC[(n + r * 2) % 6], -0.9 + r * 1.8, -2.4 + r * 2.4, Math.PI / 2).scale.set(0.72, 0.72, 0.72); box(g, 0.12, 1.8, 0.12, '#5a6068', 1.5, 0.14, -3.5); box(g, 0.6, 0.6, 0.08, '#2f6fd8', 1.5, 1.6, -3.5); }
    else { box(g, W, 0.14, D, '#b9b2a2', 0, 0, 0); for (const [dx, dz, w, d] of [[0, -D / 2, W, 0.14], [0, D / 2, W, 0.14], [-W / 2, 0, 0.14, D], [W / 2, 0, 0.14, D]]) box(g, w, 0.1, d, '#ffd166', dx, 0.14, dz); }
  }
  // state: 'full' for the old car park, or { plots: [use|null ×3] } once the shared cars have the fourth plot
  function setPlots(state) {
    plots.clear();
    for (let n = 0; n < CARPARK.length; n++) drawPlot(n, state === 'full' ? 'full' : n === 3 ? 'shared' : state.plots[n]);
  }

  // ---------- a kerb frame round the chosen place
  const frame = group(root); for (const [dx, dz, w, d] of [[0, -3.1, S, 0.16], [0, 3.1, S, 0.16], [-S / 2, 0, 0.16, 6.3], [S / 2, 0, 0.16, 6.3]]) box(frame, w, 0.1, d, '#ffd166', dx, 0.13, dz); frame.visible = false;
  function setFocus(slot) { frame.visible = Number.isInteger(slot) && slot >= 0; if (frame.visible) frame.position.x = slotX(slot); }

  // ---------- the people who cross each morning: a figure at each crossing place, with a flag for safe or not
  const lines = group(root); lines.visible = false;
  function setLines(cross) {
    lines.clear(); if (!cross) { lines.visible = false; return; } lines.visible = true;
    cross.forEach((c, i) => {
      const g = group(lines, slotX(c.slot) - 1.2, 0, -3.9); person(g, i + 3, 0, 0);
      if (c.who === 'cycle') { box(g, 0.9, 0.08, 0.08, '#22262a', 0.7, 0.75, 0); box(g, 0.5, 0.5, 0.08, '#22262a', 0.35, 0.25, 0); box(g, 0.5, 0.5, 0.08, '#22262a', 1.05, 0.25, 0); }
      box(g, 0.1, 1.2, 0.1, '#5a4a3a', 0, 1.6, 0); box(g, 0.8, 0.5, 0.1, c.safe ? '#2e9b5a' : '#e6a100', 0.4, 2.3, 0);
    });
  }

  // ---------- the morning: shared cars and people moved by the simulation's own times
  const actors = group(root); let run = null;
  function startRun(sim) {
    actors.clear(); setLayout(layoutNow, { idle: false });
    const cars = sim.cars.map((c) => { const perBay = sim.cars.filter((o) => o.bay === c.bay && o.i < c.i).length; const g = pod(actors, 0, 0); g.scale.set(0.9, 0.9, 0.9); return { ...c, g, home: c.bay === null ? null : { x: slotX(c.bay) - 1.26 + perBay * 1.26, z: 4 }, trips: sim.log.filter((t) => t.car === c.i) }; });
    const people = sim.log.map((t, i) => ({ t, g: person(actors, i, 0, 0), off: ((i * 7) % 5) * 0.3 - 0.6 }));
    run = { sim, cars, people }; updateRun(0);
  }
  function updateRun(time) {
    if (!run) return;
    for (const c of run.cars) {
      let pos = c.home ? { x: c.home.x, z: c.home.z, turn: Math.PI / 2 } : null;
      for (const t of c.trips) {
        if (time < t.set) break;
        const dx = slotX(t.drop); const from = c.home || { x: 46, z: 1.5 }; const side = Math.sign(from.x - dx) || 1; const qx = dx + side * t.ahead * 2.7;
        if (time < t.arrive) { const p = clamp((time - t.set) / Math.max(1, t.arrive - t.set)); pos = { x: lerp(from.x, qx, p), z: lerp(from.z, -1.7, smooth(p)), turn: 0 }; }
        else if (time < t.board) { const p = clamp((time - (t.board - 8)) / 8); pos = { x: lerp(qx, dx, p), z: -1.7, turn: 0 }; }
        else if (time < t.leave) pos = { x: dx, z: -1.7, turn: 0 };
        else if (time < t.out) { const p = clamp((time - t.leave) / Math.max(1, t.out - t.leave)); pos = { x: lerp(dx, 46, p), z: -1.5, turn: 0 }; }
        else if (c.home && time < t.back) { const start = t.back - Math.min(40, t.back - t.out); pos = time < start ? null : { x: lerp(46, c.home.x, clamp((time - start) / (t.back - start))), z: lerp(1.5, c.home.z, smooth(clamp((time - start) / (t.back - start)))), turn: 0 }; }
        else pos = c.home ? { x: c.home.x, z: c.home.z, turn: Math.PI / 2 } : null;
      }
      c.g.visible = !!pos; if (pos) { c.g.position.set(pos.x, 0.12, pos.z); c.g.rotation.y = pos.turn; }
    }
    for (const p of run.people) {
      const t = p.t; const vis = time >= t.ask && time < t.board + 20; p.g.visible = vis; if (!vis) continue;
      const a = clamp((time - t.ask) / Math.max(1, t.ready - t.ask)); const hx = slotX(t.home) - 0.75, dx = slotX(t.drop) + p.off;
      if (time < t.board) p.g.position.set(lerp(hx, dx, a), 0.25, lerp(-5.6, -4, clamp(a * 3)));
      else p.g.position.set(dx, 0.25, lerp(-4, -2.4, clamp((time - t.board) / 20)));
    }
  }
  function endRun() { run = null; actors.clear(); setLayout(layoutNow, { idle: true }); }

  // ---------- the ride: one shared car, and someone crossing in front of it
  const ride = group(root); const rideCar = pod(ride, 0, -1.5); const walker = person(ride, 2, 0, -4); ride.visible = false;
  function setRide(x, cross = null) {
    ride.visible = x !== null; if (x === null) return;
    rideCar.position.x = x; walker.visible = !!cross; if (cross) walker.position.set(slotX(cross.slot), 0.12, lerp(-3.6, 3.6, clamp(cross.p)));
  }

  // which place on the street is under a ray (in the set's own coordinates), or -1
  function slotAt(origin, dir) {
    if (Math.abs(dir.y) < 1e-6) return -1; const t = -origin.y / dir.y; if (t <= 0) return -1;
    const x = origin.x + dir.x * t, z = origin.z + dir.z * t; if (z < -5.2 || z > 5.2 || x < 0 || x >= SLOTS * S) return -1;
    return Math.floor(x / S);
  }
  function dispose() { root.removeFromParent(); geo.dispose(); for (const m of mats.values()) m.dispose(); mats.clear(); }

  setLayout(layoutNow); setPlots('full'); setOld(true);
  return { root, setLayout, setOld, setPlots, setFocus, setLines, startRun, updateRun, endRun, setRide, slotAt, dispose, lineSlots: LINES.map((l) => l.slot) };
}
