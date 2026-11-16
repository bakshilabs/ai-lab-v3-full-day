// Mission 1 page: match sensors to jobs, then watch and predict a robot's sense–think–act loop, then set its rule.
import { SENSORS, JOBS, matchLine, ROOM, ROOM2, DIRS, rule, startOf, drive, askAt, endLine, reading, SQUARE_CM, WHEN, CM, cmToT, ruleText } from './m1-sense.js';
import { esc } from './shell.js';
import { stageOf } from './missions.js';

const C = 52; // pixels per square in the room drawing
// The greenhouse room as SVG. st: where the robot starts. The robot, its trail and the sensor's reach are updated in
// place afterwards (moveBot, addTrail, showBeam), so with motion on the robot glides instead of jumping.
const mid = (v) => v * C + C / 2;
export function roomSvg(room, st, { trail = [] } = {}) {
  const H = room.length; const W = room[0].length; let cells = '';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = room[y][x]; const X = x * C; const Y = y * C;
    if (c === '#') { const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1; cells += edge ? `<rect x="${X}" y="${Y}" width="${C}" height="${C}" fill="#8a6a4a"/>` : `<rect x="${X}" y="${Y}" width="${C}" height="${C}" fill="#e9dcc0"/><rect x="${X + 10}" y="${Y + 16}" width="${C - 20}" height="${C - 20}" rx="4" fill="#c8553d" stroke="#3b2a1e" stroke-width="2.5"/><path d="M${X + C / 2} ${Y + 18}c-10-14-18-6-12 0M${X + C / 2} ${Y + 18}c10-14 18-6 12 0" fill="#5fa85a" stroke="#3b2a1e" stroke-width="2"/>`; }
    else { cells += `<rect x="${X}" y="${Y}" width="${C}" height="${C}" fill="${(x + y) % 2 ? '#f3e8cf' : '#efe2c4'}"/>`; if (c === 'G') cells += `<rect x="${X + 8}" y="${Y + 8}" width="${C - 16}" height="${C - 16}" rx="8" fill="#bfe3cb" stroke="#1f7a44" stroke-width="3"/><path d="M${X + 28} ${Y + 14}l-8 13h7l-3 12l10-15h-7l3-10z" fill="#1f7a44"/>`; }
  }
  const trailSvg = trail.map(([x, y]) => `<circle cx="${mid(x)}" cy="${mid(y)}" r="4" fill="#3a6fc9" opacity=".45"/>`).join('');
  const g = room.findIndex((r) => r.includes('G')); const where = g >= 0 && g < H / 2 ? 'top left' : 'bottom left';
  return `<svg class="rb-room" viewBox="0 0 ${W * C} ${H * C}" role="img" aria-label="The greenhouse from above. The robot’s charger is at the ${where}.">${cells}<g class="rb-trail">${trailSvg}</g><g class="rb-beam"></g>
    <g class="rb-bot" style="transform: translate(${mid(st.x)}px, ${mid(st.y)}px) rotate(${st.d * 90}deg)"><rect x="-17" y="-15" width="34" height="30" rx="8" fill="#16c79a" stroke="#3b2a1e" stroke-width="2.5"/><rect x="5" y="-10" width="9" height="20" rx="3" fill="#243447"/><circle cx="10" cy="-4" r="2.6" fill="#8fd8ff"/><circle cx="10" cy="4" r="2.6" fill="#8fd8ff"/><path d="M17 -6h5v12h-5" fill="#f4b73b" stroke="#3b2a1e" stroke-width="2"/><path class="rb-bumpfx" d="M24 -14l6 -6M26 0h9M24 14l6 6" stroke="#d9533d" stroke-width="3.5" stroke-linecap="round"/></g></svg>`;
}
export function moveBot(svg, st, rot, bump = false) { const g = svg?.querySelector('.rb-bot'); if (!g) return; g.style.transform = `translate(${mid(st.x)}px, ${mid(st.y)}px) rotate(${rot}deg)`; g.classList.toggle('bump', !!bump); }
export function addTrail(svg, st) { const g = svg?.querySelector('.rb-trail'); if (g) g.insertAdjacentHTML('beforeend', `<circle cx="${mid(st.x)}" cy="${mid(st.y)}" r="4" fill="#3a6fc9" opacity=".45"/>`); }
// the squares the distance sensor sees as clear, and the thing it meets (dashed)
export function showBeam(svg, st, n = null) {
  const g = svg?.querySelector('.rb-beam'); if (!g) return; if (!st || n === null) { g.innerHTML = ''; return; }
  const [dx, dy] = DIRS[st.d]; let ray = ''; for (let i = 1; i <= n; i++) ray += `<rect x="${(st.x + dx * i) * C + 6}" y="${(st.y + dy * i) * C + 6}" width="${C - 12}" height="${C - 12}" rx="6" fill="#8fd8ff" opacity=".55"/>`;
  g.innerHTML = `${ray}<rect x="${(st.x + dx * (n + 1)) * C + 3}" y="${(st.y + dy * (n + 1)) * C + 3}" width="${C - 6}" height="${C - 6}" rx="6" fill="none" stroke="#1f6fd0" stroke-width="3" stroke-dasharray="6 4"/>`;
}
const sensorPic = (id) => ({ camera: '<rect x="8" y="18" width="48" height="34" rx="6" fill="#4a86d9" stroke="#3b2a1e" stroke-width="3"/><circle cx="32" cy="35" r="11" fill="#243447" stroke="#fff" stroke-width="3"/><rect x="22" y="11" width="16" height="8" rx="2" fill="#3b4656"/>',
  distance: '<rect x="8" y="22" width="30" height="22" rx="5" fill="#16c79a" stroke="#3b2a1e" stroke-width="3"/><circle cx="18" cy="33" r="5" fill="#243447"/><circle cx="30" cy="33" r="5" fill="#243447"/><path d="M44 24c5 5 5 13 0 18M50 19c8 8 8 20 0 28" fill="none" stroke="#1f6fd0" stroke-width="3" stroke-linecap="round"/>',
  bump: '<rect x="10" y="36" width="44" height="16" rx="5" fill="#8d98a3" stroke="#3b2a1e" stroke-width="3"/><rect x="22" y="22" width="20" height="16" rx="4" fill="#d9533d" stroke="#3b2a1e" stroke-width="3"/><path d="M32 6v10M26 12l6 6l6-6" stroke="#3b2a1e" stroke-width="3" fill="none" stroke-linecap="round"/>',
  thermo: '<rect x="26" y="6" width="12" height="38" rx="6" fill="#fff" stroke="#3b2a1e" stroke-width="3"/><circle cx="32" cy="48" r="10" fill="#d9533d" stroke="#3b2a1e" stroke-width="3"/><rect x="29" y="22" width="6" height="22" fill="#d9533d"/><path d="M42 14h6M42 22h6M42 30h6" stroke="#3b2a1e" stroke-width="2.5"/>' }[id]);
