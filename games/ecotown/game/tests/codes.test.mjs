// Organisations, groups and learners: join codes, seats, dates, badges, saves, the leader's view and retention.
import test from 'node:test'; import assert from 'node:assert/strict';
import { createDirectory, createOrg, createService, createCodeStore, normalise, normaliseLeader, licenceState, groupState, purgeDue, cleanStatus, learnerRow, parseToken, KEEP_DAYS } from '../../worker/codes.js';

export function memStorage() {
  const m = new Map(); const clone = (v) => (v === undefined ? v : structuredClone(v));
  return { m, async get(k) { return clone(m.get(k)); }, async put(k, v) { m.set(k, clone(v)); }, async delete(k) { m.delete(k); },
    async list({ prefix = '' } = {}) { return new Map([...m].filter(([k]) => k.startsWith(prefix)).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => [k, clone(v)])); } };
}
// a whole site in memory: one directory and one separate store per organisation, as on Cloudflare
function site() {
  const dirMem = memStorage(); const mems = new Map(); const orgs = new Map();
  const orgOf = (id) => { if (!orgs.has(id)) { mems.set(id, memStorage()); orgs.set(id, createOrg(mems.get(id))); } return orgs.get(id); };
  return { S: createService(createDirectory(dirMem), orgOf), dirMem, mems, orgOf };
}
const T = (d) => Date.parse(d + 'T12:00:00Z');
const NOW = T('2026-11-10');
const ORG = { name: 'Oak Club', starts: '2026-11-01', ends: '2026-11-30', seats: 20 };
async function club(S, over = {}, group = { name: 'Saturday club' }) {
  const org = await S.createOrg({ ...ORG, ...over }, NOW); const g = await S.createGroup(org.id, group, NOW); return { org, g };
}

test('codes are well formed; an organisation needs a name, dates and seats', async () => {
  const { S } = site(); const { org, g } = await club(S);
  assert.match(org.leaderCode, /^LEAD-[A-Z]+-\d{4}$/); assert.match(g.code, /^[A-Z]+-\d{4}$/); assert.match(org.id, /^[a-f0-9]{12}$/);
  assert.equal(g.starts, '2026-11-01'); assert.equal(g.ends, '2026-11-30', 'a group takes the licence dates unless told otherwise');
  assert.equal(normalise(' otter 1234 '), 'OTTER-1234'); assert.equal(normaliseLeader('lead otter 1234'), 'LEAD-OTTER-1234');
  await assert.rejects(S.createOrg({ ...ORG, name: ' ' }), /name/);
  await assert.rejects(S.createOrg({ ...ORG, starts: '2026-12-01' }), /before/);
  await assert.rejects(S.createOrg({ ...ORG, seats: 0 }), /Seats/);
  await assert.rejects(S.createGroup(org.id, { name: 'Late', ends: '2026-12-05' }), /inside the licence/);
  await assert.rejects(S.createGroup(org.id, { name: '' }), /name/);
  const codes = new Set(); for (let i = 0; i < 60; i++) codes.add((await S.createGroup(org.id, { name: 'G' + i })).code);
  assert.equal(codes.size, 60, 'join codes are unique');
});

test('twenty joins on one code give twenty learners, badges and saves', async () => {
  const { S } = site(); const { g } = await club(S);
  const joins = await Promise.all(Array.from({ length: 20 }, () => S.join(g.code, '', '', NOW)));   // all at once, as a class does
  for (const j of joins) { assert.ok(j.ok); assert.match(j.badge, /^[A-Z][a-z]+ \d{2}$/); assert.equal(j.group.name, 'Saturday club'); assert.equal(j.ends, '2026-11-30'); assert.ok(parseToken(j.session)); assert.ok(!('secret' in j)); }
  assert.equal(new Set(joins.map((j) => j.learner)).size, 20); assert.equal(new Set(joins.map((j) => j.badge)).size, 20); assert.equal(new Set(joins.map((j) => j.session)).size, 20);
  for (const [i, j] of joins.entries()) assert.deepEqual(await S.putSave(j.session, { at: NOW + i, v: '1.0', data: { town: i } }, NOW), { ok: true, kept: true });
  for (const [i, j] of joins.entries()) assert.deepEqual((await S.getSave(j.session, NOW)).save, { at: NOW + i, v: '1.0', data: { town: i } });
  const me = await S.check(joins[3].session, NOW); assert.equal(me.badge, joins[3].badge); assert.equal(me.learner, joins[3].learner);
});

