// The six tests of Eco Town, played in the town itself (docs/redesign/design/motion.md, "Tests in the town, with flags").
// A plan that is only being tried is built from pale pieces that land lightly. The picture that each test leaves must
// agree with the marks in words.js: for example, in the Land level the plan with a cross looks worse than the plan with a dash.
// makeTests() returns update(S), which returns what the town itself must show (night, cut trees, lost meadow and so on).
//   S.li: the level (0 to 5), or -1 when no test is on the screen.   S.t: the film's clock in seconds.
//   S.u: seconds since the test button was pressed (below 0 before the press). It drives what all plans share: rain, sunset.
//   S.plans[i] for each plan in the order of the data: { a, f, e }
//       a: seconds since its pale pieces began to land (below 0 when they are not there)
//       f: seconds since they began to fold away (below 0 when they are not folding)
//       e: seconds since its own test began (below 0 when it is not being tested); it keeps counting, so the end picture stays
//   S.clear: seconds since the test was cleared away after the choice (the water drains, the day returns), or -1.
// Everything is worked out from these numbers, so any frame can be drawn again in any order.
import { THREE, PAL, blk, group, glow, clamp, ease, span, lerp, hash, along } from './vox.js';
import * as MAP from './map.js';
import { makeKit, pale, walker, heightAt, inside, TOP, SPOTS, FARMS, STALL, MILL, SCHOOL, BATTERY, TURBINES, CLOTHES, CARTWAY } from './town.js';
import { trialDrop, hop, hopSquash, springAt, SPRING, ring, outBack, outCubic, inOutCubic, rewind, dust as dustAt } from '../design/motion-curves.js';

// Which plan stands in which place on the screen: ORDER[level][place] is the number of the plan in the data.
// The data keeps the best plan third in four levels; mixing the places needs no change to any word.
export const ORDER = [[1, 2, 0], [2, 0, 1], [2, 1, 0], [1, 2, 0], [0, 1, 2], [1, 2, 0]];
// How each test runs. together: one press tests the three places at once. Otherwise the plans are played one after
// another, and each has `each` seconds, after `lead` seconds that all plans share. stamp is when the mark lands on a
// flag: for a test that runs together it is counted from the press, and otherwise from the start of the plan's own turn.
export const TEST = [
  { together: true, dur: 10.5, stamp: [6.4, 7.6, 8.8] },
  { together: false, lead: 0.4, each: 6.2, stamp: 5.0 },
  { together: true, dur: 10.5, stamp: [6.8, 7.8, 8.8] },
  { together: true, dur: 10.8, stamp: [6.6, 7.6, 9.7] },
  { together: false, lead: 3.6, each: 5.0, stamp: 3.9 },
  { together: false, lead: 0.4, each: 6.4, stamp: 5.2 },
];
export const testLength = (li) => (TEST[li].together ? TEST[li].dur : TEST[li].lead + 3 * TEST[li].each);
// where each plan's flag stands: [x, y, z] for each plan in the order of the data
export const FLAGS = [
  [[0.15, 2.7, 0.3], [1.75, 2.1, -7.65], [6.7, TOP + 2.3, 0.5]],
  [[12.6, TOP + 0.4, 0.5], [12.6, TOP + 0.4, 4.3], [12.6, TOP + 0.4, -3.3]],
  [[MILL[0], 2.3, MILL[1]], [0.8, 3.4, -2.8], [0.8, 4.4, -7.6]],
  [[2, 1.3, 7.2], [0.5, 1.3, -5.5], [-7.2, 1.3, 0.2]],
  [[8, TOP + 2.3, -3], [10.2, TOP + 4.6, 6.9], [5.3, TOP + 2.3, 6.9]],
  [[9.7, TOP + 1.6, 0.4], [9.4, TOP + 1.2, -6.9], [SCHOOL[0], TOP + 1.6, SCHOOL[1]]],
];
// the framing that holds every flag of a level, and the framing for the small picture of one plan: [x, y, z, distance]
export const TEST_VIEW = [[4.3, 1, -3.3, 43], [8.4, 2, 0.2, 31], [3.4, 1, -2.4, 39], [-0.6, 0.5, 0.4, 46], [8, 2, 1.6, 34], [7.6, 1.5, -2.6, 39]];
export const THUMB_VIEW = [
  [[-0.4, 0.5, 0.3, 17], [1.75, 0.5, -7.65, 17], [8.5, 2.5, 0.5, 21]],
  [[8.4, 2, 0.2, 27], [8.4, 2, 0.2, 27], [8.4, 2, 0.2, 27]], null, null,
  [[8, 2, 1.6, 30], [8, 2, 1.6, 30], [8, 2, 1.6, 30]],
  [[6.4, 1.5, -2.2, 33], [6.4, 1.5, -2.2, 33], [6.4, 1.5, -2.2, 33]],
];

const plen = (pts) => { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return l; };
const riverDist = (x, z) => { let d = 99; if (z > -4.5) d = Math.abs(x - MAP.riverX(z)); if (x < MAP.riverX(-4.5) + 1.1) d = Math.min(d, Math.abs(z + 4.5)); for (let zz = -4.5; zz <= 11; zz += 0.5) d = Math.min(d, Math.hypot(x - MAP.riverX(zz), z - zz)); return Math.max(0, d - 1.15); };

