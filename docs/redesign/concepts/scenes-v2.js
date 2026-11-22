// Second version of the play-break concept screens for Eco Town (22 Nov 2026), redrawn to answer the independent
// critique in critique-2026-11-22.md. Each scene is a small world of its own, built from the same plain blocks as the
// town, with a sketch of the interface on top. These are proposals only. The few words on them are placeholders.
// The wide land in scenes 1 to 3 and in the control room window is NOT the real world map: it shows how large Eco Town
// would need to be, and the real map (animation/map.js and the game's world map) would have to grow to match.
import { THREE, PAL, blk, group, hash, W, H, GL, soft, INK, SKIN, HAIR, ROOFS, place, frame, fig, wheelchair, walkingFrame, cottage, shade, tree, pine, dust, tomato, lettuce, strawberry, css, I, florence, top, row, tok, pal, sws, mouse, hint, plate } from './kit-v2.js';
import { factory, farm, control, school } from './rooms-v2.js';

// ---- the wider land ---------------------------------------------------------------------------------------------------
const PATHC = '#fff7e6', CX = -3, CZ = -1;
const rivX = (z) => -6.2 + Math.sin(z * 0.28 + 0.6) * 3.0;
const wob = (x, z) => Math.sin(x * 0.41 + z * 0.23) * 0.06 + Math.sin(z * 0.6 - x * 0.3) * 0.05;
const landV = (x, z) => ((x - CX) / 24) ** 2 + ((z - CZ) / 15) ** 2 + wob(x, z);
// the fourteen places where a stamp can go, in three neighbourhoods on high ground: [x, z]
const PL = { A1: [7.6, -6.3], A2: [12, -6.3], A3: [16.2, -5.6], A4: [7.6, -1.3], A5: [12, -1.3], A6: [16.2, -0.6], C1: [7.6, 5.8], C2: [12, 5.8],
  B1: [-17.6, -3.3], B2: [-13.9, -3.3], B3: [-21.3, -3.3], B4: [-15.8, 2], B5: [-19.5, 2], B6: [-12.1, 2] };
const PW = 3, PD = 3.8, inPlot = (x, z) => Object.values(PL).find(([px, pz]) => Math.abs(x - px) < PW / 2 + 0.5 && z > pz - 2.1 && z < pz + 2.7);
function ground(x, z) {
  const v = landV(x, z), d = Math.abs(x - rivX(z)), east = x > rivX(z), p = inPlot(x, z);
  if (p) return { h: p[0] > 0 ? 2 : 1, c: PAL.grass[Math.floor(hash(x, z) * 4)] };
  if (z < -10.5 && v < 0.93) { const h = Math.min(6, 2 + Math.floor((-10.5 - z) / 1.1) + (hash(x, z) > 0.6 ? 1 : 0)); return { h, c: h >= 5 ? '#fbfbf7' : h >= 4 ? '#cfc8bd' : ['#b9a58a', '#c4b094', '#ad9a80'][Math.floor(hash(z, x) * 3)], rock: true }; }
  if (d < 1.05) return { h: -0.3, c: hash(x, z) > 0.5 ? PAL.water : PAL.waterDeep, water: true };
  if (v > 0.9 && !(east && x - rivX(z) > 9 && z < 3)) return { h: 0, c: hash(x, z) > 0.5 ? PAL.sand : '#f2dcab', sand: true };
  if (d < 4.4) return { h: 0, c: ['#b4e08f', '#a9d985', '#bde69a'][Math.floor(hash(x, z) * 3)], low: true };
  return { h: east && x - rivX(z) > 8.6 ? 2 : 1, c: PAL.grass[Math.floor(hash(x, z) * 4)] };
}
const gh = (x, z) => Math.max(0, ground(x, z).h);
const seg = (x0, z0, x1, z1) => { const o = []; for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) o.push([x, z]); return o; };
const mapHome = (g, key, roof, o = {}) => { const [x, z] = PL[key]; return cottage(g, x, gh(x, z) + (o.lift || 0), z - 0.45, { s: 2.15, roof, wall: PAL.wall[0], ...o }); };
function park(g, key) { const [x, z] = PL[key], y = gh(x, z); blk(g, x, z + 0.2, PW, PD - 0.4, y, 0.05, '#6fb257', { shadow: false }); blk(g, x + 0.2, z + 0.6, 1.3, 1.0, y + 0.05, 0.04, '#5cb8e6', { shadow: false, mat: GL('#6cc4ee') });
  tree(g, x - 0.9, y, z - 0.9, 0.95, '#4f9550'); tree(g, x + 0.9, y, z - 0.7, 0.8, '#74b56a'); tree(g, x - 0.8, y, z + 1.3, 0.7, '#5fa35a'); blk(g, x + 0.9, z + 1.5, 0.9, 0.3, y, 0.3, '#c9925a'); for (const [a, b, c] of [[-0.2, -0.3, '#f08ab8'], [0.3, -0.5, '#ffd257'], [1.1, 0.1, '#ffffff']]) blk(g, x + a, z + b, 0.22, 0.22, y, 0.22, c, { shadow: false, mat: GL(c) }); }
