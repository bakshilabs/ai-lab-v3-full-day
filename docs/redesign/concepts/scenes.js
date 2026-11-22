// Concept screens for the play breaks in Eco Town (owner, 22 Nov 2026): once or twice in each level the child leaves the
// usual high camera and builds or collects something in a different view. The game is played with a mouse.
// Each scene takes the film's real town at one moment (or hides it behind a flat drawing) and lays a sketch of the
// interface on top. These are proposals only. The few words on them are placeholders, not final wording.
import * as V from '../animation/vox.js'; import * as MAP from '../animation/map.js'; import * as TW from '../animation/town.js';
const { THREE, PAL, blk, group } = V, TOP = TW.TOP, W = 1280, H = 720;
const G = group(MAP.world), kit = TW.makeKit(G);
const soft = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o }), SUN = new THREE.MeshBasicMaterial({ color: '#ffd257' }), SUN_SOFT = soft('#ffd257', 0.85), WHITE_SOFT = soft('#ffffff', 0.55);
const cell = (x, z, y, m = SUN_SOFT, s = 0.9) => blk(G, x + 0.5, z + 0.5, s, s, y + 0.02, 0.05, '#ffd257', { shadow: false, mat: m });
const plot = (x, z, m = SUN_SOFT) => { for (let a = -1; a <= 0; a++) for (let b = -1; b <= 0; b++) cell(Math.floor(x) + a, Math.floor(z) + b, TOP, m, 1.02); };
const home = (x, z, face = 1, roof = PAL.roof[0]) => kit.home(x, z, TOP, PAL.wall[0], face, roof);

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

