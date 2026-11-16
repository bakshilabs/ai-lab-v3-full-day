// Mission 5, inspection: photograph a wind turbine and the footbridge from a safe distance, then find the damage in the
// photos. Rules and photos are in m5-inspect.js; the flying in fly3d.js. Loaded only in the browser.
import * as THREE from 'three';
import { SAFE, STOP, SPOT_R, HOLD, STILL, clearance, TOWER, BLADE, HUB_Z, BLADE_ANGLES, turbineParts, turbineSpots, bridgeShape, bridgeSpots, isDamage, photoReply, ACTIONS, actionReply, photoSvg, DAMAGE, COMPANY_RULE } from './m5-inspect.js';
import { windAt, pickOpen } from './m2-hand.js';
import { createFly3d, createFlyPad } from './fly3d.js';
import { arrowFor, bearing } from './geo.js';
import { esc } from './kit.js';

const tileList = (terrain) => (terrain?.tiles instanceof Map ? [...terrain.tiles.values()] : [...(terrain?.tiles || [])]);
const lam = (c, e = 0) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: e });

function makeTurbine() {
  const g = new THREE.Group(); const white = lam('#f4f6f7'), grey = lam('#c5ccd2');
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.3, TOWER, 12), white); tower.position.y = TOWER / 2; g.add(tower);
  const nac = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 5), white); nac.position.set(0, TOWER + 1, -0.6); g.add(nac);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 8), grey); hub.position.set(0, TOWER + 1, HUB_Z); g.add(hub);
  for (const d of BLADE_ANGLES) {
    const blade = new THREE.Group(); blade.position.set(0, TOWER + 1, HUB_Z); blade.rotation.z = -d * Math.PI / 180;
    const root = new THREE.Mesh(new THREE.BoxGeometry(1.5, BLADE * 0.5, 0.5), white); root.position.y = BLADE * 0.25; blade.add(root);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(1.0, BLADE * 0.5, 0.4), white); tip.position.y = BLADE * 0.75; blade.add(tip);
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.04, 1.2, 0.44), lam('#d2452d')); band.position.y = BLADE - 0.7; blade.add(band);
    g.add(blade);
  }
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.6, 12), grey); base.position.y = 0.3; g.add(base);
  return g;
}
// A blue frame where a photo is taken from (it faces the part it looks at), green once the photo is taken.
function makeFrame() {
  const g = new THREE.Group(); const mat = lam('#1f6fd0', 0.5); const s = 2.6;
  for (const [x, y, w, h] of [[0, s, 2 * s + 0.4, 0.4], [0, -s, 2 * s + 0.4, 0.4], [s, 0, 0.4, 2 * s], [-s, 0, 0.4, 2 * s]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), mat); m.position.set(x, y, 0); g.add(m); }
  return { group: g, done() { mat.color.set('#2e9b5a'); mat.emissive.set('#2e9b5a'); }, now(on) { g.scale.setScalar(on ? 1.15 : 1); } };
}

