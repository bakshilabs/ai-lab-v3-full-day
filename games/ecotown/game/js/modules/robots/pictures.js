// Robot training: the pictures, as SVG text. Pure: no page, no 3D. Each thing is drawn so that its colour, shape,
// feel and condition (what the robot can tell) are plain to see.
import { kind } from './learn.js';

export const COLOURS = { white: '#f6f2e6', brown: '#a9743f', clear: '#d4edf6', green: '#4fae5a', yellow: '#f2c531', red: '#d9533d', orange: '#f08a2c', blue: '#4a86d9', silver: '#b9c2cb' };
const INK = '#3b2a1e'; const S = `stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
const thin = `stroke="${INK}" stroke-width="1.6" stroke-linecap="round" fill="none"`;
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return `#${[n >> 16, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join('')}`; };
const crack = (x, y) => `<path d="M${x} ${y}l5 6l-5 4l6 6l-4 5" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
const bottle = (c) => `<path d="M27 6h10v12c0 4 7 6 7 14v22c0 3-2 5-5 5H25c-3 0-5-2-5-5V32c0-8 7-10 7-14z" fill="${c}" ${S}/><rect x="26" y="4" width="12" height="6" rx="2" fill="${shade(c, 0.8)}" ${S}/><path d="M25 34v16" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
const jar = (c) => `<path d="M18 20c0-3 2-5 5-5h18c3 0 5 2 5 5v32c0 4-3 7-7 7H25c-4 0-7-3-7-7z" fill="${c}" ${S}/><rect x="19" y="8" width="26" height="9" rx="3" fill="${shade(c, 0.78)}" ${S}/><path d="M24 26v20" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
const paper = (c, extra) => `<g transform="rotate(-6 32 32)"><rect x="13" y="10" width="38" height="44" rx="2" fill="${c}" ${S}/>${extra}</g>`;

const DRAW = {
  newspaper: (c) => paper(c, `<rect x="18" y="15" width="28" height="6" fill="${INK}"/><path d="M18 27h12M18 32h12M18 37h12M18 42h12M18 47h28M35 27h11v11H35z" ${thin}/>`),
  comic: (c) => paper(c, `<rect x="18" y="15" width="28" height="7" rx="1" fill="#f2c531" ${S}/><path d="M32 27l3 6l7 1l-5 5l1 7l-6-3l-6 3l1-7l-5-5l7-1z" fill="#fff" ${S}/>`),
  tornbook: (c) => `<g transform="rotate(-6 32 32)"><path d="M13 10h38v30l-6 4l3 5l-7 5H13z" fill="${c}" ${S}/><rect x="13" y="10" width="7" height="44" fill="${shade(c, 0.7)}" ${S}/><path d="M26 20h18M26 26h12" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M41 54l7-5l-3-5l6-4v10z" fill="#f6f2e6" ${S}/></g>${crack(33, 30)}`,
  cardbox: (c) => `<path d="M10 26l22-8l22 8v24l-22 8l-22-8z" fill="${c}" ${S}/><path d="M10 26l22 8l22-8M32 34v24" ${thin}/><path d="M10 26l-5-8l22-7l5 7M54 26l5-8l-22-7l-5 7" fill="${shade(c, 1.18)}" ${S}/><path d="M27 31l10 3" stroke="#f6f2e6" stroke-width="3"/>`,
  pizzabox: (c) => `<path d="M6 34l26-9l26 9v12l-26 9l-26-9z" fill="${c}" ${S}/><path d="M6 34l26 9l26-9M32 43v12" ${thin}/><path d="M6 34l8-20l26-7l18 27l-26 9z" fill="${shade(c, 1.15)}" ${S}/><circle cx="30" cy="24" r="7" fill="#d9533d" ${S}/><ellipse cx="18" cy="33" rx="5" ry="3" fill="#6b4420" opacity=".75"/><ellipse cx="44" cy="30" rx="4" ry="2.5" fill="#6b4420" opacity=".75"/><ellipse cx="22" cy="46" rx="5" ry="2.5" fill="#6b4420" opacity=".75"/><ellipse cx="45" cy="46" rx="4" ry="2" fill="#6b4420" opacity=".75"/>`,
  paperbag: (c) => `<path d="M16 20l4-4l4 4l4-4l4 4l4-4l4 4l4-4l4 4v36a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z" fill="${c}" ${S}/><path d="M24 20v39M24 34l-8 6" ${thin}/><path d="M27 18c0-9 14-9 14 0" ${thin}/>`,
  paperball: (c) => `<path d="M20 14l12-6l12 5l8 12l-2 16l-11 11l-15 2l-12-9l-4-15z" fill="${c}" ${S}/><path d="M20 14l8 12l16-13M28 26l-4 14l-16-10M24 40l15 2l11-1M39 42l5-15l8-2M39 42l0 10" ${thin}/>`,
  clearjar: (c) => jar(c), bluejar: (c) => jar(c),
  clearbottle: (c) => bottle(c), greenbottle: (c) => bottle(c), brownbottle: (c) => bottle(c),
  banana: (c) => `<path d="M30 8h5l1 10c10 6 16 18 18 34l-8 2c-3-10-7-18-12-24c-1 10-4 20-10 28l-7-4c5-10 6-20 4-30c-4 6-6 14-6 24l-8-1c0-16 8-28 22-30z" fill="${c}" ${S}/><path d="M33 20c-1 4 0 7 1 10M27 22c0-2 2-3 4-4" ${thin}/><rect x="29" y="5" width="7" height="6" rx="1.5" fill="#6b4420" ${S}/>`,
  lettuce: (c) => `<path d="M32 58c-6-4-20-8-22-22c-1-6 3-8 2-13c5 1 6-5 11-6c2-5 7-3 9-9c2 6 7 4 9 9c5 1 6 7 11 6c-1 5 3 7 2 13c-2 14-16 18-22 22z" fill="${c}" ${S}/><path d="M32 56V20M32 44l-12-10M32 44l12-10M32 32l-8-7M32 32l8-7" stroke="${shade(c, 0.62)}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`,
  applecore: (c) => `<path d="M18 12c8-5 20-5 28 0c0 6-4 9-8 11v18c4 2 8 5 8 11c-8 5-20 5-28 0c0-6 4-9 8-11V23c-4-2-8-5-8-11z" fill="#f6ecc6" ${S}/><path d="M18 12c8-5 20-5 28 0c0 4-2 7-5 9H23c-3-2-5-5-5-9zM18 52c8 5 20 5 28 0c0-4-2-7-5-9H23c-3 2-5 5-5 9z" fill="${c}" ${S}/><path d="M32 9c0-3 1-5 4-6" ${thin}/><ellipse cx="30" cy="31" rx="1.6" ry="2.6" fill="${INK}"/><ellipse cx="35" cy="34" rx="1.6" ry="2.6" fill="${INK}"/>`,
  orangepeel: (c) => `<path d="M10 22c10-12 34-12 44 0c2 12-4 26-14 32c-2-8 2-12 4-18c-6 4-18 4-24 0c2 6 6 10 4 18C14 48 8 34 10 22z" fill="${c}" ${S}/><path d="M16 26c8-7 24-7 32 0" stroke="#fde3c0" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="24" cy="20" r="1.2" fill="${shade(c, 0.7)}"/><circle cx="34" cy="18" r="1.2" fill="${shade(c, 0.7)}"/><circle cx="42" cy="22" r="1.2" fill="${shade(c, 0.7)}"/>`,
  eggshell: (c) => `<path d="M8 40l5-6l5 5l5-6l5 6l4-4c0 12-5 20-13 20S8 50 8 40z" fill="${c}" ${S}/><path d="M34 30l4-7l5 5l4-7l5 6l4-5c2 12-2 22-10 24s-12-6-12-16z" fill="${c}" ${S} transform="rotate(14 45 36)"/><path d="M24 12l4 5l-5 3" ${thin}/>`,
  teabag: (c) => `<path d="M32 6v14" ${thin}/><rect x="25" y="2" width="14" height="9" rx="2" fill="#f6f2e6" ${S}/><path d="M18 26l6-6h16l6 6v28a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3z" fill="${c}" ${S}/><path d="M22 30h20M24 38c5 4 11 4 16 0" stroke="${shade(c, 0.62)}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`,
  toaster: (c) => `<rect x="8" y="22" width="48" height="30" rx="7" fill="${c}" ${S}/><path d="M16 22v-5h13v5M35 22v-5h13v5" fill="${shade(c, 0.6)}" ${S}/><rect x="50" y="30" width="9" height="6" rx="2" fill="${INK}"/><path d="M12 52v5M52 52v5" ${S}/><circle cx="18" cy="44" r="3" fill="#d9533d" ${S}/>${crack(30, 26)}<path d="M40 14c3-3-3-5 0-8" ${thin}/>`,
  teddy: (c) => `<circle cx="20" cy="14" r="6" fill="${c}" ${S}/><path d="M40 10l5-3l3 5l5 1l-3 6" fill="${c}" ${S}/><ellipse cx="32" cy="44" rx="14" ry="15" fill="${c}" ${S}/><circle cx="32" cy="22" r="13" fill="${c}" ${S}/><ellipse cx="32" cy="27" rx="6" ry="4.5" fill="#f1d9b0" ${S}/><circle cx="27" cy="19" r="1.8" fill="${INK}"/><path d="M35 17l4 4M39 17l-4 4" ${thin}/><path d="M28 40l8 8M36 40l-8 8M26 44h12" stroke="#f6f2e6" stroke-width="2" stroke-linecap="round"/><path d="M19 38l-9 4M45 38l9 4M24 57l-3 4M40 57l3 4" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
  radio: (c) => `<path d="M40 22l10-16" ${S}/><path d="M50 6l5 6" ${S}/><rect x="6" y="22" width="52" height="32" rx="6" fill="${c}" ${S}/><circle cx="22" cy="38" r="10" fill="#f6f2e6" ${S}/><path d="M16 38h12M22 32v12M18 34l8 8M26 34l-8 8" ${thin}/><circle cx="46" cy="32" r="4" fill="#f2c531" ${S}/><path d="M40 44h12M40 48h12" ${thin}/>${crack(34, 24)}`,
  lamp: (c) => `<path d="M22 8h20l8 22H14z" fill="${c}" ${S}/><path d="M32 30l-4 12l8 4l-4 10" ${S} fill="none"/><ellipse cx="32" cy="57" rx="14" ry="4" fill="${shade(c, 0.6)}" ${S}/>${crack(28, 9)}<path d="M46 36l4 4M52 34l2 5" ${thin}/>`,
};
// One thing, as an SVG of the given size (px). title: its name, for a screen reader (omit inside a named button).
export function itemSvg(id, size = 64, title = false) {
  const k = kind(id); const body = k && DRAW[id] ? DRAW[id](COLOURS[k.f.colour] || '#ccc') : '<circle cx="32" cy="32" r="20" fill="#ccc"/>';
  return `<svg class="rb-pic" viewBox="0 0 64 64" width="${size}" height="${size}" ${title && k ? `role="img" aria-label="${k.name}"` : 'aria-hidden="true"'}>${body}</svg>`;
}
// A bin, drawn in its own colour with a lid.
export function binSvg(colour, size = 56) {
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><path d="M12 20h40l-4 38a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z" fill="${colour}" ${S}/><rect x="8" y="12" width="48" height="9" rx="3" fill="${shade(colour, 0.75)}" ${S}/><rect x="26" y="6" width="12" height="7" rx="2" fill="${shade(colour, 0.75)}" ${S}/><path d="M24 30v20M32 30v20M40 30v20" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/></svg>`;
}
// The robot on the bench. mood: 'idle' | 'look' | 'ok' | 'ask'
export function robotSvg(mood = 'idle', size = 150) {
  const eye = mood === 'ask' ? '#f4b73b' : mood === 'ok' ? '#7be0a3' : '#8fd8ff';
  const mouth = mood === 'ok' ? '<path d="M50 49c6 5 14 5 20 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' : mood === 'ask' ? '<circle cx="60" cy="50" r="3" fill="#fff"/>' : '<path d="M52 50h16" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
  return `<svg class="rb-robot" viewBox="0 0 120 150" width="${size * 0.8}" height="${size}" aria-hidden="true">
<path d="M60 14V6" ${S}/><circle cx="60" cy="6" r="5" fill="${mood === 'ask' ? '#f4b73b' : '#f08a2c'}" ${S}/>
<rect x="28" y="14" width="64" height="48" rx="12" fill="#16c79a" ${S}/><rect x="36" y="22" width="48" height="33" rx="8" fill="#243447" ${S}/>
<circle cx="50" cy="35" r="6.5" fill="${eye}"/><circle cx="70" cy="35" r="6.5" fill="${eye}"/><circle cx="52" cy="33" r="2" fill="#fff"/><circle cx="72" cy="33" r="2" fill="#fff"/>${mouth}
<rect x="20" y="30" width="8" height="16" rx="3" fill="#b9c2cb" ${S}/><rect x="92" y="30" width="8" height="16" rx="3" fill="#b9c2cb" ${S}/>
<rect x="50" y="62" width="20" height="8" fill="#b9c2cb" ${S}/>
<rect x="24" y="70" width="72" height="50" rx="10" fill="#fff7e6" ${S}/><rect x="24" y="100" width="72" height="9" fill="#16c79a" ${S}/>
<path d="M60 78a10 10 0 1 0 9 6M69 78v6h-6" stroke="#2e9b5a" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 82H12v24" ${S} fill="none"/><path d="M6 106h12v8H6z" fill="#b9c2cb" ${S}/><path d="M96 82h12v24" ${S} fill="none"/><path d="M102 106h12v8h-12z" fill="#b9c2cb" ${S}/>
<rect x="18" y="122" width="84" height="20" rx="10" fill="#3b4656" ${S}/><circle cx="32" cy="132" r="5" fill="#b9c2cb"/><circle cx="60" cy="132" r="5" fill="#b9c2cb"/><circle cx="88" cy="132" r="5" fill="#b9c2cb"/></svg>`;
}
// Florence's face, small, beside her words.
export const florenceSvg = (size = 44) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true"><path d="M24 8V3" ${S}/><circle cx="24" cy="3" r="2.5" fill="#d9a05b" ${S}/><rect x="6" y="8" width="36" height="32" rx="9" fill="#d9a05b" ${S}/><rect x="11" y="13" width="26" height="21" rx="6" fill="#fbeed3" ${S}/><circle cx="18" cy="22" r="3" fill="#5a3a1e"/><circle cx="30" cy="22" r="3" fill="#5a3a1e"/><path d="M19 28c3 3 7 3 10 0" ${thin}/><circle cx="4" cy="24" r="3" fill="#b9783c" ${S}/><circle cx="44" cy="24" r="3" fill="#b9783c" ${S}/></svg>`;

