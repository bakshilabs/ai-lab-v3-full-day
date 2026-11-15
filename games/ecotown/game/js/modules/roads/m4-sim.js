// Mission 4, "Testing in simulation": run the car's test days, open a failure to watch its replay, change one
// setting, run again. Each stage adds a harder test day. Rules and words: simtest.js.
import { SETTINGS, SET, START, DAY, STAGES, RUNS, MAX_STOPS, REPLAY, runAll, changed, runSay, M4 } from './simtest.js';
import { esc } from './kit.js';

export async function simMission(K) {
  const { j, pick, say, swap, tray, stage } = K;
  let cfg = { ...START }, last = { ...START }, prev = null, runs = 0, stageN = 0; const log = [];
  const table = (res) => `<table class="rd-table rd-tests4"><caption>${j ? `Test days: ${RUNS} drives each` : `Results per ${RUNS} simulated drives`}</caption>
    <thead><tr><th scope="col">${j ? 'Test day' : 'Scenario'}</th><th scope="col">${j ? 'Near misses' : 'Near misses'}</th><th scope="col">${j ? 'Needless stops' : `Needless stops (max ${MAX_STOPS})`}</th>${j ? '' : '<th scope="col">Trip</th>'}<th scope="col">${j ? 'Result' : 'Result'}</th></tr></thead>
    <tbody>${res.map((r) => { const p = prev?.find((x) => x.id === r.id); return `<tr class="${r.pass ? 'ok' : 'no'}"><th scope="row"><span aria-hidden="true">${DAY[r.id].icon}</span> ${esc(pick(DAY[r.id].name))}</th><td>${r.near}${p && p.near !== r.near ? ` <i>(was ${p.near})</i>` : ''}</td><td>${r.stops}${p && p.stops !== r.stops ? ` <i>(was ${p.stops})</i>` : ''}</td>${j ? '' : `<td>${r.mins} min</td>`}<td>${r.pass ? '✓ Pass' : `<button type="button" data-replay="${r.id}">✗ ${j ? 'Fail: watch replay' : 'Fail: replay'}</button>`}</td></tr>`; }).join('')}</tbody></table>`;
  const logHtml = () => (log.length ? `<ol class="rd-log" aria-label="Test log">${log.slice(-4).map((l) => `<li>${esc(l)}</li>`).join('')}</ol>` : '');
  let res = null;
  const showRes = (note = '') => K.showStage(`<div class="rd-card wide">${res ? table(res) : `<p class="rd-job">${j ? 'No test run yet.' : 'No runs yet.'}</p>`}<p class="rd-replay" aria-live="polite">${esc(note)}</p>${logHtml()}</div>`);
  const controls = () => {
    const ch = changed(last, cfg);
    return `<div class="rd-sets">${SETTINGS.map((k) => { const lock = runs && ch.length && !ch.includes(k); return `<div class="rd-set" role="radiogroup" aria-label="${esc(pick(SET[k].name))}"><b>${esc(pick(SET[k].name))}</b>${SET[k].opts.map((o) => `<button type="button" role="radio" data-set="${k}" data-v="${o}" aria-checked="${String(cfg[k]) === String(o)}" ${lock ? 'disabled' : ''}>${esc(SET[k].label(o, j))}${runs && String(last[k]) === String(o) && ch.includes(k) ? ' <i>(before)</i>' : ''}</button>`).join('')}</div>`; }).join('')}</div>
      <div class="rd-row end"><p class="rd-hint" aria-live="polite">${runs && ch.length ? esc(pick(M4.locked)) : ''}</p><button class="go" type="button" data-primary data-act="run">▶ ${runs ? (j ? 'Run the tests again' : 'Run again') : (j ? 'Run the tests' : 'Run the tests')}</button></div>`;
  };
  say(pick(M4.start), pick(M4.rule)); showRes();
  for (;;) {
    K.ctx.report({ stage: `Mission 4: test stage ${stageN + 1} of ${STAGES.length}, run ${runs + 1}` });
    swap(controls());
    // choose settings (one change at a time), open replays, then run
    await new Promise((done) => {
      const on = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled || K.tooSoon(e)) return;
        if (b.dataset.set) { const k = b.dataset.set; cfg = { ...cfg, [k]: SET[k].opts.find((o) => String(o) === b.dataset.v) }; const had = K.kbd || tray.contains(document.activeElement); tray.innerHTML = controls(); if (had) tray.querySelector(`[data-set="${k}"][data-v="${b.dataset.v}"]`)?.focus(); K.measure(); return; }
        if (b.dataset.replay) { const r = res.find((x) => x.id === b.dataset.replay); const note = r.why.map((w) => pick(REPLAY[w])).join(' '); stage.querySelector('.rd-replay').textContent = `${pick(DAY[r.id].name)}: ${note}`; K.ctx.say(note); return; }
        if (b.dataset.act === 'run') { tray.onclick = stage.onclick = null; done(); }
      };
      tray.onclick = on; stage.onclick = on;
    });
    const ch = runs ? changed(last, cfg) : []; const was = last; prev = res; res = runAll(STAGES[stageN], cfg); runs++;
    if (ch.length) log.push(`${j ? 'Run' : 'Run'} ${runs}: ${pick(SET[ch[0]].name)} → ${SET[ch[0]].label(cfg[ch[0]], j)}. ${res.filter((r) => !r.pass).length ? `${res.filter((r) => !r.pass).length} ${j ? 'failing' : 'failing'}` : (j ? 'all pass' : 'all pass')}`);
    else log.push(`Run ${runs}: ${runs === 1 ? (j ? 'factory settings' : 'factory settings') : (j ? 'no change' : 'no change')}. ${res.filter((r) => !r.pass).length} ${j ? 'failing' : 'failing'}`);
    last = { ...cfg };
    const line = runSay(res, prev && prev.length === res.length ? prev : null, ch, cfg, was, j);
    showRes(); say(line);
    // a passing stage adds the next test day (which may pass at once, if an earlier change already covers it)
    while (res.every((r) => r.pass) && stageN < STAGES.length - 1) {
      stageN++; const added = STAGES[stageN][STAGES[stageN].length - 1];
      swap(`<div class="rd-row end"><p class="rd-hint">${esc(M4.next(added, j))}</p><button class="go" type="button" data-primary data-act="next">${j ? 'Add the new test ➜' : 'Add the test ➜'}</button></div>`);
      await K.press(); prev = null; res = runAll(STAGES[stageN], cfg); runs++; log.push(`Run ${runs}: ${j ? 'new test' : 'new test'}: ${pick(DAY[added].name)}. ${res.filter((r) => !r.pass).length} ${j ? 'failing' : 'failing'}`); showRes(); say(runSay(res, null, [], cfg, last, j));
    }
    if (res.every((r) => r.pass)) break;
  }
  say(pick(M4.done));
  swap(`<div class="rd-row end"><button class="go" type="button" data-primary data-act="next">Next ➜</button></div>`); await K.press();
  return { runs, cfg };
}
