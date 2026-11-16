// Town film studio: the storyboard as drawings. Pure: it only builds SVG text (no page, no 3D, no script).
// One simple drawn frame per shot, made from the shot's subject (what is in it) and its camera move (the arrows).
import { placeOf, moodOf } from './kit.js';
import { caption, moveName, subjectLine, TAG, cutName, cutFacts } from './words.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => Math.round(v * 10) / 10;
export const FW = 160, FH = 90; // one frame, 16 : 9
const INK = '#3b2a1e';

// the sky and ground for each mood's light: [sky, horizon, ground, ground edge]
const LIGHT = { calm: ['#8d86c9', '#ffc493', '#93b95f', '#7da04e'], curious: ['#a9cdf2', '#ffe6cc', '#9ad070', '#83b85b'], cheerful: ['#6db2ee', '#d8eeff', '#8fd066', '#78b853'], party: ['#7aaff0', '#ffe9b5', '#97d260', '#80ba4e'] };

// ---- small drawings. (x, y) is where the thing stands on the ground; s is its size.
const g = (x, y, s, body) => `<g transform="translate(${n(x)} ${n(y)}) scale(${n(s)})">${body}</g>`;
const house = (x, wall, roof, w = 16, h = 11) => `<rect x="${x - w / 2}" y="${-h}" width="${w}" height="${h}" fill="${wall}"/><path d="M${x - w / 2 - 2} ${-h} L${x} ${-h - 8} L${x + w / 2 + 2} ${-h} Z" fill="${roof}"/><rect x="${x - 2}" y="-6" width="4" height="6" fill="#6b4a2e"/>`;
const tree = (x, s = 1, top = '#4f9f48') => `<rect x="${x - 1}" y="${-7 * s}" width="2" height="${7 * s}" fill="#7a5a33"/><circle cx="${x}" cy="${-11 * s}" r="${6 * s}" fill="${top}"/>`;
const pine = (x, s = 1) => `<rect x="${x - 1}" y="${-4 * s}" width="2" height="${4 * s}" fill="#6b4a2e"/><path d="M${x - 6 * s} ${-4 * s} L${x} ${-20 * s} L${x + 6 * s} ${-4 * s} Z" fill="#3f8a43"/><path d="M${x - 4.5 * s} ${-11 * s} L${x} ${-24 * s} L${x + 4.5 * s} ${-11 * s} Z" fill="#4f9f48"/>`;
const pawn = (x, s, shirt, skin = '#e0ac7e') => `<path d="M${x - 3 * s} 0 L${x - 2.4 * s} ${-8 * s} Q${x} ${-10.5 * s} ${x + 2.4 * s} ${-8 * s} L${x + 3 * s} 0 Z" fill="${shirt}"/><circle cx="${x}" cy="${-12 * s}" r="${3 * s}" fill="${skin}"/>`;
const water = (w = 60, h = 12) => `<path d="M${-w / 2} ${-h / 2} Q${-w / 4} ${-h} 0 ${-h / 2} T${w / 2} ${-h / 2} L${w / 2} ${h / 2} L${-w / 2} ${h / 2} Z" fill="#5bbcf0"/><path d="M${-w / 3} 0 h8 M${w / 8} 2 h9" stroke="#d7f1ff" stroke-width="1.4" stroke-linecap="round" fill="none"/>`;
const otter = (x, flip = 1) => `<g transform="translate(${x} 0) scale(${flip} 1)"><ellipse cx="0" cy="-1" rx="9" ry="3.4" fill="#7a4f2e"/><circle cx="8" cy="-4" r="3.6" fill="#8a5c38"/><circle cx="6.4" cy="-7" r="1.1" fill="#7a4f2e"/><circle cx="9.8" cy="-7" r="1.1" fill="#7a4f2e"/><circle cx="9.4" cy="-4.4" r="0.7" fill="#2a1c12"/><ellipse cx="10.6" cy="-3" rx="1.5" ry="1.1" fill="#e8d5b8"/><path d="M-8 -1 q-5 -1 -7 -5" stroke="#7a4f2e" stroke-width="2.4" stroke-linecap="round" fill="none"/></g>`;

