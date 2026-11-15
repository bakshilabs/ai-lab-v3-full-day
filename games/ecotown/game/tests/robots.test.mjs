// Robot training (js/modules/robots): the learning, the words, the record and where the robot stands. No page, no 3D.
import test from 'node:test'; import assert from 'node:assert/strict';
import * as L from '../js/modules/robots/learn.js';
import { verdict, lacked, record, wrongBin, streetLine, SAY, stageLine, an, list } from '../js/modules/robots/words.js';
import { itemSvg, chartSvg, robotSvg, binSvg } from '../js/modules/robots/pictures.js';
import { spot } from '../js/modules/robots/spot.js';
import { cleanResult, cleanMade, cleanState, cleanReport, cleanTown } from '../js/modules/contract.js';
import { makeTerrain } from '../js/world/terrain.js';
import mod from '../js/modules/robots/index.js';

const ex = (...ids) => ids.map((id) => ({ kind: id, bin: L.kind(id).bin }));
const J = L.featuresFor(true); const S = L.featuresFor(false);
// every way of choosing first examples that can be tested (at least one for each bin)
function firstChoices(junior) { const st = L.starters(junior); const out = []; for (let m = 1; m < (1 << st.length); m++) { const r = st.filter((_, i) => m & (1 << i)); if (L.readyToTest(L.examplesOf([r]), 0, r.length, junior)) out.push(r); } return out; }

test('the things: each has a bin, a picture and features the robot can tell apart', () => {
  assert.equal(new Set(L.KINDS.map((k) => k.id)).size, L.KINDS.length);
  for (const junior of [true, false]) {
    const kinds = L.kindsFor(junior); const feats = L.featuresFor(junior); const bins = L.binsFor(junior).map((b) => b.id);
    assert.equal(bins.length, junior ? 3 : 4); assert.equal(feats.length, junior ? 3 : 4);
    for (const k of kinds) { assert.ok(bins.includes(k.bin), k.id); assert.match(itemSvg(k.id), /^<svg[\s>]/); assert.ok(itemSvg(k.id).length > 200, `${k.id} is drawn`); }
    // two things that look the same to the robot never belong in different bins (it could never learn them)
    for (const a of kinds) for (const b of kinds) if (a.bin !== b.bin) assert.ok(L.alike(a, b, feats).n < feats.length, `${a.id} / ${b.id}`);
    for (const b of bins) assert.ok(L.starters(junior).some((id) => L.kind(id).bin === b), `a first example for ${b}`);
  }
  assert.ok(!L.kindsFor(true).some((k) => k.senior)); assert.ok(L.kindsFor(false).some((k) => k.id === 'pizzabox'));
});

test('the test tray is the same for the same seed, holds the hard kinds and covers every bin', () => {
  for (const junior of [true, false]) {
    const seen = new Set();
    for (let seed = 1; seed <= 40; seed++) {
      const t = L.makeTray(seed, junior); assert.deepEqual(t, L.makeTray(seed, junior)); seen.add(t.join());
      assert.equal(t.length, L.TRAY_SIZE(junior)); assert.equal(new Set(t).size, t.length);
      for (const k of L.kindsFor(junior).filter((x) => x.hard)) assert.ok(t.includes(k.id), k.id);
      for (const b of L.binsFor(junior)) assert.ok(t.filter((id) => L.kind(id).bin === b.id).length >= 2, b.id);
      const s = L.makeStreet(seed, junior); assert.equal(s.length, L.STREET_SIZE(junior)); assert.equal(new Set(s).size, s.length); assert.deepEqual(s, L.makeStreet(seed, junior));
      for (const b of L.binsFor(junior)) assert.ok(s.some((id) => L.kind(id).bin === b.id));
    }
    assert.ok(seen.size > 10, 'different seeds give different trays');
  }
});

