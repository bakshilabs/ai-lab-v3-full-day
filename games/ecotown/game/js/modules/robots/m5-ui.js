// Mission 5 page: the weeding robot. Check how sure it is, then set how sure it must be before it pulls a plant.
import { FIELDS, NAMES, SETTINGS, SURE, sureWords, whyUnsure, weed, best, resultLine, okRow, table, pct, CHECK, plant, FARMER_TIME } from './m5-weeds.js';
import { esc } from './shell.js';
import { stageOf } from './missions.js';

const INK = '#3b2a1e'; const S = `stroke="${INK}" stroke-width="2" stroke-linejoin="round"`;
const DRAW = {
  lettuce: '<ellipse cx="32" cy="46" rx="22" ry="12" fill="#7cc46a" stroke="#3b2a1e" stroke-width="2"/><path d="M14 42c2-14 10-20 18-20s16 6 18 20c-6-6-12-8-18-8s-12 2-18 8z" fill="#9bd57f" stroke="#3b2a1e" stroke-width="2"/><path d="M24 40c2-8 6-12 8-12s6 4 8 12" fill="#c4eba6" stroke="#3b2a1e" stroke-width="2"/>',
  carrot: '<path d="M27 54l5 8l5-8z" fill="#f08a2c" stroke="#3b2a1e" stroke-width="2"/><path d="M32 54c0-10-8-18-14-30M32 54c0-12 0-22 2-34M32 54c2-10 10-18 14-28" stroke="#3a8a3a" stroke-width="2.4" fill="none"/><path d="M18 24l-4 2l4 2l-3 3l5 0M34 20l-3-3l4-1M46 26l4-2l-1 5l4 1" stroke="#5fa85a" stroke-width="3" fill="none" stroke-linecap="round"/>',
  dandelion: '<path d="M32 58l-14-6l6-3l-10-6l9-2l-6-8l12 6l3-6l3 6l12-6l-6 8l9 2l-10 6l6 3z" fill="#5fa85a" stroke="#3b2a1e" stroke-width="2"/><path d="M32 46v-22" stroke="#3a8a3a" stroke-width="3"/><circle cx="32" cy="18" r="9" fill="#f2c531" stroke="#3b2a1e" stroke-width="2"/><circle cx="32" cy="18" r="4" fill="#e0a21c"/>',
  thistle: '<path d="M32 58v-30" stroke="#3a8a3a" stroke-width="3"/><path d="M32 48l-14-4l4-3l-8-4l10-1M32 48l14-4l-4-3l8-4l-10-1" fill="none" stroke="#5fa85a" stroke-width="3" stroke-linecap="round"/><path d="M24 26c0-6 4-8 8-8s8 2 8 8z" fill="#5fa85a" stroke="#3b2a1e" stroke-width="2"/><path d="M24 18l3-10l3 8l2-10l2 10l2-8l3 10z" fill="#9a4fb5" stroke="#3b2a1e" stroke-width="2"/>',
  clover: '<path d="M32 58v-18" stroke="#3a8a3a" stroke-width="3"/><circle cx="24" cy="34" r="8" fill="#5fa85a" stroke="#3b2a1e" stroke-width="2"/><circle cx="40" cy="34" r="8" fill="#5fa85a" stroke="#3b2a1e" stroke-width="2"/><circle cx="32" cy="24" r="8" fill="#5fa85a" stroke="#3b2a1e" stroke-width="2"/><path d="M22 34h4M38 34h4M30 24h4" stroke="#c4eba6" stroke-width="2"/>',
  grass: '<path d="M18 58c2-16 0-30-6-42c8 8 12 22 12 42M30 58c0-18 2-32 4-48c2 16 2 32 2 48M40 58c2-14 6-26 14-36c-6 10-8 22-8 36" fill="#6dbb5c" stroke="#3b2a1e" stroke-width="2"/>',
  chickweed: '<path d="M32 58c-4-10-14-14-20-14M32 58c4-10 14-14 20-14M32 58v-26" stroke="#3a8a3a" stroke-width="2.4" fill="none"/><ellipse cx="16" cy="44" rx="5" ry="3" fill="#7cc46a" stroke="#3b2a1e" stroke-width="1.6"/><ellipse cx="48" cy="44" rx="5" ry="3" fill="#7cc46a" stroke="#3b2a1e" stroke-width="1.6"/><g fill="#fff" stroke="#3b2a1e" stroke-width="1.4"><circle cx="32" cy="28" r="5"/><circle cx="20" cy="36" r="4"/><circle cx="44" cy="36" r="4"/></g>',
  cowparsley: '<path d="M32 58v-30M32 30l-12-10M32 30l12-10M32 30v-14" stroke="#3a8a3a" stroke-width="2.4" fill="none"/><g fill="#fff" stroke="#3b2a1e" stroke-width="1.4"><circle cx="20" cy="18" r="5"/><circle cx="44" cy="18" r="5"/><circle cx="32" cy="12" r="5"/></g><path d="M32 50c-8-2-12-6-16-12M32 46c8-2 12-6 16-12" stroke="#5fa85a" stroke-width="3" fill="none" stroke-linecap="round"/>',
};
const OVER = { hidden: '<path d="M4 50c8-12 22-14 30-8c-4-12 12-16 24-6v20H4z" fill="#a9743f" stroke="#3b2a1e" stroke-width="2"/>', chewed: '<circle cx="22" cy="40" r="4" fill="#efe2c4"/><circle cx="40" cy="44" r="5" fill="#efe2c4"/><circle cx="34" cy="30" r="3" fill="#efe2c4"/>', small: '', feathery: '' };
export function plantSvg(pl, size = 64) {
  const k = pl.hid === 'small' ? 0.62 : 1;
  return `<svg class="rb-plant" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><ellipse cx="32" cy="60" rx="26" ry="4" fill="#8a5a2e" opacity=".5"/><g transform="translate(${32 - 32 * k} ${60 - 60 * k}) scale(${k})">${DRAW[pl.pic]}${OVER[pl.hid] || ''}</g></svg>`;
}
const name = (pl) => NAMES[pl.pic];
const bar = (p, j, line = null) => `<span class="rb-sure" aria-hidden="true"><i style="width:${p}%"></i>${line !== null ? `<b style="left:${line}%"></b>` : ''}</span>${j ? '' : `<small class="rb-pc">${p}%</small>`}`;

