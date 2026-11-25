// Draws the alternate-style pictures and the same views in the present style: node cap-alt.mjs <scale> <folder> [numbers from 1]
import { open } from '../lib.mjs'; import fs from 'fs';
const scale = +(process.argv[2] || 1), dir = process.argv[3] || 'shots', only = process.argv.slice(4).map((n) => +n - 1); fs.mkdirSync(dir, { recursive: true });
const { p, close } = await open(scale);
const n = await p.evaluate(async () => { window.AX = await import('/concepts/alt-style/alt.js'); return AX.SHOTS.length; });
for (let i = 0; i < n; i++) { if (only.length && !only.includes(i)) continue; const id = await p.evaluate((i) => AX.show(i), i); await p.waitForTimeout(250); await p.screenshot({ path: `${dir}/${id}.jpg`, type: 'jpeg', quality: 88 }); console.log(id); }
await close();
