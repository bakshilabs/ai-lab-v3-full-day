// What the "power" module leaves in the town: scenery only. The town's numbers and its own lights are untouched.
//   by day    a control hut with a tall battery gauge (big enough to find from the usual island view), on an open
//             tile near the town's power kit, and a lantern post at every home
//   at night  each lantern follows the child's rules: lit, with a warm pool on the ground, when the rules keep that
//             home on at this hour; dark when the rules leave it without power (the same model the module uses, on
//             a still day, or the winter night when the town is in winter). The gauge shows the battery at that hour.
import { kitFrom, signSpot } from './model.js';
import { cleanRules, runRules } from './rules.js';

const LIT = '#ffd66b', UNLIT = '#353c5c', DAY = '#f4ead2';

export function show(townCtx, data) {
  const nothing = () => {};
  const { THREE, scene, world, stage } = townCtx?.engine || {};
  if (!THREE || !scene || !world?.tileTop || !data) return nothing;
  const rules = cleanRules(data.rules, false); if (!rules.list.length) return nothing;
  const cells = townCtx.town?.cells; const tiles = townCtx.town?.terrain?.tiles;
  let kit; try { kit = kitFrom(cells, tiles); } catch { return nothing; }
  const top = (k) => { try { return k ? world.tileTop(k) : null; } catch { return null; } };
  const homes = kit.homes.map((h, i) => ({ i, pos: h.practice ? null : top(h.k) })).filter((h) => h.pos);
  const days = { still: runRules(kit, 'still', rules), winter: runRules(kit, 'winter', rules) };
  const group = new THREE.Group(); group.name = 'power-town'; scene.add(group); const bin = []; const keep = (x) => { bin.push(x); return x; };
  const box = keep(new THREE.BoxGeometry(1, 1, 1)); const lam = (c) => keep(new THREE.MeshLambertMaterial({ color: c })); const flat = (c) => keep(new THREE.MeshBasicMaterial({ color: c }));
  const post = lam('#7a5a33'); const mats = { lit: flat(LIT), dark: flat(UNLIT), day: lam(DAY), empty: lam('#cfc2a6'), full: flat('#8e5cd9') };
  const poolG = keep(new THREE.CylinderGeometry(4.1, 4.1, 0.05, 8)); const poolM = keep(new THREE.MeshBasicMaterial({ color: '#d99a4e', polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }));
  // a lantern at each home, and the pool of light it throws when lit
  for (const h of homes) {
    const x = h.pos.x + 2.5, z = h.pos.z + 2.5, y = h.pos.y;
    const p = new THREE.Mesh(box, post); p.scale.set(0.3, 2.2, 0.3); p.position.set(x, y + 1.1, z); group.add(p);
    h.lamp = new THREE.Mesh(box, mats.day); h.lamp.name = 'power-lamp'; h.lamp.scale.set(0.8, 0.8, 0.8); h.lamp.position.set(x, y + 2.55, z); group.add(h.lamp);
    const capM = new THREE.Mesh(box, post); capM.scale.set(1.0, 0.16, 1.0); capM.position.set(x, y + 3.03, z); group.add(capM);
    h.pool = new THREE.Mesh(poolG, poolM); h.pool.name = 'power-pool'; h.pool.position.set(h.pos.x, y + 0.05, h.pos.z); h.pool.rotation.y = Math.PI / 8; h.pool.visible = false; group.add(h.pool);
  }
  // the control hut and its battery gauge
  const key = signSpot(cells, tiles, kit); const at = top(key); let hut = null; const bars = [];
  if (at) {
    hut = new THREE.Group(); hut.name = 'power-hut'; hut.position.set(at.x, at.y, at.z);
    const add = (mat, sx, sy, sz, x, y, z) => { const m = new THREE.Mesh(box, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); hut.add(m); return m; };
    add(lam('#b08a55'), 5.0, 0.3, 4.2, 0, 0.15, 0);                 // plinth
    add(lam('#f2e2c4'), 2.6, 2.4, 2.6, -0.9, 1.5, -0.3);            // the hut
    add(lam('#2e9b5a'), 3.0, 0.5, 3.0, -0.9, 2.95, -0.3);           // its green roof
    add(lam('#1f7442'), 2.2, 0.4, 2.2, -0.9, 3.4, -0.3);
    add(lam('#7a5a33'), 0.8, 1.5, 0.12, -0.9, 1.05, 1.02);          // door
    add(flat('#f2b632'), 0.7, 0.7, 0.12, -0.9, 2.25, 1.02);         // the lightning badge over the door
    add(post, 0.3, 6.6, 0.3, 1.5, 3.6, 0.2);                        // the gauge mast
    add(lam('#3b2a1e'), 1.7, 4.3, 0.5, 1.5, 4.6, 0.6);              // gauge frame
    add(lam('#3b2a1e'), 0.7, 0.35, 0.5, 1.5, 6.9, 0.6);             // the battery's cap
    for (let n = 0; n < 4; n++) bars.push(add(mats.empty, 1.25, 0.8, 0.2, 1.5, 3.05 + n * 1.0, 0.82));
    add(flat('#ff6b4a'), 0.5, 0.5, 0.5, 1.5, 7.3, 0.2);             // a beacon on top
    group.add(hut);
  }
  if (!homes.length && !hut) { scene.remove(group); for (const x of bin) x.dispose(); return nothing; }

  const taken = () => { try { return !!key && typeof world.walkCost === 'function' && world.walkCost(key) === Infinity; } catch { return false; } };
  let sig = '';
  const draw = () => {
    const night = (stage?.night ?? 0) > 0.45; const clock = Math.floor((((stage?.hour ?? 12) % 24) + 24) % 24); const day = (stage?.winter ?? 0) > 0.5 ? days.winter : days.still;
    const hr = day.hours.find((x) => x.clock === clock) || day.hours[0]; const level = kit.cap ? hr.level / kit.cap : 0; const hide = taken();
    const next = `${night ? 1 : 0}${clock}${day.dayId}${hide ? 1 : 0}`; if (next === sig) return; sig = next;
    for (const h of homes) { const on = !!hr.lit[h.i]; h.lamp.material = !night ? mats.day : on ? mats.lit : mats.dark; h.pool.visible = night && on; }
    bars.forEach((b, n) => { b.material = level > n / 4 + 0.02 ? mats.full : mats.empty; });
    if (hut) hut.visible = !hide;
  };
  draw();
  // show() has no frame hook: a slow loop of its own (twice a second is plenty; nothing here moves)
  let raf = 0, last = 0; const loop = (t) => { raf = requestAnimationFrame(loop); if (t - last < 500) return; last = t; try { draw(); } catch { /* the town changed under us: leave it */ } };
  if (typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(loop);
  return () => { if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf); scene.remove(group); for (const x of bin) { try { x.dispose(); } catch { /* gone */ } } };
}
