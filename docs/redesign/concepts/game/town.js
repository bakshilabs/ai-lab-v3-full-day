// The picture of Eco Town for the start page of the game: one small valley with six places, one for each level, joined by one path in the order of the game.
// A place that has not been played yet is a building plot with stakes and a rope. A place that is done is built, and people live and work there.
// The family stands on the path beside the place that comes next. The same town, at dusk and with every window lit, is the closing picture of the hour.
// It uses the block helpers and the stage of the level kit and changes nothing in them.
import { B, blk, group, fig, place, soft, hash, FAMILY, SHIRTS, SKIN, HAIR } from '../level-kit/blocks.js';
import { cottage, tree, pine, tomato, lettuce, dust, GL } from '../kit-v2.js';
import { THREE, newScene, tw, wait, ease, back, run, plate, hitBox, glowMarks, glide, hot, drawSky } from '../level-kit/stage.js';

// where each place is: front row from left to right, then the back row, on higher ground, from right to left. y is the height of its ground
export const SPOTS = [[-11, 0, 5], [0, 0, 5], [11, 0, 5], [11, 3.2, -9.4], [0, 3.2, -9.4], [-11, 3.2, -9.4]];
const PW = 8, PD = 6, UP = 3.2, EDGE = -3.6;                       // a plot is 8 wide and 6 deep; the back row stands 3.2 higher, behind z = -3.6
// the one path, as a line that the family walks along: over the bridge, along the front row, up the steps on the right, and back along the higher row
const LINE = [[-18, 10.2], [18, 10.2], [18, -5], [-18, -5]], STOPS = [1.6, 12.5, 23.5, 52.7, 63.7, 74.7], MIDDLE = 12.5;
const lineAt = (t) => { let left = Math.max(0, t); for (let k = 0; k < LINE.length - 1; k++) { const [a, b] = [LINE[k], LINE[k + 1]], len = Math.hypot(b[0] - a[0], b[1] - a[1]); if (left <= len || k === LINE.length - 2) { const f = Math.min(1, left / len), z = a[1] + (b[1] - a[1]) * f; return [a[0] + (b[0] - a[0]) * f, groundY(z), z]; } left -= len; } return [0, 0, 0]; };
const groundY = (z) => (z > -1.2 ? 0 : z < EDGE ? UP : UP * (-1.2 - z) / (-1.2 - EDGE));
const DAY = ['#3f93e0', '#9fd0f2', '#ffe9c6'], DUSK = ['#33407f', '#d98a78', '#ffd49a'], NIGHT = ['#0c1232', '#222e66', '#4f5a96'];
const LAMP = '#ffd98a', person = (g, x, y, z, o) => fig(g, x, y, z, { k: 1.15, ...o });

