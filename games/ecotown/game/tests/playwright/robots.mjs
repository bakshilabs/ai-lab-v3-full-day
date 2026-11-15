// Browser run for the "robots" module (Robot training): starts a town, opens the module and plays it from start to
// finish: first examples, the first test, why it missed, more examples, the second test, then the robot in the street.
// Usage: node tests/playwright/robots.mjs [baseUrl] [outDir]      (serve games/ecotown/game first, e.g. on port 8862)
//   BAND=senior   ages 13–17 (default junior).    MOTION=1  leave reduced motion off (default: low graphics, reduced motion).
//   W=1024 H=768  the window size (default 1280 × 800).
//   TOWN=small (default: four tiles of town land) | empty (nothing built) | built (Florence's practice town, every mission's plan built)
//   TEXT=large    the game's Large text setting.    TOUCH=1  a touch screen (taps, and a finger scroll of the shelf).
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8862/', out = 'shots-robots'] = process.argv.slice(2);
const band = process.env.BAND === 'senior' ? 'senior' : 'junior'; const motion = !!process.env.MOTION; const W = +(process.env.W || 1280); const H = +(process.env.H || 800);
const town = process.env.EMPTY ? 'empty' : (process.env.TOWN || 'small'); const large = process.env.TEXT === 'large'; const touch = !!process.env.TOUCH;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const cx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch });
const p = await cx.newPage(); p.setDefaultTimeout(240000);
await p.addInitScript((pr) => { window.__sayLog = []; localStorage.setItem('ecotown.prefs', JSON.stringify(pr)); }, { quality: 'low', reduce: !motion, ...(large ? { text: 'large' } : {}) });
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
const checks = {}; const notes = {}; let n = 0; const tag = `${band}${motion ? '-motion' : ''}${large ? '-large' : ''}-${town}-${W}x${H}`;
const shot = async (name, wait = 400) => { await p.waitForTimeout(wait); const f = `${out}/${tag}-${String(++n).padStart(2, '0')}-${name}.png`; await p.screenshot({ path: f }); return f; };
const tap = async (sel, t = 240000) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); if (touch) await p.tap(sel); else await p.click(sel); };
const stage = () => p.evaluate(() => document.querySelector('#module .rb')?.dataset.stage || null);
const line = () => p.evaluate(() => document.querySelector('#module .rb-say p')?.textContent || '');
const and = (k, v) => { checks[k] = checks[k] === undefined ? !!v : checks[k] && !!v; };
// nothing in the module's layer is off the screen, cut off or overlapping, at this step
async function layout(where) {
  const bad = await p.evaluate(() => {
    const bad = []; const Wd = innerWidth; const Hd = innerHeight; const rb = document.querySelector('#module .rb'); if (!rb) return bad;
    const back = document.querySelector('#module .modback')?.getBoundingClientRect(); const steps = rb.querySelector('.rb-steps')?.getBoundingClientRect();
    if (back && steps && !(steps.left >= back.right || steps.top >= back.bottom || steps.bottom <= back.top || steps.right <= back.left)) bad.push('the step bar overlaps the Back button');
    for (const e of rb.querySelectorAll('button, .rb-say, .rb-steps, .rb-cap, .rb-hint')) { const r = e.getBoundingClientRect(); if (!r.width || e.closest('.rb-items') || e.closest('.rb-main')?.scrollHeight > e.closest('.rb-main')?.clientHeight + 2) continue; if (r.right > Wd + 1 || r.bottom > Hd + 1 || r.left < -1 || r.top < -1) bad.push(`off the screen: ${e.className}`); }
    for (const e of rb.querySelectorAll('.rb-foot button, .rb-bin, .rb-item, .rb-feat, .rb-spk')) { const r = e.getBoundingClientRect(); if (r.width && (r.height < 44 || r.width < 44)) bad.push(`small target: ${e.className} ${Math.round(r.width)}x${Math.round(r.height)}`); }
    const foot = rb.querySelector('.rb-foot')?.getBoundingClientRect(); const main = rb.querySelector('.rb-main')?.getBoundingClientRect(); if (foot && main && main.bottom > foot.top + 1 && rb.dataset.stage !== 'street') bad.push('the page runs under the footer');
    return [...new Set(bad)];
  });
  and('layoutClean', bad.length === 0); if (bad.length) notes[`layout:${where}`] = bad;
}
// is a point of the 3D scene on the screen and in view (nothing of the town in front of it)? name: an object in the robot's scene
const seen = (name, up = 1) => p.evaluate(async ([nm, dy]) => {
  const THREE = await import('three'); const { stage: st } = window.__eco.app; const o = st.scene.getObjectByName(nm); if (!o) return null;
  st.scene.updateMatrixWorld(true); const at = o.getWorldPosition(new THREE.Vector3()); at.y += dy * (o.scale?.y || 1); const cam = st.camera; cam.updateMatrixWorld(true);
  const s = at.clone().project(cam); const x = (s.x + 1) / 2 * innerWidth; const y = (1 - s.y) / 2 * innerHeight;
  const dir = at.clone().sub(cam.position); const dist = dir.length(); const ray = new THREE.Raycaster(cam.position.clone(), dir.normalize(), 0.1, dist - 0.4);
  const mine = (m) => { for (let q = m; q; q = q.parent) if (q.name === 'robots-scene') return true; return false; };
  const hits = ray.intersectObjects(st.scene.children, true).filter((h) => h.object.visible && h.object.isMesh && !mine(h.object) && (() => { for (let q = h.object; q; q = q.parent) if (!q.visible) return false; return true; })());
  const root = st.scene.getObjectByName('robots-scene'); const box = new THREE.Box3().setFromObject(root); const ys = []; const xs = [];
  for (const cxx of [box.min.x, box.max.x]) for (const cy of [box.min.y, box.max.y]) for (const cz of [box.min.z, box.max.z]) { const q = new THREE.Vector3(cxx, cy, cz).project(cam); xs.push((q.x + 1) / 2 * innerWidth); ys.push((1 - q.y) / 2 * innerHeight); }
  return { x: Math.round(x), y: Math.round(y), onScreen: s.z < 1 && x > 20 && x < innerWidth - 20 && y > 20 && y < innerHeight - 20, blocked: hits.length, w: Math.round(Math.max(...xs) - Math.min(...xs)), h: Math.round(Math.max(...ys) - Math.min(...ys)) };
}, [name, up]);
// how many different colours are in the middle of the screen (a solid wall in front of the camera gives one or two)
async function colours() {
  const png = (await p.screenshot({ clip: { x: W * 0.25, y: H * 0.25, width: W * 0.5, height: H * 0.4 } })).toString('base64');
  return p.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data; const set = new Set(); const hues = new Set(); for (let i = 0; i < d.length; i += 4 * 97) { set.add((d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4)); const mx = Math.max(d[i], d[i + 1], d[i + 2]); const mn = Math.min(d[i], d[i + 1], d[i + 2]); if (mx - mn > 40) hues.add(d[i] === mx ? (d[i + 1] > d[i + 2] ? 'ry' : 'rm') : d[i + 1] === mx ? 'g' : 'b'); }
    return { colours: set.size, hues: hues.size }; }, png);
}

