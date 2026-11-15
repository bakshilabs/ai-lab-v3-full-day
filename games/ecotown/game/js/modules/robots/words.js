// Robot training: every line Florence and the robot say, built from fixed words and what happened. Pure: no page.
// Nothing here is typed by a child, and nothing is free text: each sentence is one of these patterns.
import { kind, binById, FEATURES } from './learn.js';

export const list = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
export const an = (name) => `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name}`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const nm = (id) => kind(id).name; const bn = (id) => binById(id).name;
export const sameText = (same) => `same ${list(same.map((f) => FEATURES[f].label.toLowerCase()))}`;

// What the robot did with one thing: a heading and one or two sentences.
export function verdict(r) {
  if (r.got === null && r.why === 'tie') { const [a, b] = r.rivals; return { tag: 'Asked for help', cls: 'ask', text: `It could not choose. This looks as much like the ${nm(a.kind)} (${sameText(a.same)}) as the ${nm(b.kind)} (${sameText(b.same)}).` }; }
  if (r.got === null) return { tag: 'Asked for help', cls: 'ask', text: 'Nothing it has been shown looks like this, so it did not guess.' };
  const like = `It looks most like the ${nm(r.match)} it was shown: ${sameText(r.same)}.`;
  if (r.ok) return { tag: 'Right bin', cls: 'ok', text: `Into ${bn(r.got)}. ${like}` };
  return { tag: 'Not the right bin yet', cls: 'miss', text: `Into ${bn(r.got)}. ${like} It belongs in ${bn(r.truth)}.` };
}
// What its examples lacked, for a thing it did not get right (g: from learn.js gap()).
export function lacked(id, g) {
  const k = kind(id); const b = binById(k.bin); const first = `It has not been shown ${an(k.name)} yet.`;
  if (g.type === 'bin') return `It has not been shown anything for ${b.name} yet.`;
  if (g.type === 'nothing') return `${first} Nothing it was shown for ${b.name} looks like this.`;
  if (g.type === 'closer') return `${first} An example in another bin looks just as much like it.`;
  if (g.feat === 'colour') return `${first} It has only been shown ${list(g.seen)} ${b.noun}.`;
  if (g.feat === 'shape') return `${first} For ${b.name} it has only been shown these shapes: ${list(g.seen)}.`;
  if (g.feat === 'feel') return `${first} For ${b.name} it has only been shown things that feel ${list(g.seen)}.`;
  return `${first} For ${b.name} it has only been shown things in ${list(g.seen)} condition, not ${g.value}.`;
}
export const wrongBin = (id, j) => (j ? `The ${nm(id)} goes in ${bn(kind(id).bin)} in our town. Try that bin.` : `In this town the ${nm(id)} goes in ${bn(kind(id).bin)}. Try that bin.`);

