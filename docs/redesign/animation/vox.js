// Shared 3D pieces for the storyboard animation, in the look of the start page island: plain blocks, few colours,
// hard shadows and stepped roofs. Everything is drawn from the time it is given, so any frame can be drawn again.
import * as THREE from './three.module.min.js';
export { THREE };
export const PAL = {
  grass: ['#8fcf73', '#86c86b', '#9bd57e', '#7ec064'], grassDeep: '#6fb257', sand: '#ecd29a', water: '#5cb8e6', waterDeep: '#49a6d8',
  road: '#8d8378', soil: '#b98a55', soilDark: '#a27443', rock: ['#e8b77c', '#d4975e', '#bd7d4b'],
  wall: ['#fff4dc', '#fbecd0', '#f6e1bd'], timber: '#c9925a', brick: '#b5553a', concrete: '#bdbcb6', roof: ['#c8643f', '#b5553a', '#d0774a'], solar: '#2f4f8f',
  leaf: ['#5fa35a', '#4f9550', '#74b56a'], trunk: '#7a5a33', white: '#fbfbf7', navy: '#2b3a55', sun: '#ffd257', glass: '#9fd0f5', haze: '#7d766f',
};
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const span = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export const back = (t) => { t = clamp(t); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const hash = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };

const BOX = new THREE.BoxGeometry(1, 1, 1);
const mats = new Map();
export const mat = (h) => { if (!mats.has(h)) mats.set(h, new THREE.MeshLambertMaterial({ color: h })); return mats.get(h); };
// a block whose base sits at height y
export function blk(parent, x, z, w, d, y, h, color, o = {}) {
  const m = new THREE.Mesh(BOX, o.mat || mat(color)); m.scale.set(w, h, d); m.position.set(x, y + h / 2, z);
  m.castShadow = o.shadow !== false; m.receiveShadow = o.shadow !== false; parent.add(m); return m;
}
export const group = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
export const glow = (color) => new THREE.MeshBasicMaterial({ color });
export const clear = (color, opacity) => new THREE.MeshLambertMaterial({ color, transparent: true, opacity });

