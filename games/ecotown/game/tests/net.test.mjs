// The learner's own store on a device and the copy sent to the server (js/net.js).
import test from 'node:test'; import assert from 'node:assert/strict';
import { forServer, mergeFromServer, swapLearner, statusOf, SAVE_KEY } from '../js/net.js';

function fakeStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return { get length() { return m.size; }, key: (i) => [...m.keys()][i] ?? null, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), dump: () => Object.fromEntries(m) };
}
const typed = { townName: 'Lily’s Town', instructions: { land: ['my name is Lily and I live at 4 Oak Road'] }, diary: ['I wrote: hello'], reflection: 'I check first', charter: ['a promise'], mistakes: [{ level: 'land', why: 'you said “best”' }],
  outcomes: { land: { kind: 'flawed', detail: 'Florence read “best land near Oak Road” too exactly.' } } };
const town = { cells: [['3,4', { mark: 'town', item: 'timber' }]], band: 'junior', levelStars: { land: 3 }, labs: { land: { stars: 3 } }, catches: 2, at: 1000 };

test('nothing the player typed is in the copy sent to the server', () => {
  const out = forServer({ ...town, ...typed });
  const text = JSON.stringify(out);
  for (const word of ['Lily', 'Oak Road', 'hello', 'I check first', 'a promise', 'you said']) assert.ok(!text.includes(word), `leaked: ${word}`);
  assert.deepEqual(out.cells, town.cells); assert.deepEqual(out.levelStars, { land: 3 }); assert.equal(out.outcomes.land.kind, 'flawed');
  assert.deepEqual(Object.keys(out.outcomes.land), ['kind']);
  assert.equal(forServer(null), null);
});

test('an unknown field is not sent (only the listed ones are)', () => {
  assert.equal(forServer({ ...town, somethingNew: 'typed later' }).somethingNew, undefined);
});

test('the newer copy wins; typed things always come from the device', () => {
  const local = { ...town, ...typed, at: 1000 };
  assert.equal(mergeFromServer(local, { at: 900, data: forServer({ ...town, catches: 9 }) }).from, 'device');
  const m = mergeFromServer(local, { at: 2000, data: forServer({ ...town, catches: 9, at: 2000 }) });
  assert.equal(m.from, 'server'); assert.equal(m.save.catches, 9); assert.equal(m.save.at, 2000);
  assert.equal(m.save.townName, 'Lily’s Town'); assert.equal(m.save.reflection, 'I check first');
  assert.equal(m.save.outcomes.land.detail, typed.outcomes.land.detail, 'the device keeps its own sentence');
  assert.equal(mergeFromServer(local, null).from, 'device'); assert.equal(mergeFromServer(null, null).save, null);
});

test('a new device gets the town back from the server, with a plain name', () => {
  const m = mergeFromServer(null, { at: 2000, data: forServer({ ...town, ...typed }) });
  assert.equal(m.from, 'server'); assert.deepEqual(m.save.cells, town.cells); assert.equal(m.save.townName, 'Eco Town');
  assert.equal(m.save.outcomes.land.detail, '');
});

test('two learners on one browser each keep their own town', () => {
  const st = fakeStorage({ 'ecotown.prefs': '{"sound":false}' });
  assert.equal(swapLearner(st, 'A'), 'first'); st.setItem(SAVE_KEY, 'town-A'); st.setItem('ecotown.best.v1', 'best-A'); st.setItem('ecotown.save.v3.tiny', 'tiny-A');
  assert.equal(swapLearner(st, 'A'), 'same'); assert.equal(st.getItem(SAVE_KEY), 'town-A');
  assert.equal(swapLearner(st, 'B'), 'swapped');
  assert.equal(st.getItem(SAVE_KEY), null, 'B starts with no town, not with A’s'); assert.equal(st.getItem('ecotown.best.v1'), null);
  assert.equal(st.getItem('ecotown.prefs'), '{"sound":false}', 'settings belong to the device');
  st.setItem(SAVE_KEY, 'town-B');
  assert.equal(swapLearner(st, 'A'), 'swapped');
  assert.equal(st.getItem(SAVE_KEY), 'town-A'); assert.equal(st.getItem('ecotown.best.v1'), 'best-A'); assert.equal(st.getItem('ecotown.save.v3.tiny'), 'tiny-A');
  assert.equal(swapLearner(st, 'B'), 'swapped'); assert.equal(st.getItem(SAVE_KEY), 'town-B'); assert.equal(st.getItem('ecotown.save.v3.tiny'), null);
  assert.equal(swapLearner(st, null), 'same', 'no server: nothing moves');
});

test('a town saved before learners existed goes to the first learner on that browser', () => {
  const st = fakeStorage({ [SAVE_KEY]: 'old-town' });
  assert.equal(swapLearner(st, 'A'), 'first'); assert.equal(st.getItem(SAVE_KEY), 'old-town');
  swapLearner(st, 'B'); assert.equal(st.getItem(SAVE_KEY), null);
});

test('the status for the leader is short, typed and has no free text beyond 80 characters', () => {
  const s = statusOf({ band: 'junior', stage: 'x'.repeat(200), missionsDone: 9, goalsMet: -2, state: 'mission', problem: 'y'.repeat(200), stuck: 1, finished: 0, extra: 'no' });
  assert.equal(s.stage.length, 80); assert.equal(s.problem.length, 80); assert.equal(s.missionsDone, 6); assert.equal(s.goalsMet, 0);
  assert.equal(s.stuck, true); assert.equal(s.finished, false); assert.equal(s.extra, undefined); assert.equal(s.module, 'ecotown');
});
