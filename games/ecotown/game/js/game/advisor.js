// Florence's tips while the player builds. Short, rare, and only about something that really changed:
// a tip fires when its rule turns true, at most one every COOLDOWN ms, and a tip that was shown is not
// repeated until its problem has gone away and come back. Pure (tests/progress.test.mjs).
import { TARGETS } from '../world/catalog.js';

export const COOLDOWN = 25000;
const pl = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
// how many of a build the town has (the simulation's count), so a tip never asks to swap something that isn't there
const n = (s, id) => (s.count && s.count[id]) || 0;
// the carbon tip for ages 8–12 (owner's wording, 17 Nov 2026), naming only the swaps this town really has
const carbonSwap = (s) => { const c = n(s, 'concrete'), r = n(s, 'road') + n(s, 'carpark');
  return c && r ? 'Try swapping Concrete flats and Car roads for greener choices.' : c ? 'Try swapping Concrete flats for greener choices.' : r ? 'Try swapping Car roads for greener choices.' : carbonFix(s, true); };
// what this town can really swap to cut its carbon (junior / senior)
export function carbonFix(s, j) {
  const parts = [];
  if (n(s, 'concrete')) parts.push(j ? 'swap your concrete flats for timber or straw homes' : 'replace the concrete flats');
  if (n(s, 'road') + n(s, 'carpark')) parts.push(j ? 'swap car roads for footpaths or cycle lanes' : 'replace car roads and car parks with active travel');
  if (n(s, 'bigfield') + n(s, 'vertical')) parts.push(j ? 'swap a big field for a mixed farm' : 'swap high-carbon food production for mixed farms');
  if (!parts.length) return j ? 'Build a repair café or a compost hub: they take carbon away.' : 'Add repair cafés and compost hubs to offset it.';
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} or ${parts.at(-1)}` : parts[0];
  return j ? `To cut it, ${list}.` : `Cut it: ${list}.`;
}

// In priority order. lab: the AI Lab mission that teaches this problem. lens: the check that shows it.
// ctx: { open: unlocked categories, hasSchool }
export const RULES = [
  { id: 'start', when: (s) => s.townTiles === 0, text: { j: 'Let’s choose where your town will go. Tap 🗺 Land, then tap dry squares on the island to mark them as Town land.', s: 'Start with site selection: mark town land (🗺 Land), then connect it with paths.' } },
  // (not while the player is draining the meadow: homes stand on it and none of them floods. On the delta island that is the way to build.)
  { id: 'flood', lab: 'land', lens: 'flood', when: (s) => s.townFlooded >= 2 && !(s.flooded === 0 && s.homes.some((h) => h.zone === 'meadow')), text: { j: (s) => `${s.townFlooded} of your Town land tiles are on ground that floods in winter. Use Remove to clear those tiles, then choose dry ground higher up the slope.`, s: (s) => `${pl(s.townFlooded, 'town tile')} on the winter floodplain. Relocate to higher ground.` } },
  { id: 'wood', lab: 'land', lens: 'nature', when: (s) => s.townOnWood >= 2, text: { j: 'Your town is cutting into the old wood, where the deer live. Mark that land “Keep wild” instead.', s: (s) => `${pl(s.townOnWood, 'town tile')} clear ancient woodland. Pick another site.` } },
  { id: 'homesNext', goal: 'homes', when: (s, c) => c.open.includes('homes') && s.homes.length === 0, text: { j: 'Homes are ready! Tap 🏡 Homes, choose a house, then tap a Town land tile to build it.', s: 'Housing unlocked: 40 households need homes. Build on town land.' } },
  { id: 'crossing', lab: 'move', lens: 'street', when: (s) => s.homes.length > 0 && s.unsafeCrossings > 0, text: { j: 'Children can’t cross that busy road safely on their way to school. Replace it with a Footpath & crossing or a Cycle lane.', s: (s) => `${pl(s.unsafeCrossings, 'unsafe crossing')} on the school run at 8:45 am. Replace car roads near homes with paths.` } },
  // the cold homes are the concrete flats or the brick terraces: the tip names the ones this town really has
  { id: 'cold', after: true, goal: ['homes', 'health'], lab: 'homes', lens: 'inside', when: (s) => s.homes.length > 0 && s.avgTemp < 18, text: { j: 'Some homes are too cold in winter. Try Timber terrace or Straw-bale cottages to keep families warm.', s: (s) => `Average indoor temperature ${s.avgTemp} °C with the heating off (target 18 °C). Use better-insulated homes.` } },
  // (a town of timber terraces can pass the homes' carbon limit too: it used to be told to swap concrete flats it never built)
  { id: 'homesCarbon', after: true, goal: ['homes', 'carbon'], lab: 'homes', lens: 'carbon', when: (s) => s.homesCarbon > TARGETS.homesCarbon, text: { j: (s) => (n(s, 'concrete') ? 'Making Concrete flats creates a lot of carbon pollution. Try Timber terrace or Straw-bale cottages instead.' : 'Building these homes creates a lot of carbon pollution. Straw-bale cottages make the least, and a Green roof takes a little away.'), s: (s) => `Homes' embodied carbon ${s.homesCarbon} t, over the ${TARGETS.homesCarbon} t limit. ${n(s, 'concrete') ? 'Replace concrete with low-carbon materials.' : 'Use straw bale, the lowest-carbon option, or add green roofs.'}` } },
  { id: 'hungry', goal: 'food', lab: 'food', when: (s, c) => c.open.includes('food') && s.families >= 12 && s.food < s.foodNeed, text: { j: (s) => `You have ${s.food} baskets of food, but your town needs ${s.foodNeed}. One basket feeds three families. Build a Mixed farm or Orchard to grow more.`, s: (s) => `Food ${s.food} / ${s.foodNeed} units needed. Add farms or allotments.` } },
  { id: 'wildlife', goal: ['food', 'nature'], lab: 'food', lens: 'nature', when: (s, c) => c.open.includes('food') && (!s.species.bees || !s.species.deer), text: { j: (s) => `Oh no, the ${!s.species.bees ? 'bees' : 'deer'} have left the island. Plant hedges or put up beehives to bring them back.`, s: (s) => `${!s.species.bees ? 'Pollinators' : 'Deer'} lost: habitat below what they need. Restore hedges.` } },
  { id: 'winter', goal: 'energy', lab: 'power', lens: 'winter', when: (s, c) => c.open.includes('power') && s.homes.length > 0 && !s.power.winterOK, text: { j: 'On a winter night with no sun or wind, the lights could go out. Build a Battery store to save electricity for later. Wind turbines help when the wind blows.', s: (s) => `Still winter night: supply ${Math.round(s.power.winterSupply)} / demand ${Math.round(s.power.demand)}. Add storage or wind.` } },
  { id: 'rain', goal: 'energy', lab: 'power', when: (s, c) => c.open.includes('power') && s.families >= 24 && s.drains === 0, text: { j: 'Rainwater needs somewhere to go. Build a Rain garden or Reed bed to soak it up and help stop flooding.', s: 'No rainwater drainage yet: add a rain garden or reed bed.' } },
  { id: 'school', goal: 'walk', lab: 'heart', when: (s, c) => c.open.includes('heart') && !c.hasSchool, text: { j: 'Your town needs a school. Tap 🏫 Town heart, choose Town school, then place it near the homes.', s: 'Town heart unlocked: the town still needs its own school.' } },
  { id: 'walk', goal: 'walk', lab: 'heart', lens: 'walk', when: (s, c) => c.hasSchool && s.homes.length > 0 && s.walkMax > TARGETS.walkMinutes, text: { j: (s) => `The home furthest from school is ${s.walkMax} minutes away on foot. To move the school, choose Town school and tap a new spot closer to the homes. You can also add Footpaths.`, s: (s) => `Longest walk to school ${s.walkMax} min (rule: ≤ ${TARGETS.walkMinutes}). Relocate the school or add paths.` } },
  { id: 'carbon', after: true, goal: 'carbon', lens: 'carbon', when: (s) => !s.carbonOK, text: { j: (s) => `Your town has made ${s.carbon} tonnes of carbon pollution. The limit is ${TARGETS.carbonCeiling} tonnes. ${carbonSwap(s)}`, s: (s) => `Town carbon ${s.carbon} t, over the ${TARGETS.carbonCeiling} t ceiling. ${carbonFix(s, false)}` } },
];

