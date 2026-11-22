// Concept screens for "the child builds the plan" and "the child collects supplies" (owner, 22 Nov 2026).
// Each scene takes the film's real town at one moment, adds a few blocks to it, and lays a sketch of the interface on top.
// These are proposals only. The few words on them are placeholders, not final wording.
import * as V from '../animation/vox.js'; import * as MAP from '../animation/map.js'; import * as TW from '../animation/town.js';
const { THREE, PAL, blk, group, glow, clear } = V, TOP = TW.TOP, W = 1280, H = 720;
const G = group(MAP.world), kit = TW.makeKit(G), paleKit = TW.makeKit(G, TW.pale);
const SUN = glow('#ffd257'), SUN_SOFT = new THREE.MeshBasicMaterial({ color: '#ffd257', transparent: true, opacity: 0.55 }), WHITE_SOFT = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 });
const cell = (x, z, y, m = SUN_SOFT, s = 0.9) => blk(G, x + 0.5, z + 0.5, s, s, y + 0.02, 0.05, '#ffd257', { shadow: false, mat: m });
const home = (x, z, o = {}) => { const g = (o.pale ? paleKit : kit).home(x, z, (o.y ?? TOP) + (o.lift || 0), o.wall || PAL.wall[0], o.face ?? 1, o.roof || PAL.roof[0]); return g; };
const flag = (x, z, y) => { blk(G, x, z, 0.07, 0.07, y, 1.0, PAL.white, { shadow: false }); blk(G, x + 0.28, z, 0.5, 0.05, y + 0.66, 0.34, '#ffd257', { shadow: false, mat: SUN }); };
const log = (x, z, y, r = 0) => { const m = blk(G, x, z, 0.8, 0.26, y, 0.26, PAL.timber); m.rotation.y = r; blk(G, x, z, 0.82, 0.2, y + 0.03, 0.2, '#a9743f', { shadow: false }).rotation.y = r; return m; };
const stump = (x, z, y) => blk(G, x, z, 0.34, 0.34, y, 0.22, PAL.trunk);
const cartBox = (x, z, y, n = 0) => { const g = group(G, x, y, z); blk(g, 0, 0, 1.5, 0.95, 0.24, 0.4, PAL.timber); for (const [a, b] of [[-0.45, 0.5], [0.45, 0.5], [-0.45, -0.5], [0.45, -0.5]]) blk(g, a, b, 0.34, 0.1, 0, 0.34, '#2a2a2a', { shadow: false }); for (let k = 0; k < n; k++) { const l = blk(g, -0.3 + (k % 2) * 0.6, 0, 0.5, 0.8, 0.64 + Math.floor(k / 2) * 0.24, 0.22, k % 2 ? '#a9743f' : PAL.timber); } return g; };
const dust = (x, z, y) => { for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; blk(G, x + Math.cos(a) * 1.5, z + Math.sin(a) * 1.5, 0.3, 0.3, y + 0.05 + (k % 3) * 0.12, 0.3, '#f6ecd8', { shadow: false, mat: glow('#fff6e4') }); } };

