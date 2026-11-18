// Florence's tips stick to the current goal and never suggest what the town already has (a parent's playtest with an
// eight-year-old, Nov 2026), and the AI Lab reads the player's own town (js/game/ahead.js).
import test from 'node:test'; import assert from 'node:assert/strict';
import { RULES, newAdvisor, nextTip, tipText, fitsGoal, ideaKey, carbonFix, SUGGEST_GOALS, AFTER_TIPS } from '../js/game/advisor.js';
import { aheadIn, doneIn, skipWhenDone, listAnd } from '../js/game/ahead.js';
import { SANDBOX, LEVEL_TEXT } from '../js/game/content.js';
import { LEVELS } from '../js/game/levels.js';
import { targetLine } from '../js/ai/targets.js';

// a town state with nothing wrong in it; override what a test needs
const town = (o = {}) => ({ townTiles: 18, townFlooded: 0, flooded: 0, townOnWood: 0, homes: [{ k: 'a' }], unsafeCrossings: 0, avgTemp: 21, homesCarbon: 40, families: 40, familiesSafe: 40,
  food: 14, foodNeed: 14, species: { bees: true, deer: true }, power: { winterOK: true, winterSupply: 30, demand: 20 }, drains: 1, waste: 1, walkMax: 9, carbonOK: true, carbon: 120, count: {}, ...o });
const ALL = ['land', 'move', 'homes', 'food', 'power', 'heart'];

