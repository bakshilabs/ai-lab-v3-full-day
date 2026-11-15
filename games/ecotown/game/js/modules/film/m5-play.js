// Mission 5, making it for everyone: captions, then the described version, then the film with both.
// Browser only; the choices and words are in m5-access.js, the drawings in art.js.
import { PARTS, captionItems, descItems, screening, accessLines } from './m5-access.js';
import { shotPic, captionPic } from './art.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SLIDE_MS = 5000;

export async function playAccess(env) {
  const { ctx, ui, mui, player, junior, reduce } = env; const r = { caps: 0, descs: 0, first: 0 };
  const kick = 'Mission 5 · Making it for everyone';
  player.setMood('calm'); player.look({ move: 'wide', sub: 'town' });

  await mui.note({ kick, title: PARTS[0].title, lines: [PARTS[0].line], btn: 'Start ➜', stage: 'part-caps' });
  const caps = captionItems(junior);
  for (let i = 0; i < caps.length; i++) {
    const c = caps[i]; ctx.report({ stage: `For everyone: captions, ${i + 1} of ${caps.length}` });
    const pic = (cap) => `${captionPic(c.art, cap)}<p class="fm-hear"><span aria-hidden="true">🔊</span> ${esc(c.hear)}</p>`;
    const res = await mui.ask({ head: { kick: 'Captions', step: [i + 1, caps.length] }, item: c, pic: pic(''), cols: 1,
      onRight: () => { const f = ctx.root.querySelector('.fm-qpic'); if (f) f.innerHTML = pic(c.caption); } });
    r.caps++; if (res.tries === 0) r.first++;
  }

  await mui.note({ kick, title: PARTS[1].title, lines: [PARTS[1].line], btn: 'Start ➜', stage: 'part-desc' });
  const descs = descItems(junior);
  for (let i = 0; i < descs.length; i++) {
    const d = descs[i]; ctx.report({ stage: `For everyone: descriptions, ${i + 1} of ${descs.length}` });
    const res = await mui.ask({ head: { kick: 'Described version', step: [i + 1, descs.length] }, item: d, cols: 1,
      pic: `${shotPic(d.art)}<p class="fm-hear"><span aria-hidden="true">🔇</span> No talking here: a gap for the description.</p>` });
    r.descs++; if (res.tries === 0) r.first++;
  }

  // ---- the version for everyone: each picture with its caption, and its description written and read aloud
  await mui.note({ kick, title: PARTS[2].title, lines: [PARTS[2].line, ctx.settings.readAloud ? 'Read-aloud is on, so you will hear the descriptions.' : 'The descriptions are shown in the blue box. With read-aloud on, you would hear them.'], btn: '▶ Play it', stage: 'part-show' });
  ctx.report({ stage: 'For everyone: watching the version for everyone' });
  const slides = screening(caps, descs); const pace = Number(globalThis.__filmPace) > 0 ? Number(globalThis.__filmPace) : 1;
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i]; let skip = false;
    const p = mui.custom(`<section class="fm-m fm-show" data-fm-show="${i}" aria-label="The version for everyone, picture ${i + 1} of ${slides.length}">
      <figure class="fm-npic">${captionPic(s.art, s.cap, s.cap ? `Caption: ${s.cap}` : 'No caption')}</figure>
      <p class="fm-desc" ${s.desc ? '' : 'hidden'} role="status"><span aria-hidden="true">🔈</span> <b>Description:</b> ${esc(s.desc)}</p>
      <div class="fm-row"><span class="fm-chip">${i + 1} of ${slides.length}</span>${reduce ? `<button type="button" class="fm-btn go big" data-fm-ok>${i === slides.length - 1 ? 'Finish ➜' : 'Next ➜'}</button>` : '<button type="button" class="fm-btn" data-fm-ok>Skip ➜</button>'}</div></section>`, 'show');
    p.querySelector('[data-fm-ok]').focus({ preventScroll: true });
    if (s.desc) ctx.say(s.desc);
    await new Promise((go) => { const t = reduce ? null : setTimeout(go, SLIDE_MS * pace); p.onclick = (e) => { if (e.target.closest('[data-fm-ok]')) { clearTimeout(t); if (!reduce) skip = true; go(); } }; });
    if (skip) break;
  }
  mui.clear();
  return { res: r, lines: accessLines(r) };
}
