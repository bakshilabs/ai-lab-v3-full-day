// The frame round every mission: the opening card (the real job, why it matters, what to tap) and the closing card
// (what the child can now do, and what they did). Shared by all six missions.
import { esc } from './kit.js';

// m: a mission from missions.js. Resolves when the child presses Start.
export async function opening(K, m) {
  const p = K.pick; K.set.root.visible = true; K.setView(K.views.street);
  K.ctx.report({ stage: `Mission ${m.n}: ${m.use}` });
  K.showStage(`<div class="rd-card rd-open"><span class="rd-bigico" aria-hidden="true">${m.icon}</span><div><p class="rd-kicker">Mission ${m.n} of 6</p><h2>${esc(m.use)}</h2>
    <p class="rd-job">${esc(p(m.job))}</p><p class="rd-how"><b>How:</b> ${esc(p(m.how))}</p></div></div>`);
  K.sayShort(K.j ? 'Here is your next job. Press Start when you are ready.' : 'Your next job. Press Start when ready.', `${m.use}. ${p(m.job)} ${p(m.how)}`);
  K.swap(`<div class="rd-row end"><button class="go" type="button" data-primary data-act="go">Start ➜</button></div>`);
  await K.press();
}
// lines: what the child did (one or two short lines). Resolves when the child presses on.
export async function closing(K, m, lines) {
  const p = K.pick; K.reset(); K.ctx.report({ stage: `Mission ${m.n} done: ${m.use}` });
  K.showStage(`<div class="rd-card done"><p class="rd-kicker">Mission ${m.n} done <span aria-hidden="true">✓</span></p><h2><span aria-hidden="true">${m.icon}</span> ${esc(m.use)}</h2>
    <ul class="rd-did">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul><p class="rd-now"><b>Now you can:</b> ${esc(p(m.now))}</p></div>`);
  K.sayShort(m.n < 6 ? (K.j ? 'Mission done! On to the next one.' : 'Mission complete.') : (K.j ? 'All the street work is done!' : 'Mission complete.'), `Mission ${m.n} done. Now you can ${p(m.now).replace(/^./, (c) => c.toLowerCase())} ${lines.join('. ')}`);
  K.swap(`<div class="rd-row end"><button class="go" type="button" data-primary data-act="go">Back to the missions ➜</button></div>`);
  await K.press();
}
