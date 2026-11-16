// Mission 3 on the page: the town battery run by hand, hour by hour, through three days that get harder.
// The model: model.js (stepHour, runModes). The rounds, goals and hints: m3-storage.js.
import { MODES, HOURS, forecast, stepHour, runModes } from './model.js';
import { T, handAsk, handAskStep, HINT, handSummary, dayScore } from './words.js';
import { STORE_ROUNDS, storeGoal, storeMet, storeHint, storeGoalLine, storeDayLine } from './m3-storage.js';
import { esc, SEED } from './shell.js';

const HOUR_MS = 2400; // one hour of the hand-run day

// One day by hand. Resolves with the 24 modes chosen. guide: Florence's choice for each hour, marked on the buttons.
function handDay(d, round, guide) {
  const { kit, j, pick, reduce, ctl, prog, view } = d; const dayId = round.day; const fc = forecast(dayId, SEED); const winter = dayId === 'winter';
  const hours = []; const modes = []; let i = 0, level = kit.cap * round.start, mode = 'hold', frac = 0, paused = false; const said = {};
  d.say(reduce ? handAskStep(j) : handAsk(j), storeDayLine(round, j));
  const btns = () => MODES.map((m, n) => `<button type="button" data-mode="${m}" aria-pressed="${m === mode}" aria-keyshortcuts="${n + 1}"><i aria-hidden="true">${T.modeIcon[m]}</i><span>${esc(pick(T.mode[m]))}</span><u aria-hidden="true">✓</u><small>${esc(pick(T.modeHint[m]))}</small>${guide ? `<em class="pw-guide" hidden>★ ${j ? 'Florence' : 'Plan'}</em>` : ''}</button>`).join('');
  ctl.innerHTML = `<div class="pw-modes" role="group" aria-label="Battery">${btns()}</div>
    <div class="pw-row">${reduce ? `<button class="go" type="button" data-hour>${pick(T.nextHour)}</button>` : `<button type="button" data-pause>${T.pause}</button>`}</div>`;
  prog.hidden = reduce;
  const head = () => `<h3>${esc(pick(T.day[dayId]))}<small>${esc(pick(T.dayNote[dayId]))}</small></h3>`;
  const draw = () => { d.screen.innerHTML = `${head()}${d.chart(dayId, { hours, cursor: i })}${d.keyRow()}<p class="pw-goal">${esc(storeGoalLine(round.goal, j))}</p>`; };
  const markGuide = () => { if (!guide) return; ctl.querySelectorAll('[data-mode]').forEach((b) => { const g = b.querySelector('.pw-guide'); if (g) g.hidden = b.dataset.mode !== guide[i]; }); };
  let trouble = false; let touched = false; // the first instruction stays up until the child has chosen something or an hour has gone by
  const hint = (h) => {
    if (i === 0 && !touched) return; let id = null;
    if (h.dark > 0 && mode === 'charge' && h.toBattery > 0.01) id = 'robbed';
    else if ((h.dark > 0 || !h.schoolLit) && mode !== 'use' && h.levelBefore > kit.cap * 0.05) id = 'short';
    else if (mode === 'use' && h.need > h.made + 0.05 && h.levelBefore <= kit.cap * 0.02) id = 'empty';
    else if (h.made - h.need > Math.max(1, kit.peak * 0.12) && mode !== 'charge' && h.levelBefore < kit.cap - 0.5) id = 'spare';
    else if (mode === 'charge' && h.levelBefore >= kit.cap - 0.01) id = 'full';
    else if (h.clock === (winter ? 15 : 17)) id = 'dusk';
    if (id && !said[id]) { said[id] = 1; trouble = ['short', 'robbed', 'empty'].includes(id); d.say(pick(HINT[id])); }
    else if (trouble && h.dark === 0 && h.schoolLit) { trouble = false; d.say(pick(HINT.back)); }
  };
  const preview = () => { const h = stepHour(kit, fc[i], level, mode, { winter }); d.showHour(h, dayId, reduce ? 0 : Math.min(frac, 0.99)); hint(h); return h; };
  return new Promise((res) => {
    const commit = () => {
      const h = stepHour(kit, fc[i], level, mode, { winter }); h.rule = -1; hours.push(h); modes.push(mode); level = h.level; i++; frac = 0;
      if (i >= HOURS) { d.setTick(null); d.setTap(null); d.setKey(null); prog.hidden = true; res(modes); return; }
      draw(); markGuide(); preview();
    };
    const setMode = (m) => { if (!MODES.includes(m) || m === mode) return; mode = m; touched = true; ctl.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode))); d.ctx.engine.audio?.tap?.(); preview(); };
    d.setTap((b) => {
      if (b.dataset.mode) setMode(b.dataset.mode);
      else if ('hour' in b.dataset) commit();
      else if ('pause' in b.dataset) { paused = !paused; b.textContent = paused ? T.resume : T.pause; b.classList.toggle('go', paused); }
    });
    d.setKey((e) => { const n = ['1', '2', '3'].indexOf(e.key); if (n < 0) return false; setMode(MODES[n]); return true; });
    d.setTick(reduce ? null : (dt) => { if (paused) return; frac += (dt * 1000) / HOUR_MS; prog.firstElementChild.style.width = `${Math.min(100, frac * 100).toFixed(0)}%`; if (frac >= 1) commit(); else view.setHour(fc[i].clock + frac, winter); });
    draw(); markGuide(); preview(); d.focusFirst(reduce ? '[data-hour]' : `[data-mode="${mode}"]`);
  });
}

