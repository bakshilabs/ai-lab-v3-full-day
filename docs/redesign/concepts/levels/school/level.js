// Level 6 of Eco Town, "A school for everyone", as a playable trial on the shared level kit.
// The child asks Florence to suggest places for the school, rings the school bell to test them, and sees who walks and who is driven.
// The place is the whole valley seen from across the river on a bright autumn morning (valley.js). The play break is a walking bus (bus.js).
// The sentence, the three plans, the check, the results and the test button follow the approved wireframe (docs/redesign/wireframes-data.js, town 0, level 5).
// Every word below is a placeholder.
import { group, place, frame } from '../../level-kit/blocks.js';
import { newScene, tw, wait, run, ease, back, plate, hitBox, glowMarks, glide, view } from '../../level-kit/stage.js';
import { planTag } from '../../level-kit/shell.js';
import { beep, chime } from '../../level-kit/sound.js';
import { runLevel } from '../../level-kit/flow.js';
import { LIGHT, badgeRow, setFlag, flagN } from './parts.js';
import { buildValley, SITEX, HOMEX, VIEWS, walks } from './valley.js';
import { walkingBus } from './bus.js';

// ---- 1. the words (placeholders) ---------------------------------------------------------------------------------------------------------
const words = {
  level: 'A school for everyone', job: ['Every child in Eco Town needs a school. Your family lives far out by the farms.', 'Ask Florence to suggest plans. Then test them, so that you can make a good decision.'], start: 'Start',
  askT: 'Your sentence', askHow: ['Some children live in the town, and some live by the farms. Can they all walk to school?'], ask: 'Ask Florence',
  sentence: ['Choose a place for the school so that children can walk there. Put it', ['in the town', 'between the town and the farms', 'by the farms'], '.'],
  plansSay: ([where]) => [`You asked for a school ${where}. Here are three plans to test.`], test: 'Ring the school bell',
  testT: 'The school bell rings', watch: 'Where the school is near enough, the children walk. Where it is too far, they go by car.',
  choose: 'A shoe means walked, and a car means driven. Which plan will you use?', again: 'Ask again', use: 'Use this plan',
  playT: 'Lead the walking bus', next: 'Next', townT: 'A school morning', townHow: 'The school is built, and the bell rings for the first morning.',
  built: '', tryOther: 'Try another plan', chooseOther: 'Choose a different plan to see what happens in the town.', first: 'Your first plan', what: 'What changed?', keepFirst: 'Go back to my first plan', keepThis: 'Keep this plan',
  recapT: 'One more question', recapQ: 'Point to the plan that helped more children walk.', recapYes: 'Yes. Children from the town and from the farms can all walk to that school.', recapNo: 'The school between the town and the farms helped the most. Children from both ends can walk there.',
  end: 'This is the end of the trial level. Thank you for playing.', replay: 'Play again', endT: 'The school bell rings', endSay: 'The bell rings every morning now, and your flag flies on the school.',
  check: 'Promote walking', strip: (n) => `${n} of 12 children walked.`, waiting: 'This plan has not been tested yet.', ringing: 'The bell is ringing.', ringNext: 'Now ring the bell of the next school. Click the bell.', ringSign: 'Ring this bell', here: ['In the town?', 'Between them?', 'By the farms?'] };

// ---- 2. the plans, and what the check finds --------------------------------------------------------------------------------------------
// There are five places along the valley. Florence suggests three of them. The child's words decide which three: asked for a school by the farms,
// she suggests two places at the farm end and the place in the middle; otherwise the three plans of the approved wireframe. One plan is always good on the check.
const SITES = [{ name: 'In the town centre', lines: ['Town centre', 'Next to the shops'], where: 'in the town centre', short: 'Town centre' }, { name: 'Beside the park', lines: ['Beside the park', 'At the edge of town'], where: 'beside the park', short: 'By the park' },
  { name: 'Between town and farms', lines: ['Between the town', 'and the farms'], where: 'between the town and the farms', short: 'In between' }, { name: 'Beside the orchard', lines: ['Beside the orchard', 'Near the farms'], where: 'beside the orchard', short: 'By the orchard' }, { name: 'By the farm houses', lines: ['By the farms', 'Far from the town'], where: 'by the farm houses', short: 'By the farms' }];
