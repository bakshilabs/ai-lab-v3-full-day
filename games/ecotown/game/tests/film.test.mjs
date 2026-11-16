// Town film studio (js/modules/film): the set, the shot kit, the first cut, how feedback changes a cut, the words,
// the camera's path and the storyboard drawings. All pure: no page, no 3D.
import test from 'node:test'; import assert from 'node:assert/strict';
import { makeTerrain, tileCenter, riverX as realRiverX, T as realT, X0 as realX0, Z0 as realZ0 } from '../js/world/terrain.js';
import { simulate } from '../js/sim/sim.js';
import { ITEMS } from '../js/world/catalog.js';
import { readFileSync } from 'node:fs';
const REAL_BRIDGE = /BRIDGE_TILE = '([^']+)'/.exec(readFileSync(new URL('../js/world/bridge.js', import.meta.url), 'utf8'))[1]; // bridge.js needs three.js, so it is read, not loaded
import { cleanResult, cleanMade, cleanTown, cleanState } from '../js/modules/contract.js';
import { findSet, placeOf, whoHere, tileXZ, riverX, T, X0, Z0, BRIDGE_TILE, MOVES, MOVE_IDS, MOODS, MOOD_IDS, WHO_IDS, subjectLabel, screenSpot } from '../js/modules/film/kit.js';
import { firstCut, applyFeedback, moveShot, watched, restore, fresh, townData, cutSecs, briefOk, FEEDBACK, MIN_SHOTS, MAX_SHOTS, MIN_SECS } from '../js/modules/film/cut.js';
import * as W from '../js/modules/film/words.js';
import { poseFor, targetOf, stillAt, wideDist, otterAt } from '../js/modules/film/camera.js';
import { frameSvg, frameInner, storyboardSvg } from '../js/modules/film/picture.js';
import film from '../js/modules/film/index.js';

const terrain = makeTerrain(); const tiles = [...terrain.tiles.values()];
function town(list, extraCells = []) {
  const cells = new Map(); for (const [k, item] of list) cells.set(k, { mark: 'town', item, mods: [] }); for (const [k, c] of extraCells) cells.set(k, c);
  return { cells: [...cells], sim: simulate(terrain, cells, {}) };
}
const FULL = [['6,3', 'timber'], ['7,3', 'straw'], ['7,4', 'timber'], ['11,5', 'cohousing'], ['8,5', 'market'], ['9,5', 'hall'], ['11,3', 'school'], ['10,4', 'park']];
const full = town(FULL); const fullSet = findSet(full.cells, tiles, full.sim);
const bare = town([]); const bareSet = findSet(bare.cells, tiles, bare.sim);
const wetPaths = tiles.filter((t) => t.zone === 'wetland').map((t) => [t.k, { mark: null, item: 'path', mods: [] }]);
const dry = town(FULL, wetPaths); const drySet = findSet(dry.cells, tiles, dry.sim); // the wetland is paved: no otters
const BRIEF = { place: 'market', who: 'family', mood: 'cheerful' };
const fb = (cut, id, set = fullSet, brief = BRIEF) => applyFeedback(cut, id, set, brief);

test('the grid, the river and the bridge tile agree with the game', () => {
  assert.deepEqual([T, X0, Z0], [realT, realX0, realZ0]); assert.equal(BRIDGE_TILE, REAL_BRIDGE);
  for (const t of tiles.slice(0, 20)) assert.deepEqual(tileXZ(t.gx, t.gz), tileCenter(t.gx, t.gz));
  for (const z of [-20, 0, 13.5, 24]) assert.equal(riverX(z), realRiverX(z));
});

test('the set is read from the town: the child\'s builds first, then the island\'s landmarks, six tiles at most', () => {
  assert.deepEqual(fullSet.offer.slice(0, 3), ['market', 'hall', 'school']);
  assert.equal(fullSet.offer.length, 6); assert.ok(fullSet.offer.includes('river') && fullSet.offer.includes('wood'));
  for (const id of fullSet.offer) { const p = placeOf(fullSet, id); assert.ok(p && terrain.tiles.has(p.k) && /^the /.test(p.label), id); }
  assert.equal(placeOf(fullSet, 'market').k, '8,5'); assert.equal(placeOf(fullSet, 'homes').built, true);
  assert.equal(fullSet.school, 'school'); assert.equal(fullSet.square, 'hall'); assert.equal(fullSet.empty, false);
  // the homes: the one in the middle of the others
  assert.ok(['6,3', '7,3', '7,4'].includes(placeOf(fullSet, 'homes').k)); assert.equal(placeOf(fullSet, 'homes').k, '7,3');
});

