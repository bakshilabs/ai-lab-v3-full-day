// Town film studio, the hour (js/modules/film): the six missions, the saved progress, the record, and each mission's
// questions, checks and drawings. All pure: no page, no 3D.
import test from 'node:test'; import assert from 'node:assert/strict';
import { makeTerrain } from '../js/world/terrain.js';
import { simulate } from '../js/sim/sim.js';
import { cleanResult, cleanState } from '../js/modules/contract.js';
import { findSet } from '../js/modules/film/kit.js';
import { poseFor, lensMm } from '../js/modules/film/camera.js';
import * as Hr from '../js/modules/film/hour.js';
import * as M1 from '../js/modules/film/m1-crew.js';
import * as M2 from '../js/modules/film/m2-story.js';
import * as M4 from '../js/modules/film/m4-edit.js';
import * as M5 from '../js/modules/film/m5-access.js';
import * as M6 from '../js/modules/film/m6-truth.js';
import * as A from '../js/modules/film/art.js';
import { firstCut, restore } from '../js/modules/film/cut.js';
import { summary } from '../js/modules/film/m3-direct.js';

const terrain = makeTerrain(); const tiles = [...terrain.tiles.values()];
function town(list) { const cells = new Map(); for (const [k, item] of list) cells.set(k, { mark: 'town', item, mods: [] }); return { cells: [...cells], sim: simulate(terrain, cells, {}) }; }
const full = town([['6,3', 'timber'], ['7,3', 'straw'], ['7,4', 'timber'], ['11,5', 'cohousing'], ['8,5', 'market'], ['9,5', 'hall'], ['11,3', 'school'], ['10,4', 'park']]);
const fullSet = findSet(full.cells, tiles, full.sim); const bare = town([]); const bareSet = findSet(bare.cells, tiles, bare.sim);
const SETS = [['a small town', fullSet], ['an empty island', bareSet]];
const SHORT = (s, max) => s.split(/(?<=[.!?])\s+/).every((x) => x.split(/\s+/).length <= max);
const allItems = (set, junior) => [
  ...M1.sizeItems(set, junior), ...M1.moveItems(set, junior), ...M1.sceneItems(set),
  ...M4.takeItems(() => '<svg></svg>').flatMap((t) => [t.pickOne, t.whatWrong]), ...M4.turnItems(() => '<svg></svg>'), ...M4.musicItems(),
  ...M5.captionItems(junior), ...M5.descItems(junior), ...M6.changeItems().flatMap((c) => [c.what, c.judge]), ...M6.pictureItems(), ...M6.permissionItems(),
];

test('six missions, each a different real job, in the order the curriculum gives', () => {
  assert.deepEqual(Hr.MISSION_IDS, ['crew', 'story', 'direct', 'edit', 'access', 'truth']);
  assert.deepEqual(Hr.MISSIONS.map((m) => m.use), ['The film crew’s language', 'Storyboarding', 'Directing an AI helper', 'Editing', 'Making it for everyone', 'True or made up?']);
  for (const m of Hr.MISSIONS) { assert.ok(m.icon && m.job && m.how.j && m.how.s && m.can); assert.ok(SHORT(m.job, 24) && SHORT(m.how.j, 22), m.id); }
});

test('missions open in order; a finished one can be played again; leaving keeps what was finished', () => {
  const st = Hr.freshHour(); assert.equal(Hr.nextMission(st), 0); assert.ok(Hr.isOpen(st, 0)); assert.ok(!Hr.isOpen(st, 1));
  Hr.finishMission(st, 0, { of: 13, first: 9 }); assert.ok(Hr.isOpen(st, 1) && !Hr.isOpen(st, 2)); assert.equal(Hr.nextMission(st), 1);
  const back = Hr.restoreHour(JSON.parse(JSON.stringify(st))); assert.deepEqual(back.done, [true, false, false, false, false, false]); assert.deepEqual(back.res.crew, { of: 13, first: 9 });
  // a save that claims a later mission without the one before it is not believed
  assert.deepEqual(Hr.restoreHour({ v: 2, done: [true, false, true, true, false, false] }).done, [true, false, false, false, false, false]);
  // the ten-minute version's save becomes mission 3's progress
  const old = { v: 1, brief: { place: 'market', who: 'family', mood: 'calm' }, cut: null }; assert.equal(Hr.restoreHour(old).m3, old);
  for (const bad of [null, 'x', 7, { v: 9 }]) assert.deepEqual(Hr.restoreHour(bad), Hr.freshHour());
  assert.match(Hr.lockedLine(2), /in order/);
});

