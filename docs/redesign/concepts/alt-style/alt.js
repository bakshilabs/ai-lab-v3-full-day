// An ALTERNATE LOOK for the world of six towns (owner, 22 Nov 2026). This is a proposal that sits beside the present look
// (animation/map.js, a copy of the game's worldmap.js); it replaces nothing and is used by nothing. The six towns stand in
// the same places and have the same names. The styling is taken from the "car town" half of concept screen 3: long views,
// taller and denser buildings with many windows, warm lit windows, soft haze with distance, few colours, tidy repetition.
// The content is an eco town: streets for walking, cycling and trams, trees, green roofs, solar, wind, water and markets.
// There are no cars. The haze is light and distance, never pollution.
import * as MAP from '../../animation/map.js';
import { THREE, blk, group, hash, GL, soft, fig, SKIN, HAIR } from '../kit-v2.js';
const { TOWNS, box, bake } = MAP, T = Object.fromEntries(TOWNS.map((t) => [t.id, t])), W = 1280, H = 720;
const rnd = (a, b = 0, c = 0) => hash(a * 1.31 + c * 7.7, b * 2.17 + 3.3);

// ---- the few colours of the style -------------------------------------------------------------------------------------
const C = { pave: ['#e6dcc8', '#e0d5bf', '#eadfcc'], plaza: '#f0e6d2', grass: ['#9ccf7f', '#93c876', '#a6d589'], sea: '#7fc4e6', sand: '#ecd9ac', rail: '#6b6f7a', trunk: '#7a5a33',
  leaf: ['#5fa35a', '#4f9550', '#74b56a'], green: '#7fb069', greenDeep: '#6a9a58', solar: '#2f4f8f', timber: '#c99a66', cream: '#efe4cf', sandw: '#dccaa9', grey: '#cfc6b8', rose: '#d2a08a', glassw: '#cfe0ea', white: '#f7f3ea',
  water: '#6cb7d6', cliff: ['#c9b08a', '#bfa57e', '#b59a74'] };
// a wall of windows, drawn once as a small picture and repeated: some windows are lit warm, the rest reflect the sky
function facade(wall, seed, lit = 0.19, glass = '#6f8aa4') {
  const mk = (em) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = em ? '#000' : wall; x.fillRect(0, 0, 64, 64);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { const on = rnd(r, q, seed) < lit; if (!em) { x.fillStyle = 'rgba(0,0,0,0.10)'; x.fillRect(q * 16, r * 16 + 14, 16, 2); } x.fillStyle = em ? (on ? '#ffc56a' : '#000') : (on ? '#ffe2a0' : glass); x.fillRect(q * 16 + 4, r * 16 + 3, 8, 9); if (!em) { x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(q * 16 + 4, r * 16 + 12, 8, 1); } }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t; };
  return new THREE.MeshLambertMaterial({ map: mk(false), emissiveMap: mk(true), emissive: '#ffffff', emissiveIntensity: 0.85 });
}
const FAC = {}, fac = (k) => FAC[k]; let ROOF = null;
function materials() { if (ROOF) return; ROOF = new THREE.MeshLambertMaterial({ color: '#d9cfbd' });
  [['timber', C.timber], ['cream', C.cream], ['sand', C.sandw], ['grey', C.grey], ['rose', C.rose], ['white', C.white]].forEach(([k, c], i) => { FAC[k] = facade(c, i + 1); FAC[k + '2'] = facade(c, i + 11, 0.13); });
  FAC.glass = facade(C.glassw, 31, 0.18, '#8fb4cc'); FAC.glass2 = facade('#dfe9ee', 37, 0.14, '#7fa6c2'); }
const CELL = 0.8, FLOOR = 0.78;
// one building: a block whose four sides carry the windows. Its roof is finished by the caller.
function bldg(g, x, y, z, w, h, d, k) { const ge = new THREE.BoxGeometry(w, h, d), uv = ge.attributes.uv, su = [d, d, 0, 0, w, w], nf = Math.max(1, Math.round(h / FLOOR));
  for (const f of [0, 1, 4, 5]) { const nu = Math.max(1, Math.round(su[f] / CELL)); for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * nu / 4, uv.getY(i) * nf / 4); } }
  const s = fac(k), m = new THREE.Mesh(ge, [s, s, ROOF, ROOF, s, s]); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; }
