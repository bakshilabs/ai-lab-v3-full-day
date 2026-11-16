// Power control room: the drawings made from numbers. Pure: each returns SVG text (no page, no 3D, no script).
// One day is drawn the same way everywhere: on the desk as the forecast, in the results, and on the take-home page.
//   top rows   wind and sun, hour by hour (the forecast)
//   bars       power made each hour (blue: wind, yellow: sun), with a line for the power needed
//   purple     how full the battery is
//   bottom row each hour that has happened: warm = every home lit, dark with a number = that many homes dark
import { forecast, homeNeed, schoolNeed, isWinter, HOURS, WIND_STRONG, WIND_LOW, SUN_BRIGHT, KW, BLOCKS, TEST_DAYS } from './model.js';
import { T, clockShort } from './words.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const f1 = (x) => Math.round(x * 10) / 10;
export const C = { wind: '#5b9bd5', windPale: '#cfe0f1', sun: '#f2b632', sunPale: '#f8e3a6', need: '#b5432c', battery: '#8e5cd9', lit: '#f6c453', dark: '#2b3358', night: '#e4e1f0', ink: '#3b2a1e', ink2: '#5e4936', paper: '#fffaf0', line: '#d2c4ac', school: '#2e9b5a' };
const FONT = 'Inter, system-ui, sans-serif';

// what the town needs each hour of a kind of day (every home and the school)
export function needLine(kit, dayId, seed = 1) {
  const winter = isWinter(dayId);
  return forecast(dayId, seed).map((f) => kit.homes.reduce((n, h) => n + homeNeed(f.clock, h.base, winter), 0) + schoolNeed(f.clock, winter));
}