test('the whole hour saved is well under 8 KB, and never holds free text', () => {
  const st = Hr.freshHour(); Hr.MISSIONS.forEach((_, i) => Hr.finishMission(st, i, { of: 13, first: 9, stories: 3, spare: true, takes: 3, caps: 4, descs: 3, clues: 4, pics: 6, bad: 'a <script>' }));
  st.m3 = { ...restore(null, fullSet), cut: firstCut({ place: 'market', who: 'family', mood: 'party' }, fullSet), log: Array.from({ length: 40 }, (_, i) => ({ n: i, id: 'shorter' })) };
  assert.ok(JSON.stringify(st).length < 4000); assert.deepEqual(cleanState(st), JSON.parse(JSON.stringify(st)));
  assert.equal(st.res.crew.bad, undefined);
});

test('the record: one line a mission, two to four practised lines, and the contract accepts it', () => {
  const st = Hr.freshHour(); Hr.finishMission(st, 0, { of: 13, first: 9 }); Hr.finishMission(st, 1, { stories: 3, first: 2, spare: true }); Hr.finishMission(st, 2, { cuts: 2 });
  Hr.finishMission(st, 3, { takes: 3, first: 2 }); Hr.finishMission(st, 4, { caps: 4, descs: 3, first: 5 }); Hr.finishMission(st, 5, { pics: 6, clues: 4, first: 7 });
  st.m3 = { ...restore(null, fullSet), brief: { place: 'market', who: 'family', mood: 'party' }, cut: firstCut({ place: 'market', who: 'family', mood: 'party' }, fullSet), log: [{ n: 2, id: 'shorter' }] };
  const sum = summary(restore({ ...st.m3, done: false }, fullSet), fullSet, true);
  const lines = Hr.hourLines(st, sum.line); assert.equal(lines.length, 6); assert.match(lines[2], /^Directed “/); assert.ok(lines.every((l) => l.length <= 120));
  const practised = Hr.hourPractised(st); assert.ok(practised.length >= 2 && practised.length <= 4);
  for (const l of practised) assert.doesNotMatch(l, /learn|improv(ed|ing) (your|their)|better at/i);
  const r = cleanResult({ finished: true, record: { made: { title: sum.title, lines, picture: sum.picture }, practised }, town: { kind: 'film-screen', data: sum.town } });
  assert.equal(r.finished, true); assert.ok(r.record.made.picture); assert.ok(r.town);
});

test('mission 1: shot sizes and moves, the real definitions, and the same subject at three sizes', () => {
  for (const [, set] of SETS) {
    const sizes = M1.sizeItems(set, true); assert.ok(sizes.length >= 3); assert.deepEqual(sizes.slice(0, 3).map((x) => x.answer).sort(), ['close', 'medium', 'wide']);
    // a close-up of Florence stands closer, with a longer lens, than a medium shot, and that closer than a wide one
    const d = (m) => { const p = poseFor({ move: m, sub: 'who:florence' }, set, 0.5); return Math.hypot(p.pos[0] - p.look[0], p.pos[1] - p.look[1], p.pos[2] - p.look[2]); };
    assert.ok(d('cw-close') < d('cw-medium') && d('cw-medium') < d('cw-wide'));
    assert.ok(lensMm(poseFor({ move: 'cw-close', sub: 'who:florence' }, set).fov) > lensMm(poseFor({ move: 'cw-wide', sub: 'who:florence' }, set).fov));
    const moves = M1.moveItems(set, false); assert.deepEqual([...new Set(moves.map((x) => x.answer))].sort(), ['pan', 'tilt', 'track']);
    for (const x of moves) {
      const a = poseFor(x.shot, set, 0), b = poseFor(x.shot, set, 1); const moved = Math.hypot(a.pos[0] - b.pos[0], a.pos[1] - b.pos[1], a.pos[2] - b.pos[2]);
      if (x.answer === 'track') assert.ok(moved > 10, 'a track moves the camera'); else assert.ok(moved < 0.01, `a ${x.answer} stays in one spot`);
      if (x.answer === 'tilt') assert.ok(b.look[1] - a.look[1] > 8, 'a tilt turns upward');
      if (x.answer === 'pan') assert.ok(Math.hypot(a.look[0] - b.look[0], a.look[2] - b.look[2]) > 10 && Math.abs(a.look[1] - b.look[1]) < 0.01, 'a pan turns side to side');
      assert.match(x.more, /°|tiles/);
    }
    const scenes = M1.sceneItems(set); assert.equal(new Set(scenes.map((x) => x.answer)).size, 6);
  }
  assert.equal(M1.sizeItems(fullSet, true)[0].more, ''); assert.match(M1.sizeItems(fullSet, false)[0].more, /mm lens/);
});

