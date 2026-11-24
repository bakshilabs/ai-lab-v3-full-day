// Checks the whole game in the pre-installed Chromium and saves pictures of it. Run it from this folder:
//   node check.mjs start [width] [height]     the start page as a child first sees it, and with some levels done
//   node check.mjs join [width] [height] [speed] [from]   opens level 1 from the start page, then goes through all six levels and the ending.
//                                                 from (1 to 6) starts at a later level with the earlier ones remembered as done, so that a slow run can be done in parts
// "join" does NOT play the levels. In each level it jumps straight to the closing pictures with the kit's window.trial.end(), which exists for this check only,
// so the pictures prove the way from one level to the next and not the levels themselves. The machine draws in software, so the run is slow.
import { createRequire } from 'module'; import fs from 'fs'; import http from 'http'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/'), { chromium } = require('playwright'), root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');   // docs/redesign
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const [what = 'start', width = 1440, height = 810, speed = 1, from = 1] = process.argv.slice(2), out = `pictures/${what}-${width}`; fs.mkdirSync(out, { recursive: true });
const asked = new Set(), srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); asked.add(path.relative(root, f)); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
await new Promise((r) => srv.once('listening', r));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }), ctx = await b.newContext({ viewport: { width: +width, height: +height } }), p = await ctx.newPage(); p.setDefaultTimeout(240000);
p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.log('CON', m.text()); });
const outside = []; p.on('request', (q) => { if (!q.url().startsWith(`http://localhost:${srv.address().port}/`) && !q.url().startsWith('data:') && !q.url().startsWith('blob:')) outside.push(q.url()); });
const url = `http://localhost:${srv.address().port}/concepts/game/index.html?fx=on&speed=${speed}`; let n = 0;
const shot = async (name, ms = 2500) => { await p.waitForTimeout(ms); await p.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.jpg`, type: 'jpeg', quality: 84, timeout: 180000 }); console.log(name); };
const press = (t) => p.getByRole('button', { name: t, exact: true }).click({ timeout: 240000 });
const has = (t) => p.waitForFunction((t) => [...document.querySelectorAll('button')].some((b) => b.textContent === t && !b.disabled), t);
const remember = (list) => p.evaluate((l) => localStorage.setItem('eco-town-game-1', JSON.stringify(l)), list);
await p.goto(url); await p.waitForFunction(() => window.game);
if (what === 'start') {
  await shot('start-nothing-done', 4000);
  await remember([0, 1, 2]); await p.reload(); await p.waitForFunction(() => window.game); await shot('start-three-done', 4000);
  await remember([0, 1, 2, 3, 4, 5]); await p.reload(); await p.waitForFunction(() => window.game); await shot('start-all-done', 4000);
  await press('See the finished town'); await shot('ending-town', 6000); await press('Next'); await shot('ending-jobs', 2500);
  await remember([]);
} else {
  if (+from > 1) { n = (+from - 1) * 5 + 1; await remember(Array.from({ length: +from - 1 }, (_, k) => k)); await p.reload(); await p.waitForFunction(() => window.game); await has('Carry on'); await press('Carry on'); } else { await shot('start', 4000); await press('Start'); }
  for (let i = +from - 1; i < 6; i++) { const f = p.frames().find((x) => x !== p.mainFrame()) || (await p.waitForEvent('frameattached'));
    await f.waitForFunction(() => window.trial && [...document.querySelectorAll('button')].some((b) => !b.disabled)); await shot(`level-${i + 1}-opens`, 5000);
    // If a level's closing picture needs what the child built in the play break, the jump fails. The check then makes every part of that scene fail quietly and jumps again,
    // so the level still reaches its end, but its closing picture is then not the real one. The log says when this happened
    const soft = await f.evaluate(() => { const t = window.trial; t.S.pick = t.S.pick ?? 0; try { t.end(); return false; } catch (e) { const s = t.cur; for (const k of Object.keys(s)) if (typeof s[k] === 'function') { const fn = s[k]; s[k] = (...a) => { try { return fn(...a); } catch (e2) { return undefined; } }; } t.end(); return e.message; } });
    if (soft) console.log(`level ${i + 1}: the closing picture could not be drawn without the play break (${soft}), so it is not the real one`);
    // a level may have more than one closing picture: press its own "next" buttons until the game's button shows
    for (let k = 0; k < 6; k++) { if (await f.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent === 'Go on'))) break; await f.locator('#tray button.sun').click(); await p.waitForTimeout(1500); }
    await shot(`level-${i + 1}-end`, 6000); console.log('done after the end:', await p.evaluate(() => [...window.game.done]));
    await f.getByRole('button', { name: 'Go on', exact: true }).click(); await shot(`town-after-level-${i + 1}-building`, 1500);
    if (i < 5) { await has('Carry on'); await shot(`town-after-level-${i + 1}`, 1500); await press('Carry on'); } }
  await has('Next'); await shot('ending-town', 6000); await press('Next'); await shot('ending-jobs', 2500); await press('Back to Eco Town'); await shot('town-all-done', 4000);
  await ctx.close(); const c2 = await b.newContext({ viewport: { width: +width, height: +height } }), p2 = await c2.newPage(); await p2.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('no storage'); } }); });
  p2.on('pageerror', (e) => console.log('ERR without storage', e.message)); await p2.goto(url); await p2.waitForFunction(() => window.game); await p2.waitForTimeout(4000); await p2.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-start-without-storage.jpg`, type: 'jpeg', quality: 84 }); console.log('works without storage');
}
console.log('requests that left this folder tree:', outside.length ? outside : 'none');
console.log('files asked for:', [...asked].sort().join('\n  '));
await b.close(); srv.close();
