// A playable trial of one level, Homes, in the new street and colouring (owner, 23 Nov 2026: "Yes, build the trial level").
// It follows the wireframe steps (the job, ask Florence, her three plans, the test, the choice, the town changes, the recap)
// and puts the play break, in which the child builds the home, between the choice and the town changing.
// The steps and their words come from ../../wireframes-data.js. The words that are only in this file (the play break
// hints and the last screen) are placeholders. Nothing here is part of the game; it only adds files in this folder.
import { THREE, blk, group, hash, soft, fig, SKIN, HAIR, frame } from '../kit-v2.js';
import D from '../../wireframes-data.js';
const U = D.ui, TOWN = D.towns[0], L = TOWN.levels[2], $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// placeholder words, written for the trial only
const PH = { build: 'Build a home', win2: 'You have two windows. Tap a yellow place to put one in.', win1: 'You have one more window. Tap a yellow place to put it in.', roof: 'Now tap the yellow place to lower the roof.', door: 'Choose a colour for the door. Then tap the yellow place.', ready: 'The home is ready, and your family is moving in.',
  window: 'Window', roofT: 'Roof', doorT: 'Door', left: (n) => `${n} left`, placed: 'In place', colour: 'Door colour', family: 'Your family', yours: 'Your home', end: 'This is the end of the trial level. Thank you for playing.', replay: 'Play again', works: ['The sawmill', 'The brick oven', 'The cement works'] };

// ---- colours and blocks, as in ../scenes-v3.js --------------------------------------------------------------------------
const SKY = '#cfe6f2', SHEET = '#e3f0f6', NO = { shadow: false }, c0 = new THREE.Color(), hsl = {};
const tone = (hex) => { c0.set(hex).getHSL(hsl, THREE.SRGBColorSpace); return '#' + c0.setHSL(hsl.h, hsl.s * 0.74, 0.66 + (hsl.l - 0.66) * 0.7, THREE.SRGBColorSpace).getHexString(); };
const mats = new Map(), FARX = -30;
const M = (hex, x, o = {}) => { const unlit = o.unlit || x < FARX, col = o.raw ? hex : tone(hex), k = col + (unlit ? 'u' : 'l') + (o.op || ''); if (!mats.has(k)) { const m = unlit ? new THREE.MeshBasicMaterial({ color: col }) : new THREE.MeshLambertMaterial({ color: col }); if (o.op) { m.transparent = true; m.opacity = o.op; m.depthWrite = false; } mats.set(k, m); } return mats.get(k); };
const B = (g, x, z, w, d, y, h, hex, o = {}) => blk(g, x, z, w, d, y, h, hex, { shadow: o.shadow !== false && !o.op, mat: o.mat || M(hex, o.near ? 0 : x, o) });
const WALL = ['#ecd9b4', '#e4cfa6', '#f0e0c0', '#dcc69c'], ROOF = ['#c8643f', '#3f78b5', '#2e9b5a', '#e0a23a'], LEAF = ['#77c765', '#84d072', '#6cbd5b'], GRASS = ['#8fcf73', '#93d277', '#8bcb6f'], DOOR = ['#7a5a33', '#3f78b5', '#c8643f', '#2e9b5a'];
// the three materials of the three plans: timber, brick and concrete
const MAT = [{ wall: '#d8b482', line: '#c29a66', top: '#f6efdc' }, { wall: '#c77b5e', line: '#b0654b', top: '#c77b5e' }, { wall: '#cdccc6', line: '#b6b5ae', top: '#cdccc6' }];
const GLASS = '#a9d3ee', LIT = '#ffe27a', glassMat = () => new THREE.MeshBasicMaterial({ color: GLASS });
const LX = (k) => 14 - k * 7.6, LZ = 11.4, RZ = -12.7;
// a low home. face is +1 when the front looks towards -z. o.mat is one of MAT, o.door a colour, o.glass a material of its own.
function home(g, x, z, face, k, o = {}) { const w = 7.3, d = 7, h = 4.9, fz = z - face * (d / 2 + 0.03), m = o.mat, R = m ? { raw: true } : {};
  B(g, x, z, w, d, 0, h, m ? m.wall : WALL[k % 4], R); if (m) for (const y of [1.2, 2.4, 3.6]) B(g, x, fz, w, 0.04, y, 0.07, m.line, { raw: true, shadow: false });
  const rc = o.roofC || ROOF[k % 4]; B(g, x, z, w + 0.5, d + 0.9, h, 0.55, rc); B(g, x, z, w + 0.5, d * 0.45, h + 0.55, 0.5, rc);
  B(g, x + 2.2, fz, 1.25, 0.08, 0, 2.5, o.door || DOOR[(k + 1) % 4], NO);
  for (const [a, y] of [[-1.6, 0.9], [0.4, 0.9], [-1.6, 3.0], [0.4, 3.0], [2.2, 3.0]]) B(g, x + a, fz - face * 0.02, 1.2, 0.06, y, 1.25, GLASS, { unlit: true, raw: true, shadow: false, mat: o.glass }); }
