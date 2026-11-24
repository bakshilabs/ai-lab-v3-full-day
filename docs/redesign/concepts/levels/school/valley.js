// Level 6, "A school for everyone": the valley of Eco Town seen as one long strip from the far bank of the river.
// The town is at the left end and the farms are at the right end, with one road and one footpath between them, so that
// "near" and "far" are a plain distance along one line. The camera stays low on the bank and never rises above the roofs.
// This file builds the valley and plays a school morning in it: the bell rings, each child leaves home, and the children
// who live near enough walk while the others are driven. The same morning is used for the test, for the town and for the end.
import { THREE, B, blk, group, fig, M, hash, texBox, tileMat, FAMILY } from '../../level-kit/blocks.js';
import { tw, run, ease, back, hitBox } from '../../level-kit/stage.js';
import { beep, chime } from '../../level-kit/sound.js';
import { AUTUMN, GRASS, INK, flagMat, tree, appleTree, bale, reeds, duck, cloud, home, fence, school, car, tractor, puffs, KIDS, person, leaves } from './parts.js';

export const HOMEX = [-30, -28, -26, -18, -16, -14, 12, 14, 16, 24.5, 26.5, 28.5], BACKROW = new Set([1, 4, 7, 10]);
export const SITEX = [-22, -11, 1, 7.5, 20.25];        // the five places a school can stand: town centre, beside the park, between town and farms, beside the orchard, by the farm houses
export const REACH = 31.2;                             // how far along the valley a child can walk to school
export const walks = (X) => HOMEX.map((x) => Math.abs(x - X) <= REACH);
const KS = 2.15, CS = 1.75, PATHZ = -3.7, ROADZ = -0.9, V = 6.4;
export const VIEWS = { wide: { eye: [-1, 4.6, 75], at: [-1, 7.8, -4], fov: 26 }, cards: { eye: [-1, 5.6, 75], at: [-1, 1.4, -4], fov: 26 }, job: { eye: [15.5, 3.3, 24], at: [15, 4.1, -8], fov: 33 } };

