// Screen 3, second idea (owner, 22 Nov 2026): a split screen. On the left the child walks to school in Eco Town with
// mum and dad, along the path the child drew. On the right a friend sits in a car in a queue in "car town". A map shows
// where the child is, the way to school, and the friend's car. The child is never alone and never goes to a stranger's door.
import { THREE, PAL, blk, group, hash, GL, soft, INK, SKIN, HAIR, ROOFS, place, fig, cottage, shade, tree, pine, florence, top, mouse, hint, plate } from './kit-v2.js';
const PATHC = '#fff7e6', NO = { shadow: false };

// ---- Eco Town: green, sunny, alive, and as deep as the road beside it -------------------------------------------------
function bike(g, x, z, c) { const p = group(g, x, 0, z); for (const a of [-0.55, 0.55]) { blk(p, a, 0, 0.7, 0.1, 0, 0.7, '#2a2a2a'); blk(p, a, 0, 0.4, 0.12, 0.15, 0.4, '#c9d2da', NO); } blk(p, 0, 0, 1.1, 0.1, 0.5, 0.12, c); blk(p, -0.5, 0, 0.1, 0.1, 0.5, 0.6, c); blk(p, -0.5, 0, 0.1, 0.6, 1.05, 0.08, '#2a2a2a'); blk(p, 0.3, 0, 0.36, 0.2, 0.66, 0.1, '#2a2a2a'); return p; }
function dog(g, x, z, turn = 0) { const p = group(g, x, 0, z); p.rotation.y = turn; blk(p, 0, 0, 0.36, 0.8, 0.28, 0.34, '#b9824a'); blk(p, 0, 0.5, 0.34, 0.34, 0.44, 0.34, '#b9824a'); blk(p, 0, 0.7, 0.2, 0.16, 0.46, 0.16, '#7a5a33'); for (const a of [-0.12, 0.12]) { blk(p, a, 0.44, 0.1, 0.08, 0.78, 0.14, '#7a5a33'); blk(p, a, 0.3, 0.1, 0.1, 0, 0.3, '#b9824a'); blk(p, a, -0.3, 0.1, 0.1, 0, 0.3, '#b9824a'); blk(p, a * 0.9, 0.68, 0.06, 0.02, 0.62, 0.07, INK, { shadow: false, mat: GL(INK) }); } blk(p, 0, -0.46, 0.1, 0.1, 0.5, 0.34, '#b9824a'); return p; }
function eco(g) {
  for (let x = -70; x <= 18; x += 2) for (let z = -34; z <= 30; z += 2) blk(g, x + 1, z + 1, 2, 2, -1.6, 1.6, PAL.grass[Math.floor(hash(x, z) * 4)]);
  const slab = (x, z, along) => { blk(g, x, z, along ? 1.04 : 1.14, along ? 1.14 : 1.04, 0, 0.05, '#8a7d68', NO); blk(g, x, z, along ? 0.9 : 1.0, along ? 1.0 : 0.9, 0, 0.09, PATHC); };
  for (let x = -40; x < 18; x++) for (const z of [-0.55, 0.55]) slab(x + 0.5, z, true);
  for (let z = 1; z < 22; z++) for (const x of [-3.55, -2.45]) slab(x, z + 0.6, false);
  // the school at the end of the avenue: the one yellow building, with its bell, its flag and an open gate
  { const s = group(g, -47, 0, 0); blk(s, 0, 0, 5, 13, 0, 3.6, '#ffd76a'); for (let i = 0; i < 5; i++) blk(s, 0, 0, 5.6 * (1 - i / 5 * 0.8), 13.6, 3.6 + i * 0.44, 0.44, i % 2 ? shade(ROOFS.red, -0.05) : ROOFS.red);
    blk(s, 0, 0, 1.8, 1.8, 5.8, 1.8, '#ffd76a'); blk(s, 0.92, 0, 0.06, 0.8, 6.3, 0.8, '#ffd257', { mat: GL('#ffb400') }); blk(s, 0, 0, 2.2, 2.2, 7.6, 0.34, ROOFS.red);
    blk(s, 2.52, 0, 0.08, 2.0, 0, 2.5, '#7a5a33', NO); for (const z of [-4.6, -2.6, 2.6, 4.6]) blk(s, 2.52, z, 0.08, 1.3, 1.3, 1.3, '#9fd0f5', { shadow: false, mat: GL('#bfe3f5') });
    blk(s, 3.4, 5.6, 0.14, 0.14, 0, 6, '#fbfbf7'); blk(s, 3.4, 6.3, 0.06, 1.2, 5, 0.8, '#e0503a', NO); blk(s, 4.4, 0, 4.2, 15, 0, 0.04, '#efe2c2', NO); }
  for (const z of [-1.7, 1.7]) blk(g, -40.4, z, 0.5, 0.5, 0, 2, '#fbfbf7'); for (const s of [-1, 1]) { for (let k = 0; k < 9; k++) blk(g, -40.4, s * (2.5 + k * 0.8), 0.14, 0.14, 0, 1, '#fbfbf7'); blk(g, -40.4, s * 5.8, 0.1, 7, 0.6, 0.12, '#fbfbf7', NO); }
  fig(g, -39.2, 0, 2.6, { k: 1.6, shirt: '#16a3a3', skin: SKIN[1], hair: HAIR[3], long: true, arms: ['up', 'down'], turn: Math.PI / 2 });
  // an avenue of trees on both sides of the path, with homes in the child's roof colours behind them
  for (let x = -11; x > -38; x -= 5.4) for (const z of [-3.8, 3.8]) tree(g, x, 0, z, 2.0, ['#5fa35a', '#74b56a', '#4f9550'][Math.abs(Math.round(x + z)) % 3]);
  const H2 = (x, z, f, roof) => { cottage(g, x, 0, z, { s: 4, d: 3.6, tall: 2.3, steps: 6, rise: 0.3, roof, face: f, garden: false, timber: true, wall: PAL.timber, solar: true });
    blk(g, x, z + f * 3.2, 5.6, 2.8, 0, 0.04, '#74b56a', NO); blk(g, x, z + f * 3.3, 0.9, 3.0, 0.01, 0.06, PATHC, NO); for (const s of [-1, 1]) blk(g, x + s * 1.75, z + f * 4.55, 1.9, 0.06, 0.36, 0.08, '#fbfbf7', NO); for (let k = -3; k <= 3; k++) if (k) blk(g, x + k * 0.85, z + f * 4.55, 0.1, 0.1, 0, 0.6, '#fbfbf7');
    for (const [a, b, col] of [[-1.6, 2.5, '#f08ab8'], [-2.1, 3.4, '#ffd257'], [1.7, 2.6, '#ffffff'], [2.2, 3.5, '#c98be0']]) blk(g, x + a, z + f * b, 0.28, 0.28, 0, 0.34, col, { shadow: false, mat: GL(col) }); };
  H2(-9, -10.5, 1, ROOFS.green); H2(-20, -10.5, 1, ROOFS.blue); H2(-31, -10.5, 1, ROOFS.red); H2(-12, 10.5, -1, ROOFS.yellow); H2(-23, 10.5, -1, ROOFS.green); H2(-34, 10.5, -1, ROOFS.blue); H2(3, -9.5, 1, ROOFS.red);
  for (const [x, z, k] of [[-3, -13, 2.6], [-15, -15, 2.8], [-27, -15, 2.8], [-40, -13, 3], [-6, 15, 2.6], [-18, 15, 2.8], [-29, 16, 2.8], [-41, 13, 3], [-55, -9, 3.4], [-55, 10, 3.4]]) tree(g, x, 0, z, k);
  // life along the way: a market stall, a bench, a child on a bicycle, another family ahead, a dog
  { const x = 0.5, z = 6.2; blk(g, x, z, 2.6, 1.3, 0, 0.9, '#c9925a'); for (let k = 0; k < 6; k++) blk(g, x - 1.25 + k * 0.5, z - 0.1, 0.5, 1.9, 2.3, 0.14, k % 2 ? '#fbfbf7' : '#e0503a'); for (const a of [-1.2, 1.2]) blk(g, x + a, z - 0.6, 0.12, 0.12, 0.9, 1.4, '#7a5a33');
    for (const [a, c] of [[-0.8, '#e8402f'], [0, '#62b653'], [0.8, '#ffd257']]) blk(g, x + a, z - 0.2, 0.6, 0.6, 0.9, 0.3, c, { mat: GL(c) }); fig(g, x, 0, z + 1.2, { k: 1.45, shirt: '#3f78b5', skin: SKIN[2], hair: HAIR[0], cap: '#fbfbf7', arms: ['up', 'down'], turn: 2.4 }); }
  blk(g, -5.5, -2.6, 1.8, 0.5, 0.4, 0.1, '#c9925a'); blk(g, -5.5, -2.85, 1.8, 0.08, 0.5, 0.45, '#c9925a'); for (const s of [-0.75, 0.75]) blk(g, -5.5 + s, -2.6, 0.1, 0.4, 0, 0.4, INK); fig(g, -5.5, 0.14, -2.5, { k: 1.4, shirt: '#8a5fc2', skin: SKIN[3], hair: '#d9d9d9', sit: true, arms: ['down', 'up'], turn: 0.6 });
  bike(g, -13.5, 0.5, '#e0503a'); fig(g, -13.3, 0.5, 0.5, { k: 1.05, shirt: '#ffd257', skin: SKIN[1], hair: HAIR[3], cap: '#3f78b5', sit: true, arms: ['fwd', 'fwd'], turn: -Math.PI / 2 });
  fig(g, -21, 0, -0.5, { k: 1.5, shirt: '#e0503a', skin: SKIN[2], hair: HAIR[0], turn: -Math.PI / 2, step: 0.12 }); fig(g, -21, 0, 0.5, { k: 1.05, shirt: '#16a3a3', skin: SKIN[2], hair: HAIR[0], pack: '#8a5fc2', turn: -Math.PI / 2, step: -0.1 });
  fig(g, -29, 0, 0.3, { k: 1.5, shirt: '#2e9b5a', skin: SKIN[0], hair: HAIR[2], turn: -Math.PI / 2, step: 0.12 }); fig(g, -29, 0, -0.6, { k: 1.0, shirt: '#ffd257', skin: SKIN[0], hair: HAIR[2], pack: '#e0503a', turn: -Math.PI / 2, step: -0.1 });
  dog(g, 4.2, 0.8, 2.2);
  for (const [x, z] of [[-11.5, 2.2], [-22.5, -2.2], [-33, 2.2]]) { blk(g, x, z, 0.14, 0.14, 0, 2.6, '#2b3a55'); blk(g, x, z, 0.46, 0.46, 2.6, 0.38, '#ffd257', { mat: GL('#ffe27a') }); }
  for (let k = 0; k < 26; k++) { const x = 2 - hash(k, 1) * 36, z = (hash(k, 2) > 0.5 ? 1 : -1) * (1.7 + hash(k, 3) * 1.0), c = ['#f08ab8', '#ffd257', '#ffffff', '#c98be0', '#e0503a'][k % 5]; blk(g, x, z, 0.24, 0.24, 0, 0.3, c, { shadow: false, mat: GL(c) }); }
  // the junction: two yellow places on the path, one for each way
  place(g, -8.2, 0, 2, 2, 0.1); place(g, -3, 5.2, 2, 2, 0.1);
  // far hills, clouds and the sun
  for (const [z, w, hh] of [[-40, 28, 9], [-12, 30, 13], [16, 28, 10], [42, 24, 8]]) for (let q = 0; q < 5; q++) blk(g, -92, z, 8, w * (1 - q * 0.19), q * hh / 5, hh / 5, q === 4 ? '#fbfbf7' : q === 3 ? '#d5dbe0' : ['#a9c6a0', '#b4c9b6', '#c2cfc9'][q], NO);
  for (const [y, z] of [[20, -20], [24, 8], [18, 30]]) { blk(g, -88, z, 2, 9, y, 1.6, '#fff', { shadow: false, mat: GL('#ffffff') }); blk(g, -88, z + 1.5, 2, 5, y + 1.6, 1.2, '#fff', { shadow: false, mat: GL('#ffffff') }); }
  blk(g, -95, 27, 1, 7, 22, 7, '#ffd257', { shadow: false, mat: GL('#ffd84a') });
  // the family has stopped at the junction to look at the map: the child in front holding it, mum and dad just behind
  fig(g, 2.9, 0, -1.0, { k: 1.2, shirt: '#e0503a', legs: '#2b3a55', skin: SKIN[0], hair: HAIR[1], cap: '#3f78b5', pack: '#ffd257', turn: 1.25, head: 0.15, arms: ['fwd', 'fwd'] });
  { const m = group(g, 3.52, 1.02, -0.8); m.rotation.y = 1.25; blk(m, 0, 0, 0.8, 0.05, 0, 0.5, '#fff7e6', { mat: GL('#fff7e6') }); blk(m, 0, 0.03, 0.5, 0.02, 0.22, 0.07, '#e0503a', { shadow: false, mat: GL('#e0503a') }); blk(m, 0.2, 0.03, 0.14, 0.02, 0.3, 0.12, '#ffd76a', { shadow: false, mat: GL('#ffd76a') }); }
  fig(g, 1.5, 0, -2.3, { k: 1.55, shirt: '#8a5fc2', legs: '#2b3a55', skin: SKIN[3], hair: HAIR[4], long: true, turn: 0.95, head: 0.3, arms: ['down', 'down'] });
  fig(g, 1.2, 0, -0.1, { k: 1.6, shirt: '#2e9b5a', legs: '#4a556e', skin: SKIN[0], hair: HAIR[0], turn: 1.75, head: -0.4, arms: ['down', 'down'] });
  return { me: [2.9, 2.25, -1.0], up: [-8.2, 0.2, 0], left: [-3, 0.2, 5.2] };
}