function tree(g, x, z, k = 1, op) { B(g, x, z, 0.4 * k, 0.4 * k, 0, 4.6 * k, '#8a6a44'); B(g, x, z, 2.8 * k, 2.8 * k, 4.4 * k, 2.3 * k, LEAF[Math.floor(hash(x, z) * 3)], { op, unlit: true, raw: true }); B(g, x + 0.1, z - 0.1, 1.8 * k, 1.8 * k, 6.7 * k, 1.2 * k, LEAF[1], { op, unlit: true, raw: true }); }
const lamp = (g, x, z) => { B(g, x, z, 0.18, 0.18, 0, 4.4, '#2b3a55'); B(g, x, z, 0.55, 0.55, 4.4, 0.45, '#ffe9a0', { unlit: true, raw: true }); };
const SH = ['#3f78b5', '#8a5fc2', '#2e9b5a', '#e0a23a', '#16a3a3', '#c98a5a'];
function fam(g, t, o = {}) { fig(g, 0, 0.06, 0, { k: 1.25, shirt: '#e0503a', legs: '#2b3a55', skin: SKIN[0], hair: HAIR[1], cap: '#3f78b5', pack: '#ffd257', turn: t, arms: ['up', 'down'] });
  fig(g, -Math.sin(t) * 0.9 + Math.cos(t) * 1.3, 0.06, -Math.cos(t) * 0.9 - Math.sin(t) * 1.3, { k: 1.62, shirt: '#8a5fc2', legs: '#2b3a55', skin: SKIN[3], hair: HAIR[4], long: true, turn: t - 0.2 });
  fig(g, -Math.sin(t) * 0.9 - Math.cos(t) * 1.3, 0.06, -Math.cos(t) * 0.9 + Math.sin(t) * 1.3, { k: 1.68, shirt: '#2e9b5a', legs: '#4a556e', skin: SKIN[0], hair: HAIR[0], turn: t + 0.3, arms: ['down', o.wave ? 'up' : 'down'] }); }

// ---- the stage ------------------------------------------------------------------------------------------------------------
const view = $('view'), canvas = $('c'), QS = new URLSearchParams(location.search);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.BasicShadowMap;
const cam = new THREE.PerspectiveCamera(30, 2, 1, 400);
let cur = null, tws = [], run = 0;
function newScene(half, o = {}) { const scene = new THREE.Scene(), hemi = new THREE.HemisphereLight('#fff6e8', '#d9cfb8', 1.55 * 0.96 * 1.3), sun = new THREE.DirectionalLight('#fff0d0', 2.1 * 0.62);
  scene.add(hemi); sun.position.set(...(o.sun || [-16, 30, 18])); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half * 0.75, bottom: -half * 0.75, near: 1, far: 120 }); sun.shadow.bias = -0.002; sun.shadow.normalBias = 0.09; scene.add(sun);
  scene.background = new THREE.Color(SKY); return { scene, hemi, sun, g: group(scene), picks: [], plates: [], minAspect: 1.9 }; }
function fit() { if (!cur) return; const f = cur.fov * Math.PI / 180; cam.fov = cam.aspect >= cur.minAspect ? cur.fov : 2 * Math.atan(Math.tan(f / 2) * cur.minAspect / cam.aspect) * 180 / Math.PI; cam.position.set(...cur.eye); cam.lookAt(...cur.at); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); }
function resize() { const w = view.clientWidth, h = view.clientHeight; if (!w || !h) return; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setSize(w, h, false); cam.aspect = w / h; fit(); }
new ResizeObserver(resize).observe(view);
function setScene(s) { run++; tws = []; cur = s; hover = null; view.classList.remove('can'); $('plates').innerHTML = ''; for (const p of s.plates) $('plates').append(p.el); fit(); return s; }
function plate(s, text, pos, cls = '') { const el = document.createElement('i'); el.className = `plate ${cls}`; el.textContent = text; const p = { el, pos: new THREE.Vector3(...pos) }; s.plates.push(p); if (s === cur) $('plates').append(el); return p; }
// a change over time: fn is given a share from 0 to 1. It stops quietly when the scene changes.
const tw = (sec, fn) => new Promise((res) => tws.push({ t0: performance.now(), d: sec * 1000, fn, res }));
const wait = (sec) => tw(sec, () => {});
const ease = (t) => t * t * (3 - 2 * t), back = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
// tapping things in the town
const ray = new THREE.Raycaster(), v2 = new THREE.Vector2(); let hover = null;
function pickAt(e) { if (!cur) return null; const r = canvas.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, cam);
  let best = null, bd = Infinity; for (const p of cur.picks) { if (!p.can()) continue; const hit = ray.intersectObject(p.mesh, false)[0]; if (hit && hit.distance < bd) { bd = hit.distance; best = p; } } return best; }
canvas.addEventListener('pointermove', (e) => { hover = pickAt(e); view.classList.toggle('can', !!hover); });
canvas.addEventListener('pointerleave', () => { hover = null; view.classList.remove('can'); });
canvas.addEventListener('click', (e) => { const p = pickAt(e); if (p) p.on(); });
const hitBox = (s, x, y, z, w, h, d, can, on) => { const mesh = blk(s.g, x, z, w, d, y, h, '#fff', { shadow: false, mat: HID }); const p = { mesh, can, on }; s.picks.push(p); return p; };
const HID = new THREE.MeshBasicMaterial({ visible: false });
let last = performance.now(), frames = 0, fpsT = last;
function loop(now) { requestAnimationFrame(loop); const dt = Math.min(0.1, (now - last) / 1000); last = now; if (!cur) return;
  for (const t of [...tws]) { const k = Math.min(1, (now - t.t0) / t.d); t.fn(k); if (k >= 1) { tws.splice(tws.indexOf(t), 1); t.res(); } }
  if (cur.tick) cur.tick(now / 1000, dt); renderer.render(cur.scene, cam);
  const w = view.clientWidth, h = view.clientHeight; for (const p of cur.plates) { const v = p.pos.clone().project(cam); p.el.style.left = `${(v.x + 1) / 2 * w}px`; p.el.style.top = `${(1 - v.y) / 2 * h}px`; p.el.style.display = v.z < 1 && !p.hide ? '' : 'none'; }
  if (QS.has('fps')) { frames++; if (now - fpsT > 1000) { $('fps').hidden = false; $('fps').textContent = `${Math.round(frames * 1000 / (now - fpsT))} pictures each second`; frames = 0; fpsT = now; } } }