// ---------- into a town
await p.goto(base + 'index.html');
await tap(`[data-band="${band}"]`);
await p.waitForSelector('[data-name]'); await p.fill('[data-name]', 'Otter Bend'); await tap('[data-go]');
await p.waitForTimeout(800);
const sk = await p.waitForSelector('[data-introskip]', { timeout: 300000 }).catch(() => null); if (sk) await sk.click().catch(() => {});
await p.waitForSelector('#build [data-cat="land"]', { timeout: 300000 });
if (town === 'small') { // a little town land, so the robot has a street to work in
  await p.evaluate(() => { const { G } = window.__eco.app; const ks = [...window.__eco.terrain.tiles.values()].filter((t) => t.zone === 'slope' && !t.fixed).slice(0, 4).map((t) => t.k); for (const k of ks) G.placeAt(k, 'town'); });
} else if (town === 'built') { // Florence's practice town with every mission's plan built: homes, paths, farms, power, the school
  notes.built = await p.evaluate(async () => {
    const { seedTo, CLEAR } = await import('./js/game/seed.js'); const { plan, applyPlacements } = await import('./js/sim/planner.js');
    const terrain = window.__eco.terrain; let cells = seedTo(terrain, 'heart'); cells = applyPlacements(cells, plan('heart', CLEAR.heart, { terrain, cells, numbers: { minutes: 10 } }).placements);
    const { G } = window.__eco.app; let ok = 0;
    for (const [k, c] of cells) if (c.mark === 'town') G.placeAt(k, 'town', { free: true });
    for (const [k, c] of cells) { if (c.mark && c.mark !== 'town') G.placeAt(k, c.mark, { free: true }); if (c.item && G.placeAt(k, c.item, { free: true, replace: true })) ok++; }
    window.__eco.app.world.finishBuilds?.();
    return { placed: ok, builds: [...G.cells].filter(([, c]) => c.item).length };
  });
  checks.practiceTownBuilt = notes.built.builds > 30;
}
await p.waitForTimeout(2000);
const sceneBefore = await p.evaluate(() => window.__eco.app.stage.scene.children.length);
if (process.env.SHOT_TOWN) await shot('town-before');

