// "Power control room": one module of Eco Town of the future (docs/MODULES.md, docs/more-modules-plan.md section 6).
// The loop: run the town's power by hand through one day (charge / hold / use the battery, hour by hour) → write rules
// from tiles for the system to follow by itself → watch the rules run a windy day, a still day and a winter night →
// see the hour homes went dark, change the rules, run again → compare the hand-run day with the rule-run days.
// The hour-by-hour model: model.js. The rules and their interpreter: rules.js. Words and the record: words.js.
// Drawings: chart.js. The window onto the town: view.js. What is left in the town: town.js.
import { MODES, TEST_DAYS, HOURS, START_LEVEL, KW, WIND_STRONG, WIND_LOW, SUN_BRIGHT, kitFrom, forecast, stepHour, runModes } from './model.js';
import { cleanRules, whensFor, maxRules, testRules, explain, draftFromHand, compare, sameRules } from './rules.js';
import { T, clockWord, intro, handAsk, handAskStep, HINT, handSummary, handDoneSay, whenWord, whenNote, whenIcon, thenWord, rulesSpoken, rulesAsk, needRule, maxSay, testSay, gapLines, gapFix, resultsSay, unusedLine, longestLine, dayScore, compareLines, compareSay, madeTitle, madeLines, practised, units } from './words.js';
import { daySvg, legend, picture, dialSvg, C } from './chart.js';
import { createView } from './view.js';
import { show } from './town.js';