// ---- scene 1: the street. built is null before the homes exist, or the number of the chosen plan ----------------------------
function street(built, o = {}) { const s = newScene(44), g = s.g; Object.assign(s, o.close ? { fov: 34, eye: [17, 7.2, 3.2], at: [-12, 3, -9.5] } : { fov: 31, eye: [15, 5.4, 2.6], at: [-12, 2.6, 0.4] });
  for (let x = -96; x <= 24; x += 8) for (let z = -40; z <= 40; z += 8) B(g, x + 4, z + 4, 8, 8, -1.6, 1.6, GRASS[Math.floor(hash(x, z) * 3)]);
  B(g, -36, 0, 120, 5.2, 0, 0.07, '#f3e9d2', NO); for (const z of [-2.75, 2.75]) B(g, -36, z, 120, 0.3, 0, 0.11, '#d9cdb2', NO); for (let x = -90; x < 22; x += 4) B(g, x, 0, 0.12, 5.2, 0.07, 0.02, '#e2d6bb', NO);
  for (let k = 0; k < 7; k++) home(g, LX(k), LZ, 1, k);
  for (let k = 0; k < 7; k++) { const x = LX(k);
    if (built === null) { B(g, x, RZ, 7.3, 7, 0, 0.12, '#dccaa2', NO); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(g, x + a * 3.6, RZ + b * 3.4, 0.22, 0.22, 0, 1.1, '#8a6a44'); }
    else home(g, x, RZ, -1, k + 2, k === 2 ? { mat: MAT[built], door: DOOR[S.doorC], roofC: ROOF[2] } : { mat: MAT[built] }); }
  for (let k = 0; k < 7; k++) { const x = -13 - k * 7.6; for (const z of [-6.3, 6.3]) { tree(g, x, z, 1); lamp(g, x - 3.8, z > 0 ? 3.4 : -3.4); } }
  { const x = -62, V = { raw: true, unlit: true }; B(g, x, 0, 6, 22, 0, 7.5, '#ffd76a', V); B(g, x, 0, 6.6, 23, 7.5, 1.2, '#d2553a', V); B(g, x, 0, 6.6, 12, 8.7, 1.1, '#d2553a', V); B(g, x, 0, 3, 3, 9.8, 4.4, '#ffd76a', V); B(g, x, 0, 3.8, 3.8, 14.2, 0.8, '#d2553a', V);
    B(g, x + 3.1, 0, 0.1, 2.8, 0, 3.6, '#7a5a33', { unlit: true, shadow: false }); for (const z of [-7, -4, 4, 7]) B(g, x + 3.1, z, 0.1, 1.8, 2.4, 2, GLASS, { unlit: true, raw: true, shadow: false }); B(g, x + 3.6, 9, 0.2, 0.2, 0, 12, '#fbfbf7', V); B(g, x + 3.6, 10.4, 0.1, 2.6, 10, 1.7, '#e0503a', V); }
  for (const [z, w, hh] of [[-36, 30, 9], [22, 30, 10]]) for (let q = 0; q < 3; q++) B(g, -110, z, 8, w * (1 - q * 0.26), q * hh / 3, hh / 3, ['#a9c6a0', '#b9cdb8', '#cdd8d0'][q], NO);
  for (const [y, z] of [[30, -18], [33, 16]]) { B(g, -108, z, 2, 12, y, 2, '#ffffff', { raw: true, unlit: true }); B(g, -108, z + 2, 2, 6, y + 2, 1.5, '#ffffff', { raw: true, unlit: true }); }
  for (const [x, z] of o.close ? [] : [[4, 7.4], [5, -8.6]]) { B(g, x, z, 5.6, 4.6, 5.4, 3, LEAF[0], { op: 0.8, unlit: true, raw: true }); B(g, x + 1, z - 0.4, 3.4, 3, 8.4, 1.8, LEAF[1], { op: 0.8, unlit: true, raw: true }); B(g, x, z, 0.5, 0.5, 0, 5.4, '#8a6a44'); }
  [-22, -36, -50].forEach((x, k) => blk(g, x, 0, 0.1, 100, 0, 50, SHEET, { shadow: false, mat: soft(SHEET, [0.12, 0.15, 0.18][k]) }));
  // people walk along both edges of the path, to the school and back; never cars
  const walkers = []; for (let k = 0; k < 9; k++) { const dir = k % 3 === 2 ? 1 : -1, w = group(g, 8 - k * 7.3, 0, dir < 0 ? (k % 2 ? -1.7 : 1.5) : (k % 2 ? 0.5 : -0.6)), c = SH[k % 6];
    fig(w, 0, 0.06, 0, { k: 1.5, shirt: c, skin: SKIN[k % 4], hair: HAIR[k % 5], turn: dir * Math.PI / 2, step: 0.12, long: k % 2 === 0 }); if (k % 2 === 0) fig(w, 0.2, 0.06, 0.8, { k: 1.05, shirt: SH[(k + 2) % 6], skin: SKIN[k % 4], hair: HAIR[(k + 1) % 5], pack: SH[(k + 4) % 6], turn: dir * Math.PI / 2, step: -0.1 });
    walkers.push({ w, dir, v: 1.5 + hash(k, 2) * 0.8, ph: k * 1.7 }); }
  s.tick = (t, dt) => { for (const p of walkers) { p.w.position.x += p.dir * p.v * dt; if (p.w.position.x < -58) p.w.position.x = 14; if (p.w.position.x > 14) p.w.position.x = -58; p.w.position.y = Math.abs(Math.sin(t * 6 + p.ph)) * 0.12; } };
  if (built !== null && o.close) plate(s, PH.yours, [LX(2), 6.5, RZ + 3.5], 'on');
  return s; }

