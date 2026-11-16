// Town film studio (docs/MODULES.md; docs/curriculum.md section 5): an hour of six missions, each a real job in film
// and TV. A mission map opens them in order; a finished one can be played again. Progress is saved after each mission.
//   1 m1-*  the film crew's language (shot sizes, camera moves)      4 m4-*  editing (takes, trim, pace, music)
//   2 m2-*  storyboarding (beginning, middle, end)                   5 m5-*  captions and a described version
//   3 m3-*  directing an AI helper (the first version of this module) 6 m6-*  true or made up? and asking first
//   hour.js       the missions, the saved progress and the record (pure)
//   kit.js, cut.js, words.js, camera.js, picture.js, art.js, m*-<name>.js   pure rules, words and drawings (tests/film*.test.mjs)
//   player.js     moves the game's camera through the town (browser only)
//   ui.js, mui.js the panels over the 3D view           screen.js   the screen left in the town
import { findSet } from './kit.js';
import { restore } from './cut.js';
import { MISSIONS, restoreHour, finishMission, allDone, hourLines, hourPractised } from './hour.js';
import { createUi, CSS } from './ui.js';
import { createMissionUi, MCSS } from './mui.js';
import { createPlayer } from './player.js';
import { showScreen } from './screen.js';
import { playCrew } from './m1-play.js';
import { playStory } from './m2-play.js';
import { playDirect, summary } from './m3-direct.js';
import { playEdit } from './m4-play.js';
import { playAccess } from './m5-play.js';
import { playTruth } from './m6-play.js';

const tileList = (terrain) => (terrain?.tiles instanceof Map ? [...terrain.tiles.values()] : [...(terrain?.tiles || [])]);
const PLAY = { crew: playCrew, story: playStory, edit: playEdit, access: playAccess, truth: playTruth };

export default {
  id: 'film', icon: '🎬',
  title: { j: 'Town film studio', s: 'Town film studio' },
  blurb: { j: 'Six film jobs: shots, stories, directing, editing, captions, checking.', s: 'Six jobs in film and TV, from storyboards to captions and checking.' },
  css: CSS + MCSS,

  async run(ctx) {
    const junior = !!ctx.junior; const reduce = !!ctx.settings.reduceMotion;
    const tiles = tileList(ctx.town.terrain); const cells = ctx.town.cells || [];
    const set = findSet(cells, tiles, ctx.town.sim, (k) => ctx.engine.world.tileTop(k).y);
    let player = null;
    const ui = createUi(ctx, { junior, reduce, onPanel: (f) => player?.setLow(f) }); ctx.onLeave(() => ui.off());
    if (!set.places.length) { ctx.report({ stage: 'Nothing to film yet' }); ui.talk('There is nothing here to film yet. Go back to your town and try again.'); await ctx.left; return { finished: false }; }
    player = createPlayer(ctx, set, { reduce }); ctx.onLeave(() => player.dispose());
    if (globalThis.__filmTest) globalThis.__filmCam = { player, set }; // the browser test frames each shot itself (tests/playwright/film-cam.mjs)
    const mui = createMissionUi(ctx, ui, { junior, onPanel: (f) => player?.setLow(f) }); ctx.onLeave(() => mui.off());
    const hour = restoreHour(ctx.saved); const save = () => ctx.save(hour);
    const env = { ctx, ui, mui, player, set, junior, reduce };

    // ---- the mission map: play the next mission, or replay a finished one, until the child finishes the hour
    for (;;) {
      ctx.report({ stage: 'Film studio: the mission map' });
      player.setMood('cheerful'); player.look({ move: 'wide', sub: 'town' });
      const a = await mui.map(hour);
      if (a.act === 'finish' && allDone(hour)) break;
      const m = MISSIONS[a.i]; if (!m) continue;
      if (await mui.intro(m) === 'map') continue;
      ctx.report({ stage: `Mission ${m.n}: ${m.use}` });
      let out;
      if (m.id === 'direct') { const d = await playDirect(env, hour.m3, (s) => { hour.m3 = s; save(); }); out = { res: { cuts: d.st.cut.n }, lines: [d.line] }; }
      else if (m.id === 'edit') { // mission 4 is long: its finished parts are saved, so leaving part way keeps them
        const parts = new Set(hour.m4 || []); out = await playEdit({ ...env, parts: { has: (p) => parts.has(p), add: (p) => { parts.add(p); hour.m4 = [...parts]; save(); } } }); hour.m4 = null;
      } else out = await PLAY[m.id](env);
      await mui.flushHeld(); // nothing set aside is left behind when a mission ends
      finishMission(hour, a.i, out.res); save(); // saved after every mission: leaving later keeps it
      ctx.report({ stage: `Mission ${m.n} done: ${m.use}` });
      await mui.outro(m, out.lines);
    }

    // ---- the record: one line a mission, the film from mission 3 as the picture, and its screen in the town
    const m3 = hour.m3?.cut ? restore({ ...hour.m3, done: false }, set) : null; const sum = m3?.cut ? summary(m3, set, junior) : null;
    save();
    ctx.report({ stage: 'Film studio: all six missions done', state: 'finished', finished: true });
    return { finished: true,
      record: { made: { title: sum ? sum.title : 'My hour in the film studio', lines: hourLines(hour, sum?.line), ...(sum ? { picture: sum.picture } : {}) }, practised: hourPractised(hour) },
      town: sum ? { kind: 'film-screen', data: sum.town } : null };
  },

  // The film's opening frame on a big screen by the hall or the market (else by the AI Lab).
  show(townCtx, data) { try { return showScreen(townCtx, data); } catch (e) { console.error('film screen:', e); return () => {}; } },
};