test('a 21st learner on a 20-seat organisation is refused; seats count across its groups', async () => {
  const { S } = site(); const { org, g } = await club(S); const g2 = await S.createGroup(org.id, { name: 'Sunday club' }, NOW);
  for (let i = 0; i < 12; i++) assert.ok((await S.join(g.code, '', '', NOW)).ok);
  const eight = []; for (let i = 0; i < 8; i++) eight.push(await S.join(g2.code, '', '', NOW));
  assert.equal((await S.join(g.code, '', '', NOW)).reason, 'full'); assert.equal((await S.join(g2.code, '', '', NOW)).reason, 'full');
  assert.ok((await S.join(g2.code, eight[0].badge, '', NOW)).ok, 'coming back with a badge needs no new seat');
  assert.equal((await S.join(g2.code, '', eight[1].session, NOW)).learner, eight[1].learner, 'a device with a good session keeps its learner');
  await S.updateOrg(org.id, { seats: 21 }); assert.ok((await S.join(g.code, '', '', NOW)).ok); assert.equal((await S.join(g.code, '', '', NOW)).reason, 'full');
  const [row] = await S.listOrgs(NOW); assert.equal(row.learners, 21); assert.equal(row.groups, 2); assert.equal(row.active, 21); assert.equal(row.state, 'active');
});

test('joining works only inside the dates (end date inclusive, UTC), and not when switched off', async () => {
  const { S } = site(); const { org, g } = await club(S, {}, { name: 'Week two', starts: '2026-11-08', ends: '2026-11-14' });
  assert.equal((await S.join(g.code, '', '', T('2026-11-07'))).reason, 'not_started');
  const a = await S.join(g.code.toLowerCase().replace('-', ' '), '', '', T('2026-11-08')); assert.ok(a.ok, 'case and spacing do not matter'); assert.equal(a.ends, '2026-11-14');
  assert.ok((await S.join(g.code, '', '', Date.parse('2026-11-14T23:59:00Z'))).ok, 'the last day counts');
  assert.equal((await S.join(g.code, '', '', Date.parse('2026-11-15T00:00:00Z'))).reason, 'expired');
  assert.equal((await S.check(a.session, T('2026-11-15'))).reason, 'expired');
  assert.equal(licenceState({ starts: '2026-01-01', ends: '2026-01-01', revoked: false }, Date.parse('2026-01-01T23:00:00Z')), 'active');
  assert.equal(groupState({ starts: '2026-01-01', ends: '2026-01-31' }, { starts: '2026-01-01', ends: '2026-02-28' }, T('2026-02-10')), 'expired', 'the licence end stops its groups');
  await S.updateGroup(org.id, g.id, { revoked: true }); assert.equal((await S.join(g.code, '', '', NOW)).reason, 'revoked'); assert.equal((await S.check(a.session, NOW)).reason, 'revoked');
  await S.updateGroup(org.id, g.id, { revoked: false }); assert.ok((await S.check(a.session, NOW)).ok);
  await S.updateOrg(org.id, { revoked: true }); assert.equal((await S.join(g.code, '', '', NOW)).reason, 'revoked'); assert.equal((await S.check(a.session, NOW)).reason, 'revoked');
  await S.updateOrg(org.id, { revoked: false, ends: '2026-12-31' }); await S.updateGroup(org.id, g.id, { ends: '2026-12-20' });
  assert.ok((await S.join(g.code, '', '', T('2026-12-15'))).ok, 'extended dates');
  assert.equal((await S.join('NOPE-0000', '', '', NOW)).reason, 'unknown');
});

test('a badge brings a learner back on another device; the earlier device is told it was replaced', async () => {
  const { S } = site(); const { g } = await club(S);
  const a = await S.join(g.code, '', '', NOW); await S.putSave(a.session, { at: NOW, v: '1', data: { stars: 3 } }, NOW);
  const other = await S.join(g.code, '', '', NOW);
  const b = await S.join(g.code, a.badge.toLowerCase().replace(' ', ''), '', NOW + 1000);
  assert.ok(b.ok); assert.equal(b.learner, a.learner); assert.equal(b.badge, a.badge); assert.notEqual(b.session, a.session);
  assert.equal((await S.check(a.session, NOW + 2000)).reason, 'replaced'); assert.equal((await S.getSave(a.session, NOW + 2000)).reason, 'replaced');
  assert.deepEqual((await S.getSave(b.session, NOW + 2000)).save.data, { stars: 3 }, 'the town comes back');
  assert.ok((await S.check(other.session, NOW + 2000)).ok, 'nobody else is disturbed');
  assert.equal((await S.join(g.code, 'Nobody 99', '', NOW)).reason, 'no_badge');
  await S.logout(b.session); assert.equal((await S.check(b.session, NOW + 3000)).reason, 'replaced');
  for (const bad of ['', 'x', 'a.b.c', `${'0'.repeat(12)}.${'0'.repeat(24)}.${'0'.repeat(48)}`]) assert.equal((await S.check(bad, NOW)).reason, 'none');
});

