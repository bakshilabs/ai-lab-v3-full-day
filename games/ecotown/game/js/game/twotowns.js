// Two towns in a split screen (owner, 17 Nov 2026; docs/ecotown-florence-first.md, section 3). Florence's town and the
// player's own town are separate. The full island (world.js: picking, lenses, residents, Florence) shows the town being
// worked on: the player's town while building, Florence's town in an AI Lab mission. A cheap, display-only copy of the
// island (createWorld with `share`) shows Florence's town while the player builds, in a pane of its own.
// The split: Florence's town on the left (landscape) or on top (upright screens), the player's town on the right or below.
// Both panes come from the one scene and the one renderer (stage.split: viewport and scissor, two cameras). The copy
// stands far off (COPY_AT), out of the main camera's reach, so each camera only ever sees its own town. Florence's pane
// has a fixed overview that turns with the player's camera (no panning or zooming of its own: nothing to get wrong on a
// touch screen), no post-processing and no shadows. Building only happens in the player's pane; a tap on hers says so.
// One toggle shows or hides her pane; the choice lasts the browser session. The game also opens it by itself after a
// mission (to compare the two towns) and in the intro, until the player builds something or hides it.
// Not in a mission, the AI Lab, street view or inside a house: there the one camera has the whole screen, as before.
// Pure rules (layout, state): js/game/split.js, tests/split.test.mjs.
import * as THREE from 'three';
import { createWorld } from '../world/world.js';
import { emptyCell } from '../sim/sim.js';
import { ITEMS } from '../world/catalog.js';
import { esc } from '../ui/ui.js';
import { WORLD } from '../engine/voxel.js';
import { splitPanes, paneInset, centreOffset, freeShape, paneAt, splitOn, nextSplit, loadPref, savePref } from './split.js';

const DEG = Math.PI / 180;
// where the copy stands: beyond the main camera's far plane (4000) and fog, so the player's pane never draws it, and the
// copy's camera never sees the main island; outside the sun's shadow area (no shadows in her pane)
export const COPY_AT = new THREE.Vector3(6000, 0, 0);
const CENTRE = new THREE.Vector3(0, 1, -2), PORTRAIT_CENTRE = new THREE.Vector3(12, 1, 1); // rig.overview's targets