// ---- the flat drawings ------------------------------------------------------------------------------------------------
function factory() {
  let s = r(0, 0, 1280, 720, '#efe6d2') + r(0, 560, 1280, 160, '#c9c2b4') + r(0, 560, 1280, 8, '#a9a294');
  for (let k = 0; k < 4; k++) s += r(330 + k * 150, 96, 120, 100, '#bfe3f5') + r(330 + k * 150, 96, 120, 8, '#fff') + r(386 + k * 150, 96, 8, 100, '#efe6d2');
  for (let k = 0; k < 9; k++) s += r(k * 160 - 20, 0, 14, 62, '#2b3a55'); s += r(0, 56, 1280, 16, '#2b3a55');
  // the crane and the wall panel it carries
  s += r(858, 48, 90, 30, '#ffd257', 5) + r(900, 78, 6, 150, '#1f2a44') + r(884, 224, 38, 12, '#1f2a44');
  s += r(804, 236, 196, 150, '#c9925a', 8) + r(804, 286, 196, 8, '#a9743f') + r(804, 336, 196, 8, '#a9743f') + r(858, 262, 84, 60, '#9fd0f5') + r(858, 262, 84, 6, '#fff');
  // the building bay: a foundation, one wall in place, and dashed places for the rest
  s += r(310, 532, 520, 28, '#8d8378', 6) + r(350, 500, 440, 32, '#bdbcb6', 6);
  s += r(370, 350, 200, 150, '#c9925a', 6) + r(370, 400, 200, 8, '#a9743f') + r(370, 450, 200, 8, '#a9743f') + r(430, 412, 60, 88, '#7a5a33') + r(476, 452, 8, 8, '#ffd257');
  s += d(570, 350, 200, 150) + d(350, 300, 440, 50, false) + d(400, 254, 340, 46, false) + d(460, 212, 220, 42, false);
  // the diagram on the wall
  s += r(40, 120, 250, 300, '#2b3a55', 8) + `<g fill="none" stroke="#dff1f7" stroke-width="4"><rect x="80" y="330" width="170" height="20"/><rect x="90" y="250" width="75" height="80"/><rect x="165" y="250" width="75" height="80"/><path d="M76 250h178v-22H76zM100 228h130v-22H100zM124 206h82v-20h-82z"/></g>`;
  for (const [n, x, y] of [[1, 62, 340], [2, 128, 290], [3, 202, 290], [4, 165, 174]]) s += `<circle cx="${x}" cy="${y}" r="15" fill="${n === 3 ? '#ffd257' : '#dff1f7'}"/><text x="${x}" y="${y + 7}" text-anchor="middle" font="800 20px Bricolage" style="font:800 20px Bricolage,Inter" fill="#1f2a44">${n}</text>`;
  // finished kits waiting on the floor
  for (let k = 0; k < 3; k++) s += r(170 + k * 42, 480, 34, 80, '#c9925a', 5) + r(170 + k * 42, 506, 34, 6, '#a9743f');
  s += r(40, 520, 110, 40, '#bdbcb6', 5) + r(52, 496, 86, 24, '#bdbcb6');
  return `<svg class="art" viewBox="0 0 1280 720">${s}</svg>`;
}
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
function school() {
  let s = r(0, 0, 1280, 720, '#dff1f7') + r(0, 560, 1280, 160, '#86c86b') + r(0, 560, 1280, 10, '#6fb257') + r(0, 600, 1280, 30, '#ecd29a');
  // the school cut open: two floors of three rooms, a roof of steps, and a bell
  s += r(250, 196, 740, 372, '#2b3a55') + r(230, 150, 780, 46, '#c8643f', 6) + r(290, 108, 660, 42, '#c8643f') + r(350, 70, 540, 38, '#d0774a') + r(585, 14, 70, 56, '#fff4dc') + r(605, 30, 30, 28, '#ffd257');
  const room = (c, f, col) => r(262 + c * 242, 208 + f * 180, 230, 168, col);
  s += room(0, 0, '#fff4dc') + room(1, 0, '#fbecd0') + room(0, 1, '#fbecd0') + room(1, 1, '#fff4dc');
  // a classroom with desks, a library, a hall, and another classroom
  s += r(282, 228, 120, 60, '#2f4f8f') + r(292, 330, 44, 12, '#c9925a') + r(310, 342, 8, 34, '#7a5a33') + r(366, 330, 44, 12, '#c9925a') + r(384, 342, 8, 34, '#7a5a33') + kid(440, 376, '#2e9b5a');
  for (let k = 0; k < 2; k++) { s += r(524, 236 + k * 62, 190, 8, '#7a5a33'); for (let b = 0; b < 9; b++) s += r(530 + b * 20, 208 + k * 62 + (b % 3) * 3, 14, 28 - (b % 3) * 3, ['#e0503a', '#3f78b5', '#ffd257', '#2e9b5a', '#8a5fc2'][(b + k) % 5]); } s += kid(660, 376, '#f08ab8');
  s += r(524, 408, 110, 70, '#9fd0f5') + r(540, 520, 60, 12, '#c9925a') + kid(690, 556, '#3f78b5');
  s += r(282, 420, 90, 50, '#2f4f8f');
  // the places for the part that is chosen (a ramp at each way in), and the places for the other parts
  s += `<path d="M112 568 L262 568 L262 500 Z" fill="#ffd257" fill-opacity=".55" stroke="#1f2a44" stroke-width="4" stroke-dasharray="14 10"/>`;
  s += d(746, 208, 232, 168, false) + d(746, 388, 232, 168, false) + d(262, 478, 70, 78, false) + d(1000, 480, 66, 80, false);
  // children arriving, one in a wheelchair, and a tree
  s += kid(60, 600, '#e0503a') + kid(1080, 604, '#8a5fc2') + kid(1180, 600, '#ffd257');
  s += r(150, 566, 26, 22, '#3f78b5') + r(154, 550, 18, 16, '#f1c9a0') + `<circle cx="160" cy="596" r="14" fill="none" stroke="#1f2a44" stroke-width="5"/>` + r(176, 588, 14, 5, '#1f2a44');
  s += r(1206, 470, 12, 90, '#7a5a33') + r(1170, 400, 84, 70, '#5fa35a', 5) + r(1186, 366, 52, 36, '#74b56a');
  return `<svg class="art" viewBox="0 0 1280 720">${s}</svg>`;
}
const chart = () => { const sun = 'M0 96 L40 96 C70 96 90 30 150 30 C210 30 230 96 260 96 L400 96 Z', wind = 'M0 70 C60 50 110 84 170 70 C230 54 300 30 400 44'; return `<svg viewBox="0 0 400 118" style="width:100%;height:118px"><rect width="400" height="100" fill="#efe6d2"/><rect x="290" width="110" height="100" fill="#2b3a55" opacity=".25"/><path d="${sun}" fill="#ffd257" stroke="#1f2a44" stroke-width="2.5"/><path d="${wind}" fill="none" stroke="#3f78b5" stroke-width="5"/><rect x="262" y="60" width="130" height="36" fill="#1c7a45" opacity=".8"/><rect x="298" y="0" width="5" height="100" fill="#b3243a"/><g style="font:700 13px Inter" fill="#1f2a44"><text x="4" y="114">Morning</text><text x="150" y="114" text-anchor="middle">Midday</text><text x="300" y="114" text-anchor="middle">Evening</text><text x="396" y="114" text-anchor="end">Night</text></g></svg>`; };
const src = (icon, name, pct, col, on) => `<div class="src">${icon}<b>${name}</b><div class="bar"><i style="width:${pct}%;background:${col}"></i></div><i class="sw${on ? ' on' : ''}"></i></div>`;

