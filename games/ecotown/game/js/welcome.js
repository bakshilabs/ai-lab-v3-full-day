// The welcome: a short animated film made live with the game's own island and Florence, then a guide to getting
// around each of the six parts. Opened from the start page (index.html?welcome=1 in a copy run from source).
// It needs no town and saves only that it has been seen. Nothing typed, nothing sent.
import * as THREE from 'three';
import { h, esc } from './ui/ui.js';
import { speak, stopSpeech, loadVoices } from './ui/voice.js';
import { simulate } from './sim/sim.js';
import { seedTo } from './game/seed.js';
import { PARTS, SCENES, EVERYWHERE, WELCOME_KEY } from './series.js';
import { HUB, GAME } from './version.js';

const CSS = `#welcome { position: absolute; inset: 0; pointer-events: none; font-family: Inter, system-ui, sans-serif; color: #3b2a1e; }
#welcome > * { pointer-events: auto; }
#welcome .wbar { position: absolute; left: 12px; right: 12px; top: 12px; display: flex; justify-content: space-between; gap: 10px; pointer-events: none; }
#welcome .wbar > * { pointer-events: auto; }
#welcome button { font: 800 1rem Inter, system-ui, sans-serif; min-height: 46px; padding: 8px 18px; border: 0; border-radius: 14px; cursor: pointer; background: #fffaf0; color: #3b2a1e; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
#welcome button.go { background: #2e9b5a; color: #fff; box-shadow: inset 0 -4px 0 #1f7a44; }
#welcome button:focus-visible { outline: 3px solid #ffd257; outline-offset: 2px; }
#welcome .wcap { position: absolute; left: 50%; bottom: 26px; transform: translateX(-50%); width: min(760px, calc(100vw - 24px)); background: #fffaf0; border-radius: 22px; padding: 16px 20px; box-shadow: 0 10px 30px rgba(0,0,0,.3), inset 0 0 0 2px #e6d3b0; display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; align-items: center; }
#welcome .wcap .wico { grid-row: span 2; font-size: 3rem; line-height: 1; }
#welcome .wcap h2 { margin: 0; font: 800 1.5rem Bricolage, Inter, sans-serif; }
#welcome .wcap p { margin: 0; font-size: 1.1rem; font-weight: 600; line-height: 1.35; }
#welcome .wdots { grid-column: 1 / -1; display: flex; gap: 6px; justify-content: center; margin-top: 6px; }
#welcome .wdots i { width: 26px; height: 6px; border-radius: 3px; background: #e6d3b0; } #welcome .wdots i.on { background: #2e9b5a; } #welcome .wdots i.now { background: #f4b73b; }
#welcome .wrow { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
#welcome .wcard { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(880px, calc(100vw - 24px)); max-height: calc(100vh - 24px); overflow: auto; background: #fffaf0; border-radius: 26px; padding: 22px 24px; box-shadow: 0 14px 40px rgba(0,0,0,.35), inset 0 0 0 2px #e6d3b0; text-align: center; }
#welcome .wcard h1 { margin: 0 0 6px; font: 800 2rem Bricolage, Inter, sans-serif; } #welcome .wcard h1 span { color: #2e9b5a; }
#welcome .wcard > p { margin: 4px auto 12px; max-width: 60ch; font-weight: 600; color: #5e4936; }
#welcome .wguide { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; text-align: left; }
#welcome .wguide section { background: #fff; border-radius: 16px; padding: 12px 14px; box-shadow: inset 0 0 0 2px #e6d3b0; }
#welcome .wguide h3 { margin: 0 0 4px; font-size: 1.05rem; } #welcome .wguide h3 b { display: inline-grid; place-items: center; width: 1.7em; height: 1.7em; border-radius: 50%; background: #2b3a55; color: #fff; margin-right: 6px; font-size: .85em; }
#welcome .wguide ul { margin: 0; padding-left: 1.1em; font-size: .95rem; } #welcome .wguide li { margin: 3px 0; }
#welcome .weach { margin: 12px 0 0; background: #fff3c9; border-radius: 14px; padding: 10px 14px; text-align: left; font-size: .95rem; } #welcome .weach ul { margin: 2px 0 0; padding-left: 1.1em; }
#welcome .wend { display: flex; justify-content: center; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
@media (max-width: 700px) { #welcome .wguide { grid-template-columns: 1fr; } #welcome .wcap h2 { font-size: 1.2rem; } #welcome .wcap p { font-size: 1rem; } #welcome .wcap .wico { font-size: 2.2rem; } }`;

