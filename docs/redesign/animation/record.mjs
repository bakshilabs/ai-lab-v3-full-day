// Records the film frame by frame into video files, and renders its sound track.
// Usage: node record.mjs <output folder> [frames per second]
//   ONLY=0,3 records only those parts (0 is the opening, 1 to 6 are the levels, 7 is the end).
//   AUDIO=1 renders only the sound track, as <output folder>/sound.wav.
// Afterwards join.sh joins the parts and adds the sound.
import { createRequire } from 'module'; const require = createRequire('/'); import fs from 'fs'; import http from 'http'; import path from 'path'; import { spawn } from 'child_process'; import { fileURLToPath } from 'url';
const { chromium } = require('playwright'); const dir = path.dirname(fileURLToPath(import.meta.url)), root = path.dirname(dir), out = process.argv[2], fps = +(process.argv[3] || 30);
fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp' };
// the page reads ../ui/tokens.css and ../design/*.js, so the folder above this one is served
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto(`http://localhost:${srv.address().port}/${path.basename(dir)}/index.html?rec=1`); await p.waitForFunction(() => window.film, null, { timeout: 120000 });
const info = await p.evaluate(() => ({ d: film.duration, l: film.levels })); const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
if (process.env.AUDIO) {
  const bytes = await p.evaluate(() => film.audio()), size = 3 * 1024 * 1024, bufs = []; for (let i = 0; i * size < bytes; i++) bufs.push(Buffer.from(await p.evaluate(([i, s]) => film.audioPart(i, s), [i, size]), 'base64'));
  const pcm = Buffer.concat(bufs), h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(44100, 24); h.writeUInt32LE(88200, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(path.join(out, 'sound.wav'), Buffer.concat([h, pcm])); console.log(`sound: ${(pcm.length / 88200).toFixed(1)} s`);
} else for (const [i, m] of info.l.entries()) { if (only && !only.includes(i)) continue;
  const file = path.join(out, `part-${i}.mp4`), ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', process.env.CRF || '23', '-preset', 'medium', '-movflags', '+faststart', file]);
  const n = Math.round(m.dur * fps), t0 = Date.now();
  for (let k = 0; k < n; k++) { await p.evaluate((T) => film.seek(T), m.start + k / fps); const buf = await p.screenshot({ type: 'jpeg', quality: 92 }); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); if (k % 100 === 0) console.log(`part ${i}: frame ${k} of ${n}, ${Math.round((Date.now() - t0) / 1000)} s`); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log(`part ${i} ${m.name}: ${n} frames in ${Math.round((Date.now() - t0) / 1000)} s`);
}
await b.close(); srv.close();
