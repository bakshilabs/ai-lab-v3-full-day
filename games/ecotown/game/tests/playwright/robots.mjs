// Browser run for the "robots" module (Robot training): starts a town, opens the module and plays it from start to
// finish: first examples, the first test, what it lacked, more examples, the second test, then the robot in the street.
// Usage: node tests/playwright/robots.mjs [baseUrl] [outDir]      (serve games/ecotown/game first, e.g. on port 8812)
//   BAND=senior  ages 13–17 (default junior).   MOTION=1  leave reduced motion off (default: low graphics, reduced motion).
//   W=1024 H=768  the window size (default 1280 × 800).   EMPTY=1  do not mark any town land first.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8812/', out = 'shots-robots'] = process.argv.slice(2);
const band = process.env.BAND === 'senior' ? 'senior' : 'junior'; const motion = !!process.env.MOTION; const W = +(process.env.W || 1280); const H = +(process.env.H || 800);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H } }); p.setDefaultTimeout(120000);
await p.addInitScript((reduce) => { window.__sayLog = []; localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce })); }, !motion);
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
const checks = {}; let n = 0; const tag = `${band}${motion ? '-motion' : ''}`;
const shot = async (name) => { await p.waitForTimeout(400); const f = `${out}/${tag}-${String(++n).padStart(2, '0')}-${name}.png`; await p.screenshot({ path: f }); return f; };
const click = async (sel, t = 120000) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.click(sel); };
const stage = () => p.evaluate(() => document.querySelector('#module .rb')?.dataset.stage || null);
const line = () => p.evaluate(() => document.querySelector('#module .rb-say p')?.textContent || '');

// ---------- into a town
await p.goto(base + 'index.html');
await click(`[data-band="${band}"]`);
await click('[data-name]'); await p.fill('[data-name]', 'Otter Bend'); await click('[data-go]');
await p.waitForTimeout(800);
const sk = await p.waitForSelector('[data-introskip]', { timeout: 180000 }).catch(() => null); if (sk) await sk.click().catch(() => {});
await p.waitForSelector('#build [data-cat="land"]', { timeout: 240000 });
if (!process.env.EMPTY) { // a little town land, so the robot has a street to work in
  await p.evaluate(() => { const { G } = window.__eco.app; const ks = [...window.__eco.terrain.tiles.values()].filter((t) => t.zone === 'slope' && !t.fixed).slice(0, 4).map((t) => t.k); for (const k of ks) G.placeAt(k, 'town'); });
  await p.waitForTimeout(1500);
}
const sceneBefore = await p.evaluate(() => window.__eco.app.stage.scene.children.length);

// ---------- open the module
await p.evaluate(() => { window.__robots = 'open'; window.__eco.openModule('robots').then((r) => { window.__robots = r; }, (e) => { window.__robots = { error: String(e) }; }); });
await p.waitForSelector('#module[data-module="robots"] .rb[data-stage="teach"]', { timeout: 60000 });
checks.oneWayBack = (await p.locator('#module .modback').count()) === 1;
checks.spokenFirstLine = await p.evaluate(() => window.__sayLog.some((s) => /only knows what you show it|learns only from examples/.test(s.text)));
const bins = await p.evaluate(() => [...document.querySelectorAll('#module .rb-bin')].map((x) => x.dataset.bin));
checks.bins = bins.length === (band === 'junior' ? 3 : 4);
checks.testLockedAtStart = await p.isDisabled('#module [data-go]');
await shot('bench-start');

