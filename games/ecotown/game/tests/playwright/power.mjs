// A browser run of the "power" module (js/modules/power): all six missions from the mission map to the take-home
// record, with screenshots.
// Usage: node tests/playwright/power.mjs [baseUrl] [outDir] [junior|senior] [width height] [empty|built|full]
//   MOTION=1 plays with movement (steps and hours tick by themselves); otherwise reduced motion is on (Next buttons).
//   LARGE=1 turns large text on. "built" puts homes, turbines and a battery in the town first; "empty" (the default)
//   plays in a brand-new town, which is lent practice homes and kit; "full" builds thirty homes, a school, four
//   turbines and two batteries.
// It plays each mission (with a wrong answer first where a mission has one, to see the honest feedback), leaves in
// the middle of mission 3 and comes back to the map, finishes all six, presses through the record card, "Talk it
// over" and "Break time", and checks the record, the scenery in the town, that everything was put back, that the page
// logged no errors and made no outside requests, and that the desk always fits the screen. Then it opens the module
// again, replays mission 1's briefing, and leaves.
// The answers come from the module's own pure files (imported in the page), never from its page.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8896/', out = 'shots-power', band = 'junior', W = 1280, H = 800, townKind = 'empty'] = process.argv.slice(2);
const motion = !!process.env.MOTION; const large = !!process.env.LARGE; const junior = band !== 'senior';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +W, height: +H } });
await p.addInitScript(({ reduce, large }) => { window.__sayLog = []; localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce, ...(large ? { text: 'large' } : {}) })); }, { reduce: !motion, large });
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
const checks = {}; let n = 0; const t0 = Date.now(); const times = {};
const shot = async (name, wait = 700) => { await p.waitForTimeout(wait); await p.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png`, timeout: 240000 }); };
const LONG = 300000; p.setDefaultTimeout(LONG);
const click = async (sel, t = LONG) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.click(sel); };
const M = '#module[data-module="power"] ';
const text = (sel) => p.evaluate((s) => document.querySelector(s)?.textContent?.replace(/\s+/g, ' ').trim() || '', sel);
const says = () => text(M + '.pw-top p');
const fits = () => p.evaluate((m) => { const d = document.querySelector(m + '.pw-desk'), r = d.getBoundingClientRect(); const t = document.querySelector(m + '.pw-top').getBoundingClientRect(), pl = document.querySelector(m + '.pw-plate').getBoundingClientRect(), back = document.querySelector('#module .modback').getBoundingClientRect();
  const hit = (a, c) => !(a.right <= c.left || c.right <= a.left || a.bottom <= c.top || c.bottom <= a.top);
  const wide = [...d.querySelectorAll('button, h2, h3, li, p, .pw-dial span')].filter((e) => e.offsetParent && e.scrollWidth > e.clientWidth + 2).map((e) => e.textContent.trim().slice(0, 30));
  const small = [...d.querySelectorAll('button')].filter((e) => e.offsetParent && !e.closest('.pw-track') && (e.getBoundingClientRect().height < 40 || e.getBoundingClientRect().width < 40)).map((e) => `${e.textContent.trim().slice(0, 16)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
  return { deskOnScreen: r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1, window: Math.round(r.top), noSideScroll: d.scrollWidth <= d.clientWidth + 1, clipped: wide, small, topClear: !hit(t, pl) && !hit(t, back) && !hit(pl, back), topAboveDesk: t.bottom < r.top }; }, M);
const allFit = []; const fit = async (name) => { const f = await fits(); allFit.push({ name, ...f }); return f; };
const lap = (k) => { times[k] = Math.round((Date.now() - t0) / 1000); };
// the module's own pure files, in the page, for the answers
const pure = (fn, arg) => p.evaluate(async ({ fn, arg }) => { const base = './js/modules/power/'; const mods = { model: await import(base + 'model.js'), m1: await import(base + 'm1-balance.js'), m2: await import(base + 'm2-forecast.js'), m3: await import(base + 'm3-storage.js'), m5: await import(base + 'm5-demand.js') };
  const { app, terrain } = window.__eco; const kit = mods.model.kitFrom([...app.G.cells].map(([k, c]) => [k, { ...c }]), terrain.tiles); return (new Function('mods', 'kit', 'arg', `return (${fn})(mods, kit, arg);`))(mods, kit, arg); }, { fn: fn.toString(), arg });

