// The AI Lab start page (start.html): the welcome and the four parts, with what has been done so far.
// It reads the saved town on this device for the ticks. It sends nothing.
import { PARTS, LABEL, WELCOME_KEY, SAVE_KEY, progress } from './series.js';
import { GAME, buildLabel } from './version.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let save = null, seen = false;
try { save = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); seen = !!localStorage.getItem(WELCOME_KEY); } catch { /* storage off: everything shows as not started */ }
const P = progress(save, seen);
const PIC = { town: '<img src="img/thumbs/timber.png" alt="">', drone: '🚁', robots: '🤖', roads: '<img src="img/thumbs/road.png" alt="">' };

document.querySelector('[data-part="welcome"]').href = `${GAME}?welcome=1`;
document.querySelector('[data-parts]').innerHTML = PARTS.map((p, i) => `<a class="card part${P.next === p.id ? ' next' : ''}${P[p.id] === 'done' ? ' done' : ''}" style="--i:${i}" data-part="${p.id}" href="${GAME}${p.query}">
  <span class="num">${p.n}</span><span class="nexttag">Next</span><div class="pic" aria-hidden="true"><span class="ico">${PIC[p.id]}</span></div>
  <h3>${esc(p.title)}</h3>${p.time ? `<span class="time">${esc(p.time)}</span>` : ''}<p>${esc(p.blurb)}</p>
  <span class="state ${P[p.id]}" data-state="${p.id}">${esc(p.id === 'town' && P.town === 'started' && P.townNote ? `▶ ${P.townNote}` : p.id === 'town' && P.town === 'started' ? '▶ Carry on building' : LABEL[P[p.id]])}</span></a>`).join('');
const w = document.querySelector('[data-state="welcome"]'); if (P.welcome === 'done') { w.textContent = '✓ Watched'; w.classList.add('done'); }
if (P.next === 'welcome') document.querySelector('[data-part="welcome"]').classList.add('next');
document.querySelector('[data-version]').textContent = `Eco Town ${buildLabel()}`;
// the learner's badge, when the site has groups (a static copy has no server: nothing is shown)
if (!/^(localhost|127\.0\.0\.1)$|github\.io$/.test(location.hostname)) fetch('/api/me', { credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.badge) { const b = document.querySelector('[data-badge]'); b.innerHTML = `You are <b>${esc(d.badge)}</b>`; b.style.display = 'block'; } }).catch(() => {});

// Motion (start.html): the parts rise into view as they are scrolled to, and the hero's loops rest while it is off
// screen. With reduced motion, or without IntersectionObserver, nothing is hidden and nothing waits.
const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
if (!calm && 'IntersectionObserver' in window) {
  const list = document.querySelector('[data-parts]');
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add('in'); list.classList.add('drawn'); io.unobserve(e.target); }), { rootMargin: '0px 0px -6% 0px' });
  list.querySelectorAll('.part').forEach((c) => { c.classList.add('reveal'); io.observe(c); });
  const top = document.querySelector('.top');
  if (top) new IntersectionObserver(([e]) => top.classList.toggle('rest', !e.isIntersecting)).observe(top);
}
