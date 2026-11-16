// "Power control room": one hour of Eco Town of the future (docs/MODULES.md; docs/curriculum.md section 6).
// Six missions, each a different real use of a power control room, each a different skill:
//   1 the grid must balance (m1-*)   2 forecasting (m2-*)     3 storage (m3-*)
//   4 automation rules (m4-play.js: the first version of this module)   5 smart demand (m5-*)   6 storm night (m6-*)
// The mission map and the cards around each mission: map.js. The page they all play on: shell.js. The six missions
// and what is saved: missions.js. What is left in the town: town.js. Styles: css.js.
import { kitFrom } from './model.js';
import { css } from './css.js';
import { createDesk } from './shell.js';
import { MISSIONS, cleanProgress, packProgress, allDone, madeTitle, recordLines, practisedLines, doneLines } from './missions.js';
import { missionMap, briefing, debrief } from './map.js';
import { playBalance } from './m1-play.js';
import { playForecast } from './m2-play.js';
import { playStorage } from './m3-play.js';
import { playRules } from './m4-play.js';
import { playDemand } from './m5-play.js';
import { playStorm } from './m6-play.js';
import { hourPicture } from './chart.js';
import { show } from './town.js';
import { T } from './words.js';

// What each mission hands back: a small result (kept in the save). The "done" card's lines: doneLines in missions.js.
// rs: where to start (a mission left part-way resumes at its next round) and what to keep after each round.
const PLAY = {
  balance: (d, st, save, rs) => playBalance(d, rs),
  forecast: (d, st, save, rs) => playForecast(d, rs),
  storage: (d, st, save, rs) => playStorage(d, st, save, rs),
  rules: async (d, st, save) => { const r = await playRules(d, st, save); return { share: r.share, diff: r.diff, lit: r.cmp.test.litHours, total: r.cmp.test.total }; }, // its rules are saved as they change
  demand: (d, st, save, rs) => playDemand(d, rs),
  storm: (d, st, save, rs) => playStorm(d, rs),
};

async function run(ctx) {
  const j = !!ctx.junior;
  const kit = kitFrom(ctx.town?.cells, ctx.town?.terrain?.tiles);
  const p = cleanProgress(ctx.saved, j);
  // the state mission 4 works on (and mission 3 leaves for it: the day run by hand)
  const st = { hand: p.hand, rules: p.rules, tests: 0, changed: p.changed, improved: p.improved, test: null, prev: null, tested: null };
  const save = () => ctx.save(packProgress({ ...p, hand: st.hand, rules: st.rules, changed: st.changed, improved: st.improved }));
  const d = createDesk(ctx, kit);
  let go = await missionMap(d, p);
  while (go !== 'finish') {
    const i = go; const m = MISSIONS[i];
    const cur = p.cur && p.cur.id === m.id ? p.cur : null;
    if ((await briefing(d, i, cur?.round || 0)) !== 'start') { go = await missionMap(d, p); continue; }
    // progress is saved after every round, so a child who leaves part-way comes back to the next round
    const rs = { from: cur?.round || 0, part: cur?.part || null, done: (round, part) => { p.cur = { id: m.id, round, part }; save(); } };
    const res = await PLAY[m.id](d, st, save, rs);
    p.res[m.id] = res; p.done[i] = true; p.cur = null; save();
    const a = await debrief(d, i, doneLines(m.id, res, j, st.rules.list.length), p);
    if (a === 'finish') break;
    if (a === 'next') { const n = p.done.findIndex((x) => !x); go = n >= 0 ? n : await missionMap(d, p); continue; }
    go = await missionMap(d, p);
  }
  if (!allDone(p.done)) return { finished: false };
  d.report('Finished: all six missions'); save();
  return {
    finished: true,
    record: { made: { title: madeTitle(j), lines: recordLines({ ...p, rules: st.rules }, j), picture: hourPicture(p, j) }, practised: practisedLines(p, j) },
    town: { kind: 'power-rules', data: { v: 1, rules: st.rules } },
  };
}

export default {
  id: 'power', icon: '⚡',
  title: T.title,
  blurb: { j: 'Keep the lights on: balance, forecast, store, write rules, and a storm night.', s: 'Run a town’s power: balance, forecast, storage, rules, demand, a storm.' },
  css, run, show,
};