const B = (g, x, z, w, d, y, h, c, sh = true) => box(g, w, h, d, x, y + h / 2, z, c, sh);
const treeAt = (g, x, y, z, k = 1, c) => { const col = c || C.leaf[Math.floor(rnd(x, z) * 3)]; B(g, x, z, 0.14 * k, 0.14 * k, y, 0.5 * k, C.trunk); B(g, x, z, 0.62 * k, 0.62 * k, y + 0.4 * k, 0.5 * k, col); B(g, x, z, 0.4 * k, 0.4 * k, y + 0.9 * k, 0.3 * k, col); };
// what goes on a roof: plants, solar panels, or a landing pad
function roof(g, x, y, z, w, d, kind, tint) {
  if (kind === 'solar') { B(g, x, z, w - 0.2, d - 0.2, y, 0.06, '#bfb6a6'); const n = Math.max(1, Math.floor((d - 0.5) / 0.6)); for (let k = 0; k < n; k++) B(g, x, z - (n - 1) * 0.3 + k * 0.6, w - 0.6, 0.36, y + 0.06, 0.1, C.solar); }
  else if (kind === 'pad') { B(g, x, z, w + 0.3, d + 0.3, y, 0.12, '#ffd257'); B(g, x, z, w * 0.5, 0.2, y + 0.12, 0.03, '#2b3a55', false); B(g, x, z, 0.2, d * 0.5, y + 0.12, 0.03, '#2b3a55', false); }
  else { B(g, x, z, w - 0.16, d - 0.16, y, 0.1, rnd(x, z, 4) > 0.5 ? C.green : C.greenDeep); if (w > 1.6 && rnd(x, z, 5) > 0.35) treeAt(g, x + w * 0.2, y + 0.1, z - d * 0.18, 0.7); if (rnd(x, z, 6) > 0.6) B(g, x - w * 0.2, z + d * 0.2, 0.5, 0.5, y + 0.1, 0.25, tint); }
}
function block(g, x, y, z, w, d, h, k, rk, tint) { bldg(g, x, y + 0.5, z, w, h, d, k); B(g, x, z, w + 0.08, d + 0.08, y, 0.5, '#8a6a48'); B(g, x, z, w + 0.3, d + 0.3, y + 0.5, 0.08, tint); roof(g, x, y + 0.5 + h, z, w, d, rk, tint); }
const tram = (g, x, y, z, alongX, c = '#f7f3ea', c2 = '#2e9b5a') => { const p = group(g, x, y, z); if (!alongX) p.rotation.y = Math.PI / 2; for (const a of [-1.15, 1.15]) { B(p, a, 0, 2.2, 0.62, 0.1, 0.5, c); B(p, a, 0, 2.22, 0.64, 0.1, 0.16, c2, false); B(p, a, 0, 1.9, 0.66, 0.36, 0.18, '#3f5a78', false); B(p, a, 0, 2.1, 0.5, 0.6, 0.06, '#c9d2da', false); } B(p, 0, 0, 0.12, 0.5, 0.15, 0.4, '#2b3a55', false); return p; };
const stall = (g, x, y, z, c) => { B(g, x, z, 0.8, 0.5, y, 0.28, '#c9925a'); for (let k = 0; k < 4; k++) B(g, x - 0.33 + k * 0.22, z, 0.22, 0.7, y + 0.62, 0.05, k % 2 ? '#fbfbf7' : c); for (const a of [-0.36, 0.36]) B(g, x + a, z - 0.2, 0.04, 0.04, y + 0.28, 0.36, C.trunk, false); for (const [a, col] of [[-0.22, '#e8402f'], [0, '#62b653'], [0.22, '#ffd257']]) B(g, x + a, z, 0.18, 0.3, y + 0.28, 0.1, col, false); };
const turbine = (g, x, y, z, k = 1, rot = 0.4) => { const p = group(g, x, y, z); blk(p, 0, 0, 0.3 * k, 0.3 * k, 0, 6 * k, '#f7f3ea'); const hub = group(p, 0, 6 * k, 0.25 * k); for (let i = 0; i < 3; i++) { const b = group(hub); b.rotation.z = i * 2.094 + rot; blk(b, 0, 0, 0.28 * k, 0.08, 0.1, 2.6 * k, '#f7f3ea'); } blk(p, 0, 0.1 * k, 0.4 * k, 0.5 * k, 5.8 * k, 0.4 * k, '#f7f3ea'); return p; };