// ---- scene 2: the three places that make the materials, each with a sample home beside it --------------------------------
// done: the test has already run, so the pollution hangs in the air and the windows are lit.
function works(done) { const s = newScene(40, { sun: [-14, 30, 26] }), g = s.g; Object.assign(s, { fov: 30, eye: [0, 12.5, 58], at: [0, 1.6, -4], minAspect: 2.05 });
  for (let x = -56; x <= 48; x += 8) for (let z = -40; z <= 32; z += 8) B(g, x + 4, z + 4, 8, 8, -1.6, 1.6, GRASS[Math.floor(hash(x, z) * 3)], { near: true });
  B(g, 0, 9, 120, 5.2, 0, 0.07, '#f3e9d2', NO); for (const z of [6.25, 11.75]) B(g, 0, z, 120, 0.3, 0, 0.11, '#d9cdb2', NO);
  for (const x of [-28, -9, 9, 28]) tree(g, x, -15, 1.25); for (const x of [-40, 40]) tree(g, x, -6, 1.1);
  for (const [x, w, hh] of [[-30, 34, 8], [26, 40, 9]]) for (let q = 0; q < 3; q++) B(g, x, -60, w * (1 - q * 0.26), 8, q * hh / 3, hh / 3, ['#a9c6a0', '#b9cdb8', '#cdd8d0'][q], { shadow: false, unlit: true, raw: true });
  const sheet = blk(g, 0, -30, 200, 0.1, 0, 60, SHEET, { shadow: false, mat: soft(SHEET, 0.2) });
  const CX = [-18, 0, 18], glass = [glassMat(), glassMat(), glassMat()], puffs = [], spin = [], glow = [];
  const smoke = new THREE.MeshBasicMaterial({ color: '#6d6763', transparent: true, opacity: 0.62, depthWrite: false });
  CX.forEach((cx, i) => { const wx = cx - 4.2, R = { raw: true, near: true };
    home(g, cx + 4.4, -1, -1, i, { mat: MAT[i], glass: glass[i], roofC: ROOF[[1, 0, 3][i]] });
    if (i === 0) { B(g, wx, -6, 7, 6, 0, 4, MAT[0].wall, R); B(g, wx, -6, 7.6, 6.8, 4, 0.5, ROOF[1], { near: true }); const p = blk(g, wx, -6, 5, 3, 4.7, 0.14, '#2f4f8f', { mat: M('#2f4f8f', 0, { raw: true }) }); p.rotation.x = 0.3;      // the sawmill, with a sun panel: it runs on electricity
      B(g, wx, -2.9, 4, 0.1, 0.4, 2.8, '#5a4630', NO); const b = group(g, wx - 0.6, 1.9, -2.6); blk(b, 0, 0, 1.8, 0.12, -0.9, 1.8, '#c9ced6', { shadow: false, mat: M('#c9ced6', 0, { raw: true, unlit: true }) }); spin.push(b);
      for (const [a, y] of [[0, 0], [1.1, 0], [0.55, 0.9]]) B(g, wx + 3 + a, -1.4, 1, 3.4, y, 0.9, '#a9794a', { near: true }); }
    if (i === 1) { B(g, wx, -6, 6.4, 6, 0, 3.2, MAT[1].wall, R); B(g, wx, -6, 4.8, 4.6, 3.2, 1.3, MAT[1].line, R); B(g, wx, -6, 3.2, 3.2, 4.5, 0.9, MAT[1].wall, R); B(g, wx + 1.6, -7, 1.3, 1.3, 0, 8.2, '#9a5846', R);                          // the brick oven
      glow.push(B(g, wx - 0.6, -2.95, 2.2, 0.1, 0.3, 1.7, '#ff9a3c', { mat: new THREE.MeshBasicMaterial({ color: '#7a4a3a' }), shadow: false })); for (const [a, y] of [[0, 0], [1.3, 0], [0.65, 0.7]]) B(g, wx + 3.2 + a, -1.6, 1.2, 1.6, y, 0.7, MAT[1].wall, R); }
    if (i === 2) { B(g, wx + 0.4, -6, 6, 6, 0, 4.2, MAT[2].wall, R); B(g, wx + 0.4, -6, 6.4, 6.4, 4.2, 0.4, '#9a9992', R); B(g, wx - 3.2, -7, 3, 3, 0, 7.4, '#bdbcb5', R); B(g, wx - 3.2, -7, 3.3, 3.3, 7.4, 0.4, '#9a9992', R); B(g, wx + 2, -7, 1.4, 1.4, 0, 9.4, '#8e8d87', R);  // the cement works
      const c = blk(g, wx + 2.6, -1.8, 4.6, 1, 1.2, 0.3, '#6f6e69', { mat: M('#6f6e69', 0, { raw: true }) }); c.rotation.z = 0.32; for (const a of [0, 1.3]) B(g, wx + 4.4 + a * 0.3, -1.6 + a, 1.6, 1.4, 0, 1, '#bdbcb5', R); }
    // the pollution: none from the sawmill, a little from the brick oven, a large cloud from the cement works
    const from = i === 1 ? [wx + 1.6, 8.4, -7] : [wx + 2, 9.6, -7]; for (let k = 0; k < [0, 3, 13][i]; k++) { const sz = (i === 1 ? 1.5 : 2.3) + hash(k, i) * 1.3, m = blk(g, 0, 0, sz, sz, 0, sz * 0.8, '#6d6763', { shadow: false, mat: smoke });
      const to = [from[0] + (hash(k, 5) - 0.5) * (i === 1 ? 3.4 : 9.5), from[1] + 2.2 + hash(k, 9) * (i === 1 ? 2.4 : 4.6) + k * 0.1, from[2] + (hash(k, 3) - 0.5) * 3]; puffs.push({ m, from, to, at: k * (i === 1 ? 0.9 : 0.24), i }); }
    plate(s, PH.works[i], [wx, [6.3, 6.9, 6.2][i], -6]); });
  const snow = []; for (let k = 0; k < 130; k++) { const m = blk(g, (hash(k, 1) - 0.5) * 90, -22 + hash(k, 2) * 44, 0.22, 0.22, 0, 0.22, '#fff', { shadow: false, mat: M('#ffffff', 0, { raw: true, unlit: true }) }); m.visible = false; snow.push({ m, y: hash(k, 4) * 26, v: 3 + hash(k, 6) * 2 }); }
  const day = new THREE.Color(SKY), cold = new THREE.Color('#b4c2dc'), hemi0 = s.hemi.intensity, sun0 = s.sun.intensity; let snowing = 0, t0 = 0, spinning = false, smokeT = done ? 99 : -1;
  const setPuffs = (tt) => { for (const p of puffs) { const k = ease(Math.max(0, Math.min(1, (tt - p.at) / 2.2))); p.m.visible = k > 0; p.m.position.set(p.from[0] + (p.to[0] - p.from[0]) * k, p.from[1] + (p.to[1] - p.from[1]) * k, p.from[2] + (p.to[2] - p.from[2]) * k); p.m.scale.set(p.m.userData.w * (0.3 + 0.7 * k), p.m.userData.h * (0.3 + 0.7 * k), p.m.userData.w * (0.3 + 0.7 * k)); } };
  for (const p of puffs) p.m.userData = { w: p.m.scale.x, h: p.m.scale.y };
  const setCold = (k) => { s.scene.background.copy(day).lerp(cold, k); sheet.material = soft('#c5d0e2', 0.2 + 0.1 * k); s.hemi.intensity = hemi0 * (1 - 0.22 * k); s.sun.intensity = sun0 * (1 - 0.6 * k); for (const m of glass) m.color.set(GLASS).lerp(c0.set(LIT), k); snowing = k; for (const f of snow) f.m.visible = k > 0.05; };
  setPuffs(smokeT); if (done) setCold(0);
  s.tick = (t, dt) => { if (spinning) for (const b of spin) b.rotation.z -= dt * 9; if (smokeT >= 0 && smokeT < 90) { smokeT += dt; setPuffs(smokeT); }
    for (const p of puffs) if (p.m.visible) p.m.position.y += Math.sin(t * 0.9 + p.at * 7) * 0.004;
    if (spinning) glow[0].material.color.set('#ff8a2a').lerp(c0.set('#ffd24a'), 0.5 + 0.5 * Math.sin(t * 7));
    if (snowing > 0.05) for (const f of snow) { f.y -= f.v * dt; if (f.y < 0) f.y = 26; f.m.position.y = f.y; }
    if (s.rings) s.rings.forEach((r, i) => { const k = s.answer === undefined ? 1 + 0.06 * Math.sin(t * 3 + i) : s.answer === i ? 1.12 : 0.9; r.scale.setScalar(k); r.visible = s.answer === undefined || s.answer === i; s.plates[i].el.classList.toggle('on', s.answer === i); s.plates[i].el.classList.toggle('tap', s.answer === undefined); }); };
  // the test: the three places start up and the pollution rises; then a cold evening comes and the windows show the warmth
  s.run = async () => { const me = run; spinning = true; smokeT = 0; await wait(5.2); if (me !== run) return false; spinning = false; glow[0].material.color.set('#7a4a3a'); await tw(1.6, (k) => setCold(ease(k))); if (me !== run) return false; await wait(2.4); return me === run; };
  s.again = async () => { const me = run; spinning = true; smokeT = 0; await wait(4.6); spinning = false; if (me === run) glow[0].material.color.set('#7a4a3a'); return me === run; };
  s.ask = (on) => { s.rings = CX.map((cx) => { const r = group(g, cx - 4.2, 0.12, -3); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const d = blk(r, Math.cos(a) * 6.3, Math.sin(a) * 7, 1.9, 0.8, 0, 0.16, '#ffdf3d', { shadow: false, mat: M('#ffdf3d', 0, { raw: true, unlit: true }) }); d.rotation.y = -a + Math.PI / 2; } return r; });
    CX.forEach((cx, i) => { hitBox(s, cx - 4.2, 0, -5, 10.5, 11, 9, () => s.answer === undefined, () => on(i)); const el = s.plates[i].el; el.classList.add('tap'); el.onclick = () => { if (s.answer === undefined) on(i); }; }); };
  return s; }

