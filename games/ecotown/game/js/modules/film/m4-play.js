// Mission 4, editing: best takes, trimming the rough cut, pace (the same shots fast and slow, watched in the town),
// and music (where it changes and what plays). Browser only; rules and words in m4-edit.js.
import { PARTS, takeItems, ROUGH, checkTrim, LENGTHS, LENGTH_IDS, PACES, paceVerdict, paceAsk, totalSecs, FINAL, turnItems, musicItems, editCut, TUNES, editLines } from './m4-edit.js';
import { takePic, shotPic } from './art.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LEN_LABEL = { quick: 'Quick', medium: 'Medium', long: 'Long' };

export async function playEdit(env) {
  const { ctx, ui, mui, player, set, junior, reduce } = env; const r = { takes: 0, first: 0 };
  const kick = 'Mission 4 · Editing';
  const watch = async (cut, title, capOf) => {
    const f = ui.film({ title, total: cut.shots.length, credit: 'Edited by you', skip: 'Skip the film', back: 'Next ➜', capOf });
    await player.play(cut, { title: () => f.title(), shot: (k, s) => f.shot(k, s, set), end: () => f.end(), dark: (on) => f.dark(on), set onNext(fn) { f.onNext = fn; }, set onSkip(fn) { f.onSkip = fn; } });
    f.close(); player.setMood('cheerful'); player.look({ move: 'wide', sub: 'town' });
  };
  player.setMood('cheerful'); player.look({ move: 'wide', sub: 'town' });

  // ---- part 1: the best takes
  await mui.note({ kick, title: PARTS[0].title, lines: [PARTS[0].line], btn: 'Start ➜', stage: 'part-takes' });
  const takes = takeItems(takePic);
  for (let i = 0; i < takes.length; i++) {
    ctx.report({ stage: `Editing: best takes, ${i + 1} of ${takes.length}` });
    await mui.ask({ head: { kick: 'Best takes', step: [i + 1, takes.length] }, item: takes[i].pickOne, cols: 2 });
    // naming the fault: two misses and it is asked again, so tapping every answer does not win
    await mui.askList([takes[i].whatWrong], (item, _k, again) => mui.ask({ head: { kick: again ? 'Best takes · again' : 'Best takes', step: [i + 1, takes.length] }, item, pic: takes[i].pic, wide: true, cols: 1, limit: mui.LIMIT, reveal: again }));
    r.takes++;
  }

  // ---- part 2: trim the rough cut. Tap a clip to cut it (or bring it back), then check.
  await mui.note({ kick, title: PARTS[1].title, lines: [PARTS[1].line], btn: 'Start ➜', stage: 'part-trim' });
  ctx.report({ stage: 'Editing: trimming the rough cut' });
  await new Promise((done) => {
    const cut = new Set(); let ok = false;
    const draw = (focusSel) => {
      const p = mui.custom(`<section class="fm-m fm-trim" data-fm-trim aria-label="The rough cut">
        <div class="fm-qhead"><span class="fm-kick">Rough cut · ${ROUGH.length - cut.size} clips</span></div><h2>Tap a clip to cut it. Tap it again to bring it back.</h2>
        <ol class="fm-clips">${ROUGH.map((c, i) => `<li><button type="button" class="fm-clip ${cut.has(c.id) ? 'cut' : ''}" data-fm-clip="${c.id}" ${globalThis.__filmTest && !c.keep ? 'data-fm-right' : ''} aria-pressed="${cut.has(c.id)}" aria-label="Clip ${i + 1}: ${esc(c.words)}. ${cut.has(c.id) ? 'Cut. Press to bring it back.' : 'In the film. Press to cut it.'}" ${ok ? 'disabled' : ''}>${shotPic(c.art)}<span><b>${i + 1}</b> ${esc(c.words)}</span><em aria-hidden="true">${cut.has(c.id) ? '✂️ Cut' : ''}</em></button></li>`).join('')}</ol>
        <div class="fm-row end">${ok ? '<button type="button" class="fm-btn go big" data-fm-next>Next ➜</button>' : '<button type="button" class="fm-btn go big" data-fm-check>Check the cut</button>'}</div></section>`, 'trim');
      (focusSel && p.querySelector(focusSel) || p.querySelector('[data-fm-clip]:not(:disabled)'))?.focus({ preventScroll: true });
      p.onclick = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled) return;
        if (b.dataset.fmClip) { const id = b.dataset.fmClip; if (cut.has(id)) cut.delete(id); else cut.add(id); draw(`[data-fm-clip="${id}"]`); }
        else if (b.dataset.fmCheck !== undefined) { const res = checkTrim([...cut]); ui.talk(res.say); if (res.ok) { ok = true; draw('[data-fm-next]'); } }
        else if (b.dataset.fmNext !== undefined) { mui.clear(); done(); }
      };
    };
    draw(); ui.talk('Here is everything the camera filmed. Tap a clip to cut it. Some clips are not needed.');
  });

  // ---- part 3: the pace. Set each shot's length, watch it, and Florence says how it feels.
  await mui.note({ kick, title: PARTS[2].title, lines: [PARTS[2].line, reduce ? 'With still pictures on, press Next for each shot. The lengths still show.' : 'Then watch it in your town.'].filter(Boolean), btn: 'Start ➜', stage: 'part-pace' });
  for (const pace of PACES) {
    const lens = FINAL.map(() => 'medium'); let said = paceAsk(pace, junior); let done = false;
    while (!done) {
      ctx.report({ stage: `Editing: the pace, ${pace.title.toLowerCase()}` });
      await new Promise((go) => {
        const draw = (focusSel) => {
          const total = lens.reduce((s, l) => s + LENGTHS[l], 0);
          const p = mui.custom(`<section class="fm-m fm-pace" data-fm-pace="${pace.id}" aria-label="${esc(pace.title)}">
            <div class="fm-qhead"><span class="fm-kick">The pace</span></div><h2>${esc(pace.title)}</h2>${junior ? '' : `<p class="fm-hint">Target: ${pace.secs[0]} to ${pace.secs[1]} seconds in all, average shot ${pace.id === 'fast' ? '2.2 s or less' : '4.2 s or more'}.</p>`}
            <ol class="fm-tl">${FINAL.map((c, i) => `<li style="--w:${LENGTHS[lens[i]]}"><div class="fm-tlpic">${shotPic(c.art)}</div><span>${i + 1}. ${esc(c.words)}</span>
              <div class="fm-len" role="radiogroup" aria-label="Length of shot ${i + 1}">${LENGTH_IDS.map((l) => `<button type="button" role="radio" aria-checked="${lens[i] === l}" class="${lens[i] === l ? 'on' : ''}" data-fm-len="${l}" data-i="${i}">${LEN_LABEL[l]}${junior ? '' : ` ${LENGTHS[l]} s`}</button>`).join('')}</div></li>`).join('')}</ol>
            <p class="fm-hint" aria-live="polite">${junior ? `The whole film: about ${Math.round(total)} seconds.` : `Running time ${total} s · average shot ${(total / lens.length).toFixed(1)} s`}</p>
            <div class="fm-row end"><button type="button" class="fm-btn go big" data-fm-watch>▶ Watch it</button></div></section>`, 'pace');
          (focusSel && p.querySelector(focusSel) || p.querySelector('[data-fm-len].on'))?.focus({ preventScroll: true });
          p.onclick = (e) => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.fmLen) { lens[+b.dataset.i] = b.dataset.fmLen; draw(`[data-fm-len="${b.dataset.fmLen}"][data-i="${b.dataset.i}"]`); }
            else if (b.dataset.fmWatch !== undefined) { mui.clear(); go(); }
          };
        };
        draw(); ui.talk(said);
      });
      await watch(editCut(set, { lens, mood: pace.mood }), pace.title, (i) => ({ cap: `${FINAL[i].words} · ${LEN_LABEL[lens[i]]}` }));
      const v = paceVerdict(pace, lens, junior); said = v.say;
      if (v.ok) { await mui.note({ kick: 'The pace', title: pace.id === 'fast' ? 'Fast and exciting' : 'Slow and calm', lines: [v.say], stage: 'pace-ok' }); done = true; }
      else said = `${v.say} Change the lengths and watch it again.`;
    }
  }

  // ---- part 4: the music. Where the story turns, then which music plays in each part.
  await mui.note({ kick, title: PARTS[3].title, lines: [PARTS[3].line], btn: 'Start ➜', stage: 'part-music' });
  const turns = turnItems((art) => shotPic(art));
  for (let i = 0; i < turns.length; i++) { ctx.report({ stage: 'Editing: where the music changes' }); await mui.ask({ head: { kick: 'Music', step: [i + 1, 5] }, item: turns[i] }); }
  const music = {}; const items = musicItems();
  await mui.askList(items, async (item, i, again) => {
    ctx.report({ stage: `Editing: music for the ${item.part}` });
    const res = await mui.ask({ head: { kick: again ? 'Music · again' : 'Music', step: [i + 3, 5] }, item: { ...item, say: item.q }, cols: 2, limit: mui.LIMIT, reveal: again, onRight: (id) => ctx.engine.setMusic?.(id) });
    if (!res.missed) music[item.part] = res.id; return res;
  });
  await watch(editCut(set, { music, mood: 'cheerful' }), 'Market day', (i) => ({ cap: `${FINAL[i].words}${i === 0 ? ` · ♪ ${TUNES[music.start].label}` : i === 2 ? ` · ♪ now ${TUNES[music.middle].label.toLowerCase()}` : i === 4 ? ` · ♪ now ${TUNES[music.end].label.toLowerCase()}` : ''}` }));
  ctx.engine.setMusic?.('day');
  return { res: r, lines: editLines() };
}
