// Power control room: the mission map, and the card before and after each mission.
import { MISSIONS, isOpen, nextMission, doneCount, allDone, pick as pk } from './missions.js';
import { esc } from './shell.js';

// The map: six missions in order, each with its icon, its real use and a tick when done. Resolves with a mission's
// index, or 'finish' once all six are done.
export async function missionMap(d, p) {
  const { j, full } = d; d.mode('full'); d.idle(11); d.label(j ? 'Power control room' : 'Power control room'); d.plate(j ? 'Control room' : 'Control room', `${doneCount(p.done)} of 6`);
  const n = nextMission(p.done); const all = allDone(p.done);
  d.report(all ? 'Mission map: all six done' : `Mission map: ${doneCount(p.done)} of 6 done`);
  full.innerHTML = `<div class="pw-maphead"><h2>${j ? 'Six missions in the control room' : 'Six control-room missions'}</h2><p>${all ? (j ? 'All six done. Play any mission again, or finish.' : 'All six complete. Replay any, or finish.') : `${doneCount(p.done)} of 6 ${j ? 'done' : 'complete'}`}</p></div>
    <ol class="pw-map">${MISSIONS.map((m, i) => { const done = p.done[i]; const open = isOpen(p.done, i); const next = i === n;
      return `<li><button type="button" data-m="${i}" class="${done ? 'done' : ''} ${next ? 'next' : ''}" ${open ? '' : 'disabled'} aria-label="${esc(`Mission ${i + 1}: ${pk(m.use, j)}. ${done ? 'Done. Play again' : next ? 'Next' : open ? 'Open' : `Opens after mission ${i}`}`)}">
        <span class="pw-mnum">${i + 1}</span><i aria-hidden="true">${m.icon}</i><b>${esc(pk(m.use, j))}</b><small>${esc(pk(m.can, j).replace(/^You can /, '').replace(/^./, (c) => c.toUpperCase()))}</small>
        <em>${done ? '✓ Done · play again' : next ? '▶ Next' : open ? '▶ Open' : `🔒 After mission ${i}`}</em></button></li>`; }).join('')}</ol>
    <div class="pw-row end">${all ? `<button class="go" type="button" data-act="finish">${j ? 'Finish the hour ➜' : 'Finish ➜'}</button>` : `<button class="go" type="button" data-act="m${n}">${doneCount(p.done) ? 'Carry on' : (j ? 'Start' : 'Start')}: ${j ? 'mission' : 'mission'} ${n + 1} ➜</button>`}</div>`;
  d.say(all ? (j ? 'All six missions are done. You can play any of them again, or finish.' : 'All six missions are complete. Replay any of them, or finish.')
    : n === 0 ? (j ? 'Welcome to the control room. From here you keep the lights on in your town. There are six missions, one after another.' : 'Welcome to the control room. Six missions, each a real part of running a town’s power.')
      : (j ? `Welcome back. Next is mission ${n + 1}: ${pk(MISSIONS[n].use, j)}.` : `Next: mission ${n + 1}, ${pk(MISSIONS[n].use, j)}.`));
  return new Promise((res) => {
    d.setTap((b) => { if (b.dataset.m !== undefined) { d.setTap(null); res(Number(b.dataset.m)); } });
    d.press().then((a) => { d.setTap(null); res(a === 'finish' ? 'finish' : Number(a.slice(1))); });
    d.focusFirst(all ? '[data-act="finish"]' : '[data-act]');
  });
}
// Before a mission: the real job in one line, then how to play. Resolves 'start' or 'map'.
export async function briefing(d, i) {
  const { j, full } = d; const m = MISSIONS[i]; d.mode('full'); d.label(pk(m.use, j)); d.report(`Mission ${i + 1}: ${pk(m.use, j)}`);
  full.innerHTML = `<div class="pw-brief"><i aria-hidden="true">${m.icon}</i><div><p class="pw-kicker">${j ? 'Mission' : 'Mission'} ${i + 1} of 6</p><h2>${esc(pk(m.use, j))}</h2>
    <p class="pw-job"><b>${j ? 'The real job:' : 'In real life:'}</b> ${esc(pk(m.job, j))}</p><p class="pw-howto"><b>${j ? 'What to do:' : 'Your task:'}</b> ${esc(pk(m.how, j))}</p>
    <div class="pw-row"><button class="go" type="button" data-act="start">${j ? 'Start ➜' : 'Start ➜'}</button><button type="button" data-act="map">${j ? '← Missions' : '← Missions'}</button></div></div></div>`;
  d.say(pk(m.job, j), pk(m.how, j)); d.focusFirst('[data-act="start"]');
  return d.press();
}
// After a mission: what the child can now do, and what they did. Resolves 'next', 'map' or 'finish'.
export async function debrief(d, i, lines, p) {
  const { j, full } = d; const m = MISSIONS[i]; d.mode('full'); d.idle(12); const all = allDone(p.done); const n = nextMission(p.done);
  full.innerHTML = `<div class="pw-brief done"><i aria-hidden="true">${m.icon}</i><div><p class="pw-kicker">✓ ${j ? 'Mission' : 'Mission'} ${i + 1} ${j ? 'done' : 'complete'}</p><h2>${esc(pk(m.can, j))}</h2>
    <ul class="pw-lines">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    <div class="pw-row">${all ? `<button class="go" type="button" data-act="finish">${j ? 'Finish the hour ➜' : 'Finish ➜'}</button>` : `<button class="go" type="button" data-act="next">${j ? 'Next mission' : 'Next mission'}: ${esc(pk(MISSIONS[n].use, j))} ➜</button>`}<button type="button" data-act="map">${j ? 'Mission map' : 'Mission map'}</button></div></div></div>`;
  d.say(`${j ? 'Mission done.' : 'Mission complete.'} ${pk(m.can, j)}`, lines.join(' '), true); d.focusFirst('[data-act]');
  return d.press();
}
