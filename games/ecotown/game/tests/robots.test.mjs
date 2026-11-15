// Robot training (js/modules/robots): the learning, the words, the record and where the robot stands. No page, no 3D.
import test from 'node:test'; import assert from 'node:assert/strict';
import * as L from '../js/modules/robots/learn.js';
import { verdict, did, why, record, wrongBin, streetLine, tuneLine, SAY, STEPS, stageLine, an, list } from '../js/modules/robots/words.js';
import { itemSvg, chartSvg, robotSvg, binSvg, workshopSvg } from '../js/modules/robots/pictures.js';
import { spot } from '../js/modules/robots/spot.js';
import { css } from '../js/modules/robots/bench.js';
import { cleanResult, cleanMade, cleanState, cleanReport, cleanTown } from '../js/modules/contract.js';
import { makeTerrain } from '../js/world/terrain.js';
import { seedTo, CLEAR } from '../js/game/seed.js';
import { plan, applyPlacements } from '../js/sim/planner.js';
import mod from '../js/modules/robots/index.js';

const ex = (...ids) => ids.map((id) => ({ kind: id, bin: L.kind(id).bin }));
const J = L.featuresFor(true); const S = L.featuresFor(false);
// every way of choosing first examples that can be tested (at least one for each bin)
function firstChoices(junior) { const st = L.starters(junior); const out = []; for (let m = 1; m < (1 << st.length); m++) { const r = st.filter((_, i) => m & (1 << i)); if (L.readyToTest(L.examplesOf([r]), 0, r.length, junior)) out.push(r); } return out; }
const SEEDS = Array.from({ length: 400 }, (_, i) => ((i + 1) * 2654435761) >>> 0);

test('the things: each has a bin, a role, a picture of its own and features the robot can tell apart', () => {
  assert.equal(new Set(L.KINDS.map((k) => k.id)).size, L.KINDS.length); assert.equal(new Set(L.KINDS.map((k) => k.name)).size, L.KINDS.length);
  for (const junior of [true, false]) {
    const kinds = L.kindsFor(junior); const feats = L.featuresFor(junior); const bins = L.binsFor(junior).map((b) => b.id);
    assert.equal(bins.length, junior ? 3 : 4); assert.equal(feats.length, junior ? 3 : 4);
    for (const k of kinds) { assert.ok(bins.includes(k.bin), k.id); assert.ok(['start', 'more', 'test', 'street'].includes(k.role), k.id); assert.match(itemSvg(k.id), /^<svg[\s>]/); assert.ok(itemSvg(k.id).length > 300 && !/r="20" fill="#ccc"/.test(itemSvg(k.id)), `${k.id} is drawn`); }
    // two things that look the same to the robot never belong in different bins (it could never learn them)
    for (const a of kinds) for (const b of kinds) if (a.bin !== b.bin) assert.ok(L.alike(a, b, feats).n < feats.length, `${a.id} / ${b.id}`);
    // and nothing in the test tray or the street looks exactly like a thing that can be shown: sorting them is never just remembering
    for (const a of kinds.filter((k) => k.role === 'test' || k.role === 'street')) for (const b of kinds.filter((k) => k.role === 'start' || k.role === 'more')) assert.ok(L.alike(a, b, feats).n < feats.length, `${a.id} looks exactly like ${b.id}`);
    for (const b of bins) { assert.ok(L.starters(junior).some((id) => L.kind(id).bin === b), `a first example for ${b}`); assert.ok(L.streetPool(junior).some((id) => L.kind(id).bin === b), `a street thing for ${b}`); }
  }
  assert.ok(!L.kindsFor(true).some((k) => k.senior)); assert.ok(L.kindsFor(false).some((k) => k.id === 'pizzabox'));
  assert.equal(L.starters(true).length, 6); assert.equal(L.starters(false).length, 8);
});