// Fly to every frame and take its photo. Resolves with { close } (how many times the drone went inside the safe distance).
async function flyPhotos(ctx, ui, fly, pad, { parts, spots, what, junior }) {
  const frames = spots.map((s) => { const f = makeFrame(); f.group.position.set(s.at.x, s.at.y, s.at.z); fly.add(f.group); return { ...s, f, taken: false }; });
  const hud = ctx.root.querySelector('.df-hud'); const set = (o) => { for (const [k, v] of Object.entries(o)) hud.dataset[k] = String(v); };
  let close = 0, wasClose = false, hold = 0, t = 0, stopped = 0; let safe = { x: fly.S.x, y: fly.S.y, z: fly.S.z }; const sound = (n) => { try { ctx.engine.audio?.[n]?.(); } catch { /* none */ } };
  pad.show(); fly.freeze(false);
  await fly.until((dt) => {
    t += dt; const w = windAt(0, t); fly.setWind(w.x * 0.5, w.z * 0.5);
    const p = { x: fly.S.x, y: fly.S.y + 0.7, z: fly.S.z }; let c = clearance(p, parts);
    if (c < STOP) { Object.assign(fly.S, { x: safe.x, y: safe.y, z: safe.z, vx: 0, vy: 0, vz: 0 }); stopped = 1.5; c = clearance({ ...safe, y: safe.y + 0.7 }, parts); } else safe = { x: fly.S.x, y: fly.S.y, z: fly.S.z };
    stopped = Math.max(0, stopped - dt);
    const tooClose = c < SAFE; if (tooClose && !wasClose) { close++; sound('bad'); } wasClose = tooClose;
    const left = frames.filter((f) => !f.taken); const near = left.reduce((a, f) => (!a || Math.hypot(f.at.x - p.x, f.at.y - p.y, f.at.z - p.z) < Math.hypot(a.at.x - p.x, a.at.y - p.y, a.at.z - p.z) ? f : a), null);
    for (const f of frames) f.f.now(f === near);
    const d = Math.hypot(near.at.x - p.x, near.at.y - p.y, near.at.z - p.z); const speed = Math.hypot(fly.S.vx, fly.S.vy, fly.S.vz);
    const inFrame = d < SPOT_R; const steady = speed < STILL;
    hold = inFrame && steady && !tooClose ? hold + dt : 0;
    if (hold >= HOLD) { near.taken = true; near.f.done(); hold = 0; sound('good'); ui.cheer(`Photo of ${near.name}`); if (frames.every((f) => f.taken)) return true; }
    const dy = near.at.y - p.y; const up = dy > 1.5 ? 'Climb ⤒' : dy < -1.5 ? 'Come down ⤓' : 'Height is right';
    fly.aim(near.at.y); pad.task(`Next photo: ${near.name} (${frames.filter((f) => f.taken).length} of ${frames.length} done)`);
    pad.read(`<div class="df-wind"><b aria-hidden="true">${inFrame ? '◎' : arrowFor(bearing(p.x, p.z, near.at.x, near.at.z))}</b><span>${inFrame ? (steady ? 'Hold still…' : 'In the frame: hold still') : `${junior ? 'To the blue frame' : `${Math.round(d)} m to the frame`} · ${up}`}</span></div>`
      + `<div class="df-meter"><span>${junior ? 'Distance' : 'Clearance'}</span><span class="df-bar ${tooClose ? 'bad' : 'good'}"><i style="width:${Math.round(Math.min(1, c / 12) * 100)}%"></i><span class="mark" style="left:${SAFE / 12 * 100}%"></span></span><b>${junior ? (tooClose ? 'Too close!' : 'Safe') : `${Math.max(0, c).toFixed(1)} m (company rule: over ${SAFE} m)`}</b></div>`
      + (inFrame && !tooClose ? `<div class="df-meter"><span>Photo</span><span class="df-bar good"><i style="width:${Math.round(hold / HOLD * 100)}%"></i></span><b></b></div>` : '')
      + (stopped > 0 ? `<div class="df-warn">The drone's sensors stopped it: too close to ${what}.</div>` : tooClose ? `<div class="df-warn">Too close to ${what}: back away.</div>` : ''));
    set({ dfPhase: 'inspect', dx: ((near.at.x - p.x) / 3).toFixed(2), dz: ((near.at.z - p.z) / 3).toFixed(2), dy: dy.toFixed(2), clear: c.toFixed(2), taken: frames.filter((f) => f.taken).length });
    return false;
  });
  pad.hide(); fly.freeze(true); fly.setWind(0, 0);
  return { close };
}

