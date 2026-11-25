// The four indoor play breaks of the second version: the home factory, the indoor farm, the control room and the school.
// Each one is a room of its own, made of plain blocks. room(g) builds it and returns points to label; html(p) is the
// sketch of the interface. The words are placeholders.
import { THREE, PAL, blk, group, hash, W, H, GL, soft, INK, SKIN, HAIR, ROOFS, place, frame, fig, wheelchair, walkingFrame, cottage, shade, tree, pine, dust, tomato, lettuce, strawberry, I, band, florence, top, row, tok, pal, sws, mouse, hint, plate } from './kit-v2.js';

// ---- 4. the prefab home factory -----------------------------------------------------------------------------------------
const DOORS = ['#d2553a', '#3f78b5', '#2e9b5a', '#e9ad1c'];
function windowPart(g, x, y, z, alongX = true, s = 1) { const p = group(g, x, y, z); if (!alongX) p.rotation.y = Math.PI / 2; p.scale.setScalar(s);
  blk(p, 0, 0, 1.4, 0.16, 0, 1.2, '#fbfbf7'); blk(p, 0, 0.03, 1.16, 0.14, 0.12, 0.96, '#9fd0f5', { shadow: false, mat: GL('#aee0ff') }); blk(p, 0, 0.06, 0.08, 0.14, 0.12, 0.96, '#fbfbf7', { shadow: false }); blk(p, 0, 0.06, 1.16, 0.14, 0.56, 0.08, '#fbfbf7', { shadow: false }); return p; }
function wallPanel(g, x, z, len, alongX, y, h = 3) { const p = group(g, x, y, z); if (!alongX) p.rotation.y = Math.PI / 2;
  blk(p, 0, 0, len, 0.44, 0, h, PAL.timber); for (const yy of [0.25, 0.5, 0.75]) blk(p, 0, 0, len + 0.02, 0.48, h * yy, 0.06, '#a9743f', { shadow: false }); blk(p, 0, 0, len - 0.1, 0.2, h, 0.05, '#ffe27a', { shadow: false, mat: GL('#ffe27a') }); return p; }
