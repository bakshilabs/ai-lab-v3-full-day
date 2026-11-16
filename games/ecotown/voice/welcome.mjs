// Plays the welcome film (index.html?welcome=1) to the end with Next, for the speech log. Run it with said-hook.mjs:
//   SAID=/tmp/said/welcome.json node --import ./games/ecotown/voice/said-hook.mjs games/ecotown/voice/welcome.mjs http://localhost:8880/
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const [base = 'http://localhost:8880/'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); p.setDefaultTimeout(180000);
await p.addInitScript(() => localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce: true })));
await p.goto(base + 'index.html?welcome=1');
await p.click('#welcome [data-play]');
for (let i = 0; i < 20; i++) { const n = await p.waitForSelector('#welcome [data-next], #welcome [data-start]'); if (await n.getAttribute('data-start') !== null) break; await p.waitForTimeout(600); await n.click(); }
await p.waitForTimeout(1500);
console.log('welcome said', await p.evaluate(() => window.__sayLog.length));
await b.close();
