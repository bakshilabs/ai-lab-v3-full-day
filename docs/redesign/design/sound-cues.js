// Sound cues for the redesigned Eco Town levels (a proposal; nothing in the game or the film uses this file yet).
// Every sound is made with the game's own chip engine: note() from games/ecotown/game/js/engine/chip.js
// (a copy is in docs/redesign/animation/snd/engine/chip.js). No audio files and no voices.
// The design, the loudness targets and the reasons are in docs/redesign/design/sound.md.
//
// How to use it in the film (docs/redesign/animation/sound.js) or in the game:
//
//   import { note } from './snd/engine/chip.js';
//   import { SONGS } from './snd/music/songs.js';
//   import { makeCues, registerSongs, bedPlan, BED } from '../design/sound-cues.js';
//   const cues = makeCues({ note }, SE);          // SE is createEngine(ctx), or anything with { ctx, fx: { ctx, dest } }
//   cues.wordLand(12.4, 0);                       // every cue takes the time to play at as its first argument
//   cues.tests[2](40, 10.5);                      // the test scene of level 3, starting at 40 s, 10.5 s long
//   registerSongs(SONGS);                         // adds the six beds 'eco1' … 'eco6' to the game's song list
//   renderSong(ME, BED[li].song, seconds);        // then play one like any other song
//
// In the live game leave the time out (cues.tick()) and the cue plays now.
// All pitches are from one five-note family (C D E G A), so cues from many devices at once never clash,
// and they fit over every bed (the beds are in F, G and C major and D Dorian, which all contain those notes).

const PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];   // C D E G A over two octaves, as MIDI notes
const PLAN = [72, 76, 79];                                     // the note of plan A, plan B and plan C
// a small repeatable random number maker, so that a film renders the same every time
const rnd = (seed) => () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