test('"kept apart" is true: over many seeds no tray thing is ever an example, and the street things are in neither', () => {
  for (const junior of [true, false]) {
    const seen = new Set(); const canShow = new Set([...L.starters(junior), ...L.mores(junior)]); const everShelf = new Set();
    // the shelf, whatever has been shown so far, only ever offers "start" and "more" kinds
    for (const round of [0, 1, 2, 3]) for (const shown of [[], L.starters(junior), [...canShow]]) for (const id of L.shelf(L.examplesOf([shown]), round, junior)) everShelf.add(id);
    assert.deepEqual([...everShelf].sort(), [...canShow].sort());
    for (const seed of SEEDS) {
      const t = L.makeTray(seed, junior); assert.deepEqual(t, L.makeTray(seed, junior)); seen.add(t.join());
      assert.equal(t.length, L.TRAY_SIZE(junior)); assert.equal(new Set(t).size, t.length);
      for (const k of L.kindsFor(junior).filter((x) => x.hard)) assert.ok(t.includes(k.id), k.id);
      for (const b of L.binsFor(junior)) assert.ok(t.filter((id) => L.kind(id).bin === b.id).length >= 2, b.id);
      for (const id of t) { // a tray thing can never be shown: not on any shelf, not accepted by the bench, not kept in a save
        assert.equal(L.kind(id).role, 'test'); assert.ok(!canShow.has(id) && !everShelf.has(id), `${id} is in the tray and on the shelf`);
        for (const round of [0, 1, 2]) assert.equal(L.canShow(id, L.kind(id).bin, [], round, 0, junior).ok, false, id);
        assert.equal(L.canBeExample(id, junior), false);
      }
      const s = L.makeStreet(seed, junior); assert.equal(s.length, L.STREET_SIZE(junior)); assert.equal(new Set(s).size, s.length); assert.deepEqual(s, L.makeStreet(seed, junior));
      for (const b of L.binsFor(junior)) assert.ok(s.some((id) => L.kind(id).bin === b.id));
      for (const id of s) { assert.equal(L.kind(id).role, 'street'); assert.ok(!t.includes(id), `${id} is in the street and the tray`); assert.ok(!canShow.has(id), `${id} is in the street and can be shown`); assert.equal(L.canBeExample(id, junior), false); }
    }
    assert.ok(seen.size > 10, 'different seeds give different trays');
    // a save that names a tray or street thing as an example is not believed
    const bad = L.cleanSaved({ v: 2, j: junior, seed: 5, rounds: [L.starters(junior), [L.testPool(junior)[0], L.streetPool(junior)[0], L.mores(junior)[0]]], tests: 1, stage: 'teach' }, junior);
    assert.deepEqual(bad.rounds[1], [L.mores(junior)[0]]);
  }
});

test('the robot sorts by the closest example it was shown, and asks when it cannot tell', () => {
  // shown a clear bottle: a green bottle shares shape and feel with it
  let c = L.classify('greenbottle', ex('newspaper', 'clearbottle', 'banana'), J);
  assert.equal(c.bin, 'glass'); assert.equal(c.match, 'clearbottle'); assert.deepEqual(c.same, ['shape', 'feel']);
  // shown only a clear jar and a lettuce leaf: the green bottle is as close to the leaf (colour) as to the jar (feel)
  c = L.classify('greenbottle', ex('newspaper', 'clearjar', 'lettuce'), J);
  assert.equal(c.bin, null); assert.equal(c.why, 'tie'); assert.deepEqual(c.rivals.map((r) => r.kind).sort(), ['clearjar', 'lettuce']);
  // a brown bottle is not the green bottle, but it is close enough to settle it: that is generalising
  c = L.classify('greenbottle', ex('newspaper', 'clearjar', 'lettuce', 'brownbottle'), J);
  assert.equal(c.bin, 'glass'); assert.equal(c.match, 'brownbottle'); assert.ok(!c.exact);
  // nothing in common with anything shown: it does not guess
  assert.deepEqual(L.classify('applecore', ex('newspaper', 'clearjar'), J), { bin: null, why: 'none', n: 0 });
  assert.equal(L.classify('applecore', [], J).why, 'none');
  // an eggshell is white like the newspaper, so it goes with paper until it is shown another eggshell (a brown one)
  assert.equal(L.classify('eggshell', ex('newspaper', 'clearjar', 'banana'), J).bin, 'paper');
  assert.equal(L.classify('eggshell', ex('newspaper', 'clearjar', 'banana', 'browneggshell'), J).bin, 'food');
  // ages 13–17: condition counts. A greasy pizza box looks like clean paper and card until a greasy box is shown
  assert.equal(L.classify('pizzabox', ex('cardbox', 'clearjar', 'banana', 'toaster'), S).bin, 'paper');
  const both = ex('cardbox', 'clearjar', 'banana', 'toaster', 'burgerbox');
  assert.equal(L.classify('pizzabox', both, S).bin, 'food'); assert.equal(L.classify('cerealbox', both, S).bin, 'paper', 'and a clean box still goes with paper');
  // the same examples always give the same answer, whatever the order they were shown in
  const a = L.runTest(L.makeTray(3, false), ex('newspaper', 'clearjar', 'banana', 'toaster'), S); const b = L.runTest(L.makeTray(3, false), ex('toaster', 'banana', 'clearjar', 'newspaper'), S);
  assert.deepEqual(a.results.map((r) => r.got), b.results.map((r) => r.got));
});

