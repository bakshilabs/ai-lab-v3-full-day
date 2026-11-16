// A short browser check of the "power" module's saved rounds: each mission keeps its own next round.
// Usage: node tests/playwright/power-resume.mjs [baseUrl] [outDir] [width height]
// It puts a save with two missions left part-way into the game, opens the module, checks the map says "Carry on",
// resumes mission 1 at its round, leaves, checks both saved rounds are still there, then resumes mission 5 and
// looks at the slots on a phone.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const [base = 'http://localhost:8896/', out = 'shots-power-resume', W = 390, H = 844] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +W, height: +H } });
await p.addInitScript(() => { localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low', reduce: true })); });
const errors = []; p.on('pageerror', (e) => errors.push(e.message)); p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()));
const LONG = 300000; p.setDefaultTimeout(LONG); const M = '#module[data-module="power"] '; const checks = {};
const text = (sel) => p.evaluate((s) => document.querySelector(s)?.textContent?.replace(/\s+/g, ' ').trim() || '', sel);
await p.goto(base + 'index.html');
await p.click('[data-band="junior"]'); await p.click('[data-name]'); await p.click('[data-go]');
{ const sk = await p.waitForSelector('[data-introskip]', { timeout: LONG }).catch(() => null); if (sk) await sk.click().catch(() => {}); }
await p.waitForFunction(() => window.__eco?.app?.G?.canMenu?.(), null, { timeout: LONG });
const put = (done, rounds) => p.evaluate(({ done, rounds }) => { const G = window.__eco.app.G; G.modules = { ...(G.modules || {}), power: { at: Date.now(), state: { v: 2, done, res: {}, rounds, hand: '', rules: { list: [], school: false, turns: false } } } }; }, { done, rounds });
const open = async () => { await p.evaluate(() => { window.__r = undefined; window.__eco.openModule('power').then((r) => { window.__r = r ?? null; }); }); try { await p.waitForSelector(M + '.pw-map', { timeout: 120000 }); } catch (e) { await p.screenshot({ path: `${out}/00-stuck.png` }); console.log(JSON.stringify({ stuck: true, r: await p.evaluate(() => window.__r), errors })); throw e; } };
const leave = async () => { await p.click('#module .modback'); await p.waitForFunction(() => window.__r !== undefined); await p.waitForTimeout(500); };
const kept = () => p.evaluate(() => window.__eco.app.G.modules?.power?.state?.rounds);

await put(Array(6).fill(false), { balance: { round: 2, part: { level: 15, of: 16 } }, demand: { round: 3, part: { moved: 6, kwh: 60 } } });
await open(); checks.carryOn = await text(M + '.pw-maphead ~ .pw-row'); await p.screenshot({ path: `${out}/01-map.png` });
await p.click(M + '[data-m="0"]'); await p.waitForSelector(M + '.pw-brief'); checks.brief = await text(M + '.pw-brief');
await p.click(M + '[data-act="start"]'); await p.waitForSelector(M + 'ol.pw-steps'); checks.round = await text(M + '.pw-screen h3');
await p.screenshot({ path: `${out}/02-m1-round3.png` });
checks.chipPadding = await p.evaluate((m) => getComputedStyle(document.querySelector(m + 'ol.pw-steps li')).paddingLeft, M);
await leave(); checks.afterLeave = await kept();

await put([true, true, true, true, false, false], { balance: { round: 2, part: { level: 15, of: 16 } }, demand: { round: 3, part: { moved: 6, kwh: 60 } } });
await open(); await p.click(M + '[data-m="4"]'); await p.click(M + '[data-act="start"]'); await p.waitForSelector(M + '.pw-slots');
checks.m5Top = await text(M + '.pw-moving'); await p.click(M + '[data-job="carA"]'); checks.m5Moving = await text(M + '.pw-moving');
checks.movingOnScreen = await p.evaluate((m) => { const r = document.querySelector(m + '.pw-moving').getBoundingClientRect(), s = document.querySelector(m + '.pw-slots').getBoundingClientRect(); return r.bottom <= s.top + 1 && r.top >= -1 && s.bottom <= innerHeight; }, M);
await p.screenshot({ path: `${out}/03-m5-day4-phone.png` });
await leave(); checks.afterLeave2 = await kept();
const ok = /Carry on: mission 1/.test(checks.carryOn) && /round 3/.test(checks.brief) && /Round 3 of 3/.test(checks.round) && checks.afterLeave?.balance?.round === 2 && checks.afterLeave?.demand?.round === 3
  && /Day 4 of 4/.test(checks.m5Top) && /Mill Lane/.test(checks.m5Moving) && checks.afterLeave2?.balance?.round === 2 && checks.afterLeave2?.demand?.round === 3 && errors.length === 0;
console.log(JSON.stringify({ ok, checks, errors }, null, 2));
await b.close(); process.exit(ok ? 0 : 1);
