// Mission 4, editing: choose the best takes, trim the rough cut, set the pace with shot lengths, and choose the music
// and where it changes. Pure: the clips, the checks and Florence's words. The film is "Market day" (mission 2's story).
import { FAULTS } from './art.js';
import { placeOf } from './kit.js';

// ---- part 1: two takes of the same shot. One has a fault a camera operator can make.
export const TAKES = [
  { subject: 'hall', fault: 'shake', badFirst: true, decoys: ['dark', 'thumb'] },
  { subject: 'florence', fault: 'head', badFirst: false, decoys: ['blur', 'shake'] },
  { subject: 'otters', fault: 'blur', badFirst: true, decoys: ['head', 'dark'] },
];
const NAMES = { hall: 'the hall', florence: 'Florence', otters: 'the otters' };
export function takeItems(TAKEPIC) {
  return TAKES.map((t, i) => {
    const bad = t.badFirst ? 1 : 2; const good = 3 - bad; const pic = (k) => TAKEPIC(t.subject, k === bad ? t.fault : null, `Take ${k}`);
    const pickOne = { q: `Which take of ${NAMES[t.subject]} would you use?`, say: i === 0 ? 'The camera filmed each shot twice. These are called takes. Which take would you use?' : `Two takes of ${NAMES[t.subject]}. Which would you use?`,
      opts: [1, 2].map((k) => ({ id: 't' + k, label: `Take ${k}`, pic: pic(k), why: `Look closely at take ${k}. Is something wrong with it?` })), answer: 't' + good,
      ok: `Take ${good} is clear and steady.`, hint: 'Look at each one as if it were on a big screen.' };
    const opts = [t.fault, ...t.decoys].sort().map((f) => ({ id: f, label: FAULTS[f].label, why: `Look at take ${bad} again. Is it ${FAULTS[f].short}?` }));
    const whatWrong = { q: `What is wrong with take ${bad}?`, say: `What is wrong with take ${bad}?`, opts, answer: t.fault,
      ok: `Take ${bad} is ${FAULTS[t.fault].short}. An editor would leave it out.`, hint: 'Compare it with the good take.' };
    return { pic: `<div class="fm-pair">${[1, 2].map((k) => `<figure>${pic(k)}<figcaption>Take ${k}</figcaption></figure>`).join("")}</div>`, pickOne, whatWrong };
  });
}

// ---- part 2: trim the rough cut. Seven clips from the camera, two of them not wanted.
// art: the drawing (art.js SHOT_ART). keep: false for a clip the film does not need.
export const ROUGH = [
  { id: 'r1', art: 'dawn', words: 'The town at dawn', keep: true },
  { id: 'r2', art: 'ground', words: 'A clip with no name', keep: false, why: 'mistake' },
  { id: 'r3', art: 'market', words: 'The stall keepers set up', keep: true },
  { id: 'r4', art: 'clouds', words: 'Dark clouds roll in', keep: true },
  { id: 'r5', art: 'clouds', words: 'Dark clouds roll in', keep: false, why: 'repeat' },
  { id: 'r6', art: 'cover', words: 'They cover the stalls', keep: true },
  { id: 'r7', art: 'sun', words: 'The sun comes out', keep: true },
];
export function checkTrim(cutIds) {
  const cut = new Set(cutIds);
  const lost = ROUGH.find((c) => c.keep && cut.has(c.id)); if (lost) return { ok: false, say: `Clip ${ROUGH.indexOf(lost) + 1} is part of the story. Bring it back.` };
  const left = ROUGH.filter((c) => !c.keep && !cut.has(c.id));
  if (left.length === 2) return { ok: false, say: 'Two clips should not be in the film. One was filmed by mistake, and one shows the same thing twice.' };
  if (left[0]?.why === 'mistake') return { ok: false, say: 'One clip left was filmed by mistake. Nobody meant to film it.' };
  if (left[0]?.why === 'repeat') return { ok: false, say: 'Two clips still show the same thing. Keep one of them.' };
  return { ok: true, say: 'Trimmed. The mistake and the repeat are gone: five clips tell the story.' };
}

