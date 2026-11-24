// Plays the Land level through and saves a picture of every step.
//   node play.mjs <out dir> <width> <height> <plan> <second plan or -1> <speed>
// plan is the plan that the child chooses (0 the bank, 1 the meadow, 2 the hill). If a second plan is given, the script also presses "Try another plan".
import { openLevel } from '../../level-kit/record.mjs';
const [out = 'pictures/run', width = 1440, height = 810, plan = 2, other = -1, speed = 1] = process.argv.slice(2);
const r = await openLevel({ page: 'concepts/levels/land/index.html', out, width: +width, height: +height, speed: +speed }), { shot, click, has, tap } = r; r.p.setDefaultTimeout(240000);   // the recording machine is slow when other recordings run at the same time
const WORD = ['on a bank beside the river', 'far away from the river', 'high up and far away'], PLACE = ['Beside the river', 'The far meadow', 'The far hill'];
// the places that the sample child chooses, in this order: the family's home, five neighbours and then the town green.
// The second home is put on a poor place first and then moved, to show that a home can be taken back
const ORDER = [[5, 0, 4, 8, 10, 12, 9], [9, 0, 2, 6, 10, 4, 11], [12, 0, 8, 13, 6, 10, 7]][+plan], MOVE = [3, 5, 11][+plan];
const tapCloud = async (name) => { await r.until(() => [...document.querySelectorAll('.plate.tap')].some((e) => e.style.display !== 'none')); await shot(`${name}-ask`, 600); await tap('cloud', 0); };
await shot('job', 2500); await click('Start'); await shot('ask', 2000); await click(WORD[+plan]); await shot('ask-word', 1500); await click('Ask Florence'); await has('Make it rain'); await shot('plans', 1500);
await click('Make it rain'); await shot('test-clouds', 2500); await tapCloud('test-1'); await shot('test-2-rising', 2600); await shot('test-2-meadow', 3000);
await tapCloud('test-2'); await shot('test-3-bank', 2600); await shot('test-3-bank-falls', 2600); await shot('test-3-hut-tips', 3000);
await has('Show all three'); await shot('look', 1500);
for (const i of [1, 0, 2]) { await click(PLACE[i]); await shot(`look-${['bank', 'meadow', 'hill'][i]}`, 3200); }
await click('Show all three'); await shot('results', 3000); await r.usePlan(+plan); await shot('break-river-down', 3000); await r.pause(6500); await shot('break-start', 800);
for (const [n, i] of ORDER.entries()) { await tap('place', i); await r.pause(1100); if (n < 3 || n === 5) await shot(`break-${n === 0 ? 'family' : n === 6 ? 'green' : `home-${n + 1}`}`, 400);
  if (n === 1) { await tap('place', i); await r.pause(700); await shot('break-home-taken-back', 300); await tap('place', MOVE); await r.pause(1100); await shot('break-home-moved', 300); } }
await has('Next'); await shot('break-done', 900); await click('Next'); await has('Try another plan'); await shot('town', 1800);
if (+other >= 0) { r.tryStart(); await click('Try another plan'); await shot('other-plans', 1200); await r.usePlan(+other); await shot('second-rain', 4200); await shot('what-changed', 8000);
  await click('Go back to my first plan'); await shot('first-again', 5200); await shot('first-kept', 8000); r.tryEnd(); }
await click('Next'); await shot('recap', 3200); await tap('answer', 2); await shot('recap-answer', 1200); await click('Next'); await shot('end', 5500); r.report(); await r.close();
