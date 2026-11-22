// SECOND ATTEMPT at the alternate look for the world of six towns (owner, 22 Nov 2026). The first attempt (alt.js) was
// rejected: "These images do not look as good as car town". This one starts from the car town scene itself (carTown in
// ../walk-v2.js) and keeps its materials, colours, haze, light, window pattern, building sizes, camera height and lens.
// Only the content changes: no cars, traffic lights or pollution; tram lines, cycle lanes, trees, stalls, benches and
// people instead. The whole island is ONE model at the scale of the car town street (a person is about 1.8 high), with
// the six towns in the places they have on the present world map (animation/map.js, which is only read).
// It is a proposal beside the present look. It replaces nothing and is used by nothing.
import * as MAP from '../../animation/map.js';
import { THREE, blk, group, hash, GL, soft, fig, SKIN, HAIR } from '../kit-v2.js';
import { walk } from '../walk-v2.js';
const { TOWNS, box, bake } = MAP, T = Object.fromEntries(TOWNS.map((t) => [t.id, t])), W = 1280, H = 720, S = 4;
const rnd = (a, b = 0, c = 0) => hash(a * 1.31 + c * 7.7, b * 2.17 + 3.3);
// ---- car town's own colours, and greens in the same muted key ---------------------------------------------------------
const WALLS = ['#a9a6a0', '#b9b2a6', '#9d9fa6', '#c2bdb2'], PAVE = ['#bdbab2', '#b6b3ab', '#c2bfb7'], HAZE = '#d6d9d8';
const C = { leaf: ['#93ac8a', '#9db594', '#86a37e'], trunk: '#6f5a44', bed: '#93a888', cycle: '#8fa69c', rail: '#6f7078', kerb: '#d9d6cf', roofG: '#8ea584', solar: '#4a5a78', water: '#8fb0c2', waterD: '#84a6b9', sea: '#a3b8c2', sand: '#cfc5ad',
  tram: '#e9e4d8', glass: '#c9d6d8', white: '#e9e7e0', dark: '#3f4658', bench: '#a58a68', crop: ['#93a888', '#c2b27a', '#7f9a78', '#a99ab8'] };
const ACC = { eco: '#b98a72', drone: '#7f97b5', robot: '#9aa67a', roads: '#a393ab', film: '#c59aa8', power: '#c9b072' };
const SHIRT = ['#b9534a', '#5c6f8f', '#c9b458', '#7c8f7a', '#8a6f9a', '#3f6f7a', '#c98a5a'];
// car town's wall of windows: three small windows across a 6.6 wide block, a row every 1.9, blue-grey, a few lit warm
function facade(wall, seed) { const mk = (em) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = em ? '#000' : wall; x.fillRect(0, 0, 64, 64);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { const v = rnd(r, q, seed), lit = v > 0.82; x.fillStyle = em ? (lit ? '#ffe27a' : (v < 0.2 ? '#2d333c' : '#363e49')) : (lit ? '#ffe27a' : (v < 0.2 ? '#5a6678' : '#6d7d92')); x.fillRect(q * 16 + 4, r * 16 + 3, 8, 9); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t; };
  return new THREE.MeshLambertMaterial({ map: mk(false), emissiveMap: mk(true), emissive: '#ffffff', emissiveIntensity: 1 }); }
let FAC = null, ROOFM = null;
const mats = () => { if (FAC) return; FAC = WALLS.map((w, i) => facade(w, i + 1)).concat(WALLS.map((w, i) => facade(w, i + 9)), [facade('#b7c4c6', 21), facade('#c3cdd0', 23)]); ROOFM = new THREE.MeshLambertMaterial({ color: '#b3aea4' }); };
const B = (g, x, z, w, d, y, h, c, sh = true) => box(g, w, h, d, x, y + h / 2, z, c, sh);
// a block of n floors with windows on its four sides, a plain base in the town's accent, and a roof to glimpse from above
function bld(G, D, x, z, w, d, n, wi, acc, rk = 'green') { const h = 1.05 + n * 1.9, ge = new THREE.BoxGeometry(w, h, d), uv = ge.attributes.uv, su = [d, d, 0, 0, w, w];
  for (const f of [0, 1, 4, 5]) { const nu = Math.max(1, Math.round(su[f] / 2.2)); for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * nu / 4, (uv.getY(i) * h - 1.05) / 1.9 / 4); } }
  const s = FAC[wi], m = new THREE.Mesh(ge, [s, s, ROOFM, ROOFM, s, s]); m.position.set(x, h / 2, z); m.castShadow = m.receiveShadow = true; D.add(m);
  B(G, x, z, w + 0.12, d + 0.12, 0, 1.05, wi > 7 ? '#9aa6a8' : WALLS[wi % 4]); B(G, x, z, w + 0.3, d + 0.3, 1.05, 0.12, acc, false);
  if (rk === 'pad') { B(G, x, z, w + 0.5, d + 0.5, h, 0.2, '#cdb46a'); B(G, x, z, w * 0.5, 0.3, h + 0.2, 0.04, C.dark, false); B(G, x, z, 0.3, d * 0.5, h + 0.2, 0.04, C.dark, false); }
  else if (rk === 'solar') for (let k = 0; k < 3; k++) B(G, x, z - d * 0.3 + k * d * 0.3, w - 1, 1.3, h, 0.18, C.solar);
  else { B(G, x, z, w - 0.5, d - 0.5, h, 0.16, C.roofG); if (rnd(x, z, 2) > 0.5) tree(G, x + 1.2, h + 0.16, z - 1, 0.6); }
  return h; }
