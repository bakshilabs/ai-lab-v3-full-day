// Plays the Land level through and saves a picture of every step.
//   node play.mjs <out dir> <width> <height> <plan> <second plan or -1> <speed>
// plan is the plan that the child chooses (0 the bank, 1 the meadow, 2 the hill). If a second plan is given, the script also presses "Try another plan".
import { openLevel } from './record.mjs';   // the kit's helper, with a longer time allowed for opening the page
const [out = 'pictures/run', width = 1440, height = 810, plan = 2, other = -1, speed = 1] = process.argv.slice(2);
const r = await openLevel({ page: 'concepts/levels/land/index.html', out, width: +width, height: +height, speed: +speed }), { shot, click, has, tap } = r; r.p.setDefaultTimeout(240000);   // the recording machine is slow when other recordings run at the same time
const WORD = ['on a bank beside the river', 'far away from the river', 'high up and far away'], PLACE = ['Beside the river', 'The far meadow', 'The far hill'];
// The places that the sample child chooses, in this order: the family's home, five neighbours and then the town green.
// The second home is put on a poor place first and then moved, to show that a home can be taken back.
// On the bank the sample child leaves one home at the edge, and on the hill every home ends above the line of mud.
// The order goes from the back rows to the front rows, so that no home stands in front of a place that the script still has to tap.
const ORDER = [[9, 12, 10, 5, 3, 1, 4], [6, 7, 2, 4, 10, 11, 12], [12, 1, 13, 8, 9, 3, 5]][+plan], MOVE = [7, 0, 11][+plan];
await shot('job', 2500); await click('Start'); await shot('ask', 2000); await click(WORD[+plan]); await shot('ask-word', 1500); await click('Ask Florence'); await has('Make it rain'); await shot('plans', 1500);
// During the test each picture waits for Florence's sentence about that moment, or for a later one, because the recording machine does not keep time
const STAGE = ['Rain is falling', 'spread across', 'pulling at the bank', 'The rain has stopped'], says = (k) => r.until((list) => list.some((t) => document.getElementById('say').innerText.includes(t)), STAGE.slice(k));
await click('Make it rain'); await shot('test-clouds', 1800); await says(0); await shot('test-rain', 1500); await says(1); await shot('test-meadow', 1200); await says(2); await shot('test-bank', 2500); await says(3); await shot('test-rain-stops', 1200);
await has('Show all three'); await shot('look', 1500);
for (const i of [1, 0, 2]) { await click(PLACE[i]); await shot(`look-${['bank', 'meadow', 'hill'][i]}`, 3200); }
await click('Show all three'); await has('Ask again'); await shot('results', 3000); await r.usePlan(+plan); await shot('break-river-down', 3000); await r.until(() => !!document.querySelector('#tray .tok')); await shot('break-start', 800);
for (const [n, i] of ORDER.entries()) { await tap('place', i); if (n < 3 || n >= 5) await shot(`break-${n === 0 ? 'family' : n === 6 ? 'green' : `home-${n + 1}`}`, 900); else await r.pause(1200);
  if (n === 1) { await tap('place', i); await shot('break-home-taken-back', 900); await tap('place', MOVE); await shot('break-home-moved', 900); } }
await has('Next'); await r.p.click('.sw[data-c="2"]'); await shot('break-done', 900);
// The scene counts the storms over the town: peaks goes up when the river is at its highest, and passed goes up when the rain has gone
// hold() keeps the storm at its highest point until the picture is taken, and free() lets it pass
let storms = 0; const peak = () => r.until((n) => window.trial.cur.peaks > n, storms), passed = () => r.until((n) => window.trial.cur.passed > n, storms++), hold = (on) => r.p.evaluate((on) => { window.trial.cur.hold = on; }, on);
await hold(true); await click('Next'); await peak(); await shot('town-rain', 0); await hold(false); await passed(); await has('Try another plan'); await shot('town-after-rain', 1500);
if (+other >= 0) { r.tryStart(); await click('Try another plan'); await shot('other-plans', 1200); await hold(true); await r.usePlan(+other); await peak(); await shot('second-rain', 0); await hold(false); await passed(); await shot('what-changed', 1200);
  await hold(true); await click('Go back to my first plan'); await peak(); await shot('first-again', 0); await hold(false); await passed(); await shot('first-kept', 1200); r.tryEnd(); }
await click('Next'); await shot('recap', 3200); await tap('answer', 2); await shot('recap-answer', 1200); await click('Next'); await shot('end', 5500); r.report(); await r.close(); process.exit(0);
