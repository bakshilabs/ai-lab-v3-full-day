// The Eco Town game: the start page that joins the six trial levels into one game.
// It shows the town with six places in the order of the game, opens a level in a frame when the child starts it, learns from the level that it has ended,
// builds that place in the town, leads on to the next level, and after the sixth level shows the ending of the hour.
// There is no score, no coins, no stars, no timer and no way to fail. A level that is done is shown as done, and any level may be played again.
// Which levels are done is remembered on this device only. If the device will not remember, the game still works until the page is closed.
// Nothing is sent anywhere, and no outside file is loaded. EVERY WORD BELOW IS A PLACEHOLDER.
import { $, btn, ui, esc, setPlace } from '../level-kit/shell.js';
import { setScene, start, plate, wait, QS, project } from '../level-kit/stage.js';
import { beep, chime } from '../level-kit/sound.js';
import { makeTown } from './town.js';

// ---- the six levels, in the order of the game ------------------------------------------------------------------------------------------
// page is the level's own page, which this game never changes. name is the short name on its sign in the town
export const LEVELS = [
  { name: 'Land', page: '../levels/land/index.html' },
  { name: 'Getting around', page: '../levels/getting-around/index.html' },
  { name: 'Homes', page: '../trial/index.html' },
  { name: 'Food', page: '../levels/food/index.html' },
  { name: 'Power', page: '../levels/power/index.html' },
  { name: 'School', page: '../levels/school/index.html' },
];

// ---- the words (placeholders) ----------------------------------------------------------------------------------------------------------------
// intro, jobsTitle, jobsLine, the three jobs and breakLine are the approved sample words for Eco Town in docs/redesign/wireframes-data.js (town 0), copied on 24 Nov 2026.
// The other words were written for this trial only. None of them is the game's final text.
const W = {
  label: 'This is a trial game. Its words are placeholders.', title: 'Eco Town', sub: 'Plan a town with Florence',
  intro: 'Welcome to Eco Town. This is a small town with homes, farms and a river. We are going to plan it together so that it is a good place to live.',
  six: 'There are six places to plan. The first one is Land.', start: 'Start',
  soFar: (n) => `You have planned ${n} of the 6 places in Eco Town.`, added: (name) => `Your plan for ${name} is now part of Eco Town.`,
  nextIs: (n, name) => `The next place is number ${n}, ${name}.`, carry: 'Carry on',
  all: 'You have planned all six places in Eco Town.', again: 'You can play any place again. Click its sign.', seeEnd: 'See the finished town',
  done: 'Done', here: 'Next', squares: 'The six places',
  goOn: 'Go on', back: 'Back to Eco Town', levelOf: (n) => `Level ${n} of 6`,
  reset: 'Start a new town', resetAsk: ['Do you want to start a new town?', 'The places you have planned will become empty plots again.'], resetYes: 'Yes, start a new town', resetNo: 'No, keep my town',
  endT: 'Eco Town is planned', endSay: ['It is evening in Eco Town, and every window is lit.', 'You planned this town with me, one place at a time.'], next: 'Next',
  jobsTitle: 'Real jobs that use these skills', jobsLine: 'People do this kind of work every day when they plan real towns.',
  jobs: [['A town planner', 'decides where homes, streets and parks should go.'], ['An architect', 'designs homes and schools.'], ['An engineer', 'designs roads, bridges and power lines.']],
  breakLine: 'It is time for a break. The next town opens next week.',
};
// a small picture for each job: a map with a pin, a drawing of a home, and a bridge
const INK = 'fill="none" stroke="#1f2a44" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
const JOBPIC = [
  `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 16l16-6 20 6 16-6v38l-16 6-20-6-16 6z" fill="#bfe6a8" ${INK.replace('fill="none" ', '')}/><path d="M22 10v38M42 16v38" ${INK}/><path d="M32 40c-7-9-8-12-8-15a8 8 0 0116 0c0 3-1 6-8 15z" fill="#e0503a" ${INK.replace('fill="none" ', '')}/></svg>`,
  `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="8" width="52" height="48" rx="4" fill="#cfe6f8" ${INK.replace('fill="none" ', '')}/><path d="M18 46V30l14-12 14 12v16z" fill="#fff" ${INK.replace('fill="none" ', '')}/><path d="M28 46V36h8v10" ${INK}/></svg>`,
  `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 50h56" ${INK}/><path d="M8 36h48v8H8z" fill="#ffd257" ${INK.replace('fill="none" ', '')}/><path d="M12 36c0-14 40-14 40 0" ${INK}/><path d="M22 28v8M32 25v11M42 28v8M16 44v6M48 44v6" ${INK}/></svg>`,
];

