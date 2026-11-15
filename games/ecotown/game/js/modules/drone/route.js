// Drone delivery: the places, the drone's instructions and what happens when it flies them. Pure: no page, no 3D.
import { ITEMS } from '../../world/catalog.js';
import { DIRS, DIR_IDS, T, key, parseKey, manhattan, offsetWords, dirWords, tilesWord, sideWord } from './geo.js';

export const MAX_STEPS = 12;   // tiles in one set of instructions
export const MAX_N = 9;        // "fly east N tiles"
export const AUTO_SPEED = 6;   // world units a second when the drone flies itself
export const UP_SECS = 1.2, DROP_SECS = 1.6;

// ---------------------------------------------------------------- places
const FIXED = { ailab: { label: 'the AI Lab', icon: '🤖' }, oldschool: { label: 'the old school', icon: '🏫' }, dock: { label: 'the ferry dock', icon: '⛴' } };
const PICKUP_ITEMS = ['market', 'repair', 'hall'];                       // where a parcel starts, best first
const DROP_ITEMS = ['school', 'hall', 'park', 'market', 'repair', 'bridge', 'greenbridge', 'festival'];
const NEAR_ITEMS = ['orchard', 'mixed', 'allot', 'hives', 'park', 'market', 'school', 'hall', 'repair', 'wind', 'battery', 'festival', 'compost', 'vertical', 'bigfield', 'raingarden', 'reedbed', 'tram', 'carpark']; // "the cottages by the orchard"
const ZONE_PLACE = { meadow: 'the river meadow', wetland: 'the wetland', wood: 'the old wood', slope: 'the sunny slope', coast: 'the coast', field: 'the dry field', river: 'the river' };
const labelOf = (item) => 'the ' + ITEMS[item].label.charAt(0).toLowerCase() + ITEMS[item].label.slice(1);
const byKey = (a, b) => (a.gx - b.gx) || (a.gz - b.gz);

// Every building a parcel could start from or go to, from the child's own town and the island's fixed buildings.
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
// Many buildings share a name ("the straw-bale cottages"). Say which one: by what stands next to it, or its side of the island.
function qualify(p, built, cells, tileOf) {
  if (!p.item || !built.some((c) => c.k !== p.k && c.label === p.label)) return p.label;
  const cellOf = new Map(cells || []); const count = new Map();
  for (const [, c] of cells || []) if (c?.item) count.set(c.item, (count.get(c.item) || 0) + 1);
  let found = null;
  for (const r of [1, 2]) {
    for (let dz = -r; dz <= r && !found?.once; dz++) for (let dx = -r; dx <= r; dx++) {
      if (Math.abs(dx) + Math.abs(dz) !== r) continue; const k = key(p.gx + dx, p.gz + dz); const t = tileOf.get(k); if (!t) continue;
      const item = cellOf.get(k)?.item; let name = null, once = true;
      if (t.fixed && FIXED[t.fixed]) name = FIXED[t.fixed].label; else if (item && NEAR_ITEMS.includes(item)) { name = labelOf(item); once = count.get(item) === 1; } else if (t.zone === 'river') name = 'the river';
      if (name && (!found || (once && !found.once))) found = { name, once };
      if (found?.once) break;
    }
    if (found) break;
  }
  return found ? `${p.label} by ${found.name}` : `${p.label} on the ${sideWord(p)} side`;
}

