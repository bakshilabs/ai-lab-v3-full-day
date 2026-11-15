// Browser run of the "Drone delivery" module (js/modules/drone), from start to finish, with screenshots.
// Usage: node tests/playwright/drone.mjs [baseUrl] [outDir]      (serve games/ecotown/game first)
//   BAND=senior    ages 13-17 (two parcels, a battery, then a no-fly zone). Default: junior.
//   REDUCE=0       play without reduced motion (the turning chase camera). Default: reduced motion, as run.mjs FAST=1.
//   SIZE=1024x768  the window. Default 1280x800. 768x1024 is an upright tablet: the planner must be one column.
//   TOWN=empty|small|heart   the child's town. Default small. heart is Florence's practice town (many homes of one name).
//   TEXT=large     large text.   TOUCH=1  a touch screen (taps; the flying itself is still driven by keys here).
//   QUICK=1        skip the flight that stops short (the hint check).
// It starts a town, opens the module, leaves and comes back, flies the delivery by keyboard through the hoops, flies on
// freely, writes steps that stop on the pad, puts "Go up" in before them, fills all twelve steps, taps the map, writes
// a route that delivers, compares, plans the second delivery, finishes, and checks the record, the drone and its route
// left in the town, the layout at this size, that everything the module added is gone, and that nothing was logged.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8861/', out = 'shots-drone'] = process.argv.slice(2);
const E = process.env; const band = E.BAND === 'senior' ? 'senior' : 'junior'; const reduce = E.REDUCE !== '0'; const town = E.TOWN || 'small'; const large = E.TEXT === 'large'; const touch = E.TOUCH === '1';
const [W, H] = (E.SIZE || '1280x800').split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const cx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, reducedMotion: reduce ? 'reduce' : 'no-preference' });
const p = await cx.newPage();
await p.addInitScript(([r, t]) => { if (!localStorage.getItem('ecotown.prefs')) localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce: r, ...(t ? { text: 'large' } : {}) })); }, [reduce, large]);
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
await p.addLocatorHandler(p.locator('#episode [data-skip]'), async (skip) => { await skip.click(); });
const tag = `${band}-${W}x${H}-${town}${reduce ? '' : '-motion'}${large ? '-large' : ''}${touch ? '-touch' : ''}`; let n = 0; const shots = [];
const shot = async (name, wait = 700) => { await p.waitForTimeout(wait); const f = `${out}/${tag}-${String(++n).padStart(2, '0')}-${name}.png`; try { await p.screenshot({ path: f, timeout: 180000 }); shots.push(f); } catch { shots.push(`(no picture: ${name})`); } };
const click = async (sel, t = 120000) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); if (touch) await p.tap(sel, { timeout: t }); else await p.click(sel, { timeout: t }); };
const checks = {}; const LONG = 900000;
const stage = (s) => p.waitForSelector(`#module .modroot[data-dr-stage="${s}"]`, { timeout: LONG });
const talk = () => p.evaluate(() => document.querySelector('#module .dr-talk:not([hidden]) p')?.textContent || '');
// nothing the module draws may run off the screen, sit under the fold or touch the loader's Back button
const layout = () => p.evaluate(() => {
  const o = []; const vw = innerWidth, vh = innerHeight; if (document.documentElement.scrollWidth > vw + 1) o.push('the page scrolls sideways');
  const seen = (e) => !e.hidden && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
  for (const e of document.querySelectorAll('#module .dr-talk, #module .dr-say, #module .dr-hud, #module .dr-pad, #module .dr-now, #module .dr-card, #module .dr-side, #module .dr-map, #module .dr-cheer, #module .dr-pal button, #module .dr-row button, #module .dr-talk button, #module .dr-pad button')) {
    if (!seen(e)) continue; const r = e.getBoundingClientRect(); const name = `${e.className || e.tagName} "${(e.textContent || '').trim().slice(0, 18)}"`;
    if (r.right > vw + 1 || r.left < -1) o.push(`${name} runs off the side (${Math.round(r.left)} to ${Math.round(r.right)})`);
    if ((r.bottom > vh + 1 || r.top < -1) && !e.closest('.dr-card')) o.push(`${name} runs off the top or bottom (${Math.round(r.top)} to ${Math.round(r.bottom)})`);
  }
  const back = document.querySelector('#module .modback')?.getBoundingClientRect();
  for (const e of document.querySelectorAll('#module .dr-talk, #module .dr-say, #module .dr-card, #module .dr-now, #module .dr-hud, #module .dr-pad, #module .dr-side, #module .dr-map, #module .dr-cheer')) {
    if (!seen(e) || !back) continue; const r = e.getBoundingClientRect();
    if (r.left < back.right + 4 && r.right > back.left - 4 && r.top < back.bottom + 4 && r.bottom > back.top - 4) o.push(`${e.className} touches the Back button`);
  }
  for (const e of document.querySelectorAll('#module .dr-say p, #module .dr-talk p, #module .dr-prog li, #module .dr-tile, #module .dr-btn')) { if (seen(e) && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) o.push(`${e.className || 'p'} "${e.textContent.trim().slice(0, 18)}" is squashed or cut`); }
  for (const li of document.querySelectorAll('#module .dr-prog li')) { const box = li.parentElement.getBoundingClientRect(), r = li.getBoundingClientRect(); if (r.right > box.right + 1 || r.left < box.left - 1) o.push('a step sticks out of its panel'); }
  return o;
});
const problems = []; const look = async (where) => { for (const x of await layout()) problems.push(`${where}: ${x}`); };