test('the robot sorts by the closest example it was shown, and asks when it cannot tell', () => {
  // shown a clear bottle: a green bottle shares shape and feel with it
  let c = L.classify('greenbottle', ex('newspaper', 'clearbottle', 'banana'), J);
  assert.equal(c.bin, 'glass'); assert.equal(c.match, 'clearbottle'); assert.deepEqual(c.same, ['shape', 'feel']);
  // shown only a clear jar and a lettuce leaf: the green bottle is as close to the leaf (colour) as to the jar (feel)
  c = L.classify('greenbottle', ex('newspaper', 'clearjar', 'lettuce'), J);
  assert.equal(c.bin, null); assert.equal(c.why, 'tie'); assert.deepEqual(c.rivals.map((r) => r.kind).sort(), ['clearjar', 'lettuce']);
  // once it is shown a green bottle it knows it exactly
  c = L.classify('greenbottle', ex('newspaper', 'clearjar', 'lettuce', 'greenbottle'), J);
  assert.equal(c.bin, 'glass'); assert.equal(c.exact, true);
  // nothing in common with anything shown: it does not guess
  assert.deepEqual(L.classify('applecore', ex('newspaper', 'clearjar'), J), { bin: null, why: 'none', n: 0 });
  assert.equal(L.classify('applecore', [], J).why, 'none');
  // an eggshell is white like the newspaper, so it goes with paper until an eggshell is shown
  assert.equal(L.classify('eggshell', ex('newspaper', 'clearjar', 'banana'), J).bin, 'paper');
  assert.equal(L.classify('eggshell', ex('newspaper', 'clearjar', 'banana', 'eggshell'), J).bin, 'food');
  // ages 13–17: condition counts. A greasy pizza box looks like the clean box until one is shown
  assert.equal(L.classify('pizzabox', ex('cardbox', 'clearjar', 'banana', 'toaster'), S).bin, 'paper');
  const both = ex('cardbox', 'clearjar', 'banana', 'toaster', 'pizzabox');
  assert.equal(L.classify('pizzabox', both, S).bin, 'food'); assert.equal(L.classify('cardbox', both, S).bin, 'paper', 'and the clean box still goes with paper');
  // the same examples always give the same answer, whatever the order they were shown in
  const a = L.runTest(L.makeTray(3, false), ex('newspaper', 'clearjar', 'banana', 'toaster'), S); const b = L.runTest(L.makeTray(3, false), ex('toaster', 'banana', 'clearjar', 'newspaper'), S);
  assert.deepEqual(a.results.map((r) => r.got), b.results.map((r) => r.got));
});

test('whatever first examples are chosen, the first test finds gaps, and showing what it lacked never makes it worse', () => {
  for (const junior of [true, false]) {
    const feats = L.featuresFor(junior); let n = 0; let better = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const tray = L.makeTray(seed, junior);
      for (const r0 of firstChoices(junior)) {
        const t1 = L.runTest(tray, L.examplesOf([r0]), feats); n++;
        assert.ok(t1.right < t1.of, 'the first test always leaves something to add'); assert.ok(t1.right >= 2, 'and it always gets some right');
        const add = L.fillGaps(t1, L.examplesOf([r0]), junior); assert.ok(add.length >= 1 && add.length <= L.ROOM(junior));
        for (const id of add) assert.ok(L.canShow(id, L.kind(id).bin, L.examplesOf([r0, add.slice(0, add.indexOf(id))]), 1, add.indexOf(id), junior).ok);
        const t2 = L.runTest(tray, L.examplesOf([r0, add]), feats);
        assert.ok(t2.right >= t1.right, `seed ${seed} ${r0}: ${t1.right} then ${t2.right}`); if (t2.right > t1.right) better++;
        for (const id of add) assert.equal(t2.results.find((r) => r.kind === id).ok, true, 'a thing it was shown is sorted right');
      }
    }
    assert.ok(better / n > 0.9, `${better} of ${n} improved`);
  }
});

