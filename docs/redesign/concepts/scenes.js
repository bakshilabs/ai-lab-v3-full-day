// Concept screens for the play breaks in Eco Town (owner, 22 Nov 2026): once or twice in each level the child leaves the
// usual high camera and builds or collects something in a different view. The game is played with a mouse.
// Each scene takes the film's real town at one moment (or hides it behind a flat drawing) and lays a sketch of the
// interface on top. These are proposals only. The few words on them are placeholders, not final wording.
import * as V from '../animation/vox.js'; import * as MAP from '../animation/map.js'; import * as TW from '../animation/town.js';
const { THREE, PAL, blk, group } = V, TOP = TW.TOP, W = 1280, H = 720;
const G = group(MAP.world), kit = TW.makeKit(G);
const soft = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o }), SUN = new THREE.MeshBasicMaterial({ color: '#ffd257' }), SUN_SOFT = soft('#ffd257', 0.85), WHITE_SOFT = soft('#ffffff', 0.55);
const cell = (x, z, y, m = SUN_SOFT, s = 0.9) => blk(G, x + 0.5, z + 0.5, s, s, y + 0.02, 0.05, '#ffd257', { shadow: false, mat: m });
const plot = (x, z, y = TOP, m = SUN_SOFT) => blk(G, x, z, 2.5, 2.5, y + 0.03, 0.06, '#ffd257', { shadow: false, mat: m });
const home = (x, z, face = 1, y = TOP, roof = PAL.roof[0]) => kit.home(x, z, y, PAL.wall[0], face, roof);

