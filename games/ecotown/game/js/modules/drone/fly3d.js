// Drones at work: flying by hand with height and wind (missions 2 and 5). Loaded only in the browser.
// The drone moves the way a beginner flies a real one: the camera always looks north, the arrow keys move it north,
// south, east and west (pitch and roll), Space climbs and Shift comes down. The wind pushes it, as it would a real
// drone with its position hold switched off. One world unit is about one metre.
import * as THREE from 'three';
import { makeDrone, makeShadow, dispose } from './model.js';
import { key, T, X0, Z0 } from './geo.js';

const SPEED = 6, CLIMB = 3.2, DOWN_ACC = 4.5, DOWN_MAX = 6, SCALE = 1.1;

// origin: { x, z } the world point the flying happens round. radius: how far from it the drone may go.
export function createFly3d(ctx, { origin, radius = 40, cam = { up: 17, back: 19 } }) {
  const { scene, camera, world } = ctx.engine; const reduce = !!ctx.settings.reduceMotion;
  const tiles = ctx.town?.terrain?.tiles instanceof Map ? ctx.town.terrain.tiles : new Map();
  const root = new THREE.Group(); root.name = 'drone-module'; scene.add(root);
  const drone = makeDrone(SCALE); root.add(drone.group); drone.parcel.visible = false;
  const shadow = makeShadow(); shadow.scale.setScalar(0.75); root.add(shadow);
  // a thin line straight down from the drone to its shadow, so where it is over the ground is easy to read from behind
  const plumb = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 6), new THREE.MeshBasicMaterial({ color: '#3b2a1e' })); root.add(plumb);
  // ground height under a world point (the island's tile tops; 1 off the tiles)
  const groundAt = (x, z) => { const gx = Math.floor((x - X0) / T), gz = Math.floor((z - Z0) / T); const k = key(gx, gz); if (!tiles.has(k)) return 1; try { return world.tileTop(k).y; } catch { return 1; } };
  const S = { x: origin.x, y: 0, z: origin.z, vx: 0, vy: 0, vz: 0, floor: null, wind: { x: 0, z: 0 }, gone: false, t: 0, spin: false, still: null };
  S.y = groundAt(S.x, S.z); S.floor = S.y;
  const camP = new THREE.Vector3(), camL = new THREE.Vector3(), wantP = new THREE.Vector3(), wantL = new THREE.Vector3(); let camSet = false;
  let step = null; let input = () => ({ x: 0, z: 0, y: 0 }); let frozen = true;

  // floor(x, z): what the drone lands on there (a pad's top or the ground). Missions may set it.
  let floorAt = (x, z) => groundAt(x, z);
  function move(dt) {
    const inp = frozen ? { x: 0, z: 0, y: 0 } : input(); const onGround = S.y <= S.floor + 0.02;
    // up and down: climb at a steady rate; coming down gets faster the longer it is held (let go to slow down)
    if (inp.y > 0) S.vy += (CLIMB - S.vy) * Math.min(1, dt * 6);
    else if (inp.y < 0) S.vy = Math.max(-DOWN_MAX, Math.min(0, S.vy) - DOWN_ACC * dt);
    else S.vy += (0 - S.vy) * Math.min(1, dt * 5);
    // sideways: towards where the keys point, plus the wind; on the ground the wind cannot move it
    const n = Math.hypot(inp.x, inp.z) || 1; const wx = onGround ? 0 : S.wind.x, wz = onGround ? 0 : S.wind.z;
    const tx = onGround ? 0 : inp.x / n * SPEED + wx, tz = onGround ? 0 : inp.z / n * SPEED + wz; const k = Math.min(1, dt * 2.6);
    S.vx += (tx - S.vx) * k; S.vz += (tz - S.vz) * k;
    S.x += S.vx * dt; S.z += S.vz * dt;
    const dx = S.x - origin.x, dz = S.z - origin.z, d = Math.hypot(dx, dz); if (d > radius) { S.x = origin.x + dx / d * radius; S.z = origin.z + dz / d * radius; S.vx *= 0.5; S.vz *= 0.5; }
    S.floor = floorAt(S.x, S.z); const vyWas = S.vy; S.y += S.vy * dt;
    let touched = null; if (S.y <= S.floor) { if (!onGround) touched = Math.max(0, -vyWas); S.y = S.floor; S.vy = Math.max(0, S.vy); } // touching down, also when the ground rises under it (the edge of a pad)
    S.y = Math.min(S.y, S.floor + 60);
    return touched; // the speed it came down at, on the frame it touched down
  }
  function place() {
    drone.group.position.set(S.x, S.y + 0.6 * SCALE, S.z); drone.group.rotation.y = 0;
    drone.body.rotation.z = reduce ? 0 : -S.vx / SPEED * 0.25; drone.body.rotation.x = reduce ? 0 : S.vz / SPEED * 0.22;
    const g = groundAt(S.x, S.z); shadow.position.set(S.x, g + 0.15, S.z);
    const len = S.y + 0.2 - g; plumb.visible = len > 1; if (plumb.visible) { plumb.scale.y = len; plumb.position.set(S.x, g + len / 2, S.z); }
  }
  function view(dt) {
    if (S.still) { wantP.copy(S.still.p); wantL.copy(S.still.l); }
    else { wantP.set(S.x, S.y + cam.up, S.z + cam.back); wantL.set(S.x, S.y - (cam.down ?? 1.5), S.z - (cam.ahead ?? 3.5)); }
    if (!camSet || reduce) { camP.copy(wantP); camL.copy(wantL); camSet = true; } else { const k = 1 - Math.exp(-dt * 6); camP.lerp(wantP, k); camL.lerp(wantL, k); }
    camera.position.copy(camP); camera.lookAt(camL); if (camera.fov !== 55) { camera.fov = 55; camera.updateProjectionMatrix(); }
  }
  const ticks = new Set();
  ctx.engine.onFrame((dt) => {
    if (S.gone) return; dt = Math.min(0.05, dt); S.t += dt;
    const touched = move(dt);
    S.spin = S.y > S.floor + 0.02 || S.vy > 0;
    if (!reduce && S.spin) for (const r of drone.rotors) r.rotation.y += dt * 34;
    for (const f of ticks) f(dt, { touched });
    if (step && step(dt, { touched }) === true) step = null;
    place(); view(dt);
  });
  // run fn(dt, info) every frame until it returns true
  const until = (fn) => new Promise((res) => { step = (dt, info) => { if (fn(dt, info) === true) { res(); return true; } return false; }; });
  return {
    root, drone, S, groundAt, until, reduce,
    height: () => S.y - groundAt(S.x, S.z),
    setInput(fn) { input = fn; }, freeze(v) { frozen = !!v; if (frozen) { S.vx = 0; S.vz = 0; S.vy = 0; } },
    setWind(x, z) { S.wind.x = x; S.wind.z = z; }, setFloor(fn) { floorAt = fn || ((x, z) => groundAt(x, z)); },
    placeAt(x, z, y) { S.x = x; S.z = z; S.floor = floorAt(x, z); S.y = Math.max(S.floor, y ?? S.floor); S.vx = S.vy = S.vz = 0; place(); camSet = false; },
    still(p, l) { S.still = p ? { p: new THREE.Vector3(...p), l: new THREE.Vector3(...l) } : null; camSet = false; },
    onTick(f) { ticks.add(f); return () => ticks.delete(f); },
    add(obj) { root.add(obj); return obj; },
    dispose() { S.gone = true; step = null; ticks.clear(); dispose(root); },
  };
}

