// Robot training: every line Florence and the robot say, built from fixed words and what happened. Pure: no page.
// Nothing here is typed by a child, and nothing is free text: each sentence is one of these patterns.
// Every statement is true of the data it is built from: tests/robots.test.mjs checks each pattern against the classifier.
import { kind, binById, FEATURES } from './learn.js';

export const list = (a, and = 'and') => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} ${and} ${a[a.length - 1]}`);
export const an = (name) => `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name}`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const nm = (id) => kind(id).name; const bn = (id) => binById(id).name;
const feat = (f) => FEATURES[f].label.toLowerCase();
export const sameText = (same) => `same ${list(same.map(feat))}`;

// What the robot did with one thing: a heading and one or two sentences.
export function verdict(r) {
  if (r.got === null && r.why === 'tie') { const [a, b] = r.rivals; return { tag: 'Asked for help', cls: 'ask', text: `It could not choose. This looks as much like the ${nm(a.kind)} (${sameText(a.same)}) as the ${nm(b.kind)} (${sameText(b.same)}).` }; }
  if (r.got === null) return { tag: 'Asked for help', cls: 'ask', text: 'Nothing it has been shown matches this, so it did not guess.' };
  const like = `It looks most like the ${nm(r.match)} it was shown: ${sameText(r.same)}.`;
  if (r.ok) return { tag: 'Right bin', cls: 'ok', text: `Into ${bn(r.got)}. ${like}` };
  return { tag: 'Not the right bin yet', cls: 'miss', text: `Into ${bn(r.got)}. ${like} It belongs in ${bn(r.truth)}.` };
}
// The same, in one short sentence, for the list after a test.
export function did(r) {
  if (r.got === null && r.why === 'tie') { const [a, b] = r.rivals; return `It could not choose: as much like the ${nm(a.kind)} (${sameText(a.same)}) as the ${nm(b.kind)} (${sameText(b.same)}).`; }
  if (r.got === null) return 'Nothing it had been shown matches this, so it asked.';
  return `It went into ${bn(r.got)}: most like the ${nm(r.match)} (${sameText(r.same)}).`;
}
// Why it was not sorted right, and what would change that. x: from learn.js explain(); feats: what the robot looks at.
// canAdd: more examples can still be added (so the stars on the shelf mean something).
export function why(r, x, feats, junior, canAdd = true) {
  const b = bn(x.bin);
  const gap = !x.mine ? `It has not been shown anything for ${b} yet.`
    : !x.mine.n ? `Nothing it was shown for ${b} has the same ${list(feats.map(feat), 'or')}.`
      : `For ${b}, the closest thing it was shown is the ${nm(x.mine.kind)}: ${sameText(x.mine.same)} only.`;
  if (!canAdd) return gap;
  const h = x.helpers[0];
  const fix = !h ? 'No one thing on the shelf settles this yet.'
    : junior ? `Show it something for ${b} with the ${sameText(h.same)}. Look for a star.` : `An example for ${b} with the ${sameText(h.same)} would settle it. See the stars.`;
  return `${gap} ${fix}`;
}
export const wrongBin = (id, j) => (j ? `The ${nm(id)} goes in ${bn(kind(id).bin)} in our town. Try that bin.` : `In this town the ${nm(id)} goes in ${bn(kind(id).bin)}. Try that bin.`);

// Florence's line for each step.
export const SAY = {
  teach0: (j, bins) => (j ? `This robot will sort our town's rubbish. It only knows what you show it. Tap a thing, then tap its bin. Show it at least one for each of the ${bins} bins.`
    : `This robot will sort the town's waste. It learns only from examples. Tap a thing, then its bin: at least one example for each of the ${bins} bins. Then test it.`),
  teachReady: (j) => (j ? 'It has one for every bin. Show it more, or press Test the robot.' : 'Every bin has an example. Add more, or test the robot now.'),
  teachMore: (j, room, stars) => (stars ? (j ? `Here are more things to show it. There is room for ${room}. The ones with a star are like the things it got wrong. Then test again.` : `More things to show. There is room for ${room}. The starred ones each fill a gap from the test. Then test again.`)
    : (j ? `Here are more things to show it. There is room for ${room}. Then test again.` : `More things to show. There is room for ${room}. Then test again.`)),
  full: (j) => (j ? 'The bench is full. Press Test again.' : 'The bench is full. Run the test again.'),
  test1: (j, n) => (j ? `Now a test. These ${n} things were kept apart: the robot has not been shown them. Press the button to watch it sort each one.`
    : `Now test it. These ${n} things were kept apart from the examples, so the score is fair. Step through and see which example it matches each time.`),
  testAgain: (j) => (j ? 'The same test tray. The robot has still not been shown these. Press Run the test and watch what changes.' : 'The same test set, still unseen, so the two scores can be compared. Run it: it stops at each change.'),
  review: (j, r, n) => (r >= n ? (j ? `It sorted all ${n}. Show it more anyway, so it is ready for new things in the street.` : `Score: ${n} of ${n}. More examples still help with new things in the street.`)
    : j ? `It sorted ${r} of ${n}. For the others, nothing it had been shown for the right bin was close enough. Read why, then add examples.` : `Score: ${r} of ${n}. Each miss shows which examples were missing. Add examples to fill the gaps.`),
  result: (j, a, b, n) => (b > a ? (j ? `First test: ${a} of ${n}. Now: ${b} of ${n}. Your new examples did that.` : `First test ${a} of ${n}, now ${b} of ${n}. The added examples made the difference.`)
    : b === a ? `Still ${b} of ${n}. Other examples may fill the gaps.`
      : `Now ${b} of ${n}: lower than ${a}. A new example can look like something from another bin. More examples settle it.`),
  resultFull: (j) => (j ? 'Every one in the right bin. It is ready for the street.' : 'A full score on the test set. Time to try it in the street.'),
  tune: () => 'One more thing to try: switch off something the robot looks at, and watch the score.',
  street: (j, n) => (j ? `Your robot is at work in your town. These ${n} things are new: they were not on the bench or the test tray. Press Start to watch it sort each one.` : `The robot is at work in your town. These ${n} things are new to it: not examples, not the test set. Press Start.`),
  streetEnd: (j, s) => `${s.right} of ${s.of} in the right bin.${s.asked ? ` It asked for help with ${s.asked}.` : ''}${s.wrong ? ` ${s.wrong} went in another bin: it has not been shown one like that yet.` : ''} A robot knows what it has been shown. You can teach it more any time.`,
};
// One line for a thing in the street.
export function streetLine(r) {
  if (r.got === null) return `${cap(an(nm(r.kind)))}. ${r.why === 'tie' ? 'It could not choose between two bins' : 'Nothing it has been shown matches this'}, so it asks a person. It belongs in ${bn(r.truth)}.`;
  const like = `It looks most like the ${nm(r.match)} you showed it.`;
  return r.ok ? `${cap(an(nm(r.kind)))}: into ${bn(r.got)}. ${like}` : `${cap(an(nm(r.kind)))}: into ${bn(r.got)}. ${like} It belongs in ${bn(r.truth)}: it has not been shown one like this yet.`;
}
// Ages 13–17: the score with some features switched off. on/off: feature ids; base: the score with all of them on.
export function tuneLine(on, off, right, of, base) {
  if (!off.length) return `Looking at ${list(on.map(feat))}: ${right} of ${of}.`;
  const cmp = right > base ? `${right - base} more than with everything on` : right < base ? `${base - right} fewer than with everything on` : 'the same as with everything on';
  return `With ${list(off.map(feat))} switched off: ${right} of ${of}, ${cmp}.`;
}
export const STEPS = ['Show', 'Test', 'Fill the gaps', 'Test again', 'Street'];
// The stage for the leader's list.
export function stageLine(stage, d = {}) {
  if (stage === 'teach') return d.round ? `Adding examples to fill the gaps (round ${d.round + 1})` : 'Showing the robot its first examples';
  if (stage === 'test') return `Testing the robot (test ${d.test})`;
  if (stage === 'review') return `Reading the first test: ${d.right} of ${d.of}`;
  if (stage === 'result') return `Comparing tests: ${d.first} of ${d.of}, then ${d.right} of ${d.of}`;
  return 'Watching the robot at work in the town';
}

