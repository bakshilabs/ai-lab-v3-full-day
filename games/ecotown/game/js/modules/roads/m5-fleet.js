// Mission 5, "A shared fleet": three rounds on a map of the town. First choose how many cars; then where they wait;
// then where they charge. Run the morning each time and read the waits and the empty driving (ages 13–17 also see
// the trade-off between the number of cars and the longest wait as a chart). Rules and words: fleet.js.
import { PLACES, WAIT_SPOTS, CHARGERS, CARS, START, roundsFor, GOAL, M5, simulate, meets, curve, shareWords, idleWords, fleetSay, cleanPlan } from './fleet.js';
import { esc } from './kit.js';

const W = 800, H = 420, X0 = 70, Y0 = 50, DX = 94, DY = 100;
const at = (id) => ({ x: X0 + PLACES[id].x * DX, y: Y0 + PLACES[id].y * DY });

function map(plan, round, res, j) {
  const o = [`<rect width="${W}" height="${H}" fill="#cfe6b8"/>`];
  for (let y = 0; y <= 3; y++) o.push(`<rect x="${X0 - 10}" y="${Y0 + y * DY - 10}" width="${7 * DX + 20}" height="20" rx="6" fill="#8a9099"/>`);
  for (let x = 0; x <= 7; x++) o.push(`<rect x="${X0 + x * DX - 10}" y="${Y0 - 10}" width="20" height="${3 * DY + 20}" rx="6" fill="#8a9099"/>`);
  for (const id of Object.keys(PLACES)) {
    const p = at(id); const waitHere = plan.spots.includes(id), chargeHere = round.charge && plan.charger === id;
    const worst = res && res.worst && res.longest > 0 && res.worst.from === id;
    o.push(`<g transform="translate(${p.x} ${p.y})">${worst ? '<circle r="46" fill="#c8553d" opacity=".25"/>' : ''}<circle r="32" fill="#fffaf0" stroke="${waitHere ? '#1f7f49' : '#b08a55'}" stroke-width="${waitHere ? 6 : 3}"/><text y="11" font-size="30" text-anchor="middle">${PLACES[id].icon}</text>
      <rect x="-60" y="36" width="120" height="24" rx="8" fill="#fffaf0" opacity=".92"/><text y="54" font-size="16" font-weight="800" text-anchor="middle" fill="#3b2a1e">${esc(j ? PLACES[id].name.j.replace(' (edge of town)', '') : PLACES[id].name.s.replace(' (edge of town)', ''))}</text>
      ${waitHere ? `<g transform="translate(26 -30)"><rect x="-22" y="-14" width="44" height="28" rx="8" fill="#1f7f49"/><text y="6" font-size="16" font-weight="800" text-anchor="middle" fill="#fff">🚗${Math.ceil(plan.cars / plan.spots.length)}</text></g>` : ''}
      ${chargeHere ? '<g transform="translate(-30 -30)"><circle r="16" fill="#ffd166" stroke="#3b2a1e" stroke-width="2"/><text y="7" font-size="18" text-anchor="middle">⚡</text></g>' : ''}
      ${worst ? `<g transform="translate(0 -52)"><rect x="-74" y="-16" width="148" height="28" rx="8" fill="#c8553d"/><text y="4" font-size="15" font-weight="800" text-anchor="middle" fill="#fff">${j ? 'Longest wait' : `Longest: ${res.longest} min`}</text></g>` : ''}</g>`);
  }
  return `<svg class="rd-pic" viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of the town: where the shared cars wait${round.charge ? ' and charge' : ''}" font-family="Inter, Arial, sans-serif">${o.join('')}</svg>`;
}
// the trade-off chart for ages 13–17: longest wait (minutes) against the number of cars
function chart(plan, round) {
  const pts = curve(plan, !!round.charge, !!round.peak); const w = 360, h = 190, x0 = 46, y0 = 16, maxY = Math.ceil(Math.max(20, ...pts.map((p) => p.longest)) / 10) * 10;
  const X = (c) => x0 + ((c - CARS.min) / (CARS.max - CARS.min)) * (w - x0 - 10), Y = (m) => y0 + (1 - Math.min(m, maxY) / maxY) * (h - y0 - 30);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.cars).toFixed(1)} ${Y(p.longest).toFixed(1)}`).join(' '); const me = pts.find((p) => p.cars === plan.cars);
  return `<svg class="rd-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Chart: the longest wait for each number of cars" font-family="Inter, Arial, sans-serif"><rect width="${w}" height="${h}" fill="#fffaf0"/>
    <line x1="${x0}" y1="${Y(round.goal.wait)}" x2="${w - 10}" y2="${Y(round.goal.wait)}" stroke="#1f7f49" stroke-width="2" stroke-dasharray="6 4"/><text x="${w - 12}" y="${Y(round.goal.wait) - 5}" font-size="12" font-weight="700" text-anchor="end" fill="#1f7442">goal ${round.goal.wait} min</text>
    <path d="${line}" fill="none" stroke="#2f6fd8" stroke-width="3"/>${me ? `<circle cx="${X(me.cars)}" cy="${Y(me.longest)}" r="7" fill="#c8553d" stroke="#fff" stroke-width="2"/>` : ''}
    <line x1="${x0}" y1="${h - 30}" x2="${w - 10}" y2="${h - 30}" stroke="#5e4936"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${h - 30}" stroke="#5e4936"/>
    ${[CARS.min, 6, 10, CARS.max].map((c) => `<text x="${X(c)}" y="${h - 14}" font-size="12" text-anchor="middle" fill="#3b2a1e">${c}</text>`).join('')}<text x="${(x0 + w) / 2}" y="${h - 1}" font-size="12" font-weight="700" text-anchor="middle" fill="#3b2a1e">cars</text>
    ${[0, Math.round(maxY / 2), maxY].map((m) => `<text x="${x0 - 6}" y="${Y(m) + 4}" font-size="12" text-anchor="end" fill="#3b2a1e">${m}</text>`).join('')}<text x="12" y="${(y0 + h - 30) / 2}" font-size="12" font-weight="700" text-anchor="middle" fill="#3b2a1e" transform="rotate(-90 12 ${(y0 + h - 30) / 2})">longest wait (min)</text></svg>`;
}

export async function fleetMission(K) {
  const { j, pick, say, swap, tray, stage } = K; let plan = cleanPlan(START); let runs = 0, res = null; const ROUNDS = roundsFor(j);
  for (let ri = 0; ri < ROUNDS.length; ri++) {
    const round = ROUNDS[ri]; let prev = null; res = null; let tries = 0;
    K.ctx.report({ stage: `Mission 5: round ${ri + 1} of ${ROUNDS.length} (${round.id})` });
    const card = () => `<div class="rd-map"><div class="rd-viewbar"><b>${esc(pick(GOAL[round.id]))}</b><span class="rd-step">${ri + 1} of ${ROUNDS.length}</span></div><div class="rd-frame">${map(plan, round, res, j)}</div>
      ${res ? `<div class="rd-fnums"><span><small>${j ? 'Longest wait' : 'Longest wait'}</small><b>${res.longest} min</b></span>${j ? '' : `<span><small>Average wait</small><b>${res.average} min</b></span>`}<span><small>${j ? 'Driving with nobody inside' : 'Empty driving'}</small><b>${j ? shareWords(res.emptyPct) : `${res.emptyPct}%`}</b></span><span><small>${j ? 'Cars standing idle' : 'Cars busy'}</small><b>${j ? idleWords(res.busyPct) : `${res.busyPct}%`}</b></span></div>` : ''}
      ${!j && res ? `${chart(plan, round)}<p class="rd-does">One more car can now and then mean a longer wait: it changes which car answers each call. Real fleet data is bumpy too.</p>` : ''}</div>`;
    const controls = () => `<div class="rd-sets">
        <div class="rd-set" role="group" aria-label="Number of cars"><b>${j ? 'How many cars' : 'Fleet size'}</b><button type="button" data-cars="-1" aria-label="One car fewer" ${plan.cars <= CARS.min ? 'disabled' : ''}>−</button><span class="rd-big" aria-live="polite">${plan.cars} ${j ? 'cars' : 'cars'}</span><button type="button" data-cars="1" aria-label="One car more" ${plan.cars >= CARS.max ? 'disabled' : ''}>＋</button></div>
        ${round.show.includes('spots') ? `<div class="rd-set" role="group" aria-label="Where the cars wait"><b>${j ? 'Cars wait at (up to 2)' : 'Waiting places (max 2)'}</b>${WAIT_SPOTS.map((s) => `<button type="button" data-spot="${s}" aria-pressed="${plan.spots.includes(s)}"><span aria-hidden="true">${PLACES[s].icon}</span> ${esc(pick(PLACES[s].name).replace(' (edge of town)', ''))}</button>`).join('')}</div>` : ''}
        ${round.show.includes('charger') ? `<div class="rd-set" role="radiogroup" aria-label="Where the cars charge"><b>${j ? 'Chargers at' : 'Charging hub'}</b>${CHARGERS.map((s) => `<button type="button" role="radio" data-charger="${s}" aria-checked="${plan.charger === s}"><span aria-hidden="true">⚡</span> ${esc(pick(PLACES[s].name).replace(' (edge of town)', ''))}</button>`).join('')}</div>` : ''}</div>
      <div class="rd-row end"><p class="rd-hint" aria-live="polite"></p><button class="go" type="button" data-primary data-act="run">▶ ${j ? 'Run the morning' : 'Run the morning'}</button></div>`;
    K.showStage(card()); say(pick(M5[round.id]), pick(GOAL[round.id]));
    for (;;) {
      swap(controls()); const hint = tray.querySelector('.rd-hint');
      const redo = (focusSel) => { const had = K.kbd || tray.contains(document.activeElement); tray.innerHTML = controls(); if (had) tray.querySelector(focusSel)?.focus(); K.showStage(card()); };
      await new Promise((done) => { tray.onclick = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled || K.tooSoon(e)) return;
        if (b.dataset.cars) { plan = cleanPlan({ ...plan, cars: plan.cars + +b.dataset.cars }); redo(`[data-cars="${b.dataset.cars}"]`); return; }
        if (b.dataset.spot) { const s = b.dataset.spot; let sp = plan.spots.includes(s) ? plan.spots.filter((x) => x !== s) : [...plan.spots, s]; if (sp.length > 2) sp = sp.slice(-2); if (!sp.length) { tray.querySelector('.rd-hint').textContent = j ? 'The cars need somewhere to wait.' : 'At least one waiting place is needed.'; return; } plan = cleanPlan({ ...plan, spots: sp }); redo(`[data-spot="${s}"]`); return; }
        if (b.dataset.charger) { plan = cleanPlan({ ...plan, charger: b.dataset.charger }); redo(`[data-charger="${b.dataset.charger}"]`); return; }
        if (b.dataset.act === 'run') { tray.onclick = null; done(); }
      }; });
      prev = res; res = simulate(plan, { charge: !!round.charge, peak: !!round.peak }); runs++; tries++;
      K.showStage(card()); const line = fleetSay(round, res, prev, plan, j); say(line);
      if (meets(round, res)) break;
      hint.textContent = '';
      // after several tries, Florence names one thing worth trying (she never sets it herself)
      if (tries >= 4) say(`${line} ${round.id === 'size' ? (j ? 'Try a lot more cars, then fewer, and watch the wait.' : 'Sweep the fleet size and read the curve.') : round.id === 'peak' ? (j ? 'The new people all start at the station. Do some cars wait there?' : 'The new demand is all at the station: move one waiting place there, and size up.') : round.id === 'where' ? (j ? 'Try the two homes, where most calls come from, with 8 cars.' : 'Wait where demand is: both homes, around 8 cars.') : (j ? 'Put the charger near where the cars wait (the shops are close to both homes), and add a car or two.' : 'Charging removes capacity: site the hub near the waiting places and add cars.')}`);
    }
    swap(`<div class="rd-row end"><p class="rd-hint">${j ? 'Goal met!' : 'Goal met.'}</p><button class="go" type="button" data-primary data-act="next">${ri < ROUNDS.length - 1 ? (j ? 'Next round ➜' : 'Next round ➜') : 'Next ➜'}</button></div>`);
    await K.press();
  }
  return { cars: plan.cars, spots: plan.spots, charger: plan.charger, longest: res.longest, emptyPct: res.emptyPct, runs };
}