// ---- the land: the six towns of the present map, joined by green ways, standing in a calm sea ---------------------------
const wob = (x, z) => Math.sin(x * 0.63 + z * 0.31) * 0.05 + Math.sin(z * 0.87 - x * 0.41) * 0.05;
const ell = (t, x, z) => ((x - t.c[0]) / t.r[0]) ** 2 + ((z - t.c[1]) / t.r[1]) ** 2;
const LINKS = [['eco', 'drone'], ['eco', 'power'], ['eco', 'robot'], ['eco', 'roads'], ['eco', 'film'], ['roads', 'film'], ['power', 'robot'], ['drone', 'roads'], ['drone', 'power']];
const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * u, z - a[1] - dz * u); };
const linkD = (x, z) => Math.min(...LINKS.map(([a, b]) => segD(x, z, T[a].c, T[b].c)));
const owner = (x, z) => { let m = 9, o = null; for (const t of TOWNS) { const v = ell(t, x, z); if (v < m) { m = v; o = t; } } return [o, m]; };
const rivX = (z) => -7.4 + Math.sin(z * 0.33) * 1.5;
const P = { eco: { pitch: 4.3, st: 1.1 }, drone: { pitch: 4.6, st: 1.3 }, robot: { pitch: 5.4, st: 1.0 }, roads: { pitch: 4.1, st: 1.1 }, film: { pitch: 4.6, st: 1.1 }, power: { pitch: 5.2, st: 1.1 } };
const mod = (a, n) => ((a % n) + n) % n;
// the height of the ground: Drone City stands on a low terrace and Power Ridge climbs in steps
const yAt = (x, z) => { const [t, v] = owner(x, z); if (v > 1) return 0; if (t.id === 'power') return Math.min(3, Math.floor((1 - v) * 5)) * 0.7; if (t.id === 'drone') return v < 0.8 ? 0.5 : 0; return 0; };
const isStreet = (t, x, z) => { const p = P[t.id], u = x - t.c[0], w = z - t.c[1]; return Math.abs(u) < 0.9 || Math.abs(w) < 0.9 || mod(u + p.st / 2, p.pitch) < p.st || mod(w + p.st / 2, p.pitch) < p.st; };

