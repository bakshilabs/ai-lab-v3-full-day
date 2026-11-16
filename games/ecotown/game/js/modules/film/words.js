// Town film studio: every word Florence says and every label, built from fixed lines and the child's choices.
// Pure: no page, no 3D. Nothing is typed anywhere, and Florence writes no free text.
import { MOVES, WHO, moodOf, placeOf, subjectLabel } from './kit.js';
import { FEEDBACK, feedbackOf, cutSecs } from './cut.js';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const list = (a) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1]);
const NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
export const count = (n, one, many = one + 's') => `${NUM[n] ?? n} ${n === 1 ? one : many}`;
export const secsWord = (s) => `${Math.round(s)} seconds`;

// ---- the storyboard
export const moveName = (move) => MOVES[move]?.name || 'Shot';
// "Push in · the market square". A pull-back starts at a place and ends on the whole town.
export const caption = (shot, set) => (shot.move === 'pull' ? `${moveName('pull')} · ${subjectLabel(shot.sub, set)} to the whole town` : `${moveName(shot.move)} · ${subjectLabel(shot.sub, set)}`);
export const subjectLine = (shot, set) => (shot.move === 'pull' ? 'out to the whole town' : subjectLabel(shot.sub, set));
// What the camera does in this shot, as one sentence for a screen reader or the film's caption.
export const shotSentence = (shot, set) => (shot.move === 'pull' ? `The camera starts at ${subjectLabel(shot.sub, set)} and pulls back to show the whole town.` : `${cap(subjectLabel(shot.sub, set))}: the camera ${MOVES[shot.move].does}.`);
export const TAG = { new: 'New', moved: 'Moved', changed: 'Changed', gone: 'Cut' };
export const tagMeans = { new: 'a new shot', moved: 'moved to a new place in the film', changed: 'made longer or shorter', gone: 'cut from the film' };
export const cutName = (n) => (n === 1 ? 'First cut' : `Cut ${n}`);
// Mission 1's crew words for Florence's moves: a push in and a pull back are tracks in and out, a street pass is a track
export const CREW_LINE = 'In crew words: Push in, Pull back and Street pass are tracks; Circle round is a track in an arc; Rise up is a crane shot.';
export const cutFacts = (cut) => `${count(cut.shots.length, 'shot')} · about ${secsWord(cutSecs(cut))}`;
export const musicLine = (cut) => { const m = moodOf(cut.mood); return `${m.icon} ${cap(m.tune)}, ${m.light}`; };

// ---- the brief: three questions, one screen each
export const STEPS = {
  place: { q: 'Where is your film set?', ask: (j) => (j ? 'You are the director. I work the camera. First, pick the place your film is about.' : 'You direct and I run the camera. First, choose the place the film is about.') },
  who:   { q: 'Who is in your film?', ask: () => 'Now pick who is in it. I can only film who is really in your town.' },
  mood:  { q: 'What is the mood?', ask: () => 'Last one. Pick a mood. It sets the music and the light.' },
};
export const placePicked = (p) => `${cap(p.label)}. I am pointing the camera at it now. Press Next, or pick another place.`;
export const whoPicked = (w) => (w === 'florence' ? 'Me? I would love to be in it. Press Next, or pick again.' : `${cap(WHO[w].label)}. I can see ${w === 'family' ? 'them by their home' : 'them in the river'}. Press Next, or pick again.`);
// The honest limit: Florence can only film what exists in the town. She says so and offers what is there.
export function whoMissing(w, offers) {
  const others = offers.filter((o) => o !== w).map((o) => (o === 'florence' ? 'me' : WHO[o].label));
  return `${WHO[w].missing} I can only film what is there. I can film ${list(others)} instead.`;
}
export const moodPicked = (m) => `${m.label}: ${m.tune} and ${m.light}. Press Next to see my first cut.`;
export const emptyTown = 'Your town is new, so I will use the island itself: the river, the old wood and the buildings that were here first.';

// ---- the cuts
export function firstCutLine(cut, set, brief) {
  return `Here is my first cut: ${count(cut.shots.length, 'shot')} of ${placeOf(set, brief.place)?.label || 'your town'}, with ${brief.who === 'florence' ? 'me' : WHO[brief.who].label}. Press Watch to see it.`;
}
export const welcomeBack = (cut) => `Welcome back. Here is your film so far: ${cutName(cut.n).toLowerCase()}, ${count(cut.shots.length, 'shot')}.`;
export const afterFirst = (j) => (j ? 'That was my first try. A first cut is never the best one. Tell me one thing to change.' : 'That was a first draft. Give me one piece of feedback and I will make a new cut.');
export const afterLater = (n) => `That was cut ${n}. The marked shots are what your feedback changed. Change something else, or finish with this film.`;
export const watchNew = 'Press Watch to see the new cut, or tell me something else to change first.';

