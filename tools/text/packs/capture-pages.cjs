// Pictures of the plain pages for the packs: the AI Lab start page (its top and its six part cards), the trailer page
// and the leader's run sheet, one picture per section (each section's heading scrolled to the top of the window).
// Usage: node tools/text/packs/capture-pages.cjs <baseUrl> <outDir>      (serve games/ecotown/game first)
const fs = require('fs');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const [base = 'http://localhost:8931/', out = 'pages'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const at = async (name, sel) => {
    if (sel) await p.evaluate((s) => { const all = [...document.querySelectorAll('h1,h2,h3,section,[id]')]; const sel = (q) => { try { return document.querySelector(q); } catch { return null; } }; const el = sel(s) || all.find((e) => /^H[1-3]$/.test(e.tagName) && (e.textContent || '').trim().startsWith(s)); if (el) el.scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0); }, sel);
    await p.waitForTimeout(600); await p.screenshot({ path: `${out}/${name}.png` }); console.log(name);
  };
  await p.goto(base + 'start.html', { waitUntil: 'networkidle' }); await at('start-top');
  await at('start-day', '#day'); await at('start-parts', '[data-parts]'); await at('start-how', '#how'); await at('start-leaders', 'Leading a group?');
  await p.goto(base + 'trailer.html', { waitUntil: 'networkidle' }); await at('trailer');
  await p.goto(base + 'leader.html', { waitUntil: 'networkidle' }); await at('leader-top');
  for (const [n, h] of [['hour', 'The hour'], ['before', 'Before the children arrive'], ['wait', 'Where the game makes a child wait'], ['wrong', 'Where Florence is wrong on purpose'], ['questions', 'Questions to ask'], ['mistakes', 'Common mistakes'], ['worrying', 'If a child types something worrying']]) await at(`leader-${n}`, h);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