function build(root) {
  materials(); const G = group(root), D = group(root);   // G is baked into one shape; D holds the buildings and moving things
  // ground
  for (let x = -46; x <= 44; x++) for (let z = -36; z <= 30; z++) { const X = x + 0.5, Z = z + 0.5, [t, v0] = owner(X, Z), v = v0 + wob(X, Z), ld = linkD(X, Z); if (v > 1 && ld > 2.3) continue;
    const y = v > 1 ? 0 : yAt(X, Z), r = rnd(x, z); let c;
    if (v > 1) c = ld < 0.9 ? C.pave[Math.floor(r * 3)] : C.grass[Math.floor(r * 3)];
    else if (t.id === 'eco' && Math.abs(X - rivX(Z)) < 0.9 && v < 0.98) { B(G, X, Z, 1, 1, -2, 1.55, r > 0.5 ? C.water : '#62accb'); continue; }
    else if (v > 0.9) c = t.id === 'film' && Z > t.c[1] ? C.sand : C.grass[Math.floor(r * 3)];
    else if (t.id === 'robot' && !(Math.abs(X - t.c[0]) < 1.4 || Math.abs(Z - t.c[1]) < 1.4)) c = C.grass[Math.floor(r * 3)];
    else c = isStreet(t, X, Z) ? C.pave[Math.floor(r * 3)] : C.plaza;
    B(G, X, Z, 1, 1, -2, y + 2, c); if (v > 0.93 || (v > 1 && ld > 1.6)) B(G, X, Z, 1.02, 1.02, -2, 1.5, C.cliff[Math.floor(r * 3)]); }
  // green ways between the towns: a row of trees on each side
  for (const [a, b] of LINKS) { const A = T[a].c, Bc = T[b].c, L = Math.hypot(Bc[0] - A[0], Bc[1] - A[1]), nx = -(Bc[1] - A[1]) / L, nz = (Bc[0] - A[0]) / L; for (let s = 0; s < L; s += 1.5) { const x = A[0] + (Bc[0] - A[0]) * s / L, z = A[1] + (Bc[1] - A[1]) * s / L; if (owner(x, z)[1] < 0.95) continue; for (const k of [-1, 1]) treeAt(G, x + nx * 1.5 * k, 0, z + nz * 1.5 * k, 1.1); } }
  for (const t of TOWNS) town(t, G, D);
  bake(G); return { G, D };
}
function town(t, G, D) {
  const p = P[t.id], [cx, cz] = t.c, tint = t.tint, id = t.id;
  // tram lines on the two wide streets, with trees along them
  for (const along of [true, false]) { const R = along ? t.r[0] : t.r[1]; for (let s = -R + 1.5; s <= R - 1.5; s += 0.5) { const x = along ? cx + s : cx, z = along ? cz : cz + s; if (ell(t, x, z) > 0.86 || (id === 'robot' && !along)) continue; const y = yAt(x, z);
      for (const k of [-0.28, 0.28]) B(G, along ? x : x + k, along ? z + k : z, along ? 0.5 : 0.07, along ? 0.07 : 0.5, y, 0.03, C.rail, false);
      if (mod(s, 2.5) < 0.5 && Math.abs(s) > 2 && !(id === 'eco' && !along && s > 6.6)) for (const k of [-1, 1]) treeAt(G, along ? x : x + k * (id === 'eco' ? 1.55 : 1.05), y, along ? z + k * 1.05 : z, 0.95); } }
  const tr = { eco: [[4, true], [-5, false]], drone: [[-5, true]], roads: [[5, true], [4, false], [-6, true]], film: [[-4, true]], power: [[3, true]], robot: [[4, true]] }[id];
  for (const [s, along] of tr) tram(D, along ? cx + s : cx, yAt(along ? cx + s : cx, along ? cz : cz + s) + 0.03, along ? cz : cz + s, along, '#f7f3ea', id === 'eco' ? '#2e9b5a' : tint);
  // the blocks
  const n = Math.ceil(t.r[0] / p.pitch) + 1;
  for (let i = -n; i < n; i++) for (let j = -n; j < n; j++) { const x = cx + (i + 0.5) * p.pitch + (id === 'eco' ? (i >= 0 ? 1.1 : -1.1) : 0), z = cz + (j + 0.5) * p.pitch, v = ell(t, x, z), r = rnd(i, j, t.n), y = yAt(x, z), s = p.pitch - p.st - 0.6;
    if (v > 0.8) continue; if (rnd(i, j, 9) > 0.25) for (const [a, b] of [[-1, -1], [1, 1]]) treeAt(G, x + a * (p.pitch / 2 - 0.25), y, z + b * (p.pitch / 2 - 0.25), 0.9);
    TOWN[id](G, D, { x, z, y, v, r, s, i, j, tint, t }); }
  EXTRA[id] && EXTRA[id](G, D, t);
}
const parkAt = (G, x, y, z, s, pond = true) => { B(G, x, z, s, s, y, 0.06, C.grass[1]); if (pond) B(G, x + s * 0.12, z + s * 0.1, s * 0.4, s * 0.3, y + 0.06, 0.03, C.water, false); for (const [a, b] of [[-0.3, -0.3], [0.32, -0.28], [-0.28, 0.32], [0.3, 0.34]]) treeAt(G, x + a * s, y + 0.06, z + b * s, 1.1); B(G, x - s * 0.1, z - s * 0.05, 0.5, 0.16, y + 0.06, 0.14, '#c9925a'); };
const TOWN = {
  // Eco Town: timber and cream blocks of three to seven floors, green and solar roofs, a river, a market square
  eco(G, D, o) { const { x, z, y, v, r, s, tint } = o; if (Math.abs(x - rivX(z)) < s / 2 + 1.2) { if (r > 0.3) for (const a of [-0.25, 0.25]) treeAt(G, x + (x < rivX(z) ? -1 : 1) * 0.2, y, z + a * s, 1); return; }
    if (o.i === 0 && o.j === 0) { for (let k = 0; k < 4; k++) stall(G, x - 1.1 + (k % 2) * 2.2, y, z - 0.8 + Math.floor(k / 2) * 1.6, k % 2 ? '#e0503a' : '#2e9b5a'); B(G, x, z, 0.8, 0.8, y, 0.2, '#d9d2c2'); B(G, x, z, 0.5, 0.5, y + 0.2, 0.06, C.water, false); return; }
    if (r < 0.17) return parkAt(G, x, y, z, s); const h = 2.4 + (1 - v) * 3.6 * (0.5 + rnd(o.i, o.j, 3) * 0.6), k = ['timber', 'cream', 'timber2', 'sand', 'cream2'][Math.floor(r * 5)];
    if (r > 0.62) { block(D, x - s * 0.27, y, z, s * 0.44, s, h, k, 'green', tint); block(D, x + s * 0.27, y, z, s * 0.44, s, h * 0.72, 'cream', 'solar', tint); } else block(D, x, y, z, s, s, h, k, r > 0.4 ? 'green' : 'solar', tint); },
  // Drone City: tall slim towers of glass with landing pads, and drones in the air
  drone(G, D, o) { const { x, z, y, v, r, s, tint } = o; if (r < 0.12) return parkAt(G, x, y, z, s, false); const h = 6 + (1 - v) * 11 * (0.45 + rnd(o.i, o.j, 3) * 0.7), w = s * (0.62 + r * 0.25);
    block(D, x, y, z, w, w, h, r > 0.5 ? 'glass' : 'glass2', r > 0.45 ? 'pad' : 'green', tint); if (r > 0.45 && r < 0.8) { const q = group(D, x + 0.3, y + h + 1.6 + r, z); blk(q, 0, 0, 0.5, 0.5, 0, 0.16, '#2b3a55'); for (const [a, b] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) blk(q, a, b, 0.36, 0.36, 0.14, 0.04, '#c9d2da'); blk(q, 0, 0, 0.3, 0.3, -0.22, 0.2, '#c8955a'); } },
  // Robot Farm: long fields in strips, glasshouses, a timber barn, and two tall indoor farms
  robot(G, D, o) { const { x, z, y, r, s, tint, i, j } = o; if ((i === 0 && j === -1) || (i === -1 && j === 0)) { block(D, x, y, z, s * 0.5, s * 0.5, 6.5, 'glass', 'green', tint); return; }
    if (r > 0.8) { B(G, x, z, s, s * 0.5, y, 0.9, '#d7ecf2'); for (let k = 0; k < 5; k++) B(G, x - s / 2 + k * s / 4, z, 0.08, s * 0.52, y, 0.94, C.white, false); B(G, x, z, s + 0.1, s * 0.3, y + 0.9, 0.25, '#c6e3ec'); return; }
    if (r < 0.1) { block(D, x, y, z, s * 0.6, s * 0.45, 2.2, 'timber', 'solar', tint); return; }
    const cols = ['#7cc04a', '#e2c04a', '#4f9550', '#b48ad0', '#9ccf7f']; for (let k = 0; k < 6; k++) { B(G, x, z - s / 2 + (k + 0.5) * s / 6, s, s / 6 - 0.12, y, 0.05, '#b98a55', false); B(G, x, z - s / 2 + (k + 0.5) * s / 6, s - 0.2, s / 6 - 0.3, y + 0.05, 0.16, cols[(k + i + j * 2 + 20) % 5], false); }
    if (r > 0.45 && r < 0.6) { B(G, x + 0.6, z + 0.3, 0.3, 0.3, y + 0.2, 0.3, C.white); B(G, x + 0.6, z + 0.3, 0.16, 0.16, y + 0.5, 0.12, '#e0503a', false); } },
  // Crossways: where the tram lines and the cycle ways meet; rose and sand blocks with a station under a glass roof
  roads(G, D, o) { const { x, z, y, v, r, s, tint, i, j } = o; if (i === 0 && j === 0) { for (let k = 0; k < 8; k++) B(G, x - s / 2 + 0.2 + k * (s - 0.4) / 7, z, 0.1, s, y, 1.5, C.white); B(G, x, z, s + 0.2, s + 0.2, y + 1.5, 0.14, '#bfe3ee'); B(G, x, z, s * 0.6, s + 0.3, y + 1.64, 0.3, '#d7eef5'); return; }
    if (r < 0.1) return parkAt(G, x, y, z, s, false); const h = 2.6 + (1 - v) * 4.2 * (0.5 + rnd(i, j, 3) * 0.6); block(D, x, y, z, s, s, h, ['rose', 'sand', 'rose2', 'cream'][Math.floor(r * 4)], r > 0.5 ? 'green' : 'solar', tint);
    for (let k = 0; k < 3; k++) B(G, x - s / 2 + 0.3 + k * 0.25, z + s / 2 + 0.45, 0.06, 0.3, y, 0.22, ['#e0503a', '#3f78b5', '#ffd257'][k], false); },
  // Studio Bay: long studio halls, an outdoor screen, a harbour and a lighthouse
  film(G, D, o) { const { x, z, y, v, r, s, tint, i, j } = o; if (j >= 1 && i >= -1 && i <= 0) return; if (j === 0 && (i === -1 || i === 0)) { const c = i ? '#2aa198' : '#d0558a'; B(G, x, z, s + 0.6, s, y, 1.8, C.white); for (let k = 0; k < 5; k++) B(G, x, z, (s + 0.9) * (1 - k * 0.17), s + 0.2, y + 1.8 + k * 0.22, 0.22, c); B(G, x, z + s / 2 + 0.03, 1.2, 0.06, y, 1.3, c, false); return; }
    if (r < 0.14) return parkAt(G, x, y, z, s, false); const h = 2.4 + (1 - v) * 3 * (0.5 + rnd(i, j, 3) * 0.7); block(D, x, y, z, s, s * 0.8, h, ['cream', 'rose', 'white', 'cream2'][Math.floor(r * 4)], r > 0.5 ? 'green' : 'solar', tint); },
  // Power Ridge: a few low ochre blocks; the rest is wind, sun, water and the battery halls (see EXTRA)
  power(G, D, o) { const { x, z, y, v, r, s, tint, i, j } = o; if (v < 0.22 || j <= -1) return; if (r > 0.55) { for (let k = 0; k < 5; k++) { const pnl = B(G, x, z - s / 2 + 0.5 + k * (s - 1) / 4, s - 0.4, 0.5, y + 0.3, 0.06, C.solar); pnl.rotation.x = 0.5; B(G, x, z - s / 2 + 0.5 + k * (s - 1) / 4, 0.08, 0.08, y, 0.3, '#c9d2da', false); } return; }
    if (r < 0.2) { B(G, x, z, s * 0.7, s * 0.5, y, 1.3, C.white); B(G, x, z, s * 0.72, s * 0.52, y + 1.3, 0.12, '#5aa35a'); for (let k = 0; k < 3; k++) B(G, x - s * 0.2 + k * s * 0.2, z + s * 0.26, s * 0.14, 0.04, y + 0.2, 0.8, '#7dffa8', false); return; }
    block(D, x, y, z, s * 0.7, s * 0.7, 2.2 + r * 2.5, ['sand', 'timber', 'cream'][Math.floor(r * 3)], 'green', tint); },
};
const EXTRA = {
  eco(G, D, t) { for (const z of [-4.9, 0.3, 5.5]) for (let k = -1; k <= 1; k++) { B(G, rivX(z) + k, z, 1.02, 1.3, -0.1 + (k ? 0 : 0.12), 0.14, '#c9925a'); for (const s of [-0.62, 0.62]) B(G, rivX(z) + k, z + s, 1.02, 0.06, 0.05, 0.3, '#7a5a33', false); }
    for (const z of [-3, 3.4]) { B(G, rivX(z), z, 0.5, 0.9, -0.42, 0.16, '#e0503a'); B(G, rivX(z), z, 0.3, 0.4, -0.26, 0.14, C.white, false); } },
  drone(G, D, t) { const [x, z] = t.c; block(D, x + 2.6, 0.5, z + 2.6, 1.6, 1.6, 20, 'glass', 'pad', t.tint); B(G, x + 2.6, z + 2.6, 0.1, 0.1, 21.1, 2, '#c9d2da'); },
  roads(G, D, t) { const [cx, cz] = t.c; for (const along of [true, false]) for (let s = -9; s <= 9; s++) { const x = along ? cx + s : cx + 1.05, z = along ? cz + 1.05 : cz + s; if (ell(t, x, z) < 0.8) B(G, x, z, along ? 1 : 0.3, along ? 0.3 : 1, 0, 0.02, '#8fd0a0', false); } },
  film(G, D, t) { const [cx, cz] = t.c; for (let x = cx - 5; x <= cx + 1; x++) for (let z = cz + 4; z <= cz + 8; z++) if (ell(t, x, z) < 0.95) B(G, x + 0.5, z + 0.5, 1.02, 1.02, -0.6, 0.72, rnd(x, z) > 0.5 ? C.water : '#62accb', false);
    B(G, cx - 2, cz + 6.5, 0.6, 3.4, 0.05, 0.14, '#c9925a'); for (const [a, b, c] of [[-3.4, 5.6, '#e0503a'], [-0.6, 7, C.white], [-3.6, 7.6, '#ffd257']]) { B(G, cx + a, cz + b, 0.9, 0.45, 0.1, 0.2, c); B(G, cx + a, cz + b, 0.05, 0.05, 0.3, 0.7, C.trunk, false); B(G, cx + a + 0.2, cz + b, 0.4, 0.03, 0.4, 0.55, C.white, false); }
    for (let k = 0; k < 5; k++) B(G, cx + 4.6, cz + 7.4, 0.9 - k * 0.08, 0.9 - k * 0.08, k * 0.7, 0.7, k % 2 ? '#e0503a' : C.white); B(G, cx + 4.6, cz + 7.4, 0.5, 0.5, 3.5, 0.4, '#ffe27a'); B(G, cx + 4.6, cz + 7.4, 0.8, 0.8, 3.9, 0.14, '#e0503a');
    B(G, cx + 7.5, cz - 1, 0.2, 4.2, 0, 2.6, '#2b3a55'); B(G, cx + 7.38, cz - 1, 0.06, 3.8, 0.4, 2, '#dff1f7', false); },
  power(G, D, t) { const [cx, cz] = t.c; for (let k = 0; k < 6; k++) { const x = cx - 8 + k * 3.2, z = cz - 5.2 - (k % 2) * 1.6; turbine(D, x, yAt(x, z), z, 1.1, k * 0.5); }
    for (let x = cx - 3; x <= cx + 2; x++) for (let z = cz - 2; z <= cz + 1; z++) B(G, x + 0.5, z + 0.5, 1.02, 1.02, yAt(cx, cz) - 0.5, 0.52, C.water, false); B(G, cx - 0.5, cz + 2.2, 6.6, 0.5, yAt(cx, cz + 3), yAt(cx, cz) - yAt(cx, cz + 3) + 0.3, '#d9d2c2'); },
  robot(G, D, t) { const [cx, cz] = t.c; for (const [a, b] of [[5.5, -3.5], [6.6, -3.5]]) { B(G, cx + a, cz + b, 0.8, 0.8, 0, 2.4, '#d9d2c2'); B(G, cx + a, cz + b, 0.86, 0.86, 2.4, 0.2, '#c9d2da'); } },
};

