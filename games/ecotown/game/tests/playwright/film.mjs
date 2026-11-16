// Browser run of the "Town film studio" module (js/modules/film): the whole hour, six missions, with screenshots.
// Usage: node tests/playwright/film.mjs [baseUrl] [outDir]      (serve games/ecotown/game first, port 8894)
//   BAND=senior    ages 13-17. Default: junior.
//   REDUCE=0       play with motion (the camera moves; films play by themselves). Default: reduced motion (stills, Next).
//   SIZE=768x1024  the window. Default 1280x800.
//   TOWN=empty     a new town with nothing built. TOWN=full: as much built as a free tap allows. Default: a small town.
//   LARGE=1        large text.
//   ONLY=3         stop after this many missions (a quicker look); the end checks then do not run.
// It starts a town, opens the module (the mission map), leaves at once, comes back, plays missions 1 and 2, leaves
// and comes back (the map keeps them), plays the rest, tries one wrong answer in many questions (Florence says why,
// and does not give the answer), finishes, and presses through the record, "Talk it over" and the break card. Then it
// checks the record, the screen left in the town, that the light is back, and that nothing logged an error.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8894/', out = 'shots-film'] = process.argv.slice(2);
const band = process.env.BAND === 'senior' ? 'senior' : 'junior'; const reduce = process.env.REDUCE !== '0'; const empty = process.env.TOWN === 'empty'; const full = process.env.TOWN === 'full'; const large = process.env.LARGE === '1';
const only = Number(process.env.ONLY) || 6;
const [W, H] = (process.env.SIZE || '1280x800').split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H } }); p.setDefaultTimeout(180000);
await p.addInitScript(([r, l]) => { window.__sayLog = []; window.__filmTest = true; if (!r) window.__filmPace = 0.6;
  localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce: r, ...(l ? { text: 'large' } : {}) })); }, [reduce, large]);
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
await p.addLocatorHandler(p.locator('#episode [data-skip]'), async (skip) => { await skip.click(); });
const tag = `${band}${reduce ? '' : '-motion'}${empty ? '-empty' : full ? '-full' : ''}${large ? '-large' : ''}-${W}x${H}`; let n = 0; const shots = [];
const shot = async (name, wait = 500) => { await p.waitForTimeout(wait); const f = `${out}/${tag}-${String(++n).padStart(3, '0')}-${name}.png`; await p.screenshot({ path: f, timeout: 240000 }); shots.push(f); };
const LONG = 600000;
const click = async (sel, t = LONG) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.click(sel); };
const checks = {};
const stageNow = () => p.evaluate(() => document.querySelector('#module .modroot')?.dataset.fmStage || null);
const said = () => p.textContent('#module .fm-talk p');
const layout = () => p.evaluate(() => { const bad = []; const vw = innerWidth, vh = innerHeight;
  for (const e of document.querySelectorAll('#module .fm-talk, #module .fm-m, #module .fm-brief, #module .fm-board, #module .fm-card:not([hidden]), #module .fm-bar.bottom')) { const r = e.getBoundingClientRect(); if (!r.width) continue; if (r.left < -1 || r.right > vw + 1 || r.top < -1 || r.bottom > vh + 1) bad.push(`off screen: ${e.className}`); }
  for (const e of document.querySelectorAll('#module .fm-m button, #module .fm-talk p, #module .fm-m h2')) { if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).display !== 'inline') bad.push(`clipped: ${e.textContent.trim().slice(0, 30)}`); }
  const back = document.querySelector('#module .modback').getBoundingClientRect(); const talk = document.querySelector('#module .fm-talk'); if (talk && !talk.hidden) { const r = talk.getBoundingClientRect(); if (r.left < back.right && r.top < back.bottom && r.bottom > back.top) bad.push('Florence\'s line is under the Back button'); }
  for (const btn of document.querySelectorAll('#module button')) { const r = btn.getBoundingClientRect(); if (r.width && (r.height < 40 || r.width < 40)) bad.push(`small button: ${btn.textContent.trim().slice(0, 20)} ${Math.round(r.width)}x${Math.round(r.height)}`); }
  const talkR = talk && !talk.hidden ? talk.getBoundingClientRect() : null; const panel = document.querySelector('#module .fm-m'); if (talkR && panel) { const r = panel.getBoundingClientRect(); if (r.top < talkR.bottom - 2) bad.push('the panel runs under Florence\'s line'); }
  return bad; });