// ---- scene 3: the play break. One home is built on its plot while the family it is for looks on -----------------------------
const PLACES = [[-3.6, 1.2], [-0.4, 1.2], [-3.6, 3.7], [2.9, 3.9]];
function build(pick, onChange) { const s = newScene(44), g = s.g, m = MAT[pick], R = { raw: true }; Object.assign(s, { fov: 30, eye: [5.5, 4.4, 24], at: [1.2, 4.2, -2], minAspect: 1.75 });
  for (let x = -96; x <= 24; x += 8) for (let z = -40; z <= 40; z += 8) B(g, x + 4, z + 4, 8, 8, -1.6, 1.6, GRASS[Math.floor(hash(x, z) * 3)]);
  B(g, -36, 0, 120, 5.2, 0, 0.07, '#f3e9d2', NO); for (const z of [-2.75, 2.75]) B(g, -36, z, 120, 0.3, 0, 0.11, '#d9cdb2', NO); for (let x = -90; x < 22; x += 4) B(g, x, 0, 0.12, 5.2, 0.07, 0.02, '#e2d6bb', NO);
  B(g, 0, -4, 12.4, 9, 0, 0.3, '#d9d2c2'); B(g, 0, -4, 11.6, 8.2, 0.3, 5.6, m.wall, R); B(g, 0, -4, 11.7, 8.3, 5.5, 0.4, m.top, R); for (const y of [1.5, 2.7, 3.9, 5.1]) B(g, 0, 0.11, 11.6, 0.04, y, 0.07, m.line, { raw: true, shadow: false });
  B(g, 2.9, 0.12, 1.7, 0.1, 0.3, 3.1, '#5a4630', NO);
  home(g, -12.6, -4.4, -1, 1); home(g, 12.6, -4.4, -1, 3); tree(g, -8.6, -12, 1.2); tree(g, 9, -12.4, 1.2); tree(g, 19.4, 1.4, 1, 0.8);
  fig(g, -6.4, 0.06, 3.4, { k: 1.65, shirt: '#e0a23a', legs: '#3f78b5', skin: SKIN[1], hair: HAIR[3], hat: '#ffd257', arms: ['up', 'down'], turn: 0.5 });
  { const c = group(g, -8.6, 0, 6.2); blk(c, 0, 0, 3.2, 1.7, 0.5, 0.2, '#c9925a', { mat: M('#c9925a', 0) }); for (const a of [-1.1, 1.1]) blk(c, a, 0.9, 0.9, 0.2, 0, 0.9, '#2a2a2a', { mat: M('#3a3a3a', 0) }); }
  const family = group(g, 7.6, 0, 5.2); fam(family, -0.9, { wave: true }); const famPlate = plate(s, PH.family, [7.6, 3.5, 5.2], 'on');
  // the parts and their yellow places
  const lit = glassMat(), winPlace = PLACES.map(([x, y]) => frame(g, x, y, 0.2, 1.9, 1.7, true)), winPart = PLACES.map(([x, y]) => { const w = group(g, x, y - 0.05, 0.28); blk(w, 0, 0, 2, 0.22, 0, 1.8, '#fbfbf7', { mat: M('#fbfbf7', 0, R) }); blk(w, 0, 0.05, 1.7, 0.2, 0.15, 1.5, GLASS, { shadow: false, mat: lit }); blk(w, 0, 0.1, 0.1, 0.2, 0.15, 1.5, '#fbfbf7', { shadow: false, mat: M('#fbfbf7', 0, R) }); w.visible = false; return w; });
  const roof = group(g, 0, 8.4, -4); blk(roof, 0, 0, 12.6, 9.6, 0, 0.6, ROOF[2], { mat: M(ROOF[2], 0) }); blk(roof, 0, 0, 12.6, 4.4, 0.6, 0.55, ROOF[2], { mat: M(ROOF[2], 0) }); const ropes = [-5, 5].map((x) => blk(roof, x, 0, 0.08, 0.08, 1.1, 14, '#2b3a55', { shadow: false }));
  const roofPlace = frame(g, 0, 5.95, 0.22, 11.6, 0.8, true), doorPlace = frame(g, 2.9, 0.3, 0.24, 1.7, 3.1, true);
  const doorMat = new THREE.MeshLambertMaterial({ color: tone(DOOR[S.doorC]) }), door = group(g, 2.9, 0.3, 0.22); blk(door, 0, 0, 1.7, 0.14, 0, 3.1, '#fff', { mat: doorMat }); blk(door, -0.6, 0.1, 0.18, 0.08, 1.4, 0.18, '#ffd257', { shadow: false, mat: M('#ffd257', 0, { raw: true, unlit: true }) }); door.visible = false;
  let tool = 'win', busy = false; s.done = false;
  const left = () => ({ win: 2 - S.win.size, roof: S.roof ? 0 : 1, door: S.door ? 0 : 1 });
  const show = () => { const n = left(); winPlace.forEach((p, i) => { p.visible = !s.done && tool === 'win' && n.win > 0 && !S.win.has(i); }); roofPlace.visible = !s.done && tool === 'roof' && !S.roof; doorPlace.visible = !s.done && tool === 'door' && !S.door; onChange(tool, n, s.done); };
  const next = () => { const n = left(); if (!n[tool]) tool = ['win', 'roof', 'door'].find((k) => n[k]) || tool; if (!n.win && !n.roof && !n.door) finish(); else show(); };
  const pop = (o) => tw(0.32, (k) => o.scale.setScalar(Math.max(0.01, back(k))));
  async function finish() { s.done = true; show(); const me = run; famPlate.hide = true; await wait(0.5); if (me !== run) return; lit.color.set(LIT); const a = family.position.clone();
    await tw(2.2, (k) => { const e = ease(k); family.position.set(a.x + (4.6 - a.x) * e, Math.abs(Math.sin(k * 16)) * 0.14 * (k < 1), a.z + (3.4 - a.z) * e); }); if (me === run) s.onDone(); }
  s.setTool = (t) => { if (s.done || !left()[t]) return; tool = t; show(); };
  s.setDoor = (i) => { S.doorC = i; doorMat.color.set(tone(DOOR[i])); if (!s.done && !S.door) { tool = 'door'; } show(); };
  PLACES.forEach(([x, y], i) => { hitBox(s, x, y, 0.3, 2.1, 1.9, 0.8, () => !s.done && !busy && (S.win.has(i) || (tool === 'win' && left().win > 0)), () => {
    if (S.win.has(i)) { S.win.delete(i); winPart[i].visible = false; tool = 'win'; show(); return; } S.win.add(i); winPart[i].visible = true; pop(winPart[i]); next(); }).frame = winPlace[i]; });
  hitBox(s, 0, 5.6, -2, 12.8, 4.6, 6, () => !s.done && !busy && !S.roof && tool === 'roof', async () => { busy = true; S.roof = true; roofPlace.visible = false; const me = run; await tw(1.1, (k) => { roof.position.y = 8.4 - 2.5 * ease(k); }); if (me !== run) return; for (const r of ropes) r.visible = false; busy = false; next(); }).frame = roofPlace;
  hitBox(s, 2.9, 0.3, 0.3, 1.9, 3.1, 0.8, () => !s.done && !busy && !S.door && tool === 'door', () => { S.door = true; door.visible = true; pop(door); next(); }).frame = doorPlace;
  // what was built before (after "Play again" the parts start afresh, so this only matters within one visit)
  s.tick = (t) => { const k = 1 + 0.04 * Math.sin(t * 4.5); for (const p of [...winPlace, roofPlace, doorPlace]) p.scale.set(k, k, 1); if (hover && hover.frame) hover.frame.scale.set(1.12, 1.12, 1); };
  s.start = show; return s; }