// ---------- a town of the child's own
await p.goto(base + 'index.html');
await click(`[data-band="${band}"]`, 180000);
await click('[data-name]'); await click('[data-go]');
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: 240000 }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForSelector('#build [data-cat="land"]', { timeout: 300000 });
if (town === 'small') await p.evaluate(() => { const { G } = window.__eco.app; for (const [k, item] of [['6,3', 'timber'], ['7,3', 'straw'], ['7,4', 'timber'], ['11,5', 'cohousing'], ['8,5', 'market'], ['11,3', 'school']]) { G.placeAt(k, 'town', { free: true }); G.placeAt(k, item, { free: true }); } });
if (town === 'heart') await p.evaluate(async () => { // Florence's practice town, as the reviewer built it
  const { G } = window.__eco.app; const { seedTo, CLEAR } = await import('./js/game/seed.js'); const { plan, applyPlacements } = await import('./js/sim/planner.js');
  let cells = seedTo(window.__eco.terrain, 'heart'); cells = applyPlacements(cells, plan('heart', CLEAR.heart, { terrain: window.__eco.terrain, cells, numbers: { minutes: 10 } }).placements);
  for (const [k, cell] of cells) { try { if (cell.mark) G.placeAt(k, cell.mark, { free: true }); if (cell.item) G.placeAt(k, cell.item, { free: true }); } catch { /* a tile the game will not take: leave it */ } }
});
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 180000 });
checks.town = await p.evaluate(() => [...window.__eco.app.G.cells].filter(([, c]) => c.item).length);

// ---------- open the module; leave at once with the one way back: nothing is kept and the scene is clean
const sceneNames = () => p.evaluate(() => window.__eco.app.stage.scene.children.map((c) => c.name).filter((x) => /^drone/.test(x)));
await p.evaluate(() => { window.__first = window.__eco.openModule('drone'); });
await stage('intro'); checks.sceneWhileOpen = (await sceneNames()).join(',');
await click('#module .modback'); checks.leftEarly = await p.evaluate(() => window.__first); checks.sceneAfterLeaving = (await sceneNames()).join(',');
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 60000 });