// One visit is two deliveries from the same landing pad. Ages 8-12: one parcel, then two. Ages 13-17: two parcels and a
// battery limit, then two more with a no-fly zone to route round. `used` is the drop-offs of earlier visits (tile keys):
// they are chosen last, so playing again gives a different pair of places. Always returns something on an island with
// tiles: a nearly empty town uses the AI Lab, the old school, the ferry dock and named parts of the island.
export function pickVisit(cells, tiles, junior = true, used = []) {
  tiles = [...tiles].sort(byKey); if (!tiles.length) return null;
  const tileKeys = new Set(tiles.map((t) => t.k)); const tileOf = new Map(tiles.map((t) => [t.k, t]));
  const raw = candidates(cells, tiles); const built = raw.map((c) => ({ ...c, label: qualify(c, raw, cells, tileOf) })); const builtKeys = new Set(built.map((c) => c.k));
  const land = tiles.filter((t) => t.zone !== 'river' && !builtKeys.has(t.k)).map((t) => ({ k: t.k, gx: t.gx, gz: t.gz, zone: t.zone, label: ZONE_PLACE[t.zone] || 'the far side of the island', icon: '📍', rank: 0 }));
  const pool = [...built, ...land]; const usedSet = new Set(Array.isArray(used) ? used : []); const taken = [];
  // a drop-off is best 8 to 10 tiles from the pad (a flight worth planning), in the child's own town, not next door to
  // another, and with a name of its own
  const score = (c, from, others, avoid) => {
    if (others.some((o) => manhattan(o, c) < 3)) return null;
    const d = manhattan(from, c); const far = Math.max(0, 80 - 12 * Math.max(0, Math.abs(d - 9) - 1));
    const twoLegs = from.gx !== c.gx && from.gz !== c.gz ? 4 : 0; const sameName = others.some((o) => o.label === c.label) || taken.includes(c.label) ? -60 : 0;
    return [-10, 10, 60, 90][c.rank] + far + twoLegs + sameName - (avoid.has(c.k) ? 200 : 0);
  };
  const best = (from, others, avoid) => {
    let top = null, s = -Infinity;
    for (const c of pool) { if (c.k === from.k || others.some((o) => o.k === c.k)) continue; const v = score(c, from, [from, ...others], avoid); if (v !== null && v > s) { s = v; top = c; } }
    return top;
  };
  // the pad: the market, the repair café or the hall if the town has one, else the AI Lab; a pad whose best flight is at
  // least eight tiles is preferred, so that the delivery is worth flying and planning
  const starts = [...PICKUP_ITEMS.map((id) => built.find((c) => c.item === id)), built.find((c) => c.fixed === 'ailab'), ...built.filter((c) => c.fixed), built[0]].filter(Boolean);
  let from = null, d1 = null, far = -1;
  const tryStart = (s0) => { const d = best(s0, [], usedSet); if (!d) return false; const m = manhattan(s0, d); if (m > far) { far = m; from = s0; d1 = d; } return m >= 8; };
  for (const s0 of starts) if (tryStart(s0)) break;
  if (!d1 && land.length) tryStart(land[Math.floor(land.length / 2)]); // an island with no buildings at all
  if (!d1) return null;
  taken.push(from.label, d1.label);
  const drops1 = [d1]; if (!junior) { const d2 = best(from, [d1], usedSet); if (d2) { drops1.push(d2); taken.push(d2.label); } }
  const avoid2 = new Set([...usedSet, ...drops1.map((d) => d.k)]); const drops2 = [];
  const a = best(from, [], avoid2); if (a) { drops2.push(a); taken.push(a.label); const b = best(from, [a], avoid2); if (b) drops2.push(b); }
  const names = new Map(); const seen = new Set();
  for (const p of [from, ...drops1, ...drops2]) { if (names.has(p.k)) continue; let label = p.label; if (seen.has(label)) label = label.replace(/^the /, 'the other '); seen.add(label); names.set(p.k, label); }
  const slim = ({ k, gx, gz, icon, item, fixed, zone }) => ({ k, gx, gz, label: names.get(k), icon, ...(item ? { item } : {}), ...(fixed ? { fixed } : {}), ...(zone ? { zone } : {}) });
  const mk = (drops, i) => { const p = { from: slim(from), drops: drops.map(slim) }; return junior ? p : addExtras(p, tileKeys, i > 0); };
  const deliveries = [mk(drops1, 0)]; if (drops2.length) deliveries.push(mk(drops2, 1));
  return { from: deliveries[0].from, deliveries };
}
// The first delivery of a visit (kept for the places tests).
export const pickPlaces = (cells, tiles, junior = true, used = []) => pickVisit(cells, tiles, junior, used)?.deliveries[0] || null;
export const placesKey = (places) => (places ? [places.from.k, ...places.drops.map((d) => d.k)].join('|') : '');
export const visitKey = (visit) => (visit ? visit.deliveries.map(placesKey).join('/') : '');
export const dropNames = (places) => places.drops.map((d) => d.label).join(' and ');

