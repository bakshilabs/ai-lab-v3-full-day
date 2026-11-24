// Plays the trial level through and saves a picture of every step: node play.mjs <out dir> [width] [height] [side 0|1] [first floor: B or L] [plan 0-2] [speed] [timing]
// "first floor" is the floor the child lays first: B for the bedrooms, L for the living room.
// With a last argument of 1 it takes no pictures and waits only where a child would stop to look, so that the time it prints is a fairer estimate.
// The browser, the pictures, the presses and the taps come from the shared helper in ../level-kit/record.mjs; this file is only the path through Homes.
import { openLevel } from '../level-kit/record.mjs';
const [out, W = 1440, H = 810, side = 0, first = 'B', plan = 0, speed = 1, timing = 0] = process.argv.slice(2);   // a speed above 1 is for quick checks only: the times printed are then wrong
const r = await openLevel({ page: 'concepts/trial/index.html', out, width: W, height: H, speed: +speed, timing: !!+timing, look: /^(results|look|home-tour|home-toys|night|home-night|test)/, query: process.env.TRIAL_Q || '' }), { shot, click, has, tap, think, pause, until } = r;
await shot('job', 1500); await click('Start'); await shot('ask');
await click(['the sunny side', 'the shady side'][side]); await shot('ask-side'); await click('Ask Florence'); await has('Bring the winter night'); await shot('plans');
await click('Bring the winter night'); await shot('test-a', 2600); await shot('test-b', 2600); await shot('test-c', 2600); await has('Ask again'); await shot('results', 2600);
await tap('sample', 1); await shot('look-closer', 2200); await click('Show all three'); await shot('results-again', 1500);
await r.usePlan(plan); await until(() => document.querySelector('.tok')); await shot('build-0', 900);
const idle = () => until(() => window.trial.cur.isBusy && !window.trial.cur.isBusy()), put = async (name, i, ms = 500) => { await idle(); await tap(name, i); await pause(ms); await idle(); };
// the ground floor: the frame, then the walls and the insulation wall by wall (a brick home takes its insulation before its inside wall, and the first timber home has none)
const NI = +plan === 0, BR = +plan === 2, ins = async () => { for (const w of [1, 0, 2]) { await put('wall', w); if (w !== 0) await shot(`build-ground-insulation-${w === 1 ? 1 : 3}`, 300); } };
await put('wall', 0, 2600); await shot('build-ground-frame', 300); if (BR) await ins(); await put('wall', 1); await shot('build-ground-walls', 300); if (!BR && !NI) await ins();
// the decision: which of the two floors goes in first
await idle(); await shot('build-choose-floor', 300); await think(4); await r.p.click(`[data-tool="${first === 'L' ? 'roomL' : 'roomB'}"]`, { force: true }); await shot('build-floor-chosen', 400); await put('floor', 0, 900); await shot('build-floor-1', 1200);
await put('wall', 3, 1500); await shot('build-first-storey', 600); await put('floor', 1, 900); await shot('build-floor-2', 600); await put('wall', 6, 1500); await shot('build-second-storey', 600); await put('floor', 2, 900); await shot('build-attic', 900);
for (const nm of NI ? ['roof'] : ['roof-insulation', 'roof']) { await put('roof', 0); await shot(`build-${nm}`, 1200); }
await put('front', 0, 1500); await shot('build-front', 900);
await idle(); await r.p.click('[data-c="2"]', { timeout: 180000 }); await tap('door'); await shot('build-door', 700); await until(() => window.trial.cur.canToggle); await shot('home-closed', 300); await tap('front', 0); await shot('home-opening', 700); await shot('home-tour-1', 2300); await shot('home-tour-2', 2300); await has('Next'); await shot('home-open', 800);
// things in the rooms do something when they are tapped: the cat, the bath and the lamp
for (const i of [3, 4, 2]) { await tap('toy', i); await pause(250); } await shot('home-toys', 100); await click('Next');
await until(() => window.trial.cur.cueAt); await shot('street-empty', 900); await tap('plot', 0); await has('Try another plan'); await shot('town', 800);
r.tryStart(); await click('Try another plan'); await shot('other-plans'); await r.p.click(`[data-plan="${(+plan + 1) % 3}"]`, { timeout: 180000 }); await shot('what-changed', 900); await click('Go back to my first plan'); await shot('first-kept', 900); r.tryEnd();
await click('Next'); await shot('recap', 900); await tap('side', +side ? 0 : 1); await shot('recap-answer', 900); await click('Next'); await shot('night-1', 1500); await shot('night-2', 2200); await shot('home-night-1', 3500); await shot('home-night-2', 3500); await think(2);
r.report(); await r.close();
