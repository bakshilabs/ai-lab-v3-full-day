// Mission 1 on the page: keep the scale level. Each ten-minute step the wind, the sun and the town's use change; the
// child steers the town battery (More / Less) so power made equals power used. The model and words: m1-balance.js.
import { BALANCE_ROUNDS, STEPS, FLEX_MIN, FLEX_MAX, BLOCK_KW, ROUND_GOAL, gap, needFlex, hz, clampFlex, judge, darkFor, clockOf, clockText, BAL, flexWord, stateWord, stepSay, roundSay, balanceHint } from './m1-balance.js';
import { C } from './chart.js';
import { esc } from './shell.js';

const STEP_MS = { j: 10000, s: 8000 }; // how long one ten-minute step lasts on screen, with movement on

// The balance scale: power made on the left pan, power used on the right. It tips towards the heavier side.
export function scaleSvg(round, i, flex, j) {
  const w = round.wind[i], s = round.sun[i], u = round.use[i]; const diff = gap(round, i, flex);
  const tilt = Math.max(-14, Math.min(14, -diff * 3.5)); // more made than used: the left pan goes down
  const blocks = (list, x0) => { let out = ''; let n = 0; for (const [count, col, stroke] of list) for (let k = 0; k < count; k++) { const cx = x0 + (n % 4) * 18, cy = -19 - Math.floor(n / 4) * 18; out += `<rect x="${cx}" y="${cy}" width="16" height="16" rx="3" fill="${col}" stroke="${stroke}" stroke-width="1.2"/>`; n++; } return out; };
  const left = blocks([[w, C.wind, '#2f6aa3'], [s, C.sun, '#b07f22'], [Math.max(0, flex), C.battery, '#5b3696']], -35);
  const right = blocks([[u, '#f2a33a', '#a8651a'], [Math.max(0, -flex), C.battery, '#5b3696']], -35);
  const col = diff === 0 ? '#2e9b5a' : '#b5432c';
  return `<svg class="pw-scale" viewBox="0 0 260 200" role="img" aria-label="${esc(`${j ? 'Scale' : 'Balance'}: ${stateWord(diff, j)}`)}" font-family="Inter, system-ui, sans-serif">
    <rect x="122" y="40" width="16" height="140" rx="4" fill="#8a6238"/><rect x="88" y="178" width="84" height="16" rx="6" fill="#7a5a33"/>
    <g class="pw-beam" style="transform: rotate(${tilt.toFixed(1)}deg); transform-origin: 130px 40px">
      <rect x="20" y="35" width="220" height="10" rx="5" fill="#5e4124"/><circle cx="130" cy="40" r="9" fill="${col}" stroke="#3b2a1e" stroke-width="2"/>
      <g transform="translate(60 45)"><g class="pw-pan" style="transform: rotate(${(-tilt).toFixed(1)}deg)"><path d="M-46 80H46L38 90H-38Z" fill="#c79a62" stroke="#5e4124" stroke-width="2"/><path d="M-42 80L0 0L42 80" fill="none" stroke="#5e4124" stroke-width="1.5"/><g transform="translate(0 80)">${left}</g></g></g>
      <g transform="translate(200 45)"><g class="pw-pan" style="transform: rotate(${(-tilt).toFixed(1)}deg)"><path d="M-46 80H46L38 90H-38Z" fill="#c79a62" stroke="#5e4124" stroke-width="2"/><path d="M-42 80L0 0L42 80" fill="none" stroke="#5e4124" stroke-width="1.5"/><g transform="translate(0 80)">${right}</g></g></g>
    </g>
    <text x="60" y="14" font-size="12" font-weight="800" fill="#3b2a1e" text-anchor="middle">${esc(j ? BAL.made.j : BAL.made.s)}</text><text x="200" y="14" font-size="12" font-weight="800" fill="#3b2a1e" text-anchor="middle">${esc(j ? BAL.used.j : BAL.used.s)}</text>
  </svg>`;
}
const legendHtml = (j) => `<div class="pw-blocks"><span><i style="background:${C.wind}"></i>${j ? 'wind' : 'wind'}</span><span><i style="background:${C.sun}"></i>sun</span><span><i style="background:${C.battery}"></i>${j ? 'battery' : 'battery'}</span><span><i style="background:#f2a33a"></i>${j ? 'homes and school' : 'demand'}</span>${j ? '' : `<span>1 block = ${BLOCK_KW} kW</span>`}</div>`;

