// Browser run of the "Town film studio" module (js/modules/film), from start to finish, with screenshots.
// Usage: node tests/playwright/film.mjs [baseUrl] [outDir]      (serve games/ecotown/game first, port 8814)
//   BAND=senior    ages 13-17 (shot order and a chosen title). Default: junior.
//   REDUCE=0       play with motion (the camera moves; the film plays by itself). Default: reduced motion (stills and Next).
//   SIZE=1024x768  the window. Default 1280x800.
//   TOWN=empty     a new town with nothing built (the island's own landmarks; no family to film). Default: a small town.
//   LARGE=1        large text.
// It starts a town, opens the module, leaves at once (nothing kept), opens it again, briefs Florence, asks for
// someone who is not in the town (she says so), watches the first cut, gives feedback, leaves and comes back (the
// film is still there), watches the new cut, finishes, and checks the record, the screen left in the town, that the
// light is back as it was, and that the page logged no errors and asked for nothing outside.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8814/', out = 'shots-film'] = process.argv.slice(2);
const band = process.env.BAND === 'senior' ? 'senior' : 'junior'; const reduce = process.env.REDUCE !== '0'; const empty = process.env.TOWN === 'empty'; const full = process.env.TOWN === 'full'; const large = process.env.LARGE === '1';
const [W, H] = (process.env.SIZE || '1280x800').split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H } }); p.setDefaultTimeout(180000); // a busy machine in software 3D can take a while to answer a click
await p.addInitScript(([r, l]) => { window.__sayLog = []; if (!r) window.__filmPace = 9; // with motion the film is stretched, so each moving shot can be photographed in slow software 3D
  localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce: r, ...(l ? { text: 'large' } : {}) })); }, [reduce, large]);
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const outside = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url()); });
await p.addLocatorHandler(p.locator('#episode [data-skip]'), async (skip) => { await skip.click(); });
const tag = `${band}${reduce ? '' : '-motion'}${empty ? '-empty' : full ? '-full' : ''}${large ? '-large' : ''}-${W}`; let n = 0; const shots = [];
const shot = async (name, wait = 700) => { await p.waitForTimeout(wait); const f = `${out}/${tag}-${String(++n).padStart(2, '0')}-${name}.png`; const t0 = Date.now(); await p.screenshot({ path: f, timeout: 240000 }); shots.push(f); if (process.env.TIMES) console.error(name, Date.now() - t0, 'ms'); };
const LONG = 600000;
const click = async (sel, t = LONG) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.click(sel); };
const checks = {}; const innerW = W;
const stage = (s) => p.waitForSelector(`#module .modroot[data-fm-stage="${s}"]`, { timeout: LONG });
const said = () => p.textContent('#module .fm-talk p');
const board = () => p.evaluate(() => { const f = document.querySelector('#module .fm-frames'); return f && { shots: +f.dataset.shots, cut: +f.dataset.cut, mood: f.dataset.mood, secs: +f.dataset.secs,
  tags: [...f.querySelectorAll('.fm-shot')].map((li) => li.querySelector('.fm-tag')?.textContent || ''), caps: [...f.querySelectorAll('.fm-shot')].map((li) => li.querySelector('b').textContent + ' · ' + li.querySelector(':scope > span').textContent),
  fb: document.querySelectorAll('#module [data-fm-fb]').length, finish: !!document.querySelector('#module [data-fm-finish]') }; });
// no text may be clipped or run outside its box, and nothing may hang off the screen
const layout = () => p.evaluate(() => { const bad = []; const vw = innerWidth, vh = innerHeight;
  for (const e of document.querySelectorAll('#module .fm-talk, #module .fm-brief, #module .fm-board, #module .fm-card:not([hidden]), #module .fm-bar.bottom, #module button')) { const r = e.getBoundingClientRect(); if (!r.width) continue; if (r.left < -1 || r.right > vw + 1 || r.top < -1 || r.bottom > vh + 1) bad.push(`off screen: ${e.className || e.textContent.slice(0, 20)}`); }
  for (const e of document.querySelectorAll('#module button, #module .fm-shot b, #module .fm-shot > span, #module .fm-ghost span, #module .fm-chip, #module .fm-talk p, #module .fm-card h2')) { if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).display !== 'inline') bad.push(`clipped: ${e.textContent.trim().slice(0, 30)}`); }
  const back = document.querySelector('#module .modback').getBoundingClientRect(); const talk = document.querySelector('#module .fm-talk'); if (talk && !talk.hidden) { const r = talk.getBoundingClientRect(); if (r.left < back.right && r.top < back.bottom && r.bottom > back.top) bad.push('Florence\'s line is under the Back button'); }
  for (const btn of document.querySelectorAll('#module button')) { const r = btn.getBoundingClientRect(); if (r.width && (r.height < 40 || r.width < 40)) bad.push(`small button: ${btn.textContent.trim().slice(0, 20)} ${Math.round(r.width)}x${Math.round(r.height)}`); }
  return bad; });
