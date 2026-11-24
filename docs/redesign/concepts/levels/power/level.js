// Level 5 of Eco Town, "Power", as a playable trial on the shared level kit (23 Nov 2026).
// The place is the windy hilltop above the town on a winter afternoon. The family stand in front and the town lies in the valley
// as three small neighbourhoods, one for each of Florence's plans. The test runs from sunset to first light. The play break is
// one winter day run by hand: the child places the turbines and the solar roofs, drags the sun across the sky, saves spare power
// in the battery by day and sends it to dark homes at night. Power is drawn as beads of light. Nobody touches a wire or a socket.
// EVERY WORD BELOW IS A PLACEHOLDER. The sentence, the plans, the results and the recap follow docs/redesign/wireframes-data.js.
import { THREE, B, group, fig, frame, M, FAMILY, SHIRTS, hash } from '../../level-kit/blocks.js';
import { newScene, tw, wait, ease, back, run, cur, plate, hitBox, glowMarks, glide, hot, drawSky, canvas, project } from '../../level-kit/stage.js';
import { meter, btn } from '../../level-kit/shell.js';
import { beep, chime } from '../../level-kit/sound.js';
import { runLevel } from '../../level-kit/flow.js';

// ---- 1. the words (placeholders) -------------------------------------------------------------------------------------------------------
const W = {
  level: 'Power for the winter',
  job: ['Eco Town needs power for its homes all year round.', 'It is winter and the sun is going down, but the wind still blows on the hill. Can we keep the lights on?'], start: 'Start',
  askT: 'Your sentence', askHow: 'Tap a word for each gap. Then ask Florence to suggest plans.', ask: 'Ask Florence',
  sentence: ['Florence, please suggest plans for clean power that works when there is less sun in the winter. Use', ['only the sun', 'only the wind', 'the sun and the wind together'], 'and', ['waste the spare power', 'save the spare power in a battery', 'switch the power off at night'], '.'],
  plansSay: () => ['Here are three plans, one for each part of the town. The yellow tag is the plan that follows your words.', 'Press the button to test them through a winter night.'],
  test: 'Keep the lights on', testT: 'The winter night', watch: 'The sun is going down. Look at the three parts of the town.',
  t2: 'Every family comes home and switches on the lights and the heating.', t3: 'The wind still blows. Look at the geese.', t4: 'The night is long. Look at the lights, and at the battery.', t5: 'The night is nearly over.',
  choose: 'A dark home had no power. Which plan will you use?', again: 'Ask again', use: 'Use this plan',
  playT: 'Run one winter day', next: 'Next', townT: 'Power for the whole town', townHow: 'Your plan now powers every part of the town.',
  built: 'The whole town runs on the plan you chose.', tryOther: 'Try another plan', chooseOther: 'Choose a different plan to see it in the town.', first: 'Your first plan', what: 'What changed?', keepFirst: 'Go back to my first plan', keepThis: 'Keep this plan',
  recapT: 'One more question', recapQ: 'What kept the lights on after sunset? Point to it.', recapYes: '', recapNo: '',
  end: 'This is the end of the trial level. Thank you for playing.', replay: 'Play again',
  checks: ['Staying warm', 'Nature', 'Clean air'],
  lights: { on0: 'The lights went dark after sunset.', on1: 'The lights stayed on while the wind blew.', on2: 'The lights stayed on while the battery had power.', two: 'Two homes went dark after sunset.', off: 'The power was switched off, and the homes went dark.' },
  nature: ['No land was taken from wildlife.', 'Birds had to fly around the turbines.', 'The few turbines stood away from the birds.'],
  air: ['The roofs caused no pollution.', 'The turbines caused no pollution.', 'Nothing caused any pollution.'],
  homesLit: (n) => `${n} of 6 homes had lights at midnight`,
  after2: 'The turbines, the solar roofs and the battery are working together. Homes stay warm through the winter, the birds are left alone, and the power is clean in every season.',
  base: ['Solar roofs', 'Wind farm on the hill', 'Wind and sun'], short: ['Solar roofs', 'Wind farm', 'Wind and sun'], extra: { none: 'No battery', bat: 'With a battery', off: 'Off at night' }, full2: 'Wind, sun and a battery',
  family: 'Your family', inBat: 'in the battery',
  parts: { turb: 'Wind turbine', roof: 'Solar roof' }, left: (n) => (n ? `${n} left` : 'All in place'), stripe: 'Stripe colour', stripeNames: ['Red stripe', 'Blue stripe', 'Green stripe', 'Purple stripe'],
  setTurb: 'Choose where the turbines stand. Tap a yellow place.', setRoof: 'Now the solar roofs. Tap a yellow place on a roof.', setBoth: 'There are more places than parts, so you choose.',
  made: 'Power made', need: 'Homes need', spare: 'Spare', bat: 'In the battery', back: 'Move the sun back', finish: 'Florence, please finish the day',
  sunHow: 'Each home needs one bead of power. Drag the sun to the next yellow mark, or tap the mark.', moonHow: 'Drag the moon to the next yellow mark, or tap the mark.',
  day: ['It is morning. The turbines and the roofs are making power.', 'It is midday. The winter sun is as high as it gets.', 'It is afternoon. The sun is getting low.'],
  enough: 'Every home has its bead. There is no spare power.', spareSave: (n) => `There are ${n} spare beads. Tap the battery to save them.`, spareLost: (n) => `There are ${n} spare beads, and this plan has nowhere to keep them. They are wasted.`, saved: (n) => `The battery now holds ${n} beads.`, full: 'The battery is full.',
  dusk: 'The sun has set. The solar roofs make no power now.', nightT: 'It is the middle of the night.', allLit: 'The wind is still blowing, and the turbines light every home.',
  dark: (n) => `${n} homes are dark.`, send: 'Tap a dark home to send it a bead from the battery.', noBat: 'There is no saved power to send, so they stay dark until the sun comes back.', empty: 'The battery is empty. You can move the sun back and save more.', offNight: 'This plan switches the power off at night, so every home is dark.',
  sent: 'That home is warm and bright again.', dawn: 'The sun is back. You kept the town going for a whole winter day.', dawnDark: 'The sun is back, and the homes have power again. The night was dark with this plan.',
  recap: { roof: 'The solar roofs', turb: 'The wind turbines', bat: 'The battery' },
  recapBat: 'Yes. The battery saved spare power from the day, and sent it to the homes after sunset.', recapBatNo: 'The turbines helped, but there are only a few. The battery sent the rest of the power after sunset.',
  recapWind: 'Yes. The wind kept blowing after sunset, so the turbines kept the lights on.', recapWindNo: 'The solar roofs make no power after sunset. The wind kept blowing, so the turbines kept the lights on.',
  recapNone: 'After sunset the solar roofs made no power, so nothing kept the lights on. A battery can save power from the day for the night.',
  endT: 'The first winter morning', endSay: { g: 'Morning comes, and every home was warm and bright all night.', f: 'Morning comes. Some homes were dark in the night.', p: 'Morning comes. The homes were dark in the night.' } };

// ---- 2. the plans, and what the checks find --------------------------------------------------------------------------------------------
// The child's words shape one plan: the first gap says which plan, and the second gap says what that plan does with spare power.
// Florence still offers the other two plans as they are in the wireframes, so that there is something to compare.
// The numbers are the same everywhere: six homes need six beads, a turbine makes one bead by day and by night, and a solar roof makes one bead by day.
const ROOFS = [6, 0, 4], TURBS = [0, 6, 4], CELLS = 6;
const CFG = [{}, {}, {}];
function setWords(list) { const mine = list[0] ?? 2, how = list[1] ?? 1; CFG.forEach((c, i) => { c.mine = i === mine && list[0] !== undefined; c.battery = i === mine ? how === 1 : i === 2; c.off = i === mine && how === 2; }); plans.forEach((p, i) => Object.assign(p, planDef(i))); }
const litAt = (i) => (CFG[i].off ? 0 : i === 0 ? 0 : i === 1 ? 6 : CFG[i].battery ? 6 : 4), mark = (n) => (n === 6 ? 'g' : n ? 'f' : 'p');
const icon = (i, c) => `<svg class="tagpic" viewBox="0 0 44 36" aria-hidden="true"><rect x="1.5" y="1.5" width="41" height="33" rx="6" fill="#fff" stroke="#1f2a44" stroke-width="3"/>${i !== 1 ? `<circle cx="${i ? 12 : 16}" cy="13" r="5.5" fill="#ffd257" stroke="#1f2a44" stroke-width="2.5"/>` : ''}${i ? `<g transform="translate(${i === 1 ? 15 : 24} 15)" stroke="#1f2a44" stroke-width="3" stroke-linecap="round"><path d="M0 0v15M0 0l-7-4M0 0l7-4M0 0v-9"/></g>` : ''}${c.battery ? '<rect x="29" y="15" width="10" height="15" rx="2" fill="#2e9b5a" stroke="#1f2a44" stroke-width="2.5"/><rect x="32" y="11.5" width="4" height="4" fill="#1f2a44"/>' : c.off ? '<path d="M30 30a7 7 0 1 1 6-12a6 6 0 0 0-6 12z" fill="#1f2a44"/>' : ''}</svg>`;
const planDef = (i) => { const c = CFG[i], x = c.off ? W.extra.off : c.battery ? W.extra.bat : W.extra.none; return { name: i === 2 && c.battery ? W.full2 : `${W.base[i]}${c.off ? ', off at night' : c.battery ? ' and a battery' : ''}`, lines: [W.short[i], x], icon: icon(i, c) }; };
const plans = [{}, {}, {}]; setWords([]);
const lightText = (i) => { const c = CFG[i]; return c.off ? W.lights.off : i === 2 && !c.battery ? W.lights.two : W.lights[`on${i}`]; };
const results = (i) => { const n = litAt(i); return [{ check: W.checks[0], evidence: meter(n, W.homesLit(n), 6), text: lightText(i), mark: mark(n) }, { check: W.checks[1], text: W.nature[i], mark: i === 1 ? 'f' : 'g' }, { check: W.checks[2], text: W.air[i], mark: 'g' }]; };
const after = (i) => (i === 2 && CFG[2].battery ? W.after2 : `${lightText(i)} ${W.nature[i]}`);

