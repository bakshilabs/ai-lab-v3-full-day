// Mission 4, the recycling sorter (the first ten-minute loop, kept): show examples, test on things kept apart, read the
// misses, fill the gaps, test again, then the robot sorts new things in the child's own town (3D).
// The learning is learn.js; the bench page is bench.js; the street scene is street.js.
import { binsFor, featuresFor, featsOn, makeTray, makeStreet, runTest, examplesOf, cleanSaved, shelf, starsFor, seedFrom, MAX_TESTS } from './learn.js';
import { stageLine } from './words.js';
import { spot } from './spot.js';
import { createBench } from './bench.js';
import { buildScene, hideTownShows } from './street.js';

export const seedOf = (town, plays) => (seedFrom((town?.cells || []).map(([k, c]) => `${k}:${c?.item || c?.mark || ''}`).join('|') || 'empty') + plays * 7919) >>> 0;

// saved: the sorter's own state (learn.js cleanSaved) or null. keep(state): save it.
// Resolves with { sum, town } when the robot has worked in the street, or null if the child left.
export async function playM4(ctx, sh, saved, keep, plays) {
  const junior = !!ctx.junior; const feats = featuresFor(junior); const bins = binsFor(junior);
  const st = cleanSaved(saved, junior) || { v: 2, j: junior, seed: seedOf(ctx.town, plays), rounds: [[]], tests: 0, stage: 'teach', off: [] };
  const tray = makeTray(st.seed, junior);
  const testAt = (n) => runTest(tray, examplesOf(st.rounds, n), feats);
  const allTests = () => Array.from({ length: st.tests }, (_, i) => testAt(i + 1));
  const shownBy = () => Array.from({ length: st.tests }, (_, i) => examplesOf(st.rounds, i + 1).length);
  const save = () => keep({ ...st, rounds: st.rounds.map((r) => [...r]), off: [...st.off] });
  const ui = createBench(ctx, { junior, feats, bins }, sh);
  const pre = (s) => `Mission 4 of 6, recycling: ${s}`.slice(0, 80);
  let sum = null; let sp = null;
  while (!ctx.signal.aborted) {
    if (st.stage === 'teach') {
      const round = st.rounds.length - 1; ctx.report({ stage: pre(stageLine('teach', { round })) });
      const stars = () => { const ex = examplesOf(st.rounds); return starsFor(runTest(tray, ex, feats), ex, feats, junior); };
      await ui.teach(st, { stars, onChange: save }); st.stage = 'test'; save();
    } else if (st.stage === 'test') {
      const n = st.tests + 1; ctx.report({ stage: pre(stageLine('test', { test: n })) });
      await ui.test(testAt(n), n, n > 1 ? testAt(n - 1) : null); st.tests = n; st.stage = n === 1 ? 'review' : 'result'; save();
    } else if (st.stage === 'review') {
      const t = testAt(1); ctx.report({ stage: pre(stageLine('review', t)) });
      await ui.review(t, examplesOf(st.rounds, 1)); st.rounds.push([]); st.stage = 'teach'; save();
    } else if (st.stage === 'result') {
      const all = allTests(); const last = all[all.length - 1]; ctx.report({ stage: pre(stageLine('result', { first: all[0].right, right: last.right, of: last.of })) });
      const canMore = st.tests < MAX_TESTS && last.right < last.of && shelf(examplesOf(st.rounds), 1, junior).length > 0;
      const choice = await ui.result(all, shownBy(), examplesOf(st.rounds), canMore, junior ? null : { tray, off: st.off, onChange: save });
      if (choice === 'more' && canMore) { st.rounds.push([]); st.stage = 'teach'; } else st.stage = 'street';
      save();
    } else {
      ctx.report({ stage: pre(stageLine('street')) });
      sp = spot(ctx.town.cells, ctx.town.terrain); const still = !!ctx.settings.reduceMotion;
      const scene = sp ? buildScene(ctx.engine, sp, bins.map((b) => b.id), { still }) : null;
      hideTownShows(true); let gone = false; const off = () => { if (gone) return; gone = true; scene?.remove(); hideTownShows(false); ctx.engine.onFrame(null); };
      ctx.onLeave(off);
      if (scene) ctx.engine.onFrame((dt, t) => { scene.update(); scene.view(ctx.engine.camera, t); });
      const res = runTest(makeStreet(st.seed, junior), examplesOf(st.rounds), featsOn(junior, st.off));
      await ui.street(res.results, (r, done) => { if (scene) scene.sortOne(r.kind, r.got, done); else done(); }, () => scene?.finish());
      off(); restoreCamera(ctx);
      sum = { right: res.right, asked: res.asked, wrong: res.of - res.right - res.asked, of: res.of };
      break;
    }
  }
  if (!sum) return null;
  const all = allTests(); const last = all[all.length - 1];
  return {
    sum: { ex: examplesOf(st.rounds).length, first: all[0].right, last: last.right, of: last.of, sr: sum.right, so: sum.of, asked: sum.asked },
    town: { key: sp?.key || null, bins: bins.map((b) => b.id), things: st.rounds.flat().slice(0, 16), right: last.right, of: last.of },
  };
}
// After the street scene the module goes back to its own pages: the camera returns to where the loader left it.
let camHome = null;
export function rememberCamera(ctx) { const c = ctx.engine?.camera; if (c?.position?.clone) camHome = { p: c.position.clone(), q: c.quaternion.clone(), fov: c.fov }; }
function restoreCamera(ctx) { const c = ctx.engine?.camera; if (!c || !camHome) return; c.position.copy(camHome.p); c.quaternion.copy(camHome.q); c.fov = camHome.fov; c.updateProjectionMatrix?.(); }
