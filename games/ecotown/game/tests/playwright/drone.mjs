// Browser run of the "Drone delivery" module (js/modules/drone), from start to finish, with screenshots.
// Usage: node tests/playwright/drone.mjs [baseUrl] [outDir]      (serve games/ecotown/game first)
//   BAND=senior  ages 13-17 (two parcels). Default: junior.
//   REDUCE=0     play without reduced motion (the turning chase camera). Default: reduced motion, as run.mjs FAST=1.
//   SIZE=1024x768  the window. Default 1280x800.
// It starts a small town, opens the module, flies the delivery by keyboard, writes one set of steps that stops short
// and one that delivers, answers the question, finishes, and checks the record, the route left in the town, that
// everything the module added to the scene is gone, and that the page logged no errors.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8811/', out = 'shots-drone'] = process.argv.slice(2);
const band = process.env.BAND === 'senior' ? 'senior' : 'junior'; const reduce = process.env.REDUCE !== '0';
const [W, H] = (process.env.SIZE || '1280x800').split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.addInitScript((r) => { localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce: r })); }, reduce);
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
await p.addLocatorHandler(p.locator('#episode [data-skip]'), async (skip) => { await skip.click(); });
const tag = `${band}${reduce ? '' : '-motion'}`; let n = 0; const shots = [];
const shot = async (name) => { await p.waitForTimeout(700); const f = `${out}/${tag}-${String(++n).padStart(2, '0')}-${name}.png`; await p.screenshot({ path: f }); shots.push(f); };
const click = async (sel, t = 60000) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.click(sel); };
const checks = {}; const LONG = 900000;
const stage = (s) => p.waitForSelector(`#module .modroot[data-dr-stage="${s}"]`, { timeout: LONG });

// ---------- a small town of the child's own
await p.goto(base + 'index.html');
await click(`[data-band="${band}"]`, 120000);
await click('[data-name]'); await click('[data-go]');
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: 180000 }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForSelector('#build [data-cat="land"]', { timeout: 240000 });
await p.evaluate(() => { const { G } = window.__eco.app; for (const [k, item] of [['6,3', 'timber'], ['7,3', 'straw'], ['7,4', 'timber'], ['11,5', 'cohousing'], ['8,5', 'market'], ['11,3', 'school']]) { G.placeAt(k, 'town', { free: true }); G.placeAt(k, item, { free: true }); } });
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 120000 });
checks.town = await p.evaluate(() => [...window.__eco.app.G.cells].filter(([, c]) => c.item).length);

// ---------- open the module; leave at once with the one way back: nothing is kept and the scene is clean
const sceneNames = () => p.evaluate(() => window.__eco.app.stage.scene.children.map((c) => c.name).filter((x) => /^drone/.test(x)));
await p.evaluate(() => { window.__first = window.__eco.openModule('drone'); });
await stage('intro'); checks.sceneWhileOpen = (await sceneNames()).join(',');
await click('#module .modback'); checks.leftEarly = await p.evaluate(() => window.__first); checks.sceneAfterLeaving = (await sceneNames()).join(',');
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 60000 });

// ---------- 1. fly the delivery by hand (keyboard)
await p.evaluate(() => { window.__droneDone = false; window.__drone = window.__eco.openModule('drone').then((r) => { window.__droneDone = true; return r; }); });
await stage('intro'); await shot('intro');
checks.introSpoken = (await p.textContent('#module .dr-talk p')).length > 20;
await click('#module [data-dr-next]'); await stage('hand');
const held = new Set(); const hold = async (want) => { for (const k of [...held]) if (!want.includes(k)) { await p.keyboard.up(k); held.delete(k); } for (const k of want) if (!held.has(k)) { await p.keyboard.down(k); held.add(k); } };
let took = false; const t0 = Date.now();
while (Date.now() - t0 < LONG) {
  const s = await p.evaluate(() => { const r = document.querySelector('#module .modroot'); const h = document.querySelector('#module [data-dr-hud]'); return { stage: r?.dataset.drStage, dx: +h?.dataset.dx, dz: +h?.dataset.dz, turn: +h?.dataset.turn }; });
  if (s.stage !== 'hand') break;
  if (Number.isFinite(s.dx)) {
    if (reduce) await hold(Math.abs(s.dx) > 0.3 ? [s.dx > 0 ? 'ArrowRight' : 'ArrowLeft'] : Math.abs(s.dz) > 0.3 ? [s.dz > 0 ? 'ArrowDown' : 'ArrowUp'] : []);
    else await hold(Math.abs(s.turn) > 0.25 ? [s.turn > 0 ? 'ArrowRight' : 'ArrowLeft', ...(Math.abs(s.turn) < 1.2 ? ['ArrowUp'] : [])] : ['ArrowUp']);
    if (!took && Date.now() - t0 > 6000) { took = true; await shot('flying-by-hand'); }
  } else await hold(reduce ? ['ArrowUp'] : ['ArrowUp']);
  await p.waitForTimeout(120);
}
await hold([]); await stage('handdone');
checks.handLine = await p.textContent('#module .dr-talk p'); await shot('hand-delivered');
checks.padButtons = await p.evaluate(() => document.querySelectorAll('#module [data-dr-pad]').length); // gone after the hand flight
await click('#module [data-dr-next]');

