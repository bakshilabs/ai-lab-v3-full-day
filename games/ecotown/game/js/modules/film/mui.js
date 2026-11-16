// Town film studio: the screens every mission shares. The mission map, the card that opens a mission (the real job,
// then how to play) and the one that closes it (what the child can now do), a question with big tiles, and a note.
// Page elements only: the words and the answers come from each mission's pure file. Nothing is typed anywhere.
import { MISSIONS, isOpen, mapLine, lockedLine, allDone } from './hour.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const pick = (v, j) => (v && typeof v === 'object' ? (j ? v.j : v.s) : v);
// the browser test reads the answer from the page (never shown): only when it asks for it
const testing = () => !!globalThis.__filmTest;
// How many misses before a question is set aside: two tiles must still be open, and at least one of them wrong, so
// the answer is never the only thing left (one miss on three choices; two on four with one answer, one on four with two).
export const missLimit = (item) => Math.max(1, item.opts.length - (item.answers?.length || 1) - 1);

export function createMissionUi(ctx, ui, { junior, onPanel }) {
  const root = ctx.root; let panel = null;
  const clear = () => { panel?.remove(); panel = null; };
  const put = (html, stage) => { clear(); ui.setStage(stage); panel = el(html); root.appendChild(panel); measure(); return panel; };
  const measure = () => { if (!panel) return; const H = root.clientHeight || innerHeight; const top = root.querySelector('.fm-talk')?.getBoundingClientRect().bottom || 70;
    panel.style.maxHeight = `${Math.max(160, H - top - 26)}px`; // never under Florence's line
    if (!onPanel) return; const mid = (top + Math.max(top, panel.getBoundingClientRect().top)) / 2; onPanel(Math.max(0, Math.min(0.72, (H / 2 - mid) / (H / 2)))); };
  const talk = (text, o) => { ui.talk(text, o); measure(); }; // Florence's line can grow: keep the panel below it
  const focus = (sel) => (panel?.querySelector(sel) || panel?.querySelector('button:not(:disabled)'))?.focus({ preventScroll: true });
  const wait = (handler) => new Promise((res) => { panel.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; handler(b, res); }; });

  // ---- the mission map: six missions in order, a tick on each one done, and one big button to carry on
  async function map(st) {
    const next = st.done.findIndex((d) => !d); const done = allDone(st);
    const card = (m, i) => {
      const open = isOpen(st, i); const tick = st.done[i]; const now = i === next;
      return `<li><button type="button" class="fm-mcard ${tick ? 'done' : ''} ${now ? 'now' : ''}" data-fm-mission="${i}" ${open ? '' : 'aria-disabled="true"'} aria-label="Mission ${m.n}: ${esc(m.use)}. ${tick ? 'Done. Press to play it again.' : now ? 'Next.' : open ? '' : 'Not open yet.'}">
        <span class="fm-mnum" aria-hidden="true">${tick ? '✓' : m.n}</span><span class="fm-mico" aria-hidden="true">${m.icon}</span>
        <span class="fm-mtxt"><b>${esc(m.use)}</b><small>${tick ? 'Done · play again' : now ? 'Next' : open ? 'Open' : '🔒 Opens after mission ' + (i)}</small></span></button></li>`;
    };
    put(`<section class="fm-m fm-map" data-fm-map aria-label="The missions">
      <div class="fm-mhead"><h2><span aria-hidden="true">🎬</span> Town film studio</h2><span class="fm-chip">${st.done.filter(Boolean).length} of 6 done</span></div>
      <ol class="fm-mlist">${MISSIONS.map(card).join('')}</ol>
      <div class="fm-row end">${done ? '<button type="button" class="fm-btn go big" data-fm-finish>See what you made ➜</button>' : `<button type="button" class="fm-btn go big" data-fm-carry>▶ Carry on: ${esc(MISSIONS[next].use)}</button>`}</div>
    </section>`, 'map');
    talk(mapLine(st, junior)); focus(done ? '[data-fm-finish]' : '[data-fm-carry]');
    return wait((b, res) => {
      if (b.dataset.fmFinish !== undefined) { clear(); res({ act: 'finish' }); }
      else if (b.dataset.fmCarry !== undefined) { clear(); res({ act: 'play', i: next }); }
      else if (b.dataset.fmMission !== undefined) { const i = +b.dataset.fmMission; if (!isOpen(st, i)) { talk(lockedLine(i)); return; } clear(); res({ act: 'play', i }); }
    });
  }

  // ---- the card that opens a mission: the real job and why it matters, then what to tap
  async function intro(m) {
    put(`<section class="fm-m fm-card2" data-fm-intro="${m.id}" aria-label="Mission ${m.n}">
      <p class="fm-kick">Mission ${m.n} of 6</p><h2><span aria-hidden="true">${m.icon}</span> ${esc(m.use)}</h2>
      <p class="fm-job">${esc(m.job)}</p><p class="fm-how"><b>How:</b> ${esc(pick(m.how, junior))}</p>
      <div class="fm-row"><button type="button" class="fm-btn" data-fm-tomap>← The missions</button><button type="button" class="fm-btn go big" data-fm-start>Start ➜</button></div>
    </section>`, 'intro-' + m.id);
    talk(m.job, { quiet: true }); ctx.say(`${m.use}. ${m.job} ${pick(m.how, junior)}`); focus('[data-fm-start]');
    return wait((b, res) => { if (b.dataset.fmStart !== undefined) { clear(); res('start'); } else if (b.dataset.fmTomap !== undefined) { clear(); res('map'); } });
  }

  // ---- the card that closes a mission: what the child can now do, and what they did
  async function outro(m, lines = []) {
    put(`<section class="fm-m fm-card2" data-fm-outro="${m.id}" aria-label="Mission ${m.n} done">
      <p class="fm-kick">Mission ${m.n} done ✓</p><h2>${esc(m.can)}</h2>
      ${lines.length ? `<ul class="fm-did">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
      <div class="fm-row end"><button type="button" class="fm-btn go big" data-fm-tomap>Back to the missions ➜</button></div>
    </section>`, 'outro-' + m.id);
    talk(m.can); focus('[data-fm-tomap]');
    return wait((b, res) => { if (b.dataset.fmTomap !== undefined) { clear(); res(); } });
  }

  // ---- one question. item: { q, say, opts: [{ id, label, icon?, pic?, why }], answer, ok, hint, more? }
  // A wrong tile says why it is not right (and, the first time, a hint); it never gives the answer after one miss.
  // The right tile shows Florence's line and a Next button. Resolves { tries } (wrong taps before the right one).
  // head: { kick, step: [i, n] }. pic: an SVG drawing beside the question. tools: extra buttons [{ id, label, on() }].
  // limit: after this many misses the question stops (so tapping every tile cannot win). It resolves { missed: true }
  // and the caller brings it back later; with reveal, Florence shows the answer and explains it instead.
  async function ask({ head = {}, item, pic = '', picLabel = '', tools = [], wide = false, cols = 0, onRight = null, limit = Infinity, reveal = false }) {
    // a set-aside question comes back with its tiles in a new order (moved round by one)
    if (reveal && item.opts.length > 1) item = { ...item, opts: [...item.opts.slice(1), item.opts[0]] };
    // how many misses before it stops: two tiles must still be left (one miss on three choices, two on four)
    const lim = limit === Infinity ? Infinity : missLimit(item); const soon = lastInQueue && !holdNext;
    let misses = 0; let chosen = null; let outcome = {}; const off = new Set(); const imgs = item.opts.some((o) => o.pic);
    const isRight = (id) => (item.answers ? item.answers.includes(id) : id === item.answer); // some questions have more than one good answer
    const p = put(`<section class="fm-m fm-ask ${pic ? 'has-pic' : ''} ${wide ? 'wide' : ''}" data-fm-ask aria-label="${esc(item.q)}">
      ${pic ? `<figure class="fm-qpic" ${picLabel ? `role="img" aria-label="${esc(picLabel)}"` : ''}>${pic}</figure>` : ''}
      <div class="fm-qbody">
        <div class="fm-qhead">${head.step ? `<span class="fm-dots" aria-label="${esc(head.kick || 'Question')} ${head.step[0]} of ${head.step[1]}">${Array.from({ length: head.step[1] }, (_, i) => `<i class="${i < head.step[0] ? 'on' : ''}"></i>`).join('')}</span>` : ''}${head.kick ? `<span class="fm-kick">${esc(head.kick)}</span>` : ''}</div>
        <h2>${esc(item.q)}</h2>
        ${tools.length ? `<div class="fm-tools">${tools.map((t) => `<button type="button" class="fm-btn small" data-fm-tool="${t.id}">${esc(t.label)}</button>`).join('')}</div>` : ''}
        <div class="fm-opts ${imgs ? 'pics' : ''}" role="group" aria-label="${esc(item.q)}" style="${cols ? `--fm-oc:${cols}` : ''}">${item.opts.map((o) => `<button type="button" class="fm-opt" data-fm-opt="${esc(o.id)}" ${testing() && isRight(o.id) ? 'data-fm-right' : ''}>${o.pic ? `<span class="fm-opic" aria-hidden="true">${o.pic}</span>` : ''}${o.icon ? `<span class="fm-ico" aria-hidden="true">${o.icon}</span>` : ''}<span class="fm-lab">${esc(o.label)}</span><small hidden></small></button>`).join('')}</div>
        <p class="fm-more" hidden></p>
        <div class="fm-row end"><button type="button" class="fm-btn go big" data-fm-next hidden>Next ➜</button></div>
      </div></section>`, 'ask');
    talk(item.say || item.q); focus('[data-fm-opt]');
    const mark = (id, cls, note) => { const b = p.querySelector(`[data-fm-opt="${CSS.escape(id)}"]`); if (!b) return; b.classList.add(cls); const s = b.querySelector('small'); s.hidden = false; s.textContent = note; if (cls === 'off') b.setAttribute('aria-disabled', 'true'); };
    return wait((b, res) => {
      if (b.dataset.fmTool) { tools.find((t) => t.id === b.dataset.fmTool)?.on(); return; }
      if (b.dataset.fmNext !== undefined) { clear(); res({ tries: misses, id: chosen, ...outcome }); return; }
      const id = b.dataset.fmOpt; if (id === undefined || off.has(id) || !p.querySelector('[data-fm-next]').hidden) return;
      const o = item.opts.find((x) => x.id === id);
      if (isRight(id)) {
        chosen = id; onRight?.(id); mark(id, 'right', '✓'); for (const x of p.querySelectorAll('[data-fm-opt]')) if (x.dataset.fmOpt !== id) x.disabled = true;
        talk(`${misses === 0 ? 'Yes. ' : 'That’s it. '}${item.ok}`);
        if (item.more) { const m = p.querySelector('.fm-more'); m.hidden = false; m.textContent = item.more; }
        const nx = p.querySelector('[data-fm-next]'); nx.hidden = false; nx.focus({ preventScroll: true }); measure();
      } else {
        misses++; off.add(id); mark(id, 'off', 'Not this one');
        if (misses >= lim) { // two tiles are still left: tapping every tile must not win
          for (const x of p.querySelectorAll('[data-fm-opt]')) x.disabled = true;
          if (reveal) { // the second time round: show the answer, and why
            const r = item.opts.find((x) => isRight(x.id)); mark(r.id, 'right', 'This one'); chosen = r.id; outcome = { revealed: true };
            talk(`${o?.why || 'Not this one.'} The answer is “${r.label}”. ${item.ok}`);
          } else { outcome = { missed: true }; talk(`${o?.why || 'Not this one.'} ${soon ? 'Let’s come back to this one in a moment, with fresh eyes.' : holdNext ? 'Let’s leave this one for now. It comes back after the next question.' : 'Let’s leave this one for now. It comes back at the end, so look out for it.'}`); }
          const nx = p.querySelector('[data-fm-next]'); nx.hidden = false; nx.focus({ preventScroll: true }); measure();
          return;
        }
        talk(`${o?.why || 'Not this one.'}${misses === 1 && item.hint ? ' ' + item.hint : ' Try another.'}`);
        p.querySelector('[data-fm-opt]:not(.off)')?.focus({ preventScroll: true });
      }
    });
  }

  // ---- a list of questions. run(item, i, again) asks one (passing limit and reveal on to ask); a question missed
  // (once on three choices, twice on four or more) is set aside and asked again at the end, once, with the answer shown if it is missed twice again.
  // more: another list of questions follows in this mission. Then the last question of this list, if it is set
  // aside, is held and asked after the first question of the next list, not straight away.
  let lastInQueue = false; let holdNext = false; let held = []; let lists = 0;
  async function askList(items, run, { more = false } = {}) {
    const me = ++lists; const queue = items.map((it, i) => ({ it, i, again: false })); const out = [];
    while (queue.length) {
      const q = queue.shift(); lastInQueue = queue.length === 0; holdNext = lastInQueue && more;
      const r = await run(q.it, q.i, q.again); lastInQueue = false; holdNext = false;
      if (r.missed && !q.again) { if (more && queue.length === 0) held.push({ ...q, again: true, run, me }); else queue.push({ ...q, again: true }); }
      else out.push({ i: q.i, again: q.again, ...r });
      await flushHeld(me); // a question held from an earlier list comes back after this list's first question
    }
    return out;
  }
  // ask the questions held from earlier lists (all of them, when the mission ends)
  async function flushHeld(notFrom = 0) {
    const now = held.filter((h) => h.me !== notFrom); held = held.filter((h) => h.me === notFrom);
    for (const h of now) await h.run(h.it, h.i, true);
  }
  const LIMIT = 2;

  // ---- a note: a heading, a few lines, an optional drawing and one button
  async function note({ kick = '', title, lines = [], pic = '', btn = 'Next ➜', say = null, stage = 'note' }) {
    put(`<section class="fm-m fm-card2 ${pic ? 'has-pic' : ''}" data-fm-note aria-label="${esc(title)}">
      ${kick ? `<p class="fm-kick">${esc(kick)}</p>` : ''}<h2>${esc(title)}</h2>
      ${pic ? `<figure class="fm-npic">${pic}</figure>` : ''}${lines.map((l) => `<p>${esc(l)}</p>`).join('')}
      <div class="fm-row end"><button type="button" class="fm-btn go big" data-fm-ok>${esc(btn)}</button></div></section>`, stage);
    // Florence's written line stays short (the card has the rest); the whole card is read aloud
    const full = say ?? [title, ...lines].map((t) => (/[.!?:]$/.test(t) ? t : t + '.')).join(' ');
    talk(say ?? (lines[0] || title), { quiet: true }); ctx.say(full); focus('[data-fm-ok]');
    return wait((b, res) => { if (b.dataset.fmOk !== undefined) { clear(); res(); } });
  }

  // a custom panel (mission 2's storyboard table, mission 4's timeline): the mission draws into it
  function custom(html, stage) { return put(html, stage); }

  addEventListener('resize', measure);
  return { map, intro, outro, ask, askList, flushHeld, LIMIT, note, custom, clear, measure, say: talk, off() { clear(); removeEventListener('resize', measure); } };
}

const M = '#module[data-module="film"]';
export const MCSS = `
${M} .fm-m { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); width: min(980px, calc(100% - 24px)); max-height: calc(100% - 96px); overflow: auto; box-sizing: border-box; background: #fffaf0; border-radius: 20px; padding: 14px 16px 16px; box-shadow: inset 0 0 0 2px #b08a55, 0 5px 0 #7a5a33; }
${M} .fm-m h2 { font-size: 1.4em; font-weight: 800; line-height: 1.2; }
${M} .fm-kick { margin: 0 0 4px; font-weight: 800; color: #b3541e; font-size: .9em; letter-spacing: .02em; }
${M} .fm-row.end { justify-content: flex-end; }
${M} .fm-mhead { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
${M} .fm-mlist { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
${M} .fm-mcard { width: 100%; height: 100%; display: flex; align-items: center; gap: 10px; min-height: 76px; padding: 8px 12px; border: 0; border-radius: 16px; background: #f3e6cc; color: #3b2a1e; text-align: left; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; cursor: pointer; font-size: 1em; }
${M} .fm-mcard.now { background: #ffe08a; box-shadow: inset 0 0 0 4px #b3541e, 0 4px 0 #7a5a33; }
${M} .fm-mcard.done { background: #e4f5e8; box-shadow: inset 0 0 0 2px #2e9b5a, 0 4px 0 #17592f; }
${M} .fm-mcard[aria-disabled="true"] { background: #ece6da; color: #5e554b; box-shadow: inset 0 0 0 2px #c9bfae, 0 4px 0 #b3a994; cursor: default; }
${M} .fm-mcard[aria-disabled="true"] .fm-mico { filter: grayscale(1); opacity: .6; }
${M} .fm-mnum { flex: none; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: #3b2a1e; color: #fff; font-weight: 800; }
${M} .fm-mcard.done .fm-mnum { background: #2e9b5a; }
${M} .fm-mico { font-size: 1.8em; line-height: 1; flex: none; }
${M} .fm-mtxt { display: flex; flex-direction: column; min-width: 0; }
${M} .fm-mtxt b { font-weight: 800; font-size: 1.02em; line-height: 1.2; }
${M} .fm-mtxt small { font-weight: 700; color: #5e4936; font-size: .85em; margin-top: 2px; }
${M} .fm-card2 { width: min(760px, calc(100% - 24px)); }
${M} .fm-card2 p { margin: 8px 0 0; font-size: 1.05em; line-height: 1.4; font-weight: 600; }
${M} .fm-job { font-size: 1.15em !important; }
${M} .fm-how { background: #f3e6cc; border-radius: 12px; padding: 8px 12px; }
${M} .fm-did { margin: 10px 0 0; padding-left: 1.2em; font-weight: 600; line-height: 1.45; }
${M} .fm-npic { margin: 10px 0 0; } ${M} .fm-npic svg, ${M} .fm-qpic svg { display: block; width: 100%; height: auto; border-radius: 10px; box-shadow: 0 0 0 2px #3b2a1e; }
${M} .fm-ask.has-pic { display: grid; grid-template-columns: minmax(0, 42%) minmax(0, 1fr); gap: 14px; align-items: start; }
${M} .fm-ask.wide.has-pic { grid-template-columns: minmax(0, 52%) minmax(0, 1fr); }
${M} .fm-qpic { margin: 0; }
${M} .fm-qhead { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
${M} .fm-qhead .fm-kick { margin: 0; }
${M} .fm-tools { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
${M} .fm-opts { display: grid; grid-template-columns: repeat(var(--fm-oc, 3), minmax(0, 1fr)); gap: 9px; margin-top: 10px; }
${M} .fm-opts:not([style*="--fm-oc"]) { grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); }
${M} .fm-opt { position: relative; display: flex; align-items: center; gap: 9px; min-height: 56px; padding: 8px 12px; border: 0; border-radius: 14px; background: #f3e6cc; color: #3b2a1e; font-weight: 700; font-size: 1em; line-height: 1.3; text-align: left; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; cursor: pointer; flex-wrap: wrap; }
${M} .fm-opts.pics .fm-opt { flex-direction: column; flex-wrap: nowrap; align-items: stretch; text-align: center; }
${M} .fm-opts.pics .fm-opt .fm-lab { flex: none; }
${M} .fm-opic svg { display: block; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 0 0 2px #3b2a1e; }
${M} .fm-opt .fm-ico { font-size: 1.6em; line-height: 1; flex: none; }
${M} .fm-opt .fm-lab { flex: 1 1 60%; min-width: 0; }
${M} .fm-opt small { flex: 1 1 100%; font-size: .8em; font-weight: 800; }
${M} .fm-opt small[hidden] { display: none; }
${M} .fm-opt.right { background: #dff3e4; box-shadow: inset 0 0 0 4px #2e9b5a, 0 4px 0 #17592f; }
${M} .fm-opt.right small { color: #17592f; }
${M} .fm-opt.off { background: #ece6da; color: #5e554b; box-shadow: inset 0 0 0 2px #c9bfae, 0 4px 0 #b3a994; cursor: default; }
${M} .fm-opt.off small { color: #8a3a14; }
${M} .fm-opt.off .fm-opic { filter: grayscale(1); opacity: .55; }
${M} .fm-opt:disabled:not(.right) { opacity: .75; cursor: default; }
${M} .fm-more { margin: 10px 0 0; padding: 8px 12px; border-radius: 12px; background: #e3effb; font-weight: 700; line-height: 1.35; }
${M} .fm-more[hidden] { display: none; }
${M} .fm-opt:active:not(:disabled), ${M} .fm-mcard:active:not([aria-disabled]) { transform: translateY(2px); }
@media (max-width: 820px) {
  ${M} .fm-mlist { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  ${M} .fm-ask.has-pic, ${M} .fm-ask.wide.has-pic { grid-template-columns: 1fr; }
  ${M} .fm-ask.has-pic .fm-qpic { max-width: 520px; width: 100%; justify-self: center; }
}

${M} .fm-hear { margin: 8px 0 0; padding: 7px 11px; border-radius: 10px; background: #f3e6cc; font-weight: 700; line-height: 1.35; }
${M} .fm-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
${M} .fm-pair figure { margin: 0; } ${M} .fm-pair figcaption { margin-top: 4px; text-align: center; font-weight: 800; }
${M} .fm-qpic .fm-pair svg { box-shadow: 0 0 0 2px #3b2a1e; }
${M} .fm-story h2, ${M} .fm-trim h2, ${M} .fm-pace h2 { margin-bottom: 8px; }
${M} .fm-slots { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(var(--fm-n), minmax(0, 1fr)); gap: 8px; }
${M} .fm-slots li { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
${M} .fm-part { font-size: .8em; font-weight: 800; color: #5e4936; text-transform: uppercase; letter-spacing: .04em; }
${M} .fm-empty { display: grid; place-items: center; aspect-ratio: 16 / 12; border-radius: 12px; outline: 3px dashed #b08a55; outline-offset: -3px; color: #7a5a33; font-weight: 800; background: #f6ecd6; }
${M} .fm-pool { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding: 10px; border-radius: 14px; background: #f3e6cc; min-height: 60px; }
${M} .fm-pool .fm-scard { width: calc((100% - 5 * 8px) / 6); min-width: 118px; }
${M} .fm-scard { display: flex; flex-direction: column; gap: 4px; padding: 5px; border: 0; border-radius: 12px; background: #fffaf0; color: #3b2a1e; font-weight: 700; font-size: .86em; line-height: 1.25; text-align: left; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; cursor: pointer; }
${M} .fm-scard svg { display: block; width: 100%; height: auto; border-radius: 7px; box-shadow: 0 0 0 1.5px #3b2a1e; }
${M} .fm-scard:disabled { cursor: default; box-shadow: inset 0 0 0 3px #2e9b5a, 0 3px 0 #17592f; }
${M} .fm-clips { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
${M} .fm-clip { position: relative; width: 100%; display: flex; flex-direction: column; gap: 4px; padding: 5px; border: 0; border-radius: 12px; background: #fffaf0; color: #3b2a1e; font-weight: 700; font-size: .84em; line-height: 1.25; text-align: left; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; cursor: pointer; min-height: 44px; }
${M} .fm-clip svg { display: block; width: 100%; height: auto; border-radius: 7px; }
${M} .fm-clip.cut { background: #ece6da; color: #5e554b; box-shadow: inset 0 0 0 2px #c9bfae; }
${M} .fm-clip.cut svg { filter: grayscale(1); opacity: .45; }
${M} .fm-clip.cut span { text-decoration: line-through; }
${M} .fm-clip em { position: absolute; left: 50%; top: 26%; transform: translateX(-50%); font-style: normal; font-weight: 800; background: #3b2a1e; color: #fff; border-radius: 999px; padding: 1px 9px; }
${M} .fm-clip em:empty { display: none; }
${M} .fm-tl { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; }
${M} .fm-tl li { flex: var(--w) 1 0; min-width: 0; display: flex; flex-direction: column; gap: 4px; background: #f3e6cc; border-radius: 12px; padding: 6px; transition: flex-grow .25s; }
${M} .fm-tlpic svg { display: block; width: 100%; height: auto; border-radius: 7px; box-shadow: 0 0 0 1.5px #3b2a1e; }
${M} .fm-tl span { font-size: .82em; font-weight: 700; line-height: 1.2; overflow-wrap: anywhere; }
${M} .fm-len { display: flex; flex-direction: column; gap: 4px; margin-top: auto; }
${M} .fm-len button { min-height: 40px; border: 0; border-radius: 9px; background: #fffaf0; color: #3b2a1e; font-weight: 800; font-size: .84em; box-shadow: inset 0 0 0 2px #b08a55; cursor: pointer; padding: 2px 4px; }
${M} .fm-len button.on { background: #2e9b5a; color: #fff; box-shadow: inset 0 0 0 2px #17592f; }
${M} .fm-show { width: min(700px, calc(100% - 24px)); }
${M} .fm-show .fm-row { justify-content: space-between; }
${M} .fm-desc { margin: 10px 0 0; padding: 9px 12px; border-radius: 12px; background: #e3effb; font-weight: 700; font-size: 1.1em; line-height: 1.35; }
${M} .fm-desc[hidden] { display: none; }
@media (max-width: 820px) {
  ${M} .fm-clips { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  ${M} .fm-pool .fm-scard { width: calc((100% - 3 * 8px) / 4); min-width: 0; }
}
@media (max-width: 520px) { ${M} .fm-slots { grid-template-columns: repeat(3, minmax(0, 1fr)); } ${M} .fm-clips { grid-template-columns: repeat(3, minmax(0, 1fr)); } ${M} .fm-tl { flex-wrap: wrap; } ${M} .fm-tl li { flex: 1 1 40%; } }
${M} .fm-still * { transition: none !important; }
${M} .fm-buildtop { display: grid; grid-template-columns: minmax(0, 42%) minmax(0, 1fr); gap: 14px; align-items: start; }
${M} .fm-capline { display: flex; flex-wrap: wrap; gap: 6px; min-height: 52px; margin: 8px 0 0; padding: 8px; border-radius: 12px; background: #17110c; align-items: center; }
${M} .fm-capline .fm-hint { color: #d8cfc0; }
${M} .fm-bank { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding: 10px; border-radius: 14px; background: #f3e6cc; }
${M} .fm-tok { min-height: 46px; padding: 6px 12px; border: 0; border-radius: 10px; background: #fffaf0; color: #3b2a1e; font-weight: 800; font-size: 1em; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; cursor: pointer; text-align: left; }
${M} .fm-tok.on { background: #000; color: #fff; box-shadow: inset 0 0 0 2px #fff6e0; }
@media (max-width: 820px) { ${M} .fm-buildtop { grid-template-columns: 1fr; } ${M} .fm-buildtop .fm-qpic { max-width: 460px; } }
@media (max-width: 520px) { ${M} .fm-mlist { grid-template-columns: 1fr; } ${M} .fm-opts { grid-template-columns: 1fr 1fr !important; } }
`;