// ---------- open the module
// the game opens a module only when its menu could open (no card or film in the way): try again until it does
for (let tries = 0; tries < 8; tries++) {
  await p.evaluate(() => { window.__robots = 'open'; window.__eco.openModule('robots').then((r) => { window.__robots = r; }, (e) => { window.__robots = { error: String(e) }; }); });
  await p.waitForFunction(() => document.querySelector('#module[data-module="robots"] .rb[data-stage="teach"]') || window.__robots !== 'open', null, { timeout: 300000 });
  if (await p.locator('#module[data-module="robots"] .rb[data-stage="teach"]').count()) break;
  notes.openRetries = tries + 1; await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(3000);
}
await p.waitForSelector('#module[data-module="robots"] .rb[data-stage="teach"]', { timeout: 60000 });
checks.oneWayBack = (await p.locator('#module .modback').count()) === 1;
checks.spokenFirstLine = await p.evaluate(() => window.__sayLog.some((s) => /only knows what you show it|learns only from examples/.test(s.text)));
const bins = await p.evaluate(() => [...document.querySelectorAll('#module .rb-bin')].map((x) => x.dataset.bin));
checks.bins = bins.length === (band === 'junior' ? 3 : 4);
checks.testLockedAtStart = await p.isDisabled('#module [data-go]');
checks.workshopDrawn = await p.evaluate(() => { const s = document.querySelector('#module .rb-bg svg'); return !!s && s.getBoundingClientRect().height > 200; });
await layout('bench-start'); await shot('bench-start');

// one thing in a bin that is not its own: Florence says where it goes, and nothing is added
const items = await p.evaluate(() => [...document.querySelectorAll('#module .rb-item')].map((x) => [x.dataset.kind, x.dataset.truth]));
await tap(`#module .rb-item[data-kind="${items[0][0]}"]`); await tap(`#module .rb-bin[data-bin="${bins.find((x) => x !== items[0][1])}"]`);
checks.otherBinExplained = /goes in/.test(await line()) && (await p.locator('#module .rb-item').count()) === items.length;
// a second tap on the thing already chosen keeps it chosen, and the bin still takes it
await tap(`#module .rb-item[data-kind="${items[0][0]}"]`); await tap(`#module .rb-item[data-kind="${items[0][0]}"]`);
checks.retapKeepsChosen = (await p.locator(`#module .rb-item.picked[data-kind="${items[0][0]}"]`).count()) === 1;
await p.keyboard.press('Escape').catch(() => {});
// the first by keyboard: focus the thing, press its bin's number
await p.focus(`#module .rb-item[data-kind="${items[0][0]}"]`); await p.keyboard.press(String(bins.indexOf(items[0][1]) + 1));
checks.keyboardPlaces = (await p.locator('#module .rb-item').count()) === items.length - 1;
// one by dragging (a mouse; by touch the same drag is a sideways move)
{ const [id, truth] = items[1]; const a = await p.locator(`#module .rb-item[data-kind="${id}"]`).boundingBox(); const z = await p.locator(`#module .rb-bin[data-bin="${truth}"]`).boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down(); await p.mouse.move(a.x + a.width / 2 + 30, a.y + 20, { steps: 4 }); await p.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 8 }); await p.mouse.up();
  checks.dragPlaces = (await p.locator('#module .rb-item').count()) === items.length - 2; }
