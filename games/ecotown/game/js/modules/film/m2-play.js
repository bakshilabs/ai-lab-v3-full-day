// Mission 2, storyboarding: the child puts drawn shot cards in order (tap a card, it goes in the next empty box),
// Florence checks the story, and the storyboard is filmed in the child's town. Browser only; rules in m2-story.js.
import { STORIES, dealt, slotsFor, checkOrder, cardWords, splitLine, storyCut, storyIntro, storyLines } from './m2-story.js';
import { storyPic } from './art.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function playStory(env) {
  const { ctx, ui, mui, player, set, junior } = env; const r = { stories: 0, first: 0, spare: false }; let carry = '';
  player.setMood('cheerful'); player.look({ move: 'wide', sub: 'town' });
  for (let si = 0; si < STORIES.length; si++) {
    const story = STORIES[si]; const pool = dealt(story, !junior); const n = slotsFor(story); const slots = Array(n).fill(null);
    let checks = 0; let solved = false; const said = (carry ? carry + ' ' : '') + storyIntro(story, si, !junior); carry = '';
    ctx.report({ stage: `Storyboard: ${story.title}` });
    await new Promise((done) => {
      const draw = (focusSel) => {
        const inSlot = new Set(slots.filter(Boolean).map((c) => c.id));
        const card = (c, where, i) => `<button type="button" class="fm-scard" data-fm-card="${c.id}" data-where="${where}" aria-label="${esc(cardWords(c))}${where === 'slot' ? `. In box ${i + 1}. Press to take it out.` : '. Press to put it in the next empty box.'}" ${solved ? 'disabled' : ''}>${storyPic(c.art)}<span>${esc(cardWords(c))}</span></button>`;
        const p = mui.custom(`<section class="fm-m fm-story" data-fm-story="${story.id}" aria-label="Storyboard: ${esc(story.title)}">
          <div class="fm-qhead"><span class="fm-dots" aria-label="Story ${si + 1} of 3">${[0, 1, 2].map((k) => `<i class="${k <= si ? 'on' : ''}"></i>`).join('')}</span><span class="fm-kick">Storyboard</span></div>
          <h2>“${esc(story.title)}”</h2>
          <ol class="fm-slots" style="--fm-n:${n}">${slots.map((c, i) => `<li><b class="fm-part" aria-hidden="true">${i === 0 ? 'Beginning' : i === n - 1 ? 'End' : i === 1 && n > 4 ? 'Beginning' : 'Middle'}</b>${c ? card(c, 'slot', i) : `<span class="fm-empty">Box ${i + 1}</span>`}</li>`).join('')}</ol>
          <div class="fm-pool" aria-label="Cards to place">${pool.filter((c) => !inSlot.has(c.id)).map((c) => card(c, 'pool')).join('') || '<p class="fm-hint">All the boxes are full.</p>'}</div>
          ${solved && !junior ? `<p class="fm-more">${esc(splitLine(story))}</p>` : ''}
          <div class="fm-row end">${solved ? '<button type="button" class="fm-btn go big" data-fm-watch>▶ Film it in my town</button>' : `<button type="button" class="fm-btn go big" data-fm-check ${slots.every(Boolean) ? '' : 'disabled'}>Check the story</button>`}</div>
        </section>`, 'story');
        (focusSel && p.querySelector(focusSel) || p.querySelector('[data-fm-card]:not(:disabled)') || p.querySelector('.fm-btn:not(:disabled)'))?.focus({ preventScroll: true });
        p.onclick = (e) => {
          const b = e.target.closest('button'); if (!b || b.disabled) return;
          if (b.dataset.fmCard) {
            const id = b.dataset.fmCard; const at = slots.findIndex((c) => c?.id === id);
            if (at >= 0) slots[at] = null; else { const free = slots.indexOf(null); if (free < 0) { ui.talk('All the boxes are full. Tap a card in a box to take it out first.'); return; } slots[free] = pool.find((c) => c.id === id); }
            draw(slots.every(Boolean) ? '[data-fm-check]' : null); return;
          }
          if (b.dataset.fmCheck !== undefined) {
            checks++; const res = checkOrder(story, slots); ui.talk(res.say);
            if (res.ok) { solved = true; if (checks === 1) r.first++; if (story.spare) r.spare = !junior; draw('[data-fm-watch]'); }
            return;
          }
          if (b.dataset.fmWatch !== undefined) { mui.clear(); done(); }
        };
      };
      draw(); ui.talk(said);
    });
    // the storyboard, filmed in the child's own town
    const cut = storyCut(story, slots, set);
    const f = ui.film({ title: story.title, total: cut.shots.length, credit: 'A storyboard, filmed in your town', skip: 'Skip the film', back: 'Next ➜', capOf: (i) => ({ cap: cardWords(slots[i]) }) });
    await player.play(cut, { title: () => f.title(), shot: (k, s) => f.shot(k, s, set), end: () => f.end(), dark: (on) => f.dark(on), set onNext(fn) { f.onNext = fn; }, set onSkip(fn) { f.onSkip = fn; } });
    f.close(); r.stories++; player.setMood('cheerful'); player.look({ move: 'wide', sub: 'town' });
    if (si < STORIES.length - 1) carry = 'That was your plan, filmed in your town. Your town has its own places, so some shots look different from the drawings.';
  }
  return { res: r, lines: storyLines(r) };
}
