// Draws the alternate look built from car town: node cap2.mjs <scale> <folder> [numbers from 1]
// The air is clean (blue sky) by default. For the grey air of pictures-2, run it as: AIR=grey node cap2.mjs 1.5 pictures-2
import { open } from '../lib.mjs'; import fs from 'fs';
const scale = +(process.argv[2] || 1), dir = process.argv[3] || 'shots', only = process.argv.slice(4).map((n) => +n - 1); fs.mkdirSync(dir, { recursive: true });
const { p, close } = await open(scale);
const n = await p.evaluate(async (a) => { window.AX = await import('/concepts/alt-style/island2.js'); AX.setAir(a); return AX.SHOTS.length; }, process.env.AIR || 'clean');
for (let i = 0; i < n; i++) { if (only.length && !only.includes(i)) continue; const id = await p.evaluate((i) => AX.show(i), i); await p.waitForTimeout(250); await p.screenshot({ path: `${dir}/${id}.jpg`, type: 'jpeg', quality: 88 }); console.log(id); }
await close();