// ---- what is remembered ------------------------------------------------------------------------------------------------------------------------
// done holds the levels whose last closing picture the child has reached. It is kept on this device only, and every use of the device's memory may fail quietly
const KEY = 'eco-town-game-1';
const done = new Set(); try { for (const i of JSON.parse(localStorage.getItem(KEY) || '[]')) if (Number.isInteger(i) && i >= 0 && i < LEVELS.length) done.add(i); } catch (e) { /* nothing is remembered, and the game starts from the beginning */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...done])); } catch (e) { /* the game goes on without it */ } };
const shown = new Set(done);                                    // the places that the town already shows as built
const nextOf = () => LEVELS.findIndex((_, i) => !done.has(i));   // the first level that is not done, or -1 when all six are done
let town = null, playing = -1, frame = null;

// ---- the page ----------------------------------------------------------------------------------------------------------------------------------------
setPlace({ number: 1, town: W.title, level: '', label: W.label });
document.body.insertAdjacentHTML('beforeend', '<div class="play ui" id="play" hidden><div class="bar" id="bar"></div><div id="hold" style="flex:1;min-height:0;display:flex"></div></div>');
const app = document.querySelector('.app');
// the six squares: a tick for a level that is done, yellow for the one that comes next (or the one being played)
const squares = (now) => `<ol class="ui-progress" aria-label="${esc(W.squares)}">${LEVELS.map((l, i) => `<li class="${done.has(i) ? 'is-done' : ''}${i === now ? ' is-now' : ''}" title="${esc(l.name)}">${i + 1}</li>`).join('')}</ol>`;
const titleHtml = `${esc(W.title)}<small>${esc(W.sub)}</small>`;

// the signs over the six places. A sign can be clicked to play its level, whether it is done or not
function signs() { const n = nextOf(); town.signs = town.signs || LEVELS.map((_, i) => { const p = plate(town, '', town.signAt(i, false), 'lv'); p.el.onclick = () => { if (town.open) open(i); }; return p; });
  town.signs.forEach((p, i) => { const d = shown.has(i), nx = i === n && town.open; p.pos.set(...town.signAt(i, d)); p.el.className = `plate lv${d ? ' is-done' : ''}${nx ? ' on tap' : ''}${town.open ? '' : ' off'}`;
    p.el.innerHTML = `<b class="n">${i + 1}</b><span>${esc(LEVELS[i].name)}${d ? `<small>${esc(W.done)}</small>` : nx ? `<small>${esc(W.here)}</small>` : ''}</span>${d ? '<i class="mark g">✓</i>' : ''}`; }); }
// Florence's band on the start page: what she says, the six squares, and one big yellow button to start or carry on
function band(arrived = -1, busy = false) { const n = nextOf(), count = done.size, prog = document.createElement('div'); prog.className = 'prog'; prog.innerHTML = squares(n); let say, go;
  if (!count) { say = [W.intro, W.six]; go = btn(W.start, 'sun big', () => open(0)); }
  else if (n < 0) { say = [W.all, W.again]; go = btn(W.seeEnd, 'sun big', ending); }
  else { say = [arrived >= 0 && done.has(arrived) ? W.added(LEVELS[arrived].name) : W.soFar(count), W.nextIs(n + 1, LEVELS[n].name)]; go = btn(W.carry, 'sun big', () => open(n)); }
  go.disabled = busy; const fresh = btn(W.reset, 'small', askReset); fresh.disabled = busy;
  document.body.classList.add('home'); ui({ stepHtml: titleHtml, say, tray: [prog, ...(count ? [fresh] : []), go], over: '' }); }