const css = `
.cx { position: absolute; inset: 0; z-index: 6; font-family: var(--ui-body); color: var(--ui-ink); overflow: hidden; }
.cx .art { position: absolute; inset: 0; width: 1280px; height: 720px; }
.cx .step { position: absolute; left: 50%; top: 16px; transform: translateX(-50%); padding: 10px 22px 11px; background: var(--ui-sun); border: 3px solid var(--ui-ink); border-radius: 999px; font: 800 26px/1.1 var(--ui-display); box-shadow: 0 5px 0 var(--ui-shade); white-space: nowrap; z-index: 3; }
.cx .ui-top { z-index: 3; }
.cx .count { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 16px 0 10px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 16px; box-shadow: 0 5px 0 var(--ui-shade); font: 800 22px/1 var(--ui-display); }
.cx .count svg { width: 34px; height: 30px; }
.cx .pal { position: absolute; right: 16px; top: 80px; width: 200px; display: flex; flex-direction: column; gap: 9px; padding: 12px 12px 8px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 22px; box-shadow: 0 5px 0 var(--ui-shade); z-index: 3; }
.cx .pal h3 { margin: 0 0 2px; font: 800 20px/1.1 var(--ui-display); }
.cx .tok { display: grid; grid-template-columns: 48px 1fr; align-items: center; gap: 8px; padding: 6px 8px; background: var(--ui-white); border: 3px solid var(--ui-ink); border-radius: 14px; box-shadow: 0 5px 0 var(--ui-ink); margin-bottom: 5px; font: 700 17px/1.15 var(--ui-body); }
.cx .tok svg { width: 48px; height: 42px; }
.cx .tok small { display: block; font: 700 15px/1.2 var(--ui-body); color: var(--ui-ink-soft); }
.cx .tok.on { background: var(--ui-sun); }
.cx .tok.used { background: var(--ui-paper-dim); border-style: dashed; box-shadow: none; transform: translateY(5px); color: var(--ui-ink-soft); }
.cx .tok.used svg { opacity: 0.4; }
.cx .drag { position: absolute; transform: translate(-50%, -50%) rotate(-4deg); filter: drop-shadow(0 14px 0 rgba(31,42,68,.3)); z-index: 4; }
.cx .mouse { position: absolute; width: 40px; height: 48px; z-index: 9; filter: drop-shadow(0 3px 0 rgba(31,42,68,.3)); }
.cx .flo { z-index: 2; }
.cx .hint { position: absolute; left: 132px; bottom: 22px; padding: 12px 20px 13px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 22px 22px 22px 6px; box-shadow: 0 5px 0 var(--ui-shade); font: 600 22px/1.3 var(--ui-body); z-index: 3; }
.cx .keys { position: absolute; right: 16px; bottom: 18px; display: flex; gap: 8px; align-items: flex-end; z-index: 3; }
.cx .key { display: grid; place-items: center; min-width: 56px; height: 56px; padding: 0 12px; background: var(--ui-white); border: 3px solid var(--ui-ink); border-radius: 12px; box-shadow: 0 5px 0 var(--ui-ink); font: 800 20px/1 var(--ui-display); }
.cx .key.wide { min-width: 190px; }
.cx .desk { position: absolute; left: 0; right: 0; bottom: 0; height: 292px; background: #2b3a55; border-top: 10px solid #1f2a44; display: grid; grid-template-columns: 1.15fr 1.5fr 0.9fr; gap: 14px; padding: 16px 16px 16px 150px; z-index: 2; }
.cx .card { background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 18px; padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 8px; }
.cx .card h3 { margin: 0; font: 800 20px/1.1 var(--ui-display); }
.cx .src { display: grid; grid-template-columns: 40px 70px 1fr 62px; align-items: center; gap: 10px; font: 700 18px/1.1 var(--ui-body); }
.cx .src svg { width: 40px; height: 36px; }
.cx .bar { height: 22px; border: 3px solid var(--ui-ink); border-radius: 8px; background: var(--ui-paper-dim); overflow: hidden; } .cx .bar i { display: block; height: 100%; }
.cx .sw { width: 62px; height: 34px; border: 3px solid var(--ui-ink); border-radius: 999px; background: var(--ui-paper-dim); position: relative; } .cx .sw::after { content: ''; position: absolute; top: 2px; left: 2px; width: 24px; height: 24px; border-radius: 50%; background: var(--ui-ink); }
.cx .sw.on { background: var(--ui-good); } .cx .sw.on::after { left: 30px; background: #fff; }
.cx .seasons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; } .cx .sea { display: grid; place-items: center; height: 46px; background: var(--ui-white); border: 3px solid var(--ui-ink); border-radius: 12px; box-shadow: 0 4px 0 var(--ui-ink); font: 700 17px/1 var(--ui-body); } .cx .sea.on { background: var(--ui-sun); }
.cx .led { position: absolute; transform: translate(-50%, -50%); font: 800 44px/1 var(--ui-display); color: #7dffa8; text-shadow: 0 0 12px rgba(125,255,168,.7); letter-spacing: 1px; z-index: 2; }
.cx .led.y { color: #ffd257; text-shadow: 0 0 12px rgba(255,210,87,.7); } .cx .led.b { color: #9fd0f5; text-shadow: 0 0 12px rgba(159,208,245,.7); }
.cx .plate { position: absolute; transform: translate(-50%, -50%); padding: 5px 14px 6px; background: var(--ui-paper); border: 3px solid var(--ui-ink); border-radius: 10px; font: 800 20px/1 var(--ui-display); white-space: nowrap; z-index: 2; }
.cx .plate.on { background: var(--ui-sun); }
.cx .frame { position: absolute; left: 0; right: 0; top: 0; height: 428px; border: 22px solid #2b3a55; border-bottom-width: 0; z-index: 1; } .cx .frame i { position: absolute; top: 0; bottom: 0; width: 16px; background: #2b3a55; }
`;
const I = {
  home: (roof = '#c8643f', wall = '#fff4dc') => `<svg viewBox="0 0 56 48"><rect x="12" y="24" width="32" height="20" fill="${wall}" stroke="#1f2a44" stroke-width="3"/><rect x="8" y="17" width="40" height="8" fill="${roof}" stroke="#1f2a44" stroke-width="3"/><rect x="14" y="10" width="28" height="8" fill="${roof}" stroke="#1f2a44" stroke-width="3"/><rect x="20" y="3" width="16" height="8" fill="${roof}" stroke="#1f2a44" stroke-width="3"/><rect x="31" y="31" width="7" height="13" fill="#7a5a33"/><rect x="17" y="30" width="8" height="7" fill="#9fd0f5"/></svg>`,
  roofTop: () => `<svg viewBox="0 0 96 96" width="96" height="96"><rect x="6" y="6" width="84" height="84" fill="#c8643f" stroke="#1f2a44" stroke-width="4"/><rect x="24" y="6" width="48" height="84" fill="#d0774a" stroke="#1f2a44" stroke-width="3"/><rect x="40" y="6" width="16" height="84" fill="#e08a5c"/></svg>`,
  tree: () => `<svg viewBox="0 0 56 48"><rect x="25" y="30" width="6" height="14" fill="#7a5a33"/><rect x="12" y="14" width="32" height="18" fill="#5fa35a" stroke="#1f2a44" stroke-width="3"/><rect x="19" y="4" width="18" height="11" fill="#5fa35a" stroke="#1f2a44" stroke-width="3"/></svg>`,
  shop: () => `<svg viewBox="0 0 56 48"><rect x="10" y="22" width="36" height="22" fill="#fff4dc" stroke="#1f2a44" stroke-width="3"/><rect x="6" y="10" width="44" height="13" fill="#e0503a" stroke="#1f2a44" stroke-width="3"/><rect x="17" y="10" width="7" height="13" fill="#fff"/><rect x="32" y="10" width="7" height="13" fill="#fff"/></svg>`,
  path: () => `<svg viewBox="0 0 56 48"><path d="M6 34h14V16h16v18h14" fill="none" stroke="#1f2a44" stroke-width="13" stroke-linejoin="round"/><path d="M6 34h14V16h16v18h14" fill="none" stroke="#ecd29a" stroke-width="8" stroke-linejoin="round"/></svg>`,
  bench: () => `<svg viewBox="0 0 56 48"><rect x="8" y="22" width="40" height="7" fill="#c9925a" stroke="#1f2a44" stroke-width="3"/><rect x="8" y="12" width="40" height="7" fill="#c9925a" stroke="#1f2a44" stroke-width="3"/><rect x="12" y="29" width="5" height="12" fill="#1f2a44"/><rect x="39" y="29" width="5" height="12" fill="#1f2a44"/></svg>`,
  lamp: () => `<svg viewBox="0 0 56 48"><rect x="26" y="14" width="5" height="30" fill="#2b3a55"/><rect x="19" y="4" width="19" height="12" fill="#ffd257" stroke="#1f2a44" stroke-width="3"/></svg>`,
  base: () => `<svg viewBox="0 0 56 48"><rect x="6" y="26" width="44" height="10" fill="#bdbcb6" stroke="#1f2a44" stroke-width="3"/></svg>`,
  wall: () => `<svg viewBox="0 0 56 48"><rect x="10" y="10" width="36" height="30" fill="#c9925a" stroke="#1f2a44" stroke-width="3"/><rect x="20" y="18" width="16" height="12" fill="#9fd0f5" stroke="#1f2a44" stroke-width="2.5"/></svg>`,
  roof: () => `<svg viewBox="0 0 56 48"><rect x="8" y="30" width="40" height="10" fill="#c8643f" stroke="#1f2a44" stroke-width="3"/><rect x="14" y="20" width="28" height="10" fill="#c8643f" stroke="#1f2a44" stroke-width="3"/><rect x="20" y="10" width="16" height="10" fill="#c8643f" stroke="#1f2a44" stroke-width="3"/></svg>`,
  door: () => `<svg viewBox="0 0 56 48"><rect x="18" y="6" width="20" height="36" fill="#7a5a33" stroke="#1f2a44" stroke-width="3"/><rect x="31" y="23" width="4" height="4" fill="#ffd257"/></svg>`,
  lettuce: () => `<svg viewBox="0 0 56 48"><rect x="14" y="16" width="28" height="20" fill="#5fa35a" stroke="#1f2a44" stroke-width="3"/><rect x="22" y="8" width="12" height="9" fill="#74b56a" stroke="#1f2a44" stroke-width="3"/></svg>`,
  sun: () => `<svg viewBox="0 0 40 36"><rect x="12" y="10" width="16" height="16" fill="#ffd257" stroke="#1f2a44" stroke-width="3"/><path d="M20 2v5M20 29v5M4 18h5M31 18h5" stroke="#1f2a44" stroke-width="3"/></svg>`,
  wind: () => `<svg viewBox="0 0 40 36"><rect x="18" y="14" width="4" height="20" fill="#1f2a44"/><rect x="18" y="1" width="4" height="13" fill="#fbfbf7" stroke="#1f2a44" stroke-width="2"/><rect x="6" y="15" width="13" height="4" fill="#fbfbf7" stroke="#1f2a44" stroke-width="2" transform="rotate(-25 19 15)"/><rect x="21" y="15" width="13" height="4" fill="#fbfbf7" stroke="#1f2a44" stroke-width="2" transform="rotate(25 21 15)"/></svg>`,
  batt: () => `<svg viewBox="0 0 40 36"><rect x="5" y="9" width="27" height="18" fill="#fbfbf7" stroke="#1f2a44" stroke-width="3"/><rect x="32" y="14" width="4" height="8" fill="#1f2a44"/><rect x="8" y="12" width="14" height="12" fill="#1c7a45"/></svg>`,
  ramp: () => `<svg viewBox="0 0 56 48"><path d="M6 40h44V16z" fill="#bdbcb6" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/></svg>`,
  lift: () => `<svg viewBox="0 0 56 48"><rect x="16" y="6" width="24" height="36" fill="#9fd0f5" stroke="#1f2a44" stroke-width="3"/><path d="M28 12v8M24 16l4-4 4 4M28 36v-8M24 32l4 4 4-4" fill="none" stroke="#1f2a44" stroke-width="3"/></svg>`,
  wide: () => `<svg viewBox="0 0 56 48"><rect x="8" y="8" width="19" height="34" fill="#7a5a33" stroke="#1f2a44" stroke-width="3"/><rect x="29" y="8" width="19" height="34" fill="#7a5a33" stroke="#1f2a44" stroke-width="3"/></svg>`,
  quiet: () => `<svg viewBox="0 0 56 48"><rect x="8" y="10" width="40" height="30" fill="#c98be0" stroke="#1f2a44" stroke-width="3"/><rect x="14" y="28" width="16" height="8" fill="#fff4dc" stroke="#1f2a44" stroke-width="2.5"/></svg>`,
  books: () => `<svg viewBox="0 0 56 48"><rect x="8" y="10" width="40" height="30" fill="#fff4dc" stroke="#1f2a44" stroke-width="3"/><rect x="13" y="14" width="6" height="10" fill="#e0503a"/><rect x="21" y="14" width="6" height="10" fill="#3f78b5"/><rect x="29" y="14" width="6" height="10" fill="#2e9b5a"/><rect x="13" y="27" width="6" height="10" fill="#ffd257"/><rect x="21" y="27" width="6" height="10" fill="#8a5fc2"/></svg>`,
  swing: () => `<svg viewBox="0 0 56 48"><path d="M8 42V8h40v34" fill="none" stroke="#1f2a44" stroke-width="4"/><path d="M22 8v20M34 8v20" stroke="#1f2a44" stroke-width="2.5"/><rect x="19" y="28" width="18" height="5" fill="#e0503a" stroke="#1f2a44" stroke-width="2.5"/></svg>`,
};
const florence = '<div class="flo"><i class="flo-shadow"></i><div class="flo-body"><i class="ui-florence"></i></div></div>';
const top = (level, step, count = '') => `<div class="ui-top"><div class="ui-place"><b>1</b>Eco Town <strong>${level}</strong></div>${count}</div><div class="step">${step}</div>`;
const count = (icon, text) => `<div class="count">${icon}${text}</div>`;
const tok = (icon, label, cls = '', small = '') => `<div class="tok ${cls}">${icon}<span>${label}${small ? `<small>${small}</small>` : ''}</span></div>`;
const pal = (title, inner) => `<div class="pal"><h3>${title}</h3>${inner}</div>`;
const mouse = (x, y) => `<svg class="mouse" style="left:${x}px;top:${y}px" viewBox="0 0 40 48"><path d="M5 3l28 22-13 2 8 15-7 3-8-15-8 9z" fill="#fff" stroke="#1f2a44" stroke-width="3.5" stroke-linejoin="round"/></svg>`;
const drag = (x, y, inner) => `<div class="drag" style="left:${x}px;top:${y}px">${inner}</div>`;
const hint = (t) => `<div class="hint">${t}</div>`;
// flat drawings: r is a block with a hard shadow under it, d is a dashed place where a part belongs
const r = (x, y, w, h, c, sh = 0) => `${sh ? `<rect x="${x + sh}" y="${y + sh}" width="${w}" height="${h}" fill="#1f2a44" opacity=".22"/>` : ''}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const d = (x, y, w, h, on = true) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${on ? '#ffd257' : '#ffffff'}" fill-opacity="${on ? 0.55 : 0.35}" stroke="${on ? '#1f2a44' : '#4a556e'}" stroke-width="4" stroke-dasharray="14 10"/>`;
const kid = (x, y, c, s = 1) => r(x, y - 34 * s, 20 * s, 22 * s, c) + r(x + 2 * s, y - 50 * s, 16 * s, 16 * s, '#f1c9a0') + r(x + 2 * s, y - 12 * s, 6 * s, 12 * s, '#2b3a55') + r(x + 12 * s, y - 12 * s, 6 * s, 12 * s, '#2b3a55');

