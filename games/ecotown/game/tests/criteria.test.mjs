// The one set of rules (js/game/criteria.js): boundaries, the player's own targets, town-meeting breaks, corrections.
import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadPlotter } from '../js/ai/model.js';
import { setModelForTests, ask } from '../js/ai/plotter.js';
import { makeTerrain } from '../js/world/terrain.js';
import { simulate } from '../js/sim/sim.js';
import { LEVELS } from '../js/game/levels.js';
import { TARGETS, ITEMS } from '../js/world/catalog.js';
import { seedTo } from '../js/game/seed.js';
import { readTargets, checkTargets } from '../js/ai/targets.js';
import { townGoals } from '../js/game/progress.js';
import { missionCriteria, missionVerdict, verdict, walkTarget, brokenBy, townVerdict } from '../js/game/criteria.js';
import { challengeMedal } from '../js/game/challenges.js';
import { DILEMMAS } from '../js/game/content.js';

setModelForTests(await loadPlotter({ json: JSON.parse(readFileSync(new URL('../models/plotter.json', import.meta.url), 'utf8')), bin: readFileSync(new URL('../models/plotter.bin', import.meta.url)) }));
const terrain = makeTerrain();
const play = (id, text) => { const base = seedTo(terrain, id); const v = ask(id, text, { terrain, cells: base }); return { v, s: simulate(terrain, v.after) }; };
const heart = (walkMax, homes = 1) => ({ homes: Array(homes).fill({}), walkMax });
const homes = (o) => ({ homesCarbon: 60, avgTemp: 20, familiesSafe: 40, families: 40, ...o });

test('walk to school: 15 minutes passes, 16 fails, through the real rule', () => {
  const pass = LEVELS.heart.pass; const x = { hasSchool: true };
  assert.equal(pass(heart(15), x), true); assert.equal(pass(heart(16), x), false);
  assert.equal(pass(heart(0, 0), x), false, 'no homes: nothing to measure, not a pass');
  assert.equal(pass(heart(10), { hasSchool: false }), false);
  assert.equal(townGoals({ ...heart(15), familiesSafe: 0, food: 0, foodNeed: 1, petals: {}, power: {}, species: {} }, x).find((g) => g.id === 'walk').ok, true);
});

test('homes carbon: exactly 70 t passes, anything over fails; flooded homes do not count as housed', () => {
  const pass = LEVELS.homes.pass;
  assert.equal(pass(homes({ homesCarbon: 70 }), {}), true); assert.equal(pass(homes({ homesCarbon: 70.2 }), {}), false);
  assert.equal(pass(homes({ familiesSafe: 37 }), {}), false);
});

test('town carbon is compared as shown: 160.0 passes, 160.4 fails', () => {
  // the home island with nothing built, then extra carbon from a town-meeting choice in 0.1 t steps
  const at = (t) => simulate(terrain, new Map(), { addCarbon: t });
  assert.equal(at(160).carbon, 160); assert.equal(at(160).carbonOK, true);
  assert.equal(at(160.4).carbon, 160.4); assert.equal(at(160.4).carbonOK, false, '160.4 used to round to 160 and pass');
  assert.equal(at(161).carbonOK, false);
});

test('a mission passes exactly when every need on its checklist is met', () => {
  for (const id of Object.keys(LEVELS)) {
    const { v, s } = play(id, { land: 'best land', move: 'roads', homes: 'cheap homes', food: 'lots of food', power: 'solar power', heart: 'a school' }[id]);
    const ctx = { hasSchool: [...v.after.values()].some((c) => c.item === 'school'), moveTiles: [...v.after.values()].filter((c) => ITEMS[c.item]?.cat === 'move').length };
    const needs = LEVELS[id].needs(s, ctx, true);
    assert.equal(LEVELS[id].pass(s, ctx), needs.every((n) => n.ok), id);
  }
});

test('the player’s own walking target counts: asked 10, got 12 is partly met, not met', () => {
  const x = { hasSchool: true };
  assert.equal(missionVerdict('heart', heart(12), x, { minutes: 10 }).status, 'partly');
  assert.equal(missionVerdict('heart', heart(10), x, { minutes: 10 }).status, 'met', 'exactly on the target');
  assert.equal(missionVerdict('heart', heart(11), x, { minutes: 10 }).status, 'partly');
  assert.equal(missionVerdict('heart', heart(12), x, {}).status, 'met', 'no target of their own: the town rule decides');
  assert.equal(missionVerdict('heart', heart(16), x, { minutes: 10 }).status, 'missed', 'a broken rule outranks a missed target');
  assert.equal(walkTarget(15, heart(12), true), null, 'a target no stricter than the rule adds nothing');
  const v = missionVerdict('heart', heart(12), x, { minutes: 10 });
  assert.equal(v.brief.length, 1); assert.match(v.brief[0].label, /10 minutes/); assert.match(v.brief[0].label, /12 min/);
});

