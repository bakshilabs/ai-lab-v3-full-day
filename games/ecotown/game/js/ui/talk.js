// The end of every part (docs/full-day-plan.md): a discussion section led by the teacher, then a break screen.
// Nothing is typed and nothing is sent. Used by the module loader and by Eco Town's session finish.
import { esc } from './ui.js';
import { TALK, nextPart } from '../series.js';
import { HUB } from '../version.js';

// "Talk it over": the part's questions, large, for the teacher to read out with screens down.
export async function talkItOver(ui, id, junior) {
  const qs = TALK[id]?.[junior ? 'j' : 's']; if (!qs) return;
  await ui.modal(`<div class="ribbon">💬 Talk it over</div><h2>${junior ? 'Screens down. Talk with your teacher.' : 'Screens down: talk it over with your teacher.'}</h2>
    <ol class="talkqs" style="text-align:left;font-size:1.25em;line-height:1.4;margin:10px auto;max-width:34em;padding-left:1.4em">${qs.map((q) => `<li style="margin:8px 0">${esc(q)}</li>`).join('')}</ol>
    <p style="color:#6f5f53">${junior ? 'There are no wrong answers. Say what you think, and why.' : 'There is no single right answer. Give a reason for yours.'}</p>
    <div class="row" style="justify-content:center"><button class="btn go" data-act="go">We have talked it over ➜</button></div>`, { say: `Talk it over with your teacher. ${qs.join(' ')}` });
}
// "Break time": names what comes next and offers the way to the start page. It never starts the next part by itself.
export async function breakTime(ui, id, junior) {
  const next = nextPart(id);
  const a = await ui.modal(`<div class="ribbon green">☕ Break time</div><h2>${next ? `Next: Part ${next.n}, ${esc(next.title)}` : 'That is the end of today’s parts'}</h2>
    <p>${next ? (junior ? 'Have a rest away from the screen. Your teacher will tell you when to start the next part.' : 'Take a break from the screen. Your teacher will say when the next part starts.') : (junior ? 'Well done for today. Your take-home page shows what you made.' : 'Your take-home page shows what you made today.')}</p>
    <div class="row" style="justify-content:center"><button class="btn alt" data-act="stay">Stay here</button><button class="btn go" data-act="hub">🏠 AI Lab start page</button></div>`, { say: next ? `Break time. Next: part ${next.n}, ${next.title}.` : 'That is the end of today’s parts.' });
  return a;
}
// Both, in order. Returns 'hub' when the child chose the start page (the caller saves first, then goes there).
export async function endOfPart(app, id, junior) {
  await talkItOver(app.ui, id, junior); const a = await breakTime(app.ui, id, junior);
  if (a === 'hub') { app.G?.flush?.(); location.href = HUB; }
  return a;
}
