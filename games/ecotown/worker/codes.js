// Organisation → group → learner logic, independent of Cloudflare so it can be unit-tested in Node.
// storage: { get(key), put(key, value), delete(key), list({ prefix }) -> Map } (Durable Object storage API).
// Two kinds of store use this file:
//  - the directory (one for the whole site): which organisation a join code or a leader code belongs to.
//    Keys: o:<orgId> -> { id, name, leaderCode, created }, j:<JOINCODE> -> { org, group }, l:<LEADERCODE> -> { org },
//    t:<email> -> { org } (a club leader who signed in by email code to test the game; their own small test organisation).
//  - one store per organisation: its record, groups, learners and their progress. Nothing of another organisation is in it.
//    Keys: org -> organisation, g:<groupId> -> group, c:<groupId> -> number of learners in the group,
//          n:<learnerId> -> learner (the id starts with the group id), b:<groupId>:<BADGE> -> learnerId,
//          s:<learnerId> -> save { at, v, data }, k:<secret> -> leader session { created }.
// No name, email or anything a child typed is stored: a learner is a random id and a made-up badge. The only email
// addresses kept are those of adult testers who signed in by email code (directory key t:, and their organisation's name).

export const WORDS = ('OTTER MAPLE RIVER CEDAR FERN MEADOW HERON ACORN BADGER BEACON BIRCH BRAMBLE BREEZE BROOK CANYON CLOVER COMET CORAL CRANE '
  + 'DAISY DELTA DUNE EAGLE EMBER FALCON FINCH FJORD FLINT FOREST FOX GARDEN GLACIER GROVE HARBOR HAZEL HEDGE HILL HONEY IRIS ISLAND IVY '
  + 'JADE KESTREL KITE LAGOON LARCH LARK LAUREL LEAF LILAC LILY LINDEN LOTUS LYNX MAGPIE MARSH MESA MINNOW MOSS NECTAR NEWT OAK OASIS '
  + 'OCEAN ORCHID OSPREY OWL PEBBLE PELICAN PINE PLUM POND POPPY PRAIRIE PUFFIN QUAIL RAVEN REED ROBIN ROWAN SAGE SALMON SPARROW SPRUCE '
  + 'STREAM SUNBEAM SWALLOW SWAN TERN THISTLE THRUSH TIDE TULIP VALLEY VIOLET WALNUT WAVE WHEAT WILLOW WREN ZEPHYR BEAVER BISON CARDINAL '
  + 'CHERRY COBALT CRICKET DOLPHIN DRAGONFLY ELK GECKO HEATHER JUNIPER KOALA LEMUR MANGO MARIGOLD MOOSE NUTMEG ORCA PANDA PEACH PENGUIN '
  + 'PEONY QUARTZ RAIN SEAL SPROUT STARLING SUMMIT SUNFLOWER TIGER TOPAZ TORTOISE TUNDRA WALRUS WHALE YARROW ZEBRA').split(' ');
const DAY = 86400000;
export const ACTIVE_FOR = 3 * 60 * 1000;      // a learner seen this recently counts as "active now"
export const STUCK_AFTER = 5 * 60 * 1000;     // no change for this long while playing: "needs help"
export const KEEP_DAYS = 30;                  // learner records are deleted this many days after the group's end date
export const SAVE_MAX = 64 * 1024;            // largest save body accepted, in bytes
export const LEADER_FOR = 12 * 3600 * 1000;   // a leader stays logged in this long
export const TESTER = { days: 30, seats: 10 }; // a tester's own test organisation: how long it lasts and how many learners it holds
const MAX_GROUPS = 200;