export const newAdvisor = () => ({ last: -Infinity, active: new Set(), pending: [], shown: new Set(), solved: [] });
export const tipText = (rule, s, j) => { const t = rule.text[j ? 'j' : 's']; return typeof t === 'function' ? t(s) : t; };

// Goal first (a parent's playtest, Nov 2026: Florence suggested a market square while the step line said to add power, and
// the child didn't know which to do). ctx.goal is the goal the step line shows now (game.js goalNow: 'land', a town goal
// id, or null once every goal is met). A rule tied to other goals waits until it is that goal's turn; rules with no goal
// (the start, flooding, the old wood, an unsafe crossing) are about something going wrong and may always speak, after
// the current goal's own tips.
// after: advice on how to build a level (warm homes, low-carbon materials), given now when that level unlocks (content.js
// unlockTip), before anything is placed. As a correction of what was already built it did not help (owner, 16 Nov 2026),
// so these rules stay quiet unless AFTER_TIPS is switched back on.
export const AFTER_TIPS = false;
export const fitsGoal = (goals, now) => !goals || !now || [].concat(goals).includes(now);
const ruleFits = (r, ctx) => fitsGoal(r.goal, ctx?.goal);

// Call after every change to the town (and from time to time). Returns a rule to show, or null.
export function nextTip(st, s, ctx, now, cooldown = COOLDOWN) {
  const truth = new Set(RULES.filter((r) => r.when(s, ctx)).map((r) => r.id));
  const fits = new Set(RULES.filter((r) => truth.has(r.id) && ruleFits(r, ctx) && (AFTER_TIPS || !r.after)).map((r) => r.id));
  // a tip joins the queue when it is true and it is its goal's turn (one held back for a later goal joins when that goal comes up)
  for (const id of fits) if (!st.shown.has(id) && !st.pending.includes(id)) st.pending.push(id);
  st.pending = st.pending.filter((id) => fits.has(id));
  for (const id of [...st.shown]) if (!truth.has(id)) { st.shown.delete(id); (st.solved ||= []).push(id); } // solved: say well done; it may come back later
  st.active = truth;
  if (!st.pending.length || now - st.last < cooldown) return null;
  const order = RULES.map((r) => r.id); const rank = (id) => { const r = RULES.find((x) => x.id === id); return (r.goal && ctx?.goal ? 0 : 1000) + order.indexOf(id); };
  st.pending.sort((a, b) => rank(a) - rank(b)); // the current goal's own tips first, then the warnings
  const id = st.pending.shift(); st.shown.add(id); st.last = now;
  return RULES.find((r) => r.id === id);
}

