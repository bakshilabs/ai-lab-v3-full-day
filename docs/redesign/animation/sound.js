// The film's sound, made with the game's own sound engine (snd/engine, copied from games/ecotown/game/js/engine):
// the game's music underneath, and its sound effects at the moments of the film. No audio files are used.
// renderAudio(parts, duration) returns the whole track as 16-bit samples at 44,100 samples a second.
import { createEngine, makeSfx, renderSong } from './snd/engine/audio.js';
import { note, run } from './snd/engine/chip.js';

// the sound of each Eco Town test: (engine, start time, length)
const TESTS = [
  (E, t, d) => { note(E, { ch: 'n', f: 5200, t, dur: d * 0.8, vol: 0.05, env: [1.2, 0.5, 0.9, 1.5], filter: { type: 'highpass', f0: 2500 } }); note(E, { ch: 'n', f: 500, t: t + d * 0.25, dur: d * 0.6, vol: 0.04, env: [2, 1, 0.9, 1.5], filter: { f0: 300, f1: 700 } }); note(E, { ch: 't', midi: 36, t: t + d * 0.55, dur: 0.6, vol: 0.12, slide: 0.6 }); },
  (E, t, d) => { for (let k = 0; k < d * 4.5 - 4; k++) note(E, { ch: 'n', f: 700 + (k % 3) * 90, t: t + 0.6 + k / 4.5, dur: 0.015, vol: 0.03, filter: { type: 'highpass', f0: 1200 } }); note(E, { ch: 't', midi: 43, t: t + 1.2, dur: d * 0.6, vol: 0.035, env: [0.6, 0.4, 0.8, 1] }); run(E, [[79, 0.08], [84, 0.16]], t + 0.1, { vol: 0.08, duty: 0.25 }); },
  (E, t, d) => { note(E, { ch: 'n', f: 220, t: t + 0.3, dur: d * 0.85, vol: 0.06, env: [1, 0.5, 0.9, 1.2], filter: { f0: 200, f1: 420 } }); for (let k = 0; k < d - 2; k++) note(E, { ch: 't', midi: 38, t: t + 0.8 + k, dur: 0.12, vol: 0.09 }); note(E, { ch: 'p', midi: 86, t: t + 0.4, dur: d * 0.5, vol: 0.012, duty: 0.125, env: [0.4, 0.3, 0.8, 0.8] }); },
  (E, t, d) => { for (let k = 0; k < d * 3 - 6; k++) note(E, { ch: 'n', f: k % 2 ? 900 : 650, t: t + 1 + k / 3, dur: 0.02, vol: 0.035, filter: { type: 'highpass', f0: 900 } }); note(E, { ch: 't', midi: 41, t: t + d * 0.35, dur: d * 0.55, vol: 0.04, env: [0.8, 0.4, 0.8, 1] }); for (let k = 0; k < 6; k++) note(E, { ch: 'p', midi: 96 + (k % 3) * 2, t: t + 0.3 + k * 0.9, dur: 0.05, vol: 0.02, duty: 0.125 }); },
  (E, t, d) => { note(E, { ch: 't', midi: 67, t: t + 0.6, dur: 2.6, vol: 0.07, slide: 0.6, env: [0.4, 0.6, 0.7, 0.8] }); note(E, { ch: 'n', f: 300, t: t + d * 0.3, dur: d * 0.6, vol: 0.018, env: [1, 0.5, 0.9, 1], filter: { f0: 250 } }); run(E, [[84, 0.06], [88, 0.06], [91, 0.12]], t + d * 0.36, { vol: 0.06, duty: 0.25 }); run(E, [[64, 0.1], [61, 0.1], [57, 0.3]], t + d * 0.6, { vol: 0.07, duty: 0.5 }); },
  (E, t, d) => { for (let k = 0; k < 5; k++) { note(E, { ch: 'p', midi: 93, t: t + 0.15 + k * 0.42, dur: 0.05, vol: 0.09, duty: 0.25, env: [0.002, 0.25, 0.2, 0.2] }); note(E, { ch: 't', midi: 81, t: t + 0.15 + k * 0.42, dur: 0.2, vol: 0.06 }); } for (let k = 0; k < d * 5 - 14; k++) note(E, { ch: 'n', f: 760 + (k % 4) * 60, t: t + 2 + k / 5, dur: 0.015, vol: 0.028, filter: { type: 'highpass', f0: 1200 } }); note(E, { ch: 't', midi: 43, t: t + 2.2, dur: d * 0.5, vol: 0.03, env: [0.6, 0.4, 0.8, 1] }); },
];

