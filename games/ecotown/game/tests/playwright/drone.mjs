// Browser run of "Drones at work" (js/modules/drone): the mission map and the six missions, with screenshots.
// Usage: node tests/playwright/drone.mjs [baseUrl] [outDir]      (serve games/ecotown/game first)
//   BAND=senior    ages 13-17. Default: junior.
//   REDUCE=0       play without reduced motion. Default: reduced motion.
//   SIZE=768x1024  the window. Default 1280x800.
//   TOWN=empty|small   the child's town. Default small.
//   TEXT=large     large text.   TOUCH=1  a touch screen (taps; flying is still driven by keys).
//   MISSIONS=ground,hand,...   which missions to play (the ones before the first are marked done first). Default: all six.
// It starts a town, opens the module, checks the map, leaves part way through a mission and comes back (the finished
// missions are kept), plays the missions, and, when all six are played, checks the record, "Talk it over", the break
// card, the route left in the town, that everything the module added is gone, and that nothing was logged.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8891/', out = 'shots-drone'] = process.argv.slice(2);
const E = process.env; const band = E.BAND === 'senior' ? 'senior' : 'junior'; const reduce = E.REDUCE !== '0'; const town = E.TOWN || 'small'; const large = E.TEXT === 'large'; const touch = E.TOUCH === '1';
const [W, H] = (E.SIZE || '1280x800').split('x').map(Number);
const IDS = ['ground', 'hand', 'delivery', 'survey', 'inspect', 'rescue'];
const play = (E.MISSIONS || IDS.join(',')).split(',').filter((x) => IDS.includes(x));
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const cx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, reducedMotion: reduce ? 'reduce' : 'no-preference' });
const p = await cx.newPage();
await p.addInitScript(([r, t]) => { if (!localStorage.getItem('ecotown.prefs')) localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce: r, ...(t ? { text: 'large' } : {}) })); }, [reduce, large]);
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
await p.addLocatorHandler(p.locator('#episode [data-skip]'), async (skip) => { await skip.click(); });
const tag = `${band}-${W}x${H}-${town}${reduce ? '' : '-motion'}${large ? '-large' : ''}${touch ? '-touch' : ''}`; let n = 0; const shots = [];
const shot = async (name, wait = 600) => { await p.waitForTimeout(wait); const f = `${out}/${tag}-${String(++n).padStart(2, '0')}-${name}.png`; try { await p.screenshot({ path: f, timeout: 180000 }); shots.push(f); } catch { shots.push(`(no picture: ${name})`); } };
const click = async (sel, t = 180000) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); if (touch) await p.tap(sel, { timeout: t }); else await p.click(sel, { timeout: t }); };
const checks = {}; const LONG = 1200000; const T = { };
const stage = (s) => p.waitForSelector(`#module .modroot[data-dr-stage="${s}"]`, { timeout: LONG });
const talk = () => p.evaluate(() => document.querySelector('#module .dr-talk:not([hidden]) p')?.textContent || '');
const say = () => p.evaluate(() => document.querySelector('#module .dk-panel .dr-say p')?.textContent || '');
const next = () => click('#module [data-dr-next]:not([hidden])', LONG);
// nothing the module draws may run off the screen or touch the loader's Back button; no text is cut
const layout = () => p.evaluate(() => {
  const o = []; const vw = innerWidth, vh = innerHeight; if (document.documentElement.scrollWidth > vw + 1) o.push('the page scrolls sideways');
  const seen = (e) => !e.hidden && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]');
  const boxes = '#module .dr-talk, #module .dr-say, #module .dk-hub, #module .dk-card, #module .dk-main, #module .dk-side, #module .df-hud, #module .df-pad, #module .dr-hud, #module .dr-pad, #module .dr-now, #module .dr-card, #module .dr-side, #module .dr-map, #module .dr-cheer';
  for (const e of document.querySelectorAll(`${boxes}, #module .dr-btn, #module .df-pad button`)) {
    if (!seen(e)) continue; const r = e.getBoundingClientRect(); const name = `${(e.className || e.tagName).toString().split(' ')[0]} "${(e.textContent || '').trim().slice(0, 18)}"`;
    const scroller = e.closest('.dk-main, .dk-side, .dk-hub, .dk-card, .dr-card, .dr-prog');
    if (r.right > vw + 1 || r.left < -1) o.push(`${name} runs off the side`);
    if ((r.bottom > vh + 1 || r.top < -1) && !scroller) o.push(`${name} runs off the top or bottom`);
  }
  const back = document.querySelector('#module .modback')?.getBoundingClientRect();
  for (const e of document.querySelectorAll(boxes)) { if (!seen(e) || !back) continue; const r = e.getBoundingClientRect(); if (r.left < back.right + 4 && r.right > back.left - 4 && r.top < back.bottom + 4 && r.bottom > back.top - 4) o.push(`${e.className} touches the Back button`); }
  for (const e of document.querySelectorAll('#module .dr-say p, #module .dr-talk p, #module .dr-btn, #module .dk-stop button')) { if (seen(e) && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2)) o.push(`"${e.textContent.trim().slice(0, 24)}" is squashed or cut`); }
  return o;
});
const problems = []; const look = async (where) => { for (const x of await layout()) problems.push(`${where}: ${x}`); };

