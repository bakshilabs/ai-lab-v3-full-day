// Second version of the play-break concept screens for Eco Town (22 Nov 2026), redrawn to answer the independent
// critique in critique-2026-11-22.md. Each scene is a small world of its own, built from the same plain blocks as the
// town, with a sketch of the interface on top. These are proposals only. The few words on them are placeholders.
// The wide land in scenes 1 to 3 and in the control room window is NOT the real world map: it shows how large Eco Town
// would need to be, and the real map (animation/map.js and the game's world map) would have to grow to match.
import { band, THREE, PAL, blk, group, hash, W, H, GL, soft, INK, SKIN, HAIR, ROOFS, place, frame, fig, wheelchair, walkingFrame, cottage, shade, tree, pine, dust, tomato, lettuce, strawberry, css, I, florence, top, row, tok, pal, sws, mouse, hint, plate } from './kit-v2.js';
import { factory, farm, control, school } from './rooms-v2.js';
import { walk } from './walk-v2.js';

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
  for (const k of S.parks || []) park(g, k); if (S.shop) shop(g, S.shop); if (S.school) schoolMap(g, S.school, S);
  const out = {}; for (const h of S.homes || []) { const [x, z] = PL[h.at], y = gh(x, z), c = mapHome(g, h.at, ROOFS[h.roof], { awake: h.awake, open: h.awake || h.out, dark: h.asleep, pathC: h.awake ? PATHC : '#efe2c2', solar: S.solar, glow: S.evening && h.awake });
    if (h.land) { c.scale.set(1.07, 0.9, 1.07); dust(g, x, y, z - 0.3, 2.0, 14); }
    const pk = S.pk || 1.25, lit = h.awake || h.out;
    if (h.who !== false && (lit || S.evening)) { fig(g, x + 0.6, y, z + 1.65, { k: pk, shirt: h.shirt || '#3f78b5', arms: lit ? ['down', 'up'] : ['down', 'down'], skin: SKIN[h.skin || 0], hair: HAIR[h.hair || 0], turn: 0.2, long: h.hair === 2 });
      if (h.kid) fig(g, x - 0.45, y, z + 1.85, { k: pk * 0.74, shirt: h.kid, pack: '#ffd257', arms: ['up', 'down'], skin: SKIN[h.skin || 0], hair: HAIR[(h.hair || 0) + 1], turn: -0.2 });
      if (h.dad) fig(g, x - 1.3, y, z + 1.7, { k: pk, shirt: h.dad, arms: ['up', 'down'], skin: SKIN[h.skin || 0], hair: HAIR[3], turn: 0.1 }); }
    out[h.at] = [x, y + 2.6, z - 0.4]; }
  return out;
}
// the school on the map: the one yellow building, with a bell, a flag, and a teacher at the gate
function schoolMap(g, key, S) { const [x, z] = PL[key], y = gh(x, z), p = group(g, x, y, z - 0.5); blk(p, 0, 0, 2.9, 2.0, 0, 1.4, '#ffd76a'); for (let i = 0; i < 4; i++) blk(p, 0, 0, 3.2, 2.3 * (1 - i / 4 * 0.85), 1.4 + i * 0.24, 0.24, i % 2 ? shade(ROOFS.red, -0.05) : ROOFS.red);
  blk(p, -0.8, 0, 0.7, 0.7, 2.1, 0.8, '#ffd76a'); blk(p, -0.8, 0.36, 0.3, 0.04, 2.4, 0.3, '#ffb400', { shadow: false, mat: GL('#ffb400') }); blk(p, -0.8, 0, 0.9, 0.9, 2.9, 0.16, ROOFS.red); blk(p, 0, 1.02, 0.5, 0.05, 0, 0.85, '#7a5a33', { shadow: false }); for (const a of [-0.95, 0.95]) blk(p, a, 1.02, 0.5, 0.05, 0.6, 0.5, '#9fd0f5', { shadow: false, mat: GL(S.evening ? '#fff0a0' : '#bfe3f5') });
  blk(p, 1.3, 1.5, 0.08, 0.08, 0, 2.6, '#fbfbf7'); blk(p, 1.62, 1.5, 0.6, 0.05, 2.1, 0.42, '#e0503a', { shadow: false }); blk(p, 0, 1.9, 3.1, 1.7, 0.005, 0.05, '#efe2c2', { shadow: false });
  if (!S.evening) { fig(g, x - 0.9, y, z + 1.3, { k: S.pk || 1.25, shirt: '#16a3a3', skin: SKIN[1], hair: HAIR[3], long: true, arms: ['down', 'up'], turn: -0.3 }); } }