// ---------- 1. fly the delivery by hand (keyboard): turn, through the hoops, to the marker; then fly on freely
await p.evaluate(() => { window.__droneDone = false; window.__drone = window.__eco.openModule('drone').then((r) => { window.__droneDone = true; return r; }); });
await stage('intro'); await shot('intro'); await look('intro');
checks.introSpoken = (await talk()).length > 20;
await click('#module [data-dr-next]'); await stage('hand'); await shot('hand-start'); await look('hand');
checks.handLine = await talk();
const held = new Set(); const hold = async (want) => { for (const k of [...held]) if (!want.includes(k)) { await p.keyboard.up(k); held.delete(k); } for (const k of want) if (!held.has(k)) { await p.keyboard.down(k); held.add(k); } };
let took = 0; let cheered = false; const hudTexts = new Set(); const t0 = Date.now();
while (Date.now() - t0 < LONG) {
  const s = await p.evaluate(() => { const r = document.querySelector('#module .modroot'); const h = document.querySelector('#module [data-dr-hud]'); return { stage: r?.dataset.drStage, dx: +h?.dataset.dx, dz: +h?.dataset.dz, turn: +h?.dataset.turn, txt: h?.textContent || '', cheer: document.querySelector('#module [data-dr-cheer]')?.textContent || '' }; });
  if (s.stage !== 'hand') break;
  if (/^.?Hoop \d/.test(s.txt)) hudTexts.add(s.txt.match(/Hoop \d of \d/)[0]);
  if (s.cheer && !cheered) { cheered = true; await hold([]); checks.cheer = s.cheer; await shot('delivered-on-screen', 300); await look('delivery'); continue; }
  if (Number.isFinite(s.dx)) {
    if (reduce) await hold(Math.abs(s.dx) > 0.3 ? [s.dx > 0 ? 'ArrowRight' : 'ArrowLeft'] : Math.abs(s.dz) > 0.3 ? [s.dz > 0 ? 'ArrowDown' : 'ArrowUp'] : []);
    else await hold(Math.abs(s.turn) > 0.25 ? [s.turn > 0 ? 'ArrowRight' : 'ArrowLeft', ...(Math.abs(s.turn) < 1.2 ? ['ArrowUp'] : [])] : ['ArrowUp']);
    if (took < 2 && Date.now() - t0 > 5000 + took * 12000) { took++; await shot(`flying-by-hand-${took}`, 100); }
  } else await hold(['ArrowUp']);
  await p.waitForTimeout(120);
}
await hold([]); await stage('free'); checks.hoopsSeen = [...hudTexts].sort().join(', ');
checks.freeLine = await talk(); await hold(reduce ? ['ArrowRight'] : ['ArrowUp', 'ArrowRight']); await p.waitForTimeout(2500); await hold([]); await shot('free-flying'); await look('free flying');
checks.freeHud = await p.textContent('#module [data-dr-hud]');
await click('#module [data-dr-next]'); await stage('plan');
checks.padButtons = await p.evaluate(() => document.querySelectorAll('#module [data-dr-pad]').length); // gone after the hand flight

// ---------- 2. the planner
const add = async (id, times = 1) => { for (let i = 0; i < times; i++) await click(`#module [data-dr-add="${id}"]`); };
const steps = () => p.evaluate(() => [...document.querySelectorAll('#module .dr-prog li[data-op]')].map((li) => li.dataset.op + (li.querySelector('.dr-n')?.textContent.match(/\d+/)?.[0] || '')));
// a route for the delivery on screen: fewest tiles, then fewest turns, round the no-fly zone, either parcel first
const routeFor = () => p.evaluate(() => {
  const plan = document.querySelector('#module [data-dr-plan]'); const keys = new Set([...window.__eco.terrain.tiles.keys()]); const block = new Set(plan.dataset.nofly.split(';').filter(Boolean));
  const D = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
  const leg = (from, to) => { // Dijkstra over (tile, direction): cost = tiles * 100 + turns
    const best = new Map(); const open = [{ k: from, d: '', c: 0, path: [] }]; let found = null;
    while (open.length) {
      open.sort((a, b2) => a.c - b2.c); const cur = open.shift(); const id = cur.k + cur.d; if (best.has(id)) continue; best.set(id, cur.c);
      if (cur.k === to) { found = cur; break; }
      const [x, z] = cur.k.split(',').map(Number);
      for (const d in D) { const k = `${x + D[d][0]},${z + D[d][1]}`; if (!keys.has(k) || block.has(k)) continue; open.push({ k, d, c: cur.c + 100 + (d === cur.d ? 0 : 1), path: [...cur.path, d] }); }
    }
    return found;
  };
  const drops = plan.dataset.drops.split(';'); const orders = drops.length > 1 ? [drops, [...drops].reverse()] : [drops]; let top = null;
  for (const order of orders) { let at = plan.dataset.from; let cost = 0; const seq = []; for (const to of order) { const l = leg(at, to); cost += l.c; seq.push(...l.path, 'drop'); at = to; } if (!top || cost < top.cost) top = { cost, seq }; }
  return top.seq;
});
const flyAndWait = async () => { await click('#module [data-dr-fly]'); await stage('auto'); };
const waitVerdict = async () => { await p.waitForSelector('#module [data-dr-next]:not([hidden])', { timeout: LONG }); return talk(); };