// ---------- the take-home record, built from what the child did
// d: { rounds: [[ids]…], tests: [{ right, of, results }…], street: { right, asked, wrong, of } | null, bins, beside,
//      tune: { off: [feature ids], right, of } | null }   (tune: ages 13–17, when a feature was switched off for the street)
const fit = (head, ids, max = 120) => { // a list of names that fits a line
  let names = ids.map(nm); let more = 0; while (names.length > 1 && `${head}${list(names)}${more ? ` and ${more} more` : ''}.`.length > max) { names = names.slice(0, -1); more++; }
  return `${head}${more ? `${names.join(', ')} and ${more} more` : list(names)}.`;
};
export function record(d) {
  const first = d.rounds[0] || []; const later = d.rounds.slice(1).flat(); const t = d.tests; const lines = []; const practised = [];
  const total = first.length + later.length; const ex = (n) => `${n} example${n === 1 ? '' : 's'}`; const off = d.tune?.off?.length ? d.tune : null;
  if (first.length) lines.push(fit(`First shown ${ex(first.length)} for ${d.bins} bins: `, first));
  if (t[0]) { lines.push(`First test: ${t[0].right} of ${t[0].of} unseen things in the right bin.`); const miss = t[0].results.filter((r) => !r.ok).map((r) => r.kind); if (miss.length) lines.push(fit('Not sorted right at first: ', miss)); }
  if (later.length) lines.push(fit(`Then shown ${later.length} more: `, later));
  if (t.length > 1) lines.push(`${t.length === 2 ? 'Second test' : `Test ${t.length}`}, same unseen things: ${t[t.length - 1].right} of ${t[t.length - 1].of}.${off ? ` With ${list(off.off.map(feat))} switched off: ${off.right} of ${off.of}.` : ''}`);
  if (d.street) lines.push(`In the street${d.beside ? ` by the ${d.beside.toLowerCase()}` : ''}: ${d.street.right} of ${d.street.of} new things sorted${d.street.asked ? `, help asked for ${d.street.asked}` : ''}.`);
  if (total) practised.push(`teaching a robot by showing it ${ex(total)}`);
  if (t[0]) practised.push(`testing it on ${t[0].of} things it had not been shown, and reading why it missed some`);
  if (later.length && t.length > 1) practised.push(`adding ${ex(later.length)} to fill the gaps and testing again: ${t[0].right} of ${t[0].of}, then ${t[t.length - 1].right} of ${t[t.length - 1].of}`);
  if (d.street) practised.push(off ? 'choosing what the robot looks at, then checking it on new things in the street' : 'checking a trained machine on new things in the street');
  return { title: 'My recycling robot’s training record', lines: lines.slice(0, 6), practised: practised.slice(0, 4) };
}
