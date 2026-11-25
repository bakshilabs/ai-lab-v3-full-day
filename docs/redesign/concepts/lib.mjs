import { createRequire } from 'module'; const require = createRequire('/'); import fs from 'fs'; import http from 'http'; import path from 'path';
const { chromium } = require('playwright'); export const root = '/home/user/ai-lab-v3-full-day/docs/redesign';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp' };
export async function open(scale = 1) {
  const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => srv.once('listening', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: scale });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://localhost:${srv.address().port}/animation/index.html?rec=1`); await p.waitForFunction(() => window.film, null, { timeout: 120000 });
  return { p, close: async () => { await b.close(); srv.close(); } };
}