test('whatever first examples are chosen, the first test finds gaps; the starred things fill them without touching the tray', () => {
  for (const junior of [true, false]) {
    const feats = L.featuresFor(junior); let n = 0; let better = 0; const byCount = {};
    for (const seed of SEEDS.slice(0, 12)) {
      const tray = L.makeTray(seed, junior);
      for (const r0 of firstChoices(junior)) {
        const e0 = L.examplesOf([r0]); const t1 = L.runTest(tray, e0, feats); n++; (byCount[r0.length] ||= []).push(t1.right);
        assert.ok(t1.right < t1.of, 'the first test always leaves something to add'); assert.ok(t1.right >= 2, 'and it always gets some right');
        const stars = L.starsFor(t1, e0, feats, junior); assert.ok(stars.length >= 1, 'something on the shelf fills a gap');
        for (const id of stars) { // a star is never a test thing; it is on the shelf; and by itself it turns at least one missed thing right
          assert.ok(!tray.includes(id), `${id} is starred and in the tray`); assert.ok(L.shelf(e0, 1, junior).includes(id));
          const t = L.runTest(tray, [...e0, { kind: id, bin: L.kind(id).bin }], feats);
          assert.ok(t.results.some((r, i) => r.ok && !t1.results[i].ok), `${id} is starred but fixes nothing`);
        }
        const add = L.fillGaps(t1, e0, junior); assert.ok(add.length >= 1 && add.length <= L.ROOM(junior));
        for (const id of add) assert.ok(L.canShow(id, L.kind(id).bin, L.examplesOf([r0, add.slice(0, add.indexOf(id))]), 1, add.indexOf(id), junior).ok);
        const e1 = L.examplesOf([r0, add]); const t2 = L.runTest(tray, e1, feats);
        assert.ok(t2.right >= t1.right, `seed ${seed} ${r0}: ${t1.right} then ${t2.right}`); if (t2.right > t1.right) better++;
        // the second test is still a test: nothing on the tray was shown, so no answer is the thing itself or an exact copy
        assert.ok(!e1.some((e) => tray.includes(e.kind)));
        for (const r of t2.results) { assert.notEqual(r.match, r.kind); assert.ok(!r.exact, `${r.kind} matched ${r.match} exactly`); }
      }
    }
    assert.ok(better / n > 0.95, `${better} of ${n} improved`);
    // showing more first examples does not, on average, give a lower first score
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length; const counts = Object.keys(byCount).map(Number).sort((a, b) => a - b);
    assert.ok(mean(byCount[counts[counts.length - 1]]) >= mean(byCount[counts[0]]), 'every first example shown scores at least as well as the fewest');
  }
});