export async function playBalance(d) {
  const { j, pick, ctl, prog } = d; let total = 0, of = 0;
  for (let r = 0; r < BALANCE_ROUNDS.length; r++) {
    const round = BALANCE_ROUNDS[r]; let tries = 0;
    for (;;) {
      d.report(`Balance: round ${r + 1} of 3${tries ? `, try ${tries + 1}` : ''}`);
      const flexes = await playRound(d, round, r, tries >= 3); const res = judge(round, flexes);
      if (!res.met) tries++;
      const hint = res.met ? '' : balanceHint(tries, res, j);
      d.screen.innerHTML = `<h3>${esc(pick(BAL.round[round.id]))}</h3>${timeline(round, res.steps, -1, j)}<ul class="pw-lines"><li class="${res.met ? 'ok' : ''}">${res.met ? '✓ ' : ''}${esc(roundSay(res, j))}</li>${hint ? `<li class="fix">${esc(hint)}</li>` : ''}</ul>`;
      d.say(roundSay(res, j), hint);
      const last = r === BALANCE_ROUNDS.length - 1;
      ctl.innerHTML = res.met ? `<button class="go" type="button" data-act="next">${last ? 'Finish the mission ➜' : 'Next round ➜'}</button><button type="button" data-act="again">${j ? 'Play this round again' : 'Replay round'}</button>`
        : `<button class="go" type="button" data-act="again">${j ? 'Try this round again' : 'Try again'}</button>`;
      d.focusFirst('[data-act]'); const a = await d.press();
      if (a === 'next') { total += res.level; of += res.of; break; }
    }
  }
  prog.hidden = true;
  return { level: total, of };
}

function timeline(round, steps, cur, j) {
  return `<ol class="pw-steps" aria-label="${j ? 'Ten-minute steps' : 'Steps'}">${round.use.map((_, i) => { const s = steps[i]; const mark = !s ? '' : s.level ? '✓' : s.diff < 0 ? '▼' : '▲'; const cls = !s ? '' : s.level ? 'ok' : 'bad';
    return `<li class="${cls}${i === cur ? ' now' : ''}"><b>${esc(clockText(round, i, j))}</b><span aria-label="${!s ? '' : s.level ? 'level' : s.diff < 0 ? 'short' : 'too much'}">${mark}</span></li>`; }).join('')}</ol>`;
}