test('a nearly empty town still has a set: the river, the wood, the bridge, the old school, the AI Lab and the dock', () => {
  assert.equal(bareSet.empty, true);
  assert.deepEqual(bareSet.offer, ['river', 'wood', 'bridge', 'oldschool', 'ailab', 'dock']);
  assert.equal(bareSet.school, 'oldschool'); assert.equal(bareSet.square, 'ailab');
  assert.equal(placeOf(bareSet, 'oldschool').k, terrain.school); assert.equal(placeOf(bareSet, 'ailab').k, terrain.lab);
  assert.equal(bareSet.who.family.here, false); assert.equal(bareSet.who.florence.here, true);
  assert.deepEqual(bareSet.town, [0, 1, -2]);
});

test('who is there comes from the town: a family needs homes, the otters need the wetland', () => {
  assert.deepEqual(whoHere(fullSet), ['family', 'otters', 'florence']);
  assert.deepEqual(whoHere(bareSet), ['otters', 'florence']);
  assert.equal(dry.sim.species.otters, false); assert.deepEqual(whoHere(drySet), ['family', 'florence']);
  assert.equal(fullSet.who.family.k, full.sim.homes[0].k);
});

test('every place knows its most open side, so a low camera does not pass through a building', () => {
  for (const set of [fullSet, bareSet]) for (const p of set.places) { assert.ok(p.side >= 0 && p.side <= 3); assert.equal(typeof p.clear, 'boolean'); }
  // the hall at 9,5 has the market to its west: the side chosen is not the west
  assert.notEqual(placeOf(fullSet, 'hall').side, 3);
});

test('the kit: eight camera moves and four moods from calmest to liveliest, each with one of the game\'s tunes', () => {
  assert.equal(MOVE_IDS.length, 8); for (const m of MOVE_IDS) assert.ok(MOVES[m].name && MOVES[m].does);
  assert.deepEqual(MOOD_IDS, ['calm', 'curious', 'cheerful', 'party']);
  assert.deepEqual(MOODS.map((m) => m.music), ['night', 'lab', 'day', 'celebrate']);
  for (const m of MOODS) assert.ok(m.hour >= 7 && m.hour <= 18.2, 'filmed in daylight');
});

test('the first cut has four to six shots of the place and who the child chose, and depends on the mood', () => {
  const seen = new Set();
  for (const mood of MOOD_IDS) {
    const cut = firstCut({ ...BRIEF, mood }, fullSet); assert.ok(cut.shots.length >= 4 && cut.shots.length <= 6, mood);
    assert.ok(cut.shots.some((s) => s.sub === 'place:market') && cut.shots.some((s) => s.sub === 'who:family'));
    assert.ok(cut.shots.every((s) => MOVES[s.move] && s.secs > 0)); assert.equal(new Set(cut.shots.map((s) => s.id)).size, cut.shots.length);
    assert.equal(cut.n, 1); assert.deepEqual(cut.tags, {}); seen.add(cut.shots.map((s) => s.move).join());
  }
  assert.equal(seen.size, 4, 'each mood gives a different cut');
  assert.ok(firstCut({ ...BRIEF, mood: 'calm' }, fullSet).shots[0].secs > firstCut({ ...BRIEF, mood: 'party' }, fullSet).shots[0].secs);
  assert.notDeepEqual(firstCut({ ...BRIEF, place: 'river' }, fullSet).shots.map((s) => s.sub), firstCut(BRIEF, fullSet).shots.map((s) => s.sub));
});

test('Florence cannot make a cut of what is not there', () => {
  assert.equal(firstCut({ ...BRIEF, who: 'family' }, bareSet), null); assert.equal(firstCut({ ...BRIEF, place: 'market' }, bareSet), null);
  assert.equal(briefOk({ place: 'river', who: 'otters', mood: 'calm' }, bareSet), true);
  assert.ok(firstCut({ place: 'river', who: 'otters', mood: 'calm' }, bareSet));
});