// ---- into a town
await p.goto(base + 'index.html');
await click(`[data-band="${band}"]`);
await click('[data-name]'); await click('[data-go]');
await p.waitForTimeout(800);
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: LONG }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForSelector('#build [data-cat="land"]', { timeout: LONG });
await p.waitForFunction(() => window.__eco?.app?.G?.canMenu?.(), null, { timeout: LONG });
if (townKind === 'full') {
  checks.built = await p.evaluate(() => {
    const { app, terrain } = window.__eco; const G = app.G; const free = (t) => !t.fixed && !t.hedge && !G.cells.get(t.k)?.item;
    const far = (t) => Math.hypot(t.gx - 9, t.gz - 8); const put = (t, cell) => { G.cells.set(t.k, cell); app.world.setCell(t.k, cell); };
    const open = [...terrain.tiles.values()].filter((t) => free(t) && ['field', 'coast', 'slope'].includes(t.zone)).sort((a, c) => far(a) - far(c));
    const kinds = ['timber', 'straw', 'earth', 'reclaimed', 'cohousing']; let homes = 0;
    put(open.shift(), { mark: 'town', item: 'school', mods: [], locked: false });
    for (let i = 0; i < 30 && open.length > 6; i++) { put(open.shift(), { mark: 'town', item: kinds[i % 5], mods: i % 4 === 0 ? ['solar'] : [], locked: false }); homes++; }
    for (const item of ['wind', 'wind', 'wind', 'wind', 'battery', 'battery']) if (open.length) put(open.pop(), { mark: null, item, mods: [], locked: false });
    return { homes };
  });
  await p.waitForTimeout(1500);
}
if (townKind === 'built') {
  checks.built = await p.evaluate(() => {
    const { app, terrain } = window.__eco; const G = app.G; const open = [...terrain.tiles.values()].filter((t) => !t.fixed && !t.hedge && t.zone === 'field' && !G.cells.get(t.k)?.item);
    const far = (t) => Math.hypot(t.gx - 9, t.gz - 8); open.sort((a, c) => far(a) - far(c));
    const homes = ['timber', 'straw', 'earth', 'timber', 'cohousing', 'reclaimed', 'timber', 'straw']; const put = (t, cell) => { G.cells.set(t.k, cell); app.world.setCell(t.k, cell); };
    homes.forEach((item, i) => put(open[i], { mark: 'town', item, mods: i % 3 === 0 ? ['solar'] : i === 4 ? ['heatpump'] : [], locked: false }));
    const edge = [...terrain.tiles.values()].filter((t) => !t.fixed && ['coast', 'slope', 'field'].includes(t.zone) && !G.cells.get(t.k)?.item).sort((a, c) => far(c) - far(a));
    put(edge[0], { mark: null, item: 'wind', mods: [], locked: false }); put(edge[1], { mark: null, item: 'wind', mods: [], locked: false }); put(edge[2], { mark: null, item: 'battery', mods: [], locked: false });
    return { homes: homes.length };
  });
  await p.waitForTimeout(1500);
}
const before = await p.evaluate(() => { const s = window.__eco.app.stage; return { hour: s.hour, winter: s.winter, view: !!s.camera.view?.enabled, fov: s.camera.fov }; });
const open = async (key) => { await p.evaluate((k) => { window[k] = undefined; window.__eco.openModule('power').then((r) => { window[k] = r === undefined ? null : r; }); }, key); await p.waitForSelector(M + '.pw-map', { timeout: LONG }); };
const startMission = async (i, name) => {
  await p.waitForSelector(M + '.pw-map', { timeout: LONG });
  await click(M + `.pw-map [data-m="${i}"]`); await p.waitForSelector(M + '.pw-brief [data-act="start"]');
  if (name) { checks[`brief${i + 1}`] = await text(M + '.pw-brief'); await fit(`brief${i + 1}`); await shot(`m${i + 1}-brief`); }
  await click(M + '.pw-brief [data-act="start"]');
};
const debrief = async (i, nextAct = 'map') => { await p.waitForSelector(M + '.pw-brief.done', { timeout: LONG }); checks[`done${i + 1}`] = await text(M + '.pw-brief.done'); await fit(`done${i + 1}`); await shot(`m${i + 1}-done`); await click(M + `.pw-brief.done [data-act="${nextAct}"]`); lap(`m${i + 1}`); };

