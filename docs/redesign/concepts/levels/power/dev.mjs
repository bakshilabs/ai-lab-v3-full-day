// A quick look while building: plays a few steps fast and saves pictures. Not a recording of the level.
//   node dev.mjs <out dir> <upto> [width] [height] [speed]      upto: job | plans | test | cards | setup | day | town
import { openLevel } from '../../level-kit/record.mjs';
const [out = '/tmp/power-dev', upto = 'job', W = 1440, H = 810, speed = 6, w0 = 'the sun and the wind together', w1 = 'save the spare power in a battery', plan = 2] = process.argv.slice(2);
const r = await openLevel({ page: 'concepts/levels/power/index.html', out, width: +W, height: +H, speed: +speed }), { shot, click, has, tap, until, pause } = r;
const stop = async (name) => { if (upto === name) { await r.close(); process.exit(0); } };
await shot('job', 1500); await stop('job'); await click('Start'); await click(w0); await click(w1); await shot('ask'); await click('Ask Florence'); await has('Keep the lights on'); await shot('plans', 800); await stop('plans');
await click('Keep the lights on'); for (const n of ['a', 'b', 'c', 'd', 'e', 'f']) await shot(`test-${n}`, 4600); await has('Show all three'); await tap('ham', 0); await shot('look', 1500); await click('Show all three'); await shot('cards', 2500); await stop('test');
await r.usePlan(+plan); await until(() => window.trial.cur.isBusy && !window.trial.cur.isBusy()); await shot('setup', 600); await stop('setup');
const idle = () => until(() => window.trial.cur.isBusy && !window.trial.cur.isBusy());
const nT = [0, 6, 4][plan], nR = [6, 0, 4][plan]; for (let i = 0; i < nT; i++) { await tap('turb', i + 1); await pause(300); } if (nT) await shot('setup-turbines', 500); for (let i = 0; i < nR; i++) { await tap('roof', [0, 2, 3, 5, 1, 4][i]); await pause(300); }
await click('Start the day'); for (let k = 0; k < 5; k++) { await idle(); await shot(`day-${k}`, 500); if (await r.p.evaluate(() => { const s = window.trial.cur; return s.step() <= 2; }) && +plan === 2 && w1.includes('battery')) { await tap('barn', 0); await pause(900); await idle(); await shot(`day-${k}-saved`, 300); }
  else if (+plan === 2 && w1.includes('battery')) { for (const i of await r.p.evaluate(() => window.trial.cur.darkHomes())) { await tap('home', i); await pause(1200); } await shot(`day-${k}-sent`, 400); }
  await tap('mark', 0); await pause(1800); }
await has('Next'); await shot('day-dawn', 800); await stop('day');
await click('Next'); await has('Try another plan'); await shot('town', 1500); await click('Next'); await shot('recap', 800); await tap('recap', 0); await shot('recap-answer', 600); await click('Next'); await shot('end', 6000); await r.close();