function shop(g, key) { const [x, z] = PL[key], y = gh(x, z); blk(g, x, z - 0.4, 2.4, 2.0, y, 1.2, PAL.wall[1]); for (let k = 0; k < 6; k++) blk(g, x - 1.1 + k * 0.44, z + 0.7, 0.44, 1.0, y + 1.2, 0.14, k % 2 ? '#fbfbf7' : '#e0503a'); blk(g, x, z - 0.6, 2.6, 1.8, y + 1.2, 0.2, '#e0503a');
  for (const [a, c] of [[-0.7, '#e8402f'], [0, '#62b653'], [0.7, '#ffd257']]) blk(g, x + a, z + 0.95, 0.5, 0.4, y, 0.5, c, { mat: GL(c) }); blk(g, x, z + 1.6, 2.6, 0.8, y, 0.04, '#efe2c2', { shadow: false }); }

// S says what the child has done so far: homes, parks, the shop, the yellow places, the path and the bridge.
function world(g, S = {}) {
  const taken = new Set((S.path || []).map(([x, z]) => `${x},${z}`));
  for (let x = -34; x <= 30; x++) for (let z = -24; z <= 20; z++) { const X = x + 0.5, Z = z + 0.5, v = landV(X, Z);
    if (v >= 1) { if (v < 1.13) blk(g, X, Z, 1, 1, -0.7, 0.22, '#8fd3f2', { shadow: false }); continue; }
    const t = ground(X, Z); blk(g, X, Z, 1, 1, -1.6, t.h + 1.6, t.c);
    if (t.water || t.sand || t.rock || inPlot(X, Z) || taken.has(`${x},${z}`)) { if (t.rock && t.h <= 3 && hash(x * 3, z) > 0.72) pine(g, X, t.h, Z, 0.9); continue; }
    const r = hash(x * 1.7, z * 2.3), near = Object.values(PL).some(([px, pz]) => Math.abs(X - px) < 3 && Math.abs(Z - pz) < 4.4) || (S.clear || []).some(([a, b, c, d]) => X > a && X < c && Z > b && Z < d);
    if (t.low) { if (r > 0.9) blk(g, X, Z, 0.24, 0.24, 0, 0.3, ['#f08ab8', '#ffffff', '#c98be0'][x & 1 ? 0 : (z & 1) + 1], { shadow: false }); else if (r < 0.07 && Math.abs(X - rivX(Z)) < 2.2) for (const a of [-0.2, 0.15]) blk(g, X + a, Z, 0.12, 0.12, 0, 0.55, '#6f9a4a', { shadow: false }); continue; }
    if (near) continue;
    if (X < rivX(Z) && r < (Z < -5 || X < -22 ? 0.3 : 0.1)) (r < 0.12 ? pine : tree)(g, X, t.h, Z, 0.85 + r);
    else if (X > rivX(Z) && r < (Z > 9 || Z < -8 ? 0.2 : 0.045)) tree(g, X, t.h, Z, 0.85 + r * 2);
  }
  blk(g, 0, 0, 160, 120, -1.2, 0.6, PAL.water, { shadow: false });
  // the waterfall where the river leaves the mountains, a jetty with a boat, and the city far away on the next shore
  blk(g, rivX(-10.5), -10.6, 2, 0.5, -0.2, 2.6, '#dff1f7', { shadow: false, mat: GL('#e8f6fb') });
  { const jx = rivX(13) + 4.2; blk(g, jx, 14.6, 0.9, 3.2, -0.6, 0.75, '#c9925a'); const b = group(g, jx + 1.6, -0.6, 15.6); blk(b, 0, 0, 1.9, 0.9, 0, 0.4, '#e0503a'); blk(b, 0, 0, 0.1, 0.1, 0.4, 1.5, '#7a5a33'); blk(b, 0.4, 0, 0.8, 0.05, 0.6, 1.1, '#fbfbf7'); }
  blk(g, -34, -18.5, 26, 9, -0.9, 0.5, '#c9d8c2', { shadow: false }); for (let k = 0; k < 14; k++) { const x = -37.5 + (k % 7) * 2.1 + (k > 6 ? 1 : 0), z = -17 - (k > 6 ? 2.2 : 0), hh = 1.6 + hash(k, 5) * 4.2; blk(g, x, z, 1.3, 1.3, -0.4, hh, ['#e4e9ee', '#cfd9e3', '#f1ede4'][k % 3], { shadow: false }); for (let q = 0; q * 0.9 < hh - 0.9; q++) blk(g, x, z + 0.66, 0.9, 0.03, 0.1 + q * 0.9, 0.4, '#8fb6d6', { shadow: false }); }
  for (let k = 0; k < 9; k++) blk(g, -25.5 + k * 0.62, -13.6 + k * 0.5, 0.7, 0.7, -0.6, 0.5, '#b9b3a6', { shadow: false });
  for (const [x, z, k] of [[26, 9, 1], [24.5, -12, 0.8], [-31, 9, 0.9]]) for (let q = 0; q < 3; q++) blk(g, x + q * 0.9 * k, z + (q % 2) * 0.4, 0.7 * k, 0.25, -0.6, 0.06, '#fff', { shadow: false, mat: GL('#f4fbfe') });
  // the path, in a colour of its own: pale stone slabs with a dark edge
  for (const [x, z] of S.path || []) { const y = gh(x + 0.5, z + 0.5); blk(g, x + 0.5, z + 0.5, 1.06, 1.06, y, 0.06, '#8a7d68', { shadow: false }); blk(g, x + 0.5, z + 0.5, 0.86, 0.86, y, 0.12, PATHC, { shadow: false, mat: GL(PATHC) }); }
  for (const [x, z] of S.draft || []) { const y = gh(x + 0.5, z + 0.5); blk(g, x + 0.5, z + 0.5, 0.86, 0.86, y, 0.1, '#ffdf3d', { shadow: false, mat: GL('#ffdf3d') }); }
  for (const b of S.bridges || []) bridge(g, ...b);
  for (const k of S.places || []) { const [x, z] = PL[k]; place(g, x, z + 0.3, PW, PD - 0.2, gh(x, z)); }
  for (const k of S.parks || []) park(g, k); if (S.shop) shop(g, S.shop);
  const out = {}; for (const h of S.homes || []) { const [x, z] = PL[h.at], y = gh(x, z), c = mapHome(g, h.at, ROOFS[h.roof], { awake: h.awake, open: h.awake || h.out, dark: h.asleep, pathC: h.awake ? PATHC : '#efe2c2', solar: S.solar, glow: S.evening && h.awake });
    if (h.land) { c.scale.set(1.07, 0.9, 1.07); dust(g, x, y, z - 0.3, 2.0, 14); }
    if ((h.awake || h.out) && !S.evening) fig(g, x + (h.side || 0.5), y, z + 1.55, { k: 1.08, shirt: h.shirt || '#3f78b5', arms: ['down', 'up'], skin: SKIN[h.skin || 0], hair: HAIR[h.hair || 0], turn: 0.2 });
    out[h.at] = [x, y + 2.6, z - 0.4]; }
  return out;
}
function bridge(g, x0, z, n, ghost) { const y = 0.25, m = ghost ? soft('#ffdf3d', 0.9) : null, o = m ? { shadow: false, mat: m } : {};
  for (let k = 0; k < n; k++) { const a = Math.sin((k + 0.5) / n * Math.PI) * 0.45; blk(g, x0 + k + 0.5, z + 0.5, 1.02, 1.3, y + a - 0.14, 0.2, '#c9925a', o); for (const s of [-1, 1]) { blk(g, x0 + k + 0.5, z + 0.5 + s * 0.62, 0.12, 0.1, y + a, 0.55, '#7a5a33', o); blk(g, x0 + k + 0.5, z + 0.5 + s * 0.62, 1.02, 0.08, y + a + 0.5, 0.09, '#7a5a33', o); } } }

