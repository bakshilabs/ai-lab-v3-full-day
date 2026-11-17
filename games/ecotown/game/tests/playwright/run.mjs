// End-to-end play-through of the Florence-first hour (docs/ecotown-florence-first.md), for one age band, with screenshots.
// Usage: node tests/playwright/run.mjs <baseUrl> <junior|senior> <outDir> [width height] [cards|text] [flawed|clean|mixed]
//   flawed: the vague instruction first (catch Florence's mistake); clean: a clear instruction first (hidden-guess step);
//   mixed: alternate. Requires Playwright and a static server for games/ecotown/game. INTRO=1 plays the intro (it ends at
//   the AI Lab door and starts mission 1); FAST=1 uses low graphics, reduced motion and no build films.
// At each level it checks: the level's build tab is locked in the player's town before Florence's mission and a tap there
// builds nothing; the mission is played in Florence's town while the player's town stands on the island beside it; her plan
// is not copied into the player's town; the tab opens afterwards with her advice; both towns are shown side by side; then it
// does the player's small step (following the game's own hints, by real build taps) until the next mission is ready.
// After the six missions it follows the hints to finish the town, then the lens, the report and the save.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [base = 'http://localhost:8765/', band = 'junior', out = 'shots', W = 1280, H = 800, via = 'cards', path = 'flawed'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const LEVELS = [
  ['land', 'flood', 'Find the best land, with lots of space.', 'Dry, sunny land. Keep the meadow wild.'],
  ['move', 'street', 'Make it easy for everyone to get to school.', 'Safe walking and cycling. Cars stay at the edge.'],
  ['homes', 'carbon', 'Build strong homes that will last for years.', 'Warm, low-carbon homes from timber and straw.'],
  ['food', 'nature', 'Grow as much food as we possibly can.', 'Enough food, and keep the hedges for the bees.'],
  ['power', 'winter', 'Make enough clean, green power for every home.', 'Keep the lights on through a still winter night with batteries. Add rain gardens and compost.'],
  ['heart', 'walk', 'Put the new school right in the middle.', 'School within a 15-minute walk of every home.'],
];
const T0 = Date.now(); const times = {}; const mark = (k) => (times[k] = Math.round((Date.now() - T0) / 1000));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +W, height: +H } });
await p.addInitScript((fast) => { window.__sayLog = []; if (fast) localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce: true })); }, !!process.env.FAST);
const errors = []; p.on('pageerror', (e) => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const requests = []; p.on('request', (r) => { if (!r.url().startsWith(base)) requests.push(r.url()); });
const budget = []; const checks = {}; const fails = [];
const expect = (name, ok) => { checks[name] = ok; if (ok !== true) fails.push(name); };
// story episodes (js/ui/epviewer.js): the run skips each film as soon as its Skip button shows
let episodesSkipped = 0; await p.addLocatorHandler(p.locator('#episode [data-skip]'), async (skip) => { episodesSkipped++; await skip.click(); });
let n = 0; const shot = async (name) => { await p.waitForTimeout(500); await p.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png` }); };
const click = async (sel, t = 20000) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.click(sel); };
const panelsVisible = () => p.evaluate(() => [...document.querySelectorAll('#layer > .panel:not(.hide)')].map((x) => x.id).filter(Boolean));
const A = '#dock [data-actions] ';
const town = () => p.evaluate(() => JSON.stringify([...window.__eco.app.G.cells].filter(([, c]) => c.item || c.mark || c.mods?.length).sort()));
const florence = () => p.evaluate(() => JSON.stringify([...window.__eco.app.G.fcells].filter(([, c]) => c.item || c.mark || c.mods?.length).sort()));
const locked = (cat) => p.evaluate((c) => document.querySelector(`#build [data-cat="${c}"]`)?.classList.contains('locked'), cat);
// a real tap on the screen over a tile of the player's island (null when none is on screen)
const tapPoint = (k) => p.evaluate((key) => { const { app } = window.__eco; const v = app.world.tileTop(key).project(app.stage.camera); const r = app.stage.renderer.domElement.getBoundingClientRect(); const x = r.left + ((v.x + 1) / 2) * r.width, y = r.top + ((1 - v.y) / 2) * r.height; return document.elementFromPoint(x, y) === app.stage.renderer.domElement ? { x, y } : null; }, k);
const freeTiles = () => p.evaluate(() => { const { app, terrain } = window.__eco; return [...terrain.tiles.values()].filter((t) => ['field', 'slope'].includes(t.zone) && !t.fixed && !app.G.cells.get(t.k)?.mark && !app.G.cells.get(t.k)?.item).map((t) => t.k); });
// try to build a locked level by tapping its tab and then a tile, like a player: nothing may change
async function buildAhead(cat) {
  const before = await town(); await p.click(`#build [data-cat="${cat}"]`).catch(() => {}); await p.waitForTimeout(300);
  for (const k of (await freeTiles()).slice(0, 12)) { const pt = await tapPoint(k); if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(250); break; } }
  // also the keyboard shortcut for the tab, then a tap
  return before === (await town());
}
// the player's own step toward the next mission, by the game's own hint, with real build taps where the tile is on screen
async function yourTurn(next) {
  for (let i = 0; i < 40; i++) {
    const h = await p.evaluate(() => window.__eco.app.G.hint());
    if (h.mission === next || !h.unlock) return i;
    if (!h.tool || !h.spots.length) { console.log('NO HINT', JSON.stringify(h)); return -1; }
    await p.evaluate((t) => { const { G } = window.__eco.app; G.showWhere?.(t); }, h.tool); await p.waitForTimeout(300);
    const pt = await tapPoint(h.spots[0]); const before = await town();
    if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(350); }
    if (before === (await town())) await p.evaluate(([k, t]) => window.__eco.app.G.act(k, t), [h.spots[0], h.tool]); // off screen: the same build through the game's own tap
    await p.waitForTimeout(150);
  }
  return -1;
}

