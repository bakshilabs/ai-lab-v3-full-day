// Mission 1, the film crew's language: the camera films the child's own town, and they name what it does.
// Browser only: the questions come from m1-crew.js, the camera from player.js and camera.js.
import { PARTS, sizeItems, moveItems, sceneItems, crewLines } from './m1-crew.js';

export async function playCrew(env) {
  const { ctx, mui, player, set, junior, reduce } = env; const florence = ctx.engine.florence;
  const wave = () => { if (!reduce) { try { florence?.wave?.(); } catch { /* she only waves on the island */ } } };
  const r = { of: 0, first: 0 };
  const lists = { size: sizeItems(set, junior), move: moveItems(set, junior), scene: sceneItems(set) };
  for (const part of PARTS) {
    player.setMood('cheerful'); player.look({ move: 'wide', sub: 'town' });
    await mui.note({ kick: 'Mission 1 · The film crew’s language', title: part.title, lines: [part.line], btn: 'Start ➜', stage: 'part-' + part.id });
    const items = lists[part.id];
    for (let i = 0; i < items.length; i++) {
      const item = items[i]; ctx.report({ stage: `Crew words: ${part.kick.toLowerCase()}, ${i + 1} of ${items.length}` });
      const head = { kick: part.kick, step: [i + 1, items.length] }; let tools = [];
      if (part.id === 'size') player.look(item.shot, 0.5);
      else if (part.id === 'move') {
        // the move plays again and again; with reduced motion the child steps between its first and last frame
        if (reduce) { player.look(item.shot, 0); tools = [{ id: 'start', label: '◀ Start of the shot', on: () => player.look(item.shot, 0) }, { id: 'end', label: 'End of the shot ▶', on: () => player.look(item.shot, 1) }]; }
        else { player.loop(item.shot, 4.5); tools = [{ id: 'again', label: '↺ Play it again', on: () => player.loop(item.shot, 4.5) }]; }
      } else player.look({ move: 'wide', sub: 'town' });
      const res = await mui.ask({ head, item, tools, onRight: () => {
        if (part.id !== 'scene') return;
        // the director's note filmed: a move plays, a size holds still
        if (['pan', 'tilt', 'track'].includes(item.answer)) player.loop(item.shot, 4.5); else player.look(item.shot, 0.5);
        if (item.answer === 'medium') wave();
      } });
      r.of++; if (res.tries === 0) r.first++;
    }
  }
  player.look({ move: 'wide', sub: 'town' });
  return { res: r, lines: crewLines(r) };
}
