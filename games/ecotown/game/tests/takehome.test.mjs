// The take-home page (js/game/takehome.js): what was made and practised, never what was learned.
import test from 'node:test'; import assert from 'node:assert/strict';
import { takeHome } from '../js/game/takehome.js';
import { cleanResult, storedModule } from '../js/modules/contract.js';

const mod = (title, at) => storedModule(null, cleanResult({ finished: true, record: { made: { title, lines: ['a line', 'another'] }, practised: ['planning a route', 'breaking a job into steps'] }, town: { kind: 'k', data: {} } }), null, at);
const titles = { drone: { icon: '🚁', title: 'Drone delivery' }, robots: { icon: '🤖', title: 'Robot training' }, roads: { icon: '🚗', title: 'Roads' } };

test('a full day: the town, each module made, and one question about the last thing made', () => {
  const p = takeHome({ townName: 'Otter Bend', labs: { land: { path: 'flawed', lens: 'flood', tries: 1 } }, extra: { goalsMet: 5, families: 24, score: 61, medal: 'bronze' }, modules: { roads: mod('My street', 300), drone: mod('My drone route', 200) }, titles });
  assert.equal(p.town.name, 'Otter Bend'); assert.ok(p.town.practised.length >= 1); assert.match(p.town.made.join('|'), /24 families/);
  assert.deepEqual(p.modules.map((m) => m.id), ['drone', 'roads'], 'in the day’s order of modules, not the order played');
  assert.equal(p.modules[0].title, 'My drone route'); assert.equal(p.modules[0].practised.length, 2); assert.equal(p.modules[0].heading, 'Drone delivery');
  assert.match(p.ask, /self-driving car/, 'the question is about the module made last');
  assert.equal(p.count, 2);
});

test('a morning only, and nothing at all, still make an honest page', () => {
  const a = takeHome({ labs: { land: { path: 'clean' } }, extra: { goalsMet: 2, families: 6 } });
  assert.equal(a.modules.length, 0); assert.match(a.ask, /Florence/);
  const b = takeHome({});
  assert.equal(b.modules.length, 0); assert.match(b.ask, /build first/); assert.ok(b.town.practised.length >= 1);
  assert.ok(!b.town.made.some((x) => /not finished/.test(x)), 'the page lists what was made, not what was not');
});

test('a module that was opened but not finished is not on the page', () => {
  const p = takeHome({ modules: { robots: storedModule(null, cleanResult({ finished: false }), { step: 2 }, 100) }, titles });
  assert.equal(p.modules.length, 0);
});

test('the page never says what was learned or improved', () => {
  const all = JSON.stringify([takeHome({ labs: { land: { path: 'flawed', lens: 'flood' }, homes: { path: 'clean' } }, extra: { catches: 2, goalsMet: 8, families: 40, score: 80, medal: 'silver', complete: true }, modules: { drone: mod('x', 1) }, titles }), takeHome({}, false)]);
  assert.doesNotMatch(all, /learn(ed|t)|improved|better at|mastered|grade|level up/i);
  assert.match(all, /nothing on it was sent anywhere/);
});
