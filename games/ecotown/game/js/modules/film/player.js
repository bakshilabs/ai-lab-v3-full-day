// Town film studio: the shot player. It moves the game's camera through the child's own town (ctx.engine.onFrame),
// sets the light and the music for the mood, and plays a cut shot by shot. It adds nothing to the scene.
// No page elements here (ui.js) and no rules (cut.js): where the camera stands comes from camera.js.
import { moodOf, riverX } from './kit.js';
import { poseFor, stillAt, otterAt } from './camera.js';

const TITLE_MS = 2800, END_MS = 2600, DARK_MS = 170, LOOP_REST = 0.35;
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

export function createPlayer(ctx, set, { reduce }) {
  const { camera, stage, florence, life } = ctx.engine;
  const hourWas = stage.hour, winterWas = stage.winter;
  // what the camera is doing: looking at one shot's view (view), or playing a shot (shot, from t0 for secs)
  const S = { low: 0.4, lowTo: 0.4, view: null, viewU: 0.5, drift: 0, shot: null, t0: 0, secs: 1, held: null, from: null, fromT: 0, gameT: 0, last: null, hour: hourWas, hourTo: hourWas, gone: false };
  const now = () => performance.now();
  // Florence comes to stand by her AI Lab while the film is made (and goes back where she was afterwards)
  let floWas = null;
  try { const p = florence?.position; if (p && florence.appear) { floWas = { x: p.x, y: p.y, z: p.z, visible: florence.visible !== false }; const [x, y, z] = set.who.florence.pos; florence.appear({ x, y, z }); } } catch { floWas = null; }

  // where everyone is this frame, so a close-up follows them
  function live() {
    const out = { aspect: camera.aspect || 1.6 };
    try { const p = florence?.position; if (p && florence.visible !== false && p.y > -100) out.florence = [p.x, p.y, p.z]; } catch { /* she is not on the island */ }
    try { const p = set.who.family.here && life?.familyPos?.(); if (p) { out.family = [p.x, p.y - 1.1, p.z]; const d = life.family?.door; if (d) out.familyFace = Math.atan2(d[0], d[1]) * 180 / Math.PI; } } catch { /* no family yet */ }
    if (set.who.otters.here) out.otters = otterAt(S.gameT, riverX);
    return out;
  }
  function apply(pose) {
    camera.position.set(pose.pos[0], pose.pos[1], pose.pos[2]); camera.lookAt(pose.look[0], pose.look[1], pose.look[2]);
    if (camera.fov !== pose.fov) { camera.fov = pose.fov; camera.updateProjectionMatrix(); }
    S.last = pose;
  }
  const aimLow = (pose) => { const d = Math.hypot(pose.pos[0] - pose.look[0], pose.pos[1] - pose.look[1], pose.pos[2] - pose.look[2]); return { ...pose, look: [pose.look[0], pose.look[1] - d * Math.tan(pose.fov * Math.PI / 360) * S.low, pose.look[2]] }; };
  const mix = (a, b, k) => ({ pos: a.pos.map((v, i) => lerp(v, b.pos[i], k)), look: a.look.map((v, i) => lerp(v, b.look[i], k)), fov: lerp(a.fov, b.fov, k) });

  let lastNow = now();
  ctx.engine.onFrame((_dt, t) => {
    if (S.gone) return; S.gameT = t;
    // real elapsed time, not the game's capped frame step: on a slow machine the camera still arrives on time
    const dt = Math.min(1.5, (now() - lastNow) / 1000); lastNow = now();
    // the light follows the mood, easing over a second or so (a cut with reduced motion)
    if (S.hour !== S.hourTo) { const d = S.hourTo - S.hour; S.hour = reduce || Math.abs(d) < 0.05 ? S.hourTo : S.hour + d * Math.min(1, dt * 2.5); stage.setTime(S.hour, 0); }
    let pose = null;
    if (S.shot) {
      let u = S.held !== null ? S.held : Math.min(1, (now() - S.t0) / (S.secs * 1000));
      // a looping shot (mission 1): plays, holds its last frame a moment, then starts again
      if (S.loop && S.held === null) { const k = ((now() - S.t0) / (S.secs * 1000)) % (1 + LOOP_REST); u = Math.min(1, k); }
      pose = poseFor(S.shot, set, u, live());
      if (S.loop) { S.low = reduce ? S.lowTo : S.low + (S.lowTo - S.low) * Math.min(1, dt * 3); pose = aimLow(pose); }
    }
    else if (S.view) {
      S.low = reduce ? S.lowTo : S.low + (S.lowTo - S.low) * Math.min(1, dt * 3);
      if (!reduce) S.drift += dt; const u = reduce ? (S.still ?? stillAt(S.view.move)) : S.viewU + Math.sin(S.drift * 0.22) * 0.16; // a slow sway, so the set feels alive
      pose = poseFor(S.view, set, u, live());
      // the panels cover the lower part of the screen: aim a little low, so the subject sits in the clear part above them
      pose = aimLow(pose);
      if (S.from) { const k = Math.min(1, (now() - S.fromT) / 1300); pose = mix(S.from, pose, smooth(k)); if (k >= 1) S.from = null; }
    }
    if (pose) apply(pose);
  });

  // Look at one shot's view while the child chooses or reads the storyboard: glide there (cut with reduced motion).
  function look(shot, u = null) {
    S.loop = false; S.shot = null; S.held = null; S.view = shot; S.viewU = u ?? stillAt(shot.move); S.still = u; S.drift = 0;
    S.from = !reduce && S.last ? S.last : null; S.fromT = now();
  }
  // Play one shot over and over (mission 1: name the camera move). With reduced motion: a still of its start or end.
  function loop(shot, secs = 4) { if (reduce) { look(shot, 0); return; } S.view = null; S.from = null; S.shot = shot; S.held = null; S.loop = true; S.secs = secs; S.t0 = now(); }
  function setMood(id) { const m = moodOf(id); S.hourTo = m.hour; ctx.engine.setMusic?.(m.music === 'celebrate' ? 'day' : m.music); }

  // Play a cut: the title card over the first frame, each shot, then the end card over the last frame.
  // hooks: { title(), shot(i, shot), end(), dark(on) } and the settable onNext / onSkip (ui.js film()).
  // Resolves 'ended' or 'skipped'. With reduced motion each shot is a still view that waits for Next.
  async function play(cut, hooks) {
    let skipped = false; let wake = null;
    // the browser test (tests/playwright/film.mjs) stretches the film, so slow software 3D can still photograph each shot
    const pace = Number(globalThis.__filmPace) > 0 ? Number(globalThis.__filmPace) : 1;
    const sleep = (ms) => new Promise((res) => { const id = setTimeout(done, ms); function done() { clearTimeout(id); wake = null; res(); } wake = done; });
    const tap = () => new Promise((res) => { wake = () => { wake = null; res(); }; });
    hooks.onSkip = () => { skipped = true; wake?.(); }; hooks.onNext = () => wake?.();
    const onAbort = () => { skipped = true; wake?.(); }; ctx.signal.addEventListener('abort', onAbort);
    const mood = moodOf(cut.mood); S.hourTo = mood.hour; S.view = null; S.from = null; S.loop = false;
    ctx.engine.setMusic?.(mood.music === 'celebrate' ? 'day' : mood.music); if (mood.music === 'celebrate') ctx.engine.setMusic?.('celebrate');
    const hold = (shot, u) => { S.shot = shot; S.held = u; };
    hold(cut.shots[0], reduce ? stillAt(cut.shots[0].move) : 0); hooks.title();
    await (reduce ? tap() : sleep(TITLE_MS * pace));
    for (let i = 0; i < cut.shots.length && !skipped; i++) {
      const shot = cut.shots[i]; hooks.shot(i, shot);
      if (shot.music) ctx.engine.setMusic?.(shot.music); // mission 4: the music changes where the editor chose
      if (shot.sub === 'who:florence' && !reduce) { try { florence?.wave?.(); } catch { /* she only waves on the island */ } }
      if (reduce) { hold(shot, stillAt(shot.move)); await tap(); continue; }
      S.shot = shot; S.held = null; S.secs = shot.secs * pace; S.t0 = now(); hooks.dark(false);
      await sleep(shot.secs * pace * 1000 - (i < cut.shots.length - 1 ? DARK_MS : 0));
      if (i < cut.shots.length - 1 && !skipped) { hooks.dark(true); await sleep(DARK_MS); } // a short dip to black between shots
    }
    if (!skipped) { const lastShot = cut.shots[cut.shots.length - 1]; hold(lastShot, reduce ? stillAt(lastShot.move) : 1); hooks.dark(false); hooks.end(); await (reduce ? tap() : sleep(END_MS * pace)); }
    ctx.signal.removeEventListener('abort', onAbort); hooks.dark(false);
    if (mood.music === 'celebrate') ctx.engine.setMusic?.('day');
    return skipped ? 'skipped' : 'ended';
  }

  // Put the light and the music back as the town had them.
  function dispose() { if (S.gone) return; S.gone = true; try { stage.setTime(hourWas, winterWas); } catch { /* the stage is gone */ } try { if (floWas) { florence.appear(floWas); florence.show(floWas.visible); } } catch { /* she stays by the Lab */ } ctx.engine.setMusic?.('day'); }
  return { look, loop, setMood, play, dispose, setLow(f) { S.lowTo = f; } };
}