// ---- the flat drawing of the indoor farm (a platform game is flat by nature) --------------------------------------------
function farm() {
  const u = 40; let s = r(0, 0, 1280, 720, '#dff1f7');
  // the town on top: a block with a glass greenhouse on its roof, and the street
  s += r(40, 200, 200, 160, '#f6e1bd') + r(1040, 160, 200, 200, '#fbecd0'); for (const [x, y] of [[70, 230], [150, 230], [70, 290], [150, 290], [1070, 190], [1150, 190], [1070, 260], [1150, 260]]) s += r(x, y, 50, 40, '#9fd0f5');
  s += r(280, 240, 720, 120, '#fff4dc'); for (let k = 0; k < 7; k++) s += r(310 + k * 100, 270, 60, 60, '#9fd0f5');
  s += r(280, 80, 720, 160, '#bfe3f5') + r(280, 80, 720, 10, '#fbfbf7'); for (let k = 0; k <= 9; k++) s += r(280 + k * 80 - (k === 9 ? 8 : 0), 80, 8, 160, '#fbfbf7');
  s += r(280, 228, 720, 12, '#2b3a55');
  for (const y of [150, 208]) { s += r(320, y, 560, 10, '#8d8378'); for (let k = 0; k < 13; k++) s += r(330 + k * 42, y - 26, 30, 26, k % 4 === 3 ? '#74b56a' : '#5fa35a') + (y === 150 && k % 3 === 1 ? r(340 + k * 42, y - 38, 12, 12, '#e0503a') : ''); }
  s += r(0, 360, 1280, 40, '#8d8378') + r(0, 360, 1280, 8, '#c9c2b4') + r(0, 400, 1280, 320, '#a27443');
  for (const [x, y, w] of [[60, 430, 80], [1100, 440, 120], [200, 660, 100], [960, 670, 140], [600, 420, 60]]) s += r(x, y, w, 20, '#b98a55');
  // the tunnel farm under the street
  s += r(120, 440, 1040, 220, '#2b3350') + r(120, 440, 1040, 12, '#c98be0') + r(120, 648, 1040, 12, '#4a556e');
  for (const [x, y, w] of [[180, 540, 360], [640, 540, 280], [180, 600, 240], [520, 600, 520]]) { s += r(x, y, w, 10, '#b9c6d2'); const n = Math.floor(w / 42); for (let k = 0; k < n; k++) s += r(x + 8 + k * 42, y - 26, 30, 26, (k + x) % 3 ? '#5fa35a' : '#74b56a'); s += r(x, y - 60, w, 6, '#f08ab8'); }
  s += r(1000, 452, 60, 196, '#3f78b5') + r(1012, 452, 36, 196, '#5cb8e6');
  // ladders, and the things to pick
  for (const [x, y0, y1] of [[930, 240, 648], [150, 540, 648]]) { s += r(x, y0, 6, y1 - y0, '#ffd257') + r(x + 34, y0, 6, y1 - y0, '#ffd257'); for (let y = y0 + 14; y < y1; y += 24) s += r(x, y, 40, 5, '#ffd257'); }
  for (const [x, y] of [[420, 486], [470, 466], [520, 486], [720, 500], [770, 500], [300, 566], [640, 566], [600, 100], [660, 100]]) s += r(x, y, 20, 20, '#ffd257', 3) + r(x + 6, y + 6, 8, 8, '#fff6c8');
  // the child's character, jumping between two shelves
  s += kid(566, 520, '#e0503a', 1.25) + r(556, 470, 44, 8, '#e0503a');
  return `<svg class="art" viewBox="0 0 1280 720">${s}</svg>`;
}
// ---- rooms of their own: a factory, a control room and a school, built from the same blocks as the town -----------------
const GL = (c) => new THREE.MeshBasicMaterial({ color: c });
const ghost = (g, x, z, w, d, y, h, on = true) => blk(g, x, z, w, d, y, h, '#ffd257', { shadow: false, mat: on ? soft('#ffd257', 0.62) : soft('#ffffff', 0.42) });
const who = (g, x, z, c, y = 0, k = 1.5, hat = null, turn = 0) => { const p = V.person(g, c); p.position.set(x, y, z); p.scale.setScalar(k); p.rotation.y = turn; if (hat) blk(p, 0, 0, 0.44, 0.44, 0.98, 0.14, hat); return p; };
const wheelchair = (g, x, z, y, c) => { const p = group(g, x, y, z); blk(p, 0, 0, 0.7, 0.7, 0.35, 0.12, '#2b3a55'); blk(p, -0.32, 0, 0.1, 0.7, 0.47, 0.7, '#2b3a55'); for (const zz of [-0.4, 0.4]) blk(p, 0, zz, 0.7, 0.1, 0, 0.7, '#1f2a44', { shadow: false }); blk(p, 0.05, 0, 0.5, 0.42, 0.47, 0.6, c); blk(p, 0.05, 0, 0.44, 0.44, 1.07, 0.44, '#f1c9a0'); return p; };
const panel = (g, x, z, y, alongX = true) => { const w = alongX ? 1.9 : 0.16, dd = alongX ? 0.16 : 1.9; blk(g, x, z, w, dd, y, 1.45, PAL.timber); for (const yy of [0.5, 1.0]) blk(g, x, z, w + 0.04, dd + 0.04, y + yy, 0.07, '#a9743f', { shadow: false }); blk(g, x, z, alongX ? 0.7 : 0.2, alongX ? 0.2 : 0.7, y + 0.6, 0.5, PAL.glass, { shadow: false }); };

