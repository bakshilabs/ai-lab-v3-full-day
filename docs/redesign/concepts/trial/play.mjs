// Plays the trial level through and saves a picture of every step: node play.mjs <out dir> [width] [height] [side 0|1] [walls 0|1] [plan 0-2]
import { createRequire } from 'module'; const require = createRequire('/'); import fs from 'fs'; import http from 'http'; import path from 'path';
const { chromium } = require('playwright'); const root = '/home/user/ai-lab-v3-full-day/docs/redesign', [out, W = 1440, H = 810, side = 0, walls = 0, plan = 0] = process.argv.slice(2);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
await new Promise((r) => srv.once('listening', r));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: +W, height: +H } });
p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.log('CON', m.text()); });
await p.goto(`http://localhost:${srv.address().port}/concepts/trial/index.html?fps`); await p.waitForFunction(() => window.trial); fs.mkdirSync(out, { recursive: true });
let n = 0; const shot = async (name, ms = 700) => { await p.waitForTimeout(ms); await p.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.jpg`, type: 'jpeg', quality: 82 }); console.log(name, await p.evaluate(() => document.getElementById('fps').textContent)); };
const click = (t) => p.getByRole('button', { name: t, exact: true }).click(), has = (t) => p.waitForFunction((t) => [...document.querySelectorAll('button')].some((b) => b.textContent === t && !b.disabled), t, { timeout: 90000 });
const tap = async (name, i) => { const q = await p.evaluate(([name, i]) => { const r = document.getElementById('c').getBoundingClientRect(); return window.trialProject(...window.trial.cur.spot(name, i), r); }, [name, i]); await p.mouse.move(q[0], q[1]); await p.mouse.click(q[0], q[1]); };
await shot('job', 1500); await click('Start'); await shot('ask');
await click(['the sunny side', 'the shady side'][side]); await shot('ask-side'); await click(['thick walls', 'thin walls'][walls]); await shot('ask-full'); await click('Ask Florence'); await has('Bring the winter night'); await shot('plans');
await click('Bring the winter night'); await shot('test-making', 3600); await p.waitForFunction(() => document.querySelector('[data-plan]'), null, { timeout: 90000 }); await shot('results');
await p.click(`[data-plan="${plan}"]`); await p.waitForFunction(() => document.querySelector('.tok'), null, { timeout: 90000 }); await shot('build-0', 900);
if (+side) { await tap('roof'); await shot('build-1', 2300); await tap('win', 6); await shot('build-2'); await tap('win', 0); await shot('build-3'); } else { await tap('win', 0); await shot('build-1'); await tap('win', 2); await shot('build-2'); await tap('roof'); await shot('build-3', 2300); }
await p.click('[data-c="2"]'); await tap('door'); await shot('build-4', 600);
await has('Next'); await shot('build-done'); await click('Next'); await has('Try another plan'); await shot('town', 800);
await click('Try another plan'); await shot('other-plans'); await p.click(`[data-plan="${(+plan + 1) % 3}"]`); await shot('what-changed', 900); await click('Go back to my first plan'); await shot('first-kept', 900);
await click('Next'); await shot('recap', 900); await tap('side', +side ? 0 : 1); await shot('recap-answer', 900); await click('Next'); await shot('night-1', 3200); await shot('night-2', 8500);
await b.close(); srv.close();