// the picture on a plan's tag is a small map of the valley: the town at the left, the barn at the right, and a flag where the school stands
const icon = (i) => { const x = 7 + (SITEX[i] + 30) / 58.5 * 30; return `<svg class="tagpic" viewBox="0 0 44 36" aria-hidden="true"><path d="M1 30h42" stroke="#1f2a44" stroke-width="2.5" stroke-linecap="round"/><path d="M2 30v-7l3.5-4 3.5 4v7zM9 30v-10l3-3 3 3v10z" fill="#f3c9a2" stroke="#1f2a44" stroke-width="1.6" stroke-linejoin="round"/><path d="M34 30v-8l4-4 4 4v8z" fill="#c9402e" stroke="#1f2a44" stroke-width="1.6" stroke-linejoin="round"/><path d="M${x} 31V6" stroke="#1f2a44" stroke-width="2.5" stroke-linecap="round"/><path d="M${x} 6h11l-3 4 3 4H${x}z" fill="#ffd257" stroke="#1f2a44" stroke-width="1.8" stroke-linejoin="round"/></svg>`; };
SITES.forEach((p, i) => { p.icon = icon(i); p.site = i; });
const plans = [0, 1, 2].map((i) => ({ ...SITES[i] })), setPlans = (set) => set.forEach((site, k) => Object.assign(plans[k], SITES[site]));
const tally = (site, s) => { const p = s.V.plan(SITEX[site]), town = p.who.filter((q) => !q.walk && q.i < 6).length, farm = p.who.filter((q) => !q.walk && q.i >= 6).length; return { kinds: p.kinds, n: p.walkers, town, farm }; };
const results = (i, s) => { const t = tally(plans[i].site, s), cars = 12 - t.n;
  return [{ check: words.check, evidence: badgeRow(t.kinds), text: cars === 0 ? 'Every child walked to school.' : cars >= 6 ? `The children from the ${t.farm ? 'farms' : 'town'} went by car.` : 'Some children went by car.', mark: cars === 0 ? 'g' : cars >= 6 ? 'p' : 'f' }]; };
const after = (i, s) => { const t = tally(plans[i].site, s), cars = 12 - t.n; return `The school is built ${plans[i].where}. ${cars ? `${cars} children go by car, because it is too far for them to walk.` : 'These children can walk instead of going by car.'} Car trips create pollution and traffic delays.`; };