test('"shorter" cuts one shot, keeps the brief, then trims, then says it can go no shorter', () => {
  let cut = firstCut(BRIEF, fullSet); const n0 = cut.shots.length; const r = fb(cut, 'shorter');
  assert.equal(r.ok, true); assert.equal(r.code, 'shorter-cut'); assert.equal(r.cut.shots.length, n0 - 1); assert.equal(r.cut.n, 2);
  assert.equal(r.cut.gone.length, 1); assert.equal(r.cut.gone[0].move, r.shot.move); assert.equal(cut.shots.length, n0, 'the old cut is untouched');
  cut = r.cut; while (cut.shots.length > MIN_SHOTS) cut = fb(cut, 'shorter').cut;
  assert.ok(cut.shots.some((s) => s.sub === 'who:family') && cut.shots.some((s) => s.sub === 'place:market'), 'who and the place are still in it');
  const secs = cutSecs(cut); const t = fb(cut, 'shorter'); assert.equal(t.code, 'shorter-trim'); assert.ok(cutSecs(t.cut) < secs); assert.ok(Object.values(t.cut.tags).includes('changed'));
  cut = t.cut; for (let i = 0; i < 6; i++) cut = fb(cut, 'shorter').cut;
  const end = fb(cut, 'shorter'); assert.equal(end.ok, false); assert.equal(end.code, 'shorter-limit'); assert.ok(cut.shots.every((s) => s.secs === MIN_SECS));
  assert.match(W.feedbackReply(end, fullSet), /as short as a film can be/);
});

test('"start at the school" adds a new first shot of the school, or moves the one there is', () => {
  const cut = firstCut(BRIEF, fullSet); const r = fb(cut, 'school');
  assert.equal(r.code, 'school-new'); assert.equal(r.cut.shots[0].sub, 'place:school'); assert.equal(r.cut.tags[r.cut.shots[0].id], 'new'); assert.equal(r.cut.shots.length, cut.shots.length + 1);
  assert.equal(fb(r.cut, 'school').code, 'school-already');
  // a film about the school: the school shot is moved to the front
  const s = firstCut({ ...BRIEF, place: 'school' }, fullSet); assert.notEqual(s.shots[0].sub, 'place:school');
  const m = fb(s, 'school'); assert.equal(m.code, 'school-moved'); assert.equal(m.cut.shots[0].sub, 'place:school'); assert.equal(m.cut.tags[m.cut.shots[0].id], 'moved'); assert.equal(m.cut.shots.length, s.shots.length);
  // with no town school it is the old school, which was on the island first
  assert.equal(fb(firstCut({ place: 'river', who: 'otters', mood: 'calm' }, bareSet), 'school', bareSet, { place: 'river' }).cut.shots[0].sub, 'place:oldschool');
});

test('"show the otters" adds a close-up when there are otters, and says so when there are none', () => {
  const cut = firstCut(BRIEF, fullSet); const r = fb(cut, 'otters');
  assert.equal(r.code, 'who-new'); const at = r.cut.shots.findIndex((s) => s.sub === 'who:otters'); assert.ok(at >= 0); assert.equal(r.cut.shots[at].move, 'close'); assert.equal(r.number, at + 1);
  const again = fb(r.cut, 'otters'); assert.equal(again.code, 'who-longer'); assert.ok(again.cut.shots[at].secs > r.cut.shots[at].secs);
  // none in the town: nothing changes, she says why and offers who is there
  const d = firstCut(BRIEF, drySet); const no = applyFeedback(d, 'otters', drySet, BRIEF);
  assert.equal(no.ok, false); assert.equal(no.code, 'who-missing'); assert.equal(no.cut, d); assert.deepEqual(no.offers, ['family', 'florence']);
  const line = W.feedbackReply(no, drySet); assert.match(line, /no otters in your town/); assert.match(line, /I can only film what is there/); assert.match(line, /a family or me/);
  const nf = applyFeedback(firstCut({ place: 'river', who: 'otters', mood: 'calm' }, bareSet), 'family', bareSet, { place: 'river' });
  assert.equal(nf.ok, false); assert.match(W.feedbackReply(nf, bareSet), /No family lives in your town yet/);
});

test('"end on the whole town" adds a pull-back as the last shot', () => {
  const cut = firstCut(BRIEF, fullSet); const r = fb(cut, 'town'); const last = r.cut.shots[r.cut.shots.length - 1];
  assert.equal(last.move, 'pull'); assert.equal(last.sub, 'place:market'); assert.equal(r.cut.tags[last.id], 'new'); assert.equal(fb(r.cut, 'town').code, 'town-already');
  assert.match(W.caption(last, fullSet), /to the whole town/);
});

