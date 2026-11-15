// Runs the Worker's logic on this machine, for the load test only. Nothing here is deployed or reaches Cloudflare.
// Usage: node tests/load/local.mjs <folder where "npm i miniflare" was run> [port] [seats]
// It serves the real router, store and code logic (worker/router.js, store.js, codes.js) with a small stand-in for the
// game's files, makes one organisation and one group, prints the join code and leader code, and stays up until stopped.
// The admin check is open here, so it listens on this machine only (127.0.0.1).
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { randomBytes } from 'node:crypto';
const [dir, portArg, seatsArg] = process.argv.slice(2);
if (!dir) { console.error('Usage: node tests/load/local.mjs <folder with miniflare installed> [port] [seats]'); process.exit(2); }
const { Miniflare } = createRequire(path.resolve(dir, 'x.js'))('miniflare');
const worker = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../worker'); const read = (f) => fs.readFileSync(path.join(worker, f), 'utf8');
const port = +(portArg || 8799), seats = +(seatsArg || 2000);
// stand-in game files: a page and five files of about the right total size (random text, so it does not compress away)
const blob = (kb) => randomBytes(kb * 512).toString('hex'); const hash = randomBytes(4).toString('hex');
const files = { [`/assets/app-${hash}.js`]: '//' + blob(900), [`/assets/m-${hash}.js`]: '//' + blob(300), [`/assets/app-${hash}.css`]: '/*' + blob(80) + '*/', '/assets/a.json': JSON.stringify({ a: blob(40) }), '/assets/b.json': JSON.stringify({ b: blob(20) }) };
files['/index.html'] = `<!doctype html><title>Eco Town (stand-in)</title>${Object.keys(files).map((f) => (f.endsWith('.css') ? `<link rel="stylesheet" href="${f.slice(1)}">` : `<script type="module" src="${f.slice(1)}"></script>`)).join('')}`;
const entry = `import { makeHandler } from './router.js';\nexport { CodeStore } from './store.js';\nimport FILES from './files.js';\nimport LEADER from './leader.html';\nimport ADMIN from './admin.html';\n`
  + `export default { fetch: makeHandler({ files: FILES, adminHtml: ADMIN, leaderHtml: LEADER, access: async () => true }) };\n`;
const mf = new Miniflare({
  host: '127.0.0.1', port, compatibilityDate: '2025-01-01', modulesRoot: worker,
  modules: [
    { type: 'ESModule', path: path.join(worker, 'local-entry.js'), contents: entry },
    { type: 'ESModule', path: path.join(worker, 'files.js'), contents: 'export default ' + JSON.stringify(files) + ';' },
    ...['router.js', 'store.js', 'codes.js'].map((f) => ({ type: 'ESModule', path: path.join(worker, f), contents: read(f) })),
    ...['admin.html', 'leader.html'].map((f) => ({ type: 'Text', path: path.join(worker, f), contents: read(f) })),
  ],
  durableObjects: { CODES: { className: 'CodeStore', useSQLite: true } },
});
const base = (await mf.ready).origin.replace('[::1]', '127.0.0.1');
const post = async (p, body) => (await fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
const day = (d) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
const org = await post('/admin/api/orgs', { name: 'Load test', starts: day(-1), ends: day(30), seats });
if (!org.id) { console.error('Could not make the organisation:', org); await mf.dispose(); process.exit(1); }
const group = await post(`/admin/api/orgs/${org.id}/groups`, { name: 'Load group' });
console.log(`URL=${base}\nJOIN=${group.code}\nLEADER=${org.leaderCode}\nSEATS=${seats}`);
console.log('Running. Press Ctrl+C to stop.');
const stop = async () => { await mf.dispose(); process.exit(0); }; process.on('SIGINT', stop); process.on('SIGTERM', stop);