// the rest by tapping: all but the last thing, so that the robot starts with gaps a child might leave
for (const [id, truth] of items.slice(2, -1)) { if (!(await p.locator(`#module .rb-item[data-kind="${id}"]`).count())) continue; await tap(`#module .rb-item[data-kind="${id}"]`); await tap(`#module .rb-bin[data-bin="${truth}"]`); }
if (await p.isDisabled('#module [data-go]')) { const [id, truth] = items[items.length - 1]; await tap(`#module .rb-item[data-kind="${id}"]`); await tap(`#module .rb-bin[data-bin="${truth}"]`); }
checks.undoWorks = await (async () => { const before = await p.locator('#module .rb-in span').count(); await tap('#module [data-undo]'); const mid = await p.locator('#module .rb-in span').count(); const it = await p.evaluate(() => { const x = document.querySelector('#module .rb-item'); return [x.dataset.kind, x.dataset.truth]; }); await tap(`#module .rb-item[data-kind="${it[0]}"]`); await tap(`#module .rb-bin[data-bin="${it[1]}"]`); return mid === before - 1; })();
if (await p.isDisabled('#module [data-go]')) for (const [id, truth] of await p.evaluate(() => [...document.querySelectorAll('#module .rb-item')].map((x) => [x.dataset.kind, x.dataset.truth]))) { await tap(`#module .rb-item[data-kind="${id}"]`); await tap(`#module .rb-bin[data-bin="${truth}"]`); }
checks.savedWhileTeaching = await p.evaluate(() => window.__eco.app.G.modules?.robots?.state?.rounds?.[0]?.length > 0);
await layout('bench-examples'); await shot('bench-examples');
await tap('#module [data-go]:not([disabled])');

// ---------- the tests. No thing on the tray has ever been shown as an example.
const shownNow = () => p.evaluate(() => (window.__eco.app.G.modules?.robots?.state?.rounds || []).flat());
const trayNow = () => p.evaluate(() => [...document.querySelectorAll('#module .rb-tray li')].map((x) => x.dataset.kind));
async function trayUnseen() { const [tray, shown] = [await trayNow(), await shownNow()]; and('noTrayItemIsAShownExample', tray.length > 0 && shown.length > 0 && !tray.some((id) => shown.includes(id))); return tray; }
await p.waitForSelector('#module .rb[data-stage="test"]'); const tray1 = await trayUnseen();
// hammering the button does not run the whole test unseen
let hammered = 0;
{ const marks = await p.evaluate(() => { for (let i = 0; i < 12; i++) document.querySelector('#module [data-go]').click(); return document.querySelectorAll('#module .rb-mark').length; }); hammered = await p.locator('#module .rb-mark').count(); checks.hammerGuard = marks <= 1 && (await stage()) === 'test'; }
async function firstTest() {
  let steps = 0; let shown = false;
  while ((await stage()) === 'test' && steps++ < 40) {
    await p.waitForTimeout(340); await p.click('#module [data-go]'); await p.waitForTimeout(motion ? 400 : 60);
    if (!shown && (await stage()) === 'test' && (await p.locator('#module .rb-mark.miss, #module .rb-mark.ask').count())) { shown = true; await layout('test-1'); await shot('test-1', motion ? 1300 : 300); }
  }
  return steps;
}
checks.test1Steps = (await firstTest()) + hammered >= tray1.length;
await p.waitForSelector('#module .rb[data-stage="review"]');
const first = await p.evaluate(() => ({ right: +document.querySelector('#module .rb-score > b').textContent, misses: document.querySelectorAll('#module .rb-misses li').length, why: [...document.querySelectorAll('#module .rb-why')].map((x) => x.textContent.replace(/^★\s*/, '').trim()) }));
checks.firstTestHasGaps = first.misses > 0 && first.why.every((l) => /^(It has not been shown anything for|Nothing it was shown for|For .*, the closest thing it was shown is)/.test(l));
checks.reasonSpoken = await p.evaluate((w) => window.__sayLog.some((s) => s.text.includes(w)), first.why[0]);
checks.noLackedWord = !(await p.evaluate(() => /lack/i.test(document.querySelector('#module').textContent)));
if (band === 'senior') checks.seniorTable = (await p.locator('#module .rb-conf tbody tr').count()) === 4;
await layout('review'); await shot('review');
await tap('#module [data-act="more"]');

