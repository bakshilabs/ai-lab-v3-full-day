// Mission 2, hand flying: take off, hold a hover in the wind (twice), fly a hoop course at different heights, land
// gently on the pad. The rules are in m2-hand.js; the flying in fly3d.js. Loaded only in the browser.
import * as THREE from 'three';
import { TAKEOFF, RING, HOVERS, windAt, windWords, course, HOOP_R, PAD_R, landing, pickOpen } from './m2-hand.js';
import { createFly3d, createFlyPad } from './fly3d.js';
import { makeHoop, makePad } from './model.js';
import { arrowFor, bearing, key, toGrid } from './geo.js';
import { ITEMS } from '../../world/catalog.js';

const tileList = (terrain) => (terrain?.tiles instanceof Map ? [...terrain.tiles.values()] : [...(terrain?.tiles || [])]);
const FLAT = new Set(['road', 'carpark', 'path', 'cycle', 'bigfield', 'mixed', 'allot', 'hedge', 'raingarden', 'reedbed', 'festival', 'park', 'hives', 'compost']);
const lam = (c, e = 0) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: e });

export async function runHand(ctx, ui, scope, { touch }) {
  const junior = !!ctx.junior; const tiles = tileList(ctx.town.terrain); const cells = ctx.town.cells || [];
  const spot = pickOpen(cells, tiles) || { x: 0, z: 0 };
  const C = course(spot); const fly = createFly3d(ctx, { origin: { x: C.pad.x, z: C.pad.z }, radius: 34 });
  const pad = createFlyPad(ctx, { touch }); fly.setInput(pad.input);
  scope.onEnd(() => { fly.dispose(); pad.off(); ui.hush(); });
  const sound = (n) => { try { ctx.engine.audio?.[n]?.(); } catch { /* no sound */ } };
  const reduce = fly.reduce; const cellOf = new Map(cells);
  const tallNear = (x, z) => { const [fx, fz] = toGrid(x, z); const gx = Math.round(fx), gz = Math.round(fz); for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = key(gx + dx, gz + dz); const t = ctx.town.terrain?.tiles?.get?.(k); const it = cellOf.get(k)?.item; if (t?.fixed || (it && !FLAT.has(it) && ITEMS[it]?.kind === 'build')) return true; } return false; };

  // ---- the course in the town: the green take-off pad and its hover ring, four hoops, the orange landing pad
  const g0 = fly.groundAt(C.pad.x, C.pad.z);
  const start = makePad(0.35, '#2e7d4f'); start.group.position.set(C.pad.x, g0, C.pad.z); fly.add(start.group);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(RING, 0.28, 6, 40), lam('#2e9b5a', 0.4)); ring.rotation.x = Math.PI / 2; ring.position.set(C.pad.x, g0 + 0.5, C.pad.z); fly.add(ring);
  const gl = fly.groundAt(C.land.x, C.land.z); const landPad = makePad(0.35, '#e8743b'); landPad.group.position.set(C.land.x, gl, C.land.z); fly.add(landPad.group); landPad.group.visible = false;
  const hoops = C.hoops.map((h) => { const y = fly.groundAt(h.x, h.z) + (tallNear(h.x, h.z) ? Math.max(h.h, 13) : h.h); const m = makeHoop(HOOP_R + 0.6, h.facing); m.group.position.set(h.x, y, h.z); m.group.visible = false; fly.add(m.group); return { ...h, y, mesh: m }; });
  // the drone stands on the pad; what it lands on: the tops of the two pads
  fly.setFloor((x, z) => { const g = fly.groundAt(x, z); if (Math.hypot(x - C.pad.x, z - C.pad.z) < PAD_R + 0.2) return g0 + 0.35; if (landPad.group.visible && Math.hypot(x - C.land.x, z - C.land.z) < PAD_R + 0.2) return gl + 0.35; return g; });
  fly.placeAt(C.pad.x, C.pad.z);
  const hudRoot = ctx.root.querySelector('.df-hud');
  const dataset = (o) => { for (const [k, v] of Object.entries(o)) hudRoot.dataset[k] = String(v); };
  const meter = (label, frac, { band, mark, cls = '', text = '' } = {}) => `<div class="df-meter"><span>${label}</span><span class="df-bar ${cls}">${band ? `<span class="band" style="left:${band[0] * 100}%;width:${(band[1] - band[0]) * 100}%"></span>` : ''}${frac > 0 ? `<i style="width:${Math.round(Math.min(1, frac) * 100)}%"></i>` : ''}${mark !== undefined ? `<span class="mark" style="left:${Math.round(Math.max(0, Math.min(1, mark)) * 1000) / 10}%"></span>` : ''}</span><b>${text}</b></div>`;
  const heightLine = (h, band) => meter('Height', 0, { band: band ? [TAKEOFF.lo / 20, TAKEOFF.hi / 20] : null, mark: h / 20, text: junior ? '' : `${h.toFixed(1)} m` });
  const windLine = (w, round) => { if (!w || w.kmh < 1) return ''; const a = arrowFor(bearing(0, 0, w.x, w.z)); return `<div class="df-wind"><b aria-hidden="true">${a}</b><span>${junior ? (round ? 'Strong gusty wind' : 'Gentle wind') + ' blowing this way' : `Wind ${w.kmh} km/h, blowing this way`}</span></div>`; };
  const sum = { hover: 0, wind: HOVERS[1].kmh, hoops: 0, of: hoops.length, landing: null, tries: 0, secs: 0 }; const t0 = performance.now();

  // ---- take off
  ctx.report({ stage: 'Hand flying: take-off' }); ui.setStage('m2-takeoff');
  await ui.talk(`This is the training field. The drone sits on the green pad. ${pad.how} First, take off: climb until the drone is between the two green marks on the height bar, and stay there.`, { button: 'Start ➜' });
  ui.hush(); pad.show(); fly.freeze(false);
  pad.task('Take off: climb into the green band and stay there.');
  let inBand = 0;
  await fly.until((dt) => {
    const h = fly.height(); const ok = h >= TAKEOFF.lo && h <= TAKEOFF.hi; inBand = ok ? inBand + dt : 0;
    pad.read(heightLine(h, true) + meter(junior ? 'Hold it' : 'Steady', inBand / TAKEOFF.hold, { cls: 'good', text: ok ? 'In the band' : h < TAKEOFF.lo ? 'Climb' : 'Too high: come down a little' }));
    dataset({ dfPhase: 'takeoff', dy: ((TAKEOFF.lo + TAKEOFF.hi) / 2 - h).toFixed(2), dx: 0, dz: 0 });
    return inBand >= TAKEOFF.hold;
  });
  sound('good'); ui.cheer('Take-off done');

  // ---- two hovers in the wind
  for (let r = 0; r < HOVERS.length; r++) {
    ctx.report({ stage: `Hand flying: hover in the wind (${r + 1} of 2)` }); ui.setStage(`m2-hover${r}`);
    fly.freeze(true); fly.placeAt(fly.S.x, fly.S.z, fly.S.y);
    await ui.talk(r === 0 ? `Now the wind. ${windWords(0, junior)} It will push the drone. Keep the drone above the green ring for ${HOVERS[0].need} seconds. Push against the wind with the arrows.` : `${windWords(1, junior)} The gusts come and go, so watch the drone and keep correcting. Stay above the ring for ${HOVERS[1].need} seconds.`, { button: 'Start the wind ➜' });
    ui.hush(); fly.freeze(false); let inside = 0, total = 0, t = 0;
    pad.task(`Stay above the green ring: push against the wind.`);
    await fly.until((dt) => {
      t += dt; total += dt; const w = windAt(r, t); fly.setWind(w.x, w.z);
      const off = Math.hypot(fly.S.x - C.pad.x, fly.S.z - C.pad.z); const ok = off <= RING && fly.height() >= 2; if (ok) inside += dt;
      ring.material.color.set(ok ? '#2e9b5a' : '#d2452d'); ring.material.emissive.set(ok ? '#2e9b5a' : '#d2452d');
      pad.read(windLine(w, r) + meter(junior ? 'Above ring' : 'In the ring', inside / HOVERS[r].need, { cls: 'good', text: junior ? (ok ? 'Good' : 'Back to the ring') : `${inside.toFixed(1)} of ${HOVERS[r].need} s` }) + (fly.height() < 2 ? '<div class="df-warn">Too low: climb a little</div>' : ''));
      dataset({ dfPhase: `hover${r}`, dx: ((C.pad.x - fly.S.x) / 3 - w.x / 2).toFixed(2), dz: ((C.pad.z - fly.S.z) / 3 - w.z / 2).toFixed(2), dy: (5 - fly.height()).toFixed(2) });
      return inside >= HOVERS[r].need;
    });
    sum.hover += inside / total / HOVERS.length; fly.setWind(0, 0); ring.material.color.set('#2e9b5a'); ring.material.emissive.set('#2e9b5a');
    sound('good'); ui.cheer(r === 0 ? 'Steady in the wind' : 'Steady in the gusts');
  }

  // ---- the hoop course, in a light breeze
  ctx.report({ stage: 'Hand flying: the hoop course' }); ui.setStage('m2-hoops'); fly.freeze(true);
  for (const h of hoops) h.mesh.group.visible = true;
  await ui.talk(`Now the hoop course: ${hoops.length} gold hoops at different heights. Fly through them in order. The arrow points to the next one, and it says when to climb or come down.`, { button: 'Fly the course ➜' });
  ui.hush(); fly.freeze(false); fly.setWind(0.9, 0); let hi = 0; const next = (i) => { hoops.forEach((h, j) => { h.mesh.group.scale.setScalar(j === i ? 1.12 : 1); }); }; next(0);
  await fly.until(() => {
    const h = hoops[hi]; const dy = h.y - (fly.S.y + 0.6); const d = Math.hypot(h.x - fly.S.x, dy, h.z - fly.S.z);
    if (d < HOOP_R) { h.mesh.done(); sound('good'); hi++; sum.hoops = hi; if (hi >= hoops.length) return true; next(hi); return false; }
    const way = arrowFor(bearing(fly.S.x, fly.S.z, h.x, h.z)); const flat = Math.hypot(h.x - fly.S.x, h.z - fly.S.z);
    const up = dy > 1.5 ? 'Climb ⤒' : dy < -1.5 ? 'Come down ⤓' : 'Height is right';
    pad.task(`Hoop ${hi + 1} of ${hoops.length}`);
    pad.read(`<div class="df-wind"><b aria-hidden="true">${way}</b><span>${junior ? (flat < 4 ? 'Right here' : 'This way') : `${Math.round(flat)} m away`} · ${up}</span></div>${heightLine(fly.height(), false)}`);
    dataset({ dfPhase: 'hoops', dx: ((h.x - fly.S.x) / 4).toFixed(2), dz: ((h.z - fly.S.z) / 4).toFixed(2), dy: dy.toFixed(2) });
    return false;
  });
  ui.cheer(`All ${hoops.length} hoops`);

  // ---- land gently on the orange pad
  ctx.report({ stage: 'Hand flying: landing' }); ui.setStage('m2-land'); fly.freeze(true); landPad.group.visible = true; fly.setWind(0, 0);
  await ui.talk(`Last, the landing. Fly over the orange pad and come down slowly. Let go of Down just before the pad, so the drone touches down gently.`, { button: 'Go and land ➜' });
  ui.hush(); fly.freeze(false); let msg = ''; let landed = null;
  await fly.until((dt, info) => {
    const off = Math.hypot(fly.S.x - C.land.x, fly.S.z - C.land.z); const h = fly.height(); const vy = -fly.S.vy;
    if (info.touched !== null && info.touched !== undefined) {
      sum.tries++; const r = landing(info.touched, off); msg = r.text; ctx.say(r.text);
      if (r.ok) { landed = r; sum.landing = Math.round(info.touched * 10) / 10; return true; }
      fly.S.vy = 2.2; // a bump: back up a little to try again
    }
    const speedTxt = junior ? (vy > 3 ? 'Too fast!' : vy > 1.8 ? 'A bit fast' : vy > 0.2 ? 'Nice and slow' : '') : (vy > 0.2 ? `${vy.toFixed(1)} m/s down (land under 1.8)` : '');
    pad.task(off > PAD_R ? 'Fly over the orange pad' : 'Now come down slowly');
    pad.read(`${off > PAD_R ? `<div class="df-wind"><b aria-hidden="true">${arrowFor(bearing(fly.S.x, fly.S.z, C.land.x, C.land.z))}</b><span>${junior ? 'To the orange pad' : `${Math.round(off)} m to the pad`}</span></div>` : ''}${meter('Coming down', vy / 4, { mark: 1.8 / 4, cls: vy > 3 ? 'bad' : vy > 1.8 ? '' : 'good', text: speedTxt })}${heightLine(h, false)}${msg ? `<div class="dk-note warn">${msg}</div>` : ''}`);
    dataset({ dfPhase: 'land', dx: ((C.land.x - fly.S.x) / 3).toFixed(2), dz: ((C.land.z - fly.S.z) / 3).toFixed(2), dy: (off < 1.5 ? -h : 0).toFixed(2), vy: vy.toFixed(2) });
    return false;
  });
  pad.hide(); sound('reward'); ui.cheer(landed.kind === 'soft' ? 'A gentle landing' : 'Landed on the pad');
  if (!reduce) { try { ctx.engine.world.confetti?.(new THREE.Vector3(C.land.x, gl + 2, C.land.z), 60); } catch { /* the cheer is enough */ } }
  sum.secs = Math.round((performance.now() - t0) / 1000); sum.hover = Math.round(sum.hover * 100);
  await ui.talk(`${landed.text} ${sum.tries > 1 ? `It took ${sum.tries} tries, which is normal for a first landing.` : ''}`.trim(), { button: 'Finish the training ➜' });
  ui.hush(); fly.dispose(); pad.off();
  const lines = [junior ? 'You took off and held the drone steady in a gentle wind and then in strong gusts.' : `You took off and held a hover in ${HOVERS[0].kmh} km/h and then ${HOVERS[1].kmh} km/h gusty wind (above the ring ${sum.hover}% of the time).`,
    `You flew through all ${hoops.length} hoops and landed on the pad${sum.tries > 1 ? ` after ${sum.tries} tries` : ' first time'}${junior ? '' : ` at ${sum.landing} m/s`}.`];
  return { sum, lines };
}
