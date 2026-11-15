// Drone delivery: the panels over the 3D view (Florence's line, the flying pad, the planning map and tiles, the
// comparison). Page elements only: the rules are in route.js and the 3D in flight.js. Nothing is typed anywhere.
import { DIRS, DIR_IDS, arrowFor, tilesWord } from './geo.js';
import { MAX_STEPS, addStep, removeStep, bumpStep, stepText, fly } from './route.js';
import { mapSvg } from './picture.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

export function createUi(ctx, { reduce }) {
  const root = ctx.root; root.classList.add('dr-root'); if (ctx.settings.largeText) root.classList.add('dr-large');
  // a clear sheet over the 3D view, so a drag or a wheel does not turn the town's own camera underneath
  const shield = el('<div class="dr-shield" aria-hidden="true"></div>'); root.appendChild(shield);
  const talkBox = el('<div class="dr-talk" role="status" hidden><b>Florence</b><p></p><button type="button" class="dr-btn go" data-dr-next hidden></button></div>'); root.appendChild(talkBox);
  const offs = []; let stage = '';
  const setStage = (s) => { stage = s; root.dataset.drStage = s; };

  // ---- keys and the on-screen pad. Arrow keys and WASD fly; every key press stays inside the module.
  const held = new Set(); const padHeld = new Set();
  const KEYS = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
  const onKey = (e) => {
    e.stopPropagation(); const k = KEYS[String(e.key).toLowerCase()]; if (!k || stage !== 'hand') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return; e.preventDefault(); if (e.type === 'keydown') held.add(k); else held.delete(k);
  };
  const clearKeys = () => { held.clear(); padHeld.clear(); };
  addEventListener('keydown', onKey, true); addEventListener('keyup', onKey, true); addEventListener('blur', clearKeys);
  offs.push(() => { removeEventListener('keydown', onKey, true); removeEventListener('keyup', onKey, true); removeEventListener('blur', clearKeys); });
  const on = (k) => (held.has(k) || padHeld.has(k) ? 1 : 0);
  const input = () => (reduce ? { x: on('right') - on('left'), z: on('down') - on('up') } : { f: on('up') - on('down'), t: on('right') - on('left') });

  // ---- Florence's line. With a button it waits for the tap. Every line is spoken as well as written.
  function talk(text, { button, quiet } = {}) {
    talkBox.hidden = false; talkBox.querySelector('p').textContent = text; const b = talkBox.querySelector('button');
    if (!quiet) ctx.say(text);
    if (!button) { b.hidden = true; return Promise.resolve(); }
    b.hidden = false; b.textContent = button; b.focus({ preventScroll: true });
    return new Promise((res) => { b.onclick = () => { b.onclick = null; b.hidden = true; res(); }; });
  }
  const hush = () => { talkBox.hidden = true; };

  // ---- hand flying: where the parcel goes, and the pad for touch
  let hud = null, pad = null;
  function showHand() {
    setStage('hand');
    hud = el('<div class="dr-hud" data-dr-hud><span class="dr-arrow" aria-hidden="true">↑</span><span class="dr-hudtxt"></span></div>'); root.appendChild(hud);
    const lab = reduce ? ['Fly north', 'Fly west', 'Fly south', 'Fly east'] : ['Fly forward', 'Turn left', 'Fly backward', 'Turn right'];
    pad = el(`<div class="dr-pad" role="group" aria-label="Flying buttons"><button type="button" data-dr-pad="up" aria-label="${lab[0]}">▲</button><button type="button" data-dr-pad="left" aria-label="${lab[1]}">◀</button><button type="button" data-dr-pad="down" aria-label="${lab[2]}">▼</button><button type="button" data-dr-pad="right" aria-label="${lab[3]}">▶</button></div>`);
    for (const b of pad.querySelectorAll('button')) {
      const k = b.dataset.drPad; const down = (e) => { e.preventDefault(); padHeld.add(k); b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch { /* no capture: pointerleave still lets go */ } }; const up = () => { padHeld.delete(k); b.classList.remove('on'); };
      b.addEventListener('pointerdown', down); for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, up);
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    root.appendChild(pad);
  }
  let hudKey = '';
  function tickHand(info) {
    if (!hud) return; const arrow = arrowFor(info.way);
    const text = `${info.tilesAway <= 0 ? 'Right here' : tilesWord(info.tilesAway) + ' to ' + info.target.label} · ${info.secs} s`;
    const k = arrow + text; if (k !== hudKey) { hudKey = k; hud.firstChild.textContent = arrow; hud.lastChild.textContent = text; }
    hud.dataset.dx = info.dx.toFixed(2); hud.dataset.dz = info.dz.toFixed(2); hud.dataset.turn = info.turn.toFixed(2); // for the browser test, which steers from these
  }
  function hideHand() { hud?.remove(); pad?.remove(); hud = pad = null; clearKeys(); setStage('handdone'); }

  // ---- the planner: the map, the tiles and the steps. Resolves with { act: 'fly' | 'finish', program }.
  function planner({ places, tiles, cells, hand, program, say, last, tileKeys, canFinish, junior, onEdit }) {
    setStage('plan'); hush(); let prog = program.slice(); let stopAt = last && !last.all && last.stop ? last.stop.step : -1; let shown = last;
    const box = el(`<div class="dr-plan" data-dr-plan data-from="${places.from.k}" data-drops="${places.drops.map((d) => d.k).join(';')}">
      <div class="dr-say" role="status"><b>Florence</b><p></p></div>
      <div class="dr-map"></div>
      <div class="dr-side">
        <h2>The drone's steps</h2>
        <ol class="dr-prog" aria-label="The drone's steps, in order"></ol>
        <p class="dr-count"></p>
        <div class="dr-pal" role="group" aria-label="Tiles to add">
          <button type="button" class="dr-tile up" data-dr-add="up">⬆ Go up above the roofs</button>
          <div class="dr-compass">${DIR_IDS.map((d) => `<button type="button" class="dr-tile ${d}" data-dr-add="${d}">${DIRS[d].arrow} Fly ${DIRS[d].word}</button>`).join('')}</div>
          <button type="button" class="dr-tile drop" data-dr-add="drop">📦 Lower the parcel</button>
        </div>
        <div class="dr-row"><button type="button" class="dr-btn" data-dr-clear>Clear the steps</button><button type="button" class="dr-btn go" data-dr-fly>▶ Fly these steps</button></div>
        ${canFinish ? '<div class="dr-row"><button type="button" class="dr-btn" data-dr-keep>Finish with the route that worked ➜</button></div>' : ''}
      </div></div>`);
    box.querySelector('.dr-say p').textContent = say; ctx.say(say);
    const map = box.querySelector('.dr-map'), list = box.querySelector('.dr-prog'), count = box.querySelector('.dr-count');
    const draw = () => {
      const pre = fly(prog, places, tileKeys);
      map.innerHTML = mapSvg({ tiles, cells, places, hand: hand?.trail, plan: pre.path, end: shown && !shown.all ? shown.end : null, title: `Map: from ${places.from.label} to ${places.drops.map((d) => d.label).join(' and ')}` });
      list.innerHTML = prog.length ? prog.map((s, i) => `<li class="${i === stopAt ? 'stop' : ''}" data-op="${s.op}${s.dir || ''}"><span class="dr-num">${i + 1}</span><span class="dr-step">${s.op === 'go' ? `Fly ${DIRS[s.dir].word}` : esc(stepText(s))}</span>${s.op === 'go' ? `<button type="button" data-dr-less="${i}" aria-label="Step ${i + 1}: one tile fewer" ${s.n <= 1 ? 'disabled' : ''}>−</button><b class="dr-n">${tilesWord(s.n)}</b><button type="button" data-dr-more="${i}" aria-label="Step ${i + 1}: one tile more" ${s.n >= 9 ? 'disabled' : ''}>+</button>` : ''}<button type="button" class="dr-del" data-dr-del="${i}" aria-label="Remove step ${i + 1}">✕</button></li>`).join('')
        : `<li class="dr-empty">${junior ? 'Tap a tile below to add the first step.' : 'Add the first step from the tiles below.'}</li>`;
      count.textContent = `${prog.length} of ${MAX_STEPS} steps. The blue line shows where these steps go.`;
      box.querySelector('[data-dr-fly]').disabled = !prog.length; box.querySelector('[data-dr-clear]').disabled = !prog.length;
      for (const b of box.querySelectorAll('[data-dr-add]')) b.disabled = prog.length >= MAX_STEPS && !(DIRS[b.dataset.drAdd] && prog[prog.length - 1]?.dir === b.dataset.drAdd && prog[prog.length - 1].n < 9);
      box.dataset.steps = String(prog.length);
    };
    const edit = (next, focusSel) => { prog = next; stopAt = -1; shown = null; draw(); if (focusSel) box.querySelector(focusSel)?.focus({ preventScroll: true }); onEdit?.(prog); };
    root.appendChild(box); draw();
    return new Promise((res) => {
      const done = (act) => { box.remove(); res({ act, program: prog }); };
      box.onclick = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled) return; const d = b.dataset;
        if (d.drAdd) edit(addStep(prog, d.drAdd === 'up' || d.drAdd === 'drop' ? { op: d.drAdd } : { op: 'go', dir: d.drAdd, n: 1 }));
        else if (d.drLess !== undefined) edit(bumpStep(prog, +d.drLess, -1), `[data-dr-less="${d.drLess}"]:not(:disabled), [data-dr-more="${d.drLess}"]`);
        else if (d.drMore !== undefined) edit(bumpStep(prog, +d.drMore, 1), `[data-dr-more="${d.drMore}"]:not(:disabled), [data-dr-less="${d.drMore}"]`);
        else if (d.drDel !== undefined) edit(removeStep(prog, +d.drDel), '[data-dr-add="up"]');
        else if (d.drClear !== undefined) edit([], '[data-dr-add="up"]');
        else if (d.drFly !== undefined) done('fly');
        else if (d.drKeep !== undefined) done('finish');
      };
    });
  }

  // ---- while the drone flies itself: the steps, with the one being flown marked
  function stepList(program) {
    setStage('auto');
    const box = el(`<ol class="dr-now" aria-label="The drone's steps">${program.map((s, i) => `<li><span class="dr-num">${i + 1}</span>${esc(stepText(s))}</li>`).join('')}</ol>`); root.appendChild(box);
    const items = [...box.children];
    return { mark(i) { items.forEach((li, j) => { li.classList.toggle('now', j === i); li.classList.toggle('done', j < i); }); if (items[i]) box.scrollTop = Math.max(0, items[i].offsetTop - 60); },
      stop(i) { items.forEach((li, j) => { li.classList.remove('now'); li.classList.toggle('stop', j === i); }); }, finish() { items.forEach((li) => { li.classList.remove('now'); li.classList.add('done'); }); setStage('autodone'); }, remove() { box.remove(); } };
  }

  // ---- the comparison, and one question with no wrong answer. Resolves with { act: 'again' | 'finish', chose }.
  function compare({ head, lines, automate, map }) {
    setStage('compare'); hush();
    const box = el(`<div class="dr-card" data-dr-compare><div class="dr-cardmap"></div><div class="dr-cardtxt"><h2></h2><ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      <div class="dr-ask"><p><b>Florence</b> ${esc(automate.ask)}</p><div class="dr-row">${automate.options.map((o) => `<button type="button" class="dr-btn" data-dr-choose="${o.id}">${esc(o.label)}</button>`).join('')}</div><p class="dr-reply" role="status" hidden></p></div>
      <div class="dr-row"><button type="button" class="dr-btn" data-dr-again>Change the steps and fly again</button><button type="button" class="dr-btn go" data-dr-finish>Finish: keep this route flying ➜</button></div></div></div>`);
    box.querySelector('h2').textContent = head; box.querySelector('.dr-cardmap').innerHTML = map; root.appendChild(box);
    ctx.say(`${head} ${lines.join(' ')} ${automate.ask}`);
    let chose = null;
    return new Promise((res) => {
      box.onclick = (e) => {
        const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
        if (d.drChoose) { chose = d.drChoose; const o = automate.options.find((x) => x.id === chose); for (const x of box.querySelectorAll('[data-dr-choose]')) x.classList.toggle('picked', x === b); const r = box.querySelector('.dr-reply'); r.hidden = false; r.textContent = o.reply; ctx.say(o.reply); }
        else if (d.drAgain !== undefined) { box.remove(); res({ act: 'again', chose }); }
        else if (d.drFinish !== undefined) { box.remove(); res({ act: 'finish', chose }); }
      };
    });
  }

  return { talk, hush, showHand, tickHand, hideHand, input, planner, stepList, compare, setStage, off() { for (const f of offs) f(); } };
}