function tree(G, x, y, z, k = 1) { const c = C.leaf[Math.floor(rnd(x, z) * 3)]; B(G, x, z, 0.36 * k, 0.36 * k, y, 3 * k, C.trunk); B(G, x, z, 2.5 * k, 2.5 * k, y + 2.8 * k, 2 * k, c); B(G, x + 0.1 * k, z - 0.1 * k, 1.6 * k, 1.6 * k, y + 4.8 * k, 1.2 * k, c); }
const planter = (G, x, z) => { B(G, x, z, 1.5, 1.5, 0, 0.35, '#a9a59b'); B(G, x, z, 1.2, 1.2, 0.35, 0.08, C.bed, false); };
const lamp = (G, x, z) => { B(G, x, z, 0.16, 0.16, 0, 4.2, C.dark); B(G, x, z, 0.5, 0.5, 4.2, 0.4, '#e9dfb8'); };
const bench = (G, x, z, alongX = true) => { B(G, x, z, alongX ? 1.8 : 0.5, alongX ? 0.5 : 1.8, 0.4, 0.1, C.bench); for (const s of [-0.7, 0.7]) B(G, alongX ? x + s : x, alongX ? z : z + s, 0.12, 0.12, 0, 0.4, C.dark, false); };
// a strip of ground between two points, such as a tram bed or a cycle lane
function strip(G, a, b, off, w, y, h, c) { const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = -dz / L, nz = dx / L, m = B(G, (a[0] + b[0]) / 2 + nx * off, (a[1] + b[1]) / 2 + nz * off, L, w, y, h, c, false); m.rotation.y = -Math.atan2(dz, dx); return m; }
function tramWay(G, a, b, trees = true) { strip(G, a, b, 0, 5.2, 0.02, 0.05, C.bed); for (const o of [-1.9, -0.9, 0.9, 1.9]) strip(G, a, b, o, 0.12, 0.07, 0.05, C.rail); for (const o of [-4.9, 4.9]) strip(G, a, b, o, 1.7, 0.02, 0.03, C.cycle);
  if (!trees) return; const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = -dz / L, nz = dx / L; for (let s = 5; s < L - 4; s += 7.6) for (const k of [-1, 1]) { if ((Math.round(s / 7.6) + (k > 0 ? 1 : 0)) % 2) continue; const x = a[0] + dx * s / L + nx * 8.2 * k, z = a[1] + dz * s / L + nz * 8.2 * k; if (EYES.some((e) => Math.hypot(e[0] - x, e[1] - z) < 13)) continue; planter(G, x, z); tree(G, x, 0.3, z, 0.9); if (Math.round(s / 7.6) % 4 < 2) lamp(G, x + dx / L * 7.6, z + dz / L * 7.6); } }
function tramCar(D, x, z, ang, acc) { const p = group(D, x, 0, z); p.rotation.y = ang; for (const a of [-4.3, 4.3]) { blk(p, a, 0, 8.2, 2.3, 0.35, 2.3, C.tram); blk(p, a, 0, 8.24, 2.34, 0.35, 0.6, acc, { shadow: false }); blk(p, a, 0, 7.4, 2.36, 1.5, 0.8, '#5f7385', { shadow: false }); blk(p, a, 0, 7.8, 1.9, 2.65, 0.16, '#c9c5bb', { shadow: false }); } blk(p, 0, 0, 0.5, 2, 0.5, 2, C.dark, { shadow: false }); blk(p, 8.42, 0, 0.06, 1.7, 1.5, 0.8, '#5f7385', { shadow: false }); blk(p, 8.44, 0.7, 0.05, 0.3, 0.9, 0.24, '#ffe27a', { shadow: false, mat: GL('#ffe9a0') }); blk(p, 8.44, -0.7, 0.05, 0.3, 0.9, 0.24, '#ffe27a', { shadow: false, mat: GL('#ffe9a0') }); return p; }
function cyclist(D, x, z, ang, c, kid) { const p = group(D, x, 0, z); p.rotation.y = ang; for (const a of [-0.55, 0.55]) blk(p, a, 0, 0.7, 0.1, 0, 0.7, '#2a2a2a'); blk(p, 0, 0, 1.1, 0.1, 0.5, 0.12, c); blk(p, 0.5, 0, 0.1, 0.1, 0.5, 0.6, c); blk(p, 0.5, 0, 0.1, 0.6, 1.05, 0.08, '#2a2a2a'); fig(p, -0.1, 0.5, 0, { k: kid ? 0.8 : 1.05, shirt: c, sit: true, arms: ['fwd', 'fwd'], turn: Math.PI / 2, cap: '#c9b458', skin: SKIN[kid ? 1 : 0] }); return p; }
function stall(D, x, z, ang, c) { const p = group(D, x, 0, z); p.rotation.y = ang; blk(p, 0, 0, 2.6, 1.3, 0, 0.9, C.bench); for (let k = 0; k < 6; k++) blk(p, -1.25 + k * 0.5, 0.1, 0.5, 1.9, 2.3, 0.14, k % 2 ? C.white : c); for (const a of [-1.2, 1.2]) blk(p, a, 0.6, 0.12, 0.12, 0.9, 1.4, C.trunk); for (const [a, col] of [[-0.8, '#b9534a'], [0, '#7c8f7a'], [0.8, '#c9b458']]) blk(p, a, 0.2, 0.6, 0.6, 0.9, 0.3, col); return p; }
function turbine(D, x, y, z, k = 1, rot = 0.4) { const p = group(D, x, y, z); blk(p, 0, 0, 1.2 * k, 1.2 * k, 0, 26 * k, C.white); const hub = group(p, 0.9 * k, 26 * k, 0); hub.rotation.y = Math.PI / 2; for (let i = 0; i < 3; i++) { const b = group(hub); b.rotation.z = i * 2.094 + rot; blk(b, 0, 0, 1.1 * k, 0.3, 0.5, 11 * k, C.white); } blk(p, 0.3 * k, 0, 2 * k, 1.5 * k, 25.4 * k, 1.5 * k, C.white); return p; }
const pitched = (G, x, z, w, d, y, c) => { for (let i = 0; i < 4; i++) B(G, x, z, w + 0.5, (d + 0.6) * (1 - i * 0.22), y + i * 0.45, 0.45, c); };

