// Level 1 of Eco Town, "Land", as a playable trial on the shared level kit (23 Nov 2026).
// The place is an empty river valley late in the afternoon, seen from a wooden lookout beside the river. Florence's three places for the
// town are a raised bank beside the river, a low meadow far from it and a hill far from it. "Make it rain" brings a rain storm: the river
// climbs a striped post, spreads over the meadow and wears the bank away. In the play break the child marks out the first ten homes and
// the town green on the chosen land, seen from above, with the line of mud that the river left as a guide.
// Every word in this file is a placeholder. The job, the sentence, the plans, the results and the test button follow docs/redesign/wireframes-data.js.
import { THREE, B, blk, group, fig, place, hash, texBox, tileMat, FAMILY, SHIRTS } from '../../level-kit/blocks.js';
import { newScene, drawSky, tw, wait, ease, back, run, glide, hitBox, plate, glowMarks, hot } from '../../level-kit/stage.js';
import { meterBox, esc } from '../../level-kit/shell.js';
import { beep, chime } from '../../level-kit/sound.js';
import { runLevel } from '../../level-kit/flow.js';

// ---- 1. the words (all placeholders) ---------------------------------------------------------------------------------------------------
const words = {
  level: 'Land for Eco Town',
  job: ['Choose where to build Eco Town. Ask Florence to suggest three places for the town.', 'Then test her plans, so that you can make a good decision.'], start: 'Start',
  askT: 'Your sentence', askHow: 'Heavy rain is coming. Where could we put the homes? Tap a word button to finish the sentence.', ask: 'Ask Florence',
  sentence: ['Find land for the town that stays safe when the river rises because it is', ['on a bank beside the river', 'far away from the river', 'high up and far away'], '.'],
  plansSay: ([w]) => [`You asked for land that is ${w}. Here are three places for the town. Each one has three test huts with a lantern.`, 'Press the button to test what happens to each place.'],
  test: 'Make it rain', testT: 'The rain is coming', watch: 'Rain falls and the river rises.',
  choose: 'The river is high now. Look at each place, and then choose the plan you think is best for the town.', again: 'Ask again', use: 'Choose this one',
  playT: 'Mark out the town', next: 'Next', townT: 'Your town', townHow: 'This is your town, seen from the lookout.',
  built: 'The town stands where you put it.', tryOther: 'Try another plan', chooseOther: 'Choose a different plan to see what happens in the town.', first: 'Your first plan', what: 'What changed?', keepFirst: 'Go back to my first plan', keepThis: 'Keep this plan',
  recapT: 'Quick recap', recapQ: 'Point to the place that stayed dry.', recapYes: 'Yes. The far hill stayed dry when the river rose.', recapNo: 'The far hill stayed dry. The river could not reach it.',
  end: 'The first homes of Eco Town are marked out. Next, the town needs paths and streets.', replay: 'Play again',
  // the test, the meter and the play break
  rain: ['Rain is falling. The river is rising.', 'The river has spread across the low meadow.', 'The river is pulling at the bank.'], rained: 'The rain has stopped. The river is still high.',
  meterT: 'How high the river is', meterRow: 'River', meterNote: ['The river is low.', 'The river is rising.', 'The river is over the meadow.', 'The river is very high.'],
  home: 'Home', green: 'Town green', left: (n) => `${n} left`, placed: 'Placed', flag: 'Flag colour',
  line: 'The river came up to here',
  site: ['The bank is above the line of mud, but the river has worn its edge away.', 'Every place on the meadow is below the line of mud.', 'Every place on the hill is above the line of mud.'],
  howHome: 'Choose a yellow place for each home. There are more places than homes.', howGreen: 'Now choose a yellow place for the town green.', howFlag: 'You can change the colour of the flag.',
  doneBreak: 'Ten homes and the town green are marked out. This is where Eco Town begins.', here: 'Here',
};

