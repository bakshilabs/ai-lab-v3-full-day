// Mission 3, directing an AI helper (the first version of this module, unchanged in how it plays). The child briefs
// Florence from tiles (a place, who is in it, a mood), she puts together a first cut from a kit of camera moves, they
// watch it, give feedback from tiles, and watch the new cut. The storyboard shows what changed.
// Browser only: it drives ui.js and player.js. The rules are in cut.js and kit.js, the words in words.js.
import { placeOf, whoHere, MOODS, WHO, WHO_IDS, moodOf } from './kit.js';
import { firstCut, applyFeedback, moveShot, watched, restore, townData, briefOk } from './cut.js';
import { STEPS, placePicked, whoPicked, whoMissing, moodPicked, emptyTown, firstCutLine, welcomeBack, afterFirst, afterLater, watchNew, feedbackReply, movedReply, filmTitle, titleChoices, recordLines, practisedLines, cutName } from './words.js';
import { storyboardSvg } from './picture.js';

// env: { ctx, ui, player, set, junior }. saved: mission 3's own progress (or null). keep(st): saves it.
// Resolves { st, title, picture, town, lines, practised } when the child finishes with a film.
export async function playDirect(env, saved, keepOut) {
  const { ctx, ui, player, set, junior } = env;
  const st = restore(saved, set); const keep = () => keepOut(st);
  const resumed = !!st.cut;
  player.setMood(st.cut?.mood || st.brief.mood || 'cheerful'); player.look({ move: 'wide', sub: 'town' });

  // ---- 1. the brief: a place, who is in it, a mood. One question a screen; each answer is saved.
  if (!st.cut) {
    const ASK = ['place', 'who', 'mood']; let i = !st.brief.place ? 0 : !st.brief.who ? 1 : 2;
    while (!st.cut) {
      const step = ASK[i]; ctx.report({ stage: `Briefing Florence: ${step === 'place' ? 'choosing the place' : step === 'who' ? 'choosing who is in it' : 'choosing the mood'}` });
      let r;
      if (step === 'place') {
        if (st.brief.place) player.look({ move: 'push', sub: `place:${st.brief.place}` }, 0.4);
        r = await ui.choose({ step, of: [1, 3], q: STEPS.place.q, say: STEPS.place.ask(junior) + (set.empty ? ' ' + emptyTown : ''), picked: st.brief.place,
          tiles: set.offer.map((id) => placeOf(set, id)).map((p) => ({ id: p.id, icon: p.icon, label: p.label.replace(/^the (.)/, (_, c) => c.toUpperCase()) })),
          pick: (id) => { st.brief.place = id; keep(); player.look({ move: 'push', sub: `place:${id}` }, 0.4); return { ok: true, say: placePicked(placeOf(set, id)) }; } });
      } else if (step === 'who') {
        if (st.brief.who) player.look({ move: 'close', sub: `who:${st.brief.who}` });
        r = await ui.choose({ step, of: [2, 3], q: STEPS.who.q, say: STEPS.who.ask(junior), picked: st.brief.who, back: true,
          tiles: WHO_IDS.map((id) => ({ id, icon: WHO[id].icon, label: id === 'family' ? 'A family' : id === 'otters' ? 'The otters' : 'Florence' })),
          pick: (id) => {
            // the honest limit: she can only film who is really there, says so, and offers who is
            if (!set.who[id].here) { if (!st.cant.includes(id)) st.cant.push(id); keep(); return { ok: false, say: whoMissing(id, whoHere(set)) }; }
            st.brief.who = id; keep(); player.look({ move: 'close', sub: `who:${id}` }); return { ok: true, say: whoPicked(id) };
          } });
      } else {
        r = await ui.choose({ step, of: [3, 3], q: STEPS.mood.q, say: STEPS.mood.ask(junior), picked: st.brief.mood, back: true,
          tiles: MOODS.map((m) => ({ id: m.id, icon: m.icon, label: m.label })),
          pick: (id) => { st.brief.mood = id; keep(); player.setMood(id); player.look({ move: 'push', sub: `place:${st.brief.place}` }, 0.4); return { ok: true, say: moodPicked(moodOf(id)) }; } });
      }
      if (r.act === 'back') { i = Math.max(0, i - 1); continue; }
      if (i < 2) { i++; continue; }
      if (briefOk(st.brief, set)) { st.cut = firstCut(st.brief, set); keep(); } else i = 0;
    }
  }

  // ---- 2 to 5. the storyboard, the film, feedback, the new cut: as often as wanted
  let said = resumed ? welcomeBack(st.cut) : firstCutLine(st.cut, set, st.brief); let nudged = false;
  for (;;) {
    ctx.report({ stage: st.plays === 0 ? 'Directing: reading the first storyboard' : `Directing: feedback on ${cutName(st.cut.n).toLowerCase()}` });
    player.setMood(st.cut.mood); player.look(st.cut.shots[0]);
    const act = await ui.board({ set,
      get: () => ({ cut: st.cut, title: filmTitle(st, set), plays: st.plays, said }),
      feedback: (id) => {
        const r = applyFeedback(st.cut, id, set, st.brief);
        if (r.ok) { st.cut = r.cut; st.log.push({ n: r.cut.n, id }); player.setMood(st.cut.mood); player.look(r.shot && st.cut.shots.includes(r.shot) ? r.shot : st.cut.shots[0]); ctx.report({ stage: `Directing: changing the film, ${cutName(st.cut.n).toLowerCase()}` }); }
        else if (r.code === 'who-missing' && !st.cant.includes(r.who)) st.cant.push(r.who);
        keep(); said = feedbackReply(r, set) + (r.ok && !nudged ? ' ' + watchNew : ''); if (r.ok) nudged = true; return said;
      },
      // ages 13–17: one more control (the order of the shots) and a title chosen from built-in words
      move: junior ? null : (id, dir) => { const r = moveShot(st.cut, id, dir); if (!r.ok) return said; st.cut = r.cut; st.moved++; st.log.push({ n: r.cut.n, id: 'moved' }); keep(); player.look(r.shot); said = movedReply(r, set); return said; },
      retitle: junior ? null : () => { st.title = (st.title + 1) % titleChoices(st.brief, set).length; st.titled = true; keep(); said = `The title is now “${filmTitle(st, set)}”. Press again for another one.`; return said; },
    });
    if (act === 'finish') break;
    ctx.report({ stage: `Directing: watching ${cutName(st.cut.n).toLowerCase()}` });
    const f = ui.film({ title: filmTitle(st, set), total: st.cut.shots.length });
    await player.play(st.cut, { title: () => f.title(), shot: (n, s) => f.shot(n, s, set), end: () => f.end(), dark: (on) => f.dark(on), set onNext(fn) { f.onNext = fn; }, set onSkip(fn) { f.onSkip = fn; } });
    f.close(); st.plays++; st.cut = watched(st.cut); keep(); nudged = false;
    said = st.plays === 1 ? afterFirst(junior) : afterLater(st.cut.n);
  }

  const title = filmTitle(st, set);
  const done = { ...st, done: true }; keepOut(done); // done: playing mission 3 again starts a new film
  return { st: done, title, ...summary(st, set, junior) };
}

// What mission 3 adds to the hour's record, from its saved progress (also used when the hour ends on a later visit).
export function summary(st, set, junior) {
  const title = filmTitle(st, set); const fb = st.log.filter((l) => l.id !== 'moved').length;
  return {
    title, picture: storyboardSvg({ title, cut: st.cut, set }), town: townData(st, set, title),
    line: `Directed “${title}”: ${st.cut.n} cut${st.cut.n === 1 ? '' : 's'}, ${fb} piece${fb === 1 ? '' : 's'} of feedback for Florence.`.slice(0, 120),
    lines: recordLines(st, set), practised: practisedLines(st, junior),
  };
}
