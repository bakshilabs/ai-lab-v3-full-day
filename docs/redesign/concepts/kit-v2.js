// Shared pieces for the second version of the play-break concept screens (22 Nov 2026): people with faces, homes that
// read as homes from above, and the small interface parts. Everything is made of the same plain blocks as the town.
import * as V from '../animation/vox.js';
export const { THREE, PAL, blk, group, hash } = V;
export const W = 1280, H = 720;
export const GL = (c) => new THREE.MeshBasicMaterial({ color: c });
export const soft = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false });
export const INK = '#1f2a44', SUNC = '#ffd257', SKIN = ['#f1c9a0', '#c98d5e', '#8a5a3c', '#f6d7b8'], HAIR = ['#3a2a1c', '#7a4a22', '#e2b04a', '#1f2a44', '#b5553a'];
export const ROOFS = { red: '#d2553a', blue: '#3f78b5', green: '#2e9b5a', yellow: '#e9ad1c' };

// A yellow place where a part can go: a bright slab with a dark dashed edge, so that it never looks like sand.
export function place(g, x, z, w, d, y, o = {}) {
  const p = group(g, x, y, z), c = o.c || '#ffdf3d';
  blk(p, 0, 0, w, d, 0.02, o.h || 0.07, c, { shadow: false, mat: o.clear ? soft(c, o.clear) : GL(c) });
  const n = Math.max(2, Math.round(w / 0.7)), m = Math.max(2, Math.round(d / 0.7)), e = 0.13, hh = (o.h || 0.07) + 0.03;
  for (let k = 0; k < n; k++) for (const s of [-1, 1]) blk(p, -w / 2 + (k + 0.5) * (w / n), s * (d / 2), (w / n) * 0.55, e, 0.02, hh, INK, { shadow: false, mat: GL(INK) });
  for (let k = 0; k < m; k++) for (const s of [-1, 1]) blk(p, s * (w / 2), -d / 2 + (k + 0.5) * (d / m), e, (d / m) * 0.55, 0.02, hh, INK, { shadow: false, mat: GL(INK) });
  return p;
}
// an upright yellow place (for a window, a lift or a door): a glowing frame with dashes
export function frame(g, x, y, z, w, h, alongX = true, o = {}) {
  const p = group(g, x, y, z), t = o.t || 0.12, dd = o.d || 0.1, c = o.c || '#ffdf3d'; if (!alongX) p.rotation.y = Math.PI / 2;
  blk(p, 0, 0, w, dd, 0, h, c, { shadow: false, mat: o.fill === false ? soft(c, 0.01) : soft(c, o.fill || 0.8) });
  const n = Math.max(2, Math.round(w / 0.45)), m = Math.max(2, Math.round(h / 0.45));
  for (let k = 0; k < n; k++) for (const yy of [0, h - t]) blk(p, -w / 2 + (k + 0.5) * (w / n), 0, (w / n) * 0.55, dd + 0.06, yy, t, INK, { shadow: false, mat: GL(INK) });
  for (let k = 0; k < m; k++) for (const xx of [-w / 2, w / 2]) blk(p, xx, 0, t, dd + 0.06, (k + 0.22) * (h / m), (h / m) * 0.55, INK, { shadow: false, mat: GL(INK) });
  return p;
}