// ---------- fill the gaps: the starred things are relatives of the missed ones, never the tray things themselves
await p.waitForSelector('#module .rb[data-stage="teach"]');
const shelf2 = await p.evaluate(() => [...document.querySelectorAll('#module .rb-item')].map((x) => ({ id: x.dataset.kind, truth: x.dataset.truth, star: x.classList.contains('starred') })));
const starred = shelf2.filter((x) => x.star);
checks.gapsAreStarred = starred.length > 0;
checks.shelfHoldsNoTrayThing = !shelf2.some((x) => tray1.includes(x.id));
checks.starredComeFirst = shelf2.slice(0, starred.length).every((x) => x.star);
// every starred thing is on the screen without scrolling (the reviewer's 1024 × 768 screen cut them off below the footer)
checks.starredOnScreen = await p.evaluate(() => { const box = document.querySelector('#module .rb-items').getBoundingClientRect(); const foot = document.querySelector('#module .rb-foot').getBoundingClientRect();
  return [...document.querySelectorAll('#module .rb-item.starred')].every((x) => { const r = x.getBoundingClientRect(); return r.top >= box.top - 1 && r.bottom <= Math.min(box.bottom, foot.top, innerHeight) + 1 && r.left >= 0 && r.right <= innerWidth; }); });
notes.shelf = await p.evaluate(() => { const it = document.querySelector('#module .rb-items'); return { scrolls: it.scrollHeight > it.clientHeight + 2, cue: !document.querySelector('#module .rb-more').hidden, touchAction: getComputedStyle(document.querySelector('#module .rb-item')).touchAction }; });
checks.moreBelowCue = notes.shelf.scrolls === notes.shelf.cue; checks.shelfCanBeFingerScrolled = notes.shelf.touchAction === 'pan-y';
await layout('bench-more'); await shot('bench-more-start');
for (const { id, truth } of starred) { if (!(await p.locator(`#module .rb-item.starred[data-kind="${id}"]`).count())) continue; if (await p.evaluate(() => /Room for 0 more/.test(document.querySelector('#module .rb-shelf h3')?.textContent || ''))) break; await tap(`#module .rb-item[data-kind="${id}"]`); await tap(`#module .rb-bin[data-bin="${truth}"]`); }
await shot('bench-more');
await tap('#module [data-go]:not([disabled])');

// ---------- the second test: the same tray, still unseen. It runs by itself and stops only where something changed.
await p.waitForSelector('#module .rb[data-stage="test"]'); const tray2 = await trayUnseen();
checks.sameTray = tray2.join() === tray1.join();
{ let presses = 0; let shown = false; const t0 = Date.now();
  while ((await stage()) === 'test' && presses < 30) {
    await p.waitForFunction(() => { const g = document.querySelector('#module [data-go]'); return !g || g.getAttribute('aria-disabled') !== 'true' || document.querySelector('#module .rb')?.dataset.stage !== 'test'; }, null, { timeout: 60000 });
    if ((await stage()) !== 'test') break;
    if (!shown && (await p.locator('#module .rb-tray em').count())) { shown = true; await layout('test-2'); await shot('test-2', motion ? 1300 : 300); }
    await p.waitForTimeout(340); await p.click('#module [data-go]'); presses++; await p.waitForTimeout(80);
  }
  notes.test2 = { presses, seconds: Math.round((Date.now() - t0) / 100) / 10 }; checks.secondTestIsQuick = presses <= 3 + (await p.evaluate(() => 0)) + 6 && presses < tray1.length; }
await p.waitForSelector('#module .rb[data-stage="result"]');
checks.chartShown = (await p.locator('#module .rb-chart svg').count()) === 1;
checks.chartDoesNotFillTheScreen = await p.evaluate(() => document.querySelector('#module .rb-chart').getBoundingClientRect().height < innerHeight * 0.45);
await layout('result'); await shot('result');
if (band === 'senior') { // the new idea for ages 13–17: switch off something the robot looks at, and see the score move
  const before = await p.evaluate(() => document.querySelector('#module .rb-tuneline').textContent);
  await tap('#module .rb-feat[data-feat="feel"]'); const offLine = await p.evaluate(() => document.querySelector('#module .rb-tuneline').textContent);
  checks.seniorSwitchOff = /^With feel switched off: \d+ of \d+/.test(offLine) && offLine !== before && (await p.locator('#module .rb-feat[aria-pressed="false"]').count()) === 1;
  checks.seniorSwitchSpoken = await p.evaluate((l) => window.__sayLog.some((s) => s.text === l), offLine);
  checks.seniorTableOnResult = (await p.locator('#module .rb-conf tbody tr').count()) === 4;
  await layout('tune'); await shot('senior-tune');
  await tap('#module .rb-feat[data-feat="feel"]'); await tap('#module .rb-feat[data-feat="colour"]'); notes.colourOff = await p.evaluate(() => document.querySelector('#module .rb-tuneline').textContent);
  checks.seniorChoiceSaved = await p.evaluate(() => JSON.stringify(window.__eco.app.G.modules?.robots?.state?.off) === '["colour"]');
  await shot('senior-tune-colour');
}
await tap('#module [data-act="street"]');

