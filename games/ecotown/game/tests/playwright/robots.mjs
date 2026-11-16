// Browser run for the "robots" module (Robots at work): starts a town, opens the module and plays the whole hour:
// the mission map, then all six missions in order (sensors, the arm, hospital rules, the recycling sorter with its
// street scene, the weeding robot, the flood robot), leaving and coming back part way, then the record, "Talk it over"
// and the break card. Then it opens the module again, replays a finished mission and leaves early.
// Usage: node tests/playwright/robots.mjs [baseUrl] [outDir]      (serve games/ecotown/game first, e.g. on port 8892)
//   BAND=senior   ages 13–17 (default junior).    MOTION=1  leave reduced motion off (default: low graphics, reduced motion).
//   W=768 H=1024  the window size (default 1280 × 800).    TOUCH=1  a touch screen (taps).    TEXT=large  Large text.
//   FROM=4        start at mission 4 (the save says missions 1 to 3 are done), to check part of the hour on a slow machine.
//   TOWN=small (default: four tiles of town land) | empty (nothing built) | built (Florence's practice town, every plan built)
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8892/', out = 'shots-robots'] = process.argv.slice(2);
const band = process.env.BAND === 'senior' ? 'senior' : 'junior'; const J = band === 'junior'; const motion = !!process.env.MOTION; const W = +(process.env.W || 1280); const H = +(process.env.H || 800);
const town = process.env.TOWN || 'small'; const FROM = Math.max(1, Math.min(6, +(process.env.FROM || 1))); const large = process.env.TEXT === 'large'; const touch = !!process.env.TOUCH;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const cx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch });
const p = await cx.newPage(); p.setDefaultTimeout(240000);
await p.addInitScript((pr) => { window.__sayLog = []; localStorage.setItem('ecotown.prefs', JSON.stringify(pr)); }, { quality: 'low', reduce: !motion, ...(large ? { text: 'large' } : {}) });
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
const checks = {}; const notes = {}; let n = 0; const tag = `${band}${motion ? '-motion' : ''}${large ? '-large' : ''}${touch ? '-touch' : ''}-${town}-${W}x${H}`;
const shot = async (name, wait = 350) => { await p.waitForTimeout(wait); const f = `${out}/${tag}-${String(++n).padStart(2, '0')}-${name}.png`; await p.screenshot({ path: f }); return f; };
const tap = async (sel, t = 240000) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.waitForTimeout(330); if (touch) await p.tap(sel); else await p.click(sel); };
const stage = () => p.evaluate(() => document.querySelector('#module .rb')?.dataset.stage || null);
const waitStage = (re, t = 240000) => p.waitForFunction((r) => new RegExp(r).test(document.querySelector('#module .rb')?.dataset.stage || ''), re, { timeout: t });
const line = () => p.evaluate(() => document.querySelector('#module .rb-say p')?.textContent || '');
const said = (re) => p.evaluate((r) => window.__sayLog.some((s) => new RegExp(r).test(s.text)), re);
const and = (k, v) => { checks[k] = checks[k] === undefined ? !!v : checks[k] && !!v; };
const saved = () => p.evaluate(() => window.__eco.app.G.modules?.robots?.state || null);
// nothing in the module's layer is off the screen, too small to tap, or under the footer
async function layout(where) {
  const bad = await p.evaluate(() => {
    const bad = []; const Wd = innerWidth; const Hd = innerHeight; const rb = document.querySelector('#module .rb'); if (!rb) return bad;
    const back = document.querySelector('#module .modback')?.getBoundingClientRect(); const head = rb.querySelector('.rb-headin')?.getBoundingClientRect();
    if (back && head && head.width && !(head.left >= back.right || head.top >= back.bottom || head.bottom <= back.top || head.right <= back.left)) bad.push('the header overlaps the Back button');
    const main = rb.querySelector('.rb-main'); const scrolls = main.scrollHeight > main.clientHeight + 2;
    for (const e of rb.querySelectorAll('.rb-foot button, .rb-say, .rb-headin, .rb-cap')) { const r = e.getBoundingClientRect(); if (!r.width) continue; if (r.right > Wd + 1 || r.bottom > Hd + 1 || r.left < -1 || r.top < -1) bad.push(`off the screen: ${e.className}`); }
    if (!scrolls) for (const e of main.querySelectorAll('button')) { const r = e.getBoundingClientRect(); if (r.width && (r.right > Wd + 1 || r.bottom > Hd + 1)) bad.push(`off the screen: ${e.className}`); }
    for (const e of rb.querySelectorAll('.rb-foot button, .rb-mcard, .rb-sensor, .rb-rulebtn, .rb-tile, .rb-pstep, .rb-pdel, .rb-act, .rb-mv, .rb-set, .rb-ask, .rb-opt, .rb-rep, .rb-bin, .rb-item')) { const r = e.getBoundingClientRect(); if (r.width && (r.height < 43 || r.width < 43)) bad.push(`small target: ${e.className} ${Math.round(r.width)}x${Math.round(r.height)}`); }
    const foot = rb.querySelector('.rb-foot')?.getBoundingClientRect(); const mr = main.getBoundingClientRect(); if (foot && mr.bottom > foot.top + 1 && rb.dataset.stage !== 'street') bad.push('the page runs under the footer');
    if (main.scrollWidth > main.clientWidth + 2) bad.push('the page scrolls sideways');
    return [...new Set(bad)];
  });
  and('layoutClean', bad.length === 0); if (bad.length) notes[`layout:${where}`] = bad;
}
const times = {}; let t0 = Date.now(); const lap = (k) => { times[k] = Math.round((Date.now() - t0) / 1000); t0 = Date.now(); };

