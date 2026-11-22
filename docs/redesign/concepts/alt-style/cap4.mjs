// Draws the material-treatment test: node cap4.mjs <scale> <folder>
import { open } from '../lib.mjs'; import fs from 'fs';
const scale = +(process.argv[2] || 1.5), dir = process.argv[3] || 'pictures-4'; fs.mkdirSync(dir, { recursive: true });
const { p, close } = await open(scale);
const n = await p.evaluate(async () => { window.TX = await import('/concepts/alt-style/treat.js'); return TX.SHOTS.length; });
const box = await p.locator('.stage canvas').first().boundingBox();
for (let i = 0; i < n; i++) { const id = await p.evaluate((i) => TX.show(i), i); await p.waitForTimeout(250); await p.screenshot({ path: `${dir}/${id}.jpg`, type: 'jpeg', quality: 90, clip: { x: box.x, y: box.y, width: 640, height: 494 } }); console.log(id); }
await close();