// One day as a group of shapes, w wide and h tall, at (x, y).
// hours: the hours that have happened (from model.runDay), or fewer, or none. cursor: the step to ring, or -1.
// marks: (forecasting) one true/false per hour, the hours the child marked short, drawn in the bottom row instead.
// rings: hours to look at again, ringed in orange.
export function dayPanel(kit, dayId, { x = 0, y = 0, w = 440, h = 150, hours = [], cursor = -1, junior = true, seed = 1, labels = true, mark = -1, marks = null, rings = [] } = {}) {
  const fc = forecast(dayId, seed); const need = needLine(kit, dayId); const left = 34, right = 6; const cw = (w - left - right) / HOURS;
  const rowH = Math.max(6, Math.round(h * 0.062)); const top = labels ? 13 : 2; const yWind = top, ySun = top + rowH + 2; const y0 = ySun + rowH + 5; const yLit = h - (labels ? 26 : 12), litH = 11; const y1 = yLit - 5;
  const made = fc.map((f) => [kit.wind * f.wind, kit.solar * f.sun]); const max = Math.max(1, ...made.map((m) => m[0] + m[1]), ...need) * 1.08;
  const Y = (v) => y1 - (v / max) * (y1 - y0); const X = (i) => left + i * cw;
  let s = `<g transform="translate(${x} ${y})" font-family="${FONT}">`;
  // night shading, and the parts of the day
  for (let i = 0; i < HOURS; i++) if (fc[i].dark) s += `<rect x="${f1(X(i))}" y="${top - 1}" width="${f1(cw + 0.3)}" height="${f1(yLit + litH - top + 2)}" fill="${C.night}"/>`;
  if (labels) { let a = 0; for (const b of BLOCKS) { const n = fc.filter((f) => f.block === b).length; s += `<text x="${f1(X(a) + (n * cw) / 2)}" y="9" font-size="8.5" font-weight="700" fill="${C.ink2}" text-anchor="middle">${esc(T.block[b])}</text>`; if (a) s += `<path d="M${f1(X(a))} 1V${f1(yLit + litH)}" stroke="${C.line}" stroke-width="1" stroke-dasharray="2 3"/>`; a += n; } }
  // forecast rows
  s += `<text x="${left - 4}" y="${yWind + rowH - 1}" font-size="8.5" font-weight="700" fill="${C.ink2}" text-anchor="end">Wind</text><text x="${left - 4}" y="${ySun + rowH - 1}" font-size="8.5" font-weight="700" fill="${C.ink2}" text-anchor="end">Sun</text>`;
  for (let i = 0; i < HOURS; i++) {
    const f = fc[i]; const wl = f.wind >= WIND_STRONG ? 2 : f.wind < WIND_LOW ? 0 : 1; const sl = f.sun >= SUN_BRIGHT ? 2 : f.sun > 0.08 ? 1 : 0;
    s += `<rect x="${f1(X(i) + 1)}" y="${yWind}" width="${f1(cw - 2)}" height="${rowH}" rx="2" fill="${[C.paper, C.windPale, C.wind][wl]}" stroke="${wl ? 'none' : C.line}" stroke-width="0.6"/>`;
    s += `<rect x="${f1(X(i) + 1)}" y="${ySun}" width="${f1(cw - 2)}" height="${rowH}" rx="2" fill="${[C.paper, C.sunPale, C.sun][sl]}" stroke="${sl ? 'none' : C.line}" stroke-width="0.6"/>`;
  }
  // power made (bars) and power needed (line)
  s += `<path d="M${left} ${f1(y1)}H${w - right}" stroke="${C.ink2}" stroke-width="1"/>`;
  for (let i = 0; i < HOURS; i++) {
    const [wv, sv] = made[i]; const yw = Y(wv), ys = Y(wv + sv);
    if (wv > 0.01) s += `<rect x="${f1(X(i) + 2)}" y="${f1(yw)}" width="${f1(cw - 4)}" height="${f1(y1 - yw)}" fill="${C.wind}"/>`;
    if (sv > 0.01) s += `<rect x="${f1(X(i) + 2)}" y="${f1(ys)}" width="${f1(cw - 4)}" height="${f1(yw - ys)}" fill="${C.sun}"/>`;
  }
  let d = ''; for (let i = 0; i < HOURS; i++) d += `${i ? 'L' : 'M'}${f1(X(i))} ${f1(Y(need[i]))}H${f1(X(i) + cw)}`;
  s += `<path d="${d}" fill="none" stroke="${C.need}" stroke-width="2" stroke-linejoin="round"/>`;
  if (!junior) { const top2 = Math.round((max * KW) / 10) * 10; const half = Math.max(10, Math.round((max * KW) / 20) * 10); for (const v of [half, top2]) if (v / KW < max && (v === half || top2 > half)) s += `<text x="${left - 4}" y="${f1(Math.max(Y(v / KW) + 3, y0 + 7))}" font-size="8" fill="${C.ink2}" text-anchor="end">${v} kW</text><path d="M${left - 2} ${f1(Y(v / KW))}H${left + 3}" stroke="${C.ink2}"/>`; }
  // the battery, hour by hour so far
  if (hours.length && kit.cap) {
    let b = `M${f1(X(0))} ${f1(Y((hours[0].levelBefore / kit.cap) * max * 0.92))}`; hours.forEach((hr, i) => { b += `L${f1(X(i) + cw)} ${f1(Y((hr.level / kit.cap) * max * 0.92))}`; });
    s += `<path d="${b}" fill="none" stroke="${C.paper}" stroke-width="4" stroke-linejoin="round"/><path d="${b}" fill="none" stroke="${C.battery}" stroke-width="2" stroke-dasharray="5 2" stroke-linejoin="round"/>`;
  }
  // what happened: lit or dark, hour by hour
  s += `<text x="${left - 4}" y="${yLit + 9}" font-size="8.5" font-weight="700" fill="${C.ink2}" text-anchor="end">${marks ? 'Short?' : junior ? 'Lights' : 'Lit'}</text>`;
  for (let i = 0; i < HOURS && marks; i++) s += `<rect x="${f1(X(i) + 1)}" y="${yLit}" width="${f1(cw - 2)}" height="${litH}" rx="2" fill="${marks[i] ? C.dark : C.paper}" stroke="${marks[i] ? 'none' : C.line}" stroke-width="0.6"/>`;
  for (const i of rings || []) s += `<rect x="${f1(X(i) + 0.5)}" y="${top - 1}" width="${f1(cw - 1)}" height="${f1(yLit + litH - top + 2)}" rx="3" fill="none" stroke="#e8772e" stroke-width="2" stroke-dasharray="3 2"/>`;
  for (let i = 0; i < HOURS && !marks; i++) {
    const hr = hours[i];
    if (!hr) { s += `<rect x="${f1(X(i) + 1)}" y="${yLit}" width="${f1(cw - 2)}" height="${litH}" rx="2" fill="${C.paper}" stroke="${C.line}" stroke-width="0.6"/>`; continue; }
    const bad = hr.dark > 0 || !hr.schoolLit;
    s += `<rect x="${f1(X(i) + 1)}" y="${yLit}" width="${f1(cw - 2)}" height="${litH}" rx="2" fill="${bad ? C.dark : C.lit}"${i === mark ? ` stroke="${C.need}" stroke-width="2"` : ''}/>`;
    if (bad) s += `<text x="${f1(X(i) + cw / 2)}" y="${yLit + 8.6}" font-size="8" font-weight="800" fill="#fff" text-anchor="middle">${hr.dark > 0 ? hr.dark : 'S'}</text>`;
  }
  if (labels) for (let i = 0; i < HOURS; i += 3) s += `<text x="${f1(X(i) + cw / 2)}" y="${h - 3}" font-size="8.5" font-weight="700" fill="${C.ink2}" text-anchor="middle">${esc(clockShort(fc[i].clock, junior))}${junior ? (fc[i].clock < 12 ? 'am' : 'pm') : ''}</text>`;
  if (cursor >= 0 && cursor < HOURS) s += `<rect x="${f1(X(cursor) - 0.5)}" y="${top - 2}" width="${f1(cw + 1)}" height="${f1(yLit + litH - top + 4)}" rx="4" fill="none" stroke="${C.ink}" stroke-width="2.2"/>`;
  return s + '</g>';
}
// The same, as a whole picture for the desk and the results.
export function daySvg(kit, dayId, opts = {}) {
  const w = opts.w || 440, h = opts.h || 150;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opts.label || 'The day, hour by hour')}">${dayPanel(kit, dayId, { ...opts, w, h })}</svg>`;
}
const key = (x, y, junior) => `<g transform="translate(${x} ${y})" font-family="${FONT}" font-size="9" font-weight="700" fill="${C.ink2}">
<rect x="0" y="-8" width="10" height="10" fill="${C.wind}"/><text x="14" y="1">wind</text><rect x="46" y="-8" width="10" height="10" fill="${C.sun}"/><text x="60" y="1">sun</text>
<path d="M88 -3H104" stroke="${C.need}" stroke-width="2.5"/><text x="108" y="1">${junior ? 'power needed' : 'demand'}</text><path d="M${junior ? 178 : 150} -3h16" stroke="${C.battery}" stroke-width="2.5" stroke-dasharray="5 2"/><text x="${junior ? 198 : 170}" y="1">battery</text>
<rect x="${junior ? 240 : 212}" y="-8" width="10" height="10" rx="2" fill="${C.lit}"/><text x="${junior ? 254 : 226}" y="1">lit</text><rect x="${junior ? 274 : 246}" y="-8" width="10" height="10" rx="2" fill="${C.dark}"/><text x="${junior ? 288 : 260}" y="1">homes dark</text><rect x="${junior ? 344 : 316}" y="-8" width="10" height="10" rx="2" fill="${C.dark}"/><text x="${junior ? 346.5 : 318.5}" y="0" font-size="7.5" fill="#fff">S</text><text x="${junior ? 358 : 330}" y="1">school dark</text></g>`;
export const legend = (junior) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 418 14" role="img" aria-label="Key">${key(2, 10, junior)}</svg>`;

