// Collects every sentence the game can speak, for recording. Runs the game modules in a browser (they use
// the three.js import map), harvests the fixed text, Florence's planner readings and the diary lines, and
// merges the lines logged during play-throughs (said.json files). Writes voice/lines-<band>.json.
// Usage: node voice/collect.mjs <baseUrl> <said.json ...> [--fresh]
// The lines files keep their old order and new sentences are added at the end, so render.py rewrites only the last
// chunk or two of each pack (a new order renames every chunk: megabytes of churn in git). --fresh starts the lists anew.
// The afternoon modules: every js/modules/<id>/words.js (and drone/route.js) is read for built-in sentences, spoken in
// Florence's voice; put a new module's spoken lines in its words.js, or add its file to WORD_FILES.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const argv = process.argv.slice(2); const fresh = argv.includes('--fresh');
const [base = 'http://localhost:8765/', ...saidFiles] = argv.filter((a) => a !== '--fresh');
const modDir = path.join(here, '..', 'game', 'js', 'modules');
const WORD_FILES = [...fs.readdirSync(modDir).filter((d) => fs.existsSync(path.join(modDir, d, 'words.js'))).map((d) => `./js/modules/${d}/words.js`), './js/modules/drone/route.js'];

const b = await chromium.launch(); const p = await b.newPage(); p.setDefaultTimeout(600000); // a busy machine is slow
await p.goto(base + 'index.html?film=none', { waitUntil: 'domcontentloaded' });
const out = await p.evaluate(async (WORD_FILES) => {
  const { CONTENT, LEVEL_TEXT, diaryLines, HELPER, SANDBOX } = await import('./js/game/content.js');
  const { RULES } = await import('./js/game/advisor.js');
  const { FILMS } = await import('./js/game/film.js');
  const { plan } = await import('./js/sim/planner.js');
  const { makeTerrain } = await import('./js/world/terrain.js');
  const { applyPlacements } = await import('./js/sim/planner.js');
  const V = await import('./js/ui/voice.js');
  const { WONT_LINES } = await import('./js/ai/plotter.js');
  const res = { junior: [], senior: [] };
  const add = (band, text, voice) => { if (typeof text !== 'string') return; /* a function's source is not a line */ for (const s of V.sentences(text)) if (!/\{n\}/.test(s)) res[band].push({ s, voice }); };
  for (const band of ['junior', 'senior']) {
    const j = band === 'junior'; const C = CONTENT[band]; const pick = (o) => (typeof o === 'string' ? o : j ? o.j : o.s);
    for (const v of Object.values(C.ui)) add(band, v, 'narrator');
    for (const k of ['unknown', 'correct', 'notQuite', 'lookAgain', 'itWas']) add(band, C.ui[k], 'helper');
    for (const v of Object.values(C.ui.lucky || {})) add(band, v, 'helper');
    if (C.ui.unfair) add(band, C.ui.unfair, 'helper'); // a biased school brief never passes (fourth playtest)
    add(band, 'I skipped the joke words.', 'helper'); // a plan that passed from a poor brief (third playtest)
    for (const h of Object.values(C.habits)) { add(band, h.explain, 'helper'); add(band, `${C.ui.correct} ${h.label}`, 'narrator'); }
    for (const r of [...C.stars.flawed, ...C.stars.clean, ...C.stars.missed]) add(band, `★ ${r}`, 'narrator');
    for (const w of WONT_LINES) add(band, w, 'helper');
    for (const [id, L] of Object.entries(LEVEL_TEXT)) {
      const N = L.newThing; const label = N.label ? pick(N.label) : C.checks[N.lens].label;
      add(band, `${label}. ${pick(N)} ${pick(L.brief)}`, 'narrator'); add(band, pick(L.live), 'narrator');
      for (const f of Object.values(L.flaw)) add(band, pick(f), 'narrator');
      const H = pick(L.hidden); add(band, H.q, 'narrator'); add(band, `${C.ui.correct} ${H.why}`, 'helper'); add(band, H.why, 'helper');
      add(band, pick(L.complete), 'narrator'); add(band, FILMS[id] ? pick(FILMS[id].lines) : '', 'narrator');
      for (const ok of [true, false]) { const s = { townFlooded: ok ? 0 : 3, unsafeCrossings: ok ? 0 : 2, avgTemp: ok ? 21 : 14, species: { bees: ok }, food: ok ? 20 : 5, foodNeed: 14, power: { winterOK: ok }, walkMax: ok ? 12 : 22 }; for (const l of diaryLines(id, s, j)) add(band, l, 'narrator'); }
    }
    add(band, 'Ribbon-cutting time!', 'narrator'); add(band, 'Opening ceremony.', 'narrator');
    // free building: Florence's fixed tips and unlock lines, the AI Lab cards (lines with live numbers use the device voice)
    const S = SANDBOX[band];
    for (const r of RULES) { const t = r.text[j ? 'j' : 's']; if (typeof t === 'string') add(band, t, 'helper'); }
    for (const id of Object.keys(S.unlockTip)) if (S.unlockTip[id]) { add(band, S.unlockTip[id], 'helper'); add(band, `${S.unlockTip[id]} ${S.labReady}`, 'helper'); }
    for (const [k, v] of Object.entries(S.intro)) if (!['tag', 'yourTurnTag', 'next', 'skip', 'tiles'].includes(k)) add(band, v, 'helper');
    add(band, 'Built! Now see it from the street.', 'narrator'); add(band, 'Complete. Street-level view.', 'narrator');
    // feedback lines (Nov 2026): well done when a problem is fixed, next-step ideas, goals met, the intro's goals beat
    for (const v of Object.values(S.fixed || {})) add(band, v, 'helper');
    for (const v of Object.values(S.nextIdea || {})) add(band, v, 'helper');
    // the quality review round: the final reflection, the charter note, and Florence's text-dependent explanations
    if (S.reflect) { const R = S.reflect; add(band, `${R.title} ${R.how}`, 'narrator'); add(band, R.keep, 'narrator'); add(band, R.townLeft, 'narrator'); }
    if (S.charterGap) add(band, S.charterGap, 'narrator');
    for (const t of ['“Cars only” = car roads to every home and a drop-off at the school gate.', 'Florence did exactly what the words said, “cars only”, and forgot that children walk and cycle to school.',
      'You asked for land by the beach. The beach was too small, so Florence spread the town onto the low meadow beside it, and nobody told her that meadow floods every winter.',
      'You asked for land near the water. Florence chose the low meadow by the river, and nobody told her it floods every winter.']) add(band, t, 'helper');
    // Florence's good spots ("Show me where"), as she says them (without the star)
    if (S.spotWhy) { const say = (t) => add(band, t.replace(/^⭐\s*/, ''), 'helper'); for (const [k, f] of Object.entries(S.spotWhy)) {
      if (typeof f === 'string') say(f); else if (k === 'nearHomes') for (let n = 0; n <= 9; n++) say(f(n)); else for (const to of Object.values(S.spotTo)) say(f(to)); } }
    for (const v of Object.values(S.goalMet || {})) add(band, v, 'narrator');
    if (S.introGoals) add(band, S.introGoals, 'helper');
    // town events and the mission hint (Nov 2026, scored review)
    if (S.events) { const E = S.events; for (const k of ['stormTip', 'darkTip']) add(band, E[k], 'helper'); for (const k of ['stormGood', 'darkBad', 'darkGood']) add(band, E[k], 'narrator'); for (let n = 1; n <= 12; n++) add(band, E.stormBad(n), 'narrator'); }
    for (const w of Object.values(C.checkWhat || {})) add(band, `${j ? 'Hint: try the check that looks at' : 'Hint: test'} ${w}.`, 'narrator');
    if (S.planDidntFit) add(band, S.planDidntFit, 'narrator');
    // third playtest: keyboard captions, and Florence's literal readings of lorry / "not concrete" / "most families" briefs
    for (const k of ['kbHint', 'kbHere']) if (S[k]) add(band, S[k], 'narrator');
    for (const t of ['“Bring the food in” = nothing grown on the island: a lorry and the ferry bring every basket from the mainland.', 'Florence did exactly what the words said: all the food comes from somewhere else, so the town grows none of its own, and the lorry burns fuel every week.', 'Not concrete, so: Timber terrace.', '“Most families” = the shortest walk on average.']) add(band, j ? t : t.replace(/\bbaskets?\b/g, (m) => (m.endsWith('s') ? 'units' : 'unit')), 'helper');
    // the AI Lab classroom: hello, Florence's answers (topics, and every build as "Label: what it does")
    if (S.classHello) add(band, S.classHello, 'helper');
    // Florence's suggestions in the town, and what she says when you judge them
    if (S.suggest) { const G2 = S.suggest; for (const k of ['check', 'judge', 'caught', 'goodCheck', 'missed', 'doubted']) add(band, G2[k], 'helper');
      for (const [id, v] of Object.entries(G2)) if (v && typeof v === 'object' && v.text) { add(band, v.text, 'helper'); if (v.why) { add(band, `${G2.missed} ${v.why}`, 'helper'); add(band, G2.oops(v.why), 'helper'); } } }
    { const { TOPICS, answer } = await import('./js/game/qa.js'); const { ITEMS } = await import('./js/world/catalog.js');
      for (const t of TOPICS) add(band, t.a[j ? 'j' : 's'], 'helper'); add(band, answer('zzz', j).text, 'helper');
      for (const it of Object.values(ITEMS)) if (it.desc) add(band, `${it.label}: ${it.desc[j ? 'j' : 's']}`, 'helper'); }
    // best-seller plan (Nov 2026): challenge towns and island towns, animal news, planner ranks, the off-home-island
    // Lab card, Florence's hello in a visited town (other lines with live numbers use the device voice)
    { const { CHALLENGES, ISLAND_TOWNS = [] } = await import('./js/game/challenges.js'); const { ANIMALS } = await import('./js/game/reactions.js'); const { RANKS } = await import('./js/game/passport.js');
      for (const c of [...CHALLENGES, ...ISLAND_TOWNS]) { add(band, pick(c.rule), 'narrator'); add(band, j ? `You did it: ${c.name} is a whole town that works.` : c.free ? `${c.name}: every town goal is met.` : `${c.name}: every town goal and the challenge rule are met.`, 'narrator'); }
      for (const A of Object.values(ANIMALS)) { add(band, `${A.icon} ${pick(A.back)}`, 'narrator'); add(band, `${A.icon} ${pick(A.gone)}`, 'narrator'); }
      for (const r of RANKS.slice(1)) add(band, `${r.icon} ${j ? `New rank: ${r.name}!` : `Rank reached: ${r.name}.`} ${j ? 'See your club passport in ☰.' : 'Club passport: ☰.'}`, 'narrator');
      add(band, j ? 'The six AI Lab missions happen on the home island, on Florence’s practice island. Here all six lenses are already yours: use them to check your town.' : 'The six AI Lab missions run on the home island’s practice island. On this island all six lenses are already open.', 'narrator');
      const { townTitle, PETALS } = await import('./js/sim/sim.js');
      for (const a of PETALS) for (const b2 of PETALS) if (a !== b2) { const p = Object.fromEntries(PETALS.map((x) => [x, x === a ? 1.5 : x === b2 ? 1.4 : 0.1])); const h = townTitle(p, { bees: true, deer: true });
        add(band, j ? `Welcome to ${h}! Someone else planned this town. Tap 🔍 and pick a lens: what did they get right, and what would you check?` : `This is ${h}, planned by someone else. Run the lenses: what holds up, and what would you question?`, 'helper'); }
      add(band, j ? 'Tap 🔍 and pick a lens to check this town.' : 'Run a lens on this town.', 'helper'); }
    add(band, S.classInvite, 'helper'); add(band, S.moveIn, 'narrator'); add(band, S.completeText, 'narrator'); add(band, S.planDidntFit, 'narrator');
    // the full day (Nov 2026): the mission reward card, the pause cards, the session finish, Florence's careful replies
    { const shortH = Object.values(C.ui.shortHead || {}); for (const L of Object.values(LEVEL_TEXT)) for (const hd of [pick(L.complete), ...shortH]) for (let n = 0; n <= 3; n++) add(band, `${hd} ${n} stars.`, 'narrator');
      for (const q of S.pause || []) add(band, `${S.pauseRibbon}. ${q}`, 'narrator');
      const { sessionRecap } = await import('./js/game/recap.js'); for (const t of sessionRecap({}, {}, j).talk) add(band, t, 'narrator');
      const { CARE } = await import('./js/game/care.js'); for (const v of Object.values(CARE)) add(band, pick(v), 'helper'); }
    // the welcome film and its guide (js/welcome.js, js/series.js)
    { const { SCENES } = await import('./js/series.js'); for (const sc of SCENES) add(band, sc.say, 'narrator'); add(band, 'Four parts, in this order. Each one tells you what to do as you go.', 'narrator'); }
    // the afternoon modules: every built-in sentence in their word files (strings, { j, s } pairs, and what functions
    // return when given only the age). A sentence with a missing value in it (undefined, NaN) is left out.
    for (const f of WORD_FILES) {
      let M; try { M = await import(f); } catch { continue; }
      const seen = new Set(); const bad = /undefined|NaN|\[object|\bnull\b|\btrue\b|\bfalse\b/;
      const say = (t) => { if (/\s/.test(t) && /[.!?:]['’”)]?$/.test(t.trim())) for (const s of V.sentences(t)) if (!bad.test(s)) add(band, s, 'helper'); };
      const walk = (v, d) => {
        if (v == null || d > 4) return;
        if (typeof v === 'string') return say(v);
        if (typeof v === 'function') { if (d > 2 || v.length > 2) return; for (const a of [[j], []]) { try { walk(v(...a), d + 1); } catch { /* needs more than the age */ } } return; }
        if (typeof v !== 'object' || seen.has(v) || v instanceof Promise) return; seen.add(v);
        if ('j' in v && 's' in v) return walk(j ? v.j : v.s, d + 1);
        for (const x of Object.values(v)) walk(x, d + 1);
      };
      for (const [name, v] of Object.entries(M)) if (name !== 'default') walk(v, 0);
    }
    // robot training: what the robot did with each thing, for every thing, bin and set of matching features
    { const R = await import('./js/modules/robots/learn.js').catch(() => null); const W = await import('./js/modules/robots/words.js').catch(() => null);
      if (R && W) { const h = (t) => { if (typeof t !== 'string') return; for (const s of V.sentences(t)) res[band].push({ s, voice: 'helper', rare: 1 }); }; // rare: recorded last (render.py --only) const ks = R.kindsFor(j).map((k) => k.id); const bins = R.binsFor(j).map((x) => x.id); const fs = R.featuresFor(j);
        const subsets = []; for (let m = 1; m < 1 << fs.length; m++) subsets.push(fs.filter((_, i) => m & (1 << i)));
        for (const t of ['Right bin', 'Not the right bin yet', 'Asked for help']) h(`${t}.`);
        for (const k of ks) { const truth = R.kind(k).bin; h(`${R.kind(k).name}.`);
          h(W.streetLine({ kind: k, got: null, why: 'tie', truth })); h(W.streetLine({ kind: k, got: null, truth })); h(W.verdict({ kind: k, got: null }).text);
          for (const g of ['bin', 'nothing', 'closer']) h(W.lacked(k, { type: g }));
          for (const b of bins) { h(W.streetLine({ kind: k, got: b, match: k, ok: false, truth: b })); h(W.streetLine({ kind: k, got: b, match: k, ok: true, truth: b })); h(W.wrongBin(k, j)); }
          for (const same of subsets) { h(W.verdict({ kind: k, got: truth, match: k, ok: true, same }).text); h(W.verdict({ kind: k, got: truth, match: k, ok: false, truth, same }).text); } } } }
  }
  // Florence's readings for many instructions (both bands hear them in her voice)
  const terrain = makeTerrain(); let cells = new Map(); const SL = { land: ['best', 'flat', 'sunny', 'dry', 'keep_meadow', 'keep_wood', 'keep_wetland', 'near_water', 'near_coast', 'big'], move: ['easy_access', 'safe_walking', 'cycling', 'tram', 'cars_at_edge', 'no_cars', 'fast', 'everyone'], homes: ['strong', 'cheap', 'many', 'tall', 'low_carbon', 'warm', 'natural_materials', 'green_roofs', 'reuse'], food: ['max_food', 'enough_food', 'keep_hedges', 'bees', 'wildlife', 'local', 'allotments', 'orchard'], power: ['clean_power', 'enough_power', 'winter', 'night', 'storage', 'wind', 'solar', 'save_water', 'repair', 'compost'], heart: ['middle', 'walk_time', 'near_homes', 'nature_links', 'market', 'safe_route'] };
  const CLEAR = { land: ['dry', 'sunny', 'keep_meadow'], move: ['safe_walking', 'cycling', 'cars_at_edge'], homes: ['warm', 'low_carbon', 'natural_materials'], food: ['enough_food', 'keep_hedges', 'bees'], power: ['enough_power', 'winter', 'night', 'storage', 'solar', 'save_water', 'compost'], heart: ['walk_time', 'market', 'nature_links'] };
  for (const [lv, slots] of Object.entries(SL)) {
    const combos = []; for (let a = 0; a < slots.length; a++) for (let c = a; c < slots.length; c++) for (let d = c; d < slots.length; d++) combos.push([...new Set([slots[a], slots[c], slots[d]])]);
    combos.push(CLEAR[lv]);
    for (const pick of combos) { const pl = plan(lv, pick, { terrain, cells, numbers: { minutes: 15 } }); for (const r of [...pl.reading, pl.habitWhy]) if (r) for (const band of ['junior', 'senior']) add(band, r, 'helper'); }
    for (const sl of slots) { const pl = plan(lv, [sl], { terrain, cells, numbers: { minutes: 15 } }); for (const r of [...pl.reading, pl.habitWhy]) if (r) for (const band of ['junior', 'senior']) add(band, r, 'helper'); }
    if (lv === 'move') for (const text of ['step-free wheelchair gentle slopes lit paths, time to cross for slower walkers, accessible ferry ramp']) for (const pick of [CLEAR.move, ['safe_walking', 'everyone']]) { const pl = plan(lv, pick, { terrain, cells, numbers: {}, text }); for (const r of pl.reading) for (const band of ['junior', 'senior']) add(band, r, 'helper'); }
    cells = applyPlacements(cells, plan(lv, CLEAR[lv], { terrain, cells, numbers: { minutes: 15 } }).placements); for (const c of cells.values()) if (c.item) c.locked = true;
  }
  return { res, helper: HELPER };
}, WORD_FILES);
// lines spoken during play-throughs, with the voice they were spoken in
for (const f of saidFiles) {
  const band = /senior|\/s\d|-s\b|pt-s/.test(f) ? 'senior' : 'junior'; const said = JSON.parse(fs.readFileSync(f, 'utf8')).filter((x) => x.voice === 'narrator' || x.voice === 'helper'); // not the silent floating numbers
  const sents = await p.evaluate(({ said }) => import('./js/ui/voice.js').then((V) => said.flatMap((x) => V.sentences(x.text).map((s) => ({ s, voice: x.voice, said: 1 })))), { said });
  out.res[band].push(...sents.filter((x) => !(/\d/.test(x.s) && x.s.length >= 60))); // a long sentence with a live number in it is one play-through’s own
}
for (const band of ['junior', 'senior']) {
  const keys = await p.evaluate((list) => import('./js/ui/voice.js').then((V) => list.map((x) => ({ ...x, key: V.keyOf(x.s, x.voice) }))), out.res[band]);
  const uniq = [...new Map(keys.filter((x) => !/\d{2,}|\d+ ?%|\d+ of \d+/.test(x.s) || x.s.length < 60).map((x) => [x.key, x])).values()];
  const file = path.join(here, `lines-${band}.json`); const old = !fresh && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const had = new Set(old.map((x) => x.key)); const added = uniq.filter((x) => !had.has(x.key)); const all = [...old, ...added];
  fs.writeFileSync(file, JSON.stringify(all, null, 1));
  console.log(band, uniq.length, 'sentences found,', added.length, 'new;', all.length, 'in the list,', all.filter((x) => x.voice === 'helper').length, 'in Florence’s voice');
}
await b.close();