// ---------- into a town
await p.goto(base + 'index.html');
await tap(`[data-band="${band}"]`);
await p.waitForSelector('[data-name]'); await p.fill('[data-name]', 'Otter Bend'); await tap('[data-go]');
await p.waitForTimeout(800);
const sk = await p.waitForSelector('[data-introskip]', { timeout: 300000 }).catch(() => null); if (sk) await sk.click().catch(() => {});
await p.waitForSelector('#build [data-cat="land"]', { timeout: 300000 });
if (town === 'small') {
  await p.evaluate(() => { const { G } = window.__eco.app; const ks = [...window.__eco.terrain.tiles.values()].filter((t) => t.zone === 'slope' && !t.fixed).slice(0, 4).map((t) => t.k); for (const k of ks) G.placeAt(k, 'town'); });
} else if (town === 'built') {
  notes.built = await p.evaluate(async () => {
    const { seedTo, CLEAR } = await import('./js/game/seed.js'); const { plan, applyPlacements } = await import('./js/sim/planner.js');
    const terrain = window.__eco.terrain; let cells = seedTo(terrain, 'heart'); cells = applyPlacements(cells, plan('heart', CLEAR.heart, { terrain, cells, numbers: { minutes: 10 } }).placements);
    const { G } = window.__eco.app;
    for (const [k, c] of cells) if (c.mark === 'town') G.placeAt(k, 'town', { free: true });
    for (const [k, c] of cells) { if (c.mark && c.mark !== 'town') G.placeAt(k, c.mark, { free: true }); if (c.item) G.placeAt(k, c.item, { free: true, replace: true }); }
    window.__eco.app.world.finishBuilds?.(); return { builds: [...G.cells].filter(([, c]) => c.item).length };
  });
  checks.practiceTownBuilt = notes.built.builds > 30;
}
await p.waitForTimeout(2000);
const sceneBefore = await p.evaluate(() => window.__eco.app.stage.scene.children.length);

