// A browser run of the "roads" module (js/modules/roads), from start to finish, with screenshots.
// Usage: node tests/playwright/roads.mjs [baseUrl] [outDir] [junior|senior] [width height]
//   MOTION=1 plays it with movement (the morning and the ride are animated); otherwise reduced motion is on.
// It starts a town, opens the module, places pieces by keyboard and by clicks, runs the morning twice, chooses the
// freed land's uses, rides the street, and checks that a record came back and the page logged no errors.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8813/', out = 'shots-roads', band = 'junior', W = 1280, H = 800] = process.argv.slice(2);
const motion = !!process.env.MOTION; const junior = band !== 'senior';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +W, height: +H } });
await p.addInitScript((reduce) => { window.__sayLog = []; localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce })); }, !motion);
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
const checks = {}; let n = 0;
const shot = async (name) => { await p.waitForTimeout(900); await p.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png` }); };
const LONG = 240000;
const click = async (sel, t = LONG) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.click(sel); };
const M = '#module[data-module="roads"] ';

// ---- into a town
await p.goto(base + 'index.html');
await click(`[data-band="${band}"]`);
await click('[data-name]'); await click('[data-go]');
await p.waitForTimeout(800);
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: LONG }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForSelector('#build [data-cat="land"]', { timeout: LONG });
await p.waitForFunction(() => window.__eco?.app?.G?.canMenu?.(), null, { timeout: LONG });

// ---- open the module
await p.evaluate(() => { window.__roads = undefined; window.__eco.openModule('roads').then((r) => { window.__roads = r === undefined ? null : r; }); });
await p.waitForSelector(M + '.rd-top', { timeout: LONG });
checks.backButton = await p.isVisible('#module .modback');
await shot('before');
// Florence's introduction: Next until the pieces appear
for (let i = 0; i < 8 && !(await p.$(M + '[data-slot]')); i++) { await click(M + '[data-act="next"]'); await p.waitForTimeout(300); }
await p.waitForSelector(M + '[data-slot="0"]', { timeout: LONG });
checks.runNeedsDrop = await p.isDisabled(M + '[data-act="run"]');

// ---- a first, thin design: one drop-off point, placed by keyboard
await p.focus(M + '[data-slot="4"]'); await p.keyboard.press('1'); await p.focus(M + '[data-slot="4"]'); await p.keyboard.press('Enter');
checks.keyboardPlaces = await p.evaluate((m) => document.querySelector(m + '[data-slot="4"]').classList.contains('has'), M);
await p.click(M + '[data-slot="5"]'); // the junction: nothing may go there
checks.junctionRefused = await p.evaluate((m) => !document.querySelector(m + '[data-slot="5"]').classList.contains('has'), M);
await shot('design-first');
const runMorning = async () => {
  await click(M + '[data-act="run"]');
  if (motion) { await p.waitForSelector(M + '.rd-clock', { timeout: LONG }); await p.waitForTimeout(2500); if (!checks.shotRun) { checks.shotRun = true; await shot('morning'); } }
  await p.waitForSelector(M + '.rd-nums', { timeout: LONG });
  return p.evaluate((m) => [...document.querySelectorAll(m + '.rd-num')].map((e) => [e.querySelector('small').textContent, e.querySelector('b').textContent, e.querySelector('em').textContent]), M);
};
const first = await runMorning(); checks.firstRun = first;
await shot('numbers-first');
await click(M + '[data-act="change"]');

// ---- a better design: by clicks on the tray, by the arrow keys, and by a tap on the 3D street
await p.waitForSelector(M + '[data-slot="0"]', { timeout: LONG });
const put = async (kind, slot) => { await click(M + `[data-kind="${kind}"]`); await click(M + `[data-slot="${slot}"]`); };
await put('drop', 4);                                  // take the first one away again
await put('drop', 2); await put('drop', 7); await put('bay', 1); await put('bay', 3);
await put('walk', 0); await put('walk', 8); await put(junior ? 'walk' : 'cycle', 6);
await p.focus(M + '[data-slot="3"]'); await p.keyboard.press(junior ? '2' : '2'); await p.focus(M + '[data-slot="3"]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); // a bay at place 5 by the arrow keys
checks.arrowKeys = await p.evaluate((m) => document.querySelector(m + '[data-slot="4"]').classList.contains('has'), M);
// a tap on the street itself: place 10 (index 9), found by projecting its centre through the module's camera
const tap = await p.evaluate(() => { const { app } = window.__eco; const T = app.stage.camera.position.constructor; const v = new T(9 * 4 + 2, 0, -3000).project(app.stage.camera); const r = app.stage.renderer.domElement.getBoundingClientRect(); return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height }; });
checks.tapPoint = await p.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, tap);
await p.click(M + '[data-kind="bay"]');
if (checks.tapPoint === 'CANVAS') { await p.mouse.click(tap.x, tap.y); await p.waitForTimeout(400); checks.streetTap = await p.evaluate((m) => document.querySelector(m + '[data-slot="9"]').classList.contains('has'), M); if (checks.streetTap) await p.mouse.click(tap.x, tap.y); }
await shot('design-better');
const second = await runMorning(); checks.secondRun = second;
checks.numbersChanged = JSON.stringify(first) !== JSON.stringify(second);
checks.lastRunShown = await p.evaluate((m) => !!document.querySelector(m + '.rd-num i'), M);
await shot('numbers-better');
await click(M + '[data-act="keep"]');

// ---- the freed land
await p.waitForSelector(M + '[data-use]', { timeout: LONG });
checks.buildNeedsAll = await p.isDisabled(M + '[data-act="build"]');
await click(M + '[data-plot="0"][data-use="homes"]'); await click(M + '[data-plot="1"][data-use="park"]'); await click(M + '[data-plot="2"][data-use="garden"]');
checks.landSummary = await p.evaluate((m) => [...document.querySelectorAll(m + '.rd-sum li')].map((e) => e.textContent), M);
await shot('land');
await click(M + '[data-act="build"]'); await click(M + '[data-act="ride"]');

// ---- the ride
if (motion) { await p.waitForSelector(M + '[data-act="end"]', { timeout: LONG }); await p.waitForTimeout(6000); await shot('ride'); await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); await click(M + '[data-act="next"]'); }
else { for (let i = 0; i < 9; i++) { await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); if (i === 1) await shot('ride'); const last = await p.evaluate((m) => /Finish/.test(document.querySelector(m + '[data-act="next"]').textContent), M); await p.click(M + '[data-act="next"]'); if (last) break; await p.waitForTimeout(300); } }

// ---- the record card, then back in the town
await p.waitForSelector('#modal:not(.hide) [data-act="ok"]', { timeout: LONG });
checks.cardText = await p.evaluate(() => document.querySelector('#modal').innerText.replace(/\s+/g, ' ').slice(0, 600));
await shot('record');
await p.click('#modal [data-act="ok"]');
await p.waitForFunction(() => window.__roads !== undefined, null, { timeout: LONG });
const result = await p.evaluate(() => window.__roads);
checks.finished = result?.finished === true; checks.title = result?.record?.made?.title; checks.lines = result?.record?.made?.lines; checks.practised = result?.record?.practised;
checks.picture = /^<svg/.test(result?.record?.made?.picture || ''); checks.town = result?.town;
await p.waitForTimeout(1500);
Object.assign(checks, await p.evaluate(() => {
  const { app } = window.__eco; const found = []; app.stage.scene.traverse((o) => { if (o.name === 'roads-street') found.push({ z: Math.round(o.position.z), scale: +o.scale.x.toFixed(2), visible: o.visible }); });
  const kept = app.G.modules?.roads;
  return { moduleGone: !document.querySelector('#module'), setRemoved: !found.some((f) => f.z < -2000), townModel: found.filter((f) => f.z > -2000), saved: { done: kept?.done, record: !!kept?.record, town: kept?.town?.kind, state: kept?.state?.stage }, said: (window.__sayLog || []).length };
}));
// look at the model in the town
await p.evaluate(() => { const { app } = window.__eco; let o = null; app.stage.scene.traverse((x) => { if (x.name === 'roads-street' && x.position.z > -2000) o = x; }); if (o && app.rig?.frameBox) { try { const V = o.position.constructor; app.rig.frameBox([new V(o.position.x - 4, o.position.y, o.position.z - 6), new V(o.position.x + 10, o.position.y, o.position.z + 6)], { dur: 0.01 }); } catch { /* the wide view will do */ } } });
await shot('town');
checks.noOutsideRequests = outside.length === 0;
if (!checks.noOutsideRequests) checks.outside = outside.slice(0, 5);

const ok = checks.finished && checks.picture && checks.practised?.length >= 2 && checks.moduleGone && checks.setRemoved && checks.townModel?.length === 1 && checks.keyboardPlaces && checks.junctionRefused && checks.numbersChanged && checks.saved?.done && checks.noOutsideRequests && errors.length === 0;
console.log(JSON.stringify({ band, motion, ok, checks, errors }, null, 2));
await b.close();
process.exit(ok ? 0 : 1);