export async function runWelcome({ stage, world, life, terrain, bot, app }) {
  document.getElementById('boot')?.remove();
  loadVoices('junior'); // the welcome lines are in the recorded pack; without it the device voice reads them
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
  const reduce = !!app.reduce || matchMedia('(prefers-reduced-motion: reduce)').matches;
  // a finished town to look at: Florence's practice island with every mission's plan built
  try { const cells = seedTo(terrain, 'heart'); for (const t of terrain.tiles.values()) { const c = cells.get(t.k); if (c) world.setCell(t.k, c, { animate: false, reduce: true }); } life.setTown(simulate(terrain, cells), cells, stage.q); app.refreshLights?.(); } catch (e) { console.error(e); }
  stage.setTime?.(15.5, 0);
  // the island's middle and size, from its tiles
  const box = new THREE.Box3(); for (const t of terrain.tiles.values()) box.expandByPoint(world.tileTop(t.k)); const C = box.getCenter(new THREE.Vector3()); const R = box.getSize(new THREE.Vector3()).length() / 2;
  const lab = world.tileTop(terrain.lab); const flo = lab.clone().add(new THREE.Vector3(-2, 0, 7)); try { bot.appear(flo); } catch { /* no Florence: the film still plays */ }
  // camera moves: each is (k: 0..1) -> { eye, look, fov }
  const orbit = (r, hgt, a0, a1, look = C) => (k) => { const a = a0 + (a1 - a0) * k; return { eye: new THREE.Vector3(look.x + Math.cos(a) * r, look.y + hgt, look.z + Math.sin(a) * r), look, fov: 42 }; };
  const town = box.getCenter(new THREE.Vector3()); town.x += R * 0.12;
  const VIEWS = {
    wide: orbit(R * 2.3, R * 1.25, 0.9, 1.5), high: orbit(R * 2.2, R * 1.5, 1.5, 2.1),
    florence: orbit(13, 5, 1.2, 1.9, flo.clone().add(new THREE.Vector3(0, 3.2, 0))),
    town: orbit(R * 1.05, R * 0.6, 2.2, 2.9, town), low: orbit(R * 0.75, R * 0.2, 3.6, 4.5, town),
    street: orbit(R * 0.42, R * 0.13, 0.2, 0.9, town), road: orbit(R * 0.6, R * 0.3, 5.0, 5.7, town),
  };
  const cam = stage.camera; let view = VIEWS.wide, t0 = performance.now(), dur = 9000;
  app.moduleFrame = () => { const k = reduce ? 0.5 : Math.min(1, (performance.now() - t0) / dur); const e = k * k * (3 - 2 * k); const p = view(e); cam.position.copy(p.eye); cam.lookAt(p.look); if (cam.fov !== p.fov) { cam.fov = p.fov; cam.updateProjectionMatrix(); } };
  const root = h('<div id="welcome"></div>'); document.getElementById('layer').appendChild(root);
  const seen = () => { try { localStorage.setItem(WELCOME_KEY, '1'); } catch { /* storage off */ } };
  const leave = (to) => { stopSpeech(); location.href = to; };

  // 1. the opening card (a tap here also lets the browser play sound)
  await new Promise((res) => {
    root.innerHTML = `<div class="wcard"><h1>Welcome to the <span>AI Lab</span></h1><p>A short film shows you the six parts of today. Then it shows you how to get around in each one.</p>
      <div class="wend"><button data-skip>Skip the film</button><button class="go" data-play>▶ Play the welcome film</button></div></div>`;
    root.querySelector('[data-play]').onclick = () => res('play'); root.querySelector('[data-skip]').onclick = () => res('skip'); root.querySelector('[data-play]').focus();
  }).then(async (a) => {
    if (a !== 'play') return;
    // 2. the film: one scene at a time. Each moves on by itself when its line has had time to be heard; Next moves on at once.
    for (let i = 0; i < SCENES.length; i++) {
      const s = SCENES[i]; view = VIEWS[s.view] || VIEWS.wide; t0 = performance.now(); dur = Math.max(7000, s.say.length * 75);
      if (s.id === 'florence') { try { bot.wave(); } catch { /* */ } } else if (s.id === 'page') { try { bot.cheer(); } catch { /* */ } }
      root.innerHTML = `<div class="wbar"><span></span><button data-skip>Skip the film</button></div>
        <div class="wcap" role="status"><span class="wico" aria-hidden="true">${esc(s.icon)}</span><h2>${esc(s.title)}</h2><p>${esc(s.say)}</p>
        <div class="wdots" aria-hidden="true">${SCENES.map((_, n) => `<i class="${n < i ? 'on' : n === i ? 'now' : ''}"></i>`).join('')}</div>
        <div class="wrow"><button class="go" data-next>${i === SCENES.length - 1 ? 'How to get around ➜' : 'Next ➜'}</button></div></div>`;
      speak(s.say, { voice: 'narrator' });
      const how = await new Promise((res) => { const timer = reduce ? null : setTimeout(() => res('auto'), dur + 1200); root.querySelector('[data-next]').onclick = () => { clearTimeout(timer); res('next'); }; root.querySelector('[data-skip]').onclick = () => { clearTimeout(timer); res('skip'); }; root.querySelector('[data-next]').focus(); });
      stopSpeech(); if (how === 'skip') break;
    }
  });
  // 3. how to get around
  seen(); view = orbit(R * 2.3, R * 1.25, 1.5, 2.4); t0 = performance.now(); dur = 40000;
  root.innerHTML = `<div class="wcard"><h1>How to get <span>around</span></h1><p>Six parts, in this order. Each one tells you what to do as you go.</p>
    <div class="wguide">${PARTS.map((p) => `<section><h3><b>${p.n}</b>${esc(p.icon)} ${esc(p.title)}${p.time ? ` <small style="font-weight:600;color:#6f5f53">· ${esc(p.time)}</small>` : ''}</h3><ul>${p.how.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>`).join('')}</div>
    <div class="weach"><b>In every part</b><ul>${EVERYWHERE.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="wend"><button data-hub>All six parts</button><button class="go" data-start>Start part 1: Eco Town ➜</button></div></div>`;
  speak('Six parts, in this order. Each one tells you what to do as you go.', { voice: 'narrator' });
  root.querySelector('[data-hub]').onclick = () => leave(HUB); root.querySelector('[data-start]').onclick = () => leave(GAME + PARTS[0].query); root.querySelector('[data-start]').focus();
}
