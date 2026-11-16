// Town film studio: the panels over the 3D town (Florence's line, the three brief questions, the storyboard with
// the feedback tiles, and the frame round the film while it plays). Page elements only: the rules are in cut.js,
// the words in words.js, the drawings in picture.js and the camera in player.js. Nothing is typed anywhere.
import { moodOf } from './kit.js';
import { FEEDBACK, cutSecs } from './cut.js';
import { caption, moveName, subjectLine, shotSentence, TAG, tagMeans, cutName, cutFacts, musicLine, shotCount, CREDIT, THE_END } from './words.js';
import { frameSvg } from './picture.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

export function createUi(ctx, { junior, reduce, onPanel }) {
  const root = ctx.root; root.classList.add('fm-root'); if (ctx.settings.largeText) root.classList.add('fm-large'); if (reduce) root.classList.add('fm-still');
  // a clear sheet over the 3D view, so a drag, a tap or the wheel does not move the town's own camera or build on it
  const shield = el('<div class="fm-shield" aria-hidden="true"></div>'); root.appendChild(shield);
  const stopWheel = (e) => { if (!e.target.closest?.('.fm-board, .fm-brief')) e.preventDefault(); }; root.addEventListener('wheel', stopWheel, { passive: false });
  // every key press stays inside the module (the game's own keys build, pan and open menus). Tab, Enter and Space still work.
  const onKey = (e) => { e.stopPropagation(); };
  addEventListener('keydown', onKey, true); addEventListener('keyup', onKey, true);
  const talkBox = el('<div class="fm-talk" role="status"><b>Florence</b><p></p></div>'); root.appendChild(talkBox);
  const setStage = (s) => { root.dataset.fmStage = s; };
  let panel = null; const clear = () => { panel?.remove(); panel = null; };
  // tell the camera how far the panel reaches up the screen, so it can keep its subject in the clear part above it
  const measure = () => { if (!panel || !onPanel) return; const H = root.clientHeight || innerHeight; const top = talkBox.getBoundingClientRect().bottom || 70; const mid = (top + Math.max(top, panel.getBoundingClientRect().top)) / 2; onPanel(Math.max(0, Math.min(0.72, (H / 2 - mid) / (H / 2)))); };
  addEventListener('resize', measure);

  // Florence's line: written at the top and spoken. quiet: written only (it was just said).
  function talk(text, { quiet } = {}) { talkBox.hidden = false; talkBox.querySelector('p').textContent = text; if (!quiet) ctx.say(text); }

  // ---- one question of the brief: big tiles, one tap to choose, then Next.
  // pick(id) is asked on every tap and answers { ok, say }: ok false means Florence cannot film that (it is not there).
  function choose({ step, of, q, tiles, picked, pick, say, back }) {
    clear(); setStage('brief-' + step); let chosen = picked || null; const off = new Set();
    panel = el(`<section class="fm-brief" data-fm-brief="${step}" aria-label="${esc(q)}">
      <div class="fm-briefhead"><span class="fm-dots" aria-label="Question ${of[0]} of ${of[1]}">${Array.from({ length: of[1] }, (_, i) => `<i class="${i < of[0] ? 'on' : ''}"></i>`).join('')}</span><h2>${esc(q)}</h2></div>
      <div class="fm-tiles" role="group" aria-label="${esc(q)}">${tiles.map((t) => `<button type="button" class="fm-tile" data-fm-pick="${t.id}" aria-pressed="false"><span class="fm-ico" aria-hidden="true">${t.icon}</span><span class="fm-lab">${esc(t.label)}</span><small hidden>Not in your town</small></button>`).join('')}</div>
      <div class="fm-row">${back ? '<button type="button" class="fm-btn" data-fm-prev>← Back a step</button>' : '<span></span>'}<button type="button" class="fm-btn go" data-fm-next disabled>Next ➜</button></div>
    </section>`);
    root.appendChild(panel); talk(say); measure();
    const next = panel.querySelector('[data-fm-next]');
    const mark = () => { for (const b of panel.querySelectorAll('[data-fm-pick]')) { const on = b.dataset.fmPick === chosen; b.classList.toggle('picked', on); b.setAttribute('aria-pressed', String(on)); const no = off.has(b.dataset.fmPick); b.classList.toggle('off', no); b.querySelector('small').hidden = !no; } next.disabled = !chosen; };
    mark(); (chosen ? next : panel.querySelector('[data-fm-pick]'))?.focus({ preventScroll: true });
    return new Promise((res) => {
      panel.onclick = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled) return;
        if (b.dataset.fmPick) { const r = pick(b.dataset.fmPick); if (r.ok) chosen = b.dataset.fmPick; else off.add(b.dataset.fmPick); mark(); talk(r.say); }
        else if (b.dataset.fmNext !== undefined && chosen) { clear(); res({ act: 'next', id: chosen }); }
        else if (b.dataset.fmPrev !== undefined) { clear(); res({ act: 'back', id: chosen }); }
      };
    });
  }

  // ---- the storyboard: every shot as a drawn frame, in order, with what the feedback changed marked on it.
  // get() gives { cut, title, plays, said }; feedback(id) and move(id, dir) change the cut and answer with Florence's line.
  function board({ set, get, feedback, move, retitle, titles }) {
    clear(); setStage('board');
    panel = el('<section class="fm-board" data-fm-board aria-label="Storyboard"></section>'); root.appendChild(panel);
    const draw = (focusSel) => {
      const { cut, title, plays } = get(); const tags = cut.tags || {}; const m = moodOf(cut.mood);
      const gone = (cut.gone || []).slice(-3); // shots this round of feedback cut: shown crossed out under the film
      const frame = (s, i) => {
        const tag = tags[s.id];
        return `<li class="fm-shot ${tag || ''}" data-fm-shot="${s.id}" aria-label="Shot ${i + 1}. ${esc(shotSentence(s, set))} ${Math.round(s.secs)} seconds.${tag ? ' ' + esc(TAG[tag] + ': ' + tagMeans[tag] + '.') : ''}">
          <div class="fm-pic">${frameSvg(s, set, cut.mood)}<span class="fm-num" aria-hidden="true">${i + 1}</span>${tag ? `<span class="fm-tag ${tag}">${TAG[tag]}</span>` : ''}</div>
          <div class="fm-capt"><b>${esc(moveName(s.move))}</b><i aria-hidden="true">${Math.round(s.secs)} s</i></div><span>${esc(subjectLine(s, set))}</span>
          ${move ? `<div class="fm-move"><button type="button" data-fm-move="-1" data-id="${s.id}" aria-label="Move shot ${i + 1} earlier" ${i === 0 ? 'disabled' : ''}>◀</button><button type="button" data-fm-move="1" data-id="${s.id}" aria-label="Move shot ${i + 1} later" ${i === cut.shots.length - 1 ? 'disabled' : ''}>▶</button></div>` : ''}</li>`;
      };
      const goneRow = gone.length ? `<ul class="fm-gone" aria-label="Cut from the film"><li class="fm-gonehead"><span class="fm-tag gone">${TAG.gone}</span></li>${gone.map((gh) => `<li class="fm-ghost" aria-label="Cut from the film: ${esc(caption(gh, set))}">${frameSvg(gh, set, cut.mood)}<span>${esc(caption(gh, set))}</span></li>`).join('')}</ul>` : '';
      panel.innerHTML = `
        <div class="fm-head"><h2><span class="fm-clap" aria-hidden="true">🎬</span> ${esc(title)}</h2>
          <span class="fm-chip">${esc(cutName(cut.n))} · ${esc(cutFacts(cut))}</span>
          <span class="fm-chip music ${cut.moodWas ? 'changed' : ''}">${esc(musicLine(cut))}${cut.moodWas ? ` <em class="fm-tag changed">${TAG.changed}</em>` : ''}</span>
          ${retitle ? '<button type="button" class="fm-btn small" data-fm-title>Change the title</button>' : ''}</div>
        <ol class="fm-frames" style="--fm-cols:${Math.max(5, cut.shots.length)}" data-shots="${cut.shots.length}" data-cut="${cut.n}" data-mood="${m.id}" data-secs="${cutSecs(cut)}">${cut.shots.map(frame).join('')}</ol>${goneRow}
        <div class="fm-lower">
          ${plays > 0 ? `<div class="fm-fb" role="group" aria-labelledby="fm-fbh"><h3 id="fm-fbh">${junior ? 'Tell Florence one thing to change' : 'Give Florence feedback'}</h3><div class="fm-fbtiles">${FEEDBACK.map((f) => `<button type="button" class="fm-fbt" data-fm-fb="${f.id}"><span aria-hidden="true">${f.icon}</span> ${esc(f.label)}</button>`).join('')}</div></div>` : `<p class="fm-hint">${junior ? 'These are the shots, in order. The arrows show how the camera moves.' : 'The shots in order. The arrows on each frame show the camera move.'}</p>`}
          <div class="fm-acts"><button type="button" class="fm-btn go big" data-fm-watch>▶ ${plays === 0 ? 'Watch the film' : cut.dirty ? 'Watch the new cut' : 'Watch it again'}</button>
            ${plays > 0 ? '<button type="button" class="fm-btn" data-fm-finish>Finish with this film ➜</button>' : ''}</div>
        </div>`;
      (focusSel && panel.querySelector(focusSel) || panel.querySelector('[data-fm-watch]'))?.focus({ preventScroll: true });
      measure();
    };
    draw(); talk(get().said);
    return new Promise((res) => {
      panel.onclick = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled) return; const d = b.dataset;
        if (d.fmFb) { const say = feedback(d.fmFb); draw(`[data-fm-fb="${d.fmFb}"]`); talk(say); }
        else if (d.fmMove) { const say = move(d.id, +d.fmMove); draw(`[data-fm-move="${d.fmMove}"][data-id="${d.id}"]:not(:disabled), [data-fm-shot="${d.id}"] button:not(:disabled)`); talk(say); }
        else if (d.fmTitle !== undefined) { const say = retitle(); draw('[data-fm-title]'); talk(say); }
        else if (d.fmWatch !== undefined) { clear(); res('watch'); }
        else if (d.fmFinish !== undefined) { clear(); res('finish'); }
      };
    });
  }

  // ---- the frame round the film while it plays: black bars, the title card, the shot's caption, Skip (or Next shot).
  // capOf(i, shot): { cap, sub, say } for the missions: cap replaces the shot's caption, sub is shown as a subtitle over
  // the picture (mission 5's captions and spoken description), say is read aloud. credit: the line under the title.
  function film({ title, total, capOf = null, credit = CREDIT, skip = 'Skip to the storyboard', back = 'Back to the storyboard ➜' }) {
    clear(); setStage('film'); talkBox.hidden = true;
    panel = el(`<section class="fm-film" data-fm-film aria-label="The film">
      <div class="fm-dark" aria-hidden="true"></div><div class="fm-bar top" aria-hidden="true"></div>
      <p class="fm-sub" data-fm-sub hidden></p><div class="fm-card" data-fm-card hidden><span class="fm-clap" aria-hidden="true">🎬</span><h2></h2><p></p></div>
      <div class="fm-bar bottom"><p class="fm-cap" role="status"></p><div class="fm-filmbtns"><button type="button" class="fm-btn go" data-fm-nextshot hidden>Next shot ➜</button><button type="button" class="fm-btn" data-fm-skip>${esc(skip)}</button></div></div>
    </section>`);
    root.appendChild(panel); const subEl = panel.querySelector('[data-fm-sub]'); const card = panel.querySelector('[data-fm-card]'), cap = panel.querySelector('.fm-cap'), nextB = panel.querySelector('[data-fm-nextshot]'), skipB = panel.querySelector('[data-fm-skip]');
    let onNext = null, onSkip = null; nextB.onclick = () => onNext?.(); skipB.onclick = () => onSkip?.();
    if (reduce) nextB.hidden = false; (reduce ? nextB : skipB).focus({ preventScroll: true });
    const showCard = (h, p) => { card.hidden = false; card.querySelector('h2').textContent = h; card.querySelector('p').textContent = p; };
    return {
      title() { card.classList.remove('end'); subEl.hidden = true; showCard(title, credit); cap.textContent = ''; panel.dataset.fmShot = 'title'; ctx.say(title); if (reduce) nextB.textContent = 'Start the film ➜'; },
      shot(i, shot, set) {
        card.hidden = true; panel.dataset.fmShot = String(i); const c = capOf ? capOf(i, shot) : null;
        cap.innerHTML = `<b>${esc(shotCount(i, total))}</b> ${esc(c?.cap ?? caption(shot, set))}`;
        subEl.hidden = !c?.sub; subEl.innerHTML = c?.sub ? esc(c.sub).replace(/\n/g, '<br>') : ''; if (c?.say) ctx.say(c.say); if (reduce) nextB.textContent = i === total - 1 ? 'End of the film ➜' : 'Next shot ➜'; },
      end() { subEl.hidden = true; showCard(THE_END, title); card.classList.add('end'); cap.textContent = ''; panel.dataset.fmShot = 'end'; if (reduce) nextB.textContent = back; skipB.hidden = true; if (reduce) nextB.focus({ preventScroll: true }); },
      dark(on) { panel.classList.toggle('dark', !!on); },
      set onNext(fn) { onNext = fn; }, set onSkip(fn) { onSkip = fn; },
      close() { clear(); talkBox.hidden = false; },
    };
  }

  function off() { clear(); removeEventListener('resize', measure); removeEventListener('keydown', onKey, true); removeEventListener('keyup', onKey, true); root.removeEventListener('wheel', stopWheel); }
  return { talk, choose, board, film, setStage, off };
}

