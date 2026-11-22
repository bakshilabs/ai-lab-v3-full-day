// Screen 3, second idea (owner, 22 Nov 2026): a split screen. On the left the child walks to school in Eco Town with
// mum and dad, along the path the child drew. On the right a friend sits in a car in a queue in "car town". A map shows
// where the child is, the way to school, and the friend's car. The child is never alone and never goes to a stranger's door.
import { THREE, PAL, blk, group, hash, GL, soft, INK, SKIN, HAIR, ROOFS, place, fig, cottage, shade, tree, pine, florence, top, mouse, hint, plate } from './kit-v2.js';
const PATHC = '#fff7e6', NO = { shadow: false };

// ---- Eco Town: green, calm and moving ---------------------------------------------------------------------------------
function eco(g) {
  for (let x = -64; x <= 18; x += 2) for (let z = -34; z <= 26; z += 2) blk(g, x + 1, z + 1, 2, 2, -1.6, 1.6, PAL.grass[Math.floor(hash(x, z) * 4)]);
  const slab = (x, z) => { blk(g, x, z, 1.04, 1.14, 0, 0.05, '#8a7d68', NO); blk(g, x, z, 0.9, 1.0, 0, 0.09, PATHC); };
  for (let x = -21; x < 18; x++) for (const z of [-0.55, 0.55]) slab(x + 0.5, z);
  for (let z = 1; z < 15; z++) for (const x of [-7.55, -6.45]) { blk(g, x, z + 0.6, 1.14, 1.04, 0, 0.05, '#8a7d68', NO); blk(g, x, z + 0.6, 1.0, 0.9, 0, 0.09, PATHC); }
  // the school at the end of the path: the one yellow building, with its bell, its flag and an open gate
  { const s = group(g, -29, 0, 0); blk(s, 0, 0, 5, 12, 0, 3.4, '#ffd76a'); for (let i = 0; i < 5; i++) blk(s, 0, 0, 5.6 * (1 - i / 5 * 0.8), 12.6, 3.4 + i * 0.42, 0.42, i % 2 ? shade(ROOFS.red, -0.05) : ROOFS.red);
    blk(s, 0, 0, 1.6, 1.6, 5.5, 1.6, '#ffd76a'); blk(s, 0.82, 0, 0.06, 0.7, 5.9, 0.7, '#ffd257', { mat: GL('#ffb400') }); blk(s, 0, 0, 2, 2, 7.1, 0.3, ROOFS.red);
    blk(s, 2.52, 0, 0.08, 1.8, 0, 2.3, '#7a5a33', NO); for (const z of [-4, -2.2, 2.2, 4]) blk(s, 2.52, z, 0.08, 1.2, 1.2, 1.2, '#9fd0f5', { shadow: false, mat: GL('#bfe3f5') });
    blk(s, 3.4, 5.2, 0.12, 0.12, 0, 5.4, '#fbfbf7'); blk(s, 3.4, 5.75, 0.06, 1.0, 4.5, 0.7, '#e0503a', NO); blk(s, 4.6, 0, 4.6, 14, 0, 0.04, '#efe2c2', NO); }
  for (const z of [-1.5, 1.5]) blk(g, -21.6, z, 0.4, 0.4, 0, 1.7, '#fbfbf7'); for (const s of [-1, 1]) for (let k = 0; k < 9; k++) { blk(g, -21.6, s * (2.2 + k * 0.7), 0.12, 0.12, 0, 0.9, '#fbfbf7'); } for (const s of [-1, 1]) blk(g, -21.6, s * 5, 0.08, 6.4, 0.55, 0.1, '#fbfbf7', NO);
  // people at the gate: a teacher waving, and another family arriving
  fig(g, -20.6, 0, 2.3, { k: 1.45, shirt: '#16a3a3', skin: SKIN[1], hair: HAIR[3], long: true, arms: ['up', 'down'], turn: Math.PI / 2 });
  fig(g, -18.6, 0, -2.2, { k: 1.45, shirt: '#8a5fc2', skin: SKIN[2], hair: HAIR[0], turn: -2.2, step: 0.1 }); fig(g, -19.3, 0, -1.5, { k: 1.05, shirt: '#ffd257', skin: SKIN[2], hair: HAIR[0], pack: '#3f78b5', turn: -2.2, step: 0.1 });
  // homes with the child's roof colours, set back from the path, with gardens
  const H2 = (x, z, f, roof) => { cottage(g, x, 0, z, { s: 4, d: 3.6, tall: 2.3, steps: 6, rise: 0.3, roof, face: f, garden: false, timber: true, wall: PAL.timber });
    blk(g, x, z + f * 3.2, 5.6, 2.8, 0, 0.04, '#74b56a', NO); blk(g, x, z + f * 3.3, 0.9, 3.0, 0.01, 0.06, PATHC, NO); for (const s of [-1, 1]) blk(g, x + s * 1.75, z + f * 4.55, 1.9, 0.06, 0.36, 0.08, '#fbfbf7', NO); for (let k = -3; k <= 3; k++) if (k) blk(g, x + k * 0.85, z + f * 4.55, 0.1, 0.1, 0, 0.6, '#fbfbf7');
    for (const [a, b, col] of [[-1.6, 2.5, '#f08ab8'], [-2.1, 3.4, '#ffd257'], [1.7, 2.6, '#ffffff'], [2.2, 3.5, '#c98be0']]) blk(g, x + a, z + f * b, 0.28, 0.28, 0, 0.34, col, { shadow: false, mat: GL(col) }); };
  H2(-2.5, -8.2, 1, ROOFS.green); H2(-12, -8.2, 1, ROOFS.blue); H2(0.5, 8.2, -1, ROOFS.red); H2(-14.5, 9.5, -1, ROOFS.yellow);
  for (const [x, z, k] of [[-7.2, -11.5, 2.4], [-17, -5.5, 1.9], [5.5, -12, 2.5], [-10.5, 16, 2.4], [-3.4, 15, 2.2], [-18.5, 14, 2.3], [-24, -10, 2.4], [-25, 11, 2.4], [-34, -14, 2.8], [-35, 13, 2.8]]) tree(g, x, 0, z, k);
  for (const [x, z] of [[-9.2, -1.8], [-15.5, 1.8]]) { blk(g, x, z, 0.14, 0.14, 0, 2.4, '#2b3a55'); blk(g, x, z, 0.44, 0.44, 2.4, 0.36, '#ffd257', { mat: GL('#ffe27a') }); }
  blk(g, -3.4, -1.9, 1.6, 0.5, 0.36, 0.1, '#c9925a'); blk(g, -3.4, -2.14, 1.6, 0.08, 0.46, 0.4, '#c9925a'); for (const s of [-0.65, 0.65]) blk(g, -3.4 + s, -1.9, 0.1, 0.4, 0, 0.36, INK);
  // the junction: two yellow places on the path, one for each way
  place(g, -11, 0, 1.9, 1.9, 0.1); place(g, -7, 4.2, 1.9, 1.9, 0.1);
  // far hills and a few clouds
  for (const [z, w, hh] of [[-36, 26, 9], [-10, 30, 13], [16, 28, 10], [40, 22, 8]]) for (let q = 0; q < 5; q++) blk(g, -80, z, 8, w * (1 - q * 0.19), q * hh / 5, hh / 5, q === 4 ? '#fbfbf7' : q === 3 ? '#d5dbe0' : ['#a9c6a0', '#b4c9b6', '#c2cfc9'][q], NO);
  // the family: the child in the middle with a school bag, mum on one side and dad on the other, all walking
  fig(g, 0, 0, 0.05, { k: 1.12, shirt: '#e0503a', legs: '#2b3a55', skin: SKIN[0], hair: HAIR[1], cap: '#3f78b5', pack: '#ffd257', turn: -Math.PI / 2, head: 1.15, arms: ['up', 'down'], step: 0.12 });
  fig(g, 0, 0, 1.0, { k: 1.55, shirt: '#2e9b5a', legs: '#4a556e', skin: SKIN[0], hair: HAIR[0], turn: -Math.PI / 2, head: -0.5, arms: ['down', 'down'], step: -0.12 });
  fig(g, 0, 0, -0.95, { k: 1.5, shirt: '#8a5fc2', legs: '#2b3a55', skin: SKIN[3], hair: HAIR[4], long: true, turn: -Math.PI / 2, head: 1.1, arms: ['down', 'down'], step: 0.12 });
  return { me: [0, 2.3, 0.05], up: [-11, 0.2, 0], left: [-7, 0.2, 4.2], school: [-29, 8.2, 0] };
}

