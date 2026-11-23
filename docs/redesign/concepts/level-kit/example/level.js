// The smallest level that uses the kit: a kite for a windy day. It is NOT a level of the game. It exists to show, in about a
// hundred lines, what a level gives the kit and what it gets back, and to prove that the kit works with a place that is not the Homes street.
// A real level would have a much richer place, people who react, and a play break with a real small decision.
// Every word below is a placeholder.
import { B, blk, group, frame, familyGroup } from '../blocks.js';
import { newScene, tw, wait, ease, back, run, plate, hitBox, glowMarks, glide } from '../stage.js';
import { meter } from '../shell.js';
import { beep, chime } from '../sound.js';
import { runLevel } from '../flow.js';

// ---- 1. the words (placeholders) ---------------------------------------------------------------------------------------------------------
const words = {
  level: 'A kite for a windy day', job: ['Your family wants to fly a kite on the hill.', 'Some days the wind is light. Some days it is strong.'], start: 'Start',
  askT: 'Your sentence', askHow: 'Tap a word for the gap. Then ask Florence to suggest plans.', ask: 'Ask Florence',
  sentence: ['Florence, please suggest kites that fly high in', ['a light wind', 'a strong wind'], '.'],
  plansSay: ([wind]) => [`Here are three plans for ${wind}.`, 'Press the button to test them.'], test: 'Make the wind blow',
  testT: 'The wind blows', watch: 'See how high each kite goes.', choose: 'Which plan will you use?', again: 'Ask again', use: 'Use this plan',
  playT: 'Make the tail', next: 'Next', townT: 'On the hill', townHow: 'Your family takes the kite up the hill.',
  built: 'Your family is flying the kite you chose.', tryOther: 'Try another plan', chooseOther: 'Choose a different plan to see it on the hill.', first: 'Your first plan', what: 'What changed?', keepFirst: 'Go back to my first plan', keepThis: 'Keep this plan',
  recapT: 'One more question', recapQ: 'Where is the wind stronger? Tap the place.', recapYes: 'Yes. The wind is stronger high up, above the trees.', recapNo: 'The wind is stronger high up, above the trees.',
  end: 'This is the end of the example.', replay: 'Play again' };

