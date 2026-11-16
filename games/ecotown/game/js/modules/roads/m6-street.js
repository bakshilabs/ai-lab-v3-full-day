// Mission 6, "Redesigning the street" (the module's first ten-minute loop, kept with its review fixes):
// meet the street as it is → place drop-off points, waiting bays and crossings by tapping the 3D street → run the
// morning and read the numbers, each shown on the street where it happened (change it and run again as often as
// wanted) → choose what the freed car park becomes, and test the street with the new homes → ride the street.
// Rules and numbers: street.js. Words: words.js. The 3D set: scene.js. Shared panels and camera: kit.js.
import { SLOTS, JUNCTION, kindsFor, emptyLayout, cleanSaved, place, counts, simulate, land, tripsFor, fleetRange, cleanFleet, goods, grade, nextStep, timeline, stills, clock, USE_IDS } from './street.js';
import { PIECES, USE, T, GRADE, LANDMARKS, pieceName, beside, intro, firstAsk, afterFirst, designAsk, needDrop, noJunction, placed, cleared, fleetSay, runSay, runFast, runCount, stillSay, measures, resultsHead, comment, afterColon, whereSay, marks, landIntro, landSummary, landClose, newHomesAsk, withHomes, rideStops } from './words.js';
import { slotX } from './scene.js';
import { esc, secs } from './kit.js';

export const SEED = 7;                                  // the same morning every run, so two runs can be compared fairly