export function makeCues({ note }, EN, { trim = 1 } = {}) {
  const fx = EN.fx, at = (t) => t ?? EN.ctx.currentTime + 0.005;
  const N = (o) => note(fx, { ...o, vol: o.vol * trim });
  // small building blocks -------------------------------------------------------------------------------------------
  const ping = (t, m, vol = 0.07, duty = 0.25, ring = 0.16) => N({ midi: m, t, dur: 0.04, vol, duty, env: [0.002, ring, 0.12, ring * 0.6] });
  const thock = (t, vol = 0.09, m = 60) => { N({ ch: 't', midi: m, t, dur: 0.045, vol, slide: 0.6, env: [0.002, 0.03, 0.3, 0.03] }); N({ ch: 'n', f: 900, t, dur: 0.012, vol: vol * 0.25, env: [0.001, 0.01, 0.2, 0.01] }); };
  const stepTick = (t, f = 750, vol = 0.02) => N({ ch: 'n', f, t, dur: 0.014, vol, env: [0.001, 0.012, 0.2, 0.012], filter: { type: 'highpass', f0: 1200 } });
  const bell = (t, m, vol = 0.055) => { N({ midi: m, t, dur: 0.05, vol, duty: 0.125, env: [0.002, 0.28, 0.12, 0.3] }); N({ ch: 't', midi: m - 12, t, dur: 0.22, vol: vol * 0.9, env: [0.002, 0.2, 0.3, 0.25] }); };
  const chirp = (t, n = 2, vol = 0.022) => { for (let i = 0; i < n; i++) N({ f: 2300 + i * 250, t: t + i * 0.085, dur: 0.05, vol, duty: 0.125, slide: 1.45, env: [0.004, 0.03, 0.4, 0.02] }); };
  // a small engine: short low notes, `rate` a second, for `len` seconds
  const putt = (t, len, m = 43, vol = 0.03, rate = 9) => { for (let i = 0; i < len * rate; i++) N({ midi: m + (i % 4 === 3 ? 1 : 0), t: t + i / rate, dur: 0.035, vol, duty: 0.5, env: [0.003, 0.03, 0.3, 0.02] }); };
  const walkers = (t0, t1, steps, r, vol = 0.02, f0 = 650) => steps.forEach((gap, w) => { for (let t = t0 + w * 0.23; t < t1 - w * 0.2; t += gap * (0.94 + r() * 0.12)) stepTick(t, f0 + w * 70 + r() * 60, vol); });

  // the six tests, each a short scene with a beginning, a middle and an end: (start time, length in seconds) -------------
  const tests = [
    // 1. Make it rain: far thunder, single drops that thicken into rain, the river rising, then three last drips
    (t, d) => { const r = rnd(11);
      N({ ch: 't', midi: 48, t: t + 0.1, dur: 0.9, vol: 0.06, slide: 0.6, env: [0.03, 0.3, 0.5, 0.6] }); N({ ch: 'n', f: 420, t: t + 0.1, dur: 1.1, vol: 0.06, slide: 0.5, env: [0.05, 0.4, 0.5, 0.6], filter: { f0: 900, f1: 350 } });
      for (let u = 0.08; u < 0.9;) { const dens = 1.5 + 12 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.8); N({ midi: PENTA[5 + Math.floor(r() * 6)], t: t + u * d, dur: 0.018, vol: 0.02 + r() * 0.014, duty: 0.125, env: [0.002, 0.035, 0.15, 0.03] }); u += (0.6 + r() * 0.8) / dens / d; }
      N({ ch: 'n', f: 3000, t: t + d * 0.12, dur: d * 0.62, vol: 0.01, env: [d * 0.2, 0.5, 0.9, d * 0.2], filter: { type: 'highpass', f0: 1800 } });
      N({ ch: 'n', f: 700, t: t + d * 0.3, dur: d * 0.45, vol: 0.03, env: [1.5, 0.8, 0.9, 1.4], filter: { f0: 400, f1: 1000 } });
      N({ ch: 't', midi: 60, t: t + d * 0.34, dur: d * 0.38, vol: 0.04, slide: 1.5, env: [0.8, 0.5, 0.8, 0.8] });
      [[1.05, 91], [0.65, 88], [0.2, 84]].forEach(([b, m]) => ping(t + d - b, m, 0.05, 0.125, 0.12)); },
    // 2. Open the shops: the shop bell, doors, many feet setting off, one car from the far homes, birds in the kept trees
    (t, d) => { const r = rnd(22);
      bell(t + 0.1, 93); bell(t + 0.34, 88);
      [0.8, 1.0, 1.3].forEach((b) => thock(t + b, 0.05, 57));
      walkers(t + 1.1, t + d * 0.78, [0.42, 0.47, 0.38, 0.5], r);
      N({ midi: 77, t: t + d * 0.45, dur: 0.1, vol: 0.03, duty: 0.25 }); N({ midi: 81, t: t + d * 0.45, dur: 0.1, vol: 0.03, duty: 0.25 }); putt(t + d * 0.45 + 0.2, d * 0.22);
      [0.3, 0.62, 0.8].forEach((u, i) => chirp(t + u * d, 2 + (i % 2)));
      bell(t + d - 0.6, 93, 0.045); },
    // 3. Make the materials: three machines start one after another: the clean electric sawmill, the brick oven, the cement works
    (t, d) => {
      N({ ch: 't', f: 220, t: t + 0.2, dur: 0.6, vol: 0.05, slide: 2, env: [0.05, 0.2, 0.8, 0.1] });
      for (let b = 0.9, i = 0; b < d * 0.86; b += 0.72, i++) N({ f: 330, t: t + b, dur: 0.26, vol: i < 4 ? 0.034 : 0.02, duty: 0.25, slide: 1.6, env: [0.03, 0.1, 0.7, 0.05] });
      const o = t + d * 0.27; thock(o, 0.08, 55); N({ ch: 'n', f: 500, t: o, dur: d * 0.6, vol: 0.028, env: [0.8, 0.5, 0.8, 0.9], filter: { f0: 650 } });
      for (let b = 0.5; b < d * 0.56; b += 0.9) N({ ch: 'n', f: 900, t: o + b, dur: 0.12, vol: 0.035, env: [0.02, 0.08, 0.4, 0.1], filter: { f0: 900 } });
      const c = t + d * 0.5; thock(c, 0.1, 50); N({ ch: 'n', f: 300, t: c, dur: d * 0.38, vol: 0.04, env: [0.6, 0.4, 0.9, 0.7], filter: { f0: 480 } });
      for (let b = 0.45; b < d * 0.36; b += 1.0) { N({ ch: 't', midi: 45, t: c + b, dur: 0.14, vol: 0.09, slide: 0.6 }); N({ f: 110, t: c + b, dur: 0.09, vol: 0.03, duty: 0.125, env: [0.004, 0.06, 0.3, 0.04] }); N({ ch: 'n', f: 500, t: c + b + 0.5, dur: 0.3, vol: 0.04, env: [0.05, 0.15, 0.5, 0.2], filter: { f0: 500, f1: 900 } }); }
      N({ ch: 't', f: 330, t: t + d - 0.9, dur: 0.7, vol: 0.045, slide: 0.33, env: [0.05, 0.2, 0.7, 0.15] }); },
    // 4. Take the food to market: a trotting cart that arrives early, a lorry that drives for much longer, bees and birds
    (t, d) => {
      for (let b = 0.5; b < d * 0.42; b += 0.5) { N({ f: 900, t: t + b, dur: 0.016, vol: 0.04, duty: 0.5, env: [0.001, 0.02, 0.2, 0.02] }); N({ f: 680, t: t + b + 0.16, dur: 0.016, vol: 0.035, duty: 0.5, env: [0.001, 0.02, 0.2, 0.02] }); }
      bell(t + d * 0.44, 91);
      putt(t + d * 0.2, d * 0.64, 36, 0.028, 12);
      N({ midi: 72, t: t + d * 0.86, dur: 0.09, vol: 0.035, duty: 0.25 }); N({ midi: 76, t: t + d * 0.86, dur: 0.09, vol: 0.035, duty: 0.25 }); bell(t + d * 0.9, 88, 0.045);
      [0.3, 0.66].forEach((u) => { N({ f: 233, t: t + u * d, dur: 0.3, vol: 0.02, duty: 0.125, slide: 1.1, env: [0.08, 0.1, 0.8, 0.05] }); N({ f: 256, t: t + u * d + 0.33, dur: 0.3, vol: 0.02, duty: 0.125, slide: 0.9, env: [0.03, 0.1, 0.8, 0.12] }); });
      [0.12, 0.52, 0.76].forEach((u, i) => chirp(t + u * d, 2 + (i % 2))); },
    // 5. Keep the lights on: dusk falls, the wind blows, lights click on one by one, one plan's lights droop, the rest hold steady
    (t, d) => {
      N({ ch: 't', midi: 67, t: t + 0.2, dur: 1.6, vol: 0.06, slide: 0.6, env: [0.3, 0.5, 0.7, 0.6] });
      N({ ch: 'n', f: 450, t: t + 0.6, dur: d * 0.34, vol: 0.03, env: [1.2, 0.6, 0.8, 1.2], filter: { f0: 300, f1: 900 } }); N({ ch: 'n', f: 450, t: t + d * 0.5, dur: d * 0.34, vol: 0.026, env: [1.2, 0.6, 0.8, 1.2], filter: { f0: 800, f1: 320 } });
      for (let b = d * 0.2; b < d * 0.9; b += 0.9) N({ ch: 'n', f: 1200, t: t + b, dur: 0.22, vol: 0.013, env: [0.08, 0.08, 0.5, 0.1], filter: { f0: 600, f1: 1800 } });
      for (let i = 0; i < 10; i++) { const b = t + d * (0.25 + 0.26 * Math.pow(i / 10, 0.75)); stepTick(b, 1500, 0.03); ping(b + 0.03, PENTA[i % 6 + (i > 5 ? 2 : 0)], 0.04, 0.25, 0.1); }
      N({ midi: 64, t: t + d * 0.58, dur: 0.55, vol: 0.055, duty: 0.5, slide: 0.4, env: [0.01, 0.2, 0.7, 0.1] });
      N({ ch: 't', midi: 60, t: t + d * 0.66, dur: d * 0.24, vol: 0.05, env: [0.5, 0.4, 0.8, 0.6] }); N({ ch: 't', midi: 67, t: t + d * 0.66, dur: d * 0.24, vol: 0.04, env: [0.5, 0.4, 0.8, 0.6] });
      ping(t + d - 0.55, 84, 0.04); ping(t + d - 0.4, 88, 0.04); },
    // 6. Ring the school bell: a hand bell rung three times, many light quick feet, one car from the far homes, a last bell
    (t, d) => { const r = rnd(66);
      for (let k = 0; k < 6; k++) bell(t + 0.15 + k * 0.4, k % 2 ? 88 : 93, 0.06);
      walkers(t + 2.5, t + d * 0.86, [0.3, 0.34, 0.27, 0.36, 0.31], r, 0.018, 800);
      putt(t + d * 0.55, d * 0.16, 43, 0.028);
      chirp(t + d * 0.42, 2);
      bell(t + d - 0.6, 93, 0.05); },
  ];

  return {
    tests,
    // ---- ordinary buttons --------------------------------------------------------------------------------------
    press(t) { N({ midi: 79, t: at(t), dur: 0.025, vol: 0.04, duty: 0.25, env: [0.002, 0.02, 0.3, 0.02] }); },
    // ---- building the sentence -----------------------------------------------------------------------------------
    // a word button is picked up
    wordPick(t) { N({ midi: 84, t: at(t), dur: 0.02, vol: 0.035, duty: 0.125, env: [0.002, 0.02, 0.3, 0.02] }); },
    // the word settles into gap number `gap` (0, 1, 2 …): each gap is one note higher, so the sentence climbs
    wordLand(t, gap = 0) { t = at(t); thock(t, 0.07); ping(t + 0.02, PENTA[Math.min(gap, 4)], 0.075); },
    // every gap is full: the notes of the gaps are repeated quickly and end on an open, waiting pair of notes
    sentenceReady(t, gaps = 2) { t = at(t); for (let i = 0; i < gaps; i++) ping(t + i * 0.07, PENTA[Math.min(i, 4)], 0.05, 0.25, 0.08); const e = t + gaps * 0.07 + 0.03; ping(e, 79, 0.06, 0.25, 0.3); ping(e, 84, 0.05, 0.125, 0.3); },
    // the Ask button: a press, and the sentence flying up to Florence
    ask(t) { t = at(t); thock(t, 0.08, 62); N({ midi: 72, t: t + 0.03, dur: 0.16, vol: 0.06, duty: 0.25, slide: 2, env: [0.01, 0.08, 0.6, 0.05] }); N({ ch: 'n', f: 600, t: t + 0.03, dur: 0.2, vol: 0.02, slide: 4, filter: { f0: 700, f1: 3000 } }); },
    // ---- Florence (the soft triangle voice between 1,000 and 2,000 Hz belongs to her and to nothing else) -------------
    hello(t) { t = at(t); [84, 88, 91].forEach((m, i) => N({ ch: 't', midi: m, t: t + i * 0.09, dur: i === 2 ? 0.16 : 0.06, vol: 0.05 })); },
    // thinking: three rising dots, repeated quietly for `dur` seconds (the picture is the "…" bubble)
    think(t, dur = 1.4) { t = at(t); for (let i = 0; i * 0.22 < dur - 0.2; i++) N({ ch: 't', midi: [84, 88, 91][i % 3], t: t + i * 0.22, dur: 0.05, vol: 0.04, env: [0.004, 0.08, 0.3, 0.08] }); },
    // speaking: one soft blip for each word, at about three and a half words a second, for at most `max` seconds.
    // Only the lengths of the words are used. The line falls at the end, like a sentence.
    speak(t, text = '', dur = 2, max = 1.6) { t = at(t); const words = String(text).split(/\s+/).filter(Boolean), n = Math.min(words.length, Math.floor(Math.min(dur, max) * 3.5)); const line = [0, 1, 2, 1, 3, 2, 1, 0];
      for (let i = 0; i < n; i++) { const last = i === n - 1; N({ ch: 't', midi: [84, 86, 88, 91][last ? 0 : line[(i + words[i].length) % 8]], t: t + i / 3.5, dur: Math.min(0.09, 0.03 + words[i].length * 0.008), vol: last ? 0.03 : 0.036, env: [0.004, 0.05, 0.4, 0.05] }); } },
    // ---- the plans ---------------------------------------------------------------------------------------------
    // plan number i (0, 1, 2) is set down on the table. Each plan keeps its own note: A low, B middle, C high.
    planArrive(t, i = 0) { t = at(t); thock(t, 0.09, 57); ping(t + 0.03, PLAN[i % 3], 0.07, 0.5, 0.2); },
    // ---- the test ----------------------------------------------------------------------------------------------
    // the one big button of the level: a clunk and three rising notes that hand over to the test scene
    testPress(t) { t = at(t); thock(t, 0.14, 55); [60, 67, 72].forEach((m, i) => N({ ch: 't', midi: m, t: t + 0.06 + i * 0.1, dur: 0.09, vol: 0.07 + i * 0.02 })); N({ midi: 84, t: t + 0.36, dur: 0.05, vol: 0.06, duty: 0.25, env: [0.002, 0.3, 0.15, 0.2] }); },
    // ---- the results: tick rises, dash stays level, cross falls. `row` is the check (0, 1, 2) -------------------------
    tick(t, row = 0) { t = at(t); N({ midi: 79 + [0, 2, 5][row % 3], t, dur: 0.025, vol: 0.05, duty: 0.25 }); ping(t + 0.04, 84 + [0, 2, 4][row % 3], 0.08, 0.25, 0.16); },
    dash(t) { t = at(t); for (const b of [0, 0.1]) N({ ch: 't', midi: 69, t: t + b, dur: 0.05, vol: 0.085, env: [0.004, 0.04, 0.5, 0.04] }); },
    cross(t) { t = at(t); N({ midi: 67, t, dur: 0.07, vol: 0.042, duty: 0.5, env: [0.005, 0.05, 0.6, 0.04] }); N({ midi: 64, t: t + 0.09, dur: 0.12, vol: 0.042, duty: 0.5, env: [0.005, 0.08, 0.5, 0.08] }); },
    // a plan that is good on every check: a small shimmer after its last tick
    allGood(t) { t = at(t); [88, 91, 96].forEach((m, i) => ping(t + i * 0.05, m, 0.035, 0.125, 0.14)); },
    // ---- the choice --------------------------------------------------------------------------------------------
    // the child chooses plan i: the plan's own note, answered a fifth and an octave above
    choose(t, i = 0) { t = at(t); const m = PLAN[i % 3]; thock(t, 0.1, 57); ping(t + 0.02, m, 0.08, 0.5, 0.14); ping(t + 0.11, m + 7, 0.08, 0.25, 0.14); ping(t + 0.2, m + 12, 0.08, 0.25, 0.3); N({ ch: 't', midi: m - 12, t: t + 0.2, dur: 0.25, vol: 0.09 }); },
    // "Try another plan" and "Ask again": the same three notes going back down, quietly (going back is allowed, not a mistake)
    goBack(t) { t = at(t); [79, 76, 72].forEach((m, i) => ping(t + i * 0.07, m, 0.04, 0.5, 0.08)); },
    // ---- the town changes ----------------------------------------------------------------------------------------
    // the chosen plan is built into the town over `d` seconds: pieces land faster and faster on a tune of the level's own,
    // and the last piece lands on a held pair of notes. `li` is the level (0 to 5).
    build(t, d = 5, li = 0) { t = at(t); const tune = [[0, 2, 1, 3, 2, 4, 3, 5], [0, 1, 2, 4, 2, 3, 4, 5], [2, 0, 3, 1, 4, 2, 5, 4], [0, 3, 2, 4, 1, 3, 4, 5], [4, 2, 3, 1, 2, 0, 3, 5], [0, 2, 4, 2, 3, 5, 4, 6]][li % 6], duty = [0.5, 0.25, 0.5, 0.25, 0.125, 0.25][li % 6];
      let b = 0.05, i = 0; while (b < d - 0.9) { thock(t + b, 0.085, 57 + (i % 2) * 2); ping(t + b + 0.03, PENTA[tune[i % 8]], 0.055, duty, 0.1); b += Math.max(0.24, 0.5 - i * 0.03); i++; }
      const e = t + d - 0.55; thock(e, 0.11, 55); ping(e + 0.03, 79, 0.07, 0.25, 0.3); ping(e + 0.03, 84, 0.06, 0.25, 0.3); N({ ch: 't', midi: 60, t: e + 0.03, dur: 0.3, vol: 0.09 }); },
    // ---- the recap -----------------------------------------------------------------------------------------------
    // the right place on the town is tapped
    recapRight(t) { t = at(t); ping(t, 76, 0.07, 0.25, 0.08); ping(t + 0.08, 79, 0.07, 0.25, 0.08); ping(t + 0.16, 88, 0.075, 0.25, 0.3); ping(t + 0.3, 96, 0.03, 0.125, 0.2); },
    // another place is tapped: two soft notes that rise like a question (never a buzzer; the child simply tries again)
    recapTry(t) { t = at(t); N({ ch: 't', midi: 69, t, dur: 0.08, vol: 0.085 }); N({ ch: 't', midi: 72, t: t + 0.12, dur: 0.14, vol: 0.085 }); },
    // ---- the ends ------------------------------------------------------------------------------------------------
    // level `li` (0 to 5) is finished. Each level ends one note higher than the last, so the six levels climb a staircase
    // across the hour: C, D, E, G, A and the C above.
    levelComplete(t, li = 0) { t = at(t); const top = PENTA[5 + (li % 6)], e = 0.085;
      [72, 76, 79].forEach((m, i) => N({ midi: m, t: t + i * e, dur: e * 0.9, vol: 0.085, duty: 0.25 }));
      N({ midi: top, t: t + 3 * e, dur: 0.34, vol: 0.09, duty: 0.25, env: [0.003, 0.2, 0.5, 0.25] }); N({ midi: top - (li % 6 === 3 ? 3 : 5), t: t + 3 * e, dur: 0.34, vol: 0.05, duty: 0.5, env: [0.003, 0.2, 0.5, 0.25] });
      N({ ch: 't', midi: 48, t, dur: 0.22, vol: 0.12 }); N({ ch: 't', midi: 55, t: t + 3 * e, dur: 0.34, vol: 0.11 });
      for (let i = 0; i < 4; i++) ping(t + 0.62 + i * 0.07, PENTA[6 + ((i * 2 + li) % 5)], 0.03, 0.125, 0.1); },
    // the end of the hour: the whole staircase is played once more, one step for each finished level, and it ends on a full chord
    hourComplete(t) { t = at(t); const e = 0.16;
      for (let i = 0; i < 6; i++) { N({ midi: PENTA[5 + i], t: t + i * e, dur: e * 0.85, vol: 0.085, duty: 0.25 }); N({ ch: 't', midi: [48, 50, 52, 55, 57, 55][i], t: t + i * e, dur: e * 0.85, vol: 0.11 }); if (i % 2 === 0) stepTick(t + i * e, 1800, 0.03); }
      const c = t + 6 * e + 0.05; [[84, 0.085, 0.25], [88, 0.06, 0.25], [91, 0.05, 0.125], [76, 0.05, 0.5]].forEach(([m, v, du]) => N({ midi: m, t: c, dur: 0.7, vol: v, duty: du, env: [0.004, 0.3, 0.6, 0.4] })); N({ ch: 't', midi: 48, t: c, dur: 0.8, vol: 0.13 });
      for (let i = 0; i < 8; i++) ping(c + 0.5 + i * 0.07, PENTA[5 + ((i * 3) % 6)], 0.03, 0.125, 0.1); },
    // ---- the pictures between the parts -----------------------------------------------------------------------------
    // the level's title card slides in
    title(t) { t = at(t); N({ ch: 'n', f: 300, t, dur: 0.28, vol: 0.022, slide: 5, filter: { f0: 400, f1: 2400 } }); ping(t + 0.22, 79, 0.06, 0.25, 0.1); ping(t + 0.31, 84, 0.06, 0.25, 0.22); },
    // a wipe between the town and the table: much quieter than the game's whoosh, because it happens four times in a level
    wipe(t, up = true) { N({ ch: 'n', f: up ? 300 : 1400, t: at(t), dur: 0.3, vol: 0.022, slide: up ? 5 : 0.2, env: [0.06, 0.1, 0.7, 0.1], filter: { f0: up ? 400 : 2400, f1: up ? 2400 : 400 } }); },
  };
}

