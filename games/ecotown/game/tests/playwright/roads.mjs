// A browser run of the "roads" module (js/modules/roads), from start to finish, with screenshots.
// Usage: node tests/playwright/roads.mjs [baseUrl] [outDir] [junior|senior] [width height]
//   MOTION=1 plays it with movement (the morning and the ride are animated); otherwise reduced motion is on.
//   LARGE=1 turns large text on. BUILT=1 plays it in Florence's practice town (36 or more families).
// It starts a town, opens the module, places the first drop-off point by a tap on the 3D street (the run FAILS if
// that tap does not place a piece), goes on by keyboard, by the helper strip and by more taps on the street, runs the
// morning twice, reads a number where it happened, chooses the freed land, runs the morning with the new homes, rides
// the street, and checks the record, the street left in the town and that the page logged no errors.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8863/', out = 'shots-roads', band = 'junior', W = 1280, H = 800] = process.argv.slice(2);
const motion = !!process.env.MOTION, large = !!process.env.LARGE, built = !!process.env.BUILT; const junior = band !== 'senior';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +W, height: +H } });
await p.addInitScript((prefs) => { window.__sayLog = []; localStorage.setItem('ecotown.prefs', JSON.stringify(prefs)); }, { quality: 'low', reduce: !motion, text: large ? 'large' : 'normal' });
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
const checks = {}; const fails = []; let n = 0;
const must = (name, ok, detail) => { checks[name] = detail === undefined ? ok : { ok, detail }; if (!ok) fails.push(name); };
const shot = async (name, wait = 900) => { await p.waitForTimeout(wait); await p.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png`, timeout: 150000 }); };
const LONG = 240000;
const click = async (sel, t = LONG) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.click(sel); };
const M = '#module[data-module="roads"] ';
const topText = () => p.evaluate((m) => document.querySelector(m + '.rd-top p')?.innerText || '', M);

// ---- helpers that look at the page
// where a point of the 3D set falls on the page, through the module's own camera
const project = (x, y, z) => p.evaluate(([px, py, pz]) => { const { app } = window.__eco; const cam = app.stage.camera; cam.updateMatrixWorld(); const v = new cam.position.constructor(px, py, pz - 3000).project(cam); const r = app.stage.renderer.domElement.getBoundingClientRect(); const at = { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height }; const el = document.elementFromPoint(at.x, at.y); return { ...at, tag: el?.tagName || null, inPanel: !!el?.closest?.('#module .rd-tray, #module .rd-top, #module .modback') }; }, [x, y, z]);
const slotHas = (s) => p.evaluate(([m, i]) => document.querySelector(`${m}[data-slot="${i}"]`)?.classList.contains('has') || false, [M, s]);
// do the panels overlap each other or leave the screen?
const layout = (name) => p.evaluate(() => {
  const q = (s) => document.querySelector(s)?.getBoundingClientRect(); const r = { back: q('#module .modback'), top: q('#module .rd-top'), tray: q('#module .rd-tray') };
  const hit = (a, c) => !!a && !!c && a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
  const off = [...document.querySelectorAll('#module button')].filter((e) => { const x = e.getBoundingClientRect(); return x.width && (x.right > innerWidth + 1 || x.left < -1 || x.top < -1); }).length;
  const tray = document.querySelector('#module .rd-tray');
  return { backTop: hit(r.back, r.top), topTray: hit(r.top, r.tray), off, scroll: tray ? tray.scrollHeight - tray.clientHeight : 0, trayH: Math.round(r.tray?.height || 0), free: Math.round((r.tray?.top || innerHeight) - Math.max(r.top?.bottom || 0, r.back?.bottom || 0)) };
}).then((l) => { must(`layout:${name}`, !l.backTop && !l.topTray && l.off === 0 && l.scroll <= 1 && l.free >= 150, l); return l; });
// after a step taken by keyboard, focus must be on the new screen's main button (or, when that is disabled, the chosen piece)
const focusOk = (name) => p.evaluate((m) => { const a = document.activeElement; return { ok: !!a && !!a.closest(m + '.rd-tray') && (a.hasAttribute('data-primary') || a.hasAttribute('data-fallback')), on: a ? (a.dataset.act || a.dataset.kind || a.tagName) : null }; }, M).then((f) => must(`focus:${name}`, f.ok, f.on));
const enter = async () => { await p.waitForTimeout(500); await p.keyboard.press('Enter'); await p.waitForTimeout(350); };

// ---- into a town
await p.goto(base + 'index.html', { timeout: LONG });
await click(`[data-band="${band}"]`);
await click('[data-name]'); await click('[data-go]');
await p.waitForTimeout(800);
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: LONG }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForSelector('#build [data-cat="land"]', { timeout: LONG });
await p.waitForFunction(() => window.__eco?.app?.G?.canMenu?.(), null, { timeout: LONG });
if (built) {
  checks.families = await p.evaluate(async () => {
    const { app, terrain } = window.__eco; const { seedTo, CLEAR } = await import('./js/game/seed.js'); const { plan, applyPlacements } = await import('./js/sim/planner.js');
    let cells = seedTo(terrain, 'heart'); cells = applyPlacements(cells, plan('heart', CLEAR.heart, { terrain, cells, numbers: { minutes: 10 } }).placements);
    for (const c of cells.values()) c.locked = false;
    app.G.cells = cells; for (const [k, c] of cells) app.world.setCell(k, c, { animate: false, reduce: true });
    return app.G.sim().families;
  });
  must('builtTown', checks.families >= 36, checks.families); await p.waitForTimeout(1500);
}

// ---- open the module: one screen, then the first drop-off point by a tap on the 3D street
const viewBefore = await p.evaluate(() => JSON.stringify(window.__eco.app.stage.camera.view));
await p.evaluate(() => { window.__roads = undefined; window.__eco.openModule('roads').then((r) => { window.__roads = r === undefined ? null : r; }); });
await p.waitForSelector(M + '.rd-top', { timeout: LONG }); const opened = Date.now();
must('backButton', await p.isVisible('#module .modback'));
await shot('first'); await layout('first');
checks.introWords = (await topText()).split(/\s+/).length; must('introShort', checks.introWords <= 45, checks.introWords);
await p.focus(M + '[data-act="next"]'); await enter();                      // Start, by keyboard
await p.waitForSelector(M + '[data-slot="0"]', { timeout: LONG });
must('onePressToDesign', true); await focusOk('design');
must('runNeedsDrop', await p.isDisabled(M + '[data-act="run"]'));
must('keyHintsShown', await p.isVisible(M + '.rd-key'));
await shot('design-empty'); const l0 = await layout('design');
checks.stripIcons = await p.evaluate((m) => ({ mark: parseFloat(getComputedStyle(document.querySelector(m + '.rd-marks i')).fontSize), slot: parseFloat(getComputedStyle(document.querySelector(m + '.rd-slots .mid')).fontSize), labels: [...document.querySelectorAll(m + '.rd-marks span')].map((e) => e.textContent.replace(/^\W+/, '')) }), M);
must('stripLabelled', checks.stripIcons.mark >= 20 && checks.stripIcons.slot >= 20 && checks.stripIcons.labels.join('|') === 'Shop|Car park|Side road|Cycle track|School', checks.stripIcons);
if (large) must('largeTextGrowsStrip', checks.stripIcons.mark >= 24 && checks.stripIcons.slot >= 24, checks.stripIcons);
// the tap on the street itself. This check cannot be skipped: if the point is under a panel or the tap places nothing, the run fails.
const tapStreet = async (slot) => { const at = await project(slot * 4 + 2, 0, -1.2); if (at.inPanel || at.x < 0 || at.y < 0 || at.x > +W || at.y > +H) return { ok: false, at }; await p.mouse.click(at.x, at.y); await p.waitForTimeout(450); return { ok: true, at }; };
await p.waitForTimeout(1200);                                                // let the camera settle
const tap1 = await tapStreet(3);
must('streetTapReachable', tap1.ok, tap1.at);
must('streetTapPlaces', tap1.ok && await slotHas(3), tap1.at);
checks.secondsToFirstDrop = Math.round((Date.now() - opened) / 1000);        // under software 3D; a child's device is far quicker
must('runReadyAfterFirstDrop', !(await p.isDisabled(M + '[data-act="run"]')));
must('florenceMovesOn', /Run the morning|run the morning/.test(await topText()), await topText());
await shot('street-tap');
{ const j5 = await tapStreet(5); must('junctionRefused', j5.ok && !(await slotHas(5)) && /side road|junction/.test(await p.evaluate((m) => document.querySelector(m + '.rd-hint').textContent, M))); }

// ---- the first morning: a thin street
const runMorning = async (name, byKey = false) => {
  const t0 = Date.now();
  if (byKey) { await p.focus(M + '[data-act="run"]'); await enter(); } else await click(M + '[data-act="run"]');
  if (motion) {
    await p.waitForSelector(M + '.rd-clock', { timeout: LONG }); if (byKey) await focusOk(`${name}-morning`);
    await p.waitForTimeout(2500); await shot(`${name}-morning`, 0); await layout(`${name}-morning`);
    await p.waitForSelector(M + '.rd-nums', { timeout: LONG });
    const s = (Date.now() - t0) / 1000; must(`${name}-morningRealTime`, s < 45, Math.round(s));   // 24 s of real time at most, plus slow screenshots
  } else {
    // reduced motion: two or three still pictures of the morning, one press each
    let pics = 0;
    for (let i = 0; i < 4; i++) {
      await p.waitForSelector(`${M}.rd-cap, ${M}.rd-nums`, { timeout: LONG }); if (await p.$(M + '.rd-nums')) break;
      pics++; const cap = await p.evaluate((m) => document.querySelector(m + '.rd-cap').textContent, M); const said = await topText();
      must(`${name}-still${pics}`, /picture \d of [23]/.test(cap) && /^\d:\d\d\. /.test(said), `${cap} | ${said}`);
      if (byKey) await focusOk(`${name}-still${pics}`);
      if (pics === 1) { await shot(`${name}-still`); await layout(`${name}-still`); }
      const actors = await p.evaluate(() => { let root = null; window.__eco.app.stage.scene.traverse((o) => { if (o.name === 'roads-street' && o.position.z < -2000) root = o; }); let pods = 0; root?.traverseVisible((o) => { if (o.isMesh && o.material?.color?.getHexString() === '18a999') pods++; }); return pods; });
      must(`${name}-still${pics}-drawn`, actors >= 1, actors);
      if (byKey) await enter(); else await click(M + '[data-act="next"]'); await p.waitForTimeout(300);
    }
    must(`${name}-reducedStills`, pics >= 2 && pics <= 3, pics);
  }
  await p.waitForSelector(M + '.rd-nums', { timeout: LONG }); if (byKey) await focusOk(`${name}-numbers`);
  return p.evaluate((m) => [...document.querySelectorAll(m + '.rd-num')].map((e) => [e.querySelector('small').textContent, e.querySelector('b').textContent, e.querySelector('em').textContent]), M);
};
const first = await runMorning('first', true); checks.firstRun = first;
await shot('numbers-first'); await layout('numbers-first');
must('headCountsGood', /Good: \d of \d/.test(await p.evaluate((m) => document.querySelector(m + '.rd-tray h3').textContent, M)));
// the reasons stand on the street, and a number card points to its place
const signs = () => p.evaluate(() => { let root = null; window.__eco.app.stage.scene.traverse((o) => { if (o.name === 'roads-street' && o.position.z < -2000) root = o; }); let s = 0; root?.traverseVisible((o) => { if (o.isSprite) s++; }); return s; });
checks.signsOnStreet = await signs(); must('reasonsOnStreet', checks.signsOnStreet >= 5, checks.signsOnStreet);
await click(M + '[data-num="walk"]'); await p.waitForTimeout(600);
checks.whereWalk = await p.evaluate((m) => document.querySelector(m + '.rd-hint').textContent, M);
must('cardPointsToPlace', /furthest from a car/.test(checks.whereWalk) && await p.evaluate((m) => document.querySelector(m + '[data-num="walk"]').getAttribute('aria-pressed') === 'true', M), checks.whereWalk);
await shot('numbers-where'); await layout('numbers-where');
await click(M + '[data-num="safe"]'); await p.waitForTimeout(400); must('safeCardExplainsFlags', /green flag/i.test(await p.evaluate((m) => document.querySelector(m + '.rd-hint').textContent, M)));
await p.focus(M + '[data-act="change"]'); await enter();
await p.waitForSelector(M + '[data-slot="0"]', { timeout: LONG }); await focusOk('design-again');

// ---- a better design: Clear the street, then taps on the street, the helper strip and the keyboard
await click(M + '[data-act="clear"]'); must('clearTheStreet', !(await slotHas(3)) && await p.isDisabled(M + '[data-act="run"]'));
const put = async (kind, slot) => { await click(M + `[data-kind="${kind}"]`); await click(M + `[data-slot="${slot}"]`); };
await p.waitForTimeout(800);
await click(M + '[data-kind="drop"]'); for (const s of [2, 7]) { const t = await tapStreet(s); must(`streetTap${s}`, t.ok && await slotHas(s), t.at); }
await put('bay', 1); await put('bay', 3); await put('walk', 0); await put('walk', 8); await put(junior ? 'walk' : 'cycle', 6);
await p.focus(M + '[data-slot="3"]'); await p.keyboard.press('2'); await p.focus(M + '[data-slot="3"]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); // a bay at place 5 by the keys
must('keyboardPlaces', await slotHas(4));
if (!junior) { await put('bay', 9); for (let i = 0; i < 2; i++) await click(M + '[data-fleet="-1"]'); checks.fleet = await p.evaluate((m) => document.querySelector(m + '[data-fleetn]').textContent, M); must('fleetChoice', /^\d+ shared cars$/.test(checks.fleet), checks.fleet); }
await shot('design-better'); await layout('design-better');
const second = await runMorning('second'); checks.secondRun = second;
must('numbersChanged', JSON.stringify(first) !== JSON.stringify(second));
must('lastRunShown', await p.evaluate((m) => !!document.querySelector(m + '.rd-num i'), M));
await shot('numbers-better'); await layout('numbers-better');
await p.focus(M + '[data-act="keep"]'); await enter();

// ---- the freed land: the plots are in view above the panel, with A, B and C on signs
await p.waitForSelector(M + '[data-use]', { timeout: LONG }); await focusOk('land');
must('buildNeedsAll', await p.isDisabled(M + '[data-act="build"]'));
await p.waitForTimeout(motion ? 2500 : 600);
const plotsSeen = async () => { const tray = await p.evaluate((m) => document.querySelector(m + '.rd-tray').getBoundingClientRect().top, M); const top = await p.evaluate((m) => document.querySelector(m + '.rd-top').getBoundingClientRect().bottom, M); const pts = []; for (const s of [1, 2, 3]) for (const z of [6, 13.2]) pts.push(await project(s * 4 + 2, 0.2, z)); return { tray: Math.round(tray), top: Math.round(top), ys: pts.map((q) => Math.round(q.y)), ok: pts.every((q) => !q.inPanel && q.y < tray && q.y > top && q.x > 0 && q.x < +W) }; };
{ const s = await plotsSeen(); must('plotsVisibleAboveTray', s.ok, s); }
must('plotLetters', (await signs()) >= 3 && await p.evaluate((m) => [...document.querySelectorAll(m + '.rd-letter')].map((e) => e.textContent).join('') === 'ABC', M));
await click(M + '[data-plot="0"][data-use="homes"]'); await click(M + '[data-plot="1"][data-use="park"]'); await click(M + '[data-plot="2"][data-use="garden"]');
checks.landSummary = await p.evaluate((m) => [...document.querySelectorAll(m + '.rd-sum li')].map((e) => e.textContent), M);
must('landEffectShown', checks.landSummary.some((l) => /more families/.test(l)), checks.landSummary);
await shot('land'); const lland = await layout('land'); { const s = await plotsSeen(); must('plotsVisibleAfterChoice', s.ok, s); }
checks.landTray = lland.trayH;
await p.focus(M + '[data-act="build"]'); await enter();
await p.waitForSelector(M + '[data-act="rerun"]', { timeout: LONG }); await focusOk('built');
must('rerunOffered', /new homes/.test(await p.evaluate((m) => document.querySelector(m + '[data-act="rerun"]').textContent, M)));
await shot('land-built'); await layout('land-built');
// the consequence: the morning again, with the new families
await click(M + '[data-act="rerun"]');
if (motion) { await click(M + '[data-act="skip"]'); } else { for (let i = 0; i < 4; i++) { await p.waitForSelector(`${M}.rd-cap, ${M}.rd-nums`, { timeout: LONG }); if (await p.$(M + '.rd-nums')) break; await click(M + '[data-act="next"]'); await p.waitForTimeout(300); } }
await p.waitForSelector(M + '.rd-nums', { timeout: LONG });
checks.rerunHead = await p.evaluate((m) => document.querySelector(m + '.rd-tray h3').textContent, M); must('rerunCountsNewHomes', /new homes/.test(checks.rerunHead), checks.rerunHead);
await shot('numbers-new-homes'); await layout('numbers-new-homes');
await p.focus(M + '[data-act="keep"]'); await enter();

// ---- the ride
let lastCaption = '';
if (motion) {
  await p.waitForSelector(M + '[data-act="end"]', { timeout: LONG }); await focusOk('ride');
  // every caption must stay up long enough to read
  const seen = []; let prev = null; const t0 = Date.now(); let shots = 0;
  while (!(await p.$(M + '[data-act="next"]')) && Date.now() - t0 < 180000) { const t = await topText(); if (t !== prev) { seen.push({ t, at: Date.now() }); prev = t; if (shots < 3 && seen.length > 1) { shots++; await shot(`ride-${shots}`, 700); } } await p.waitForTimeout(120); }
  const holds = seen.slice(1).map((s, i) => (s.at - seen[i].at) / 1000); checks.rideCaptions = seen.length; checks.rideHolds = holds.map((h) => +h.toFixed(1));
  must('captionsHold', seen.length >= 5 && holds.every((h) => h >= 2.4), checks.rideHolds);
  await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); await focusOk('ride-end'); lastCaption = await topText(); await shot('ride-end'); await layout('ride-end'); await p.click(M + '[data-act="next"]');
} else {
  let views = 0;
  for (let i = 0; i < 16; i++) { await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); views++; if (i === 0) await focusOk('ride'); if (i === 1 || i === 4) { await shot(`ride-${i}`); await layout(`ride-${i}`); } lastCaption = await topText(); const last = await p.evaluate((m) => /Finish/.test(document.querySelector(m + '[data-act="next"]').textContent), M); if (last) { await p.click(M + '[data-act="next"]'); break; } await enter(); if (i > 0) await focusOk(`ride-view${i + 1}`); }
  checks.rideViews = views; must('rideNotCapped', views >= 8, views);
}
checks.lastCaption = lastCaption; must('rideEndsOnClosingLine', /^That is (your|the) street/.test(lastCaption) && /crossing places are safe/.test(lastCaption), lastCaption);
must('praiseFitsResult', /Well planned|Every number reads Good/.test(lastCaption) === checks.secondRun.every((r) => r[2] === 'Good') || /Every number/.test(lastCaption) === false, lastCaption);

// ---- the record card, then back in the town
await p.waitForSelector('#modal:not(.hide) [data-act="ok"]', { timeout: LONG });
checks.cardText = await p.evaluate(() => document.querySelector('#modal').innerText.replace(/\s+/g, ' ').slice(0, 700));
await shot('record');
await p.click('#modal [data-act="ok"]');
await p.waitForFunction(() => window.__roads !== undefined, null, { timeout: LONG });
const result = await p.evaluate(() => window.__roads);
must('finished', result?.finished === true); checks.title = result?.record?.made?.title; checks.lines = result?.record?.made?.lines; checks.practised = result?.record?.practised;
must('practised', checks.practised?.length >= 3 && checks.practised.every((l) => !/\byou\b|\byour\b/i.test(l)), checks.practised);
must('recordHasNewHomes', /with 4 new families/.test(checks.lines?.[1] || '') && /before: 0 of 3/.test(checks.lines?.[3] || ''), checks.lines);
must('picture', /^<svg/.test(result?.record?.made?.picture || '')); checks.town = result?.town;
await p.waitForTimeout(1500);
const town = () => p.evaluate(() => {
  const { app } = window.__eco; const found = []; app.stage.scene.traverse((o) => { if (o.name === 'roads-street') found.push(o); });
  const m = found.find((o) => o.position.z > -2000); const car = m?.getObjectByName('roads-car'); const kept = app.G.modules?.roads; const cam = app.stage.camera; cam.updateMatrixWorld();
  let px = null; if (m) { const V = cam.position.constructor; const r = app.stage.renderer.domElement.getBoundingClientRect(); const half = (m.userData.length || 0) / 2; const dir = Math.abs(m.rotation.y) > 0.1 ? [0, 1] : [1, 0]; const a = new V(m.position.x - dir[0] * half, m.position.y, m.position.z - dir[1] * half).project(cam), c = new V(m.position.x + dir[0] * half, m.position.y, m.position.z + dir[1] * half).project(cam); px = Math.round(Math.hypot(((a.x - c.x) / 2) * r.width, ((a.y - c.y) / 2) * r.height)); }
  return { moduleGone: !document.querySelector('#module'), setRemoved: !found.some((f) => f.position.z < -2000), models: found.filter((f) => f.position.z > -2000).length, tiles: m?.userData.tiles, length: m?.userData.length, scale: m ? +m.scale.x.toFixed(2) : null, visible: !!m?.visible, carX: car ? +car.position.x.toFixed(3) : null, pxOnScreen: px, view: JSON.stringify(cam.view), saved: { done: kept?.done, record: !!kept?.record, town: kept?.town?.kind, runs: kept?.state?.runs, stage: kept?.state?.stage } };
});
const t1 = await town(); await p.waitForTimeout(1600); const t2 = await town(); Object.assign(checks, { townModel: t1 });
must('moduleGone', t1.moduleGone && t1.setRemoved);
must('gameViewPutBack', t1.view === viewBefore, [viewBefore, t1.view]);
must('townModelOnce', t1.models === 1 && t1.visible);
must('townAtTileScale', t1.tiles >= 2 && t1.length >= 11 && t1.scale >= 0.66, { tiles: t1.tiles, length: t1.length, scale: t1.scale });   // two or three tiles of 6 units, not a toy on one tile
must('townSeenFromIslandView', t1.pxOnScreen >= 50, t1.pxOnScreen);
must(motion ? 'townCarMoves' : 'townCarStill', motion ? t1.carX !== t2.carX : t1.carX === t2.carX, [t1.carX, t2.carX]);
must('saved', t1.saved.done === true && t1.saved.record && t1.saved.town === 'roads-street' && t1.saved.runs >= 3, t1.saved);
await shot('town');                                                          // the usual island view, as the child comes back to it
await p.evaluate(() => { const { app } = window.__eco; let o = null; app.stage.scene.traverse((x) => { if (x.name === 'roads-street' && x.position.z > -2000) o = x; }); if (o && app.rig?.frameBox) { try { const V = o.position.constructor; app.rig.frameBox([new V(o.position.x - 10, o.position.y, o.position.z - 8), new V(o.position.x + 10, o.position.y, o.position.z + 8)], { dur: 0.01 }); } catch { /* the wide view will do */ } } });
await shot('town-close', 1500);
must('noOutsideRequests', outside.length === 0, outside.slice(0, 5));
must('noErrors', errors.length === 0, errors.slice(0, 5));
checks.said = await p.evaluate(() => (window.__sayLog || []).length);

const ok = fails.length === 0;
console.log(JSON.stringify({ band, motion, large, built, size: `${W}x${H}`, ok, fails, checks }, null, 2));
await b.close();
process.exit(ok ? 0 : 1);
