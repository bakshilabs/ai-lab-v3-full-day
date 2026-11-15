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
export const EXIT = SLOTS;        // cars come and go by the east end

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
// at: the place of the marked crossing that serves it (or -1).
export function crossings(layout, junior = false) {
  return LINES.map((l) => {
    const fits = (k) => (junior ? k === 'walk' || k === 'cycle' : k === l.who);
    const at = [l.slot, l.slot - 1, l.slot + 1].find((s) => s >= 0 && s < SLOTS && fits(layout[s]));
    return { ...l, safe: at !== undefined, at: at === undefined ? -1 : at };
  });
}

// how many families ask for a car in the morning: the child's own town, with a floor so an empty town still has a street to plan
export const tripsFor = (families) => Math.max(24, Math.min(36, Math.round(Number(families) || 0)));
export const fleetFor = (trips) => Math.ceil(trips / 3);
// Ages 13–17 choose how many shared cars the town runs: fewer cars each do more trips, but people may wait longer.
export const fleetRange = (trips) => ({ min: Math.ceil(trips / 4.5), def: fleetFor(trips), max: Math.ceil(trips / 2) });
export function cleanFleet(v, trips) { const r = fleetRange(trips); const n = Math.round(Number(v)); return v === null || v === undefined || !Number.isFinite(n) ? r.def : Math.max(r.min, Math.min(r.max, n)); }
export const tripsPerCar = (res) => Math.round((res.trips / res.fleet) * 10) / 10;

