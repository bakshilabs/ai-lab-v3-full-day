// Robots at work: the screens around the missions. The mission map (six missions, in order, a tick when done, a way
// to carry on and to replay), the opening card of a mission (the real job and how to play) and its closing card
// (what the child can now do). Page only; the words are in missions.js and record.js.
import { MISSIONS, pick, open, nextMission, allDone, doneCount } from './missions.js';
import { missionLine } from './record.js';
import { esc } from './shell.js';

// The map. prog: from missions.js cleanProgress. Resolves with { go: n } or { finish: true }.
export function showMap(ctx, sh, prog) {
  const j = sh.junior; const next = nextMission(prog.done); const all = allDone(prog.done); const cur = prog.cur?.n || null;
  sh.setup({ stage: 'map' });
  const n = doneCount(prog.done);
  const hello = all ? (j ? 'All six missions done. Press Finish to see your robot record, or play any mission again.' : 'All six missions are done. Finish to see your record, or replay any mission.')
    : n === 0 ? (j ? 'Robots do many jobs. Here are six. Each one teaches a real robot skill. Start with mission 1.' : 'Six real jobs robots do, each with its own skill. They open in order. Start with mission 1.')
      : cur ? (j ? `Welcome back. Carry on with mission ${cur}.` : `Carry on with mission ${cur}.`) : (j ? `${n} done. Next is mission ${next}.` : `${n} of 6 done. Mission ${next} is next.`);
  sh.say(hello);
  const card = (m) => {
    const i = m.n - 1; const done = !!prog.done[i]; const can = open(prog.done, m.n); const now = !all && m.n === (cur || next);
    const state = done ? '<em class="rb-tick">✓ Done</em>' : now ? `<em class="rb-now">${cur === m.n ? 'Carry on' : 'Next'}</em>` : can ? '' : `<em class="rb-lock">🔒 After mission ${m.n - 1}</em>`;
    const sumLine = done && prog.sum[m.n] ? `<small class="rb-did">${esc(missionLine(m.n, prog.sum[m.n], j))}</small>` : `<small>${esc(pick(m.skill, j))}</small>`;
    return `<button type="button" class="rb-mcard${done ? ' done' : ''}${now ? ' now' : ''}" data-n="${m.n}" ${can ? '' : 'disabled aria-disabled="true"'} aria-label="Mission ${m.n}: ${esc(m.use)}. ${done ? 'Done. Play again.' : now ? 'Next.' : can ? '' : `Opens after mission ${m.n - 1}.`}">
      <span class="rb-mnum">${m.n}</span><span class="rb-mico" aria-hidden="true">${m.icon}</span><b>${esc(m.use)}</b>${sumLine}${state}${done ? '<span class="rb-again">↻ Play again</span>' : ''}</button>`;
  };
  sh.main.innerHTML = `<div class="rb-map"><div class="rb-maphead"><h2>${j ? 'Robots at work' : 'Robots at work'}</h2><p>${j ? 'Six jobs. Six robot skills.' : 'Six jobs robots do, six real skills.'} <b>${n} of 6 done</b></p>
    <div class="rb-progress" role="progressbar" aria-label="Missions done" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${n}"><i style="width:${(n / 6) * 100}%"></i></div></div>
    <div class="rb-mgrid">${MISSIONS.map(card).join('')}</div></div>`;
  return sh.wait((done) => {
    const fresh = sh.guard();
    sh.main.querySelectorAll('.rb-mcard:not([disabled])').forEach((b) => { b.onclick = () => { if (fresh()) done({ go: +b.dataset.n }); }; });
    const list = all ? [{ act: 'finish', label: j ? 'Finish: see my record' : 'Finish the hour', go: true }] : [{ act: 'go', label: `${cur ? 'Carry on' : 'Start'}: mission ${cur || next}`, go: true }];
    sh.buttons(all ? (j ? 'You can play any mission again first.' : 'Any mission can be replayed first.') : '', list).then((a) => done(a === 'finish' ? { finish: true } : { go: cur || next }));
    sh.focusSoon('.rb-mcard.now');
  });
}

// The opening card. Resolves 'start' or 'map'.
export function showBrief(ctx, sh, m, again = false) {
  const j = sh.junior; const how = pick(m.how, j);
  sh.setup({ mission: m, stage: 'brief' });
  sh.line.textContent = j ? `Mission ${m.n}: ${m.use}. Read the job, then press Start.` : `Mission ${m.n}: ${m.use}. Read the brief, then Start.`; ctx.say(`Mission ${m.n}. ${m.use}. ${pick(m.job, j)} ${how.join(' ')}`);
  sh.main.innerHTML = `<div class="rb-brief rb-panel"><div class="rb-bico" aria-hidden="true">${m.icon}</div><div><p class="rb-kicker">Mission ${m.n} of 6${again ? ' · playing again' : ''}</p><h2>${esc(m.use)}</h2>
    <p class="rb-job">${esc(pick(m.job, j))}</p><h3>How to play</h3><ol class="rb-how">${how.map((h) => `<li>${esc(h)}</li>`).join('')}</ol></div></div>`;
  return sh.buttons('', [{ act: 'map', label: 'Back to the missions' }, { act: 'start', label: 'Start', go: true }]);
}

// The closing card. sum: what the child did. Resolves 'next' | 'map'.
export function showDone(ctx, sh, m, sum, prog) {
  const j = sh.junior; const next = nextMission(prog.done); const all = allDone(prog.done);
  sh.setup({ mission: m, stage: 'done' });
  const can = pick(m.can, j); const did = missionLine(m.n, sum, j);
  sh.line.textContent = `Mission ${m.n} done.`; ctx.say(`Mission ${m.n} done. ${did} ${can}`);
  sh.main.innerHTML = `<div class="rb-brief rb-panel done"><div class="rb-bico" aria-hidden="true">${m.icon}</div><div><p class="rb-kicker">✓ Mission ${m.n} done</p><h2>${esc(m.use)}</h2>
    <p class="rb-job">${esc(did)}</p><p class="rb-can"><b>${esc(can)}</b></p></div></div>`;
  const list = [{ act: 'map', label: 'Back to the missions', go: all || !next }];
  if (!all && next) list.push({ act: 'next', label: `Next: mission ${next}`, go: true });
  return sh.buttons(j ? 'Your work is saved.' : 'Saved.', list);
}
