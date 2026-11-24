// A playable trial of one level, Homes, rebuilt by the design agent (owner, 23 Nov 2026: "redesign and rebuild the trial
// level and activity", with full freedom). One idea runs through the whole level: a home stays warm in winter if the low
// sun can reach it. The street has a sunny side and a shady side. The words the child chooses (which side, and thick or
// thin walls) are drawn in the town at once and change what the test shows. The play break builds the chosen home on the
// family's plot, and the windows the child puts on the sunny wall let the sun in. Nobody can fail, and there is no score.
// It is ONE place from start to finish: the camera glides from the street to the plot and back.
// The homes have three floors and an attic and are made like dollhouses (owner, 23 Nov 2026; see home.js): the child builds
// the structure of the family's home floor by floor, the family inside show what each layer does, and when the front wall
// opens every room is furnished. The child never places furniture.
// The look was made richer on the owner's request (23 Nov 2026): a sky that fades to warm air at the horizon, haze, a stronger
// sun with a cooler shade, colours at full strength, and small repeating pictures for boards, bricks, glass, grass and leaves.
// The look follows car town: a low camera, one vanishing point (the school), large shapes near the camera, pale
// see-through sheets across the distance, a close palette with a few bright accents, and soft light.
// Every word below is a placeholder written for this trial. Nothing here is part of the game.
// The level is built on the shared kit in ../level-kit/ (23 Nov 2026): the page, Florence's band, the order of the steps, the result cards, the meter, the stage and the block style
// come from the kit. This file holds only what belongs to Homes: its words, its street, its test, its plans and results, and its play break.
import { THREE, blk, group, hash, soft, fig, SKIN, HAIR, frame, place, tone, M, B, NO, dimLeaves, wallMat, texBox, patTex, tileMat, FAMILY, familyGroup, SHIRTS } from '../level-kit/blocks.js';
import { run, hover, SPEED, glide, tw, wait, ease, back, plate, hitBox, hot, glowMarks, drawSky, newScene } from '../level-kit/stage.js';
import { esc, planTag as tagOf, meter as meterBar, meterBox } from '../level-kit/shell.js';
import { beep, chime } from '../level-kit/sound.js';
import { runLevel } from '../level-kit/flow.js';
import { makeHome, FH, Y0, YF, TOP, YA, AH } from './home.js';
// ---- the words of the trial (placeholders) -----------------------------------------------------------------------------
const T = { level: 'A warm home for winter',
  job: ['Winter is coming, and your family needs a warm home.', 'The low sun warms one side of the street. The other side is in shade.'], start: 'Start',
  askT: 'Your sentence', askHow: 'Tap a word for the gap. Then ask Florence.', ask: 'Ask Florence',
  sentence: ['Florence, please suggest homes that stay warm in winter. Build them on', ['the sunny side', 'the shady side'], 'of the street.'],
  plansSay: (a) => [`Here are three plans, built on ${a}.`, 'Test them on a cold winter night.'], test: 'Bring the winter night', watch: 'First the materials are made. Then the cold night comes.',
  choose: 'Who sleeps, and who is too cold? Tap a home to look closer. Then choose a plan.', feel: { g: '☀ Warm', f: '☁ A little cold', p: '❄ Cold' }, works: ['Sawmill', 'Brick kiln'], short: ['Timber, front', 'Timber, roof', 'Brick, front'], making: 'Making the materials', nightStep: 'The winter night', showAll: 'Show all three',
  item: { frame: 'Frame', ins: 'Insulation', panel: 'Walls', roomL: 'Living room', roomB: 'Bedrooms', attic: 'Attic', rins: 'Roof insulation', rcover: 'Roof', front: 'Front wall', door: 'Door' }, itemB: { frame: 'Bricks', panel: 'Inside wall' },
  bp: { frame: 'Tap a yellow place to put up the frame.', panel: 'Tap a yellow place to put on the walls.', ins: 'Tap each wall to fill it with insulation.', room: 'Which floor goes in first? Choose the living room or the bedrooms. Then tap the yellow place.', floor2: 'Tap the yellow place to lay the other floor.', whole: 'One tap builds this whole floor.', attic: 'Tap the yellow place to build the attic.', rins: 'Tap the roof to lay its insulation.', rcover: 'Tap the roof to close it.', front: 'Tap the front wall. It goes on last.', door: 'Choose a colour. Then tap the door.' },
  bpB: { frame: 'Tap a yellow place to lay the bricks.', panel: 'Tap a yellow place to put on the inside wall.', ins: 'Tap each wall to put insulation inside it.' },
  moveIn: 'Your family is cold. The walls need insulation.', moveInNone: 'This plan has no insulation, so your family stays cold.', insMore: 'Thick insulation keeps the heat in.', insLess: 'Thin insulation lets some heat out.',
  roomSay: { roomB: 'The bedrooms are in the middle. The living room goes on top.', roomL: 'The living room is in the middle. The bedrooms go on top.' }, roomName: { roomL: 'Living room', roomB: 'Bedrooms' },
  roofWarm: 'Now the warm air stays in.', roofThin: 'Some warm air still gets out.', roofNone: 'With no insulation, the warm air gets out.', sunIn: 'The winter sun shines in.', noSun: 'No sun reaches this side.',
  movingIn: 'Your family is moving in.', openIt: 'Tap the front wall to open it.', tour: 'Look in every room.', homeDone: 'Your family is at home. Tap things in the rooms.',
  matName: ['Timber home', 'Timber home', 'Brick home'], winName: ['No insulation', 'A lot of insulation', 'Some insulation'], again: 'Ask again', use: 'Use this plan',
  checks: ['Staying warm', 'Impact from making it'], impact: ['Better for the atmosphere', 'Worse for the atmosphere'], impRow: ['Timber', 'Bricks'], impOf: (n) => `${n} of 10`, warm: { g: 'It stays warm all night.', f: 'It gets a little cold by morning.', p: 'It is cold inside all night.' },
  build: 'Build the home', left: (n) => `${n} left`, placed: 'In place', colour: 'Door colour', family: 'Your family', plot: 'Your plot', yours: 'Your home', next: 'Next',
  town: 'Build the street', streetHow: 'Tap the yellow path to build the street with your plan.', homes: ['Timber home with no insulation', 'Timber home with a lot of insulation', 'Brick home with some insulation'], afterAir: ['Making the wood was better for the atmosphere.', 'Making the wood was better for the atmosphere.', 'Making the bricks was worse for the atmosphere.'],
  afterWarm: { g: 'The homes stay warm at night.', f: 'The homes get a little cold by morning.', p: 'The homes are cold at night.' }, built: 'The street is built with your plan.',
  tryOther: 'Try another plan', chooseOther: 'Choose another plan to see it in the town.', first: 'Your first plan', what: 'What changed?', keepFirst: 'Go back to my first plan', keepThis: 'Keep this plan',
  nightT: 'The first winter night', insideNight: { g: 'Your family is asleep in warm beds.', f: 'It is a little cold. One of your family cannot sleep.', p: 'It is cold. Your family stands by the heater.' },
  recapT: 'One more question', recapQ: 'Which side does the winter sun warm? Tap it.', thisSide: 'This side', sunSide: 'The sunny side', recapYes: 'Yes. The low sun reaches this side.', recapNo: 'The sun shines on this side. The trees shade the other.',
  end: 'This is the end of the trial level.', replay: 'Play again' };

