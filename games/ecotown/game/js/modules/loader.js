// The loader for the "Eco Town of the future" modules (docs/MODULES.md). It is the only thing that opens a module,
// gives it the town and the engine, keeps what it hands back, and shows its result in the town. A module never
// writes the save itself and never edits the game's shared files.
import * as THREE from 'three';
import { h, esc } from '../ui/ui.js';
import { MODULE_IDS, ON_BOARD, CONTRACT, checkModule, cleanResult, cleanReport, cleanState, storedModule } from './contract.js';

// One line per module. Each folder's index.js is that module (a placeholder until its builder replaces it).
const REGISTRY = { drone: () => import('./drone/index.js'), robots: () => import('./robots/index.js'), roads: () => import('./roads/index.js'),
  film: () => import('./film/index.js'), power: () => import('./power/index.js') };
const PIC = (id) => `ecotown.modpic.${id}`; // a module's picture for the take-home page: on this device only, never sent
const loaded = new Map(); const styled = new Set(); let shown = [];

export async function loadModule(id) {
  if (!MODULE_IDS.includes(id)) return null;
  if (!loaded.has(id)) { const mod = (await REGISTRY[id]()).default; const bad = checkModule(mod, id); if (bad.length) { console.error(`module ${id}:`, bad.join('; ')); return null; } loaded.set(id, mod); }
  return loaded.get(id);
}
const pick = (o, j) => (j ? o.j : o.s);
const BASE_CSS = `#module { position: absolute; inset: 0; z-index: 30; pointer-events: none; font-family: Inter, system-ui, sans-serif; color: #3b2a1e; }
#module > .modroot { position: absolute; inset: 0; pointer-events: none; } #module > .modroot > * { pointer-events: auto; }
#module > .modback { position: absolute; left: 12px; top: 12px; z-index: 5; pointer-events: auto; min-height: 44px; padding: 8px 16px; border: 0; border-radius: 14px; background: #fffaf0; color: #3b2a1e; font: 800 1rem Inter, system-ui, sans-serif; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; cursor: pointer; }
#module > .modback:focus-visible { outline: 3px solid #2e9b5a; outline-offset: 2px; }
html[data-module] #card, html[data-module] #strip, html[data-module] #build, html[data-module] #florence, html[data-module] #camctl, html[data-module] #labels { display: none !important; }`;
function style(id, css) { if (styled.has(id)) return; styled.add(id); const s = document.createElement('style'); s.dataset.module = id; s.textContent = css; document.head.appendChild(s); }

