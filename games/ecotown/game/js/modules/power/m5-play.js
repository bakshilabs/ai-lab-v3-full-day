// Mission 5 on the page: move flexible jobs into the hours with spare clean power. The rounds, layout and words:
// m5-demand.js.
import { DEMAND_ROUNDS, SLOTS, JOBS, BLOCK_KW, slotClock, startPlan, layout, solve, inWindow, DEM, jobName, jobNeed, jobSize, slotWord, slotShort, refuseSay, runSay, demDay, demNote } from './m5-demand.js';
import { esc } from './shell.js';

export async function playDemand(d) {
  const { j, pick, ctl } = d; let moved = 0, kwh = 0;
  for (let r = 0; r < DEMAND_ROUNDS.length; r++) {
    const round = DEMAND_ROUNDS[r]; const plan = startPlan(round); const habit = { ...plan }; const ids = round.jobs.map(([id]) => id);
    let sel = ids[0]; let tries = 0; let star = null; const best = solve(round);
    d.mode('desk', 'jobs'); d.report(`Smart demand: day ${r + 1} of 3`);
    const showSlot = (s) => { const c = slotClock(s); d.view.setHour(c + 1, r === 2); d.view.setLit(d.allLit(), true); d.plate(pick(DEM.round[round.id]).replace(/^Day \d of 3: /, ''), slotWord(s, j)); };
    const drawJobs = (f) => {
      const l = layout(round, plan);
      d.side.innerHTML = `<h3>${esc(demDay(round.id, j))}</h3><p class="pw-note">${esc(demNote(round.id, j))}</p><div class="pw-jobs" role="group" aria-label="${j ? 'Jobs to move' : 'Flexible jobs'}">${ids.map((id) => { const x = l.perJob[id]; const st = x.gas === 0 ? 'clean' : x.clean === 0 ? 'gas' : 'part';
        return `<button type="button" data-job="${id}" aria-pressed="${id === sel}" class="${st}"><i aria-hidden="true">${JOBS[id].icon}</i><span><b>${esc(jobName(id, j))}</b><small>${esc(jobNeed(id, j))}</small>${j ? '' : `<small>${esc(jobSize(id, j))}</small>`}</span><em>${esc(slotWord(plan[id], j))}<br>${st === 'clean' ? (j ? '✓ clean' : '✓ renewable') : st === 'gas' ? (j ? '✗ gas' : '✗ gas') : (j ? '½ gas' : 'part gas')}</em></button>`; }).join('')}</div>`;
      if (f) d.focusFirst(f);
    };
    const drawChart = (f) => {
      const l = layout(round, plan); const J = JOBS[sel];
      const cols = l.slots.map((slot) => {
        const n = Math.max(slot.spare, slot.jobs.length, 1); let cells = '';
        for (let k = 0; k < n; k++) { const job = slot.jobs[k]; if (job) cells += `<i class="${job.clean ? 'clean' : 'gas'} ${job.id === sel ? 'sel' : ''}" title="${esc(jobName(job.id, j))}">${JOBS[job.id].icon}</i>`; else if (k < slot.spare) cells += '<i class="spare"></i>'; }
        const okHere = inWindow(sel, Math.min(slot.s, SLOTS - J.len));
        return `<button type="button" data-slot="${slot.s}" class="${okHere ? '' : 'out'} ${plan[sel] <= slot.s && slot.s < plan[sel] + J.len ? 'here' : ''}" aria-label="${esc(`${slotWord(slot.s, j)}: ${slot.spare} spare${slot.jobs.length ? `, ${slot.jobs.length} in use` : ''}${okHere ? '' : j ? ', not a time this job can run' : ', outside the window'}`)}"><span class="pw-col">${cells}</span>${star === slot.s ? '<em class="pw-star" aria-hidden="true">★</em>' : ''}<b>${esc(slotShort(slot.s, j))}</b></button>`;
      }).join('');
      d.screen.innerHTML = `<h3>${j ? 'Spare clean power, and the jobs' : 'Surplus renewables by slot, and flexible demand'}<small>${j ? 'two hours a column' : `2 h per column · 1 square = ${BLOCK_KW} kW`}</small></h3><div class="pw-slots" role="group" aria-label="${j ? 'Times of day' : 'Time slots'}">${cols}</div>
        <div class="pw-blocks"><span><i class="spare"></i>${j ? 'spare wind and sun' : 'unused surplus'}</span><span><i class="clean"></i>${j ? 'job on clean power' : 'met by renewables'}</span><span><i class="gas"></i>${j ? 'job on gas' : 'met by gas'}</span></div>`;
      if (f) d.focusFirst(f);
    };
    const drawCtl = () => {
      const l = layout(round, plan);
      ctl.innerHTML = `<p class="pw-sum">${j ? `${l.clean} of ${l.total} squares on clean power` : `Renewables ${l.clean * BLOCK_KW * 2} kWh · gas ${l.gas * BLOCK_KW * 2} kWh`}</p><button class="go" type="button" data-act="run">${pick(DEM.check)}</button><button type="button" data-reset>${j ? 'Back to the usual times' : 'Reset'}</button>`;
    };
    const all = (f) => { drawJobs(); drawChart(); drawCtl(); if (f) d.focusFirst(f); };
    d.say(pick(DEM.how), `${demDay(round.id, j)}. ${demNote(round.id, j)}`);
    all(`[data-job="${sel}"]`); showSlot(plan[sel]);
    const move = (s) => {
      const J = JOBS[sel]; const start = Math.max(0, Math.min(SLOTS - J.len, s));
      if (!inWindow(sel, start)) { d.say(refuseSay(sel, j)); return false; }
      plan[sel] = start; star = null; d.ctx.engine.audio?.tap?.(); showSlot(start);
      const x = layout(round, plan).perJob[sel]; d.ctx.say(`${jobName(sel, j)}: ${slotWord(start, j)}. ${x.gas === 0 ? (j ? 'Clean power.' : 'Renewable.') : (j ? 'Some from gas.' : 'Partly gas.')}`);
      return true;
    };
    d.setTap((b) => {
      if (b.dataset.job) { sel = b.dataset.job; drawJobs(); drawChart(`[data-slot="${plan[sel]}"]`); showSlot(plan[sel]); d.ctx.say(`${jobName(sel, j)}. ${jobNeed(sel, j)}`); }
      else if (b.dataset.slot !== undefined) { const s = Number(b.dataset.slot); if (move(s)) all(`[data-slot="${plan[sel]}"]`); }
      else if ('reset' in b.dataset) { Object.assign(plan, habit); star = null; all(`[data-job="${sel}"]`); }
    });
    d.setKey((e) => {
      const a = document.activeElement; const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return false;
      if (a?.dataset?.slot !== undefined) { const n = (Number(a.dataset.slot) + k + SLOTS) % SLOTS; d.focusFirst(`[data-slot="${n}"]`); return true; }
      if (a?.dataset?.job) { sel = a.dataset.job; const s = plan[sel] + k; if (move(s)) all(`[data-job="${sel}"]`); return true; }
      return false;
    });
    for (;;) {
      const a = await d.press(); if (a !== 'run') continue;
      const l = layout(round, plan);
      if (!l.done) { tries++; if (tries >= 3 && best) { const bad = ids.find((id) => l.perJob[id].gas > 0 || !l.perJob[id].ok) || ids[0]; sel = bad; star = best[bad]; } }
      d.say(runSay(l, tries, j)); all(l.done ? '[data-act]' : `[data-job="${sel}"]`);
      if (l.done) break;
    }
    d.setTap(null); d.setKey(null);
    const n = ids.filter((id) => plan[id] !== habit[id]).length; moved += n; kwh += ids.reduce((x, id) => x + JOBS[id].p * JOBS[id].len * BLOCK_KW * 2, 0);
    const last = r === DEMAND_ROUNDS.length - 1;
    ctl.innerHTML = `<p class="pw-sum ok">✓ ${j ? 'Every job on clean power' : 'All flexible demand on renewables'}</p><button class="go" type="button" data-act="next">${last ? 'Finish the mission ➜' : 'Next day ➜'}</button>`; d.focusFirst('[data-act]');
    await d.press();
  }
  return { moved, kwh };
}
