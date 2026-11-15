// Drone delivery: the drone in the 3D town. Hand flying, flying a set of steps, and the camera behind the drone.
// No page elements here (js/modules/drone/ui.js) and no route rules (route.js): this file only moves things.
import * as THREE from 'three';
import { T, DIRS, tileXZ, toGrid, key, pullInside, bearing, turnTo } from './geo.js';
import { AUTO_SPEED, UP_SECS, DROP_SECS } from './route.js';
import { makeDrone, makeBeacon, makePad, makeShadow, makeParcel, makeDots, setParcelDrop, dispose } from './model.js';

export const CRUISE = 18;       // flying height: above every roof and tree on the tiles
const PAD = 10;                 // the landing pad stands on a post above the roof of the start
const HAND_SPEED = 8, HAND_BACK = 4, TURN = 1.7, REACH = 4.4; // forgiving: the parcel goes down anywhere within about a tile
const SCALE = 1.5;
const smooth = (t) => t * t * (3 - 2 * t);

export function createFlight(ctx, places, tileKeys) {
  const { scene, camera, world } = ctx.engine; const reduce = !!ctx.settings.reduceMotion;
  const root = new THREE.Group(); root.name = 'drone-module'; scene.add(root);
  const drone = makeDrone(SCALE); root.add(drone.group);
  const shadow = makeShadow(); root.add(shadow);
  const startMark = makePad(PAD); root.add(startMark.group);
  const beacon = makeBeacon('#d2452d', CRUISE + 6); root.add(beacon.group);
  const left = []; // parcels left on the ground
  const groundAt = (gx, gz) => { const k = key(Math.round(gx), Math.round(gz)); if (!tileKeys.has(k)) return 1; try { return world.tileTop(k).y; } catch { return 1; } };
  const placeXZ = (p) => tileXZ(p.gx, p.gz);
  const S = { x: 0, y: 0, z: 0, heading: 0, cam: 0, speed: 0, vx: 0, vz: 0, tilt: 0, spin: false, step: null, gone: false, t: 0 };

  function setBeacon(p) { beacon.group.visible = !!p; if (p) { const [x, z] = placeXZ(p); beacon.group.position.set(x, groundAt(p.gx, p.gz), z); } }
  // The drone back on the ground at the start, with its parcel, facing the first drop-off.
  function park() {
    const [x, z] = placeXZ(places.from); const g = groundAt(places.from.gx, places.from.gz);
    const [tx, tz] = placeXZ(places.drops[0]);
    Object.assign(S, { x, z, y: g + PAD + 0.95, heading: bearing(x, z, tx, tz), speed: 0, vx: 0, vz: 0, tilt: 0, spin: false, step: null });
    S.cam = S.heading; startMark.group.position.set(x, g, z); setParcelDrop(drone, 0); drone.parcel.visible = true;
    for (const p of left.splice(0)) dispose(p);
    setBeacon(places.drops[0]); place();
  }
  function place() {
    drone.group.position.set(S.x, S.y, S.z); drone.group.rotation.y = -S.heading; drone.body.rotation.z = reduce ? 0 : -S.tilt * 0.3; drone.body.rotation.x = reduce ? 0 : -Math.max(-1, Math.min(1, S.speed / HAND_SPEED)) * 0.14;
    const [gx, gz] = toGrid(S.x, S.z); shadow.position.set(S.x, groundAt(gx, gz) + 0.5, S.z);
  }
  function view() {
    if (reduce) { camera.position.set(S.x, S.y + 26, S.z + 32); camera.lookAt(S.x, S.y, S.z - 3); } // steady: it follows, it never turns
    else { const fx = Math.sin(S.cam), fz = -Math.cos(S.cam); camera.position.set(S.x - fx * 18, S.y + 8, S.z - fz * 18); camera.lookAt(S.x + fx * 9, S.y - 1.5, S.z + fz * 9); }
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
    place(); view();
  });
  // run fn(dt) every frame until it returns true
  const until = (fn) => new Promise((res) => { S.step = (dt) => { if (fn(dt) === true) { res(); return true; } return false; }; });
  const tween = (secs, fn) => { let t = 0; return until((dt) => { t += dt; const k = Math.min(1, t / secs); fn?.(smooth(k)); return k >= 1; }); };

  // Lower the parcel to the ground and leave it there (cut, with reduced motion).
  async function lower(p, keepParcel) {
    const g = groundAt(p.gx, p.gz); const depth = (S.y - g - 1.2) / SCALE;
    if (!reduce) await tween(DROP_SECS * 0.7, (k) => setParcelDrop(drone, depth * k));
    const box = makeParcel(SCALE); box.position.set(S.x, g + 0.55, S.z); root.add(box); left.push(box);
    setParcelDrop(drone, 0); drone.parcel.visible = false;
    await tween(DROP_SECS * 0.3);
    drone.parcel.visible = !!keepParcel;
  }

  // ---- by hand. input(): { f: forward -1..1, t: turn -1..1 } (or { x, z } screen directions with reduced motion).
  // Resolves with { secs, tiles, trail } when every parcel is down. The drone holds its height and cannot crash.
  async function hand(input, { onTick, onDrop } = {}) {
    park(); let started = false; let secs = 0; let dist = 0; let i = 0; const trail = [[places.from.gx, places.from.gz]]; let busy = false;
    while (i < places.drops.length) {
      const target = places.drops[i]; const [tx, tz] = placeXZ(target); setBeacon(target);
      await until((dt) => {
        const inp = input(); const active = reduce ? (inp.x || inp.z) : (inp.f || inp.t);
        if (active && !started) { started = true; S.spin = true; if (reduce) S.y = CRUISE; }
        if (started) {
          secs += dt; const x0 = S.x, z0 = S.z;
          if (reduce) {
            const n = Math.hypot(inp.x, inp.z) || 1; const k = Math.min(1, dt * 5);
            S.vx += (inp.x / n * HAND_SPEED - S.vx) * k; S.vz += (inp.z / n * HAND_SPEED - S.vz) * k;
            S.x += S.vx * dt; S.z += S.vz * dt; S.speed = Math.hypot(S.vx, S.vz); if (S.speed > 1) S.heading = bearing(0, 0, S.vx, S.vz);
          } else {
            S.heading += inp.t * TURN * dt; S.tilt += (inp.t - S.tilt) * Math.min(1, dt * 5);
            const want = inp.f > 0 ? HAND_SPEED * inp.f : HAND_BACK * inp.f; S.speed += (want - S.speed) * Math.min(1, dt * 3);
            S.x += Math.sin(S.heading) * S.speed * dt; S.z -= Math.cos(S.heading) * S.speed * dt;
            S.y += (CRUISE - S.y) * Math.min(1, dt * 2.5);
          }
          [S.x, S.z] = pullInside(S.x, S.z, Math.min(1, dt * 4)); // the island's edge gently pulls it back
          dist += Math.hypot(S.x - x0, S.z - z0);
          const g = toGrid(S.x, S.z); const lastP = trail[trail.length - 1]; if (Math.hypot(g[0] - lastP[0], g[1] - lastP[1]) >= 0.8 && trail.length < 80) trail.push([Math.round(g[0] * 10) / 10, Math.round(g[1] * 10) / 10]);
        }
        const d = Math.hypot(tx - S.x, tz - S.z); const to = bearing(S.x, S.z, tx, tz);
        onTick?.({ target, tilesAway: Math.max(0, Math.round(d / T)), secs: Math.floor(secs), tiles: Math.round(dist / T), way: reduce ? to : turnTo(S.heading, to), turn: turnTo(S.heading, to), dx: (tx - S.x) / T, dz: (tz - S.z) / T, started });
        return started && d < REACH && S.y > CRUISE - 2.5;
      });
      S.speed = 0; S.vx = 0; S.vz = 0; S.tilt = 0; busy = true;
      trail.push([target.gx, target.gz]);
      await lower(target, i + 1 < places.drops.length); busy = false; i++;
      if (i < places.drops.length) onDrop?.(i);
    }
    setBeacon(null); S.spin = false; void busy;
    return { secs: Math.max(1, Math.round(secs)), tiles: Math.max(1, Math.round(dist / T)), trail };
  }

  // ---- by itself: fly a route.fly() result exactly. onStep(i) names the step being flown.
  async function auto(result, onStep) {
    park(); const next = () => places.drops.find((d) => !done.includes(d.k)); const done = [];
    await tween(0.5);
    for (const leg of result.legs) {
      onStep?.(leg.i);
      if (leg.kind === 'up') { S.spin = true; const y0 = S.y; if (reduce) { S.y = CRUISE; await tween(0.5); } else await tween(UP_SECS, (k) => { S.y = y0 + (CRUISE - y0) * k; }); }
      else if (leg.kind === 'wait') await tween(0.4);
      else if (leg.kind === 'go') {
        const want = bearing(0, 0, DIRS[leg.dir].dx, DIRS[leg.dir].dz);
        if (reduce) S.heading = want; else { const from = S.heading; const d = turnTo(from, want); if (Math.abs(d) > 0.02) await tween(Math.max(0.25, Math.abs(d) / 3.5), (k) => { S.heading = from + d * k; }); S.heading = want; }
        const [x0, z0] = [S.x, S.z]; const [x1, z1] = tileXZ(leg.to.gx, leg.to.gz); const len = Math.hypot(x1 - x0, z1 - z0); let gone = 0; S.speed = AUTO_SPEED;
        await until((dt) => { gone = Math.min(len, gone + AUTO_SPEED * dt); const k = len ? gone / len : 1; S.x = x0 + (x1 - x0) * k; S.z = z0 + (z1 - z0) * k; return gone >= len; });
        S.speed = 0;
      } else if (leg.kind === 'drop') { const p = places.drops.find((d) => d.k === leg.k); done.push(leg.k); await lower(p, done.length < places.drops.length); setBeacon(next() || null); }
      else if (leg.kind === 'nodrop') { // nobody is waiting here: the parcel goes part of the way down and comes back up
        if (reduce || !result.air) await tween(0.6); else { await tween(0.6, (k) => setParcelDrop(drone, 2.5 * k)); await tween(0.6, (k) => setParcelDrop(drone, 2.5 * (1 - k))); setParcelDrop(drone, 0); }
      }
    }
    if (result.stop) onStep?.(result.stop.step);
    await tween(0.7); S.spin = result.air && !reduce;
  }

  park();
  return { park, hand, auto, reduce,
    dispose() { S.gone = true; S.step = null; for (const p of left.splice(0)) dispose(p); dispose(root); } };
}

