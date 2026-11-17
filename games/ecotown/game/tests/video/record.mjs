// Records the build videos: one ~10 s clip per item (from above while it is built, then at eye level).
// Usage: node tests/video/record.mjs <baseUrl> [item ...]   (default: every item; skips ones already recorded unless --force)
// Writes videos/<item>.mp4 (H.264, faststart, plays on iPad/Chromebook), videos/<item>.jpg (poster) and
// videos/<item>.json (stage timeline for the captions), then videos/index.json. Needs ffmpeg and a running server.
// Options: [--w 960 --h 540] film size (the page is laid out at 960 × 540 and drawn at w/960 of that, see hires.mjs)
//   [--ss 2] supersampling (draw at ss × the film size, scale down); [--tier mid|high]; [--png] PNG frames;
//   [--work <dir outside the repo> --vk 1500]: keep a near-lossless <dir>/<item>.video.mp4 (tools/trailer.mjs cuts
//   from it) and encode the film in two passes at --vk kbit/s; without --work, one pass at --crf (default 33).
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { spawn, spawnSync } from 'child_process';
import { hiresPage } from './hires.mjs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const args = process.argv.slice(2); const force = args.includes('--force'); const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const BOOL = new Set(['--force', '--png']);
const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !BOOL.has(args[i - 1])));
const base = pos[0] || 'http://localhost:8765/'; let items = pos.slice(1);
const FPS = +opt('fps', 24), W = +opt('w', 960), H = +opt('h', 540), TIER = opt('tier', 'mid'), SS = +opt('ss', 1), PNG = args.includes('--png'), WORK = opt('work'), VK = +opt('vk', 1500), CRF = opt('crf', '33');
if (WORK) fs.mkdirSync(WORK, { recursive: true });
const run = (a) => { const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: ['ignore', 'inherit', 'inherit'] }); if (r.status) throw new Error('ffmpeg failed: ' + a.join(' ')); };
const out = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'videos'); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
if (!items.length) { const p = await b.newPage(); await p.goto(base + 'index.html'); items = await p.evaluate(async () => Object.keys((await import('./js/world/catalog.js')).ITEMS)); await p.close(); }
for (const id of items) {
  const mp4 = path.join(out, `${id}.mp4`); if (!force && fs.existsSync(mp4)) { console.log('skip', id); continue; }
  const p = await hiresPage(b, { w: W, ss: SS });
  await p.addInitScript(() => localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'high', reduce: false, readAloud: false })));
  p.on('pageerror', (e) => console.log('[pageerror]', id, e.message));
  await p.goto(`${base}index.html?shoot=${id}&tier=${TIER}`); await p.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  await p.evaluate(() => document.getElementById('boot')?.remove()); // the loading card is only removed by the game's start()
  const dur = await p.evaluate(() => window.__duration); const n = Math.round(dur * FPS); const t0 = Date.now();
  const raw = WORK && path.join(WORK, `${id}.video.mp4`); const poster = path.join(WORK || out, `${id}.poster.${PNG ? 'png' : 'jpg'}`);
  const encArgs = raw ? ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', raw] : ['-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-tune', 'animation', '-profile:v', 'main', '-movflags', '+faststart', mp4];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', PNG ? 'png' : 'mjpeg', '-i', '-', '-vf', `scale=${W}:${H}:flags=lanczos,format=yuv420p`, ...encArgs], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    const t = i / FPS; await p.evaluate((t) => { window.__render(t); return new Promise((r) => requestAnimationFrame(() => r())); }, t);
    const buf = PNG ? await p.screenshot({ type: 'png' }) : await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (Math.abs(t - 5.8) < 0.5 / FPS) fs.writeFileSync(poster, buf);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  if (raw && spawnSync('ffmpeg', ['-v', 'error', '-i', raw, '-f', 'null', '-']).stderr.toString().trim()) { console.error(`${id}: the intermediate file did not decode cleanly; not finished`); await p.close(); continue; }
  if (raw) { // two-pass H.264 at --vk kbit/s from the near-lossless intermediate
    const log = path.join(WORK, `${id}.2pass`); const vf = ['-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-b:v', `${VK}k`, '-maxrate', `${Math.round(VK * 1.8)}k`, '-bufsize', `${VK * 3}k`, '-g', String(FPS * 4), '-passlogfile', log];
    run(['-i', raw, ...vf, '-pass', '1', '-an', '-f', 'mp4', '/dev/null']); run(['-i', raw, ...vf, '-pass', '2', '-an', '-movflags', '+faststart', mp4]);
  }
  run(['-i', poster, '-vf', `scale=${W}:${H}:flags=lanczos`, '-q:v', '4', path.join(out, `${id}.jpg`)]); if (!WORK) fs.rmSync(poster);
  fs.writeFileSync(path.join(out, `${id}.json`), JSON.stringify(await p.evaluate(() => window.__timeline())));
  console.log('recorded', id, `${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`, `${(fs.statSync(mp4).size / 1024).toFixed(0)} KB`);
  await p.close();
}
const all = fs.readdirSync(out).filter((f) => f.endsWith('.mp4')).map((f) => f.slice(0, -4)).sort();
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify({ items: all }));
console.log('index:', all.length, 'videos'); await b.close();