// ---------- a town of the child's own
await p.goto(base + 'index.html', { timeout: 300000 });
await click(`[data-band="${band}"]`, 300000);
await click('[data-name]'); await click('[data-go]');
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: 300000 }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForSelector('#build [data-cat="land"]', { timeout: 300000 });
if (town === 'small') await p.evaluate(() => { const { G } = window.__eco.app; for (const [k, item] of [['6,3', 'timber'], ['7,3', 'straw'], ['7,4', 'timber'], ['11,5', 'cohousing'], ['8,5', 'market'], ['11,3', 'school']]) { G.placeAt(k, 'town', { free: true }); G.placeAt(k, item, { free: true }); } });
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 300000 });
// the missions before the first one played are marked done (as if played earlier)
const before = IDS.slice(0, IDS.indexOf(play[0]));
if (before.length) await p.evaluate((done) => { const { G } = window.__eco.app; G.modules = { ...(G.modules || {}), drone: { state: { v: 3, done, sum: {} } } }; }, before);
const sceneNames = () => p.evaluate(() => window.__eco.app.stage.scene.children.map((c) => c.name).filter((x) => /^drone/.test(x)));
const open = async () => { await p.evaluate(() => { window.__droneDone = false; window.__drone = window.__eco.openModule('drone').then((r) => { window.__droneDone = true; return r; }); }); await p.waitForSelector('#module [data-dk-hub]', { timeout: LONG }); };

// ---------- the mission map
await open(); await shot('mission-map'); await look('mission map');
checks.map = await p.evaluate(() => [...document.querySelectorAll('#module .dk-stop button')].map((x) => `${x.disabled ? 'shut' : 'open'}:${x.querySelector('em').textContent}`));
checks.mapOpenInOrder = checks.map.filter((x) => x.startsWith('open')).length === before.length + 1;

