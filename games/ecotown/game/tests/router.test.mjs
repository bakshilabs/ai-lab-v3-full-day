// The Worker's routes, run in Node with a pretend Cloudflare: join, game files, saves, the leader's side and admin.
import test from 'node:test'; import assert from 'node:assert/strict';
import { makeHandler } from '../../worker/router.js';
import { createCodeStore } from '../../worker/codes.js';

function memStorage() {
  const m = new Map(); const clone = (v) => (v === undefined ? v : structuredClone(v));
  return { m, async get(k) { return clone(m.get(k)); }, async put(k, v) { m.set(k, clone(v)); }, async delete(k) { m.delete(k); },
    async list({ prefix = '' } = {}) { return new Map([...m].filter(([k]) => k.startsWith(prefix)).map(([k, v]) => [k, clone(v)])); } };
}
// one store per Durable Object name, as Cloudflare gives; arguments are copied as they are across a real call
function fakeEnv() {
  const objects = new Map();
  const get = (name) => { if (!objects.has(name)) { const mem = memStorage(); objects.set(name, { mem, store: createCodeStore(mem) }); } return objects.get(name); };
  return { objects, CODES: { idFromName: (n) => n, get: (name) => ({ call: async (...a) => structuredClone(await get(name).store.call(...structuredClone(a))) }) } };
}
const FILES = { '/index.html': '<h1>the game</h1>', '/assets/app-0123abcd.js': 'console.log(1)' };
function app({ admin = true } = {}) {
  const env = fakeEnv(); const handle = makeHandler({ files: FILES, adminHtml: 'ADMIN PAGE', leaderHtml: 'LEADER PAGE', access: async () => admin });
  const call = async (method, path, { body, cookie, raw } = {}) => {
    const r = await handle(new Request('https://test.example' + path, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), 'Content-Type': 'application/json' }, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) }), env);
    const text = await r.text(); let data = null; try { data = JSON.parse(text); } catch { /* a page */ }
    const set = r.headers.get('Set-Cookie') || '';
    return { status: r.status, data, text, set, cookie: set.split(';')[0], headers: r.headers };
  };
  return { env, call };
}
const today = new Date().toISOString().slice(0, 10); const later = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
async function club(call, name = 'Oak Club', seats = 20) {
  const org = (await call('POST', '/admin/api/orgs', { body: { name, starts: today, ends: later, seats } })).data;
  const g = (await call('POST', `/admin/api/orgs/${org.id}/groups`, { body: { name: 'Saturday club' } })).data;
  return { org, g };
}

test('the join page shows until a learner joins; then the game and its files are served', async () => {
  const { call } = app(); const { g } = await club(call);
  const page = await call('GET', '/'); assert.equal(page.status, 200); assert.match(page.text, /Type your group’s code/); assert.match(page.text, /I already have a badge/); assert.ok(!page.text.includes('the game'));
  assert.equal((await call('GET', '/assets/app-0123abcd.js')).status, 403);
  const bad = await call('POST', '/api/join', { body: { code: 'NOPE-0000' } }); assert.equal(bad.status, 401); assert.deepEqual(Object.keys(bad.data), ['ok', 'reason', 'message']); assert.equal(bad.data.reason, 'unknown'); assert.equal(bad.set, '');
  const j = await call('POST', '/api/join', { body: { code: g.code } });
  assert.equal(j.status, 200); assert.deepEqual(Object.keys(j.data).sort(), ['badge', 'ends', 'group', 'learner', 'ok']); assert.deepEqual(j.data.group, { name: 'Saturday club' }); assert.equal(j.data.ends, later);
  assert.match(j.set, /^eco_s=[a-f0-9]{12}\.[a-f0-9]{24}\.[a-f0-9]{48}; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000$/);
  const game = await call('GET', '/', { cookie: j.cookie }); assert.equal(game.text, '<h1>the game</h1>'); assert.match(game.headers.get('Cache-Control'), /no-store/);
  const asset = await call('GET', '/assets/app-0123abcd.js', { cookie: j.cookie }); assert.equal(asset.status, 200); assert.match(asset.headers.get('Cache-Control'), /immutable/);
  assert.equal((await call('GET', '/nothing.js', { cookie: j.cookie })).status, 404);
  const me = await call('GET', '/api/me', { cookie: j.cookie }); assert.deepEqual(me.data, { ok: true, learner: j.data.learner, badge: j.data.badge, group: { name: 'Saturday club' }, ends: later });
  assert.equal((await call('GET', '/api/me')).status, 401);
  const alias = await call('POST', '/api/login', { body: { code: g.code } }); assert.ok(alias.data.ok, '/api/login still works'); assert.notEqual(alias.data.learner, j.data.learner);
  const out = await call('POST', '/api/logout', { cookie: j.cookie }); assert.match(out.set, /Max-Age=0/);
  assert.match((await call('GET', '/', { cookie: j.cookie })).text, /Type your group’s code/);
});