test('a film holds six shots: a new one makes room by cutting one the child did not ask for', () => {
  let cut = firstCut({ ...BRIEF, mood: 'party' }, fullSet); assert.equal(cut.shots.length, MAX_SHOTS);
  const r = fb(cut, 'town'); assert.equal(r.cut.shots.length, MAX_SHOTS); assert.ok(r.dropped); assert.equal(r.cut.gone.length, 1); assert.match(W.feedbackReply(r, fullSet), /to make room/);
  cut = r.cut; for (const id of ['school', 'otters', 'florence']) { cut = fb(cut, id).cut; assert.ok(cut.shots.length <= MAX_SHOTS); }
  assert.equal(cut.shots[0].sub, 'place:school'); assert.equal(cut.shots[cut.shots.length - 1].move, 'pull'); assert.ok(cut.shots.some((s) => s.sub === 'who:otters'));
});

test('"calmer" and "livelier" move the music one step, and stop at each end', () => {
  const cut = firstCut(BRIEF, fullSet); const c = fb(cut, 'calmer'); assert.equal(c.cut.mood, 'curious'); assert.equal(c.cut.moodWas, 'cheerful');
  const c2 = fb(c.cut, 'calmer'); assert.equal(c2.cut.mood, 'calm'); const c3 = fb(c2.cut, 'calmer'); assert.equal(c3.ok, false); assert.match(W.feedbackReply(c3, fullSet), /calmest music I have/);
  const l = fb(fb(cut, 'livelier').cut, 'livelier'); assert.equal(l.ok, false); assert.match(W.feedbackReply(l, fullSet), /liveliest music I have/);
  const back = fb(c.cut, 'livelier'); assert.equal(back.cut.mood, 'cheerful'); assert.equal(back.cut.moodWas, null, 'back where it was: no mark');
});

test('the marks show what changed since the last cut that was watched', () => {
  let cut = firstCut(BRIEF, fullSet); cut = fb(cut, 'shorter').cut; cut = fb(cut, 'school').cut;
  assert.equal(cut.n, 2, 'two pieces of feedback before watching are one new cut'); assert.equal(cut.gone.length, 1); assert.equal(Object.values(cut.tags).filter((t) => t === 'new').length, 1);
  cut = watched(cut); assert.equal(cut.n, 2); assert.equal(cut.gone.length, 1, 'the marks stay while the cut is on show');
  const next = fb(cut, 'town').cut; assert.equal(next.n, 3); assert.equal(next.gone.length, 0); assert.deepEqual(Object.values(next.tags), ['new']);
});

test('ages 13–17 can move a shot earlier or later', () => {
  const cut = firstCut(BRIEF, fullSet); const id = cut.shots[1].id; const r = moveShot(cut, id, 1);
  assert.equal(r.ok, true); assert.equal(r.cut.shots[2].id, id); assert.equal(r.cut.tags[id], 'moved'); assert.equal(r.number, 3);
  assert.equal(moveShot(cut, cut.shots[0].id, -1).ok, false); assert.equal(moveShot(cut, cut.shots[cut.shots.length - 1].id, 1).ok, false);
});

test('every feedback tile gives a line from Florence, whatever the cut', () => {
  for (const set of [fullSet, bareSet, drySet]) {
    const brief = { place: set.offer[0], who: whoHere(set)[0], mood: 'cheerful' }; let cut = firstCut(brief, set);
    for (let i = 0; i < 40; i++) { const f = FEEDBACK[(i * 5 + 3) % FEEDBACK.length]; const r = applyFeedback(cut, f.id, set, brief); const line = W.feedbackReply(r, set);
      assert.ok(line.length > 10 && line.length < 220 && !/undefined|null|NaN/.test(line), `${f.id}: ${line}`);
      assert.ok(r.cut.shots.length >= MIN_SHOTS && r.cut.shots.length <= MAX_SHOTS); cut = i % 3 === 0 ? watched(r.cut) : r.cut; }
  }
});

