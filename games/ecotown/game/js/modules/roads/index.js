// "Roads for self-driving cars": one module of Eco Town of the future (docs/MODULES.md).
// The loop: meet the street as it is → place drop-off points, waiting bays and crossings → run the morning and read
// the numbers (change it and run again as often as wanted) → choose what the freed car park becomes → ride the street.
// Rules and numbers: street.js. Words and the take-home record: words.js. The 3D set: scene.js. The town model: town.js.
import { SLOTS, JUNCTION, CARPARK_SPACES, kindsFor, cleanLayout, cleanPlots, place, counts, crossings, simulate, land, tripsFor, fleetFor, USE_IDS, FREE_PLOTS, PLOT_M2 } from './street.js';
import { PIECES, USE, T, GRADE, pieceName, beside, intro, rules, designAsk, needDrop, noJunction, placed, runSay, measures, comment, landIntro, landSummary, rideStops, madeLines, madeTitle, practised, picture } from './words.js';
import { createStreet, slotX } from './scene.js';
import { show } from './town.js';

const P = '#module[data-module="roads"]';
const css = `
${P} .rd-top { position: absolute; left: 230px; right: 12px; top: 12px; max-width: 760px; display: flex; gap: 10px; align-items: flex-start; padding: 10px 14px; border-radius: 14px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
${P} .rd-top b.who { flex: none; padding: 2px 10px; border-radius: 10px; background: #2e9b5a; color: #fff; font-weight: 800; font-size: .85rem; }
${P} .rd-top p { margin: 0; flex: 1; font-size: 1rem; line-height: 1.35; font-weight: 600; }
${P} .rd-top p small { display: block; margin-top: 4px; font-size: .88rem; font-weight: 600; color: #5e4936; }
${P} button { font: 800 1rem Inter, system-ui, sans-serif; color: #3b2a1e; cursor: pointer; border: 0; border-radius: 12px; min-height: 44px; padding: 6px 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; }
${P} button:focus-visible { outline: 3px solid #1c6fd0; outline-offset: 2px; }
${P} button[disabled] { color: #8a7a6a; box-shadow: inset 0 0 0 2px #d2c4ac; cursor: default; }
${P} button.go { background: #2e9b5a; color: #fff; box-shadow: inset 0 0 0 2px #1f7442, 0 3px 0 #1a5a34; }
${P} button.go[disabled] { background: #c9d6c6; color: #5c6b5c; box-shadow: inset 0 0 0 2px #aab8a8; }
${P} .rd-say { flex: none; min-width: 44px; padding: 6px; }
${P} .rd-tray { position: absolute; left: 12px; right: 12px; bottom: 12px; margin: 0 auto; max-width: 980px; max-height: 58vh; overflow: auto; padding: 10px 12px; border-radius: 16px; background: #f3e4c6; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
${P} .rd-tray h3 { margin: 0 0 6px; font-size: 1.05rem; }
${P} .rd-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
${P} .rd-row.end { justify-content: flex-end; margin-top: 8px; }
${P} .rd-pal button { display: flex; align-items: center; gap: 6px; }
${P} .rd-pal button[aria-pressed="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 3px #c8553d, 0 3px 0 #7a5a33; }
${P} .rd-pal i { font-style: normal; font-weight: 700; color: #5e4936; }
${P} .chip { display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; color: #fff; font-weight: 800; font-size: .85rem; }
${P} .rd-slots { display: grid; grid-template-columns: repeat(${SLOTS}, minmax(0, 1fr)); gap: 4px; margin: 8px 0 4px; }
${P} .rd-slots button { display: grid; grid-template-rows: 18px 30px 18px; justify-items: center; align-items: center; padding: 3px 0; min-height: 76px; border-radius: 10px; font-size: .8rem; }
${P} .rd-slots button .mid { font-size: 1.25rem; line-height: 1; color: #8a7a6a; }
${P} .rd-slots button.has { background: #fff; }
${P} .rd-slots button.no { background: #cfc6b4; box-shadow: inset 0 0 0 2px #a89c86; }
${P} .rd-slots small { font-size: .8rem; line-height: 1; }
${P} .rd-ends { display: flex; justify-content: space-between; font-size: .8rem; font-weight: 700; color: #5e4936; }
${P} .rd-hint { margin: 0; flex: 1; min-width: 180px; font-size: .92rem; font-weight: 600; color: #5e4936; }
${P} .rd-nums { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
${P} .rd-num { padding: 8px 10px; border-radius: 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; }
${P} .rd-num small { display: block; font-size: .82rem; font-weight: 700; color: #5e4936; }
${P} .rd-num b { display: block; font-size: 1.25rem; }
${P} .rd-num em { font-style: normal; font-size: .82rem; font-weight: 800; }
${P} .rd-num.good { box-shadow: inset 0 0 0 3px #2e9b5a; } ${P} .rd-num.good em { color: #1f7442; }
${P} .rd-num.fair { box-shadow: inset 0 0 0 3px #d99a1c; } ${P} .rd-num.fair em { color: #8a5a00; }
${P} .rd-num.poor { box-shadow: inset 0 0 0 3px #c8553d; } ${P} .rd-num.poor em { color: #9a3220; }
${P} .rd-num i { display: block; font-style: normal; font-size: .8rem; color: #5e4936; }
${P} .rd-clock { font-size: 1.3rem; font-weight: 800; min-width: 5.5em; }
${P} .rd-bar { flex: 1; min-width: 120px; height: 12px; border-radius: 6px; background: #d2c4ac; overflow: hidden; } ${P} .rd-bar span { display: block; height: 100%; width: 0; background: #2e9b5a; }
${P} .rd-plots { display: grid; grid-template-columns: repeat(${FREE_PLOTS}, minmax(0, 1fr)); gap: 8px; }
${P} .rd-plot { padding: 8px; border-radius: 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; }
${P} .rd-plot h4 { margin: 0 0 6px; font-size: .95rem; }
${P} .rd-plot button { display: block; width: 100%; margin-top: 5px; text-align: left; font-size: .92rem; padding: 5px 8px; }
${P} .rd-plot button small { display: block; font-weight: 600; font-size: .8rem; color: #5e4936; }
${P} .rd-plot button[aria-pressed="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 3px #c8553d, 0 3px 0 #7a5a33; }
${P} .rd-sum { margin: 8px 0 0; padding: 0 0 0 18px; font-size: .92rem; font-weight: 600; }
${P} .rd-cap { margin: 0; flex: 1; min-width: 200px; font-size: 1.05rem; font-weight: 700; }
${P} ul.rd-rules { margin: 6px 0 0; padding-left: 18px; font-size: .95rem; font-weight: 600; }
${P}.rd-large .rd-top p, ${P}.rd-large .rd-cap { font-size: 1.2rem; } ${P}.rd-large button { font-size: 1.15rem; } ${P}.rd-large .rd-hint, ${P}.rd-large .rd-sum, ${P}.rd-large ul.rd-rules, ${P}.rd-large .rd-num small, ${P}.rd-large .rd-num em { font-size: 1.05rem; }
@media (max-width: 760px) { ${P} .rd-top { left: 12px; top: 64px; } ${P} .rd-slots button { min-height: 66px; } ${P} .rd-plots { grid-template-columns: 1fr; } }
@media (max-height: 620px) { ${P} .rd-tray { max-height: 66vh; padding: 6px 10px; } ${P} .rd-slots button { min-height: 58px; grid-template-rows: 14px 26px 14px; } }
`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const SEED = 7;                                  // the same morning every run, so two runs can be compared fairly
const ORIGIN = [0, 0, -3000];                    // the set stands far from the island, with its own camera

