// Plays the storyboard as an animation of the game. The town is Eco Town on the six-town world map; it grows as each level is finished.
// Each level follows the flow chart: the invitation, the sentence, Florence's plans, the test, what happened,
// the choice, the town changing and the recap. Every frame is drawn from a time in seconds, so the film can be
// paused, searched and recorded frame by frame.
import { THREE, makeStage, clamp, ease, span, lerp, back } from './vox.js';
import { drawFx } from './fx.js';

const ABC = 'ABC', esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ICON = { g: '✓', f: '–', p: '✗' }, IDLE = [0, 1, 2, 3, 2, 1];

export function makeFilm(stageEl, D, town) {
  const W = 1280, H = 720, canvas = stageEl.querySelector('canvas.gl'), ui = stageEl.querySelector('.ui'), fxc = stageEl.querySelector('canvas.fx').getContext('2d');
  const st = makeStage(canvas, W, H), U = D.ui, T = D.towns[town.ti], isle = town.makeScene(), growIsland = town.makeIsland(), VIEWS = town.VIEWS, NL = T.levels.length;
  // ---- the times of each part ------------------------------------------------------------------------------------
  const segs = []; let at = 0; const push = (m) => { m.start = at; at += m.dur; segs.push(m); return m; };
  push({ kind: 'welcome', dur: 11, says: [[0.8, 5.6, T.intro, 'wave'], [5.8, 10.6, T.helper || '', 'idle']], sfx: [[0.2, 'whoosh'], [0.8, 'hello']] });
  T.levels.forEach((v, li) => {
    const gaps = v.s.filter(Array.isArray), m = { kind: 'level', li, v, n: v.sol.length, sfx: [] }; let t = 0;
    m.title = [0.2, 3.2]; m.inv = [2.9, 8.6]; t = 8.8; m.ask = t; m.gaps = gaps.map((g, k) => t + 0.9 + k * 2.6); t += 0.9 + gaps.length * 2.6; m.askTap = t + 0.6; m.think = [t + 0.9, t + 2.3]; t += 2.3; m.askEnd = t; m.w1 = t + 0.5; t += 1;
    m.offers = [t, t + 5.6]; t += 5.8; m.testBtn = t; m.testTap = t + 1.7; m.test = [t + 2.1, t + 12.6]; t += 13; m.res = [t, t + 6.8]; t += 7; m.choose = t; m.chooseTap = t + 1.3; m.w2 = t + 2.7; t += 3.2;
    m.build = [t + 0.3, t + 5.2]; m.after = [t + 0.4, t + 7.4]; t += 7.7; m.recap = [t, t + 4.4]; m.target = t + 1.6; m.recapTap = t + 3.3; m.yes = [t + 3.9, t + 6.9]; t += 7.4; m.dur = t;
    m.says = [[...m.inv, v.scene, li ? 'idle' : 'idle'], [...m.think, '…', 'idle'], [...m.offers, U.offers, 'point'], [...m.after, v.after, 'idle'], [m.recap[0], m.yes[0], v.point ? v.point[0] : v.askF[0], 'idle'], [m.yes[0], m.dur - 0.4, U.recapYes, 'wave']];
    m.sfx = [[0.2, 'title'], ...m.gaps.map((g) => [g + 1.4, 'tap']), ...m.gaps.map((g) => [g + 1.75, 'pop']), [m.askTap, 'tap'], [m.w1 - 0.4, 'whoosh'], ...v.sol.map((_, i) => [m.offers[0] + 1.3 + i * 0.5, 'pop']), [m.testTap, 'go'], [m.test[0], 'test', m.test[1] - m.test[0]],
      ...v.sol.flatMap((_, i) => v.res.map((r, k) => [m.res[0] + i * 0.5 + k * 0.25, r[i + 1][0] === 'g' ? 'good' : 'stamp'])), [m.chooseTap, 'tap'], [m.chooseTap + 0.05, 'sparkle'], [m.w2 - 0.4, 'whoosh'], [m.build[0], 'build', m.build[1] - m.build[0]], [m.recapTap, 'tap'], [m.yes[0], 'yes']];
    push(m);
  });
  push({ kind: 'end', dur: 15, says: [[9.4, 14.4, T.ti === 5 ? U.lastLine : U.breakLine, 'wave']], sfx: [[0.2, 'whoosh'], [1, 'yes']] });
  const duration = at;

  // ---- the page furniture ---------------------------------------------------------------------------------------
  let cur = null, updates = [], els = {};
  const dots = (done, now) => `<div class="dots">${T.levels.map((_, i) => `<i class="${i < done ? 'done' : i === now ? 'now' : ''}">${i < done ? '✓' : i + 1}</i>`).join('')}</div>`;
  const common = `<div class="flo"><i></i></div><div class="bub"><p><span class="v"></span><span class="h"></span></p></div><div class="wipe"><i></i><i></i><i></i></div>`;
  function enter(m) {
    cur = m; const c = T.colour;
    if (m.kind === 'welcome') ui.innerHTML = `<div class="banner" style="--c:${c}"><small>Week ${town.ti + 1} of 6</small><b>${esc(T.name)}</b></div>${common}`;
    if (m.kind === 'end') ui.innerHTML = `${dots(NL, -1)}<div class="jobs" style="--c:${c}"><h2>${esc(U.jobsTitle)}</h2><p>${esc(T.jobsLine)}</p>${T.jobs.map((j) => `<div class="job">${esc(j)}</div>`).join('')}</div>${common}`;
    if (m.kind === 'level') { const { v } = m; let g = -1;
      const sent = v.s.map((x) => (Array.isArray(x) ? `<span class="gap" data-g="${++g}"><i>${esc(x[x[0] + 1])}</i></span>` : esc(x))).join(' ');
      ui.innerHTML = `<div class="chip" style="--c:${c}"><b>${esc(T.name)}</b> Level ${m.li + 1} of ${NL} · ${esc(v.name)}</div>${dots(m.li, m.li)}
        <div class="title" style="--c:${c}"><em>${m.li + 1}</em><div><small>${esc(T.name)} · Level ${m.li + 1} of ${NL}</small><b>${esc(v.name)}</b></div></div>
        <div class="ask"><p class="lab">${esc(U.yourSentence)}</p><p class="sent">${sent}.</p>
          ${v.s.filter(Array.isArray).map((x, k) => `<div class="opts" data-g="${k}">${x.slice(1).map((o, n) => `<span class="wb" data-n="${n}">${esc(o)}</span>`).join('')}</div>`).join('')}
          <span class="btn askbtn">${esc(U.ask)}</span></div><span class="fly wb on"></span>
        ${v.sol.map((s, i) => `<div class="plan" data-i="${i}"><div class="name"><span class="let">${ABC[i]}</span>${esc(s[0])}</div><div class="rows">${v.res.map((r) => `<p class="${r[i + 1][0]}"><i>${ICON[r[i + 1][0]]}</i>${esc(r[i + 1][1])}</p>`).join('')}</div></div>`).join('')}
        <span class="btn testbtn" style="--c:${c}">${esc(v.test)}</span><div class="running" style="--c:${c}"><b>${esc(v.test)}</b><u><s></s></u></div>
        ${v.point ? '<div class="target"><i></i></div>' : `<div class="yn"><span class="wb" data-n="0">${esc(U.yes)}</span><span class="wb" data-n="1">${esc(U.no)}</span></div>`}
        ${common}<div class="ptr"></div>`;
      const plates = st.reset(m.n); updates = plates.map((p, i) => town.builders[m.li](p, i)); m.plates = plates; }
    const q = (s) => ui.querySelector(s), qa = (s) => [...ui.querySelectorAll(s)];
    els = { chip: q('.chip'), title: q('.title'), ask: q('.ask'), askbtn: q('.askbtn'), testbtn: q('.testbtn'), running: q('.running'), ptr: q('.ptr'), yn: q('.yn'), target: q('.target'), fly: q('.fly'), gaps: qa('.gap'), opts: qa('.opts'), plans: qa('.plan'),
      flo: q('.flo'), face: q('.flo i'), bub: q('.bub'), bv: q('.bub .v'), bh: q('.bub .h'), wipe: qa('.wipe i'), banner: q('.banner'), jobs: q('.jobs'), job: qa('.job'), dots: q('.dots') };
  }
  const show = (el, k, dy = 14, extra = '') => { if (!el) return; el.style.opacity = k; el.style.transform = `translateY(${(1 - k) * dy}px) ${extra}`; el.style.visibility = k <= 0.001 ? 'hidden' : 'visible'; };
  const win = (t, a, b, f = 0.4) => Math.min(span(t, a, a + f), 1 - span(t, b - f, b));
  const spring = (t, a) => back(span(t, a, a + 0.45));
  const mid = (el) => { const s = stageEl.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / W; return [(r.left + r.width / 2 - s.left) / k, (r.top + r.height / 2 - s.top) / k]; };
  const wipeAt = (t, mids) => { let c = 0, dir = 0; for (const w of mids) { const d = t - w; if (Math.abs(d) < 0.55) { c = 1 - Math.abs(d) / 0.55; dir = d < 0 ? -1 : 1; } } els.wipe.forEach((s, i) => { const k = clamp(c * 1.5 - i * 0.14); s.style.transform = `translateX(${dir < 0 ? -(1 - ease(k)) * 112 : (1 - ease(k)) * 112}%) skewX(-12deg)`; s.style.visibility = c > 0 ? 'visible' : 'hidden'; }); };
  // Florence and her speech bubble
  function florence(m, t, TT) {
    const say = m.says.find((s) => t >= s[0] && t < s[1] && s[2]); let frame = IDLE[Math.floor(TT * 3) % 6], talking = false;
    if (say) { const [a, b, text, mode] = say, n = Math.floor((t - a - 0.12) * 48); talking = n > 0 && n < text.length;
      if (els.bub.dataset.t !== text) { els.bub.dataset.t = text; els.bub.classList.toggle('dotty', text === '…'); }
      els.bv.textContent = text.slice(0, Math.max(0, n)); els.bh.textContent = text.slice(Math.max(0, n)); show(els.bub, win(t, a, b, 0.3), 10);
      if (mode === 'wave') { const f = Math.floor((t - a) * 9); if (f < 16) frame = 4 + f; }
      if (mode === 'point') { const f = Math.floor((t - a) * 10), back2 = Math.floor((b - 0.2 - t) * 10); frame = 20 + clamp(Math.min(f, back2), 0, 9); }
    } else show(els.bub, 0);
    els.face.style.backgroundPosition = `${(frame % 6) * 20}% ${Math.floor(frame / 6) * 25}%`;
    const small = m.kind === 'level' ? ease(span(t, m.offers[1] - 0.2, m.offers[1] + 0.4)) * (1 - ease(span(t, m.w2 - 0.3, m.w2 + 0.3))) : 0;
    els.flo.style.transform = `translateY(${talking ? Math.sin(TT * 16) * 3 : Math.sin(TT * 2) * 2}px) scale(${1 - small * 0.48})`;
  }
  const viewAt = (i) => VIEWS[Math.max(0, Math.min(VIEWS.length - 1, i))];
  const lookIsland = (a, b, k, TT, push = 1) => { const v = a.map((x, i) => lerp(x, b[i], k)); const dist = v[3] * push, yaw = 0.34 + Math.sin(TT * 0.13) * 0.05; st.look(v[0] + Math.sin(yaw) * dist * 0.15, v[1], v[2] + Math.cos(yaw) * dist * 0.15, dist, 0.66, yaw); };

  function frame(m, t, TT) {
    const fx = [];
    if (m.kind === 'welcome') {
      growIsland({ stage: 0, t: TT }); isle.light(0); const k = ease(span(t, 1.2, 7)); st.look(lerp(-2, 2.5, k), 0, lerp(-3, 3, k), lerp(205, 56, k), lerp(0.74, 0.66, k), lerp(0.62, 0.34, k)); st.draw(isle.scene);
      show(els.banner, win(t, 0.3, 5.4, 0.5), 0, `scale(${0.9 + 0.1 * spring(t, 0.3)})`); florence(m, t, TT); wipeAt(t, [0, m.dur]);
    }
    if (m.kind === 'end') {
      growIsland({ stage: NL, t: TT, night: 0 }); isle.light(0); st.look(7, 0.5, 2, 52, 0.66, 0.3 + t * 0.03); st.draw(isle.scene);
      show(els.jobs, win(t, 0.8, 14.4, 0.5), 20); els.job.forEach((j, i) => show(j, spring(t, 2.2 + i * 1.5), 16)); florence(m, t, TT); wipeAt(t, [0]); if (t > 1 && t < 4) fx.push([1, 'confetti']);
    }
    if (m.kind === 'level') {
      const { v, n, li } = m, pick = v.pick, px = (i) => (i - (n - 1) / 2) * 14.5, onTable = t >= m.w1 && t < m.w2;
      const u = span(t, m.test[0], m.test[1]);
      if (onTable) {
        st.look(0, 0, 6.2, 52, 0.68); st.light(town.nightOf(li, u));
        m.plates.forEach((p, i) => { const inn = back(span(t, m.w1 + 0.1 + i * 0.18, m.w1 + 1 + i * 0.18)), out = i === pick ? 0 : ease(span(t, m.chooseTap + 0.5, m.chooseTap + 1.3)); p.position.y = (1 - inn) * -16 - out * 18 + (i === pick ? Math.sin(clamp((t - m.chooseTap) / 0.5) * Math.PI) * 0.8 : 0);
          updates[i]({ show: span(t, m.offers[0] + 1.2 + i * 0.5, m.offers[0] + 2.2 + i * 0.5), u, t: TT, live: t >= m.test[0] && t < m.test[1] }); });
        st.draw();
      } else {
        const built = li + (t < m.w2 ? 0 : span(t, m.build[0], m.build[1])), dusk = li === 4 ? 0.8 * win(t, m.build[1] - 1.2, m.recap[0] + 0.6, 1) : 0;
        growIsland({ stage: built, t: TT, night: dusk }); isle.light(dusk);
        if (t < m.w1) lookIsland(viewAt(li - 1 < 0 ? 6 : li), viewAt(li), li ? ease(span(t, 0.2, 3.4)) : 1, TT, lerp(1.08, 1, ease(span(t, 0, 4))) * lerp(1, 0.94, ease(span(t, m.ask, m.askEnd))));
        else lookIsland(viewAt(li), viewAt(li), 1, TT, lerp(1.06, 0.97, ease(span(t, m.w2, m.dur))));
        st.draw(isle.scene);
      }
      // words and buttons
      show(els.chip, span(t, 3, 3.5), 0); show(els.dots, 1, 0); const nowDot = els.dots.children[li]; if (t >= m.yes[0]) { nowDot.className = 'done'; nowDot.textContent = '✓'; nowDot.style.transform = `scale(${0.6 + 0.4 * spring(t, m.yes[0])})`; } else { nowDot.className = 'now'; nowDot.textContent = li + 1; nowDot.style.transform = `scale(${1 + Math.sin(TT * 4) * 0.06})`; }
      show(els.title, win(t, m.title[0], m.title[1], 0.35), 0, `translateX(${(1 - spring(t, m.title[0])) * -420 + ease(span(t, m.title[1] - 0.35, m.title[1])) * 420}px)`);
      show(els.ask, win(t, m.ask, m.askEnd - 0.2, 0.35), 30);
      const G = v.s.filter(Array.isArray);
      els.gaps.forEach((gEl, k) => gEl.classList.toggle('on', t >= m.gaps[k] + 1.85));
      els.opts.forEach((o, k) => { const a = m.gaps[k], last = k === els.opts.length - 1, vis = t >= a && (last || t < a + 2.6); o.style.display = vis ? 'flex' : 'none';
        [...o.children].forEach((b, nn) => { const s = spring(t, a + nn * 0.1); b.style.transform = `scale(${s}) translateY(${nn === G[k][0] && t >= a + 1.4 ? 3 : 0}px)`; b.style.opacity = s > 0.05 ? 1 : 0; b.classList.toggle('on', nn === G[k][0] && t >= a + 1.4); }); });
      show(els.askbtn, spring(t, m.askTap - 1.4), 0, `scale(${t > m.askTap - 1 && t < m.askTap ? 1 + Math.sin(TT * 9) * 0.04 : 1})`); els.askbtn.classList.toggle('down', t >= m.askTap && t < m.askTap + 0.25);
      // the chosen word flies into its gap
      let flying = false; els.opts.forEach((o, k) => { const a = m.gaps[k] + 1.45; if (t >= a && t < a + 0.4 && o.style.display !== 'none') { const from = mid(o.children[G[k][0]]), to = mid(els.gaps[k]), kk = ease((t - a) / 0.4); els.fly.textContent = G[k][G[k][0] + 1]; els.fly.style.left = `${lerp(from[0], to[0], kk)}px`; els.fly.style.top = `${lerp(from[1], to[1], kk) - Math.sin(kk * Math.PI) * 26}px`; flying = true; } });
      els.fly.style.visibility = flying ? 'visible' : 'hidden';
      show(els.testbtn, win(t, m.testBtn, m.testTap + 0.45, 0.3), 30, `scale(${t < m.testTap ? spring(t, m.testBtn) * (1 + Math.sin(TT * 7) * 0.035) : 1})`); els.testbtn.classList.toggle('down', t >= m.testTap && t < m.testTap + 0.3);
      show(els.running, win(t, m.test[0] - 0.2, m.test[1] + 0.3, 0.3), -20); els.running.querySelector('s').style.width = `${u * 100}%`;
      els.plans.forEach((p, i) => { const vis = onTable ? win(t, m.offers[0] + 1.2 + i * 0.5, i === pick ? m.w2 : m.chooseTap + 0.9, 0.3) : 0;
        if (onTable) { const [x, y] = st.screen(new THREE.Vector3(px(i), 0, 6.6)); p.style.left = `${x}px`; p.style.top = `${y + 10}px`; }
        p.style.opacity = vis; p.style.visibility = vis > 0.001 ? 'visible' : 'hidden'; p.style.transform = `translateX(-50%) translateY(${(1 - spring(t, m.offers[0] + 1.2 + i * 0.5)) * -40}px) scale(${i === pick && t >= m.chooseTap ? 1 + 0.1 * Math.sin(clamp((t - m.chooseTap) / 0.5) * Math.PI) : 1})`;
        p.classList.toggle('on', i === pick && t >= m.chooseTap);
        [...p.querySelectorAll('.rows p')].forEach((r, k) => { const a = m.res[0] + i * 0.5 + k * 0.25, s = spring(t, a); r.style.opacity = t >= a ? 1 : 0; r.style.transform = `scale(${0.6 + 0.4 * s})`; r.querySelector('i').style.transform = `scale(${t >= a + 0.15 ? 0.4 + 0.6 * spring(t, a + 0.15) : 0})`; }); });
      if (els.yn) { show(els.yn, win(t, m.recap[0] + 1, m.dur - 0.3), 20); els.yn.children[v.askF[1]].classList.toggle('on', t >= m.recapTap); }
      let tapAt = [640, 300];
      if (els.target) { tapAt = st.screen(new THREE.Vector3(...town.TAPS[li])); const s = t >= m.target && t < m.dur - 0.3 ? spring(t, m.target) : 0; els.target.style.left = `${tapAt[0]}px`; els.target.style.top = `${tapAt[1]}px`; els.target.style.transform = `translate(-50%, -50%) scale(${s * (1 + Math.sin(TT * 6) * 0.07)})`; els.target.style.visibility = s > 0.01 ? 'visible' : 'hidden'; els.target.classList.toggle('hit', t >= m.recapTap); }
      // the pointer
      const keys = [[m.ask, 1150, 800]];
      els.opts.forEach((o, k) => { const was = o.style.display; o.style.display = 'flex'; keys.push([m.gaps[k] + 1.4, ...mid(o.children[G[k][0]])]); o.style.display = was; });
      keys.push([m.askTap, ...mid(els.askbtn)], [m.askEnd, 1150, 800], [m.testBtn + 0.4, 950, 800], [m.testTap, ...mid(els.testbtn)], [m.testTap + 1.6, 1150, 800], [m.choose, 1150, 800]);
      const pk = onTable ? mid(els.plans[pick]) : [640, 400];
      keys.push([m.chooseTap, pk[0], pk[1]], [m.chooseTap + 1.3, 1180, 800], [m.recap[0] + 1.6, 1180, 800], [m.recapTap, ...(els.yn ? mid(els.yn.children[v.askF[1]]) : tapAt)], [m.dur - 0.5, 1180, 800]);
      let a = keys[0], b = keys[0]; for (const k of keys) { if (k[0] <= t) a = k; else { b = k; break; } b = k; }
      const kk = b[0] > a[0] ? ease(span(t, Math.max(a[0], b[0] - 1.1), b[0])) : 1, X = lerp(a[1], b[1], kk), Y = lerp(a[2], b[2], kk), tap = keys.some((k) => k[2] < 760 && t >= k[0] && t < k[0] + 0.28);
      els.ptr.style.transform = `translate(${X}px, ${Y}px) scale(${tap ? 0.78 : 1})`; els.ptr.classList.toggle('tap', tap);
      keys.forEach((k) => { if (k[2] < 760) fx.push([k[0], 'tap', k[1], k[2]]); });
      fx.push([m.testTap, 'shock', 640, 620, T.colour], [m.chooseTap, 'spark', pk[0], pk[1]], [m.recapTap, 'spark', ...(els.yn ? mid(els.yn.children[v.askF[1]]) : tapAt)], [m.yes[0], 'confetti']);
      florence(m, t, TT); wipeAt(t, [0, m.w1, m.w2, m.dur]);
    }
    drawFx(fxc, W, H, fx, t);
  }
  function seek(TT) { TT = clamp(TT, 0, duration - 0.001); const m = segs.find((x) => TT < x.start + x.dur) || segs[segs.length - 1]; if (m !== cur) enter(m); frame(m, TT - m.start, TT); }
  return { duration, segs, seek };
}