// ---------- the street: the robot sorts new things in the town, in plain view
await p.waitForSelector('#module .rb[data-stage="street"]'); await p.waitForTimeout(2500);
// a close view: the camera stands within about two tiles of the robot (a tile is 6 units), not up in the sky
checks.cameraIsClose = await p.evaluate(async () => { const THREE = await import('three'); const { stage: st } = window.__eco.app; const r = st.scene.getObjectByName('robots-robot'); if (!r) return false; const at = r.getWorldPosition(new THREE.Vector3()); return st.camera.position.distanceTo(at) < 13 && st.camera.position.y > at.y + 2 && st.camera.fov > 30; });
{ const r = await seen('robots-robot', 1.0); const c = await colours(); notes.street = { robot: r, ...c };
  checks.streetRobotOnScreen = !!r && r.onScreen; checks.streetRobotNotHidden = !!r && r.blocked === 0; checks.streetNotOneFlatColour = c.colours >= 12 && c.hues >= 2; }
await layout('street'); await shot('street-start');
// every caption the street shows is logged by the page itself, so none is missed between two presses
await p.evaluate(() => { window.__caps = []; const foot = document.querySelector('#module .rb-foot'); const log = () => { const t = foot.querySelector('.rb-cap p')?.textContent || ''; if (/^[✓✗?]/.test(t) && !window.__caps.includes(t)) window.__caps.push(t); }; new MutationObserver(log).observe(foot, { childList: true, subtree: true, characterData: true }); log(); });
const streetThings = [];
let presses = 0; let streetShot = false; let skipped = null;
while ((await p.locator('#module').count()) && presses++ < 30) {
  const go = p.locator('#module .rb-cap [data-go]'); await go.waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
  if (!(await p.locator('#module').count())) break;
  await p.waitForTimeout(340); await go.click().catch(() => {}); await p.waitForTimeout(200);
  const moving = await p.evaluate(() => document.querySelector('#module .rb')?.dataset.moving === '1');
  for (const t of await p.evaluate(() => window.__caps || [])) if (!streetThings.includes(t)) streetThings.push(t);
  if (motion && moving && skipped === null) { // a second press finishes the robot's move at once
    await p.waitForTimeout(400); // pressed straight from the page, so a slow 3D frame cannot hold up the click itself
    const t0 = Date.now(); const still = await p.evaluate(() => { document.querySelector('#module .rb-cap [data-go]').click(); return document.querySelector('#module .rb')?.dataset.moving === '1'; }); skipped = still ? null : Date.now() - t0; if (still) await p.waitForFunction(() => document.querySelector('#module .rb')?.dataset.moving !== '1', null, { timeout: 30000 }).catch(() => {}); }
  else if (moving) await p.waitForFunction(() => document.querySelector('#module .rb')?.dataset.moving !== '1', null, { timeout: 30000 }).catch(() => {});
  if (presses === 3 && !streetShot) { streetShot = true; await shot('street', 500); }
}
for (const t of await p.evaluate(() => window.__caps || [])) if (!streetThings.includes(t)) streetThings.push(t);
if (motion) { notes.skipMs = skipped; checks.secondPressFinishesMove = skipped !== null && skipped < 1500; }

