// Plays the "Getting around" level through and saves a picture of every step.
//   node play.mjs <out folder> <width> <height> <path> [speed]
// path "park" asks for short and direct paths and the park in the middle, uses the paths through the park, draws the paths with the bridge on the left, and then moves the bridge to Gran's side.
// path "grid" asks for long and winding paths and the park at the far edge of the town, uses the grid of streets, plants the young trees, and then tries another plan.
// The opening of the shops and the walks are played three times as slowly ("&walk=3"), so that the slow recording machine catches people on the way.
import { openLevel } from '../../level-kit/record.mjs'; import { drawer, parkPlay } from './draw.mjs';
const LONG0 = 1500000;
const [out = 'pictures/run', width = 1440, height = 810, path = 'park', speed = 1] = process.argv.slice(2);
const r = await openLevel({ page: 'concepts/levels/getting-around/index.html', out, width, height, speed: +speed, query: `&walk=${3 * speed}` }), { tap } = r, d = drawer(r); r.p.setDefaultTimeout(LONG0);
// The recording machine is shared and can stop for minutes at a time, so this script uses its own patient presses and waits (25 minutes each) in place of the helper's.
const LONG = 1500000, fs = await import('fs'); let shots = 0;
const has = (t) => r.p.waitForFunction((t) => [...document.querySelectorAll('button')].some((b) => b.textContent === t && !b.disabled), t, { timeout: LONG });
const click = async (t) => { await has(t); await r.think(2); await r.p.evaluate((t) => [...document.querySelectorAll('button')].find((b) => b.textContent === t && !b.disabled).click(), t); };
const css = async (sel) => { await r.p.waitForSelector(sel, { timeout: LONG }); await r.p.evaluate((sel) => document.querySelector(sel).click(), sel); };
const usePlan = async (i) => { await r.think(4); await css(`[data-plan="${i}"]`); };
const shot = async (name, ms = 700) => { await r.p.waitForTimeout(ms / speed + (speed > 1 ? 250 : 0)); fs.mkdirSync(out, { recursive: true }); await r.p.screenshot({ path: `${out}/${String(++shots).padStart(2, '0')}-${name}.jpg`, type: 'jpeg', quality: 82, timeout: LONG }); console.log(name, await r.p.evaluate(() => document.getElementById('fps').textContent)); };
const WORDS = { park: ['short and direct', 'in the middle of the town'], grid: ['long and winding', 'at the far edge of the town'] }[path];
const say = async (what) => console.log(what, JSON.stringify(await d.state()), '|', (await r.p.evaluate(() => document.getElementById('say').innerText)).replace(/\n/g, ' / '));

await shot('job', 2500); await tap('tree'); await shot('job-tree-tapped', 900); await click('Start'); await shot('ask', 2600);
await click(WORDS[0]); await shot('ask-paths', 900); await click(WORDS[1]); await shot('ask-park', 900);
await click('Ask Florence'); await has('Open the shops'); await shot('plans', 900);
await click('Open the shops'); await shot('test-opening', 2600); await tap('bell'); await shot('test-bell-tapped', 300);
for (const i of [0, 1, 2]) { await shot(`test-${i + 1}-walking`, i ? 4500 : 2500); await has('Take the postcard'); await shot(`test-${i + 1}-arrived`, 400); await click('Take the postcard'); await r.p.waitForFunction((i) => document.querySelectorAll('.pc img').length >= i + 1, i, { timeout: LONG }); await shot(`test-${i + 1}-postcard`, 300); }
await has('Ask again'); await shot('results', 1200);
if (path === 'park') {
  await css('.card:nth-child(3) .pcimg'); await shot('postcard-large', 600); await css('.pcbig');
  await usePlan(2); await r.pause(3200); await shot('play-start', 800);
  await parkPlay(d, shot, say, has);
  await css('.sw:nth-child(2)'); await shot('play-colour', 900);
} else {
  await usePlan(0); await r.pause(3200); await shot('play-start', 800);
  await d.drag([[3, 0], [3, 6]]); await shot('play-first-drag', 1500); await d.drag([[3, 0], [0, 0]]); await d.drag([[3, 0], [6, 0]]); await d.drag([[3, 2], [0, 2]]); await d.drag([[3, 2], [6, 2]]); await shot('play-near-homes', 2500);
  await d.tool('Young tree'); await shot('play-young-places', 600); for (const [c, row] of [[0, 1], [6, 1], [0, 5], [6, 5]]) await d.tap(c, row); await shot('play-young-planted', 800); await d.tool('Paving');
  await d.drag([[3, 4], [0, 4]]); await d.drag([[3, 4], [6, 4]]); await d.drag([[3, 6], [0, 6]]); await shot('play-far-car', 1500); await d.drag([[3, 6], [6, 6]]); await has('Next'); await say('grid');
}
await shot('play-done', 3000); await click('Next'); await has('Try another plan'); await shot('town', 2500);
if (path === 'grid') { r.tryStart(); await click('Try another plan'); await shot('other-plans', 900); await usePlan(2); await shot('what-changed', 3000); await click('Go back to my first plan'); await shot('first-kept', 2500); r.tryEnd(); }
await click('Next'); await shot('recap', 2600); await tap('panel', path === 'grid' ? 0 : 2); await shot('recap-answer', 900);
await click('Next'); await shot('end-walk-1', 5000 * speed); await shot('end-walk-2', 9000 * speed); await shot('end-shops', 30000 * speed);
await r.report(); await r.close();