const HOMES1 = [{ at: 'A1', roof: 'red' }, { at: 'A2', roof: 'blue' }, { at: 'B1', roof: 'red' }, { at: 'B2', roof: 'blue' }];
const HOMES2 = [{ at: 'A1', roof: 'red', shirt: '#3f78b5' }, { at: 'A2', roof: 'blue', shirt: '#e0503a', skin: 1, hair: 3 }, { at: 'A3', roof: 'yellow', shirt: '#8a5fc2', hair: 2 }, { at: 'A4', roof: 'green', shirt: '#ffd257', skin: 2, hair: 3 }, { at: 'C1', roof: 'green', shirt: '#e0503a', hair: 1 },
  { at: 'B1', roof: 'red' }, { at: 'B2', roof: 'blue' }, { at: 'B4', roof: 'green' }];
const EAST = ['A1', 'A2', 'A3', 'A4', 'C1'];
const PATH2 = [...seg(-5, -4, 17, -4), ...seg(9, -3, 9, 8), ...seg(6, 1, 8, 1), ...seg(6, 8, 11, 8)];
const houses = (n, of, cols) => row([...Array(of)].map((_, k) => I.home(cols[k % cols.length])), n);

export const SCENES = [
  // 1. Land: a far wider world seen from high above. The child stamps homes onto high ground: fourteen places, eight homes.
  { id: 'land-map', half: 36, cam: [1.4, 0, -1.6, 79, 1.02, 0],
    room(g) { const o = world(g, { homes: [...HOMES1, { at: 'A4', roof: 'green', land: true, out: true, shirt: '#ffd257' }], places: ['A3', 'A5', 'A6', 'C1', 'C2', 'B3', 'B4', 'B5', 'B6'] });
      const [x, z] = PL.C1; const c = cottage(g, x, 3.1, z - 0.45, { s: 2.15, roof: ROOFS.green, garden: false }); return { ghost: [x + 0.6, 3.6, z + 0.4], a4: o.A4 }; },
    html: (p) => top('Land', 'Stamp your town', houses(5, 8, ['#d2553a', '#3f78b5', '#d2553a', '#3f78b5', '#2e9b5a', '#d2553a'])) + mouse(p.ghost[0] - 2, p.ghost[1] - 6) + florence + hint('Click a yellow place to stamp a home there.')
      + pal('Stamps', tok(I.home('#2e9b5a'), 'Home', 'on', '3 left') + '<h4>Roof colour</h4>' + sws(['#d2553a', '#3f78b5', '#2e9b5a', '#e9ad1c'], 2) + tok(I.tree(), 'Park', '', '2 left') + tok(I.shop(), 'Shop', '', '1 left')) },

  // 2. Getting around: the same map with the child's own homes. The path has its own colour, homes wake up when it
  //    reaches them, and there is one bridge and two places it could go.
  { id: 'paths-map', half: 36, cam: [1.4, 0, -1.6, 79, 1.02, 0],
    room(g) { const o = world(g, { homes: HOMES2.map((h) => ({ ...h, awake: EAST.includes(h.at), asleep: !EAST.includes(h.at) })), parks: ['A5', 'B5'], shop: 'C2', path: PATH2, });
      const br = group(g, 0, 2.2, 0); bridge(br, -8.2, -2.4, 4); place(g, -7.2, -3.5, 4.4, 1.6, 0.3, { h: 0.1 }); place(g, -5.6, 8.5, 4.4, 1.6, 0.3, { h: 0.1 });
      return { br: [-5.6, 3.2, -1.6], z1: o.B1, z2: o.B2, z3: o.B4, s: [-6, 1.2, 8.5], n: [-7, 0.6, -3.5] }; },
    html: (p) => top('Getting around', 'Join up the homes', houses(5, 8, ['#d2553a', '#3f78b5', '#e9ad1c', '#2e9b5a', '#2e9b5a', '#d2553a', '#3f78b5', '#2e9b5a'])) + mouse(p.br[0], p.br[1]) + florence + hint('You have one bridge. Put it on a yellow place.')
      + [p.z1, p.z2, p.z3].map((q) => `<b class="zz" style="left:${q[0] + 20}px;top:${q[1] - 4}px">z z</b>`).join('')
      + pal('Tools', tok(I.path(), 'Path', '', 'Draw it') + tok(I.bridge(), 'Bridge', 'on', '1 left') + tok(I.rub(), 'Rub out')) },

  // 3. The walk: on rails along the child's own path, seen over the shoulder, with a letter for each door.
  { id: 'paths-walk', half: 34, fov: 44, eye: [10.6, 4.3, 2.3], at: [-13, 1.5, -0.9],
    room(g) { return street(g); },
    html: (p) => top('Getting around', 'Deliver the letters', row([...Array(8)].map(() => I.letter()), 3)) + florence + hint('Walk to the yellow letter box.')
      + `<i class="ring" style="left:${p.box[0]}px;top:${p.box[1]}px;width:74px;height:74px"></i>` + plate(p.bridge, 'Your bridge', 'tip', 0, -30)
      + `<div class="keys"><i class="key on">&uarr; <em>Hold to walk</em></i><i class="key">Space <em>Post a letter</em></i></div>` },

  // 4. Homes: inside the prefab home factory, with the home large in the frame and a diagram that lights up.
  { id: 'factory', half: 24, cam: [-1.9, 2.3, 0.8, 31, 0.4, -0.5], off: [0, 0], room: factory.room, html: factory.html },
  // 5. Food: a section through the greenhouse and the tunnel farm, built in blocks and seen from the side.
  { id: 'farm', half: 20, cam: [0.4, -1.05, -1, 27.6, 0.16, 0], room: farm.room, html: farm.html },
  // 6. Power: the control room, bright, with the town outside the window.
  { id: 'control', half: 20, cam: [0, 3.75, -2, 22.6, 0.2, 0], off: [-30, 0], view: true, room: control.room, html: control.html },
  // 7. School: a cutaway of the school with a person waiting for each part.
  { id: 'school', half: 26, cam: [-2.2, 3.5, 1.2, 38, 0.36, 0.36], off: [55, 0], room: school.room, html: school.html },
];

