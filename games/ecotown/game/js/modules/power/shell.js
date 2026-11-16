// Power control room: the page every mission plays on. A window onto the town (the 3D view, framed), Florence's line
// over it, and the desk under it with three panels (side, screen, controls), or one wide panel for the mission map.
// Each mission gets this "desk" object and draws into its panels; nothing here knows about a particular mission.
import { HOURS, KW, WIND_STRONG, WIND_LOW, SUN_BRIGHT, START_LEVEL, isWinter, forecast, stepHour } from './model.js';
import { T, clockWord, units } from './words.js';
import { daySvg, legend, dialSvg, C } from './chart.js';
import { createView } from './view.js';

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
export const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const SEED = 3; // the same days every time, so a hand-run day and a rule-run day can be compared fairly
// ages 8-12: the battery in words, not percentages
export const batteryWord = (k) => (k <= 0.05 ? 'Empty' : k < 0.35 ? 'Low' : k < 0.65 ? 'Half full' : k < 0.95 ? 'Nearly full' : 'Full');

export function createDesk(ctx, kit) {
  const j = !!ctx.junior; const reduce = !!ctx.settings?.reduceMotion; const pick = (o) => (j ? o.j : o.s);
  const host = ctx.root.parentElement; if (ctx.settings?.largeText) host?.classList.add('pw-large'); if (reduce) host?.classList.add('pw-still');
  const wrap = el(`<div class="pw-wrap"><div class="pw-win"><div class="pw-plate" aria-live="off"><b data-day></b><span data-clock></span><i class="pw-prog" hidden><u></u></i></div><div class="pw-label" aria-hidden="true">⚡ <span data-label>${esc(pick(T.title))}</span></div></div>
    <div class="pw-desk" data-mode="full"><div class="pw-side"></div><div class="pw-screen"></div><div class="pw-ctl"></div><div class="pw-full"></div></div></div>`);
  const top = el(`<div class="pw-top"><b class="who">${T.who}</b><p aria-live="polite"></p><button class="pw-say" type="button" aria-label="Read aloud">🔊</button></div>`);
  ctx.root.append(wrap, top);
  const $ = (sel) => wrap.querySelector(sel);
  const desk = $('.pw-desk'), win = $('.pw-win'), side = $('.pw-side'), screen = $('.pw-screen'), ctl = $('.pw-ctl'), full = $('.pw-full'), prog = $('.pw-prog');
  let spoken = '';
  // extra: a smaller second line. unseen: said aloud only, because the same words are already on the desk
  const say = (text, extra = '', unseen = false) => { spoken = extra ? `${text} ${extra}` : text; top.querySelector('p').innerHTML = esc(text) + (extra && !unseen ? `<small>${esc(extra)}</small>` : ''); ctx.say(spoken); };
  top.querySelector('.pw-say').onclick = () => ctx.say(spoken);
  // one click handler for the desk: buttons carry data-act (ends a wait) or are handled by the stage's own onTap
  let onTap = null; let waiting = null;
  wrap.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; if (b.dataset.act && waiting) { const w = waiting; waiting = null; w(b.dataset.act); return; } onTap?.(b); });
  const press = () => new Promise((res) => { waiting = res; });
  // when a panel's buttons are replaced the old focus is gone: put it on the new main control (the ring only shows for keyboard users)
  const focusFirst = (sel) => { const b = wrap.querySelector(sel); if (b && !b.disabled) { try { b.focus({ preventScroll: true }); } catch { b.focus(); } } };

  // ---- the window onto the town
  const view = createView(ctx, kit);
  let tick = null; let since = 9;
  let lastT = performance.now(); // real time between frames (the game's own step is capped, which would slow the clock on a slow device)
  ctx.engine.onFrame(() => { const now = performance.now(); const d = Math.min(1, Math.max(0, (now - lastT) / 1000)); lastT = now; since += d; if (since > 0.4) { since = 0; view.setRect(win.getBoundingClientRect()); } if (tick) tick(d); view.frame(d); });
  // the game's own keys and pointer are held off while the module is open (the page layer covers the 3D view)
  let onKey = null;
  const key = (e) => { e.stopPropagation(); if (e.type === 'keydown' && onKey && !e.ctrlKey && !e.metaKey && !e.altKey && onKey(e)) e.preventDefault(); };
  document.addEventListener('keydown', key, true); document.addEventListener('keyup', key, true);
  const timers = new Set(); const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const stopLater = (id) => { clearTimeout(id); timers.delete(id); };
  const sleep = (ms) => new Promise((r) => later(r, ms));
  ctx.onLeave(() => { document.removeEventListener('keydown', key, true); document.removeEventListener('keyup', key, true); for (const id of timers) clearTimeout(id); timers.clear(); tick = null; onTap = null; onKey = null; waiting = null; view.dispose(); host?.classList.remove('pw-large', 'pw-still', 'pw-fast'); });

  // ---- the dials (missions 3 and 4)
  const dialsHtml = () => `<div class="pw-dials" aria-label="Dials">
      ${[['wind', C.wind, T.dial.wind], ['sun', C.sun, T.dial.sun], ['battery', C.battery, T.dial.battery], ['homes', '#f2a33a', pick(T.dial.homes)]].map(([id, col, name]) => `<div class="pw-dial" data-d="${id}">${dialSvg(id, col)}<b>${esc(name)}</b><span data-v="${id}">–</span></div>`).join('')}
      <div class="pw-bars"><div><span>${esc(pick(T.dial.made))}</span><i><u data-bar="made" style="background:${C.wind}"></u></i><em data-n="made"></em></div><div><span>${esc(pick(T.dial.need))}</span><i><u data-bar="need" style="background:${C.need}"></u></i><em data-n="need"></em></div><p data-spare></p></div></div>`;
  const needle = (id, v) => { const k = Math.max(0, Math.min(1, v)); const n = wrap.querySelector(`[data-needle="${id}"]`), a = wrap.querySelector(`[data-arc="${id}"]`); if (n) { n.removeAttribute('transform'); n.style.transform = `rotate(${(-90 + k * 180).toFixed(1)}deg)`; } if (a) a.style.strokeDashoffset = (125.7 * (1 - k)).toFixed(1); };
  const val = (id, text) => { const s = wrap.querySelector(`[data-v="${id}"]`); if (s) s.textContent = text; };
  const barMax = Math.max(kit.wind * 1.25 + kit.solar, kit.peak * 1.3);
  function setDials(h) {
    if (!wrap.querySelector('.pw-dials')) return;
    needle('wind', h.wind / 1.25); needle('sun', h.sun); needle('battery', kit.cap ? h.levelBefore / kit.cap : 0); needle('homes', kit.homes.length ? h.litCount / kit.homes.length : 1);
    val('wind', j ? T.level.wind[h.wind >= WIND_STRONG ? 2 : h.wind < WIND_LOW ? 0 : 1] : units(kit.wind * h.wind, j));
    val('sun', j ? T.level.sun[h.sun >= SUN_BRIGHT ? 2 : h.sun > 0.08 ? 1 : 0] : units(kit.solar * h.sun, j));
    const lv = kit.cap ? h.levelBefore / kit.cap : 0; val('battery', `${j ? batteryWord(lv) : `${Math.round(lv * 100)}%`}${h.toBattery > 0.01 ? ' ▲' : h.fromBattery > 0.01 ? ' ▼' : ''}`);
    val('homes', `${h.litCount} of ${kit.homes.length}`); wrap.querySelector('[data-d="homes"]').classList.toggle('alert', h.dark > 0);
    for (const [id, v] of [['made', h.made], ['need', h.need]]) { wrap.querySelector(`[data-bar="${id}"]`).style.width = `${Math.min(100, (v / barMax) * 100).toFixed(1)}%`; wrap.querySelector(`[data-n="${id}"]`).textContent = j ? '' : `${Math.round(v * KW)} kW`; }
    const sp = wrap.querySelector('[data-spare]'); const spare = h.made - h.need;
    // when the battery makes up the whole gap, say so: "short of power" beside "every home lit" would read as a mistake
    const covered = spare < -0.05 && h.fromBattery > 0.01 && h.dark === 0 && h.schoolLit;
    sp.className = spare > 0.3 ? 'spare' : covered ? '' : spare < -0.05 ? 'short' : '';
    sp.textContent = spare > 0.3 ? (j ? '▲ Power to spare' : `▲ Surplus ${Math.round(spare * KW)} kW`) : covered ? (j ? '🔋 The battery fills the gap' : `🔋 Battery covers ${Math.round(-spare * KW)} kW`) : spare < -0.05 ? (j ? '▼ Short of power' : `▼ Shortfall ${Math.round(-spare * KW)} kW`) : (j ? 'Just enough' : 'Balanced');
  }
  const plate = (dayText, clockText) => { $('[data-day]').textContent = dayText; $('[data-clock]').textContent = clockText; };
  // show one hour of a modelled day everywhere: the sky, the windows, the dials and the clock
  function showHour(h, dayId, frac = 0) { view.setHour(h.clock + frac, isWinter(dayId)); view.setLit(h.lit, h.schoolLit); setDials(h); plate(pick(T.day[dayId] || T.day.today), clockWord(h.clock, j)); }
  const chart = (dayId, opts = {}) => `<div class="pw-chart">${daySvg(kit, dayId, { junior: j, seed: SEED, h: 150, ...opts })}</div>`;
  const keyRow = () => `<div class="pw-key">${legend(j)}</div>`;
  const allLit = () => kit.homes.map(() => true);
  // the town at rest: every home lit, a calm daytime sky
  const idle = (clock = 11) => { const fc = forecast('today', SEED); const f = fc.find((x) => x.clock === clock) || fc[5]; const h = stepHour(kit, f, kit.cap * START_LEVEL, 'hold'); view.setHour(clock, false); view.setLit(allLit(), true); setDials(h); };

  // ---- the desk's layout: 'desk' (side, screen, controls) or 'full' (one wide panel)
  const mode = (m, sideClass = '') => { desk.dataset.mode = m; side.className = `pw-side ${sideClass}`.trim(); prog.hidden = true; if (m === 'full') { side.innerHTML = ''; screen.innerHTML = ''; ctl.innerHTML = ''; } else full.innerHTML = ''; };
  const useDials = () => { mode('desk', 'dials'); side.innerHTML = dialsHtml(); };
  const label = (text) => { $('[data-label]').textContent = text; };

  return {
    ctx, kit, j, pick, reduce, host, wrap, desk, win, side, screen, ctl, full, prog, say, press, focusFirst, view, later, stopLater, sleep,
    setTap: (fn) => { onTap = fn; }, setKey: (fn) => { onKey = fn; }, setTick: (fn) => { tick = fn; },
    showHour, setDials, plate, chart, keyRow, idle, allLit, mode, useDials, label, HOURS,
    report: (stage) => ctx.report({ stage }),
  };
}