// ---- colours and blocks ---------------------------------------------------------------------------------------------------
const SKY = '#cfe6f2', SHEET = '#ffedcd', c0 = new THREE.Color(), FARX = -999;   // nothing is drawn flat any more: every building has lit and shaded faces, and the haze does the work of distance
const WALL = ['#ecd9b4', '#e4cfa6', '#f0e0c0', '#dcc69c'], ROOF = ['#c8643f', '#3f78b5', '#2e9b5a', '#e0a23a'], LEAF = ['#58b24a', '#6cc458', '#47a03f'], GRASS = ['#7cc65c', '#84cc62', '#72bd55'], DOOR = ['#7a5a33', '#3f78b5', '#c8643f', '#2e9b5a'];
const PM = [0, 0, 1], INSUL = [0, 2, 1];   // the material of each plan, and how much insulation it has: none, a lot, or some
const MAT = [{ wall: '#d8b482', line: '#c29a66' }, { wall: '#c77b5e', line: '#b0654b' }, { wall: '#cdccc6', line: '#b6b5ae' }], LINING = '#f2d98a';
const GLASS = '#a9d3ee', LIT = '#ffe27a', WARM = { g: '#ffe27a', f: '#d9bd8e', p: '#86a6d4' }, glassMat = () => new THREE.MeshBasicMaterial({ color: GLASS, map: patTex('win') });
const SH = SHIRTS;
// A low home in a group of its own. Its front looks towards +z. o: wx (where it stands), mat, glass, roofC, door, thick.
function house(parent, o = {}) { const g = group(parent), w = o.w || 7.3, d = o.d || 7, h = TOP, m = o.mat, X = { wx: o.wx, raw: !!m }, aw = 0.62 * w, ya = h + 0.4, wm = m ? m.wall : WALL[(o.k || 0) % 4], far = (o.wx ?? 0) < FARX;
  if (o.brick) { texBox(g, 0, 0, w, d, 0, h, wallMat('brick')); texBox(g, 0, 0, aw, d, ya, AH, wallMat('brick')); } else if (m) { texBox(g, 0, 0, w, d, 0, h, wallMat('plank')); texBox(g, 0, 0, aw, d, ya, AH, wallMat('plank')); } else { B(g, 0, 0, w, d, 0, h, wm, X); B(g, 0, 0, aw, d, ya, AH, wm, X); } B(g, 0, 0, w + 0.3, d + 0.3, 0, 0.5, '#8d8478', { wx: o.wx });
  if (o.thick) B(g, 0, 0, w + 0.06, d + 0.06, h - 0.5, 0.5, LINING, { wx: o.wx, raw: true });
  // a band of trim at every floor, so that the storeys can be counted from far away
  const trim = o.brick ? '#f1e4cf' : m ? '#b98a52' : '#c9b48a'; for (const f of [1, 2]) B(g, 0, 0, w + 0.14, d + 0.14, YF[f] - 0.3, 0.22, trim, { wx: o.wx, shadow: false });
  // a timber home with no insulation shows its frame of posts and rails on the outside
  if (o.bare) { const P = (x, z, ww, dd, y, hh) => B(g, x, z, ww, dd, y, hh, '#9a6a3a', { wx: o.wx, raw: true, shadow: false }), nx = Math.round(w / 1.85), nz = Math.round(d / 1.75); for (const sz of [-1, 1]) { for (let k = 0; k <= nx; k++) P(-w / 2 + 0.13 + k * (w - 0.26) / nx, sz * (d / 2 + 0.03), 0.26, 0.1, 0.5, h - 0.5); for (const y of [0.5, YF[1] - 0.3, YF[2] - 0.3, h - 0.26]) P(0, sz * (d / 2 + 0.03), w, 0.1, y, 0.26); }
    for (const sx of [-1, 1]) { for (let k = 0; k <= nz; k++) P(sx * (w / 2 + 0.03), -d / 2 + 0.13 + k * (d - 0.26) / nz, 0.1, 0.26, 0.5, h - 0.5); for (const y of [0.5, YF[1] - 0.3, YF[2] - 0.3, h - 0.26]) P(sx * (w / 2 + 0.03), 0, 0.1, d, y, 0.26); } }
  // the roof is tiled, and steps up over the attic
  const rc = o.roofC || ROOF[(o.k || 0) % 4], R = (x, z, ww, dd, y, hh) => far ? B(g, x, z, ww, dd, y, hh, rc, { wx: o.wx }) : texBox(g, x, z, ww, dd, y, hh, tileMat('tile', tone(rc)), 1.7, 1.7); R(0, 0, w + 0.7, d + 0.6, h, 0.4); R(0, 0, aw + 0.6, d + 0.9, ya + AH, 0.45); R(0, 0, aw * 0.55, d + 0.9, ya + AH + 0.45, 0.4);
  B(g, -w * 0.33, -d * 0.2, 0.8, 0.8, h + 0.4, 2.3, o.brick ? '#b0654b' : '#a79a88', { wx: o.wx }); B(g, -w * 0.33, -d * 0.2, 1, 1, h + 2.7, 0.25, '#6f665c', { wx: o.wx });
  const dc = o.door || DOOR[((o.k || 0) + 1) % 4]; B(g, w * 0.32, d / 2 + 0.03, 1.3, 0.08, 0, 2.4, dc, { wx: o.wx, shadow: false }); B(g, w * 0.32, d / 2 + 0.3, 2, 0.6, 0, 0.3, '#b9ad9c', { wx: o.wx }); B(g, w * 0.32, d / 2 + 0.35, 2.1, 0.7, 2.6, 0.16, dc, { wx: o.wx, shadow: false });
  // four windows on every floor of the front, each with a pale frame, a sill and shutters; two in the attic; three on every floor of each side wall
  const G = { unlit: true, raw: true, shadow: false, tex: 'win', mat: o.glass }, W = { wx: o.wx, raw: true, shadow: false }, sh = SH[(o.k || 0) % 6], n = w > 9 ? 6 : 4;
  for (const f of [0, 1, 2]) for (let k = 0; k < n; k++) { const a = -w / 2 + (k + 0.5) * w / n; if (!f && Math.abs(a - w * 0.32) < 1.2) continue; const y = YF[f] + 0.85; B(g, a, d / 2 + 0.03, 1.24, 0.06, y - 0.1, 1.55, '#fbf6ea', W); B(g, a, d / 2 + 0.06, 1, 0.06, y, 1.35, GLASS, G); B(g, a, d / 2 + 0.12, 1.4, 0.24, y - 0.2, 0.12, '#fbf6ea', W); if (!far && !o.bare) for (const sx of [-1, 1]) B(g, a + sx * 0.74, d / 2 + 0.05, 0.22, 0.06, y - 0.06, 1.47, sh, { wx: o.wx, shadow: false }); if (!far && f === 1 && (k + (o.k || 0)) % 2 === 0) { B(g, a, d / 2 + 0.3, 1.3, 0.3, y - 0.42, 0.24, '#8a5a34', { wx: o.wx, shadow: false }); B(g, a, d / 2 + 0.3, 1.2, 0.26, y - 0.18, 0.2, ['#e0503a', '#ffd257', '#e86aa0'][(k + (o.k || 0) >> 1) % 3], { wx: o.wx, raw: true, shadow: false }); } }
  for (const sx of [-1, 1]) { B(g, sx * 0.8, d / 2 + 0.03, 1.05, 0.06, ya + 0.6, 1.05, '#fbf6ea', W); B(g, sx * 0.8, d / 2 + 0.06, 0.85, 0.06, ya + 0.7, 0.85, GLASS, G); }
  for (const sx of [-1, 1]) for (const f of [0, 1, 2]) for (const b of [-2.1, 0, 2.1]) { B(g, sx * (w / 2 + 0.03), b, 0.06, 1.2, YF[f] + 0.8, 1.4, '#fbf6ea', W); B(g, sx * (w / 2 + 0.06), b, 0.06, 1, YF[f] + 0.9, 1.2, GLASS, G); } return g; }
// A tall building of flats far away: rows and rows of windows, a stepped top and a green roof. Its windows light up at night. The haze takes it
const TWR = {}; function towerMat(hex) { if (TWR[hex]) return TWR[hex]; const mk = (fn) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); fn(x); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; };
  const map = mk((x) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#d9d9d9'; for (let j = 0; j < 4; j++) x.fillRect(0, j * 32 + 29, 128, 3); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { x.fillStyle = '#f4f0e6'; x.fillRect(i * 32 + 6, j * 32 + 5, 20, 20); x.fillStyle = hash(i + 2, j + 7) > 0.5 ? '#5d7ea6' : '#7396bd'; x.fillRect(i * 32 + 8, j * 32 + 7, 16, 16); x.fillStyle = '#a9c6e2'; x.fillRect(i * 32 + 8, j * 32 + 7, 16, 4); } });
  const glow = mk((x) => { x.fillStyle = '#000'; x.fillRect(0, 0, 128, 128); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) if (hash(i * 3 + 1, j * 5 + 2) > 0.36) { x.fillStyle = hash(i, j) > 0.5 ? '#ffffff' : '#c9c9c9'; x.fillRect(i * 32 + 8, j * 32 + 7, 16, 16); } });
  return (TWR[hex] = new THREE.MeshLambertMaterial({ color: hex, map, emissiveMap: glow, emissive: '#000000' })); }
function tower(g, x, z, w, d, h, k) { const mt = towerMat(['#ecd9b4', '#e2c7a0', '#f0e4cc', '#d9b991', '#e8cfb8'][k % 5]), U = 8.8, V = 11.2, rc = ['#2e9b5a', '#3f8f5a', '#c8643f', '#2e9b5a', '#3f78b5'][k % 5]; texBox(g, x, z, w, d, 0, h, mt, U, V); texBox(g, x, z, w * 0.62, d * 0.62, h + 0.6, 5.6, mt, U, V);
  B(g, x, z, w + 0.8, d + 0.8, h, 0.6, rc, { wx: 0 }); B(g, x, z, w * 0.62 + 0.8, d * 0.62 + 0.8, h + 6.2, 0.6, rc, { wx: 0 }); B(g, x, z, w * 0.3, d * 0.3, h + 6.8, 1.6, '#6fbf6a', { wx: 0, raw: true, tex: 'leaf' }); }
function tree(g, x, z, k = 1, op) { texBox(g, x, z, 0.44 * k, 0.44 * k, 0, 4.6 * k, tileMat('bark', '#7a5230'), 0.9, 1.6); B(g, x, z, 3.5 * k, 3.5 * k, 4.9 * k, 0.9 * k, LEAF[2], { op, raw: true, tex: 'leaf' }); B(g, x, z, 2.8 * k, 2.8 * k, 4.4 * k, 2.3 * k, LEAF[Math.floor(hash(x, z) * 3)], { op, raw: true, tex: 'leaf' }); B(g, x + 0.1, z - 0.1, 1.8 * k, 1.8 * k, 6.7 * k, 1.2 * k, LEAF[1], { op, raw: true, tex: 'leaf' }); }
const lamp = (g, x, z, head) => { B(g, x, z, 0.5, 0.5, 0, 0.35, '#2b3a55'); B(g, x, z, 0.18, 0.18, 0, 4.4, '#2b3a55'); B(g, x, z, 0.75, 0.75, 4.3, 0.1, '#2b3a55'); blk(g, x, z, 0.55, 0.55, 4.4, 0.45, '#ffe9a0', { shadow: false, mat: head }); B(g, x, z, 0.8, 0.8, 4.85, 0.12, '#2b3a55'); };
const TESTERS = [0, 1, 2].map((i) => [{ k: 0.95, shirt: SH[i], skin: SKIN[(i + 1) % 4], hair: HAIR[(i + 2) % 5] }, { k: 1.25, shirt: SH[i + 3], skin: SKIN[i % 4], hair: HAIR[i % 5], long: i === 1 }]);
// a small sound when a button is pressed. Sound belongs to the level; the notes themselves come from the kit
document.addEventListener('click', (e) => { if (e.target.closest('button')) beep(440, 0.06); });

