// Town film studio: every labelled shot is the size its label says, measured as the height of the view at the
// subject (2 · distance · tan(fov / 2)), with mission 1's sizes; the take-home cells clip their drawings; and the
// pace verdicts read well. All pure: no page, no 3D.
import test from 'node:test'; import assert from 'node:assert/strict';
import { makeTerrain } from '../js/world/terrain.js';
import { simulate } from '../js/sim/sim.js';
import { findSet } from '../js/modules/film/kit.js';
import { poseFor } from '../js/modules/film/camera.js';
import { firstCut } from '../js/modules/film/cut.js';
import { storyboardSvg } from '../js/modules/film/picture.js';
import * as M2 from '../js/modules/film/m2-story.js';
import * as M4 from '../js/modules/film/m4-edit.js';
import * as M6 from '../js/modules/film/m6-truth.js';
import { missLimit } from '../js/modules/film/mui.js';
import { num, restoreHour } from '../js/modules/film/hour.js';

const terrain = makeTerrain(); const tiles = [...terrain.tiles.values()];
function town(list) { const cells = new Map(); for (const [k, item] of list) cells.set(k, { mark: 'town', item, mods: [] }); return { cells: [...cells], sim: simulate(terrain, cells, {}) }; }
const full = town([['6,3', 'timber'], ['7,3', 'straw'], ['7,4', 'timber'], ['11,5', 'cohousing'], ['8,5', 'market'], ['9,5', 'hall'], ['11,3', 'school'], ['10,4', 'park']]);
const fullSet = findSet(full.cells, tiles, full.sim); const bare = town([]); const bareSet = findSet(bare.cells, tiles, bare.sim);

// the height of the view at the subject, and the most each size may show, by what is filmed
const height = (shot, set) => { const p = poseFor(shot, set, shot.move === 'pull' ? 1 : 0.5); return 2 * Math.hypot(...p.pos.map((v, k) => v - p.look[k])) * Math.tan(p.fov / 2 * Math.PI / 180); };
const LIMITS = { // [close-up at most, medium at most]; a wide shot shows more than a medium
  'who:florence': [5, 7.3], 'who:family': [1.3, 2.5], 'who:otters': [2, 4], place: [4.5, 25], town: [4.5, 25] };
const limitsOf = (sub) => LIMITS[sub] || LIMITS[sub.split(':')[0]];

test('every storyboard card is filmed at the size its label says', () => {
  for (const set of [fullSet, bareSet]) for (const s of M2.STORIES) for (const c of [...s.cards, ...(s.spares || [])]) {
    const shot = M2.shotOf(c, set); const h = height(shot, set); const [close, medium] = limitsOf(shot.sub);
    const where = `${c.id} "${c.size}: ${c.words}" filmed as ${shot.move} ${shot.sub}: the view is ${h.toFixed(1)} high`;
    if (c.size === 'Close-up') assert.ok(h <= close, where);
    else if (c.size === 'Medium') assert.ok(h > close && h <= medium, where);
    else assert.ok(h > medium, where);
  }
});

test('the take-home storyboard clips each drawing to its own cell', () => {
  const cut = firstCut({ place: 'market', who: 'florence', mood: 'calm' }, fullSet);
  const svg = storyboardSvg({ title: 'A film', cut, set: fullSet });
  assert.equal((svg.match(/<svg width="160" height="90" viewBox="0 0 160 90" overflow="hidden">/g) || []).length, cut.shots.length);
});

test('the pace verdicts: "None of the five shots is quick", never "No of the five"', () => {
  const [fast, slow] = M4.PACES; const all = (l) => Array(5).fill(l);
  for (const junior of [true, false]) {
    assert.match(M4.paceVerdict(fast, all('medium'), junior).say, /^None of the five shots is quick\./);
    assert.match(M4.paceVerdict(slow, all('medium'), junior).say, /^None of the five shots is long\./);
    assert.doesNotMatch(M4.paceVerdict(fast, all('medium'), junior).say, /\bNo of\b/);
  }
  assert.match(M4.paceVerdict(fast, ['quick', 'medium', 'medium', 'medium', 'medium'], true).say, /^One of the five shots is quick\./);
  assert.match(M4.paceVerdict(fast, ['quick', 'quick', 'medium', 'medium', 'medium'], true).say, /^Two of the five shots are quick\./);
});

test('ages 13–17 running times: more than one way to hit each, and the range matches the feel', () => {
  const [fast, slow] = M4.PACES; const L = (q, m, l) => [...Array(q).fill('quick'), ...Array(m).fill('medium'), ...Array(l).fill('long')];
  const ok = (p, lens) => M4.paceVerdict(p, lens, false).ok;
  assert.ok(ok(fast, L(5, 0, 0)) && ok(fast, L(4, 1, 0)) && ok(fast, L(3, 2, 0))); assert.ok(!ok(fast, L(2, 3, 0)) && !ok(fast, L(4, 0, 1)));
  assert.ok(ok(slow, L(0, 1, 4)) && ok(slow, L(0, 2, 3)) && ok(slow, L(1, 0, 4))); assert.ok(!ok(slow, L(0, 0, 5)) && !ok(slow, L(0, 3, 2)));
  // every combination that is in time also has the right feel, and the other way round within the slot
  const lens = ['quick', 'medium', 'long']; for (const a of lens) for (const b of lens) for (const c of lens) for (const d of lens) for (const e of lens) {
    const x = [a, b, c, d, e]; const t = M4.totalSecs(x);
    for (const p of [fast, slow]) if (t >= p.secs[0] && t <= p.secs[1]) assert.ok(p.test(M4.avgSecs(x)), `${p.id} ${x}`);
  }
});

test('mission 4 keeps its finished parts between visits, and nothing else', () => {
  assert.deepEqual(restoreHour({ v: 2, done: [true, true, true, false, false, false], m4: ['takes', 'trim', 'nonsense'] }).m4, ['takes', 'trim']);
  assert.equal(restoreHour({ v: 2, done: [true, false, false, false, false, false] }).m4, null);
});

test('a question is set aside while a wrong tile is still open, so the open tiles never give the answer away', () => {
  const q = (n, answers) => ({ opts: Array.from({ length: n }, (_, i) => ({ id: 'o' + i })), answer: 'o0', ...(answers ? { answers } : {}) });
  assert.equal(missLimit(q(3)), 1); assert.equal(missLimit(q(4)), 2); assert.equal(missLimit(q(6)), 4);
  assert.equal(missLimit(q(4, ['o0', 'o1'])), 1); // two right of four: after one miss, one right and one wrong are open
  // every real question in the hour: when it stops, at least one wrong tile is still open
  for (const it of [...M4.musicItems(), ...M6.pictureItems(true)]) {
    const right = it.answers ? it.answers.length : 1; const open = it.opts.length - missLimit(it);
    assert.ok(open - right >= 1, `${it.q}: ${open} open, ${right} right`);
  }
});

test('numbers in words go past fifteen (the 13–17 record names twenty shots)', () => {
  assert.equal(num(20), 'twenty'); assert.equal(num(16), 'sixteen'); assert.equal(num(0), 'no');
});
