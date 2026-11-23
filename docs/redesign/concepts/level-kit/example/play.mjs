// Plays the example level through and saves a picture of every step: node play.mjs <out dir> [speed]
import { openLevel } from '../record.mjs';
const [out = 'pictures', speed = 1] = process.argv.slice(2), r = await openLevel({ page: 'concepts/level-kit/example/index.html', out, width: 1280, height: 720, speed: +speed }), { shot, click, has, tap } = r;
await shot('job', 1200); await click('Start'); await shot('ask'); await click('a strong wind'); await click('Ask Florence'); await has('Make the wind blow'); await shot('plans');
await click('Make the wind blow'); await shot('test', 2000); await has('Ask again'); await shot('results', 800); await r.usePlan(1); await r.pause(2600); await shot('play-break');
for (const j of [0, 1, 2]) { await tap('ribbon', j); await r.pause(400); } await has('Next'); await shot('play-break-done'); await click('Next'); await has('Try another plan'); await shot('town', 1200);
await click('Try another plan'); await shot('other-plans'); await r.usePlan(0); await shot('what-changed', 2200); await click('Go back to my first plan'); await shot('first-kept', 2200);
await click('Next'); await shot('recap'); await tap('answer', 1); await shot('recap-answer'); await click('Next'); await shot('end', 3500); await r.close();