// ---- 2. the plans, and what the checks find --------------------------------------------------------------------------------------------
// The child's word must change the result: each kite does well in one wind and less well in the other. In each wind one plan is good on every check.
const COLOUR = ['#e0503a', '#3f78b5', '#e9ad1c'], SIZE = [[1.2, 1.5], [2.6, 1.3], [1.7, 1.7]];
const icon = (i) => `<svg class="tagpic" viewBox="0 0 44 36" aria-hidden="true"><path d="M22 3l${8 + i * 4} 13-${8 + i * 4} 17-${8 + i * 4}-17z" fill="${COLOUR[i]}" stroke="#1f2a44" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
const plans = [{ name: 'Small light kite', lines: ['Small kite', 'Very light'] }, { name: 'Wide strong kite', lines: ['Wide kite', 'Strong frame'] }, { name: 'Box kite', lines: ['Box kite', 'Heavy'] }].map((p, i) => ({ ...p, icon: icon(i) }));
const HIGH = [[8, 5, 1], [3, 9, 6]], HOLD = [['g', 'g', 'g'], ['p', 'g', 'f']];   // for each wind: how high each kite goes out of ten, and how easy it is to hold
const flying = (h) => (h >= 7 ? 'g' : h >= 3 ? 'f' : 'p');
const results = (i, s) => { const h = HIGH[s.wind][i], hold = HOLD[s.wind][i];
  return [{ check: 'Flying high', evidence: meter(h, `${h} of 10`), text: { g: 'It flies high above the trees.', f: 'It flies, but not very high.', p: 'It does not get off the ground.' }[flying(h)], mark: flying(h) },
    { check: 'Easy to hold', text: { g: 'The string is easy to hold.', f: 'The string pulls a little.', p: 'The string pulls hard and the kite spins.' }[hold], mark: hold }]; };

// ---- 3. the place, with the hooks that the order of the steps calls -------------------------------------------------------------------
function hill() { const s = newScene(34, { sun: [14, 30, 20], haze: 0.006 }), g = s.g; Object.assign(s, { eye: [0, 2.6, 21], at: [0, 6.5, 0], fov: 46, wind: 0 });
  B(g, 0, 0, 120, 90, -1, 1, '#7cc65c'); for (let k = 0; k < 9; k++) { const x = -32 + k * 8; B(g, x, -14, 0.6, 0.6, 0, 3, '#7a5230'); B(g, x, -14, 4, 4, 3, 3.4, ['#58b24a', '#47a03f'][k % 2], { tex: 'leaf' }); }
  const family = familyGroup(group(g, 8.5, 0, 7), -0.5);
  // three kites, each on a string. lift(i, h) puts kite i at height h
  const kites = plans.map((_, i) => { const k = group(g, (i - 1) * 6.5, 0, 0), body = B(k, 0, 0, SIZE[i][0], 0.14, 0, SIZE[i][1], COLOUR[i], { raw: true }), string = blk(k, 0, 0, 0.06, 0.06, 0, 1, '#1f2a44', { shadow: false }), tail = group(k); k.visible = false; return { k, body, string, tail, h: 0.3 }; });
  const lift = (i, h) => { const q = kites[i]; q.h = h; q.body.position.y = h + SIZE[i][1] / 2; q.tail.position.y = h; q.string.scale.y = h; q.string.position.y = h / 2; };
  const tags = plans.map((p, i) => { const t = plate(s, '', [(i - 1) * 6.5, 3.6, 2], 'pl'); t.el.innerHTML = `${p.icon}<span><b>${p.lines[0]}</b><b>${p.lines[1]}</b></span>`; t.hide = true; return t; });
  const only = (pick) => kites.forEach((q, i) => { q.k.visible = pick < 0 || i === pick; tags[i].hide = !(pick < 0); });
  s.words = (list) => { s.wind = list[0] ?? 0; };                                  // the child's word, drawn at once (here it only sets the wind)
  s.showPlans = async () => { const me = run; only(-1); for (const [i, q] of kites.entries()) { lift(i, 0.3); q.k.scale.setScalar(0.01); beep(360 + i * 60, 0.07); await tw(0.35, (t) => q.k.scale.setScalar(Math.max(0.01, back(t)))); if (me !== run) return; } };
  s.test = async () => { const me = run; await tw(3, (t) => kites.forEach((_, i) => lift(i, 0.3 + HIGH[s.wind][i] * ease(t)))); await wait(0.6); return me === run; };   // gives back false if the scene changed meanwhile
  // The play break: the child ties three ribbons to the tail, in an order of their own. A real level needs a real small decision here.
  s.playBreak = async (pick, api) => { only(pick); const q = kites[pick], cols = ['#ffd257', '#2e9b5a', '#8a5fc2']; let n = 0; await tw(1, (t) => lift(pick, q.h + (4 - q.h) * ease(t))); glide({ eye: [(pick - 1) * 6.5, 3, 13], at: [(pick - 1) * 6.5, 3.4, 0], fov: 44 }, 1.2);
    api.say(['Tap each yellow place to tie a ribbon to the tail.']);
    s.marks = [0, 1, 2].map((j) => { const y = -1.1 - j * 0.9, m = glowMarks(frame(q.tail, 0, y - 0.3, 0.2, 1.1, 0.7)); let done = false;
      hitBox(s, q.tail, 0, y - 0.3, 0, 1.6, 0.9, 1.2, () => !done, () => { done = true; m.visible = false; B(q.tail, 0, 0, 0.7, 0.1, y, 0.3, cols[n % 3], { raw: true }); beep(520 + n * 120, 0.1); if (++n === 3) { chime(); api.done(['The tail is ready.']); } }); return y; });
    s.spot = (name, j) => [(pick - 1) * 6.5, 4 + s.marks[j] + 0.1, 0]; };
  s.fly = (pick) => { only(pick); tags.forEach((t) => { t.hide = true; }); return tw(1.6, (t) => lift(pick, kites[pick].h + (0.3 + HIGH[s.wind][pick] - kites[pick].h) * ease(t))); };
  s.town = async (pick) => { glide({ eye: [0, 2.6, 21], at: [0, 6.5, 0], fov: 46 }, 1.4); await s.fly(pick); };   // the plan is carried out
  s.swap = (pick) => { lift(pick, 0.3); s.fly(pick); };                                                          // a second plan, shown at once
  // The recap is a tap on the place. Any answer goes on.
  s.recap = (answer) => { let open = true; const signs = [], spots = [[0, 0.4, 5, false], [0, 9.5, 0, true]]; s.spot = (name, j) => spots[j].slice(0, 3);
    spots.forEach(([x, y, z, ok]) => { const pl = plate(s, 'Here', [x, y + 1.4, z], 'tap'), go = () => { if (!open) return; open = false; for (const q of signs) q.hide = true; beep(ok ? 880 : 300, 0.15); answer(ok); }; signs.push(pl); pl.el.onclick = go; hitBox(s, g, x, y - 1.5, z, 14, 4, 6, () => open, go); }); };
  s.tick = (t) => { kites.forEach((q, i) => { q.k.rotation.z = Math.sin(t * 1.3 + i) * 0.03 * Math.min(3, q.h); }); family.position.y = Math.abs(Math.sin(t * 2)) * 0.04; };
  return s; }

// ---- 4. hand it all to the kit ----------------------------------------------------------------------------------------------------------
runLevel({ place: { number: 0, town: 'Level kit', level: 'Example' }, words, plans, results, scene: hill,
  after: (i, s) => results(i, s).map((r) => r.text).join(' '),
  ends: (pick, s) => [{ step: 'The kite is flying', say: [words.end], go: () => glide({ eye: [10, 2, 16], at: [0, 7, 0], fov: 50 }, 3) }] });