// ---- the steps of the level ---------------------------------------------------------------------------------------------------
const S = { words: [], pick: null, first: null, phase: 0, win: new Set(), roof: false, door: false, doorC: 1 };
const btn = (label, cls, fn) => { const b = document.createElement('button'); b.className = `btn ${cls}`; b.textContent = label; b.onclick = fn; return b; };
function ui({ step = '', say = [], tray = [], wide = false, over = '' }) { $('step').textContent = step; $('say').innerHTML = [].concat(say).map((p) => `<p>${esc(p)}</p>`).join(''); const t = $('tray'); t.className = `tray${wide ? ' wide' : ''}`; t.replaceChildren(...tray); if (over !== null) $('over').innerHTML = over; }
const planCards = () => L.sol.map(([n, d]) => `<div class="card"><h3>${esc(n)}</h3><p>${esc(d)}</p></div>`).join('');
const MARK = { g: '✓', f: '–', p: '✕' };
const resultCards = (choose) => L.sol.map(([n], i) => `<div class="card${S.phase && S.first === i ? ' mine' : ''}"><h3>${esc(n)}</h3>${L.res.map((r) => `<div class="res"><i class="mark ${r[i + 1][0]}">${MARK[r[i + 1][0]]}</i><span>${esc(r[i + 1][1])}</span></div>`).join('')}${choose ? (S.phase && S.first === i ? `<p><b>${esc(U.firstPlan)}</b></p>` : `<button class="btn sun" data-plan="${i}">${esc(U.use)}</button>`) : ''}</div>`).join('');
$('over').addEventListener('click', (e) => { const b = e.target.closest('[data-plan]'); if (b) choose(+b.dataset.plan); });

