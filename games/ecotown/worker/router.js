// Eco Town's routes, kept apart from worker.js so they can be tested in Node (worker.js adds the game files and pages).
//  - Everyone: the landing page at "/" is open, with what it loads (owner, 20 Nov 2026; see PUBLIC below).
//  - Learners: the join page in place of any other page, then the protected game (only with a valid session cookie). A whole group shares one
//    join code; each device that joins becomes its own learner with a made-up badge. One device per badge at a time.
//  - Leaders: /leader, with the organisation's leader code. A leader only ever reaches their own organisation.
//  - Admin (the company): /admin, behind Cloudflare Access AND verified here (Access login token).
import { createService, SAVE_MAX, LEADER_FOR } from './codes.js';

const TEAM = 'https://lively-silence-ec13.cloudflareaccess.com';
const AUD = '2fd6668e3bbe8607cd949c86d1da34d104d9486ff85529c348f09fdb581987dc';
const COOKIE = 'eco_s', LEADER = 'eco_l';
const BASE = {
  'Cache-Control': 'no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};
// the new Eco Town game (eco-town/) opens each level's page in a frame of its own page, so its files may be framed by this site only
const FRAMED = { ...BASE, 'X-Frame-Options': 'SAMEORIGIN', 'Content-Security-Policy': BASE['Content-Security-Policy'].replace("frame-ancestors 'none'", "frame-ancestors 'self'") };
const TYPES = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', mp4: 'video/mp4', html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json', bin: 'application/octet-stream', woff2: 'font/woff2', vtt: 'text/vtt; charset=utf-8' };
const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), { status, headers: { ...BASE, 'Content-Type': 'application/json', ...extra } });
const text = (s, status = 200) => new Response(s, { status, headers: { ...BASE, 'Content-Type': 'text/plain' } });
const html = (s, status = 200, base = BASE) => new Response(s, { status, headers: { ...base, 'Content-Type': TYPES.html } });


// ---------------- Cloudflare Access token check (admin)
let keys = null, keysAt = 0;
const b64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
async function accessOK(req, env) {
  const token = req.headers.get('Cf-Access-Jwt-Assertion') || (req.headers.get('Cookie') || '').match(/CF_Authorization=([^;]+)/)?.[1];
  if (!token) return false;
  try {
    const [h, p, sig] = token.split('.'); const header = JSON.parse(new TextDecoder().decode(b64u(h))); const claims = JSON.parse(new TextDecoder().decode(b64u(p)));
    if (!keys || Date.now() - keysAt > 3600e3) { keys = (await (await fetch(TEAM + '/cdn-cgi/access/certs')).json()).keys; keysAt = Date.now(); }
    const jwk = keys.find((k) => k.kid === header.kid); if (!jwk || header.alg !== 'RS256') return false;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(sig), new TextEncoder().encode(h + '.' + p));
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    return ok && aud.includes(AUD) && claims.iss === TEAM && claims.exp * 1000 > Date.now();
  } catch { return false; }
}


// the directory is one object; every organisation has its own. Both answer call(kind, method, ...args).
const remote = (env, name, kind) => { const stub = env.CODES.get(env.CODES.idFromName(name)); return new Proxy({}, { get: (_, m) => (...a) => stub.call(kind, m, ...a) }); };
const service = (env) => createService(remote(env, 'main', 'dir'), (id) => remote(env, 'org:' + id, 'org'));
const recent = new Map(); // session -> time of its last successful check in this Worker instance
// files whose name carries a hash of their contents never change: the player's own browser may keep them for a week
// (the page itself is never stored, so the game still can't start without a valid session)
const KEEP = { 'Cache-Control': 'private, max-age=604800, immutable' };
// The landing page is open to everyone, with no code (owner, 20 Nov 2026): the start page, its two scripts, the fonts,
// its pictures and the eight short build films of its film strip (FILMS in js/hub.js). The game, its voices, the other
// pictures and films, and every other page still need a session.
const PUBLIC = (f) => f === '/index.html' || /^\/assets\/(hub|island)-[a-f0-9]{8,}\.js$/.test(f) || /^\/assets\/fonts\/[a-z0-9_-]+\.woff2$/.test(f)
  || /^\/img\/home\/(tiles\/)?[a-z0-9_-]+\.webp$/.test(f) || /^\/videos\/(timber|wind|solar|orchard|cycle|greenroof|tram|hives)\.mp4$/.test(f);
