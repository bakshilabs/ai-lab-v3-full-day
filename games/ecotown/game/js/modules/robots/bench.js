// Robot training: the workshop bench, drawn in the module's own layer (ctx.root). Page only: the learning is in
// learn.js, the words in words.js, the pictures in pictures.js. Every control is a button: tap, drag or keys.
import { kind, binById, canShow, readyToTest, shelf, examplesOf, explain, runTest, confusion, featsOn, featuresFor, ROOM, FEATURES } from './learn.js';
import { itemSvg, binSvg, robotSvg, florenceSvg, chartSvg } from './pictures.js';
import { SAY, STEPS, verdict, did, why, wrongBin, streetLine, sameText, tuneLine } from './words.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MARK = { ok: '✓', miss: '✗', ask: '?' };
const SHORT = { paper: 'Paper', glass: 'Glass', food: 'Food', repair: 'Repair', ask: 'Asked' };

export function createBench(ctx, env, sh) {
  const { junior, feats, bins } = env; const still = sh.still;
  sh.setup({ mission: { n: 4, icon: '♻️' }, steps: STEPS, stage: 'teach' });
  const { el, main, foot, line, later, say, wait, guard, focusSoon } = sh;
  const step = (n) => sh.step(n); const fitHead = () => sh.fitHead();
  // what the robot can tell about a thing. Condition is shown only when it is not "good" (most things are).
  const chips = (id, same = null, fs = feats) => `<span class="rb-chips">${fs.filter((f) => f !== 'state' || kind(id).f.state !== 'good').map((f) => `<i${same?.includes(f) ? ' class="same"' : ''}>${esc(kind(id).f[f])}</i>`).join('')}</span>`;
  const featWords = (id) => feats.filter((f) => f !== 'state' || kind(id).f.state !== 'good').map((f) => kind(id).f[f]).join(', ');
  const sees = `The robot looks at ${feats.map((f) => FEATURES[f].label.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' and $1')}`;

  // ---------- showing examples. st.rounds[last] is filled in place; onChange() after each change.
  // stars(): the shelf things that would each, right now, fill a gap in the test (learn.js starsFor), best first.
  function teach(st, { stars = () => [], onChange }) {
    const round = st.rounds.length - 1; const cur = st.rounds[round]; const room = ROOM(junior); let picked = null; let ghost = null; let drag = null; let noClick = false;
    step(round === 0 ? 0 : 2); el.dataset.stage = 'teach';
    say(round === 0 ? SAY.teach0(junior, bins.length) : SAY.teachMore(junior, room - cur.length, stars().length > 0));
    return wait((done) => {
      const exs = () => examplesOf(st.rounds); const ready = () => readyToTest(exs(), round, cur.length, junior);
      const cue = () => { const it = main.querySelector('.rb-items'); const more = main.querySelector('.rb-more'); if (it && more) more.hidden = !(it.scrollHeight - it.scrollTop - it.clientHeight > 12); };
      function draw() {
        const ex = exs(); const all = shelf(ex, round, junior); const star = (round > 0 ? stars() : []).filter((id) => all.includes(id)); const items = [...star, ...all.filter((id) => !star.includes(id))]; // the starred things come first
        const full = round > 0 && cur.length >= room; const top = main.querySelector('.rb-items')?.scrollTop || 0;
        main.innerHTML = `<div class="rb-teach"><div class="rb-shelf rb-panel"><h3>${round === 0 ? 'On the bench' : 'More things to show'}<small>${round === 0 ? 'Tap one, then tap its bin. Or drag it.' : `Room for ${room - cur.length} more${star.length ? '. ★ fills a gap' : ''}`}</small></h3>
          <div class="rb-items${full ? ' full' : ''}${round > 0 ? ' small' : ''}">${items.map((id) => `<button type="button" class="rb-item${star.includes(id) ? ' starred' : ''}${picked === id ? ' picked' : ''}" data-kind="${id}" data-truth="${kind(id).bin}" aria-pressed="${picked === id}" aria-label="${esc(kind(id).name)}: ${esc(featWords(id))}${star.includes(id) ? '. Starred: this fills a gap' : ''}">${star.includes(id) ? '<em class="rb-star" aria-hidden="true">★</em>' : ''}${itemSvg(id, 72)}<b>${esc(kind(id).name)}</b>${chips(id)}</button>`).join('') || '<p class="rb-empty">Everything here has been shown.</p>'}</div>
          <button type="button" class="rb-more" tabindex="-1" hidden>▼ More below</button></div>
          <div class="rb-side"><div class="rb-robotbox">${robotSvg('idle', 104)}<p class="rb-note">${sees}.<br>It knows ${ex.length} example${ex.length === 1 ? '' : 's'} so far.</p></div>
          <div class="rb-bins">${bins.map((b, i) => { const inb = ex.filter((e) => e.bin === b.id); return `<button type="button" class="rb-bin" data-bin="${b.id}" style="--bin:${b.colour}" aria-label="${esc(b.name)} bin, ${inb.length} shown. Key ${i + 1}">${binSvg(b.colour, 54)}<b>${esc(b.name)}</b><kbd aria-hidden="true">${i + 1}</kbd><span class="rb-in">${inb.map((e) => `<span class="${cur.includes(e.kind) ? 'new' : ''}">${itemSvg(e.kind, 34)}</span>`).join('') || '<small>Nothing shown yet</small>'}</span></button>`; }).join('')}</div></div></div>`;
        foot.innerHTML = `<p class="rb-hint">${round === 0 ? (ready() ? 'Every bin has an example.' : 'Each bin needs at least one example.') : (cur.length ? `${cur.length} added.` : 'Add at least one example.')}</p>
          <button type="button" class="rb-btn alt" data-undo ${cur.length ? '' : 'disabled'}>↶ Undo last</button><button type="button" class="rb-btn go" data-go ${ready() ? '' : 'disabled'}>${round === 0 ? 'Test the robot' : 'Test again'} ➜</button>`;
        foot.querySelector('[data-go]').onclick = () => { if (ready()) { cleanup(); done(); } };
        foot.querySelector('[data-undo]').onclick = () => { if (cur.length) { cur.pop(); picked = null; onChange?.(); draw(); focusSoon('.rb-item'); } };
        const it = main.querySelector('.rb-items'); it.scrollTop = top; it.addEventListener('scroll', cue, { passive: true }); main.querySelector('.rb-more').onclick = () => { it.scrollBy({ top: it.clientHeight * 0.8, behavior: still ? 'auto' : 'smooth' }); };
        main.querySelector('.rb-bins')?.classList.toggle('aim', !!picked); cue();
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
        if (sh.keys()) (main.querySelector('.rb-item') || foot.querySelector('[data-go]'))?.focus();
      }
      // a tap chooses a thing; a tap on the thing already chosen keeps it chosen (so the next tap on a bin still works)
      const pick = (id) => { picked = id; main.querySelectorAll('.rb-item').forEach((b) => { const on = b.dataset.kind === picked; b.classList.toggle('picked', on); b.setAttribute('aria-pressed', on); }); main.querySelector('.rb-bins')?.classList.toggle('aim', !!picked); };
      const onClick = (e) => {
        if (noClick) { noClick = false; return; }
        const item = e.target.closest('.rb-item'); if (item) { pick(item.dataset.kind); return; }
        const bin = e.target.closest('.rb-bin'); if (bin) { if (picked) place(picked, bin.dataset.bin); else say(junior ? 'Tap a thing first, then its bin.' : 'Choose a thing first, then its bin.'); }
      };
      const onKey = (e) => { // 1–4: put the chosen (or focused) thing in that bin
        const n = Number(e.key); if (!(n >= 1 && n <= bins.length) || e.ctrlKey || e.metaKey || e.altKey) return;
        const id = picked || document.activeElement?.closest?.('.rb-item')?.dataset.kind; if (id) { e.preventDefault(); place(id, bins[n - 1].id); }
      };
      // Dragging: a copy of the picture follows the finger; letting go over a bin puts it in. By touch the shelf still
      // scrolls up and down: a drag starts on a sideways move, or after a short hold.
      const begin = (x, y) => { if (!drag || drag.on) return; drag.on = true; clearTimeout(drag.hold); ghost = document.createElement('div'); ghost.className = 'rb-ghost'; ghost.innerHTML = itemSvg(drag.id, 84); ghost.style.transform = `translate(${x - 42}px, ${y - 42}px)`; el.appendChild(ghost); main.querySelector('.rb-bins')?.classList.add('aim'); };
      const drop = () => { if (drag) clearTimeout(drag.hold); drag = null; };
      const onDown = (e) => {
        const item = e.target.closest('.rb-item'); if (!item || (e.pointerType === 'mouse' && e.button !== 0)) return; drop();
        drag = { id: item.dataset.kind, x: e.clientX, y: e.clientY, on: false, pid: e.pointerId, touch: e.pointerType === 'touch', hold: 0 };
        if (drag.touch) { const d = drag; d.hold = setTimeout(() => { if (drag === d) begin(d.x, d.y); }, 280); }
      };
      const onMove = (e) => {
        if (!drag || e.pointerId !== drag.pid) return; const dx = e.clientX - drag.x; const dy = e.clientY - drag.y;
        if (!drag.on && Math.hypot(dx, dy) > 10) { if (drag.touch && Math.abs(dy) > Math.abs(dx)) { drop(); return; } begin(e.clientX, e.clientY); } // up or down by touch: the shelf scrolls
        if (drag.on) { ghost.style.transform = `translate(${e.clientX - 42}px, ${e.clientY - 42}px)`; const over = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.rb-bin'); main.querySelectorAll('.rb-bin').forEach((b) => b.classList.toggle('over', b === over)); e.preventDefault(); }
      };
      const onTouch = (e) => { if (drag?.on && e.cancelable) e.preventDefault(); };
      const onUp = (e) => {
        if (!drag || e.pointerId !== drag.pid) return; const d = drag; drop(); if (!d.on) return;
        ghost?.remove(); ghost = null; noClick = true; setTimeout(() => { noClick = false; }, 60);
        main.querySelectorAll('.rb-bin').forEach((b) => b.classList.remove('over')); main.querySelector('.rb-bins')?.classList.toggle('aim', !!picked);
        const bin = e.type === 'pointerup' ? document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.rb-bin') : null; if (bin) place(d.id, bin.dataset.bin);
      };
      function cleanup() { drop(); main.removeEventListener('click', onClick); el.removeEventListener('keydown', onKey); main.removeEventListener('pointerdown', onDown); main.removeEventListener('touchmove', onTouch); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp); window.removeEventListener('resize', cue); ghost?.remove(); }
      main.addEventListener('click', onClick); el.addEventListener('keydown', onKey); main.addEventListener('pointerdown', onDown); main.addEventListener('touchmove', onTouch, { passive: false });
      window.addEventListener('pointermove', onMove, { passive: false }); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp); window.addEventListener('resize', cue);
      ctx.onLeave(cleanup); draw(); focusSoon('.rb-item');
    });
  }

  // ---------- a test: the robot sorts the tray. The first test is stepped through one thing at a time.
  // A later test (prev: the test before) runs by itself and stops only where something changed.
  function test(t, n, prev) {
    step(n === 1 ? 1 : 3); el.dataset.stage = 'test'; say(n === 1 ? SAY.test1(junior, t.of) : SAY.testAgain(junior));
    return wait((done) => {
      let i = -1; let running = false; let every = !prev; const fresh = guard();
      const changed = (k) => { const was = prev?.results[k]; const x = t.results[k]; return !!was && (was.ok !== x.ok || was.got !== x.got); };
      const speak = (k) => { const x = verdict(t.results[k]); ctx.say(`${kind(t.results[k].kind).name}. ${x.tag}. ${x.text}`); };
      function draw(quick = false) {
        const r = i >= 0 ? t.results[i] : null; const v = r ? verdict(r) : null; const right = t.results.slice(0, i + 1).filter((x) => x.ok).length; const atEnd = i >= t.of - 1;
        const tray = t.results.map((x, k) => { const vk = verdict(x); const ch = k <= i && changed(k) ? (x.ok ? '<em class="up">now right</em>' : '<em class="down">changed</em>') : '';
          return `<li data-kind="${x.kind}" class="${k < i ? `done ${vk.cls}` : k === i ? `now ${vk.cls}` : 'wait'}" aria-label="${esc(kind(x.kind).name)}${k <= i ? `: ${vk.tag}` : ''}">${itemSvg(x.kind, 40)}${k <= i ? `<b class="rb-mark ${vk.cls}">${MARK[vk.cls]}</b>` : ''}${ch}</li>`; }).join('');
        const like = !r ? '' : r.got !== null ? `<div class="rb-like"><small>Looks most like</small>${itemSvg(r.match, 60)}<b>${esc(kind(r.match).name)}</b>${chips(r.match, r.same)}<small class="rb-same">${esc(sameText(r.same))}</small></div>`
          : r.why === 'tie' ? `<div class="rb-like"><small>Cannot choose between</small><span class="rb-two">${r.rivals.map((x) => `<span>${itemSvg(x.kind, 48)}<b>${esc(kind(x.kind).name)}</b></span>`).join('')}</span></div>`
            : '<div class="rb-like"><small>Nothing it was shown matches this</small><span class="rb-q">?</span></div>';
        const where = !r ? '' : r.got !== null ? `<div class="rb-card rb-where ${v.cls}" style="--bin:${binById(r.got).colour}">${binSvg(binById(r.got).colour, 78)}<b>${esc(binById(r.got).name)}</b><span class="rb-tag ${v.cls}">${MARK[v.cls]} ${v.tag}</span></div>`
          : `<div class="rb-card rb-where ask"><span class="rb-q" aria-hidden="true">?</span><b>Asks a person</b><span class="rb-tag ask">? ${v.tag}</span></div>`;
        const nothing = prev && atEnd && !t.results.some((_, k) => changed(k));
        main.innerHTML = `<div class="rb-test"><div class="rb-panel rb-traybox"><h3>${junior ? 'Test tray' : 'Test set'}<small>${junior ? 'Kept apart. The robot has not been shown these.' : 'Held back from the examples, so the test is fair.'}</small></h3><ol class="rb-tray">${tray}</ol></div>
          ${r ? `<div class="rb-stagebox${quick ? ' quick' : ''}" data-i="${i}"><div class="rb-card rb-thing">${itemSvg(r.kind, 104)}<b>${esc(kind(r.kind).name)}</b>${chips(r.kind, r.same || [])}</div><span class="rb-arrow" aria-hidden="true">➜</span>
            <div class="rb-card rb-think">${robotSvg(r.got === null ? 'ask' : r.ok ? 'ok' : 'look', 110)}${like}</div><span class="rb-arrow" aria-hidden="true">➜</span>${where}</div>
            <p class="rb-verdict ${v.cls}"><b>${v.tag}.</b> ${esc(v.text)}${nothing ? ' <b>Nothing changed from the last test.</b>' : ''}</p>`
    : `<div class="rb-stagebox idle"><div class="rb-card rb-think">${robotSvg('idle', 150)}<div class="rb-like"><small>Ready</small><b>${t.of} things to sort</b></div></div></div>`}</div>`;
        const label = running ? 'Running…' : i < 0 ? (every ? 'Sort the first thing' : 'Run the test') : atEnd ? 'See the results' : every ? 'Next thing' : 'Carry on';
        foot.innerHTML = `<p class="rb-hint" aria-live="polite">${i >= 0 ? `In the right bin so far: <b>${right} of ${i + 1}</b>` : `${t.of} things on the tray`}</p>
          ${prev && !junior && !atEnd ? `<button type="button" class="rb-btn alt" data-every aria-pressed="${every}">${every ? '✓ ' : ''}Show every step</button>` : ''}<button type="button" class="rb-btn go" data-go ${running ? 'aria-disabled="true"' : ''}>${label} ➜</button>`;
        const go = foot.querySelector('[data-go]'); go.onclick = press; const ev = foot.querySelector('[data-every]'); if (ev) ev.onclick = () => { every = !every; if (!running) draw(); if (sh.keys()) foot.querySelector('[data-every]')?.focus(); };
        if (sh.keys()) go.focus();
      }
      // the run by itself: unchanged things go by quickly; it stops at the first thing that changed, or at the end
      function auto() {
        if (ctx.signal.aborted) return;
        if (i >= t.of - 1) { running = false; draw(); return; }
        i++;
        if (changed(i) || every) { running = false; draw(); speak(i); return; }
        if (still) { auto(); return; }
        draw(true); later(auto, 480);
      }
      function press() {
        if (running || !fresh()) return;
        if (i >= t.of - 1) { done(); return; }
        if (every) { i++; draw(); speak(i); return; }
        running = true; auto();
      }
      draw();
    });
  }

  // one line for each thing not sorted right: what the robot did, and the true reason, worked out from its examples
  function missList(t, ex, fs, canAdd) {
    const on = canAdd ? shelf(ex, 1, junior) : [];
    return t.results.filter((r) => !r.ok).map((r) => { const v = verdict(r); const a = did(r); const b = why(r, explain(r.kind, ex, fs, on), fs, junior, canAdd);
      return { say: `${kind(r.kind).name}. ${a} ${b}`, html: `<li>${itemSvg(r.kind, 56)}<div><b>${esc(kind(r.kind).name)}</b> <span class="rb-tag ${v.cls}">${MARK[v.cls]} ${v.tag}</span>${ctx.settings.readAloud ? `<button type="button" class="rb-spk" aria-label="Read this aloud: ${esc(kind(r.kind).name)}">🔊</button>` : ''}<p>${esc(a)}</p><p class="rb-why"><span aria-hidden="true">★</span> ${esc(b)}</p></div></li>` }; });
  }
  const wireSpeak = (list) => main.querySelectorAll('.rb-spk').forEach((b, i) => { b.onclick = () => ctx.say(list[i].say); });
  // which bin went where (ages 13–17)
  function confTable(t) {
    const c = confusion(t, junior);
    return `<table class="rb-conf"><caption>Where each bin’s things went</caption><thead><tr><th scope="col">Belongs in</th>${c.cols.map((id) => `<th scope="col">${SHORT[id]}</th>`).join('')}</tr></thead>
      <tbody>${c.rows.map((row) => `<tr><th scope="row" style="--bin:${binById(row.bin).colour}">${SHORT[row.bin]}</th>${row.cells.map((v, i) => `<td class="${!v ? 'zero' : c.cols[i] === row.bin ? 'hit' : 'off'}">${v || '·'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  const button = (sel) => wait((done) => { foot.querySelectorAll('[data-act]').forEach((b) => { b.onclick = () => done(b.dataset.act); }); focusSoon(sel); });

  // ---------- after the first test: what it missed, and why
  function review(t, ex) {
    step(2); el.dataset.stage = 'review'; const list = missList(t, ex, feats, true);
    line.textContent = SAY.review(junior, t.right, t.of); ctx.say(`${SAY.review(junior, t.right, t.of)}${list[0] ? ` ${list[0].say}` : ''}`); // the first reason is read aloud with Florence's line
    main.innerHTML = `<div class="rb-review"><div class="rb-left"><div class="rb-panel rb-score"><b>${t.right}</b><span>of ${t.of}</span><small>in the right bin</small>${robotSvg('look', 96)}</div>${junior ? '' : `<div class="rb-panel">${confTable(t)}</div>`}</div>
      <div class="rb-panel rb-missbox"><h3>Not sorted right yet, and why</h3><ul class="rb-misses">${list.map((x) => x.html).join('')}</ul></div></div>`;
    wireSpeak(list);
    foot.innerHTML = '<p class="rb-hint">The robot did its best with what it had been shown.</p><button type="button" class="rb-btn go" data-act="more">Add examples ➜</button>';
    return button('[data-act]');
  }
  // ---------- after a later test: before and after, and a choice.
  // tune (ages 13–17): { tray, off, onChange }: switch off something the robot looks at and see the score move.
  function result(tests, shown, ex, canMore, tune = null) {
    const a = tests[0]; const b = tests[tests.length - 1]; step(3); el.dataset.stage = 'result';
    say(`${SAY.result(junior, a.right, b.right, b.of)}${b.right === b.of ? ` ${SAY.resultFull(junior)}` : ''}${tune ? ` ${SAY.tune()}` : ''}`);
    const all = featuresFor(junior);
    function draw(focus = null) {
      const on = tune ? featsOn(junior, tune.off) : feats; const t = tune && tune.off.length ? runTest(tune.tray, ex, on) : b; const list = missList(t, ex, on, canMore);
      const tuneBox = !tune ? '' : `<div class="rb-panel rb-tune"><h3>What the robot looks at<small>Switch one off and watch the score.</small></h3>
        <div class="rb-feats">${all.map((f) => `<button type="button" class="rb-feat" data-feat="${f}" aria-pressed="${on.includes(f)}"><i aria-hidden="true">${on.includes(f) ? '✓' : ''}</i>${FEATURES[f].label}</button>`).join('')}</div>
        <p class="rb-tuneline ${t.right > b.right ? 'up' : t.right < b.right ? 'down' : ''}" aria-live="polite">${esc(tuneLine(on, tune.off, t.right, t.of, b.right))}</p>
        <p class="rb-tunenote">The robot goes out with the ones switched on.</p></div>`;
      main.innerHTML = `<div class="rb-review"><div class="rb-left"><div class="rb-panel rb-chart">${chartSvg({ tests, shown, street: null })}</div>${tuneBox}</div>
        <div class="rb-panel rb-missbox">${list.length ? `<h3>Still not sorted right${tune && tune.off.length ? `, with ${tune.off.map((f) => FEATURES[f].label.toLowerCase()).join(' and ')} off` : ''}</h3><ul class="rb-misses">${list.map((x) => x.html).join('')}</ul>` : `<h3>Every one in the right bin</h3><div class="rb-allok">${robotSvg('ok', 120)}<p>The robot now has ${ex.length} examples. Next it meets things it has never been shown, out in the street.</p></div>`}${tune ? confTable(t) : ''}</div></div>`;
      wireSpeak(list);
      main.querySelectorAll('.rb-feat').forEach((btn) => { btn.onclick = () => {
        const f = btn.dataset.feat; const i = tune.off.indexOf(f);
        if (i >= 0) tune.off.splice(i, 1); else if (tune.off.length < all.length - 1) tune.off.push(f); else { say('The robot must look at something. Leave at least one switched on.'); return; }
        tune.onChange?.(); const on2 = featsOn(junior, tune.off); const t2 = tune.off.length ? runTest(tune.tray, ex, on2) : b; say(tuneLine(on2, tune.off, t2.right, t2.of, b.right)); draw(f);
      }; });
      if (focus && sh.keys()) main.querySelector(`.rb-feat[data-feat="${focus}"]`)?.focus();
    }
    draw();
    foot.innerHTML = `<p class="rb-hint">${canMore ? 'Add more examples, or send the robot out.' : 'Time to send the robot out.'}</p>${canMore ? '<button type="button" class="rb-btn alt" data-act="more">Add more and test again</button>' : ''}<button type="button" class="rb-btn go" data-act="street">Send it to the street ➜</button>`;
    return button('[data-act="street"]');
  }

  // ---------- the street: the 3D view shows through; a caption card tells what the robot does with each thing.
  // play(r, done): start the robot on thing r; done() when it has finished. skip(): finish its move at once.
  function street(results, play, skip) {
    step(4); el.dataset.stage = 'street'; el.classList.add('out'); main.innerHTML = '';
    line.textContent = ''; el.querySelector('.rb-say').hidden = true;
    return wait((done) => {
      let i = -1; let busy = false; const fresh = guard();
      const draw = (text, r) => {
        const v = r ? verdict(r) : null;
        foot.innerHTML = `<div class="rb-cap">${r ? `<span class="rb-cappic">${itemSvg(r.kind, 72)}</span>` : `<span class="rb-flo">${florenceSvg(52)}</span>`}<div><p aria-live="polite">${r ? `<span class="rb-tag ${v.cls}">${MARK[v.cls]} ${v.tag}</span> ` : ''}${esc(text)}</p>${r ? `<small>Thing ${i + 1} of ${results.length}</small>` : ''}</div>
          <button type="button" class="rb-btn go" data-go>${i < 0 ? 'Start' : i < results.length - 1 ? 'Next' : i === results.length - 1 ? 'How did it do?' : 'Finish'} ➜</button></div>`;
        const go = foot.querySelector('[data-go]'); go.onclick = next; if (sh.keys()) go.focus();
      };
      function next() {
        if (!fresh()) return;
        if (busy) { skip?.(); return; }          // a second press while the robot is moving finishes its move at once
        if (i >= results.length) { done(); return; }
        i++;
        if (i === results.length) { const s = { right: results.filter((r) => r.ok).length, asked: results.filter((r) => r.got === null).length, of: results.length }; s.wrong = s.of - s.right - s.asked; const text = SAY.streetEnd(junior, s); draw(text, null); ctx.say(text); return; }
        const r = results[i]; const text = streetLine(r); busy = true; el.dataset.moving = '1'; draw(text, r); ctx.say(text);
        play(r, () => { busy = false; delete el.dataset.moving; });
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
  background: radial-gradient(circle at 12px 12px, #e6d4ad 2.2px, transparent 2.6px) 0 0 / 36px 36px, linear-gradient(#f8ecd2, #f1e0bd); overflow: hidden; }
§ .rb > * { position: relative; z-index: 1; }
§ .rb > .rb-bg { position: absolute; z-index: 0; left: 0; right: 0; bottom: 0; height: max(46%, 330px); pointer-events: none; }
§ .rb-bg svg { display: block; width: 100%; height: 100%; }
§ .rb.large { font-size: calc(var(--fs, 16px) * 1.12); }
§ .rb.out { background: none; pointer-events: none; grid-template-rows: auto 1fr auto; }
§ .rb.out > .rb-bg { display: none; }
§ .rb.out > * { pointer-events: auto; } § .rb.out .rb-main { pointer-events: none; }
§ .rb button { font: inherit; color: inherit; cursor: pointer; }
§ .rb button:focus-visible { outline: 3px solid #1f6fd0; outline-offset: 2px; }
§ .rb h3 { margin: 0 0 8px; font-size: 1.05em; font-weight: 800; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; }
§ .rb h3 small { font-weight: 600; font-size: .84em; color: #5e4936; }
§ .rb-head { padding-left: 14em; min-height: 46px; display: flex; align-items: center; pointer-events: none; }
§ .rb-steps { pointer-events: auto; list-style: none; margin: 0; padding: 4px; display: flex; flex-wrap: nowrap; width: max-content; max-width: 100%; gap: 4px; background: #fffaf0; border-radius: 14px; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-steps li { display: flex; align-items: center; gap: 6px; padding: 4px 12px 4px 5px; border-radius: 10px; font-size: .86em; color: #5e4936; white-space: nowrap; }
§ .rb-steps li i { font-style: normal; width: 1.7em; height: 1.7em; border-radius: 50%; display: grid; place-items: center; background: #eadcbd; font-weight: 800; }
§ .rb-steps li.on { background: #1f7a44; color: #fff; } § .rb-steps li.on i { background: #fff; color: #1f7a44; }
§ .rb-steps li.done i { background: #bfe3cb; color: #1f7a44; }
§ .rb-say { display: flex; align-items: center; gap: 10px; background: #fffaf0; border-radius: 16px; padding: 8px 14px; box-shadow: inset 0 0 0 2px #d7bf95, 0 3px 0 #c9ae80; min-height: 60px; }
§ .rb-say[hidden] { display: none; }
§ .rb-say p { margin: 0; font-size: 1.04em; font-weight: 700; } § .rb-flo { flex: none; display: grid; }
§ .rb-main { min-height: 0; overflow: auto; }
§ .rb[data-stage="teach"] .rb-main { overflow: hidden; }
§ .rb-main.more { -webkit-mask-image: linear-gradient(#000 calc(100% - 46px), transparent); mask-image: linear-gradient(#000 calc(100% - 46px), transparent); }
§ .rb-panel, § .rb-card { background: #fffaf0; border-radius: 16px; padding: 10px 12px; box-shadow: inset 0 0 0 2px #d7bf95, 0 3px 0 #c9ae80; }
§ .rb-foot { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; min-height: 54px; }
§ .rb-hint { margin: 0 auto 0 0; padding: 6px 12px; border-radius: 12px; background: #fffaf0; font-weight: 700; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-btn { min-height: 50px; padding: 8px 20px; border: 0; border-radius: 14px; font-weight: 800 !important; font-size: 1.05em !important; background: #fff; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
§ .rb-btn.go { background: #1f7a44; color: #fff !important; box-shadow: inset 0 -4px 0 #17603a, 0 3px 0 #0f4a2b; }
§ .rb-btn:disabled { background: #e9e0cc; color: #6f5f4c !important; box-shadow: inset 0 0 0 2px #cdbb99; cursor: default; }
§ .rb-btn[aria-disabled="true"] { background: #5d8f72; cursor: default; }
§ .rb-btn[aria-pressed="true"] { background: #e3f4e9; box-shadow: inset 0 0 0 3px #1f7a44, 0 4px 0 #17603a; }
§ .rb-teach { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 12px; height: 100%; align-items: start; }
§ .rb-shelf { position: relative; display: flex; flex-direction: column; min-height: 0; max-height: 100%; }
§ .rb-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 8px; overflow-y: auto; min-height: 0; padding: 3px 3px 6px; overscroll-behavior: contain; }
§ .rb.junior .rb-items { grid-template-columns: repeat(auto-fill, minmax(136px, 1fr)); }
§ .rb .rb-items.small { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 7px; }
§ .rb-item { position: relative; display: grid; justify-items: center; align-content: start; gap: 2px; padding: 8px 6px; border: 0; border-radius: 14px; background: #fff; box-shadow: inset 0 0 0 2px #d7bf95, 0 3px 0 #c9ae80; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
§ .rb-item .rb-pic { width: clamp(46px, 8.4vh, 72px); height: clamp(46px, 8.4vh, 72px); pointer-events: none; }
§ .rb.junior .rb-item .rb-pic { width: clamp(52px, 11vh, 96px); height: clamp(52px, 11vh, 96px); }
§ .rb .rb-items.small .rb-item { padding: 6px 4px; } § .rb .rb-items.small .rb-item .rb-pic { width: clamp(40px, 6.6vh, 58px); height: clamp(40px, 6.6vh, 58px); }
§ .rb-item b { font-size: .92em; font-weight: 800; text-align: center; line-height: 1.15; }
§ .rb-item.picked { background: #e3f4e9; box-shadow: inset 0 0 0 4px #1f7a44, 0 3px 0 #17603a; }
§ .rb-item.starred { box-shadow: inset 0 0 0 3px #e0a21c, 0 3px 0 #b98312; background: #fff7dc; }
§ .rb-item.starred.picked { box-shadow: inset 0 0 0 4px #1f7a44, 0 3px 0 #17603a; }
§ .rb-items.full .rb-item { background: #efe8d8; color: #6f5f4c; }
§ .rb-star { position: absolute; top: 2px; right: 6px; font-style: normal; font-size: 1.3em; color: #a86f00; }
§ .rb-more { position: absolute; left: 50%; bottom: 8px; transform: translateX(-50%); min-height: 36px; padding: 4px 16px; border: 0; border-radius: 999px; background: #243447; color: #fff !important; font-weight: 800 !important; font-size: .9em !important; box-shadow: 0 3px 0 rgba(36, 52, 71, .35), 0 0 0 3px #fffaf0; }
§ .rb-more[hidden] { display: none; }
§ .rb-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 3px; }
§ .rb-chips i { font-style: normal; font-size: .82em; font-weight: 700; padding: 1px 7px; border-radius: 999px; background: #efe3c8; color: #3b2a1e; white-space: nowrap; }
§ .rb.large .rb-items .rb-chips i { font-size: .76em; padding: 1px 6px; }
§ .rb-chips i.same { background: #1f7a44; color: #fff; }
§ .rb-empty { margin: 8px; }
§ .rb-side { display: grid; gap: 10px; max-height: 100%; overflow-y: auto; padding-bottom: 5px; }
§ .rb-robotbox { display: flex; align-items: center; gap: 12px; justify-content: center; }
§ .rb-note { margin: 0; padding: 8px 12px; border-radius: 14px; background: #243447; color: #fff; font-size: .9em; font-weight: 700; }
§ .rb-bins { display: grid; gap: 8px; }
§ .rb-bin { position: relative; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto 1fr; column-gap: 10px; align-items: center; text-align: left; padding: 8px 12px; border: 0; border-radius: 16px; background: #fffaf0; box-shadow: inset 0 0 0 3px var(--bin), 0 4px 0 var(--bin); min-height: 78px; }
§ .rb-bin > svg { grid-row: 1 / 3; } § .rb-bin > b { font-weight: 800; font-size: 1.05em; }
§ .rb-bin kbd { position: absolute; top: 6px; right: 8px; font: 800 .78em Inter, system-ui, sans-serif; width: 1.7em; height: 1.7em; display: grid; place-items: center; border-radius: 7px; background: #efe3c8; color: #4a3828; }
§ .rb-in { display: flex; flex-wrap: wrap; gap: 3px; min-height: 36px; align-items: center; } § .rb-in small { color: #5e4936; font-weight: 600; }
§ .rb-in span { display: grid; border-radius: 9px; background: #f3e9d2; padding: 1px; } § .rb-in span.new { background: #cfeed9; box-shadow: inset 0 0 0 2px #1f7a44; }
§ .rb-bins.aim .rb-bin { background: #fff; box-shadow: inset 0 0 0 4px var(--bin), 0 4px 0 var(--bin), 0 0 0 4px #ffe08a; }
§ .rb-bin.over { background: #e3f4e9 !important; }
§ .rb-ghost { position: fixed; left: 0; top: 0; z-index: 9; pointer-events: none; filter: drop-shadow(0 6px 0 rgba(60, 40, 20, .25)); }
§ .rb-test { display: grid; gap: 10px; }
§ .rb-tray { list-style: none; margin: 0; padding: 6px 0 0; display: flex; flex-wrap: wrap; gap: 6px 8px; }
§ .rb-tray li { position: relative; display: grid; place-items: center; width: 56px; height: 56px; border-radius: 12px; background: #f3e9d2; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-tray li.now { background: #fff; box-shadow: inset 0 0 0 4px #1f6fd0; }
§ .rb-tray li.done.ok { background: #dff3e6; } § .rb-tray li.done.miss { background: #fde6cf; } § .rb-tray li.done.ask { background: #fff1c2; }
§ .rb-mark { position: absolute; right: -4px; bottom: -4px; width: 1.5em; height: 1.5em; border-radius: 50%; display: grid; place-items: center; font-size: .82em; font-weight: 800; color: #fff; background: #1f7a44; box-shadow: 0 0 0 2px #fffaf0; }
§ .rb-mark.miss { background: #b3501f; } § .rb-mark.ask { background: #8a6200; }
§ .rb-tray em { position: absolute; left: 50%; top: -10px; transform: translateX(-50%); font-style: normal; font-size: .7em; font-weight: 800; padding: 0 6px; border-radius: 999px; background: #1f7a44; color: #fff; white-space: nowrap; box-shadow: 0 0 0 2px #fffaf0; }
§ .rb-tray em.down { background: #b3501f; }
§ .rb-stagebox { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.5fr) auto minmax(0, 1fr); gap: 8px; align-items: stretch; min-height: min(36vh, 300px); }
§ .rb-stagebox.idle { grid-template-columns: minmax(0, 1fr); justify-items: center; } § .rb-stagebox.idle .rb-think { padding: 16px 40px; }
§ .rb-card { display: grid; justify-items: center; align-content: center; gap: 4px; text-align: center; } § .rb-card > b { font-weight: 800; font-size: 1.1em; }
§ .rb-thing .rb-pic { width: clamp(96px, 17vh, 150px); height: clamp(96px, 17vh, 150px); }
§ .rb-where > svg { width: clamp(78px, 13vh, 116px); height: clamp(78px, 13vh, 116px); }
§ .rb-think { grid-template-columns: auto 1fr; align-items: center; }
§ .rb-think .rb-robot { height: clamp(110px, 20vh, 170px); width: auto; }
§ .rb-like { display: grid; justify-items: center; gap: 3px; padding: 8px 10px; border-radius: 14px; background: #eef4fb; box-shadow: inset 0 0 0 2px #c4d6ea; }
§ .rb-like small { font-weight: 800; color: #2b3a55; } § .rb-like .rb-same { color: #1f7a44; }
§ .rb-two { display: flex; gap: 12px; } § .rb-two span { display: grid; justify-items: center; font-size: .86em; }
§ .rb-q { font-size: 2.6em; font-weight: 800; color: #8a6200; line-height: 1; }
§ .rb-arrow { align-self: center; font-size: 1.6em; color: #7a5a33; }
§ .rb-where { box-shadow: inset 0 0 0 3px var(--bin, #c9a13a), 0 3px 0 var(--bin, #c9a13a); }
§ .rb-tag { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: .84em; font-weight: 800; color: #fff; background: #1f7a44; white-space: nowrap; }
§ .rb-tag.miss { background: #b3501f; } § .rb-tag.ask { background: #8a6200; }
§ .rb-verdict { margin: 0; padding: 10px 14px; border-radius: 14px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d7bf95; font-size: 1.04em; }
§ .rb-verdict.ok { box-shadow: inset 0 0 0 3px #1f7a44; } § .rb-verdict.miss { box-shadow: inset 0 0 0 3px #b3501f; } § .rb-verdict.ask { box-shadow: inset 0 0 0 3px #c9a13a; }
§ .rb-review { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(0, 2.2fr); gap: 12px; align-items: start; padding-bottom: 5px; }
§ .rb.senior .rb-review { grid-template-columns: minmax(300px, 1fr) minmax(0, 1.9fr); }
§ .rb-left { display: grid; gap: 10px; min-width: 0; }
§ .rb-score { display: grid; justify-items: center; text-align: center; } § .rb-score > b { font-size: 4.2em; line-height: 1; font-weight: 800; color: #1f7a44; } § .rb-score > span { font-size: 1.5em; font-weight: 800; } § .rb-score small { color: #5e4936; margin-bottom: 8px; }
§ .rb.senior .rb-score { grid-template-columns: auto auto auto; align-items: center; justify-content: center; column-gap: 10px; } § .rb.senior .rb-score small { margin: 0; grid-column: 2; grid-row: 2; } § .rb.senior .rb-score > b { grid-row: 1 / 3; } § .rb.senior .rb-score .rb-robot { grid-row: 1 / 3; grid-column: 3; height: 76px; width: auto; }
§ .rb-chart svg { display: block; width: 100%; height: auto; max-height: min(40vh, 300px); }
§ .rb.senior .rb-chart svg { max-height: min(27vh, 220px); }
§ .rb-misses { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
§ .rb-misses li { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 12px; background: #fff; box-shadow: inset 0 0 0 2px #e6d3b0; }
§ .rb-misses p { margin: 3px 0 0; font-size: .96em; } § .rb-why { font-weight: 800; color: #5c3f00; } § .rb-why span { color: #a86f00; }
§ .rb-spk { float: right; min-width: 44px; min-height: 44px; margin: -4px -4px 0 6px; border: 0; border-radius: 12px; background: #f3e9d2; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-allok { display: flex; align-items: center; gap: 14px; } § .rb-allok p { margin: 0; font-size: 1.05em; }
§ .rb-conf { width: 100%; border-collapse: separate; border-spacing: 3px; font-size: .9em; text-align: center; }
§ .rb-missbox .rb-conf { margin-top: 10px; max-width: 460px; }
§ .rb-conf caption { font-weight: 800; text-align: left; padding: 0 2px 4px; font-size: 1.08em; }
§ .rb-conf th { font-weight: 800; padding: 3px 4px; color: #4a3828; } § .rb-conf thead th { font-size: .9em; }
§ .rb-conf tbody th { text-align: left; border-left: 6px solid var(--bin); padding-left: 8px; background: #f6edd8; border-radius: 6px; }
§ .rb-conf td { padding: 4px; border-radius: 8px; background: #f6edd8; font-weight: 800; min-width: 2.2em; }
§ .rb-conf td.hit { background: #cfeed9; color: #17603a; } § .rb-conf td.off { background: #fde0c8; color: #8f3a10; } § .rb-conf td.zero { color: #a08c6c; }
§ .rb-feats { display: flex; flex-wrap: wrap; gap: 8px; }
§ .rb-feat { display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 6px 14px 6px 8px; border: 0; border-radius: 12px; background: #efe8d8; color: #5e4936 !important; font-weight: 800 !important; box-shadow: inset 0 0 0 2px #cdbb99, 0 3px 0 #cdbb99; text-decoration: line-through; }
§ .rb-feat i { font-style: normal; width: 1.6em; height: 1.6em; border-radius: 7px; display: grid; place-items: center; background: #fff; box-shadow: inset 0 0 0 2px #b08a55; color: #fff; }
§ .rb-feat[aria-pressed="true"] { background: #e3f4e9; color: #17603a !important; box-shadow: inset 0 0 0 3px #1f7a44, 0 3px 0 #17603a; text-decoration: none; } § .rb-feat[aria-pressed="true"] i { background: #1f7a44; box-shadow: none; }
§ .rb-tuneline { margin: 10px 0 0; padding: 6px 10px; border-radius: 10px; background: #f6edd8; font-weight: 800; } § .rb-tuneline.up { background: #cfeed9; color: #17603a; } § .rb-tuneline.down { background: #fde0c8; color: #8f3a10; }
§ .rb-tunenote { margin: 2px 0 0; font-size: .88em; color: #5e4936; }
§ .rb-cap { margin: 0 auto; width: min(860px, 100%); display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; background: #fffaf0; border-radius: 18px; padding: 10px 14px; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
§ .rb-cap p { margin: 0; font-size: 1.04em; font-weight: 700; } § .rb-cap small { color: #5e4936; } § .rb-cappic { display: grid; background: #f3e9d2; border-radius: 12px; padding: 2px; }
§ .rb.out .rb-foot { display: block; }
@keyframes rb-in { from { transform: translateY(10px); opacity: .2; } to { transform: none; opacity: 1; } }
@keyframes rb-no { 0%, 100% { transform: none; } 30% { transform: translateX(-6px); } 70% { transform: translateX(6px); } }
§ .rb:not(.still) .rb-stagebox:not(.quick) > * { animation: rb-in .3s ease-out both; } § .rb:not(.still) .rb-stagebox:not(.quick) > :nth-child(n+3) { animation-delay: .35s; } § .rb:not(.still) .rb-stagebox:not(.quick) > :nth-child(n+5) { animation-delay: .7s; }
§ .rb:not(.still) .rb-item.no { animation: rb-no .3s; }
@media (max-width: 1100px) { § .rb.senior .rb-review { grid-template-columns: minmax(280px, 1fr) minmax(0, 1.5fr); } § .rb-robotbox .rb-robot { height: 84px; width: auto; } }
@media (max-width: 820px) {
  § .rb { padding: 8px; } § .rb-steps li b { display: none; } § .rb-steps li.on b { display: inline; }
  § .rb-teach { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; } § .rb-robotbox { display: none; } § .rb-side { overflow: visible; }
  § .rb-review, § .rb.senior .rb-review { grid-template-columns: minmax(0, 1fr); }
  § .rb-bins { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  § .rb-stagebox { grid-template-columns: minmax(0, 1fr); min-height: 0; } § .rb-arrow { display: none; } § .rb-thing .rb-pic { width: 84px; height: 84px; } § .rb-think .rb-robot { height: 100px; }
  § .rb-chart svg, § .rb.senior .rb-chart svg { max-height: 24vh; } § .rb-score { grid-template-columns: auto auto auto; align-items: center; justify-content: center; column-gap: 10px; } § .rb-score .rb-robot { height: 70px; width: auto; }
  § .rb-cap { grid-template-columns: auto 1fr; } § .rb-cap .rb-btn { grid-column: 1 / 3; }
  § .rb-foot:has(.rb-btn ~ .rb-btn) .rb-hint { flex: 1 0 100%; margin: 0; }
}
@media (max-height: 640px) { § .rb-say { min-height: 0; padding: 4px 10px; } § .rb-flo svg { width: 32px; height: 32px; } }
`.replace(/§/g, M);