// "otter 1234" -> "OTTER-1234"; also used for badges ("heron 47" -> "HERON-47"). A chosen code may also start with its number ("30 rangers" -> "30-RANGERS").
export const normalise = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^([A-Z]+)(\d+)$/, '$1-$2').replace(/^(\d+)([A-Z]+)$/, '$1-$2');
// "lead otter 1234" -> "LEAD-OTTER-1234"
export const normaliseLeader = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^LEAD([A-Z]+)(\d+)$/, 'LEAD-$1-$2');
const dayStart = (d) => Date.parse(d + 'T00:00:00Z');
const randInt = (n) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
const randId = (n = 24) => { const b = new Uint8Array(n); crypto.getRandomValues(b); return [...b].map((x) => x.toString(16).padStart(2, '0')).join(''); };
const isDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(dayStart(d));
const title = (w) => w[0] + w.slice(1).toLowerCase();
const earlier = (a, b) => (a < b ? a : b);   // dates are YYYY-MM-DD, so text order is date order
const fail = (reason) => ({ ok: false, reason });
const ORG_ID = /^[a-f0-9]{12}$/; const GROUP_ID = /^[a-f0-9]{8}$/;

// whether an organisation or a group is live at time `now`: starts at 00:00 UTC on `starts`, ends at the end of `ends` (UTC)
export function licenceState(r, now) {
  if (!r || r.revoked) return 'revoked';
  if (now < dayStart(r.starts)) return 'not_started';
  if (now >= dayStart(r.ends) + DAY) return 'expired';
  return 'active';
}
// a group is live only while both it and its organisation are
export function groupState(org, group, now) {
  if (!org || !group) return 'unknown';
  const a = licenceState(org, now), b = licenceState(group, now);
  for (const s of ['revoked', 'expired', 'not_started']) if (a === s || b === s) return s;
  return 'active';
}
// retention rule: learner records go KEEP_DAYS whole days after the end date (`ends` is the last day of use)
export const purgeDue = (ends, now) => now >= dayStart(ends) + DAY + KEEP_DAYS * DAY;

// The only status the game may send. Unknown keys are dropped, wrong types are dropped, long text is cut.
const STATUS_TEXT = { module: 20, band: 20, state: 20, stage: 80, problem: 80 };
export function cleanStatus(s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return null;
  const out = {};
  // eslint-disable-next-line no-control-regex
  for (const [k, max] of Object.entries(STATUS_TEXT)) if (typeof s[k] === 'string') out[k] = s[k].replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, max);
  for (const k of ['missionsDone', 'goalsMet']) if (Number.isFinite(s[k])) out[k] = Math.max(0, Math.min(999, Math.floor(s[k])));
  for (const k of ['stuck', 'finished']) if (typeof s[k] === 'boolean') out[k] = s[k];
  if (Number.isFinite(s.at) && s.at > 0) out.at = Math.floor(s.at);
  return out;
}
const sameStatus = (a, b) => JSON.stringify({ ...a, at: 0 }) === JSON.stringify({ ...b, at: 0 });

// one line of the leader's list. Never carries the learner id or the session.
export function learnerRow(l, now) {
  const s = l.status || {}; const finished = !!s.finished || s.state === 'finished';
  const active = now - l.seen < ACTIVE_FOR; const idle = Math.max(0, now - (l.changed || l.created));
  return { badge: l.badge, module: s.module || '', stage: s.stage || '', state: s.state || '', missionsDone: s.missionsDone || 0, goalsMet: s.goalsMet || 0,
    minutes: Math.floor(idle / 60000), active, finished, limitMissed: !!s.problem, problem: s.problem || '',
    needsHelp: !finished && (!!s.stuck || (!!l.status && active && idle >= STUCK_AFTER)) };
}