test('the reason given for a miss is the true one: every sentence is checked against the classifier', () => {
  const shown = ex('newspaper', 'clearjar', 'lettuce', 'banana');
  let r = L.runTest(['eggshell'], shown, J).results[0]; let x = L.explain('eggshell', shown, J, L.shelf(shown, 1, true));
  assert.equal(x.mine.n, 0); assert.deepEqual(x.helpers.map((h) => h.kind), ['browneggshell']); assert.deepEqual(x.helpers[0].same, ['shape', 'feel']);
  assert.equal(did(r), 'It went into Paper and card: most like the newspaper (same colour).');
  assert.equal(why(r, x, J, true), 'Nothing it was shown for Food scraps has the same colour, shape or feel. Show it something for Food scraps with the same shape and feel. Look for a star.');
  assert.equal(why(r, x, J, false), 'Nothing it was shown for Food scraps has the same colour, shape or feel. An example for Food scraps with the same shape and feel would settle it. See the stars.');
  assert.equal(why(r, x, J, true, false), 'Nothing it was shown for Food scraps has the same colour, shape or feel.');
  x = L.explain('applecore', ex('newspaper', 'clearjar'), J, []); assert.equal(x.mine, null);
  assert.equal(why({ kind: 'applecore' }, x, J, true), 'It has not been shown anything for Food scraps yet. No one thing on the shelf settles this yet.');
  r = L.runTest(['greenbottle'], ex('newspaper', 'clearjar', 'lettuce'), J).results[0]; x = L.explain('greenbottle', ex('newspaper', 'clearjar', 'lettuce'), J, L.shelf(ex('newspaper', 'clearjar', 'lettuce'), 1, true));
  assert.match(did(r), /^It could not choose: as much like the /); assert.match(why(r, x, J, true), /^For Glass, the closest thing it was shown is the clear jar: same feel only\. Show it something for Glass with the same /);
  let checked = 0; let withHelp = 0;
  for (const junior of [true, false]) for (const seed of SEEDS.slice(0, 8)) for (const r0 of firstChoices(junior).filter((_, i) => i % 3 === 0)) {
    const feats = L.featuresFor(junior); const tray = L.makeTray(seed, junior);
    for (const rounds of [[r0], [r0, L.fillGaps(L.runTest(tray, L.examplesOf([r0]), feats), L.examplesOf([r0]), junior).slice(0, 2)]]) {
      const e = L.examplesOf(rounds); const on = L.shelf(e, 1, junior); const t = L.runTest(tray, e, feats);
      for (const res of t.results) {
        const v = verdict(res); assert.ok(v.tag && v.text && ['ok', 'miss', 'ask'].includes(v.cls)); assert.equal(v.cls === 'ok', res.ok);
        if (res.match) assert.ok(e.some((q) => q.kind === res.match), '"the … it was shown" names a thing that was shown');
        if (res.ok) continue; checked++;
        const xx = L.explain(res.kind, e, feats, on); const mine = e.filter((q) => q.bin === res.truth); const text = why(res, xx, feats, junior, true); const said = did(res);
        // "It has not been shown anything for …" only when that is so; "Nothing it was shown for … has the same …" only when nothing matches at all
        assert.equal(/has not been shown anything for/.test(text), mine.length === 0, text);
        const bestMine = Math.max(0, ...mine.map((q) => L.alike(L.kind(res.kind), L.kind(q.kind), feats).n));
        assert.equal(/^Nothing it was shown for/.test(text), mine.length > 0 && bestMine === 0, text);
        if (mine.length && bestMine > 0) { assert.equal(xx.mine.n, bestMine); assert.ok(text.includes(`the ${L.kind(xx.mine.kind).name}: same `)); assert.deepEqual(xx.mine.same, L.alike(L.kind(res.kind), L.kind(xx.mine.kind), feats).same); }
        // the helpers are exactly the shelf things that, shown by themselves, make the robot sort this thing right
        for (const h of on) { const flips = L.kind(h).bin === res.truth && L.classify(res.kind, [...e, { kind: h, bin: L.kind(h).bin }], feats).bin === res.truth; assert.equal(xx.helpers.some((q) => q.kind === h), flips, `${res.kind} / ${h}`); }
        assert.equal(/Look for a star|See the stars/.test(text), xx.helpers.length > 0, text); assert.equal(/No one thing on the shelf/.test(text), xx.helpers.length === 0, text);
        if (xx.helpers.length) { withHelp++; const h = xx.helpers[0]; assert.deepEqual(h.same, L.alike(L.kind(res.kind), L.kind(h.kind), feats).same); assert.ok(text.includes(`with the same ${list(h.same.map((f) => L.FEATURES[f].label.toLowerCase()))}`)); assert.ok(L.starsFor(t, e, feats, junior).includes(h.kind), 'and it carries a star'); }
        // what it did: the example named is one it was shown, and shares exactly the features said
        if (res.got) assert.ok(said.includes(`most like the ${L.kind(res.match).name} (same ${list(res.same.map((f) => L.FEATURES[f].label.toLowerCase()))})`));
        const lines = [v.tag, v.text, said, text, streetLine(res)].join(' ');
        assert.doesNotMatch(lines, /\b(undefined|null|NaN|wrong|mistake|stupid|silly|fail\w*|lack\w*)\b/i, lines);
      }
    }
  }
  assert.ok(checked > 500 && withHelp > 300, `${checked} misses checked, ${withHelp} with a helper`);
  assert.equal(an('eggshell'), 'an eggshell'); assert.equal(an('paper bag'), 'a paper bag'); assert.equal(list(['a', 'b', 'c']), 'a, b and c'); assert.equal(list(['a', 'b', 'c'], 'or'), 'a, b or c');
  assert.equal(wrongBin('eggshell', true), 'The eggshell goes in Food scraps in our town. Try that bin.');
});

