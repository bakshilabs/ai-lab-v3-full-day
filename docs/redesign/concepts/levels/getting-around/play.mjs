// Plays the "Getting around" level through and saves a picture of every step.
//   node play.mjs <out folder> <width> <height> <path> [speed]
// path "park" asks for short and direct paths and the park in the middle, uses the paths through the park, and lays the pieces one by one.
// path "loop" asks for paths beside the busy road and the park at the far edge, uses the winding loop, and then tries another plan.
// path "look" only takes one picture of each view, for a quick check.
import { openLevel } from '../../level-kit/record.mjs';
const [out = 'pictures/run', width = 1440, height = 810, path = 'park', speed = 1] = process.argv.slice(2);
const r = await openLevel({ page: 'concepts/levels/getting-around/index.html', out, width, height, speed: +speed }), { shot, click, has, tap } = r; r.p.setDefaultTimeout(240000);
const N = 7, cell = (c, row) => c + row * N, pick = (kind) => r.p.evaluate((k) => [...document.querySelectorAll('.tok')].find((b) => b.textContent.startsWith(k)).click(), kind);
// lays pieces: each step is [kind, column, row]
const lay = async (steps, every = 0) => { let n = 0, last = ''; for (const [kind, c, row] of steps) { if (kind !== last) { await pick(kind); last = kind; await r.pause(150); } await tap('cell', cell(c, row)); await r.pause(350); if (every && ++n % every === 0) await shot(`play-${String(n).padStart(2, '0')}`, 900); } };
const WORDS = { park: ['short and direct', 'in the middle of the town'], loop: ['beside the busy road', 'at the far edge of the town'] }[path] || ['short and direct', 'in the middle of the town'];

await shot('job', 2500); await tap('tree'); await shot('job-tree-tapped', 900); await click('Start'); await shot('ask', 2600);
await click(WORDS[0]); await shot('ask-paths', 900); await click(WORDS[1]); await shot('ask-park', 900);
await click('Ask Florence'); await has('Open the shops'); await shot('plans', 900);
await click('Open the shops'); await shot('test-opening', 3300); await tap('bell'); await shot('test-bell-tapped', 300);
for (const i of [0, 1, 2]) { await shot(`test-${i + 1}-walking`, 3200); await has('Take the postcard'); await shot(`test-${i + 1}-arrived`, 400); await click('Take the postcard'); await r.until((i) => document.querySelectorAll('.pc img').length >= i + 1, i); await shot(`test-${i + 1}-postcard`, 300); }
await has('Ask again'); await shot('results', 1200);
if (path === 'look') { await r.close(); process.exit(0); }
if (path === 'park') {
  await r.p.click('.card:nth-child(3) .pcimg'); await shot('postcard-large', 600); await r.p.click('.pcbig');
  await r.usePlan(2); await r.pause(3200); await shot('play-start', 800);
  await pick('Straight'); await shot('play-wrong-piece', 500); await pick('Fork'); await shot('play-fork', 500);
  // the child forks beside the shops, goes left of the old tree and joins the four near homes
  await lay([['Fork', 3, 0], ['Fork', 2, 0], ['Straight', 1, 0], ['Fork', 0, 0], ['Straight', 0, 1], ['Bend', 0, 2]], 3); await shot('play-first-homes', 2500);
  await lay([['Straight', 4, 0], ['Straight', 5, 0], ['Fork', 6, 0], ['Straight', 6, 1], ['Bend', 6, 2]]); await shot('play-near-homes', 2500);
  // over the stream by the one bridge, on the left
  await lay([['Straight', 2, 1], ['Straight', 2, 2]]); await pick('Bridge'); await shot('play-bridge-places', 600); await lay([['Bridge', 2, 3]]); await shot('play-bridge', 900);
  await lay([['Fork', 2, 4], ['Straight', 1, 4], ['Fork', 0, 4], ['Straight', 0, 5], ['Fork', 0, 6], ['Bend', 1, 6]], 3); await shot('play-far-left', 2500);
  // a straight piece is swapped for a fork, so that the path can branch to the far homes
  await lay([['Straight', 3, 4]]); await shot('play-straight', 600); await lay([['Fork', 3, 4]]); await shot('play-swapped-for-fork', 600);
  await lay([['Straight', 3, 5], ['Bend', 3, 6], ['Straight', 4, 6], ['Fork', 5, 6], ['Straight', 6, 6]], 5); await shot('play-gran', 3000);
  await lay([['Straight', 4, 4], ['Straight', 5, 4], ['Straight', 6, 4]]); await shot('play-last', 3000);
  await r.p.click('.sw:nth-child(2)'); await shot('play-colour', 900);
  console.log('play', JSON.stringify(await r.p.evaluate(() => window.trial.cur.playState())));
  if (!(await r.p.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent === 'Next')))) { await click('Show me one way'); await shot('play-shown', 1500); }
} else {
  await r.usePlan(1); await r.pause(3200); await shot('play-start', 800);
  await lay([['Fork', 3, 0], ['Straight', 2, 0], ['Straight', 1, 0], ['Fork', 0, 0], ['Straight', 0, 1], ['Fork', 0, 2]], 3);
  await lay([['Bridge', 0, 3]]); await shot('play-bridge', 900);
  await click('Show me one way'); await shot('play-shown', 3000);
}
await has('Next'); await shot('play-done', 3000); await click('Next'); await has('Try another plan'); await shot('town', 2500);
if (path === 'loop') { r.tryStart(); await click('Try another plan'); await shot('other-plans', 900); await r.usePlan(2); await shot('what-changed', 3000); await click('Go back to my first plan'); await shot('first-kept', 2500); r.tryEnd(); }
await click('Next'); await shot('recap', 2600); await tap('panel', path === 'loop' ? 1 : 2); await shot('recap-answer', 900);
await click('Next'); await shot('end-walk-1', 3500); await shot('end-walk-2', 4000); await shot('end-shops', 7500);
await r.report(); await r.close();
