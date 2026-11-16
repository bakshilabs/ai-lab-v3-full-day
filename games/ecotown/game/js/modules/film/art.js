// Town film studio: the drawn pictures for missions 2, 4, 5 and 6 (story cards, takes, captions, changed pictures).
// Pure: it only builds SVG text, in the same style as the storyboard (picture.js). No page, no 3D, no script.
// Everything here is made up and drawn: no real people, no photographs.
import { at, house, tree, pine, pawn, water, otter, ART, INK, esc } from './picture.js';

export const FW = 160, FH = 90;
const n = (v) => Math.round(v * 10) / 10;
// sky, horizon glow, ground, ground edge
const SKY = {
  day: ['#6db2ee', '#d8eeff', '#8fd066', '#78b853'], dawn: ['#f2b8a2', '#ffe2b8', '#9ad070', '#83b85b'],
  evening: ['#8d86c9', '#ffc493', '#93b95f', '#7da04e'], night: ['#283068', '#4f4f8f', '#4d7a3e', '#3f6631'],
  storm: ['#7d8794', '#a7aeb6', '#7fa05a', '#6c8c4b'], dull: ['#a4abb0', '#c9cccc', '#a3ab8f', '#8f9879'],
};
let uid = 0; const nid = (p) => `${p}${++uid}`; // ids inside one SVG (filters), unique on the page

