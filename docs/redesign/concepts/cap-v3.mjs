// Draws the third version of the concept screens (the town and look of picture C): node cap-v3.mjs <scale> <folder> [scene numbers, from 1]
import { open } from './lib.mjs'; import fs from 'fs';
const scale = +(process.argv[2] || 1), dir = process.argv[3] || 'shots', only = process.argv.slice(4).map((n) => +n - 1); fs.mkdirSync(dir, { recursive: true });
const { p, close } = await open(scale);
const n = await p.evaluate(async () => { window.CX = await import('/concepts/scenes-v3.js'); return CX.SCENES.length; });
for (let i = 0; i < n; i++) { if (only.length && !only.includes(i)) continue; const id = await p.evaluate((i) => CX.show(i), i); await p.waitForTimeout(200); await p.screenshot({ path: `${dir}/${String(i + 1).padStart(2, '0')}-${id}.jpg`, type: 'jpeg', quality: 88 }); console.log(id); }
await close();