// ---- car town: grey, crowded and nearly still -------------------------------------------------------------------------
const CARS = ['#b9534a', '#8f97a3', '#d7d2c4', '#5c6f8f', '#3f4658', '#a7a08f', '#c9b458', '#7c8f7a'];
function car(g, x, z, c, o = {}) {
  const p = group(g, x, 0, z), L = o.long || 3.8; blk(p, 0, 0, L, 1.8, 0.35, 0.75, c); for (const a of [-L / 2 + 0.75, L / 2 - 0.75]) for (const b of [-0.86, 0.86]) blk(p, a, b, 0.72, 0.24, 0, 0.72, '#2a2a2a');
  if (o.open) { for (const b of [-0.8, 0.8]) blk(p, -0.95, b, 0.14, 0.14, 1.1, 0.7, c); blk(p, -0.95, 0, 0.08, 1.5, 1.1, 0.7, '#bfe3f5', { shadow: false, mat: soft('#cfeaf8', 0.4) }); blk(p, -0.95, 0, 0.16, 1.74, 1.78, 0.1, c); }
  else { blk(p, 0.1, 0, L - 1.5, 1.66, 1.1, (o.tall || 0.72), '#5f7385'); blk(p, 0.1, 0, L - 1.4, 1.74, 1.1 + (o.tall || 0.72), 0.14, c); }
  for (const b of [-0.6, 0.6]) blk(p, L / 2 + 0.02, b, 0.05, 0.36, 0.7, 0.22, '#ff5a4a', { shadow: false, mat: GL('#ff5a4a') });
  // pollution from the back of the car: grey puffs that rise and spread
  for (let k = 0; k < 5; k++) { const s = 0.26 + k * 0.1; blk(p, L / 2 + 0.3 + k * 0.3, -0.55 + hash(x + k, z) * 0.3, s, s, 0.25 + k * 0.42 + hash(k, x) * 0.2, s, '#6f7176', { shadow: false, mat: GL(['#6f7176', '#85878c', '#9a9ca0'][k % 3]) }); }
  return p;
}
function carTown(g) {
  for (let x = -90; x <= 20; x += 2) for (let z = -30; z <= 30; z += 2) blk(g, x + 1, z + 1, 2, 2, -1.6, 1.6, ['#bdbab2', '#b6b3ab', '#c2bfb7'][Math.floor(hash(x, z) * 3)], NO);
  blk(g, -35, 0, 112, 8.4, 0, 0.04, '#6f7078', NO); for (const z of [-4.5, 4.5]) blk(g, -35, z, 112, 0.5, 0, 0.18, '#d9d6cf'); for (let x = -88; x < 20; x += 3) blk(g, x, 0, 1.5, 0.16, 0.04, 0.02, '#f1efe8', NO);
  // tall grey blocks on both sides, with rows of windows
  for (let k = 0; k < 13; k++) for (const s of [-1, 1]) { const x = 14 - k * 7.6, hh = 7 + hash(k, s) * 9; if (s > 0 && x > -6) continue; const c = ['#a9a6a0', '#b9b2a6', '#9d9fa6', '#c2bdb2'][(k + (s > 0 ? 1 : 0)) % 4]; blk(g, x, s * 13.5, 6.6, 7, 0, hh, c);
    for (let r = 0; r * 1.9 < hh - 2.4; r++) for (let q = 0; q < 3; q++) blk(g, x - 2 + q * 2, s * 9.98, 1.1, 0.05, 1.6 + r * 1.9, 1.0, '#5f6f85', { shadow: false, mat: GL(hash(k + r, q + s) > 0.8 ? '#ffe27a' : '#6d7d92') }); }
  // the queue: two lanes of cars, bumper to bumper, with their brake lights on
  let n = 0; for (const z of [-2.1, 2.1]) for (let x = z > 0 ? 6 : 4; x > -66; x -= 5.1) { n++; if (z > 0 && Math.abs(x - 0.9) < 0.1) continue; if (n % 7 === 3) { car(g, x, z, '#d9a441', { long: 4.6, tall: 1.3 }); continue; } car(g, x, z, CARS[(n * 3) % 8]); }
  // the friend's car, with the friend in the back seat looking out and a grown-up driving
  const f = car(g, 0.9, 2.1, '#3f78b5', { open: true }); fig(f, 0.75, 0.3, 0.36, { k: 0.98, shirt: '#ffd257', skin: SKIN[1], hair: HAIR[0], turn: -Math.PI / 2, head: 2.0, arms: ['down', 'down'] }); fig(f, -0.3, 0.3, -0.38, { k: 1.1, shirt: '#e0503a', skin: SKIN[1], hair: HAIR[3], turn: -Math.PI / 2 });
  // traffic lights showing red, and haze that thickens with distance
  for (const z of [-5.2, 5.2]) { blk(g, -8, z, 0.2, 0.2, 0, 4.2, '#3f4658'); blk(g, -8, z, 0.6, 0.6, 4.2, 1.5, '#2a2a2a'); blk(g, -7.68, z, 0.05, 0.4, 5.2, 0.4, '#ff5a4a', { shadow: false, mat: GL('#ff3b30') }); blk(g, -7.68, z, 0.05, 0.4, 4.7, 0.4, '#5a5030', NO); blk(g, -7.68, z, 0.05, 0.4, 4.25, 0.4, '#30503a', NO); }
  for (const [x, o] of [[-30, 0.22], [-46, 0.26], [-62, 0.3]]) blk(g, x, 0, 0.1, 60, 0, 30, '#c9c9c9', { shadow: false, mat: soft('#d6d9d8', o) });
  // the same school, far away at the end of the road
  { const s = group(g, -74, 0, 0); blk(s, 0, 0, 5, 12, 0, 3.4, '#ffd76a', { mat: GL('#f1d98c') }); for (let i = 0; i < 5; i++) blk(s, 0, 0, 5.6 * (1 - i / 5 * 0.8), 12.6, 3.4 + i * 0.42, 0.42, '#c9705a', { shadow: false, mat: GL('#cf8a78') }); blk(s, 0, 0, 1.6, 1.6, 5.5, 1.6, '#ffd76a', { mat: GL('#f1d98c') }); blk(s, 0, 0, 2, 2, 7.1, 0.3, '#c9705a', { shadow: false, mat: GL('#cf8a78') }); }
  blk(g, 2, -6.4, 1.2, 1.2, 0, 0.7, '#8d8378'); tree(g, 2, 0.7, -6.4, 1.0, '#8aa37a');
  return { friend: [0.9, 2.5, 2.1], far: [-74, 9.2, 0] };
}