function job() { Object.assign(S, { words: [], pick: null, first: null, phase: 0, win: new Set(), roof: false, door: false }); setScene(street(null)).kind = 'street0'; ui({ step: L.name, say: [L.scene, L.job], tray: [btn(U.start, 'sun', ask)] }); }
function ask() { if (!cur || cur.kind !== 'street0') setScene(street(null)).kind = 'street0'; const gaps = L.s.filter((p) => Array.isArray(p)); let now = Math.max(0, gaps.findIndex((_, i) => S.words[i] === undefined));
  const draw = () => { const sen = document.createElement('div'); sen.className = 'sentence'; let gi = 0; for (const p of L.s) { if (typeof p === 'string') sen.append(`${p} `); else { const i = gi++, sp = document.createElement('span'); sp.className = `gap${S.words[i] !== undefined ? ' full' : ''}${i === now ? ' now' : ''}`; sp.textContent = S.words[i] !== undefined ? p[S.words[i] + 1] : '…'; sp.onclick = () => { now = i; draw(); }; sen.append(sp, ' '); } }
    const words = document.createElement('div'); words.className = 'words'; gaps[now].slice(1).forEach((w, k) => { const b = document.createElement('button'); b.className = 'word'; b.textContent = w; b.onclick = () => { S.words[now] = k; const n = gaps.findIndex((_, i) => S.words[i] === undefined); if (n >= 0) now = n; draw(); }; words.append(b); });
    const go = btn(U.ask, 'sun', suggest); go.disabled = gaps.some((_, i) => S.words[i] === undefined); go.style.marginLeft = 'auto';
    ui({ step: U.yourSentence, say: gaps.length === 1 ? U.askHowOne : U.askHow, tray: [sen, words, go], wide: true }); };
  draw(); }