// ---- the place: one street, used for the whole level -----------------------------------------------------------------------
// Side 0 is the sunny side (on the right of the picture) and side 1 the shady side (on the left, under the wood).
const SIDEZ = [-12.7, 12.7], PX = [2, -10, -18, -26, -34], VIEW = { results: [{ eye: [-13, 6.5, 18.4], at: [-18.5, 5, -12.7], fov: 64 }, { eye: [-23, 6.5, -18.4], at: [-17.5, 5, 12.7], fov: 64 }], street: { eye: [19, 5, 4.6], at: [-10, 3, 0], fov: 33 }, plans: [{ eye: [-13, 7, 18.4], at: [-18.5, 8.7, -12.7], fov: 55 }, { eye: [-23, 7, -18.4], at: [-17.5, 8.7, 12.7], fov: 55 }], build0: [{ eye: [3.2, 3.9, 1.6], at: [1.2, 3.3, -12.7], fov: 44 }, { eye: [0.8, 3.9, -1.6], at: [1, 3.3, 12.7], fov: 44 }], build: [{ eye: [3.2, 6.6, 8.6], at: [1.2, 6.9, -12.7], fov: 49 }, { eye: [0.8, 6.6, -8.6], at: [1, 6.9, 12.7], fov: 49 }], open: [{ eye: [2.5, 6.6, 10.6], at: [2, 7.5, -12.7], fov: 50 }, { eye: [1.5, 6.6, -10.6], at: [2, 7.5, 12.7], fov: 50 }], garden: [{ eye: [18, 7.4, 1], at: [1, 0.6, -8.4], fov: 36 }, { eye: [18, 8, -1], at: [1, 0.6, 8.4], fov: 36 }], hero: [{ eye: [5.4, 6, 9.5], at: [1.4, 6.9, -12.7], fov: 48 }, { eye: [-1.4, 6, -9.5], at: [1.4, 6.9, 12.7], fov: 48 }] };
const HW = 12.6, HD = 7.5, DOORX = 3.15;
function town() { const s = newScene(58, { sun: [-10, 36, 48], tx: -22 }), g = s.g; Object.assign(s, VIEW.street, { eye: [...VIEW.street.eye], at: [...VIEW.street.at], minAspect: 1.9 });
  const sunDir = new THREE.Vector3(-10, 36, 48).normalize();
  for (let x = -104; x <= 24; x += 8) for (let z = -40; z <= 40; z += 8) B(g, x + 4, z + 4, 8, 8, -1.6, 1.6, GRASS[Math.floor(hash(x, z) * 3)], { tex: 'grass' });
  texBox(g, -40, 0, 128, 5.2, 0, 0.07, tileMat('pave', '#f7dba0'), 2.6, 2.6).castShadow = false; for (const z of [-2.75, 2.75]) { B(g, -40, z, 128, 0.34, 0, 0.16, '#b89f76', NO); for (let x = -102; x < 24; x += 1.3) B(g, x, z, 0.06, 0.36, 0.16, 0.01, '#8f7a58', NO); }
  // the wood behind the shady side: tall, dark and close to the camera. It keeps that side of the street in shade.
  // It is built in steps that rise away from the street: low bushes, then single trees with trunks, then the tall wood, so that the sun lies on every top and the shade below has shapes in it
  { const L = { raw: true, tex: 'leaf', wx: 0 }; for (let k = 0; k < 17; k++) { const x = 22 - k * 6.3 + hash(k, 1) * 1.6, hh = 11.5 + hash(k, 3) * 5, wd = 6.4 + hash(k, 5) * 1.8; B(g, x, 26, wd, 7.5, 0, hh, ['#2f7a4a', '#3a8752', '#2a6c44'][k % 3], L); B(g, x + 0.5, 25.4, wd * 0.62, 5.2, hh, 2.5, '#449458', L); B(g, x + 0.2, 25.2, wd * 0.3, 3, hh + 2.5, 1.5, '#58a866', L);
      const fx2 = x + 3.1, fh = 6 + hash(k, 7) * 2.6; texBox(g, fx2, 20.8, 0.6, 0.6, 0, fh * 0.6, tileMat('bark', '#6b4a2c'), 0.9, 1.6); B(g, fx2, 20.8, 4.3, 4, fh * 0.52, fh * 0.55, ['#4f9c52', '#5cab58', '#458f4c'][(k + 1) % 3], L); B(g, fx2 + 0.2, 20.7, 2.6, 2.5, fh * 1.07, fh * 0.26, '#6dba62', L);
      B(g, x + 0.6, 18.4, 3.6, 1.7, 0, 1.5 + hash(k, 9) * 1.1, ['#62b158', '#55a550'][k % 2], L); } }
  // trees and lamps along the path lead the eye to the school
  const avenue = [], glow = [], lampHead = new THREE.MeshBasicMaterial({ color: hot('#ffe9a0', 1.15) }), nightLights = [-2, -18, -34, -50, -66].map((x) => { const l = new THREE.PointLight('#ffc876', 0, 30, 1.7); l.position.set(x, 4.3, 0); g.add(l); return l; }); for (let k = 0; k < 9; k++) { const x = -6 - k * 8; for (const z of [-7.2, 7.2]) { const tg = group(g), lg = group(g), sd = z > 0 ? 1 : 0; tree(tg, x, z, 1.55); lamp(lg, x - 4, sd ? 3.4 : -3.4, lampHead); for (const [w, y, h, o] of [[4.6, 0.14, 0.05, 0.2]]) { const m = blk(lg, x - 4, sd ? 3.4 : -3.4, w, w, y, h, '#ffe27a', { shadow: false, mat: soft('#ffe27a', o) }); m.visible = false; glow.push(m); } avenue.push({ o: tg, x, sd, tree: true }, { o: lg, x: x - 4, sd }); } }
  // for the test, the trees in front of the three sample homes and the lamps beside them step aside, so that the windows and the air can be seen
  const clearView = (on) => { for (const a of avenue) a.o.visible = !(on && a.x > -42 && a.x < 8); };
  // the far end of the street is already built, and the school closes the view
  const far = [[], []]; [-42, -50, -58, -66].forEach((x, k) => SIDEZ.forEach((z, sd) => { const h = far[sd][k] = house(g, { wx: x, k: k + sd * 2 }); h.position.set(x, 0, z); h.rotation.y = sd ? Math.PI : 0; }));
  { const x = -80, V = { raw: true }; B(g, x, 0, 6, 24, 0, 8, '#ffd76a', V); B(g, x, 0, 6.6, 25, 8, 1.3, '#d2553a', V); B(g, x, 0, 6.6, 13, 9.3, 1.2, '#d2553a', V); B(g, x, 0, 4, 4, 10.5, 8, '#ffd76a', V); B(g, x, 0, 5, 5, 18.5, 1.2, '#d2553a', V); B(g, x + 2.1, 0, 0.1, 1.6, 13.5, 1.6, '#fbfbf7', V);
    B(g, x + 3.1, 0, 0.1, 3, 0, 4, '#7a5a33', { unlit: true, shadow: false }); for (const y of [1.2, 4.6]) for (let z = -10.4; z <= 10.5; z += 2.6) if (y > 4 || Math.abs(z) > 2) B(g, x + 3.1, z, 0.1, 1.5, y, 2, GLASS, { unlit: true, raw: true, shadow: false, tex: 'win' }); for (const z of [-1, 1]) B(g, x + 2.1, z, 0.1, 0.9, 11.2, 1.6, GLASS, { unlit: true, raw: true, shadow: false, tex: 'win' }); B(g, x + 3.6, 10, 0.2, 0.2, 0, 13, '#fbfbf7', V); B(g, x + 3.6, 11.5, 0.1, 2.8, 11, 1.8, '#e0503a', V); }
  for (let q = 0; q < 3; q++) blk(g, -34, -52 - q * 7, 150, 6, 0, 5 + q * 4.5, '#b9d3ad', { shadow: false, mat: M(['#a9cf9c', '#bcd9b6', '#cfe3d2'][q], { raw: true, unlit: true }) }); for (let k = 0; k < 12; k++) { const x = 18 - k * 9 - hash(k, 8) * 4, zz = -27 - hash(k, 4) * 12, kk = 1.2 + hash(k, 6) * 0.8; B(g, x, zz, 0.5 * kk, 0.5 * kk, 0, 3.6 * kk, '#8a6a44'); B(g, x, zz, 3 * kk, 3 * kk, 3.2 * kk, 2.6 * kk, LEAF[k % 3], { raw: true, tex: 'leaf' }); }
  // the rest of the town, far away: tall homes with many rows of windows and green roofs, which the haze takes. The middle of the view stays open, so that the school stands against the sky
  const towerMats = new Set(); { const T2 = (x, z, w, d, h, k) => { tower(g, x, z, w, d, h, k); towerMats.add(towerMat(['#ecd9b4', '#e2c7a0', '#f0e4cc', '#d9b991', '#e8cfb8'][k % 5])); };
    [[-92, -39, 10, 10, 19], [-101, -53, 11, 12, 27], [-113, -41, 12, 11, 33], [-126, -58, 12, 12, 29], [-90, 31, 10, 10, 21], [-102, 45, 12, 11, 29], [-115, 29, 11, 11, 35], [-127, 50, 12, 12, 26], [-140, -24, 12, 12, 40], [-142, 18, 12, 12, 37]].forEach(([x, z, w, d, h], k) => T2(x, z, w, d, h, k));
    for (let k = 0; k < 9; k++) T2(44 - k * 15 - hash(k, 21) * 5, -84 - hash(k, 22) * 16, 10 + hash(k, 23) * 3, 10, 17 + hash(k, 24) * 15, k + 2); }
  const hills = []; for (const [z, w, hh] of [[-34, 34, 10]]) for (let q = 0; q < 3; q++) hills.push(B(g, -118, z, 8, w * (1 - q * 0.26), q * hh / 3, hh / 3, ['#a9c6a0', '#b9cdb8', '#cdd8d0'][q], NO));
  // the low winter sun, on the sunny side, and two clouds
  const sunBox = blk(g, -116, -27, 1, 8, 22, 8, '#ffe9a0', { shadow: false, mat: new THREE.MeshBasicMaterial({ color: hot('#ffdf8a', 2.4), fog: false }) }); const clouds = [[30, -8], [34, 20]].map(([y, z]) => { const c = group(g, -114, y, z); B(c, 0, 0, 2, 13, 0, 2, '#ffffff', { raw: true, unlit: true, wx: -114 }); B(c, 0, 2, 2, 6, 2, 1.5, '#ffffff', { raw: true, unlit: true, wx: -114 }); return c; });
  // large see-through leaves near the camera, over the edges of the picture
  dimLeaves(0); const near = group(g);
  // the wood keeps one side of the street in shade all day, and the low sun lies on the other side: both can be seen on the ground
  blk(g, -30, 14.5, 96, 17, 0.12, 0.03, '#0d3324', { shadow: false, mat: soft('#0d3324', 0.2) }); blk(g, -30, -14.5, 96, 17, 0.12, 0.03, '#ffe27a', { shadow: false, mat: soft('#ffdf6a', 0.16) });
  for (const [x, z] of [[12, 9.6]]) { B(near, x, z, 6, 5, 5.6, 3.2, '#3d8f3a', { op: 0.78, unlit: true, raw: true }); B(near, x + 1, z - 0.4, 3.6, 3.2, 8.8, 2, '#4fa648', { op: 0.78, unlit: true, raw: true }); B(near, x, z, 0.5, 0.5, 0, 5.6, '#8a6a44'); }
  // light in the air: slanting shafts of low sun cross the street further along
  const shafts = [-16, -31, -46, -61].map((x, k) => { const b = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.4, 30), soft('#fff0b8', 0.04 + k * 0.008)), base = new THREE.Vector3(x, 1, -6); b.position.copy(base).addScaledVector(sunDir, 14); b.lookAt(base.clone().addScaledVector(sunDir, 40)); g.add(b); return b; });
  const sheets = [-24, -38, -52, -66].map((x, k) => blk(g, x, 0, 0.1, 110, 0, 56, SHEET, { shadow: false, mat: soft(SHEET, [0.05, 0.08, 0.1, 0.13][k]) }));
  // the empty plots near the camera, five on each side; the first on each side could be the family's plot
  const plots = SIDEZ.map((z, sd) => PX.map((x, k) => { const p = group(g, x, 0, z), w = k ? 7.3 : HW, d = k ? 7 : HD; B(p, 0, 0, w, d, 0, 0.1, '#dccaa2', { wx: x, shadow: false }); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(p, a * w / 2, b * d / 2, 0.22, 0.22, 0, 1.1, '#8a6a44', { wx: x });
    const mark = glowMarks(place(p, 0, 0, w - 0.3, d - 0.3, 0.1)); mark.visible = false; p.mark = mark; return p; }));
  // the footings of the family's walls, thick or thin, drawn as soon as the child chooses the word
  const footing = [0.9, 0.3].map((t) => SIDEZ.map((z) => { const f = group(g, PX[0], 0.1, z); for (const sz of [-1, 1]) B(f, 0, sz * (HD / 2 - t / 2), HW, t, 0, 0.7, '#d9d2c2', { wx: 0 }); for (const sx of [-1, 1]) B(f, sx * (HW / 2 - t / 2), 0, t, HD, 0, 0.7, '#d9d2c2', { wx: 0 }); f.visible = false; return f; }));
  const plotPlate = plate(s, T.plot, [PX[0], 3.2, SIDEZ[0]], 'on'); plotPlate.hide = true;
  // the family, and people who walk along the path to the school and back; never cars
  const family = group(g, 8, 0, 0.6); familyGroup(family, 1.25); const famPlate = plate(s, T.family, [8, 3.6, 0.6], 'on');
  const walkers = []; for (let k = 0; k < 8; k++) { const dir = k % 3 === 2 ? 1 : -1, w = group(g, -4 - k * 8.3, 0, dir < 0 ? (k % 2 ? -1.7 : 1.5) : (k % 2 ? 0.5 : -0.6)), c = SH[k % 6];
    fig(w, 0, 0.06, 0, { k: 1.3, shirt: c, skin: SKIN[k % 4], hair: HAIR[k % 5], turn: dir * Math.PI / 2, step: 0.12, long: k % 2 === 0 }); if (k % 2 === 0) fig(w, 0.2, 0.06, 0.8, { k: 0.95, shirt: SH[(k + 2) % 6], skin: SKIN[k % 4], hair: HAIR[(k + 1) % 5], pack: SH[(k + 4) % 6], turn: dir * Math.PI / 2, step: -0.1 });
    walkers.push({ w, dir, v: 1.5 + hash(k, 2) * 0.8, ph: k * 1.7 }); }
  const snow = []; for (let k = 0; k < 150; k++) { const m = blk(g, 12 - hash(k, 1) * 70, (hash(k, 2) - 0.5) * 50, 0.22, 0.22, 0, 0.22, '#fff', { shadow: false, mat: M('#ffffff', { raw: true, unlit: true }) }); m.visible = false; snow.push({ m, y: hash(k, 4) * 24, v: 3 + hash(k, 6) * 2 }); }
  // night and day
  const day = new THREE.Color(SKY), dusk = new THREE.Color('#8ea2c8'), hemi0 = s.hemi.intensity, sun0 = s.sun.intensity, farGlass = M(GLASS, { unlit: true, raw: true, tex: 'win' }); let nightK = 0;
  s.setNight = (k) => { nightK = k; s.scene.fog.color.copy(drawSky(k)); for (const m of shafts) m.visible = k < 0.3; s.hemi.intensity = hemi0 * (1 - 0.3 * k); s.sun.intensity = sun0 * (1 - 0.8 * k); for (const sh of sheets) sh.material.color.set(SHEET).lerp(c0.set('#8f9fcf'), k); sunBox.visible = k < 0.5; for (const c of clouds) c.visible = k < 0.5; for (const f of snow) f.m.visible = k > 0.05; farGlass.color.set(GLASS).lerp(hot(LIT, 2.2), k); for (const m of glow) m.visible = k > 0.5; dimLeaves(k * 0.62); lampHead.color.copy(hot('#ffe9a0', 1.15)).lerp(hot('#ffd27a', 3.6), k); for (const l of nightLights) l.intensity = 38 * k; for (const m of towerMats) m.emissive.copy(hot('#ffc860', 1.9 * k)); s.bloom = 0.5 + 0.28 * k; };

  // ---- the child's words, drawn in the town ----
  s.side = null; s.thick = null;
  s.words = (side, thick) => { s.side = side; s.thick = thick; plots.forEach((row, sd) => row.forEach((p, k) => { p.mark.visible = side === sd && k < 4; })); footing.forEach((pair, t) => pair.forEach((f, sd) => { f.visible = side === sd && thick === (t === 0); }));
    plotPlate.hide = side === null; if (side !== null) plotPlate.pos.set(PX[0], 3.2, SIDEZ[side]); };
  // ---- Florence's three plans: three sample homes on the side the child chose ----
  let samples = [];
  // warmth: front windows on the sunny side bring in the most sun, roof windows bring in sun on either side, and more insulation keeps more heat in. The material does not change the warmth
  const level = (i) => { const n = INSUL[i] + (s.side === 0 ? 1 : 0); return n >= 2 ? 'g' : n === 1 ? 'f' : 'p'; };
  s.level = level; s.airLevel = (i) => 'ggf'[i];
  const pop = (o, from = 0.01, to = 1, sec = 0.36) => tw(sec, (k) => o.scale.setScalar(Math.max(0.01, from + (to - from) * (to > from ? back(k) : ease(k)))));
  s.clearPlans = () => { clearView(false); s.inspecting = false; s.still = false; if (s.works) { g.remove(s.works); s.works = null; if (s.allB) s.allB.remove(); for (const q of s.wplates) { q.hide = true; q.el.remove(); s.plates.splice(s.plates.indexOf(q), 1); } plots[s.side ?? 0][4].visible = true; for (const r of far) r[0].visible = true; } for (const p of walkers) p.w.visible = true; for (const q of samples) { g.remove(q.h); for (const c of q.cloud) g.remove(c.m); q.plate.hide = true; q.plate.el.remove(); s.plates.splice(s.plates.indexOf(q.plate), 1); } samples = []; };
  s.showPlans = async () => { s.clearPlans(); clearView(true); const z = SIDEZ[s.side], me = run, WX = -38, KX = -36.3, KWX = WX + (KX + 34) * 1.7; s.still = true; for (const p of walkers) p.w.visible = false;
    // the places where the materials are made stand at the end of the row: a sawmill, where making the wood is better for the atmosphere, and a brick kiln, where baking is worse for it and whose chimney does
    { const wk = group(g, WX, 0.1, z), C = (x, zz, w, d, y, h, c) => blk(wk, x + 34, s.side ? -zz : zz, w, d, y, h, c, { mat: M(c, { raw: true }) }); wk.scale.setScalar(1.7); plots[s.side][4].visible = false; far[s.side][0].visible = false; s.works = wk;
      C(-32, 0, 3.2, 4, 0, 2.2, '#c9a36b'); C(-32, 0, 3.6, 4.4, 2.2, 0.4, '#2e9b5a'); C(-32, 0, 2.6, 3.2, 2.6, 0.12, '#3f78b5'); const saw = C(-32, 2.8, 0.25, 1.6, 0.4, 1.6, '#aab4c0'); for (let k = 0; k < 3; k++) C(-30.2 + (k % 2) * 0.3, 2.6 - k * 0.5, 0.5, 2.4, k * 0.5, 0.5, '#b9834a');
      C(KX, 0, 2.8, 2.8, 0, 2.2, '#b0654b'); C(KX, 0, 2, 2, 2.2, 0.9, '#c77b5e'); C(KX, 0, 0.8, 0.8, 3.1, 1.4, '#8f4f3a'); C(KX, 1.5, 1, 0.3, 0, 1.1, '#3a2a22');
      // the things that move while the materials are made: a log comes from the forest, the saw works and a cart takes the boards away; clay comes, the kiln burns and a cart takes the bricks away
      { const Zs = (zz) => (s.side ? -zz : zz), fireM = new THREE.MeshBasicMaterial({ color: '#3a2a22' }), cart = (x, zz, load) => { const c = group(wk, x + 34, 0, Zs(zz)); blk(c, 0, 0, 1.5, 0.9, 0.3, 0.2, '#6b4a2c', { mat: M('#6b4a2c', { raw: true }) }); for (const a of [-0.5, 0.5]) for (const b of [-0.5, 0.5]) blk(c, a, b, 0.4, 0.14, 0, 0.4, '#2b3a55', { mat: M('#2b3a55', { raw: true }) }); for (let k = 0; k < 3; k++) blk(c, 0, 0, 1.3 - k * 0.2, 0.7, 0.5 + k * 0.22, 0.22, load, { mat: M(k % 2 ? load : tone(load), { raw: true }) }); c.visible = false; return c; };
        const log = C(-32, -7, 0.6, 2.6, 0.3, 0.6, '#8a5a34'), clay = C(KX, -7, 1.1, 1.1, 0.1, 0.7, '#b98a6a'), fire = blk(wk, KX + 34, Zs(1.56), 0.8, 0.22, 0.12, 0.85, '#000', { shadow: false, mat: fireM }); log.visible = clay.visible = false;
        s.wparts = { log, clay, saw, sawY: saw.position.y, fireM, fire, carts: [cart(-31.8, 4.3, '#c99a5e'), cart(KX - 0.4, 4.5, '#c9775a')], cx: [-31.8 + 34, KX - 0.4 + 34], put: (m, zz) => { m.position.z = Zs(zz); } }; }
      s.wplates = [plate(s, T.works[0], [WX + 3.4, 2.6, z + (s.side ? -5 : 5)]), plate(s, T.works[1], [KWX, 3.2, z + (s.side ? -4.4 : 4.4)])]; } plots[s.side].forEach((p, k) => { p.mark.visible = false; });
    for (let i = 0; i < 3; i++) { const x = PX[s.side ? i + 1 : 3 - i], hm = makeHome(g, { w: 7.3, d: 7, brick: PM[i] === 1, mat: MAT[PM[i]], ins: INSUL[i], roofC: ROOF[[2, 0, 1][i]], doorC: tone(DOOR[i]), M, tw, done: true, simple: true, sunny: () => s.side === 0, people: TESTERS[i] }), h = hm.g; h.position.set(x, 0.1, z); h.rotation.y = s.side ? Math.PI : 0; h.scale.setScalar(0.01);
      const cloud = []; for (let k = 0; k < [0, 0, 5][i]; k++) { const sz = 2.6 + hash(k, i) * 1.6, m = blk(g, 0, 0, sz, sz, 0, sz * 0.8, '#6d6763', { shadow: false, mat: soft(['#5f5a54', '#6d675f', '#514d48'][k % 3], 0.86) }); m.visible = false;
        cloud.push({ m, sz, from: [KWX, 7.6, z], to: [KWX + (hash(k, 5) - 0.5) * 8, 9.2 + k * 0.6 + hash(k, 9) * 1.2, z + (hash(k, 3) - 0.5) * 4], at: 0.3 + k * 0.55 }); }
      const pl = plate(s, T.short[i], [x + (s.side ? -1 : 1) * (i - 1) * 7.4, 13.5, z], 'pl'); pl.el.innerHTML = planTag(i); samples.push({ h, hm, cloud, plate: pl }); }
    glide(VIEW.plans[s.side], 1.6); for (const q of samples) { beep(360, 0.07); await pop(q.h); if (me !== run) return; } };
  // after the test the child can tap each of the three homes, and the camera goes down to the path in front of it
  // After the test all three homes open at once, above the cards. The child may tap one home to look closer: then only its card stays, and a button brings all three back
  s.inspect = () => { s.inspecting = true; s.samplesReady = () => samples.every((o) => o.ready); s.spot = (name, i) => [samples[i].h.position.x, 9, SIDEZ[s.side]]; const over = document.getElementById('over'), allB = document.createElement('button'); allB.className = 'btn'; allB.textContent = T.showAll; allB.style.cssText = 'pointer-events:auto;align-self:end;justify-self:start'; s.allB = allB;
    const swing = (q, to) => { const a = q.hm.openK; if (Math.abs(a - to) > 0.01) tw(0.6, (k) => q.hm.setOpen(a + (to - a) * ease(k))); };
    allB.onclick = () => { allB.remove(); for (const c of over.children) c.style.display = ''; for (const q of samples) { q.plate.hide = false; if (q.y0) q.plate.pos.y = q.y0; swing(q, 0.9); } glide(VIEW.results[s.side], 1); };
    samples.forEach((q, i) => { const x = q.h.position.x, z = SIDEZ[s.side], go = () => { if (!s.inspecting || !over.children.length || samples.some((o) => !o.ready)) return; beep(600, 0.07); samples.forEach((o, j) => swing(o, j === i ? 1 : 0)); allB.remove(); [...over.children].forEach((c, j) => { c.style.display = j === i ? '' : 'none'; }); over.append(allB); samples.forEach((o, j) => { o.plate.hide = j !== i; }); q.y0 = q.y0 ?? q.plate.pos.y; q.plate.pos.y = 12.6; glide({ eye: [x + (s.side ? 1 : -1), 7, z + (s.side ? -21.5 : 21.5)], at: [x + (s.side ? 3.6 : -3.6), 7.5, z], fov: 53 }, 1.1); };
      hitBox(s, g, x, 0, z, 7.6, 14, 8, () => s.inspecting, go); q.plate.el.classList.add('tap'); q.plate.el.onclick = go; }); };
  s.showNames = () => { for (const o of [...samples.map((q) => q.plate), ...s.wplates]) o.hide = false; };
  let cloudT = -1; const setClouds = (tt) => { for (const q of samples) for (const p of q.cloud) { const k = ease(Math.max(0, Math.min(1, (tt - p.at) / 2.4))); p.m.visible = k > 0; p.m.position.set(p.from[0] + (p.to[0] - p.from[0]) * k, p.from[1] + (p.to[1] - p.from[1]) * k, p.from[2] + (p.to[2] - p.from[2]) * k); p.m.scale.set(p.sz * (0.3 + 0.7 * k), p.sz * 0.8 * (0.3 + 0.7 * k), p.sz * (0.3 + 0.7 * k)); } };
  // The test: both materials are made at the same time, side by side, so that the two meters can be compared while they rise. Then the cold night comes. It takes about ten seconds
  s.run = async (stage, meter = () => {}) => { const me = run, dz = s.side ? -1 : 1; for (const q of samples) q.plate.hide = true; await glide({ eye: [-32.5, 3.5, SIDEZ[s.side] + dz * 20.5], at: [-40, 5.6, SIDEZ[s.side]], fov: 42 }, 1.2); if (me !== run) return false;
    { const P = s.wparts, vals = [0, 0], both = (to, sec, fn) => { const from = [...vals]; beep(300 + to[1] * 40, 0.08); return tw(sec, (t) => { vals[0] = from[0] + (to[0] - from[0]) * t; vals[1] = from[1] + (to[1] - from[1]) * t; meter(vals); fn(t); }); };
      // the log and the clay arrive; the wood is sawn while the bricks are baked, which adds far more; two carts take them to the street
      P.log.visible = P.clay.visible = true; await both([1, 1], 1.1, (t) => { P.put(P.log, -7 + 4.6 * ease(t)); P.put(P.clay, -7 + 5 * ease(t)); }); P.log.visible = P.clay.visible = false; if (me !== run) return false;
      cloudT = 0; await both([2, 7], 2.4, (t) => { P.saw.position.y = P.sawY + Math.abs(Math.sin(t * 30)) * 0.35 * (t < 1); P.fireM.color.copy(hot('#ff7a2a', 1.4 + 2 * Math.abs(Math.sin(t * 14)))); }); P.fireM.color.copy(hot('#ff7a2a', 1.3)); if (me !== run) return false;
      P.carts[0].visible = P.carts[1].visible = true; await both([3, 8], 1.1, (t) => { P.carts[0].position.x = P.cx[0] + 1.7 * ease(t); P.carts[1].position.x = P.cx[1] + 1.7 * ease(t); }); if (me !== run) return false; meter(vals); await wait(0.9); }
    for (const q of samples) q.plate.hide = false; if (me !== run) return false; stage(); glide(VIEW.results[s.side], 1.8); await tw(1.8, (k) => s.setNight(ease(k))); if (me !== run) return false;
    samples.forEach((q, i) => { q.hm.setNight(level(i)); }); beep(300, 0.3, 'sine'); await wait(0.5); return me === run; };
  // A sample home opens. The people inside are seen first, and a moment later the sign of warm or cold becomes the third line of the tag above the home, where no card can cover it
  s.openSample = (i, delay = 0) => { const q = samples[i], lv = level(i), me = run; if (q.open) return; q.open = true; wait(delay).then(() => { if (me !== run) return null; beep(700, 0.15); return tw(1.1, (k) => q.hm.setOpen(back(k) * 0.9)); }).then(() => { if (me !== run) return; q.plate.el.innerHTML = planTag(i).replace('</span>', `<b>${esc(T.feel[lv])}</b></span>`); q.plate.el.classList.toggle('on', lv === 'g'); q.ready = true; }); };

  // ---- the family's home, built by the child ----
  let H = null;
  // ---- the play break: the child builds the structure and the enclosure of the family's home, layer by layer: frame, insulation, walls, windows, roof beams, roof insulation, roof, door ----
  s.startBuild = async (pick) => { const me = run, sd = s.side, z = SIDEZ[sd]; famPlate.hide = true; plotPlate.hide = true;
    await Promise.all([tw(1.2, (k) => s.setNight(1 - ease(k))), ...samples.map((q) => pop(q.h, 1, 0.01, 0.5)), tw(1, (k) => { for (const q of samples) for (const p of q.cloud) p.m.material.opacity = 0.86 * (1 - k); })]); if (me !== run) return; s.clearPlans(); cloudT = -1;
    footing.forEach((pair) => pair.forEach((f) => { f.visible = false; })); plots[sd][0].visible = false; for (const p of walkers) p.w.visible = false;
    const hm = makeHome(g, { w: HW, d: HD, brick: PM[pick] === 1, ins: INSUL[pick], roofC: ROOF[2], doorC: tone(DOOR[doorC]), M, tw, open: 2.75, light: true, people: FAMILY }), hg = glowMarks(hm.g), T0 = hm.T; hg.position.set(PX[0], 0, z); hg.rotation.y = sd ? Math.PI : 0;
    H = { hm, hg, sd, pick, wins: [0, 4], beams: [], bedsTop: true };
    const beamMat = soft('#ffe27a', 0.3), home = hg.localToWorld(new THREE.Vector3(HW / 2 + 2, 0, 1)), fa = family.position.clone();
    tw(1.8, (k) => { const e = ease(k); family.position.set(fa.x + (home.x - fa.x) * e, Math.abs(Math.sin(k * 14)) * 0.12 * (k < 1), fa.z + (home.z - fa.z) * e); family.rotation.y = (sd ? Math.PI + 0.5 : -0.5) - 1.25; });
    for (const q of avenue) if (q.x > -10) q.o.visible = false; near.visible = false;
    const bview = (k) => { const a = VIEW.build0[sd], b = VIEW.build[sd], mix = (p, q) => p.map((v, i) => v + (q[i] - v) * k); return { eye: mix(a.eye, b.eye), at: mix(a.at, b.at), fov: a.fov + (b.fov - a.fov) * k }; };
    await glide(bview(0), 1.8); if (me !== run) return; beep(500, 0.1);
    // The order of the work. The ground floor shows what each layer does: the frame, the walls, and then the insulation wall by wall, while the family inside stops shivering one by one.
    // Then comes the one real decision: there are two floors to lay, the living room and the bedrooms, and the child chooses which goes in first. After that one tap builds a whole storey,
    // and the attic, the roof and the front wall follow. The windows come with the front wall: the child never decides where a window goes (owner, 23 Nov 2026)
    const noIns = INSUL[pick] === 0, brick = hm.brick, seq = brick ? ['frame', 'ins', 'panel'] : noIns ? ['frame', 'panel'] : ['frame', 'panel', 'ins'], KEY = { frame: 'fr', ins: 'il', panel: 'pn' }, gins = noIns ? [] : [{ k: 'gins' }, { k: 'gins' }, { k: 'gins' }];
    const steps = [{ k: 'gframe' }, ...(brick ? [...gins, { k: 'gpanel' }] : [{ k: 'gpanel' }, ...gins]), { k: 'floor', i: 0 }, { k: 'storey', f: 1 }, { k: 'floor', i: 1 }, { k: 'storey', f: 2 }, { k: 'attic' }, ...(noIns ? [] : [{ k: 'rins' }]), { k: 'rcover' }, { k: 'front' }, { k: 'door' }], all = hm.walls.flat();
    let at = 0, busy = false, note = '', room = null, told = false; const laid = [], signs = []; s.done = false; s.isBusy = () => busy;
    const step = () => steps[at] || {}, litOf = (st) => st.k === 'gframe' ? ['frame'] : st.k === 'gpanel' ? ['panel'] : st.k === 'gins' ? ['ins'] : st.k === 'floor' ? (room ? [room] : []) : st.k === 'storey' ? seq : [st.k];
    const show = () => { const st = step(), on = !s.done && !busy;
      for (const q of all) q.mark.visible = on && (q.f === 0 ? st.k === 'gframe' || st.k === 'gpanel' || (st.k === 'gins' && !q.ins) : st.k === 'storey' && st.f === q.f);
      hm.slabMarks.forEach((mk, i) => { mk.visible = on && (i === 2 ? st.k === 'attic' : st.k === 'floor' && st.i === i && !!room); }); hm.roofMark.visible = on && (st.k === 'rins' || st.k === 'rcover'); hm.frontMark.visible = on && st.k === 'front'; hm.doorMark.visible = on && st.k === 'door';
      const later = new Set(steps.slice(at).flatMap((q) => q.k === 'floor' || q.k === 'storey' ? [] : litOf(q))); for (const r of ['roomL', 'roomB']) if (!laid.includes(r)) later.add(r);
      const hint = st.k === 'gframe' ? (brick ? T.bpB.frame : T.bp.frame) : st.k === 'gpanel' ? (brick ? T.bpB.panel : T.bp.panel) : st.k === 'gins' ? (brick ? T.bpB.ins : T.bp.ins) : st.k === 'floor' ? (st.i ? T.bp.floor2 : T.bp.room) : st.k === 'storey' ? T.bp.whole : T.bp[st.k];
      s.onChange({ lit: s.done ? [] : litOf(st), later, choose: on && st.k === 'floor' && st.i === 0, insLeft: steps.slice(at).filter((q) => q.k === 'gins').length }, s.done, note, hint); };
    // When the door is in, the home is closed. The family carries its things inside, where the child cannot see, and then the child opens the front wall on every furnished room.
    // In the open home the cat, the lamp, the bath, the plant, the pot, the bear and the family all do something when they are tapped. To close the home again, the child taps one of the open leaves
    const finish = async () => { s.done = true; show(); for (const q of signs) q.hide = true; chime(); s.sayMoving(); glide(VIEW.hero[sd], 1.8); hm.furnish(); for (let k = 0; k < 3; k++) { await wait(0.5); if (me !== run) return; beep(200 + (k % 2) * 60, 0.12, 'sine', 0.12); hg.scale.set(1 + 0.012 * (k % 2 ? 1 : -1), 1 - 0.008 * (k % 2 ? 1 : -1), 1); } hg.scale.setScalar(1); await wait(0.3); if (me !== run) return; hm.frontMark.visible = true; s.sayOpen(); let open = false, moving = false, first = true;
      const toggle = async () => { moving = true; hm.frontMark.visible = false; open = !open; beep(open ? 700 : 400, 0.15); if (first) glide(VIEW.open[sd], 1.8); await tw(first ? 1.7 : 1.2, (k) => { hm.setOpen(open ? back(k) : 1 - ease(k)); if (first) beamMat.opacity = 0.3 - 0.22 * k; }); if (first && me === run) { first = false; for (const k of [0, 1, 2]) hm.hop(k); chime(); burst(); s.sayTour();
        // the camera goes in close and climbs past every room, and then comes back to show the whole home
        const zs = sd ? -1 : 1; for (const y of [3.5, 9.5]) { await glide({ eye: [sd ? 1.7 : 2.3, y + 0.2, zs * 0.5], at: [2, y, -zs * 12.7], fov: 44 }, 1.3); await wait(1); if (me !== run) return; for (const k of [0, 1, 2]) hm.hop(k); } await glide(VIEW.open[sd], 1.2); s.onDone(); } moving = false; };
      hitBox(s, hg, 0, Y0, HD / 2 + 0.6, HW + 6, YA + AH - Y0, 3.4, () => !moving && !open && s.canToggle, toggle).frame = hm.frontMark; for (const q of hm.leaves) hitBox(s, q.lg, -q.sx * HW / 4, 0, -T0 / 2, HW / 2, TOP - Y0, T0 + 0.8, () => !moving && open && !first && s.canToggle, toggle);
      const NOTE = { cat: [880, 0.12], lamp: [520, 0.05], bath: [300, 0.2], plant: [620, 0.08], pot: [420, 0.08], bear: [700, 0.1] }, live = () => !moving && H.hm.openK > 0.9;
      s.toys = hm.toys.map((q) => { hitBox(s, q.parent, q.x, q.y, q.z, q.w, q.h, q.d, live, () => { q.act(); beep(...NOTE[q.name], q.name === 'bath' ? 'sine' : 'triangle'); }); return q; });
      hm.people.forEach((p, k) => hitBox(s, p.pg, 0, 0, 0, 1.3, 2.3 * p.k, 1.3, () => live() && p.mode !== 'bed', () => { hm.hop(k); beep(560 + k * 90, 0.08); })); s.canToggle = true; };
    // a burst of coloured paper over the roof when the home is first opened
    const burst = () => { const bits = []; for (let k = 0; k < 28; k++) { const c = ['#ffd257', '#e0503a', '#3f78b5', '#2e9b5a', '#ffffff'][k % 5], b = blk(hg, 0, 0, 0.3, 0.08, 0, 0.3, c, { shadow: false, mat: M(c, { raw: true, unlit: true }) }); bits.push({ b, vx: (hash(k, 1) - 0.5) * 14, vy: 5 + hash(k, 2) * 6, vz: 2 + hash(k, 3) * 5, r: hash(k, 4) * 6 }); }
      tw(2.4, (t) => { const u = t * 2.4; for (const q of bits) { q.b.position.set(q.vx * u, YA + AH + 1 + q.vy * u - 4.2 * u * u, HD / 2 + q.vz * u); q.b.rotation.set(q.r + u * 5, q.r * 2 + u * 3, 0); q.b.visible = t < 1; } }); };
    const next = () => { busy = false; at++; if (at >= steps.length) return finish(); const st = step(); if (st.k === 'floor' && st.i === 1) room = laid[0] === 'roomL' ? 'roomB' : 'roomL'; show(); };
    const rise = (part, sec = 0.45) => { part.visible = true; return tw(sec, (k) => { part.scale.y = Math.max(0.01, back(k)); }); };
    // the child chooses which of the two floors to lay first
    s.setTool = (k) => { const st = step(); if (s.done || busy || st.k !== 'floor' || st.i !== 0 || (k !== 'roomL' && k !== 'roomB')) return; room = k; note = ''; beep(560, 0.05); show(); };
    s.setDoor = (i) => { doorC = i; hm.doorMat.color.set(tone(DOOR[i])); show(); };
    // the family comes in as soon as the ground floor is framed. Each of them stands by one wall and shivers until that wall has its insulation
    const WHO = [1, 0, 2], moveIn = async () => { const a = family.position.clone(), to = hg.localToWorld(new THREE.Vector3(0.25 * HW, 0, HD / 2 + 0.6)); await tw(1, (k) => { const e = ease(k); family.position.set(a.x + (to.x - a.x) * e, Math.abs(Math.sin(k * 12)) * 0.12, a.z + (to.z - a.z) * e); }); if (me !== run) return; family.visible = false;
      hm.people.forEach((p, k) => { const to2 = [...p.pos]; p.pos = [0.25 * HW - 0.6 + k * 0.6, Y0, HD / 2 - 0.8]; p.pg.visible = true; p.cold = true; hm.walk(k, 0, to2[0], to2[2], 0.8); }); };
    const wallTap = async (q) => { busy = true; note = ''; show(); const st = step(), S = hm.walls[q.f];
      if (st.k === 'storey') { for (const key of seq) { for (const w of S) rise(w[KEY[key]], 0.32); beep(380 + seq.indexOf(key) * 130, 0.12); await wait(0.4); } const who = q.f === 1 ? 1 : 0; hm.walk(who, q.f, (q.f === 1 ? -0.12 : -0.22) * HW, (q.f === 1 ? 0.15 : 0.12) * HD, 0.7).then(() => hm.hop(who)); }
      else if (st.k === 'gframe') { for (const w of S) { beep(380 + S.indexOf(w) * 60, 0.1); await rise(w.fr, 0.3); } hm.heater.visible = true; hm.heat.stage = 1; moveIn(); note = noIns ? T.moveInNone : T.moveIn; }
      else if (st.k === 'gpanel') { beep(640, 0.1); await Promise.all(S.map((w) => rise(w.pn, 0.34))); }
      else { q.ins = true; beep(520, 0.1); await rise(q.il); const k = WHO[q.i]; hm.people[k].cold = false; hm.hop(k); if (!told) { told = true; note = INSUL[pick] === 2 ? T.insMore : T.insLess; } }
      if (me === run) next(); };
    for (const q of all) hitBox(s, q.wg, 0, 0, -T0 / 2 - 0.4, q.def.len, q.hh, T0 + 1.3, () => !s.done && !busy && q.mark.visible, () => wallTap(q)).frame = q.mark;
    hitBox(s, hg, 0, Y0, HD / 2 - 0.2, HW, TOP - Y0, 1.6, () => !s.done && !busy && step().k === 'front', async () => { busy = true; note = ''; show(); for (const key of seq) { beep(380 + seq.indexOf(key) * 90, 0.12); await Promise.all(hm.leaves.map((l) => rise(l[KEY[key]], 0.3))); } if (me !== run) return;
      // the two big windows come with the front wall. Where the sun reaches them, a shaft of sunlight comes in and one of the family goes to stand in it
      const sunny = sd === 0; H.wins.forEach((i, n) => { const q = hm.spots[i]; hm.putWindow(i, sunny); pop(q.p); if (sunny) { const w = hg.localToWorld(new THREE.Vector3(...q.c)), b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.5, 9), beamMat); b.position.copy(w).addScaledVector(sunDir, 4.6); b.lookAt(w.clone().addScaledVector(sunDir, 20)); g.add(b); H.beams.push(b); hm.walk(n + 1, q.f, q.at[0], q.at[2] + 0.3).then(() => hm.hop(n + 1)); } });
      beep(sunny ? 880 : 520, 0.14); if (sunny) setTimeout(chime, 120); note = sunny ? T.sunIn : T.noSun; await wait(0.5); if (me === run) next(); }).frame = hm.frontMark;
    // A floor is lowered into place. The warm air then rises as far as the top of the storey above it. The first of the two floors decides where the bedrooms are; a sign on each floor says which room it will be
    hm.slabs.forEach((slab, i) => { hitBox(s, hg, 0, slab.userData.y - 1.2, 0, HW, 2, HD, () => !s.done && !busy && hm.slabMarks[i].visible, async () => { busy = true; note = ''; show(); slab.visible = true; beep(300, 0.15, 'sine', 0.1); await tw(0.7, (k) => { slab.position.y = slab.userData.y + 3 * (1 - ease(k)); }); glide(bview([0.42, 0.72, 1][i]), 1.4); hm.heat.stage = 2; hm.heat.top = i === 2 ? YA + AH : YF[i + 1] + FH;
      if (i < 2) { laid.push(room); if (i === 0) { H.bedsTop = room === 'roomL'; hm.setRooms(H.bedsTop); note = T.roomSay[room]; } const sg = plate(s, T.roomName[room], hg.localToWorld(new THREE.Vector3(-HW / 2 + 2.6, slab.userData.y + 1.9, HD / 2)).toArray()); signs.push(sg); }
      else { hm.rb.visible = true; hm.rb.scale.setScalar(0.01); beep(420, 0.1); await pop(hm.rb); } if (me === run) next(); }).frame = hm.slabMarks[i]; });
    hitBox(s, hg, 0, YA - 0.3, 0, HW + 1.4, AH + 2, HD + 1.4, () => !s.done && !busy && hm.roofMark.visible, async () => { busy = true; note = ''; show();
      if (step().k === 'rins') { beep(520, 0.1); await rise(hm.ri); hm.heat.stage = 3; hm.heat.leak = INSUL[pick] === 2 ? 0 : 0.23; note = INSUL[pick] === 2 ? T.roofWarm : T.roofThin; if (INSUL[pick] === 2) for (const k of [0, 1, 2]) hm.hop(k); }
      else { hm.roof.visible = true; for (const r of hm.ropes) r.visible = true; await tw(1.1, (k) => { hm.roof.position.y = hm.yr + 9 * (1 - ease(k)); }); for (const r of hm.ropes) r.visible = false; beep(220, 0.2, 'sine', 0.12); if (noIns) { hm.heat.stage = 3; hm.heat.leak = 0.78; note = T.roofNone; } } if (me === run) next(); }).frame = hm.roofMark;
    hitBox(s, hg, 0.25 * HW, Y0, HD / 2 + 0.2, 2.2, 2.9, 1.2, () => !s.done && !busy && step().k === 'door', () => { hm.door.visible = true; pop(hm.door); beep(660, 0.12); note = ''; next(); }).frame = hm.doorMark;
    s.pulse = [...all.map((q) => q.mark), ...hm.slabMarks, hm.roofMark, hm.doorMark, hm.frontMark]; s.pulseM = null;
    // where the yellow places are in the world, for the script that plays the level through. A wall is numbered from 0 to 2 on the ground floor, from 3 to 5 on the first floor and from 6 to 8 on the second floor
    s.spot = (name, i = 0) => { if (name === 'wall') { const q = all[i]; return q.wg.localToWorld(new THREE.Vector3(0, q.hh / 2, -T0 - 0.3)).toArray(); } if (name === 'toy') { const q = s.toys[i]; return q.parent.localToWorld(new THREE.Vector3(q.x, q.y + q.h / 2, q.z)).toArray(); } if (name === 'leaf') return hm.leaves[i].lg.localToWorld(new THREE.Vector3(-hm.leaves[i].sx * HW / 4, 4, -T0 - 0.2)).toArray();
      const v = name === 'front' ? [-1.2, Y0 + 2.2, HD / 2 + 0.1] : name === 'floor' ? [-1.5, hm.slabs[i].userData.y + 0.1, HD / 2 - 0.2] : name === 'roof' ? [0, YA + AH / 2, HD / 2 + 0.3] : [0.25 * HW, Y0 + 1.4, HD / 2 + 0.3]; return hg.localToWorld(new THREE.Vector3(...v)).toArray(); };
    show(); };
  // If the child keeps a plan of another kind after "Try another plan", the family's own home is rebuilt in that plan at once, with the same windows and door, so that it matches the street
  const rehome = (pick) => { if (!H || H.pick === pick) return; const sd = H.sd, old = H.hg; g.remove(old); const hm = makeHome(g, { w: HW, d: HD, brick: PM[pick] === 1, ins: INSUL[pick], roofC: ROOF[2], doorC: tone(DOOR[doorC]), M, tw, open: 2.75, light: true, done: true, wins: H.wins, bedsTop: H.bedsTop, sunny: () => sd === 0, people: FAMILY });
    hm.g.position.copy(old.position); hm.g.rotation.y = old.rotation.y; for (const p of hm.people) p.pg.visible = false; Object.assign(H, { hm, hg: hm.g, pick }); pop(hm.g, 0.6, 1, 0.3); };
  // ---- the town changes: the whole street is built in the chosen way ----
  let built = [], haze = [], yours = null; const streetGlass = glassMat();
  const lay = async (pick, quick) => { const me = run; for (const h of built) g.remove(h); for (const m of haze) g.remove(m); built = []; haze = [];
    // one tap on the yellow path builds the whole street, home after home
    if (!quick) { const cue = glowMarks(place(g, -15, 0, 30, 4.6, 0.1)); s.cueAt = [-8, 0.4, 0]; s.pulseM = [cue]; await new Promise((res) => { s.cueGo = res; hitBox(s, g, -18, 0, 0, 40, 5, 34, () => s.cueGo === res, res); }); s.cueGo = null; s.cueAt = null; g.remove(cue); s.pulseM = null; if (me !== run) return; }
    const put = async (h) => { built.push(h); if (quick) return true; h.scale.setScalar(0.01); beep(330 + built.length * 30, 0.06); await pop(h, 0.01, 1, 0.2); return me === run; };
    for (let k = 4; k > 0; k--) for (const sd of [H.sd, 1 - H.sd]) { plots[sd][k].visible = false; const x = PX[k], h = house(g, { wx: x, mat: MAT[PM[pick]], glass: streetGlass, brick: PM[pick] === 1, thick: INSUL[pick] === 2, bare: PM[pick] === 0 && INSUL[pick] === 0, k: k + sd * 3, roofC: ROOF[(k + sd) % 4] }); h.position.set(x, 0.1, SIDEZ[sd]); h.rotation.y = sd ? Math.PI : 0; if (!await put(h)) return; }
    plots[1 - H.sd][0].visible = false; { const h = house(g, { wx: 0, mat: MAT[PM[pick]], glass: streetGlass, brick: PM[pick] === 1, thick: INSUL[pick] === 2, bare: PM[pick] === 0 && INSUL[pick] === 0, w: HW, d: HD, roofC: ROOF[1] }); h.position.set(PX[0], 0.1, SIDEZ[1 - H.sd]); h.rotation.y = H.sd ? 0 : Math.PI; s.opp = h; if (!await put(h)) return; }
    // the pollution from making the materials for a whole street hangs in the open sky above the path, where the trees do not hide it
    for (let k = 0; k < 0; k++) { const sz = 2.4 + hash(k, 7) * 2.4; haze.push(blk(g, -16 - hash(k, 1) * 40, (hash(k, 2) - 0.5) * 7, sz, sz * 1.5, 6.2 + hash(k, 3) * 4.5, sz * 0.7, '#6d6763', { shadow: false, mat: soft(['#6f6a62', '#7d776d', '#5f5b55'][k % 3], 0.72) })); } };
  { const sp = s.spot; s.spot = (name, i) => name === 'plot' ? s.cueAt : sp ? sp(name, i) : null; }
  s.fill = async (pick) => { const me = run; { const sp = s.spot; s.spot = (name, i) => name === 'plot' ? s.cueAt : sp(name, i); } clearView(false); near.visible = true; for (const p of walkers) p.w.visible = true; s.canToggle = false; { const k0 = H.hm.openK; tw(1, (k) => H.hm.setOpen(k0 * (1 - ease(k)))); } glide(VIEW.street, 2); await wait(1); if (me !== run) return; for (const p of H.hm.people) p.pg.visible = false; family.visible = true; family.position.copy(H.hg.localToWorld(new THREE.Vector3(DOORX - 0.4, 0, HD / 2 + 2.6))); family.rotation.y = 0; await wait(1); if (me !== run) return; yours = plate(s, T.yours, [PX[0] - 3, 6.4, SIDEZ[H.sd] + (H.sd ? -4.3 : 4.3)], 'on'); await lay(pick, false); if (me === run) chime(); };
  s.swap = (pick) => { rehome(pick); return lay(pick, true); };
  // ---- the last picture: the first winter night in the street the child made; the camera walks slowly towards the school ----
  s.night = async (pick) => { for (const b of H.beams) b.visible = false; s.walking = true; const me = run, lv = level(pick), c1 = hot(WARM[lv], lv === 'g' ? 2.3 : lv === 'f' ? 1.2 : 1), a = family.position.clone(), to = H.hg.localToWorld(new THREE.Vector3(DOORX, 0, HD / 2 - 0.6)); if (s.recapOff) s.recapOff(); famPlate.hide = true;
    glide({ eye: [7, 3.3, H.sd ? -1.2 : 1.2], at: [-40, 4.4, 0], fov: 38 }, 11);
    await tw(2.6, (k) => { const e = ease(k); s.setNight(e); s.hemi.intensity *= 1 - 0.6 * e; s.sun.intensity *= 1 - 0.88 * e; s.scene.fog.color.copy(drawSky(e, e * 0.85)); dimLeaves(0.62 + 0.3 * e); streetGlass.color.set(GLASS).lerp(c1, e); family.position.set(a.x + (to.x - a.x) * e, Math.abs(Math.sin(k * 12)) * 0.12, a.z + (to.z - a.z) * e); family.scale.setScalar(1 - 0.99 * Math.max(0, e - 0.7) / 0.3); }); if (me !== run) return;
    H.hm.setNight(lv); [523, 659, 784, 1047, 1319].forEach((f, k) => setTimeout(() => { if (me === run) beep(f, 0.5, 'sine', 0.06); }, k * 260)); };
  // ---- the very end: the camera comes down to the family's own home, and the front wall opens again to show them inside with their things ----
  s.visit = (pick) => { const lv = level(pick), sd = H.sd, z0 = SIDEZ[sd], hm = H.hm; s.walking = false; for (const p of walkers) p.w.visible = false; for (const a of avenue) if (a.x > -12) a.o.visible = false; near.visible = false; family.visible = false; if (s.opp) s.opp.visible = false;
    hm.setNight(lv); hm.people.forEach((p, k) => { p.pg.visible = true; }); glide(VIEW.open[sd], 3); tw(2.6, (k) => hm.setOpen(back(Math.max(0, (k - 0.45) / 0.55))));
    const yc = lv === 'g' ? YF[H.bedsTop ? 2 : 1] + 1.5 : lv === 'p' ? 3.6 : null, zs = sd ? -1 : 1, me = run; if (yc) wait(3.4).then(() => { if (me === run) glide({ eye: [sd ? 1.7 : 2.3, yc + 0.2, zs * 1.5], at: [2, yc, -zs * 12.7], fov: 46 }, 2.4); });
    plate(s, T.feel[lv], [PX[0], yc ? yc - 4.3 : 0.8, z0 + (sd ? -5 : 5)], lv === 'g' ? 'on' : ''); yours.hide = true; if (lv === 'g') { chime(); setTimeout(() => { for (const k of [0, 1, 2]) hm.hop(k); }, 2300 / SPEED); } };
  s.finale = async (pick) => { const me = run; await s.night(pick); if (me !== run) return; await wait(1.3); if (me !== run) return; s.visit(pick); const hm = H.hm, live = () => hm.openK > 0.9; for (const q of hm.toys) hitBox(s, q.parent, q.x, q.y, q.z, q.w, q.h, q.d, live, () => { q.act(); beep(520, 0.08); }); };
  // ---- the recap: the child taps one side of the street ----
  s.recap = (on) => { const marks = SIDEZ.map((z, sd) => { const m = glowMarks(place(g, -12, sd ? 5 : -5, 36, 2.4, 0.12)), pl = plate(s, T.thisSide, [-3, 1.4, sd ? 5.2 : -5.2], 'tap'); hitBox(s, g, -12, 0, z + (sd ? -4 : 4), 44, 10, 9, () => s.answer === undefined, () => go(sd)); pl.el.onclick = () => { if (s.answer === undefined) go(sd); }; return { m, pl }; });
    const stuff = marks.map((q) => q.m); s.recapOff = () => { for (const m of stuff) m.visible = false; for (const q of marks) q.pl.hide = true; };
    const go = (sd) => { s.answer = sd; beep(sd === 0 ? 880 : 300, 0.15); marks.forEach((q, i) => { q.m.visible = i === 0; q.pl.hide = i !== 0; q.pl.el.classList.remove('tap'); q.pl.el.classList.add('on'); q.pl.el.textContent = T.sunSide; });
      for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 18), soft('#ffe27a', 0.32)), base = new THREE.Vector3(-4 - k * 8, 3, SIDEZ[0] + 4); b.position.copy(base).addScaledVector(sunDir, 9); b.lookAt(base.clone().addScaledVector(sunDir, 30)); g.add(b); stuff.push(b); } on(sd === 0); };
    s.pulseM = marks.map((q) => q.m); s.spot = (name, i) => [-9, 3, SIDEZ[i] + (i ? -4 : 4)]; };
  s.tick = (t, dt) => { for (const p of walkers) { p.w.position.x += p.dir * p.v * dt; if (p.w.position.x < -74) p.w.position.x = 4; if (p.w.position.x > 4) p.w.position.x = -74; p.w.position.y = Math.abs(Math.sin(t * 6 + p.ph)) * 0.12; if (s.walking) p.w.visible = p.w.position.x < s.eye[0] - 13; }
    if (cloudT >= 0) { cloudT += dt; setClouds(cloudT); } for (const q of samples) q.hm.tick(t, dt); if (H) H.hm.tick(t, dt); if (nightK > 0.05) for (const f of snow) { f.y -= f.v * dt; if (f.y < 0) f.y = 24; f.m.position.y = f.y; }
    const k = 1 + 0.05 * Math.sin(t * 4.5); for (const row of plots) for (const p of row) p.mark.scale.set(k, 1, k); if (s.pulseM) for (const m of s.pulseM) m.scale.set(1, 1, k); if (s.pulse) { for (const p of s.pulse) p.scale.set(k, k, 1); if (hover && hover.frame) hover.frame.scale.set(1.14, 1.14, 1.14); } };
  return s; }