// Florence's answer to one piece of feedback (the result of cut.js applyFeedback).
export function feedbackReply(r, set) {
  const lab = (shot) => caption(shot, set); const made = r.dropped ? ` A film holds six shots, so I cut “${lab(r.dropped)}” to make room.` : '';
  const who = r.who ? (r.who === 'florence' ? 'me' : WHO[r.who].the) : '';
  switch (r.code) {
    case 'shorter-cut': return `Shorter. I cut “${lab(r.shot)}”. The film is now ${count(r.cut.shots.length, 'shot')}.`;
    case 'shorter-trim': return `Shorter. It is down to three shots, so I trimmed each one. The film is now about ${secsWord(cutSecs(r.cut))}.`;
    case 'shorter-limit': return 'This is as short as a film can be: three quick shots. Any shorter and there is no story.';
    case 'school-new': return `Now the film starts at ${subjectLabel(r.shot.sub, set)}: a new first shot.${made}`;
    case 'school-moved': return `I moved the shot of ${subjectLabel(r.shot.sub, set)} to the start.`;
    case 'school-already': return 'The film already starts at the school. Nothing to change there.';
    case 'school-none': return 'I looked for a school to film. There is none on this island, so I cannot start there.';
    case 'who-new': return `I added a close-up of ${who} as shot ${r.number}.${made}`;
    case 'who-longer': return `${cap(who === 'me' ? 'I am' : who + ' are')} already in shot ${r.number}, so I made that shot longer.`;
    case 'who-already': return `Shot ${r.number} is already a long close-up of ${who}. Any longer and the film would drag.`;
    case 'who-missing': return whoMissing(r.who, r.offers);
    case 'town-new': return `Now the film ends by pulling back to show the whole town.${made}`;
    case 'town-already': return 'The film already ends on the whole town.';
    case 'music': { const m = moodOf(r.mood); return `${r.dir === 'calmer' ? 'Calmer' : 'Livelier'}: now it has ${m.tune} and ${m.light}.`; }
    case 'music-limit': return r.dir === 'calmer' ? 'That is the calmest music I have. I cannot go slower than this.' : 'That is the liveliest music I have. I cannot go faster than this.';
    default: return 'I did not change anything.';
  }
}
export const movedReply = (r, set) => `I moved “${caption(r.shot, set)}”. It is now shot ${r.number}.`;

// ---- the title. Ages 8–12: made from the place and the mood. Ages 13–17: chosen from these built-in titles.
const BY_MOOD = { calm: 'An evening at', curious: 'A morning at', cheerful: 'A day at', party: 'A big day at' };
export function titleChoices(brief, set, mood = brief.mood) {
  const place = placeOf(set, brief.place)?.label || 'the town';
  const who = brief.who === 'florence' ? 'Florence' : brief.who === 'otters' ? 'The otters' : 'A family';
  return [`${BY_MOOD[mood] || BY_MOOD.cheerful} ${place}`, cap(place), `${who} of Eco Town`, 'The town we built', 'Welcome to our island', 'A small town with a big idea'].map((t) => t.slice(0, 60));
}
export const filmTitle = (st, set) => { const all = titleChoices(st.brief, set, st.cut?.mood || st.brief.mood); return all[st.title] || all[0]; };

// ---- the film itself
export const CREDIT = 'Directed by a town planner · Camera by Florence';
export const THE_END = 'The end';
export const shotCount = (i, n) => `Shot ${i + 1} of ${n}`;

// ---- the take-home record
// Lines: the brief, the feedback given between cuts, and the film as it ended. Up to six lines of 120 characters.
export function recordLines(st, set) {
  const b = st.brief; const lines = [`The brief: ${placeOf(set, b.place)?.label || 'the town'}, with ${WHO[b.who].label}. Mood: ${moodOf(b.mood).label.toLowerCase()}.`];
  const byCut = new Map(); for (const l of st.log) { if (!byCut.has(l.n)) byCut.set(l.n, []); byCut.get(l.n).push(l.id === 'moved' ? 'moved a shot' : feedbackOf(l.id).short); }
  const cuts = [...byCut.entries()].sort((a, b2) => a[0] - b2[0]).map(([n, ids]) => `After cut ${n - 1}, asked for: ${[...new Set(ids)].join(', ')}.`);
  if (cuts.length > 3) lines.push(`${count(cuts.length - 2, 'earlier round')} of feedback before these.`, ...cuts.slice(-2)); else lines.push(...cuts);
  if (st.cant.length) lines.push(`Asked for ${st.cant.map((w) => WHO[w].label).join(' and ')}: not in the town, so Florence offered who was.`);
  lines.push(`The film: ${cutFacts(st.cut)}, ${moodOf(st.cut.mood).tune}.`);
  return lines.slice(0, 6).map((l) => l.slice(0, 120));
}
// "You practised …": two to four lines, built from what the child did.
export function practisedLines(st, junior) {
  const fb = st.log.filter((l) => l.id !== 'moved').length; const cuts = st.cut.n; const out = ['briefing a creative partner: a place, who is in it and a mood'];
  if (fb > 0) out.push(`improving a draft with ${count(fb, 'piece')} of feedback, over ${count(cuts, 'cut')}`);
  else out.push('watching a first cut and deciding what it needed');
  if (st.cant.length) out.push('changing the plan when the town did not have what you asked for');
  if (!junior && (st.moved || st.titled)) out.push(st.moved && st.titled ? 'putting the shots in order and choosing a title' : st.moved ? 'putting the shots in a better order' : 'choosing a title that fits the film');
  else if (fb > 0 && st.plays > 1) out.push('watching each new cut to see what your feedback changed');
  return out.slice(0, 4);
}
export const FEEDBACK_TILES = FEEDBACK;