function factory3d(g) {
  blk(g, 0, 0, 27, 16, -0.4, 0.4, '#dcd5c5'); for (const x of [-6.2, 5.6]) blk(g, x, 0, 0.18, 16, 0, 0.02, '#ffd257', { shadow: false }); blk(g, 30, 0, 34, 40, -0.42, 0.4, '#86c86b', { shadow: false });
  // the walls: the back wall has windows, the right wall has a wide open door, and the front wall is left out
  blk(g, 0, -7.9, 27, 0.4, 0, 7.2, '#efe6d2'); for (let k = 0; k < 6; k++) blk(g, -10.6 + k * 4.2, -7.66, 2.8, 0.1, 3.6, 2.4, '#cfeaf8', { shadow: false, mat: GL('#cfeaf8') });
  blk(g, -13.4, 0, 0.4, 16, 0, 7.2, '#e6dcc6'); blk(g, 13.4, -5.4, 0.4, 5.2, 0, 7.2, '#e6dcc6'); blk(g, 13.4, 6.2, 0.4, 3.6, 0, 7.2, '#e6dcc6'); blk(g, 13.4, 0.8, 0.4, 7.2, 5.2, 2, '#e6dcc6');
  for (const x of [-10.5, 10.5]) { blk(g, x, -0.1, 0.3, 15.6, 7.2, 0.35, '#2b3a55'); blk(g, x, -3, 0.5, 0.5, 6.7, 0.4, '#ffd257', { shadow: false, mat: GL('#fff3c4') }); blk(g, x, 3, 0.5, 0.5, 6.7, 0.4, '#ffd257', { shadow: false, mat: GL('#fff3c4') }); }
  // the crane: two rails, a yellow bridge, and a wall panel on the hook
  blk(g, 0, -7.2, 27, 0.3, 6.1, 0.3, '#2b3a55'); blk(g, 0, 7.4, 27, 0.3, 6.1, 0.3, '#2b3a55'); blk(g, 1.3, 0.1, 0.8, 14.8, 5.7, 0.55, '#ffd257'); blk(g, 1.3, 1, 1.2, 1.2, 5.2, 0.5, '#e9ad1c'); blk(g, 1.3, 1, 0.08, 0.08, 4.25, 0.95, '#1f2a44', { shadow: false }); blk(g, 1.3, 1, 0.5, 0.2, 4.1, 0.16, '#1f2a44', { shadow: false });
  panel(g, 1.3, 1, 2.65, false);
  // the building bay: a home half made, with yellow places for the parts that are missing
  blk(g, -2.2, 1, 5.2, 5.2, 0, 0.16, '#8d8378'); blk(g, -2.2, 1, 2.5, 2.5, 0.16, 0.2, PAL.concrete);
  panel(g, -2.2, 0.13, 0.36, true); panel(g, -3.07, 1, 0.36, false); ghost(g, -1.33, 1, 0.2, 1.9, 0.36, 1.45); ghost(g, -2.2, 1.87, 1.9, 0.2, 0.36, 1.45, false);
  ghost(g, -2.2, 1, 2.2, 2.2, 1.85, 0.24, false); ghost(g, -2.2, 1, 1.6, 2.2, 2.09, 0.24, false); ghost(g, -2.2, 1, 1.0, 2.2, 2.33, 0.22, false);
  // racks of parts along the back wall: walls, roofs, foundations, doors and windows
  for (let k = 0; k < 7; k++) { blk(g, -12 + k * 0.26, -6.6, 0.16, 1.9, 0, 1.45, k % 2 ? '#c08a52' : PAL.timber); }
  blk(g, -10.9, -6.6, 2.6, 2.3, 0, 0.1, '#4a556e'); for (let k = 0; k < 5; k++) { blk(g, -7.4, -6.3, 2.15, 2.15, k * 0.52, 0.22, PAL.roof[k % 3]); blk(g, -7.4, -6.3, 1.65, 2.15, k * 0.52 + 0.22, 0.22, PAL.roof[k % 3]); }
  for (let k = 0; k < 6; k++) blk(g, -4, -6.3, 2.5, 2.5, k * 0.24, 0.2, k % 2 ? '#b0afa8' : PAL.concrete);
  for (let k = 0; k < 5; k++) blk(g, -0.9 + k * 0.3, -6.9, 0.12, 0.9, 0, 1.5, PAL.trunk); for (let k = 0; k < 5; k++) blk(g, 1.6 + k * 0.3, -6.9, 0.12, 0.9, 0, 0.9, PAL.glass, { mat: GL('#9fd0f5') });
  // the diagram on the back wall: the parts of a home, with the wall that comes next in yellow
  blk(g, 7.4, -7.62, 5.2, 0.12, 2.6, 3.6, '#2b3a55'); const W1 = GL('#dff1f7'), Y1 = GL('#ffd257');
  blk(g, 7.4, -7.5, 3.2, 0.06, 3.0, 0.22, '#fff', { shadow: false, mat: W1 }); blk(g, 6.75, -7.5, 1.2, 0.06, 3.3, 1.1, '#fff', { shadow: false, mat: W1 }); blk(g, 8.05, -7.5, 1.2, 0.06, 3.3, 1.1, '#fff', { shadow: false, mat: Y1 });
  blk(g, 7.4, -7.5, 3.0, 0.06, 4.5, 0.3, '#fff', { shadow: false, mat: W1 }); blk(g, 7.4, -7.5, 2.2, 0.06, 4.85, 0.3, '#fff', { shadow: false, mat: W1 }); blk(g, 7.4, -7.5, 1.3, 0.06, 5.2, 0.3, '#fff', { shadow: false, mat: W1 });
  // the saw bench and the logs on the left, and the roller belt that carries panels to the bay
  for (let k = 0; k < 5; k++) blk(g, -11.6, -2.6 + k * 0.5, 2.6, 0.42, (k % 2) * 0.42, 0.42, k % 2 ? '#a9743f' : PAL.timber); blk(g, -11.2, 1.6, 2.6, 1.6, 0, 0.9, '#4a556e'); blk(g, -11.2, 1.6, 0.1, 1.1, 0.9, 0.7, '#c9d2da'); blk(g, -11.2, 1.6, 2.2, 0.5, 0.9, 0.2, PAL.timber);
  blk(g, -8.4, 5.2, 8.4, 1.5, 0, 0.6, '#4a556e'); for (let k = 0; k < 16; k++) blk(g, -12.3 + k * 0.52, 5.2, 0.28, 1.3, 0.6, 0.14, '#c9d2da', { shadow: false }); blk(g, -9.4, 5.2, 1.9, 1.45, 0.74, 0.16, PAL.timber); blk(g, -6.6, 5.2, 1.9, 1.45, 0.74, 0.16, PAL.timber);
  // a fork-lift carrying a roof, a finished home on a trailer by the door, and the people who work here
  blk(g, 6.2, 4.6, 2, 1.3, 0.3, 0.9, '#ffd257'); blk(g, 5.9, 4.6, 0.9, 1.1, 1.2, 0.9, '#2b3a55'); blk(g, 7.25, 4.6, 0.16, 1.2, 0.2, 2.6, '#1f2a44'); blk(g, 7.9, 4.6, 1.3, 1.1, 0.5, 0.1, '#c9d2da'); for (const [a, b] of [[5.6, 3.95], [6.9, 3.95], [5.6, 5.25], [6.9, 5.25]]) blk(g, a, b, 0.5, 0.2, 0, 0.5, '#1f2a44');
  blk(g, 8.2, 4.6, 1.9, 1.9, 0.6, 0.22, PAL.roof[0]); blk(g, 8.2, 4.6, 1.4, 1.9, 0.82, 0.22, PAL.roof[0]);
  blk(g, 10.2, 0.8, 4.2, 2.8, 0.45, 0.25, '#2b3a55'); for (const [a, b] of [[8.8, -0.6], [11.6, -0.6], [8.8, 2.2], [11.6, 2.2]]) blk(g, a, b, 0.7, 0.24, 0, 0.7, '#1f2a44'); TW.makeKit(g).home(10.2, 0.8, 0.7, PAL.timber, 1, PAL.roof[0]);
  who(g, -0.2, 3.6, '#3f78b5', 0, 1.5, '#ffd257'); who(g, -9.6, 2.9, '#e0503a', 0, 1.5, '#ffd257'); who(g, 4.6, -3.4, '#2e9b5a', 0, 1.5, '#ffd257'); who(g, 9.6, 5.8, '#8a5fc2', 0, 1.5, '#ffd257');
  return { hook: [1.3, 3.4, 1], yes: [-1.33, 1.1, 1] };
}