export function rng(seed) { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// A car's drive from place a to place b: it moves one place in DRIVE_S and waits CROSS_S at the stop line of every
// marked crossing strictly between the two. Returns the time it takes, the waits, and where the car is after t seconds.
export function route(a, b, layout) {
  const dir = Math.sign(b - a) || 1; const stops = [];
  for (let s = a + dir; (b - s) * dir > 0; s += dir) if (layout[s] === 'walk' || layout[s] === 'cycle') stops.push(s);
  const pauses = []; let t = 0, at = a;
  for (const s of stops) { const line = s - dir * 0.6; t += Math.abs(line - at) * DRIVE_S; pauses.push({ slot: s, pos: line, from: t, to: t + CROSS_S }); t += CROSS_S; at = line; }
  const dur = t + Math.abs(b - at) * DRIVE_S;
  const pos = (time) => {
    let from = a, t0 = 0;
    for (const p of pauses) { if (time < p.from) return from + (p.pos - from) * (Math.max(0, time - t0) / Math.max(1e-9, p.from - t0)); if (time < p.to) return p.pos; from = p.pos; t0 = p.to; }
    return time >= dur ? b : from + (b - from) * (Math.max(0, time - t0) / Math.max(1e-9, dur - t0));
  };
  return { dur, pauses, pos };
}

// Run the morning. Every family asks for one shared car at a set time (the same times for the same seed). A person
// walks to the nearest drop-off point; the nearest free car drives there; one car loads at a point at a time.
// Returns the numbers, where each of them happened, and a list of trips with their times, for the picture of the morning.
// extraFamilies: families in new homes on the freed land. fleet: the number of cars chosen by ages 13–17.
export function simulate(layout, { families = 0, extraFamilies = 0, seed = 7, junior = false, fleet: chosen = null } = {}) {
  const extra = Math.max(0, extraFamilies | 0); const n = tripsFor(families) + extra; const fleet = junior || chosen === null || chosen === undefined ? fleetFor(n) : cleanFleet(chosen, n);
  const drops = slotsOf(layout, 'drop'); const bays = slotsOf(layout, 'bay'); const marked = layout.map((k) => k === 'walk' || k === 'cycle');
  const cross = crossings(layout, junior); const safe = cross.filter((c) => c.safe).length;
  const walkOf = (home) => Math.min(...drops.map((d) => Math.abs(d - home)));
  const base = { trips: n, extra, fleet, drops: drops.length, bays: bays.length, crossings: cross, safe, lines: LINES.length, carsInBays: Math.min(fleet, bays.length * BAY_CARS), carsOutside: Math.max(0, fleet - bays.length * BAY_CARS) };
  if (!drops.length) return { ...base, ran: false, served: 0, longestWait: null, averageWait: null, furthestWalk: null, queue: 0, perHour: 0, end: 0, log: [], cars: [], where: { walk: null, queue: null, wait: null } };
  // a car passes every marked crossing between its start and its end (the ends themselves do not count)
  const drive = (a, b) => { const lo = Math.min(a, b), hi = Math.max(a, b); let c = 0; for (let s = lo + 1; s < hi; s++) if (marked[s]) c++; return (hi - lo) * DRIVE_S + c * CROSS_S; };
  const r = rng(seed);
  const asks = Array.from({ length: n }, (_, i) => ({ i, home: HOMES[i % HOMES.length], ask: Math.floor(r() * WINDOW) })).sort((a, b) => a.ask - b.ask || a.i - b.i);
  const cars = Array.from({ length: fleet }, (_, i) => ({ i, bay: i < bays.length * BAY_CARS ? bays[Math.floor(i / BAY_CARS)] : null, freeAt: 0 }));
  const free = new Map(drops.map((d) => [d, 0])); const log = []; let queue = 0, queueAt = null;
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
    if (waiting > queue) { queue = waiting; queueAt = { drop, t: best.arrive }; }
    const board = Math.max(best.arrive, free.get(drop), ready); const leave = board + BOARD_S; free.set(drop, leave);
    const out = leave + drive(drop, EXIT); const back = out + AWAY_S + (best.c.bay === null ? 0 : drive(EXIT, best.c.bay));
    best.c.freeAt = back;
    log.push({ home: a.home, drop, ask: a.ask, ready, car: best.c.i, from: best.c.bay, set: best.arrive - (best.c.bay === null ? drive(EXIT, drop) : best.go), arrive: best.arrive, ahead, board, leave, out, back, wait: board - ready });
  }
  const waits = log.map((t) => t.wait); const worst = log.reduce((m, t) => (t.wait > m.wait ? t : m), log[0]);
  const far = HOMES.reduce((m, h) => (walkOf(h) > walkOf(m) ? h : m), HOMES[0]);
  return {
    ...base, ran: true, served: log.length,
    longestWait: Math.max(...waits), averageWait: Math.round(waits.reduce((s, w) => s + w, 0) / waits.length),
    furthestWalk: Math.max(...HOMES.map(walkOf)) * SLOT_M, queue,
    perHour: log.filter((t) => t.leave <= 3600).length,
    end: Math.max(...log.map((t) => t.out)), log, cars: cars.map((c) => ({ i: c.i, bay: c.bay })),
    // where each number comes from, so the picture of the street can point at it
    where: { walk: { home: far, drop: drops.filter((d) => Math.abs(d - far) === walkOf(far))[0] }, queue: queueAt, wait: { home: worst.home, drop: worst.drop, ready: worst.ready, board: worst.board } },
  };
}