// ---- the music ------------------------------------------------------------------------------------------------------
// Six beds, one for each level, made from the game's own songs 'day' and 'night' without changing them:
// a new key, a slower speed and fewer instruments at the start of the hour, more as the town grows.
// registerSongs(SONGS) adds them to the song list under the names 'eco1' to 'eco6'.
function variant(base, { tr = 0, bpm, lead = 1, harm = 1, bass = 1, drum = 1, kit = 'khs' }) {
  const up = (ev) => ev.map(([s, m, l]) => [s, m + tr, l]);
  return { ...base, bpm, vol: { lead: base.vol.lead * lead, harm: base.vol.harm * harm, bass: base.vol.bass * bass, drum: base.vol.drum * drum },
    sections: Object.fromEntries(Object.entries(base.sections).map(([k, s]) => [k, { chords: s.chords, lead: lead ? up(s.lead) : [] }])),
    arp: (ch) => up(base.arp(ch)), bass: (ch) => up(base.bass(ch)), drums: (bars) => base.drums(bars).filter(([, k]) => kit.includes(k)) };
}
export function registerSongs(SONGS) {
  SONGS.eco1 = variant(SONGS.day, { bpm: 104, lead: 0, harm: 0.8, drum: 0.6, kit: 'h' });              // F major: bass, soft chords and a hat only
  SONGS.eco2 = variant(SONGS.day, { bpm: 110, lead: 0.7, harm: 0.8, drum: 0.7, kit: 'kh' });            // F major: the tune arrives, with a kick
  SONGS.eco3 = variant(SONGS.day, { tr: 2, bpm: 108, lead: 0.7, drum: 0.8, kit: 'khs' });               // G major: one step brighter
  SONGS.eco4 = variant(SONGS.day, { tr: -5, bpm: 116, lead: 0.75, drum: 0.9, kit: 'khs' });             // C major: lower and warmer, the full band
  SONGS.eco5 = variant(SONGS.night, { bpm: 92, lead: 1, harm: 1.1, drum: 1, kit: 'kh' });               // D Dorian: the game's night tune, for the winter evening
  SONGS.eco6 = variant(SONGS.day, { bpm: 122, lead: 0.8, drum: 1, kit: 'khs' });                        // F major again, full and a little faster: home
  return ['eco1', 'eco2', 'eco3', 'eco4', 'eco5', 'eco6'];
}
// which bed each level uses, and the level of the music bus (the engine's `music` gain) at each part of a level.
// 1 is the bed's normal level, which is BED_LEVEL on the engine's music gain.
export const BED_LEVEL = 0.13;
export const BED = [0, 1, 2, 3, 4, 5].map((li) => ({ song: `eco${li + 1}` }));
export const PART = { title: 1, invite: 0.5, sentence: 0.8, think: 0.3, plans: 0.5, testWait: 0.5, test: 0, results: 0, choose: 0.5, build: 1, recap: 0.5, yes: 0.3, after: 1 };
// The music levels for one level of the film, from the times that film.js already works out for it (m.inv, m.ask, m.think …).
// Returns a list of [time, level of the music gain, time constant] to pass to gain.setTargetAtTime(level, time, constant).
export function bedPlan(m, start = 0, level = BED_LEVEL) {
  const k = (name) => PART[name] * level, s = (t) => start + t;
  return [[s(0), k('title'), 0.4], [s(m.inv[0]), k('invite'), 0.15], [s(m.ask), k('sentence'), 0.4], [s(m.think[0] - 0.2), k('think'), 0.12], [s(m.offers[0]), k('plans'), 0.15], [s(m.offers[1]), k('testWait'), 0.3],
    [s(m.testTap), k('test'), 0.12], [s(m.res[1]), k('choose'), 0.5], [s(m.w2 - 0.3), k('build'), 0.4], [s(m.after[0] + 1.5), k('invite'), 0.3], [s(m.recap[0]), k('recap'), 0.3], [s(m.yes[0] - 0.1), k('yes'), 0.08], [s(m.yes[0] + 1.3), k('after'), 0.4]];
}

