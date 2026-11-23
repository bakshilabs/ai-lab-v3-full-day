// Plays the trial level through and saves a picture of every step: node play.mjs <out dir> [width] [height] [side 0|1] [not used] [plan 0-2] [speed] [timing]
// With a last argument of 1 it takes no pictures and waits only where a child would stop to look, so that the time it prints is a fairer estimate.
// The browser, the pictures, the presses and the taps come from the shared helper in ../level-kit/record.mjs; this file is only the path through Homes.
import { openLevel } from '../level-kit/record.mjs';
const [out, W = 1440, H = 810, side = 0, walls = 0, plan = 0, speed = 1, timing = 0] = process.argv.slice(2);   // a speed above 1 is for quick checks only: the times printed are then wrong
const r = await openLevel({ page: 'concepts/trial/index.html', out, width: W, height: H, speed: +speed, timing: !!+timing, look: /^(look-\d|night|visit|home-tour|test)/, query: process.env.TRIAL_Q || '' }), { shot, click, has, tap, think, pause, until } = r;
await shot('job', 1500); await click('Start'); await shot('ask');
await click(['the sunny side', 'the shady side'][side]); await shot('ask-side'); await click('Ask Florence'); await has('Bring the winter night'); await shot('plans');
await click('Bring the winter night'); await shot('test-a', 3400); await shot('test-b', 3400); await shot('test-c', 3600); await shot('test-d', 3600); await shot('test-e', 4500); await has('Show all three'); await shot('look-0', 600); for (const i of [0, 1, 2]) { await tap('sample', i); if (!i) await shot('look-opening', 600); await shot(`look-${i + 1}`, 2200); } await click('Show all three'); await shot('results', 1500);
await r.usePlan(plan); await until(() => document.querySelector('.tok')); await shot('build-0', 900);
const idle = () => until(() => window.trial.cur.isBusy && !window.trial.cur.isBusy()), put = async (name, i, ms = 500) => { await idle(); await tap(name, i); await pause(ms); await idle(); };
// the ground floor wall by wall, a floor, the first floor with one tap for each layer, a floor, the whole second floor with one tap, the attic floor, the roof, the front wall, two big windows and the door
const NI = +plan === 0, LY = NI ? 1 : 2;   // the timber home with no insulation has no insulation steps
await put('wall', 0, 2600); await shot('build-ground-frame', 300); for (let k = 0; k < LY; k++) { for (const w of [1, 0, 2]) { await put('wall', w); if (w === 1) await shot(`build-ground-layer${k + 1}-a`, 300); } await shot(`build-ground-layer${k + 1}-b`, 300); }
await put('floor', 0, 900); await shot('build-floor-1', 1200); for (let k = 0; k <= LY; k++) { await put('wall', 3); await shot(`build-first-${k}`, 300); }
await put('floor', 1, 900); await shot('build-floor-2', 600); await put('wall', 6, 1500); await shot('build-second', 1200); await put('floor', 2, 900); await shot('build-attic-floor', 600);
for (const nm of NI ? ['attic-frame', 'roof'] : ['attic-frame', 'roof-insulation', 'roof']) { await put('roof', 0); await shot(`build-${nm}`, nm === 'roof-insulation' ? 3200 : 1200); }
for (const nm of NI ? [1, 2] : [1, 2, 3]) { await put('front', 0); await shot(`build-front-${nm}`, 400); }
await put('win', 0); await shot('build-window-1', 1600); await put('win', 4); await shot('build-window-2', 2200);
await idle(); await r.p.click('[data-c="2"]'); await tap('door'); await shot('build-door', 700); await until(() => window.trial.cur.canToggle); await shot('home-closed', 300); await tap('front', 0); await shot('home-opening', 700); await shot('home-tour-1', 2500); await shot('home-tour-2', 2700); await has('Next'); await shot('home-open', 800); await click('Next');
for (let k = 0; k < 8; k++) { await until(() => window.trial.cur.cueAt); await pause(700); if (k === 3) await shot('street-building', 100); await tap('plot', 0); } await has('Try another plan'); await shot('town', 800);
r.tryStart(); await click('Try another plan'); await shot('other-plans'); await r.p.click(`[data-plan="${(+plan + 1) % 3}"]`); await shot('what-changed', 900); await click('Go back to my first plan'); await shot('first-kept', 900); r.tryEnd();
await click('Next'); await shot('recap', 900); await tap('side', +side ? 0 : 1); await shot('recap-answer', 900); await click('Next'); await shot('night-1', 1500); await shot('night-2', 3500); await shot('night-3', 5500); await click('Visit your home'); await shot('visit-1', 1800); await shot('visit-2', 2600); await shot('visit-3', 1500); await shot('visit-4', 2500); await think(2);
r.report(); await r.close();
