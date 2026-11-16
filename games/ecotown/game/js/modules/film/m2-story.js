// Mission 2, storyboarding: put shot cards in order so the story has a beginning, a middle and an end.
// Pure: the stories, the check and Florence's words. A story is told in beats, and a card's beat says where it can go:
//   where (beginning: where we are) → who (beginning: who it is about) → problem (middle: what goes wrong)
//   → act (middle: what they do about it) → end (how it turns out).
// Several cards may share a beat; then either order is right. A spare card (ages 13–17) belongs to no beat.
import { placeOf } from './kit.js';
import { num } from './hour.js';

export const BEATS = ['where', 'who', 'problem', 'act', 'end'];
export const PART_OF = { where: 'beginning', who: 'beginning', problem: 'middle', act: 'middle', end: 'end' };

// card: art (the drawing), beat, size (the shot size its drawing and its filmed shot really are, in mission 1's
// words), words. shot: what Florence films in the town for that card ([move, what]): a Close-up is filmed with
// mission 1's close-up framing (cw-close), a Medium with its medium framing (cw-medium), a Wide from far off.
// after: a card that must come later than another with the same beat (you cannot clean a river before netting it).
export const STORIES = [
  { id: 'wind', title: 'The windy night', cards: [
    { id: 'w1', art: 'w-where', beat: 'where', size: 'Wide', words: 'The island at sunset', shot: ['wide', 'town'] },
    { id: 'w2', art: 'w-dark', beat: 'problem', size: 'Wide', words: 'Night falls, and the lights go out', shot: ['push', 'homes'] },
    { id: 'w3', art: 'w-wind', beat: 'act', size: 'Medium', words: 'The wind blows and the turbine spins', shot: ['cw-medium', 'wind'] },
    { id: 'w4', art: 'w-lit', beat: 'end', size: 'Wide', words: 'Every window lights up again', shot: ['pull', 'homes'] },
  ] },
  { id: 'ball', title: 'The lost ball', cards: [
    { id: 'b1', art: 'b-park', beat: 'where', size: 'Wide', words: 'The park on a sunny day', shot: ['wide', 'park'] },
    { id: 'b2', art: 'b-family', beat: 'who', size: 'Medium', words: 'Two friends play with a ball', shot: ['cw-medium', 'family'] },
    { id: 'b3', art: 'b-river', beat: 'problem', size: 'Close-up', words: 'The ball rolls into the river', shot: ['cw-close', 'river'] },
    { id: 'b4', art: 'b-net', beat: 'act', size: 'Medium', words: 'Florence comes to fish it out', shot: ['cw-medium', 'florence'] },
    { id: 'b5', art: 'b-smile', beat: 'end', size: 'Close-up', words: 'A big smile: the ball is back', shot: ['cw-close', 'family'] },
  ] },
  { id: 'market', title: 'Market day', cards: [
    { id: 'm1', art: 'm-dawn', beat: 'where', size: 'Wide', words: 'The town at dawn', shot: ['wide', 'town'] },
    { id: 'm2', art: 'm-setup', beat: 'who', size: 'Medium', words: 'A stall keeper sets up', shot: ['cw-medium', 'market'] },
    { id: 'm3', art: 'm-clouds', beat: 'problem', size: 'Wide', words: 'Dark clouds roll in', shot: ['glide', 'town'] },
    { id: 'm4', art: 'm-cover', beat: 'act', size: 'Medium', words: 'They pull covers over the stalls', shot: ['cw-medium', 'market'] },
    { id: 'm5', art: 'm-sun', beat: 'end', size: 'Wide', words: 'The sun comes out and the market is busy', shot: ['pull', 'market'] },
  ], spares: [{ id: 'm9', art: 'm-gull', beat: null, size: 'Close-up', words: 'A seagull on the ferry dock', shot: ['cw-close', 'dock'] }] },
  // ages 13–17 only: six cards, two of them in the middle that must stay in order, and two spare cards
  { id: 'otters', title: 'The otters come home', senior: true, cards: [
    { id: 'o1', art: 'river-evening', beat: 'where', size: 'Wide', words: 'The river at evening', shot: ['wide', 'town'] },
    { id: 'o2', art: 'o-peek', beat: 'who', size: 'Close-up', words: 'An otter peeks out of the water', shot: ['cw-close', 'otters'] },
    { id: 'o3', art: 'o-litter', beat: 'problem', size: 'Wide', words: 'Litter floats down the river', shot: ['push', 'river'] },
    { id: 'o4', art: 'b-net', beat: 'act', size: 'Medium', words: 'Florence clears the litter', shot: ['cw-medium', 'florence'] },
    { id: 'o5', art: 'o-clean', beat: 'act', after: 'o4', size: 'Wide', words: 'The river runs clean again', shot: ['push', 'river'] },
    { id: 'o6', art: 'otters', beat: 'end', size: 'Medium', words: 'Two otters swim home', shot: ['cw-medium', 'otters'] },
  ], spares: [{ id: 'o8', art: 'm-gull', beat: null, size: 'Close-up', words: 'A seagull on the ferry dock', shot: ['cw-close', 'dock'] },
    { id: 'o9', art: 'homes-evening', beat: null, size: 'Wide', words: 'The homes at evening', shot: ['push', 'homes'] }] },
];
// The stories a route plays: ages 8–12 the first three, ages 13–17 all four.
export const storiesFor = (senior) => STORIES.filter((s) => senior || !s.senior);
// The move each shot size is filmed with (mission 1's framings), for the unit test that keeps labels honest
export const SIZE_MOVES = { 'Close-up': ['cw-close'], Medium: ['cw-medium'], Wide: ['wide', 'push', 'pull', 'glide', 'cw-wide'] };
export const cardWords = (c) => `${c.size}: ${c.words}`;