// Open one module on top of the town. Resolves with what was kept ({ finished, record, town }) or null.
export async function openModule(app, id) {
  const G = app.G; const mod = await loadModule(id); if (!mod || !G?.hostModule) return null;
  return G.hostModule(async (host) => {
    style('base', BASE_CSS); if (mod.css) style(id, mod.css);
    for (const off of shown) { try { off(); } catch (e) { console.error(e); } } shown = []; // what modules left in the town is put away while one is open; showInTown draws it again afterwards
    const j = G.j; const wrap = h(`<div id="module" data-module="${id}"><button class="modback" type="button">← ${j ? 'Back to my town' : 'Back to the town'}</button><div class="modroot"></div></div>`);
    document.getElementById('layer').appendChild(wrap); document.documentElement.dataset.module = id;
    // the game underneath takes no keys or focus while a module is open (Tab used to wander into the hidden town panels)
    const inerted = [...document.getElementById('layer').children, document.getElementById('gl')].filter((el) => el && el !== wrap && !el.inert); for (const el of inerted) el.inert = true;
    const root = wrap.querySelector('.modroot'); const ctl = new AbortController(); const leaves = []; let frame = null; let state = cleanState(G.modules?.[id]?.state);
    const left = new Promise((res) => { const go = () => { if (!ctl.signal.aborted) { ctl.abort(); res('left'); } }; wrap.querySelector('.modback').onclick = go; ctl.signal.addEventListener('abort', () => res('left')); });
    const camWas = { p: app.stage.camera.position.clone(), q: app.stage.camera.quaternion.clone(), fov: app.stage.camera.fov };
    const ctx = {
      contract: CONTRACT, id, band: G.band, junior: j,
      settings: { readAloud: !!app.ui.readAloud, reduceMotion: !!app.reduce, largeText: app.settings?.text === 'large' },
      // the child's own town, to read: a copy of its tiles, the simulation's result and the island's layout
      town: { cells: host.cells, sim: host.sim, terrain: app.terrain, extra: host.extra },
      // the 3D engine. The island and the town stay in the scene; a module may add its own things to scene and must
      // remove them when it ends. onFrame(fn): fn(dt, t) runs every frame after the game's own camera, so a module can
      // place the camera itself (set camera.position / quaternion / fov there).
      engine: { THREE, scene: app.stage.scene, camera: app.stage.camera, renderer: app.stage.renderer, stage: app.stage, world: app.world, rig: app.rig, life: app.life, florence: app.bot, audio: app.audio, setMusic: (mood) => app.setMusic?.(mood) /* the game's own mood music: 'day' | 'night' | 'lab' | 'celebrate' */, canvas: app.stage.renderer.domElement,
        onFrame(fn) { frame = fn; app.moduleFrame = (dt, t) => { try { frame?.(dt, t); } catch (e) { console.error(e); } }; } },
      root,                                             // the module's own layer over the 3D view: put its panels here
      say(text, voice = 'helper') { app.ui.say(text, voice); }, // read aloud (only when read-aloud is on)
      report(r) { host.status(cleanReport(id, r)); },   // where the child is, for the leader's list
      saved: state, save(s) { state = cleanState(s); G.modules = { ...(G.modules || {}), [id]: storedModule(G.modules?.[id], null, state) }; G.save(); },
      signal: ctl.signal, left, onLeave(fn) { leaves.push(fn); },
    };
    host.status(cleanReport(id, { stage: pick(mod.title, j) }));
    let raw = null;
    try { raw = await Promise.race([Promise.resolve().then(() => mod.run(ctx)), left.then(() => null)]); }
    catch (e) { console.error(`module ${id} stopped:`, e); }
    finally {
      if (!ctl.signal.aborted) ctl.abort();
      for (const fn of leaves) { try { fn(); } catch (e) { console.error(e); } }
      for (const el of inerted) el.inert = false;
      app.moduleFrame = null; wrap.remove(); delete document.documentElement.dataset.module;
      app.stage.camera.position.copy(camWas.p); app.stage.camera.quaternion.copy(camWas.q); app.stage.camera.fov = camWas.fov; app.stage.camera.updateProjectionMatrix();
    }
    const result = cleanResult(raw);
    if (result && (result.record || result.town)) {
      if (result.record?.made.picture) { try { localStorage.setItem(PIC(id), result.record.made.picture); } catch { /* storage off or full: the page shows the words */ } }
      G.modules = { ...(G.modules || {}), [id]: storedModule(G.modules?.[id], result, state) }; G.save();
      host.status(cleanReport(id, { stage: pick(mod.title, j), state: result.finished ? 'finished' : 'playing', finished: result.finished }));
      const pic = result.record?.made.picture; const picHtml = !pic ? '' : pic.startsWith('data:image/png;base64,') ? `<img alt="" src="${pic}">` : pic; // already checked by cleanMade: inline SVG without script, or a PNG
      if (result.record) await app.ui.modal(`<div class="ribbon green">${esc(mod.icon)} ${esc(pick(mod.title, j))}</div><h2>${esc(result.record.made.title)}</h2>
        ${picHtml ? `<div class="modpic" style="max-width:420px;margin:6px auto;border-radius:10px;overflow:hidden;box-shadow:inset 0 0 0 2px #e6d3b0">${picHtml}</div>` : ''}
        ${result.record.made.lines.length ? `<div class="practised plain"><small>${j ? 'You made' : 'You made'}</small><ul>${result.record.made.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>` : ''}
        <div class="practised"><small>You practised</small><ul>${result.record.practised.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>
        <div class="row" style="justify-content:center"><button class="btn go" data-act="ok">${j ? 'Back to my town' : 'Back to the town'} ➜</button></div>`, { say: `You practised: ${result.record.practised.join('. ')}` });
    }
    return result;
  }).then(async (r) => { await showInTown(app); return r; });
}

// Each finished module leaves one visible thing in the town (a flying drone, a working robot, a rebuilt street).
// The module draws it: show({ engine, town, junior, reduceMotion }, data) returns a function that removes it.
export async function showInTown(app) {
  for (const off of shown) { try { off(); } catch (e) { console.error(e); } } shown = [];
  const G = app.G; if (!G?.modules || G.challenge) return;
  for (const id of MODULE_IDS) {
    const t = G.modules[id]?.town; if (!t) continue; const mod = await loadModule(id); if (!mod?.show) continue;
    try { const off = mod.show({ engine: { THREE, scene: app.stage.scene, world: app.world, life: app.life, stage: app.stage }, town: { cells: [...G.cells].map(([k, c]) => [k, { ...c }]), terrain: app.terrain }, junior: G.j, reduceMotion: !!app.reduce }, t.data); if (typeof off === 'function') shown.push(off); }
    catch (e) { console.error(`module ${id} show:`, e); }
  }
}

// The board: the three modules, which are done, and a way in. Opened from the menu.
export async function moduleBoard(app) {
  const G = app.G; if (!G?.canMenu?.()) return; const j = G.j; const mods = (await Promise.all(ON_BOARD.map(loadModule))).filter(Boolean);
  const a = await app.ui.modal(`<div class="ribbon">🚀 ${j ? 'Eco Town of the future' : 'Eco Town of the future'}</div><h2>${j ? 'Work with the machines' : 'Working with machines'}</h2>
    <div class="modboard" style="display:grid;gap:10px;text-align:left">${mods.map((m) => `<button class="age chcard ${G.modules?.[m.id]?.done ? 'won' : ''}" data-act="${m.id}"><b class="chico" aria-hidden="true">${esc(m.icon)}</b><span><b>${esc(pick(m.title, j))}</b><small>${esc(pick(m.blurb, j))}</small><em>${G.modules?.[m.id]?.done ? '✓ Done: play again' : G.modules?.[m.id] ? '▶ Carry on' : 'Not tried yet'}</em></span></button>`).join('')}</div>
    <div class="row" style="justify-content:center;margin-top:10px"><button class="btn alt" data-act="close">${j ? 'Back to my town' : 'Back to the town'}</button></div>`);
  if (ON_BOARD.includes(a)) return openModule(app, a);
}
// The picture a module left for the take-home page (on this device only), or null.
export const modulePicture = (id) => { try { return localStorage.getItem(PIC(id)); } catch { return null; } };
