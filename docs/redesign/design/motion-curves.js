// Motion curves for the redesigned game and for the film of the six Eco Town levels.
// Every function here is a pure function of time: give it the same numbers and it returns the same answer,
// so a frame can be drawn again at any moment. Nothing here keeps state or uses requestAnimationFrame.
// Times are in seconds unless a name ends in Ms. The report that explains each curve is motion.md in this folder.

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
// how far time t has moved from a to b, from 0 to 1
export const span = (t, a, b) => clamp((t - a) / (b - a));
// the same, for a beat that starts at t0 and lasts durMs milliseconds
export const beat = (t, t0, durMs) => clamp((t - t0) / (durMs / 1000));
// a repeatable random number from 0 to 1 (the film's own hash, so particles match from frame to frame)
export const hash = (x, z = 0) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };

// ---- easing: each takes k from 0 to 1 and returns about 0 to 1 -----------------------------------------------------
export const linear = (k) => clamp(k);
export const inQuad = (k) => { k = clamp(k); return k * k; };                                 // falling under gravity
export const outQuad = (k) => { k = clamp(k); return 1 - (1 - k) * (1 - k); };
export const inCubic = (k) => { k = clamp(k); return k * k * k; };                            // things that leave
export const outCubic = (k) => { k = clamp(k); return 1 - Math.pow(1 - k, 3); };              // things that arrive
export const inOutCubic = (k) => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }; // camera, pointer
export const outQuint = (k) => { k = clamp(k); return 1 - Math.pow(1 - k, 5); };              // dust and sparks
export const inOutSine = (k) => { k = clamp(k); return -(Math.cos(Math.PI * k) - 1) / 2; };   // sky and light
// arrives past the end and comes back: over is the share of overshoot (0.1 passes the end by one tenth)
export const outBack = (k, over = 0.1) => { k = clamp(k); const c = backConstant(over); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
// pulls back before leaving: the anticipation for anything that departs
export const inBack = (k, over = 0.1) => { k = clamp(k); const c = backConstant(over); return (c + 1) * k * k * k - c * k * k; };
// the constant that gives a chosen overshoot (0.1 gives 1.70158, the usual value)
function backConstant(over) { let lo = 0, hi = 12; for (let n = 0; n < 40; n++) { const c = (lo + hi) / 2, peak = (4 * c * c * c) / (27 * (c + 1) * (c + 1)); if (peak < over) lo = c; else hi = c; } return (lo + hi) / 2; }

// ---- springs: the exact answer for a spring released at time 0, so no state is needed -------------------------------
// t is seconds since release. hz is how fast it swings and damping is how quickly it calms down (1 never overshoots).
export function spring(t, hz = 3, damping = 0.6) {
  if (t <= 0) return 0; const w = 2 * Math.PI * hz, z = clamp(damping, 0.05, 1);
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
// ready-made springs. peakMs is when it first passes the end, over is how far past, and restMs is when it is still.
export const SPRING = {
  pop:    { hz: 3.0, damping: 0.6, peakMs: 210, over: 0.095, restMs: 400 },  // buttons, word buttons, labels, ticks
  bouncy: { hz: 2.6, damping: 0.4, peakMs: 210, over: 0.25,  restMs: 620 },  // the test button, the chosen plan, Florence's hop
  soft:   { hz: 2.0, damping: 0.8, peakMs: 420, over: 0.015, restMs: 450 },  // panels, the speech bubble
  wobble: { hz: 3.4, damping: 0.25, peakMs: 150, over: 0.44, restMs: 760 },  // a bell, a sign, a tree that is knocked
};
export const springOf = (t, s = SPRING.pop) => spring(t, s.hz, s.damping);
// a spring that starts at time t0: use it as scale = lerp(from, to, springAt(t, t0))
export const springAt = (t, t0, s = SPRING.pop) => spring(t - t0, s.hz, s.damping);
// something that has been knocked and rings down to rest: returns a value that swings about 0 (a bell, a flag, a tree)
export const ring = (t, hz = 3.5, decay = 3, amount = 1) => (t <= 0 ? 0 : amount * Math.exp(-decay * t) * Math.sin(2 * Math.PI * hz * t));

// ---- anticipation, then the move, then the overshoot, in one curve ----------------------------------------------------
// k from 0 to 1. It first goes backwards by `back`, then travels, passes the end by `over`, and settles.
export function anticipate(k, back = 0.08, over = 0.06, split = 0.22) {
  k = clamp(k); if (k < split) return -back * Math.sin((k / split) * Math.PI / 2);
  const m = (k - split) / (1 - split); return lerp(-back, 1, outBack(m, over / (1 + back)));
}

// ---- a press: what a button or the pointer does when it is tapped ---------------------------------------------------
// t is seconds since the finger went down. Returns how far it is pressed, from 0 (up) to 1 (fully down).
// It goes down in 70 ms, stays down for 90 ms, and springs back by about 410 ms. On the way back it passes 0 by about
// one eighth (the value goes a little below 0), which makes the button rise slightly above its resting place and settle.
export function press(t, downMs = 70, holdMs = 90) {
  if (t <= 0) return 0; const d = downMs / 1000, h = holdMs / 1000;
  if (t < d) return outCubic(t / d); if (t < d + h) return 1; return 1 - spring(t - d - h, 4, 0.55);
}
// a tap ring: returns { r, width, alpha } for a ring number n (0 or 1) at t seconds after the tap. Two rings, 120 ms apart.
export function tapRing(t, n = 0) {
  const k = clamp((t - n * 0.12) / 0.45); if (t < n * 0.12 || k >= 1) return null;
  return { r: lerp(14, n ? 46 : 58, outCubic(k)), width: lerp(n ? 3 : 6, 1, k), alpha: 1 - k * k };
}
// where the pointer is on its way from a to b ([x, y] in pixels): a slight arc, slow at both ends.
export function pointerPath(k, a, b, bulge = 0.06) {
  const e = inOutCubic(k), dx = b[0] - a[0], dy = b[1] - a[1], lift = Math.sin(e * Math.PI) * bulge;
  return [lerp(a[0], b[0], e) - dy * lift, lerp(a[1], b[1], e) + dx * lift];
}
// how long the pointer should take to travel a distance in pixels: 300 ms and half a millisecond a pixel, 450 to 800 ms
export const pointerMs = (pixels) => clamp(300 + pixels * 0.5, 450, 800);
// a word that flies from a button to its gap: returns { x, y, scale }. Use 420 ms.
export function flyWord(k, a, b, lift = 34) { const e = inOutCubic(k); return { x: lerp(a[0], b[0], e), y: lerp(a[1], b[1], e) - Math.sin(e * Math.PI) * lift, scale: 1 + 0.08 * Math.sin(e * Math.PI) }; }

// ---- a building or a plate that drops into place ---------------------------------------------------------------------
// t is seconds since the drop began. Returns { y, sx, sy, shadow, landed }:
// y is the height above the ground in units, sx and sy are the scales across and up (the base stays on the ground),
// shadow goes from 0.3 to 1 as it comes down, and landed is true from the moment it touches.
// The whole arrival lasts fallMs + 520 ms. With the defaults that is 820 ms.
export function drop(t, height = 6, fallMs = 300) {
  const f = fallMs / 1000; if (t <= 0) return { y: height, sx: 0.96, sy: 1.08, shadow: 0.3, landed: false };
  if (t < f) { const k = inQuad(t / f); return { y: height * (1 - k), sx: 0.96, sy: 1.08, shadow: lerp(0.3, 1, k), landed: false }; }
  const a = t - f; let sy;
  if (a < 0.09) sy = lerp(1.08, 0.80, outCubic(a / 0.09));                 // the squash, 90 ms
  else if (a < 0.26) sy = lerp(0.80, 1.06, inOutSine((a - 0.09) / 0.17));  // the rebound, 170 ms
  else sy = 1 + 0.06 * Math.exp(-(a - 0.26) * 14) * Math.cos((a - 0.26) * 24); // the settle, 260 ms
  return { y: 0, sx: 1 / Math.sqrt(sy), sy, shadow: 1, landed: true };
}
export const DROP_MS = 820;
// when building number i of n should start to drop, in seconds after the first: the gaps shorten like a drum roll
export function dropStart(i, firstGapMs = 420, lastGapMs = 200, n = 8) { let t = 0; for (let k = 0; k < i; k++) t += lerp(firstGapMs, lastGapMs, n > 1 ? Math.min(1, k / (n - 2 || 1)) : 0); return t / 1000; }
// a flat tile (a road, a path, a field square) that is laid: returns the height above its place, with a small bounce
export const layTile = (t, fromHeight = 0.5) => (t <= 0 ? fromHeight : t >= 0.22 ? 0 : Math.abs(fromHeight * (1 - outBack(t / 0.22, 0.08))));
// one piece of dust from a landing: piece i of n, t seconds after the landing. Returns { x, y, z, size } or null.
export function dust(t, i, n = 8, reach = 1.6, lifeMs = 420) {
  const k = t / (lifeMs / 1000); if (k <= 0 || k >= 1) return null; const ang = (i / n) * Math.PI * 2 + hash(i, 5) * 0.6, d = outQuint(k) * reach * (0.7 + hash(i, 9) * 0.5);
  return { x: Math.cos(ang) * d, z: Math.sin(ang) * d, y: 0.15 + Math.sin(k * Math.PI) * 0.3, size: 0.28 * (1 - k * k) };
}
// a hop: something already standing that jumps once. Returns the height. Use it for arrivals and for the wave at the end.
export const hop = (t, height = 0.3, ms = 300) => { const k = t / (ms / 1000); return k <= 0 || k >= 1 ? 0 : height * 4 * k * (1 - k); };
// the squash that goes with a hop: returns sy (use 1 / sqrt(sy) across)
export const hopSquash = (t, ms = 300) => { const k = t / (ms / 1000); if (k < -0.25 || k > 1.35) return 1; if (k < 0) return lerp(1, 0.9, (k + 0.25) / 0.25); if (k < 1) return lerp(0.9, 1.06, Math.sin(k * Math.PI)); return 1 - 0.1 * Math.exp(-(k - 1) * 9) * Math.cos((k - 1) * 12); };

// ---- shake, breathing and delays ---------------------------------------------------------------------------------------
// a shake that dies away: returns [x, y] in the units of amount. Keep amount at 3 pixels or less and ms at 200 or less.
export function shake(t, amount = 2, ms = 180, hz = 28, seed = 1) {
  const k = t / (ms / 1000); if (k <= 0 || k >= 1) return [0, 0]; const fall = (1 - k) * (1 - k);
  return [Math.sin(t * hz * 6.283 + seed) * amount * fall, Math.cos(t * hz * 6.283 * 0.83 + seed * 2) * amount * fall * 0.7];
}
// a button that is waiting to be pressed: returns a scale that swells gently. 1.2 times a second, 3.5 per cent.
export const breathe = (t, hz = 1.2, amount = 0.035) => 1 + Math.sin(t * hz * 6.283) * amount;
// the delay of item i in a row, with a limit so that long rows do not drag
export const stagger = (i, eachMs = 80, maxMs = 600) => Math.min(i * eachMs, maxMs) / 1000;
// a light that fails: on or off at time t, three slow flickers and then dark. Never more than three flashes in a second.
export function failingLight(t) { const on = [[0, 0.5], [0.62, 0.84], [1.0, 1.16], [1.4, 1.5]]; return t < 0 ? true : on.some(([a, b]) => t >= a && t < b); }
// how long a line of words should stay up after it has finished appearing, in milliseconds
export const readMs = (words) => 600 + words * 400;

// ---- the camera ----------------------------------------------------------------------------------------------------------
// a move between two framings [x, y, z, distance]: slow at both ends, and it lifts a little in the middle of a long move.
// k is from 0 to 1. Never use a spring for the camera.
export function cameraMove(k, a, b, lift = 0.08) {
  const e = inOutCubic(k), travel = Math.hypot(b[0] - a[0], b[2] - a[2]), up = Math.sin(e * Math.PI) * lift * Math.min(1, travel / 8);
  return [lerp(a[0], b[0], e), lerp(a[1], b[1], e), lerp(a[2], b[2], e), lerp(a[3], b[3], e) * (1 + up)];
}
// how long a camera move should take, from how far it travels on the ground and how much the distance changes
export const cameraMs = (a, b) => clamp(700 + Math.hypot(b[0] - a[0], b[2] - a[2]) * 70 + Math.abs(b[3] - a[3]) * 40, 800, 1800);
// the camera settings that were tried on the film (see motion.md): the tilt and the turn are the same in every level
export const CAMERA = {
  tilt: 0.82, yaw: -0.30, towardCamera: 0.03, // towardCamera moves the point looked at towards the camera by this share of the distance
  // for each level: where to look [x, y, z] and the working distance. Wide is 1.3 times it and close is 0.85 times it.
  levels: [[10.5, 2, 0, 24.5], [10.5, 2, -0.5, 27.5], [10.5, 2, -0.5, 26], [1.5, 0, -5, 24.5], [8.5, 2, -3.5, 31], [7.5, 2, -4.5, 23]],
  wide: 1.3, close: 0.85,
};