// K: the kit. saved: this mission's own state from last time (or null). keep(state): save it.
// Resolves with what the record needs: { layout, plots, fleet, runs, changes, rode, extra }.
export async function streetMission(K, saved, keep0, { skipIntro = false } = {}) {
  const { ctx, j, reduce, set, V, views, setView, say, swap, press, tooSoon, tray } = K;
  const families = Math.max(0, Math.round(ctx.town?.sim?.families || 0)); const trips = tripsFor(families);
  const kinds = kindsFor(j); const pick = K.pick;
  const sv = cleanSaved(saved, j);
  const st = { layout: sv ? sv.layout : emptyLayout(), plots: sv ? sv.plots : [null, null, null], runs: sv?.runs || 0, changes: sv?.changes || 0, best: sv?.best || null, fleet: j ? null : cleanFleet(sv?.fleet, trips), built: !!sv?.built, extra: 0, rode: false, res: null, prev: null, kind: 'drop' };
  const keep = (stage) => keep0({ v: 2, stage, layout: st.layout, plots: st.plots, runs: st.runs, changes: st.changes, best: st.best, fleet: st.fleet, built: st.built });
  const report = (id) => ctx.report({ stage: `Street: ${T.stage[id]}` });
  const sim = (extra = st.built ? st.extra : 0) => simulate(st.layout, { families, extraFamilies: extra, seed: SEED, junior: j, fleet: st.fleet });
  K.showStage(null); set.root.visible = true;

  // ================= 1. the street as it is: one screen, then straight to the first drop-off point
  async function meet() {
    report('intro'); set.setOld(true); set.setPlots('full'); set.setLayout(emptyLayout()); set.setMarks(null); setView(views.street, true);
    say(intro(j)); tray.classList.add('slim'); swap(`<div class="rd-row end"><button class="go" type="button" data-primary data-act="next">${pick(T.start)}</button></div>`); await press(); tray.classList.remove('slim');
  }

  // ================= 2. design: the 3D street is the control; the strip under it is a labelled helper
  async function design(first) {
    report('design'); keep(st.built ? 'built' : 'design'); set.setOld(false); set.setPlots(st.built ? { plots: st.plots } : 'full'); set.endRun(); set.setMarks(null); set.setRide(null); set.setNames(true); set.setLayout(st.layout); setView(views.street);
    let coach = first && !st.layout.includes('drop'); st.kind = coach ? 'drop' : st.kind; set.setHint(coach);
    const n = trips + (st.built ? st.extra : 0);
    say(coach ? firstAsk(j, n) : designAsk(j), coach ? '' : pick(PIECES[st.kind].desc));
    swap(`<div class="rd-row rd-pal" role="group" aria-label="Pieces">${kinds.map((k, i) => `<button type="button" data-kind="${k}" ${k === st.kind ? 'data-fallback' : ''} aria-pressed="false"><span class="rd-key" aria-hidden="true">${i + 1}</span><span class="chip" style="background:${PIECES[k].color}" aria-hidden="true">${PIECES[k].letter}</span><span class="ico" aria-hidden="true">${PIECES[k].icon}</span> ${esc(pieceName(k, j))} <i data-n="${k}"></i></button>`).join('')}
        ${j ? '' : `<span class="rd-fleet" role="group" aria-label="${T.fleet}"><span data-fleetn></span><button type="button" data-fleet="-1" aria-label="One car fewer">−</button><button type="button" data-fleet="1" aria-label="One car more">＋</button></span>`}</div>
      <div class="rd-strip"><p class="rd-striphead"><span id="rd-striphead">${T.strip}</span><span class="rd-keys">${T.keys(kinds.length)}</span></p>
        <div class="rd-marks" aria-hidden="true">${LANDMARKS.map((m) => `<span style="grid-column: span ${m.span}"><i>${m.icon}</i>${m.text}</span>`).join('')}</div>
        <div class="rd-slots" role="group" aria-labelledby="rd-striphead">${Array.from({ length: SLOTS }, (_, s) => `<button type="button" data-slot="${s}"></button>`).join('')}</div></div>
      <div class="rd-row end"><p class="rd-hint" aria-live="polite"></p><button type="button" data-act="clear">${T.clear}</button><button class="go" type="button" data-primary data-act="run" ${st.layout.includes('drop') ? '' : 'disabled'}>${pick(T.run)}</button></div>`);
    const hint = tray.querySelector('.rd-hint');
    const draw = () => {
      const c = counts(st.layout);
      for (const b of tray.querySelectorAll('[data-kind]')) { b.setAttribute('aria-pressed', String(b.dataset.kind === st.kind)); b.querySelector('[data-n]').textContent = `× ${c[b.dataset.kind]}`; }
      for (const b of tray.querySelectorAll('[data-slot]')) {
        const s = +b.dataset.slot; const k = st.layout[s]; const jn = s === JUNCTION;
        b.className = jn ? 'no' : k ? 'has' : '';
        b.setAttribute('aria-label', `Place ${s + 1}, by ${beside(s, j).text}: ${jn ? 'nothing can go here' : k ? pieceName(k, j) : 'empty'}`);
        b.innerHTML = `<span class="n" aria-hidden="true">${s + 1}</span><span class="mid" aria-hidden="true">${jn ? '✕' : k ? `<span class="chip" style="background:${PIECES[k].color}">${PIECES[k].letter}</span>${PIECES[k].icon}` : '＋'}</span>`;
      }
      tray.querySelector('[data-act="run"]').disabled = !c.drop; tray.querySelector('[data-act="clear"]').disabled = !c.pieces;
      if (!j) { const r = fleetRange(n); st.fleet = cleanFleet(st.fleet, n); tray.querySelector('[data-fleetn]').textContent = `${st.fleet} shared cars`; tray.querySelector('[data-fleet="-1"]').disabled = st.fleet <= r.min; tray.querySelector('[data-fleet="1"]').disabled = st.fleet >= r.max; }
    };
    const put = (s) => {
      if (s === JUNCTION) { hint.textContent = noJunction(j); ctx.say(noJunction(j)); set.setFocus(s); return; }
      const before = st.layout[s]; st.layout = place(st.layout, s, st.kind); if (st.runs) st.changes++;
      set.setLayout(st.layout); set.setFocus(s); draw(); keep(st.built ? 'built' : 'design');
      hint.textContent = placed(st.kind, s, st.layout[s] === st.kind, j) + (before && st.layout[s] ? ` It replaced the ${pieceName(before, j).toLowerCase()}.` : '');
      if (coach && st.layout.includes('drop')) { coach = false; set.setHint(false); say(afterFirst(j)); }
    };
    const choose = (k) => { st.kind = k; draw(); say(pick(PIECES[k].desc)); };
    const hover = (e) => { const b = e.target.closest?.('[data-slot]'); if (b) set.setFocus(+b.dataset.slot); }; tray.onmouseover = hover; tray.onfocusin = hover;
    draw(); if (!first) hint.textContent = j ? 'Tap a piece on the street again to take it away.' : 'Tap a placed piece again to remove it.';
    K.onStreetTap = put;
    K.onKey = (e) => {
      const d = '1234'.indexOf(e.key); if (d >= 0 && d < kinds.length) { choose(kinds[d]); return true; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const cur = document.activeElement?.dataset?.slot; const s = cur === undefined ? (e.key === 'ArrowRight' ? 0 : SLOTS - 1) : (+cur + (e.key === 'ArrowRight' ? 1 : SLOTS - 1)) % SLOTS; tray.querySelector(`[data-slot="${s}"]`).focus(); set.setFocus(s); return true; }
      return false;
    };
    for (;;) {
      const act = await new Promise((res) => { tray.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled || tooSoon(e)) return; if (b.dataset.kind) choose(b.dataset.kind); else if (b.dataset.slot) put(+b.dataset.slot); else if (b.dataset.fleet) { st.fleet = cleanFleet(st.fleet + +b.dataset.fleet, n); if (st.runs) st.changes++; draw(); keep(st.built ? 'built' : 'design'); hint.textContent = fleetSay(st.fleet, n); ctx.say(hint.textContent); } else if (b.dataset.act) res(b.dataset.act); }; });
      if (act === 'clear') { st.layout = emptyLayout(); if (st.runs) st.changes++; set.setLayout(st.layout); set.setFocus(-1); draw(); keep(st.built ? 'built' : 'design'); hint.textContent = cleared(j); ctx.say(cleared(j)); if (K.kbd) tray.querySelector('[data-kind="drop"]')?.focus(); continue; }
      if (act === 'run' && counts(st.layout).drop) break;
      say(needDrop(j));
    }
    tray.onclick = tray.onmouseover = tray.onfocusin = null; K.onStreetTap = null; K.onKey = null; set.setFocus(-1); set.setHint(false);
  }

  // ================= 3. run the morning, then read the numbers where they happened
  async function morning() {
    report(st.built && st.extra ? 'rerun' : 'run');
    let added = '';
    if (!j) { const n = trips + (st.built ? st.extra : 0); const nf = cleanFleet(st.fleet, n); if (nf > st.fleet) added = `The ${n} calls need at least ${nf} cars, so ${nf - st.fleet === 1 ? 'one car was' : `${nf - st.fleet} cars were`} added. `; st.fleet = nf; }
    st.prev = st.res; st.res = sim(); st.runs++;
    const res = st.res; const g = goods(res, j); const bestWas = st.best; if (!st.best || st.best.of !== g.of || g.good > st.best.good) st.best = g;
    keep(st.built ? 'built' : 'design');
    set.setMarks(null); set.setPlots(st.built ? { plots: st.plots } : 'full'); set.setLayout(st.layout); setView(views.street);
    if (!reduce) {
      say(runSay(j, res));
      swap(`<div class="rd-row"><span class="rd-clock" aria-live="off">7:30</span><div class="rd-bar" aria-hidden="true"><span></span></div><button type="button" data-primary data-act="skip">${T.skip}</button><p class="rd-count" aria-live="off"></p></div>`);
      const clk = tray.querySelector('.rd-clock'), bar = tray.querySelector('.rd-bar span'), cnt = tray.querySelector('.rd-count'); const tl = timeline(res); const t0 = secs(); let shown = '';
      set.startRun(res);
      await new Promise((done) => {
        K.anim = (real) => {
          const r = real - t0; const t = tl.at(r); const slow = r < tl.slowReal; const c = set.updateRun(t, r, slow);
          clk.textContent = clock(t); bar.style.width = `${Math.min(100, (100 * r) / tl.total)}%`;
          const line = `${slow ? (j ? 'Watching the first family.' : 'Watching the first call.') : runFast(j)} ${runCount(c.waiting, c.cars)}`; if (line !== shown) { shown = line; cnt.textContent = line; }
          if (r >= tl.total) { K.anim = null; done(); }
        };
        tray.onclick = (e) => { if (e.target.closest('[data-act="skip"]') && !tooSoon(e)) { K.anim = null; done(); } };
      });
      tray.onclick = null; set.endRun();
    } else {
      // reduced motion: the morning as still pictures, one press each
      const shots = stills(res); set.startRun(res);
      for (let i = 0; i < shots.length; i++) {
        const s = shots[i]; set.updateRun(s.t, 0, false, true); setView(views.spot(slotX(s.drop), 11), true); say(stillSay(s, res, j));
        swap(`<div class="rd-row"><p class="rd-cap">The morning: picture ${i + 1} of ${shots.length}</p><button class="go" type="button" data-primary data-act="next">${T.next}</button></div>`); await press();
      }
      set.endRun();
    }
    report('results');
    const ms = measures(res, j, st.prev); const list = marks(res, j); set.setMarks(list); setView(views.street);
    const gr = Object.values(grade(res, j)); const worse = bestWas && bestWas.of === g.of && g.good < bestWas.good;
    // changing the street stays the main button while Florence has an idea in the first runs, the result is worse than the best, or anything needs work
    const more = (nextStep(res, j) !== 'none' && st.runs < 3) || worse || gr.includes('poor');
    const trade = res.extra && (worse || gr.includes('poor')) ? (j ? ' The new homes made it harder. Add a bay or a drop-off point, or change what a plot becomes.' : ' The new homes strained the street: add a bay or a drop-off point, or change a plot’s use.') : '';
    say(added + (res.extra ? withHomes(j, res.extra) + afterColon(comment(res, j)) : comment(res, j)) + trade);
    swap(`<h3>${esc(resultsHead(res, j, bestWas))}</h3>
      <div class="rd-nums">${ms.map((m) => `<button type="button" class="rd-num ${m.grade}" data-num="${m.id}" aria-pressed="false"><small>${esc(m.label)}</small><b>${esc(m.value)}</b><em>${GRADE[m.grade]}</em>${m.was && m.was !== m.value ? `<i>Last run: ${esc(m.was)}</i>` : ''}</button>`).join('')}</div>
      <p class="rd-legend">${pick(T.legend)}</p>
      <div class="rd-row end"><p class="rd-hint" aria-live="polite"></p><button type="button" class="${more ? 'go' : ''}" ${more ? 'data-primary' : ''} data-act="change">${pick(T.change)}</button>${res.extra ? `<button type="button" data-act="land">${j ? 'Change the land' : 'Change the land use'}</button>` : ''}<button class="${more ? '' : 'go'}" type="button" ${more ? '' : 'data-primary'} data-act="keep">${pick(T.keep)}</button></div>`);
    const hint = tray.querySelector('.rd-hint'); let sel = null;
    const where = { wait: () => slotX(res.where.wait.drop), walk: () => (slotX(res.where.walk.home) + slotX(res.where.walk.drop)) / 2, queue: () => (res.where.queue ? slotX(res.where.queue.drop) + 3 : null) };
    const act = await new Promise((done) => { tray.onclick = (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled || tooSoon(e)) return;
      if (b.dataset.act) return done(b.dataset.act);
      const id = b.dataset.num; sel = sel === id ? null : id;
      for (const o of tray.querySelectorAll('[data-num]')) o.setAttribute('aria-pressed', String(o.dataset.num === sel));
      const onStreet = sel && ['wait', 'walk', 'queue', 'safe'].includes(sel) && res.ran; set.selectMark(onStreet ? sel : null);
      const x = sel && where[sel] && res.ran ? where[sel]() : null; setView(x === null ? views.street : views.spot(x, sel === 'walk' ? Math.max(9, Math.abs(slotX(res.where.walk.home) - slotX(res.where.walk.drop)) / 2 + 5) : 9));
      hint.textContent = sel ? whereSay(sel, res, j) : ''; if (sel) ctx.say(hint.textContent);
    }; });
    tray.onclick = null; set.setMarks(null);
    return act;
  }

  // ================= 4. the freed land: the plots are in view above the panel, each with its letter on a sign
  async function freed() {
    report('land'); keep('land'); set.setMarks(null); set.setOld(false); set.setNames(false); set.setLayout(st.layout); set.setPlots({ plots: st.plots, letters: true }); setView(views.land);
    say(landIntro(j, st.res.fleet));
    const names = ['A', 'B', 'C'];
    swap(`<div class="rd-plots">${names.map((n, i) => `<div class="rd-plot" role="group" aria-label="Plot ${n}"><b class="rd-letter" aria-hidden="true">${n}</b>${USE_IDS.map((id) => `<button type="button" data-plot="${i}" data-use="${id}" ${i === 0 && id === USE_IDS[0] ? 'data-fallback' : ''} aria-pressed="false" aria-label="Plot ${n}: ${USE[id].name}, ${esc(pick(USE[id].gain))}"><span class="ico" aria-hidden="true">${USE[id].icon}</span>${USE[id].name}</button>`).join('')}</div>`).join('')}</div>
      <div class="rd-foot"><ul class="rd-sum" aria-live="polite"></ul><div class="rd-row"><button class="go" type="button" data-primary data-act="build" ${land(st.plots).done ? '' : 'disabled'}>${pick(T.build)}</button></div></div>`);
    const sum = tray.querySelector('.rd-sum');
    const effect = (L) => (L.families ? { before: sim(0).longestWait, after: sim(L.families).longestWait } : null);
    const draw = () => {
      const L = land(st.plots);
      for (const b of tray.querySelectorAll('[data-use]')) b.setAttribute('aria-pressed', String(st.plots[+b.dataset.plot] === b.dataset.use));
      sum.innerHTML = landSummary(st.plots, j, effect(L)).map((l) => `<li>${esc(l)}</li>`).join('');
      tray.querySelector('[data-act="build"]').disabled = !L.done; K.measure();
    };
    draw();
    await new Promise((res) => { tray.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled || tooSoon(e)) return; if (b.dataset.use) { const i = +b.dataset.plot; st.plots[i] = b.dataset.use; set.setPlots({ plots: st.plots, letters: true }); draw(); keep('land'); ctx.say(`Plot ${names[i]}: ${USE[b.dataset.use].name}, ${pick(USE[b.dataset.use].gain)}.`); } else if (b.dataset.act === 'build') res(); }; });
    tray.onclick = null; st.built = true; st.extra = land(st.plots).families; keep('built');
  }
  // the land is built. New homes mean more calls: Florence offers to run the morning with them.
  async function built() {
    report('land'); const L = land(st.plots); st.extra = L.families; set.setMarks(null); set.setNames(false); set.setLayout(st.layout); set.setPlots({ plots: st.plots, letters: true }); setView(views.land);
    const lines = landSummary(st.plots, j, L.families ? { before: sim(0).longestWait, after: sim(L.families).longestWait } : null);
    say(L.families ? newHomesAsk(j, L.families) : landClose(st.plots, j));
    swap(`<h3>${j ? 'The old car park now' : 'The car park, reused'}</h3><div class="rd-foot"><ul class="rd-sum">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}<li>${esc(landClose(st.plots, j))}</li></ul>
      <div class="rd-row">${L.families ? `<button type="button" data-act="ride">${pick(T.rideGo)}</button><button class="go" type="button" data-primary data-act="rerun">${T.rerun}</button>` : `<button class="go" type="button" data-primary data-act="ride">${pick(T.rideGo)}</button>`}</div></div>`);
    return press();
  }

  // ================= 5. the ride
  async function rideAlong() {
    report('ride'); keep('built'); set.setMarks(null); set.setFocus(-1); set.setNames(false); set.endRun(); set.setLayout(st.layout); set.setPlots({ plots: st.plots });
    const stops = rideStops(st.layout, st.plots, j, st.res);
    const behind = (x) => ({ pos: V(x - 7.5, 3.6, -1.5), look: V(x + 10, 0.9, -0.3), fov: 52, fast: true });
    const toLand = (x) => ({ pos: V(x - 1.5, 10.5, -5), look: V(x - 1.5, 0.4, 9), fov: 58, fast: true });   // turn to look at the old car park
    const stopX = (s) => (s.at < 0 ? -5 : s.at >= SLOTS ? 43 : s.kind === 'land' ? 12 : s.kind === 'walk' || s.kind === 'cycle' ? slotX(s.at) - 3.4 : slotX(s.at));
    const crossAt = (s, p) => (s.kind === 'walk' || s.kind === 'cycle' ? { slot: s.at, p, kind: s.kind === 'cycle' || (j && s.at === 6) ? 'cycle' : 'walk' } : null);
    if (reduce) {
      // no movement: every stop as a still view, one press each, ending on the closing line
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i]; const x = stopX(s); const last0 = i === stops.length - 1; set.setRide(x, crossAt(s, 0.5)); if (last0) set.setPlots({ plots: st.plots }); setView(last0 ? views.street : s.kind === 'land' ? toLand(x) : behind(x), true);
        say(s.text); const last = i === stops.length - 1;
        swap(`<div class="rd-row"><p class="rd-cap">The ride: view ${i + 1} of ${stops.length}</p><button class="go" type="button" data-primary data-act="next">${last ? T.finish : T.next}</button></div>`); await press();
      }
    } else {
      swap(`<div class="rd-row"><p class="rd-cap">${j ? 'Riding along your street…' : 'Riding the street…'}</p><button type="button" data-primary data-act="end">Skip the ride</button></div>`);
      // each caption stays for at least HOLD seconds: the car waits at a stop, or slows before the next one
      const HOLD = 3; let x = -6, hold = 0, held = 0, idx = 0, said = -99, at = null, prev = secs(), ended = false;
      set.setRide(x); setView(behind(x), true);
      await new Promise((done) => {
        tray.onclick = (e) => { if (e.target.closest('[data-act="end"]') && !tooSoon(e)) { K.anim = null; done(); } };
        K.anim = (real) => {
          const dt = Math.min(0.25, Math.max(0, real - prev)); prev = real;
          if (hold > 0) hold -= dt;
          else {
            at = null; const next = stops[idx]; const trigger = next ? stopX(next) - (next.pause ? 0 : 3) : 99;
            if (next && x >= trigger) { if (real - said >= HOLD) { say(next.text); said = real; idx++; if (next.pause) { x = stopX(next); at = next; hold = held = next.kind === 'land' ? 3.8 : HOLD; } } }
            else x = Math.min(trigger, x + dt * 5.2);
            if (!next && x >= 43 && real - said >= 1.2) ended = true;
          }
          set.setRide(Math.min(x, 43), at ? crossAt(at, 1 - Math.max(0, hold) / held) : null); K.view = at && at.kind === 'land' ? toLand(x) : behind(Math.min(x, 43));
          if (ended) { K.anim = null; done(); }
        };
      });
      tray.onclick = null; const end = stops[stops.length - 1]; set.setRide(43); setView(views.street); if (K.spoken !== end.text) say(end.text);
      swap(`<div class="rd-row"><p class="rd-cap">${j ? 'The end of your street.' : 'End of the street.'}</p><button class="go" type="button" data-primary data-act="next">${T.finish}</button></div>`); await press();
    }
    st.rode = true; set.setRide(null);
  }

  // ================= the loop
  K.measure();
  const resume = !!sv && st.layout.includes('drop');
  if (!resume && !skipIntro) await meet();
  if (!resume && skipIntro) { set.setOld(false); set.setLayout(emptyLayout()); }
  let stage = resume ? sv.stage : 'design';
  if (stage === 'built' && !land(st.plots).done) stage = 'land';
  if (stage !== 'design') { st.extra = stage === 'built' ? land(st.plots).families : 0; st.built = stage === 'built'; st.res = sim(0); if (!st.runs) st.runs = 1; } else st.built = false;
  for (let first = !resume; ;) {
    if (stage === 'design') { await design(first); first = false; const act = await morning(); if (act === 'land') stage = 'land'; else if (act === 'keep') { if (st.built) break; stage = 'land'; } continue; }
    if (stage === 'land') { await freed(); stage = 'built'; }
    const act = await built(); if (act === 'ride') break;
    const after = await morning(); if (after === 'keep') break;
    stage = after === 'land' ? 'land' : 'design';
  }
  st.extra = land(st.plots).families;
  if (!st.res || st.res.extra !== st.extra) st.res = sim(st.extra);   // the record's numbers include the families in the new homes
  await rideAlong();
  report('done'); st.built = false; keep('design');
  return { layout: st.layout, plots: st.plots, fleet: st.fleet, runs: st.runs, changes: st.changes, rode: st.rode, res: st.res };
}