test('progress is saved and restored, and checked against the town as it is now', () => {
  const st = fresh(); Object.assign(st.brief, BRIEF); st.cut = fb(firstCut(BRIEF, fullSet), 'school').cut; st.plays = 1; st.log.push({ n: 2, id: 'school' });
  const saved = cleanState(st); assert.ok(saved, 'fits the 8 KB the loader keeps');
  const back = restore(saved, fullSet); assert.deepEqual(back.cut.shots, st.cut.shots); assert.equal(back.cut.n, 2); assert.equal(back.plays, 1); assert.deepEqual(back.log, st.log);
  // a new change after restoring gets a new shot id
  const more = fb(watched(back.cut), 'town').cut; assert.equal(new Set(more.shots.map((s) => s.id)).size, more.shots.length);
  // the school was knocked down: its shot is gone, the rest of the film is kept
  const noSchool = town(FULL.filter(([, i]) => i !== 'school')); const set2 = findSet(noSchool.cells, tiles, noSchool.sim);
  const r2 = restore(saved, set2); assert.ok(r2.cut.shots.every((s) => s.sub !== 'place:school')); assert.ok(r2.cut.shots.length >= MIN_SHOTS);
  // the market itself is gone: start again from the first question
  assert.equal(restore(saved, bareSet).cut, null); assert.equal(restore(saved, bareSet).brief.place, null);
  // a finished film, or rubbish, starts a new one; half a brief is kept
  assert.equal(restore({ ...saved, done: true }, fullSet).cut, null); assert.equal(restore('x', fullSet).cut, null); assert.equal(restore({ v: 1, cut: { shots: 'no' } }, fullSet).cut, null);
  const half = restore({ v: 1, brief: { place: 'market' } }, fullSet); assert.equal(half.brief.place, 'market'); assert.equal(half.cut, null);
});

test('the words: every line is built in, short and spoken as written', () => {
  for (const step of ['place', 'who', 'mood']) for (const j of [true, false]) { assert.ok(W.STEPS[step].q.length < 40); assert.ok(W.STEPS[step].ask(j).length < 140); }
  assert.match(W.whoMissing('otters', ['family', 'florence']), /I can film a family or me instead/);
  assert.match(W.whoMissing('family', ['florence']), /I can film me instead/);
  const cut = firstCut(BRIEF, fullSet); assert.match(W.firstCutLine(cut, fullSet, BRIEF), /five shots of the market square, with a family/);
  assert.equal(W.caption(cut.shots[0], fullSet), 'Wide shot · the whole town'); assert.equal(W.cutName(1), 'First cut'); assert.equal(W.cutName(3), 'Cut 3');
  for (const s of cut.shots) assert.match(W.shotSentence(s, fullSet), /camera/);
  assert.equal(subjectLabel('who:otters', fullSet), 'the otters'); assert.equal(subjectLabel('place:gone', fullSet), 'the town');
});

test('titles are chosen from built-in words, never typed', () => {
  const t = W.titleChoices(BRIEF, fullSet); assert.equal(t.length, 6); assert.equal(t[0], 'A day at the market square'); assert.ok(t.every((x) => x.length <= 60 && x.length > 3));
  assert.equal(W.titleChoices({ ...BRIEF, mood: 'calm' }, fullSet)[0], 'An evening at the market square');
  const st = fresh(); Object.assign(st.brief, BRIEF); st.cut = firstCut(BRIEF, fullSet); assert.equal(W.filmTitle(st, fullSet), 'A day at the market square'); st.title = 3; assert.equal(W.filmTitle(st, fullSet), 'The town we built');
  for (const set of [fullSet, bareSet]) for (const p of set.places) for (const who of WHO_IDS) assert.ok(W.titleChoices({ place: p.id, who, mood: 'party' }, set).every((x) => x.length <= 60));
});

test('the camera: every move of every subject gives a steady view above the ground, looking at its subject', () => {
  for (const set of [fullSet, bareSet]) {
    const subs = ['town', ...set.places.map((p) => `place:${p.id}`), ...whoHere(set).map((w) => `who:${w}`)];
    for (const sub of subs) for (const move of MOVE_IDS) for (const aspect of [1.6, 0.75]) {
      let prev = null;
      for (let i = 0; i <= 20; i++) {
        const pose = poseFor({ move, sub }, set, i / 20, { aspect });
        assert.ok(pose.pos.every(Number.isFinite) && pose.look.every(Number.isFinite) && pose.fov >= 20 && pose.fov <= 60, `${move} ${sub}`);
        assert.ok(pose.pos[1] >= 2.5, `${move} ${sub}: the camera is above the ground (${pose.pos[1]})`);
        const d = Math.hypot(...pose.pos.map((v, k) => v - pose.look[k])); assert.ok(d > (/who:(family|otters)/.test(sub) ? 2.5 : 6), `${move} ${sub}: not on top of its subject`);
        if (prev) assert.ok(Math.hypot(...pose.pos.map((v, k) => v - prev.pos[k])) < (move === 'pull' ? wideDist(aspect) / 5 : 12), `${move} ${sub}: no jump between frames`);
        prev = pose;
      }
    }
  }
});