function control3d(g, view) {
  blk(g, 0, 0, 18, 14, -0.4, 0.4, '#2b3350');
  // the back wall with one wide window, and what is seen through it
  blk(g, 0, -5.2, 15.4, 0.1, 1.4, 4.6, '#fff', { shadow: false, mat: new THREE.MeshBasicMaterial({ map: view }) });
  blk(g, 0, -5, 18, 0.5, 0, 1.4, '#3a4668'); blk(g, 0, -5, 18, 0.5, 6, 1.6, '#3a4668'); for (const x of [-8.35, 8.35]) blk(g, x, -5, 1.3, 0.5, 1.4, 4.6, '#3a4668'); for (const x of [-2.6, 2.6]) blk(g, x, -4.9, 0.22, 0.3, 1.4, 4.6, '#2b3350');
  blk(g, -9.1, 0, 0.4, 14, 0, 7.6, '#333e5e'); blk(g, 9.1, 0, 0.4, 14, 0, 7.6, '#333e5e');
  // the time of day: a row of lamps over the window, with the sun where the day has reached and the moon at the end
  for (let k = 0; k < 13; k++) blk(g, -7.2 + k * 1.2, -4.7, 0.5, 0.2, 6.5, 0.5, '#fff', { shadow: false, mat: GL(k < 9 ? '#ffd257' : '#59648a') });
  blk(g, 2.4, -4.5, 0.95, 0.3, 6.28, 0.95, '#fff', { shadow: false, mat: GL('#ffb070') }); blk(g, 7.2, -4.5, 0.8, 0.3, 6.35, 0.8, '#fff', { shadow: false, mat: GL('#dff1f7') });
  // the desk: three stations (sun, wind, battery) and the wheel of seasons
  blk(g, 0, -1.9, 16, 2.6, 0, 1.25, '#4a556e'); blk(g, 0, -1.9, 16.3, 2.9, 1.25, 0.16, '#fffaf0');
  const lamps = (x, n, c) => { for (let k = 0; k < 8; k++) blk(g, x - 1.05 + k * 0.3, -1.25, 0.22, 0.22, 1.41, 0.2, '#fff', { shadow: false, mat: GL(k < n ? c : '#8d95a8') }); };
  const station = (x, n, c, btn) => { blk(g, x, -2.75, 2.5, 0.3, 1.41, 1.25, '#1f2a44'); lamps(x, n, c); blk(g, x, -0.85, 0.75, 0.5, 1.41, 0.26, '#fff', { mat: GL(btn) }); blk(g, x, -0.85, 0.95, 0.7, 1.41, 0.08, '#1f2a44', { shadow: false }); };
  station(-5.9, 1, '#ffd257', '#7dffa8'); station(-2.7, 6, '#9fd0f5', '#7dffa8'); station(0.5, 5, '#7dffa8', '#e0503a');
  // small models on top of each screen: a solar panel, a wind turbine and a battery
  const sp = blk(g, -5.9, -2.75, 1.5, 0.9, 2.78, 0.08, PAL.solar); sp.rotation.x = 0.5; blk(g, -5.9, -2.85, 0.1, 0.1, 2.66, 0.2, '#c9d2da');
  blk(g, -2.7, -2.75, 0.12, 0.12, 2.66, 1.1, PAL.white); for (let k = 0; k < 3; k++) { const b = blk(g, -2.7, -2.66, 0.1, 0.05, 3.72, 0.62, PAL.white, { shadow: false }); b.position.y = 3.72; b.geometry; b.rotation.z = k * 2.094 + 0.3; b.translateY(0.31); }
  blk(g, 0.5, -2.75, 1.2, 0.5, 2.66, 0.62, PAL.white); blk(g, 1.2, -2.75, 0.14, 0.24, 2.84, 0.26, '#1f2a44'); blk(g, 0.25, -2.72, 0.6, 0.5, 2.7, 0.54, '#1c7a45', { shadow: false, mat: GL('#2aa35e') });
  // the battery as a tall glass tank of ten blocks, six of them full
  for (let k = 0; k < 10; k++) blk(g, 7.4, 1.2, 0.95, 0.95, 0.08 + k * 0.5, 0.42, '#fff', { shadow: false, mat: k < 6 ? GL('#2aa35e') : soft('#ffffff', 0.18) }); blk(g, 7.4, 1.2, 1.3, 1.3, 0, 0.08, '#1f2a44'); blk(g, 7.4, 1.2, 1.3, 1.3, 5.08, 0.14, '#1f2a44');
  // the wheel of seasons: four big keys, with winter pressed and lit
  const SEA = [['#7cc04a', -0.55, -0.55], ['#ffd257', 0.55, -0.55], ['#e08a3a', -0.55, 0.55], ['#dff1f7', 0.55, 0.55]]; SEA.forEach(([c, a, b], k) => blk(g, 4.9 + a, -1.75 + b, 0.95, 0.95, 1.41, k === 3 ? 0.12 : 0.34, '#fff', { mat: GL(c) })); blk(g, 4.9, -1.75, 2.4, 2.4, 1.41, 0.06, '#1f2a44', { shadow: false });
  // the child's own figure at the desk, seen from behind
  who(g, -1.1, 0.9, '#e0503a', 0, 2.1); blk(g, 3.4, 1.6, 1.1, 1.1, 0, 0.9, '#4a556e');
  return { n0: [-5.9, 2.05, -2.58], n1: [-2.7, 2.05, -2.58], n2: [0.5, 2.05, -2.58], l0: [-5.9, 1.2, -0.3], l1: [-2.7, 1.2, -0.3], l2: [0.5, 1.2, -0.3], sea: [4.9, 1.2, -0.3], tank: [7.4, 5.75, 1.2], day: [2.4, 7.5, -4.5], btn: [0.5, 1.7, -0.85] };
}