// Florence's own ideas for the town (game.js suggestFor) and the goals each one is about: she only offers one that
// belongs to the current goal (a park while the town still needs power was another way of changing the subject)
export const SUGGEST_GOALS = { flood: ['land', 'homes'], carbon: ['homes', 'carbon'], winter: ['energy'], nature: ['food', 'nature'], orchard: ['food', 'nature'], walk: ['walk'], park: ['health', 'nature', 'community'] };

// The idle "next idea" for a goal, as a key of nextIdea in content.js, chosen from what the town already has, so it never
// asks for something that is already there. t: { hasSchool }, s: the simulation (s.count: builds by type).
export function ideaKey(goal, s, t = {}) {
  const c = (id) => (s?.count && s.count[id]) || 0;
  if (goal === 'walk') return t.hasSchool ? 'walk2' : 'walk';
  if (goal === 'carbon') return !AFTER_TIPS ? 'carbonOther' : c('concrete') ? 'carbon' : c('road') + c('carpark') ? 'carbonRoads' : 'carbonOther'; // (a swap is a correction of what was built: see AFTER_TIPS)
  if (goal === 'energy') return c('wind') + c('solar') ? 'energyMore' : 'energy';
  if (goal === 'homes') return s?.homes?.length ? 'homesMore' : 'homes';
  return goal;
}