// ---- the six places, built ---------------------------------------------------------------------------------------------------------------
// Each gets a group whose middle is the middle of its plot, and gives back the people who stand there. lit is true in the closing picture
const lantern = (g, x, y, z, lit) => { blk(g, x, z, 0.1, 0.1, y - 1.5, 1.5, '#4a556e'); blk(g, x, z, 0.34, 0.34, y, 0.34, LAMP, { shadow: false, mat: GL(lit ? hot('#ffd98a', 2.6) : '#fff3cf') }); };
const flag = (g, x, y, z, h, colour) => { blk(g, x, z, 0.14, 0.14, y, h, '#f3ead8'); blk(g, x + 0.62, z, 1.1, 0.08, y + h - 0.8, 0.74, colour, { mat: GL(colour) }); };
const BUILD = [
  // 1 Land: the first homes of the town, on ground above the river, with the flag of the town green
  (g, lit) => { B(g, 0, 0, PW, PD, 0, 0.5, '#7fcf63'); B(g, 0, -0.9, PW - 1.6, PD - 2.4, 0.5, 0.5, '#8bd86c');
    cottage(g, -2.5, 0.5, 1.3, { s: 2.2, roof: '#3f78b5', awake: lit, glow: lit, garden: false }); cottage(g, 2.5, 0.5, 1.3, { s: 2.2, roof: '#d2553a', awake: lit, glow: lit, garden: false }); cottage(g, 0, 1, -1.1, { s: 2.6, roof: '#2e9b5a', awake: lit, glow: lit, garden: false });
    flag(g, 0, 0.5, 2.1, 3, '#e0503a'); tree(g, -3.3, 1, -1.4, 1.5); tree(g, 3.2, 1, -1.6, 1.3); B(g, 0, 2.6, 1.2, 0.5, 0.5, 0.08, '#efe2c2', { shadow: false });
    return [person(g, -1.3, 0.5, 2.4, { ...FAMILY[2], shirt: SHIRTS[4], arms: ['up', 'down'], turn: 0.2 }), person(g, 1.4, 0.5, 2.5, { k: 0.85, shirt: SHIRTS[3], hair: HAIR[2], arms: ['down', 'up'], turn: -0.2 })]; },
  // 2 Getting around: a street for walking and cycling, with trees, a bench, bicycles and a signpost
  (g, lit) => { B(g, 0, 0, PW, PD, 0, 0.12, '#e7d9bd'); B(g, 0, 0.6, PW, 1.7, 0.12, 0.04, '#f6ecd6', { shadow: false }); for (let k = 0; k < 5; k++) B(g, -0.9 + k * 0.45, 0.6, 0.24, 1.7, 0.16, 0.02, '#ffffff', { shadow: false, unlit: true });
    for (const x of [-3.2, 3.2]) { tree(g, x, 0.12, -1.9, 1.7); lantern(g, x * 0.55, 2.3, -2.2, lit); }
    B(g, 0, -2.2, 1.8, 0.5, 0.12, 0.5, '#b9844f'); B(g, 0, -2.45, 1.8, 0.12, 0.62, 0.5, '#b9844f');                                             // a bench
    blk(g, 2.9, 2.3, 0.14, 0.14, 0.12, 2.5, '#4a556e'); [['#2e9b5a', 2.2, 1], ['#3f78b5', 1.7, -1], ['#e9ad1c', 1.2, 1]].forEach(([c, y, d]) => B(g, 2.9 + d * 0.55, 2.3, 1.1, 0.1, y, 0.36, c, { raw: true }));   // a signpost
    const bike = (x, z, c) => { const b = group(g, x, 0.12, z); for (const s of [-1, 1]) { blk(b, s * 0.5, 0, 0.56, 0.08, 0, 0.56, '#1f2a44'); blk(b, s * 0.5, 0, 0.3, 0.1, 0.13, 0.3, '#e7d9bd', { shadow: false }); } B(b, 0, 0, 1.0, 0.1, 0.4, 0.14, c, { raw: true }); B(b, -0.3, 0, 0.12, 0.1, 0.5, 0.34, c, { raw: true }); B(b, -0.3, 0, 0.34, 0.2, 0.82, 0.1, '#1f2a44'); B(b, 0.42, 0, 0.1, 0.1, 0.5, 0.5, c, { raw: true }); B(b, 0.42, 0, 0.1, 0.5, 0.98, 0.08, '#1f2a44'); return b; };
    bike(-3.1, 2.4, '#e0503a'); bike(-1.9, 2.4, '#3f78b5');
    return [person(g, -0.6, 0.12, 0.7, { shirt: SHIRTS[0], skin: SKIN[2], hair: HAIR[3], step: 0.14, turn: 1.2, bag: '#e9ad1c' }), person(g, 1.5, 0.12, 0.5, { k: 0.85, shirt: SHIRTS[1], skin: SKIN[1], hair: HAIR[0], arms: ['up', 'down'], turn: 0.3 })]; },
  // 3 Homes: the family's home, three floors of timber with a green roof and a garden
  (g, lit) => { B(g, 0, 0, PW, PD, 0, 0.12, '#7fcf63'); cottage(g, -0.6, 0.12, -0.9, { s: 3.8, d: 3, tall: 3.5, roof: '#2e9b5a', wall: '#e3bd86', timber: true, solar: true, awake: lit, glow: lit, steps: 4, door: '#b5553a' });
    tree(g, 2.9, 0.12, -1.5, 1.8); for (let k = 0; k < 3; k++) B(g, 3 - (k === 2 ? 0.2 : k * 0.44), 1.7, 0.4, 1.2, 0.12 + (k === 2 ? 0.4 : 0), 0.4, '#c39b67', { tex: 'bark' });   // the logs left over from the frame
    return [person(g, 2.2, 0.12, 2.3, { ...FAMILY[1], shirt: SHIRTS[5], arms: ['down', 'up'], turn: -0.3 })]; },
  // 4 Food: a market stall, a glass house where food grows all year, and beds that neighbours share
  (g, lit) => { B(g, 0, 0, PW, PD, 0, 0.12, '#8bd86c');
    const st = group(g, -2.2, 0.12, 1.5); for (const sx of [-1, 1]) for (const sz of [-1, 1]) blk(st, sx * 1.3, sz * 0.7, 0.12, 0.12, 0, 2.1, '#f3ead8'); for (let k = 0; k < 6; k++) B(st, -1.25 + k * 0.5, 0, 0.5, 1.8, 2.1 - Math.abs(k - 2.5) * 0.04, 0.14, k % 2 ? '#fbfbf7' : '#e0503a', { raw: true }); B(st, 0, 0.2, 2.6, 0.9, 0, 0.8, '#b9844f');
    for (let k = 0; k < 3; k++) { tomato(st, -0.9 + k * 0.34, 0.8, 0.35, 1.1); lettuce(st, 0.3 + k * 0.4, 0.8, 0.3, 0.8); }
    const gh = group(g, 1.9, 0.12, -1.1); B(gh, 0, 0, 3.4, 2.6, 0, 0.3, '#f3ead8'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) blk(gh, sx * 1.64, sz * 1.24, 0.12, 0.12, 0.3, 2.3, '#fbfbf7'); B(gh, 0, 0, 3.5, 2.7, 2.6, 0.14, '#fbfbf7');
    blk(gh, 0, 0, 3.3, 2.5, 0.3, 2.3, '#bfe6f2', { shadow: false, mat: soft(lit ? '#ffc4e6' : '#cfeef8', lit ? 0.5 : 0.34) }); for (let r = 0; r < 3; r++) { B(gh, 0, -0.8 + r * 0.8, 2.8, 0.36, 0.3 + r * 0.5, 0.12, '#f3ead8'); B(gh, 0, -0.8 + r * 0.8, 2.6, 0.3, 0.42 + r * 0.5, 0.26, '#4fb548', { tex: 'leaf', unlit: lit }); }
    if (lit) blk(gh, 0, 0, 2.6, 0.12, 2.4, 0.1, '#ff9ad8', { shadow: false, mat: GL(hot('#ff8ad0', 2.2)) });
    for (const x of [-0.9, 0.5]) { const bed = group(g, x + 1.6, 0.12, 2.1); B(bed, 0, 0, 1.2, 1.2, 0, 0.3, '#b9844f'); B(bed, 0, 0, 1, 1, 0.3, 0.06, '#6b4a2b'); for (let k = 0; k < 4; k++) lettuce(bed, -0.24 + (k % 2) * 0.48, 0.36, -0.24 + Math.floor(k / 2) * 0.48, 0.7); }
    return [person(g, -2.2, 0.12, 0.5, { shirt: '#fbfbf7', skin: SKIN[1], hair: HAIR[4], hat: '#2e9b5a', arms: ['fwd', 'down'] }), person(g, 0.2, 0.12, 2.4, { k: 0.85, shirt: SHIRTS[3], skin: SKIN[3], hair: HAIR[1], arms: ['up', 'down'], turn: -0.5 })]; },
  // 5 Power: a wind turbine, panels that face the sun and a battery, on the highest ground of the town
  (g, lit, s) => { B(g, 0, 0, PW + 1, PD, 0, 0.8, '#7fcf63'); B(g, 0, -0.4, PW - 1.6, PD - 1.6, 0.8, 0.7, '#8bd86c');
    blk(g, -1.6, -0.9, 0.5, 0.5, 1.5, 6.6, '#fbfbf7'); B(g, -1.6, -0.75, 0.7, 1.1, 8.1, 0.7, '#fbfbf7'); const hub = group(g, -1.6, 8.45, -0.1); blk(hub, 0, 0, 0.5, 0.3, -0.25, 0.5, '#e0503a');
    for (let k = 0; k < 3; k++) { const arm = group(hub, 0, 0, 0.1); arm.rotation.z = k * Math.PI * 2 / 3; blk(arm, 0, 0, 0.42, 0.1, 0.2, 3.5, '#fbfbf7'); } s.spin.push(hub);
    for (let k = 0; k < 3; k++) { const p = group(g, 1 + k * 1.15, 1.5, 0.5); blk(p, 0, 0, 0.1, 0.1, 0, 0.7, '#4a556e'); const top = group(p, 0, 0.7, 0); top.rotation.x = 0.6; blk(top, 0, 0, 1, 1.5, 0, 0.1, '#274c9a'); blk(top, 0, 0, 0.86, 1.3, 0.1, 0.02, '#3f78d0', { shadow: false, mat: GL('#4a86e0') }); }
    B(g, 2.2, -1.5, 1.6, 0.9, 1.5, 1.2, '#f3ead8'); B(g, 2.2, -1.04, 1.2, 0.04, 1.8, 0.6, '#ffd257', { shadow: false, unlit: true, raw: true }); if (lit) blk(g, 2.2, -1.02, 0.9, 0.04, 1.9, 0.4, LAMP, { shadow: false, mat: GL(hot('#ffd257', 2.4)) });
    return [person(g, -0.2, 1.5, 1.2, { shirt: SHIRTS[3], skin: SKIN[2], hair: HAIR[3], hat: '#ffd257', arms: ['down', 'up'], turn: 0.2 })]; },
  // 6 A school for everyone: the school with its bell tower and flag, and the children in front of it
  (g, lit) => { B(g, 0, 0, PW, PD, 0, 0.12, '#e7d9bd'); cottage(g, 0.6, 0.12, -1.1, { s: 5.2, d: 2.8, tall: 2.5, roof: '#d2553a', wall: '#fbf1d8', chimney: false, garden: false, awake: lit, glow: lit, door: '#3f78b5' });
    B(g, -2.9, -1.1, 1.5, 1.5, 0.12, 4.4, '#fbf1d8'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) blk(g, -2.9 + sx * 0.6, -1.1 + sz * 0.6, 0.2, 0.2, 4.52, 1, '#fbfbf7'); B(g, -2.9, -1.1, 0.6, 0.6, 4.7, 0.6, '#ffd257', { raw: true, mat: lit ? GL(hot('#ffd257', 1.8)) : undefined });
    for (let k = 0; k < 3; k++) B(g, -2.9, -1.1, 1.9 - k * 0.5, 1.9 - k * 0.5, 5.52 + k * 0.3, 0.3, k % 2 ? '#c24a32' : '#d2553a'); flag(g, -2.9, 6.4, -1.1, 1.6, '#ff6fb5');
    for (let k = 0; k < 9; k++) if (k !== 4) blk(g, -3.6 + k * 0.9, 2.8, 0.12, 0.12, 0.12, 0.6, '#fbfbf7'); B(g, -2.0, 2.8, 3.3, 0.08, 0.5, 0.1, '#fbfbf7', { shadow: false }); B(g, 2.3, 2.8, 2.7, 0.08, 0.5, 0.1, '#fbfbf7', { shadow: false });
    return [0, 1, 2, 3].map((k) => person(g, -1.6 + k * 1.0, 0.12, 1.6 + (k % 2) * 0.5, { k: 0.8, shirt: SHIRTS[(k * 2 + 1) % 6], skin: SKIN[k], hair: HAIR[(k + 2) % 5], arms: k % 2 ? ['up', 'down'] : ['down', 'up'], pack: ['#ffd257', '#e0503a', '#3f78b5', '#2e9b5a'][k] }))
      .concat(person(g, 2.9, 0.12, 1.5, { ...FAMILY[1], shirt: '#16a3a3', turn: -0.4, arms: ['up', 'down'] })); },
];
// a place that has not been played yet: bare earth, four stakes with a rope, and the first boards and bricks waiting
function plot(g) { B(g, 0, 0, PW, PD, 0, 0.1, '#c79a66'); B(g, 0, 0, PW - 0.6, PD - 0.6, 0.1, 0.03, '#d7ac78', { shadow: false });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { blk(g, sx * (PW / 2 - 0.3), sz * (PD / 2 - 0.3), 0.18, 0.18, 0, 0.95, '#f3ead8'); blk(g, sx * (PW / 2 - 0.3), sz * (PD / 2 - 0.3), 0.22, 0.22, 0.78, 0.12, '#e0503a'); }
  for (const sz of [-1, 1]) blk(g, 0, sz * (PD / 2 - 0.3), PW - 0.6, 0.05, 0.62, 0.05, '#f3ead8', { shadow: false }); for (const sx of [-1, 1]) blk(g, sx * (PW / 2 - 0.3), 0, 0.05, PD - 0.6, 0.62, 0.05, '#f3ead8', { shadow: false });
  for (let k = 0; k < 4; k++) B(g, -1.8, -0.6 + (k % 2) * 0.1, 2.2, 0.36, 0.12 + k * 0.16, 0.14, k % 2 ? '#d9b684' : '#c39b67'); for (let k = 0; k < 5; k++) B(g, 1.3 + (k % 3) * 0.56 - (k > 2 ? -0.28 : 0), 0.4, 0.5, 0.3, 0.12 + (k > 2 ? 0.24 : 0), 0.24, k % 2 ? '#c9775a' : '#bb6b4f'); }