// ---- the scenes ---------------------------------------------------------------------------------------------------------
let alt = null;
function altScene(st) { if (alt) return alt; const n = st.newScene(56); n.light(0); const sc = n.scene; sc.background = new THREE.Color('#eef3f4');
  sc.traverse((o) => { if (o.isDirectionalLight) { o.position.set(-52, 34, 30); o.color.set('#ffd9a8'); o.intensity = 2.5; Object.assign(o.shadow.camera, { left: -62, right: 62, top: 52, bottom: -52, far: 220 }); o.shadow.camera.updateProjectionMatrix(); } if (o.isHemisphereLight) { o.color.set('#eaf1ff'); o.groundColor.set('#c9b08a'); o.intensity = 1.25; } });
  sc.fog = new THREE.Fog('#eef3f4', 60, 300); const root = group(sc); build(root);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshLambertMaterial({ color: C.sea })); sea.rotation.x = -Math.PI / 2; sea.position.y = -1.3; sea.receiveShadow = false; sc.add(sea);
  // far hills that fade into the light, and a low sun
  for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2, R = 190 + rnd(k, 1) * 90, hh = 7 + rnd(k, 2) * 13; for (let q = 0; q < 3; q++) blk(root, Math.cos(a) * R, Math.sin(a) * R, 46 * (1 - q * 0.28), 46 * (1 - q * 0.28), -1.3 + q * hh / 3, hh / 3, ['#a9bfae', '#b4c6b8', '#c4d0c6'][q], { shadow: false }); }
  alt = { scene: sc, root }; return alt; }