// ---- the small pictures that go with the names of the plans, and the meter of the impact of making the material ---------------------------------
// A cut through a wall: the outside on the left, then the insulation (none, a thin layer or a thick layer), then the room. It goes wherever a plan is named, so that the two timber homes are never told apart by small words alone
function insIcon(i) { const brick = PM[i] === 1, n = INSUL[i], w = [0, 7, 17][n], K = 'stroke="#1f2a44" stroke-width="2.5"';
  return `<svg class="tagpic" viewBox="0 0 44 36" aria-hidden="true"><rect x="2" y="2" width="40" height="32" rx="4" fill="#fff" ${K}/><rect x="4" y="4" width="8" height="28" fill="${brick ? '#c9775a' : '#c99a5e'}"/><path d="M12 3v30" ${K}/>${n ? `<rect x="13" y="4" width="${w}" height="28" fill="#f6c93a"/><path d="M${13 + w / 2} 6l${w > 8 ? -4 : -2} 4l${w > 8 ? 8 : 4} 4l${w > 8 ? -8 : -4} 4l${w > 8 ? 8 : 4} 4l${w > 8 ? -8 : -4} 4l${w > 8 ? 4 : 2} 3" fill="none" stroke="#1f2a44" stroke-width="2"/><path d="M${13 + w} 3v30" ${K}/>` : '<path d="M19 7v22" stroke="#8b93a7" stroke-width="2.5" stroke-dasharray="3 4"/>'}</svg>`; }
