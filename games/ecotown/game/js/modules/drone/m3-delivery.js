// Mission 3, delivery: the first version of the module, kept as it was after review round 1. Fly one delivery by hand
// through the child's own town, plan the route on a map, write the drone's steps from tiles, watch it fly them,
// change them, and compare the two flights. Then a second delivery, planned from the map alone.
//   geo.js, route.js, picture.js  pure rules and words (tests/drone.test.mjs)
//   flight.js, model.js           the drone in the 3D town (loaded only in the browser)
//   ui.js                         the panels over the 3D view
import { pickVisit, usedOf, restore, finishState, cleanHand, fly, verdict, compareLines, AUTOMATE, PEOPLE, townData, dropNames, shortSteps } from './route.js';
import { mapSvg } from './picture.js';
import { tilesWord } from './geo.js';

const tileList = (terrain) => (terrain?.tiles instanceof Map ? [...terrain.tiles.values()] : [...(terrain?.tiles || [])]);

// saved: this mission's own progress (route.js restore). keep(st): store it with the hour's progress.
// Resolves with { sum, lines, m3, town } when the delivery is finished.
export async function runDelivery(ctx, ui, scope, { saved, keep: store }) {
  const junior = !!ctx.junior; const tiles = tileList(ctx.town.terrain); const cells = ctx.town.cells || []; const tileKeys = new Set(tiles.map((t) => t.k));
  const visit = pickVisit(cells, tiles, junior, usedOf(saved));
  const { createFlight } = await import('./flight.js');
  const reduce = !!ctx.settings.reduceMotion;
  if (!visit) { ctx.report({ stage: 'No island to fly over' }); await ui.talk('There is nowhere to fly yet. Go back to your town and try again.', { button: 'Back to the missions' }); ui.hush(); return null; }
  const flight = createFlight(ctx, tileKeys); scope.onEnd(() => { flight.dispose(); ui.hush(); ui.hideHand(); for (const n of ctx.root.querySelectorAll('.dr-plan, .dr-now, .dr-card, .dr-cheer')) n.remove(); });
  const D = visit.deliveries; const st = restore(saved, visit); const keep = () => store(st);
  const from = visit.from.label; const resumed = !!st.hand; const runs = [];
  const did = { hand: !!st.hand, parcels: D[0].drops.length, runs: 0, steps: 0, flights: st.flights, changed: st.changed, chose: false };
  if (st.d === 1) { // back in the middle of the second delivery: the first is flown again from its saved steps, as data only
    const r = fly(st.first, D[0], tileKeys);
    if (r.all) runs.push({ places: D[0], program: st.first, auto: r }); else { st.d = 0; st.first = null; st.program = []; }
  }
  const cheer = (p) => ui.cheer(`Delivered to ${p.label}`);
  let stopHere = false;

  for (let d = st.d; d < D.length && !stopHere; d++) {
    const places = D[d]; const two = places.drops.length > 1; const to = dropNames(places); const parcels = two ? 'the parcels' : 'the parcel';
    const battery = Number.isFinite(places.battery) ? places.battery : 0; const nofly = !!places.nofly?.length;
    flight.use(places);

    // ---- 1. the first delivery is flown by hand
    if (d === 0 && !st.hand) {
      ctx.report({ stage: 'Delivery: flying a parcel by hand' }); ui.setStage('intro');
      await ui.talk(two ? `Two parcels are waiting on the drone's landing pad at ${from}. One is for ${places.drops[0].label} and one is for ${places.drops[1].label}. Fly them there yourself first.`
        : `A parcel is waiting on the drone's landing pad at ${from}. It is for ${places.drops[0].label}. Fly it there yourself first.`, { button: 'Start flying ➜' });
      ui.showHand();
      const how = reduce ? (ui.touch ? 'Hold an arrow button to fly that way.' : 'Hold an arrow key to fly that way.') : (ui.touch ? 'Hold the up button to fly forward. The left and right buttons turn.' : 'Hold the up arrow to fly forward. Left and right turn.');
      ui.talk(`${how} Fly through the gold hoops, then on to the tall red marker at ${places.drops[0].label}. The drone cannot crash.`);
      const hand = await flight.hand(ui.input, { onTick: ui.tickHand, onCheer: cheer, onDrop: (i) => ui.talk(`One parcel is down. Now fly through the hoops to the red marker at ${places.drops[i].label}.`) });
      st.hand = cleanHand(hand); did.hand = true; keep();
      // free flying: the same controls, for as long as the child likes
      ctx.report({ stage: 'Delivery: free flying' }); ui.freeHand(); flight.free(ui.input);
      const hoops = st.hand.of ? `, through ${st.hand.hoops} of ${st.hand.of} hoops` : '';
      await ui.talk(`${two ? 'Both parcels are delivered' : 'The parcel is delivered'}. You flew ${tilesWord(st.hand.tiles)} in ${st.hand.secs} seconds${hoops}. Fly on for as long as you like. Then teach the drone to fly it without you.`, { button: 'Plan the route ➜' });
      flight.stopFree(); ui.hideHand();
    }
    // ---- the second delivery is planned straight from the map
    if (d > 0 && !(resumed && d === st.d && st.program.length)) {
      ctx.report({ stage: 'Delivery: a second order comes in' }); flight.park(); ui.setStage('order');
      const what = two ? `A new order has come in: ${junior ? 'two parcels this time. One is' : 'one parcel'} for ${places.drops[0].label} and one ${junior ? 'is ' : ''}for ${places.drops[1].label}.` : `A new order has come in: a parcel for ${places.drops[0].label}.`;
      const limits = `${nofly ? ' Birds are nesting on the striped squares, so the drone will not fly over them.' : ''}${battery ? ` Its battery holds enough for ${tilesWord(battery)}.` : ''}`;
      await ui.talk(`${what}${limits} You know how the drone works now, so plan this one on the map straight away.`, { button: 'Plan this delivery ➜' });
    }

    // ---- 2 to 4. plan on the map, write the steps, watch them fly, change them, compare
    const neutral = `Add steps that take ${parcels} to ${to}. Then press Fly.${two ? ' Either parcel can go first.' : ''}`;
    const limits = `${nofly ? ' It will not fly over the striped squares.' : ''}${battery ? ` Its battery holds enough for ${tilesWord(battery)}.` : ''}`;
    let say = `The drone does exactly what its steps say, in order. It starts on its landing pad at ${from}.${limits} ${neutral}`;
    if (resumed && d === st.d && st.program.length) say = `Welcome back. Here are your steps so far. The drone starts on its landing pad at ${from} and flies to ${to}.`;
    let last = null; let best = null; let act = '';
    for (;;) {
      ctx.report({ stage: best ? 'Delivery: changing the drone\'s steps' : d ? 'Delivery: steps for a second order' : 'Delivery: writing the drone\'s steps' }); flight.park();
      const plan = await ui.planner({ places, tiles, cells, hand: d === 0 ? st.hand : null, program: st.program, say, neutral, last, tileKeys, canFinish: !!best, junior, heading: D.length > 1 ? `Delivery ${d + 1}: the drone's steps` : '', onEdit: (p) => { st.program = p; keep(); } });
      if (plan.act === 'finish' && best) { act = d === D.length - 1 ? 'finish' : 'next'; break; }
      st.program = plan.program; st.flights++; did.flights = st.flights; keep();
      ctx.report({ stage: 'Delivery: watching the drone fly the steps' });
      const result = fly(st.program, places, tileKeys); const list = ui.stepList(result.steps);
      ui.talk('The drone is flying your steps, one at a time.');
      await flight.auto(result, (i) => list.mark(i), { onCheer: cheer, onMiss: (i) => list.miss(i) });
      const v = verdict(result, places, { junior, miss: st.miss }); last = result;
      if (!result.all) {
        if (result.stop) list.stop(result.stop.step); else list.finish();
        if (v.away) st.miss++; // the next hint says a little more (ages 8-12)
        st.changed = true; did.changed = true; keep();
        await ui.talk(v.text, { button: 'Change the steps ➜' }); list.remove(); say = v.text; continue;
      }
      list.finish(); best = { result, program: st.program.slice() };
      ctx.report({ stage: 'Delivery: comparing the two flights' }); list.remove();
      const isLast = d === D.length - 1;
      const ans = await ui.compare({ head: v.text, lines: compareLines(d === 0 ? st.hand : null, result, places, junior, tileKeys), ask: d === 0 ? AUTOMATE : PEOPLE,
        map: (keySide) => mapSvg({ tiles, cells, hand: d === 0 ? st.hand?.trail : null, runs: [{ places, route: result.path }], keySide, title: d === 0 ? 'The hand-flown path and the route from the steps' : 'The route from the steps' }),
        buttons: isLast ? [{ id: 'again', label: 'Change the steps and fly again' }, { id: 'finish', label: 'Finish: keep this route flying ➜', go: true }]
          : [{ id: 'again', label: 'Change the steps' }, { id: 'stop', label: 'Finish here' }, { id: 'next', label: 'Next delivery ➜', go: true }] });
      if (ans.chose) did.chose = true;
      if (ans.act !== 'again') { act = ans.act; break; }
      st.changed = true; did.changed = true; keep(); last = null;
      say = 'Change any step, or try another way round. Then fly it again and see how it compares.';
    }
    runs.push({ places, program: best.program, auto: best.result });
    if (act === 'stop') stopHere = true;
    else if (d + 1 < D.length) { st.first = best.program; st.d = d + 1; st.program = []; st.miss = 0; keep(); }
  }

  // ---- what is kept: the last delivery planned flies on in the town; one line for the record
  const kept = runs[runs.length - 1]; ui.hush(); flight.dispose(); ui.setStage('');
  const steps = runs.reduce((n, r) => n + r.auto.steps.length, 0); const tiles2 = runs.reduce((n, r) => n + r.auto.tiles, 0);
  const first = runs[0];
  let line = `from ${first.places.from.label} to ${dropNames(first.places)}${runs.length > 1 ? ', then a second order' : ''}: ${steps} steps, ${tilesWord(tiles2)}.`;
  if (line.length > 105) line = `${runs.length} ${runs.length > 1 ? 'deliveries' : 'delivery'} planned as ${steps} steps, ${tilesWord(tiles2)}.`;
  const lines = [st.hand ? `You flew ${tilesWord(st.hand.tiles)} by hand, then wrote ${steps} steps the drone followed by itself.` : `You wrote ${steps} steps the drone followed by itself.`,
    runs.length > 1 ? 'You planned the second delivery from the map alone.' : 'The drone can fly your steps again and again, the same every time.',
    `Your route: ${shortSteps(first.program)}`];
  return { sum: { line, steps, tiles: tiles2, runs: runs.length }, lines, m3: finishState(st, visit), town: townData(kept.places, kept.auto) };
}