test('no line says "lacked", and the lines about the tray and the street say what is true', () => {
  const all = [];
  for (const j of [true, false]) all.push(SAY.teach0(j, 3), SAY.teachReady(j), SAY.teachMore(j, 4, true), SAY.teachMore(j, 4, false), SAY.full(j), SAY.test1(j, 8), SAY.testAgain(j), SAY.review(j, 5, 8), SAY.result(j, 5, 8, 8), SAY.result(j, 5, 5, 8), SAY.result(j, 5, 4, 8), SAY.resultFull(j), SAY.tune(), SAY.street(j, 5), SAY.streetEnd(j, { right: 3, of: 5, asked: 1, wrong: 1 }), stageLine('teach', { round: 1 }), stageLine('teach', { round: 0 }));
  for (const l of [...all, ...STEPS, css]) assert.doesNotMatch(l, /lack/i, l.slice(0, 80));
  assert.match(SAY.testAgain(true), /still not been shown/); assert.match(SAY.street(true), /not on the bench or the test tray/); assert.match(SAY.teachMore(true, 4, true), /like the things it got wrong/);
  for (const f of [SAY.teach0, SAY.test1, SAY.review, SAY.street]) for (const j of [true, false]) assert.ok(f(j, 3, 8).length > 20);
});

test('the bench rules: first examples, room for more, one example of each thing', () => {
  assert.deepEqual(L.shelf([], 0, true), L.starters(true));
  assert.equal(L.canShow('newspaper', 'paper', [], 0, 0, true).ok, true);
  assert.deepEqual(L.canShow('newspaper', 'glass', [], 0, 0, true), { ok: false, why: 'bin', right: 'paper' });
  assert.equal(L.canShow('brownbottle', 'glass', [], 0, 0, true).why, 'later'); assert.equal(L.canShow('newspaper', 'paper', ex('newspaper'), 0, 1, true).why, 'shown');
  assert.equal(L.canShow('toaster', 'repair', [], 0, 0, true).why, 'unknown'); assert.equal(L.canShow('toaster', 'repair', [], 0, 0, false).ok, true);
  assert.equal(L.canShow('greenbottle', 'glass', ex('newspaper'), 1, 0, true).why, 'unknown', 'a tray thing can never be shown');
  assert.equal(L.canShow('brownbottle', 'glass', ex('newspaper'), 1, L.ROOM(true), true).why, 'full'); assert.equal(L.canShow('brownbottle', 'glass', ex('newspaper'), 1, 0, true).ok, true);
  assert.equal(L.readyToTest(ex('newspaper', 'clearjar'), 0, 2, true), false); assert.equal(L.readyToTest(ex('newspaper', 'clearjar', 'banana'), 0, 3, true), true);
  assert.equal(L.readyToTest(ex('newspaper', 'clearjar', 'banana'), 0, 3, false), false, 'ages 13–17 have a fourth bin');
  assert.equal(L.readyToTest(ex('newspaper', 'clearjar', 'banana'), 1, 0, true), false); assert.equal(L.readyToTest(ex('newspaper', 'clearjar', 'banana', 'browneggshell'), 1, 1, true), true);
  assert.ok(!L.shelf(ex('newspaper'), 1, true).includes('newspaper')); assert.ok(L.shelf(ex('newspaper'), 1, true).includes('browneggshell')); assert.ok(!L.shelf([], 1, true).includes('burgerbox')); assert.ok(L.shelf([], 1, false).includes('burgerbox'));
});

test('ages 13–17: switching off a feature really changes what the robot does, and the table counts every thing once', () => {
  assert.deepEqual(L.featsOn(false, ['colour']), ['shape', 'feel', 'state']); assert.deepEqual(L.featsOn(false, S), S, 'at least one stays on'); assert.deepEqual(L.featsOn(true, ['colour']), ['shape', 'feel']);
  assert.deepEqual(L.cleanOff(['colour', 'nonsense'], false), ['colour']); assert.deepEqual(L.cleanOff(['colour'], true), []); assert.deepEqual(L.cleanOff(S, false), []);
  // with colour off the white eggshell no longer goes with the white newspaper
  const e = ex(...L.starters(false)); assert.equal(L.classify('eggshell', e, S).bin, 'paper'); assert.notEqual(L.classify('eggshell', e, L.featsOn(false, ['colour'])).bin, 'paper');
  let moved = 0;
  for (const seed of SEEDS.slice(0, 40)) {
    const tray = L.makeTray(seed, false); const base = L.runTest(tray, e, S);
    for (const f of S) { const t = L.runTest(tray, e, L.featsOn(false, [f])); if (t.right !== base.right) moved++; assert.match(tuneLine(L.featsOn(false, [f]), [f], t.right, t.of, base.right), new RegExp(`^With ${L.FEATURES[f].label.toLowerCase()} switched off: ${t.right} of ${t.of}, (${Math.abs(t.right - base.right)} (more|fewer) than|the same as) with everything on\\.$`)); }
    const c = L.confusion(base, false); assert.deepEqual(c.cols, ['paper', 'glass', 'food', 'repair', 'ask']); assert.equal(c.rows.flatMap((r) => r.cells).reduce((a, b) => a + b, 0), tray.length);
    assert.equal(c.rows.reduce((a, r) => a + r.cells[c.cols.indexOf(r.bin)], 0), base.right, 'the diagonal is the score');
  }
  assert.ok(moved > 60, `the score moved in ${moved} of 160 switch-offs`);
  assert.equal(tuneLine(S, [], 9, 10, 9), 'Looking at colour, shape, feel and condition: 9 of 10.');
});

