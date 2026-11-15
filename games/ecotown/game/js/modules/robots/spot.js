// Where in the town the robot works. Pure: it reads the town's cells and the island's tiles, nothing else.
import { ITEMS } from '../../world/catalog.js';

export const LOW = new Set(['path', 'cycle']);                             // open ground a robot can roll along
const FLAT = new Set(['road', 'carpark', 'path', 'cycle', 'tram', 'bridge', 'bigfield', 'mixed', 'allot', 'raingarden', 'reedbed', 'compost']); // nothing tall to hide behind
const HOMES = new Set(['timber', 'straw', 'earth', 'reclaimed', 'cohousing', 'concrete']);
// The sides a camera may stand on. The island is usually seen from the south-west, so those sides come first:
// a robot with open ground to its south or west is in plain view from the usual island view too.
const DIRS = [[0, 1], [-1, 0], [1, 0], [0, -1]];
const xy = (k) => k.split(',').map(Number); const key = (x, z) => `${x},${z}`;
const tilesOf = (terrain) => { const t = terrain?.tiles; return t instanceof Map ? t : new Map((Array.isArray(t) ? t : []).map((x) => [x.k, x])); };

// spot(cells, terrain, want): { key, how, look: [dx, dz], open, beside } or null when the island has nowhere to stand.
//   how: 'street' (open town land or a path), 'edge' (open ground beside the town), 'island' (anywhere open)
//   look: the side the camera stands on. The tile on that side is on the island and has nothing tall on it.
//   open: how many sides are like that (always at least 1: a tile shut in on all four sides is never chosen).
//   beside: the label of a building next to it.  want: the tile used last time; kept while it is still open.
export function spot(cells, terrain, want = null) {
  const tiles = tilesOf(terrain); const town = new Map(cells || []);
  const tall = (k) => { const c = town.get(k); const t = tiles.get(k); return !!(t?.fixed) || !!(c?.item && !FLAT.has(c.item)); };
  const ground = (k) => { const t = tiles.get(k); return !!t && !t.fixed && t.zone !== 'river'; };
  const open = (k) => { const c = town.get(k); return ground(k) && (!c || !c.item || LOW.has(c.item)) && c?.mark !== 'wild'; };
  const around = (k) => { const [x, z] = xy(k); return DIRS.map(([dx, dz]) => key(x + dx, z + dz)); };
  const clear = (k) => tiles.has(k) && !tall(k);                           // a camera can stand over this tile and see past it
  // the sides a camera can use, best first: clear for two tiles, then one; south and west before east and north
  const sides = (k) => { const [x, z] = xy(k); return DIRS.map(([dx, dz], i) => ({ d: [dx, dz], one: clear(key(x + dx, z + dz)), two: clear(key(x + 2 * dx, z + 2 * dz)) || !tiles.has(key(x + 2 * dx, z + 2 * dz)), i }))
    .filter((s) => s.one).sort((a, b) => (b.two - a.two) || (a.i - b.i)); };
  const built = [...town].filter(([, c]) => c?.mark === 'town' || c?.item).map(([k]) => k);
  const done = (k, how) => {
    const s = sides(k); const nb = around(k).map((n) => town.get(n)?.item).filter((i) => i && ITEMS[i] && !FLAT.has(i)); const home = nb.find((i) => HOMES.has(i)) || nb[0];
    return { key: k, how, look: [...s[0].d], open: s.length, beside: home ? ITEMS[home].label : null };
  };
  const ok = (k) => open(k) && sides(k).length > 0;
  const howOf = (k) => (town.get(k)?.mark === 'town' || LOW.has(town.get(k)?.item) ? 'street' : built.length ? 'edge' : 'island');
  if (want && ok(want) && (town.has(want) || !built.length || around(want).some((n) => built.includes(n)))) return done(want, howOf(want));
  // Best: in view (open to the south and west, where the island is usually seen from), with homes beside it, on a path.
  const score = (k) => { const s = sides(k); const [x, z] = xy(k); const front = (clear(key(x, z + 1)) ? 3 : 0) + (clear(key(x - 1, z)) ? 3 : 0);
    return front + (s[0].two ? 2 : 0) + Math.min(2, around(k).filter((n) => HOMES.has(town.get(n)?.item)).length) * 2 + (around(k).some((n) => tall(n)) ? 1 : 0) + (LOW.has(town.get(k)?.item) ? 2 : 0); };
  const best = (list) => list.map((k) => [k, score(k)]).sort((a, b) => b[1] - a[1] || xy(a[0])[1] - xy(b[0])[1] || xy(a[0])[0] - xy(b[0])[0])[0]?.[0];
  // 1. open town land or a path
  const inTown = best([...town].filter(([k, c]) => (c?.mark === 'town' || LOW.has(c?.item)) && ok(k)).map(([k]) => k));
  if (inTown) return done(inTown, 'street');
  // 2. open ground beside the town
  const edge = best([...new Set(built.flatMap(around))].filter((k) => ok(k)));
  if (edge) return done(edge, 'edge');
  // 3. the town is empty (or boxed in): a dry tile near the middle of the island
  const all = [...tiles.values()].filter((t) => ok(t.k)); if (!all.length) return null;
  const cx = all.reduce((s, t) => s + t.gx, 0) / all.length; const cz = all.reduce((s, t) => s + t.gz, 0) / all.length;
  const rank = (t) => (t.zone === 'slope' || t.zone === 'field' ? 0 : t.zone === 'coast' ? 1 : 2) * 100 + Math.abs(t.gx - cx) + Math.abs(t.gz - cz) - (sides(t.k)[0].two ? 0.5 : 0);
  all.sort((a, b) => rank(a) - rank(b) || a.gz - b.gz || a.gx - b.gx);
  return done(all[0].k, built.length ? 'edge' : 'island');
}