test('what was missing is worked out from the examples, and said plainly', () => {
  const shown = ex('newspaper', 'clearjar', 'lettuce');
  assert.deepEqual(L.gap('greenbottle', shown, J), { type: 'lacks', feat: 'colour', value: 'green', seen: ['clear'] });
  assert.equal(lacked('greenbottle', L.gap('greenbottle', shown, J)), 'It has not been shown a green bottle yet. It has only been shown clear glass.');
  assert.deepEqual(L.gap('eggshell', shown, J), { type: 'nothing' });
  assert.match(lacked('eggshell', { type: 'nothing' }), /^It has not been shown an eggshell yet\. Nothing it was shown for Food scraps/);
  assert.deepEqual(L.gap('applecore', ex('newspaper', 'clearjar'), J), { type: 'bin' });
  assert.equal(lacked('applecore', { type: 'bin' }), 'It has not been shown anything for Food scraps yet.');
  assert.equal(L.gap('pizzabox', ex('cardbox', 'banana', 'teabag'), S).feat, 'state');
  assert.match(lacked('pizzabox', L.gap('pizzabox', ex('cardbox', 'banana', 'teabag'), S)), /only been shown things in good condition, not greasy\.$/);
  // every miss on every tray gets a verdict and a "lacked" line, and none of them blames the robot
  for (const junior of [true, false]) for (let seed = 1; seed <= 6; seed++) for (const r0 of firstChoices(junior).slice(0, 40)) {
    const e = L.examplesOf([r0]); const t = L.runTest(L.makeTray(seed, junior), e, L.featuresFor(junior));
    for (const r of t.results) {
      const v = verdict(r); assert.ok(v.tag && v.text && ['ok', 'miss', 'ask'].includes(v.cls)); assert.equal(v.cls === 'ok', r.ok);
      const lines = [v.tag, v.text, streetLine(r), r.ok ? '' : lacked(r.kind, L.gap(r.kind, e, L.featuresFor(junior)))].join(' ');
      assert.doesNotMatch(lines, /\b(undefined|null|NaN|wrong|mistake|stupid|silly|fail\w*)\b/i, lines);
      if (!r.ok) assert.match(lacked(r.kind, L.gap(r.kind, e, L.featuresFor(junior))), /not been shown|only been shown/);
    }
  }
  assert.equal(an('eggshell'), 'an eggshell'); assert.equal(an('paper bag'), 'a paper bag'); assert.equal(list(['a', 'b', 'c']), 'a, b and c');
  assert.equal(wrongBin('eggshell', true), 'The eggshell goes in Food scraps in our town. Try that bin.');
});

test('the bench rules: first examples, room for more, one example of each thing', () => {
  assert.deepEqual(L.shelf([], 0, true), L.starters(true)); assert.equal(L.starters(true).length, 6); assert.equal(L.starters(false).length, 8);
  assert.equal(L.canShow('newspaper', 'paper', [], 0, 0, true).ok, true);
  assert.deepEqual(L.canShow('newspaper', 'glass', [], 0, 0, true), { ok: false, why: 'bin', right: 'paper' });
  assert.equal(L.canShow('greenbottle', 'glass', [], 0, 0, true).why, 'later'); assert.equal(L.canShow('newspaper', 'paper', ex('newspaper'), 0, 1, true).why, 'shown');
  assert.equal(L.canShow('toaster', 'repair', [], 0, 0, true).why, 'unknown'); assert.equal(L.canShow('toaster', 'repair', [], 0, 0, false).ok, true);
  assert.equal(L.canShow('greenbottle', 'glass', ex('newspaper'), 1, L.ROOM(true), true).why, 'full'); assert.equal(L.canShow('greenbottle', 'glass', ex('newspaper'), 1, 0, true).ok, true);
  assert.equal(L.readyToTest(ex('newspaper', 'clearjar'), 0, 2, true), false); assert.equal(L.readyToTest(ex('newspaper', 'clearjar', 'banana'), 0, 3, true), true);
  assert.equal(L.readyToTest(ex('newspaper', 'clearjar', 'banana'), 0, 3, false), false, 'ages 13–17 have a fourth bin');
  assert.equal(L.readyToTest(ex('newspaper', 'clearjar', 'banana'), 1, 0, true), false); assert.equal(L.readyToTest(ex('newspaper', 'clearjar', 'banana', 'eggshell'), 1, 1, true), true);
  assert.ok(!L.shelf(ex('newspaper'), 1, true).includes('newspaper')); assert.ok(L.shelf(ex('newspaper'), 1, true).includes('eggshell')); assert.ok(!L.shelf([], 1, true).includes('pizzabox'));
});