// The cards in a shuffled order that is never already right (a fixed shuffle, so a replay is the same puzzle).
export function dealt(story, senior) {
  const cards = [...story.cards, ...(senior && story.spares ? story.spares : [])];
  const order = [2, 0, 3, 6, 1, 5, 7, 4].filter((i) => i < cards.length); const out = order.map((i) => cards[i]);
  for (let i = 0; i < cards.length; i++) if (!out.includes(cards[i])) out.push(cards[i]);
  return out;
}
export const slotsFor = (story) => story.cards.length;

// Check an order (a list of cards, one a slot). Returns { ok, code, at, say }: the first problem, in story words.
// It points at the problem without placing the card for the child.
export function checkOrder(story, placed) {
  const n = slotsFor(story); if (placed.length < n || placed.some((c) => !c)) return { ok: false, code: 'empty', say: 'Fill every box first.' };
  const spare = placed.findIndex((c) => !c.beat); if (spare >= 0) return { ok: false, code: 'spare', at: spare, say: `Box ${spare + 1} does not help this story. Is there a card the story does not need?` };
  const rank = (c) => BEATS.indexOf(c.beat);
  if (placed[0].beat !== 'where') return { ok: false, code: 'start', at: 0, say: 'A film usually starts by showing where we are. Which card shows the place?' };
  if (placed[n - 1].beat !== 'end') return { ok: false, code: 'end', at: n - 1, say: 'The last shot shows how it all turns out. Which card is the ending?' };
  for (let i = 1; i < n; i++) {
    const a = placed[i - 1], b = placed[i]; if (rank(a) <= rank(b)) continue;
    if (b.beat === 'who') return { ok: false, code: 'who', at: i, say: `We need to meet who the story is about before anything happens to them. Look at box ${i + 1}.` };
    if (b.beat === 'problem' && a.beat === 'act') return { ok: false, code: 'problem', at: i, say: `In box ${i}, they fix a problem before it has happened. What goes wrong first?` };
    return { ok: false, code: 'order', at: i, say: `Boxes ${i} and ${i + 1} are the wrong way round for the story. Which happens first?` };
  }
  // two cards with the same beat that still have an order (netting the litter comes before a clean river)
  for (let i = 0; i < n; i++) { const c = placed[i]; if (!c.after) continue; const j = placed.findIndex((x) => x.id === c.after); if (j > i) return { ok: false, code: 'after', at: i, say: `Box ${i + 1} shows how things are after something that has not happened yet. Look at the middle again.` }; }
  return { ok: true, code: 'ok', say: 'That tells the story. The beginning shows where and who, the middle has the problem and what they do, and the end shows how it turns out.' };
}

// Ages 13–17: the film's length and how it divides. Each card is one shot of SHOT_SECS seconds.
export const SHOT_SECS = 3;
export function splitLine(story) {
  const parts = { beginning: 0, middle: 0, end: 0 }; for (const c of story.cards) parts[PART_OF[c.beat]]++;
  const t = story.cards.length * SHOT_SECS; const pc = (k) => Math.round(parts[k] / story.cards.length * 100);
  return `${story.cards.length} shots of ${SHOT_SECS} s: a ${t}-second film. Beginning ${pc('beginning')}%, middle ${pc('middle')}%, end ${pc('end')}%.`;
}

// What Florence films in the town for each card: the place or person the card needs, or the nearest thing there is.
const FALLBACK = { homes: ['homes', 'hall', 'market'], wind: ['wind', 'homes', 'ailab'], park: ['park', 'orchard', 'wood'], market: ['market', 'festival', 'hall', 'ailab'], river: ['river', 'crossing', 'bridge'], dock: ['dock', 'river'] };
export function shotOf(card, set) {
  const [move, what] = card.shot;
  if (what === 'town') return { move, sub: 'town' };
  if (what === 'florence') return { move, sub: 'who:florence' };
  // someone who is not in this town: Florence stands in for the family; the river stands in for the otters
  if (what === 'family') return { move, sub: set.who.family.here ? 'who:family' : 'who:florence' };
  if (what === 'otters' && set.who.otters.here) return { move, sub: 'who:otters' };
  if (what === 'otters') return { move, sub: `place:${(FALLBACK.river.find((p) => placeOf(set, p)) || set.offer[0])}` };
  const id = (FALLBACK[what] || [what]).find((p) => placeOf(set, p)) || set.offer[0];
  return { move, sub: `place:${id}` };
}
export const storyCut = (story, order, set) => ({ n: 1, mood: story.id === 'wind' ? 'calm' : 'cheerful', shots: order.map((c, i) => ({ id: 's' + (i + 1), ...shotOf(c, set), secs: SHOT_SECS + 0.5 })), tags: {}, gone: [], moodWas: null, dirty: false, next: order.length + 1 });

export const storyIntro = (story, i, senior) => `Story ${i + 1} of ${storiesFor(senior).length}: “${story.title}”. ${i === 0 ? 'Tap a card to put it in the next empty box. Tap a placed card to take it out.' : 'Put the cards in order.'}${senior && story.spares ? (story.spares.length > 1 ? ` ${story.spares.length === 2 ? 'Two cards do' : 'Some cards do'} not belong in this story: leave them out.` : ' One card does not belong in this story: leave it out.') : ''}`;
export const storyLines = (r) => [`You put ${num(r.stories)} stories in order${r.spare ? ', and left out the cards that did not belong' : ''}.`, 'Each one has a beginning, a middle and an end.'];
