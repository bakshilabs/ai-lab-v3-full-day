// A browser run of the "power" module (js/modules/power), from start to finish, with screenshots.
// Usage: node tests/playwright/power.mjs [baseUrl] [outDir] [junior|senior] [width height] [empty|built]
//   MOTION=1 plays it with movement (the hours tick by themselves); otherwise reduced motion is on (Next hour).
//   LARGE=1 turns large text on.   "built" puts homes, turbines and a battery in the town first; "empty" (the
//   default) plays in a brand-new town, which is lent practice homes and kit.
// It starts a town, opens the module, runs the day by hand (mouse and keyboard), tests the rules Florence drafted,
// reads where homes went dark, changes the rules with the tiles, tests again, compares, finishes, and checks the
// record, the scenery left in the town, that everything was put back, and that the page logged no errors and made no
// outside requests. Then it opens the module again, goes straight to the saved rules and leaves early.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8815/', out = 'shots-power', band = 'junior', W = 1280, H = 800, townKind = 'empty'] = process.argv.slice(2);
const motion = !!process.env.MOTION; const large = !!process.env.LARGE; const junior = band !== 'senior';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +W, height: +H } });
await p.addInitScript(({ reduce, large }) => { window.__sayLog = []; localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce, ...(large ? { text: 'large' } : {}) })); }, { reduce: !motion, large });
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
const checks = {}; let n = 0;
const shot = async (name, wait = 900) => { await p.waitForTimeout(wait); await p.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png`, timeout: 240000 }); };
const LONG = 300000; p.setDefaultTimeout(LONG); // software 3D on a busy machine can fall to a frame a second
const click = async (sel, t = LONG) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.click(sel); };
const M = '#module[data-module="power"] ';
const text = (sel) => p.evaluate((s) => document.querySelector(s)?.textContent?.replace(/\s+/g, ' ').trim() || '', sel);
const says = () => text(M + '.pw-top p');
// nothing on the desk may spill out of the screen or out of its panel sideways
const fits = () => p.evaluate((m) => { const d = document.querySelector(m + '.pw-desk'), r = d.getBoundingClientRect(); const t = document.querySelector(m + '.pw-top').getBoundingClientRect(), pl = document.querySelector(m + '.pw-plate').getBoundingClientRect(), back = document.querySelector('#module .modback').getBoundingClientRect();
  const hit = (a, c) => !(a.right <= c.left || c.right <= a.left || a.bottom <= c.top || c.bottom <= a.top);
  const wide = [...d.querySelectorAll('button, h3, li, p, .pw-dial span')].filter((e) => e.scrollWidth > e.clientWidth + 2).map((e) => e.textContent.trim().slice(0, 30));
  return { deskOnScreen: r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1, window: Math.round(r.top), noSideScroll: d.scrollWidth <= d.clientWidth + 1, clipped: wide, topClear: !hit(t, pl) && !hit(t, back) && !hit(pl, back), topAboveDesk: t.bottom < r.top, panelsApart: (() => { const ps = [...d.children].map((e) => e.getBoundingClientRect()); const inner = [...d.children].every((e) => [...e.children].every((k) => { const b = k.getBoundingClientRect(), o = e.getBoundingClientRect(); return e.scrollHeight > e.clientHeight + 2 || b.bottom <= o.bottom + 1; })); return inner && ps.every((a, i) => ps.every((c, k) => k <= i || !hit(a, c))); })() }; }, M);
const allFit = []; const fit = async (name) => { const f = await fits(); allFit.push({ name, ...f }); return f; };

// ---- into a town
await p.goto(base + 'index.html');
await click(`[data-band="${band}"]`);
await click('[data-name]'); await click('[data-go]');
await p.waitForTimeout(800);
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: LONG }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForSelector('#build [data-cat="land"]', { timeout: LONG });
await p.waitForFunction(() => window.__eco?.app?.G?.canMenu?.(), null, { timeout: LONG });
if (townKind === 'built') { // a town with homes and some kit of its own, put straight into the game's own cells
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

// ---- open the module
await p.evaluate(() => { window.__power = undefined; window.__eco.openModule('power').then((r) => { window.__power = r === undefined ? null : r; }); });
await p.waitForSelector(M + '.pw-top', { timeout: LONG });
checks.backButton = await p.isVisible('#module .modback');
checks.hello = await says();
await fit('desk'); await shot('desk', 2500);
await click(M + '[data-act="next"]'); checks.firstAsk = await says(); checks.focusOnStart = await p.evaluate(() => document.activeElement?.dataset?.act === 'hand');
checks.noSkipFirstTime = !(await p.$(M + '[data-act="rules"]'));
await click(M + '[data-act="hand"]');

// ---- one day by hand. The plan: wait, charge through the late morning and midday, then use the battery.
await p.waitForSelector(M + '[data-mode="charge"]', { timeout: LONG });
const clockIs = () => text(M + '[data-clock]'); const homesLit = () => text(M + '[data-v="homes"]');
const want = (i) => (i < 2 ? 'hold' : i < 8 ? 'charge' : 'use');
if (!motion) {
  checks.handAsk = await says();
  for (let i = 0; i < 24; i++) {
    const m = want(i);
    if (i === 2) { await p.keyboard.press('1'); checks.keyChoosesCharge = (await p.getAttribute(M + '[data-mode="charge"]', 'aria-pressed')) === 'true'; } // by keyboard
    else if (i === 8) { await p.focus(M + '[data-mode="use"]'); await p.keyboard.press('Enter'); checks.enterChoosesUse = (await p.getAttribute(M + '[data-mode="use"]', 'aria-pressed')) === 'true'; }
    else if ((await p.getAttribute(M + `[data-mode="${m}"]`, 'aria-pressed')) !== 'true') await p.click(M + `[data-mode="${m}"]`);
    if (i === 13) { // seven in the evening: the windows answer the control at once
      const withBattery = await homesLit(); await p.click(M + '[data-mode="hold"]'); await p.waitForTimeout(700); const held = await homesLit(); checks.holdDarkens = { withBattery, held, differs: withBattery !== held, florence: await says() };
      await fit('hand-dark'); await shot('hand-evening-hold', 1800); await p.click(M + '[data-mode="use"]'); await shot('hand-evening-use', 1800);
    }
    if (i === 5) { await fit('hand'); await shot('hand-midday', 1500); }
    await p.click(M + '[data-hour]');
  }
} else {
  await p.click(M + '[data-pause]'); checks.pauseStops = { at: await clockIs() }; await p.waitForTimeout(3500); checks.pauseStops.still = (await clockIs()) === checks.pauseStops.at; await p.click(M + '[data-pause]');
  let last = -1; let shots = 0;
  for (let guard = 0; guard < 4000; guard++) {
    if (await p.$(M + '[data-act="rules"]')) break;
    const c = await clockIs(); const i = junior ? ['6 am', '7 am', '8 am', '9 am', '10 am', '11 am', '12 noon', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm', '11 pm', 'midnight', '1 am', '2 am', '3 am', '4 am', '5 am'].indexOf(c) : (parseInt(c, 10) + 18) % 24;
    if (i !== last && i >= 0) { last = i; const m = want(i); const btn = await p.$(M + `[data-mode="${m}"]`); if (btn && (await btn.getAttribute('aria-pressed')) !== 'true') await btn.click().catch(() => {});
      if ((i === 5 || i === 13) && shots < 2) { shots++; await fit('hand'); await shot(i === 5 ? 'hand-midday' : 'hand-evening', 300); } }
    await p.waitForTimeout(120);
  }
}
await p.waitForSelector(M + '[data-act="rules"]', { timeout: LONG });
checks.handSummary = await p.evaluate((m) => [...document.querySelectorAll(m + '.pw-lines li')].map((e) => e.textContent), M);
await fit('hand-done'); await shot('hand-done');
await click(M + '[data-act="rules"]');

// ---- the rules: Florence drafted the first ones from the hand-run day
await p.waitForSelector(M + '[data-op="test"]', { timeout: LONG });
const ruleList = () => p.evaluate((m) => [...document.querySelectorAll(m + 'ol.pw-rules li:not(.pw-else)')].map((li) => [...li.querySelectorAll('.pw-tile')].map((t) => t.textContent.replace(/^(When|Do)/, '').trim()).join(' → ')), M);
checks.draft = await ruleList(); checks.draftSay = await says();
await fit('rules-draft'); await shot('rules-draft');
const runTest = async (name) => {
  await click(M + '[data-op="test"]');
  if (motion) { await p.waitForSelector(M + '[data-skip]', { timeout: LONG }); await p.waitForTimeout(5200); await fit('test-run'); await shot(`${name}-running`, 200); if (name !== 'test1') await p.click(M + '[data-skip]').catch(() => {}); }
  else for (let i = 0; i < 3; i++) { // with reduced motion each day is five still views (cut, not swept), then the whole day with Next
    if (i === 0 && name === 'test1') { await p.waitForSelector(M + '[data-skip]', { timeout: LONG }); const a = await clockIs(); await p.waitForTimeout(3200); const c = await clockIs(); checks.stillViews = { a, c, cuts: a !== c || !!(await p.$(M + '[data-act="next"]')), focus: await p.evaluate(() => document.activeElement?.hasAttribute('data-skip') || document.activeElement?.dataset?.act === 'next') }; await shot(`${name}-still-view`, 100); }
    else if (await p.$(M + '[data-skip]')) await p.click(M + '[data-skip]').catch(() => {});
    await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); if (i === 1) { await fit('test-day'); await shot(`${name}-still-day`, 1500); } await p.click(M + '[data-act="next"]'); await p.waitForTimeout(300); }
  await p.waitForSelector(M + '.pw-tabs', { timeout: LONG });
  return p.evaluate((m) => ({ tabs: [...document.querySelectorAll(m + '.pw-tabs button')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()), lines: [...document.querySelectorAll(m + '.pw-lines li')].map((e) => e.textContent), say: document.querySelector(m + '.pw-top p').textContent }), M);
};
const lit = (r) => r.tabs.reduce((s, t) => s + Number((t.match(/(\d+) \/ \d+/) || [0, 0])[1]), 0);
const first = await runTest('test1'); checks.firstTest = first;
await fit('results'); await shot('results-first', 1800);
// step through the hours, and look at another day
const hourBefore = await text(M + '.pw-hour b'); await p.click(M + '[data-step="1"]'); await p.click(M + '[data-step="1"]'); checks.hourSteps = hourBefore !== (await text(M + '.pw-hour b'));
await p.click(M + '[data-day="2"]'); checks.winterTab = await p.evaluate((m) => [...document.querySelectorAll(m + '.pw-lines li')].map((e) => e.textContent), M); await shot('results-winter', 1800);
await click(M + '[data-act="change"]'); // one tap back to the rules

// ---- change the rules with the tiles: a new rule set, written by taps and by keyboard
await p.waitForSelector(M + '[data-op="test"]', { timeout: LONG });
for (let i = 0; i < 8 && (await p.$(M + '[data-op="del"]')); i++) await p.click(M + '[data-op="del"]');
checks.testNeedsRule = await p.isDisabled(M + '[data-op="test"]');
const add = async (when, then) => { await click(M + '[data-op="add"]'); await click(M + `.pw-pick [data-pick="${when}"]`); await click(M + `.pw-pick [data-pick="${then}"]`); await p.waitForSelector(M + '[data-op="test"]'); };
await add('calm', 'use'); await click(M + '[data-op="add"]'); await fit('pick'); await shot('pick-when'); checks.usedTileHidden = !(await p.$(M + '.pw-pick [data-pick="calm"]'));
await click(M + '.pw-pick [data-pick="midday"]'); await shot('pick-then', 400); await click(M + '.pw-pick [data-pick="charge"]');
await add('windy', 'charge'); await add('morning', 'hold');
// the morning rule must come first: move it up by keyboard (focus, Enter), three times
for (let i = 3; i > 0; i--) { await p.focus(M + `[data-op="up"][data-n="${i}"]`); await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
// change one tile: rule 3 from "midday" to "sun is bright", then back out of a chooser without choosing
await click(M + '[data-edit="when"][data-n="2"]'); await click(M + '.pw-pick [data-pick="sunny"]'); await click(M + '[data-edit="then"][data-n="2"]'); await click(M + '.pw-ctl [data-pick=""]');
if (!junior) { await click(M + '[data-op="turns"]'); checks.turnsOn = (await p.getAttribute(M + '[data-op="turns"]', 'aria-pressed')) === 'true'; checks.focusStays = await p.evaluate(() => document.activeElement?.dataset?.op === 'turns'); } else checks.noTurnsForJunior = !(await p.$(M + '[data-op="turns"]'));
await click(M + '[data-op="school"]'); checks.schoolOn = (await p.getAttribute(M + '[data-op="school"]', 'aria-pressed')) === 'true';
checks.rules = await ruleList(); checks.addStopsAtMax = junior ? await p.isDisabled(M + '[data-op="add"]') : !(await p.isDisabled(M + '[data-op="add"]'));
await fit('rules'); await shot('rules-mine');
const second = await runTest('test2'); checks.secondTest = second;
checks.resultsChanged = JSON.stringify(first.tabs) !== JSON.stringify(second.tabs); checks.litHours = [lit(first), lit(second)]; checks.moreLit = lit(second) > lit(first);
await fit('results2'); await shot('results-second', 1800);
await click(M + '[data-act="keep"]');

// ---- hand and rules, side by side
await p.waitForSelector(M + '[data-act="finish"]', { timeout: LONG });
checks.compare = await p.evaluate((m) => [...document.querySelectorAll(m + '.pw-lines li')].map((e) => e.textContent), M); checks.compareSay = await says();
await fit('compare'); await shot('compare-night', 2500);
checks.during = await p.evaluate(() => { const s = window.__eco.app.stage; let view = 0; s.scene.traverse((o) => { if (o.name === 'power-view') view++; }); return { night: +s.night.toFixed(2), hour: s.hour, view, offset: !!s.camera.view?.enabled }; });
await click(M + '[data-act="finish"]');

// ---- the record card, then back in the town
await p.waitForSelector('#modal:not(.hide) [data-act="ok"]', { timeout: LONG });
checks.cardText = await p.evaluate(() => document.querySelector('#modal').innerText.replace(/\s+/g, ' ').slice(0, 900));
await shot('record');
await p.click('#modal [data-act="ok"]');
await p.waitForFunction(() => window.__power !== undefined, null, { timeout: LONG });
const result = await p.evaluate(() => window.__power);
checks.finished = result?.finished === true; checks.title = result?.record?.made?.title; checks.lines = result?.record?.made?.lines; checks.practised = result?.record?.practised;
checks.picture = /^<svg/.test(result?.record?.made?.picture || '') && result.record.made.picture.length < 200000; checks.town = result?.town;
if (checks.picture) fs.writeFileSync(`${out}/chart.svg`, result.record.made.picture);
await p.waitForTimeout(1500);
Object.assign(checks, await p.evaluate((was) => {
  const { app } = window.__eco; const s = app.stage; let view = 0, town = 0; s.scene.traverse((o) => { if (o.name === 'power-view') view++; if (o.name === 'power-town') town++; });
  const kept = app.G.modules?.power;
  return { moduleGone: !document.querySelector('#module'), viewRemoved: view === 0, townScenery: town, putBack: { hour: s.hour === was.hour || Math.abs(s.hour - app.hour) < 0.6 /* the town's own clock runs on */, winter: s.winter === was.winter, view: !!s.camera.view?.enabled === was.view, fov: s.camera.fov === was.fov }, saved: { done: kept?.done, record: !!kept?.record, town: kept?.town?.kind, state: kept?.state?.stage, rules: kept?.state?.rules?.list?.length }, said: (window.__sayLog || []).length };
}, before));
// what is left in the town must be really drawn, and big enough to find from the usual island view
checks.hut = await p.evaluate(() => { const { app } = window.__eco; const s = app.stage; let hut = null, lamps = 0; s.scene.traverse((o) => { if (o.name === 'power-hut') hut = o; if (o.name === 'power-lamp' && o.visible) lamps++; }); if (!hut) return { drawn: false, lamps };
  hut.updateWorldMatrix(true, true); const V = hut.position.constructor; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, meshes = 0; const r = s.renderer.domElement.getBoundingClientRect();
  hut.traverse((m) => { if (!m.isMesh) return; meshes++; for (const dx of [-0.5, 0.5]) for (const dy of [-0.5, 0.5]) for (const dz of [-0.5, 0.5]) { const v = new V(dx, dy, dz).applyMatrix4(m.matrixWorld).project(s.camera); const px = ((v.x + 1) / 2) * r.width, py = ((1 - v.y) / 2) * r.height; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); } });
  return { drawn: hut.visible && hut.parent?.visible !== false && meshes >= 8, meshes, lamps, w: Math.round(x1 - x0), h: Math.round(y1 - y0), onScreen: x1 > 0 && x0 < r.width && y1 > 0 && y0 < r.height }; });
await shot('town-day');
// the same town at night: the lanterns follow the rules (the test sets the time; the game does this in its own night scenes)
const hourWas = await p.evaluate(() => { const { app } = window.__eco; const h = app.hour; app.hour = 21.2; app.stage.setTime(21.2, 0); return h; });
await p.waitForFunction(() => { let n = 0; window.__eco.app.stage.scene.traverse((o) => { if (o.name === 'power-lamp' && o.material?.isMeshBasicMaterial) n++; }); let any = 0; window.__eco.app.stage.scene.traverse((o) => { if (o.name === 'power-lamp') any++; }); return any === 0 || n > 0; }, null, { timeout: 60000 }).catch(() => {});
checks.nightLamps = await p.evaluate(() => { const { app } = window.__eco; let lit = 0, dark = 0, pools = 0; app.stage.scene.traverse((o) => { if (o.name === 'power-lamp' && o.material?.isMeshBasicMaterial) { const c = o.material.color.getHexString(); if (c === 'ffd66b') lit++; else if (c === '353c5c') dark++; } if (o.name === 'power-pool' && o.visible) pools++; }); return { lit, dark, pools, night: +app.stage.night.toFixed(2) }; });
await shot('town-night', 1500);
await p.evaluate((h) => { const { app } = window.__eco; app.hour = h; app.stage.setTime(h, 0); }, hourWas);

// ---- again: straight to the saved rules, then leave early by the one way back
await p.evaluate(() => { window.__power2 = undefined; window.__eco.openModule('power').then((r) => { window.__power2 = r === undefined ? null : r; }); });
await p.waitForSelector(M + '[data-act="next"]', { timeout: LONG }); checks.helloAgain = await says();
await click(M + '[data-act="next"]'); await click(M + '[data-act="rules"]');
await p.waitForSelector(M + '[data-op="test"]', { timeout: LONG }); checks.rulesKept = (await ruleList()).length === checks.rules.length && JSON.stringify(await ruleList()) === JSON.stringify(checks.rules);
await p.click(M + '[data-op="del"]'); // a change made before leaving is kept too
await shot('again-rules');
await p.click('#module .modback');
await p.waitForFunction(() => window.__power2 !== undefined, null, { timeout: LONG });
await p.waitForTimeout(1200);
checks.leftEarly = await p.evaluate((was) => { const { app } = window.__eco; const s = app.stage; const r = window.__power2; let view = 0, town = 0; s.scene.traverse((o) => { if (o.name === 'power-view') view++; if (o.name === 'power-town') town++; });
  return { finished: !!r?.finished, stillDone: app.G.modules?.power?.done === true, keptRecord: !!app.G.modules?.power?.record, savedRules: app.G.modules?.power?.state?.rules?.list?.length, moduleGone: !document.querySelector('#module'), viewRemoved: view === 0, townScenery: town, hour: s.hour === was.hour || Math.abs(s.hour - app.hour) < 0.6, view: !!s.camera.view?.enabled === was.view }; }, before);
checks.noOutsideRequests = outside.length === 0; if (!checks.noOutsideRequests) checks.outside = outside.slice(0, 5);
checks.fits = allFit.filter((f) => !f.deskOnScreen || !f.noSideScroll || f.clipped.length || !f.topClear || !f.topAboveDesk || !f.panelsApart); checks.windowHeights = allFit.map((f) => `${f.name}:${f.window}`).join(' ');

const ok = checks.finished && checks.picture && checks.practised?.length >= 2 && checks.lines?.length >= 3 && checks.moduleGone && checks.viewRemoved && checks.townScenery === 1 && Object.values(checks.putBack).every(Boolean)
  && checks.saved?.done && checks.saved?.town === 'power-rules' && checks.backButton && checks.draft.length >= 1 && checks.testNeedsRule && checks.usedTileHidden && checks.schoolOn && checks.rules.length === 4 && checks.resultsChanged && checks.moreLit && checks.hourSteps
  && (motion ? checks.pauseStops?.still : checks.keyChoosesCharge && checks.enterChoosesUse && checks.holdDarkens?.differs) && checks.during.view === 1 && checks.during.night > 0.45 && checks.nightLamps.lit + checks.nightLamps.dark === (townKind === 'built' ? 8 : 0) && checks.nightLamps.pools === checks.nightLamps.lit
  && checks.hut?.drawn && checks.hut.onScreen && checks.hut.h >= 24 && checks.hut.lamps === (townKind === 'built' ? 8 : 0) && checks.focusOnStart && (motion || (checks.stillViews?.cuts && checks.stillViews.focus)) && (junior ? checks.noTurnsForJunior : checks.turnsOn && checks.focusStays)
  && checks.rulesKept && !checks.leftEarly.finished && checks.leftEarly.stillDone && checks.leftEarly.keptRecord && checks.leftEarly.savedRules === 3 && checks.leftEarly.moduleGone && checks.leftEarly.viewRemoved && checks.leftEarly.hour && checks.leftEarly.view
  && checks.fits.length === 0 && checks.noOutsideRequests && errors.length === 0;
console.log(JSON.stringify({ band, motion, large, town: townKind, size: `${W}x${H}`, ok, checks, errors }, null, 2));
await b.close();
process.exit(ok ? 0 : 1);