test('the player’s own carbon target counts, and "below" is strict', () => {
  const t = (text, hc) => checkTargets(readTargets('homes', text), homes({ homesCarbon: hc }))[0];
  assert.equal(t('keep carbon below 50 tonnes', 60).met, false);
  assert.equal(t('keep carbon below 50 tonnes', 50).met, false, 'below 50 is not 50');
  assert.equal(t('keep carbon below 50 tonnes', 49.8).met, true);
  assert.equal(t('at most 50 tonnes of carbon', 50).met, true);
  assert.equal(t('at most 50 tonnes of carbon', 50.2).met, false, 'compared to one decimal, not rounded to 50');
  const targets = checkTargets(readTargets('homes', 'timber homes for 40 families, below 50 tonnes'), homes({ homesCarbon: 60 }));
  const v = missionVerdict('homes', homes({ homesCarbon: 60 }), {}, { targets });
  assert.equal(v.status, 'partly'); assert.deepEqual(v.brief.map((c) => c.id), ['carbon']);
});

test('two limits at once: each failed condition is named', () => {
  const v = missionVerdict('homes', homes({ homesCarbon: 96, familiesSafe: 30 }), {}, { junior: false });
  assert.equal(v.status, 'missed'); assert.equal(v.failed.length, 2);
  assert.match(v.failed.map((c) => c.label).join('|'), /Households.*30/); assert.match(v.failed.map((c) => c.label).join('|'), /carbon.*96/i);
  assert.ok(v.all.some((c) => c.ok), 'the condition that holds is still listed');
});

test('the reproduced case: a real 10-minute brief gets a 15-minute plan, which is partly met; a corrected brief is met', () => {
  const ctx = { hasSchool: true };
  const first = play('heart', 'Put the school within a 10-minute walk of every home');
  assert.equal(first.v.read.numbers.minutes, 10);
  assert.equal(LEVELS.heart.pass(first.s, ctx), true, 'the plan keeps the town’s 15-minute rule');
  assert.ok(first.s.walkMax > 10, 'and misses the 10 minutes that were asked for');
  assert.equal(missionVerdict('heart', first.s, ctx, { minutes: first.v.read.numbers.minutes }).status, 'partly', 'this used to pass as "no problem" with a first-time star');
  // the correction: a target the island can reach. The verdict follows the new brief and the new plan.
  const second = play('heart', 'Put the school where every home is within a 15 minute walk');
  assert.equal(missionVerdict('heart', second.s, ctx, { minutes: second.v.read.numbers.minutes }).status, 'met');
  // a vague brief on the same island breaks the rule itself: missed, with the walk named
  const vague = play('heart', 'a school'); const v = missionVerdict('heart', vague.s, ctx, {});
  assert.equal(v.status, 'missed'); assert.match(v.failed[0].label, new RegExp(`${vague.s.walkMax} min`));
});

test('a town-meeting choice that breaks the 70 t limit is named as broken, and choosing again clears it', () => {
  const before = homes({ homesCarbon: 66 }); const after = homes({ homesCarbon: 96 });
  const broke = brokenBy('homes', before, after, {}, false);
  assert.equal(broke.length, 1); assert.match(broke[0], /carbon/i);
  assert.deepEqual(brokenBy('homes', before, homes({ homesCarbon: 70 }), {}, false), [], 'exactly at the limit is not a break');
  assert.deepEqual(brokenBy('homes', after, after, {}, false), [], 'already broken before the choice: not blamed on it');
  assert.deepEqual(brokenBy('homes', before, before, {}, false), [], 'the other choice leaves the plan as it was');
  assert.ok(DILEMMAS.homes.options.some((o) => !(o.effect.carbon > 0)), 'the homes meeting always has a choice that adds no carbon');
});

test('a town that was complete and slips says so; fixing it clears the notice', () => {
  const base = { homes: [1], familiesSafe: 40, food: 14, foodNeed: 14, petals: { nature: 1, health: 1, community: 1 }, species: { bees: true, deer: true }, power: { winterOK: true }, carbonOK: true, walkMax: 12 };
  const x = { hasSchool: true };
  assert.equal(townVerdict(base, x, { was: true }).complete, true); assert.equal(townVerdict(base, x, { was: true }).slipped, false);
  const worse = townVerdict({ ...base, carbonOK: false }, x, { was: true });
  assert.equal(worse.slipped, true); assert.deepEqual(worse.failed.map((g) => g.id), ['carbon']); assert.equal(worse.met, 7);
  assert.equal(townVerdict({ ...base, carbonOK: false }, x, { was: false }).slipped, false, 'never complete: nothing to slip from');
  assert.equal(townVerdict(base, x, { was: true, labs: 5 }).complete, false, 'the six missions are part of complete');
});

test('verdict wording and medals', () => {
  assert.equal(verdict([]).status, 'met');
  assert.equal(challengeMedal({ medal: null, total: 55 }), null); assert.equal(challengeMedal({ medal: 'silver' }), 'silver');
  for (const c of missionCriteria('homes', homes({}), {}, { junior: true })) assert.doesNotMatch(c.label, /^\P{L}/u, 'labels start with a letter, not an emoji');
});