// The take-home chart: the three test days under the child's rules. days: from rules.testRules(kit, rules).days
export function picture(kit, days, junior = true, seed = 1) {
  const W = 440, ph = 112, head = 16, H = 26 + days.length * (ph + head) + 4;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Three test days run by the rules"><rect width="${W}" height="${H}" fill="${C.paper}"/>${key(36, 14, junior)}`;
  days.forEach((d, n) => {
    const y = 24 + n * (ph + head);
    s += `<text x="34" y="${y + 11}" font-family="${FONT}" font-size="11" font-weight="800" fill="${C.ink}">${esc(junior ? T.day[d.dayId].j : T.day[d.dayId].s)}</text><text x="${W - 6}" y="${y + 11}" font-family="${FONT}" font-size="10" font-weight="700" fill="${C.ink2}" text-anchor="end">${d.litHours} of ${d.total} ${esc(junior ? T.litHours.j : T.litHours.s)}</text>`;
    s += dayPanel(kit, d.dayId, { x: 0, y: y + head - 2, w: W, h: ph, hours: d.hours, junior, seed, labels: n === days.length - 1 });
  });
  return s + '</svg>';
}

// A dial for the desk: a half ring with a needle. The page turns the needle (see index.js); this is its still shape.
export function dialSvg(id, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 62" aria-hidden="true"><path d="M10 54A40 40 0 0 1 90 54" fill="none" stroke="#e6d3b0" stroke-width="11" stroke-linecap="round"/><path class="pw-arc" data-arc="${id}" d="M10 54A40 40 0 0 1 90 54" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round" stroke-dasharray="125.7" stroke-dashoffset="125.7"/><g class="pw-needle" data-needle="${id}" transform="rotate(-90 50 54)"><path d="M50 54L50 20" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round"/></g><circle cx="50" cy="54" r="5.5" fill="${C.ink}"/></svg>`;
}
export { TEST_DAYS };

