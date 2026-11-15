// The take-home page: one printable page per child for the day. What they made and practised, in the morning's town
// and in each module of the town of the future, and one question to ask at home. It says what was made and practised,
// never what was learned or how much anyone improved. Nothing on it is sent anywhere. Pure: tests/takehome.test.mjs.
import { sessionRecap } from './recap.js';
import { MODULE_IDS } from '../modules/contract.js';

// the page is written by the child ("I practised"), so the recap's "you" becomes "I"
const mine = (x) => x.replace(/\byou found\b/g, 'I found').replace(/\byourself\b/g, 'myself').replace(/\byour own\b/g, 'my own').replace(/\byour\b/g, 'my').replace(/\byou\b/g, 'I');
const ASK = {
  drone: 'How did you tell the drone where to go?', robots: 'What did your robot get wrong at first, and what did you show it?', roads: 'What did you do with the land the car park did not need, and why?',
  film: 'What did you ask Florence to change in your film, and did it get better?', power: 'What rule did you write to keep the lights on, and when did it not work?',
  town: 'How did you find out when Florence the AI planner was wrong?', none: 'What would you build first in your own town?',
};
// labs, extra: as for sessionRecap. modules: G.modules. titles: { id: { icon, title } } for the modules.
export function takeHome({ townName = '', labs = {}, extra = {}, modules = {}, titles = {}, junior = true, date = '' } = {}) {
  const r = sessionRecap(labs, extra, junior);
  const town = { heading: junior ? 'My town' : 'The town', name: String(townName || '').slice(0, 24), made: r.result.filter((x) => !/not finished|not complete|^0 (families|households)/.test(x)), practised: r.practised.map(mine), missions: r.done };
  const mods = MODULE_IDS.filter((id) => modules?.[id]?.record).map((id) => ({ id, icon: titles[id]?.icon || '', heading: titles[id]?.title || id, title: modules[id].record.made.title, lines: modules[id].record.made.lines || [], practised: modules[id].record.practised || [], done: !!modules[id].done }));
  // one question for home: about the last module made, else about the town
  const last = mods.length ? mods.slice().sort((a, b) => (modules[b.id].at || 0) - (modules[a.id].at || 0))[0].id : r.done ? 'town' : 'none';
  return { title: junior ? 'What I made today' : 'What I made today', date, town, modules: mods, ask: ASK[last], count: mods.length,
    foot: 'This page shows what was made and practised. It was put together on this device and nothing on it was sent anywhere.' };
}
