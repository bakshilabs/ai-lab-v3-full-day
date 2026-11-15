// The 3D street for the "roads" module: a small close-up set in the game's voxel look, built from plain boxes, with
// a few flat signs that always face the camera. Drawing only: every rule and number lives in street.js.
import { SLOTS, JUNCTION, HOMES, LINES, CARPARK, BAY_CARS, EXIT, route } from './street.js';

export const S = 4;                               // one place on the street is 4 units long
export const slotX = (i) => i * S + S / 2;
const CARC = ['#c8553d', '#3d6e8a', '#e8d9b0', '#5a6d50', '#e6a15a', '#6b5b8a'];
const SHIRT = ['#d9534f', '#3a7bd5', '#f0ad4e', '#5cb85c', '#9b59b6', '#e67e22'];
const TONE = { good: '#1f7442', warn: '#8a5a00', poor: '#9a3220', plain: '#3b2a1e', blue: '#1c4fa8' };
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (t) => t * t * (3 - 2 * t);

// a small kit of boxes, shared with the model left in the town (town.js)
export function kit(THREE) {
  const geo = new THREE.BoxGeometry(1, 1, 1); const mats = new Map(); const texs = [];
  const mat = (c) => { if (!mats.has(c)) mats.set(c, new THREE.MeshLambertMaterial({ color: c })); return mats.get(c); };
  // a box by its size and the centre of its base
  const box = (parent, w, h, d, c, x, y, z) => { const m = new THREE.Mesh(geo, mat(c)); m.scale.set(w, h, d); m.position.set(x, y + h / 2, z); parent.add(m); return m; };
  const group = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  // a flat sign with words on it. It always faces the camera. px: its height on the screen (set by sizeLabels), or
  // world: its height in the scene's own units (for the town, where it should shrink with distance).
  const label = (parent, text, { tone = 'plain', px = 26, world = 0, x = 0, y = 0, z = 0 } = {}) => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas'); const g = c.getContext('2d'); const F = 44; g.font = `800 ${F}px Inter, system-ui, sans-serif`;
    const w = Math.ceil(g.measureText(text).width) + 36; c.width = w; c.height = F + 24;
    g.font = `800 ${F}px Inter, system-ui, sans-serif`; g.fillStyle = '#fffaf0'; g.beginPath(); g.roundRect ? g.roundRect(0, 0, w, c.height, 16) : g.rect(0, 0, w, c.height); g.fill();
    g.fillStyle = TONE[tone] || tone; g.beginPath(); g.roundRect ? g.roundRect(4, 4, w - 8, c.height - 8, 13) : g.rect(4, 4, w - 8, c.height - 8); g.fill();
    g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(text, w / 2, c.height / 2 + 2);
    const tex = new THREE.CanvasTexture(c); if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace; texs.push(tex);
    const m = new THREE.SpriteMaterial({ map: tex, sizeAttenuation: !!world, depthTest: !!world, depthWrite: false, fog: false, toneMapped: false }); texs.push(m);
    const sp = new THREE.Sprite(m); sp.center.set(0.5, 0); sp.position.set(x, y, z); sp.renderOrder = 20; sp.userData = { px, aspect: w / c.height };
    if (world) sp.scale.set(world * sp.userData.aspect, world, 1);
    parent.add(sp); return sp;
  };
  const dispose = () => { geo.dispose(); for (const m of mats.values()) m.dispose(); mats.clear(); for (const t of texs) t.dispose(); texs.length = 0; };
  return { box, group, label, dispose };
}
// a shared self-driving car: a rounded white pod with a teal band, the same at both ends
export function pod(k, parent, x = 0, z = 0, turn = 0) {
  const g = k.group(parent, x, 0.12, z); g.rotation.y = turn;
  k.box(g, 2.3, 0.5, 1.25, '#f6f3ea', 0, 0.25, 0); k.box(g, 2.3, 0.16, 1.27, '#18a999', 0, 0.42, 0); k.box(g, 1.9, 0.62, 1.15, '#2c4a5e', 0, 0.75, 0); k.box(g, 1.7, 0.12, 1.2, '#f6f3ea', 0, 1.37, 0);
  k.box(g, 0.3, 0.14, 0.3, '#ffd166', 0, 1.49, 0);
  for (const dx of [-0.75, 0.75]) for (const dz of [-0.62, 0.62]) k.box(g, 0.45, 0.45, 0.2, '#22262a', dx, 0, dz);
  return g;
}

