// Plays the Food level through and saves a picture of every step.
//   node play.mjs <out dir> <width> <height> <plan> <second plan or -1> <speed>
// plan is the plan that the child chooses (0 the community gardens, 1 the big farm far away, 2 the indoor farm).
// If a second plan is given, the script also presses "Try another plan". RECORD_STOP=3 stops after three pictures, for a quick look.
import { openLevel } from '../../level-kit/record.mjs';
const [out = 'pictures/run', width = 1440, height = 810, plan = 2, other = -1, speed = 1] = process.argv.slice(2), P = +plan;
const r = await openLevel({ page: 'concepts/levels/food/index.html', out, width: +width, height: +height, speed: +speed }), { shot, click, has, tap, p } = r;
p.setDefaultTimeout(300000);   // the recording machine is shared and can be very slow, so a press may take minutes to land
// the words of the sample child, which are nearest to the plan it will choose, and the crops and places it uses
const WORD = [['inside the town', 'outdoors in the soil'], ['far away, where there is lots of land', 'outdoors in the soil'], ['inside the town', 'indoors under lights']][P];
const CROP = ['tomato', 'lettuce', 'strawberry'], SLOT = [[0, 2, 4, 5, 7, 6], [0, 1, 3, 4, 6, 7], [0, 2, 3, 5, 7, 8]][P];
const wide = !process.env.FAST;
await shot('job', 2500); await click('Start'); await shot('ask', 1500); await click(WORD[0]); await shot('ask-word-1', 1500); await click(WORD[1]); await shot('ask-word-2', 1500);
await click('Ask Florence'); if (wide) await shot('plans-nearest', 1400); await has('Take the food to market'); await shot('plans', 1200);
await click('Take the food to market'); await shot('test-summer-1', 2600); if (wide) await shot('test-summer-2', 3000); await shot('test-summer-lorry', 6500); await shot('test-summer-boxes', 6000);
await shot('test-autumn', 4500); await shot('test-winter-snow', 6000); if (wide) await shot('test-winter-1', 4500); await shot('test-winter-lorry', 6000); if (wide) await shot('test-winter-boxes', 5000);
await has('Ask again'); await shot('results', 2500); await r.usePlan(P); await r.pause(3400); await shot('break-crops', 600);
for (const c of CROP) { await r.think(2); await p.click(`[data-crop="${c}"]`); } await shot('break-crops-chosen', 500); await click('Grow these'); await shot('break-places', 900);
for (const [n, i] of SLOT.entries()) { await tap('slot', i); await r.pause(500); if (n === 1 || n === 3) await shot(`break-placed-${n + 1}`, 400); } await r.pause(P === 1 ? 2600 : 300); await shot('break-a', 900);
await tap('a'); await shot('break-a-doing', 1600); await r.pause(P === 1 ? 5200 : 1800); await shot('break-b', 900);
if (P !== 0) { await tap('b'); await shot('break-b-doing', 1500); await r.pause(1800); }
if (P !== 1) { await shot('break-ripe', 700); for (const [n, i] of SLOT.entries()) { await tap('slot', i); await r.pause(450); if (n === 2) await shot('break-picking', 300); } await shot('break-off', 1500); await shot('break-delivery', 4200); }
else { await shot('break-lorry', 5000); }
await has('Next'); await shot('break-done', 900); await click('Next'); await has('Try another plan'); await shot('town', 1800);
if (+other >= 0) { r.tryStart(); await click('Try another plan'); await shot('other-plans', 1400); await r.usePlan(+other); await shot('what-changed', 3200); await click('Go back to my first plan'); await shot('first-kept', 3200); r.tryEnd(); }
await click('Next'); await shot('recap', 4500); await tap('answer', 2); await shot('recap-answer', 1200); await click('Next'); await shot('end', 7000); r.report(); await r.close();
