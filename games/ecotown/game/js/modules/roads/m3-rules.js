// Mission 3, "Rules of the road": six places (a zebra crossing, the school, a cyclist, no room to pass, rain, a
// corner). For each, choose what the car does and test it in a short top-down scene; then read the settings back as
// the car's rules. Rules and words: rules.js.
import { SCENES, optOf, resultSay, stopM, M3 } from './rules.js';
import { esc, secs } from './kit.js';

const W = 800, H = 420, LANE = 255, OTHER = 168;
const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
const ease = (t) => 1 - (1 - Math.max(0, Math.min(1, t))) ** 2;
const car = (x, y, c = '#2f6fd8', turn = 0, us = false) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn})"><rect x="-34" y="-17" width="68" height="34" rx="9" fill="${c}" stroke="#1f1a17" stroke-width="2"/><rect x="2" y="-13" width="18" height="26" rx="4" fill="#bfe6ff"/><rect x="-24" y="-13" width="12" height="26" rx="3" fill="#bfe6ff"/>${us ? '<circle cx="-6" cy="0" r="7" fill="#ffd166" stroke="#1f1a17" stroke-width="1.5"/>' : ''}</g>`;
const person = (x, y, c = '#b23a26', small = false) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${small ? 0.75 : 1})"><ellipse rx="11" ry="8" fill="${c}" stroke="#1f1a17" stroke-width="1.5"/><circle r="7" fill="#e0ac7e" stroke="#1f1a17" stroke-width="1.5"/></g>`;
const bike = (x, y, wob = 0) => `<g transform="translate(${x.toFixed(1)} ${(y + wob).toFixed(1)})"><rect x="-22" y="-3" width="44" height="6" rx="3" fill="#2a2f35"/><ellipse rx="9" ry="10" fill="#7a4fb0" stroke="#1f1a17" stroke-width="1.5"/><circle r="6" fill="#ffd166" stroke="#1f1a17" stroke-width="1.5"/></g>`;
const warn = (x, y) => `<g transform="translate(${x} ${y})"><circle r="20" fill="#c8553d" stroke="#fff" stroke-width="3"/><text y="8" font-size="26" font-weight="800" text-anchor="middle" fill="#fff">!</text></g>`;
const tick = (x, y) => `<g transform="translate(${x} ${y})"><circle r="20" fill="#1f7f49" stroke="#fff" stroke-width="3"/><path d="M-9 0 l6 7 l12 -14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>`;
function road(id) {
  const o = [`<rect width="${W}" height="${H}" fill="#cfe6b8"/><rect y="96" width="${W}" height="28" fill="#e6dcc8"/><rect y="300" width="${W}" height="28" fill="#e6dcc8"/><rect y="124" width="${W}" height="176" fill="#6b7178"/>`];
  for (let x = 10; x < W; x += 60) o.push(`<rect x="${x}" y="209" width="34" height="4" fill="#f6f3ea"/>`);
  for (let x = 20; x < W; x += 130) o.push(`<rect x="${x}" y="22" width="90" height="62" fill="${['#e9c9a0', '#d98b5f', '#f2dcb0'][(x / 130) % 3 | 0]}" stroke="#9a6a4a" stroke-width="2"/><path d="M${x - 6} 26 L${x + 45} 4 L${x + 96} 26z" fill="#b5523b"/>`);
  if (id === 'zebra') for (let i = 0; i < 9; i++) o.push(`<rect x="560" y="${128 + i * 19.5}" width="44" height="11" fill="#fff"/>`), o.push('<rect x="548" y="88" width="6" height="36" fill="#2a2f35"/><circle cx="551" cy="86" r="9" fill="#ffb000"/><rect x="610" y="88" width="6" height="36" fill="#2a2f35"/><circle cx="613" cy="86" r="9" fill="#ffb000"/>');
  if (id === 'school') { o.push('<rect x="560" y="336" width="200" height="70" fill="#f2b8a0" stroke="#9a6a4a" stroke-width="2"/><text x="660" y="380" font-size="24" font-weight="800" text-anchor="middle" fill="#3b2a1e">SCHOOL</text><g transform="translate(470 345)"><rect x="-3" y="0" width="6" height="40" fill="#8a9099"/><circle cy="-6" r="20" fill="#fff" stroke="#d8261c" stroke-width="6"/><text y="2" font-size="18" font-weight="800" text-anchor="middle">20</text></g>'); for (const x of [380, 470, 650, 740]) o.push(car(x, 284, ['#c8553d', '#3d6e8a', '#5a6d50', '#e6a15a'][(x / 90) % 4 | 0])); }
  if (id === 'turn') o.push('<rect x="560" y="300" width="110" height="120" fill="#6b7178"/><rect x="548" y="300" width="12" height="120" fill="#e6dcc8"/><rect x="670" y="300" width="12" height="120" fill="#e6dcc8"/>');
  if (id === 'rain') o.push(`<g stroke="#e8f2f8" stroke-width="2" opacity=".55">${Array.from({ length: 60 }, (_, i) => `<line x1="${(i * 137) % W}" y1="${(i * 89) % H}" x2="${(i * 137) % W - 6}" y2="${(i * 89) % H + 18}"/>`).join('')}</g>`);
  return o.join('');
}
// the scene at progress p (0: before the test, 1: the end). v: the chosen setting, or null before a choice.
export function scenePic(id, v, p, safe) {
  const o = [road(id)]; const done = p >= 1;
  if (id === 'zebra') {
    const stop = v === 'stop'; const cx = stop ? lerp(80, 500, ease(p / 0.6)) : lerp(80, 860, p);
    const py = stop ? lerp(110, 316, (p - 0.6) / 0.4) : p > 0.45 && p < 0.75 ? 104 : 110;
    o.push(person(582, py), car(cx, LANE, '#2f6fd8', 0, true));
    if (done && v !== null) o.push(safe ? tick(582, 60) : warn(582, 60));
  }
  if (id === 'school') {
    const stopAt = 504 + stopM(v ?? 20) * 8; const childY = lerp(300, 262, (p - 0.35) / 0.15);
    const cx = p < 0.35 ? lerp(80, 504, p / 0.35) : lerp(504, Math.min(stopAt, 578), ease((p - 0.35) / 0.45));
    o.push(person(600, p > 0.3 ? childY : 300, '#e0a020', true), car(cx, 240, '#2f6fd8', 0, true));
    if (p > 0.35 && v !== null) o.push(`<line x1="504" y1="214" x2="600" y2="214" stroke="#ffd166" stroke-width="3" stroke-dasharray="6 5"/><text x="552" y="206" font-size="16" font-weight="800" text-anchor="middle" fill="#fff">12 m</text>`);
    if (done && v !== null) o.push(safe ? tick(600, 196) : warn(600, 196));
  }
  if (id === 'cyclist' || id === 'narrow') {
    const by = 278; const bx = lerp(260, 470, p); const passing = id === 'narrow' && v === 'wait' ? lerp(60, 760, Math.max(0, (p - 0.45) / 0.55) ** 1.1) : lerp(60, 760, p);
    const gap = id === 'narrow' ? (v === 'wait' ? 1.5 : 0.6) : v ?? 1.5; const lateral = by - 26 - gap * 30;
    const near = Math.abs(passing - bx) < 70; const cy = near ? lateral : lerp(LANE, lateral, 1 - Math.min(1, (Math.abs(passing - bx) - 70) / 80));
    const hold = id === 'narrow' && v === 'wait' && p < 0.45 ? lerp(60, bx - 110, p / 0.45) : null;
    const ox = id === 'narrow' ? lerp(820, -60, p) : null;
    const wob = !safe && v !== null && near ? Math.sin(p * 60) * 4 : 0;
    o.push(bike(bx, by, wob));
    if (ox !== null) o.push(car(ox, OTHER, '#c8553d', 180));
    o.push(car(hold ?? passing, hold !== null ? LANE : cy, '#2f6fd8', 0, true));
    if (near && v !== null) o.push(`<line x1="${bx}" y1="${by - 12}" x2="${bx}" y2="${cy + 17}" stroke="#ffd166" stroke-width="3"/><text x="${bx + 8}" y="${(by + cy) / 2 + 2}" font-size="16" font-weight="800" fill="#fff">${gap} m</text>`);
    if (done && v !== null) o.push(safe ? tick(bx, 330) : warn(bx, 330));
  }
  if (id === 'rain') {
    const gapPx = { 1: 40, 2: 80, 4: 160 }[v] ?? 80; const lead = p < 0.3 ? lerp(380, 560, p / 0.3) : lerp(560, 600, ease((p - 0.3) / 0.3));
    // both cars brake; on the wet road ours needs about twice as far, so what is left of the gap at the end is:
    const left = { 1: 0, 2: 8, 4: 70 }[v] ?? 70; const endBack = 600 - 68 - left; const startBack = 380 - 68 - gapPx;
    const back = p < 0.3 ? lerp(startBack, startBack + 180, p / 0.3) : lerp(startBack + 180, endBack, ease((p - 0.3) / 0.6));
    o.push(car(lead, LANE, '#c8553d'), car(back, LANE, '#2f6fd8', 0, true));
    if (p > 0.3) o.push('<rect x="625" y="241" width="6" height="28" fill="#ff3b2f"/>');
    if (done && v !== null) o.push(safe ? tick(600, 330) : warn(600, 330));
  }
  if (id === 'turn') {
    const px = lerp(540, 690, v === 'person' ? p / 0.55 : p < 0.35 ? p / 0.6 : 0.58); const py = 352;
    let x, y, a;
    const go = v === 'person' ? Math.max(0, (p - 0.55) / 0.45) : p;
    if (v === 'person' && p < 0.55) { x = lerp(60, 500, ease(p / 0.45)); y = LANE; a = 0; }
    else { const t = v === 'person' ? go : p; if (t < 0.55) { x = lerp(v === 'person' ? 500 : 60, 590, t / 0.55); y = LANE; a = 0; } else { const q = (t - 0.55) / 0.45; a = 90 * q; x = 590 + 25 * Math.sin((q * Math.PI) / 2); y = LANE + 25 * (1 - Math.cos((q * Math.PI) / 2)) + q * 120; } }
    o.push(person(px, py), car(x, y, '#2f6fd8', a, true));
    if (done && v !== null) o.push(safe ? tick(615, 300) : warn(615, 300));
  }
  return o.join('');
}