export const factory = {
  room(g) {
    blk(g, 0, 0, 36, 22, -0.4, 0.4, '#e9e1cf'); blk(g, -34, 0, 34, 70, -0.42, 0.4, '#8fcf73', { shadow: false }); blk(g, -26, -4.5, 18, 6, -0.4, 0.42, '#b9b3a6', { shadow: false });
    for (const [x, z, w, d] of [[0, 6.6, 12, 0.2], [0, -5.4, 12, 0.2], [-6, 0.6, 0.2, 12.2], [6, 0.6, 0.2, 12.2]]) blk(g, x, z, w, d, 0, 0.02, '#ffd257', { shadow: false });
    // the walls: a back wall with high windows, a right wall, and a left wall with a wide door for the lorry. No front wall and no roof.
    blk(g, 0, -11, 36, 0.5, 0, 8.4, '#f6eedb'); for (let k = 0; k < 7; k++) blk(g, -14.4 + k * 4.8, -10.72, 3.2, 0.1, 5.2, 2.4, '#cfeaf8', { shadow: false, mat: GL('#d7effb') });
    blk(g, 18, 0, 0.5, 22, 0, 8.4, '#efe5cf'); blk(g, -18, -10, 0.5, 2, 0, 8.4, '#efe5cf'); blk(g, -18, 5.5, 0.5, 11, 0, 8.4, '#efe5cf'); blk(g, -18, -4.5, 0.5, 9, 6, 2.4, '#efe5cf');
    // racks along the back wall: doors in four colours, windows, wall panels, roofs in four colours, floors
    blk(g, 0.9, -9.9, 5.4, 1.2, 0, 0.2, '#4a556e'); DOORS.forEach((c, k) => { blk(g, -0.9 + k * 1.2, -9.9, 0.9, 0.16, 0.2, 2.1, c); blk(g, -0.6 + k * 1.2, -9.8, 0.1, 0.06, 1.1, 0.1, '#ffd257', { shadow: false, mat: GL('#ffd257') }); });
    for (let k = 0; k < 4; k++) windowPart(g, 6.9 + k * 0.5, 0.2, 5.6, false); blk(g, 7.6, 5.6, 2.6, 1.8, 0, 0.2, '#4a556e');
    for (let k = 0; k < 6; k++) wallPanel(g, -5.2, -10.3 + k * 0.4, 4.4, true, 0.2, 3); blk(g, -5.2, -9.4, 5, 2.6, 0, 0.2, '#4a556e');
    Object.values(ROOFS).forEach((c, k) => { for (let q = 0; q < 3; q++) { blk(g, 5.6 + k * 3.2, -9.2, 2.8, 2.8, q * 0.75, 0.25, c); blk(g, 5.6 + k * 3.2, -9.2, 2.8, 1.9, q * 0.75 + 0.25, 0.25, shade(c, 0.05)); blk(g, 5.6 + k * 3.2, -9.2, 2.8, 0.9, q * 0.75 + 0.5, 0.22, c); } });
    // the home in the middle of the floor: the floor and four thick walls are up, and the windows come next
    const HX = 0, HZ = 0.6, R = 2.9, Y = 0.44;
    blk(g, HX, HZ, 8.4, 8.4, 0, 0.14, '#9a917f'); blk(g, HX, HZ, 6.3, 6.3, 0.14, 0.3, PAL.concrete); blk(g, HX, HZ, 5.6, 5.6, 0.44, 0.06, '#e2b983', { shadow: false }); for (let k = -2; k <= 2; k++) blk(g, HX + k * 1.1, HZ, 0.05, 5.6, 0.44, 0.08, '#c9925a', { shadow: false });
    wallPanel(g, HX, HZ - R, 6.24, true, Y); wallPanel(g, HX + R, HZ, 5.4, false, Y); wallPanel(g, HX - R, HZ, 5.4, false, Y);
    wallPanel(g, HX - 1.92, HZ + R, 2.4, true, Y); wallPanel(g, HX + 1.92, HZ + R, 2.4, true, Y); wallPanel(g, HX, HZ + R, 1.45, true, Y + 2.3, 0.7);
    // four yellow places for two windows: two beside the door and two on the side wall
    frame(g, HX - 1.92, Y + 1.05, HZ + R + 0.26, 1.5, 1.3); frame(g, HX + 1.92, Y + 1.05, HZ + R + 0.26, 1.5, 1.3); frame(g, HX - R - 0.26, Y + 1.05, HZ + 1.3, 1.5, 1.3, false); frame(g, HX - R - 0.26, Y + 1.05, HZ - 1.3, 1.5, 1.3, false);
    // the window that the mouse is carrying
    windowPart(g, HX - 2.1, 2.2, HZ + R + 2.6, true, 1.15);
    // the crane: one column at the back with an arm, holding the roof in the colour the child chose for the town
    blk(g, 13.4, -5.4, 0.8, 0.8, 0, 7.4, '#ffd257'); blk(g, 11, -5.4, 5.6, 0.6, 6.8, 0.6, '#ffd257'); blk(g, 8.8, -5.4, 0.1, 0.1, 5.4, 1.4, INK, { shadow: false });
    { const r = group(g, 8.8, 4.0, -5.4); r.scale.setScalar(0.8); for (let i = 0; i < 5; i++) blk(r, 0, 0, 6.8, 6.8 * (1 - i / 5 * 0.86), i * 0.32, 0.32, i % 2 ? shade(ROOFS.green, -0.05) : ROOFS.green); }
    // the saw bench and the roller belt on the right
    blk(g, 12.6, 4.6, 7.6, 1.8, 0, 0.7, '#4a556e'); for (let k = 0; k < 13; k++) blk(g, 9.2 + k * 0.57, 4.6, 0.3, 1.6, 0.7, 0.16, '#c9d2da', { shadow: false }); blk(g, 11, 4.6, 2.4, 1.5, 0.86, 0.2, PAL.timber); blk(g, 14.4, 4.6, 2.4, 1.5, 0.86, 0.2, PAL.timber);
    for (let k = 0; k < 5; k++) blk(g, 13.4, -2.6 + k * 0.6, 3.4, 0.5, (k % 2) * 0.5, 0.5, k % 2 ? '#a9743f' : PAL.timber); blk(g, 12.8, 0.9, 3, 1.8, 0, 1, '#4a556e'); blk(g, 12.8, 0.9, 0.1, 1.3, 1, 0.8, '#c9d2da');
    // the lorry waits at the wide door on the left, with an empty bed and its driver
    { const l = group(g, -9.4, 0, -4.4); blk(l, 1, 0, 7.4, 3, 0.7, 0.3, '#2b3a55'); blk(l, -4.6, 0, 2.4, 2.9, 0.5, 2.5, '#e0503a'); blk(l, -5.1, 0, 1.3, 2.6, 1.7, 1.0, '#9fd0f5', { mat: GL('#bfe3f5') }); blk(l, -5.85, 0, 0.1, 2.9, 0.5, 0.5, '#fbfbf7');
      for (const [a, b] of [[-4.4, -1.4], [-4.4, 1.4], [-0.6, -1.4], [-0.6, 1.4], [3.4, -1.4], [3.4, 1.4]]) blk(l, a, b, 0.95, 0.34, 0, 0.95, INK); for (const b of [-1.3, 1.3]) blk(l, 1, b, 7.4, 0.1, 1.0, 0.18, '#ffd257'); }
    fig(g, -7.4, 0, -1.7, { k: 1.22, shirt: '#3f78b5', hair: HAIR[2], cap: '#e0503a', arms: ['up', 'down'], turn: -0.2 });
    // the people who work here
    fig(g, -4.9, 0, 5.0, { k: 1.25, shirt: '#ffd257', legs: '#3f78b5', skin: SKIN[1], hair: HAIR[3], hat: '#ffd257', arms: ['up', 'down'], turn: -0.2 });
    // the family this home is for, watching from the visitors' line: the child points at the place they would like
    fig(g, 6.3, 0, 4.6, { k: 1.3, shirt: '#8a5fc2', skin: SKIN[3], hair: HAIR[4], long: true, arms: ['down', 'down'], turn: -1.1 }); fig(g, 7.4, 0, 3.4, { k: 1.35, shirt: '#2e9b5a', legs: '#4a556e', skin: SKIN[0], hair: HAIR[0], arms: ['down', 'up'], turn: -1.2 });
    fig(g, 5.5, 0, 3.6, { k: 0.95, shirt: '#e0503a', skin: SKIN[0], hair: HAIR[1], cap: '#3f78b5', arms: ['up', 'down'], turn: -1.2 }); for (let k = 0; k < 8; k++) blk(g, 4.4, 1.2 + k * 0.7, 0.14, 0.4, 0, 0.03, '#e0503a', { shadow: false });
    fig(g, 10.6, 0, 1.6, { k: 1.22, shirt: '#e0503a', skin: SKIN[3], hair: HAIR[4], hat: '#ffd257', arms: ['fwd', 'fwd'], turn: 1.4 });
    fig(g, 3.4, 0, -7.4, { k: 1.22, shirt: '#2e9b5a', skin: SKIN[2], hair: HAIR[0], hat: '#ffd257', turn: -0.3 });
    return { win: [HX - 1.6, 2.5, HZ + R + 2.7], lorry: [-8.2, 2.3, -4.4], fam: [6.4, 2.9, 4] };
  },
  html(p) {
    const on = '#ffd257', done = '#c9925a', later = '#efe6d2', D = 'stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"', L = 'stroke="#8a93a8" stroke-width="2.5" stroke-dasharray="6 5" stroke-linejoin="round"';
    const dia = `<div class="diagram"><svg viewBox="0 0 220 168"><path d="M40 60L110 14l70 46z" fill="${later}" ${L}/><rect x="50" y="78" width="120" height="62" fill="${done}" ${D}/><rect x="97" y="96" width="26" height="44" fill="#fffaf0" ${D}/>
      <rect x="60" y="92" width="26" height="24" fill="${on}" stroke="#1f2a44" stroke-width="4"/><rect x="134" y="92" width="26" height="24" fill="${on}" stroke="#1f2a44" stroke-width="4"/><rect x="186" y="96" width="22" height="42" fill="${later}" ${L}/>
      <rect x="40" y="146" width="140" height="12" fill="#bdbcb6" ${D}/><path d="M22 150l6 6 11-13" fill="none" stroke="#1c7a45" stroke-width="5"/><path d="M22 106l6 6 11-13" fill="none" stroke="#1c7a45" stroke-width="5"/></svg></div>`;
    return top('Homes', 'Build a home') + mouse(p.win[0] - 4, p.win[1] - 6) + plate(p.lorry, 'To your town', 'tip', 0, -8) + plate(p.fam, 'Your family', 'on tip', 0, -8)
      + band('You have two windows. Drag each one to a yellow place.', dia + `<div class="grp">${tok(I.win(), 'Window', 'on', '2 left')}${tok(I.roof('#2e9b5a'), 'Roof', '', '1 left')}${tok(I.door('#3f78b5'), 'Door', '', '1 left')}</div><div class="grp"><h4>Door colour</h4>${sws(DOORS.slice(0, 2), 1)}${sws(DOORS.slice(2), 9)}</div>`);
  },
};