test('every question: the right answer is one of its tiles, every wrong tile says why, and no line gives the answer away', () => {
  for (const [, set] of SETS) for (const junior of [true, false]) for (const it of allItems(set, junior)) {
    const ids = it.opts.map((o) => o.id); const right = it.answers || [it.answer];
    assert.ok(right.every((r) => ids.includes(r)), it.q); assert.equal(new Set(ids).size, ids.length, it.q); assert.ok(it.opts.length >= 2 && it.ok, it.q);
    for (const o of it.opts) if (!right.includes(o.id)) { assert.ok(o.why && o.why.length > 10, `${it.q}: ${o.label}`); for (const r of right) assert.ok(!o.why.includes(it.opts.find((x) => x.id === r).label), `${it.q}: the why names the answer`); }
    if (it.hint) for (const r of right) assert.ok(!it.hint.includes(it.opts.find((x) => x.id === r).label), `${it.q}: the hint names the answer`);
    assert.doesNotMatch(`${it.q} ${it.ok} ${it.hint || ''}`, /£|\$|budget|coins|money/i);
  }
});

test('ages 8–12 get no numbers in the extra line; ages 13–17 get the job’s numbers', () => {
  for (const it of [...M1.sizeItems(fullSet, true), ...M5.captionItems(true), ...M5.descItems(true)]) assert.equal(it.more || '', '');
  assert.match(M5.captionItems(false)[0].more, /a second/); assert.match(M5.descItems(false)[0].more, /words take about/);
  assert.match(M4.paceVerdict(M4.PACES[0], ['quick', 'quick', 'quick', 'quick', 'medium'], false).say, /cuts a minute/);
  assert.doesNotMatch(M4.paceVerdict(M4.PACES[0], ['quick', 'quick', 'quick', 'quick', 'medium'], true).say, /\d/);
});

test('mission 2: a story is checked by its beats, the hint points at the problem, and the right order passes', () => {
  for (const s of M2.STORIES) {
    assert.equal(M2.checkOrder(s, s.cards).ok, true, s.id);
    const dealt = M2.dealt(s, false); assert.notDeepEqual(dealt.map((c) => c.id), s.cards.map((c) => c.id));
    const bad = M2.checkOrder(s, dealt.slice(0, s.cards.length)); assert.equal(bad.ok, false); assert.ok(bad.say.length > 10);
    for (const c of s.cards) assert.ok(A.STORY_ART[c.art], c.art);
    for (const set of [fullSet, bareSet]) for (const c of s.cards) { const sh = M2.shotOf(c, set); assert.ok(sh.sub === 'town' || sh.sub.startsWith('who:') || bareSet.places.length, c.id); }
  }
  const mk = M2.STORIES[2]; assert.equal(M2.dealt(mk, true).length, mk.cards.length + 1);
  const withSpare = [...mk.cards.slice(0, 4), mk.spare]; assert.equal(M2.checkOrder(mk, withSpare).code, 'spare');
  const swapped = [mk.cards[0], mk.cards[1], mk.cards[3], mk.cards[2], mk.cards[4]]; assert.equal(M2.checkOrder(mk, swapped).code, 'problem');
  assert.equal(M2.checkOrder(mk, [mk.cards[1], mk.cards[0], ...mk.cards.slice(2)]).code, 'start');
  assert.match(M2.splitLine(mk), /15-second film\. Beginning 40%, middle 40%, end 20%/);
});