function askReset() { ui({ stepHtml: titleHtml, say: W.resetAsk, tray: [btn(W.resetNo, 'sun', () => band()), btn(W.resetYes, '', () => { done.clear(); shown.clear(); save(); home(); })], over: '' }); }
// the town by day, with the places that are done already built
function home() { town = setScene(makeTown({ built: shown, next: nextOf(), onPick: (i) => open(i) })); signs(); band(); }

// ---- playing a level ------------------------------------------------------------------------------------------------------------------------------
// The level's own page is opened in a frame that fills the page under a narrow bar. "?next=" asks the kit for one more button on the level's last closing picture (see level-kit/flow.js).
// speed, fx, plain and fps are passed on from this page's address, so that the whole game can be checked quickly
function open(i) { if (playing >= 0 || !town || !town.open) return; playing = i; beep(660, 0.08);
  const q = new URLSearchParams({ next: W.goOn }); for (const k of ['speed', 'fx', 'plain', 'fps']) if (QS.has(k)) q.set(k, QS.get(k));
  frame = document.createElement('iframe'); frame.title = `${W.levelOf(i + 1)}: ${LEVELS[i].name}`; frame.style.cssText = 'flex:1;border:0;width:100%'; frame.src = `${LEVELS[i].page}?${q}`;
  $('hold').replaceChildren(frame); bar(); $('play').hidden = false; app.classList.add('asleep'); }
function bar() { const i = playing, el = $('bar'); el.innerHTML = `<button type="button">${esc(W.back)}</button><span class="where"><b>${esc(W.levelOf(i + 1))}</b> ${esc(LEVELS[i].name)}</span>${squares(i)}`; el.querySelector('button').onclick = leave; }
// The level says that it has ended: its last closing picture is showing. From then on it is done
function ended() { if (playing < 0) return; done.add(playing); save(); bar(); }
// back to the town: the frame is taken away, and if the level was done for the first time its place is built in front of the child
function leave() { if (playing < 0) return; const i = playing; playing = -1; frame = null; $('hold').replaceChildren(); $('play').hidden = true; app.classList.remove('asleep'); arrive(i); }
async function arrive(i) { const s = town, fresh = done.has(i) && !shown.has(i); s.open = false; signs(); band(i, true);
  if (fresh) { await wait(0.7); if (town !== s) return; if (!await s.build(i)) return; chime(); shown.add(i); signs(); if (nextOf() < 0) { await wait(1.4); if (town === s) ending(); return; } }
  if (!await s.walkTo(nextOf())) return; s.open = true; signs(); band(i); }
addEventListener('message', (e) => { if (!frame || e.source !== frame.contentWindow || !e.data || typeof e.data !== 'object') return;
  if (e.data.ecoTownLevel === 'end') ended(); else if (e.data.ecoTownLevel === 'next') { ended(); leave(); } });

// ---- the ending of the hour ------------------------------------------------------------------------------------------------------------------------
// One closing picture: the finished town at dusk with every window lit, and the family in the middle of it. Then the real jobs that do this work
function ending() { document.body.classList.remove('home'); town = setScene(makeTown({ built: new Set(LEVELS.keys()), next: -1, dusk: true })); town.open = false; chime(); town.closer();
  ui({ step: W.endT, say: W.endSay, tray: [btn(W.next, 'sun', jobs)], over: '' }); }
function jobs() { town.aboveCards(); ui({ step: W.jobsTitle, say: [W.jobsLine, W.breakLine], tray: [btn(W.back, '', home)],
  over: W.jobs.map(([who, what], k) => `<div class="card job">${JOBPIC[k]}<p><b>${esc(who.replace(/^An? /, '').replace(/^./, (c) => c.toUpperCase()))}</b>${esc(who)} ${esc(what)}</p></div>`).join('') }); }

home(); start();
// for the script that checks the game and takes its pictures
window.game = { LEVELS, W, done, open, leave, ending, get town() { return town; }, get playing() { return playing; }, get frame() { return frame; }, project };