// ---- the street of the walk: the child's own homes and bridge, at the height of a person --------------------------------
function street(g) {
  for (let x = -64; x <= 18; x += 2) for (let z = -34; z <= 22; z += 2) { const riv = x >= -24 && x < -18; if (riv) { blk(g, x + 1, z + 1, 2, 2, -1.2, 0.7, hash(x, z) > 0.5 ? PAL.water : PAL.waterDeep, { shadow: false }); continue; }
    const low = x >= -28 && x < -14; blk(g, x + 1, z + 1, 2, 2, -1.6, 1.6 + (low ? -0.25 : 0), low ? ['#b4e08f', '#a9d985'][Math.floor(hash(x, z) * 2)] : PAL.grass[Math.floor(hash(x, z) * 4)]); }
  // the path the child drew, in its pale stone, running to the bridge and over it
  for (let x = -62; x < 18; x++) { if (x >= -25 && x < -17) continue; const y = x >= -28 && x < -14 ? -0.25 : 0; for (const z of [-0.55, 0.55]) { blk(g, x + 0.5, z, 1.04, 1.14, y, 0.05, '#8a7d68', { shadow: false }); blk(g, x + 0.5, z, 0.9, 1.0, y, 0.09, PATHC); } }
  for (let k = 0; k < 8; k++) { const x = -24.5 + k, a = Math.sin((k + 0.5) / 8 * Math.PI) * 0.7 - 0.2; blk(g, x, 0, 1.03, 2.5, a - 0.2, 0.24, '#c9925a'); for (const s of [-1, 1]) { blk(g, x, s * 1.2, 0.16, 0.14, a, 0.95, '#7a5a33'); blk(g, x, s * 1.2, 1.03, 0.1, a + 0.9, 0.12, '#7a5a33'); } }
  // homes on both sides with the roof colours the child chose; a neighbour comes out when their letter arrives
  const H2 = (x, z, f, roof, o = {}) => { const c = cottage(g, x, 0, z, { s: 4, d: 3.6, tall: 2.3, steps: 6, rise: 0.3, roof, face: f, garden: false, timber: true, wall: PAL.timber, ...o });
    blk(g, x, z + f * 3.2, 5.6, 2.8, 0, 0.04, '#74b56a', { shadow: false }); blk(g, x, z + f * 3.3, 0.9, 3.0, 0.01, 0.06, PATHC, { shadow: false });
    for (let k = -3; k <= 3; k++) if (k) { blk(g, x + k * 0.85, z + f * 4.55, 0.1, 0.1, 0, 0.6, '#fbfbf7'); } for (const s of [-1, 1]) blk(g, x + s * 1.75, z + f * 4.55, 1.9, 0.06, 0.36, 0.08, '#fbfbf7', { shadow: false });
    for (const [a, b, col] of [[-1.6, 2.5, '#f08ab8'], [-2.1, 3.4, '#ffd257'], [1.7, 2.6, '#ffffff'], [2.2, 3.5, '#c98be0'], [1.4, 3.7, '#f08ab8']]) blk(g, x + a, z + f * b, 0.28, 0.28, 0, 0.34, col, { shadow: false, mat: GL(col) }); return c; };
  // a letter box at the edge of the path; done = flag up and a letter showing
  const box = (x, z, done, glow) => { blk(g, x, z, 0.14, 0.14, 0, 0.95, '#7a5a33'); blk(g, x, z, 0.5, 0.62, 0.95, 0.42, '#e0503a', glow ? { mat: GL('#ffdf3d') } : {}); if (done) { blk(g, x + 0.28, z, 0.06, 0.1, 1.1, 0.5, '#fbfbf7'); blk(g, x + 0.28, z + 0.12, 0.06, 0.26, 1.42, 0.18, '#ffd257', { mat: GL('#ffd257') }); blk(g, x, z + (z > 0 ? -0.34 : 0.34), 0.34, 0.05, 1.05, 0.22, '#fff', { mat: GL('#ffffff') }); } };
  H2(-1.2, -8.2, 1, ROOFS.green, { awake: true, open: true }); box(-2.6, -1.75, true); fig(g, -1.1, 0, -2.9, { k: 1.25, shirt: '#ffd257', skin: SKIN[2], hair: HAIR[3], arms: ['up', 'fwd'], turn: 0.75 }); blk(g, -0.62, -2.42, 0.34, 0.04, 1.18, 0.24, '#fff', { mat: GL('#ffffff') });
  H2(-6.5, 7.6, -1, ROOFS.red); box(-5.2, 1.75, false, true);
  H2(-10.5, -8.2, 1, ROOFS.blue); box(-11.8, -1.75, false);
  H2(-14.2, 7.6, -1, ROOFS.yellow); box(-13, 1.75, false);
  // a bench, a lamp and trees along the way, kept low and to the side so that nothing hides the street
  blk(g, -9.4, 1.9, 1.6, 0.5, 0.36, 0.1, '#c9925a'); blk(g, -9.4, 2.14, 1.6, 0.08, 0.46, 0.4, '#c9925a'); for (const s of [-0.65, 0.65]) blk(g, -9.4 + s, 1.9, 0.1, 0.4, 0, 0.36, INK);
  for (const [x, z] of [[-7.4, -1.8], [-15.6, 1.8]]) { blk(g, x, z, 0.14, 0.14, 0, 2.4, '#2b3a55'); blk(g, x, z, 0.44, 0.44, 2.4, 0.36, '#ffd257', { mat: GL('#ffe27a') }); }
  for (const [x, z, k] of [[-5.8, -12.5, 2.3], [4.5, -12, 2.5], [-10.4, 12.5, 2.3], [-17.5, -6, 1.8], [-18.5, 8.5, 1.9], [-15.5, -12, 2.4], [2, 11.5, 2.4]]) tree(g, x, 0, z, k);
  // across the river: the homes of the other neighbourhood, pine woods, and the mountains
  for (const [x, z, c] of [[-33, -7, ROOFS.red], [-39, -7.5, ROOFS.blue], [-36, 7.5, ROOFS.green]]) cottage(g, x, 0, z, { s: 4, d: 3.6, tall: 2.3, steps: 6, rise: 0.3, roof: c, face: z < 0 ? 1 : -1, garden: false, timber: true, wall: PAL.timber });
  for (let k = 0; k < 26; k++) { const x = -30 - hash(k, 1) * 28, z = (hash(k, 2) - 0.5) * 44; if (Math.abs(z) < 3.4 || (x > -43 && Math.abs(Math.abs(z) - 7.4) < 4)) continue; pine(g, x, 0, z, 2 + hash(k, 3)); }
  for (const [z, w, hh] of [[-34, 26, 10], [-12, 30, 15], [14, 28, 11], [36, 22, 8]]) for (let q = 0; q < 5; q++) blk(g, -78, z, 8, w * (1 - q * 0.19), q * hh / 5, hh / 5, q === 4 ? '#fbfbf7' : q === 3 ? '#d5dbe0' : ['#a9c6a0', '#b4c9b6', '#c2cfc9'][q], { shadow: false });
  for (const [x, y, z] of [[-60, 20, -14], [-58, 23, 12]]) { blk(g, x, z, 2, 7, y, 1.2, '#fff', { shadow: false, mat: GL('#ffffff') }); blk(g, x, z + 1, 2, 4, y + 1.2, 0.9, '#fff', { shadow: false, mat: GL('#ffffff') }); }
  // the child's own figure, with a face, a cap and a bag of letters, looking across at the next letter box
  const me = fig(g, 0.6, 0, 0.3, { k: 1.35, shirt: '#e0503a', legs: '#2b3a55', skin: SKIN[0], hair: HAIR[1], cap: '#3f78b5', bag: '#c9925a', turn: 2.5, head: -0.5, arms: ['up', 'down'], step: 0.1 });
  return { box: [-5.2, 1.2, 1.75], bridge: [-21, 1.9, 0] };
}

