// "Self-driving cars": one module of Eco Town of the future (docs/MODULES.md), grown to an hour of six missions
// (docs/curriculum.md, section 4). The mission map opens first; missions open in order and a finished one can be
// played again. Progress is saved after every mission. run() resolves finished only when all six are done.
//
// Files: missions.js (the list, what is kept, the record), kit.js (shared panels, 3D set, camera, guards),
// shell.js (each mission's opening and closing cards), m1-sensors … m6-street (one per mission, each with a pure
// rules file: sensors, labels, rules, simtest, fleet, street + words), art.js (2D pictures), scene.js and town.js (3D).
import { MISSIONS, cleanHub, openable, nextUp, allDone, streetResult, hourLines, hourPractised, hourTitle, hourPicture } from './missions.js';
import { makeKit, esc } from './kit.js';
import { opening, closing } from './shell.js';
import { sensorsMission } from './m1-sensors.js';
import { labelsMission } from './m2-labels.js';
import { rulesMission } from './m3-rules.js';
import { simMission } from './m4-sim.js';
import { fleetMission } from './m5-fleet.js';
import { streetMission } from './m6-street.js';
import { m1Line, SENSOR } from './sensors.js';
import { m2Line } from './labels.js';
import { m3Line } from './rules.js';
import { m4Line } from './simtest.js';
import { m5Line } from './fleet.js';
import { crossings } from './street.js';
import { T } from './words.js';
import { css } from './style.js';
import { show } from './town.js';

async function run(ctx) {
  const j = !!ctx.junior; const families = Math.max(0, Math.round(ctx.town?.sim?.families || 0));
  const S = cleanHub(ctx.saved, j); const save = () => ctx.save(S);
  const K = makeKit(ctx); const { say, swap } = K;
  const street = () => (S.m6 ? streetResult(S.m6, families, j) : null);

  // what each mission did, in one or two lines for its closing card
  const doneLines = (n, r) => {
    if (n === 1) return [m1Line(r, j), j ? `Sensors fitted: ${r.kit.map((s) => SENSOR[s].name).join(', ')}.` : `Coverage gaps left: ${r.gaps}.`];
    if (n === 2) return [m2Line(r, j)];
    if (n === 3) return [m3Line(r, j)];
    if (n === 4) return [m4Line(r, j)];
    if (n === 5) return [m5Line(r, j)];
    const s = street(); return s ? hourLines({}, j, s).slice(-1) : [];
  };
  async function play(n) {
    const m = MISSIONS[n - 1]; K.reset(); K.showStage(null);
    // the street as it is today (parked cars along both kerbs) behind mission 6's opening, unless a street was already designed
    if (n === 6) { const fresh = !street()?.layout.includes('drop'); K.set.setOld(fresh); K.set.setPlots('full'); K.set.setLayout(fresh ? Array(10).fill(null) : street().layout); }
    await opening(K, m); K.reset();
    let r;
    if (n === 1) r = await sensorsMission(K);
    if (n === 2) r = await labelsMission(K);
    if (n === 3) r = await rulesMission(K);
    if (n === 4) r = await simMission(K);
    if (n === 5) r = await fleetMission(K);
    if (n === 6) { const s = await streetMission(K, S.m6, (state) => { S.m6 = state; save(); }, { skipIntro: true }); r = { runs: s.runs }; }
    K.reset(); K.set.root.visible = true; K.set.setOld(false); K.set.setLayout(street() ? street().layout : Array(10).fill(null));
    S.done[n - 1] = true; S.rec[n] = r; save();
    await closing(K, m, doneLines(n, r));
  }

  // ---- the mission map
  async function hub() {
    const can = openable(S.done); const next = nextUp(S.done); const all = allDone(S.done);
    ctx.report({ stage: all ? 'All six missions done' : `Mission map: next is mission ${next}` });
    K.reset(); K.setView(K.views.street);
    K.showStage(`<div class="rd-hub"><h2>${j ? 'Self-driving cars: six missions' : 'Self-driving cars: six missions'}</h2><ol class="rd-missions">${MISSIONS.map((m, i) => {
      const state = S.done[i] ? 'done' : i + 1 === next ? 'next' : 'locked';
      return `<li><button type="button" class="rd-mis ${state}" data-mission="${m.n}" data-act="m${m.n}" ${can[i] ? '' : 'disabled'} aria-label="Mission ${m.n}: ${esc(m.use)}. ${state === 'done' ? 'Done. Play again.' : state === 'next' ? 'Next.' : 'Opens after the mission before it.'}"><span class="rd-mn" aria-hidden="true">${m.n}</span><span class="ico" aria-hidden="true">${m.icon}</span><span class="rd-mt">${esc(m.use)}</span><span class="rd-ms" aria-hidden="true">${state === 'done' ? '✓ Done' : state === 'next' ? '▶ Next' : '🔒'}</span></button></li>`; }).join('')}</ol></div>`);
    const doneN = S.done.filter(Boolean).length;
    say(all ? (j ? 'All six missions done! Press Finish to see what you made. Or play any mission again.' : 'All six missions complete. Finish to see the record, or replay any mission.') : doneN ? (j ? `${doneN} of 6 missions done. Carry on with mission ${next}.` : `${doneN} of 6 complete. Next: mission ${next}.`) : (j ? 'Six missions with self-driving cars. Each is a real job. Start with mission 1.' : 'Six missions, each a real job with self-driving cars. Start with mission 1.'));
    swap(`<div class="rd-row end"><p class="rd-hint">${doneN ? (j ? 'Tap a finished mission to play it again.' : 'Select a finished mission to replay it.') : (j ? 'The missions open one by one.' : 'Missions open in order.')}</p>${all ? '<button class="go" type="button" data-primary data-act="finish">Finish ➜</button>' : `<button class="go" type="button" data-primary data-act="m${next}">Carry on: mission ${next} ➜</button>`}</div>`);
    const act = await K.press();
    return act === 'finish' ? 'finish' : Number(act.slice(1));
  }

  K.measure();
  for (;;) {
    const go = await hub();
    if (go === 'finish') break;
    if (go >= 1 && go <= 6) await play(go);
  }
  K.showStage(null);
  const s = street();
  return {
    finished: true,
    record: { made: { title: hourTitle(j), lines: hourLines(S.rec, j, s), picture: hourPicture(s, j) || undefined }, practised: hourPractised(S.rec, j, s) },
    town: s ? { kind: 'roads-street', data: { layout: s.layout, plots: s.plots, safe: crossings(s.layout, j).filter((c) => c.safe).length } } : null,
  };
}

export default {
  id: 'roads', icon: '🚗',
  title: T.title,
  blurb: { j: 'Six missions with self-driving cars: see, learn, test, plan.', s: 'Six real jobs with autonomous cars: sensors, data, rules, testing, fleets, streets.' },
  css, run, show,
};
