// Town film studio: the harder tasks (ages 13–17 sequences, a fourth story, a running time, a second caption to
// build, more pictures) and the caption builder's rules. All pure: no page, no 3D.
import test from 'node:test'; import assert from 'node:assert/strict';
import { makeTerrain } from '../js/world/terrain.js';
import { simulate } from '../js/sim/sim.js';
import { findSet } from '../js/modules/film/kit.js';
import * as M1 from '../js/modules/film/m1-crew.js';
import * as M4 from '../js/modules/film/m4-edit.js';
import * as M5 from '../js/modules/film/m5-access.js';

const terrain = makeTerrain(); const tiles = [...terrain.tiles.values()];
function town(list) { const cells = new Map(); for (const [k, item] of list) cells.set(k, { mark: 'town', item, mods: [] }); return { cells: [...cells], sim: simulate(terrain, cells, {}) }; }
const full = town([['6,3', 'timber'], ['8,5', 'market'], ['9,5', 'hall'], ['10,4', 'park']]); const fullSet = findSet(full.cells, tiles, full.sim);
const bare = town([]); const bareSet = findSet(bare.cells, tiles, bare.sim);

test('ages 13–17 get harder tasks: sequences, a running time, a second caption to build', () => {
  assert.deepEqual(M1.partsFor(true).map((p) => p.id), ['size', 'move', 'scene']); assert.deepEqual(M1.partsFor(false).map((p) => p.id), ['size', 'move', 'scene', 'seq']);
  for (const set of [fullSet, bareSet]) {
    const seqs = M1.seqItems(set); assert.equal(seqs.length, 3);
    for (const sq of seqs) { assert.equal(sq.items.length, 2); assert.equal(sq.shots.length, 2); for (const it of sq.items) { assert.equal(it.opts.length, 6); assert.ok(it.opts.some((o) => o.id === it.answer)); } }
  }
  const [fast, slow] = M4.PACES; const L = (q, m, l) => [...Array(q).fill('quick'), ...Array(m).fill('medium'), ...Array(l).fill('long')];
  assert.equal(M4.paceVerdict(fast, L(5, 0, 0), true).ok, true); assert.equal(M4.paceVerdict(fast, L(5, 0, 0), false).ok, false); // 7.5 s: under the slot
  assert.match(M4.paceVerdict(fast, L(5, 0, 0), false).say, /too short/); assert.equal(M4.paceVerdict(fast, L(4, 1, 0), false).ok, true);
  assert.equal(M4.paceVerdict(slow, L(0, 0, 5), false).ok, false); assert.match(M4.paceVerdict(slow, L(0, 0, 5), false).say, /too long/); assert.equal(M4.paceVerdict(slow, L(0, 1, 4), false).ok, true);
  assert.match(M4.paceAsk(fast, false), /8 and 10 seconds/); assert.doesNotMatch(M4.paceAsk(fast, true), /\d/);
  assert.equal(M5.buildsFor(true).length, 1); assert.equal(M5.buildsFor(false).length, 2);
});

test('a built caption follows the caption writer’s rules, and each mistake gets its own reason', () => {
  for (const b of M5.BUILDS) for (const junior of [true, false]) {
    const good = b.tiles.filter((x) => x.good);
    assert.equal(M5.checkBuild(b, good, junior).ok, true, b.id);
    const lines = new Set();
    for (const bad of [[], good.filter((x) => x.kind !== 'speaker'), [b.tiles.find((x) => x.kind === 'speaker' && !x.good), ...good.filter((x) => x.kind !== 'speaker')],
      good.slice().reverse(), good.map((x) => (x.kind === 'words' ? b.tiles.find((y) => y.long) : x)), good.filter((x) => x.kind !== 'sound'), [...good.filter((x) => x.kind !== 'sound'), b.tiles.find((x) => x.kind === 'noise')]]) {
      const r = M5.checkBuild(b, bad, junior); assert.equal(r.ok, false, `${b.id}: ${M5.builtText(bad)}`); lines.add(r.say);
    }
    assert.ok(lines.size >= 6, 'different mistakes, different reasons');
    // the built caption is short enough to read in its time
    assert.ok(M5.words(M5.builtText(good)) / b.secs <= M5.READ_WPS);
  }
});
