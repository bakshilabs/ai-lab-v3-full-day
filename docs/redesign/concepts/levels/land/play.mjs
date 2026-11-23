// Plays the Land level through and saves a picture of every step.
//   node play.mjs <out dir> <width> <height> <plan> <second plan or -1> <speed>
// plan is the plan that the child chooses (0 the bank, 1 the meadow, 2 the hill). If a second plan is given, the script also presses "Try another plan".
import { openLevel } from '../../level-kit/record.mjs';
const [out = 'pictures/run', width = 1440, height = 810, plan = 2, other = -1, speed = 1] = process.argv.slice(2);
const r = await openLevel({ page: 'concepts/levels/land/index.html', out, width: +width, height: +height, speed: +speed }), { shot, click, has, tap } = r; r.p.setDefaultTimeout(240000);   // the recording machine is slow when other recordings run at the same time
const WORD = ['on a bank beside the river', 'far away from the river', 'high up and far away'];
// the places that the sample child chooses, in this order: ten homes and then the town green
const ORDER = [[0, 2, 4, 6, 7, 9, 11, 12, 14, 15, 8], [0, 1, 3, 5, 6, 9, 10, 12, 14, 15, 7], [0, 1, 3, 4, 6, 7, 9, 11, 13, 15, 8]][+plan];
await shot('job', 2500); await click('Start'); await shot('ask', 2000); await click(WORD[+plan]); await shot('ask-word', 1500); await click('Ask Florence'); await has('Make it rain'); await shot('plans', 1500);
await click('Make it rain'); await shot('test-clouds', 2600); await shot('test-rain', 2600); await shot('test-rising', 3200); await shot('test-meadow', 3200); await shot('test-bank', 3200); await shot('test-bank-2', 2600);
await has('Ask again'); await shot('results', 2600); await r.usePlan(+plan); await r.pause(4200); await shot('break-start', 800);
for (const [n, i] of ORDER.entries()) { await tap('place', i); await r.pause(900); if (n === 0 || n === 4 || n === 9) await shot(`break-home-${n + 1}`, 500); }
await has('Next'); await shot('break-done', 900); await click('Next'); await has('Try another plan'); await shot('town', 1800);
if (+other >= 0) { r.tryStart(); await click('Try another plan'); await shot('other-plans', 1200); await r.usePlan(+other); await shot('second-rain', 4200); await shot('what-changed', 5000);
  await click('Go back to my first plan'); await shot('first-again', 5200); await shot('first-kept', 5000); r.tryEnd(); }
await click('Next'); await shot('recap', 3200); await tap('answer', 2); await shot('recap-answer', 1200); await click('Next'); await shot('end', 5500); r.report(); await r.close();