// The training record's picture: one bar for each test, with how many examples the robot had been shown by then.
// d: { tests: [{ right, of }…], shown: [examples by test…], street: { right, of } | null }
export function chartSvg(d) {
  const bars = d.tests.map((t, i) => ({ top: i === 0 ? 'First test' : d.tests.length === 2 ? 'Second test' : `Test ${i + 1}`, right: t.right, of: t.of, sub: `after ${d.shown[i]} example${d.shown[i] === 1 ? '' : 's'}`, fill: i === 0 ? '#f4b73b' : '#2e9b5a' }));
  if (d.street) bars.push({ top: 'In the street', right: d.street.right, of: d.street.of, sub: 'new things', fill: '#3a6fc9' });
  const W = 360; const H = 230; const base = 172; const maxH = 104; const n = Math.max(1, bars.length); const slot = (W - 40) / n; const bw = Math.min(64, slot - 18);
  const t = (x, y, s, size, weight = 700, fill = INK) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle">${s}</text>`;
  const body = bars.map((b, i) => { const cx = 20 + slot * (i + 0.5); const h = Math.max(3, (b.right / Math.max(1, b.of)) * maxH);
    return `<rect x="${(cx - bw / 2).toFixed(1)}" y="${base - maxH}" width="${bw.toFixed(1)}" height="${maxH}" rx="6" fill="#efe3c8"/><rect x="${(cx - bw / 2).toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="6" fill="${b.fill}" stroke="${INK}" stroke-width="2"/>`
      + t(cx.toFixed(1), (base - h - 7).toFixed(1), `${b.right} of ${b.of}`, 15, 800) + t(cx.toFixed(1), base + 18, b.top, 12.5, 800) + t(cx.toFixed(1), base + 34, b.sub, 11, 600, '#5e4936'); }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Inter, system-ui, sans-serif" role="img" aria-label="Robot training record: ${bars.map((b) => `${b.top} ${b.right} of ${b.of}`).join(', ')}"><rect width="${W}" height="${H}" rx="14" fill="#fffaf0"/>${t(W / 2, 26, 'Things sorted into the right bin', 14, 800)}<path d="M20 ${base}h${W - 40}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>${body}</svg>`;
}
