// Plays the Homes level through and saves a picture of every step: node play.mjs <out dir> [width] [height] [side 0|1] [middle floor L|B] [plan 0-2] [speed] [timing]
// The side is the word chosen in the sentence (0 the sunny side, 1 the shady side). The middle floor is the child's choice in the play break: L puts the living room in the middle, B the bedrooms.
// With a last argument of 1 it takes no pictures and waits only where a child would stop to look, so that the time it prints is a fairer estimate.
// The browser, the pictures, the presses and the taps come from the shared helper in ../level-kit/record.mjs; this file is only the path through Homes.
import { openLevel } from '../level-kit/record.mjs';
// When several recordings share the machine, the page can take longer than half a minute to open, which is all the helper allows. The helper must not be changed, so the browser it uses is told here to wait five minutes for a page
import { createRequire } from 'module';
{ const { chromium } = createRequire('/')('playwright'), launch = chromium.launch.bind(chromium); chromium.launch = async (o) => { const b = await launch(o), np = b.newPage.bind(b); b.newPage = async (x) => { const p = await np(x); p.setDefaultNavigationTimeout(300000); return p; }; return b; }; }
const [out, W = 1440, H = 810, side = 0, mid = 'L', plan = 0, speed = 1, timing = 0] = process.argv.slice(2);   // a speed above 1 is for quick checks only: the times printed are then wrong
const r = await openLevel({ page: 'concepts/trial/index.html', out, width: W, height: H, speed: +speed, timing: !!+timing, look: /^(night|home-tour|test)/, query: `&gate${process.env.TRIAL_Q || ''}` }), { shot, click, has, tap, think, pause, until } = r;
// held() waits until the level has stopped at a named moment in the middle of an animation, takes the picture and lets the level go on; pass() lets it go on without a picture
const held = async (g, nm) => { await until((g) => window.trialHold && window.trialHold.name === g, g); await shot(nm, 300); await r.p.evaluate(() => window.trialHold.go()); };
await shot('job', 1500); await click('Start'); await shot('ask');
await click(['the sunny side', 'the shady side'][side]); await shot('ask-side'); await click('Ask Florence'); await has('Make the materials'); await shot('plans');
await click('Make the materials'); for (const [g, nm] of [['materials-1', 'test-materials-1'], ['materials-2', 'test-materials-2'], ['materials-3', 'test-materials-3'], ['night', 'test-night'], ['open-1', 'test-homes-open-1'], ['open-2', 'test-homes-open-2'], ['open-3', 'test-homes-open-3']]) await held(g, nm);
await until(() => document.querySelector('[data-plan]')); await shot('results', 1800);
await r.usePlan(plan); await until(() => document.querySelector('.tok')); await shot('build-0', 900);
const idle = () => until(() => window.trial.cur.isBusy && !window.trial.cur.isBusy()), put = async (name, i, ms = 500) => { await idle(); await tap(name, i); await pause(ms); await idle(); };
// the ground floor: one tap for the frame or the bricks, one for the boards, and one tap for the insulation of each wall; then the two floors, the attic floor, the roof, the front wall and the door
const NI = +plan === 0, BR = +plan === 2, LV = ['fgg', 'pgf'][+side][+plan];   // how warm the chosen plan is on the chosen side
await put('wall', 0, 2600); await shot('build-ground-frame', 300);
if (NI) { await put('wall', 0); await shot('build-ground-walls', 300); }
else { if (!BR) { await put('wall', 0); await shot('build-ground-walls', 300); } for (const w of [1, 0, 2]) { await put('wall', w); if (w === 1) await shot('build-ground-insulation-1', 300); } if (BR) { await shot('build-ground-insulation-3', 300); await put('wall', 0); } await shot('build-ground-done', 300); }
await idle(); await shot('build-choose-floor', 600); await think(4); await r.p.click(`[data-part="floor${mid}"]`, { timeout: 180000 }); await shot('build-floor-chosen', 500); await put('floor', 0, 900); await shot('build-floor-1', 1200);
await put('wall', 3, 1500); await shot('build-first', 900); await put('floor', 1, 900); await shot('build-floor-2', 900); await put('wall', 6, 1500); await shot('build-second', 1200); await put('floor', 2, 900); await shot('build-attic-floor', 600);
for (const nm of NI ? ['attic-frame', 'roof'] : ['attic-frame', 'roof-insulation', 'roof']) { if (nm === 'roof') { await idle(); await r.p.click('[data-r="1"]', { timeout: 180000 }); await shot('build-roof-colour', 400); } await put('roof', 0); await shot(`build-${nm}`, nm === 'roof-insulation' ? 3200 : 1200); }
await put('front', 0, 1500); await shot('build-front', 1200);
await idle(); await r.p.click('[data-c="2"]', { timeout: 180000 }); await shot('build-door-colour', 400); await tap('door'); await shot('build-door', 700); await until(() => window.trial.cur.canToggle); await shot('home-closed', 300); await tap('front', 0); await shot('home-opening', 700); await held('tour-1', 'home-tour-1'); await held('tour-2', 'home-tour-2'); await has('Next'); await shot('home-open', 800); await click('Next');
await until(() => window.trial.cur.cueAt); await shot('street-plot', 700); await tap('plot', 0); await shot('street-building', 900); await has('Try another plan'); await shot('town', 800);
r.tryStart(); await click('Try another plan'); await shot('other-plans'); await r.p.click(`[data-plan="${(+plan + 1) % 3}"]`, { timeout: 180000 }); await shot('what-changed', 900); await click('Go back to my first plan'); await shot('first-kept', 900); r.tryEnd();
await click('Next'); await shot('recap', 900); await tap('side', +side ? 0 : 1); await shot('recap-answer', 900); await click('Next'); await shot('night-1', 1500); await held('night-street', 'night-2'); await held('night-home-1', 'night-home-1'); if (LV !== 'f') await held('night-home-2', 'night-home-2'); await think(2);
r.report(); await r.close();