async function planDelivery(which) {
  await stage('plan'); await p.waitForSelector('#module [data-dr-plan]'); await shot(`${which}-planner-empty`); await look(`${which} planner, empty`);
  const info = await p.evaluate(() => { const d = document.querySelector('#module [data-dr-plan]').dataset; const map = document.querySelector('#module .dr-map').getBoundingClientRect(), side = document.querySelector('#module .dr-side').getBoundingClientRect(); return { nofly: d.nofly, battery: d.battery, drops: d.drops, oneColumn: side.top >= map.bottom - 1, mapWidth: Math.round(map.width), say: document.querySelector('#module .dr-say p').textContent, key: [...document.querySelectorAll('#module .dr-mapsvg text')].map((t) => t.textContent).filter((t) => /Start|Parcel|flown|steps|nesting/.test(t)) }; });
  checks[`${which}Say`] = info.say; checks[`${which}Key`] = info.key; checks[`${which}Extras`] = { nofly: info.nofly, battery: info.battery };
  checks.oneColumn = info.oneColumn; checks.mapWidth = info.mapWidth;
  if (which === 'first') {
    // the commonest first try: flying with no "Go up". The drone stays on its pad and Florence says how to put the step in.
    await add('w', 2); await flyAndWait(); checks.stoppedLine = await waitVerdict(); await shot('stopped-on-the-pad'); await look('stopped on the pad');
    await click('#module [data-dr-next]'); await stage('plan');
    checks.stopMarked = await p.evaluate(() => !!document.querySelector('#module .dr-prog li.stop'));
    // choose step 1, then "Go up": the new step goes in before it and nothing is lost
    await click('#module [data-dr-pick="0"]'); checks.insertNote = await p.textContent('#module .dr-note'); await add('up'); checks.inserted = await steps();
    checks.verdictGone = !/still on its landing pad/.test(await p.textContent('#module .dr-say p')); // the old verdict does not stay after an edit
    await click('#module [data-dr-mv="-1"]'); checks.movedUp = await steps(); await click('#module [data-dr-mv="1"]'); checks.movedBack = await steps();
    await shot('step-put-in-before'); await look('a step chosen');
    await click('#module [data-dr-pick="1"]'); // let go of it: tiles go at the end again
    // "+" keeps the keyboard focus on "+"
    await p.focus('#module [data-dr-more="1"]'); await p.keyboard.press('Enter'); checks.focusAfterPlus = await p.evaluate(() => Object.keys(document.activeElement?.dataset || {}).join(','));
    await p.keyboard.press('Enter'); checks.plusTwice = await steps();
    await p.focus('#module [data-dr-less="1"]'); await p.keyboard.press('Enter'); checks.focusAfterMinus = await p.evaluate(() => Object.keys(document.activeElement?.dataset || {}).join(','));
    // twelve steps: the tiles and the Fly button stay on the screen, only the list scrolls, and the limit is said
    await click('#module [data-dr-clear]'); for (let i = 0; i < 6; i++) { await add('up'); await add('drop'); }
    checks.twelve = await p.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect(); const list = document.querySelector('#module .dr-prog'); const say = document.querySelector('#module .dr-say p');
      return { steps: +document.querySelector('#module [data-dr-plan]').dataset.steps, flyBottom: Math.round(r('#module [data-dr-fly]').bottom), tilesBottom: Math.round(r('#module .dr-pal').bottom), screen: innerHeight, listScrolls: list.scrollHeight > list.clientHeight, listHeight: list.clientHeight,
        lastStepInView: r('#module .dr-prog li:last-child').bottom <= list.getBoundingClientRect().bottom + 2, sayWhole: say.scrollHeight <= say.clientHeight + 1, note: document.querySelector('#module .dr-note').textContent, tilesGrey: [...document.querySelectorAll('#module [data-dr-add]')].every((x) => x.disabled), pageScroll: document.querySelector('#module .dr-plan').scrollHeight - document.querySelector('#module .dr-plan').clientHeight };
    });
    await shot('twelve-steps'); await look('twelve steps'); await click('#module [data-dr-clear]');
    // a tap on the map: a square straight along from the blue dot adds the step that flies there
    await add('up');
    const tap = await p.evaluate(() => { const plan = document.querySelector('#module [data-dr-plan]'); const keys = window.__eco.terrain.tiles; const [fx, fz] = plan.dataset.from.split(',').map(Number); const dir = [[0, -1], [-1, 0], [1, 0], [0, 1]].find(([dx, dz]) => keys.has(`${fx + dx * 2},${fz + dz * 2}`) && keys.has(`${fx + dx},${fz + dz}`)); const svg = document.querySelector('#module .dr-mapsvg svg'); const m = svg.getScreenCTM(); const pt = svg.createSVGPoint(); pt.x = 22 + (fx + dir[0] * 2) * 30 + 15; pt.y = 22 + (fz + dir[1] * 2) * 30 + 15; const q = pt.matrixTransform(m); return { x: q.x, y: q.y }; });
    if (touch) await p.touchscreen.tap(tap.x, tap.y); else await p.mouse.click(tap.x, tap.y);
    checks.mapTap = await steps(); await click('#module [data-dr-clear]');
    // a flight that stops short: the first hint says which way, not how far
    if (E.QUICK !== '1') {
      const r = await routeFor(); await add('up'); await add(r[0]); await flyAndWait(); checks.hintFirst = await waitVerdict(); await shot('stopped-short'); await look('stopped short');
      await click('#module [data-dr-next]'); await stage('plan'); await shot('planner-after-a-miss'); await click('#module [data-dr-clear]');
    }
  }
  const route = await routeFor(); await add('up'); for (const s of route) await add(s);
  checks[`${which}Steps`] = await steps(); checks[`${which}Meter`] = await p.evaluate(() => document.querySelector('#module .dr-meter')?.innerText.replace(/\s+/g, ' ') || '');
  await shot(`${which}-planner-route`); await look(`${which} planner, route`);
  await flyAndWait(); await look(`${which} flight`);
  // the delivery is shown on screen: the banner, while the camera looks at the doorstep
  let saw = false; const t1 = Date.now();
  while (Date.now() - t1 < LONG) { const s = await p.evaluate(() => ({ c: document.querySelector('#module [data-dr-cheer]')?.textContent || '', done: !!document.querySelector('#module [data-dr-compare]') })); if (s.c && !saw) { saw = true; await shot(`${which}-auto-delivered`, 200); await look(`${which} auto delivery`); } if (s.done) break; if (!saw && Date.now() - t1 > 4000 && n < 40 && !checks[`${which}Mid`]) { checks[`${which}Mid`] = true; await shot(`${which}-flying-the-steps`, 100); } await p.waitForTimeout(200); }
  checks[`${which}AutoCheer`] = saw;
  await p.waitForSelector('#module [data-dr-compare]', { timeout: LONG });
  checks[`${which}Compare`] = await p.evaluate(() => [...document.querySelectorAll('#module [data-dr-compare] li')].map((li) => li.textContent));
  await click('#module [data-dr-choose]'); checks[`${which}Reply`] = await p.textContent('#module .dr-reply'); await shot(`${which}-compare`); await look(`${which} compare`);
}