export function createStreet(THREE, { reduce = false } = {}) {
  const root = new THREE.Group(); root.name = 'roads-street';
  const k = kit(THREE); const { box, group, label } = k; const labels = [];
  const sign = (parent, text, o) => { const sp = label(parent, text, o); if (sp) labels.push(sp); return sp; };

  // ---------- small things used again and again
  function car(parent, c, x, z, turn = 0) {
    const g = group(parent, x, 0.12, z); g.rotation.y = turn;
    box(g, 2.2, 0.55, 1.2, c, 0, 0.25, 0); box(g, 1.3, 0.5, 1.1, '#9fd0ee', -0.1, 0.8, 0); box(g, 1.2, 0.1, 1.15, c, -0.1, 1.3, 0);
    for (const dx of [-0.7, 0.7]) for (const dz of [-0.6, 0.6]) box(g, 0.45, 0.45, 0.2, '#22262a', dx, 0, dz);
    return g;
  }
  function person(parent, i, x, z) {
    const g = group(parent, x, 0.25, z);
    box(g, 0.34, 0.4, 0.26, '#3b4a5a', 0, 0, 0); box(g, 0.44, 0.5, 0.3, SHIRT[i % SHIRT.length], 0, 0.4, 0); box(g, 0.34, 0.34, 0.32, ['#f1c9a5', '#c68e5f', '#8a5a3c', '#e0ac7e'][i % 4], 0, 0.9, 0);
    box(g, 0.38, 0.1, 0.36, ['#3b2a1e', '#1f1a17', '#a8642a', '#d8b25a'][(i * 3) % 4], 0, 1.24, 0);
    return g;
  }
  // someone on a bicycle, facing across the street: two wheels with pale hubs, a bright frame, a rider with a helmet
  function cyclist(parent, i, x, z) {
    const g = group(parent, x, 0.14, z);
    for (const dz of [-0.62, 0.62]) { box(g, 0.1, 0.7, 0.7, '#2a2f35', 0, 0, dz); box(g, 0.12, 0.3, 0.3, '#d8dde2', 0, 0.2, dz); }
    box(g, 0.1, 0.12, 1.3, '#ff5a3c', 0, 0.42, 0); box(g, 0.1, 0.45, 0.1, '#ff5a3c', 0, 0.5, -0.2); box(g, 0.1, 0.5, 0.1, '#ff5a3c', 0, 0.5, 0.45); box(g, 0.5, 0.08, 0.1, '#2a2f35', 0, 1, 0.45);
    box(g, 0.4, 0.5, 0.3, SHIRT[i % SHIRT.length], 0, 0.95, -0.15); box(g, 0.32, 0.32, 0.32, '#e0ac7e', 0, 1.45, -0.1); box(g, 0.38, 0.14, 0.4, '#ffd166', 0, 1.77, -0.1); box(g, 0.2, 0.4, 0.2, '#3b4a5a', 0, 0.55, -0.1);
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
  box(fixed, 400, 1, 400, '#8fcf74', 20, -1.02, 0);
  box(fixed, 52, 0.12, 6, '#5b6168', 20, 0, 0);                          // the street
  box(fixed, 3.4, 0.12, 30, '#5b6168', slotX(JUNCTION), 0, 18);          // the side road
  box(fixed, 52, 0.25, 2, '#e3d8c2', 20, 0, -4);                         // pavements
  box(fixed, slotX(JUNCTION) - 1.7 + 6, 0.25, 2, '#e3d8c2', (slotX(JUNCTION) - 1.7 - 6) / 2, 0, 4);
  box(fixed, 46 - (slotX(JUNCTION) + 1.7), 0.25, 2, '#e3d8c2', (46 + slotX(JUNCTION) + 1.7) / 2, 0, 4);
  for (let x = -5; x < 46; x += 3) box(fixed, 1.2, 0.02, 0.16, '#f3efe2', x, 0.12, 0);   // centre line
  box(fixed, 1.5, 0.14, 30, '#d98b7a', slotX(6), 0, -20);                // the cycle track, north and south
  box(fixed, 1.5, 0.14, 30, '#d98b7a', slotX(6), 0, 20);
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
  // name signs for the places the helper strip names
  const names = group(root);
  sign(names, 'Shop', { x: slotX(0), y: 3.2, z: 8.4, px: 22 }); sign(names, 'School', { x: slotX(8), y: 5.4, z: 10, px: 22 }); sign(names, 'Homes', { x: slotX(2) + 2, y: 4.4, z: -9, px: 22 });
  const parkName = sign(names, 'Car park', { x: slotX(2) + 2, y: 2.2, z: 12.4, px: 22 });
  const setNames = (on) => { names.visible = !!on; };

  // ---------- the pieces the child places
  const pieces = group(root);
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
      if (idle) for (let i = 0; i < BAY_CARS; i++) pod(k, g, -1.26 + i * 1.26, 4, Math.PI / 2).scale.set(0.8, 0.8, 0.8);
    } else {
      const cyc = kind === 'cycle';
      for (let i = -2; i <= 2; i++) box(g, 0.42, 0.03, 5.9, cyc ? '#f2a08c' : '#f7f4ea', i * 0.75, 0.12, 0);
      for (const dz of [-3.5, 3.5]) { box(g, 0.14, 2, 0.14, cyc ? '#2f6fd8' : '#22262a', 1.9, 0.25, dz); box(g, 0.14, 0.4, 0.15, '#f7f4ea', 1.9, 1.05, dz); box(g, cyc ? 0.6 : 0.45, cyc ? 0.6 : 0.45, cyc ? 0.12 : 0.45, cyc ? '#2f6fd8' : '#ffb000', 1.9, 2.25, dz); }
    }
    return g;
  }
  let layoutNow = Array(SLOTS).fill(null);
  function setLayout(layout, { idle = true } = {}) {
    layoutNow = layout.slice(); pieces.clear();
    layout.forEach((kind, s) => { if (kind) drawPiece(kind, s, idle); });
  }

  // ---------- the old street: parked cars along both kerbs
  const old = group(root);
  for (let s = 0; s < SLOTS; s++) { if (s === JUNCTION) continue; car(old, CARC[s % 6], slotX(s) - 0.2, -2.2); car(old, CARC[(s + 3) % 6], slotX(s) + 0.3, 2.2); }
  const setOld = (on) => { old.visible = !!on; };

  // ---------- the car park: four plots. 'full' (before), null (empty, waiting for a choice), or a use
  const plots = group(root); const PLOT_Z = 9.6;
  function drawPlot(n, use, lettered) {
    const g = group(plots, slotX(CARPARK[n]), 0, PLOT_Z); const W = 3.7, D = 7.6;
    const lot = () => { box(g, W, 0.14, D, '#7a8088', 0, 0, 0); for (let i = -1; i <= 1; i++) box(g, W, 0.02, 0.08, '#f3efe2', 0, 0.14, i * 2.4); };
    if (use === 'full') { lot(); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) car(g, CARC[(n * 5 + r * 2 + c) % 6], -0.9 + c * 1.8, -2.5 + r * 2.4 + 0.1, Math.PI / 2).scale.set(0.72, 0.72, 0.72); }
    else if (use === 'shared') { lot(); for (let c = 0; c < 2; c++) { pod(k, g, -0.9 + c * 1.8, -2.4, Math.PI / 2).scale.set(0.72, 0.72, 0.72); box(g, 0.25, 1, 0.25, '#2e9b5a', -0.9 + c * 1.8, 0.14, -0.9); } box(g, 2.6, 0.1, 2.2, '#2c4a5e', 0, 1.9, 2.2); for (const dx of [-1.2, 1.2]) for (const dz of [1.2, 3.2]) box(g, 0.14, 1.8, 0.14, '#5a6068', dx, 0.14, dz); pod(k, g, 0, 2.2, Math.PI / 2).scale.set(0.72, 0.72, 0.72); }
    else if (use === 'homes') { box(g, W, 0.1, D, '#a7d48c', 0, 0, 0); for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) house(g, -0.92 + c * 1.84, -1.9 + r * 3.9, 1.7, 2.6, 2.2 + ((r + c) % 2) * 0.5, ['#f4e6d2', '#e9c9a0'][(r + c) % 2], ['#b5523b', '#7a5a4a'][(r + c + 1) % 2], -1); }
    else if (use === 'park') { box(g, W, 0.14, D, '#7cc46a', 0, 0, 0); tree(g, -1, -2.6, 0.9); tree(g, 1, 2.6, 1); box(g, 1.6, 0.1, 1.6, '#e8d9a8', 0.7, 0.14, -0.6); box(g, 0.14, 1.4, 0.14, '#d9534f', 0.2, 0.14, -0.6); box(g, 0.14, 1.4, 0.14, '#d9534f', 1.2, 0.14, -0.6); box(g, 1.2, 0.14, 0.14, '#d9534f', 0.7, 1.5, -0.6); box(g, 0.4, 0.1, 0.3, '#f0ad4e', 0.7, 0.6, -0.6); box(g, 1.3, 0.3, 0.4, '#b08a55', -0.9, 0.14, 1.2); person(g, n + 1, -0.3, 0.2).scale.set(0.8, 0.8, 0.8); }
    else if (use === 'garden') { box(g, W, 0.12, D, '#8a6a48', 0, 0, 0); for (let r = 0; r < 5; r++) { box(g, W - 0.6, 0.18, 0.6, '#6b4a33', 0, 0.12, -3 + r * 1.1); for (let c = 0; c < 5; c++) box(g, 0.34, 0.3, 0.34, r % 2 ? '#5aa84f' : '#8fd06a', -1.3 + c * 0.65, 0.3, -3 + r * 1.1); } box(g, 2.2, 1.2, 1.5, '#cfeee6', 0, 0.12, 2.8); box(g, 2.4, 0.2, 1.7, '#9ad6c8', 0, 1.32, 2.8); }
    else if (use === 'parking') { lot(); for (let r = 0; r < 2; r++) car(g, CARC[(n + r * 2) % 6], -0.9 + r * 1.8, -2.4 + r * 2.4, Math.PI / 2).scale.set(0.72, 0.72, 0.72); box(g, 0.12, 1.8, 0.12, '#5a6068', 1.5, 0.14, -3.5); box(g, 0.6, 0.6, 0.08, '#2f6fd8', 1.5, 1.6, -3.5); }
    else { box(g, W, 0.14, D, '#b9b2a2', 0, 0, 0); for (const [dx, dz, w, d] of [[0, -D / 2, W, 0.14], [0, D / 2, W, 0.14], [-W / 2, 0, 0.14, D], [W / 2, 0, 0.14, D]]) box(g, w, 0.1, d, '#ffd166', dx, 0.14, dz); }
    // a lettered sign on a post at the front of each plot the child may choose (A, B, C), and one for the shared cars
    if (lettered) { box(g, 0.16, 4.6, 0.16, '#5a4a3a', -W / 2 + 0.2, 0.14, D / 2 - 0.2); sign(g, n < 3 ? 'ABC'[n] : 'Shared cars', { tone: n < 3 ? 'blue' : 'good', px: n < 3 ? 34 : 22, x: -W / 2 + 0.2, y: 4.6, z: D / 2 - 0.2 }); }
  }
  // state: 'full' for the old car park, or { plots: [use|null ×3], letters } once the shared cars have the fourth plot
  function setPlots(state) {
    for (const sp of plots.children.flatMap((g) => g.children.filter((c) => c.isSprite))) { const i = labels.indexOf(sp); if (i >= 0) labels.splice(i, 1); }
    plots.clear(); if (parkName) parkName.visible = state === 'full';
    for (let n = 0; n < CARPARK.length; n++) drawPlot(n, state === 'full' ? 'full' : n === 3 ? 'shared' : state.plots[n], state !== 'full' && !!state.letters);
  }

  // ---------- a kerb frame round the chosen place, and an arrow that shows where to tap first
  const frame = group(root); for (const [dx, dz, w, d] of [[0, -3.1, S, 0.16], [0, 3.1, S, 0.16], [-S / 2, 0, 0.16, 6.3], [S / 2, 0, 0.16, 6.3]]) box(frame, w, 0.1, d, '#ffd166', dx, 0.13, dz); frame.visible = false;
  function setFocus(slot) { frame.visible = Number.isInteger(slot) && slot >= 0 && slot < SLOTS; if (frame.visible) frame.position.x = slotX(slot); }
  const hint = group(root, slotX(3), 0, 0); hint.visible = false;
  { for (const [dx, dz, w, d] of [[0, -3.1, S, 0.3], [0, 3.1, S, 0.3], [-S / 2, 0, 0.3, 6.5], [S / 2, 0, 0.3, 6.5]]) box(hint, w, 0.14, d, '#ffb000', dx, 0.13, dz);
    const a = group(hint, 0, 2.4, -1.6); a.name = 'arrow'; box(a, 0.7, 1.8, 0.7, '#ffb000', 0, 1.1, 0); box(a, 1.7, 0.5, 0.7, '#ffb000', 0, 0.75, 0); box(a, 1.1, 0.45, 0.7, '#ffb000', 0, 0.35, 0); box(a, 0.5, 0.4, 0.7, '#ffb000', 0, 0, 0);
    sign(hint, 'Tap the street', { tone: 'plain', px: 26, y: 5.4, z: -1.6 }); }
  const setHint = (on) => { hint.visible = !!on; };

  // ---------- where the numbers come from: flags at the three crossing places, the furthest home and its walk,
  // the drop-off point with the longest wait and the one where the queue formed. list: words.marks(res)
  const marks = group(root); let markParts = [];
  function setMarks(list, sel = null) {
    for (const p of markParts) for (const sp of p.signs) { const i = labels.indexOf(sp); if (i >= 0) labels.splice(i, 1); }
    marks.clear(); markParts = []; if (!list) return;
    list.forEach((m, i) => {
      const g = group(marks); const signs = []; const add = (text, o) => { const sp = sign(g, text, o); if (sp) signs.push(sp); return sp; };
      if (m.id === 'safe') {
        const x = slotX(m.line) - 1.25; const fig = m.who === 'cycle' ? cyclist(g, i + 3, x, -4.1) : person(g, i + 3, x, -4.1); fig.scale.setScalar(1.25);
        box(g, 0.14, 3.2, 0.14, '#5a4a3a', x + 0.8, 0.25, -4.1); box(g, 1.3, 0.8, 0.14, m.tone === 'good' ? '#2e9b5a' : '#ff9d00', x + 1.45, 2.6, -4.1); box(g, 0.2, m.tone === 'good' ? 0.2 : 0.4, 0.18, '#fff', x + 1.45, m.tone === 'good' ? 2.9 : 2.9, -4.1); if (m.tone !== 'good') box(g, 0.2, 0.14, 0.18, '#fff', x + 1.45, 2.68, -4.1);
        const s = add(m.text, { tone: m.tone, px: 22, x: x + 0.8, y: 3.7, z: -4.1 }); if (s) s.userData.only = 'safe';
      } else if (m.id === 'walk') {
        const hx = slotX(m.slot), dx = slotX(m.to); for (const [ox, oz, w, d] of [[0, -1.95, 3.8, 0.25], [0, 1.95, 3.8, 0.25], [-1.9, 0, 0.25, 4.1], [1.9, 0, 0.25, 4.1]]) box(g, w, 0.2, d, '#ffd166', hx + ox, 0.02, -8.2 + oz);
        const n = Math.max(1, Math.round(Math.abs(dx - hx) / 1.4)); for (let j = 0; j <= n; j++) box(g, 0.5, 0.08, 0.5, '#ffd166', lerp(hx - 0.75, dx, j / n), 0.26, -5.3);
        person(g, 4, hx - 0.75, -5.9).scale.setScalar(1.2);
        add(m.text, { tone: m.tone, px: 24, x: hx, y: 4.6, z: -8.2 });
      } else if (m.id === 'wait') {
        const x = slotX(m.slot); person(g, 1, x + 0.6, -4.1).scale.setScalar(1.25); box(g, 0.9, 0.9, 0.14, '#fffaf0', x - 0.6, 2.9, -4.4); box(g, 0.1, 0.34, 0.16, '#3b2a1e', x - 0.6, 3.3, -4.4); box(g, 0.3, 0.1, 0.16, '#3b2a1e', x - 0.5, 3.24, -4.4); box(g, 0.12, 0.5, 0.12, '#5a4a3a', x - 0.6, 2.4, -4.4);
        add(m.text, { tone: m.tone, px: 24, x, y: 4, z: -4.4 });
      } else if (m.id === 'queue') {
        const x = slotX(m.slot); for (let q = 0; q < Math.min(6, m.n); q++) pod(k, g, x + q * 2.7, -1.7);
        add(m.text, { tone: m.tone, px: 24, x: x + Math.min(5, m.n - 1) * 1.35, y: 1.9, z: 1.2 });
      }
      markParts.push({ id: m.id, g, signs });
    });
    selectMark(sel);
  }
  // show one number's marks alone (or all of them, with the crossing flags' words hidden so the street stays clear)
  function selectMark(sel) {
    for (const p of markParts) { p.g.visible = !sel || p.id === sel; for (const sp of p.signs) if (sp.userData.only) sp.visible = sel === sp.userData.only; }
  }

  // ---------- the morning: shared cars and people moved by the simulation's own times
  const actors = group(root); let run = null; const sx = (s) => s * S + S / 2;
  function startRun(sim) {
    actors.clear(); setLayout(layoutNow, { idle: false });
    const cars = sim.cars.map((c) => {
      const perBay = sim.cars.filter((o) => o.bay === c.bay && o.i < c.i).length; const g = pod(k, actors, 0, 0); g.scale.set(0.9, 0.9, 0.9);
      const trips = sim.log.filter((t) => t.car === c.i).map((t) => { const from = c.bay === null ? EXIT : c.bay; const a = route(from, t.drop, layoutNow), o = route(t.drop, EXIT, layoutNow), b = c.bay === null ? null : route(EXIT, c.bay, layoutNow); return { t, from, a, o, b, aStart: t.arrive - a.dur, bStart: b ? t.back - b.dur : 0 }; });
      return { ...c, g, home: c.bay === null ? null : { x: slotX(c.bay) - 1.26 + perBay * 1.26, z: 4 }, trips, x: 0, on: false };
    });
    const people = sim.log.map((t, i) => ({ t, g: person(actors, i, 0, 0), off: ((i * 7) % 5) * 0.3 - 0.6 }));
    // a car's waits at marked crossings: someone crosses in front of it (seen in the slow opening of the morning)
    const waits = []; for (const c of cars) for (const tr of c.trips) for (const [r, t0] of [[tr.a, tr.aStart], [tr.o, tr.t.leave], [tr.b, tr.bStart]]) if (r) for (const p of r.pauses) waits.push({ slot: p.slot, from: t0 + p.from, to: t0 + p.to });
    const walkers = Array.from({ length: 4 }, (_, i) => { const g = person(actors, i + 1, 0, 0); g.visible = false; return g; });
    // the people who cross every morning at the shop, the cycle track and the school
    const lines = sim.crossings.map((c, i) => { const g = c.who === 'cycle' ? cyclist(actors, i + 3, 0, 0) : person(actors, i + 3, 0, 0); g.scale.setScalar(1.15); const flag = group(actors); box(flag, 0.12, 2.8, 0.12, '#5a4a3a', 0, 0.25, 0); box(flag, 1.1, 0.7, 0.12, c.safe ? '#2e9b5a' : '#ff9d00', 0.6, 2.3, 0); if (!c.safe) { box(flag, 0.18, 0.34, 0.16, '#fff', 0.6, 2.58, 0); box(flag, 0.18, 0.12, 0.16, '#fff', 0.6, 2.38, 0); } flag.position.set(slotX(c.safe ? c.at : c.slot) - 0.4, 0, -4.3); return { c, g, x: slotX(c.safe ? c.at : c.slot) - 1.2, state: 'wait', since: -i * 0.9, dir: 1 }; });
    run = { sim, cars, people, waits, walkers, lines, last: null }; return updateRun(0, 0, true);
  }
  // time: seconds into the simulated morning. real: seconds on the wall (for the people crossing). slow: the opening.
  // still: nothing moves by itself (a still picture for reduced motion). Returns what is on the street now.
  function updateRun(time, real = 0, slow = false, still = false) {
    if (!run) return { waiting: 0, cars: 0 };
    let onStreet = 0;
    for (const c of run.cars) {
      let pos = c.home ? { x: c.home.x, z: c.home.z, turn: Math.PI / 2 } : null;
      for (const tr of c.trips) {
        const t = tr.t; if (time < tr.aStart) break;
        const dx = slotX(t.drop); const side = Math.sign(tr.from - t.drop) || 1; const qx = dx + side * t.ahead * 2.7;
        if (time < t.arrive) { const s = tr.a.pos(time - tr.aStart); let x = sx(s); x = side > 0 ? Math.max(x, qx) : Math.min(x, qx); const p = clamp(Math.abs(s - tr.from) / 0.7); pos = { x: c.home ? lerp(c.home.x, x, p) : x, z: c.home ? lerp(c.home.z, -1.7, smooth(p)) : -1.7, turn: 0 }; }
        else if (time < t.board) { const p = clamp((time - (t.board - 8)) / 8); pos = { x: lerp(qx, dx, p), z: -1.7, turn: 0 }; }
        else if (time < t.leave) pos = { x: dx, z: -1.7, turn: 0 };
        else if (time < t.out) pos = { x: sx(tr.o.pos(time - t.leave)), z: -1.7, turn: 0 };
        else if (c.home && time < t.back) { if (time < tr.bStart) pos = null; else { const s = tr.b.pos(time - tr.bStart); const p = clamp(Math.abs(s - c.bay) / 0.7); pos = { x: lerp(c.home.x, sx(s), p), z: lerp(c.home.z, 1.5, smooth(p)), turn: 0 }; } }
        else pos = c.home ? { x: c.home.x, z: c.home.z, turn: Math.PI / 2 } : null;
      }
      c.g.visible = !!pos; c.on = !!pos && pos.turn === 0; c.x = pos ? pos.x : 0; if (pos) { c.g.position.set(pos.x, 0.12, pos.z); c.g.rotation.y = pos.turn; if (c.on) onStreet++; }
    }
    let waiting = 0;
    for (const p of run.people) {
      const t = p.t; const vis = time >= t.ask && time < t.board + 20; p.g.visible = vis; if (!vis) continue; if (time >= t.ready && time < t.board) waiting++;
      const a = clamp((time - t.ask) / Math.max(1, t.ready - t.ask)); const hx = slotX(t.home) - 0.75, dx = slotX(t.drop) + p.off;
      if (time < t.board) p.g.position.set(lerp(hx, dx, a), 0.25, lerp(-5.6, -4, clamp(a * 3)));
      else p.g.position.set(dx, 0.25, lerp(-4, -2.4, clamp((time - t.board) / 20)));
    }
    // someone crosses in front of each car that is giving way (only worth drawing while the morning runs slowly)
    const now = slow || still ? run.waits.filter((w) => time >= w.from && time < w.to) : [];
    run.walkers.forEach((g, i) => { const w = now[i]; g.visible = !!w; if (w) g.position.set(slotX(w.slot) + 0.3 * (i % 2 ? 1 : -1), 0.14, lerp(-3.6, 3.6, clamp((time - w.from) / (w.to - w.from)))); });
    // the regular crossers: on a marked crossing they cross when no car is on it; with no markings they wait at the kerb
    const dt = run.last === null ? 0 : Math.max(0, real - run.last); run.last = real;
    for (const l of run.lines) {
      const near = run.cars.some((c) => c.on && Math.abs(c.x - l.x) < 3.4);
      if (still) { l.g.position.set(l.x, 0.14, l.c.safe && !near ? 0.4 : -4.1); continue; }
      l.since += dt;
      if (l.state === 'wait' && l.c.safe && l.since > 2.2 && !near) { l.state = 'cross'; l.since = 0; }
      if (l.state === 'cross' && l.since > 1.8) { l.state = 'wait'; l.since = 0; l.dir = -l.dir; }
      const p = l.state === 'cross' ? smooth(clamp(l.since / 1.8)) : 0; const from = l.dir > 0 ? -4.1 : 4.1;
      l.g.position.set(l.x, 0.14, l.state === 'cross' ? lerp(from, -from, p) : from); l.g.rotation.y = l.dir > 0 ? 0 : Math.PI;
    }
    return { waiting, cars: onStreet };
  }
  function endRun() { run = null; actors.clear(); setLayout(layoutNow, { idle: true }); }

  // ---------- the ride: one shared car, and someone crossing in front of it
  const ride = group(root); const rideCar = pod(k, ride, 0, -1.5); const walker = person(ride, 2, 0, -4); const rider = cyclist(ride, 4, 0, -4); ride.visible = false;
  function setRide(x, cross = null) {
    ride.visible = x !== null; if (x === null) return;
    rideCar.position.x = x; const fig = cross && cross.kind === 'cycle' ? rider : walker; walker.visible = !!cross && fig === walker; rider.visible = !!cross && fig === rider;
    if (cross) fig.position.set(slotX(cross.slot), 0.14, lerp(-3.6, 3.6, clamp(cross.p)));
  }

  // which place on the street is under a ray (in the set's own coordinates), or -1
  function slotAt(origin, dir) {
    if (Math.abs(dir.y) < 1e-6) return -1; const t = -origin.y / dir.y; if (t <= 0) return -1;
    const x = origin.x + dir.x * t, z = origin.z + dir.z * t; if (z < -5.6 || z > 5.6 || x < 0 || x >= SLOTS * S) return -1;
    return Math.floor(x / S);
  }
  // signs keep the same size on the screen. fov: the camera's, in degrees. viewH: the view's height in CSS pixels.
  function sizeLabels(fov, viewH, scale = 1) {
    const unit = (2 * Math.tan((fov * Math.PI) / 360)) / Math.max(1, viewH);
    for (const sp of labels) { const h = sp.userData.px * scale * unit; sp.scale.set(h * sp.userData.aspect, h, 1); }
  }
  // the arrow over the first place to tap bobs gently (it stands still with reduced motion)
  function tick(real) { if (hint.visible && !reduce) hint.getObjectByName('arrow').position.y = 2.4 + Math.sin(real * 4) * 0.35; }
  function dispose() { root.removeFromParent(); k.dispose(); }

  setLayout(layoutNow); setPlots('full'); setOld(true);
  return { root, setLayout, setOld, setPlots, setFocus, setHint, setNames, setMarks, selectMark, startRun, updateRun, endRun, setRide, slotAt, sizeLabels, tick, dispose, lineSlots: LINES.map((l) => l.slot) };
}
