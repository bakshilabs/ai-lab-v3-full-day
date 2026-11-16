// Mission 6 on the page: storm night. Isolate the fault, restore by priority on the battery, then repair safely and
// bring the last homes back one area at a time. The network, rules and words: m6-storm.js.
import { SECTIONS, IDS, FAULT, BATTERY_ONLY, GRID_BACK, SURGE, live, loadOf, indicators, r1Start, r1Flip, r1Done, r1Say, r1Hint, r2Start, r2Flip, r2Done, r2Best, r2Say, r2Hint, prioOn, crewSteps, crewShuffled, crewCheck, crewWord, crewSay, r3Start, r3Switch, r3Done, r3Say, STORM, WHO_ICON, whoWord, waiting, waitSay, KWB, PREP, PREP_WORD, prepCheck, prepSay } from './m6-storm.js';
import { esc } from './shell.js';

const HOMES_OF = ['north', 'medical', 'mill', 'river']; const SHARE = { north: 3, medical: 1, mill: 2, river: 3 };
// Which of the town's homes sit on which section (shared out in proportion, nearest the school first).
export function homeGroups(n) {
  const out = []; const tot = HOMES_OF.reduce((a, k) => a + SHARE[k], 0); let acc = 0;
  for (const k of HOMES_OF) { const from = Math.round((acc / tot) * n); acc += SHARE[k]; const to = Math.round((acc / tot) * n); for (let i = from; i < to; i++) out[i] = k; }
  return out;
}

export function networkSvg(sw, { flags = null, j = true, cap = 0, battery = false, mended = false } = {}) {
  const L = live(sw); const ys = { 1: 38, 2: 98, 3: 158 }; const xA = 112, xB = 282;
  let s = `<svg class="pw-net" viewBox="0 0 440 196" role="img" aria-label="${j ? 'The town’s power lines' : 'Network diagram'}" font-family="Inter, system-ui, sans-serif">`;
  s += `<rect x="6" y="20" width="62" height="156" rx="8" fill="#2b3358"/><text x="37" y="44" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">${j ? 'Sub-' : 'Sub-'}</text><text x="37" y="56" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">station</text><text x="37" y="100" font-size="22" text-anchor="middle">${battery ? '🔋' : '⚡'}</text><text x="37" y="122" fill="#fff" font-size="9" font-weight="700" text-anchor="middle">${battery ? (j ? 'battery' : 'battery only') : (j ? 'big grid' : 'grid supply')}</text>`;
  if (cap) s += `<text x="37" y="150" fill="#ffd66b" font-size="10" font-weight="800" text-anchor="middle">${j ? `${cap} blocks` : `${cap * KWB} kW`}</text>`;
  for (const n of [1, 2, 3]) {
    const y = ys[n]; const a = `${n}A`, b = `${n}B`; const col = (id) => (L[id] ? '#e3a21a' : '#9aa0a5');
    s += `<path d="M68 ${y}H${xA - 10}" stroke="${L[a] || sw[a] ? '#e3a21a' : '#9aa0a5'}" stroke-width="5"/>`;
    s += `<path d="M${xA + 10} ${y}H${xB - 10}" stroke="${col(a)}" stroke-width="5"/>`;
    s += `<path d="M${xB + 10} ${y}H428" stroke="${col(b)}" stroke-width="5" ${b === FAULT && !L[b] && !mended ? 'stroke-dasharray="7 5"' : ''}/>`;
    for (const [id, x] of [[a, xA], [b, xB]]) {
      s += sw[id] ? `<circle cx="${x}" cy="${y}" r="9" fill="#2e9b5a" stroke="#1a5a34" stroke-width="2"/><path d="M${x - 9} ${y}H${x + 9}" stroke="#fff" stroke-width="3"/>` : `<circle cx="${x}" cy="${y}" r="9" fill="#fffaf0" stroke="#b5432c" stroke-width="2.5"/><path d="M${x - 6} ${y + 4}L${x + 6} ${y - 6}" stroke="#b5432c" stroke-width="3"/>`;
      s += `<text x="${x}" y="${y - 13}" font-size="10" font-weight="800" fill="#3b2a1e" text-anchor="middle">${id}</text>`;
      if (flags?.[id]) s += `<path d="M${x + 12} ${y + 6}V${y - 18}" stroke="#3b2a1e" stroke-width="1.5"/><path d="M${x + 12} ${y - 18}h12l-4 5 4 5h-12z" fill="#d62f1f"/>`;
    }
    for (const [id, x] of [[a, (xA + xB) / 2], [b, 362]]) {
      const sec = SECTIONS[id]; const on = L[id];
      s += `<rect x="${x - 36}" y="${y + 6}" width="72" height="24" rx="6" fill="${on ? '#ffe9a8' : '#3a4060'}" stroke="${sec.prio ? '#c8553d' : '#5e4936'}" stroke-width="${sec.prio ? 2.5 : 1.2}"/><text x="${x - 28}" y="${y + 23}" font-size="13">${WHO_ICON[sec.who]}</text><text x="${x + 32}" y="${y + 22}" font-size="10" font-weight="800" fill="${on ? '#3b2a1e' : '#fff'}" text-anchor="end">${j ? `${sec.load}▮` : `${sec.load * KWB} kW`}</text>`;
    }
    if (n === 3 && !mended) s += `<text x="404" y="${y - 6}" font-size="16">🌳</text>`;
  }
  return s + '</svg>';
}

