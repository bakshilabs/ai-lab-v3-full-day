// "Roads for self-driving cars": one module of Eco Town of the future (docs/MODULES.md).
// The loop: meet the street as it is → place drop-off points, waiting bays and crossings by tapping the 3D street →
// run the morning and read the numbers, each shown on the street where it happened (change it and run again as often
// as wanted) → choose what the freed car park becomes, and test the street with the new homes → ride the street.
// Rules and numbers: street.js. Words and the take-home record: words.js. The 3D set: scene.js. The town model: town.js.
import { SLOTS, JUNCTION, kindsFor, cleanLayout, emptyLayout, cleanSaved, place, counts, crossings, simulate, land, tripsFor, fleetRange, cleanFleet, goods, nextStep, timeline, stills, clock, fitView, USE_IDS } from './street.js';
import { PIECES, USE, T, GRADE, LANDMARKS, pieceName, beside, intro, firstAsk, afterFirst, designAsk, needDrop, noJunction, placed, cleared, fleetSay, runSay, runFast, runCount, stillSay, measures, resultsHead, comment, whereSay, marks, landIntro, landSummary, landClose, newHomesAsk, withHomes, rideStops, madeLines, madeTitle, practised, picture } from './words.js';
import { createStreet, slotX } from './scene.js';
import { show } from './town.js';

