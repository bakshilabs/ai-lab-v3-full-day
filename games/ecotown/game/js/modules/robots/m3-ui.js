// Mission 3 page: rules for the hospital delivery robot, tested on three trips that get harder.
import { CONDS, ACTS, ROUNDS, trip, tripLine, passed, orderNote, cleanRules, unusedLine } from './m3-rules.js';
import { esc } from './shell.js';
import { stageOf } from './missions.js';

const SX = 6; const SY = 3; // plan units to pixels
const MARK = { ok: '✓', late: '✓', unsafe: '✗', stuck: '✗' };
const NOTE = { person: 'Nurse', step: 'Child runs out', block: 'Trolley', lift: 'Lift' };
export function planSvg(round, robotAt = null, done = []) {
  const pts = round.route.map(([x, y]) => `${x * SX},${y * SY}`).join(' ');
  const upstairs = round.route.some(([, y]) => y < 50);
  const ev = round.events.map((e, i) => { const r = done[i]; const c = r ? (r.out === 'unsafe' || r.out === 'stuck' ? '#b3501f' : '#1f7a44') : '#8a6200';
    return `<g transform="translate(${e.x * SX} ${e.y * SY})"><circle r="17" fill="#fffaf0" stroke="${c}" stroke-width="3.5"/><text y="7" font-size="19" text-anchor="middle">${CONDS[e.kind].icon}</text>${r ? `<circle cx="14" cy="-14" r="9" fill="${c}"/><text x="14" y="-9.5" font-size="12" font-weight="800" fill="#fff" text-anchor="middle">${MARK[r.out]}</text>` : ''}</g>`; }).join('');
  const bot = robotAt ? `<g transform="translate(${robotAt[0] * SX} ${robotAt[1] * SY})"><rect x="-15" y="-13" width="30" height="26" rx="7" fill="#16c79a" stroke="#3b2a1e" stroke-width="2.5"/><rect x="-9" y="-7" width="18" height="10" rx="3" fill="#243447"/><path d="M-5 9h10" stroke="#fff" stroke-width="2.5"/><text x="0" y="-18" font-size="14" text-anchor="middle">💊</text></g>` : '';
  const end = round.route[round.route.length - 1]; const start = round.route[0];
  return `<svg class="rb-plan" viewBox="${upstairs ? '0 0 600 300' : '0 150 600 150'}" role="img" aria-label="Hospital plan: the pharmacy, the corridor${upstairs ? ', the lift and the ward upstairs' : ' and the ward'}">
    <rect width="600" height="300" rx="14" fill="#eef4fb"/>
    ${upstairs ? '<rect x="8" y="10" width="584" height="120" rx="10" fill="#e3ecf7" stroke="#c4d6ea" stroke-width="2"/><text x="20" y="32" font-size="14" font-weight="800" fill="#2b3a55">First floor</text>' : ''}
    <rect x="8" y="160" width="584" height="132" rx="10" fill="#e3ecf7" stroke="#c4d6ea" stroke-width="2"/><text x="20" y="284" font-size="14" font-weight="800" fill="#2b3a55">Ground floor</text>
    <polyline points="${pts}" fill="none" stroke="#c9d6e6" stroke-width="34" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${pts}" fill="none" stroke="#7f95b5" stroke-width="3" stroke-dasharray="8 8" stroke-linejoin="round"/>
    ${upstairs ? '<rect x="410" y="110" width="44" height="70" rx="6" fill="#b9c2cb" stroke="#3b2a1e" stroke-width="2.5"/><text x="432" y="150" font-size="13" font-weight="800" text-anchor="middle" fill="#3b2a1e">LIFT</text>' : ''}
    <g transform="translate(${start[0] * SX} ${start[1] * SY})"><rect x="-40" y="-56" width="80" height="34" rx="8" fill="#fff" stroke="#3a6fc9" stroke-width="3"/><text y="-34" font-size="13" font-weight="800" text-anchor="middle" fill="#2b3a55">Pharmacy</text></g>
    <g transform="translate(${end[0] * SX} ${end[1] * SY})"><rect x="-46" y="${end[1] < 50 ? 24 : -66}" width="92" height="34" rx="8" fill="#fff" stroke="#1f7a44" stroke-width="3"/><text y="${end[1] < 50 ? 46 : -44}" font-size="13" font-weight="800" text-anchor="middle" fill="#17603a">Ward</text></g>
    ${ev}${bot}</svg>`;
}