// checks and tidies what the admin typed for an organisation; `base` is the record being edited
export function orgFields(input, base = {}) {
  const o = { ...base };
  if (input.name !== undefined) o.name = String(input.name).trim().slice(0, 120);
  if (input.note !== undefined) o.note = String(input.note).slice(0, 300);
  if (input.starts !== undefined) o.starts = input.starts;
  if (input.ends !== undefined) o.ends = input.ends;
  if (input.seats !== undefined) o.seats = Math.floor(Number(input.seats));
  if (input.revoked !== undefined) o.revoked = !!input.revoked;
  if (!o.name) throw new Error('Organisation name is required');
  if (!isDate(o.starts) || !isDate(o.ends)) throw new Error('Dates must be YYYY-MM-DD');
  if (dayStart(o.ends) < dayStart(o.starts)) throw new Error('End date is before start date');
  if (!(o.seats >= 1 && o.seats <= 100000)) throw new Error('Seats must be 1–100000');
  return { note: '', revoked: false, ...o };
}
function groupFields(org, input, base = {}) {
  const g = { ...base };
  if (input.name !== undefined) g.name = String(input.name).trim().slice(0, 60);
  if (input.starts) g.starts = input.starts; if (input.ends) g.ends = input.ends;
  if (input.revoked !== undefined) g.revoked = !!input.revoked;
  // the most learners who may play on this code at the same time (0 or empty: no limit; the organisation's seats still apply)
  if (input.atOnce !== undefined) { const n = input.atOnce === '' || input.atOnce === null ? 0 : Math.floor(Number(input.atOnce)); if (!(n >= 0 && n <= 10000)) throw new Error('At the same time must be 0–10000 (0 means no limit)'); g.atOnce = n; }
  g.starts = g.starts || org.starts; g.ends = g.ends || org.ends;
  if (!g.name) throw new Error('Group name is required');
  if (!isDate(g.starts) || !isDate(g.ends)) throw new Error('Dates must be YYYY-MM-DD');
  if (dayStart(g.ends) < dayStart(g.starts)) throw new Error('End date is before start date');
  if (g.starts < org.starts || g.ends > org.ends) throw new Error(`Group dates must be inside the licence dates (${org.starts} to ${org.ends})`);
  return { revoked: false, atOnce: 0, ...g };
}

// ---------------- the directory: codes -> organisation
export function createDirectory(storage) {
  const fresh = async (prefix, make) => { for (let i = 0; i < 50; i++) { const c = make(); if (!(await storage.get(prefix + c))) return c; } throw new Error('could not generate a unique code'); };
  const word = () => WORDS[randInt(WORDS.length)]; const digits = () => String(1000 + randInt(9000));
  return {
    // a new organisation gets its id and its leader code here; its record lives in its own store
    async addOrg(name, now = Date.now()) {
      const id = await fresh('o:', () => randId(6)); const leaderCode = await fresh('l:', () => `LEAD-${word()}-${digits()}`);
      await storage.put('o:' + id, { id, name: String(name).slice(0, 120), leaderCode, created: now }); await storage.put('l:' + leaderCode, { org: id });
      return { id, leaderCode };
    },
    async renameOrg(id, name) { const o = await storage.get('o:' + id); if (o) { o.name = String(name).slice(0, 120); await storage.put('o:' + id, o); } },
    // forgets an organisation and frees every code it held
    async removeOrg(id) {
      for (const p of ['j:', 'l:', 't:']) for (const [k, v] of await storage.list({ prefix: p })) if (v.org === id) await storage.delete(k);
      await storage.delete('o:' + id);
    },
    // a tester who signed in by email code: their organisation, made here the first time (fresh: the caller still sets it up)
    async tester(email, now = Date.now()) {
      const t = await storage.get('t:' + email); const o = t && (await storage.get('o:' + t.org));
      if (o) return { id: o.id, leaderCode: o.leaderCode, fresh: false };
      const { id, leaderCode } = await this.addOrg('Tester ' + email, now); await storage.put('t:' + email, { org: id });
      return { id, leaderCode, fresh: true };
    },
    async listOrgs() { return [...(await storage.list({ prefix: 'o:' })).values()].sort((a, b) => b.created - a.created); },
    // a new group gets its id and its join code here, so a join code is unique across every organisation
    // admin only: a chosen join code (WORD-1234), e.g. codes a club already handed out; it must be free
    async reserveJoin(org, want) {
      if (!(await storage.get('o:' + org))) throw new Error('No such organisation');
      let code;
      if (want) { code = normalise(want); if (!/^[A-Z]{3,12}-\d{4}$/.test(code) && !/^\d{1,4}-[A-Z]{3,12}$/.test(code)) throw new Error('A join code must look like WORD-1234 or 40-WORD'); if (await storage.get('j:' + code)) throw new Error('That join code is already in use'); }
      else code = await fresh('j:', () => `${word()}-${digits()}`);
      const group = randId(4);
      await storage.put('j:' + code, { org, group }); return { code, group };
    },
    async release(code) { await storage.delete('j:' + code); },
    // wrong guesses are not counted or limited: a whole class shares one internet address
    async lookup(raw) { const code = normalise(raw); return (code && (await storage.get('j:' + code))) || null; },
    async leader(raw) { const code = normaliseLeader(raw); return (code && (await storage.get('l:' + code))) || null; },
  };
}

