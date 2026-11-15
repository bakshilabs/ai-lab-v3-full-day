// The AI Lab series (js/series.js): the welcome's scenes, the four parts and the start page's ticks.
import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PARTS, SCENES, EVERYWHERE, progress, LABEL } from '../js/series.js';
import { MODULE_IDS } from '../js/modules/contract.js';

test('four parts in order: the town, then the three modules', () => {
  assert.deepEqual(PARTS.map((p) => p.id), ['town', ...MODULE_IDS]); assert.deepEqual(PARTS.map((p) => p.n), [1, 2, 3, 4]);
  for (const p of PARTS) { assert.equal(p.how.length, 3, p.id); for (const l of [...p.how, p.blurb]) assert.ok(l.length <= 160, `${p.id}: short lines`); assert.match(p.query, p.id === 'town' ? /^\?part=town$/ : new RegExp(`^\\?module=${p.id}$`)); }
  assert.equal(EVERYWHERE.length, 3);
});

test('the welcome film names every part once, in order, in short spoken lines', () => {
  assert.deepEqual(SCENES.filter((s) => s.part).map((s) => s.part), PARTS.map((p) => p.id));
  for (const s of SCENES) { assert.ok(s.title && s.say && s.icon && s.view, s.id); assert.ok(s.say.length <= 150, `${s.id}: a line a child can follow`); assert.ok(s.say.split(/[.?!]/).filter((x) => x.trim()).every((x) => x.trim().split(/\s+/).length <= 20), `${s.id}: short sentences`); }
  assert.ok(SCENES.length >= 6 && SCENES.length <= 8);
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
  const all = progress({ band: 'junior', cells: [], completeShown: true, modules: { drone: { done: true }, robots: { done: true }, roads: { done: true } } }, true);
  assert.equal(all.next, null); assert.deepEqual([all.town, all.drone, all.robots, all.roads], ['done', 'done', 'done', 'done']);
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