// ---- the scenes -------------------------------------------------------------------------------------------------------
// li and phase choose the state of the town, cam is [x, y, z, distance, tilt, turn], build() adds blocks and returns points
// to project, html(p) returns the interface. A scene with flat: true hides the town behind its drawing.
const S = TW.SPOTS, ABOVE = [8.4, 2, 0.2, 33, 1.5, TW.YAW];
export const SCENES = [
  { id: 'land-map', li: 0, cam: [7.6, 2, 0.4, 37, 1.5, TW.YAW], build() { home(S[0][0], S[0][1]); home(S[1][0], S[1][1]); plot(S[2][0], S[2][1]); plot(S[3][0], S[3][1]);
      for (const [x, z] of [[8, -1], [9, 1], [7, 1]]) cell(x, z, TOP, WHITE_SOFT, 0.7);
      return { a: [S[2][0], TOP + 1, S[2][1]] }; },
    html: (p) => top('Land', 'Build your plan', count(I.home(), '2 of 4')) + drag(p.a[0] - 20, p.a[1] - 46, I.roofTop()) + mouse(p.a[0] - 6, p.a[1] - 30) + florence + hint('Drag each part to a yellow place.')
      + pal('Parts', tok(I.home(), 'Home', 'on', '2 left') + tok(I.tree(), 'Tree', '', '3 left') + tok(I.shop(), 'Shop', '', '1 left')) },

  { id: 'paths-map', li: 1, cam: ABOVE, build() { const done = [[6, -1], [6, 0], [7, 0], [8, 0], [9, 0]]; for (const [x, z] of done) blk(G, x + 0.5, z + 0.5, 1, 1, TOP, 0.07, PAL.sand, { shadow: false });
      for (const [x, z] of [[10, 0], [11, 0], [11, -1], [6, 1], [6, 2], [11, 1], [11, 2]]) cell(x, z, TOP);
      return { a: [10.5, TOP, 0.5] }; },
    html: (p) => top('Getting around', 'Build your plan', count(I.path(), '1 of 4')) + mouse(p.a[0] - 4, p.a[1] - 4) + florence + hint('Hold the mouse button and draw the path.')
      + pal('Parts', tok(I.path(), 'Path', 'on') + tok(I.bench(), 'Bench', '', '2 left') + tok(I.lamp(), 'Lamp', '', '4 left')) },

  { id: 'paths-walk', li: 2, cam: [8.6, 2.5, 0.4, 13, 0.2, -0.35], build() { return {}; },
    html: () => top('Getting around', 'Walk your path') + florence + `<div class="keys"><i class="key">&larr;</i><i class="key">&rarr;</i></div>` },

  { id: 'factory', flat: true, li: 2, cam: ABOVE, build() { return {}; },
    html: () => factory() + top('Homes', 'Build your plan', count(I.home('#c8643f', '#c9925a'), '1 of 6')) + mouse(900, 316) + florence + hint('Drag each part to its place on the diagram.')
      + pal('Home parts', tok(I.base(), 'Foundation', 'used', 'Placed') + tok(I.wall(), 'Wall', 'on', '1 left') + tok(I.roof(), 'Roof', '', '1 left') + tok(I.door(), 'Door', 'used', 'Placed')) },

  { id: 'farm', flat: true, li: 3, cam: ABOVE, build() { return {}; },
    html: () => farm() + top('Food', 'Pick the food', count(I.lettuce(), '7 of 16')) + `<div class="keys"><i class="key">&larr;</i><i class="key">&rarr;</i><i class="key">&uarr;</i><i class="key wide">Space to jump</i></div>` },

  { id: 'control', li: 4, time: (m) => m.after0 + 0.75, cam: [7.5, 2, 0.5, 44, 0.42, TW.YAW], off: -150, build() { return {}; },
    html: () => `<div class="frame"><i style="left:33%"></i><i style="left:66%"></i></div>` + top('Power', 'Keep the lights on') + florence + mouse(336, 598)
      + `<div class="desk"><div class="card"><h3>Power coming in</h3>${src(I.sun(), 'Solar', 8, '#ffd257', true)}${src(I.wind(), 'Wind', 64, '#3f78b5', true)}${src(I.batt(), 'Battery', 42, '#1c7a45', false)}<div class="src" style="grid-template-columns:1fr auto"><b>Stored in the battery</b><b>62%</b></div></div>
      <div class="card"><h3>Today</h3>${chart()}</div>
      <div class="card"><h3>Season</h3><div class="seasons"><i class="sea">Spring</i><i class="sea">Summer</i><i class="sea">Autumn</i><i class="sea on">Winter</i></div></div></div>` },

  { id: 'school', flat: true, li: 5, cam: ABOVE, build() { return {}; },
    html: () => school() + top('A school for everyone', 'Build your plan', count(I.ramp(), '1 of 6')) + drag(230, 440, `<svg viewBox="0 0 160 80" width="160" height="80"><path d="M4 76h152V8z" fill="#bdbcb6" stroke="#1f2a44" stroke-width="4" stroke-linejoin="round"/></svg>`) + mouse(244, 440) + florence + hint('Choose a part. Its places turn yellow.')
      + pal('Parts', tok(I.books(), 'Library', 'used', 'Placed') + tok(I.ramp(), 'Ramp', 'on', '1 left') + tok(I.lift(), 'Lift', '', '1 left') + tok(I.wide(), 'Wide door', '', '1 left') + tok(I.quiet(), 'Quiet room', '', '1 left') + tok(I.swing(), 'Playground', '', '1 left')) },
];

let ui = null;
export function show(i) {
  const s = SCENES[i], m = film.segs[s.li + 1]; film.seek(m.start + (s.time ? s.time(m) : s.phase === 'after' ? m.inter[0] + 0.2 : m.askTap - 0.5));
  G.clear(); const pts = s.build() || {};
  const st = film.dbg; st.camera.setViewOffset(W, H, 0, s.off ?? 0, W, H); st.look(...s.cam); st.camera.updateMatrixWorld(); st.draw(MAP.scene);
  const p = Object.fromEntries(Object.entries(pts).map(([k, v]) => [k, st.screen(new THREE.Vector3(...v))]));
  if (!ui) { const stage = document.querySelector('.stage'); document.head.insertAdjacentHTML('beforeend', `<style>${css} .stage > .ui:not(.cx), .stage > canvas.fx { visibility: hidden; }</style>`); ui = document.createElement('div'); ui.className = 'ui cx'; ui.style.setProperty('--ui-florence-sprite', `url(${new URL('../animation/florence-sprite.webp', import.meta.url)})`); stage.append(ui); }
  ui.innerHTML = s.html(p); return s.id;
}
