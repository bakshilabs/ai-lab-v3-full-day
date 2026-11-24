// Checks how the Land level looks when the whole game holds it in a frame with "?next=": node framed.mjs <out dir>
// It saves two pictures, the first step and the last closing picture (reached with window.trial.end(), so the homes of the play break are not there).
import { createRequire } from 'module'; import fs from 'fs'; import http from 'http'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/'), { chromium } = require('playwright'), root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..'), out = process.argv[2] || 'pictures/framed';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); if (u === '/holder') { r.setHeader('content-type', 'text/html'); return r.end('<body style="margin:0"><iframe src="/concepts/levels/land/index.html?next=Go%20on&fx=on&speed=4" style="border:0;width:100vw;height:100vh"></iframe>'); }
  const f = path.join(root, u); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
await new Promise((r) => srv.once('listening', r));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }), p = await b.newPage({ viewport: { width: 1440, height: 810 } });
p.on('pageerror', (e) => console.log('ERR', e.message)); await p.goto(`http://localhost:${srv.address().port}/holder`, { timeout: 300000 }); fs.mkdirSync(out, { recursive: true });
const f = p.frames()[1]; await f.waitForFunction(() => window.trial, null, { timeout: 180000 }); await p.waitForTimeout(4000); await p.screenshot({ path: `${out}/01-framed-job.jpg`, type: 'jpeg', quality: 82 });
await f.evaluate(() => window.trial.end()); await p.waitForTimeout(6000); await p.screenshot({ path: `${out}/02-framed-end.jpg`, type: 'jpeg', quality: 82 });
console.log('label:', await f.evaluate(() => document.getElementById('label').textContent), '| chip:', await f.evaluate(() => document.querySelector('.chip').innerText), '| buttons:', await f.evaluate(() => [...document.querySelectorAll('#tray button')].map((x) => x.textContent).join(', ')));
await b.close(); srv.close();
