// Florence's town in a split screen (js/game/split.js, used by js/game/twotowns.js): the panes, the framing, which pane a
// tap lands in, when the split is on, and the player's choice kept for the session.
// node --test tests/split.test.mjs
import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { splitPanes, paneInset, centreOffset, freeShape, paneAt, splitOn, nextSplit, loadPref, savePref, PREF_KEY } from '../js/game/split.js';

const memStore = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m }; };

test('landscape screens split left and right, Florence on the left; upright screens top and bottom, Florence on top', () => {
  const L = splitPanes(1366, 800, { top: 80, bottom: 130 });
  assert.equal(L.stacked, false); assert.equal(L.line, 683);
  assert.deepEqual(L.florence, { x: 0, y: 0, w: 683, h: 800 }); assert.deepEqual(L.mine, { x: 683, y: 0, w: 683, h: 800 });
  const P = splitPanes(390, 844, { top: 84, bottom: 180 });
  assert.equal(P.stacked, true); assert.equal(P.line, Math.round((84 + 844 - 180) / 2));
  assert.equal(P.florence.y, 0); assert.equal(P.mine.y + P.mine.h, 844); assert.equal(P.florence.h + P.mine.h, 844);
  // a panel down one side: the line is in the middle of what is left, so both towns get the same room
  const S = splitPanes(1200, 800, { left: 300 }); assert.equal(S.line, 750);
});

test('each town is framed in its own pane, less the panels over it', () => {
  const base = { left: 0, right: 0, top: 80, bottom: 130 }; const P = splitPanes(1366, 800, base);
  const mine = paneInset(P.mine, 1366, 800, base), hers = paneInset(P.florence, 1366, 800, base);
  assert.deepEqual(mine, { left: 683, top: 80, right: 0, bottom: 130 }); assert.deepEqual(hers, { left: 0, top: 80, right: 683, bottom: 130 });
  // the view offset puts the island's centre in the middle of that part of the screen
  const o = centreOffset(1366, 800, mine); assert.equal(o.x, Math.round(683 - (683 + 1366) / 2)); assert.equal(o.y, Math.round(400 - (80 + 670) / 2));
  assert.deepEqual(centreOffset(1366, 800, {}), { x: 0, y: 0 });
  // the old single-view framing is unchanged: the bottom hotbar centres the island between the top strip and the bar
  assert.equal(centreOffset(1366, 800, { top: 80, bottom: 130 }).y, Math.round((800 - 670 - 80) / 2));
  const f = freeShape(1366, 800, mine); assert.ok(Math.abs(f.aspect - 683 / 590) < 1e-9);
});

test('a tap on Florence’s pane never counts as a tap on the player’s town', () => {
  const L = splitPanes(1366, 800, {});
  assert.equal(paneAt(L, 100, 400), 'florence'); assert.equal(paneAt(L, 682, 10), 'florence');
  assert.equal(paneAt(L, 683, 10), 'mine'); assert.equal(paneAt(L, 1300, 700), 'mine');
  const P = splitPanes(390, 844, { top: 84, bottom: 180 });
  assert.equal(paneAt(P, 200, 100), 'florence'); assert.equal(paneAt(P, 200, 700), 'mine');
  assert.equal(paneAt(null, 100, 100), null, 'not split: every tap is the player’s');
  // and the game routes it: rig.js stops pointers that start over her pane before the build code, game.js only captions
  const rig = readFileSync(new URL('../js/camera/rig.js', import.meta.url), 'utf8');
  assert.match(rig, /if \(rig\.paneBlock\?\.\(e\.clientX, e\.clientY\)\) \{ other\.set\(e\.pointerId/);
  assert.match(rig, /const o = other\.get\(e\.pointerId\); if \(o\) \{[^}]*rig\.onPaneTap\?\.\(\); return; \}/);
  const game = readFileSync(new URL('../js/game/game.js', import.meta.url), 'utf8');
  assert.match(game, /rig\.onPaneTap = \(\) => \{ if \(sb\.running && !G\.busy\) \{ audio\.tap\(\); ui\.caption\(G\.S\.towns\.notHere, 2600\); \} \};/);
});

test('the split is on only while building in the overview camera', () => {
  assert.equal(splitOn({ pref: true, building: true }), true);
  assert.equal(splitOn({ auto: true, building: true }), true);
  assert.equal(splitOn({ building: true }), false, 'hidden by default, as before the two towns');
  assert.equal(splitOn({ pref: true, building: false }), false, 'not in a mission or the AI Lab');
  assert.equal(splitOn({ pref: true, building: true, skyView: false }), false, 'not in street view or inside a house');
});

test('the toggle, the compare moment and building', () => {
  let s = { pref: false, auto: false };
  s = nextSplit(s, 'open'); assert.deepEqual(s, { pref: false, auto: true }, 'after a mission the game opens it');
  assert.deepEqual(nextSplit(s, 'built'), { pref: false, auto: false }, 'building closes what the game opened');
  assert.deepEqual(nextSplit(s, 'toggle', true), { pref: false, auto: false }, 'the player hides it');
  s = nextSplit({ pref: false, auto: false }, 'toggle', false); assert.deepEqual(s, { pref: true, auto: false }, 'the player shows it');
  assert.deepEqual(nextSplit(s, 'built'), s, 'building leaves the player’s own choice alone');
  assert.deepEqual(nextSplit(nextSplit(s, 'open'), 'close'), s, 'the intro closing its moment keeps the choice');
});

test('the player’s choice is saved and restored for the session', () => {
  const st = memStore(); assert.equal(loadPref(st), false, 'nothing saved: hidden');
  savePref(st, true); assert.equal(st.m.get(PREF_KEY), '1'); assert.equal(loadPref(st), true);
  savePref(st, false); assert.equal(loadPref(st), false);
  // storage that throws (private window, blocked site data) never breaks the game
  const bad = { getItem() { throw new Error('no'); }, setItem() { throw new Error('no'); } };
  assert.equal(loadPref(bad), false); assert.doesNotThrow(() => savePref(bad, true)); assert.equal(loadPref(null), false);
  const tt = readFileSync(new URL('../js/game/twotowns.js', import.meta.url), 'utf8');
  assert.match(tt, /sessionStorage/); assert.match(tt, /savePref\(store, tt\.st\.pref\)/); assert.match(tt, /pref: loadPref\(store\)/);
});

test('one WebGL context: the split draws both panes with the one renderer', () => {
  const dirs = ['engine', 'game', 'camera', 'world', 'ui'];
  let n = 0; for (const d of dirs) for (const f of readdirSync(new URL(`../js/${d}/`, import.meta.url))) if (f.endsWith('.js')) n += (readFileSync(new URL(`../js/${d}/${f}`, import.meta.url), 'utf8').match(/new THREE\.WebGLRenderer/g) || []).length;
  const tt = readFileSync(new URL('../js/game/twotowns.js', import.meta.url), 'utf8');
  assert.doesNotMatch(tt, /WebGLRenderer|getContext/); assert.match(tt, /stage\.setSplit\(/);
  const st = readFileSync(new URL('../js/engine/stage.js', import.meta.url), 'utf8'); assert.match(st, /setScissorTest\(true\)/);
  assert.ok(n >= 1);
});
