// Mission 5, making it for everyone: choose captions, build a caption from tiles, choose descriptions, then watch the
// film with both. Browser only; the choices, rules and words are in m5-access.js, the drawings in art.js.
import { PARTS, captionItems, descItems, buildsFor, builtText, checkBuild, screening, accessLines, words, READ_WPS } from './m5-access.js';
import { shotPic, captionPic } from './art.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SLIDE_MS = 5000;

export async function playAccess(env) {
  const { ctx, ui, mui, player, junior, reduce } = env; const r = { caps: 0, descs: 0, built: 0, first: 0 };
  const kick = 'Mission 5 · Making it for everyone';
  const part = (id) => PARTS.find((x) => x.id === id);
  player.setMood('calm'); player.look({ move: 'wide', sub: 'town' });

  // ---- choose the best caption
  await mui.note({ kick, title: part('caps').title, lines: [part('caps').line], btn: 'Start ➜', stage: 'part-caps' });
  const caps = captionItems(junior);
  await mui.askList(caps, async (c, i, again) => {
    ctx.report({ stage: `For everyone: captions, ${i + 1} of ${caps.length}` });
    const pic = (cap) => `${captionPic(c.art, cap)}<p class="fm-hear"><span aria-hidden="true">🔊</span> ${esc(c.hear)}</p>`;
    const res = await mui.ask({ head: { kick: again ? 'Captions · again' : 'Captions', step: [i + 1, caps.length] }, item: c, pic: pic(''), cols: 1, limit: mui.LIMIT, reveal: again,
      onRight: () => { const f = ctx.root.querySelector('.fm-qpic'); if (f) f.innerHTML = pic(c.caption); } });
    if (!res.missed) { r.caps++; if (res.tries === 0 && !again) r.first++; } return res;
  });

  // ---- build a caption from tiles: who speaks, what they say, how, and the sound
  await mui.note({ kick, title: part('build').title, lines: [part('build').line], btn: 'Start ➜', stage: 'part-build' });
  const built = [];
  for (const b of buildsFor(junior)) {
    ctx.report({ stage: 'For everyone: building a caption' });
    const text = await buildOne(b); built.push({ art: b.art, text }); r.built++;
  }

  // ---- choose the description for each gap
  await mui.note({ kick, title: part('desc').title, lines: [part('desc').line], btn: 'Start ➜', stage: 'part-desc' });
  const descs = descItems(junior);
  await mui.askList(descs, async (d, i, again) => {
    ctx.report({ stage: `For everyone: descriptions, ${i + 1} of ${descs.length}` });
    const res = await mui.ask({ head: { kick: again ? 'Described version · again' : 'Described version', step: [i + 1, descs.length] }, item: d, cols: 1, limit: mui.LIMIT, reveal: again,
      pic: `${shotPic(d.art)}<p class="fm-hear"><span aria-hidden="true">🔇</span> No talking here: a gap for the description.</p>` });
    if (!res.missed) { r.descs++; if (res.tries === 0 && !again) r.first++; } return res;
  });

  // ---- the version for everyone: each picture with its caption, or its description written and read aloud
  await mui.note({ kick, title: part('show').title, lines: [part('show').line, ctx.settings.readAloud ? 'Read-aloud is on, so you will hear the descriptions.' : 'The descriptions are shown in the blue box. With read-aloud on, you would hear them.'], btn: '▶ Play it', stage: 'part-show' });
  ctx.report({ stage: 'For everyone: watching the version for everyone' });
  const slides = screening(caps, descs, built); const pace = Number(globalThis.__filmPace) > 0 ? Number(globalThis.__filmPace) : 1;
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i]; let skip = false;
    const p = mui.custom(`<section class="fm-m fm-show" data-fm-show="${i}" aria-label="The version for everyone, picture ${i + 1} of ${slides.length}">
      <figure class="fm-npic">${captionPic(s.art, s.cap, s.cap ? `Caption: ${s.cap}` : 'No caption')}</figure>
      <p class="fm-desc" ${s.desc ? '' : 'hidden'} role="status"><span aria-hidden="true">🔈</span> <b>Description:</b> ${esc(s.desc)}</p>
      <div class="fm-row"><span class="fm-chip">${i + 1} of ${slides.length}</span>${reduce ? `<button type="button" class="fm-btn go big" data-fm-ok>${i === slides.length - 1 ? 'Finish ➜' : 'Next ➜'}</button>` : '<button type="button" class="fm-btn" data-fm-ok>Skip the film ➜</button>'}</div></section>`, 'show');
    p.querySelector('[data-fm-ok]').focus({ preventScroll: true });
    if (s.desc) ctx.say(s.desc);
    await new Promise((go) => { const t = reduce ? null : setTimeout(go, SLIDE_MS * pace); p.onclick = (e) => { if (e.target.closest('[data-fm-ok]')) { clearTimeout(t); if (!reduce) skip = true; go(); } }; });
    if (skip) break;
  }
  mui.clear();
  return { res: r, lines: accessLines(r) };

  // one caption, built from tiles: tap a tile to add it, tap a placed tile to take it off; Check says what is wrong
  function buildOne(b) {
    return new Promise((done) => {
      const placed = []; let ok = false;
      const draw = (focusSel) => {
        const text = builtText(placed); const n = words(text);
        const pane = mui.custom(`<section class="fm-m fm-build" data-fm-build="${b.id}" aria-label="Build a caption">
          <div class="fm-qhead"><span class="fm-kick">Build a caption</span></div>
          <div class="fm-buildtop"><figure class="fm-qpic">${captionPic(b.art, text)}<p class="fm-hear"><span aria-hidden="true">🔊</span> ${esc(b.hear)}</p></figure>
          <div><h2>Build the caption for this moment.</h2><p class="fm-hint">On screen for ${b.secs} seconds.${junior ? '' : ` ${n} word${n === 1 ? '' : 's'} so far: most people read about ${READ_WPS} a second, so ${READ_WPS * b.secs} at most.`}</p>
          <p class="fm-capline" aria-live="polite">${placed.length ? placed.map((x, i) => `<button type="button" class="fm-tok on" data-fm-off="${i}" aria-label="${esc(x.t)}: take it off" ${ok ? 'disabled' : ''}>${esc(x.t)}</button>`).join('') : '<span class="fm-hint">Your caption appears here.</span>'}</p></div></div>
          <div class="fm-bank" role="group" aria-label="Tiles">${b.tiles.map((x, i) => placed.includes(x) ? '' : `<button type="button" class="fm-tok" data-fm-tile="${i}" ${globalThis.__filmTest && x.good ? `data-fm-good="${b.tiles.filter((y) => y.good).indexOf(x)}"` : ''} ${ok ? 'disabled' : ''}>${esc(x.t)}</button>`).join('')}</div>
          <div class="fm-row end">${ok ? '<button type="button" class="fm-btn go big" data-fm-next>Next ➜</button>' : `<button type="button" class="fm-btn go big" data-fm-check ${placed.length ? '' : 'disabled'}>Check the caption</button>`}</div></section>`, 'build');
        (focusSel && pane.querySelector(focusSel) || pane.querySelector('[data-fm-tile]:not(:disabled)') || pane.querySelector('.fm-btn:not(:disabled)'))?.focus({ preventScroll: true });
        pane.onclick = (e) => {
          const t = e.target.closest('button'); if (!t || t.disabled) return; const d = t.dataset;
          if (d.fmTile !== undefined) { placed.push(b.tiles[+d.fmTile]); draw(); }
          else if (d.fmOff !== undefined) { placed.splice(+d.fmOff, 1); draw(); }
          else if (d.fmCheck !== undefined) { const res = checkBuild(b, placed, junior); ui.talk(res.say); if (res.ok) { ok = true; draw('[data-fm-next]'); } }
          else if (d.fmNext !== undefined) { mui.clear(); done(builtText(placed)); }
        };
      };
      draw(); ui.talk(`${b.hear} Build the caption from the tiles.`);
    });
  }
}