const layoutBad = []; const checkLayout = async (where) => { for (const x of await layout()) layoutBad.push(`${where}: ${x}`); };
const filmNames = () => p.evaluate(() => window.__eco.app.stage.scene.children.map((c) => c.name).filter((x) => /^film/.test(x)));

// ---------- a town of the child's own
await p.goto(base + 'index.html');
await click(`[data-band="${band}"]`, 120000);
await click('[data-name]'); await click('[data-go]');
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: 180000 }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForSelector('#build [data-cat="land"]', { timeout: 240000 });
if (!empty) await p.evaluate((noOtters) => { const { G } = window.__eco.app;
  for (const [k, item] of [['6,3', 'timber'], ['7,3', 'straw'], ['7,4', 'timber'], ['11,5', 'cohousing'], ['8,5', 'market'], ['9,5', 'hall'], ['11,3', 'school'], ['10,4', 'park']]) { G.placeAt(k, 'town', { free: true }); G.placeAt(k, item, { free: true }); }
  // paths over the wetland: the otters leave, so Florence has to say she cannot film them
  if (noOtters) for (const t of [...window.__eco.terrain.tiles.values()].filter((x) => x.zone === 'wetland')) G.placeAt(t.k, 'path', { free: true });
}, band === 'junior');
// TOWN=full: as much of the island built as a free tap allows (homes, food, power, a heart), to see the module over a crowded town
if (full) await p.evaluate(() => { const { G } = window.__eco.app; const kinds = ['timber', 'straw', 'cohousing', 'mixed', 'orchard', 'wind', 'solar', 'park', 'earth', 'allot', 'hives', 'repair', 'heatpump', 'battery', 'compost', 'raingarden'];
  let i = 0; for (const t of [...window.__eco.terrain.tiles.values()]) { if (t.zone === 'wetland' || G.cells.get(t.k)?.item) continue; const item = kinds[i++ % kinds.length]; G.placeAt(t.k, 'town', { free: true }); try { G.placeAt(t.k, item, { free: true, replace: true }); } catch {} } });
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 120000 });
const missing = empty ? 'family' : band === 'junior' ? 'otters' : null; const who = empty ? 'otters' : 'family';
checks.town = await p.evaluate(() => ({ builds: [...window.__eco.app.G.cells].filter(([, c]) => c.item).length, otters: !!window.__eco.app.G.sim?.().species?.otters }));

// ---------- open the module; leave at once with the one way back: nothing is kept, the light is as it was
await p.evaluate(() => { window.__first = window.__eco.openModule('film'); });
await stage('brief-place'); await p.waitForTimeout(1500);
await click('#module .modback'); checks.leftEarly = await p.evaluate(() => window.__first);
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 60000 });
await p.waitForTimeout(1500); const lightOk = () => p.evaluate(() => Math.abs(window.__eco.app.stage.hour - window.__eco.app.hour) < 0.3 && window.__eco.app.stage.winter === 0); // the town's own clock sets the light again
checks.lightBack = await lightOk(); checks.sceneAfterLeaving = (await filmNames()).join(',');
checks.keysBack = await p.evaluate(() => !document.getElementById('module'));