const allOn = () => Object.fromEntries(IDS.map((id) => [id, true]));

export async function playStorm(d) {
  const { j, pick, ctl, kit } = d; let trips = 0;
  const groups = homeGroups(kit.homes.length); const whoToId = { north: '1B', medical: '2B', mill: '3A', river: '3B' };
  const town = (sw) => { const L = live(sw); d.view.setHour(21, true); d.view.setLit(kit.homes.map((_, i) => !!L[whoToId[groups[i]]]), !!L['2A']); d.plate(j ? 'Storm night' : 'Storm night', j ? '9 pm' : '21:00'); };
  const meter = (sw, cap) => { const used = loadOf(sw); return `<div class="pw-meter" aria-label="${esc(j ? `Using ${used} of ${cap} blocks` : `Load ${used * KWB} of ${cap * KWB} kW`)}"><i><u style="width:${Math.min(100, (used / cap) * 100).toFixed(0)}%"></u></i><b>${j ? `${used} of ${cap} blocks` : `${used * KWB} / ${cap * KWB} kW`}</b></div>`; };
  const switches = (sw, lockFault) => `<div class="pw-switches" role="group" aria-label="${j ? 'Switches' : 'Switchgear'}">${IDS.map((id) => `<button type="button" data-sw="${id}" aria-pressed="${!!sw[id]}" ${lockFault && id === FAULT ? 'disabled' : ''}><i aria-hidden="true">${WHO_ICON[SECTIONS[id].who]}</i><span><b>${id}</b> ${esc(whoWord(id, j))}${SECTIONS[id].prio ? ` <small>${j ? 'keeps people safe' : 'priority'}</small>` : ''}</span><em>${sw[id] ? (j ? 'On' : 'Closed') : (j ? 'Off' : 'Open')}</em></button>`).join('')}</div>`;

  // ---- round 1: a storm is coming. Choose what helps.
  {
    d.mode('desk', 'switches'); d.report('Storm night: getting ready'); const picked = new Set(); let tries = 0;
    town(allOn());
    const draw = (msg, f) => {
      d.side.innerHTML = `<h3>${esc(pick(STORM.r0))}</h3><p class="pw-how">${esc(pick(STORM.r0how))}</p>`;
      d.screen.innerHTML = `<div class="pw-prep" role="group" aria-label="${j ? 'Things to do' : 'Preparations'}">${PREP.map((id) => `<button type="button" data-prep="${id}" aria-pressed="${picked.has(id)}"><i aria-hidden="true">${picked.has(id) ? '✓' : ''}</i><span>${esc(pick(PREP_WORD[id]))}</span></button>`).join('')}</div>${msg ? `<p class="pw-msg">${esc(msg)}</p>` : ''}`;
      ctl.innerHTML = `<p>${j ? `${picked.size} chosen` : `${picked.size} selected`}</p><button class="go" type="button" data-act="check" ${picked.size ? '' : 'disabled'}>${j ? 'Ready for the storm ➜' : 'Check the plan ➜'}</button>`;
      if (f) d.focusFirst(f);
    };
    d.say(pick(STORM.r0how)); draw('', '[data-prep]');
    d.setTap((b) => { if (!b.dataset.prep) return; const id = b.dataset.prep; if (picked.has(id)) picked.delete(id); else picked.add(id); d.ctx.engine.audio?.tap?.(); draw('', `[data-prep="${id}"]`); });
    for (;;) {
      await d.press(); const res = prepCheck([...picked]); if (!res.done) tries++;
      if (!res.done && tries >= 3) { picked.clear(); for (const id of ['charge', 'crews', 'call', 'shelter']) picked.add(id); const m = j ? 'Here is a good plan: fill the battery, get crews ready, phone the homes that need help, open the shelter. Check it.' : 'A sound plan is selected: charge, crews on standby, calls to vulnerable customers, open the shelter. Check it.'; d.say(m); draw(m, '[data-act]'); continue; }
      const m = prepSay(res, tries, [...picked], j); d.say(m);
      if (res.done) { draw(m); break; }
      draw(m, '[data-prep]');
    }
    d.setTap(null);
    ctl.innerHTML = `<button class="go" type="button" data-act="next">${j ? 'Here comes the storm ➜' : 'The storm arrives ➜'}</button>`; d.focusFirst('[data-act]'); await d.press();
  }
  // ---- round 2: find and isolate the fault
  {
    d.mode('desk', 'switches'); d.report('Storm night: finding the fault'); let sw = r1Start(); let mistakes = 0; const flags = indicators();
    const draw = (msg, f) => { d.side.innerHTML = `<h3>${esc(pick(STORM.r1))}</h3>${switches(sw, false)}`; d.screen.innerHTML = `${networkSvg(sw, { flags, j })}<p class="pw-note">${esc(j ? 'Red flags: the fault went past here.' : 'Red flags: fault passage indicators.')}</p>${msg ? `<p class="pw-msg">${esc(msg)}</p>` : ''}`; ctl.innerHTML = r1Done(sw) ? `<button class="go" type="button" data-act="next">${j ? 'Next round ➜' : 'Next round ➜'}</button>` : `<p>${esc(j ? 'Switch the right one off, then switch the rest back on.' : 'Open the right switch, then restore the healthy section.')}</p>`; town(sw); if (f) d.focusFirst(f); };
    d.say(pick(STORM.r1how)); draw('', '[data-sw="1A"]');
    await new Promise((res) => {
      d.setTap((b) => {
        if (b.dataset.sw) {
          const id = b.dataset.sw; const out = r1Flip(sw, id); sw = out.sw; let msg = waiting(sw, id) ? waitSay(id, j) : r1Say(out.event, sw, id, mistakes, j);
          if (out.event === 'tripped' || (out.event === 'opened' && id !== FAULT)) { mistakes++; if (out.event === 'tripped') trips++; if (mistakes >= 2) msg += ` ${r1Hint(mistakes, j)}`; }
          d.say(msg); draw(msg, r1Done(sw) ? '[data-act]' : `[data-sw="${id}"]`);
        }
      });
      d.press().then(res);
    });
  }
  // ---- round 3: priorities on battery power
  {
    d.report('Storm night: who gets power first'); let sw = r2Start(); let tries = 0;
    const draw = (msg, f) => { d.side.innerHTML = `<h3>${esc(pick(STORM.r2))}</h3>${switches(sw, true)}`; d.screen.innerHTML = `${networkSvg(sw, { j, cap: BATTERY_ONLY, battery: true })}${meter(sw, BATTERY_ONLY)}${msg ? `<p class="pw-msg">${esc(msg)}</p>` : ''}${r2Done(sw) ? `<p class="pw-note">ℹ️ ${esc(pick(STORM.psr))}</p>` : ''}`; ctl.innerHTML = r2Done(sw) ? `<button class="go" type="button" data-act="next">${j ? 'Next round ➜' : 'Next round ➜'}</button>` : `<p>${esc(j ? 'Who needs power most tonight?' : 'Restore in priority order.')}</p>`; town(sw); if (f) d.focusFirst(f); };
    d.say(pick(STORM.r2how)); draw('', '[data-sw="1A"]');
    await new Promise((res) => {
      d.setTap((b) => {
        if (!b.dataset.sw) return; const id = b.dataset.sw; const out = r2Flip(sw, id); sw = out.sw; let msg = r2Say(out.event, sw, j, out.load);
        if (out.event === 'overload') { tries++; trips++; msg += ` ${r2Hint(tries, j)}`; }
        else if (waiting(sw, id)) msg = waitSay(id, j);
        else if (!prioOn(sw) && out.event === 'closed' && !SECTIONS[id].prio && tries < 9) { msg = j ? `${whoWord(id, j)} are on. Is there anyone who needs power more?` : `${whoWord(id, j)} restored. Is all priority load on?`; }
        d.say(msg || (j ? `${loadOf(sw)} of ${BATTERY_ONLY} blocks used.` : `${loadOf(sw) * KWB} of ${BATTERY_ONLY * KWB} kW.`)); draw(msg, r2Done(sw) ? '[data-act]' : `[data-sw="${id}"]`);
        if (r2Done(sw) && r2Best(sw)) d.focusFirst('[data-act]');
      });
      d.press().then(res);
    });
  }
  // ---- round 4: the crew's safe order, then bring the last homes back one area at a time
  {
    d.report('Storm night: mending the line'); const want = crewSteps(j); const cards = crewShuffled(j); let order = []; let tries = 0;
    d.mode('desk', 'switches');
    const draw = (msg, f) => {
      d.side.innerHTML = `<h3>${esc(pick(STORM.r3))}</h3><p class="pw-how">${esc(j ? 'Tap the jobs in the order the crew must do them.' : 'Select the steps in safe order.')}</p><div class="pw-cards">${cards.map((c) => `<button type="button" data-card="${c}" ${order.includes(c) ? 'disabled' : ''}>${esc(crewWord(c, j))}</button>`).join('')}</div>`;
      d.screen.innerHTML = `<h3>${j ? 'The crew’s order' : 'Safe working sequence'}</h3><ol class="pw-order">${want.map((_, n) => `<li>${order[n] ? esc(crewWord(order[n], j)) : '<span>…</span>'}</li>`).join('')}</ol>${msg ? `<p class="pw-msg">${esc(msg)}</p>` : ''}`;
      ctl.innerHTML = `<button class="go" type="button" data-act="check" ${order.length === want.length ? '' : 'disabled'}>${j ? 'Check the order ➜' : 'Check ➜'}</button><button type="button" data-undo ${order.length ? '' : 'disabled'}>${j ? 'Undo' : 'Undo'}</button><button type="button" data-clear ${order.length ? '' : 'disabled'}>${j ? 'Start again' : 'Clear'}</button>`;
      if (f) d.focusFirst(f);
    };
    let sw = { ...r3Start(), '3B': false }; town(sw);
    d.say(pick(STORM.r3how)); draw('', '[data-card]');
    d.setTap((b) => {
      if (b.dataset.card) { order.push(b.dataset.card); d.ctx.say(crewWord(b.dataset.card, j)); draw('', order.length === want.length ? '[data-act]' : '[data-card]:not([disabled])'); }
      else if ('undo' in b.dataset) { order.pop(); draw('', '[data-card]:not([disabled])'); }
      else if ('clear' in b.dataset) { order = []; draw('', '[data-card]'); }
    });
    for (;;) {
      await d.press(); const res = crewCheck(order, j); if (!res.done) tries++;
      if (!res.done && tries >= 3) { order = [...want]; const msg = j ? 'Here is the safe order. Read it through, then check it.' : 'The safe sequence is shown. Read it, then check.'; d.say(msg); draw(msg, '[data-act]'); continue; }
      const msg = crewSay(res, tries, j); d.say(msg);
      if (res.done) break;
      draw(msg, '[data-undo]');
    }
    // the line is mended: the grid is back. North homes and River Row have been off for hours.
    const draw2 = (msg, f) => {
      d.side.innerHTML = `<h3>${esc(pick(STORM.r3))}</h3>${switches(sw, true)}`;
      d.screen.innerHTML = `${networkSvg(sw, { j, cap: GRID_BACK, mended: true })}${meter(sw, GRID_BACK)}<p class="pw-note">${esc(j ? `After a long cut, an area needs half as much again for a few minutes when it comes back on.` : `Cold load pickup: a restored area briefly draws ${SURGE}× its normal load.`)}</p>${msg ? `<p class="pw-msg">${esc(msg)}</p>` : ''}`;
      ctl.innerHTML = r3Done(sw) ? `<button class="go" type="button" data-act="next">Finish the mission ➜</button>` : `${['1B', '3B'].filter((id) => !sw[id]).map((id) => `<button type="button" data-on="${id}">${j ? 'Switch on' : 'Close'} ${esc(whoWord(id, j))}</button>`).join('')}${!sw['1B'] && !sw['3B'] ? `<button type="button" data-on="1B,3B">${j ? 'Switch both on together' : 'Close both together'}</button>` : ''}`;
      d.side.querySelectorAll('button').forEach((x) => { x.disabled = true; });
      if (f) d.focusFirst(f);
    };
    const lead = j ? 'The line is mended and the big power line is back. Bring back North homes and River Row.' : 'Repair complete and grid supply restored. Restore the remaining load.';
    d.say(lead); draw2(lead, '[data-on]');
    await new Promise((res) => {
      d.setTap((b) => {
        if (!b.dataset.on) return; const ids = b.dataset.on.split(','); const out = r3Switch(sw, ids); if (out.event === 'overload') trips++; sw = out.sw;
        const msg = r3Say(out.event, out.peak, out.now, j); d.say(msg); town(sw); draw2(msg, r3Done(sw) ? '[data-act]' : '[data-on]');
      });
      d.press().then(res);
    });
  }
  d.setTap(null);
  return { trips };
}