test('the camera: a wide shot sees the island, a push-in ends closer, a pull-back ends on the whole town', () => {
  const wide = poseFor({ move: 'wide', sub: 'town' }, fullSet, 0.5); assert.ok(Math.hypot(wide.pos[0], wide.pos[2]) > 70); assert.ok(wide.fov >= 40, 'Florence\'s far-away pin stays hidden');
  assert.ok(wideDist(0.75) > wideDist(1.6), 'an upright screen stands further back');
  const P = targetOf({ move: 'push', sub: 'place:market' }, fullSet); const dist = (u) => { const p = poseFor({ move: 'push', sub: 'place:market' }, fullSet, u); return Math.hypot(...p.pos.map((v, k) => v - P[k])); };
  assert.ok(dist(1) < dist(0) * 0.6);
  const pull = { move: 'pull', sub: 'place:market' }; assert.deepEqual(poseFor(pull, fullSet, 0).look, P); assert.deepEqual(poseFor(pull, fullSet, 1).look, fullSet.town);
  // a close-up follows who it is of
  const a = poseFor({ move: 'close', sub: 'who:otters' }, fullSet, 0.5, { otters: [-27, 0.5, -10] }), b2 = poseFor({ move: 'close', sub: 'who:otters' }, fullSet, 0.5, { otters: [-27, 0.5, 10] });
  assert.ok(Math.abs((b2.pos[2] - a.pos[2]) - 20) < 0.01);
  const o = otterAt(5, riverX); assert.ok(o[2] >= -20 && o[2] <= 24 && Math.abs(o[0] - riverX(o[2])) < 1);
  // a street pass goes along the open side, at head height when it is clear
  const mk = placeOf(fullSet, 'market'); const s0 = poseFor({ move: 'street', sub: 'place:market' }, fullSet, 0), s1 = poseFor({ move: 'street', sub: 'place:market' }, fullSet, 1);
  assert.ok(Math.hypot(s1.pos[0] - s0.pos[0], s1.pos[2] - s0.pos[2]) > 10); assert.equal(s0.pos[1] < 5, mk.clear);
  for (const m of MOVE_IDS) assert.ok(stillAt(m) >= 0 && stillAt(m) <= 1);
});

test('the storyboard: one drawn frame per shot, from its subject and its camera move, as safe inline SVG', () => {
  const seen = new Set();
  for (const set of [fullSet, bareSet]) for (const sub of ['town', ...set.places.map((p) => `place:${p.id}`), ...WHO_IDS.map((w) => `who:${w}`)]) for (const move of MOVE_IDS) {
    const svg = frameSvg({ move, sub }, set, 'calm'); assert.match(svg, /^<svg[\s>]/); assert.ok(svg.length < 6000 && !/undefined|NaN/.test(svg), `${move} ${sub}`);
    assert.doesNotMatch(svg, /<script|on\w+\s*=|javascript:|href/i); seen.add(frameInner({ move, sub }, set, 'calm'));
  }
  assert.ok(seen.size > 60, 'different subjects and moves give different drawings');
  assert.notEqual(frameInner({ move: 'push', sub: 'place:market' }, fullSet, 'calm'), frameInner({ move: 'push', sub: 'place:market' }, fullSet, 'party'), 'the light follows the mood');
  let cut = firstCut({ ...BRIEF, mood: 'party' }, fullSet); cut = fb(cut, 'school').cut;
  const pic = storyboardSvg({ title: 'A big day at the market square', cut, set: fullSet });
  const made = cleanMade({ title: 'A big day at the market square', lines: ['x'], picture: pic }); assert.equal(made.picture, pic, 'the contract keeps the picture'); assert.ok(pic.length < 200000);
  assert.equal((pic.match(/<circle cx="11" cy="11"/g) || []).length, cut.shots.length, 'a numbered frame for every shot'); assert.match(pic, />New</); assert.match(pic, /Push in/);
});