export const CSS = `
#module[data-module="drone"] .dr-shield { position: absolute; inset: 0; touch-action: none; }
#module[data-module="drone"] .dr-root { font-size: 16px; }
#module[data-module="drone"] .dr-root.dr-large { font-size: 19px; }
#module[data-module="drone"] .dr-talk, #module[data-module="drone"] .dr-say { background: #fffaf0; border-radius: 16px; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; padding: 10px 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; }
#module[data-module="drone"] .dr-talk { position: absolute; top: 12px; left: 200px; right: 12px; max-width: 760px; z-index: 3; }
#module[data-module="drone"] .dr-talk[hidden] { display: none; }
#module[data-module="drone"] .dr-talk b, #module[data-module="drone"] .dr-say b { color: #b3541e; font-weight: 800; }
#module[data-module="drone"] .dr-talk p, #module[data-module="drone"] .dr-say p { margin: 0; flex: 1 1 260px; font-size: 1.05em; line-height: 1.35; font-weight: 600; }
#module[data-module="drone"] .dr-btn { min-height: 46px; padding: 8px 16px; border: 0; border-radius: 14px; background: #f3e6cc; color: #3b2a1e; font: 800 1em Inter, system-ui, sans-serif; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; cursor: pointer; }
#module[data-module="drone"] .dr-btn.go { background: #2e9b5a; color: #fff; box-shadow: inset 0 0 0 2px #1f7442, 0 3px 0 #17592f; }
#module[data-module="drone"] .dr-btn.picked { background: #ffe08a; }
#module[data-module="drone"] .dr-btn:disabled, #module[data-module="drone"] .dr-tile:disabled { background: #e4ddd0; color: #6d6257; box-shadow: inset 0 0 0 2px #c9bfae; cursor: default; }
#module[data-module="drone"] button:focus-visible { outline: 3px solid #1f6fd0; outline-offset: 2px; }
#module[data-module="drone"] .dr-btn[hidden] { display: none; }
#module[data-module="drone"] .dr-hud { position: absolute; left: 12px; bottom: 14px; display: flex; align-items: center; gap: 10px; background: #fffaf0; border-radius: 16px; padding: 8px 16px 8px 10px; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; font-weight: 800; font-size: 1.1em; max-width: calc(100% - 250px); }
#module[data-module="drone"] .dr-arrow { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: #d2452d; color: #fff; font-size: 2em; line-height: 1; flex: none; }
#module[data-module="drone"] .dr-pad { position: absolute; right: 14px; bottom: 14px; display: grid; grid-template-columns: repeat(3, 68px); grid-template-rows: repeat(2, 68px); gap: 6px; touch-action: none; user-select: none; -webkit-user-select: none; }
#module[data-module="drone"] .dr-pad button { border: 0; border-radius: 16px; background: #fffaf0; color: #3b2a1e; font-size: 1.7em; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; cursor: pointer; touch-action: none; }
#module[data-module="drone"] .dr-pad button.on, #module[data-module="drone"] .dr-pad button:active { background: #ffe08a; }
#module[data-module="drone"] .dr-pad [data-dr-pad="up"] { grid-column: 2; grid-row: 1; }
#module[data-module="drone"] .dr-pad [data-dr-pad="left"] { grid-column: 1; grid-row: 2; }
#module[data-module="drone"] .dr-pad [data-dr-pad="down"] { grid-column: 2; grid-row: 2; }
#module[data-module="drone"] .dr-pad [data-dr-pad="right"] { grid-column: 3; grid-row: 2; }
#module[data-module="drone"] .dr-plan { position: absolute; inset: 0; background: #f6ecd6; overflow: auto; padding: 12px; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(300px, 1fr); grid-template-rows: auto 1fr; gap: 12px; align-content: start; }
#module[data-module="drone"] .dr-say { grid-column: 1 / -1; margin-left: 190px; min-height: 46px; }
#module[data-module="drone"] .dr-map { background: #fffaf0; border-radius: 16px; padding: 8px; box-shadow: inset 0 0 0 2px #b08a55; align-self: start; }
#module[data-module="drone"] .dr-map svg { display: block; width: 100%; height: auto; max-height: calc(100vh - 130px); }
#module[data-module="drone"] .dr-side { background: #fffaf0; border-radius: 16px; padding: 12px; box-shadow: inset 0 0 0 2px #b08a55; align-self: start; }
#module[data-module="drone"] .dr-side h2, #module[data-module="drone"] .dr-card h2 { margin: 0 0 8px; font-size: 1.2em; font-weight: 800; }
#module[data-module="drone"] .dr-prog, #module[data-module="drone"] .dr-now { list-style: none; margin: 0; padding: 0; display: grid; gap: 5px; }
#module[data-module="drone"] .dr-prog li { display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 3px 6px; border-radius: 12px; background: #e3effb; box-shadow: inset 0 0 0 2px #7fb0e6; font-weight: 700; }
#module[data-module="drone"] .dr-prog li[data-op="up"] { background: #e6f5df; box-shadow: inset 0 0 0 2px #7cc06a; }
#module[data-module="drone"] .dr-prog li[data-op="drop"] { background: #fdebd2; box-shadow: inset 0 0 0 2px #e0a050; }
#module[data-module="drone"] .dr-prog li.stop, #module[data-module="drone"] .dr-now li.stop { background: #ffe08a; box-shadow: inset 0 0 0 3px #b3541e; }
#module[data-module="drone"] .dr-prog li.dr-empty { background: none; box-shadow: inset 0 0 0 2px #c9bfae; color: #5e4936; font-weight: 600; padding-left: 12px; }
#module[data-module="drone"] .dr-num { display: grid; place-items: center; min-width: 28px; height: 28px; border-radius: 50%; background: #3b2a1e; color: #fff; font-size: .85em; font-weight: 800; flex: none; }
#module[data-module="drone"] .dr-step { flex: 1; }
#module[data-module="drone"] .dr-n { min-width: 4.2em; text-align: center; }
#module[data-module="drone"] .dr-prog button { min-width: 40px; min-height: 40px; border: 0; border-radius: 10px; background: #fffaf0; color: #3b2a1e; font: 800 1.15em Inter, system-ui, sans-serif; box-shadow: inset 0 0 0 2px #b08a55; cursor: pointer; }
#module[data-module="drone"] .dr-prog button:disabled { color: #a79d90; box-shadow: inset 0 0 0 2px #d8cfc0; cursor: default; }
#module[data-module="drone"] .dr-count { margin: 6px 0 10px; font-size: .9em; color: #5e4936; }
#module[data-module="drone"] .dr-pal { display: grid; gap: 6px; margin-bottom: 12px; }
#module[data-module="drone"] .dr-compass { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
#module[data-module="drone"] .dr-tile { min-height: 46px; padding: 6px 10px; border: 0; border-radius: 12px; background: #e3effb; color: #3b2a1e; font: 800 1em Inter, system-ui, sans-serif; box-shadow: inset 0 0 0 2px #7fb0e6, 0 3px 0 #5b8dc4; cursor: pointer; text-align: left; }
#module[data-module="drone"] .dr-tile.up { background: #e6f5df; box-shadow: inset 0 0 0 2px #7cc06a, 0 3px 0 #5a9b49; }
#module[data-module="drone"] .dr-tile.drop { background: #fdebd2; box-shadow: inset 0 0 0 2px #e0a050, 0 3px 0 #b97b30; }
#module[data-module="drone"] .dr-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
#module[data-module="drone"] .dr-row .dr-btn { flex: 1 1 auto; }
#module[data-module="drone"] .dr-now { position: absolute; right: 12px; top: 96px; width: min(300px, 44vw); max-height: calc(100% - 120px); overflow: auto; background: #fffaf0; border-radius: 16px; padding: 10px; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
#module[data-module="drone"] .dr-now li { display: flex; align-items: center; gap: 8px; padding: 5px 6px; border-radius: 10px; font-weight: 700; }
#module[data-module="drone"] .dr-now li.now { background: #cfe5ff; box-shadow: inset 0 0 0 3px #1f6fd0; }
#module[data-module="drone"] .dr-now li.done { color: #5e4936; }
#module[data-module="drone"] .dr-now li.done .dr-num { background: #2e9b5a; }
#module[data-module="drone"] .dr-card { position: absolute; left: 50%; top: 70px; transform: translateX(-50%); width: min(960px, calc(100% - 24px)); max-height: calc(100% - 82px); overflow: auto; background: #fffaf0; border-radius: 18px; padding: 14px; box-shadow: inset 0 0 0 2px #b08a55, 0 5px 0 #7a5a33; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 14px; }
#module[data-module="drone"] .dr-cardmap svg { display: block; width: 100%; height: auto; border-radius: 12px; }
#module[data-module="drone"] .dr-card ul { margin: 0 0 10px; padding-left: 1.2em; line-height: 1.4; font-weight: 600; }
#module[data-module="drone"] .dr-ask { background: #f6ecd6; border-radius: 12px; padding: 10px; }
#module[data-module="drone"] .dr-ask p { margin: 0; font-weight: 700; }
#module[data-module="drone"] .dr-ask b { color: #b3541e; }
#module[data-module="drone"] .dr-reply { margin-top: 8px !important; font-weight: 600 !important; }
#module[data-module="drone"] .dr-reply[hidden] { display: none; }
@media (max-width: 760px) {
  #module[data-module="drone"] .dr-talk { top: 66px; left: 12px; }
  #module[data-module="drone"] .dr-plan { grid-template-columns: 1fr; padding-top: 66px; }
  #module[data-module="drone"] .dr-say { margin-left: 0; }
  #module[data-module="drone"] .dr-card { grid-template-columns: 1fr; top: 66px; }
  #module[data-module="drone"] .dr-hud { bottom: 170px; max-width: calc(100% - 24px); }
  #module[data-module="drone"] .dr-now { top: 150px; }
}
`;
