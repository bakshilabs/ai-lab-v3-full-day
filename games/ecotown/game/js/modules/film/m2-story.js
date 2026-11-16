// Mission 2, storyboarding: put shot cards in order so the story has a beginning, a middle and an end.
// Pure: the stories, the check and Florence's words. A story is told in beats, and a card's beat says where it can go:
//   where (beginning: where we are) → who (beginning: who it is about) → problem (middle: what goes wrong)
//   → act (middle: what they do about it) → end (how it turns out).
// Several cards may share a beat; then either order is right. A spare card (ages 13–17) belongs to no beat.
import { placeOf } from './kit.js';

export const BEATS = ['where', 'who', 'problem', 'act', 'end'];
export const PART_OF = { where: 'beginning', who: 'beginning', problem: 'middle', act: 'middle', end: 'end' };

// card: [art id, beat, size, words]. shot: what Florence films in the town for that card ([move, what]).
export const STORIES = [
  { id: 'wind', title: 'The windy night', cards: [
    { id: 'w1', art: 'w-where', beat: 'where', size: 'Wide', words: 'The island at sunset', shot: ['wide', 'town'] },
    { id: 'w2', art: 'w-dark', beat: 'problem', size: 'Medium', words: 'Night falls, and the lights go out', shot: ['push', 'homes'] },
    { id: 'w3', art: 'w-wind', beat: 'act', size: 'Medium', words: 'The wind blows and the turbine spins', shot: ['rise', 'wind'] },
    { id: 'w4', art: 'w-lit', beat: 'end', size: 'Wide', words: 'Every window lights up again', shot: ['pull', 'homes'] },
  ] },
  { id: 'ball', title: 'The lost ball', cards: [
    { id: 'b1', art: 'b-park', beat: 'where', size: 'Wide', words: 'The park on a sunny day', shot: ['wide', 'park'] },
    { id: 'b2', art: 'b-family', beat: 'who', size: 'Medium', words: 'A family plays with a ball', shot: ['close', 'family'] },
    { id: 'b3', art: 'b-river', beat: 'problem', size: 'Close-up', words: 'The ball rolls into the river', shot: ['push', 'river'] },
    { id: 'b4', art: 'b-net', beat: 'act', size: 'Medium', words: 'Florence fishes it out with a net', shot: ['close', 'florence'] },
    { id: 'b5', art: 'b-smile', beat: 'end', size: 'Close-up', words: 'A big smile: the ball is back', shot: ['orbit', 'park'] },
  ] },
  { id: 'market', title: 'Market day', cards: [
    { id: 'm1', art: 'm-dawn', beat: 'where', size: 'Wide', words: 'The town at dawn', shot: ['wide', 'town'] },
    { id: 'm2', art: 'm-setup', beat: 'who', size: 'Medium', words: 'The stall keepers set up', shot: ['street', 'market'] },
    { id: 'm3', art: 'm-clouds', beat: 'problem', size: 'Wide', words: 'Dark clouds roll in', shot: ['glide', 'town'] },
    { id: 'm4', art: 'm-cover', beat: 'act', size: 'Medium', words: 'They pull covers over the stalls', shot: ['push', 'market'] },
    { id: 'm5', art: 'm-sun', beat: 'end', size: 'Wide', words: 'The sun comes out and the market is busy', shot: ['pull', 'market'] },
  ], spare: { id: 'm9', art: 'm-gull', beat: null, size: 'Close-up', words: 'A seagull on the ferry dock', shot: ['close', 'dock'] } },
];
export const cardWords = (c) => `${c.size}: ${c.words}`;

// The cards in a shuffled order that is never already right (a fixed shuffle, so a replay is the same puzzle).
export function dealt(story, senior) {
  const cards = [...story.cards, ...(senior && story.spare ? [story.spare] : [])];
  const order = [2, 0, 3, 1, 5, 4].filter((i) => i < cards.length); const out = order.map((i) => cards[i]);
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
  if (what === 'family') return set.who.family.here ? { move, sub: 'who:family' } : { move: 'close', sub: 'who:florence' };
  const id = (FALLBACK[what] || [what]).find((p) => placeOf(set, p)) || set.offer[0];
  return { move, sub: `place:${id}` };
}
export const storyCut = (story, order, set) => ({ n: 1, mood: story.id === 'wind' ? 'calm' : 'cheerful', shots: order.map((c, i) => ({ id: 's' + (i + 1), ...shotOf(c, set), secs: SHOT_SECS + 0.5 })), tags: {}, gone: [], moodWas: null, dirty: false, next: order.length + 1 });

export const storyIntro = (story, i, senior) => `Story ${i + 1} of 3: “${story.title}”. ${i === 0 ? 'Tap a card to put it in the next empty box. Tap a placed card to take it out.' : 'Put the cards in order.'}${senior && story.spare ? ' One card does not belong in this story: leave it out.' : ''}`;
export const storyLines = (r) => [`You put ${r.stories} stories in order${r.spare ? ' and left out the card that did not belong' : ''}.`, `${r.first} of them were right at the first check.`];