async function run(ctx) {
  const j = !!ctx.junior; const reduce = !!ctx.settings?.reduceMotion; const { THREE, scene, camera, canvas } = ctx.engine;
  const families = Math.max(0, Math.round(ctx.town?.sim?.families || 0)); const trips = tripsFor(families); const fleet = fleetFor(trips);
  const kinds = kindsFor(j);
  // ---- what is kept between visits
  const saved = ctx.saved && ctx.saved.v === 1 ? ctx.saved : null;
  const st = { layout: cleanLayout(saved?.layout, j), plots: cleanPlots(saved?.plots), runs: 0, changes: 0, rode: false, res: null, prev: null, kind: 'drop' };
  const keep = (stage) => ctx.save({ v: 1, stage, layout: st.layout, plots: st.plots });
  const report = (id) => ctx.report({ stage: T.stage[id] });

  // ---- the page layer
  const wrap = ctx.root.parentElement; if (ctx.settings?.largeText) wrap?.classList.add('rd-large');
  const top = el(`<div class="rd-top"><b class="who">Florence</b><p aria-live="polite"></p><button class="rd-say" type="button" aria-label="Read aloud">🔊</button></div>`);
  const tray = el('<div class="rd-tray"></div>'); ctx.root.append(top, tray);
  let spoken = '';
  const say = (text, extra = '') => { spoken = text; top.querySelector('p').innerHTML = esc(text) + (extra ? `<small>${esc(extra)}</small>` : ''); ctx.say(text); };
  top.querySelector('.rd-say').onclick = () => ctx.say(spoken);
  // wait for a press on a [data-act] button in the tray
  const press = () => new Promise((res) => { tray.onclick = (e) => { const b = e.target.closest('[data-act]'); if (b && !b.disabled) { tray.onclick = null; res(b.dataset.act); } }; });
  const focusFirst = (sel) => { const b = tray.querySelector(sel); if (b && document.activeElement && document.activeElement !== document.body) b.focus(); };

  // ---- the 3D set and its camera
  const set = createStreet(THREE); set.root.position.set(...ORIGIN); scene.add(set.root);
  const V = (x, y, z) => new THREE.Vector3(x + ORIGIN[0], y + ORIGIN[1], z + ORIGIN[2]);
  const cam = { pos: V(20, 40, 50), look: V(20, 0, 6), fov: 34, cut: true, goal: null };
  const now = { pos: cam.pos.clone(), look: cam.look.clone(), fov: cam.fov };
  const views = {
    street: () => { const half = Math.atan(Math.tan((34 * Math.PI) / 360) * Math.max(0.5, camera.aspect)); const d = Math.max(44, 25 / Math.tan(half)); const a = (44 * Math.PI) / 180; return { pos: V(20, Math.sin(a) * d, 7.5 + Math.cos(a) * d), look: V(20, 0, 7.5), fov: 34 }; },
    land: () => { const d = camera.aspect < 1 ? 46 : 30; return { pos: V(15, d * 0.62, 12 + d * 0.8), look: V(12, 0, 12), fov: 34 }; },
  };
  let view = 'street'; let anim = null;
  const setView = (name, cut = false) => { view = name; if (cut || reduce) cam.cut = true; };
  const m4 = new THREE.Matrix4(); const up = new THREE.Vector3(0, 1, 0);
  ctx.engine.onFrame((dt) => {
    if (anim) anim(dt);
    const g = typeof view === 'string' ? views[view]() : view;
    if (cam.cut || reduce) { now.pos.copy(g.pos); now.look.copy(g.look); now.fov = g.fov; cam.cut = false; }
    else { const k = 1 - Math.exp(-dt * (g.fast ? 9 : 3.5)); now.pos.lerp(g.pos, k); now.look.lerp(g.look, k); now.fov += (g.fov - now.fov) * k; }
    camera.position.copy(now.pos); camera.quaternion.setFromRotationMatrix(m4.lookAt(now.pos, now.look, up));
    if (Math.abs(camera.fov - now.fov) > 0.01) { camera.fov = now.fov; camera.updateProjectionMatrix(); }
  });

  // ---- taps on the 3D street (the game's own camera controls are held off while the module is open)
  let onStreetTap = null; let down = null;
  const guard = (e) => {
    if (e.target !== canvas) return; e.stopPropagation();
    if (e.type === 'pointerdown') down = { x: e.clientX, y: e.clientY };
    if (e.type === 'pointerup' && down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 12 && onStreetTap) {
      const r = canvas.getBoundingClientRect(); const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const slot = set.slotAt(ray.ray.origin.clone().sub(V(0, 0, 0)), ray.ray.direction); if (slot >= 0) onStreetTap(slot);
    }
    if (e.type === 'pointerup') down = null;
  };
  const EVENTS = ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'click', 'dblclick', 'contextmenu'];
  for (const n of EVENTS) document.addEventListener(n, guard, true);
  let onKey = null; const key = (e) => { if (onKey && !e.ctrlKey && !e.metaKey && !e.altKey && onKey(e)) { e.preventDefault(); e.stopPropagation(); } };
  document.addEventListener('keydown', key, true);
  ctx.onLeave(() => { for (const n of EVENTS) document.removeEventListener(n, guard, true); document.removeEventListener('keydown', key, true); anim = null; onStreetTap = null; onKey = null; set.dispose(); wrap?.classList.remove('rd-large'); });

  // ================= 1. the street as it is
  async function meet() {
    report('intro'); set.setOld(true); set.setPlots('full'); set.setLayout(cleanLayout(null)); set.setLines(null); setView('street', true);
    const lines = intro(j, families, trips);
    for (let i = 0; i < lines.length - 1; i++) {
      say(lines[i]); tray.innerHTML = `<div class="rd-row end"><button class="go" type="button" data-act="next">${T.next}</button></div>`; focusFirst('[data-act]'); await press();
    }
    say(lines[lines.length - 1]);
    tray.innerHTML = `<h3>${j ? 'What the cars need' : 'How the cars behave'}</h3><ul class="rd-rules">${rules(j).map((r) => `<li>${esc(r)}</li>`).join('')}</ul><div class="rd-row end"><button class="go" type="button" data-act="next">${pick(T.start)}</button></div>`;
    ctx.say(rules(j).join(' ')); focusFirst('[data-act]'); await press();
  }
  const pick = (o) => (j ? o.j : o.s);

  // ================= 2. design
  async function design(first) {
    report('design'); keep('design'); set.setOld(false); set.setPlots(st.runs ? { plots: st.plots } : 'full'); set.endRun(); set.setLines(null); set.setLayout(st.layout); setView('street');
    say(designAsk(j), pick(PIECES[st.kind].desc));
    tray.innerHTML = `<div class="rd-row rd-pal" role="group" aria-label="Pieces">${kinds.map((k, i) => `<button type="button" data-kind="${k}" aria-pressed="false"><span class="chip" style="background:${PIECES[k].color}" aria-hidden="true">${PIECES[k].letter}</span><span aria-hidden="true">${PIECES[k].icon}</span> ${esc(pieceName(k, j))} <i data-n="${k}"></i><small hidden> key ${i + 1}</small></button>`).join('')}</div>
      <div class="rd-slots" role="group" aria-label="Places on the street, west to east">${Array.from({ length: SLOTS }, (_, s) => `<button type="button" data-slot="${s}"></button>`).join('')}</div>
      <div class="rd-ends" aria-hidden="true"><span>← ${j ? 'the shop end' : 'west'}</span><span>${j ? 'homes above, shop and school below' : 'homes: north side · shop, car park, school: south side'}</span><span>${j ? 'the school end' : 'east'} →</span></div>
      <div class="rd-row end"><p class="rd-hint" aria-live="polite"></p><button class="go" type="button" data-act="run">${pick(T.run)}</button></div>`;
    const hint = tray.querySelector('.rd-hint');
    const draw = () => {
      const c = counts(st.layout);
      for (const b of tray.querySelectorAll('[data-kind]')) { b.setAttribute('aria-pressed', String(b.dataset.kind === st.kind)); b.querySelector('[data-n]').textContent = `× ${c[b.dataset.kind]}`; }
      for (const b of tray.querySelectorAll('[data-slot]')) {
        const s = +b.dataset.slot; const k = st.layout[s]; const by = beside(s, j); const jn = s === JUNCTION;
        b.className = jn ? 'no' : k ? 'has' : '';
        b.setAttribute('aria-label', `Place ${s + 1}, by ${by.text}: ${jn ? 'nothing can go here' : k ? pieceName(k, j) : 'empty'}`);
        b.innerHTML = `<small aria-hidden="true">${s === 6 ? '🚲' : '🏠'}</small><span class="mid" aria-hidden="true">${jn ? '✕' : k ? `<span class="chip" style="background:${PIECES[k].color}">${PIECES[k].letter}</span>` : '＋'}</span><small aria-hidden="true">${by.icon}</small>`;
      }
      tray.querySelector('[data-act="run"]').disabled = !c.drop;
    };
    const put = (s) => {
      if (s === JUNCTION) { hint.textContent = noJunction(j); ctx.say(noJunction(j)); return; }
      const before = st.layout[s]; st.layout = place(st.layout, s, st.kind); if (st.runs) st.changes++;
      set.setLayout(st.layout); set.setFocus(s); draw(); keep('design');
      hint.textContent = placed(st.kind, s, st.layout[s] === st.kind, j) + (before && st.layout[s] ? ` It replaced the ${pieceName(before, j).toLowerCase()}.` : '');
    };
    const choose = (k) => { st.kind = k; draw(); say(pick(PIECES[k].desc)); };
    const hover = (e) => { const b = e.target.closest?.('[data-slot]'); if (b) set.setFocus(+b.dataset.slot); }; tray.onmouseover = hover; tray.onfocusin = hover;
    draw(); if (!first) hint.textContent = j ? 'Tap a piece on the street again to take it away.' : 'Tap a placed piece again to remove it.';
    onStreetTap = put;
    onKey = (e) => {
      const n = '1234'.indexOf(e.key); if (n >= 0 && n < kinds.length) { choose(kinds[n]); return true; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const cur = document.activeElement?.dataset?.slot; const s = cur === undefined ? (e.key === 'ArrowRight' ? 0 : SLOTS - 1) : (+cur + (e.key === 'ArrowRight' ? 1 : SLOTS - 1)) % SLOTS; tray.querySelector(`[data-slot="${s}"]`).focus(); set.setFocus(s); return true; }
      return false;
    };
    for (;;) {
      const act = await new Promise((res) => { tray.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; if (b.dataset.kind) choose(b.dataset.kind); else if (b.dataset.slot) put(+b.dataset.slot); else if (b.dataset.act) res(b.dataset.act); }; });
      if (act === 'run' && counts(st.layout).drop) break;
      say(needDrop(j));
    }
    tray.onclick = tray.onmouseover = tray.onfocusin = null; onStreetTap = null; onKey = null; set.setFocus(-1);
  }

  // ================= 3. run the morning, then read the numbers
  async function morning() {
    report('run'); keep('design'); st.prev = st.res; st.res = simulate(st.layout, { families, seed: SEED, junior: j }); st.runs++;
    const res = st.res; set.setLines(res.crossings); set.setPlots({ plots: st.plots }); setView('street');
    if (!reduce) {
      say(runSay(j, res.trips, res.fleet));
      tray.innerHTML = `<div class="rd-row"><span class="rd-clock" aria-live="off">7:30</span><div class="rd-bar" aria-hidden="true"><span></span></div><button type="button" data-act="skip">${T.skip}</button></div>`;
      const clock = tray.querySelector('.rd-clock'), bar = tray.querySelector('.rd-bar span'); const end = res.end + 20; const speed = end / 26; let t = 0;
      set.startRun(res);
      await new Promise((done) => {
        anim = (dt) => { t = Math.min(end, t + dt * speed); set.updateRun(t); const m = Math.floor(t / 60); clock.textContent = `${7 + Math.floor((30 + m) / 60)}:${String((30 + m) % 60).padStart(2, '0')}`; bar.style.width = `${(100 * t) / end}%`; if (t >= end) { anim = null; done(); } };
        tray.onclick = (e) => { if (e.target.closest('[data-act="skip"]')) { anim = null; done(); } };
      });
      tray.onclick = null; set.endRun();
    }
    report('results');
    const ms = measures(res, j, st.prev);
    say(comment(res, j));
    tray.innerHTML = `<h3>${j ? `The morning in numbers: ${res.trips} families, ${res.fleet} shared cars` : `Morning peak: ${res.trips} calls in 30 min, ${res.fleet} shared cars (${res.carsInBays} in bays, ${res.carsOutside} outside the street)`}</h3>
      <div class="rd-nums">${ms.map((m) => `<div class="rd-num ${m.grade}"><small>${esc(m.label)}</small><b>${esc(m.value)}</b><em>${GRADE[m.grade]}</em>${m.was && m.was !== m.value ? `<i>Last run: ${esc(m.was)}</i>` : ''}</div>`).join('')}</div>
      <div class="rd-row end"><button type="button" data-act="change">${pick(T.change)}</button><button class="go" type="button" data-act="keep">${pick(T.keep)}</button></div>`;
    focusFirst('[data-act="keep"]');
    return press();
  }

  // ================= 4. the freed land
  async function freed() {
    report('land'); keep('land'); set.setLines(null); set.setOld(false); set.setLayout(st.layout); set.setPlots({ plots: st.plots }); setView('land');
    say(landIntro(j, st.res.fleet));
    const names = ['A', 'B', 'C'];
    tray.innerHTML = `<div class="rd-plots">${names.map((n, i) => `<div class="rd-plot" role="group" aria-label="Plot ${n}"><h4>Plot ${n}${j ? '' : ` · ${PLOT_M2} m²`}</h4>${USE_IDS.map((id) => `<button type="button" data-plot="${i}" data-use="${id}" aria-pressed="false"><span aria-hidden="true">${USE[id].icon}</span> ${USE[id].name}<small>${esc(USE[id].gain)}</small></button>`).join('')}</div>`).join('')}</div>
      <ul class="rd-sum" aria-live="polite"></ul><div class="rd-row end"><button class="go" type="button" data-act="build">${pick(T.build)}</button></div>`;
    const sum = tray.querySelector('.rd-sum');
    const draw = () => {
      const L = land(st.plots);
      for (const b of tray.querySelectorAll('[data-use]')) b.setAttribute('aria-pressed', String(st.plots[+b.dataset.plot] === b.dataset.use));
      const effect = L.families ? { before: st.res.longestWait, after: simulate(st.layout, { families, extraFamilies: L.families, seed: SEED, junior: j }).longestWait } : null;
      sum.innerHTML = landSummary(st.plots, j, effect).map((l) => `<li>${esc(l)}</li>`).join('');
      tray.querySelector('[data-act="build"]').disabled = !L.done;
    };
    draw();
    await new Promise((res) => { tray.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; if (b.dataset.use) { const i = +b.dataset.plot; st.plots[i] = b.dataset.use; set.setPlots({ plots: st.plots }); draw(); keep('land'); ctx.say(`Plot ${names[i]}: ${USE[b.dataset.use].name}, ${USE[b.dataset.use].gain}.`); } else if (b.dataset.act === 'build') res(); }; });
    tray.onclick = null;
    const L = land(st.plots); say(landSummary(st.plots, j).slice(0, 3).join(' '));
    tray.innerHTML = `<h3>${j ? 'The old car park now' : `The ${CARPARK_SPACES}-space car park, reused`}</h3><ul class="rd-sum">${landSummary(st.plots, j).map((l) => `<li>${esc(l)}</li>`).join('')}<li>${j ? 'There is no single right answer. This is your choice for your town.' : `No option is the right one: ${L.freed} m² now does a different job.`}</li></ul><div class="rd-row end"><button class="go" type="button" data-act="ride">${pick(T.rideGo)}</button></div>`;
    focusFirst('[data-act]'); await press();
  }

  // ================= 5. the ride
  async function rideAlong() {
    report('ride'); keep('land'); set.setLines(null); set.setFocus(-1);
    const stops = rideStops(st.layout, st.plots, j);
    const behind = (x) => ({ pos: V(x - 7.5, 3.6, -1.5), look: V(x + 10, 0.9, -0.3), fov: 52, fast: true });
    const stopX = (s) => (s.at < 0 ? -5 : s.at >= SLOTS ? 43 : s.kind === 'walk' || s.kind === 'cycle' ? slotX(s.at) - 3.4 : slotX(s.at));
    if (reduce) {
      // no movement: a few still views, one press each
      const shown = stops.filter((s, i) => i === 0 || s.pause || s.kind === 'land' || i === stops.length - 1).slice(0, 7);
      for (let i = 0; i < shown.length; i++) {
        const s = shown[i]; const x = stopX(s); set.setRide(x, s.kind === 'walk' || s.kind === 'cycle' ? { slot: s.at, p: 0.5 } : null); view = behind(x); cam.cut = true;
        say(s.text); const last = i === shown.length - 1;
        tray.innerHTML = `<div class="rd-row"><p class="rd-cap">${j ? 'View' : 'View'} ${i + 1} of ${shown.length}</p><button class="go" type="button" data-act="next">${last ? T.finish : T.next}</button></div>`; focusFirst('[data-act]'); await press();
      }
    } else {
      tray.innerHTML = `<div class="rd-row"><p class="rd-cap">${j ? 'Riding along your street…' : 'Riding the street…'}</p><button type="button" data-act="end">${j ? 'Skip the ride' : 'Skip the ride'}</button></div>`;
      let x = -6, hold = 0, crossing = null; const todo = stops.slice(); const pauses = stops.filter((s) => s.pause).map((s) => ({ s, x: stopX(s), done: false }));
      set.setRide(x); view = behind(x); cam.cut = true;
      await new Promise((done) => {
        tray.onclick = (e) => { if (e.target.closest('[data-act="end"]')) { anim = null; done(); } };
        anim = (dt) => {
          while (todo.length && stopX(todo[0]) - 4.5 <= x) say(todo.shift().text);
          if (hold > 0) { hold -= dt; if (crossing) crossing.p = 1 - Math.max(0, hold) / 2.4; }
          else {
            crossing = null; x += dt * 5.2;
            const p = pauses.find((q) => !q.done && x >= q.x);
            if (p) { p.done = true; x = p.x; hold = 2.4; crossing = p.s.kind === 'drop' ? null : { slot: p.s.at, p: 0 }; }
          }
          set.setRide(x, crossing); view = behind(x);
          if (x >= 43) { anim = null; done(); }
        };
      });
      tray.onclick = null; say(stops[stops.length - 1].text);
      tray.innerHTML = `<div class="rd-row"><p class="rd-cap">${j ? 'The end of your street.' : 'End of the street.'}</p><button class="go" type="button" data-act="next">${T.finish}</button></div>`; focusFirst('[data-act]'); await press();
    }
    st.rode = true; set.setRide(null);
  }

  // ================= the loop
  const resume = saved && st.layout.includes('drop');
  if (!resume) await meet();
  let stage = 'design';
  if (resume && saved.stage === 'land') { st.res = simulate(st.layout, { families, seed: SEED, junior: j }); st.runs = 1; stage = 'land'; }
  for (let first = !resume; ; first = false) {
    if (stage === 'design') { await design(first); const act = await morning(); if (act === 'keep') stage = 'land'; continue; }
    await freed(); break;
  }
  await rideAlong();
  report('done'); keep('design');
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