function school3d(g) {
  blk(g, 0, 2, 44, 34, -0.4, 0.4, '#86c86b'); blk(g, 0, 7.2, 44, 2, 0, 0.03, PAL.sand, { shadow: false }); blk(g, -13.6, 3.6, 2, 5.4, 0, 0.03, PAL.sand, { shadow: false });
  const X0 = -7.5, Z0 = -3, Z1 = 2.4, P = 0.9, FL = 3.3;   // the school stands on a base, so the way in needs a ramp
  blk(g, 0, -0.3, 15.6, 5.8, 0, P, '#d9d2c2');
  blk(g, 0, Z0, 15.6, 0.3, P, FL * 2, '#fff4dc'); for (const x of [X0 - 0.05, -X0 + 0.05]) blk(g, x, -0.3, 0.3, 5.8, P, FL * 2, '#fbecd0'); blk(g, 0, -0.3, 15.6, 5.8, P + FL - 0.2, 0.2, '#e6dcc6');
  for (const x of [-2.5, 2.5]) blk(g, x, -0.9, 0.22, 4.2, P, FL * 2, '#f6e1bd');
  for (let f = 0; f < 2; f++) for (const x of [-5, 0, 5]) blk(g, x, Z0 + 0.18, 2.2, 0.08, P + f * FL + 1.2, 1.3, '#fff', { shadow: false, mat: GL('#bfe3f5') });
  // the roof of steps and the bell
  blk(g, 0, -0.3, 16.8, 6.8, P + FL * 2, 0.5, PAL.roof[0]); blk(g, 0, -0.3, 14.4, 5, P + FL * 2 + 0.5, 0.5, PAL.roof[2]); blk(g, 0, -0.3, 12, 3.2, P + FL * 2 + 1, 0.5, PAL.roof[0]); blk(g, 0, -0.3, 1.6, 1.6, P + FL * 2 + 1.5, 1.6, PAL.wall[0]); blk(g, 0, 0.55, 0.7, 0.2, P + FL * 2 + 1.9, 0.7, '#ffd257', { mat: GL('#ffd257') }); blk(g, 0, -0.3, 2, 2, P + FL * 2 + 3.1, 0.3, PAL.roof[0]);
  const desk = (x, z, y) => { blk(g, x, z, 1.1, 0.7, y + 0.55, 0.1, PAL.timber); blk(g, x - 0.4, z, 0.1, 0.5, y, 0.55, PAL.trunk); blk(g, x + 0.4, z, 0.1, 0.5, y, 0.55, PAL.trunk); };
  // upstairs left: a classroom. upstairs middle: the library
  const U = P + FL; blk(g, -5, Z0 + 0.2, 2.6, 0.08, U + 0.9, 0.5, PAL.solar, { shadow: false }); for (const [x, z] of [[-6.2, -0.8], [-4.4, -0.8], [-6.2, 0.9], [-4.4, 0.9]]) desk(x, z, U); who(g, -6.2, -0.1, '#2e9b5a', U, 1.15); who(g, -4.4, 1.6, '#ffd257', U, 1.15); who(g, -3.3, -2, '#8a5fc2', U, 1.5);
  for (let k = 0; k < 2; k++) { blk(g, 0, Z0 + 0.5, 4, 0.6, U + 0.1 + k * 1.1, 0.12, PAL.trunk); for (let b = 0; b < 12; b++) blk(g, -1.75 + b * 0.32, Z0 + 0.5, 0.24, 0.5, U + 0.22 + k * 1.1, 0.6 + (b % 3) * 0.1, CLR[(b + k) % 6]); } blk(g, 0.2, 0.6, 2.4, 1.8, U, 0.05, '#f08ab8', { shadow: false }); who(g, 0.4, 0.7, '#3f78b5', U + 0.05, 1.15);
  // downstairs left: the hall. downstairs middle: a classroom
  blk(g, -5.6, Z0 + 0.6, 1.4, 0.5, P, 1.6, '#3f78b5'); blk(g, -3.6, Z0 + 0.6, 1.4, 0.5, P, 1.6, '#e0503a'); who(g, -5, 0.8, '#f08ab8', P, 1.15);
  blk(g, 0, Z0 + 0.2, 2.6, 0.08, P + 0.9, 0.5, PAL.solar, { shadow: false }); for (const [x, z] of [[-1, -0.6], [1, -0.6], [0, 1.1]]) desk(x, z, P); who(g, -1, 0.1, '#e0503a', P, 1.15); who(g, 1.5, -1.8, '#2e9b5a', P, 1.5);
  // the places: yellow for the ramp that is chosen, white for the lift, the quiet room, the wide door and the playground
  for (let k = 0; k < 6; k++) ghost(g, X0 - 0.6 - k * 0.9, 1.2, 0.9, 1.8, 0, P * (1 - k / 6));
  ghost(g, 5, 0.6, 2.2, 2.2, P, FL * 2 - 0.3, false); ghost(g, 5.1, -1.6, 4.4, 1.9, U, 2.4, false); ghost(g, X0, 1.2, 0.5, 1.9, P, 2.4, false); ghost(g, 13.5, 2.2, 6, 5, 0, 0.5, false);
  // the ramp being carried by the mouse
  const rp = group(g, -5.4, 2.4, 6.4); for (let k = 0; k < 6; k++) blk(rp, 2.25 - k * 0.9, 0, 0.9, 1.8, 0, P * (1 - k / 6) + 0.06, '#bdbcb6');
  // children arriving, and trees
  wheelchair(g, -13.6, 2.4, 0, '#3f78b5'); who(g, -12.4, 6.8, '#e0503a', 0, 1.2); who(g, -8, 7.3, '#ffd257', 0, 1.2); who(g, 2, 7.1, '#8a5fc2', 0, 1.2); who(g, 6.5, 7.4, '#2e9b5a', 0, 1.2);
  for (const [x, z] of [[-17, -3], [-15.5, 9], [11, -5], [18, 6.5], [16.5, -6], [-10.5, -6]]) V.tree(g, x, z, 2.1, 0);
  return { ramp: [-5.4, 3.1, 6.4], yes: [-10.2, 0.9, 1.2] };
}
const CLR = TW.CLOTHES;

