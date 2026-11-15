// The take-home page on screen, with Print (or save as a PDF from the print window). See js/game/takehome.js.
import { h, esc } from './ui.js';
import { takeHome } from '../game/takehome.js';
import { drawTownMap } from './share.js';
import { loadModule, modulePicture } from '../modules/loader.js';
import { MODULE_IDS } from '../modules/contract.js';

const safePic = (p) => (!p ? '' : p.startsWith('data:image/png;base64,') ? `<img alt="" src="${p}">` : /^<svg[\s>]/.test(p) && !/<script|on\w+\s*=|javascript:/i.test(p) ? p : '');

export async function openTakeHome(app, data) {
  const G = app.G; const titles = {};
  for (const id of MODULE_IDS) { const m = await loadModule(id); if (m) titles[id] = { icon: m.icon, title: G.j ? m.title.j : m.title.s }; }
  const page = takeHome({ ...data, titles, junior: G.j, date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) });
  let map = ''; try { const c = document.createElement('canvas'); c.width = 520; c.height = 380; drawTownMap(c, app.terrain, G.cells); map = c.toDataURL('image/png'); } catch { /* no picture: the words still print */ }
  const list = (xs) => (xs.length ? `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  document.getElementById('takehome')?.remove();
  const el = h(`<div id="takehome" role="dialog" aria-label="Take-home page"><div class="thbar"><button class="btn alt" data-close>✕ Close</button><button class="btn go" data-print>🖨 Print or save</button></div>
    <div class="thpage">
      <p class="thtop">Eco Town · ${esc(page.date)}</p><h1>${esc(page.title)}</h1>
      <p class="thname">Made by <span></span></p>
      <section class="thtown"><div>${map ? `<img class="thmap" alt="A map of the town" src="${map}">` : ''}</div><div><h2>${esc(page.town.heading)}${page.town.name ? `: ${esc(page.town.name)}` : ''}</h2>${list(page.town.made)}<h3>I practised</h3>${list(page.town.practised)}</div></section>
      ${page.modules.map((m) => `<section class="thmod"><div class="thpic">${safePic(modulePicture(m.id))}</div><div><h2>${esc(m.icon)} ${esc(m.heading)}</h2><p class="thmade"><b>${esc(m.title)}</b></p>${list(m.lines)}<h3>I practised</h3>${list(m.practised)}</div></section>`).join('')}
      <section class="thask"><h2>Ask me at home</h2><p>${esc(page.ask)}</p></section>
      <p class="thfoot">${esc(page.foot)}</p>
    </div></div>`);
  document.body.appendChild(el);
  const close = () => { el.remove(); delete document.documentElement.dataset.print; };
  el.querySelector('[data-close]').onclick = close; el.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  el.querySelector('[data-print]').onclick = () => { document.documentElement.dataset.print = 'takehome'; const done = () => { delete document.documentElement.dataset.print; window.removeEventListener('afterprint', done); }; window.addEventListener('afterprint', done); window.print(); };
  el.querySelector('[data-print]').focus();
  return page;
}