test('progress kept between visits is checked, and resumes at a sensible step', () => {
  const ok = { v: 2, j: true, seed: 42, rounds: [['newspaper', 'clearjar', 'banana'], ['browneggshell']], tests: 1, stage: 'teach', off: [] };
  assert.deepEqual(L.cleanSaved(ok, true), ok); assert.deepEqual(cleanState(ok), ok);
  assert.equal(L.cleanSaved(ok, false), null, 'the other age route starts again'); assert.equal(L.cleanSaved(null, true), null); assert.equal(L.cleanSaved({ v: 2, plays: 2 }, true), null);
  assert.equal(L.cleanSaved({ ...ok, v: 1 }, true), null, 'a save from the first version starts a new robot');
  assert.equal(L.cleanSaved({ ...ok, stage: 'result' }, true).stage, 'teach', 'a result needs a test for every round');
  assert.equal(L.cleanSaved({ ...ok, tests: 2, stage: 'result' }, true).stage, 'result');
  assert.equal(L.cleanSaved({ ...ok, rounds: [['newspaper']], tests: 0, stage: 'test' }, true).stage, 'teach', 'not every bin has an example yet');
  assert.equal(L.cleanSaved({ ...ok, rounds: [['newspaper', 'clearjar', 'banana']], tests: 0, stage: 'test' }, true).stage, 'test');
  const odd = L.cleanSaved({ v: 2, j: true, seed: 7, rounds: [['newspaper', 'newspaper', 'toaster', 'nonsense', 5, 'eggshell', 'browneggshell']], tests: 9, stage: 'street', off: ['colour'] }, true);
  assert.deepEqual(odd.rounds[0], ['newspaper']); assert.equal(odd.stage, 'teach'); assert.ok(odd.tests <= odd.rounds.length); assert.deepEqual(odd.off, []);
  const rev = L.cleanSaved({ ...ok, rounds: [ok.rounds[0]], tests: 1, stage: 'review' }, true); assert.equal(rev.stage, 'review'); assert.equal(rev.rounds.length, 1);
  const aft = L.cleanSaved({ ...ok, rounds: [ok.rounds[0]], tests: 1, stage: 'teach' }, true); assert.equal(aft.rounds.length, 2, 'a new round to fill after the test');
  assert.deepEqual(L.cleanSaved({ v: 2, j: false, seed: 1, rounds: [L.starters(false)], tests: 1, stage: 'review', off: ['colour'] }, false).off, ['colour']);
});

