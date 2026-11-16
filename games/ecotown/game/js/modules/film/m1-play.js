// Mission 1, the film crew's language: the camera films the child's own town, and they name what it does.
// Ages 13–17 also plan two-shot sequences, which are then filmed. Browser only: the questions come from m1-crew.js,
// the camera from player.js and camera.js.
import { partsFor, sizeItems, moveItems, sceneItems, seqItems, crewLines } from './m1-crew.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function playCrew(env) {
  const { ctx, ui, mui, player, set, junior, reduce } = env; const florence = ctx.engine.florence;
  const wave = () => { if (!reduce) { try { florence?.wave?.(); } catch { /* she only waves on the island */ } } };
  const r = { of: 0, first: 0, seq: 0 };
  const lists = { size: sizeItems(set, junior), move: moveItems(set, junior), scene: sceneItems(set) };
  const show = (shot, answer) => { if (['pan', 'tilt', 'track'].includes(answer)) player.loop(shot, 4.5); else player.look(shot, 0.5); if (answer === 'medium') wave(); };
  for (const part of partsFor(junior)) {
    player.setMood('cheerful'); player.look({ move: 'wide', sub: 'town' });
    await mui.note({ kick: 'Mission 1 · The film crew’s language', title: part.title, lines: [part.line], btn: 'Start ➜', stage: 'part-' + part.id });
    if (part.id === 'seq') { await sequences(); continue; }
    const items = lists[part.id];
    await mui.askList(items, async (item, i, again) => {
      ctx.report({ stage: `Crew words: ${part.kick.toLowerCase()}, ${i + 1} of ${items.length}` });
      const head = { kick: again ? `${part.kick} · again` : part.kick, step: [i + 1, items.length] }; let tools = [];
      if (part.id === 'size') player.look(item.shot, 0.5);
      else if (part.id === 'move') {
        // the move plays again and again; with reduced motion the child steps between its first and last frame
        if (reduce) { player.look(item.shot, 0); tools = [{ id: 'start', label: '◀ Start of the shot', on: () => player.look(item.shot, 0) }, { id: 'end', label: 'End of the shot ▶', on: () => player.look(item.shot, 1) }]; }
        else { player.loop(item.shot, 4.5); tools = [{ id: 'again', label: '↺ Play it again', on: () => player.loop(item.shot, 4.5) }]; }
      } else player.look({ move: 'wide', sub: 'town' });
      const res = await mui.ask({ head, item, tools, limit: mui.LIMIT, reveal: again, onRight: () => { if (part.id === 'scene') show(item.shot, item.answer); } });
      if (!res.missed) { r.of++; if (res.tries === 0 && !again) r.first++; }
      return res;
    });
  }
  player.look({ move: 'wide', sub: 'town' });
  return { res: r, lines: crewLines(r) };

  // ages 13–17: a director's note that needs two shots in a row; both are chosen, then the pair is filmed
  async function sequences() {
    const seqs = seqItems(set);
    for (let i = 0; i < seqs.length; i++) {
      const sq = seqs[i]; ctx.report({ stage: `Crew words: sequence ${i + 1} of ${seqs.length}` }); player.look({ move: 'wide', sub: 'town' });
      const note = `<p class="fm-hear"><span aria-hidden="true">🎬</span> <b>Director’s note:</b> ${esc(sq.note)}</p>`;
      await mui.askList(sq.items, async (item, k, again) => {
        const res = await mui.ask({ head: { kick: `Sequence ${i + 1} of ${seqs.length}`, step: [k + 1, 2] }, item, pic: note, limit: mui.LIMIT, reveal: again });
        if (!res.missed) r.of++; return res;
      });
      const cut = { n: 1, mood: 'cheerful', shots: sq.shots.map((s, k) => ({ id: 'q' + k, ...s, secs: 4.5 })), tags: {}, gone: [], moodWas: null, dirty: false, next: 3 };
      const f = ui.film({ title: `Sequence ${i + 1}`, total: 2, credit: 'Planned by you · Camera by Florence', skip: 'Skip the film', back: 'Next ➜', capOf: (k) => ({ cap: `${sq.items[k].opts.find((o) => o.id === sq.items[k].answer).label} · ${sq.items[k].q.replace(/^Shot \d of 2\. /, '')}` }) });
      await player.play(cut, { title: () => f.title(), shot: (k, s) => f.shot(k, s, set), end: () => f.end(), dark: (on) => f.dark(on), set onNext(fn) { f.onNext = fn; }, set onSkip(fn) { f.onSkip = fn; } });
      f.close(); r.seq++;
    }
  }
}
