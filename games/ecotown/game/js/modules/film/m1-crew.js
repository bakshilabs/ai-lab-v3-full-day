// Mission 1, the film crew's language: shot sizes (wide, medium, close-up) and camera moves (pan, tilt, track).
// Pure: the questions, the answers and Florence's words. The camera itself is in camera.js (cw-* moves, pan, tilt, track).
// These are the words real crews use. Wide: the whole place and where it is. Medium: a person from the waist up.
// Close-up: a face or one small detail. Pan: the camera stays put and turns side to side. Tilt: it stays put and turns
// up or down. Track: the camera itself moves along beside what it films.
import { placeOf } from './kit.js';
import { num } from './hour.js';
import { poseFor, lensMm, PAN_DEG, TILT_DEG } from './camera.js';

export const SIZES = {
  wide:   { id: 'wide',   icon: '🏞️', label: 'Wide shot',   means: 'A wide shot shows the whole place and where it is.' },
  medium: { id: 'medium', icon: '🧍', label: 'Medium shot', means: 'A medium shot shows someone from the waist up, or one thing with a little around it.' },
  close:  { id: 'close',  icon: '🙂', label: 'Close-up',    means: 'A close-up shows a face or one small detail, so you can see feelings.' },
};
export const MOVES2 = {
  pan:   { id: 'pan',   icon: '↔️', label: 'Pan',   means: 'In a pan the camera stays in one spot and turns from side to side.' },
  tilt:  { id: 'tilt',  icon: '↕️', label: 'Tilt',  means: 'In a tilt the camera stays in one spot and turns up or down.' },
  track: { id: 'track', icon: '🛤️', label: 'Track', means: 'In a track the camera itself moves along beside what it films.' },
};
const ALL = { ...SIZES, ...MOVES2 };
const opts = (ids, why = (o) => `That would be a ${o.label.toLowerCase()}. ${o.means}`) => ids.map((id) => ({ id, icon: ALL[id].icon, label: ALL[id].label, why: why(ALL[id]) }));

// the tallest thing to tilt up: a wind turbine, the hall, the school, else the AI Lab
const TALL = ['wind', 'hall', 'school', 'wood', 'oldschool', 'ailab']; // Florence stands by the Lab and the old school: tilt elsewhere if we can
export const tallWords = (p) => (p.id === 'wood' ? 'the pine trees in the old wood are' : `${p.label} is`);
export const tallPlace = (set) => TALL.map((id) => placeOf(set, id)).find(Boolean) || set.places[0];
// a place with a street beside it for a sideways shot, the child's own builds first
export const streetPlace = (set) => set.places.find((p) => p.built && p.clear) || set.places.find((p) => p.clear) || set.places[0];

// Ages 13–17 get the numbers: the lens that would give the same picture on a real film camera, and how far it turns.
function sizeNumbers(shot, set) { const pose = poseFor(shot, set, 0.5); return `Lens: like a ${lensMm(pose.fov)} mm lens on a film camera. A longer lens, or standing closer, makes the shot tighter.`; }
function moveNumbers(id, shot, set) {
  if (id === 'pan') return `The camera turns about ${PAN_DEG}° from left to right. It does not move from its spot.`;
  if (id === 'tilt') return `The camera turns about ${TILT_DEG}° from low to high. It does not move from its spot.`;
  const a = poseFor(shot, set, 0).pos, b = poseFor(shot, set, 1).pos; const d = Math.round(Math.hypot(a[0] - b[0], a[2] - b[2]));
  return `The camera travels about ${Math.round(d / 6)} tiles down the river. It keeps the same ${lensMm(poseFor(shot, set, 0.5).fov)} mm lens all the way.`;
}

