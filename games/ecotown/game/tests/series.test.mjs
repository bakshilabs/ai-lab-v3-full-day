// The AI Lab series (js/series.js): the welcome's scenes, the four parts and the start page's ticks.
import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
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

test('the start page’s ticks follow what has been done; parts 2 to 6 are coming soon', () => {
  const none = progress(null, false);
  assert.equal(none.next, 'welcome'); assert.equal(none.town, 'new'); assert.equal(none.hasTown, false);
  const seen = progress(null, true); assert.equal(seen.next, 'town');
  const building = progress({ band: 'junior', cells: [['1,1', {}]], labs: { land: { stars: 3 } } }, true);
  assert.equal(building.town, 'started'); assert.equal(building.townNote, '1 of 6 missions done'); assert.equal(building.next, 'town');
  // the five modules are coming soon (owner, 25 Nov 2026): whatever was saved, they show "Coming soon" and are never next
  const morning = progress({ band: 'junior', cells: [['1,1', {}]], sessionDone: true, modules: { drone: { done: true }, robots: { state: {} } } }, true);
  assert.equal(morning.town, 'done'); assert.deepEqual([morning.drone, morning.robots, morning.roads, morning.film, morning.power], ['soon', 'soon', 'soon', 'soon', 'soon']);
  assert.equal(morning.next, null, 'nothing to do next once Eco Town is done');
  assert.deepEqual(Object.keys(LABEL), ['done', 'started', 'new', 'soon']); assert.equal(LABEL.soon, 'Coming soon');
  assert.deepEqual(PARTS.filter((p) => p.soon).map((p) => p.id), ['drone', 'robots', 'roads', 'film', 'power']);
});
test('the start page has a place for the welcome and the parts, and no inline script', () => {
  const html = readFileSync(new URL('../start.html', import.meta.url), 'utf8');
  assert.match(html, /data-part="welcome"/); assert.match(html, /data-parts/); assert.match(html, /<script type="module" src="js\/hub\.js"><\/script>/);
  assert.equal((html.match(/<script/g) || []).length, 1, 'one script tag, a file: the site forbids inline scripts');
  assert.doesNotMatch(html, /https?:\/\//, 'nothing loaded from outside');
});

test('the start page keeps its ways in, and its motion respects reduced motion', () => {
  const html = readFileSync(new URL('../start.html', import.meta.url), 'utf8');
  for (const href of ['welcome.html', 'trailer.html', 'leader.html']) assert.ok(html.includes(`href="${href}"`), href);
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
  assert.equal(progress(null, true, 6).next, null); assert.equal(progress(null, true, 2).next, 'town');
  assert.equal(progress(oldDone, true).town, 'done', 'without the new count the old rule stands');
});

test('the welcome page plays the new film and leads into the new game; the server serves the film', () => {
  const html = readFileSync(new URL('../welcome.html', import.meta.url), 'utf8');
  for (const f of ['videos/welcome/eco-town-welcome.mp4', 'videos/welcome/eco-town-welcome.vtt', 'eco-town/concepts/game/index.html', 'welcome-page.js']) assert.ok(html.includes(f), f);
  assert.doesNotMatch(html, /<script>/, 'no inline script');
  for (const f of ['eco-town-welcome.mp4', 'eco-town-welcome.jpg', 'eco-town-welcome.vtt']) assert.ok(existsSync(new URL(`../videos/welcome/${f}`, import.meta.url)), f);
  assert.match(readFileSync(new URL('../../worker/router.js', import.meta.url), 'utf8'), /episodes\|trailer\|welcome/);
});