await planDelivery('first');
await click('#module [data-dr-act="next"]');
// ---------- 3. the second delivery: planned from the map alone
await stage('order'); checks.orderLine = await talk(); await shot('second-order'); await look('second order');
await click('#module [data-dr-next]');
await planDelivery('second');
await click('#module [data-dr-act="finish"]');

// ---------- 4. the record and what is left in the town
await p.waitForSelector('#modal:not(.hide) [data-act="ok"]', { timeout: 120000 }); await shot('record-card');
checks.card = await p.evaluate(() => document.querySelector('#modal').innerText.replace(/\s+/g, ' ').slice(0, 900));
await click('#modal:not(.hide) [data-act="ok"]');
await p.waitForFunction(() => window.__droneDone, null, { timeout: 120000 });
const result = await p.evaluate(() => window.__drone);
checks.finished = result?.finished; checks.title = result?.record?.made.title; checks.lines = result?.record?.made.lines; checks.practised = result?.record?.practised;
checks.picture = /^<svg/.test(result?.record?.made.picture || '') ? `${result.record.made.picture.length} characters of SVG` : 'none';
checks.townKind = result?.town?.kind; checks.townPts = result?.town?.data?.pts?.length;
checks.saved = await p.evaluate(() => { const m = window.__eco.app.G.modules?.drone; return { done: m?.done, times: m?.times, state: m?.state, town: m?.town?.kind }; });
await p.waitForTimeout(3000);
checks.sceneAfter = (await sceneNames()).join(','); // only the route that keeps flying
checks.moduleLayerGone = await p.evaluate(() => !document.getElementById('module') && !document.documentElement.dataset.module);
// the town result holds the drone itself (not only an empty group), the dashed line and a pad at each end; and the drone is big enough to see
const inTown = () => p.evaluate(() => {
  const root = window.__eco.app.stage.scene.children.find((c) => c.name === 'drone-route'); if (!root) return null; const drone = root.children.find((c) => c.name === 'drone-route-drone');
  let meshes = 0; drone?.traverse((o) => { if (o.isMesh) meshes++; });
  const cam = window.__eco.app.stage.camera; let px = 0; if (drone) { const a = drone.position.clone().project(cam); const b2 = drone.position.clone(); b2.x += 4 * drone.scale.x; b2.project(cam); px = Math.round(Math.abs(b2.x - a.x) / 2 * innerWidth * 2); }
  return { drone: !!drone, droneMeshes: meshes, parent: drone?.parent === root, scale: drone?.scale.x, at: drone ? [drone.position.x, drone.position.y, drone.position.z].map((v) => Math.round(v * 10) / 10) : null, pads: root.children.filter((c) => c.name === 'drone-route-pad').length, dashes: root.children.find((c) => c.name === 'drone-route-line')?.children.length || 0, widthOnScreen: px };
});
checks.inTown = await inTown(); await shot('route-in-the-town-1', 1500);
await p.waitForTimeout(4000); const later = await inTown(); checks.droneMoves = JSON.stringify(later?.at) !== JSON.stringify(checks.inTown?.at); await shot('route-in-the-town-2', 500);
if (result?.record?.made.picture) fs.writeFileSync(`${out}/${tag}-take-home.svg`, result.record.made.picture);