// ---- the land and the six towns --------------------------------------------------------------------------------------------
const ell = (t, x, z) => ((x - t.c[0] * S) / (t.r[0] * S)) ** 2 + ((z - t.c[1] * S) / (t.r[1] * S)) ** 2;
const wob = (x, z) => Math.sin(x * 0.16 + z * 0.08) * 0.05 + Math.sin(z * 0.22 - x * 0.1) * 0.05;
const LINKS = [['eco', 'drone'], ['eco', 'power'], ['eco', 'robot'], ['eco', 'roads'], ['eco', 'film'], ['roads', 'film'], ['power', 'robot'], ['drone', 'roads']];
const P2 = (id) => [T[id].c[0] * S, T[id].c[1] * S];
const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * u, z - a[1] - dz * u); };
const linkD = (x, z) => Math.min(...LINKS.map(([a, b]) => segD(x, z, P2(a), P2(b))));
const owner = (x, z) => { let m = 9, o = null; for (const t of TOWNS) { const v = ell(t, x, z); if (v < m) { m = v; o = t; } } return [o, m]; };
const ECO_CANAL = -34, FILM_BASIN = (x, z) => { const [cx, cz] = P2('film'); return x > cx + 2 && x < cx + 40 && z > cz + 19 && z < cz + 33; }, POWER_LAKE = (x, z) => { const [cx, cz] = P2('power'); return x > cx - 36 && x < cx - 6 && z > cz + 19 && z < cz + 31; };
const isWater = (t, x, z) => (t.id === 'eco' && Math.abs(x - (P2('eco')[0] + ECO_CANAL)) < 3.2 && Math.abs(z - P2('eco')[1]) > 10.5) || (t.id === 'film' && FILM_BASIN(x, z)) || (t.id === 'power' && POWER_LAKE(x, z));
function build(root) { mats(); const G = group(root), D = group(root);
  for (let x = -190; x <= 178; x += 3) for (let z = -142; z <= 118; z += 3) { const X = x + 1.5, Z = z + 1.5, [t, v0] = owner(X, Z), v = v0 + wob(X, Z), ld = linkD(X, Z); if (v > 1 && ld > 9) continue; const r = rnd(x, z);
    if (v <= 1 && isWater(t, X, Z)) { B(G, X, Z, 3, 3, -3, 2.4, r > 0.5 ? C.water : C.waterD); continue; }
    let c = PAVE[Math.floor(r * 3)]; if (v > 0.93 && v <= 1) c = t.id === 'film' ? C.sand : C.bed; if (v <= 0.93 && t.id === 'robot' && Math.abs(Z - P2('robot')[1]) > 10.5 && Math.abs(X - P2('robot')[0]) > 10.5) c = C.bed;
    B(G, X, Z, 3, 3, -3, 3, c); }
  for (const [a, b] of LINKS) { const A = P2(a), Bp = P2(b), pt = (u) => [A[0] + (Bp[0] - A[0]) * u, A[1] + (Bp[1] - A[1]) * u]; let u0 = 0, u1 = 1; while (u0 < 1 && ell(T[a], ...pt(u0)) < 0.7) u0 += 0.01; while (u1 > 0 && ell(T[b], ...pt(u1)) < 0.7) u1 -= 0.01; if (u1 > u0) tramWay(G, pt(u0), pt(u1), true); }
  for (const t of TOWNS) town(t, G, D); bake(G); return { G, D }; }
