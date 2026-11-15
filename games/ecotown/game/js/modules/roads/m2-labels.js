// Mission 2, "Teaching the car to recognise things": find and label everything in street pictures, train the car,
// test it on pictures it has never seen, then label the hard cases (edge cases) and test again.
// Rules and words: labels.js. Pictures: art.js.
import { LABELS, LABEL, CASES, EASY, HARD, test, missWhat, caseName, reviewSay, M2 } from './labels.js';
import { cameraView, boxOf, svg, W, H } from './art.js';
import { esc } from './kit.js';

const TEST_THING = { person: { kind: 'person', colour: '#7a4fb0' }, cyclist: { kind: 'cyclist', colour: '#2f6fd8' }, dog: { kind: 'dog' }, car: { kind: 'car', colour: '#1f7f49' }, hidden: { kind: 'person', colour: '#c8553d' }, chair: { kind: 'chair', colour: '#b23a26' }, child: { kind: 'child', colour: '#2f6fd8' }, mirror: { kind: 'mirror' }, poster: { kind: 'poster' } };

export async function labelsMission(K) {
  const { j, pick, say, swap, tray, stage } = K; const done = []; let pics = 0, hardFound = 0;
  const name = (l) => pick(LABEL[l].name);

  async function label(pic, n, of, hard) {
    K.ctx.report({ stage: `Mission 2: labelling picture ${n} of ${of}` });
    const found = new Set(), labels = {}; let sel = null, misses = 0;
    const order = [...pic.things].sort((a, b) => { const A = boxOf(a), B = boxOf(b); return B.w * B.h - A.w * A.h; });   // small boxes on top, so a half-hidden person can be tapped
    const draw = () => {
      const base = cameraView(pic.things, pic.cond);
      const hot = order.map((t, i) => { const b = boxOf(t); const on = found.has(t.id); const L = labels[t.id];
        return `<g class="rd-hot${on ? ' on' : ''}${sel === t.id ? ' sel' : ''}" data-thing="${t.id}" tabindex="0" role="button" aria-label="${on ? `Box ${i + 1}: ${L ? name(L) : 'no label yet'}` : 'Something here?'}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="6"/>${on && L ? `<text x="${b.x + 4}" y="${Math.max(18, b.y - 6)}" font-size="18" font-weight="800">${LABEL[L].icon} ${esc(name(L))}</text>` : ''}</g>`; }).join('');
      stage.querySelector('.rd-frame').innerHTML = svg(base + `<rect class="rd-miss" width="${W}" height="${H}" fill="transparent"/>` + hot, `Street picture ${n}. Find and label everything.`);
      for (const b of tray.querySelectorAll('[data-label]')) { b.disabled = !sel; b.setAttribute('aria-pressed', String(!!sel && labels[sel] === b.dataset.label)); }
      tray.querySelector('.rd-count').textContent = `${j ? 'Boxes' : 'Labelled'}: ${Object.keys(labels).length}`;
    };
    K.showStage(`<div class="rd-view"><div class="rd-viewbar"><b>${hard ? (j ? 'Hard pictures' : 'Edge cases') : (j ? 'Everyday pictures' : 'Everyday scenes')}</b><span class="rd-step">${n} of ${of}</span></div><div class="rd-frame"></div></div>`);
    swap(`<div class="rd-row rd-labels" role="group" aria-label="Labels">${LABELS.map((l) => `<button type="button" data-label="${l}" disabled aria-pressed="false"><span class="ico" aria-hidden="true">${LABEL[l].icon}</span> ${esc(name(l))}</button>`).join('')}</div>
      <div class="rd-row end"><span class="rd-count"></span><p class="rd-hint" aria-live="polite"></p><button class="go" type="button" data-primary data-act="done">${j ? 'Done ➜' : 'Done ➜'}</button></div>`);
    const hint = tray.querySelector('.rd-hint');
    draw();
    const tapThing = (id) => { if (!found.has(id)) { found.add(id); } sel = id; hint.textContent = j ? 'Now choose its label.' : 'Choose a label.'; draw(); stage.querySelector(`[data-thing="${id}"]`)?.focus?.({ preventScroll: true }); };
    K.onKey = (e) => { const id = document.activeElement?.dataset?.thing; if (id && (e.key === 'Enter' || e.key === ' ')) { tapThing(id); return true; } return false; };
    await new Promise((res) => {
      const on = (e) => {
        if (K.tooSoon(e)) return; const hot = e.target.closest?.('[data-thing]');
        if (hot) { tapThing(hot.dataset.thing); return; }
        if (e.target.closest?.('.rd-miss')) { hint.textContent = j ? 'Nothing to label there.' : 'Nothing there to label.'; return; }
        const b = e.target.closest('button'); if (!b || b.disabled) return;
        if (b.dataset.label && sel) { labels[sel] = b.dataset.label; hint.textContent = `${name(b.dataset.label)}.`; draw(); return; }
        if (b.dataset.act === 'done') {
          const r = reviewSay(pic, found, labels, misses + 1, j);
          if (r.ok) { stage.onclick = tray.onclick = null; res(); return; }
          misses++; hint.textContent = r.text; K.ctx.say(r.text);
          if (r.reveal) { found.add(r.reveal); sel = r.reveal; }
          if (r.select) sel = r.select;
          if (r.fix) labels[r.select] = r.fix;
          draw();
        }
      };
      stage.onclick = on; tray.onclick = on;
    });
    K.onKey = null; pics++;
    for (const t of pic.things) { done.push({ case: t.case, label: labels[t.id] }); if (CASES[t.case].hard) hardFound++; }
    say(misses ? (j ? 'All labelled. Well checked.' : 'All objects labelled correctly.') : (j ? 'All labelled, first time!' : 'Every object labelled correctly, first time.'));
  }

  // the test: one small picture for each case, with what the car did
  async function showTest(res, line, more) {
    K.ctx.report({ stage: `Mission 2: testing the car (${res.right} of ${res.of})` });
    const card = (r) => { const t = { ...TEST_THING[r.case], x: 0, z: 7 }; const pic = r.case === 'hidden' ? cameraView([{ kind: 'van', x: -0.6, z: 6.5 }, { ...t, x: 0.7, z: 7.2 }], 'sun') : cameraView([t], 'sun');
      return `<li class="${r.ok ? 'ok' : 'no'}">${svg(pic, caseName(r.case, j))}<b>${r.ok ? '✓' : '✗'} ${esc(caseName(r.case, j).replace(/^./, (c) => c.toUpperCase()))}</b><small>${r.ok ? (j ? 'Recognised.' : 'Correct.') : esc(missWhat(r.case, j))}</small></li>`; };
    K.showStage(`<div class="rd-card wide"><h3>${j ? `The car’s test: ${res.right} of ${res.of} right` : `Test on unseen pictures: ${res.right}/${res.of} (${Math.round((100 * res.right) / res.of)}%)`}</h3><ul class="rd-tests">${res.rows.map(card).join('')}</ul></div>`);
    say(line);
    swap(`<div class="rd-row end"><button class="go" type="button" data-primary data-act="next">${more ? (j ? 'Label the hard ones ➜' : 'Label the edge cases ➜') : 'Next ➜'}</button></div>`);
    await K.press();
  }

  say(pick(M2.find));
  for (let i = 0; i < EASY.length; i++) await label(EASY[i], i + 1, EASY.length, false);
  say(pick(M2.train1));
  K.showStage(`<div class="rd-card"><h3>${j ? 'Teaching the car' : 'Training'}</h3><p class="rd-job">${j ? `The car learns from your ${done.length} labels.` : `Training on ${done.length} labelled objects.`}</p></div>`);
  swap(`<div class="rd-row end"><button class="go" type="button" data-primary data-act="train">${j ? 'Teach and test the car ➜' : 'Train and test ➜'}</button></div>`); await K.press();
  const a = test(done); await showTest(a, M2.test1(a, j), true);
  say(pick(M2.hard));
  for (let i = 0; i < HARD.length; i++) await label(HARD[i], i + 1, HARD.length, true);
  K.showStage(`<div class="rd-card"><h3>${j ? 'Teaching the car again' : 'Retraining'}</h3><p class="rd-job">${j ? `Now ${done.length} labels, with the hard ones.` : `${done.length} labelled objects, edge cases included.`}</p></div>`);
  say(j ? 'Let’s teach the car again and test it on the same pictures.' : 'Retrain and run the same test.');
  swap(`<div class="rd-row end"><button class="go" type="button" data-primary data-act="train">${j ? 'Teach and test again ➜' : 'Retrain and test ➜'}</button></div>`); await K.press();
  const b = test(done); await showTest(b, M2.test2(a, b, j), false);
  return { labels: done.length, pics, hard: hardFound, a: a.right, b: b.right };
}
