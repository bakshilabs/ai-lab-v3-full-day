// The ground between the homes and the shops, as a board of seven squares by seven. This file is only the rules of the board:
// which squares can take a path, how the paths that the child draws join up, which homes are joined to the shops, and how
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
// The ten old trees: a grove round the old oak on the near side of the stream, and a grove on the far side. No path can cross the middle, so every way to the far homes
// bends round the trees and crosses the stream by the one bridge. The five trees that are lost when the park is put somewhere else are listed too.
export const TREES = [[3, 1], [3, 2], [2, 2], [4, 2], [2, 5], [3, 5], [4, 5], [2, 6], [3, 6], [4, 6]].map(([c, r]) => key(c, r));
export const OAK = key(3, 1), UNPROTECTED = [[2, 2], [4, 2], [3, 5], [2, 6], [4, 6]].map(([c, r]) => key(c, r)), STREAM_R = 3;
// the two places where the one footbridge of the park plan can go: on the left, or on the right, which is Gran's side
export const BRIDGES = [1, 5];
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
    else t = r === STREAM_R ? (BRIDGES.includes(c) ? 'bridge' : 'stream') : kept.has(key(c, r)) ? 'tree' : 'free';
    g[key(c, r)] = t;
  }
  return g;
}

// ---- drawing the paths ------------------------------------------------------------------------------------------------------
// A paved square is { kind, sides }: kind is 'path' or 'bridge', and sides is a list of four true or false values, one for each side that the path leaves the square by.
// The child draws: each new square is joined to the square the child came from, so the paths take their own shape and nothing has to be turned.
export const kindOf = (sides) => { const n = sides.filter(Boolean).length; return n === 4 ? 'cross' : n === 3 ? 'fork' : n === 2 && sides[0] === sides[2] ? 'straight' : n === 2 ? 'bend' : 'end'; };
const SHOPK = key(SHOP.c, SHOP.r), inside = (c, r) => c >= 0 && c < N && r >= 0 && r < N, next = (k, s) => { const c = cOf(k) + DC[s], r = rOf(k) + DR[s]; return inside(c, r) ? key(c, r) : -1; };
const bridgey = (t) => t === 'bridge' || t === 'road-bridge';
// may a path run from square k out of side s into the next square? A bridge is only crossed along the path, never from the side
const runs = (b, k, s) => { const k2 = next(k, s); return k2 >= 0 && !(s % 2 && (bridgey(b.ground[k]) || bridgey(b.ground[k2]))); };
// A board in play: the ground, the paved squares, and the young trees that the child planted (on the grid board only)
export function newBoard(plan, parkMid) { return { plan, ground: ground(plan, parkMid), cells: [], young: [] }; }
// can this empty square take paving?
export const paves = (b, k) => k >= 0 && !b.cells[k] && (b.ground[k] === 'free' || b.ground[k] === 'road-bridge');
// the sides of square k on which a paved square lies that a path may run to
const paved = (b, k) => [0, 1, 2, 3].filter((s) => runs(b, k, s) && b.cells[next(k, s)]);
// the empty squares where the path can grow now: the square beside the shops, and every square beside a paved one
export function frontier(b) { const out = []; for (let k = 0; k < N * N; k++) if (paves(b, k) && (k === SHOPK || paved(b, k).length)) out.push(k); return out; }
// joins two paved squares that lie side by side. It gives back true if they were not joined before
export function link(b, k, k2) { const s = [0, 1, 2, 3].find((q) => next(k, q) === k2); if (s === undefined || !b.cells[k] || !b.cells[k2] || !runs(b, k, s) || b.cells[k].sides[s]) return false; b.cells[k].sides[s] = true; b.cells[k2].sides[OPP[s]] = true; return true; }
// Paves square k and joins it to the square the child came from. Without one, it is joined to the paved neighbour that is nearest to the shops.
// A gate on the square is joined by itself, and so is a bridge that lies straight ahead or behind
export function pave(b, k, from = -1) {
  if (!paves(b, k)) return false; const near = paved(b, k); if (k !== SHOPK && !near.length) return false;
  const { steps } = reach(b), best = [...near].sort((p, q) => (steps[next(k, p)] ?? 99) - (steps[next(k, q)] ?? 99))[0], s0 = near.find((s) => next(k, s) === from) ?? best;
  b.cells[k] = { kind: 'path', sides: [false, false, false, false] }; if (s0 !== undefined) link(b, k, next(k, s0));
  for (const s of near) if (b.cells[next(k, s)].kind === 'bridge') link(b, k, next(k, s));
  if (k === SHOPK) b.cells[k].sides[SHOP.side] = true; for (const g of GATES) if (key(g.c, g.r) === k) b.cells[k].sides[g.side] = true;
  return true;
}
// takes the paving, or the bridge, off a square and gives back its kind
export function unpave(b, k) { const p = b.cells[k]; if (!p) return false; for (let s = 0; s < 4; s++) { const o = b.cells[next(k, s)]; if (o) o.sides[OPP[s]] = false; } b.cells[k] = null; return p.kind; }
// the column the bridge is in, or -1; the places it could go; and laying it (which moves it, because there is only one)
export const bridgeAt = (b) => { const k = b.cells.findIndex((p) => p && p.kind === 'bridge'); return k < 0 ? -1 : cOf(k); };
export const bridgePlaces = (b) => b.ground.map((t, k) => (t === 'bridge' && !b.cells[k] ? k : -1)).filter((k) => k >= 0);
export function setBridge(b, k) { if (b.ground[k] !== 'bridge' || b.cells[k]) return false; const old = bridgeAt(b); if (old >= 0) unpave(b, key(old, STREAM_R));
  b.cells[k] = { kind: 'bridge', sides: [false, false, false, false] }; for (const s of [0, 2]) link(b, k, next(k, s)); return true; }