// ---------- keys used while flying: held until let go
const held = new Set(); const hold = async (want) => { for (const k of [...held]) if (!want.includes(k)) { await p.keyboard.up(k); held.delete(k); } for (const k of want) if (!held.has(k)) { await p.keyboard.down(k); held.add(k); } };
const hud = () => p.evaluate(() => { const h = document.querySelector('#module .df-hud'); const d = h?.dataset || {}; return { phase: d.dfPhase, dx: +d.dx, dz: +d.dz, dy: +d.dy, vy: +d.vy, stage: document.querySelector('#module .modroot')?.dataset.drStage, talk: !!document.querySelector('#module [data-dr-next]:not([hidden])'), hidden: h?.hidden !== false }; });
// Steer by the read-outs until the talk button shows (a phase ended) or the stage leaves `until`.
async function steer(label, until) {
  const t0 = Date.now(); let pics = 0;
  while (Date.now() - t0 < LONG) {
    const s = await hud(); if (s.talk || !until(s)) break;
    if (s.hidden) { await hold([]); await p.waitForTimeout(200); continue; }
    const keys = [];
    if (s.dx > 0.25) keys.push('ArrowRight'); else if (s.dx < -0.25) keys.push('ArrowLeft');
    if (s.dz > 0.25) keys.push('ArrowDown'); else if (s.dz < -0.25) keys.push('ArrowUp');
    if (s.phase === 'land') { if (s.dy < -0.3 && !(s.vy > 0.9)) keys.push('Shift'); }
    else if (s.dy > 0.6) keys.push('Space'); else if (s.dy < -0.6) keys.push('Shift');
    await hold(keys);
    if (pics < 1 && Date.now() - t0 > 6000) { pics++; await shot(`${label}-flying`, 50); await look(label); }
    await p.waitForTimeout(110);
  }
  await hold([]);
}
const sideDone = async (sel = '#module [data-k]') => { await click(sel, LONG); };

// ---------- each mission
async function openMission(id) {
  await click(`#module [data-dk-hub] .dk-row [data-k="${id}"], #module [data-dk-hub] [data-k="${id}"]`);
  await p.waitForSelector(`#module [data-dk-open="${id}"]`, { timeout: LONG }); await shot(`${id}-opening`); await look(`${id} opening`);
  checks[`${id}Opening`] = await p.evaluate(() => document.querySelector('#module .dk-job')?.textContent || '');
  await click('#module [data-dk-open] [data-k="go"]');
}
async function closeMission(id, last) {
  await p.waitForSelector(`#module [data-dk-close="${id}"]`, { timeout: LONG }); await shot(`${id}-done`); await look(`${id} done`);
  checks[`${id}Closing`] = await p.evaluate(() => document.querySelector('#module [data-dk-close]').innerText.replace(/\s+/g, ' ').slice(0, 400));
  checks[`${id}Saved`] = await p.evaluate((x) => window.__eco.app.G.modules?.drone?.state?.done?.includes(x), id);
  if (last) await click('#module [data-dk-close] [data-k="finish"]');
  else { await click('#module [data-dk-close] [data-k="map"]'); await p.waitForSelector('#module [data-dk-hub]', { timeout: LONG }); }
}

