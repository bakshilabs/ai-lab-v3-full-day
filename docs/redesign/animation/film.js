// The film of the six Eco Town levels. Every frame is drawn from a time in seconds and from nothing else, so the film
// can be paused, searched and recorded frame by frame in any order.
// timeline.js says when things happen, town.js and tests.js draw the town, ui.js draws the interface of
// docs/redesign/ui/DESIGN.md over it, and this file moves the camera and joins them.
import { THREE, makeStage, clamp, ease, span, lerp, along } from './vox.js';
import * as MAP from './map.js';
import { makeIsland, makeScene, VIEWS, YAW, TILT, TAPS, TOP, SPOTS, STALL } from './town.js';
import { makeTests, TEST, TEST_VIEW, THUMB_VIEW, FLAGS, testLength } from './tests.js';
import { planFilm } from './timeline.js';
import { makeUI } from './ui.js';
import { drawFx } from './fx.js';
import { cameraMove, inOutCubic, inOutSine, shake } from '../design/motion-curves.js';

const W = 1280, H = 720;
// the framing for each recap, which holds every place that can be tapped
const RECAP_VIEW = [TEST_VIEW[0], VIEWS[2], VIEWS[3], VIEWS[4], VIEWS[5], [6.4, 2, -2.4, 36]];
// whole-world framings: [x, y, z, distance, tilt, turn]. The first opens the film and the last closes it, facing Drone City.
const WORLD = { world: [1, 0, 2, 205, 0.8, -1.2], world2: [1.5, 0, 1, 150, 0.86, -1.2], jobs: [3.5, 1, 6.5, 50, TILT, YAW] };