// ---------------------------------------------------------------- the extras for ages 13-17
// Fewest tiles from one tile to every other, flying north, south, east and west over the island and round a no-fly zone.
function distMap(start, tileKeys, block) {
  const dist = new Map([[key(start.gx, start.gz), 0]]); const q = [{ gx: start.gx, gz: start.gz }];
  for (let i = 0; i < q.length; i++) {
    const c = q[i]; const d0 = dist.get(key(c.gx, c.gz));
    for (const id of DIR_IDS) { const n = { gx: c.gx + DIRS[id].dx, gz: c.gz + DIRS[id].dz }; const k = key(n.gx, n.gz); if (!tileKeys.has(k) || block.has(k) || dist.has(k)) continue; dist.set(k, d0 + 1); q.push(n); }
  }
  return dist;
}
// Fewest "fly" steps (straight runs of at most MAX_N tiles) from one tile to every other.
function legsMap(start, tileKeys, block) {
  const seen = new Set(); const out = new Map([[key(start.gx, start.gz), 0]]); let level = [{ gx: start.gx, gz: start.gz, dir: '', len: 0 }]; let legs = 0;
  while (level.length && legs < 40) {
    const next = [];
    for (let i = 0; i < level.length; i++) {
      const c = level[i]; const id0 = c.gx + ',' + c.gz + c.dir + c.len; if (seen.has(id0)) continue; seen.add(id0);
      const k0 = key(c.gx, c.gz); if (!out.has(k0)) out.set(k0, legs);
      for (const id of DIR_IDS) {
        const n = { gx: c.gx + DIRS[id].dx, gz: c.gz + DIRS[id].dz }; const k = key(n.gx, n.gz); if (!tileKeys.has(k) || block.has(k)) continue;
        if (id === c.dir && c.len < MAX_N) level.push({ ...n, dir: id, len: c.len + 1 }); else next.push({ ...n, dir: id, len: 1 });
      }
    }
    level = next; legs++;
  }
  return out;
}
const bothOrders = (places, mapFrom) => {
  const [a, b] = places.drops; const f = mapFrom(places.from); const da = f.get(a.k) ?? Infinity; if (!b) return da;
  const db = f.get(b.k) ?? Infinity; const ab = mapFrom(a).get(b.k) ?? Infinity; return Math.min(da, db) + ab;
};
// The fewest tiles any set of steps could fly for this delivery (either parcel first). With the island's tiles it goes
// round the island's edge and any no-fly zone; without them it is the straight count.
export function fewestTiles(places, tileKeys) {
  if (!tileKeys) { const [a, b] = places.drops; if (!b) return manhattan(places.from, a); return Math.min(manhattan(places.from, a), manhattan(places.from, b)) + manhattan(a, b); }
  const block = new Set(places.nofly || []); return bothOrders(places, (p) => distMap(p, tileKeys, block));
}
// The fewest steps (tiles in the planner) that can make this delivery: one to go up, the flights, and one for each parcel.
export function fewestSteps(places, tileKeys) {
  const block = new Set(places.nofly || []); return 1 + places.drops.length + bothOrders(places, (p) => legsMap(p, tileKeys, block));
}
// A no-fly zone (birds are nesting): a short line of tiles across the straight way from the pad to the first drop-off,
// open at one end, so the route has to go round. [] when no fair zone fits (the delivery must still fit the step limit).
export function noFlyZone(p, tileKeys) {
  const taken = new Set([p.from.k, ...p.drops.map((d) => d.k)]); const base = fewestTiles(p, tileKeys); let fallback = null;
  const pairs = [[p.from, p.drops[0]]]; if (p.drops[1]) pairs.push([p.from, p.drops[1]], [p.drops[0], p.drops[1]]);
  for (const [A, B] of pairs) {
    const alongX = Math.abs(B.gx - A.gx) >= Math.abs(B.gz - A.gz); const [a0, b0] = alongX ? [A.gx, B.gx] : [A.gz, B.gz]; if (Math.abs(b0 - a0) < 3) continue;
    const [s0, s1] = alongX ? [A.gz, B.gz] : [A.gx, B.gx]; const lo = Math.min(s0, s1), hi = Math.max(s0, s1); const mid = Math.round((a0 + b0) / 2);
    for (const m of [mid, mid - 1, mid + 1]) {
      if (m <= Math.min(a0, b0) || m >= Math.max(a0, b0)) continue;
      for (const [from, to] of [[lo - 1, hi], [lo, hi + 1], [lo - 1, hi + 1], [lo, hi]]) {
        const zone = []; for (let s = from; s <= to; s++) { const k = alongX ? key(m, s) : key(s, m); if (tileKeys.has(k) && !taken.has(k)) zone.push(k); }
        if (!zone.length || zone.length > 6) continue;
        const q = { ...p, nofly: zone }; const f = fewestTiles(q, tileKeys);
        if (!Number.isFinite(f) || f > base + 8 || fewestSteps(q, tileKeys) > MAX_STEPS - 2) continue;
        if (f > base) return zone; fallback ||= zone;
      }
    }
  }
  return fallback || [];
}
// Ages 13-17: a battery that holds a few tiles more than the fewest possible, and (second delivery) a no-fly zone.
export function addExtras(p, tileKeys, zone) {
  if (zone) { const z = noFlyZone(p, tileKeys); if (z.length) p.nofly = z; }
  const f = fewestTiles(p, tileKeys); if (Number.isFinite(f)) p.battery = f + (zone ? 3 : 4);
  return p;
}