// the three plans, as the kit wants them: a name, two lines for the tag and a small picture
const PLANS = T.homes.map((name, i) => ({ name, lines: [T.matName[i], T.winName[i]], icon: insIcon(i) })), planTag = (i) => tagOf(PLANS[i]);
// The meter is a row of ten boxes. Timber fills three of them and brick fills eight, so the difference is one of length and of words, not of colour. A short meter is "Better for the atmosphere", which are the owner's words (23 Nov 2026), and a long one is "Worse for the atmosphere"
const IMP = [3, 8], meter = (v) => meterBar(v, T.impOf(Math.round(v)));
// The two meters sit in the paper band under the town, beside Florence's words, so that they cover nothing in the picture. They stay there, side by side, until the child has chosen a plan
const impBox = meterBox(), impEl = impBox.el;
function impactPanel(vals, now = -1, stage = -1) { if (!vals) { impEl.remove(); return; }
  impBox.set({ title: T.checks[1], rows: [0, 1].map((k) => ({ name: T.impRow[k], value: vals[k], label: T.impOf(Math.round(vals[k])), note: vals[k] >= IMP[k] ? T.impact[k] : '', now: k === now })), caption: '' }); }
// what each check found for a plan: a sentence about what happened, the meter as evidence, and only then the mark
const results = (i, s) => { const w = s.level(i), a = s.airLevel(i), k = PM[i]; return [{ check: T.checks[0], text: T.warm[w], mark: w }, { check: T.checks[1], evidence: meter(IMP[k]), text: `${T.impact[k]}.`, mark: a }]; };

