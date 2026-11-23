// The order of the steps, which is the same in every level (owner, 21 and 23 Nov 2026):
//   1. the job             Florence says what the family needs. One button starts.
//   2. ask, once           the child fills the gaps of one sentence with word buttons and asks Florence to suggest plans.
//   3. Florence's plans    the plans appear in the place itself. One big button starts the test.
//   4. the test            the child causes something to happen, and the answer shows at a glance. The level plays it.
//   5. look, then choose   one result card for each plan: a sentence about what happened, and only then a tick, a dash or a cross. "Ask again" goes back to step 2.
//   6. the play break      the child builds or does something with the chosen plan. The level owns all of it.
//   7. the town            the plan is carried out in the town. "Try another plan" shows the cards again; the child picks a second plan, sees it in the
//                          town at once with no second play break, a small sign keeps the first result in view, Florence asks what changed, and the child keeps either.
//   8. the recap           one question that is answered by a tap on the town. Any answer goes on: it never blocks.
//   9. the end             one or more closing pictures, and "Play again".
// There is no score, no timer and no way to fail, and Florence is never wrong. The level gives the words, the plans, the results and a scene with the hooks named
// in README.md. This file gives the order, the buttons and the cards, and decides nothing about what the place looks like or what the child does in it.
import { $, btn, ui, says, setStep, setTray, setPlace, sentenceRow, planTag, stepPlanHtml, resultCards, firstSign } from './shell.js';
import { cur, setScene, start, project } from './stage.js';
// what the child has done so far: the word chosen for each gap, the plan in use, and the first plan while a second one is being tried
export const S = { words: [], pick: null, first: null };

export function runLevel(L) { const W = L.words, gaps = W.sentence.filter((p) => Array.isArray(p)), rowsOf = (i) => L.results(i, cur), cards = (o = {}) => resultCards(L.plans, rowsOf, { use: W.use, firstWords: W.first, ...o }), after = (i) => L.after(i, cur);
  // the tray keeps the level's evidence (a box of meters, for example) from the test until a plan is chosen
  const ev = () => (L.evidence ? [L.evidence] : []);
  setPlace(L.place);
  function job() { Object.assign(S, { words: [], pick: null, first: null }); firstSign(null); setScene(L.scene()); ui({ step: W.level, say: W.job, tray: [btn(W.start, 'sun', ask)] }); }
  function ask() { if (S.pick !== null) return job(); const s = cur; if (s.asking) s.asking(); let now = Math.max(0, gaps.findIndex((_, i) => S.words[i] === undefined));
    const draw = () => { s.words(S.words); const go = btn(W.ask, 'sun', plans); go.disabled = gaps.some((_, i) => S.words[i] === undefined); go.style.marginLeft = 'auto';
      ui({ step: W.askT, say: W.askHow, wide: true, tray: [...sentenceRow(W.sentence, S.words, now, (i) => { now = i; draw(); }, (g, k) => { if (s.wordTapped) s.wordTapped(g, k); S.words[g] = k; const n = gaps.findIndex((_, i) => S.words[i] === undefined); if (n >= 0) now = n; draw(); }), go] }); };
    draw(); }
  async function plans() { const s = cur, b = btn(W.test, 'sun big', async () => { b.disabled = true; ui({ step: W.testT, say: W.watch, tray: ev(), over: '' }); if (!await s.test({ step: setStep, say: says })) return;
      const all = () => { if (s.showResults) s.showResults(); ui({ step: W.level, say: W.choose, tray: [...ev(), btn(W.again, '', () => { S.words = []; ask(); })], over: cards() }); };
      // a level may let the child look at each plan in turn before all the cards are shown: its look() is given a function to call with the number of the plan the child is looking at
      if (!s.look) return all(); const seen = new Set(); ui({ step: W.lookT, say: W.look, tray: [...ev(), btn(W.showAll, '', all)], over: '' });
      s.look((i) => { seen.add(i); $('step').innerHTML = stepPlanHtml(L.plans[i]); $('over').innerHTML = cards({ only: new Set([i]) }); if (seen.size === L.plans.length) setTray([...ev(), btn(W.showAll, 'sun', all)]); }); });
    ui({ step: W.level, say: W.plansSay(gaps.map((g, i) => g[S.words[i]])), tray: [b] }); b.disabled = true; await s.showPlans(S.words); b.disabled = false; }
  // the play break belongs to the level. It is given say(paragraphs), tray(things, wide) and done(paragraphs), which it calls when the child has finished
  async function choose(i) { if (S.first !== null) return second(i); S.pick = i; const s = cur; ui({ step: W.playT, say: '', tray: [], over: '', wide: true });
    await s.playBreak(i, { say: says, tray: (els, wide = true) => { if (cur === s) setTray(els, wide); }, done: (ps) => { if (cur !== s) return; says(ps); setTray([btn(W.next, 'sun', townStep)]); } }); }
  async function townStep() { const s = cur; ui({ step: W.townT, say: W.townHow, tray: [], over: '' }); await s.town(S.pick, { tray: setTray, btn }); if (cur === s) settled(true); }
  function settled(canTry) { firstSign(null); ui({ stepHtml: stepPlanHtml(L.plans[S.pick]), say: [W.built, after(S.pick)], tray: [...(canTry ? [btn(W.tryOther, '', () => { S.first = S.pick; ui({ step: W.townT, say: W.chooseOther, tray: [], over: cards({ mine: S.first }) }); })] : []), btn(W.next, 'sun', recap)], over: '' }); }
  // the second plan is shown in the town at once, with no second play break; a small sign keeps the first result in view
  function second(i) { const s = cur, first = S.first, rows = rowsOf(first); S.first = null; S.pick = i; s.swap(i); firstSign(W.first, L.plans[first], rows);
    ui({ stepHtml: stepPlanHtml(L.plans[i]), say: [W.what, after(i)], tray: [btn(W.keepFirst, '', () => { S.pick = first; s.swap(first); settled(false); }), btn(W.keepThis, 'sun', () => settled(false))], over: '' }); }
  function recap() { const s = cur; firstSign(null); if (!s.recap) return end(0); ui({ step: W.recapT, say: W.recapQ, tray: [], over: '' }); s.recap((ok) => ui({ step: W.recapT, say: ok ? W.recapYes : W.recapNo, tray: [btn(W.next, 'sun', () => end(0))], over: null })); }
  // the closing pictures: L.ends(pick, scene) gives a list of { step, say, go, next }. go() shows the picture, and next is the words on the button that leads to the picture after it
  function end(k) { const s = cur, beats = L.ends ? L.ends(S.pick, s) : [], b = beats[k] || { step: W.level, say: W.end }, last = k >= beats.length - 1; if (b.go) b.go();
    ui({ step: b.step, say: b.say, tray: [btn(last ? W.replay : b.next, 'sun', last ? job : () => end(k + 1))], over: '' }); }
  $('over').addEventListener('click', (e) => { const b = e.target.closest('[data-plan]'); if (b) choose(+b.dataset.plan); });
  job(); start();
  // for the script that plays the level through and takes the pictures (record.mjs)
  window.trial = { S, job, ask, plans, choose, get cur() { return cur; } }; window.trialProject = project; return window.trial; }