// ---- 5. the indoor farm: a section through the greenhouse and the tunnel under the street ------------------------------
const NO = { shadow: false };
function channel(g, x0, x1, y, z, legs = true) { const cx = (x0 + x1) / 2, len = x1 - x0; blk(g, cx, z, len, 0.6, y - 0.3, 0.3, '#fbfbf7'); blk(g, cx, z + 0.31, len - 0.1, 0.03, y - 0.26, 0.2, PAL.water, { shadow: false, mat: GL('#49b4ea') });
  if (legs) for (let x = x0 + 0.3; x <= x1; x += 2.2) for (const dz of [-0.2, 0.2]) blk(g, x, z + dz, 0.1, 0.1, y > 0 ? 0 : -6, y - 0.3 - (y > 0 ? 0 : -6), '#9aa3b2'); }
const roots = (g, x, y, z) => { for (const [a, l] of [[-0.09, 0.15], [0, 0.19], [0.09, 0.12]]) blk(g, x + a, z + 0.33, 0.035, 0.02, y - 0.07 - l, l, '#fff', { shadow: false, mat: GL('#ffffff') }); };
const collar = (g, x, y, z) => { blk(g, x, z, 0.56, 0.5, y, 0.07, INK, { shadow: false, mat: GL('#2b3a55') }); blk(g, x, z, 0.14, 0.14, y, 0.2, '#cdf29a', { shadow: false, mat: GL('#cdf29a') }); };
export const farm = {
  room(g) {
    // the city behind, seen through the glass
    for (let k = 0; k < 9; k++) { const x = -15 + k * 3.6, hh = 4 + hash(k, 3) * 5; blk(g, x, -13, 3, 2, 0, hh, ['#f6e1bd', '#fbecd0', '#e9dcc6'][k % 3], NO); for (let q = 0; q < 3; q++) for (let r = 0; r * 1.5 < hh - 1.6; r++) blk(g, x - 0.9 + q * 0.9, -11.98, 0.5, 0.04, 1 + r * 1.5, 0.8, '#9fd0f5', NO); }
    // the ground between the two farms: paving on top, soil below, with stones in it
    blk(g, 0, -4.5, 34, 9, -1, 1, '#a27443', NO); blk(g, 0, -4.5, 34, 9, -0.02, 0.04, '#d9d2c2', NO); blk(g, 0, 0.02, 34, 0.04, -0.2, 0.2, '#e9e2d0', NO);
    for (const [x, w] of [[-9.5, 0.9], [-5.2, 0.5], [-0.6, 0.8], [2.4, 0.4], [9.3, 0.9], [11.2, 0.5]]) blk(g, x, 0.03, w, 0.04, -0.75 + hash(x, 1) * 0.25, 0.22, '#b98a55', NO);
    blk(g, 0, -4.5, 34, 9, -9.4, 3, '#8a6238', NO); for (const [x, w, y] of [[-6, 1.2, -7.2], [1.5, 0.8, -7.6], [6.6, 1.4, -7.1], [10.8, 0.7, -7.5], [-10.4, 0.9, -7.4]]) blk(g, x, 0.03, w, 0.04, y, 0.35, '#a27443', NO);
    // ---- the greenhouse: glass at the back and on top, white frames
    const GX0 = -13, GX1 = 8.9, TOPY = 5.3;
    blk(g, (GX0 + GX1) / 2, -4.4, GX1 - GX0, 0.06, 0, TOPY, '#cfeaf8', { shadow: false, mat: soft('#d9f1fb', 0.55) }); blk(g, (GX0 + GX1) / 2, -2.2, GX1 - GX0, 4.4, TOPY, 0.06, '#cfeaf8', { shadow: false, mat: soft('#d9f1fb', 0.4) });
    for (let x = GX0 + 0.2; x <= GX1; x += 2.9) blk(g, x, -4.35, 0.14, 0.12, 0, TOPY, '#fbfbf7', NO); for (const y of [2.6, TOPY]) blk(g, (GX0 + GX1) / 2, -4.35, GX1 - GX0, 0.12, y - 0.07, 0.14, '#fbfbf7', NO);
    blk(g, GX1, -2.2, 0.16, 4.4, 0, TOPY, '#cfeaf8', { shadow: false, mat: soft('#d9f1fb', 0.45) }); for (const z of [-4.3, -0.1]) blk(g, GX1, z, 0.2, 0.2, 0, TOPY + 0.1, '#fbfbf7', NO); blk(g, (GX0 + GX1) / 2, -0.1, GX1 - GX0, 0.16, TOPY, 0.16, '#fbfbf7', NO);
    // the way in on the left, with a stack of crates
    blk(g, -10.4, -3.2, 1.6, 1.2, 0, 0.8, '#c9925a'); blk(g, -10.4, -3.2, 1.4, 1.0, 0.8, 0.7, '#b9824a'); blk(g, -9.2, -2.2, 1.2, 1.0, 0, 0.7, '#c9925a');
    // lettuces in a water channel at the height of a hand; the first four have been picked
    const LX = [...Array(11)].map((_, k) => -8 + k * 1.15); channel(g, -8.6, 4.1, 1.15, -1.5);
    LX.forEach((x, k) => { if (k < 4) collar(g, x, 1.15, -1.5); else { lettuce(g, x, 1.15, -1.5, 1.35); roots(g, x, 1.15, -1.5); } });
    // tomato vines on strings, growing out of a second channel on the floor: the fruit hangs high, so it is worth a jump
    channel(g, -9.2, 4.1, 0.42, -3.1, false); const TX = [-8.2, -5.9, -3.6, -1.3, 1.0, 3.3];
    TX.forEach((x, k) => { blk(g, x, -3.1, 0.03, 0.03, 0.4, TOPY - 0.4, '#e9e2d0', NO); blk(g, x, -3.1, 0.2, 0.2, 0.4, 3.5, '#3f9a4f'); for (const [a, y, w] of [[-0.35, 1.2, 0.6], [0.35, 1.9, 0.6], [-0.3, 2.9, 0.5], [0.32, 3.6, 0.55], [0, 3.9, 0.7]]) blk(g, x + a, -3.1, w, 0.4, y, 0.24, '#4fae58');
      roots(g, x, 0.42, -3.1); if (k >= 2) { tomato(g, x + 0.34, 2.5, -2.95, 1.55); tomato(g, x - 0.12, 2.28, -2.8, 1.25); } });
    // the water tank, and the pipe that carries water to both farms
    blk(g, 5.3, -3.3, 1.5, 1.5, 0, 0.5, '#9aa3b2'); blk(g, 5.3, -3.3, 1.4, 1.4, 0.5, 2.5, '#bfe3f5', { mat: soft('#bfe9fb', 0.75) }); blk(g, 5.3, -3.3, 1.2, 1.2, 0.55, 1.8, PAL.water, { shadow: false, mat: GL('#49b4ea') }); blk(g, 5.3, -3.3, 1.6, 1.6, 3.0, 0.14, '#fbfbf7');
    const PIPE = GL('#2f8fd0'); blk(g, 4.5, -2.2, 0.16, 2.2, 0.62, 0.16, PAL.water, { shadow: false, mat: PIPE }); blk(g, 4.5, -1.1, 0.16, 0.16, -1.7, 2.4, PAL.water, { shadow: false, mat: PIPE }); blk(g, 4.5, 0.05, 0.3, 0.04, -1, 1, PAL.water, { shadow: false, mat: PIPE });
    blk(g, -3.6, -1.1, 16.4, 0.16, -1.7, 0.16, PAL.water, { shadow: false, mat: PIPE }); for (const x of [-11.6, -7.6, -3.6, 0.4]) blk(g, x, -1.1, 0.12, 0.12, -2.55, 0.9, PAL.water, { shadow: false, mat: PIPE });
    // ---- the street to the right of the greenhouse
    blk(g, 11.6, -1.6, 0.16, 0.16, 0, 3.4, '#2b3a55'); blk(g, 11.6, -1.6, 0.5, 0.5, 3.4, 0.4, '#ffd257', { mat: GL('#ffe27a') }); fig(g, 10.4, 0, -0.8, { k: 1.05, shirt: '#8a5fc2', skin: SKIN[1], hair: HAIR[3], turn: -0.5, arms: ['down', 'up'] });
    // the market stall on the street, waiting for the food, and a farmer in the greenhouse with an empty crate
    blk(g, 12.6, -1.6, 1.8, 1.2, 0, 0.9, '#c9925a'); for (let k = 0; k < 4; k++) blk(g, 11.9 + k * 0.46, -1.6, 0.46, 1.5, 2.2, 0.14, k % 2 ? '#fbfbf7' : '#e0503a'); for (const a of [-0.8, 0.8]) blk(g, 12.6 + a, -1.1, 0.1, 0.1, 0.9, 1.3, '#7a5a33');
    fig(g, -11.4, 0, -0.9, { k: 1.25, shirt: '#2e9b5a', skin: SKIN[3], hair: HAIR[4], long: true, cap: '#ffd257', arms: ['fwd', 'fwd'], turn: 0.9 }); blk(g, -10.75, -0.35, 0.8, 0.6, 1.0, 0.4, '#b9824a');
    // ---- the tunnel farm: old brick, pink growing lamps, two rows of channels
    blk(g, 0, -4.6, 34, 0.4, -6, 5, '#4a3f66', NO); for (let k = 0; k < 40; k++) blk(g, -16 + hash(k, 1) * 32, -4.38, 1.1, 0.04, -5.8 + Math.floor(hash(k, 2) * 9) * 0.5, 0.42, hash(k, 3) > 0.5 ? '#574a78' : '#3f3558', NO);
    for (const [z, y, d] of [[-4.1, -1.7, 0.7], [-3.6, -1.35, 0.5]]) blk(g, 0, z, 34, d, y, -1 - y, '#4a3f66', NO);
    blk(g, 0, -2.3, 34, 4.6, -6.3, 0.3, '#7d7696', NO); for (const z of [-3.6, -4.1]) blk(g, 0, z, 34, 0.1, -6, 0.08, '#b9c6d2', NO); for (let x = -15; x < 16; x += 1.1) blk(g, x, -3.85, 0.3, 0.9, -6, 0.04, '#5a5072', NO);
    const PINK = GL('#ff8fd0'); blk(g, -4, -2.4, 17.6, 0.3, -1.22, 0.14, '#ff8fd0', { shadow: false, mat: PINK }); blk(g, -4, -4.36, 17.6, 0.03, -3.4, 1.8, '#7a5a9a', { shadow: false, mat: soft('#ff8fd0', 0.22) });
    // lower row: lettuces to pick as you walk. Upper row: strawberries that hang down, worth a jump.
    channel(g, -12.8, 3.6, -4.85, -1.5); [...Array(14)].forEach((_, k) => { const x = -12.3 + k * 1.15; lettuce(g, x, -4.85, -1.5, 1.35); roots(g, x, -4.85, -1.5); });
    channel(g, -12.8, 3.6, -2.55, -2.9, false); for (let x = -12.4; x < 3.6; x += 2.9) blk(g, x, -2.9, 0.08, 0.08, -2.55, 1.3, '#9aa3b2', NO);
    [...Array(11)].forEach((_, k) => { const x = -11.9 + k * 1.45; blk(g, x, -2.9, 0.6, 0.5, -2.55, 0.2, '#4fae58'); blk(g, x + 0.2, -2.55, 0.05, 0.05, -3.25, 0.42, '#3f9a4f', NO); strawberry(g, x + 0.2, -3.62, -2.55, 1.7); blk(g, x - 0.25, -2.55, 0.05, 0.05, -3.05, 0.22, '#3f9a4f', NO); strawberry(g, x - 0.25, -3.36, -2.55, 1.35); });
    // a farmer at the packing table, with crates of food ready for the market
    blk(g, 10.6, -2.6, 2.6, 1.4, -6, 0.9, '#c9925a'); for (const [a, c] of [[-0.7, '#62b653'], [0.3, '#e8402f']]) { blk(g, 10.6 + a, -2.6, 0.8, 0.9, -5.1, 0.34, '#b9824a'); blk(g, 10.6 + a, -2.6, 0.64, 0.74, -4.8, 0.14, c, { mat: GL(c) }); }
    fig(g, 5.3, -6, -1.0, { k: 1.1, shirt: '#2e9b5a', skin: SKIN[2], hair: HAIR[0], cap: '#ffd257', arms: ['down', 'up'], turn: -0.4 });
    // ---- the lift between the two farms: a yellow cage the child rides, so nobody has to climb
    const LXc = 7.7; blk(g, LXc, 0.03, 2.1, 0.06, -1, 1, '#3a3350', NO);
    for (const x of [LXc - 1, LXc + 1]) for (const z of [-0.25, -2.3]) blk(g, x, z, 0.14, 0.14, -6, 6 + 3.6, '#e9ad1c');
    blk(g, LXc, -1.3, 2.2, 2.3, 3.5, 0.2, '#e9ad1c'); blk(g, LXc, -1.3, 2.0, 2.2, 0, 0.16, '#ffd257'); for (let k = 0; k < 5; k++) blk(g, LXc - 0.8 + k * 0.4, 0.04, 0.2, 0.04, 0, 0.16, k % 2 ? INK : '#ffd257', { shadow: false, mat: GL(k % 2 ? INK : '#ffd257') });
    blk(g, LXc, -2.3, 2.0, 0.08, 1.1, 0.1, '#ffd257'); blk(g, LXc, -2.3, 2.0, 0.08, 0.6, 0.08, '#ffd257'); blk(g, LXc, -1.3, 0.1, 0.1, 0.16, 3.4, '#9aa3b2', NO);
    // ---- the child's figure, in the middle of a jump, with a basket on its back
    const me = fig(g, -3.8, 0.42, -0.5, { k: 1.32, shirt: '#e0503a', legs: '#3f78b5', skin: SKIN[0], hair: HAIR[1], pack: '#c9925a', turn: 0.5, arms: ['down', 'up'], step: 0.12 }); me.position.y = 0.2;
    lettuce(me, -0.1, 1.2, -0.3, 0.75); tomato(me, 0.13, 1.2, -0.36, 0.7);
    tomato(g, -3.2, 2.56, -0.5, 1.55); tomato(g, -3.9, 2.6, -2.9, 1.3);
    return { lift: [LXc, 2.5, -0.2], tank: [5.3, 3.6, -2.5] };
  },
  html(p) {
    const n = (i, t) => `${i}<b>${t}</b>`;
    return top('Food', 'Pick the food') + plate(p.lift, 'Lift', 'on', 0, 0) + plate(p.tank, 'Water', '', 0, 0)
      + band('Jump to pick the tomatoes. The lift takes you down.', `<div class="grp"><h4>In your basket</h4><div class="count">${I.basket()}<span></span>${n(I.lettuce(), 4)}${n(I.tomato(), 2)}${n(I.straw().replace('<svg ', '<svg class="off" '), 0)}</div></div><div class="keys"><i class="key">&larr;</i><i class="key">&rarr;</i><i class="key on">Space <em>Jump</em></i></div>`);
  },
};