test('save: the newest wins, and only a JSON object is taken', async () => {
  const { S } = site(); const { g } = await club(S); const a = await S.join(g.code, '', '', NOW);
  assert.equal((await S.getSave(a.session, NOW)).save, null);
  assert.equal((await S.putSave(a.session, { at: 2000, v: '1.2', data: { n: 2 } }, NOW)).kept, true);
  assert.equal((await S.putSave(a.session, { at: 1000, v: '1.2', data: { n: 1 } }, NOW)).kept, false);
  assert.equal((await S.putSave(a.session, { at: 2000, v: '1.2', data: { n: 9 } }, NOW)).kept, false, 'the same time is not newer');
  assert.deepEqual((await S.getSave(a.session, NOW)).save, { at: 2000, v: '1.2', data: { n: 2 } });
  assert.equal((await S.putSave(a.session, { at: 3000, v: '1.3', data: { n: 3 } }, NOW)).kept, true); assert.equal((await S.getSave(a.session, NOW)).save.data.n, 3);
  assert.equal((await S.putSave(a.session, { at: NOW + 3 * 86400000, data: { n: 4 } }, NOW)).kept, false, 'a clock days ahead is not believed');
  for (const bad of [null, {}, { at: 'x', data: {} }, { at: 5000, data: [1] }, { at: 5000, data: 'text' }, { at: 5000 }, { at: 5000, data: {}, v: {} }]) assert.equal((await S.putSave(a.session, bad, NOW)).reason, 'bad');
  assert.equal((await S.putSave('nope', { at: 1, data: {} }, NOW)).reason, 'none');
});

test('status: unknown keys and wrong types are dropped, long text is cut', async () => {
  const long = 'x'.repeat(500);
  const s = cleanStatus({ module: 'ecotown' + long, band: 'junior', stage: long, missionsDone: 3.7, goalsMet: '5', state: 'playing', problem: 'carbon over 160 t\n' + long, stuck: 'yes', finished: false, at: 123, name: 'A Child', note: long, nested: { a: 1 } });
  assert.deepEqual(Object.keys(s).sort(), ['at', 'band', 'finished', 'missionsDone', 'module', 'problem', 'stage', 'state']);
  assert.equal(s.module.length, 20); assert.equal(s.stage.length, 80); assert.equal(s.problem.length, 80); assert.ok(!s.problem.includes('\n')); assert.equal(s.missionsDone, 3);
  for (const bad of [null, 'text', 5, [1]]) assert.equal(cleanStatus(bad), null);
  // through the service: what is stored is the cleaned status and nothing else
  const { S, mems } = site(); const { org, g } = await club(S); const a = await S.join(g.code, '', '', NOW);
  await S.check(a.session, NOW + 1000, { status: { stage: 'Homes', missionsDone: 2, secret: 'my name is Sam', state: 'playing' } });
  const rec = await mems.get(org.id).get('n:' + a.learner); assert.deepEqual(rec.status, { state: 'playing', stage: 'Homes', missionsDone: 2 }); assert.equal(rec.changed, NOW + 1000);
  await S.check(a.session, NOW + 61000, { status: { stage: 'Homes', missionsDone: 2, state: 'playing', at: 5 } });
  assert.equal((await mems.get(org.id).get('n:' + a.learner)).changed, NOW + 1000, 'the same status is not a change');
  await S.putSave(a.session, { at: 1, data: {}, status: { stage: 'Food', missionsDone: 3, state: 'playing' } }, NOW + 90000);
  assert.equal((await mems.get(org.id).get('n:' + a.learner)).changed, NOW + 90000);
  assert.ok(![...mems.get(org.id).m.values()].some((v) => JSON.stringify(v).includes('Sam')), 'no other text reaches the store');
});