const hashed = (f) => /^\/assets\/(app|m)-[a-f0-9]{8,}\.[a-z]+$/.test(f) || /^\/voice\/pack-[a-z]+-[a-f0-9]{8,}\.bin$/.test(f);
const cookie = (req, name) => (req.headers.get('Cookie') || '').match(new RegExp('(?:^|; ?)' + name + '=([^;]+)'))?.[1] || '';
const setCookie = (name, value, age) => ({ 'Set-Cookie': `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}` });
// A game page that was opened by one learner must never save or check in under another learner's session (a second
// child joined in another tab of the same browser). The game sends its learner id; a mismatch is refused.
const otherLearner = (body, sess) => !!(body && typeof body === 'object' && typeof body.learner === 'string' && body.learner !== String(sess || '').split('.')[1]);
const MESSAGES = {
  other: 'Another learner has joined on this device.',
  unknown: 'That code wasn’t recognised. Check it and try again.', revoked: 'This code has been switched off. Ask your leader.',
  not_started: 'This code isn’t active yet. Ask your leader when it starts.', expired: 'Your access has ended. Ask your leader.',
  full: 'This group is full. Tell your leader.', no_badge: 'That badge isn’t in this group. Check it and try again.',
  none: 'Please type your group’s code.', replaced: 'Your badge is now being used on another device. Join again to play here.',
};
const LEADER_MESSAGES = { unknown: 'That leader code wasn’t recognised.', revoked: 'This organisation has been switched off.', none: 'Please log in with your leader code.' };
const refuse = (r, status, table = MESSAGES) => json({ ok: false, reason: r.reason, message: table[r.reason] || 'Sorry, that didn’t work.' }, status);
const oops = (e) => json({ error: String(e.message || e).replace(/^Error: /, '') }, 400);
// reads a JSON body of at most `max` bytes: { body } or { status } (413 too big, 400 not JSON)
async function readJson(req, max = 4096) {
  if (+req.headers.get('Content-Length') > max) return { status: 413 };
  let t = ''; try { t = await req.text(); } catch { return { status: 400 }; }
  if (new TextEncoder().encode(t).length > max) return { status: 413 };
  if (!t) return { body: undefined };
  try { return { body: JSON.parse(t) }; } catch { return { status: 400 }; }
}

