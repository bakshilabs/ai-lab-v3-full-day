// Where in the town the robot works. Pure: it reads the town's cells and the island's tiles, nothing else.
import { ITEMS } from '../../world/catalog.js';

const LOW = new Set(['path', 'cycle']);                                   // open ground a robot can roll along
const FLAT = new Set(['road', 'carpark', 'path', 'cycle', 'tram', 'bridge', 'bigfield', 'mixed', 'allot', 'raingarden', 'reedbed', 'compost']); // nothing tall to hide behind
const HOMES = new Set(['timber', 'straw', 'earth', 'reclaimed', 'cohousing', 'concrete']);
const DIRS = [[0, 1], [1, 0], [-1, 0], [0, -1]];                          // where the camera may stand: south, east, west, north
const xy = (k) => k.split(',').map(Number); const key = (x, z) => `${x},${z}`;
const tilesOf = (terrain) => { const t = terrain?.tiles; return t instanceof Map ? t : new Map((Array.isArray(t) ? t : []).map((x) => [x.k, x])); };

// spot(cells, terrain, want): { key, how, look: [dx, dz], beside } or null when the island has no tile to stand on.
//   how: 'street' (open town land or a path), 'edge' (open ground beside the town), 'island' (the town is empty)
//   look: the side the camera stands on, where nothing tall is in the way.  beside: the label of a building next to it.
//   want: the tile used last time; it is kept while it is still open.
export function spot(cells, terrain, want = null) {
  const tiles = tilesOf(terrain); const town = new Map(cells || []);
  const tall = (k) => { const c = town.get(k); const t = tiles.get(k); return !!(t?.fixed) || !!(c?.item && !FLAT.has(c.item)); };
  const ground = (k) => { const t = tiles.get(k); return !!t && !t.fixed && t.zone !== 'river'; };
  const open = (k) => { const c = town.get(k); return ground(k) && (!c || !c.item || LOW.has(c.item)) && c?.mark !== 'wild'; };
  const around = (k) => { const [x, z] = xy(k); return DIRS.map(([dx, dz]) => key(x + dx, z + dz)); };
  const built = [...town].filter(([, c]) => c?.mark === 'town' || c?.item).map(([k]) => k);
  const done = (k, how) => {
    const [x, z] = xy(k); const look = DIRS.find(([dx, dz]) => tiles.has(key(x + dx, z + dz)) && !tall(key(x + dx, z + dz))) || DIRS.find(([dx, dz]) => !tall(key(x + dx, z + dz))) || DIRS[0];
    const nb = around(k).map((n) => town.get(n)?.item).filter((i) => i && ITEMS[i] && !FLAT.has(i)); const home = nb.find((i) => HOMES.has(i)) || nb[0];
    return { key: k, how, look: [...look], beside: home ? ITEMS[home].label : null };
  };
  const howOf = (k) => (town.get(k)?.mark === 'town' || LOW.has(town.get(k)?.item) ? 'street' : built.length ? 'edge' : 'island');
  if (want && open(want) && (town.has(want) || !built.length || around(want).some((n) => built.includes(n)))) return done(want, howOf(want));
  // 1. open town land or a path: best beside homes, a path first
  const score = (k) => around(k).filter((n) => HOMES.has(town.get(n)?.item)).length * 2 + around(k).filter((n) => tall(n)).length + (LOW.has(town.get(k)?.item) ? 3 : 0);
  const best = (list) => list.map((k) => [k, score(k)]).sort((a, b) => b[1] - a[1] || xy(a[0])[1] - xy(b[0])[1] || xy(a[0])[0] - xy(b[0])[0])[0]?.[0];
  const inTown = best([...town].filter(([k, c]) => (c?.mark === 'town' || LOW.has(c?.item)) && open(k)).map(([k]) => k));
  if (inTown) return done(inTown, 'street');
  // 2. open ground beside the town
  const edge = best([...new Set(built.flatMap(around))].filter((k) => open(k)));
  if (edge) return done(edge, 'edge');
  // 3. the town is empty (or boxed in): a fixed, dry tile near the middle of the island
  const all = [...tiles.values()].filter((t) => open(t.k)); if (!all.length) return null;
  const cx = all.reduce((s, t) => s + t.gx, 0) / all.length; const cz = all.reduce((s, t) => s + t.gz, 0) / all.length;
  const rank = (t) => (t.zone === 'slope' || t.zone === 'field' ? 0 : t.zone === 'coast' ? 1 : 2) * 100 + Math.abs(t.gx - cx) + Math.abs(t.gz - cz);
  all.sort((a, b) => rank(a) - rank(b) || a.gz - b.gz || a.gx - b.gx);
  return done(all[0].k, built.length ? 'edge' : 'island');
}
