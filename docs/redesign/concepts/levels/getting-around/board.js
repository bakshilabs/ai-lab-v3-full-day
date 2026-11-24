// The ground between the homes and the shops, as a board of seven squares by seven. This file is only the rules of the board:
// which squares can take a path, how the three kinds of path piece fit together, which homes are joined to the shops, and how
// long each family's walk is. It draws nothing and needs no other file, so it can be checked with Node (see check-board.mjs).
//
// A square is (c, r). c runs from 0 at the left of the picture to 6 at the right, and r from 0 beside the shops to 6 at the far homes.
// A side is a number: 0 is away from the shops, 1 is to the right, 2 is towards the shops and 3 is to the left.
export const N = 7, DC = [0, 1, 0, -1], DR = [1, 0, -1, 0], OPP = [2, 3, 0, 1];
export const key = (c, r) => c + r * N, cOf = (k) => k % N, rOf = (k) => Math.floor(k / N);
// where the middle of a square is in the world. The left of the picture is +x, because the camera looks along +z
export const CELL = 5, cx = (c) => 15 - c * CELL, cz = (r) => 13.5 + r * CELL;

// The way to the shops, and the gate of each of the ten homes. Gran lives in one of the two far homes.
export const SHOP = { c: 3, r: 0, side: 2 };
export const GATES = [
  { id: 'L1', c: 0, r: 0, side: 3 }, { id: 'L2', c: 0, r: 2, side: 3 }, { id: 'L3', c: 0, r: 4, side: 3 }, { id: 'L4', c: 0, r: 6, side: 3 },
  { id: 'R1', c: 6, r: 0, side: 1 }, { id: 'R2', c: 6, r: 2, side: 1 }, { id: 'R3', c: 6, r: 4, side: 1 }, { id: 'R4', c: 6, r: 6, side: 1 },
  { id: 'F1', c: 1, r: 6, side: 0 }, { id: 'F2', c: 5, r: 6, side: 0, gran: true }];
// the ten old trees in the middle, the five of them that are lost when the park is put somewhere else, and the stream
export const TREES = [[3, 1], [1, 1], [5, 1], [1, 2], [3, 2], [5, 2], [1, 5], [2, 5], [4, 5], [5, 5]].map(([c, r]) => key(c, r));
export const OAK = key(3, 1), UNPROTECTED = [[1, 1], [5, 1], [1, 5], [5, 5], [3, 2]].map(([c, r]) => key(c, r)), STREAM_R = 3;
const onStreet = (c, r) => c % 2 === 1 || r % 2 === 0, onRing = (c, r) => c === 0 || c === N - 1 || r === 0 || r === N - 1;

// Which old trees each plan keeps. plan: 0 is the grid of streets, 1 the winding loop, 2 the paths through a park. parkMid is true when the child asked for the park in the middle.
// The grid needs the room for its streets, so it keeps only the trees that stand between them, wherever the park is.
// The footpaths of the third plan bend round every old tree, so that plan keeps them all wherever the child put the park: one plan is always good on every check.
export function keptTrees(plan, parkMid) {
  if (plan === 0) return TREES.filter((k) => !onStreet(cOf(k), rOf(k)));
  return parkMid || plan === 2 ? [...TREES] : TREES.filter((k) => !UNPROTECTED.includes(k));
}
// What each square of the board is for a plan: 'free' takes a path piece, 'bridge' takes the bridge (or a straight piece where the grid already has road bridges),
// 'stream' and 'tree' and 'off' take nothing
export function ground(plan, parkMid) {
  const kept = new Set(keptTrees(plan, parkMid)), g = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    let t = 'free';
    if (plan === 0) t = !onStreet(c, r) ? 'off' : r === STREAM_R ? 'road-bridge' : 'free';
    else if (plan === 1) t = !onRing(c, r) ? 'off' : r === STREAM_R ? 'bridge' : 'free';
    else t = r === STREAM_R ? (c === 2 || c === 4 ? 'bridge' : 'stream') : kept.has(key(c, r)) ? 'tree' : 'free';
    g[key(c, r)] = t;
  }
  return g;
}

// ---- the path pieces -------------------------------------------------------------------------------------------------------
// A piece is { kind, sides }: sides is a list of four true or false values, one for each side that the path leaves the square by.
const rot = (s, n) => s.map((_, i) => s[(i - n + 4) % 4]);
export const SHAPES = {
  straight: [[true, false, true, false], [false, true, false, true]],
  bend: [0, 1, 2, 3].map((n) => rot([true, true, false, false], n)),
  fork: [0, 1, 2, 3].map((n) => rot([true, true, false, true], n)),
  cross: [[true, true, true, true]],
  bridge: [[true, false, true, false]] };
export const kindOf = (sides) => { const n = sides.filter(Boolean).length; return n === 4 ? 'cross' : n === 3 ? 'fork' : n === 2 && sides[0] === sides[2] ? 'straight' : n === 2 ? 'bend' : 'end'; };
const same = (a, b) => a.every((v, i) => v === b[i]);