// One round: eight steps. Resolves with the battery setting at the end of each step.
function playRound(d, round, r, guide) {
  const { j, pick, reduce, ctl, prog, kit, view } = d;
  d.mode('desk', 'scale'); const flexes = []; const steps = []; let i = 0, flex = r === 0 ? 0 : clampFlex(needFlex(round, 0) - 2), t = 0, paused = false, note = '';
  const ms = j ? STEP_MS.j : STEP_MS.s;
  d.say(pick(BAL.how), `${pick(BAL.round[round.id])}. ${pick(BAL.roundNote[round.id])}`);
  const drawSide = () => {
    const diff = gap(round, i, flex);
    d.side.innerHTML = `${scaleSvg(round, i, flex, j)}<p class="pw-state ${diff === 0 ? 'ok' : 'bad'}" aria-live="polite">${esc(stateWord(diff, j))}</p>${j ? '' : `<p class="pw-hz">${hz(diff).toFixed(2)} Hz <small>keep 49.80–50.20</small></p>`}${legendHtml(j)}`;
  };
  const drawScreen = () => {
    const ev = round.events[i];
    d.screen.innerHTML = `<h3>${esc(pick(BAL.round[round.id]))}<small>${j ? `${ROUND_GOAL} of ${STEPS} level to pass` : `goal ${ROUND_GOAL}/${STEPS} balanced`}</small></h3>${timeline(round, steps, i, j)}
      <div class="pw-now"><b>${esc(clockText(round, i, j))}</b> ${ev ? `<span class="pw-event">⚡ ${esc(pick(BAL.event[ev]))}</span>` : `<span>${esc(pick(BAL.roundNote[round.id]))}</span>`}</div>${note ? `<p class="pw-was">${j ? 'Last step: ' : 'Last step: '}${esc(note)}</p>` : ''}
      ${j ? '' : `<table class="pw-table"><tr><th></th><th>Wind</th><th>Solar</th><th>Demand</th></tr><tr><th>kW</th><td>${round.wind[i] * BLOCK_KW}</td><td>${round.sun[i] * BLOCK_KW}</td><td>${round.use[i] * BLOCK_KW}</td></tr></table>`}`;
  };
  const drawCtl = () => {
    const target = needFlex(round, i);
    ctl.innerHTML = `<div class="pw-flex" role="group" aria-label="${j ? 'Town battery' : 'Battery output'}"><button type="button" data-flex="1" aria-keyshortcuts="ArrowUp">${pick(BAL.more)}</button>
      <div class="pw-track" aria-hidden="true">${Array.from({ length: FLEX_MAX - FLEX_MIN + 1 }, (_, k) => FLEX_MAX - k).map((v) => `<i class="${v === flex ? 'on' : ''} ${v === 0 ? 'zero' : v < 0 ? 'neg' : ''} ${guide && v === target ? 'guide' : ''}">${guide && v === target ? '★' : v === 0 ? '0' : ''}</i>`).join('')}</div>
      <button type="button" data-flex="-1" aria-keyshortcuts="ArrowDown">${pick(BAL.less)}</button></div>
      <p class="pw-flexword" aria-live="polite">${esc(flexWord(flex, j))}</p>
      <div class="pw-row">${reduce ? `<button class="go" type="button" data-ready>${pick(BAL.next)}</button>` : `<button class="go" type="button" data-ready>${pick(BAL.ready)}</button><button type="button" data-pause>${paused ? 'Carry on ▶' : 'Pause'}</button>`}</div>`;
  };
  const light = () => {
    const diff = gap(round, i, flex); const n = kit.homes.length; const dark = darkFor(round, i, diff, n);
    const { h, m } = clockOf(round, i); view.setHour(h + m / 60, false); view.setLit(kit.homes.map((_, k) => k < n - dark), diff >= 0);
    d.plate(j ? `Round ${r + 1}` : `Round ${r + 1}`, clockText(round, i, j));
  };
  const show = () => { drawSide(); drawCtl(); light(); };
  return new Promise((res) => {
    const startStep = () => { t = 0; drawScreen(); show(); const ev = round.events[i]; if (ev) d.ctx.say(pick(BAL.event[ev])); prog.hidden = reduce; };
    const commit = () => {
      const diff = gap(round, i, flex); flexes.push(flex); steps.push({ i, diff, level: diff === 0 });
      note = stepSay(diff, j);
      d.ctx.engine.audio?.tap?.(); i++;
      if (i >= STEPS) { d.setTick(null); d.setTap(null); d.setKey(null); prog.hidden = true; res(flexes); return; }
      startStep(); d.focusFirst('[data-ready]');
    };
    const set = (k) => { const nf = clampFlex(flex + k); if (nf === flex) return; flex = nf; drawSide(); drawCtl(); light(); d.focusFirst(`[data-flex="${k > 0 ? 1 : -1}"]`); };
    d.setTap((b) => {
      if (b.dataset.flex) set(Number(b.dataset.flex));
      else if ('ready' in b.dataset) commit();
      else if ('pause' in b.dataset) { paused = !paused; drawCtl(); d.focusFirst('[data-pause]'); }
    });
    d.setKey((e) => { if (e.key === 'ArrowUp' || e.key === '+' || e.key === '=') { set(1); return true; } if (e.key === 'ArrowDown' || e.key === '-') { set(-1); return true; } return false; });
    d.setTick(reduce ? null : (dt) => { if (paused) return; t += dt * 1000; prog.firstElementChild.style.width = `${Math.max(0, 100 - (t / ms) * 100).toFixed(0)}%`; if (t >= ms) commit(); });
    startStep(); d.focusFirst('[data-flex="1"]');
  });
}
