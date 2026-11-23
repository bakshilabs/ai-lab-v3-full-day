// A home with two floors, made like a dollhouse (owner, 23 Nov 2026): the front wall is two leaves on hinges that swing
// open, so that the child can look at the life inside. The same model is used for the family's home, which the child
// builds layer by layer, and for Florence's three sample homes, which arrive complete.
// Inside there is a heater on the ground floor. Its warm air is drawn as small orange blocks that rise up the stairs.
// They stay under the roof when it is insulated and leave through the top when it is not, so that warm and cold can be
// seen without colour: by where the warm air goes, by who shivers, and by a small snowflake over a cold person's head.
import { THREE, blk, group, soft, fig, frame, hash } from '../kit-v2.js';
export const FH = 3.3, SL = 0.3, Y0 = 0.3, Y1 = Y0 + FH + SL, TOP = Y1 + FH;
const WOOD = '#b9834a', INS = '#f6d77a', BOARD = '#e6c992', GLASS = '#a9d3ee', OPEN = 1.72;
const NIGHT = { g: ['#ffd27a', 0.3], f: ['#e3c9a4', 0.17], p: ['#7fa0d8', 0.22] }, LEAK = { g: 0, f: 0.34, p: 0.78 };
// o: w, d (size), mat { wall, line }, thick, roofWin, roofC, doorC, M (makes a lit material), people (what each person looks like), done (arrives complete)
export function makeHome(parent, o) {
  const g = group(parent), w = o.w, d = o.d, ti = o.thick ? 0.7 : 0.25, T = 0.48 + ti, lam = (c) => o.M(c, 0, { raw: true }), flat = (c) => new THREE.MeshBasicMaterial({ color: c });
  const wood = lam(WOOD), ins = flat(INS), lining = flat('#f6eedc'), wallM = new THREE.MeshLambertMaterial({ color: o.mat.wall }), white = lam('#fbfbf7'), board = lam(BOARD), vis = !!o.done;
  const m = { g, w, d, T, ti, wallM, walls: [[], []], spots: [], people: [], heat: { stage: vis ? 3 : 0, leak: 0 }, lv: null };
  blk(g, 0, 0, w + 0.8, d + 0.8, 0, Y0, '#d9d2c2', { mat: lam('#d9d2c2') }); blk(g, 0, 0, w - 0.1, d - 0.1, Y0, 0.05, BOARD, { mat: board, shadow: false });
  // three walls on each floor. In each one the frame is on the inside, then the insulation (thick or thin, as the child asked), then the outer wall
  const defs = [{ x: 0, z: -d / 2, len: w - 2 * T, ry: Math.PI }, { x: -w / 2, z: -T / 2, len: d - T, ry: -Math.PI / 2 }, { x: w / 2, z: -T / 2, len: d - T, ry: Math.PI / 2 }];
  const layers = (pg, len, hh, x0 = 0) => { const fr = group(pg), n = Math.max(2, Math.round(len / 1.9)), zf = -0.2 - ti - 0.14; for (let k = 0; k <= n; k++) blk(fr, x0 - len / 2 + 0.16 + k * (len - 0.32) / n, zf, 0.26, 0.26, 0, hh, WOOD, { mat: wood }); for (const y of [0, hh - 0.26]) blk(fr, x0, zf, len - 0.3, 0.26, y, 0.26, WOOD, { mat: wood });
    const il = blk(pg, x0, -0.2 - ti / 2, len, ti, 0, hh, INS, { mat: ins }), pn = group(pg); blk(pn, x0, -0.1, len, 0.2, 0, hh, o.mat.wall, { mat: wallM }); blk(pn, x0, -0.2 - ti - 0.04, len - 0.3, 0.06, 0.2, hh - 0.4, '#f6eedc', { shadow: false, mat: lining }); fr.visible = il.visible = pn.visible = vis; return { fr, il, pn, n: vis ? 3 : 0 }; };
  for (const f of [0, 1]) defs.forEach((def, i) => { const yb = f ? Y1 : Y0, hh = f ? FH : FH + SL, wg = group(g, def.x, yb, def.z); wg.rotation.y = def.ry; const q = layers(wg, def.len, hh); Object.assign(q, { def, f, i, wg, hh });
    q.mark = frame(wg, 0, 0.15, -T - 0.12, def.len - 0.5, hh - 0.4, true); q.mark.visible = false; m.walls[f].push(q); });
  // the floor between, with a gap for the stairs along the back wall
  const zs = -d / 2 + T + 0.65, sx0 = 0.04 * w, sx1 = 0.36 * w, hx1 = 0.41 * w, zb = -d / 2 + T, zh = zb + 1.4, xl = -w / 2 + T, xr = w / 2 - T, slab = group(g, 0, Y1 - SL, 0);
  for (const [a, b, c, e] of [[xl, xr, zh, d / 2 - 0.02], [xl, sx0 - 0.2, zb, zh], [hx1, xr, zb, zh]]) blk(slab, (a + b) / 2, (c + e) / 2, b - a, e - c, 0, SL, BOARD, { mat: board });
  for (let k = 0; k < 8; k++) blk(slab, sx0 + (k + 0.5) * (sx1 - sx0) / 8, zs, (sx1 - sx0) / 8, 1.1, -FH, (k + 1) * (FH + SL) / 8, WOOD, { mat: wood }); slab.visible = vis;
  m.slab = slab; m.slabMark = group(g, 0, Y1 - SL, d / 2 - 0.1); frame(m.slabMark, 0, -0.25, 0, w - 2 * T, 0.8, true); m.slabMark.visible = false;
  // the heater, and its warm air
  const hx = -0.24 * w, hz = zb + 0.4, heater = group(g, hx, Y0, hz); blk(heater, 0, 0, 1.5, 0.4, 0.15, 0.95, '#f0ede4', { mat: lam('#f0ede4') }); blk(heater, 0, 0.22, 1.3, 0.05, 0.3, 0.6, '#e2674a', { shadow: false, mat: flat('#e2674a') }); heater.visible = vis; m.heater = heater;
  const puffM = soft('#ff8a4c', 0.88), puffs = []; for (let k = 0; k < 9; k++) { const p = blk(g, 0, 0, 0.34, 0.34, 0, 0.34, '#ff8a4c', { shadow: false, mat: puffM }); p.visible = false; puffs.push(p); }
  // the roof, in three layers: beams, insulation, and the cover
  const rb = group(g, 0, TOP, 0); for (let k = 0; k < 6; k++) blk(rb, -w / 2 + 0.4 + k * (w - 0.8) / 5, 0, 0.26, d + 0.5, 0, 0.25, WOOD, { mat: wood });
  const ri = blk(g, 0, 0, w + 0.2, d + 0.4, TOP + 0.25, ti, INS, { mat: ins }), yr = TOP + 0.25 + ti, roof = group(g, 0, yr, 0), rc = o.M(o.roofC, 0); blk(roof, 0, 0, w + 0.9, d + 1.2, 0, 0.6, o.roofC, { mat: rc }); if (!o.roofWin) blk(roof, 0, 0, w + 0.9, d * 0.42, 0.6, 0.45, o.roofC, { mat: rc });
  m.ropes = [-0.4 * w, 0.4 * w].map((x) => { const r = blk(roof, x, 0, 0.08, 0.08, 0.6, 16, '#2b3a55', { shadow: false }); r.visible = false; return r; }); rb.visible = ri.visible = roof.visible = vis; Object.assign(m, { rb, ri, roof, yr });
  m.roofMark = group(g, 0, TOP, 0); frame(m.roofMark, 0, 0.1, d / 2 + 0.25, w + 0.4, 1, true); m.roofMark.visible = false;
  // the front wall: two leaves on hinges at the corners. The door and the front windows are in the leaves
  const HT = TOP - Y0, leaves = [-1, 1].map((sx) => { const lg = group(g, sx * w / 2, Y0, d / 2), q = layers(lg, w / 2, HT, -sx * w / 4); q.lg = lg; q.sx = sx; return q; }); m.leaves = leaves; let openK = 0;
  m.openK = 0; m.setOpen = (k) => { openK = m.openK = k; for (const q of leaves) q.lg.rotation.y = q.sx * k * OPEN; }; m.frontMark = group(g, 0, Y0, d / 2 + 0.15); frame(m.frontMark, 0, 0.15, 0, w - 0.4, HT - 0.4, true, { fill: 0.3 }); m.frontMark.visible = false;
  // a home with roof windows still has three small windows in its front wall
  const smallM = flat(GLASS); if (o.roofWin) for (const [x, y] of [[-0.25 * w, 1.3], [-0.25 * w, Y1 - Y0 + 1.3], [0.25 * w, Y1 - Y0 + 1.3]]) { const q = leaves[x < 0 ? 0 : 1]; blk(q.pn, x - Math.sign(x) * w / 2, -T / 2, 1.3, T + 0.1, y - 0.1, 1.3, '#fbfbf7', { mat: white }); blk(q.pn, x - Math.sign(x) * w / 2, -T / 2, 1.05, T + 0.16, y, 1.1, GLASS, { shadow: false, mat: smallM }); }
  const doorX = 0.25 * w, doorMat = new THREE.MeshLambertMaterial({ color: o.doorC }), door = group(leaves[1].lg, doorX - w / 2, 0, 0); blk(door, 0, -T / 2, 1.8, T + 0.12, 0, 3, '#fff', { mat: doorMat }); blk(door, -0.55, 0.08, 0.2, 0.1, 1.4, 0.2, '#ffd257', { shadow: false, mat: flat('#ffd257') }); door.visible = vis;
  m.door = door; m.doorMat = doorMat; m.doorMark = group(g, doorX, Y0, d / 2 + 0.2); frame(m.doorMark, 0, 0, 0, 2, 3.2, true); m.doorMark.visible = false;
  // the places for the two big windows: three in the front wall, or three in the roof. Behind each is a shaft of sunlight, which is shown only if the sun reaches that window
  const shaftM = soft('#fff3a8', 0.24), winPart = (pg, x, y, z, flatW) => { const p = group(pg, x, y, z), gm = flat(GLASS); if (flatW) { blk(p, 0, 0, 2.3, 2, 0, 0.75, '#fbfbf7', { mat: white }); blk(p, 0, 0, 1.95, 2.06, 0.1, 0.72, GLASS, { shadow: false, mat: gm }); } else { blk(p, 0, -T / 2, 2.3, T + 0.1, 0, 2, '#fbfbf7', { mat: white }); blk(p, 0, -T / 2, 1.95, T + 0.18, 0.17, 1.66, GLASS, { shadow: false, mat: gm }); blk(p, 0, -T / 2, 0.12, T + 0.22, 0.17, 1.66, '#fbfbf7', { shadow: false, mat: white }); } p.visible = false; return { p, gm }; };
  const addSpot = (q) => { q.shaft = blk(g, q.at[0], q.at[2], 2, q.roof ? 1.8 : 2.4, q.fy + 0.06, q.roof ? FH - 0.1 : 2.6, '#fff1a0', { shadow: false, mat: shaftM }); q.patch = blk(g, q.at[0], q.at[2], 2.1, q.roof ? 1.9 : 2.5, q.fy + 0.06, 0.04, '#fff1a0', { shadow: false, mat: flat('#fff3b0') }); q.shaft.visible = q.patch.visible = false; q.mark.visible = false; q.on = false; m.spots.push(q); };
  if (o.roofWin) for (const x of [-0.3 * w, 0, 0.3 * w]) { const zz = 0.14 * d, q = winPart(roof, x, 0.6, zz, true), mark = group(g, x, yr + 0.62, zz + 1.02); frame(mark, 0, 0, 0, 2.3, 0.9, true); addSpot({ ...q, roof: true, f: 1, fy: Y1, at: [x, Y1, zz - 0.2], mark, c: [x, yr + 1, zz + 1] }); }
  else for (const [x, f] of [[-0.25 * w, 0], [-0.25 * w, 1], [0.25 * w, 1]]) { const y = (f ? Y1 - Y0 : 0) + 0.85, q = winPart(leaves[x < 0 ? 0 : 1].lg, x - Math.sign(x) * w / 2, y, 0, false), mark = group(g, x, Y0 + y - 0.1, d / 2 + 0.22); frame(mark, 0, 0, 0, 2.5, 2.2, true); addSpot({ ...q, roof: false, f, fy: f ? Y1 : Y0, at: [x, f ? Y1 : Y0, d / 2 - T - 1.35], mark, c: [x, Y0 + y + 1, d / 2 + 0.3] }); }
  // the window goes in. sunny says whether the sun reaches it
  m.putWindow = (i, sunny) => { const q = m.spots[i]; q.on = true; q.sunny = sunny; q.p.visible = true; q.shaft.visible = q.patch.visible = sunny; q.gm.color.set(sunny ? '#fff3b0' : GLASS); };
  if (vis) for (const i of [0, 2]) m.putWindow(i, o.sunny(m.spots[i]));
  // a soft light in each room at night: warm, or cold
  const glowM = soft('#ffd27a', 0.3), glow = [0, 1].map((f) => blk(g, 0, -T / 2, w - 2 * T, d - T - 0.1, (f ? Y1 : Y0) + 0.05, FH - 0.1, '#ffd27a', { shadow: false, mat: glowM })); for (const q of glow) q.visible = false;
  // night: lv is 'g' (warm), 'f' (a little cold) or 'p' (cold); null is day
  m.setNight = (lv) => { m.lv = lv; smallM.color.set(lv ? (lv === 'g' ? '#ffe27a' : NIGHT[lv][0]) : GLASS); ins.color.set(lv ? { g: '#e6c267', f: '#b3a57c', p: '#8a909c' }[lv] : INS); lining.color.set(lv ? { g: '#f7dfa4', f: '#c9bfa8', p: '#9aa6bb' }[lv] : '#f6eedc'); for (const q of glow) q.visible = !!lv; if (lv) { glowM.color.set(NIGHT[lv][0]); glowM.opacity = NIGHT[lv][1]; m.heat.leak = Math.max(LEAK[lv], o.thick ? 0 : 0.23); } for (const q of m.spots) { if (q.on) { q.shaft.visible = q.patch.visible = !lv && q.sunny; q.gm.color.set(lv ? (lv === 'g' ? '#ffe27a' : NIGHT[lv][0]) : q.sunny ? '#fff3b0' : GLASS); } }
    m.people.forEach((p, k) => { p.cold = lv === 'p' || (lv === 'f' && k === 0); }); };
  // the people: each has a place to stand, shivers when cold and has a snowflake over the head
  const stand = [[-0.34 * w, Y0, 0.1 * d], [-0.04 * w, Y0, -0.08 * d], [0.33 * w, Y0, 0.12 * d]];
  (o.people || []).forEach((po, k) => { const pg = group(g, ...stand[k]); fig(pg, 0, 0.05, 0, po); const fl = group(pg, 0, 1.75 * po.k + 0.5, 0), fm = flat('#ffffff'), fb = flat('#4d8fd6'); for (let a = 0; a < 3; a++) { const b = group(fl); b.rotation.z = a * Math.PI / 3; blk(b, 0, 0, 0.9, 0.1, -0.07, 0.14, '#4d8fd6', { shadow: false, mat: fb }); blk(b, 0, 0.03, 0.62, 0.1, -0.035, 0.07, '#fff', { shadow: false, mat: fm }); }
    fl.visible = false; pg.visible = vis; m.people.push({ pg, fl, pos: [...stand[k]], cold: false, busy: false, hop: 0 }); });
  // a person walks to a place on either floor, by the stairs if need be
  m.walk = async (k, f, x, z, sec = 1) => { const p = m.people[k], y = f ? Y1 : Y0, pts = [[...p.pos]]; if ((p.pos[1] > Y0 + 1) !== !!f) { const a = [[sx0 - 0.3, Y0, zs + 1.3], [sx0 - 0.1, Y0, zs], [sx1 + 0.2, Y1, zs], [hx1 + 0.35, Y1, zs], [hx1 + 0.35, Y1, zh + 0.5]]; pts.push(...(f ? a : a.reverse())); } pts.push([x, y, z]);
    p.busy = true; for (let q = 1; q < pts.length; q++) { const a = pts[q - 1], b = pts[q], len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); await o.tw(Math.max(0.12, len / 4.2 * sec), (t) => { p.pos = a.map((v, c) => v + (b[c] - v) * t); p.step = Math.abs(Math.sin(t * len * 2.2)) * 0.12 * (t < 1); }); } p.busy = false; p.pos = [x, y, z]; };
  m.hop = (k) => { m.people[k].hop = 1; };
  m.tick = (t, dt) => { m.people.forEach((p, k) => { p.hop = Math.max(0, p.hop - dt * 1.4); const sh = p.cold && !p.busy; p.pg.position.set(p.pos[0] + (sh ? Math.sin(t * 38 + k) * 0.045 : 0), p.pos[1] + (p.step || 0) + Math.abs(Math.sin(p.hop * Math.PI * 2)) * 0.45, p.pos[2]); p.fl.visible = sh && p.pg.visible; p.fl.position.y = 1.75 * p.pg.children[0].scale.x + 0.55 + Math.sin(t * 3 + k) * 0.06; });
    // the warm air: from the heater to the stairs, up to the ceiling, and then it stays under the roof or leaves through the top
    const st = m.heat.stage, ceil = TOP - 0.5, mx = (sx0 + sx1) / 2; puffs.forEach((p, k) => { p.visible = st > 0; if (!st) return; const u = (t * 0.16 + k / puffs.length) % 1, out = st < 3 || (k + 0.5) / puffs.length < m.heat.leak, sway = Math.sin(t * 2 + k * 1.7) * 0.18; let x, y, z, s = 1;
      if (st === 1) { x = hx + sway; y = Y0 + 1.1 + u * (FH + 3.2); z = hz + 0.5; s = 1 - Math.max(0, u - 0.6) / 0.4; }
      else if (u < 0.3) { const e = u / 0.3; x = hx + (mx - hx) * e; y = Y0 + 1.1 + e * (FH - 1.6); z = hz + 0.5 + sway * 0.5; }
      else if (u < 0.6) { const e = (u - 0.3) / 0.3; x = mx + sway; y = Y0 + FH - 0.5 + e * (ceil - Y0 - FH + 0.5); z = hz + 0.5 + e * 1.2; }
      else { const e = (u - 0.6) / 0.4; if (out) { x = mx + sway + (hash(k, 2) - 0.5) * 3 * e; y = ceil + e * 5; z = hz + 1.7; } else { x = mx + (k % 2 ? 1 : -1.6) * 0.28 * w * e + sway; y = ceil - 0.1 * Math.sin(e * 3); z = hz + 1.7 + (hash(k, 5) - 0.3) * 0.4 * d * e; } s = 1 - e * e; }
      p.position.set(x, y, z); p.scale.setScalar(Math.max(0.05, s)); }); };
  if (vis) m.setOpen(0);
  return m; }