let ui = null;
export function show(i) {
  const s = SCENES[i], st = film.dbg, cam = st.camera; film.seek(film.segs[1].start + 1);
  let view = null;
  if (s.view) { const n = st.newScene(36); n.light(0.45); n.scene.background.set('#fbd0a2'); control.outside(group(n.scene), world); cam.fov = 30; cam.clearViewOffset(); cam.updateProjectionMatrix(); cam.position.set(...control.eye); cam.lookAt(...control.at); cam.updateMatrixWorld(); st.draw(n.scene);
    const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(st.renderer.domElement, 0, 0, W, H); view = new THREE.CanvasTexture(c); view.colorSpace = THREE.SRGBColorSpace; }
  const n = st.newScene(s.half || 26); n.light(0); const pts = s.room(group(n.scene), view) || {};
  cam.fov = s.fov || 26; const off = s.off || [0, 0]; cam.setViewOffset(W, H, off[0], off[1], W, H); cam.updateProjectionMatrix();
  if (s.eye) { cam.position.set(...s.eye); cam.lookAt(...s.at); } else st.look(...s.cam); cam.updateMatrixWorld(); st.draw(n.scene);
  const p = Object.fromEntries(Object.entries(pts).map(([k, v]) => { const q = st.screen(new THREE.Vector3(...v)); return [k, q]; }));
  if (!ui) { const stage = document.querySelector('.stage'); document.head.insertAdjacentHTML('beforeend', `<style>${css} .stage > .ui:not(.cx), .stage > canvas.fx { visibility: hidden; }</style>`); ui = document.createElement('div'); ui.className = 'ui cx'; ui.style.setProperty('--ui-florence-sprite', `url(${new URL('../animation/florence-sprite.webp', import.meta.url)})`); stage.append(ui); }
  ui.innerHTML = s.html(p); return s.id;
}