export async function playM5(ctx, sh, cur, keep) {
  const j = sh.junior; const d = { checks: 0, f1: null, f2: null, tries: 0, ...(cur?.d || {}) }; let part = cur?.part || 0;
  const steps = ['How sure is it?', 'The lettuce field', 'The carrot field'];
  const setup = (n) => { sh.setup({ mission: { n: 5, icon: '🌱' }, steps, stage: `m5-${n}` }); sh.step(n); };
  // ---------- Part A: you and the robot look at the same plants
  if (part === 0) {
    setup(0); ctx.report({ stage: stageOf(5, 'checking the robot’s confidence') }); d.checks = 0;
    sh.say(j ? 'This robot was trained on thousands of photos of plants. Look at each plant. Is it the crop, or a weed? Then see how sure the robot is.' : 'The robot’s camera model was trained on labelled photos. For each plant, give your label, then compare with the robot’s confidence.');
    for (let k = 0; k < CHECK.length; k++) {
      if (ctx.signal.aborted) return null;
      const pl = plant(CHECK[k]);
      const draw = (ans = null) => {
        const right = ans !== null && (ans === 'weed') === pl.weed;
        sh.main.innerHTML = `<div class="rb-m5a"><div class="rb-panel rb-bigplant"><p class="rb-kicker">Plant ${k + 1} of ${CHECK.length}</p>${plantSvg(pl, 150)}${ans ? `<b>${esc(name(pl).replace(/^./, (c) => c.toUpperCase()))}: ${pl.weed ? 'a weed' : 'the crop'}</b>` : ''}</div>
          <div class="rb-panel rb-robotsays">${ans ? `<p class="rb-verdict ${right ? 'ok' : 'miss'}">${right ? 'You are right.' : 'Not this time.'} It is ${pl.weed ? 'a weed' : 'a lettuce, the crop'}.</p>
            <h3>The robot</h3><div class="rb-surebig">${bar(pl.p, j)}</div><p><b>It is ${esc(sureWords(pl.p))}.</b>${pl.hid ? ` ${esc(whyUnsure[pl.hid])}` : ''}</p>` : `<h3>${j ? 'What do you think?' : 'Your label'}</h3><p>${j ? 'Is this the crop (a lettuce) or a weed?' : 'Crop (lettuce) or weed?'}</p>`}</div></div>`;
      };
      draw(); sh.say(j ? 'Is this a lettuce, or a weed?' : 'Crop or weed?');
      const ans = await sh.buttons('', [{ act: 'crop', label: '🥬 Lettuce (crop)' }, { act: 'weed', label: '🌼 Weed' }]);
      if ((ans === 'weed') === pl.weed) d.checks++;
      draw(ans); ctx.say(`It is ${pl.weed ? 'a weed' : 'a lettuce'}. The robot is ${sureWords(pl.p)}.${pl.hid ? ` ${whyUnsure[pl.hid]}` : ''}`); keep(0, d);
      await sh.buttons('', [{ act: 'n', label: k < CHECK.length - 1 ? 'Next plant' : 'Carry on', go: true }]);
    }
    part = 1; keep(1, d);
  }
  // ---------- Parts B and C: set the threshold and weed a row
  for (; part <= 2; part++) {
    if (ctx.signal.aborted) return null;
    const field = FIELDS[part - 1]; const withAsk = !j && part === 2; let pull = null; let ask = null; let res = null; let ok = false;
    setup(part); ctx.report({ stage: stageOf(5, `weeding the ${field.crop.s} field`) });
    const crop = field.crop[j ? 'j' : 's'];
    sh.say(part === 1 ? (j ? `Here is a row of ${crop}s and weeds, with how sure the robot is about each. A pulled ${crop} is lost for good. A weed left behind can be pulled next week. Choose how sure it must be before it pulls a plant.` : `Set the confidence needed to pull. A pulled ${crop} is lost; a missed weed waits a week. Which mistake costs more?`)
      : withAsk ? `A carrot field. Carrot tops look like cow parsley, so the scores overlap more. Set the pull threshold, and a lower one to flag plants for the farmer, who can check ${FARMER_TIME} in a morning.`
        : `A carrot field. Carrot tops look a lot like some weeds, so the robot is less sure here. Choose again: the best setting may be different.`);
    await sh.wait((done) => {
      const draw = () => {
        const rows = res ? res.rows : field.plants.map((pl) => ({ ...pl, did: null }));
        const out = (r) => (!r.did ? '' : r.did === 'pull' ? (r.weed ? '<em class="ok">Pulled ✓</em>' : '<em class="miss">Crop lost ✗</em>') : r.did === 'flag' ? (r.checked ? `<em class="ask">Flag: farmer ${r.weed ? 'pulled' : 'kept'}</em>` : '<em class="miss">Flag: no time</em>') : (r.weed ? '<em class="ask">Weed left</em>' : '<em class="ok">Kept ✓</em>'));
        const tb = res && !j ? table(res) : null;
        sh.main.innerHTML = `<div class="rb-m5"><div class="rb-panel rb-row"><h3>The ${esc(crop)} row<small>${j ? 'The bar shows how sure the robot is that it is a weed.' : 'Confidence that each plant is a weed.'}</small></h3>
          <ol class="rb-plants">${rows.map((r) => `<li class="${r.did ? (r.did === 'pull' && !r.weed ? 'lost' : r.did === 'pull' ? 'gone' : '') : ''}" aria-label="${esc(name(r))}: robot is ${esc(sureWords(r.p))}${j ? '' : `, ${r.p}%`}">${plantSvg(r, 58)}<b>${esc(name(r))}</b>${bar(r.p, j, pull)}${out(r)}</li>`).join('')}</ol></div>
          <div class="rb-panel rb-setbox"><h3>${j ? 'Pull a plant when the robot is at least…' : 'Pull when confidence ≥'}</h3>
            <div class="rb-sets" role="radiogroup" aria-label="Pull setting">${SETTINGS.map((t) => `<button type="button" role="radio" class="rb-set${pull === t ? ' on' : ''}" data-t="${t}" aria-checked="${pull === t}">${j ? esc(SURE[t]) : `${t}%`}</button>`).join('')}</div>
            ${withAsk ? `<h3>Flag for the farmer from</h3><div class="rb-sets" role="radiogroup" aria-label="Flag setting"><button type="button" role="radio" class="rb-ask${ask === null ? ' on' : ''}" data-a="" aria-checked="${ask === null}">No flags</button>${SETTINGS.filter((t) => pull === null || t < pull).map((t) => `<button type="button" role="radio" class="rb-ask${ask === t ? ' on' : ''}" data-a="${t}" aria-checked="${ask === t}">${t}%</button>`).join('')}</div>` : ''}
            ${res ? `<p class="rb-verdict ${okRow(res) ? 'ok' : 'miss'}" aria-live="polite">${esc(resultLine(field, res, j, withAsk))}</p>` : ''}
            ${tb ? `<table class="rb-conf"><caption>What happened</caption><thead><tr><th></th><th scope="col">Pulled</th>${withAsk ? '<th scope="col">Flagged</th>' : ''}<th scope="col">Left</th></tr></thead><tbody><tr><th scope="row">Weeds (${res.weeds})</th><td class="hit">${tb.weed[0]}</td>${withAsk ? `<td>${tb.weed[1]}</td>` : ''}<td class="${tb.weed[2] ? 'off' : 'zero'}">${tb.weed[2]}</td></tr><tr><th scope="row">${esc(crop)}s (${res.crops})</th><td class="${tb.crop[0] ? 'off' : 'zero'}">${tb.crop[0]}</td>${withAsk ? `<td>${tb.crop[1]}</td>` : ''}<td class="hit">${tb.crop[2]}</td></tr></tbody></table>
              <p class="rb-tunenote">Weeds removed: ${pct(res.weedsPulled + res.weedsByFarmer, res.weeds)}%. Crops lost: ${pct(res.cropsPulled, res.crops)}%.</p>` : ''}</div></div>`;
        sh.main.querySelectorAll('.rb-set').forEach((b) => { b.onclick = () => { pull = +b.dataset.t; if (ask !== null && ask >= pull) ask = null; res = null; draw(); foot(); if (sh.keys()) sh.main.querySelector(`.rb-set[data-t="${pull}"]`)?.focus(); }; });
        sh.main.querySelectorAll('.rb-ask').forEach((b) => { b.onclick = () => { ask = b.dataset.a ? +b.dataset.a : null; res = null; draw(); foot(); if (sh.keys()) sh.main.querySelector(`.rb-ask[data-a="${b.dataset.a}"]`)?.focus(); }; });
      };
      const foot = () => {
        sh.foot.innerHTML = `<p class="rb-hint">${ok ? (j ? 'No crop lost. Try another setting, or carry on.' : 'No crop lost. Tune further or carry on.') : j ? 'Choose a setting, then weed the row.' : 'Set the threshold, then run.'}</p><button type="button" class="rb-btn ${ok ? 'alt' : 'go'}" data-run ${pull === null ? 'disabled' : ''}>🌱 Weed the row</button>${ok ? `<button type="button" class="rb-btn go" data-next>${part === 1 ? 'Next field' : 'Carry on'} ➜</button>` : ''}`;
        sh.foot.querySelector('[data-run]').onclick = run; const n = sh.foot.querySelector('[data-next]'); if (n) n.onclick = () => done();
      };
      const fresh = sh.guard();
      const run = () => {
        if (pull === null || !fresh()) return; res = weed(field, pull, withAsk ? ask : null); d.tries++;
        ok = okRow(res); if (ok) { const keepIt = { pull, ask: withAsk ? ask : null, left: res.weedsLeft, weeds: res.weeds, best: best(field, withAsk).weedsLeft }; if (part === 1) d.f1 = keepIt; else d.f2 = keepIt; }
        keep(part, d); draw(); foot(); ctx.say(resultLine(field, res, j, withAsk)); sh.focusSoon(ok ? '[data-next]' : '.rb-set');
      };
      draw(); foot(); sh.focusSoon('.rb-set');
    });
    keep(part + 1, d);
  }
  return { checks: d.checks, of: CHECK.length, f1: d.f1, f2: d.f2, tries: d.tries };
}