// ---------------- one organisation
export function createOrg(storage) {
  const count = async (gid) => (await storage.get('c:' + gid)) || 0;
  const total = async () => [...(await storage.list({ prefix: 'c:' })).values()].reduce((a, b) => a + b, 0);
  const learnersOf = async (gid) => [...(await storage.list({ prefix: 'n:' + gid })).values()];
  const groupsAll = async () => [...(await storage.list({ prefix: 'g:' })).values()];
  async function dropLearners(gid) {
    let n = 0;
    for (const l of await learnersOf(gid)) { await storage.delete('n:' + l.id); await storage.delete('s:' + l.id); n++; }
    for (const k of (await storage.list({ prefix: `b:${gid}:` })).keys()) await storage.delete(k);
    await storage.delete('c:' + gid); return n;
  }
  const isActive = (l, now) => !!l.secret && now - l.seen < ACTIVE_FOR;
  // whether a group with a limit "at the same time" already has that many other learners playing
  const crowded = async (g, now, except = '') => !!g.atOnce && (await learnersOf(g.id)).filter((l) => l.id !== except && isActive(l, now)).length >= g.atOnce;
  // the learner behind a session, or the reason there is none
  async function session(id, secret, now) {
    const org = await storage.get('org'); const l = org && /^[a-f0-9]{24}$/.test(id || '') && (await storage.get('n:' + id)); if (!l) return fail('none');
    const g = await storage.get('g:' + l.group); const st = groupState(org, g, now);
    if (st !== 'active') return fail(st === 'revoked' ? 'revoked' : st === 'unknown' ? 'none' : 'expired');
    if (!l.secret || l.secret !== secret) return fail('replaced');
    // coming back after a break (not seen for a while) needs a free place, like joining; a learner who is playing keeps theirs
    if (!isActive(l, now) && (await crowded(g, now, l.id))) return fail('busy');
    return { ok: true, org, g, l };
  }
  const who = ({ org, g, l }) => ({ ok: true, learner: l.id, badge: l.badge, group: { name: g.name }, ends: earlier(org.ends, g.ends) });
  const setStatus = (l, status, now) => { const s = cleanStatus(status); if (!s) return; if (!sameStatus(l.status || {}, s)) l.changed = now; l.status = s; };

  const api = {
    // ---------------- admin
    async init(record) { if (await storage.get('org')) throw new Error('Organisation already exists'); await storage.put('org', record); return record; },
    async summary(now = Date.now()) {
      const org = await storage.get('org'); if (!org) return null;
      const all = [...(await storage.list({ prefix: 'n:' })).values()];
      return { ...org, state: licenceState(org, now), groups: (await groupsAll()).length, learners: all.length, active: all.filter((l) => l.secret && now - l.seen < ACTIVE_FOR).length };
    },
    async update(patch) {
      const org = await storage.get('org'); if (!org) throw new Error('No such organisation');
      const next = orgFields(patch, org); await storage.put('org', next); return next;
    },
    // removes everything this organisation holds
    async destroy() { const codes = (await groupsAll()).map((g) => g.code); for (const k of (await storage.list({ prefix: '' })).keys()) await storage.delete(k); return codes; },
    async addGroup({ id, code, name, starts, ends, atOnce }, now = Date.now()) {
      const org = await storage.get('org'); if (!org) throw new Error('No such organisation');
      if (org.revoked) throw new Error('This organisation is switched off');
      if (!GROUP_ID.test(id || '') || !code) throw new Error('Bad group');
      if ((await groupsAll()).length >= MAX_GROUPS) throw new Error(`An organisation can have ${MAX_GROUPS} groups at most`);
      const g = groupFields(org, { name, starts, ends, atOnce }, { id, code, created: now }); await storage.put('g:' + id, g); return g;
    },
    async updateGroup(gid, patch) {
      const org = await storage.get('org'); const g = org && (await storage.get('g:' + gid)); if (!g) throw new Error('No such group');
      const next = groupFields(org, patch, g); await storage.put('g:' + gid, next); return next;
    },
    // deletes a group and its learners at once; returns the join code so the directory can free it
    async deleteGroup(gid) {
      const g = await storage.get('g:' + gid); if (!g) throw new Error('No such group');
      await dropLearners(gid); await storage.delete('g:' + gid); return { code: g.code };
    },
    async groups(now = Date.now()) {
      const org = await storage.get('org'); if (!org) return [];
      const out = [];
      for (const g of (await groupsAll()).sort((a, b) => a.created - b.created || a.name.localeCompare(b.name))) {
        const ls = await learnersOf(g.id);
        out.push({ ...g, state: groupState(org, g, now), learners: ls.length, active: ls.filter((l) => l.secret && now - l.seen < ACTIVE_FOR).length });
      }
      return out;
    },
    async learners(gid, now = Date.now()) {
      if (!GROUP_ID.test(gid || '') || !(await storage.get('g:' + gid))) throw new Error('No such group');
      return (await learnersOf(gid)).map((l) => learnerRow(l, now)).sort((a, b) => a.badge.localeCompare(b.badge, 'en', { numeric: true }));
    },
    // retention: deletes the learners of every group whose end date is KEEP_DAYS behind us, and old leader sessions
    async purge(now = Date.now()) {
      const org = await storage.get('org'); if (!org) return 0;
      let n = 0;
      for (const g of await groupsAll()) if (purgeDue(earlier(org.ends, g.ends), now) && (await count(g.id))) n += await dropLearners(g.id);
      for (const [k, v] of await storage.list({ prefix: 'k:' })) if (now - v.created > LEADER_FOR) await storage.delete(k);
      return n;
    },

    // ---------------- learners
    // Without a badge: a new learner, if the organisation has a free seat. With a badge: that learner, on this device
    // (the earlier device is then told it was replaced). Returns { ok, learner, secret, badge, group, ends } or { ok:false, reason }.
    async join(gid, rawBadge, now = Date.now()) {
      const org = await storage.get('org'); const g = org && GROUP_ID.test(gid || '') && (await storage.get('g:' + gid)); if (!g) return fail('unknown');
      const st = groupState(org, g, now); if (st !== 'active') return fail(st);
      let l;
      if (rawBadge) {
        const id = await storage.get(`b:${gid}:${normalise(rawBadge)}`); l = id && (await storage.get('n:' + id)); if (!l) return fail('no_badge');
        if (!isActive(l, now) && (await crowded(g, now, l.id))) return fail('busy');
      } else {
        if ((await total()) >= org.seats) return fail('full');
        if (await crowded(g, now)) return fail('busy');
        let key = '', badge = '';
        for (let i = 0; i < 200 && !badge; i++) { const w = WORDS[randInt(WORDS.length)], n = 10 + randInt(90); key = `b:${gid}:${w}-${n}`; if (!(await storage.get(key))) badge = `${title(w)} ${n}`; }
        if (!badge) return fail('full');
        l = { id: gid + randId(8), group: gid, badge, secret: null, created: now, seen: now, changed: now, status: null, joins: 0 };
        await storage.put(key, l.id); await storage.put('c:' + gid, (await count(gid)) + 1);
      }
      l.secret = randId(); l.seen = now; l.joins++;
      await storage.put('n:' + l.id, l);
      return { ...who({ org, g, l }), secret: l.secret };
    },
    // checks a session: { ok, learner, badge, group, ends } or { ok:false, reason: 'none'|'replaced'|'expired'|'revoked' }
    async check(id, secret, now = Date.now(), { touch = true, status } = {}) {
      const s = await session(id, secret, now); if (!s.ok) return s;
      const { l } = s; let dirty = false;
      if (status !== undefined) { setStatus(l, status, now); dirty = true; }
      if (touch && now - l.seen > 30000) { l.seen = now; dirty = true; }
      if (dirty) await storage.put('n:' + l.id, l);
      return who(s);
    },
    async getSave(id, secret, now = Date.now()) {
      const s = await session(id, secret, now); if (!s.ok) return s;
      return { ok: true, save: (await storage.get('s:' + id)) || null };
    },
    // newest wins: the save is kept only if its time is later than the one held. A clock more than a day fast is not believed.
    async putSave(id, secret, body, now = Date.now()) {
      const s = await session(id, secret, now); if (!s.ok) return s;
      const { at, v, data, status } = body || {};
      if (!Number.isFinite(at) || at <= 0 || !data || typeof data !== 'object' || Array.isArray(data)) return fail('bad');
      if (v !== undefined && typeof v !== 'string' && !Number.isFinite(v)) return fail('bad');
      const held = await storage.get('s:' + id); const kept = at <= now + DAY && (!held || at > held.at);
      if (kept) await storage.put('s:' + id, { at, v: typeof v === 'string' ? v.slice(0, 40) : v ?? null, data });
      const { l } = s; if (status !== undefined) setStatus(l, status, now); l.seen = now; await storage.put('n:' + l.id, l);
      return { ok: true, kept };
    },
    async logout(id, secret) { const l = await storage.get('n:' + id); if (l && l.secret && l.secret === secret) { l.secret = null; await storage.put('n:' + id, l); } },

    // ---------------- leaders
    async leaderLogin(rawCode, now = Date.now()) {
      const org = await storage.get('org'); if (!org || org.leaderCode !== normaliseLeader(rawCode)) return fail('unknown');
      if (org.revoked) return fail('revoked');
      const secret = randId(); await storage.put('k:' + secret, { created: now }); return { ok: true, org: org.id, secret, name: org.name };
    },
    async leaderCheck(secret, now = Date.now()) {
      const org = await storage.get('org'); const k = org && /^[a-f0-9]{48}$/.test(secret || '') && (await storage.get('k:' + secret));
      if (!k || now - k.created > LEADER_FOR) return fail('none');
      if (org.revoked) return fail('revoked');
      return { ok: true, org: { id: org.id, name: org.name, starts: org.starts, ends: org.ends, seats: org.seats, state: licenceState(org, now) } };
    },
    async leaderLogout(secret) { await storage.delete('k:' + secret); },
  };
  // One call at a time, in order. A Durable Object does this already; the queue makes it true in tests as well.
  let q = Promise.resolve();
  for (const m of Object.keys(api)) { const fn = api[m]; api[m] = (...a) => { const r = q.then(() => fn(...a)); q = r.catch(() => {}); return r; }; }
  return api;
}