// one thing in a bin that is not its own: Florence says where it goes, and nothing is added
const items = await p.evaluate(() => [...document.querySelectorAll('#module .rb-item')].map((x) => [x.dataset.kind, x.dataset.truth]));
await p.click(`#module .rb-item[data-kind="${items[0][0]}"]`); await p.click(`#module .rb-bin[data-bin="${bins.find((x) => x !== items[0][1])}"]`);
checks.otherBinExplained = /goes in/.test(await line()) && (await p.locator('#module .rb-item').count()) === items.length;
// the first by keyboard: focus the thing, press its bin's number
await p.focus(`#module .rb-item[data-kind="${items[0][0]}"]`); await p.keyboard.press(String(bins.indexOf(items[0][1]) + 1));
checks.keyboardPlaces = (await p.locator('#module .rb-item').count()) === items.length - 1;
// one by dragging
{ const [id, truth] = items[1]; const a = await p.locator(`#module .rb-item[data-kind="${id}"]`).boundingBox(); const z = await p.locator(`#module .rb-bin[data-bin="${truth}"]`).boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down(); await p.mouse.move(a.x + a.width / 2 + 30, a.y + 20, { steps: 4 }); await p.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 8 }); await p.mouse.up();
  checks.dragPlaces = (await p.locator('#module .rb-item').count()) === items.length - 2; }
// the rest by tapping: all but the last thing, so that the robot starts with gaps a child might leave
for (const [id, truth] of items.slice(2, -1)) { if (!(await p.locator(`#module .rb-item[data-kind="${id}"]`).count())) continue; await p.click(`#module .rb-item[data-kind="${id}"]`); await p.click(`#module .rb-bin[data-bin="${truth}"]`); }
if (await p.isDisabled('#module [data-go]')) { const [id, truth] = items[items.length - 1]; await p.click(`#module .rb-item[data-kind="${id}"]`); await p.click(`#module .rb-bin[data-bin="${truth}"]`); }
checks.undoWorks = await (async () => { const before = await p.locator('#module .rb-in span').count(); await p.click('#module [data-undo]'); const mid = await p.locator('#module .rb-in span').count(); const it = await p.evaluate(() => { const x = document.querySelector('#module .rb-item'); return [x.dataset.kind, x.dataset.truth]; }); await p.click(`#module .rb-item[data-kind="${it[0]}"]`); await p.click(`#module .rb-bin[data-bin="${it[1]}"]`); return mid === before - 1; })();
if (await p.isDisabled('#module [data-go]')) for (const [id, truth] of await p.evaluate(() => [...document.querySelectorAll('#module .rb-item')].map((x) => [x.dataset.kind, x.dataset.truth]))) { await p.click(`#module .rb-item[data-kind="${id}"]`); await p.click(`#module .rb-bin[data-bin="${truth}"]`); }
checks.savedWhileTeaching = await p.evaluate(() => window.__eco.app.G.modules?.robots?.state?.rounds?.[0]?.length > 0);
await shot('bench-examples');
await click('#module [data-go]:not([disabled])');

// ---------- a test: step through the tray
async function runTest(name) {
  await p.waitForSelector('#module .rb[data-stage="test"]'); let steps = 0; let shown = false;
  while ((await stage()) === 'test' && steps++ < 30) {
    await p.click('#module [data-go]'); await p.waitForTimeout(motion ? 500 : 80);
    if (!shown && (await stage()) === 'test' && (await p.locator('#module .rb-mark.miss, #module .rb-mark.ask').count())) { shown = true; await p.waitForTimeout(motion ? 900 : 0); await shot(name); }
  }
  return steps;
}
checks.test1Steps = await runTest('test-1');
await p.waitForSelector('#module .rb[data-stage="review"]');
const first = await p.evaluate(() => ({ right: +document.querySelector('#module .rb-score > b').textContent, misses: document.querySelectorAll('#module .rb-misses li').length, lack: [...document.querySelectorAll('#module .rb-lack')].map((x) => x.textContent.trim()) }));
checks.firstTestHasGaps = first.misses > 0 && first.lack.every((l) => /not been shown|only been shown/.test(l));
await shot('review');
await click('#module [data-act="more"]');

// ---------- add what it lacked (the starred things), then test again
await p.waitForSelector('#module .rb[data-stage="teach"]');
const starred = await p.evaluate(() => [...document.querySelectorAll('#module .rb-item.starred')].map((x) => [x.dataset.kind, x.dataset.truth]));
checks.lackedAreStarred = starred.length > 0 && starred.length <= first.misses;
for (const [id, truth] of starred) { if (await p.evaluate(() => /Room for 0 more/.test(document.querySelector('#module .rb-shelf h3')?.textContent || ''))) break; await p.click(`#module .rb-item[data-kind="${id}"]`); await p.click(`#module .rb-bin[data-bin="${truth}"]`); }
await shot('bench-more');
await click('#module [data-go]:not([disabled])');
await runTest('test-2');
await p.waitForSelector('#module .rb[data-stage="result"]');
checks.chartShown = (await p.locator('#module .rb-chart svg').count()) === 1;
await shot('result');
await click('#module [data-act="street"]');