// ---------------------------------------------------------------- the instructions
// A step is { op: 'up' } | { op: 'go', dir: 'n'|'e'|'s'|'w', n: 1..9 } | { op: 'drop' }.
const okStep = (s) => s && (s.op === 'up' || s.op === 'drop' || (s.op === 'go' && DIRS[s.dir] && Number.isInteger(s.n) && s.n >= 1 && s.n <= MAX_N));
const copy = (s) => (s.op === 'go' ? { op: 'go', dir: s.dir, n: s.n } : { op: s.op });
export const cleanProgram = (p) => (Array.isArray(p) ? p.filter(okStep).slice(0, MAX_STEPS).map(copy) : []);
// Add a tile at the end. Tapping the same direction again makes that step one tile longer, so a long flight needs few taps.
export function addStep(program, step) {
  const p = cleanProgram(program); if (!okStep(step)) return p; const last = p[p.length - 1];
  if (step.op === 'go' && last?.op === 'go' && last.dir === step.dir && last.n + step.n <= MAX_N) { last.n += step.n; return p; }
  if (p.length >= MAX_STEPS) return p;
  p.push(copy(step)); return p;
}
// Put a tile in before step i (0 = first). A flight next to one in the same direction makes that one longer instead.
export function insertStep(program, i, step) {
  const p = cleanProgram(program); if (!okStep(step)) return p; if (!(i >= 0) || i >= p.length) return addStep(p, step);
  if (step.op === 'go') for (const near of [p[i - 1], p[i]]) if (near?.op === 'go' && near.dir === step.dir && near.n + step.n <= MAX_N) { near.n += step.n; return p; }
  if (p.length >= MAX_STEPS) return p;
  p.splice(i, 0, copy(step)); return p;
}
// Move step i one place earlier (by = -1) or later (by = 1).
export function moveStep(program, i, by) {
  const p = cleanProgram(program); const j = i + (by < 0 ? -1 : 1); if (!(i >= 0) || i >= p.length || j < 0 || j >= p.length) return p;
  [p[i], p[j]] = [p[j], p[i]]; return p;
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
// it is told to go up; it stops at the edge of the island; it will not fly over a no-fly zone; its battery holds so many
// tiles; it lowers the parcel only where someone is waiting for one.
// tileKeys: a Set of the island's tile keys. Returns the whole flight as data, for the map, the 3D view and the words.
export function fly(program, places, tileKeys) {
  const steps = cleanProgram(program); const at = { gx: places.from.gx, gz: places.from.gz };
  const nofly = new Set(places.nofly || []); const battery = Number.isFinite(places.battery) ? places.battery : Infinity;
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
      const k = key(at.gx + d.dx, at.gz + d.dz);
      if (!tileKeys.has(k)) { stop = { reason: 'edge', step: i }; break; }
      if (nofly.has(k)) { stop = { reason: 'nofly', step: i }; break; }
      if (tiles >= battery) { stop = { reason: 'battery', step: i }; break; }
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

// How much Florence says after a flight that stopped away from the drop-off. 0: which way to go, and "count the
// squares". 1: the numbers too. miss = how many earlier flights of this delivery stopped short. Ages 13-17 never get
// the numbers: counting is the job.
export const hintLevel = (miss, junior) => (junior && miss >= 1 ? 1 : 0);
// What happened, in built-in words. Never a mark: it says where the drone is and what the next change could be.
export function verdict(result, places, { junior = true, miss = 0 } = {}) {
  const next = places.drops.find((d) => !result.delivered.includes(d.k)); const two = places.drops.length > 1;
  if (result.all) return { kind: 'delivered', text: two ? 'Both parcels arrived. The drone followed every step.' : 'The parcel arrived. The drone followed every step.' };
  if (!result.steps.length) return { kind: 'empty', text: 'There are no steps yet. Add some tiles for the drone.' };
  const n = result.stop ? result.stop.step + 1 : 0;
  if (result.stop?.reason === 'ground') return { kind: 'ground', step: n - 1, text: `Step ${n} says fly, but the drone is still on its landing pad. It needs a "Go up" step first. Tap the number ${n} beside that step, then tap Go up. The new step goes in before it.` };
  const here = result.end; const level = hintLevel(miss, junior);
  const way = level ? offsetWords(here, next) : dirWords(here, next);
  const reach = !way ? `It is above ${next.label} now.` : level ? `To reach ${next.label}, it still has to go ${way}.` : `To reach ${next.label}, it still has to go ${way}. Count the squares on the map.`;
  const done = result.delivered.length ? 'One parcel arrived. ' : '';
  if (result.stop?.reason === 'edge') return { kind: 'edge', step: n - 1, away: !!way, text: `${done}The drone stopped on step ${n}. It will not fly past the edge of the island. ${reach}` };
  if (result.stop?.reason === 'nofly') return { kind: 'nofly', step: n - 1, away: !!way, text: `${done}The drone stopped on step ${n}. Birds are nesting ahead, and it will not fly over them. Plan a way round the striped squares.` };
  if (result.stop?.reason === 'battery') return { kind: 'battery', step: n - 1, away: !!way, text: `${done}The battery ran low on step ${n}, so the drone stopped. It holds enough for ${tilesWord(places.battery)}. Look for a shorter way.` };
  if (!way) return { kind: 'nodrop', text: `${done}The drone is above ${next.label}, but no step told it to lower the parcel.` };
  const miss1 = result.misses.length ? ' It tried to lower the parcel, but nobody was waiting there.' : '';
  return { kind: 'short', away: true, text: `${done}The drone stopped where its steps ended.${miss1} ${reach}` };
}

// ---------------------------------------------------------------- the comparison and the record
const secsWord = (n) => `${n} ${n === 1 ? 'second' : 'seconds'}`;
const stepsWord = (n) => `${n} ${n === 1 ? 'step' : 'steps'}`;
// hand: { secs, tiles } from the hand-flown run (or null: this delivery was planned from the map alone);
// auto: a fly() result that delivered. tileKeys (optional): the island, for the fewest tiles round its edge.
export function compareLines(hand, auto, places, junior = true, tileKeys = null) {
  const out = [];
  if (hand) out.push(`By hand you flew ${tilesWord(hand.tiles)} in ${secsWord(hand.secs)}.`);
  out.push(`Following your ${stepsWord(auto.steps.length)}, the drone flew ${tilesWord(auto.tiles)} in ${secsWord(auto.secs)}.`);
  if (hand) {
    const d = hand.tiles - auto.tiles;
    out.push(d > 0 ? `The planned route was ${tilesWord(d)} shorter.` : d < 0 ? `Your hand flight was ${tilesWord(-d)} shorter: by hand you can cut corners.` : 'Both flights were the same length.');
  } else out.push('You planned this one from the map alone, without flying it first.');
  if (!junior) {
    const f = fewestTiles(places, tileKeys);
    out.push(auto.tiles <= f ? `That is the fewest tiles this delivery can take (${f}).` : `The fewest tiles this delivery can take is ${f}. Yours took ${auto.tiles}: ${auto.tiles - f} more.`);
    if (Number.isFinite(places.battery)) out.push(`It used ${auto.tiles} of the ${places.battery} tiles the battery holds.`);
  }
  out.push('The drone can fly these steps again and again, the same every time.');
  return out;
}
// One tap, no right answer: which job is worth giving to the drone? And, after the second delivery, what stays with people?
export const AUTOMATE = {
  ask: 'Which delivery would you give the drone to fly by itself?',
  options: [
    { id: 'daily', label: 'The same delivery every day', reply: 'A job that comes round again suits a set of steps. You plan it once and the drone repeats it.' },
    { id: 'once', label: 'A one-off trip to a new place', reply: 'A new place needs new steps each time. For a one-off, flying by hand can be quicker than planning.' },
  ],
};
export const PEOPLE = {
  ask: 'The drone can fly this route every day now. What would you still give a person to do?',
  options: [
    { id: 'check', label: 'Look at the route again when the town changes', reply: 'The steps fit the town as it was when you wrote them. When something new is built, a person looks again and changes the steps.' },
    { id: 'meet', label: 'Meet people at the door', reply: 'The drone does the flying. A person at the door can say hello and see that the parcel is the one that was wanted.' },
  ],
};

// "You practised ...": built from what the child actually did.
// did: { hand, parcels (flown by hand), runs (deliveries planned), steps, flights, changed, chose, nofly, battery }.
export function practisedLines(did, places) {
  const out = []; const two = (did.runs || 1) > 1;
  if (did.hand) out.push(`flying ${(did.parcels || 1) > 1 ? 'two parcels' : 'a parcel'} by hand from ${shortName(places.from.label)} to ${places.drops.map((d) => shortName(d.label)).join(' and ')}`);
  const extra = did.nofly && did.battery ? ', round a no-fly zone and inside a battery limit,' : did.nofly ? ', round a no-fly zone,' : did.battery ? ', inside a battery limit,' : '';
  out.push(`planning ${two ? 'two routes' : 'a route'} on a map${extra} ${extra ? 'as' : `and breaking ${two ? 'them' : 'it'} into`} ${stepsWord(did.steps)} a drone can follow`);
  if (did.flights > (did.runs || 1) || did.changed) out.push('testing the steps, seeing where the drone stopped and changing them');
  if (did.chose) out.push('comparing a hand-flown delivery with an automated one and choosing what to automate');
  else if (did.hand) out.push('comparing a hand-flown delivery with an automated one');
  else out.push('watching a drone follow written steps exactly');
  return out.slice(0, 4);
}
// "the straw-bale cottages by the orchard" -> "the straw-bale cottages", where a line would be too long.
const shortName = (label) => label.replace(/ (by the .+|on the \w+ side)$/, '');
const NB = ' '; // a space that does not break, so a line of steps only wraps between whole steps
// The steps as one short line for the take-home record: "Up → north 4 → west 2 → lower".
export function shortSteps(program) {
  const parts = cleanProgram(program).map((s) => (s.op === 'up' ? 'up' : s.op === 'drop' ? 'lower' : `${DIRS[s.dir].word}${NB}${s.n}`));
  let line = parts.join(`${NB}→ `); line = line.charAt(0).toUpperCase() + line.slice(1);
  return line.length > 118 ? line.slice(0, 115) + ' …' : line;
}
// runs: [{ places, program, auto }] for each delivery planned, in order. hand: the hand flight of the first.
export function makeRecord({ runs, hand, did, picture, junior = true, tileKeys = null }) {
  const lines = [];
  runs.forEach((r, i) => {
    const tail = `: ${stepsWord(r.auto.steps.length)}, ${tilesWord(r.auto.tiles)}`; const lead = i ? 'Then to ' : `From ${r.places.from.label} to `;
    let head = lead + dropNames(r.places) + tail; if (head.length > 118) head = (i ? 'Then to ' : `From ${shortName(r.places.from.label)} to `) + r.places.drops.map((d) => shortName(d.label)).join(' and ') + tail;
    lines.push(head.slice(0, 120), shortSteps(r.program));
  });
  const auto = runs[0].auto;
  lines.push(hand ? `By hand: ${tilesWord(hand.tiles)} in ${secsWord(hand.secs)}. The drone by itself: ${tilesWord(auto.tiles)} in ${secsWord(auto.secs)}.` : `The drone by itself: ${tilesWord(auto.tiles)} in ${secsWord(auto.secs)}.`);
  if (!junior) lines.push(`Fewest tiles possible: ${runs.map((r) => fewestTiles(r.places, tileKeys)).join(' and ')}. The drone flew ${runs.map((r) => r.auto.tiles).join(' and ')}.`);
  return { made: { title: 'My drone route', lines: lines.slice(0, 6), ...(picture ? { picture } : {}) }, practised: practisedLines(did, runs[0].places) };
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
// state: { v: 2, places: the visit's key, round (visits finished), used (drop-offs of earlier visits), d (which delivery),
//          hand: { secs, tiles, trail, hoops, of }, program, first (the steps that made delivery 1), flights, changed, miss, done }
export function cleanHand(h) {
  if (!h || !Number.isFinite(h.secs) || !Number.isFinite(h.tiles)) return null;
  const trail = (Array.isArray(h.trail) ? h.trail : []).filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1])).slice(0, 80).map((p) => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]);
  const count = (v) => Math.max(0, Math.min(9, v | 0));
  return { secs: Math.max(1, Math.round(h.secs)), tiles: Math.max(1, Math.round(h.tiles)), trail, ...(Number.isFinite(h.of) ? { hoops: Math.min(count(h.hoops), count(h.of)), of: count(h.of) } : {}) };
}
// The drop-offs of earlier visits, from what was saved: the next visit goes somewhere else.
export function usedOf(saved) {
  return saved?.v === 2 && Array.isArray(saved.used) ? saved.used.filter((k) => typeof k === 'string' && /^\d{1,2},\d{1,2}$/.test(k)).slice(-8) : [];
}
export function restore(saved, visit) {
  const round = saved?.v === 2 ? Math.max(0, saved.round | 0) : 0;
  const fresh = { v: 2, places: visitKey(visit), round, used: usedOf(saved), d: 0, hand: null, program: [], first: null, flights: 0, changed: false, miss: 0 };
  if (!saved || saved.v !== 2 || saved.done || saved.places !== fresh.places) return fresh; // a changed town, or a finished visit played again: start again
  const first = cleanProgram(saved.first); const d = saved.d === 1 && first.length && visit.deliveries.length > 1 ? 1 : 0;
  return { ...fresh, d, hand: cleanHand(saved.hand), program: cleanProgram(saved.program), first: d ? first : null, flights: Math.max(0, saved.flights | 0), changed: !!saved.changed, miss: Math.max(0, Math.min(9, saved.miss | 0)) };
}
// What is kept when a visit is finished: only how many visits there have been and where the parcels went.
export function finishState(st, visit) {
  return { v: 2, done: true, round: (st.round | 0) + 1, used: [...usedOf(st), ...visit.deliveries.flatMap((p) => p.drops.map((d) => d.k))].slice(-8) };
}
export { parseKey };