// ---- 6. the control room -------------------------------------------------------------------------------------------------
const sg = (x0, z0, x1, z1) => { const o = []; for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) o.push([x, z]); return o; };
const PATHS = [...sg(-5, -4, 17, -4), ...sg(9, -3, 9, 8), ...sg(6, 1, 8, 1), ...sg(6, 8, 11, 8), ...sg(-19, -4, -9, -4), ...sg(-16, -3, -16, 0)];
const SRC = ['#ffd84a', '#7fd0ff', '#4fe08a'], DIM = ['#8a7a3a', '#4f7fa8', '#3f8a5e'];
export const control = {
  eye: [31, 5.2, 18], at: [4, 4.6, -3],
  // what is outside the window: the child's own town in the evening, with ten homes, eight of them lit
  outside(g, world, town) {
    const dark = ['A3', 'C1'], hs = [['A1', 'red'], ['A2', 'blue'], ['A3', 'yellow'], ['A4', 'green'], ['B3', 'blue'], ['C1', 'green'], ['B1', 'red'], ['B2', 'blue'], ['B4', 'green'], ['B6', 'red']].map(([at, roof], k) => ({ at, roof, awake: !dark.includes(at), asleep: dark.includes(at), shirt: ['#e0503a', '#3f78b5', '#8a5fc2', '#ffd257'][k % 4], skin: k % 3, hair: k % 4 }));
    world(g, { homes: hs, parks: ['A5', 'B5'], shop: 'C2', solar: true, evening: true, pk: 1.15, ...town });
    for (const [x, z] of [[4.2, -8.2], [12.6, -9.4]]) { const t = group(g, x, 2, z); blk(t, 0, 0, 0.5, 0.5, 0, 6.4, '#fbfbf7'); const hub = group(t, 0.3, 6.4, 0.3); hub.rotation.y = 0.9; for (let i = 0; i < 3; i++) { const b = group(hub); b.rotation.z = i * 2.094 + 0.4; blk(b, 0, 0, 0.42, 0.12, 0.2, 2.7, '#fbfbf7'); } }
    blk(g, 3.6, 3.4, 1.6, 2.4, 2, 1.7, '#fbfbf7'); blk(g, 3.6, 3.4, 1.7, 2.5, 3.7, 0.16, '#5aa35a'); for (let k = 0; k < 3; k++) blk(g, 4.42, 3.4, 0.04, 1.8, 2.25 + k * 0.45, 0.32, '#7dffa8', { shadow: false, mat: GL('#7dffa8') });
    // the low winter sun, close to the hills
    { const sn = group(g, -112, 6.5, -36); sn.rotation.y = 0.93; blk(sn, 0, 0, 9, 1, 0, 9, '#ffb347', { shadow: false, mat: GL('#ff8f2a') }); blk(sn, 0, -1, 14, 1, -2.5, 14, '#ffd9a0', { shadow: false, mat: soft('#ffe9c0', 0.6) }); }
  },
  room(g, view) {
    blk(g, 0, 0, 30, 18, -0.4, 0.4, '#e6dcc6');
    // the back wall and one wide window that shows the middle band of the picture of the town
    const WX = 8.6, WY0 = 4.3, WY1 = 9.9; if (view) { view.repeat.set(1, 0.62); view.offset.set(0, 0.2); }
    blk(g, 0, -6.6, WX * 2, 0.05, WY0, WY1 - WY0, '#fff', { shadow: false, mat: new THREE.MeshBasicMaterial(view ? { map: view } : { color: '#f9d2a6' }) });
    blk(g, 0, -6.4, 30, 0.5, 0, WY0, '#fff4dc'); blk(g, 0, -6.4, 30, 0.5, WY1, 2.4, '#fff4dc'); for (const s of [-1, 1]) blk(g, s * (WX + 3.2), -6.4, 6.4, 0.5, WY0, WY1 - WY0, '#fff4dc');
    for (const x of [-2.87, 2.87]) blk(g, x, -6.3, 0.16, 0.3, WY0, WY1 - WY0, '#fbfbf7', NO); for (const s of [-1, 1]) blk(g, s * WX, -6.3, 0.24, 0.3, WY0, WY1 - WY0, '#fbfbf7', NO); for (const y of [WY0, WY1 - 0.2]) blk(g, 0, -6.3, WX * 2 + 0.24, 0.3, y, 0.2, '#fbfbf7', NO);
    for (const s of [-1, 1]) blk(g, s * 13.2, 0, 0.5, 18, 0, 12, '#fbecd0');
    // the shelf under the window with a small model of each source of power
    blk(g, 0, -5.7, 18.2, 1.3, 3.95, 0.3, '#c9925a'); blk(g, 0, -4.2, 18.2, 2.2, 0, 0.75, '#b9824a');
    const SX = [-5.45, -2.45, 2.05];
    { const s = blk(g, SX[0], -5.7, 1.5, 0.9, 4.6, 0.09, PAL.solar); s.rotation.x = 0.7; blk(g, SX[0], -5.9, 0.12, 0.12, 4.25, 0.4, '#c9d2da'); for (const a of [-0.36, 0.36]) { const l = blk(g, SX[0] + a, -5.69, 0.03, 0.9, 4.66, 0.03, '#9fd0f5', NO); l.rotation.x = 0.7; } }
    { blk(g, SX[1], -5.8, 0.14, 0.14, 4.25, 1.25, '#fbfbf7'); const hub = group(g, SX[1], 5.5, -5.68); for (let i = 0; i < 3; i++) { const b = group(hub); b.rotation.z = i * 2.094 + 0.5; blk(b, 0, 0, 0.14, 0.06, 0.06, 0.74, '#fbfbf7'); } blk(g, SX[1], -5.68, 0.2, 0.14, 5.4, 0.2, '#e0503a'); }
    { blk(g, SX[2], -5.75, 1.3, 0.6, 4.25, 0.72, '#fbfbf7'); blk(g, SX[2] + 0.72, -5.75, 0.14, 0.3, 4.45, 0.3, INK); for (let k = 0; k < 3; k++) blk(g, SX[2] - 0.36 + k * 0.36, -5.44, 0.26, 0.03, 4.36, 0.5, '#4fe08a', { shadow: false, mat: GL(k < 1 ? '#34c26e' : '#c9d2da') }); }
    // the desk leans back so that the child reads it like a board
    const c = group(g, 0, 0.75, -3.1); c.rotation.x = -0.62; const B = (x, y, w, h, col, d = 0.08, z = 0, o = {}) => blk(c, x, z + d / 2, w, d, y, h, col, o), LIT = (col) => ({ shadow: false, mat: GL(col) });
    blk(c, 0, -0.2, 18, 0.4, 0, 4.25, '#fffaf0'); B(-0.95, 0.2, 10.7, 3.85, '#2b3a55', 0.06);
    // the town's need: a row of ten house-shaped lights. One is lit by the sun, five by the wind, two by the battery, two are dark.
    const from = [0, 1, 1, 1, 1, 1, 2, 2, -1, -1];
    from.forEach((s, i) => { const x = -5.45 + i, m = LIT(s < 0 ? '#56617d' : SRC[s]); B(x, 0.42, 0.72, 0.5, '#fff', 0.2, 0.06, m); B(x, 0.92, 0.92, 0.15, '#fff', 0.2, 0.06, m); B(x, 1.07, 0.6, 0.14, '#fff', 0.2, 0.06, m); B(x, 1.21, 0.28, 0.12, '#fff', 0.2, 0.06, m); B(x + 0.14, 0.42, 0.16, 0.26, '#fff', 0.03, 0.26, LIT(s < 0 ? '#3d4764' : '#fffaf0')); });
    // the tracks: power slides down from each source as glowing blocks and drops into the houses
    const track = (s, sx, x0, x1) => { const m = LIT(DIM[s]); B(sx, 1.8, 0.16, 0.95, '#fff', 0.05, 0.06, m); B((x0 + x1) / 2, 1.72, x1 - x0 + 0.16, 0.16, '#fff', 0.05, 0.06, m); for (let x = x0; x <= x1 + 0.01; x++) B(x, 1.38, 0.16, 0.36, '#fff', 0.05, 0.06, m); };
    track(0, SX[0], -5.45, -5.45); track(1, SX[1], -4.45, -0.45); track(2, SX[2], 0.55, 3.55);
    const bead = (s, x, y) => B(x, y - 0.17, 0.36, 0.34, '#fff', 0.16, 0.06, LIT(SRC[s]));
    bead(0, -5.45, 2.2); bead(1, SX[1], 2.45); bead(1, -3.45, 1.8); bead(1, -1.2, 1.8); bead(1, -0.45, 1.55); bead(2, SX[2], 2.35); bead(2, 2.9, 1.8);
    // the three counters, one under each model
    SX.forEach((x, s) => { B(x, 2.8, 2.86, 1.06, SRC[s], 0.05, 0.05, LIT(SRC[s])); B(x, 2.86, 2.72, 0.94, INK, 0.1, 0.08, LIT('#141c30')); });
    // the battery's store (two blocks left of six) and one big lever: up to save, down to use
    for (let k = 0; k < 6; k++) B(5.35, 0.55 + k * 0.52, 0.9, 0.44, '#fff', 0.14, 0, k < 2 ? LIT('#34c26e') : LIT('#d9d2c2')); B(5.35, 0.42, 1.16, 3.3, INK, 0.06, 0, LIT(INK)); B(5.35, 3.72, 0.44, 0.16, INK, 0.1, 0, LIT(INK));
    B(7.75, 0.6, 0.5, 3.0, INK, 0.08, 0, LIT(INK)); B(7.75, 0.95, 0.3, 0.3, '#c9d2da', 0.7, 0.08); B(7.75, 0.62, 1.1, 0.95, '#e0503a', 0.5, 0.7);
    // four season keys, each with a picture; winter is pressed
    const KEYS = [[-8.15, 2.35, '#bfe6a0'], [-7.0, 2.35, '#ffe27a'], [-8.15, 1.2, '#f3b272'], [-7.0, 1.2, '#dff1f7']];
    KEYS.forEach(([x, y, col], k) => { if (k === 3) B(x, y - 0.08, 1.16, 1.16, '#ffd257', 0.05, 0, LIT('#ffb400')); B(x, y, 1.0, 1.0, col, k === 3 ? 0.1 : 0.3, 0, LIT(col)); });
    c.updateMatrixWorld(true); const P = (x, y, z = 0.3) => c.localToWorld(new THREE.Vector3(x, y, z)).toArray();
    // a plant and a noticeboard, so that the room is a place and not only a machine
    
    // the engineer who works here, beside the desk, pointing at the lever
    fig(g, 10.3, 0, -2.4, { k: 3.0, shirt: '#3f78b5', legs: '#2b3a55', skin: SKIN[1], hair: HAIR[3], long: true, hat: '#ffd257', arms: ['up', 'down'], turn: -0.35 });
    blk(g, -11.4, -4.6, 1.5, 1.5, 0, 1.6, '#c8643f'); tree(g, -11.4, 1.6, -4.6, 2.2, '#5fa35a');
    return { n0: P(SX[0], 3.35), n1: P(SX[1], 3.35), n2: P(SX[2], 3.35), k0: P(-8.15, 2.85), k1: P(-7.0, 2.85), k2: P(-8.15, 1.7), k3: P(-7.0, 1.7), save: P(6.72, 3.3), use: P(6.72, 1.1), knob: P(7.9, 0.8, 1.2), sea: P(-7.57, 0.35),
      l0: [SX[0], 4.1, -4.95], l1: [SX[1], 4.1, -4.95], l2: [SX[2], 4.1, -4.95], store: P(5.35, 0.1) };
  },
  html(p) {
    const num = (q, t, c, l) => `<b class="num" style="left:${q[0]}px;top:${q[1]}px;color:${c}"><small>${l}</small>${t}</b>`, ico = (q, s) => `<i class="ico" style="left:${q[0]}px;top:${q[1]}px">${s}</i>`;
    const hs = [...Array(10)].map((_, k) => I.home(k < 1 ? '#ffd84a' : k < 6 ? '#7fd0ff' : k < 8 ? '#4fe08a' : '#8a93a8', k < 8 ? '#fff4dc' : '#56617d')).join('');
    return top('Power', 'Keep the lights on') + num(p.n0, 1, SRC[0], 'Sun') + num(p.n1, 5, SRC[1], 'Wind') + num(p.n2, 4, SRC[2], 'Battery') + ico(p.k0, I.spring()) + ico(p.k1, I.summer()) + ico(p.k2, I.autumn()) + ico(p.k3, I.winter())
      + plate(p.save, 'Save') + plate(p.use, 'Use', 'on') + mouse(p.knob[0] - 4, p.knob[1] - 2) + plate(p.sea, 'Winter', 'on')
      + band('Two homes are dark. The battery is sending two more blocks.', `<div class="grp"><h4>Eight of ten homes have power.</h4><div class="count">${hs}</div></div>`);
  },
};