test('mission 4: the trim check, the pace verdicts and the music cut', () => {
  assert.equal(M4.checkTrim(['r2', 'r5']).ok, true); assert.match(M4.checkTrim([]).say, /Two clips/); assert.match(M4.checkTrim(['r5']).say, /by mistake/);
  assert.match(M4.checkTrim(['r2']).say, /same thing/); assert.match(M4.checkTrim(['r2', 'r5', 'r1']).say, /Clip 1 is part of the story/);
  const [fast, slow] = M4.PACES; const all = (l) => Array(5).fill(l);
  assert.equal(M4.paceVerdict(fast, all('medium'), true).ok, false); assert.equal(M4.paceVerdict(fast, all('quick'), true).ok, true);
  assert.equal(M4.paceVerdict(slow, all('medium'), true).ok, false); assert.equal(M4.paceVerdict(slow, all('long'), true).ok, true);
  const cut = M4.editCut(fullSet, { music: { start: 'day', middle: 'lab', end: 'celebrate' } });
  assert.deepEqual(cut.shots.map((s) => s.music), ['day', undefined, 'lab', undefined, 'celebrate']);
  assert.ok(cut.shots.every((s) => s.sub === 'town' || fullSet.places.some((p) => `place:${p.id}` === s.sub)));
  assert.ok(M4.editCut(bareSet, { lens: all('quick') }).shots.every((s) => s.secs === 1.5));
  for (const t of Object.keys(M4.TUNES)) assert.ok(['day', 'night', 'lab', 'celebrate'].includes(t)); // the game's own music only
});

test('mission 5: captions name the speaker and the sound; descriptions fit the gap', () => {
  const caps = M5.captionItems(false);
  assert.match(caps[0].caption, /^FLORENCE:/); assert.ok(caps.slice(1).every((c) => /^\[.+\]$/.test(c.caption)));
  for (const c of caps) assert.ok(M5.words(c.caption) / 2 <= M5.READ_WPS, c.caption);
  for (const d of M5.descItems(false)) { assert.ok(M5.words(d.desc) / M5.SPEAK_WPS <= 4, d.desc); const long = d.opts.reduce((a, o) => (M5.words(o.label) > M5.words(a.label) ? o : a)); assert.ok(long.id === d.answer || M5.words(long.label) / M5.SPEAK_WPS > 4 || long.why); }
  const show = M5.screening(caps, M5.descItems(true)); assert.equal(show.length, 6); assert.ok(show.every((s) => A.SHOT_ART[s.art]));
});

test('mission 6: changes, machine-made clues and asking first; everything drawn and made up', () => {
  const ch = M6.changeItems(); assert.deepEqual(ch.map((c) => c.judge.answer), ['fine', 'fine', 'mislead', 'mislead']);
  const pics = M6.pictureItems(); assert.deepEqual(pics.map((p) => p.answer), ['filmed', 'clue', 'clue', 'filmed', 'clue', 'clue']);
  assert.ok(pics.every((p) => A.MADE_ART[p.id])); assert.ok(M6.CHANGES.every((c) => A.CHANGE_ART[c.id])); assert.ok(M6.PERMISSION.every((p) => A.PEOPLE_ART[p.art]));
  assert.match(M6.HONEST.join(' '), /no clue at all/); assert.match(M6.HONEST.join(' '), /where did it come from/i);
  assert.equal(M6.PERMISSION.at(-1).answer, 'both');
});

test('the drawings are safe inline SVG: no script, no links, no outside pictures', () => {
  const all = [...Object.keys(A.STORY_ART).map((k) => A.storyPic(k)), ...['hall', 'florence', 'otters'].flatMap((s) => [null, ...Object.keys(A.FAULTS)].map((f) => A.takePic(s, f))),
    ...Object.keys(A.SHOT_ART).map((k) => A.shotPic(k)), A.captionPic('otters', 'FLORENCE: <b>hi</b>'), ...Object.keys(A.MADE_ART).map((k) => A.madePic(k)), ...Object.keys(A.PEOPLE_ART).map((k) => A.peoplePic(k)), ...Object.keys(A.CHANGE_ART).map((k) => A.changePair(k))];
  for (const s of all) { assert.match(s, /^<svg /); assert.doesNotMatch(s, /<script|on\w+\s*=|javascript:|href=|<image|NaN|undefined/); }
  assert.match(A.captionPic('otters', 'a <b>'), /a &lt;b&gt;/);
  const ids = [A.takePic('hall', 'blur'), A.takePic('hall', 'blur')].map((s) => /id="([^"]+)"/.exec(s)[1]); assert.notEqual(ids[0], ids[1]); // two blurred takes on one page
});
