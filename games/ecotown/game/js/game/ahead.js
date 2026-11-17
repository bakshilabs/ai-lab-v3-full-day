// The player's own town, read before and after an AI Lab mission. Children build ahead of the missions (a parent's
// playtest, Nov 2026: "she'd already built the housing … and the AI lab was telling her about how to build housing"), so
// the mission says what the town already has, and Florence's plan, used in the town, leaves out the parts already done.
// Pure (tests/ahead.test.mjs). s: the simulation of the player's town; ctx: { moveTiles, hasSchool }.
import { ITEMS, TARGETS } from '../world/catalog.js';

// the town has made a start on what this mission is about
export function aheadIn(id, s, ctx = {}) {
  switch (id) {
    case 'land': return s.townTiles >= 3;
    case 'move': return (ctx.moveTiles || 0) > 0;
    case 'homes': return s.homes.length > 0;
    case 'food': return s.food > 0;
    case 'power': return (s.power?.winterSupply || 0) > 0 || s.drains > 0 || s.waste > 0;
    case 'heart': return !!ctx.hasSchool;
    default: return false;
  }
}

// the town already meets this mission's main need
export function doneIn(id, s, ctx = {}) {
  switch (id) {
    case 'land': return s.townTiles >= TARGETS.townTiles - 2 && s.townFlooded === 0;
    case 'move': return (ctx.moveTiles || 0) >= 3 && s.unsafeCrossings === 0;
    case 'homes': return s.familiesSafe >= TARGETS.families;
    case 'food': return s.food >= s.foodNeed;
    case 'power': return !!s.power?.winterOK && s.drains >= 1 && s.waste >= 1;
    case 'heart': return !!ctx.hasSchool && s.homes.length > 0 && s.walkMax <= TARGETS.walkMinutes;
    default: return false;
  }
}

// a part of Florence's plan that the town no longer needs, because that part is already done there (more homes for a
// town that already houses 40 families, more farms for a town that is already fed, ...): which part, or null
export function skipWhenDone(item, s, ctx = {}) {
  const it = ITEMS[item]; if (!it) return null;
  if (it.unique) return item === 'school' && ctx.hasSchool ? 'school' : null;
  if (item === 'town') return s.townTiles >= TARGETS.townTiles - 2 ? 'land' : null;
  if (it.home) return s.familiesSafe >= TARGETS.families ? 'homes' : null;
  if (it.level === 'food' && it.food > 0) return s.food >= s.foodNeed ? 'food' : null;
  if (it.avg || it.winter || it.store) return s.power?.winterOK ? 'power' : null;
  if (it.drains) return s.drains >= 1 ? 'rain' : null;
  if (item === 'repair' || item === 'compost') return s.waste >= 1 ? 'waste' : null;
  return null;
}

// "a, b and c"
export const listAnd = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}` : xs[0] || '');