// files: { '/index.html': body, ... }; access: the admin check (only tests pass their own)
export function makeHandler({ files = {}, adminHtml = '', leaderHtml = '', access = accessOK } = {}) {
  return async function fetch(req, env) {
    const url = new URL(req.url); const p = url.pathname; const S = service(env); const now = Date.now();

    // ---------------- admin (company only)
    if (p === '/admin' || p.startsWith('/admin/')) {
      if (!(await access(req, env))) return html('<h1>Admin login required</h1>', 403);
      if (p === '/admin' || p === '/admin/') return html(adminHtml);
      try {
        const body = async () => { const r = await readJson(req); if (r.status) throw new Error('Bad request'); return r.body || {}; };
        if (p === '/admin/api/orgs' && req.method === 'GET') return json(await S.listOrgs(now));
        if (p === '/admin/api/orgs' && req.method === 'POST') return json(await S.createOrg(await body(), now));
        const m = p.match(/^\/admin\/api\/orgs\/([a-f0-9]{12})(?:\/groups(?:\/([a-f0-9]{8}))?)?$/);
        if (m && !p.includes('/groups')) {
          if (req.method === 'PATCH') return json(await S.updateOrg(m[1], await body()));
          if (req.method === 'DELETE') { await S.deleteOrg(m[1]); return json({ ok: true }); }
        } else if (m && !m[2]) {
          if (req.method === 'GET') return json(await S.listGroups(m[1], now));
          if (req.method === 'POST') return json(await S.createGroup(m[1], await body(), now));
        } else if (m) {
          if (req.method === 'PATCH') return json(await S.updateGroup(m[1], m[2], await body()));
          if (req.method === 'DELETE') { await S.deleteGroup(m[1], m[2]); return json({ ok: true }); }
        }
      } catch (e) { return oops(e); }
      return json({ error: 'not found' }, 404);
    }

    // ---------------- leader (facilitator) side. The organisation is always the one in the leader's own cookie.
    if (p === '/leader' || p === '/leader/') return html(leaderHtml);
    if (p.startsWith('/api/leader/')) {
      const L = cookie(req, LEADER);
      try {
        if (p === '/api/leader/login' && req.method === 'POST') {
          const r = await S.leaderLogin((await readJson(req)).body?.code, now);
          return r.ok ? json({ ok: true, name: r.name }, 200, setCookie(LEADER, r.session, LEADER_FOR / 1000)) : refuse(r, 401, LEADER_MESSAGES);
        }
        if (p === '/api/leader/logout' && req.method === 'POST') { await S.leaderLogout(L); return json({ ok: true }, 200, setCookie(LEADER, '', 0)); }
        let r = null;
        if (p === '/api/leader/groups' && req.method === 'GET') r = await S.leaderGroups(L, now);
        if (p === '/api/leader/groups' && req.method === 'POST') { const b = await readJson(req); if (b.status) return json({ error: 'Bad request' }, b.status); r = await S.leaderAddGroup(L, b.body || {}, now); }
        const m = p.match(/^\/api\/leader\/groups\/([a-f0-9]{8})\/learners$/);
        if (m && req.method === 'GET') r = await S.leaderLearners(L, m[1], now);
        if (r) return r.ok ? json(r) : refuse(r, 401, LEADER_MESSAGES);
      } catch (e) { return oops(e); }
      return json({ error: 'not found' }, 404);
    }

    // ---------------- learner API
    const sess = cookie(req, COOKIE);
    if ((p === '/api/join' || p === '/api/login') && req.method === 'POST') {
      const b = (await readJson(req)).body || {};
      const r = await S.join(b.code, typeof b.badge === 'string' ? b.badge.trim() : '', sess, now);
      if (!r.ok) return refuse(r, 401);
      const { session, ...out } = r; recent.delete(sess);
      return json(out, 200, setCookie(COOKIE, session, 2592000));
    }
    if (p === '/api/heartbeat') {
      const b = (await readJson(req)).body; const status = b && typeof b === 'object' ? b.status : undefined;
      if (otherLearner(b, sess)) return json({ ok: false, reason: 'other', message: MESSAGES.other }, 409);
      const r = await S.check(sess, now, status === undefined ? {} : { status });
      return r.ok ? json({ ok: true }) : json({ ok: false, reason: r.reason, message: MESSAGES[r.reason] || MESSAGES.replaced }, 409);
    }
    if (p === '/api/me' && req.method === 'GET') { const r = await S.check(sess, now, { touch: false }); return r.ok ? json(r) : refuse(r, 401); }
    if (p === '/api/save' && req.method === 'GET') { const r = await S.getSave(sess, now); return r.ok ? json(r) : refuse(r, 401); }
    if (p === '/api/save' && req.method === 'PUT') {
      const b = await readJson(req, SAVE_MAX);
      if (b.status) return json({ ok: false, reason: b.status === 413 ? 'too_big' : 'bad', message: b.status === 413 ? 'That save is too big.' : 'That save could not be read.' }, b.status);
      if (otherLearner(b.body, sess)) return json({ ok: false, reason: 'other', message: MESSAGES.other }, 409);
      const r = await S.putSave(sess, b.body, now);
      if (r.ok) return json(r);
      return r.reason === 'bad' ? json({ ok: false, reason: 'bad', message: 'That save could not be read.' }, 400) : refuse(r, 401);
    }
    if (p === '/api/logout') { await S.logout(sess); recent.delete(sess); return json({ ok: true }, 200, setCookie(COOKIE, '', 0)); }
    if (p.startsWith('/api/')) return json({ error: 'not found' }, 404);

    // ---------------- game files: only with a valid session
    const file = p === '/' ? '/index.html' : p; const page = file.endsWith('.html'); // a page asked for without a session shows the join page
    const H = file.startsWith('/eco-town/') ? FRAMED : BASE;
    // The page itself and every heartbeat ask the organisation's store. The other files of one page load (about a hundred)
    // reuse a recent "yes" for a minute, so a class starting together is one store call each, not a hundred.
    if (!PUBLIC(file)) {
      const hit = !page && recent.get(sess);
      const r = hit && now - hit < 60e3 ? { ok: true } : await S.check(sess, now, { touch: page });
      if (r.ok && !hit) { if (recent.size > 5000) recent.clear(); recent.set(sess, now); } else if (!r.ok) recent.delete(sess);
      if (!r.ok) {
        if (page) return html(joinPage(r.reason === 'none' ? '' : MESSAGES[r.reason] || ''), 200, H);
        return text('Login required', 403);
      }
    }
    // recorded voices live in Workers KV (too big for the script); same session rule as every other game file
    if (file.startsWith('/voice/') && env.VOICE) {
      const name = file.slice(7); if (!/^pack-[a-z]+(-[a-f0-9]+)?\.(json|bin)$/.test(name)) return new Response('Not found', { status: 404, headers: BASE });
      const v = await env.VOICE.get(name, 'arrayBuffer'); if (!v) return new Response('Not found', { status: 404, headers: BASE });
      return new Response(v, { headers: { ...BASE, ...(hashed(file) ? KEEP : {}), 'Content-Type': name.endsWith('.json') ? 'application/json' : 'audio/mpeg' } });
    }
    // Florence's portrait, build pictures, build videos and the story episodes (videos/episodes/) also live in KV. Videos need byte ranges (Safari/iPad).
    if (/^\/(img|videos)\//.test(file) && env.VOICE) {
      const key = file.slice(1); if (!/^(img\/(thumbs\/)?[a-z0-9_-]+\.png|img\/home\/(tiles\/)?[a-z0-9_-]+\.webp|videos\/((episodes|trailer)\/)?[a-z0-9_-]+\.(mp4|jpg|json|vtt))$/.test(key)) return new Response('Not found', { status: 404, headers: BASE });
      const v = await env.VOICE.get(key, 'arrayBuffer'); if (!v) return new Response('Not found', { status: 404, headers: BASE });
      const type = TYPES[key.split('.').pop()] || 'application/octet-stream';
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('Range') || '');
      if (m && (m[1] || m[2])) {
        const size = v.byteLength; let a = m[1] ? +m[1] : size - +m[2]; let b = m[1] && m[2] ? +m[2] : size - 1;
        if (a < 0) a = 0; if (b >= size) b = size - 1;
        if (a > b || a >= size) return new Response(null, { status: 416, headers: { ...BASE, 'Content-Range': `bytes */${size}` } });
        return new Response(v.slice(a, b + 1), { status: 206, headers: { ...BASE, 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${a}-${b}/${size}`, 'Content-Length': String(b - a + 1) } });
      }
      return new Response(v, { headers: { ...BASE, 'Content-Type': type, 'Accept-Ranges': 'bytes' } });
    }
    const body = files[file];
    if (body === undefined) return new Response('Not found', { status: 404, headers: BASE });
    return new Response(body, { headers: { ...H, ...(hashed(file) ? KEEP : {}), 'Content-Type': TYPES[file.split('.').pop()] || 'application/octet-stream' } });
  };
}

// the join page: one code for the whole group; a badge only when coming back on another device
function joinPage(msg) {
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Eco Town</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;font:500 18px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;color:#3b2a1e;background:radial-gradient(ellipse at top,#bfe3ff,#3f8fe6)}
.card{background:#fffaf0;border-radius:28px;padding:30px 28px;width:min(440px,calc(100vw - 28px));box-shadow:0 14px 40px rgba(0,0,0,.25),inset 0 0 0 2px #e6d3b0;text-align:center}
h1{margin:0 0 4px;font-size:2.4em;letter-spacing:-.02em}h1 span{color:#2e9b5a}p{color:#7a6450;margin:6px 0 18px;font-weight:600}
input{width:100%;font:800 1.5em/1 system-ui,sans-serif;text-align:center;letter-spacing:.06em;text-transform:uppercase;padding:14px;border-radius:16px;border:0;box-shadow:inset 0 0 0 3px #e6d3b0;color:#3b2a1e;background:#fff}
input:focus{outline:none;box-shadow:inset 0 0 0 3px #2e9b5a}
button{margin-top:14px;width:100%;min-height:54px;border:0;border-radius:16px;background:#2e9b5a;color:#fff;font:800 1.1em system-ui,sans-serif;box-shadow:inset 0 -4px 0 #1f7a44;cursor:pointer}
button[disabled]{opacity:.6}.msg{min-height:1.4em;margin-top:12px;color:#b0331f;font-weight:700}.chip{display:inline-block;background:#2b3a55;color:#fff;border-radius:999px;padding:3px 12px;font-weight:800;font-size:.7em;letter-spacing:.1em}
.more{display:block;margin:12px auto 0;width:auto;min-height:0;background:none;box-shadow:none;color:#7a6450;font:700 .85em system-ui,sans-serif;text-decoration:underline;padding:6px}
#bw{display:none;margin-top:12px}#bw p{margin:0 0 8px;font-size:.9em}#bw.on{display:block}
</style></head><body><form class="card" id="f" autocomplete="off"><span class="chip">A DELTAOPS LEARNING AI LAB</span><h1>Eco <span>Town</span></h1><p>Type your group’s code.</p>
<input id="c" name="code" placeholder="OTTER-1234" maxlength="24" autofocus aria-label="Group code">
<div id="bw"><p>Type the badge you had before.</p><input id="g" name="badge" placeholder="HERON 47" maxlength="24" aria-label="Your badge"></div>
<button id="b" type="submit">Start ➜</button><div class="msg" id="m" role="status">${msg.replace(/</g, '&lt;')}</div>
<button class="more" id="h" type="button" aria-expanded="false" aria-controls="bw">I already have a badge</button></form>
<script>
const $=(i)=>document.getElementById(i),f=$('f'),b=$('b'),m=$('m'),w=$('bw'),g=$('g'),h=$('h');
h.onclick=()=>{const on=w.classList.toggle('on');h.setAttribute('aria-expanded',on);h.textContent=on?'I am new here':'I already have a badge';if(on)g.focus();else g.value='';};
f.onsubmit=async(e)=>{e.preventDefault();b.disabled=true;m.textContent='';
 try{const body={code:$('c').value};if(w.classList.contains('on')&&g.value.trim())body.badge=g.value;
 const r=await fetch('/api/join',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();
 if(d.ok){location.replace(location.href);return;}m.textContent=d.message||'Sorry, that didn’t work.';}catch{m.textContent='Could not connect. Check the internet and try again.';}b.disabled=false;};
</script></body></html>`;
}