const P = '#module[data-module="roads"]';
const css = `
${P} .rd-top { position: absolute; left: 12px; right: 12px; top: 12px; max-width: 760px; display: flex; gap: 10px; align-items: flex-start; padding: 8px 12px; border-radius: 14px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
${P} .rd-top b.who { flex: none; padding: 2px 10px; border-radius: 10px; background: #1f7442; color: #fff; font-weight: 800; font-size: .85rem; }
${P} .rd-top p { margin: 0; flex: 1; font-size: 1rem; line-height: 1.3; font-weight: 600; }
${P} .rd-top p small { display: block; margin-top: 3px; font-size: .88rem; font-weight: 600; color: #5e4936; }
${P} button { font: 800 1rem Inter, system-ui, sans-serif; color: #3b2a1e; cursor: pointer; border: 0; border-radius: 12px; min-height: 44px; padding: 6px 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; }
${P} button:focus-visible { outline: 3px solid #1c6fd0; outline-offset: 2px; }
${P} button[disabled] { color: #6f6254; box-shadow: inset 0 0 0 2px #d2c4ac; cursor: default; }
${P} button.go { background: #1f7f49; color: #fff; box-shadow: inset 0 0 0 2px #17603a, 0 3px 0 #124a2d; }
${P} button.go[disabled] { background: #c9d6c6; color: #4c5a4c; box-shadow: inset 0 0 0 2px #aab8a8; }
${P} .rd-say { flex: none; min-width: 44px; padding: 6px; }
${P} .rd-tray { position: absolute; left: 12px; right: 12px; bottom: 12px; margin: 0 auto; max-width: 980px; max-height: 56vh; overflow: auto; padding: 10px 12px; border-radius: 16px; background: #f3e4c6; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
${P} .rd-tray.slim { left: auto; max-width: none; }
${P} .rd-tray h3 { margin: 0 0 6px; font-size: 1rem; line-height: 1.25; }
${P} .rd-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
${P} .rd-row.end { justify-content: flex-end; margin-top: 8px; }
${P} .rd-pal button { display: flex; align-items: center; gap: 6px; }
${P} .rd-pal button[aria-pressed="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 3px #b23a26, 0 3px 0 #7a5a33; }
${P} .rd-pal i { font-style: normal; font-weight: 700; color: #5e4936; }
${P} .rd-pal .ico { font-size: max(20px, 1.25rem); line-height: 1; }
${P} .rd-key { display: none; min-width: 1.5em; padding: 0 5px; border-radius: 6px; background: #3b2a1e; color: #fff; font-size: .8rem; font-weight: 800; text-align: center; }
${P}.rd-kbd .rd-key { display: inline-block; }
${P} .rd-keys { display: none; margin-left: 10px; font-weight: 600; }
${P}.rd-kbd .rd-keys { display: inline; }
${P} .chip { display: inline-grid; place-items: center; width: 1.6em; height: 1.6em; border-radius: 50%; color: #fff; font-weight: 800; font-size: .9rem; }
${P} .rd-fleet { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; padding: 2px 4px 2px 10px; border-radius: 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; font-weight: 800; }
${P} .rd-fleet button { min-width: 44px; padding: 4px; font-size: 1.2rem; }
${P} .rd-strip { margin: 8px 0 0; }
${P} .rd-striphead { margin: 0 0 3px; font-size: .85rem; font-weight: 700; color: #5e4936; }
${P} .rd-marks, ${P} .rd-slots { display: grid; grid-template-columns: repeat(${SLOTS}, minmax(0, 1fr)); gap: 4px; }
${P} .rd-marks span { display: flex; align-items: center; justify-content: center; gap: 4px; padding: 2px 3px; border-radius: 8px 8px 0 0; background: #e2cfa6; font-size: .8rem; font-weight: 800; line-height: 1.05; text-align: center; }
${P} .rd-marks span i { font-style: normal; font-size: max(20px, 1.25rem); line-height: 1; }
${P} .rd-slots { margin-top: 3px; }
${P} .rd-slots button { display: grid; grid-template-rows: auto 1fr; justify-items: center; align-items: center; min-height: 54px; padding: 2px 0 3px; border-radius: 10px; }
${P} .rd-slots .n { font-size: .75rem; font-weight: 700; color: #5e4936; line-height: 1.1; }
${P} .rd-slots .mid { display: flex; align-items: center; gap: 2px; font-size: max(20px, 1.3rem); line-height: 1; color: #6f6254; }
${P} .rd-slots button.has { background: #fff; box-shadow: inset 0 0 0 3px #3b2a1e, 0 3px 0 #7a5a33; }
${P} .rd-slots button.no { background: #cfc6b4; box-shadow: inset 0 0 0 2px #a89c86; }
${P} .rd-hint { margin: 0; flex: 1; min-width: 180px; font-size: .92rem; font-weight: 600; color: #4f3d2d; }
${P} .rd-nums { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
${P} button.rd-num { display: block; text-align: left; min-height: 0; padding: 7px 10px; border-radius: 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; font-weight: 600; }
${P} .rd-num small { display: block; font-size: .82rem; font-weight: 700; color: #5e4936; }
${P} .rd-num b { display: block; font-size: 1.25rem; font-weight: 800; }
${P} .rd-num em { font-style: normal; font-size: .82rem; font-weight: 800; }
${P} .rd-num.good { box-shadow: inset 0 0 0 3px #2e9b5a; } ${P} .rd-num.good em { color: #1f7442; }
${P} .rd-num.fair { box-shadow: inset 0 0 0 3px #d99a1c; } ${P} .rd-num.fair em { color: #8a5a00; }
${P} .rd-num.poor { box-shadow: inset 0 0 0 3px #c8553d; } ${P} .rd-num.poor em { color: #9a3220; }
${P} button.rd-num[aria-pressed="true"] { background: #ffe9a8; }
${P} .rd-num i { display: block; font-style: normal; font-size: .8rem; color: #5e4936; }
${P} .rd-legend { margin: 6px 0 0; font-size: .85rem; font-weight: 600; color: #5e4936; }
${P} .rd-clock { font-size: 1.3rem; font-weight: 800; min-width: 3.2em; }
${P} .rd-bar { flex: 1; min-width: 100px; height: 12px; border-radius: 6px; background: #d2c4ac; overflow: hidden; } ${P} .rd-bar span { display: block; height: 100%; width: 0; background: #2e9b5a; }
${P} .rd-count { margin: 0; flex: 1 1 100%; font-size: .95rem; font-weight: 700; }
${P} .rd-plots { display: grid; gap: 6px; }
${P} .rd-plot { display: grid; grid-template-columns: 2.6rem repeat(${USE_IDS.length}, minmax(0, 1fr)); gap: 6px; align-items: center; }
${P} .rd-letter { display: grid; place-items: center; height: 2.4rem; border-radius: 10px; background: #1c4fa8; color: #fff; font-size: 1.25rem; font-weight: 800; }
${P} .rd-plot button { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 4px 6px; }
${P} .rd-plot button .ico { font-size: max(20px, 1.3rem); line-height: 1; }
${P} .rd-plot button[aria-pressed="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 3px #b23a26, 0 3px 0 #7a5a33; }
${P} .rd-foot { display: flex; gap: 10px; align-items: flex-end; margin-top: 8px; }
${P} .rd-foot .rd-row { margin: 0; flex: none; }
${P} .rd-sum { flex: 1; margin: 0; padding: 0 0 0 18px; font-size: .92rem; font-weight: 600; line-height: 1.3; }
${P} .rd-cap { margin: 0; flex: 1; min-width: 200px; font-size: 1.05rem; font-weight: 700; }
${P}.rd-large .rd-top p, ${P}.rd-large .rd-cap { font-size: 1.15rem; } ${P}.rd-large button { font-size: 1.1rem; }
${P}.rd-large .rd-hint, ${P}.rd-large .rd-sum, ${P}.rd-large .rd-num small, ${P}.rd-large .rd-num em, ${P}.rd-large .rd-num i, ${P}.rd-large .rd-legend, ${P}.rd-large .rd-striphead, ${P}.rd-large .rd-keys, ${P}.rd-large .rd-count { font-size: 1rem; }
${P}.rd-large .rd-marks span { font-size: .95rem; } ${P}.rd-large .rd-marks span i, ${P}.rd-large .rd-slots .mid, ${P}.rd-large .rd-pal .ico, ${P}.rd-large .rd-plot button .ico { font-size: max(24px, 1.5rem); }
${P}.rd-large .rd-slots .n { font-size: .9rem; } ${P}.rd-large .rd-slots button { min-height: 62px; } ${P}.rd-large .chip { font-size: 1.05rem; }
@media (max-width: 820px) { ${P} .rd-marks span { flex-direction: column; gap: 0; } ${P} .rd-plot button { flex-direction: column; gap: 0; font-size: .92rem; } ${P} .rd-foot { flex-direction: column; align-items: stretch; } ${P} .rd-foot .rd-row { justify-content: flex-end; } }
@media (max-height: 620px) { ${P} .rd-tray { max-height: 64vh; padding: 6px 10px; } ${P} .rd-slots button { min-height: 46px; } }
`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const SEED = 7;                                  // the same morning every run, so two runs can be compared fairly
const ORIGIN = [0, 0, -3000];                    // the set stands far from the island, with its own camera
const secs = () => performance.now() / 1000;     // the clock on the wall: the morning and the ride run on real time