// ---------- 1. the brief: a place, who is in it, a mood
await p.evaluate(() => { window.__filmDone = false; window.__film = window.__eco.openModule('film').then((r) => { window.__filmDone = true; return r; }); });
await stage('brief-place'); await p.waitForTimeout(reduce ? 800 : 2500); await shot('brief-place'); await checkLayout('place');
checks.places = await p.evaluate(() => [...document.querySelectorAll('#module [data-fm-pick]')].map((x) => x.dataset.fmPick));
checks.nextWaits = await p.evaluate(() => document.querySelector('#module [data-fm-next]').disabled);
checks.firstLine = await said();
// the game's own keys do nothing while the module is open (B would open the build bar; arrows would move a tile cursor)
await p.keyboard.press('1'); await p.keyboard.press('ArrowLeft'); await p.keyboard.press('Escape'); checks.stillOpen = await p.evaluate(() => !!document.getElementById('module'));
const placeId = checks.places[0];
await click(`#module [data-fm-pick="${placeId}"]`); await p.waitForTimeout(reduce ? 600 : 2600); checks.placeLine = await said(); await shot('brief-place-picked');
await click('#module [data-fm-next]'); await stage('brief-who');
if (missing) { await click(`#module [data-fm-pick="${missing}"]`); checks.missingLine = await said(); checks.missingMarked = await p.evaluate((m) => document.querySelector(`#module [data-fm-pick="${m}"]`).classList.contains('off') && document.querySelector('#module [data-fm-next]').disabled, missing); await shot('brief-who-not-there'); await checkLayout('who-missing'); }
await click(`#module [data-fm-pick="${who}"]`); await p.waitForTimeout(reduce ? 600 : 2600); checks.whoLine = await said(); await shot('brief-who');
// back a step and forward again: the choice is kept
await click('#module [data-fm-prev]'); await stage('brief-place'); checks.backKeeps = await p.evaluate((id) => document.querySelector(`#module [data-fm-pick="${id}"]`).classList.contains('picked'), placeId);
await click('#module [data-fm-next]'); await stage('brief-who'); await click('#module [data-fm-next]'); await stage('brief-mood');
const mood = band === 'junior' ? 'calm' : 'party';
await click(`#module [data-fm-pick="${mood}"]`); await p.waitForTimeout(reduce ? 600 : 2600); checks.moodLine = await said(); await shot('brief-mood'); await checkLayout('mood');
await click('#module [data-fm-next]');

// ---------- 2. Florence's first cut on the storyboard
await stage('board'); await p.waitForSelector('#module [data-fm-board]'); await p.waitForTimeout(reduce ? 600 : 2000);
const first = await board(); checks.firstCut = first; checks.firstCutLine = await said(); await shot('storyboard-first-cut'); await checkLayout('first cut');
checks.frameDrawings = await p.evaluate(() => [...document.querySelectorAll('#module .fm-pic svg')].every((s) => s.querySelectorAll('path, rect, circle').length > 6));

