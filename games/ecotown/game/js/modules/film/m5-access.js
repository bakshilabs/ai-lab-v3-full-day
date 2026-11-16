// Mission 5, making it for everyone: captions for people who cannot hear the sound, and a described version for
// people who cannot see the screen. Pure: the moments, the choices and Florence's words.
// The rules are the ones caption and description writers use: say who is speaking when you cannot see them, put
// important sounds in [square brackets] and say what kind of sound or music it is, keep a caption short enough to read
// before it goes (most people read about three words a second), and in a description say what is on screen, in the
// gap, without guessing or giving an opinion.
export const READ_WPS = 3;     // words a second most people can read in a caption (about 180 words a minute)
export const SPEAK_WPS = 2.5;  // words a second a describer speaks (about 150 words a minute)
export const words = (t) => String(t).replace(/[[\]“”"]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
// the order the three choices are shown in, so the best one is not always first
const ORDERS = ['bac', 'cab', 'acb', 'bca'];
const byOrder = (i) => (x, y) => ORDERS[i % 4].indexOf(x.id) - ORDERS[i % 4].indexOf(y.id);
const rate = (t, secs) => Math.round(words(t) / secs * 10) / 10;

// ---- part 1: captions. hear: what happens in the sound. secs: how long the caption is on screen.
const CAPTIONS = [
  { art: 'otters', hear: 'Florence, who is off screen, says: “Look, the otters are back!”', secs: 3, answer: 'a',
    opts: { a: 'FLORENCE: Look, the otters are back!', b: 'Look, the otters are back!', c: 'Florence the robot, who is standing by the river where nobody can see her, says that she can see the otters have come back again.' },
    why: { b: 'Who is speaking? Florence is off screen, so the caption must say it is her.', c: 'Too long to read before it disappears.' },
    ok: 'It says who is speaking, and it is short enough to read.', hint: 'You cannot see who is talking. Which caption helps?' },
  { art: 'splash', hear: 'An otter dives in with a big splash.', secs: 2, answer: 'a',
    opts: { a: '[Big splash]', b: '(no caption)', c: 'SPLASH SPLASH SPLASH SPLASH SPLASH' },
    why: { b: 'Someone who cannot hear would miss the splash. Important sounds get a caption too.', c: 'Writing the sound over and over is hard to read. Describe it once, in square brackets.' },
    ok: 'Sounds go in square brackets, so people know it is a sound and not someone talking.', hint: 'How do captions show a sound that is not someone talking?' },
  { art: 'river-evening', hear: 'Slow, calm music starts as the sun sets.', secs: 3, answer: 'a',
    opts: { a: '[Slow, calm music]', b: '[Music]', c: '♪ La la la ♪' },
    why: { b: 'It says there is music, but not what it feels like. The music sets the mood.', c: 'This music has no words. Writing words makes them up.' },
    ok: 'It says what kind of music it is, so people get the mood.', hint: 'The music sets the mood. Which caption tells you the mood?' },
  { art: 'family', hear: 'Someone laughs. You cannot see who.', secs: 2, answer: 'a',
    opts: { a: '[Laughter, off screen]', b: 'Ha ha ha', c: '(no caption)' },
    why: { b: 'Who is laughing? “Ha ha ha” looks like someone on screen is talking.', c: 'The laugh matters: people turn to look. Someone who cannot hear needs to know.' },
    ok: 'It says what the sound is and that it comes from off screen.', hint: 'Say what the sound is, and where it comes from.' },
];
export function captionItems(junior) {
  return CAPTIONS.map((c, i) => ({
    art: c.art, hear: c.hear, q: 'Which caption is best?', say: `${i === 0 ? 'Captions show the sound as words, for people who cannot hear it. ' : ''}${c.hear} Which caption is best?`,
    opts: ['a', 'b', 'c'].map((k) => ({ id: k, label: c.opts[k], why: (c.why[k] || '') + (!junior && k === 'c' && words(c.opts[k]) > 8 ? ` ${words(c.opts[k])} words in ${c.secs} seconds is ${rate(c.opts[k], c.secs)} words a second: most people read about ${READ_WPS}.` : '') })).sort(byOrder(i)),
    answer: c.answer, ok: c.ok, hint: c.hint,
    more: junior ? '' : `On screen for ${c.secs} seconds: ${words(c.opts[c.answer])} word${words(c.opts[c.answer]) === 1 ? '' : 's'}, about ${rate(c.opts[c.answer], c.secs)} a second. Most people can read about ${READ_WPS} words a second.`,
    caption: c.opts[c.answer],
  }));
}

// ---- part 2: the described version. gap: the seconds with no talking, where the description is spoken.
const DESCS = [
  { art: 'lab', gap: 4, answer: 'a',
    opts: { a: 'Florence waves from the door of the AI Lab.', b: 'What a lovely day! I think Florence is really happy.', c: 'Florence, a wooden robot with round ears, a screen for a face and a ball on a stick on her head, stands by a white building with a green roof, two windows and a door, and lifts one arm to wave.' },
    why: { b: 'Say what you can see, not what you think about it.', c: 'Too long for the gap: the next sound would talk over it.' },
    ok: 'It says who, where and what happens, and fits the gap.', hint: 'Who is it, where are they, and what do they do?' },
  { art: 'clouds', gap: 4, answer: 'a',
    opts: { a: 'Dark clouds roll over the market stalls.', b: 'It goes dark.', c: 'The stall keepers will have to cover their stalls soon.' },
    why: { b: 'Too little. Dark how? Where? Someone who cannot see needs more.', c: 'That guesses what happens next. Describe what is on screen now.' },
    ok: 'Clear and short: what you see, and where.', hint: 'What is on the screen right now?' },
  { art: 'sun', gap: 4, answer: 'a',
    opts: { a: 'The sun comes out. The market is busy again.', b: 'The end.', c: 'Everyone is so happy. It is the best market ever!' },
    why: { b: 'That does not say what is on screen. What can you see?', c: 'That is an opinion. Say what you can see, and let people feel it for themselves.' },
    ok: 'It says what changed, so someone who cannot see knows how it ends.', hint: 'What can you see that is different now?' },
];
export function descItems(junior) {
  return DESCS.map((d, i) => ({
    art: d.art, q: `Which description fits this ${d.gap}-second gap?`, say: `${i === 0 ? 'A described version has a voice that says what is on screen, in the gaps when nobody is talking. ' : ''}Which description fits this gap?`,
    opts: ['a', 'b', 'c'].map((k) => ({ id: k, label: d.opts[k], why: (d.why[k] || '') + (!junior && k === 'c' && words(d.opts[k]) > 12 ? ` ${words(d.opts[k])} words take about ${Math.round(words(d.opts[k]) / SPEAK_WPS)} seconds to say. The gap is ${d.gap}.` : '') })).sort(byOrder(i + 1)),
    answer: d.answer, ok: d.ok, hint: d.hint,
    more: junior ? '' : `${words(d.opts[d.answer])} words take about ${Math.round(words(d.opts[d.answer]) / SPEAK_WPS * 10) / 10} seconds to say at ${SPEAK_WPS} words a second. The gap is ${d.gap} seconds.`,
    desc: d.opts[d.answer],
  }));
}

// ---- part 3: the version for everyone, shot by shot: the picture, its caption, and its spoken description
export function screening(caps, descs) {
  return [
    { art: 'lab', desc: descs[0].desc, cap: '' },
    { art: 'otters', cap: caps[0].caption, desc: '' },
    { art: 'splash', cap: caps[1].caption, desc: '' },
    { art: 'river-evening', cap: caps[2].caption, desc: '' },
    { art: 'clouds', cap: '', desc: descs[1].desc },
    { art: 'sun', cap: caps[3].caption, desc: descs[2].desc },
  ];
}
export const PARTS = [
  { id: 'caps', title: 'Part 1: captions', line: 'Captions put the sound into words, for people who cannot hear it. Pick the best caption for each sound.' },
  { id: 'desc', title: 'Part 2: the described version', line: 'For people who cannot see the screen, a voice says what is happening in the gaps. Pick the best words for each gap.' },
  { id: 'show', title: 'Part 3: the version for everyone', line: 'Here is the film with your captions on screen and your descriptions in the gaps.' },
];
export const accessLines = (r) => [`You chose ${r.caps} captions and ${r.descs} descriptions, ${r.first} of them at the first try.`, 'Captions help people who cannot hear. Description helps people who cannot see.'];
