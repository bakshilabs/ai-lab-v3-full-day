// Drone delivery: the drone in the 3D town. Hand flying, flying a set of steps, and the camera behind the drone.
// No page elements here (js/modules/drone/ui.js) and no route rules (route.js): this file only moves things.
import * as THREE from 'three';
import { T, DIRS, tileXZ, toGrid, key, parseKey, pullInside, bearing, turnTo, hoopsFor } from './geo.js';
import { ITEMS } from '../../world/catalog.js';
import { AUTO_SPEED, UP_SECS, DROP_SECS } from './route.js';
import { makeDrone, makeBeacon, makePad, makeShadow, makeParcel, makeDashes, makeHoop, makeNoFly, makePerson, makeTick, setParcelDrop, dispose } from './model.js';

export const CRUISE = 18;       // flying height: above every roof and tree on the tiles
const PAD = 10;                 // the landing pad stands on a post above the roof of the start
const HAND_SPEED = 7.5, HAND_BACK = 4, TURN = 1.7, REACH = 4.4; // forgiving: the parcel goes down anywhere within about a tile
const HOOP_R = 6.2;             // a hoop counts when the drone passes within about a tile of its middle
const DOOR = 3.6;               // the doorstep: the parcel is lowered just outside the tile, in front of the building
const HOVER = 11;               // how high the drone hangs over the doorstep while it lowers the parcel
const FLAT = new Set(['road', 'carpark', 'path', 'cycle', 'bigfield', 'mixed', 'allot', 'hedge', 'raingarden', 'reedbed', 'festival', 'park', 'hives', 'compost']); // builds a camera can see over
const SCALE = 1.5;
const smooth = (t) => t * t * (3 - 2 * t);
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export function createFlight(ctx, tileKeys) {
  const { scene, camera, world } = ctx.engine; const reduce = !!ctx.settings.reduceMotion; const audio = ctx.engine.audio;
  const sound = (name) => { try { audio?.[name]?.(); } catch { /* no sound: nothing depends on it */ } };
  const root = new THREE.Group(); root.name = 'drone-module'; scene.add(root);
  const drone = makeDrone(SCALE); root.add(drone.group);
  const shadow = makeShadow(); root.add(shadow);
  const startMark = makePad(PAD); root.add(startMark.group);
  const beacon = makeBeacon('#d2452d', CRUISE + 6); root.add(beacon.group);
  const person = makePerson(); root.add(person.group); const tick = makeTick(); tick.visible = false; root.add(tick);
  const zone = new THREE.Group(); root.add(zone);
  const left = []; // parcels left on the ground
  let places = null; let hoops = [];
  const groundAt = (gx, gz) => { const k = key(Math.round(gx), Math.round(gz)); if (!tileKeys.has(k)) return 1; try { return world.tileTop(k).y; } catch { return 1; } };
  const placeXZ = (p) => tileXZ(p.gx, p.gz);
  const S = { x: 0, y: 0, z: 0, heading: 0, cam: 0, speed: 0, vx: 0, vz: 0, tilt: 0, spin: false, step: null, gone: false, t: 0, view: 'chase', door: null, still: null, blend: 0, big: 1 };
  const camP = new THREE.Vector3(), camL = new THREE.Vector3(), wantP = new THREE.Vector3(), wantL = new THREE.Vector3(); let camSet = false;

  function setBeacon(p) {
    beacon.group.visible = !!p; person.group.visible = !!p; tick.visible = false; person.cheer(0); person.hop(0);
    if (p) { const [x, z] = placeXZ(p); const g = groundAt(p.gx, p.gz); beacon.group.position.set(x, g, z); const d = doorOf(p); person.group.position.set(d.x, g + 0.05, d.z); person.group.rotation.y = Math.atan2(d.ux, d.uz); }
  }
  // The doorstep of a place: just outside the tile, on a side with nothing tall next door (south first), so that the
  // parcel, the person waiting and the drone can all be seen. { x, z, g, ux, uz }: the spot and the way it faces.
  const tileOf = ctx.town?.terrain?.tiles instanceof Map ? ctx.town.terrain.tiles : new Map(); const cellOf = new Map(ctx.town?.cells || []);
  const tall = (gx, gz) => { const k = key(gx, gz); if (!tileKeys.has(k)) return false; if (tileOf.get(k)?.fixed) return true; const it = cellOf.get(k)?.item; return !!it && !FLAT.has(it) && ITEMS[it]?.kind === 'build'; };
  function doorOf(p) {
    let top = [0, 1], s = -1;
    for (const [ux, uz] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) { if (!tileKeys.has(key(p.gx + ux, p.gz + uz))) continue; const v =(tall(p.gx + ux, p.gz + uz) ? 0 : 2) + (tall(p.gx + ux * 2, p.gz + uz * 2) ? 0 : 1); if (v > s) { s = v; top = [ux, uz]; } }
    const [x, z] = placeXZ(p); return { x: x + top[0] * DOOR, z: z + top[1] * DOOR, g: groundAt(p.gx, p.gz), ux: top[0], uz: top[1] };
  }
  const clearHoops = () => { for (const h of hoops) dispose(h.mesh.group); hoops = []; };
  // Which delivery is being flown: its pad, its drop-offs and (ages 13-17) the marks over its no-fly zone.
  function use(p) {
    places = p; for (const c of [...zone.children]) dispose(c);
    for (const k of p.nofly || []) { const { gx, gz } = parseKey(k); const [x, z] = tileXZ(gx, gz); const m = makeNoFly(CRUISE); m.group.position.set(x, groundAt(gx, gz), z); zone.add(m.group); }
    park();
  }
  const setView = (v) => { if (S.view !== v) { S.view = v; S.blend = reduce ? 0 : 0.7; } };
  // The drone back on its pad at the start, with its parcel, facing the first drop-off.
  function park() {
    if (!places) return; const [x, z] = placeXZ(places.from); const g = groundAt(places.from.gx, places.from.gz);
    const [tx, tz] = placeXZ(places.drops[0]);
    Object.assign(S, { x, z, y: g + PAD + 0.95, heading: bearing(x, z, tx, tz), speed: 0, vx: 0, vz: 0, tilt: 0, spin: false, step: null, big: 1 });
    S.cam = S.heading; S.view = 'chase'; S.blend = 0; startMark.group.position.set(x, g, z); setParcelDrop(drone, 0); drone.parcel.visible = true;
    for (const p of left.splice(0)) dispose(p); clearHoops();
    setBeacon(places.drops[0]); place();
  }
  function place() {
    drone.group.position.set(S.x, S.y, S.z); drone.group.rotation.y = -S.heading; drone.group.scale.setScalar(SCALE * S.big);
    drone.body.rotation.z = reduce ? 0 : -S.tilt * 0.3; drone.body.rotation.x = reduce ? 0 : -Math.max(-1, Math.min(1, S.speed / HAND_SPEED)) * 0.14;
    const [gx, gz] = toGrid(S.x, S.z); shadow.position.set(S.x, groundAt(gx, gz) + 0.5, S.z); shadow.scale.setScalar(S.big); shadow.visible = S.view !== 'door'; // at the doorstep the parcel itself shows where the drone is
  }
  function view(dt) {
    if (S.view === 'door' && S.door) { const d = S.door; wantP.set(d.x + d.ux * 14 - d.uz * 5, d.g + 19, d.z + d.uz * 14 + d.ux * 5); wantL.set(d.x, d.g + 6, d.z); } // from the open side: the drone, the rope, the parcel and the doorstep
    else if (S.view === 'still' && S.still) { wantP.copy(S.still.p); wantL.copy(S.still.l); }                                       // reduced motion: one still view of the whole route
    else if (reduce) { wantP.set(S.x, S.y + 26, S.z + 32); wantL.set(S.x, S.y, S.z - 3); }                                        // steady: it follows, it never turns
    else { const fx = Math.sin(S.cam), fz = -Math.cos(S.cam); wantP.set(S.x - fx * 18, S.y + 8, S.z - fz * 18); wantL.set(S.x + fx * 9, S.y - 1.5, S.z + fz * 9); }
    if (!camSet || reduce || S.blend <= 0) { camP.copy(wantP); camL.copy(wantL); camSet = true; }
    else { const k = 1 - Math.exp(-dt * 7); camP.lerp(wantP, k); camL.lerp(wantL, k); S.blend -= dt; }
    camera.position.copy(camP); camera.lookAt(camL);
    if (camera.fov !== 50) { camera.fov = 50; camera.updateProjectionMatrix(); }
  }
  ctx.engine.onFrame((dt) => {
    if (S.gone) return; S.t += dt;
    if (S.step) { const fn = S.step; if (fn(dt) === true && S.step === fn) S.step = null; }
    if (!reduce) {
      if (S.spin) for (const r of drone.rotors) r.rotation.y += dt * 34;
      S.cam += turnTo(S.cam, S.heading) * Math.min(1, dt * 3.2);
      beacon.gem.rotation.y += dt * 1.2;
    }
    place(); view(dt);
  });
  // run fn(dt) every frame until it returns true
  const until = (fn) => new Promise((res) => { S.step = (dt) => { if (fn(dt) === true) { res(); return true; } return false; }; });
  const tween = (secs, fn) => { let t = 0; return until((dt) => { t += dt; const k = Math.min(1, t / secs); fn?.(smooth(k)); return k >= 1; }); };

  // Lower the parcel on to the doorstep, where it can be seen, and leave it there: the camera looks from the side, the
  // person waiting cheers and a green tick stands over the parcel. With reduced motion every part is a cut.
  async function deliver(p, keepParcel, onCheer) {
    const d = doorOf(p); const { x, z, g } = d; S.speed = 0; S.vx = 0; S.vz = 0; S.tilt = 0; const low = g + HOVER;
    S.door = d; S.big = 1; setView('door');
    // the drone comes down in front of the building, to just above the doorstep
    if (reduce) { S.x = x; S.z = z; S.y = low; } else { const x0 = S.x, z0 = S.z, y0 = S.y; await tween(0.9, (k) => { S.x = x0 + (x - x0) * k; S.z = z0 + (z - z0) * k; S.y = y0 + (low - y0) * k; }); }
    const depth = (S.y - g - 2) / SCALE;
    if (reduce) { setParcelDrop(drone, depth); await tween(0.7); } else await tween(DROP_SECS * 0.7, (k) => setParcelDrop(drone, depth * k));
    const box = makeParcel(SCALE); box.position.set(x, g + 0.75, z); root.add(box); left.push(box);
    setParcelDrop(drone, 0); drone.parcel.visible = false;
    tick.visible = true; tick.position.set(x, g + 3.4, z); tick.rotation.y = Math.atan2(d.ux, d.uz); person.cheer(1); sound('reward'); onCheer?.(p);
    if (reduce) await tween(1.5);
    else { try { world.confetti?.(new THREE.Vector3(x, g + 2, z), 70); } catch { /* no confetti: the tick is the cheer */ } await tween(1.5, (k) => person.hop(Math.abs(Math.sin(k * Math.PI * 3)) * 0.8)); }
    person.hop(0); drone.parcel.visible = !!keepParcel;
    if (reduce) S.y = CRUISE; else { const y0 = S.y; await tween(0.5, (k) => { S.y = y0 + (CRUISE - y0) * k; }); }
    setView('chase');
  }

  // One frame of hand flying. input: { f, t } (forward and turn), or { x, z } (screen directions) with reduced motion.
  // The drone holds its height and cannot crash; the island's edge gently pulls it back. Returns how far it moved.
  function steer(dt, inp) {
    const x0 = S.x, z0 = S.z;
    if (reduce) {
      const n = Math.hypot(inp.x, inp.z) || 1; const k = Math.min(1, dt * 5);
      S.vx += (inp.x / n * HAND_SPEED - S.vx) * k; S.vz += (inp.z / n * HAND_SPEED - S.vz) * k;
      S.x += S.vx * dt; S.z += S.vz * dt; S.speed = Math.hypot(S.vx, S.vz); if (S.speed > 1) S.heading = bearing(0, 0, S.vx, S.vz); S.y = CRUISE;
    } else {
      S.heading += inp.t * TURN * dt; S.tilt += (inp.t - S.tilt) * Math.min(1, dt * 5);
      const want = inp.f > 0 ? HAND_SPEED * inp.f : HAND_BACK * inp.f; S.speed += (want - S.speed) * Math.min(1, dt * 3);
      S.x += Math.sin(S.heading) * S.speed * dt; S.z -= Math.cos(S.heading) * S.speed * dt;
      S.y += (CRUISE - S.y) * Math.min(1, dt * 2.5);
    }
    [S.x, S.z] = pullInside(S.x, S.z, Math.min(1, dt * 4));
    return Math.hypot(S.x - x0, S.z - z0);
  }

  // ---- by hand. Resolves with { secs, tiles, trail, hoops, of } when every parcel is down. The drone starts side-on,
  // so the first thing to do is turn; gold hoops mark a winding way to the marker. Missing a hoop costs nothing.
  async function hand(input, { onTick, onDrop, onHoop, onCheer } = {}) {
    park(); let started = false; let secs = 0; let last = 0; let dist = 0; let hoopsDone = 0, hoopsAll = 0; const trail = [[places.from.gx, places.from.gz]]; let prev = places.from;
    for (let i = 0; i < places.drops.length; i++) {
      const target = places.drops[i]; const [tx, tz] = placeXZ(target); setBeacon(target);
      hoops = hoopsFor(prev, target, 3).map((h) => { const mesh = makeHoop(4.6, h.facing); mesh.group.position.set(h.x, CRUISE + 0.4, h.z); root.add(mesh.group); return { ...h, mesh }; });
      hoopsAll += hoops.length; let hi = 0; last = now();
      if (i === 0) { const aim = hoops[0] || { x: tx, z: tz }; S.heading = bearing(S.x, S.z, aim.x, aim.z) + Math.PI / 2; S.cam = S.heading; }
      await until((dt) => {
        const inp = input(); const active = reduce ? (inp.x || inp.z) : (inp.f || inp.t);
        if (active && !started) { started = true; S.spin = true; last = now(); }
        if (started) {
          const t = now(); secs += Math.min(1, Math.max(0, (t - last) / 1000)); last = t; // real time, not game time: a slow device does not make the flight look quicker
          dist += steer(dt, inp);
          const g = toGrid(S.x, S.z); const lastP = trail[trail.length - 1]; if (Math.hypot(g[0] - lastP[0], g[1] - lastP[1]) >= 0.8 && trail.length < 78) trail.push([Math.round(g[0] * 10) / 10, Math.round(g[1] * 10) / 10]);
        }
        while (hi < hoops.length) {
          const h = hoops[hi]; const dh = Math.hypot(h.x - S.x, h.z - S.z);
          if (dh < HOOP_R) { h.mesh.done(); hoopsDone++; hi++; sound('good'); onHoop?.(hoopsDone, hoopsAll); continue; }
          const nx = hoops[hi + 1] || { x: tx, z: tz }; // flown past it: the next one is now much nearer
          if (dh > HOOP_R * 1.6 && Math.hypot(nx.x - S.x, nx.z - S.z) < Math.hypot(nx.x - h.x, nx.z - h.z) * 0.55) { hi++; continue; }
          break;
        }
        const aim = hi < hoops.length ? hoops[hi] : { x: tx, z: tz }; const da = Math.hypot(aim.x - S.x, aim.z - S.z); const to = bearing(S.x, S.z, aim.x, aim.z);
        const d = Math.hypot(tx - S.x, tz - S.z);
        onTick?.({ target, hoop: hi < hoops.length ? { n: hi + 1, of: hoops.length } : null, tilesAway: Math.max(0, Math.round(da / T)), secs: Math.floor(secs), tiles: Math.round(dist / T), way: reduce ? to : turnTo(S.heading, to), turn: turnTo(S.heading, to), dx: (aim.x - S.x) / T, dz: (aim.z - S.z) / T, started });
        return started && d < REACH && S.y > CRUISE - 2.5;
      });
      trail.push([target.gx, target.gz]); clearHoops();
      await deliver(target, i + 1 < places.drops.length, onCheer); prev = target;
      if (i + 1 < places.drops.length) onDrop?.(i + 1);
    }
    beacon.group.visible = false; hoopsDone = Math.min(hoopsDone, hoopsAll);
    return { secs: Math.max(1, Math.round(secs)), tiles: Math.max(1, Math.round(dist / T)), trail, hoops: hoopsDone, of: hoopsAll };
  }
  // ---- free flying after the delivery: the same controls, nowhere to be. stopFree() ends it.
  let freeEnd = null;
  function free(input) { S.spin = true; setView('chase'); return new Promise((res) => { freeEnd = res; S.step = (dt) => { steer(dt, input()); return false; }; }); }
  function stopFree() { if (!freeEnd) return; S.step = null; S.speed = 0; S.vx = 0; S.vz = 0; S.tilt = 0; const res = freeEnd; freeEnd = null; res(); }

  // With reduced motion the automatic flight is watched from one still place that shows the whole route.
  function stillView(result) {
    const all = [...result.path, places.from, ...places.drops]; const xs = all.map((p) => tileXZ(p.gx, p.gz)[0]), zs = all.map((p) => tileXZ(p.gx, p.gz)[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2; const w = Math.max(...xs) - Math.min(...xs) + 34, h = Math.max(...zs) - Math.min(...zs) + 34;
    const aspect = camera.aspect || 1.6; const dist = Math.max(w / aspect, h * 1.25) / (2 * Math.tan(25 * Math.PI / 180)) * 1.2;
    S.still = { p: new THREE.Vector3(cx, CRUISE + dist * 0.82, cz + dist * 0.58), l: new THREE.Vector3(cx, 6, cz) }; S.big = 1.8; S.view = 'still';
  }

  // ---- by itself: fly a route.fly() result exactly. onStep(i) names the step being flown.
  async function auto(result, onStep, { onCheer, onMiss } = {}) {
    park(); const done = []; const next = () => places.drops.find((d) => !done.includes(d.k));
    if (reduce) stillView(result);
    await tween(0.5);
    for (const leg of result.legs) {
      onStep?.(leg.i);
      if (leg.kind === 'up') { S.spin = true; const y0 = S.y; if (reduce) { S.y = CRUISE; await tween(0.5); } else await tween(UP_SECS, (k) => { S.y = y0 + (CRUISE - y0) * k; }); }
      else if (leg.kind === 'wait') await tween(0.4);
      else if (leg.kind === 'go') {
        const want = bearing(0, 0, DIRS[leg.dir].dx, DIRS[leg.dir].dz);
        if (reduce) { // tile by tile, each a cut: nothing glides
          S.heading = want; for (let n = 1; n <= leg.n; n++) { [S.x, S.z] = tileXZ(leg.from.gx + DIRS[leg.dir].dx * n, leg.from.gz + DIRS[leg.dir].dz * n); await tween(0.3); }
        } else {
          const from = S.heading; const d = turnTo(from, want); if (Math.abs(d) > 0.02) await tween(Math.max(0.25, Math.abs(d) / 3.5), (k) => { S.heading = from + d * k; }); S.heading = want;
          const [x0, z0] = [S.x, S.z]; const [x1, z1] = tileXZ(leg.to.gx, leg.to.gz); const len = Math.hypot(x1 - x0, z1 - z0); let gone = 0; S.speed = AUTO_SPEED;
          await until((dt) => { gone = Math.min(len, gone + AUTO_SPEED * dt); const k = len ? gone / len : 1; S.x = x0 + (x1 - x0) * k; S.z = z0 + (z1 - z0) * k; return gone >= len; });
          S.speed = 0;
        }
      } else if (leg.kind === 'drop') {
        const p = places.drops.find((d) => d.k === leg.k); done.push(leg.k); await deliver(p, done.length < places.drops.length, onCheer);
        if (reduce) { S.view = 'still'; S.big = 1.8; [S.x, S.z] = placeXZ(p); }
        const n = next(); if (n) setBeacon(n); else beacon.group.visible = false;
      } else if (leg.kind === 'nodrop') { // nobody is waiting here: the parcel goes part of the way down and comes back up
        onMiss?.(leg.i); sound('bad');
        if (reduce || !result.air) await tween(0.8); else { await tween(0.6, (k) => setParcelDrop(drone, 2.5 * k)); await tween(0.6, (k) => setParcelDrop(drone, 2.5 * (1 - k))); setParcelDrop(drone, 0); }
      }
    }
    if (result.stop) onStep?.(result.stop.step);
    await tween(0.7); S.spin = result.air && !reduce;
  }

  return { use, park, hand, free, stopFree, auto, reduce,
    dispose() { S.gone = true; S.step = null; freeEnd = null; for (const p of left.splice(0)) dispose(p); clearHoops(); dispose(root); } };
}

// ---- the route that keeps flying in the town afterwards (index.js show()). Returns a remover.
// Made to be seen from the usual island view: a bold dashed line in the air, a green pad over the start, a red pad over
// each drop-off and a large drone that flies there and back. With reduced motion the drone hangs still on its route.
export function showRoute(townCtx, data, tileKeys) {
  const { scene, world } = townCtx.engine; const reduce = !!townCtx.reduceMotion;
  const ground = (gx, gz) => { try { return tileKeys.has(key(gx, gz)) ? world.tileTop(key(gx, gz)).y : 1; } catch { return 1; } };
  const high = Math.max(...data.pts.map((p) => ground(p[0], p[1]))) + 15;
  const pts = data.pts.map((p) => { const [x, z] = tileXZ(p[0], p[1]); return new THREE.Vector3(x, high, z); });
  const a = data.pts[0], b = data.pts[data.pts.length - 1];
  const full = [new THREE.Vector3(pts[0].x, ground(a[0], a[1]) + 13.5, pts[0].z), ...pts, new THREE.Vector3(pts[pts.length - 1].x, ground(b[0], b[1]) + 11.5, pts[pts.length - 1].z)];
  const root = new THREE.Group(); root.name = 'drone-route'; scene.add(root);
  const line = makeDashes(full, { dash: 3, gap: 1.5, width: 1.7, color: '#ff6a1f' }); line.name = 'drone-route-line'; root.add(line);
  const padAt = (k, height, color) => { const { gx, gz } = parseKey(k); if (!tileKeys.has(k)) return; const [x, z] = tileXZ(gx, gz); const pad = makePad(height, color); pad.group.name = 'drone-route-pad'; pad.group.position.set(x, ground(gx, gz), z); root.add(pad.group); };
  padAt(data.from.k, 10, '#2e7d4f'); for (const d of data.drops) padAt(d.k, 8, '#c0392b');
  const drone = makeDrone(3, '#e8743b'); // orange blades: the game's own "can't build" mark is a dark cross
  { const mat = new THREE.MeshLambertMaterial({ color: '#ff6a1f', emissive: '#ff6a1f', emissiveIntensity: 0.5 }); const halo = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.16, 6, 28), mat); halo.rotation.x = Math.PI / 2; halo.position.y = 0.1; drone.group.add(halo); } // a bright ring round it, so it stands out from above
  drone.group.name = 'drone-route-drone'; root.add(drone.group);
  const lens = []; let total = 0; for (let i = 1; i < full.length; i++) { const l = full[i].distanceTo(full[i - 1]); lens.push(l); total += l; }
  const at = (s) => { let rest = s, i = 0; while (i < lens.length - 1 && rest > lens[i]) { rest -= lens[i]; i++; } return { i, k: lens[i] ? Math.min(1, rest / lens[i]) : 0 }; };
  const put = (s) => { const { i, k } = at(s); drone.group.position.lerpVectors(full[i], full[i + 1], k); return i; };
  { const i = put(reduce ? total * 0.42 : 0); const p0 = full[Math.max(1, i)], p1 = full[Math.min(full.length - 2, Math.max(1, i) + 1)] || p0; if (Math.hypot(p1.x - p0.x, p1.z - p0.z) > 0.1) drone.group.rotation.y = -bearing(p0.x, p0.z, p1.x, p1.z); }
  let raf = 0; let off = false;
  if (!reduce && typeof requestAnimationFrame === 'function') {
    let s = 0, dir = 1, wait = 1, last = 0;
    const tick = (t) => {
      if (off) return; raf = requestAnimationFrame(tick); const dt = Math.min(0.05, last ? (t - last) / 1000 : 0); last = t;
      for (const r of drone.rotors) r.rotation.y += dt * 30;
      if (wait > 0) { wait -= dt; return; }
      s += dir * 7 * dt; if (s >= total) { s = total; dir = -1; wait = 2; drone.parcel.visible = false; } else if (s <= 0) { s = 0; dir = 1; wait = 2; drone.parcel.visible = true; }
      const i = put(s); const p0 = full[i], p1 = full[i + 1];
      if (Math.hypot(p1.x - p0.x, p1.z - p0.z) > 0.1) { const want = dir > 0 ? bearing(p0.x, p0.z, p1.x, p1.z) : bearing(p1.x, p1.z, p0.x, p0.z); const cur = -drone.group.rotation.y; drone.group.rotation.y = -(cur + turnTo(cur, want) * Math.min(1, dt * 5)); }
    };
    raf = requestAnimationFrame(tick);
  }
  return () => { off = true; if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf); dispose(root); };
}