function town(t, G, D) { const [cx, cz] = P2(t.id), rx = t.r[0] * S, rz = t.r[1] * S, id = t.id, acc = ACC[id];
  tramWay(G, [cx - rx * 0.86, cz], [cx + rx * 0.86, cz]); tramWay(G, [cx, cz - rz * 0.84], [cx, cz + rz * 0.84]);
  B(G, cx, cz, 20, 20, 0.02, 0.06, PAVE[2], false);
  for (let i = -9; i <= 9; i++) for (const row of [1, 2, 3, 4]) for (const sg of [-1, 1]) { const x = cx + i * 7.6, z = cz + sg * (13.5 + (row - 1) * 11); if (Math.abs(x - cx) < 12 || ell(t, x, z) > 0.8 || isWater(t, x, z)) continue;
    TOWN[id](G, D, { x, z, i, row, sg, acc, r: rnd(i, row * sg, t.n), r2: rnd(i * 3, row * sg + 5, t.n), v: ell(t, x, z), cx, cz }); }
  EXTRA[id] && EXTRA[id](G, D, cx, cz, acc); }
const park = (G, x, z) => { B(G, x, z, 6.8, 7.4, 0, 0.1, C.bed, false); for (const [a, b] of [[-1.9, -2], [1.9, -1.6], [-1.6, 2], [1.8, 2.2]]) tree(G, x + a, 0.1, z + b, 0.8); bench(G, x, z + 0.3); };
const TOWN = {
  // Eco Town: blocks of two to five floors on the wide streets, low homes with pitched roofs behind them, parks, a canal
  eco(G, D, o) { const { x, z, row, r, r2, acc } = o; if (r < 0.12) return park(G, x, z);
    if (row >= 2 && r2 > 0.4) { for (const a of [-1.8, 1.8]) { B(G, x + a, z, 3.2, 5, 0, 2.8, WALLS[Math.floor(r * 4)]); pitched(G, x + a, z, 3.2, 5, 2.8, '#b08a76'); B(G, x + a, z + 2.52, 0.9, 0.06, 0, 1.8, '#6f5a44', false); B(G, x + a + 0.9, z + 2.52, 0.8, 0.05, 1.2, 0.8, '#6d7d92', false); } B(G, x, z + 3.6, 6.8, 2, 0, 0.08, C.bed, false); return; }
    bld(G, D, x, z, 6.6, 7, 1 + Math.floor(r2 * 2.99), Math.floor(r * 8), acc, r > 0.55 ? 'solar' : 'green'); },
  // Drone City: slim towers of seven to fifteen floors with landing pads
  drone(G, D, o) { const { x, z, r, r2, acc, v } = o; if (r < 0.1) return park(G, x, z); const n = 8 + Math.floor((1 - v) * 15 * (0.45 + r2 * 0.7)), h = bld(G, D, x, z, 5.4, 5.4, n, 8 + (r > 0.5 ? 1 : 0), acc, r > 0.4 ? 'pad' : 'green');
    if (r > 0.4 && r < 0.72) { const q = group(D, x + 1, h + 4 + r * 4, z); blk(q, 0, 0, 1.4, 1.4, 0, 0.4, C.dark); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) blk(q, a, b, 1, 1, 0.4, 0.08, '#c9d2da'); blk(q, 0, 0, 0.9, 0.9, -0.8, 0.7, '#a58a68'); } },
  // Robot Farm: long fields in strips, glasshouses, barns and tall indoor farms
  robot(G, D, o) { const { x, z, i, row, sg, r, r2, acc } = o; if (row === 1 && (i === -2 || i === 5)) return; if (row === 1 && (i === -3 || i === 4)) { bld(G, D, x + 3.8, z, 14.2, 7, 4, 8, acc, 'green'); for (let k = 1; k < 4; k++) B(G, x + 3.8, z, 14.9, 7.7, 1.05 + k * 1.9 - 0.15, 0.3, C.roofG, false); return; }
    if (r > 0.72) { B(G, x, z, 7, 6.4, 0, 2.6, '#c6d3d2'); for (let k = 0; k < 5; k++) B(G, x - 3.5 + k * 1.75, z, 0.16, 6.5, 0, 2.7, C.white, false); pitched(G, x, z, 7, 6.4, 2.6, '#cfdad8'); return; }
    if (r < 0.1) { B(G, x, z, 6, 5, 0, 3.4, WALLS[1]); pitched(G, x, z, 6, 5, 3.4, acc); return; }
    for (let k = 0; k < 5; k++) { B(G, x, z - 3 + k * 1.5, 7.2, 1.1, 0, 0.12, '#a59880', false); B(G, x, z - 3 + k * 1.5, 7, 0.7, 0.12, 0.5, C.crop[(k + i + row + 20) % 4], false); }
    if (r2 > 0.7) { B(G, x + 1.5, z + 0.7, 0.9, 0.7, 0.4, 0.7, C.white); B(G, x + 1.5, z + 0.7, 0.5, 0.5, 1.1, 0.3, acc, false); } },
  // Crossways: mid-height blocks around a tram and cycle station under a long glass roof
  roads(G, D, o) { const { z, i, row, r, r2, acc } = o; if (i & 1) return; const x = o.x + 3.8; if (r < 0.08) return park(G, x, z); bld(G, D, x, z, 14.2, 7, 2 + Math.floor(r2 * 1.99), Math.floor(r * 8), acc, r > 0.5 ? 'solar' : 'green');
    if (row === 1) for (let k = 0; k < 4; k++) B(G, x - 2 + k * 0.6, z - o.sg * 4.9, 0.08, 1.3, 0, 0.9, ['#b9534a', '#5c6f8f', '#c9b458', '#7c8f7a'][k], false); },
  // Studio Bay: low blocks, two great studio halls, a harbour
  film(G, D, o) { const { x, z, i, row, sg, r, r2, acc } = o; if (row <= 2 && sg === -1 && i >= 2 && i <= 6) return; if (i & 1) return; if (r < 0.1) return park(G, x + 3.8, z); bld(G, D, x + 3.8, z, 14.2, 7, 1 + Math.floor(r2 * 1.99), Math.floor(r * 8), acc, r > 0.5 ? 'solar' : 'green'); },
  // Power Ridge: low blocks, battery halls and fields of solar panels; the turbines stand on the ridge behind
  power(G, D, o) { const { x, z, row, sg, r, r2, acc } = o; if (sg === -1 && row >= 3) return; if (r > 0.62) { for (let k = 0; k < 4; k++) { const p = B(G, x, z - 2.6 + k * 1.75, 6.6, 1.5, 1.2, 0.14, C.solar); p.rotation.x = 0.45; B(G, x - 2.5, z - 2.6 + k * 1.75, 0.16, 0.16, 0, 1.2, '#a9a59b', false); B(G, x + 2.5, z - 2.6 + k * 1.75, 0.16, 0.16, 0, 1.2, '#a9a59b', false); } return; }
    if (r < 0.2) { B(G, x, z, 6, 6.4, 0, 3.6, C.white); B(G, x, z, 6.2, 6.6, 3.6, 0.3, '#8ea584'); for (let k = 0; k < 4; k++) B(G, x - 2.1 + k * 1.4, z + 3.22, 0.9, 0.05, 0.6, 2.2, '#9fd0b0', false); return; }
    if (o.i & 1) return; bld(G, D, x + 3.8, z, 14.2, 7, 1 + Math.floor(r2 * 1.99), Math.floor(r * 8), acc, 'solar'); },
};
const EXTRA = {
  eco(G, D, cx, cz, acc) { const x = cx + ECO_CANAL; for (const z of [cz - 24.5, cz + 24.5]) { B(G, x, z, 8, 4, 0, 0.3, '#a59880'); for (const s of [-1.9, 1.9]) B(G, x, z + s, 8, 0.14, 0.3, 0.9, C.dark, false); }
    for (const [z, c] of [[cz - 17, '#b9534a'], [cz + 31, '#5c6f8f'], [cz + 17, '#c9b458']]) { B(G, x, z, 1.6, 3.6, -0.55, 0.5, c); B(G, x, z, 1, 1.6, -0.05, 0.4, C.white, false); } },
  drone(G, D, cx, cz, acc) { bld(G, D, cx + 15.2, cz + 13.5, 5.4, 5.4, 25, 9, acc, 'pad'); B(G, cx + 15.2, cz + 13.5, 0.3, 0.3, 48.8, 6, '#c9d2da'); },
  roads(G, D, cx, cz, acc) { for (let k = -5; k <= 5; k++) for (const s of [-8.4, 8.4]) B(G, cx + 20 + k * 4.4 - 22, cz + s, 0.3, 0.3, 0, 6.4, C.white); B(G, cx - 2, cz, 50, 18.6, 6.4, 0.25, '#c9d6d8'); for (let k = -5; k <= 5; k++) B(G, cx - 2 + k * 4.4, cz, 0.24, 18.8, 6.65, 0.2, C.white, false); B(G, cx - 2, cz, 50, 6, 6.65, 0.9, '#d5dfe0');
    for (const s of [-6.4, 6.4]) B(G, cx - 2, cz + s, 46, 2.4, 0, 0.5, '#c9c5bb'); },
  film(G, D, cx, cz, acc) { for (const [dx, c] of [[23, '#7fa8a2'], [41, '#c59aa8']]) { B(G, cx + dx, cz - 19, 15, 18, 0, 7.5, C.white); for (let k = 0; k < 5; k++) B(G, cx + dx, cz - 19, 15.6 * (1 - k * 0.17), 18.6, 7.5 + k * 0.8, 0.8, c); B(G, cx + dx, cz - 9.97, 5, 0.1, 0, 5, c, false); }
    const [lx, lz] = [cx + 44, cz + 26]; for (let k = 0; k < 6; k++) B(G, lx, lz, 3.2 - k * 0.3, 3.2 - k * 0.3, k * 2.2, 2.2, k % 2 ? '#b9534a' : C.white); B(G, lx, lz, 1.8, 1.8, 13.2, 1.4, '#e9dfb8'); B(G, lx, lz, 2.8, 2.8, 14.6, 0.5, '#b9534a');
    B(G, cx + 20, cz + 26, 2, 12, -0.3, 0.5, '#a59880'); for (const [a, b, c] of [[10, 24, '#b9534a'], [28, 23, C.white], [31, 29, '#c9b458'], [12, 30, '#5c6f8f']]) { B(G, cx + a, cz + b, 3.6, 1.6, -0.55, 0.6, c); B(G, cx + a, cz + b, 0.14, 0.14, 0.05, 3, C.trunk, false); B(G, cx + a + 0.8, cz + b, 1.6, 0.06, 0.6, 2.2, C.white, false); }
    B(G, cx - 30, cz - 9.9, 0.4, 0.4, 0, 8, C.dark); B(G, cx - 22, cz - 9.9, 0.4, 0.4, 0, 8, C.dark); B(G, cx - 26, cz - 9.9, 9, 0.3, 3, 5.4, '#e9e7e0'); },
  power(G, D, cx, cz, acc) { for (let k = 0; k < 4; k++) B(G, cx - 4, cz - 36 - k * 1.2, 96 - k * 12, 18 - k * 3.4, 0, 2 + k * 2, ['#a9a59b', '#a59f92', '#9f9a8c', '#9a9486'][k]); for (let k = 0; k < 6; k++) turbine(D, cx - 44 + k * 16, 8, cz - 37 - (k % 2) * 3, 1, k * 0.5);
    B(G, cx - 21, cz + 31.8, 31, 1.4, -0.6, 2, '#c9c5bb'); },
  robot(G, D, cx, cz, acc) { for (const [a, b] of [[20, -13], [23.4, -13]]) { B(G, cx + a, cz + b, 2.8, 2.8, 0, 9, '#c9c5bb'); B(G, cx + a, cz + b, 3, 3, 9, 0.6, '#a9a59b'); } },
};