// ---- the mission map
await open('__power');
checks.backButton = await p.isVisible('#module .modback'); checks.hello = await says();
checks.mapLocked = await p.evaluate((m) => [...document.querySelectorAll(m + '.pw-map button')].map((x) => x.disabled), M);
await fit('map'); await shot('map', 2500);

// ---- mission 1: balance
await startMission(0, true);
const flexNow = () => p.evaluate((m) => { const t = [...document.querySelectorAll(m + '.pw-track i')]; return 6 - t.findIndex((i) => i.classList.contains('on')); }, M);
const stepNow = () => p.evaluate((m) => [...document.querySelectorAll(m + 'ol.pw-steps li')].findIndex((li) => li.classList.contains('now')), M);
const ROUNDS = await pure((mods) => mods.m1.BALANCE_ROUNDS.map((r) => r.use.map((_, i) => mods.m1.needFlex(r, i))));
for (let r = 0; r < 3; r++) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const wrong = r === 0 && attempt === 0; // first round, first go: just press Ready, to see the honest result
    await p.waitForSelector(M + '[data-ready]', { timeout: LONG });
    if (motion) { await click(M + '[data-pause]'); }
    for (let s = 0; s < 8; s++) {
      await p.waitForFunction(({ m, s }) => [...document.querySelectorAll(m + 'ol.pw-steps li')].findIndex((li) => li.classList.contains('now')) === s, { m: M, s }, { timeout: LONG });
      if (!wrong) {
        for (let g = 0; g < 12; g++) { const f = await flexNow(); const want = ROUNDS[r][s]; if (f === want) break; if (g === 0 && r === 0 && s === 1) { await p.keyboard.press(f < want ? 'ArrowUp' : 'ArrowDown'); continue; } await p.click(M + `[data-flex="${f < want ? 1 : -1}"]`); }
        if (r === 0 && s === 1) checks.scaleLevel = await text(M + '.pw-state');
      }
      if (r === 2 && s === 3) { await fit('m1-cutout'); await shot('m1-turbines-cut-out'); checks.cutoutSay = await text(M + '.pw-event'); }
      if (r === 0 && s === 2 && !wrong) { await fit('m1-step'); await shot('m1-level'); }
      await p.click(M + '[data-ready]');
    }
    await p.waitForSelector(M + '[data-act]', { timeout: LONG });
    if (wrong) { checks.m1Miss = await text(M + '.pw-screen .pw-lines'); await shot('m1-round-missed'); await click(M + '[data-act="again"]'); continue; }
    if (r === 0) checks.m1Met = await text(M + '.pw-screen .pw-lines');
    await click(M + '[data-act="next"]'); break;
  }
}
await debrief(0);