export const minutes = (s) => Math.max(0, Math.round(s / 60));
// the clock on the wall, s seconds after half past seven
export const clock = (s) => { const m = 30 + Math.floor(Math.max(0, s) / 60); return `${7 + Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; };

// how each number reads: 'good', 'fair' or 'poor' (always shown as a word as well as a colour).
// Ages 8–12 are shown whole minutes, so they are graded on whole minutes. Ages 13–17 choose the number of cars, so
// they are also graded on how well the cars are used (trips for each car).
export function grade(res, junior = false) {
  const safe = res.safe === res.lines ? 'good' : res.safe ? 'fair' : 'poor';
  const use = junior ? {} : { use: tripsPerCar(res) >= 3.4 ? 'good' : tripsPerCar(res) >= 2.5 ? 'fair' : 'poor' };
  if (!res.ran) return { wait: 'poor', walk: 'poor', queue: 'poor', safe, ...use };
  const w = junior ? minutes(res.longestWait) * 60 : res.longestWait;
  return {
    wait: w <= 180 ? 'good' : w <= 360 ? 'fair' : 'poor',
    walk: res.furthestWalk <= 50 ? 'good' : res.furthestWalk <= 100 ? 'fair' : 'poor',
    queue: res.queue <= 2 ? 'good' : res.queue <= 4 ? 'fair' : 'poor',
    safe, ...use,
  };
}
// how many of the numbers read "Good", and out of how many
export function goods(res, junior = false) { const g = Object.values(grade(res, junior)); return { good: g.filter((x) => x === 'good').length, of: g.length }; }
// the one thing most worth changing next, or 'none'
export function nextStep(res, junior = false) {
  const g = grade(res, junior);
  if (!res.ran) return 'drop';
  if (g.safe !== 'good') return 'safe';
  for (const level of ['poor', 'fair']) { if (g.walk === level) return 'walk'; if (g.queue === level) return 'queue'; if (g.wait === level) return res.carsOutside > 0 ? 'bay' : 'wait'; }
  if (g.use && g.use !== 'good') return 'fewer';
  return 'none';
}

// How the morning is shown. It opens slowly (the first family, 20 times faster than life) so a child can watch one
// car leave, give way and pick someone up; the rest of the half hour then runs past. real: seconds on the wall.
export const SLOW_REAL = 7, FAST_REAL = 17, SLOW_RATE = 20;
export function timeline(res) {
  const first = res.log.reduce((m, t) => (t.ask < m.ask ? t : m), res.log[0]);
  const start = Math.max(0, first.ask - 4); const slowEnd = Math.min(start + SLOW_REAL * SLOW_RATE, first.out + 5); const slowReal = (slowEnd - start) / SLOW_RATE;
  const end = res.end + 15; const total = slowReal + FAST_REAL;
  return { start, end, slowEnd, slowReal, total, at: (real) => (real <= 0 ? start : real < slowReal ? start + real * SLOW_RATE : real >= total ? end : slowEnd + ((real - slowReal) / FAST_REAL) * (end - slowEnd)) };
}
// With reduced motion the morning is two or three still pictures: the first pick-up, the longest queue, the longest wait.
export function stills(res) {
  if (!res.ran) return [];
  const first = res.log.reduce((m, t) => (t.ask < m.ask ? t : m), res.log[0]); const out = [{ kind: 'first', t: first.board + 8, drop: first.drop }];
  if (res.queue >= 2 && res.where.queue) out.push({ kind: 'queue', t: res.where.queue.t + 1, drop: res.where.queue.drop });
  if (res.longestWait >= 60) out.push({ kind: 'wait', t: Math.max(res.where.wait.ready, res.where.wait.board - 3), drop: res.where.wait.drop });
  return out;
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

// the street as it was: cars parked along both kerbs, a full car park and no marked crossing anywhere
export const BEFORE = { spaces: CARPARK_SPACES, safe: 0, lines: LINES.length, layout: emptyLayout() };

// What is kept between visits (ctx.save): the layout, the land, how often the morning was run and the best result.
// Never anything typed. Older saves (v 1) are read too.
export function cleanSaved(v, junior = false) {
  if (!v || typeof v !== 'object' || ![1, 2].includes(v.v)) return null;
  const int = (x, max) => Math.max(0, Math.min(max, Math.round(Number(x)) || 0));
  const best = v.best && typeof v.best === 'object' && int(v.best.of, 9) > 0 ? { good: int(v.best.good, int(v.best.of, 9)), of: int(v.best.of, 9) } : null;
  return { stage: ['design', 'land', 'built'].includes(v.stage) ? v.stage : 'design', layout: cleanLayout(v.layout, junior), plots: cleanPlots(v.plots), runs: int(v.runs, 999), changes: int(v.changes, 9999), best, fleet: junior || !Number.isFinite(Number(v.fleet)) || v.fleet === null ? null : int(v.fleet, 99), built: v.built === true };
}

// Where the rebuilt street stands in the child's town: up to three empty, unmarked dry tiles in a row, level if
// possible, on the side of the island nearest the viewer, where it is plain to see (front: a direction in tile steps; east and south by default).
// cells: [[key, cell]], tiles: the island's tiles (a Map or a list).
// Returns { keys: [tile keys, in order along the street], axis: 'x' | 'z' }, or null (then nothing is drawn).
export function townRun(cells, tiles, front = [1, 1]) {
  const all = (tiles instanceof Map ? [...tiles.values()] : Array.isArray(tiles) ? tiles : []).filter(Boolean);
  if (!all.length) return null;
  const cell = new Map(Array.isArray(cells) ? cells : []); const at = new Map(all.map((t) => [`${t.gx},${t.gz}`, t]));
  const open = (t) => t && !t.fixed && !t.hedge && ['coast', 'field', 'slope'].includes(t.zone) && !cell.get(t.k)?.item && !cell.get(t.k)?.mark;
  const cx = all.reduce((s, t) => s + t.gx, 0) / all.length, cz = all.reduce((s, t) => s + t.gz, 0) / all.length;
  for (const len of [3, 2]) {
    const found = [];
    for (const t of all) for (const [axis, dx, dz] of [['x', 1, 0], ['z', 0, 1]]) {
      const run = Array.from({ length: len }, (_, i) => at.get(`${t.gx + dx * i},${t.gz + dz * i}`)); if (!run.every(open)) continue;
      const hs = run.map((r) => r.h || 0);
      const mid = run[(len - 1) >> 1]; const edge = -((mid.gx - cx) * front[0] + (mid.gz - cz) * front[1]);
      found.push({ keys: run.map((r) => r.k), axis, score: [Math.max(...hs) - Math.min(...hs), edge, axis === 'x' ? 0 : 1, t.gx, t.gz] });
    }
    if (found.length) { found.sort((a, b) => { for (let i = 0; i < a.score.length; i++) if (a.score[i] !== b.score[i]) return a.score[i] - b.score[i]; return 0; }); return { keys: found[0].keys, axis: found[0].axis }; }
  }
  const one = townSpot(cells, tiles); return one ? { keys: [one], axis: 'x' } : null;
}
// One empty, unmarked dry tile (used when no row of tiles is free): beside a road or car park if there is one, else
// at the island's edge. Returns a tile key or null.
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

// ---- the camera. Pure geometry, so it can be tested: how far back must a camera stand so that every point of a
// scene falls inside the free part of the screen (the part not under a panel)?
// points: [[x, y, z]], target: [x, y, z] (it lands in the middle of the free part), dir: unit vector from the target
// to the camera, fov: degrees (vertical), aspect: width ÷ height, free: { l, r, t, b } as fractions of the screen.
// Returns { d, ox, oy }: the distance, and how far the picture is shifted (fractions of the screen; down and right are +).
export function fitView(points, target, dir, fov, aspect, free) {
  const n = Math.hypot(...dir); const D = dir.map((v) => v / n); const f = D.map((v) => -v);
  let r = [-f[2], 0, f[0]]; const rn = Math.hypot(...r) || 1; r = r.map((v) => v / rn);       // right = forward × up
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]; // up = right × forward
  const th = Math.tan((fov * Math.PI) / 360); const cx = (free.l + free.r) / 2, cy = (free.t + free.b) / 2;
  const fits = (d) => points.every((p) => {
    const v = [p[0] - target[0] - D[0] * d, p[1] - target[1] - D[1] * d, p[2] - target[2] - D[2] * d];
    const z = v[0] * f[0] + v[1] * f[1] + v[2] * f[2]; if (z <= 0.1) return false;
    const sx = cx + (v[0] * r[0] + v[1] * r[1] + v[2] * r[2]) / (z * th * aspect) / 2, sy = cy - (v[0] * u[0] + v[1] * u[1] + v[2] * u[2]) / (z * th) / 2;
    return sx >= free.l && sx <= free.r && sy >= free.t && sy <= free.b;
  });
  let lo = 4, hi = 600; for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  return { d: hi, ox: cx - 0.5, oy: cy - 0.5 };
}