// ---- car town: grey, crowded and nearly still -------------------------------------------------------------------------
const CARS = ['#b9534a', '#8f97a3', '#d7d2c4', '#5c6f8f', '#3f4658', '#a7a08f', '#c9b458', '#7c8f7a'];
function car(g, x, z, c, o = {}) {
  const p = group(g, x, 0, z), L = o.long || 3.8; blk(p, 0, 0, L, 1.8, 0.35, 0.75, c); for (const a of [-L / 2 + 0.75, L / 2 - 0.75]) for (const b of [-0.86, 0.86]) blk(p, a, b, 0.72, 0.24, 0, 0.72, '#2a2a2a');
  if (o.open) { for (const b of [-0.8, 0.8]) blk(p, -0.95, b, 0.14, 0.14, 1.1, 0.7, c); blk(p, -0.95, 0, 0.08, 1.5, 1.1, 0.7, '#bfe3f5', { shadow: false, mat: soft('#cfeaf8', 0.4) }); blk(p, -0.95, 0, 0.16, 1.74, 1.78, 0.1, c); }
  else { blk(p, 0.1, 0, L - 1.5, 1.66, 1.1, (o.tall || 0.72), '#5f7385'); blk(p, 0.1, 0, L - 1.4, 1.74, 1.1 + (o.tall || 0.72), 0.14, c); }
  for (const b of [-0.6, 0.6]) blk(p, L / 2 + 0.02, b, 0.05, 0.36, 0.7, 0.22, '#ff5a4a', { shadow: false, mat: GL('#ff5a4a') });
  // pollution from the back of the car: dirty brown-grey clouds that hang at the height of the cars
  for (let k = 0; k < 6; k++) { const q = 0.45 + hash(k, x) * 0.55; blk(p, L / 2 + 0.5 + k * 0.42 + hash(x, k) * 0.3, -0.9 + hash(x + k, z) * 1.8, q, q, 0.25 + hash(k * 3, x) * 1.5, q, '#6f6a62', { shadow: false, mat: GL(['#6f6a62', '#7d776d', '#8b857a', '#5f5b55'][k % 4]) }); }
  return p;
}
function carTown(g) {
  for (let x = -90; x <= 20; x += 2) for (let z = -30; z <= 30; z += 2) blk(g, x + 1, z + 1, 2, 2, -1.6, 1.6, ['#bdbab2', '#b6b3ab', '#c2bfb7'][Math.floor(hash(x, z) * 3)], NO);
  blk(g, -35, 0, 112, 8.4, 0, 0.04, '#6f7078', NO); for (const z of [-4.5, 4.5]) blk(g, -35, z, 112, 0.5, 0, 0.18, '#d9d6cf'); for (let x = -88; x < 20; x += 3) blk(g, x, 0, 1.5, 0.16, 0.04, 0.02, '#f1efe8', NO);
  // tall grey blocks on both sides, with rows of windows
  for (let k = 0; k < 13; k++) for (const s of [-1, 1]) { const x = 14 - k * 7.6, hh = 7 + hash(k, s) * 9; if (s > 0 && x > -6) continue; const c = ['#a9a6a0', '#b9b2a6', '#9d9fa6', '#c2bdb2'][(k + (s > 0 ? 1 : 0)) % 4]; blk(g, x, s * 13.5, 6.6, 7, 0, hh, c);
    for (let r = 0; r * 1.9 < hh - 2.4; r++) for (let q = 0; q < 3; q++) blk(g, x - 2 + q * 2, s * 9.98, 1.1, 0.05, 1.6 + r * 1.9, 1.0, '#5f6f85', { shadow: false, mat: GL(hash(k + r, q + s) > 0.8 ? '#5a6678' : '#6d7d92') }); }
  // the queue: two lanes of cars, bumper to bumper, with their brake lights on
  let n = 0; for (const z of [-2.1, 2.1]) for (let x = z > 0 ? 6 : 4; x > -66; x -= 5.1) { n++; if (z > 0 && Math.abs(x - 0.9) < 0.1) continue; if (n % 7 === 3) { car(g, x, z, '#d9a441', { long: 4.6, tall: 1.3 }); continue; } car(g, x, z, CARS[(n * 3) % 8]); }
  // the friend's car, with the friend in the back seat looking out and a grown-up driving
  const f = car(g, 0.9, 2.1, '#3f78b5', { open: true }); fig(f, 0.75, 0.3, 0.36, { k: 0.98, shirt: '#ffd257', skin: SKIN[1], hair: HAIR[0], turn: -Math.PI / 2, head: 2.0, arms: ['down', 'down'] }); fig(f, -0.3, 0.3, -0.38, { k: 1.1, shirt: '#e0503a', skin: SKIN[1], hair: HAIR[3], turn: -Math.PI / 2 });
  // a dirty layer that hangs over the queue at the height of the cars
  for (let k = 0; k < 26; k++) { const x = 9 - k * 2.6 - hash(k, 4), q = 0.8 + hash(k, 5) * 0.9; blk(g, x, -3 + hash(k, 6) * 6, q * 1.4, q, 1.3 + hash(k, 7) * 1.6, q * 0.7, '#5f5a53', { shadow: false, mat: soft(['#5f5a53', '#6f6960', '#4f4b46'][k % 3], 0.78) }); }
  // traffic lights showing red, and haze that thickens with distance
  for (const z of [-5.2, 5.2]) { blk(g, -8, z, 0.2, 0.2, 0, 4.2, '#3f4658'); blk(g, -8, z, 0.6, 0.6, 4.2, 1.5, '#2a2a2a'); blk(g, -7.68, z, 0.05, 0.4, 5.2, 0.4, '#ff5a4a', { shadow: false, mat: GL('#ff3b30') }); blk(g, -7.68, z, 0.05, 0.4, 4.7, 0.4, '#5a5030', NO); blk(g, -7.68, z, 0.05, 0.4, 4.25, 0.4, '#30503a', NO); }
  for (const [x, o] of [[-22, 0.2], [-36, 0.26], [-50, 0.3], [-64, 0.34]]) blk(g, x, 0, 0.1, 60, 0, 30, '#b5ada0', { shadow: false, mat: soft('#b5ada0', o) });
  // the same school, far away at the end of the road
  { const s = group(g, -74, 0, 0); blk(s, 0, 0, 5, 12, 0, 3.4, '#ffd76a', { mat: GL('#f1d98c') }); for (let i = 0; i < 5; i++) blk(s, 0, 0, 5.6 * (1 - i / 5 * 0.8), 12.6, 3.4 + i * 0.42, 0.42, '#c9705a', { shadow: false, mat: GL('#cf8a78') }); blk(s, 0, 0, 1.6, 1.6, 5.5, 1.6, '#ffd76a', { mat: GL('#f1d98c') }); blk(s, 0, 0, 2, 2, 7.1, 0.3, '#c9705a', { shadow: false, mat: GL('#cf8a78') }); }
  return { friend: [0.9, 2.5, 2.1], far: [-74, 9.2, 0] };
}