// ---- mission 2: forecasting
await startMission(1, true);
const FC = await pure((mods, kit) => mods.m2.FORECAST_ROUNDS.map((d) => { const h = mods.m2.hoursOf(kit, d, 3); return { short: h.filter((x) => x.truth === 'short').map((x) => x.i), kwh: mods.m2.shortKwh(h) }; }));
for (let r = 0; r < 3; r++) {
  await p.waitForSelector(M + '.pw-hours', { timeout: LONG });
  if (r === 0) { await p.click(M + '[data-h="0"]'); await click(M + '[data-act="check"]'); await p.waitForTimeout(300); checks.m2Miss = await says(); await p.click(M + '[data-h="0"]'); await shot('m2-miss'); }
  for (const i of FC[r].short) { if (r === 1 && i === FC[r].short[0]) { await p.focus(M + `[data-h="${i}"]`); await p.keyboard.press('Enter'); } else await p.click(M + `[data-h="${i}"]`); }
  if (r === 1) { await fit('m2-marked'); await shot('m2-marked'); }
  await click(M + '[data-act="check"]');
  if (!junior && r >= 1) {
    await p.waitForSelector(M + '[data-kwh]', { timeout: LONG });
    const btns = await p.$$eval(M + '[data-kwh]', (bs) => bs.map((x) => x.textContent));
    const wrongI = btns.findIndex((t) => parseInt(t, 10) !== FC[r].kwh); if (wrongI >= 0) { await p.click(M + `[data-kwh="${wrongI}"]`); checks.m2KwhMiss = await says(); }
    await shot('m2-kwh');
    await p.click(M + `[data-kwh="${btns.findIndex((t) => parseInt(t, 10) === FC[r].kwh)}"]`);
  }
  await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); if (r === 0) { checks.m2Right = await text(M + '.pw-screen .pw-lines'); await shot('m2-right'); }
  await click(M + '[data-act="next"]');
}
await debrief(1);

