// Records the animation frame by frame into video files. Usage: node record.mjs <output folder> [frames per second]
import { createRequire } from 'module'; const require = createRequire('/'); import fs from 'fs'; import http from 'http'; import path from 'path'; import { spawn } from 'child_process'; import { fileURLToPath } from 'url';
const { chromium } = require('playwright'); const dir = path.dirname(fileURLToPath(import.meta.url)), out = process.argv[2], fps = +(process.argv[3] || 30), page = process.argv[4] || 'index.html';
fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = q.url.split('?')[0], f = path.join(dir, u === '/' ? page : u); if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto(`http://localhost:${srv.address().port}/?rec=1`); await p.waitForFunction(() => window.film);
const info = await p.evaluate(() => ({ d: film.duration, l: film.levels })); const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
for (const [i, m] of info.l.entries()) { if (only && !only.includes(i)) continue;
  const file = path.join(out, `level-${i + 1}.mp4`), ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', file]);
  const n = Math.floor(m.dur * fps), t0 = Date.now();
  for (let k = 0; k < n; k++) { await p.evaluate((T) => film.seek(T), m.start + k / fps); const buf = await p.screenshot({ type: 'jpeg', quality: 93 }); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log(`level ${i + 1} ${m.name}: ${n} frames in ${Math.round((Date.now() - t0) / 1000)} s`);
}
await b.close(); srv.close();