async function run(ctx) {
  const j = !!ctx.junior; const reduce = !!ctx.settings?.reduceMotion; const large = !!ctx.settings?.largeText; const { THREE, scene, camera, canvas } = ctx.engine;
  const families = Math.max(0, Math.round(ctx.town?.sim?.families || 0)); const trips = tripsFor(families);
  const kinds = kindsFor(j); const pick = (o) => (j ? o.j : o.s);
  // ---- what is kept between visits
  const saved = cleanSaved(ctx.saved, j);
  const st = { layout: saved ? saved.layout : emptyLayout(), plots: saved ? saved.plots : [null, null, null], runs: saved?.runs || 0, changes: saved?.changes || 0, best: saved?.best || null, fleet: j ? null : cleanFleet(saved?.fleet, trips), built: !!saved?.built, extra: 0, rode: false, res: null, prev: null, kind: 'drop' };
  const keep = (stage) => ctx.save({ v: 2, stage, layout: st.layout, plots: st.plots, runs: st.runs, changes: st.changes, best: st.best, fleet: st.fleet, built: st.built });
  const report = (id) => ctx.report({ stage: T.stage[id] });
  const sim = (extra = st.built ? st.extra : 0) => simulate(st.layout, { families, extraFamilies: extra, seed: SEED, junior: j, fleet: st.fleet });

  // ---- the page layer
  const wrap = ctx.root.parentElement; if (large) wrap?.classList.add('rd-large');
  const top = el(`<div class="rd-top"><b class="who">Florence</b><p aria-live="polite"></p><button class="rd-say" type="button" aria-label="Read aloud">🔊</button></div>`);
  const tray = el('<div class="rd-tray"></div>'); ctx.root.append(top, tray);
  let spoken = '';
  const say = (text, extra = '') => { spoken = text; top.querySelector('p').innerHTML = esc(text) + (extra ? `<small>${esc(extra)}</small>` : ''); ctx.say(text); measure(); };
  top.querySelector('.rd-say').onclick = () => ctx.say(spoken);
  // Florence's panel sits beside the loader's Back button when there is room, else under it (the button grows with large text)
  const back = wrap?.querySelector('.modback');
  const placeTop = () => { const b = back?.getBoundingClientRect(); if (!b || !b.width) return; const beside = innerWidth - b.right - 24 >= 600; top.style.left = `${beside ? Math.ceil(b.right) + 12 : 12}px`; top.style.top = `${beside ? 12 : Math.ceil(b.bottom) + 8}px`; };
  // the part of the screen not under a panel: the camera keeps the street inside it
  let free = { l: 0, r: 1, t: 0, b: 1 }; let measured = 0;
  function measure() {
    placeTop(); measured = secs(); const c = canvas.getBoundingClientRect(); if (!c.width || !c.height) return;
    const t = Math.max(top.getBoundingClientRect().bottom, back?.getBoundingClientRect().bottom || 0) + 8 - c.top, b = tray.getBoundingClientRect().top - 8 - c.top;
    free = b - t > 100 ? { l: 0.012, r: 0.988, t: t / c.height, b: b / c.height } : { l: 0, r: 1, t: 0, b: 1 };
  }
  addEventListener('resize', measure);
  // put new controls in the tray. If the keyboard is in use (or focus was in the tray), focus goes to the new main button.
  let kbd = false, swapped = 0;
  const swap = (html) => { const had = kbd || tray.contains(document.activeElement); tray.innerHTML = html; tray.scrollTop = 0; swapped = performance.now(); if (had) (tray.querySelector('[data-primary]:not([disabled])') || tray.querySelector('[data-fallback]') || tray.querySelector('button:not([disabled])'))?.focus({ preventScroll: true }); measure(); };
  // a key held down must not press the next screen's button as well
  const tooSoon = (e) => e.detail === 0 && performance.now() - swapped < 350;
  // wait for a press on a [data-act] button in the tray
  const press = () => new Promise((res) => { tray.onclick = (e) => { const b = e.target.closest('[data-act]'); if (b && !b.disabled && !tooSoon(e)) { tray.onclick = null; res(b.dataset.act); } }; });

  // ---- the 3D set and its camera
  const set = createStreet(THREE, { reduce }); set.root.position.set(...ORIGIN); scene.add(set.root);
  const V = (x, y, z) => new THREE.Vector3(x + ORIGIN[0], y + ORIGIN[1], z + ORIGIN[2]);
  const box = (x0, x1, z0, z1, h) => [[x0, 0, z0], [x1, 0, z0], [x0, 0, z1], [x1, 0, z1], [x0, h, z0], [x1, h, z0], [x0, h, z1], [x1, h, z1]];
  const A = (deg) => [0, Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180)];
  // a view is either fitted to the free part of the screen ({ target, dir, points }) or given outright ({ pos, look })
  const views = {
    street: () => ({ target: [20, 0, 1.6], dir: A(camera.aspect < 0.9 ? 56 : 46), fov: 34, points: box(-3.5, 43.5, -10.4, 13.8, 5.4) }),
    land: () => ({ target: [12, 1.4, 9.4], dir: A(42), fov: 34, points: [...box(3.6, 20.4, 5.4, 13.5, 0), [3.6, 3.4, 5.4], [20.4, 3.4, 5.4], [3.6, 6, 13.4], [20.4, 6, 13.4]] }),
    spot: (x, half = 9) => ({ target: [x, 0, -1.6], dir: A(44), fov: 34, points: box(Math.max(-3.5, x - half), Math.min(43.5, x + half), -10.4, 5.4, 5.6) }),
  };
  const viewWas = camera.view && camera.view.enabled ? { ...camera.view } : null;   // the game's own framing: put back when the module ends
  let view = views.street; let anim = null; const cam = { cut: true }; const now = { pos: V(20, 50, 50), look: V(20, 0, 2), fov: 34, ox: 0, oy: 0 }; let applied = '';
  const setView = (v, cut = false) => { view = v; if (cut || reduce) cam.cut = true; };
  const m4 = new THREE.Matrix4(); const up = new THREE.Vector3(0, 1, 0);
  ctx.engine.onFrame((dt) => {
    const real = secs(); if (real - measured > 0.5) measure();
    if (anim) anim(real);
    set.tick(real);
    const v = typeof view === 'function' ? view() : view; let g;
    if (v.points) { const f = fitView(v.points, v.target, v.dir, v.fov, camera.aspect, free); g = { pos: V(v.target[0] + v.dir[0] * f.d, v.target[1] + v.dir[1] * f.d, v.target[2] + v.dir[2] * f.d), look: V(...v.target), fov: v.fov, ox: f.ox, oy: f.oy }; }
    else g = { pos: v.pos, look: v.look, fov: v.fov, ox: 0, oy: 0, fast: v.fast };
    if (cam.cut || reduce) { now.pos.copy(g.pos); now.look.copy(g.look); now.fov = g.fov; now.ox = g.ox; now.oy = g.oy; cam.cut = false; }
    else { const a = 1 - Math.exp(-Math.min(0.1, dt) * (g.fast ? 9 : 3.5)); now.pos.lerp(g.pos, a); now.look.lerp(g.look, a); now.fov += (g.fov - now.fov) * a; now.ox += (g.ox - now.ox) * a; now.oy += (g.oy - now.oy) * a; }
    camera.position.copy(now.pos); camera.quaternion.setFromRotationMatrix(m4.lookAt(now.pos, now.look, up));
    const W = canvas.clientWidth || 1, H = canvas.clientHeight || 1; const sig = `${W},${H},${now.fov.toFixed(2)},${now.ox.toFixed(4)},${now.oy.toFixed(4)}`;
    // the game's own camera may set the lens or its framing again on any frame: put the module's back whenever they differ
    const ox = Math.round(-now.ox * W), oy = Math.round(-now.oy * H); const cv = camera.view;
    if (sig !== applied || Math.abs(camera.fov - now.fov) > 0.01 || !cv || !cv.enabled || cv.offsetX !== ox || cv.offsetY !== oy || cv.fullWidth !== W || cv.fullHeight !== H) { applied = sig; camera.fov = now.fov; camera.setViewOffset(W, H, ox, oy, W, H); }
    set.sizeLabels(now.fov, H, large ? 1.2 : 1);
  });

  // ---- taps on the 3D street. The game's own camera controls are held off while the module is open: every pointer
  // event outside the module's own panels is taken here, whatever element it lands on.
  let onStreetTap = null; let down = null;
  const slotUnder = (e) => {
    const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return -1; camera.updateMatrixWorld();
    const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    return set.slotAt(ray.ray.origin.clone().sub(V(0, 0, 0)), ray.ray.direction);
  };
  const guard = (e) => {
    if (e.type === 'pointerdown' || e.type === 'wheel') { kbd = false; wrap?.classList.remove('rd-kbd'); }
    if (wrap && wrap.contains(e.target)) return; e.stopPropagation();
    if (e.type === 'pointerdown') down = { x: e.clientX, y: e.clientY };
    if (e.type === 'pointermove' && onStreetTap && e.pointerType === 'mouse' && !down) set.setFocus(slotUnder(e));
    if (e.type === 'pointerup' && down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 12 && onStreetTap) { const slot = slotUnder(e); if (slot >= 0) onStreetTap(slot); }
    if (e.type === 'pointerup' || e.type === 'pointercancel') down = null;
  };
  const EVENTS = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'wheel', 'click', 'dblclick', 'contextmenu'];
  for (const n of EVENTS) document.addEventListener(n, guard, true);
  let onKey = null;
  const key = (e) => {
    if (['Tab', 'Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '1', '2', '3', '4'].includes(e.key)) { kbd = true; wrap?.classList.add('rd-kbd'); }
    if (onKey && !e.ctrlKey && !e.metaKey && !e.altKey && onKey(e)) { e.preventDefault(); e.stopPropagation(); }
  };
  document.addEventListener('keydown', key, true);
  ctx.onLeave(() => { for (const n of EVENTS) document.removeEventListener(n, guard, true); document.removeEventListener('keydown', key, true); removeEventListener('resize', measure); anim = null; onStreetTap = null; onKey = null; set.dispose(); if (viewWas) camera.setViewOffset(viewWas.fullWidth, viewWas.fullHeight, viewWas.offsetX, viewWas.offsetY, viewWas.width, viewWas.height); else camera.clearViewOffset(); wrap?.classList.remove('rd-large', 'rd-kbd'); });

  // ================= 1. the street as it is: one screen, then straight to the first drop-off point
  async function meet() {
    report('intro'); set.setOld(true); set.setPlots('full'); set.setLayout(emptyLayout()); set.setMarks(null); setView(views.street, true);
    say(intro(j)); tray.classList.add('slim'); swap(`<div class="rd-row end"><button class="go" type="button" data-primary data-act="next">${pick(T.start)}</button></div>`); await press(); tray.classList.remove('slim');
  }

  // ================= 2. design: the 3D street is the control; the strip under it is a labelled helper
  async function design(first) {
    report('design'); keep(st.built ? 'built' : 'design'); set.setOld(false); set.setPlots(st.runs ? { plots: st.plots } : 'full'); set.endRun(); set.setMarks(null); set.setRide(null); set.setNames(true); set.setLayout(st.layout); setView(views.street);
    let coach = first && !st.layout.includes('drop'); st.kind = coach ? 'drop' : st.kind; set.setHint(coach);
    const n = trips + (st.built ? st.extra : 0);
    say(coach ? firstAsk(j, n) : designAsk(j), coach ? '' : pick(PIECES[st.kind].desc));
    swap(`<div class="rd-row rd-pal" role="group" aria-label="Pieces">${kinds.map((k, i) => `<button type="button" data-kind="${k}" ${k === st.kind ? 'data-fallback' : ''} aria-pressed="false"><span class="rd-key" aria-hidden="true">${i + 1}</span><span class="chip" style="background:${PIECES[k].color}" aria-hidden="true">${PIECES[k].letter}</span><span class="ico" aria-hidden="true">${PIECES[k].icon}</span> ${esc(pieceName(k, j))} <i data-n="${k}"></i></button>`).join('')}
        ${j ? '' : `<span class="rd-fleet" role="group" aria-label="${T.fleet}"><span data-fleetn></span><button type="button" data-fleet="-1" aria-label="One car fewer">−</button><button type="button" data-fleet="1" aria-label="One car more">＋</button></span>`}</div>
      <div class="rd-strip"><p class="rd-striphead"><span id="rd-striphead">${T.strip}</span><span class="rd-keys">${T.keys(kinds.length)}</span></p>
        <div class="rd-marks" aria-hidden="true">${LANDMARKS.map((m) => `<span style="grid-column: span ${m.span}"><i>${m.icon}</i>${m.text}</span>`).join('')}</div>
        <div class="rd-slots" role="group" aria-labelledby="rd-striphead">${Array.from({ length: SLOTS }, (_, s) => `<button type="button" data-slot="${s}"></button>`).join('')}</div></div>
      <div class="rd-row end"><p class="rd-hint" aria-live="polite"></p><button type="button" data-act="clear">${T.clear}</button><button class="go" type="button" data-primary data-act="run" ${st.layout.includes('drop') ? '' : 'disabled'}>${pick(T.run)}</button></div>`);
    const hint = tray.querySelector('.rd-hint');
    const draw = () => {
      const c = counts(st.layout);
      for (const b of tray.querySelectorAll('[data-kind]')) { b.setAttribute('aria-pressed', String(b.dataset.kind === st.kind)); b.querySelector('[data-n]').textContent = `× ${c[b.dataset.kind]}`; }
      for (const b of tray.querySelectorAll('[data-slot]')) {
        const s = +b.dataset.slot; const k = st.layout[s]; const jn = s === JUNCTION;
        b.className = jn ? 'no' : k ? 'has' : '';
        b.setAttribute('aria-label', `Place ${s + 1}, by ${beside(s, j).text}: ${jn ? 'nothing can go here' : k ? pieceName(k, j) : 'empty'}`);
        b.innerHTML = `<span class="n" aria-hidden="true">${s + 1}</span><span class="mid" aria-hidden="true">${jn ? '✕' : k ? `<span class="chip" style="background:${PIECES[k].color}">${PIECES[k].letter}</span>${PIECES[k].icon}` : '＋'}</span>`;
      }
      tray.querySelector('[data-act="run"]').disabled = !c.drop; tray.querySelector('[data-act="clear"]').disabled = !c.pieces;
      if (!j) { const r = fleetRange(n); st.fleet = cleanFleet(st.fleet, n); tray.querySelector('[data-fleetn]').textContent = `${st.fleet} shared cars`; tray.querySelector('[data-fleet="-1"]').disabled = st.fleet <= r.min; tray.querySelector('[data-fleet="1"]').disabled = st.fleet >= r.max; }
    };
    const put = (s) => {
      if (s === JUNCTION) { hint.textContent = noJunction(j); ctx.say(noJunction(j)); set.setFocus(s); return; }
      const before = st.layout[s]; st.layout = place(st.layout, s, st.kind); if (st.runs) st.changes++;
      set.setLayout(st.layout); set.setFocus(s); draw(); keep(st.built ? 'built' : 'design');
      hint.textContent = placed(st.kind, s, st.layout[s] === st.kind, j) + (before && st.layout[s] ? ` It replaced the ${pieceName(before, j).toLowerCase()}.` : '');
      if (coach && st.layout.includes('drop')) { coach = false; set.setHint(false); say(afterFirst(j)); }
    };
    const choose = (k) => { st.kind = k; draw(); say(pick(PIECES[k].desc)); };
    const hover = (e) => { const b = e.target.closest?.('[data-slot]'); if (b) set.setFocus(+b.dataset.slot); }; tray.onmouseover = hover; tray.onfocusin = hover;
    draw(); if (!first) hint.textContent = j ? 'Tap a piece on the street again to take it away.' : 'Tap a placed piece again to remove it.';
    onStreetTap = put;
    onKey = (e) => {
      const d = '1234'.indexOf(e.key); if (d >= 0 && d < kinds.length) { choose(kinds[d]); return true; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const cur = document.activeElement?.dataset?.slot; const s = cur === undefined ? (e.key === 'ArrowRight' ? 0 : SLOTS - 1) : (+cur + (e.key === 'ArrowRight' ? 1 : SLOTS - 1)) % SLOTS; tray.querySelector(`[data-slot="${s}"]`).focus(); set.setFocus(s); return true; }
      return false;
    };
    for (;;) {
      const act = await new Promise((res) => { tray.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled || tooSoon(e)) return; if (b.dataset.kind) choose(b.dataset.kind); else if (b.dataset.slot) put(+b.dataset.slot); else if (b.dataset.fleet) { st.fleet = cleanFleet(st.fleet + +b.dataset.fleet, n); if (st.runs) st.changes++; draw(); keep(st.built ? 'built' : 'design'); hint.textContent = fleetSay(st.fleet, n); ctx.say(hint.textContent); } else if (b.dataset.act) res(b.dataset.act); }; });
      if (act === 'clear') { st.layout = emptyLayout(); if (st.runs) st.changes++; set.setLayout(st.layout); set.setFocus(-1); draw(); keep(st.built ? 'built' : 'design'); hint.textContent = cleared(j); ctx.say(cleared(j)); if (kbd) tray.querySelector('[data-kind="drop"]')?.focus(); continue; }
      if (act === 'run' && counts(st.layout).drop) break;
      say(needDrop(j));
    }
    tray.onclick = tray.onmouseover = tray.onfocusin = null; onStreetTap = null; onKey = null; set.setFocus(-1); set.setHint(false);
  }

  // ================= 3. run the morning, then read the numbers where they happened
  async function morning() {
    report(st.built && st.extra ? 'rerun' : 'run'); st.prev = st.res; st.res = sim(); st.runs++;
    const res = st.res; const g = goods(res, j); const bestWas = st.best; if (!st.best || st.best.of !== g.of || g.good > st.best.good) st.best = g;
    keep(st.built ? 'built' : 'design');
    set.setMarks(null); set.setPlots({ plots: st.plots }); set.setLayout(st.layout); setView(views.street);
    if (!reduce) {
      say(runSay(j, res));
      swap(`<div class="rd-row"><span class="rd-clock" aria-live="off">7:30</span><div class="rd-bar" aria-hidden="true"><span></span></div><button type="button" data-primary data-act="skip">${T.skip}</button><p class="rd-count" aria-live="off"></p></div>`);
      const clk = tray.querySelector('.rd-clock'), bar = tray.querySelector('.rd-bar span'), cnt = tray.querySelector('.rd-count'); const tl = timeline(res); const t0 = secs(); let shown = '';
      set.startRun(res);
      await new Promise((done) => {
        anim = (real) => {
          const r = real - t0; const t = tl.at(r); const slow = r < tl.slowReal; const c = set.updateRun(t, r, slow);
          clk.textContent = clock(t); bar.style.width = `${Math.min(100, (100 * r) / tl.total)}%`;
          const line = `${slow ? (j ? 'Watching the first family.' : 'Watching the first call.') : runFast(j)} ${runCount(c.waiting, c.cars)}`; if (line !== shown) { shown = line; cnt.textContent = line; }
          if (r >= tl.total) { anim = null; done(); }
        };
        tray.onclick = (e) => { if (e.target.closest('[data-act="skip"]') && !tooSoon(e)) { anim = null; done(); } };
      });
      tray.onclick = null; set.endRun();
    } else {
      // reduced motion: the morning as still pictures, one press each
      const shots = stills(res); set.startRun(res);
      for (let i = 0; i < shots.length; i++) {
        const s = shots[i]; set.updateRun(s.t, 0, false, true); setView(views.spot(slotX(s.drop), 11), true); say(stillSay(s, res, j));
        swap(`<div class="rd-row"><p class="rd-cap">The morning: picture ${i + 1} of ${shots.length}</p><button class="go" type="button" data-primary data-act="next">${T.next}</button></div>`); await press();
      }
      set.endRun();
    }
    report('results');
    const ms = measures(res, j, st.prev); const list = marks(res, j); set.setMarks(list); setView(views.street);
    say((res.extra ? withHomes(j, res.extra) : '') + comment(res, j));
    const more = nextStep(res, j) !== 'none' && st.runs < 3;     // Florence has an idea to try: changing the street is the main button
    swap(`<h3>${esc(resultsHead(res, j, bestWas))}</h3>
      <div class="rd-nums">${ms.map((m) => `<button type="button" class="rd-num ${m.grade}" data-num="${m.id}" aria-pressed="false"><small>${esc(m.label)}</small><b>${esc(m.value)}</b><em>${GRADE[m.grade]}</em>${m.was && m.was !== m.value ? `<i>Last run: ${esc(m.was)}</i>` : ''}</button>`).join('')}</div>
      <p class="rd-legend">${pick(T.legend)}</p>
      <div class="rd-row end"><p class="rd-hint" aria-live="polite"></p><button type="button" class="${more ? 'go' : ''}" ${more ? 'data-primary' : ''} data-act="change">${pick(T.change)}</button><button class="${more ? '' : 'go'}" type="button" ${more ? '' : 'data-primary'} data-act="keep">${pick(T.keep)}</button></div>`);
    const hint = tray.querySelector('.rd-hint'); let sel = null;
    const where = { wait: () => slotX(res.where.wait.drop), walk: () => (slotX(res.where.walk.home) + slotX(res.where.walk.drop)) / 2, queue: () => (res.where.queue ? slotX(res.where.queue.drop) + 3 : null) };
    const act = await new Promise((done) => { tray.onclick = (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled || tooSoon(e)) return;
      if (b.dataset.act) return done(b.dataset.act);
      const id = b.dataset.num; sel = sel === id ? null : id;
      for (const o of tray.querySelectorAll('[data-num]')) o.setAttribute('aria-pressed', String(o.dataset.num === sel));
      const onStreet = sel && ['wait', 'walk', 'queue', 'safe'].includes(sel) && res.ran; set.selectMark(onStreet ? sel : null);
      const x = sel && where[sel] && res.ran ? where[sel]() : null; setView(x === null ? views.street : views.spot(x, sel === 'walk' ? Math.max(9, Math.abs(slotX(res.where.walk.home) - slotX(res.where.walk.drop)) / 2 + 5) : 9));
      hint.textContent = sel ? whereSay(sel, res, j) : ''; if (sel) ctx.say(hint.textContent);
    }; });
    tray.onclick = null; set.setMarks(null);
    return act;
  }

  // ================= 4. the freed land: the plots are in view above the panel, each with its letter on a sign
  async function freed() {
    report('land'); keep('land'); set.setMarks(null); set.setOld(false); set.setNames(false); set.setLayout(st.layout); set.setPlots({ plots: st.plots, letters: true }); setView(views.land);
    say(landIntro(j, st.res.fleet));
    const names = ['A', 'B', 'C'];
    swap(`<div class="rd-plots">${names.map((n, i) => `<div class="rd-plot" role="group" aria-label="Plot ${n}"><b class="rd-letter" aria-hidden="true">${n}</b>${USE_IDS.map((id) => `<button type="button" data-plot="${i}" data-use="${id}" ${i === 0 && id === USE_IDS[0] ? 'data-fallback' : ''} aria-pressed="false" aria-label="Plot ${n}: ${USE[id].name}, ${esc(pick(USE[id].gain))}"><span class="ico" aria-hidden="true">${USE[id].icon}</span>${USE[id].name}</button>`).join('')}</div>`).join('')}</div>
      <div class="rd-foot"><ul class="rd-sum" aria-live="polite"></ul><div class="rd-row"><button class="go" type="button" data-primary data-act="build" ${land(st.plots).done ? '' : 'disabled'}>${pick(T.build)}</button></div></div>`);
    const sum = tray.querySelector('.rd-sum');
    const effect = (L) => (L.families ? { before: sim(0).longestWait, after: sim(L.families).longestWait } : null);
    const draw = () => {
      const L = land(st.plots);
      for (const b of tray.querySelectorAll('[data-use]')) b.setAttribute('aria-pressed', String(st.plots[+b.dataset.plot] === b.dataset.use));
      sum.innerHTML = landSummary(st.plots, j, effect(L)).map((l) => `<li>${esc(l)}</li>`).join('');
      tray.querySelector('[data-act="build"]').disabled = !L.done; measure();
    };
    draw();
    await new Promise((res) => { tray.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled || tooSoon(e)) return; if (b.dataset.use) { const i = +b.dataset.plot; st.plots[i] = b.dataset.use; set.setPlots({ plots: st.plots, letters: true }); draw(); keep('land'); ctx.say(`Plot ${names[i]}: ${USE[b.dataset.use].name}, ${pick(USE[b.dataset.use].gain)}.`); } else if (b.dataset.act === 'build') res(); }; });
    tray.onclick = null; st.built = true; st.extra = land(st.plots).families; keep('built');
  }
  // the land is built. New homes mean more calls: Florence offers to run the morning with them.
  async function built() {
    report('land'); const L = land(st.plots); st.extra = L.families; set.setMarks(null); set.setNames(false); set.setLayout(st.layout); set.setPlots({ plots: st.plots, letters: true }); setView(views.land);
    const lines = landSummary(st.plots, j, L.families ? { before: sim(0).longestWait, after: sim(L.families).longestWait } : null);
    say(L.families ? newHomesAsk(j, L.families) : landClose(st.plots, j));
    swap(`<h3>${j ? 'The old car park now' : 'The car park, reused'}</h3><div class="rd-foot"><ul class="rd-sum">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}<li>${esc(landClose(st.plots, j))}</li></ul>
      <div class="rd-row">${L.families ? `<button type="button" data-act="ride">${pick(T.rideGo)}</button><button class="go" type="button" data-primary data-act="rerun">${T.rerun}</button>` : `<button class="go" type="button" data-primary data-act="ride">${pick(T.rideGo)}</button>`}</div></div>`);
    return press();
  }

  // ================= 5. the ride
  async function rideAlong() {
    report('ride'); keep('built'); set.setMarks(null); set.setFocus(-1); set.setNames(false); set.endRun(); set.setLayout(st.layout); set.setPlots({ plots: st.plots });
    const stops = rideStops(st.layout, st.plots, j, st.res);
    const behind = (x) => ({ pos: V(x - 7.5, 3.6, -1.5), look: V(x + 10, 0.9, -0.3), fov: 52, fast: true });
    const toLand = (x) => ({ pos: V(x - 1.5, 10.5, -5), look: V(x - 1.5, 0.4, 9), fov: 58, fast: true });   // turn to look at the old car park
    const stopX = (s) => (s.at < 0 ? -5 : s.at >= SLOTS ? 43 : s.kind === 'land' ? 12 : s.kind === 'walk' || s.kind === 'cycle' ? slotX(s.at) - 3.4 : slotX(s.at));
    const crossAt = (s, p) => (s.kind === 'walk' || s.kind === 'cycle' ? { slot: s.at, p, kind: s.kind === 'cycle' || (j && s.at === 6) ? 'cycle' : 'walk' } : null);
    if (reduce) {
      // no movement: every stop as a still view, one press each, ending on the closing line
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i]; const x = stopX(s); set.setRide(x, crossAt(s, 0.5)); setView(s.kind === 'land' ? toLand(x) : behind(x), true);
        say(s.text); const last = i === stops.length - 1;
        swap(`<div class="rd-row"><p class="rd-cap">The ride: view ${i + 1} of ${stops.length}</p><button class="go" type="button" data-primary data-act="next">${last ? T.finish : T.next}</button></div>`); await press();
      }
    } else {
      swap(`<div class="rd-row"><p class="rd-cap">${j ? 'Riding along your street…' : 'Riding the street…'}</p><button type="button" data-primary data-act="end">Skip the ride</button></div>`);
      // each caption stays for at least HOLD seconds: the car waits at a stop, or slows before the next one
      const HOLD = 2.8; let x = -6, hold = 0, held = 0, idx = 0, said = -99, at = null, prev = secs(), ended = false;
      set.setRide(x); setView(behind(x), true);
      await new Promise((done) => {
        tray.onclick = (e) => { if (e.target.closest('[data-act="end"]') && !tooSoon(e)) { anim = null; done(); } };
        anim = (real) => {
          const dt = Math.min(0.25, Math.max(0, real - prev)); prev = real;
          if (hold > 0) hold -= dt;
          else {
            at = null; const next = stops[idx]; const trigger = next ? stopX(next) - (next.pause ? 0 : 3) : 99;
            if (next && x >= trigger) { if (real - said >= HOLD) { say(next.text); said = real; idx++; if (next.pause) { x = stopX(next); at = next; hold = held = next.kind === 'land' ? 3.8 : HOLD; } } }
            else x = Math.min(trigger, x + dt * 5.2);
            if (!next && x >= 43 && real - said >= 1.2) ended = true;
          }
          set.setRide(Math.min(x, 43), at ? crossAt(at, 1 - Math.max(0, hold) / held) : null); view = at && at.kind === 'land' ? toLand(x) : behind(Math.min(x, 43));
          if (ended) { anim = null; done(); }
        };
      });
      tray.onclick = null; const end = stops[stops.length - 1]; set.setRide(43); setView(behind(43)); if (spoken !== end.text) say(end.text);
      swap(`<div class="rd-row"><p class="rd-cap">${j ? 'The end of your street.' : 'End of the street.'}</p><button class="go" type="button" data-primary data-act="next">${T.finish}</button></div>`); await press();
    }
    st.rode = true; set.setRide(null);
  }

  // ================= the loop
  measure();
  const resume = !!saved && st.layout.includes('drop');
  if (!resume) await meet();
  let stage = resume ? saved.stage : 'design';
  if (stage === 'built' && !land(st.plots).done) stage = 'land';
  if (stage !== 'design') { st.extra = stage === 'built' ? land(st.plots).families : 0; st.built = stage === 'built'; st.res = sim(0); if (!st.runs) st.runs = 1; } else st.built = false;
  for (let first = !resume; ;) {
    if (stage === 'design') { await design(first); first = false; const act = await morning(); if (act === 'keep') { if (st.built) break; stage = 'land'; } continue; }
    if (stage === 'land') { await freed(); stage = 'built'; }
    const act = await built(); if (act === 'ride') break;
    if ((await morning()) === 'keep') break;
    stage = 'design';
  }
  if (!st.res || st.res.extra !== st.extra) st.res = sim(st.extra);   // the record's numbers include the families in the new homes
  await rideAlong();
  report('done'); st.built = false; keep('design');
  return {
    finished: true,
    record: { made: { title: madeTitle(j), lines: madeLines(st.layout, st.res, st.plots, j), picture: picture(st.layout, st.plots, st.res, j) }, practised: practised(st.layout, st.plots, st, j) },
    town: { kind: 'roads-street', data: { layout: st.layout, plots: st.plots, safe: crossings(st.layout, j).filter((c) => c.safe).length } },
  };
}

export default {
  id: 'roads', icon: '🚗',
  title: T.title,
  blurb: { j: 'Redesign a street for shared self-driving cars.', s: 'Redesign one street for shared autonomous cars and weigh the trade-off.' },
  css, run, show,
};