test('the leader’s list: stage, minutes and plain flags', async () => {
  const MIN = 60000; const base = { badge: 'Heron 47', created: NOW, seen: NOW + 9 * MIN, changed: NOW };
  const row = (status, over = {}) => learnerRow({ ...base, status, ...over }, NOW + 9 * MIN + 1000);
  assert.deepEqual(row({ stage: 'Homes', missionsDone: 2, state: 'playing' }), { badge: 'Heron 47', module: '', stage: 'Homes', state: 'playing', missionsDone: 2, goalsMet: 0, minutes: 9, active: true, finished: false, limitMissed: false, problem: '', needsHelp: true });
  assert.equal(row({ state: 'playing' }, { changed: NOW + 6 * MIN }).needsHelp, false, 'changed three minutes ago');
  assert.equal(row({ state: 'playing', stuck: true }, { changed: NOW + 9 * MIN }).needsHelp, true, 'the game said stuck');
  assert.equal(row({ state: 'finished' }).needsHelp, false); assert.equal(row({ state: 'finished' }).finished, true); assert.equal(row({ finished: true, stuck: true }).needsHelp, false);
  assert.equal(row({ state: 'playing' }, { seen: NOW }).needsHelp, false, 'a child who has gone home is not flagged'); assert.equal(row({ state: 'playing' }, { seen: NOW }).active, false);
  assert.equal(row(null).needsHelp, false, 'no status yet'); assert.equal(row({ problem: 'carbon over 160 t' }).limitMissed, true);
  const { S } = site(); const { org, g } = await club(S); const L = await S.leaderLogin(org.leaderCode.toLowerCase(), NOW);
  const a = await S.join(g.code, '', '', NOW); await S.check(a.session, NOW, { status: { stage: 'Power', missionsDone: 4, problem: 'winter power', state: 'playing' } });
  const { learners } = await S.leaderLearners(L.session, g.id, NOW + 1000);
  assert.equal(learners.length, 1); assert.equal(learners[0].badge, a.badge); assert.equal(learners[0].stage, 'Power'); assert.equal(learners[0].limitMissed, true);
  assert.ok(!JSON.stringify(learners).includes(a.learner), 'the list never carries a learner id or session');
});

test('a leader reaches only their own organisation, whatever id they send', async () => {
  const { S } = site();
  const A = await club(S, { name: 'Club A' }); const B = await club(S, { name: 'Club B' }, { name: 'B group' });
  const b1 = await S.join(B.g.code, '', '', NOW); await S.join(A.g.code, '', '', NOW);
  const LA = await S.leaderLogin(A.org.leaderCode, NOW); assert.ok(LA.ok); assert.equal(LA.name, 'Club A');
  const mine = await S.leaderGroups(LA.session, NOW); assert.deepEqual(mine.groups.map((g) => g.name), ['Saturday club']); assert.equal(mine.org.name, 'Club A');
  assert.ok(!JSON.stringify(mine).includes(B.g.code)); assert.ok(!JSON.stringify(mine).includes(A.org.leaderCode), 'the leader code is not sent back');
  await assert.rejects(S.leaderLearners(LA.session, B.g.id, NOW), /No such group/, 'B’s group id means nothing inside A');
  for (const id of [B.org.id, b1.learner, B.g.code, '../' + B.g.id, 'g:' + B.g.id, '']) await assert.rejects(S.leaderLearners(LA.session, id, NOW), /No such group/);
  // A's session pointed at B's organisation is not a session there
  const forged = B.org.id + '.' + LA.session.split('.')[1];
  for (const f of [(t) => S.leaderGroups(t, NOW), (t) => S.leaderLearners(t, B.g.id, NOW), (t) => S.leaderAddGroup(t, { name: 'Mine now' }, NOW)]) assert.deepEqual(await f(forged), { ok: false, reason: 'none' });
  for (const t of ['', 'x.y', B.org.id, LA.session + 'ff']) assert.equal((await S.leaderGroups(t, NOW)).reason, 'none');
  assert.equal((await S.leaderLogin('LEAD-NOPE-0000', NOW)).reason, 'unknown'); assert.equal((await S.leaderLogin(A.g.code, NOW)).reason, 'unknown', 'a join code is not a leader code');
  // a leader adds a group in their own organisation only
  const added = await S.leaderAddGroup(LA.session, { name: 'Holiday camp', starts: '2026-11-20', ends: '2026-11-22' }, NOW);
  assert.ok(added.ok); assert.equal((await S.listGroups(A.org.id, NOW)).length, 2); assert.equal((await S.listGroups(B.org.id, NOW)).length, 1);
  await assert.rejects(S.leaderAddGroup(LA.session, { name: 'Too late', ends: '2027-01-01' }, NOW), /inside the licence/);
  // a learner of A cannot read B either: A's session with B's organisation id is nobody
  const a2 = await S.join(A.g.code, '', '', NOW); const [, lid, sec] = a2.session.split('.');
  assert.equal((await S.getSave(`${B.org.id}.${lid}.${sec}`, NOW)).reason, 'none'); assert.equal((await S.getSave(`${B.org.id}.${b1.learner}.${sec}`, NOW)).reason, 'replaced');
  // logging out, the 12-hour limit and switching off all end a leader's session
  assert.equal((await S.leaderGroups(LA.session, NOW + 13 * 3600e3)).reason, 'none');
  const LB = await S.leaderLogin(B.org.leaderCode, NOW); await S.leaderLogout(LB.session); assert.equal((await S.leaderGroups(LB.session, NOW)).reason, 'none');
  await S.updateOrg(A.org.id, { revoked: true }); assert.equal((await S.leaderGroups(LA.session, NOW)).reason, 'revoked'); assert.equal((await S.leaderLogin(A.org.leaderCode, NOW)).reason, 'revoked');
});

