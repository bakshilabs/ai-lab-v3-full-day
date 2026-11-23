// A home made like a dollhouse (owner, 23 Nov 2026): three floors and an attic under the roof, fully furnished, with a
// front wall of two leaves on hinges that swing open, so that the child can look at the life inside. The same model is
// used for the family's home, which the child builds layer by layer, and for Florence's three sample homes, which
// arrive complete and are furnished more simply.
// The child never places furniture (owner, 23 Nov 2026): it is all there when the front wall opens.
// Inside there is a heater on the ground floor. Its warm air is drawn as small orange blocks that rise up the stairs.
// They stay under the roof when it is insulated and leave through the top when it is not. Warm and cold can be seen
// without colour: by where the warm air goes, by who sleeps in bed and who stands shivering by the heater, by a small
// snowflake over a cold person's head and by the letter Z over a sleeper.
import { THREE, blk, group, soft, fig, frame, hash } from '../kit-v2.js';
export const FH = 2.8, SL = 0.25, Y0 = 0.3, STEP = FH + SL, YF = [Y0, Y0 + STEP, Y0 + 2 * STEP], TOP = Y0 + 3 * FH + 2 * SL, YA = TOP + SL, AH = 2.3;
const WOOD = '#b9834a', INS = '#f6d77a', BOARD = '#e6c992', GLASS = '#a9d3ee', TI = [0.02, 0.3, 0.6];
const NIGHT = { g: ['#ffd27a', 0.3], f: ['#e3c9a4', 0.17], p: ['#7fa0d8', 0.22] }, LEAK = { g: 0, f: 0.34, p: 0.78 };
// The outside of a wall is drawn from a small picture that repeats: bricks in courses, or boards. A box that uses it is given a size of its own, so that the bricks stay the same size on every wall
const TEX = {}; export function wallMat(kind) { if (TEX[kind]) return TEX[kind]; const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d');
  if (kind === 'brick') { x.fillStyle = '#ead8c0'; x.fillRect(0, 0, 128, 64); for (let r = 0; r < 2; r++) for (let k = -1; k < 2; k++) { x.fillStyle = ['#c9775a', '#bb6b4f', '#d08467'][(k + 1 + r * 2) % 3]; x.fillRect(k * 64 + r * 32 + 2, r * 32 + 2, 60, 28); } }
  else { x.fillStyle = '#d9b684'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#c39b67'; for (let r = 0; r < 2; r++) { x.fillRect(0, r * 32, 128, 3); x.fillRect(r * 64 + 20, r * 32, 2, 32); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return (TEX[kind] = new THREE.MeshLambertMaterial({ map: t })); }
export function texBox(parent, x, z, w, d, y, h, mat) { const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) { const f = Math.floor(i / 4); uv.setXY(i, uv.getX(i) * (f < 2 ? d : w) / 2, uv.getY(i) * (f === 2 || f === 3 ? d : h) / 0.8); }
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }
// How tall a home is, to the top of its roof
export const homeTop = (insLevel) => YA + AH + 0.25 + TI[insLevel || 0] + 0.85;

// o: brick (a brick home; otherwise timber), ins (insulation: 0 none, 1 some, 2 a lot), w, d (size), roofC, doorC, M (makes a lit material), tw (a change over time),
// people (what each person looks like), done (arrives complete and furnished), simple (fewer pieces of furniture), wins (which two of the five window places have a big window), sunny (says whether the sun reaches a window)
export function makeHome(parent, o) {
  const g = group(parent), w = o.w, d = o.d, brick = !!o.brick, noIns = !o.ins, ti = TI[o.ins || 0], BR = 0.5, T = (brick ? BR + 0.08 : 0.42) + ti, OPEN = o.open || 1.72, lam = (c) => o.M(c, 0, { raw: true }), flat = (c) => new THREE.MeshBasicMaterial({ color: c });
  const wood = lam(WOOD), ins = flat(INS), lining = flat('#f6eedc'), outer = wallMat(brick ? 'brick' : 'plank'), white = lam('#fbfbf7'), board = lam(BOARD), vis = !!o.done;
  const m = { g, w, d, T, ti, brick, wallM: outer, walls: [[], [], []], spots: [], people: [], heat: { stage: vis ? 3 : 0, leak: [0.78, 0.23, 0][o.ins || 0], top: YA + AH }, lv: null };
  blk(g, 0, 0, w + 0.8, d + 0.8, 0, Y0, '#d9d2c2', { mat: lam('#d9d2c2') }); blk(g, 0, 0, w - 0.1, d - 0.1, Y0, 0.05, BOARD, { mat: board, shadow: false });
  // A timber wall: the frame of posts is on the inside, then the insulation, then boards outside. A brick wall has no posts: thick bricks laid in courses stand outside,
  // the insulation goes against their inside face, and a pale inside wall face covers the lower part of it, so that the insulation can still be seen above
  const layers = (q, pg, len, hh, x0 = 0, y0 = 0) => { q.fr = q.fr || group(pg); q.pn = q.pn || group(pg); q.il = q.il || group(pg); const n = Math.max(2, Math.round(len / 1.9)), zf = -0.2 - ti - 0.11, zi = brick ? -BR - ti / 2 : -0.2 - ti / 2;
    if (brick) texBox(q.fr, x0, -BR / 2, len, BR, y0, hh, outer); else { for (let k = 0; k <= n; k++) blk(q.fr, x0 - len / 2 + 0.16 + k * (len - 0.32) / n, zf, 0.26, 0.2, y0, hh, WOOD, { mat: wood }); for (const y of [0, hh - 0.26]) blk(q.fr, x0, zf, len - 0.3, 0.2, y0 + y, 0.26, WOOD, { mat: wood, shadow: false }); texBox(q.pn, x0, -0.1, len, 0.2, y0, hh, outer); }
    blk(q.il, x0, zi, len, ti, y0, hh, INS, { mat: ins, shadow: false }); if (brick) { blk(q.pn, x0, zi - ti / 2 - 0.04, len - 0.04, 0.08, y0, hh * 0.6, '#f6eedc', { shadow: false, mat: lining }); blk(q.pn, x0, zi - ti / 2 - 0.06, len - 0.04, 0.14, y0 + hh * 0.6, 0.1, '#fbfbf7', { shadow: false, mat: white }); }
    q.fr.visible = q.pn.visible = vis; q.il.visible = vis && !noIns; q.n = vis ? 3 : 0; return q; };
  // three walls on each of the three floors
  const defs = [{ x: 0, z: -d / 2, len: w - 2 * T, ry: Math.PI }, { x: -w / 2, z: -T / 2, len: d - T, ry: -Math.PI / 2 }, { x: w / 2, z: -T / 2, len: d - T, ry: Math.PI / 2 }];
  for (const f of [0, 1, 2]) defs.forEach((def, i) => { const hh = f < 2 ? STEP : FH, wg = group(g, def.x, YF[f], def.z); wg.rotation.y = def.ry; const q = layers({ def, f, i, wg, hh }, wg, def.len, hh);
    if (!vis) { q.mark = frame(wg, 0, 0.15, -T - 0.12, def.len - 0.5, hh - 0.4, true); q.mark.visible = false; } m.walls[f].push(q); });
  // the two floors between, each with a gap for the stairs along the back wall, and the attic floor, with a hatch and a ladder
  const zs = -d / 2 + T + 0.65, zb = -d / 2 + T, zh = zb + 1.4, xl = -w / 2 + T, xr = w / 2 - T, zfi = d / 2 - T, sx0 = 0.1 * w, sx1 = Math.min(sx0 + 3.2, xr - 0.1), hx1 = sx1 + 0.5, lx = Math.min(hx1 + 0.35, xr - 0.4), hxa = Math.min(0.2 * w, 0.28 * w - 0.9), mx = (sx0 + sx1) / 2;
  const piece = (pg, a, b, c, e, y = 0) => { if (b - a > 0.05 && e - c > 0.05) blk(pg, (a + b) / 2, (c + e) / 2, b - a, e - c, y, SL, BOARD, { mat: board }); };
  m.slabs = [1, 2].map((f) => { const slab = group(g, 0, YF[f] - SL, 0); slab.userData.y = YF[f] - SL; piece(slab, xl, xr, zh, d / 2 - 0.02); piece(slab, xl, sx0 - 0.2, zb, zh); piece(slab, hx1, xr, zb, zh);
    for (let k = 0; k < 8; k++) blk(slab, sx0 + (k + 0.5) * (sx1 - sx0) / 8, zs, (sx1 - sx0) / 8, 1.1, -FH, (k + 1) * STEP / 8, WOOD, { mat: wood, shadow: false }); slab.visible = vis; return slab; });
  { const slab = group(g, 0, TOP, 0), a = -w / 2 - 0.1, b = w / 2 + 0.1, c = -d / 2 - 0.1, e = d / 2; slab.userData.y = TOP; piece(slab, a, hxa - 0.55, c, e); piece(slab, hxa + 0.55, b, c, e); piece(slab, hxa - 0.55, hxa + 0.55, zb + 1.7, e); piece(slab, hxa - 0.55, hxa + 0.55, c, zb + 0.1);
    for (const sx of [-1, 1]) blk(slab, hxa + sx * 0.32, zb + 0.3, 0.09, 0.09, -FH, FH + SL, WOOD, { mat: wood, shadow: false }); for (let k = 0; k < 5; k++) blk(slab, hxa, zb + 0.3, 0.6, 0.07, -FH + 0.4 + k * 0.52, 0.08, WOOD, { mat: wood, shadow: false }); slab.visible = vis; m.slabs.push(slab); }
  if (!vis) m.slabMarks = m.slabs.map((sl) => { const mk = group(g, 0, sl.userData.y, d / 2 - 0.1); frame(mk, 0, -0.25, 0, w - 2 * T, 0.8, true); mk.visible = false; return mk; });
  // the heater, and its warm air
  const hx = sx0 - 1.15, hz = zb + 0.4, heater = group(g, hx, Y0, hz); blk(heater, 0, 0, 1.3, 0.4, 0.15, 0.95, '#f0ede4', { mat: lam('#f0ede4') }); blk(heater, 0, 0.22, 1.1, 0.05, 0.3, 0.6, '#e2674a', { shadow: false, mat: flat('#e2674a') }); heater.visible = vis; m.heater = heater;
  const puffM = soft('#ff8a4c', 0.88), puffs = []; for (let k = 0; k < 12; k++) { const p = blk(g, 0, 0, 0.34, 0.34, 0, 0.34, '#ff8a4c', { shadow: false, mat: puffM }); p.visible = false; puffs.push(p); }
  // the attic is the roof. It is made in three layers: a frame of beams, insulation, and the cover, which is lowered on ropes
  const ah = 0.28 * w, a1 = ah + 0.26, a2 = a1 + ti, a3 = a2 + 0.25, zbA = -d / 2 + 0.9, zfA = d / 2 - T, zo = zbA - 0.26 - ti, RH = AH + 0.25, rc = o.M(o.roofC, 0);
  const rb = group(g, 0, YA, 0); for (const sx of [-1, 1]) { for (const z of [zbA, (zbA + zfA) / 2, zfA - 0.2]) blk(rb, sx * (ah + 0.13), z, 0.26, 0.26, 0, AH, WOOD, { mat: wood }); blk(rb, sx * (ah + 0.13), (zbA + zfA) / 2, 0.26, zfA - zbA, AH - 0.26, 0.26, WOOD, { mat: wood, shadow: false }); }
  for (let k = 0; k < 5; k++) blk(rb, 0, zbA + k * (zfA - 0.2 - zbA) / 4, 2 * a1, 0.26, AH, 0.25, WOOD, { mat: wood, shadow: false }); blk(rb, 0, zbA - 0.13, 2 * ah, 0.26, 0, 0.26, WOOD, { mat: wood, shadow: false });
  const ri = group(g, 0, YA, 0), I = (x, z, ww, dd, y, h) => blk(ri, x, z, ww, dd, y, h, INS, { mat: ins, shadow: false }); for (const sx of [-1, 1]) { I(sx * (a1 + ti / 2), (zo + zfA) / 2, ti, zfA - zo, 0, RH); I(sx * (a2 + w / 2 + 0.1) / 2, -0.05, w / 2 + 0.1 - a2, d + 0.1, 0, ti); } I(0, zbA - 0.26 - ti / 2, 2 * a1, ti, 0, RH); I(0, (zo + zfA) / 2, 2 * a2, zfA - zo, RH, ti);
  const roof = group(g, 0, YA, 0), R = (x, z, ww, dd, y, h) => blk(roof, x, z, ww, dd, y, h, o.roofC, { mat: rc }); for (const sx of [-1, 1]) { R(sx * (a3 + w / 2 + 0.45) / 2, -0.2, w / 2 + 0.45 - a3, d + 0.5, ti, 0.3); R(sx * (a2 + 0.125), (zo + zfA) / 2, 0.25, zfA - zo, ti, RH); } R(0, zo - 0.125, 2 * a3, 0.25, ti, RH); R(0, -0.05, 2 * a3 + 0.6, d + 0.9, RH + ti, 0.45); R(0, -0.05, a3 * 1.1, d + 0.9, RH + ti + 0.45, 0.4);
  m.ropes = [-0.6 * a3, 0.6 * a3].map((x) => { const r = blk(roof, x, 0, 0.08, 0.08, RH + ti + 0.45, 16, '#2b3a55', { shadow: false }); r.visible = false; return r; }); rb.visible = roof.visible = vis; ri.visible = vis && !noIns; Object.assign(m, { rb, ri, roof, yr: YA });
  if (!vis) { m.roofMark = group(g, 0, YA, 0); frame(m.roofMark, 0, 0.1, d / 2 + 0.25, 2 * a3 + 0.4, AH + 0.2, true, { fill: 0.45 }); m.roofMark.visible = false; }
  // the front wall: two leaves on hinges at the corners, each with half of the front of the attic. The door and the front windows are in the leaves
  const HT = TOP - Y0, GH = RH + ti, leaves = [-1, 1].map((sx) => { const lg = group(g, sx * w / 2, Y0, d / 2), q = layers({ lg, sx }, lg, w / 2, HT, -sx * w / 4); layers(q, lg, a3, GH, -sx * (w / 2 - a3 / 2), HT + SL); q.out = brick ? q.fr : q.pn; return q; }); m.leaves = leaves;
  m.openK = 0; m.setOpen = (k) => { m.openK = k; for (const q of leaves) q.lg.rotation.y = q.sx * k * OPEN; };
  if (!vis) { m.frontMark = group(g, 0, Y0, d / 2 + 0.15); frame(m.frontMark, 0, 0.15, 0, w - 0.4, HT - 0.4, true, { fill: 0.3 }); m.frontMark.visible = false; }
  const smallM = flat(GLASS), lampM = flat('#fff3cf'), small = (q, x, y, s) => { const sm = group(q.out), lxx = x - q.sx * w / 2; blk(sm, lxx, -T / 2, s + 0.25, T + 0.1, y - 0.12, s + 0.25, '#fbfbf7', { mat: white, shadow: false }); blk(sm, lxx, -T / 2, s, T + 0.16, y, s, GLASS, { shadow: false, mat: smallM }); return sm; };
  for (const q of leaves) small(q, q.sx * 0.85, HT + SL + 0.75, 0.85);
  const doorX = 0.25 * w, doorMat = new THREE.MeshLambertMaterial({ color: o.doorC }), door = group(leaves[1].lg, doorX - w / 2, 0, 0); blk(door, 0, -T / 2, 1.6, T + 0.12, 0, 2.45, '#fff', { mat: doorMat }); blk(door, -0.5, 0.08, 0.18, 0.1, 1.15, 0.18, '#ffd257', { shadow: false, mat: flat('#ffd257') }); door.visible = vis;
  m.door = door; m.doorMat = doorMat; if (!vis) { m.doorMark = group(g, doorX, Y0, d / 2 + 0.2); frame(m.doorMark, 0, 0, 0, 1.9, 2.7, true); m.doorMark.visible = false; }
  // Five places in the front wall each have a small window. A big window can take the place of two of them. Behind each is a shaft of sunlight, which is shown only if the sun reaches that window
  const shaftM = soft('#fff3a8', 0.15), patchM = flat('#fff3b0');
  for (const [x, f] of [[-0.25 * w, 0], [-0.25 * w, 1], [0.25 * w, 1], [-0.25 * w, 2], [0.25 * w, 2]]) { const lf = leaves[x < 0 ? 0 : 1], y = YF[f] - Y0, sm = small(lf, x, y + 1, 1), p = group(lf.lg, x - lf.sx * w / 2, y + 0.55, 0), gm = flat(GLASS);
    blk(p, 0, -T / 2, 2.25, T + 0.1, 0, 1.85, '#fbfbf7', { mat: white }); blk(p, 0, -T / 2, 1.9, T + 0.18, 0.17, 1.51, GLASS, { shadow: false, mat: gm }); blk(p, 0, -T / 2, 0.12, T + 0.22, 0.17, 1.51, '#fbfbf7', { shadow: false, mat: white }); p.visible = false;
    const q = { p, gm, sm, f, fy: YF[f], at: [x, YF[f], d / 2 - T - 1.35], c: [x, YF[f] + 1.5, d / 2 + 0.3], on: false };
    q.shaft = blk(g, q.at[0], q.at[2], 2, 2.4, q.fy + 0.06, 2.2, '#fff1a0', { shadow: false, mat: shaftM }); q.patch = blk(g, q.at[0], q.at[2], 2.1, 2.5, q.fy + 0.06, 0.04, '#fff1a0', { shadow: false, mat: patchM }); q.shaft.visible = q.patch.visible = false;
    if (!vis) { q.mark = group(g, x, YF[f] + 0.45, d / 2 + 0.22); frame(q.mark, 0, 0, 0, 2.5, 2.1, true); q.mark.visible = false; } m.spots.push(q); }
  // the big window goes in. sunny says whether the sun reaches it
  m.putWindow = (i, sunny) => { const q = m.spots[i]; q.on = true; q.sunny = sunny; q.p.visible = true; q.sm.visible = false; q.shaft.visible = q.patch.visible = sunny; q.gm.color.set(sunny ? '#fff3b0' : GLASS); };
  if (vis) for (const i of o.wins || [0, 4]) m.putWindow(i, o.sunny(m.spots[i]));
  // a soft light in each room at night: warm, or cold
  const glowM = soft('#ffd27a', 0.3), glow = [0, 1, 2].map((f) => blk(g, 0, -T / 2, w - 2 * T, d - T - 0.1, YF[f] + 0.05, FH - 0.1, '#ffd27a', { shadow: false, mat: glowM })); glow.push(blk(g, 0, (zbA + zfA) / 2, 2 * ah, zfA - zbA, YA + 0.05, AH - 0.1, '#ffd27a', { shadow: false, mat: glowM })); for (const q of glow) q.visible = false;

  // ---- the furniture: a kitchen and a table on the ground floor, a sofa and a bath on the first floor, beds on the second floor and a den in the attic ----
  const furn = group(g); furn.visible = vis; m.furn = furn; const full = !o.simple, beds = [];
  const F = (pg, x, z, ww, dd, y, h, c, mat) => blk(pg, x, z, ww, dd, y, h, c, { shadow: false, mat: mat || lam(c) });
  const lamp = (pg, x, z) => { F(pg, x, z, 0.06, 0.06, FH - 0.55, 0.55, '#2b3a55'); F(pg, x, z, 0.6, 0.6, FH - 0.85, 0.32, '#fff3cf', lampM); };
  const chair = (pg, x, z, c, back = -1) => { F(pg, x, z, 0.5, 0.5, 0, 0.45, c); F(pg, x, z + back * 0.21, 0.5, 0.08, 0.45, 0.5, c); };
  // a bed with its head on the left. A sleeper lies on one side, facing the room
  const bed = (pg, x, z, len, dep, c, y, fl) => { F(pg, x, z, len, dep, y, 0.38, WOOD); F(pg, x, z, len - 0.1, dep - 0.1, y + 0.38, 0.2, '#fbfbf7'); F(pg, x - len / 2 + 0.06, z, 0.12, dep, y, 1.05, WOOD); F(pg, x - len / 2 + 0.48, z, 0.5, dep - 0.3, y + 0.58, 0.1, '#ffffff'); F(pg, x + 0.36, z, len - 0.8, dep + 0.04, y + 0.5, 0.44, c); F(pg, x + 0.36, z, len - 0.8, dep + 0.06, y + 0.78, 0.08, '#fbfbf7'); return { x: x + len / 2 - 0.12, y: fl + y + 0.58, z }; };
  const sofa = (pg, x, z, len, c) => { F(pg, x, z, len, 0.9, 0, 0.45, c); F(pg, x, z - 0.36, len, 0.22, 0.45, 0.5, c); for (const sx of [-1, 1]) F(pg, x + sx * (len / 2 - 0.12), z, 0.24, 0.9, 0.45, 0.25, c); F(pg, x - len / 2 + 0.55, z - 0.16, 0.5, 0.16, 0.47, 0.42, '#ffd257'); };
  const plant = (pg, x, z) => { F(pg, x, z, 0.4, 0.4, 0, 0.4, '#c8643f'); F(pg, x, z, 0.7, 0.7, 0.4, 0.6, '#5fb04e'); F(pg, x, z, 0.4, 0.4, 1, 0.35, '#77c765'); };
  const G0 = group(furn, 0, Y0, 0), G1 = group(furn, 0, YF[1], 0), G2 = group(furn, 0, YF[2], 0), G3 = group(furn, 0, YA, 0), tx = full ? xl + 2.7 : xl + 1.5, tz = zfi - 1.5, sfx = full ? xl + 2.8 : xl + 1.3, sfz = zb + 1.5, sflen = full ? 2.6 : 2;
  // Coloured walls go up with the furniture in every room of an insulated home, and leave a band at the top where the insulation can still be seen. A home with no insulation keeps its bare frame
  if (!noIns) [[G0, '#9fd3b4'], [G1, '#f2ab8e'], [G2, '#a3b9ea']].forEach(([pg, c]) => { const h = FH * 0.72; F(pg, 0, zb + 0.03, xr - xl, 0.06, 0, h, c); for (const sx of [-1, 1]) F(pg, sx * (xr - 0.03), (zb + zfi) / 2, 0.06, zfi - zb, 0, h, c); });
  // the ground floor
  F(G0, tx, tz, full ? 2 : 1.5, 1.1, 0.72, 0.1, '#c99a5e'); for (const sx of [-1, 1]) F(G0, tx + sx * (full ? 0.75 : 0.5), tz, 0.14, 0.8, 0, 0.72, '#b9834a'); chair(G0, tx - 0.45, tz - 0.85, '#e0503a', -1); chair(G0, tx + 0.45, tz + 0.85, '#16a3a3', 1); lamp(G0, tx, tz);
  if (full) { chair(G0, tx + 0.45, tz - 0.85, '#e0a23a', -1); chair(G0, tx - 0.45, tz + 0.85, '#3f78b5', 1); F(G0, tx, tz, 0.5, 0.4, 0.82, 0.12, '#fbfbf7'); F(G0, tx - 0.08, tz, 0.16, 0.16, 0.9, 0.14, '#e0503a'); F(G0, tx + 0.1, tz, 0.16, 0.16, 0.9, 0.14, '#e9ad1c'); F(G0, tx, tz, 3, 2.9, 0.06, 0.03, '#f0c9b4');
    const k0 = xl + 0.95, k1 = hx - 0.85, kc = (k0 + k1) / 2, kz = zb + 0.38; F(G0, xl + 0.45, zb + 0.42, 0.8, 0.75, 0, 1.9, '#f4f4ee'); F(G0, xl + 0.75, zb + 0.82, 0.07, 0.06, 0.8, 0.7, '#9aa4b0'); F(G0, kc, kz, k1 - k0, 0.7, 0, 0.85, '#3f78b5'); F(G0, kc, kz, k1 - k0 + 0.06, 0.76, 0.85, 0.08, '#f6eedc'); F(G0, kc + 0.25, kz, 0.6, 0.5, 0.93, 0.03, '#2b3a55'); F(G0, kc + 0.25, kz, 0.34, 0.34, 0.96, 0.2, '#e0503a'); F(G0, kc, zb + 0.2, k1 - k0, 0.36, 1.75, 0.6, '#3f78b5'); F(G0, kc + 1.1, kz, 0.3, 0.3, 0.93, 0.34, '#2e9b5a');
    plant(G0, xr - 0.5, zfi - 2.6); F(G0, xr - 0.12, zfi - 1, 0.1, 1.2, 1.5, 0.1, WOOD); F(G0, xr - 0.22, zfi - 1.3, 0.2, 0.4, 0.9, 0.65, '#e0503a'); F(G0, xr - 0.22, zfi - 0.7, 0.2, 0.4, 1, 0.55, '#3f78b5'); F(G0, xr - 0.3, zfi - 1, 0.5, 1.1, 0, 0.3, WOOD); F(G0, kc - 1, kz, 0.5, 0.4, 0.93, 0.04, '#aab4c0'); F(G0, kc - 1, kz - 0.22, 0.06, 0.06, 0.93, 0.3, '#9aa4b0'); }
  // the first floor
  sofa(G1, sfx, sfz, sflen, '#16a3a3'); lamp(G1, sfx, sfz + 1.2); F(G1, sfx + sflen / 2 + 0.4, sfz - 0.2, 0.08, 0.08, 0, 1.6, '#2b3a55'); F(G1, sfx + sflen / 2 + 0.4, sfz - 0.2, 0.5, 0.5, 1.5, 0.4, '#ffd257', lampM);
  if (full) { F(G1, xl + 0.6, zb + 0.22, 1.1, 0.4, 0, 2.1, WOOD); for (let k = 0; k < 3; k++) F(G1, xl + 0.6, zb + 0.3, 0.9, 0.3, 1.05 + k * 0.33, 0.24, ['#e0503a', '#3f78b5', '#2e9b5a'][k]); F(G1, sfx, sfz + 1.5, 1.2, 0.6, 0, 0.36, '#c99a5e'); F(G1, sfx, sfz + 1.4, 3.2, 2.2, 0.01, 0.03, '#f3d9a0');
    // the cat sleeps on the sofa
    const cx = sfx + sflen / 2 - 0.75, cz = sfz + 0.05; F(G1, cx, cz, 0.5, 0.28, 0.45, 0.22, '#e9963a'); F(G1, cx + 0.3, cz + 0.02, 0.24, 0.24, 0.5, 0.24, '#e9963a'); for (const s of [-1, 1]) F(G1, cx + 0.3 + s * 0.08, cz + 0.02, 0.07, 0.07, 0.74, 0.08, '#e9963a'); F(G1, cx - 0.3, cz, 0.1, 0.1, 0.5, 0.3, '#c97a26');
    // the bath, behind a low wall of tiles
    const bx = xr - 1.25, bz = zfi - 1.35; F(G1, bx, bz, 2.5, 2.7, 0.01, 0.04, '#cfe6ee'); F(G1, bx - 1.3, bz, 0.14, 2.7, 0, 1.3, '#8cc7dc'); F(G1, bx + 0.05, bz - 0.4, 2, 0.95, 0, 0.62, '#fbfbf7'); F(G1, bx + 0.05, bz - 0.4, 1.7, 0.65, 0.58, 0.06, '#6fc3e8', flat('#5fbdf0')); F(G1, bx + 0.9, bz - 0.4, 0.1, 0.1, 0.62, 0.3, '#9aa4b0'); F(G1, bx - 0.3, bz - 0.4, 0.2, 0.16, 0.64, 0.14, '#ffd257', flat('#ffd257'));
    F(G1, xr - 0.32, bz + 0.8, 0.55, 0.6, 0, 0.85, '#fbfbf7'); F(G1, xr - 0.06, bz + 0.8, 0.06, 0.6, 1.2, 0.8, '#a9d3ee', flat('#bfe2f5')); F(G1, bx - 0.5, bz + 0.7, 0.7, 0.5, 0.05, 0.04, '#3f78b5'); lamp(G1, bx, bz); }
  // the second floor: the beds
  if (full) { const bx = xl + 1.5, bz = zb + 1.45, a = bed(G2, bx, bz, 2.7, 1.8, '#3f78b5', 0, YF[2]), cx = xr - 1.25, cz2 = zfi - 0.8, c = bed(G2, cx, cz2, 2.1, 1.05, '#e0503a', 0, YF[2]); beds.push(c, { ...a, z: bz + 0.42 }, { x: a.x - 0.12, y: a.y, z: bz - 0.42 });
    F(G2, cx + 0.36, cz2, 0.4, 1.1, 0.95, 0.02, '#ffd257'); F(G2, sx0 - 0.8, zb + 0.34, 1.2, 0.6, 0, 2.2, '#c99a5e'); F(G2, sx0 - 0.8, zb + 0.65, 0.04, 0.03, 0.1, 2, '#8a6a44'); for (const s of [-1, 1]) F(G2, sx0 - 0.8 + s * 0.12, zb + 0.66, 0.07, 0.05, 1.05, 0.14, '#ffd257'); F(G2, bx + 0.2, bz + 1.6, 2.4, 1.2, 0.01, 0.03, '#d9c7ee'); lamp(G2, bx + 0.4, bz + 0.4); lamp(G2, cx, cz2 - 0.3); F(G2, cx - 1.5, cz2 + 0.2, 0.45, 0.45, 0, 0.5, '#c99a5e'); F(G2, cx - 1.5, cz2 + 0.2, 0.2, 0.2, 0.5, 0.3, '#2e9b5a'); }
  else { const bx = xl + 1.25, bz = zb + 1.3; beds.push(bed(G2, bx, bz, 2.3, 1.05, '#3f78b5', 0, YF[2]), bed(G2, bx, bz, 2.3, 1.05, '#e0503a', 1.28, YF[2])); for (const sx of [-1, 1]) for (const sz of [-1, 1]) F(G2, bx + sx * 1.1, bz + sz * 0.5, 0.12, 0.12, 0, 2.3, WOOD); lamp(G2, bx + 1.9, bz + 0.9); }
  // the attic: a den
  { const zc = (zbA + zfA) / 2; F(G3, ah - 0.75, zc - 0.5, 1.1, 0.6, 0, 0.5, '#e9ad1c'); F(G3, ah - 0.75, zc - 0.5, 1.16, 0.66, 0.5, 0.1, '#c8643f');
    if (full) { F(G3, -ah + 0.85, zc + 0.3, 1.1, 1, 0, 0.45, '#e0503a'); F(G3, -ah + 0.75, zc + 0.15, 0.8, 0.6, 0.45, 0.3, '#e0503a'); F(G3, ah - 0.95, zc - 0.5, 0.36, 0.3, 0.6, 0.36, '#9a6a3c'); F(G3, ah - 0.95, zc - 0.48, 0.3, 0.26, 0.96, 0.26, '#9a6a3c'); for (const s of [-1, 1]) F(G3, ah - 0.95 + s * 0.13, zc - 0.48, 0.09, 0.08, 1.2, 0.09, '#9a6a3c');
      F(G3, 0.2, zc + 1.4, 0.07, 0.07, 0, 1.05, '#2b3a55'); const sc = F(G3, 0.2, zc + 1.55, 0.2, 0.9, 1, 0.2, '#3f78b5'); sc.rotation.x = -0.6; F(G3, 0, zc + 0.5, 2.4, 1.8, 0.01, 0.03, '#bfe3c4'); for (let k = 0; k < 7; k++) F(G3, -ah + 0.5 + k * (2 * ah - 1) / 6, zbA + 0.1, 0.24, 0.05, AH - 0.62 - (k % 2) * 0.08, 0.24, ['#e0503a', '#ffd257', '#3f78b5', '#2e9b5a'][k % 4], flat(['#e0503a', '#ffd257', '#3f78b5', '#2e9b5a'][k % 4]));
      F(G3, -ah + 0.4, zbA + 0.3, 0.5, 0.36, 0, 0.14, '#3f78b5'); F(G3, -ah + 0.42, zbA + 0.3, 0.44, 0.34, 0.14, 0.12, '#2e9b5a'); F(G3, 0, zc, 0.06, 0.06, AH - 0.4, 0.4, '#2b3a55'); F(G3, 0, zc, 0.5, 0.5, AH - 0.66, 0.28, '#fff3cf', lampM); } else F(G3, -ah + 0.8, zc, 0.8, 0.8, 0, 0.7, '#c99a5e'); }

  // night: lv is 'g' (warm), 'f' (a little cold) or 'p' (cold); null is day. A warm person sleeps in bed, and a cold person stands by the heater and shivers
  m.setNight = (lv) => { m.lv = lv; const c = lv ? (lv === 'g' ? '#ffe27a' : NIGHT[lv][0]) : null; smallM.color.set(c || GLASS); lampM.color.set(lv === 'g' ? '#fff0a0' : lv ? '#c9cfdc' : '#fff3cf'); ins.color.set(lv ? { g: '#e6c267', f: '#b3a57c', p: '#8a909c' }[lv] : INS); lining.color.set(lv ? { g: '#f7dfa4', f: '#c9bfa8', p: '#9aa6bb' }[lv] : '#f6eedc'); for (const q of glow) q.visible = !!lv; if (lv) { glowM.color.set(NIGHT[lv][0]); glowM.opacity = NIGHT[lv][1]; m.heat.leak = LEAK[lv]; }
    for (const q of m.spots) if (q.on) { q.shaft.visible = q.patch.visible = !lv && q.sunny; q.gm.color.set(c || (q.sunny ? '#fff3b0' : GLASS)); } if (lv) m.people.forEach((p, k) => { p.cold = lv === 'p' || (lv === 'f' && k === 0); }); if (furn.visible) m.live(lv ? 'night' : 'day'); };
  // the people: each has a place to stand, shivers when cold with a snowflake over the head, and sleeps with a Z over the head
  const stand = [[-0.34 * w, Y0, 0.1 * d], [-0.1 * w, Y0, -0.06 * d], [0.33 * w, Y0, 0.12 * d]], ZM = flat('#2a4a9a');
  (o.people || []).forEach((po, k) => { const pg = group(g, ...stand[k]), bg = group(pg), st = fig(bg, 0, 0.05, 0, po), si = full ? fig(bg, 0, 0, 0, { ...po, sit: true }) : null; if (si) si.visible = false;
    const fl = group(pg, 0, 1.75 * po.k + 0.5, 0), fm = flat('#ffffff'), fb = flat('#4d8fd6'); for (let a = 0; a < 3; a++) { const b = group(fl); b.rotation.z = a * Math.PI / 3; blk(b, 0, 0, 0.8, 0.1, -0.07, 0.14, '#4d8fd6', { shadow: false, mat: fb }); blk(b, 0, 0.03, 0.55, 0.1, -0.035, 0.07, '#fff', { shadow: false, mat: fm }); }
    const zz = [0, 1].map(() => { const z = group(pg); blk(z, 0, 0, 0.36, 0.06, 0.3, 0.08, '#2a4a9a', { shadow: false, mat: ZM }); blk(z, 0, 0, 0.36, 0.06, 0, 0.08, '#2a4a9a', { shadow: false, mat: ZM }); blk(z, 0, 0, 0.44, 0.06, 0.15, 0.08, '#2a4a9a', { shadow: false, mat: ZM }).rotation.z = 0.72; z.visible = false; return z; });
    fl.visible = false; pg.visible = vis; m.people.push({ pg, bg, st, si, fl, zz, k: po.k, pos: [...stand[k]], cold: false, busy: false, hop: 0, mode: 'stand' }); });
  const setMode = (p, at, mode = 'stand') => { p.pos = [...at]; p.mode = mode; p.step = 0; if (p.si) p.si.visible = mode === 'sit'; p.st.visible = mode !== 'sit' || !p.si; p.bg.rotation.z = mode === 'bed' ? Math.PI / 2 : 0; };
  // where everybody is: by day they live in the rooms, and at night they are in bed, or by the heater if they are cold
  m.live = (kind) => { m.people.forEach((p, k) => { if (kind === 'night') { if (p.cold) setMode(p, [hx - 0.9 + k * 0.95, Y0, hz + 1.2 + (k % 2) * 0.45]); else { const b = beds[k % beds.length]; setMode(p, [b.x, b.y + 0.27 * p.k, b.z], 'bed'); } }
    else if (!full) setMode(p, k ? [sfx + sflen / 2 + 0.9, YF[1], sfz + 0.9] : [tx + 1.3, Y0, tz + 0.5]); else if (k === 0) setMode(p, [-0.4, YA, (zbA + zfA) / 2 + 0.7]); else if (k === 1) setMode(p, [sfx - 0.1, YF[1] + 0.47 - 0.42 * p.k, sfz - 0.05], 'sit'); else setMode(p, [(xl + 0.95 + hx - 0.85) / 2 - 0.1, Y0, zb + 1.35]); }); };
  // the furniture is carried in while the front wall is closed, and the family takes its places
  m.furnish = () => { furn.visible = true; for (const p of m.people) p.pg.visible = true; m.live(m.lv ? 'night' : 'day'); };
  // a person walks to a place on any of the three floors, by the stairs if need be
  const floorOf = (y) => Math.max(0, Math.min(2, Math.round((y - Y0) / STEP)));
  m.walk = async (k, f, x, z, sec = 1) => { const p = m.people[k], pts = [[...p.pos]]; let c = floorOf(p.pos[1]); while (c !== f) { const lo = Math.min(c, c < f ? c + 1 : c - 1), a = [[sx0 - 0.3, YF[lo], zs + 1.3], [sx0 - 0.1, YF[lo], zs], [sx1 + 0.2, YF[lo + 1], zs], [lx, YF[lo + 1], zs], [lx, YF[lo + 1], zh + 0.5]]; pts.push(...(c < f ? a : a.reverse())); c += c < f ? 1 : -1; } pts.push([x, YF[f], z]);
    p.busy = true; for (let q = 1; q < pts.length; q++) { const a = pts[q - 1], b = pts[q], len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); await o.tw(Math.max(0.1, len / 4.6 * sec), (t) => { p.pos = a.map((v, i) => v + (b[i] - v) * t); p.step = Math.abs(Math.sin(t * len * 2.2)) * 0.12 * (t < 1); }); } p.busy = false; p.pos = [x, YF[f], z]; };
  m.hop = (k) => { if (m.people[k].mode !== 'bed') m.people[k].hop = 1; };
  m.tick = (t, dt) => { m.people.forEach((p, k) => { p.hop = Math.max(0, p.hop - dt * 1.4); const sh = p.cold && !p.busy, bedded = p.mode === 'bed'; p.pg.position.set(p.pos[0] + (sh ? Math.sin(t * 38 + k) * 0.045 : 0), p.pos[1] + (p.step || 0) + Math.abs(Math.sin(p.hop * Math.PI * 2)) * 0.45, p.pos[2]); p.fl.visible = sh; p.fl.position.set(bedded ? -1.45 * p.k : 0, (bedded ? 0.95 : 1.75 * p.k + 0.5) + Math.sin(t * 3 + k) * 0.06, 0);
      p.zz.forEach((z, i) => { z.visible = bedded && !p.cold; if (!z.visible) return; const u = (t * 0.33 + i * 0.5 + k * 0.3) % 1; z.position.set(-1.5 * p.k + 0.25 + u * 0.5, 0.75 + u * 1.1, 0.3); z.scale.setScalar(0.6 + u * 0.9); }); });
    // the warm air: from the heater to the stairs, up through every floor that is built, and then it stays under the roof or leaves through the top
    const st = m.heat.stage, ceil = m.heat.top - 0.45, n = puffs.length; puffs.forEach((p, k) => { p.visible = st > 0; if (!st) return; const u = (t * 0.13 + k / n) % 1, out = st < 3 || (k + 0.5) / n < m.heat.leak, sway = Math.sin(t * 2 + k * 1.7) * 0.18; let x, y, z, s = 1;
      if (st === 1) { x = hx + sway; y = Y0 + 1.1 + u * (FH + 3.2); z = hz + 0.5; s = 1 - Math.max(0, u - 0.6) / 0.4; }
      else if (u < 0.18) { const e = u / 0.18; x = hx + (mx - hx) * e; y = Y0 + 1.1 + e * (FH - 1.6); z = hz + 0.5 + sway * 0.5; }
      else if (u < 0.66) { const e = (u - 0.18) / 0.48, top = Math.max(0, (e * (ceil - Y0 - FH + 0.5) + Y0 + FH - 0.5 - TOP + 1) / (ceil - TOP + 1)); x = mx + (m.heat.top > TOP + 1 ? (hxa - mx) * Math.min(1, Math.max(0, top)) : 0) + sway; y = Y0 + FH - 0.5 + e * (ceil - Y0 - FH + 0.5); z = hz + 0.5 + e * 1.2; }
      else { const e = (u - 0.66) / 0.34, tx0 = m.heat.top > TOP + 1 ? hxa : mx; if (out) { x = tx0 + sway + (hash(k, 2) - 0.5) * 3 * e; y = ceil + e * 5; z = hz + 1.7; } else { x = tx0 + (k % 2 ? 0.6 : -1.5) * 0.3 * ah * 2 * e + sway; y = ceil - 0.1 * Math.sin(e * 3); z = hz + 1.7 + (hash(k, 5) - 0.3) * 0.4 * d * e; } s = 1 - e * e; }
      p.position.set(x, y, z); p.scale.setScalar(Math.max(0.05, s)); }); };
  if (vis) { m.setOpen(0); m.live('day'); }
  return m; }
