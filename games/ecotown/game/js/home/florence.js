// Florence on the start page: the game's own 3D Florence (js/engine/florence.js), rendered ahead of time into a
// sprite sheet (img/home/florence-sprite.webp: 6 columns × 5 rows of 340 × 440). Frames 0–3 breathe, 4–19 wave,
// 20–29 point to her right (towards the welcome). She waves hello, points at the welcome, and waves when touched.
// With reduced motion she stands still on frame 0.
const COLS = 6, ROWS = 5;
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);
const IDLE = [0, 1, 2, 3, 2, 1], WAVE = range(4, 20), POINT = range(20, 30);

export function createFlorence(el, { calm = false } = {}) {
  const face = el?.querySelector('i');
  const api = { visible() {}, lean() {}, wave() {} };
  if (!el || !face) return api;
  const show = (n) => { face.style.backgroundPosition = `${(n % COLS) * (100 / (COLS - 1))}% ${Math.floor(n / COLS) * (100 / (ROWS - 1))}%`; };
  show(0);
  if (calm) return api;
  let queue = [], frames = IDLE, fi = 0, fps = 3, acc = 0, last = 0, raf = 0, on = true, rest = 0;
  const play = (seq, rate = 9, hold = 0) => { queue.push({ seq, rate, hold }); };
  const next = () => { const q = queue.shift(); if (q) { frames = q.seq; fps = q.rate; fi = 0; rest = q.hold; } else { frames = IDLE; fps = 3; fi = 0; rest = 0; } };
  function tick(now) {
    raf = on ? requestAnimationFrame(tick) : 0; if (!on) return;
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now; acc += dt;
    if (acc < 1 / fps) return; acc = 0;
    if (fi < frames.length) { show(frames[fi]); fi++; }
    else if (rest > 0) rest -= 1 / fps;
    else if (frames === IDLE && !queue.length) fi = 0; else next();
  }
  const greet = () => { play(WAVE, 9); play(POINT, 10, 1.4); play([...POINT].reverse(), 12); };
  setTimeout(greet, 900);
  // now and then, while she is on screen, she waves or points again
  setInterval(() => { if (on && frames === IDLE && !queue.length && document.visibilityState === 'visible') { if (Math.random() < 0.5) play(WAVE, 9); else { play(POINT, 10, 1.2); play([...POINT].reverse(), 12); } next(); } }, 11000);
  const poke = () => { if (frames !== WAVE) { queue = []; play(WAVE, 10); next(); } };
  el.addEventListener('pointerenter', poke); el.addEventListener('click', poke);
  raf = requestAnimationFrame(tick);
  return {
    visible(v) { if (v === on) return; on = v; last = 0; if (on && !raf) raf = requestAnimationFrame(tick); },
    lean(x) { el.style.setProperty('--px', x.toFixed(3)); },
    wave: poke,
  };
}