test('progress kept between visits is checked, and resumes at a sensible step', () => {
  const ok = { v: 1, j: true, seed: 42, rounds: [['newspaper', 'clearjar', 'banana'], ['eggshell']], tests: 1, stage: 'teach' };
  assert.deepEqual(L.cleanSaved(ok, true), ok); assert.deepEqual(cleanState(ok), ok);
  assert.equal(L.cleanSaved(ok, false), null, 'the other age route starts again'); assert.equal(L.cleanSaved(null, true), null); assert.equal(L.cleanSaved({ v: 1, plays: 2 }, true), null);
  assert.equal(L.cleanSaved({ ...ok, stage: 'result' }, true).stage, 'teach', 'a result needs a test for every round');
  assert.equal(L.cleanSaved({ ...ok, tests: 2, stage: 'result' }, true).stage, 'result');
  assert.equal(L.cleanSaved({ ...ok, rounds: [['newspaper']], tests: 0, stage: 'test' }, true).stage, 'teach', 'not every bin has an example yet');
  assert.equal(L.cleanSaved({ ...ok, rounds: [['newspaper', 'clearjar', 'banana']], tests: 0, stage: 'test' }, true).stage, 'test');
  const odd = L.cleanSaved({ v: 1, j: true, seed: 7, rounds: [['newspaper', 'newspaper', 'toaster', 'nonsense', 5]], tests: 9, stage: 'street' }, true);
  assert.deepEqual(odd.rounds[0], ['newspaper']); assert.equal(odd.stage, 'teach'); assert.ok(odd.tests <= odd.rounds.length);
  const rev = L.cleanSaved({ ...ok, rounds: [ok.rounds[0]], tests: 1, stage: 'review' }, true); assert.equal(rev.stage, 'review'); assert.equal(rev.rounds.length, 1);
  const aft = L.cleanSaved({ ...ok, rounds: [ok.rounds[0]], tests: 1, stage: 'teach' }, true); assert.equal(aft.rounds.length, 2, 'a new round to fill after the test');
});

