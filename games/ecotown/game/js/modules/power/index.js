// "Power control room": one hour of Eco Town of the future (docs/MODULES.md; docs/curriculum.md section 6).
// Six missions, each a different real use of a power control room, each a different skill:
//   1 the grid must balance (m1-*)   2 forecasting (m2-*)     3 storage (m3-*)
//   4 automation rules (m4-play.js: the first version of this module)   5 smart demand (m5-*)   6 storm night (m6-*)
// The mission map and the cards around each mission: map.js. The page they all play on: shell.js. The six missions
// and what is saved: missions.js. What is left in the town: town.js. Styles: css.js.
import { kitFrom } from './model.js';
import { css } from './css.js';
import { createDesk } from './shell.js';
import { MISSIONS, cleanProgress, packProgress, allDone, madeTitle, recordLines, practisedLines } from './missions.js';
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

// What each mission hands back becomes a small result (kept in the save) and a few lines for its "done" card.
const PLAY = {
  balance: async (d) => { const r = await playBalance(d); return { res: r, lines: [d.j ? `${r.level} of ${r.of} ten-minute steps level.` : `${r.level} of ${r.of} steps balanced at 50 Hz.`] }; },
  forecast: async (d) => { const r = await playForecast(d); return { res: r, lines: [d.j ? `Three forecasts read. ${r.spells} short spells found.` : `Three forecasts read; ${r.spells} shortfall spells found${r.kwh ? ' and sized in kWh' : ''}.`] }; },
  storage: async (d, st, save) => { const r = await playStorage(d, st, save); return { res: r, lines: r.dark.map((x, n) => (d.j ? `Day ${n + 1}: ${x} dark hours.` : `Day ${n + 1}: ${x} home-hours unsupplied.`)) }; },
  rules: async (d, st, save) => { const r = await playRules(d, st, save); return { res: { share: r.share, diff: r.diff }, lines: [d.j ? `${st.rules.list.length} rules. Homes lit on the test days: ${r.share}%.` : `${st.rules.list.length} rules; ${r.share}% of home-hours supplied across the test days.`] }; },
  demand: async (d) => { const r = await playDemand(d); return { res: r, lines: [d.j ? `${r.moved} jobs moved to spare wind and sun.` : `${r.moved} jobs moved; ${r.kwh} kWh of flexible demand shifted to surplus renewables.`] }; },
  storm: async (d) => { const r = await playStorm(d); return { res: r, lines: [d.j ? 'The broken line was cut off, the safe places came first, and everyone is back.' : `Fault isolated, priority load first, all supply restored${r.trips ? ` (${r.trips} trip${r.trips === 1 ? '' : 's'} on the way)` : ' with no trips'}.`] }; },
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
    if ((await briefing(d, i)) !== 'start') { go = await missionMap(d, p); continue; }
    const out = await PLAY[m.id](d, st, save);
    p.res[m.id] = out.res; p.done[i] = true; save();
    const a = await debrief(d, i, out.lines, p);
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