test('heartbeat carries a status; a badge on a second device replaces the first', async () => {
  const { call } = app(); const { g } = await club(call);
  const a = await call('POST', '/api/join', { body: { code: g.code } });
  assert.deepEqual((await call('POST', '/api/heartbeat', { cookie: a.cookie })).data, { ok: true }, 'no body, as the game sends today');
  assert.deepEqual((await call('POST', '/api/heartbeat', { cookie: a.cookie, body: { status: { stage: 'Homes', missionsDone: 2, state: 'playing', junk: 'x' } } })).data, { ok: true });
  assert.equal((await call('POST', '/api/heartbeat', { cookie: a.cookie, raw: 'not json' })).status, 200);
  const none = await call('POST', '/api/heartbeat'); assert.equal(none.status, 409); assert.equal(none.data.reason, 'none');
  const b = await call('POST', '/api/join', { body: { code: g.code, badge: a.data.badge } }); assert.equal(b.data.learner, a.data.learner);
  const old = await call('POST', '/api/heartbeat', { cookie: a.cookie }); assert.equal(old.status, 409); assert.equal(old.data.reason, 'replaced'); assert.ok(old.data.message);
  assert.match((await call('GET', '/', { cookie: a.cookie })).text, /another device/);
  const nb = await call('POST', '/api/join', { body: { code: g.code, badge: 'Nobody 99' } }); assert.equal(nb.status, 401); assert.equal(nb.data.reason, 'no_badge');
});

test('a full organisation refuses the next learner with a clear message', async () => {
  const { call } = app(); const { g } = await club(call, 'Small Club', 2);
  await call('POST', '/api/join', { body: { code: g.code } }); await call('POST', '/api/join', { body: { code: g.code } });
  const r = await call('POST', '/api/join', { body: { code: g.code } }); assert.equal(r.status, 401); assert.equal(r.data.reason, 'full'); assert.match(r.data.message, /full/);
});

test('save: read, newest wins, 64 KB at most', async () => {
  const { call, env } = app(); const { org, g } = await club(call); const a = await call('POST', '/api/join', { body: { code: g.code } });
  assert.deepEqual((await call('GET', '/api/save', { cookie: a.cookie })).data, { ok: true, save: null });
  assert.deepEqual((await call('PUT', '/api/save', { cookie: a.cookie, body: { at: 2000, v: '1.0', data: { tiles: [1, 2] }, status: { stage: 'Land', hidden: 'x' } } })).data, { ok: true, kept: true });
  assert.deepEqual((await call('PUT', '/api/save', { cookie: a.cookie, body: { at: 1000, v: '1.0', data: { tiles: [] } } })).data, { ok: true, kept: false });
  assert.deepEqual((await call('GET', '/api/save', { cookie: a.cookie })).data, { ok: true, save: { at: 2000, v: '1.0', data: { tiles: [1, 2] } } });
  assert.deepEqual(env.objects.get('org:' + org.id).mem.m.get('n:' + a.data.learner).status, { stage: 'Land' });
  const big = await call('PUT', '/api/save', { cookie: a.cookie, body: { at: 3000, data: { blob: 'x'.repeat(64 * 1024) } } }); assert.equal(big.status, 413); assert.equal(big.data.reason, 'too_big');
  assert.equal((await call('PUT', '/api/save', { cookie: a.cookie, body: { at: 3000, data: { blob: 'x'.repeat(60 * 1024) } } })).status, 200);
  assert.equal((await call('PUT', '/api/save', { cookie: a.cookie, body: { at: 4000, data: 'text' } })).status, 400); assert.equal((await call('PUT', '/api/save', { cookie: a.cookie, raw: '{' })).status, 400);
  assert.equal((await call('PUT', '/api/save', { body: { at: 1, data: {} } })).status, 401); assert.equal((await call('GET', '/api/save')).status, 401);
  assert.ok(!env.objects.has('org:undefined'), 'a request with no session reaches no organisation');
});

