// Background music for the AI Lab start page (owner, 25 Nov 2026: "the landing page should also have background music"; Claude picked
// Flowerbed Fields by Zane Little Music, public domain (CC0, OpenGameArt), one of the four pieces the owner chose for the game, and the music of Land, the first level).
// A browser plays no sound before the visitor's first click or key, so the music starts then, fades in quietly and loops. The button turns it off;
// the choice is remembered on this device with the same key as the game's own music button (docs/redesign/concepts/game/music.js).
const KEY = 'eco-town-music', VOLUME = 0.18, FADE = 1.5;
let AC = null, out = null, src = null, buf = null, started = false;
let on = true; try { on = localStorage.getItem(KEY) !== 'off'; } catch { /* remembered nowhere: music is on */ }
const save = () => { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* not remembered */ } };
async function play(url) {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') await AC.resume(); } catch { return; }
  if (!buf) { try { const r = await fetch(url); if (!r.ok) return; buf = await AC.decodeAudioData(await r.arrayBuffer()); } catch { return; } }
  if (!on || src) return;
  out = AC.createGain(); out.gain.value = 0; out.connect(AC.destination);
  src = AC.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(out); src.start();
  out.gain.linearRampToValueAtTime(VOLUME, AC.currentTime + FADE);
}
function silence() { if (!src) return; const s = src, g = out; src = null; try { const t = AC.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 0.6); s.stop(t + 0.7); } catch { /* already stopped */ } }
// button: the page's own "Music on / Music off" control
export function startMusic(url, button) {
  // on the narrowest phones the words are shorter, so the button stays clear of the page's label; a screen reader still hears the full words
  const mq = (q) => (window.matchMedia ? window.matchMedia(q) : { matches: false }), narrow = mq('(max-width: 380px)'), tiny = mq('(max-width: 340px)');
  const paint = () => { button.textContent = tiny.matches ? (on ? '♪' : '♪̸') : narrow.matches ? (on ? '♪ On' : '♪ Off') : (on ? '♪ Music on' : '♪ Music off'); button.setAttribute('aria-label', on ? 'Music on' : 'Music off'); button.setAttribute('aria-pressed', String(on)); };
  narrow.addEventListener?.('change', paint); tiny.addEventListener?.('change', paint);
  paint(); button.hidden = false;
  button.addEventListener('click', (e) => { e.stopPropagation(); started = true; on = !on; save(); paint(); if (on) play(url); else silence(); });
  const first = () => { if (started) return; started = true; if (on) play(url); };
  addEventListener('pointerdown', first, { once: true, capture: true }); addEventListener('keydown', first, { once: true, capture: true });
  // leaving for the game or another page: the music fades away
  addEventListener('pagehide', silence);
}