export function buildValley(s) { const g = s.g, G = (hex) => tileMat('grass', hex);
  // small things that answer a tap, for a child who looks around: the ducks quack, the weathercock spins, trees and hay bales bounce, the barn moos
  const toy = (o, w, h, fn) => { hitBox(s, o, 0, 0, 0, w / o.scale.x, h / o.scale.y, w / o.scale.x, () => !s.busTick, () => fn(o)); return o; }, boing = (o, k = 0.16) => { const k0 = o.userData.k0 ??= o.scale.y; tw(0.6, (t) => { o.scale.y = k0 * (1 + Math.sin(t * Math.PI * 3) * k * (1 - t)); }); };
  const quack = (o) => { const k0 = o.userData.k0 ??= o.scale.x; tw(0.45, (t) => o.scale.setScalar(k0 * (1 + Math.sin(t * Math.PI) * 0.5))); beep(520, 0.07, 'square', 0.04); setTimeout(() => beep(410, 0.1, 'square', 0.04), 90); }, rustle = (o) => { boing(o); beep(900, 0.05, 'triangle', 0.04); beep(1200, 0.07, 'triangle', 0.03); }; let spin = 0;
  // ---- the ground, the river and the two banks ----
  texBox(g, 0, -49.5, 240, 101, -1, 1, G(GRASS), 5, 5); B(g, 0, 31, 240, 62, -1.3, 1.05, '#2b7fd8'); B(g, 0, 1.1, 240, 0.5, -1, 0.9, '#b79a62');
  texBox(g, 0, 80, 240, 34, -1, 2.2, G('#7ab045'), 5, 5);
  const streaks = []; for (let k = 0; k < 46; k++) streaks.push(B(g, -70 + hash(k, 1) * 140, 3 + hash(k, 2) * 56, 2 + hash(k, 3) * 6, 0.22, -0.24, 0.03, k % 3 ? '#6db6f2' : '#bfe3ff', { unlit: true, raw: true, shadow: false }));
  for (let k = 0; k < 40; k++) reeds(g, -52 + k * 2.7 + hash(k, 5) * 1.6, 0.9, -0.2, 3);
  const ducks = [duck(g, 9, -0.25, 34, 2.2), duck(g, 12.5, -0.25, 36.5, 1.5), duck(g, -24, -0.25, 12, 1.5)]; for (const q of ducks) toy(q, 5, 3.4, quack);
  // ---- the road and the footpath ----
  B(g, 0, ROADZ, 240, 2.6, 0, 0.06, '#8d9299'); for (let x = -80; x < 80; x += 3) B(g, x, ROADZ, 1.3, 0.14, 0.06, 0.02, '#e9e6dc', { shadow: false });
  texBox(g, 0, PATHZ, 240, 1.4, 0, 0.1, tileMat('pave', '#f3dfae'), 1.4, 1.4);
  // ---- the homes of the twelve children, six in the town and six by the farms, and a few more homes at the edge of the town ----
  const doors = HOMEX.map((x, i) => { const h = home(g, x, BACKROW.has(i) ? -12.5 : -8, i, { farm: i >= 6 }); if (!BACKROW.has(i)) B(g, x + 0.65, -5.6, 0.9, 2.0, 0, 0.06, '#e8d9bd', { shadow: false }); return h.door; });
  [-34.5, -38, -41.5, -45.5, -36.3, -43].forEach((x, k) => home(g, x, k > 3 ? -12.5 : -8, k + 2));
  fence(g, -47, -12.9, -5, [...HOMEX.slice(0, 6).filter((_, i) => !BACKROW.has(i)).map((x) => x + 0.65), -22.4, -21.6, -22, -34, -37.4, -41, -45], '#fffaf0', 0.8);
  fence(g, 10.4, 30.4, -5, [12.65, 16.65, 25.15, 29.15, 19.8, 20.25, 20.7], '#b98a5a', 0.8);
  // ---- the town behind: tall homes, the shops and the clock tower with its weathercock ----
  const TALL = ['#f4e3c4', '#f2d2c0', '#dfe8f0', '#f6ecd2', '#ead7e2'];
  for (let k = 0; k < 13; k++) { const x = -50 + k * 3.3, h = 7 + hash(k, 9) * 6, z = -18 - (k % 2) * 4, w = 3.1; B(g, x, z, w, 4, 0, h, TALL[k % 5]); B(g, x, z, w + 0.3, 4.3, h, 0.5, ['#c9502f', '#8a5a44', '#3f78b5'][k % 3], { tex: 'tile' });
    for (let r = 0; r < Math.floor((h - 1.5) / 2.2); r++) for (const a of [-0.75, 0.75]) B(g, x + a, z + 2.02, 0.8, 0.06, 1.6 + r * 2.2, 1.2, '#bfe3ff', { tex: 'win', shadow: false }); }
  const tower = group(g, -22, 0, -19.5); B(tower, 0, 0, 3.2, 3.2, 0, 13, '#f7e6c0', { tex: 'board' }); B(tower, 0, 1.63, 2.1, 0.08, 9.6, 2.1, '#fffaf0'); B(tower, 0, 1.68, 0.14, 0.05, 10.6, 0.8, INK, { shadow: false }); B(tower, 0.3, 1.68, 0.6, 0.05, 10.55, 0.14, INK, { shadow: false });
  B(tower, 0, 0, 3.8, 3.8, 13, 0.6, '#3f78b5', { tex: 'tile' }); B(tower, 0, 0, 2.6, 2.6, 13.6, 0.7, '#3f78b5', { tex: 'tile' }); B(tower, 0, 0, 1.4, 1.4, 14.3, 0.7, '#3f78b5', { tex: 'tile' }); B(tower, 0, 0, 0.14, 0.14, 15, 1.5, INK); toy(tower, 4.5, 17.5, () => { spin = 3; chime(); });
  const cock = group(tower, 0, 16.5, 0); B(cock, 0.1, 0, 1.5, 0.08, 0, 0.14, '#ffc23a', { raw: true }); B(cock, -0.5, 0, 0.5, 0.08, 0.14, 0.45, '#ffc23a', { raw: true }); B(cock, 0.75, 0, 0.3, 0.08, -0.12, 0.38, '#ffc23a', { raw: true });
  [-25.6, -18.4].forEach((x, k) => { B(g, x, -16, 3.4, 3, 0, 5.2, ['#f2c9a2', '#dfe6c8'][k], { tex: 'board' }); B(g, x, -14.3, 3.4, 0.9, 2.5, 0.3, ['#e23b2e', '#2e9b5a'][k], { tex: 'stripe' }); B(g, x, -14.48, 2.6, 0.06, 0.4, 1.9, '#bfe3ff', { tex: 'pane' }); B(g, x, -16, 3.7, 3.3, 5.2, 0.5, '#8a5a44', { tex: 'tile' }); });
  for (const [x, z, h, c] of [[-32.2, -6.4, 4.2, 0], [-24.2, -13.6, 5, 2], [-20, -13.8, 4.6, 1], [-12.4, -11.5, 5.4, 3], [-39.6, -6.6, 4.4, 2], [-47, -9, 6, 0]]) tree(g, x, z, h, AUTUMN[c]);
  // ---- the park at the edge of the town ----
  texBox(g, -5.8, -10.5, 5.6, 9.4, 0, 0.08, G('#9bd45c'), 3, 3); toy(tree(g, -7.6, -13, 6.4, AUTUMN[1]), 3.4, 6.4, rustle); toy(tree(g, -4.2, -14, 7, AUTUMN[2]), 3.6, 7, rustle); toy(tree(g, -3.9, -7.4, 4.6, AUTUMN[0]), 2.6, 4.6, rustle);
  const band = group(g, -6.4, 0, -9.4); B(band, 0, 0, 2.6, 2.6, 0, 0.4, '#fffaf0'); for (const a of [-1, 1]) for (const b of [-1, 1]) B(band, a * 1.1, b * 1.1, 0.16, 0.16, 0.4, 2.2, '#fffaf0'); B(band, 0, 0, 3, 3, 2.6, 0.35, '#2e7f8a', { tex: 'tile' }); B(band, 0, 0, 1.8, 1.8, 2.95, 0.35, '#2e7f8a', { tex: 'tile' });
  B(g, -4.1, -6.5, 1.6, 0.5, 0.35, 0.14, '#b98a5a'); fig(g, -4.3, 0.2, -6.4, { k: 1.7, shirt: '#8a5fc2', sit: true, turn: 0.2, hair: '#dcdcdc', skin: '#c98d5e' });
  // ---- the meadow in the middle, the orchard, and the farms ----
  for (let k = 0; k < 34; k++) B(g, -1.6 + hash(k, 21) * 10, -5.4 - hash(k, 22) * 9, 0.22, 0.22, 0, 0.3, ['#fff', '#ffd257', '#ff8fb8'][k % 3], { raw: true, shadow: false });
  for (let k = 0; k < 8; k++) appleTree(g, 4.2 + (k % 4) * 2.3, -15 - Math.floor(k / 4) * 2.6, 4.6); for (const [x, z, k] of [[-0.6, -15.6, 1.5], [1.6, -16.4, 1.5], [0.5, -14.2, 1.3]]) toy(bale(g, x, z, k), 2.6, 2, (o) => { boing(o, 0.3); beep(240, 0.08); });
  const barn = group(g, 20.4, 0, -17.5); B(barn, 0, 0, 6.4, 4.4, 0, 4.6, '#c9402e', { tex: 'board' }); B(barn, 0, 0, 7, 5, 4.6, 0.7, '#7a3528', { tex: 'tile' }); B(barn, 0, 0, 5, 5, 5.3, 0.7, '#7a3528', { tex: 'tile' }); B(barn, 0, 0, 2.8, 5, 6, 0.6, '#7a3528', { tex: 'tile' }); B(barn, 0, 2.22, 2.4, 0.08, 0, 3, '#fffaf0'); B(barn, 0, 2.26, 2.0, 0.06, 0, 2.8, '#8a3f2a', { tex: 'stripe' }); B(barn, 0, 2.22, 1.2, 0.08, 3.5, 0.8, '#fffaf0'); toy(barn, 7, 6.6, (o) => { boing(o, 0.06); beep(150, 0.5, 'sawtooth', 0.05); });
  B(g, 25.6, -18, 2, 2, 0, 9, '#e9e4d6', { tex: 'stripe' }); B(g, 25.6, -18, 2.3, 2.3, 9, 0.5, '#9aa1ab'); B(g, 25.6, -18, 1.4, 1.4, 9.5, 0.5, '#9aa1ab');
  for (let k = 0; k < 9; k++) B(g, 34 + (k % 3) * 2.2 + hash(k, 2), -7 - Math.floor(k / 3) * 1.8, 0.8, 0.8, 0, 0.6, '#f08a24', { raw: true }); for (let k = 0; k < 7; k++) bale(g, 31 + hash(k, 31) * 16, -14 - hash(k, 32) * 5, 1.5);
  const tr = tractor(g, 36, -12.4); tr.scale.setScalar(1.7); tr.rotation.y = 0.4; fig(g, 33, 0, -11, { k: 1.8, shirt: '#3f78b5', hat: '#e9c04e', turn: 0.3, arms: ['up', 'down'] });
  for (const [x, z, h, c] of [[10.2, -7, 4.6, 0], [18.6, -13, 5.6, 2], [21.6, -6.6, 4.2, 1], [30.6, -7.2, 5, 3], [40, -9, 6, 0], [45, -7, 5, 4], [9, -12, 5, 5]]) tree(g, x, z, h, AUTUMN[c]);
  // ---- the land behind: fields in strips, hedges, woods in autumn colours and far hills ----
  const FIELD = ['#e9c04e', '#b7c94f', '#c98a4a', '#8fbe45', '#f0d06a', '#a9b842'];
  texBox(g, 0, -30, 240, 12, 0, 2.2, G('#93c450'), 5, 5); for (let k = 0; k < 22; k++) { const x = -5 + k * 5.2 + hash(k, 3) * 2; if (x > 6) B(g, x, -27, 4.6, 5, 2.2, 0.12, FIELD[k % 6], { tex: 'stripe', shadow: false }); B(g, -62 + k * 6, -24.1, 5.5, 0.6, 0, 2.2 + (k % 2) * 0.5, '#5f9a3c', { tex: 'leaf' }); }
  for (let k = 0; k < 30; k++) tree(g, -60 + k * 4.3 + hash(k, 4) * 2, -29 - hash(k, 5) * 4, 5 + hash(k, 6) * 3.4, AUTUMN[Math.floor(hash(k, 7) * 6)]).position.y = 2.2;
  texBox(g, 0, -47, 260, 14, 0, 6.2, G('#a3c657'), 6, 6); for (let k = 0; k < 16; k++) B(g, -70 + k * 9.4 + hash(k, 8) * 3, -41, 7.5, 2, 2.4, 3.9, FIELD[(k + 2) % 6], { tex: 'stripe', shadow: false });
  for (let k = 0; k < 34; k++) tree(g, -80 + k * 4.9 + hash(k, 9) * 2, -46 - hash(k, 10) * 5, 6 + hash(k, 11) * 4, AUTUMN[Math.floor(hash(k, 12) * 5)]).position.y = 6.2;
  B(g, -10, -70, 300, 20, 0, 12, '#98b96a'); for (let k = 0; k < 30; k++) B(g, -110 + k * 7.6, -62, 6 + hash(k, 13) * 3, 4, 12, 2 + hash(k, 14) * 3.4, AUTUMN[Math.floor(hash(k, 15) * 5)], { tex: 'leaf', shadow: false });
  B(g, 30, -110, 380, 30, 0, 19, '#9db7a6', { shadow: false }); B(g, -60, -150, 300, 30, 0, 27, '#a9c2d2', { shadow: false }); B(g, 90, -150, 160, 30, 0, 23, '#b3cadb', { shadow: false });
  [[-46, 33, -150, 1.6], [-8, 37, -160, 2.1], [38, 31, -150, 1.4], [66, 36, -160, 1.8]].forEach(([x, y, z, k]) => cloud(g, x, y, z, k));
  const blow = leaves(g, 70, { w: 96, size: 0.42, y: 0.4, h: 6, z0: -9, zd: 11, speed: 1.6 });

  // ---- the five places for a school. Only the ones that belong to Florence's plans are shown ----
  const schools = SITEX.map((x) => { const sc = school(g, x, -13.5); sc.scale.setScalar(1.45); sc.visible = false; sc.yard = group(sc, 0, 0, 0); for (const a of [-1, 1]) { B(sc.yard, a * 4.3, 3.2, 0.2, 5.6, 0, 0.9, '#fffaf0'); B(sc.yard, a * 2.6, 6, 3.4, 0.18, 0, 0.9, '#fffaf0'); B(sc.yard, a * 0.8, 6, 0.3, 0.3, 0, 1.5, '#d2553a'); } B(sc.yard, 0, 3.6, 8.6, 5, 0, 0.07, '#f3dfae', { tex: 'pave', shadow: false }); return sc; });
  const rise = (i, k) => { schools[i].visible = k > 0.01; schools[i].body.scale.y = Math.max(0.01, k); schools[i].yard.scale.y = Math.max(0.01, Math.min(1, k * 2)); };
  // a small flag marks each place before a school stands there
  const pins = SITEX.map((x) => { const p = group(g, x, 0, -8.6); B(p, 0, 0, 0.16, 0.16, 0, 4.2, '#fffaf0'); B(p, 0.62, 0, 1.2, 0.06, 3.3, 0.85, '#ffdf3d', { unlit: true, raw: true }); B(p, 0, 0, 2.4, 2.4, 0, 0.07, '#ffdf3d', { unlit: true, raw: true, shadow: false }); p.visible = false; return p; });
  // the rings of sound that spread from the bell
  const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.965, 1, 72), new THREE.MeshBasicMaterial({ color: '#ffd257', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); m.visible = false; g.add(m); return m; });

  // ---- the children, the family's grown-ups at their gate, and the cars ----
  const kids = KIDS.map((o, i) => { const p = person(g, o); p.scale.setScalar((o.k || 1) * KS); p.home = HOMEX[i]; p.visible = false; return p; });
  const grown = [fig(g, 13.7, 0.1, -5.0, { ...FAMILY[1], k: 1.28 * KS, turn: -0.15, arms: ['down', 'up'] }), fig(g, 10.6, 0.1, -5.1, { ...FAMILY[2], k: 1.33 * KS, turn: 0.2, arms: ['up', 'down'] })];
  const cars = [0, 1, 2, 3, 4, 5].map((n) => { const c = car(g, 0, 0, n); c.scale.setScalar(CS); B(c.kid, 0, 0, 0.42, 0.42, 0, 0.42, '#f1c9a0'); B(c.kid, 0, 0, 0.46, 0.46, 0.34, 0.12, '#3a2a1c'); c.visible = false; return c; }), smoke = puffs(g, 60);
  const marks = group(g, 0, 0, 0);

  // ---- one school morning. plan(X, { bus }) works out who walks and who is driven, and gives at(t), which poses everything at second t ----
  function plan(X, o = {}) { const walk = walks(X), who = HOMEX.map((x, i) => ({ i, x, d: Math.abs(x - X), side: x >= X ? 1 : -1, walk: walk[i] }));
    for (const side of [-1, 1]) { const w = who.filter((q) => q.walk && q.side === side).sort((a, b) => b.d - a.d), far = w.length ? w[0].d : 0; w.forEach((q, r) => { q.ts = o.bus ? 0.5 + (far - q.d) / V + r * 0.3 : 0.6 + q.d / 30; }); }
    const cs = who.filter((q) => !q.walk).sort((a, b) => a.d - b.d); cs.forEach((q, j) => { q.car = cars[j]; q.ts = 0.7 + q.d / 30; q.stop = X + q.side * (4 + 5.3 * j); q.x0 = q.x - 0.4; q.dur = Math.abs(q.x0 - q.stop) / 11 + 0.7; q.arr = q.ts + 1.3 + q.dur + 0.5; });
    for (const q of who) if (q.walk) q.arr = q.ts + q.d / V + 0.5;
    const order = [...who].sort((a, b) => a.arr - b.arr); order.forEach((q, a) => { q.sx = X + ((a % 6) - 2.5) * 1.3; q.sz = -5.7 - Math.floor(a / 6) * 1.5; if (q.walk) { q.t1 = q.ts + Math.abs(q.x - q.sx) / V; q.arr = q.t1 + 0.5; } });
    const T = Math.max(...who.map((q) => q.arr)) + 0.9, bx = X, by = 9.6, sc = schools[SITEX.indexOf(X)];
    function at(t) { for (const [k, m] of rings.entries()) { const r = (t - 0.25 - k * 0.42) * 30; m.visible = r > 0 && r < 62; if (m.visible) { m.position.set(bx, by, -11); m.scale.setScalar(r); m.material.opacity = 0.85 * Math.max(0, 1 - r / 62); } }
      if (sc) sc.bell.rotation.z = Math.sin(t * 9) * 0.55 * Math.max(0, 1 - t / 3.2);
      for (const q of who) { const p = kids[q.i], door = doors[q.i]; door.scale.x = t > q.ts - 0.35 ? 0.16 : 1; p.vest.visible = !!o.bus && q.walk; p.scale.setScalar((KIDS[q.i].k || 1) * KS);
        if (q.walk) { p.visible = t >= q.ts || q.i === 6; if (t < q.ts) { p.position.set(q.x + 0.65, 0.1, -4.9); p.rotation.y = 0; p.stride(0, 0); }
          else if (t < q.t1) { const x = q.x + (q.sx - q.x) * (t - q.ts) / (q.t1 - q.ts); p.position.set(x, 0.1 + Math.abs(Math.sin(x * 2.2)) * 0.1, PATHZ); p.rotation.y = q.sx > q.x ? Math.PI / 2 : -Math.PI / 2; p.stride(x * 2.2); }
          else { const k = ease(Math.min(1, (t - q.t1) / 0.5)); p.position.set(q.sx, 0.1, PATHZ + (q.sz - PATHZ) * k); p.rotation.y = k < 1 ? Math.PI : 0; p.stride(k * 6, k < 1 ? 1 : 0); } }
        else { const c = q.car, a = t - q.ts; c.visible = a > 0; c.run = a > 0; p.visible = q.i === 6 && a <= 0; if (a <= 0) { p.position.set(q.x + 0.65, 0.1, -4.9); p.rotation.y = 0; }
          c.scale.setScalar(CS * (a < 1 ? 0.3 + 0.7 * ease(Math.max(0, a)) : 1)); if (a > 0 && a < 1) { c.position.set(q.x0, 0, -5.6 + (ROADZ + 5.6) * ease(a)); c.rotation.y = Math.PI / 2; }
          else if (a >= 1) { const u = Math.min(1, (a - 1.3) / q.dur), e = u <= 0 ? 0 : 1 - Math.pow(1 - u, 2.2); c.position.set(q.x0 + (q.stop - q.x0) * e, 0, ROADZ); c.rotation.y = (q.side > 0 ? Math.PI : 0) + (q.side > 0 ? -1 : 1) * (Math.PI / 2) * (1 - ease(Math.min(1, (a - 1) / 0.3))); }
          c.kid.visible = t < q.arr - 0.4; if (t >= q.arr - 0.4) { const k = Math.min(1, (t - q.arr + 0.4) / 0.4); p.visible = true; p.position.set(q.sx, 0.1, q.sz); p.rotation.y = 0; p.scale.setScalar((KIDS[q.i].k || 1) * KS * Math.max(0.01, back(k))); p.stride(0, 0); } } }
      return order.filter((q) => q.arr <= t).map((q) => (q.walk ? 'shoe' : 'car')); }
    return { at, T, who, order, kinds: order.map((q) => (q.walk ? 'shoe' : 'car')), walkers: who.filter((q) => q.walk).length }; }
  let now = null;   // the morning that is on show, so that the cars in it keep puffing
  const clear = () => { now = null; for (const p of kids) p.visible = false; kids[6].visible = true; kids[6].position.set(12.65, 0.1, -4.9); kids[6].rotation.y = 0; kids[6].vest.visible = false; kids[6].stride(0, 0); for (const c of cars) { c.visible = false; c.run = false; } for (const d of doors) d.scale.x = 1; for (const m of rings) m.visible = false; smoke.clear(); marks.clear(); };
  // plays a morning and gives the kinds of badge in the order of arrival; onBadge is called whenever another child has arrived
  async function morning(X, o = {}) { const me = run, p = plan(X, o); now = p; let n = -1; await tw(p.T, (k) => { if (me !== run) return; const list = p.at(k * p.T); if (list.length !== n) { n = list.length; if (o.onBadge) o.onBadge(list); } }); return p; }
  const settle = (X, o = {}) => { const p = plan(X, o); now = p; p.at(p.T); return p; };
  // the mark the choice leaves: a walking bus stop in the child's colour at the gate of every child who walks
  const stops = (X) => { marks.clear(); walks(X).forEach((w, i) => { if (!w) return; const x = HOMEX[i] - 0.9; B(marks, x, -4.75, 0.14, 0.14, 0, 2.5, '#fffaf0'); blk(marks, x, -4.75, 0.95, 0.1, 2.5, 0.95, '#fff', { mat: flagMat }); }); };
  clear();
  let pt = 0; const tick = (t, dt) => { blow(t, 0); spin = Math.max(0, spin - dt); cock.rotation.y += dt * (1.6 + spin * 9); ducks.forEach((d, k) => { d.position.x += dt * 0.5 * (k === 2 ? -1 : 1); d.position.y = -0.25 + Math.sin(t * 2 + k) * 0.04; }); for (const [k, m] of streaks.entries()) { m.position.x += dt * (0.8 + (k % 5) * 0.2); if (m.position.x > 75) m.position.x = -75; }
    for (const sc of schools) sc.flag.rotation.y = Math.sin(t * 5 + sc.position.x) * 0.25; grown.forEach((p, k) => { p.position.y = 0.1 + Math.abs(Math.sin(t * 2.4 + k)) * 0.07; });
    smoke.tick(dt); pt += dt; if (pt > 0.42) { pt = 0; for (const c of cars) if (c.visible && c.run) { const a = c.rotation.y; smoke.emit(c.position.x - Math.cos(a) * 2.4, 0.9, c.position.z + Math.sin(a) * 2.4 + 0.2, 1.5); } } };
  return { schools, rise, pins, kids, cars, grown, plan, morning, settle, clear, stops, tick, marks }; }