test('the leader’s side: own organisation only, by cookie', async () => {
  const { call } = app(); const A = await club(call, 'Club A'); const B = await club(call, 'Club B');
  const a = await call('POST', '/api/join', { body: { code: A.g.code } }); await call('POST', '/api/join', { body: { code: B.g.code } });
  await call('POST', '/api/heartbeat', { cookie: a.cookie, body: { status: { stage: 'Food', missionsDone: 3, state: 'playing', problem: 'carbon over 160 t' } } });
  assert.equal((await call('GET', '/leader')).text, 'LEADER PAGE');
  assert.equal((await call('GET', '/api/leader/groups')).status, 401);
  const bad = await call('POST', '/api/leader/login', { body: { code: 'LEAD-NOPE-0000' } }); assert.equal(bad.status, 401); assert.equal(bad.data.reason, 'unknown');
  const L = await call('POST', '/api/leader/login', { body: { code: A.org.leaderCode } });
  assert.deepEqual(L.data, { ok: true, name: 'Club A' }); assert.match(L.set, /^eco_l=[a-f0-9]{12}\.[a-f0-9]{48}; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200$/);
  const gs = await call('GET', '/api/leader/groups', { cookie: L.cookie }); assert.equal(gs.data.org.name, 'Club A'); assert.deepEqual(gs.data.groups.map((g) => g.code), [A.g.code]);
  const ls = await call('GET', `/api/leader/groups/${A.g.id}/learners`, { cookie: L.cookie });
  assert.equal(ls.data.learners.length, 1); assert.equal(ls.data.learners[0].badge, a.data.badge); assert.equal(ls.data.learners[0].stage, 'Food'); assert.equal(ls.data.learners[0].limitMissed, true);
  // organisation B, by every id the leader of A could try
  const other = await call('GET', `/api/leader/groups/${B.g.id}/learners`, { cookie: L.cookie }); assert.equal(other.status, 400); assert.ok(!other.text.includes('badge'));
  assert.equal((await call('GET', `/api/leader/groups/${B.org.id}/learners`, { cookie: L.cookie })).status, 404);
  assert.equal((await call('GET', `/api/leader/groups?org=${B.org.id}`, { cookie: L.cookie })).data.org.name, 'Club A', 'an id in the address changes nothing');
  const forged = `eco_l=${B.org.id}.${L.cookie.split('.')[1]}`;
  assert.equal((await call('GET', '/api/leader/groups', { cookie: forged })).status, 401); assert.equal((await call('GET', `/api/leader/groups/${B.g.id}/learners`, { cookie: forged })).status, 401);
  assert.equal((await call('POST', '/api/leader/groups', { cookie: forged, body: { name: 'Mine' } })).status, 401);
  assert.equal((await call('GET', '/api/leader/groups', { cookie: a.cookie.replace('eco_s', 'eco_l') })).status, 401, 'a learner’s session is not a leader’s');
  assert.equal((await call('GET', `/admin/api/orgs/${A.org.id}/groups`, { cookie: L.cookie })).status, 200, 'admin is checked by Access, not by this cookie (the test lets admin in)');
  // adding a group
  const add = await call('POST', '/api/leader/groups', { cookie: L.cookie, body: { name: 'Holiday camp' } }); assert.equal(add.status, 200); assert.match(add.data.group.code, /^[A-Z]+-\d{4}$/);
  assert.equal((await call('POST', '/api/leader/groups', { cookie: L.cookie, body: { name: 'Late', ends: '2099-01-01' } })).status, 400);
  assert.ok((await call('POST', '/api/join', { body: { code: add.data.group.code } })).data.ok);
  await call('POST', '/api/leader/logout', { cookie: L.cookie }); assert.equal((await call('GET', '/api/leader/groups', { cookie: L.cookie })).status, 401);
});