// ---- mission 3: storage. First leave in the middle of day 1, come back to the map, and carry on.
await startMission(2, true);
await p.waitForSelector(M + '[data-mode="charge"]', { timeout: LONG }); await fit('m3-hand'); await shot('m3-hand-start');
await p.click('#module .modback');
await p.waitForFunction(() => window.__power !== undefined, null, { timeout: LONG }); await p.waitForTimeout(800);
checks.leftMid = await p.evaluate(() => ({ result: window.__power, kept: window.__eco.app.G.modules?.power?.state?.done, gone: !document.querySelector('#module') }));
await open('__power');
checks.resumeMap = await p.evaluate((m) => ({ next: [...document.querySelectorAll(m + '.pw-map button')].findIndex((x) => x.classList.contains('next')), done: [...document.querySelectorAll(m + '.pw-map button.done')].length }), M);
await startMission(2);
const PLANS = await pure((mods, kit) => mods.m3.STORE_ROUNDS.map((r) => mods.m3.storeGoal(kit, r, 3).plan));
const clockIs = () => text(M + '[data-clock]');
const hourIndex = (c) => (junior ? ['6 am', '7 am', '8 am', '9 am', '10 am', '11 am', '12 noon', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm', '11 pm', 'midnight', '1 am', '2 am', '3 am', '4 am', '5 am'].indexOf(c) : (parseInt(c, 10) + 18) % 24);
const runDay = async (modes, label) => {
  await p.waitForSelector(M + '[data-mode="charge"]', { timeout: LONG });
  if (!motion) {
    for (let i = 0; i < 24; i++) {
      const m = modes[i];
      if (i === 2 && label === 'd1') { await p.keyboard.press(String(['charge', 'hold', 'use'].indexOf(m) + 1)); checks.keyMode = (await p.getAttribute(M + `[data-mode="${m}"]`, 'aria-pressed')) === 'true'; }
      else if ((await p.getAttribute(M + `[data-mode="${m}"]`, 'aria-pressed')) !== 'true') await p.click(M + `[data-mode="${m}"]`);
      if (i === 13 && label === 'd1') { await fit('m3-evening'); await shot('m3-evening'); }
      await p.click(M + '[data-hour]');
    }
  } else {
    let last = -1;
    for (let guard = 0; guard < 6000; guard++) {
      if (await p.$(M + '.pw-lines')) break;
      const i = hourIndex(await clockIs());
      if (i !== last && i >= 0) { last = i; const btn = await p.$(M + `[data-mode="${modes[i]}"]`); if (btn && (await btn.getAttribute('aria-pressed')) !== 'true') await btn.click().catch(() => {}); if (i === 13 && label === 'd1') { await fit('m3-evening'); await shot('m3-evening', 100); } }
      await p.waitForTimeout(100);
    }
  }
  await p.waitForSelector(M + '.pw-lines', { timeout: LONG });
};
// day 1: first everything on Hold (a miss), then Florence's plan
await runDay(Array(24).fill('hold'), 'd0'); checks.m3Miss = await text(M + '.pw-screen .pw-lines'); await fit('m3-miss'); await shot('m3-day-missed'); await click(M + '[data-act="again"]');
for (let r = 0; r < 3; r++) { await runDay(PLANS[r], `d${r + 1}`); if (r === 0) { checks.m3Met = await text(M + '.pw-screen .pw-lines'); await shot('m3-day-met'); } await click(M + '[data-act="next"]'); }
await debrief(2);

// ---- mission 4: automation rules (the first version, kept)
await startMission(3, true);
await p.waitForSelector(M + '[data-op="test"]', { timeout: LONG });
const ruleList = () => p.evaluate((m) => [...document.querySelectorAll(m + 'ol.pw-rules li:not(.pw-else)')].map((li) => [...li.querySelectorAll('.pw-tile')].map((t) => t.textContent.replace(/^(When|Do)/, '').trim()).join(' → ')), M);
checks.draft = await ruleList(); checks.draftSay = await says(); await fit('m4-draft'); await shot('m4-rules-draft');
const runTest = async (name) => {
  await click(M + '[data-op="test"]');
  if (motion) { await p.waitForSelector(M + '[data-skip]', { timeout: LONG }); await p.waitForTimeout(3000); await shot(`m4-${name}-running`, 100); await p.click(M + '[data-skip]').catch(() => {}); }
  else for (let i = 0; i < 3; i++) { if (await p.$(M + '[data-skip]')) await p.click(M + '[data-skip]').catch(() => {}); await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); if (i === 1 && name === 'test1') { await fit('m4-test-day'); await shot('m4-test-day'); } await p.click(M + '[data-act="next"]'); await p.waitForTimeout(250); }
  await p.waitForSelector(M + '.pw-tabs', { timeout: LONG });
  return p.evaluate((m) => ({ tabs: [...document.querySelectorAll(m + '.pw-tabs button')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()), lines: [...document.querySelectorAll(m + '.pw-lines li')].map((e) => e.textContent) }), M);
};
const lit = (r) => r.tabs.reduce((s, t) => s + Number((t.match(/(\d+) \/ \d+/) || [0, 0])[1]), 0);
const first = await runTest('test1'); checks.firstTest = first; await fit('m4-results'); await shot('m4-results');
await click(M + '[data-act="change"]');
await p.waitForSelector(M + '[data-op="test"]', { timeout: LONG });
for (let i = 0; i < 8 && (await p.$(M + '[data-op="del"]')); i++) await p.click(M + '[data-op="del"]');
const add = async (when, then) => { await click(M + '[data-op="add"]'); await click(M + `.pw-pick [data-pick="${when}"]`); await click(M + `.pw-pick [data-pick="${then}"]`); await p.waitForSelector(M + '[data-op="test"]'); };
await add('calm', 'use'); await add('midday', 'charge'); await add('windy', 'charge'); await add('morning', 'hold');
for (let i = 3; i > 0; i--) { await p.focus(M + `[data-op="up"][data-n="${i}"]`); await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
await click(M + '[data-edit="when"][data-n="2"]'); await click(M + '.pw-pick [data-pick="sunny"]');
await click(M + '[data-op="school"]'); checks.rules = await ruleList(); await fit('m4-rules'); await shot('m4-rules-mine');
const second = await runTest('test2'); checks.moreLit = lit(second) > lit(first); checks.litHours = [lit(first), lit(second)];
await click(M + '[data-act="keep"]'); await p.waitForSelector(M + '[data-act="finish"]', { timeout: LONG }); checks.compare = await text(M + '.pw-screen .pw-lines'); await fit('m4-compare'); await shot('m4-compare');
await click(M + '[data-act="finish"]');
await debrief(3);

// ---- mission 5: smart demand
await startMission(4, true);
const SOL = await pure((mods) => mods.m5.DEMAND_ROUNDS.map((r) => mods.m5.solve(r)));
for (let r = 0; r < 3; r++) {
  await p.waitForSelector(M + '.pw-slots', { timeout: LONG });
  if (r === 0) { await click(M + '[data-act="run"]'); await p.waitForTimeout(300); checks.m5Miss = await says(); await fit('m5-start'); await shot('m5-habit'); }
  if (r === 1) { await click(M + '[data-job="carA"]'); await p.click(M + '[data-slot="2"]'); checks.m5Refuse = await says(); }
  for (const [id, s] of Object.entries(SOL[r])) { await click(M + `[data-job="${id}"]`); if (r === 2 && id === 'wash') { const now = await p.evaluate((m) => Number(document.querySelector(m + '.pw-slots button.here')?.dataset.slot), M); for (let k = now; k !== s; k += s > now ? 1 : -1) { await p.focus(M + `[data-job="${id}"]`); await p.keyboard.press(s > now ? 'ArrowRight' : 'ArrowLeft'); } } else await p.click(M + `[data-slot="${s}"]`); }
  if (r === 2) { await fit('m5-solved'); await shot('m5-solved'); }
  await click(M + '[data-act="run"]'); await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); await click(M + '[data-act="next"]');
}
await debrief(4);

// ---- mission 6: storm night
await startMission(5, true);
await p.waitForSelector(M + '[data-sw="3A"]', { timeout: LONG }); await fit('m6-fault'); await shot('m6-fault');
await p.click(M + '[data-sw="3A"]'); checks.m6Trip = await says(); await p.click(M + '[data-sw="3B"]'); await p.click(M + '[data-sw="3A"]');
await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); checks.m6R1 = await says(); await shot('m6-isolated'); await click(M + '[data-act="next"]');
for (const id of ['1A', '1B', '2A', '2B']) await click(M + `[data-sw="${id}"]`); checks.m6Overload = await says(); await shot('m6-overload');
for (const id of ['2A', '2B', '1A', '3A']) await click(M + `[data-sw="${id}"]`);
await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); checks.m6R2 = await says(); await fit('m6-priority'); await shot('m6-priority'); await click(M + '[data-act="next"]');
const crew = junior ? ['off', 'dead', 'mend', 'on'] : ['off', 'dead', 'earth', 'mend', 'unearth', 'on'];
await click(M + `[data-card="${crew[2]}"]`); for (const c of crew.filter((x) => x !== crew[2])) await click(M + `[data-card="${c}"]`); await click(M + '[data-act="check"]'); checks.m6CrewMiss = await says();
await click(M + '[data-clear]'); for (const c of crew) await click(M + `[data-card="${c}"]`); await fit('m6-crew'); await shot('m6-crew'); await click(M + '[data-act="check"]');
await click(M + '[data-on="1B,3B"]'); checks.m6Surge = await says(); await shot('m6-surge');
await click(M + '[data-on="1B"]'); await click(M + '[data-on="3B"]'); await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); await shot('m6-restored'); await click(M + '[data-act="next"]');
await debrief(5, 'finish');