const M = {
  async ground() {
    const data = await p.evaluate(async (band) => { const m = await import('./js/modules/drone/m1-ground.js'); return { days: m.DAYS, plans: m.plansFor(band === 'junior') }; }, band);
    for (const [di, day] of data.days.entries()) {
      await p.waitForSelector('#module [data-dk-panel="ground"] .dk-checks', { timeout: LONG });
      for (const c of ['battery', 'props', 'weather', 'area']) {
        await click(`#module .dk-side [data-check="${c}"]`);
        const bad = day.state[c] !== 'ok';
        if (di === 1 && c === 'props') { await click('#module [data-mark="ok"]'); checks.groundHint = await p.textContent('#module [data-dk-reply]'); await shot('ground-look-again'); }
        await click(`#module [data-mark="${bad ? 'problem' : 'ok'}"]`);
        if (c === 'area' && di === 0) checks.groundFocusAfterFourth = await p.evaluate(() => Object.keys(document.activeElement?.dataset || {}).join(','));
      }
      for (const f of await p.$$eval('#module [data-fix]', (x) => x.map((e) => e.dataset.fix))) await click(`#module [data-fix="${f}"]`);
      if (di === 0) { await shot('ground-checked'); await look('ground checks'); }
      const ans = day.state.weather === 'gale' ? 'stay' : 'fly';
      if (di === 2) checks.groundTopLineBefore = await say();
      if (di === 2) { await click('#module [data-day="fly"]'); checks.groundGale = await p.textContent('#module [data-dk-reply]'); checks.groundTopLine = await say(); await shot('ground-gale'); }
      await click(`#module [data-day="${ans}"]`); await click('#module .dk-side [data-k="next"]');
    }
    for (const [pi, plan] of data.plans.entries()) {
      await p.waitForSelector(`#module .dk-steps li:nth-child(${pi + 1}).now`, { timeout: LONG });
      if (pi === 0) { await shot('ground-map'); await look('ground map'); }
      if (plan.id === 'airfield') { await shot('ground-airfield'); checks.groundAirfield = true; }
      if (plan.id === 'high') { await click('#module [data-say="fly"]'); checks.groundHighHint = await p.textContent('#module [data-dk-reply]'); await shot('ground-high-side-view'); }
      await click(`#module [data-say="${plan.answer}"]`);
      if (plan.answer === 'change') await click(`#module [data-fixid="${plan.fixes[0].id}"]`);
      await click('#module .dk-side [data-k="next"]');
    }
  },
  async hand() {
    await next(); await stage('m2-takeoff'); await shot('hand-takeoff'); checks.handTakeoff = await p.textContent('#module .df-task');
    await steer('hand-takeoff', (s) => s.phase === 'takeoff' || !s.phase);
    for (const r of [0, 1]) { await stage(`m2-hover${r}`); await next(); await steer(`hand-hover${r}`, (s) => s.phase !== 'hoops'); }
    await stage('m2-hoops'); await next(); await steer('hand-hoops', (s) => s.phase !== 'land');
    await stage('m2-land'); await next(); await steer('hand-landing', () => true);
    checks.handLanded = await talk(); await shot('hand-landed'); await next();
  },
  async delivery() {
    await next(); await stage('hand');
    const t0 = Date.now();
    while (Date.now() - t0 < LONG) {
      const s = await p.evaluate(() => { const h = document.querySelector('#module [data-dr-hud]'); return { stage: document.querySelector('#module .modroot')?.dataset.drStage, dx: +h?.dataset.dx, dz: +h?.dataset.dz, turn: +h?.dataset.turn }; });
      if (s.stage !== 'hand') break;
      if (Number.isFinite(s.dx)) await hold(Math.abs(s.dx) > 0.3 ? [s.dx > 0 ? 'ArrowRight' : 'ArrowLeft'] : Math.abs(s.dz) > 0.3 ? [s.dz > 0 ? 'ArrowDown' : 'ArrowUp'] : []);
      else await hold(['ArrowUp']);
      await p.waitForTimeout(120);
    }
    await hold([]); await stage('free'); await shot('delivery-free-flying'); await next();
    for (const which of ['first', 'second']) {
      await stage('plan'); await p.waitForSelector('#module [data-dr-plan]'); if (which === 'first') { await shot('delivery-planner'); await look('delivery planner'); }
      const route = await p.evaluate(() => {
        const plan = document.querySelector('#module [data-dr-plan]'); const keys = new Set([...window.__eco.terrain.tiles.keys()]); const block = new Set(plan.dataset.nofly.split(';').filter(Boolean)); const D = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
        const leg = (from, to) => { const best = new Set(); const open2 = [{ k: from, d: '', c: 0, path: [] }]; while (open2.length) { open2.sort((a, b2) => a.c - b2.c); const cur = open2.shift(); const id = cur.k + cur.d; if (best.has(id)) continue; best.add(id); if (cur.k === to) return cur; const [x, z] = cur.k.split(',').map(Number); for (const d in D) { const k = `${x + D[d][0]},${z + D[d][1]}`; if (!keys.has(k) || block.has(k)) continue; open2.push({ k, d, c: cur.c + 100 + (d === cur.d ? 0 : 1), path: [...cur.path, d] }); } } return null; };
        const drops = plan.dataset.drops.split(';'); const orders = drops.length > 1 ? [drops, [...drops].reverse()] : [drops]; let top = null;
        for (const order of orders) { let at = plan.dataset.from; let cost = 0; const seq = []; for (const to of order) { const l = leg(at, to); cost += l.c; seq.push(...l.path, 'drop'); at = to; } if (!top || cost < top.cost) top = { cost, seq }; }
        return top.seq;
      });
      await click('#module [data-dr-add="up"]'); for (const s of route) await click(`#module [data-dr-add="${s}"]`);
      await click('#module [data-dr-fly]'); await stage('auto');
      await p.waitForSelector('#module [data-dr-compare]', { timeout: LONG }); await click('#module [data-dr-choose]'); await shot(`delivery-${which}-compare`); await look(`delivery ${which} compare`);
      if (which === 'first') { await click('#module [data-dr-act="next"]'); await stage('order'); await next(); } else await click('#module [data-dr-act="finish"]');
    }
  },
  async survey() {
    await p.waitForSelector('#module [data-dk-panel="survey"] [data-fly]', { timeout: LONG }); await shot('survey-plan-gaps'); await look('survey plan');
    await click('#module [data-fly]'); await p.waitForSelector('#module [data-dk-reply]', { timeout: LONG }); checks.surveyGaps = await p.textContent('#module [data-dk-reply]'); await shot('survey-flown-gaps');
    for (let i = 0; i < 4; i++) await click('#module [data-gap="-1"]');
    await click('#module [data-fly]'); await p.waitForSelector('#module .dk-side [data-k="next"]', { timeout: LONG }); await shot('survey-joined'); await click('#module .dk-side [data-k="next"]');
    await click('#module [data-fly]'); await p.waitForSelector('#module [data-dk-reply]', { timeout: LONG }); checks.surveyBattery = await p.textContent('#module [data-dk-reply]'); await shot('survey-battery');
    await click('#module [data-dir="ew"]');
    if (band === 'senior') { await click('#module [data-fly]'); await p.waitForSelector('#module [data-dk-reply]', { timeout: LONG }); checks.surveyFront = await p.textContent('#module [data-dk-reply]'); await click('#module [data-along="-1"]'); }
    await click('#module [data-fly]'); await p.waitForSelector('#module .dk-side [data-k="next"]', { timeout: LONG }); await shot('survey-farm-joined'); await click('#module .dk-side [data-k="next"]');
    await p.waitForSelector('#module .dk-farm svg'); await shot('survey-map'); await look('survey map');
    await p.click('#module .dk-farm rect[data-x="12"][data-z="7"]'); checks.surveyMiss = await p.textContent('#module [data-dk-reply]');
    await p.click('#module .dk-farm rect[data-x="2"][data-z="2"]');
    await click('#module [data-view="health"]'); await shot('survey-health-view'); await p.click('#module .dk-farm rect[data-x="12"][data-z="2"]');
    if (band === 'senior') { const v = await p.evaluate(async () => (await import('./js/modules/drone/m4-survey.js')).sickShare()); await click(`#module [data-share="${v}"]`); }
    await click('#module [data-advice="target"]'); await shot('survey-advice'); await click('#module [data-k="done"]');
  },
  async inspect() {
    for (const [part, damaged] of [['turbine', 't2'], ['bridge', 'b3']]) {
      await stage(`m5-${part}`); await shot(`inspect-${part}-start`); await next();
      await steer(`inspect-${part}`, (s) => s.phase === 'inspect' || !s.phase);
      checks[`inspect${part}`] = await talk(); await next();
      await p.waitForSelector('#module [data-dk-panel="inspect-photos"]', { timeout: LONG }); await shot(`inspect-${part}-photos`); await look(`inspect ${part} photos`);
      const wrong = part === 'turbine' ? 't3' : 'b1'; await click(`#module [data-photo="${wrong}"]`); checks[`inspect${part}Wrong`] = await p.textContent('#module [data-dk-reply]');
      await click(`#module [data-photo="${damaged}"]`);
      if (band === 'senior') { const act = part === 'turbine' ? 'now' : 'watch'; await click(`#module [data-act="${act}"]`); }
      await shot(`inspect-${part}-found`); await click('#module [data-dk-panel="inspect-photos"] [data-k="next"]');
    }
  },
  async rescue() {
    await p.waitForSelector('#module [data-sensor]', { timeout: LONG }); await shot('rescue-start'); await look('rescue start');
    await click('#module [data-sensor="camera"]'); checks.rescueCamera = await p.textContent('#module [data-dk-reply]'); await shot('rescue-wrong-camera');
    await click('#module [data-sensor="heat"]'); await click('#module .dk-side [data-k="next"]');
    const scenes = band === 'senior' ? 2 : 1;
    for (let si = 0; si < scenes; si++) {
      await click(`#module [data-pattern="${si ? 'lines' : 'square'}"]`);
      for (;;) {
        await p.waitForSelector('#module [data-kind], #module .dk-times', { timeout: LONG });
        if (await p.$('#module .dk-times')) break;
        const kind = await p.evaluate(() => { const g = document.querySelector('#module .dk-side svg g')?.innerHTML || ''; return g.includes('circle') ? 'person' : 'animal'; });
        await shot(`rescue-${si}-warm-${kind}`); await click(`#module [data-kind="${kind}"]`); await click('#module .dk-side [data-k="go"]');
      }
      checks[`rescueTimes${si}`] = await p.textContent('#module .dk-times'); await shot(`rescue-${si}-times`); await click('#module .dk-side [data-k="go"]');
      await p.waitForSelector('#module [data-step]', { timeout: LONG }); await shot(`rescue-${si}-guide`); await look('rescue guide');
      if (si === 0) { await click('#module [data-step="s"]'); checks.rescueRiver = await p.evaluate(() => document.querySelector('#module [data-dk-reply]')?.textContent || ''); }
      const way = await p.evaluate(async (si) => { const m = await import('./js/modules/drone/m6-rescue.js'); const sc = m.SCENES[si]; const w = m.walkerOf(sc); const prev = new Map(); const q = [sc.team]; prev.set(`${sc.team.x},${sc.team.z}`, null);
        for (let i = 0; i < q.length; i++) { const c = q[i]; for (const [d, [dx, dz]] of Object.entries(m.STEPS)) { const x = c.x + dx, z = c.z + dz; const k = `${x},${z}`; if (!m.passable(x, z, sc) || prev.has(k)) continue; prev.set(k, [`${c.x},${c.z}`, d]); q.push({ x, z }); } }
        const out = []; let k = `${w.x},${w.z}`; while (prev.get(k)) { const [from, d] = prev.get(k); out.unshift(d); k = from; } return out; }, si);
      for (const d of way) await click(`#module [data-step="${d}"]`);
      await shot(`rescue-${si}-reached`); await click('#module [data-k="done"]');
    }
  },
};

