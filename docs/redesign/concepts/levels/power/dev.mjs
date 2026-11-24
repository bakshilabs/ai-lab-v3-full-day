// A quick look while building: jumps straight to one part of the level and saves a few pictures. It is not a recording of the level.
//   node dev.mjs <out dir> <part> [plan 0-2] [first word] [second word] [width] [height]
//   part: night (the test, one neighbourhood: plan says which) | place (the play break, placing the parts) | dusk (the play break, run to the evening) | town
// The lighting effects are off (&plain) so that the pictures come quickly, unless the last-but-one word has "fx" in it; "keep" in it keeps the turbines turning for the geese.
// The last number is the speed: 0.2 plays the animations five times more slowly, so that the pictures catch the geese in flight on the slow recording machine.
import { openLevel } from '../../level-kit/record.mjs';
const [out, part = 'night', plan = 1, w0 = 1, w1 = 0, W = 1024, H = 640, opt = '', speed = 0.3] = process.argv.slice(2);   // a speed below 1 plays the animations slowly, so that the pictures catch them on the slow machine
const r = await openLevel({ page: 'concepts/levels/power/index.html', out, width: +W, height: +H, speed: +speed, query: opt.includes('fx') ? '' : '&plain' }), { shot, click, has, tap, until, pause } = r;
const idle = () => until(() => window.trial.cur.isBusy && !window.trial.cur.isBusy());
await r.p.evaluate(([a, b]) => { window.trial.ask(); window.trial.S.words = [a, b]; window.trial.plans(); }, [+w0, +w1]); await has('Keep the lights on');
if (part === 'night') { await click('Keep the lights on'); await has('Show all three'); await tap('ham', +plan); for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) await shot(`night-${n}`, 1300); await idle(); await shot('night-card', 600); await click('Show all three'); await shot('results', 2500); }
else { await r.p.evaluate((i) => window.trial.choose(i), +plan); await idle(); await shot('place-0', 500);
  if (part === 'place') { if (+plan !== 0) { await tap('turb', 0); await shot('turb-by-pond', 1900); await tap('turb', 0); await pause(1700); } if (+plan !== 1) { await tap('roof', 5); await shot('roof-shade', 1200); await tap('roof', 5); await tap('roof', 6); await shot('roof-clock', 1200); } }
  else { const nT = [0, 6, 4][plan], nR = [6, 0, 4][plan]; for (let i = 0; i < nT; i++) { await tap('turb', i + 2); await pause(200); } for (const i of [0, 1, 2, 3, 4, 6].slice(0, nR)) { await tap('roof', i); await pause(200); } await shot('placed', 800); await click('Start the day');
    for (let k = 0; k < 5; k++) { await idle(); await shot(`day-${k}`, 400); if (await r.p.evaluate(() => window.trial.cur.geeseQ())) { await shot('geese-q', 600); await click(opt.includes('keep') ? 'Keep them turning' : 'Stop the turbines'); for (const n of [1, 2, 3, 4]) await shot(`geese-${n}`, 1200); await idle(); await shot('geese-past', 500); }
      if (k === 3 && +plan === 0) { await tap('home', 1); await shot('home-waits', 900); } if (part === 'dusk' && k === 3) break; await tap('mark', 0); await pause(1700); }
    if (part === 'town') { await has('Next'); await shot('dawn', 600); await click('Next'); await has('Try another plan'); await shot('town', 1500); await shot('town-2', 3000); } } }
await r.close();