const map = () => { const R = 'stroke-linejoin="round" stroke-linecap="round" fill="none"', road = 'M34 150V176H366V58H340', path = 'M34 150V112H96V58H318', loop = 'M250 58V22H170V58';
  const cars = [56, 76, 96, 136, 156, 176, 196, 216, 236, 256, 276, 296, 316, 336].map((x, k) => `<rect x="${x - 7}" y="171" width="14" height="10" rx="2" fill="${['#b9534a', '#d7d2c4', '#3f4658', '#c9b458'][k % 4]}" stroke="#1f2a44" stroke-width="1.5"/>`).join('') + [80, 100, 120, 140, 160].map((y, k) => `<rect x="361" y="${y - 7}" width="10" height="14" rx="2" fill="${['#d7d2c4', '#b9534a', '#5c6f8f'][k % 3]}" stroke="#1f2a44" stroke-width="1.5"/>`).join('');
  return `<div class="wmap"><svg viewBox="0 0 400 196"><rect width="400" height="196" rx="14" fill="#a9d985"/><rect x="0" y="160" width="400" height="36" fill="#c9c6be"/><rect x="350" y="40" width="50" height="156" fill="#c9c6be"/>
    <rect x="182" y="30" width="56" height="22" rx="6" fill="#74b56a"/><rect x="198" y="36" width="22" height="10" rx="4" fill="#6cc4ee"/>
    <path d="${road}" ${R} stroke="#1f2a44" stroke-width="20"/><path d="${road}" ${R} stroke="#8d8f96" stroke-width="14"/>${cars}
    <path d="${loop}" ${R} stroke="#1f2a44" stroke-width="13"/><path d="${path}" ${R} stroke="#1f2a44" stroke-width="13"/><path d="${loop}" ${R} stroke="#fff7e6" stroke-width="8"/><path d="${path}" ${R} stroke="#fff7e6" stroke-width="8"/>
    <path d="M34 150V112H96V58H222" ${R} stroke="#e0503a" stroke-width="4" stroke-dasharray="1 9"/>
    <rect x="20" y="140" width="28" height="20" fill="#fff4dc" stroke="#1f2a44" stroke-width="3"/><path d="M15 142L34 126l19 16z" fill="#d2553a" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/>
    <rect x="318" y="44" width="34" height="26" fill="#ffd76a" stroke="#1f2a44" stroke-width="3"/><path d="M313 46L335 28l22 18z" fill="#d2553a" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/><path d="M335 28V12h13v8h-13" fill="#e0503a" stroke="#1f2a44" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="107" y="169" width="20" height="14" rx="3" fill="#3f78b5" stroke="#1f2a44" stroke-width="3"/><circle cx="117" cy="176" r="15" fill="none" stroke="#3f78b5" stroke-width="3"/>
    <circle cx="226" cy="58" r="17" fill="#ffd257" fill-opacity=".55" stroke="#1f2a44" stroke-width="2.5"/><circle cx="226" cy="58" r="8.5" fill="#e0503a" stroke="#fff" stroke-width="3.5"/><circle cx="226" cy="58" r="10.5" fill="none" stroke="#1f2a44" stroke-width="2"/></svg>
    <b style="left:201px;top:70px">You</b><b style="left:84px;top:132px">Your friend</b><b style="left:312px;top:74px">School</b></div>`; };
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
  band: 226, split: [{ room: eco, half: 34, fov: 40, eye: [10.6, 4.6, 3.2], at: [-12, 2.0, -0.9] }, { room: carTown, half: 40, fov: 40, eye: [11.5, 4.8, 6.4], at: [-10, 1.9, 0.2], night: 0.22, bg: '#d6d9d8' }],
  html: (p) => css + top('Getting around', 'Walk to school') + '<i class="split"></i><i class="band"></i><div class="tagr">Car town</div>' + '<div class="keys"><i class="key">&larr;</i><i class="key">&uarr;</i><i class="key"><em>Arrow keys work too.</em></i></div>' + map() + florence + hint('Look at the map.<br>Click the way to school.').replace('class="hint"', 'class="hint" style="max-width:270px"')
    + plate(p.me, 'You', 'on tip', 0, -8) + plate(p.friend, 'Your friend', 'tip', 0, -8) + `<i class="go" style="left:${p.up[0]}px;top:${p.up[1] - 26}px">&uarr;</i><i class="go" style="left:${p.left[0]}px;top:${p.left[1] - 26}px">&larr;</i>` + mouse(p.up[0] + 6, p.up[1] - 22),
};
