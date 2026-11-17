// Florence's intro (about 30 s, four short beats, skippable at any moment), for Florence first, then your own town
// (docs/ecotown-florence-first.md): she walks off the sky-ferry dock and says hello, shows her town and yours side by
// side, says how each level goes (tell her what to build in her town and check her plan, then build yours your way),
// and takes the player to the AI Lab door, where the first mission starts. Returns 'lab' (go to mission 1), 'skip' or 'done'.
// The game runs it on top of free building; tips are held back until it ends. Text: INTRO in content.js.
import * as THREE from 'three';
import { esc } from '../ui/ui.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// api: { app, G, T (intro text for this band), both(), mine() (camera: both towns / the player's), home(), highlight(sel, on), setAbort(f) }
export async function runIntro(api) {
  const { app, T } = api; const { ui, world, terrain, rig } = app; const bot = app.bot;
  let skipped = false; let skipResolve; const skipP = new Promise((r) => (skipResolve = r));
  const skipBtn = document.createElement('button'); skipBtn.className = 'btn alt panel introskip'; skipBtn.textContent = `${T.skip} ⏭`; skipBtn.setAttribute('data-introskip', '');
  skipBtn.onclick = () => { skipped = true; skipResolve('skip'); }; document.getElementById('layer').appendChild(skipBtn);
  // the player left for the AI Lab or the classroom mid-intro: the intro is over (it used to wait for a Next button that was
  // gone, so Skip intro stayed on screen through three missions). No camera move at the end: the Lab owns the camera now.
  let aborted = false; api.setAbort?.(() => { if (skipped) return; aborted = skipped = true; skipBtn.remove(); skipResolve('skip'); });
  const step = async (p) => { const r = await Promise.race([p, skipP]); if (skipped) throw new Error('skip'); return r; };
  const top = (k) => world.tileTop(k);
  const dockP = top(terrain.dock); const labP = top(terrain.lab);
  // one line from Florence in her card, with a button (Next, or another label), or none while she walks on
  const say = (text, { next = true, label = T.next, tag = T.tag } = {}) => new Promise((resolve) => {
    const el = ui.florence({ tag, html: `<p>${esc(text)}</p>${next ? `<div class="tiprow"><button class="slot act go" data-next aria-label="${esc(label)}"><b class="ico" aria-hidden="true">${label === T.next ? '▶' : '🧪'}</b><span>${esc(label)}</span></button></div>` : ''}`, say: text });
    el.querySelector('[data-next]')?.addEventListener('click', () => { ui.florence(null); resolve(); }); if (!next) resolve();
  });
  const go = (p, dist = 110) => (app.reduce ? rig.focus(p, { dist, pitch: 0.7 }, 0.01) : rig.focus(p, { dist, pitch: 0.7, yaw: rig.sky.yaw }, 1.3));
  let toLab = false;
  try {
    rig.startTurntable(0);
    // 1. off the sky-ferry dock, a wave hello (no tap needed)
    bot.appear(dockP.clone().add(new THREE.Vector3(1, 0, 6))); bot.look(null);
    await step(go(dockP, 100));
    await step(bot.walkTo(dockP.clone().add(new THREE.Vector3(-3, 0, -4)), { maxDur: 1.6 }));
    bot.wave(); await step(say(T.hello, { next: false })); await step(sleep(app.reduce ? 2200 : 3000));
    // 2. her town and yours, side by side (Florence first, docs/ecotown-florence-first.md)
    if (api.both) { await step(api.both()); api.highlight('#towns', true); }
    await step(say(T.towns));
    // 3. how a level goes: you tell me what to build in my town and check my plan, then you build yours your way
    await step(say(T.how)); api.highlight('#towns', false);
    // 4. the AI Lab: the first mission starts from here
    if (api.mine) await step(api.mine());
    go(labP, 100); await step(bot.walkTo(labP.clone().add(new THREE.Vector3(0, 0, 6)), { maxDur: 2.5 }));
    bot.point(labP.clone().add(new THREE.Vector3(0, 3, 0)), 2.6); api.highlight('#strip [data-lab]', true);
    await step(say(`${T.lab} ${T.overToYou}`, { label: T.go })); api.highlight('#strip [data-lab]', false); bot.cheer(); toLab = true;
  } catch (e) { if (e.message !== 'skip') throw e; }
  finally {
    skipBtn.remove(); for (const s of ['#towns', '#strip [data-lab]']) api.highlight(s, false);
    api.setAbort?.(null); world.setFlood(0); if (!aborted) { ui.florence(null); if (!toLab) await (api.home ? api.home() : rig.overview(app.reduce ? 0.01 : 1.1)); }
  }
  return toLab ? 'lab' : skipped ? 'skip' : 'done';
}
