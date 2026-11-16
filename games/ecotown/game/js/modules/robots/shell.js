// Robots at work: the one frame every screen of the hour is drawn in (ctx.root). A header (the mission and its steps),
// Florence's line, the page and a footer for the buttons. Page only. One shell lasts the whole visit; each screen
// calls setup() to change the header, then fills main and foot.
import { florenceSvg, workshopSvg } from './pictures.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const GUARD = 300; // ms: a second press sooner than this is taken as the same press

export function createShell(ctx) {
  const root = ctx.root; const still = !!ctx.settings?.reduceMotion; const junior = !!ctx.junior;
  root.innerHTML = `<div class="rb ${junior ? 'junior' : 'senior'}${still ? ' still' : ''}${ctx.settings?.largeText ? ' large' : ''}">
    <div class="rb-bg">${workshopSvg()}</div>
    <header class="rb-head"><div class="rb-headin"><span class="rb-mis" hidden></span><ol class="rb-steps" aria-label="Steps"></ol></div></header>
    <div class="rb-say"><span class="rb-flo">${florenceSvg(46)}</span><p aria-live="polite"></p></div>
    <section class="rb-main"></section><footer class="rb-foot"></footer></div>`;
  const el = root.firstElementChild; const main = el.querySelector('.rb-main'); const foot = el.querySelector('.rb-foot'); const line = el.querySelector('.rb-say p'); const head = el.querySelector('.rb-head');
  const steps = el.querySelector('.rb-steps'); const mis = el.querySelector('.rb-mis');
  let keys = false; // the last input was the keyboard: move focus for the child after the page changes
  el.addEventListener('keydown', () => { keys = true; }, true); el.addEventListener('pointerdown', () => { keys = false; }, true);
  const timers = new Set(); const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!ctx.signal.aborted) fn(); }, ms); timers.add(t); return t; };
  ctx.onLeave(() => { for (const t of timers) clearTimeout(t); timers.clear(); });
  const say = (text) => { line.textContent = text; ctx.say(text); };
  // The header sits beside the loader's Back button when there is room, and under it when there is not
  // (large text, a narrow screen). Measured, because the button's width follows the text size.
  function fitHead() {
    const back = root.parentElement?.querySelector('.modback'); if (!back) return;
    const b = back.getBoundingClientRect(); const e = el.getBoundingClientRect(); const cs = getComputedStyle(el); const padL = parseFloat(cs.paddingLeft) || 0; const padT = parseFloat(cs.paddingTop) || 0;
    const inner = head.firstElementChild; const left = b.right - e.left + 12; const room = e.width - left - padL; const under = inner.scrollWidth > room;
    head.style.paddingLeft = under ? '0px' : `${Math.max(0, left - padL)}px`; head.style.paddingTop = under ? `${Math.max(0, b.bottom - e.top + 8 - padT)}px` : '0px';
    head.style.minHeight = under ? '0px' : `${Math.max(0, b.bottom - e.top - padT)}px`; el.classList.toggle('under', under);
  }
  // when a page is taller than the room for it, its bottom edge fades out until the child scrolls to the end
  const mainCue = () => { main.classList.toggle('more', main.scrollHeight - main.scrollTop - main.clientHeight > 8); };
  main.addEventListener('scroll', mainCue, { passive: true }); const watch = new MutationObserver(() => requestAnimationFrame(mainCue)); watch.observe(main, { childList: true, subtree: true }); ctx.onLeave(() => watch.disconnect());
  const onResize = () => { fitHead(); mainCue(); }; window.addEventListener('resize', onResize); ctx.onLeave(() => window.removeEventListener('resize', onResize));
  try { document.fonts?.ready?.then(() => { if (!ctx.signal.aborted) fitHead(); }); } catch { /* no font loading here */ }
  let stepNames = [];
  // setup({ mission: { n, icon, short } | null, steps: ['Show', …] , stage }): a new screen
  function setup({ mission = null, steps: list = [], stage = '' } = {}) {
    el.classList.remove('out'); el.querySelector('.rb-say').hidden = false; delete el.dataset.moving; main.scrollTop = 0;
    el.dataset.stage = stage; el.dataset.mission = mission ? String(mission.n) : '';
    mis.hidden = !mission; mis.innerHTML = mission ? `<i aria-hidden="true">${esc(mission.icon)}</i><b>${junior ? 'Mission' : 'Mission'} ${mission.n}<small> of 6</small></b>` : '';
    stepNames = list; steps.hidden = !list.length;
    steps.innerHTML = list.map((s, i) => `<li data-step="${i}"><i>${i + 1}</i><b>${esc(s)}</b></li>`).join('');
    fitHead();
  }
  const step = (n) => { steps.querySelectorAll('li').forEach((li, i) => { li.className = i < n ? 'done' : i === n ? 'on' : ''; if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); }); fitHead(); };
  const stage = (s) => { el.dataset.stage = s; };
  const focusSoon = (sel) => { if (keys) (main.querySelector(sel) || foot.querySelector(sel))?.focus(); };
  const wait = (fn) => new Promise((res) => fn(res));
  const guard = () => { let last = 0; return () => { const t = Date.now(); if (t - last < GUARD) return false; last = t; return true; }; };
  // a footer of buttons [{ act, label, go?, alt? }] and a hint; resolves with the act pressed
  function buttons(hint, list, focus = null) {
    foot.innerHTML = `${hint ? `<p class="rb-hint">${hint}</p>` : ''}${list.map((b) => `<button type="button" class="rb-btn ${b.go ? 'go' : 'alt'}" data-act="${b.act}"${b.off ? ' disabled' : ''}>${esc(b.label)}${b.go ? ' ➜' : ''}</button>`).join('')}`;
    const fresh = guard();
    return wait((done) => { foot.querySelectorAll('[data-act]').forEach((b) => { b.onclick = () => { if (fresh()) done(b.dataset.act); }; }); if (keys) (foot.querySelector(focus || '.rb-btn.go') || foot.querySelector('[data-act]'))?.focus(); });
  }
  fitHead();
  return { el, main, foot, line, head, say, setup, step, stage, focusSoon, later, wait, guard, buttons, fitHead, still, junior, keys: () => keys, steps: () => stepNames };
}
export { esc };