// ---------- leave part way through the first mission played, and come back: finished missions are kept
await openMission(play[0]);
await p.waitForTimeout(1500); await click('#module .modback'); await p.evaluate(() => window.__drone); await p.waitForTimeout(800);
checks.sceneAfterLeaving = (await sceneNames()).join(',');
checks.keptAfterLeaving = await p.evaluate(() => window.__eco.app.G.modules?.drone?.state?.done || []);
await open();
for (const [i, id] of play.entries()) {
  if (i > 0 || true) { if (!(await p.$(`#module [data-dk-open="${id}"]`))) await openMission(id); }
  T[id] = Date.now(); await M[id](); T[id] = Math.round((Date.now() - T[id]) / 1000);
  await closeMission(id, id === 'rescue' && play.length + before.length === 6);
}

// ---------- the record, the talk and the break; the route left in the town
const all = play.includes('rescue') && play.length + before.length === 6;
if (all) {
  await p.waitForSelector('#modal:not(.hide) [data-act="ok"]', { timeout: LONG }); await shot('record-card');
  checks.card = await p.evaluate(() => document.querySelector('#modal').innerText.replace(/\s+/g, ' ').slice(0, 1200));
  await click('#modal:not(.hide) [data-act="ok"]');
  // "Jobs that use this" (shared, js/ui/talk.js), then "Talk it over", then the break card
  await p.waitForSelector('#modal:not(.hide) [data-act="go"]', { timeout: LONG });
  if (await p.$('#modal:not(.hide) .jobs')) { await shot('jobs-that-use-this'); checks.jobs = true; await click('#modal:not(.hide) .jobs ~ * [data-act="go"], #modal:not(.hide) [data-act="go"]'); await p.waitForSelector('#modal:not(.hide) .talkqs', { timeout: LONG }); }
  await click('#modal:not(.hide) [data-act="go"]', LONG); await shot('talk-it-over-done');
  await click('#modal:not(.hide) [data-act="stay"]', LONG);
  await p.waitForFunction(() => window.__droneDone, null, { timeout: LONG });
  const result = await p.evaluate(() => window.__drone);
  checks.finished = result?.finished; checks.title = result?.record?.made.title; checks.lines = result?.record?.made.lines; checks.practised = result?.record?.practised; checks.townKind = result?.town?.kind;
  checks.picture = /^<svg/.test(result?.record?.made.picture || '') ? result.record.made.picture.length : 0;
  if (result?.record?.made.picture) fs.writeFileSync(`${out}/${tag}-take-home.svg`, result.record.made.picture);
  await p.waitForTimeout(3000); checks.sceneAfter = (await sceneNames()).join(','); await shot('town-after', 1500);
  checks.moduleLayerGone = await p.evaluate(() => !document.getElementById('module') && !document.documentElement.dataset.module);
}

