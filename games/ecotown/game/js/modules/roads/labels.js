// Mission 2, "Teaching the car to recognise things": label street pictures, train the car, test it on pictures it
// has never seen, find the hard cases it misses, label those too, and test again. Pure: no page.
//
// How it is simplified (and true in kind): a recognition model learns from labelled examples. It does well on the
// kinds of picture it was shown and badly on kinds it never saw (a person half hidden, a wheelchair user, a person in
// a reflection). Here the car recognises a case in a test picture only if a correct label of that case was in its
// training pictures. Real teams label many thousands of pictures, and keep looking for new hard cases.

export const LABELS = ['person', 'cyclist', 'dog', 'car', 'sign', 'notreal'];
export const LABEL = {
  person: { icon: '🚶', name: { j: 'Person', s: 'Person' } },
  cyclist: { icon: '🚲', name: { j: 'Cyclist', s: 'Cyclist' } },
  dog: { icon: '🐕', name: { j: 'Dog', s: 'Animal' } },
  car: { icon: '🚗', name: { j: 'Car or van', s: 'Vehicle' } },
  sign: { icon: '🚦', name: { j: 'Sign or light', s: 'Sign / signal' } },
  notreal: { icon: '🪞', name: { j: 'Not a real person', s: 'Not real (picture or reflection)' } },
};
// each case: what a thing is, the label it should get, and whether it is a hard one
export const CASES = {
  person: { label: 'person' }, cyclist: { label: 'cyclist' }, dog: { label: 'dog' }, car: { label: 'car' }, sign: { label: 'sign' },
  hidden: { label: 'person', hard: true, name: { j: 'a person half hidden by a van', s: 'a partly hidden pedestrian' } },
  chair: { label: 'person', hard: true, name: { j: 'a wheelchair user', s: 'a wheelchair user' } },
  child: { label: 'person', hard: true, name: { j: 'a small child', s: 'a small child' } },
  mirror: { label: 'notreal', hard: true, name: { j: 'a person in a shop window’s reflection', s: 'a reflection of a person' } },
  poster: { label: 'notreal', hard: true, name: { j: 'a person on a poster', s: 'a person on a poster' } },
  night: { label: 'person', hard: true, name: { j: 'a person at night', s: 'a pedestrian at night' } },
  // two cases nobody labels: they turn up only in the second test, as new hard cases do in real life
  boxcarry: { label: 'person', hard: true, fresh: true, name: { j: 'a person carrying a big box', s: 'a person carrying a large box' } },
  scooter: { label: 'person', hard: true, fresh: true, name: { j: 'someone on a mobility scooter', s: 'a mobility-scooter user' } },
};
// the pictures to label: first the everyday ones, then the hard ones. Each thing has a case (and is drawn by art.js).
export const EASY = [
  { cond: 'sun', things: [{ id: 'a', kind: 'person', case: 'person', x: 4.8, z: 13, colour: '#1c6fd0' }, { id: 'b', kind: 'car', case: 'car', x: -1.7, z: 22, colour: '#c8553d' }, { id: 'c', kind: 'sign', case: 'sign', x: -4.7, z: 10, text: '20' }] },
  { cond: 'sun', things: [{ id: 'a', kind: 'cyclist', case: 'cyclist', x: 2, z: 15, colour: '#7a4fb0' }, { id: 'b', kind: 'dog', case: 'dog', x: 4.8, z: 9 }, { id: 'c', kind: 'person', case: 'person', x: -5, z: 18, colour: '#1f7442', i: 1 }] },
];
export const HARD = [
  { cond: 'sun', things: [{ id: 'a', kind: 'van', case: 'car', x: 1.6, z: 13 }, { id: 'b', kind: 'person', case: 'hidden', x: 2.75, z: 15.5, colour: '#b23a26', i: 3 }, { id: 'c', kind: 'light', case: 'sign', x: -4.6, z: 20, lamp: 'green' }] },
  { cond: 'sun', things: [{ id: 'a', kind: 'chair', case: 'chair', x: 4.6, z: 10, colour: '#2f6fd8' }, { id: 'b', kind: 'child', case: 'child', x: -4.6, z: 11, colour: '#e0a020' }] },
  { cond: 'sun', things: [{ id: 'a', kind: 'mirror', case: 'mirror', x: 5.8, z: 11 }, { id: 'b', kind: 'person', case: 'person', x: -4.8, z: 14, colour: '#3d6e8a', i: 2 }] },
  { cond: 'sun', things: [{ id: 'a', kind: 'poster', case: 'poster', x: -5.6, z: 10 }, { id: 'b', kind: 'dog', case: 'dog', x: 4.6, z: 12, colour: '#3b2a1e' }, { id: 'c', kind: 'cyclist', case: 'cyclist', x: 1.4, z: 24, colour: '#1f7f49' }] },
];
// ages 13–17 also label a person at night
export const NIGHT = { cond: 'dark', only: 's', things: [{ id: 'a', kind: 'person', case: 'night', x: -1.2, z: 9, colour: '#2a2f35', i: 2 }, { id: 'b', kind: 'car', case: 'car', x: 1.8, z: 13, colour: '#3d6e8a' }] };
export const hardFor = (j) => (j ? HARD : [...HARD, NIGHT]);
// The first test: pictures the car has never seen, one of each case. The second test uses FRESH pictures, never
// the same ones again (testing on what you fixed would overstate how good the car is), and they include two new
// hard cases nobody labelled.
export const TEST = ['person', 'cyclist', 'dog', 'car', 'hidden', 'chair', 'child', 'mirror', 'poster'];
export const testFor = (j, round = 1) => [...TEST, ...(j ? [] : ['night']), ...(round === 2 ? ['boxcarry', 'scooter'] : [])];