test('the training record is built from what was done, and fits the contract', () => {
  for (const junior of [true, false]) {
    const feats = L.featuresFor(junior); const tray = L.makeTray(11, junior); const r0 = L.starters(junior);
    const t1 = L.runTest(tray, L.examplesOf([r0]), feats); const add = L.fillGaps(t1, L.examplesOf([r0]), junior); const t2 = L.runTest(tray, L.examplesOf([r0, add]), feats);
    const st = L.runTest(L.makeStreet(11, junior), L.examplesOf([r0, add]), feats); const street = { right: st.right, asked: st.asked, wrong: st.of - st.right - st.asked, of: st.of };
    const rec = record({ rounds: [r0, add], tests: [t1, t2], street, bins: L.binsFor(junior).length, beside: 'Timber terrace' });
    const picture = chartSvg({ tests: [t1, t2], shown: [r0.length, r0.length + add.length], street });
    const out = cleanResult({ finished: true, record: { made: { title: rec.title, lines: rec.lines, picture }, practised: rec.practised }, town: { kind: 'recycling-robot', data: { key: '6,5', bins: ['paper', 'glass', 'food'], things: [...r0, ...add], right: t2.right, of: t2.of } } });
    assert.equal(out.finished, true); assert.equal(out.record.made.picture, picture, 'the chart is accepted as a picture'); assert.ok(out.town);
    assert.deepEqual(out.record.made.lines, rec.lines, 'no line is cut'); assert.deepEqual(out.record.practised, rec.practised); assert.equal(out.record.made.title, rec.title);
    assert.equal(rec.practised.length, 4); assert.ok(rec.lines.length >= 5 && rec.lines.length <= 6);
    assert.match(rec.lines[0], new RegExp(`^First shown ${r0.length} examples for ${junior ? 3 : 4} bins: `)); assert.equal(rec.lines[1], `First test: ${t1.right} of ${t1.of} in the right bin.`);
    assert.ok(rec.lines.includes(`Second test: ${t2.right} of ${t2.of} in the right bin.`)); assert.match(rec.lines[rec.lines.length - 1], /^In the street by the timber terrace: \d of \d new things sorted/);
    assert.equal(rec.practised[0], `teaching a robot by showing it ${r0.length + add.length} examples`);
    assert.match(rec.practised[2], new RegExp(`testing again: ${t1.right} of ${t1.of}, then ${t2.right} of ${t2.of}$`));
    for (const l of [...rec.lines, ...rec.practised]) { assert.ok(l.length <= 120, l); assert.doesNotMatch(l, /learn|improv|undefined/i, l); }
    assert.match(picture, /First test/); assert.match(picture, new RegExp(`${t2.right} of ${t2.of}`)); assert.match(picture, /In the street/);
  }
  // a short visit: one example each and no later round still makes sense
  const t = L.runTest(L.makeTray(1, true), ex('newspaper', 'clearjar', 'banana'), J);
  const small = record({ rounds: [['newspaper', 'clearjar', 'banana']], tests: [t], street: null, bins: 3 });
  assert.equal(small.practised.length, 2); assert.equal(small.lines.length, 3);
  // long lists of names are shortened, never cut mid-word
  const long = record({ rounds: [L.starters(false), L.kindsFor(false).filter((k) => !k.start).map((k) => k.id)], tests: [t, t], street: null, bins: 4 });
  for (const l of long.lines) assert.ok(l.length <= 120 && l.endsWith('.'), l); assert.match(long.lines.join(' '), /and \d+ more\./);
  for (const f of [SAY.teach0, SAY.test1, SAY.review, SAY.street]) for (const j of [true, false]) assert.ok(f(j, 3, 8).length > 20);
  assert.ok(cleanReport('robots', { stage: stageLine('result', { first: 5, right: 8, of: 8 }) }).stage.length <= 80); assert.equal(stageLine('teach', { round: 0 }), 'Showing the robot its first examples');
  assert.match(robotSvg('ask'), /^<svg/); assert.match(binSvg('#123456'), /#123456/); assert.equal(cleanMade({ title: 'x', picture: chartSvg({ tests: [t], shown: [3], street: null }) }).picture.startsWith('<svg'), true);
});

test('where the robot works: open town land first, a kept place while it is free, a dry tile when the town is empty', () => {
  const terrain = makeTerrain(); const free = [...terrain.tiles.values()].filter((t) => !t.fixed && t.zone === 'slope').map((t) => t.k);
  const [a, b, c] = free; const xy = (k) => k.split(',').map(Number);
  const empty = spot([], terrain); assert.ok(empty && terrain.tiles.has(empty.key)); assert.equal(empty.how, 'island'); assert.equal(empty.beside, null);
  assert.ok(!terrain.tiles.get(empty.key).fixed && terrain.tiles.get(empty.key).zone !== 'river'); assert.deepEqual(spot([], terrain), empty, 'the same every time');
  assert.equal(spot([], { tiles: [...terrain.tiles.values()] }).key, empty.key, 'tiles may be a list');
  const town = [[a, { mark: 'town', item: 'timber', mods: [] }], [b, { mark: 'town', item: null, mods: [] }], [c, { mark: 'town', item: 'school', mods: [] }]];
  const s = spot(town, terrain); assert.equal(s.key, b, 'the open town tile'); assert.equal(s.how, 'street');
  const [lx, lz] = s.look; const [bx, bz] = xy(b); const front = `${bx + lx},${bz + lz}`; assert.ok(!town.some(([k, cell]) => k === front && cell.item), 'the camera does not stand behind a building');
  assert.equal(spot(town, terrain, b).key, b);
  // the kept tile was built on since: the robot moves to open ground beside the town
  const built = town.map(([k, cell]) => (k === b ? [k, { ...cell, item: 'straw' }] : [k, cell])); const moved = spot(built, terrain, b);
  assert.ok(moved && moved.key !== b); assert.equal(moved.how, 'edge'); assert.ok(!built.some(([k]) => k === moved.key));
  // a footpath beside homes is the best street of all
  const withPath = [...town, [free[3], { mark: 'town', item: 'path', mods: [] }]]; assert.ok([b, free[3]].includes(spot(withPath, terrain).key));
  assert.equal(spot([], { tiles: new Map() }), null); assert.equal(spot([], null), null);
  assert.ok(cleanTown({ kind: 'recycling-robot', data: { key: s.key, bins: ['paper', 'glass', 'food'], things: L.kindsFor(true).map((k) => k.id), right: 8, of: 8 } }));
});

test('the module object fits the contract and draws nothing where there is nowhere to stand', () => {
  assert.equal(mod.id, 'robots'); assert.equal(typeof mod.run, 'function'); assert.equal(typeof mod.show, 'function');
  assert.ok(mod.css.length > 500); for (const rule of mod.css.split('}').map((r) => r.trim()).filter((r) => r && !r.startsWith('@') && !/^(from|to|\d+%)/.test(r))) assert.ok(rule.replace(/^@media[^{]*\{\s*/, '').startsWith('#module[data-module="robots"]'), rule.slice(0, 60));
  const off = mod.show({ engine: {}, town: { cells: [], terrain: { tiles: new Map() } }, junior: true, reduceMotion: true }, { key: '1,1', bins: ['paper'], things: [] });
  assert.equal(typeof off, 'function'); off();
  assert.equal(typeof mod.show({ engine: {}, town: { cells: [], terrain: null } }, {}), 'function');
});
