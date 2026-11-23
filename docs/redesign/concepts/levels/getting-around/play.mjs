// Plays the "Getting around" level through and saves a picture of every step.
//   node play.mjs <out folder> <width> <height> <path> [speed]
// path "park" asks for short and direct paths and the park in the middle, uses the paths through the park, and lays the pieces one by one.
// path "loop" asks for paths beside the busy road and the park at the far edge, uses the winding loop, and then tries another plan.
// path "look" only takes one picture of each view, for a quick check.
import { openLevel } from '../../level-kit/record.mjs';
const [out = 'pictures/run', width = 1440, height = 810, path = 'park', speed = 1] = process.argv.slice(2);
const r = await openLevel({ page: 'concepts/levels/getting-around/index.html', out, width, height, speed: +speed }), { shot, click, has, tap } = r;
const N = 7, cell = (c, row) => c + row * N, pick = (kind) => r.p.evaluate((k) => [...document.querySelectorAll('.tok')].find((b) => b.textContent.startsWith(k)).click(), kind);
// lays pieces: each step is [kind, column, row]
const lay = async (steps, every = 0) => { let n = 0, last = ''; for (const [kind, c, row] of steps) { if (kind !== last) { await pick(kind); last = kind; await r.pause(150); } await tap('cell', cell(c, row)); await r.pause(350); if (every && ++n % every === 0) await shot(`play-${String(n).padStart(2, '0')}`, 900); } };
const WORDS = { park: ['short and direct', 'in the middle of the town'], loop: ['beside the busy road', 'at the far edge of the town'] }[path] || ['short and direct', 'in the middle of the town'];

await shot('job', 2500); await click('Start'); await shot('ask', 2600);
await click(WORDS[0]); await shot('ask-paths', 900); await click(WORDS[1]); await shot('ask-park', 900);
await click('Ask Florence'); await has('Open the shops'); await shot('plans', 900);
await click('Open the shops'); await shot('test-opening', 3300);
for (const i of [0, 1, 2]) { await r.until((i) => document.querySelectorAll('.pc img').length === i && /morning/.test(document.getElementById('say').textContent), i); await shot(`test-${i + 1}-start`, 2600); await shot(`test-${i + 1}-walking`, 3600); await r.until((i) => document.querySelectorAll('.pc img').length === i + 1, i); await shot(`test-${i + 1}-postcard`, 500); }
await has('Ask again'); await shot('results', 1200);
if (path === 'look') { await r.close(); process.exit(0); }
if (path === 'park') {
  await r.p.click('.pc:nth-child(3)'); await shot('postcard-large', 600); await r.p.click('.pcbig');
  await r.usePlan(2); await r.pause(3200); await shot('play-start', 800);
  await pick('Straight'); await shot('play-wrong-piece', 500); await pick('Fork'); await shot('play-fork', 500);
  // the child goes left of the old tree, puts the bridge on the left, and forks to both sides
  await lay([['Fork', 3, 0], ['Straight', 2, 0], ['Fork', 1, 0], ['Bend', 0, 0], ['Straight', 4, 0], ['Straight', 5, 0], ['Bend', 6, 0]], 3);
  await lay([['Bend', 2, 1]]); await shot('play-a-bend-that-does-not-join', 700);
  await lay([['Take back', 2, 1], ['Take back', 2, 0], ['Fork', 2, 0], ['Straight', 2, 1], ['Fork', 2, 2], ['Straight', 1, 2]]); await shot('play-near-homes', 1500);
  await lay([['Bend', 0, 2], ['Bridge', 2, 3]]); await shot('play-bridge', 900);
  await lay([['Fork', 2, 4], ['Straight', 1, 4], ['Bend', 0, 4], ['Straight', 3, 4], ['Fork', 4, 4], ['Straight', 5, 4], ['Bend', 6, 4]], 4);
  await lay([['Take back', 3, 4], ['Fork', 3, 4], ['Straight', 3, 5], ['Fork', 3, 6], ['Straight', 2, 6], ['Fork', 1, 6], ['Bend', 0, 6]], 4); await shot('play-far-left', 1500);
  await lay([['Take back', 6, 2]]);
  await lay([['Straight', 4, 6], ['Fork', 5, 6], ['Bend', 6, 6]]); await shot('play-far-right', 2200);
  // the two homes on the right near the stream: the path comes up from the square beside the shops
  await lay([['Take back', 6, 0], ['Fork', 6, 0], ['Straight', 6, 1], ['Bend', 6, 2]]); await shot('play-last', 2500);
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
