import { num } from './hour.js';
// Mission 6, true or made up? Check media before using it, and ask before filming people. Pure: the pictures, the
// choices and Florence's words. Everything is drawn and made up: no real people, no photographs, nothing frightening.
// The ideas are the ones news teams use: a change is fine when it does not change what happened (brighter colours,
// a level picture) and misleading when it does (taking out the litter in a report about litter). Clues can show a
// machine-made picture, but not always, so also check where it came from and whether it is labelled. Ask before you
// film someone, take no for an answer, and for children ask a parent or carer too, especially before it goes online.

// ---- part 1: what changed, and does the change mislead?
export const CHANGES = [
  { id: 'colour', about: 'A film about the town hall.', changed: 'The colours were made brighter.', fine: true,
    decoys: ['A tree was taken out.', 'The hall was made bigger.'], why: 'Brighter colours do not change what happened. Editors fix colours all the time.' },
  { id: 'level', about: 'A film about market day.', changed: 'The picture was turned so it is level.', fine: true,
    decoys: ['A stall was added.', 'The sky was changed.'], why: 'Making the picture level does not change what happened.' },
  { id: 'litter', about: 'A news report called “Our river is clean!”', changed: 'The litter in the river was taken out.', fine: false,
    decoys: ['The river was made wider.', 'The trees were made greener.'], why: 'The report says the river is clean, but it was not. Taking the litter out changes what happened.' },
  { id: 'copies', about: 'A news report called “Lots of otters are back!”', changed: 'One otter was copied to make four.', fine: false,
    decoys: ['The water was made bluer.', 'The otter was made bigger.'], why: 'There was only one otter. Copying it makes people believe something that is not true.' },
];
const order3 = (i, list) => [[1, 0, 2], [2, 1, 0], [0, 2, 1], [1, 2, 0]][i % 4].map((k) => list[k]);
export function changeItems() {
  return CHANGES.map((c, i) => ({
    id: c.id, about: c.about,
    what: { q: 'What was changed?', say: `${i === 0 ? 'Look at the picture as it was filmed, and as it was shown. ' : ''}${c.about} What was changed?`,
      opts: order3(i, [c.changed, ...c.decoys]).map((t, k) => ({ id: t === c.changed ? 'yes' : 'no' + k, label: t, why: 'Compare the two pictures again. Did that change?' })), answer: 'yes',
      ok: c.changed, hint: 'Look at one part at a time: the sky, the ground, what is in the middle.' },
    judge: { q: 'Is that change fine, or does it mislead?', say: `${c.about} ${c.changed} Is that fine, or does it mislead people?`,
      opts: [{ id: 'fine', icon: '👍', label: 'Fine: it does not change what happened', why: 'Think about what the film says. Would people now believe something that did not happen?' },
        { id: 'mislead', icon: '⚠️', label: 'Misleading: it changes what happened', why: 'Did it change what really happened, or only how the picture looks?' }],
      answer: c.fine ? 'fine' : 'mislead', ok: c.why },
  }));
}

// ---- part 2: filmed, or made by a machine? Each picture comes with where it came from.
// clue: the one thing in the picture (or on it) that shows a machine made it. decoys: things that are true of the
// picture but are not clues.
export const PICTURES = [
  { id: 'homes', from: 'From the town hall’s camera, with the date it was filmed.', made: false, decoys: ['The roofs are red.', 'There is a cloud.'],
    ok: 'Nothing odd, and we know who filmed it and when. That is a good sign.' },
  { id: 'sign', from: 'Shared online. Nobody says who made it.', made: true, clue: 'The letters on the sign are jumbled.', decoys: ['The stalls have roofs.', 'The sky is blue.'], alsoCant: true,
    ok: 'Jumbled letters are a common clue in machine-made pictures. A real sign could be misspelt, so it is a clue, not proof. Check where it came from too.' },
  { id: 'shadows', from: 'Sent in to the town news. It does not say by whom.', made: true, clue: 'One tree has two shadows pointing opposite ways, with one sun.', decoys: ['The tree is green.', 'The grass is short.'],
    ok: 'With one sun, every shadow points the same way. Two opposite shadows could not happen in real life.' },
  { id: 'otters', from: 'From the river warden, who filmed it on her walk.', made: false, decoys: ['The water has ripples.', 'There are two otters.'],
    ok: 'Nothing odd, and we know who filmed it. That is a good sign.' },
  { id: 'park', from: 'Shared online. Nobody says who made it.', made: null, decoys: ['The trees are green.', 'There is a cloud.'],
    ok: 'No clue at all, and nobody says where it came from. No clue is not proof that it is real. Find out who made it before you use it.' },
  { id: 'sheep', from: 'Shared online. Nobody says who made it.', made: true, clue: 'The sheep has six legs.', decoys: ['The sheep is white.', 'There are trees behind it.'],
    ok: 'Sheep have four legs. A real picture could not show six.' },
  { id: 'evening', from: 'Sent in by message, with no name on it.', made: null, senior: true, decoys: ['The sun is low.', 'The water is calm.'],
    ok: 'Nothing odd in the picture, and no name on it. You cannot tell yet: ask who sent it, and where it came from.' },
  { id: 'poster', from: 'The festival poster.', made: true, clue: 'It is labelled “Made with AI”.', decoys: ['The tent is pink.', 'It is evening.'], label: true,
    ok: 'There is nothing odd in the picture itself. The label is what tells you. Always read it.' },
];
// made: true (a machine made it; there is a clue), false (filmed, and we know who filmed it), null (no clue and no
// source: the only right answer is "can't tell yet"). Ages 8–12 see one picture like that, ages 13–17 two.
export function pictureItems(senior = false) {
  return PICTURES.filter((p) => senior || !p.senior).map((p, i) => {
    const filmed = { id: 'filmed', icon: '📷', label: 'Filmed: no clue, and we know who filmed it', why: p.made ? 'Look again. Is there anything in or on it that could not be real?' : 'No clue is not proof. Do we know who filmed it?' };
    const cant = { id: 'cant', icon: '❓', label: 'Can’t tell yet: check where it came from', why: p.made === false ? 'We do know where this came from: who filmed it, and when. Is there anything odd in it?' : p.label ? 'Look at the corner. It says how it was made.' : 'Look again: there is something in this picture you can check.' };
    const clues = p.made ? [p.clue, p.decoys[0]] : p.decoys.slice(0, 2);
    const made = clues.map((c, k) => ({ id: c === p.clue ? 'clue' : 'd' + k, icon: '🤖', label: `Made by a machine: ${c.charAt(0).toLowerCase() + c.slice(1)}`, why: 'That could be in a real picture too. It is not a clue.' }));
    const opts = [[filmed, made[0], cant, made[1]], [made[0], filmed, made[1], cant], [cant, made[1], filmed, made[0]], [made[1], cant, made[0], filmed]][i % 4];
    return { id: p.id, from: p.from, q: 'Filmed, made by a machine, or can’t tell yet?', say: `${i === 0 ? 'Some pictures are filmed. Some are made by a machine. Some you cannot tell yet. ' : ''}${p.from} What do you think?`,
      opts, answer: p.made ? 'clue' : p.made === false ? 'filmed' : 'cant', ...(p.alsoCant ? { answers: ['clue', 'cant'] } : {}), ok: p.ok,
      hint: p.made ? 'Look for something that could not happen in real life, or a label.' : 'Think about where it came from as well as what is in it.' };
  });
}
export const HONEST = [
  'Clues like these help. But machine-made pictures keep getting better, and some have no clue at all.',
  'So also ask: where did it come from? Who made it? Does it say it was made by a machine?',
  'When I make a picture, I say so. That is the honest thing to do.',
];