// ---------- the record card, and what was kept
await p.waitForSelector('#modal:not(.hide) .practised', { timeout: 60000 });
checks.recordCard = await p.evaluate(() => /You practised/.test(document.querySelector('#modal').textContent) && /teaching a robot by showing it \d+ examples/.test(document.querySelector('#modal').textContent));
await shot('record');
await tap('#modal:not(.hide) [data-act="ok"]');
await p.waitForFunction(() => window.__robots && window.__robots !== 'open', null, { timeout: 60000 });
const result = await p.evaluate(() => window.__robots);
checks.finished = result?.finished === true;
checks.record = !!result?.record && result.record.made.lines.length >= 5 && result.record.practised.length === 4 && /^<svg/.test(result.record.made.picture || '');
checks.recordSaysUnseenAndNew = !!result?.record && /unseen things/.test(result.record.made.lines.join(' ')) && /new things/.test(result.record.made.lines.join(' ')) && !/kept apart|lack/.test(JSON.stringify(result.record));
checks.town = result?.town?.kind === 'recycling-robot' && typeof result.town.data.key === 'string';
// "new" is true: nothing the robot met in the street was an example or on the tray
{ const shown = result?.town?.data?.things || []; const names = await p.evaluate(async (ids) => { const L = await import('./js/modules/robots/learn.js'); return ids.map((id) => L.kind(id).name); }, [...shown, ...tray1]);
  checks.streetThingsAreNew = streetThings.length >= 5 && !streetThings.some((t) => names.some((nm) => new RegExp(`^[✓✗?] [^.:]*\\b[Aa]n? ${nm}[.:]`).test(t))); notes.streetThings = streetThings.map((t) => t.slice(0, 60)); }
await p.waitForTimeout(2500);
const after = await p.evaluate(() => { const { G, stage: st } = window.__eco.app; const c = st.camera; return { done: G.modules?.robots?.done === true, saved: G.modules?.robots?.state, scene: st.scene.children.length, fov: c.fov, moduleGone: !document.querySelector('#module') }; });
checks.keptInSave = after.done && after.saved?.plays === 1;
checks.robotLeftInTown = after.scene === sceneBefore + 1;       // show() added one thing; the street scene itself was removed
checks.cameraPutBack = after.fov < 30 && after.moduleGone;
checks.everyStepSpoken = await p.evaluate(() => ['kept apart', 'new examples|added examples|Still \\d|lower than', 'at work in your town', 'in the right bin'].every((re) => window.__sayLog.some((s) => new RegExp(re).test(s.text))));
// what it leaves in the town is drawn, in view from the usual island view, and not tiny
{ const sign = await seen('robots-sign', 0); const bot = await seen('robots-robot', 1.0); notes.townResult = { sign, robot: bot };
  checks.townResultDrawn = !!sign && sign.onScreen; checks.townResultNotHidden = !!sign && sign.blocked === 0; checks.townResultNotTiny = !!sign && sign.h >= Math.min(60, H * 0.07) && sign.w >= 24; }
await shot('town-after');

// ---------- open it again and leave early: nothing is left behind, and the finished record stays
for (let tries = 0; tries < 8; tries++) {
  await p.evaluate(() => { window.__robots2 = 'open'; window.__eco.openModule('robots').then((r) => { window.__robots2 = r; }); });
  await p.waitForFunction(() => document.querySelector('#module[data-module="robots"] .rb[data-stage="teach"]') || window.__robots2 !== 'open', null, { timeout: 300000 });
  if (await p.locator('#module[data-module="robots"] .rb[data-stage="teach"]').count()) break;
  await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(3000);
}
await p.waitForSelector('#module[data-module="robots"] .rb[data-stage="teach"]', { timeout: 60000 });
await tap('#module .modback'); await p.waitForFunction(() => window.__robots2 !== 'open', null, { timeout: 60000 }); await p.waitForTimeout(800);
checks.leavingEarly = await p.evaluate((n0) => !document.querySelector('#module') && window.__eco.app.G.modules.robots.done === true && window.__eco.app.stage.scene.children.length === n0 + 1, sceneBefore);

checks.noErrors = errors.length === 0; checks.noOutsideRequests = outside.length === 0;
const failed = Object.entries(checks).filter(([, v]) => v === false).map(([k]) => k);
console.log(JSON.stringify({ band, motion, large, town, size: `${W}x${H}`, checks, notes, first, result: result && { finished: result.finished, made: result.record?.made && { title: result.record.made.title, lines: result.record.made.lines }, practised: result.record?.practised, town: result.town }, errors, outside, failed }, null, 2));
await b.close();
process.exit(failed.length ? 1 : 0);
