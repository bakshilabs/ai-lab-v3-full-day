// Florence's practice island for the AI Lab: the earlier levels built from their clear instructions,
// so each lab mission starts from the same, tested town (tests/playtest.test.mjs and sim.test.mjs use the
// same chain). The player's own town is never changed by a lab unless they choose to use the plan.
import { plan, applyPlacements } from '../sim/planner.js';
import { LEVEL_ORDER, LEVELS } from './levels.js';
import { simulate } from '../sim/sim.js';
import { accessCheck } from '../sim/access.js';
import { ITEMS } from '../world/catalog.js';

const lockAll = (cells) => new Map([...cells].map(([k, c]) => [k, { ...c, mods: [...(c.mods || [])], locked: true }]));
const ctxOf = (terrain, cells, id) => ({ moveTiles: [...cells.values()].filter((c) => c.item && ITEMS[c.item]?.level === 'move').length, hasSchool: [...cells.values()].some((c) => c.item === 'school'), access: id === 'move' ? accessCheck(terrain, cells) : null });
// Where a mission starts (Florence first, docs/ecotown-florence-first.md). The first time, Florence builds in her own town
// as the player's fixed instructions left it, if her clear plan for this level can still pass there; otherwise (and for a
// replay, which is practice) she starts from her tidy practice town for this level.
export function florenceStart(terrain, id, town, { first = true } = {}) {
  if (first && town?.size) {
    const cells = lockAll(town); const after = applyPlacements(cells, plan(id, CLEAR[id], { terrain, cells, numbers: { minutes: 10 } }).placements);
    if (LEVELS[id].pass(simulate(terrain, after), ctxOf(terrain, after, id))) return { cells, from: 'town' };
  }
  return { cells: seedTo(terrain, id), from: 'practice' };
}

export const CLEAR = { land: ['dry', 'sunny', 'keep_meadow'], move: ['safe_walking', 'cycling', 'cars_at_edge'], homes: ['warm', 'low_carbon', 'natural_materials'], food: ['enough_food', 'keep_hedges', 'bees'], power: ['enough_power', 'winter', 'night', 'storage', 'solar', 'save_water', 'compost'], heart: ['walk_time', 'market', 'nature_links'] };

export function seedTo(terrain, level) {
  let cells = new Map();
  for (const id of LEVEL_ORDER.slice(0, LEVEL_ORDER.indexOf(level))) {
    cells = applyPlacements(cells, plan(id, CLEAR[id], { terrain, cells, numbers: { minutes: 10 } }).placements);
    for (const c of cells.values()) c.locked = true;
  }
  return cells;
}

// Florence's own town after her clear plans for the missions done so far, in order (only the unbroken run from the first
// mission): the town she has for a save made before the Florence-first flow (docs/ecotown-florence-first.md).
export function florenceTownFor(terrain, labs = {}) {
  let cells = new Map();
  for (const id of LEVEL_ORDER) {
    if (!labs[id]) break;
    cells = applyPlacements(cells, plan(id, CLEAR[id], { terrain, cells, numbers: { minutes: 10 } }).placements);
    for (const c of cells.values()) c.locked = true;
  }
  return cells;
}
