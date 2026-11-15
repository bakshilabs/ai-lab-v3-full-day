// The street model for the "roads" module: one street of ten places, what a child may put on it, the morning's
// simulation and the freed car park. Pure: no page, no 3D, no clock. Everything here is unit tested (tests/roads.test.mjs).
//
// The street runs west to east. Homes stand along the north side. On the south side are the shop, the old car park
// (four plots), a side road (the junction) and the school. A cycle track crosses the street at place 6.

export const SLOTS = 10;          // places along the kerb, numbered 0 (west) to 9 (east)
export const SLOT_M = 25;         // metres per place
export const JUNCTION = 5;        // the side road joins here: nothing can be put in a junction
export const HOMES = [0, 1, 2, 3, 4, 5, 7, 8, 9]; // places with a home on the north side
// where people cross the street every morning, whatever is painted on it
export const LINES = [
  { id: 'shop', slot: 0, who: 'walk' },
  { id: 'track', slot: 6, who: 'cycle' },
  { id: 'school', slot: 8, who: 'walk' },
];
export const CARPARK = [1, 2, 3, 4]; // the car park's four plots stand beside these places; the last one stays for the shared cars
export const FREE_PLOTS = 3;
export const PLOT_M2 = 250, PLOT_SPACES = 10, CARPARK_SPACES = 40;

// the pieces. Ages 8–12 have one crossing for everyone; ages 13–17 have one for walkers and one for cycles.
export const KINDS = ['drop', 'bay', 'walk', 'cycle'];
export const kindsFor = (junior) => (junior ? ['drop', 'bay', 'walk'] : KINDS);
export const BAY_CARS = 3;        // shared cars that fit in one waiting bay

// the morning, in seconds
export const WINDOW = 30 * 60;    // families ask for a car during this half hour
const WALK_S = 20;                // a person walks one place (25 m) in 20 s
const DRIVE_S = 5;                // a car drives one place in 5 s on this slow street
const CROSS_S = 12;               // a car slows and waits at each marked crossing it passes
const BOARD_S = 60;               // getting in at a drop-off point
const AWAY_S = 4 * 60;            // the trip into town and back to this street
const DEPOT_S = 4 * 60;           // a car with no bay waits outside the street, four minutes away
const EXIT = SLOTS;               // cars come and go by the east end

export const emptyLayout = () => Array(SLOTS).fill(null);
export function cleanLayout(v, junior = false) {
  const ok = kindsFor(junior); const out = emptyLayout();
  if (Array.isArray(v)) for (let i = 0; i < SLOTS; i++) if (i !== JUNCTION && ok.includes(v[i])) out[i] = v[i];
  return out;
}
export const canPlace = (slot) => Number.isInteger(slot) && slot >= 0 && slot < SLOTS && slot !== JUNCTION;
// put a piece on a place; the same piece again takes it away. Returns a new layout.
export function place(layout, slot, kind) {
  if (!canPlace(slot) || !KINDS.includes(kind)) return layout;
  const out = layout.slice(); out[slot] = out[slot] === kind ? null : kind; return out;
}
export const slotsOf = (layout, kind) => layout.map((k, i) => (k === kind ? i : -1)).filter((i) => i >= 0);
export function counts(layout) {
  const c = { drop: 0, bay: 0, walk: 0, cycle: 0 }; for (const k of layout) if (k) c[k]++;
  return { ...c, crossings: c.walk + c.cycle, pieces: c.drop + c.bay + c.walk + c.cycle };
}

// Which of the three crossing places are safe? A marked crossing at the place or the one next to it makes it safe.
// For ages 13–17 it must be the right kind: a walkers' crossing for people on foot, a cycle crossing for the track.
export function crossings(layout, junior = false) {
  return LINES.map((l) => {
    const ok = layout.some((k, s) => Math.abs(s - l.slot) <= 1 && (junior ? k === 'walk' || k === 'cycle' : k === l.who));
    return { ...l, safe: ok };
  });
}

// how many families ask for a car in the morning: the child's own town, with a floor so an empty town still has a street to plan
export const tripsFor = (families) => Math.max(24, Math.min(36, Math.round(Number(families) || 0)));
export const fleetFor = (trips) => Math.ceil(trips / 3);