// ---- the interface sketch ---------------------------------------------------------------------------------------------
const css = `
.cx { position: absolute; inset: 0; z-index: 6; font-family: var(--ui-body); color: var(--ui-ink); }
.cx .step { position: absolute; left: 50%; top: 16px; transform: translateX(-50%); padding: 10px 22px 11px; background: var(--ui-sun); border: 3px solid var(--ui-ink); border-radius: 999px; font: 800 26px/1.1 var(--ui-display); box-shadow: 0 5px 0 var(--ui-shade); white-space: nowrap; }
.cx .count { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 16px 0 10px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 16px; box-shadow: 0 5px 0 var(--ui-shade); font: 800 22px/1 var(--ui-display); }
.cx .count svg { width: 34px; height: 34px; }
.cx .tray { position: absolute; left: 132px; right: 16px; bottom: 16px; display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 22px; box-shadow: 0 5px 0 var(--ui-shade); }
.cx .tray .ui-btn { margin-left: auto; margin-top: 0; }
.cx .tok { display: grid; justify-items: center; gap: 2px; min-width: 96px; padding: 8px 10px 7px; background: var(--ui-white); border: 3px solid var(--ui-ink); border-radius: 16px; box-shadow: 0 6px 0 var(--ui-ink); margin-bottom: 6px; font: 700 16px/1.2 var(--ui-body); }
.cx .tok svg { width: 56px; height: 48px; }
.cx .tok.on { background: var(--ui-sun); transform: translateY(-6px); }
.cx .tok.used { background: var(--ui-paper-dim); border-style: dashed; box-shadow: none; transform: translateY(6px); color: var(--ui-ink-soft); }
.cx .tok.used svg { opacity: 0.35; }
.cx .sw { width: 60px; height: 60px; border: 3px solid var(--ui-ink); border-radius: 16px; box-shadow: 0 6px 0 var(--ui-ink); margin-bottom: 6px; }
.cx .sw.on { transform: translateY(-6px); box-shadow: 0 6px 0 var(--ui-ink), 0 0 0 5px var(--ui-sun); }
.cx .lab { font: 700 16px/1.2 var(--ui-body); color: var(--ui-ink-soft); margin-right: 4px; }
.cx .sep { width: 3px; align-self: stretch; background: rgba(31,42,68,.18); border-radius: 2px; margin: 0 6px; }
.cx .badge { position: absolute; width: 40px; height: 40px; margin: -20px 0 0 -20px; border-radius: 50%; border: 3px solid var(--ui-ink); background: var(--ui-paper); display: grid; place-items: center; box-shadow: 0 4px 0 var(--ui-shade); }
.cx .badge.ok { background: var(--ui-good); } .cx .badge svg { width: 24px; height: 24px; }
.cx .ring { position: absolute; width: 110px; height: 110px; margin: -55px 0 0 -55px; border-radius: 50%; border: 6px dashed var(--ui-paper); box-shadow: 0 0 0 4px var(--ui-ink), inset 0 0 0 4px var(--ui-ink); }
.cx .ring.s { width: 70px; height: 70px; margin: -35px 0 0 -35px; }
.cx .arrow { position: absolute; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 16px; background: var(--ui-white); border: 3px solid var(--ui-ink); box-shadow: 0 6px 0 var(--ui-ink); display: grid; place-items: center; }
.cx .arrow svg { width: 34px; height: 34px; }
.cx .plus { position: absolute; transform: translate(-50%, -50%); padding: 4px 12px 5px; background: var(--ui-sun); border: 3px solid var(--ui-ink); border-radius: 999px; font: 800 22px/1 var(--ui-display); }
.cx .flo { z-index: 1; } .cx .bub { position: absolute; left: 132px; bottom: 150px; }
.cx .ui-pointer { z-index: 9; }
`;
const tick = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const I = {
  home: (roof = '#c8643f', wall = '#fff4dc') => `<svg viewBox="0 0 56 48"><rect x="12" y="24" width="32" height="20" fill="${wall}" stroke="#1f2a44" stroke-width="3"/><rect x="8" y="17" width="40" height="8" fill="${roof}" stroke="#1f2a44" stroke-width="3"/><rect x="14" y="10" width="28" height="8" fill="${roof}" stroke="#1f2a44" stroke-width="3"/><rect x="20" y="3" width="16" height="8" fill="${roof}" stroke="#1f2a44" stroke-width="3"/><rect x="31" y="31" width="7" height="13" fill="#7a5a33"/><rect x="17" y="30" width="8" height="7" fill="#9fd0f5"/></svg>`,
  roof: () => `<svg viewBox="0 0 56 48"><rect x="8" y="30" width="40" height="10" fill="#c8643f" stroke="#1f2a44" stroke-width="3"/><rect x="14" y="20" width="28" height="10" fill="#c8643f" stroke="#1f2a44" stroke-width="3"/><rect x="20" y="10" width="16" height="10" fill="#c8643f" stroke="#1f2a44" stroke-width="3"/></svg>`,
  walls: (c = '#c9925a') => `<svg viewBox="0 0 56 48"><rect x="10" y="12" width="36" height="28" fill="${c}" stroke="#1f2a44" stroke-width="3"/><rect x="30" y="24" width="8" height="16" fill="#7a5a33"/><rect x="16" y="20" width="9" height="8" fill="#9fd0f5"/></svg>`,
  base: () => `<svg viewBox="0 0 56 48"><rect x="6" y="26" width="44" height="10" fill="#bdbcb6" stroke="#1f2a44" stroke-width="3"/></svg>`,
  log: (c = '#c9925a') => `<svg viewBox="0 0 56 48"><rect x="6" y="16" width="44" height="16" rx="3" fill="${c}" stroke="#1f2a44" stroke-width="3"/><rect x="40" y="16" width="10" height="16" rx="3" fill="#f6e1bd" stroke="#1f2a44" stroke-width="3"/></svg>`,
  brick: () => `<svg viewBox="0 0 56 48"><rect x="6" y="24" width="20" height="12" fill="#b5553a" stroke="#1f2a44" stroke-width="3"/><rect x="28" y="24" width="20" height="12" fill="#b5553a" stroke="#1f2a44" stroke-width="3"/><rect x="17" y="11" width="20" height="12" fill="#b5553a" stroke="#1f2a44" stroke-width="3"/></svg>`,
  bag: () => `<svg viewBox="0 0 56 48"><rect x="14" y="10" width="28" height="30" rx="5" fill="#bdbcb6" stroke="#1f2a44" stroke-width="3"/><rect x="20" y="20" width="16" height="6" fill="#fbfbf7"/></svg>`,
  tree: () => `<svg viewBox="0 0 56 48"><rect x="25" y="30" width="6" height="14" fill="#7a5a33"/><rect x="12" y="14" width="32" height="18" fill="#5fa35a" stroke="#1f2a44" stroke-width="3"/><rect x="19" y="4" width="18" height="11" fill="#5fa35a" stroke="#1f2a44" stroke-width="3"/></svg>`,
  flower: () => `<svg viewBox="0 0 56 48"><rect x="8" y="36" width="40" height="6" fill="#86c86b" stroke="#1f2a44" stroke-width="3"/><rect x="14" y="22" width="9" height="9" fill="#f08ab8" stroke="#1f2a44" stroke-width="3"/><rect x="26" y="16" width="9" height="9" fill="#ffd257" stroke="#1f2a44" stroke-width="3"/><rect x="36" y="24" width="9" height="9" fill="#ffffff" stroke="#1f2a44" stroke-width="3"/></svg>`,
  turbine: () => `<svg viewBox="0 0 56 48"><rect x="26" y="18" width="5" height="26" fill="#fbfbf7" stroke="#1f2a44" stroke-width="3"/><rect x="27" y="2" width="4" height="16" fill="#fbfbf7" stroke="#1f2a44" stroke-width="2.5"/><rect x="12" y="20" width="16" height="4" fill="#fbfbf7" stroke="#1f2a44" stroke-width="2.5" transform="rotate(-25 28 20)"/><rect x="29" y="20" width="16" height="4" fill="#fbfbf7" stroke="#1f2a44" stroke-width="2.5" transform="rotate(25 29 20)"/></svg>`,
  wire: () => `<svg viewBox="0 0 56 48"><path d="M6 34h14V16h16v18h14" fill="none" stroke="#1f2a44" stroke-width="9" stroke-linejoin="round"/><path d="M6 34h14V16h16v18h14" fill="none" stroke="#ffd257" stroke-width="4" stroke-linejoin="round"/></svg>`,
  path: () => `<svg viewBox="0 0 56 48"><path d="M6 34h14V16h16v18h14" fill="none" stroke="#1f2a44" stroke-width="13" stroke-linejoin="round"/><path d="M6 34h14V16h16v18h14" fill="none" stroke="#ecd29a" stroke-width="8" stroke-linejoin="round"/></svg>`,
  crate: (c = '#e0503a') => `<svg viewBox="0 0 56 48"><rect x="12" y="14" width="32" height="24" fill="${c}" stroke="#1f2a44" stroke-width="3"/></svg>`,
  arr: (r) => `<svg viewBox="0 0 24 24" style="transform:rotate(${r}deg)"><path d="M12 20V5M5 11l7-7 7 7" fill="none" stroke="#1f2a44" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};
const florence = '<div class="flo"><i class="flo-shadow"></i><div class="flo-body"><i class="ui-florence"></i></div></div>';
const dots = '<div class="ui-bubble ui-bubble--dots bub"><i></i><i></i><i></i></div>';
const top = (level, n, step, count) => `<div class="ui-top"><div class="ui-place"><b>1</b>Eco Town <strong>${level}</strong></div>${count || ''}</div><div class="step">${step}</div>`;
const count = (icon, text) => `<div class="count">${icon}${text}</div>`;
const tok = (icon, label, cls = '') => `<div class="tok ${cls}">${icon}${label ? `<span>${label}</span>` : ''}</div>`;
const tray = (inner, btn = 'Done', off = false) => `<div class="tray">${inner}<button class="ui-btn${off ? ' is-disabled' : ''}">${btn}</button></div>`;
const at = (cls, p, inner = '') => `<i class="${cls}" style="left:${p[0]}px;top:${p[1]}px">${inner}</i>`;
const finger = (p, down = true) => at(`ui-pointer${down ? ' is-down' : ''}`, [p[0] + 14, p[1] + 18]);

// ---- the scenes -------------------------------------------------------------------------------------------------------
// each: li and phase choose the state of the town, cam is [x, y, z, distance], build(P) adds blocks and returns points to
// project, html(p) returns the interface for those points
const S = TW.SPOTS, HILL = [8.5, 2, 0.6, 31];
export const SCENES = [
  { id: 'outlines', li: 0, cam: HILL, build() { home(S[0][0], S[0][1], { face: S[0][2] }); home(S[1][0], S[1][1], { face: S[1][2] }); dust(S[1][0], S[1][1], TOP);
      for (const k of [2, 3]) { home(S[k][0], S[k][1], { face: S[k][2], pale: true }); for (let a = -1; a <= 0; a++) for (let b = -1; b <= 0; b++) cell(S[k][0] + a, S[k][1] + b, TOP, SUN_SOFT, 1.25); }
      return { a: [S[2][0], TOP + 1.2, S[2][1]] }; },
    html: (p) => top('Land', 1, 'Build your plan', count(I.home(), '2 of 4')) + at('ring', p.a) + finger(p.a) + florence + tray(`<span class="lab">Tap each outline</span>`, 'Done', true) },

  { id: 'area', li: 0, cam: HILL, build() { for (let x = 5; x <= 12; x++) for (let z = -5; z <= 5; z++) cell(x, z, TOP);
      home(6.5, -3.5); home(11.5, 2.5, { face: -1 }); home(9, 0, { lift: 1.5 }); for (let a = -1; a <= 0; a++) for (let b = -1; b <= 0; b++) cell(9 + a, 0 + b, TOP, SUN, 1);
      return { a: [9, TOP + 2.6, 0] }; },
    html: (p) => top('Land', 1, 'Build your plan', count(I.home(), '2 of 4')) + finger(p.a) + florence + tray(tok(I.home(), '', 'used') + tok(I.home(), '', 'used') + tok(I.home(), '', 'on') + tok(I.home(), ''), 'Done', true) },

  { id: 'draw', li: 1, cam: [8.5, 2, 0.4, 29], build() { const cells = [[6, -1], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [10, 1]]; for (const [x, z] of cells) blk(G, x + 0.5, z + 0.5, 1, 1, TOP, 0.07, PAL.sand, { shadow: false });
      for (const [x, z] of [[10, 2], [10, 3], [11, 3]]) cell(x, z, TOP, WHITE_SOFT, 0.5);
      return { f: [10.5, TOP, 1.5], h0: [S[0][0], TOP + 2.6, S[0][1]], h1: [S[1][0], TOP + 2.6, S[1][1]], h2: [S[2][0], TOP + 2.6, S[2][1]], h3: [S[3][0], TOP + 2.6, S[3][1]] }; },
    html: (p) => top('Getting around', 2, 'Build your plan', count(I.path(), '1 of 4')) + at('badge ok', p.h0, tick) + at('badge', p.h1) + at('badge', p.h2) + at('badge', p.h3) + finger(p.f) + florence + tray(`<span class="lab">Draw a path to every home</span>`, 'Done', true) },

  { id: 'stack', li: 0, cam: [8.2, 2.6, -2.2, 15], build() { const x = 8, z = -3; blk(G, x, z, 2.3, 2.3, TOP, 0.12, PAL.concrete); blk(G, x, z, 1.9, 1.9, TOP + 0.12, 1.45, PAL.timber); for (const yy of [0.5, 1.0]) blk(G, x, z, 1.94, 1.94, TOP + 0.12 + yy, 0.07, '#a9743f', { shadow: false });
      blk(G, x + 0.4, z + 0.97, 0.42, 0.06, TOP + 0.12, 0.75, PAL.trunk, { shadow: false }); blk(G, x - 0.42, z + 0.97, 0.5, 0.06, TOP + 0.74, 0.45, PAL.glass, { shadow: false });
      const r = group(G, x, TOP + 0.12 + 1.1, z); MAP.stepRoof(r, 1.9, 1.9, 1.45, PAL.roof[0], PAL.timber, { tiles: true });
      home(12, -3, { pale: true }); home(4.6, -3.4, { pale: true });
      return { a: [x, TOP + 3.9, z] }; },
    html: (p) => top('Homes', 3, 'Build your plan', count(I.home('#c8643f', '#c9925a'), '1 of 6')) + finger(p.a) + florence + tray(tok(I.base(), 'Base', 'used') + tok(I.walls(), 'Walls', 'used') + tok(I.roof(), 'Roof', 'on'), 'Done', true) },

  { id: 'together', li: 0, cam: HILL, build() { for (const [x, z, f] of [[6.5, -3.5, 1], [9.5, -3, 1], [6.2, 3.6, -1]]) { home(x, z, { face: f }); flag(x + 1.25, z + 1.2 * f, TOP); }
      home(12, -3, { face: 1 }); dust(12, -3, TOP); home(9.3, 4, { face: -1, lift: 2.2 }); home(12, 3.6, { face: -1, pale: true });
      return {}; },
    html: () => top('Land', 1, 'Build your plan', count(I.home(), '4 of 6')) + florence + dots + tray(tok(I.home(), '', 'used') + tok(I.home(), '', 'used') + tok(I.home(), '', 'used') + `<i class="sep"></i><span class="lab">Florence builds the rest</span>`, 'Done', true) },

  { id: 'look', li: 0, cam: HILL, build() { home(S[0][0], S[0][1], { face: 1, roof: PAL.solar }); home(S[1][0], S[1][1], { face: 1 }); home(S[2][0], S[2][1], { face: -1, roof: '#2e9b5a' }); home(S[3][0], S[3][1], { face: -1, roof: '#e2c04a' });
      V.tree(G, S[2][0] + 1.7, S[2][1] - 0.6, 1.15, TOP); for (const [a, b, c] of [[-1.5, -0.8, '#f08ab8'], [-1.5, -0.2, '#ffd257'], [-1.5, 0.4, '#ffffff'], [-1.9, 0.1, '#c98be0']]) blk(G, S[2][0] + a, S[2][1] + b, 0.26, 0.26, TOP, 0.36, c, { shadow: false });
      return { a: [S[2][0], TOP + 1.4, S[2][1]] }; },
    html: (p) => top('Land', 1, 'Make it yours', '') + at('ring', p.a) + florence + tray(`<span class="lab">Roof</span><i class="sw" style="background:#c8643f"></i><i class="sw on" style="background:#2e9b5a"></i><i class="sw" style="background:#e2c04a"></i><i class="sw" style="background:#2f4f8f"></i><i class="sep"></i><span class="lab">Garden</span>` + tok(I.tree(), '', 'on') + tok(I.flower(), ''), 'Done') },

  { id: 'harvest', li: 2, cam: [-6.4, 0, 3.6, 22], build() { const y = 0; for (const [x, z] of [[-9.2, 1.2], [-9.6, 3.4], [-7.6, 0.4], [-6.2, 2.2], [-5.4, 5.4], [-9.2, 6.2]]) V.tree(G, x, z, 1.35, y); for (const [x, z] of [[-7.2, 3], [-6.4, 4.6], [-8.2, 4.8]]) stump(x, z, y);
      log(-6.9, 3.5, y, 0.4); log(-6.2, 4.1, y + 1.4, 0.9); log(-5.6, 4.6, y + 2.0, 1.3); cartBox(-4.4, 6.4, y, 3);
      return { t: [-7.6, 1.4, 0.4], l: [-6.2, 1.9, 4.1] }; },
    html: (p) => top('Homes', 3, 'Collect timber', count(I.log(), '4 of 6')) + at('ring', p.t) + finger(p.t) + at('plus', [p.l[0] + 46, p.l[1] - 30], '+1') + florence + tray(`<span class="lab">Tap a tree to cut it</span>`, 'Done', true) },

  { id: 'walk', li: 2, cam: [1.6, 0, -5, 22], build() { const y = 0, g = V.person(G, '#e0503a'); g.position.set(1.4, y, -3.2); g.scale.setScalar(1.5); g.rotation.y = 2.6; log(1.25, -2.9, y + 0.95, 0.3);
      for (const [x, z] of [[1.2, -4.2], [1, -5.1], [0.9, -6], [1.1, -6.9]]) blk(G, x, z, 0.26, 0.26, y + 0.02, 0.06, '#ffd257', { shadow: false, mat: SUN });
      for (const [x, z, r] of [[1.2, -8.1, 0.2], [1.5, -8.6, 1.2], [0.7, -8.5, 2]]) log(x, z, y, r); for (const [x, z] of [[2.2, -8.8], [0.2, -9.2], [-0.8, -7.6]]) V.tree(G, x, z, 1.3, y); stump(1.9, -7.6, y);
      for (const [x, z, r] of [[-1.2, -3.2, 0.5], [2.6, -5.8, 1]]) log(x, z, y, r); cartBox(2.5, -1.6, y, 2);
      return { a: [1.2, 0.3, -8.3], b: [-1.2, 0.3, -3.2], c: [2.6, 0.3, -5.8] }; },
    html: (p) => top('Homes', 3, 'Collect timber', count(I.log(), '3 of 6')) + at('ring', p.a) + finger(p.a) + at('ring s', p.b) + at('ring s', p.c) + florence + tray(`<span class="lab">Tap where to walk</span>`, 'Done', true) },

  { id: 'cart', li: 3, phase: 'after', cam: [3, 0.8, 0.2, 24], build() { const c = kit.cart(); c.position.set(3.1, 1, -0.5); c.rotation.y = 0; c.scale.setScalar(1.25);
      for (const [x, z, col] of [[2.2, -0.5, '#e0503a'], [1.6, -1.6, '#e2c04a'], [4.5, 0.6, '#4f9550']]) blk(G, x, z, 0.5, 0.5, TW.heightAt(x, z) + 0.05, 0.42, col);
      return { cr: [4.5, 2.6, 0.6], st: [TW.STALL[0], TOP + 2.4, TW.STALL[1]] }; },
    html: (p) => top('Food', 4, 'Take the food to market', count(I.crate(), '5 of 8')) + at('ring s', p.cr) + at('badge', p.st) + `<div class="arrow" style="left:1120px;top:500px">${I.arr(0)}</div><div class="arrow" style="left:1048px;top:572px">${I.arr(-90)}</div><div class="arrow" style="left:1192px;top:572px">${I.arr(90)}</div>` + florence },

  { id: 'right', li: 2, cam: [1.4, 0, -5, 21], build() { const y = 0;
      for (const [dx, dz, r, h] of [[0, 0, 0, 0], [0.1, 0.34, 0, 0], [0.05, 0.17, 0, 0.26], [-0.1, -0.5, 1.3, 0]]) log(0.6 + dx, -7.4 + dz, y + h, r); for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) cell(-0.4 + a, -8.4 + b, y, SUN, 1);
      for (let k = 0; k < 6; k++) blk(G, 1.2 + (k % 3) * 0.46 - 0.4, -5 + Math.floor(k / 3) * 0.3, 0.42, 0.24, y + (k > 2 ? 0.2 : 0), 0.2, PAL.brick);
      for (let k = 0; k < 3; k++) blk(G, 1.9 + (k % 2) * 0.6 - 0.3, -2.6, 0.55, 0.4, y + (k > 1 ? 0.3 : 0), 0.3, PAL.concrete);
      cartBox(2.7, -6.8, y, 4); log(1.7, -7.2, y + 1.3, 0.6);
      return { a: [0.6, 0.5, -7.4], b: [1.2, 0.5, -5], c: [1.9, 0.5, -2.6] }; },
    html: (p) => top('Homes', 3, 'Collect what your plan needs', count(I.log(), '5 of 6')) + at('ring', p.a) + finger(p.a) + florence + tray(`<span class="lab">Your plan</span>` + tok(I.log(), 'Timber', 'on') + `<i class="sep"></i>` + tok(I.brick(), 'Brick', 'used') + tok(I.bag(), 'Cement', 'used'), 'Done', true) },

  { id: 'power', li: 4, cam: [8.4, 2, 2.4, 31], build() { for (let x = 5; x <= 12; x++) for (const z of [6, 7]) cell(x, z, TOP); kit.turbine(6.6, TOP, 7.2); const t = kit.turbine(10.2, TOP + 1.6, 6.8); for (let a = -1; a <= 0; a++) for (let b = -1; b <= 0; b++) cell(10.2 + a, 6.8 + b, TOP, SUN, 1);
      for (const [x, z] of [[6, 6], [6, 5]]) blk(G, x + 0.5, z + 0.5, 0.34, 0.34, TOP + 0.08, 0.1, '#ffd257', { shadow: false, mat: SUN });
      return { a: [10.2, TOP + 4.6, 6.8] }; },
    html: (p) => top('Power', 5, 'Build your plan', count(I.turbine(), '1 of 2')) + finger(p.a) + florence + tray(tok(I.turbine(), '', 'used') + tok(I.turbine(), '', 'on') + `<i class="sep"></i>` + tok(I.wire(), 'Wire'), 'Done', true) },
];

let ui = null;
export function show(i) {
  const s = SCENES[i], m = film.segs[s.li + 1]; film.seek(m.start + (s.phase === 'after' ? m.inter[0] + 0.2 : m.askTap - 0.5));
  G.clear(); const pts = s.build() || {};
  const st = film.dbg; st.camera.setViewOffset(W, H, 0, 46, W, H); st.look(s.cam[0], s.cam[1], s.cam[2], s.cam[3], TW.TILT, TW.YAW); st.camera.updateMatrixWorld(); st.draw(MAP.scene);
  const p = Object.fromEntries(Object.entries(pts).map(([k, v]) => [k, st.screen(new THREE.Vector3(...v))]));
  if (!ui) { const stage = document.querySelector('.stage'); document.head.insertAdjacentHTML('beforeend', `<style>${css} .stage > .ui:not(.cx), .stage > canvas.fx { visibility: hidden; }</style>`); ui = document.createElement('div'); ui.className = 'ui cx'; ui.style.setProperty('--ui-florence-sprite', `url(${new URL('../animation/florence-sprite.webp', import.meta.url)})`); stage.append(ui); }
  ui.innerHTML = s.html(p); return s.id;
}