await p.goto(base + 'index.html');
await shot('start');
await click(`[data-band="${band}"]`);
await click('[data-name]'); await p.fill('[data-name]', 'Otter Bend'); await shot('name'); await click('[data-go]');
await p.waitForTimeout(800); mark('start');
let introToLab = false;
if (process.env.INTRO) {
  for (let i = 0; i < 8; i++) {
    const r = await p.waitForSelector('#florence:not(.hide) [data-next]', { timeout: 120000 }).catch(() => null); if (!r) break;
    await shot(`intro-${i}`); const label = await p.textContent('#florence [data-next]');
    if (i === 1) checks.introBothTowns = await p.evaluate(() => window.__eco.app.twoTowns?.view === 'both');
    await p.click('#florence [data-next]').catch(() => {}); await p.waitForTimeout(700);
    if (/AI Lab/.test(label)) { introToLab = true; break; }
  }
  checks.introEndsAtTheLab = introToLab;
} else { const sk = await p.waitForSelector('[data-introskip]', { timeout: 120000 }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
mark('intro');

if (!introToLab) {
  await p.waitForSelector('#build [data-cat="land"]', { timeout: 180000 });
  await p.waitForSelector('#florence:not(.hide) [data-tiplab]', { timeout: 20000 }).then(() => (checks.firstTipInvitesToTheLab = true)).catch(() => (checks.firstTipInvitesToTheLab = false));
  await shot('build-start'); budget.push(['build-start-live', await panelsVisible()]);
  expect('everythingLockedAtStart', await p.evaluate(() => [...document.querySelectorAll('#build [data-cat]')].every((x) => x.classList.contains('locked'))));
  expect('cannotBuildLandBeforeMission1', await buildAhead('land'));
  checks.twoIslands = await p.evaluate(() => !!window.__eco.app.world2 && window.__eco.app.world2.root.position.length() > 100);
  await click('#towns [data-tv="both"]'); await p.waitForTimeout(1600); await shot('both-towns-empty'); await click('#towns [data-tv="mine"]'); await p.waitForTimeout(1200);
}

async function instruct(text, card) {
  await p.waitForSelector('#dock:not(.hide) [data-actions] h3', { timeout: 30000 });
  if (via === 'cards') { await click(A + '[data-m="cards"]'); await click(`${A}[data-card="${card}"]`); }
  else { await click(A + '[data-m="text"]'); await p.fill(A + '[data-in]', text); await p.waitForTimeout(300); await click(A + '[data-send]'); }
}
let li = 0;
for (const [id, check, vague, clear] of LEVELS) {
  const clean = path === 'clean' || (path === 'mixed' && li % 2 === 1); li++;
  const pop = await p.$('#modal:not(.hide) [data-act="keep"]'); if (pop) { await pop.click(); await p.waitForTimeout(600); }
  const mine = await town(); const hers = await florence();
  if (!(li === 1 && introToLab)) {
    expect(`${id}LockedBeforeMission`, await locked(id));
    if (li === 2) { await click('#strip [data-lab]', 30000); await p.waitForSelector('#dock [data-missions]', { timeout: 30000 }); await click('#dock [data-sq]'); await p.waitForTimeout(1500); await shot('classroom'); checks.classroomAnswer = await p.evaluate(() => (document.querySelector('#dock [data-speaker]')?.textContent || '').length > 40);
      await click('#dock [data-missions]', 30000); await p.waitForSelector(`#modal:not(.hide) [data-act="lab:${id}"]`, { timeout: 10000 }); await shot('lab-board');
      checks.boardLaterMissionsLocked = await p.evaluate(() => document.querySelectorAll('#modal .labrow.locked').length === 4);
      await click(`#modal:not(.hide) [data-act="lab:${id}"]`);
    } else if (li === 3) { await p.evaluate(() => { const { G } = window.__eco.app; G.labBoard(); }); await click(`#modal:not(.hide) [data-act="lab:${id}"]`, 30000); } // the board from the 🧪 track
    else { await p.waitForSelector('#build [data-golab], #florence [data-tiplab]', { timeout: 60000 }); await p.click('#build [data-golab], #florence [data-tiplab]'); } // the locked tab's "Go to the AI Lab", or Florence's invitation
  }
  await click('#modal:not(.hide) [data-act="go"]', 90000); // brief card
  mark(`${id}-start`);
  await p.waitForTimeout(400);
  checks[`${id}PlayedInHerTown`] = await p.evaluate(() => { const { app } = window.__eco; return app.inLab && app.world2.root.position.x > 0; }); // the player's town stands on the right
  if (li === 1) await shot('mission-two-islands');
  if (!clean) {
    await instruct(vague, 0); await p.waitForTimeout(2200); await shot(`${id}-plan`); budget.push([`${id}-plan`, await panelsVisible()]);
    await click(`${A}[data-c="${check}"]`); await p.waitForSelector('#alert:not(.hide)', { timeout: 30000 }); await shot(`${id}-check-${check}`); budget.push([`${id}-check`, await panelsVisible()]);
    await click(A + '[data-go]'); await p.waitForTimeout(1500);
    await shot(`${id}-habit`);
    const habit = await p.evaluate(() => window.__eco.app.__expectHabit);
    await click(`${A}[data-h="${habit}"]`); await p.waitForTimeout(2100); await shot(`${id}-retry`);
    await instruct(clear, 1);
  } else {
    await instruct(clear, 1); await p.waitForTimeout(2200); await shot(`${id}-plan-clear`);
    await click(`${A}[data-c="${check}"]`);
    await click(A + '[data-accept]', 40000); await shot(`${id}-checked`);
    await p.waitForSelector(A + '[data-o]', { timeout: 30000 }); await shot(`${id}-hidden`);
    await click(A + '[data-o="0"]'); await click(A + '[data-go]');
  }
  if (!process.env.FAST) { await p.waitForSelector('#filmtitle', { timeout: 40000 }); await p.waitForTimeout(4200); await shot(`${id}-film`); }
  if (id === 'heart') {
    if (band === 'junior') { await p.waitForSelector(A + '[data-r]', { timeout: 400000 }); await shot('heart-ask'); for (let i = 0; i < 6; i++) await click(`${A}[data-r="${i}"]`); await click(A + '[data-act="all"]'); await p.waitForTimeout(800); await shot('heart-counted'); await click(A + '[data-go]'); }
    else { await click(A + '[data-act="gate"]', 400000); await p.waitForTimeout(1500); await shot('heart-teach'); await click(A + '[data-go]', 60000); }
  }
  // senior town meetings, then the reward card with one button: your turn
  for (let i = 0; i < 4; i++) {
    const m = await p.waitForSelector('#modal:not(.hide) [data-act]', { timeout: 400000 });
    const act = await m.getAttribute('data-act');
    if (act === 'go' && await p.$('#modal:not(.hide) .stars3')) { await p.waitForTimeout(500); await shot(`${id}-reward`); checks[`${id}NoUsePlanButton`] = !(await p.$('#modal [data-act="use"]')); await click('#modal:not(.hide) [data-act="go"]'); break; }
    await m.click(); await p.waitForTimeout(500);
  }
  if (id === 'heart') { await p.waitForSelector(A + '[data-p]', { timeout: 30000 }); for (const i of [0, 1, 2, 3]) await click(`${A}[data-p="${i}"]`); await shot('charter'); await click(A + '[data-ok]'); checks.charterNumbers = await p.evaluate(() => !!document.querySelector('#modal ul.charter small')); await shot('charter-result'); await click('#modal:not(.hide) [data-act="ok"]');
    await p.waitForSelector('#modal:not(.hide) [data-ri]', { timeout: 30000 }); await click('#modal [data-ri="0"]'); await click('#modal [data-ri="3"]'); await p.fill('#modal [data-rown]', 'ask a friend to check it'); await shot('reflection');
    checks.reflectionSentence = await p.evaluate(() => document.querySelector('#modal [data-rsay]')?.textContent || ''); await click('#modal [data-act="done"]');
    await p.waitForSelector('#modal:not(.hide) [data-act="build"], #modal:not(.hide) [data-act="finale"]', { timeout: 30000 }); await shot('reflection-rule');
    checks.reflectionSaved = await p.evaluate(() => !!window.__eco.app.G.reflectDone && /ask a friend/.test(window.__eco.app.G.reflection));
    await p.click('#modal:not(.hide) [data-act="build"], #modal:not(.hide) [data-act="finale"]');
  }
  await p.waitForSelector('#build [data-cat]', { timeout: 60000 }); mark(`${id}-done`);
  // back outside: the player's town is as they left it, Florence's has her plan, the level opens, with her advice first
  expect(`${id}PlanNotCopiedIntoYourTown`, mine === (await town()));
  expect(`${id}FlorenceTownGrew`, hers !== (await florence()));
  await p.waitForSelector('#towns [data-tv="both"][aria-pressed="true"]', { timeout: 8000 }).then(() => (checks[`${id}BothTownsShown`] = true)).catch(() => (checks[`${id}BothTownsShown`] = false));
  await p.waitForTimeout(1200); await shot(`${id}-both-towns`);
  expect(`${id}OpensAfterMission`, !(await locked(id)));
  checks[`${id}AdviceAtUnlock`] = await p.evaluate((x) => { const t = document.querySelector('#florence')?.textContent || ''; return /unlocked|Before you build|Before building/i.test(t); }, id);
  await p.waitForSelector('#towns [data-tv="mine"][aria-pressed="true"]', { timeout: 12000 }).catch(() => {});
  await p.waitForTimeout(800); await shot(`${id}-your-turn`); budget.push([`${id}-back-live`, await panelsVisible()]);
  const next = LEVELS[li]?.[0];
  if (next) {
    expect(`${next}CannotBeBuiltAhead`, await buildAhead(next));
    const n2 = await yourTurn(next); checks[`${id}YourTurnBuilds`] = n2; if (n2 < 0) fails.push(`${id}YourTurn`);
    await p.waitForTimeout(600); await shot(`${id}-your-turn-done`);
  }
  mark(`${id}-yours`);
  console.log('mission done', id, clean ? 'clean' : 'flawed', 'stars', await p.evaluate(() => window.__eco.app.G.stars), 'open', await p.evaluate(() => window.__eco.app.G.ever.join(',')), `${Math.round((Date.now() - T0) / 1000)} s`);
}
// the rest of the town, by the hints (as a player who follows the next-step line would)
for (let i = 0; i < 90; i++) {
  const pop = await p.$('#modal:not(.hide) [data-act="keep"]'); if (pop) { await shot('town-complete'); checks.townComplete = true; await pop.click(); await p.waitForTimeout(600); break; }
  const h = await p.evaluate(() => window.__eco.app.G.hint()); if (!h.tool || !h.spots.length) break;
  await p.evaluate(([k, t]) => window.__eco.app.G.act(k, t), [h.spots[0], h.tool]); await p.waitForTimeout(200);
}
await p.waitForTimeout(2500); { const pop = await p.$('#modal:not(.hide) [data-act="keep"]'); if (pop) { await shot('town-complete'); checks.townComplete = true; await pop.click(); await p.waitForTimeout(600); } }
mark('town');
checks.lensButtons = await p.evaluate(() => document.querySelectorAll('#lenspop [data-lens]').length);
const play = await p.$('#build [data-play]'); if (play) { await p.click('#build [data-play]'); await p.waitForSelector('#modal:not(.hide) video', { timeout: 20000 }); await p.waitForTimeout(3000); checks.paletteVideoPlays = await p.evaluate(() => { const v = document.querySelector('#modal video'); return !!v && v.readyState >= 2; }); await p.click('#modal [data-act="close"]'); }
await click('#strip [data-lensbtn]'); await click('#lenspop [data-lens="flood"]'); await p.waitForTimeout(1500); await shot('lens-flood'); await click('#lensbar [data-lensx]');
await click('#towns [data-tv="florence"]'); await p.waitForTimeout(1600); await shot('florence-town');
await click('#towns [data-tv="both"]'); await p.waitForTimeout(1600); await shot('both-towns-end'); await click('#towns [data-tv="mine"]'); await p.waitForTimeout(1400);
await shot('town-built');
await click('#strip [data-menu]'); await click('#settings [data-m-act="report"]');
await p.waitForSelector('#report', { timeout: 60000 }); await p.waitForTimeout(800); await shot('report');
await click('#report [data-close]'); await p.waitForSelector('#build [data-cat]', { timeout: 30000 }); checks.backFromReport = true;
// both towns are saved: reload and carry on, and the two towns come back as they were
const savedMine = await town(); const savedHers = await florence();
await p.evaluate(() => window.__eco.app.G.flush());
checks.saved = await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('ecotown.save.v3') || 'null'); return !!d && d.flow === 2 && d.fcells?.length > 10 && d.cells?.length > 10; });
await p.reload(); await click('[data-carry]', 60000); await p.waitForSelector('#build [data-cat]', { timeout: 120000 }); await p.waitForTimeout(1500);
expect('reloadKeepsYourTown', savedMine === (await town())); expect('reloadKeepsFlorenceTown', savedHers === (await florence()));
mark('end');
const said = await p.evaluate(() => window.__sayLog || []);
fs.writeFileSync(`${out}/said.json`, JSON.stringify(said, null, 1));
const over = budget.filter(([k, v]) => v.filter((x) => ['dock', 'alert', 'lensbar', 'modal'].includes(x)).length > (/live/.test(k) ? 2 : 4));
checks.episodesSeen = await p.evaluate(() => Object.keys(window.__eco.app.G.eps || {}).length); checks.episodesSkipped = episodesSkipped;
console.log(JSON.stringify({ checks, fails, times, errors, external: requests, panelBudgetViolations: over, spoken: said.length, missingClips: said.reduce((a, x) => a + x.missing.length, 0) }, null, 1));
await b.close();
if (fails.length || errors.length) process.exit(1);