// ---- the record card, "Talk it over", "Break time", then the town
await p.waitForSelector('#modal:not(.hide) [data-act="ok"]', { timeout: LONG });
checks.cardText = await p.evaluate(() => document.querySelector('#modal').innerText.replace(/\s+/g, ' ').slice(0, 1200));
await shot('record');
await p.click('#modal [data-act="ok"]');
await p.waitForSelector('#modal:not(.hide) [data-act="go"]', { timeout: LONG }); checks.talk = (await p.evaluate(() => document.querySelector('#modal').innerText)).slice(0, 300); await shot('talk'); await p.click('#modal [data-act="go"]');
await p.waitForSelector('#modal:not(.hide) [data-act="stay"]', { timeout: LONG }); await p.click('#modal [data-act="stay"]');
await p.waitForFunction(() => window.__power !== undefined, null, { timeout: LONG });
const result = await p.evaluate(() => window.__power);
checks.finished = result?.finished === true; checks.title = result?.record?.made?.title; checks.lines = result?.record?.made?.lines; checks.practised = result?.record?.practised;
checks.picture = /^<svg/.test(result?.record?.made?.picture || '') && result.record.made.picture.length < 200000; checks.town = result?.town;
if (checks.picture) fs.writeFileSync(`${out}/record.svg`, result.record.made.picture);
await p.waitForTimeout(1500);
Object.assign(checks, await p.evaluate((was) => {
  const { app } = window.__eco; const s = app.stage; let view = 0, town = 0; s.scene.traverse((o) => { if (o.name === 'power-view') view++; if (o.name === 'power-town') town++; });
  const kept = app.G.modules?.power;
  return { moduleGone: !document.querySelector('#module'), viewRemoved: view === 0, townScenery: town, putBack: { winter: s.winter === was.winter, view: !!s.camera.view?.enabled === was.view, fov: s.camera.fov === was.fov }, saved: { done: kept?.done, record: !!kept?.record, town: kept?.town?.kind, missions: kept?.state?.done } };
}, before));
await shot('town-day');
await p.evaluate(() => { const { app } = window.__eco; app.hour = 21.2; app.stage.setTime(21.2, 0); });
await p.waitForTimeout(1500);
checks.nightLamps = await p.evaluate(() => { const { app } = window.__eco; let lit = 0, dark = 0; app.stage.scene.traverse((o) => { if (o.name === 'power-lamp' && o.material?.isMeshBasicMaterial) { const c = o.material.color.getHexString(); if (c === 'ffd66b') lit++; else if (c === '353c5c') dark++; } }); return { lit, dark }; });
await shot('town-night', 1500);

