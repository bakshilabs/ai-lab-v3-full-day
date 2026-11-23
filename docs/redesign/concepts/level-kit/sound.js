// Two small sounds that a level may use: a short note for a tap or a part going in, and three rising notes for the end of a step.
// Sound belongs to the level, so nothing in the kit plays a sound by itself. The sound starts only after the child's first tap.
let AC = null;
export const beep = (f = 520, d = 0.09, type = 'triangle', v = 0.08) => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), a = AC.createGain(); o.type = type; o.frequency.value = f; a.gain.setValueAtTime(v, AC.currentTime); a.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + d); o.connect(a).connect(AC.destination); o.start(); o.stop(AC.currentTime + d); } catch (e) { /* no sound */ } };
export const chime = () => [660, 880, 1100].forEach((f, k) => setTimeout(() => beep(f, 0.16), k * 110));
