// The block style that every level shares: plain boxes, people with faces, yellow places, colours at full strength,
// and small repeating pictures for boards, bricks, tiles, glass, grass and leaves. It was taken from the Homes trial (23 Nov 2026).
// These are building blocks only. What a level builds from them, and in which colours, is the level's own choice.
//   blk(parent, x, z, w, d, y, h, colour, { mat, shadow })   one box: x and z are its middle, y is its bottom
//   group(parent, x, y, z)                                    an empty group to build in
//   fig(parent, x, y, z, { k, shirt, legs, skin, hair, cap, long, pack, turn, arms, sit, step })   a person with a face, arms and legs
//   place(parent, x, z, w, d, y)   a flat yellow place;  frame(parent, x, y, z, w, h, alongX)   an upright yellow place
//   soft(colour, opacity)          a see-through material;  hash(a, b)   a number from 0 to 1 that is always the same for the same a and b
import { THREE, blk, group, hash, soft, fig, frame, place, SKIN, HAIR } from '../kit-v2.js';
export { THREE, blk, group, hash, soft, fig, frame, place, SKIN, HAIR };
const c0 = new THREE.Color(), hsl = {};
// colours keep their strength: deep darks and bright lights (owner, 23 Nov 2026)
export const tone = (hex) => { c0.set(hex).getHSL(hsl, THREE.SRGBColorSpace); return '#' + c0.setHSL(hsl.h, Math.min(1, hsl.s * 1.04), 0.58 + (hsl.l - 0.58) * 0.96, THREE.SRGBColorSpace).getHexString(); };
// M(colour, o) gives a material and makes each one only once. o: raw (use the colour exactly as given), unlit (a flat colour that light and shade do not change),
// op (see-through, from 0 to 1), tex (one of the small pictures below, tinted by the colour)
export const mats = new Map();
export const M = (hex, o = {}) => { const unlit = !!o.unlit, col = o.raw ? hex : tone(hex), k = col + (unlit ? 'u' : 'l') + (o.op || '') + (o.tex || ''); if (!mats.has(k)) { const m = unlit ? new THREE.MeshBasicMaterial({ color: col }) : new THREE.MeshLambertMaterial({ color: col }); if (o.tex) m.map = patTex(o.tex); if (o.tex === 'leaf' && !unlit) { m.emissive.set(col).multiplyScalar(0.26); m.userData.em = m.emissive.clone(); } if (o.op) { m.transparent = true; m.opacity = o.op; m.depthWrite = false; } mats.set(k, m); } return mats.get(k); };
// B is blk with a material from M: B(parent, x, z, w, d, y, h, colour, o). o is as for M, with shadow: false for a box that casts no shadow and mat for a material of your own
export const NO = { shadow: false };
export const B = (g, x, z, w, d, y, h, hex, o = {}) => blk(g, x, z, w, d, y, h, hex, { shadow: o.shadow !== false && !o.op, mat: o.mat || M(hex, o) });
// At night the leaves and the grass go darker and bluer: dimLeaves(k) with k from 0 (day) to 1. A level that has no night never calls it
const NIGHTLEAF = new THREE.Color('#1f3d3c');
export const dimLeaves = (k) => { for (const m of mats.values()) if (m.isMeshBasicMaterial) { if (!m.userData.c) { m.userData.c = m.color.clone(); m.userData.leaf = m.color.g > m.color.r * 1.08 && m.color.g > m.color.b * 1.08; } if (m.userData.leaf) m.color.copy(m.userData.c).lerp(NIGHTLEAF, k); } else if (m.userData.em) m.emissive.copy(m.userData.em).multiplyScalar(1 - Math.min(1, k * 1.3)); };