// ---- 3. the sky: seven moments of a winter day, each with a sky, a place for the sun, and the strength of the light ---------------------
// u is where the sun is on its low winter path, from 0 (rising on the left) to 1 (setting on the right). n is how much of the night has come
const K = { morning: { sky: ['#4f8fe0', '#bcd6ee', '#ffe3c2'], u: 0.14, sunP: 2.6, sunC: '#ffe0b0', hemi: 1.25, n: 0 }, midday: { sky: ['#3f8fe2', '#a9d2f2', '#f1f1e6'], u: 0.5, sunP: 3.1, sunC: '#fff3dc', hemi: 1.45, n: 0 },
  afternoon: { sky: ['#4078cc', '#c2c6e0', '#ffd49a'], u: 0.84, sunP: 2.9, sunC: '#ffc27a', hemi: 1.15, n: 0 }, late: { sky: ['#3d6cc0', '#d3bfcf', '#ffc680'], u: 0.83, sunP: 2.8, sunC: '#ffb96c', hemi: 1.1, n: 0.05 },
  sunset: { sky: ['#2c3c86', '#d9836a', '#ffb04a'], u: 0.965, sunP: 1.5, sunC: '#ff8f4a', hemi: 0.9, n: 0.42 }, dusk: { sky: ['#141c56', '#4d4a92', '#d9785e'], u: 1.07, sunP: 0, sunC: '#ff8f4a', hemi: 0.64, n: 0.82 },
  night: { sky: ['#060a22', '#121a48', '#2a3470'], u: 1.2, sunP: 0, sunC: '#ff8f4a', hemi: 0.66, n: 1 }, nightB: { sky: ['#060a22', '#121a48', '#2a3470'], u: -0.14, sunP: 0, sunC: '#ffb48c', hemi: 0.66, n: 1 },
  dawn: { sky: ['#3a4c9c', '#e99aa6', '#ffcf9a'], u: 0.055, sunP: 1.3, sunC: '#ffb48c', hemi: 0.88, n: 0.5 } };
const HY = 5.65, STRIPES = ['#e0503a', '#3f78b5', '#2e9b5a', '#8a5fc2'], CX = [-26, 0, 26], HX = [-2.6, 2.6, 7.8, 0, 5.2, 10.4], WIDE = { eye: [0, 9.6, 37], at: [0, 7.6, -22], fov: 44 }, CARDS = { eye: [0, 10.4, 37], at: [0, -1.5, -22], fov: 44 };
const playCam = (h) => ({ eye: [CX[h] * 0.62 + 1, 10.5, 15], at: [CX[h] + 2.4, 9.4, -26], fov: 46 });
const c0 = new THREE.Color(), c1 = new THREE.Color(), V = (a) => new THREE.Vector3(...a);
const BEAD = new THREE.BoxGeometry(0.52, 0.52, 0.52), glowM = (hex, k) => new THREE.MeshBasicMaterial({ color: hot(hex, k), fog: false });

// the drag of the sun and the moon in the play break: the scene on the stage says what a press and a move do
let dragging = false; canvas.addEventListener('pointerdown', (e) => { if (cur && cur.dragStart && cur.dragStart(e)) { dragging = true; canvas.setPointerCapture(e.pointerId); } });
canvas.addEventListener('pointermove', (e) => { if (dragging && cur && cur.dragMove) cur.dragMove(e); });
for (const n of ['pointerup', 'pointercancel']) canvas.addEventListener(n, () => { if (dragging && cur && cur.dragEnd) cur.dragEnd(); dragging = false; });