// ---- part 3: the pace. The same five shots, cut two ways. Each shot is quick, medium or long.
export const LENGTHS = { quick: 1.5, medium: 3, long: 5 };
export const LENGTH_IDS = Object.keys(LENGTHS);
// Ages 13–17 also have a running time to hit, in seconds, as an editor cutting a trailer to a slot would.
export const PACES = [
  { id: 'fast', title: 'An exciting trailer', ask: 'First, make it an exciting trailer: the kind that makes you want to see the film.', test: (avg) => avg <= 2.2, mood: 'party',
    secs: [7.5, 10.5], askS: 'First, an exciting trailer of five shots that runs 10.5 seconds or less, so the average shot is about 2 seconds or less.' },
  { id: 'slow', title: 'A calm film', ask: 'Now make the same shots into a calm, gentle film.', test: (avg) => avg >= 4.2, mood: 'calm',
    secs: [21, 24], askS: 'Now a calm film of the same five shots that runs between 21 and 24 seconds, so the average shot is over 4 seconds.' },
];
// "None of the five shots is quick." / "One of the five shots is quick." / "Three of the five shots are quick."
export const howMany = (n, what) => (n === 0 ? `None of the five shots is ${what}.` : `${['', 'One', 'Two', 'Three', 'Four', 'Five'][n]} of the five shots ${n === 1 ? 'is' : 'are'} ${what}.`);
export const avgSecs = (lens) => lens.reduce((s, l) => s + LENGTHS[l], 0) / lens.length;
export const totalSecs = (lens) => lens.reduce((s, l) => s + LENGTHS[l], 0);
export const paceAsk = (pace, junior) => (junior ? pace.ask : pace.askS);
export function paceVerdict(pace, lens, junior) {
  const avg = avgSecs(lens); const total = totalSecs(lens); const quick = lens.filter((l) => l === 'quick').length, long = lens.filter((l) => l === 'long').length;
  const feel = pace.test(avg); const inTime = junior || (total >= pace.secs[0] && total <= pace.secs[1]); const ok = feel && inTime;
  const nums = junior ? '' : ` Running time ${total} s; average shot ${avg.toFixed(1)} s, so about ${Math.round(60 / avg)} cuts a minute.`;
  const time = !junior && feel && !inTime ? (total > pace.secs[1] ? ` It runs ${total} seconds: too long for the slot. Trim one shot.` : ` It runs ${total} seconds: too short for the slot. Let one shot run longer.`) : '';
  const say = (good, bad) => (ok ? good : feel ? time : bad) + nums;
  if (pace.id === 'fast') return { ok, avg, total, say: say('Most shots are quick, so the cuts come fast. That feels exciting.', `${howMany(quick, 'quick')} For an exciting trailer, the cuts need to come faster: make more shots quick.`).trim() };
  return { ok, avg, total, say: say('The shots are long, so you have time to look. That feels calm.', `${howMany(long, 'long')} For a calm film, give the eye more time: make more shots long.`).trim() };
}

