// Two towns side by side (owner, 17 Nov 2026; docs/ecotown-florence-first.md): Florence's town and the player's own town
// are separate and both visible. The full island (world.js: picking, lenses, residents, Florence) shows the town being
// worked on: the player's town while building, Florence's town in an AI Lab mission. A cheap, display-only copy of the
// island (createWorld with `share`) stands beside it and shows the other town. Florence's town is always on the left of
// the player's at the starting view, so the copy moves to the other side when the roles swap (behind the Lab's fade).
// The switch "Florence's town · Both · Your town" moves the camera; building only ever happens on the player's island.
import * as THREE from 'three';
import { createWorld } from '../world/world.js';
import { emptyCell } from '../sim/sim.js';
import { ITEMS } from '../world/catalog.js';
import { esc } from '../ui/ui.js';

const DEG = Math.PI / 180;
export const GAP = 150; // centre to centre: the islands are about 120 across along this line, so 30 of sky between them
const HOME_YAW = -40 * DEG; // rig.js: the starting view
export const RIGHT = new THREE.Vector3(Math.cos(HOME_YAW), 0, -Math.sin(HOME_YAW)); // screen-right at the starting view
export const LEFT_AT = RIGHT.clone().multiplyScalar(-GAP); // Florence's island while the player builds
export const RIGHT_AT = RIGHT.clone().multiplyScalar(GAP); // the player's island during a mission
const CENTRE = new THREE.Vector3(0, 1, -2); // the island's middle (rig.overview's target)
const PAN = { x: [-45, 45], z: [-36, 32] };
const shift = (P, v) => ({ x: [P.x[0] + v.x, P.x[1] + v.x], z: [P.z[0] + v.z, P.z[1] + v.z] });

// T: { florence, mine, both, label (aria), notHere } words for this age band
export function createTwoTowns(app, T) {
  const { stage, world, terrain, rig, ui } = app;
  let copy = null; let shown = new Map(); // tile key -> what the copy shows there (to redraw only what changed)
  const tt = { role: 'florence', view: 'mine', names: { mine: T.mine, florence: T.florence } };
  const ensure = () => { if (!copy) { copy = app.world2 = createWorld(stage, terrain, { share: world, offset: LEFT_AT }); shown = new Map(); } return copy; };
  const at = () => (tt.role === 'florence' ? LEFT_AT : RIGHT_AT);
  // role 'florence': the copy is Florence's town, on the left (the player is building); 'player': the copy is the player's
  // town, on the right (a mission is being played on the full island)
  tt.place = (role) => { tt.role = role; ensure().root.position.copy(at()); };
  // draw a town on the copy (only the tiles that changed)
  tt.show = (cells) => {
    const w = ensure(); const lit = [];
    for (const t of terrain.tiles.values()) {
      const c = cells.get(t.k) || emptyCell(); const key = `${c.mark || ''}|${c.item || ''}|${(c.mods || []).join(',')}`;
      if (shown.get(t.k) !== key) { w.setCell(t.k, c); shown.set(t.k, key); }
      if (c.item && ITEMS[c.item]?.home) lit.push(t.k);
    }
    w.setLights(lit);
  };
  // the two labels over the islands ("Florence's town", "Your town"), at the far edge so they never sit on a build
  const top = (v) => v.clone().add(CENTRE).add(new THREE.Vector3(Math.sin(HOME_YAW) * -34, 15, Math.cos(HOME_YAW) * -34));
  tt.labels = (on = true) => {
    ui.labels.clear('townlbl'); if (!on || !copy) return;
    const mainIs = tt.role === 'florence' ? 'mine' : 'florence'; const copyIs = tt.role;
    const lbl = (who, v) => ({ at: top(v), html: `<b>${who === 'florence' ? '🤖' : '🏡'}</b> ${esc(tt.names[who === 'florence' ? 'florence' : 'mine'])}`, cls: who === 'florence' ? 'hers' : 'mine' });
    ui.labels.pins('townlbl', [lbl(mainIs, new THREE.Vector3()), lbl(copyIs === 'florence' ? 'florence' : 'mine', at())]);
  };
  // the camera: 'mine' (the player's island), 'florence' (hers), 'both'. Only while building (role 'florence').
  tt.look = (view, dur = 1.2) => {
    tt.view = view; tt.syncSwitch(); const d = app.reduce ? 0.01 : dur;
    if (view === 'mine' || !copy) { rig.pan = null; rig.wide = 1; return rig.overview(d); }
    const portrait = rig.portrait();
    if (view === 'florence') {
      const r = rig.overview(d, false, LEFT_AT); rig.pan = shift(PAN, LEFT_AT); rig.wide = 1; return r;
    }
    // both: side by side across a wide screen; on an upright phone one behind the other (Florence's further away)
    const mid = LEFT_AT.clone().multiplyScalar(0.5).add(CENTRE);
    const lo = (a) => Math.min(a, 0), hi = (a) => Math.max(a, 0);
    rig.pan = { x: [lo(LEFT_AT.x) - 45, hi(LEFT_AT.x) + 45], z: [lo(LEFT_AT.z) - 36, hi(LEFT_AT.z) + 32] }; rig.wide = 2.8;
    if (portrait) {
      const { fh } = rig.freeAspect(); const ty = Math.tan(11 * DEG) * fh;
      return rig.toSky({ target: mid, dist: ((GAP + 120) / 2) / ty * 0.86, pitch: 52 * DEG, yaw: 50 * DEG }, d);
    }
    return rig.toSky({ target: mid, dist: rig.frameDist(GAP + 112), pitch: 34 * DEG, yaw: HOME_YAW }, d);
  };
  // the switch: three buttons, shown while building
  const el = document.createElement('div'); el.id = 'towns'; el.className = 'panel hide'; el.setAttribute('role', 'group'); el.setAttribute('aria-label', T.label);
  el.innerHTML = [['florence', '🤖', T.florence], ['both', '⇆', T.both], ['mine', '🏡', T.mine]].map(([v, ic, w]) => `<button type="button" data-tv="${v}" aria-pressed="false"><b class="ico" aria-hidden="true">${ic}</b><span>${esc(w)}</span></button>`).join('');
  document.getElementById('layer').appendChild(el);
  el.addEventListener('click', (e) => { const b = e.target.closest('[data-tv]'); if (b && !tt.busy?.()) { app.audio?.tap?.(); tt.look(b.dataset.tv); } });
  tt.syncSwitch = () => el.querySelectorAll('[data-tv]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tv === tt.view)));
  tt.showSwitch = (on) => { el.classList.toggle('hide', !on); tt.syncSwitch(); };
  rig.onOverview = (a) => { tt.view = a ? 'florence' : 'mine'; tt.syncSwitch(); }; // ⌂ and every other "whole island" view
  tt.update = (dt, t) => copy?.update(dt, t, { windStill: app.winterTest });
  return tt;
}