// ---- the valley ---------------------------------------------------------------------------------------------------------------------------
// state: { built: a set of the places to draw as built, next: the place the family stands beside (or -1 for the middle of the town), dusk: true for the closing picture }
export function makeTown({ built = new Set(), next = 0, dusk = false, onPick = () => {} } = {}) {
  const s = newScene(30, { sun: dusk ? [-30, 14, 16] : [-16, 30, 18], skies: [DAY, DUSK, NIGHT], haze: 0.0075, sunColour: dusk ? '#ffb07a' : '#ffe7c2', sunPower: dusk ? 2.3 : 3.2, lightPower: dusk ? 1.05 : 1.4, skyLight: dusk ? '#c9c2ee' : '#e2ecff' }), g = s.g;
  if (dusk) s.scene.fog.color.copy(drawSky(0.86, 0.12, [DAY, DUSK, NIGHT]));
  Object.assign(s, { eye: [0, 19, 41], at: [0, 2.3, -3], fov: 28, minAspect: 2.05, drop: 0.6, spin: [], bloom: dusk ? 0.75 : 0.5 });
  // the ground: the low meadow in front, the higher ground behind it with a bank of earth, the river in the foreground, and far hills
  B(g, 0, 20, 160, 80, -1, 1, '#74c45a'); B(g, 0, EDGE - 30, 160, 60, 0, UP, '#6dbb55'); B(g, 0, EDGE + 0.06, 160, 0.14, 0, UP - 0.16, '#a9743f', { shadow: false });
  B(g, 0, -11.5, 13, 8, UP, 0.02, '#6dbb55');
  B(g, 0, 17.4, 160, 9.6, -0.05, 0.1, '#3f93e0', { raw: true }); B(g, 0, 17.4, 160, 8.8, -0.05, 0.13, '#62b2f2', { shadow: false, raw: true }); for (let k = 0; k < 14; k++) B(g, -40 + k * 6.3 + hash(k, 2) * 3, 13.6 + hash(k, 5) * 4.6, 1.6 + hash(k, 9), 0.16, 0.08, 0.02, '#d8f0ff', { shadow: false, unlit: true });
  [[-34, -30, 26, 7], [-8, -38, 30, 10], [26, -32, 28, 8], [50, -26, 22, 5.5], [-56, -24, 22, 5]].forEach(([x, z, w, h], k) => { B(g, x, z, w, 14, UP, h * 0.6, ['#63ad52', '#5aa64f'][k % 2]); B(g, x + 2, z - 1, w * 0.62, 10, UP + h * 0.6, h * 0.4, '#6cb65a'); });
  for (let k = 0; k < 34; k++) { const x = -46 + hash(k, 1) * 92, z = -15 - hash(k, 4) * 12; if (Math.abs(x) < 17 && z > -15.5) continue; (k % 3 ? pine : tree)(g, x, UP, z, 1.7 + hash(k, 8) * 1.4); }
  for (let k = 0; k < 12; k++) { const x = (k % 2 ? 1 : -1) * (20.5 + hash(k, 3) * 22), z = -1 + hash(k, 6) * 12; (k % 4 === 0 ? pine : tree)(g, x, 0, z, 1.5 + hash(k, 7) * 1.2); }
  for (let k = 0; k < 5; k++) { const c = group(g, -38 + k * 19 + hash(k, 3) * 6, 19 + hash(k, 5) * 4, -44); blk(c, 0, 0, 7, 2, 0, 1.2, '#ffffff', { shadow: false, mat: GL(dusk ? '#ffd9c2' : '#ffffff') }); blk(c, 1.4, 0, 4, 2, 1.2, 0.9, '#ffffff', { shadow: false, mat: GL(dusk ? '#ffe6d2' : '#ffffff') }); }
  // the path of the game, in one colour so that the order of the six places can be followed: the bridge, the front row, the steps, the back row
  const SAND = '#f1dfae'; B(g, 0, 10.2, 38, 2, 0, 0.07, SAND, { shadow: false }); B(g, 18, 4.5, 2, 11.4, 0, 0.07, SAND, { shadow: false }); B(g, 0, -5, 38, 2, UP, 0.07, SAND, { shadow: false });
  for (let k = 0; k < 8; k++) B(g, 18, -1.3 - k * 0.3, 2.4, 0.32, 0, (k + 1) * (UP / 8), k % 2 ? '#e3cf9c' : '#ecd9a8');
  for (const [x, , z] of SPOTS) B(g, x, z > 0 ? z + PD / 2 + 1.1 : z + PD / 2 + 0.7, 1.4, z > 0 ? 2.2 : 1.4, z > 0 ? 0 : UP, 0.07, SAND, { shadow: false });
  B(g, -18, 17.5, 2.6, 13, 0.1, 0.22, '#b9844f'); for (let k = 0; k < 7; k++) for (const sx of [-1, 1]) blk(g, -18 + sx * 1.2, 12.4 + k * 1.7, 0.2, 0.2, 0.3, 0.9, '#8f6238'); for (const sx of [-1, 1]) B(g, -18 + sx * 1.2, 17.5, 0.14, 10.6, 1.05, 0.14, '#8f6238', { shadow: false });
  for (const [x, z] of [[-19.7, 11.7], [19.8, 11.7], [19.8, -6.6], [-19.7, -6.6], [-5.5, 8.6], [5.5, 8.6], [-5.5, -6.6], [5.5, -6.6]]) lantern(g, x, groundY(z) + 2.2, z, dusk);
  if (dusk) for (let k = 0; k < 15; k++) { const x = -15.4 + k * 2.2, y = 4.3 - Math.sin(k / 14 * Math.PI) * 0.7; blk(g, x, 9, 0.28, 0.28, y, 0.28, LAMP, { shadow: false, mat: GL(hot(['#ffd257', '#ff8a6a', '#8ad8ff'][k % 3], 2.1)) }); }

  // the six places. Each has its plot and, when it is done, what was built there
  const places = SPOTS.map(([x, y, z], i) => { const p = { i, g: group(g, x, y, z), site: null, home: null, people: [], mark: null }; p.site = group(p.g); plot(p.site);
    p.mark = glowMarks(place(p.g, 0, 0, PW + 0.9, PD + 0.9, 0.02, { clear: 0.55 })); p.mark.visible = false;
    hitBox(s, p.g, 0, 0, 0, PW + 1, 6, PD + 1, () => s.open, () => onPick(i)); return p; });
  const raise = (p) => { if (p.home) return; p.home = group(p.g); p.people = BUILD[p.i](p.home, dusk, s).map((f) => ({ f, y: f.position.y })); p.site.visible = false; };
  for (const p of places) if (built.has(p.i)) raise(p);
  // the family stands on the path beside the place that comes next, and walks along the path when it changes
  const fam = group(g), at = { t: next < 0 ? MIDDLE : STOPS[next] }, stand = () => { const [x, y, z] = lineAt(at.t); fam.position.set(x, y + 0.07, z + (z > 0 ? 0.2 : 0.1)); };
  FAMILY.forEach((f, k) => { const m = fig(fam, [0, -1.25, 1.25][k], 0, [0.5, -0.3, -0.3][k], { ...f, k: f.k * 1.15, pack: k ? null : '#ffd257', arms: k === 2 ? ['down', 'up'] : k === 0 ? ['up', 'down'] : ['down', 'down'], turn: [0, 0.15, -0.15][k] }); m.userData.y = 0; }); stand();
  const mark = (i) => places.forEach((p) => { p.mark.visible = p.i === i && !dusk; }); mark(next);
  s.open = true;
  // the signs over the six places are drawn by the page (game.js), which knows which levels are done; this gives it the place of each sign
  s.signAt = (i, isBuilt) => { const [x, y, z] = SPOTS[i]; return isBuilt ? [x + [0, 0, 0, 0, 2.2, 1.2][i], y + [4.6, 4.2, 6.4, 4.4, 4.6, 5.2][i], z] : [x, y + 2.3, z]; };
  // a place is built: the plot goes, dust rises and the place grows out of the ground. Then the family walks on to the place that comes next
  s.build = async (i) => { const me = run, p = places[i]; if (p.home) return true; mark(-1); raise(p); const d = group(p.g); dust(d, 0, 0.2, 0, 3.4, 16); p.home.scale.set(1, 0.01, 1);
    await tw(1.3, (t) => { p.home.scale.y = Math.max(0.01, back(t)); d.scale.setScalar(1 + t * 0.7); d.position.y = t * 1.6; d.visible = t < 0.95; }); if (me !== run) return false; d.visible = false; return true; };
  s.walkTo = async (i) => { const me = run, from = at.t, to = i < 0 ? MIDDLE : STOPS[i]; mark(-1); if (Math.abs(to - from) > 0.01) await tw(Math.min(3.2, 0.6 + Math.abs(to - from) * 0.09), (t) => { at.t = from + (to - from) * ease(t); stand(); fam.position.y += Math.abs(Math.sin(t * 16)) * 0.14; }); if (me !== run) return false; mark(i); return true; };
  // for the closing picture the camera comes down to the family in the middle of the town
  s.closer = () => glide({ eye: [1.5, 6.4, 27.5], at: [0, 3.1, -1], fov: 36 }, 2.4);
  // and it looks a little lower while the cards of the jobs lie over the bottom of the picture, so that the family stays in view above them
  s.aboveCards = () => glide({ eye: [1.5, 7.6, 29.5], at: [0, 0.7, -1], fov: 36 }, 1.4);
  s.tick = (t) => { for (const h of s.spin) h.rotation.z = t * 1.1; for (const p of places) p.people.forEach((q, k) => { q.f.position.y = q.y + Math.abs(Math.sin(t * (dusk ? 3.2 : 2) + k * 1.7 + p.i)) * (dusk ? 0.16 : 0.05); }); if (dusk) fam.children.forEach((m, k) => { m.position.y = Math.abs(Math.sin(t * 3 + k)) * 0.12; }); };
  s.spot = (name, i) => { const [x, y, z] = SPOTS[i]; return [x, y + 1, z]; };
  return s; }