// ---- people and vehicles in the street of one town, in front of that town's camera ----------------------------------------
// u runs away from the camera along the wide street; v runs to the right. d is +1 when the camera looks towards +x.
const VIEW = { eco: [0, -1, 22], drone: [-1, 0, 30], robot: [1, 0, 30], roads: [-1, 0, 30], film: [-1, 0, 30], power: [0, -1, 26] };
const frame = (id) => { const [cx, cz] = P2(id), [fx, fz, back] = VIEW[id], o = [cx - fx * back, cz - fz * back]; return { fx, fz, o, L: (u, v) => [o[0] + fx * u - fz * v, o[1] + fz * u + fx * v] }; };
const EYES = Object.keys(VIEW).map((id) => frame(id).L(-11.5, -6.4));
function life(D, id) { const { fx, fz, L } = frame(id), acc = ACC[id], face = (a = 0) => Math.atan2(-fx, -fz) + a, away = (a = 0) => Math.atan2(fx, fz) + a, along = Math.atan2(-fz, fx), d = 1;
  const F = (u, v, o) => { const [x, z] = L(u, v); return fig(D, x, 0.05, z, { k: 1.05, shirt: SHIRT[Math.floor(rnd(u, v) * 7)], skin: SKIN[Math.floor(rnd(v, u) * 4)], hair: HAIR[Math.floor(rnd(u, v, 3) * 5)], ...o }); };
  // a family on the near pavement, facing us: a child with a school bag between two grown-ups
  F(1.5, -6.6, { k: 0.78, shirt: '#b9534a', cap: '#5c6f8f', pack: '#c9b458', turn: face(0.5), arms: ['up', 'down'], skin: SKIN[0], hair: HAIR[1] }); F(2.4, -7.6, { k: 1.08, shirt: '#8a6f9a', long: true, turn: face(0.4), skin: SKIN[3], hair: HAIR[4] }); F(2.2, -5.5, { k: 1.1, shirt: '#7c8f7a', turn: face(0.6), arms: ['down', 'up'], skin: SKIN[0], hair: HAIR[0] });
  F(9, -7.4, { turn: away(0.1), step: 0.12 }); F(9.6, -6.6, { k: 0.75, pack: '#b9534a', turn: away(0.1), step: -0.1 }); F(18, 7.6, { turn: face(-0.2), arms: ['up', 'down'] }); F(24, -7.2, { turn: face(0.2) }); F(13, 7.9, { turn: away(), long: true }); F(30, 7.4, { turn: face() }); F(34, -7.6, { turn: away() }); F(42, 7.2, { turn: face() }); F(6.5, 7.3, { turn: face(-0.5), arms: ['down', 'up'] });
  { const [x, z] = L(16, -1.4); tramCar(D, x, z, along + Math.PI, acc); } { const [x, z] = L(52, 1.4); tramCar(D, x, z, along, acc); }
  { const [x, z] = L(5, 4.9); cyclist(D, x, z, along, '#5c6f8f'); } { const [x, z] = L(11, 4.9); cyclist(D, x, z, along, '#b9534a', true); } { const [x, z] = L(26, -4.9); cyclist(D, x, z, along + Math.PI, '#c9b458'); }
  { const [x, z] = L(4, 8.3); bench(D, x, z, Math.abs(fx) > 0.5); F(4, 8.25, { sit: true, k: 1, turn: face(-1.2), hair: '#d9d9d9', arms: ['down', 'up'] }).position.y = 0.2; }
  const X = { // what is special to each town, close to the camera
    eco() { for (const [u, c] of [[9, '#b9534a'], [15, '#7c8f7a'], [21, '#c9b458']]) { const [x, z] = L(u, 8.4); stall(D, x, z, along + Math.PI / 2 * 0 + (Math.abs(fx) > 0.5 ? (fx > 0 ? Math.PI : 0) : (fz < 0 ? -Math.PI / 2 : Math.PI / 2)), c); } F(9, 7, { turn: away(d * 0.2), arms: ['fwd', 'down'] }); F(15.4, 7.1, { k: 0.8, turn: away(), arms: ['up', 'down'] });
      const [x, z] = L(3.6, -4.6), p = group(D, x, 0, z); p.rotation.y = face(0.5); blk(p, 0, 0, 0.36, 0.8, 0.28, 0.34, '#a58a68'); blk(p, 0, 0.5, 0.34, 0.34, 0.44, 0.34, '#a58a68'); for (const a of [-0.12, 0.12]) { blk(p, a, 0.3, 0.1, 0.1, 0, 0.3, '#a58a68'); blk(p, a, -0.3, 0.1, 0.1, 0, 0.3, '#a58a68'); blk(p, a, 0.44, 0.1, 0.08, 0.78, 0.14, '#6f5a44'); } },
    drone() { for (const [u, v, y] of [[10, 3, 6.5], [22, -4, 10], [36, 2, 14]]) { const [x, z] = L(u, v), q = group(D, x, y, z); blk(q, 0, 0, 1.4, 1.4, 0, 0.4, C.dark); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) blk(q, a, b, 1, 1, 0.4, 0.08, '#c9d2da'); blk(q, 0, 0, 0.9, 0.9, -0.8, 0.7, '#a58a68'); }
      const [x, z] = L(7, 8.6); blk(D, x, z, 3, 0.9, 0, 2.2, acc); for (let k = 0; k < 6; k++) blk(D, x - 1.1 + (k % 3) * 1.1, z, 0.9, 0.04, 0.3 + Math.floor(k / 3) * 0.95, 0.8, C.white, { shadow: false }); F(7.6, 7.3, { turn: away(), arms: ['fwd', 'down'] }); },
    robot() { for (const [u, v] of [[6, 5.6], [16, -6.2]]) { const [x, z] = L(u, v); blk(D, x, z, 1.1, 0.9, 0.3, 0.8, C.white); blk(D, x, z, 0.6, 0.6, 1.1, 0.4, acc); blk(D, x, z, 0.9, 0.7, 1.5, 0.4, '#a58a68'); for (const a of [-0.4, 0.4]) blk(D, x + a, z, 0.3, 1, 0, 0.36, '#2a2a2a'); }
      const [x, z] = L(8, 8.4); for (const [a, c] of [[-1, '#7c8f7a'], [0, '#b9534a'], [1, '#c9b458']]) { blk(D, x + a * 1.1, z, 0.9, 0.9, 0, 0.6, '#a58a68'); blk(D, x + a * 1.1, z, 0.7, 0.7, 0.6, 0.2, c); } F(8, 7.2, { turn: face(-0.3), cap: '#c9b458', arms: ['up', 'down'] }); },
    roads() { for (const [u, v] of [[6, 8.2], [8, 8.2], [10, 8.2]]) for (let k = 0; k < 3; k++) { const [x, z] = L(u + k * 0.6, v); blk(D, x, z, 0.08, 1.3, 0, 0.9, ['#b9534a', '#5c6f8f', '#c9b458'][k]); } F(7, 7, { turn: away(d * 0.3) }); },
    film() { const [x, z] = L(8, 7); blk(D, x, z, 0.12, 0.12, 0, 1.5, C.dark); blk(D, x, z, 0.9, 0.5, 1.5, 0.5, C.dark); blk(D, x, z, 0.3, 0.3, 1.6, 0.3, '#5f7385'); F(8.9, 7.2, { turn: away(d * 0.4), cap: C.dark, arms: ['fwd', 'fwd'] }); F(5.4, 6.2, { turn: face(-0.6), arms: ['up', 'up'], k: 0.9 }); const [a, b] = L(6.6, 8.6); blk(D, a, b, 0.14, 0.14, 0, 3.4, C.dark); blk(D, a, b, 0.8, 0.8, 3.4, 0.7, '#e9dfb8', { mat: GL('#fff3c4') }); },
    power() { F(7, 7, { turn: face(-0.4), hat: '#c9b458', arms: ['up', 'down'], shirt: '#5c6f8f' }); const [x, z] = L(9, 8.4); blk(D, x, z, 2.4, 1.2, 0, 1.8, C.white); for (let k = 0; k < 3; k++) blk(D, x - 0.7 + k * 0.7, z, 0.4, 0.04, 0.3, 1.2, '#9fd0b0', { shadow: false, mat: GL(k < 2 ? '#8fd0a8' : '#c9d2da') }); },
  }; X[id]();
}

