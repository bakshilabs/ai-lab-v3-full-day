// Mission 3, "Rules of the road": seven places for ages 8–12 (a zebra crossing, the school, a cyclist, no room to
// pass, rain, a corner, an ambulance) and an icy road as well for ages 13–17. For each, choose what the car does and
// test it in a short top-down scene; then read the settings back as the car's rules. Rules and words: rules.js.
//
// The pictures follow UK traffic, which drives on the left. North is at the top (the homes); our car drives east
// (left to right) in the north lane, so the kerb on its left is the north kerb. Oncoming traffic drives west in the
// south lane. A left turn from our lane goes north, into the side road between the homes.
import { scenesFor, optOf, resultSay, stopM, M3 } from './rules.js';
import { esc, secs } from './kit.js';

const W = 800, H = 420, LANE = 166, OTHER = 256, KERB_N = 124, KERB_S = 300;
const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
const ease = (t) => 1 - (1 - Math.max(0, Math.min(1, t))) ** 2;
const car = (x, y, c = '#2f6fd8', turn = 0, us = false) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn})"><rect x="-34" y="-17" width="68" height="34" rx="9" fill="${c}" stroke="#1f1a17" stroke-width="2"/><rect x="2" y="-13" width="18" height="26" rx="4" fill="#bfe6ff"/><rect x="-24" y="-13" width="12" height="26" rx="3" fill="#bfe6ff"/>${us ? '<circle cx="-6" cy="0" r="7" fill="#ffd166" stroke="#1f1a17" stroke-width="1.5"/>' : ''}</g>`;
const ambulance = (x, y, flash) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><rect x="-44" y="-19" width="88" height="38" rx="7" fill="#f6f3ea" stroke="#1f1a17" stroke-width="2"/><rect x="-44" y="-4" width="88" height="8" fill="#2f9e55"/><rect x="-6" y="-14" width="6" height="28" fill="#d8261c"/><rect x="-17" y="-3" width="28" height="6" fill="#d8261c"/><rect x="22" y="-15" width="16" height="30" rx="3" fill="#bfe6ff"/><circle cx="16" cy="-15" r="6" fill="${flash ? '#3b8bff' : '#1b3f8a'}"/><circle cx="16" cy="15" r="6" fill="${flash ? '#1b3f8a' : '#3b8bff'}"/></g>`;
const person = (x, y, c = '#b23a26', small = false) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${small ? 0.75 : 1})"><ellipse rx="11" ry="8" fill="${c}" stroke="#1f1a17" stroke-width="1.5"/><circle r="7" fill="#e0ac7e" stroke="#1f1a17" stroke-width="1.5"/></g>`;
const bike = (x, y, wob = 0) => `<g transform="translate(${x.toFixed(1)} ${(y + wob).toFixed(1)})"><rect x="-22" y="-3" width="44" height="6" rx="3" fill="#2a2f35"/><ellipse rx="9" ry="10" fill="#7a4fb0" stroke="#1f1a17" stroke-width="1.5"/><circle r="6" fill="#ffd166" stroke="#1f1a17" stroke-width="1.5"/></g>`;
const warn = (x, y) => `<g transform="translate(${x} ${y})"><circle r="20" fill="#c8553d" stroke="#fff" stroke-width="3"/><text y="8" font-size="26" font-weight="800" text-anchor="middle" fill="#fff">!</text></g>`;
const tick = (x, y) => `<g transform="translate(${x} ${y})"><circle r="20" fill="#1f7f49" stroke="#fff" stroke-width="3"/><path d="M-9 0 l6 7 l12 -14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>`;
const mark = (ok, x, y) => (ok ? tick(x, y) : warn(x, y));
const tag = (x, y, text) => `<rect x="${x - text.length * 4.6 - 8}" y="${y - 15}" width="${text.length * 9.2 + 16}" height="22" rx="6" fill="#3b2a1e"/><text x="${x}" y="${y + 1}" font-size="15" font-weight="800" text-anchor="middle" fill="#fff">${text}</text>`;
function road(id, j, done = false) {
  const o = [`<rect width="${W}" height="${H}" fill="#cfe6b8"/><rect y="96" width="${W}" height="28" fill="#e6dcc8"/><rect y="${KERB_S}" width="${W}" height="28" fill="#e6dcc8"/><rect y="${KERB_N}" width="${W}" height="${KERB_S - KERB_N}" fill="#6b7178"/>`];
  for (let x = 10; x < W; x += 60) o.push(`<rect x="${x}" y="209" width="34" height="4" fill="#f6f3ea"/>`);
  for (let x = 20; x < W; x += 130) if (!(id === 'turn' && x > 500 && x < 700)) o.push(`<rect x="${x}" y="22" width="90" height="62" fill="${['#e9c9a0', '#d98b5f', '#f2dcb0'][(x / 130) % 3 | 0]}" stroke="#9a6a4a" stroke-width="2"/><path d="M${x - 6} 26 L${x + 45} 4 L${x + 96} 26z" fill="#b5523b"/>`);
  // which way the traffic goes: an arrow in each lane (UK: drive on the left)
  o.push(`<g fill="#f6f3ea" opacity=".75"><path d="M40 ${LANE - 6} h26 v-6 l14 12 l-14 12 v-6 h-26z"/><path d="M${W - 40} ${OTHER - 6} h-26 v-6 l-14 12 l14 12 v-6 h26z"/></g>`);
  if (id === 'zebra') { for (let i = 0; i < 9; i++) o.push(`<rect x="560" y="${128 + i * 19.5}" width="44" height="11" fill="#fff"/>`); o.push('<rect x="548" y="88" width="6" height="36" fill="#2a2f35"/><circle cx="551" cy="86" r="9" fill="#ffb000"/><rect x="610" y="88" width="6" height="36" fill="#2a2f35"/><circle cx="613" cy="86" r="9" fill="#ffb000"/>'); }
  if (id === 'school') {
    o.push('<rect x="560" y="336" width="200" height="70" fill="#f2b8a0" stroke="#9a6a4a" stroke-width="2"/><text x="660" y="380" font-size="24" font-weight="800" text-anchor="middle" fill="#3b2a1e">SCHOOL</text>');
    if (j && done) o.push('<g transform="translate(470 345)"><rect x="-3" y="0" width="6" height="40" fill="#8a9099"/><circle cy="-6" r="20" fill="#fff" stroke="#d8261c" stroke-width="6"/><text y="2" font-size="18" font-weight="800" text-anchor="middle">20</text></g>');
    for (const x of [380, 470, 650, 740]) o.push(car(x, 143, ['#c8553d', '#3d6e8a', '#5a6d50', '#e6a15a'][(x / 90) % 4 | 0]));   // parked on the north kerb
  }
  if (id === 'turn') o.push(`<rect x="560" y="0" width="110" height="${KERB_N}" fill="#6b7178"/><rect x="548" y="0" width="12" height="96" fill="#e6dcc8"/><rect x="670" y="0" width="12" height="96" fill="#e6dcc8"/>`);
  if (id === 'rain' || id === 'ice') o.push(id === 'ice' ? `<rect y="${KERB_N}" width="${W}" height="${KERB_S - KERB_N}" fill="#dff3ff" opacity=".35"/>` : `<g stroke="#e8f2f8" stroke-width="2" opacity=".55">${Array.from({ length: 60 }, (_, i) => `<line x1="${(i * 137) % W}" y1="${(i * 89) % H}" x2="${(i * 137) % W - 6}" y2="${(i * 89) % H + 18}"/>`).join('')}</g>`);
  return o.join('');
}
// the scene at progress p (0: before the test, 1: the end). v: the chosen setting, or null before a choice.
// An unsafe test ends frozen at the moment of the near miss, with the marker beside the person or vehicle at risk.
export function scenePic(id, v, p, safe, j = false) {
  const done = p >= 1 && v !== null; const o = [road(id, j, done)];   // the 20 sign shows only after the test, so it does not give the answer away
  if (id === 'zebra') {
    // the person waits on the north pavement and crosses south; our car comes along the north lane
    const stop = v === 'stop'; const cx = stop ? lerp(80, 500, ease(p / 0.6)) : lerp(80, 596, ease(p));
    const py = stop ? lerp(110, 316, (p - 0.6) / 0.4) : p > 0.55 ? lerp(132, 104, (p - 0.55) / 0.2) : lerp(110, 132, (p - 0.3) / 0.25);
    o.push(car(cx, LANE, '#2f6fd8', 0, true), person(582, py));
    if (done) o.push(mark(safe, 630, stop ? 330 : 104));
  }
  if (id === 'school') {
    // the child steps out between parked cars when the car's front is 12 m away (8 px a metre); the car then needs its stopping distance
    const need = stopM(v ?? 20); const childX = 560, react = childX - 96, stopFront = react + need * 8;
    const endFront = v !== null && !safe ? childX - 14 : stopFront;            // unsafe: frozen at the near miss
    const cx = p < 0.35 ? lerp(60, react - 34, p / 0.35) : lerp(react - 34, endFront - 34, ease((p - 0.35) / 0.45));
    const childY = p > 0.3 ? lerp(112, 178, (p - 0.3) / 0.12) : 112;
    o.push(car(cx, 186, '#2f6fd8', 0, true), person(childX, childY, '#e0a020', true));
    if (p > 0.35 && v !== null) {
      o.push(`<line x1="${react}" y1="226" x2="${childX}" y2="226" stroke="#ffd166" stroke-width="3" stroke-dasharray="6 5"/>${tag((react + childX) / 2, 246, j ? 'room to stop' : 'room: 12 m')}`);
      if (p > 0.6) o.push(`<line x1="${react}" y1="270" x2="${lerp(react, stopFront, ease((p - 0.6) / 0.3))}" y2="270" stroke="${safe ? '#6dff9e' : '#ff8a70'}" stroke-width="6"/>${tag(react + 70, 290, j ? (safe ? 'stops in time' : 'needs more room') : `needs ${need} m`)}`);
    }
    if (done) o.push(mark(safe, childX + 36, 150));
  }
  if (id === 'cyclist' || id === 'narrow') {
    // the cyclist rides by the north kerb; our car passes on the cyclist's right (south). The test ends level with the cyclist.
    const by = 142; const bx = lerp(260, 470, p); const wait = id === 'narrow' && v === 'wait';
    const passing = wait ? (p < 0.6 ? lerp(60, 330, p / 0.6) : lerp(330, 470, (p - 0.6) / 0.4)) : lerp(60, 470, ease(p));
    const gap = id === 'narrow' ? (wait ? 1.5 : 0.6) : v ?? 1.5; const lateral = by + 27 + gap * 30;
    const dist = Math.abs(passing - bx); const near = dist < 70; const cy = wait && p < 0.6 ? LANE : near ? lateral : lerp(LANE, lateral, 1 - Math.min(1, (dist - 70) / 90));
    const ox = id === 'narrow' ? (wait ? lerp(820, -100, p / 0.6) : lerp(820, 470, p)) : null;
    const wob = !safe && v !== null && near ? Math.sin(p * 60) * 4 : 0;
    o.push(bike(bx, by, wob));
    if (ox !== null && ox > -90) o.push(car(ox, wait ? OTHER : Math.max(OTHER, lateral + 40), '#c8553d', 180));
    o.push(car(passing, cy, '#2f6fd8', 0, true));
    if (near && v !== null) o.push(`<line x1="${bx}" y1="${by + 10}" x2="${bx}" y2="${cy - 17}" stroke="#ffd166" stroke-width="3"/>${tag(bx - 40, (by + cy) / 2 + 4, `${gap} m`)}`);
    if (done) o.push(mark(safe, bx + 50, 108));
  }
  if (id === 'rain' || id === 'ice') {
    const gapPx = { 1: 40, 2: 80, 4: 160, 10: 200, 20: 260 }[v] ?? 80; const lead = p < 0.3 ? lerp(380, 560, p / 0.3) : lerp(560, 640, ease((p - 0.3) / 0.3));
    // both cars brake; what is left of the gap at the end
    const left = (id === 'ice' ? { 4: 0, 10: 8, 20: 70 } : { 1: 0, 2: 8, 4: 70 })[v] ?? 70; const endBack = 640 - 68 - left; const startBack = 380 - 68 - gapPx;
    const back = p < 0.3 ? lerp(startBack, startBack + 180, p / 0.3) : lerp(startBack + 180, endBack, ease((p - 0.3) / 0.6));
    o.push(car(lead, LANE, '#c8553d'), car(back, LANE, '#2f6fd8', 0, true));
    if (p > 0.3) o.push(`<rect x="${lead - 38}" y="152" width="6" height="28" fill="#ff3b2f"/>`);
    if (p > 0.95 && v !== null) o.push(tag((back + 34 + lead - 34) / 2, 214, left > 10 ? (j ? 'room left' : 'gap left') : left ? 'only just' : (j ? 'no room!' : 'no gap')));
    if (done) o.push(mark(safe, 640, 108));
  }
  if (id === 'turn') {
    // a left turn: from the north lane into the side road going north. The person crosses the mouth of the side road.
    const giveWay = v === 'person'; const py = 110;
    const px = giveWay ? lerp(530, 700, p / 0.55) : lerp(530, 700, Math.min(p, 0.55) / 0.9);
    let x, y, a;
    const t = giveWay ? (p < 0.55 ? 0 : (p - 0.55) / 0.45) : p;
    if (giveWay && p < 0.55) { x = lerp(60, 500, ease(p / 0.45)); y = LANE; a = 0; }
    else if (t < 0.6) { x = lerp(giveWay ? 500 : 60, 590, t / 0.6); y = LANE; a = 0; }
    else { const q = Math.min(1, (t - 0.6) / 0.4) * (giveWay ? 1 : 0.55); a = -90 * q; x = 590 + 25 * Math.sin((q * Math.PI) / 2); y = LANE - 25 * (1 - Math.cos((q * Math.PI) / 2)) - q * 30; }
    o.push(car(x, y, '#2f6fd8', a, true), person(px, py));
    if (done) o.push(mark(safe, px + 34, 72));
  }
  if (id === 'ambulance') {
    const flash = Math.floor(p * 16) % 2 === 0;
    let cx = lerp(140, 520, ease(p)), cy = LANE, ax = lerp(-80, 380, p), ay = LANE;
    if (v === 'stop') { cx = lerp(140, 400, ease(p / 0.5)); ax = Math.min(lerp(-80, 400, p), cx - 96); }
    if (v === 'keep') { cx = lerp(140, 620, p); ax = cx - 100; }
    if (v === 'pull') { cx = lerp(140, 400, ease(p / 0.55)); cy = lerp(LANE, 142, (p - 0.2) / 0.35); ax = lerp(-80, 720, p); ay = p > 0.35 ? lerp(LANE, 186, (p - 0.35) / 0.15) : LANE; }
    o.push(car(cx, cy, '#2f6fd8', 0, true), ambulance(ax, ay, flash));
    if (done) o.push(mark(safe, v === 'pull' ? ax : ax + 10, 236));
  }
  return o.join('');
}

export async function rulesMission(K) {
  const { j, pick, say, swap, tray, stage } = K; let first = 0; const chosen = {}; const SCENES = scenesFor(j);
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i]; let v = null, misses = 0;
    K.ctx.report({ stage: `Mission 3: ${sc.title.s} (${i + 1} of ${SCENES.length})` });
    const pic = (val, p, safe) => `<svg class="rd-pic" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(pick(sc.title))}, seen from above" font-family="Inter, Arial, sans-serif">${scenePic(sc.id, val, p, safe, j)}</svg>`;
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
