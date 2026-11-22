// The interface that sits over the town, built from docs/redesign/ui/tokens.css and laid out as in docs/redesign/ui/screens.html:
// a top bar, one dock along the bottom with Florence at its left and the main button at the right end of her line,
// lettered flags standing in the town, plan cards, tap rings and the film's finger.
// Every word comes from words.js. draw(m, t, …) sets the whole interface for one moment of one part of the film, from
// the times in timeline.js; nothing is remembered from one frame to the next, and no CSS animation runs by the clock.
import { TEST, FLAGS } from './tests.js';
import { TAPS } from './town.js';
import { ABC, words } from './timeline.js';
import { clamp, span, lerp, outCubic, inCubic, inOutCubic, outBack, inQuad, springAt, SPRING, press, flyWord, pointerMs, pointerPath, hop, ring } from '../design/motion-curves.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MARK = { g: 'good', f: 'fair', p: 'poor' }, IDLE = [0, 1, 2, 3, 2, 1], REST = [1232, 318];
// the small pictures of the five checks and of the three jobs, as they are drawn in the mock-ups (pictures, not words)
const CHECK_SVG = {
  flood: '<svg viewBox="0 0 40 40"><path d="M4 16c4-4 7-4 11 0s7 4 11 0 7-4 10-1M4 27c4-4 7-4 11 0s7 4 11 0 7-4 10-1" fill="none" stroke="#1f2a44" stroke-width="3.6" stroke-linecap="round"/></svg>',
  walk: '<svg viewBox="0 0 40 40"><rect x="7" y="6" width="11" height="17" rx="5.5" fill="#ffd257" stroke="#1f2a44" stroke-width="3"/><rect x="8.5" y="26" width="8" height="6" rx="3" fill="#ffd257" stroke="#1f2a44" stroke-width="3"/><rect x="22" y="12" width="11" height="17" rx="5.5" fill="#ffd257" stroke="#1f2a44" stroke-width="3"/><rect x="23.5" y="32" width="8" height="5" rx="2.5" fill="#ffd257" stroke="#1f2a44" stroke-width="3"/></svg>',
  carbon: '<svg viewBox="0 0 40 40"><path d="M11 29h19a7.5 7.5 0 0 0 0-15 9.5 9.5 0 0 0-18-1 8 8 0 0 0-1 16z" fill="#fff" stroke="#1f2a44" stroke-width="3.2" stroke-linejoin="round"/></svg>',
  nature: '<svg viewBox="0 0 40 40"><path d="M8 32C8 16 18 8 33 7c0 15-8 25-25 25z" fill="#8fcf73" stroke="#1f2a44" stroke-width="3.2" stroke-linejoin="round"/><path d="M8 33L24 17" stroke="#1f2a44" stroke-width="3.2" stroke-linecap="round"/></svg>',
  winter: '<svg viewBox="0 0 40 40"><path d="M5 20L20 7l15 13" fill="none" stroke="#1f2a44" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 19v15h22V19" fill="#ffd257" stroke="#1f2a44" stroke-width="3.2" stroke-linejoin="round"/><path d="M20 23v7M16.5 26.5h7" stroke="#1f2a44" stroke-width="3" stroke-linecap="round"/></svg>',
};
const JOB_SVG = ['<svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 3a7 7 0 0 1 7 7c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 7-7z" fill="none" stroke="#fff" stroke-width="2.4"/><circle cx="12" cy="10" r="2.3" fill="#fff"/></svg>',
  '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M3 12l9-8 9 8M6 11v9h12v-9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M2 17h20M5 17V9M19 17V9M5 9c3 5 11 5 14 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>'];