export async function playM3(ctx, sh, cur, keep) {
  const j = sh.junior; const d = { rules: [], tests: 0, secs: 0, ...(cur?.d || {}) }; let part = cur?.part || 0;
  const steps = ['First trip', 'The lift', 'Two rules at once'];
  for (; part < ROUNDS.length; part++) {
    if (ctx.signal.aborted) return null;
    const round = ROUNDS[part]; let rules = cleanRules(d.rules, round.conds); let result = null; let shownAt = round.route[0]; let doneEv = []; let running = false; let passedOnce = false;
    sh.setup({ mission: { n: 3, icon: '🏥' }, steps, stage: `m3-r${part + 1}` }); sh.step(part); ctx.report({ stage: stageOf(3, steps[part].toLowerCase()) });
    const intro = [
      j ? 'The robot takes medicine from the pharmacy to the ward. Nurses walk the corridor, and trolleys get left in the way. Choose what it does in each case, then press Test run.' : 'Deliver from the pharmacy to Ward 1. Set a rule for people nearby and one for a blocked corridor, then test run.',
      j ? 'Now the ward is upstairs, and the medicine is needed soon. Stopping for every nurse takes too long. Set the rules, then test.' : `Ward 3 is upstairs, and the medicine is due within ${round.due} s. Each rule costs time. Set them, then test.`,
      j ? 'A new rule: someone steps right in front. That person is also near, so two rules fit. The robot uses the first rule in its list. Every rule must be safe, and the medicine must still arrive in time.' : `New rule: someone steps into its path. That also matches “a person is near”, and the robot applies the first match. Every rule must be safe; due within ${round.due} s.`,
    ][part];
    sh.say(intro);
    const save = () => { d.rules = rules.map((r) => ({ ...r })); keep(part, d); };
    await sh.wait((done) => {
      function draw(focus = null) {
        const allSet = rules.every((r) => r.act);
        sh.main.innerHTML = `<div class="rb-m3"><div class="rb-left3"><div class="rb-panel rb-planbox">${planSvg(round, shownAt, doneEv)}
          ${doneEv.length ? `<ol class="rb-log">${doneEv.map((e) => { const note = orderNote(e, rules, j); return `<li class="${e.out}"><span aria-hidden="true">${CONDS[e.kind].icon}</span><div><b>${esc(NOTE[e.kind])}:</b> ${esc(e.text)}${note ? `<small>${esc(note)}</small>` : ''}</div><em class="rb-mk ${e.out}">${MARK[e.out]}</em></li>`; }).join('')}${result ? result.bad.map((i) => `<li class="unsafe"><span aria-hidden="true">⚠️</span><div><b>${j ? 'A rule to fix' : 'Untriggered rule'}:</b> ${esc(unusedLine(rules, i, j))}</div><em class="rb-mk unsafe">✗</em></li>`).join('') : ''}</ol>` : ''}
          ${result ? `<p class="rb-verdict ${passed(result) ? (result.events.some((e) => e.out === 'late') ? 'ask' : 'ok') : result.arrived && result.safe && !result.bad.length ? 'ask' : 'miss'}" aria-live="polite">${esc(tripLine(result, round, j))}</p>` : ''}</div></div>
          <div class="rb-panel rb-rulebox"><h3>${j ? 'The robot’s rules' : 'Rules (checked from the top)'}<small>${j ? 'If this happens, then do that.' : 'First match wins.'}${round.due && !j ? ` Due within ${round.due} s.` : ''}</small></h3>
          <ol class="rb-rlist">${rules.map((r, i) => `<li><div class="rb-rif"><span class="rb-rnum">${i + 1}</span><span aria-hidden="true">${CONDS[r.cond].icon}</span><b>If ${esc(CONDS[r.cond][j ? 'j' : 's'].replace(/^./, (c) => c.toLowerCase()))}</b>
              ${part === 2 ? `<span class="rb-order"><button type="button" class="rb-mv" data-mv="${i}" data-dir="-1" aria-label="Move this rule up" ${i === 0 || running ? 'disabled' : ''}>▲</button><button type="button" class="rb-mv" data-mv="${i}" data-dir="1" aria-label="Move this rule down" ${i === rules.length - 1 || running ? 'disabled' : ''}>▼</button></span>` : ''}</div>
            <div class="rb-ract" role="radiogroup" aria-label="Then"><small>then</small>${CONDS[r.cond].acts.map((a) => `<button type="button" role="radio" class="rb-act${r.act === a ? ' on' : ''}" data-r="${i}" data-a="${a}" aria-checked="${r.act === a}" ${running ? 'disabled' : ''}>${esc(ACTS[a][j ? 'j' : 's'])}</button>`).join('')}</div></li>`).join('')}</ol>
          ${allSet ? '' : `<p class="rb-addhint">${j ? 'Choose an answer for every rule.' : 'Set every rule to test.'}</p>`}</div></div>`;
        sh.main.querySelectorAll('.rb-act').forEach((b) => { b.onclick = () => { if (running) return; rules[+b.dataset.r].act = b.dataset.a; passedOnce = false; result = null; doneEv = []; shownAt = round.route[0]; save(); draw(`.rb-act[data-r="${b.dataset.r}"][data-a="${b.dataset.a}"]`); foot(); }; });
        sh.main.querySelectorAll('.rb-mv').forEach((b) => { b.onclick = () => { if (running) return; const i = +b.dataset.mv; const k = i + +b.dataset.dir; [rules[i], rules[k]] = [rules[k], rules[i]]; passedOnce = false; result = null; doneEv = []; shownAt = round.route[0]; save(); draw(`.rb-mv[data-mv="${k}"][data-dir="${b.dataset.dir}"]`); foot(); }; });
        if (focus && sh.keys()) (sh.main.querySelector(focus) || sh.main.querySelector('.rb-act'))?.focus();
      }
      function foot() {
        const allSet = rules.every((r) => r.act);
        sh.foot.innerHTML = passedOnce ? `<p class="rb-hint">${j ? 'Safe, and delivered.' : 'Passed.'}</p><button type="button" class="rb-btn alt" data-run ${running ? 'disabled' : ''}>Test again</button><button type="button" class="rb-btn go" data-next>${part < ROUNDS.length - 1 ? 'Next trip' : 'Carry on'} ➜</button>`
          : `<p class="rb-hint">${d.tests ? `Trips tested: ${d.tests}` : (j ? 'Set the rules, then test.' : 'Set the rules, then test.')}</p><button type="button" class="rb-btn go" data-run ${!allSet || running ? 'disabled' : ''}>▶ Test run</button>`;
        const r = sh.foot.querySelector('[data-run]'); if (r) r.onclick = go; const n = sh.foot.querySelector('[data-next]'); if (n) n.onclick = () => done();
      }
      const fresh = sh.guard();
      function go() {
        if (running || !fresh() || !rules.every((r) => r.act)) return; const t = trip(round, rules, j); d.tests++; running = true; doneEv = []; result = null; foot();
        let i = 0;
        const end = () => { running = false; result = t; if (!t.arrived) { /* stays where it stopped */ } else shownAt = round.route[round.route.length - 1];
          if (passed(t)) { passedOnce = true; d.secs = t.seconds; } save(); draw(); foot(); ctx.say(tripLine(t, round, j)); sh.main.querySelector('.rb-planbox .rb-verdict')?.scrollIntoView({ block: 'nearest' }); sh.focusSoon(passedOnce ? '[data-next]' : '.rb-act'); };
        const next = () => { if (ctx.signal.aborted) return; if (i >= t.events.length) { end(); return; } const e = t.events[i]; shownAt = [e.x, e.y]; doneEv = t.events.slice(0, i + 1); i++; draw(); ctx.say(e.text); sh.later(next, 1500); };
        if (sh.still) { doneEv = t.events; if (!t.arrived) shownAt = [t.events[t.events.length - 1].x, t.events[t.events.length - 1].y]; end(); return; }
        next();
      }
      draw(); foot(); sh.focusSoon('.rb-act');
    });
    d.rules = rules.map((r) => ({ ...r })); keep(part + 1, d);
  }
  return { rules: d.rules.map((r) => [r.cond, r.act]), tests: d.tests, secs: d.secs };
}
