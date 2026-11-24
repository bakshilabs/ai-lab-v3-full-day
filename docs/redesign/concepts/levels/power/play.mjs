// Plays the Power level through and saves a picture of every step:
//   node play.mjs <out dir> [width] [height] [first word 0-2] [second word 0-2] [plan 0-2] [second plan, or -1 for none] [speed] [extras]
// extras is a word made of letters: a presses "Ask again" once before choosing, b goes back to the first plan after trying another, k keeps the turbines turning for the geese (without it they are stopped), m moves the sun back once.
// The browser, the pictures, the presses and the taps come from the shared helper in ../../level-kit/record.mjs; this file is only the path through Power.
// A speed above 1 is for quick checks only.
import { openLevel } from '../../level-kit/record.mjs';
const [out = 'pictures/run', W = 1440, H = 810, w0 = 2, w1 = 1, plan = 2, second = -1, speed = 1, extras = ''] = process.argv.slice(2);
const SUN = ['only the sun', 'only the wind', 'the sun and the wind together'], SPARE = ['waste the spare power', 'save the spare power in a battery', 'switch the power off at night'];
const r = await openLevel({ page: 'concepts/levels/power/index.html', out, width: +W, height: +H, speed: +speed, look: /^(test|day|town|end)/ }), { shot, click, has, tap, until, pause } = r; r.p.setDefaultTimeout(240000);   // the recording machine is slow when other recordings run at the same time
const idle = () => until(() => window.trial.cur.isBusy && !window.trial.cur.isBusy()), at = (name) => r.p.evaluate((name) => { const rect = document.getElementById('c').getBoundingClientRect(); return window.trialProject(...window.trial.cur.spot(name, 0), rect); }, name);
await shot('job', 1500); await click('Start'); await shot('ask'); await click(SUN[w0]); await shot('ask-first-word'); await click(SPARE[w1]); await shot('ask-both-words'); await click('Ask Florence'); await has('Keep the lights on'); await shot('plans', 900);
// the test: the press sends the sun down, and then the child brings the families of each neighbourhood home with a tap. The card of a plan comes up when its night has played
await click('Keep the lights on'); await shot('test-1-sun-low', 1300); await shot('test-2-sunset', 2200); await has('Show all three'); await shot('night-0-tap-a-part', 900);
for (const [n, i] of [0, 1, 2].entries()) { const name = ['solar', 'wind', 'wind-and-sun'][i]; await tap('ham', i); await shot(`night-${n + 1}-${name}-home`, 2300); await shot(`night-${n + 1}-${name}-then`, i ? 3300 : 2200); await idle(); await shot(`night-${n + 1}-${name}-card`, 700); }
await click('Show all three'); await shot('results', 2800);
if (extras.includes('a')) { await click('Ask again'); await shot('ask-again', 1500); await click(SUN[w0]); await click(SPARE[w1]); await shot('ask-again-words'); await click('Ask Florence'); await has('Keep the lights on'); await shot('ask-again-plans', 900); await click('Keep the lights on'); await has('Show all three'); await shot('ask-again-night', 900); await click('Show all three'); await shot('ask-again-results', 2800); }
// the play break: place the parts and choose a stripe, then run the day
await r.usePlan(+plan); await idle(); await shot('place-0', 700);
const nT = [0, 6, 4][plan], nR = [6, 0, 4][plan], turbs = +plan === 1 ? [2, 3, 4, 5, 6, 0] : [2, 3, 5, 0], roofs = +plan === 0 ? [0, 1, 2, 3, 4, 6] : [0, 2, 3, 6];
// the last turbine goes beside the pond, the geese fly off, and the child moves it to another place
for (let i = 0; i < nT; i++) { await tap('turb', turbs[i]); await pause(500); if (i === 1) await shot('place-turbines', 300); }
if (nT) { await shot('place-geese-away', 1500); await tap('turb', turbs[nT - 1]); await shot('place-geese-back', 1900); await tap('turb', +plan === 1 ? 7 : 4); await pause(500); }
if (nR) { if (nT) await shot('place-roofs-0', 500); await r.p.click('[aria-label="Blue stripe"]'); await pause(300); /* the first panel goes on the roof in the shade, and is then moved */ await tap('roof', 5); await shot('place-roof-in-shade', 1400); await tap('roof', 5); await pause(500); for (let i = 0; i < nR; i++) { await tap('roof', roofs[i]); await pause(500); if (i === 1) await shot('place-roofs', 300); if (i === nR - 1) await shot('place-roof-clock', 900); } } else await r.p.click('[aria-label="Green stripe"]');
await shot('place-ready', 900); await click('Start the day');
const NAMES = ['morning', 'midday', 'afternoon', 'evening', 'night'];
for (let k = 0; k < 5; k++) { await idle(); await shot(`day-${k + 1}-${NAMES[k]}`, 700);
  if (await r.p.evaluate(() => window.trial.cur.geeseQ())) { await shot(`day-${k + 1}-geese-question`, 900); await click(extras.includes('k') ? 'Keep them turning' : 'Stop the turbines'); await shot(`day-${k + 1}-geese-1`, 1700); await shot(`day-${k + 1}-geese-2`, 1500); await shot(`day-${k + 1}-geese-3`, 1300); await idle(); await shot(`day-${k + 1}-geese-past`, 700); }
  if (k === 3 && +plan === 0 && !(await r.p.evaluate(() => window.trial.cur.sendable())).length) { await tap('home', 1); await shot(`day-${k + 1}-home-waits`, 900); }
  if (k === 1 && extras.includes('m')) { await click('Move the sun back'); await idle(); await shot('day-moved-back', 700); await tap('mark', 0); await pause(1700); await idle(); await shot('day-forward-again', 500); }
  if (await r.p.evaluate(() => window.trial.cur.canSave())) { await tap('barn', 0); await pause(1500); await idle(); await shot(`day-${k + 1}-saved`, 400); }
  const dark = await r.p.evaluate(() => window.trial.cur.sendable()); for (const [n, i] of dark.entries()) { if (!(await r.p.evaluate(() => window.trial.cur.sendable())).includes(i)) continue; await tap('home', i); await pause(1500); if (n === dark.length - 1) await shot(`day-${k + 1}-sent`, 400); }
  // when beads are left over in the night, the child lights two of the three things: here the tree and the skating pond
  for (const x of (await r.p.evaluate(() => window.trial.cur.lightable())).slice(0, 2)) { if (!(await r.p.evaluate(() => window.trial.cur.lightable())).includes(x)) continue; await tap('extra', x); await pause(1900); await shot(`day-${k + 1}-lit-${['tree', 'pond', 'clock'][x]}`, 500); }
  // the first move is a drag of the sun with the mouse held down; the others are taps on the yellow mark
  if (k === 0) { const a = await at('body'), b = await at('mark'); await r.think(4); await r.p.mouse.move(a[0], a[1]); await r.p.mouse.down(); for (let j = 1; j <= 8; j++) { await r.p.mouse.move(a[0] + (b[0] - a[0]) * j / 9, a[1] + (b[1] - a[1]) * j / 9); await pause(120); if (j === 4) await shot('day-1-dragging', 200); } await r.p.mouse.up(); } else await tap('mark', 0);
  await pause(1700); }
await has('Next'); await shot('day-6-dawn', 900);
await click('Next'); await shot('town-1', 3000); await shot('town-2', 3600); await has('Try another plan'); await shot('town', 1200);
if (+second >= 0) { r.tryStart(); await click('Try another plan'); await shot('other-plans', 900); await r.usePlan(+second); await shot('what-changed', 2500); await shot('what-changed-geese', 3000); await click(extras.includes('b') ? 'Go back to my first plan' : 'Keep this plan'); await shot(extras.includes('b') ? 'back-to-first' : 'second-kept', 1500); if (extras.includes('b')) await shot('back-to-first-geese', 3500); r.tryEnd(); }
await click('Next'); await shot('recap', 900); const n = await r.p.evaluate(() => window.trial.cur.recapN); await tap('recap', n - 1); await shot('recap-answer', 700); await click('Next'); await shot('end-1', 3000); await shot('end-2', 4500); await r.report(); await r.close();