const ART = {
  stalls: () => [0, 1].map((i) => { const x = -13 + i * 26; return `<rect x="${x - 9}" y="-10" width="2" height="10" fill="#7a5a33"/><rect x="${x + 7}" y="-10" width="2" height="10" fill="#7a5a33"/><rect x="${x - 9}" y="-5" width="18" height="5" fill="#c98a5a"/><path d="M${x - 11} -10 L${x - 8} -17 L${x + 8} -17 L${x + 11} -10 Z" fill="${i ? '#3f8fd0' : '#ff8a5c'}"/><path d="M${x - 5} -17 L${x - 6} -10 h4 l1 -7 Z M${x + 2} -17 l1 7 h4 l-2 -7 Z" fill="#fff6e0"/><circle cx="${x - 4}" cy="-6.5" r="1.6" fill="#e8573f"/><circle cx="${x}" cy="-6.5" r="1.6" fill="#ffd23f"/><circle cx="${x + 4}" cy="-6.5" r="1.6" fill="#5bbd5a"/>`; }).join(''),
  hall: () => `<rect x="-17" y="-14" width="34" height="14" fill="#c0563a"/><path d="M-20 -14 L0 -25 L20 -14 Z" fill="#8f3d28"/>${[-11, -4, 4, 11].map((x) => `<rect x="${x - 1.4}" y="-13" width="2.8" height="13" fill="#fff0d8"/>`).join('')}<rect x="-3" y="-8" width="6" height="8" fill="#6b4a2e"/><circle cx="0" cy="-18.5" r="2.2" fill="#fff0d8"/>`,
  school: () => `<rect x="-18" y="-13" width="36" height="13" fill="#ffd23f"/><path d="M-20 -13 L-18 -18 L18 -18 L20 -13 Z" fill="#b5523b"/><rect x="-4" y="-27" width="8" height="10" fill="#ffd23f"/><path d="M-6 -27 L0 -33 L6 -27 Z" fill="#b5523b"/><circle cx="0" cy="-22" r="2.4" fill="#fff"/><path d="M0 -22 v-1.6 M0 -22 h1.3" stroke="${INK}" stroke-width="0.6"/><rect x="-3" y="-8" width="6" height="8" fill="#6b4a2e"/>${[-13, -8, 8, 13].map((x) => `<rect x="${x - 1.6}" y="-10" width="3.2" height="4" fill="#bfe6ff"/>`).join('')}`,
  trees: () => tree(-14, 1.1) + tree(13, 1.25, '#5bb04f') + tree(0, 0.9, '#3f8a43') + '<rect x="-7" y="-3.4" width="10" height="1.4" fill="#7a5a33"/><rect x="-6" y="-2" width="1.2" height="2" fill="#7a5a33"/><rect x="1" y="-2" width="1.2" height="2" fill="#7a5a33"/>',
  tent: () => `<path d="M-18 0 L0 -24 L18 0 Z" fill="#ff7eb6"/><path d="M-9 0 L0 -24 L-3 0 Z M9 0 L0 -24 L3 0 Z" fill="#fff0d8"/><path d="M0 -24 v-7" stroke="${INK}" stroke-width="1"/><path d="M0 -31 l7 2.5 l-7 2.5 Z" fill="#ffd23f"/><path d="M-26 -14 q8 6 14 -1 M12 -15 q8 6 14 1" stroke="#3f8fd0" stroke-width="1.2" fill="none"/>`,
  houses: () => house(-17, '#e8cf8a', '#b5523b') + house(17, '#c98a5a', '#7a4a2e') + house(0, '#f1e6d0', '#c0563a', 18, 14),
  orchard: () => [-14, 0, 14].map((x, i) => tree(x, 1.05, i === 1 ? '#5bbd5a' : '#4fa64a') + [[-2.5, -13], [2.5, -10], [0, -8]].map(([a, b]) => `<circle cx="${x + a}" cy="${b * 1.05}" r="1.4" fill="#e8573f"/>`).join('')).join(''),
  turbine: () => `<path d="M-1.4 0 L-0.8 -30 h1.6 L1.4 0 Z" fill="#f4f6f8" stroke="#b9c2c9" stroke-width="0.5"/><g transform="translate(0 -30)">${[20, 140, 260].map((a) => `<path d="M0 0 L2 -15 L0 -17 L-1 -15 Z" fill="#fff" stroke="#b9c2c9" stroke-width="0.5" transform="rotate(${a})"/>`).join('')}<circle r="1.8" fill="#c0563a"/></g>` + tree(-17, 0.6) + tree(16, 0.7),
  farm: () => `${[-3, -7, -11].map((y, i) => `<path d="M${-24 + i * 3} ${y} h${48 - i * 6}" stroke="${i % 2 ? '#e3c25a' : '#b9d77a'}" stroke-width="3"/>`).join('')}<ellipse cx="-8" cy="-15" rx="4.5" ry="3" fill="#fff"/><circle cx="-12.5" cy="-16" r="1.8" fill="#3b2a1e"/><ellipse cx="9" cy="-14" rx="4.5" ry="3" fill="#fff"/><circle cx="13.5" cy="-15" r="1.8" fill="#3b2a1e"/>`,
  plots: () => [-16, 0, 16].map((x) => `<rect x="${x - 6}" y="-7" width="12" height="7" rx="1" fill="#8a5c38"/>${[-3.5, 0, 3.5].map((d) => `<path d="M${x + d} -7 q-2 -4 0 -6 q2 2 0 6" fill="#5bbd5a"/>`).join('')}`).join(''),
  tram: () => `<path d="M-26 0 h52" stroke="#6d6257" stroke-width="1.6"/><rect x="-20" y="-14" width="40" height="12" rx="3" fill="#2f6fd8"/><rect x="-20" y="-6" width="40" height="4" fill="#c8553d"/>${[-15, -7, 1, 9].map((x) => `<rect x="${x}" y="-12" width="6" height="5" rx="1" fill="#d7f1ff"/>`).join('')}<circle cx="-12" cy="-1.5" r="2" fill="${INK}"/><circle cx="12" cy="-1.5" r="2" fill="${INK}"/><path d="M0 -14 v-5 h-8" stroke="${INK}" stroke-width="0.9" fill="none"/>`,
  river: () => `<g transform="translate(0 -5)">${water(64, 13)}</g>` + [-24, -19, 22].map((x) => `<path d="M${x} -11 q-1 -7 1 -10 M${x + 2.5} -11 q1 -6 -0.5 -8" stroke="#3f8a43" stroke-width="1.3" fill="none"/>`).join('') + '<ellipse cx="6" cy="-4" rx="3.5" ry="1.3" fill="#6fbf8a"/>',
  pines: () => pine(-18, 0.9) + pine(17, 1) + pine(-6, 1.25) + pine(7, 0.8),
  bridge: () => `<g transform="translate(0 -2)">${water(64, 9)}</g><path d="M-26 -8 Q0 -22 26 -8" stroke="#9a6a42" stroke-width="3.4" fill="none"/><path d="M-26 -14 Q0 -28 26 -14" stroke="#7a5a33" stroke-width="1.2" fill="none"/>${[-18, -9, 0, 9, 18].map((x) => `<path d="M${x} ${-8 - (1 - (x / 26) ** 2) * 7} v-6" stroke="#7a5a33" stroke-width="1.1"/>`).join('')}`,
  lab: () => `<rect x="-16" y="-12" width="32" height="12" fill="#e8eef2"/><path d="M-11 -12 A11 11 0 0 1 11 -12 Z" fill="#16c79a"/><path d="M0 -23 v-7" stroke="${INK}" stroke-width="1"/><circle cx="0" cy="-31" r="2" fill="#ff8a5c"/><rect x="-3" y="-8" width="6" height="8" fill="#3a4752"/><rect x="-13" y="-9" width="6" height="4" fill="#bfe6ff"/><rect x="7" y="-9" width="6" height="4" fill="#bfe6ff"/>`,
  dock: () => `<g transform="translate(0 -3)">${water(64, 10)}</g><rect x="-26" y="-11" width="26" height="3" fill="#9a6a42"/>${[-24, -14, -3].map((x) => `<rect x="${x}" y="-9" width="2" height="8" fill="#6b4a2e"/>`).join('')}<path d="M4 -8 h20 l-4 5 h-13 Z" fill="#c8553d"/><path d="M13 -8 v-13 l8 10 Z" fill="#fff6e0" stroke="#b9a98c" stroke-width="0.5"/>`,
  family: () => pawn(-9, 1.25, '#ff8a5c', '#c68a5e') + pawn(9, 1.25, '#2f6fd8', '#f1c9a5') + pawn(0, 0.85, '#ffd23f', '#e0ac7e'),
  otters: () => `<g transform="translate(0 -3)">${water(64, 14)}</g>${otter(-12)}${otter(13, -1)}`,
  florence: () => `<rect x="-6" y="-17" width="12" height="13" rx="2.5" fill="#c98a5a" stroke="#7a5a33" stroke-width="0.8"/><circle cx="0" cy="-10" r="2.2" fill="#16c79a"/><rect x="-7.5" y="-29" width="15" height="11" rx="3" fill="#d9a066" stroke="#7a5a33" stroke-width="0.8"/><rect x="-5.5" y="-27" width="11" height="7" rx="2" fill="#2a3a44"/><circle cx="-2.4" cy="-23.5" r="1.3" fill="#7fe3ff"/><circle cx="2.4" cy="-23.5" r="1.3" fill="#7fe3ff"/><path d="M0 -29 v-4" stroke="#7a5a33" stroke-width="1"/><circle cx="0" cy="-34" r="1.8" fill="#ff8a5c"/><path d="M-6 -15 l-5 5 M6 -15 l6 -6" stroke="#7a5a33" stroke-width="2" stroke-linecap="round"/><rect x="-5" y="-4" width="3.6" height="4" fill="#7a5a33"/><rect x="1.4" y="-4" width="3.6" height="4" fill="#7a5a33"/>`,
  // the whole town: the floating island with a few roofs and trees on it
  town: (built = 3) => `<path d="M-34 -3 Q-30 9 -8 11 Q0 16 8 11 Q30 9 34 -3 Z" fill="#b5764a"/><ellipse cx="0" cy="-3" rx="34" ry="8" fill="#8fd066"/><path d="M-22 -8 q3 5 1 10" stroke="#5bbcf0" stroke-width="2.4" fill="none"/>`
    + `<g transform="translate(0 -3) scale(0.42)">${built > 0 ? house(-10, '#f1e6d0', '#c0563a') + house(12, '#e8cf8a', '#b5523b') : ''}${built > 2 ? house(34, '#c98a5a', '#7a4a2e') : ''}${pine(-36, 0.8) + pine(56, 0.9) + tree(-58, 0.8)}<rect x="60" y="2" width="10" height="7" fill="#e8eef2"/></g>`,
};
const ART_OF = (sub, set) => { const [kind, id] = String(sub).split(':'); return kind === 'who' ? (ART[id] ? id : 'family') : kind === 'place' ? (placeOf(set, id)?.draw || 'houses') : 'town'; };