export function makeUI(stageEl, D, ctx) {
  const root = stageEl.querySelector('.ui'), U = D.ui, T = D.towns[0], NL = T.levels.length, snapC = document.createElement('canvas'); snapC.width = 336; snapC.height = 192;
  let E = {};
  const q = (s) => root.querySelector(s), qa = (s) => [...root.querySelectorAll(s)];
  const on = (el, yes) => { if (el) el.style.display = yes ? '' : 'none'; return yes; }, cls = (el, name, yes) => el.classList.toggle(name, !!yes);
  const rect = (el) => { const s = stageEl.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / 1280; return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k }; };
  const mid = (el) => { const r = rect(el); return [r.x + r.w / 2, r.y + r.h / 2]; };
  // a surface that slides up into place at time a and drops away at time b
  const slide = (el, t, a, b = 1e9) => { const yes = t >= a && t < b + 0.2; on(el, yes); if (!yes) return false; const k = outCubic(span(t, a, a + 0.38)), o = inCubic(span(t, b, b + 0.2)); el.style.transform = `translateY(${(1 - k) * 28 + o * 24}px)`; el.style.opacity = k * (1 - o); return true; };
  const pop = (t, a, s = SPRING.pop) => lerp(0.6, 1, springAt(t, a, s));

  const florence = '<div class="flo"><i class="flo-shadow"></i><div class="flo-body"><i class="ui-florence"><b class="glow"></b><b class="eye e1"></b><b class="eye e2"></b><b class="dot d1"></b><b class="dot d2"></b><b class="dot d3"></b></i></div></div>';
  const bubble = '<div class="ui-bubble"><p><span class="t"></span><span class="ui-untyped"></span></p><small></small></div>';
  const top = (name, now) => `<div class="ui-top"><div class="ui-place"><b>1</b>${esc(T.name)}${name ? ` <strong>${esc(name)}</strong>` : ''}</div>${now === null ? '' : `<ol class="ui-progress">${T.levels.map((_, i) => `<li>${i + 1}</li>`).join('')}</ol>`}</div>`;
  const button = (id, label, extra = '') => `<button class="ui-btn ${extra}" data-b="${id}">${esc(label)}</button>`;

  function enter(m) {
    if (m.kind === 'open') root.innerHTML = `${top('', null)}<div class="ui-stage"><div class="ui-flag ui-flag--town"><b><i>1</i>${esc(T.name)}</b></div></div>
      <div class="ui-dock">${florence}<div class="ui-say">${bubble}<div class="ui-actions">${button('onward', U.onward)}${button('enter', U.enter)}</div></div>
      <div class="ui-tray checks"><h2 class="ui-heading">${esc(U.lensesTitle.replace('{n}', T.lenses.length))}</h2><div class="ui-checks">${T.lenses.map((l) => `<div class="ui-check">${CHECK_SVG[l[0]] || ''}<b>${esc(l[1])}</b><span>${esc(l[2])}</span></div>`).join('')}</div></div></div><i class="ui-pointer"></i>`;
    if (m.kind === 'end') root.innerHTML = `${top(T.levels[NL - 1].name, NL)}<div class="ui-panel"><h2 class="ui-heading">${esc(U.jobsTitle)}</h2><p>${esc(T.jobsLine)}</p>${T.jobs.map((j, i) => `<div class="ui-job"><i>${JOB_SVG[i % 3]}</i><span>${esc(j)}</span></div>`).join('')}<div class="ui-talk"><b>${esc(U.talkTitle)}</b>${esc(T.talk)}</div><p class="brk">${esc(U.breakLine)}</p></div><div class="ui-dock">${florence}</div><i class="ui-pointer"></i>`;
    if (m.kind === 'level') {
      const { v, li, ord } = m, gaps = v.s.filter(Array.isArray); let g = -1;
      const sentence = (small) => `<p class="ui-sentence${small ? ' ui-sentence--small' : ''}">${v.s.map((x, i) => { const end = i === v.s.length - 1 ? '.' : ''; return Array.isArray(x) ? `<span class="nb"><span class="ui-gap${small ? ' is-filled' : ''}" data-g="${++g}">${esc(x[x[0] + 1])}</span>${end}</span>` : esc(x) + end; }).join(' ')}</p>`;
      const rows = (d) => v.res.map((r) => `<div class="ui-result"><i class="ui-mark ui-mark--${MARK[r[d + 1][0]]}"></i><p>${esc(r[d + 1][1])}</p></div>`).join('');
      const card = (s) => { const d = ord[s]; return `<div class="ui-plan" data-s="${s}"><span class="ui-plan__tag">${esc(U.firstPlan)}</span><div class="ui-plan__head"><span class="ui-label yc">${esc(U.yourChoice)}</span><span class="ui-letter">${ABC[s]}</span><span class="ui-plan__name">${esc(v.sol[d][0])}</span><div class="ui-thumb"></div></div><p class="ui-plan__what">${esc(v.sol[d][1])}</p>${rows(d)}</div>`; };
      const F = v.pick, R = m.retry, fs = m.slotOf[F], rs = R === undefined ? 0 : m.slotOf[R];
      const two = R === undefined ? '' : `<div class="ui-plans ui-plans--two"><div class="ui-plan is-first"><span class="ui-plan__tag">${esc(U.firstPlan)}</span><div class="firstrow"><div class="ui-thumb"><span class="ui-letter">${ABC[fs]}</span><i class="ui-mark ui-mark--${MARK[m.mark[F]]}"></i></div><div class="firsttext"><div class="ui-plan__head"><span class="ui-plan__name">${esc(v.sol[F][0])}</span></div><p class="ui-plan__what">${esc(v.res[0][F + 1][1])}</p></div></div>${button('keepFirst', U.keepFirst, 'ui-btn--quiet')}</div>
        <div class="ui-plan is-chosen other"><span class="ui-plan__tag">${esc(U.otherPlan)}</span><div class="ui-plan__head"><span class="ui-letter">${ABC[rs]}</span><span class="ui-plan__name">${esc(v.sol[R][0])}</span></div>${rows(R)}${button('keepThis', U.keepThis, 'ui-btn--quiet')}</div></div>`;
      root.innerHTML = `${top(v.name, li)}<div class="ui-sign"><em>${li + 1}</em><div><small>${esc(T.name)}</small><strong>${esc(v.name)}</strong></div></div>
        <div class="ui-stage">${[0, 1, 2].map((d) => `<div class="ui-flag" data-d="${d}"><b>${ABC[m.slotOf[d]]}<i class="ui-mark ui-mark--${MARK[m.mark[d]]}"></i></b></div>`).join('')}${(v.point ? TAPS[li] : []).map((_, i) => `<i class="ui-tapring" data-r="${i}"></i>`).join('')}${v.point ? `<span class="ui-tag">${esc(v.point[1])}</span>` : ''}<span class="ui-chip ui-chip--fly"></span><div class="ui-thumb fly"></div></div>
        <div class="ui-dock">${florence}<div class="ui-say">${bubble}<div class="ui-actions">${button('again', U.again, 'ui-btn--quiet')}${button('tryOther', U.tryOther, 'ui-btn--quiet')}${button('start', U.start)}${button('ask', U.ask)}${button('use', U.use)}${button('use2', U.use)}${button('onward', U.onward)}${button('next', m.btn.next.label)}<button class="ui-btn ui-btn--test" data-b="test"><span class="ui-busy"><i></i><i></i><i></i></span><span>${esc(v.test)}</span></button>${v.askF ? `<button class="ui-chip ui-chip--big" data-yn="0">${esc(U.yes)}</button><button class="ui-chip ui-chip--big" data-yn="1">${esc(U.no)}</button>` : ''}</div></div>
        <div class="ui-tray sent"><p class="ui-how">${esc(m.how)}</p>${sentence(false)}${gaps.map((x, k) => `<div class="ui-chips" data-g="${k}">${x.slice(1).map((o, n) => `<button class="ui-chip" data-n="${n}">${esc(o)}</button>`).join('')}</div>`).join('')}</div>
        <div class="ui-tray ui-tray--flat flat"><span class="ui-label">${esc(U.yourSentence)}</span>${sentence(true)}</div>
        <div class="ui-plans three">${[0, 1, 2].map(card).join('')}</div>${two}
        ${v.reasons ? `<div class="ui-tray reason"><div class="ui-plan__head"><span class="ui-label">${esc(U.yourChoice)}</span><span class="ui-letter">${ABC[fs]}</span><span class="ui-plan__name">${esc(v.sol[F][0])}</span></div><div class="ui-chips col">${v.reasons.map((r, i) => `<button class="ui-chip ui-chip--line" data-n="${i}">${esc(r)}</button>`).join('')}</div></div>` : ''}</div><i class="ui-pointer"></i>`;
    }
    E = { dock: q('.ui-dock'), flo: q('.flo'), floBody: q('.flo-body'), sprite: q('.ui-florence'), shadow: q('.flo-shadow'), glow: q('.glow'), eyes: qa('.eye'), dots: qa('.dot'), say: q('.ui-say'), bub: q('.ui-bubble'), bt: q('.ui-bubble .t'), bu: q('.ui-bubble .ui-untyped'), small: q('.ui-bubble small'), actions: q('.ui-actions'),
      btn: Object.fromEntries(qa('[data-b]').map((b) => [b.dataset.b, b])), yn: qa('[data-yn]'), ptr: q('.ui-pointer'), sign: q('.ui-sign'), prog: qa('.ui-progress li'), pin: q('.ui-flag--town'), checks: q('.checks'), check: qa('.ui-check'), panel: q('.ui-panel'), jobs: qa('.ui-job'), talk: q('.ui-talk'), brk: q('.brk'),
      sent: q('.sent'), how: q('.ui-how'), sentP: q('.sent .ui-sentence'), gaps: qa('.sent .ui-gap'), chips: qa('.sent .ui-chips'), flat: q('.flat'), three: q('.three'), cards: qa('.three .ui-plan'), two: q('.ui-plans--two'), twoCards: qa('.ui-plans--two .ui-plan'), reason: q('.reason'), reasons: qa('.reason .ui-chip'),
      flags: qa('.ui-flag[data-d]'), rings: qa('.ui-tapring'), tag: q('.ui-tag'), fly: q('.ui-chip--fly'), thumbFly: q('.ui-thumb.fly') };
  }
  // the small pictures: a picture of the 3D canvas is kept for each plan that needs one
  const snap = (canvas) => { const g = snapC.getContext('2d'), sw = 760, sh = sw * 192 / 336; g.drawImage(canvas, (1280 - sw) / 2, (720 - sh) / 2, sw, sh, 0, 0, 336, 192); return snapC.toDataURL('image/jpeg', 0.85); };
  const thumbs = (m) => { m.thumbCss = m.thumbs.map((u) => (u ? `url(${u})` : '')); };

  // ---- Florence: one home position, mirrored for the whole film so that she points and looks into the screen ---------------
  function flo(m, t, TT, typing) {
    let f = IDLE[Math.floor(TT * 3) % 6];
    for (const [kind, a, b] of m.acts) { if (t < a) continue; const s = t - a;
      if (kind === 'hello' && s < 16 / 9) f = 4 + Math.floor(s * 9);
      if (kind === 'happy' && s < 0.9) f = [6, 7, 8, 9, 10, 11, 12, 18, 19][Math.floor(s * 10)];
      if (kind === 'card') { if (t < b) f = s < 0.1 ? 4 : 5; else if (t < b + 0.2) f = [5, 4][Math.floor((t - b) * 10)]; }
      if (kind === 'point' || kind === 'watch') { if (t < b) { const n = Math.floor(s * 10); f = n < 4 ? 20 + n : kind === 'point' ? [24, 25, 26, 25][Math.floor(s * 2) % 4] : Math.min(29, 20 + n); } else if (t < b + 5 / 12) f = [23, 22, 21, 20, 0][Math.floor((t - b) * 12)]; } }
    E.sprite.style.setProperty('--col', f % 6); E.sprite.style.setProperty('--row', Math.floor(f / 6));
    // a hop is her way of showing pleasure; a small lean answers something the child did. She never trembles.
    let y = 0, sq = 1, rot = 0; for (const [a, px] of m.hops) { const k = (t - a) / 0.32; if (k > 0 && k < 1) y -= px * 4 * k * (1 - k); if (k >= 1 && k < 1.32) sq = 1 - 0.06 * Math.sin((k - 1) / 0.32 * Math.PI); }
    for (const [a, deg, dur] of m.tilts) { const k = (t - a) / dur; if (k > 0 && k < 1) rot += deg * Math.sin(k * Math.PI); }
    const breathe = 1 + Math.sin(TT * Math.PI) * 0.006; E.floBody.style.transform = `translateY(${y}px) rotate(${rot}deg) scale(${1 / Math.sqrt(sq)}, ${sq * breathe})`;
    E.shadow.style.transform = `scale(${1 + y / 60})`; E.shadow.style.opacity = 0.25 + y / 120;
    // her eyes close for a tenth of a second every few seconds (never during the wave, when they are already closed),
    // the ball on her antenna glows while her words are typed, and the three dots on her card light while she works
    const group = f <= 6 || f === 18 || f === 19 ? 0 : f === 20 ? 1 : f >= 21 ? 2 : -1, bl = group >= 0 && (TT % 4.3) < 0.1;
    const EYES = [[[148, 131], [197, 131]], [[128, 134], [177, 134]], [[109, 140], [141, 139]]], BALL = [[170, 57], [168, 62], [150, 56]];
    E.eyes.forEach((e, i) => { on(e, bl); if (bl) { e.style.left = `${EYES[group][i][0] * 0.5676}px`; e.style.top = `${EYES[group][i][1] * 0.5676}px`; } });
    const gl = typing && group >= 0; on(E.glow, gl); if (gl) { E.glow.style.left = `${BALL[group][0] * 0.5676}px`; E.glow.style.top = `${(BALL[group][1] - (f === 5 || f === 4 ? 5 : 0)) * 0.5676}px`; }
    const think = m.think && t >= m.think[0] && t < m.think[1] + 0.1 && f === 5; E.dots.forEach((d, i) => { on(d, think && t >= m.think[0] + 0.15 + i * 0.38); });
  }
  // her bubble opens at its final size and the words are typed into it
  function speech(m, t) {
    const e = m.says.find((s) => t >= s.a && t < s.b + (s.last ? 0.25 : 0)); if (!on(E.bub, !!e)) return false;
    const n = e.ty.n(t - e.a - 0.3); E.bt.textContent = e.text.slice(0, n); E.bu.textContent = e.text.slice(n); on(E.small, !!e.small); if (e.small) { E.small.textContent = e.small; E.small.style.opacity = span(t, e.typed, e.typed + 0.3); }
    const k = e.fresh ? lerp(0.5, 1, springAt(t, e.a, SPRING.soft)) : 1, o = e.last ? 1 - inCubic(span(t, e.b, e.b + 0.25)) : 1; E.bub.style.transform = `scale(${k * (0.6 + 0.4 * o)})`; E.bub.style.opacity = Math.min(1, span(t, e.a, e.a + 0.12)) * o;
    return n > 0 && n < e.text.length;
  }
  // the buttons at the right end of Florence's line
  function buttons(m, t, TT) {
    let any = false;
    for (const [id, el] of Object.entries(E.btn)) { const b = m.btn[id], yes = !!b && t >= b.a && t < (b.b ?? 1e9); if (id === 'keepFirst' || id === 'keepThis') continue; on(el, yes); if (!yes) continue; any = true;
      const down = b.tap !== undefined && t >= b.tap && t < b.tap + 0.16, test = id === 'test', running = test && b.tap !== undefined && t >= b.tap + 0.16;
      cls(el, 'is-disabled', b.ready !== undefined && t < b.ready); cls(el, 'is-pressed', down); if (test) { cls(el, 'is-running', running); on(el.firstChild, running); el.firstChild.childNodes.forEach((d, i) => { const ph = ((TT - i * 0.12) / 0.7) % 1; d.style.transform = `translateY(${ph < 0.6 ? -8 * Math.sin(ph / 0.6 * Math.PI) : 0}px)`; }); }
      const k = pop(t, b.ready ?? b.a, test ? SPRING.bouncy : SPRING.pop), bob = test && !down && !running && t > b.a + 0.7 ? -5 * (0.5 - 0.5 * Math.cos((TT * 2 * Math.PI) / 1.4)) : 0;
      el.style.transform = down || running || el.classList.contains('is-disabled') ? '' : `translateY(${bob}px) scale(${k})`; }
    E.yn.forEach((el, i) => { const y = m.yn, yes = !!y && t >= y.a && t < y.b; on(el, yes); if (!yes) return; any = true; const hit = i === m.v.askF[1] && t >= m.ynTap; cls(el, 'is-chosen', hit); cls(el, 'is-pressed', hit && t < m.ynTap + 0.16); el.style.transform = hit ? '' : `scale(${pop(t, y.a + i * 0.08)})`; });
    return any;
  }
  // the film's finger: it rests at the side, travels to a tap along a slight curve, arrives early and presses
  function pointer(m, t, fx, night) {
    if (!fx) return; const taps = m.taps; let j = taps.findIndex((p) => p.t + 0.3 > t), pos = REST, down = false;
    if (j < 0) { const p = taps[taps.length - 1]; if (p) pos = pointerPath(span(t, p.t + 0.7, p.t + 1.3), p.xy, REST); }
    else { const nx = taps[j], pv = taps[j - 1], far = !pv || nx.t - pv.t > 4.2, from = far ? REST : pv.xy, dur = pointerMs(Math.hypot(nx.xy[0] - from[0], nx.xy[1] - from[1])) / 1000, s = nx.t - 0.15 - dur;
      if (t >= s) pos = pointerPath(span(t, s, s + dur), from, nx.xy); else if (far && pv) pos = pointerPath(span(t, pv.t + 0.7, pv.t + 1.3), pv.xy, REST); else pos = from; down = t >= nx.t && t < nx.t + 0.16; }
    E.ptr.style.left = `${pos[0]}px`; E.ptr.style.top = `${pos[1]}px`; cls(E.ptr, 'is-down', down);
    if (fx) for (const p of taps) if (t >= p.t && t < p.t + 0.6) fx.push([p.t, 'tap', p.xy[0], p.xy[1]]);
  }
  const progress = (m, t, done, now) => E.prog.forEach((li, i) => { const fin = i < done, cur = i === now; cls(li, 'is-done', fin); cls(li, 'is-now', cur); li.style.transform = fin && i === done - 1 && m.done !== undefined ? `scale(${lerp(1.9, 1, outBack(span(t, m.done + 0.5, m.done + 0.72), 0.08))})` : cur && m.done !== undefined && t > m.done ? `scale(${pop(t, m.done + 0.8)})` : ''; });

  function draw(m, t, TT, fx, night = 0) {
    if (window.SAFE) { let s = q('.safe'); if (!s) { s = document.createElement('div'); s.className = 'safe'; s.style.cssText = 'position:absolute;left:0;right:0;top:80px;border:2px dashed #f0f;pointer-events:none'; root.appendChild(s); } requestAnimationFrame(() => {}); s.style.height = `${rect(E.dock).y - 24 - 80}px`; }
    root.classList.toggle('is-night', night > 0.5);
    const typing = speech(m, t), any = buttons(m, t, TT); on(E.say, any || E.bub.style.display !== 'none'); flo(m, t, TT, typing);
    if (m.kind === 'open') {
      const p = ctx.screen([1, 3.2, 0]), k = t - m.pin; on(E.pin, k > 0 && t < m.fly + 0.3); E.pin.style.left = `${p[0]}px`; E.pin.style.top = `${p[1] - (1 - inQuad(clamp(k / 0.22))) * 220}px`; E.pin.style.transform = `translate(-50%, -100%) scale(${1 + ring(k - 0.22, 3.5, 6, 0.12)}, ${1 - ring(k - 0.22, 3.5, 6, 0.16)})`; E.pin.style.opacity = 1 - span(t, m.fly, m.fly + 0.3);
      if (slide(E.checks, t, m.checks, m.checksOut)) E.check.forEach((c, i) => { const s = pop(t, m.checks + 0.4 + i * 0.08); c.style.transform = `scale(${s})`; c.style.opacity = t >= m.checks + 0.4 + i * 0.08 ? 1 : 0; });
      E.flo.style.opacity = 1;
    }
    if (m.kind === 'end') {
      progress(m, t, NL, -1); const yes = t >= m.panel && t < m.panelOut + 0.3; on(E.panel, yes); if (yes) { const k = outCubic(span(t, m.panel, m.panel + 0.45)), o = inCubic(span(t, m.panelOut, m.panelOut + 0.3)); E.panel.style.transform = `translateX(${(1 - k) * 60 + o * 60}px)`; E.panel.style.opacity = k * (1 - o);
        E.jobs.forEach((j, i) => { j.style.opacity = t >= m.jobAt[i] ? 1 : 0; j.style.transform = `scale(${pop(t, m.jobAt[i])})`; }); for (const el of [E.talk, E.brk]) { el.style.opacity = outCubic(span(t, m.talk, m.talk + 0.4)); el.style.transform = `translateY(${(1 - outCubic(span(t, m.talk, m.talk + 0.4))) * 16}px)`; } }
      E.flo.style.opacity = 1 - span(t, m.back + 0.4, m.back + 1); q('.ui-top').style.opacity = 1 - span(t, m.back + 0.4, m.back + 1);
    }
    if (m.kind === 'level') level(m, t, TT, fx);
    pointer(m, t, fx, night);
  }

  function level(m, t, TT, fx) {
    const { v, li, ord, slotOf, seq } = m, TS = TEST[li], F = v.pick, fs = slotOf[F], R = m.retry, retry = R !== undefined && t >= m.try0, gapsN = E.gaps.length;
    progress(m, t, li + (t >= m.done + 0.5 ? 1 : 0), t >= m.done + 0.8 ? li + 1 : li);
    // the level sign arrives large in the middle and then settles under the top bar; it leaves when the sentence comes
    { const s = m.sign, yes = t >= s.a && t < m.signOut + 0.25; on(E.sign, yes); if (yes) { const k = inOutCubic(span(t, s.settle, s.land)), sc = lerp(1.55, 1, k) * lerp(0.8, 1, springAt(t, s.a, SPRING.pop)) * (1 - 0.4 * inCubic(span(t, m.signOut, m.signOut + 0.25))); E.sign.style.transform = `translateX(-50%) translateY(${lerp(170, 0, k)}px) scale(${sc})`; E.sign.style.opacity = Math.min(1, span(t, s.a, s.a + 0.1)) * (1 - span(t, m.signOut, m.signOut + 0.25)); } }
    // ---- the sentence -----------------------------------------------------------------------------------------------
    if (slide(E.sent, t, m.tray, m.askTap + 0.1)) {
      on(E.how, t < m.gapTap[0] + 0.3); E.how.style.opacity = 1 - span(t, m.gapTap[0], m.gapTap[0] + 0.3);
      const filled = m.gapTap.map((x) => t >= x + 0.42), waiting = filled.indexOf(false), showSet = waiting < 0 ? gapsN - 1 : waiting > 0 && t < m.gapTap[waiting - 1] + 0.62 ? waiting - 1 : waiting;
      E.gaps.forEach((g, k) => { cls(g, 'is-filled', filled[k]); cls(g, 'is-active', k === waiting); const pu = 0.5 - 0.5 * Math.cos((TT * 2 * Math.PI) / 1.2), land = t - m.gapTap[k] - 0.42; g.style.boxShadow = k === waiting ? `0 0 0 ${6 * pu}px rgba(255, 210, 87, ${0.9 * pu})` : ''; g.style.transform = filled[k] && land < 0.4 ? `scale(${lerp(1.15, 1, springAt(land, 0, SPRING.pop))})` : ''; });
      E.chips.forEach((c, k) => { if (!on(c, k === showSet)) return; const a = k === 0 ? m.tray + 0.25 : m.gapTap[k - 1] + 0.62; [...c.children].forEach((b, n) => { const mine = n === v.s.filter(Array.isArray)[k][0], tp = m.gapTap[k]; cls(b, 'is-pressed', mine && t >= tp && t < tp + 0.16); cls(b, 'is-chosen', mine && t >= tp + 0.16); b.style.opacity = t >= a + n * 0.08 ? 1 : 0; b.style.transform = mine && t >= tp ? '' : `scale(${pop(t, a + n * 0.08)})`; }); });
      // the chosen word flies to its gap along a short arc, and the gap takes it with a small burst
      let flying = false; m.gapTap.forEach((tp, k) => { const a = t - tp - 0.02; if (a < 0 || a >= 0.4 || k !== showSet) return; const G = v.s.filter(Array.isArray)[k], from = mid(E.chips[k].children[G[0]]), to = mid(E.gaps[k]), p = flyWord(a / 0.4, from, to); E.fly.textContent = G[G[0] + 1]; E.fly.style.left = `${p.x}px`; E.fly.style.top = `${p.y}px`; E.fly.style.transform = `translate(-50%, -50%) rotate(-3deg) scale(${p.scale})`; flying = true; });
      on(E.fly, flying); if (fx) m.gapTap.forEach((tp, k) => { if (t >= tp + 0.42 && t < tp + 0.7) fx.push([tp + 0.42, 'burst', ...mid(E.gaps[k])]); });
      // when the last gap is full, a highlight sweeps along the sentence so that it is read once as a whole
      const sw = span(t, m.sweep, m.sweep + 0.5); E.sentP.style.backgroundImage = sw > 0 && sw < 1 ? `linear-gradient(90deg, transparent ${sw * 100 - 14}%, rgba(255, 210, 87, 0.55) ${sw * 100 - 7}%, rgba(255, 210, 87, 0.55) ${sw * 100}%, transparent ${sw * 100 + 7}%)` : '';
    } else on(E.fly, false);
    slide(E.flat, t, m.askTap + 0.3, m.offer - 0.25);
    // ---- the three plan cards ----------------------------------------------------------------------------------------
    const inReason = v.reasons && t >= m.reason && t < m.reasonOut, first = t >= m.offer - 0.02 && t < m.after0 - 0.3 && !inReason, again = retry && t >= m.try0 + 0.6 && t < m.two;
    on(E.three, first || again);
    if (first || again) E.cards.forEach((c, s) => {
      const d = ord[s], mine = s === fs, chosen = t >= m.useTap, a = again ? m.try0 + 0.6 + s * 0.08 : m.land[s], gone = !again && chosen && !mine;
      const yes = t >= a && !(gone && t >= m.useTap + 0.2); on(c, yes); if (!yes) return;
      const k = outCubic(span(t, a, a + 0.38)), o = gone ? inCubic(span(t, m.useTap, m.useTap + 0.2)) : 0, testing = !again && t >= m.testTap + 0.1 && t < m.res0, tab = testing || (!again && chosen), turn = seq && ((t >= m.read[s][0] && t < m.read[s][1]) || (t >= m.turn[d] && t < m.turn[d] + TS.each));
      cls(c, 'ui-plan--tab', tab); cls(c, 'is-testing', turn && !chosen); cls(c, 'is-waiting', seq && testing && !turn); cls(c, 'is-tappable', again ? d !== F && !(d === R && t >= m.pick2Tap) : t >= m.choose && t < m.useTap && !(mine && t >= m.pickTap));
      cls(c, 'is-chosen', again ? d === R && t >= m.pick2Tap : mine && t >= m.pickTap); cls(c, 'is-first', again && d === F); cls(c, 'is-flat', !again && chosen && mine && t >= m.useTap + 0.25);
      c.style.transform = k < 1 || o > 0 ? `translateY(${(1 - k) * 28 + o * 24}px)` : ''; c.style.opacity = k * (1 - o);
      on(c.querySelector('.ui-plan__tag'), again && d === F); on(c.querySelector('.yc'), !again && chosen && mine && t >= m.useTap + 0.25); on(c.querySelector('.ui-plan__what'), !again && t < m.testTap + 0.1);
      const th = c.querySelector('.ui-thumb'), tAt = m.stamp[d] + 0.75; on(th, seq && !!m.thumbCss && t >= tAt && !(chosen && mine)); if (seq && m.thumbCss) th.style.backgroundImage = m.thumbCss[d];
      c.querySelectorAll('.ui-result').forEach((r, kk) => { const ra = again ? 0 : m.resAt(s, kk), yes2 = (again || t >= m.res0) && !(!again && chosen); on(r, yes2); if (!yes2) return; const kr = outCubic(span(t, ra, ra + 0.22)); r.style.opacity = kr; r.style.transform = `translateY(${(1 - kr) * 12}px)`;
        const mk = r.firstChild, ms = t - ra - 0.12, poor = mk.classList.contains('ui-mark--poor'); mk.style.opacity = ms >= 0 ? 1 : 0; mk.style.transform = ms < 0 || ms > 0.5 ? '' : `scale(${lerp(1.9, 1, outBack(clamp(ms / 0.22), 0.08))}) translateX(${poor ? ring(ms - 0.22, 6, 9, 3) : 0}px)`; });
    });
    // the second try: two cards, the first plan with its small picture, and one button inside each card
    if (R !== undefined && slide(E.two, t, m.two, m.keepTap + 0.35)) { const th = E.two.querySelector('.ui-thumb'); if (m.thumbCss) th.style.backgroundImage = m.thumbCss[F];
      E.two.querySelectorAll('.other .ui-result').forEach((r) => { const a = m.stamp2 + 0.5, yes = t >= a; r.style.visibility = yes ? 'visible' : 'hidden'; r.firstChild.style.transform = t < a + 0.5 ? `scale(${lerp(1.9, 1, outBack(span(t, a, a + 0.22), 0.08))})` : ''; });
      for (const id of ['keepFirst', 'keepThis']) { const b = E.btn[id], yes = t >= m.keepBtns; on(b, yes); if (yes) { const down = id === 'keepFirst' && t >= m.keepTap && t < m.keepTap + 0.16; cls(b, 'is-pressed', down); b.style.transform = down ? '' : `scale(${pop(t, m.keepBtns + (id === 'keepThis' ? 0.08 : 0))})`; } } }
    // the reason, in level 6 only
    if (v.reasons && slide(E.reason, t, m.reason + 0.25, m.reasonOut - 0.25)) E.reasons.forEach((b, i) => { const hit = i === v.reason && t >= m.reasonTap; cls(b, 'is-chosen', hit); cls(b, 'is-pressed', hit && t < m.reasonTap + 0.16); b.style.opacity = t >= m.reason + 0.6 + i * 0.08 ? 1 : 0; });
    // ---- on the town: the lettered flags, with the mark of each plan stamped on its top corner ---------------------------
    E.flags.forEach((f, d) => { const s = slotOf[d], mine = d === F; let a = m.land[s], b = mine ? m.recap0 : m.fold + 0.1 + s * 0.12, chosenFrom = mine ? m.pickTap : 1e9, markAt = m.stamp[d], back = mine ? m.done + 0.3 : 1e9;
      if (retry) { if (t < m.two) { a = m.try0 + 0.6 + s * 0.1; b = d === R ? m.keepTap + 0.3 : m.two; markAt = 0; chosenFrom = d === R ? m.pick2Tap : 1e9; } else if (d === R) { a = m.try0; b = m.keepTap + 0.3; markAt = m.stamp2; chosenFrom = 0; } else if (mine) { a = m.keepTap + 0.4; b = m.recap0; markAt = 0; chosenFrom = 0; } else { a = 1e9; } }
      const again2 = back < 1e9 && t >= back && t < back + 1.9; if (again2) { a = back; b = back + 1.6; }
      const yes = t >= a && t < b + 0.2; on(f, yes); if (!yes) return; const p = ctx.screen(FLAGS[li][d]), fall = inQuad(clamp((t - a) / 0.22)), wait = seq && t >= m.test0 && t < m.test1 && !(t >= m.turn[d] && t < m.turn[d] + TS.each);
      // each flag hops as the ring from the test button reaches it, and again when its mark lands
      const reach = m.testTap + 0.12 + Math.hypot(p[0] - 1100, p[1] - 560) / 1700, y = hop(t - reach, 14, 300) + hop(t - markAt, 16, 300) + (seq ? hop(t - m.turn[d] - 0.1, 14, 300) : 0), sq = 1 + ring(t - a - 0.22, 3.5, 7, 0.14), out = inCubic(span(t, b, b + 0.2));
      f.style.left = `${p[0]}px`; f.style.top = `${p[1] - (1 - fall) * 150 - y}px`; f.style.transform = `translate(-50%, -100%) scale(${(wait ? 0.8 : 1) * (1 - out) / Math.sqrt(sq)}, ${(wait ? 0.8 : 1) * (1 - out) * sq})`; cls(f, 'is-chosen', t >= chosenFrom); cls(f, 'is-resting', wait);
      const mk = f.querySelector('.ui-mark'), ms = t - markAt; on(mk, ms >= 0 && !again2); mk.style.transform = ms > 0.5 ? '' : `scale(${lerp(1.9, 1, outBack(clamp(ms / 0.22), 0.08))})`; });
    // the small picture of the end of a test flies from the town to its card
    { let shown = false; if (seq && m.thumbCss && fx) [0, 1, 2].forEach((d) => { const a = t - m.stamp[d] - 0.35; if (a < 0 || a >= 0.4) return; const card = E.cards[slotOf[d]]; if (card.style.display === 'none') return; const from = ctx.screen(FLAGS[li][d]), r = rect(card), e = inOutCubic(a / 0.4); shown = true; E.thumbFly.style.backgroundImage = m.thumbCss[d]; E.thumbFly.style.left = `${lerp(from[0] - 56, r.x + r.w - 126, e)}px`; E.thumbFly.style.top = `${lerp(from[1] - 20, r.y + 8, e)}px`; E.thumbFly.style.transform = `scale(${lerp(1.3, 0.75, e)})`; }); on(E.thumbFly, shown); }
    // ---- the recap: a dashed ring on every place that can be tapped, and a yellow tag on the place that was tapped ---------
    if (v.point) { const hit = t >= m.pointTap; E.rings.forEach((r, i) => { const yes = t >= m.rings + i * 0.1 && t < m.ringsOut + 0.2 && !(hit && i && t > m.pointTap + 0.3); on(r, yes); if (!yes) return; const p = ctx.screen(TAPS[li][i]), br = 1 + 0.05 * (1 - Math.cos((TT * 2 * Math.PI) / 1.6));
        r.style.left = `${p[0]}px`; r.style.top = `${p[1]}px`; cls(r, 'is-hit', hit && !i); r.style.opacity = (hit && i ? 1 - span(t, m.pointTap, m.pointTap + 0.3) : 1) * (1 - span(t, m.ringsOut, m.ringsOut + 0.2)); r.style.transform = `scale(${hit && !i ? lerp(1.5, 1, outBack(span(t, m.pointTap, m.pointTap + 0.22), 0.08)) : br * pop(t, m.rings + i * 0.1)})`; });
      const p = ctx.screen(TAPS[li][0]), yes = on(E.tag, t >= m.pointTap + 0.12 && t < m.ringsOut + 0.2); if (yes) { E.tag.style.left = `${clamp(p[0], 200, 1080)}px`; E.tag.style.top = `${p[1] + 62}px`; E.tag.style.transform = `translate(-50%, 0) scale(${pop(t, m.pointTap + 0.12)})`; E.tag.style.opacity = 1 - span(t, m.ringsOut, m.ringsOut + 0.2); } }
    if (fx) { const b = E.btn.test; if (t >= m.testTap && t < m.testTap + 0.8 && b.style.display !== 'none') fx.push([m.testTap, 'press', ...mid(b)]); }
  }

  // where a thing that the sample child taps is on the screen
  function find(m, what) {
    if (typeof what === 'string') return mid(E.btn[what]);
    const [kind, a, b] = what;
    if (kind === 'chip') return mid(E.chips[a].children[b]); if (kind === 'card') { const r = rect(E.cards[a]); return [r.x + r.w * 0.5, r.y + Math.min(r.h * 0.5, 60)]; }
    if (kind === 'reason') return mid(E.reasons[a]); if (kind === 'yn') return mid(E.yn[a]); if (kind === 'town') return ctx.screen(TAPS[m.li][a]);
    return REST;
  }
  return { enter, draw, find, snap, thumbs, dockTop: () => rect(E.dock).y };
}
