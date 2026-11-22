// The film's sound track, made with the game's own synthesiser (snd/engine) and the cues, the six music beds and the
// loudness plan of docs/redesign/design/sound-cues.js. No audio files and no voices are used.
// The film's own times are used (timeline.js writes a list of cues for every part), because the new film has steps that
// the example in sound-cues.js (renderFilmAudio) does not know: marks stamped on flags during the test, plans tested one
// after another, the two-tap choice and the second try. The mixing follows renderFilmAudio: one bed for each level,
// silent from the press of the test button until the results have been shown, and the loudest sample kept below full scale.
// renderAudio(parts, duration) returns the whole track as 16-bit samples at 44,100 samples a second.
import { createEngine, renderSong } from './snd/engine/audio.js';
import { note } from './snd/engine/chip.js';
import { SONGS } from './snd/music/songs.js';
import { makeCues, registerSongs, bedPlan, BED, BED_LEVEL } from '../design/sound-cues.js';

export async function renderAudio(parts, duration) {
  const SR = 44100, N = Math.ceil(SR * (duration + 0.3)), mix = new Float32Array(N); registerSongs(SONGS);
  const add = async (ctx, from) => { const d = (await ctx.startRendering()).getChannelData(0), off = Math.round(from * SR); for (let i = 0; i < d.length && i + off < N; i++) mix[i + off] += d[i]; };
  for (const [pi, m] of parts.entries()) {
    // the effects and Florence's soft blips for this part
    const len = m.dur + 2.5, sctx = new OfflineAudioContext(1, Math.ceil(SR * len), SR), SE = createEngine(sctx), cues = makeCues({ note }, SE);
    for (const [t0, name, ...a] of m.cues) { const t = Math.max(0, t0); if (name === 'test') cues.tests[m.li](t, ...a); else if (cues[name]) cues[name](t, ...a); }
    await add(sctx, m.start);
    // the music: one bed for each level; the opening shares the bed of level 1, and the game's celebration tune ends the hour
    if (m.kind === 'level') { const from = pi === 1 ? 0 : m.start, lead = m.start - from, blen = lead + m.dur + 1.2, ctx = new OfflineAudioContext(1, Math.ceil(SR * blen), SR), E = createEngine(ctx), g = E.music.gain, t0 = pi === 1 ? 1.5 : 0.8;
      renderSong(E, BED[m.li].song, blen); g.setValueAtTime(0, 0); g.linearRampToValueAtTime(BED_LEVEL * (pi === 1 ? 0.5 : 1), t0);
      const shape = { inv: [2.8], ask: m.tray, think: m.think, offers: [m.offer, m.pause1[0]], testTap: m.testTap, res: [m.res0, m.choose], build: [m.build0, m.buildEnd], after: [m.after0 - 1.5], recap: [m.recap0], yes: [m.done + 0.5] };
      const plan = bedPlan(shape, lead); if (m.test2) plan.push([lead + m.test2 - 0.4, 0, 0.12], [lead + m.test2end + 0.4, BED_LEVEL * 0.5, 0.5]); plan.sort((a, b) => a[0] - b[0]);
      for (const [t, v, c] of plan) g.setTargetAtTime(v, Math.max(t0, t), c); g.setTargetAtTime(0, blen - 1.6, 0.3); await add(ctx, from); }
    if (m.kind === 'end') { const blen = m.dur - 3, ctx = new OfflineAudioContext(1, Math.ceil(SR * blen), SR), E = createEngine(ctx), g = E.music.gain; renderSong(E, 'celebrate', blen - 1); g.setValueAtTime(BED_LEVEL * 1.2, 0); g.setTargetAtTime(BED_LEVEL * 0.6, Math.max(0, m.panel - 3), 0.4); g.setTargetAtTime(BED_LEVEL * 1.2, m.back - 3, 0.5); g.setTargetAtTime(0, blen - 2.4, 0.6); await add(ctx, m.start + 3); }
  }
  let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(mix[i]));
  const gain = Math.min(2.5, 0.89 / (peak || 1)), pcm = new Int16Array(N); for (let i = 0; i < N; i++) pcm[i] = Math.round(mix[i] * gain * 32767);
  return pcm;
}
