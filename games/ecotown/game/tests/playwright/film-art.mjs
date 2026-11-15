// A contact sheet of every drawing the film studio's missions use (art.js), to look at them side by side.
// Usage: node tests/playwright/film-art.mjs [baseUrl] [out.png]      (serve games/ecotown/game first)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const [base = 'http://localhost:8894/', out = 'film-art.png'] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded' });
await p.evaluate(async () => {
  const A = await import('./js/modules/film/art.js');
  const items = [
    ...Object.keys(A.STORY_ART).map((k) => [k, A.storyPic(k)]),
    ...['hall', 'florence', 'otters'].flatMap((s) => [null, 'blur', 'shake', 'dark', 'head', 'thumb'].map((f) => [`${s}/${f}`, A.takePic(s, f)])),
    ...Object.keys(A.SHOT_ART).map((k) => [k, A.shotPic(k)]),
    ['caption', A.captionPic('otters', 'FLORENCE: Look, the otters are back!')],
    ...Object.keys(A.MADE_ART).map((k) => [k, A.madePic(k)]),
    ...Object.keys(A.PEOPLE_ART).map((k) => [k, A.peoplePic(k)]),
    ...Object.keys(A.CHANGE_ART).map((k) => [k, A.changePair(k)]),
  ];
  document.body.innerHTML = `<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;padding:6px;background:#fff">${items.map(([k, s]) => `<figure style="margin:0;font:11px sans-serif">${s}<figcaption>${k}</figcaption></figure>`).join('')}</div>`;
  document.body.style.overflow = 'auto';
});
await p.screenshot({ path: out, fullPage: true }); console.log(errors.length ? errors : 'ok'); await b.close();