// ---------------- what one Durable Object answers: call(kind, method, ...args), kind 'dir' or 'org'
const DIR_METHODS = ['addOrg', 'renameOrg', 'removeOrg', 'listOrgs', 'reserveJoin', 'release', 'lookup', 'leader', 'tester'];
const ORG_METHODS = ['init', 'summary', 'update', 'destroy', 'addGroup', 'updateGroup', 'deleteGroup', 'groups', 'learners', 'purge', 'join', 'check', 'getSave', 'putSave', 'logout', 'leaderLogin', 'leaderCheck', 'leaderLogout'];
export function createCodeStore(storage) {
  const dir = createDirectory(storage), org = createOrg(storage); let purged = 0;
  return {
    async call(kind, method, ...args) {
      if (kind === 'dir' && DIR_METHODS.includes(method)) return dir[method](...args);
      if (kind !== 'org' || !ORG_METHODS.includes(method)) throw new Error('bad method');
      // retention, done lazily: at most once an hour, before the organisation's next request
      const now = Date.now(); if (now - purged > 3600e3) { purged = now; await org.purge(now); }
      return org[method](...args);
    },
    purge: (now) => org.purge(now),
  };
}

// ---------------- the whole service, over a directory and a way to reach each organisation.
// `dir` and `orgOf(id)` give objects with the methods above (real stores in tests, Durable Object stubs in the Worker).
export const parseToken = (t) => { const m = /^([a-f0-9]{12})\.([a-f0-9]{24})\.([a-f0-9]{48})$/.exec(String(t || '')); return m ? { org: m[1], learner: m[2], secret: m[3] } : null; };
export const parseLeader = (t) => { const m = /^([a-f0-9]{12})\.([a-f0-9]{48})$/.exec(String(t || '')); return m ? { org: m[1], secret: m[2] } : null; };