function bridge(g, x0, z, n, ghost) { const y = 0.25, m = ghost ? soft('#ffdf3d', 0.9) : null, o = m ? { shadow: false, mat: m } : {};
  for (let k = 0; k < n; k++) { const a = Math.sin((k + 0.5) / n * Math.PI) * 0.45; blk(g, x0 + k + 0.5, z + 0.5, 1.02, 1.3, y + a - 0.14, 0.2, '#c9925a', o); for (const s of [-1, 1]) { blk(g, x0 + k + 0.5, z + 0.5 + s * 0.62, 0.12, 0.1, y + a, 0.55, '#7a5a33', o); blk(g, x0 + k + 0.5, z + 0.5 + s * 0.62, 1.02, 0.08, y + a + 0.5, 0.09, '#7a5a33', o); } } }

// what the child has made by the end of the first two levels, used by screens 1, 2, 3 and 6
const HOMES1 = [{ at: 'A1', roof: 'red', shirt: '#3f78b5', kid: '#e0503a', out: true }, { at: 'A2', roof: 'blue', shirt: '#e0503a', skin: 1, hair: 3, out: true }, { at: 'B1', roof: 'red', shirt: '#8a5fc2', hair: 2, out: true, kid: '#3f78b5' }, { at: 'B2', roof: 'blue', shirt: '#2e9b5a', skin: 2, hair: 3, out: true }];
const HOMES2 = [{ at: 'A1', roof: 'red', shirt: '#3f78b5', kid: '#e0503a' }, { at: 'A2', roof: 'blue', shirt: '#e0503a', skin: 1, hair: 3, kid: '#16a3a3' }, { at: 'A3', roof: 'yellow', shirt: '#8a5fc2', hair: 2 }, { at: 'A4', roof: 'green', shirt: '#ffd257', skin: 2, hair: 3, kid: '#8a5fc2' }, { at: 'C1', roof: 'green', shirt: '#e0503a', hair: 1, kid: '#3f78b5' },
  { at: 'B1', roof: 'red' }, { at: 'B2', roof: 'blue', shirt: '#8a5fc2', hair: 4, kid: '#e0503a', dad: '#2e9b5a' }, { at: 'B4', roof: 'green' }];
const EAST = ['A1', 'A2', 'A3', 'A4', 'C1'];
// the paths: east of the river (drawn before the bridge is placed), and the rest (drawn after)
const EASTP = [...seg(-2, 1, 15, 1), ...seg(9, -4, 9, 0), ...seg(9, 2, 9, 8), ...seg(5, -4, 17, -4), ...seg(14, -3, 14, 0), ...seg(6, 8, 11, 8)];
const WESTP = [...seg(-9, 1, -6, 1), ...seg(-9, -1, -9, 0), ...seg(-19, -1, -10, -1)];
const BRIDGE = [-5, 1, 3], FULLP = [...EASTP, ...WESTP];
const MAPCAM = { half: 36, fov: 26, cam: [1.2, 0, -2.6, 51, 0.68, 0] };
const houses = (n, of, cols) => row([...Array(of)].map((_, k) => I.home(cols[k % cols.length])), n);
// a family with their cases, waiting for a home: two grown-ups and a child
function family(g, x, z, c, o = {}) { const y = gh(x, z), k = 1.25;
  fig(g, x - 0.75, y, z, { k, shirt: c[0], skin: SKIN[o.skin || 0], hair: HAIR[o.hair || 0], long: true, arms: o.wave ? ['up', 'down'] : ['down', 'down'], turn: o.turn || 0 });
  fig(g, x + 0.75, y, z, { k, shirt: c[1], skin: SKIN[o.skin || 0], hair: HAIR[3], arms: ['down', o.point ? 'up' : 'down'], turn: o.turn || 0 });
  fig(g, x, y, z + 0.45, { k: k * 0.72, shirt: c[2], skin: SKIN[o.skin || 0], hair: HAIR[(o.hair || 0) + 1], arms: o.kid || ['up', 'down'], turn: o.turn || 0 });
  blk(g, x + 1.6, z + 0.2, 0.7, 0.5, y, 0.6, '#b5553a'); blk(g, x + 1.6, z + 0.2, 0.74, 0.1, y + 0.6, 0.12, '#7a5a33'); blk(g, x - 1.55, z + 0.3, 0.55, 0.55, y, 0.5, '#c9925a'); blk(g, x - 1.55, z + 0.3, 0.45, 0.45, y + 0.5, 0.4, '#e2b983'); }