// people, a second tram, cycles and stalls on the wide street of Eco Town, for the picture at street height
function streetLife(root) { const g = group(root), F = (x, z, o) => fig(g, x, 0.03, z, { k: 0.3, ...o });
  // a family walking to school in the middle distance, facing the camera's side so their faces show
  F(-1.2, 6.3, { k: 0.23, shirt: '#e0503a', cap: '#3f78b5', pack: '#ffd257', turn: 0.5, arms: ['up', 'down'] }); F(-1.45, 6.45, { k: 0.31, shirt: '#8a5fc2', skin: SKIN[3], hair: HAIR[4], long: true, turn: 0.6 }); F(-0.98, 6.5, { k: 0.32, shirt: '#2e9b5a', hair: HAIR[0], turn: 0.3, arms: ['down', 'up'] });
  F(1.1, 6.4, { k: 0.31, shirt: '#3f78b5', skin: SKIN[2], hair: HAIR[3], turn: -0.5, arms: ['down', 'up'] }); F(-0.9, 4.2, { shirt: '#ffd257', skin: SKIN[1], hair: HAIR[3], turn: 0.2 }); F(-0.7, 4.1, { k: 0.22, shirt: '#16a3a3', skin: SKIN[1], hair: HAIR[0], pack: '#e0503a', turn: 0.2 });
  F(0.9, 3.6, { shirt: '#e0503a', skin: SKIN[0], hair: HAIR[2], turn: Math.PI, step: 0.1 }); F(0.85, 1.9, { shirt: '#8a5fc2', skin: SKIN[2], hair: HAIR[0], turn: 0.1 }); F(-0.85, 1.4, { shirt: '#2e9b5a', skin: SKIN[3], hair: HAIR[1], turn: 0.3 }); F(-0.9, -1.8, { shirt: '#3f78b5', turn: 0.1 }); F(0.9, -2.6, { shirt: '#ffd257', skin: SKIN[2], turn: 0.1 });
  for (const [x, z, c] of [[-2.0, 6.6, '#e0503a'], [-2.0, 4.9, '#2e9b5a'], [2.0, 5.6, '#e9ad1c'], [2.0, 3.4, '#e0503a']]) { const q = group(g, x, 0.03, z); q.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; const b = group(q); stall(b, 0, 0, 0, c); }
  for (const [x, z, c] of [[0.62, 5.2, '#3f78b5'], [0.6, 2.6, '#e0503a']]) { const b = group(g, x, 0.03, z); for (const a of [-0.14, 0.14]) blk(b, 0, a, 0.03, 0.17, 0, 0.17, '#2a2a2a'); blk(b, 0, 0, 0.03, 0.3, 0.14, 0.03, c); fig(b, 0, 0.09, 0, { k: 0.26, shirt: c, sit: true, arms: ['fwd', 'fwd'], turn: Math.PI, cap: '#ffd257' }); }
  for (const z of [8.2, 5.6, 3.0, 0.4, -2.2]) for (const x of [-2.05, 2.05]) { blk(g, x, z, 0.04, 0.04, 0.03, 0.75, '#2b3a55'); blk(g, x, z, 0.14, 0.14, 0.78, 0.1, '#ffe27a', { mat: GL('#ffe6a0') }); }
  tram(g, 0, 0.06, 2.4, false, '#f7f3ea', '#2e9b5a');
  return g; }