// ---- the play break of this level: the parts of the home in the order they go in, the two floors to choose between, and the colour of the door ------------------
let doorC = 1;
async function playBreak(s, i, api) { impactPanel(null);
  const svg = (inner) => `<svg viewBox="0 0 44 40">${inner}</svg>`, K = 'stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"', FL = `<path d="M4 26h36v8H4z" fill="#f1e2c4" ${K}/>`;
  const I = { frame: svg(`<path d="M6 34V6h32v28M6 20h32M17 6v28M28 6v28" fill="none" stroke="#b9834a" stroke-width="4"/>`), ins: svg(`<rect x="6" y="6" width="32" height="28" rx="3" fill="#f6d77a" ${K}/><path d="M10 15q6-6 12 0t12 0M10 26q6-6 12 0t12 0" fill="none" ${K}/>`), panel: svg(`<rect x="6" y="6" width="32" height="28" rx="2" fill="#d8b482" ${K}/><path d="M6 15h32M6 25h32" ${K}/>`),
    roomL: svg(`${FL}<path d="M9 26V16h6v4h14v-4h6v10z" fill="#16a3a3" ${K}/>`), roomB: svg(`${FL}<path d="M7 26V12M7 20h30v6" fill="none" ${K}/><rect x="10" y="14" width="9" height="6" rx="2" fill="#fff" ${K}/><path d="M19 17h18v9H19z" fill="#3f78b5" ${K}/>`),
    attic: svg(`<path d="M5 30L22 9l17 21M11 30l11-13 11 13" fill="none" stroke="#b9834a" stroke-width="4"/>`), rins: svg(`<path d="M4 30L22 8l18 22z" fill="#f6d77a" ${K}/>`), rcover: svg(`<path d="M4 30L22 8l18 22z" fill="#2e9b5a" ${K}/>`),
    front: svg(`<rect x="5" y="5" width="34" height="30" rx="2" fill="#d8b482" ${K}/><rect x="9" y="10" width="10" height="9" fill="#a9d3ee" ${K}/><rect x="25" y="17" width="9" height="18" fill="#3f78b5" ${K}/>`), door: svg(`<rect x="13" y="4" width="18" height="32" rx="2" fill="#3f78b5" ${K}/><circle cx="26" cy="21" r="2.2" fill="#ffd257"/>`) };
  const brick = PM[i] === 1, IB = { frame: svg(`<rect x="5" y="6" width="34" height="28" fill="#c9775a" ${K}/><path d="M5 15h34M5 25h34M22 6v9M13 15v10M31 15v10M22 25v9" stroke="#ead8c0" stroke-width="2.5"/>`), panel: svg(`<rect x="6" y="6" width="32" height="28" rx="2" fill="#f6eedc" ${K}/>`), front: svg(`<rect x="5" y="5" width="34" height="30" rx="2" fill="#c9775a" ${K}/><rect x="9" y="10" width="10" height="9" fill="#a9d3ee" ${K}/><rect x="25" y="17" width="9" height="18" fill="#3f78b5" ${K}/>`) };
  const keys = [...(brick ? ['frame', 'ins', 'panel'] : INSUL[i] ? ['frame', 'panel', 'ins'] : ['frame', 'panel']), 'roomL', 'roomB', 'attic', ...(INSUL[i] ? ['rins'] : []), 'rcover', 'front', 'door'], toks = {}, tray = [];
  for (const k of keys) { const b = document.createElement('button'); b.className = 'tok mini'; b.style.alignSelf = 'stretch'; b.dataset.tool = k; b.onclick = () => s.setTool(k); toks[k] = b; tray.push(b); }
  const sw = document.createElement('div'); sw.innerHTML = `<div class="sws-h">${esc(T.colour)}</div><div class="sws">${DOOR.map((c, k) => `<button class="sw" data-c="${k}" style="background:${c}" aria-label="${esc(T.colour)} ${k + 1}"></button>`).join('')}</div>`; sw.onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) s.setDoor(+b.dataset.c); }; tray.push(sw);
  // A part is yellow while it is the one going in, pale once it is in place, and white while it waits. The two floors nod while the child has to choose between them
  s.onChange = (st, done, note, hint) => { for (const k of keys) { const on = st.lit.includes(k), used = !on && !st.later.has(k), pick = st.choose && (k === 'roomL' || k === 'roomB'); toks[k].className = `tok mini${on ? ' on' : used || done ? ' used' : ''}${pick ? ' pick' : ''}`; toks[k].style.animation = pick && !on ? 'nod 1.4s ease-in-out infinite' : ''; toks[k].style.cursor = pick ? 'pointer' : 'default';
      toks[k].innerHTML = `${brick && IB[k] || I[k]}<span>${esc(brick && T.itemB[k] || T.item[k])}<small>${esc(used || done ? T.placed : k === 'ins' && st.insLeft ? T.left(st.insLeft) : ' ')}</small></span>`; }
    for (const b of sw.querySelectorAll('.sw')) b.classList.toggle('on', +b.dataset.c === doorC); if (!done) api.say([note, hint]); };
  s.sayMoving = () => api.say([T.movingIn]); s.sayTour = () => api.say([T.tour]); s.sayOpen = () => api.say([T.openIt]); s.onDone = () => api.done([T.homeDone]);
  await s.startBuild(i); api.tray(tray); }