// ---- part 3: asking before filming people, and being honest about who made the film
export const PERMISSION = [
  { art: 'picnic', q: 'You want a close-up of a family having a picnic in the park. What do you do?', answer: 'ask',
    opts: [{ id: 'ask', label: 'Ask them first, and say what the film is for.' }, { id: 'quick', label: 'Film them quickly before they notice.', why: 'Filming people close up without asking is not fair to them.' }, { id: 'hide', label: 'Hide behind a tree and zoom in.', why: 'Hiding to film people is not fair. Ask them instead.' }],
    ok: 'Ask first, and tell them what the film is for and who will see it.' },
  { art: 'park', q: 'They say no. What now?', answer: 'without',
    opts: [{ id: 'anyway', label: 'Film them anyway: it is a park.', why: 'When someone says no to being filmed, respect it, wherever you are.' }, { id: 'without', label: 'Film the park without them in it.' }, { id: 'again', label: 'Keep asking until they say yes.', why: 'No means no. Asking again and again is not fair.' }],
    ok: 'No means no. You can still film the park.' },
  { art: 'wave', q: 'A friend from school wants to be in your film. It will go on the town website. What do you do?', answer: 'carer',
    opts: [{ id: 'enough', label: 'Their yes is enough.', why: 'For children, a parent or carer should say yes too, especially before it goes online.' }, { id: 'carer', label: 'Check that a parent or carer says yes too.' }, { id: 'later', label: 'Put it online, then tell them.', why: 'Once it is online, it is hard to take back. Ask first.' }],
    ok: 'For children, ask a parent or carer too, before anything goes online.' },
  { art: 'hall', q: 'Your news film needs a shot of the hall’s opening. Only a few people came. Someone says: “Ask an AI to make a picture of a big crowd.” What do you do?', answer: 'real',
    opts: [{ id: 'yes', label: 'Make the crowd picture: it looks better.', why: 'Only a few people came. A made-up crowd makes people believe something untrue.' }, { id: 'real', label: 'Show the few people who really came.' }, { id: 'secret', label: 'Make it, and don’t say it was made.', why: 'A made-up picture in the news, kept secret, misleads everyone who sees it.' }],
    ok: 'News shows what really happened. If you ever use a made picture somewhere else, label it.' },
  { art: 'credits', q: 'The last card of your film. What should it say about my part?', answer: 'both',
    opts: [{ id: 'me', label: 'Made by me.', why: 'I worked the camera. Leaving me out is not the whole truth.' }, { id: 'flo', label: 'Made by Florence.', why: 'You directed it: you chose the place, the people, the mood and the changes.' }, { id: 'both', label: 'Directed by me. Camera by Florence, an AI helper.' }],
    ok: 'That says who did what, and that an AI helped. Honest credits matter.' },
];
export const permissionItems = () => PERMISSION.map((p, i) => ({ ...p, say: `${i === 0 ? 'Now, filming real people. ' : ''}${p.q}`, opts: p.opts.map((o) => ({ ...o, why: o.why || '' })), hint: i < 3 ? 'Think about how the people in the film would feel.' : 'What would be true, and fair to the people watching?' }));

export const PARTS = [
  { id: 'change', title: 'Part 1: what changed?', line: 'Editors change pictures. Some changes are fine. Some change what happened. Spot the change, then decide.' },
  { id: 'made', title: 'Part 2: filmed, or made by a machine?', line: 'Look for clues, and look at where each picture came from.' },
  { id: 'ask', title: 'Part 3: asking first', line: 'A film crew asks people before filming them. What would you do?' },
];
export const truthLines = (r) => [`You checked ${num(r.pics)} pictures for clues and for where they came from.`, 'You chose to ask before filming people, and to credit Florence honestly.'];
