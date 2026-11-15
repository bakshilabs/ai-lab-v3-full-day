// Level rules: which checks reveal the flaw, the honest pass test, what must be built, and the one
// measure each level-complete card shows. Text lives in content.js. The habit behind a flawed plan
// comes from the planner (what Florence actually assumed); `habit` here is only the fallback.
import { LEVEL_ITEMS, TARGETS } from '../world/catalog.js';

export const LEVEL_ORDER = ['land', 'move', 'homes', 'food', 'power', 'heart'];
export const ALL_CHECKS = ['flood', 'nature', 'street', 'access', 'carbon', 'inside', 'winter', 'walk'];
// lenses build up level by level; street view and inside view are views, available whenever there is something to see
const LENS_ORDER = ['flood', 'street', 'carbon', 'nature', 'winter', 'walk'];
export function checksFor(id, junior, reveal = {}) {
  const n = LEVELS[id].n; const unlocked = LENS_ORDER.slice(0, n);
  let list = [...unlocked];
  if (!list.includes('street')) list.push('street');
  if (n >= 3) list.push('inside');
  if (id === 'move' || id === 'heart') list.splice(1, 0, 'access'); // routes for everyone: step-free, gentle slopes, safe crossings
  for (const k of Object.keys(reveal)) if (!list.includes(k)) list.push(k); // never hide the evidence that shows the problem
  if (junior) { const nw = LEVELS[id].newLens; list = [nw, ...list.filter((c) => c !== nw).reverse()].slice(0, 4); for (const k of Object.keys(reveal)) if (!list.includes(k)) list[list.length - 1] = k; }
  return list;
}

