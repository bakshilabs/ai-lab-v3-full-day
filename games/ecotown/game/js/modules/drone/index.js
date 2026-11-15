// Drone delivery (docs/MODULES.md): fly one delivery by hand through your own town, then plan the route on a map, write
// the drone's steps from tiles, watch it fly them, change them, and compare the two flights. Then a second delivery,
// planned from the map alone. About ten minutes; playing again goes to different places.
//   geo.js, route.js, picture.js  pure rules and words (unit tested: tests/drone*.test.mjs)
//   flight.js, model.js           the drone in the 3D town (loaded only in the browser)
//   ui.js                         the panels over the 3D view
import { pickVisit, usedOf, restore, finishState, cleanHand, fly, verdict, compareLines, AUTOMATE, PEOPLE, makeRecord, townData, routeStillThere, stepText, dropNames } from './route.js';
import { mapSvg } from './picture.js';
import { tilesWord } from './geo.js';
import { createUi, CSS } from './ui.js';

const tileList = (terrain) => (terrain?.tiles instanceof Map ? [...terrain.tiles.values()] : [...(terrain?.tiles || [])]);

export default {
  id: 'drone', icon: '🚁',
  title: { j: 'Drone delivery', s: 'Drone delivery' },
  blurb: { j: 'Fly a parcel across your town, then teach the drone the route.', s: 'Fly one delivery by hand, then plan and automate the route.' },
  css: CSS,

  async run(ctx) {
    const junior = !!ctx.junior; const tiles = tileList(ctx.town.terrain); const cells = ctx.town.cells || []; const tileKeys = new Set(tiles.map((t) => t.k));
    const visit = pickVisit(cells, tiles, junior, usedOf(ctx.saved));
    const { createFlight } = await import('./flight.js');
    const reduce = !!ctx.settings.reduceMotion; const ui = createUi(ctx, { reduce }); ctx.onLeave(() => ui.off());
    if (!visit) { ctx.report({ stage: 'No island to fly over' }); ui.talk('There is nowhere to fly yet. Go back to your town and try again.'); await ctx.left; return { finished: false }; }
    const flight = createFlight(ctx, tileKeys); ctx.onLeave(() => flight.dispose());
    const D = visit.deliveries; const st = restore(ctx.saved, visit); const keep = () => ctx.save(st);
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
        ctx.report({ stage: 'Flying a delivery by hand' }); ui.setStage('intro');
        await ui.talk(two ? `Two parcels are waiting on the drone's landing pad at ${from}. One is for ${places.drops[0].label} and one is for ${places.drops[1].label}. Fly them there yourself first.`
          : `A parcel is waiting on the drone's landing pad at ${from}. It is for ${places.drops[0].label}. Fly it there yourself first.`, { button: 'Start flying ➜' });
        ui.showHand();
        const how = reduce ? (ui.touch ? 'Hold an arrow button to fly that way.' : 'Hold an arrow key to fly that way.') : (ui.touch ? 'Hold the up button to fly forward. The left and right buttons turn.' : 'Hold the up arrow to fly forward. Left and right turn.');
        ui.talk(`${how} Fly through the gold hoops, then on to the tall red marker at ${places.drops[0].label}. The drone cannot crash.`);
        const hand = await flight.hand(ui.input, { onTick: ui.tickHand, onCheer: cheer, onDrop: (i) => ui.talk(`One parcel is down. Now fly through the hoops to the red marker at ${places.drops[i].label}.`) });
        st.hand = cleanHand(hand); did.hand = true; keep();
        // free flying: the same controls, for as long as the child likes
        ctx.report({ stage: 'Free flying after the delivery' }); ui.freeHand(); flight.free(ui.input);
        const hoops = st.hand.of ? `, through ${st.hand.hoops} of ${st.hand.of} hoops` : '';
        await ui.talk(`${two ? 'Both parcels are delivered' : 'The parcel is delivered'}. You flew ${tilesWord(st.hand.tiles)} in ${st.hand.secs} seconds${hoops}. Fly on for as long as you like. Then teach the drone to fly it without you.`, { button: 'Plan the route ➜' });
        flight.stopFree(); ui.hideHand();
      }
      // ---- the second delivery is planned straight from the map
      if (d > 0 && !(resumed && d === st.d && st.program.length)) {
        ctx.report({ stage: 'A second delivery comes in' }); flight.park(); ui.setStage('order');
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
        ctx.report({ stage: best ? 'Changing the drone\'s steps' : d ? 'Writing the steps for a second delivery' : 'Writing the drone\'s steps' }); flight.park();
        const plan = await ui.planner({ places, tiles, cells, hand: d === 0 ? st.hand : null, program: st.program, say, neutral, last, tileKeys, canFinish: !!best, junior, heading: D.length > 1 ? `Delivery ${d + 1}: the drone's steps` : '', onEdit: (p) => { st.program = p; keep(); } });
        if (plan.act === 'finish' && best) { act = d === D.length - 1 ? 'finish' : 'next'; break; }
        st.program = plan.program; st.flights++; did.flights = st.flights; keep();
        ctx.report({ stage: 'Watching the drone fly the steps' });
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
        ctx.report({ stage: 'Comparing the two flights' }); list.remove();
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

    // ---- the record and the route left in the town (the last delivery planned)
    const kept = runs[runs.length - 1];
    did.runs = runs.length; did.steps = runs.reduce((n, r) => n + r.auto.steps.length, 0); did.nofly = runs.some((r) => r.places.nofly?.length); did.battery = !junior && runs.some((r) => Number.isFinite(r.places.battery));
    const picture = mapSvg({ tiles, cells, hand: st.hand?.trail, runs: runs.map((r) => ({ places: r.places, route: r.auto.path })),
      steps: runs.map((r, i) => ({ title: runs.length > 1 ? `Delivery ${i + 1}: the steps` : 'The drone\'s steps', steps: r.program.map(stepText) })), title: `My drone route from ${from}` });
    ctx.save(finishState(st, visit)); // playing again starts with a new hand flight, to different places
    ctx.report({ stage: 'Drone route finished', state: 'finished', finished: true });
    return { finished: true, record: makeRecord({ runs, hand: st.hand, did, picture, junior, tileKeys }), town: { kind: 'drone-route', data: townData(kept.places, kept.auto) } };
  },

  // The route keeps flying in the town: a large drone going there and back along the steps the child wrote.
  show(townCtx, data) {
    const tiles = tileList(townCtx.town?.terrain); const tileKeys = new Set(tiles.map((t) => t.k));
    if (!routeStillThere(data, townCtx.town?.cells, tileKeys)) return () => {}; // the place is gone: draw nothing
    let off = null; let dead = false;
    import('./flight.js').then((m) => { if (!dead) off = m.showRoute(townCtx, data, tileKeys); }).catch((e) => console.error('drone route:', e));
    return () => { dead = true; off?.(); off = null; };
  },
};
