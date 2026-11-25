// The AI Lab start page (start.html): the welcome and the four parts, with what has been done so far.
// It reads the saved town on this device for the ticks. It sends nothing.
// Motion: a live 3D island behind the page (js/home/island.js, loaded after the first paint), Florence as a sprite
// that waves and points, a strip of the game's build films, and one screen per part that the island glides to.
// With reduced motion, Save-Data or no WebGL the island is a still picture per part and no film plays.
import { PARTS, LABEL, WELCOME_KEY, SAVE_KEY, progress, partHref } from './series.js';
import { GAME, buildLabel } from './version.js';
import { createFlorence } from './home/florence.js';

document.documentElement.classList.add('js');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let save = null, seen = false, levels = 0;
try { save = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); seen = !!localStorage.getItem(WELCOME_KEY); } catch { /* storage off: everything shows as not started */ }
// the new Eco Town game keeps the levels done in its own key (docs/redesign/concepts/game/game.js)
try { const d = JSON.parse(localStorage.getItem('eco-town-game-1') || '[]'); levels = Array.isArray(d) ? new Set(d.filter((i) => Number.isInteger(i) && i >= 0 && i < 6)).size : 0; } catch { /* nothing remembered */ }
const P = progress(save, seen, levels);

document.querySelector('[data-part="welcome"]').href = `${GAME}?welcome=1`;
document.querySelector('[data-parts]').innerHTML = PARTS.map((p, i) => `<section class="chapter" data-shot="${p.id}" style="--i:${i}"><a class="card part${P.next === p.id ? ' next' : ''}${P[p.id] === 'done' ? ' done' : ''}" data-part="${p.id}" href="${partHref(p, GAME)}">
  <span class="num" aria-hidden="true">${p.n}</span><span class="nexttag">Next</span>
  <h3>${esc(p.title)}</h3>${p.time ? `<span class="time">${esc(p.time)}</span>` : ''}<div class="more"><div><p>${esc(p.blurb)}</p></div></div>
  <div class="row2"><span class="state ${P[p.id]}" data-state="${p.id}">${esc(p.id === 'town' && P.town === 'started' && P.townNote ? `▶ ${P.townNote}` : p.id === 'town' && P.town === 'started' ? '▶ Carry on building' : LABEL[P[p.id]])}</span><span class="arrow" aria-hidden="true">→</span></div></a></section>`).join('');
const w = document.querySelector('[data-state="welcome"]'); if (P.welcome === 'done') { w.textContent = '✓ Watched'; w.classList.add('done'); }
if (P.next === 'welcome') document.querySelector('[data-part="welcome"]').classList.add('next');
document.querySelector('[data-version]').textContent = `Eco Town ${buildLabel()}`;
// the learner's badge, when the site has groups (a static copy has no server: nothing is shown)
if (!/^(localhost|127\.0\.0\.1)$|github\.io$/.test(location.hostname)) fetch('/api/me', { credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.badge) { const b = document.querySelector('[data-badge]'); b.innerHTML = `You are <b>${esc(d.badge)}</b>`; b.style.display = 'block'; } }).catch(() => {});

// ---------------------------------------------------------------- motion
const calm = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const light = calm || !!navigator.connection?.saveData; // no films, no 3D
const fine = !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const scene = $('[data-scene]'), hero = $('.hero'), strip = $('[data-strip]'), chapters = $$('.chapter');

// Florence waves hello, then points at the welcome; she waves again when touched
const flo = createFlorence($('[data-florence]'), { calm });

// the film strip: the game's own build films; each plays only while it is on screen
const FILMS = ['timber', 'wind', 'solar', 'orchard', 'cycle', 'greenroof', 'tram', 'hives'];
const rows = $$('.strip .row');
FILMS.forEach((f, i) => { rows[i % 2].insertAdjacentHTML('beforeend', `<div class="tile" style="background-image:url(img/home/tiles/${f}.webp)">${light ? '' : `<video muted loop playsinline preload="none" data-src="videos/${f}.mp4"></video>`}</div>`); });
if (!light && 'IntersectionObserver' in window) {
  const vio = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => {
    // the tile's still picture stays until the film is really showing frames; a slow or failed film just leaves the picture
    if (isIntersecting) {
      if (!v.src) {
        const show = () => v.classList.add('playing');
        v.addEventListener('playing', () => (v.requestVideoFrameCallback ? v.requestVideoFrameCallback(show) : show()), { once: true });
        v.addEventListener('error', () => v.remove(), { once: true });
        v.src = v.dataset.src;
      }
      v.play().catch(() => {});
    } else v.pause();
  }), { threshold: 0.3 });
  $$('.tile video').forEach((v) => vio.observe(v));
}

