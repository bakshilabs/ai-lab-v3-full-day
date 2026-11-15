// Robot training: the workshop bench, drawn in the module's own layer (ctx.root). Page only: the learning is in
// learn.js, the words in words.js, the pictures in pictures.js. Every control is a button: tap, drag or keys.
import { kind, binById, canShow, readyToTest, shelf, examplesOf, gap, ROOM, FEATURES } from './learn.js';
import { itemSvg, binSvg, robotSvg, florenceSvg, chartSvg } from './pictures.js';
import { SAY, STEPS, verdict, lacked, wrongBin, streetLine, sameText } from './words.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MARK = { ok: '✓', miss: '✗', ask: '?' };

export function createBench(ctx, env) {
  const { junior, feats, bins } = env; const root = ctx.root; const still = !!ctx.settings.reduceMotion;
  root.innerHTML = `<div class="rb ${junior ? 'junior' : 'senior'}${still ? ' still' : ''}${ctx.settings.largeText ? ' large' : ''}">
    <header class="rb-head"><ol class="rb-steps" aria-label="Steps">${STEPS.map((s, i) => `<li data-step="${i}"><i>${i + 1}</i><b>${s}</b></li>`).join('')}</ol></header>
    <div class="rb-say"><span class="rb-flo">${florenceSvg(46)}</span><p aria-live="polite"></p></div>
    <section class="rb-main"></section><footer class="rb-foot"></footer></div>`;
  const el = root.firstElementChild; const main = el.querySelector('.rb-main'); const foot = el.querySelector('.rb-foot'); const line = el.querySelector('.rb-say p');
  let keys = false; // the last input was the keyboard: move focus for the child after the page changes
  el.addEventListener('keydown', () => { keys = true; }, true); el.addEventListener('pointerdown', () => { keys = false; }, true);
  const say = (text) => { line.textContent = text; ctx.say(text); };
  const step = (n) => { el.querySelectorAll('.rb-steps li').forEach((li, i) => { li.className = i < n ? 'done' : i === n ? 'on' : ''; if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); }); };
  const focusSoon = (sel) => { if (keys) (main.querySelector(sel) || foot.querySelector(sel))?.focus(); };
  const chips = (id, same = null) => `<span class="rb-chips">${feats.map((f) => `<i${same?.includes(f) ? ' class="same"' : ''}>${esc(kind(id).f[f])}</i>`).join('')}</span>`;
  const sees = `The robot can tell: ${feats.map((f) => FEATURES[f].label.toLowerCase()).join(', ')}`;
  const wait = (fn) => new Promise((res) => fn(res));

  // ---------- showing examples. st.rounds[last] is filled in place; onChange() after each change.
  function teach(st, { starred = [], onChange }) {
    const round = st.rounds.length - 1; const cur = st.rounds[round]; const room = ROOM(junior); let picked = null; let ghost = null; let drag = null; let noClick = false;
    step(round === 0 ? 0 : 2); el.dataset.stage = 'teach';
    say(round === 0 ? SAY.teach0(junior, bins.length) : SAY.teachMore(junior, room - cur.length));
    return wait((done) => {
      const exs = () => examplesOf(st.rounds); const ready = () => readyToTest(exs(), round, cur.length, junior);
      function draw() {
        const ex = exs(); const items = shelf(ex, round, junior); const full = round > 0 && cur.length >= room;
        main.innerHTML = `<div class="rb-teach"><div class="rb-shelf rb-panel"><h3>${round === 0 ? 'On the bench' : 'More things to show'}<small>${round === 0 ? 'Tap one, then tap its bin. Or drag it.' : `Room for ${room - cur.length} more`}</small></h3>
          <div class="rb-items${full ? ' full' : ''}">${items.map((id) => `<button type="button" class="rb-item${starred.includes(id) ? ' starred' : ''}${picked === id ? ' picked' : ''}" data-kind="${id}" data-truth="${kind(id).bin}" aria-pressed="${picked === id}" aria-label="${esc(kind(id).name)}: ${feats.map((f) => kind(id).f[f]).join(', ')}${starred.includes(id) ? '. The robot lacked this' : ''}">${starred.includes(id) ? '<em class="rb-star" aria-hidden="true">★</em>' : ''}${itemSvg(id, 72)}<b>${esc(kind(id).name)}</b>${chips(id)}</button>`).join('') || '<p class="rb-empty">Everything here has been shown.</p>'}</div></div>
          <div class="rb-side"><div class="rb-robotbox">${robotSvg('idle', 120)}<p class="rb-note">${sees}.<br>It knows ${ex.length} example${ex.length === 1 ? '' : 's'} so far.</p></div>
          <div class="rb-bins">${bins.map((b, i) => { const inb = ex.filter((e) => e.bin === b.id); return `<button type="button" class="rb-bin" data-bin="${b.id}" style="--bin:${b.colour}" aria-label="${esc(b.name)} bin, ${inb.length} shown. Key ${i + 1}">${binSvg(b.colour, 54)}<b>${esc(b.name)}</b><kbd aria-hidden="true">${i + 1}</kbd><span class="rb-in">${inb.map((e) => `<span class="${cur.includes(e.kind) ? 'new' : ''}">${itemSvg(e.kind, 34)}</span>`).join('') || '<small>Nothing shown yet</small>'}</span></button>`; }).join('')}</div></div></div>`;
        foot.innerHTML = `<p class="rb-hint">${round === 0 ? (ready() ? 'Every bin has an example.' : 'Each bin needs at least one example.') : (cur.length ? `${cur.length} added.` : 'Add at least one example.')}</p>
          <button type="button" class="rb-btn alt" data-undo ${cur.length ? '' : 'disabled'}>↶ Undo last</button><button type="button" class="rb-btn go" data-go ${ready() ? '' : 'disabled'}>${round === 0 ? 'Test the robot' : 'Test again'} ➜</button>`;
        foot.querySelector('[data-go]').onclick = () => { if (ready()) { cleanup(); done(); } };
        foot.querySelector('[data-undo]').onclick = () => { if (cur.length) { cur.pop(); picked = null; onChange?.(); draw(); focusSoon('.rb-item'); } };
      }
      function place(id, bin) {
        const c = canShow(id, bin, exs(), round, cur.length, junior);
        if (!c.ok) {
          if (c.why === 'bin') { say(wrongBin(id, junior)); const b = main.querySelector(`.rb-item[data-kind="${id}"]`); if (b && !still) { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); } }
          else if (c.why === 'full') say(SAY.full(junior));
          return;
        }
        const was = ready(); cur.push(id); picked = null; onChange?.(); draw();
        if (round === 0 && !was && ready()) say(SAY.teachReady(junior)); else if (round > 0 && cur.length >= room) say(SAY.full(junior));
        if (keys) (main.querySelector('.rb-item') || foot.querySelector('[data-go]'))?.focus();
      }
      const pick = (id) => { picked = picked === id ? null : id; main.querySelectorAll('.rb-item').forEach((b) => { const on = b.dataset.kind === picked; b.classList.toggle('picked', on); b.setAttribute('aria-pressed', on); }); main.querySelector('.rb-bins')?.classList.toggle('aim', !!picked); };
      const onClick = (e) => {
        if (noClick) { noClick = false; return; }
        const item = e.target.closest('.rb-item'); if (item) { pick(item.dataset.kind); return; }
        const bin = e.target.closest('.rb-bin'); if (bin) { if (picked) place(picked, bin.dataset.bin); else say(junior ? 'Tap a thing first, then its bin.' : 'Choose a thing first, then its bin.'); }
      };
      const onKey = (e) => { // 1–4: put the chosen (or focused) thing in that bin
        const n = Number(e.key); if (!(n >= 1 && n <= bins.length) || e.ctrlKey || e.metaKey || e.altKey) return;
        const id = picked || document.activeElement?.closest?.('.rb-item')?.dataset.kind; if (id) { e.preventDefault(); place(id, bins[n - 1].id); }
      };
      // dragging: a copy of the picture follows the finger; letting go over a bin puts it in
      const onDown = (e) => { const item = e.target.closest('.rb-item'); if (!item || (e.pointerType === 'mouse' && e.button !== 0)) return; drag = { id: item.dataset.kind, x: e.clientX, y: e.clientY, on: false, pid: e.pointerId }; };
      const onMove = (e) => {
        if (!drag || e.pointerId !== drag.pid) return;
        if (!drag.on && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 10) { drag.on = true; ghost = document.createElement('div'); ghost.className = 'rb-ghost'; ghost.innerHTML = itemSvg(drag.id, 84); el.appendChild(ghost); main.querySelector('.rb-bins')?.classList.add('aim'); }
        if (drag.on) { ghost.style.transform = `translate(${e.clientX - 42}px, ${e.clientY - 42}px)`; const over = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.rb-bin'); main.querySelectorAll('.rb-bin').forEach((b) => b.classList.toggle('over', b === over)); e.preventDefault(); }
      };
      const onUp = (e) => {
        if (!drag || e.pointerId !== drag.pid) return; const d = drag; drag = null; if (!d.on) return;
        ghost?.remove(); ghost = null; noClick = true; setTimeout(() => { noClick = false; }, 60);
        main.querySelectorAll('.rb-bin').forEach((b) => b.classList.remove('over')); main.querySelector('.rb-bins')?.classList.remove('aim');
        const bin = e.type === 'pointerup' ? document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.rb-bin') : null; if (bin) place(d.id, bin.dataset.bin);
      };
      function cleanup() { main.removeEventListener('click', onClick); el.removeEventListener('keydown', onKey); main.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp); ghost?.remove(); }
      main.addEventListener('click', onClick); el.addEventListener('keydown', onKey); main.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: false }); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
      ctx.onLeave(cleanup); draw(); focusSoon('.rb-item');
    });
  }

  // ---------- a test: the robot sorts the tray one thing at a time. prev: the test before, to show what changed.
  function test(t, n, prev) {
    step(n === 1 ? 1 : 3); el.dataset.stage = 'test'; say(n === 1 ? SAY.test1(junior, t.of) : SAY.testAgain(junior));
    return wait((done) => {
      let i = -1;
      function draw() {
        const r = i >= 0 ? t.results[i] : null; const v = r ? verdict(r) : null; const right = t.results.slice(0, i + 1).filter((x) => x.ok).length;
        const tray = t.results.map((x, k) => { const vk = verdict(x); const was = prev?.results[k]; const ch = k <= i && was && was.ok !== x.ok ? (x.ok ? '<em class="up">new</em>' : '<em class="down">changed</em>') : '';
          return `<li class="${k < i ? `done ${vk.cls}` : k === i ? `now ${vk.cls}` : 'wait'}" aria-label="${esc(kind(x.kind).name)}${k <= i ? `: ${vk.tag}` : ''}">${itemSvg(x.kind, 40)}${k <= i ? `<b class="rb-mark ${vk.cls}">${MARK[vk.cls]}</b>` : ''}${ch}</li>`; }).join('');
        const like = !r ? '' : r.got !== null ? `<div class="rb-like"><small>Looks most like</small>${itemSvg(r.match, 60)}<b>${esc(kind(r.match).name)}</b>${chips(r.match, r.same)}<small class="rb-same">${esc(sameText(r.same))}</small></div>`
          : r.why === 'tie' ? `<div class="rb-like"><small>Cannot choose between</small><span class="rb-two">${r.rivals.map((x) => `<span>${itemSvg(x.kind, 48)}<b>${esc(kind(x.kind).name)}</b></span>`).join('')}</span></div>`
            : '<div class="rb-like"><small>Nothing it was shown looks like this</small><span class="rb-q">?</span></div>';
        const where = !r ? '' : r.got !== null ? `<div class="rb-card rb-where ${v.cls}" style="--bin:${binById(r.got).colour}">${binSvg(binById(r.got).colour, 78)}<b>${esc(binById(r.got).name)}</b><span class="rb-tag ${v.cls}">${MARK[v.cls]} ${v.tag}</span></div>`
          : `<div class="rb-card rb-where ask"><span class="rb-q" aria-hidden="true">?</span><b>Asks a person</b><span class="rb-tag ask">? ${v.tag}</span></div>`;
        main.innerHTML = `<div class="rb-test"><div class="rb-panel rb-traybox"><h3>${junior ? 'Test tray' : 'Test set'}<small>${junior ? 'Kept apart. The robot has not been shown these.' : 'Held back from the examples, so the test is fair.'}</small></h3><ol class="rb-tray">${tray}</ol></div>
          ${r ? `<div class="rb-stagebox" data-i="${i}"><div class="rb-card rb-thing">${itemSvg(r.kind, 104)}<b>${esc(kind(r.kind).name)}</b>${chips(r.kind, r.same || [])}</div><span class="rb-arrow" aria-hidden="true">➜</span>
            <div class="rb-card rb-think">${robotSvg(r.got === null ? 'ask' : r.ok ? 'ok' : 'look', 110)}${like}</div><span class="rb-arrow" aria-hidden="true">➜</span>${where}</div>
            <p class="rb-verdict ${v.cls}"><b>${v.tag}.</b> ${esc(v.text)}</p>`
    : `<div class="rb-stagebox idle"><div class="rb-card rb-think">${robotSvg('idle', 150)}<div class="rb-like"><small>Ready</small><b>${t.of} things to sort</b></div></div></div>`}</div>`;
        foot.innerHTML = `<p class="rb-hint" aria-live="polite">${i >= 0 ? `In the right bin so far: <b>${right} of ${i + 1}</b>` : `${t.of} things on the tray`}</p><button type="button" class="rb-btn go" data-go>${i < 0 ? 'Sort the first thing' : i < t.of - 1 ? 'Next thing' : 'See the results'} ➜</button>`;
        const go = foot.querySelector('[data-go]'); go.onclick = () => { if (i >= t.of - 1) { done(); return; } i++; draw(); const x = verdict(t.results[i]); ctx.say(`${kind(t.results[i].kind).name}. ${x.tag}. ${x.text}`); };
        if (keys) go.focus();
      }
      draw();
    });
  }

  const missList = (t, ex) => t.results.filter((r) => !r.ok).map((r) => { const v = verdict(r); return `<li>${itemSvg(r.kind, 60)}<div><b>${esc(kind(r.kind).name)}</b> <span class="rb-tag ${v.cls}">${MARK[v.cls]} ${v.tag}</span><p>${esc(v.text)}</p><p class="rb-lack"><span aria-hidden="true">★</span> ${esc(lacked(r.kind, gap(r.kind, ex, feats)))}</p></div></li>`; }).join('');
  const button = (sel) => wait((done) => { foot.querySelectorAll('[data-act]').forEach((b) => { b.onclick = () => done(b.dataset.act); }); focusSoon(sel); });

  // ---------- after the first test: what it missed, and what its examples lacked
  function review(t, ex) {
    step(2); el.dataset.stage = 'review'; say(SAY.review(junior, t.right, t.of));
    main.innerHTML = `<div class="rb-review"><div class="rb-panel rb-score"><b>${t.right}</b><span>of ${t.of}</span><small>in the right bin</small>${robotSvg('look', 96)}</div>
      <div class="rb-panel rb-missbox"><h3>What it had not been shown yet</h3><ul class="rb-misses">${missList(t, ex)}</ul></div></div>`;
    foot.innerHTML = '<p class="rb-hint">The robot did its best with what it had been shown.</p><button type="button" class="rb-btn go" data-act="more">Add examples ➜</button>';
    return button('[data-act]');
  }
  // ---------- after a later test: before and after, and a choice
  function result(tests, shown, ex, canMore) {
    const a = tests[0]; const b = tests[tests.length - 1]; step(3); el.dataset.stage = 'result';
    say(`${SAY.result(junior, a.right, b.right, b.of)}${b.right === b.of ? ` ${SAY.resultFull(junior)}` : ''}`);
    const misses = missList(b, ex);
    main.innerHTML = `<div class="rb-review"><div class="rb-panel rb-chart">${chartSvg({ tests, shown, street: null })}</div>
      <div class="rb-panel rb-missbox">${misses ? `<h3>Still not shown</h3><ul class="rb-misses">${misses}</ul>` : `<h3>Every one in the right bin</h3><div class="rb-allok">${robotSvg('ok', 130)}<p>The robot now has ${ex.length} examples. Next it meets things it has never seen, out in the street.</p></div>`}</div></div>`;
    foot.innerHTML = `<p class="rb-hint">${canMore ? 'Add more examples, or send the robot out.' : 'Time to send the robot out.'}</p>${canMore ? '<button type="button" class="rb-btn alt" data-act="more">Add more and test again</button>' : ''}<button type="button" class="rb-btn go" data-act="street">Send it to the street ➜</button>`;
    return button('[data-act="street"]');
  }

  // ---------- the street: the 3D view shows through; a caption card tells what the robot does with each thing
  function street(results, play) {
    step(4); el.dataset.stage = 'street'; el.classList.add('out'); main.innerHTML = '';
    line.textContent = ''; el.querySelector('.rb-say').hidden = true;
    return wait((done) => {
      let i = -1; let busy = false;
      const draw = (text, r) => {
        const v = r ? verdict(r) : null;
        foot.innerHTML = `<div class="rb-cap">${r ? `<span class="rb-cappic">${itemSvg(r.kind, 72)}</span>` : `<span class="rb-flo">${florenceSvg(52)}</span>`}<div><p aria-live="polite">${r ? `<span class="rb-tag ${v.cls}">${MARK[v.cls]} ${v.tag}</span> ` : ''}${esc(text)}</p>${r ? `<small>Thing ${i + 1} of ${results.length}</small>` : ''}</div>
          <button type="button" class="rb-btn go" data-go ${busy ? 'disabled' : ''}>${i < 0 ? 'Start' : i < results.length - 1 ? 'Next' : i === results.length - 1 ? 'How did it do?' : 'Finish'} ➜</button></div>`;
        const go = foot.querySelector('[data-go]'); go.onclick = next; if (keys && !busy) go.focus();
      };
      function next() {
        if (busy) return;
        if (i >= results.length) { done(); return; }
        i++;
        if (i === results.length) { const s = { right: results.filter((r) => r.ok).length, asked: results.filter((r) => r.got === null).length, of: results.length }; s.wrong = s.of - s.right - s.asked; const text = SAY.streetEnd(junior, s); draw(text, null); ctx.say(text); return; }
        const r = results[i]; const text = streetLine(r); busy = true; draw(text, r); ctx.say(text);
        play(r, () => { busy = false; if (!ctx.signal.aborted) draw(text, r); });
      }
      const hello = SAY.street(junior, results.length); draw(hello, null); ctx.say(hello);
    });
  }
  return { teach, test, review, result, street, el };
}