// ---- small pictures that repeat ---------------------------------------------------------------------------------------------------------
// The outside of a wall is drawn from a small picture that repeats: bricks in courses, or boards. A box that uses it is given a size of its own, so that the bricks stay the same size on every wall
const TEX = {}; export function wallMat(kind) { if (TEX[kind]) return TEX[kind]; const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d');
  if (kind === 'brick') { x.fillStyle = '#ead8c0'; x.fillRect(0, 0, 128, 64); for (let r = 0; r < 2; r++) for (let k = -1; k < 2; k++) { x.fillStyle = ['#c9775a', '#bb6b4f', '#d08467'][(k + 1 + r * 2) % 3]; x.fillRect(k * 64 + r * 32 + 2, r * 32 + 2, 60, 28); } }
  else { x.fillStyle = '#d9b684'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#c39b67'; for (let r = 0; r < 2; r++) { x.fillRect(0, r * 32, 128, 3); x.fillRect(r * 64 + 20, r * 32, 2, 32); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return (TEX[kind] = new THREE.MeshLambertMaterial({ map: t })); }
export function texBox(parent, x, z, w, d, y, h, mat, U = 2, V = 0.8) { const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) { const f = Math.floor(i / 4); uv.setXY(i, uv.getX(i) * (f < 2 ? d : w) / U, uv.getY(i) * (f === 2 || f === 3 ? d : h) / V); }
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }
// Small pictures that repeat, drawn in greys so that a material's own colour tints them: a window with a dark frame and a glint, a pane of glass, grass, leaves, and three wallpapers
const PT = {}; export function patTex(kind) { if (PT[kind]) return PT[kind]; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); }, rnd = (i, j) => hash(i * 7 + 1.3, j * 13 + 5.7), glint = () => { x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(6, 44); x.lineTo(44, 6); x.lineTo(58, 6); x.lineTo(6, 58); x.fill(); };
  if (kind === 'win') { R(0, 0, 64, 64, '#7d7d7d'); R(5, 5, 54, 54, '#dcdcdc'); glint(); R(30, 5, 4, 54, '#9a9a9a'); R(5, 30, 54, 4, '#9a9a9a'); }
  else if (kind === 'pane') { R(0, 0, 64, 64, '#dedede'); glint(); }
  else if (kind === 'grass') { R(0, 0, 64, 64, '#e2e2e2'); for (let i = 0; i < 46; i++) R(Math.floor(rnd(i, 1) * 61), Math.floor(rnd(i, 2) * 58), 3, 6, rnd(i, 3) > 0.5 ? '#ffffff' : '#c2c2c2'); }
  else if (kind === 'leaf') { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) R(i * 16, j * 16, 16, 16, ['#ffffff', '#e4e4e4', '#c0c0c0', '#d4d4d4'][Math.floor(rnd(i, j) * 4)]); }
  else if (kind === 'stripe') { R(0, 0, 64, 64, '#ffffff'); for (let i = 0; i < 8; i++) R(i * 8, 0, 3, 64, '#e4e4e4'); }
  else if (kind === 'dot') { R(0, 0, 64, 64, '#ffffff'); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) R(i * 16 + (j % 2) * 8 + 2, j * 16 + 5, 5, 5, '#e6e6e6'); }
  else if (kind === 'tile') { for (let j = 0; j < 4; j++) for (let i = -1; i < 4; i++) { const a = i * 16 + (j % 2) * 8, v = ['#ffffff', '#ececec', '#dadada', '#f6f6f6'][Math.floor(rnd(i + 9, j) * 4)]; R(a, j * 16, 16, 16, v); R(a, j * 16 + 12, 16, 4, '#9c9c9c'); R(a, j * 16, 1, 12, '#b8b8b8'); R(a + 1, j * 16, 14, 2, '#ffffff'); } }
  else if (kind === 'pave') { R(0, 0, 64, 64, '#a8a8a8'); for (let j = 0; j < 2; j++) for (let i = -1; i < 2; i++) { const a = i * 32 + j * 16; R(a + 1, j * 32 + 1, 30, 30, ['#ffffff', '#f0f0f0', '#e2e2e2', '#f8f8f8'][Math.floor(rnd(i + 3, j + 5) * 4)]); R(a + 1, j * 32 + 28, 30, 3, '#d2d2d2'); } }
  else if (kind === 'board') { for (let j = 0; j < 4; j++) { R(0, j * 16, 64, 16, ['#ffffff', '#efefef', '#f8f8f8', '#e6e6e6'][j]); R(0, j * 16 + 15, 64, 1, '#b4b4b4'); R(Math.floor(rnd(j, 7) * 56), j * 16, 1, 15, '#b4b4b4'); } }
  else if (kind === 'bark') { R(0, 0, 64, 64, '#f0f0f0'); for (let i = 0; i < 9; i++) R(i * 7 + 1, 0, 2, 64, i % 2 ? '#c4c4c4' : '#dcdcdc'); for (let i = 0; i < 14; i++) R(Math.floor(rnd(i, 11) * 60), Math.floor(rnd(i, 12) * 56), 3, 8, '#b8b8b8'); }
  else { R(0, 0, 64, 64, '#ffffff'); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { R(i * 16 + (j % 2) * 8 + 3, j * 16 + 6, 6, 2, '#e4e4e4'); R(i * 16 + (j % 2) * 8 + 5, j * 16 + 4, 2, 6, '#e4e4e4'); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return (PT[kind] = t); }
// A lit material in one colour whose small picture repeats across a box made with texBox: roof tiles, paving stones, floor boards, bark, grass or leaves
const TM = {}; export function tileMat(kind, hex, o = {}) { const k = kind + hex + (o.unlit ? 'u' : ''); if (TM[k]) return TM[k]; const t = patTex(kind).clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; return (TM[k] = o.unlit ? new THREE.MeshBasicMaterial({ color: hex, map: t }) : new THREE.MeshLambertMaterial({ color: hex, map: t })); }

// ---- the family ---------------------------------------------------------------------------------------------------------------------------
// The same family is in every level: a child with a cap, and two grown-ups. FAMILY is what each of them looks like, for fig(). k is how tall each one is
export const FAMILY = [{ k: 1, shirt: '#e0503a', legs: '#2b3a55', skin: SKIN[0], hair: HAIR[1], cap: '#3f78b5' }, { k: 1.28, shirt: '#8a5fc2', legs: '#2b3a55', skin: SKIN[3], hair: HAIR[4], long: true }, { k: 1.33, shirt: '#2e9b5a', legs: '#4a556e', skin: SKIN[0], hair: HAIR[0] }];
// the three of them standing together, facing the way given by turn: the child in front with a yellow rucksack and one arm up
export function familyGroup(g, t = 0) { fig(g, 0, 0.06, 0, { ...FAMILY[0], pack: '#ffd257', turn: t, arms: ['up', 'down'] });
  fig(g, -Math.sin(t) * 0.9 + Math.cos(t) * 1.3, 0.06, -Math.cos(t) * 0.9 - Math.sin(t) * 1.3, { ...FAMILY[1], turn: t - 0.2 });
  fig(g, -Math.sin(t) * 0.9 - Math.cos(t) * 1.3, 0.06, -Math.cos(t) * 0.9 + Math.sin(t) * 1.3, { ...FAMILY[2], turn: t + 0.3, arms: ['down', 'up'] }); return g; }
// colours for the shirts of other people in the town
export const SHIRTS = ['#3f78b5', '#8a5fc2', '#2e9b5a', '#e0a23a', '#16a3a3', '#c98a5a'];