// T: { florence, mine, toggle, notHere } words for this age band
export function createTwoTowns(app, T) {
  const { stage, world, terrain, rig, ui } = app;
  const store = (() => { try { return sessionStorage; } catch { return null; } })();
  let copy = null; let shown = new Map(); // tile key -> what the copy shows there (to redraw only what changed)
  const cam = new THREE.PerspectiveCamera(22, 1, 1, 4000);
  const tt = { role: 'florence', st: { pref: loadPref(store), auto: false }, on: false, panes: null, cam, building: false, yaw: null, base: null };
  const ensure = () => { if (!copy) { copy = app.world2 = createWorld(stage, terrain, { share: world, offset: COPY_AT }); copy.root.visible = false; shown = new Map(); } return copy; };
  // role 'florence': the copy is Florence's town (the player is building); 'player': a mission is on the full island
  tt.place = (role) => { tt.role = role; ensure(); sync(); };
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

  // ---- on screen: the toggle, the two pane labels and the line between the panes
  const btn = document.createElement('button'); btn.type = 'button'; btn.id = 'towns'; btn.className = 'panel hide';
  btn.setAttribute('aria-pressed', 'false');
  btn.innerHTML = `<b class="ico" aria-hidden="true">🤖</b><span>${esc(T.toggle)}</span><i class="knob" aria-hidden="true"></i>`;
  document.getElementById('layer').appendChild(btn);
  btn.addEventListener('click', () => { if (tt.busy?.()) return; app.audio?.tap?.(); tt.st = nextSplit(tt.st, 'toggle', tt.on); savePref(store, tt.st.pref); sync(); });
  const deco = document.createElement('div'); deco.id = 'splitdeco'; deco.setAttribute('aria-hidden', 'true'); deco.hidden = true;
  deco.innerHTML = `<i class="splitline"></i><span class="panelbl pl-hers"><b>🤖</b> ${esc(T.florence)}</span><span class="panelbl pl-mine"><b>🏡</b> ${esc(T.mine)}</span>`;
  const layer = document.getElementById('layer'); layer.parentNode.insertBefore(deco, layer);
  const [line, lblHers, lblMine] = deco.children;
  // the pane labels also name the two towns for screen readers (the canvas itself has one label)
  const live = document.createElement('p'); live.className = 'sr-only'; live.id = 'splitsr'; layer.appendChild(live);

  // the split is on when the player chose it or the game opened it, while building in the overview camera
  const skyView = () => rig.mode === 'sky';
  const want = () => splitOn({ ...tt.st, building: tt.building && tt.role === 'florence' && !app.inLab, skyView: skyView() });
  function sync() {
    const on = want(); btn.setAttribute('aria-pressed', String(on));
    if (on === tt.on) return; tt.on = on;
    if (copy) copy.root.visible = on; if (on) tt.yaw = null;
    live.textContent = on ? `${T.florence} · ${T.mine}` : '';
    if (app.reframe) app.reframe(); else tt.frame(rig.inset);
    // opening: the player's town fits its pane with a short flight to its overview, which also settles a flight still on its
    // way (after a mission the camera is often mid-flight). Closing (often right after a build) only rescales the view.
    if (on && tt.building && skyView()) rig.overview(app.reduce ? 0.01 : 0.7);
  }
  // the game opens the split by itself (after a mission, in the intro) or is done with it; a build closes what it opened
  tt.auto = (on) => { tt.st = nextSplit(tt.st, on ? 'open' : 'close'); sync(); return new Promise((r) => setTimeout(r, app.reduce ? 50 : 600)); };
  tt.built = () => { if (tt.st.auto) { tt.st = nextSplit(tt.st, 'built'); sync(); } };
  // kept for the intro (api.both / api.mine)
  tt.look = (view) => tt.auto(view !== 'mine');

  // Called by the game's frameView with the inset its panels leave free (base); returns the inset for the player's town.
  // While split: lays out the panes, frames Florence's camera on her pane, clips the world labels to the player's pane.
  tt.frame = (base) => {
    const W = innerWidth, H = innerHeight; tt.base = base;
    if (!tt.on) { tt.panes = null; stage.setSplit(null); deco.hidden = true; document.getElementById('labels').style.clipPath = ''; delete document.documentElement.dataset.split; return base; }
    const P = tt.panes = splitPanes(W, H, base); const mine = paneInset(P.mine, W, H, base); tt.her = paneInset(P.florence, W, H, base);
    cam.aspect = W / H; const o = centreOffset(W, H, tt.her); cam.setViewOffset(W, H, o.x, o.y, W, H);
    stage.setSplit({ main: P.mine, other: P.florence, cam, hide: ensure().root, enter: lensOff, leave: lensBack });
    document.documentElement.dataset.split = P.stacked ? 'stack' : 'side';
    // the line, and the labels beside it: side by side, at the top of the free area; stacked, either side of the line
    deco.hidden = false; const ls = line.style, hs = lblHers.style, ms = lblMine.style;
    for (const s of [hs, ms]) { s.left = s.right = s.top = s.bottom = ''; s.transform = ''; }
    if (!P.stacked) {
      Object.assign(ls, { left: `${P.line - 2}px`, top: '0px', width: '4px', height: `${H}px` });
      const card = ui.P.card && !ui.P.card.classList.contains('hide') ? ui.P.card.getBoundingClientRect().bottom : 0; // (a side tray leaves no top inset: keep clear of the card)
      const top = `${Math.round(Math.max(base.top, card) + 10)}px`; hs.top = ms.top = top;
      hs.right = `${W - P.line + 10}px`; ms.left = `${P.line + 10}px`;
    } else {
      Object.assign(ls, { left: '0px', top: `${P.line - 2}px`, width: `${W}px`, height: '4px' });
      const cx = `${Math.round((base.left + W - base.right) / 2)}px`; hs.left = ms.left = cx; hs.transform = ms.transform = 'translateX(-50%)';
      hs.bottom = `${H - P.line + 8}px`; ms.top = `${P.line + 8}px`;
    }
    const m = P.mine; document.getElementById('labels').style.clipPath = `inset(${m.y}px ${W - m.x - m.w}px ${H - m.y - m.h}px ${m.x}px)`;
    return mine;
  };
  // a lens greys the town through one shared uniform (WORLD.clay); it shows only on the player's town, so Florence's pane is
  // drawn with it off and her town keeps its colours
  let clay = 0; const lensOff = () => { clay = WORLD.clay.value; WORLD.clay.value = 0; }; const lensBack = () => { WORLD.clay.value = clay; };
  // pointers over Florence's pane: no building, panning or zooming there (rig.js); a tap says where building happens
  rig.paneBlock = (x, y) => tt.on && paneAt(tt.panes, x, y) === 'florence';

  // the toggle: shown while building; on wide screens it sits in the top row, left of the camera and icon buttons; where
  // that row is full (it would touch the town card) it drops under the icon strip. Phones place it with CSS.
  const fit = () => {
    if (btn.classList.contains('hide')) return; btn.style.right = ''; btn.style.top = '';
    if (innerWidth < 1200) return;
    const vis = (n) => n && !n.classList.contains('hide') && n.getBoundingClientRect().width > 0;
    const left = Math.min(...[ui.P.strip, ui.P.camctl].filter(vis).map((n) => n.getBoundingClientRect().left), innerWidth);
    btn.style.right = `${Math.round(innerWidth - left + 10)}px`;
    const card = vis(ui.P.card) ? ui.P.card.getBoundingClientRect() : null;
    if (card && btn.getBoundingClientRect().left < card.right + 8) { btn.style.right = '14px'; btn.style.top = `${Math.round(Math.max(ui.P.strip.getBoundingClientRect().bottom, 60) + 8)}px`; }
  };
  addEventListener('resize', () => requestAnimationFrame(fit));
  tt.showSwitch = (on) => { tt.building = on; btn.classList.toggle('hide', !on); sync(); if (on) { requestAnimationFrame(fit); setTimeout(fit, 400); } };
  tt.fit = fit;

  // every frame: street view, a house or a mission close the split (and it comes back after); Florence's camera
  tt.update = (dt, t) => {
    sync();
    if (!tt.on) return;
    copy?.update(dt, t, { windStill: app.winterTest });
    const W = innerWidth, H = innerHeight; const fa = freeShape(W, H, tt.her); const portrait = rig.portrait(fa);
    const yaw = rig.sky.yaw; if (tt.yaw == null || app.reduce) tt.yaw = yaw; else { const d = Math.atan2(Math.sin(yaw - tt.yaw), Math.cos(yaw - tt.yaw)); tt.yaw += d * Math.min(1, dt * 4); }
    const pitch = (portrait ? 52 : 38) * DEG; const dist = rig.frameDist(undefined, 0.92, fa);
    const target = (portrait ? PORTRAIT_CENTRE : CENTRE).clone().add(COPY_AT);
    cam.position.set(Math.sin(tt.yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(tt.yaw) * Math.cos(pitch)).multiplyScalar(dist).add(target);
    cam.lookAt(target);
  };
  return tt;
}