// ---- the scenes -------------------------------------------------------------------------------------------------------
// li and phase choose the state of the town, cam is [x, y, z, distance, tilt, turn], build() adds blocks to the town and
// returns points to project, html(p) returns the interface. A scene with room() is drawn in a room of its own.
const S = TW.SPOTS, MAPVIEW = [4.6, 0, -0.2, 58, 1.5, 0], hAt = (x, z) => TW.heightAt(x, z);
const LOW = [[1.4, -8.6], [1.4, -5.6], [-6.4, -6.2], [-5.6, -9]];
const road = (cells, m) => { for (const [x, z] of cells) { const y = hAt(x + 0.5, z + 0.5); if (m) cell(x, z, y, m); else blk(G, x + 0.5, z + 0.5, 1, 1, y, 0.08, PAL.sand, { shadow: false }); } };
const run = (x0, z0, x1, z1) => { const o = []; for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) o.push([x, z]); return o; };
export const SCENES = [
  { id: 'land-map', li: 0, cam: MAPVIEW, build() { home(S[0][0], S[0][1]); home(S[1][0], S[1][1]); home(S[4][0], S[4][1]); home(LOW[0][0], LOW[0][1], 1, 0); home(LOW[2][0], LOW[2][1], 1, 0);
      for (const k of [2, 3, 5]) plot(S[k][0], S[k][1]); plot(LOW[1][0], LOW[1][1], 0); plot(LOW[3][0], LOW[3][1], 0); plot(-7.2, 2.4, 0); plot(1.6, 6.2, 0);
      plot(8.6, 0.4, TOP, WHITE_SOFT); plot(1.4, -1.6, 0, WHITE_SOFT); plot(-6.6, -2.6, 0, WHITE_SOFT);
      return { a: [S[3][0], TOP + 1, S[3][1]] }; },
    html: (p) => top('Land', 'Build your plan', count(I.home(), '5 of 12')) + drag(p.a[0] - 16, p.a[1] - 30, I.roofTop().replace('width="96" height="96"', 'width="64" height="64"')) + mouse(p.a[0] - 6, p.a[1] - 18) + florence + hint('Choose a part. Drag it to a yellow place.')
      + pal('Parts', tok(I.home(), 'Home', 'on', '7 left') + tok(I.shop(), 'Shop', '', '2 left') + tok(I.tree(), 'Park', '', '3 left')) },

  { id: 'paths-map', li: 1, cam: MAPVIEW, build() { home(S[4][0], S[4][1]); home(S[5][0], S[5][1], -1); for (const [x, z] of LOW) home(x, z, 1, 0); home(-7.2, 2.4, 1, 0); kit.stall(TW.STALL[0], TOP, TW.STALL[1]);
      road([...run(5, 0, 11, 0), ...run(6, -1, 6, -1), ...run(11, -1, 11, -1), ...run(8, 1, 8, 1), ...run(2, 0, 4, 0), ...run(2, -4, 2, -1)]);
      road([...run(2, -7, 2, -5), ...run(6, 1, 6, 2), ...run(11, 1, 11, 2), ...run(-5, -5, 1, -5), ...run(-6, -4, -6, 1)], SUN_SOFT);
      return { a: [2.5, 0.1, -4.4] }; },
    html: (p) => top('Getting around', 'Build your plan', count(I.path(), '5 of 11')) + mouse(p.a[0] - 4, p.a[1] - 4) + florence + hint('Hold the mouse button and draw a path to every home.')
      + pal('Parts', tok(I.path(), 'Path', 'on') + tok(I.wide().replace('#7a5a33', '#c9925a').replace('#7a5a33', '#c9925a'), 'Bridge', '', '1 left') + tok(I.bench(), 'Bench', '', '4 left') + tok(I.lamp(), 'Lamp', '', '6 left')) },

  { id: 'paths-walk', li: 2, cam: [9.5, TOP + 1.25, 0.5, 7.5, 0.17, 0], build() { who(G, 9.5, 0.9, '#e0503a', TOP + 0.08, 1.3, null, 0); who(G, 9.2, -2.6, '#3f78b5', TOP + 0.08, 1.2); who(G, 9.9, -4.4, '#ffd257', TOP + 0.08, 1.2); return { me: [9.5, TOP + 1.75, 0.9] }; },
    html: (p) => top('Getting around', 'Walk your path') + `<i class="plate on" style="left:${p.me[0]}px;top:${p.me[1] - 22}px">You</i>` + florence + `<div class="keys"><i class="key">&larr;</i><i class="key">&uarr;</i><i class="key">&rarr;</i></div>` },

  { id: 'factory', li: 2, cam: [-0.2, 2.0, 0.6, 37, 0.46, 0.42], room: factory3d,
    html: (p) => top('Homes', 'Build your plan', count(I.home('#c8643f', '#c9925a'), '1 of 6')) + mouse(p.hook[0] + 6, p.hook[1] + 4) + florence + hint('Drag each part to its yellow place.')
      + pal('Home parts', tok(I.base(), 'Foundation', 'used', 'Placed') + tok(I.wall(), 'Wall', 'on', '2 left') + tok(I.roof(), 'Roof', '', '1 left') + tok(I.door(), 'Door', '', '1 left')) },

  { id: 'farm', flat: true, li: 3, cam: MAPVIEW, build() { return {}; },
    html: () => farm() + top('Food', 'Pick the food', count(I.lettuce(), '7 of 16')) + `<div class="keys"><i class="key">&larr;</i><i class="key">&rarr;</i><i class="key">&uarr;</i><i class="key wide">Space to jump</i></div>` },

  { id: 'control', li: 4, time: (m) => m.after0 + 1.1, view: [8, 2, 1.4, 36, 0.62, TW.YAW], cam: [0.6, 3.0, -1.6, 25, 0.33, 0.08], room: control3d, night: 0.55,
    html: (p) => top('Power', 'Keep the lights on') + florence + mouse(p.btn[0], p.btn[1] - 6)
      + `<b class="led y" style="left:${p.n0[0]}px;top:${p.n0[1]}px">1</b><b class="led b" style="left:${p.n1[0]}px;top:${p.n1[1]}px">6</b><b class="led" style="left:${p.n2[0]}px;top:${p.n2[1]}px">5</b>`
      + `<i class="plate" style="left:${p.l0[0]}px;top:${p.l0[1]}px">Solar</i><i class="plate" style="left:${p.l1[0]}px;top:${p.l1[1]}px">Wind</i><i class="plate on" style="left:${p.l2[0]}px;top:${p.l2[1]}px">Battery</i><i class="plate on" style="left:${p.sea[0]}px;top:${p.sea[1]}px">Winter</i><i class="plate" style="left:${p.tank[0]}px;top:${p.tank[1]}px">6 of 10</i><i class="plate" style="left:${p.day[0] + 190}px;top:${p.day[1] + 44}px">Evening</i>` },

  { id: 'school', li: 5, cam: [-3.2, 3.0, 1.6, 36, 0.4, 0.5], room: school3d,
    html: (p) => top('A school for everyone', 'Build your plan', count(I.ramp(), '1 of 6')) + mouse(p.ramp[0] + 4, p.ramp[1] + 6) + florence + hint('Choose a part. Its places turn yellow.')
      + pal('Parts', tok(I.books(), 'Library', 'used', 'Placed') + tok(I.ramp(), 'Ramp', 'on', '1 left') + tok(I.lift(), 'Lift', '', '1 left') + tok(I.wide(), 'Wide door', '', '1 left') + tok(I.quiet(), 'Quiet room', '', '1 left') + tok(I.swing(), 'Playground', '', '1 left')) },
];