test('organisations are stored apart: nothing of one is in another’s store or in the directory', async () => {
  const { S, mems, dirMem } = site(); const A = await club(S, { name: 'Club A' }); const B = await club(S, { name: 'Club B' });
  const a = await S.join(A.g.code, '', '', NOW); await S.putSave(a.session, { at: 1, data: { town: 'A' } }, NOW); await S.join(B.g.code, '', '', NOW);
  const dump = (m) => JSON.stringify([...m.m]);
  assert.ok(!dump(mems.get(B.org.id)).includes(a.learner)); assert.ok(!dump(mems.get(B.org.id)).includes(A.g.code)); assert.ok(dump(mems.get(A.org.id)).includes(a.learner));
  assert.ok(!dump(dirMem).includes(a.learner), 'the directory holds codes, not learners'); assert.ok(!dump(dirMem).includes('town'));
});

test('deleting a group removes its learners and frees its code; deleting an organisation removes everything', async () => {
  const { S, mems, dirMem } = site(); const { org, g } = await club(S); const g2 = await S.createGroup(org.id, { name: 'Sunday club' }, NOW);
  const a = await S.join(g.code, '', '', NOW); await S.putSave(a.session, { at: 1, data: { n: 1 } }, NOW); await S.join(g.code, '', '', NOW);
  const keep = await S.join(g2.code, '', '', NOW); const L = await S.leaderLogin(org.leaderCode, NOW);
  const rows = await S.listGroups(org.id, NOW); assert.deepEqual(rows.map((r) => [r.name, r.learners, r.active]), [['Saturday club', 2, 2], ['Sunday club', 1, 1]]);
  await S.deleteGroup(org.id, g.id);
  const mem = mems.get(org.id); assert.deepEqual([...mem.m.keys()].filter((k) => k.includes(g.id)), [], 'no learner, save, badge or count is left');
  assert.equal((await S.check(a.session, NOW)).reason, 'none'); assert.equal((await S.join(g.code, '', '', NOW)).reason, 'unknown'); assert.equal((await S.join(g.code, a.badge, '', NOW)).reason, 'unknown');
  assert.ok((await S.check(keep.session, NOW)).ok); assert.equal((await S.listOrgs(NOW))[0].learners, 1);
  await assert.rejects(S.deleteGroup(org.id, g.id), /No such group/);
  await S.deleteOrg(org.id);
  assert.equal(mem.m.size, 0); assert.equal(dirMem.m.size, 0, 'the directory forgets the organisation and its codes');
  assert.equal((await S.check(keep.session, NOW)).reason, 'none'); assert.equal((await S.join(g2.code, '', '', NOW)).reason, 'unknown');
  assert.equal((await S.leaderGroups(L.session, NOW)).reason, 'none'); assert.equal((await S.leaderLogin(org.leaderCode, NOW)).reason, 'unknown'); assert.deepEqual(await S.listOrgs(NOW), []);
  await assert.rejects(S.updateOrg('not-an-id', {}), /No such organisation/);
});