// ---- the level, as the kit wants it: the street with the hooks that the order of the steps calls -------------------------------------------------
function homesScene() { const s = town(), drawWords = s.words;
  s.words = (list) => drawWords(list[0] ?? null, true);
  s.asking = () => { if (s.side !== null) glide(VIEW.street, 1); impactPanel(null); s.clearPlans(); s.setNight(0); };
  s.wordTapped = (gap, k) => { glide(gap === 0 ? { ...VIEW.street, at: [-10, 3, k ? 6 : -6] } : VIEW.street, 0.9); beep(gap === 0 ? 620 : 500, 0.08); };
  s.test = (api) => { impactPanel([0, 0]); return s.run(() => api.step(T.nightStep), impactPanel); };
  // all three homes open together, a moment apart, and the cards come up under them
  s.showResults = () => { s.showNames(); for (const k of [0, 1, 2]) s.openSample(k, k * 0.35); s.inspect(); };
  s.playBreak = (i, api) => playBreak(s, i, api);
  s.town = (pick) => s.fill(pick);
  return s; }
runLevel({ place: { number: 1, town: 'Eco Town', level: 'Homes' },
  words: { ...T, plansSay: ([a]) => T.plansSay(a), testT: T.making, playT: T.build, townT: T.town, townHow: T.streetHow },
  plans: PLANS, results, evidence: impEl, scene: homesScene,
  after: (i, s) => `${T.afterAir[i]} ${T.afterWarm[s.level(i)]}`,
  // one closing picture: the night comes over the street, and then the camera goes home and the front wall opens
  ends: (pick, s) => [{ step: T.nightT, say: [T.insideNight[s.level(pick)], T.end], go: () => s.finale(pick) }] });