// ---- again: the map shows six ticks; replay mission 1's briefing, back to the map, then leave
await open('__power2');
checks.againMap = await p.evaluate((m) => ({ done: document.querySelectorAll(m + '.pw-map button.done').length, finish: !!document.querySelector(m + '[data-act="finish"]') }), M);
await shot('map-all-done');
await click(M + '.pw-map [data-m="0"]'); await click(M + '.pw-brief [data-act="map"]'); await p.waitForSelector(M + '.pw-map');
await p.click('#module .modback');
await p.waitForFunction(() => window.__power2 !== undefined, null, { timeout: LONG }); await p.waitForTimeout(1000);
checks.leftAgain = await p.evaluate(() => ({ finished: !!window.__power2?.finished, stillDone: window.__eco.app.G.modules?.power?.done === true, gone: !document.querySelector('#module') }));
checks.noOutsideRequests = outside.length === 0; if (!checks.noOutsideRequests) checks.outside = outside.slice(0, 5);
checks.fits = allFit.filter((f) => !f.deskOnScreen || !f.noSideScroll || f.clipped.length || !f.topClear || !f.topAboveDesk);
checks.smallButtons = [...new Set(allFit.flatMap((f) => f.small))].slice(0, 12);
checks.times = times;

const ok = checks.finished && checks.picture && checks.practised?.length >= 2 && checks.lines?.length === 6 && checks.moduleGone && checks.viewRemoved && checks.townScenery === 1 && Object.values(checks.putBack).every(Boolean)
  && checks.saved?.done && checks.saved?.town === 'power-rules' && checks.saved.missions?.every(Boolean) && checks.backButton && checks.mapLocked.join() === 'false,true,true,true,true,true'
  && checks.leftMid.result === null && checks.leftMid.gone && checks.resumeMap.next === 2 && checks.resumeMap.done === 2
  && /goal is 6/i.test(checks.m1Miss) && checks.moreLit && checks.draft.length >= 1 && /never .*|not right yet|hour/i.test(checks.m2Miss) && /Goal/.test(checks.m3Miss) && /Goal met/.test(checks.m3Met)
  && checks.againMap.done === 6 && checks.againMap.finish && !checks.leftAgain.finished && checks.leftAgain.stillDone && checks.leftAgain.gone
  && checks.fits.length === 0 && checks.noOutsideRequests && errors.length === 0;
console.log(JSON.stringify({ band, motion, large, town: townKind, size: `${W}x${H}`, ok, checks, errors }, null, 2));
await b.close();
process.exit(ok ? 0 : 1);
