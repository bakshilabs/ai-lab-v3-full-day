// The stage that every level shares: the three.js picture with its lighting effects, changes over time, tapping things
// in the picture, signs that follow places in the picture, and a camera that can glide. It was taken from the Homes trial (23 Nov 2026).
// The stage shows whatever scene a level gives it and decides nothing about the place, the camera, the time of day or the weather.
//
// A scene is a plain object that the level makes. The stage reads these parts of it:
//   scene      the THREE.Scene to draw
//   eye, at    where the camera is and what it looks at, as [x, y, z]; fov is its angle of view. glide() changes these over time
//   minAspect  the picture never shows less of the width than it would at this shape (default 1.9), so a narrow window sees the same things
//   still      true stops the camera's slight sway; drop lowers the look-at point in a very low window
//   camera     optional: a function (cam, seconds) that places the camera by itself, for a level that wants its own camera and none of the above
//   picks      the things that can be tapped (hitBox() adds to it); plates: the signs (plate() adds to it)
//   tick       optional: a function (seconds, secondsSinceLast) called before every picture
//   bloom, ao  optional: how strong the glow and the soft darkening are in this scene (defaults 0.5 and 0.8)
// newScene() gives a scene object with a sky, haze, a sun and soft shadows, which a level may use, change or ignore.
import { $ } from './shell.js';
import { THREE } from '../kit-v2.js';
import { makeFX, TONE } from './fx.js';
export { THREE };
export const view = $('view'), canvas = $('c'), QS = new URLSearchParams(location.search), SPEED = +QS.get('speed') || 1;   // ?speed=6 plays the animations faster, for checking only
// The classrooms have fast Windows computers, so nothing is held back for slow ones (owner, 23 Nov 2026): soft shadows, full sharpness, and the lighting effects in fx.js.
// The filmic curve is given to three.js too, so that the tones are the same when the effects are off. "?plain" turns the effects off, for comparison, and "?fx=on" keeps them on whatever the speed.
THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace('vec3 CustomToneMapping( vec3 color ) { return color; }', `${TONE} vec3 CustomToneMapping( vec3 color ) { return trialTone( color ); }`);
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.CustomToneMapping;
const FXMODE = QS.has('plain') ? 'off' : QS.get('fx') === 'on' ? 'on' : 'auto'; let fx = null; try { if (FXMODE !== 'off' && renderer.capabilities.isWebGL2 && renderer.extensions.has('EXT_color_buffer_float')) fx = makeFX(THREE, renderer); } catch (e) { fx = null; }
export const cam = new THREE.PerspectiveCamera(30, 2, 1, 400);
// cur is the scene on the stage. run goes up by one every time the scene changes: an animation keeps the number it started with ("const me = run") and stops when the two differ ("if (me !== run) return")
export let cur = null, run = 0, hover = null; let tws = [];
const draw = () => { if (!cur) return; if (fx) { fx.bloom = cur.bloom ?? 0.5; fx.ao = cur.ao ?? 0.8; fx.draw(cur.scene, cam); } else { renderer.setRenderTarget(null); renderer.render(cur.scene, cam); } };
export const hot = (hex, k) => new THREE.Color(hex).multiplyScalar(k);   // a colour brighter than white, which glows
// the yellow places glow a little, so that they stand out against the sky and against pale walls. Give it anything made with place() or frame()
const YEL = new THREE.Color('#ffdf3d').getHex(); export const glowMarks = (o) => { o.traverse((m) => { if (m.material && m.material.color && m.material.color.getHex() === YEL && !m.material.userData.hot) { m.material.userData.hot = true; m.material.color.multiplyScalar(m.material.transparent ? 1.2 : 1.35); } }); return o; };

// ---- an optional sky, sun and haze ----------------------------------------------------------------------------------------------------
// The sky is a picture that runs from one colour at the top to the colour of the air at the horizon. SKIES holds three skies, each as [top, middle, horizon]: day, dusk and night.
// drawSky(k, deep) mixes from the first to the second by k and on to the third by deep, and gives back the colour of the air at the horizon, which the haze uses. A level may pass skies of its own
const skyC = document.createElement('canvas'); skyC.width = 8; skyC.height = 256; const skyX = skyC.getContext('2d'); export const skyT = new THREE.CanvasTexture(skyC); skyT.colorSpace = THREE.SRGBColorSpace;
export const SKIES = [['#3f93e0', '#9fd0f2', '#ffe9c6'], ['#2a3a78', '#6f80bd', '#c7b0c6'], ['#0c1232', '#222e66', '#4f5a96']]; const sk = [new THREE.Color(), new THREE.Color(), new THREE.Color()], skt = new THREE.Color();
export function drawSky(k = 0, deep = 0, skies = SKIES) { const gr = skyX.createLinearGradient(0, 0, 0, 256); sk.forEach((c, i) => { c.set(skies[0][i]).lerp(skt.set(skies[1][i]), k).lerp(skt.set(skies[2][i]), deep); gr.addColorStop([0, 0.42, 0.7][i], '#' + c.getHexString()); }); skyX.fillStyle = gr; skyX.fillRect(0, 0, 8, 256);
  skyT.needsUpdate = true; return sk[2].clone(); }