// an 11 by 11 plate of land. tile(x, z) gives { c: colour, h: height of the top } for each square.
export function land(parent, tile) {
  for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) {
    const t = tile(x, z) || {}; const h = t.h ?? 0;
    blk(parent, x, z, 1, 1, -0.6, h + 0.6, t.c || PAL.grass[Math.floor(hash(x, z) * 4)]);
  }
  blk(parent, 0, 0, 11, 11, -1.5, 0.9, PAL.rock[0]); blk(parent, 0, 0, 10.6, 10.6, -2.3, 0.8, PAL.rock[1]); blk(parent, 0, 0, 10, 10, -3, 0.7, PAL.rock[2]);
}
export function house(parent, x, z, o = {}) {
  const g = group(parent, x, o.y || 0, z), w = o.w || 1.3, tall = o.tall || 0.95, wall = o.wall || PAL.wall[Math.floor(hash(x, z) * 3)], roof = o.roof || PAL.roof[Math.floor(hash(z, x) * 3)];
  blk(g, 0, 0, w, w, 0, tall, wall);
  if (o.flat) blk(g, 0, 0, w + 0.15, w + 0.15, tall, 0.12, o.solar ? PAL.solar : roof);
  else { blk(g, 0, 0, w + 0.25, w + 0.25, tall, 0.22, roof); blk(g, 0, 0, w - 0.25, w + 0.25, tall + 0.22, 0.22, roof); blk(g, 0, 0, w - 0.75, w + 0.25, tall + 0.44, 0.2, roof);
    if (o.solar) { const s = blk(g, 0.36, 0, 0.5, w * 0.8, tall + 0.34, 0.06, PAL.solar); s.rotation.z = -0.5; } }
  blk(g, 0.28, w / 2, 0.3, 0.06, 0, 0.55, PAL.trunk, { shadow: false });
  const big = o.winMat ? 1.35 : 1;
  g.win = blk(g, -0.28, w / 2, 0.36 * big, 0.06, tall * 0.36, 0.34 * big, PAL.glass, { shadow: false, mat: o.winMat });
  g.winSide = blk(g, w / 2, 0, 0.06, 0.5 * big, tall * 0.36, 0.34 * big, PAL.glass, { shadow: false, mat: o.winMat });
  return g;
}
export function tree(parent, x, z, k = 1, y = 0) {
  const g = group(parent, x, y, z), c = PAL.leaf[Math.floor(hash(x, z) * 3)];
  blk(g, 0, 0, 0.22 * k, 0.22 * k, 0, 0.6 * k, PAL.trunk); blk(g, 0, 0, 0.95 * k, 0.95 * k, 0.5 * k, 0.6 * k, c); blk(g, 0, 0, 0.6 * k, 0.6 * k, 1.1 * k, 0.4 * k, c); return g;
}
export function person(parent, color = '#e0503a') {
  const g = group(parent); blk(g, 0, 0, 0.42, 0.32, 0, 0.62, color); blk(g, 0, 0, 0.36, 0.36, 0.62, 0.36, '#f1c9a0'); return g;
}
export function car(parent, color = '#e0503a') {
  const g0 = group(parent), g = group(g0); g.scale.set(1.5, 1.5, 1.5); blk(g, 0, 0, 0.95, 0.5, 0.1, 0.3, color); blk(g, -0.05, 0, 0.5, 0.44, 0.4, 0.24, PAL.glass);
  for (const [x, z] of [[-0.3, 0.26], [0.3, 0.26], [-0.3, -0.26], [0.3, -0.26]]) blk(g, x, z, 0.22, 0.08, 0, 0.22, '#2a2a2a', { shadow: false }); return g0;
}
export function turbine(parent, x, z, y = 0, k = 1) {
  const g = group(parent, x, y, z); blk(g, 0, 0, 0.22 * k, 0.22 * k, 0, 3 * k, PAL.white);
  const hub = group(g, 0, 3 * k, 0.2 * k); blk(hub, 0, 0, 0.3 * k, 0.2 * k, -0.15 * k, 0.3 * k, PAL.white);
  for (let i = 0; i < 3; i++) { const b = group(hub); b.rotation.z = i * Math.PI * 2 / 3; blk(b, 0, 0, 0.16 * k, 0.06, 0.1 * k, 1.3 * k, PAL.white); }
  g.hub = hub; return g;
}
// where something is after travelling a share u (0 to 1) of a path of points [x, z]
export function along(pts, u) {
  u = clamp(u); let total = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
  let d = u * total;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? clamp(d / seg[i]) : 0, a = pts[i], b = pts[i + 1]; return { x: lerp(a[0], b[0], k), z: lerp(a[1], b[1], k), r: Math.atan2(-(b[1] - a[1]), b[0] - a[0]) }; } d -= seg[i]; }
  return { x: pts[0][0], z: pts[0][1], r: 0 };
}
export function place(o, pts, u, y = 0, show = true) { const p = along(pts, u); o.position.set(p.x, y, p.z); o.rotation.y = p.r; o.visible = show; }

// the stage: a row of plates, one for each plan
export function makeStage(canvas, W, H) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.BasicShadowMap;
  const camera = new THREE.PerspectiveCamera(26, W / H, 1, 400), day = new THREE.Color('#dff1f7'), dusk = new THREE.Color('#27365c');
  // a scene with its own sky and sun. light(n) makes it night: n is 0 in daylight and 1 after dark.
  const newScene = (half = 30) => {
    const scene = new THREE.Scene(), hemi = new THREE.HemisphereLight('#fff6e8', '#8a7a5a', 1.55), sun = new THREE.DirectionalLight('#fff0d0', 2.1);
    scene.add(hemi); sun.position.set(-16, 30, 18); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half * 0.75, bottom: -half * 0.75, near: 1, far: 100 }); sun.shadow.bias = -0.002; sun.shadow.normalBias = 0.09; scene.add(sun); scene.background = day.clone();
    return { scene, light(n) { hemi.intensity = lerp(1.55, 1.05, n); sun.intensity = lerp(2.1, 0.35, n); hemi.color.set(n > 0.5 ? '#8fa6d8' : '#fff6e8'); scene.background.copy(day).lerp(dusk, n); } };
  };
  const table = newScene(30), st = { renderer, camera, newScene, scene: table.scene, light: table.light, plates: [], root: null,
    reset(n) { if (st.root) table.scene.remove(st.root); st.root = group(table.scene); st.plates = [...Array(n)].map((_, i) => group(st.root, (i - (n - 1) / 2) * 14.5, 0, 0)); return st.plates; },
    // look at a point from a distance, tilted down by tilt and turned by yaw
    look(x, y, z, dist, tilt = 0.62, yaw = 0) { const f = Math.cos(tilt) * dist; camera.position.set(x + Math.sin(yaw) * f, y + Math.sin(tilt) * dist, z + Math.cos(yaw) * f); camera.lookAt(x, y, z); },
    screen(v) { const p = v.clone().project(camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; },
    draw(scene = table.scene) { renderer.render(scene, camera); } };
  return st;
}
