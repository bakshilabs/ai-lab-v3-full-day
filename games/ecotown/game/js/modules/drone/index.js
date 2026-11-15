// Drone delivery (docs/MODULES.md): fly one delivery by hand through your own town, then plan the route on a map, write
// the drone's steps from tiles, watch it fly them, change them, and compare the two flights.
//   geo.js, route.js, picture.js  pure rules and words (unit tested: tests/drone*.test.mjs)
//   flight.js, model.js           the drone in the 3D town (loaded only in the browser)
//   ui.js                         the panels over the 3D view
import { pickPlaces, restore, cleanHand, fly, verdict, compareLines, AUTOMATE, makeRecord, townData, routeStillThere, stepText, dropNames } from './route.js';
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
    const places = pickPlaces(cells, tiles, junior);
    const { createFlight } = await import('./flight.js');
    const reduce = !!ctx.settings.reduceMotion; const ui = createUi(ctx, { reduce }); ctx.onLeave(() => ui.off());
    if (!places) { ctx.report({ stage: 'No island to fly over' }); ui.talk('There is nowhere to fly yet. Go back to your town and try again.'); await ctx.left; return { finished: false }; }
    const flight = createFlight(ctx, places, tileKeys); ctx.onLeave(() => flight.dispose());
    const st = restore(ctx.saved, places); const keep = () => ctx.save(st);
    const from = places.from.label, to = dropNames(places), two = places.drops.length > 1;
    const resumed = !!st.hand;
    const did = { hand: !!st.hand, steps: 0, flights: st.flights, changed: st.changed, chose: false };

    // ---- 1. one delivery by hand
    if (!st.hand) {
      ctx.report({ stage: 'Flying a delivery by hand' }); ui.setStage('intro');
      await ui.talk(two ? `Two parcels are waiting at ${from}. One is for ${places.drops[0].label} and one is for ${places.drops[1].label}. Fly them there yourself first.`
        : `A parcel is waiting at ${from}. It is for ${places.drops[0].label}. Fly it there yourself first.`, { button: 'Start flying ➜' });
      ui.showHand();
      ui.talk(reduce ? `Hold an arrow key, or an arrow button, to fly. Follow the red arrow to the tall red marker at ${places.drops[0].label}. The drone cannot crash.`
        : `Hold the up arrow to fly forward. Left and right turn. Follow the red arrow to the tall red marker at ${places.drops[0].label}. The drone cannot crash.`);
      const hand = await flight.hand(ui.input, { onTick: ui.tickHand, onDrop: (i) => ui.talk(`One parcel is down. Now fly to the red marker at ${places.drops[i].label}.`) });
      ui.hideHand(); st.hand = cleanHand(hand); did.hand = true; keep();
      await ui.talk(`${two ? 'Both parcels are delivered' : 'The parcel is delivered'}. You flew ${tilesWord(st.hand.tiles)} in ${st.hand.secs} seconds. Next, teach the drone to fly it without you.`, { button: 'Plan the route ➜' });
    }

    // ---- 2 to 4. plan on the map, write the steps, watch them fly, change them, compare
    let say = `The drone does exactly what its steps say, in order. It starts on its landing pad at ${from}. Add steps that take ${two ? 'the parcels' : 'the parcel'} to ${to}. Then press Fly.`;
    if (resumed && st.program.length) say = `Welcome back. Here are your steps so far. The drone starts on its landing pad at ${from} and flies to ${to}.`;
    let last = null; let best = null;
    for (;;) {
      ctx.report({ stage: best ? 'Changing the drone\'s steps' : 'Writing the drone\'s steps' }); flight.park();
      const plan = await ui.planner({ places, tiles, cells, hand: st.hand, program: st.program, say, last, tileKeys, canFinish: !!best, junior, onEdit: (p) => { st.program = p; keep(); } });
      if (plan.act === 'finish' && best) break;
      st.program = plan.program; st.flights++; did.flights = st.flights; keep();
      ctx.report({ stage: 'Watching the drone fly the steps' });
      const result = fly(st.program, places, tileKeys); const list = ui.stepList(result.steps);
      ui.talk('The drone is flying your steps, one at a time.');
      await flight.auto(result, (i) => list.mark(i));
      const v = verdict(result, places); last = result;
      if (!result.all) {
        if (result.stop) list.stop(result.stop.step); else list.finish();
        st.changed = true; did.changed = true; keep();
        await ui.talk(v.text, { button: 'Change the steps ➜' }); list.remove(); say = v.text; continue;
      }
      list.finish(); best = { result, program: st.program.slice() }; did.steps = result.steps.length;
      ctx.report({ stage: 'Comparing the two flights' }); list.remove();
      const ans = await ui.compare({ head: v.text, lines: compareLines(st.hand, result, places, junior), automate: AUTOMATE,
        map: mapSvg({ tiles, cells, places, hand: st.hand?.trail, route: result.path, title: 'The hand-flown path and the route from the steps' }) });
      if (ans.chose) did.chose = true;
      if (ans.act === 'finish') break;
      st.changed = true; did.changed = true; keep(); last = null;
      say = 'Change any step, or try another way round. Then fly it again and see how it compares.';
    }

    // ---- the record and the route left in the town
    const auto = best.result; did.steps = auto.steps.length;
    const picture = mapSvg({ tiles, cells, places, hand: st.hand?.trail, route: auto.path, steps: auto.steps.map(stepText), title: `My drone route from ${from} to ${to}` });
    st.program = best.program; ctx.save({ ...st, done: true }); // done: playing again starts with a new hand flight
    ctx.report({ stage: 'Drone route finished', state: 'finished', finished: true });
    return { finished: true, record: makeRecord({ places, program: best.program, hand: st.hand, auto, did, picture }), town: { kind: 'drone-route', data: townData(places, auto) } };
  },

  // The route keeps flying in the town: a small drone going there and back along the steps the child wrote.
  show(townCtx, data) {
    const tiles = tileList(townCtx.town?.terrain); const tileKeys = new Set(tiles.map((t) => t.k));
    if (!routeStillThere(data, townCtx.town?.cells, tileKeys)) return () => {}; // the place is gone: draw nothing
    let off = null; let dead = false;
    import('./flight.js').then((m) => { if (!dead) off = m.showRoute(townCtx, data, tileKeys); }).catch((e) => console.error('drone route:', e));
    return () => { dead = true; off?.(); off = null; };
  },
};