test('the training record is built from what was done, says only true things, and fits the contract', () => {
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
    assert.match(rec.lines[0], new RegExp(`^First shown ${r0.length} examples for ${junior ? 3 : 4} bins: `)); assert.equal(rec.lines[1], `First test: ${t1.right} of ${t1.of} unseen things in the right bin.`);
    assert.ok(rec.lines.includes(`Second test, same unseen things: ${t2.right} of ${t2.of}.`)); assert.match(rec.lines[rec.lines.length - 1], /^In the street by the timber terrace: \d of \d new things sorted/);
    assert.equal(rec.practised[0], `teaching a robot by showing it ${r0.length + add.length} examples`);
    assert.equal(rec.practised[1], `testing it on ${t1.of} things it had not been shown, and reading why it missed some`);
    assert.match(rec.practised[2], new RegExp(`testing again: ${t1.right} of ${t1.of}, then ${t2.right} of ${t2.of}$`));
    // "unseen" and "new" in the record are true: nothing shown is in the tray or the street
    for (const id of [...r0, ...add]) { assert.ok(!tray.includes(id)); assert.ok(!L.makeStreet(11, junior).includes(id)); }
    for (const l of [...rec.lines, ...rec.practised]) { assert.ok(l.length <= 120, l); assert.doesNotMatch(l, /learn|improv|undefined|lack|kept apart/i, l); }
    assert.match(picture, /First test/); assert.match(picture, new RegExp(`${t2.right} of ${t2.of}`)); assert.match(picture, /In the street/);
    if (!junior) { // a feature switched off for the street is recorded with its own score
      const tuned = L.runTest(tray, L.examplesOf([r0, add]), L.featsOn(false, ['colour']));
      const rec2 = record({ rounds: [r0, add], tests: [t1, t2], street, bins: 4, beside: null, tune: { off: ['colour'], right: tuned.right, of: tuned.of } });
      assert.ok(rec2.lines.includes(`Second test, same unseen things: ${t2.right} of ${t2.of}. With colour switched off: ${tuned.right} of ${tuned.of}.`));
      assert.equal(rec2.practised[3], 'choosing what the robot looks at, then checking it on new things in the street'); for (const l of [...rec2.lines, ...rec2.practised]) assert.ok(l.length <= 120, l);
      assert.deepEqual(cleanResult({ finished: true, record: { made: { title: rec2.title, lines: rec2.lines }, practised: rec2.practised } }).record.made.lines, rec2.lines);
    }
  }
  // a short visit: one example each and no later round still makes sense
  const t = L.runTest(L.makeTray(1, true), ex('newspaper', 'clearjar', 'banana'), J);
  const small = record({ rounds: [['newspaper', 'clearjar', 'banana']], tests: [t], street: null, bins: 3 });
  assert.equal(small.practised.length, 2); assert.equal(small.lines.length, 3);
  // long lists of names are shortened, never cut mid-word
  const long = record({ rounds: [L.starters(false), L.mores(false)], tests: [t, t], street: null, bins: 4 });
  for (const l of long.lines) assert.ok(l.length <= 120 && l.endsWith('.'), l); assert.match(long.lines.join(' '), /and \d+ more\./);
  assert.ok(cleanReport('robots', { stage: stageLine('result', { first: 5, right: 8, of: 8 }) }).stage.length <= 80); assert.equal(stageLine('teach', { round: 0 }), 'Showing the robot its first examples');
  assert.match(robotSvg('ask'), /^<svg/); assert.match(binSvg('#123456'), /#123456/); assert.equal(cleanMade({ title: 'x', picture: chartSvg({ tests: [t], shown: [3], street: null }) }).picture.startsWith('<svg'), true);
  assert.match(workshopSvg(), /^<svg/); assert.doesNotMatch(workshopSvg(), /undefined|NaN/);
});

// the practice town a finished player has: Florence's island with every mission's plan built (as the reviewer's run made it)
function builtTown(terrain) { const cells = seedTo(terrain, 'heart'); return applyPlacements(cells, plan('heart', CLEAR.heart, { terrain, cells, numbers: { minutes: 10 } }).placements); }
const FLAT = new Set(['road', 'carpark', 'path', 'cycle', 'tram', 'bridge', 'bigfield', 'mixed', 'allot', 'raingarden', 'reedbed', 'compost']);
function openSide(sp, cells, terrain) { // the tile on the camera's side is on the island and has nothing tall on it
  const town = new Map(cells); const [x, z] = sp.key.split(',').map(Number); const k = `${x + sp.look[0]},${z + sp.look[1]}`; const t = terrain.tiles.get(k); const c = town.get(k);
  return !!t && !t.fixed && !(c?.item && !FLAT.has(c.item));
}

