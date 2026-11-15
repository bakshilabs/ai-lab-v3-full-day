// What every mission of the roads module shares: Florence's line at the top, the tray of controls at the bottom, a
// stage between them for the 2D missions, the 3D street set and its camera, and the guards that keep the game's own
// keys and pointer away while the module is open. Made once per visit by index.js; everything is removed on leave.
import { fitView } from './street.js';
import { createStreet } from './scene.js';

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
export const secs = () => performance.now() / 1000;     // the clock on the wall: animations run on real time
const ORIGIN = [0, 0, -3000];                    // the set stands far from the island, with its own camera

export function makeKit(ctx) {
  const K = { ctx, j: !!ctx.junior, reduce: !!ctx.settings?.reduceMotion, large: !!ctx.settings?.largeText };
  const { THREE, scene, camera, canvas } = ctx.engine; Object.assign(K, { THREE, camera, canvas });
  K.pick = (o) => (K.j ? o.j : o.s);

  // ---- the page layer
  const wrap = ctx.root.parentElement; K.wrap = wrap; if (K.large) wrap?.classList.add('rd-large');
  const top = el(`<div class="rd-top"><b class="who">Florence</b><p aria-live="polite"></p><button class="rd-say" type="button" aria-label="Read aloud">🔊</button></div>`);
  const stage = el('<div class="rd-stage" hidden></div>');
  const tray = el('<div class="rd-tray"></div>'); ctx.root.append(top, stage, tray);
  Object.assign(K, { top, tray, stage, spoken: '' });
  K.say = (text, extra = '') => { K.spoken = text; top.querySelector('p').innerHTML = esc(text) + (extra ? `<small>${esc(extra)}</small>` : ''); ctx.say(text); K.measure(); };
  top.querySelector('.rd-say').onclick = () => ctx.say(K.spoken);
  // Florence's panel sits beside the loader's Back button when there is room, else under it (the button grows with large text)
  const back = wrap?.querySelector('.modback');
  const placeTop = () => { const b = back?.getBoundingClientRect(); if (!b || !b.width) return; const beside = innerWidth - b.right - 24 >= 600; top.style.left = `${beside ? Math.ceil(b.right) + 12 : 12}px`; top.style.top = `${beside ? 12 : Math.ceil(b.bottom) + 8}px`; };
  // the part of the screen not under a panel: the camera keeps the street inside it, and the stage fills it
  K.free = { l: 0, r: 1, t: 0, b: 1 }; let measured = 0;
  K.measure = () => {
    placeTop(); measured = secs(); const c = canvas.getBoundingClientRect();
    const tTop = Math.max(top.getBoundingClientRect().bottom, back?.getBoundingClientRect().bottom || 0) + 8, tBot = tray.hidden ? innerHeight - 8 : tray.getBoundingClientRect().top - 8;
    stage.style.top = `${Math.round(tTop)}px`; stage.style.height = `${Math.max(120, Math.round(tBot - tTop))}px`;
    if (!c.width || !c.height) return; const t = tTop - c.top, b = tBot - c.top;
    K.free = b - t > 100 ? { l: 0.012, r: 0.988, t: t / c.height, b: b / c.height } : { l: 0, r: 1, t: 0, b: 1 };
  };
  addEventListener('resize', K.measure);
  // put new controls in the tray. If the keyboard is in use (or focus was in the tray), focus goes to the new main button.
  K.kbd = false; let swapped = 0;
  K.focusMain = (root = tray) => (root.querySelector('[data-primary]:not([disabled])') || root.querySelector('[data-fallback]') || root.querySelector('button:not([disabled])'))?.focus({ preventScroll: true });
  K.swap = (html) => { const had = K.kbd || tray.contains(document.activeElement) || stage.contains(document.activeElement); tray.innerHTML = html; tray.scrollTop = 0; swapped = performance.now(); if (had) K.focusMain(); K.measure(); };
  // a key held down must not press the next screen's button as well
  K.tooSoon = (e) => e.detail === 0 && performance.now() - swapped < 350;
  // wait for a press on a [data-act] button in the tray (or the stage)
  K.press = () => new Promise((res) => { const on = (e) => { const b = e.target.closest('[data-act]'); if (b && !b.disabled && !K.tooSoon(e)) { tray.onclick = stage.onclick = null; res(b.dataset.act); } }; tray.onclick = on; stage.onclick = on; });
  // the stage: a card between Florence and the tray, for the missions drawn in 2D. The 3D street stays behind it.
  K.showStage = (html) => { if (html === null) { stage.hidden = true; stage.innerHTML = ''; } else { stage.hidden = false; stage.innerHTML = html; } K.measure(); };

  // ---- the 3D set and its camera
  const set = createStreet(THREE, { reduce: K.reduce }); set.root.position.set(...ORIGIN); scene.add(set.root); K.set = set;
  const V = (x, y, z) => new THREE.Vector3(x + ORIGIN[0], y + ORIGIN[1], z + ORIGIN[2]); K.V = V;
  const box = (x0, x1, z0, z1, h) => [[x0, 0, z0], [x1, 0, z0], [x0, 0, z1], [x1, 0, z1], [x0, h, z0], [x1, h, z0], [x0, h, z1], [x1, h, z1]];
  const A = (deg) => [0, Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180)];
  // a view is either fitted to the free part of the screen ({ target, dir, points }) or given outright ({ pos, look })
  K.views = {
    street: () => ({ target: [20, 0, 1.6], dir: A(camera.aspect < 0.9 ? 56 : 46), fov: 34, points: box(-3.5, 43.5, -10.4, 13.8, 5.4) }),
    land: () => ({ target: [12, 1.4, 9.4], dir: A(42), fov: 34, points: [...box(3.6, 20.4, 5.4, 13.5, 0), [3.6, 3.4, 5.4], [20.4, 3.4, 5.4], [3.6, 6, 13.4], [20.4, 6, 13.4]] }),
    spot: (x, half = 9) => ({ target: [x, 0, -1.6], dir: A(44), fov: 34, points: box(Math.max(-3.5, x - half), Math.min(43.5, x + half), -10.4, 5.4, 5.6) }),
  };
  const viewWas = camera.view && camera.view.enabled ? { ...camera.view } : null;   // the game's own framing: put back when the module ends
  K.view = K.views.street; K.anim = null; K.cam = { cut: true }; const now = { pos: V(20, 50, 50), look: V(20, 0, 2), fov: 34, ox: 0, oy: 0 }; let applied = '';
  K.setView = (v, cut = false) => { K.view = v; if (cut || K.reduce) K.cam.cut = true; };
  const m4 = new THREE.Matrix4(); const up = new THREE.Vector3(0, 1, 0);
  ctx.engine.onFrame((dt) => {
    const real = secs(); if (real - measured > 0.5) K.measure();
    if (K.anim) K.anim(real);
    set.tick(real);
    const v = typeof K.view === 'function' ? K.view() : K.view; let g;
    if (v.points) { const f = fitView(v.points, v.target, v.dir, v.fov, camera.aspect, K.free); g = { pos: V(v.target[0] + v.dir[0] * f.d, v.target[1] + v.dir[1] * f.d, v.target[2] + v.dir[2] * f.d), look: V(...v.target), fov: v.fov, ox: f.ox, oy: f.oy }; }
    else g = { pos: v.pos, look: v.look, fov: v.fov, ox: 0, oy: 0, fast: v.fast };
    if (K.cam.cut || K.reduce) { now.pos.copy(g.pos); now.look.copy(g.look); now.fov = g.fov; now.ox = g.ox; now.oy = g.oy; K.cam.cut = false; }
    else { const a = 1 - Math.exp(-Math.min(0.1, dt) * (g.fast ? 9 : 3.5)); now.pos.lerp(g.pos, a); now.look.lerp(g.look, a); now.fov += (g.fov - now.fov) * a; now.ox += (g.ox - now.ox) * a; now.oy += (g.oy - now.oy) * a; }
    camera.position.copy(now.pos); camera.quaternion.setFromRotationMatrix(m4.lookAt(now.pos, now.look, up));
    const W = canvas.clientWidth || 1, H = canvas.clientHeight || 1; const sig = `${W},${H},${now.fov.toFixed(2)},${now.ox.toFixed(4)},${now.oy.toFixed(4)}`;
    // the game's own camera may set the lens or its framing again on any frame: put the module's back whenever they differ
    const ox = Math.round(-now.ox * W), oy = Math.round(-now.oy * H); const cv = camera.view;
    if (sig !== applied || Math.abs(camera.fov - now.fov) > 0.01 || !cv || !cv.enabled || cv.offsetX !== ox || cv.offsetY !== oy || cv.fullWidth !== W || cv.fullHeight !== H) { applied = sig; camera.fov = now.fov; camera.setViewOffset(W, H, ox, oy, W, H); }
    set.sizeLabels(now.fov, H, K.large ? 1.2 : 1);
  });

  // ---- taps on the 3D street. The game's own camera controls are held off while the module is open: every pointer
  // event outside the module's own panels is taken here, whatever element it lands on.
  K.onStreetTap = null; let down = null;
  const slotUnder = (e) => {
    const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return -1; camera.updateMatrixWorld();
    const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    return set.slotAt(ray.ray.origin.clone().sub(V(0, 0, 0)), ray.ray.direction);
  };
  const guard = (e) => {
    if (e.type === 'pointerdown' || e.type === 'wheel') { K.kbd = false; wrap?.classList.remove('rd-kbd'); }
    if (wrap && wrap.contains(e.target)) return; e.stopPropagation();
    if (e.type === 'pointerdown') down = { x: e.clientX, y: e.clientY };
    if (e.type === 'pointermove' && K.onStreetTap && e.pointerType === 'mouse' && !down) set.setFocus(slotUnder(e));
    if (e.type === 'pointerup' && down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 12 && K.onStreetTap) { const slot = slotUnder(e); if (slot >= 0) K.onStreetTap(slot); }
    if (e.type === 'pointerup' || e.type === 'pointercancel') down = null;
  };
  const EVENTS = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'wheel', 'click', 'dblclick', 'contextmenu'];
  for (const n of EVENTS) document.addEventListener(n, guard, true);
  K.onKey = null;
  const key = (e) => {
    if (['Tab', 'Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '1', '2', '3', '4', '5', '6'].includes(e.key)) { K.kbd = true; wrap?.classList.add('rd-kbd'); }
    if (K.onKey && !e.ctrlKey && !e.metaKey && !e.altKey && K.onKey(e)) { e.preventDefault(); e.stopPropagation(); return; }
    // keys never reach the game underneath while the module is open. The browser's own actions (Tab moves focus, Enter
    // and Space press the focused button) still happen: only the listeners are skipped.
    if (e.key !== 'Escape') e.stopPropagation();
  };
  document.addEventListener('keydown', key, true);
  // a mission's own clean-up: called when it ends, and again on leave
  K.reset = () => { K.anim = null; K.onStreetTap = null; K.onKey = null; tray.onclick = stage.onclick = tray.onmouseover = tray.onfocusin = null; set.setFocus(-1); set.setHint(false); set.setMarks(null); set.endRun(); set.setRide(null); };
  ctx.onLeave(() => { for (const n of EVENTS) document.removeEventListener(n, guard, true); document.removeEventListener('keydown', key, true); removeEventListener('resize', K.measure); K.anim = null; K.onStreetTap = null; K.onKey = null; set.dispose(); if (viewWas) camera.setViewOffset(viewWas.fullWidth, viewWas.fullHeight, viewWas.offsetX, viewWas.offsetY, viewWas.width, viewWas.height); else camera.clearViewOffset(); wrap?.classList.remove('rd-large', 'rd-kbd'); });
  return K;
}