walk.data = { path: FULLP, east: EASTP, bridge: BRIDGE, rivX, PL, homes: HOMES2, parks: ['A5', 'B5'], shop: 'C2', school: 'A6', home: 'B2', you: [8.4, 1.5], route: [[-13.9, -0.5], [-8.5, -0.5], [-8.5, 1.5], [8.4, 1.5]] };

export const SCENES = [
  // 1. Land: a far wider world, seen from the air but low enough to see the people. Three families wait with their
  //    cases, and the child drags homes onto high ground: thirteen places, eight homes, two parks and a shop.
  { id: 'land-map', band: 226, split: [{ ...MAPCAM, room(g) {
      const o = world(g, { homes: [...HOMES1, { at: 'A4', roof: 'green', land: true, out: true, shirt: '#ffd257', skin: 2, hair: 3, kid: '#8a5fc2' }], places: ['A3', 'A5', 'C1', 'C2', 'B3', 'B4', 'B5', 'B6'], clear: [[-3.5, 9, 9.5, 14]] });
      family(g, -0.6, 11.4, ['#e0503a', '#3f78b5', '#ffd257'], { wave: true, turn: 0.15 }); family(g, 3.3, 11.9, ['#2e9b5a', '#8a5fc2', '#e0503a'], { skin: 2, hair: 3, point: true, turn: -0.1 }); family(g, 7.2, 11.3, ['#16a3a3', '#ffd257', '#3f78b5'], { skin: 1, hair: 1, wave: true, turn: -0.2 });
      { const [x, z] = PL.A4, y = gh(x, z); blk(g, x + 1.4, z + 2.2, 0.5, 0.5, y, 0.45, '#c9925a'); blk(g, x + 1.4, z + 2.2, 0.4, 0.4, y + 0.45, 0.35, '#e2b983'); }
      const [x, z] = PL.C1; cottage(g, x - 0.2, 3.3, z + 0.4, { s: 2.15, roof: ROOFS.green, garden: false }); return { ghost: [x + 0.5, 3.9, z + 1.3], wait: [3.3, gh(3.3, 11.9) + 2.9, 11.9] }; } }],
    html: (p) => top('Land', 'Give everyone a home', houses(5, 8, ['#d2553a', '#3f78b5', '#d2553a', '#3f78b5', '#2e9b5a', '#d2553a'])) + mouse(p.ghost[0] - 2, p.ghost[1] - 4) + plate(p.wait, 'Three families are waiting', 'tip', 0, -4)
      + band('Three families need a home. Drag a home to a yellow place.', `<div class="grp">${tok(I.home('#2e9b5a'), 'Home', 'on', '3 left')}<h4>Roof colour</h4>${sws(['#d2553a', '#3f78b5', '#2e9b5a', '#e9ad1c'], 2)}</div>` + tok(I.tree(), 'Park', '', '2 left') + tok(I.shop(), 'Shop', '', '1 left')) },

  // 2. Getting around: the same map with the child's own homes and the school. The path has its own colour and homes
  //    wake up when it reaches them. The child's own home is across the river: one bridge, two places it could go.
  { id: 'paths-map', band: 226, split: [{ ...MAPCAM, room(g) {
      const o = world(g, { homes: HOMES2.map((h) => ({ ...h, awake: EAST.includes(h.at), asleep: !EAST.includes(h.at) && h.at !== 'B2', out: h.at === 'B2', who: EAST.includes(h.at) || h.at === 'B2' })), parks: ['A5', 'B5'], shop: 'C2', school: 'A6', path: EASTP });
      const br = group(g, 0, 1.9, 0); bridge(br, -5.6, 2.6, 3); place(g, -3.5, 1.5, 3.8, 1.6, 0.3, { h: 0.1 }); place(g, -5.5, 8.5, 3.8, 1.6, 0.3, { h: 0.1 });
      return { br: [-3.6, 2.9, 3.4], z1: o.B1, z3: o.B4, home: o.B2, school: [PL.A6[0], 5.6, PL.A6[1] - 0.5] }; } }],
    html: (p) => top('Getting around', 'Join up the town', houses(5, 8, ['#d2553a', '#3f78b5', '#e9ad1c', '#2e9b5a', '#2e9b5a', '#d2553a', '#3f78b5', '#2e9b5a'])) + mouse(p.br[0], p.br[1])
      + [p.z1, p.z3].map((q) => `<b class="zz" style="left:${q[0] + 22}px;top:${q[1] + 4}px">z z</b>`).join('') + plate(p.home, 'Your home', 'on tip', 0, -6) + plate(p.school, 'School', 'tip', 34, 6)
      + band('Your home is across the river. Drag the bridge to a yellow place.', tok(I.path(), 'Path', '', 'Draw it') + tok(I.bridge(), 'Bridge', 'on', '1 left') + tok(I.rub(), 'Rub out')) },

  // 3. The walk to school: a split screen. Eco Town on the left, car town on the right, and a map to follow (walk-v2.js).
  walk,

  // 4. Homes: inside the prefab home factory, down on the floor among the workers, with the family the home is for.
  { id: 'factory', band: 226, split: [{ half: 24, fov: 30, eye: [-11.5, 4.4, 15], at: [0.9, 2.1, -0.6], room: factory.room }], html: factory.html },
  // 5. Food: a section through the indoor farm: a greenhouse above the street and a tunnel farm below it, seen from the side.
  { id: 'farm', band: 226, split: [{ half: 20, fov: 26, cam: [0.3, -0.9, -1, 25, 0.13, 0], room: farm.room }], html: farm.html },
  // 6. Power: the control room, bright, with the town outside the window and an engineer beside the desk.
  { id: 'control', band: 226, view: true, split: [{ half: 20, fov: 26, cam: [0, 5.15, -2, 20.6, 0.16, 0], room: control.room }], html: control.html },
  // 7. School: the school cut open, seen from the height of the children, with a person waiting for each part.
  { id: 'school', band: 226, split: [{ half: 26, fov: 26, cam: [-3.2, 4.3, 0, 23.5, 0.13, 0.24], room: school.room }], html: school.html },
];

