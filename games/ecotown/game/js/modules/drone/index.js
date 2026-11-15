// Drones at work (docs/MODULES.md, docs/curriculum.md section 2): one hour of six missions, each a different real use
// of drones and a different real skill. A mission map opens them in order; a finished one can be played again.
// Progress is saved after every mission. run() resolves finished only when all six are done.
//   missions.js            the six missions, progress and the record (pure)
//   kit.js                 the mission map and the cards that open and close each mission
//   m1-ground.js / m1-ui.js     1. ground school: pre-flight checks and the airspace map
//   m2-hand.js / m2-run.js      2. hand flying in the wind (fly3d.js: flying with height and wind)
//   m3-delivery.js              3. delivery: the first version of this module (route.js, flight.js, ui.js, picture.js)
//   m4-survey.js / m4-ui.js     4. farm survey: survey lines, overlap and reading the map
//   m5-inspect.js / m5-run.js   5. inspection: a turbine and a bridge, a safe distance, finding cracks
//   m6-rescue.js / m6-ui.js     6. search and rescue: the heat camera, a search pattern, guiding the team
import { IDS, restoreHour, isOpen, allDone, finishMission, hourRecord, hourPicture } from './missions.js';
import { routeStillThere } from './route.js';
import { createUi, CSS } from './ui.js';
import { createKit, makeScope, KIT_CSS } from './kit.js';
import { runGround, M1_CSS } from './m1-ui.js';
import { runSurvey, M4_CSS } from './m4-ui.js';
import { runRescue, M6_CSS } from './m6-ui.js';
import { FLY_CSS } from './fly-css.js';
import { M5_CSS } from './m5-css.js';

const tileList = (terrain) => (terrain?.tiles instanceof Map ? [...terrain.tiles.values()] : [...(terrain?.tiles || [])]);

export default {
  id: 'drone', icon: '🚁',
  title: { j: 'Drones at work', s: 'Drones at work' },
  blurb: { j: 'Six real drone jobs, from safety checks to search and rescue.', s: 'Six real drone jobs: checks, flying, delivery, mapping, inspection, rescue.' },
  css: CSS + KIT_CSS + M1_CSS + FLY_CSS + M4_CSS + M5_CSS + M6_CSS,

  async run(ctx) {
    const junior = !!ctx.junior; const reduce = !!ctx.settings.reduceMotion;
    const ui = createUi(ctx, { reduce }); ctx.onLeave(() => ui.off());
    const kit = createKit(ctx, { reduce });
    let st = restoreHour(ctx.saved); const save = () => ctx.save(st);
    let scope = null; ctx.onLeave(() => scope?.end());
    // While the map and the cards are up, the camera looks over the island (turning slowly, or still).
    const overview = () => {
      const { camera } = ctx.engine; let a = 0.35;
      ctx.engine.onFrame((dt) => { if (!reduce) a += dt * 0.03; camera.position.set(Math.sin(a) * 92, 72, Math.cos(a) * 92); camera.lookAt(0, 0, -2); if (camera.fov !== 45) { camera.fov = 45; camera.updateProjectionMatrix(); } });
    };
    const play = async (id, sc) => {
      if (id === 'ground') return runGround(ctx, kit, sc);
      if (id === 'hand') { const { runHand } = await import('./m2-run.js'); return runHand(ctx, ui, sc, { touch: ui.touch }); }
      if (id === 'delivery') {
        const { runDelivery } = await import('./m3-delivery.js');
        const r = await runDelivery(ctx, ui, sc, { saved: st.m3, keep: (m3) => { st = { ...st, m3 }; save(); } });
        return r && { ...r, extra: { m3: r.m3, town: r.town } };
      }
      if (id === 'survey') return runSurvey(ctx, kit, sc);
      if (id === 'inspect') { const { runInspect } = await import('./m5-run.js'); return runInspect(ctx, ui, kit, sc, { touch: ui.touch }); }
      if (id === 'rescue') return runRescue(ctx, kit, sc);
      return null;
    };
    let first = !st.done.length;
    for (;;) {
      ctx.report({ stage: allDone(st) ? 'Drones at work: all six missions done' : `Drones at work: the mission map (${st.done.length} of 6 done)` });
      overview(); ui.setStage('map');
      const pick = await kit.hub(st, { first }); first = false;
      if (pick.act === 'finish') break;
      let id = pick.id; let finish = false;
      while (id && isOpen(st, id)) {
        ui.setStage('open'); await kit.opening(id);
        scope = makeScope(); let res = null;
        try { res = await play(id, scope); } finally { scope.end(); scope = null; }
        overview(); ui.setStage('close');
        if (!res) break;
        st = finishMission(st, id, res.sum, res.extra || {}); save();
        const i = IDS.indexOf(id); const k = await kit.closing(id, res.lines || [], { last: i === IDS.length - 1, finish: allDone(st) });
        if (k === 'finish') { finish = true; break; }
        id = k === 'next' ? IDS[i + 1] : null;
      }
      if (finish) break;
    }
    ctx.report({ stage: 'Drones at work: all six missions done', state: 'finished', finished: true });
    return { finished: true, record: hourRecord(st, junior, hourPicture(st)), ...(st.town ? { town: { kind: 'drone-route', data: st.town } } : {}) };
  },

  // The delivery route keeps flying in the town: a large drone going there and back along the steps the child wrote.
  show(townCtx, data) {
    const tiles = tileList(townCtx.town?.terrain); const tileKeys = new Set(tiles.map((t) => t.k));
    if (!routeStillThere(data, townCtx.town?.cells, tileKeys)) return () => {}; // the place is gone: draw nothing
    let off = null; let dead = false;
    import('./flight.js').then((m) => { if (!dead) off = m.showRoute(townCtx, data, tileKeys); }).catch((e) => console.error('drone route:', e));
    return () => { dead = true; off?.(); off = null; };
  },
};