// ---- part 1: name the shot size. Florence films the same subject close, wide and in between.
export function sizeItems(set, junior) {
  const who = set.who.family.here ? 'family' : set.who.otters.here ? 'otters' : null;
  const list = [
    { size: 'close', shot: { move: 'cw-close', sub: 'who:florence' }, hint: 'How much of me can you see?' },
    { size: 'wide', shot: { move: 'cw-wide', sub: 'who:florence' }, hint: 'Look for me. How much of the place around me can you see?' },
    { size: 'medium', shot: { move: 'cw-medium', sub: 'who:florence' }, hint: 'Can you see my feet? My face? Something in between?' },
  ];
  if (who) list.push({ size: 'close', shot: { move: 'cw-close', sub: `who:${who}` }, hint: who === 'family' ? 'Look at the person in the middle. What fills the picture?' : 'What fills the picture: the whole river, or one otter?' });
  return list.map((x, i) => ({
    ...x, q: 'What size of shot is this?', say: i === 0 ? 'Look at the camera’s picture of me. What size of shot is it?' : 'What size of shot is this one?',
    opts: opts(['wide', 'medium', 'close']), answer: x.size,
    ok: SIZES[x.size].means, more: junior ? '' : sizeNumbers(x.shot, set),
  }));
}

// ---- part 2: name the move. The shot plays again and again (with reduced motion: its first and last frame).
export function moveItems(set, junior) {
  const tall = tallPlace(set); const street = streetPlace(set);
  const list = [
    { move: 'pan', shot: { move: 'pan', sub: 'town' }, hint: 'Watch where the camera stands. Does it stay in one spot, or move?' },
    { move: 'tilt', shot: { move: 'tilt', sub: `place:${tall.id}` }, hint: 'Does the camera turn side to side, or up and down?' },
    { move: 'track', shot: { move: 'track', sub: 'town' }, hint: 'Watch the river bank. Does the camera stay in one spot?' },
    { move: 'pan', shot: { move: 'pan', sub: `place:${street.id}` }, hint: 'Does the camera move along, or stay in one spot and turn?' },
  ];
  return list.map((x, i) => ({
    ...x, q: 'Which camera move is this?', say: i === 0 ? 'Now the camera moves. Watch it. Which move is it?' : 'Watch the camera. Which move is this?',
    opts: opts(['pan', 'tilt', 'track']), answer: x.move,
    ok: MOVES2[x.move].means, more: junior ? '' : moveNumbers(x.move, x.shot, set),
  }));
}

// ---- part 3: what does the scene need? A director's note; the child picks the shot, then sees it filmed.
export function sceneItems(set) {
  const tall = tallPlace(set); const street = streetPlace(set); const wide = placeOf(set, set.offer[0]) || set.places[0];
  const see = set.who.otters.here ? 'when I see the otters' : 'when our film is finished';
  const S = [
    { id: 'wide', note: 'The first shot. Show everyone where the film happens.', shot: { move: 'wide', sub: 'town' }, hint: 'The audience does not know where we are yet. How much should they see?' },
    { id: 'close', note: `Show how I feel ${see}.`, shot: { move: 'cw-close', sub: 'who:florence' }, hint: 'Feelings show on a face. How close should we be?' },
    { id: 'tilt', note: `Show how tall ${tallWords(tall)}, from the ground to the top.`, shot: { move: 'tilt', sub: `place:${tall.id}` }, hint: 'From the ground to the top: which way does the camera need to turn?' },
    { id: 'track', note: 'Travel down the river beside the water, as if the camera were on a boat.', shot: { move: 'track', sub: 'town' }, hint: 'The camera has to travel. Can a camera that stays in one spot do that?' },
    { id: 'medium', note: 'Show me waving, and my arms as I talk.', shot: { move: 'cw-medium', sub: 'who:florence' }, hint: 'We need my face and my arms, but not the whole island.' },
    { id: 'pan', note: `Show all of ${wide.label} from one spot, from one end to the other.`, shot: { move: 'pan', sub: `place:${wide.id}` }, hint: 'From one spot, from one end to the other: does the camera move along, or turn?' },
  ];
  return S.map((x, i) => ({ ...x, q: x.note, say: `Director’s note ${i + 1}: ${x.note} Which shot or move does it need?`,
    opts: opts(['wide', 'medium', 'close', 'pan', 'tilt', 'track'], (o) => `${o.means} ${(x.id in SIZES) === (o.id in SIZES) ? '' : (x.id in SIZES) ? 'This note is about how much to show.' : 'This note is about how the camera moves.'}`.trim()),
    answer: x.id, ok: `${ALL[x.id].means} Here it is.` }));
}