const layoutBad = []; const checkLayout = async (where) => { for (const x of await layout()) layoutBad.push(`${where}: ${x}`); };
const filmNames = () => p.evaluate(() => window.__eco.app.stage.scene.children.map((c) => c.name).filter((x) => /^film/.test(x)));
const open = () => p.evaluate(() => { window.__filmDone = false; window.__film = window.__eco.openModule('film').then((r) => { window.__filmDone = true; return r; }); });
const mapCount = () => p.evaluate(() => [...document.querySelectorAll('#module .fm-mcard.done')].length);

// ---------- a town of the child's own
await p.goto(base + 'index.html');
await click(`[data-band="${band}"]`, 120000);
await click('[data-name]'); await click('[data-go]');
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: 180000 }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForSelector('#build [data-cat="land"]', { timeout: 240000 });
if (!empty) await p.evaluate(() => { const { G } = window.__eco.app;
  for (const [k, item] of [['6,3', 'timber'], ['7,3', 'straw'], ['7,4', 'timber'], ['11,5', 'cohousing'], ['8,5', 'market'], ['9,5', 'hall'], ['11,3', 'school'], ['10,4', 'park'], ['12,7', 'wind']]) { try { G.placeAt(k, 'town', { free: true }); G.placeAt(k, item, { free: true }); } catch { /* not buildable there */ } } });
if (full) await p.evaluate(() => { const { G } = window.__eco.app; const kinds = ['timber', 'straw', 'cohousing', 'mixed', 'orchard', 'wind', 'solar', 'park', 'earth', 'allot', 'hives', 'repair', 'heatpump', 'battery', 'compost', 'raingarden'];
  let i = 0; for (const t of [...window.__eco.terrain.tiles.values()]) { if (t.zone === 'wetland' || G.cells.get(t.k)?.item) continue; const item = kinds[i++ % kinds.length]; G.placeAt(t.k, 'town', { free: true }); try { G.placeAt(t.k, item, { free: true, replace: true }); } catch {} } });
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 120000 });

// ---------- open: the mission map. Leave at once: nothing kept, the light as it was.
await open(); await p.waitForSelector('#module [data-fm-map]', { timeout: LONG }); await shot('map-first', 1500); await checkLayout('map');
checks.mapFirst = { done: await mapCount(), locked: await p.evaluate(() => document.querySelectorAll('#module .fm-mcard[aria-disabled="true"]').length), line: await said() };
await p.click('#module .fm-mcard[aria-disabled="true"]', { force: true }); checks.lockedLine = await said();
await click('#module .modback'); await p.waitForFunction(() => window.__filmDone, null, { timeout: 60000 });
checks.leftEarly = await p.evaluate(() => window.__film.then((r) => !!r?.finished));
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 60000 }); await p.waitForTimeout(1500);
const lightOk = () => p.evaluate(() => Math.abs(window.__eco.app.stage.hour - window.__eco.app.hour) < 0.3 && window.__eco.app.stage.winter === 0);
checks.lightBack = await lightOk(); checks.sceneAfterLeaving = (await filmNames()).join(',');

