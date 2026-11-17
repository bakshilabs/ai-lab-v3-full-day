// The AI Lab start page (start.html): the welcome and the six parts, with what has been done so far.
// It reads the saved town on this device for the ticks. It sends nothing. The motion (reveals, parallax, the road
// filling in) is in js/landing.js; this file only renders.
import { PARTS, LABEL, WELCOME_KEY, SAVE_KEY, JOBS, progress } from './series.js';
import { GAME, buildLabel } from './version.js';
import { startMotion } from './landing.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let save = null, seen = false;
try { save = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); seen = !!localStorage.getItem(WELCOME_KEY); } catch { /* storage off: everything shows as not started */ }
const P = progress(save, seen);
// each part's picture: a voxel tile from the game, with the part's own icon on top; tint = the tile's colours
const PIC = {
  town: { img: 'timber', tint: '#e9f3e4', tintd: '#cfe2c4' },
  drone: { img: 'allot', emo: '🚁', tint: '#e3eefb', tintd: '#c4d6ea' },
  robots: { img: 'vertical', emo: '🤖', tint: '#f3e6f1', tintd: '#e0c7dc' },
  roads: { img: 'road', emo: '🚗', tint: '#fbe9dc', tintd: '#f0cdb4' },
  film: { img: 'festival', emo: '🎬', tint: '#fff3c9', tintd: '#f0dc95' },
  power: { img: 'wind', emo: '⚡', tint: '#e2f4f1', tintd: '#bfe2dc' },
};
// a short word beside each stop on the road (wide screens only)
const SIDE = { town: ['First', 'Plan the town'], drone: ['Then', 'Take to the air'], robots: ['Then', 'Build and teach'], roads: ['Then', 'Hit the road'], film: ['Then', 'Lights, camera'], power: ['Last of all', 'Keep the lights on'] };

const stateText = (p) => (p.id === 'town' && P.town === 'started' && P.townNote ? `▶ ${P.townNote}` : p.id === 'town' && P.town === 'started' ? '▶ Carry on building' : LABEL[P[p.id]]);
const playText = (id) => (P[id] === 'done' ? 'Play again' : P[id] === 'started' ? 'Carry on' : 'Play');

const card = (p) => {
  const pic = PIC[p.id] || {}; const jobs = (JOBS[p.id] || []).map((j) => `<li>${j[0]} ${esc(j[1])}</li>`).join('');
  const stop = `<li class="stop" data-stop="${p.id}">
  <span class="pin ${P[p.id]} rv" aria-hidden="true">${P[p.id] === 'done' ? '✓' : p.n}</span>
  <span class="side" aria-hidden="true"><em>${esc(SIDE[p.id]?.[0] || '')}</em>${esc(SIDE[p.id]?.[1] || '')}</span>
  <article class="card rv${P.next === p.id ? ' next' : ''}" data-part="${p.id}" aria-labelledby="t-${p.id}">
    <span class="nexttag">Up next</span>
    <div class="ctop">
      <div class="pic" style="--tint:${pic.tint};--tintd:${pic.tintd}" aria-hidden="true">${pic.img ? `<img src="img/thumbs/${pic.img}.png" alt="" loading="lazy" decoding="async" width="104" height="104">` : ''}${pic.emo ? `<span class="emo">${pic.emo}</span>` : ''}</div>
      <div><span class="kick">Part ${p.n}</span><h3 id="t-${p.id}">${esc(p.title)}</h3>
        <div class="chips">${p.time ? `<span class="chip">⏱ ${esc(p.time[0].toUpperCase() + p.time.slice(1))}</span>` : ''}<span class="state ${P[p.id]}" data-state="${p.id}">${esc(stateText(p))}</span></div></div>
    </div>
    <p class="blurb">${esc(p.blurb)}</p>
    <div class="more" id="more-${p.id}"><div><div class="moreinner">
      <h4>Getting around</h4><ol>${p.how.map((h) => `<li>${esc(h)}</li>`).join('')}</ol>
      ${jobs ? `<h4>Jobs that use this</h4><ul class="jobs">${jobs}</ul>` : ''}
    </div></div></div>
    <div class="cfoot">
      <button type="button" class="more-btn" aria-expanded="false" aria-controls="more-${p.id}">How it works <span class="chev" aria-hidden="true">▾</span></button>
      <a class="btn small" href="${GAME}${p.query}" data-play="${p.id}" aria-label="${esc(`${playText(p.id)}: ${p.title}`)}"><span aria-hidden="true">▶</span> ${playText(p.id)}</a>
    </div>
  </article>
</li>`;
  // between Eco Town and the modules: a sign on the road
  return p.n === 2 ? `<li class="sign rv" aria-hidden="true"><span>Welcome to the town of the future<small>Five more parts: the machines and jobs that run it</small></span></li>${stop}` : stop;
};

const welcome = document.querySelector('[data-part="welcome"]'); welcome.href = `${GAME}?welcome=1`;
document.querySelector('[data-parts]').innerHTML = `<li class="road" aria-hidden="true"><span class="fill"></span></li>${PARTS.map(card).join('')}
<li class="finish rv" aria-hidden="true"><span>🏁 The end of the day<small>Take home a page that shows what you made</small></span></li>`;
const w = document.querySelector('[data-state="welcome"]'); if (P.welcome === 'done') { w.textContent = '✓ Watched'; w.classList.add('done'); }
if (P.next === 'welcome') welcome.classList.add('next');
// how far through the day this device is (shown once anything has been started)
const done = PARTS.filter((p) => P[p.id] === 'done').length;
if (P.welcome === 'done' || PARTS.some((p) => P[p.id] !== 'new')) {
  const m = document.querySelector('[data-myday]'); const nx = PARTS.find((p) => p.id === P.next);
  m.innerHTML = `<span>Your day so far: ${done} of ${PARTS.length} parts done</span><span class="dots" aria-hidden="true">${PARTS.map((p) => `<i class="${P[p.id]}"></i>`).join('')}</span>${nx ? `<a class="btn small" href="${GAME}${nx.query}">▶ Next: ${esc(nx.title)}</a>` : '<span>🎉 Every part done</span>'}`;
  m.classList.add('on');
}
// "How it works" opens the part's steps and jobs
document.querySelector('[data-parts]').addEventListener('click', (e) => {
  const b = e.target.closest('.more-btn'); if (!b) return;
  const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(open));
  document.getElementById(b.getAttribute('aria-controls')).classList.toggle('open', open);
});
document.querySelector('[data-version]').textContent = `Eco Town ${buildLabel()}`;
// the learner's badge, when the site has groups (a static copy has no server: nothing is shown)
if (!/^(localhost|127\.0\.0\.1)$|github\.io$/.test(location.hostname)) fetch('/api/me', { credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.badge) { const b = document.querySelector('[data-badge]'); b.innerHTML = `You are <b>${esc(d.badge)}</b>`; b.style.display = 'block'; } }).catch(() => {});
startMotion();
