// The start page's motion (start.html): things rise in as they scroll into view, the hero island follows the
// pointer a little, and the road through the day fills in as you scroll. Nothing moves when the device asks for
// reduced motion, and everything is already visible without this file. It sends nothing.
export function startMotion() {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) return;
  const root = document.documentElement; root.classList.add('motion');

  // reveals: once in view, stay shown
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.rv').forEach((el) => io.observe(el));

  // the hero scene: layers drift with the pointer (fine pointers only) and with the scroll
  const scene = document.querySelector('[data-scene]');
  const layers = scene ? [...scene.querySelectorAll('[data-depth]')] : [];
  let px = 0, py = 0, sy = 0, queued = false;
  const road = document.querySelector('.journey');
  const paint = () => {
    queued = false;
    for (const l of layers) { const d = +l.dataset.depth; l.style.transform = `translate3d(${(px * d).toFixed(1)}px, ${(py * d - sy * d * 0.012).toFixed(1)}px, 0)`; }
    if (road) { const r = road.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height)); road.style.setProperty('--p', p.toFixed(3)); }
  };
  const ask = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  if (scene && matchMedia('(pointer: fine)').matches) addEventListener('pointermove', (e) => { px = (e.clientX / innerWidth - 0.5) * -1; py = (e.clientY / innerHeight - 0.5) * -0.6; ask(); }, { passive: true });
  addEventListener('scroll', () => { sy = scrollY; ask(); }, { passive: true });
  addEventListener('resize', ask, { passive: true });
  paint(); loopFilms();
}

// the film card's background: a short, silent, looping build film, fetched only when it scrolls into view and
// played only while it is on screen (never with reduced motion: startMotion returns before this is called)
export function loopFilms() {
  const vids = [...document.querySelectorAll('video[data-loop]')]; if (!vids.length) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { const s = v.querySelector('source[data-src]'); if (s) { s.src = s.dataset.src; s.removeAttribute('data-src'); v.load(); } v.play?.().catch(() => {}); } else v.pause?.();
  }), { threshold: 0.25 });
  vids.forEach((v) => io.observe(v));
}