export function createService(dir, orgOf) {
  const learner = async (token, fn) => { const t = parseToken(token); return t ? fn(orgOf(t.org), t) : fail('none'); };
  // A leader's requests go only to the organisation named in their own checked cookie. No id from the request picks the store.
  const leader = async (token, now, fn) => {
    const t = parseLeader(token); if (!t) return fail('none');
    const O = orgOf(t.org); const r = await O.leaderCheck(t.secret, now); return r.ok ? fn(O, r.org) : r;
  };
  const admin = (id) => { if (!ORG_ID.test(id || '')) throw new Error('No such organisation'); return orgOf(id); };
  // only the admin passes `atOnce` (a leader cannot set or raise a group's limit)
  async function addGroup(O, orgId, input, now, chosen, atOnce) {
    const { code, group } = await dir.reserveJoin(orgId, chosen);
    try { return await O.addGroup({ id: group, code, name: input?.name, starts: input?.starts, ends: input?.ends, atOnce }, now); } catch (e) { await dir.release(code); throw e; }
  }
  return {
    // ---------------- learners
    async join(rawCode, badge, token, now = Date.now()) {
      const hit = await dir.lookup(rawCode); if (!hit) return fail('unknown');
      const O = orgOf(hit.org);
      // a device that already holds a good session in this group keeps its learner: typing the code again must not use a second seat
      const t = !badge && parseToken(token);
      if (t && t.org === hit.org && t.learner.startsWith(hit.group)) { const r = await O.check(t.learner, t.secret, now); if (r.ok) return { ...r, session: token }; }
      const r = await O.join(hit.group, badge ? String(badge).slice(0, 40) : '', now); if (!r.ok) return r;
      const { secret, ...rest } = r; return { ...rest, session: `${hit.org}.${r.learner}.${secret}` };
    },
    check: (token, now = Date.now(), opts = {}) => learner(token, (O, t) => O.check(t.learner, t.secret, now, opts)),
    getSave: (token, now = Date.now()) => learner(token, (O, t) => O.getSave(t.learner, t.secret, now)),
    putSave: (token, body, now = Date.now()) => learner(token, (O, t) => O.putSave(t.learner, t.secret, body, now)),
    async logout(token) { const t = parseToken(token); if (t) await orgOf(t.org).logout(t.learner, t.secret); },

    // ---------------- leaders
    async leaderLogin(rawCode, now = Date.now()) {
      const hit = await dir.leader(rawCode); if (!hit) return fail('unknown');
      const r = await orgOf(hit.org).leaderLogin(rawCode, now); if (!r.ok) return r;
      return { ok: true, name: r.name, session: `${r.org}.${r.secret}` };
    },
    leaderGroups: (token, now = Date.now()) => leader(token, now, async (O, org) => ({ ok: true, org: { name: org.name, starts: org.starts, ends: org.ends, seats: org.seats, state: org.state }, groups: await O.groups(now) })),
    leaderAddGroup: (token, input, now = Date.now()) => leader(token, now, async (O, org) => ({ ok: true, group: await addGroup(O, org.id, input, now) })),
    leaderLearners: (token, gid, now = Date.now()) => leader(token, now, async (O) => ({ ok: true, learners: await O.learners(gid, now) })),
    async leaderLogout(token) { const t = parseLeader(token); if (t) await orgOf(t.org).leaderLogout(t.secret); },

    // ---------------- testers: a club leader who signed in by email code (Cloudflare Access checked the address).
    // The first time, they get a small test organisation of their own (TESTER days, TESTER seats) with one group.
    // Every time, they are logged in as its leader and, on this device, as a learner in that group, so they can play and see /leader.
    // Returns { ok, leader, learner?, code, ends, reason? } (learner is missing when the group is full, ended or switched off; reason says why).
    async testerLogin(rawEmail, token, now = Date.now()) {
      const email = String(rawEmail || '').trim().toLowerCase();
      if (!/^[^@\s]{1,64}@[^@\s]{1,190}$/.test(email)) return fail('none');
      const { id, leaderCode, fresh } = await dir.tester(email, now);
      const O = orgOf(id);
      if (fresh) {
        try {
          const day = (n) => new Date(dayStart(new Date(now).toISOString().slice(0, 10)) + n * DAY).toISOString().slice(0, 10);
          await O.init({ id, ...orgFields({ name: 'Tester ' + email, note: 'Signed in by email code', starts: day(0), ends: day(TESTER.days - 1), seats: TESTER.seats }), leaderCode, created: now });
          await addGroup(O, id, { name: 'Test group' }, now);
        } catch (e) { await dir.removeOrg(id); throw e; }
      }
      const lead = await O.leaderLogin(leaderCode, now); if (!lead.ok) return lead;
      const g = (await O.groups(now))[0]; if (!g) return fail('unknown');
      const out = { ok: true, leader: `${id}.${lead.secret}`, code: g.code, ends: g.ends };
      const j = await this.join(g.code, '', token, now);
      return j.ok ? { ...out, learner: j.session } : { ...out, reason: j.reason };
    },

    // ---------------- admin (the company)
    async createOrg(input, now = Date.now()) {
      const fields = orgFields({ name: input?.name, note: input?.note, starts: input?.starts, ends: input?.ends, seats: input?.seats });
      const { id, leaderCode } = await dir.addOrg(fields.name, now);
      try { return await orgOf(id).init({ id, ...fields, leaderCode, created: now }); } catch (e) { await dir.removeOrg(id); throw e; }
    },
    async listOrgs(now = Date.now()) { return (await Promise.all((await dir.listOrgs()).map((o) => orgOf(o.id).summary(now)))).filter(Boolean); },
    async updateOrg(id, patch) {
      const { name, note, starts, ends, seats, revoked } = patch || {};
      const org = await admin(id).update({ name, note, starts, ends, seats, revoked }); if (name !== undefined) await dir.renameOrg(id, org.name); return org;
    },
    async deleteOrg(id) { await admin(id).destroy(); await dir.removeOrg(id); },
    listGroups: (id, now = Date.now()) => admin(id).groups(now),
    createGroup: (id, input, now = Date.now()) => addGroup(admin(id), id, input, now, input?.code, input?.atOnce), // admin may choose the join code and the limit
    updateGroup: (id, gid, patch) => { const { name, starts, ends, revoked, atOnce } = patch || {}; return admin(id).updateGroup(gid, { name, starts, ends, revoked, atOnce }); },
    async deleteGroup(id, gid) { const { code } = await admin(id).deleteGroup(gid); await dir.release(code); },
  };
}
