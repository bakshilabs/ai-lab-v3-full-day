// The times of everything in the film. Nothing is drawn here: this file only works out when each thing happens, from the
// length of the words that must be read (docs/redesign/design/accessibility.md: half a second for each word, never
// less), the lengths in docs/redesign/ui/DESIGN.md and docs/redesign/design/motion.md, and the length of each test.
// Every part of the film (the opening, the six levels and the end) is an object of named times in seconds, counted
// from the start of that part.
import { ORDER, TEST, testLength } from './tests.js';

export const ABC = 'ABC';
export const words = (s) => String(s).split(/\s+/).filter(Boolean).length;
// Florence's words are typed at 32 letters a second, with a rest after each sentence and a shorter one after a comma
export function typer(text) {
  const at = []; let t = 0; for (let i = 0; i < text.length; i++) { t += 1 / 32; at.push(t); const c = text[i]; if ('.?!'.includes(c) && i < text.length - 1) t += 0.35; else if (c === ',') t += 0.15; }
  return { dur: t, n: (s) => { let lo = 0, hi = at.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (at[mid] <= s) lo = mid + 1; else hi = mid; } return lo; } };
}
// how long words stay after they have appeared: half a second for each word, and never less than three seconds for Florence
export const readTime = (n) => 0.5 * n;
// a long line is shown in parts of at most two sentences (docs/redesign/design/florence.md, section 6)
export const parts = (text) => { const s = text.match(/[^.?!]+[.?!]+\s*/g) || [text], out = []; for (let i = 0; i < s.length; i += 2) out.push(s.slice(i, i + 2).join('').trim()); return out; };
const worst = (list) => (list.includes('p') ? 'p' : list.includes('f') ? 'f' : 'g');

// the tools that every part uses to write down what happens
function sheet(m) {
  Object.assign(m, { says: [], btn: {}, taps: [], cues: [], acts: [], hops: [], tilts: [], cams: [], probes: {} });
  return {
    // Florence says a line at time t. It is typed, and then it stays for the reading time (o.hold changes that).
    say(text, t, o = {}) { const ty = typer(text), hold = o.hold ?? Math.max(3, readTime(words(text) + words(o.small || ''))), e = { a: t, typed: t + 0.3 + ty.dur, b: t + 0.3 + ty.dur + hold, text, ty, small: o.small || '', fresh: o.fresh !== false }; m.says.push(e); m.cues.push([t + 0.3, 'speak', text, ty.dur]); if (o.fresh !== false) m.tilts.push([t, 3, 0.4]); return e; },
    // the sample child taps something: what is a name that the interface knows how to find on the screen
    tap(what, t, o = {}) { m.taps.push({ t, what, ...o }); return t; },
    cue(t, name, ...a) { m.cues.push([t, name, ...a]); },
    // the camera moves to a framing: view is [x, y, z, distance], and probe names the moment whose dock it must clear
    cam(t, dur, view, probe) { m.cams.push({ t, dur, view, probe }); },
  };
}