export const PARTS = [
  { id: 'size', kick: 'Shot sizes', title: 'Part 1: shot sizes', line: 'Film crews name a shot by how much it shows. I will film myself three ways. You name each one.' },
  { id: 'move', kick: 'Camera moves', title: 'Part 2: camera moves', line: 'Now the camera moves. Watch where it stands and which way it turns.' },
  { id: 'scene', kick: 'Director’s notes', title: 'Part 3: what does the scene need?', line: 'Directors write notes like these. Pick the shot or move each note needs, and I will film it.' },
  { id: 'seq', kick: 'Sequences', senior: true, title: 'Part 4: two shots in a row', line: 'A director plans shots in sequences. Each note below needs two shots, one after the other: choose both, then I will film the pair.' },
];
export const partsFor = (junior) => PARTS.filter((p) => !p.senior || !junior);

// ---- part 4 (ages 13–17): a two-shot sequence. Each note needs a shot, then another; each answer is size or move.
export function seqItems(set) {
  const tall = tallPlace(set); const wide = placeOf(set, set.offer[0]) || set.places[0];
  const S = [
    { note: `A film about ${tall.label}: first show where it stands in the town, then how tall it is.`, a: ['wide', 'tilt'], shots: [{ move: 'wide', sub: 'town' }, { move: 'tilt', sub: `place:${tall.id}` }],
      qs: ['First: where it stands in the town.', 'Then: how tall it is.'], hints: ['Where it stands in the town: how much does the audience need to see?', 'From the ground to the top: which way does the camera turn?'] },
    { note: 'Travel down the river as if on a boat, then end on my face as I smile.', a: ['track', 'close'], shots: [{ move: 'track', sub: 'town' }, { move: 'cw-close', sub: 'who:florence' }],
      qs: ['First: down the river, as if on a boat.', 'Then: my face as I smile.'], hints: ['The camera travels. Which move goes along with it?', 'A face, so you see the smile: which size?'] },
    { note: `Show all of ${wide.label} from one spot, end to end, then me as I wave and talk about it.`, a: ['pan', 'medium'], shots: [{ move: 'pan', sub: `place:${wide.id}` }, { move: 'cw-medium', sub: 'who:florence' }],
      qs: ['First: all of it from one spot, end to end.', 'Then: me as I wave and talk.'], hints: ['From one spot, end to end: does the camera move along, or turn?', 'My face and my waving arms, not the whole island: which size?'] },
  ];
  return S.map((x, i) => ({ note: x.note, shots: x.shots, items: [0, 1].map((k) => ({
    q: `Shot ${k + 1} of 2. ${x.qs[k]}`,
    say: k === 0 ? `Sequence ${i + 1}. ${x.note} Which shot comes first?` : 'And the second shot?',
    opts: opts(['wide', 'medium', 'close', 'pan', 'tilt', 'track'], (o) => `${o.means} ${(x.a[k] in SIZES) === (o.id in SIZES) ? '' : (x.a[k] in SIZES) ? 'This shot is about how much to show.' : 'This shot is about how the camera moves.'}`.trim()),
    answer: x.a[k], ok: ALL[x.a[k]].means, hint: x.hints[k] })) }));
}
// The record and the closing card: how many were named, how many at the first try.
export const crewLines = (r) => [`You named ${num(r.of)} shots and moves${r.seq ? ` and planned ${num(r.seq)} two-shot sequences` : ''}.`, 'Wide, medium and close-up are sizes. Pan, tilt and track are moves.'];