// ---- the camera move, as arrows over the frame
function arrow(x1, y1, x2, y2, w = 2.4) {
  const a = Math.atan2(y2 - y1, x2 - x1); const h = 6; const bx = x2 - Math.cos(a) * h, by = y2 - Math.sin(a) * h; const px = Math.sin(a) * 3.6, py = -Math.cos(a) * 3.6;
  const line = `M${n(x1)} ${n(y1)} L${n(bx)} ${n(by)}`; const head = `M${n(x2)} ${n(y2)} L${n(bx + px)} ${n(by + py)} L${n(bx - px)} ${n(by - py)} Z`;
  return `<path d="${line}" stroke="#fffaf0" stroke-width="${w + 2.4}" stroke-linecap="round" fill="none"/><path d="${head}" fill="#fffaf0" stroke="#fffaf0" stroke-width="2.4" stroke-linejoin="round"/><path d="${line}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" fill="none"/><path d="${head}" fill="${INK}"/>`;
}
const corners = (x0, y0, x1, y1, len = 9) => { const d = `M${x0} ${y0 + len} V${y0} H${x0 + len} M${x1 - len} ${y0} H${x1} V${y0 + len} M${x1} ${y1 - len} V${y1} H${x1 - len} M${x0 + len} ${y1} H${x0} V${y1 - len}`; return `<path d="${d}" stroke="#fffaf0" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; };
const MARK = {
  wide: () => corners(10, 9, 150, 81, 12),
  push: () => arrow(14, 12, 36, 25) + arrow(146, 12, 124, 25) + arrow(14, 78, 36, 66) + arrow(146, 78, 124, 66),
  pull: () => arrow(40, 27, 16, 12) + arrow(120, 27, 144, 12) + arrow(40, 64, 16, 78) + arrow(120, 64, 144, 78),
  orbit: () => `<path d="M36 68 Q80 88 121 70" stroke="#fffaf0" stroke-width="4.8" fill="none" stroke-linecap="round"/><path d="M36 68 Q80 88 121 70" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-dasharray="1 0"/>` + arrow(118, 71.5, 128, 66),
  street: () => arrow(18, 80, 142, 80),
  glide: () => arrow(18, 12, 142, 12),
  rise: () => arrow(142, 78, 142, 14),
  close: () => corners(42, 12, 118, 80, 10),
};
// where the subject stands and how big it is drawn for each move: [x, y, size]
const CLOSE_WHO = { florence: [80, 150, 3.9], family: [80, 132, 4.6], otters: [74, 92, 3.4] };
const PLACE = { wide: [80, 58, 1.35], push: [80, 66, 1.45], pull: [80, 56, 1.1], orbit: [80, 62, 1.5], street: [80, 70, 1.9], glide: [80, 62, 1.2], rise: [74, 70, 1.5], close: [80, 72, 1.9] };

// The inside of one frame (no <svg> wrapper), 160 × 90.
export function frameInner(shot, set, mood = 'cheerful') {
  const L = LIGHT[mood] || LIGHT.cheerful; const move = PLACE[shot.move] ? shot.move : 'close';
  const whole = move === 'pull' || move === 'wide' || move === 'glide' || shot.sub === 'town'; const art = whole ? 'town' : ART_OF(shot.sub, set);
  // a close-up of someone is drawn as mission 1 teaches it: their face fills the frame (the frame cuts the rest)
  const [x, y, s] = move === 'close' && CLOSE_WHO[art] ? CLOSE_WHO[art] : PLACE[move]; const horizon = art === 'town' ? FH : move === 'street' || move === 'close' ? 52 : 46;
  const sky = `<rect width="${FW}" height="${FH}" fill="${L[0]}"/><rect y="${horizon - 22}" width="${FW}" height="22" fill="${L[1]}" opacity="0.75"/>`;
  const sun = mood === 'calm' ? '<circle cx="106" cy="27" r="9" fill="#ffb066"/>' : mood === 'party' ? [[22, 16, '#ff7eb6'], [40, 26, '#ffd23f'], [136, 18, '#16c79a'], [120, 30, '#ff8a5c']].map(([a, b, c]) => `<rect x="${a}" y="${b}" width="4" height="4" fill="${c}" transform="rotate(30 ${a} ${b})"/>`).join('') : `<circle cx="108" cy="19" r="8" fill="#fff3b0"/>`;
  const cloud = art === 'town' ? '<ellipse cx="28" cy="72" rx="16" ry="4" fill="#fff" opacity="0.8"/><ellipse cx="134" cy="78" rx="18" ry="4" fill="#fff" opacity="0.8"/>' : '<ellipse cx="34" cy="20" rx="13" ry="4" fill="#fff" opacity="0.85"/>';
  const ground = art === 'town' ? '' : `<rect y="${horizon}" width="${FW}" height="${FH - horizon}" fill="${L[2]}"/><rect y="${horizon}" width="${FW}" height="2.5" fill="${L[3]}"/>${move === 'street' ? `<rect y="${y + 3}" width="${FW}" height="9" fill="#d9c9a0"/>` : ''}`;
  const body = art === 'town' ? ART.town(set?.built ?? 3) : ART[art]();
  return `${sky}${sun}${cloud}${ground}${g(x, y, s, body)}${MARK[move]()}`;
}
// One frame as a picture of its own (the storyboard cards and the screen in the town).
export function frameSvg(shot, set, mood = 'cheerful', label = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW} ${FH}" role="img" aria-label="${esc(label || caption(shot, set))}">${frameInner(shot, set, mood)}</svg>`;
}