test('the record: the brief, the feedback between cuts and the film, with practised lines built from what was done', () => {
  const st = fresh(); Object.assign(st.brief, BRIEF); st.cut = firstCut(BRIEF, drySet); st.plays = 1;
  const give = (id) => { const r = applyFeedback(st.cut, id, drySet, st.brief); if (r.ok) { st.cut = r.cut; st.log.push({ n: r.cut.n, id }); } else if (r.code === 'who-missing') st.cant.push(r.who); };
  give('shorter'); give('otters'); give('school'); st.cut = watched(st.cut); st.plays++; give('town'); st.cut = watched(st.cut); st.plays++;
  const lines = W.recordLines(st, drySet); assert.ok(lines.length >= 4 && lines.length <= 6 && lines.every((l) => l.length <= 120));
  assert.equal(lines[0], 'The brief: the market square, with a family. Mood: cheerful.');
  assert.ok(lines.includes('After cut 1, asked for: shorter, start at the school.')); assert.ok(lines.includes('After cut 2, asked for: end on the whole town.'));
  assert.ok(lines.some((l) => /Asked for the otters: not in the town/.test(l))); assert.match(lines[lines.length - 1], /^The film: six shots/);
  const pr = W.practisedLines(st, true); assert.ok(pr.length >= 2 && pr.length <= 4);
  assert.ok(pr.includes('improving a draft with three pieces of feedback, over three cuts')); assert.ok(pr.includes('changing the plan when the town did not have what you asked for'));
  for (const l of pr) assert.doesNotMatch(l, /learn|improved|better at/);
  // with no feedback at all the lines say so
  const st0 = fresh(); Object.assign(st0.brief, BRIEF); st0.cut = firstCut(BRIEF, fullSet); st0.plays = 1;
  assert.deepEqual(W.practisedLines(st0, true), ['briefing a creative partner: a place, who is in it and a mood', 'watching a first cut and deciding what it needed']);
  // many rounds still fit in six lines
  const st9 = fresh(); Object.assign(st9.brief, BRIEF); st9.cut = firstCut(BRIEF, fullSet); for (let n = 2; n < 9; n++) st9.log.push({ n, id: 'shorter' }); st9.cant.push('otters');
  assert.ok(W.recordLines(st9, fullSet).length <= 6);
  // the whole result passes the contract, and what stays in the town is small
  const title = W.filmTitle(st, drySet); const data = townData(st, drySet, title);
  const res = cleanResult({ finished: true, record: { made: { title, lines, picture: storyboardSvg({ title, cut: st.cut, set: drySet }) }, practised: pr }, town: { kind: 'film-screen', data } });
  assert.equal(res.finished, true); assert.ok(res.record.made.picture); assert.deepEqual(res.town, cleanTown({ kind: 'film-screen', data })); assert.equal(data.by, 'hall'); assert.equal(data.shots.length, st.cut.shots.length);
});

test('the screen stands on a free tile beside the square, never on a build, the river or a landmark', () => {
  const k = screenSpot('9,5', full.cells, tiles); assert.ok(k && terrain.tiles.has(k)); assert.ok(!full.cells.find(([c]) => c === k)?.[1].item);
  const t = terrain.tiles.get(k); assert.ok(!t.fixed && t.zone !== 'river');
  const lab = screenSpot(terrain.lab, bare.cells, tiles); assert.ok(lab && lab !== terrain.school && lab !== terrain.dock);
  assert.equal(screenSpot('99,99', full.cells, tiles), null);
});

test('the module object is what the contract asks for, and uses only builds the catalogue has', () => {
  assert.equal(film.id, 'film'); assert.equal(typeof film.run, 'function'); assert.equal(typeof film.show, 'function');
  assert.ok(film.blurb.j.length <= 80 && film.blurb.s.length <= 80);
  for (const rule of film.css.split('}').map((r) => r.trim()).filter((r) => r && !r.startsWith('@'))) assert.ok(/^(@media[^{]*\{\s*)?#module\[data-module="film"\]/.test(rule), rule.slice(0, 60));
  for (const [, item] of FULL) assert.ok(ITEMS[item]);
});