const P = '#module[data-module="power"]';
const css = `
${P} { --pw-fs: 16px; }
${P}.pw-large { --pw-fs: 19px; }
${P} .pw-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; font-size: var(--pw-fs); touch-action: manipulation; }
${P} .pw-win { position: relative; flex: 1 1 auto; min-height: 150px; }
${P} .pw-win::before { content: ''; position: absolute; inset: 0; border: 12px solid #8a6238; border-bottom-width: 16px; border-radius: 0 0 22px 22px; box-shadow: inset 0 0 0 3px #5e4124, inset 0 0 0 6px #c79a62; pointer-events: none; }
${P} .pw-plate { position: absolute; right: 26px; top: 24px; display: grid; justify-items: end; gap: 0; padding: 6px 14px 8px; min-width: 7.2em; border-radius: 14px; background: #2b3358; color: #fff; box-shadow: inset 0 0 0 2px #151a33, 0 4px 0 #151a33; }
${P} .pw-label { position: absolute; left: 26px; bottom: 26px; padding: 4px 12px; border-radius: 9px; background: #c79a62; color: #3b2a1e; font: 800 .8em Bricolage, Inter, system-ui, sans-serif; letter-spacing: .04em; text-transform: uppercase; box-shadow: inset 0 0 0 2px #8a6238, 0 2px 0 #5e4124; }
${P} .pw-plate b { font: 800 .85em Inter, system-ui, sans-serif; letter-spacing: .02em; color: #ffd66b; }
${P} .pw-plate span { font: 800 1.45em Bricolage, Inter, system-ui, sans-serif; font-variant-numeric: tabular-nums; line-height: 1.15; white-space: nowrap; }
${P} .pw-prog { justify-self: stretch; margin-top: 3px; display: block; height: 6px; border-radius: 3px; background: #4a5384; overflow: hidden; } ${P} .pw-prog u { display: block; height: 100%; width: 0; background: #ffd66b; }
${P} .pw-prog[hidden] { display: none; }
${P} .pw-top { position: absolute; left: 230px; right: 200px; top: 22px; max-width: 720px; display: flex; gap: 10px; align-items: flex-start; padding: 10px 14px; border-radius: 14px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; font-size: var(--pw-fs); }
${P} .pw-top b.who { flex: none; padding: 2px 10px; border-radius: 10px; background: #2e9b5a; color: #fff; font-weight: 800; font-size: .85em; }
${P} .pw-top p { margin: 0; flex: 1; font-size: 1em; line-height: 1.35; font-weight: 600; }
${P} .pw-top p small { display: block; margin-top: 4px; font-size: .88em; font-weight: 600; color: #5e4936; }
${P} button { font: 800 1em Inter, system-ui, sans-serif; color: #3b2a1e; cursor: pointer; border: 0; border-radius: 12px; min-height: 44px; padding: 6px 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; }
${P} button:focus-visible { outline: 3px solid #1c6fd0; outline-offset: 2px; }
${P} button[disabled] { color: #8a7a6a; box-shadow: inset 0 0 0 2px #d2c4ac; cursor: default; }
${P} button.go { background: #2e9b5a; color: #fff; box-shadow: inset 0 0 0 2px #1f7442, 0 3px 0 #1a5a34; }
${P} button.go[disabled] { background: #c9d6c6; color: #5c6b5c; box-shadow: inset 0 0 0 2px #aab8a8; }
${P} .pw-say { flex: none; min-width: 44px; padding: 6px; }
${P} .pw-desk { flex: none; display: grid; grid-template-columns: minmax(210px, 250px) minmax(0, 1fr) minmax(190px, 236px); gap: 10px; padding: 10px 12px 12px; max-height: 58vh; background: #e7cf9f; box-shadow: inset 0 3px 0 #f6e6c2, inset 0 0 0 2px #b08a55; border-top: 4px solid #7a5a33; }
${P} .pw-desk > div { min-width: 0; min-height: 0; border-radius: 14px; background: #f3e4c6; box-shadow: inset 0 0 0 2px #c9a871; padding: 8px 10px; }
${P} .pw-dials { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; align-content: start; }
${P} .pw-dial { display: grid; justify-items: center; padding: 4px 2px 5px; border-radius: 10px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; text-align: center; }
${P} .pw-dial svg { width: 74px; height: auto; display: block; }
${P} .pw-dial b { font-size: .8em; line-height: 1.1; color: #5e4936; }
${P} .pw-dial span { font: 800 1em Bricolage, Inter, system-ui, sans-serif; line-height: 1.15; white-space: nowrap; }
${P} .pw-dial.alert { box-shadow: inset 0 0 0 3px #b5432c; } ${P} .pw-dial.alert span { color: #9a3220; }
${P} .pw-needle, ${P} .pw-arc { transition: transform .45s ease, stroke-dashoffset .45s ease; transform-origin: 50px 54px; }
${P}.pw-still .pw-needle, ${P}.pw-still .pw-arc, ${P}.pw-still .pw-bars u { transition: none; }
${P} .pw-bars { grid-column: 1 / -1; display: grid; gap: 4px; padding: 6px 8px; border-radius: 10px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; }
${P} .pw-bars div { display: grid; grid-template-columns: 7.8em 1fr auto; align-items: center; gap: 6px; font-size: .8em; font-weight: 700; color: #5e4936; }
${P} .pw-bars i { display: block; height: 12px; border-radius: 6px; background: #e6d3b0; overflow: hidden; } ${P} .pw-bars u { display: block; height: 100%; width: 0; border-radius: 6px; transition: width .45s ease; }
${P} .pw-bars em { font-style: normal; font-weight: 800; color: #3b2a1e; min-width: 1.5em; text-align: right; font-variant-numeric: tabular-nums; }
${P} .pw-bars p { margin: 0; font-size: .8em; font-weight: 800; text-align: center; } ${P} .pw-bars p.spare { color: #1f7442; } ${P} .pw-bars p.short { color: #9a3220; }
${P} .pw-screen { overflow: auto; display: flex; flex-direction: column; gap: 6px; }
${P} .pw-screen h3 { margin: 0; font: 800 1.05em Bricolage, Inter, system-ui, sans-serif; }
${P} .pw-screen h3 small { font: 700 .8em Inter, system-ui, sans-serif; color: #5e4936; margin-left: 8px; }
${P} .pw-chart { border-radius: 10px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; padding: 6px 6px 2px; }
${P} .pw-chart svg { display: block; width: 100%; height: auto; max-height: 30vh; }
${P} .pw-key svg { display: block; width: min(100%, 420px); height: auto; }
${P} .pw-lines { margin: 0; padding: 0; list-style: none; font-size: .95em; font-weight: 600; line-height: 1.35; } ${P} .pw-lines li + li { margin-top: 2px; }
${P} .pw-lines li.fix { color: #1f5f8a; font-weight: 800; } ${P} .pw-lines li.note { color: #5e4936; font-size: .92em; }
${P} .pw-ctl { display: flex; flex-direction: column; gap: 8px; justify-content: center; }
${P} .pw-ctl h4 { margin: 0; font: 800 .95em Bricolage, Inter, system-ui, sans-serif; text-align: center; }
${P} .pw-ctl p { margin: 0; font-size: .85em; font-weight: 600; color: #5e4936; text-align: center; line-height: 1.3; }
${P} .pw-modes { display: flex; flex-direction: column; gap: 7px; }
${P} .pw-modes button { display: grid; grid-template-columns: 1.9em 1fr 1.2em; align-items: center; column-gap: 6px; text-align: left; min-height: 58px; padding: 6px 10px; font-size: 1.1em; }
${P} .pw-modes button i { font-style: normal; font-size: 1.35em; grid-row: 1 / span 2; }
${P} .pw-modes button small { grid-column: 2; display: block; font-size: .7em; font-weight: 600; color: #5e4936; line-height: 1.2; }
${P} .pw-modes button u { grid-row: 1 / span 2; grid-column: 3; text-decoration: none; font-size: 1em; visibility: hidden; }
${P} .pw-modes button[aria-pressed="true"] { transform: translateY(2px); } ${P} .pw-modes button[aria-pressed="true"] u { visibility: visible; }
${P} .pw-modes button[data-mode="charge"][aria-pressed="true"] { background: #e7dcfa; box-shadow: inset 0 0 0 4px #7a48c9, 0 1px 0 #4f2b8c; }
${P} .pw-modes button[data-mode="hold"][aria-pressed="true"] { background: #e4e7ee; box-shadow: inset 0 0 0 4px #5a6480, 0 1px 0 #3b4258; }
${P} .pw-modes button[data-mode="use"][aria-pressed="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 4px #c8553d, 0 1px 0 #8a3a2a; }
${P} .pw-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; } ${P} .pw-row.end { justify-content: flex-end; } ${P} .pw-row > button { flex: 1 1 auto; }
${P} .pw-how { margin: 0; font-size: .88em; font-weight: 600; color: #5e4936; }
${P} ol.pw-rules { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
${P} ol.pw-rules li { display: grid; grid-template-columns: 1.7em minmax(0, 1.25fr) auto minmax(0, 1fr) auto; align-items: center; gap: 6px; }
${P} .pw-n { display: grid; place-items: center; width: 1.7em; height: 1.7em; border-radius: 50%; background: #3b2a1e; color: #fff; font-weight: 800; font-size: .9em; }
${P} .pw-tile { display: flex; align-items: center; gap: 8px; text-align: left; min-height: 50px; padding: 5px 10px; background: #e3effb; box-shadow: inset 0 0 0 2px #7fb0e6, 0 3px 0 #5b8dc4; line-height: 1.2; }
${P} .pw-tile i { font-style: normal; font-size: 1.25em; flex: none; } ${P} .pw-tile small { display: block; font-size: .68em; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: #46617f; }
${P} .pw-tile.then { background: #fff3cf; box-shadow: inset 0 0 0 2px #d9a441, 0 3px 0 #b07f22; } ${P} .pw-tile.then small { color: #7a5a1e; }
${P} .pw-arrow { font-weight: 800; color: #5e4936; }
${P} .pw-ops { display: flex; gap: 4px; } ${P} .pw-ops button { min-width: 44px; padding: 4px; }
${P} ol.pw-rules li.pw-else { grid-template-columns: 1.7em 1fr; font-size: .9em; font-weight: 700; color: #5e4936; } ${P} li.pw-else .pw-n { background: #b9a888; }
${P} .pw-pick { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 7px; }
${P} .pw-pick button { display: grid; grid-template-columns: 1.6em 1fr; column-gap: 6px; align-items: center; text-align: left; min-height: 54px; padding: 5px 10px; line-height: 1.2; background: #e3effb; box-shadow: inset 0 0 0 2px #7fb0e6, 0 3px 0 #5b8dc4; }
${P} .pw-pick.then button { background: #fff3cf; box-shadow: inset 0 0 0 2px #d9a441, 0 3px 0 #b07f22; }
${P} .pw-pick button i { font-style: normal; font-size: 1.3em; grid-row: 1 / span 2; } ${P} .pw-pick button small { grid-column: 2; font-size: .72em; font-weight: 600; color: #5e4936; }
${P} .pw-pick button[aria-current="true"] { box-shadow: inset 0 0 0 4px #c8553d, 0 3px 0 #7a5a33; }
${P} .pw-toggle { display: grid; grid-template-columns: 1.6em 1fr auto; align-items: center; gap: 6px; text-align: left; line-height: 1.2; font-size: .92em; }
${P} .pw-toggle small { display: block; font-size: .82em; font-weight: 600; color: #5e4936; margin-top: 2px; }
${P} .pw-toggle em { font-style: normal; padding: 2px 8px; border-radius: 9px; background: #d2c4ac; color: #3b2a1e; font-size: .9em; }
${P} .pw-toggle[aria-pressed="true"] { background: #dff3e4; box-shadow: inset 0 0 0 3px #2e9b5a, 0 3px 0 #1a5a34; } ${P} .pw-toggle[aria-pressed="true"] em { background: #2e9b5a; color: #fff; }
${P} .pw-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
${P} .pw-tabs button { display: grid; gap: 1px; padding: 5px 8px; text-align: left; line-height: 1.2; font-size: .92em; } ${P} .pw-tabs button small { font-size: .82em; font-weight: 700; color: #5e4936; }
${P} .pw-tabs button[aria-pressed="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 3px #c8553d, 0 3px 0 #7a5a33; }
${P} .pw-tabs button .tag { font-weight: 800; } ${P} .pw-tabs button .tag.ok { color: #1f7442; } ${P} .pw-tabs button .tag.dark { color: #2b3358; }
${P} .pw-hour { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px; } ${P} .pw-hour b { min-width: 5.2em; text-align: center; font: 800 1.05em Bricolage, Inter, system-ui, sans-serif; } ${P} .pw-hour button { min-width: 48px; }
${P} .pw-hour span { font-size: .85em; font-weight: 700; color: #5e4936; }
${P} .pw-cmp { display: grid; gap: 6px; } ${P} .pw-cmp div { display: grid; grid-template-columns: minmax(9em, auto) 1fr 5.6em; align-items: center; gap: 8px; font-weight: 800; font-size: .95em; }
${P} .pw-cmp i { display: block; height: 20px; border-radius: 10px; background: #2b3358; overflow: hidden; box-shadow: inset 0 0 0 2px #151a33; } ${P} .pw-cmp u { display: block; height: 100%; background: #f6c453; border-radius: 10px 0 0 10px; }
${P} .pw-cmp em { font-style: normal; text-align: right; font-variant-numeric: tabular-nums; }
@media (max-width: 900px) {
  ${P} .pw-top { left: 22px; right: 22px; top: calc(4.2 * var(--pw-fs) + 26px); } ${P} .pw-plate { top: 20px; right: 22px; padding: 4px 12px 6px; }
  ${P} .pw-desk { grid-template-columns: 1fr; grid-auto-rows: max-content; gap: 8px; max-height: 68vh; overflow: auto; }
  ${P} .pw-dial svg { width: 58px; } ${P} .pw-chart svg { max-height: 21vh; } ${P} .pw-label { display: none; }
  ${P} .pw-ctl { flex-direction: row; flex-wrap: wrap; align-items: stretch; } ${P} .pw-ctl > * { flex: 1 1 200px; } ${P} .pw-ctl > .pw-modes, ${P} .pw-ctl > h4, ${P} .pw-ctl > p { flex-basis: 100%; }
  ${P} .pw-dials { grid-template-columns: repeat(4, 1fr); } ${P} .pw-modes { flex-direction: row; } ${P} .pw-modes button { flex: 1 1 0; grid-template-columns: 1.6em 1fr; } ${P} .pw-modes button u { display: none; }
  ${P} .pw-screen { overflow: visible; }
}
@media (max-width: 560px) { ${P} .pw-dials { grid-template-columns: 1fr 1fr; } ${P} ol.pw-rules li { grid-template-columns: 1.7em 1fr; } ${P} .pw-arrow { display: none; } ${P} .pw-modes button small { display: none; } }
@media (max-height: 640px) { ${P} .pw-dial svg { width: 54px; } ${P} .pw-modes button { min-height: 48px; } ${P} .pw-desk { padding: 6px 8px 8px; } }
`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const SEED = 3;               // the same days every time, so a hand-run day and a rule-run day can be compared fairly
const HOUR_MS = 2400;         // one hour of the hand-run day
const STILL_MS = 1300;        // one still view of a rule-run day, with reduced motion
const TEST_MS = 420;          // one hour while the rules run
const LETTER = { c: 'charge', h: 'hold', u: 'use' };
const readHand = (s) => (typeof s === 'string' && s.length === HOURS && [...s].every((c) => LETTER[c]) ? [...s].map((c) => LETTER[c]) : null);

