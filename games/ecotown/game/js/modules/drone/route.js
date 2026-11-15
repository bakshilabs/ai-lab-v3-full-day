// Drone delivery: the places, the drone's instructions and what happens when it flies them. Pure: no page, no 3D.
import { ITEMS } from '../../world/catalog.js';
import { DIRS, T, key, parseKey, manhattan, offsetWords, tilesWord } from './geo.js';

export const MAX_STEPS = 12;   // tiles in one set of instructions
export const MAX_N = 9;        // "fly east N tiles"
export const AUTO_SPEED = 6;   // world units a second when the drone flies itself
export const UP_SECS = 1.2, DROP_SECS = 1.6;

// ---------------------------------------------------------------- places
const FIXED = { ailab: { label: 'the AI Lab', icon: '🤖' }, oldschool: { label: 'the old school', icon: '🏫' }, dock: { label: 'the ferry dock', icon: '⛴' } };
const PICKUP_ITEMS = ['market', 'repair', 'hall'];                       // where a parcel starts, best first
const DROP_ITEMS = ['school', 'hall', 'park', 'market', 'repair', 'bridge', 'greenbridge', 'festival'];
const ZONE_PLACE = { meadow: 'the river meadow', wetland: 'the wetland', wood: 'the old wood', slope: 'the sunny slope', coast: 'the coast', field: 'the dry field', river: 'the river' };
const labelOf = (item) => 'the ' + ITEMS[item].label.charAt(0).toLowerCase() + ITEMS[item].label.slice(1);
const byKey = (a, b) => (a.gx - b.gx) || (a.gz - b.gz);

// Every place a parcel could start from or go to, from the child's own town and the island's fixed buildings.
export function candidates(cells, tiles) {
  const out = []; const tileOf = new Map(tiles.map((t) => [t.k, t]));
  for (const [k, c] of cells || []) {
    const t = tileOf.get(k); if (!t || !c?.item || !ITEMS[c.item] || ITEMS[c.item].kind !== 'build') continue;
    const home = !!ITEMS[c.item].home; if (!home && !DROP_ITEMS.includes(c.item) && !PICKUP_ITEMS.includes(c.item)) continue;
    out.push({ k, gx: t.gx, gz: t.gz, item: c.item, label: labelOf(c.item), icon: ITEMS[c.item].icon, rank: home ? 3 : 2 });
  }
  for (const t of tiles) if (t.fixed && FIXED[t.fixed]) out.push({ k: t.k, gx: t.gx, gz: t.gz, fixed: t.fixed, label: FIXED[t.fixed].label, icon: FIXED[t.fixed].icon, rank: 1 });
  return out.sort(byKey);
}

// Choose the pick-up and the drop-off (two drop-offs for ages 13-17) from what exists. Always returns something on an
// island that has tiles: a nearly empty town falls back to the AI Lab, the old school and the ferry dock, then to plain land.
export function pickPlaces(cells, tiles, junior = true) {
  tiles = [...tiles].sort(byKey); if (!tiles.length) return null;
  const cand = candidates(cells, tiles); const land = (t) => ({ k: t.k, gx: t.gx, gz: t.gz, zone: t.zone, label: ZONE_PLACE[t.zone] || 'the far side of the island', icon: '📍', rank: 0 });
  const score = (c, others) => {
    const d = Math.min(...others.map((o) => manhattan(o, c))); if (d < 3) return -1;
    const twoLegs = others[0].gx !== c.gx && others[0].gz !== c.gz ? 4 : 0; const sameName = others.some((o) => o.label === c.label) ? -60 : 0;
    return c.rank * 100 + Math.min(d, 12) * 3 + twoLegs + sameName;
  };
  const best = (others) => {
    let top = null, s = -1; const pool = cand.filter((c) => !others.some((o) => o.k === c.k));
    for (const c of pool) { const v = score(c, others); if (v > s) { s = v; top = c; } }
    if (!top) { for (const t of tiles) { if (others.some((o) => o.k === t.k) || t.zone === 'river') continue; const c = land(t); const v = score(c, others); if (v > s) { s = v; top = c; } } }
    return top;
  };
  // the start: the market, the repair café or the hall if the town has one, else the AI Lab; but a start with a flight of
  // at least six tiles is preferred, so that the delivery is worth planning
  const starts = [...PICKUP_ITEMS.map((id) => cand.find((c) => c.item === id)), cand.find((c) => c.fixed === 'ailab'), cand.find((c) => c.fixed), cand[0], land(tiles[Math.floor(tiles.length / 2)])].filter(Boolean);
  let from = null, d1 = null, far = -1;
  for (const s0 of starts) { const d = best([s0]); if (!d) continue; const m = manhattan(s0, d); if (m >= 6) { from = s0; d1 = d; break; } if (m > far) { far = m; from = s0; d1 = d; } }
  const drops = []; if (d1) drops.push(d1);
  if (!junior && d1) { const d2 = best([d1, from]); if (d2) drops.push(d2.label === d1.label ? { ...d2, label: d2.label.replace(/^the /, 'the other ') } : d2); }
  if (!drops.length) return null;
  const slim = ({ k, gx, gz, label, icon, item, fixed, zone }) => ({ k, gx, gz, label, icon, ...(item ? { item } : {}), ...(fixed ? { fixed } : {}), ...(zone ? { zone } : {}) });
  return { from: slim(from), drops: drops.map(slim) };
}
export const placesKey = (places) => (places ? [places.from.k, ...places.drops.map((d) => d.k)].join('|') : '');
export const dropNames = (places) => places.drops.map((d) => d.label).join(' and ');