// ---------- the street: the robot sorts new things in the town
await p.waitForSelector('#module .rb[data-stage="street"]');
checks.cameraIsLow = await p.evaluate(() => { const c = window.__eco.app.stage.camera; return new Promise((res) => setTimeout(() => res(c.position.y < 30 && c.fov > 30), 1500)); });
let presses = 0; let streetShot = false;
while ((await p.locator('#module').count()) && presses++ < 20) {
  const go = p.locator('#module .rb-cap [data-go]:not([disabled])'); await go.waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
  if (!(await p.locator('#module').count())) break;
  if (presses === 3 && !streetShot) { streetShot = true; await p.waitForTimeout(motion ? 1500 : 600); await shot('street'); }
  await go.click().catch(() => {}); await p.waitForTimeout(motion ? 300 : 150);
}

// ---------- the record card, and what was kept
await p.waitForSelector('#modal:not(.hide) .practised', { timeout: 60000 });
checks.recordCard = await p.evaluate(() => /You practised/.test(document.querySelector('#modal').textContent) && /teaching a robot by showing it \d+ examples/.test(document.querySelector('#modal').textContent));
await shot('record');
await click('#modal:not(.hide) [data-act="ok"]');
await p.waitForFunction(() => window.__robots && window.__robots !== 'open', null, { timeout: 60000 });
const result = await p.evaluate(() => window.__robots);
checks.finished = result?.finished === true;
checks.record = !!result?.record && result.record.made.lines.length >= 5 && result.record.practised.length === 4 && /^<svg/.test(result.record.made.picture || '');
checks.town = result?.town?.kind === 'recycling-robot' && typeof result.town.data.key === 'string';
await p.waitForTimeout(1500);
const after = await p.evaluate(() => { const { G, stage } = window.__eco.app; const c = stage.camera; return { done: G.modules?.robots?.done === true, saved: G.modules?.robots?.state, scene: stage.scene.children.length, fov: c.fov, moduleGone: !document.querySelector('#module') }; });
checks.keptInSave = after.done && after.saved?.plays === 1;
checks.robotLeftInTown = after.scene === sceneBefore + 1;       // show() added one thing; the street scene itself was removed
checks.cameraPutBack = after.fov < 30 && after.moduleGone;
checks.everyStepSpoken = await p.evaluate(() => ['kept apart', 'new examples|added examples|Still \\d|lower than', 'at work in your town', 'in the right bin'].every((re) => window.__sayLog.some((s) => new RegExp(re).test(s.text))));
await shot('town-after');

// ---------- open it again and leave early: nothing is left behind, and the finished record stays
await p.evaluate(() => { window.__robots2 = 'open'; window.__eco.openModule('robots').then((r) => { window.__robots2 = r; }); });
await p.waitForSelector('#module[data-module="robots"] .rb[data-stage="teach"]', { timeout: 60000 });
await click('#module .modback'); await p.waitForFunction(() => window.__robots2 !== 'open', null, { timeout: 60000 }); await p.waitForTimeout(800);
checks.leavingEarly = await p.evaluate((n0) => !document.querySelector('#module') && window.__eco.app.G.modules.robots.done === true && window.__eco.app.stage.scene.children.length === n0 + 1, sceneBefore);

checks.noErrors = errors.length === 0; checks.noOutsideRequests = outside.length === 0;
const failed = Object.entries(checks).filter(([, v]) => v === false).map(([k]) => k);
console.log(JSON.stringify({ band, motion, size: `${W}x${H}`, checks, first, result: result && { finished: result.finished, made: result.record?.made && { title: result.record.made.title, lines: result.record.made.lines }, practised: result.record?.practised, town: result.town }, errors, outside, failed }, null, 2));
await b.close();
process.exit(failed.length ? 1 : 0);