export async function rulesMission(K) {
  const { j, pick, say, swap, tray, stage } = K; let first = 0; const chosen = {};
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i]; let v = null, misses = 0;
    K.ctx.report({ stage: `Mission 3: ${sc.title.s} (${i + 1} of ${SCENES.length})` });
    const pic = (val, p, safe) => `<svg class="rd-pic" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(pick(sc.title))}, seen from above" font-family="Inter, Arial, sans-serif">${scenePic(sc.id, val, p, safe)}</svg>`;
    K.showStage(`<div class="rd-view"><div class="rd-viewbar"><b><span aria-hidden="true">${sc.icon}</span> ${esc(pick(sc.title))}</b><span class="rd-step">${i + 1} of ${SCENES.length}</span></div><div class="rd-frame">${pic(null, 0, true)}</div></div>`);
    const frame = stage.querySelector('.rd-frame');
    say(pick(sc.ask));
    for (;;) {
      swap(`<p class="rd-ask">${esc(pick(sc.ask))}</p><div class="rd-row rd-opts" role="radiogroup" aria-label="${esc(pick(sc.title))}">${sc.opts.map((o, n) => `<button type="button" role="radio" data-opt="${o.v}" aria-checked="${String(o.v) === String(v)}"><span class="rd-key" aria-hidden="true">${n + 1}</span>${esc(pick(o))}</button>`).join('')}</div>
        <div class="rd-row end"><p class="rd-hint" aria-live="polite"></p><button class="go" type="button" data-primary data-act="test" ${v === null ? 'disabled' : ''}>Test it ▶</button></div>`);
      const hint = tray.querySelector('.rd-hint');
      const choose = (val) => { v = sc.opts.find((o) => String(o.v) === String(val)).v; for (const b of tray.querySelectorAll('[data-opt]')) b.setAttribute('aria-checked', String(b.dataset.opt === String(v))); tray.querySelector('[data-act="test"]').disabled = false; frame.innerHTML = pic(v, 0, true); };
      K.onKey = (e) => { const d = '1234'.indexOf(e.key); if (d >= 0 && d < sc.opts.length) { choose(sc.opts[d].v); return true; } return false; };
      if (misses) hint.textContent = resultSay(sc, v, Math.min(3, misses), j);
      await new Promise((res) => { tray.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled || K.tooSoon(e)) return; if (b.dataset.opt !== undefined) choose(b.dataset.opt); if (b.dataset.act === 'test') { tray.onclick = null; res(); } }; });
      K.onKey = null;
      // the test: a short scene, or (reduced motion) its last picture
      const safe = sc.safe(v);
      if (!K.reduce) {
        swap(`<div class="rd-row end"><p class="rd-cap">${j ? 'Testing…' : 'Running the test…'}</p><button type="button" data-primary data-act="skip">Skip ▶▶</button></div>`);
        const t0 = secs(); const DUR = 4.2;
        await new Promise((done) => { K.anim = (real) => { const p = Math.min(1, (real - t0) / DUR); frame.innerHTML = pic(v, p, safe); if (p >= 1) { K.anim = null; done(); } }; tray.onclick = (e) => { if (e.target.closest('[data-act="skip"]') && !K.tooSoon(e)) { K.anim = null; tray.onclick = null; done(); } }; });
      }
      frame.innerHTML = pic(v, 1, safe);
      if (safe) break;
      misses++; K.ctx.say(resultSay(sc, v, Math.min(3, misses), j));
    }
    if (!misses) first++; chosen[sc.id] = v;
    say(`${resultSay(sc, v, 0, j)} ${misses ? '' : (j ? 'Safe first time.' : 'Safe on the first test.')}`.trim(), pick(sc.rule));
    swap(`<div class="rd-row end"><p class="rd-hint">${esc(pick(sc.rule))}</p><button class="go" type="button" data-primary data-act="next">Next ➜</button></div>`);
    await K.press();
  }
  // the settings, read back as rules
  K.ctx.report({ stage: 'Mission 3: the car’s rules' });
  K.showStage(`<div class="rd-card wide"><h3>${j ? 'Our car’s rules' : 'The car’s rule set'}</h3><ol class="rd-rules">${SCENES.map((sc) => `<li><span aria-hidden="true">${sc.icon}</span> ${esc(pick(sc.rule))}</li>`).join('')}</ol></div>`);
  say(pick(M3.done));
  swap(`<div class="rd-row end"><button class="go" type="button" data-primary data-act="next">${j ? 'Load them into the car ➜' : 'Load the rules ➜'}</button></div>`);
  await K.press();
  return { rules: SCENES.length, first, chosen: Object.fromEntries(Object.entries(chosen).map(([k, x]) => [k, String(optOf(SCENES.find((s) => s.id === k), x).v)])) };
}