// ---------------------------------------------------------------- the instructions
// A step is { op: 'up' } | { op: 'go', dir: 'n'|'e'|'s'|'w', n: 1..9 } | { op: 'drop' }.
const okStep = (s) => s && (s.op === 'up' || s.op === 'drop' || (s.op === 'go' && DIRS[s.dir] && Number.isInteger(s.n) && s.n >= 1 && s.n <= MAX_N));
const copy = (s) => (s.op === 'go' ? { op: 'go', dir: s.dir, n: s.n } : { op: s.op });
export const cleanProgram = (p) => (Array.isArray(p) ? p.filter(okStep).slice(0, MAX_STEPS).map(copy) : []);
// Add a tile. Tapping the same direction again makes that step one tile longer, so a long flight needs few taps.
export function addStep(program, step) {
  const p = cleanProgram(program); if (!okStep(step)) return p; const last = p[p.length - 1];
  if (step.op === 'go' && last?.op === 'go' && last.dir === step.dir && last.n + step.n <= MAX_N) { last.n += step.n; return p; }
  if (p.length >= MAX_STEPS) return p;
  p.push(copy(step)); return p;
}
export function removeStep(program, i) { const p = cleanProgram(program); if (i >= 0 && i < p.length) p.splice(i, 1); return p; }
export function bumpStep(program, i, by) { const p = cleanProgram(program); const s = p[i]; if (s?.op === 'go') s.n = Math.max(1, Math.min(MAX_N, s.n + by)); return p; }
export function stepText(s) {
  if (s.op === 'up') return 'Go up above the roofs';
  if (s.op === 'drop') return 'Lower the parcel';
  return `Fly ${DIRS[s.dir].word} ${tilesWord(s.n)}`;
}

