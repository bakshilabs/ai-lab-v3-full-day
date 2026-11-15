// The contract for the "Eco Town of the future" modules (js/modules/contract.js, docs/MODULES.md).
import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { MODULE_IDS, checkModule, cleanResult, cleanMade, cleanPractised, cleanTown, cleanState, cleanReport, storedModule } from '../js/modules/contract.js';
import { forServer } from '../js/net.js';

test('there are three modules, and each folder holds one that fits the contract', async () => {
  assert.deepEqual(MODULE_IDS, ['drone', 'robots', 'roads']);
  for (const id of MODULE_IDS) {
    const mod = (await import(`../js/modules/${id}/index.js`)).default;
    assert.deepEqual(checkModule(mod, id), [], id);
    assert.ok(mod.title.j.length <= 40 && mod.blurb.j.length <= 80, `${id}: title and blurb fit the board`);
  }
  assert.ok(checkModule({ id: 'drone' }, 'drone').length > 0); assert.ok(checkModule(null, 'drone').length > 0);
  assert.ok(checkModule({ id: 'robots', icon: 'x', title: { j: 'a', s: 'a' }, blurb: { j: 'a', s: 'a' }, run() {} }, 'drone').includes('id must be "drone"'));
});

// what a module may import from outside its own folder: the contract, and two read-only parts of the game
const ALLOWED = ['../contract.js', '../../world/catalog.js', '../../sim/sim.js'];
test('a module never edits the shared files: it only imports from its own folder, the contract, two read-only game files and three.js', () => {
  for (const id of MODULE_IDS) for (const f of readdirSync(new URL(`../js/modules/${id}/`, import.meta.url)).filter((x) => x.endsWith('.js'))) {
    const src = readFileSync(new URL(`../js/modules/${id}/${f}`, import.meta.url), 'utf8');
    for (const m of src.matchAll(/from\s+'([^']+)'|import\('([^']+)'\)/g)) { const p = m[1] || m[2]; assert.ok(p === 'three' || p.startsWith('three/') || p.startsWith('./') || ALLOWED.includes(p), `${id} imports ${p}`); }
    assert.doesNotMatch(src, /localStorage|sessionStorage|fetch\(|XMLHttpRequest|WebSocket|sendBeacon/, `${id}: saving and the network go through the loader`);
  }
});

test('what a module hands back is checked and trimmed', () => {
  const good = { finished: true, record: { made: { title: 'A drone route', lines: ['Bakery to the school', '4 steps'], picture: '<svg viewBox="0 0 10 10"><path d="M0 0L10 10"/></svg>' }, practised: ['planning a route', 'breaking a job into steps'] }, town: { kind: 'drone-route', data: { stops: ['3,4', '9,6'] } } };
  const r = cleanResult(good);
  assert.equal(r.finished, true); assert.equal(r.record.made.title, 'A drone route'); assert.equal(r.record.practised.length, 2); assert.deepEqual(r.town, good.town);
  assert.equal(cleanResult({ finished: true }).finished, false, 'finished needs a record');
  assert.equal(cleanResult({ finished: true, record: { made: { title: 'x' }, practised: ['only one line'] } }).record, null, 'two to four practised lines');
  assert.equal(cleanPractised(['a', 'b', 'c', 'd', 'e']).length, 4);
  assert.equal(cleanMade({ title: 'x'.repeat(200), lines: Array(10).fill('y'.repeat(300)) }).title.length, 60);
  assert.equal(cleanMade({ title: 'x', lines: Array(10).fill('y'.repeat(300)) }).lines.length, 6);
  assert.equal(cleanMade({ title: 'x', lines: ['y'.repeat(300)] }).lines[0].length, 120);
  assert.equal(cleanMade({ title: 'x', picture: '<svg onload="alert(1)"></svg>' }).picture, undefined, 'no script in a picture');
  assert.equal(cleanMade({ title: 'x', picture: 'https://example.com/a.png' }).picture, undefined, 'no outside pictures');
  assert.ok(cleanMade({ title: 'x', picture: 'data:image/png;base64,AAAA' }).picture);
  assert.equal(cleanTown({ kind: 'big', data: { a: 'z'.repeat(5000) } }), null, 'town data at most 4 KB');
  assert.equal(cleanState({ a: 'z'.repeat(9000) }), null); assert.deepEqual(cleanState({ step: 2 }), { step: 2 });
  assert.equal(cleanResult(null), null);
});

test('the status for the leader and the stored record', () => {
  assert.deepEqual(cleanReport('drone', { stage: 'Flying by hand', state: 'nonsense', finished: 0 }), { module: 'drone', stage: 'Flying by hand', state: 'playing', finished: false });
  assert.equal(cleanReport('roads', { stage: 'x'.repeat(200) }).stage.length, 80);
  const r = cleanResult({ finished: true, record: { made: { title: 'T', lines: ['a'], picture: 'data:image/png;base64,AAAA' }, practised: ['one', 'two'] }, town: { kind: 'k', data: {} } });
  const s1 = storedModule(null, r, { step: 3 }, 100);
  assert.equal(s1.done, true); assert.equal(s1.times, 1); assert.equal(s1.record.made.picture, undefined, 'the picture is kept apart, on the device'); assert.deepEqual(s1.state, { step: 3 });
  const s2 = storedModule(s1, cleanResult({ finished: false }), { step: 1 }, 200);
  assert.equal(s2.done, true, 'leaving early later does not undo a finished module'); assert.equal(s2.record.made.title, 'T'); assert.equal(s2.times, 1);
  assert.equal(storedModule(s1, r, null, 300).times, 2);
  // the module records travel in the save and its server copy
  assert.deepEqual(forServer({ cells: [], modules: { drone: s1 } }).modules.drone.record.practised, ['one', 'two']);
});

test('the contract document and the plan exist', () => {
  for (const f of ['../../../../docs/MODULES.md', '../../../../docs/afternoon-modules-plan.md']) assert.ok(existsSync(new URL(f, import.meta.url)), f);
});