export function makeTests() {
  const root = MAP.world, K = makeKit(root), P = makeKit(root, pale), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), SC = new THREE.Vector3(), COL = new THREE.Color(), UP = new THREE.Vector3(0, 1, 0);
  // flat marks that ignore the light (trails, rain, ripples, pulses), solid blocks that take the light (pollution, crumbs)
  // and the flood water: three sets of boxes that are placed again on every frame
  const pool = (n, mat, shadow) => { const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, n); m.castShadow = shadow; m.receiveShadow = shadow; m.frustumCulled = false; m.setColorAt(0, COL.set('#fff')); root.add(m); m.n = 0; return m; };
  const marks = pool(1400, new THREE.MeshBasicMaterial({ color: '#ffffff' }), false), solids = pool(260, new THREE.MeshLambertMaterial({ color: '#ffffff' }), true), water = pool(520, new THREE.MeshLambertMaterial({ color: '#ffffff' }), false);
  const put = (m, x, y, z, sx, sy, sz, c, ry = 0) => { if (m.n >= m.instanceMatrix.count) return; Q.setFromAxisAngle(UP, ry); M4.compose(V.set(x, y, z), Q, SC.set(Math.max(1e-4, sx), Math.max(1e-4, sy), Math.max(1e-4, sz))); m.setMatrixAt(m.n, M4); m.setColorAt(m.n, COL.set(c)); m.n++; };
  const mk = (x, y, z, sx, sy, sz, c, ry) => put(marks, x, y, z, sx, sy, sz, c, ry), sol = (x, y, z, sx, sy, sz, c, ry) => put(solids, x, y, z, sx, sy, sz, c, ry);
  const flush = () => { for (const m of [marks, solids, water]) { m.count = m.n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.visible = m.n > 0; m.n = 0; } };
  // a pale piece lands lightly, and folds flat when it is cleared away. d is its delay in the row.
  const reg = (o, d = 0) => { o.userData.y0 = o.position.y; o.userData.s0 = o.scale.clone(); o.userData.d = d; o.visible = false; return o; };
  const trial = (o, a, f = -1) => { const u = o.userData, t = a - u.d; if (a < 0 || t <= 0) { o.visible = false; return false; } const k = trialDrop(t); let sy = k.sy; const sx = k.sx; if (f >= 0) { const q = clamp((f - u.d * 0.25) / 0.25); sy *= 1 - q; if (q >= 1) { o.visible = false; return false; } } o.visible = true; o.position.y = u.y0 + k.y; o.scale.set(u.s0.x * sx, u.s0.y * Math.max(0.02, sy), u.s0.z * sx); return true; };
  const all = (list, a, f) => list.forEach((o) => trial(o, a, f));
  // a trail behind a walker: one dot every half square, in the walker's own colour. A car leaves two unbroken lines.
  const dots = (pts, len, to, c) => { for (let d = 0.25; d < to * len; d += 0.5) { const p = along(pts, d / len); mk(p.x, heightAt(p.x, p.z) + 0.11, p.z, 0.24, 0.05, 0.24, c); } };
  const lines = (pts, len, to, c = '#4b4f5c') => { let left = to * len; for (let i = 1; i < pts.length && left > 0; i++) { const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.min(1, left / l), ry = Math.atan2(-(b[1] - a[1]), b[0] - a[0]), mx = a[0] + (b[0] - a[0]) * k / 2, mz = a[1] + (b[1] - a[1]) * k / 2, nx = Math.sin(ry) * 0.17, nz = Math.cos(ry) * 0.17, y = Math.max(heightAt(a[0], a[1]), heightAt(b[0], b[1])) + 0.1;
    for (const s of [-1, 1]) mk(mx + nx * s, y, mz + nz * s, l * k + 0.12, 0.05, 0.12, c, ry); left -= l; } };
  const stand = (o, pts, u, t, k, show = true) => { const p = along(pts, u); o.visible = show; o.position.set(p.x, heightAt(p.x, p.z) + (u > 0 && u < 1 ? Math.abs(Math.sin(t * 10 + k)) * 0.14 : 0), p.z); o.rotation.y = p.r; };
  const people = (n, size = 1.3) => [...Array(n)].map((_, k) => { const o = walker(root, k === 0 ? '#ffd257' : CLOTHES[(k + 2) % 6 === 2 ? 4 : (k + 2) % 6], size); o.visible = false; o.c = k === 0 ? '#ffd257' : CLOTHES[(k + 2) % 6 === 2 ? 4 : (k + 2) % 6]; return o; });
  const cars = (cols) => cols.map((c) => { const o = K.car(c); o.scale.setScalar(1.25); o.visible = false; return o; });
  const hide = (list) => list.forEach((o) => { o.visible = false; });

  // ================= level 1, Land: rain falls, the river rises and the water spreads over the low land =================
  const L1 = (() => {
    // the three places in the order of the data: a raised bank beside the river, the far meadow, the far hill
    const bank = [], bankHomes = [], meadowHomes = [], hillHomes = [], wet = [];
    for (let x = -3; x <= 2; x++) for (let z = -2; z <= 2; z++) { const b = reg(blk(root, x + 0.5, z + 0.5, 1, 1, 0, 0.62, pale(PAL.sand)), (x + 3) * 0.02); b.col = x; b.row = z; bank.push(b); }
    [[-0.95, -0.85, 1], [-0.95, 1.45, -1], [1.25, -0.85, 1], [1.25, 1.45, -1]].forEach(([x, z, f], k) => bankHomes.push(reg(P.home(x, z, 0.62, PAL.wall[k % 3], f, PAL.roof[k % 3]), 0.12 + k * 0.08)));
    [[0.6, -8.8, 1], [0.6, -6.5, -1], [2.9, -8.8, 1], [2.9, -6.5, -1]].forEach(([x, z, f], k) => { meadowHomes.push(reg(P.home(x, z, 0, PAL.wall[k % 3], f, PAL.roof[k % 3]), k * 0.08)); const w = blk(root, x, z, 1.97, 1.97, 0, 0.62, '#7e8ea0', { shadow: false }); w.visible = false; wet.push(w); });
    SPOTS.slice(0, 4).forEach(([x, z, f], k) => hillHomes.push(reg(P.home(x, z, TOP, PAL.wall[k % 3], f, PAL.roof[k % 3]), k * 0.08)));
    // the squares of low land and of the river itself, with how far each is from the river
    const cells = []; for (let x = -15; x <= 3; x++) for (let z = -11; z <= 10; z++) { const cx = x + 0.5, cz = z + 0.5; if (!inside(cx, cz, 1.02) || MAP.H(cx, cz) > 0.01) continue; cells.push([cx, cz, riverDist(cx, cz)]); }
    const cloud = group(root); for (let k = 0; k < 11; k++) blk(cloud, hash(k, 1) * 1.2, -17 + k * 3.4, 2.4 + hash(k, 2) * 1.2, 4.6, hash(k, 3) * 0.8, 1.3, k % 3 ? '#aeb8c3' : '#c3ccd5', { shadow: false });
    const beam = blk(root, 8.5, 0.5, 8.4, 10, TOP, 9, '#fff3b0', { shadow: false, mat: new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.2, depthWrite: false }) });
    const sunny = blk(root, 8.5, 0.5, 8.4, 10, TOP + 0.02, 0.03, '#fff3b0', { shadow: false, mat: new THREE.MeshBasicMaterial({ color: '#fff7c9', transparent: true, opacity: 0.45, depthWrite: false }) });
    const FULL = 0.58;
    return (S, R) => {
      const [A, B, C] = S.plans, u = S.u, live = Math.max(A.e, B.e, C.e), clear = S.clear;
      all(bank, A.a, A.f); all(bankHomes, A.a, A.f); all(meadowHomes, B.a, B.f); all(hillHomes, C.a, C.f);
      // the cause comes first: a flat grey cloud slides in, and the light dims by about a third
      const cin = live < 0 ? 0 : outBack(span(live, 0, 0.6), 0.04), cout = live < 0 ? 0 : inOutCubic(span(live, 8.4, 9.4)), ck = cin * (1 - cout);
      cloud.visible = ck > 0.01; cloud.position.set(12.8, 4.6, (1 - cin) * -34 + cout * 36); R.dim = 0.33 * ck;
      // blue rain, half as wide again as before, and a pale mark where each drop lands
      const rain = live < 0 ? 0 : span(live, 0.6, 1.4) * (1 - span(live, 8.4, 9.2));
      for (let i = 0; i < 170 && rain > 0; i++) { if (hash(i, 7) > rain) continue; const ph = ((live * 0.95 + hash(i, 1) * 9) % 1), n = Math.floor(live * 0.95 + hash(i, 1) * 9), x = -8 + hash(i, n) * 22, z = -11.5 + hash(n, i + 3) * 23, g = Math.max(0, heightAt(x, z)); if (x >= 4 && Math.abs(z) > 9) continue;
        if (ph < 0.86) mk(x - (1 - ph) * 0.8, g + (0.86 - ph) * 12 + 0.5, z, 0.13, 1.0, 0.13, '#2f7fd0'); else mk(x, g + 0.09, z, 0.42, 0.04, 0.42, '#eef8ff'); }
      // the river rises first, and then the water travels outward from it at about 1.6 squares a second, with a bright edge
      const drain = clear >= 0 ? 1 - ease(span(clear, 0, 1.2)) : 1, level = (d) => { if (live < 0) return 0; const ta = d <= 0 ? 1.0 : 1.5 + d / 1.6; return FULL * ease(span(live, ta, ta + 0.35)) * drain; };
      for (const [x, z, d] of cells) { const l = level(d); if (l <= 0.01) continue; const ta = d <= 0 ? 1.0 : 1.5 + d / 1.6, edge = 1 - span(live, ta, ta + 0.7), bob = Math.sin(S.t * 1.7 + x * 0.9 + z * 0.6) * 0.012; COL.set('#58b6e8').lerp(V2.set('#ffffff'), edge * 0.85); put(water, x, (l + bob - 0.35) / 2, z, 1, l + bob + 0.35, 1, '#' + COL.getHexString()); }
      // plan A, the bank: the water wears it away in two steps, and the homes at its edge lean. They stay above the water.
      const wA = A.e < 0 ? 0 : span(A.e, 4.6, 4.8) * 0.5 + span(A.e, 5.1, 5.3) * 0.5, wA2 = A.e < 0 ? 0 : span(A.e, 5.6, 5.8) * 0.5 + span(A.e, 6.0, 6.2) * 0.5;
      bank.forEach((b) => { if (!b.visible) return; if (b.col === -3) b.position.y -= wA * 0.75; if (b.col === -2) b.position.y -= wA2 * 0.62; });
      bankHomes.forEach((h, k) => { h.rotation.z = 0; if (!h.visible || k > 1) return; const lean = wA2 * 0.3 + (A.e > 6.2 ? ring(A.e - 6.2, 1.6, 2.6, 0.06) : 0); h.rotation.z = lean; h.position.y -= wA2 * 0.3; h.position.x = -0.95 - wA2 * 0.3; });
      if (A.e > 4.6 && A.e < 7 && A.a >= 0) for (let i = 0; i < 20; i++) { const a = A.e - 4.6 - (i % 4) * 0.5 - (i % 5) * 0.06, k2 = a / 0.6; if (k2 > 0 && k2 < 1) sol(-3.1 - k2 * 0.9 - hash(i, 2) * 0.4 + (i % 4 > 1 ? 0.9 : 0), 0.75 - k2 * k2 * 0.7, -1.9 + (i % 10) * 0.42, 0.3, 0.3, 0.3, pale(PAL.sand)); }
      // plan B, the far meadow: the homes stand in the water, their walls are wet to the door, and square ripples spread from them
      const lB = level(riverDist(1.75, -7.6)), deep = B.a >= 0 && B.f < 0 ? lB / FULL : 0;
      wet.forEach((w, k) => { w.visible = deep > 0.05 && meadowHomes[k].visible; w.scale.y = 0.62 * Math.max(0.05, deep) + 0.25; w.position.y = w.scale.y / 2; });
      if (deep > 0.9 && clear < 0) meadowHomes.forEach((h, k) => { for (let n = 0; n < 2; n++) { const ph = ((S.t * 0.62 + n * 0.5 + k * 0.23) % 1), r = 1.15 + ph * 1.5, c = ph < 0.8 ? '#ffffff' : '#bfe3f7', y = lB + 0.03; mk(h.position.x, y, h.position.z - r, r * 2, 0.03, 0.09, c); mk(h.position.x, y, h.position.z + r, r * 2, 0.03, 0.09, c); mk(h.position.x - r, y, h.position.z, 0.09, 0.03, r * 2, c); mk(h.position.x + r, y, h.position.z, 0.09, 0.03, r * 2, c); } });
      // plan C, the far hill: the cloud parts, a pale beam of sun falls on the dry homes and their windows light
      const sun = C.e < 0 || C.a < 0 || C.f >= 0 ? 0 : ease(span(C.e, 7.9, 8.6)); beam.visible = sunny.visible = sun > 0.01; beam.material.opacity = 0.2 * sun; sunny.material.opacity = 0.45 * sun; beam.scale.y = 9; beam.position.y = TOP + 4.5;
      hillHomes.forEach((h) => { h.wm.color.set(sun > 0.5 ? '#ffd257' : pale('#9fd0f5')); });
    };
  })();

  // ================= level 2, Getting around: the shops open and people leave every home ====================================
  const L2 = (() => {
    const T = TEST[1], shop = reg(P.stall(STALL[0], TOP, STALL[1])), tile = (x, z, c, h = 0.06) => reg(blk(root, x + 0.5, z + 0.5, 1, 1, TOP, h, c === PAL.road ? '#f3f0ea' : c === PAL.sand ? '#fff3d0' : pale(c), { shadow: false }), (x - 4) * 0.012 + (z + 5) * 0.012);
    const ring = []; for (let x = 4; x <= 12; x++) for (const z of [-5, 5]) ring.push([x, z]); for (let z = -4; z <= 4; z++) for (const x of [4, 12]) ring.push([x, z]);
    const grid = [...ring]; for (let x = 5; x <= 11; x++) grid.push([x, 0]); for (let z = -4; z <= 4; z++) if (z) grid.push([8, z]);
    // each plan in the order of the data: a grid of streets, one winding loop, paths through a park
    const pieces = [grid.map(([x, z]) => tile(x, z, PAL.road)), ring.map(([x, z]) => tile(x, z, PAL.road)), [...ring.map(([x, z]) => tile(x, z, PAL.road))]];
    for (let x = 5; x <= 11; x++) for (let z = -2; z <= 2; z++) pieces[2].push(tile(x, z, x === 9 || z === 0 ? PAL.sand : PAL.grassDeep, x === 9 || z === 0 ? 0.075 : 0.05)); for (const z of [-4, -3, 3, 4]) pieces[2].push(tile(9, z, PAL.sand, 0.075));
    const folk = people(8), autos = cars(['#e0503a', '#3f78b5']), ROW = (k) => [4.72, 0.5 + k * 0.33];
    // the way from each of the four first homes to the shop, for each plan; two people leave every home
    const door = SPOTS.slice(0, 4).map(([x, z, f]) => [x + 0.4, z + 1.3 * f]);
    const across = [(d) => [d, [d[0], -1.2], [8.5, -1.2], [8.5, 0.5], [5.4, 0.5], [4.72, 0.5]], (d) => [d, [12.5, d[1]], [12.5, 0.5], [5.4, 0.5], [4.72, 0.5]], (d) => [d, [d[0], 3.3], [4.72, 3.3]], (d) => [d, [12.5, d[1]], [12.5, 0.5], [5.4, 0.5], [4.72, 0.5]]];
    const park = [(d) => [d, [d[0], 0.5], [4.72, 0.5]], (d) => [d, [d[0], 0.5], [4.72, 0.5]], (d) => [d, [d[0], 3.3], [4.72, 3.3]], (d) => [d, [d[0], 0.5], [4.72, 0.5]]];
    const loopWalk = [(d) => [d, [4.72, d[1]]], null, (d) => [d, [d[0], 3.3], [4.72, 3.3]], null];
    const drive = [null, (d) => [[12.5, d[1]], [12.5, -4.5], [4.5, -4.5], [4.5, -1.3]], null, (d) => [[12.5, d[1]], [12.5, 5.5], [4.5, 5.5], [4.5, 4.4]]];
    const way = (plan, k) => { const h = k >> 1, d = door[h]; if (plan === 1 && !loopWalk[h]) return [d, [12.3, d[1]]]; return [...(plan === 0 ? across[h](d) : plan === 2 ? park[h](d) : loopWalk[h](d)), ROW(k)]; };
    const ways = [0, 1, 2].map((p) => folk.map((_, k) => { const pts = way(p, k); return { pts, len: plen(pts) }; })), roads = drive.map((f, h) => (f ? (() => { const pts = f(door[h]); return { pts, len: plen(pts) }; })() : null));
    return (S, R) => {
      hide(folk); hide(autos); let cut = 0, hopT = -1, shopA = -1, shopF = -1, open = 0;
      S.plans.forEach((p, i) => { all(pieces[i], p.a, p.f); if (p.a >= 0) { shopA = p.a; shopF = p.f; }
        if (i === 0 && p.a >= 0) cut = p.f >= 0 ? 1 - clamp(p.f / 0.3) : clamp(p.a / 0.5);
        const e = p.e; if (e < 0 || e > T.each) return;
        open = outBack(span(e, 0.5, 0.8), 0.25) * (1 - span(e, T.each - 0.5, T.each - 0.2)); const back = inOutCubic(span(e, T.each - 0.7, T.each - 0.25));
        folk.forEach((o, k) => { const h = k >> 1, byCar = i === 1 && (h === 1 || h === 3), w = ways[i][k], out = 0.9 + k * 0.1, go = out + 0.35, speed = 3.3;
          if (byCar) { const r = roads[h], car = autos[h === 1 ? 0 : 1], wu = clamp((e - go) * speed / w.len), cgo = go + w.len / speed + 0.35, cu0 = clamp((e - cgo) * 6.4 / r.len), cu = rewind(back, cu0), hopY = hop(e - cgo - r.len / 6.4, 0.3, 300);
            // the person turns towards the long road and waits; then a car pops up beside the home and the person hops in
            if (k & 1) { o.visible = false; } else { stand(o, w.pts, rewind(back, wu), S.t, k, e > out && cu0 <= 0 && back < 1); o.scale.setScalar(Math.max(0.01, springAt(e, out, SPRING.pop))); }
            if (!(k & 1)) { const pop = springAt(e, cgo - 0.3, SPRING.bouncy); car.visible = e > cgo - 0.3 && back < 0.999; stand(car, r.pts, cu, 0, 0, car.visible); car.position.y += hopY; car.scale.setScalar(1.25 * Math.max(0.01, pop) * (1 - span(back, 0.85, 1))); lines(r.pts, r.len, cu); }
            return; }
          const u0 = clamp((e - go) * speed / w.len), u = rewind(back, u0), there = e - go - w.len / speed; stand(o, w.pts, u, S.t, k, e > out && back < 1); o.scale.setScalar(Math.max(0.01, springAt(e, out, SPRING.pop))); if (u0 >= 1 && back <= 0) { o.position.y += hop(there, 0.4, 300); o.rotation.y = 0; } dots(w.pts, w.len, u, o.c); });
        // the trees hop one after another, so that the eye can count the ones that were kept
        hopT = e - 4.2; });
      trial(shop, shopA, shopF); shop.awning.scale.set(Math.max(0.05, open || (shopA >= 0 ? 0.05 : 0)), 1, 1); shop.awning.position.x = -0.75 * (1 - Math.min(1, open));
      if (S.li === 1) { R.town.treeCut = cut; R.town.treeHop = hopT; R.town.stroll = false; }
    };
  })();

  // ================= level 3, Homes: a sawmill, a brick oven and a cement works start up ===================================
  const L3 = (() => {
    const mill = reg(P.sawmill(MILL[0], 0, MILL[1])), OV = [0.8, -2.8], CE = [0.8, -7.6], fire = glow('#ffb347');
    const oven = reg((() => { const g = group(root, OV[0], 0, OV[1]); blk(g, 0, 0, 2.2, 2.2, 0, 1.3, pale('#b5553a')); blk(g, 0, 0, 1.6, 1.6, 1.3, 0.5, pale('#a8452f')); blk(g, 0.4, -0.4, 0.6, 0.6, 1.8, 1.5, pale('#8a5a4a')); blk(g, -1.11, 0, 0.06, 0.9, 0.1, 0.7, '#ffb347', { shadow: false, mat: fire }); return g; })());
    const works = reg((() => { const g = group(root, CE[0], 0, CE[1]); blk(g, 0.3, -0.9, 1.3, 1.3, 0, 3, pale(PAL.concrete)); blk(g, 0.3, 0.7, 1.3, 1.3, 0, 2.4, pale('#a9a8a2')); blk(g, -0.9, 0, 1.1, 2.6, 0, 1.2, pale('#cfcdc6')); blk(g, 0.3, -0.9, 0.5, 0.5, 3, 1.4, pale('#8d8c86')); blk(g, -0.9, 0, 0.7, 0.3, 1.2, 0.5, pale(PAL.navy)); return g; })());
    const BEAT = 0.9, FIRST = 0.9, LAST = 5.6;
    // a pile of what each works makes: a new piece on every beat, the same number at all three, so that only the pollution differs
    const pile = (x, z, e, c, w, d, h) => { for (let n = 0; n < 6; n++) { const a = e - FIRST - n * BEAT; if (a <= 0) break; const s = springAt(a, 0, SPRING.pop), col = n % 3, row = Math.floor(n / 3); sol(x + (col - 1) * (w + 0.08), 0.02 + row * (h + 0.03) + h / 2 + hop(e - 6.6 - n * 0.05, 0.25, 300), z, w * s, h * s, d * s, c); } };
    // puffs of pollution rise quickly at first and slow, and join a flat cloud that spreads sideways above the chimney
    const cloud = (x, z, top, e, f, per, size, c, seed) => { let n = 0; const fold = f >= 0 ? 1 - clamp(f / 0.4) : 1;
      for (let b = 0; b < 6; b++) for (let j = 0; j < per; j++, n++) { const a = e - FIRST - b * BEAT - j * 0.16; if (a <= 0) continue; const rise = outCubic(clamp(a / 1.5)), ang = n * 2.4 + seed, rad = Math.sqrt(n + 0.6) * size * 0.56, drift = Math.sin(S_t * 0.5 + n) * 0.12, s = size * (0.75 + hash(n, seed) * 0.5) * Math.min(1, 0.45 + a) * fold;
          sol(x + 0.4 + Math.cos(ang) * rad * rise * 0.6 + drift, top + rise * 3.6 + hash(n, 4) * 0.5, z + Math.sin(ang) * rad * rise * 1.25, s * 1.25, s * 0.62, s * 1.25, c); } };
    let S_t = 0;
    return (S, R) => {
      const [A, B, C] = S.plans; S_t = S.t; trial(mill, A.a, A.f); trial(oven, B.a, B.f); trial(works, C.a, C.f);
      const run = (e) => (e < 0 ? 0 : span(e, 0, 0.6) * (1 - span(e, LAST, LAST + 0.8)));
      // the sawmill runs on electricity: its saw spins, planks slide out, and nothing rises from it
      mill.saw.rotation.x = S.t * 9 * run(A.e);
      if (A.a >= 0 && A.f < 0 && A.e >= 0) { pile(MILL[0] - 2.6, MILL[1] - 1.6, A.e, pale('#b9824a'), 0.34, 1.3, 0.16); for (let i = 0; i < 3; i++) { const a = A.e - 6.6 - i * 0.12; if (a > 0 && a < 0.7) mk(MILL[0] + 0.5 + (i - 1) * 1.1, 3.4 + i * 0.5 + a * 0.6, MILL[1] + (i - 1) * 0.9, 0.32 * Math.sin(a / 0.7 * Math.PI), 0.32 * Math.sin(a / 0.7 * Math.PI), 0.06, '#ffffff', 0.7); } }
      fire.color.set(B.e >= 0 && run(B.e) > 0 ? (Math.sin(S.t * 5) > 0 ? '#ffb347' : '#ff8a3a') : '#7a4a3a');
      if (B.a >= 0 && B.e >= 0) { if (B.f < 0) pile(OV[0] - 2.2, OV[1] + 0.2, B.e, pale('#b5553a'), 0.5, 0.5, 0.3); cloud(OV[0], OV[1], 3.3, B.e, B.f, 1, 0.95, '#8b847d', 3); }
      works.position.x = CE[0] + (C.e >= 0 ? Math.sin(S.t * 31) * 0.035 * run(C.e) : 0);
      if (C.a >= 0 && C.e >= 0) { if (C.f < 0) pile(CE[0] - 2.5, CE[1] + 0.2, C.e, pale(PAL.concrete), 0.55, 0.9, 0.22); cloud(CE[0], CE[1], 4.4, C.e, C.f, 3, 1.3, '#5d5852', 9); }
    };
  })();

  // ================= level 4, Food: food travels to market, and wildlife stays or leaves =====================================
  const L4 = (() => {
    const field = (x0, x1, z0, z1) => { const list = []; for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) { if (!inside(x + 0.5, z + 0.5, 0.97)) continue; list.push(reg(P.tile(x, z, z & 1 ? PAL.soil : PAL.soilDark, 0, 0.07), (x - x0) * 0.03 + (z - z0) * 0.02)); list.push(reg(blk(root, x + 0.5, z + 0.5, 0.5, 0.5, 0.07, 0.34, pale(['#7cc04a', '#e2c04a', '#4f9550'][(x + z + 20) % 3])), 0.15 + (x - x0) * 0.03 + (z - z0) * 0.02)); } return list; };
    // the three places in the order of the data: on the wild meadow, on open land close to town, on open land far from town
    const fields = [field(0, 3, 5, 8), field(-2, 3, -8, -3), field(-9, -6, -2, 1)];
    const bridge = []; for (let x = -5; x <= 0; x++) bridge.push(reg(blk(root, x + 0.5, 9.5, 1, 1, 0.02, 0.16, pale(PAL.timber), { shadow: false }), 0.3 + (x + 5) * 0.04)); fields[2].push(...bridge);
    const carts = [K.cart(), K.cart()], lorry = group(root), cold = glow('#ffffff'); carts.forEach((c) => { c.scale.setScalar(1.45); c.visible = false; });
    blk(lorry, -0.15, 0, 1.5, 0.95, 0.22, 1.05, PAL.white, { mat: cold }); blk(lorry, 0.95, 0, 0.6, 0.9, 0.22, 0.75, '#3f78b5'); blk(lorry, 0.98, 0, 0.5, 0.8, 0.6, 0.3, PAL.glass, { shadow: false }); for (const [x, z] of [[-0.55, 0.5], [0.75, 0.5], [-0.55, -0.5], [0.75, -0.5]]) blk(lorry, x, z, 0.36, 0.1, 0, 0.36, '#2a2a2a', { shadow: false }); lorry.scale.setScalar(1.35); lorry.visible = false;
    const FOOT = 3.62, ways = [[[2.2, 5.3], [FOOT, 5.3], [FOOT, 0.5], [4.55, 0.5], [4.55, 1.2]], [[1.2, -3.2], [1.6, -0.5], [3.5, -0.5], [4.55, -0.5], [4.55, 0.9]], [[-6.4, -0.3], [-5.3, 1.5], [-5.3, 9.5], [0.6, 9.5], [FOOT, 9.5], [FOOT, 1.6], [3.5, 0.5], [4.55, 0.5], [4.55, 2.2]]].map((pts) => ({ pts, len: plen(pts) }));
    const CROP = ['#e0503a', '#4f9550', '#e2c04a'], GO = 1.7, counter = (i, n) => [STALL[0] - 0.1, TOP + 0.68, STALL[1] + (i - 1) * 0.6 + (n - 1) * 0.0];
    // wild patches that are left alone beside the two farms on open land; bees live in them, as they do in the meadow
    const patches = [[[-3.3, -6.2], [-3.4, -4.2]], [[-8.8, 2.9], [-6.6, 3.1]]], FL = ['#f08ab8', '#ffd257', '#ffffff', '#c98be0'];
    const wild = patches.map((pp, w) => pp.flatMap(([x, z], q) => [...Array(7)].map((_, k) => { const f = blk(root, x + hash(k, w + q) * 1.2 - 0.6, z + hash(k + 9, w + q) * 1.6 - 0.8, 0.26, 0.26, 0, 0.36, FL[k % 4], { shadow: false }); f.y0 = 0.18; return f; })));
    const bee = () => { const g = group(root); blk(g, 0, 0, 0.34, 0.26, 0, 0.26, '#ffcf2e', { shadow: false, mat: glow('#ffcf2e') }); blk(g, 0.02, 0, 0.1, 0.27, 0, 0.27, '#2a2a2a', { shadow: false }); blk(g, 0, 0, 0.2, 0.5, 0.24, 0.05, '#ffffff', { shadow: false }); g.visible = false; return g; };
    const wildBees = patches.map(() => [bee(), bee(), bee()]), birds = patches.map(() => { const g = group(root); blk(g, 0, 0, 0.5, 0.3, 0, 0.26, '#3f78b5'); blk(g, 0.28, 0, 0.16, 0.12, 0.08, 0.1, '#ffd257', { shadow: false }); g.wing = blk(g, -0.05, 0, 0.3, 0.9, 0.2, 0.06, '#2b5a8f', { shadow: false }); g.visible = false; return g; });
    return (S, R) => {
      const T = R.town; carts.forEach((c) => { c.visible = false; }); lorry.visible = false; let lost = 0, away = 0;
      S.plans.forEach((p, i) => { all(fields[i], p.a, p.f); const e = p.e, w = ways[i], on = p.a >= 0 && p.f < 0;
        if (i === 0 && p.a >= 0) { lost = p.f >= 0 ? 1 - clamp(p.f / 0.5) : e < 0 ? 0 : span(e, 4.8, 5.6); away = p.f >= 0 ? 1 - clamp(p.f / 0.8) : e < 0 ? 0 : span(e, 5.3, 6.5); }
        if (!on || e < 0) return;
        const v = i === 2 ? lorry : carts[i], arrive = i === 2 ? 8.7 : 4.3, u = inOutCubic(span(e, GO, arrive)) * 0.999 + (e > arrive ? 0.001 : 0), pos = along(w.pts, u);
        v.visible = true; v.position.set(pos.x, heightAt(pos.x, pos.z) - Math.sin(clamp((e - 0.7) / 0.9) * Math.PI * 3) * 0.04 * (e < GO ? 1 : 0) + hop(e - arrive, 0.25, 300), pos.z); v.rotation.y = pos.r;
        if (i === 2) { cold.color.set(e > 1.3 && e < 1.6 ? '#bfe6ff' : '#fbfbf7'); lines(w.pts, w.len, u); } else dots(w.pts, w.len, u, '#a9743f');
        // the food is loaded before the journey and set out on the counter after it: fresh crops from a cart, brown boxes from the lorry
        const n = i === 2 ? 4 : 3, start = along(w.pts, 0); for (let k = 0; k < n; k++) { const a = e - 0.7 - k * 0.2, c = i === 2 ? pale(PAL.timber) : CROP[k % 3], s = i === 2 ? 0.34 : 0.3;
          if (a > 0 && a < 0.4) { const q = a / 0.4; sol(lerp(start.x - 1.4, start.x, q), 0.5 + Math.sin(q * Math.PI) * 1.2, lerp(start.z - 0.5 + k * 0.4, start.z, q), s, s, s, c); }
          const b = e - arrive - 0.15 - k * 0.2; if (b > 0) { const q = clamp(b / 0.4), to = counter(i, n); sol(lerp(pos.x, to[0], q), lerp(TOP + 0.8, to[1] + (k > 1 ? 0.3 : 0), q) + Math.sin(q * Math.PI) * 0.9, lerp(pos.z, to[2] + ((k % 2) - 0.5) * 0.3, q), s, s, s, c); if (b < 0.5) mk(to[0] - 0.7, to[1] + 0.5 + b, to[2] + (k - 1) * 0.3, 0.2 * (1 - b * 2), 0.2 * (1 - b * 2), 0.05, '#ffffff', 0.7); } }
      });
      // where the wild land is left alone, the flowers hop and the bees stay, and a bird arrives
      patches.forEach((pp, w) => { const p = S.plans[w + 1], e = p.e, on = S.wild; wild[w].forEach((f, k) => { f.position.y = f.y0 + (on && e >= 0 ? hop(e - 4.9 - (k % 7) * 0.06, 0.4, 300) : 0); });
        wildBees[w].forEach((b, k) => { const c = pp[k % 2]; b.visible = on; b.position.set(c[0] + Math.sin(S.t * 1.3 + k * 2) * 0.8, 0.9 + Math.sin(S.t * 2.3 + k) * 0.2, c[1] + Math.cos(S.t * 1.1 + k * 2) * 0.9); b.rotation.y = S.t * 1.2 + k; });
        const bird = birds[w], q = on && e >= 0 && p.f < 0 ? outCubic(span(e, 5.0, 6.2)) : 0; bird.visible = q > 0; bird.position.set(pp[0][0] - 6 * (1 - q), 0.9 + (1 - q) * 5 + (q >= 1 ? hop((S.t * 0.8) % 2, 0.25, 300) : 0), pp[0][1] + 5 * (1 - q)); bird.rotation.y = -0.6; bird.wing.scale.z = q < 1 ? 0.5 + Math.abs(Math.sin(S.t * 14)) * 0.5 : 0.45; });
      if (S.li !== 3) return; T.meadowLost = lost; T.beesAway = away; T.bees = 1; T.cart = -1; if (S.plans[0].a < 0 || S.plans[0].f >= 0) T.meadowHop = Math.max(S.plans[1].e, S.plans[2].e) - 4.9;
    };
  })();

  // ================= level 5, Power: night falls and the lights stay on or go dark ============================================
  const L5 = (() => {
    const T = TEST[4], homes = [...SPOTS.map(([x, z]) => [x, TOP, z]), ...FARMS.map(([x, z]) => [x, 0, z])];
    const panel = (k, d) => { const [x, y, z] = homes[k], s = reg(blk(root, x - 0.52, z, 0.72, 1.3, y + 1.9, 0.07, pale(PAL.solar)), d); s.rotation.z = Math.PI / 4; return s; };
    const WIND = [[5.6, 6.9], [7.3, 7.2], [9.0, 6.8], [10.6, 7.1]];
    // each plan in the order of the data: solar roofs, a wind farm on the hill, and wind, sun and a battery together
    const solar = homes.map((_, k) => panel(k, k * 0.05)), farm = WIND.map(([x, z], k) => reg(P.turbine(x, TOP, z), k * 0.09)), mixT = TURBINES.map(([x, z], k) => reg(P.turbine(x, TOP, z), k * 0.09)), mixS = [0, 2, 4].map((k, n) => panel(k, 0.2 + n * 0.05)), batt = reg(P.battery(BATTERY[0], TOP, BATTERY[1]), 0.15);
    const birds = [0, 1, 2].map(() => { const g = group(root); blk(g, 0, 0, 0.5, 0.3, 0, 0.24, '#f4f1e8', { mat: glow('#f4f1e8') }); g.wing = blk(g, -0.05, 0, 0.3, 1.0, 0.18, 0.06, '#d9d4c6', { shadow: false, mat: glow('#d9d4c6') }); g.visible = false; return g; });
    const pulse = (from, k, e, start, every = 0.6) => { const [x, y, z] = homes[k], fy = from[1], n = Math.floor((e - start) / every); for (let j = Math.max(0, n - 2); j <= n; j++) { const a = (e - start - j * every - k * 0.07) / 1.1; if (a <= 0 || a >= 1) continue; const q = inOutCubic(a); mk(lerp(from[0], x, q), lerp(fy, y + 1.2, q) + Math.sin(q * Math.PI) * 1.4, lerp(from[2], z, q), 0.3, 0.3, 0.3, '#ffe27a'); } };
    return (S, R) => {
      const u = S.u, clear = S.clear, T2 = R.town; hide(birds);
      // the sun goes down before the lights come on; it stays night until the child has chosen
      R.night = u < 0 ? 0 : ease(span(u, 0.4, 2.6)) * (clear >= 0 ? 1 - ease(span(clear, 0, 1.4)) : 1);
      let lights = () => 1, wind = 1, bars = 3;
      S.plans.forEach((p, i) => { const e = p.e, live = e >= 0 && e <= T.each, back = live ? span(e, T.each - 0.6, T.each - 0.2) : 0;
        if (i === 0) all(solar, p.a, p.f); if (i === 1) all(farm, p.a, p.f); if (i === 2) { all(mixT, p.a, p.f); all(mixS, p.a, p.f); trial(batt, p.a, p.f); }
        if (i === 1) farm.forEach((g, k) => { g.hub.rotation.z = S.t * 2.3 * (live && e > 1.2 && e < 2.4 ? 2.4 : 1) + k; }); if (i === 2) mixT.forEach((g, k) => { g.hub.rotation.z = S.t * 2.3 + k; });
        if (!live) return;
        if (i === 0) {
          // the roofs have no sun: the lights dim once, come back, and then go dark one home after another from the far end.
          // Nothing changes more than twice in a second.
          lights = (k) => { if (back > 0) return back; const out = 2.2 + (7 - k) * 0.11; return e < 0.9 ? 1 : e < 1.4 ? 0.3 : e < 2.0 ? 0.8 : e < out ? 0.8 : 0; };
        }
        if (i === 1) { wind = e > 1.2 && e < 2.4 ? 2.4 : 1;
          // a gust crosses the hill as white streaks, the turbines speed up, and small yellow pulses travel from them to the homes
          for (let n = 0; n < 5; n++) { const a = (e - 1.1 - n * 0.09) / 0.9; if (a > 0 && a < 1) mk(3 + a * 12, TOP + 2.2 + n * 0.5, -3 + n * 2.2 + a * 3, 2.4, 0.06, 0.1, '#ffffff', -0.25); }
          homes.forEach((_, k) => pulse([WIND[k % 4][0], TOP + 4, WIND[k % 4][1]], k, e, 0.7));
          // three birds cross the hill and have to bend their path around the turbines
          birds.forEach((b, k) => { const a = span(e, 1.3, 3.5), bend = Math.sin(a * Math.PI) * 4.2; b.visible = a > 0 && a < 1; b.position.set(12.5 - bend - k * 0.9, TOP + 3.3 + k * 0.4, 12 - a * 22 + k * 0.6); b.rotation.y = Math.PI / 2 + Math.cos(a * Math.PI) * 0.5; b.wing.scale.z = 0.5 + Math.abs(Math.sin(S.t * 13 + k)) * 0.5; });
        }
        if (i === 2) { bars = e > 2.3 ? 2 : 3;
          // pulses leave the battery and the lights do not waver; the birds fly straight past, away from the two turbines
          homes.forEach((_, k) => pulse([BATTERY[0], TOP + 1.4, BATTERY[1]], k, e, 0.7));
          birds.forEach((b, k) => { const a = span(e, 1.3, 3.5); b.visible = a > 0 && a < 1; b.position.set(12.4 - k * 0.9, TOP + 3.3 + k * 0.4, 12 - a * 22 + k * 0.6); b.rotation.y = Math.PI / 2; b.wing.scale.z = 0.5 + Math.abs(Math.sin(S.t * 13 + k)) * 0.5; });
        }
      });
      batt.bars.forEach((b, k) => { b.userData.m.color.set(k < bars ? '#7dffa8' : '#31503c'); });
      if (S.li === 4) { T2.lights = lights; T2.wind = wind; }
    };
  })();

  // ================= level 6, A school for everyone: the bell rings and the children walk or go by car ========================
  const L6 = (() => {
    const T = TEST[5], AT = [[9.7, 0.4], [9.4, -6.9], SCHOOL], schools = AT.map(([x, z]) => { const g = reg(P.school(x, TOP, z)); g.userData.s0.setScalar(0.9); return g; });
    const kids = people(8, 1.12), autos = cars(['#8a5fc2', '#16a3a3']);
    const doors = [...SPOTS.map(([x, z, f]) => [x + 0.4, z + 1.3 * f]), ...FARMS.map(([x, z]) => [x + 0.4, z + 1.3])], W = 4.5, N = -4.5;
    // the way of each child to each of the three schools; the farm children come up the stair. The cars use the roads only.
    const gate = [(k) => [8.5 + k * 0.38, 1.75], (k) => [8.2 + k * 0.36, -5.6], (k) => [4.9 + k * 0.38, -5.75]];
    const walk = (s, k) => { const d = doors[k], farm = k >= 6, g = gate[s](k), north = d[1] < 0;
      if (s === 0) return farm ? [d, [3.2, -0.5], [W, -0.5], [W, 0.5], [8.2, 0.5], g] : [d, [d[0], north ? -1.5 : 2.9], [g[0], north ? -1.5 : 2.9], g];
      const up = farm ? [d, [3.2, -0.5], [W, -0.5]] : north ? [d, [d[0], -1.4], [W, -1.4]] : [d, [d[0], 3], [W, 3]]; return [...up, [W, N], [g[0], N], g]; };
    const ways = [0, 1, 2].map((s) => kids.map((_, k) => { const pts = walk(s, k); return { pts, len: plen(pts) }; }));
    const drive = (s, k) => { const d = doors[k]; return s === 0 ? [[d[0] + 0.6, d[1] + 0.5], [3.2, -0.5], [W, -0.5], [W, N], [9.5 - (k - 6) * 1.5, N]] : [[d[0] + 0.6, d[1] + 0.5], [3.2, -0.5], [W, -0.5], [W, N], [7.2, N]]; };
    const roads = [0, 1].map((s) => [6, 7].map((k) => { const pts = drive(s, k); return { pts, len: plen(pts) }; }));
    // which children go by car with each school: both farm children, one farm child, and nobody
    const byCar = (s, k) => (s === 0 ? k >= 6 : s === 1 ? k === 6 : false);
    return (S, R) => {
      hide(kids); hide(autos);
      S.plans.forEach((p, s) => { const sc = schools[s]; trial(sc, p.a, p.f); const e = p.e, live = e >= 0 && e <= T.each; sc.bell.scale.setScalar(live && e < 2 ? 0.42 * (1 + span(e, 0.4, 0.6) * (1 - span(e, 1.7, 2.0))) : 0.42); sc.bell.scale.y = sc.bell.scale.x / 0.42 * 0.5; sc.bell.rotation.z = live ? ring(e - 0.5, 3.5, 2.2, 0.7) : 0; sc.flag.scale.x = 0.6 + Math.sin(S.t * (live && e < 2 ? 9 : 5)) * (live && e < 2 ? 0.14 : 0.06);
        if (!live) return; const back = inOutCubic(span(e, T.each - 0.75, T.each - 0.3)), [sx, sz] = AT[s];
        // the bell swings and sends out three square rings before any child sets off
        for (let n = 0; n < 3; n++) { const a = (e - 0.5 - n * 0.25) / 0.7; if (a > 0 && a < 1) { const r = 1.2 + outCubic(a) * 3.2, c = '#ffd257', y = TOP + 0.12; mk(sx, y, sz - r, r * 2, 0.05, 0.14, c); mk(sx, y, sz + r, r * 2, 0.05, 0.14, c); mk(sx - r, y, sz, 0.14, 0.05, r * 2, c); mk(sx + r, y, sz, 0.14, 0.05, r * 2, c); } }
        kids.forEach((o, k) => { const w = ways[s][k], out = 1.1 + k * 0.1, go = out + 0.3, car = byCar(s, k), speed = 3.6;
          if (car) { const r = roads[s][k - 6], a = autos[k - 6], cgo = go + 0.55, cu0 = clamp((e - cgo) * 6.2 / r.len), cu = rewind(back, cu0);
            // where the school is too far, the child waits, a car pops up beside the home and the child hops in
            o.visible = e > out && e < cgo && back <= 0; if (o.visible) { o.position.set(doors[k][0], hop(e - cgo + 0.3, 0.5, 300), doors[k][1]); o.scale.setScalar(Math.max(0.01, springAt(e, out, SPRING.pop))); }
            a.visible = e > cgo - 0.35 && back < 0.999; stand(a, r.pts, cu, 0, 0, a.visible); a.position.y += hop(e - 5.0 - (k - 6) * 0.12, 0.3, 300); a.scale.setScalar(1.25 * Math.max(0.01, springAt(e, cgo - 0.35, SPRING.bouncy)) * (1 - span(back, 0.85, 1))); lines(r.pts, r.len, cu); return; }
          const u0 = clamp((e - go) * speed / w.len), u = rewind(back, u0); stand(o, w.pts, u, S.t, k, e > out && back < 1); o.scale.setScalar(Math.max(0.01, springAt(e, out, SPRING.pop)));
          if (u0 >= 1 && back <= 0) { o.rotation.y = Math.PI / 2; o.position.y += hop(e - go - w.len / speed, 0.4, 300) + (s === 2 ? hop(e - 4.9 - k * 0.06, 0.45, 300) : 0); } dots(w.pts, w.len, u, o.c); });
      });
      if (S.li === 5) R.town.stroll = false;
    };
  })();

  const V2 = new THREE.Color(), LEVELS = [L1, L2, L3, L4, L5, L6], NONE = { a: -1, f: -1, e: -1 };
  return function update(S) {
    const R = { night: 0, dim: 0, town: {} };
    // every level's pieces are placed on every frame; the levels that are not on the screen get plans that are not there
    LEVELS.forEach((fn, li) => fn(li === S.li ? S : { li: -1, t: S.t, u: -1, clear: -1, wild: S.wild, plans: [NONE, NONE, NONE] }, li === S.li ? R : { night: 0, dim: 0, town: {} }));
    flush(); return R;
  };
}