// ---------------------------------------------------------------- flying the instructions
// The drone does exactly what the steps say, in order. Its honest limits: it starts on its landing pad and cannot move until
// it is told to go up; it stops at the edge of the island; it lowers the parcel only where someone is waiting for one.
// tileKeys: a Set of the island's tile keys. Returns the whole flight as data, for the map, the 3D view and the words.
export function fly(program, places, tileKeys) {
  const steps = cleanProgram(program); const at = { gx: places.from.gx, gz: places.from.gz };
  const path = [{ ...at }]; const legs = []; const delivered = []; const misses = []; let air = false; let stop = null; let tiles = 0; let ups = 0;
  for (let i = 0; i < steps.length && !stop; i++) {
    const s = steps[i];
    if (s.op === 'up') { if (!air) { air = true; ups++; legs.push({ i, kind: 'up', at: { ...at } }); } else legs.push({ i, kind: 'wait', at: { ...at } }); continue; }
    if (s.op === 'drop') {
      const d = places.drops.find((p) => p.gx === at.gx && p.gz === at.gz && !delivered.includes(p.k));
      if (d && air) { delivered.push(d.k); legs.push({ i, kind: 'drop', at: { ...at }, k: d.k }); } else { misses.push({ i, ...at }); legs.push({ i, kind: 'nodrop', at: { ...at } }); }
      continue;
    }
    if (!air) { stop = { reason: 'ground', step: i }; break; }
    const d = DIRS[s.dir]; const from = { ...at }; let flown = 0;
    for (let n = 0; n < s.n; n++) {
      if (!tileKeys.has(key(at.gx + d.dx, at.gz + d.dz))) { stop = { reason: 'edge', step: i }; break; }
      at.gx += d.dx; at.gz += d.dz; flown++; tiles++; path.push({ ...at });
    }
    if (flown) legs.push({ i, kind: 'go', from, to: { ...at }, dir: s.dir, n: flown });
  }
  const all = delivered.length === places.drops.length;
  return { steps, path, legs, delivered, misses, stop, air, end: { ...at }, tiles, ups, stepsRun: stop ? stop.step : steps.length, all,
    secs: Math.round(ups * UP_SECS + tiles * T / AUTO_SPEED + delivered.length * DROP_SECS) };
}
// The corner points of a flight (start, each turn, end), for the route kept in the town and the map.
export function corners(path) {
  const out = [];
  path.forEach((p, i) => {
    const a = path[i - 1], b = path[i + 1];
    if (!a || !b || (p.gx - a.gx !== b.gx - p.gx) || (p.gz - a.gz !== b.gz - p.gz)) out.push([p.gx, p.gz]);
  });
  return out;
}

// What happened, in built-in words. Never a mark: it says where the drone is and what the next change could be.
export function verdict(result, places) {
  const next = places.drops.find((d) => !result.delivered.includes(d.k));
  if (result.all) return { kind: 'delivered', text: places.drops.length > 1 ? 'Both parcels arrived. The drone followed every step.' : 'The parcel arrived. The drone followed every step.' };
  if (!result.steps.length) return { kind: 'empty', text: 'There are no steps yet. Add some tiles for the drone.' };
  if (result.stop?.reason === 'ground') return { kind: 'ground', step: result.stop.step, text: `Step ${result.stop.step + 1} says fly, but the drone is still on its landing pad. It needs a step that takes it up first.` };
  const here = result.end; const gap = offsetWords(here, next);
  if (result.stop?.reason === 'edge') return { kind: 'edge', step: result.stop.step, text: `The drone stopped at the edge of the island on step ${result.stop.step + 1}. It will not fly out to sea. ${cap(next.label)} is ${gap || 'right below it'}.` };
  if (!gap) return { kind: 'nodrop', text: `The drone is above ${next.label}, but no step told it to lower the parcel.` };
  const miss = result.misses.length ? ' It tried to lower the parcel, but nobody was waiting there.' : '';
  const done = result.delivered.length ? 'One parcel arrived. ' : '';
  return { kind: 'short', text: `${done}The drone stopped where its steps ended.${miss} ${cap(next.label)} is ${gap} of there.` };
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// The fewest tiles any route could fly (straight lines north, south, east and west), for the comparison.
export function fewestTiles(places) {
  const [a, b] = places.drops; if (!b) return manhattan(places.from, a);
  return Math.min(manhattan(places.from, a) + manhattan(a, b), manhattan(places.from, b) + manhattan(b, a));
}

// ---------------------------------------------------------------- the comparison and the record
const secsWord = (n) => `${n} ${n === 1 ? 'second' : 'seconds'}`;
// hand: { secs, tiles } from the hand-flown run (or null if it was skipped); auto: a fly() result that delivered.
export function compareLines(hand, auto, places, junior = true) {
  const out = [];
  if (hand) out.push(`By hand you flew ${tilesWord(hand.tiles)} in ${secsWord(hand.secs)}.`);
  out.push(`Following your ${auto.steps.length} steps, the drone flew ${tilesWord(auto.tiles)} in ${secsWord(auto.secs)}.`);
  if (hand) {
    const d = hand.tiles - auto.tiles;
    out.push(d > 0 ? `The planned route was ${tilesWord(d)} shorter.` : d < 0 ? `Your hand flight was ${tilesWord(-d)} shorter: by hand you can cut corners.` : 'Both flights were the same length.');
  }
  if (!junior) { const f = fewestTiles(places); out.push(auto.tiles <= f ? `That is the fewest tiles this route can take (${f}).` : `The fewest tiles this route can take is ${f}.`); }
  out.push('The drone can fly these steps again and again, the same every time.');
  return out;
}
// One tap, no right answer: which job is worth giving to the drone?
export const AUTOMATE = {
  ask: 'Which delivery would you give the drone to fly by itself?',
  options: [
    { id: 'daily', label: 'The same delivery every day', reply: 'A job that comes round again suits a set of steps. You plan it once and the drone repeats it.' },
    { id: 'once', label: 'A one-off trip to a new place', reply: 'A new place needs new steps each time. For a one-off, flying by hand can be quicker than planning.' },
  ],
};

// "You practised ...": built from what the child actually did. did: { hand, steps, flights, changed, compared, chose }.
export function practisedLines(did, places) {
  const out = [];
  if (did.hand) out.push(`flying a parcel by hand from ${places.from.label} to ${dropNames(places)}`);
  out.push(`planning a route on a map and breaking it into ${did.steps} steps a drone can follow`);
  if (did.flights > 1 || did.changed) out.push('testing the steps, seeing where the drone stopped and changing them');
  if (did.chose) out.push('comparing a hand-flown delivery with an automated one and choosing what to automate');
  else if (did.hand) out.push('comparing a hand-flown delivery with an automated one');
  else out.push('watching a drone follow written steps exactly');
  return out.slice(0, 4);
}
// The steps as a few short lines for the take-home record (each at most 118 characters).
export function programLines(program, maxLines = 3) {
  const lines = []; let cur = '';
  cleanProgram(program).forEach((s, i) => { const part = `${i + 1}. ${stepText(s)}`; if (cur && (cur + '; ' + part).length > 118) { lines.push(cur); cur = part; } else cur = cur ? cur + '; ' + part : part; });
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].slice(0, 114) + ' ...'; }
  return lines;
}
export function makeRecord({ places, program, hand, auto, did, picture }) {
  const lines = [`From ${places.from.label} to ${dropNames(places)}`, ...programLines(program)];
  lines.push(hand ? `By hand: ${tilesWord(hand.tiles)} in ${secsWord(hand.secs)}. The drone by itself: ${tilesWord(auto.tiles)} in ${secsWord(auto.secs)}.` : `The drone by itself: ${tilesWord(auto.tiles)} in ${secsWord(auto.secs)}.`);
  return { made: { title: 'My drone route', lines: lines.slice(0, 6), ...(picture ? { picture } : {}) }, practised: practisedLines(did, places) };
}