// The whole mission. st: the module's state (st.hand is kept for mission 4). Resolves with { dark: [3], total }.
export async function playStorage(d, st, save) {
  const { kit, j, pick } = d; const out = { dark: [], total: kit.homes.length * HOURS };
  for (let r = 0; r < STORE_ROUNDS.length; r++) {
    const round = { ...STORE_ROUNDS[r], goal: storeGoal(kit, STORE_ROUNDS[r], SEED) };
    let tries = 0;
    for (;;) {
      d.report(`Storage: day ${r + 1} of 3${tries ? `, try ${tries + 1}` : ''}`); d.useDials();
      const modes = await handDay(d, round, tries >= 3 ? round.goal.plan : null);
      const day = runModes(kit, round.day, modes, { seed: SEED, startLevel: round.start }); const met = storeMet(day, round.goal);
      if (r === 0) { st.hand = modes; save(); } // the first day is the one mission 4 compares the rules with
      const lines = handSummary(kit, day, j); const at = day.worst >= 0 ? day.hours[day.worst] : day.hours[15]; d.showHour(at, round.day);
      tries = met ? tries : tries + 1;
      const verdict = met ? (j ? (day.darkHours ? `Goal met: the dark squares add up to ${day.darkHours}.` : 'Goal met: every home stayed lit.') : `Goal met: ${day.darkHours} home-hours unsupplied.`) : storeHint(tries, day, round.goal, j);
      d.screen.innerHTML = `<h3>${esc(pick(T.day[round.day]))}: ${esc(pick(T.byHand).toLowerCase())}<small>${esc(dayScore(day, j))}</small></h3>${d.chart(round.day, { hours: day.hours, cursor: at.i, mark: day.worst })}
        <ul class="pw-lines">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}<li class="note">${esc(storeGoalLine(round.goal, j))}</li><li class="${met ? 'ok' : 'fix'}">${met ? '✓ ' : ''}${esc(verdict)}</li></ul>`;
      d.say(met ? (j ? 'You met the goal for this day.' : 'Goal met for this day.') : (j ? 'Not the goal yet.' : 'Goal not met yet.'), verdict);
      const last = r === STORE_ROUNDS.length - 1;
      d.ctl.innerHTML = met ? `<button class="go" type="button" data-act="next">${last ? (j ? 'Finish the mission ➜' : 'Finish the mission ➜') : (j ? 'Next day ➜' : 'Next day ➜')}</button><button type="button" data-act="again">${pick(T.again)}</button>`
        : `<button class="go" type="button" data-act="again">${j ? 'Try this day again' : 'Run the day again'}</button>`;
      d.focusFirst('[data-act]');
      const a = await d.press();
      if (a === 'next') { out.dark[r] = day.darkHours; break; }
    }
  }
  return out;
}