// The whole storyboard as one picture, for the take-home page: the title, then every shot in order with its number,
// its camera move and its subject, three to a row. Marks show what the last round of feedback changed.
export function storyboardSvg({ title, cut, set }) {
  const shots = cut.shots; const cols = 3; const rows = Math.ceil(shots.length / cols); const pad = 12, gap = 10, capH = 30, top = 44;
  const W = pad * 2 + cols * FW + (cols - 1) * gap; const H = top + rows * (FH + capH) + (rows - 1) * gap + pad;
  const font = 'font-family="Inter, Arial, sans-serif"'; const TAGC = { new: '#2e9b5a', moved: '#1f6fd0', changed: '#b3541e' };
  const cells = shots.map((shot, i) => {
    const x = pad + (i % cols) * (FW + gap), y = top + Math.floor(i / cols) * (FH + capH + gap); const tag = cut.tags?.[shot.id];
    return `<g transform="translate(${x} ${y})"><g>${frameInner(shot, set, cut.mood)}</g><rect width="${FW}" height="${FH}" fill="none" stroke="${INK}" stroke-width="2"/>`
      + `<circle cx="11" cy="11" r="8.5" fill="${INK}"/><text x="11" y="14.6" text-anchor="middle" font-size="10" font-weight="800" fill="#fff" ${font}>${i + 1}</text>`
      + (tag ? `<rect x="${FW - 50}" y="4" width="46" height="14" rx="7" fill="${TAGC[tag]}"/><text x="${FW - 27}" y="14.2" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" ${font}>${esc(TAG[tag])}</text>` : '')
      + `<text x="0" y="${FH + 13}" font-size="10.5" font-weight="800" fill="${INK}" ${font}>${esc(moveName(shot.move))}</text><text x="0" y="${FH + 25}" font-size="9.5" fill="#5e4936" ${font}>${esc(subjectLine(shot, set))}</text></g>`;
  }).join('');
  const m = moodOf(cut.mood);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`Storyboard of the film ${title}: ${shots.map((s2, i) => `${i + 1}, ${caption(s2, set)}`).join('; ')}`)}">`
    + `<rect width="${W}" height="${H}" fill="#fffaf0"/><text x="${pad}" y="22" font-size="16" font-weight="800" fill="${INK}" ${font}>${esc(title)}</text>`
    + `<text x="${pad}" y="36" font-size="9.5" fill="#5e4936" ${font}>${esc(`${cutName(cut.n)} · ${cutFacts(cut)} · ${m.tune}`)}</text>${cells}</svg>`;
}

// The small drawings, for the missions own pictures (art.js).
export { g as at, house, tree, pine, pawn, water, otter, ART, LIGHT, INK, esc, arrow, corners };