// A person about 1.7 high (times k) with legs, arms, hair and a face. The face looks towards +z before turning.
// arms: [left, right], each 'down', 'up' (waving), 'fwd' (holding something out), 'ears' (hands over the ears) or 'push'.
export function fig(g, x, y, z, o = {}) {
  const k = o.k || 1, p = group(g, x, y, z), shirt = o.shirt || '#e0503a', legs = o.legs || '#2b3a55', skin = o.skin || SKIN[0], hair = o.hair || HAIR[0], arms = o.arms || ['down', 'down'];
  p.scale.setScalar(k); p.rotation.y = o.turn || 0; const sit = o.sit ? 0.28 : 0;
  if (o.sit) { for (const s of [-1, 1]) { blk(p, s * 0.14, 0.2, 0.2, 0.5, 0.42, 0.2, legs); blk(p, s * 0.14, 0.42, 0.2, 0.2, 0.06, 0.4, legs); blk(p, s * 0.14, 0.46, 0.2, 0.3, 0, 0.1, '#3a2a1c'); } }
  else for (const s of [-1, 1]) { const st = o.step ? s * o.step : 0; blk(p, s * 0.14, st, 0.2, 0.24, 0.08, 0.46, legs); blk(p, s * 0.14, st + 0.04, 0.2, 0.32, 0, 0.1, '#3a2a1c'); }
  const by = 0.54 - sit * 0.4; blk(p, 0, 0, 0.56, 0.34, by, 0.6, shirt);
  if (o.bag) { blk(p, 0.34, -0.02, 0.16, 0.44, by + 0.02, 0.36, o.bag); const s = blk(p, 0, 0, 0.6, 0.36, by + 0.3, 0.08, o.bag, { shadow: false }); s.rotation.z = -0.5; }
  if (o.pack) { blk(p, 0, -0.3, 0.52, 0.26, by + 0.08, 0.5, o.pack); }
  const hd = group(p, 0, by + 0.6, 0); hd.rotation.y = o.head || 0;
  blk(hd, 0, 0, 0.5, 0.46, 0, 0.46, skin); blk(hd, 0, -0.03, 0.56, 0.5, 0.38, 0.13, hair); blk(hd, 0, -0.21, 0.56, 0.12, 0.08, 0.32, hair);
  if (o.long) for (const s of [-1, 1]) blk(hd, s * 0.26, -0.05, 0.08, 0.3, -0.06, 0.44, hair);
  const D = GL('#1f2a44'); for (const s of [-1, 1]) blk(hd, s * 0.12, 0.235, 0.09, 0.03, 0.2, 0.11, INK, { shadow: false, mat: D });
  blk(hd, 0, 0.235, 0.2, 0.03, 0.08, 0.05, '#b3243a', { shadow: false, mat: GL(o.sad ? '#7a4a3a' : '#c23a4a') });
  for (const s of [-1, 1]) blk(hd, s * 0.19, 0.235, 0.07, 0.02, 0.1, 0.06, '#f0a08a', { shadow: false, mat: GL('#f3a593') });
  if (o.hat) { blk(hd, 0, 0, 0.6, 0.56, 0.42, 0.16, o.hat); blk(hd, 0, 0.2, 0.6, 0.3, 0.42, 0.06, o.hat); }
  if (o.cap) { blk(hd, 0, -0.02, 0.56, 0.52, 0.4, 0.14, o.cap); blk(hd, 0, 0.3, 0.4, 0.2, 0.4, 0.05, o.cap); }
  arms.forEach((a, i) => { const s = i ? 1 : -1, ax = s * 0.37, sy = by + 0.6;
    if (a === 'up') { blk(p, ax + s * 0.04, 0, 0.16, 0.2, sy - 0.14, 0.62, shirt); blk(p, ax + s * 0.04, 0, 0.18, 0.2, sy + 0.48, 0.16, skin); }
    else if (a === 'fwd') { blk(p, ax, 0.22, 0.16, 0.5, sy - 0.2, 0.18, shirt); blk(p, ax, 0.52, 0.18, 0.16, sy - 0.2, 0.18, skin); }
    else if (a === 'push') { blk(p, ax, 0.2, 0.16, 0.46, sy - 0.34, 0.18, shirt); blk(p, ax, 0.48, 0.18, 0.14, sy - 0.34, 0.18, skin); }
    else if (a === 'ears') { blk(p, ax, 0.02, 0.16, 0.2, sy - 0.16, 0.5, shirt); blk(p, s * 0.31, 0.04, 0.14, 0.24, sy + 0.16, 0.22, skin); }
    else { blk(p, ax, 0, 0.16, 0.2, sy - 0.52, 0.52, shirt); blk(p, ax, 0, 0.16, 0.2, sy - 0.64, 0.12, skin); } });
  p.head = hd; return p;
}
export function wheelchair(g, x, y, z, o = {}) {
  const p = group(g, x, y, z), k = o.k || 1; p.scale.setScalar(k); p.rotation.y = o.turn || 0;
  for (const s of [-1, 1]) { blk(p, s * 0.42, -0.05, 0.1, 0.7, 0, 0.7, '#1f2a44'); blk(p, s * 0.42, -0.05, 0.12, 0.3, 0.2, 0.3, '#c9d2da', { shadow: false }); blk(p, s * 0.36, 0.42, 0.08, 0.22, 0, 0.22, '#1f2a44'); }
  blk(p, 0, 0, 0.74, 0.6, 0.36, 0.1, '#2b3a55'); blk(p, 0, -0.32, 0.74, 0.1, 0.36, 0.74, '#2b3a55'); for (const s of [-1, 1]) blk(p, s * 0.3, -0.42, 0.08, 0.16, 1.02, 0.08, '#1f2a44');
  const f = fig(p, 0, 0.18, 0, { ...o, k: 1, turn: 0, sit: true }); return p;
}
export function walkingFrame(g, x, y, z, turn = 0, k = 1) {
  const p = group(g, x, y, z); p.rotation.y = turn; p.scale.setScalar(k);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) blk(p, sx * 0.32, sz * 0.2, 0.06, 0.06, 0, 0.82, '#c9d2da'); for (const sx of [-1, 1]) blk(p, sx * 0.32, 0, 0.07, 0.46, 0.8, 0.07, '#2b3a55'); blk(p, 0, 0.2, 0.7, 0.06, 0.5, 0.06, '#c9d2da'); blk(p, 0, 0.2, 0.7, 0.06, 0.8, 0.06, '#c9d2da'); return p;
}