// ---- 3. the place, with the hooks that the order of the steps calls -------------------------------------------------------------------
const copy = (v) => ({ eye: [...v.eye], at: [...v.at], fov: v.fov });
function valley() { const s = newScene(44, { ...LIGHT, tx: -1, sun: [20, 36, 30] }), V = buildValley(s), wide = s.scene; Object.assign(s, copy(VIEWS.job), { V, set: [0, 1, 2], minAspect: 1.9, bloom: 0.42 }); setFlag(flagN);
  document.querySelectorAll('.strips').forEach((e) => e.remove()); const strips = document.createElement('div'); strips.className = 'strips'; strips.hidden = true; view.append(strips);
  const tags = SITEX.map((x, i) => { const t = plate(s, '', [x, i % 2 ? 20 : 15.6, -11], 'pl'); t.el.innerHTML = planTag(SITES[i]); t.hide = true; return t; }), board = { hide: true }, names = SITEX.map((x, i) => { const t = plate(s, SITES[i].short, [x, 15.4, -11], 'on'); t.hide = true; return t; });
  const areas = [[-22, 22], [1, 13], [20.25, 21]].map(([x, w], k) => { const a = group(s.g, 0, 0, 0); glowMarks(place(a, x, -6.4, w, 3.6, 0.12)); glowMarks(frame(a, x, 0.1, -8, w, 6.5, true, { fill: 0.3 })); a.visible = false; const p = plate(s, words.here[k], [x, 8.6, -8], 'on'); p.hide = true; return { a, p }; });
  const only = (list) => SITEX.forEach((_, i) => { V.rise(i, list.includes(i) ? 1 : 0); }), hideAll = () => { for (const t of tags) t.hide = true; for (const t of names) t.hide = true; board.hide = true; for (const q of areas) { q.a.visible = false; q.p.hide = true; } for (const p of V.pins) p.visible = false; bellTap = null; ringMark.visible = false; ringSign.hide = true; };
  // the child rings the bell of the second and the third school by hand: a yellow place glows around the bell, and a click on it (or on its sign) rings it
  const ringMark = group(s.g, 0, 6.0, -10.7); glowMarks(frame(ringMark, 0, 0, 0, 6.6, 6.6, true, { fill: 0.3 })); ringMark.visible = false; const ringSign = plate(s, words.ringSign, [0, 8.6, -10.7], 'tap'); ringSign.hide = true; let bellTap = null, bellGo = null;
  const rung = () => { if (bellTap === null) return; bellTap = null; ringMark.visible = false; ringSign.hide = true; if (bellGo) bellGo(); }; ringSign.el.onclick = rung; SITEX.forEach((x, i) => hitBox(s, s.g, x, 3, -10.5, 9, 11, 7, () => bellTap === i, rung));
  const ringByHand = (site) => { const X = SITEX[site]; ringMark.position.x = X; ringSign.pos.set(X + (X > 12 ? -8.5 : 8.5), 8.2, -10.7); ringMark.visible = true; ringSign.hide = false; bellTap = site; return Promise.race([new Promise((res) => { bellGo = res; }), wait(60).then(() => { if (bellTap === site) rung(); })]); };   // after a long while the bell rings by itself, so that nobody is stuck
  s.wants = () => (bellTap === null ? null : 'bell');
  const strip = (k, t, live) => `<div class="strip${t || live ? '' : ' wait'}${live ? ' now' : ''}"><span class="pl">${planTag(plans[k])}</span>${t ? `${badgeRow(t.kinds)}<span>${words.strip(t.n)}</span>` : `${badgeRow(live || [])}<span>${live ? words.ringing : words.waiting}</span>`}</div>`;
  // the child's word is drawn in the valley at once: the part of the valley that was named lights up
  s.words = (list) => { s.set = list[0] === 2 ? [2, 3, 4] : [0, 1, 2]; setPlans(s.set); areas.forEach((q, k) => { q.a.visible = list[0] === k; q.p.hide = list[0] !== k; }); };
  s.asking = () => { strips.hidden = true; hideAll(); only([]); V.clear(); glide(copy(VIEWS.wide), 2.2); };
  s.showPlans = async () => { const me = run; hideAll(); glide(copy(VIEWS.wide), 1.2); for (const [k, site] of s.set.entries()) { const p = V.pins[site]; p.visible = true; p.scale.setScalar(0.01); beep(380 + k * 70, 0.08); await tw(0.4, (t) => p.scale.setScalar(Math.max(0.01, back(t)))); if (me !== run) return; tags[site].hide = false; } };
  // the test: the bell rings once for each plan in turn, in the same view. Each finished morning stays on the screen as a strip
  s.test = async (api) => { const me = run, done = []; hideAll(); s.spot = () => [SITEX[bellTap ?? 0], 9.4, -10.7]; strips.hidden = false; const show = (now, live = []) => { strips.innerHTML = s.set.map((_, k) => strip(k, done[k], k === now ? live : null)).join(''); }; show(0);
    for (const [k, site] of s.set.entries()) { const X = SITEX[site]; api.step(plans[k].name); V.clear(); show(k ? -1 : 0); await tw(0.8, (t) => V.rise(site, back(t))); if (me !== run) return false; if (k) { api.say(words.ringNext); await ringByHand(site); if (me !== run) return false; api.say(words.watch); show(k); } beep(830, 1.4, 'sine', 0.12); beep(1245, 1, 'sine', 0.05);
      await V.morning(X, { onBadge: (list) => show(k, list) }); if (me !== run) return false; await wait(0.9); if (me !== run) return false;
      done[k] = tally(site, s); show(-1); board.hide = true; if (k < 2) { await tw(0.4, (t) => V.rise(site, 1 - t)); V.rise(site, 0); V.clear(); } if (me !== run) return false; }
    api.step(words.testT); await wait(0.6); return me === run; };
  s.showResults = () => { strips.hidden = true; board.hide = true; V.clear(); only(s.set); for (const site of s.set) names[site].hide = false; glide(copy(VIEWS.cards), 1.4); };
  // the play break: the walking bus that comes from the right-hand side of the school. Its length follows the plan
  s.playBreak = async (pick, api) => { hideAll(); strips.hidden = true; const X = SITEX[plans[pick].site], w = walks(X), ids = HOMEX.map((x, i) => i).filter((i) => w[i] && HOMEX[i] > X).sort((a, b) => HOMEX[b] - HOMEX[a]), other = HOMEX.map((x, i) => i).filter((i) => w[i] && HOMEX[i] < X), cars = HOMEX.map((x, i) => i).filter((i) => !w[i]).sort((a, b) => Math.abs(HOMEX[a] - X) - Math.abs(HOMEX[b] - X)), n = ids.length + other.length;
    const bus = walkingBus(s, { ids, other, cars, farm: ids[0] >= 6, doneSay: `${n} children walked to school today${cars.length ? `, and ${cars.length} came by car` : ', and nobody needed a car'}.` }, api);
    s.scene = bus.scene; s.busTick = bus.tick; await bus.play(); };
  const near = (X) => ({ eye: [X * 0.75, 4.4, 44], at: [X * 0.75, 6.6, -6], fov: 26 });
  const show = (pick, pose) => { s.scene = wide; s.busTick = null; hideAll(); const site = plans[pick].site, X = SITEX[site]; V.clear(); only([site]); V.stops(X); if (pose) V.settle(X, { bus: true }); return X; };
  s.town = async (pick) => { const X = show(pick, false); Object.assign(s, copy(VIEWS.wide)); glide({ eye: [-1, 4.6, 70], at: [-1, 6.4, -4], fov: 26 }, 6); beep(830, 1.4, 'sine', 0.12); await V.morning(X, { bus: true }); await glide(near(X), 2.2); };
  s.swap = (pick) => { const X = show(pick, true), v = near(X); v.at[1] = 8.4; glide(v, 1.2); chime(); };   // a little lower in the picture, so that the sign with the first result does not cover the bell
  // the recap: a tap on one of the three places. Any answer goes on
  s.recap = (answer) => { let open = true; const signs = []; hideAll(); V.clear(); only(s.set); glide(copy(VIEWS.wide), 1.4); s.spot = (name, i) => [SITEX[s.set[i]], 4, -11];
    s.set.forEach((site, k) => { const ok = site === 2, pl = plate(s, SITES[site].short, [SITEX[site], 15.6, -11], 'tap'), go = () => { if (!open) return; open = false; for (const q of signs) q.hide = true; names[2].hide = false; beep(ok ? 880 : 300, 0.15); answer(ok); }; signs.push(pl); pl.el.onclick = go; hitBox(s, s.g, SITEX[site], 0, -9, 7, 11, 8, () => open, go); }); };
  s.closing = (pick) => { const X = show(pick, false); glide({ eye: [X + 12, 3.6, 24], at: [X - 0.5, 6.4, -9], fov: 36 }, 3.5); beep(830, 1.4, 'sine', 0.12); V.morning(X, { bus: true }); };
  s.tick = (t, dt) => { if (s.busTick) s.busTick(t, dt); else { V.tick(t, dt); for (const q of areas) if (q.a.visible) q.a.position.y = 0.12 + Math.sin(t * 4) * 0.03; if (ringMark.visible) ringMark.scale.setScalar(1 + Math.sin(t * 5) * 0.05); } };
  return s; }

// ---- 4. hand it all to the kit ----------------------------------------------------------------------------------------------------------
runLevel({ place: { number: 6, town: 'Eco Town', level: 'School' }, words, plans, results, after, scene: valley,
  ends: (pick, s) => [{ step: words.endT, say: [words.endSay, words.end], go: () => s.closing(pick) }] });