// ---------- styles. Every rule starts with the module's own layer, so nothing here can touch the game.
const M = '#module[data-module="robots"]';
export const css = `
§ .rb { position: absolute; inset: 0; display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; gap: 8px; padding: 10px 14px 12px; font: 600 var(--fs, 16px)/1.35 Inter, system-ui, sans-serif; color: #3b2a1e;
  background: linear-gradient(transparent 0 80%, #cf9a62 80% 81.4%, #b47c48 81.4%), radial-gradient(circle at 12px 12px, #e3cfa6 2.2px, transparent 2.6px) 0 0 / 36px 36px, #f6e9cd; }
§ .rb.large { font-size: calc(var(--fs, 16px) * 1.12); }
§ .rb.out { background: none; pointer-events: none; grid-template-rows: auto 1fr auto; }
§ .rb.out > * { pointer-events: auto; } § .rb.out .rb-main { pointer-events: none; }
§ .rb button { font: inherit; color: inherit; cursor: pointer; }
§ .rb button:focus-visible { outline: 3px solid #1f6fd0; outline-offset: 2px; }
§ .rb h3 { margin: 0 0 8px; font-size: 1.05em; font-weight: 800; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; }
§ .rb h3 small { font-weight: 600; font-size: .82em; color: #5e4936; }
§ .rb-head { padding-left: 190px; min-height: 46px; display: flex; align-items: center; }
§ .rb-steps { list-style: none; margin: 0; padding: 4px; display: flex; flex-wrap: wrap; gap: 4px; background: #fffaf0; border-radius: 14px; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-steps li { display: flex; align-items: center; gap: 6px; padding: 4px 12px 4px 5px; border-radius: 10px; font-size: .86em; color: #5e4936; }
§ .rb-steps li i { font-style: normal; width: 1.7em; height: 1.7em; border-radius: 50%; display: grid; place-items: center; background: #eadcbd; font-weight: 800; }
§ .rb-steps li.on { background: #2e9b5a; color: #fff; } § .rb-steps li.on i { background: #fff; color: #1f7a44; }
§ .rb-steps li.done i { background: #bfe3cb; color: #1f7a44; }
§ .rb-say { display: flex; align-items: center; gap: 10px; background: #fffaf0; border-radius: 16px; padding: 8px 14px; box-shadow: inset 0 0 0 2px #d7bf95, 0 3px 0 #c9ae80; min-height: 60px; }
§ .rb-say[hidden] { display: none; }
§ .rb-say p { margin: 0; font-size: 1.04em; font-weight: 700; } § .rb-flo { flex: none; display: grid; }
§ .rb-main { min-height: 0; overflow: auto; }
§ .rb-panel, § .rb-card { background: #fffaf0; border-radius: 16px; padding: 10px 12px; box-shadow: inset 0 0 0 2px #d7bf95, 0 3px 0 #c9ae80; }
§ .rb-foot { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; min-height: 54px; }
§ .rb-hint { margin: 0 auto 0 0; padding: 6px 12px; border-radius: 12px; background: #fffaf0; font-weight: 700; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-btn { min-height: 50px; padding: 8px 20px; border: 0; border-radius: 14px; font-weight: 800 !important; font-size: 1.05em !important; background: #fff; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
§ .rb-btn.go { background: #2e9b5a; color: #fff !important; box-shadow: inset 0 -4px 0 #1f7a44, 0 3px 0 #17603a; }
§ .rb-btn:disabled { background: #e9e0cc; color: #6f5f4c !important; box-shadow: inset 0 0 0 2px #cdbb99; cursor: default; }
§ .rb-teach { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 12px; min-height: 100%; align-items: start; }
§ .rb-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 8px; }
§ .rb.junior .rb-items { grid-template-columns: repeat(auto-fill, minmax(136px, 1fr)); }
§ .rb-item { position: relative; display: grid; justify-items: center; gap: 2px; padding: 8px 6px; border: 0; border-radius: 14px; background: #fff; box-shadow: inset 0 0 0 2px #d7bf95, 0 3px 0 #c9ae80; touch-action: none; user-select: none; -webkit-user-select: none; }
§ .rb-item .rb-pic { width: clamp(46px, 8.4vh, 72px); height: clamp(46px, 8.4vh, 72px); pointer-events: none; }
§ .rb.junior .rb-item .rb-pic { width: clamp(52px, 11vh, 96px); height: clamp(52px, 11vh, 96px); }
§ .rb-item b { font-size: .92em; font-weight: 800; text-align: center; }
§ .rb-item.picked { background: #e3f4e9; box-shadow: inset 0 0 0 4px #2e9b5a, 0 3px 0 #1f7a44; }
§ .rb-item.starred { box-shadow: inset 0 0 0 3px #e0a21c, 0 3px 0 #b98312; background: #fff7dc; }
§ .rb-item.starred.picked { box-shadow: inset 0 0 0 4px #2e9b5a, 0 3px 0 #1f7a44; }
§ .rb-items.full .rb-item { background: #efe8d8; color: #6f5f4c; }
§ .rb-star { position: absolute; top: 2px; right: 6px; font-style: normal; font-size: 1.3em; color: #c58a0a; }
§ .rb-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 3px; }
§ .rb-chips i { font-style: normal; font-size: .72em; font-weight: 700; padding: 1px 7px; border-radius: 999px; background: #efe3c8; color: #4a3828; }
§ .rb-chips i.same { background: #2e9b5a; color: #fff; }
§ .rb-empty { margin: 8px; }
§ .rb-side { display: grid; gap: 10px; }
§ .rb-robotbox { display: flex; align-items: center; gap: 12px; justify-content: center; }
§ .rb-note { margin: 0; padding: 8px 12px; border-radius: 14px; background: #243447; color: #fff; font-size: .9em; font-weight: 700; }
§ .rb-bins { display: grid; gap: 8px; }
§ .rb-bin { position: relative; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto 1fr; column-gap: 10px; align-items: center; text-align: left; padding: 8px 12px; border: 0; border-radius: 16px; background: #fffaf0; box-shadow: inset 0 0 0 3px var(--bin), 0 4px 0 var(--bin); min-height: 78px; }
§ .rb-bin > svg { grid-row: 1 / 3; } § .rb-bin > b { font-weight: 800; font-size: 1.05em; }
§ .rb-bin kbd { position: absolute; top: 6px; right: 8px; font: 800 .78em Inter, system-ui, sans-serif; width: 1.7em; height: 1.7em; display: grid; place-items: center; border-radius: 7px; background: #efe3c8; color: #4a3828; }
§ .rb-in { display: flex; flex-wrap: wrap; gap: 3px; min-height: 36px; align-items: center; } § .rb-in small { color: #5e4936; font-weight: 600; }
§ .rb-in span { display: grid; border-radius: 9px; background: #f3e9d2; padding: 1px; } § .rb-in span.new { background: #cfeed9; box-shadow: inset 0 0 0 2px #2e9b5a; }
§ .rb-bins.aim .rb-bin { background: #fff; box-shadow: inset 0 0 0 4px var(--bin), 0 4px 0 var(--bin), 0 0 0 4px #ffe08a; }
§ .rb-bin.over { background: #e3f4e9 !important; }
§ .rb-ghost { position: fixed; left: 0; top: 0; z-index: 9; pointer-events: none; filter: drop-shadow(0 6px 0 rgba(60, 40, 20, .25)); }
§ .rb-test { display: grid; gap: 10px; }
§ .rb-tray { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
§ .rb-tray li { position: relative; display: grid; place-items: center; width: 56px; height: 56px; border-radius: 12px; background: #f3e9d2; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-tray li.now { background: #fff; box-shadow: inset 0 0 0 4px #1f6fd0; }
§ .rb-tray li.done.ok { background: #dff3e6; } § .rb-tray li.done.miss { background: #fde6cf; } § .rb-tray li.done.ask { background: #fff1c2; }
§ .rb-mark { position: absolute; right: -4px; bottom: -4px; width: 1.5em; height: 1.5em; border-radius: 50%; display: grid; place-items: center; font-size: .82em; font-weight: 800; color: #fff; background: #1f7a44; box-shadow: 0 0 0 2px #fffaf0; }
§ .rb-mark.miss { background: #b3501f; } § .rb-mark.ask { background: #8a6200; }
§ .rb-tray em { position: absolute; left: 50%; top: -9px; transform: translateX(-50%); font-style: normal; font-size: .66em; font-weight: 800; padding: 0 6px; border-radius: 999px; background: #1f7a44; color: #fff; white-space: nowrap; }
§ .rb-tray em.down { background: #b3501f; }
§ .rb-stagebox { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.5fr) auto minmax(0, 1fr); gap: 8px; align-items: stretch; }
§ .rb-stagebox.idle { grid-template-columns: minmax(0, 1fr); justify-items: center; }
§ .rb-card { display: grid; justify-items: center; align-content: center; gap: 4px; text-align: center; } § .rb-card > b { font-weight: 800; font-size: 1.05em; }
§ .rb-think { grid-template-columns: auto 1fr; align-items: center; }
§ .rb-like { display: grid; justify-items: center; gap: 3px; padding: 8px 10px; border-radius: 14px; background: #eef4fb; box-shadow: inset 0 0 0 2px #c4d6ea; }
§ .rb-like small { font-weight: 800; color: #2b3a55; } § .rb-like .rb-same { color: #1f7a44; }
§ .rb-two { display: flex; gap: 12px; } § .rb-two span { display: grid; justify-items: center; font-size: .86em; }
§ .rb-q { font-size: 2.6em; font-weight: 800; color: #8a6200; line-height: 1; } § .rb-hand { font-size: 3em; line-height: 1.1; }
§ .rb-arrow { align-self: center; font-size: 1.6em; color: #7a5a33; }
§ .rb-where { box-shadow: inset 0 0 0 3px var(--bin, #c9a13a), 0 3px 0 var(--bin, #c9a13a); }
§ .rb-tag { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: .84em; font-weight: 800; color: #fff; background: #1f7a44; white-space: nowrap; }
§ .rb-tag.miss { background: #b3501f; } § .rb-tag.ask { background: #8a6200; }
§ .rb-verdict { margin: 0; padding: 10px 14px; border-radius: 14px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d7bf95; font-size: 1.04em; }
§ .rb-verdict.ok { box-shadow: inset 0 0 0 3px #2e9b5a; } § .rb-verdict.miss { box-shadow: inset 0 0 0 3px #b3501f; } § .rb-verdict.ask { box-shadow: inset 0 0 0 3px #c9a13a; }
§ .rb-review { display: grid; grid-template-columns: minmax(200px, 1fr) minmax(0, 2.2fr); gap: 12px; align-items: start; }
§ .rb-score { display: grid; justify-items: center; text-align: center; } § .rb-score > b { font-size: 4.2em; line-height: 1; font-weight: 800; color: #1f7a44; } § .rb-score > span { font-size: 1.5em; font-weight: 800; } § .rb-score small { color: #5e4936; margin-bottom: 8px; }
§ .rb-chart svg { display: block; width: 100%; height: auto; max-height: 46vh; }
§ .rb-misses { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
§ .rb-misses li { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 12px; background: #fff; box-shadow: inset 0 0 0 2px #e6d3b0; }
§ .rb-misses p { margin: 3px 0 0; font-size: .94em; } § .rb-lack { font-weight: 800; color: #6b4a00; } § .rb-lack span { color: #c58a0a; }
§ .rb-allok { display: flex; align-items: center; gap: 14px; } § .rb-allok p { margin: 0; font-size: 1.05em; }
§ .rb-cap { margin: 0 auto; width: min(860px, 100%); display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; background: #fffaf0; border-radius: 18px; padding: 10px 14px; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
§ .rb-cap p { margin: 0; font-size: 1.04em; font-weight: 700; } § .rb-cap small { color: #5e4936; } § .rb-cappic { display: grid; background: #f3e9d2; border-radius: 12px; padding: 2px; }
§ .rb.out .rb-foot { display: block; }
@keyframes rb-in { from { transform: translateY(10px); opacity: .2; } to { transform: none; opacity: 1; } }
@keyframes rb-no { 0%, 100% { transform: none; } 30% { transform: translateX(-6px); } 70% { transform: translateX(6px); } }
§ .rb:not(.still) .rb-stagebox > * { animation: rb-in .3s ease-out both; } § .rb:not(.still) .rb-stagebox > :nth-child(n+3) { animation-delay: .35s; } § .rb:not(.still) .rb-stagebox > :nth-child(n+5) { animation-delay: .7s; }
§ .rb:not(.still) .rb-item.no { animation: rb-no .3s; }
@media (max-width: 820px) {
  § .rb { padding: 8px; } § .rb-head { padding-left: 0; padding-top: 52px; } § .rb-steps li b { display: none; } § .rb-steps li.on b { display: inline; }
  § .rb-teach, § .rb-review { grid-template-columns: minmax(0, 1fr); } § .rb-robotbox { display: none; }
  § .rb-bins { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  § .rb-stagebox { grid-template-columns: minmax(0, 1fr); } § .rb-arrow { display: none; }
  § .rb-cap { grid-template-columns: auto 1fr; } § .rb-cap .rb-btn { grid-column: 1 / 3; }
}
@media (max-height: 640px) { § .rb-say { min-height: 0; padding: 4px 10px; } § .rb-flo svg { width: 32px; height: 32px; } }
`.replace(/§/g, M);
