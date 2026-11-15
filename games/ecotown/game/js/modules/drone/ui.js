// Drone delivery: the panels over the 3D view (Florence's line, the flying pad, the planning map and tiles, the
// comparison). Page elements only: the rules are in route.js and the 3D in flight.js. Nothing is typed anywhere.
import { DIRS, arrowFor, tilesWord, stepTo } from './geo.js';
import { MAX_STEPS, addStep, insertStep, moveStep, removeStep, bumpStep, stepText, fly, fewestTiles } from './route.js';
import { mapSvg, MAP } from './picture.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const NARROW = '(max-width: 900px), (orientation: portrait)'; // one column: the map on top, the steps under it

export function createUi(ctx, { reduce }) {
  const root = ctx.root; root.classList.add('dr-root'); if (ctx.settings.largeText) root.classList.add('dr-large'); if (reduce) root.classList.add('dr-still');
  const offs = []; let stage = '';
  const setStage = (s) => { stage = s; root.dataset.drStage = s; };
  const touch = (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
  const narrow = () => typeof matchMedia === 'function' && matchMedia(NARROW).matches;
  // Florence's box starts to the right of the loader's "Back" button, whatever its real width is (it grows with the text size)
  const redraws = new Set();
  const fit = () => {
    const back = root.parentElement?.querySelector('.modback')?.getBoundingClientRect(); const box = root.getBoundingClientRect();
    root.style.setProperty('--dr-back', `${Math.round((back && back.width ? back.right - box.left : 196) + 12)}px`);
    for (const f of redraws) f();
  };
  fit(); const fitLater = setTimeout(fit, 400); addEventListener('resize', fit); offs.push(() => { clearTimeout(fitLater); removeEventListener('resize', fit); });
  try { document.fonts?.ready?.then(fit); } catch { /* the first measure stands */ }
  // a clear sheet over the 3D view, so a drag or a wheel does not turn the town's own camera underneath
  const shield = el('<div class="dr-shield" aria-hidden="true"></div>'); root.appendChild(shield);
  const talkBox = el('<div class="dr-talk" role="status" hidden><b>Florence</b><p></p><button type="button" class="dr-btn go" data-dr-next hidden></button></div>'); root.appendChild(talkBox);

  // ---- keys and the on-screen pad. Arrow keys and WASD fly; every key press stays inside the module.
  const held = new Set(); const padHeld = new Set();
  const KEYS = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
  const flying = () => stage === 'hand' || stage === 'free';
  const onKey = (e) => {
    e.stopPropagation(); const k = KEYS[String(e.key).toLowerCase()]; if (!k || !flying()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return; e.preventDefault(); if (e.type === 'keydown') held.add(k); else held.delete(k);
  };
  const clearKeys = () => { held.clear(); padHeld.clear(); };
  addEventListener('keydown', onKey, true); addEventListener('keyup', onKey, true); addEventListener('blur', clearKeys);
  offs.push(() => { removeEventListener('keydown', onKey, true); removeEventListener('keyup', onKey, true); removeEventListener('blur', clearKeys); });
  const on = (k) => (held.has(k) || padHeld.has(k) ? 1 : 0);
  const input = () => (reduce ? { x: on('right') - on('left'), z: on('down') - on('up') } : { f: on('up') - on('down'), t: on('right') - on('left') });

  // ---- Florence's line. With a button it waits for the tap. Every line is spoken as well as written.
  function talk(text, { button, quiet, focus = true } = {}) {
    talkBox.hidden = false; talkBox.querySelector('p').textContent = text; const b = talkBox.querySelector('button');
    if (!quiet) ctx.say(text);
    if (!button) { b.hidden = true; return Promise.resolve(); }
    b.hidden = false; b.textContent = button; if (focus) b.focus({ preventScroll: true });
    return new Promise((res) => { b.onclick = () => { b.onclick = null; b.hidden = true; res(); }; });
  }
  const hush = () => { talkBox.hidden = true; };

  // ---- hand flying: where to fly next, the pad for touch, and a small cheer when a parcel is down
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
    const where = info.hoop ? `Hoop ${info.hoop.n} of ${info.hoop.of}: ${tilesWord(info.tilesAway)} away` : info.tilesAway <= 0 ? 'Right here' : `${tilesWord(info.tilesAway)} to ${info.target.label}`;
    const text = `${where} · ${info.secs} s`;
    const k = arrow + text; if (k !== hudKey) { hudKey = k; hud.firstChild.textContent = arrow; hud.lastChild.textContent = text; }
    hud.dataset.dx = info.dx.toFixed(2); hud.dataset.dz = info.dz.toFixed(2); hud.dataset.turn = info.turn.toFixed(2); // for the browser test, which steers from these
  }
  // after the delivery: the same controls, nowhere to be
  function freeHand() { setStage('free'); if (hud) { hud.classList.add('free'); hud.firstChild.textContent = '🚁'; hud.lastChild.textContent = 'Free flying: go where you like'; hudKey = ''; delete hud.dataset.dx; } }
  function hideHand() { hud?.remove(); pad?.remove(); hud = pad = null; clearKeys(); setStage('handdone'); }
  function cheer(text) {
    const b = el('<div class="dr-cheer" role="status" data-dr-cheer><span aria-hidden="true">✓</span><b></b></div>'); b.querySelector('b').textContent = text;
    if (!talkBox.hidden) b.style.top = `${Math.round(talkBox.getBoundingClientRect().bottom - root.getBoundingClientRect().top + 12)}px`; // just under Florence's line, clear of the drone and the doorstep
    for (const old of root.querySelectorAll('.dr-cheer')) old.remove();
    root.appendChild(b);
    setTimeout(() => b.remove(), 3600);
  }

  // ---- the planner: the map, the tiles and the steps. Resolves with { act: 'fly' | 'finish', program }.
  // A step's number is a button: it chooses that step, which can then be moved up or down, and new tiles go in before it.
  function planner({ places, tiles, cells, hand, program, say, neutral, last, tileKeys, canFinish, junior, onEdit, heading }) {
    setStage('plan'); hush(); let prog = program.slice(); let stopAt = last && !last.all && last.stop ? last.stop.step : -1; let shown = last; let sel = -1; let flash = ''; let fresh = !!last;
    const target = junior ? null : fewestTiles(places, tileKeys); const battery = Number.isFinite(places.battery) ? places.battery : null;
    const box = el(`<div class="dr-plan" data-dr-plan data-from="${places.from.k}" data-drops="${places.drops.map((d) => d.k).join(';')}" data-nofly="${(places.nofly || []).join(';')}" data-battery="${battery ?? ''}">
      <div class="dr-say" role="status"><b>Florence</b><p></p></div>
      <div class="dr-map"><div class="dr-mapsvg"></div><p class="dr-maptip">Tap a square in line with the blue dot to fly there.</p></div>
      <div class="dr-side">
        <h2><span>${esc(heading || 'The drone\'s steps')}</span><span class="dr-count"></span></h2>
        <ol class="dr-prog" aria-label="The drone's steps, in order"></ol>
        <p class="dr-note" role="status"></p>
        ${battery || target ? '<div class="dr-meter"></div>' : ''}
        <div class="dr-pal" role="group" aria-label="Tiles to add">
          <button type="button" class="dr-tile up" data-dr-add="up">⬆ Go up</button>
          <button type="button" class="dr-tile n" data-dr-add="n">↑ Fly north</button>
          <button type="button" class="dr-tile drop" data-dr-add="drop">📦 Lower the parcel</button>
          <button type="button" class="dr-tile w" data-dr-add="w">← Fly west</button>
          <button type="button" class="dr-tile s" data-dr-add="s">↓ Fly south</button>
          <button type="button" class="dr-tile e" data-dr-add="e">→ Fly east</button>
        </div>
        <div class="dr-row"><button type="button" class="dr-btn" data-dr-clear>Clear the steps</button><button type="button" class="dr-btn go" data-dr-fly>▶ Fly these steps</button></div>
        ${canFinish ? '<div class="dr-row"><button type="button" class="dr-btn" data-dr-keep>Keep the route that worked ➜</button></div>' : ''}
      </div></div>`);
    const sayP = box.querySelector('.dr-say p'); sayP.textContent = say; ctx.say(say);
    const map = box.querySelector('.dr-mapsvg'), list = box.querySelector('.dr-prog'), count = box.querySelector('.dr-count'), note = box.querySelector('.dr-note'), meter = box.querySelector('.dr-meter');
    const stepOf = (id) => (id === 'up' || id === 'drop' ? { op: id } : { op: 'go', dir: id, n: 1 });
    const withStep = (step) => (sel >= 0 ? insertStep(prog, sel, step) : addStep(prog, step));
    const draw = (scrollTo = -1) => {
      const pre = fly(prog, places, tileKeys);
      map.innerHTML = mapSvg({ tiles, cells, places, hand: hand?.trail, plan: pre.path, end: shown && !shown.all ? shown.end : null, keySide: narrow(), title: `Map: from ${places.from.label} to ${places.drops.map((d) => d.label).join(' and ')}` });
      list.innerHTML = prog.length ? prog.map((s, i) => `<li class="${i === stopAt ? 'stop ' : ''}${i === sel ? 'sel' : ''}" data-op="${s.op}${s.dir || ''}">
        <button type="button" class="dr-num" data-dr-pick="${i}" aria-pressed="${i === sel}" aria-label="Step ${i + 1}: ${esc(stepText(s))}. Choose this step to move it, or to add a tile before it">${i + 1}</button>
        <span class="dr-step">${s.op === 'go' ? `Fly ${DIRS[s.dir].word}` : esc(stepText(s))}</span>
        ${s.op === 'go' ? `<button type="button" data-dr-less="${i}" aria-label="Step ${i + 1}: one tile fewer" ${s.n <= 1 ? 'disabled' : ''}>−</button><b class="dr-n">${tilesWord(s.n)}</b><button type="button" data-dr-more="${i}" aria-label="Step ${i + 1}: one tile more" ${s.n >= 9 ? 'disabled' : ''}>+</button>` : ''}
        <button type="button" class="dr-del" data-dr-del="${i}" aria-label="Remove step ${i + 1}">✕</button>
        ${i === sel ? `<span class="dr-tools"><button type="button" data-dr-mv="-1" ${i === 0 ? 'disabled' : ''}>▲ Move up</button><button type="button" data-dr-mv="1" ${i === prog.length - 1 ? 'disabled' : ''}>▼ Move down</button></span>` : ''}</li>`).join('')
        : `<li class="dr-empty">${junior ? 'Tap a tile below to add the first step.' : 'Add the first step from the tiles below.'}</li>`;
      count.textContent = `${prog.length} of ${MAX_STEPS}`;
      const full = prog.length >= MAX_STEPS;
      note.textContent = flash || (sel >= 0 ? `New tiles go in before step ${sel + 1}. Tap its number again to add at the end.` : full ? `That is all ${MAX_STEPS} steps. Remove a step to add another.` : prog.length ? 'Tap a step\'s number to move it, or to add a tile before it.' : 'The blue line on the map shows where the steps go.');
      note.classList.toggle('warn', !!flash || (full && sel < 0));
      if (meter) {
        const over = pre.stop?.reason === 'battery'; const used = pre.tiles; const parts = [];
        if (battery) parts.push(`<div class="dr-bat${over ? ' over' : ''}"><span>🔋 Battery</span><span class="dr-bar" aria-hidden="true"><i style="width:${Math.min(100, Math.round(used / battery * 100))}%"></i></span><b>${over ? `all ${battery} tiles used` : `${used} of ${battery} tiles`}</b></div>`);
        if (target) parts.push(`<p>${pre.all ? (used <= target ? `These steps use ${used} tiles: the fewest possible.` : `Fewest tiles possible: ${target}. These steps use ${used}: ${used - target} more.`) : `Target: the fewest tiles possible is ${target}.`}</p>`);
        meter.innerHTML = parts.join('');
      }
      box.querySelector('[data-dr-fly]').disabled = !prog.length; box.querySelector('[data-dr-clear]').disabled = !prog.length;
      for (const b of box.querySelectorAll('[data-dr-add]')) b.disabled = same(withStep(stepOf(b.dataset.drAdd)), prog);
      box.dataset.steps = String(prog.length); box.dataset.sel = String(sel);
      const row = list.children[scrollTo >= 0 ? scrollTo : -1]; if (row && row.offsetTop !== undefined) { const top = row.offsetTop; if (top < list.scrollTop) list.scrollTop = top - 4; else if (top + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top + row.offsetHeight - list.clientHeight + 4; }
    };
    // any change: the old verdict and its marks go, and Florence's line goes back to the plain instruction
    const edit = (next, { focus, scroll = -1, keepFlash = false } = {}) => {
      prog = next; stopAt = -1; shown = null; if (!keepFlash) flash = ''; if (sel >= prog.length) sel = -1;
      if (fresh) { fresh = false; sayP.textContent = neutral || say; }
      draw(scroll); if (focus) box.querySelector(focus)?.focus({ preventScroll: true }); onEdit?.(prog);
    };
    root.appendChild(box); draw(); const redraw = () => draw(); redraws.add(redraw);
    return new Promise((res) => {
      const done = (act) => { redraws.delete(redraw); box.remove(); res({ act, program: prog }); };
      // the map: a tap on a square in line with the end of the blue line adds the step that flies there
      map.onclick = (e) => {
        const svg = map.querySelector('svg'); const m = svg?.getScreenCTM?.(); if (!m) return; const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(m.inverse());
        const gx = Math.floor((q.x - MAP.PAD) / MAP.C), gz = Math.floor((q.y - MAP.PAD) / MAP.C); if (!tileKeys.has(`${gx},${gz}`)) return;
        const tip = fly(prog, places, tileKeys).end; const step = stepTo(tip, { gx, gz });
        if (!step) { if (tip.gx === gx && tip.gz === gz) return; flash = 'Tap a square straight north, south, east or west of the blue dot.'; draw(); return; }
        const next = addStep(prog, step); if (same(next, prog)) { flash = `That is all ${MAX_STEPS} steps. Remove a step to add another.`; draw(); return; }
        sel = -1; edit(next, { scroll: next.length - 1 });
      };
      box.onclick = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled) return; const d = b.dataset;
        if (d.drAdd) { const next = withStep(stepOf(d.drAdd)); const at = sel >= 0 ? sel : next.length - 1; if (sel >= 0 && next.length > prog.length) sel++; edit(next, { scroll: at }); }
        else if (d.drPick !== undefined) { sel = sel === +d.drPick ? -1 : +d.drPick; flash = ''; draw(sel); box.querySelector(`[data-dr-pick="${d.drPick}"]`)?.focus({ preventScroll: true }); }
        else if (d.drMv !== undefined) { const to = sel + (+d.drMv); const next = moveStep(prog, sel, +d.drMv); sel = to; edit(next, { focus: `[data-dr-mv="${d.drMv}"]:not(:disabled), [data-dr-pick="${to}"]`, scroll: to }); }
        // "+" keeps the focus on "+" (and "−" on "−"); only at the end of its range does it pass to the other one
        else if (d.drLess !== undefined) edit(bumpStep(prog, +d.drLess, -1), { focus: `[data-dr-less="${d.drLess}"]:not(:disabled)`, scroll: +d.drLess }) || box.querySelector(':focus') || box.querySelector(`[data-dr-more="${d.drLess}"]`)?.focus({ preventScroll: true });
        else if (d.drMore !== undefined) edit(bumpStep(prog, +d.drMore, 1), { focus: `[data-dr-more="${d.drMore}"]:not(:disabled)`, scroll: +d.drMore }) || box.querySelector(':focus') || box.querySelector(`[data-dr-less="${d.drMore}"]`)?.focus({ preventScroll: true });
        else if (d.drDel !== undefined) { const i = +d.drDel; if (sel === i) sel = -1; else if (sel > i) sel--; const next = removeStep(prog, i); edit(next, { focus: next.length ? `[data-dr-del="${Math.min(i, next.length - 1)}"]` : '[data-dr-add="up"]', scroll: Math.min(i, next.length - 1) }); }
        else if (d.drClear !== undefined) { sel = -1; edit([], { focus: '[data-dr-add="up"]' }); }
        else if (d.drFly !== undefined) done('fly');
        else if (d.drKeep !== undefined) done('finish');
      };
    });
  }

  // ---- while the drone flies itself: the steps, with the one being flown marked
  function stepList(program) {
    setStage('auto');
    const box = el(`<ol class="dr-now" aria-label="The drone's steps">${program.map((s, i) => `<li><span class="dr-num">${i + 1}</span><span>${esc(stepText(s))}</span></li>`).join('')}</ol>`); root.appendChild(box);
    const items = [...box.children];
    return { mark(i) { items.forEach((li, j) => { li.classList.toggle('now', j === i); li.classList.toggle('done', j < i); }); if (items[i]) box.scrollTop = Math.max(0, items[i].offsetTop - 60); },
      // a "Lower the parcel" step where nobody was waiting: amber, with the reason, never a green tick
      miss(i) { const li = items[i]; if (!li || li.classList.contains('miss')) return; li.classList.add('miss'); li.lastChild.textContent += ': nobody was waiting here'; },
      stop(i) { items.forEach((li, j) => { li.classList.remove('now'); li.classList.toggle('stop', j === i); if (j > i) li.classList.remove('done'); }); }, finish() { items.forEach((li) => { li.classList.remove('now'); li.classList.add('done'); }); setStage('autodone'); }, remove() { box.remove(); } };
  }

  // ---- the comparison, and one question with no wrong answer. buttons: [{ id, label, go }]. Resolves with { act: id, chose }.
  function compare({ head, lines, ask, map, buttons }) {
    setStage('compare'); hush();
    const box = el(`<div class="dr-card" data-dr-compare><div class="dr-cardmap"></div><div class="dr-cardtxt"><h2></h2><ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      <div class="dr-ask"><p><b>Florence</b> ${esc(ask.ask)}</p><div class="dr-row">${ask.options.map((o) => `<button type="button" class="dr-btn" data-dr-choose="${o.id}">${esc(o.label)}</button>`).join('')}</div><p class="dr-reply" role="status" hidden></p></div>
      <div class="dr-row dr-ends">${buttons.map((b) => `<button type="button" class="dr-btn${b.go ? ' go' : ''}" data-dr-act="${b.id}">${esc(b.label)}</button>`).join('')}</div></div></div>`);
    box.querySelector('h2').textContent = head; const drawMap = () => { box.querySelector('.dr-cardmap').innerHTML = map(narrow()); }; drawMap(); redraws.add(drawMap); root.appendChild(box);
    ctx.say(`${head} ${lines.join(' ')} ${ask.ask}`);
    let chose = null;
    return new Promise((res) => {
      box.onclick = (e) => {
        const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
        if (d.drChoose) { chose = d.drChoose; const o = ask.options.find((x) => x.id === chose); for (const x of box.querySelectorAll('[data-dr-choose]')) { x.classList.toggle('picked', x === b); x.setAttribute('aria-pressed', String(x === b)); } const r = box.querySelector('.dr-reply'); r.hidden = false; r.textContent = o.reply; ctx.say(o.reply); }
        else if (d.drAct) { redraws.delete(drawMap); box.remove(); res({ act: d.drAct, chose }); }
      };
    });
  }

  return { talk, hush, showHand, tickHand, freeHand, hideHand, cheer, input, planner, stepList, compare, setStage, touch, off() { for (const f of offs) f(); } };
}