test('admin: organisations and groups, counts, edit, delete; shut without the Access login', async () => {
  const { call } = app(); const { org, g } = await club(call);
  assert.equal((await call('GET', '/admin')).text, 'ADMIN PAGE');
  const a = await call('POST', '/api/join', { body: { code: g.code } });
  let list = (await call('GET', '/admin/api/orgs')).data; assert.equal(list.length, 1); assert.equal(list[0].learners, 1); assert.equal(list[0].active, 1); assert.equal(list[0].groups, 1); assert.equal(list[0].seats, 20); assert.match(list[0].leaderCode, /^LEAD-/);
  const groups = (await call('GET', `/admin/api/orgs/${org.id}/groups`)).data; assert.equal(groups[0].learners, 1); assert.equal(groups[0].code, g.code);
  assert.equal((await call('PATCH', `/admin/api/orgs/${org.id}`, { body: { seats: 5, revoked: true } })).data.seats, 5);
  assert.equal((await call('POST', '/api/heartbeat', { cookie: a.cookie })).data.reason, 'revoked');
  await call('PATCH', `/admin/api/orgs/${org.id}`, { body: { revoked: false } }); assert.ok((await call('POST', '/api/heartbeat', { cookie: a.cookie })).data.ok);
  assert.equal((await call('PATCH', `/admin/api/orgs/${org.id}/groups/${g.id}`, { body: { revoked: true } })).data.revoked, true);
  assert.equal((await call('POST', '/admin/api/orgs', { body: { name: '' } })).status, 400);
  assert.deepEqual((await call('DELETE', `/admin/api/orgs/${org.id}/groups/${g.id}`)).data, { ok: true });
  assert.equal((await call('POST', '/api/join', { body: { code: g.code } })).data.reason, 'unknown'); assert.equal((await call('POST', '/api/heartbeat', { cookie: a.cookie })).data.reason, 'none');
  assert.deepEqual((await call('DELETE', `/admin/api/orgs/${org.id}`)).data, { ok: true }); assert.deepEqual((await call('GET', '/admin/api/orgs')).data, []);
  assert.equal((await call('GET', '/admin/api/nothing')).status, 404);
  const shut = app({ admin: false });
  for (const [m, p] of [['GET', '/admin'], ['GET', '/admin/api/orgs'], ['POST', '/admin/api/orgs'], ['DELETE', `/admin/api/orgs/${org.id}`]]) assert.equal((await shut.call(m, p, { body: m === 'POST' ? { name: 'X', starts: today, ends: later, seats: 1 } : undefined })).status, 403);
});

test('the real admin check refuses a request with no Access login, and no test key opens it', async () => {
  const env = fakeEnv(); env.ADMIN_TEST_KEY = 'k'; const handle = makeHandler({ adminHtml: 'ADMIN PAGE' });
  const r = await handle(new Request('https://test.example/admin/api/orgs', { headers: { 'X-Admin-Test-Key': 'k' } }), env); assert.equal(r.status, 403);
  assert.equal((await handle(new Request('https://test.example/admin'), env)).status, 403);
});

test('a game page opened by one learner cannot save or check in under another learner’s session', async () => {
  const { call } = app(); const { g: group } = await club(call);
  const a = await call('POST', '/api/join', { body: { code: group.code } }); const b = await call('POST', '/api/join', { body: { code: group.code } });
  // A's page is still open, but the browser's session is now B's: A's save and check-in are refused, and B's stays empty
  const put = await call('PUT', '/api/save', { cookie: b.cookie, body: { learner: a.data.learner, at: Date.now(), v: 1, data: { cells: [['1,1', { item: 'timber' }]] } } });
  assert.equal(put.status, 409); assert.equal(put.data.reason, 'other');
  const beat = await call('POST', '/api/heartbeat', { cookie: b.cookie, body: { learner: a.data.learner, status: { stage: 'A was here', missionsDone: 3 } } });
  assert.equal(beat.status, 409); assert.equal(beat.data.reason, 'other');
  assert.equal((await call('GET', '/api/save', { cookie: b.cookie })).data.save, null);
  // the right learner, and a game that sends no learner id (an older page), still work
  assert.equal((await call('PUT', '/api/save', { cookie: b.cookie, body: { learner: b.data.learner, at: Date.now(), v: 1, data: { cells: [] } } })).status, 200);
  assert.equal((await call('POST', '/api/heartbeat', { cookie: a.cookie, body: {} })).status, 200);
});
