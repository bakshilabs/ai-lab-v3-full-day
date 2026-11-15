// Robots at work (docs/MODULES.md, module "robots"; docs/curriculum.md, section 3). One hour, six missions, each a
// different real job robots do and a different real skill: sensors and the sense–think–act loop, a robot arm program,
// hospital safety rules, a recycling sorter trained by example, a weeding robot's confidence threshold, and a flood
// rescue robot designed, tested and improved. Progress is saved after every mission (and inside missions); run()
// resolves finished only when all six are done. Nothing is typed; Florence's lines are built from fixed words.
import { binsFor, kind } from './learn.js';
import { spot } from './spot.js';
import { townScene } from './street.js';
import { css as benchCss } from './bench.js';
import { css as hourCss } from './css.js';
import { createShell } from './shell.js';
import { MISSIONS, mission, cleanProgress, open, allDone, stageOf } from './missions.js';
import { showMap, showBrief, showDone } from './hour.js';
import { hourRecord, hourPicture } from './record.js';
import { playM1 } from './m1-ui.js';
import { playM2 } from './m2-ui.js';
import { playM3 } from './m3-ui.js';
import { playM4, rememberCamera } from './m4-sorter.js';
import { playM5 } from './m5-ui.js';
import { playM6 } from './m6-ui.js';

const PLAY = { 1: playM1, 2: playM2, 3: playM3, 5: playM5, 6: playM6 };

export default {
  id: 'robots', icon: '🤖',
  title: { j: 'Robots at work', s: 'Robots at work' },
  blurb: { j: 'Six robot jobs: sensors, arms, rules, sorting, weeding and rescue.', s: 'Sense, think, act: six real robot jobs and the skills behind them.' },
  css: benchCss + hourCss,
  async run(ctx) {
    const j = !!ctx.junior; const prog = cleanProgress(ctx.saved, j);
    const keep = () => ctx.save(prog);
    const sh = createShell(ctx); rememberCamera(ctx);
    let townData = prog.town || null; // the recycling robot left in the town (from mission 4)
    let direct = null; // "Next mission" on a closing card goes straight to the next mission's opening card
    while (!ctx.signal.aborted) {
      let n = direct; direct = null;
      if (!n) {
        ctx.report({ stage: 'Choosing a mission' });
        const pickd = await showMap(ctx, sh, prog);
        if (ctx.signal.aborted) break;
        if (pickd.finish && allDone(prog.done)) break;
        n = pickd.go;
      }
      const m = mission(n); if (!m || !open(prog.done, n)) continue;
      const again = !!prog.done[n - 1]; const resume = prog.cur?.n === n ? prog.cur : null;
      if (!resume) { ctx.report({ stage: stageOf(n, 'reading the job') }); const a = await showBrief(ctx, sh, m, again); if (a === 'map' || ctx.signal.aborted) continue; }
      if (n === 4 && !(resume && prog.m4)) { prog.m4 = null; prog.r4 = (prog.r4 || 0) + 1; }
      prog.cur = resume || { n, part: 0, d: {} }; keep();
      let sum = null;
      if (n === 4) {
        const out = await playM4(ctx, sh, prog.m4, (s) => { prog.m4 = s; keep(); }, prog.plays * 5 + (prog.r4 || 0));
        if (out) { sum = out.sum; townData = out.town; prog.town = out.town; prog.m4 = null; }
      } else {
        sum = await PLAY[n](ctx, sh, prog.cur, (part, d) => { prog.cur = { n, part, d }; keep(); });
      }
      if (!sum || ctx.signal.aborted) break;
      prog.done[n - 1] = 1; prog.sum[n] = sum; prog.cur = null; keep();
      ctx.report({ stage: stageOf(n, 'done') });
      const a = await showDone(ctx, sh, m, sum, prog);
      if (a === 'next') { const nx = prog.done.findIndex((x) => !x) + 1; if (nx > 0) direct = nx; }
    }
    if (ctx.signal.aborted || !allDone(prog.done)) return { finished: false };
    const rec = hourRecord(prog, j);
    ctx.report({ stage: 'All six missions done', state: 'finished', finished: true });
    prog.plays += 1; keep(); // the next sorter visit starts a new robot with a different tray; the six ticks stay
    return {
      finished: true,
      record: { made: { title: rec.title, lines: rec.lines, picture: hourPicture(prog.done) }, practised: rec.practised },
      town: townData ? { kind: 'recycling-robot', data: townData } : undefined,
    };
  },
  // The trained recycling robot at work in the town: scenery only. If the island has nowhere for it to stand, nothing is drawn.
  show(townCtx, data) {
    const ids = (Array.isArray(data?.bins) ? data.bins : []).filter((b) => binsFor(false).some((x) => x.id === b)); if (!ids.length) return () => {};
    const sp = spot(townCtx.town.cells, townCtx.town.terrain, typeof data.key === 'string' ? data.key : null); if (!sp) return () => {};
    return townScene(townCtx.engine, sp, ids, (Array.isArray(data.things) ? data.things : []).filter((id) => kind(id)), !!townCtx.reduceMotion);
  },
};
export { MISSIONS };
