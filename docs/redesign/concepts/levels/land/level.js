// Level 1 of Eco Town, "Land", as a playable trial on the shared level kit (23 and 24 Nov 2026).
// The place is an empty river valley late in the afternoon, seen from a wooden lookout beside the river. Florence's three places for the
// town are a raised bank beside the river, a low meadow far from it and a hill far from it. "Make it rain" brings a rain storm, and the child
// taps the cloud for more rain: the river climbs a striped post, spreads over the meadow and wears the bank away. The child then looks
// closely at each place. In the play break the river goes down and leaves a line of mud, and the child chooses places for the family's
// home, five neighbours and the town green. The places differ, and the people say what they think of theirs.
// Every word in this file is a placeholder. The job, the sentence, the plans, the results and the test button follow docs/redesign/wireframes-data.js.
import { THREE, B, blk, group, fig, place, frame, hash, texBox, tileMat, FAMILY, SHIRTS } from '../../level-kit/blocks.js';
import { newScene, drawSky, tw, wait, ease, back, run, glide, hitBox, plate, glowMarks, hot } from '../../level-kit/stage.js';
import { $, meterBox, esc } from '../../level-kit/shell.js';
import { beep, chime } from '../../level-kit/sound.js';
import { runLevel } from '../../level-kit/flow.js';
import { rainSound, riverSound, rumble, thud, splash, hiss, quack, squeak, croak, quiet } from './sound.js';