// Look through the photos and find the damage (and, ages 13-17, size it for the report).
async function review(ctx, kit, spots, { title, junior }) {
  const P = kit.panel('inspect-photos'); const damaged = spots.find((s) => isDamage(s.photo));
  let tries = 0; let reply = null; let found = false; let acted = junior; let chosen = null;
  P.say(`Here are your ${spots.length} photos of ${title}. An inspector looks at each one closely. Which photo shows damage?`);
  const draw = () => {
    P.main.innerHTML = `<div class="dk-photos" role="group" aria-label="Your photos">${spots.map((s, i) => `<button type="button" class="dk-photo${chosen === s.id ? (isDamage(s.photo) ? ' right' : ' nope') : ''}" data-photo="${s.id}" aria-label="Photo ${i + 1}: ${esc(s.name)}">${photoSvg(s.photo, { scale: !junior && found && isDamage(s.photo), ring: found && isDamage(s.photo) })}<span>Photo ${i + 1}: ${esc(s.name)}</span></button>`).join('')}</div>`;
    P.side.innerHTML = `<h2>${esc(title.charAt(0).toUpperCase() + title.slice(1))}: the photos</h2><p class="dk-ask">${found ? (acted ? 'Damage found and reported.' : `What goes in the report? Measure the crack with the scale in the photo. ${COMPANY_RULE}`) : 'Tap the photo that shows damage.'}</p>
      ${found && !acted ? `<div class="dk-choices">${ACTIONS.map((a) => `<button type="button" class="dr-btn" data-act="${a.id}">${esc(a.label)}</button>`).join('')}</div>` : ''}
      ${reply ? `<div class="dk-note ${reply.right ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(reply.text)}</div>` : ''}
      ${found && acted ? '<div class="dr-row"><button type="button" class="dr-btn go" data-k="next">Next ➜</button></div>' : ''}`;
  };
  draw(); kit.focusFirst(P.main, '[data-photo]');
  await new Promise((res) => {
    P.box.onclick = (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return; const d = b.dataset;
      if (d.photo && !found) {
        const s = spots.find((x) => x.id === d.photo); chosen = s.id; const r = photoReply(s.photo, tries, damaged.name); reply = r; ctx.say(r.text);
        if (r.right) found = true; else tries++;
        draw(); kit.focusFirst(P.box, found ? (acted ? '[data-k]' : '[data-act]') : `[data-photo="${d.photo}"]`);
      } else if (d.act) { const r = actionReply(damaged.photo, d.act); reply = r; ctx.say(r.text); if (r.right) acted = true; draw(); kit.focusFirst(P.box, acted ? '[data-k]' : '[data-act]'); }
      else if (d.k === 'next') res();
    };
  });
  P.remove(); return { tries };
}

export async function runInspect(ctx, ui, kit, scope, { touch }) {
  const junior = !!ctx.junior; const tiles = tileList(ctx.town.terrain); const cells = ctx.town.cells || [];
  const spot = pickOpen(cells, tiles) || { x: 0, z: 0 }; let fly = null; let pad = createFlyPad(ctx, { touch });
  scope.onEnd(() => { fly?.dispose(); pad.off(); ui.hush(); });
  const sum = { photos: 0, close: 0, found: 0 };
  // ---- the wind turbine
  ctx.report({ stage: 'Inspection: the wind turbine' }); ui.setStage('m5-turbine');
  fly = createFly3d(ctx, { origin: { x: spot.x, z: spot.z + 6 }, radius: 30, cam: { up: 9, back: 24, ahead: 6 } }); fly.setInput(pad.input);
  const g = fly.groundAt(spot.x, spot.z); const base = { x: spot.x, y: g, z: spot.z };
  const tb = makeTurbine(); tb.position.set(base.x, base.y, base.z); fly.add(tb);
  const sx = spot.x, sz = spot.z + 15; fly.placeAt(sx, sz, base.y + TOWER - 2); // already in the air, level with the hub, south of the turbine, facing it
  await ui.talk(`This wind turbine has been stopped and locked, so it is safe to inspect. Fly to each blue frame and hold the drone still there to take a photo. ${junior ? 'This company\'s safety rule: stay well away from the turbine.' : `This company\'s safety rule: stay at least ${SAFE} m from the turbine.`} ${pad.how}`, { button: 'Start the inspection ➜' });
  ui.hush();
  const t1 = await flyPhotos(ctx, ui, fly, pad, { parts: turbineParts(base), spots: turbineSpots(base), what: 'the turbine', junior });
  sum.close += t1.close; sum.photos += 3;
  await ui.talk(`All three photos are taken${t1.close ? `. The drone went too close ${t1.close} ${t1.close === 1 ? 'time' : 'times'}: in a real inspection that risks the drone and the blade` : ', all from a safe distance'}. Now look at them.`, { button: 'Look at the photos ➜' });
  ui.hush(); ui.setStage('m5-photos1');
  await review(ctx, kit, turbineSpots(base), { title: 'the wind turbine', junior }); sum.found++;
  fly.dispose(); fly = null;

  // ---- the footbridge to the village
  const land = ctx.engine.world?.bridgeLanding;
  if (land) {
    ctx.report({ stage: 'Inspection: the footbridge' }); ui.setStage('m5-bridge');
    const b = bridgeShape(land); fly = createFly3d(ctx, { origin: { x: (b.xe + b.xf) / 2 - 2, z: b.z + 4 }, radius: 18, cam: { up: 5, back: 18, ahead: 6 } }); fly.setInput(pad.input);
    fly.setFloor((x, z) => (x > b.xe - 1 && Math.abs(z - b.z) < 1.6 ? b.deck(x) + 0.2 : x > b.xe - 1 ? b.deck(b.xf) - 9 : fly.groundAt(x, z)));
    fly.placeAt((b.xe + b.xf) / 2, b.z + 12, land.y + 1); // in the air beside the bridge, looking at it
    await ui.talk(`Next, the footbridge to the village. Bridges are checked from every side, even from below. ${junior ? 'Fly to the three blue frames. Keep a safe distance.' : `Three frames again; the same company rule: over ${SAFE} m from the bridge.`}`, { button: 'Start ➜' });
    ui.hush();
    const t2 = await flyPhotos(ctx, ui, fly, pad, { parts: b.parts, spots: bridgeSpots(b), what: 'the bridge', junior });
    sum.close += t2.close; sum.photos += 3;
    await ui.talk(`Three photos of the bridge${t2.close ? `, with ${t2.close} too close` : ', all from a safe distance'}. Now find the damage.`, { button: 'Look at the photos ➜' });
    ui.hush(); ui.setStage('m5-photos2');
    await review(ctx, kit, bridgeSpots(b), { title: 'the footbridge', junior }); sum.found++;
    fly.dispose(); fly = null;
  }
  pad.off(); pad = { off() {} };
  const lines = [`You took ${sum.photos} inspection photos${sum.close ? `; the drone went inside the safe distance ${sum.close} ${sum.close === 1 ? 'time' : 'times'}` : ', all from a safe distance'}.`,
    junior ? `You found ${sum.found === 1 ? 'the crack' : 'a crack in the turbine blade and a split in the bridge'}.` : `You found and sized ${sum.found} cracks: ${DAMAGE['blade-crack'].cm} cm on the blade (repair) and ${DAMAGE['wood-crack'].cm} cm on the bridge (check again).`];
  return { sum, lines };
}
