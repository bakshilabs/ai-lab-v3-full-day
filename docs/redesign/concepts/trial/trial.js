// A playable trial of one level, Homes, rebuilt by the design agent (owner, 23 Nov 2026: "redesign and rebuild the trial
// level and activity", with full freedom). One idea runs through the whole level: a home stays warm in winter if the low
// sun can reach it. The street has a sunny side and a shady side. The words the child chooses (which side, and thick or
// thin walls) are drawn in the town at once and change what the test shows. The play break builds the chosen home on the
// family's plot, and the windows the child puts on the sunny wall let the sun in. Nobody can fail, and there is no score.
// It is ONE place from start to finish: the camera glides from the street to the plot and back.
// The look follows car town: a low camera, one vanishing point (the school), large shapes near the camera, pale
// see-through sheets across the distance, a close palette with a few bright accents, and soft light.
// Every word below is a placeholder written for this trial. Nothing here is part of the game.
import { THREE, blk, group, hash, soft, fig, SKIN, HAIR, frame, place } from '../kit-v2.js';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// ---- the words of the trial (placeholders) -----------------------------------------------------------------------------
const T = { level: 'A warm home for winter',
  job: ['Winter is coming, and your family needs a home.', 'The low winter sun warms one side of the street. The other side is in shade all day.'], start: 'Start',
  askT: 'Your sentence', askHow: 'Tap a word for each gap. Then ask Florence to suggest plans.', ask: 'Ask Florence',
  sentence: ['Florence, please suggest homes that stay warm in winter. Build them on', ['the sunny side', 'the shady side'], 'of the street, with', ['more insulation', 'less insulation'], '.'],
  plansSay: (a, b) => [`Here are three plans, built on ${a} with ${b}.`, 'Press the button to test them on a cold winter night.'], test: 'Bring the winter night', watch: 'Watch where the materials are made. Then watch the homes in the cold night.',
  choose: 'A sun means warm, and a snowflake means cold. Which plan will you use?', feel: { g: '\u2600 Warm', f: '\u2601 A little cold', p: '\u2744 Cold' }, works: ['Sawmill', 'Brick kiln'], short: ['Timber, front', 'Timber, roof', 'Brick, front'], making: 'Making the materials', nightStep: 'The winter night',
  item: { frame: 'Frame', ins: 'Insulation', panel: 'Walls', win: 'Window', rbeam: 'Roof beams', rins: 'Roof insulation', rcover: 'Roof', door: 'Door' },
  bp: { frame: 'Tap a yellow place to put up the frame of a wall.', ins: 'Tap a framed wall to fill it with insulation.', panel: 'Tap a wall to close it in.', win: 'Tap a yellow place to put in a window.', rbeam: 'Tap the yellow place to lay the roof beams.', rins: 'Tap the yellow place to lay insulation on the roof.', rcover: 'Tap the yellow place to lower the roof.', door: 'Choose a colour for the door. Then tap the yellow place.' },
  insMore: 'You asked for more insulation, so the layer is thick. It keeps the heat in.', insLess: 'You asked for less insulation, so the layer is thin. Some heat gets out.', again: 'Ask again', use: 'Use this plan',
  plans: [['Timber home, front windows', 'Wood from the town forest. Big windows in the front wall.'], ['Timber home, roof windows', 'Wood from the town forest. Big windows in the roof.'], ['Brick home, front windows', 'Clay bricks, baked hard. Big windows in the front wall.']], oldPlans: [['Timber home', 'Wood from the town forest, cut in a sawmill that runs on sunshine.'], ['Brick home', 'Clay bricks, baked hard in a hot oven.'], ['Concrete home', 'Cement, made in a very hot kiln.']],
  checks: ['Staying warm', 'Clean air'], warm: { g: 'It stays warm all night.', f: 'It gets a little cold by morning.', p: 'It is cold inside all night.' }, tag: { g: 'Warm', f: 'A little cold', p: 'Cold' },
  air: ['Making the wood adds no pollution.', 'Making the wood adds no pollution.', 'Baking the bricks adds some pollution.', 'Making the cement adds a lot of pollution.'],
  build: 'Build the home', buildHow: 'The front wall is see-through, so that you can look inside. Choose a thing, then tap a yellow place.', winMove: 'To move a window, tap it to take it out. Then tap another yellow place.', bedT: 'Bed', tableT: 'Table', sofaT: 'Sofa', last: 'Goes on last', sunThings: (a) => `The ${a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]} are` : `${a[0]} is`} in the winter sun.`, win2: 'You have two windows. Tap a yellow place in a wall to put one in.', win1: 'You have one more window. Tap a yellow place to put it in.', roof: 'Everything is inside. Tap the yellow place to lower the roof.', shadyWin: 'The walls on this side are in shade, but the sun reaches the roof. A window in the roof lets it in.', door: 'Choose a colour for the door. Then tap the yellow place.',
  sunIn: 'The winter sun shines in through this window.', noSun: 'This wall is in shade, so no sun comes in here. To move it, choose Window and tap it.', shade: 'No wall on this side of the street gets the winter sun.',
  ready: ['Now the roof lifts, so that you can look inside.', 'One window catches the sun. Now the roof lifts, so that you can look inside.', 'Both windows catch the sun. Now the roof lifts, so that you can look inside.'],
  window: 'Window', roofT: 'Roof', doorT: 'Door', left: (n) => `${n} left`, placed: 'In place', colour: 'Door colour', family: 'Your family', plot: 'Your plot', yours: 'Your home', next: 'Next',
  town: 'Build the street', homes: ['Timber, front windows', 'Timber, roof windows', 'Brick, front windows'], afterAir: ['Making the wood added no pollution.', 'Making the wood added no pollution.', 'Baking the bricks added some pollution.', 'Making the cement added a lot of pollution.'],
  afterWarm: { g: 'The homes stay warm at night.', f: 'The homes get a little cold by morning.', p: 'The homes are cold at night.' }, built: 'The street is built with the plan you chose.',
  tryOther: 'Try another plan', chooseOther: 'Choose a different plan to see it in the town.', first: 'Your first plan', what: 'What changed?', keepFirst: 'Go back to my first plan', keepThis: 'Keep this plan',
  insideT: 'Make it a home', inside: ['The pale patches on the floor are where the sun comes in.', 'No sun comes in through these windows, so the floor has no patch of sun.'],
  putAsk: ['Where does the bed go? Tap a yellow place.', 'Where does the table go? Tap a yellow place.', 'Where does the sofa go? Tap a yellow place.', 'Where does the rug go? Tap a yellow place.', 'Where does the plant go? Tap a yellow place.'],
  inSun: ['The bed is in the sun. It will be warm to wake up in.', 'The table is in the sun. Breakfast will be bright.', 'The sofa is in the sun. It is a warm place to read.', 'The rug is in the sun. It is warm under bare feet.', 'The plant is in the sun. It will grow well.'], inRoom: ['The bed is in place.', 'The table is in place.', 'The sofa is in place.', 'The rug is in place.', 'The plant is in place.'], rugT: 'Rug', plantT: 'Plant', streetHow: 'Now the rest of the street. Tap each yellow plot to build a home there.', rest: 'Build the rest', benchGap: 'The bench is in the one sunny corner, where the sun comes past the wood.', homeDone: 'The home is built, and your family is moving in.',
  lookT: 'Look at each home', look: 'The night has come. Tap each home to look at it closely.', showAll: 'Show all three',
  gardenT: 'Make the garden', gardenHow: 'Now the garden. Choose a thing, then tap a yellow place.', firT: 'Fir tree', benchT: 'Bench', bikesT: 'Bikes', gPut: ['Where does the fir tree go? Tap a yellow place.', 'Where does the bench go? Tap a yellow place.', 'Where do the bikes go? Tap a yellow place.'],
  firShade: 'The fir tree stands in front of a window, so the sun cannot get in there. To move it, press Fir tree.', firOk: 'The fir tree is planted, and the windows still get their sun.', benchSun: 'The bench is in the winter sun. It is a warm place to sit.', benchShade: 'The bench is in the shade of the wood.', bikesOk: 'The bikes are ready for the ride to school.', gardenDone: 'The garden is ready. To move a thing, press its button.',
  visit: 'Visit your home', homeT: 'Your family at home', insideNight: { g: 'Inside, your family is warm, and the lights glow.', f: 'Inside, it is a little cold, so your family wear their jumpers.', p: 'Inside, it is cold, so your family wrap up in blankets.' },
  nightT: 'The first winter night', nightSay: { g: 'Snow is falling, and every home in your street glows warm.', f: 'Snow is falling. The homes in your street are a little cold tonight.', p: 'Snow is falling. The homes in your street are cold tonight.' }, recapT: 'One more question', recapQ: 'Which side of the street does the winter sun warm? Tap that side.', thisSide: 'This side', sunSide: 'The sunny side', recapYes: 'Yes. The low winter sun reaches this side, so homes here stay warmer.', recapNo: 'The winter sun shines on this side. The tall trees keep the other side in shade.',
  end: 'This is the end of the trial level. Thank you for playing.', replay: 'Play again' };

// ---- colours and blocks ---------------------------------------------------------------------------------------------------
const SKY = '#cfe6f2', SHEET = '#e3f0f6', NO = { shadow: false }, c0 = new THREE.Color(), hsl = {};
const tone = (hex) => { c0.set(hex).getHSL(hsl, THREE.SRGBColorSpace); return '#' + c0.setHSL(hsl.h, hsl.s * 0.74, 0.66 + (hsl.l - 0.66) * 0.7, THREE.SRGBColorSpace).getHexString(); };
const mats = new Map(), FARX = -34;
// far things (x beyond FARX) are flat and unlit, as in car town. o.wx is the place in the world of something built in a group.
const M = (hex, x, o = {}) => { const unlit = o.unlit || x < FARX, col = o.raw ? hex : tone(hex), k = col + (unlit ? 'u' : 'l') + (o.op || ''); if (!mats.has(k)) { const m = unlit ? new THREE.MeshBasicMaterial({ color: col }) : new THREE.MeshLambertMaterial({ color: col }); if (o.op) { m.transparent = true; m.opacity = o.op; m.depthWrite = false; } mats.set(k, m); } return mats.get(k); };
const B = (g, x, z, w, d, y, h, hex, o = {}) => blk(g, x, z, w, d, y, h, hex, { shadow: o.shadow !== false && !o.op, mat: o.mat || M(hex, o.wx ?? x, o) });
const WALL = ['#ecd9b4', '#e4cfa6', '#f0e0c0', '#dcc69c'], ROOF = ['#c8643f', '#3f78b5', '#2e9b5a', '#e0a23a'], LEAF = ['#77c765', '#84d072', '#6cbd5b'], GRASS = ['#8fcf73', '#93d277', '#8bcb6f'], DOOR = ['#7a5a33', '#3f78b5', '#c8643f', '#2e9b5a'];
const PM = [0, 0, 1], MAT = [{ wall: '#d8b482', line: '#c29a66' }, { wall: '#c77b5e', line: '#b0654b' }, { wall: '#cdccc6', line: '#b6b5ae' }], LINING = '#f2d98a';
const GLASS = '#a9d3ee', LIT = '#ffe27a', WARM = { g: '#ffe27a', f: '#d9bd8e', p: '#86a6d4' }, glassMat = () => new THREE.MeshBasicMaterial({ color: GLASS });
const SH = ['#3f78b5', '#8a5fc2', '#2e9b5a', '#e0a23a', '#16a3a3', '#c98a5a'];
// A low home in a group of its own. Its front looks towards +z. o: wx (where it stands), mat, glass, roofC, door, thick.
function house(parent, o = {}) { const g = group(parent), w = o.w || 7.3, d = o.d || 7, h = o.h || 4.9, m = o.mat, X = { wx: o.wx, raw: !!m };
  B(g, 0, 0, w, d, 0, h, m ? m.wall : WALL[(o.k || 0) % 4], X); if (m) for (const y of [1.2, 2.4, 3.6]) { B(g, 0, d / 2, w, 0.04, y, 0.07, m.line, { ...X, shadow: false }); for (const sx of [-1, 1]) B(g, sx * w / 2, 0, 0.04, d, y, 0.07, m.line, { ...X, shadow: false }); }
  if (o.thick) B(g, 0, 0, w + 0.06, d + 0.06, h - 0.5, 0.5, LINING, { wx: o.wx, raw: true });
  const rc = o.roofC || ROOF[(o.k || 0) % 4]; B(g, 0, 0, w + 0.6, d + 1, h, 0.55, rc, { wx: o.wx }); B(g, 0, 0, w + 0.6, d * 0.45, h + 0.55, 0.5, rc, { wx: o.wx });
  B(g, w * 0.3, d / 2 + 0.03, 1.25, 0.08, 0, 2.5, o.door || DOOR[((o.k || 0) + 1) % 4], { wx: o.wx, shadow: false });
  const G = { unlit: true, raw: true, shadow: false, mat: o.glass }; for (const [a, y] of [[-w * 0.3, 1.0], [0, 1.0], [-w * 0.3, 3.0], [0, 3.0], [w * 0.3, 3.0]]) B(g, a, d / 2 + 0.05, 1.25, 0.06, y, 1.25, GLASS, G);
  for (const sx of [-1, 1]) for (const [b, y] of [[-1.6, 1.0], [1.6, 1.0], [0, 3.0]]) B(g, sx * (w / 2 + 0.05), b, 0.06, 1.25, y, 1.25, GLASS, G); return g; }
function tree(g, x, z, k = 1, op) { B(g, x, z, 0.4 * k, 0.4 * k, 0, 4.6 * k, '#8a6a44'); B(g, x, z, 2.8 * k, 2.8 * k, 4.4 * k, 2.3 * k, LEAF[Math.floor(hash(x, z) * 3)], { op, unlit: true, raw: true }); B(g, x + 0.1, z - 0.1, 1.8 * k, 1.8 * k, 6.7 * k, 1.2 * k, LEAF[1], { op, unlit: true, raw: true }); }
const lamp = (g, x, z) => { B(g, x, z, 0.18, 0.18, 0, 4.4, '#2b3a55'); B(g, x, z, 0.55, 0.55, 4.4, 0.45, '#ffe9a0', { unlit: true, raw: true }); };
function fam(g, t) { fig(g, 0, 0.06, 0, { k: 1.25, shirt: '#e0503a', legs: '#2b3a55', skin: SKIN[0], hair: HAIR[1], cap: '#3f78b5', pack: '#ffd257', turn: t, arms: ['up', 'down'] });
  fig(g, -Math.sin(t) * 0.9 + Math.cos(t) * 1.3, 0.06, -Math.cos(t) * 0.9 - Math.sin(t) * 1.3, { k: 1.62, shirt: '#8a5fc2', legs: '#2b3a55', skin: SKIN[3], hair: HAIR[4], long: true, turn: t - 0.2 });
  fig(g, -Math.sin(t) * 0.9 - Math.cos(t) * 1.3, 0.06, -Math.cos(t) * 0.9 + Math.sin(t) * 1.3, { k: 1.68, shirt: '#2e9b5a', legs: '#4a556e', skin: SKIN[0], hair: HAIR[0], turn: t + 0.3, arms: ['down', 'up'] }); }
// a small sound for a tap, a part going in and the end of a step. It starts only after the first tap.
let AC = null; const beep = (f = 520, d = 0.09, type = 'triangle', v = 0.08) => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), a = AC.createGain(); o.type = type; o.frequency.value = f; a.gain.setValueAtTime(v, AC.currentTime); a.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + d); o.connect(a).connect(AC.destination); o.start(); o.stop(AC.currentTime + d); } catch (e) { /* no sound */ } };
const chime = () => [660, 880, 1100].forEach((f, k) => setTimeout(() => beep(f, 0.16), k * 110));
document.addEventListener('click', (e) => { if (e.target.closest('button')) beep(440, 0.06); });

// ---- the stage ------------------------------------------------------------------------------------------------------------
const view = $('view'), canvas = $('c'), QS = new URLSearchParams(location.search), SPEED = +QS.get('speed') || 1;   // ?speed=6 plays the animations faster, for checking only
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.BasicShadowMap;
const cam = new THREE.PerspectiveCamera(30, 2, 1, 400);
let cur = null, tws = [], run = 0;
function newScene(half, o = {}) { const scene = new THREE.Scene(), hemi = new THREE.HemisphereLight('#fff6e8', '#cfc6b0', 1.5), sun = new THREE.DirectionalLight('#ffe9c4', 1.7);
  scene.add(hemi); sun.position.set(...(o.sun || [-16, 30, 18])); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half * 0.75, bottom: -half * 0.75, near: 1, far: 160 }); sun.shadow.bias = -0.002; sun.shadow.normalBias = 0.09; scene.add(sun);
  scene.background = new THREE.Color(SKY); return { scene, hemi, sun, g: group(scene), picks: [], plates: [], minAspect: 1.9 }; }
let swayT = 0; const sw = () => (cur && cur.still ? 0 : 1); const NIGHTLEAF = new THREE.Color('#1f3d3c');
const dimLeaves = (k) => { for (const m of mats.values()) if (m.isMeshBasicMaterial) { if (!m.userData.c) { m.userData.c = m.color.clone(); m.userData.leaf = m.color.g > m.color.r * 1.08 && m.color.g > m.color.b * 1.08; } if (m.userData.leaf) m.color.copy(m.userData.c).lerp(NIGHTLEAF, k); } };
function fit() { if (!cur) return; const f = cur.fov * Math.PI / 180; cam.fov = cam.aspect >= cur.minAspect ? cur.fov : 2 * Math.atan(Math.tan(f / 2) * cur.minAspect / cam.aspect) * 180 / Math.PI; cam.position.set(cur.eye[0] + Math.sin(swayT * 0.31) * 0.16 * sw(), cur.eye[1] + Math.sin(swayT * 0.23 + 1) * 0.09 * sw(), cur.eye[2] + Math.cos(swayT * 0.27) * 0.16 * sw()); cam.lookAt(cur.at[0], cur.at[1] - (view.clientHeight < 560 ? cur.drop || 0 : 0), cur.at[2]); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); }
// the camera glides from one view of the same place to another
let glideN = 0; const glide = (to, sec = 1.6) => { const id = ++glideN, a = { eye: [...cur.eye], at: [...cur.at], fov: cur.fov, drop: cur.drop || 0 }, mix = (p, q, k) => p.map((v, i) => v + (q[i] - v) * k); return tw(sec, (k) => { if (id !== glideN) return; const e = ease(k); cur.eye = mix(a.eye, to.eye, e); cur.at = mix(a.at, to.at, e); cur.fov = a.fov + (to.fov - a.fov) * e; cur.drop = a.drop + ((to.drop || 0) - a.drop) * e; fit(); }); };
function resize() { const w = view.clientWidth, h = view.clientHeight; if (!w || !h) return; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setSize(w, h, false); cam.aspect = w / h; fit(); }
new ResizeObserver(resize).observe(view);
function setScene(s) { run++; tws = []; cur = s; hover = null; view.classList.remove('can'); $('plates').innerHTML = ''; for (const p of s.plates) $('plates').append(p.el); fit(); return s; }
function plate(s, text, pos, cls = '') { const el = document.createElement('i'); el.className = `plate ${cls}`; el.textContent = text; const p = { el, pos: new THREE.Vector3(...pos) }; s.plates.push(p); if (s === cur) $('plates').append(el); return p; }
// a change over time: fn is given a share from 0 to 1. It stops quietly when the scene changes.
const tw = (sec, fn) => new Promise((res) => tws.push({ t0: performance.now(), d: sec * 1000 / SPEED, fn, res }));
const wait = (sec) => tw(sec, () => {});
const ease = (t) => t * t * (3 - 2 * t), back = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
// tapping things in the town
const ray = new THREE.Raycaster(), v2 = new THREE.Vector2(); let hover = null;
function pickAt(e) { if (!cur) return null; const r = canvas.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, cam);
  let best = null, bd = Infinity; for (const p of cur.picks) { if (!p.can()) continue; const hit = ray.intersectObject(p.mesh, false)[0]; if (hit && hit.distance < bd) { bd = hit.distance; best = p; } } return best; }
canvas.addEventListener('pointermove', (e) => { hover = pickAt(e); view.classList.toggle('can', !!hover); });
canvas.addEventListener('pointerleave', () => { hover = null; view.classList.remove('can'); });
canvas.addEventListener('click', (e) => { const p = pickAt(e); if (p) p.on(); });
const hitBox = (s, parent, x, y, z, w, h, d, can, on) => { const mesh = blk(parent, x, z, w, d, y, h, '#fff', { shadow: false, mat: HID }); const p = { mesh, can, on }; s.picks.push(p); return p; };
const HID = new THREE.MeshBasicMaterial({ visible: false });
let last = performance.now(), frames = 0, fpsT = last;
function loop(now) { requestAnimationFrame(loop); const dt = Math.min(0.1, (now - last) / 1000); last = now; if (!cur) return;
  for (const t of [...tws]) { const k = Math.min(1, (now - t.t0) / t.d); t.fn(k); if (k >= 1) { tws.splice(tws.indexOf(t), 1); t.res(); } }
  if (cur.tick) cur.tick(now / 1000, dt); swayT += dt; fit(); renderer.render(cur.scene, cam);
  const w = view.clientWidth, h = view.clientHeight; for (const p of cur.plates) { const v = p.pos.clone().project(cam); p.el.style.left = `${(v.x + 1) / 2 * w}px`; p.el.style.top = `${(1 - v.y) / 2 * h}px`; p.el.style.display = v.z < 1 && !p.hide ? '' : 'none'; }
  if (QS.has('fps')) { frames++; if (now - fpsT > 1000) { $('fps').hidden = false; $('fps').textContent = `${Math.round(frames * 1000 / (now - fpsT))} pictures each second`; frames = 0; fpsT = now; } } }

// ---- the place: one street, used for the whole level -----------------------------------------------------------------------
// Side 0 is the sunny side (on the right of the picture) and side 1 the shady side (on the left, under the wood).
const SIDEZ = [-12.7, 12.7], PX = [1, -10, -18, -26, -34], VIEW = { street: { eye: [19, 5, 4.6], at: [-10, 3, 0], fov: 33 }, plans: [{ eye: [-13, 6.6, 14.5], at: [-18.5, 2.3, -12.7], fov: 48, drop: 1.7 }, { eye: [-23, 6.6, -14.5], at: [-17.5, 2.3, 12.7], fov: 48, drop: 1.7 }], build: [{ eye: [14, 9.5, 1.5], at: [1.5, 2.6, -11.6], fov: 36 }, { eye: [14, 9.5, -1.5], at: [1.5, 2.6, 11.6], fov: 36 }], garden: [{ eye: [18, 7.4, 1], at: [1, 0.6, -8.4], fov: 36 }, { eye: [18, 8, -1], at: [1, 0.6, 8.4], fov: 36 }], hero: [{ eye: [14.5, 4.6, -0.5], at: [0.5, 3.1, -10.2], fov: 33 }, { eye: [15, 9.6, 0], at: [0.5, 3.8, 10.4], fov: 33 }] };
const HW = 10, HD = 8, HH = 5.2, FRONT = [-3, 0.2], GABLE = [-1.9, 1.9], DOORX = 3.4;
function town() { const s = newScene(46, { sun: [-10, 36, 48] }), g = s.g; Object.assign(s, VIEW.street, { eye: [...VIEW.street.eye], at: [...VIEW.street.at], minAspect: 1.9 });
  const sunDir = new THREE.Vector3(-10, 36, 48).normalize();
  for (let x = -104; x <= 24; x += 8) for (let z = -40; z <= 40; z += 8) B(g, x + 4, z + 4, 8, 8, -1.6, 1.6, GRASS[Math.floor(hash(x, z) * 3)]);
  B(g, -40, 0, 128, 5.2, 0, 0.07, '#f3e9d2', NO); for (const z of [-2.75, 2.75]) B(g, -40, z, 128, 0.3, 0, 0.11, '#d9cdb2', NO); for (let x = -100; x < 22; x += 4) B(g, x, 0, 0.12, 5.2, 0.07, 0.02, '#e2d6bb', NO);
  // the wood behind the shady side: tall, dark and close to the camera. It keeps that side of the street in shade.
  for (let k = 0; k < 13; k++) { const x = 16 - k * 7, hh = 11 + hash(k, 3) * 4; B(g, x, 23.5, 7.2, 6, 0, hh, ['#4f8a5a', '#58935f', '#4a8456'][k % 3]); B(g, x + 0.6, 22.6, 4.4, 4.4, hh, 2.2, '#58935f'); }
  for (const x of [8, -6, -20]) { B(g, x, 19.6, 0.6, 0.6, 0, 5, '#6f5a44'); B(g, x, 19.6, 4.4, 4.4, 4.2, 4.6, '#4f8a5a'); }
  // trees and lamps along the path lead the eye to the school
  const avenue = [], glow = []; for (let k = 0; k < 9; k++) { const x = -6 - k * 8; for (const z of [-7.2, 7.2]) { const tg = group(g), lg = group(g), sd = z > 0 ? 1 : 0; tree(tg, x, z, 1.55); lamp(lg, x - 4, sd ? 3.4 : -3.4); for (const [w, y, h, o] of [[1.7, 3.9, 1.5, 0.3], [4.6, 0.14, 0.05, 0.22]]) { const m = blk(lg, x - 4, sd ? 3.4 : -3.4, w, w, y, h, '#ffe27a', { shadow: false, mat: soft('#ffe27a', o) }); m.visible = false; glow.push(m); } avenue.push({ o: tg, x, sd, tree: true }, { o: lg, x: x - 4, sd }); } }
  // for the test, the trees in front of the three sample homes and the lamps beside them step aside, so that the windows and the air can be seen
  const clearView = (on) => { for (const a of avenue) a.o.visible = !(on && a.x > -42 && a.x < 8); };
  // the far end of the street is already built, and the school closes the view
  const far = [[], []]; [-42, -50, -58, -66].forEach((x, k) => SIDEZ.forEach((z, sd) => { const h = far[sd][k] = house(g, { wx: x, k: k + sd * 2 }); h.position.set(x, 0, z); h.rotation.y = sd ? Math.PI : 0; }));
  { const x = -80, V = { raw: true, unlit: true }; B(g, x, 0, 6, 24, 0, 8, '#ffd76a', V); B(g, x, 0, 6.6, 25, 8, 1.3, '#d2553a', V); B(g, x, 0, 6.6, 13, 9.3, 1.2, '#d2553a', V); B(g, x, 0, 4, 4, 10.5, 8, '#ffd76a', V); B(g, x, 0, 5, 5, 18.5, 1.2, '#d2553a', V); B(g, x + 2.1, 0, 0.1, 1.6, 13.5, 1.6, '#fbfbf7', V);
    B(g, x + 3.1, 0, 0.1, 3, 0, 4, '#7a5a33', { unlit: true, shadow: false }); for (const z of [-8, -4.6, 4.6, 8]) B(g, x + 3.1, z, 0.1, 2, 2.6, 2.2, GLASS, { unlit: true, raw: true, shadow: false }); B(g, x + 3.6, 10, 0.2, 0.2, 0, 13, '#fbfbf7', V); B(g, x + 3.6, 11.5, 0.1, 2.8, 11, 1.8, '#e0503a', V); }
  const hills = []; for (const [z, w, hh] of [[-34, 34, 10]]) for (let q = 0; q < 3; q++) hills.push(B(g, -118, z, 8, w * (1 - q * 0.26), q * hh / 3, hh / 3, ['#a9c6a0', '#b9cdb8', '#cdd8d0'][q], NO));
  // the low winter sun, on the sunny side, and two clouds
  const sunBox = B(g, -116, -27, 1, 8, 22, 8, '#ffe9a0', { raw: true, unlit: true, shadow: false }); const clouds = [[30, -8], [34, 20]].map(([y, z]) => { const c = group(g, -114, y, z); B(c, 0, 0, 2, 13, 0, 2, '#ffffff', { raw: true, unlit: true, wx: -114 }); B(c, 0, 2, 2, 6, 2, 1.5, '#ffffff', { raw: true, unlit: true, wx: -114 }); return c; });
  // large see-through leaves near the camera, over the edges of the picture
  dimLeaves(0); const near = group(g);
  // the wood keeps one side of the street in shade all day, and the low sun lies on the other side: both can be seen on the ground
  blk(g, -30, 14.5, 96, 17, 0.12, 0.03, '#1b2a4a', { shadow: false, mat: soft('#1b2a4a', 0.34) }); blk(g, -30, -14.5, 96, 17, 0.12, 0.03, '#ffe27a', { shadow: false, mat: soft('#ffe27a', 0.2) });
  for (const [x, z] of [[12, 9.6]]) { B(near, x, z, 6, 5, 5.6, 3.2, LEAF[0], { op: 0.78, unlit: true, raw: true }); B(near, x + 1, z - 0.4, 3.6, 3.2, 8.8, 2, LEAF[1], { op: 0.78, unlit: true, raw: true }); B(near, x, z, 0.5, 0.5, 0, 5.6, '#8a6a44'); }
  const sheets = [-24, -38, -52, -66].map((x, k) => blk(g, x, 0, 0.1, 110, 0, 56, SHEET, { shadow: false, mat: soft(SHEET, [0.1, 0.14, 0.18, 0.22][k]) }));
  // the empty plots near the camera, five on each side; the first on each side could be the family's plot
  const plots = SIDEZ.map((z, sd) => PX.map((x, k) => { const p = group(g, x, 0, z), w = k ? 7.3 : HW, d = k ? 7 : HD; B(p, 0, 0, w, d, 0, 0.1, '#dccaa2', { wx: x, shadow: false }); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(p, a * w / 2, b * d / 2, 0.22, 0.22, 0, 1.1, '#8a6a44', { wx: x });
    const mark = place(p, 0, 0, w - 0.3, d - 0.3, 0.1); mark.visible = false; p.mark = mark; return p; }));
  // the footings of the family's walls, thick or thin, drawn as soon as the child chooses the word
  const footing = [0.9, 0.3].map((t) => SIDEZ.map((z) => { const f = group(g, PX[0], 0.1, z); for (const sz of [-1, 1]) B(f, 0, sz * (HD / 2 - t / 2), HW, t, 0, 0.7, '#d9d2c2', { wx: 0 }); for (const sx of [-1, 1]) B(f, sx * (HW / 2 - t / 2), 0, t, HD, 0, 0.7, '#d9d2c2', { wx: 0 }); f.visible = false; return f; }));
  const plotPlate = plate(s, T.plot, [PX[0], 3.2, SIDEZ[0]], 'on'); plotPlate.hide = true;
  // the family, and people who walk along the path to the school and back; never cars
  const family = group(g, 8, 0, 0.6); fam(family, 1.25); const famPlate = plate(s, T.family, [8, 3.6, 0.6], 'on');
  const walkers = []; for (let k = 0; k < 8; k++) { const dir = k % 3 === 2 ? 1 : -1, w = group(g, -4 - k * 8.3, 0, dir < 0 ? (k % 2 ? -1.7 : 1.5) : (k % 2 ? 0.5 : -0.6)), c = SH[k % 6];
    fig(w, 0, 0.06, 0, { k: 1.5, shirt: c, skin: SKIN[k % 4], hair: HAIR[k % 5], turn: dir * Math.PI / 2, step: 0.12, long: k % 2 === 0 }); if (k % 2 === 0) fig(w, 0.2, 0.06, 0.8, { k: 1.05, shirt: SH[(k + 2) % 6], skin: SKIN[k % 4], hair: HAIR[(k + 1) % 5], pack: SH[(k + 4) % 6], turn: dir * Math.PI / 2, step: -0.1 });
    walkers.push({ w, dir, v: 1.5 + hash(k, 2) * 0.8, ph: k * 1.7 }); }
  const snow = []; for (let k = 0; k < 150; k++) { const m = blk(g, 12 - hash(k, 1) * 70, (hash(k, 2) - 0.5) * 50, 0.22, 0.22, 0, 0.22, '#fff', { shadow: false, mat: M('#ffffff', 0, { raw: true, unlit: true }) }); m.visible = false; snow.push({ m, y: hash(k, 4) * 24, v: 3 + hash(k, 6) * 2 }); }
  // night and day
  const day = new THREE.Color(SKY), dusk = new THREE.Color('#8ea2c8'), hemi0 = s.hemi.intensity, sun0 = s.sun.intensity, farGlass = M(GLASS, 0, { unlit: true, raw: true }); let nightK = 0;
  s.setNight = (k) => { nightK = k; s.scene.background.copy(day).lerp(dusk, k); s.hemi.intensity = hemi0 * (1 - 0.3 * k); s.sun.intensity = sun0 * (1 - 0.8 * k); for (const sh of sheets) sh.material.color.set(SHEET).lerp(c0.set('#a9b8d6'), k); sunBox.visible = k < 0.5; for (const c of clouds) c.visible = k < 0.5; for (const f of snow) f.m.visible = k > 0.05; farGlass.color.set(GLASS).lerp(c0.set(LIT), k); for (const m of glow) m.visible = k > 0.5; dimLeaves(k * 0.62); };

  // ---- the child's words, drawn in the town ----
  s.side = null; s.thick = null;
  s.words = (side, thick) => { s.side = side; s.thick = thick; plots.forEach((row, sd) => row.forEach((p, k) => { p.mark.visible = side === sd && k < 4; })); footing.forEach((pair, t) => pair.forEach((f, sd) => { f.visible = side === sd && thick === (t === 0); }));
    plotPlate.hide = side === null; if (side !== null) plotPlate.pos.set(PX[0], 3.2, SIDEZ[side]); };
  // ---- Florence's three plans: three sample homes on the side the child chose ----
  let samples = [];
  // warmth: front windows on the sunny side bring in the most sun, roof windows bring in sun on either side, and more insulation keeps more heat in. The material does not change the warmth
  const level = (i) => { const n = (i === 1 ? (s.side === 0 ? 1 : 2) : (s.side === 0 ? 2 : 0)) + (s.thick ? 1 : 0); return n >= 2 ? 'g' : n === 1 ? 'f' : 'p'; };
  s.level = level; s.airLevel = (i) => 'ggf'[i];
  const pop = (o, from = 0.01, to = 1, sec = 0.36) => tw(sec, (k) => o.scale.setScalar(Math.max(0.01, from + (to - from) * (to > from ? back(k) : ease(k)))));
  s.clearPlans = () => { clearView(false); s.inspecting = false; s.still = false; if (s.works) { g.remove(s.works); s.works = null; for (const q of [...s.wplates, ...samples.map((q) => q.feel).filter(Boolean)]) { q.hide = true; q.el.remove(); s.plates.splice(s.plates.indexOf(q), 1); } plots[s.side ?? 0][4].visible = true; for (const r of far) r[0].visible = true; } for (const p of walkers) p.w.visible = true; for (const q of samples) { g.remove(q.h); for (const c of q.cloud) g.remove(c.m); q.plate.hide = true; q.plate.el.remove(); s.plates.splice(s.plates.indexOf(q.plate), 1); } samples = []; };
  s.showPlans = async () => { s.clearPlans(); clearView(true); const z = SIDEZ[s.side], me = run, WX = -38, KX = -36.3, KWX = WX + (KX + 34) * 1.7; s.still = true; for (const p of walkers) p.w.visible = false;
    // the places where the materials are made stand at the end of the row: an electric sawmill, which adds no pollution, and a brick kiln, whose chimney does
    { const wk = group(g, WX, 0.1, z), C = (x, zz, w, d, y, h, c) => blk(wk, x + 34, s.side ? -zz : zz, w, d, y, h, c, { mat: M(c, 0, { raw: true }) }); wk.scale.setScalar(1.7); plots[s.side][4].visible = false; far[s.side][0].visible = false; s.works = wk;
      C(-32, 0, 3.2, 4, 0, 2.2, '#c9a36b'); C(-32, 0, 3.6, 4.4, 2.2, 0.4, '#2e9b5a'); C(-32, 0, 2.6, 3.2, 2.6, 0.12, '#3f78b5'); C(-32, 2.8, 0.25, 1.6, 0.4, 1.6, '#aab4c0'); for (let k = 0; k < 3; k++) C(-30.2 + (k % 2) * 0.3, 2.6 - k * 0.5, 0.5, 2.4, k * 0.5, 0.5, '#b9834a');
      C(KX, 0, 2.8, 2.8, 0, 2.2, '#b0654b'); C(KX, 0, 2, 2, 2.2, 0.9, '#c77b5e'); C(KX, 0, 0.8, 0.8, 3.1, 1.4, '#8f4f3a'); C(KX, 1.5, 1, 0.3, 0, 1.1, '#3a2a22');
      s.wplates = [plate(s, T.works[0], [WX + 3.4, 2.6, z + (s.side ? -5 : 5)]), plate(s, T.works[1], [KWX, 3.2, z + (s.side ? -4.4 : 4.4)])]; } plots[s.side].forEach((p, k) => { p.mark.visible = false; });
    for (let i = 0; i < 3; i++) { const x = PX[s.side ? i + 1 : 3 - i], glass = glassMat(), noWin = new THREE.MeshLambertMaterial({ color: MAT[PM[i]].wall }), h = house(g, { wx: x, mat: MAT[PM[i]], glass: i === 1 ? noWin : glass, thick: s.thick, roofC: ROOF[[2, 0, 1][i]] }); if (i === 1) for (const rx of [-1.7, 1.7]) blk(h, rx, 1.2, 1.9, 1.7, 5.5, 0.9, GLASS, { shadow: false, mat: glass }); h.position.set(x, 0.1, z); h.rotation.y = s.side ? Math.PI : 0; h.scale.setScalar(0.01);
      const cloud = []; for (let k = 0; k < [0, 0, 5][i]; k++) { const sz = 2.6 + hash(k, i) * 1.6, m = blk(g, 0, 0, sz, sz, 0, sz * 0.8, '#6d6763', { shadow: false, mat: soft(['#5f5a54', '#6d675f', '#514d48'][k % 3], 0.86) }); m.visible = false;
        cloud.push({ m, sz, from: [KWX, 7.6, z], to: [KWX + (hash(k, 5) - 0.5) * 7, 10.5 + k * 1.5 + hash(k, 9) * 1.5, z + (hash(k, 3) - 0.5) * 4], at: k * 0.6 }); }
      samples.push({ h, glass, cloud, plate: plate(s, T.short[i], [x, 6.4, z + (s.side ? -3.6 : 3.6)]) }); }
    glide(VIEW.plans[s.side], 1.6); for (const q of samples) { beep(360, 0.07); await pop(q.h); if (me !== run) return; } };
  // after the test the child can tap each of the three homes, and the camera goes down to the path in front of it
  s.inspect = (on) => { s.inspecting = true; s.spot = (name, i) => [samples[i].h.position.x, 3, SIDEZ[s.side]]; samples.forEach((q, i) => { const x = q.h.position.x, z = SIDEZ[s.side], go = () => { if (!s.inspecting) return; beep(600, 0.07); glide({ eye: [x - 1, 2.2, z + (s.side ? -17 : 17)], at: [x + (s.side ? 3.5 : -3.5), 5.6, z], fov: 44, drop: 1.5 }, 1.1); on(i); };
    hitBox(s, g, x, 0, z, 7.6, 9, 8, () => s.inspecting, go); q.plate.el.classList.add('tap'); q.plate.el.onclick = go; }); };
  let cloudT = -1; const setClouds = (tt) => { for (const q of samples) for (const p of q.cloud) { const k = ease(Math.max(0, Math.min(1, (tt - p.at) / 2.4))); p.m.visible = k > 0; p.m.position.set(p.from[0] + (p.to[0] - p.from[0]) * k, p.from[1] + (p.to[1] - p.from[1]) * k, p.from[2] + (p.to[2] - p.from[2]) * k); p.m.scale.set(p.sz * (0.3 + 0.7 * k), p.sz * 0.8 * (0.3 + 0.7 * k), p.sz * (0.3 + 0.7 * k)); } };
  // the test: the materials are made and the pollution rises; then the cold night comes and the windows show the warmth
  s.run = async (stage) => { const me = run, V = VIEW.plans[s.side], dz = s.side ? -1 : 1; for (const q of samples) q.plate.hide = true; await glide({ eye: [-32, 3.4, SIDEZ[s.side] + dz * 19], at: [-38.4, 6.4, SIDEZ[s.side]], fov: 40 }, 1.6); cloudT = 0; await wait(5.2); for (const q of samples) q.plate.hide = false; if (me !== run) return false; stage(); await glide(V, 1.6); if (me !== run) return false; await tw(2, (k) => s.setNight(ease(k))); if (me !== run) return false;
    samples.forEach((q, i) => { const lv = level(i); q.glass.color.set(WARM[lv]); q.feel = plate(s, T.feel[lv], [q.h.position.x, 2.4, SIDEZ[s.side] + (s.side ? -3.8 : 3.8)], lv === 'g' ? 'on' : ''); }); beep(300, 0.3, 'sine'); await wait(1.6); return me === run; };

  // ---- the family's home, built by the child ----
  let H = null;
  // ---- the play break: the child builds the structure and the enclosure of the family's home, layer by layer: frame, insulation, walls, windows, roof beams, roof insulation, roof, door ----
  s.startBuild = async (pick) => { const me = run, sd = s.side, z = SIDEZ[sd], m = MAT[PM[pick]], roofW = pick === 1; famPlate.hide = true; plotPlate.hide = true;
    await Promise.all([tw(1.2, (k) => s.setNight(1 - ease(k))), ...samples.map((q) => pop(q.h, 1, 0.01, 0.5)), tw(1, (k) => { for (const q of samples) for (const p of q.cloud) p.m.material.opacity = 0.78 * (1 - k); })]); if (me !== run) return; s.clearPlans(); cloudT = -1;
    footing.forEach((pair) => pair.forEach((f) => { f.visible = false; })); plots[sd][0].visible = false;
    const hg = group(g, PX[0], 0, z); hg.rotation.y = sd ? Math.PI : 0; const ti = s.thick ? 0.6 : 0.2, U = (c) => ({ shadow: false, mat: M(c, 0, { raw: true, unlit: true }) }), woodM = M('#b9834a', 0, { raw: true }), insM = M('#f6d77a', 0, { raw: true });
    const wallMat = new THREE.MeshLambertMaterial({ color: m.wall }), lineMat = new THREE.MeshLambertMaterial({ color: m.line });
    B(hg, 0, 0, HW + 0.8, HD + 0.8, 0, 0.3, '#d9d2c2', { wx: 0 }); const walls = group(hg, 0, 0.3, 0); blk(walls, 0, 0, HW - 0.2, HD - 0.2, 0, 0.06, '#d2ab74', U('#d2ab74'));
    // the four walls. In each one the frame is on the inside, then the layer of insulation (thick or thin, as the child asked), then the outer wall in the chosen material
    const WL = [{ x: 0, z: HD / 2, w: HW, ry: 0 }, { x: 0, z: -HD / 2, w: HW, ry: Math.PI }, { x: -HW / 2, z: 0, w: HD, ry: -Math.PI / 2 }, { x: HW / 2, z: 0, w: HD, ry: Math.PI / 2 }];
    for (const w of WL) { w.n = 0; w.g = group(walls, w.x, 0, w.z); w.g.rotation.y = w.ry; w.frame = group(w.g); for (let k = 0; k <= 4; k++) blk(w.frame, -w.w / 2 + 0.6 + k * (w.w - 1.2) / 4, -0.75, 0.28, 0.28, 0, HH, '#b9834a', { mat: woodM }); for (const y of [0, HH - 0.28]) blk(w.frame, 0, -0.75, w.w - 0.9, 0.28, y, 0.28, '#b9834a', { mat: woodM });
      w.ins = blk(w.g, 0, -0.6 + ti / 2, w.w - 1.2, ti, 0.05, HH - 0.1, '#f6d77a', { mat: insM }); w.panel = blk(w.g, 0, -0.6 + ti + 0.1, w.w - 0.8 + 2 * ti, 0.2, 0, HH, m.wall, { mat: wallMat }); w.frame.visible = w.ins.visible = w.panel.visible = false;
      w.mark = group(w.g, 0, 0.2, 0.25); frame(w.mark, 0, 0, 0, w.w - 1, HH - 0.5, true); w.mark.visible = false; }
    const zf = HD / 2 - 0.6 + ti / 2, dp = ti + 0.9, yr = 0.3 + HH + 0.25 + ti;
    // the yellow places for the two windows. A plan with front windows has two places in the front wall and one in an end wall; a plan with roof windows has three places in the roof
    const spots = roofW ? [-3, 0, 3].map((x) => ({ wall: 'roof', p: [x, yr + 0.62, 2.6], ry: 0, flat: true })) : [...[-3.2, -0.2].map((x) => ({ wall: 'front', p: [x, 1.9, zf], f: [x, 1.9, HD / 2 + 0.3], ry: 0 })), { wall: 'end', p: [HW / 2 - 0.6 + ti / 2, 1.9, -0.4], f: [HW / 2 + 0.3, 1.9, -0.4], ry: Math.PI / 2 }];
    const beamMat = soft('#ffe27a', 0.34), W = M('#fbfbf7', 0, { raw: true });
    for (const q of spots) { q.f = q.f || q.p; const d = q.flat ? 1.1 : dp; q.frame = group(hg, ...q.f); q.frame.rotation.y = q.ry; if (q.flat) q.frame.rotation.x = -Math.PI / 2; frame(q.frame, 0, 0, 0, 2.3, 2.1, true); q.frame.visible = false;
      q.part = group(hg, ...q.p); q.part.rotation.y = q.ry; if (q.flat) q.part.rotation.x = -Math.PI / 2; blk(q.part, 0, 0, 2.3, d, 0, 2.1, '#fbfbf7', { mat: W }); q.glass = glassMat(); blk(q.part, 0, 0, 1.95, d + 0.08, 0.17, 1.76, GLASS, { shadow: false, mat: q.glass }); blk(q.part, 0, 0, 0.12, d + 0.12, 0.17, 1.76, '#fbfbf7', { shadow: false, mat: W }); q.part.visible = false;
      q.sunny = q.wall === 'roof' || (sd === 0 && q.wall === 'front'); q.beam = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.7, 9), beamMat); q.beam.visible = false; g.add(q.beam); }
    // the roof, in three layers: beams, insulation, and the cover that comes down on ropes
    const rb = group(hg, 0, 0.3 + HH, 0); for (let k = 0; k < 6; k++) blk(rb, -HW / 2 + 0.5 + k * (HW - 1) / 5, 0, 0.26, HD + 0.6, 0, 0.25, '#b9834a', { mat: woodM }); const ri = blk(hg, 0, 0, HW + 0.3, HD + 0.5, 0.3 + HH + 0.25, ti, '#f6d77a', { mat: insM }); rb.visible = ri.visible = false;
    const roof = group(hg, 0, 13, 0); blk(roof, 0, 0, HW + 0.9, HD + 1.2, 0, 0.6, ROOF[2], { mat: M(ROOF[2], 0) }); const ropes = [-4.2, 4.2].map((x) => blk(roof, x, 0, 0.08, 0.08, 0.6, 16, '#2b3a55', { shadow: false })); roof.visible = false;
    const roofSpot = group(hg, 0, 0.3 + HH, 0); frame(roofSpot, 0, 0.1, HD / 2 + 0.2, HW, 0.9, true); for (const sx of [-1, 1]) { const f = group(roofSpot, sx * (HW / 2 + 0.2), 0.1, 0); f.rotation.y = sx * Math.PI / 2; frame(f, 0, 0, 0, HD, 0.9, true); } roofSpot.visible = false;
    const zd = HD / 2 - 0.6 + ti + 0.22, doorSpot = group(hg, DOORX, 0.3, zd + 0.1); frame(doorSpot, 0, 0, 0, 1.8, 3.3, true); doorSpot.visible = false;
    const doorMat = new THREE.MeshLambertMaterial({ color: tone(DOOR[S.doorC]) }), door = group(hg, DOORX, 0.3, zd); blk(door, 0, 0, 1.8, 0.16, 0, 3.3, '#fff', { mat: doorMat }); blk(door, -0.6, 0.1, 0.2, 0.1, 1.5, 0.2, '#ffd257', U('#ffd257')); door.visible = false;
    H = { hg, spots, roof, door, sd, wallMat, lineMat, walls };
    const home = hg.localToWorld(new THREE.Vector3(7.4, 0, 6.6)), fa = family.position.clone(), hop = () => tw(0.7, (k) => { family.position.y = Math.abs(Math.sin(k * Math.PI * 2)) * 0.5 * (k < 1); });
    tw(1.8, (k) => { const e = ease(k); family.position.set(fa.x + (home.x - fa.x) * e, Math.abs(Math.sin(k * 14)) * 0.12 * (k < 1), fa.z + (home.z - fa.z) * e); family.rotation.y = (sd ? -2.2 : -0.9) * e; });
    for (const q of avenue) if (q.tree && q.sd === sd && q.x > -10) q.o.visible = false; if (sd) near.visible = false;
    await glide(VIEW.build[sd], 1.8); if (me !== run) return; beep(500, 0.1);
    const order = ['frame', 'ins', 'panel', ...(roofW ? [] : ['win']), 'rbeam', 'rins', 'rcover', ...(roofW ? ['win'] : []), 'door'], used = new Set(); let tool = 'frame', busy = false, rn = 0, doorOn = false, note = '', told = false; s.done = false;
    const cnt = (n) => WL.filter((w) => w.n === n).length, closed = () => cnt(3) === 4;
    const avail = (k) => k === 'frame' ? cnt(0) : k === 'ins' ? cnt(1) : k === 'panel' ? cnt(2) : k === 'win' ? (closed() && (!roofW || rn === 3) ? 2 - used.size : 0) : k === 'rbeam' ? +(closed() && rn === 0) : k === 'rins' ? +(rn === 1) : k === 'rcover' ? +(rn === 2) : +(closed() && !doorOn);
    const rem = () => ({ frame: cnt(0), ins: cnt(0) + cnt(1), panel: 4 - cnt(3), win: 2 - used.size, rbeam: +(rn < 1), rins: +(rn < 2), rcover: +(rn < 3), door: +!doorOn });
    const show = () => { const st = { frame: 0, ins: 1, panel: 2 }[tool]; for (const w of WL) w.mark.visible = !s.done && w.n === st; spots.forEach((q, i) => { q.frame.visible = !s.done && tool === 'win' && avail('win') > 0 && !used.has(i); }); roofSpot.visible = !s.done && ['rbeam', 'rins', 'rcover'].includes(tool) && avail(tool) > 0; doorSpot.visible = !s.done && tool === 'door' && avail('door') > 0; s.onChange(tool, rem(), s.done, note, Object.fromEntries(order.map((k) => [k, avail(k) || (k === 'win' && used.size && avail('door') + doorOn)]))); };
    const finish = async () => { s.done = true; show(); chime(); await wait(0.5); if (me !== run) return; for (const i of used) spots[i].glass.color.set(spots[i].sunny ? LIT : WARM[level(pick)]); const a = family.position.clone(), to = hg.localToWorld(new THREE.Vector3(DOORX - 1.2, 0, HD / 2 + 2.4)); glide(VIEW.hero[sd], 2.2);
      await tw(2.2, (k) => { const e = ease(k); family.position.set(a.x + (to.x - a.x) * e, Math.abs(Math.sin(k * 16)) * 0.14 * (k < 1), a.z + (to.z - a.z) * e); family.rotation.y = (sd ? -0.5 : 0.4); }); if (me === run) s.onDone(); };
    const next = () => { if (!avail(tool)) tool = order.find((k) => avail(k)) || tool; if (!order.some((k) => avail(k))) finish(); else show(); };
    s.setTool = (k) => { if (s.done || !(avail(k) || (k === 'win' && used.size))) return; tool = k; note = ''; beep(560, 0.05); show(); };
    s.setDoor = (i) => { S.doorC = i; doorMat.color.set(tone(DOOR[i])); if (!s.done && avail('door')) tool = 'door'; show(); };
    WL.forEach((w) => { hitBox(s, w.g, 0, 0, -0.3, w.w, HH + 0.4, 1.3, () => !s.done && !busy && w.n === { frame: 0, ins: 1, panel: 2 }[tool], async () => { const part = [w.frame, w.ins, w.panel][w.n]; busy = true; w.n++; const y0 = part.scale.y; part.visible = true; part.scale.y = 0.01 * y0; beep(380 + w.n * 90, 0.1); note = w.n === 2 && !told ? (told = true, s.thick ? T.insMore : T.insLess) : ''; await tw(0.45, (k) => { part.scale.y = y0 * Math.max(0.01, back(k)); }); busy = false; if (me === run) next(); }).frame = w.mark; });
    spots.forEach((q, i) => { hitBox(s, hg, ...(q.flat ? [q.p[0], q.p[1] - 0.2, q.p[2] - 1.05, 2.6, 0.9, 2.3] : [q.f[0], q.f[1] - 0.1, q.f[2], q.ry ? 1.2 : 2.6, 2.4, q.ry ? 2.6 : 1.2]), () => !s.done && !busy && tool === 'win' && (used.has(i) || avail('win') > 0), () => {
      if (used.has(i)) { used.delete(i); q.part.visible = false; q.beam.visible = false; note = ''; beep(300, 0.08); show(); return; }
      used.add(i); q.part.visible = true; pop(q.part); beep(q.sunny ? 880 : 520, 0.14);
      if (q.sunny) { const w = q.part.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, q.flat ? 0.3 : 1.05, 0)); q.beam.position.copy(w).addScaledVector(sunDir, 4.5); q.beam.lookAt(w.clone().addScaledVector(sunDir, 20)); q.beam.visible = true; q.glass.color.set('#fff3b0'); setTimeout(chime, 120); hop(); }
      note = q.sunny ? T.sunIn : T.noSun; next(); }).frame = q.frame; });
    hitBox(s, hg, 0, 0.3 + HH, 0, HW + 1.4, 3, HD + 1.4, () => !s.done && !busy && ['rbeam', 'rins', 'rcover'].includes(tool) && avail(tool) > 0, async () => { busy = true; note = ''; if (rn === 0) { rb.visible = true; rb.scale.setScalar(0.01); beep(420, 0.1); await pop(rb); } else if (rn === 1) { const y0 = ri.scale.y; ri.visible = true; beep(520, 0.1); await tw(0.45, (k) => { ri.scale.y = y0 * Math.max(0.01, back(k)); }); }
      else { roof.visible = true; await tw(1.2, (k) => { roof.position.y = 13 - (13 - yr) * ease(k); }); for (const r of ropes) r.visible = false; beep(220, 0.2, 'sine', 0.12); hop(); } rn++; busy = false; if (me === run) next(); }).frame = roofSpot;
    hitBox(s, hg, DOORX, 0.3, zd + 0.2, 2.2, 3.4, 1, () => !s.done && !busy && tool === 'door' && avail('door') > 0, () => { doorOn = true; door.visible = true; pop(door); beep(660, 0.12); note = ''; next(); }).frame = doorSpot;
    s.pulse = [...spots.map((q) => q.frame), roofSpot, doorSpot, ...WL.map((w) => w.mark)]; s.pulseM = null;
    // where the yellow places are in the world, for the script that plays the level through
    s.spot = (name, i = 0) => { const v = name === 'wall' ? new THREE.Vector3(WL[i].x * (i > 1 ? 1.02 : 1), i === 1 ? HH + 0.3 : i === 2 ? HH : 2.6, WL[i].z + (i === 0 ? 0.3 : 0)) : name === 'win' ? new THREE.Vector3(spots[i].f[0], spots[i].f[1] + (spots[i].flat ? 0 : 1), spots[i].f[2] - (spots[i].flat ? 1 : 0)) : name === 'roof' ? new THREE.Vector3(0, 0.3 + HH + 1, HD / 2 + 0.3) : new THREE.Vector3(DOORX, 1.9, zd + 0.3); return hg.localToWorld(v).toArray(); };
    show(); };
  // ---- the town changes: the whole street is built in the chosen way ----
  let built = [], haze = []; const streetGlass = glassMat();
  const lay = async (pick, quick) => { const me = run; for (const h of built) g.remove(h); for (const m of haze) g.remove(m); built = []; haze = []; H.wallMat.color.set(MAT[PM[pick]].wall); H.lineMat.color.set(MAT[PM[pick]].line);
    const put = async (h, auto) => { built.push(h); if (pick === 1) for (const rx of [-1.7, 1.7]) blk(h, rx, 1.2, 1.9, 1.7, 5.5, 0.9, GLASS, { shadow: false, mat: streetGlass }); if (quick) return true; if (!s.rest && !auto) { const x = h.position.x, z = h.position.z, cue = place(g, x, z, 7.4, 7, 0.34); h.visible = false; s.cueAt = [x, 2.5, z]; await new Promise((res) => { s.cueGo = res; hitBox(s, g, x, 0, z, 8, 7, 8, () => s.cueGo === res, res); }); s.cueGo = null; s.cueAt = null; g.remove(cue); h.visible = true; if (me !== run) return false; } h.scale.setScalar(0.01); beep(330 + built.length * 30, 0.06); await pop(h, 0.01, 1, 0.26); return me === run; };
    for (let k = 4; k > 0; k--) for (const sd of [H.sd, 1 - H.sd]) { plots[sd][k].visible = false; const x = PX[k], h = house(g, { wx: x, mat: MAT[PM[pick]], glass: pick === 1 ? H.wallMat : streetGlass, thick: s.thick, roofC: ROOF[(k + sd) % 4] }); h.position.set(x, 0.1, SIDEZ[sd]); h.rotation.y = sd ? Math.PI : 0; if (!await put(h)) return; }
    plots[1 - H.sd][0].visible = false; { const h = house(g, { wx: 0, mat: MAT[PM[pick]], glass: pick === 1 ? H.wallMat : streetGlass, thick: s.thick, w: HW, d: HD, h: HH, roofC: ROOF[1] }); h.position.set(PX[0], 0.1, SIDEZ[1 - H.sd]); h.rotation.y = H.sd ? 0 : Math.PI; if (!await put(h, true)) return; }
    // the pollution from making the materials for a whole street hangs in the open sky above the path, where the trees do not hide it
    for (let k = 0; k < 0; k++) { const sz = 2.4 + hash(k, 7) * 2.4; haze.push(blk(g, -16 - hash(k, 1) * 40, (hash(k, 2) - 0.5) * 7, sz, sz * 1.5, 6.2 + hash(k, 3) * 4.5, sz * 0.7, '#6d6763', { shadow: false, mat: soft(['#6f6a62', '#7d776d', '#5f5b55'][k % 3], 0.72) })); } };
  s.buildRest = () => { s.rest = true; if (s.cueGo) s.cueGo(); }; { const sp = s.spot; s.spot = (name, i) => name === 'plot' ? s.cueAt : sp ? sp(name, i) : null; }
  s.fill = async (pick) => { const me = run; s.rest = false; { const sp = s.spot; s.spot = (name, i) => name === 'plot' ? s.cueAt : sp(name, i); } clearView(false); near.visible = true; await glide(VIEW.street, 1.8); if (me !== run) return; plate(s, T.yours, [PX[0] - 3, 6.2, SIDEZ[H.sd] + (H.sd ? -4 : 4)], 'on'); await lay(pick, false); if (me === run) chime(); };
  s.swap = (pick) => lay(pick, true);
  // ---- the last picture: the first winter night in the street the child made; the camera walks slowly towards the school ----
  s.night = async (pick) => { for (const q of H.spots) q.beam.visible = false; for (const p of walkers) p.w.visible = (p.w.position.z > 0) === !!H.sd; const me = run, lv = level(pick), c1 = new THREE.Color(WARM[lv]), a = family.position.clone(), to = H.hg.localToWorld(new THREE.Vector3(DOORX, 0, HD / 2 - 0.6)); if (s.recapOff) s.recapOff(); famPlate.hide = true;
    glide({ eye: [7, 3.3, H.sd ? -1.2 : 1.2], at: [-40, 4.4, 0], fov: 38 }, 11);
    await tw(2.6, (k) => { const e = ease(k); s.setNight(e); s.hemi.intensity *= 1 - 0.42 * e; s.sun.intensity *= 1 - 0.6 * e; s.scene.background.lerp(c0.set('#36426f'), e * 0.85); dimLeaves(0.62 + 0.3 * e); streetGlass.color.set(GLASS).lerp(c1, e); family.position.set(a.x + (to.x - a.x) * e, Math.abs(Math.sin(k * 12)) * 0.12, a.z + (to.z - a.z) * e); family.scale.setScalar(1 - 0.99 * Math.max(0, e - 0.7) / 0.3); }); if (me !== run) return;
    for (const q of H.spots) if (q.part.visible) q.glass.color.set(q.sunny || lv === 'g' ? LIT : WARM[lv]); [523, 659, 784, 1047, 1319].forEach((f, k) => setTimeout(() => { if (me === run) beep(f, 0.5, 'sine', 0.06); }, k * 260)); };
  // ---- the very end: the camera comes down to the family's own home, and the front wall opens again to show them inside with their things ----
  s.visit = (pick) => { const lv = level(pick), sd = H.sd, z0 = SIDEZ[sd]; for (const p of walkers) p.w.visible = false; for (const a of avenue) if (a.sd === sd && a.x > -12) a.o.visible = false; near.visible = false;
    family.position.copy(H.hg.localToWorld(new THREE.Vector3(DOORX - 2.6, 0, HD / 2 + 2.2))); family.scale.setScalar(1); family.rotation.y = (sd ? Math.PI - 0.5 : 0.5) - 1.25; glide({ eye: [PX[0] + 6, 3.2, z0 + (sd ? -20 : 20)], at: [PX[0] - 0.5, 3.8, z0], fov: 36 }, 3.2);
    plate(s, T.feel[lv], [PX[0] + (sd ? 4.5 : -4.5), 7.4, z0 + (sd ? -4 : 4)], lv === 'g' ? 'on' : ''); if (lv === 'g') { chime(); tw(1.4, (k) => { family.position.y = Math.abs(Math.sin(k * Math.PI * 4)) * 0.4 * (k < 1); }); } };
  // ---- the recap: the child taps one side of the street ----
  s.recap = (on) => { const marks = SIDEZ.map((z, sd) => { const m = place(g, -12, sd ? 5 : -5, 36, 2.4, 0.12), pl = plate(s, T.thisSide, [-3, 1.4, sd ? 5.2 : -5.2], 'tap'); hitBox(s, g, -12, 0, z + (sd ? -4 : 4), 44, 10, 9, () => s.answer === undefined, () => go(sd)); pl.el.onclick = () => { if (s.answer === undefined) go(sd); }; return { m, pl }; });
    const stuff = marks.map((q) => q.m); s.recapOff = () => { for (const m of stuff) m.visible = false; for (const q of marks) q.pl.hide = true; };
    const go = (sd) => { s.answer = sd; beep(sd === 0 ? 880 : 300, 0.15); marks.forEach((q, i) => { q.m.visible = i === 0; q.pl.hide = i !== 0; q.pl.el.classList.remove('tap'); q.pl.el.classList.add('on'); q.pl.el.textContent = T.sunSide; });
      for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 18), soft('#ffe27a', 0.32)), base = new THREE.Vector3(-4 - k * 8, 3, SIDEZ[0] + 4); b.position.copy(base).addScaledVector(sunDir, 9); b.lookAt(base.clone().addScaledVector(sunDir, 30)); g.add(b); stuff.push(b); } on(sd === 0); };
    s.pulseM = marks.map((q) => q.m); s.spot = (name, i) => [-9, 3, SIDEZ[i] + (i ? -4 : 4)]; };
  s.tick = (t, dt) => { for (const p of walkers) { p.w.position.x += p.dir * p.v * dt; if (p.w.position.x < -74) p.w.position.x = 4; if (p.w.position.x > 4) p.w.position.x = -74; p.w.position.y = Math.abs(Math.sin(t * 6 + p.ph)) * 0.12; }
    if (cloudT >= 0) { cloudT += dt; setClouds(cloudT); } if (nightK > 0.05) for (const f of snow) { f.y -= f.v * dt; if (f.y < 0) f.y = 24; f.m.position.y = f.y; }
    const k = 1 + 0.05 * Math.sin(t * 4.5); for (const row of plots) for (const p of row) p.mark.scale.set(k, 1, k); if (s.pulseM) for (const m of s.pulseM) m.scale.set(1, 1, k); if (s.pulse) { for (const p of s.pulse) p.scale.set(k, k, 1); if (hover && hover.frame) hover.frame.scale.set(1.14, 1.14, 1.14); } };
  return s; }

// ---- the steps of the level ---------------------------------------------------------------------------------------------------
const S = { words: [], pick: null, first: null, doorC: 1 };
const btn = (label, cls, fn) => { const b = document.createElement('button'); b.className = `btn ${cls}`; b.textContent = label; b.onclick = fn; return b; };
function ui({ step = '', say = [], tray = [], wide = false, over = '' }) { $('step').textContent = step; $('say').innerHTML = [].concat(say).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join(''); const t = $('tray'); t.className = `tray${wide ? ' wide' : ''}`; t.replaceChildren(...tray); if (over !== null) $('over').innerHTML = over; }
const MARK = { g: '✓', f: '–', p: '✕' };
const resultCards = (mine = -1, only = null) => T.plans.map(([n], i) => { if (only && !only.has(i)) return ''; const w = cur.level(i), a = cur.airLevel(i); return `<div class="card"><h3>${esc(n)}</h3><div class="res"><i class="mark ${w}">${MARK[w]}</i><span><b>${esc(T.checks[0])}.</b> ${esc(T.warm[w])}</span></div><div class="res"><i class="mark ${a}">${MARK[a]}</i><span><b>${esc(T.checks[1])}.</b> ${esc(T.air[i])}</span></div>${i === mine ? `<p><b>${esc(T.first)}</b></p>` : `<button class="btn sun" data-plan="${i}">${esc(T.use)}</button>`}</div>`; }).join('');
$('over').addEventListener('click', (e) => { const b = e.target.closest('[data-plan]'); if (b) choose(+b.dataset.plan); });
function job() { Object.assign(S, { words: [], pick: null, first: null }); $('first').hidden = true; setScene(town()); ui({ step: T.level, say: T.job, tray: [btn(T.start, 'sun', ask)] }); }
function ask() { if (cur.side !== null && S.pick !== null) return job(); if (cur.side !== null) glide(VIEW.street, 1); cur.clearPlans(); cur.setNight(0); const gaps = T.sentence.filter((p) => Array.isArray(p)); let now = Math.max(0, gaps.findIndex((_, i) => S.words[i] === undefined));
  const draw = () => { cur.words(S.words[0] ?? null, S.words[1] === undefined ? null : S.words[1] === 0); const sen = document.createElement('div'); sen.className = 'sentence'; let gi = 0;
    for (const p of T.sentence) { if (typeof p === 'string') sen.append(p === '.' ? p : `${p} `); else { const i = gi++, sp = document.createElement('span'); sp.className = `gap${S.words[i] !== undefined ? ' full' : ''}${i === now ? ' now' : ''}`; sp.textContent = S.words[i] !== undefined ? p[S.words[i]] : '…'; sp.onclick = () => { now = i; draw(); }; sen.append(sp, ' '); } }
    const words = document.createElement('div'); words.className = 'words'; gaps[now].forEach((w, k) => { const b = document.createElement('button'); b.className = 'word'; b.textContent = w; b.onclick = () => { glide(now === 0 ? { ...VIEW.street, at: [-10, 3, k ? 6 : -6] } : VIEW.street, 0.9); beep(now === 0 ? 620 : 500, 0.08); S.words[now] = k; const n = gaps.findIndex((_, i) => S.words[i] === undefined); if (n >= 0) now = n; draw(); }; words.append(b); });
    const go = btn(T.ask, 'sun', plans); go.disabled = gaps.some((_, i) => S.words[i] === undefined); go.style.marginLeft = 'auto'; ui({ step: T.askT, say: T.askHow, tray: [sen, words, go], wide: true }); };
  draw(); }
async function plans() { const s = cur, b = btn(T.test, 'sun big', async () => { b.disabled = true; ui({ step: T.making, say: T.watch, tray: [], over: '' }); if (!await s.run(() => { $('step').textContent = T.nightStep; })) return; const seen = new Set(), all = () => { s.inspecting = false; glide(VIEW.plans[s.side], 1.2); ui({ step: T.level, say: T.choose, tray: [btn(T.again, '', () => { S.words = []; ask(); })], over: resultCards() }); };
    ui({ step: T.lookT, say: T.look, tray: [btn(T.showAll, '', all)], over: '' }); s.inspect((i) => { seen.add(i); $('step').textContent = T.plans[i][0]; $('over').innerHTML = resultCards(-1, new Set([i])); if (seen.size === 3) $('tray').replaceChildren(btn(T.showAll, 'sun', all)); }); });
  ui({ step: T.level, say: T.plansSay(T.sentence[1][S.words[0]], T.sentence[3][S.words[1]]), tray: [b] }); b.disabled = true; await s.showPlans(); b.disabled = false; }
async function choose(i) { if (S.first !== null) return second(i); S.pick = i; const s = cur;
  const svg = (inner) => `<svg viewBox="0 0 44 40">${inner}</svg>`, K = 'stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"';
  const I = { frame: svg(`<path d="M6 34V6h32v28M6 20h32M17 6v28M28 6v28" fill="none" stroke="#b9834a" stroke-width="4"/>`), ins: svg(`<rect x="6" y="6" width="32" height="28" rx="3" fill="#f6d77a" ${K}/><path d="M10 15q6-6 12 0t12 0M10 26q6-6 12 0t12 0" fill="none" ${K}/>`), panel: svg(`<rect x="6" y="6" width="32" height="28" rx="2" fill="#d8b482" ${K}/><path d="M6 15h32M6 25h32" ${K}/>`),
    win: svg(`<rect x="7" y="5" width="30" height="30" rx="3" fill="#a9d3ee" ${K}/><path d="M22 5v30M7 20h30" ${K}/>`), rbeam: svg(`<path d="M5 30L22 9l17 21M11 30l11-13 11 13" fill="none" stroke="#b9834a" stroke-width="4"/>`), rins: svg(`<path d="M4 30L22 8l18 22z" fill="#f6d77a" ${K}/>`), rcover: svg(`<path d="M4 30L22 8l18 22z" fill="#2e9b5a" ${K}/>`),
    door: svg(`<rect x="13" y="4" width="18" height="32" rx="2" fill="#3f78b5" ${K}/><circle cx="26" cy="21" r="2.2" fill="#ffd257"/>`) };
  const keys = ['frame', 'ins', 'panel', ...(i === 1 ? [] : ['win']), 'rbeam', 'rins', 'rcover', ...(i === 1 ? ['win'] : []), 'door'], toks = {}, tray = [];
  for (const k of keys) { const b = document.createElement('button'); b.className = 'tok mini'; b.dataset.tool = k; b.onclick = () => s.setTool(k); toks[k] = b; tray.push(b); }
  const sw = document.createElement('div'); sw.innerHTML = `<div class="sws-h">${esc(T.colour)}</div><div class="sws">${DOOR.map((c, k) => `<button class="sw" data-c="${k}" style="background:${c}" aria-label="${esc(T.colour)} ${k + 1}"></button>`).join('')}</div>`; sw.onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) s.setDoor(+b.dataset.c); }; tray.push(sw);
  const says = (ps) => { $('say').innerHTML = ps.filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join(''); };
  s.onChange = (tool, n, done, note, can) => { for (const k of keys) { toks[k].className = `tok mini${tool === k && !done ? ' on' : !can[k] || done ? ' used' : ''}`; toks[k].innerHTML = `${I[k]}<span>${esc(T.item[k])}<small>${esc(n[k] ? T.left(n[k]) : T.placed)}</small></span>`; }
    for (const b of sw.querySelectorAll('.sw')) b.classList.toggle('on', +b.dataset.c === S.doorC); if (!done) says([note, T.bp[tool]]); };
  s.onDone = () => { says([T.homeDone]); $('tray').replaceChildren(btn(T.next, 'sun', townStep)); };
  ui({ step: T.build, say: '', tray: [], over: '', wide: true }); await s.startBuild(i); if (cur === s) $('tray').replaceChildren(...tray); }

function gardenStep() { const s = cur, K = 'stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"', I = { fir: `<path d="M22 4l12 14h-6l9 12H7l9-12h-6z" fill="#357a57" ${K}/><path d="M22 30v7" ${K}/>`, bench: `<rect x="5" y="18" width="34" height="6" rx="2" fill="#b9834a" ${K}/><rect x="5" y="8" width="34" height="6" rx="2" fill="#b9834a" ${K}/><path d="M10 24v10M34 24v10" ${K}/>`, bikes: `<circle cx="12" cy="26" r="8" fill="#fff" ${K}/><circle cx="32" cy="26" r="8" fill="#fff" ${K}/><path d="M12 26l8-12h8l4 12M20 14l4 12" fill="none" stroke="#d1495b" stroke-width="3"/>` };
  const keys = ['fir', 'bench', 'bikes'], names = { fir: T.firT, bench: T.benchT, bikes: T.bikesT }, toks = {}, tray = keys.map((k) => { const b = document.createElement('button'); b.dataset.tool = k; b.onclick = () => s.gardenTool(k); toks[k] = b; return b; }), nx = btn(T.next, 'sun', townStep);
  ui({ step: T.gardenT, say: '', tray: [...tray, nx], over: '' });
  s.garden((tool, n, note, done) => { for (const k of keys) { toks[k].className = `tok mini${tool === k && n[k] ? ' on' : ''}`; toks[k].innerHTML = `<svg viewBox="0 0 44 40">${I[k]}</svg><span>${esc(names[k])}<small>${esc(n[k] ? T.left(1) : T.placed)}</small></span>`; } nx.disabled = !done; $('say').innerHTML = [note, done ? '' : T.gPut[keys.indexOf(tool)]].filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join(''); }); }
const after = (i) => `${T.afterAir[i]} ${T.afterWarm[cur.level(i)]}`;
async function townStep() { const s = cur; ui({ step: T.town, say: T.streetHow, tray: [btn(T.rest, '', () => s.buildRest())], over: '' }); await s.fill(S.pick); if (cur === s) settled(true); }
function settled(canTry) { $('first').hidden = true; ui({ step: T.homes[S.pick], say: [T.built, after(S.pick)], tray: [...(canTry ? [btn(T.tryOther, '', () => { S.first = S.pick; ui({ step: T.town, say: T.chooseOther, tray: [], over: resultCards(S.first) }); })] : []), btn(T.next, 'sun', recap)], over: '' }); }
// the second plan is shown in the town at once, with no second play break; a small sign keeps the first result in view
function second(i) { const s = cur, first = S.first, w = s.level(first), a = s.airLevel(first); S.first = null; S.pick = i; s.swap(i);
  $('first').innerHTML = `<b>${esc(T.first)}: ${esc(T.homes[first])}</b><span><i class="mark ${w}">${MARK[w]}</i>${esc(T.checks[0])}</span><span><i class="mark ${a}">${MARK[a]}</i>${esc(T.checks[1])}</span>`; $('first').hidden = false;
  ui({ step: T.homes[i], say: [T.what, after(i)], tray: [btn(T.keepFirst, '', () => { S.pick = first; s.swap(first); settled(false); }), btn(T.keepThis, 'sun', () => settled(false))], over: '' }); }
function recap() { const s = cur; $('first').hidden = true; ui({ step: T.recapT, say: T.recapQ, tray: [], over: '' }); s.recap((ok) => ui({ step: T.recapT, say: ok ? T.recapYes : T.recapNo, tray: [btn(T.next, 'sun', () => { s.night(S.pick); ui({ step: T.nightT, say: T.nightSay[s.level(S.pick)], tray: [btn(T.visit, 'sun', () => { s.visit(S.pick); ui({ step: T.homeT, say: [T.insideNight[s.level(S.pick)], T.end], tray: [btn(T.replay, 'sun', job)], over: '' }); })], over: '' }); })], over: null })); }

// Florence breathes: frames 0 to 3 of her sheet, three each second
{ let n = 0; setInterval(() => { n = (n + 1) % 4; $('flo').style.setProperty('--col', n); }, 333); }
resize(); job(); requestAnimationFrame(loop);
window.trial = { S, job, ask, plans, choose, get cur() { return cur; } };
window.trialProject = (x, y, z, r) => { const v = new THREE.Vector3(x, y, z).project(cam); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; };
