// A helper for the script that plays a level through and saves a picture of every step. It is based on the script of the Homes trial.
// It opens the level's page in the pre-installed Playwright Chromium (do not install Playwright), with the lighting effects kept on (?fx=on),
// and gives the script a few plain actions: take a picture, press a button, tap a place in the town. The machine that records draws in
// software, at about one picture each second, so a whole level takes many minutes. Give the command a generous time limit.
//
//   import { openLevel } from '../level-kit/record.mjs';        (from a level in concepts/trial/; from concepts/levels/<name>/ it is '../../level-kit/record.mjs')
//   const r = await openLevel({ page: 'concepts/trial/index.html', out: 'pictures/my-run', width: 1440, height: 810 });
//   await r.shot('job', 1500); await r.click('Start'); await r.shot('ask'); ... await r.close();
//
// The machine is sometimes shared with other recordings and then draws far more slowly, so every press and wait is given three minutes before it gives up.
// A speed above 1 (?speed=6) is for quick checks only: the animations run faster, and the times printed are then wrong.
// With timing: true no pictures are taken and the script waits only where a child would stop to look (the names given in look), so that the time printed is a fairer estimate.
import { createRequire } from 'module'; import fs from 'fs'; import http from 'http'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/'), { chromium } = require('playwright'), root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');   // docs/redesign
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

export async function openLevel({ page, out, width = 1440, height = 810, speed = 1, timing = false, look = /^(look|test|visit)/, query = '' }) {
  const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise((r) => srv.once('listening', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }), p = await b.newPage({ viewport: { width: +width, height: +height } });
  p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.log('CON', m.text()); });
  await p.goto(`http://localhost:${srv.address().port}/${page}?fps&fx=on&speed=${speed}${query}`); await p.waitForFunction(() => window.trial); if (out) fs.mkdirSync(out, { recursive: true });
  const close = async () => { await b.close(); srv.close(); };
  // The time a child of 8 to 12 would take is estimated like this: the real time the animations take, plus 0.5 seconds for every new word to read
  // (about 120 words a minute), plus 2 seconds to decide on and press a button and 4 seconds to find and tap a place in the town.
  const N = { words: 0, doing: 0, wordsTry: 0, doingTry: 0, realTry: 0 }, t0 = Date.now(); let n = 0, lastText = '', inTry = false, tTry = 0;
  const think = async (sec) => { const t = await p.evaluate(() => `${document.getElementById('say').innerText}\n${document.getElementById('over').innerText}`); if (t !== lastText) { const old = new Set(lastText.split(/\n/)), w = t.split(/\n/).filter((l) => !old.has(l)).join(' ').split(/\s+/).filter(Boolean).length; N[inTry ? 'wordsTry' : 'words'] += w; lastText = t; } N[inTry ? 'doingTry' : 'doing'] += sec; };
  const pause = (ms) => p.waitForTimeout(ms / speed + (speed > 1 ? 150 : 0));
  const r = { p, close, think, pause,
    // saves the next picture as <out>/<number>-<name>.jpg after waiting ms. RECORD_STOP=4 stops after four pictures, for a quick look
    async shot(name, ms = 700) { if (timing) { if (look.test(name)) await p.waitForTimeout(ms / speed); return; } await p.waitForTimeout(ms / speed + (speed > 1 ? 250 : 0)); await p.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.jpg`, type: 'jpeg', quality: 82 }); console.log(name, await p.evaluate(() => document.getElementById('fps').textContent)); if (n >= +(process.env.RECORD_STOP || process.env.TRIAL_STOP || 999)) { await close(); process.exit(0); } },
    // presses the button with exactly these words; has() waits until such a button can be pressed
    async click(t) { await think(2); return p.getByRole('button', { name: t, exact: true }).click({ timeout: 180000 }); },
    has: (t) => p.waitForFunction((t) => [...document.querySelectorAll('button')].some((b) => b.textContent === t && !b.disabled), t, { timeout: 180000 }),
    // presses "Use this plan" on the card of plan i
    async usePlan(i) { await think(4); await p.click(`[data-plan="${i}"]`, { timeout: 180000 }); },
    // taps a place in the town. The level's scene says where it is: scene.spot(name, i) gives [x, y, z] in the world
    async tap(name, i) { await think(4); const q = await p.evaluate(([name, i]) => { const rect = document.getElementById('c').getBoundingClientRect(); return window.trialProject(...window.trial.cur.spot(name, i), rect); }, [name, i]); await p.mouse.move(q[0], q[1]); await p.mouse.click(q[0], q[1]); },
    // waits until something is true in the page: fn is run there, and window.trial.cur is the scene
    until: (fn, arg = null) => p.waitForFunction(fn, arg, { timeout: 180000 }),
    // the part of the run between tryStart() and tryEnd() is counted as "tries another plan", which a fast child may skip
    tryStart() { inTry = true; tTry = Date.now(); }, tryEnd() { inTry = false; N.realTry = (Date.now() - tTry) / 1000; },
    // prints the estimate of how long the level takes
    report() { const real = (Date.now() - t0) / 1000, m = (x) => (x / 60).toFixed(1);
      console.log(`TIME typical child (120 words a minute, tries another plan): animation ${Math.round(real)} s, doing ${N.doing + N.doingTry} s, reading ${Math.round((N.words + N.wordsTry) * 0.5)} s (${N.words + N.wordsTry} words), total ${m(real + N.doing + N.doingTry + (N.words + N.wordsTry) * 0.5)} minutes`);
      console.log(`TIME fast reader (200 words a minute, does not try another plan): animation ${Math.round(real - N.realTry)} s, doing ${N.doing} s, reading ${Math.round(N.words * 0.3)} s, total ${m(real - N.realTry + N.doing + N.words * 0.3)} minutes`); } };
  return r; }
