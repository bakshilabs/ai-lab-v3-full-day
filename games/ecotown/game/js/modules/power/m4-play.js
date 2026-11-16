// Mission 4 on the page (the first version of this module, kept with its fixes): write rules from tiles → watch them
// run a windy day, a still day and a winter night → find the hour homes went dark and why, change the rules → compare
// with the day run by hand in mission 3. The rules and their interpreter: rules.js.
import { MODES, TEST_DAYS, HOURS, START_LEVEL, forecast, stepHour } from './model.js';
import { cleanRules, whensFor, maxRules, testRules, explain, draftFromHand, compare, sameRules } from './rules.js';
import { T, clockWord, whenWord, whenNote, whenIcon, thenWord, rulesSpoken, rulesAsk, needRule, maxSay, testSay, gapLines, gapFix, resultsSay, unusedLine, longestLine, dayScore, compareLines, compareSay } from './words.js';
import { esc, capital, SEED } from './shell.js';

const STILL_MS = 1300; // one still view of a rule-run day, with reduced motion
const TEST_MS = 420;   // one hour while the rules run

export async function playRules(d, st, save) {
  const { kit, j, pick, reduce, ctl, host } = d; const today = forecast('today', SEED); const startLevel = kit.cap * START_LEVEL;

  // ---- rules from tiles
  function rulesEdit(first, draft) {
    d.report(T.stage.rules); save(); d.useDials(); const max = maxRules(j); const whens = whensFor(j); const list = st.rules.list;
    // while the rules are open the window shows the hour the last test went darkest (or a calm afternoon)
    const gapDay = st.test?.days.find((x) => !x.allLit); if (gapDay) d.showHour(gapDay.hours[gapDay.worst], gapDay.dayId); else { const h = stepHour(kit, today[13], startLevel, 'use'); d.showHour(h, 'today'); }
    d.say(rulesAsk(j, draft, first), pick(T.rulesHow));
    return new Promise((res) => {
      const main = (focus) => {
        d.screen.innerHTML = `<h3>${esc(pick(T.rulesHead))}<small>${list.length} of ${max}</small></h3>
          <ol class="pw-rules">${list.map((r, n) => `<li><span class="pw-n" aria-hidden="true">${n + 1}</span>
            <button type="button" class="pw-tile when" data-edit="when" data-n="${n}" aria-label="Rule ${n + 1}, when: ${esc(whenWord(r.when, j))}. Change"><i aria-hidden="true">${whenIcon(r.when)}</i><span><small>${T.whenLabel}</small>${esc(whenWord(r.when, j))}</span></button><span class="pw-arrow" aria-hidden="true">➜</span>
            <button type="button" class="pw-tile then" data-edit="then" data-n="${n}" aria-label="Rule ${n + 1}, do: ${esc(thenWord(r.then, j))}. Change"><i aria-hidden="true">${T.modeIcon[r.then]}</i><span><small>${T.thenLabel}</small>${esc(pick(T.mode[r.then]))}</span></button>
            <span class="pw-ops"><button type="button" data-op="up" data-n="${n}" aria-label="${T.up}: rule ${n + 1}" ${n === 0 ? 'disabled' : ''}>▲</button><button type="button" data-op="down" data-n="${n}" aria-label="${T.down}: rule ${n + 1}" ${n === list.length - 1 ? 'disabled' : ''}>▼</button><button type="button" data-op="del" data-n="${n}" aria-label="${T.remove}: rule ${n + 1}">✕</button></span></li>`).join('')}
            <li class="pw-else"><span class="pw-n" aria-hidden="true">–</span><span>${esc(pick(T.noRuleRow))}</span></li></ol>
          <div class="pw-row"><button type="button" data-op="add" ${list.length >= max ? 'disabled' : ''}>${T.addRule}</button></div>`;
        ctl.innerHTML = `<button type="button" class="pw-toggle" data-op="school" aria-pressed="${st.rules.school}"><span aria-hidden="true">🏫</span><span>${esc(pick(T.schoolRule))}<small>${esc(pick(T.schoolHint))}</small></span><em>${st.rules.school ? T.on : T.off}</em></button>
          ${j ? '' : `<button type="button" class="pw-toggle" data-op="turns" aria-pressed="${st.rules.turns}"><span aria-hidden="true">🔁</span><span>${esc(pick(T.turnsRule))}<small>${esc(pick(T.turnsHint))}</small></span><em>${st.rules.turns ? T.on : T.off}</em></button>`}
          <button class="go" type="button" data-op="test" ${list.length ? '' : 'disabled'}>${pick(T.test)}</button>${list.length ? '' : `<p>${esc(needRule(j))}</p>`}`;
        if (focus) d.focusFirst(focus);
      };
      // choose from tiles: a condition, then an action. Resolves with the id, or null for Back.
      const choose = (kind, current, n) => new Promise((done) => {
        const used = new Set(list.filter((_, k) => k !== n).map((r) => r.when)); const opts = kind === 'when' ? whens.filter((w) => !used.has(w) || w === current) : MODES;
        d.screen.innerHTML = `<h3>${esc(pick(kind === 'when' ? T.pickWhen : T.pickThen))}<small>${n < list.length ? `Rule ${n + 1}` : `Rule ${list.length + 1}`}</small></h3>
          <div class="pw-pick ${kind}">${opts.map((o) => (kind === 'when'
    ? `<button type="button" data-pick="${o}" aria-current="${o === current}"><i aria-hidden="true">${whenIcon(o)}</i><b>${esc(whenWord(o, j))}</b><small>${esc(whenNote(o, j))}</small></button>`
    : `<button type="button" data-pick="${o}" aria-current="${o === current}"><i aria-hidden="true">${T.modeIcon[o]}</i><b>${esc(capital(thenWord(o, j)))}</b><small>${esc(pick(T.modeHint[o]))}</small></button>`)).join('')}</div>`;
        ctl.innerHTML = `<h4>${esc(pick(kind === 'when' ? T.pickWhen : T.pickThen))}</h4><button type="button" data-pick="">← Back</button>`;
        d.ctx.say(pick(kind === 'when' ? T.pickWhen : T.pickThen)); d.focusFirst('[data-pick]');
        d.setTap((b) => { if ('pick' in b.dataset) done(b.dataset.pick || null); });
      });
      const changed = () => { save(); d.ctx.engine.audio?.tap?.(); };
      const mainTap = async (b) => {
        const op = b.dataset.op, n = Number(b.dataset.n);
        if (b.dataset.edit) { const kind = b.dataset.edit; const got = await choose(kind, kind === 'when' ? list[n].when : list[n].then, n); if (got) { if (kind === 'when') list[n].when = got; else list[n].then = got; changed(); d.ctx.say(`Rule ${n + 1}. ${whenWord(list[n].when, j)}, ${thenWord(list[n].then, j)}.`); } d.setTap(mainTap); main(`[data-edit="${kind}"][data-n="${n}"]`); return; }
        if (op === 'add') {
          if (list.length >= max) { d.say(maxSay(max, j)); return; }
          const w = await choose('when', null, list.length); const a = w ? await choose('then', null, list.length) : null;
          if (w && a) { list.push({ when: w, then: a }); changed(); d.ctx.say(`Rule ${list.length}. ${whenWord(w, j)}, ${thenWord(a, j)}.`); }
          d.setTap(mainTap); main('[data-op="add"]'); if (list.length >= max) d.focusFirst('[data-op="test"]'); return;
        }
        if (op === 'up' && n > 0) { [list[n - 1], list[n]] = [list[n], list[n - 1]]; changed(); main(n - 1 > 0 ? `[data-op="up"][data-n="${n - 1}"]` : '[data-op="down"][data-n="0"]'); return; }
        if (op === 'down' && n < list.length - 1) { [list[n + 1], list[n]] = [list[n], list[n + 1]]; changed(); main(n + 1 < list.length - 1 ? `[data-op="down"][data-n="${n + 1}"]` : `[data-op="up"][data-n="${n + 1}"]`); return; }
        if (op === 'del') { list.splice(n, 1); changed(); main('[data-op="add"]'); return; }
        if (op === 'turns' && !j) { st.rules.turns = !st.rules.turns; changed(); main('[data-op="turns"]'); d.ctx.say(`${pick(T.turnsRule)}: ${st.rules.turns ? T.on : T.off}.`); return; }
        if (op === 'school') { st.rules.school = !st.rules.school; changed(); main('[data-op="school"]'); d.ctx.say(`${pick(T.schoolRule)}: ${st.rules.school ? T.on : T.off}.`); return; }
        if (op === 'test' && list.length) { d.setTap(null); res(); }
      };
      d.setTap(mainTap); main('[data-op="add"]');
    });
  }

  // ---- the rules run three days
  async function testRun() {
    d.report(T.stage.test); save(); host?.classList.add('pw-fast'); // an hour every 420 ms: a dial that glides would never catch up
    const test = testRules(kit, st.rules, { seed: SEED }); st.tests++;
    const edited = !!st.tested && !sameRules(st.tested, st.rules);
    if (edited) { st.changed = true; if (st.test && test.litHours > st.test.litHours) st.improved = true; }
    st.prev = edited ? st.test : null; st.test = test; st.tested = cleanRules(st.rules, j);
    let skip = false;
    const wait = (ms) => new Promise((r) => { if (skip) { r(); return; } const id = d.later(r, ms); d.setTap((b) => { if ('skip' in b.dataset) { skip = true; d.stopLater(id); r(); } }); });
    for (let n = 0; n < TEST_DAYS.length && !skip; n++) {
      const day = test.days[n]; const last = n === TEST_DAYS.length - 1; const head = `<h3>${esc(pick(T.day[day.dayId]))}<small>${n + 1} of 3 · ${esc(pick(T.dayNote[day.dayId]))}</small></h3>`;
      d.say(testSay(day.dayId, j));
      if (reduce) { // no sweep: five still views of the day, cut one to the next, then the whole day with a Next button
        ctl.innerHTML = `<h4>${esc(pick(T.byRules))}</h4><p>${esc(rulesSpoken(st.rules, j))}</p><button type="button" data-skip>${T.skipRun}</button>`; d.focusFirst('[data-skip]');
        for (const i of [1, 6, 11, 14, 18]) { if (skip) break; d.showHour(day.hours[i], day.dayId); d.screen.innerHTML = `${head}${d.chart(day.dayId, { hours: day.hours.slice(0, i + 1), cursor: i })}${d.keyRow()}`; await wait(STILL_MS); }
        skip = false; const at = day.worst >= 0 ? day.hours[day.worst] : day.hours[15]; d.showHour(at, day.dayId);
        d.screen.innerHTML = `${head}${d.chart(day.dayId, { hours: day.hours, cursor: at.i, mark: day.worst })}<ul class="pw-lines"><li>${esc(dayScore(day, j))}</li></ul>`;
        ctl.innerHTML = `<h4>${esc(pick(T.byRules))}</h4><button class="go" type="button" data-act="next">${last ? T.seeResults : T.nextDay}</button>`; d.focusFirst('[data-act]'); await d.press(); continue;
      }
      ctl.innerHTML = `<h4>${esc(pick(T.byRules))}</h4><p>${esc(rulesSpoken(st.rules, j))}</p><button type="button" data-skip>${T.skipRun}</button>`; d.focusFirst('[data-skip]');
      for (let i = 0; i < HOURS && !skip; i++) { d.showHour(day.hours[i], day.dayId); d.screen.innerHTML = `${head}${d.chart(day.dayId, { hours: day.hours.slice(0, i + 1), cursor: i })}${d.keyRow()}`; await wait(TEST_MS); }
      if (!skip) { const at = day.worst >= 0 ? day.hours[day.worst] : day.hours[15]; d.showHour(at, day.dayId); d.screen.innerHTML = `${head}${d.chart(day.dayId, { hours: day.hours, cursor: at.i, mark: day.worst })}<ul class="pw-lines"><li>${esc(dayScore(day, j))}</li></ul>`; await wait(1500); }
    }
    d.setTap(null); host?.classList.remove('pw-fast');
  }
  async function results() {
    d.report(T.stage.results); const test = st.test; let sel = Math.max(0, test.days.findIndex((x) => !x.allLit)); if (test.allLit) sel = 1; let cur = 0;
    const pickHour = () => { const x = test.days[sel]; cur = x.worst >= 0 ? x.worst : 15; };
    const draw = (focus) => {
      const day = test.days[sel]; const h = day.hours[cur]; d.showHour(h, day.dayId); const gap = explain(kit, day, cur);
      const lines = gap ? gapLines(kit, day, gap, st.rules, j) : [`${capital(`at ${clockWord(h.clock, j)}`)}, ${j ? 'every home was lit.' : 'every home was supplied.'}`];
      const fix = gap ? gapFix(gap, j) : ''; const unused = test.used.findIndex((u) => u === 0);
      d.screen.innerHTML = `<div class="pw-tabs" role="group" aria-label="Test days">${test.days.map((x, n) => `<button type="button" data-day="${n}" aria-pressed="${n === sel}" aria-label="${esc(pick(T.day[x.dayId]))}: ${esc(dayScore(x, j))}"><b>${esc(pick(T.day[x.dayId]))}</b><small>${x.litHours} / ${x.total} lit</small><span class="tag ${x.allLit ? 'ok' : 'dark'}">${x.allLit ? '✓ all lit' : `● dark at ${esc(clockWord(x.hours[x.worst].clock, j))}`}</span></button>`).join('')}</div>
        ${d.chart(day.dayId, { hours: day.hours, cursor: cur, mark: day.worst, h: 132 })}
        <ul class="pw-lines" aria-live="polite">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}${fix ? `<li class="fix">${esc(fix)}</li>` : ''}${!j && day.longest ? `<li class="note">${esc(longestLine(day, st.rules.turns))}</li>` : ''}${unused >= 0 && cur === (day.worst >= 0 ? day.worst : 15) ? `<li class="note">${esc(unusedLine(unused + 1, j))}</li>` : ''}</ul>`;
      ctl.querySelector('.pw-hour b').textContent = clockWord(h.clock, j);
      if (focus) d.focusFirst(focus); return lines.concat(fix ? [fix] : []);
    };
    ctl.innerHTML = `<p>${j ? 'Step through the day' : 'Step through the hours'}</p><div class="pw-hour"><button type="button" data-step="-1" aria-label="One hour back">◀</button><b></b><button type="button" data-step="1" aria-label="One hour on">▶</button></div><button type="button" data-act="change">${pick(T.change)}</button><button class="go" type="button" data-act="keep">${pick(T.keep)}</button>`; pickHour(); const first = draw();
    d.say(resultsSay(test, j, st.prev), first.join(' '), true); d.focusFirst(test.allLit ? '[data-act="keep"]' : '[data-act="change"]');
    d.setTap((b) => {
      if (b.dataset.day !== undefined) { sel = Number(b.dataset.day); pickHour(); d.ctx.say(draw(`[data-day="${sel}"]`).join(' ')); }
      else if (b.dataset.step) { cur = (cur + Number(b.dataset.step) + HOURS) % HOURS; d.ctx.say(draw(`[data-step="${b.dataset.step}"]`).join(' ')); }
    });
    const a = await d.press(); d.setTap(null); return a;
  }
  // ---- hand and rules, side by side
  async function sideBySide() {
    d.report(T.stage.compare); const hadHand = !!st.hand; const cmp = compare(kit, st.hand || Array(HOURS).fill('hold'), st.rules, { seed: SEED }); const lines = compareLines(cmp, j, hadHand);
    const at = cmp.auto.hours[15]; d.showHour(at, 'today'); // nine in the evening, the town under the rules
    const bar = (name, x) => `<div><span>${esc(name)}</span><i><u style="width:${(x.share * 100).toFixed(1)}%"></u></i><em>${x.litHours} / ${x.total}</em></div>`;
    d.screen.innerHTML = `<h3>${j ? 'Hand and rules, side by side' : 'Hand-run and rule-run, side by side'}<small>${esc(pick(T.litHours))}</small></h3>
      <div class="pw-cmp">${hadHand ? bar(`${pick(T.byHand)}: ${pick(T.day.today).toLowerCase()}`, cmp.hand) : ''}${bar(`${pick(T.byRules)}: ${pick(T.day.today).toLowerCase()}`, cmp.auto)}${cmp.test.days.map((x) => bar(`${pick(T.byRules)}: ${pick(T.day[x.dayId]).replace(/^A /, '')}`, x)).join('')}</div>
      <ul class="pw-lines">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
    d.say(compareSay(cmp, j, hadHand), lines.join(' '), true);
    ctl.innerHTML = `<button class="go" type="button" data-act="finish">${j ? 'Finish the mission ➜' : 'Finish the mission ➜'}</button><button type="button" data-act="change">${pick(T.change)}</button>`; d.focusFirst('[data-act]');
    return { act: await d.press(), cmp, hadHand };
  }

  // ---- the loop
  let draft = null; let first = true;
  if (!st.rules.list.length) { draft = st.hand ? draftFromHand(st.hand, 'today', SEED) : null; if (draft?.length) st.rules.list.push(...draft); }
  let stage = 'rules'; let end = null;
  for (;;) {
    if (stage === 'rules') { await rulesEdit(first, draft); first = false; draft = null; stage = 'test'; continue; }
    if (stage === 'test') { await testRun(); const a = await results(); stage = a === 'change' ? 'rules' : 'compare'; continue; }
    end = await sideBySide(); if (end.act === 'change') { stage = 'rules'; continue; } break;
  }
  save();
  return { share: Math.round(end.cmp.test.share * 100), diff: end.cmp.diff, cmp: end.cmp, hadHand: end.hadHand };
}