const must = {
  mapOpenInOrder: checks.mapOpenInOrder,
  leavingKeepsFinished: checks.sceneAfterLeaving === '' && before.every((x) => checks.keptAfterLeaving.includes(x)),
  everyMissionSaved: play.every((id) => checks[`${id}Saved`]),
  openingsSayTheJob: play.every((id) => (checks[`${id}Opening`] || '').length > 40),
  ...(play.includes('ground') ? { groundHonest: /Look again/.test(checks.groundHint) && /Look at the checks again/.test(checks.groundGale) && checks.groundTopLine === checks.groundGale && checks.groundFocusAfterFourth === 'day' && checks.groundAirfield } : {}),
  ...(play.includes('survey') ? { surveyHonest: /gap/i.test(checks.surveyGaps) && /battery/i.test(checks.surveyBattery) } : {}),
  ...(play.includes('rescue') ? { rescueHonest: /hard to pick out/.test(checks.rescueCamera) && /outside/.test(checks.rescueRiver) && /yours/.test(checks.rescueTimes0) && (band === 'junior' || /yours/.test(checks.rescueTimes1 || '')) } : {}),
  ...(all ? { finished: checks.finished === true && checks.lines?.length === 6 && checks.practised?.length >= 2 && checks.townKind === 'drone-route' && checks.picture > 0 && checks.sceneAfter === 'drone-route' && checks.moduleLayerGone } : {}),
  nothingClipped: problems.length === 0,
  quiet: !errors.length && !outside.length,
};
const ok = Object.values(must).every(Boolean);
console.log(JSON.stringify({ ok, band, reduce, size: `${W}x${H}`, town, large, touch, play, seconds: T, must, problems, checks, errors, outside, shots }, null, 2));
await b.close();
process.exit(ok ? 0 : 1);