const M = '#module[data-module="drone"]';
export const CSS = `
${M} .dr-shield { position: absolute; inset: 0; touch-action: none; }
${M} .dr-root { font-size: 16px; --dr-back: 208px; }
${M} .dr-root.dr-large { font-size: 19px; }
${M} .dr-talk, ${M} .dr-say { background: #fffaf0; border-radius: 16px; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; padding: 10px 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; }
${M} .dr-talk { position: absolute; top: 12px; left: var(--dr-back); right: 12px; max-width: 780px; z-index: 3; }
${M} .dr-talk[hidden] { display: none; }
${M} .dr-talk b, ${M} .dr-say b { color: #b3541e; font-weight: 800; }
${M} .dr-talk p, ${M} .dr-say p { margin: 0; flex: 1 1 260px; font-size: 1.05em; line-height: 1.35; font-weight: 600; }
${M} .dr-btn { min-height: 46px; padding: 8px 16px; border: 0; border-radius: 14px; background: #f3e6cc; color: #3b2a1e; font: 800 1em Inter, system-ui, sans-serif; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; cursor: pointer; }
${M} .dr-btn.go { background: #2e9b5a; color: #fff; box-shadow: inset 0 0 0 2px #1f7442, 0 3px 0 #17592f; }
${M} .dr-btn.picked { background: #ffe08a; }
${M} .dr-btn:disabled, ${M} .dr-tile:disabled { background: #e4ddd0; color: #6d6257; box-shadow: inset 0 0 0 2px #c9bfae; cursor: default; }
${M} button:focus-visible { outline: 3px solid #1f6fd0; outline-offset: 2px; }
${M} .dr-btn[hidden] { display: none; }
${M} .dr-hud { position: absolute; left: 12px; bottom: 14px; display: flex; align-items: center; gap: 10px; background: #fffaf0; border-radius: 16px; padding: 8px 16px 8px 10px; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; font-weight: 800; font-size: 1.1em; max-width: calc(100% - 262px); }
${M} .dr-arrow { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: #d2452d; color: #fff; font-size: 2em; line-height: 1; flex: none; }
${M} .dr-hud.free .dr-arrow { background: #f3e6cc; font-size: 1.5em; }
${M} .dr-pad { position: absolute; right: 14px; bottom: 14px; display: grid; grid-template-columns: repeat(3, 68px); grid-template-rows: repeat(2, 68px); gap: 6px; touch-action: none; user-select: none; -webkit-user-select: none; }
${M} .dr-pad button { border: 0; border-radius: 16px; background: #fffaf0; color: #3b2a1e; font-size: 1.7em; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; cursor: pointer; touch-action: none; }
${M} .dr-pad button.on, ${M} .dr-pad button:active { background: #ffe08a; }
${M} .dr-pad [data-dr-pad="up"] { grid-column: 2; grid-row: 1; }
${M} .dr-pad [data-dr-pad="left"] { grid-column: 1; grid-row: 2; }
${M} .dr-pad [data-dr-pad="down"] { grid-column: 2; grid-row: 2; }
${M} .dr-pad [data-dr-pad="right"] { grid-column: 3; grid-row: 2; }
${M} .dr-cheer { position: absolute; left: 50%; top: 24%; transform: translateX(-50%); z-index: 4; display: flex; align-items: center; gap: 10px; max-width: calc(100% - 32px); background: #2e9b5a; color: #fff; font-size: 1.35em; padding: 10px 22px 10px 12px; border-radius: 999px; box-shadow: inset 0 0 0 3px #fffaf0, 0 5px 0 #17592f; animation: dr-pop .45s ease-out; }
${M} .dr-cheer span { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: #fffaf0; color: #2e9b5a; font-weight: 800; flex: none; }
${M} .dr-still .dr-cheer { animation: none; }
@keyframes dr-pop { 0% { transform: translateX(-50%) scale(.6); } 70% { transform: translateX(-50%) scale(1.08); } 100% { transform: translateX(-50%) scale(1); } }
@media (prefers-reduced-motion: reduce) { ${M} .dr-cheer { animation: none; } }
${M} .dr-plan { position: absolute; inset: 0; background: #f6ecd6; overflow: hidden; padding: 12px; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(320px, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 12px; }
${M} .dr-say { grid-column: 1 / -1; margin-left: calc(var(--dr-back) - 12px); min-height: 50px; }
${M} .dr-map { background: #fffaf0; border-radius: 16px; padding: 8px; box-shadow: inset 0 0 0 2px #b08a55; min-height: 0; display: flex; flex-direction: column; gap: 4px; }
${M} .dr-mapsvg { flex: 1 1 auto; min-height: 0; cursor: pointer; }
${M} .dr-mapsvg svg { display: block; width: 100%; height: 100%; }
${M} .dr-maptip { flex: none; margin: 0; text-align: center; font-size: .9em; font-weight: 600; color: #5e4936; }
${M} .dr-side { background: #fffaf0; border-radius: 16px; padding: 12px; box-shadow: inset 0 0 0 2px #b08a55; min-height: 0; display: flex; flex-direction: column; }
${M} .dr-side h2 { flex: none; display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
${M} .dr-side h2, ${M} .dr-card h2 { margin: 0 0 8px; font-size: 1.2em; font-weight: 800; }
${M} .dr-count { font-size: .78em; font-weight: 700; color: #5e4936; white-space: nowrap; }
${M} .dr-prog, ${M} .dr-now { list-style: none; margin: 0; padding: 0; }
${M} .dr-prog { flex: 1 1 auto; min-height: 96px; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column; gap: 5px; padding: 3px; margin: -3px; position: relative; }
${M} .dr-prog li { flex: none; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-height: 46px; padding: 3px 6px; border-radius: 12px; background: #e3effb; box-shadow: inset 0 0 0 2px #7fb0e6; font-weight: 700; }
${M} .dr-prog li[data-op="up"] { background: #e6f5df; box-shadow: inset 0 0 0 2px #7cc06a; }
${M} .dr-prog li[data-op="drop"] { background: #fdebd2; box-shadow: inset 0 0 0 2px #e0a050; }
${M} .dr-prog li.stop, ${M} .dr-now li.stop { background: #ffe08a; box-shadow: inset 0 0 0 3px #b3541e; }
${M} .dr-prog li.sel { box-shadow: inset 0 0 0 3px #1f6fd0; }
${M} .dr-prog li.dr-empty { background: none; box-shadow: inset 0 0 0 2px #c9bfae; color: #5e4936; font-weight: 600; padding-left: 12px; }
${M} .dr-num { display: grid; place-items: center; min-width: 28px; height: 28px; border-radius: 50%; background: #3b2a1e; color: #fff; font-size: .85em; font-weight: 800; flex: none; }
${M} .dr-prog button.dr-num { min-width: 40px; min-height: 40px; height: 40px; border-radius: 50%; background: #3b2a1e; color: #fff; font-size: .95em; box-shadow: inset 0 0 0 2px #3b2a1e, inset 0 0 0 4px #fffaf0; }
${M} .dr-prog li.sel button.dr-num { background: #1f6fd0; box-shadow: inset 0 0 0 2px #1f6fd0, inset 0 0 0 4px #fffaf0; }
${M} .dr-step { flex: 1 1 4.5em; }
${M} .dr-n { min-width: 3.9em; text-align: center; }
${M} .dr-prog button { min-width: 40px; min-height: 40px; border: 0; border-radius: 10px; background: #fffaf0; color: #3b2a1e; font: 800 1.15em Inter, system-ui, sans-serif; box-shadow: inset 0 0 0 2px #b08a55; cursor: pointer; }
${M} .dr-prog button:disabled { color: #a79d90; box-shadow: inset 0 0 0 2px #d8cfc0; cursor: default; }
${M} .dr-tools { flex: 1 0 100%; display: flex; gap: 6px; padding: 0 0 3px 46px; }
${M} .dr-tools button { font-size: .95em; padding: 0 12px; }
${M} .dr-note { flex: none; margin: 6px 0 8px; font-size: .9em; line-height: 1.3; color: #5e4936; min-height: 1.3em; }
${M} .dr-note.warn { color: #8a3d12; font-weight: 700; }
${M} .dr-meter { flex: none; margin: 0 0 8px; padding: 6px 10px; border-radius: 12px; background: #f6ecd6; font-size: .9em; font-weight: 600; }
${M} .dr-meter p { margin: 4px 0 0; }
${M} .dr-bat { display: flex; align-items: center; gap: 8px; }
${M} .dr-bar { flex: 1; height: 12px; border-radius: 6px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55; overflow: hidden; }
${M} .dr-bar i { display: block; height: 100%; background: #2e9b5a; }
${M} .dr-bat.over .dr-bar i { background: #d2452d; }
${M} .dr-bat.over b { color: #8a3d12; }
${M} .dr-pal { flex: none; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-bottom: 4px; }
${M} .dr-tile { min-height: 48px; padding: 4px 8px; border: 0; border-radius: 12px; background: #e3effb; color: #3b2a1e; font: 800 1em/1.15 Inter, system-ui, sans-serif; box-shadow: inset 0 0 0 2px #7fb0e6, 0 3px 0 #5b8dc4; cursor: pointer; text-align: center; }
${M} .dr-tile.up { background: #e6f5df; box-shadow: inset 0 0 0 2px #7cc06a, 0 3px 0 #5a9b49; }
${M} .dr-tile.drop { background: #fdebd2; box-shadow: inset 0 0 0 2px #e0a050, 0 3px 0 #b97b30; }
${M} .dr-pal .dr-tile:disabled { background: #e4ddd0; color: #6d6257; box-shadow: inset 0 0 0 2px #c9bfae; cursor: default; }
${M} .dr-row { flex: none; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
${M} .dr-row .dr-btn { flex: 1 1 auto; }
${M} .dr-now { position: absolute; right: 12px; bottom: 14px; width: min(300px, 46vw); max-height: min(52%, 420px); overflow: auto; background: #fffaf0; border-radius: 16px; padding: 10px; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; display: grid; gap: 3px; }
${M} .dr-now li { display: flex; align-items: center; gap: 8px; padding: 5px 6px; border-radius: 10px; font-weight: 700; }
${M} .dr-now li.now { background: #cfe5ff; box-shadow: inset 0 0 0 3px #1f6fd0; }
${M} .dr-now li.done { color: #5e4936; }
${M} .dr-now li.done .dr-num { background: #2e9b5a; }
${M} .dr-now li.miss { background: #ffe9b8; box-shadow: inset 0 0 0 2px #c98a1e; color: #3b2a1e; }
${M} .dr-now li.miss .dr-num { background: #c98a1e; }
${M} .dr-card { position: absolute; left: 50%; top: 70px; transform: translateX(-50%); width: min(980px, calc(100% - 24px)); max-height: calc(100% - 82px); overflow: auto; background: #fffaf0; border-radius: 18px; padding: 14px; box-shadow: inset 0 0 0 2px #b08a55, 0 5px 0 #7a5a33; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 14px; align-items: start; }
${M} .dr-cardmap svg { display: block; width: 100%; height: auto; border-radius: 12px; box-shadow: inset 0 0 0 2px #e6d3b0; }
${M} .dr-card ul { margin: 0 0 10px; padding-left: 1.2em; line-height: 1.4; font-weight: 600; }
${M} .dr-ask { background: #f6ecd6; border-radius: 12px; padding: 10px; }
${M} .dr-ask p { margin: 0; font-weight: 700; }
${M} .dr-ask b { color: #b3541e; }
${M} .dr-reply { margin-top: 8px !important; font-weight: 600 !important; }
${M} .dr-reply[hidden] { display: none; }
${M} .dr-ends { margin-top: 12px; }
@media ${NARROW} {
  ${M} .dr-plan { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(170px, 0.8fr) minmax(0, 1fr); }
  ${M} .dr-card { grid-template-columns: minmax(0, 1fr); }
  ${M} .dr-talk { max-width: none; }
}
@media (max-width: 600px) {
  ${M} .dr-talk { top: 66px; left: 12px; }
  ${M} .dr-plan { padding-top: 66px; }
  ${M} .dr-say { margin-left: 0; }
  ${M} .dr-card { top: 66px; }
  ${M} .dr-hud { bottom: 170px; max-width: calc(100% - 24px); }
}
@media (max-height: 620px) {
  ${M} .dr-tile, ${M} .dr-btn { min-height: 42px; }
  ${M} .dr-maptip { display: none; }
}
`;