async function openRobots(key = '__robots') {
  for (let tries = 0; tries < 8; tries++) {
    await p.evaluate((k) => { window[k] = 'open'; window.__eco.openModule('robots').then((r) => { window[k] = r; }, (e) => { window[k] = { error: String(e) }; }); }, key);
    await p.waitForFunction((k) => document.querySelector('#module[data-module="robots"] .rb[data-stage="map"]') || window[k] !== 'open', key, { timeout: 300000 });
    if (await p.locator('#module[data-module="robots"] .rb[data-stage="map"]').count()) return;
    await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(3000);
  }
  await waitStage('^map$', 60000);
}
const goFoot = (act) => tap(`#module .rb-foot [data-act="${act}"]`);
async function startMission(nm) { // from the map or a closing card: through the opening card into the mission
  await waitStage('^(map|done|brief)$'); if ((await stage()) === 'done' && nm > 1 && FROM === nm) await goFoot('map');
  if ((await stage()) === 'map') await goFoot('go'); else if ((await stage()) === 'done') await goFoot('next');
  await waitStage('^brief$'); checks[`m${nm}BriefSpoken`] = await said(`^Mission ${nm}\\.`);
  if (nm === FROM) { await layout('brief'); await shot(`m${nm}-brief`); }
  await goFoot('start');
}
async function finishCard(nm) { await waitStage('^done$'); checks[`m${nm}Done`] = (await saved())?.done?.[nm - 1] === 1; await layout(`m${nm}-done`); if (nm === 1 || nm === 6) await shot(`m${nm}-done`); lap(`m${nm}`); }

// ---------- the map
if (FROM > 1) await p.evaluate(([from, j]) => { // a save with the missions before FROM done (summaries as the missions make them)
  const sum = { 1: { mr: 6, mo: 8, pr: 3, po: 4, tried: [0, 1] }, 2: { fixed: true, steps: 8, rep: 4, runs: 5 }, 3: { rules: [['step', 'stop'], ['person', 'slow'], ['block', 'wait'], ['lift', 'call']], tests: 4, secs: 128 },
    4: { ex: 10, first: 5, last: 8, of: 8, sr: 4, so: 5, asked: 1 }, 5: { checks: 4, of: 4, f1: { pull: 70, ask: null, left: 1, weeds: 5, best: 1 }, f2: { pull: 80, ask: null, left: 3, weeds: 6, best: 3 }, tries: 4 } };
  const done = [1, 2, 3, 4, 5, 6].map((n) => (n < from ? 1 : 0)); const s = {}; for (let n = 1; n < from; n++) s[n] = sum[n];
  const { G } = window.__eco.app; G.modules = { ...(G.modules || {}), robots: { at: Date.now(), state: { v: 3, j, plays: 0, done, sum: s, cur: null, m4: null, r4: 0, town: from > 4 ? { key: null, bins: ['paper', 'glass', 'food'], things: ['newspaper'], right: 8, of: 8 } : null } } }; G.save();
}, [FROM, J]);
await openRobots();
checks.oneWayBack = (await p.locator('#module .modback').count()) === 1;
checks.mapSixMissions = (await p.locator('#module .rb-mcard').count()) === 6;
checks.mapLaterLocked = (await p.locator('#module .rb-mcard[disabled]').count()) === 6 - FROM;
checks.mapSpoken = await said(FROM > 1 ? 'Next is mission|is next' : 'Start with mission 1');
await layout('map'); await shot('map');