// A board in play: the ground, and the piece on each square (or nothing)
export function newBoard(plan, parkMid) { return { plan, ground: ground(plan, parkMid), cells: [] }; }
const gateAt = (c, r, side) => (c === SHOP.c && r === SHOP.r && side === SHOP.side) || GATES.some((g) => g.c === c && g.r === r && g.side === side);
const takes = (b, k, kind) => { const t = b.ground[k]; return kind === 'bridge' ? t === 'bridge' : kind === 'straight' ? t === 'free' || t === 'road-bridge' : t === 'free'; };
// Does a piece with these sides fit on square (c, r)? Every side the path leaves by must lead somewhere: to a gate, to an empty square that can take a piece, or to a piece
// whose path comes to meet it. A neighbour's path must never run into the side of this piece. And the piece must join the shops' gate or a piece that is already there.
export function fits(b, c, r, kind, sides) {
  if (!takes(b, key(c, r), kind)) return false;
  let joined = false;
  for (let s = 0; s < 4; s++) {
    const c2 = c + DC[s], r2 = r + DR[s], inside = c2 >= 0 && c2 < N && r2 >= 0 && r2 < N, other = inside ? b.cells[key(c2, r2)] : null;
    if (sides[s]) {
      if (gateAt(c, r, s)) { if (c === SHOP.c && r === SHOP.r && s === SHOP.side) joined = true; continue; }
      if (!inside) return false;
      if (other) { if (!other.sides[OPP[s]]) return false; joined = true; continue; }
      const t = b.ground[key(c2, r2)];
      if (t === 'off' || t === 'tree' || t === 'stream') return false;
      if ((t === 'bridge' || t === 'road-bridge') && s % 2 === 1) return false;       // a bridge is only crossed along the path, never from the side
    } else if (other && other.sides[OPP[s]]) return false;
  }
  return joined;
}
// every way a piece of this kind fits on a square, best first. The best way joins the most paths and gates, and then points its open ends towards homes that are not joined yet
export function ways(b, c, r, kind) {
  const here = b.cells[key(c, r)]; b.cells[key(c, r)] = null;
  const ok = SHAPES[kind].filter((s) => fits(b, c, r, kind, s)), want = distToUnjoined(b);
  const score = (sides) => { let n = 0; for (let s = 0; s < 4; s++) if (sides[s]) { const c2 = c + DC[s], r2 = r + DR[s]; if (gateAt(c, r, s)) n += 6; else if (b.cells[key(c2, r2)]) n += 10; else n += 1 / (1 + (want[key(c2, r2)] ?? 99)); } return n; };
  b.cells[key(c, r)] = here;
  return ok.map((s) => [score(s), s]).sort((p, q) => q[0] - p[0]).map((p) => p[1]);
}
// Where can a piece of this kind go now? It gives the empty squares it fits on, and the squares whose piece could be swapped for it
export function places(b, kind) {
  const out = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const p = b.cells[key(c, r)]; if (p && p.kind === kind) continue; if (ways(b, c, r, kind).length) out.push(key(c, r)); }
  return out;
}
// Lays a piece, or swaps the piece that is there for one of another kind. It gives back the kind that came off the square, if any
export function lay(b, c, r, kind) { const w = ways(b, c, r, kind); if (!w.length) return false; const old = b.cells[key(c, r)]; b.cells[key(c, r)] = { kind, sides: w[0] }; return old ? old.kind : true; }
// takes the piece off a square and gives back its kind
export function lift(b, c, r) { const p = b.cells[key(c, r)]; if (!p) return false; b.cells[key(c, r)] = null; return p.kind; }
// Turns the piece on a square to the next way it fits. It gives back false if it fits only one way
export function turn(b, c, r) {
  const p = b.cells[key(c, r)]; if (!p) return false; const w = ways(b, c, r, p.kind); if (w.length < 2) return false;
  const i = w.findIndex((s) => same(s, p.sides)); p.sides = w[(i + 1) % w.length]; return true;
}

