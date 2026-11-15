// Robot training (docs/MODULES.md, module "robots"). At a workshop bench the child shows a recycling robot examples,
// tests it on a tray kept apart, reads why it missed some, adds examples that fill those gaps and tests again. Then the
// robot works in their own town. The learning is real and small: learn.js (nearest example by shared features).
// Nothing is typed. The test tray is never shown as examples, and the street things are in neither: learn.js keeps
// the four sets apart, so "kept apart" and "new" are always true.
import { binsFor, featuresFor, featsOn, makeTray, makeStreet, runTest, examplesOf, cleanSaved, shelf, starsFor, seedFrom, kind, MAX_TESTS } from './learn.js';
import { record, stageLine } from './words.js';
import { chartSvg } from './pictures.js';
import { spot } from './spot.js';
import { createBench, css } from './bench.js';
import { buildScene, townScene, hideTownShows } from './street.js';

const seedOf = (town, plays) => (seedFrom((town?.cells || []).map(([k, c]) => `${k}:${c?.item || c?.mark || ''}`).join('|') || 'empty') + plays * 7919) >>> 0;

export default {
  id: 'robots', icon: '🤖',
  title: { j: 'Robot training', s: 'Robot training' },
  blurb: { j: 'Teach a robot by showing it examples, then test it.', s: 'Train a sorting robot by example, test it and fill the gaps.' },
  css,
  async run(ctx) {
    const junior = !!ctx.junior; const feats = featuresFor(junior); const bins = binsFor(junior); const plays = Number.isInteger(ctx.saved?.plays) ? ctx.saved.plays : 0;
    const st = cleanSaved(ctx.saved, junior) || { v: 2, j: junior, seed: seedOf(ctx.town, plays), rounds: [[]], tests: 0, stage: 'teach', off: [] };
    const tray = makeTray(st.seed, junior);
    const testAt = (n) => runTest(tray, examplesOf(st.rounds, n), feats);             // test n used the examples of rounds 1 to n
    const allTests = () => Array.from({ length: st.tests }, (_, i) => testAt(i + 1));
    const shownBy = () => Array.from({ length: st.tests }, (_, i) => examplesOf(st.rounds, i + 1).length);
    const keep = () => ctx.save({ ...st, plays, rounds: st.rounds.map((r) => [...r]), off: [...st.off] });
    const ui = createBench(ctx, { junior, feats, bins });
    let sum = null; let sp = null;
    while (!ctx.signal.aborted) {
      if (st.stage === 'teach') {
        const round = st.rounds.length - 1; ctx.report({ stage: stageLine('teach', { round }) });
        // the stars follow the examples as they are added: a thing is starred while it would still fix something in the test
        const stars = () => { const ex = examplesOf(st.rounds); return starsFor(runTest(tray, ex, feats), ex, feats, junior); };
        await ui.teach(st, { stars, onChange: keep }); st.stage = 'test'; keep();
      } else if (st.stage === 'test') {
        const n = st.tests + 1; ctx.report({ stage: stageLine('test', { test: n }) });
        await ui.test(testAt(n), n, n > 1 ? testAt(n - 1) : null); st.tests = n; st.stage = n === 1 ? 'review' : 'result'; keep();
      } else if (st.stage === 'review') {
        const t = testAt(1); ctx.report({ stage: stageLine('review', t) });
        await ui.review(t, examplesOf(st.rounds, 1)); st.rounds.push([]); st.stage = 'teach'; keep();
      } else if (st.stage === 'result') {
        const all = allTests(); const last = all[all.length - 1]; ctx.report({ stage: stageLine('result', { first: all[0].right, right: last.right, of: last.of }) });
        const canMore = st.tests < MAX_TESTS && last.right < last.of && shelf(examplesOf(st.rounds), 1, junior).length > 0;
        const choice = await ui.result(all, shownBy(), examplesOf(st.rounds), canMore, junior ? null : { tray, off: st.off, onChange: keep });
        if (choice === 'more' && canMore) { st.rounds.push([]); st.stage = 'teach'; } else st.stage = 'street';
        keep();
      } else {
        ctx.report({ stage: stageLine('street') });
        sp = spot(ctx.town.cells, ctx.town.terrain); const still = !!ctx.settings.reduceMotion;
        const scene = sp ? buildScene(ctx.engine, sp, bins.map((b) => b.id), { still }) : null;
        hideTownShows(true); ctx.onLeave(() => { scene?.remove(); hideTownShows(false); });
        if (scene) ctx.engine.onFrame((dt, t) => { scene.update(); scene.view(ctx.engine.camera, t); });
        const res = runTest(makeStreet(st.seed, junior), examplesOf(st.rounds), featsOn(junior, st.off));
        // the caption's button never waits for the robot: a second press finishes its move at once
        await ui.street(res.results, (r, done) => { if (scene) scene.sortOne(r.kind, r.got, done); else done(); }, () => scene?.finish());
        sum = { right: res.right, asked: res.asked, wrong: res.of - res.right - res.asked, of: res.of };
        break;
      }
    }
    if (!sum) return { finished: false };
    const all = allTests(); const last = all[all.length - 1]; const tuned = st.off.length ? runTest(tray, examplesOf(st.rounds), featsOn(junior, st.off)) : null;
    const rec = record({ rounds: st.rounds, tests: all, street: sum, bins: bins.length, beside: sp?.beside, tune: tuned ? { off: st.off, right: tuned.right, of: tuned.of } : null });
    ctx.report({ stage: `Robot trained: ${all[0].right} of ${last.of}, then ${last.right} of ${last.of}`, state: 'finished', finished: true });
    ctx.save({ v: 2, plays: plays + 1 }); // the next visit starts a new robot, with a different tray
    return {
      finished: true,
      record: { made: { title: rec.title, lines: rec.lines, picture: chartSvg({ tests: all, shown: shownBy(), street: sum }) }, practised: rec.practised },
      town: { kind: 'recycling-robot', data: { key: sp?.key || null, bins: bins.map((b) => b.id), things: st.rounds.flat().slice(0, 16), right: last.right, of: last.of } },
    };
  },
  // The trained robot at work in the town: scenery only. If the island has nowhere for it to stand, nothing is drawn.
  show(townCtx, data) {
    const ids = (Array.isArray(data?.bins) ? data.bins : []).filter((b) => binsFor(false).some((x) => x.id === b)); if (!ids.length) return () => {};
    const sp = spot(townCtx.town.cells, townCtx.town.terrain, typeof data.key === 'string' ? data.key : null); if (!sp) return () => {};
    return townScene(townCtx.engine, sp, ids, (Array.isArray(data.things) ? data.things : []).filter((id) => kind(id)), !!townCtx.reduceMotion);
  },
};