if (FROM <= 1) {
// ---------- mission 1: sensors, then the loop
await startMission(1);
await waitStage('^m1-match$'); let firstWrong = false;
for (let k = 0; k < 8; k++) {
  const ids = await p.evaluate(() => [...document.querySelectorAll('#module .rb-sensor:not([disabled])')].map((x) => x.dataset.s));
  for (const id of ids) {
    await tap(`#module .rb-sensor[data-s="${id}"]`);
    if (await p.locator('#module .rb-sensor.yes').count()) break;
    if (!firstWrong) { firstWrong = true; const l = await p.evaluate(() => document.querySelector('#module .rb-m1a .rb-verdict')?.textContent || ''); checks.m1MissNoAnswer = /Try another\.$/.test(l) && !/needs to know/.test(l); await shot('m1-miss'); await layout('m1-match'); }
  }
  if (k === 0) await shot('m1-match');
  await goFoot('next');
}
await waitStage('^m1-watch$'); await layout('m1-watch');
{ let asks = 0; let loops = 0;
  while ((await stage()) === 'm1-watch' && loops++ < 30) {
    if (await p.locator('#module .rb-foot [data-act="forward"]').count()) { asks++; await goFoot(asks % 2 ? 'forward' : 'turn'); if (asks === 1) await shot('m1-predict'); }
    await goFoot('next'); await p.waitForTimeout(150);
  }
  checks.m1Predictions = asks >= 3; }
await waitStage('^m1-rule$'); await tap('#module .rb-rulebtn[data-t="0"]'); await tap('#module [data-run]');
await p.waitForFunction(() => !document.querySelector('#module [data-run]')?.disabled && /bump/i.test(document.querySelector('#module .rb-verdict')?.textContent || ''), null, { timeout: 60000 });
checks.m1BumpExplained = true; await shot('m1-bump');
await tap('#module .rb-rulebtn[data-t="1"]'); await tap('#module [data-run]'); await p.waitForSelector('#module [data-fin]', { timeout: 60000 });
await layout('m1-rule'); await tap('#module [data-fin]');
await finishCard(1);

}
if (FROM <= 2) {
// ---------- mission 2: the arm
await startMission(2);
const tile = async (k) => tap(`#module .rb-tile[data-k="${k}"]`);
await waitStage('^m2-one$');
for (const k of [0, 2, 3, 4, 1, 2, 5, 4]) await tile(k);
await layout('m2-one'); await shot('m2-program');
await tap('#module [data-run]'); await p.waitForSelector('#module [data-next]', { timeout: 60000 }); await shot('m2-done-one'); await tap('#module [data-next]');
await waitStage('^m2-debug$');
// first a run that fails (no fix yet), then step through, then fix: after "Down" add "Close grip", remove the "Open grip" after it
await tap('#module [data-run]'); await p.waitForFunction(() => /Nothing reached the box/.test(document.querySelector('#module .rb-armbox .rb-verdict')?.textContent || ''), null, { timeout: 60000 });
checks.m2FailExplained = true;
await tap('#module [data-reset]'); await tap('#module .rb-foot [data-step]'); await tap('#module .rb-foot [data-step]'); await tap('#module .rb-foot [data-step]');
checks.m2StepShowsWhy = /already open, so the seedling is not picked up/.test(await p.evaluate(() => document.querySelector('#module .rb-armbox .rb-verdict')?.textContent || ''));
await shot('m2-debug-step'); await layout('m2-debug');
await tap('#module .rb-pstep[data-i="1"]'); await tile(3); await tap('#module .rb-pdel[data-del="3"]');
await tap('#module [data-run]'); await p.waitForSelector('#module [data-next]', { timeout: 60000 }); await tap('#module [data-next]');
await waitStage('^m2-tray$');
for (const k of [0, 2, 3, 4, 1, 2, 5, 4]) await tile(k);
await tap('#module .rb-rep[data-rep="1"]'); await tap('#module [data-run]');
await p.waitForFunction(() => /2 of 4 in the box/.test(document.querySelector('#module .rb-armbox .rb-verdict')?.textContent || ''), null, { timeout: 60000 });
await tap('#module .rb-rep[data-rep="1"]'); await tap('#module .rb-rep[data-rep="1"]'); await tap('#module [data-run]'); await p.waitForSelector('#module [data-next]', { timeout: 90000 });
checks.m2Repeat = /All 4 seedlings/.test(await p.evaluate(() => document.querySelector('#module .rb-armbox .rb-verdict')?.textContent || ''));
await shot('m2-tray'); await layout('m2-tray'); await tap('#module [data-next]');
await finishCard(2);

}
if (FROM <= 3) {
// ---------- mission 3: hospital rules (leave part way through, and come back)
await startMission(3);
const act = (cond, a) => p.evaluate(([c, x]) => { const li = [...document.querySelectorAll('#module .rb-rlist > li')].find((l) => l.querySelector(`.rb-act[data-a="${x}"]`) && l.textContent.includes(c)); return li ? [...li.querySelectorAll('.rb-act')].findIndex((b) => b.dataset.a === x) : -1; }, [cond, a]);
async function setAct(i, a) { await tap(`#module .rb-act[data-r="${i}"][data-a="${a}"]`); }
const testRun = async () => { await tap('#module [data-run]'); await p.waitForFunction(() => { const r = document.querySelector('#module [data-run]'); return r && !r.disabled; }, null, { timeout: 90000 }); };
await waitStage('^m3-r1$'); await setAct(0, 'full'); await testRun();
checks.m3UnsafeSaid = /not safe|unsafe/i.test(await p.evaluate(() => document.querySelector('#module .rb-verdict')?.textContent || '')); await shot('m3-unsafe');
await setAct(0, 'slow'); await testRun(); await layout('m3-r1'); await shot('m3-r1'); await tap('#module [data-next]');
await waitStage('^m3-r2$');
// leave here, and come back: the hour resumes at this trip
await tap('#module .modback'); await p.waitForFunction(() => window.__robots !== 'open', null, { timeout: 60000 }); await p.waitForTimeout(800);
checks.leaveMidKeepsDone = (await saved())?.done?.slice(0, 2).join() === '1,1' && (await saved())?.cur?.n === 3;
await openRobots('__robots');
checks.resumeSaysCarryOn = /Carry on: mission 3/.test(await p.evaluate(() => document.querySelector('#module .rb-foot').textContent));
await goFoot('go'); await waitStage('^m3-r2$'); checks.resumedAtTrip2 = true;
await setAct(1, 'wait'); await setAct(2, 'call'); await testRun(); await layout('m3-r2'); await shot('m3-r2'); await tap('#module [data-next]');
await waitStage('^m3-r3$'); await setAct(3, 'stop'); await testRun();
checks.m3OrderMatters = /first one in its list|first match/.test(await p.evaluate(() => document.querySelector('#module .rb-log').textContent)); await shot('m3-order');
for (const i of [3, 2, 1]) await tap(`#module .rb-mv[data-mv="${i}"][data-dir="-1"]`);
await testRun(); await p.waitForSelector('#module [data-next]', { timeout: 30000 }); await layout('m3-r3'); await shot('m3-r3'); await tap('#module [data-next]');
await finishCard(3);

}
if (FROM <= 4) {
// ---------- mission 4: the recycling sorter, then its street scene in the town
await startMission(4);
await waitStage('^teach$'); checks.m4Spoken = await said('only knows what you show it|learns only from examples');
const bins = await p.evaluate(() => [...document.querySelectorAll('#module .rb-bin')].map((x) => x.dataset.bin)); checks.bins = bins.length === (J ? 3 : 4);
await layout('m4-bench'); await shot('m4-bench');
for (const [id, truth] of await p.evaluate(() => [...document.querySelectorAll('#module .rb-item')].map((x) => [x.dataset.kind, x.dataset.truth])).then((a) => a.slice(0, -1))) { await tap(`#module .rb-item[data-kind="${id}"]`); await tap(`#module .rb-bin[data-bin="${truth}"]`); }
if (await p.isDisabled('#module [data-go]')) for (const [id, truth] of await p.evaluate(() => [...document.querySelectorAll('#module .rb-item')].map((x) => [x.dataset.kind, x.dataset.truth]))) { await tap(`#module .rb-item[data-kind="${id}"]`); await tap(`#module .rb-bin[data-bin="${truth}"]`); }
await tap('#module [data-go]:not([disabled])');
await waitStage('^test$'); { let k = 0; while ((await stage()) === 'test' && k++ < 40) { await tap('#module [data-go]'); await p.waitForTimeout(80); } if (k === 3) await shot('m4-test'); }
await waitStage('^review$'); await layout('m4-review'); await shot('m4-review'); await goFoot('more');
await waitStage('^teach$');
for (const id of await p.evaluate(() => [...document.querySelectorAll('#module .rb-item.starred')].map((x) => x.dataset.kind))) { if (await p.isDisabled('#module [data-go]') === false && await p.evaluate(() => /Room for 0/.test(document.querySelector('#module .rb-shelf h3')?.textContent || ''))) break; const truth = await p.getAttribute(`#module .rb-item[data-kind="${id}"]`, 'data-truth'); await tap(`#module .rb-item[data-kind="${id}"]`); await tap(`#module .rb-bin[data-bin="${truth}"]`); }
if (await p.isDisabled('#module [data-go]')) { const [id, truth] = await p.evaluate(() => { const x = document.querySelector('#module .rb-item'); return [x.dataset.kind, x.dataset.truth]; }); await tap(`#module .rb-item[data-kind="${id}"]`); await tap(`#module .rb-bin[data-bin="${truth}"]`); }
await tap('#module [data-go]:not([disabled])');
await waitStage('^test$'); { let k = 0; while ((await stage()) === 'test' && k++ < 30) { await p.waitForFunction(() => { const g = document.querySelector('#module [data-go]'); return !g || g.getAttribute('aria-disabled') !== 'true'; }, null, { timeout: 60000 }); if ((await stage()) !== 'test') break; await tap('#module [data-go]'); await p.waitForTimeout(80); } }
await waitStage('^result$'); await layout('m4-result'); await shot('m4-result'); await goFoot('street');
await waitStage('^street$'); await p.waitForTimeout(2500); await layout('m4-street'); await shot('m4-street');
{ let k = 0; while ((await stage()) === 'street' && k++ < 30) { const go = p.locator('#module .rb-cap [data-go]'); await go.waitFor({ state: 'visible', timeout: 60000 }).catch(() => {}); if ((await stage()) !== 'street') break;
  await p.waitForTimeout(340); await go.click().catch(() => {}); await p.waitForTimeout(200);
  await p.waitForFunction(() => document.querySelector('#module .rb')?.dataset.moving !== '1', null, { timeout: 30000 }).catch(() => {}); if (k === 3) await shot('m4-street-sorting'); } }
await finishCard(4);
checks.m4StreetSceneRemoved = await p.evaluate(() => !window.__eco.app.stage.scene.getObjectByName('robots-scene'));

}
if (FROM <= 5) {
// ---------- mission 5: the weeding robot
await startMission(5);
await waitStage('^m5-0$');
for (let k = 0; k < 4; k++) { await goFoot(k % 2 ? 'crop' : 'weed'); if (k === 3) { await layout('m5-check'); await shot('m5-check'); } await goFoot('n'); }
await waitStage('^m5-1$'); await tap('#module .rb-set[data-t="50"]'); await tap('#module [data-run]');
checks.m5CropLostSaid = /lost for good|lost crop/.test(await p.evaluate(() => document.querySelector('#module .rb-setbox .rb-verdict')?.textContent || '')); checks.m5NoPassOnLoss = !(await p.locator('#module [data-next]').count());
await shot('m5-lost');
await tap('#module .rb-set[data-t="70"]'); await tap('#module [data-run]'); await p.waitForSelector('#module [data-next]'); await layout('m5-row'); await shot('m5-row'); await tap('#module [data-next]');
await waitStage('^m5-2$'); await tap('#module .rb-set[data-t="80"]'); if (!J) await tap('#module .rb-ask[data-a="50"]'); await tap('#module [data-run]'); await p.waitForSelector('#module [data-next]');
if (!J) checks.m5SeniorTable = (await p.locator('#module .rb-conf tbody tr').count()) === 2;
await layout('m5-carrot'); await shot('m5-carrot'); await tap('#module [data-next]');
await finishCard(5);

}
if (FROM <= 6) {
// ---------- mission 6: the flood robot
await startMission(6);
await waitStage('^m6-one$');
const opt = (g, id) => tap(`#module .rb-opt[data-g="${g}"][data-id="${id}"]`);
await opt('body', 'wheels'); await opt('sensor', 'camera'); await layout('m6-design'); await shot('m6-design');
await tap('#module [data-run]'); await p.waitForFunction(() => { const r = document.querySelector('#module [data-run]'); return r && !r.disabled && document.querySelector('#module .rb-simbox .rb-verdict'); }, null, { timeout: 60000 });
checks.m6FailSaysWhy = /bricks|rubble/i.test(await p.evaluate(() => document.querySelector('#module .rb-simbox .rb-verdict').textContent)); await shot('m6-fail');
await opt('body', 'tracks'); await tap('#module [data-run]'); await p.waitForFunction(() => /dark/i.test(document.querySelector('#module .rb-simbox .rb-verdict')?.textContent || ''), null, { timeout: 60000 });
await opt('sensor', 'heat'); await tap('#module [data-run]'); await p.waitForSelector('#module [data-next]', { timeout: 60000 }); await layout('m6-one'); await shot('m6-found'); await tap('#module [data-next]');
await waitStage('^m6-two$'); await opt('floats', 'floats'); await tap('#module [data-run]'); await p.waitForFunction(() => /sank|battery|Battery/.test(document.querySelector('#module .rb-simbox .rb-verdict')?.textContent || ''), null, { timeout: 60000 });
notes.m6second = await p.evaluate(() => document.querySelector('#module .rb-simbox .rb-verdict').textContent);
await opt('battery', 'big'); await tap('#module [data-run]'); await p.waitForFunction(() => /sank|Found|found/.test(document.querySelector('#module .rb-simbox .rb-verdict')?.textContent || ''), null, { timeout: 60000 });
if (!(await p.locator('#module [data-next]').count())) { await opt('sensor', 'camera'); await tap('#module [data-run]'); }
await p.waitForSelector('#module [data-next]', { timeout: 60000 }); await layout('m6-two'); await shot('m6-two'); await tap('#module [data-next]');
await finishCard(6);

}
// ---------- the end of the hour: the map with Finish, the record, Talk it over, the break
await goFoot('map'); await waitStage('^map$'); checks.mapAllTicked = (await p.locator('#module .rb-mcard.done').count()) === 6; await layout('map-done'); await shot('map-done');
await goFoot('finish');
await p.waitForSelector('#modal:not(.hide) .practised', { timeout: 60000 }); await shot('record');
checks.recordCard = await p.evaluate(() => /You practised/.test(document.querySelector('#modal').textContent));
await tap('#modal:not(.hide) [data-act="ok"]');
for (const a of ['go', 'go', 'stay']) { const s = await p.waitForSelector(`#modal:not(.hide) [data-act="${a}"]`, { timeout: 60000 }).catch(() => null); if (s) { if (a === 'go') await shot('talk'); await p.waitForTimeout(400); await s.click(); checks[`end-${a}`] = true; } else checks[`end-${a}`] = false; }
await p.waitForFunction(() => window.__robots && window.__robots !== 'open', null, { timeout: 60000 });
const result = await p.evaluate(() => window.__robots);
checks.finished = result?.finished === true;
checks.record = !!result?.record && result.record.made.lines.length === 6 && result.record.practised.length === 4 && /^<svg/.test(result.record.made.picture || '') && result.record.made.lines.every((l) => l.length <= 120 && !/undefined|NaN|null/.test(l));
checks.town = result?.town?.kind === 'recycling-robot';
await p.waitForTimeout(2500);
checks.robotLeftInTown = await p.evaluate(() => !!window.__eco.app.stage.scene.getObjectByName('robots-sign'));
await shot('town-after');