// ---- the scenes ---------------------------------------------------------------------------------------------------------
let isl = null;
function scene(st) { if (isl) return isl; const n = st.newScene(200); n.light(0.22); const sc = n.scene; sc.background = new THREE.Color(HAZE); sc.fog = new THREE.Fog(HAZE, 12, 150);
  sc.traverse((o) => { if (o.isDirectionalLight) { o.position.set(-160, 300, 180); Object.assign(o.shadow.camera, { left: -230, right: 230, top: 180, bottom: -180, far: 700 }); o.shadow.camera.updateProjectionMatrix(); } });
  const root = group(sc), b = build(root); for (const t of TOWNS) life(b.D, t.id);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshLambertMaterial({ color: C.sea })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.9; sc.add(sea); isl = { scene: sc, sun: sc.children.find((o) => o.isDirectionalLight) }; return isl; }
const streetCam = (id) => { const { L } = frame(id), e = L(-11.5, -6.4), a = L(10, -0.2); return { eye: [e[0], 4.8, e[1]], at: [a[0], 1.9, a[1]], fov: 40, fog: [12, 150] }; };
const near = (id, d = 150, tilt = 0.3, yaw = 0.5) => ({ cam: [P2(id)[0], 6, P2(id)[1], d, tilt, yaw], fog: [d * 0.45, d * 3.2] });
export const SHOTS = [
  { id: '00-car-town-reference', ref: true },
  { id: '01-eco-street', ...streetCam('eco') }, { id: '02-drone-street', ...streetCam('drone') }, { id: '03-robot-street', ...streetCam('robot') }, { id: '04-crossways-street', ...streetCam('roads') }, { id: '05-studio-street', ...streetCam('film') }, { id: '06-power-street', ...streetCam('power') },
  { id: '07-island-low', cam: [-6, 12, 0, 350, 0.2, 0], fog: [150, 860], names: true }, { id: '08-island-middle', cam: [-6, 0, -14, 335, 0.45, 0], fog: [190, 900], names: true },
  { id: '09-eco-near', ...near('eco', 170, 0.3, 0.5) }, { id: '10-drone-near', ...near('drone', 190, 0.24, 0.5) }, { id: '11-robot-near', ...near('robot', 170, 0.3, -0.5) }, { id: '12-crossways-near', ...near('roads', 170, 0.3, 0.6) }, { id: '13-studio-near', ...near('film', 170, 0.3, 0.45) }, { id: '14-power-near', ...near('power', 180, 0.26, -0.5) },
];
let ui = null;
export function show(i) { const s = SHOTS[i], st = film.dbg, cam = st.camera; cam.clearViewOffset(); cam.aspect = W / H; cam.far = 3000; let names = '';
  if (!ui) { document.head.insertAdjacentHTML('beforeend', '<style>.stage > .ui:not(.alt), .stage > canvas.fx { visibility: hidden; } .alt { position: absolute; inset: 0; z-index: 6; font-family: var(--ui-display); } .alt b { position: absolute; transform: translate(-50%, -50%); display: grid; place-items: center; width: 30px; height: 30px; background: #ffd257; border: 3px solid #1f2a44; border-radius: 50%; font: 800 17px/1 var(--ui-display); color: #1f2a44; } .alt p { position: absolute; left: 0; right: 0; bottom: 0; margin: 0; padding: 9px 18px 10px; background: #fffaf0; border-top: 4px solid #1f2a44; font: 700 18px/1.2 var(--ui-body); color: #1f2a44; display: flex; gap: 22px; justify-content: center; } .alt p i { font-style: normal; display: flex; gap: 7px; align-items: center; } .alt p i em { display: grid; place-items: center; width: 24px; height: 24px; background: #ffd257; border: 3px solid #1f2a44; border-radius: 50%; font: 800 14px/1 var(--ui-display); font-style: normal; }</style>'); ui = document.createElement('div'); ui.className = 'ui alt'; document.querySelector('.stage').append(ui); }
  if (s.ref) { const h = walk.split[1], n = st.newScene(h.half); n.light(h.night); n.scene.background.set(h.bg); h.room(group(n.scene)); cam.fov = h.fov; cam.updateProjectionMatrix(); cam.position.set(...h.eye); cam.lookAt(...h.at); cam.updateMatrixWorld(); st.draw(n.scene); ui.innerHTML = ''; return s.id; }
  const a = scene(st); a.scene.fog.near = s.fog[0]; a.scene.fog.far = s.fog[1]; cam.fov = s.fov || 26; cam.updateProjectionMatrix(); if (s.eye) { cam.position.set(...s.eye); cam.lookAt(...s.at); } else st.look(...s.cam); cam.updateMatrixWorld(); st.draw(a.scene);
  if (s.names) names = TOWNS.map((t) => { const q = st.screen(new THREE.Vector3(t.c[0] * S, { drone: 48, power: 44 }[t.id] || 26, t.c[1] * S)); return `<b style="left:${q[0]}px;top:${q[1]}px">${t.n}</b>`; }).join('') + `<p>${TOWNS.map((t) => `<i><em>${t.n}</em>${t.name}</i>`).join('')}</p>`;
  ui.innerHTML = names; cam.far = 400; cam.fov = 26; cam.updateProjectionMatrix(); return s.id; }
