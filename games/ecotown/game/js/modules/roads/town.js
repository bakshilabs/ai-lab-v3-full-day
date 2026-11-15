// What the "roads" module leaves in the town: a small model of the child's rebuilt street, with the freed land's new
// uses, on an empty tile beside one of their roads or car parks (or at the island's edge). Scenery only.
import { KINDS, SLOTS, JUNCTION, cleanPlots, townSpot } from './street.js';
import { createStreet } from './scene.js';

const SCALE = 0.11;

export function show(townCtx, data) {
  const nothing = () => {};
  const { THREE, scene, world, stage } = townCtx?.engine || {};
  if (!THREE || !scene || !world?.tileTop || !data || !Array.isArray(data.layout)) return nothing;
  const layout = Array.from({ length: SLOTS }, (_, i) => (i !== JUNCTION && KINDS.includes(data.layout[i]) ? data.layout[i] : null));
  if (!layout.includes('drop')) return nothing;
  const key = townSpot(townCtx.town?.cells, townCtx.town?.terrain?.tiles); if (!key) return nothing;
  let top; try { top = world.tileTop(key); } catch { return nothing; }
  const st = createStreet(THREE, { ground: false }); st.setOld(false); st.setLayout(layout); st.setPlots({ plots: cleanPlots(data.plots) });
  st.root.scale.setScalar(SCALE); st.root.position.set(top.x - 20 * SCALE, top.y + 0.82 * SCALE + 0.02, top.z - 1 * SCALE);
  scene.add(st.root);
  // the town may change after this is drawn: if something is built on the tile, the model steps aside
  const taken = () => { try { return typeof world.walkCost === 'function' && world.walkCost(key) === Infinity; } catch { return false; } };
  let clock = 0, since = 1; st.setRide(townCtx.reduceMotion ? 22 : -4);
  const tick = (dt) => {
    since += dt; if (since > 1) { since = 0; st.root.visible = !taken(); }
    if (!townCtx.reduceMotion && st.root.visible) { clock = (clock + dt * 4) % 56; st.setRide(clock - 6); } // one shared car drives along the model
  };
  const list = stage?.updaters; if (Array.isArray(list)) list.push(tick); else st.root.visible = !taken();
  return () => { if (Array.isArray(list)) { const i = list.indexOf(tick); if (i >= 0) list.splice(i, 1); } st.dispose(); };
}