test('the current goal comes first: while the goal is power, a school tip waits', () => {
  const s = town({ power: { winterOK: false, winterSupply: 4, demand: 20 } });
  const st = newAdvisor(); const ctx = { open: ALL, hasSchool: false, goal: 'energy' };
  assert.equal(nextTip(st, s, ctx, 0).id, 'winter');
  assert.equal(nextTip(st, s, ctx, 1e6), null, 'the school tip is held back while power is the goal');
  // power fixed, the goal moves on to the school: now that tip may speak
  const s2 = town(); assert.equal(nextTip(st, s2, { ...ctx, goal: 'walk' }, 2e6).id, 'school');
});
test('warnings with no goal still speak, after the current goal\'s own tips', () => {
  const s = town({ townFlooded: 3, power: { winterOK: false, winterSupply: 4, demand: 20 } });
  const st = newAdvisor(); const ctx = { open: ALL, hasSchool: true, goal: 'energy' };
  assert.equal(nextTip(st, s, ctx, 0).id, 'winter'); assert.equal(nextTip(st, s, ctx, 1e6).id, 'flood');
});
test('with every goal met, any tip may speak (old behaviour)', () => {
  assert.equal(fitsGoal('walk', null), true); assert.equal(fitsGoal(['homes', 'carbon'], 'carbon'), true); assert.equal(fitsGoal('walk', 'energy'), false); assert.equal(fitsGoal(undefined, 'energy'), true);
  for (const g of Object.values(SUGGEST_GOALS)) assert.ok(g.length);
});
test('advice about how to build a level is not given afterwards as a correction', () => {
  assert.equal(AFTER_TIPS, false);
  const s = town({ avgTemp: 14, homesCarbon: 99, carbonOK: false, carbon: 200, count: { concrete: 3 } });
  const st = newAdvisor(); const ids = []; for (let i = 0; i < 6; i++) { const r = nextTip(st, s, { open: ALL, hasSchool: true, goal: null }, i * 1e6); if (r) ids.push(r.id); }
  for (const id of ['cold', 'homesCarbon', 'carbon']) assert.ok(!ids.includes(id), id);
  // the same advice is in the unlock tips, before anything is built
  assert.match(SANDBOX.junior.unlockTip.homes, /Before you build.*timber and straw/); assert.match(SANDBOX.junior.unlockTip.heart, /Before you build.*middle of the homes/);
  assert.match(SANDBOX.junior.unlockTip.power, /make and store electricity/); // owner's wording, 17 Nov 2026 assert.match(SANDBOX.junior.unlockTip.food, /Before you build/);
});
test('no "swap concrete flats" when the town has none', () => {
  const r = (id) => RULES.find((x) => x.id === id);
  const timber = town({ homesCarbon: 80, avgTemp: 17, count: { timber: 14, reclaimed: 2 } });
  assert.doesNotMatch(tipText(r('homesCarbon'), timber, true), /concrete/i); assert.doesNotMatch(tipText(r('cold'), timber, true), /concrete/i);
  assert.match(tipText(r('homesCarbon'), town({ count: { concrete: 2 } }), true), /concrete flats/i);
  assert.doesNotMatch(carbonFix(town({ count: { timber: 3 } }), true), /concrete|car road/); assert.match(carbonFix(town({ count: { road: 2 } }), true), /car roads/); assert.doesNotMatch(carbonFix(town({ count: { road: 2 } }), true), /concrete/);
});
test('the idle idea fits what the town already has', () => {
  assert.equal(ideaKey('walk', town(), { hasSchool: true }), 'walk2'); assert.equal(ideaKey('walk', town(), { hasSchool: false }), 'walk');
  assert.equal(ideaKey('homes', town({ homes: [] })), 'homes'); assert.equal(ideaKey('homes', town()), 'homesMore');
  assert.equal(ideaKey('energy', town({ count: { wind: 1 } })), 'energyMore'); assert.equal(ideaKey('energy', town()), 'energy');
  assert.equal(ideaKey('carbon', town({ count: {} })), 'carbonOther');
  for (const band of ['junior', 'senior']) for (const k of ['homes', 'homesMore', 'food', 'nature', 'health', 'energy', 'energyMore', 'community', 'carbon', 'carbonRoads', 'carbonOther', 'walk', 'walk2']) assert.ok(SANDBOX[band].nextIdea[k], `${band} ${k}`);
  assert.doesNotMatch(SANDBOX.junior.nextIdea.walk2, /Build a Town school/); // a school stands: never "add a school"
});
test('the AI Lab reads the town: built ahead, already done, and the parts of a plan to leave out', () => {
  const empty = town({ townTiles: 0, homes: [], familiesSafe: 0, food: 0, power: { winterOK: false, winterSupply: 0, demand: 0 }, drains: 0, waste: 0 });
  for (const id of ALL) assert.equal(aheadIn(id, empty, {}), false, id);
  const some = town({ familiesSafe: 20, families: 20, food: 4, foodNeed: 13 });
  assert.equal(aheadIn('homes', some), true); assert.equal(doneIn('homes', some), false); assert.equal(skipWhenDone('timber', some), null);
  const full = town(); assert.equal(doneIn('homes', full), true); assert.equal(skipWhenDone('timber', full), 'homes'); assert.equal(skipWhenDone('mixed', full), 'food');
  assert.equal(skipWhenDone('wind', full), 'power'); assert.equal(skipWhenDone('raingarden', full), 'rain'); assert.equal(skipWhenDone('compost', full), 'waste');
  assert.equal(skipWhenDone('school', full, { hasSchool: true }), 'school'); assert.equal(skipWhenDone('school', full, { hasSchool: false }), null); assert.equal(skipWhenDone('path', full), null);
  assert.equal(aheadIn('heart', full, { hasSchool: true }), true); assert.equal(doneIn('heart', town({ walkMax: 20 }), { hasSchool: true }), false);
  assert.equal(listAnd(['a', 'b', 'c']), 'a, b and c');
  for (const band of ['junior', 'senior']) { const S = SANDBOX[band]; for (const id of ALL) { assert.ok(S.aheadWhat[id] && S.doneWhat[id], `${band} ${id}`); assert.ok(S.ahead(S.aheadWhat[id]).length > 20); }
    for (const k of ['land', 'homes', 'food', 'power', 'rain', 'waste', 'school']) assert.ok(S.doneParts[k], `${band} ${k}`); }
  assert.match(SANDBOX.junior.ahead('homes'), /already built homes/);
});
test('ages 8–12 goal lines say what to do, with no money, kW or percentages', () => {
  const J = SANDBOX.junior; const s = town({ species: { bees: false, deer: true }, familiesSafe: 12, food: 3, walkMax: 22 });
  const lines = [...Object.values(J.goal).map((f) => f(s)), ...Object.values(J.goalHow), ...Object.values(J.nextIdea), ...Object.values(J.unlockTip).filter(Boolean),
    J.nextStep.land(2), J.nextStep.land(2, 3), J.nextStep.fam(4, 'Power'), J.nextStep.food(2), ...Object.values(LEVEL_TEXT).flatMap((L) => [L.goal.j, L.brief.j]),
    ...Object.keys(LEVELS).flatMap((id) => LEVELS[id].needs(s, { moveTiles: 1, hasSchool: true, access: { ok: false, issues: 1 } }, true).map((n) => n.label)), J.suggest.sure(93)];
  for (const l of lines) { assert.doesNotMatch(l, /💰|credit|coin|budget|\bkW\b|%/i, l); }
  // the goal lines start with something to do
  const verb = /^(build|grow|bring|make|keep|cut|move|mark|choose|plan|put|pick|tell)\b/i;
  for (const f of Object.values(J.goal)) assert.match(f(s), verb); for (const f of Object.values(J.goal)) assert.match(f(town()), verb);
  for (const id of Object.keys(LEVELS)) for (const n of LEVELS[id].needs(s, { moveTiles: 1, hasSchool: true, access: { ok: false, issues: 1 } }, true)) if (!/^🍎 Food: \d+ of \d+ baskets/u.test(n.label)) assert.match(n.label.replace(/^\P{L}+/u, ''), verb, n.label); // the food count is the owner's own wording (17 Nov 2026)
  for (const L of Object.values(LEVEL_TEXT)) assert.match(L.goal.j, verb, L.goal.j);
  assert.doesNotMatch(targetLine({ id: 'power', asked: 21, dir: 'min', got: 13, need: 21, met: false }, true), /still winter night/);
});