// ---- 2. the plans and what the check finds ---------------------------------------------------------------------------------------------
// One small picture of the valley for each plan: the same river, bank, meadow and hill, with the home in a different place
const HX = [13, 24, 37], HY = [15, 22, 6];
const icon = (i) => `<svg class="tagpic" viewBox="0 0 44 36" aria-hidden="true"><path d="M1 35V24h7v-6h8v6h14v-8h5V8h8v27z" fill="#8fd163" stroke="#1f2a44" stroke-width="2.5" stroke-linejoin="round"/><path d="M1 35V26h7v9z" fill="#3f8cc0" stroke="#1f2a44" stroke-width="2.5" stroke-linejoin="round"/><path d="M${HX[i] - 5} ${HY[i] + 2}v-6l5-5 5 5v6z" fill="#ffd257" stroke="#1f2a44" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
const plans = [{ name: 'Right beside the river', lines: ['Beside the river', 'On a raised bank'] }, { name: 'On the far meadow', lines: ['The far meadow', 'Low and flat'] }, { name: 'On the far hill', lines: ['The far hill', 'High up'] }].map((p, i) => ({ ...p, icon: icon(i) }));
// the evidence in front of each sentence: what the test huts looked like when the river was high
const hutPic = (lit, tilt, water, gone) => `<svg class="evpic" viewBox="0 0 40 30" aria-hidden="true"><path d="M1 29v-7h${gone ? 20 : 38}v7z" fill="#8fd163" stroke="#1f2a44" stroke-width="2"/><g transform="rotate(${tilt} 22 22)"><path d="M12 22V11l8-7 8 7v11z" fill="#d9a05b" stroke="#1f2a44" stroke-width="2" stroke-linejoin="round"/><rect x="17" y="13" width="6" height="6" fill="${lit ? '#ffd257' : '#3b4a5e'}" stroke="#1f2a44" stroke-width="1.5"/></g>${water ? '<path d="M1 29V17h38v12z" fill="#3f8cc0" opacity=".8" stroke="#1f2a44" stroke-width="2"/>' : ''}${gone ? '<path d="M21 29v-5h18v5z" fill="#3f8cc0" stroke="#1f2a44" stroke-width="2"/>' : ''}</svg>`;
const RES = [['f', 'The river wore away the bank under these homes.', hutPic(true, 16, false, true)], ['p', 'The water reached these homes.', hutPic(false, 0, true, false)], ['g', 'These homes stayed dry.', hutPic(true, 0, false, false)]];
const results = (i) => [{ check: 'Flood', evidence: RES[i][2], text: RES[i][1], mark: RES[i][0] }];
const AFTER = ['The town now stands on the bank beside the river. The river wears the bank away when it rises.', 'The town now stands on the far meadow. The water reaches the homes when the river rises.', 'The town now stands on the far hill. It stays dry when the river rises, and people have a longer walk down to the water.'];
const river = meterBox(), showRiver = (n, now = false) => river.set({ title: words.meterT, rows: [{ name: words.meterRow, value: n, outOf: 3, label: `${n} of 3`, note: words.meterNote[n], now }] });

// ---- 3. the valley ------------------------------------------------------------------------------------------------------------------------
// three skies, each as [top, middle, horizon]: late afternoon, the rain storm, and the evening after the rain
const SK = [['#3f86d2', '#a5cdea', '#ffe3b4'], ['#333d4f', '#657385', '#98a3ad'], ['#3b68b4', '#f3b888', '#ffdca6']];
const LIGHT = [{ sun: 3.1, col: '#ffe2b0', hemi: 1.3, fog: 0.0052, at: [-34, 22, 16] }, { sun: 0.45, col: '#c9d6e6', hemi: 1.0, fog: 0.0125, at: [-34, 22, 16] }, { sun: 3.3, col: '#ffc486', hemi: 1.15, fog: 0.0058, at: [-40, 13, 12] }];
const HIGH = 1.35, STRIPE = 0.45;                                        // how high the river rises, and one stripe of the post
const V0 = { eye: [0, 8.8, 31], at: [1.5, 2, -14], fov: 44 };             // the view from the lookout
const VCARDS = { eye: [0, 9.6, 33], at: [1.5, -2.6, -14], fov: 45 };      // the same view tipped down a little, so that the three places stand above the result cards
// where the test huts stand, the middle of each place, and the view of each place from above for the play break
const HUTS = [[[-16, 1.9, 1.3], [-12, 1.9, 1.3], [-8, 1.9, 1.3]], [[0, 0.5, -9], [4.2, 0.5, -9], [8.4, 0.5, -9]], [[12, 5.2, -29.5], [16.5, 5.2, -29.5], [21, 5.2, -29.5]]];
const MID = [[-12.5, 1.9, -3.5], [5.5, 0.5, -9.5], [18.5, 5.2, -29.5]];
const PLAN = [{ eye: [-12.5, 33, 9.5], at: [-12.5, 1.9, -3.2], fov: 35 }, { eye: [7, 33, 4.5], at: [7, 0.5, -10.5], fov: 37 }, { eye: [19, 40, -14], at: [19, 5.2, -28.5], fov: 37 }];
const TOWN = [{ eye: [-3, 8.8, 31], at: [-9, 1.5, -6], fov: 33 }, { eye: [1, 8.8, 31], at: [5, 1.5, -12], fov: 33 }, { eye: [2, 8.8, 31], at: [12, 3.4, -24], fov: 31 }];
// sixteen places for ten homes and a green on each kind of land
const PLACES = [
  [...Array(6)].map((_, i) => [-21.5 + i * 3.4, 1.9, -7.2]).concat([...Array(5)].map((_, i) => [-19.8 + i * 3.4, 1.9, -4]), [...Array(5)].map((_, i) => [-21 + i * 3.6, 1.9, -0.9])),
  [...Array(16)].map((_, i) => [-0.5 + (i % 4) * 4.6 + (Math.floor(i / 4) % 2) * 1.2, 0.5, -15 + Math.floor(i / 4) * 3.5]),
  [...Array(6)].map((_, i) => [8.5 + i * 3.9, 3.6, -24.4]).concat([...Array(5)].map((_, i) => [10.5 + i * 4.1, 5.2, -29.4]), [...Array(5)].map((_, i) => [12.5 + i * 4.1, 6.8, -34.8])),
];
const WALL = ['#f3e2bd', '#e9c98f', '#f6ecd6', '#e3b877'], ROOF = ['#d2553a', '#3f78b5', '#2e9b5a', '#e9ad1c'], FLAG = ['#e0503a', '#3f78b5', '#8a5fc2', '#ffd257'];
const I = { home: '<svg viewBox="0 0 44 36" aria-hidden="true"><path d="M9 33V17L22 5l13 12v16z" fill="#f3e2bd" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/><path d="M5 18L22 3l17 15" fill="none" stroke="#d2553a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18" y="21" width="8" height="12" fill="#3f78b5" stroke="#1f2a44" stroke-width="2.5"/></svg>',
  green: '<svg viewBox="0 0 44 36" aria-hidden="true"><rect x="4" y="22" width="36" height="11" rx="3" fill="#58b24a" stroke="#1f2a44" stroke-width="3"/><path d="M15 24V4" stroke="#1f2a44" stroke-width="3" stroke-linecap="round"/><path d="M16 5h17l-4 5 4 5H16z" fill="#e0503a" stroke="#1f2a44" stroke-width="2.5" stroke-linejoin="round"/></svg>' };

function valley() {
  const s = newScene(50, { sun: LIGHT[0].at, skies: SK, haze: LIGHT[0].fog, sunColour: LIGHT[0].col, sunPower: LIGHT[0].sun, lightPower: LIGHT[0].hemi, skyLight: '#dfeaff', groundLight: '#d9c08c' }), g = s.g;
  Object.assign(s, { ...V0, eye: [...V0.eye], at: [...V0.at], bloom: 0.6, minAspect: 1.78, drop: 0 });
  const lerp = (a, b, k) => a + (b - a) * k, c1 = new THREE.Color(), c2 = new THREE.Color();
  // the weather: k is how much of the storm there is, and deep how far the evening after the rain has come
  const W = { k: 0, deep: 0 };
  function weather(k, deep) { W.k = k; W.deep = deep; const air = drawSky(k, deep, SK), v = (f) => lerp(lerp(LIGHT[0][f], LIGHT[1][f], k), LIGHT[2][f], deep);
    s.scene.fog.color.copy(air); s.scene.fog.density = v('fog'); s.sun.intensity = v('sun'); s.hemi.intensity = v('hemi'); s.sun.color.copy(c1.set(LIGHT[0].col).lerp(c2.set(LIGHT[1].col), k).lerp(c2.set(LIGHT[2].col), deep));
    s.sun.position.set(...LIGHT[0].at.map((a, i) => lerp(a, LIGHT[2].at[i], deep))); }
  const toWeather = (k, deep, sec) => { const a = { ...W }; return tw(sec, (t) => weather(lerp(a.k, k, ease(t)), lerp(a.deep, deep, ease(t)))); };
  weather(0, 0);

  // ---- the land: earth with a cap of grass --------------------------------------------------------------------------------------------
  const EARTH = '#a9794a';
  const land = (par, x0, x1, z0, z1, top, grass, side = EARTH, bottom = -3) => { const x = (x0 + x1) / 2, z = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0; B(par, x, z, w, d, bottom, top - 0.3 - bottom, side); return texBox(par, x, z, w, d, top - 0.3, 0.3, tileMat('grass', grass), 3.2, 3.2); };
  B(g, 0, -10, 240, 170, -3.4, 1.2, '#35606e');                                               // the bed of the river
  land(g, -90, 90, 25, 60, 4.6, '#6dbb52');                                                   // the near bank, where the lookout stands
  land(g, -3, 90, -18, 4, 0.5, '#8ed466'); land(g, -24, -3, -18, -9, 0.5, '#8ed466');          // the low meadow
  B(g, 34, 4.6, 112, 1.4, -3, 3.2, '#e6d3a1');                                                // a strip of sand at the water's edge
  land(g, -24, -3, -9, 1, 1.9, '#9bd86c');                                                    // the raised bank beside the river
  land(g, -90, -24, -60, 4, 2.6, '#69b650');                                                  // the wood on the left
  [[-6, -22, -18, 2.0, '#84cc5f'], [-2, -27, -22, 3.6, '#7cc65a'], [2, -32, -27, 5.2, '#84cc5f'], [6, -38, -32, 6.8, '#7cc65a'], [0, -70, -38, 8.4, '#6fbd55']].forEach(([x0, z0, z1, top, c]) => land(g, x0, 90, z0, z1, top, c, '#5fae4c'));   // the hill, in steps
  land(g, -24, -6, -70, -18, 2.6, '#69b650', '#5fae4c'); land(g, -6, 0, -70, -38, 5.2, '#6fbd55', '#5fae4c');
  for (let k = 0; k < 9; k++) { const x = -110 + k * 30 + hash(k, 2) * 10, h = 12 + hash(k, 5) * 9; B(g, x, -120 - hash(k, 9) * 20, 34, 20, 0, h, '#7fae8c', { shadow: false }); B(g, x + 4, -121 - hash(k, 9) * 20, 18, 20, h, 5, '#8fba98', { shadow: false }); }   // far hills that the haze takes
  // the front of the raised bank is made of columns, which the river can pull away
  const cols = []; for (let r = 0; r < 2; r++) for (let i = 0; i < 14; i++) { const c = group(g, -24 + 1.5 * i + 0.75, 0, r ? 1.75 : 3.25); B(c, 0, 0, 1.5, 1.5, -3, 4.6, EARTH); texBox(c, 0, 0, 1.5, 1.5, 1.6, 0.3, tileMat('grass', '#9bd86c'), 3.2, 3.2); cols.push({ c, r, i, gone: false }); }
  const fall = (q, sec = 0.9) => { if (q.gone) return; q.gone = true; const d = hash(q.i, q.r + 3); beep(150 + d * 60, 0.12, 'sawtooth', 0.04); return tw(sec, (t) => { const e = t * t; q.c.position.y = -2.4 * e; q.c.position.z = (q.r ? 1.75 : 3.25) + 1.1 * e; q.c.rotation.x = 0.5 * e * (0.6 + d); q.c.rotation.z = (d - 0.5) * 0.5 * e; }); };

  // ---- trees, reeds, stones and flowers ------------------------------------------------------------------------------------------------
  const LEAF = ['#4fae47', '#3f9a40', '#62bd50', '#3a8f4a'];
  const tree = (x, y, z, k = 1) => { const t = group(g, x, y, z), c = LEAF[Math.floor(hash(x, z) * 4)]; B(t, 0, 0, 0.5 * k, 0.5 * k, 0, 2.2 * k, '#7a5230', { tex: 'bark' }); B(t, 0, 0, 3 * k, 3 * k, 1.9 * k, 2 * k, c, { tex: 'leaf' }); B(t, 0.2 * k, -0.1 * k, 2 * k, 2 * k, 3.9 * k, 1.2 * k, LEAF[(Math.floor(hash(x, z) * 4) + 2) % 4], { tex: 'leaf' }); return t; };
  const pine = (x, y, z, k = 1) => { const t = group(g, x, y, z); B(t, 0, 0, 0.45 * k, 0.45 * k, 0, 1.4 * k, '#6b4628', { tex: 'bark' }); [[2.8, 1.1], [2.1, 2.3], [1.4, 3.5], [0.7, 4.6]].forEach(([w, y0], n) => B(t, 0, 0, w * k, w * k, y0 * k, 1.25 * k, n % 2 ? '#3f8a56' : '#35794c', { tex: 'leaf' })); return t; };
  for (let k = 0; k < 26; k++) { const x = -86 + hash(k, 1) * 58, z = -56 + hash(k, 2) * 56; (k % 3 ? pine : tree)(x, 2.6, z, 1 + hash(k, 3) * 0.7); }                 // the wood on the left
  for (let k = 0; k < 26; k++) { const x = 4 + hash(k, 4) * 80, z = -66 + hash(k, 5) * 24; (k % 2 ? pine : tree)(x, 8.4, z, 1.1 + hash(k, 6) * 0.8); }               // the top of the hill
  for (let k = 0; k < 6; k++) pine(-20 + hash(k, 21) * 12, 2.6, -64 + hash(k, 22) * 40, 1.1);
  [[33, 3.6, -24.5], [38, 5.2, -29], [4, 2.0, -20], [44, 2.0, -20], [36, 6.8, -35], [41, 3.6, -25]].forEach(([x, y, z]) => tree(x, y, z, 0.9));
  [[-38, 17], [-30, 22], [-46, 26], [30, 18], [38, 24], [46, 19], [-22, 19]].forEach(([x, z], k) => (k % 2 ? tree : pine)(x, 4.6, z, 1.2));            // beside the lookout
  [[24, 0.5, -6], [30, 0.5, -13], [36, 0.5, -4], [-20, 0.5, -14], [-8, 0.5, -15]].forEach(([x, y, z]) => tree(x, y, z, 0.75));                      // a few on the meadow
  // reeds with brown heads along the water's edge, which the river covers when it rises
  for (let k = 0; k < 70; k++) { const x = -2 + hash(k, 31) * 70, z = 2.6 + hash(k, 32) * 1.6, h = 0.9 + hash(k, 33) * 0.8; B(g, x, z, 0.14, 0.14, 0.5, h, '#4f9a45', { shadow: false }); if (k % 2) B(g, x, z, 0.24, 0.24, 0.5 + h, 0.42, '#7a4a22', { shadow: false }); }
  for (let k = 0; k < 40; k++) { const x = -60 + hash(k, 41) * 120, h = 0.8 + hash(k, 43) * 0.7; B(g, x, 24.6 + hash(k, 42) * 0.5, 0.14, 0.14, -0.4, h + 0.6, '#4f9a45', { shadow: false }); }
  for (let k = 0; k < 60; k++) { const x = -2 + hash(k, 51) * 50, z = -17 + hash(k, 52) * 19, c = ['#ffffff', '#ffd257', '#f08fb0', '#ffffff'][k % 4]; B(g, x, z, 0.26, 0.26, 0.5, 0.2, c, { unlit: true, shadow: false }); }   // flowers on the meadow
  for (let k = 0; k < 14; k++) { const x = -40 + hash(k, 61) * 90, z = 5 + hash(k, 62) * 19, w = 0.9 + hash(k, 63) * 1.4; B(g, x, z, w, w * 0.8, -2.2, 1.6 + hash(k, 64) * 0.9, '#8d949c'); }                      // stones in the river

  // ---- the river -----------------------------------------------------------------------------------------------------------------------
  const waterM = new THREE.MeshLambertMaterial({ color: '#3f8cc0', transparent: true, opacity: 0.86 }), water = new THREE.Mesh(new THREE.BoxGeometry(190, 1, 43.4), waterM); water.position.set(0, 0, 3.4); water.receiveShadow = true; g.add(water);
  const rip = [...Array(34)].map((_, k) => ({ m: B(g, 0, 0, 1.6 + hash(k, 71) * 2.6, 0.16, 0, 0.05, '#dff1fb', { unlit: true, shadow: false, op: 0.75 }), x: -70 + hash(k, 72) * 140, z: 5.2 + hash(k, 73) * 19, v: 2.5 + hash(k, 74) * 3 }));
  let level = 0; const setLevel = (y) => { level = y; water.scale.y = y + 2.3; water.position.y = (y - 2.3) / 2; waterM.color.set('#3f8cc0').lerp(c2.set('#6b8f96'), Math.min(1, y / HIGH) * 0.55); };
  setLevel(0);
  const toLevel = (y, sec) => { const a = level; return tw(sec, (t) => setLevel(lerp(a, y, ease(t)))); };
  // the striped post that shows how high the river is: three stripes, and the river climbs one at a time
  const post = group(g, -2.5, 0, 10); B(post, 0, 0, 0.55, 0.55, -2.4, 2.4, '#f6f1e2'); [0, 1, 2].forEach((n) => B(post, 0, 0, 0.6, 0.6, n * STRIPE, STRIPE, n % 2 ? '#f6f1e2' : '#e0503a', { raw: true })); B(post, 0, 0, 0.6, 0.6, 3 * STRIPE, 0.5, '#f6f1e2'); B(post, 0, 0, 0.9, 0.9, 3 * STRIPE + 0.5, 0.22, '#1f2a44');
  // what the river leaves behind: mud and puddles on the meadow, driftwood, and a dark line on the land at the height it reached
  const mud = group(g); mud.visible = false; const MUD = '#7d6243';
  for (let k = 0; k < 30; k++) { const x = -1 + hash(k, 81) * 46, z = -16.5 + hash(k, 82) * 19, w = 2.5 + hash(k, 83) * 4; B(mud, x, z, w, w * 0.6, 0.5, 0.05, MUD, { op: 0.62 }); if (k % 3 === 0) B(mud, x + 1, z + 0.8, w * 0.5, w * 0.3, 0.5, 0.07, '#7fb7d6', { unlit: true, shadow: false }); }
  for (let k = 0; k < 8; k++) B(mud, -22 + hash(k, 84) * 18, -16.5 + hash(k, 85) * 7, 3 + hash(k, 86) * 3, 2, 0.5, 0.05, MUD, { op: 0.62 });
  B(mud, 42, -17.93, 96, 0.12, 0.5, HIGH - 0.5, MUD); B(mud, -13.5, -9.07, 21.2, 0.12, 0.5, HIGH - 0.5, MUD); B(mud, -2.93, -4, 0.12, 10, 0.5, HIGH - 0.5, MUD); B(mud, -57, 4.07, 66, 0.12, -0.2, HIGH + 0.2, MUD); B(mud, 0, 24.93, 180, 0.12, -0.2, HIGH + 0.2, MUD);
  for (let k = 0; k < 46; k++) { const onHill = k < 30, x = onHill ? -5 + hash(k, 91) * 50 : -23 + hash(k, 92) * 22, z = onHill ? -17.3 + hash(k, 93) * 0.9 : (k % 2 ? -9.8 - hash(k, 94) * 0.8 : -9.8), st = B(mud, x, z, 1.2 + hash(k, 95) * 1.4, 0.2, 0.52, 0.2, k % 2 ? '#8a6a45' : '#6b4f33'); st.rotation.y = (hash(k, 96) - 0.5) * 0.9; }

  // ---- the sky: rain clouds, and the rain --------------------------------------------------------------------------------------------
  const clouds = group(g, 150, 0, 0); for (let k = 0; k < 24; k++) { const x = -90 + hash(k, 101) * 180, z = -95 + hash(k, 102) * 55, y = 24 + hash(k, 103) * 12, w = 22 + hash(k, 104) * 22; B(clouds, x, z, w, 14, y, 4.5, '#5d6777', { unlit: true, shadow: false, raw: true }); B(clouds, x + 3, z, w * 0.6, 12, y + 4.5, 3.5, '#737d8c', { unlit: true, shadow: false, raw: true }); }
  const far = group(g, 0, 0, 0); for (let k = 0; k < 5; k++) { const x = 55 + hash(k, 111) * 50, y = 26 + hash(k, 113) * 8; B(far, x, -105 - hash(k, 112) * 10, 20 + k * 3, 10, y, 3.5, '#6b7585', { unlit: true, shadow: false, raw: true }); B(far, x + 3, -106, 12, 10, y + 3.5, 3, '#8a93a1', { unlit: true, shadow: false, raw: true }); }   // clouds building over the hill
  const NR = 520, rainM = new THREE.MeshBasicMaterial({ color: '#e6f0fa', transparent: true, opacity: 0.6, depthWrite: false }), rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), rainM, NR), drop = [...Array(NR)].map((_, k) => [-44 + hash(k, 121) * 88, hash(k, 122) * 28, -42 + hash(k, 123) * 70, 24 + hash(k, 124) * 12]), m4 = new THREE.Matrix4();
  rain.frustumCulled = false; rain.visible = false; g.add(rain); let raining = 0;

  // ---- the lookout and the family ------------------------------------------------------------------------------------------------------
  const deck = group(g, 9.6, 4.6, 19.5); texBox(deck, 0, 0, 8.4, 12.6, 0.2, 0.25, tileMat('board', '#c79a62'), 2.4, 1.2);
  for (const x of [-3.9, 3.9]) for (const z of [-6, -1.5, 3]) B(deck, x, z, 0.42, 0.42, -7.4, 7.6, '#8a5f38', { tex: 'bark' });
  for (const x of [-4, -2, 0, 2, 4]) B(deck, x, -6.1, 0.24, 0.24, 0.45, 1.15, '#8a5f38'); B(deck, 0, -6.1, 8.4, 0.26, 1.5, 0.2, '#a87645'); B(deck, 0, -6.1, 8.4, 0.16, 0.95, 0.14, '#a87645');
  for (const x of [-4.1, 4.1]) { B(deck, x, -2.6, 0.2, 7, 1.5, 0.2, '#a87645'); for (const z of [-3.6, -1.2, 0.9]) B(deck, x, z, 0.24, 0.24, 0.45, 1.15, '#8a5f38'); }
  const kid = fig(deck, -2.4, 0.45, -1.6, { ...FAMILY[0], pack: '#ffd257', turn: 0.5, arms: ['up', 'down'], head: -0.3 }), mum = fig(deck, -0.6, 0.45, -3.4, { ...FAMILY[1], turn: 2.5, head: 0.5, arms: ['down', 'fwd'] }), dad = fig(deck, 1.1, 0.45, -3.0, { ...FAMILY[2], turn: -2.6, head: -0.4, pack: '#c98a5a' });
  const brolly = group(deck, 0.2, 0.45, -3.2); B(brolly, 0, 0, 0.1, 0.1, 1.2, 1.9, '#1f2a44'); B(brolly, 0, 0, 3.6, 3, 3.05, 0.18, '#ffd257', { raw: true }); B(brolly, 0, 0, 2.4, 2, 3.23, 0.16, '#ffdf7a', { raw: true }); B(brolly, 0, 0, 1, 0.9, 3.39, 0.14, '#ffd257', { raw: true }); brolly.scale.setScalar(0.01); brolly.visible = false;

  // ---- huts and homes ---------------------------------------------------------------------------------------------------------------------
  const LIT = hot('#ffd97a', 2.3), DARK = new THREE.Color('#34425a'), GLASS = new THREE.Color('#cfe9f5');
  // a small building with a stepped roof. A test hut is bare wood with a lantern on a short post by the door; a home is painted and has a tiled roof
  function build(par, [x, y, z], o = {}) { const h = group(par, x, y, z), w = o.w || 2.3, wm = new THREE.MeshBasicMaterial({ color: o.hut ? LIT : GLASS }), wall = o.wall || '#d9a05b', roof = o.roof || '#9a6a3c';
    B(h, 0, 0, w + 0.3, w + 0.2, 0, 0.14, '#cfc6b4'); B(h, 0, 0, w, w - 0.2, 0.14, 1.75, wall, { tex: 'board' });
    [[w + 0.5, 0], [w - 0.3, 0.36], [w - 1.2, 0.72]].forEach(([rw, ry], n) => B(h, 0, 0, rw, w + 0.3 - n * 0.3, 1.89 + ry, 0.36, roof, { tex: o.hut ? 'board' : 'tile' }));
    B(h, -0.5, (w - 0.2) / 2 + 0.03, 0.62, 0.08, 0.14, 1.15, o.door || '#7a5230'); blk(h, 0.5, (w - 0.2) / 2 + 0.03, 0.66, 0.08, 0.75, 0.62, '#fff', { mat: wm, shadow: false }); blk(h, w / 2 + 0.01, 0, 0.08, 0.7, 0.75, 0.62, '#fff', { mat: wm, shadow: false });
    const q = { g: h, wm, lit: true, tip: 0, tipNow: 0, baseY: y };
    if (o.hut) { q.lm = new THREE.MeshBasicMaterial({ color: hot('#ffd257', 3) }); B(h, 1.5, 1.3, 0.14, 0.14, 0, 0.42, '#1f2a44'); blk(h, 1.5, 1.3, 0.4, 0.4, 0.42, 0.44, '#fff', { mat: q.lm, shadow: false }); B(h, 1.5, 1.3, 0.5, 0.5, 0.86, 0.1, '#1f2a44'); }
    q.light = (on) => { q.lit = on; wm.color.copy(on ? LIT : DARK); if (q.lm) q.lm.color.copy(on ? hot('#ffd257', 3) : DARK); };
    q.day = () => { wm.color.copy(GLASS); };
    return q; }
  const huts = HUTS.map((three) => three.map((p) => { const q = build(g, p, { hut: true }); q.g.visible = false; return q; }));
  const tags = plans.map((p, i) => { const t = plate(s, '', [MID[i][0] + (i === 0 ? -0.5 : i === 1 ? -1.5 : -2), MID[i][1] + (i === 2 ? 5.4 : i === 1 ? 3.9 : 4.6), HUTS[i][1][2]], 'pl'); t.el.innerHTML = `${p.icon}<span><b>${esc(p.lines[0])}</b><b>${esc(p.lines[1])}</b></span>`; t.hide = true; return t; });
  const tip = (q, a, sec = 1) => { const a0 = q.tip; q.tip = a; return tw(sec, (t) => { q.tipNow = lerp(a0, a, ease(t)); q.g.rotation.x = q.tipNow; }); };

  // ---- the child's words, drawn in the valley at once -----------------------------------------------------------------------------------
  const asked = [[-13.5, -3.6, 20.4, 10.4, 1.95], [8.5, -9.5, 22, 15, 0.55], [19, -29.5, 26, 4.6, 5.25]].map(([x, z, w, d, y]) => { const m = glowMarks(place(g, x, z, w, d, y, { clear: 0.4 })); m.visible = false; return m; });
  s.words = (list) => asked.forEach((m, i) => { m.visible = list[0] === i; });
  s.wordTapped = (gap, k) => beep(440 + k * 110, 0.08);

  // ---- Florence's plans appear: three test huts on each place ----------------------------------------------------------------------------
  s.showPlans = async () => { const me = run; asked.forEach((m) => { m.visible = false; }); showRiver(0);
    for (const [i, three] of huts.entries()) { for (const [j, q] of three.entries()) { q.g.visible = true; q.g.scale.setScalar(0.01); beep(330 + i * 70 + j * 25, 0.07); tw(0.4, (t) => q.g.scale.setScalar(Math.max(0.01, back(t)))); await wait(0.16); if (me !== run) return; } tags[i].hide = false; await wait(0.3); if (me !== run) return; } };

  // ---- the test: the rain comes, and the river climbs the post one stripe at a time ---------------------------------------------------
  s.test = async (api) => { const me = run, gone = () => me !== run;
    brolly.visible = true; tw(0.6, (t) => brolly.scale.setScalar(Math.max(0.01, back(t)))); tw(3, (t) => { clouds.position.x = 150 * (1 - ease(t)); }); await toWeather(1, 0, 3); if (gone()) return false;
    rain.visible = true; raining = 1; api.say([words.rain[0]]); showRiver(0, true); await wait(1.2); if (gone()) return false;
    await toLevel(STRIPE, 2.4); showRiver(1, true); beep(300, 0.1); await wait(0.5); if (gone()) return false;
    api.step(words.testT); await toLevel(2 * STRIPE, 2.6); showRiver(2, true); api.say([words.rain[1]]); beep(260, 0.1); if (gone()) return false;
    for (const q of huts[1]) { await wait(0.55); q.light(false); beep(200, 0.16, 'sine'); } await wait(0.6); if (gone()) return false;
    api.say([words.rain[2]]); toLevel(HIGH, 3.2); for (const q of cols.filter((c) => !c.r)) { fall(q); await wait(0.11); } if (gone()) return false;
    showRiver(3, true); for (const q of cols.filter((c) => c.r && c.i >= 6 && c.i <= 9)) { fall(q); await wait(0.14); } await tip(huts[0][1], 0.3, 1.1); await wait(0.6); if (gone()) return false;
    raining = 0; api.say([words.rained]); showRiver(3); tw(3, (t) => { clouds.position.x = -110 * ease(t); }); await toWeather(0.3, 0.75, 2.6); rain.visible = false; await wait(0.8); return !gone(); };
  s.showResults = () => { glide(VCARDS, 1.4); };
  s.asking = () => { glide(V0, 1); };

  // ---- the play break: mark out ten homes and the town green on the chosen land, seen from above -------------------------------------
  const homes = [], pegs = group(g); let green = null, flagM = new THREE.MeshLambertMaterial({ color: FLAG[0] }), walker = null, people = group(g), site = 0;
  function addHome(i) { const n = homes.length, p = PLACES[site][i], q = build(g, p, { wall: WALL[(n + i) % 4], roof: ROOF[(n * 3 + i) % 4], door: ['#3f78b5', '#c0562f', '#2e9b5a', '#7a5230'][n % 4] }); q.i = i; homes.push(q);
    q.g.scale.setScalar(0.01); tw(0.45, (t) => q.g.scale.setScalar(Math.max(0.01, back(t)))); return q; }
  function addGreen(i) { const p = PLACES[site][i], t = group(g, ...p); B(t, 0, 0, 3, 3, 0, 0.16, '#58b24a', { tex: 'grass' }); B(t, 0, 0, 3.3, 3.3, 0, 0.08, '#e6d3a1'); B(t, -0.9, 0.7, 0.16, 0.16, 0, 3.6, '#f6f1e2'); blk(t, -0.1, 0.7, 1.5, 0.08, 2.6, 0.95, '#fff', { mat: flagM }); B(t, 0.9, -0.7, 0.3, 0.3, 0, 1, '#7a5230', { tex: 'bark' }); B(t, 0.9, -0.7, 1.5, 1.5, 0.9, 1.2, '#4fae47', { tex: 'leaf' }); B(t, 0.6, 1, 1.2, 0.36, 0.16, 0.3, '#a87645');
    green = { g: t, i }; t.scale.setScalar(0.01); tw(0.45, (k) => t.scale.setScalar(Math.max(0.01, back(k)))); }
  // the homes and the green move to the same numbered places on another kind of land
  function moveTo(pick) { site = pick; for (const q of homes) { q.g.position.set(...PLACES[pick][q.i]); q.g.rotation.set(0, 0, 0); q.tip = 0; q.tipNow = 0; } if (green) green.g.position.set(...PLACES[pick][green.i]); pegs.visible = false; people.visible = false; }
  const clearHuts = () => { tags.forEach((t) => { t.hide = true; }); huts.flat().forEach((q) => tw(0.5, (t) => { q.g.scale.setScalar(Math.max(0.01, 1 - ease(t))); if (t >= 1) q.g.visible = false; })); };
  s.playBreak = async (pick, api) => { const me = run; site = pick; clearHuts(); brolly.visible = false; mud.visible = true; toWeather(0.08, 1, 2.4); toLevel(0, 2.4); s.still = true; await glide(PLAN[pick], 2.6); if (me !== run) return;
    const P = PLACES[pick], used = new Set(), marks = P.map(([x, y, z]) => glowMarks(place(g, x, z, 2.7, 2.7, y + 0.02))), N = { home: 10, green: 1 }; let tool = 'home', flag = 0, done = false;
    const sign = plate(s, words.line, pick === 0 ? [-13.5, HIGH, 1.2] : pick === 1 ? [20, HIGH, -17.6] : [14, HIGH, -17.4], 'line'); s.lineSign = sign;
    walker = fig(g, P[0][0], P[0][1], P[0][2] + 4, { ...FAMILY[0], pack: '#ffd257', arms: ['up', 'down'], k: 1.25 });
    const tok = {}, mk = (k) => { const b = document.createElement('button'); b.onclick = () => { if (N[k] && !done) { tool = k; draw(); } }; tok[k] = b; return b; }, sw = document.createElement('div');
    sw.innerHTML = `<div class="sws-h">${esc(words.flag)}</div><div class="sws">${FLAG.map((c, k) => `<button class="sw" data-c="${k}" style="background:${c}" aria-label="${esc(words.flag)} ${k + 1}"></button>`).join('')}</div>`;
    sw.onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; flag = +b.dataset.c; flagM.color.set(FLAG[flag]); beep(700, 0.06); draw(); };
    function draw() { for (const k of ['home', 'green']) { tok[k].className = `tok mini land${tool === k && !done ? ' on' : !N[k] || done ? ' used' : ''}`; tok[k].innerHTML = `${I[k]}<span>${esc(words[k])}<small>${esc(N[k] ? words.left(N[k]) : words.placed)}</small></span>`; }
      for (const b of sw.querySelectorAll('.sw')) b.classList.toggle('on', +b.dataset.c === flag); marks.forEach((m, i) => { m.visible = !done && !used.has(i); });
      if (!done) api.say([words.site[pick], tool === 'home' ? words.howHome : words.howGreen]); }
    api.tray([mk('home'), mk('green'), sw]); draw();
    P.forEach(([x, y, z], i) => hitBox(s, g, x, y, z, 3.3, 2.6, 3.3, () => !done && !used.has(i) && N[tool] > 0, () => { used.add(i); N[tool]--;
      if (tool === 'home') { const n = homes.length; addHome(i); beep(520 + n * 40, 0.1); for (const [dx, dz] of [[-1.45, -1.4], [1.45, -1.4], [-1.45, 1.4], [1.45, 1.4]]) B(pegs, x + dx, z + dz, 0.16, 0.16, y, 0.5, '#e0503a', { raw: true });
        const a = walker.position.clone(), b = new THREE.Vector3(x + 1.9, y, z + 1.5); tw(0.7, (t) => { walker.position.lerpVectors(a, b, ease(t)); walker.position.y += Math.sin(t * Math.PI) * 1.2; });
        if (!N.home) tool = 'green'; } else { addGreen(i); chime(); tool = N.home ? 'home' : 'green'; }
      if (!N.home && !N.green) { done = true; chime(); sign.hide = false; api.done([words.doneBreak, words.howFlag]); } draw(); }));
    s.spot = (name, i) => [P[i][0], P[i][1] + 0.3, P[i][2]]; };

  // ---- the town: back at the lookout, with the town across the water --------------------------------------------------------------------
  function settle(pick) { if (s.lineSign) s.lineSign.hide = true; if (walker) walker.visible = false; s.still = false; homes.forEach((q) => q.light(true)); people.clear(); people.visible = true;
    homes.forEach((q, n) => { if (n % 2) return; const p = PLACES[pick][q.i]; fig(people, p[0] - 1.9, p[1], p[2] + 1.4, { k: 1.15, shirt: SHIRTS[n % 6], skin: FAMILY[n % 3].skin, hair: FAMILY[(n + 1) % 3].hair, turn: 0.3 - n * 0.2, arms: n % 4 ? ['down', 'down'] : ['up', 'down'] }); }); }
  s.town = async (pick) => { const me = run; settle(pick); toWeather(0.05, 1, 1.5); await glide(TOWN[pick], 2.6); if (me !== run) return; chime(); };
  // "Try another plan": the same homes stand on the other land, and the rain falls on them
  let swapN = 0;
  s.swap = (pick) => { const id = ++swapN, me = run, off = () => id !== swapN || me !== run; moveTo(pick); settle(pick); setLevel(0); raining = 0; rain.visible = false; glide(TOWN[pick], 1.4);
    (async () => { clouds.position.x = 60; await toWeather(0.9, 0.2, 1.2); if (off()) return; rain.visible = true; raining = 1; await toLevel(HIGH, 3.4); if (off()) return;
      if (pick === 1) for (const q of homes) { q.light(false); await wait(0.12); if (off()) return; }
      if (pick === 0) { for (const q of cols.filter((c) => !c.gone && c.r)) { fall(q); await wait(0.08); } if (off()) return; const front = homes.reduce((a, q) => (PLACES[0][q.i][2] > PLACES[0][a.i][2] || (PLACES[0][q.i][2] === PLACES[0][a.i][2] && Math.abs(PLACES[0][q.i][0] + 12) < Math.abs(PLACES[0][a.i][0] + 12)) ? q : a), homes[0]); await tip(front, 0.26, 0.9); if (off()) return; }
      await wait(0.8); if (off()) return; raining = 0; tw(2, (t) => { clouds.position.x = 60 - 170 * ease(t); }); await toWeather(0.2, 0.9, 1.8); if (!off()) rain.visible = false; })(); };

  // ---- the recap: a tap on the place that stayed dry. Any answer goes on ----------------------------------------------------------------
  s.recap = (answer) => { swapN++; raining = 0; rain.visible = false; toLevel(0, 1.4); toWeather(0.05, 1, 1.4); glide(V0, 1.6); let open = true; const signs = [];
    s.spot = (name, i) => [MID[i][0], MID[i][1] + 1, MID[i][2]];
    MID.forEach(([x, y, z], i) => { const go = () => { if (!open) return; open = false; for (const q of signs) q.hide = true; beep(i === 2 ? 880 : 300, 0.15); if (i === 2) chime(); answer(i === 2); }, pl = plate(s, words.here, [x, y + (i === 2 ? 6 : 5), z], 'tap'); signs.push(pl); pl.el.onclick = go;
      hitBox(s, g, x, y - 1, z, i === 2 ? 30 : 22, 7, i === 2 ? 16 : 13, () => open, go); }); };
  s.evening = () => { toWeather(0.02, 1, 2); glide({ eye: [TOWN[site].eye[0] + 3, 7.6, 27], at: TOWN[site].at, fov: TOWN[site].fov - 5 }, 4); };

  // ---- every picture ------------------------------------------------------------------------------------------------------------------------
  s.tick = (t, dt) => {
    for (const r of rip) { r.x += r.v * dt * (1 + level * 1.6); if (r.x > 72) r.x = -72; r.m.position.set(r.x, level + 0.03 + Math.sin(t * 2 + r.z) * 0.02, r.z); r.m.visible = true; }
    if (rain.visible) { for (let k = 0; k < NR; k++) { const d = drop[k]; d[1] -= d[3] * dt; if (d[1] < -1) d[1] = 27; m4.makeTranslation(d[0], d[1], d[2]); if (!raining && d[1] < 26.5 && d[1] > 26) m4.makeTranslation(0, -50, 0); rain.setMatrixAt(k, m4); } rain.instanceMatrix.needsUpdate = true; rainM.opacity = 0.6 * W.k; }
    kid.position.y = 0.45 + Math.abs(Math.sin(t * 2.4)) * 0.07; mum.head.rotation.y = 0.5 + Math.sin(t * 0.6) * 0.25; dad.head.rotation.y = -0.4 + Math.sin(t * 0.5 + 1) * 0.25;
    for (const three of huts) for (const q of three) if (q.lit && q.lm) q.lm.color.copy(hot('#ffd257', 2.7 + Math.sin(t * 7 + q.g.position.x) * 0.35));
    for (const q of [...huts.flat(), ...homes]) q.g.position.y = (q.i !== undefined ? PLACES[site][q.i][1] : q.baseY) - q.tipNow * 1.1;   // a hut that tips also sinks a little
    far.position.x = Math.sin(t * 0.05) * 6; };
  return s; }

// ---- 4. hand it all to the kit ---------------------------------------------------------------------------------------------------------
runLevel({ place: { number: 1, town: 'Eco Town', level: 'Land' }, words, plans, results, evidence: river.el, scene: valley,
  after: (i) => AFTER[i],
  ends: (pick, s) => [{ step: 'Evening in the valley', say: [words.end], go: () => s.evening() }] });