async function run(ctx) {
  const j = !!ctx.junior; const reduce = !!ctx.settings?.reduceMotion; const pick = (o) => (j ? o.j : o.s);
  const kit = kitFrom(ctx.town?.cells, ctx.town?.terrain?.tiles);
  // ---- what is kept between visits (never anything typed: there is no typing here)
  const saved = ctx.saved && ctx.saved.v === 1 ? ctx.saved : null;
  const st = { hand: readHand(saved?.hand), rules: cleanRules(saved?.rules, j), tests: 0, changed: !!saved?.changed, improved: !!saved?.improved, test: null, prev: null, tested: null, handNow: false };
  const keep = (stage) => ctx.save({ v: 1, stage, hand: st.hand ? st.hand.map((m) => m[0]).join('') : '', rules: st.rules, changed: st.changed, improved: st.improved });
  const report = (id) => ctx.report({ stage: T.stage[id] });

  // ---- the page: a window onto the town, and the desk under it
  const host = ctx.root.parentElement; if (ctx.settings?.largeText) host?.classList.add('pw-large'); if (reduce) host?.classList.add('pw-still');
  const wrap = el(`<div class="pw-wrap"><div class="pw-win"><div class="pw-plate" aria-live="off"><b data-day></b><span data-clock></span><i class="pw-prog" hidden><u></u></i></div><div class="pw-label" aria-hidden="true">⚡ ${esc(pick(T.title))}</div></div>
    <div class="pw-desk"><div class="pw-dials" aria-label="Dials">
      ${[['wind', C.wind, T.dial.wind], ['sun', C.sun, T.dial.sun], ['battery', C.battery, T.dial.battery], ['homes', '#f2a33a', pick(T.dial.homes)]].map(([id, col, name]) => `<div class="pw-dial" data-d="${id}">${dialSvg(id, col)}<b>${esc(name)}</b><span data-v="${id}">–</span></div>`).join('')}
      <div class="pw-bars"><div><span>${esc(pick(T.dial.made))}</span><i><u data-bar="made" style="background:${C.wind}"></u></i><em data-n="made"></em></div><div><span>${esc(pick(T.dial.need))}</span><i><u data-bar="need" style="background:${C.need}"></u></i><em data-n="need"></em></div><p data-spare></p></div>
    </div><div class="pw-screen"></div><div class="pw-ctl"></div></div></div>`);
  const top = el(`<div class="pw-top"><b class="who">${T.who}</b><p aria-live="polite"></p><button class="pw-say" type="button" aria-label="Read aloud">🔊</button></div>`);
  ctx.root.append(wrap, top);
  const $ = (sel) => wrap.querySelector(sel); const win = $('.pw-win'), screen = $('.pw-screen'), ctl = $('.pw-ctl'), prog = $('.pw-prog');
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
  ctx.onLeave(() => { document.removeEventListener('keydown', key, true); document.removeEventListener('keyup', key, true); for (const id of timers) clearTimeout(id); timers.clear(); tick = null; onTap = null; onKey = null; waiting = null; view.dispose(); host?.classList.remove('pw-large', 'pw-still'); });

  // ---- the dials
  const needle = (id, v) => { const k = Math.max(0, Math.min(1, v)); const n = wrap.querySelector(`[data-needle="${id}"]`), a = wrap.querySelector(`[data-arc="${id}"]`); if (n) { n.removeAttribute('transform'); n.style.transform = `rotate(${(-90 + k * 180).toFixed(1)}deg)`; } if (a) a.style.strokeDashoffset = (125.7 * (1 - k)).toFixed(1); };
  const val = (id, text) => { const s = wrap.querySelector(`[data-v="${id}"]`); if (s) s.textContent = text; };
  const barMax = Math.max(kit.wind * 1.25 + kit.solar, kit.peak * 1.3);
  function setDials(h) {
    needle('wind', h.wind / 1.25); needle('sun', h.sun); needle('battery', kit.cap ? h.levelBefore / kit.cap : 0); needle('homes', kit.homes.length ? h.litCount / kit.homes.length : 1);
    val('wind', j ? T.level.wind[h.wind >= WIND_STRONG ? 2 : h.wind < WIND_LOW ? 0 : 1] : units(kit.wind * h.wind, j));
    val('sun', j ? T.level.sun[h.sun >= SUN_BRIGHT ? 2 : h.sun > 0.08 ? 1 : 0] : units(kit.solar * h.sun, j));
    val('battery', `${Math.round((kit.cap ? h.levelBefore / kit.cap : 0) * 100)}%${h.toBattery > 0.01 ? ' ▲' : h.fromBattery > 0.01 ? ' ▼' : ''}`);
    val('homes', `${h.litCount} of ${kit.homes.length}`); wrap.querySelector('[data-d="homes"]').classList.toggle('alert', h.dark > 0);
    for (const [id, v] of [['made', h.made], ['need', h.need]]) { wrap.querySelector(`[data-bar="${id}"]`).style.width = `${Math.min(100, (v / barMax) * 100).toFixed(1)}%`; wrap.querySelector(`[data-n="${id}"]`).textContent = j ? '' : `${Math.round(v * KW)} kW`; }
    const sp = wrap.querySelector('[data-spare]'); const spare = h.made - h.need;
    sp.className = spare > 0.3 ? 'spare' : spare < -0.05 ? 'short' : ''; sp.textContent = spare > 0.3 ? (j ? '▲ Power to spare' : `▲ Surplus ${Math.round(spare * KW)} kW`) : spare < -0.05 ? (j ? '▼ Short of power' : `▼ Shortfall ${Math.round(-spare * KW)} kW`) : (j ? 'Just enough' : 'Balanced');
  }
  const plate = (dayId, clock) => { $('[data-day]').textContent = pick(T.day[dayId]); $('[data-clock]').textContent = clockWord(clock, j); };
  // show one hour everywhere: the sky, the windows, the dials and the clock
  function showHour(h, dayId, frac = 0) { view.setHour(h.clock + frac, dayId === 'winter'); view.setLit(h.lit, h.schoolLit); setDials(h); plate(dayId, h.clock); }
  const chart = (dayId, opts = {}) => `<div class="pw-chart">${daySvg(kit, dayId, { junior: j, seed: SEED, h: 150, ...opts })}</div>`;
  const keyRow = () => `<div class="pw-key">${legend(j)}</div>`;
  const today = forecast('today', SEED); const startLevel = kit.cap * START_LEVEL;
  const idle = () => { const h = stepHour(kit, today[0], startLevel, 'hold'); showHour(h, 'today'); };

  // ================= 1. at the desk
  async function meet() {
    report('intro'); idle(); const again = !!(st.hand || st.rules.list.length); const lines = intro(kit, j, again);
    screen.innerHTML = `<h3>${esc(pick(T.forecast))}<small>${esc(pick(T.dayNote.today))}</small></h3>${chart('today')}${keyRow()}`;
    say(lines[0], lines.slice(1, -1).join(' ')); ctl.innerHTML = `<button class="go" type="button" data-act="next">${T.next}</button>`; focusFirst('[data-act]'); await press();
    say(lines[lines.length - 1]);
    ctl.innerHTML = `<button class="go" type="button" data-act="hand">${pick(T.start)}</button>${again ? `<button type="button" data-act="rules">${pick(T.skip)}</button>` : ''}`; focusFirst('[data-act]');
    return press();
  }

  // ================= 2. one day by hand
  function hand() {
    report('hand'); const hours = []; const modes = []; let i = 0, level = startLevel, mode = 'hold', frac = 0, paused = false; const said = {};
    say(reduce ? handAskStep(j) : handAsk(j));
    ctl.innerHTML = `<div class="pw-modes" role="group" aria-label="Battery">${MODES.map((m, n) => `<button type="button" data-mode="${m}" aria-pressed="${m === mode}" aria-keyshortcuts="${n + 1}"><i aria-hidden="true">${T.modeIcon[m]}</i><span>${esc(pick(T.mode[m]))}</span><u aria-hidden="true">✓</u><small>${esc(pick(T.modeHint[m]))}</small></button>`).join('')}</div>
      <div class="pw-row">${reduce ? `<button class="go" type="button" data-hour>${pick(T.nextHour)}</button>` : `<button type="button" data-pause>${T.pause}</button>`}</div>`;
    prog.hidden = reduce;
    const draw = () => { screen.innerHTML = `<h3>${esc(pick(T.forecast))}<small>${esc(pick(T.dayNote.today))}</small></h3>${chart('today', { hours, cursor: i })}${keyRow()}`; };
    let trouble = false; let touched = false; // the first instruction stays up until the child has chosen something or an hour has gone by
    const hint = (h) => {
      if (i === 0 && !touched) return; let id = null;
      if (h.dark > 0 && mode === 'charge' && h.toBattery > 0.01) id = 'robbed';
      else if ((h.dark > 0 || !h.schoolLit) && mode !== 'use' && h.levelBefore > kit.cap * 0.05) id = 'short';
      else if (mode === 'use' && h.need > h.made + 0.05 && h.levelBefore <= kit.cap * 0.02) id = 'empty';
      else if (h.made - h.need > Math.max(1, kit.peak * 0.12) && mode !== 'charge' && h.levelBefore < kit.cap - 0.5) id = 'spare';
      else if (mode === 'charge' && h.levelBefore >= kit.cap - 0.01) id = 'full';
      else if (h.clock === 17) id = 'dusk';
      if (id && !said[id]) { said[id] = 1; trouble = ['short', 'robbed', 'empty'].includes(id); say(pick(HINT[id])); }
      else if (trouble && h.dark === 0 && h.schoolLit) { trouble = false; say(pick(HINT.back)); }
    };
    const preview = () => { const h = stepHour(kit, today[i], level, mode); showHour(h, 'today', reduce ? 0 : Math.min(frac, 0.99)); hint(h); return h; };
    return new Promise((res) => {
      const commit = () => {
        const h = stepHour(kit, today[i], level, mode); h.rule = -1; hours.push(h); modes.push(mode); level = h.level; i++; frac = 0;
        if (i >= HOURS) { tick = null; onTap = null; onKey = null; prog.hidden = true; st.hand = modes; st.handNow = true; res(); return; }
        draw(); preview();
      };
      const setMode = (m) => { if (!MODES.includes(m) || m === mode) return; mode = m; touched = true; ctl.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode))); ctx.engine.audio?.tap?.(); preview(); };
      onTap = (b) => {
        if (b.dataset.mode) setMode(b.dataset.mode);
        else if ('hour' in b.dataset) commit();
        else if ('pause' in b.dataset) { paused = !paused; b.textContent = paused ? T.resume : T.pause; b.classList.toggle('go', paused); }
      };
      onKey = (e) => { const n = ['1', '2', '3'].indexOf(e.key); if (n < 0) return false; setMode(MODES[n]); return true; };
      tick = reduce ? null : (dt) => { if (paused) return; frac += (dt * 1000) / HOUR_MS; prog.firstElementChild.style.width = `${Math.min(100, frac * 100).toFixed(0)}%`; if (frac >= 1) commit(); else view.setHour(today[i].clock + frac, false); };
      draw(); preview(); focusFirst(reduce ? '[data-hour]' : `[data-mode="${mode}"]`);
    });
  }
  async function handDone() {
    report('handDone'); keep('rules'); const day = runModes(kit, 'today', st.hand, { seed: SEED }); const lines = handSummary(kit, day, j);
    const at = day.worst >= 0 ? day.hours[day.worst] : day.hours[15]; showHour(at, 'today');
    screen.innerHTML = `<h3>${esc(pick(T.day.today))}: ${esc(pick(T.byHand).toLowerCase())}<small>${esc(dayScore(day, j))}</small></h3>${chart('today', { hours: day.hours, cursor: at.i, mark: day.worst })}<ul class="pw-lines">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
    say(handDoneSay(j), lines.join(' '), true);
    ctl.innerHTML = `<button class="go" type="button" data-act="rules">${pick(T.toRules)}</button><button type="button" data-act="again">${pick(T.again)}</button>`; focusFirst('[data-act]');
    return press();
  }

  // ================= 3. rules from tiles
  function rulesEdit(first, draft) {
    report('rules'); keep('rules'); const max = maxRules(j); const whens = whensFor(j); const list = st.rules.list;
    // while the rules are open the window shows the hour the last test went darkest (or a calm evening)
    const gapDay = st.test?.days.find((d) => !d.allLit); if (gapDay) showHour(gapDay.hours[gapDay.worst], gapDay.dayId); else { const h = stepHour(kit, today[13], startLevel, 'use'); showHour(h, 'today'); }
    say(rulesAsk(j, draft, first), pick(T.rulesHow));
    return new Promise((res) => {
      const main = (focus) => {
        screen.innerHTML = `<h3>${esc(pick(T.rulesHead))}<small>${list.length} of ${max}</small></h3>
          <ol class="pw-rules">${list.map((r, n) => `<li><span class="pw-n" aria-hidden="true">${n + 1}</span>
            <button type="button" class="pw-tile when" data-edit="when" data-n="${n}" aria-label="Rule ${n + 1}, when: ${esc(whenWord(r.when, j))}. Change"><i aria-hidden="true">${whenIcon(r.when)}</i><span><small>${T.whenLabel}</small>${esc(whenWord(r.when, j))}</span></button><span class="pw-arrow" aria-hidden="true">➜</span>
            <button type="button" class="pw-tile then" data-edit="then" data-n="${n}" aria-label="Rule ${n + 1}, do: ${esc(thenWord(r.then, j))}. Change"><i aria-hidden="true">${T.modeIcon[r.then]}</i><span><small>${T.thenLabel}</small>${esc(pick(T.mode[r.then]))}</span></button>
            <span class="pw-ops"><button type="button" data-op="up" data-n="${n}" aria-label="${T.up}: rule ${n + 1}" ${n === 0 ? 'disabled' : ''}>▲</button><button type="button" data-op="down" data-n="${n}" aria-label="${T.down}: rule ${n + 1}" ${n === list.length - 1 ? 'disabled' : ''}>▼</button><button type="button" data-op="del" data-n="${n}" aria-label="${T.remove}: rule ${n + 1}">✕</button></span></li>`).join('')}
            <li class="pw-else"><span class="pw-n" aria-hidden="true">–</span><span>${esc(pick(T.noRuleRow))}</span></li></ol>
          <div class="pw-row"><button type="button" data-op="add" ${list.length >= max ? 'disabled' : ''}>${T.addRule}</button></div>`;
        ctl.innerHTML = `<button type="button" class="pw-toggle" data-op="school" aria-pressed="${st.rules.school}"><span aria-hidden="true">🏫</span><span>${esc(pick(T.schoolRule))}<small>${esc(pick(T.schoolHint))}</small></span><em>${st.rules.school ? T.on : T.off}</em></button>
          ${j ? '' : `<button type="button" class="pw-toggle" data-op="turns" aria-pressed="${st.rules.turns}"><span aria-hidden="true">🔁</span><span>${esc(pick(T.turnsRule))}<small>${esc(pick(T.turnsHint))}</small></span><em>${st.rules.turns ? T.on : T.off}</em></button>`}
          <button class="go" type="button" data-op="test" ${list.length ? '' : 'disabled'}>${pick(T.test)}</button>${list.length ? '' : `<p>${esc(needRule(j))}</p>`}`;
        if (focus) focusFirst(focus);
      };
      // choose from tiles: a condition, then an action. Resolves with the id, or null for Back.
      const choose = (kind, current, n) => new Promise((done) => {
        const used = new Set(list.filter((_, k) => k !== n).map((r) => r.when)); const opts = kind === 'when' ? whens.filter((w) => !used.has(w) || w === current) : MODES;
        screen.innerHTML = `<h3>${esc(pick(kind === 'when' ? T.pickWhen : T.pickThen))}<small>${n < list.length ? `Rule ${n + 1}` : `Rule ${list.length + 1}`}</small></h3>
          <div class="pw-pick ${kind}">${opts.map((o) => (kind === 'when'
    ? `<button type="button" data-pick="${o}" aria-current="${o === current}"><i aria-hidden="true">${whenIcon(o)}</i><b>${esc(whenWord(o, j))}</b><small>${esc(whenNote(o, j))}</small></button>`
    : `<button type="button" data-pick="${o}" aria-current="${o === current}"><i aria-hidden="true">${T.modeIcon[o]}</i><b>${esc(capital(thenWord(o, j)))}</b><small>${esc(pick(T.modeHint[o]))}</small></button>`)).join('')}</div>`;
        ctl.innerHTML = `<h4>${esc(pick(kind === 'when' ? T.pickWhen : T.pickThen))}</h4><button type="button" data-pick="">← Back</button>`;
        ctx.say(pick(kind === 'when' ? T.pickWhen : T.pickThen)); focusFirst('[data-pick]');
        onTap = (b) => { if ('pick' in b.dataset) done(b.dataset.pick || null); };
      });
      const changed = () => { keep('rules'); ctx.engine.audio?.tap?.(); };
      const mainTap = async (b) => {
        const op = b.dataset.op, n = Number(b.dataset.n);
        if (b.dataset.edit) { const kind = b.dataset.edit; const got = await choose(kind, kind === 'when' ? list[n].when : list[n].then, n); if (got) { if (kind === 'when') list[n].when = got; else list[n].then = got; changed(); ctx.say(`Rule ${n + 1}. ${whenWord(list[n].when, j)}, ${thenWord(list[n].then, j)}.`); } onTap = mainTap; main(`[data-edit="${kind}"][data-n="${n}"]`); return; }
        if (op === 'add') {
          if (list.length >= max) { say(maxSay(max, j)); return; }
          const w = await choose('when', null, list.length); const a = w ? await choose('then', null, list.length) : null;
          if (w && a) { list.push({ when: w, then: a }); changed(); ctx.say(`Rule ${list.length}. ${whenWord(w, j)}, ${thenWord(a, j)}.`); }
          onTap = mainTap; main('[data-op="add"]'); if (list.length >= max) focusFirst('[data-op="test"]'); return;
        }
        if (op === 'up' && n > 0) { [list[n - 1], list[n]] = [list[n], list[n - 1]]; changed(); main(n - 1 > 0 ? `[data-op="up"][data-n="${n - 1}"]` : '[data-op="down"][data-n="0"]'); return; }
        if (op === 'down' && n < list.length - 1) { [list[n + 1], list[n]] = [list[n], list[n + 1]]; changed(); main(n + 1 < list.length - 1 ? `[data-op="down"][data-n="${n + 1}"]` : `[data-op="up"][data-n="${n + 1}"]`); return; }
        if (op === 'del') { list.splice(n, 1); changed(); main('[data-op="add"]'); return; }
        if (op === 'turns' && !j) { st.rules.turns = !st.rules.turns; changed(); main('[data-op="turns"]'); ctx.say(`${pick(T.turnsRule)}: ${st.rules.turns ? T.on : T.off}.`); return; }
        if (op === 'school') { st.rules.school = !st.rules.school; changed(); main('[data-op="school"]'); ctx.say(`${pick(T.schoolRule)}: ${st.rules.school ? T.on : T.off}.`); return; }
        if (op === 'test' && list.length) { onTap = null; res(); }
      };
      onTap = mainTap; main('[data-op="add"]');
    });
  }

  // ================= 4. the rules run three days
  async function testRun() {
    report('test'); keep('rules');
    const test = testRules(kit, st.rules, { seed: SEED }); st.tests++;
    const edited = !!st.tested && !sameRules(st.tested, st.rules);
    if (edited) { st.changed = true; if (st.test && test.litHours > st.test.litHours) st.improved = true; }
    st.prev = edited ? st.test : null; st.test = test; st.tested = cleanRules(st.rules, j);
    let skip = false;
    const wait = (ms) => new Promise((r) => { if (skip) { r(); return; } const id = later(r, ms); onTap = (b) => { if ('skip' in b.dataset) { skip = true; clearTimeout(id); timers.delete(id); r(); } }; });
    for (let n = 0; n < TEST_DAYS.length && !skip; n++) {
      const day = test.days[n]; const last = n === TEST_DAYS.length - 1; const head = `<h3>${esc(pick(T.day[day.dayId]))}<small>${n + 1} of 3 · ${esc(pick(T.dayNote[day.dayId]))}</small></h3>`;
      say(testSay(day.dayId, j));
      if (reduce) { // no sweep: five still views of the day, cut one to the next, then the whole day with a Next button
        ctl.innerHTML = `<h4>${esc(pick(T.byRules))}</h4><p>${esc(rulesSpoken(st.rules, j))}</p><button type="button" data-skip>${T.skipRun}</button>`; focusFirst('[data-skip]');
        for (const i of [1, 6, 11, 14, 18]) { if (skip) break; showHour(day.hours[i], day.dayId); screen.innerHTML = `${head}${chart(day.dayId, { hours: day.hours.slice(0, i + 1), cursor: i })}${keyRow()}`; await wait(STILL_MS); }
        skip = false; const at = day.worst >= 0 ? day.hours[day.worst] : day.hours[15]; showHour(at, day.dayId);
        screen.innerHTML = `${head}${chart(day.dayId, { hours: day.hours, cursor: at.i, mark: day.worst })}<ul class="pw-lines"><li>${esc(dayScore(day, j))}</li></ul>`;
        ctl.innerHTML = `<h4>${esc(pick(T.byRules))}</h4><button class="go" type="button" data-act="next">${last ? T.seeResults : T.nextDay}</button>`; focusFirst('[data-act]'); await press(); continue;
      }
      ctl.innerHTML = `<h4>${esc(pick(T.byRules))}</h4><p>${esc(rulesSpoken(st.rules, j))}</p><button type="button" data-skip>${T.skipRun}</button>`; focusFirst('[data-skip]');
      for (let i = 0; i < HOURS && !skip; i++) { showHour(day.hours[i], day.dayId); screen.innerHTML = `${head}${chart(day.dayId, { hours: day.hours.slice(0, i + 1), cursor: i })}${keyRow()}`; await wait(TEST_MS); }
      if (!skip) { const at = day.worst >= 0 ? day.hours[day.worst] : day.hours[15]; showHour(at, day.dayId); screen.innerHTML = `${head}${chart(day.dayId, { hours: day.hours, cursor: at.i, mark: day.worst })}<ul class="pw-lines"><li>${esc(dayScore(day, j))}</li></ul>`; await wait(1500); }
    }
    onTap = null;
  }
  async function results() {
    report('results'); const test = st.test; let sel = Math.max(0, test.days.findIndex((d) => !d.allLit)); if (test.allLit) sel = 1; let cur = 0;
    const pickHour = () => { const d = test.days[sel]; cur = d.worst >= 0 ? d.worst : 15; };
    const draw = (focus) => {
      const day = test.days[sel]; const h = day.hours[cur]; showHour(h, day.dayId); const gap = explain(kit, day, cur);
      const lines = gap ? gapLines(kit, day, gap, st.rules, j) : [`${capital(`at ${clockWord(h.clock, j)}`)}, ${j ? 'every home was lit.' : 'every home was supplied.'}`];
      const fix = gap ? gapFix(gap, j) : ''; const unused = test.used.findIndex((u) => u === 0);
      screen.innerHTML = `<div class="pw-tabs" role="group" aria-label="Test days">${test.days.map((d, n) => `<button type="button" data-day="${n}" aria-pressed="${n === sel}" aria-label="${esc(pick(T.day[d.dayId]))}: ${esc(dayScore(d, j))}"><b>${esc(pick(T.day[d.dayId]))}</b><small>${d.litHours} / ${d.total} lit</small><span class="tag ${d.allLit ? 'ok' : 'dark'}">${d.allLit ? '✓ all lit' : `● dark at ${esc(clockWord(d.hours[d.worst].clock, j))}`}</span></button>`).join('')}</div>
        ${chart(day.dayId, { hours: day.hours, cursor: cur, mark: day.worst, h: 132 })}
        <ul class="pw-lines" aria-live="polite">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}${fix ? `<li class="fix">${esc(fix)}</li>` : ''}${!j && day.longest ? `<li class="note">${esc(longestLine(day, st.rules.turns))}</li>` : ''}${unused >= 0 && cur === (day.worst >= 0 ? day.worst : 15) ? `<li class="note">${esc(unusedLine(unused + 1, j))}</li>` : ''}</ul>`;
      ctl.querySelector('.pw-hour b').textContent = clockWord(h.clock, j);
      if (focus) focusFirst(focus); return lines.concat(fix ? [fix] : []);
    };
    ctl.innerHTML = `<p>${j ? 'Step through the day' : 'Step through the hours'}</p><div class="pw-hour"><button type="button" data-step="-1" aria-label="One hour back">◀</button><b></b><button type="button" data-step="1" aria-label="One hour on">▶</button></div><button type="button" data-act="change">${pick(T.change)}</button><button class="go" type="button" data-act="keep">${pick(T.keep)}</button>`; pickHour(); const first = draw();
    say(resultsSay(test, j, st.prev), first.join(' '), true); focusFirst(test.allLit ? '[data-act="keep"]' : '[data-act="change"]');
    onTap = (b) => {
      if (b.dataset.day !== undefined) { sel = Number(b.dataset.day); pickHour(); ctx.say(draw(`[data-day="${sel}"]`).join(' ')); }
      else if (b.dataset.step) { cur = (cur + Number(b.dataset.step) + HOURS) % HOURS; ctx.say(draw(`[data-step="${b.dataset.step}"]`).join(' ')); }
    };
    const a = await press(); onTap = null; return a;
  }

  // ================= 5. hand and rules, side by side
  async function sideBySide() {
    report('compare'); const hadHand = !!st.hand; const cmp = compare(kit, st.hand || Array(HOURS).fill('hold'), st.rules, { seed: SEED }); const lines = compareLines(cmp, j, hadHand);
    const at = cmp.auto.hours[15]; showHour(at, 'today'); // nine in the evening, the town under the rules
    const bar = (name, d) => `<div><span>${esc(name)}</span><i><u style="width:${(d.share * 100).toFixed(1)}%"></u></i><em>${d.litHours} / ${d.total}</em></div>`;
    screen.innerHTML = `<h3>${j ? 'Hand and rules, side by side' : 'Hand-run and rule-run, side by side'}<small>${esc(pick(T.litHours))}</small></h3>
      <div class="pw-cmp">${hadHand ? bar(`${pick(T.byHand)}: ${pick(T.day.today).toLowerCase()}`, cmp.hand) : ''}${bar(`${pick(T.byRules)}: ${pick(T.day.today).toLowerCase()}`, cmp.auto)}${cmp.test.days.map((d) => bar(`${pick(T.byRules)}: ${pick(T.day[d.dayId]).replace(/^A /, '')}`, d)).join('')}</div>
      <ul class="pw-lines">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
    say(compareSay(cmp, j, hadHand), lines.join(' '), true);
    ctl.innerHTML = `<button class="go" type="button" data-act="finish">${pick(T.finish)}</button><button type="button" data-act="change">${pick(T.change)}</button>`; focusFirst('[data-act]');
    return { act: await press(), cmp, hadHand };
  }

  // ================= the loop
  let stage = await meet(); let firstRules = true; let draft = null; let end = null;
  if (stage === 'rules' && !st.rules.list.length) { draft = st.hand ? draftFromHand(st.hand, 'today', SEED) : null; if (draft?.length) st.rules.list.push(...draft); }
  for (;;) {
    if (stage === 'hand') {
      await hand(); const a = await handDone(); if (a === 'again') continue;
      if (!st.rules.list.length) { draft = draftFromHand(st.hand, 'today', SEED); st.rules.list.push(...draft); } else draft = null;
      stage = 'rules'; continue;
    }
    if (stage === 'rules') { await rulesEdit(firstRules, draft); firstRules = false; draft = null; stage = 'test'; continue; }
    if (stage === 'test') { await testRun(); const a = await results(); if (a === 'change') { stage = 'rules'; continue; } stage = 'compare'; continue; }
    end = await sideBySide(); if (end.act === 'change') { stage = 'rules'; continue; } break;
  }
  report('done'); keep('done');
  const did = { hand: !!st.hand, charged: !!st.hand?.includes('charge'), used: !!st.hand?.includes('use'), rules: st.rules.list.length, tests: st.tests, changed: st.changed, improved: st.improved };
  return {
    finished: true,
    record: { made: { title: madeTitle(j), lines: madeLines(st.rules, end.cmp, j, end.hadHand), picture: picture(kit, end.cmp.test.days, j, SEED) }, practised: practised(did, j) },
    town: { kind: 'power-rules', data: { v: 1, rules: st.rules } },
  };
}

export default {
  id: 'power', icon: '⚡',
  title: T.title,
  blurb: { j: 'Keep the lights on. Then write rules so the system runs itself.', s: 'Run the town’s power by hand, then write rules for it and test them.' },
  css, run, show,
};