// ---------------------------------------------------------------- the route left in the town
export function townData(places, auto) {
  const slim = (p) => ({ k: p.k, ...(p.item ? { item: p.item } : {}) });
  return { v: 1, from: slim(places.from), drops: places.drops.map(slim), pts: corners(auto.path) };
}
// Is the kept route still possible in the town as it is now? (The town may have changed since the module was played.)
export function routeStillThere(data, cells, tileKeys) {
  if (!data || data.v !== 1 || !data.from || !Array.isArray(data.drops) || !Array.isArray(data.pts) || data.pts.length < 2 || data.pts.length > 60) return false;
  const cellOf = new Map(cells || []);
  for (const p of [data.from, ...data.drops]) {
    if (!p || !tileKeys.has(p.k)) return false;
    if (p.item && cellOf.get(p.k)?.item !== p.item) return false;
  }
  return data.pts.every((p) => Array.isArray(p) && tileKeys.has(key(p[0], p[1])));
}

// ---------------------------------------------------------------- progress between visits
// state: { v, places: 'k|k', hand: { secs, tiles, trail }, program, flights, changed, done }
export function cleanHand(h) {
  if (!h || !Number.isFinite(h.secs) || !Number.isFinite(h.tiles)) return null;
  const trail = (Array.isArray(h.trail) ? h.trail : []).filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1])).slice(0, 80).map((p) => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]);
  return { secs: Math.max(1, Math.round(h.secs)), tiles: Math.max(1, Math.round(h.tiles)), trail };
}
export function restore(saved, places) {
  const fresh = { v: 1, places: placesKey(places), hand: null, program: [], flights: 0, changed: false };
  if (!saved || saved.v !== 1 || saved.done || saved.places !== fresh.places) return fresh; // a changed town, or a finished loop played again: start again
  return { ...fresh, hand: cleanHand(saved.hand), program: cleanProgram(saved.program), flights: Math.max(0, saved.flights | 0), changed: !!saved.changed };
}
export { parseKey };