const tonnes = (j) => (j ? 'tonnes' : 't');
export const LEVELS = {
  land: {
    n: 1, newLens: 'flood', habit: 'one_word', palette: LEVEL_ITEMS.land,
    reveal(sim) {
      const out = {};
      if (sim.townFlooded >= 2) out.flood = { n: sim.townFlooded };
      if (sim.townOnWood >= 2) out.nature = { n: sim.townOnWood };
      return out;
    },
    needs: (sim, ctx, j) => [
      { label: j ? `🏘 Town land: ${sim.townTiles} of ${TARGETS.townTiles} tiles` : `Town land: ${sim.townTiles} of ${TARGETS.townTiles} tiles (16–18)`, ok: sim.townTiles >= TARGETS.townTiles - 2 && sim.townTiles <= TARGETS.townTiles },
      { label: j ? '🌊 No town land floods' : 'No town land on the floodplain', ok: sim.townFlooded === 0 },
      { label: j ? '🌳 Keep the old wood' : 'Woodland cleared: at most 1 tile', ok: sim.townOnWood <= 1 },
      ...(sim.townOnWetland > 0 ? [{ label: j ? '🐸 No town land on the wetland' : 'No town land on the wetland', ok: false }] : []),
    ],
    stat: (s, j) => [j ? 'Town land' : 'Site area', `${s.townTiles} tiles`],
  },
  move: {
    n: 2, newLens: 'street', habit: 'typical', palette: LEVEL_ITEMS.move,
    // a busy crossing shows up in street view and on the step-free route; a route that isn't step-free shows on the access lens
    reveal(sim, base, ctx) {
      if (sim.unsafeCrossings > 0) return { street: { n: sim.unsafeCrossings }, access: { n: sim.unsafeCrossings } };
      if (ctx?.access && !ctx.access.ok) return { access: { n: ctx.access.issues } };
      return {};
    },
    needs: (sim, ctx, j) => [
      { label: j ? '🚶 Paths from homes to school and the ferry' : 'Routes to school and the ferry (3+ tiles)', ok: ctx.moveTiles >= 3 },
      { label: j ? '🚸 Safe to cross at 8:45 am' : `Unsafe crossings at 8:45 am: ${sim.unsafeCrossings}`, ok: sim.unsafeCrossings === 0 },
      ...(ctx.access ? [{ label: j ? '♿ Step-free all the way, ferry included' : `Step-free route to school and ferry: ${ctx.access.ok ? 'yes' : `${ctx.access.issues} problem${ctx.access.issues === 1 ? '' : 's'}`}`, ok: ctx.access.ok }] : []),
    ],
    stat: (s, j) => [j ? 'Busy crossings' : 'Unsafe crossings', `${s.unsafeCrossings}`],
  },
  homes: {
    n: 3, newLens: 'carbon', habit: 'one_word', palette: LEVEL_ITEMS.homes,
    reveal(sim) { const o = {}; if (sim.homesCarbon > TARGETS.homesCarbon) o.carbon = { n: (sim.homesCarbon / TARGETS.homesCarbon).toFixed(1) }; if (sim.avgTemp < 18) o.inside = { n: sim.avgTemp }; return o; },
    needs: (sim, ctx, j) => [
      { label: j ? `👪 Safe homes for ${sim.familiesSafe} families (need ${TARGETS.families})` : `Households housed safely: ${sim.familiesSafe} (need ${TARGETS.families})`, ok: sim.familiesSafe >= TARGETS.families }, // a flooded home does not count (the town goal never counted it)
      { label: j ? `🌫 Building carbon: ${sim.homesCarbon} of ${TARGETS.homesCarbon} ${tonnes(j)} (lower is better)` : `Embodied carbon: ${sim.homesCarbon} / ${TARGETS.homesCarbon} t`, ok: sim.homesCarbon <= TARGETS.homesCarbon },
      { label: j ? '🔥 Warm with the heating off' : `Indoor temp: ${sim.avgTemp} °C (18+)`, ok: sim.avgTemp >= 18 },
    ],
    stat: (s, j) => [j ? 'Families housed' : 'Households', `${s.familiesSafe}`],
  },
  food: {
    n: 4, newLens: 'nature', habit: 'one_word', palette: LEVEL_ITEMS.food,
    reveal(sim, base) { return !sim.species.bees || !sim.species.deer ? { nature: { n: Math.max(0, (base?.hedges ?? 16) - sim.hedges) } } : {}; },
    needs: (sim, ctx, j) => [{ label: j ? `🍎 Food: ${sim.food} baskets (need ${sim.foodNeed})` : `Food: ${sim.food} units (need ${sim.foodNeed}; 1 unit feeds 3 households)`, ok: sim.food >= sim.foodNeed }, { label: j ? '🐝 Bees stay' : 'Pollinators present', ok: sim.species.bees }, { label: j ? '🦌 Deer stay' : 'Deer present', ok: sim.species.deer }],
    stat: (s, j) => [j ? 'Food baskets' : 'Food units', `${s.food} (need ${s.foodNeed})`],
  },
  power: {
    n: 5, newLens: 'winter', habit: 'typical', palette: LEVEL_ITEMS.power,
    reveal(sim) { return !sim.power.winterOK ? { winter: { n: `${Math.round(sim.power.winterSupply)}/${Math.round(sim.power.demand)}` } } : {}; },
    needs: (sim, ctx, j) => [
      { label: j ? `⚡ Winter-night power: ${Math.round(sim.power.winterSupply)} (homes need ${Math.round(sim.power.demand)})` : `Still winter night: supply ${Math.round(sim.power.winterSupply)} / demand ${Math.round(sim.power.demand)}`, ok: sim.power.winterOK },
      { label: j ? '🌧 Somewhere for the rain: a rain garden or reed bed' : 'Rainwater: at least 1 rain garden or reed bed', ok: sim.drains >= 1 },
      { label: j ? '♻ Less rubbish: a compost hub or repair café' : 'Waste: at least 1 compost hub or repair café', ok: sim.waste >= 1 },
    ],
    stat: (s, j) => [j ? 'Winter-night power' : 'Winter supply / demand', `${Math.round(s.power.winterSupply)} / ${Math.round(s.power.demand)}`],
  },
  heart: {
    n: 6, newLens: 'walk', habit: 'literal', palette: LEVEL_ITEMS.heart,
    reveal(sim) { return sim.walkMax > TARGETS.walkMinutes ? { walk: { n: sim.walkMax } } : {}; },
    needs: (sim, ctx, j) => [{ label: j ? '🏫 A new school' : 'New school placed', ok: ctx.hasSchool }, { label: j ? `🚶 Longest walk to school: ${sim.walkMax} min (${TARGETS.walkMinutes} or less)` : `Longest walk to school: ${sim.walkMax} min (rule: ≤ ${TARGETS.walkMinutes})`, ok: sim.homes.length > 0 && sim.walkMax <= TARGETS.walkMinutes }], // no homes means no walk to measure, not a pass
    stat: (s, j) => [j ? 'Longest walk to school' : 'Longest walk', `${s.walkMax} min`],
  },
};
// A mission passes when every one of its needs holds. There is no second list of conditions to drift from the first:
// what the player is shown as the checklist is exactly what is checked (js/game/criteria.js reads the same list).
for (const lv of Object.values(LEVELS)) lv.pass = (sim, ctx) => lv.needs(sim, ctx, true).every((n) => n.ok);