// The take-home picture for the whole hour: the six missions, each with a bar for how it went (steps level, homes
// lit, and so on). p: the progress (missions.js).
export function hourPicture(p, junior = true) {
  const r = p.res || {}; const W = 440, row = 34, H = 34 + 6 * row;
  const share = [
    r.balance ? r.balance.level / Math.max(1, r.balance.of) : 1, 1,
    r.storage ? 1 - r.storage.dark.reduce((a, b) => a + b, 0) / Math.max(1, 3 * r.storage.total) : 1,
    r.rules ? r.rules.share / 100 : 1, 1, 1,
  ];
  const stat = [
    r.balance ? `${r.balance.level} of ${r.balance.of} level` : 'done', junior ? 'short hours found' : 'shortfalls found',
    junior ? 'goal met each day' : `${Math.round(share[2] * 100)}% supplied`, junior ? 'tested on 3 days' : `${Math.round(share[3] * 100)}% supplied`, junior ? 'greener times' : 'least gas', junior ? 'everyone back' : 'all restored',
  ];
  const names = [junior ? 'Balance the grid' : 'Grid balance', 'Forecasting', 'Storage', 'Automation rules', 'Smart demand', 'Storm night'];
  const icons = ['⚖️', '🌦️', '🔋', '📋', '🔌', '⛈️'];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Six control-room missions"><rect width="${W}" height="${H}" rx="10" fill="${C.paper}"/>`;
  s += `<text x="16" y="22" font-family="${FONT}" font-size="13" font-weight="800" fill="${C.ink}">⚡ Power control room: six missions</text>`;
  for (let i = 0; i < 6; i++) {
    const y = 30 + i * row; const done = !!p.done?.[i]; const k = Math.max(0, Math.min(1, share[i]));
    s += `<text x="14" y="${y + 21}" font-size="16">${icons[i]}</text><text x="40" y="${y + 20}" font-family="${FONT}" font-size="11.5" font-weight="800" fill="${C.ink}">${i + 1}. ${esc(names[i])}</text>`;
    s += `<rect x="178" y="${y + 9}" width="130" height="14" rx="7" fill="${C.dark}"/><rect x="178" y="${y + 9}" width="${f1(done ? 130 * k : 0)}" height="14" rx="7" fill="${C.lit}"/>`;
    s += `<text x="${W - 10}" y="${y + 20}" font-family="${FONT}" font-size="10.5" font-weight="700" fill="${C.ink2}" text-anchor="end">${done ? `✓ ${esc(stat[i])}` : '–'}</text>`;
  }
  return s + '</svg>';
}
