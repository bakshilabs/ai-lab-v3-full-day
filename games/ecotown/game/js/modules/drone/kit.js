// Drones at work: the shared page pieces of the hour. The mission map, the card that opens each mission (the real job,
// then how), the card that ends it (what the child can now do), and a full-screen panel with Florence's line for the
// missions played on a map. Page elements only; words come from missions.js and the mission files.
import { MISSIONS, words, isOpen, nextMission, allDone } from './missions.js';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const keyboardUser = () => { try { return document.documentElement.matches(':focus-within') || matchMedia('(pointer: fine)').matches; } catch { return true; } };

// A small scope for one mission: what to undo when it ends or when the child leaves part way.
export function makeScope() {
  const ends = []; let over = false;
  return { onEnd(fn) { if (over) { try { fn(); } catch (e) { console.error(e); } } else ends.push(fn); }, end() { over = true; for (const f of ends.splice(0).reverse()) { try { f(); } catch (e) { console.error(e); } } }, get over() { return over; } };
}

export function createKit(ctx, { reduce }) {
  const root = ctx.root; const junior = !!ctx.junior;
  // Wait for one of the buttons inside box with data-k: resolves with its value. Other clicks call onOther(button).
  const choose = (box, onOther) => new Promise((res) => {
    box.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || b.disabled || !box.contains(b)) return; if (b.dataset.k !== undefined) res(b.dataset.k); else onOther?.(b, e); });
  });
  const focusFirst = (box, sel = '[data-k]') => { const b = box.querySelector(`${sel}:not(:disabled)`); if (b && keyboardUser()) b.focus({ preventScroll: true }); };

  // ---- the mission map: six stops on a flight path. Resolves with { act: 'play', id } or { act: 'finish' }.
  async function hub(st, { first = false } = {}) {
    const next = nextMission(st); const all = allDone(st);
    const head = all ? 'All six missions are done. You can play any of them again, or see what you made.'
      : first ? 'Six missions, six real jobs that drones do. Each one takes about seven minutes. They open one after another.'
        : `Mission ${MISSIONS.findIndex((m) => m.id === next) + 1} is next: ${MISSIONS.find((m) => m.id === next).title}.`;
    const box = el(`<div class="dk-hub" data-dk-hub role="region" aria-label="Drones at work: the missions">
      <div class="dk-hubhead"><h1>🚁 Drones at work</h1><p>${esc(head)}</p></div>
      <ol class="dk-stops">${MISSIONS.map((m, i) => { const done = st.done.includes(m.id), open = isOpen(st, m.id), isNext = m.id === next;
        const state = done ? '✓ Done: play again' : isNext ? '▶ Next' : `Opens after mission ${i}`;
        return `<li class="dk-stop${done ? ' done' : ''}${isNext ? ' next' : ''}"><button type="button" data-k="${m.id}" ${open ? '' : 'disabled'} aria-label="Mission ${i + 1}: ${esc(m.title)}, ${esc(m.use)}. ${esc(state)}">
          <span class="dk-n" aria-hidden="true">${done ? '✓' : i + 1}</span><span class="dk-ico" aria-hidden="true">${m.icon}</span><span class="dk-t"><b>${esc(m.title)}</b><small>${esc(m.use)}</small><em>${esc(state)}</em></span></button></li>`; }).join('')}</ol>
      <div class="dk-row">${all ? '<button type="button" class="dr-btn go" data-k="finish">See what you made ➜</button>' : `<button type="button" class="dr-btn go" data-k="${next}">${st.done.length ? 'Carry on' : 'Start'}: mission ${MISSIONS.findIndex((m) => m.id === next) + 1} ➜</button>`}</div></div>`);
    root.appendChild(box); ctx.say(head); focusFirst(box, '.dk-row [data-k]');
    const k = await choose(box); box.remove();
    return k === 'finish' ? { act: 'finish' } : { act: 'play', id: k };
  }

  // ---- the card that opens a mission: the real job, then how. Resolves when Start is pressed.
  async function opening(id) {
    const m = MISSIONS.find((x) => x.id === id); const n = MISSIONS.indexOf(m) + 1; const how = words(m.how, junior);
    const box = el(`<div class="dk-card" data-dk-open="${id}" role="region" aria-label="Mission ${n}: ${esc(m.title)}"><div class="dk-cardico" aria-hidden="true">${m.icon}</div>
      <p class="dk-kicker">Mission ${n} of 6 · ${esc(m.use)}</p><h2>${esc(m.title)}</h2><p class="dk-job">${esc(m.open)}</p><p class="dk-how"><b>How:</b> ${esc(how)}</p>
      <div class="dk-row"><button type="button" class="dr-btn go" data-k="go">Start mission ${n} ➜</button></div></div>`);
    root.appendChild(box); ctx.say(`Mission ${n}: ${m.title}. ${m.open} ${how}`); focusFirst(box);
    await choose(box); box.remove();
  }
  // ---- the card that ends a mission: what the child can now do, and what happened. Resolves with 'map' or 'next'.
  // finish: every mission is done, so the card offers the record straight away ('finish').
  async function closing(id, lines = [], { last = false, finish = false } = {}) {
    const m = MISSIONS.find((x) => x.id === id); const n = MISSIONS.indexOf(m) + 1;
    const box = el(`<div class="dk-card done" data-dk-close="${id}" role="region" aria-label="Mission ${n} done"><div class="dk-cardico" aria-hidden="true">✓</div>
      <p class="dk-kicker">Mission ${n} done · ${esc(m.title)}</p><h2>${esc(m.after)}</h2>${lines.length ? `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
      <div class="dk-row"><button type="button" class="dr-btn" data-k="map">Back to the missions</button>${finish ? '<button type="button" class="dr-btn go" data-k="finish">All six done: see what you made ➜</button>' : last ? '' : `<button type="button" class="dr-btn go" data-k="next">Next: mission ${n + 1} ➜</button>`}</div></div>`);
    root.appendChild(box); ctx.say(`${m.after} ${lines.join(' ')}`); focusFirst(box, finish ? '[data-k="finish"]' : last ? '[data-k]' : '[data-k="next"]');
    const k = await choose(box); box.remove(); return k;
  }

  // ---- a full-screen panel for a mission played on a picture: Florence's line on top, the picture, a side column.
  function panel(name, { side = true } = {}) {
    const box = el(`<div class="dk-panel${side ? '' : ' wide'}" data-dk-panel="${name}"><div class="dr-say" role="status"><b>Florence</b><p></p></div><div class="dk-main"></div>${side ? '<div class="dk-side"></div>' : ''}</div>`);
    root.appendChild(box); const sayP = box.querySelector('.dr-say p');
    return { box, main: box.querySelector('.dk-main'), side: box.querySelector('.dk-side'),
      say(text, { quiet = false } = {}) { sayP.textContent = text; if (!quiet) ctx.say(text); },
      remove() { box.remove(); } };
  }
  return { hub, opening, closing, panel, choose, focusFirst, junior, reduce };
}

const M = '#module[data-module="drone"]';
export const KIT_CSS = `
${M} .dk-hub, ${M} .dk-card { position: absolute; left: 50%; top: 72px; transform: translateX(-50%); width: min(920px, calc(100% - 24px)); max-height: calc(100% - 84px); overflow: auto; background: #fffaf0; border-radius: 18px; padding: 16px 18px; box-shadow: inset 0 0 0 2px #b08a55, 0 5px 0 #7a5a33; }
${M} .dk-hubhead h1 { margin: 0 0 4px; font-size: 1.5em; font-weight: 800; }
${M} .dk-hubhead p { margin: 0 0 12px; font-weight: 600; line-height: 1.35; }
${M} .dk-stops { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; counter-reset: s; }
${M} .dk-stop button { width: 100%; min-height: 96px; display: grid; grid-template-columns: auto auto minmax(0, 1fr); align-items: center; gap: 8px; padding: 10px; border: 0; border-radius: 14px; background: #f3e6cc; color: #3b2a1e; font: inherit; text-align: left; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; cursor: pointer; }
${M} .dk-stop.next button { background: #e6f5df; box-shadow: inset 0 0 0 3px #2e9b5a, 0 3px 0 #17592f; }
${M} .dk-stop.done button { background: #fffaf0; }
${M} .dk-stop button:disabled { background: #ece3d0; color: #6d6257; box-shadow: inset 0 0 0 2px #c9bfae; cursor: default; }
${M} .dk-n { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #3b2a1e; color: #fff; font-weight: 800; }
${M} .dk-stop.done .dk-n { background: #2e9b5a; }
${M} .dk-stop button:disabled .dk-n { background: #a79d90; }
${M} .dk-ico { font-size: 1.8em; line-height: 1; }
${M} .dk-t { display: grid; gap: 2px; min-width: 0; }
${M} .dk-t b { font-size: 1.05em; }
${M} .dk-t small { font-size: .9em; font-weight: 600; color: #5e4936; }
${M} .dk-t em { font-style: normal; font-size: .88em; font-weight: 800; color: #1f7442; }
${M} .dk-stop button:disabled .dk-t em { color: #6d6257; }
${M} .dk-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; justify-content: flex-end; }
${M} .dk-row .dr-btn { flex: 0 1 auto; }
${M} .dk-card { width: min(640px, calc(100% - 24px)); text-align: left; }
${M} .dk-cardico { float: right; font-size: 2.6em; line-height: 1; margin: 0 0 6px 10px; }
${M} .dk-card.done .dk-cardico { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%; background: #2e9b5a; color: #fff; font-size: 2em; font-weight: 800; }
${M} .dk-kicker { margin: 0 0 4px; font-size: .9em; font-weight: 800; color: #b3541e; }
${M} .dk-card h2 { margin: 0 0 10px; font-size: 1.35em; font-weight: 800; line-height: 1.25; }
${M} .dk-job { margin: 0 0 10px; font-size: 1.08em; font-weight: 700; line-height: 1.4; }
${M} .dk-how { margin: 0; padding: 10px 12px; border-radius: 12px; background: #f6ecd6; font-weight: 600; line-height: 1.4; }
${M} .dk-card ul { margin: 0; padding-left: 1.2em; line-height: 1.45; font-weight: 600; }
${M} .dk-panel { position: absolute; inset: 0; background: #f6ecd6; overflow: hidden; padding: 12px; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(300px, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 12px; }
${M} .dk-panel.wide { grid-template-columns: minmax(0, 1fr); }
${M} .dk-panel > .dr-say { grid-column: 1 / -1; margin-left: calc(var(--dr-back) - 12px); min-height: 50px; }
${M} .dk-main, ${M} .dk-side { background: #fffaf0; border-radius: 16px; padding: 10px; box-shadow: inset 0 0 0 2px #b08a55; min-height: 0; overflow: auto; overscroll-behavior: contain; }
${M} .dk-main { display: flex; flex-direction: column; gap: 6px; }
${M} .dk-main svg { display: block; width: 100%; height: auto; max-height: 100%; }
${M} .dk-side { display: flex; flex-direction: column; gap: 8px; }
${M} .dk-side h2 { margin: 0; font-size: 1.15em; font-weight: 800; }
${M} .dk-side p { margin: 0; line-height: 1.35; font-weight: 600; }
${M} .dk-side .dr-row { margin-top: auto; }
${M} .dk-note { padding: 8px 10px; border-radius: 12px; background: #f6ecd6; font-weight: 600; line-height: 1.35; }
${M} .dk-note.good { background: #e6f5df; box-shadow: inset 0 0 0 2px #7cc06a; }
${M} .dk-note.warn { background: #ffe9b8; box-shadow: inset 0 0 0 2px #c98a1e; }
${M} .dk-choices { display: grid; gap: 8px; }
${M} .dk-choices .dr-btn { text-align: left; }
${M} .dk-choices .dr-btn.right { background: #e6f5df; box-shadow: inset 0 0 0 3px #2e9b5a, 0 3px 0 #17592f; }
${M} .dk-choices .dr-btn.nope { background: #ffe9b8; box-shadow: inset 0 0 0 2px #c98a1e, 0 3px 0 #8a5d10; }
${M} .dk-steps { display: flex; gap: 6px; flex-wrap: wrap; margin: 0; padding: 0; list-style: none; }
${M} .dk-steps li { padding: 3px 10px; border-radius: 999px; background: #ece3d0; font-size: .88em; font-weight: 800; color: #5e4936; }
${M} .dk-steps li.now { background: #1f6fd0; color: #fff; }
${M} .dk-steps li.done { background: #2e9b5a; color: #fff; }
@media (max-width: 900px), (orientation: portrait) {
  ${M} .dk-stops { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  ${M} .dk-panel { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1.1fr) minmax(0, 1fr); }
}
@media (max-width: 600px) {
  ${M} .dk-hub, ${M} .dk-card { top: 66px; }
  ${M} .dk-stops { grid-template-columns: minmax(0, 1fr); }
  ${M} .dk-panel { padding-top: 66px; }
  ${M} .dk-panel > .dr-say { margin-left: 0; }
}
`;