// ---- the film's whole sound track, as an example of the design in use ---------------------------------------------------
// filmEvents(m) turns one part of the film (a segment made in docs/redesign/animation/film.js) into a list of
// [time in the part, cue name, ...what the cue needs]. A level part needs these fields from film.js:
// kind, li, gaps, askTap, think, w1, offers, testTap, test, res, chooseTap, w2, build, recapTap, yes, and
// pick (the chosen plan) and rows (for each check, the rating 'g', 'f' or 'p' of each plan: v.res.map((r) => r.slice(1).map((x) => x[0]))).
export function filmEvents(m) {
  if (m.kind === 'lead') return m.dur ? [[0.3, 'wipe'], [3.2, 'wipe', false], [5.2, 'title']] : [];
  if (m.kind === 'welcome') return [[0.2, 'wipe'], [0.8, 'hello']];
  if (m.kind === 'end') return [[0.2, 'wipe'], [1, 'hourComplete']];
  const ev = [[0.2, 'title']], n = m.rows[0].length, name = { g: 'tick', f: 'dash', p: 'cross' };
  m.gaps.forEach((g, k) => ev.push([g + 1.4, 'wordPick'], [g + 1.85, 'wordLand', k]));
  ev.push([m.gaps[m.gaps.length - 1] + 2.25, 'sentenceReady', m.gaps.length], [m.askTap, 'ask'], [m.think[0], 'think', m.think[1] - m.think[0]], [m.w1 - 0.4, 'wipe']);
  for (let i = 0; i < n; i++) ev.push([m.offers[0] + 1.25 + i * 0.5, 'planArrive', i]);
  ev.push([m.testTap, 'testPress'], [m.test[0], 'test', m.test[1] - m.test[0]]);
  for (let i = 0; i < n; i++) { m.rows.forEach((r, k) => ev.push([m.res[0] + i * 0.5 + k * 0.25 + 0.15, name[r[i]], k])); if (m.rows.every((r) => r[i] === 'g')) ev.push([m.res[0] + i * 0.5 + m.rows.length * 0.25 + 0.2, 'allGood']); }
  ev.push([m.chooseTap, 'choose', m.pick], [m.w2 - 0.4, 'wipe', false], [m.build[0], 'build', m.build[1] - m.build[0], m.li], [m.recapTap, 'recapRight'], [m.yes[0], 'levelComplete', m.li]);
  return ev;
}
// renderFilmAudio(deps, parts, duration, lead) does the job of renderAudio in docs/redesign/animation/sound.js with this design.
// deps = { createEngine, renderSong, note, SONGS } from the engine. parts are the film's segments (with start, dur, says and the fields above).
// It returns 16-bit samples at 44,100 samples a second. The loudest sample is kept below full scale, so nothing is cut off.
export async function renderFilmAudio({ createEngine, renderSong, note, SONGS }, parts0, duration0, lead = 0) {
  const parts = [{ kind: 'lead', start: 0, dur: lead, says: [] }, ...parts0.map((p) => ({ ...p, start: p.start + lead }))], duration = duration0 + lead, SR = 44100, N = Math.ceil(SR * (duration + 0.3));
  registerSongs(SONGS);
  // the effects and Florence's blips
  const sctx = new OfflineAudioContext(1, N, SR), SE = createEngine(sctx), cues = makeCues({ note }, SE);
  for (const p of parts) {
    for (const [t0, name, ...a] of filmEvents(p)) { const t = Math.max(0, p.start + t0); if (name === 'test') cues.tests[p.li](t, ...a); else cues[name](t, ...a); }
    for (const [a, b, text] of p.says || []) if (text && text !== '…') cues.speak(p.start + a + 0.12, text, b - a);
  }
  // the music: one bed for each level, rendered on its own and faded in and out at the level's edges; the opening shares level 1's bed
  const levels = parts.filter((p) => p.kind === 'level'), end = parts.find((p) => p.kind === 'end'), stems = [[sctx, 0]];
  levels.forEach((m, i) => { const from = i === 0 ? 0 : m.start, to = m.start + m.dur, len = to - from + 1.2, ctx = new OfflineAudioContext(1, Math.ceil(SR * len), SR), E = createEngine(ctx), g = E.music.gain;
    renderSong(E, BED[m.li].song, len); g.setValueAtTime(0, 0); g.linearRampToValueAtTime(BED_LEVEL, i === 0 ? 1.5 : 0.8);
    for (const [t, v, c] of bedPlan(m, m.start - from)) g.setTargetAtTime(v, Math.max(i === 0 ? 1.5 : 0.8, t), c);
    g.setTargetAtTime(0, len - 1.6, 0.3); stems.push([ctx, from]); });
  if (end) { const off = end.start + 3, len = Math.max(1, end.dur - 3 + 0.3), ctx = new OfflineAudioContext(1, Math.ceil(SR * len), SR), E = createEngine(ctx), g = E.music.gain; renderSong(E, 'celebrate', len - 1);
    g.setValueAtTime(BED_LEVEL * 1.5, 0); for (const [a, b, text] of end.says || []) if (text) { g.setTargetAtTime(BED_LEVEL * 0.6, Math.max(0, a - 3 - 0.2), 0.15); g.setTargetAtTime(BED_LEVEL * 1.5, Math.max(0, b - 3), 0.3); }
    g.setTargetAtTime(0, len - 2.2, 0.5); stems.push([ctx, off]); }
  const mix = new Float32Array(N); let peak = 0;
  for (const [ctx, from] of stems) { const d = (await ctx.startRendering()).getChannelData(0), off = Math.round(from * SR); for (let i = 0; i < d.length && i + off < N; i++) mix[i + off] += d[i]; }
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(mix[i]));
  const gain = Math.min(2.5, 0.89 / (peak || 1)), pcm = new Int16Array(N); for (let i = 0; i < N; i++) pcm[i] = Math.round(mix[i] * gain * 32767);
  return pcm;
}