// ---------- 3. watch it. With reduced motion each shot is a still with Next; with motion it plays by itself.
async function watch(name, { skipAfter = 99 } = {}) {
  await p.evaluate(() => { window.__fmSeen = []; window.__fmObs?.disconnect(); const m = document.getElementById('module');
    window.__fmObs = new MutationObserver(() => { const s = m.querySelector('[data-fm-film]')?.dataset.fmShot; if (s && window.__fmSeen[window.__fmSeen.length - 1] !== s) window.__fmSeen.push(s); });
    window.__fmObs.observe(m, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-fm-shot'] }); });
  await click('#module [data-fm-watch]'); await stage('film'); const seen = [];
  await p.waitForSelector('#module [data-fm-film][data-fm-shot="title"]', { timeout: LONG }); seen.push('title'); await shot(`${name}-title`, 900); await checkLayout(`${name} title`);
  const total = (await board()) || null; void total;
  for (let i = 0; i < 8; i++) {
    if (reduce) await click('#module [data-fm-nextshot]');
    const at = await p.waitForFunction((was) => { const f = document.querySelector('#module [data-fm-film]'); if (!f) return 'closed'; const s = f.dataset.fmShot; return s !== was && s; }, seen[seen.length - 1], { timeout: LONG }).then((h) => h.jsonValue());
    if (at === 'closed') break; seen.push(at);
    if (at === 'end') { await shot(`${name}-end-card`, 500); await checkLayout(`${name} end`); if (reduce) await click('#module [data-fm-nextshot]'); break; }
    await shot(`${name}-shot-${+at + 1}`, reduce ? 900 : 9000); if (i === 0) await checkLayout(`${name} shot`);
    if (+at + 1 >= skipAfter) { await click('#module [data-fm-skip]'); seen.push('skipped'); break; }
  }
  await stage('board');
  // on a very busy machine a screenshot can take longer than the end card is shown: the page itself noted every card
  const all = await p.evaluate(() => window.__fmSeen || []); if (!seen.includes('skipped')) for (const s of all) if (!seen.includes(s)) seen.push(s);
  return seen;
}
checks.firstWatch = await watch('cut1');
checks.afterFirstLine = await said(); const after1 = await board(); checks.feedbackTiles = after1.fb; checks.canFinishAfterWatching = after1.finish;
await shot('storyboard-after-first-cut'); await checkLayout('after first cut');

// ---------- 4. feedback from tiles: the storyboard shows what each piece changed
const give = async (id) => { await click(`#module [data-fm-fb="${id}"]`); await p.waitForTimeout(250); return { line: await said(), board: await board() }; };
const fb = {};
fb.shorter = await give('shorter'); fb.school = await give('school'); fb.town = await give('town');
if (missing) fb.missing = await give(missing);
fb.music = await give(band === 'junior' ? 'livelier' : 'calmer');
checks.feedback = Object.fromEntries(Object.entries(fb).map(([k, v]) => [k, v.line]));
checks.afterFeedback = fb.music.board; await p.waitForTimeout(reduce ? 400 : 1800); await shot('storyboard-feedback-marked'); await checkLayout('feedback');
checks.goneShown = await p.evaluate(() => document.querySelectorAll('#module .fm-ghost').length);
checks.musicMarked = await p.evaluate(() => !!document.querySelector('#module .fm-chip.music.changed'));
if (band === 'senior') {
  await click('#module .fm-shot:not(.new) [data-fm-move="1"]:not(:disabled)'); checks.movedLine = await said(); checks.movedTag = (await board()).tags.includes('Moved');
  const t0 = await p.textContent('#module .fm-head h2'); await click('#module [data-fm-title]'); checks.titleChanged = (await p.textContent('#module .fm-head h2')) !== t0; checks.titleLine = await said();
  await shot('storyboard-senior-order-and-title');
} else checks.noSeniorControls = await p.evaluate(() => !document.querySelector('#module [data-fm-move], #module [data-fm-title]'));
const before = await board();

// ---------- leave early and come back: the film is as it was left
await click('#module .modback'); await p.waitForFunction(() => window.__filmDone, null, { timeout: 60000 });
checks.leftMidway = await p.evaluate(() => window.__film.then((r) => r && r.finished));
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 60000 });
await p.evaluate(() => { window.__filmDone = false; window.__film = window.__eco.openModule('film').then((r) => { window.__filmDone = true; return r; }); });
await stage('board'); const resumed = await board(); checks.resumedLine = await said();
checks.resumed = resumed.cut === before.cut && resumed.shots === before.shots && resumed.mood === before.mood && JSON.stringify(resumed.caps) === JSON.stringify(before.caps) && resumed.finish;
await shot('storyboard-resumed', reduce ? 700 : 2000);

// ---------- 5. watch the new cut (with motion: skip part way, to try Skip), then finish
checks.secondWatch = await watch('cut2', { skipAfter: reduce ? 99 : 3 });
checks.afterSecondLine = await said(); await shot('storyboard-after-second-cut');
await click('#module [data-fm-finish]');
await p.waitForSelector('#modal:not(.hide) [data-act="ok"]', { timeout: 120000 }); await shot('record-card');
checks.card = await p.evaluate(() => document.querySelector('#modal').innerText.replace(/\s+/g, ' ').slice(0, 700));
await click('#modal:not(.hide) [data-act="ok"]');
await p.waitForFunction(() => window.__filmDone, null, { timeout: 120000 });
const result = await p.evaluate(() => window.__film);
checks.finished = result?.finished; checks.title = result?.record?.made.title; checks.lines = result?.record?.made.lines; checks.practised = result?.record?.practised;
const pic = result?.record?.made.picture || ''; checks.picture = /^<svg/.test(pic) && pic.length < 200000 && !/<script|on\w+\s*=|javascript:/i.test(pic) ? `${pic.length} characters of SVG` : 'bad';
checks.townKind = result?.town?.kind; checks.townShots = result?.town?.data?.shots?.length;
checks.saved = await p.evaluate(() => { const m = window.__eco.app.G.modules?.film; return { done: m?.done, times: m?.times, stateDone: m?.state?.done, town: m?.town?.kind }; });
await p.waitForTimeout(3000);
checks.sceneAfter = (await filmNames()).join(','); // only the screen in the town
checks.moduleLayerGone = await p.evaluate(() => !document.getElementById('module') && !document.documentElement.dataset.module);
checks.lightBackAtEnd = await lightOk();
await shot('screen-in-the-town', 2500);
// the screen is really drawn (its picture has arrived), and is big enough to find from the island's usual view
checks.screen = await p.evaluate(async () => { const a = window.__eco.app; await a.rig.overview(0.01, true); await new Promise((r) => setTimeout(r, 1500));
  const s = a.stage.scene.children.find((c) => c.name === 'film-screen'); if (!s) return null; const T = a.stage.camera.position.constructor; const [w, h, legs] = s.userData.size; s.updateMatrixWorld(true);
  const px = (x, y) => { const v = new T(x, y, 0.05).applyMatrix4(s.matrixWorld).project(a.stage.camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]; };
  const A = px(-w / 2, legs), B = px(w / 2, legs + h); const pic = s.children.find((c) => c.material?.map); const cv = pic.material.map.image; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; const cols = new Set(); for (let i = 0; i < d.length; i += 4 * 997) cols.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
  return { drawn: s.userData.drawn || 0, wide: Math.round(Math.abs(B[0] - A[0])), high: Math.round(Math.abs(B[1] - A[1])), onScreen: A[0] > 0 && B[0] < innerWidth && B[1] > 0 && A[1] < innerHeight, colours: cols.size }; });
// the screen, close to
await p.evaluate(() => { const a = window.__eco.app; const s = a.stage.scene.children.find((c) => c.name === 'film-screen'); if (s) a.rig.focus(s.position.clone().setY(s.position.y + 4), { dist: 60 }, 0.01); });
await shot('screen-close', 3500);
if (pic) fs.writeFileSync(`${out}/${tag}-take-home.svg`, pic);
checks.everyStepSpoken = await p.evaluate(() => ['pick the place|choose the place', 'who is in it', 'mood', 'first cut', 'first try|first draft', 'Shorter', 'Welcome back'].every((re) => window.__sayLog.some((s) => new RegExp(re).test(s.text || s))));

// ---------- play again: a new film starts from the first question; then leave
await p.evaluate(() => { window.__again = window.__eco.openModule('film'); });
await stage('brief-place'); checks.againStartsNew = await p.evaluate(() => !document.querySelector('#module .fm-tile.picked')); checks.sceneWhileOpen = (await filmNames()).join(',');
await click('#module .modback'); await p.evaluate(() => window.__again); await p.waitForTimeout(1500);
checks.screenStillThere = (await filmNames()).join(','); checks.stillDone = await p.evaluate(() => window.__eco.app.G.modules?.film?.done === true);

const ok = checks.finished === true && !!checks.title && checks.practised?.length >= 2 && checks.practised.length <= 4 && checks.lines?.length >= 3 && checks.lines.some((l) => /After cut 1, asked for: .*shorter/.test(l))
  && checks.picture !== 'bad' && checks.townKind === 'film-screen' && checks.screen?.drawn >= 1 && checks.screen.colours >= 4 && checks.screen.onScreen && checks.screen.wide >= Math.min(60, innerW * 0.05) && checks.saved.done === true && checks.saved.stateDone === true
  && checks.leftEarly?.finished !== true && checks.leftMidway !== true && checks.lightBack && checks.lightBackAtEnd && checks.sceneAfterLeaving === '' && checks.sceneAfter === 'film-screen' && checks.screenStillThere === 'film-screen' && checks.sceneWhileOpen === ''
  && checks.moduleLayerGone && checks.stillOpen && checks.nextWaits && checks.backKeeps && checks.frameDrawings
  && first.shots >= 4 && first.shots <= 6 && first.fb === 0 && !first.finish && checks.feedbackTiles === 8 && checks.canFinishAfterWatching
  && checks.firstWatch[0] === 'title' && checks.firstWatch.includes('end') && (!reduce || checks.firstWatch.length === first.shots + 2) && (reduce || checks.secondWatch.includes('skipped'))
  && fb.shorter.board.shots === first.shots - 1 && fb.shorter.board.cut === 2 && checks.goneShown >= 1 && fb.school.board.tags.includes('New') && /school/.test(fb.school.board.caps[0]) && /whole town/.test(fb.town.board.caps[fb.town.board.caps.length - 1])
  && fb.music.board.mood !== first.mood && checks.musicMarked && (!missing || (/I can only film what is there/.test(checks.missingLine) && checks.missingMarked && /I can only film what is there/.test(fb.missing.line) && fb.missing.board.shots === fb.town.board.shots))
  && (band === 'senior' ? checks.movedTag && checks.titleChanged : checks.noSeniorControls)
  && checks.resumed && /Welcome back/.test(checks.resumedLine) && checks.againStartsNew && checks.stillDone && checks.everyStepSpoken
  && !layoutBad.length && !errors.length && !outside.length;
console.log(JSON.stringify({ ok, band, reduce, size: `${W}x${H}`, empty, large, checks, layoutBad, errors, outside, shots }, null, 2));
await b.close();
process.exit(ok ? 0 : 1);