// ---------------------------------------------------------------- the page: keys, the on-screen pad and the read-outs
// Arrow keys or WASD move; Space or E climbs; Shift or Q comes down. Keys are kept inside the module while flying.
export function createFlyPad(ctx, { touch }) {
  const root = ctx.root; const held = new Set(); const padHeld = new Set(); let on = false;
  const KEYS = { arrowup: 'n', w: 'n', arrowdown: 's', s: 's', arrowleft: 'w', a: 'w', arrowright: 'e', d: 'e', ' ': 'up', e: 'up', shift: 'down', q: 'down', pageup: 'up', pagedown: 'down' };
  const onKey = (ev) => {
    if (!on) return; const k = KEYS[String(ev.key).toLowerCase()]; if (!k || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    ev.preventDefault(); ev.stopPropagation(); if (ev.type === 'keydown') held.add(k); else held.delete(k);
  };
  const clear = () => { held.clear(); padHeld.clear(); for (const b of root.querySelectorAll('.df-pad .on')) b.classList.remove('on'); };
  addEventListener('keydown', onKey, true); addEventListener('keyup', onKey, true); addEventListener('blur', clear);
  const pressed = (k) => held.has(k) || padHeld.has(k);
  const input = () => ({ x: (pressed('e') ? 1 : 0) - (pressed('w') ? 1 : 0), z: (pressed('s') ? 1 : 0) - (pressed('n') ? 1 : 0), y: (pressed('up') ? 1 : 0) - (pressed('down') ? 1 : 0) });
  const hud = document.createElement('div'); hud.className = 'df-hud'; hud.hidden = true; hud.setAttribute('role', 'status');
  hud.innerHTML = '<div class="df-task"></div><div class="df-read"></div>';
  const pad = document.createElement('div'); pad.className = 'df-pad'; pad.hidden = true; pad.setAttribute('role', 'group'); pad.setAttribute('aria-label', 'Flying buttons');
  pad.innerHTML = `<button type="button" data-df="n" aria-label="Fly north">▲</button><button type="button" data-df="w" aria-label="Fly west">◀</button><button type="button" data-df="s" aria-label="Fly south">▼</button><button type="button" data-df="e" aria-label="Fly east">▶</button>
    <button type="button" data-df="up" aria-label="Go up">⤒<small>Up</small></button><button type="button" data-df="down" aria-label="Come down">⤓<small>Down</small></button>`;
  for (const b of pad.querySelectorAll('button')) {
    const k = b.dataset.df; const down = (e) => { e.preventDefault(); padHeld.add(k); b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch { /* pointerup still lets go */ } };
    const up = () => { padHeld.delete(k); b.classList.remove('on'); };
    b.addEventListener('pointerdown', down); for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, up); b.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  root.append(hud, pad);
  const how = touch ? 'Hold the arrow buttons to move. Hold Up to climb and Down to come down.' : 'Arrow keys move the drone. Hold Space to climb and Shift to come down.';
  return {
    input, how,
    show() { on = true; hud.hidden = false; pad.hidden = false; try { document.activeElement?.blur?.(); } catch { /* nothing focused */ } },
    hide() { on = false; hud.hidden = true; pad.hidden = true; clear(); },
    task(html) { hud.querySelector('.df-task').innerHTML = html; },
    read(html) { const r = hud.querySelector('.df-read'); if (r.innerHTML !== html) r.innerHTML = html; },
    off() { removeEventListener('keydown', onKey, true); removeEventListener('keyup', onKey, true); removeEventListener('blur', clear); hud.remove(); pad.remove(); },
  };
}
