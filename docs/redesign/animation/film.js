// Plays the storyboard as an animation. Each level follows the steps of the flow chart: the invitation, the
// sentence, Florence's plans, the test, what happened, the choice and the recap. Every frame is drawn from a time
// in seconds, so the film can be paused, searched and recorded frame by frame.
import { THREE, makeStage, clamp, ease, span, lerp } from './vox.js';

const ABC = 'ABC', esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ICON = { g: '✓', f: '–', p: '✗' };

export function makeFilm(stageEl, D, towns) {
  const W = 1280, H = 720, canvas = stageEl.querySelector('canvas'), ui = stageEl.querySelector('.ui'), st = makeStage(canvas, W, H), U = D.ui;
  // ---- the times of each part of a level ------------------------------------------------------------------------
  const levels = [];
  towns.forEach(({ ti, builders, nightOf, points }) => D.towns[ti].levels.forEach((v, li) => {
    const gaps = v.s.filter(Array.isArray), m = { ti, li, v, builders, nightOf, n: v.sol.length, point: (points && points[li]) || [0, 0.5, 0] };
    let t = 0; m.title = [0, 2.8]; t = 2.4; m.inv = [t, t + 5.2]; t += 5.4;
    m.ask = t; m.gaps = gaps.map((g, k) => t + 0.8 + k * 2.3); t += 0.8 + gaps.length * 2.3; m.askTap = t + 0.7; t += 1.6; m.askEnd = t;
    m.offers = [t, t + 5.2]; t += 5.4; m.testBtn = t; m.testTap = t + 1.5; m.test = [t + 1.9, t + 12.4]; t += 12.8;
    m.res = [t, t + 6.6]; t += 6.8; m.choose = t; m.chooseTap = t + 1.3; m.after = [t + 1.9, t + 8.2]; t += 8.5;
    m.recap = [t, t + 4]; m.recapTap = t + 3; m.yes = [t + 3.6, t + 6.2]; t += 6.8; m.dur = t; m.start = levels.reduce((a, x) => a + x.dur, 0); levels.push(m);
  }));
  const duration = levels.reduce((a, x) => a + x.dur, 0);

  // ---- the words and buttons for one level -----------------------------------------------------------------------
  let cur = null, updates = [], els = {};
  const bubble = (id, text) => `<div class="bub" data-id="${id}"><span class="who">F</span><p>${esc(text)}</p></div>`;
  function enter(m) {
    cur = m; const { v } = m, t = D.towns[m.ti]; let g = -1;
    const sent = v.s.map((x) => (Array.isArray(x) ? `<span class="gap" data-g="${++g}"><i>${esc(x[x[0] + 1])}</i></span>` : esc(x))).join(' ');
    const recapQ = v.point ? v.point[0] : v.askF ? v.askF[0] : '';
    ui.innerHTML = `<div class="chip" style="--c:${t.colour}"><b>${esc(t.name)}</b> Level ${m.li + 1} of 6 · ${esc(v.name)}</div>
      <div class="title" style="--c:${t.colour}"><small>${esc(t.name)} · Level ${m.li + 1} of 6</small><b>${esc(v.name)}</b></div>
      ${bubble('inv', v.scene)}${bubble('offers', U.offers)}${bubble('after', v.after)}${bubble('recap', recapQ)}${bubble('yes', U.recapYes)}
      <div class="ask"><p class="lab">${esc(U.yourSentence)}</p><p class="sent">${sent}.</p>
        ${v.s.filter(Array.isArray).map((x, k) => `<div class="opts" data-g="${k}">${x.slice(1).map((o, n) => `<span class="wb" data-n="${n}">${esc(o)}</span>`).join('')}</div>`).join('')}
        <span class="btn askbtn">${esc(U.ask)}</span></div>
      ${v.sol.map((s, i) => `<div class="plan" data-i="${i}"><div class="name"><span class="let">${ABC[i]}</span>${esc(s[0])}</div><div class="rows">${v.res.map((r) => `<p class="${r[i + 1][0]}"><i>${ICON[r[i + 1][0]]}</i>${esc(r[i + 1][1])}</p>`).join('')}</div></div>`).join('')}
      <span class="btn testbtn" style="--c:${t.colour}">${esc(v.test)}</span>
      ${v.point ? '' : `<div class="yn"><span class="wb" data-n="0">${esc(U.yes)}</span><span class="wb" data-n="1">${esc(U.no)}</span></div>`}
      <div class="ptr"></div>`;
    const q = (s) => ui.querySelector(s), qa = (s) => [...ui.querySelectorAll(s)];
    els = { chip: q('.chip'), title: q('.title'), ask: q('.ask'), askbtn: q('.askbtn'), testbtn: q('.testbtn'), ptr: q('.ptr'), yn: q('.yn'), gaps: qa('.gap'), opts: qa('.opts'), plans: qa('.plan'), bub: Object.fromEntries(qa('.bub').map((b) => [b.dataset.id, b])) };
    const plates = st.reset(m.n); updates = plates.map((p, i) => m.builders[m.li](p, i)); m.plates = plates;
  }
  const show = (el, k, dy = 14) => { if (!el) return; el.style.opacity = k; el.style.transform = `translateY(${(1 - k) * dy}px)`; el.style.visibility = k <= 0.001 ? 'hidden' : 'visible'; };
  const win = (t, a, b, f = 0.4) => Math.min(span(t, a, a + f), 1 - span(t, b - f, b));
  const mid = (el) => { const s = stageEl.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / W; return [(r.left + r.width / 2 - s.left) / k, (r.top + r.height / 2 - s.top) / k]; };

  function frame(m, t, T) {
    const { v, n } = m, pick = v.pick, focus = (n - 1) / 2, px = (i) => (i - (n - 1) / 2) * 14.5;
    // the 3D scene
    const wide = ease(span(t, m.offers[0], m.offers[0] + 1.6)) * (1 - ease(span(t, m.choose + 1.5, m.choose + 3)));
    const cx = t < m.choose ? px(Math.floor(focus)) * (1 - wide) : px(pick) * (1 - wide);
    st.look(cx, 0, lerp(3.4, 5.6, wide), lerp(32, 55, wide), 0.68);
    const u = span(t, m.test[0], m.test[1]) * (1 - ease(span(t, m.choose + 1.5, m.choose + 3)));
    st.light(m.nightOf(m.li, u));
    m.plates.forEach((p, i) => {
      const first = i === Math.floor(focus), inn = first ? 1 : ease(span(t, m.offers[0] + 0.2 + i * 0.15, m.offers[0] + 1.3 + i * 0.15)), out = i === pick ? 0 : ease(span(t, m.choose + 1.5, m.choose + 2.6));
      p.visible = inn > 0.01 && out < 0.99; p.position.y = (1 - inn) * -14 - out * 16;
      if (t >= m.choose + 1.5 && first && i !== pick) p.visible = out < 0.99;
      updates[i]({ show: span(t, m.offers[0] + 1.2 + i * 0.5, m.offers[0] + 2.2 + i * 0.5), u, t: T, live: t >= m.test[0] && t < m.test[1] });
    });
    st.draw();
    // the words
    show(els.chip, span(t, 2.2, 2.8), 0); show(els.title, win(t, m.title[0] + 0.15, m.title[1]), 0);
    show(els.bub.inv, win(t, ...m.inv)); show(els.bub.offers, win(t, ...m.offers)); show(els.bub.after, win(t, ...m.after));
    show(els.bub.recap, win(t, m.recap[0], m.yes[0] + 0.3)); show(els.bub.yes, win(t, m.yes[0] + 0.3, m.dur - 0.3));
    show(els.ask, win(t, m.ask, m.askEnd));
    els.gaps.forEach((gEl, k) => gEl.classList.toggle('on', t >= m.gaps[k] + 1.5));
    els.opts.forEach((o, k) => { const a = m.gaps[k], last = k === els.opts.length - 1; show(o, win(t, a, last ? m.askEnd : a + 2.3, 0.25), 0); o.style.display = t >= a && (last || t < a + 2.3) ? 'flex' : 'none';
      const chosen = v.s.filter(Array.isArray)[k][0]; [...o.children].forEach((b, nn) => b.classList.toggle('on', nn === chosen && t >= a + 1.5)); });
    show(els.askbtn, span(t, m.askTap - 1.2, m.askTap - 0.8), 0); els.askbtn.classList.toggle('down', t >= m.askTap && t < m.askTap + 0.25);
    show(els.testbtn, win(t, m.testBtn, m.testTap + 0.5)); els.testbtn.classList.toggle('down', t >= m.testTap && t < m.testTap + 0.3);
    els.plans.forEach((p, i) => {
      const [x, y] = st.screen(new THREE.Vector3(m.plates[i].position.x, 0, 6.6)), k = win(t, m.offers[0] + 1.2 + i * 0.5, i === pick ? m.dur : m.choose + 1.9);
      p.style.left = `${x}px`; p.style.top = `${Math.min(y + 8, 560)}px`; show(p, k, 0);
      p.classList.toggle('res', t >= m.res[0] + i * 0.5 && t < m.choose + 1.6); p.classList.toggle('on', i === pick && t >= m.chooseTap);
      p.style.transform = `translateX(-50%) scale(${wide < 0.5 ? 1.12 : 1})`;
    });
    if (els.yn) { show(els.yn, win(t, m.recap[0] + 0.8, m.dur - 0.3)); els.yn.children[v.askF[1]].classList.toggle('on', t >= m.recapTap); }
    // the pointer: [time, x, y]
    const keys = [[m.ask, 1100, 800]];
    els.opts.forEach((o, k) => { o.style.display = 'flex'; keys.push([m.gaps[k] + 1.4, ...mid(o.children[v.s.filter(Array.isArray)[k][0]])]); if (!(t >= m.gaps[k] && (k === els.opts.length - 1 || t < m.gaps[k] + 2.3))) o.style.display = 'none'; });
    keys.push([m.askTap, ...mid(els.askbtn)], [m.askEnd + 0.4, 1100, 800], [m.testBtn + 0.3, 900, 800], [m.testTap, ...mid(els.testbtn)], [m.testTap + 1.6, 1100, 800], [m.choose, 1100, 800]);
    const at = (i) => st.screen(new THREE.Vector3(px(i), 0.5, 1));
    keys.push([m.chooseTap, ...mid(els.plans[pick])], [m.chooseTap + 1.4, 1150, 800], [m.recap[0] + 1.2, 1150, 800]);
    keys.push([m.recapTap, ...(els.yn ? mid(els.yn.children[v.askF[1]]) : st.screen(new THREE.Vector3(px(pick) + m.point[0], m.point[1], m.point[2])))], [m.dur - 0.4, 1150, 800]);
    let a = keys[0], b = keys[0]; for (const k of keys) { if (k[0] <= t) a = k; else { b = k; break; } b = k; }
    const kk = b[0] > a[0] ? ease(span(t, Math.max(a[0], b[0] - 1.1), b[0])) : 1, X = lerp(a[1], b[1], kk), Y = lerp(a[2], b[2], kk);
    const tap = keys.some((k) => k[2] < 760 && t >= k[0] && t < k[0] + 0.28);
    els.ptr.style.transform = `translate(${X}px, ${Y}px) scale(${tap ? 0.78 : 1})`; els.ptr.classList.toggle('tap', tap);
  }
  function seek(T) {
    T = clamp(T, 0, duration - 0.001); const m = levels.find((x) => T < x.start + x.dur) || levels[levels.length - 1];
    if (m !== cur) enter(m); frame(m, T - m.start, T);
    const fade = Math.min(span(T - m.start, 0, 0.5), 1 - span(T - m.start, m.dur - 0.45, m.dur)); stageEl.querySelector('.veil').style.opacity = 1 - fade;
  }
  return { duration, levels, seek };
}