// ---- the route that keeps flying in the town afterwards (index.js show()). Returns a remover.
export function showRoute(townCtx, data, tileKeys) {
  const { scene, world } = townCtx.engine; const reduce = !!townCtx.reduceMotion;
  const ground = (gx, gz) => { try { return tileKeys.has(key(gx, gz)) ? world.tileTop(key(gx, gz)).y : 1; } catch { return 1; } };
  const high = Math.max(...data.pts.map((p) => ground(p[0], p[1]))) + 12;
  const pts = data.pts.map((p) => { const [x, z] = tileXZ(p[0], p[1]); return new THREE.Vector3(x, high, z); });
  const a = data.pts[0], b = data.pts[data.pts.length - 1];
  const full = [new THREE.Vector3(pts[0].x, ground(a[0], a[1]) + 11, pts[0].z), ...pts, new THREE.Vector3(pts[pts.length - 1].x, ground(b[0], b[1]) + 9, pts[pts.length - 1].z)];
  const root = new THREE.Group(); root.name = 'drone-route'; scene.add(root);
  root.add(makeDots(full, 3, '#e8743b', 0.7));
  const drone = makeDrone(2.4, '#e8743b'); // orange blades: the game's own "can't build" mark is a dark cross root.add(drone.group); drone.group.position.copy(full[0]);
  if (full.length > 1) drone.group.rotation.y = -bearing(full[1].x, full[1].z, full[2]?.x ?? full[1].x, full[2]?.z ?? full[1].z);
  let raf = 0; let off = false;
  if (!reduce && typeof requestAnimationFrame === 'function') {
    const lens = []; let total = 0; for (let i = 1; i < full.length; i++) { const l = full[i].distanceTo(full[i - 1]); lens.push(l); total += l; }
    let s = 0, dir = 1, wait = 1, last = 0;
    const tick = (now) => {
      if (off) return; raf = requestAnimationFrame(tick); const dt = Math.min(0.05, last ? (now - last) / 1000 : 0); last = now;
      for (const r of drone.rotors) r.rotation.y += dt * 30;
      if (wait > 0) { wait -= dt; return; }
      s += dir * 6 * dt; if (s >= total) { s = total; dir = -1; wait = 2; drone.parcel.visible = false; } else if (s <= 0) { s = 0; dir = 1; wait = 2; drone.parcel.visible = true; }
      let rest = s, i = 0; while (i < lens.length - 1 && rest > lens[i]) { rest -= lens[i]; i++; }
      const p0 = full[i], p1 = full[i + 1]; const k = lens[i] ? rest / lens[i] : 0; drone.group.position.lerpVectors(p0, p1, k);
      if (Math.hypot(p1.x - p0.x, p1.z - p0.z) > 0.1) { const want = dir > 0 ? bearing(p0.x, p0.z, p1.x, p1.z) : bearing(p1.x, p1.z, p0.x, p0.z); const cur = -drone.group.rotation.y; drone.group.rotation.y = -(cur + turnTo(cur, want) * Math.min(1, dt * 5)); }
    };
    raf = requestAnimationFrame(tick);
  }
  return () => { off = true; if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf); dispose(root); };
}