// ---- who is joined, and how far they walk --------------------------------------------------------------------------------------
// Walks out from the shops' gate along the pieces. It gives, for every square that is reached, the number of squares walked and the square before it
export function reach(b) {
  const steps = [], from = [], first = b.cells[key(SHOP.c, SHOP.r)];
  if (!first || !first.sides[SHOP.side]) return { steps, from };
  const q = [key(SHOP.c, SHOP.r)]; steps[q[0]] = 0;
  while (q.length) { const k = q.shift(), c = cOf(k), r = rOf(k), p = b.cells[k];
    for (let s = 0; s < 4; s++) { if (!p.sides[s]) continue; const c2 = c + DC[s], r2 = r + DR[s]; if (c2 < 0 || c2 >= N || r2 < 0 || r2 >= N) continue; const k2 = key(c2, r2), o = b.cells[k2]; if (!o || !o.sides[OPP[s]] || steps[k2] !== undefined) continue; steps[k2] = steps[k] + 1; from[k2] = k; q.push(k2); } }
  return { steps, from };
}
// For each home: is it joined, how many squares is the walk, and which squares does it pass (from the home to the shops)
export function homes(b) {
  const { steps, from } = reach(b);
  return GATES.map((g) => { const k = key(g.c, g.r), p = b.cells[k], joined = !!p && p.sides[g.side] && steps[k] !== undefined, way = []; if (joined) for (let q = k; q !== undefined; q = from[q]) way.push(q); return { ...g, joined, steps: joined ? steps[k] : null, way }; });
}
// how far each empty square is from the nearest home that is not joined yet, counted over squares that can take a piece
function distToUnjoined(b) {
  const d = [], q = []; for (const h of homes(b)) if (!h.joined) { const k = key(h.c, h.r); if (d[k] === undefined) { d[k] = 0; q.push(k); } }
  while (q.length) { const k = q.shift(), c = cOf(k), r = rOf(k); for (let s = 0; s < 4; s++) { const c2 = c + DC[s], r2 = r + DR[s]; if (c2 < 0 || c2 >= N || r2 < 0 || r2 >= N) continue; const k2 = key(c2, r2), t = b.ground[k2]; if (d[k2] !== undefined || t === 'off' || t === 'tree' || t === 'stream') continue; d[k2] = d[k] + 1; q.push(k2); } }
  return d;
}

// ---- Florence's own drawing of each plan ------------------------------------------------------------------------------------------
// Florence's paths for a plan, as a board that is already laid. The grid has a pavement along every street. The loop is one long street around the park, which crosses
// the stream once. The park plan has the shortest paths from the shops to every gate, bent around the trees, over one bridge. bridgeAt picks the bridge (the column it is in).
export function florence(plan, parkMid, bridgeAt = null) {
  const b = newBoard(plan, parkMid), open = (k) => { const t = b.ground[k]; return t === 'free' || t === 'road-bridge' || (t === 'bridge' && cOf(k) === (bridgeAt ?? (plan === 1 ? 0 : 2))); };
  const link = new Map(), join = (k, s) => { if (!link.has(k)) link.set(k, [false, false, false, false]); link.get(k)[s] = true; };
  const step = (k, s) => { const c = cOf(k) + DC[s], r = rOf(k) + DR[s]; if (c < 0 || c >= N || r < 0 || r >= N) return null; const k2 = key(c, r); if (!open(k2)) return null; if (b.ground[k2] !== 'free' && s % 2 === 1) return null; if (b.ground[k] !== 'free' && s % 2 === 1) return null; return k2; };
  if (plan === 2) {   // the shortest paths, which share their first stretches
    const d = [], from = [], q = [key(SHOP.c, SHOP.r)]; d[q[0]] = 0;
    while (q.length) { const k = q.shift(); for (const s of [0, 3, 1, 2]) { const k2 = step(k, s); if (k2 === null || d[k2] !== undefined) continue; d[k2] = d[k] + 1; from[k2] = [k, s]; q.push(k2); } }
    for (const g of GATES) for (let k = key(g.c, g.r); from[k]; k = from[k][0]) { join(from[k][0], from[k][1]); join(k, OPP[from[k][1]]); }
  } else for (let k = 0; k < N * N; k++) { if (!open(k)) continue; for (let s = 0; s < 4; s++) { const k2 = step(k, s); if (k2 !== null) { join(k, s); join(k2, OPP[s]); } } }
  join(key(SHOP.c, SHOP.r), SHOP.side); for (const g of GATES) join(key(g.c, g.r), g.side);
  for (const [k, sides] of link) b.cells[k] = { kind: b.ground[k] === 'bridge' ? 'bridge' : kindOf(sides), sides };
  return b;
}
// How many squares a family will walk before they take the car instead. It depends on the paths the child asked for:
// 0 long and winding (every square is a longer walk), 1 short and direct, 2 beside the busy road (people like the walk less)
// The footpaths of the third plan cross the middle away from the cars, so the walk is pleasant whichever kind of path the child asked for.
export const LIMIT = [7, 13, 8], limitOf = (plan, style) => (plan === 2 ? 13 : LIMIT[style]);
export const walkers = (b, style) => homes(b).map((h) => h.joined && h.steps <= limitOf(b.plan, style));
// the pieces the child is given for a plan: what Florence's own drawing needs, and a few more, but fewer than there are squares
export function stock(plan, parkMid) {
  if (plan === 0) return { straight: 16, bend: 8, fork: 10, bridge: 0 };
  const n = { straight: 0, bend: 0, fork: 0, cross: 0, bridge: 0, end: 0 }; for (const p of florence(plan, parkMid).cells) if (p) n[p.kind]++;
  return { straight: n.straight + 3, bend: n.bend + 3, fork: n.fork + n.cross * 2 + 2, bridge: 1 };
}