// A scene with a sky, haze, light from the sky and a sun that casts soft shadows over a square of ground 2 * half wide. Every part of o is optional:
// sun (where the sun is), tx (how far along x the middle of the shadows is), skies (see drawSky), haze (how thick the haze is; 0 is none),
// sunColour, sunPower, skyLight, groundLight and lightPower (the colours and strengths of the two lights)
export function newScene(half, o = {}) { const scene = new THREE.Scene(), hemi = new THREE.HemisphereLight(o.skyLight || '#e2ecff', o.groundLight || '#e0c090', o.lightPower ?? 1.4), sun = new THREE.DirectionalLight(o.sunColour || '#ffe7c2', o.sunPower ?? 3.2);
  scene.add(hemi); sun.position.set(...(o.sun || [-16, 30, 18])); sun.position.x += o.tx || 0; sun.target.position.set(o.tx || 0, 0, 0); scene.add(sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half * 0.75, bottom: -half * 0.75, near: 1, far: 160 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.045; scene.add(sun);
  scene.background = skyT; const air = drawSky(0, 0, o.skies), haze = o.haze ?? 0.0092; if (haze) scene.fog = new THREE.FogExp2(air, haze); /* thick haze: the air swallows the far end of the town */ const g = new THREE.Group(); scene.add(g); return { scene, hemi, sun, g, picks: [], plates: [], minAspect: 1.9 }; }

// ---- the camera ------------------------------------------------------------------------------------------------------------------------
let swayT = 0; const sw = () => (cur && cur.still ? 0 : 1);
export function fit() { if (!cur) return; if (cur.camera) { cur.camera(cam, swayT); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); return; } const f = cur.fov * Math.PI / 180, min = cur.minAspect || 1.9; cam.fov = cam.aspect >= min ? cur.fov : 2 * Math.atan(Math.tan(f / 2) * min / cam.aspect) * 180 / Math.PI; cam.position.set(cur.eye[0] + Math.sin(swayT * 0.31) * 0.16 * sw(), cur.eye[1] + Math.sin(swayT * 0.23 + 1) * 0.09 * sw(), cur.eye[2] + Math.cos(swayT * 0.27) * 0.16 * sw()); cam.lookAt(cur.at[0], cur.at[1] - (view.clientHeight < 560 ? cur.drop || 0 : 0), cur.at[2]); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); }
// the camera glides from where it is to another view of the same scene: to is { eye, at, fov }
let glideN = 0; export const glide = (to, sec = 1.6) => { const id = ++glideN, a = { eye: [...cur.eye], at: [...cur.at], fov: cur.fov, drop: cur.drop || 0 }, mix = (p, q, k) => p.map((v, i) => v + (q[i] - v) * k); return tw(sec, (k) => { if (id !== glideN) return; const e = ease(k); cur.eye = mix(a.eye, to.eye, e); cur.at = mix(a.at, to.at, e); cur.fov = a.fov + (to.fov - a.fov) * e; cur.drop = a.drop + ((to.drop || 0) - a.drop) * e; fit(); }); };
export function resize() { const w = view.clientWidth, h = view.clientHeight; if (!w || !h) return; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(w, h, false); if (fx) { const b = renderer.getDrawingBufferSize(new THREE.Vector2()); fx.setSize(b.x, b.y); } cam.aspect = w / h; fit(); draw(); }   // drawn again at once, so that the picture does not blink when the band below changes height
new ResizeObserver(resize).observe(view);
// puts a scene on the stage. Every change over time that belonged to the scene before it stops quietly
export function setScene(s) { run++; tws = []; cur = s; hover = null; view.classList.remove('can'); $('plates').innerHTML = ''; for (const p of s.plates) $('plates').append(p.el); fit(); return s; }
// a sign that stays over a place in the picture. cls: 'on' is yellow, 'tap' can be tapped and nods, and 'pl' holds the tag of a plan. Set hide to true to take it out of sight
export function plate(s, text, pos, cls = '') { const el = document.createElement('i'); el.className = `plate ${cls}`; el.textContent = text; const p = { el, pos: new THREE.Vector3(...pos) }; s.plates.push(p); if (s === cur) $('plates').append(el); return p; }