// ---------- open it again: every tick is kept; replay mission 2 and leave part way
await openRobots('__robots2');
checks.reopenAllDone = (await p.locator('#module .rb-mcard.done').count()) === 6;
await tap('#module .rb-mcard[data-n="2"]'); await waitStage('^brief$'); await goFoot('start'); await waitStage('^m2-one$');
await tap('#module .modback'); await p.waitForFunction(() => window.__robots2 !== 'open', null, { timeout: 60000 }); await p.waitForTimeout(800);
checks.leavingEarly = await p.evaluate(() => !document.querySelector('#module') && window.__eco.app.G.modules.robots.done === true && window.__eco.app.G.modules.robots.state?.done?.every(Boolean));

checks.noErrors = errors.length === 0; checks.noOutsideRequests = outside.length === 0;
const failed = Object.entries(checks).filter(([, v]) => v === false).map(([k]) => k);
console.log(JSON.stringify({ band, motion, large, touch, town, size: `${W}x${H}`, failed, checks, notes, times, errors: errors.slice(0, 5), outside: outside.slice(0, 3), result: result && { finished: result.finished, made: result.record?.made && { title: result.record.made.title, lines: result.record.made.lines }, practised: result.record?.practised } }, null, 1));
await b.close();
process.exit(failed.length ? 1 : 0);