// ---------- 2. the planner: first a set of steps that stops short (the drone has not taken off)
await stage('plan'); await p.waitForSelector('#module [data-dr-plan]');
const add = async (id, times = 1) => { for (let i = 0; i < times; i++) await p.click(`#module [data-dr-add="${id}"]`); };
await add('w', 2); await shot('planner-first-steps');
checks.plannerSay = await p.textContent('#module .dr-say p');
await click('#module [data-dr-fly]'); await stage('auto');
await p.waitForSelector('#module [data-dr-next]:not([hidden])', { timeout: LONG });
checks.stoppedLine = await p.textContent('#module .dr-talk p'); await shot('stopped-on-the-pad');
await click('#module [data-dr-next]'); await stage('plan');
checks.stopMarked = await p.evaluate(() => !!document.querySelector('#module .dr-prog li.stop'));
await click('#module [data-dr-clear]');

// ---------- 3. steps that deliver: a route over the island's tiles from the start to each drop-off
const route = await p.evaluate(() => {
  const plan = document.querySelector('#module [data-dr-plan]'); const keys = new Set([...window.__eco.terrain.tiles.keys()]);
  const D = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] }; const out = []; let at = plan.dataset.from;
  for (const to of plan.dataset.drops.split(';')) {
    const prev = new Map([[at, null]]); const q = [at];
    while (q.length) { const c = q.shift(); if (c === to) break; const [x, z] = c.split(',').map(Number); for (const d in D) { const k = `${x + D[d][0]},${z + D[d][1]}`; if (keys.has(k) && !prev.has(k)) { prev.set(k, [c, d]); q.push(k); } } }
    const leg = []; let c = to; while (prev.get(c)) { leg.unshift(prev.get(c)[1]); c = prev.get(c)[0]; }
    out.push(...leg, 'drop'); at = to;
  }
  return out;
});
await add('up'); for (const s of route) await add(s);
checks.steps = await p.evaluate(() => +document.querySelector('#module [data-dr-plan]').dataset.steps);
// the − and + buttons change a flight's length and the map follows
{ const more = '#module [data-dr-more]:not(:disabled)'; if (await p.$(more)) { const was = await p.textContent('#module .dr-prog .dr-n'); await p.click(more); const now = await p.textContent('#module .dr-prog .dr-n'); await p.click('#module [data-dr-less]:not(:disabled)'); checks.plusMinus = was !== now && (await p.textContent('#module .dr-prog .dr-n')) === was; } }
await shot('planner-route');
await click('#module [data-dr-fly]'); await stage('auto'); await p.waitForTimeout(reduce ? 2500 : 6000); await shot('flying-the-steps');

// ---------- 4. compare, answer the question, finish
await p.waitForSelector('#module [data-dr-compare]', { timeout: LONG });
checks.compare = await p.evaluate(() => [...document.querySelectorAll('#module [data-dr-compare] li')].map((li) => li.textContent));
await click('#module [data-dr-choose="daily"]'); checks.reply = await p.textContent('#module .dr-reply'); await shot('compare');
await click('#module [data-dr-finish]');
await p.waitForSelector('#modal:not(.hide) [data-act="ok"]', { timeout: 120000 }); await shot('record-card');
checks.card = await p.evaluate(() => document.querySelector('#modal').innerText.replace(/\s+/g, ' ').slice(0, 600));
await click('#modal:not(.hide) [data-act="ok"]');
await p.waitForFunction(() => window.__droneDone, null, { timeout: 120000 });
const result = await p.evaluate(() => window.__drone);
checks.finished = result?.finished; checks.title = result?.record?.made.title; checks.lines = result?.record?.made.lines; checks.practised = result?.record?.practised;
checks.picture = /^<svg/.test(result?.record?.made.picture || '') ? `${result.record.made.picture.length} characters of SVG` : 'none';
checks.townKind = result?.town?.kind; checks.townPts = result?.town?.data?.pts?.length;
checks.saved = await p.evaluate(() => { const m = window.__eco.app.G.modules?.drone; return { done: m?.done, times: m?.times, state: !!m?.state, town: m?.town?.kind }; });
await p.waitForTimeout(3000);
checks.sceneAfter = (await sceneNames()).join(','); // only the route that keeps flying
checks.moduleLayerGone = await p.evaluate(() => !document.getElementById('module') && !document.documentElement.dataset.module);
await shot('route-in-the-town');
if (result?.record?.made.picture) fs.writeFileSync(`${out}/${tag}-take-home.svg`, result.record.made.picture);

const ok = checks.finished === true && checks.title === 'My drone route' && checks.practised?.length >= 2 && checks.townKind === 'drone-route' && checks.saved.done === true
  && checks.leftEarly?.finished !== true && checks.sceneAfterLeaving === '' && checks.sceneAfter === 'drone-route' && checks.moduleLayerGone && checks.stopMarked
  && /still on its landing pad/.test(checks.stoppedLine) && checks.padButtons === 0 && !errors.length && !outside.length;
console.log(JSON.stringify({ ok, band, reduce, size: `${W}x${H}`, checks, errors, outside, shots }, null, 2));
await b.close();
process.exit(ok ? 0 : 1);