let ui = null;
export function show(i) {
  const s = SCENES[i], m = film.segs[s.li + 1], st = film.dbg; film.seek(m.start + (s.time ? s.time(m) : s.phase === 'after' ? m.inter[0] + 0.2 : m.askTap - 0.5));
  G.clear(); let pts = {}, scene = MAP.scene;
  if (s.room) { let view = null;
    if (s.view) { st.camera.clearViewOffset(); st.look(...s.view); st.camera.updateMatrixWorld(); st.draw(MAP.scene); const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(st.renderer.domElement, 0, 0, W, H); view = new THREE.CanvasTexture(c); view.colorSpace = THREE.SRGBColorSpace; }
    const n = st.newScene(26); n.light(s.night || 0); scene = n.scene; pts = s.room(group(scene), view) || {}; }
  else pts = s.build() || {};
  st.camera.setViewOffset(W, H, 0, s.off ?? 0, W, H); st.look(...s.cam); st.camera.updateMatrixWorld(); st.draw(scene);
  const p = Object.fromEntries(Object.entries(pts).map(([k, v]) => [k, st.screen(new THREE.Vector3(...v))]));
  if (!ui) { const stage = document.querySelector('.stage'); document.head.insertAdjacentHTML('beforeend', `<style>${css} .stage > .ui:not(.cx), .stage > canvas.fx { visibility: hidden; }</style>`); ui = document.createElement('div'); ui.className = 'ui cx'; ui.style.setProperty('--ui-florence-sprite', `url(${new URL('../animation/florence-sprite.webp', import.meta.url)})`); stage.append(ui); }
  ui.innerHTML = s.html(p); return s.id;
}