export const sensorSvg = (id, size = 56) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${sensorPic(id)}</svg>`;

// play(ctx, sh, cur, keep): resolves with the mission's summary. cur: { part, d } saved progress.
export async function playM1(ctx, sh, cur, keep) {
  const j = sh.junior; const d = { mr: 0, mo: JOBS.length, pr: 0, po: 0, tried: [], ...(cur?.d || {}) }; let part = cur?.part || 0;
  const steps = ['Sensors', 'Watch the loop', 'Set the rule'];
  const setup = (n, stage) => { sh.setup({ mission: { n: 1, icon: '📡' }, steps, stage }); sh.step(n); };
  // ---------- Part A: sensors and jobs
  if (part === 0) {
    setup(0, 'm1-match'); ctx.report({ stage: stageOf(1, 'matching sensors to jobs') });
    d.mr = 0;
    for (let k = 0; k < JOBS.length; k++) {
      if (ctx.signal.aborted) return null;
      const job = JOBS[k]; let tries = 0; const wrong = new Set();
      await sh.wait((done) => {
        const draw = (msg = null, ok = false) => {
          sh.main.innerHTML = `<div class="rb-m1a"><div class="rb-panel rb-job1"><p class="rb-kicker">Job ${k + 1} of ${JOBS.length}</p><p class="rb-jobtext">${esc(j ? job.j : job.s)}</p><ol class="rb-dots" aria-hidden="true">${JOBS.map((_, i) => `<li class="${i < k ? 'done' : i === k ? 'on' : ''}"></li>`).join('')}</ol></div>
            <div class="rb-sensors" role="group" aria-label="Sensors">${SENSORS.map((s) => `<button type="button" class="rb-sensor${wrong.has(s.id) ? ' no' : ''}${ok && s.id === job.want ? ' yes' : ''}" data-s="${s.id}" ${wrong.has(s.id) || ok ? 'disabled' : ''}>${sensorSvg(s.id, 58)}<b>${esc(s.name)}</b><small>${esc(s.can.charAt(0).toUpperCase() + s.can.slice(1))}</small>${wrong.has(s.id) ? '<em aria-hidden="true">✗</em>' : ''}${ok && s.id === job.want ? '<em aria-hidden="true">✓</em>' : ''}</button>`).join('')}</div>
            ${msg ? `<p class="rb-verdict ${ok ? 'ok' : 'miss'}" aria-live="polite">${esc(msg)}</p>` : ''}</div>`;
          sh.main.querySelectorAll('.rb-sensor:not([disabled])').forEach((b) => { b.onclick = () => choose(b.dataset.s); });
        };
        const fresh = sh.guard();
        const choose = (id) => {
          if (!fresh()) return; const r = matchLine(job, id, tries, j);
          if (r.ok) { if (!tries) d.mr++; draw(r.text, true); ctx.say(r.text); keep(0, d);
            sh.buttons(tries ? '' : (j ? 'First time!' : 'First try.'), [{ act: 'next', label: k < JOBS.length - 1 ? 'Next job' : 'Carry on', go: true }]).then(() => done()); }
          else { tries++; wrong.add(id); draw(r.text, false); ctx.say(r.text); sh.focusSoon('.rb-sensor:not([disabled])'); }
        };
        draw(); sh.line.textContent = j ? 'Which sensor can do this job?' : 'Which sensor can measure what this job needs?'; ctx.say(j ? job.j : job.s); sh.foot.innerHTML = `<p class="rb-hint">Job ${k + 1} of ${JOBS.length}</p>`; sh.focusSoon('.rb-sensor');
      });
    }
    sh.say(j ? `You matched ${d.mr} of ${JOBS.length} first time. Each sensor tells the robot one kind of thing.` : `${d.mr} of ${JOBS.length} first time. Each sensor measures one thing; robots combine several.`);
    part = 1; keep(1, d);
  }
  // ---------- Part B1: watch the loop and predict (room 1). The robot moves in place, so with motion on it glides.
  const trip = drive(ROOM, 1);
  if (part === 1) {
    setup(1, 'm1-watch'); ctx.report({ stage: stageOf(1, 'predicting the robot’s moves') });
    const asks = askAt(trip); d.pr = 0; d.po = asks.length; let st = startOf(ROOM); let rot = st.d * 90; let skip = false;
    const r1 = rule(1);
    sh.say(j ? 'This robot drives to its charger. Its distance sensor counts the clear squares ahead. Its rule is on the card. Press Next to see each turn of the loop. Sometimes you say what it will do.' : 'The robot reads its distance sensor, applies the rule, then moves: one loop per move. Step through it, and predict where you are asked.');
    sh.main.innerHTML = `<div class="rb-m1b"><div class="rb-panel rb-roombox">${roomSvg(ROOM, st, { trail: [[st.x, st.y]] })}</div><div class="rb-loop"></div></div>`;
    const svg = sh.main.querySelector('.rb-room'); const loop = sh.main.querySelector('.rb-loop');
    for (let i = 0; i < trip.steps.length; i++) {
      if (ctx.signal.aborted) return null;
      const s = trip.steps[i]; const ask = asks.includes(i); const read = reading(s.sense, j); const last = i === trip.steps.length - 1;
      const senseTxt = j ? `${s.sense} clear square${s.sense === 1 ? '' : 's'} ahead` : `${read} cm to the nearest thing`;
      const panel = (phase, guess = null) => { loop.innerHTML = `<div class="rb-panel rb-rule"><small>The robot’s rule</small><b>${esc(j ? r1.j : r1.s)}</b></div>
          <ol class="rb-sta"><li class="${phase >= 1 ? 'on' : ''}"><i>1</i><b>Sense</b><span>${phase >= 1 ? esc(senseTxt) : '…'}</span></li>
            <li class="${phase >= 2 ? 'on' : ''}"><i>2</i><b>Think</b><span>${phase >= 2 ? esc(s.think === 'turn' ? (j ? 'Something is right in front: turn.' : 'Under 50 cm: turn right.') : (j ? 'Nothing right in front: go forward.' : '50 cm or more: go forward.')) : '…'}</span></li>
            <li class="${phase >= 3 ? 'on' : ''}"><i>3</i><b>Act</b><span>${phase >= 3 ? (s.think === 'turn' ? 'Turns right.' : s.home ? 'Forward, onto the charger.' : 'Moves forward one square.') : '…'}</span></li></ol>
          ${guess ? `<p class="rb-verdict ${guess.ok ? 'ok' : 'miss'}" aria-live="polite">${esc(guess.text)}</p>` : ''}`; };
      showBeam(svg, st, s.sense);
      if (ask) {
        skip = false; panel(1); const q = j ? `The sensor says ${senseTxt}. What will the robot do?` : `Reading: ${senseTxt}. What will it do?`; sh.say(q);
        const g = await sh.buttons(`<b>Your turn:</b> ${esc(q)}`, [{ act: 'forward', label: 'Go forward' }, { act: 'turn', label: 'Turn right' }]);
        const ok = g === s.think; if (ok) d.pr++;
        const why = ok ? (j ? 'Right! The rule says so.' : 'Correct: the rule decides.') : (j ? `Not this time. ${s.think === 'turn' ? 'Something is right in front, so the rule says turn.' : 'There is room ahead, so the rule says go forward.'}` : `Not this time: ${s.think === 'turn' ? 'the reading is under 50 cm, so it turns' : 'the reading is 50 cm or more, so it goes forward'}.`);
        panel(3, { ok, text: why }); ctx.say(why); keep(1, { ...d, pr: d.pr });
      } else panel(3);
      if (s.think === 'turn') rot += 90; st = s.st; showBeam(svg, null); moveBot(svg, st, rot, false); if (s.think === 'forward') addTrail(svg, st);
      if (last) { sh.say(endLine('home', 1, j)); await sh.buttons(`Loop ${i + 1} of ${trip.steps.length}`, [{ act: 'next', label: 'Carry on', go: true }]); break; }
      const nextAsk = asks.find((a) => a > i);
      if (skip && nextAsk !== i + 1) { await new Promise((res) => sh.later(res, sh.still ? 60 : 480)); continue; }
      const list = [{ act: 'next', label: 'Next loop', go: true }];
      if (nextAsk !== i + 1) list.unshift({ act: 'skip', label: nextAsk !== undefined ? 'Skip to my next turn' : 'Skip to the end' });
      if ((await sh.buttons(`Loop ${i + 1} of ${trip.steps.length}`, list)) === 'skip') skip = true;
    }
    part = 2; keep(2, d);
  }
  // ---------- Part B2: room 2. The charger is round the other way, so the rule just shown fails: the child sets the rule.
  if (part === 2) {
    setup(2, 'm1-rule'); ctx.report({ stage: stageOf(1, 'setting the rule for room 2') });
    const tried = new Set(d.tried || []); let homeSeen = [...tried].some((k) => k.endsWith(':home'));
    let dir = null; let when = null; let cm = 100; let result = null; let running = false;
    sh.say(j ? 'A new room. Here the charger is round the other way. Choose which way the robot turns, and when. Then press Run. Try at least two rules, and get it home.' : 'Room 2: the charger is on the other side. Set the turn direction and the distance, then run. Try at least two settings and get it home.');
    const t = () => (j ? when : cmToT(cm)); const ready = () => !!dir && (j ? when !== null : true);
    sh.main.innerHTML = `<div class="rb-m1b"><div class="rb-panel rb-roombox"></div><div class="rb-loop"></div></div>`;
    const box = sh.main.querySelector('.rb-roombox'); const loop = sh.main.querySelector('.rb-loop');
    const freshRoom = () => { const s0 = startOf(ROOM2); box.innerHTML = roomSvg(ROOM2, s0, { trail: [[s0.x, s0.y]] }); };
    freshRoom();
    await sh.wait((done) => {
      const fin = () => homeSeen && tried.size >= 2;
      function draw(focus = null) {
        const rad = (group, val, cur, label) => `<button type="button" role="radio" class="rb-rulebtn${cur === val ? ' on' : ''}" data-g="${group}" data-v="${val}" aria-checked="${cur === val}" ${running ? 'disabled' : ''}>${esc(label)}</button>`;
        loop.innerHTML = `<div class="rb-panel"><h3>Turn which way?</h3><div class="rb-rules rb-two2" role="radiogroup" aria-label="Turn which way">${rad('dir', 'right', dir, '↻ Turn right')}${rad('dir', 'left', dir, '↺ Turn left')}</div>
            ${j ? `<h3>When?</h3><div class="rb-rules" role="radiogroup" aria-label="When">${WHEN.map((w) => rad('when', String(w.t), when === null ? null : String(when), w.t === 0 ? 'Never turn' : `${w.j.charAt(0).toUpperCase()}${w.j.slice(1)}`)).join('')}</div>`
    : `<h3>Turn when the distance is under</h3><div class="rb-repeat rb-cm"><button type="button" class="rb-rep" data-cm="-25" aria-label="25 cm less" ${cm <= CM[0] || running ? 'disabled' : ''}>−</button><span aria-live="polite">${cm} cm</span><button type="button" class="rb-rep" data-cm="25" aria-label="25 cm more" ${cm >= CM[CM.length - 1] || running ? 'disabled' : ''}>+</button></div><p class="rb-addhint">Each square is ${SQUARE_CM} cm. The sensor reads to the middle of the gap.</p>`}</div>
          ${ready() ? `<div class="rb-panel rb-rule"><small>The robot’s rule</small><b>${esc(ruleText(dir, t(), j, cm))}</b></div>` : ''}
          ${result ? `<p class="rb-verdict ${result === 'home' ? 'ok' : 'miss'}" aria-live="polite">${esc(endLine(result, t(), j))}</p>` : ''}`;
        loop.querySelectorAll('[data-g]').forEach((b) => { b.onclick = () => { if (running) return; if (b.dataset.g === 'dir') dir = b.dataset.v; else when = +b.dataset.v; result = null; freshRoom(); draw(`[data-g="${b.dataset.g}"][data-v="${b.dataset.v}"]`); foot(); }; });
        loop.querySelectorAll('[data-cm]').forEach((b) => { b.onclick = () => { if (running) return; cm = Math.max(CM[0], Math.min(CM[CM.length - 1], cm + +b.dataset.cm)); result = null; freshRoom(); draw(`[data-cm="${b.dataset.cm}"]`); foot(); }; });
        if (focus && sh.keys()) loop.querySelector(focus)?.focus();
      }
      function foot() {
        sh.foot.innerHTML = `<p class="rb-hint">${fin() ? (j ? 'You can try another, or carry on.' : 'Try another, or carry on.') : `${tried.size} tried${homeSeen ? ', home reached' : ''}`}</p><button type="button" class="rb-btn ${fin() ? 'alt' : 'go'}" data-run ${!ready() || running ? 'disabled' : ''}>▶ Run</button>${fin() ? '<button type="button" class="rb-btn go" data-fin>Carry on ➜</button>' : ''}`;
        sh.foot.querySelector('[data-run]').onclick = go; const f = sh.foot.querySelector('[data-fin]'); if (f) f.onclick = () => done();
      }
      const fresh = sh.guard();
      function go() {
        if (running || !ready() || !fresh()) return; const tt = t(); const r = drive(ROOM2, tt, 40, dir); running = true; result = null; freshRoom(); draw(); foot();
        const svg = box.querySelector('.rb-room'); let st = startOf(ROOM2); let rot = st.d * 90; let i = 0;
        const step = () => { const s = r.steps[i++]; if (s.think === 'turn') rot += dir === 'left' ? -90 : 90; st = s.st; moveBot(svg, st, rot, s.bump); if (s.think === 'forward' && !s.bump) addTrail(svg, st); };
        const end = () => { running = false; result = r.end; tried.add(`${dir}:${tt}:${r.end}`); if (r.end === 'home') homeSeen = true; d.tried = [...tried]; keep(2, d); draw(); foot(); ctx.say(endLine(r.end, tt, j)); loop.querySelector('.rb-verdict')?.scrollIntoView({ block: 'nearest' }); sh.focusSoon('[data-fin], [data-run]'); };
        if (sh.still) { while (i < r.steps.length) step(); end(); return; }
        const tick = () => { if (ctx.signal.aborted) return; step(); if (i < r.steps.length) sh.later(tick, 420); else sh.later(end, 380); };
        tick();
      }
      draw(); foot(); sh.focusSoon('[data-g]');
    });
  }
  return { mr: d.mr, mo: d.mo, pr: d.pr, po: d.po, tried: d.tried || [] };
}