// ---- changes over time ----------------------------------------------------------------------------------------------------------------
// tw(seconds, fn) calls fn with a share from 0 to 1 until the time is up, and can be awaited. It stops quietly when the scene changes
export const tw = (sec, fn) => new Promise((res) => tws.push({ t0: performance.now(), d: sec * 1000 / SPEED, fn, res }));
export const wait = (sec) => tw(sec, () => {});
export const ease = (t) => t * t * (3 - 2 * t), back = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

// ---- tapping things in the picture, with a mouse -------------------------------------------------------------------------------------
const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
function pickAt(e) { if (!cur) return null; const r = canvas.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, cam);
  let best = null, bd = Infinity; for (const p of cur.picks) { if (!p.can()) continue; const hit = ray.intersectObject(p.mesh, false)[0]; if (hit && hit.distance < bd) { bd = hit.distance; best = p; } } return best; }
canvas.addEventListener('pointermove', (e) => { hover = pickAt(e); view.classList.toggle('can', !!hover); });
canvas.addEventListener('pointerleave', () => { hover = null; view.classList.remove('can'); });
canvas.addEventListener('click', (e) => { const p = pickAt(e); if (p) p.on(); });
// An unseen box that can be tapped: it belongs to scene s, sits in parent at x, y, z (y is its bottom) and is w wide, h high and d deep. can() says whether it may be tapped now, and on() is what the tap does.
// Make it generous: a child should not have to aim. The answer can be given a frame (the yellow place it stands for), which hover then shows
const HID = new THREE.MeshBasicMaterial({ visible: false });
export const hitBox = (s, parent, x, y, z, w, h, d, can, on) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), HID); mesh.position.set(x, y + h / 2, z); parent.add(mesh); const p = { mesh, can, on }; s.picks.push(p); return p; };
// where a place in the world is on the page, for the script that plays a level through: r is the rectangle of the canvas
export const project = (x, y, z, r) => { const v = new THREE.Vector3(x, y, z).project(cam); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; };

// ---- the loop ----------------------------------------------------------------------------------------------------------------------------
let last = performance.now(), frames = 0, fpsT = last;
// The one safety net: if the page draws fewer than 15 pictures each second for eight seconds in a row, it turns the lighting effects off by itself.
// It does not start to measure until ten seconds after loading, it does not count while the page is hidden, and one good second starts the count again
let slowN = 0, netF = 0, netT = last + 10000; const net = (now) => { if (FXMODE !== 'auto' || !fx) return; if (document.hidden || now < netT) { netF = 0; netT = Math.max(netT, now); return; } netF++; if (now - netT < 1000) return; const rate = netF * 1000 / (now - netT); netF = 0; netT = now; slowN = rate < 15 ? slowN + 1 : 0; if (slowN >= 8) { fx = null; resize(); } };
document.addEventListener('visibilitychange', () => { slowN = 0; netF = 0; netT = performance.now() + 2000; });
function loop(now) { requestAnimationFrame(loop); const dt = Math.min(0.1, (now - last) / 1000); last = now; if (!cur) return;
  for (const t of [...tws]) { const k = Math.min(1, (now - t.t0) / t.d); t.fn(k); if (k >= 1) { tws.splice(tws.indexOf(t), 1); t.res(); } }
  if (cur.tick) cur.tick(now / 1000, dt); swayT += dt; fit(); draw(); net(now);
  const w = view.clientWidth, h = view.clientHeight; for (const p of cur.plates) { const v = p.pos.clone().project(cam); p.el.style.left = `${(v.x + 1) / 2 * w}px`; p.el.style.top = `${(1 - v.y) / 2 * h}px`; p.el.style.display = v.z < 1 && !p.hide ? '' : 'none'; }
  if (QS.has('fps')) { frames++; if (now - fpsT > 1000) { $('fps').hidden = false; $('fps').textContent = `${Math.round(frames * 1000 / (now - fpsT))} pictures each second`; frames = 0; fpsT = now; } } }
// starts the drawing. flow.js calls it; a page that does not use flow.js calls it once after its first setScene()
let started = false; export function start() { if (started) return; started = true; resize(); requestAnimationFrame(loop); }