// the island: a still picture at once, the live one after the first paint
let island = null, shot = 'hero';
const tall = () => innerWidth < 900 || innerHeight > innerWidth * 1.15;
const stills = new Map([['hero', $('[data-still="hero"]')]]);
const stillSrc = (name) => `img/home/${name}-${tall() ? 'tall' : 'wide'}.webp`;
function showStill(name) {
  if (!stills.has(name)) { const img = new Image(); img.className = 'still'; img.alt = ''; img.decoding = 'async'; img.dataset.still = name; img.src = stillSrc(name); scene.insertBefore(img, scene.querySelector('canvas')); stills.set(name, img); }
  for (const [n, img] of stills) img.classList.toggle('on', n === name);
}
const shiftFor = (s) => (tall() ? { x: 0, y: s === 'hero' ? 0.07 : -0.19, z: s === 'hero' ? 1.3 : 1.1 } : { x: s === 'hero' ? 0.22 : 0.24, y: 0, z: 1 });
function setShot(s) {
  if (!s) return; shot = s;
  scene.classList.toggle('at-hero', s === 'hero');
  if (island) { island.setShot(s); const f = shiftFor(s); island.setShift(f.x, f.y, f.z); } else showStill(s);
}
addEventListener('resize', () => { if (island) { const f = shiftFor(shot); island.setShift(f.x, f.y, f.z); } else for (const [n, img] of stills) if (n !== 'hero') img.src = stillSrc(n); });

// which part is in the middle of the screen
if ('IntersectionObserver' in window) {
  const mid = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; const el = e.target;
    chapters.forEach((c) => c.classList.toggle('on', c === el));
    setShot(el.dataset.shot || (el === strip ? 'hero' : null));
  }), { rootMargin: '-48% 0px -48% 0px' });
  [hero, strip, ...chapters].forEach((el) => mid.observe(el));
  const rise = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('seen'); rise.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  chapters.forEach((c) => rise.observe(c));
} else chapters.forEach((c) => c.classList.add('seen', 'on'));

// scroll-linked depth: the title lifts away, the film rows slide against each other, the big numbers drift
let ticking = false;
function onScroll() {
  ticking = false; const H = innerHeight;
  const hr = hero.getBoundingClientRect(); const hp = clamp(-hr.top / Math.max(1, hr.height), 0, 1);
  hero.style.setProperty('--hp', hp.toFixed(3)); island?.setHero(hp); flo.visible(hr.bottom > 0);
  const sr = strip.getBoundingClientRect(); if (sr.bottom > -50 && sr.top < H + 50) strip.style.setProperty('--mp', clamp((H - sr.top) / (H + sr.height), 0, 1).toFixed(3));
  for (const c of chapters) { const r = c.getBoundingClientRect(); if (r.bottom > -H && r.top < 2 * H) c.style.setProperty('--cp', clamp((r.top + r.height / 2 - H / 2) / H, -1, 1).toFixed(3)); }
}
if (!calm) { addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll(); }
if (!calm && fine) addEventListener('pointermove', (e) => {
  const x = (e.clientX / innerWidth - 0.5) * 2, y = (e.clientY / innerHeight - 0.5) * 2;
  flo.lean(x); island?.setPointer(x, y);
}, { passive: true });

// the live island: only with motion, WebGL 2 and a little memory; it runs only while the page is showing it
function webgl2() { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } }
/* global __ECO_ISLAND__ */
const ISLAND = typeof __ECO_ISLAND__ !== 'undefined' ? __ECO_ISLAND__ : './home/island.js';
const load = (u) => import(u); // a plain import(): build.mjs bundles the island on its own, so the page's script stays small
if (!light && webgl2() && !(navigator.deviceMemory && navigator.deviceMemory < 2)) {
  const go = () => load(ISLAND).then(({ createIsland }) => {
    const canvas = scene.querySelector('canvas');
    island = createIsland(canvas, { reduced: calm });
    island.setShot(shot); const f = shiftFor(shot); island.setShift(f.x, f.y, f.z); onScroll();
    let onScreen = true;
    const run = () => (onScreen && document.visibilityState === 'visible' ? island.start() : island.stop());
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; run(); }).observe($('.world'));
    document.addEventListener('visibilitychange', run); run();
    requestAnimationFrame(() => requestAnimationFrame(() => scene.classList.add('live')));
  }).catch(() => { island = null; showStill(shot); });
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  if (document.readyState === 'complete') idle(go, { timeout: 1200 }); else addEventListener('load', () => idle(go, { timeout: 1200 }), { once: true });
}

// opening a part: the card grows to fill the screen, then the game loads
if (!calm) document.addEventListener('click', (e) => {
  const a = e.target.closest('a.card'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault(); const r = a.getBoundingClientRect(); const o = document.createElement('div'); o.className = 'opening';
  o.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background:${getComputedStyle(a).backgroundColor}`;
  document.body.appendChild(o); o.getBoundingClientRect();
  o.style.transform = `translate(${-r.left}px, ${-r.top}px) scale(${innerWidth / r.width}, ${innerHeight / r.height})`; o.style.borderRadius = '0';
  setTimeout(() => { location.href = a.href; }, 380);
});
addEventListener('pageshow', () => $$('.opening').forEach((o) => o.remove()));