// One frame: sky, sun or moon, ground, then the drawings. horizon: where the ground starts.
export function frame(light, body, { horizon = 54, sun = true, ground = true, extra = '' } = {}) {
  const L = SKY[light] || SKY.day;
  const orb = !sun ? '' : light === 'night' ? '<circle cx="128" cy="18" r="7" fill="#f6f1d0"/><circle cx="131" cy="16" r="6" fill="' + L[0] + '"/>' + [[20, 12], [44, 22], [70, 10], [98, 24], [148, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#fff"/>`).join('')
    : light === 'storm' || light === 'dull' ? '' : light === 'evening' ? '<circle cx="118" cy="30" r="9" fill="#ffb066"/>' : light === 'dawn' ? '<circle cx="30" cy="40" r="9" fill="#ffd27a"/>' : '<circle cx="128" cy="18" r="8" fill="#fff3b0"/>';
  const gr = ground ? `<rect y="${horizon}" width="${FW}" height="${FH - horizon}" fill="${L[2]}"/><rect y="${horizon}" width="${FW}" height="2.5" fill="${L[3]}"/>` : '';
  return `<rect width="${FW}" height="${FH}" fill="${L[0]}"/><rect y="${horizon - 22}" width="${FW}" height="22" fill="${L[1]}" opacity="0.7"/>${orb}${gr}${body}${extra}`;
}
export const svg = (inner, label = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW} ${FH}" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}>${inner}</svg>`;

// ---- small pieces
const cloud = (x, y, s = 1, c = '#fff') => at(x, y, s, `<ellipse cx="0" cy="0" rx="12" ry="5" fill="${c}"/><ellipse cx="-6" cy="-3" rx="7" ry="5" fill="${c}"/><ellipse cx="5" cy="-4" rx="8" ry="6" fill="${c}"/>`);
const rain = (x0, x1, y0, y1) => { let s = ''; for (let x = x0; x <= x1; x += 7) for (let y = y0 + (x % 3) * 3; y < y1; y += 11) s += `<path d="M${x} ${y} l-2 5" stroke="#d7f1ff" stroke-width="1.3" stroke-linecap="round"/>`; return s; };
const ball = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff5a5a"/><path d="M${x - r} ${y} h${2 * r}" stroke="#fff" stroke-width="1"/>`;
const windows = (x, lit) => `<rect x="${x - 6}" y="-9" width="3" height="3" fill="${lit ? '#ffe27a' : '#3a3f55'}"/><rect x="${x + 3}" y="-9" width="3" height="3" fill="${lit ? '#ffe27a' : '#3a3f55'}"/>`;
const homes = (lit) => house(-30, '#e8cf8a', '#b5523b') + windows(-30, lit) + house(0, '#f1e6d0', '#c0563a', 18, 14) + windows(0, lit) + house(30, '#c98a5a', '#7a4a2e') + windows(30, lit);
const turbine = (spin) => `<path d="M-1.4 0 L-0.8 -32 h1.6 L1.4 0 Z" fill="#f4f6f8" stroke="#b9c2c9" stroke-width="0.5"/><g transform="translate(0 -32)">${[20, 140, 260].map((a) => `<path d="M0 0 L2 -15 L0 -17 L-1 -15 Z" fill="#fff" stroke="#b9c2c9" stroke-width="0.5" transform="rotate(${a + (spin ? 25 : 0)})"/>`).join('')}<circle r="1.8" fill="#c0563a"/>${spin ? '<path d="M-14 -14 A20 20 0 0 1 14 -14 M15 12 A20 20 0 0 1 -6 19" stroke="#3b2a1e" stroke-width="1" fill="none" stroke-dasharray="2 2"/>' : ''}</g>`;
const gust = (y) => `<path d="M10 ${y} q14 -6 28 0 t28 0 M20 ${y + 9} q12 -5 24 0" stroke="#fffaf0" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
const stall = (x, cover, roofC = '#ff8a5c') => `<rect x="${x - 9}" y="-10" width="2" height="10" fill="#7a5a33"/><rect x="${x + 7}" y="-10" width="2" height="10" fill="#7a5a33"/><rect x="${x - 9}" y="-5" width="18" height="5" fill="#c98a5a"/>`
  + `<path d="M${x - 11} -10 L${x - 8} -17 L${x + 8} -17 L${x + 11} -10 Z" fill="${roofC}"/>` + (cover ? `<path d="M${x - 11} -10 L${x - 11} -2 L${x + 11} -2 L${x + 11} -10 Z" fill="#3f8fd0" opacity="0.9"/>` : `<circle cx="${x - 4}" cy="-6.5" r="1.6" fill="#e8573f"/><circle cx="${x}" cy="-6.5" r="1.6" fill="#ffd23f"/><circle cx="${x + 4}" cy="-6.5" r="1.6" fill="#5bbd5a"/>`);
const florence = (x, y, s, extra = '') => at(x, y, s, ART.florence() + extra);
const net = '<path d="M6 -15 l10 -10" stroke="#7a5a33" stroke-width="1.4"/><ellipse cx="18" cy="-26" rx="5" ry="3.4" fill="none" stroke="#7a5a33" stroke-width="1"/>';
const face = (x, y, s, skin, shirt, mood = 'smile') => at(x, y, s, `<path d="M-14 22 Q0 8 14 22 Z" fill="${shirt}"/><circle cx="0" cy="0" r="11" fill="${skin}"/><path d="M-11 -4 Q-9 -13 0 -12 Q10 -13 11 -4 Q6 -9 0 -8 Q-6 -9 -11 -4 Z" fill="#4a3020"/><circle cx="-4" cy="0" r="1.4" fill="${INK}"/><circle cx="4" cy="0" r="1.4" fill="${INK}"/>${mood === 'smile' ? '<path d="M-4.5 4 Q0 8.5 4.5 4" stroke="#3b2a1e" stroke-width="1.4" fill="none" stroke-linecap="round"/>' : '<path d="M-3.5 6 Q0 3.5 3.5 6" stroke="#3b2a1e" stroke-width="1.4" fill="none" stroke-linecap="round"/>'}`);
const island = (lit) => `<g transform="translate(80 58)">${'<path d="M-46 -3 Q-40 12 -10 15 Q0 21 10 15 Q40 12 46 -3 Z" fill="#b5764a"/><ellipse cx="0" cy="-3" rx="46" ry="10" fill="#8fd066"/><path d="M-30 -9 q4 6 1 12" stroke="#5bbcf0" stroke-width="2.6" fill="none"/>'}<g transform="translate(0 -4) scale(0.5)">${lit ? [-16, 14, 42].map((x) => `<circle cx="${x}" cy="-8" r="13" fill="#ffd34d" opacity="0.5"/>`).join('') : ''}${house(-16, '#f1e6d0', '#c0563a') + windows(-16, lit) + house(14, '#e8cf8a', '#b5523b') + windows(14, lit) + house(42, '#c98a5a', '#7a4a2e') + windows(42, lit) + pine(-50, 0.9) + pine(68, 1) + tree(-72, 0.8)}</g></g>`;
const crowd = (x0, k, s = 0.9) => Array.from({ length: k }, (_, i) => pawn(x0 + i * 8, s, ['#ff8a5c', '#2f6fd8', '#ffd23f', '#5bbd5a', '#ff7eb6'][i % 5], ['#c68a5e', '#f1c9a5', '#e0ac7e', '#8d5a3b'][i % 4])).join('');
const blanket = '<path d="M-24 -1 L-18 -7 L18 -7 L24 -1 Z" fill="#e8573f"/><path d="M-12 -7 L-15 -1 M0 -7 L0 -1 M12 -7 L15 -1" stroke="#fff6e0" stroke-width="1.2"/>';
const seagull = '<path d="M-8 -2 q4 -5 8 0 q4 -5 8 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="3" rx="5" ry="3" fill="#fff"/><path d="M4 2 l4 1 l-4 1 Z" fill="#ffb03a"/>';
const sheep = (legs = 4) => `<ellipse cx="0" cy="-8" rx="9" ry="6" fill="#fff"/><circle cx="9" cy="-10" r="3.4" fill="#3b2a1e"/>${Array.from({ length: legs }, (_, i) => `<rect x="${-7 + i * (14 / (legs - 1))}" y="-3" width="1.6" height="5" fill="#3b2a1e"/>`).join('')}`;
const sign = (text) => `<rect x="-16" y="-34" width="32" height="10" rx="1.5" fill="#fffaf0" stroke="#7a5a33" stroke-width="1"/><text x="0" y="-26.4" text-anchor="middle" font-size="7" font-weight="800" fill="${INK}" font-family="Inter, Arial, sans-serif">${esc(text)}</text><path d="M-12 -24 v4 M12 -24 v4" stroke="#7a5a33" stroke-width="1.2"/>`;
const can = (x, y, c = '#c0563a') => `<rect x="${x}" y="${y}" width="4" height="2.4" rx="1" fill="${c}" transform="rotate(20 ${x} ${y})"/>`;

// ---- the story cards (mission 2). Each drawing is one shot of the story.
export const STORY_ART = {
  'w-where': () => frame('evening', island(false), { ground: false }),
  'w-dark': () => frame('night', at(80, 74, 1.3, homes(false))),
  'w-wind': () => frame('night', at(70, 78, 1.25, turbine(true)) + gust(28) + gust(48)),
  'w-lit': () => frame('night', island(true), { ground: false }),
  'b-park': () => frame('day', at(80, 66, 1.2, ART.trees()) + at(40, 66, 0.9, ART.trees())),
  // medium shots: people from the waist up (the frame cuts them at the waist), as mission 1 teaches
  'b-family': () => frame('day', at(54, 122, 1, pawn(0, 5, '#ff8a5c', '#c68a5e')) + at(110, 122, 1, pawn(0, 5, '#2f6fd8', '#f1c9a5')) + ball(82, 60, 7), { horizon: 62 }),
  'b-river': () => frame('day', at(80, 72, 2, water(80, 14)) + ball(86, 66, 5) + '<path d="M70 70 q4 -3 8 0 M92 72 q4 -3 8 0" stroke="#d7f1ff" stroke-width="1.4" fill="none"/>', { horizon: 50 }),
  'b-net': () => frame('day', florence(70, 124, 2.7, net) + '<path d="M0 80 h160 v10 h-160 Z" fill="#5bbcf0"/>', { horizon: 64 }),
  'b-smile': () => frame('day', face(80, 46, 2.1, '#c68a5e', '#ff8a5c') + ball(108, 78, 8), { horizon: 70 }),
  'm-dawn': () => frame('dawn', island(false), { ground: false }),
  'm-setup': () => frame('day', at(116, 98, 2.6, stall(0, false)) + at(52, 124, 1, pawn(0, 5, '#5bbd5a', '#8d5a3b'))),
  'm-clouds': () => frame('storm', at(80, 72, 1.2, stall(-16, false) + stall(16, false, '#3f8fd0')) + cloud(40, 18, 1.6, '#59606b') + cloud(100, 14, 2, '#4d535d') + cloud(140, 26, 1.2, '#59606b')),
  'm-cover': () => frame('storm', at(80, 74, 1.6, stall(-16, true) + stall(16, true, '#3f8fd0')) + rain(6, 156, 4, 60) + at(80, 82, 0.9, crowd(-34, 2) + crowd(26, 2))),
  'm-sun': () => frame('day', at(80, 70, 1.4, stall(-24, false) + stall(0, false, '#3f8fd0') + stall(24, false)) + at(80, 84, 1, crowd(-60, 6) + crowd(14, 6)) + cloud(36, 20)),
  'm-gull': () => frame('day', at(80, 62, 2.6, seagull) + at(80, 86, 1, water(160, 14)), { horizon: 74 }),
  // the otters come home (ages 13–17)
  'o-peek': () => frame('day', at(80, 96, 1, water(220, 40)) + at(66, 66, 5, otter(0)), { horizon: 44 }),
  'o-litter': () => RIVER_LITTER(true),
  'o-clean': () => RIVER_LITTER(false),
};
export const storyPic = (id, label = '') => svg((STORY_ART[id] || SHOT_ART[id] || STORY_ART['m-dawn'])(), label);

// ---- the takes (mission 4): the same shot, once good and once with a fault a camera operator can make
const HALL = () => frame('day', at(80, 74, 1.9, ART.hall()) + at(30, 74, 0.9, ART.trees()) + cloud(40, 20));
const FLO = () => frame('day', at(80, 80, 1.6, ART.florence()) + at(130, 72, 0.9, ART.trees()), { horizon: 66 });
const OTT = () => frame('day', at(80, 70, 2.2, water(100, 16) + otter(-20) + otter(22, -1)), { horizon: 50 });
const SUBJ = { hall: HALL, florence: FLO, otters: OTT };
export const FAULTS = {
  blur:  { label: 'It is blurry: out of focus', short: 'blurry' },
  shake: { label: 'It is shaky and crooked', short: 'shaky' },
  dark:  { label: 'It is far too dark', short: 'too dark' },
  head:  { label: 'The top of the head is cut off', short: 'badly framed' },
  thumb: { label: 'A thumb is over the lens', short: 'a thumb over the lens' },
};
export function takePic(subject, fault = null, label = '') {
  const base = (SUBJ[subject] || HALL)(); let inner = base;
  if (fault === 'blur') { const id = nid('fmblur'); inner = `<defs><filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.4"/></filter></defs><g filter="url(#${id})">${base}</g>`; }
  if (fault === 'shake') inner = `<g transform="rotate(-7 80 45) translate(-4 3) scale(1.12) translate(-8 -6)"><g opacity="0.5" transform="translate(5 -2)">${base}</g>${base}</g><path d="M6 30 l6 -3 M6 40 l6 -3 M148 52 l6 -3" stroke="${INK}" stroke-width="1"/>`;
  if (fault === 'dark') inner = `${base}<rect width="${FW}" height="${FH}" fill="#0b0a14" opacity="0.8"/>`;
  // framed too close and too low: the top of the head runs off the top of the picture
  if (fault === 'head') inner = `<rect width="${FW}" height="${FH}" fill="#8fd066"/><g transform="translate(80 90) scale(1.5) translate(-80 -96)">${base}</g>`;
  if (fault === 'thumb') inner = `${base}<ellipse cx="148" cy="80" rx="34" ry="28" fill="#c98f6a"/><ellipse cx="140" cy="72" rx="14" ry="10" fill="#e0a985" opacity="0.8"/>`;
  return svg(inner, label);
}

// ---- the shots of mission 4's films and mission 5's scene
export const SHOT_ART = {
  'wide-town': () => frame('day', island(false), { ground: false }),
  'dawn': () => STORY_ART['m-dawn'](),
  'market': () => frame('day', at(80, 72, 1.5, stall(-18, false) + stall(18, false, '#3f8fd0')) + at(80, 84, 1, crowd(-50, 4) + crowd(20, 4))),
  'florence': () => FLO(),
  'otters': () => OTT(),
  'river-evening': () => frame('evening', at(80, 72, 2, water(100, 14)) + at(26, 62, 0.9, ART.trees()) + at(140, 62, 1, pine(0, 1)), { horizon: 54 }),
  'homes-evening': () => frame('evening', at(80, 74, 1.4, homes(true))),
  'park': () => frame('day', at(80, 66, 1.2, ART.trees()) + at(30, 66, 0.9, ART.trees())),
  'family': () => frame('day', at(70, 76, 1.5, pawn(-12, 1.25, '#ff8a5c', '#c68a5e') + pawn(14, 1.25, '#2f6fd8', '#f1c9a5') + pawn(4, 0.85, '#ffd23f', '#e0ac7e'))),
  'clouds': () => STORY_ART['m-clouds'](),
  'cover': () => STORY_ART['m-cover'](),
  'sun': () => STORY_ART['m-sun'](),
  'splash': () => frame('day', at(80, 70, 2.2, water(100, 16) + otter(4)) + '<path d="M60 52 l-6 -10 M70 48 l-2 -12 M86 48 l3 -12 M96 52 l7 -9" stroke="#d7f1ff" stroke-width="2.2" stroke-linecap="round"/>', { horizon: 50 }),
  'lab': () => frame('day', at(80, 74, 1.9, ART.lab()) + florence(124, 74, 1.1)),
  // filmed by mistake: the camera pointing at the grass, with the operator's shoe in the corner
  'ground': () => `<rect width="${FW}" height="${FH}" fill="#7fae52"/>${Array.from({ length: 40 }, (_, i) => `<path d="M${(i * 37) % 160} ${(i * 23) % 90} l2 -6" stroke="#5f8a3c" stroke-width="1.6"/>`).join('')}<path d="M104 90 Q108 64 132 62 Q160 60 160 74 L160 90 Z" fill="#3b2a1e"/><path d="M112 78 h40" stroke="#fffaf0" stroke-width="1.4" stroke-dasharray="3 3"/>`,
};
export const shotPic = (id, label = '') => svg((SHOT_ART[id] || SHOT_ART['wide-town'])(), label);
// A frame with a caption on it, as it would look on screen (mission 5)
// (a long caption is set smaller so it stays inside its black box, as a long line would on screen)
export const captionPic = (id, text, label = '') => { const fs = Math.min(8.5, Math.round(250 / Math.max(1, String(text).length) * 10) / 10);
  return svg((SHOT_ART[id] || SHOT_ART['wide-town'])() + (text ? `<rect x="8" y="70" width="144" height="14" rx="2" fill="#000"/><text x="80" y="${79 + fs * 0.18}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#fff" font-family="Inter, Arial, sans-serif">${esc(text)}</text>` : ''), label); };

// ---- mission 6: a picture as it was filmed, and as it was shown. And pictures with or without a machine's clues.
const RIVER_LITTER = (litter) => frame('day', at(80, 70, 2.2, water(100, 18)) + at(24, 60, 0.9, ART.trees()) + (litter ? can(60, 64) + can(84, 70, '#3f8fd0') + can(104, 62) + '<path d="M70 74 h9 l-2 4 h-6 Z" fill="#fffaf0" opacity="0.9"/>' : ''), { horizon: 52 });
const OTTERS_N = (k) => frame('day', at(80, 70, 2, water(110, 18)) + Array.from({ length: k }, (_, i) => at(k === 1 ? 80 : 30 + i * 33, 70, 1.6, otter(0))).join(''), { horizon: 52 });
export const CHANGE_ART = {
  // the same scene twice: the colours were dull and dark as filmed, and brightened for the film (nothing else changed)
  colour: [() => { const id = nid('fmdull'); return `<defs><filter id="${id}"><feColorMatrix type="saturate" values="0.2"/><feComponentTransfer><feFuncR type="linear" slope="0.75"/><feFuncG type="linear" slope="0.75"/><feFuncB type="linear" slope="0.75"/></feComponentTransfer></filter></defs><g filter="url(#${id})">${HALL()}</g>`; }, () => HALL()],
  level:  [() => `<g transform="rotate(-9 80 45) scale(1.15) translate(-10 -6)">${frame('day', at(80, 74, 1.4, ART.stalls()))}</g>`, () => frame('day', at(80, 74, 1.4, ART.stalls()))],
  litter: [() => RIVER_LITTER(true), () => RIVER_LITTER(false)],
  copies: [() => OTTERS_N(1), () => OTTERS_N(4)],
};
export const changePair = (id) => { const [a, b] = CHANGE_ART[id]; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW * 2 + 12} ${FH + 16}" aria-hidden="true"><g transform="translate(0 16)">${a()}</g><g transform="translate(${FW + 12} 16)">${b()}</g>`
  + `<text x="0" y="11" font-size="10" font-weight="800" fill="${INK}" font-family="Inter, Arial, sans-serif">As it was filmed</text><text x="${FW + 12}" y="11" font-size="10" font-weight="800" fill="${INK}" font-family="Inter, Arial, sans-serif">As it was shown</text></svg>`; };

export const MADE_ART = {
  homes: () => frame('day', at(80, 74, 1.4, homes(false)) + cloud(36, 18)),
  sign: () => frame('day', at(80, 74, 1.6, stall(-16, false) + stall(16, false, '#3f8fd0') + sign('MAKRTE'))),
  shadows: () => frame('day', '<ellipse cx="62" cy="76" rx="18" ry="3" fill="#5f8a3c"/><ellipse cx="100" cy="76" rx="18" ry="3" fill="#5f8a3c"/>' + at(80, 75, 1.6, tree(0, 1.3)) + '<circle cx="20" cy="18" r="8" fill="#fff3b0"/>', { horizon: 56, sun: false }),
  otters: () => OTT(),
  sheep: () => frame('day', at(70, 76, 1.8, sheep(6)) + at(124, 72, 0.9, ART.trees())),
  // no clue in these two, and no source: you cannot tell yet
  park: () => frame('day', at(80, 66, 1.2, ART.trees()) + at(30, 66, 0.9, ART.trees()) + cloud(112, 20)),
  evening: () => SHOT_ART['river-evening'](),
  poster: () => frame('evening', at(80, 74, 1.6, ART.tent()) + at(80, 86, 1, crowd(-44, 4) + crowd(14, 4)) + '<rect x="104" y="4" width="52" height="13" rx="3" fill="#fffaf0"/><text x="130" y="13.4" text-anchor="middle" font-size="7.4" font-weight="800" fill="#3b2a1e" font-family="Inter, Arial, sans-serif">Made with AI</text>'),
};
export const madePic = (id, label = '') => svg((MADE_ART[id] || MADE_ART.homes)(), label);

// mission 6 part 3: people in the park (drawn, made up)
export const PEOPLE_ART = {
  picnic: () => frame('day', at(80, 80, 1.6, blanket + pawn(-10, 1, '#ff8a5c', '#c68a5e') + pawn(10, 1, '#2f6fd8', '#f1c9a5') + pawn(1, 0.7, '#ffd23f', '#e0ac7e')) + at(28, 66, 0.9, ART.trees()) + at(136, 66, 1, ART.trees()), { horizon: 60 }),
  wave: () => frame('day', at(80, 80, 1.6, pawn(-8, 1, '#5bbd5a', '#8d5a3b') + pawn(10, 0.9, '#ff7eb6', '#e0ac7e')) + at(140, 70, 1.6, ART.school()), { horizon: 62 }),
  park: () => frame('day', at(80, 66, 1.2, ART.trees()) + at(36, 66, 0.9, ART.trees()) + at(128, 66, 1, ART.trees())),
  hall: () => frame('day', at(80, 74, 1.9, ART.hall()) + at(80, 86, 0.9, crowd(-14, 3))), // only a few people came
  credits: () => `<rect width="${FW}" height="${FH}" fill="#17110c"/><text x="80" y="34" text-anchor="middle" font-size="12" font-weight="800" fill="#fff6e0" font-family="Inter, Arial, sans-serif">The end</text><text x="80" y="52" text-anchor="middle" font-size="7.5" fill="#fff6e0" font-family="Inter, Arial, sans-serif">Directed by: ?</text><text x="80" y="64" text-anchor="middle" font-size="7.5" fill="#fff6e0" font-family="Inter, Arial, sans-serif">Camera by: ?</text>`,
};
export const peoplePic = (id, label = '') => svg((PEOPLE_ART[id] || PEOPLE_ART.park)(), label);