test('retention: learners and saves go 30 days after the group’s end date', async () => {
  assert.equal(KEEP_DAYS, 30);
  assert.equal(purgeDue('2026-11-30', Date.parse('2026-12-30T23:59:59Z')), false, 'day 30 after the end is still kept');
  assert.equal(purgeDue('2026-11-30', Date.parse('2026-12-31T00:00:00Z')), true); assert.equal(purgeDue('2026-11-30', T('2026-11-30')), false);
  const { S, mems, orgOf } = site(); const { org, g } = await club(S, {}, { name: 'Week two', starts: '2026-11-08', ends: '2026-11-14' });
  const g2 = await S.createGroup(org.id, { name: 'Whole month' }, NOW);
  const a = await S.join(g.code, '', '', NOW); await S.putSave(a.session, { at: 1, data: { n: 1 } }, NOW); const b = await S.join(g2.code, '', '', NOW); await S.putSave(b.session, { at: 1, data: { n: 2 } }, NOW);
  const O = orgOf(org.id), mem = mems.get(org.id);
  assert.equal(await O.purge(T('2026-12-14')), 0, '30 days after 14 Nov is not yet over'); assert.ok(mem.m.has('n:' + a.learner));
  assert.equal(await O.purge(T('2026-12-15')), 1); assert.ok(!mem.m.has('n:' + a.learner)); assert.ok(!mem.m.has('s:' + a.learner)); assert.ok(mem.m.has('s:' + b.learner), 'the other group is not due');
  assert.equal((await S.listGroups(org.id, T('2026-12-15'))).find((r) => r.id === g.id).learners, 0); assert.ok(mem.m.has('g:' + g.id), 'the group itself stays');
  assert.equal(await O.purge(T('2026-12-31')), 1); assert.deepEqual([...mem.m.keys()].filter((k) => /^[nsbc]:/.test(k)), []);
  assert.equal(await O.purge(T('2027-01-05')), 0);
  // a Durable Object does it by itself before an organisation's next request
  const st = memStorage(); const D = createCodeStore(st);
  await D.call('org', 'init', { id: 'a'.repeat(12), name: 'Old', starts: '2020-01-01', ends: '2020-01-31', seats: 5, revoked: false, leaderCode: 'LEAD-OAK-1000', created: 0 });
  await st.put('g:' + '1'.repeat(8), { id: '1'.repeat(8), code: 'OAK-1000', name: 'G', starts: '2020-01-01', ends: '2020-01-31', revoked: false, created: 0 });
  await st.put('n:' + '1'.repeat(24), { id: '1'.repeat(24), group: '1'.repeat(8), badge: 'Oak 10', seen: 0, created: 0 }); await st.put('c:' + '1'.repeat(8), 1); await st.put('s:' + '1'.repeat(24), { at: 1, data: {} });
  await D.purge(Date.now()); assert.ok(!st.m.has('n:' + '1'.repeat(24))); assert.ok(!st.m.has('s:' + '1'.repeat(24)));
  await assert.rejects(D.call('org', 'constructor'), /bad method/); await assert.rejects(D.call('dir', 'join'), /bad method/);
});

test('fifty wrong codes never block a right one', async () => {
  const { S } = site(); const { org, g } = await club(S);
  for (let i = 0; i < 50; i++) { assert.equal((await S.join('NOPE-0000', '', '', NOW)).reason, 'unknown'); assert.equal((await S.leaderLogin('LEAD-NOPE-0000', NOW)).reason, 'unknown'); assert.equal((await S.join(g.code, 'Nobody 99', '', NOW)).reason, 'no_badge'); }
  assert.ok((await S.join(g.code, '', '', NOW)).ok); assert.ok((await S.leaderLogin(org.leaderCode, NOW)).ok);
});

test('the admin can give a group a chosen join code (codes a club already has); a leader cannot', async () => {
  const { S } = site(); const org = await S.createOrg(ORG, NOW);
  const g = await S.createGroup(org.id, { name: 'Group 1', code: 'kestrel 5895' }, NOW);
  assert.equal(g.code, 'KESTREL-5895');
  await assert.rejects(S.createGroup(org.id, { name: 'Group 2', code: 'KESTREL-5895' }, NOW), /already in use/);
  await assert.rejects(S.createGroup(org.id, { name: 'Group 3', code: 'nope' }, NOW), /WORD-1234/);
  const r = await S.join('KESTREL-5895', '', null, NOW); assert.ok(r.ok, 'a child can join with the chosen code');
  const lead = await S.leaderLogin(org.leaderCode, NOW);
  const lg = await S.leaderAddGroup(lead.session, { name: 'Leader group', code: 'ISLAND-4484' }, NOW);
  assert.notEqual(lg.group.code, 'ISLAND-4484', 'leaders always get a made-up code');
});