// A home with a face: stepped roof with a ridge, a chimney, a door with a step, windows, and a small front garden.
// s is the width. The door looks towards +z (the camera of the map) unless face is -1.
export function cottage(g, x, y, z, o = {}) {
  const s = o.s || 2.4, tall = o.tall || s * 0.56, roof = o.roof || ROOFS.red, wall = o.wall || PAL.wall[0], f = o.face || 1, p = group(g, x, y, z), d = o.d || s;
  blk(p, 0, 0, s, d, 0, tall, wall); if (o.timber) for (const yy of [0.33, 0.66]) blk(p, 0, 0, s + 0.04, d + 0.04, tall * yy, tall * 0.045, '#a9743f', { shadow: false });
  const n = o.steps || 4, rh = (o.rise || s * 0.11); for (let i = 0; i < n; i++) blk(p, 0, 0, s + 0.3, (d + 0.34) * (1 - i / n * 0.86), tall + i * rh, rh, i % 2 && o.stripe !== false ? shade(roof, -0.06) : roof);
  blk(p, 0, 0, s + 0.3, 0.14 * s, tall + n * rh, rh * 0.45, shade(roof, 0.12));
  if (o.chimney !== false) { blk(p, -s * 0.28, -d * 0.22, s * 0.16, s * 0.16, tall, n * rh + s * 0.16, '#b5553a'); blk(p, -s * 0.28, -d * 0.22, s * 0.2, s * 0.2, tall + n * rh + s * 0.16, s * 0.04, '#f6e1bd'); }
  if (o.solar) { blk(p, s * 0.2, f * d * 0.26, s * 0.42, d * 0.24, tall + rh * 1.05, 0.05, PAL.solar, { shadow: false }); }
  // the door (open when the home is awake), the step and the windows
  const dz = f * (d / 2 + 0.03), dc = o.door || '#7a5a33', lit = o.awake ? GL('#ffe27a') : o.dark ? GL('#33415f') : GL('#9fd0f5');
  blk(p, 0, dz, s * 0.2, 0.06, 0, tall * 0.62, o.open ? '#3a2a1c' : dc, { shadow: false, mat: o.open ? GL('#4a3524') : undefined }); if (o.open) blk(p, s * 0.13, dz + f * s * 0.09, 0.06, s * 0.18, 0, tall * 0.62, dc);
  else blk(p, s * 0.05, dz + f * 0.03, s * 0.035, 0.03, tall * 0.28, s * 0.035, SUNC, { shadow: false, mat: GL(SUNC) });
  blk(p, 0, f * (d / 2 + s * 0.12), s * 0.32, s * 0.22, 0, 0.1, '#d9d2c2');
  for (const sx of [-1, 1]) { blk(p, sx * s * 0.31, dz, s * 0.2, 0.06, tall * 0.34, tall * 0.32, '#9fd0f5', { shadow: false, mat: lit }); blk(p, sx * s * 0.31, dz + f * 0.02, s * 0.24, 0.05, tall * 0.28, tall * 0.05, '#fbfbf7', { shadow: false }); }
  blk(p, s / 2 + 0.03, 0, 0.06, s * 0.24, tall * 0.34, tall * 0.32, '#9fd0f5', { shadow: false, mat: lit });
  if (o.glow) { blk(p, 0, f * (d / 2 + s * 0.3), s * 1.1, s * 0.6, 0.06, 0.03, '#ffe27a', { shadow: false, mat: soft('#ffe27a', 0.75) }); for (const sx of [-1, 1]) blk(p, sx * s * 0.31, dz + f * 0.03, s * 0.3, 0.05, tall * 0.26, tall * 0.46, '#ffe27a', { shadow: false, mat: GL('#fff0a0') }); blk(p, s / 2 + 0.05, 0, 0.06, s * 0.4, tall * 0.26, tall * 0.46, '#ffe27a', { shadow: false, mat: GL('#fff0a0') }); }
  if (o.garden !== false) { const gz = f * (d / 2 + s * 0.42), gw = s * 1.16;
    blk(p, 0, gz, gw, s * 0.62, 0.005, 0.04, '#74b56a', { shadow: false }); blk(p, 0, gz, s * 0.2, s * 0.62, 0.01, 0.05, o.pathC || '#efe2c2', { shadow: false });
    for (const sx of [-1, 1]) { for (let q = 0; q < 3; q++) blk(p, sx * (gw / 2), gz - f * s * 0.2 + f * q * s * 0.2, 0.07, 0.07, 0, s * 0.16, '#fbfbf7'); blk(p, sx * (gw / 2), gz, 0.05, s * 0.6, s * 0.09, 0.05, '#fbfbf7', { shadow: false });
      const fc = ['#f08ab8', '#ffd257', '#ffffff', '#c98be0'][Math.floor(hash(x + sx, z) * 4)]; for (let q = 0; q < 2; q++) blk(p, sx * s * (0.3 + q * 0.14), gz + f * (q ? -0.1 : 0.12) * s, s * 0.09, s * 0.09, 0.04, s * 0.1, fc, { shadow: false, mat: GL(fc) }); } }
  return p;
}
const C0 = new THREE.Color();
export const shade = (h, a) => '#' + C0.set(h).offsetHSL(0, 0, a).getHexString();
export function tree(g, x, y, z, k = 1, c) { const p = group(g, x, y, z), col = c || PAL.leaf[Math.floor(hash(x, z) * 3)]; blk(p, 0, 0, 0.26 * k, 0.26 * k, 0, 0.7 * k, PAL.trunk); blk(p, 0, 0, 1.1 * k, 1.1 * k, 0.6 * k, 0.75 * k, col); blk(p, 0.05 * k, -0.05 * k, 0.7 * k, 0.7 * k, 1.35 * k, 0.45 * k, shade(col, 0.05)); return p; }
export function pine(g, x, y, z, k = 1) { const p = group(g, x, y, z), c = '#3f8a56'; blk(p, 0, 0, 0.22 * k, 0.22 * k, 0, 0.5 * k, PAL.trunk); blk(p, 0, 0, 1.0 * k, 1.0 * k, 0.4 * k, 0.5 * k, c); blk(p, 0, 0, 0.7 * k, 0.7 * k, 0.9 * k, 0.5 * k, shade(c, 0.04)); blk(p, 0, 0, 0.4 * k, 0.4 * k, 1.4 * k, 0.5 * k, shade(c, 0.08)); return p; }
export function dust(g, x, y, z, r = 1.6, n = 10) { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + 0.3, s = 0.22 + hash(i, 3) * 0.2; blk(g, x + Math.cos(a) * r, z + Math.sin(a) * r, s, s, y + 0.05 + hash(i, 7) * 0.25, s, '#fff6e4', { shadow: false, mat: GL('#fff8ea') }); } }
// blocky food: each one must read as that food at a glance
export function tomato(g, x, y, z, k = 1) { const p = group(g, x, y, z); blk(p, 0, 0, 0.34 * k, 0.34 * k, 0, 0.3 * k, '#e23b2e', { mat: GL('#e8402f') }); blk(p, 0, 0, 0.26 * k, 0.26 * k, 0.3 * k, 0.04 * k, '#e23b2e', { shadow: false, mat: GL('#f0604a') }); blk(p, 0, 0, 0.2 * k, 0.2 * k, 0.32 * k, 0.05 * k, '#2e9b5a', { shadow: false, mat: GL('#2e9b5a') }); blk(p, 0, 0, 0.06 * k, 0.06 * k, 0.36 * k, 0.1 * k, '#2e9b5a', { shadow: false, mat: GL('#2e7b4a') }); return p; }
export function lettuce(g, x, y, z, k = 1) { const p = group(g, x, y, z); blk(p, 0, 0, 0.56 * k, 0.4 * k, 0, 0.16 * k, '#5fb04e', { mat: GL('#62b653') }); blk(p, 0, 0, 0.42 * k, 0.36 * k, 0.16 * k, 0.14 * k, '#8fd46a', { mat: GL('#8fd86c') }); blk(p, 0, 0, 0.22 * k, 0.26 * k, 0.3 * k, 0.1 * k, '#c4ee8e', { mat: GL('#cdf29a') }); return p; }
export function strawberry(g, x, y, z, k = 1) { const p = group(g, x, y, z), R = GL('#e02a4a'); blk(p, 0, 0, 0.3 * k, 0.26 * k, 0.12 * k, 0.16 * k, '#e02a4a', { mat: R }); blk(p, 0, 0, 0.22 * k, 0.22 * k, 0.04 * k, 0.08 * k, '#e02a4a', { shadow: false, mat: R }); blk(p, 0, 0, 0.12 * k, 0.16 * k, -0.03 * k, 0.07 * k, '#e02a4a', { shadow: false, mat: R });
  blk(p, 0, 0, 0.34 * k, 0.28 * k, 0.28 * k, 0.05 * k, '#2e9b5a', { shadow: false, mat: GL('#2e9b5a') }); for (const [a, b] of [[-0.08, 0.2], [0.07, 0.15], [0, 0.08]]) blk(p, a * k, 0.135 * k, 0.04 * k, 0.02, b * k, 0.04 * k, '#ffe27a', { shadow: false, mat: GL('#ffe9a0') }); return p; }

