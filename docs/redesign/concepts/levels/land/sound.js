// The sounds of the Land level: rain, the river, soft thunder, the bank falling, a splash and two small animal sounds.
// They are made in the browser from noise and plain tones, so the level needs no sound files. Sound belongs to the level, so this file
// lives in the level's own folder. Nothing plays before the child's first tap, because a browser does not allow it.
let AC = null, buf = null; const live = {};
const ac = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; } return AC; };
const noise = () => { if (buf) return buf; const n = AC.sampleRate * 2; buf = AC.createBuffer(1, n, AC.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return buf; };
// a bed of noise that goes on until it is turned down: rain is hiss, and the river is a low rush
function bed(name, type, freq, q) { if (live[name]) return live[name]; const a = ac(); if (!a) return null; const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = noise(); src.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0; src.connect(f).connect(g).connect(a.destination); src.start(); return (live[name] = { g }); }
const to = (b, v, sec) => { if (!b) return; try { const t = AC.currentTime; b.g.gain.cancelScheduledValues(t); b.g.gain.setValueAtTime(b.g.gain.value, t); b.g.gain.linearRampToValueAtTime(v, t + sec); } catch (e) { /* no sound */ } };
// v runs from 0 (silent) to 1 (heavy rain, a river in flood)
export const rainSound = (v, sec = 1.5) => to(v || live.rain ? bed('rain', 'highpass', 1700, 0.3) : null, v * 0.15, sec);
export const riverSound = (v, sec = 2) => to(v || live.river ? bed('river', 'lowpass', 420, 0.6) : null, v * 0.32, sec);
// one short burst of noise through a filter
function burst(type, freq, dur, vol, q = 0.8) { const a = ac(); if (!a) return; try { const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime; src.buffer = noise(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); src.connect(f).connect(g).connect(a.destination); src.start(t, Math.random()); src.stop(t + dur + 0.05); } catch (e) { /* no sound */ } }
function tone(f0, f1, dur, vol, type = 'sine') { const a = ac(); if (!a) return; try { const o = a.createOscillator(), g = a.createGain(), t = a.currentTime; o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02); } catch (e) { /* no sound */ } }
export const rumble = () => { burst('lowpass', 95, 2.2, 0.5); };                                         // thunder a long way off, kept soft
export const thud = () => { tone(120, 42, 0.32, 0.22); burst('lowpass', 300, 0.3, 0.2); };               // a piece of the bank drops
export const splash = () => { burst('bandpass', 1100, 0.35, 0.14, 0.6); };                               // and lands in the river
export const hiss = () => { burst('highpass', 3000, 0.25, 0.06); };                                      // a lantern goes out
export const quack = () => { tone(520, 380, 0.11, 0.09, 'square'); setTimeout(() => tone(480, 340, 0.13, 0.09, 'square'), 150); };
export const squeak = () => { tone(900, 1500, 0.09, 0.07, 'triangle'); };
export const croak = () => { tone(180, 120, 0.16, 0.1, 'sawtooth'); };
export const quiet = () => { to(live.rain, 0, 0.3); to(live.river, 0, 0.3); };
