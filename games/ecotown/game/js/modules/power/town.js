// What the "power" module leaves in the town: scenery only, the town's numbers and its own lights are untouched.
//   by day    a small control cabinet with a battery gauge, on an open tile near the town's power kit
//   at night  a porch lantern at every home: lit when the child's rules keep that home on at this hour, dark when
//             the rules leave it without power (worked out with the same model the module uses, on a still day)
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
  const post = lam('#7a5a33'); const mats = { lit: flat(LIT), dark: flat(UNLIT), day: lam(DAY) };
  // a lantern at each home
  for (const h of homes) {
    const p = new THREE.Mesh(box, post); p.scale.set(0.22, 1.5, 0.22); p.position.set(h.pos.x + 2.55, h.pos.y + 0.75, h.pos.z + 2.55); group.add(p);
    h.lamp = new THREE.Mesh(box, mats.day); h.lamp.scale.set(0.5, 0.5, 0.5); h.lamp.position.set(h.pos.x + 2.55, h.pos.y + 1.7, h.pos.z + 2.55); group.add(h.lamp);
    const capM = new THREE.Mesh(box, post); capM.scale.set(0.66, 0.12, 0.66); capM.position.set(h.pos.x + 2.55, h.pos.y + 2.0, h.pos.z + 2.55); group.add(capM);
  }
  // the control cabinet
  const key = signSpot(cells, tiles, kit); const at = top(key); let cabinet = null; const bars = [];
  if (at) {
    cabinet = new THREE.Group(); cabinet.position.set(at.x, at.y, at.z);
    const add = (mat, sx, sy, sz, x, y, z) => { const m = new THREE.Mesh(box, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); cabinet.add(m); return m; };
    add(lam('#b08a55'), 2.6, 0.3, 1.8, 0, 0.15, 0);                // plinth
    add(lam('#2e9b5a'), 2.0, 1.9, 1.1, 0, 1.25, 0);                // cabinet
    add(lam('#1f7442'), 2.3, 0.22, 1.4, 0, 2.3, 0);                // lid
    add(lam('#fffaf0'), 1.5, 1.0, 0.1, 0, 1.45, 0.58);             // gauge plate
    for (let n = 0; n < 4; n++) bars.push(add(mats.day, 0.26, 0.7, 0.1, -0.5 + n * 0.33, 1.45, 0.64));
    add(flat('#f2b632'), 0.3, 0.3, 0.1, 0, 0.6, 0.58);             // the lightning badge
    const mast = add(post, 0.16, 1.5, 0.16, 0.8, 3.1, 0); mast.name = 'mast'; add(flat('#ff6b4a'), 0.3, 0.3, 0.3, 0.8, 3.95, 0);
    group.add(cabinet);
  }
  if (!homes.length && !cabinet) { scene.remove(group); for (const x of bin) x.dispose(); return nothing; }

  const taken = () => { try { return !!key && typeof world.walkCost === 'function' && world.walkCost(key) === Infinity; } catch { return false; } };
  let sig = '';
  const draw = () => {
    const night = (stage?.night ?? 0) > 0.45; const clock = Math.floor((((stage?.hour ?? 12) % 24) + 24) % 24); const day = (stage?.winter ?? 0) > 0.5 ? days.winter : days.still;
    const hr = day.hours.find((x) => x.clock === clock) || day.hours[0]; const level = kit.cap ? hr.level / kit.cap : 0; const hide = taken();
    const next = `${night ? 1 : 0}${clock}${day.dayId}${hide ? 1 : 0}`; if (next === sig) return; sig = next;
    for (const h of homes) h.lamp.material = !night ? mats.day : hr.lit[h.i] ? mats.lit : mats.dark;
    bars.forEach((b, n) => { b.material = level > n / 4 + 0.02 ? mats.lit : mats.dark; });
    if (cabinet) cabinet.visible = !hide;
  };
  draw();
  // show() has no frame hook: a slow loop of its own (twice a second is plenty; nothing here moves)
  let raf = 0, last = 0; const loop = (t) => { raf = requestAnimationFrame(loop); if (t - last < 500) return; last = t; try { draw(); } catch { /* the town changed under us: leave it */ } };
  if (typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(loop);
  return () => { if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf); scene.remove(group); for (const x of bin) { try { x.dispose(); } catch { /* gone */ } } };
}