// ---------- 5. play again: a different pair of places
await p.evaluate(() => { window.__again = window.__eco.openModule('drone'); });
await stage('intro'); checks.againLine = await talk(); await shot('play-again-intro');
await click('#module .modback'); await p.evaluate(() => window.__again); await p.waitForTimeout(1500);
checks.routeBackAfterLeaving = (await sceneNames()).join(',');

const narrow = W <= 900 || H > W; const t12 = checks.twelve || {};
const must = {
  finished: checks.finished === true && checks.title === 'My drone route' && checks.practised?.length >= 2 && checks.townKind === 'drone-route' && checks.saved.done === true && checks.saved.state?.done === true && checks.saved.state?.round === 1,
  leavingKeepsNothing: checks.leftEarly?.finished !== true && checks.sceneAfterLeaving === '',
  cleanScene: checks.sceneAfter === 'drone-route' && checks.moduleLayerGone && checks.routeBackAfterLeaving === 'drone-route',
  droneInTown: !!checks.inTown?.drone && checks.inTown.parent && checks.inTown.droneMeshes >= 10 && checks.inTown.pads >= 2 && checks.inTown.dashes >= 4 && checks.inTown.widthOnScreen >= 14 && (reduce ? !checks.droneMoves : checks.droneMoves),
  stoppedOnPad: /still on its landing pad/.test(checks.stoppedLine) && checks.stopMarked,
  stepInsertedBefore: checks.inserted?.[0] === 'up' && checks.inserted?.[1] === 'gow2' && checks.inserted.length === 2 && /before step 2/.test(checks.insertNote.replace('step 1', 'step 2')) && checks.verdictGone,
  stepMoves: checks.movedUp?.[0] === 'gow2' && checks.movedUp?.[1] === 'up' && checks.movedBack?.[0] === 'up',
  plusKeepsFocus: checks.focusAfterPlus === 'drMore' && checks.plusTwice?.[1] === 'gow4' && checks.focusAfterMinus === 'drLess',
  oneColumnWhenNarrow: checks.oneColumn === narrow && (!narrow || checks.mapWidth >= W - 40),
  twelveStepsFit: t12.steps === 12 && t12.flyBottom <= t12.screen && t12.tilesBottom <= t12.screen && t12.listScrolls && t12.listHeight >= 90 && t12.lastStepInView && t12.sayWhole && /That is all 12 steps/.test(t12.note) && t12.tilesGrey && t12.pageScroll <= 0,
  mapTapAddsAStep: checks.mapTap?.length === 2 && /^go[nesw]2$/.test(checks.mapTap[1]),
  hintSaysWhichWayOnly: E.QUICK === '1' || (/it still has to go (north|south|east|west)/.test(checks.hintFirst) && /Count the squares/.test(checks.hintFirst) && !/\d+ tiles? (north|south|east|west)/.test(checks.hintFirst)),
  handFlight: /hoops/.test(checks.handLine) && /Hoop 1 of/.test(checks.hoopsSeen) && /^Delivered to /.test((checks.cheer || '').replace(/^✓/, '')) && /Free flying/.test(checks.freeHud) && /Fly on for as long as you like/.test(checks.freeLine) && checks.padButtons === 0,
  deliveryShown: checks.firstAutoCheer && checks.secondAutoCheer,
  secondDelivery: /new order/.test(checks.orderLine) && checks.secondCompare?.some((l) => /from the map alone/.test(l)) && checks.lines?.some((l) => /^Then to /.test(l)),
  seniorExtras: band !== 'senior' || (!!checks.firstExtras.battery && !!checks.secondExtras.battery && !!checks.secondExtras.nofly && /Battery/.test(checks.secondMeter) && /fewest/i.test(checks.secondMeter) && checks.secondKey.some((t) => /nesting/.test(t)) && checks.lines.some((l) => /^Fewest tiles possible/.test(l))),
  juniorPlain: band !== 'junior' || (!checks.firstExtras.battery && !checks.secondExtras.nofly && checks.firstMeter === ''),
  nothingClipped: problems.length === 0,
  quiet: !errors.length && !outside.length,
};
const ok = Object.values(must).every(Boolean);
console.log(JSON.stringify({ ok, band, reduce, size: `${W}x${H}`, town, large, touch, must, problems, checks, errors, outside, shots }, null, 2));
await b.close();
process.exit(ok ? 0 : 1);
