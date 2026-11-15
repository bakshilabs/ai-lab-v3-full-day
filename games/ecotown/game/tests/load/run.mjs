// Load test: plays the server's part of N learners against a TEST copy of the site.
// Usage: node tests/load/run.mjs <baseUrl> <joinCode> <learners> [minutes]
// Each pretend learner joins with the group's code, loads the page and a handful of its files, then checks in
// every 60 s with a status and saves every 30 s. The organisation needs at least <learners> free seats.
// Options (environment): RAMP_S seconds over which the learners arrive (default 10), SAVE_KB size of a save (default 8),
// ASSETS comma-separated file paths to load (default: the first six /assets/ files named in the page), JSON=1 prints the result as JSON too.
// It never runs against the original site.
const [base, code, nArg, minArg] = process.argv.slice(2);
if (!base || !code || !nArg) { console.error('Usage: node tests/load/run.mjs <baseUrl> <joinCode> <learners> [minutes]'); process.exit(2); }
const url = new URL(base); const host = url.hostname.toLowerCase();
// the original classroom site and its public test page belong to another repository: refuse them
if ((host.endsWith('deltaops.workers.dev') && host.split('.')[0] === 'ecotown') || host === 'bakshilabs.github.io') { console.error(`Refusing to load-test ${host}: that is the original site.`); process.exit(2); }
const N = Math.floor(+nArg), MINUTES = +(minArg || 2), RAMP = +(process.env.RAMP_S ?? 10) * 1000, SAVE_KB = +(process.env.SAVE_KB ?? 8);
if (!(N >= 1) || !(MINUTES > 0)) { console.error('Learners and minutes must be numbers above 0.'); process.exit(2); }
const origin = url.origin; const end = Date.now() + MINUTES * 60000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const noAnswer = {}; // why a request got no answer -> count
const stats = {}; // type -> { ms: [], codes: { status: count } }   (status 0 = no answer: network error or 30 s timeout)
async function hit(type, path, opts = {}) {
  const s = (stats[type] ||= { ms: [], codes: {} }); const t0 = performance.now(); let status = 0, body = null, cookie = '';
  try { const r = await fetch(origin + path, { ...opts, redirect: 'manual', signal: AbortSignal.timeout(30000) }); status = r.status; cookie = (r.headers.get('set-cookie') || '').split(';')[0]; body = await r.text(); } catch (e) { const why = e?.cause?.code || e?.name || 'error'; noAnswer[why] = (noAnswer[why] || 0) + 1; }   // counted as status 0
  s.ms.push(performance.now() - t0); s.codes[status] = (s.codes[status] || 0) + 1;
  return { status, body, cookie };
}
const STAGES = ['Land', 'Getting around', 'Homes', 'Food', 'Power', 'A school for everyone'];
const filler = 'x'.repeat(Math.max(0, SAVE_KB * 1024 - 200));
let joined = 0, gameServed = 0;
async function learner(i) {
  await sleep(Math.random() * RAMP);
  const j = await hit('join', '/api/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
  const cookie = j.status === 200 ? j.cookie : ''; if (!cookie) return;
  joined++; const h = { Cookie: cookie };
  const page = await hit('page', '/', { headers: h });
  if (page.status === 200 && !/id="f"[^>]*autocomplete/.test(page.body || '')) gameServed++;   // the game, not the join page
  const files = process.env.ASSETS ? process.env.ASSETS.split(',') : [...new Set([...(page.body || '').matchAll(/(?:src|href)="\.?\/?(assets\/[^"]+)"/g)].map((m) => '/' + m[1]))].slice(0, 6);
  await Promise.all(files.map((f) => hit('file', f, { headers: h })));
  const status = (k) => ({ module: 'ecotown', band: i % 2 ? 'junior' : 'senior', stage: STAGES[k % 6], missionsDone: k % 7, goalsMet: k % 9, state: 'playing', problem: k % 5 === 0 ? 'carbon over 160 t' : '', stuck: false, finished: false, at: Date.now() });
  let k = 0, nextBeat = Date.now() + Math.random() * 60000, nextSave = Date.now() + Math.random() * 30000;
  while (Date.now() < end) {
    const now = Date.now();
    if (now >= nextSave) { nextSave += 30000; k++; await hit('save', '/api/save', { method: 'PUT', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ at: Date.now(), v: 'load', data: { learner: i, step: k, filler }, status: status(k) }) }); }
    if (now >= nextBeat) { nextBeat += 60000; await hit('heartbeat', '/api/heartbeat', { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: status(k) }) }); }
    await sleep(Math.max(50, Math.min(nextBeat, nextSave, end) - Date.now()));
  }
}

const started = Date.now();
console.log(`Load test: ${N} learners for ${MINUTES} min against ${origin} (arriving over ${RAMP / 1000} s, saves of about ${SAVE_KB} KB)`);
await Promise.all(Array.from({ length: N }, (_, i) => learner(i)));
const pct = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.ceil((p / 100) * a.length) - 1)] : 0);
const rows = []; let all = 0, good = 0;
for (const type of ['join', 'page', 'file', 'heartbeat', 'save']) {
  const s = stats[type]; if (!s) continue; s.ms.sort((a, b) => a - b);
  const ok = s.codes[200] || 0; all += s.ms.length; good += ok;
  const errors = Object.entries(s.codes).filter(([c]) => c !== '200').map(([c, n]) => `${c === '0' ? 'no answer' : c}: ${n}`).join(', ') || 'none';
  rows.push({ type, requests: s.ms.length, ok, success: +(100 * ok / s.ms.length).toFixed(2), errors, p50: Math.round(pct(s.ms, 50)), p95: Math.round(pct(s.ms, 95)), p99: Math.round(pct(s.ms, 99)), max: Math.round(s.ms.at(-1)) });
}
const pad = (v, n) => String(v).padEnd(n);
console.log(`\n${pad('request', 11)}${pad('sent', 8)}${pad('ok', 8)}${pad('success', 10)}${pad('p50 ms', 8)}${pad('p95 ms', 8)}${pad('p99 ms', 8)}${pad('max ms', 8)}errors by status`);
for (const r of rows) console.log(`${pad(r.type, 11)}${pad(r.requests, 8)}${pad(r.ok, 8)}${pad(r.success + ' %', 10)}${pad(r.p50, 8)}${pad(r.p95, 8)}${pad(r.p99, 8)}${pad(r.max, 8)}${r.errors}`);
const summary = { noAnswer, learners: N, minutes: MINUTES, joined, gameServed, requests: all, success: all ? +(100 * good / all).toFixed(2) : 0, seconds: Math.round((Date.now() - started) / 1000), rows };
console.log(`\nLearners who joined: ${joined} of ${N}. Served the game page (not the join page): ${gameServed}.`);
console.log(`All requests: ${all}, success ${summary.success} %, ${(all / Math.max(1, summary.seconds)).toFixed(1)} a second on average.`);
if (Object.keys(noAnswer).length) console.log('No answer, by cause: ' + Object.entries(noAnswer).map(([k, n]) => `${k}: ${n}`).join(', ') + '.');
if (process.env.JSON === '1') console.log('JSON ' + JSON.stringify(summary));
process.exit(0);