// Florence's line for each step.
export const SAY = {
  teach0: (j, bins) => (j ? `This robot will sort our town's rubbish. It only knows what you show it. Tap a thing, then tap its bin. Show it at least one for each of the ${bins} bins.`
    : `This robot will sort the town's waste. It learns only from examples. Tap a thing, then its bin: at least one example for each of the ${bins} bins. Then test it.`),
  teachReady: (j) => (j ? 'It has one for every bin. Show it more, or press Test the robot.' : 'Every bin has an example. Add more, or test the robot now.'),
  teachMore: (j, room) => (j ? `There is room for ${room} more examples. Pick the ones it lacked: they have a star. Then test again.` : `There is room for ${room} more examples. Choose the ones that fill the gaps: they are starred. Then test again.`),
  full: (j) => (j ? 'The bench is full. Press Test again.' : 'The bench is full. Run the test again.'),
  test1: (j, n) => (j ? `Now a test. These ${n} things were kept apart: the robot has not been shown them. Press the button to watch it sort each one.`
    : `Now test it. These ${n} things were kept apart from the examples, so the score is fair. Step through and see which example it matches each time.`),
  testAgain: (j) => (j ? 'The same test tray again. Watch what changes.' : 'The same test set again, so the two scores can be compared.'),
  review: (j, r, n) => (j ? `It sorted ${r} of ${n}. The others it had not been shown yet. Look at what was missing, then add examples.` : `Score: ${r} of ${n}. Each miss shows what its examples lacked. Add examples to fill the gaps.`),
  result: (j, a, b, n) => (b > a ? (j ? `First test: ${a} of ${n}. Now: ${b} of ${n}. Your new examples did that.` : `First test ${a} of ${n}, now ${b} of ${n}. The added examples made the difference.`)
    : b === a ? `Still ${b} of ${n}. Other examples may fill the gaps.`
      : `Now ${b} of ${n}: lower than ${a}. A new example can look like something from another bin. More examples settle it.`),
  resultFull: (j) => (j ? 'Every one in the right bin. It is ready for the street.' : 'A full score on the test set. Time to try it in the street.'),
  street: (j, n) => (j ? `Your robot is at work in your town. These ${n} things are new. Press Next to watch it sort each one.` : `The robot is at work in your town. These ${n} things are new to it: a last check. Press Next for each one.`),
  streetEnd: (j, s) => `${s.right} of ${s.of} in the right bin.${s.asked ? ` It asked for help with ${s.asked}.` : ''}${s.wrong ? ` ${s.wrong} went in the wrong bin: it has not been shown one like that yet.` : ''} A robot knows what it has been shown. You can teach it more any time.`,
};
// One line for a thing in the street.
export function streetLine(r) {
  if (r.got === null) return `${cap(an(nm(r.kind)))}. ${r.why === 'tie' ? 'It could not choose between two bins' : 'It has not been shown anything like this'}, so it asks a person. It belongs in ${bn(r.truth)}.`;
  const like = `It looks most like the ${nm(r.match)} you showed it.`;
  return r.ok ? `${cap(an(nm(r.kind)))}: into ${bn(r.got)}. ${like}` : `${cap(an(nm(r.kind)))}: into ${bn(r.got)}. ${like} It belongs in ${bn(r.truth)}: it has not been shown one like this yet.`;
}
export const STEPS = ['Show', 'Test', 'Fill the gaps', 'Test again', 'Street'];
// The stage for the leader's list.
export function stageLine(stage, d = {}) {
  if (stage === 'teach') return d.round ? `Adding the examples the robot lacked (round ${d.round + 1})` : 'Showing the robot its first examples';
  if (stage === 'test') return `Testing the robot (test ${d.test})`;
  if (stage === 'review') return `Reading the first test: ${d.right} of ${d.of}`;
  if (stage === 'result') return `Comparing tests: ${d.first} of ${d.of}, then ${d.right} of ${d.of}`;
  return 'Watching the robot at work in the town';
}

// ---------- the take-home record, built from what the child did
// d: { rounds: [[ids]…], tests: [{ right, of, results }…], street: { right, asked, wrong, of } | null, bins, beside }
const fit = (head, ids, max = 120) => { // a list of names that fits a line
  let names = ids.map(nm); let more = 0; while (names.length > 1 && `${head}${list(names)}${more ? ` and ${more} more` : ''}.`.length > max) { names = names.slice(0, -1); more++; }
  return `${head}${more ? `${names.join(', ')} and ${more} more` : list(names)}.`;
};
export function record(d) {
  const first = d.rounds[0] || []; const later = d.rounds.slice(1).flat(); const t = d.tests; const lines = []; const practised = [];
  const total = first.length + later.length; const ex = (n) => `${n} example${n === 1 ? '' : 's'}`;
  if (first.length) lines.push(fit(`First shown ${ex(first.length)} for ${d.bins} bins: `, first));
  if (t[0]) { lines.push(`First test: ${t[0].right} of ${t[0].of} in the right bin.`); const miss = t[0].results.filter((r) => !r.ok).map((r) => r.kind); if (miss.length) lines.push(fit('It had not yet been shown: ', miss)); }
  if (later.length) lines.push(fit(`Then shown ${later.length} more: `, later));
  if (t.length > 1) lines.push(`${t.length === 2 ? 'Second test' : `Test ${t.length}`}: ${t[t.length - 1].right} of ${t[t.length - 1].of} in the right bin.`);
  if (d.street) lines.push(`In the street${d.beside ? ` by the ${d.beside.toLowerCase()}` : ''}: ${d.street.right} of ${d.street.of} new things sorted${d.street.asked ? `, help asked for ${d.street.asked}` : ''}.`);
  if (total) practised.push(`teaching a robot by showing it ${ex(total)}`);
  if (t[0]) practised.push(`testing it on ${t[0].of} things kept apart, and reading what its examples lacked`);
  if (later.length && t.length > 1) practised.push(`adding ${ex(later.length)} to fill the gaps and testing again: ${t[0].right} of ${t[0].of}, then ${t[t.length - 1].right} of ${t[t.length - 1].of}`);
  if (d.street) practised.push('checking a trained machine on new things in the street');
  return { title: 'My recycling robot’s training record', lines: lines.slice(0, 6), practised: practised.slice(0, 4) };
}