// ---------- play the hour
await open();
let mission = '', missions = 0, asks = 0, wrongTried = 0, wrongGaveAway = 0; const seen = new Set(); const wrongLines = []; const story = {}; const m3 = { plays: 0, fed: false };
let paceFastTried = false; let lastAside = null; let asideNext = 0; const setAside = []; let cameBack = 0; const builds = []; let resumedChecked = false; const missionTimes = {}; let t0 = Date.now();
const firstLook = async (key, wait) => { if (seen.has(key)) return; seen.add(key); await shot(key, wait); await checkLayout(key); };
for (let guard = 0; guard < 900; guard++) {
  if (await p.evaluate(() => window.__filmDone)) break;
  if (await p.$('#modal:not(.hide) [data-act="ok"]')) break; // the record card: the hour is over
  const st = await stageNow(); if (!st) { await p.waitForTimeout(400); continue; }
  if (st === 'map') {
    await p.waitForSelector('#module [data-fm-map]');
    if (missions === 2 && !resumedChecked) { // leave mid-hour and come back: the map keeps the finished missions
      resumedChecked = true; checks.beforeLeaving = await mapCount(); await click('#module .modback'); await p.waitForFunction(() => window.__filmDone, null, { timeout: 60000 });
      await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 60000 }); await open(); await p.waitForSelector('#module [data-fm-map]', { timeout: LONG });
      checks.afterComingBack = await mapCount(); checks.comeBackLine = await said(); await shot('map-after-coming-back', 1200); continue;
    }
    if (missions === 1 && !checks.replayOffered) { checks.replayOffered = await p.evaluate(() => !!document.querySelector('#module .fm-mcard.done[data-fm-mission="0"]')); await click('#module [data-fm-mission="0"]'); await p.waitForSelector('#module [data-fm-intro="crew"]'); await click('#module [data-fm-tomap]'); continue; }
    if (only < 6 && missions >= only) break;
    if (await p.$('#module [data-fm-finish]')) { await shot('map-all-done', 800); await checkLayout('map done'); await click('#module [data-fm-finish]'); continue; }
    await click('#module [data-fm-carry]'); continue;
  }
  if (st.startsWith('intro-')) { mission = st.slice(6); t0 = Date.now(); await firstLook(`${mission}-intro`, 700); await click('#module [data-fm-start]'); continue; }
  if (st.startsWith('outro-')) { missionTimes[mission] = Math.round((Date.now() - t0) / 1000); missions++; await firstLook(`${mission}-outro`, 500); await click('#module [data-fm-tomap]'); continue; }
  if (/^(part-|note|honest|pace-ok)/.test(st)) { await firstLook(`${mission}-${st}`, 600); await click('#module [data-fm-ok]'); continue; }
  if (st === 'ask') {
    asks++; await p.waitForSelector('#module [data-fm-ask]'); await firstLook(`${mission}-ask`, mission === 'crew' ? 1500 : 500);
    // every ninth question with three or more choices: two wrong answers. The question is set aside (no answer shown)
    // and comes back at the end of its part.
    const nOpts = (await p.$$('#module [data-fm-opt]')).length; const kickNow = await p.textContent('#module .fm-qhead .fm-kick').catch(() => '');
    if (asks % 9 === 4 && nOpts >= 3 && !/again/.test(kickNow)) {
      // wrong tiles until it is set aside: one miss on three choices, two on four or more
      const qText = await p.textContent('#module [data-fm-ask] h2'); let misses = 0;
      for (const w of await p.$$eval('#module [data-fm-opt]:not([data-fm-right])', (els) => els.map((e) => e.dataset.fmOpt))) {
        if (await p.$('#module [data-fm-next]:not([hidden])')) break; await click(`#module [data-fm-opt="${w}"]`); misses++;
      }
      setAside.push({ q: qText, misses, opts: nOpts, said: await said(), shown: !!(await p.$('#module .fm-opt.right')), left: (await p.$$('#module [data-fm-opt]:not(.off)')).length, next: !!(await p.$('#module [data-fm-next]:not([hidden])')) });
      await firstLook(`${mission}-set-aside`, 300); await click('#module [data-fm-next]'); lastAside = qText; continue;
    }
    if (/again/.test(kickNow)) cameBack++;
    // a question set aside never comes straight back on the very next screen
    if (lastAside) { if (/again/.test(kickNow) && /at the end/.test(setAside[setAside.length - 1].said)) asideNext++; lastAside = null; } // many questions share a heading: the "again" mark tells
    // every other question: one wrong answer first. Florence says why, and the right one is still to find.
    // (only where one miss does not set it aside: four choices or more, or a question already on its second go)
    if (asks % 2 === 0 && (nOpts >= 4 || /again/.test(kickNow))) { const wrong = await p.$('#module [data-fm-opt]:not([data-fm-right])'); if (wrong) { await wrong.click(); wrongTried++; await p.waitForTimeout(150); const line = await said(); wrongLines.push(line); if (await p.$('#module .fm-opt.right') && !/The answer is/.test(line)) wrongGaveAway++; if (!seen.has(`${mission}-wrong`)) await firstLook(`${mission}-wrong`, 300); } }
    if (await p.$('#module [data-fm-next]:not([hidden])')) { await click('#module [data-fm-next]'); continue; } // shown with its reason after a second go
    await click('#module [data-fm-right]'); if (mission === 'crew' && asks > 10 && !seen.has('crew-scene-filmed')) await firstLook('crew-scene-filmed', reduce ? 800 : 3500);
    if (!seen.has(`${mission}-right`)) await firstLook(`${mission}-right`, 300);
    await click('#module [data-fm-next]'); continue;
  }
  if (st === 'story') {
    const id = await p.getAttribute('#module [data-fm-story]', 'data-fm-story');
    if (await p.$('#module [data-fm-watch]')) { await firstLook(`story-${id}-solved`, 400); await click('#module [data-fm-watch]'); continue; }
    const order = await p.evaluate(async (sid) => (await import('./js/modules/film/m2-story.js')).STORIES.find((s) => s.id === sid).cards.map((c) => c.id), id);
    if (!story[id]) { // first: the cards as dealt (the wrong order), and Florence's hint
      story[id] = true; for (;;) { const c = await p.$('#module .fm-pool [data-fm-card]'); if (!c || await p.$('#module .fm-slots .fm-empty') === null) break; await c.click(); }
      await firstLook(`story-${id}-dealt`, 300); await click('#module [data-fm-check]'); story[id + 'Hint'] = await said();
      for (;;) { const c = await p.$('#module .fm-slots [data-fm-card]'); if (!c) break; await c.click(); }
    }
    for (const cid of order) await click(`#module .fm-pool [data-fm-card="${cid}"]`);
    await click('#module [data-fm-check]'); continue;
  }
  if (st === 'trim') {
    await firstLook('edit-trim', 400); await click('#module [data-fm-clip="r1"]'); await click('#module [data-fm-check]'); checks.trimKeepLine = await said(); await click('#module [data-fm-clip="r1"]');
    for (const id of await p.$$eval('#module [data-fm-clip][data-fm-right]', (els) => els.map((e) => e.dataset.fmClip))) await click(`#module [data-fm-clip="${id}"]`); // the panel redraws on every tap
    await click('#module [data-fm-check]'); checks.trimLine = await said(); await click('#module [data-fm-next]'); continue;
  }
  if (st === 'pace') {
    const id = await p.getAttribute('#module [data-fm-pace]', 'data-fm-pace');
    if (id === 'fast' && !paceFastTried) { paceFastTried = true; await firstLook('edit-pace', 400); await click('#module [data-fm-watch]'); continue; } // all medium: too slow for a trailer
    if (id === 'fast') checks.paceTooSlowLine = await said();
    // four quick and one medium (9 s, average 1.8 s), or four long and one medium (23 s, average 4.6 s): both routes pass
    for (let i = 0; i < 5; i++) await click(`#module [data-fm-len="${i === 4 ? 'medium' : id === 'fast' ? 'quick' : 'long'}"][data-i="${i}"]`);
    if (id === 'slow') await firstLook('edit-pace-slow', 300);
    await click('#module [data-fm-watch]'); continue;
  }
  if (st === 'build') {
    const id = await p.getAttribute('#module [data-fm-build]', 'data-fm-build'); await firstLook(`build-${id}`, 400);
    const n = (await p.$$('#module [data-fm-good]')).length;
    await click('#module [data-fm-good="0"]'); await click('#module [data-fm-check]'); const hint = await said(); // only who is speaking: Florence says what is missing
    for (let k = 1; k < n; k++) await click(`#module [data-fm-good="${k}"]`);
    await click('#module [data-fm-check]'); builds.push({ id, hint, done: await said(), caption: await p.textContent('#module .fm-capline') });
    await firstLook(`build-${id}-done`, 300); await click('#module [data-fm-next]'); continue;
  }
  if (st === 'film') {
    await firstLook(`${mission}-film`, 600);
    if (reduce) { const nx = await p.$('#module [data-fm-nextshot]:not([hidden])'); if (nx) await nx.click().catch(() => {}); else await p.waitForTimeout(200); }
    else await p.waitForTimeout(800);
    continue;
  }
  if (st === 'show') { await firstLook('access-show', 400); if (reduce) await click('#module [data-fm-ok]'); else await p.waitForTimeout(800); continue; }
  // ---- mission 3, as it was built: brief, first cut, feedback, new cut, finish
  if (st === 'brief-place') { await firstLook('direct-brief', 800); await click('#module [data-fm-pick]'); await click('#module [data-fm-next]:not(:disabled)'); continue; }
  if (st === 'brief-who') {
    const missing = await p.evaluate(() => [...document.querySelectorAll('#module [data-fm-pick]')].map((x) => x.dataset.fmPick)); void missing;
    await click('#module [data-fm-pick="florence"]'); await click('#module [data-fm-next]:not(:disabled)'); continue;
  }
  if (st === 'brief-mood') { await click('#module [data-fm-pick="cheerful"]'); await click('#module [data-fm-next]:not(:disabled)'); continue; }
  if (st === 'board') {
    await firstLook(`direct-board-${m3.plays}`, 800);
    if (m3.plays === 0) { m3.plays++; await click('#module [data-fm-watch]'); continue; }
    if (!m3.fed) { m3.fed = true; await click('#module [data-fm-fb="shorter"]'); await click('#module [data-fm-fb="town"]'); checks.m3FeedbackLine = await said(); m3.plays++; await click('#module [data-fm-watch]'); continue; }
    await click('#module [data-fm-finish]'); continue;
  }
  await p.waitForTimeout(300);
}
checks.setAside = setAside; checks.asideCameStraightBack = asideNext; checks.cameBack = cameBack; checks.builds = builds; checks.missionTimesSecs = missionTimes; checks.asks = asks; checks.wrongTried = wrongTried; checks.wrongGaveAway = wrongGaveAway; checks.wrongLines = wrongLines.slice(0, 6); checks.storyHints = Object.fromEntries(Object.entries(story).filter(([k]) => /Hint/.test(k)));