function suggest() { ui({ step: L.name, say: U.offers, tray: [btn(U.onward, 'sun', test)], over: planCards() }); }
function test() { const s = setScene(works(false)); const b = btn(L.test, 'sun big', async () => { b.disabled = true; ui({ step: L.test, say: L.watch, tray: [], over: '' }); if (await s.run()) results(); }); ui({ step: L.name, say: U.testHow, tray: [b] }); }
function results() { ui({ step: L.name, say: S.phase ? U.chooseAgain : U.chooseHow, tray: S.phase ? [] : [btn(U.again, '', ask)], over: resultCards(true) }); }
function choose(i) { S.pick = i; if (S.phase) return result(); playBreak(); }
function playBreak() { const I = { win: '<svg viewBox="0 0 44 40"><rect x="7" y="5" width="30" height="30" rx="3" fill="#a9d3ee" stroke="#1f2a44" stroke-width="3"/><path d="M22 5v30M7 20h30" stroke="#1f2a44" stroke-width="3"/></svg>', roof: '<svg viewBox="0 0 44 40"><path d="M4 30L22 8l18 22z" fill="#2e9b5a" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/></svg>', door: '<svg viewBox="0 0 44 40"><rect x="13" y="4" width="18" height="32" rx="2" fill="#3f78b5" stroke="#1f2a44" stroke-width="3"/><circle cx="26" cy="21" r="2.2" fill="#ffd257"/></svg>' };
  const names = { win: PH.window, roof: PH.roofT, door: PH.doorT }, toks = {}, tray = [];
  for (const k of ['win', 'roof', 'door']) { const b = document.createElement('button'); b.className = 'tok'; b.onclick = () => s.setTool(k); toks[k] = b; tray.push(b); }
  const sw = document.createElement('div'); sw.innerHTML = `<div class="sws-h">${esc(PH.colour)}</div><div class="sws">${DOOR.map((c, i) => `<button class="sw" data-c="${i}" style="background:${c}" aria-label="${esc(PH.colour)} ${i + 1}"></button>`).join('')}</div>`; sw.onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) s.setDoor(+b.dataset.c); }; tray.push(sw);
  const s = setScene(build(S.pick, (tool, n, done) => { for (const k in toks) { toks[k].className = `tok${!n[k] ? ' used' : tool === k && !done ? ' on' : ''}`; toks[k].innerHTML = `${I[k]}<span>${esc(names[k])}<small>${esc(n[k] ? PH.left(n[k]) : PH.placed)}</small></span>`; }
    for (const b of sw.querySelectorAll('.sw')) b.classList.toggle('on', +b.dataset.c === S.doorC);
    $('say').innerHTML = `<p>${esc(done ? PH.ready : tool === 'win' ? (n.win === 2 ? PH.win2 : PH.win1) : tool === 'roof' ? PH.roof : PH.door)}</p>`; }));
  s.onDone = () => { $('tray').replaceChildren(btn(U.onward, 'sun', result)); };
  ui({ step: PH.build, say: '', tray, over: '' }); s.start(); }
const afterText = (i) => (i === L.pick ? [L.after] : [L.sol[i][1], ...L.res.map((r) => r[i + 1][1])]);
function result() { setScene(street(S.pick, { close: true })); const settle = () => { S.phase = 2; result(); };
  if (S.phase === 1) return ui({ step: L.sol[S.pick][0], say: U.whichKeep, tray: [btn(U.keepFirst, '', () => { S.pick = S.first; settle(); }), btn(U.keepThis, 'sun', settle)], over: '' });
  ui({ step: L.sol[S.pick][0], say: afterText(S.pick), tray: [...(S.phase === 0 ? [btn(U.tryOther, '', () => { S.phase = 1; S.first = S.pick; setScene(works(true)); results(); })] : []), btn(U.onward, 'sun', recap)], over: '' }); }
function recap() { const s = setScene(works(true)); ui({ step: U.recapTitle, say: [L.point[0], U.pointHow], tray: [], over: '' });
  s.ask(async (i) => { const fin = () => { s.answer = 0; ui({ step: U.recapTitle, say: i === 0 ? U.recapYes : L.res[0][1][1], tray: [btn(U.next, 'sun', end)], over: null }); }; if (i === 0) return fin(); s.answer = -1; if (await s.again()) fin(); }); }
function end() { setScene(street(S.pick, { close: true })); ui({ step: L.name, say: PH.end, tray: [btn(PH.replay, 'sun', job)], over: '' }); }

// Florence breathes: frames 0 to 3 of her sheet, three each second
{ let n = 0; setInterval(() => { n = (n + 1) % 4; $('flo').style.setProperty('--col', n); }, 333); }
resize(); job(); requestAnimationFrame(loop);
window.trial = { S, job, ask, suggest, test, results, choose, playBreak, result, recap, end, get cur() { return cur; } };
window.trialProject = (x, y, z, r) => { const v = new THREE.Vector3(x, y, z).project(cam); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; };