// The map panel is drawn from the same homes, river, bridge and paths as the map of screen 2, so it is the child's own map.
const map = (D) => { const X = (x) => (x + 22) * 9 + 10, Z = (z) => (z + 9.2) * 8.3 + 4, cell = (c, w, col) => D.path.map(([x, z]) => `<rect x="${X(x) - w}" y="${Z(z) - w}" width="${9 + 2 * w}" height="${8.3 + 2 * w}" fill="${col}"/>`).join('');
  let riv = ''; for (let z = -9.2; z <= 10; z += 0.8) riv += `${riv ? 'L' : 'M'}${X(D.rivX(z)).toFixed(1)} ${Z(z).toFixed(1)}`;
  const RC = { red: '#d2553a', blue: '#3f78b5', green: '#2e9b5a', yellow: '#e9ad1c' }, at = (k) => [X(D.PL[k][0]), Z(D.PL[k][1])];
  const homes = D.homes.map((h) => { const [x, y] = at(h.at); return `<rect x="${x - 7}" y="${y - 3}" width="14" height="10" fill="#fff4dc" stroke="#1f2a44" stroke-width="2"/><path d="M${x - 10} ${y - 2}L${x} ${y - 11}l10 9z" fill="${RC[h.roof]}" stroke="#1f2a44" stroke-width="2" stroke-linejoin="round"/>`; }).join('');
  const parks = D.parks.map((k) => { const [x, y] = at(k); return `<rect x="${x - 12}" y="${y - 12}" width="24" height="26" rx="6" fill="#6fb257"/><rect x="${x - 5}" y="${y}" width="11" height="7" rx="3" fill="#6cc4ee"/>`; }).join('');
  const [sx, sy] = at(D.school), [qx, qy] = at(D.shop), [hx, hy] = at(D.home), you = [X(D.you[0]), Z(D.you[1])], b = D.bridge;
  const route = D.route.map(([x, z], k) => `${k ? 'L' : 'M'}${X(x)} ${Z(z)}`).join('');
  const cars = [...Array(17)].map((_, k) => `<rect x="${14 + k * 20}" y="171" width="15" height="11" rx="2" fill="${['#b9534a', '#d7d2c4', '#3f4658', '#c9b458'][k % 4]}" stroke="#1f2a44" stroke-width="1.5"/>`).join('');
  return `<div class="wmap"><svg viewBox="0 0 400 196"><rect width="400" height="196" fill="#a9d985"/><path d="${riv}" fill="none" stroke="#5cb8e6" stroke-width="13"/>${parks}
    ${cell(null, 2.2, '#1f2a44')}<rect x="${X(b[0]) - 2}" y="${Z(b[1]) - 3}" width="${b[2] * 9 + 4}" height="14.3" fill="#1f2a44"/>${cell(null, 0, '#fff7e6')}<rect x="${X(b[0])}" y="${Z(b[1]) - 1}" width="${b[2] * 9}" height="10.3" fill="#c9925a"/>
    <rect x="${qx - 9}" y="${qy - 6}" width="18" height="12" fill="#fff4dc" stroke="#1f2a44" stroke-width="2"/><rect x="${qx - 11}" y="${qy - 11}" width="22" height="7" fill="#e0503a" stroke="#1f2a44" stroke-width="2"/>${homes}
    <rect x="${sx - 12}" y="${sy - 6}" width="24" height="16" fill="#ffd76a" stroke="#1f2a44" stroke-width="2.5"/><path d="M${sx - 15} ${sy - 5}L${sx} ${sy - 17}l15 12z" fill="#d2553a" stroke="#1f2a44" stroke-width="2.5" stroke-linejoin="round"/><path d="M${sx} ${sy - 17}v-11h10v6h-10" fill="#e0503a" stroke="#1f2a44" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="${hx}" cy="${hy}" r="15" fill="none" stroke="#e0503a" stroke-width="3"/><path d="${route}" fill="none" stroke="#e0503a" stroke-width="4" stroke-dasharray="1 8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${you[0]}" cy="${you[1]}" r="16" fill="#ffd257" fill-opacity=".6" stroke="#1f2a44" stroke-width="2.5"/><circle cx="${you[0]}" cy="${you[1]}" r="8" fill="#e0503a" stroke="#fff" stroke-width="3.5"/>
    <rect x="0" y="162" width="400" height="34" fill="#8d8f96"/><rect x="0" y="160" width="400" height="4" fill="#1f2a44"/>${cars}<rect x="352" y="169" width="18" height="14" fill="#ffd76a" stroke="#1f2a44" stroke-width="2"/><path d="M349 170l12-9 12 9z" fill="#d2553a" stroke="#1f2a44" stroke-width="2" stroke-linejoin="round"/>
    <rect x="71" y="169" width="19" height="15" rx="3" fill="#3f78b5" stroke="#1f2a44" stroke-width="3"/><circle cx="80.5" cy="176.5" r="15" fill="none" stroke="#fff" stroke-width="3"/></svg>
    <b style="left:${you[0] - 12}px;top:${you[1] + 26}px">You</b><b style="left:${hx - 30}px;top:${hy - 34}px">Home</b><b style="left:${sx - 34}px;top:${sy + 22}px">School</b><b style="left:104px;top:170px">Your friend</b></div>`; };
