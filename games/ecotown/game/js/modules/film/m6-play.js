// Mission 6, true or made up? Changed pictures, machine-made pictures, and asking before filming people.
// Browser only; the pictures' facts and the words are in m6-truth.js, the drawings in art.js.
import { PARTS, changeItems, pictureItems, HONEST, permissionItems, truthLines } from './m6-truth.js';
import { changePair, madePic, peoplePic } from './art.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function playTruth(env) {
  const { ctx, mui, player } = env; const r = { pics: 0, clues: 0, first: 0 };
  const kick = 'Mission 6 · True or made up?';
  player.setMood('curious'); player.look({ move: 'wide', sub: 'town' });

  await mui.note({ kick, title: PARTS[0].title, lines: [PARTS[0].line], btn: 'Start ➜', stage: 'part-change' });
  const changes = changeItems();
  for (let i = 0; i < changes.length; i++) {
    const c = changes[i]; ctx.report({ stage: `Checking: what changed, ${i + 1} of ${changes.length}` });
    const pic = `<p class="fm-hear">${esc(c.about)}</p>${changePair(c.id)}`;
    const a = await mui.ask({ head: { kick: 'What changed?', step: [i + 1, changes.length] }, item: c.what, pic, wide: true, cols: 1 });
    const b = await mui.ask({ head: { kick: 'Fine or misleading?', step: [i + 1, changes.length] }, item: c.judge, pic, wide: true, cols: 1 });
    if (a.tries + b.tries === 0) r.first++;
  }

  await mui.note({ kick, title: PARTS[1].title, lines: [PARTS[1].line], btn: 'Start ➜', stage: 'part-made' });
  const pics = pictureItems();
  for (let i = 0; i < pics.length; i++) {
    const p = pics[i]; ctx.report({ stage: `Checking: filmed or made, ${i + 1} of ${pics.length}` });
    const res = await mui.ask({ head: { kick: 'Filmed or made?', step: [i + 1, pics.length] }, item: p, cols: 1,
      pic: `${madePic(p.id)}<p class="fm-hear"><span aria-hidden="true">📍</span> ${esc(p.from)}</p>` });
    r.pics++; if (p.answer === 'clue') r.clues++; if (res.tries === 0) r.first++;
  }
  // ages 13–17: the numbers from this set of pictures
  const made = pics.filter((x) => x.answer === 'clue').length; const seen = made - 1; // the poster's only clue is its label
  await mui.note({ kick, title: 'Clues are not enough', lines: [...HONEST.slice(0, 1), ...(env.junior ? [] : [`Here, ${seen} of the ${made} machine-made pictures had a clue in the picture itself (${Math.round(seen / made * 100)}%). One had only a label.`]), ...HONEST.slice(1)], stage: 'honest' });

  await mui.note({ kick, title: PARTS[2].title, lines: [PARTS[2].line], btn: 'Start ➜', stage: 'part-ask' });
  const asks = permissionItems();
  for (let i = 0; i < asks.length; i++) {
    ctx.report({ stage: `Checking: asking first, ${i + 1} of ${asks.length}` });
    await mui.ask({ head: { kick: 'Asking first', step: [i + 1, asks.length] }, item: asks[i], pic: peoplePic(asks[i].art), cols: 1 });
  }
  return { res: r, lines: truthLines(r) };
}