const cams = { wide: [-1, 4, -6, 138, 0.3, 0], game: [3, 1, -0.5, 46, 0.95, -1.2] };
const tcam = (id, d = 50, tilt = 0.42, yaw = 0.5) => [T[id].c[0], 2, T[id].c[1], d, tilt, yaw];
export const SHOTS = [
  { id: '01-island-alt', alt: true, cam: cams.wide, fog: [95, 340], names: true }, { id: '01-island-now', cam: cams.wide, names: true },
  { id: '02-eco-alt', alt: true, cam: tcam('eco', 46, 0.42, 0.55), fog: [40, 190] }, { id: '02-eco-now', cam: tcam('eco', 46, 0.42, 0.55) },
  { id: '03-drone-alt', alt: true, cam: tcam('drone', 52, 0.36, 0.5), fog: [40, 200] }, { id: '03-drone-now', cam: tcam('drone', 52, 0.36, 0.5) },
  { id: '04-robot-alt', alt: true, cam: tcam('robot', 46, 0.45, -0.5), fog: [40, 200] }, { id: '04-robot-now', cam: tcam('robot', 46, 0.45, -0.5) },
  { id: '05-crossways-alt', alt: true, cam: tcam('roads', 46, 0.42, 0.6), fog: [40, 190] }, { id: '05-crossways-now', cam: tcam('roads', 46, 0.42, 0.6) },
  { id: '06-studio-alt', alt: true, cam: tcam('film', 46, 0.42, 0.5), fog: [40, 190] }, { id: '06-studio-now', cam: tcam('film', 46, 0.42, 0.5) },
  { id: '07-power-alt', alt: true, cam: tcam('power', 50, 0.36, -0.5), fog: [40, 200] }, { id: '07-power-now', cam: tcam('power', 50, 0.36, -0.5) },
  { id: '08-street-alt', alt: true, eye: [0.75, 1.25, 9.7], at: [-0.15, 1.75, -8], fov: 48, near: 0.05, fog: [8, 62], life: true },
  { id: '08-street-now', eye: [9.9, 3.1, 5.2], at: [9.3, 2.9, -8], fov: 46, near: 0.05 },
  { id: '09-gamecam-alt', alt: true, cam: cams.game, fog: [38, 150] }, { id: '09-gamecam-now', cam: cams.game },
];
let ui = null, life = null;
export function show(i) {
  const s = SHOTS[i], st = film.dbg, cam = st.camera; film.seek(film.duration - 0.5); cam.clearViewOffset(); cam.fov = s.fov || 26; cam.near = s.near || 1; cam.aspect = W / H; cam.updateProjectionMatrix();
  let sc = MAP.scene; if (s.alt) { const a = altScene(st); sc = a.scene; sc.fog.near = s.fog[0]; sc.fog.far = s.fog[1]; if (s.life && !life) life = streetLife(a.root); if (life) life.visible = !!s.life; }
  if (s.eye) { cam.position.set(...s.eye); cam.lookAt(...s.at); } else st.look(...s.cam); cam.updateMatrixWorld(); st.draw(sc); cam.near = 1; cam.updateProjectionMatrix();
  if (!ui) { document.head.insertAdjacentHTML('beforeend', '<style>.stage > .ui:not(.alt), .stage > canvas.fx { visibility: hidden; } .alt { position: absolute; inset: 0; z-index: 6; } .alt b { position: absolute; transform: translate(-50%, -50%); padding: 4px 12px 5px; background: #fffaf0; border: 3px solid #1f2a44; border-radius: 10px; font: 800 18px/1 var(--ui-display); color: #1f2a44; white-space: nowrap; box-shadow: 0 4px 0 rgba(31,42,68,.3); }</style>'); ui = document.createElement('div'); ui.className = 'ui alt'; document.querySelector('.stage').append(ui); }
  ui.innerHTML = s.names ? TOWNS.map((t) => { const q = st.screen(new THREE.Vector3(t.c[0], (t.top || 5) + 6, t.c[1])); return `<b style="left:${q[0]}px;top:${q[1]}px">${t.name}</b>`; }).join('') : '';
  return s.id;
}
