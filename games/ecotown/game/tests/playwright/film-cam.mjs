// Every camera view the film studio's first mission uses (shot sizes and moves), photographed in a small town, so the
// framing can be checked by eye. Usage: node tests/playwright/film-cam.mjs [baseUrl] [outDir]   (SIZE=768x1024 for upright)
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const [base = 'http://localhost:8894/', out = 'shots-film-cam'] = process.argv.slice(2);
const [W, H] = (process.env.SIZE || '1280x800').split('x').map(Number); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H } }); p.setDefaultTimeout(300000);
await p.addInitScript(() => { window.__filmTest = true; localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce: true })); });
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
await p.goto(base + 'index.html'); await p.click('[data-band="junior"]'); await p.click('[data-name]'); await p.click('[data-go]');
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: 180000 }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForSelector('#build [data-cat="land"]', { timeout: 240000 });
await p.evaluate(() => { const { G } = window.__eco.app; for (const [k, item] of [['6,3', 'timber'], ['7,3', 'straw'], ['7,4', 'timber'], ['8,5', 'market'], ['9,5', 'hall'], ['11,3', 'school'], ['10,4', 'park'], ['12,7', 'wind']]) { try { G.placeAt(k, 'town', { free: true }); G.placeAt(k, item, { free: true }); } catch {} } });
await p.waitForFunction(() => window.__eco.app.G.canMenu(), null, { timeout: 120000 });
await p.evaluate(() => { window.__eco.openModule('film'); }); await p.waitForSelector('#module [data-fm-map]', { timeout: 300000 });
await p.evaluate(() => document.querySelector('#module .fm-m').remove()); // the camera alone
const list = await p.evaluate(async () => { const C = await import('./js/modules/film/m1-crew.js'); const { set } = window.__filmCam;
  return [...C.sizeItems(set, false), ...C.moveItems(set, false), ...C.sceneItems(set)].map((x) => ({ shot: x.shot, name: x.answer + '-' + x.shot.sub.replace(/[:]/g, '_') })); });
let i = 0; for (const { shot, name } of list) for (const u of ['pan', 'tilt', 'track'].includes(shot.move) ? [0, 1] : [0.5]) {
  await p.evaluate(([s, uu]) => window.__filmCam.player.look(s, uu), [shot, u]); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/${W}-${String(++i).padStart(2, '0')}-${name}-${u}.png` });
}
console.log(errors.length ? errors : 'ok', i); await b.close();