// ---- 7. the school, cut open ---------------------------------------------------------------------------------------------
const CLR = ['#e0503a', '#3f78b5', '#ffd257', '#8a5fc2', '#2e9b5a', '#16a3a3'];
function liftCar(g, x, y, z, s = 1) { const p = group(g, x, y, z); p.scale.setScalar(s); blk(p, 0, 0, 1.5, 1.4, 0, 0.14, '#3f78b5'); blk(p, 0, 0, 1.5, 1.4, 2.5, 0.16, '#3f78b5'); blk(p, 0, -0.65, 1.5, 0.1, 0.14, 2.36, '#9fd0f5', { mat: GL('#bfe3f5') }); for (const s2 of [-1, 1]) blk(p, s2 * 0.7, 0, 0.1, 1.4, 0.14, 2.36, '#9fd0f5', { mat: soft('#bfe3f5', 0.7) });
  blk(p, 0, 0.71, 0.5, 0.04, 2.52, 0.12, '#ffd257', { shadow: false, mat: GL('#ffd257') }); return p; }
export const school = {
  room(g) {
    blk(g, 0, 4, 80, 60, -0.4, 0.4, '#8fcf73'); blk(g, -24, 1.4, 26, 2.2, 0, 0.03, '#efe2c2', NO); blk(g, 0, 9, 80, 2.4, 0, 0.03, '#efe2c2', NO); blk(g, -14, 5.2, 2.2, 5.4, 0, 0.03, '#efe2c2', NO);
    const X = 8, Z0 = -3, Z1 = 3, P = 0.9, FL = 3.3, U = P + FL;
    blk(g, 0, 0, 16.5, 6.4, 0, P, '#d9d2c2');
    blk(g, 0, Z0, 16.3, 0.3, P, FL * 2, '#fff4dc'); blk(g, X, 0, 0.3, 6, P, FL * 2, '#fbecd0'); blk(g, -X, -1.2, 0.3, 3.6, P, FL * 2, '#fbecd0'); blk(g, -X, 2.5, 0.3, 1, P, FL * 2, '#fbecd0'); blk(g, -X, 1.3, 0.3, 1.4, P + 2.4, FL * 2 - 2.4, '#fbecd0');
    blk(g, 0, 0, 16, 6, U - 0.25, 0.25, '#e6dcc6'); blk(g, 0, 0, 16, 6, P, 0.04, '#eadfc8', NO); for (const x of [-2.8, 2.8]) blk(g, x, -0.9, 0.24, 4.2, P, FL * 2, '#f6e1bd');
    // each room has its own colour on the back wall, so that the rooms can be told apart
    const tint = (cx, w, y, col) => blk(g, cx, Z0 + 0.17, w, 0.04, y + 0.05, FL - 0.4, col, NO);
    tint(-5.4, 5, P, '#fde9c4'); tint(0, 5.3, P, '#fff3b8'); tint(5.4, 5, P, '#ffd9cf'); tint(-5.4, 5, U, '#cfe6f5'); tint(0, 5.3, U, '#d8efc8'); tint(5.4, 5, U, '#eadcf7');
    for (const [x, y] of [[0, P], [0, U], [5.6, U]]) blk(g, x, Z0 + 0.2, 2.4, 0.06, y + 1.3, 1.2, '#bfe3f5', { shadow: false, mat: GL('#cfeaf8') });
    // the roof of steps and the bell, cut flush with the open front
    blk(g, 0, -0.2, 17.4, 6.7, P + FL * 2, 0.5, ROOFS.red); blk(g, 0, -0.6, 15.4, 5, P + FL * 2 + 0.5, 0.5, shade(ROOFS.red, -0.05)); blk(g, 0, -1, 13.2, 3.4, P + FL * 2 + 1, 0.5, ROOFS.red); blk(g, 0, -1, 1.8, 1.8, P + FL * 2 + 1.5, 1.7, PAL.wall[0]); blk(g, 0, -0.06, 0.8, 0.1, P + FL * 2 + 1.9, 0.8, '#ffd257', { mat: GL('#ffd257') }); blk(g, 0, -1, 2.2, 2.2, P + FL * 2 + 3.2, 0.34, ROOFS.red);
    const desk = (x, z, y) => { blk(g, x, z, 1.1, 0.7, y + 0.55, 0.1, PAL.timber); for (const s of [-0.42, 0.42]) blk(g, x + s, z, 0.1, 0.5, y, 0.55, PAL.trunk); };
    const stairs = (x0, dir, y) => { for (let k = 0; k < 8; k++) blk(g, x0 + dir * k * 0.27, Z0 + 0.95, 0.27, 1.5, y, (k + 1) * (FL / 8), '#c9b89a'); };
    // ground floor, left: the hall, with the stairs. A child with a walking frame cannot climb them.
    stairs(-7.5, 1, P); blk(g, -6.2, Z0 + 0.4, 0.06, 0.06, P, 0.1, '#fff');
    fig(g, -5.3, P, 1.2, { k: 0.98, shirt: '#16a3a3', skin: SKIN[1], hair: HAIR[3], long: true, arms: ['push', 'push'], turn: 0.25, head: -0.5, sad: true }); walkingFrame(g, -5.18, P, 1.72, 0.25, 0.98);
    // ground floor, middle: a classroom
    blk(g, 0, Z0 + 0.22, 2.8, 0.08, P + 1.0, 0.3, PAL.solar, NO); for (const [x, z] of [[-1.2, -0.4], [1.2, -0.4], [0, 1.2]]) desk(x, z, P);
    fig(g, -1.2, P, -1.0, { k: 0.85, shirt: CLR[0], hair: HAIR[2] }); fig(g, 1.2, P, -1.0, { k: 0.85, shirt: CLR[4], skin: SKIN[2], hair: HAIR[0] }); fig(g, 1.9, P, 1.5, { k: 1.08, shirt: CLR[5], skin: SKIN[3], hair: HAIR[4], long: true, arms: ['down', 'up'], turn: -0.5 });
    // ground floor, right: the music room, which is loud. A child covers their ears.
    stairs(7.5, -1, P); for (const [x, c, hh] of [[4.2, '#e0503a', 0.7], [5.1, '#ffd257', 0.9]]) { blk(g, x, 0.2, 0.8, 0.8, P, hh, c); blk(g, x, 0.2, 0.86, 0.86, P + hh, 0.08, '#fbfbf7'); }
    fig(g, 4.7, P, -0.7, { k: 0.88, shirt: CLR[1], skin: SKIN[2], hair: HAIR[0], arms: ['up', 'up'] }); fig(g, 6.3, P, 0.3, { k: 0.88, shirt: CLR[2], hair: HAIR[4], arms: ['up', 'fwd'], turn: -0.6 }); blk(g, 6.7, 0.75, 0.9, 0.3, P + 0.9, 0.3, '#ffd257', { mat: GL('#ffd257') });
    fig(g, 3.9, P, 2.3, { k: 1.02, shirt: CLR[3], skin: SKIN[0], hair: HAIR[1], arms: ['ears', 'ears'], turn: 0.1, sad: true });
    // upstairs, left: the library. Middle: a classroom. Right: a room with cushions.
    for (let k = 0; k < 2; k++) { blk(g, -6.5, Z0 + 0.5, 2.3, 0.6, U + 0.1 + k * 1.1, 0.12, PAL.trunk); for (let b = 0; b < 7; b++) blk(g, -7.45 + b * 0.32, Z0 + 0.5, 0.24, 0.5, U + 0.22 + k * 1.1, 0.6 + (b % 3) * 0.1, CLR[(b + k) % 6]); } blk(g, -5.4, 1, 2.6, 1.8, U, 0.05, '#f08ab8', NO); fig(g, -5.6, U, 1, { k: 0.88, shirt: CLR[1], skin: SKIN[2], hair: HAIR[3], arms: ['fwd', 'fwd'], turn: 0.3 }); blk(g, -5.44, 1.5, 0.5, 0.06, U + 0.86, 0.36, '#fff', { mat: GL('#fff') });
    blk(g, 0, Z0 + 0.22, 2.8, 0.08, U + 2.6, 0.01, PAL.solar, NO); for (const [x, z] of [[-1.3, 0], [0.1, 0], [1.5, 0]]) desk(x, z, U); fig(g, -1.3, U, -0.6, { k: 0.85, shirt: CLR[2], hair: HAIR[1] }); fig(g, 0.1, U, -0.6, { k: 0.85, shirt: CLR[5], skin: SKIN[1], hair: HAIR[3] }); fig(g, 1.5, U, -0.6, { k: 0.85, shirt: CLR[0], skin: SKIN[3], hair: HAIR[2], arms: ['down', 'up'] });
    for (const [x, z, c] of [[4.2, 0.6, '#8a5fc2'], [5.6, 1.4, '#3f78b5'], [6.8, 0.2, '#2e9b5a']]) blk(g, x, z, 1, 1, U, 0.4, c);
    // the ramp is placed: a long gentle slope to the way in, and its first user is on the way up with a friend
    const RN = 12, RL = 7.2; for (let k = 0; k < RN; k++) blk(g, -X - 0.15 - (k + 0.5) * (RL / RN), 1.3, RL / RN, 2, 0, P * (1 - (k + 0.5) / RN) + 0.02, k % 2 ? '#e3e1da' : '#d6d3ca'); blk(g, -X - 0.6, 1.3, 1.2, 2, 0, P, '#e3e1da');
    for (const s of [-1, 1]) { for (let k = 0; k <= 4; k++) { const u = k / 4; blk(g, -X - 0.3 - u * (RL - 0.4), 1.3 + s * 1.0, 0.1, 0.1, P * (1 - u), 1.0, '#ffd257'); } const r = blk(g, -X - 0.3 - RL / 2 + 0.2, 1.3 + s * 1.0, RL - 0.3, 0.08, P / 2 + 0.95, 0.1, '#ffd257', NO); r.rotation.z = Math.atan2(P, RL); }
    const wc = wheelchair(g, -11.6, P * 0.5 + 0.02, 1.3, { k: 0.98, shirt: '#3f78b5', skin: SKIN[0], hair: HAIR[1], arms: ['up', 'push'], turn: Math.PI / 2 - 0.5 }); wc.rotation.z = 0;
    fig(g, -14.4, 0.2, 1.5, { k: 0.95, shirt: '#ffd257', skin: SKIN[2], hair: HAIR[0], long: true, arms: ['down', 'up'], turn: 0.9 });
    blk(g, -X - 0.05, 1.3, 0.12, 1.4, P, 2.4, '#7a5a33');
    // two yellow places for the one lift: beside the stairs in the hall, or beside the stairs in the music room
    for (const x of [-4.5, 3.75]) for (const y of [P, U]) frame(g, x, y + 0.06, Z0 + 0.85, 1.6, FL - 0.5, true, { d: 1.3, fill: 0.92 });
    // the lift that the mouse is carrying
    liftCar(g, -11.5, 0.3, 5.2, 1.0);
    // children arriving, and a few trees well away from the building
    fig(g, -20, 0, 1.6, { k: 0.95, shirt: CLR[0], hair: HAIR[2], arms: ['down', 'up'], turn: 1.2 }); fig(g, -6, 0, 9.2, { k: 0.95, shirt: CLR[4], skin: SKIN[3], hair: HAIR[4], turn: 1.2, step: 0.12 }); fig(g, 3.5, 0, 9, { k: 0.95, shirt: CLR[3], skin: SKIN[1], hair: HAIR[3], turn: -1.2, step: 0.12 });
    for (const [x, z, k] of [[-19, -7, 2.4], [-13, -9, 2.1], [13.5, -8, 2.3], [20, -4, 2.2], [-22, 7.5, 2.2]]) tree(g, x, 0, z, k);
    return { lift: [-11.2, 2.0, 5.6], notes: [5.3, P + 2.25, 0.6], a: [-3.75, U + FL - 0.2, Z0 + 1.3], b: [3.75, U + FL - 0.2, Z0 + 1.3] };
  },
  html(p) {
    return top('A school for everyone', 'Make room for everyone') + mouse(p.lift[0], p.lift[1]) + `<b class="zz" style="left:${p.notes[0]}px;top:${p.notes[1]}px;font-size:30px">&#9834; &#9835;</b>`
      + band('You have one lift. Drag it to a yellow place.', tok(I.ramp(), 'Ramp', 'used', 'Placed') + tok(I.lift(), 'Lift', 'on', '1 left') + tok(I.quiet(), 'Quiet room', '', '1 left') + tok(I.wide(), 'Wide door', '', '1 left'));
  },
};