if (only >= 6) {
  // ---------- the record, "Talk it over" and the break
  await p.waitForSelector('#modal:not(.hide) [data-act="ok"]', { timeout: LONG }); await shot('record-card', 800);
  checks.card = await p.evaluate(() => document.querySelector('#modal').innerText.replace(/\s+/g, ' ').slice(0, 900));
  await click('#modal:not(.hide) [data-act="ok"]');
  // the loader's shared end of a part: "Jobs that use this" (newer builds), then "Talk it over", then the break
  await p.waitForSelector('#modal:not(.hide) [data-act="go"]', { timeout: 120000 });
  if (await p.$('#modal:not(.hide) .jobs')) { checks.jobsScreen = true; await shot('jobs', 600); await click('#modal:not(.hide) [data-act="go"]'); await p.waitForSelector('#modal:not(.hide) .talkqs', { timeout: 120000 }); }
  await shot('talk-it-over', 600); await click('#modal:not(.hide) [data-act="go"]');
  await p.waitForSelector('#modal:not(.hide) [data-act="stay"]', { timeout: 120000 }); await shot('break', 600); await click('#modal:not(.hide) [data-act="stay"]');
  await p.waitForFunction(() => window.__filmDone, null, { timeout: 120000 });
  const result = await p.evaluate(() => window.__film);
  checks.finished = result?.finished; checks.title = result?.record?.made.title; checks.lines = result?.record?.made.lines; checks.practised = result?.record?.practised;
  const pic = result?.record?.made.picture || ''; checks.picture = /^<svg/.test(pic) && pic.length < 200000 && !/<script|on\w+\s*=|javascript:/i.test(pic) ? `${pic.length} characters of SVG` : 'bad';
  checks.townKind = result?.town?.kind;
  checks.saved = await p.evaluate(() => { const m = window.__eco.app.G.modules?.film; return { done: m?.done, missions: m?.state?.done, bytes: JSON.stringify(m?.state || {}).length }; });
  await p.waitForTimeout(2500);
  checks.sceneAfter = (await filmNames()).join(','); checks.lightBackAtEnd = await lightOk();
  checks.moduleLayerGone = await p.evaluate(() => !document.getElementById('module') && !document.documentElement.dataset.module);
  await p.evaluate(async () => { const a = window.__eco.app; await a.rig.overview(0.01, true); }); await shot('screen-in-the-town', 2500);
  if (pic) fs.writeFileSync(`${out}/${tag}-take-home.svg`, pic);
  // playing again: the map, every mission ticked
  await open(); await p.waitForSelector('#module [data-fm-map]', { timeout: LONG }); checks.againAllTicked = await mapCount(); await click('#module .modback'); await p.waitForFunction(() => window.__filmDone, null, { timeout: 60000 });
}
checks.spoken = await p.evaluate(() => window.__sayLog.length);
const endOk = only < 6 || (checks.finished === true && checks.lines?.length === 6 && checks.practised?.length >= 2 && checks.picture !== 'bad' && checks.townKind === 'film-screen' && checks.saved.done === true && checks.saved.missions?.every(Boolean)
  && checks.sceneAfter === 'film-screen' && checks.lightBackAtEnd && checks.moduleLayerGone && checks.againAllTicked === 6 && checks.saved.bytes < 8000);
const ok = endOk && checks.mapFirst.done === 0 && checks.mapFirst.locked === 5 && /open in order/.test(checks.lockedLine) && checks.leftEarly === false && checks.lightBack && checks.sceneAfterLeaving === ''
  && (only < 3 || (checks.beforeLeaving === 2 && checks.afterComingBack === 2 && checks.replayOffered)) && wrongTried > 0 && wrongGaveAway === 0
  && setAside.length > 0 && setAside.every((x) => !x.shown && x.next && x.misses === x.opts - 2 && /comes back|come back/.test(x.said)) && asideNext === 0 && cameBack >= setAside.length && (only < 5 || builds.length === (band === 'junior' ? 1 : 2))
  && !layoutBad.length && !errors.length && !outside.length;
console.log(JSON.stringify({ ok, band, reduce, size: `${W}x${H}`, empty, full, large, checks, layoutBad, errors, outside, shots: shots.length }, null, 2));
await b.close();
process.exit(ok ? 0 : 1);
