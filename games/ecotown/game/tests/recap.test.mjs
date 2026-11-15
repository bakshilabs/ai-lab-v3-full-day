// "You practised…" recaps (js/game/recap.js): built from what the player did, different for different play.
import test from 'node:test'; import assert from 'node:assert/strict';
import { missionRecap, sessionRecap } from '../js/game/recap.js';

test('a mission recap says what this player did in this mission', () => {
  const caught = missionRecap({ path: 'flawed', lens: 'flood', late: false, tries: 1 });
  assert.match(caught[0], /your flood check found the problem/); assert.equal(caught.length, 3);
  const late = missionRecap({ path: 'flawed', lens: 'carbon', late: true, tries: 3 });
  assert.doesNotMatch(late[0], /your carbon check found/, 'the game showed it: the recap does not say the player found it'); assert.match(late[2], /3 tries/);
  const clean = missionRecap({ path: 'clean' }); assert.match(clean[0], /clear instruction/);
  assert.notDeepEqual(caught, clean);
  assert.match(missionRecap({ path: 'clean', short: 'partly' }).join('|'), /miss your own target/);
  assert.match(missionRecap({ path: 'flawed', lens: 'carbon', short: 'broke' }, false).join('|'), /broke a limit/);
  assert.match(missionRecap({ path: 'flawed', lens: 'walk', bias: true }).join('|'), /forgot to count/);
  for (const r of [caught, late, clean]) assert.ok(r.length >= 2 && r.length <= 4);
});

test('two different sessions give two different, accurate recaps', () => {
  const a = sessionRecap({ land: { path: 'flawed', lens: 'flood', late: false, tries: 1 }, move: { path: 'flawed', lens: 'street', late: false, tries: 2 }, homes: { path: 'clean' } }, { catches: 2, goalsMet: 5, families: 24, score: 61, medal: 'bronze' });
  const b = sessionRecap({ land: { path: 'flawed', lens: 'flood', late: true, tries: 4 } }, { trusted: 3, goalsMet: 2, families: 6, score: 20 });
  assert.match(a.practised.join('|'), /found 2 mistakes yourself/); assert.match(a.practised.join('|'), /wrong ideas for your own town \(2\)/); assert.match(a.practised.join('|'), /first time \(1 time\)/);
  assert.doesNotMatch(b.practised.join('|'), /yourself/, 'nothing was caught by this player'); assert.match(b.choices.join('|'), /3 ideas of Florence’s used without checking/);
  assert.notDeepEqual(a.practised, b.practised);
  assert.match(a.result.join('|'), /24 families safely housed/); assert.match(a.result.join('|'), /5 of 8 town goals/); assert.match(a.result.join('|'), /61 out of 100 \(bronze\)/);
  assert.match(b.result.join('|'), /not finished yet/); assert.equal(a.done, 3); assert.equal(b.done, 1);
  assert.equal(a.talk.length, 2);
});

test('a session with nothing done yet still has an honest recap, and it makes no claim about learning', () => {
  const r = sessionRecap({}, { goalsMet: 0, families: 0 });
  assert.equal(r.practised.length, 1); assert.equal(r.done, 0);
  const all = JSON.stringify([sessionRecap({ land: { path: 'clean' } }, {}), missionRecap({ path: 'clean' }), sessionRecap({ land: { path: 'clean' } }, {}, false)]);
  assert.doesNotMatch(all, /you (have )?learn(ed|t)|improved|better at|mastered/i);
});

test('older saves (a mission recorded only as stars) do not break the recap', () => {
  const r = sessionRecap({ land: { stars: 3 }, move: true }, { goalsMet: 3, families: 10 });
  assert.equal(r.done, 1); assert.ok(r.practised.length >= 1);
  assert.ok(missionRecap(undefined).length >= 2);
});
