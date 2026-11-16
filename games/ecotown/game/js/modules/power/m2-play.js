// Mission 2 on the page: read a forecast chart and mark the hours when the town will be short of power.
// The truth, the checks and the words: m2-forecast.js.
import { forecast, stepHour, isWinter, HOURS } from './model.js';
import { T, clockWord, clockShort } from './words.js';
import { FORECAST_ROUNDS, hoursOf, checkMarks, spells, energyChoices, FC, fcDay, fcNote, checkSay, energyAsk, energySay, shortKwh, revealLine } from './m2-forecast.js';
import { esc, SEED } from './shell.js';
import { C } from './chart.js';

export async function playForecast(d, rs = {}) {
  const { j, pick, kit, ctl } = d; let triesAll = rs.part?.tries || 0, spellCount = rs.part?.spells || 0, kwh = !!rs.part?.kwh;
  for (let r = rs.from || 0; r < FORECAST_ROUNDS.length; r++) {
    const dayId = FORECAST_ROUNDS[r]; const hours = hoursOf(kit, dayId, SEED); const fc = forecast(dayId, SEED);
    const marked = new Set(); let tries = 0; let rings = []; let focus = 0;
    d.mode('desk', 'notes'); d.report(`Forecasting: day ${r + 1} of 3`);
    d.side.innerHTML = `<h3>${esc(fcDay(dayId, j))}</h3><p class="pw-note">${esc(fcNote(dayId, j))}</p><p class="pw-how">${esc(pick(FC.how))}</p><div class="pw-blocks left"><span><i style="background:${C.wind}"></i>${j ? 'wind power' : 'wind'}</span><span><i style="background:${C.sun}"></i>${j ? 'sun power' : 'solar'}</span><span><i class="line" style="background:${C.need}"></i>${j ? 'power needed' : 'demand'}</span><span><i style="background:${C.dark}"></i>${j ? 'marked short' : 'marked short'}</span></div>${j ? '' : '<p class="pw-how">Short = supply bar below the demand line. Hours within 8% either way count either way.</p>'}`;
    const atHour = (i) => { const h = stepHour(kit, fc[i], 0, 'hold', { winter: isWinter(dayId) }); d.view.setHour(fc[i].clock, isWinter(dayId)); d.view.setLit(d.allLit(), true); d.plate(pick(T.day[dayId]), clockWord(h.clock, j)); };
    const reveal = (i) => { const h = stepHour(kit, fc[i], 0, 'hold', { winter: isWinter(dayId) }); d.showHour(h, dayId); };
    const grid = () => `<div class="pw-hours" role="group" aria-label="${j ? 'Hours of the day' : 'Hours'}">${hours.map((h) => `<button type="button" data-h="${h.i}" aria-pressed="${marked.has(h.i)}" class="${rings.includes(h.i) ? 'ring' : ''}" aria-label="${esc(clockWord(h.clock, j))}${marked.has(h.i) ? ': short' : ''}"><b>${esc(clockShort(h.clock, j))}${j ? `<small>${h.clock < 12 ? 'am' : 'pm'}</small>` : ''}</b><span>${marked.has(h.i) ? esc(pick(FC.shortTag)) : ''}</span></button>`).join('')}</div>`;
    const draw = (f) => { d.screen.innerHTML = `${d.chart(dayId, { cursor: focus, marks: hours.map((h) => marked.has(h.i)), rings, h: 150 })}${grid()}`; if (f) d.focusFirst(f); };
    const controls = () => { ctl.innerHTML = `<p>${j ? `${marked.size} hours marked short` : `${marked.size} h marked`}</p><button class="go" type="button" data-act="check">${pick(FC.check)}</button><button type="button" data-clear>${pick(FC.clear)}</button>`; };
    d.say(pick(FC.how), `${fcDay(dayId, j)}. ${fcNote(dayId, j)}`);
    draw(); controls(); atHour(0); d.focusFirst('[data-h="0"]');
    d.setTap((b) => {
      if (b.dataset.h !== undefined) { const i = Number(b.dataset.h); focus = i; if (marked.has(i)) marked.delete(i); else marked.add(i); d.ctx.engine.audio?.tap?.(); draw(`[data-h="${i}"]`); controls(); atHour(i); }
      else if ('clear' in b.dataset) { marked.clear(); draw(); controls(); d.focusFirst('[data-h="0"]'); }
    });
    // arrow keys move along the hours (the grid is two rows of twelve)
    d.setKey((e) => { const a = document.activeElement; if (!a?.dataset || a.dataset.h === undefined) return false; const i = Number(a.dataset.h); const k = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 12, ArrowUp: -12 }[e.key]; if (!k) return false; const n = (i + k + HOURS) % HOURS; focus = n; d.focusFirst(`[data-h="${n}"]`); atHour(n); d.screen.querySelector('.pw-chart').outerHTML = d.chart(dayId, { cursor: focus, marks: hours.map((h) => marked.has(h.i)), rings, h: 150 }); return true; });
    for (;;) {
      const a = await d.press(); if (a !== 'check') continue;
      const res = checkMarks(hours, [...marked]);
      if (!res.right) { tries++; triesAll++; }
      if (!res.right && tries >= 2) rings = res.wrong; // second miss on: ring the hours to look at again (not which way they go)
      const msg = checkSay(res, tries, hours, j); d.say(msg); draw(); controls();
      if (tries >= 3 && !res.right) { // third miss: Florence marks them herself, so the child can see the pattern and carry on
        for (const h of hours) { if (h.truth === 'short') marked.add(h.i); else if (h.truth === 'enough') marked.delete(h.i); } draw(); controls();
      }
      if (res.right) break;
      d.focusFirst(rings.length ? `[data-h="${rings[0]}"]` : '[data-h="0"]');
    }
    d.setTap(null); d.setKey(null);
    // the forecast was right: show the day as it will go, with no battery, and the hours homes would go dark
    const sp = spells(hours); spellCount += sp.length; const rv = revealLine(hours, j); const worst = rv.worst; reveal(worst.i);
    d.screen.innerHTML = `${d.chart(dayId, { cursor: worst.i, marks: hours.map((h) => marked.has(h.i)), h: 150 })}<ul class="pw-lines"><li class="ok">✓ ${esc(checkSay({ right: true }, tries, hours, j))}</li><li class="note">${esc(rv.line)}</li></ul>`;
    // ages 13-17, days 2 and 3: from kW to kWh
    if (!j && r >= 1) {
      const opts = energyChoices(hours, r); const tried = new Set();
      ctl.innerHTML = `<h4>${esc('Energy short over the day?')}</h4>${opts.map((o, n) => `<button type="button" data-kwh="${n}">${o.v} kWh</button>`).join('')}`;
      d.say(energyAsk(hours, j)); d.screen.querySelector('.pw-lines').insertAdjacentHTML('beforeend', `<li class="fix">${esc(energyAsk(hours, j))}</li>`); d.focusFirst('[data-kwh]');
      await new Promise((res) => d.setTap((b) => {
        if (b.dataset.kwh === undefined) return; const o = opts[Number(b.dataset.kwh)]; d.say(energySay(o, hours));
        if (o.ok) { kwh = true; d.setTap(null); res(); } else { tried.add(b.dataset.kwh); b.disabled = true; triesAll++; d.focusFirst('[data-kwh]:not([disabled])'); }
      }));
      d.screen.querySelector('.pw-lines').insertAdjacentHTML('beforeend', `<li class="ok">✓ ${esc(`About ${shortKwh(hours)} kWh short: a battery would need to store that much in advance.`)}</li>`);
    } else d.say(checkSay({ right: true }, tries, hours, j));
    const last = r === FORECAST_ROUNDS.length - 1;
    ctl.innerHTML = `<button class="go" type="button" data-act="next">${last ? 'Finish the mission ➜' : (j ? 'Next forecast ➜' : 'Next forecast ➜')}</button>`; d.focusFirst('[data-act]');
    await d.press();
    rs.done?.(r + 1, { tries: triesAll, kwh, spells: spellCount });
  }
  return { tries: triesAll, kwh, spells: spellCount };
}