export function planFilm(D, town, buildEnd) {
  const U = D.ui, T = D.towns[0], { VIEWS, TEST_VIEW } = town, segs = [];
  // ---- the town opens ---------------------------------------------------------------------------------------------
  { const m = { kind: 'open' }, S = sheet(m); let t = 0.6;
    m.pin = t; S.cue(t + 0.2, 'planArrive', 0); t += 0.9; m.acts.push(['hello', t]); m.hops.push([t + 0.25, 10]); S.cue(t, 'hello');
    const ip = parts(T.intro); let last; ip.forEach((p, i) => { last = S.say(p, t + (i ? 0 : 0.3), { fresh: !i }); t = last.b; });
    m.btn.onward = { a: last.typed, tap: t + 0.9, b: t + 1.25 }; S.tap('onward', t + 0.9); last.b = t + 1.1; t += 1.5;
    // the second beat: the five checks, and the camera begins a slow move towards Eco Town
    m.checks = t; T.lenses.forEach((_, i) => S.cue(t + 0.4 + i * 0.08, 'press')); t += 0.9; m.probes.checks = t + 1;
    t += readTime(words(U.lensesTitle) + T.lenses.reduce((n, l) => n + words(l[1]) + words(l[2]), 0));
    m.btn.enter = { a: m.checks + 0.9, tap: t + 0.9, b: t + 1.25 }; S.tap('enter', t + 0.9); t += 1.3; m.checksOut = t;
    // the flight down to the empty land, which is alive before anyone builds on it; the first family arrives
    m.fly = t; S.cue(t, 'wipe'); t += 2.6; m.family = t; t += 4.2; m.dur = t;
    S.cam(m.checks, m.fly - m.checks, 'world2', 'checks'); S.cam(m.fly, 2.4, VIEWS[0], 'low'); segs.push(m); }

  // ---- the six levels ----------------------------------------------------------------------------------------------
  T.levels.forEach((v, li) => {
    const m = { kind: 'level', li, v, ord: ORDER[li] }, S = sheet(m), TS = TEST[li], seq = !TS.together, gaps = v.s.filter(Array.isArray), nrow = v.res.length;
    const slotOf = [0, 1, 2].map((d) => m.ord.indexOf(d)), rate = (d) => v.res.map((r) => r[d + 1][0]), V = VIEWS[li + 1], pick = v.pick, pickSlot = slotOf[pick];
    Object.assign(m, { slotOf, seq, mark: [0, 1, 2].map((d) => worst(rate(d))), rows: v.res.map((r) => r.slice(1).map((x) => x[0])) });
    let t = 0;
    // 1. arriving: the camera glides from the last site, and the level sign arrives large and then settles under the top bar
    S.cam(0.2, 1.8, V, 'sentence'); m.sign = { a: 0.4, settle: 1.9, land: 2.3 }; S.cue(0.4, 'title'); t = 2.8;
    // 2. the job
    const jp = parts(v.job); let last; jp.forEach((p, i) => { last = S.say(p, t, { fresh: !i }); t = last.b; });
    m.btn.start = { a: last.typed, tap: t + 0.9, b: t + 1.25 }; S.tap('start', t + 0.9); last.b = t + 1.1; t += 1.5; m.signOut = t - 0.4;
    // 3. the situation, and the sentence with its word buttons
    const sc = S.say(v.scene, t); m.tray = sc.b; t = m.tray + 0.4; m.probes.sentence = t + 0.2;
    const how = gaps.length === 1 ? U.askHowOne : U.askHow; m.how = how;
    t += readTime(words(how) + words(v.s.filter((x) => typeof x === 'string').join(' ')) + words(gaps[0].slice(1).join(' ')));
    m.gapTap = []; gaps.forEach((g, k) => { if (k) t += 0.3 + readTime(words(g.slice(1).join(' '))); t += 1.3; m.gapTap.push(t); S.tap(['chip', k, g[0]], t); S.cue(t, 'wordPick'); S.cue(t + 0.42, 'wordLand', k); m.tilts.push([t + 0.42, 3, 0.3]); t += 0.6; });
    m.sweep = t + 0.2; m.ready = t + 0.75; S.cue(m.ready, 'sentenceReady', gaps.length); m.askTap = m.ready + 1.2; S.tap('ask', m.askTap); S.cue(m.askTap, 'ask'); sc.b = m.askTap + 0.25;
    m.btn.ask = { a: m.tray, ready: m.ready, tap: m.askTap, b: m.askTap + 0.35 };
    // 4. Florence works: she lifts her card and its three dots light one after another
    m.think = [m.askTap + 0.45, m.askTap + 1.85]; m.acts.push(['card', m.think[0] - 0.35, m.think[1]]); m.hops.push([m.think[1] - 0.1, 14]); S.cue(m.think[0], 'think', 1.4); t = m.think[1];
    // 5. three plans are offered: the camera moves closer, and each flag drops with its card, 250 milliseconds apart
    S.cam(t - 0.2, 1.2, TEST_VIEW[li], 'offers'); m.offer = t + 1.0; m.land = [0, 1, 2].map((s) => m.offer + s * 0.25);
    m.land.forEach((x, s) => { S.cue(x + 0.2, 'planArrive', s); m.hops.push([x + 0.2, 8]); });
    const of = S.say(U.offers, m.offer + 0.9); m.acts.push(['point', m.offer - 0.3, of.b]); t = of.b;
    // the three cards are read in turn; in a level that plays its plans one after another, each plan is shown while its card is read
    m.read = []; for (let s = 0; s < 3; s++) { const d = m.ord[s], len = Math.max(2.4, readTime(words(v.sol[d][0]) + words(v.sol[d][1]))); m.read.push([t, t + len]); t += len; }
    // 6. the test button, and a still moment before it is pressed
    const th = S.say(U.testHow, t + 0.3); m.btn.test = { a: th.typed }; S.cue(th.typed, 'sentenceReady', 1); t = th.b; m.probes.offers = t - 0.2; m.pause1 = [t, t + 3]; t += 3;
    m.testTap = t + 1.3; S.tap('test', m.testTap); th.b = m.testTap + 0.15; S.cue(m.testTap, 'testPress'); m.hops.push([m.testTap, 10]);
    // 7. the test in the town. A mark is stamped on a flag when the picture of its plan has settled.
    m.test0 = m.testTap + 0.4; m.test1 = m.test0 + testLength(li); m.acts.push(['watch', m.testTap, m.test1 + 0.3]);
    m.turn = [0, 1, 2].map((d) => (seq ? m.test0 + TS.lead + slotOf[d] * TS.each : m.test0));
    m.stamp = [0, 1, 2].map((d) => (seq ? m.turn[d] + TS.stamp : m.test0 + TS.stamp[d]));
    if (seq) [0, 1, 2].forEach((d) => S.cue(m.turn[d] + 0.1, 'test', TS.each - 1.3, rate(d))); else S.cue(m.test0, 'test', TS.dur - 1.6);
    [0, 1, 2].forEach((d) => S.cue(m.stamp[d], { g: 'tick', f: 'dash', p: 'cross' }[m.mark[d]], 0));
    m.btn.test.tap = m.testTap; m.btn.test.b = m.test1 + 0.35; t = m.test1 + 0.6;
    // 8. the results: the cards open, and the sentences arrive one card at a time
    m.res0 = t; S.cam(t - 0.2, 1.0, TEST_VIEW[li], 'results'); const gapR = nrow > 1 ? 1.2 : 0.4; m.resAt = (slot, k) => m.res0 + 0.5 + slot * gapR + k * 0.25;
    for (let s = 0; s < 3; s++) { const r = rate(m.ord[s]); r.forEach((x, k) => S.cue(m.resAt(s, k) + 0.12, { g: 'tick', f: 'dash', p: 'cross' }[x], k)); if (r.every((x) => x === 'g')) S.cue(m.resAt(s, nrow - 1) + 0.4, 'allGood'); }
    t = m.resAt(2, nrow - 1) + 0.5; t += readTime(v.res.reduce((n, r) => n + words(r[1][1]) + words(r[2][1]) + words(r[3][1]), 0));
    // 9. the choice: a still moment, then a tap on a card and a press of the main button
    const ch = S.say(U.chooseHow, t); m.choose = ch.typed; t = ch.b; m.probes.results = t; m.pause2 = [t, t + 3]; t += 3;
    m.pickTap = t + 1.3; S.tap(['card', pickSlot], m.pickTap); S.cue(m.pickTap, 'press'); m.useTap = m.pickTap + 1.4; S.tap('use', m.useTap); S.cue(m.useTap, 'choose', pickSlot); ch.b = m.useTap + 0.2; m.acts.push(['happy', m.useTap + 0.2]); m.tilts.push([m.useTap + 0.2, 3, 0.5]);
    m.btn.again = { a: m.choose, b: m.useTap + 0.3, quiet: true }; m.btn.use = { a: m.choose, ready: m.pickTap + 0.1, tap: m.useTap, b: m.useTap + 0.3 }; t = m.useTap + 0.5;
    // the reason, in level 6 only
    if (v.reasons) { m.reason = t; const rs = S.say(U.reasonHow, t + 0.4); m.probes.reason = rs.typed; t = rs.typed + readTime(words(U.reasonHow) + v.reasons.reduce((n, r) => n + words(r), 0)) + 1.3; m.reasonTap = t; S.tap(['reason', v.reason], t); S.cue(t, 'press'); rs.b = t + 0.4; t += 0.9; m.reasonOut = t; }
    // 10. the plan is built: the other plans fold away, there is a quiet half second, and the camera moves in on the place
    m.fold = t; S.cam(t + 0.4, 1.3, [V[0], V[1], V[2], V[3] * 0.88], 'build'); m.build0 = t + 1.7; m.buildEnd = m.build0 + buildEnd[li + 1]; m.wave = m.buildEnd + 0.5; m.probes.build = m.build0 + 0.5;
    m.acts.push(['watch', m.fold + 0.3, m.wave + 0.9]); m.hops.push([m.buildEnd, 8]); S.cue(m.build0 + 0.15, 'build', m.buildEnd - m.build0 + 0.4, li); t = m.wave + 1.4;
    // 11. the result: Florence says what the choice did, and the way back is offered
    m.after0 = t; S.cam(t - 0.3, 1.2, V, 'low'); const ap = parts(v.after); let first; ap.forEach((p, i) => { last = S.say(p, t + (i ? 0 : 0.3), { fresh: !i }); if (!i) first = last; t = last.b; });
    const rt = S.say(U.retry, t, { fresh: false }); t = rt.b; m.btn.tryOther = { a: first.typed, quiet: true }; m.btn.onward = { a: first.typed };
    if (li === 0 && v.retry) {
      // trying another plan (shown in the Land level only): the same test runs again in the town for one other plan
      const R = v.retry.pick, rs = slotOf[R]; m.retry = R;
      m.tryTap = t + 1.0; S.tap('tryOther', m.tryTap); S.cue(m.tryTap, 'goBack'); rt.b = m.tryTap + 0.2; m.btn.tryOther.tap = m.tryTap; m.btn.tryOther.b = m.btn.onward.b = m.tryTap + 0.3; t = m.tryTap + 0.5;
      m.try0 = t; S.cam(t, 1.2, TEST_VIEW[li], 'try'); const td = S.say(`${U.tried} ${ABC[pickSlot]}.`, t + 1.0, { small: U.chooseAgain }); t = td.b; m.probes.try = t;
      m.pick2Tap = t + 1.2; S.tap(['card', rs], m.pick2Tap); S.cue(m.pick2Tap, 'press'); m.use2Tap = m.pick2Tap + 1.4; S.tap('use2', m.use2Tap); S.cue(m.use2Tap, 'choose', rs); td.b = m.use2Tap + 0.2;
      m.btn.use2 = { a: td.typed, ready: m.pick2Tap + 0.1, tap: m.use2Tap, b: m.use2Tap + 0.3 }; t = m.use2Tap + 0.5;
      m.two = t; m.land2 = t + 0.9; S.cue(m.land2 + 0.2, 'planArrive', rs); m.test2 = m.land2 + 1.4; m.test2end = m.test2 + testLength(li); m.stamp2 = m.test2 + TS.stamp[R]; m.probes.two = m.test2;
      m.acts.push(['watch', m.land2, m.test2end + 0.2]); S.cue(m.test2, 'test', TS.dur - 1.6, rate(R)); S.cue(m.stamp2, { g: 'tick', f: 'dash', p: 'cross' }[m.mark[R]], 0); t = m.test2end + 0.5;
      // Florence asks what changed and waits; only then do the two buttons arrive, one inside each card
      const wc = S.say(U.whatChanged, t, { hold: 3.2 }); m.acts.push(['point', t, t + 1.6]); t = wc.b; const wk = S.say(U.whichKeep, t, { fresh: false }); m.keepBtns = wk.typed; t = wk.b + readTime(words(U.keepFirst) + words(U.keepThis));
      m.keepTap = t + 1.2; S.tap('keepFirst', m.keepTap); S.cue(m.keepTap, 'choose', pickSlot); wk.b = m.keepTap + 0.25; t = m.keepTap + 0.7; m.try1 = t; S.cam(t, 1.2, V, 'low'); t += 1.8;
    } else { m.nextTap = t + 1.0; S.tap('onward', m.nextTap); S.cue(m.nextTap, 'press'); rt.b = m.nextTap + 0.2; m.btn.onward.tap = m.nextTap; m.btn.tryOther.b = m.btn.onward.b = m.nextTap + 0.3; t = m.nextTap + 0.6; }
    // 12. the recap: the camera stands still, every place that can be tapped has a ring, and there is a still moment
    m.recap0 = t; S.cam(t, 0.9, town.RECAP_VIEW[li], 'recap'); t += 1.1;
    if (v.point) { const q = S.say(v.point[0], t, { small: U.pointHow }); m.acts.push(['point', t, t + 1.5 + 0.5]); m.rings = q.typed; t = q.b; m.probes.recap = t; m.pause3 = [t, t + 3]; t += 3;
      m.pointTap = t + 1.3; S.tap(['town', 0], m.pointTap); S.cue(m.pointTap, 'recapRight'); q.b = m.pointTap + 0.4; const y = S.say(U.recapYes, m.pointTap + 0.4, { fresh: false }); m.acts.push(['happy', m.pointTap + 0.4]); m.hops.push([m.pointTap + 0.5, 14]); t = y.b; m.ringsOut = t; if (v.askF) y.b = t; else m.lastSay = y; }
    if (v.askF) { const q = S.say(v.askF[0], t, { fresh: !v.point }); m.yn = { a: q.typed }; t = q.b; if (!v.point) { m.probes.recap = t; m.pause3 = [t, t + 3]; t += 3; }
      m.ynTap = t + 1.3; S.tap(['yn', v.askF[1]], m.ynTap); S.cue(m.ynTap, 'recapRight'); m.acts.push(['happy', m.ynTap + 0.3]); t = m.ynTap + 1.2; m.yn.b = t; m.lastSay = q; }
    m.btn.next = { a: t, tap: t + 1.1, b: t + 1.45, label: li === 5 ? U.finish : U.next }; S.tap('next', t + 1.1); S.cue(t + 1.1, 'press'); m.lastSay.b = t + 1.3; t += 1.6;
    // 13. the level is finished: the camera pulls back, the square for this level receives its tick and the next one turns yellow
    m.done = t; S.cam(t, 1.2, VIEWS[7], 'low'); S.cue(t + 0.5, 'levelComplete', li); m.acts.push(['happy', t + 0.5]); t += 2.6;
    // a few seconds in the town, without words, which show the last choice in use
    m.inter = [t, t + 5.2]; t += 5.2; m.dur = t; segs.push(m);
  });

  // ---- the end of the hour -----------------------------------------------------------------------------------------
  { const m = { kind: 'end' }, S = sheet(m); let t = 0;
    // the look back: the finished town at dusk with every window lit, and then the jobs
    S.cam(0.2, 2.2, VIEWS[7], 'low'); m.dusk = [0.8, 3.6]; t = 6.4; S.cue(1, 'hourComplete');
    m.panel = t; S.cam(t - 0.4, 1.4, 'jobs', 'low'); m.jobAt = T.jobs.map((_, i) => t + 1.2 + i * 0.5); m.jobAt.forEach((x) => S.cue(x, 'press')); m.talk = t + 3; m.acts.push(['hello', t + 3.4]); m.hops.push([t + 3.65, 10]);
    t += 3.6 + readTime(words(U.jobsTitle) + words(T.jobsLine) + T.jobs.reduce((n, j) => n + words(j), 0) + words(U.talkTitle) + words(T.talk) + words(U.breakLine)); m.panelOut = t;
    // the last shot pulls back to the whole world, with a drone on its way from Drone City
    m.back = t + 0.6; S.cam(m.back, 3.2, 'world', 'none'); S.cue(m.back, 'wipe'); m.day = [m.back, m.back + 1.6]; t = m.back + 8.5; m.dur = t; segs.push(m); }

  let at = 0; for (const m of segs) { m.start = at; at += m.dur; }
  return { segs, duration: at };
}
