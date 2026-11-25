// Background music for the whole game (owner, 25 Nov 2026): each level has its own piece, which loops quietly while the level is open and fades in and out.
// The pieces are in music/: Flowerbed Fields (Zane Little Music), Summer Sunday (celestialghost8) and Summer Park (Scribe), all public domain (CC0, OpenGameArt),
// and "8 bit music on medium" by moodmode (Pixabay, free to use under the Pixabay licence), all uploaded or chosen by the owner. Two are used twice for now, as the owner asked.
// The music starts only from a click (a browser allows nothing else), and the child or the teacher can turn it off; the choice is remembered on this device.
const PIECES = ['flowerbed-fields', 'summer-park', 'summer-sunday', 'eight-bit-medium', 'flowerbed-fields', 'summer-park']; // by level: Land, Getting around, Homes, Food, Power, School
const KEY = 'eco-town-music', VOLUME = 0.22, FADE = 1.2;
let AC = null, out = null, now = null, want = -1; const BUF = {};
let on = true; try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) { /* remembered nowhere: music is on */ }
const ctx = () => { try { if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); out = AC.createGain(); out.connect(AC.destination); } if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; } return AC; };
const load = (name) => (BUF[name] = BUF[name] || fetch(new URL(`./music/${name}.mp3`, import.meta.url)).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('no music')))).then((b) => AC.decodeAudioData(b)));
function fadeOut() { if (!now) return; const { src, g } = now; now = null; try { const t = AC.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + FADE); src.stop(t + FADE + 0.05); } catch (e) { /* already stopped */ } }
async function start(level) { const a = ctx(); if (!a) return; const name = PIECES[level]; if (!name) return;
  let buf; try { buf = await load(name); } catch (e) { return; } // no music file: the level plays on in silence
  if (want !== level || !on || (now && now.level === level)) return;
  fadeOut(); const src = a.createBufferSource(), g = a.createGain(); src.buffer = buf; src.loop = true; g.gain.value = 0; src.connect(g).connect(out); src.start();
  g.gain.linearRampToValueAtTime(VOLUME, a.currentTime + FADE); now = { src, g, level }; }
// the game calls these: a level opens, the child goes back to the town
export function playFor(level) { want = level; if (on) start(level); }
export function stop() { want = -1; fadeOut(); }
export const isOn = () => on;
export function setOn(v) { on = !!v; try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) { /* not remembered */ } if (on && want >= 0) start(want); else fadeOut(); }