// ---- part 4: the music. Where does the story turn, and what music fits each part?
// The game's own tunes (ctx.engine.setMusic): day, night, lab, celebrate.
export const TUNES = {
  day: { label: 'Bright daytime music', feel: 'cheerful' }, night: { label: 'Slow evening music', feel: 'calm' },
  lab: { label: 'Thoughtful music', feel: 'curious, a little mysterious' }, celebrate: { label: 'Party music', feel: 'excited' },
};
const tuneOpts = (why) => Object.entries(TUNES).map(([id, t]) => ({ id, icon: id === 'day' ? '☀️' : id === 'night' ? '🌙' : id === 'lab' ? '🔎' : '🎉', label: `${t.label} (${t.feel})`, why: why[id] || '' }));
// the five shots of the trimmed film, and the parts the music marks
export const FINAL = ROUGH.filter((c) => c.keep);
export const turnItems = (CLIPPIC) => [
  { q: 'Tap the shot where the music should change, because the story turns.', say: 'Music changes when the story changes. Tap the shot where the story turns.',
    opts: FINAL.map((c, i) => ({ id: c.id, label: `${i + 1}. ${c.words}`, pic: CLIPPIC(c.art), why: i < 2 ? 'Nothing has gone wrong yet in this shot.' : i === 2 ? '' : 'The story has already turned by this shot. Look earlier.' })), answer: 'r4',
    ok: 'The clouds are where the story turns. The music changes there.', hint: 'Look for the moment something goes wrong.' },
  { q: 'Tap the shot where the music should change back.', say: 'The trouble ends somewhere. Tap the shot where the music should change back.',
    opts: FINAL.map((c, i) => ({ id: c.id, label: `${i + 1}. ${c.words}`, pic: CLIPPIC(c.art), why: i <= 3 ? 'The trouble is not over yet in this shot.' : '' })), answer: 'r7',
    ok: 'The sun comes out: the trouble is over, so the music changes back.', hint: 'When is the trouble over?' },
];
export const musicItems = () => [
  { part: 'start', q: 'Music for the beginning: the town wakes up and the stalls open.', answers: ['day', 'night'],
    opts: tuneOpts({ lab: 'Thoughtful music makes it feel as if something is wrong already. Nothing is, yet.', celebrate: 'Party music this early leaves nowhere to go when the story gets happy. Save it.' }),
    ok: 'That sets a happy, easy start.', hint: 'Nothing has gone wrong yet. How should people feel?' },
  { part: 'middle', q: 'Music for the middle: dark clouds, and the stall keepers rush to cover the stalls.', answers: ['lab'],
    opts: tuneOpts({ day: 'Bright music would make the storm feel like nothing.', night: 'Slow evening music would make the storm feel sleepy.', celebrate: 'Party music would make the storm feel like fun. Is that how the stall keepers feel?' }),
    ok: 'Thoughtful music makes people wonder what will happen. It fits the storm.', hint: 'How do the stall keepers feel when the clouds come?' },
  { part: 'end', q: 'Music for the end: the sun comes out and the market is busy again.', answers: ['day', 'celebrate'],
    opts: tuneOpts({ lab: 'Thoughtful music would make the ending feel unsure. The trouble is over.', night: 'Slow evening music would make the busy market feel sleepy.' }),
    ok: 'That makes the ending feel happy.', hint: 'The trouble is over. How should people feel now?' },
];
// the trimmed film as shots for the town, with the music on the shots where it changes
const PLACE_FOR = { dawn: null, market: ['market', 'festival', 'hall', 'ailab'], clouds: null, cover: ['market', 'festival', 'hall', 'ailab'], sun: ['market', 'festival', 'hall', 'ailab'] };
const MOVE_FOR = { dawn: 'wide', market: 'street', clouds: 'glide', cover: 'push', sun: 'pull' };
export function editCut(set, { lens = null, music = null, mood = 'cheerful' } = {}) {
  const shots = FINAL.map((c, i) => {
    const ids = PLACE_FOR[c.art]; const p = ids && (ids.find((x) => placeOf(set, x)) || set.offer[0]);
    const shot = { id: 's' + (i + 1), move: MOVE_FOR[c.art], sub: p ? `place:${p}` : 'town', secs: lens ? LENGTHS[lens[i]] : 3 };
    if (music) shot.music = i < 3 ? (i === 0 ? music.start : i === 2 ? music.middle : undefined) : i === 4 ? music.end : undefined;
    if (shot.music === undefined) delete shot.music;
    return shot;
  });
  return { n: 1, mood, shots, tags: {}, gone: [], moodWas: null, dirty: false, next: shots.length + 1 };
}
export const PARTS = [
  { id: 'takes', title: 'Part 1: the best takes', line: 'The camera filmed some shots twice. An editor picks the best take of each.' },
  { id: 'trim', title: 'Part 2: trim the rough cut', line: 'This is everything the camera filmed, in order. Cut the clips the film does not need.' },
  { id: 'pace', title: 'Part 3: the pace', line: 'How long each shot lasts changes how a film feels. Set the length of each shot.' },
  { id: 'music', title: 'Part 4: the music', line: 'Music tells people how to feel. Choose where it changes, then what plays.' },
];
export const editLines = () => ['You picked the best takes and trimmed the rough cut.', 'You cut the same shots fast and slow, and changed the music where the story turns.'];