// is a label right for this thing?
export const rightLabel = (thing, label) => CASES[thing.case].label === label;
// what the car learnt: the set of cases with a correct label in the pictures labelled so far.
// labelled: [{ case, label }]
export function learnt(labelled) { return new Set(labelled.filter((t) => CASES[t.case] && CASES[t.case].label === t.label).map((t) => t.case)); }
// the test result: each test case, whether the car got it right, and what happened if not
export function test(labelled, cases = TEST) {
  const know = learnt(labelled);
  const rows = cases.map((c) => ({ case: c, ok: know.has(c) }));
  const wrong = rows.filter((r) => !r.ok);
  return { rows, right: rows.length - wrong.length, of: rows.length, falseAlarms: wrong.filter((r) => CASES[r.case].label === 'notreal').length, misses: wrong.filter((r) => CASES[r.case].label !== 'notreal').length };
}
// what the car did with a test case it does not know: true to how such models fail
export function missWhat(c, j) {
  if (c === 'mirror' || c === 'poster') return j ? 'It thought this was a real person and braked hard for nothing.' : 'False alarm: classed as a pedestrian, so the car braked for nothing.';
  if (c === 'hidden') return j ? 'It did not spot the person behind the van.' : 'Missed: only part of the person was visible.';
  if (c === 'chair') return j ? 'It was not sure what this was, so it did not know how they would move.' : 'Low confidence: no training example looked like this.';
  if (c === 'child') return j ? 'It was not sure: children are smaller than the people it had seen.' : 'Low confidence: smaller than any person in the training set.';
  if (c === 'night') return j ? 'It did not spot the person in the dark.' : 'Missed: no night-time examples in training.';
  if (c === 'boxcarry') return j ? 'New! The box hid the person’s shape. Nobody had labelled one like this.' : 'Missed (new case): the box hid the body shape; no such example was labelled.';
  if (c === 'scooter') return j ? 'New! It had never seen a mobility scooter, so it did not know how it would move.' : 'Low confidence (new case): no mobility scooter in the training data.';
  return j ? 'It did not know what this was.' : 'Not recognised.';
}
export const caseName = (c, j) => (CASES[c].name ? (j ? CASES[c].name.j : CASES[c].name.s) : (j ? LABEL[CASES[c].label].name.j : LABEL[CASES[c].label].name.s).toLowerCase());
// a reviewer's line when the child presses Done: what is missing or wrong. misses: how many times Done was wrong for this picture.
export function reviewSay(pic, found, labels, misses, j) {
  const unfound = pic.things.filter((t) => !found.has(t.id)); const wrong = pic.things.filter((t) => found.has(t.id) && labels[t.id] && !rightLabel(t, labels[t.id])); const unlabelled = pic.things.filter((t) => found.has(t.id) && !labels[t.id]);
  if (!unfound.length && !wrong.length && !unlabelled.length) return { ok: true, text: '' };
  if (unlabelled.length) return { ok: false, text: j ? 'A box has no label yet. Tap it and choose a label.' : 'One box has no label. Select it and pick a label.' };
  if (unfound.length) {
    const t = unfound[0];
    if (misses <= 1) return { ok: false, text: j ? `There ${unfound.length === 1 ? 'is one more thing' : `are ${unfound.length} more things`} the car must know about. Look again.` : `${unfound.length} object${unfound.length === 1 ? '' : 's'} still unlabelled. Look again.` };
    if (misses === 2) return { ok: false, text: `${j ? 'Look closely' : 'Check'} ${t.x > 0 ? (j ? 'on the right' : 'the right side') : (j ? 'on the left' : 'the left side')}${t.case === 'hidden' ? (j ? ', by the van' : ', next to the van') : ''}.`, reveal: null };
    return { ok: false, text: j ? 'Here it is: I have put a box round it. Now give it a label.' : 'I have boxed it for you. Label it.', reveal: t.id };
  }
  const t = wrong[0];
  if (misses <= 1) return { ok: false, text: j ? 'One label is not right. Check each box again.' : 'One label is wrong. Review each box.' };
  const tip = { hidden: { j: 'Only part of them shows, but it is still a person.', s: 'Partly hidden is still a pedestrian.' }, chair: { j: 'Someone in a wheelchair is a person. The car must give them the same care.', s: 'A wheelchair user is a pedestrian.' }, child: { j: 'Small, but a person.', s: 'A child is a pedestrian.' }, mirror: { j: 'Is that person really in the street, or in the glass?', s: 'Is that person in the street, or in the glass?' }, poster: { j: 'Could that person ever step into the road?', s: 'Could that figure move into the road?' } }[t.case];
  if (misses === 2 || !tip) return { ok: false, text: tip ? (j ? tip.j : tip.s) : (j ? 'Look at each box again.' : 'Review each box again.'), select: t.id };
  return { ok: false, text: `${j ? 'That one is' : 'Correct label:'} ${j ? LABEL[CASES[t.case].label].name.j : LABEL[CASES[t.case].label].name.s}. ${j ? tip.j : tip.s}`, select: t.id, fix: CASES[t.case].label };
}
export const M2 = {
  find: { j: 'Tap each thing the car must know about. A box goes round it. Then choose its label below.', s: 'Tap each object the car must know about to box it, then choose its label.' },
  train1: { j: 'Two pictures labelled. Let’s teach the car with them, then test it on pictures it has never seen.', s: 'Two labelled pictures. Train on them, then test on unseen pictures.' },
  test1: (r, j) => (j ? `The car got ${r.right} of ${r.of} test pictures right. It does well on things like your pictures, and badly on the hard ones it has never seen.` : `Test: ${r.right}/${r.of} correct (${Math.round((100 * r.right) / r.of)}%): ${r.misses} misses, ${r.falseAlarms} false alarms. Strong on cases like the training set; weak on unseen hard cases.`),
  next: { j: 'Next picture. Tap each thing the car must know about, then choose its label.', s: 'Next picture: box and label every object.' },
  hard: { j: 'Now label pictures with the hard ones in them. These are the edge cases.', s: 'Now label pictures that contain the hard cases: the edge cases.' },
  test2: (a, b, j) => (j ? `New test pictures, never seen before. The car got ${b.right} of ${b.of} right. Your hard examples taught it a lot. But two new hard cases turned up that nobody had labelled. That is why teams keep testing on pictures the car has never seen.` : `Fresh test set: ${b.right}/${b.of} (${Math.round((100 * b.right) / b.of)}%), against ${a.right}/${a.of} before. The labelled edge cases now pass, but ${b.of - b.right} new ones failed. Never retest on the pictures you fixed: new hard cases keep turning up.`),
};
export function m2Line(rec, j) {
  return j ? `Labelled ${rec?.labels ?? 0} things in ${rec?.pics ?? 0} street pictures, ${rec?.hard ?? 0} of them hard ones, and tested the car on new pictures` : `Labelled ${rec?.labels ?? 0} objects (${rec?.hard ?? 0} edge cases); the car on unseen pictures: ${rec?.a ?? 0}/${rec?.aOf ?? 9} before, ${rec?.b ?? 0}/${rec?.bOf ?? 11} after`;
}
