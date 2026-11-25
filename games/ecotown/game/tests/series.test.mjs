// The AI Lab series (js/series.js): the welcome's scenes, the four parts and the start page's ticks.
import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PARTS, SCENES, EVERYWHERE, progress, LABEL } from '../js/series.js';
import { ON_BOARD } from '../js/modules/contract.js';

test('six parts in order: the town, then the five modules', () => {
  assert.deepEqual(PARTS.map((p) => p.id), ['town', 'drone', 'robots', 'roads', 'film', 'power']); assert.ok(PARTS.slice(1).every((p) => ON_BOARD.includes(p.id)), 'every part on the start page is a built module'); assert.deepEqual(PARTS.map((p) => p.n), [1, 2, 3, 4, 5, 6]);
  for (const p of PARTS) { assert.equal(p.how.length, 3, p.id); for (const l of [...p.how, p.blurb]) assert.ok(l.length <= 160, `${p.id}: short lines`); assert.match(p.query, p.id === 'town' ? /^\?part=town$/ : new RegExp(`^\\?module=${p.id}$`)); }
  assert.equal(EVERYWHERE.length, 3);
});

test('the welcome film names every part once, in order, in short spoken lines', () => {
  assert.deepEqual(SCENES.filter((s) => s.part).map((s) => s.part), PARTS.map((p) => p.id));
  for (const s of SCENES) { assert.ok(s.title && s.say && s.icon && s.view, s.id); assert.ok(s.say.length <= 150, `${s.id}: a line a child can follow`); assert.ok(s.say.split(/[.?!]/).filter((x) => x.trim()).every((x) => x.trim().split(/\s+/).length <= 20), `${s.id}: short sentences`); }
  assert.ok(SCENES.length >= 6 && SCENES.length <= 9);
  assert.doesNotMatch(JSON.stringify([SCENES, PARTS]), /you will learn|improve|better at/i, 'says what you will do, not what you will learn');
});

test('the start page’s ticks follow what has been done', () => {
  const none = progress(null, false);
  assert.equal(none.next, 'welcome'); assert.equal(none.town, 'new'); assert.equal(none.hasTown, false);
  const seen = progress(null, true); assert.equal(seen.next, 'town');
  const building = progress({ band: 'junior', cells: [['1,1', {}]], labs: { land: { stars: 3 } } }, true);
  assert.equal(building.town, 'started'); assert.equal(building.townNote, '1 of 6 missions done'); assert.equal(building.next, 'town');
  const morning = progress({ band: 'junior', cells: [['1,1', {}]], sessionDone: true, modules: { drone: { state: {} } } }, true);
  assert.equal(morning.town, 'done'); assert.equal(morning.drone, 'started'); assert.equal(morning.next, 'drone');
  const all = progress({ band: 'junior', cells: [], completeShown: true, modules: { drone: { done: true }, robots: { done: true }, roads: { done: true }, film: { done: true }, power: { done: true } } }, true);
  assert.equal(all.next, null); assert.deepEqual([all.town, all.drone, all.robots, all.roads, all.film, all.power], ['done', 'done', 'done', 'done', 'done', 'done']);
  const skipped = progress({ band: 'junior', cells: [], sessionDone: true, modules: { robots: { done: true } } }, true);
  assert.equal(skipped.next, 'drone', 'the first part not done yet');
  assert.deepEqual(Object.keys(LABEL), ['done', 'started', 'new']);
});

test('the start page has a place for the welcome and the parts, and no inline script', () => {
  const html = readFileSync(new URL('../start.html', import.meta.url), 'utf8');
  assert.match(html, /data-part="welcome"/); assert.match(html, /data-parts/); assert.match(html, /<script type="module" src="js\/hub\.js"><\/script>/);
  assert.equal((html.match(/<script/g) || []).length, 1, 'one script tag, a file: the site forbids inline scripts');
  assert.doesNotMatch(html, /https?:\/\//, 'nothing loaded from outside');
});

test('the start page keeps its ways in, and its motion respects reduced motion', () => {
  const html = readFileSync(new URL('../start.html', import.meta.url), 'utf8');
  for (const href of ['index.html?welcome=1', 'trailer.html', 'leader.html']) assert.ok(html.includes(`href="${href}"`), href);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/); assert.match(html, /data-state="welcome"/);
  assert.doesNotMatch(html, /\b(coins?|budget|money|price)\b/i, 'no money words');
  const hub = readFileSync(new URL('../js/hub.js', import.meta.url), 'utf8'); const motion = readFileSync(new URL('../js/landing.js', import.meta.url), 'utf8');
  assert.match(hub, /partHref\(p, GAME\)/, 'each part links to its own address'); assert.match(motion, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(hub + motion, /https?:\/\//, 'nothing loaded from outside');
});

test('Eco Town opens the new game; the other parts open their module; the town tick follows the new game', async () => {
  const { PARTS, partHref, progress } = await import('../js/series.js');
  assert.equal(partHref(PARTS[0], 'play.html'), 'eco-town/concepts/game/index.html');
  for (const p of PARTS.slice(1)) assert.equal(partHref(p, 'play.html'), `play.html?module=${p.id}`);
  const oldDone = { cells: [1], band: 'junior', labs: { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 } };
  assert.equal(progress(oldDone, true, 0).town, 'new', 'an old town does not tick the new game');
  assert.equal(progress(null, true, 3).town, 'started'); assert.equal(progress(null, true, 6).town, 'done');
  assert.equal(progress(null, true, 6).next, 'drone'); assert.equal(progress(null, true, 2).next, 'town');
  assert.equal(progress(oldDone, true).town, 'done', 'without the new count the old rule stands');
});