export function rng(seed) { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Run the morning. Every family asks for one shared car at a set time (the same times for the same seed). A person
// walks to the nearest drop-off point; the nearest free car drives there; one car loads at a point at a time.
// Returns the numbers and a list of trips with their times, for the picture of the morning.
export function simulate(layout, { families = 0, extraFamilies = 0, seed = 7, junior = false } = {}) {
  const n = tripsFor(families) + Math.max(0, extraFamilies | 0); const fleet = fleetFor(n);
  const drops = slotsOf(layout, 'drop'); const bays = slotsOf(layout, 'bay'); const marked = layout.map((k) => k === 'walk' || k === 'cycle');
  const cross = crossings(layout, junior); const safe = cross.filter((c) => c.safe).length;
  const walkOf = (home) => Math.min(...drops.map((d) => Math.abs(d - home)));
  const base = { trips: n, fleet, drops: drops.length, bays: bays.length, crossings: cross, safe, lines: LINES.length, carsInBays: Math.min(fleet, bays.length * BAY_CARS), carsOutside: Math.max(0, fleet - bays.length * BAY_CARS) };
  if (!drops.length) return { ...base, ran: false, served: 0, longestWait: null, averageWait: null, furthestWalk: null, queue: 0, perHour: 0, end: 0, log: [], cars: [] };
  // a car passes every marked crossing between its start and its end (the ends themselves do not count)
  const drive = (a, b) => { const lo = Math.min(a, b), hi = Math.max(a, b); let c = 0; for (let s = lo + 1; s < hi; s++) if (marked[s]) c++; return (hi - lo) * DRIVE_S + c * CROSS_S; };
  const r = rng(seed);
  const asks = Array.from({ length: n }, (_, i) => ({ i, home: HOMES[i % HOMES.length], ask: Math.floor(r() * WINDOW) })).sort((a, b) => a.ask - b.ask || a.i - b.i);
  const cars = Array.from({ length: fleet }, (_, i) => ({ i, bay: i < bays.length * BAY_CARS ? bays[Math.floor(i / BAY_CARS)] : null, freeAt: 0 }));
  const free = new Map(drops.map((d) => [d, 0])); const log = []; let queue = 0;
  for (const a of asks) {
    const walk = walkOf(a.home); const drop = drops.filter((d) => Math.abs(d - a.home) === walk)[0];
    const ready = a.ask + walk * WALK_S;
    let best = null;
    for (const c of cars) {
      const start = Math.max(c.freeAt, a.ask); const go = c.bay === null ? DEPOT_S + drive(EXIT, drop) : drive(c.bay, drop);
      if (!best || start + go < best.arrive) best = { c, start, go, arrive: start + go };
    }
    const here = log.filter((t) => t.drop === drop);
    const ahead = here.filter((t) => t.leave > best.arrive).length;           // cars still at this point when this one gets there
    const waiting = here.filter((t) => t.board > best.arrive).length + (free.get(drop) > best.arrive ? 1 : 0); // cars in the queue, this one included
    queue = Math.max(queue, waiting);
    const board = Math.max(best.arrive, free.get(drop), ready); const leave = board + BOARD_S; free.set(drop, leave);
    const out = leave + drive(drop, EXIT); const back = out + AWAY_S + (best.c.bay === null ? 0 : drive(EXIT, best.c.bay));
    best.c.freeAt = back;
    log.push({ home: a.home, drop, ask: a.ask, ready, car: best.c.i, from: best.c.bay, set: best.arrive - (best.c.bay === null ? drive(EXIT, drop) : best.go), arrive: best.arrive, ahead, board, leave, out, back, wait: board - ready });
  }
  const waits = log.map((t) => t.wait);
  return {
    ...base, ran: true, served: log.length,
    longestWait: Math.max(...waits), averageWait: Math.round(waits.reduce((s, w) => s + w, 0) / waits.length),
    furthestWalk: Math.max(...HOMES.map(walkOf)) * SLOT_M, queue,
    perHour: log.filter((t) => t.leave <= 3600).length,
    end: Math.max(...log.map((t) => t.out)), log, cars: cars.map((c) => ({ i: c.i, bay: c.bay })),
  };
}

// how each number reads: 'good', 'fair' or 'poor' (always shown as a word as well as a colour)
export function grade(res) {
  if (!res.ran) return { wait: 'poor', walk: 'poor', queue: 'poor', safe: res.safe === res.lines ? 'good' : res.safe ? 'fair' : 'poor' };
  return {
    wait: res.longestWait <= 180 ? 'good' : res.longestWait <= 360 ? 'fair' : 'poor',
    walk: res.furthestWalk <= 50 ? 'good' : res.furthestWalk <= 100 ? 'fair' : 'poor',
    queue: res.queue <= 2 ? 'good' : res.queue <= 4 ? 'fair' : 'poor',
    safe: res.safe === res.lines ? 'good' : res.safe ? 'fair' : 'poor',
  };
}
// the one thing most worth changing next, or 'none'
export function nextStep(res) {
  const g = grade(res);
  if (!res.ran) return 'drop';
  if (g.safe !== 'good') return 'safe';
  for (const level of ['poor', 'fair']) { if (g.walk === level) return 'walk'; if (g.queue === level) return 'queue'; if (g.wait === level) return res.carsOutside > 0 ? 'bay' : 'wait'; }
  return 'none';
}

// The freed land. The car park had 40 spaces on four plots. One plot stays, to charge the shared cars at night.
// The child chooses what each of the other three becomes. Each choice has a real number; none is the right one.
export const USES = {
  homes:   { families: 4 },            // a short terrace of four homes
  park:    { play: PLOT_M2 },          // square metres of play space
  garden:  { feeds: 3 },               // families' vegetables for a year from a 250 m² market garden
  parking: { spaces: PLOT_SPACES },    // spaces kept, for visitors and carers
};
export const USE_IDS = Object.keys(USES);
export const cleanPlots = (v) => Array.from({ length: FREE_PLOTS }, (_, i) => (Array.isArray(v) && USE_IDS.includes(v[i]) ? v[i] : null));
export function land(plots) {
  const p = cleanPlots(plots); const n = (id) => p.filter((x) => x === id).length;
  return {
    plots: p, chosen: p.filter(Boolean).length, done: p.every(Boolean),
    homes: n('homes'), park: n('park'), garden: n('garden'), parking: n('parking'),
    families: n('homes') * USES.homes.families, play: n('park') * USES.park.play, feeds: n('garden') * USES.garden.feeds,
    spaces: PLOT_SPACES + n('parking') * USES.parking.spaces,         // the shared cars' plot plus any parking kept
    freed: (FREE_PLOTS - n('parking')) * PLOT_M2,                      // square metres no longer used for parked cars
    notChosen: USE_IDS.filter((id) => !p.includes(id)),
  };
}

// the street as it was: cars parked along both kerbs and a full car park; only the school had a crossing
export const BEFORE = { spaces: CARPARK_SPACES, safe: 1, lines: LINES.length, layout: (() => { const l = emptyLayout(); l[8] = 'walk'; return l; })() };

export const minutes = (s) => Math.max(0, Math.round(s / 60));

// Where the model of the street stands in the child's town: an empty, unmarked dry tile beside one of their roads or
// car parks if there is one, else an empty dry tile at the island's edge. cells: [[key, cell]], tiles: the island's tiles.
// Returns a tile key or null (then nothing is drawn).
export function townSpot(cells, tiles) {
  const all = tiles instanceof Map ? [...tiles.values()] : Array.isArray(tiles) ? tiles : [];
  const cell = new Map(Array.isArray(cells) ? cells : []);
  const open = all.filter((t) => t && !t.fixed && !t.hedge && ['coast', 'field', 'slope'].includes(t.zone) && !cell.get(t.k)?.item && !cell.get(t.k)?.mark);
  if (!open.length) return null;
  const roads = all.filter((t) => ['road', 'carpark'].includes(cell.get(t.k)?.item));
  const by = (f) => open.slice().sort((a, b) => f(a) - f(b) || a.gx - b.gx || a.gz - b.gz)[0];
  if (roads.length) {
    const near = (t) => Math.min(...roads.map((r) => Math.abs(r.gx - t.gx) + Math.abs(r.gz - t.gz)));
    const best = by(near); if (near(best) <= 2) return best.k;
  }
  const cx = all.reduce((s, t) => s + t.gx, 0) / all.length, cz = all.reduce((s, t) => s + t.gz, 0) / all.length;
  return by((t) => -(Math.abs(t.gx - cx) + Math.abs(t.gz - cz))).k;
}
