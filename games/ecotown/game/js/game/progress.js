// Free building: what is open in the player's town, when an AI Lab mission is ready, and when the
// town is complete. Pure functions of the simulation, so they are unit-tested (tests/progress.test.mjs).
import { TARGETS } from '../world/catalog.js';
import { LEVEL_ORDER } from './levels.js';

// Town land in free building. Level 1's lab still plans 18 tiles (TARGETS.townTiles); a whole town with
// 40 families, a market and a hall needs more room than that.
export const SANDBOX_TOWN_CAP = 30;

// Florence first, then your own town (owner, 17 Nov 2026; docs/ecotown-florence-first.md). One level per build
// category, in mission order. A level's builds open in the player's own town when Florence's AI Lab mission for it is
// done. The next mission opens after a small "your turn" step in the player's own town, so the hour alternates.
// `at(s, ctx)`: that step (ctx: { moveTiles }); `need`: its words; `progress`: [have, need, kind]; `goal`: the town goal
// the step is about (Florence's tips stick to it, advisor.js fitsGoal); `tool`: the build that does it (the hint).
const fed = (s) => s.food >= s.foodNeed;
const madePower = (s) => (s.power?.avg || 0) > 0 || (s.power?.winterSupply || 0) > 0;
export const TIERS = [
  { id: 'land', at: () => true },
  { id: 'move', at: (s) => s.townTiles >= 6, need: { j: 'Mark 6 tiles of town land in your town', s: 'Designate 6 tiles of town land in your town' }, progress: (s) => [s.townTiles, 6, 'tiles'], goal: 'land', tool: 'town' },
  { id: 'homes', at: (s, c) => (c?.moveTiles || 0) >= 2, need: { j: 'Build 2 paths or cycle lanes in your town', s: 'Lay 2 tiles of footpath or cycle lane in your town' }, progress: (s, c) => [c?.moveTiles || 0, 2, 'routes'], goal: 'health', tool: 'path' },
  { id: 'food', at: (s) => s.families >= 12, need: { j: 'Build homes for 12 families in your town', s: 'House 12 households in your town' }, progress: (s) => [s.families, 12, 'fam'], goal: 'homes', tool: 'timber' },
  { id: 'power', at: (s) => s.families >= 12 && fed(s), need: { j: 'Grow enough food for the families in your town', s: 'Feed every household in your town' }, progress: (s) => (s.families < 12 ? [s.families, 12, 'fam'] : [Math.floor(s.food), Math.max(1, Math.ceil(s.foodNeed)), 'food']), goal: 'food', tool: 'mixed' },
  { id: 'heart', at: (s) => madePower(s), need: { j: 'Build a wind turbine or solar roofs in your town', s: 'Generate some power in your town' }, progress: (s) => [madePower(s) ? 1 : 0, 1, 'power'], goal: 'energy', tool: 'wind' },
];

// The categories open in the player's own town: those whose mission is done. `ever`: categories already opened stay
// open (a town saved before this flow keeps what it had). `full`: everything (the ?sandbox=full test mode).
export function unlocked(labs = {}, ever = [], full = false) {
  return TIERS.filter((t) => full || ever.includes(t.id) || !!labs[t.id]).map((t) => t.id);
}
export function newlyUnlocked(before, after) { return after.filter((id) => !before.includes(id)); }

// the next mission to play, in order (null once all six are done)
export const nextMission = (labs = {}) => LEVEL_ORDER.find((l) => !labs[l]) || null;
// A mission can be played when every mission before it is done and the player's own town has done its "your turn" step.
// A finished mission can always be played again. s, ctx: the player's own town.
export function missionReady(id, labs = {}, s, ctx = {}) {
  if (labs[id]) return true;
  const i = LEVEL_ORDER.indexOf(id); if (i < 0 || LEVEL_ORDER.slice(0, i).some((l) => !labs[l])) return false;
  return !!TIERS[i].at(s, ctx);
}

// The town is complete when every petal reaches "enough", carbon is under its limit, every home is within
// the walking rule of a school, and the town has its own school.
export function townGoals(s, ctx) {
  return [
    { id: 'homes', ok: s.familiesSafe >= TARGETS.families },
    { id: 'food', ok: s.food >= s.foodNeed },
    { id: 'nature', ok: s.petals.nature >= 1 && !!s.species?.bees && !!s.species?.deer }, // the petal alone said “done” while the charter said “bees gone”
    { id: 'health', ok: s.petals.health >= 1 },
    { id: 'energy', ok: s.power.winterOK && s.homes.length > 0 },
    { id: 'community', ok: s.petals.community >= 1 },
    { id: 'carbon', ok: s.carbonOK }, // the town total. The 70 t limit on homes' materials is the homes mission's limit for 40 families; as a town goal it made the 60-family and tiny-town challenges impossible (tried, 15 Nov 2026)
    { id: 'walk', ok: ctx.hasSchool && s.homes.length > 0 && s.walkMax <= TARGETS.walkMinutes },
  ];
}
export const townComplete = (s, ctx) => townGoals(s, ctx).every((g) => g.ok);

// the next mission and the player's step toward it: { id, have, need, kind, tier, ready } (null once all six are done)
export function nextUnlock(s, labs = {}, ctx = {}) {
  const id = nextMission(labs); if (!id) return null; const tier = TIERS.find((t) => t.id === id);
  if (!tier.progress) return { id, have: 1, need: 1, kind: 'none', tier, ready: true };
  const [have, need, kind = 'fam'] = tier.progress(s, ctx); const ready = !!tier.at(s, ctx);
  return { id, have: ready ? need : Math.min(have, need), need, kind, tier, ready };
}