let ui = null;
function setUi(html) {
  if (!ui) { const stage = document.querySelector('.stage'); document.head.insertAdjacentHTML('beforeend', `<style>${css} .stage > .ui:not(.cx), .stage > canvas.fx { visibility: hidden; }</style>`); ui = document.createElement('div'); ui.className = 'ui cx'; ui.style.setProperty('--ui-florence-sprite', `url(${new URL('../animation/florence-sprite.webp', import.meta.url)})`); stage.append(ui); }
  ui.innerHTML = html;
}
// Every screen is one or two worlds drawn above a paper band. Each world has its own scene and camera.
export function show(i) {
  const s = SCENES[i], st = film.dbg, cam = st.camera, r = st.renderer; film.seek(film.segs[1].start + 1);
  const sz = r.getSize(new THREE.Vector2()), nv = s.split.length, vw = sz.x / nv, bandH = s.band || 0, vh = sz.y * (1 - bandH / H), p = {}; cam.clearViewOffset(); r.setScissorTest(false); r.setViewport(0, 0, sz.x, sz.y);
  let view = null;
  if (s.view) { const n = st.newScene(36); n.light(0.45); n.scene.background.set('#fbd0a2'); control.outside(group(n.scene), world, { path: FULLP, bridges: [BRIDGE], school: 'A6' }); cam.fov = 30; cam.aspect = W / H; cam.updateProjectionMatrix(); cam.position.set(...control.eye); cam.lookAt(...control.at); cam.updateMatrixWorld(); st.draw(n.scene);
    const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(r.domElement, 0, 0, W, H); view = new THREE.CanvasTexture(c); view.colorSpace = THREE.SRGBColorSpace; }
  r.setClearColor('#fffaf0'); r.clear(); r.setScissorTest(true);
  s.split.forEach((h, k) => { const n = st.newScene(h.half || 30); n.light(h.night || 0); if (h.bg) n.scene.background.set(h.bg); const pts = h.room(group(n.scene), view) || {};
    cam.fov = h.fov || 26; cam.aspect = vw / vh; cam.updateProjectionMatrix(); if (h.eye) { cam.position.set(...h.eye); cam.lookAt(...h.at); } else st.look(...h.cam); cam.updateMatrixWorld();
    r.setViewport(k * vw, sz.y - vh, vw, vh); r.setScissor(k * vw, sz.y - vh, vw, vh); r.render(n.scene, cam);
    for (const q in pts) { const v = new THREE.Vector3(...pts[q]).project(cam); p[q] = [k * W / nv + (v.x + 1) / 2 * (W / nv), (1 - v.y) / 2 * (H - bandH)]; } });
  r.setScissorTest(false); r.setViewport(0, 0, sz.x, sz.y); cam.aspect = W / H; cam.fov = 26; cam.updateProjectionMatrix(); setUi(s.html(p)); return s.id;
}