// ---- the interface sketch -------------------------------------------------------------------------------------------
export const css = `
.cx { position: absolute; inset: 0; z-index: 6; font-family: var(--ui-body); color: var(--ui-ink); overflow: hidden; }
.cx .step { position: absolute; left: 50%; top: 16px; transform: translateX(-50%); padding: 10px 22px 11px; background: var(--ui-sun); border: 3px solid var(--ui-ink); border-radius: 999px; font: 800 26px/1.1 var(--ui-display); box-shadow: 0 5px 0 var(--ui-shade); white-space: nowrap; z-index: 3; }
.cx .ui-top { z-index: 3; }
.cx .count { display: flex; align-items: center; gap: 4px; height: 48px; padding: 0 12px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 16px; box-shadow: 0 5px 0 var(--ui-shade); font: 800 20px/1 var(--ui-display); }
.cx .count svg { width: 30px; height: 28px; } .cx .count svg.off { opacity: .28; filter: grayscale(1); } .cx .count b { margin: 0 8px 0 2px; } .cx .count span { font: 700 17px/1 var(--ui-body); margin-right: 6px; }
.cx .pal { position: absolute; right: 16px; top: 80px; width: 206px; display: flex; flex-direction: column; gap: 8px; padding: 12px 12px 8px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 22px; box-shadow: 0 5px 0 var(--ui-shade); z-index: 3; }
.cx .pal h3 { margin: 0 0 2px; font: 800 20px/1.1 var(--ui-display); }
.cx .pal h4 { margin: 2px 0 0; font: 700 16px/1.1 var(--ui-body); color: var(--ui-ink-soft); }
.cx .tok { display: grid; grid-template-columns: 46px 1fr; align-items: center; gap: 8px; padding: 5px 8px; background: var(--ui-white); border: 3px solid var(--ui-ink); border-radius: 14px; box-shadow: 0 5px 0 var(--ui-ink); margin-bottom: 5px; font: 700 17px/1.15 var(--ui-body); }
.cx .tok svg { width: 46px; height: 40px; }
.cx .tok small { display: block; font: 700 15px/1.2 var(--ui-body); color: var(--ui-ink-soft); }
.cx .tok.on { background: var(--ui-sun); }
.cx .tok.used { background: var(--ui-paper-dim); border-style: dashed; box-shadow: none; transform: translateY(5px); color: var(--ui-ink-soft); }
.cx .tok.used svg { opacity: 0.45; }
.cx .sws { display: flex; gap: 8px; margin: 0 0 8px; } .cx .sws i { width: 38px; height: 38px; border: 3px solid var(--ui-ink); border-radius: 10px; box-shadow: 0 4px 0 var(--ui-ink); } .cx .sws i.on { outline: 4px solid var(--ui-sun); outline-offset: 2px; transform: translateY(-3px); }
.cx .mouse { position: absolute; width: 40px; height: 48px; z-index: 9; filter: drop-shadow(0 3px 0 rgba(31,42,68,.3)); }
.cx .flo { z-index: 2; }
.cx .hint { position: absolute; left: 132px; bottom: 22px; max-width: 760px; padding: 12px 20px 13px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 22px 22px 22px 6px; box-shadow: 0 5px 0 var(--ui-shade); font: 600 22px/1.3 var(--ui-body); z-index: 3; }
.cx .keys { position: absolute; right: 16px; bottom: 18px; display: flex; gap: 10px; align-items: flex-end; z-index: 3; }
.cx .key { display: flex; align-items: center; justify-content: center; gap: 8px; min-width: 56px; height: 56px; padding: 0 14px; background: var(--ui-white); border: 3px solid var(--ui-ink); border-radius: 12px; box-shadow: 0 5px 0 var(--ui-ink); font: 800 20px/1 var(--ui-display); white-space: nowrap; }
.cx .key.on { background: var(--ui-sun); transform: translateY(4px); box-shadow: 0 1px 0 var(--ui-ink); }
.cx .key em { font: 600 18px/1 var(--ui-body); font-style: normal; }
.cx .plate { position: absolute; transform: translate(-50%, -50%); padding: 5px 12px 6px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 10px; font: 800 19px/1 var(--ui-display); white-space: nowrap; z-index: 2; box-shadow: 0 4px 0 var(--ui-shade); }
.cx .plate.on { background: var(--ui-sun); }
.cx .plate.tip::after { content: ''; position: absolute; left: 50%; bottom: -10px; width: 14px; height: 14px; margin-left: -7px; background: inherit; border-right: 3px solid var(--ui-ink); border-bottom: 3px solid var(--ui-ink); transform: rotate(45deg); }
.cx .zz { position: absolute; transform: translate(-50%, -50%); font: 800 22px/1 var(--ui-display); color: #fff; text-shadow: 0 2px 0 var(--ui-ink), 2px 0 0 var(--ui-ink), -2px 0 0 var(--ui-ink), 0 -2px 0 var(--ui-ink); z-index: 2; letter-spacing: 1px; }
.cx .ring { position: absolute; transform: translate(-50%, -50%); border: 5px solid #fff; border-radius: 50%; box-shadow: 0 0 0 4px var(--ui-ink), inset 0 0 0 4px var(--ui-ink); z-index: 2; }
.cx .num { position: absolute; transform: translate(-50%, -50%); font: 800 46px/1 var(--ui-display); z-index: 2; color: var(--ui-ink); }
.cx .num small { font: 700 17px/1 var(--ui-body); color: #fffaf0; margin-right: 10px; vertical-align: middle; }
.cx .ico { position: absolute; transform: translate(-50%, -50%); z-index: 2; display: grid; place-items: center; }
.cx .diagram { background: var(--ui-white); border: 3px solid var(--ui-ink); border-radius: 14px; padding: 4px 4px 0; margin-bottom: 4px; }
.cx .diagram svg { display: block; width: 100%; height: auto; }
.cx .pal.wide { width: 250px; }
.cx .band { position: absolute; left: 0; right: 0; bottom: 0; height: 226px; background: var(--ui-paper); border-top: 6px solid var(--ui-ink); box-sizing: border-box; z-index: 1; }
.cx .tray { position: absolute; left: 424px; right: 16px; bottom: 12px; height: 198px; display: flex; gap: 14px; align-items: center; justify-content: flex-end; z-index: 3; }
.cx .tray .tok { width: 178px; margin: 0; box-sizing: border-box; }
.cx .tray .grp { display: flex; flex-direction: column; gap: 9px; justify-content: center; }
.cx .tray h4 { margin: 0; font: 700 16px/1.1 var(--ui-body); color: var(--ui-ink-soft); }
.cx .tray .sws { margin: 0; }
.cx .tray .diagram { width: 236px; margin: 0; box-sizing: border-box; }
.cx .tray .keys { position: static; }
.cx .tray .count { height: 56px; }
.cx .tray .say { max-width: 250px; font: 700 19px/1.25 var(--ui-body); }
`;
const O = 'stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"';
export const I = {
  home: (roof = '#d2553a', wall = '#fff4dc') => `<svg viewBox="0 0 56 48"><rect x="12" y="24" width="32" height="20" fill="${wall}" ${O}/><path d="M6 25L28 6l22 19z" fill="${roof}" ${O}/><rect x="31" y="31" width="7" height="13" fill="#7a5a33"/><rect x="17" y="30" width="8" height="7" fill="#9fd0f5"/><rect x="36" y="8" width="6" height="9" fill="#b5553a" stroke="#1f2a44" stroke-width="2"/></svg>`,
  tree: () => `<svg viewBox="0 0 56 48"><rect x="25" y="30" width="6" height="14" fill="#7a5a33"/><rect x="12" y="14" width="32" height="18" fill="#5fa35a" ${O}/><rect x="19" y="4" width="18" height="11" fill="#5fa35a" ${O}/></svg>`,
  shop: () => `<svg viewBox="0 0 56 48"><rect x="10" y="22" width="36" height="22" fill="#fff4dc" ${O}/><rect x="6" y="10" width="44" height="13" fill="#e0503a" ${O}/><rect x="17" y="10" width="7" height="13" fill="#fff"/><rect x="32" y="10" width="7" height="13" fill="#fff"/></svg>`,
  path: (c = '#fff7e6') => `<svg viewBox="0 0 56 48"><path d="M6 34h14V16h16v18h14" fill="none" stroke="#1f2a44" stroke-width="14" stroke-linejoin="round"/><path d="M6 34h14V16h16v18h14" fill="none" stroke="${c}" stroke-width="8" stroke-linejoin="round"/></svg>`,
  bridge: () => `<svg viewBox="0 0 56 48"><rect x="2" y="30" width="52" height="12" fill="#5cb8e6"/><path d="M4 30q24-22 48 0" fill="none" stroke="#1f2a44" stroke-width="12"/><path d="M4 30q24-22 48 0" fill="none" stroke="#c9925a" stroke-width="6"/></svg>`,
  rub: () => `<svg viewBox="0 0 56 48"><path d="M10 30l18-18 16 16-12 12H18z" fill="#f08ab8" ${O}/><path d="M18 22l16 16" stroke="#1f2a44" stroke-width="3"/></svg>`,
  base: () => `<svg viewBox="0 0 56 48"><rect x="6" y="26" width="44" height="10" fill="#bdbcb6" ${O}/></svg>`,
  wall: () => `<svg viewBox="0 0 56 48"><rect x="8" y="10" width="40" height="30" fill="#c9925a" ${O}/><rect x="8" y="10" width="40" height="7" fill="#ffe27a" ${O}/></svg>`,
  win: () => `<svg viewBox="0 0 56 48"><rect x="12" y="8" width="32" height="32" fill="#9fd0f5" ${O}/><path d="M28 8v32M12 24h32" stroke="#1f2a44" stroke-width="3"/></svg>`,
  roof: (c = '#d2553a') => `<svg viewBox="0 0 56 48"><path d="M4 38L28 10l24 28z" fill="${c}" ${O}/></svg>`,
  door: (c = '#7a5a33') => `<svg viewBox="0 0 56 48"><rect x="18" y="6" width="20" height="36" fill="${c}" ${O}/><rect x="31" y="23" width="4" height="4" fill="#ffd257"/></svg>`,
  ramp: () => `<svg viewBox="0 0 56 48"><path d="M6 40h44V16z" fill="#bdbcb6" ${O}/></svg>`,
  lift: () => `<svg viewBox="0 0 56 48"><rect x="16" y="6" width="24" height="36" fill="#9fd0f5" ${O}/><path d="M28 12v8M24 16l4-4 4 4M28 36v-8M24 32l4 4 4-4" fill="none" stroke="#1f2a44" stroke-width="3"/></svg>`,
  wide: () => `<svg viewBox="0 0 56 48"><rect x="8" y="8" width="19" height="34" fill="#7a5a33" ${O}/><rect x="29" y="8" width="19" height="34" fill="#7a5a33" ${O}/></svg>`,
  quiet: () => `<svg viewBox="0 0 56 48"><rect x="8" y="10" width="40" height="30" fill="#c9a5ea" ${O}/><rect x="14" y="28" width="16" height="8" fill="#fff4dc" stroke="#1f2a44" stroke-width="2.5"/><rect x="34" y="16" width="8" height="8" fill="#ffd257" stroke="#1f2a44" stroke-width="2"/></svg>`,
  letter: () => `<svg viewBox="0 0 56 48"><rect x="8" y="12" width="40" height="26" fill="#fff" ${O}/><path d="M8 12l20 15 20-15" fill="none" ${O}/></svg>`,
  tomato: () => `<svg viewBox="0 0 56 48"><rect x="12" y="14" width="32" height="28" rx="10" fill="#e8402f" ${O}/><path d="M20 14h16l-4-6h-8z" fill="#2e9b5a" ${O}/></svg>`,
  lettuce: () => `<svg viewBox="0 0 56 48"><rect x="8" y="20" width="40" height="22" rx="8" fill="#62b653" ${O}/><rect x="15" y="11" width="26" height="16" rx="6" fill="#8fd86c" ${O}/><rect x="22" y="6" width="12" height="10" rx="4" fill="#cdf29a" ${O}/></svg>`,
  straw: () => `<svg viewBox="0 0 56 48"><path d="M12 16h32v8L28 44 12 24z" fill="#e02a4a" ${O}/><rect x="14" y="9" width="28" height="8" fill="#2e9b5a" ${O}/><rect x="20" y="22" width="4" height="4" fill="#ffe9a0"/><rect x="32" y="22" width="4" height="4" fill="#ffe9a0"/><rect x="26" y="31" width="4" height="4" fill="#ffe9a0"/></svg>`,
  basket: () => `<svg viewBox="0 0 56 48"><path d="M8 20h40l-5 22H13z" fill="#c9925a" ${O}/><path d="M16 20q12-22 24 0" fill="none" ${O}/></svg>`,
  spring: () => `<svg viewBox="0 0 40 40" width="40" height="40"><rect x="18" y="20" width="4" height="16" fill="#2e9b5a"/><rect x="12" y="6" width="16" height="16" rx="4" fill="#f08ab8" stroke="#1f2a44" stroke-width="3"/><rect x="17" y="11" width="6" height="6" fill="#ffd257"/></svg>`,
  summer: () => `<svg viewBox="0 0 40 40" width="40" height="40"><rect x="11" y="11" width="18" height="18" rx="4" fill="#ffd257" stroke="#1f2a44" stroke-width="3"/><path d="M20 2v6M20 32v6M2 20h6M32 20h6M7 7l4 4M29 29l4 4M33 7l-4 4M7 33l4-4" stroke="#1f2a44" stroke-width="3" stroke-linecap="round"/></svg>`,
  autumn: () => `<svg viewBox="0 0 40 40" width="40" height="40"><path d="M20 4l12 12-6 14H14L8 16z" fill="#e08a3a" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/><path d="M20 12v24" stroke="#1f2a44" stroke-width="3"/></svg>`,
  winter: () => `<svg viewBox="0 0 40 40" width="40" height="40"><path d="M20 3v34M5 11l30 18M35 11L5 29" stroke="#1f2a44" stroke-width="7" stroke-linecap="round"/><path d="M20 3v34M5 11l30 18M35 11L5 29" stroke="#dff1f7" stroke-width="3" stroke-linecap="round"/></svg>`,
};
export const florence = '<div class="flo"><i class="flo-shadow"></i><div class="flo-body"><i class="ui-florence"></i></div></div>';
export const top = (level, step, count = '') => `<div class="ui-top"><div class="ui-place"><b>1</b>Eco Town <strong>${level}</strong></div>${count}</div><div class="step">${step}</div>`;
// a counter made of small pictures: n of them lit, the rest pale
export const row = (icons, n, label = '') => `<div class="count">${label ? `<span>${label}</span>` : ''}${icons.map((s, k) => (k < n ? s : s.replace('<svg ', '<svg class="off" '))).join('')}</div>`;
export const tok = (icon, label, cls = '', small = '') => `<div class="tok ${cls}">${icon}<span>${label}${small ? `<small>${small}</small>` : ''}</span></div>`;
export const pal = (title, inner, cls = '') => `<div class="pal ${cls}"><h3>${title}</h3>${inner}</div>`;
export const sws = (cols, on) => `<div class="sws">${cols.map((c, k) => `<i class="${k === on ? 'on' : ''}" style="background:${c}"></i>`).join('')}</div>`;
export const mouse = (x, y) => `<svg class="mouse" style="left:${x}px;top:${y}px" viewBox="0 0 40 48"><path d="M5 3l28 22-13 2 8 15-7 3-8-15-8 9z" fill="#fff" stroke="#1f2a44" stroke-width="3.5" stroke-linejoin="round"/></svg>`;
export const hint = (t) => `<div class="hint">${t}</div>`;
// the paper band under the scene: Florence, one short instruction, and the helper panel, so that nothing covers the scene
export const band = (t, tray) => `<i class="band"></i>${florence}<div class="hint" style="max-width:262px">${t}</div><div class="tray">${tray}</div>`;
export const plate = (p, t, cls = '', dx = 0, dy = 0) => `<i class="plate ${cls}" style="left:${p[0] + dx}px;top:${p[1] + dy}px">${t}</i>`;