// where a young tree can be planted on the grid board: the blocks between the streets that have no old tree
export const youngPlaces = (b) => (b.plan !== 0 ? [] : b.ground.map((t, k) => (t === 'off' && rOf(k) !== STREAM_R && !TREES.includes(k) && !b.young.includes(k) ? k : -1)).filter((k) => k >= 0));

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
  return GATES.map((g) => { const k = key(g.c, g.r), p = b.cells[k], joined = !!p && steps[k] !== undefined, way = []; if (joined) for (let q = k; q !== undefined; q = from[q]) way.push(q); return { ...g, joined, steps: joined ? steps[k] : null, way }; });
}
// ---- Florence's own drawing of each plan ------------------------------------------------------------------------------------------
// Florence's paths for a plan, as a board that is already laid. The grid has a pavement along every street. The loop is one long street around the park, which crosses
// the stream once. The park plan has the shortest paths from the shops to every gate, bent around the trees, over one bridge. bridgeCol picks the bridge (the column it is in). Florence puts it on Gran's side in the park plan.
export function florence(plan, parkMid, bridgeCol = null) {
  const b = newBoard(plan, parkMid), open = (k) => { const t = b.ground[k]; return t === 'free' || t === 'road-bridge' || (t === 'bridge' && cOf(k) === (bridgeCol ?? (plan === 1 ? 0 : 5))); };
  const link = new Map(), join = (k, s) => { if (!link.has(k)) link.set(k, [false, false, false, false]); link.get(k)[s] = true; };
  const step = (k, s) => { const c = cOf(k) + DC[s], r = rOf(k) + DR[s]; if (c < 0 || c >= N || r < 0 || r >= N) return null; const k2 = key(c, r); if (!open(k2)) return null; if (b.ground[k2] !== 'free' && s % 2 === 1) return null; if (b.ground[k] !== 'free' && s % 2 === 1) return null; return k2; };
  if (plan === 2) {   // the shortest paths, which share their first stretches
    const d = [], from = [], q = [key(SHOP.c, SHOP.r)]; d[q[0]] = 0;
    while (q.length) { const k = q.shift(); for (const s of [3, 1, 0, 2]) { const k2 = step(k, s); if (k2 === null || d[k2] !== undefined) continue; d[k2] = d[k] + 1; from[k2] = [k, s]; q.push(k2); } }
    for (const g of GATES) for (let k = key(g.c, g.r); from[k]; k = from[k][0]) { join(from[k][0], from[k][1]); join(k, OPP[from[k][1]]); }
  } else for (let k = 0; k < N * N; k++) { if (!open(k)) continue; for (let s = 0; s < 4; s++) { const k2 = step(k, s); if (k2 !== null) { join(k, s); join(k2, OPP[s]); } } }
  join(key(SHOP.c, SHOP.r), SHOP.side); for (const g of GATES) join(key(g.c, g.r), g.side);
  for (const [k, sides] of link) b.cells[k] = { kind: b.ground[k] === 'bridge' ? 'bridge' : kindOf(sides), sides };
  return b;
}
// How many squares a family will walk before they take the car instead. It depends on the paths the child asked for:
// 0 long and winding (every square is a longer walk), 1 short and direct, 2 beside the busy road (people like the walk less)
// The footpaths of the third plan cross the middle away from the cars, so the walk is pleasant whichever kind of path the child asked for.
export const LIMIT = [7, 13, 8], limitOf = (plan, style) => (plan === 2 ? 17 : LIMIT[style]);
export const walkers = (b, style) => homes(b).map((h) => h.joined && h.steps <= limitOf(b.plan, style));
// What the child is given for a plan. There is less paving than there are squares, so two homes often have to share one path, and there is only one bridge.
// On the grid board the streets have road bridges already, and the child has four young trees for six empty places.
export const stock = (plan) => (plan === 0 ? { pave: 33, bridge: 0, young: 4 } : plan === 1 ? { pave: 22, bridge: 1, young: 0 } : { pave: 28, bridge: 1, young: 0 });
// The shortest walk each home could ever have on this board, over any of the bridge places. Florence uses it so that she only says "a shorter way would let them walk"
// when a shorter way really exists. On the grid and the loop, with long and winding paths, the far homes cannot walk however the child draws.
export function bestSteps(plan, parkMid) {
  const cols = plan === 0 ? [null] : plan === 1 ? [0, N - 1] : BRIDGES;
  return GATES.map((g, i) => Math.min(...cols.map((c) => { const h = homes(florence(plan, parkMid, c))[i]; return h.joined ? h.steps : 99; })));
}
