// Records the opening of the film from the six-town world map (games/ecotown/game/tests/visual/worldmap.html):
// the whole world, and then a flight to one town. Usage: node intro.mjs <output file> <town id> <title> [frames per second]
import { createRequire } from 'module'; const require = createRequire('/'); import fs from 'fs'; import http from 'http'; import path from 'path'; import { spawn } from 'child_process'; import { fileURLToPath } from 'url';
const { chromium } = require('playwright'); const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '../../../games/ecotown/game');
const [file, town = 'eco', title = 'Week 1: Eco Town', fpsArg = '30'] = process.argv.slice(2), fps = +fpsArg, secs = 9.5;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.css': 'text/css' };
const srv = http.createServer((q, r) => { const f = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.clock.install({ time: 0 }); await p.goto(`http://localhost:${srv.address().port}/tests/visual/worldmap.html`); await p.clock.runFor(200); await p.waitForFunction(() => window.worldmap);
await p.addStyleTag({ content: `body > *:not(.filmkeep) { visibility: hidden; } #map { visibility: visible !important; position: fixed !important; inset: 0 !important; width: 1280px !important; height: 720px !important; z-index: 5; border-radius: 0 !important; }
  .pin { visibility: visible !important; position: fixed !important; z-index: 6; left: 0; top: 0; font-size: 18px !important; }
  #filmtitle { visibility: visible; position: fixed; z-index: 7; left: 50%; bottom: 46px; transform: translateX(-50%); background: #fffaf0; color: #3b2a1e; border: 3px solid #3b2a1e; border-radius: 22px; padding: 14px 34px; font: 800 44px Bricolage, Inter, system-ui, sans-serif; box-shadow: 0 8px 0 #3b2a1e; opacity: 0; }
  html, body { background: #dff1f7 !important; overflow: hidden; }` });
await p.evaluate((title) => { const d = document.createElement('div'); d.id = 'filmtitle'; d.textContent = title; document.body.appendChild(d); dispatchEvent(new Event('resize')); }, title);
await p.clock.runFor(100); await p.evaluate(() => { worldmap.snap(); });
const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', file]);
const n = Math.floor(secs * fps); let flown = false;
for (let k = 0; k < n; k++) { const t = k / fps;
  if (!flown && t >= 3.2) { flown = true; await p.evaluate((town) => worldmap.setView(town), town); }
  await p.evaluate((o) => { document.getElementById('filmtitle').style.opacity = o; }, Math.max(0, Math.min(1, (t - 5.2) / 0.6)) * Math.max(0, Math.min(1, (secs - 0.1 - t) / 0.5)));
  await p.clock.runFor(Math.round(1000 / fps)); const buf = await p.screenshot({ type: 'jpeg', quality: 93 }); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); if (process.env.SHOT && [60, 200].includes(k)) fs.writeFileSync(`${process.env.SHOT}-${k}.jpg`, buf); }
ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close(); srv.close(); console.log('intro written', file);