// ---- 1. the words (all placeholders) ---------------------------------------------------------------------------------------------------
const words = {
  level: 'Land for Eco Town',
  job: ['Choose where to build Eco Town. Ask Florence to suggest three places for the town.', 'Then test her plans, so that you can make a good decision.'], start: 'Start',
  askT: 'Your sentence', askHow: 'Heavy rain is coming. Where could we put the homes?', ask: 'Ask Florence',
  sentence: ['Find land for the town that stays safe when the river rises because it is', ['on a bank beside the river', 'far away from the river', 'high up and far away'], '.'],
  plansSay: () => ['Here are three places for the town. Each one has three test huts.', 'Press the button to test them.'],
  test: 'Make it rain', testT: 'The rain is coming', watch: 'Rain falls and the river rises.',
  lookT: 'Look at each place', look: 'The rain has stopped. Tap each place to look closely.', showAll: 'Show all three',
  choose: 'Which plan will you choose for the town?', again: 'Ask again', use: 'Choose this one',
  playT: 'Mark out the town', next: 'Next', townT: 'Your town', townHow: 'This is your town.',
  built: 'The town stands where you put it.', tryOther: 'Try another plan', chooseOther: 'Choose a different plan to see what happens in the town.', first: 'Your first plan', what: 'What changed?', keepFirst: 'Go back to my first plan', keepThis: 'Keep this plan',
  recapT: 'Quick recap', recapQ: 'Point to the place that stayed dry.', recapYes: 'Yes. The far hill stayed dry when the river rose.', recapNo: 'The far hill stayed dry. The river could not reach it.',
  end: 'The first homes of Eco Town are marked out. Next, the town needs paths and streets.', replay: 'Play again',
  // the test and the meter
  rain: ['The river is rising.', 'The river has spread across the meadow.', 'The river is pulling at the bank.'], more: 'More rain', moreHow: 'Tap the cloud to make more rain.',
  meterT: 'How high the river is', meterRow: 'River', meterNote: ['The river is low.', 'The river is rising.', 'The river is over the meadow.', 'The river is very high.'],
  // the play break
  goesDown: 'The river goes down. It leaves a line of mud.', line: 'The river came up to here',
  home: 'Home', green: 'Town green', left: (n) => `${n} left`, placed: 'Placed', flag: 'Flag colour', family: 'Your family',
  how: ['Choose a place for your family’s home. Look at the mud, the trees and the path first.', 'Now choose places for five neighbours.', 'Now choose a place for the town green.'],
  afterHillLow: 'The town now stands on the far hill. The homes on the hill stay dry when the river rises. The homes at the foot of the hill are below the line of mud.',
  doneBreak: ['The first homes of Eco Town are marked out.', 'Tap a home if you want to move it.'], here: 'Here',
  // what the people say about their place. On the meadow every place is below the line of mud
  react: { dry: 'A good dry place!', view: 'We can see the whole valley!', tree: 'A tree for shade!', path: 'A short walk to the river!', low: 'The ground is muddy here.', edge: 'The edge is very close.', puddle: 'There is a puddle at our door.' },
  reactMeadow: { tree: 'Shade, but the ground is muddy.', path: 'A short walk, but the ground is muddy.', low: 'The ground is muddy here.', puddle: 'There is a puddle at our door.' },
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
const V0 = { eye: [0, 8.8, 31], at: [1.5, 2, -14], fov: 44 };           // the view from the lookout
const VCARDS = { eye: [0, 9.6, 33], at: [1.5, -1.5, -14], fov: 45 };    // the same view tipped down a little, so that the three places stand above the result cards
// where the test huts stand, and the middle of each place
const HUTS = [[[-16, 1.9, 1.3], [-12, 1.9, 1.3], [-8, 1.9, 1.3]], [[0, 0.5, -9], [4.2, 0.5, -9], [8.4, 0.5, -9]], [[12, 5.2, -29.5], [16.5, 5.2, -29.5], [21, 5.2, -29.5]]];
const MID = [[-12.5, 1.9, -3.5], [5.5, 0.5, -9.5], [18.5, 5.2, -29.5]];
// three views of each place: close to the test huts (with room under them for one result card), from above for the play break, and the town when it is built
const LOOK = [{ eye: [-14.5, 4.4, 14], at: [-14.5, 1.3, 0], fov: 46 }, { eye: [2, 3.6, 6], at: [2, 0.7, -9], fov: 46 }, { eye: [14, 8.2, -14], at: [14, 5.2, -29.5], fov: 46 }];
const PLAN = [{ eye: [-13.2, 23.6, 11.4], at: [-13.2, 1.5, -4.1], fov: 37 }, { eye: [6.3, 21, 2.85], at: [6.3, 0.5, -11.5], fov: 37 }, { eye: [17.3, 29.8, 5.2], at: [17.3, 3.2, -23.3], fov: 40 }];
const TOWN = [{ eye: [-13, 7.5, 15], at: [-13, 1.4, -4], fov: 50 }, { eye: [6.3, 6.5, 8.5], at: [6.3, 0.6, -9], fov: 50 }, { eye: [17, 11.5, -1], at: [17, 4.8, -25], fov: 46 }];
// Fourteen places on each kind of land, for six homes and the town green: [x, height of the ground, z, what kind of place it is].
// The kinds can be seen in the valley itself: low (below the line of mud), puddle, edge (beside the broken bank), tree, path (beside the path to the river), view (the top of the hill) and dry.
const SITES = [
  [[-19, 1.9, -0.6, 'edge'], [-13.5, 1.9, -0.6, 'edge'], [-8, 1.9, -0.6, 'edge'], [-20, 1.9, -4, 'dry'], [-16, 1.9, -4, 'tree'], [-12, 1.9, -4, 'dry'], [-8, 1.9, -4, 'dry'], [-21, 1.9, -7.3, 'dry'], [-17, 1.9, -7.3, 'dry'], [-13, 1.9, -7.3, 'dry'], [-9, 1.9, -7.3, 'tree'], [-5.5, 1.9, -7.3, 'dry'], [-18, 0.5, -12.2, 'low'], [-11, 0.5, -12.2, 'low']],
  [[0, 0, 'puddle'], [0, 1, 'low'], [0, 2, 'tree'], [1, 0, 'low'], [1, 1, 'puddle'], [1, 2, 'low'], [1, 3, 'tree'], [2, 0, 'puddle'], [2, 1, 'low'], [2, 2, 'path'], [2, 3, 'path'], [3, 1, 'puddle'], [3, 2, 'path'], [3, 3, 'path']].map(([j, c, kind]) => [-0.2 + c * 4.3, 0.5, -14.8 + j * 3.5, kind]),
  [[13, 0.5, -14, 'low'], [17, 0.5, -14, 'low'], [21, 0.5, -14, 'low'], [13, 2.0, -20, 'path'], [17, 2.0, -20, 'dry'], [21, 2.0, -20, 'dry'], [13, 3.6, -24.4, 'path'], [17, 3.6, -24.4, 'dry'], [21, 3.6, -24.4, 'tree'], [13.5, 5.2, -29.4, 'dry'], [17.5, 5.2, -29.4, 'dry'], [21.5, 5.2, -29.4, 'tree'], [15, 6.8, -34.8, 'view'], [19, 6.8, -34.8, 'view']],
];
const HAPPY = { dry: 1, view: 1, tree: 1, path: 1 }, NHOMES = 6;
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
  land(g, -24, 8, -70, -18, 2.0, '#69b650', '#5fae4c'); land(g, -8, 0, -70, -38, 5.2, '#6fbd55', '#5fae4c');
  for (let k = 0; k < 10; k++) { const x = -120 + k * 27 + hash(k, 2) * 8, z = -84 - hash(k, 9) * 12, h = 13 + hash(k, 5) * 10; B(g, x, z, 36, 16, 0, h * 0.6, '#1f8f63', { shadow: false }); B(g, x + 2, z - 1, 26, 16, h * 0.6, h * 0.4, '#2a9f70', { shadow: false }); B(g, x + 5, z - 2, 14, 16, h, 4, '#38ad7c', { shadow: false }); }   // far green hills, which the haze softens
  // the front of the raised bank is made of columns, which the river can pull away
  const cols = []; for (let r = 0; r < 2; r++) for (let i = 0; i < 14; i++) { const c = group(g, -24 + 1.5 * i + 0.75, 0, r ? 1.75 : 3.25); B(c, 0, 0, 1.5, 1.5, -3, 4.6, EARTH); texBox(c, 0, 0, 1.5, 1.5, 1.6, 0.3, tileMat('grass', '#9bd86c'), 3.2, 3.2); cols.push({ c, r, i, gone: false }); }
  const fall = (q, sec = 0.9) => { if (q.gone) return; q.gone = true; const d = hash(q.i, q.r + 3); thud(); tw(sec * 0.6, () => {}).then(splash); return tw(sec, (t) => { const e = t * t; q.c.position.y = -2.4 * e; q.c.position.z = (q.r ? 1.75 : 3.25) + 1.1 * e; q.c.rotation.x = 0.5 * e * (0.6 + d); q.c.rotation.z = (d - 0.5) * 0.5 * e; }); };

  // ---- trees, reeds, stones and flowers ------------------------------------------------------------------------------------------------
  const LEAF = ['#4fae47', '#3f9a40', '#62bd50', '#3a8f4a'];
  const tree = (x, y, z, k = 1) => { const t = group(g, x, y, z), c = LEAF[Math.floor(hash(x, z) * 4)]; B(t, 0, 0, 0.5 * k, 0.5 * k, 0, 2.2 * k, '#7a5230', { tex: 'bark' }); B(t, 0, 0, 3 * k, 3 * k, 1.9 * k, 2 * k, c, { tex: 'leaf' }); B(t, 0.2 * k, -0.1 * k, 2 * k, 2 * k, 3.9 * k, 1.2 * k, LEAF[(Math.floor(hash(x, z) * 4) + 2) % 4], { tex: 'leaf' }); return t; };
  const pine = (x, y, z, k = 1) => { const t = group(g, x, y, z); B(t, 0, 0, 0.45 * k, 0.45 * k, 0, 1.4 * k, '#6b4628', { tex: 'bark' }); [[2.8, 1.1], [2.1, 2.3], [1.4, 3.5], [0.7, 4.6]].forEach(([w, y0], n) => B(t, 0, 0, w * k, w * k, y0 * k, 1.25 * k, n % 2 ? '#3f8a56' : '#35794c', { tex: 'leaf' })); return t; };
  for (let k = 0; k < 26; k++) { const x = -86 + hash(k, 1) * 58, z = -56 + hash(k, 2) * 56; (k % 3 ? pine : tree)(x, 2.6, z, 1 + hash(k, 3) * 0.7); }                 // the wood on the left
  for (let k = 0; k < 26; k++) { const x = 4 + hash(k, 4) * 80, z = -66 + hash(k, 5) * 24; (k % 2 ? pine : tree)(x, 8.4, z, 1.1 + hash(k, 6) * 0.8); }               // the top of the hill
  for (let k = 0; k < 6; k++) pine(-20 + hash(k, 21) * 12, 2.0, -64 + hash(k, 22) * 40, 1.1);
  [[33, 3.6, -24.5], [38, 5.2, -29], [4, 2.0, -20], [44, 2.0, -20], [36, 6.8, -35], [41, 3.6, -25]].forEach(([x, y, z]) => tree(x, y, z, 0.9));
  [[-38, 17], [-30, 22], [-46, 26], [30, 18], [38, 24], [46, 19], [-22, 19]].forEach(([x, z], k) => (k % 2 ? tree : pine)(x, 4.6, z, 1.2));            // beside the lookout
  [[24, 0.5, -6], [30, 0.5, -13], [36, 0.5, -4], [-20, 0.5, -14], [-8, 0.5, -15]].forEach(([x, y, z]) => tree(x, y, z, 0.75));                      // a few on the meadow
  // reeds with brown heads along the water's edge, which the river covers when it rises
  for (let k = 0; k < 70; k++) { const x = -2 + hash(k, 31) * 70, z = 2.6 + hash(k, 32) * 1.6, h = 0.9 + hash(k, 33) * 0.8; B(g, x, z, 0.14, 0.14, 0.5, h, '#4f9a45', { shadow: false }); if (k % 2) B(g, x, z, 0.24, 0.24, 0.5 + h, 0.42, '#7a4a22', { shadow: false }); }
  for (let k = 0; k < 40; k++) { const x = -60 + hash(k, 41) * 120, h = 0.8 + hash(k, 43) * 0.7; B(g, x, 24.6 + hash(k, 42) * 0.5, 0.14, 0.14, -0.4, h + 0.6, '#4f9a45', { shadow: false }); }
  for (let k = 0; k < 60; k++) { const x = -2 + hash(k, 51) * 50, z = -17 + hash(k, 52) * 19, c = ['#ffffff', '#ffd257', '#f08fb0', '#ffffff'][k % 4]; B(g, x, z, 0.26, 0.26, 0.5, 0.2, c, { unlit: true, shadow: false }); }   // flowers on the meadow

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
  B(mud, 42, -17.1, 96, 1.6, 0.5, 0.06, MUD, { op: 0.8 }); B(mud, -13.5, -9.8, 21, 1.4, 0.5, 0.06, MUD, { op: 0.8 });
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

  // ---- the path from the hill down to the river, and a tree beside every place that is "beside a tree" ----------------------------
  const SAND = '#e6d3a1'; B(g, 10.6, -6.9, 1.3, 22.2, 0.5, 0.07, SAND);
  [[0.5, 2.0, -22, -18], [2.0, 3.6, -27, -22], [3.6, 5.2, -32, -27], [5.2, 6.8, -38, -32]].forEach(([below, top, z0, z1]) => { B(g, 10.6, (z0 + z1) / 2, 1.3, z1 - z0, top, 0.07, SAND); B(g, 10.6, z1 + 0.3, 1.3, 0.6, below, (top - below) * 0.66, SAND); B(g, 10.6, z1 + 0.85, 1.3, 0.5, below, (top - below) * 0.33, SAND); });
  SITES.forEach((list) => list.forEach(([x, y, z, kind]) => { if (kind === 'tree') tree(x + 2.15, y, z - 0.2, 0.5); }));

  // ---- huts and homes ---------------------------------------------------------------------------------------------------------------------
  const LIT = hot('#ffd97a', 2.3), DARK = new THREE.Color('#34425a'), GLASS = new THREE.Color('#cfe9f5');
  // a small building with a stepped roof. A test hut is bare wood with a lantern on a short post by the door; a home is painted and has a tiled roof
  function build(par, [x, y, z], o = {}) { const h = group(par, x, y, z), w = o.w || 2.3, wm = new THREE.MeshBasicMaterial({ color: o.hut ? LIT : GLASS }), wall = o.wall || '#d9a05b', roof = o.roof || '#9a6a3c';
    B(h, 0, 0, w + 0.3, w + 0.2, 0, 0.14, '#cfc6b4'); B(h, 0, 0, w, w - 0.2, 0.14, 1.75, wall, { tex: 'board' });
    [[w + 0.5, 0], [w - 0.3, 0.36], [w - 1.2, 0.72]].forEach(([rw, ry], n) => B(h, 0, 0, rw, w + 0.3 - n * 0.3, 1.89 + ry, 0.36, roof, { tex: o.hut ? 'board' : 'tile' }));
    B(h, -0.5, (w - 0.2) / 2 + 0.03, 0.62, 0.08, 0.14, 1.15, o.door || '#7a5230'); blk(h, 0.5, (w - 0.2) / 2 + 0.03, 0.66, 0.08, 0.75, 0.62, '#fff', { mat: wm, shadow: false }); blk(h, w / 2 + 0.01, 0, 0.08, 0.7, 0.75, 0.62, '#fff', { mat: wm, shadow: false });
    const q = { g: h, wm, lit: true, tip: 0, tipNow: 0, baseY: y, k: 1 };
    if (o.hut) { q.lm = new THREE.MeshBasicMaterial({ color: hot('#ffd257', 3) }); B(h, 1.5, 1.3, 0.14, 0.14, 0, 0.42, '#1f2a44'); blk(h, 1.5, 1.3, 0.4, 0.4, 0.42, 0.44, '#fff', { mat: q.lm, shadow: false }); B(h, 1.5, 1.3, 0.5, 0.5, 0.86, 0.1, '#1f2a44'); }
    q.light = (on) => { q.lit = on; wm.color.copy(on ? LIT : DARK); if (q.lm) q.lm.color.copy(on ? hot('#ffd257', 3) : DARK); };
    return q; }
  const huts = HUTS.map((three, i) => three.map((p) => { const q = build(g, p, { hut: true }); q.k = i === 2 ? 1.5 : 1; q.g.visible = false; return q; }));
  const tags = plans.map((p, i) => { const t = plate(s, '', [MID[i][0] + (i === 0 ? -0.5 : i === 1 ? -1.5 : -2), MID[i][1] + (i === 2 ? 5.4 : i === 1 ? 3.9 : 4.6), HUTS[i][1][2]], 'pl'); t.el.innerHTML = `${p.icon}<span><b>${esc(p.lines[0])}</b><b>${esc(p.lines[1])}</b></span>`; t.hide = true; return t; });
  const showTags = (on) => tags.forEach((t) => { t.hide = !on; });
  const tip = (q, a, sec = 1) => { const a0 = q.tip; q.tip = a; return tw(sec, (t) => { q.tipNow = lerp(a0, a, ease(t)); q.g.rotation.x = q.tipNow; }); };

  // ---- three small animals to find by tapping: a duck on the meadow, a frog on the bank and a rabbit on the hill ---------------------
  const duck = group(g, 6.4, 0.5, -1.2); B(duck, 0, 0, 0.7, 0.45, 0, 0.36, '#fff8ea'); B(duck, 0.34, 0, 0.34, 0.32, 0.3, 0.34, '#fff8ea'); B(duck, 0.58, 0, 0.2, 0.16, 0.38, 0.1, '#f0a23a', { raw: true }); B(duck, -0.38, 0, 0.16, 0.3, 0.2, 0.2, '#fff8ea');
  const frog = group(g, -4.3, 1.9, -1.6); B(frog, 0, 0, 0.5, 0.5, 0, 0.26, '#3f9a40'); B(frog, 0, 0.14, 0.44, 0.3, 0.2, 0.2, '#4fae47'); for (const x of [-0.14, 0.14]) B(frog, x, 0.24, 0.12, 0.1, 0.4, 0.12, '#fff8ea', { raw: true });
  const rabbit = group(g, 25.8, 5.2, -28.4); B(rabbit, 0, 0, 0.44, 0.6, 0, 0.4, '#c9b79a'); B(rabbit, 0, 0.3, 0.36, 0.34, 0.3, 0.34, '#c9b79a'); for (const x of [-0.1, 0.1]) B(rabbit, x, 0.26, 0.1, 0.1, 0.62, 0.36, '#c9b79a'); B(rabbit, 0, -0.34, 0.18, 0.14, 0.14, 0.18, '#fff8ea', { raw: true });
  const pets = [[frog, croak, 1.9], [duck, quack, 0.5], [rabbit, squeak, 5.2]].map(([m, sound, y]) => { const q = { m, y, up: 0 }; hitBox(s, m, 0, -0.4, 0, 2.6, 2.6, 2.6, () => !s.noPets, () => { sound(); tw(0.5, (t) => { q.up = Math.sin(t * Math.PI) * 0.9; m.rotation.y = t * Math.PI * 2; }); }); return q; });

  // ---- the child's words, drawn in the valley at once -----------------------------------------------------------------------------------
  const asked = [[-13.5, -3.6, 20.4, 10.4, 1.95], [8.5, -9.5, 22, 15, 0.55], [19, -29.5, 26, 4.6, 5.25]].map(([x, z, w, d, y]) => { const m = glowMarks(place(g, x, z, w, d, y, { clear: 0.4 })); if (y > 5) glowMarks(frame(m, 0, -1.65, 2.56, w, 1.6)); m.visible = false; return m; });
  s.words = (list) => asked.forEach((m, i) => { m.visible = list[0] === i; });
  s.wordTapped = (gap, k) => beep(440 + k * 110, 0.08);
  // the three buttons of the look step sit over the top of the picture. They belong to this level, so they are made and taken away here
  const bar = () => document.querySelector('.lookbar'), noBar = () => { const b = bar(); if (b) b.remove(); };
  noBar(); quiet();
  s.asking = () => { noBar(); glide(V0, 1); };

  // ---- Florence's plans appear: three test huts on each place ----------------------------------------------------------------------------
  s.showPlans = async () => { const me = run; asked.forEach((m) => { m.visible = false; }); showRiver(0);
    for (const [i, three] of huts.entries()) { for (const [j, q] of three.entries()) { q.g.visible = true; q.g.scale.setScalar(0.01); beep(330 + i * 70 + j * 25, 0.07); tw(0.4, (t) => q.g.scale.setScalar(Math.max(0.01, back(t) * q.k))); await wait(0.16); if (me !== run) return; } tags[i].hide = false; await wait(0.3); if (me !== run) return; } };

  // ---- the test: one press brings the rain, and the child taps the cloud twice for more. The river climbs the post one stripe each time ----
  const CLOUD = [2, 12.5, -30], heavy = (n, v) => { rain.count = n; rainSound(v); };
  const more = (api) => new Promise((res) => { const me = run; let open = true; api.say([words.moreHow]); const sign = plate(s, words.more, CLOUD, 'tap'), go = () => { if (!open || me !== run) return; open = false; sign.hide = true; rumble(); res(); }; sign.el.onclick = go; hitBox(s, g, CLOUD[0], CLOUD[1] - 5, CLOUD[2], 44, 12, 4, () => open, go); });
  const jump = (m, y0) => tw(0.45, (t) => { m.position.y = y0 + Math.sin(t * Math.PI) * 0.5; });
  s.test = async (api) => { const me = run, gone = () => me !== run; s.spot = () => CLOUD;
    brolly.visible = true; tw(0.6, (t) => brolly.scale.setScalar(Math.max(0.01, back(t)))); tw(3, (t) => { clouds.position.x = 150 * (1 - ease(t)); }); rumble(); await toWeather(0.8, 0, 2.6); if (gone()) return false;
    rain.visible = true; raining = 1; heavy(170, 0.35); riverSound(0.3); api.say([words.rain[0]]); showRiver(0, true); await wait(0.8); await toLevel(STRIPE, 2.4); showRiver(1, true); if (gone()) return false;
    await more(api); if (gone()) return false;
    heavy(340, 0.65); riverSound(0.6); toWeather(0.92, 0, 1.5); await toLevel(2 * STRIPE, 2.4); showRiver(2, true); api.say([words.rain[1]]); if (gone()) return false;
    for (const q of huts[1]) { await wait(0.5); q.light(false); hiss(); } jump(kid, 0.45); await wait(0.7); if (gone()) return false;
    await more(api); if (gone()) return false;
    heavy(NR, 1); riverSound(1); toWeather(1, 0, 1.5); api.say([words.rain[2]]); toLevel(HIGH, 3.4); await wait(0.9); showRiver(3, true);
    for (const q of cols.filter((c) => !c.r)) { fall(q); await wait(0.16); } if (gone()) return false;
    for (const q of cols.filter((c) => c.r && c.i >= 6 && c.i <= 9)) { fall(q, 1.2); await wait(0.3); } await tip(huts[0][1], 0.3, 1.3); jump(kid, 0.45); await wait(1.2); if (gone()) return false;
    raining = 0; rainSound(0, 2.5); riverSound(0.55); showRiver(3); mud.visible = true; tw(3, (t) => { clouds.position.x = -110 * ease(t); }); await toWeather(0.3, 0.75, 2.6); rain.visible = false; await wait(0.4); return !gone(); };
  // The child looks closely at each place. The three buttons stay over the picture, and the card of that place lies under it
  s.look = (seen) => { noBar(); showTags(false); const el = document.createElement('div'); el.className = 'lookbar';
    plans.forEach((p, i) => { const b = document.createElement('button'); b.className = 'btn lookchip'; b.innerHTML = `${p.icon}${esc(p.lines[0])}`; b.onclick = () => { for (const c of el.children) c.classList.toggle('on', c === b); b.classList.add('seen'); beep(500 + i * 90, 0.07); glide(LOOK[i], 1.5); seen(i); }; el.append(b); }); $('view').append(el); };
  s.showResults = () => { noBar(); showTags(true); glide(VCARDS, 1.4); };

  // ---- the play break: the river goes down, and the child chooses places for six homes and the town green, seen from above ------------
  const homes = [], pegs = group(g), flagM = new THREE.MeshLambertMaterial({ color: FLAG[0] }); let green = null, site = 0;
  const talk = plate(s, '', [0, 0, 0], ''), famSign = plate(s, words.family, [0, 0, 0], 'on'); talk.hide = true; famSign.hide = true;
  const kindOf = (q) => SITES[site][q.i][3], happy = (q) => site !== 1 && !!HAPPY[kindOf(q)], saying = (q) => (site === 1 ? words.reactMeadow : words.react)[kindOf(q)];
  // the people of a home stand at its door: the family at theirs, and one or two neighbours at each of the others. They are glad or worried about their place
  function folk(q) { if (q.folk) g.remove(q.folk); const p = SITES[site][q.i], f = group(g, p[0], p[1], p[2]), ok = happy(q), n = homes.indexOf(q); q.folk = f;
    if (q.family) { FAMILY.forEach((o, k) => fig(f, -1.3 + k * 1.15, 0, 1.75 + (k % 2) * 0.3, { ...o, k: o.k * 1.1, sad: !ok, pack: k ? undefined : '#ffd257', arms: ok ? (k === 1 ? ['down', 'up'] : ['up', 'down']) : ['down', 'down'], turn: (k - 1) * 0.25 })); }
    else { fig(f, -1.1, 0, 1.7, { k: 1.3, shirt: SHIRTS[n % 6], skin: FAMILY[n % 3].skin, hair: FAMILY[(n + 1) % 3].hair, long: n % 2 === 0, sad: !ok, arms: ok ? ['up', 'up'] : ['down', 'down'], turn: 0.2 }); if (n % 2) fig(f, 0.2, 0, 1.9, { k: 0.95, shirt: SHIRTS[(n + 3) % 6], skin: FAMILY[(n + 1) % 3].skin, hair: FAMILY[n % 3].hair, sad: !ok, arms: ok ? ['up', 'down'] : ['down', 'down'], turn: -0.2 }); }
    if (kindOf(q) === 'puddle' || kindOf(q) === 'low') B(f, 0.2, 2.1, 1.5, 0.9, 0.02, 0.05, '#7fb7d6', { unlit: true, shadow: false }); }
  let talkN = 0, talkQ = null; const hush = () => { talkN++; talkQ = null; talk.hide = true; };
  const famAt = () => { const q = homes.find((h) => h.family); famSign.hide = !q || q === talkQ; if (q) { const p = SITES[site][q.i]; famSign.pos.set(p[0], p[1] + 3.1, p[2]); } };
  // what the people of a home say stands over the home for a few seconds
  const say = (q) => { const p = SITES[site][q.i], id = ++talkN; talk.el.textContent = saying(q); talk.pos.set(p[0], p[1] + 3.6, p[2]); talk.hide = false; talkQ = q; famAt(); wait(5).then(() => { if (id === talkN) { hush(); if (s.still) famAt(); } }); };
  function addHome(i, family) { const n = homes.length, q = build(g, SITES[site][i], { wall: WALL[(n + i) % 4], roof: family ? '#d2553a' : ROOF[1 + (n + i) % 3], door: family ? '#ffd257' : ['#3f78b5', '#c0562f', '#2e9b5a', '#7a5230'][n % 4] }); q.i = i; q.family = family; homes.push(q);
    q.g.scale.setScalar(0.01); tw(0.45, (t) => q.g.scale.setScalar(Math.max(0.01, back(t)))); folk(q); q.folk.scale.setScalar(0.01); tw(0.5, (t) => q.folk.scale.setScalar(Math.max(0.01, back(t)))); (happy(q) ? chime : () => beep(240, 0.2, 'sine'))(); say(q); famAt(); return q; }
  function addGreen(i) { const p = SITES[site][i], t = group(g, p[0], p[1], p[2]); B(t, 0, 0, 3.3, 3.3, 0, 0.08, '#e6d3a1'); B(t, 0, 0, 3, 3, 0, 0.16, '#58b24a', { tex: 'grass' }); B(t, -0.9, 0.7, 0.2, 0.2, 0, 4, '#f6f1e2'); blk(t, 0, 0.7, 1.7, 0.1, 2.85, 1.1, '#fff', { mat: flagM }); B(t, 0.9, -0.7, 0.3, 0.3, 0, 1, '#7a5230', { tex: 'bark' }); B(t, 0.9, -0.7, 1.5, 1.5, 0.9, 1.2, '#4fae47', { tex: 'leaf' }); B(t, 0.6, 1, 1.2, 0.36, 0.16, 0.3, '#a87645');
    green = { g: t, i }; t.scale.setScalar(0.01); tw(0.45, (k) => t.scale.setScalar(Math.max(0.01, back(k)))); }
  // the homes, their people and the green move to the same numbered places on another kind of land
  function moveTo(pick) { site = pick; for (const q of homes) { const p = SITES[pick][q.i]; q.g.position.set(p[0], p[1], p[2]); q.g.rotation.set(0, 0, 0); q.tip = 0; q.tipNow = 0; folk(q); } if (green) { const p = SITES[pick][green.i]; green.g.position.set(p[0], p[1], p[2]); } pegs.visible = false; hush(); famSign.hide = true; }
  const clearHuts = () => { showTags(false); huts.flat().forEach((q) => tw(0.5, (t) => { q.g.scale.setScalar(Math.max(0.01, (1 - ease(t)) * q.k)); if (t >= 1) q.g.visible = false; })); };
  s.playBreak = async (pick, api) => { const me = run; site = pick; noBar(); clearHuts(); api.say([words.goesDown]); glide(V0, 1.4); toWeather(0.08, 1, 3.4); riverSound(0.2, 3.5); await toLevel(0, 3.6); if (me !== run) return; brolly.visible = false; await wait(0.9); s.still = true; await glide(PLAN[pick], 2.6); if (me !== run) return;
    const P = SITES[pick], used = new Map(), marks = P.map(([x, y, z]) => glowMarks(place(g, x, z, 2.7, 2.7, y + 0.02))), N = { home: NHOMES, green: 1 }; let tool = 'home', flag = 0, done = false, open = true;
    const sign = plate(s, words.line, pick === 0 ? [-13.5, HIGH, -9.9] : [pick === 1 ? 6.3 : 17, HIGH, -17.2], 'line'); s.lineSign = sign; s.closeBreak = () => { open = false; marks.forEach((m) => { m.visible = false; }); };
    const tok = {}, mk = (k) => { const b = document.createElement('button'); b.onclick = () => { if (N[k] && open) { tool = k; draw(); } }; tok[k] = b; return b; }, sw = document.createElement('div');
    sw.innerHTML = `<div class="sws-h">${esc(words.flag)}</div><div class="sws">${FLAG.map((c, k) => `<button class="sw" data-c="${k}" style="background:${c}" aria-label="${esc(words.flag)} ${k + 1}"></button>`).join('')}</div>`;
    sw.onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; flag = +b.dataset.c; flagM.color.set(FLAG[flag]); beep(700, 0.06); draw(); };
    const tray = [mk('home'), mk('green'), sw];
    function draw() { if (!N[tool]) tool = N.home ? 'home' : 'green'; for (const k of ['home', 'green']) { tok[k].className = `tok mini land${tool === k && N[k] ? ' on' : !N[k] ? ' used' : ''}`; tok[k].innerHTML = `${I[k]}<span>${esc(words[k])}<small>${esc(N[k] ? words.left(N[k]) : words.placed)}</small></span>`; }
      for (const b of sw.querySelectorAll('.sw')) b.classList.toggle('on', +b.dataset.c === flag); marks.forEach((m, i) => { m.visible = open && !used.has(i) && (N.home + N.green > 0); });
      const all = !N.home && !N.green; if (all && !done) { done = true; chime(); api.done(words.doneBreak); } else if (!all) { if (done) { done = false; api.tray(tray); } api.say([tool === 'green' ? words.how[2] : homes.some((h) => h.family) ? words.how[1] : words.how[0]]); } }
    api.tray(tray); draw();
    // a tap on a home that has been placed takes it back, so that the child can put it somewhere else
    const takeBack = (q) => { const k = homes.indexOf(q); if (k < 0) return; homes.splice(k, 1); g.remove(q.g); g.remove(q.folk); used.delete(q.i); N.home++; tool = 'home'; hush(); beep(300, 0.1); famAt(); draw(); };
    P.forEach(([x, y, z], i) => hitBox(s, g, x, y, z, 3.3, 2.6, 3.3, () => open && (used.has(i) ? used.get(i) !== 'green' : N[tool] > 0), () => { if (used.has(i)) return takeBack(used.get(i));
      if (tool === 'home') { N.home--; const q = addHome(i, !homes.some((h) => h.family)); used.set(i, q); for (const [dx, dz] of [[-1.45, -1.4], [1.45, -1.4], [-1.45, 1.4], [1.45, 1.4]]) B(pegs, x + dx, z + dz, 0.16, 0.16, y, 0.5, '#e0503a', { raw: true }); }
      else { N.green--; used.set(i, 'green'); addGreen(i); chime(); } draw(); }));
    s.spot = (name, i) => [P[i][0], P[i][1] + 0.3, P[i][2]]; };

  // ---- the town, seen from close by. The family now stands at its own home ---------------------------------------------------------------
  const wet = (q) => SITES[site][q.i][1] < HIGH;
  // Florence's sentence about the town. If the child left homes at the foot of the hill, below the line of mud, she says so
  s.afterFor = (i) => (i === 2 && homes.some(wet) ? words.afterHillLow : AFTER[i]);
  function settle(pick) { if (s.closeBreak) s.closeBreak(); if (s.lineSign) s.lineSign.hide = true; hush(); famSign.hide = true; s.still = false; kid.visible = mum.visible = dad.visible = false; brolly.visible = false; homes.forEach((q) => { q.light(true); q.folk.visible = true; }); }
  s.town = async (pick) => { const me = run; settle(pick); toWeather(0.05, 1, 1.5); await glide(TOWN[pick], 2.6); if (me !== run) return; chime(); famAt(); };
  // "Try another plan": the same homes stand on the other land, and the rain falls on them
  let swapN = 0;
  s.swap = (pick) => { const id = ++swapN, me = run, off = () => id !== swapN || me !== run; moveTo(pick); settle(pick); setLevel(0); raining = 0; rain.visible = false; glide(TOWN[pick], 1.4);
    (async () => { clouds.position.x = 60; await toWeather(0.9, 0.2, 1.2); if (off()) return; homes.forEach((q) => { q.folk.visible = false; }); famSign.hide = true; rain.visible = true; rain.count = NR; raining = 1; rainSound(0.9, 0.8); riverSound(0.9, 2); toLevel(HIGH, 3.6); await wait(2.2); if (off()) return;
      for (const q of homes.filter(wet)) { q.light(false); hiss(); await wait(0.15); if (off()) return; } await wait(1.2); if (off()) return;
      if (pick === 0) { for (const q of cols.filter((c) => !c.gone && c.r)) { fall(q); await wait(0.12); } if (off()) return; const front = homes.filter((q) => kindOf(q) === 'edge'); for (const q of front) tip(q, 0.26, 0.9); await wait(1); if (off()) return; }
      await wait(0.8); if (off()) return; raining = 0; rainSound(0, 2); riverSound(0.5); tw(2, (t) => { clouds.position.x = 60 - 170 * ease(t); }); await toWeather(0.2, 0.9, 1.8); if (off()) return; rain.visible = false; homes.filter((q) => !wet(q)).forEach((q) => { q.folk.visible = true; }); famAt(); })(); };
  // the river goes back down, and the people come out again
  const calm = (sec) => { swapN++; raining = 0; rain.visible = false; rainSound(0, 1); riverSound(0.2, 2); toLevel(0, sec); toWeather(0.05, 1, sec); homes.forEach((q) => { q.folk.visible = true; q.light(true); }); };

  // ---- the recap: a tap on the place that stayed dry. Any answer goes on ----------------------------------------------------------------
  s.recap = (answer) => { s.noPets = true; famSign.hide = true; calm(1.4); glide(V0, 1.6); let open = true; const signs = [];
    s.spot = (name, i) => [MID[i][0], MID[i][1] + 1, MID[i][2]];
    MID.forEach(([x, y, z], i) => { const go = () => { if (!open) return; open = false; for (const q of signs) q.hide = true; beep(i === 2 ? 880 : 300, 0.15); if (i === 2) chime(); answer(i === 2); }, pl = plate(s, words.here, [x, y + (i === 2 ? 6 : i === 1 ? 2.8 : 5), z], 'tap'); signs.push(pl); pl.el.onclick = go;
      hitBox(s, g, x, y - 1, z, i === 2 ? 30 : 22, 7, i === 2 ? 16 : 13, () => open, go); }); };
  s.evening = () => { calm(2); famAt(); const v = TOWN[site]; glide({ eye: [v.eye[0] + 2.5, v.eye[1] - 1.2, v.eye[2] - 2.5], at: v.at, fov: v.fov - 6 }, 4); };

  // ---- every picture ------------------------------------------------------------------------------------------------------------------------
  s.tick = (t, dt) => {
    for (const r of rip) { r.x += r.v * dt * (1 + level * 1.6); if (r.x > 72) r.x = -72; r.m.position.set(r.x, level + 0.03 + Math.sin(t * 2 + r.z) * 0.02, r.z); }
    if (rain.visible) { for (let k = 0; k < NR; k++) { const d = drop[k]; d[1] -= d[3] * dt; if (d[1] < -1) d[1] = raining ? 27 : -60; m4.makeTranslation(d[0], d[1], d[2]); rain.setMatrixAt(k, m4); } rain.instanceMatrix.needsUpdate = true; rainM.opacity = 0.62 * Math.min(1, W.k * 1.2); }
    if (kid.visible) { mum.head.rotation.y = 0.5 + Math.sin(t * 0.6) * 0.25; dad.head.rotation.y = -0.4 + Math.sin(t * 0.5 + 1) * 0.25; }
    for (const three of huts) for (const q of three) if (q.lit && q.lm) q.lm.color.copy(hot('#ffd257', 2.7 + Math.sin(t * 7 + q.g.position.x) * 0.35));
    for (const q of huts.flat()) q.g.position.y = q.baseY - q.tipNow * 1.1;                        // a hut that tips also sinks a little
    for (const q of homes) { q.g.position.y = SITES[site][q.i][1] - q.tipNow * 1.1; if (q.folk.visible) q.folk.children.forEach((f, k) => { if (f.head) f.position.y = Math.abs(Math.sin(t * 2.2 + k + q.i)) * (happy(q) ? 0.09 : 0.015); }); }
    pets.forEach((q, k) => { q.m.position.y = Math.max(q.y, k === 1 ? level - 0.12 : -9) + q.up; }); duck.position.x = 6.4 + Math.sin(t * 0.4) * 1.6;
    far.position.x = Math.sin(t * 0.05) * 6; };
  return s; }

// ---- 4. hand it all to the kit ---------------------------------------------------------------------------------------------------------
runLevel({ place: { number: 1, town: 'Eco Town', level: 'Land' }, words, plans, results, evidence: river.el, scene: valley,
  after: (i, s) => s.afterFor(i),
  ends: (pick, s) => [{ step: 'Evening in the valley', say: [words.end], go: () => s.evening() }] });
