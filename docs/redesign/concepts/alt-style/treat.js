// A SMALL TEST (owner, 22 Nov 2026): "Car town had different color treatment of materials". This takes the present Eco
// Town street exactly as it is on the left half of concept screen 3 (same blocks, same camera) and changes only how the
// materials are coloured, using the four things that car town does (carTown in ../walk-v2.js):
//   1. flat unlit colour on windows and on far things, so they have no lit side and shaded side;
//   2. see-through sheets across the street in place of fog, so far things melt into soft air;
//   3. a narrow palette: every colour pulled towards one value and low saturation, with two or three bright accents;
//   4. dimmed light with a flat background colour that matches, so shadows are gentle.
// A is as quiet as car town. B is the same treatment a step fresher and brighter. Nothing else is redesigned.
import { THREE, blk, group, soft } from '../kit-v2.js';
import { walk } from '../walk-v2.js';
const W = 1280, H = 720, VW = 640, VH = 494;
const ACCENT = new Set(['e0503a', 'ffdf3d', 'ffd257', 'ffb400', '1f2a44', 'f1c9a0', 'c98d5e', '8a5a3c', 'f6d7b8', 'f3a593', 'c23a4a', 'ffffff']);   // the child's top, the stall awning and the flag; the yellow places; the school bell; faces are left as they are, as car town leaves them
const MODES = {
  present: null,
  A: { sat: 0.42, mid: 0.64, squeeze: 0.45, night: 0.3, bg: '#dde6e4', sheet: '#e6ecea', op: [0.16, 0.2, 0.24, 0.28], far: -30 },
  B: { sat: 0.72, mid: 0.66, squeeze: 0.68, night: 0.12, bg: '#cfe6f2', sheet: '#e3f0f6', op: [0.12, 0.16, 0.2, 0.24], far: -30 },
};
function treat(root, M) { const cache = new Map(), c = new THREE.Color(), hsl = {}, p = new THREE.Vector3(); root.updateMatrixWorld(true);
  root.traverse((o) => { if (!o.isMesh || o.material.map) return; const m = o.material, hex = m.color.getHexString(), unlit = m.isMeshBasicMaterial || o.getWorldPosition(p).x < M.far, key = hex + (unlit ? 'u' : 'l') + (m.transparent ? m.opacity : '');
    if (!cache.has(key)) { c.copy(m.color); if (!ACCENT.has(hex)) { c.getHSL(hsl, THREE.SRGBColorSpace); c.setHSL(hsl.h, hsl.s * M.sat, M.mid + (hsl.l - M.mid) * M.squeeze, THREE.SRGBColorSpace); }
      const n = unlit ? new THREE.MeshBasicMaterial({ color: c.clone() }) : new THREE.MeshLambertMaterial({ color: c.clone() }); if (m.transparent) { n.transparent = true; n.opacity = m.opacity; n.depthWrite = m.depthWrite; } cache.set(key, n); }
    o.material = cache.get(key); });
  // see-through sheets across the path, tinted like clean distance, in place of fog
  [-15, -26, -37, -50].forEach((x, k) => blk(root, x, 0, 0.1, 90, 0, 40, M.sheet, { shadow: false, mat: soft(M.sheet, M.op[k]) })); }
export const SHOTS = [{ id: 'car-town', half: 1 }, { id: 'eco-present', half: 0, mode: 'present' }, { id: 'eco-A', half: 0, mode: 'A' }, { id: 'eco-B', half: 0, mode: 'B' }];
export function show(i) { const s = SHOTS[i], h = walk.split[s.half], M = MODES[s.mode], st = film.dbg, cam = st.camera, r = st.renderer, sz = r.getSize(new THREE.Vector2()), k = sz.x / W;
  document.head.insertAdjacentHTML('beforeend', '<style>.stage > .ui, .stage > canvas.fx { visibility: hidden; }</style>');
  const n = st.newScene(h.half); n.light(M ? M.night : (h.night || 0)); n.scene.background.set(M ? M.bg : (h.bg || '#dff1f7')); const g = group(n.scene); h.room(g); if (M) treat(g, M);
  cam.clearViewOffset(); cam.fov = h.fov; cam.aspect = VW / VH; cam.updateProjectionMatrix(); cam.position.set(...h.eye); cam.lookAt(...h.at); cam.updateMatrixWorld();
  r.setScissorTest(true); r.setViewport(0, sz.y - VH * k, VW * k, VH * k); r.setScissor(0, sz.y - VH * k, VW * k, VH * k); r.render(n.scene, cam); r.setScissorTest(false); r.setViewport(0, 0, sz.x, sz.y); cam.aspect = W / H; cam.fov = 26; cam.updateProjectionMatrix(); return s.id; }
