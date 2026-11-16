// Mission 1, "How a self-driving car sees": switch between the camera, radar and lidar views of the same street in
// sun, rain, fog and dark; tick every sensor that can answer the question; then choose the car's sensors and read
// which jobs are covered in which weather. Rules and words: sensors.js. Pictures: art.js.
import { SENSORS, SENSOR, COND, CONDS, roundsFor, JOBS, JOB, sees, check, missSay, cover, kitSay, M1 } from './sensors.js';
import { cameraView, radarView, lidarView, svg } from './art.js';
import { esc } from './kit.js';

export async function sensorsMission(K) {
  const { j, pick, say, swap, tray, stage } = K; let first = 0; const ROUNDS = roundsFor(j);
  // the views of one round. view: which sensor is shown.
  const picture = (r, view) => {
    const things = [...r.things, r.target]; const seen = (t) => sees(view, t, r.cond);
    const inner = view === 'camera' ? cameraView(things, r.cond, seen) : view === 'radar' ? radarView(things, r.cond, seen, !j) : lidarView(things, r.cond, seen);
    return svg(inner, `${SENSOR[view].name} view, ${COND[r.cond].name.toLowerCase()}`);
  };
  for (let i = 0; i < ROUNDS.length; i++) {
    const r = ROUNDS[i]; let view = 'camera', misses = 0; const looked = new Set(['camera']); const picked = new Set();
    K.ctx.report({ stage: `Mission 1: sensor view ${i + 1} of ${ROUNDS.length}` });
    K.showStage(`<div class="rd-view"><div class="rd-viewbar"><span class="rd-cond" aria-label="Weather: ${COND[r.cond].name}"><span aria-hidden="true">${COND[r.cond].icon}</span> ${COND[r.cond].name}</span>
        <div class="rd-tabs" role="group" aria-label="Sensor views">${SENSORS.map((s, n) => `<button type="button" data-view="${s}" aria-pressed="${s === view}"><span class="rd-key" aria-hidden="true">${n + 1}</span><span class="ico" aria-hidden="true">${SENSOR[s].icon}</span> ${SENSOR[s].name}</button>`).join('')}</div>
        <span class="rd-step">${i + 1} of ${ROUNDS.length}</span></div>
      <div class="rd-frame">${picture(r, view)}</div><p class="rd-does"></p></div>`);
    const frame = stage.querySelector('.rd-frame'), does = stage.querySelector('.rd-does');
    const show = (v) => { view = v; looked.add(v); frame.innerHTML = picture(r, v); does.textContent = `${SENSOR[v].name}: ${pick(SENSOR[v].does)}`; for (const b of stage.querySelectorAll('[data-view]')) b.setAttribute('aria-pressed', String(b.dataset.view === v)); };
    show('camera');
    say(pick(r.q), i === 0 ? pick(M1.intro) : '');
    swap(`<div class="rd-row rd-ticks" role="group" aria-label="Which sensors?">${SENSORS.map((s) => `<button type="button" data-tick="${s}" aria-pressed="false"><span class="box" aria-hidden="true"></span><span class="ico" aria-hidden="true">${SENSOR[s].icon}</span> ${SENSOR[s].name}</button>`).join('')}
      <p class="rd-hint" aria-live="polite"></p><button class="go" type="button" data-primary data-act="check" disabled>Check</button></div>`);
    const hint = tray.querySelector('.rd-hint'); const checkBtn = tray.querySelector('[data-act="check"]');
    const draw = () => { for (const b of tray.querySelectorAll('[data-tick]')) b.setAttribute('aria-pressed', String(picked.has(b.dataset.tick))); checkBtn.disabled = !picked.size; };
    K.onKey = (e) => { const d = '123'.indexOf(e.key); if (d >= 0 && e.key.length === 1) { show(SENSORS[d]); return true; } return false; };
    await new Promise((done) => {
      const on = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled || K.tooSoon(e)) return;
        if (b.dataset.view) { show(b.dataset.view); return; }
        if (b.dataset.tick) { const s = b.dataset.tick; if (picked.has(s)) picked.delete(s); else picked.add(s); hint.textContent = ''; draw(); return; }
        if (b.dataset.act === 'check') {
          const res = check(r, [...picked]);
          if (res.right) { if (!misses) first++; tray.onclick = stage.onclick = null; done(); return; }
          misses++; const line = missSay(r, res, Math.min(3, misses), j);
          // the first time, a child who has not looked at every view is sent to look (that is the skill), without a miss being shown
          if (misses === 1 && looked.size < 3) hint.textContent = `${line} ${j ? 'Have you looked at all three views?' : 'Check all three views.'}`; else hint.textContent = line;
          K.ctx.say(hint.textContent);
          if (misses >= 3) { picked.clear(); for (const s of res.want) picked.add(s); draw(); }
        }
      };
      tray.onclick = on; stage.onclick = on;
    });
    K.onKey = null;
    say(`${misses ? (j ? 'That’s it.' : 'That’s right.') : pick(M1.right)} ${pick(r.why)}`);
    swap(`<div class="rd-row end"><p class="rd-hint">${misses ? (j ? 'Got there.' : 'Solved.') : (j ? 'Right first time!' : 'Right first time.')}</p><button class="go" type="button" data-primary data-act="next">Next ➜</button></div>`);
    await K.press();
  }

  // ---- choose the car's sensors
  K.ctx.report({ stage: 'Mission 1: choosing the car’s sensors' });
  const kit = new Set();
  const table = () => { const c = cover([...kit]); return `<table class="rd-table"><caption>${j ? 'What our car can do' : 'Coverage: ✓ the car can do this'}</caption><thead><tr><th scope="col"></th>${CONDS.map((cd) => `<th scope="col"><span aria-hidden="true">${COND[cd].icon}</span> ${COND[cd].name}</th>`).join('')}</tr></thead><tbody>${c.rows.map((row) => `<tr><th scope="row">${esc(pick(JOB[row.job]))}</th>${row.by.map((ok) => `<td class="${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'}<span class="sr">${ok ? ' yes' : ' no'}</span></td>`).join('')}</tr>`).join('')}</tbody></table>${j ? '' : `<p class="rd-does">Gaps: ${c.gaps} of ${JOBS.length * CONDS.length}</p>`}`; };
  K.showStage(`<div class="rd-card wide">${table()}</div>`);
  say(pick(M1.kitAsk));
  swap(`<div class="rd-row rd-ticks" role="group" aria-label="The car's sensors">${SENSORS.map((s) => `<button type="button" data-tick="${s}" aria-pressed="false"><span class="box" aria-hidden="true"></span><span class="ico" aria-hidden="true">${SENSOR[s].icon}</span> ${SENSOR[s].name}</button>`).join('')}
    <p class="rd-hint" aria-live="polite"></p><button class="go" type="button" data-primary data-act="fit" disabled>${j ? 'Fit these ➜' : 'Fit these sensors ➜'}</button></div>`);
  const hint = tray.querySelector('.rd-hint');
  await new Promise((done) => { tray.onclick = (e) => {
    const b = e.target.closest('button'); if (!b || b.disabled || K.tooSoon(e)) return;
    if (b.dataset.tick) { const s = b.dataset.tick; if (kit.has(s)) kit.delete(s); else kit.add(s); for (const t of tray.querySelectorAll('[data-tick]')) t.setAttribute('aria-pressed', String(kit.has(t.dataset.tick))); stage.querySelector('.rd-card').innerHTML = table(); hint.textContent = kitSay(SENSORS.filter((x) => kit.has(x)), j); K.ctx.say(hint.textContent); tray.querySelector('[data-act="fit"]').disabled = !kit.size; return; }
    if (b.dataset.act === 'fit') { tray.onclick = null; done(); }
  }; });
  const chosen = SENSORS.filter((x) => kit.has(x));
  return { first, rounds: ROUNDS.length, kit: chosen, gaps: cover(chosen).gaps };
}