test('where the robot works: never a tile shut in on all four sides, and the camera always has open ground to stand over', () => {
  const terrain = makeTerrain(); const free = [...terrain.tiles.values()].filter((t) => !t.fixed && t.zone === 'slope').map((t) => t.k);
  const [a, b, c] = free; const xy = (k) => k.split(',').map(Number);
  const empty = spot([], terrain); assert.ok(empty && terrain.tiles.has(empty.key)); assert.equal(empty.how, 'island'); assert.equal(empty.beside, null); assert.ok(openSide(empty, [], terrain));
  assert.ok(!terrain.tiles.get(empty.key).fixed && terrain.tiles.get(empty.key).zone !== 'river'); assert.deepEqual(spot([], terrain), empty, 'the same every time');
  assert.equal(spot([], { tiles: [...terrain.tiles.values()] }).key, empty.key, 'tiles may be a list');
  const town = [[a, { mark: 'town', item: 'timber', mods: [] }], [b, { mark: 'town', item: null, mods: [] }], [c, { mark: 'town', item: 'school', mods: [] }]];
  const s = spot(town, terrain); assert.equal(s.key, b, 'the open town tile'); assert.equal(s.how, 'street'); assert.ok(openSide(s, town, terrain)); assert.ok(s.open >= 1);
  assert.equal(spot(town, terrain, b).key, b);
  // the kept tile was built on since: the robot moves to open ground beside the town
  const built = town.map(([k, cell]) => (k === b ? [k, { ...cell, item: 'straw' }] : [k, cell])); const moved = spot(built, terrain, b);
  assert.ok(moved && moved.key !== b); assert.equal(moved.how, 'edge'); assert.ok(!built.some(([k]) => k === moved.key)); assert.ok(openSide(moved, built, terrain));
  // a cycle lane with a home on all four sides (the first version chose exactly this and filmed the inside of a cottage)
  const inner = [...terrain.tiles.values()].find((t) => !t.fixed && t.zone !== 'river' && [[0, 1], [1, 0], [-1, 0], [0, -1]].every(([dx, dz]) => { const n = terrain.tiles.get(`${t.gx + dx},${t.gz + dz}`); return n && !n.fixed && n.zone !== 'river'; }));
  const [ix, iz] = xy(inner.k); const ring = [[0, 1], [1, 0], [-1, 0], [0, -1]].map(([dx, dz]) => [`${ix + dx},${iz + dz}`, { mark: 'town', item: 'timber', mods: [] }]);
  const boxed = [[inner.k, { mark: 'town', item: 'cycle', mods: [] }], ...ring];
  const out = spot(boxed, terrain); assert.ok(out && out.key !== inner.k, 'the shut-in lane is not chosen'); assert.ok(openSide(out, boxed, terrain));
  assert.notEqual(spot(boxed, terrain, inner.k).key, inner.k, 'not even when it was the tile used last time');
  // Florence's practice town, fully built
  const full = [...builtTown(terrain)].map(([k, cell]) => [k, { ...cell }]); const fs = spot(full, terrain);
  assert.ok(fs, 'the built town has a place for the robot'); assert.ok(openSide(fs, full, terrain), `built town: ${fs.key} looks ${fs.look}`); assert.equal(fs.how, 'street');
  // and any town at all: random builds on random tiles, many times over
  const items = ['timber', 'straw', 'cohousing', 'school', 'market', 'path', 'cycle', 'road', 'allot', null, null]; const tiles = [...terrain.tiles.values()].filter((t) => !t.fixed && t.zone !== 'river');
  for (const seed of SEEDS.slice(0, 300)) {
    const r = L.rng(seed); const cells = []; const fill = 0.15 + r() * 0.85;
    for (const t of tiles) if (r() < fill) cells.push([t.k, { mark: 'town', item: items[Math.floor(r() * items.length)], mods: [] }]);
    const sp = spot(cells, terrain); if (!sp) continue;
    assert.ok(openSide(sp, cells, terrain), `seed ${seed}: ${sp.key} looks ${sp.look} into something tall`); const cell = new Map(cells).get(sp.key); assert.ok(!cell?.item || ['path', 'cycle'].includes(cell.item));
  }
  // every tile built on with something tall: nowhere to stand, so nothing is drawn
  assert.equal(spot(tiles.map((t) => [t.k, { mark: 'town', item: 'timber', mods: [] }]), terrain), null);
  assert.equal(spot([], { tiles: new Map() }), null); assert.equal(spot([], null), null);
  assert.ok(cleanTown({ kind: 'recycling-robot', data: { key: s.key, bins: ['paper', 'glass', 'food'], things: [...L.starters(false), ...L.mores(false)].slice(0, 16), right: 8, of: 8 } }));
});

test('the module object fits the contract and draws nothing where there is nowhere to stand', () => {
  assert.equal(mod.id, 'robots'); assert.equal(typeof mod.run, 'function'); assert.equal(typeof mod.show, 'function');
  assert.ok(mod.css.length > 500); for (const rule of mod.css.split('}').map((r) => r.trim()).filter((r) => r && !r.startsWith('@') && !/^(from|to|\d+%)/.test(r))) assert.ok(rule.replace(/^@media[^{]*\{\s*/, '').startsWith('#module[data-module="robots"]'), rule.slice(0, 60));
  assert.match(mod.css, /touch-action: pan-y/); assert.doesNotMatch(mod.css, /touch-action: none/);
  const off = mod.show({ engine: {}, town: { cells: [], terrain: { tiles: new Map() } }, junior: true, reduceMotion: true }, { key: '1,1', bins: ['paper'], things: [] });
  assert.equal(typeof off, 'function'); off();
  assert.equal(typeof mod.show({ engine: {}, town: { cells: [], terrain: null } }, {}), 'function');
});