export function makeFilm(stageEl, D) {
  const st = makeStage(stageEl.querySelector('canvas.gl'), W, H), fxc = stageEl.querySelector('canvas.fx').getContext('2d');
  const isle = makeScene(), town = makeIsland(), tests = makeTests(), T = D.towns[0];
  const { segs, duration } = planFilm(D, { VIEWS, TEST_VIEW, RECAP_VIEW }, town.buildEnd);
  const ui = makeUI(stageEl, D, { screen: (p) => st.screen(new THREE.Vector3(...p)) });
  // the delivery drone that is on its way from Drone City in the last shot (the map's own first drone, flown by the film)
  const drone = MAP.drones[0];

  // ---- the camera -----------------------------------------------------------------------------------------------------
  // The safe window runs from 80 pixels below the top edge to 24 pixels above the dock. The camera puts what it looks at
  // in the middle of that window, and stands further back when the window is low, so that every flag stays inside it.
  const full = (v, dock) => { const w = typeof v === 'string' ? WORLD[v] : [...v, TILT, YAW]; if (dock === 'none') return [...w, 0, 1]; const top = 80, bottom = dock - 24, c = (top + bottom) / 2; return [w[0], w[1], w[2], w[3] * clamp(420 / (bottom - top), 1, 1.75), w[4], w[5], H / 2 - c]; };
  const camAt = (m, t) => { let cur = m.cams[0].v; for (let i = 1; i < m.cams.length; i++) { const k = m.cams[i]; if (t <= k.t) break; const q = span(t, k.t, k.t + k.dur), e = inOutCubic(q), mv = cameraMove(q, cur, k.v); cur = [mv[0], mv[1], mv[2], mv[3], lerp(cur[4], k.v[4], e), lerp(cur[5], k.v[5], e), lerp(cur[6], k.v[6], e)]; } return cur; };
  const aim = (c, sx = 0, sy = 0) => { st.camera.setViewOffset(W, H, -sx, c[6] - sy, W, H); st.look(c[0], c[1], c[2], c[3], c[4], c[5]); st.camera.updateMatrixWorld(); };

  // ---- the town at one moment of a part ---------------------------------------------------------------------------------
  const NONE = { a: -1, f: -1, e: -1 }, since = (t, a) => (a === undefined || t < a ? -1 : t - a);
  const walkTo = (pts, u) => { const p = along(pts, clamp(u)); return [p.x, p.z, p.r, u > 0 && u < 1]; };
  function world(m, t, TT) {
    const S = { li: -1, t: TT, u: -1, clear: -1, wild: false, plans: [NONE, NONE, NONE] }, tw = { done: 0, build: -1, t: TT, night: 0 }; let night = 0;
    if (m.kind === 'open') { const u = span(t, m.family, m.family + 3.4); if (t > m.family - 0.2) { tw.coat = walkTo([[13.4, 0.6], [9.2, 0.6], [8.6, -0.2]], u); tw.parent = walkTo([[13.9, 1.2], [9.9, 1.2], [9.3, 0.5]], u); } tw.bees = 1; }
    if (m.kind === 'end') { tw.done = 6; tw.kids = 99; night = t < m.back ? ease(span(t, m.dusk[0], m.dusk[1])) : 1 - ease(span(t, m.day[0], m.day[1])); tw.coat = [5.6, -5.2, 0.6, false]; }
    if (m.kind === 'level') {
      const { li, v, slotOf, seq } = m, TS = TEST[li], pick = v.pick; S.li = li; S.wild = li >= 3; tw.done = li; tw.build = since(t, m.build0); S.u = since(t, m.test0);
      S.plans = [0, 1, 2].map((d) => { const s = slotOf[d], p = { a: -1, f: -1, e: -1 };
        if (seq) {
          // a plan is shown while its card is read, and again during its own turn in the test
          if (t >= m.read[s][0] && t < m.read[s][1] + 0.3) { p.a = t - m.read[s][0]; p.f = since(t, m.read[s][1] - 0.15); }
          const e = t - m.turn[d]; if (e >= 0 && e < TS.each) { p.a = e; p.e = e; p.f = since(e, TS.each - 0.4); }
        } else {
          p.a = since(t, m.land[s]); p.e = since(t, m.test0); p.f = since(t, d === pick ? m.build0 - 0.35 : m.fold + 0.15 + s * 0.12);
          if (m.retry !== undefined && t >= m.try0) { if (d === m.retry) { p.a = since(t, m.land2); p.e = since(t, m.test2); p.f = since(t, m.keepTap + 0.2); } else p.a = -1; }
        }
        return p; });
      S.clear = m.retry !== undefined && t >= m.try0 ? since(t, m.keepTap + 0.3) : since(t, li === 4 ? m.useTap + 0.3 : m.fold);
      // life in the town after the plan is built, and between the levels
      const iu = span(t, m.inter[0] + 0.3, m.inter[1] - 0.6), HOME = [SPOTS[0][0] + 0.4, SPOTS[0][1] + 1.3];
      if (li === 0 && t > m.wave) { const u = Math.max(span(t, m.wave + 0.4, m.wave + 3), 0); tw.coat = walkTo([HOME, [6.35, -0.6], [4.8, -0.6]], u * 0.6 + iu * 0.4); tw.parent = walkTo([[HOME[0] + 0.5, HOME[1]], [6.9, -0.2], [5.4, -0.1]], u * 0.6 + iu * 0.4); }
      if (li === 1) { if (t > m.wave + 0.6) tw.stroll = true; const u = iu; if (t > m.inter[0]) { tw.coat = walkTo([HOME, [6.35, 0.5], [4.9, 0.5], [4.9, 1.3]], u); tw.parent = walkTo([[HOME[0] + 0.5, HOME[1]], [6.9, 0.55], [5.0, 0.55], [4.6, 1.9]], u); } }
      if (li === 2 && t > m.inter[0]) { tw.coat = [4.6, 2.9, -Math.PI / 2, false]; tw.parent = walkTo([[4.6, -3], [4.6, 2.2]], iu); }
      if (li === 3) { tw.bees = 1; if (t > m.inter[0]) { tw.cart = iu; tw.coat = [4.75, 2.2, 0, false]; tw.parent = [4.6, 2.75, 0, false]; } }
      if (li === 4) { night = Math.max(0, ease(span(t, m.after0 - 0.4, m.after0 + 1.8)) - ease(span(t, m.inter[0] + 2.4, m.inter[0] + 4.2))); if (night > 0.5) { tw.coat = [HOME[0], HOME[1] + 0.25, 0, false]; tw.cart = -1; } }
      if (li === 5) { tw.kids = since(t, m.wave + 0.5); tw.bell = since(t, m.wave + 0.2); }
    }
    const R = tests(S); night = Math.max(night, R.night); Object.assign(tw, R.town, { night }); town(tw); isle.light(night, R.dim);
    return { night, R };
  }
  // the last shot: the drone leaves a roof in Drone City and flies towards Eco Town
  const flyDrone = (m, t, TT) => { drone.g.scale.setScalar(1); if (m.kind !== 'end' || t < m.back) return; const u = inOutSine(span(t, m.back + 0.6, m.dur + 2.5)), a = [3, 17, -20], b = [8.6, 6, -0.5]; drone.g.visible = true; drone.g.position.set(lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * 5 + Math.sin(TT * 2.4) * 0.15, lerp(a[2], b[2], u)); drone.g.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2]); drone.g.scale.setScalar(2.2); };

  // ---- getting a part ready: the dock is measured at the moments the camera must allow for, and the taps are found --------
  let cur = null;
  function enter(m) {
    const prev = segs[segs.indexOf(m) - 1]; if (prev && !prev.prepared) enter(prev);
    cur = m; ui.enter(m); if (m.prepared) return; m.prepared = true;
    // a bubble shrinks away only when no other line follows it at once
    m.says.forEach((e) => { e.last = !m.says.some((o) => o !== e && Math.abs(o.a - e.b) < 0.06); });
    const docks = { low: 575 }; for (const [name, time] of Object.entries(m.probes)) { ui.draw(m, time, m.start + time, null); docks[name] = ui.dockTop(); }
    m.docks = docks;
    m.cams.forEach((k) => { k.v = full(k.view, k.probe === 'none' ? 'none' : docks[k.probe] ?? 575); });
    m.cams.unshift({ t: -1, dur: 0, v: prev ? prev.cams[prev.cams.length - 1].v : full('world', 'none') });
    // each tap is found on the screen as it is just before the tap
    for (const tp of m.taps) { aim(camAt(m, tp.t)); ui.draw(m, tp.t - 0.02, m.start + tp.t, null); tp.xy = ui.find(m, tp.what); }
    // the small pictures of the end of a test, for the plans that are cleared away and for the first plan of a second try
    if (m.kind === 'level') { const tv = THUMB_VIEW[m.li]; m.thumbs = [null, null, null];
      if (tv) [0, 1, 2].forEach((d) => { if (!m.seq && d !== m.v.pick) return; const tt = m.seq ? m.stamp[d] + 0.25 : m.test1 - 0.2; world(m, tt, m.start + tt); aim(full(tv[d], 'none')); st.draw(isle.scene); m.thumbs[d] = ui.snap(st.renderer.domElement); }); ui.thumbs(m); }
  }

  function frame(m, t, TT) {
    const { night } = world(m, t, TT); flyDrone(m, t, TT);
    // the picture shakes by two pixels when the test button is pressed, and for the first two landings of a build
    let sx = 0, sy = 0; if (m.kind === 'level') for (const [a, amt] of [[m.testTap + 0.07, 2], [m.build0 + 0.3 + 0.3, 2]]) { const s = shake(t - a, amt, 180); sx += s[0]; sy += s[1]; }
    aim(camAt(m, t), sx, sy); st.draw(isle.scene);
    const fx = []; ui.draw(m, t, TT, fx, night); drawFx(fxc, W, H, fx, t, night);
  }
  function seek(TT) { TT = clamp(TT, 0, duration - 0.001); const m = segs.find((x) => TT < x.start + x.dur) || segs[segs.length - 1]; if (m !== cur) enter(m); frame(m, TT - m.start, TT); }
  return { duration, segs, seek, name: (m) => (m.kind === 'open' ? T.name : m.kind === 'end' ? D.ui.jobsTitle : `${m.li + 1}. ${m.v.name}`) };
}