function hilltop() {
  const s = newScene(64, { haze: 0.0068, skies: [K.late.sky, K.late.sky, K.late.sky], lightPower: 1.1 }), g = s.g; Object.assign(s, WIDE, { still: false, bloom: 0.62, ao: 0.7, arc: { c: 0, w: 92, top: 62 }, n: 0, made: {}, stripe: 0 });
  s.sun.shadow.camera.far = 260; const fill = new THREE.DirectionalLight('#ffe9cf', 0.8); fill.position.set(-20, 30, 60); s.scene.add(fill);
  const rod = (par, a, b, th, hex, o = {}) => { const A = V(a), Bv = V(b), m = new THREE.Mesh(new THREE.BoxGeometry(th, th, A.distanceTo(Bv)), o.mat || M(hex)); m.position.copy(A).add(Bv).multiplyScalar(0.5); m.lookAt(Bv); par.add(m); return m; };
  const gy = (z) => (z > -23 ? 0 : z > -44 ? 4.2 : z > -58 ? 7 : 10);

  // ---- the land: the hilltop in front, the valley, two terraces, the far ridge and pale hills behind it ----
  const GRASS = ['#a5cc9c', '#9cc592', '#93bd8b', '#89b384'];
  B(g, 0, -10, 240, 72, -2, 2, GRASS[0], { tex: 'grass' }); B(g, 0, -33.5, 240, 21, 0, 4.2, GRASS[1], { tex: 'grass' }); B(g, 0, -51, 240, 14, 0, 7, GRASS[2], { tex: 'grass' }); B(g, 0, -81, 280, 46, 0, 10, GRASS[3], { tex: 'grass' });
  for (let k = 0; k < 16; k++) { const x = -120 + k * 16 + hash(k, 2) * 8; B(g, x, -84 - hash(k, 5) * 12, 12 + hash(k, 3) * 14, 16, 10, 0.5 + hash(k, 4) * 2.2, GRASS[3], { tex: 'grass' }); }
  for (let k = 0; k < 9; k++) { const x = -150 + k * 38 + hash(k, 8) * 14, h = 13 + hash(k, 9) * 10; B(g, x, -128, 44 + hash(k, 7) * 20, 10, 0, h, '#8fa6c8', NO_SH); B(g, x + 6, -128, 20, 10, h, 3 + hash(k, 6) * 3, '#8fa6c8', NO_SH); B(g, x + 6, -128, 12, 10.2, h + 3, 1.2, '#f4f7ff', NO_SH); }
  B(g, 0, 44, 160, 36, -2, HY + 2, '#cfe6c2', { tex: 'grass' }); B(g, 0, 24.5, 160, 3, -2, HY + 0.6, '#c2dcb5', { tex: 'grass' }); B(g, 0, 22, 160, 2.4, -2, HY - 0.9, '#b5d2a8', { tex: 'grass' });
  for (let k = 0; k < 26; k++) { const x = -60 + hash(k, 21) * 120, z = 10 - hash(k, 22) * 30, w = 1.6 + hash(k, 23) * 3.4; B(g, x, z, w, w * 0.6, 0, 0.07, '#ffffff', NO_SH); }
  for (let k = 0; k < 9; k++) { const x = -5 + hash(k, 31) * 12, z = 27 + hash(k, 32) * 5; B(g, x, z, 0.5 + hash(k, 33), 0.4, HY, 0.06, '#ffffff', NO_SH); }
  for (let k = 0; k < 22; k++) B(g, -13 + Math.sin(k * 0.7) * 1.6, 19 - k * 1.95, 3.4, 2.2, 0, 0.06, '#7db6dc', { ...NO_SH, raw: true });   // the river, between the first two neighbourhoods
  for (let k = 0; k < 11; k++) { const z = 8 - k * 2.9; B(g, 13 + hash(k, 41) * 0.5, z, 1.7, 2.7, 0, 1.3 + hash(k, 42) * 0.5, ['#5e9a62', '#6aa76a'][k % 2]); B(g, 13, z, 1.3, 2.2, 1.4, 0.14, '#ffffff', NO_SH); }   // the hedge, between the last two
  const pine = (x, z, k = 1) => { const y = gy(z), p = group(g, x, y, z); B(p, 0, 0, 0.4 * k, 0.4 * k, 0, 1.1 * k, '#6b4a2e'); [[2.6, 1.3], [2.0, 1.2], [1.3, 1.2], [0.7, 0.9]].forEach(([w, h], j) => { B(p, 0, 0, w * k, w * k, (0.9 + j * 1.05) * k, h * k, ['#3f7f5a', '#3a7654'][j % 2]); }); B(p, 0, 0, 0.8 * k, 0.8 * k, 5.0 * k, 0.14 * k, '#ffffff', NO_SH); };
  for (const [x, z, k] of [[-44, -26, 1.2], [-41, -30, 0.9], [-12.5, -27, 1.1], [14, -29, 1.2], [16.5, -26, 0.8], [47, -27, 1.1], [-34, -48, 1.3], [-22, -50, 1], [-6, -49, 1.2], [9, -50, 1], [22, -48, 1.3], [-52, -50, 1.1], [58, -30, 1.2], [-58, -14, 1.3], [-50, -8, 1], [52, -6, 1.2]]) pine(x, z, k);
  for (const [x, z, k] of [[-16.5, 22.6, 1.25], [-19.6, 23.4, 0.9], [15.5, 23, 1.1], [18.4, 22.5, 1.35]]) { const p = group(g, x, HY - 4, z); B(p, 0, 0, 0.4 * k, 0.4 * k, 0, 1.4 * k, '#6b4a2e'); [[2.6, 1.3], [2.0, 1.2], [1.3, 1.2], [0.7, 0.9]].forEach(([w, h], j) => B(p, 0, 0, w * k, w * k, (1.2 + j * 1.05) * k, h * k, ['#3f7f5a', '#356e4e'][j % 2])); }

  // ---- the sky: the sun on its low winter path, the moon, the stars and a few clouds ----
  const sunM = glowM('#ffd27a', 2.4), sunBox = new THREE.Mesh(new THREE.BoxGeometry(9, 9, 1), sunM); g.add(sunBox);
  const moonM = glowM('#eef2ff', 1.5), moonBox = new THREE.Mesh(new THREE.BoxGeometry(6.5, 6.5, 1), moonM); g.add(moonBox); moonBox.visible = false; { const bite = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1.1), new THREE.MeshBasicMaterial({ color: '#c9d2ee', fog: false })); bite.position.set(1.2, 1, 0.1); moonBox.add(bite); }
  const starM = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false, transparent: true, opacity: 0 }); for (let k = 0; k < 70; k++) { const m = new THREE.Mesh(BEAD, starM); m.position.set(-170 + hash(k, 51) * 340, 26 + hash(k, 52) * 100, -175); m.scale.setScalar(0.9 + hash(k, 53) * 1.6); g.add(m); }
  const cloudM = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false, transparent: true, opacity: 0.9 }), clouds = [[-70, 62, 1.2], [36, 74, 1], [96, 52, 0.8], [-128, 84, 1.3]].map(([x, y, k]) => { const c = group(g, x, y, -165); for (const [dx, dy, w, h] of [[0, 0, 30, 3.4], [5, 3.2, 16, 3], [-9, -2.6, 14, 2.4]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w * k, h * k, 1), cloudM); m.position.set(dx * k, dy * k, 0); c.add(m); } return c; });
  const arcAt = (u) => [s.arc.c + s.arc.w * (2 * u - 1), 8 + (s.arc.top - 8) * Math.sin(Math.PI * u), -150];
  // the dotted path of the sun, and the yellow mark that shows where to drag it next (play break only)
  const dotM = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false, transparent: true, opacity: 0.75, depthTest: false }), dots = Array.from({ length: 17 }, () => { const m = new THREE.Mesh(BEAD, dotM); m.scale.setScalar(2.2); m.renderOrder = 5; m.visible = false; g.add(m); return m; });
  const markM = new THREE.MeshBasicMaterial({ color: hot('#ffdf3d', 1.5), fog: false, depthTest: false }), inkM = new THREE.MeshBasicMaterial({ color: '#1f2a44', fog: false, depthTest: false }), mark = group(g, 0, 0, -150); { const a = new THREE.Mesh(new THREE.BoxGeometry(13, 13, 0.5), inkM), b = new THREE.Mesh(new THREE.BoxGeometry(10.4, 10.4, 0.6), markM); a.renderOrder = 6; b.renderOrder = 7; mark.add(a, b); mark.visible = false; }
  const setArc = (a, show) => { s.arc = a; dots.forEach((m, k) => { m.position.set(...arcAt(k / 16)); m.visible = show; }); if (s.last) look(...s.last); };

  // look(A, B, k) shows the sky between two moments. Everything that depends on the time of day follows from it
  const SKYDAY = new THREE.Color('#e2ecff'), SKYNIGHT = new THREE.Color('#6d7ed0'), GRDAY = new THREE.Color('#e6c69a'), GRNIGHT = new THREE.Color('#222b52');
  function look(A, Bk, k, o = {}) { s.last = [A, Bk, k, o]; const L = (a, b) => a + (b - a) * k, u = o.u ?? L(A.u, Bk.u), n = L(A.n, Bk.n), sunP = L(A.sunP, Bk.sunP), p = arcAt(u); s.n = n; s.u = u;
    s.scene.fog.color.copy(drawSky(k, 0, [A.sky, Bk.sky, Bk.sky])); sunBox.position.set(...p); sunBox.visible = u > -0.2 && u < 1.2; c0.set(A.sunC).lerp(c1.set(Bk.sunC), k); sunM.color.copy(c0).multiplyScalar(2.3);
    if (sunP > 0.2) { s.sun.color.copy(c0); s.sun.intensity = sunP; s.sun.position.set(p[0] * 0.55, Math.max(9, p[1] * 0.75), -112); } else { s.sun.color.set('#a9bcff'); s.sun.intensity = 0.2 + 0.5 * n; s.sun.position.set(-34, 70, -70); }
    s.sun.target.position.set(0, 0, -20); s.hemi.intensity = L(A.hemi, Bk.hemi); s.hemi.color.copy(SKYDAY).lerp(SKYNIGHT, n); s.hemi.groundColor.copy(GRDAY).lerp(GRNIGHT, n); fill.intensity = 0.8 * (1 - n);
    starM.opacity = Math.max(0, n * 1.6 - 0.6); cloudM.color.copy(c1.set('#ffffff')).lerp(s.scene.fog.color, 0.35 + 0.4 * n); cloudM.opacity = 0.9 - 0.55 * n; paint(); }
  const setMoon = (u) => { moonBox.visible = u !== null && u > -0.05 && u < 1.03; if (u !== null) moonBox.position.set(...arcAt(u)); s.moonU = u; };

  // ---- the three neighbourhoods: six homes each on two levels, a post with a lantern where the power arrives, and a battery barn ----
  const WALLS = ['#f1dcb4', '#e9c9a0', '#f4e6c8', '#e6b98c', '#efd2a6', '#f6e0bd'], TILES = ['#b5533f', '#3f6f9e', '#a8473a', '#4f8a6a', '#c0623f', '#3f6f9e'], DOORS = ['#3f78b5', '#c8643f', '#2e9b5a', '#8a5fc2', '#e9ad1c', '#b3243a'];
  const DAYGLASS = new THREE.Color('#a9cde8'), DARK = new THREE.Color('#0d1330'), LIT = hot('#ffc860', 2.7), PIPON = hot('#fff0a0', 2.3), PIPOFF = new THREE.Color('#566080'), stripeM = new THREE.MeshLambertMaterial({ color: STRIPES[0] }), panelM = new THREE.MeshLambertMaterial({ color: '#2848a6', emissive: '#16307a', emissiveIntensity: 0.5 });
  s.setStripe = (k) => { s.stripe = k; stripeM.color.set(STRIPES[k]); };
  const homes = CX.map((cx, h) => HX.map((lx, i) => { const back = i > 2, x = cx + lx, y = back ? 4.2 : 0, z = back ? -28 : -18, hg = group(g, x, y, z), n = h * 6 + i, winM = new THREE.MeshBasicMaterial({ color: DAYGLASS.clone() }), pipM = new THREE.MeshBasicMaterial({ color: PIPOFF.clone(), fog: false });
    B(hg, 0, 0, 3.8, 3.4, 0, 3.2, WALLS[n % 6]); B(hg, 0, 0, 4.3, 3.9, 3.2, 0.7, TILES[(n + h) % 6], { tex: 'tile' }); B(hg, 0, 0, 3.0, 3.9, 3.9, 0.7, TILES[(n + h) % 6], { tex: 'tile' }); B(hg, 0, 0, 1.5, 3.9, 4.6, 0.5, TILES[(n + h) % 6], { tex: 'tile' }); B(hg, 0, 0, 1.6, 4, 5.1, 0.12, '#ffffff', NO_SH); B(hg, 1.3, -0.8, 0.6, 0.6, 4, 1.5, '#b98a6a');
    B(hg, -1.05, 1.72, 0.95, 0.08, 0, 1.75, DOORS[n % 6]); B(hg, 0.72, 1.72, 2.1, 0.06, 0.95, 1.6, '#fff6e2'); B(hg, 0.72, 1.76, 1.8, 0.06, 1.1, 1.3, '#fff', { mat: winM, shadow: false }); B(hg, 0.72, 1.8, 0.12, 0.06, 1.1, 1.3, '#fff6e2', NO_SH); B(hg, -1.05, 1.74, 0.9, 0.06, 2.0, 0.7, '#fff', { mat: winM, shadow: false });
    const pip = B(hg, -1.05, 1.9, 0.62, 0.3, 3.5, 0.62, '#fff', { mat: pipM, shadow: false }); pip.visible = false;
    const panel = group(hg, 0, 4.15, 1.75); panel.rotation.x = -0.85; B(panel, 0, 0, 3.3, 0.1, -0.85, 1.7, '#fff', { mat: stripeM }); B(panel, 0, 0.06, 3.0, 0.1, -0.7, 1.4, '#fff', { mat: panelM, shadow: false }); for (const dx of [-0.75, 0, 0.75]) B(panel, dx, 0.1, 0.07, 0.06, -0.7, 1.4, '#dfe8ff', NO_SH); panel.visible = false;
    const waver = fig(hg, -1.05, 0, 2.7, { k: 1.45, shirt: SHIRTS[n % 6], skin: FAMILY[n % 3].skin, hair: FAMILY[(n + 1) % 3].hair, arms: ['up', 'down'] }); waver.visible = false;
    return { g: hg, x, y, z, winM, pipM, pip, panel, waver, lit: false, fed: false }; }));
  const paint = () => { const nn = Math.min(1, s.n * 1.7); for (const row of homes) for (const q of row) { q.winM.color.copy(DAYGLASS).lerp(q.lit ? LIT : DARK, nn); q.pipM.color.copy(q.fed ? PIPON : PIPOFF); } for (const p of posts) p.m.color.copy(p.on ? hot('#ffe9a0', 1.2 + 1.8 * nn) : PIPOFF); };
  for (const cx of CX) { B(g, cx + 2.6, -14.6, 17, 1.7, 0, 0.06, '#ead9b4', NO_SH); B(g, cx + 5.2, -24.7, 17, 1.5, 4.2, 0.06, '#ead9b4', NO_SH); for (let k = 0; k < 4; k++) B(g, cx - 6.4 + k * 0.5, -23.6 + k * 0.42, 1.6, 0.42, 0, 4.2 - k * 1.05, '#d9c7a2'); }
  const posts = CX.map((cx) => { const m = new THREE.MeshBasicMaterial({ color: PIPOFF.clone(), fog: false }); B(g, cx - 5.6, -22, 0.4, 0.4, 0, 8, '#4a556e'); B(g, cx - 5.6, -22, 1.5, 1.5, 7.9, 0.2, '#4a556e'); B(g, cx - 5.6, -22, 1.0, 1.0, 8.1, 1.0, '#fff', { mat: m, shadow: false }); B(g, cx - 5.6, -22, 1.4, 1.4, 9.1, 0.25, '#4a556e'); return { m, on: false, top: [cx - 5.6, 8.6, -22] }; });
  const cellOn = glowM('#ffe680', 1.45), cellOff = M('#27304f');
  const barns = CX.map((cx, h) => { const bx = cx - 9.6, bz = -16.6, bg = group(g, bx, 0, bz); B(bg, 0, -0.5, 5, 0.3, 0, 3.6, '#c9a476', { tex: 'board' }); for (const dx of [-2.35, 2.35]) B(bg, dx, 0, 0.3, 1.3, 0, 3.6, '#c9a476', { tex: 'board' }); B(bg, 0, 0, 5.4, 1.7, 3.6, 0.35, '#8a6b4c'); B(bg, 0, 0, 5.4, 1.75, 3.95, 0.5, '#fff', { mat: stripeM }); B(bg, 0, 0, 5, 1.3, 0, 0.2, '#8a6b4c'); B(bg, 0, 0, 4.4, 1.2, 1.72, 0.14, '#8a6b4c'); B(bg, 0, 0, 3, 1.75, 4.45, 0.1, '#ffffff', NO_SH);
    const cells = [0, 1, 2, 3, 4, 5].map((k) => { const m = B(bg, (k % 3 - 1) * 1.42, 0.1, 1.15, 0.9, 0.3 + Math.floor(k / 3) * 1.64, 1.15, '#27304f', { mat: cellOff, shadow: false }); return { m, at: [bx + (k % 3 - 1) * 1.42, 0.9 + Math.floor(k / 3) * 1.64, bz + 0.2] }; }); const num = plate(s, '', [bx - 0.2, 6.1, bz], 'num'); num.hide = true; bg.visible = false;
    return { g: bg, cells, num, n: 0, x: bx, z: bz }; });
  const setCount = (h, n) => { const b = barns[h]; b.n = n; b.cells.forEach((c, k) => { c.m.material = k < n ? cellOn : cellOff; }); b.num.el.innerHTML = `${n}<small>${W.inBat}</small>`; };

  // ---- the turbines: a long row of places on the far ridge (the wind farm), and a few places on a low knoll to one side (wind and sun) ----
  function turbine(x, y, z, k, H) { const t = group(g, x, y, z); B(t, 0, 0, 1.1 * k, 1.1 * k, 0, H * 0.5, '#f6f3ec'); B(t, 0, 0, 0.85 * k, 0.85 * k, H * 0.5, H * 0.5, '#f6f3ec'); B(t, 0, 0, 1.2 * k, 1.2 * k, H * 0.3, 0.9 * k, '#fff', { mat: stripeM }); B(t, 0, 0.3 * k, 1.2 * k, 2.2 * k, H, 1.1 * k, '#ebe7de'); const rotor = group(t, 0, H + 0.55 * k, 1.6 * k); B(rotor, 0, 0, 0.8 * k, 0.5 * k, -0.4 * k, 0.8 * k, '#4a556e');
    for (let j = 0; j < 3; j++) { const b = group(rotor); b.rotation.z = j * Math.PI * 2 / 3; B(b, 0, 0, 0.62 * k, 0.16 * k, 0.2 * k, 5.2 * k, '#ffffff'); } t.visible = false; return { g: t, rotor, x, y, z, H, k }; }
  const ridgeT = Array.from({ length: 8 }, (_, j) => turbine(-24.5 + j * 7, 10, -66, 1, 11)), knollT = Array.from({ length: 6 }, (_, j) => turbine(29 + j * 4.6, 7, -50 - (j % 2) * 3, 0.72, 7));
  B(g, 40.5, -51.5, 30, 9, 7, 0.9, GRASS[2], { tex: 'grass' }); knollT.forEach((t) => { t.g.position.y = t.y = 7.9; });
  const DEF = { ridge: [1, 2, 3, 4, 5, 6], knoll: [0, 1, 2, 3], roofs0: [0, 1, 2, 3, 4, 5], roofs2: [0, 1, 2, 4] };
  // the tall turbine beside the family: only its foot and, now and then, the tip of a blade are in the picture
  const near = turbine(-10.4, HY - 2.2, 21.5, 1.5, 19); near.g.visible = true; near.rotor.children.slice(1).forEach((b) => b.scale.set(1, 1.5, 1));

  // ---- beads of light: power on its way. A stream is a line of beads that keep moving along a raised line ----
  const beadM = glowM('#fff0a0', 1.9), lineM = M('#56607c'), streams = [];
  function stream(pts, n, speed, line = true) { const P = pts.map(V), len = [0]; for (let k = 1; k < P.length; k++) len.push(len[k - 1] + P[k].distanceTo(P[k - 1])); const lg = group(g);
    if (line) for (let k = 1; k < P.length; k++) { rod(lg, pts[k - 1], pts[k], 0.14, '#56607c', { mat: lineM }); const mid = P[k - 1].clone().lerp(P[k], 0.5), y0 = gy(mid.z); if (P[k].distanceTo(P[k - 1]) > 16 && mid.y - y0 > 1) B(lg, mid.x, mid.z, 0.3, 0.3, y0, mid.y - y0, '#56607c'); }
    const beads = Array.from({ length: n }, () => { const m = new THREE.Mesh(BEAD, beadM); m.visible = false; g.add(m); return m; }), st = { P, len, beads, speed, on: 0, lg }; lg.visible = false; streams.push(st); return st; }
  const J = [0, 11.3, -63.4], KJ = [40, 9.4, -47.2]; B(g, J[0], J[2], 1.6, 1.2, 10, 1.1, '#4a556e'); B(g, KJ[0], KJ[2], 1.3, 1, 7.9, 1.2, '#4a556e');
  const rails = [stream([[-24.5, 10.5, -64.4], [0, 10.5, -64.4], J], 6, 4.5), stream([[24.5, 10.5, -64.4], [0, 10.5, -64.4], J], 6, 4.5), stream([[54, 8.5, -48.4], [40, 8.5, -48.4], KJ], 3, 4.5), stream([[29, 8.5, -48.4], [40, 8.5, -48.4], KJ], 3, 4.5)];
  const ridgeL = posts.map((p) => stream([J, p.top], 7, 5.5)), knollL = posts.map((p) => stream([KJ, p.top], 6, 5.5)), battL = barns.map((b, h) => stream([[b.x, 4.6, b.z], [b.x, 8.6, b.z - 2.6], posts[h].top], 3, 3));
  const roofS = homes.map((row) => row.map((q) => stream([[q.x + 1.6, q.y + 8.4, q.z + 1.2], [q.x, q.y + 4.6, q.z + 1.6]], 2, 2.2, false)));
  // which plan each neighbourhood runs, and what follows from it
  s.ham = [-1, -1, -1];
  const roofsOf = (p) => (p === 0 ? (s.made[0] || {}).roofs || DEF.roofs0 : p === 2 ? (s.made[2] || {}).roofs || DEF.roofs2 : []);
  function equip(list) { s.ham = list; list.forEach((p, h) => { const r = roofsOf(p); homes[h].forEach((q, i) => { q.panel.visible = r.includes(i); }); barns[h].g.visible = p >= 0 && CFG[p].battery; barns[h].num.hide = !barns[h].g.visible; });
    const rs = (s.made[1] || {}).turbs || DEF.ridge, ks = (s.made[2] || {}).turbs || DEF.knoll; ridgeT.forEach((t, j) => { t.g.visible = list.includes(1) && rs.includes(j); t.g.scale.setScalar(1); }); knollT.forEach((t, j) => { t.g.visible = list.includes(2) && ks.includes(j); t.g.scale.setScalar(1); }); flows(); }
  // the streams follow the sky: the roofs make power while the sun is up, the turbines always, and the battery sends power at night
  function flows() { const sunUp = Math.max(0, Math.min(1, 1 - s.n * 2.2)), night = s.n > 0.6, any = (p) => s.ham.includes(p) && !s.playing;
    s.ham.forEach((p, h) => { const c = p >= 0 ? CFG[p] : {}, live = !s.playing && p >= 0 && !(c.off && night); ridgeL[h].on = p === 1 && live ? 1 : 0; ridgeL[h].lg.visible = p === 1; knollL[h].on = p === 2 && live ? 1 : 0; knollL[h].lg.visible = p === 2; battL[h].on = p === 2 && live && c.battery && night && barns[h].n > 0 ? 1 : 0; battL[h].lg.visible = barns[h].g.visible;
      homes[h].forEach((q, i) => { roofS[h][i].on = live && q.panel.visible ? sunUp : 0; }); posts[h].on = live && (p === 1 || p === 2 || (p === 0 && sunUp > 0.15)); });
    rails[0].on = rails[1].on = any(1) ? 1 : 0; rails[0].lg.visible = rails[1].lg.visible = s.ham.includes(1); rails[2].on = rails[3].on = any(2) ? 1 : 0; rails[2].lg.visible = rails[3].lg.visible = s.ham.includes(2); paint(); }
  // which homes have lights at night under the plan of their neighbourhood. k is how far through the lighting-up the town is (0 to 1)
  const lightUp = (h, on) => { const p = s.ham[h], n = p < 0 ? 0 : litAt(p); homes[h].forEach((q, i) => { q.lit = on && i < n; }); };
  // one bead that flies from one place to another in an arc
  const fly = (a, b, sec = 0.7, lift = 2.4) => { const m = new THREE.Mesh(BEAD, beadM), A = V(a), Bv = V(b); m.position.copy(A); m.scale.setScalar(1.5); g.add(m); return tw(sec, (k) => { const e = ease(k); m.position.lerpVectors(A, Bv, e); m.position.y += Math.sin(Math.PI * e) * lift; }).then(() => { g.remove(m); }); };

  // ---- the family on the hilltop, a kite that shows the wind, people in the town, and the geese ----
  const fam = group(g, 3.9, HY, 29.2), scarves = [];
  const person = (who, x, z, o, scarf) => { const p = fig(fam, x, 0.02, z, { ...FAMILY[who], ...o }); B(p, 0, 0.02, 0.62, 0.4, 1.06, 0.14, scarf); const tail = group(p, 0.3, 1.1, -0.18); B(tail, 0.28, 0, 0.56, 0.1, -0.06, 0.16, scarf); scarves.push(tail); return p; };
  const kid = person(0, -2.5, 0.9, { turn: -0.75, arms: ['up', 'down'], pack: '#ffd257' }, '#ffd257'); person(1, 0.1, 0.2, { turn: -1.05, arms: ['down', 'up'] }, '#e0503a'); person(2, 1.6, 0.9, { turn: -0.5, head: -0.5 }, '#ffffff');
  const famPlate = plate(s, W.family, [4.4, HY + 2.9, 29.6], 'on');
  const kite = group(g, -5.4, 15.2, 16); { const d = group(kite); d.rotation.z = Math.PI / 4; B(d, 0, 0, 1.9, 0.12, -0.95, 1.9, '#e0503a', { raw: true }); B(d, 0, 0.07, 0.95, 0.06, -0.95, 0.95, '#ffd257', { raw: true, shadow: false }); }
  const tails = [0, 1, 2, 3].map((k) => B(kite, -0.5 - k * 0.55, 0, 0.42, 0.08, -1.7 - k * 0.42, 0.26, ['#ffd257', '#3f78b5', '#ffd257', '#2e9b5a'][k], { raw: true, shadow: false }));
  const stringM = M('#f7f3e8'); let string = null; const hand = [3.9 - 2.5 - 0.28, HY + 1.72, 29.2 + 0.9 + 0.2];
  const walkers = CX.flatMap((cx, h) => [0, 1].map((j) => { const p = fig(g, cx + 14 - j * 28, 0.06, -14.4, { k: 1.4, ...FAMILY[(h + j) % 3], shirt: SHIRTS[(h * 2 + j) % 6], turn: j ? 1.5 : -1.5, pack: j ? '#ffd257' : null }); p.visible = false; return { p, x0: cx + 14 - j * 28, x1: cx + (j ? -3.6 : 6.8) }; }));
  const geese = group(g), birds = [0, 1, 2, 3, 4, 5, 6].map((k) => { const b = group(geese, Math.ceil(k / 2) * 2.3, -Math.ceil(k / 2) * 0.5, (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 1.2), m = new THREE.MeshBasicMaterial({ color: '#232a45' }); const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.45, 0.5), m); b.add(body); const wings = [-1, 1].map((sd) => { const w = group(b); const wm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 1.9), m); wm.position.z = sd * 0.95; w.add(wm); return { w, sd }; }); return { b, wings }; }); geese.visible = false;
  // the geese cross the sky from right to left. Where the long row of turbines stands on the ridge, they have to bend their path up and over it
  s.flyGeese = (sec) => { geese.visible = true; return tw(sec, (k) => { const x = 78 - 156 * k, bend = s.ham.includes(1) ? Math.exp(-(x * x) / 620) : 0; geese.position.set(x, 27.5 + bend * 8.5, -62); geese.rotation.z = s.ham.includes(1) ? -(x / 310) * Math.exp(-(x * x) / 620) * 8.5 * 0.5 : 0; }).then(() => { geese.visible = false; }); };

  // the tags of the plans, one over each neighbourhood
  const tags = CX.map((cx) => { const t = plate(s, '', [cx + 2.6, 13.2, -24], 'pl'); t.hide = true; return t; });
  const setTags = (show) => tags.forEach((t, h) => { const p = plans[h]; t.el.className = `plate pl${CFG[h].mine ? ' mine' : ''}`; t.el.innerHTML = `${p.icon}<span><b>${p.lines[0]}</b><b>${p.lines[1]}</b></span>`; t.hide = !show; });

  // ---- the hooks that the order of the steps calls ------------------------------------------------------------------------------------
  s.words = (list) => { setWords(list); };
  s.showPlans = async (list) => { const me = run; setWords(list); famPlate.hide = true; s.made = {}; equip([-1, -1, -1]);
    for (const h of [0, 1, 2]) { s.ham[h] = h; equip([...s.ham]); if (h === 2) setCount(2, CFG[2].battery ? CELLS : 0); else setCount(h, 0); const pop = [...homes[h].filter((q) => q.panel.visible).map((q) => q.panel), ...(h === 1 ? ridgeT : h === 2 ? knollT : []).filter((t) => t.g.visible).map((t) => t.g), ...(barns[h].g.visible ? [barns[h].g] : [])];
      beep(380 + h * 70, 0.08); await tw(0.7, (k) => pop.forEach((o) => o.scale.setScalar(Math.max(0.01, back(k))))); if (me !== run) return; tags[h].hide = false; setTags(true); tags.forEach((t, j) => { t.hide = j > h; }); await wait(0.25); if (me !== run) return; } };
  s.test = async (api) => { const me = run, off = (h) => litAt(h) < 6;
    await tw(7, (k) => (k < 0.62 ? look(K.late, K.sunset, k / 0.62) : look(K.sunset, K.dusk, (k - 0.62) / 0.38))); if (me !== run) return false; flows();
    api.say([W.t2]); walkers.forEach((w) => { w.p.visible = true; }); const order = homes.flatMap((row, h) => row.map((q, i) => ({ q, h, i, at: hash(h * 6 + i, 77) })));
    await tw(3.2, (k) => { walkers.forEach((w, j) => { w.p.position.x = w.x0 + (w.x1 - w.x0) * ease(k); w.p.position.y = 0.06 + Math.abs(Math.sin(k * 18 + j)) * 0.14; }); let ch = false; for (const o of order) if (!o.q.lit && k > 0.25 + o.at * 0.6) { o.q.lit = true; ch = true; } if (ch) { paint(); beep(700, 0.03, 'sine', 0.03); } }); if (me !== run) return false; walkers.forEach((w) => { w.p.visible = false; });
    // the homes that have no power go dark again, one after another
    for (const h of [0, 1, 2]) if (off(h)) for (let i = 5; i >= litAt(h); i--) { homes[h][i].lit = false; paint(); beep(220, 0.08, 'sine', 0.05); await wait(0.28); if (me !== run) return false; }
    api.say([W.t3]); await Promise.all([s.flyGeese(8.5), tw(8.5, (k) => { look(K.dusk, K.night, k); flows(); })]); if (me !== run) return false;
    api.say([W.t4]); const n0 = barns[2].n; await tw(8, (k) => { setMoon(0.08 + 0.84 * k); const n = Math.max(n0 ? 2 : 0, n0 - Math.floor(k * 4.01)); if (n !== barns[2].n && CFG[2].battery) { setCount(2, n); beep(520 - n * 30, 0.1); } }); if (me !== run) return false;
    api.say([W.t5]); await tw(3, (k) => { look(K.nightB, K.dawn, ease(k) * 0.32); setMoon(0.92 + 0.14 * k); }); return me === run; };
  s.showResults = () => { glide(CARDS, 1.4); setTags(true); tags.forEach((t) => { t.pos.y = 12.2; }); };
  s.asking = () => { famPlate.hide = true; };

  // ---- the play break: place the parts, then run one winter day by hand ---------------------------------------------------------------
  s.playBreak = async (pick, api) => { const me = run, h = pick, c = CFG[pick], cx = CX[h], hs = homes[h], barn = barns[h], nT = TURBS[pick], nR = ROOFS[pick], alive = () => me === run;
    s.playing = true; setTags(false); geese.visible = false; setMoon(null); s.made[pick] = { turbs: [], roofs: [] }; equip([-1, -1, -1].map((_, j) => (j === h ? pick : -1))); setCount(h, 0); for (const row of homes) for (const q of row) { q.lit = false; q.fed = false; } hs.forEach((q) => { q.pip.visible = true; }); const made = s.made[pick]; flows();
    const from = s.last; glide(playCam(h), 1.8); await tw(1.8, (k) => { if (k < 0.5) look(from[0], from[1], from[2] + (1 - from[2]) * k * 2, from[3]); else look(K.dawn, K.morning, k * 2 - 1); }); if (!alive()) return; setArc({ c: cx * 2.1 + 6, w: 66, top: 44 }, false); look(K.morning, K.morning, 0);
    let phase = 'setup', sel = nT ? 'turb' : 'roof', step = 0, busy = true, spare = [], sent = 0; const left = { turb: nT, roof: nR }, spots = { turb: [], roof: [] }, T = pick === 1 ? ridgeT : knollT;
    // the tray: the parts to place and the colour of the stripe; later the numbers of the day
    const partBtn = (id) => { const b = document.createElement('button'); b.className = 'part'; b.onclick = () => { if (left[id] && phase === 'setup') { sel = id; drawTray(); } }; return b; }, pb = { turb: partBtn('turb'), roof: partBtn('roof') };
    const sw = document.createElement('div'); sw.className = 'stripes'; sw.append(W.stripe, ...STRIPES.map((col, k) => { const b = document.createElement('button'); b.style.background = col; b.setAttribute('aria-label', W.stripeNames[k]); b.onclick = () => { s.setStripe(k); beep(600 + k * 60, 0.06); drawTray(); }; return b; }));
    const nums = document.createElement('div'); nums.className = 'pw'; const backB = btn(W.back, '', () => { if (!busy && step > 0 && phase === 'day') go(step - 1); }); let finB = null;
    function drawTray() { if (!alive()) return; if (phase === 'setup') { for (const id of ['turb', 'roof']) { pb[id].className = `part${sel === id ? ' on' : ''}${left[id] ? '' : ' done'}`; pb[id].innerHTML = `<span>${W.parts[id]}<small>${W.left(left[id])}</small></span>`; } [...sw.querySelectorAll('button')].forEach((b, k) => b.classList.toggle('on', k === s.stripe)); api.tray([...(nT ? [pb.turb] : []), ...(nR ? [pb.roof] : []), sw, ...(finB ? [finB] : [])]); for (const id of ['turb', 'roof']) for (const sp of spots[id]) sp.m.visible = sel === id && !sp.used && left[id] > 0; api.say([sel === 'turb' ? W.setTurb : W.setRoof, ...(pick === 2 || pick === 1 ? [W.setBoth] : [])]); }
      else { const night = step === 3 || step === 4, prod = step === 5 ? 6 : c.off && night ? 0 : nT + (night ? 0 : nR); nums.innerHTML = `<div><b>${prod}</b>${W.made}</div><div><b>6</b>${W.need}</div><div><b>${busy ? Math.max(0, prod - 6) : spare.length}</b>${W.spare}</div><div class="bat"${c.battery ? '' : ' hidden'}><b>${barn.n}</b>${W.bat}</div>`; api.tray([nums, ...(step > 0 && step < 5 ? [backB] : []), ...(finB ? [finB] : [])]); } }
    // the yellow places: more places than parts, so the child chooses
    T.forEach((t, j) => { const m = glowMarks(frame(g, t.x, t.y, t.z + 0.6, 2.6 * t.k + 0.8, t.H * 0.8, true, { fill: 0.55 })), sp = { m, used: false, at: [t.x, t.y + t.H * 0.4, t.z + 0.6] }; m.visible = false; if (nT) spots.turb.push(sp);
      hitBox(s, g, t.x, t.y, t.z, 4.4 * t.k + 0.6, t.H + 3, 3, () => alive() && phase === 'setup' && sel === 'turb' && !sp.used && left.turb > 0, () => put('turb', sp, t.g, j)); });
    hs.forEach((q, i) => { const m = glowMarks(frame(g, q.x, q.y + 3.3, q.z + 2.3, 3.6, 1.9, true, { fill: 0.7 })), sp = { m, used: false, at: [q.x, q.y + 4.2, q.z + 2.3] }; m.visible = false; if (nR) spots.roof.push(sp);
      hitBox(s, g, q.x, q.y + 2.6, q.z + 0.4, 4.6, 3.4, 4.4, () => alive() && phase === 'setup' && sel === 'roof' && !sp.used && left.roof > 0, () => put('roof', sp, q.panel, i)); });
    async function put(id, sp, obj, j) { sp.used = true; sp.m.visible = false; left[id]--; made[id === 'turb' ? 'turbs' : 'roofs'].push(j); obj.visible = true; beep(480 + (6 - left[id]) * 50, 0.09); tw(0.4, (k) => obj.scale.setScalar(Math.max(0.01, back(k)))); if (!left[id]) sel = left.turb ? 'turb' : 'roof'; if (!left.turb && !left.roof) return startDay(); drawTray(); }
    s.spot = (name, i) => (name === 'turb' ? spots.turb[i].at : name === 'roof' ? spots.roof[i].at : name === 'barn' ? [barn.x, 2, barn.z + 0.8] : name === 'home' ? [hs[i].x, hs[i].y + 1.8, hs[i].z + 1.8] : name === 'mark' ? [mark.position.x, mark.position.y, -150] : name === 'body' ? [body().position.x, body().position.y, -150] : [0, 0, 0]);
    s.isBusy = () => busy; s.canSave = () => barnMark.visible; s.sendable = () => hs.map((q, i) => (hMarks[i].visible ? i : -1)).filter((i) => i >= 0); s.phase = () => phase; s.step = () => step; s.darkHomes = () => hs.map((q, i) => (q.fed ? -1 : i)).filter((i) => i >= 0);
    // after about three minutes Florence offers to finish, and nothing is lost
    setTimeout(() => { if (alive() && phase !== 'done') { finB = btn(W.finish, '', finish); drawTray(); } }, 180000);
    busy = false; drawTray();

    // ---- the day: six moments. The sun or the moon is moved by the child, never by a clock ----
    const BODY = [0.14, 0.5, 0.84, 1.0, 0.55, 1.0];   // where the yellow mark for each moment sits on the path
    const TR = [(p) => look(K.morning, K.midday, p), (p) => look(K.midday, K.afternoon, p), (p) => { if (p < 0.6) look(K.afternoon, K.sunset, p / 0.6); else look(K.sunset, K.dusk, (p - 0.6) / 0.4); setMoon(p > 0.97 ? 0.16 : null); }, (p) => { look(K.dusk, K.night, p); setMoon(0.16 + 0.39 * p); }, (p) => { look(K.nightB, K.dawn, p); setMoon(0.55 + 0.5 * p); }];
    const body = () => (step <= 2 ? sunBox : moonBox);
    function showMark() { const on = phase === 'day' && !busy && step < 5; mark.visible = on; if (on) { const p = arcAt(BODY[step + 1]); mark.position.set(p[0], Math.max(p[1], 15), -150); } }
    hitBox(s, mark, 0, -9, 0, 20, 18, 4, () => alive() && mark.visible && !busy, () => go(step + 1));
    let dragP = 0; const rect = () => canvas.getBoundingClientRect(), scr = (o) => project(o.position.x, o.position.y, o.position.z, rect());
    s.dragStart = (e) => { if (!alive() || phase !== 'day' || busy || step >= 5) return false; const q = scr(body()); return Math.hypot(e.clientX - q[0], e.clientY - q[1]) < 80; };
    s.dragMove = (e) => { if (busy) return; const a = arcAt(step <= 2 ? [0.14, 0.5, 0.84][step] : step === 3 ? 0.16 : 0.55), A = project(...a, rect()), Bm = scr(mark), d = Math.hypot(Bm[0] - A[0], Bm[1] - A[1]) || 1; dragP = Math.max(0, Math.min(1, ((e.clientX - A[0]) * (Bm[0] - A[0]) + (e.clientY - A[1]) * (Bm[1] - A[1])) / (d * d))); TR[step](dragP); if (dragP > 0.86) { dragging = false; go(step + 1, dragP); } };
    s.dragEnd = () => { if (!busy && phase === 'day' && dragP > 0 && dragP <= 0.86) { const p0 = dragP, st = step; dragP = 0; tw(0.3, (k) => { if (alive() && step === st && !busy) TR[st](p0 * (1 - k)); }); } };
    function startDay() { phase = 'day'; for (const id of ['turb', 'roof']) for (const sp of spots[id]) sp.m.visible = false; setArc(s.arc, true); chime(); enter(0, true); }
    const clearSpare = () => { for (const m of spare) g.remove(m); spare = []; };
    async function go(k, p0 = 0) { if (busy || !alive() || k < 0 || k > 5) return; busy = true; showMark(); const st = step, fwd = k > st; if (spare.length) { const old = spare; spare = []; tw(0.5, (q) => old.forEach((m) => { m.position.y += 0.08; m.scale.setScalar(1 - q); })).then(() => old.forEach((m) => g.remove(m))); }
      hs.forEach((q) => { q.fed = false; q.lit = false; q.waver.visible = false; }); beep(fwd ? 560 : 420, 0.08); dragP = 0;
      await tw(fwd ? 1.3 * (1 - p0) + 0.1 : 1.1, (q) => TR[fwd ? st : k](fwd ? p0 + (1 - p0) * ease(q) : 1 - ease(q))); if (!alive()) return; step = k; enter(k); }
    // what happens at each moment: the beads are made, every home takes one, and the rest is spare
    async function enter(k, first) { busy = true; step = k; showMark(); drawTray(); if (k === 5) return dawn(); const night = k >= 3, flights = []; let fed = 0; sent = 0;
      if (first) api.say([W.day[0], W.sunHow]); else api.say([night ? (k === 3 ? W.dusk : W.nightT) : W.day[k]]);
      if (!night) hs.forEach((q, i) => { if (q.panel.visible) { fed++; flights.push(wait(i * 0.08).then(() => fly([q.x + 2.2, q.y + 9, q.z + 1], [q.x, q.y + 4.5, q.z + 1.6], 0.6, 0)).then(() => { q.fed = true; paint(); beep(760, 0.04, 'sine', 0.04); })); } });
      const need = hs.filter((q) => !(q.panel.visible && !night)), tur = c.off && night ? [] : T.filter((t) => t.g.visible); let extra = 0;
      tur.forEach((t, j) => { const from = [t.x, t.y + t.H + 0.5, t.z + 1.5], q = need[j]; if (q) { flights.push(wait(0.3 + j * 0.14).then(() => fly(from, [q.x - 1.05, q.y + 3.8, q.z + 1.9], 1.1, 5)).then(() => { q.fed = true; if (night) q.lit = true; paint(); beep(820, 0.04, 'sine', 0.04); })); } else { const n = extra++; flights.push(wait(0.3 + j * 0.14).then(() => fly(from, spareAt(n), 1.1, 5)).then(() => { if (alive() && step === k) { const m = new THREE.Mesh(BEAD, beadM); m.scale.setScalar(1.5); m.position.set(...spareAt(n)); g.add(m); spare.push(m); } })); } });
      await Promise.all(flights); await wait(0.2); if (!alive() || step !== k) return; busy = false; drawTray(); showMark(); const dark = hs.filter((q) => !q.fed).length;
      if (!night) { if (!spare.length) api.say([W.day[k], W.enough, k === 0 ? W.sunHow : '']); else if (c.battery && barn.n < CELLS) { api.say([W.day[k], W.spareSave(spare.length)]); barnMark.visible = true; } else if (c.battery) api.say([W.day[k], W.full]); else { api.say([W.day[k], W.spareLost(spare.length)]); const old = spare; spare = []; tw(1.6, (q) => old.forEach((m) => { m.position.y += 0.05; m.scale.setScalar(Math.max(0.01, 1 - q)); })).then(() => old.forEach((m) => g.remove(m))); } }
      else { const head = k === 3 ? W.dusk : W.nightT; if (c.off) api.say([head, W.offNight, W.moonHow]); else if (!dark) api.say([head, W.allLit, W.moonHow]); else if (c.battery && barn.n > 0) { api.say([head, W.dark(dark), W.send]); homeMarks(true); } else api.say([head, W.dark(dark), c.battery ? W.empty : W.noBat, W.moonHow]); } }
    const spareAt = (n) => [posts[h].top[0] + 1.6 + n * 1.2, 9.4, -21.5];
    // the battery: a tap saves the spare beads of this moment, as many as there is room for
    const barnMark = glowMarks(frame(g, barn.x, 0.1, barn.z + 1.1, 5.2, 3.7, true, { fill: 0.35 })); barnMark.visible = false;
    hitBox(s, g, barn.x, 0, barn.z, 6.4, 6, 4, () => alive() && phase === 'day' && !busy && barnMark.visible, async () => { barnMark.visible = false; busy = true; showMark(); const take = spare.splice(0, CELLS - barn.n), n0 = barn.n; clearSpare();
      await Promise.all(take.map((m, j) => { g.remove(m); return wait(j * 0.16).then(() => fly([m.position.x, m.position.y, m.position.z], barn.cells[n0 + j].at, 0.6, 1.2)).then(() => { if (alive()) { setCount(h, n0 + j + 1); beep(520 + (n0 + j) * 60, 0.09); } }); })); if (!alive()) return; busy = false; drawTray(); showMark(); api.say([barn.n >= CELLS ? W.full : W.saved(barn.n), step <= 2 ? W.sunHow : W.moonHow]); });
    // at night, a tap on a dark home sends it one bead from the battery, and somebody comes to the door to wave
    const hMarks = hs.map((q, i) => { const m = glowMarks(frame(g, q.x, q.y + 0.1, q.z + 2.1, 4.2, 3.3, true, { fill: 0.4 })); m.visible = false;
      hitBox(s, g, q.x, q.y, q.z + 0.5, 4.8, 5.4, 4.4, () => alive() && phase === 'day' && m.visible, async () => { m.visible = false; const n = barn.n - 1; setCount(h, n); if (!n) homeMarks(false); await fly(barn.cells[n].at, [q.x - 1.05, q.y + 3.8, q.z + 1.9], 0.8, 3.5); if (!alive()) return; q.fed = q.lit = true; q.waver.visible = true; paint(); chime(); drawTray(); const dark = hs.filter((o) => !o.fed).length; api.say(dark ? (n ? [W.sent, W.dark(dark), W.send] : [W.sent, W.dark(dark), W.empty]) : [W.sent, W.moonHow]); }); return m; });
    const homeMarks = (on) => hs.forEach((q, i) => { hMarks[i].visible = on && !q.fed; });
    async function dawn() { phase = 'done'; mark.visible = false; homeMarks(false); barnMark.visible = false; hs.forEach((q) => { q.fed = true; q.waver.visible = true; }); paint(); chime(); await wait(0.8); if (!alive()) return; busy = false; api.done([litAt(pick) === 6 ? W.dawn : W.dawnDark]); }
    // Florence finishes: every part goes to a place, and the day runs on to the morning
    function finish() { if (!alive() || phase === 'done') return; for (const id of ['turb', 'roof']) for (const sp of spots[id]) if (!sp.used && left[id] > 0) { const j = (id === 'turb' ? T.map((t) => t.g) : hs.map((q) => q.panel)), k = spots[id].indexOf(sp); sp.used = true; left[id]--; made[id === 'turb' ? 'turbs' : 'roofs'].push(k); j[k].visible = true; j[k].scale.setScalar(1); sp.m.visible = false; }
      clearSpare(); phase = 'day'; setArc(s.arc, true); busy = false; look(K.nightB, K.dawn, 1); setMoon(null); step = 5; dawn(); }
  };

  // ---- the town: the plan the child chose now runs every neighbourhood, seen as evening falls ----
  const cleanUp = () => { s.playing = false; s.dragStart = null; mark.visible = false; for (const row of homes) for (const q of row) { q.pip.visible = false; q.waver.visible = false; q.fed = false; } setTags(false); };
  const settle = (pick) => { equip([pick, pick, pick]); for (const h of [0, 1, 2]) { setCount(h, CFG[pick].battery ? (pick === 2 ? 4 : 0) : 0); lightUp(h, true); } flows(); };
  s.town = async (pick) => { const me = run; cleanUp(); const from = s.last; equip([pick, pick, pick]); for (const h of [0, 1, 2]) { setCount(h, CFG[pick].battery && pick === 2 ? CELLS : 0); lightUp(h, false); } glide(WIDE, 2); setArc({ c: 0, w: 92, top: 62 }, false); setMoon(null);
    await tw(2, (k) => look(from[1], K.late, ease(k), { u: 0.055 + (K.late.u - 0.055) * ease(k) })); if (me !== run) return; flows(); await tw(4, (k) => { if (k < 0.6) look(K.late, K.sunset, k / 0.6); else look(K.sunset, K.dusk, (k - 0.6) / 0.4); flows(); }); if (me !== run) return;
    for (const h of [0, 1, 2]) { lightUp(h, true); paint(); beep(640 + h * 60, 0.06); await wait(0.35); if (me !== run) return; } await tw(2.2, (k) => { look(K.dusk, K.night, k * 0.55); flows(); }); if (CFG[pick].battery && pick === 2) for (const h of [0, 1, 2]) setCount(h, 4); flows(); };
  s.swap = (pick) => { cleanUp(); settle(pick); look(K.dusk, K.night, 0.55); if (s.ham.includes(1)) s.flyGeese(9); };
  // the recap is a tap on the town. Any answer goes on
  s.recap = (answer) => { const pick = s.ham[0], c = CFG[pick], right = c.off ? 'none' : pick === 0 ? 'none' : c.battery && pick === 2 ? 'bat' : 'turb', spots = []; let open = true; const signs = [];
    if (pick !== 1) spots.push(['roof', [homes[1][4].x, homes[1][4].y + 6.3, homes[1][4].z]]); if (pick === 1) spots.push(['turb', [0, 24, -66]]); if (pick === 2) spots.push(['turb', [38, 17.5, -50]]); if (c.battery) spots.push(['bat', [barns[1].x, 6.4, barns[1].z]]);
    s.spot = (name, j) => { const q = spots[j][1]; return [q[0], q[1] - 1.5, q[2]]; }; s.recapN = spots.length;
    spots.forEach(([id, p]) => { const pl = plate(s, W.recap[id], p, 'tap'), go = () => { if (!open) return; open = false; for (const q of signs) q.hide = true; const ok = id === right; beep(ok ? 880 : 300, 0.15); W.recapYes = right === 'bat' ? W.recapBat : W.recapWind; W.recapNo = right === 'none' ? W.recapNone : right === 'bat' ? W.recapBatNo : W.recapWindNo; answer(ok); }; signs.push(pl); pl.el.onclick = go; hitBox(s, g, p[0], p[1] - 4, p[2], 8, 5, 5, () => open, go); }); };
  // the closing picture: the first winter morning, with the family on the hill and the geese overhead
  s.morning = async () => { const me = run; cleanUp(); glide({ eye: [-1.5, 10.2, 39.5], at: [0.5, 8.6, -22], fov: 46 }, 5); famPlate.hide = true; await tw(4.5, (k) => { look(K.nightB, K.dawn, ease(k)); flows(); }); if (me !== run) return; s.cheer = true; chime(); s.flyGeese(11); };

  // ---- every picture: the wind in the kite and the scarves, the turbines, the beads, the geese's wings ----
  s.tick = (t, dt) => { for (const T of [ridgeT, knollT, [near]]) for (const q of T) if (q.g.visible) q.rotor.rotation.z -= dt * (q === near ? 0.9 : 1.7 + 0.5 * q.k);
    kite.position.set(-5.4 + Math.sin(t * 0.9) * 0.7, 15.2 + Math.sin(t * 1.3) * 0.45, 16); kite.rotation.z = Math.sin(t * 1.7) * 0.14; tails.forEach((m, k) => { m.position.y = -1.7 - k * 0.42 + Math.sin(t * 6 + k) * 0.12; }); if (string) g.remove(string); string = rod(g, hand, [kite.position.x, kite.position.y - 0.9, kite.position.z], 0.05, '#fff', { mat: stringM }); string.castShadow = false;
    scarves.forEach((m, k) => { m.rotation.y = Math.sin(t * 7 + k * 2) * 0.5; m.rotation.z = Math.sin(t * 5 + k) * 0.25; }); fam.position.y = HY + (s.cheer ? Math.abs(Math.sin(t * 5)) * 0.22 : 0); kid.position.y = 0.02 + Math.abs(Math.sin(t * 2.2)) * 0.05;
    for (const st of streams) { const L = st.len[st.len.length - 1], n = st.beads.length; st.beads.forEach((m, i) => { const vis = st.on > 0 && i / n < st.on; m.visible = vis; if (!vis) return; let d = ((t * st.speed / L + i / n) % 1) * L, k = 1; while (k < st.len.length - 1 && st.len[k] < d) k++; m.position.lerpVectors(st.P[k - 1], st.P[k], (d - st.len[k - 1]) / (st.len[k] - st.len[k - 1])); }); }
    if (geese.visible) birds.forEach((b, k) => b.wings.forEach(({ w, sd }) => { w.rotation.x = sd * Math.sin(t * 7 + k) * 0.5; })); if (mark.visible) mark.scale.setScalar(1 + Math.sin(t * 4) * 0.08);
    clouds.forEach((c, k) => { c.position.x += dt * (0.9 + k * 0.2); if (c.position.x > 190) c.position.x = -190; }); };
  equip([-1, -1, -1]); look(K.late, K.late, 0); return s; }
const NO_SH = { shadow: false };

// ---- 4. hand it all to the kit ------------------------------------------------------------------------------------------------------------
runLevel({ place: { number: 1, town: 'Eco Town', level: 'Power' }, words: W, plans, results, scene: hilltop, after,
  ends: (pick, s) => [{ step: W.endT, say: [W.endSay[mark(litAt(pick))], W.end], go: () => s.morning() }] });
