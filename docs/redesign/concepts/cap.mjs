import { open } from './lib.mjs'; import fs from 'fs';
const scale = +(process.argv[2] || 1), dir = process.argv[3] || 'shots'; fs.mkdirSync(dir, { recursive: true });
const { p, close } = await open(scale);
const n = await p.evaluate(async () => { window.CX = await import('/concepts/scenes.js'); return CX.SCENES.length; });
for (let i = 0; i < n; i++) { const id = await p.evaluate((i) => CX.show(i), i); await p.waitForTimeout(150); await p.screenshot({ path: `${dir}/${String(i + 1).padStart(2, '0')}-${id}.jpg`, type: 'jpeg', quality: 88 }); console.log(id); }
await close();