const css = `<style>
.cx .split { position: absolute; left: 637px; top: 0; bottom: 226px; width: 6px; background: var(--ui-ink); z-index: 2; }
.cx .band { position: absolute; left: 0; right: 0; bottom: 0; height: 226px; background: var(--ui-paper); border-top: 6px solid var(--ui-ink); box-sizing: border-box; z-index: 1; }
.cx .wmap { position: absolute; left: 432px; bottom: 6px; width: 416px; padding: 6px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 22px; box-shadow: 0 5px 0 var(--ui-shade); z-index: 4; }
.cx .wmap svg { display: block; width: 400px; height: 196px; border-radius: 14px; border: 3px solid var(--ui-ink); box-sizing: border-box; }
.cx .wmap b { position: absolute; padding: 1px 7px 2px; background: var(--ui-paper); border: 2px solid var(--ui-ink); border-radius: 8px; font: 800 16px/1.15 var(--ui-display); white-space: nowrap; }
.cx .go { position: absolute; transform: translate(-50%, -50%); display: grid; place-items: center; width: 58px; height: 58px; background: var(--ui-sun); border: 3px solid var(--ui-ink); border-radius: 14px; box-shadow: 0 5px 0 var(--ui-ink); font: 800 30px/1 var(--ui-display); z-index: 3; }
.cx .tagr { position: absolute; right: 16px; top: 16px; display: flex; align-items: center; height: 48px; padding: 0 18px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 999px; box-shadow: 0 5px 0 var(--ui-shade); font: 800 20px/1 var(--ui-display); z-index: 3; }
</style>`;
export const walk = {
  id: 'paths-walk',
  band: 226, split: [{ room: eco, half: 44, fov: 40, eye: [15.5, 5.0, 1.5], at: [-20, 2.9, 0.1], bg: '#c9ecff' }, { room: carTown, half: 40, fov: 40, eye: [11.5, 4.8, 6.4], at: [-10, 1.9, 0.2], night: 0.3, bg: '#c4c5c1' }],
  html: (p) => css + top('Getting around', 'Walk to school') + '<i class="split"></i><i class="band"></i><div class="tagr">Car town</div>' + '<div class="keys"><i class="key">&larr;</i><i class="key">&uarr;</i><i class="key"><em>Arrow keys work too.</em></i></div>' + map(walk.data) + florence + hint('Look at the map.<br>Click the way to school.').replace('class="hint"', 'class="hint" style="max-width:270px"')
    + plate(p.me, 'You', 'on tip', -6, -52) + plate(p.friend, 'Your friend', 'tip', 0, -8) + `<i class="go" style="left:${p.up[0]}px;top:${p.up[1] - 26}px">&uarr;</i><i class="go" style="left:${p.left[0]}px;top:${p.left[1] - 26}px">&larr;</i>` + mouse(p.up[0] + 6, p.up[1] - 22),
};