// lead is the length in seconds of the opening from the world map, which comes before the first part
export async function renderAudio(parts0, duration0, lead = 0) {
  const parts = [{ kind: 'lead', start: 0, dur: lead, sfx: lead ? [[0.3, 'whoosh'], [3.2, 'whoosh'], [5.2, 'title']] : [] }, ...parts0.map((p) => ({ ...p, start: p.start + lead }))], duration = duration0 + lead;
  const SR = 44100, N = Math.ceil(SR * (duration + 0.3)), last = parts[parts.length - 1];
  // the music: the game's daytime tune, quieter while a test runs, and the game's celebration tune at the end
  const mctx = new OfflineAudioContext(1, N, SR), ME = createEngine(mctx); renderSong(ME, 'day', last.start + 1);
  const g = ME.music.gain, HI = 0.15, LO = 0.06; g.setValueAtTime(0, 0); g.linearRampToValueAtTime(HI, 1.5);
  for (const p of parts) for (const s of p.sfx || []) if (s[1] === 'test') { g.setTargetAtTime(LO, p.start + s[0] - 0.3, 0.2); g.setTargetAtTime(HI, p.start + s[0] + s[2], 0.5); }
  g.setTargetAtTime(0, last.start - 0.6, 0.3);
  const cctx = new OfflineAudioContext(1, Math.ceil(SR * (last.dur + 0.3)), SR), CE = createEngine(cctx); renderSong(CE, 'celebrate', last.dur - 1); CE.music.gain.setValueAtTime(0.2, 0); CE.music.gain.setTargetAtTime(0, last.dur - 2.2, 0.5);
  // the sound effects
  const sctx = new OfflineAudioContext(1, N, SR), SE = createEngine(sctx), clock = { t: 0 }, fx = makeSfx({ fx: SE.fx, ctx: { get currentTime() { return clock.t; } } });
  const at = (t, name, ...a) => { clock.t = Math.max(0, t); fx[name](...a); }; let pops = 0;
  for (const p of parts) {
    for (const [t0, kind, len] of p.sfx || []) { const t = p.start + t0;
      if (kind === 'tap') at(t, 'tap'); if (kind === 'pop') at(t, 'pop', pops++, 'homes'); if (kind === 'whoosh') at(t, 'whoosh'); if (kind === 'title') { at(t, 'whoosh'); at(t + 0.35, 'tip'); }
      if (kind === 'go') at(t, 'unlock'); if (kind === 'good') at(t, 'tip'); if (kind === 'stamp') at(t, 'tap'); if (kind === 'sparkle') at(t, 'star'); if (kind === 'yes') at(t, p.li === 5 || p.kind === 'end' ? 'fanfare' : 'reward'); if (kind === 'hello') at(t, 'good');
      if (kind === 'build') for (let k = 0; k < len / 0.32; k++) at(t + k * 0.32, 'pop', k, ['homes', 'nature', 'homes', 'food', 'energy', 'homes'][p.li] || 'homes');
      if (kind === 'test' && TESTS[p.li]) TESTS[p.li](SE.fx, t, len); }
    // Florence's voice: soft blips while her words appear
    for (const [a, b, text] of p.says || []) { if (!text || text === '…') continue; const n = Math.min(text.length / 48, b - a - 0.5); for (let k = 0; k < n / 0.09; k++) note(SE.fx, { ch: 't', midi: [72, 74, 76, 79, 81][(k * 7 + text.length) % 5] + 12, t: p.start + a + 0.12 + k * 0.09, dur: 0.04, vol: 0.045 }); }
  }
  const [mb, sb, cb] = await Promise.all([mctx.startRendering(), sctx.startRendering(), cctx.startRendering()]);
  const a = mb.getChannelData(0), s = sb.getChannelData(0), c = cb.getChannelData(0), off = Math.round(last.start * SR), pcm = new Int16Array(N);
  for (let i = 0; i < N; i++) { const v = a[i] + s[i] + (i >= off && i - off < c.length ? c[i - off] : 0); pcm[i] = Math.max(-32767, Math.min(32767, Math.round(v * 32767 * 1.6))); }
  return pcm;
}
