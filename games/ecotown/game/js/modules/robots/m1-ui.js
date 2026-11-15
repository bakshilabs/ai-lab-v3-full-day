// Mission 1 page: match sensors to jobs, then watch and predict a robot's sense–think–act loop, then set its rule.
import { SENSORS, JOBS, sensor, matchLine, ROOM, DIRS, RULES, rule, startOf, drive, askAt, endLine, reading, SQUARE_CM } from './m1-sense.js';
import { esc } from './shell.js';
import { stageOf } from './missions.js';

const C = 52; // pixels per square in the room drawing
// The greenhouse room as SVG. st: the robot ({ x, y, d }). beam: clear squares ahead (drawn as the sensor's reach).
export function roomSvg(st, { beam = null, bump = false, trail = [] } = {}) {
  const H = ROOM.length; const W = ROOM[0].length; let cells = '';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = ROOM[y][x]; const X = x * C; const Y = y * C;
    if (c === '#') { const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1; cells += edge ? `<rect x="${X}" y="${Y}" width="${C}" height="${C}" fill="#8a6a4a"/>` : `<rect x="${X}" y="${Y}" width="${C}" height="${C}" fill="#e9dcc0"/><rect x="${X + 10}" y="${Y + 16}" width="${C - 20}" height="${C - 20}" rx="4" fill="#c8553d" stroke="#3b2a1e" stroke-width="2.5"/><path d="M${X + C / 2} ${Y + 18}c-10-14-18-6-12 0M${X + C / 2} ${Y + 18}c10-14 18-6 12 0" fill="#5fa85a" stroke="#3b2a1e" stroke-width="2"/>`; }
    else { cells += `<rect x="${X}" y="${Y}" width="${C}" height="${C}" fill="${(x + y) % 2 ? '#f3e8cf' : '#efe2c4'}"/>`; if (c === 'G') cells += `<rect x="${X + 8}" y="${Y + 8}" width="${C - 16}" height="${C - 16}" rx="8" fill="#bfe3cb" stroke="#1f7a44" stroke-width="3"/><path d="M${X + 28} ${Y + 14}l-8 13h7l-3 12l10-15h-7l3-10z" fill="#1f7a44"/>`; }
  }
  const trailSvg = trail.map(([x, y]) => `<circle cx="${x * C + C / 2}" cy="${y * C + C / 2}" r="4" fill="#3a6fc9" opacity=".45"/>`).join('');
  let ray = '';
  if (st && beam !== null) { const [dx, dy] = DIRS[st.d]; for (let i = 1; i <= beam; i++) ray += `<rect x="${(st.x + dx * i) * C + 6}" y="${(st.y + dy * i) * C + 6}" width="${C - 12}" height="${C - 12}" rx="6" fill="#8fd8ff" opacity=".55"/>`;
    const ex = st.x + dx * (beam + 1); const ey = st.y + dy * (beam + 1); ray += `<rect x="${ex * C + 3}" y="${ey * C + 3}" width="${C - 6}" height="${C - 6}" rx="6" fill="none" stroke="#1f6fd0" stroke-width="3" stroke-dasharray="6 4"/>`; }
  const bot = st ? `<g class="rb-bot" transform="translate(${st.x * C + C / 2} ${st.y * C + C / 2}) rotate(${st.d * 90})"><rect x="-17" y="-15" width="34" height="30" rx="8" fill="#16c79a" stroke="#3b2a1e" stroke-width="2.5"/><rect x="5" y="-10" width="9" height="20" rx="3" fill="#243447"/><circle cx="10" cy="-4" r="2.6" fill="#8fd8ff"/><circle cx="10" cy="4" r="2.6" fill="#8fd8ff"/><path d="M17 -6h5v12h-5" fill="#f4b73b" stroke="#3b2a1e" stroke-width="2"/>${bump ? '<path d="M24 -14l6 -6M26 0h9M24 14l6 6" stroke="#d9533d" stroke-width="3.5" stroke-linecap="round"/>' : ''}</g>` : '';
  return `<svg class="rb-room" viewBox="0 0 ${W * C} ${H * C}" role="img" aria-label="The greenhouse: the robot ${st ? `faces ${['east', 'south', 'west', 'north'][st.d]}` : ''}, its charger is at the bottom left">${cells}${trailSvg}${ray}${bot}</svg>`;
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
          if (r.ok) { if (!tries) d.mr++; draw(r.text, true); sh.say(r.text); keep(0, d);
            sh.buttons(tries ? '' : (j ? 'First time!' : 'First try.'), [{ act: 'next', label: k < JOBS.length - 1 ? 'Next job' : 'Carry on', go: true }]).then(() => done()); }
          else { tries++; wrong.add(id); draw(r.text, false); sh.say(r.text); sh.focusSoon('.rb-sensor:not([disabled])'); }
        };
        draw(); sh.say(j ? job.j : job.s); sh.foot.innerHTML = `<p class="rb-hint">${j ? 'Which sensor can do this job?' : 'Which sensor can measure what this job needs?'}</p>`; sh.focusSoon('.rb-sensor');
      });
    }
    sh.say(j ? `You matched ${d.mr} of ${JOBS.length} first time. Each sensor tells the robot one kind of thing.` : `${d.mr} of ${JOBS.length} first time. Each sensor measures one thing; robots combine several.`);
    part = 1; keep(1, d);
  }
  // ---------- Part B1: watch the loop and predict
  const trip = drive(ROOM, 1);
  if (part === 1) {
    setup(1, 'm1-watch'); ctx.report({ stage: stageOf(1, 'predicting the robot’s moves') });
    const asks = askAt(trip); d.pr = 0; d.po = asks.length; let st = startOf(ROOM); const trail = [[st.x, st.y]];
    const r1 = rule(1);
    sh.say(j ? 'This robot drives to its charger. Its distance sensor counts the clear squares ahead. Its rule is on the card. Press Next to see each turn of the loop. Sometimes you say what it will do.' : 'The robot reads its distance sensor, applies the rule, then moves: one loop per move. Step through it, and predict where you are asked.');
    for (let i = 0; i < trip.steps.length; i++) {
      if (ctx.signal.aborted) return null;
      const s = trip.steps[i]; const ask = asks.includes(i); const read = reading(s.sense, j);
      const senseTxt = j ? `${s.sense} clear square${s.sense === 1 ? '' : 's'} ahead` : `${read} cm to the nearest thing`;
      const panel = (phase, guess = null) => `<div class="rb-m1b"><div class="rb-panel rb-roombox">${roomSvg(phase >= 3 ? s.st : st, { beam: phase >= 1 && phase < 3 ? s.sense : null, trail })}</div>
        <div class="rb-loop"><div class="rb-panel rb-rule"><small>The robot’s rule</small><b>${esc(j ? r1.j : r1.s)}</b></div>
          <ol class="rb-sta"><li class="${phase >= 1 ? 'on' : ''}"><i>1</i><b>Sense</b><span>${phase >= 1 ? esc(senseTxt) : '…'}</span></li>
            <li class="${phase >= 2 ? 'on' : ''}"><i>2</i><b>Think</b><span>${phase >= 2 ? esc(s.think === 'turn' ? (j ? 'Something is right in front: turn.' : 'Under 50 cm: turn right.') : (j ? 'Nothing right in front: go forward.' : '50 cm or more: go forward.')) : '…'}</span></li>
            <li class="${phase >= 3 ? 'on' : ''}"><i>3</i><b>Act</b><span>${phase >= 3 ? (s.think === 'turn' ? 'Turns right.' : s.home ? 'Forward, onto the charger.' : 'Moves forward one square.') : '…'}</span></li></ol>
          ${guess ? `<p class="rb-verdict ${guess.ok ? 'ok' : 'miss'}" aria-live="polite">${esc(guess.text)}</p>` : ''}</div></div>`;
      if (ask) {
        sh.main.innerHTML = panel(1); const q = j ? `The sensor says ${senseTxt}. What will the robot do?` : `Reading: ${senseTxt}. What will it do?`; sh.say(q);
        const g = await sh.buttons(`<b>Your turn:</b> ${esc(q)}`, [{ act: 'forward', label: 'Go forward' }, { act: 'turn', label: 'Turn right' }]);
        const ok = g === s.think; if (ok) d.pr++;
        const why = ok ? (j ? 'Right! The rule says so.' : 'Correct: the rule decides.') : (j ? `Not this time. ${s.think === 'turn' ? 'Something is right in front, so the rule says turn.' : 'There is room ahead, so the rule says go forward.'}` : `Not this time: ${s.think === 'turn' ? 'the reading is under 50 cm, so it turns' : 'the reading is 50 cm or more, so it goes forward'}.`);
        sh.main.innerHTML = panel(3, { ok, text: why }); sh.say(why); keep(1, { ...d, pr: d.pr });
      } else { sh.main.innerHTML = panel(3); }
      st = s.st; if (s.think === 'forward') trail.push([st.x, st.y]);
      const last = i === trip.steps.length - 1;
      if (last) sh.say(endLine('home', 1, j));
      await sh.buttons(last ? esc(endLine('home', 1, j)) : `Loop ${i + 1}`, [{ act: 'next', label: last ? 'Carry on' : 'Next loop', go: true }]);
    }
    part = 2; keep(2, d);
  }
  // ---------- Part B2: set the rule
  if (part === 2) {
    setup(2, 'm1-rule'); ctx.report({ stage: stageOf(1, 'choosing the robot’s rule') });
    const tried = new Set(d.tried || []); let chosen = null; let homeSeen = tried.has(1);
    sh.say(j ? 'Now you set the rule. Choose when it should turn, then press Run. Try at least two rules and get it home.' : 'Now choose the rule’s distance. Run at least two settings, and find one that gets it home.');
    let result = null; let shown = null; let running = false;
    await sh.wait((done) => {
      const draw = () => {
        const st = shown || startOf(ROOM);
        sh.main.innerHTML = `<div class="rb-m1b"><div class="rb-panel rb-roombox">${roomSvg(st.st || st, { bump: shown?.bump, trail: shown?.trail || [] })}</div>
          <div class="rb-loop"><div class="rb-rules" role="radiogroup" aria-label="The robot’s rule">${RULES.map((r) => `<button type="button" role="radio" class="rb-rulebtn${chosen === r.t ? ' on' : ''}" data-t="${r.t}" aria-checked="${chosen === r.t}">${tried.has(r.t) ? '<em aria-hidden="true">✓ tried</em>' : ''}${esc(j ? r.j : r.s)}</button>`).join('')}</div>
          ${result ? `<p class="rb-verdict ${result.end === 'home' ? 'ok' : 'miss'}" aria-live="polite">${esc(endLine(result.end, chosen, j))}</p>` : ''}</div></div>`;
        sh.main.querySelectorAll('.rb-rulebtn').forEach((b) => { b.onclick = () => { if (running) return; chosen = +b.dataset.t; result = null; shown = null; draw(); foot(); if (sh.keys()) sh.main.querySelector(`.rb-rulebtn[data-t="${chosen}"]`)?.focus(); }; });
      };
      const foot = () => {
        const fin = homeSeen && tried.size >= 2;
        sh.foot.innerHTML = `<p class="rb-hint">${fin ? (j ? 'You can try another, or carry on.' : 'Try another, or carry on.') : `${tried.size} tried${homeSeen ? ', home reached' : ''}`}</p><button type="button" class="rb-btn ${fin ? 'alt' : 'go'}" data-run ${chosen === null || running ? 'disabled' : ''}>▶ Run</button>${fin ? '<button type="button" class="rb-btn go" data-fin>Carry on ➜</button>' : ''}`;
        sh.foot.querySelector('[data-run]').onclick = go; const f = sh.foot.querySelector('[data-fin]'); if (f) f.onclick = () => done();
      };
      const fresh = sh.guard();
      const go = () => {
        if (running || chosen === null || !fresh()) return; const t = chosen; const r = drive(ROOM, t); running = true; tried.add(t); d.tried = [...tried];
        const trail = [[startOf(ROOM).x, startOf(ROOM).y]]; let i = 0;
        const fin = () => { running = false; result = r; if (r.end === 'home') homeSeen = true; keep(2, d); draw(); foot(); sh.say(endLine(r.end, t, j)); sh.focusSoon('[data-fin], [data-run]'); };
        const stepOne = () => { const s = r.steps[i]; if (s.think === 'forward' && !s.bump) trail.push([s.st.x, s.st.y]); shown = { st: s.st, bump: s.bump, trail: [...trail] }; i++; };
        if (sh.still) { while (i < r.steps.length) stepOne(); fin(); return; }
        const tickOn = () => { if (ctx.signal.aborted) return; stepOne(); draw(); foot(); if (i < r.steps.length) sh.later(tickOn, 420); else sh.later(fin, 300); };
        foot(); tickOn();
      };
      draw(); foot();
    });
  }
  return { mr: d.mr, mo: d.mo, pr: d.pr, po: d.po, tried: d.tried || [] };
}
