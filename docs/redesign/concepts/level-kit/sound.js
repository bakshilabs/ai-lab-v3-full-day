// Three small sounds that a level may use: a short note for a tap or a part going in, a ding for the end of a step, and a short tune for the end of a level.
// Sound belongs to the level, so nothing in the kit plays a sound by itself. The sound starts only after the child's first tap.
// The sounds are recordings from Kenney's free sound packs (public domain, CC0; sounds/LICENSE-kenney.txt): sounds/note.mp3 (interface sounds, drop_003),
// sounds/ding.mp3 (interface sounds, confirmation_001) and sounds/jingle.mp3 (music jingles, STEEL10), chosen by the owner's upload of 25 Nov 2026.
// beep(f) plays the note at the pitch f, so the little tunes the levels play stay tunes. Until a recording has loaded, or where it cannot load, a plain tone plays instead.
let AC = null; const BUF = {}, NOTE_HZ = 738; // the recorded note's own pitch
const ctx = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; } return AC; };
const load = (name) => { if (BUF[name] !== undefined || !AC) return; BUF[name] = null;
  fetch(new URL(`./sounds/${name}.mp3`, import.meta.url)).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject())).then((b) => AC.decodeAudioData(b)).then((d) => { BUF[name] = d; }).catch(() => { BUF[name] = false; }); };
const loadAll = () => ['note', 'ding', 'jingle'].forEach(load);
function play(name, rate = 1, vol = 0.5) { const a = ctx(); if (!a) return false; loadAll(); const b = BUF[name]; if (!b) return false;
  try { const s = a.createBufferSource(), g = a.createGain(); s.buffer = b; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g).connect(a.destination); s.start(); return true; } catch (e) { return false; } }
function tone(f, d, type, v) { const a = ctx(); if (!a) return; loadAll(); try { const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + d); } catch (e) { /* no sound */ } }
// a short soft note (triangle or sine, under 0.4 s) is the recorded note at that pitch; a long hum or a buzz (square, sawtooth) stays a plain tone, because the level chose it
export const beep = (f = 520, d = 0.09, type = 'triangle', v = 0.08) => {
  if ((type === 'triangle' || type === 'sine') && d < 0.4 && play('note', Math.min(2.6, Math.max(0.35, f / NOTE_HZ)), Math.min(0.9, (v / 0.08) * 0.45))) return;
  tone(f, d, type, v); };
export const chime = () => { if (!play('ding', 1, 0.5)) [660, 880, 1100].forEach((f, k) => setTimeout(() => tone(f, 0.16, 'triangle', 0.08), k * 110)); };
// the end of a whole level: a short steel-drum tune that climbs
export const jingle = () => { if (!play('jingle', 1, 0.55)) chime(); };
// the recordings start loading at the child's first press anywhere on the page, so the first sounds are already the recorded ones
if (typeof addEventListener === 'function') addEventListener('pointerdown', () => { if (ctx()) loadAll(); }, { once: true, capture: true });