const M = '#module[data-module="film"]';
export const CSS = `
${M} .fm-shield { position: absolute; inset: 0; touch-action: none; }
${M} .fm-root { font-size: 16px; }
${M} .fm-root.fm-large { font-size: 19px; }
${M} button { font-family: Inter, system-ui, sans-serif; }
${M} button:focus-visible { outline: 3px solid #1f6fd0; outline-offset: 2px; }
${M} h2, ${M} h3 { font-family: Bricolage, Inter, system-ui, sans-serif; margin: 0; color: #3b2a1e; }
${M} .fm-talk { position: absolute; top: 12px; left: 208px; right: 12px; max-width: 800px; z-index: 3; background: #fffaf0; border-radius: 16px; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; padding: 9px 14px; display: flex; align-items: baseline; gap: 10px; min-height: 44px; box-sizing: border-box; }
${M} .fm-talk[hidden] { display: none; }
${M} .fm-talk b { color: #b3541e; font-weight: 800; flex: none; }
${M} .fm-talk p { margin: 0; font-size: 1.05em; line-height: 1.35; font-weight: 600; }
${M} .fm-btn { min-height: 46px; padding: 8px 18px; border: 0; border-radius: 14px; background: #f3e6cc; color: #3b2a1e; font-weight: 800; font-size: 1em; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; cursor: pointer; }
${M} .fm-btn.go { background: #2e9b5a; color: #fff; box-shadow: inset 0 0 0 2px #1f7442, 0 3px 0 #17592f; }
${M} .fm-btn.big { font-size: 1.15em; min-height: 54px; padding: 10px 24px; }
${M} .fm-btn.small { min-height: 40px; padding: 4px 12px; font-size: .9em; }
${M} .fm-btn:disabled { background: #e4ddd0; color: #6d6257; box-shadow: inset 0 0 0 2px #c9bfae; cursor: default; }
${M} .fm-btn[hidden] { display: none; }
${M} .fm-btn:active:not(:disabled), ${M} .fm-tile:active, ${M} .fm-fbt:active { transform: translateY(2px); }
${M} .fm-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 12px; }

${M} .fm-brief { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); width: min(860px, calc(100% - 24px)); max-height: calc(100% - 100px); overflow: auto; box-sizing: border-box; background: #fffaf0; border-radius: 20px; padding: 14px 16px 16px; box-shadow: inset 0 0 0 2px #b08a55, 0 5px 0 #7a5a33; }
${M} .fm-briefhead { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
${M} .fm-briefhead h2 { font-size: 1.5em; font-weight: 800; }
${M} .fm-dots { display: inline-flex; gap: 5px; flex: none; }
${M} .fm-dots i { width: 14px; height: 14px; border-radius: 50%; background: #e6d3b0; box-shadow: inset 0 0 0 2px #b08a55; }
${M} .fm-dots i.on { background: #b3541e; box-shadow: inset 0 0 0 2px #7a3a14; }
${M} .fm-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
${M} .fm-tiles:has(> :nth-child(4):last-child) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
${M} .fm-tile { position: relative; display: flex; align-items: center; gap: 10px; min-height: 66px; padding: 8px 12px; border: 0; border-radius: 16px; background: #f3e6cc; color: #3b2a1e; font-weight: 800; font-size: 1.05em; text-align: left; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; cursor: pointer; flex-wrap: wrap; }
${M} .fm-tile .fm-ico { font-size: 1.9em; line-height: 1; flex: none; }
${M} .fm-tile .fm-lab { flex: 1 1 60%; min-width: 0; }
${M} .fm-tile.picked { background: #ffe08a; box-shadow: inset 0 0 0 4px #b3541e, 0 4px 0 #7a5a33; }
${M} .fm-tile.off { background: #ece6da; color: #5e554b; box-shadow: inset 0 0 0 2px #c9bfae, 0 4px 0 #b3a994; }
${M} .fm-tile.off .fm-ico { filter: grayscale(1); }
${M} .fm-tile small { flex: 1 1 100%; font-size: .78em; font-weight: 700; color: #8a3a14; }
${M} .fm-tile small[hidden] { display: none; }

${M} .fm-board { position: absolute; left: 12px; right: 12px; bottom: 12px; max-height: calc(100% - 84px); overflow: auto; box-sizing: border-box; background: #f6ecd6; border-radius: 20px; padding: 12px 14px 14px; box-shadow: inset 0 0 0 2px #b08a55, 0 5px 0 #7a5a33; }
${M} .fm-head { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-bottom: 10px; }
${M} .fm-head h2 { font-size: 1.35em; font-weight: 800; margin-right: 4px; }
${M} .fm-chip { display: inline-flex; align-items: center; gap: 6px; background: #fffaf0; border-radius: 999px; padding: 4px 12px; font-size: .88em; font-weight: 700; box-shadow: inset 0 0 0 2px #d9c39a; }
${M} .fm-chip.changed { box-shadow: inset 0 0 0 3px #b3541e; background: #fff1d6; }
${M} .fm-frames { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(var(--fm-cols, 6), minmax(0, 1fr)); gap: 10px; }
${M} .fm-shot { display: flex; flex-direction: column; gap: 1px; min-width: 0; background: #fffaf0; border-radius: 12px; padding: 6px 6px 7px; box-shadow: inset 0 0 0 2px #d9c39a; }
${M} .fm-shot.new { box-shadow: inset 0 0 0 3px #2e9b5a; background: #eefaf0; }
${M} .fm-shot.moved { box-shadow: inset 0 0 0 3px #1f6fd0; background: #edf4fd; }
${M} .fm-shot.changed { box-shadow: inset 0 0 0 3px #b3541e; background: #fff1d6; }
${M} .fm-gone { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
${M} .fm-gone .fm-tag { position: static; display: inline-block; padding: 2px 10px; }
${M} .fm-ghost { display: flex; align-items: center; gap: 7px; padding: 3px 10px 3px 4px; border-radius: 10px; outline: 2px dashed #a2978a; outline-offset: -2px; background: #ece6da; color: #5e554b; font-size: .84em; font-weight: 700; }
${M} .fm-ghost svg { width: 54px; height: auto; border-radius: 5px; filter: grayscale(1); opacity: .6; flex: none; display: block; }
${M} .fm-ghost span { text-decoration: line-through; }
${M} .fm-pic { position: relative; border-radius: 7px; overflow: hidden; box-shadow: 0 0 0 2px #3b2a1e; margin-bottom: 5px; }
${M} .fm-pic svg { display: block; width: 100%; height: auto; }
${M} .fm-num { position: absolute; left: 4px; top: 4px; min-width: 24px; height: 24px; border-radius: 50%; background: #3b2a1e; color: #fff; font-weight: 800; font-size: .85em; display: grid; place-items: center; }
${M} .fm-capt { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
${M} .fm-capt i { font-style: normal; font-size: .78em; font-weight: 800; color: #5e4936; flex: none; }
${M} .fm-tag { position: absolute; right: 4px; top: 4px; border-radius: 999px; padding: 1px 9px; font-size: .78em; font-weight: 800; font-style: normal; color: #fff; background: #2e9b5a; }
${M} .fm-tag.moved { background: #1f6fd0; } ${M} .fm-tag.changed { background: #b3541e; } ${M} .fm-tag.gone { background: #5e554b; }
${M} .fm-chip .fm-tag { position: static; }
${M} .fm-shot b { font-size: .92em; font-weight: 800; line-height: 1.2; }
${M} .fm-shot > span { font-size: .82em; line-height: 1.2; color: #5e4936; font-weight: 600; overflow-wrap: anywhere; }
${M} .fm-move { display: flex; gap: 6px; margin-top: 5px; }
${M} .fm-move button { flex: 1; min-height: 40px; border: 0; border-radius: 10px; background: #f3e6cc; color: #3b2a1e; font-weight: 800; box-shadow: inset 0 0 0 2px #b08a55; cursor: pointer; }
${M} .fm-move button:disabled { color: #a79d90; box-shadow: inset 0 0 0 2px #d8cfc0; background: #efe9dd; cursor: default; }
${M} .fm-lower { display: flex; align-items: flex-end; gap: 14px; margin-top: 12px; }
${M} .fm-fb { flex: 1; min-width: 0; }
${M} .fm-fb h3 { font-size: 1.05em; font-weight: 800; margin-bottom: 7px; }
${M} .fm-fbtiles { display: flex; flex-wrap: wrap; gap: 8px; }
${M} .fm-fbt { min-height: 46px; padding: 6px 13px; border: 0; border-radius: 13px; background: #e3effb; color: #3b2a1e; font-weight: 800; font-size: .98em; box-shadow: inset 0 0 0 2px #7fb0e6, 0 3px 0 #5b8dc4; cursor: pointer; }
${M} .fm-hint { flex: 1; margin: 0; font-weight: 600; color: #5e4936; align-self: center; }
${M} .fm-acts { display: flex; flex-direction: column; gap: 8px; flex: none; }

${M} .fm-film { position: absolute; inset: 0; pointer-events: none; }
${M} .fm-film > * { pointer-events: none; }
${M} .fm-bar { position: absolute; left: 0; right: 0; background: #17110c; }
${M} .fm-bar.top { top: 0; height: 68px; }
${M} .fm-bar.bottom { bottom: 0; min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; box-sizing: border-box; pointer-events: auto; }
${M} .fm-cap { margin: 0; color: #fff6e0; font-weight: 600; font-size: 1.05em; }
${M} .fm-cap b { display: inline-block; margin-right: 8px; padding: 2px 10px; border-radius: 999px; background: #fff6e0; color: #17110c; font-weight: 800; font-size: .88em; }
${M} .fm-filmbtns { display: flex; gap: 10px; flex: none; }
${M} .fm-dark { position: absolute; inset: 0; background: #17110c; opacity: 0; transition: opacity .16s linear; }
${M} .fm-film.dark .fm-dark { opacity: 1; }
${M} .fm-still .fm-dark { transition: none; }
${M} .fm-card { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(620px, calc(100% - 40px)); box-sizing: border-box; text-align: center; background: #fffaf0; border-radius: 22px; padding: 22px 26px 24px; box-shadow: inset 0 0 0 3px #b08a55, 0 6px 0 #7a5a33, 0 0 0 8px rgba(23, 17, 12, .35); }
${M} .fm-card[hidden] { display: none; }
${M} .fm-sub { position: absolute; left: 50%; bottom: 100px; transform: translateX(-50%); width: max-content; max-width: min(760px, calc(100% - 32px)); margin: 0; padding: 6px 14px; background: #000; color: #fff; font-size: 1.35em; font-weight: 700; line-height: 1.3; text-align: center; border-radius: 6px; }
${M} .fm-sub[hidden] { display: none; }
${M} .fm-card.end { top: auto; bottom: 96px; transform: translateX(-50%); width: min(460px, calc(100% - 40px)); padding: 12px 20px 14px; }
${M} .fm-card.end .fm-clap { display: none; }
${M} .fm-card.end h2 { font-size: 1.7em; }
${M} .fm-card .fm-clap { font-size: 2em; }
${M} .fm-card h2 { font-size: 2.3em; font-weight: 800; line-height: 1.1; margin: 4px 0 8px; }
${M} .fm-card p { margin: 0; font-weight: 700; color: #5e4936; }
@media (max-width: 900px) {
  ${M} .fm-frames { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  ${M} .fm-lower { flex-direction: column; align-items: stretch; }
  ${M} .fm-acts { flex-direction: row; flex-wrap: wrap; } ${M} .fm-acts .fm-btn { flex: 1 1 auto; }
}
@media (max-width: 620px) {
  ${M} .fm-frames { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  ${M} .fm-tiles, ${M} .fm-tiles:has(> :nth-child(4):last-child) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  ${M} .fm-talk { left: 12px; top: 64px; }
  ${M} .fm-bar.bottom { flex-direction: column; align-items: stretch; }
}
`;
