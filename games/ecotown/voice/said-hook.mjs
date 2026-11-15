// Records every line a browser test speaks, without changing the test. Load it before any Playwright script:
//   SAID=/tmp/v/drone-junior.json node --import ./games/ecotown/voice/said-hook.mjs games/ecotown/game/tests/playwright/drone.mjs ...
// It turns on the game's speech log (window.__sayLog) in every page the script opens and writes it, as the said.json
// that collect.mjs reads, every few seconds and when the browser closes (so a run that stops part-way still counts).
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const out = process.env.SAID; if (!out) throw new Error('said-hook: set SAID=<file.json>');
// the same Playwright the tests load (they try require('playwright') first, then the copy that comes with Node)
const pw = (() => { for (const from of [process.argv[1], import.meta.url]) { try { return createRequire(from)('playwright'); } catch { /* next */ } } return require('/opt/node22/lib/node_modules/playwright'); })();
const pages = new Set(); const done = []; // logs of closed pages
const grab = async () => { const all = [...done]; for (const p of pages) { try { all.push(...(await p.evaluate(() => window.__sayLog || []))); } catch { /* navigating or closed */ } } return all; };
let last = '[]';
const write = async () => { const all = await grab(); const s = JSON.stringify(all.filter((x) => x.voice !== 'float'), null, 1); if (s.length >= last.length) { last = s; fs.writeFileSync(out, s); } };
// Only the speech matters here, so a busy machine must not stop a run: screenshots are skipped (SHOTS=1 keeps them,
// with a long wait) and every wait for the page is at least SLOW ms (default 4 minutes).
const SLOW = +(process.env.SLOW || 240000);
const watch = (p) => {
  pages.add(p);
  p.setDefaultTimeout(SLOW); const setDefault = p.setDefaultTimeout.bind(p); p.setDefaultTimeout = (t) => setDefault(Math.max(t, SLOW));
  const shot = p.screenshot.bind(p); p.screenshot = process.env.SHOTS === '1' ? (o = {}) => shot({ ...o, timeout: Math.max(o.timeout || 0, SLOW) }).catch(() => Buffer.alloc(0)) : async () => Buffer.alloc(0);
  for (const m of ['waitForSelector', 'click', 'fill', 'waitForFunction']) { const f = p[m].bind(p); const at = m === 'waitForFunction' ? 2 : 1;
    p[m] = (...a) => { const o = a[at]; if (o && typeof o === 'object' && o.timeout) a[at] = { ...o, timeout: Math.max(o.timeout, SLOW) }; return f(...a); }; }
  // keep the log across page loads in this tab (the welcome guide and the hub go to new pages)
  p.addInitScript(() => { try { window.__sayLog = JSON.parse(sessionStorage.getItem('__said') || '[]'); } catch { window.__sayLog = []; }
    addEventListener('pagehide', () => { try { sessionStorage.setItem('__said', JSON.stringify(window.__sayLog)); } catch { /* */ } }); });
  p.on('close', () => pages.delete(p));
};
const wrapContext = (cx) => { cx.on('page', watch); for (const p of cx.pages()) watch(p); return cx; };
const launch = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = async (...a) => {
  const b = await launch(...a);
  const newContext = b.newContext.bind(b); b.newContext = async (...x) => wrapContext(await newContext(...x));
  const newPage = b.newPage.bind(b); b.newPage = async (...x) => { const p = await newPage(...x); watch(p); return p; };
  const close = b.close.bind(b); b.close = async (...x) => { await write().catch(() => {}); return close(...x); };
  return b;
};
setInterval(() => { write().catch(() => {}); }, 4000).unref();
