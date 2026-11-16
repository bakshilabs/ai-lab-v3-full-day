// Mission 1, ground school: the pictures and the taps. Rules and words are in m1-ground.js.
import { CHECKS, CHECK_NAMES, DAYS, look, isProblem, fixFor, checkReply, dayReply, dayAnswer, plansFor, HEIGHT_LIMIT, planReply, fixReply } from './m1-ground.js';
import { words } from './missions.js';
import { esc, el } from './kit.js';

// ---------------------------------------------------------------- the drone kit on the grass, before a flight
function kitSvg(day, { sel, fixed = new Set(), junior }) {
  const s = day.state; const gale = s.weather === 'gale'; const low = s.battery === 'low' && !fixed.has('battery'); const chip = s.props === 'chipped' && !fixed.has('props');
  const ring = (id, x, y, w, h) => (sel === id ? `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="14" fill="none" stroke="#1f6fd0" stroke-width="5"/>` : '');
  const o = ['<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The drone, its battery, the weather and the field">'];
  // the sky and the weather
  o.push(`<g data-check="weather" class="dk-hot"><rect x="0" y="0" width="600" height="170" fill="${gale ? '#9fb0bd' : '#cfe8f7'}"/>`);
  if (gale) { o.push('<g fill="#7d8b96"><ellipse cx="120" cy="45" rx="70" ry="26"/><ellipse cx="190" cy="38" rx="60" ry="28"/><ellipse cx="330" cy="50" rx="80" ry="26"/></g>'); for (let i = 0; i < 14; i++) o.push(`<path d="M${70 + i * 24} ${80 + (i % 3) * 10} l-8 18" stroke="#5c7488" stroke-width="3"/>`); }
  else o.push('<circle cx="90" cy="60" r="28" fill="#ffd34d"/><ellipse cx="280" cy="50" rx="50" ry="16" fill="#fffaf0"/>');
  // windsock: hangs down in a breeze, sticks straight out in a gale; trees bend with it
  o.push('<path d="M500 160 V40" stroke="#5e4936" stroke-width="5"/>');
  if (gale) o.push('<path d="M500 44 L580 50 L580 66 L500 74 Z" fill="#e8743b"/><path d="M528 46 v26 M556 48 v20" stroke="#fffaf0" stroke-width="7"/>');
  else o.push('<path d="M500 44 L512 104 L498 108 L490 48 Z" fill="#e8743b"/><path d="M497 66 h12 M501 86 h10" stroke="#fffaf0" stroke-width="6"/>');
  const tree = (x, bend) => `<path d="M${x} 168 q${bend / 2} -20 ${bend} -40" stroke="#6b4a2e" stroke-width="6" fill="none"/><circle cx="${x + bend}" cy="120" r="22" fill="#4f9a45"/>`;
  o.push(tree(410, gale ? 22 : 0), tree(450, gale ? 18 : 0));
  o.push(`${ring('weather', 380, 30, 210, 132)}</g>`);
  // the field
  const walkers = s.area === 'people' && !fixed.has('area') ? [[340, 360, '#d2452d'], [372, 356, '#1f6fd0'], [398, 362, '#7a3fb0']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><circle cy="-22" r="6" fill="#e9b98f"/><rect x="-6" y="-16" width="12" height="16" rx="3" fill="${c}"/><path d="M-4 0 v10 M4 0 v10" stroke="#3b2a1e" stroke-width="3"/></g>`).join('') + '<g fill="#7a5a33"><ellipse cx="430" cy="368" rx="11" ry="5"/><circle cx="441" cy="363" r="4"/><ellipse cx="310" cy="372" rx="9" ry="4"/><circle cx="300" cy="368" r="3.5"/></g>' : '';
  o.push(`<g data-check="area" class="dk-hot"><rect x="0" y="170" width="600" height="230" fill="#a5dd84"/><path d="M0 340 H600" stroke="#8cc76c" stroke-width="3"/>${walkers}${ring('area', 6, 334, 588, 56)}</g>`);
  // the drone, seen from above
  o.push('<g data-check="props" class="dk-hot" transform="translate(190 255)"><rect x="-120" y="-70" width="240" height="150" fill="transparent"/>');
  o.push('<path d="M-70 -45 L70 45 M70 -45 L-70 45" stroke="#8f9aa3" stroke-width="12" stroke-linecap="round"/><rect x="-34" y="-26" width="68" height="52" rx="10" fill="#fffaf0" stroke="#3b2a1e" stroke-width="3"/><rect x="-14" y="-38" width="28" height="14" rx="4" fill="#e8743b"/>');
  [[-70, -45], [70, -45], [-70, 45], [70, 45]].forEach(([x, y], i) => {
    o.push(`<g transform="translate(${x} ${y})"><circle r="7" fill="#3b2a1e"/><ellipse rx="40" ry="8" fill="#3b2a1e" transform="rotate(${i * 40 + 15})"/>`);
    if (i === 1 && chip) o.push(`<path d="M${Math.cos(55 * Math.PI / 180) * 30} ${Math.sin(55 * Math.PI / 180) * 30} l10 -2 l-4 10 z" fill="#a5dd84"/><circle cx="${Math.cos(55 * Math.PI / 180) * 34}" cy="${Math.sin(55 * Math.PI / 180) * 34}" r="15" fill="none" stroke="${sel === 'props' ? '#d2452d' : 'none'}" stroke-width="3"/>`);
    o.push('</g>');
  });
  o.push(`${ring('props', -120, -70, 240, 150)}</g>`);
  // the battery: four lights
  o.push('<g data-check="battery" class="dk-hot" transform="translate(440 220)"><rect x="-10" y="-10" width="140" height="80" fill="transparent"/><rect x="0" y="0" width="120" height="60" rx="10" fill="#3b4752"/><rect x="120" y="20" width="8" height="20" rx="2" fill="#3b4752"/>');
  const lit = low ? 1 : 4; for (let i = 0; i < 4; i++) o.push(`<rect x="${14 + i * 25}" y="20" width="18" height="20" rx="3" fill="${i < lit ? '#5fd36b' : '#59636b'}"/>`);
  if (!junior) o.push(`<text x="60" y="84" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="17" fill="#3b2a1e">${low ? '30%' : '100%'}</text>`);
  o.push(`${ring('battery', -4, -4, 136, junior ? 68 : 96)}</g>`);
  o.push('</svg>');
  return o.join('');
}

// ---------------------------------------------------------------- the airspace map and the side view
const MAPPATH = { wood: [[236, 312], [150, 300], [100, 330], [150, 350], [236, 312]], sports: [[236, 312], [190, 230], [150, 168]], cliffs: [[236, 312], [400, 290], [540, 255]],
  high: [[236, 312]], sight: [[236, 312], [300, 225], [420, 260], [452, 300]], hospital: [[360, 200], [462, 160], [540, 370]],
  airfield: [[236, 312], [120, 230], [10, 200]], fire: [[236, 312], [270, 200], [305, 112]], ids: [[236, 312]] };
const YOU = { hospital: [360, 200] };
function mapSvg(plan, { junior, done = [] }) {
  const o = ['<svg viewBox="-150 0 750 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Map of the coast: the airfield, the school, the hospital, the cliffs, the wood, the hill and the houses. Shaded areas are no-fly zones.">'];
  o.push('<defs><pattern id="dk-nofly" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="#d2452d" fill-opacity=".14"/><rect width="4" height="12" fill="#d2452d" fill-opacity=".45"/></pattern></defs>');
  o.push('<rect x="-150" width="750" height="400" fill="#bfe3f5"/><path d="M-150 0 H520 Q540 120 525 220 Q540 300 500 345 Q440 360 420 400 H-150 Z" fill="#b4dc7c"/>');
  // the airfield: a runway with a hangar and a small plane
  o.push('<rect x="-104" y="50" width="30" height="290" rx="4" fill="#8f9aa3"/><path d="M-89 64 V326" stroke="#fffaf0" stroke-width="3" stroke-dasharray="14 10"/><rect x="-140" y="150" width="28" height="22" fill="#c5ccd2" stroke="#7a5a33" stroke-width="2"/><path d="M-89 104 v26 M-102 114 h26 M-95 128 h12" stroke="#3b4752" stroke-width="5" stroke-linecap="round"/>');
  o.push('<path d="M500 345 Q540 300 525 220 L555 230 Q570 320 520 365 Q470 380 460 400 H420 Q440 360 500 345 Z" fill="#eedcab"/>'); // beach
  o.push('<path d="M520 160 Q545 200 528 240 L560 250 Q575 200 548 150 Z" fill="#b5835a"/>'); // cliffs
  for (const [x, y] of [[540, 190], [548, 215], [534, 230], [552, 175]]) o.push(`<path d="M${x - 6} ${y} q6 -6 12 0" stroke="#fffaf0" stroke-width="3" fill="none"/>`);
  o.push('<ellipse cx="330" cy="285" rx="80" ry="48" fill="#8fbf62"/><ellipse cx="330" cy="280" rx="50" ry="26" fill="#7cae55"/>'); // hill
  for (let i = 0; i < 9; i++) o.push(`<circle cx="${60 + (i % 3) * 40}" cy="${280 + Math.floor(i / 3) * 34}" r="17" fill="#4f9a45"/>`); // wood
  o.push('<rect x="440" y="290" width="24" height="18" fill="#c0563a"/><path d="M436 292 L452 278 L468 292 Z" fill="#8a3d2a"/>'); // roof behind the hill
  for (let i = 0; i < 6; i++) o.push(`<g transform="translate(${265 + (i % 3) * 40} ${50 + Math.floor(i / 3) * 40})"><rect width="24" height="20" fill="#fffaf0" stroke="#7a5a33" stroke-width="2"/><path d="M-3 2 L12 -10 L27 2 Z" fill="#c0563a"/></g>`); // houses
  o.push('<rect x="110" y="60" width="90" height="56" fill="#f2c14e" stroke="#7a5a33" stroke-width="2"/><rect x="100" y="140" width="110" height="50" rx="8" fill="#98d470" stroke="#fffaf0" stroke-width="2"/>'); // school and its field
  for (let i = 0; i < 22; i++) o.push(`<circle cx="${108 + (i * 37) % 96}" cy="${148 + ((i * 13) % 36)}" r="3.5" fill="${['#d2452d', '#1f6fd0', '#7a3fb0', '#3b2a1e'][i % 4]}"/>`); // the crowd at sports day
  o.push('<rect x="420" y="60" width="80" height="60" fill="#fffaf0" stroke="#7a5a33" stroke-width="2"/><path d="M455 74 h10 v12 h12 v10 h-12 v12 h-10 v-12 h-12 v-10 h12 z" fill="#d2452d"/>'); // hospital
  o.push('<circle cx="462" cy="160" r="20" fill="#3b4752"/><text x="462" y="167" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="20" fill="#fffaf0">H</text>');
  // no-fly zones, shaded: round the airfield, the helipad and the nesting cliffs
  o.push('<circle cx="-89" cy="195" r="118" fill="url(#dk-nofly)" stroke="#d2452d" stroke-width="2.5" stroke-dasharray="8 6"/><circle cx="462" cy="160" r="44" fill="url(#dk-nofly)" stroke="#d2452d" stroke-width="2.5" stroke-dasharray="8 6"/><path d="M505 150 Q545 130 572 160 Q588 210 568 262 Q540 270 512 248 Q530 200 505 150 Z" fill="url(#dk-nofly)" stroke="#d2452d" stroke-width="2.5" stroke-dasharray="8 6"/>');
  if (plan.id === 'fire') o.push('<g transform="translate(305 90)"><path d="M-6 -2 q6 -22 12 -6 q8 -14 8 6 z" fill="#ff7a1a"/><path d="M-1 -2 q3 -10 6 -2 z" fill="#ffd34d"/></g><rect x="282" y="122" width="40" height="16" rx="3" fill="#d2452d"/><circle cx="290" cy="140" r="4" fill="#3b2a1e"/><circle cx="314" cy="140" r="4" fill="#3b2a1e"/>');
  o.push('<g transform="translate(-140 386)"><rect width="18" height="12" fill="url(#dk-nofly)" stroke="#d2452d" stroke-width="2"/><text x="24" y="11" font-family="Inter, sans-serif" font-weight="800" font-size="12" fill="#8a3d12">No-fly zone</text></g>');
  // labels on a cream tag, kept short
  const tag = (x, y, t) => `<g><rect x="${x - t.length * 3.6 - 6}" y="${y - 13}" width="${t.length * 7.2 + 12}" height="19" rx="9" fill="#fffaf0" opacity="1"/><text x="${x}" y="${y + 1}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="12" fill="#3b2a1e">${esc(t)}</text></g>`;
  o.push(tag(155, 50, 'School'), tag(155, 205, 'Sports day'), tag(325, 30, 'Houses'), tag(460, 50, 'Hospital'), tag(480, 192, 'Helipad'), tag(512, 136, 'Seabirds nesting'), tag(110, 385, 'Old wood'), tag(330, 245, 'Hill'), tag(520, 392, 'Beach'), tag(-89, 40, 'Airfield'));
  // this plan's flight
  const path = MAPPATH[plan.id]; const you = YOU[plan.id] || [236, 312];
  if (path.length > 1) o.push(`<polyline points="${path.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#e8743b" stroke-width="5" stroke-dasharray="10 7" stroke-linecap="round"/>`);
  else if (plan.id === 'high') o.push(`<path d="M${you[0] + 22} ${you[1] + 6} v-46 m-9 12 l9 -12 l9 12" stroke="#e8743b" stroke-width="5" fill="none"/>`);
  o.push(`<g transform="translate(${you[0]} ${you[1]})"><circle r="11" fill="#1f6fd0" stroke="#fffaf0" stroke-width="3"/><circle cy="-3" r="3.5" fill="#fffaf0"/></g>${tag(you[0], you[1] + 30, 'You')}`);
  o.push('</svg>');
  return o.join('');
}
function sideSvg(plan, junior) {
  const H = 120, top = 16, groundY = 104; const scale = (groundY - top - 8) / 220; const y = (m) => groundY - m * scale; const hy = y(plan.height);
  const o = [`<svg class="dk-sideview" viewBox="0 0 600 ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Side view: how high the drone would fly, and the height limit">`];
  o.push(`<rect width="600" height="${H}" fill="#e8f4fb"/><rect y="${groundY}" width="600" height="${H - groundY}" fill="#a5dd84"/>`);
  o.push(`<path d="M0 ${y(HEIGHT_LIMIT)} H600" stroke="#d2452d" stroke-width="3" stroke-dasharray="10 6"/><text x="8" y="${y(HEIGHT_LIMIT) - 6}" font-family="Inter, sans-serif" font-weight="800" font-size="13" fill="#8a3d12">${junior ? 'Height limit: no drones above this line' : 'Height limit: 120 m (about 400 ft)'}</text>`);
  o.push(`<path d="M520 ${groundY} v-14 h10 v14" fill="#7a5a33"/><g transform="translate(140 ${groundY - 10})"><circle r="7" fill="#1f6fd0"/></g>`);
  o.push(`<path d="M300 ${groundY} V${hy + 8}" stroke="#e8743b" stroke-width="2" stroke-dasharray="4 4"/><g transform="translate(300 ${hy})"><rect x="-14" y="-5" width="28" height="10" rx="3" fill="#3b2a1e"/><path d="M-24 -7 h14 M10 -7 h14" stroke="#3b2a1e" stroke-width="3"/></g>`);
  if (!junior) o.push(`<text x="318" y="${hy + 4}" font-family="Inter, sans-serif" font-weight="800" font-size="13" fill="#3b2a1e">${plan.height} m</text>`);
  o.push('</svg>');
  return o.join('');
}

// ---------------------------------------------------------------- play. Resolves with the mission's summary.
export async function runGround(ctx, kit, scope) {
  const junior = kit.junior; const P = kit.panel('ground'); scope.onEnd(() => P.remove());
  const PLANS = plansFor(junior); const sum = { checked: 0, fixed: 0, grounded: 0, jobs: PLANS.length, first: 0 };
  P.main.classList.add('dk-pic');
  // ---- part 1: the same drone on four days
  for (const [di, day] of DAYS.entries()) {
    ctx.report({ stage: `Ground school: checking the drone on ${day.name}` });
    const marks = {}; const tries = {}; const fixed = new Set(); let sel = null;
    P.say(di === 0 ? `${day.name}. The job: ${day.job}. Check each of the four things before the drone flies. Tap one to look at it closely.` : `${day.name}. The job: ${day.job.charAt(0).toLowerCase() + day.job.slice(1)}. Check all four things again: every flight gets a fresh check.`);
    const draw = () => { P.main.innerHTML = `<ol class="dk-steps" aria-label="${DAYS.length} days">${DAYS.map((x, i) => `<li class="${i < di ? 'done' : i === di ? 'now' : ''}">${x.name}</li>`).join('')}</ol>${kitSvg(day, { sel, fixed, junior })}`; };
    let reply = null; let decided = null; let dayTries = 0;
    const side = () => {
      const all = CHECKS.every((c) => marks[c]); const problems = CHECKS.filter((c) => marks[c] === 'problem');
      const unfixed = problems.filter((c) => fixFor(c, day.state[c]) && !fixed.has(c));
      P.side.innerHTML = `<h2>${esc(day.name)}: pre-flight check</h2>
        <div class="dk-checks" role="group" aria-label="The four checks">${CHECKS.map((c) => { const m = marks[c]; const st = !m ? 'Not checked yet' : m === 'ok' ? '✓ Good' : fixed.has(c) ? '🔧 Fixed' : '⚠ Problem'; return `<button type="button" class="dr-btn dk-check${sel === c ? ' sel' : ''}${m ? ` ${m}` : ''}${fixed.has(c) ? ' fixed' : ''}" data-check="${c}" aria-pressed="${sel === c}"><b>${CHECK_NAMES[c]}</b><span>${st}</span></button>`; }).join('')}</div>
        ${sel ? `<div class="dk-note" data-dk-look>${esc(look(sel, day.state[sel], junior))}</div>${marks[sel] ? '' : '<div class="dr-row"><button type="button" class="dr-btn" data-mark="ok">✓ Looks good</button><button type="button" class="dr-btn" data-mark="problem">⚠ Problem</button></div>'}` : ''}
        ${reply ? `<div class="dk-note ${reply.right ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(reply.text)}</div>` : ''}
        ${all && unfixed.length ? `<div class="dr-row">${unfixed.map((c) => `<button type="button" class="dr-btn" data-fix="${c}">🔧 ${esc(fixFor(c, day.state[c]))}</button>`).join('')}</div>` : ''}
        ${all && !unfixed.length && !decided ? '<p>All four are checked. Will the drone fly today?</p><div class="dr-row"><button type="button" class="dr-btn" data-day="fly">✈ Fly today</button><button type="button" class="dr-btn" data-day="stay">✋ Keep it on the ground</button></div>' : ''}
        ${decided ? `<div class="dr-row"><button type="button" class="dr-btn go" data-k="next">${di < DAYS.length - 1 ? 'Next day ➜' : 'On to the map ➜'}</button></div>` : ''}`;
    };
    draw(); side(); kit.focusFirst(P.side, '[data-check]');
    await new Promise((res) => {
      const pick = (c) => { sel = c; reply = null; draw(); side(); P.say(`${CHECK_NAMES[c]}. ${look(c, day.state[c], junior)}`, { quiet: false }); kit.focusFirst(P.side, marks[c] ? '[data-check]' : '[data-mark]'); };
      P.main.onclick = (e) => { const g = e.target.closest('[data-check]'); if (g && !decided) pick(g.dataset.check); };
      P.side.onclick = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled) return; const d = b.dataset;
        if (d.check && !decided) pick(d.check);
        else if (d.mark) {
          const r = checkReply(sel, day.state[sel], d.mark, tries[sel] || 0, junior); reply = r;
          if (r.right || r.told) { marks[sel] = isProblem(day.state[sel]) ? 'problem' : 'ok'; } else tries[sel] = (tries[sel] || 0) + 1;
          P.say(r.text); const next = CHECKS.find((c) => !marks[c]); side(); kit.focusFirst(P.side, next && (r.right || r.told) ? `[data-check="${next}"]` : '[data-mark], [data-fix], [data-day], [data-check]');
        } else if (d.fix) { fixed.add(d.fix); sum.fixed++; reply = { right: true, text: `Done: ${fixFor(d.fix, day.state[d.fix]).charAt(0).toLowerCase() + fixFor(d.fix, day.state[d.fix]).slice(1)}.` }; P.say(reply.text); draw(); side(); kit.focusFirst(P.side, '[data-fix], [data-day]'); }
        else if (d.day) {
          const r = dayReply(day, d.day, dayTries); reply = r; P.say(r.text);
          if (r.right || dayTries > 0) { decided = dayAnswer(day); if (decided === 'stay') sum.grounded++; } else dayTries++;
          side(); kit.focusFirst(P.side, decided ? '[data-k]' : '[data-day]');
        } else if (d.k === 'next') res();
      };
    });
    sum.checked++; // progress inside a mission is not kept: a mission is short, and leaving part way starts it again
  }
  // ---- part 2: the airspace map and six flight plans
  P.main.classList.remove('dk-pic');
  for (const [pi, plan] of PLANS.entries()) {
    ctx.report({ stage: `Ground school: flight plan ${pi + 1} of ${PLANS.length}` });
    const ask = words(plan.ask, junior); let tries = 0, fixTries = 0; let stage = 'ask'; let reply = null;
    P.say(pi === 0 ? `Now the map. A pilot checks where the drone may fly before every job. Here are ${PLANS.length} plans. The shaded parts of the map are no-fly zones. For each one, decide: fly as planned, do not fly, or fly with a change. Plan 1: ${ask}` : `Plan ${pi + 1}: ${ask}`);
    P.main.innerHTML = `<ol class="dk-steps" aria-label="${PLANS.length} plans">${PLANS.map((x, i) => `<li class="${i < pi ? 'done' : i === pi ? 'now' : ''}">${i + 1}</li>`).join('')}</ol>${mapSvg(plan, { junior })}${sideSvg(plan, junior)}`;
    const side = () => {
      P.side.innerHTML = `<h2>Plan ${pi + 1} of ${PLANS.length}</h2><p class="dk-ask">${esc(ask)}</p>
        ${stage === 'ask' ? '<div class="dk-choices" role="group" aria-label="Your decision"><button type="button" class="dr-btn" data-say="fly">✈ Fly as planned</button><button type="button" class="dr-btn" data-say="no">✋ Do not fly</button><button type="button" class="dr-btn" data-say="change">✏ Fly, but change the plan</button></div>' : ''}
        ${stage === 'fix' ? `<div class="dk-choices" role="group" aria-label="Which change">${plan.fixes.map((f) => `<button type="button" class="dr-btn" data-fixid="${f.id}">${esc(f.label)}</button>`).join('')}</div>` : ''}
        ${reply ? `<div class="dk-note ${reply.right ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(reply.text)}</div>` : ''}
        ${stage === 'done' ? `<div class="dr-row"><button type="button" class="dr-btn go" data-k="next">${pi < PLANS.length - 1 ? 'Next plan ➜' : 'Finish ground school ➜'}</button></div>` : ''}`;
    };
    side(); kit.focusFirst(P.side, '[data-say]');
    await new Promise((res) => {
      P.main.onclick = null;
      P.side.onclick = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled) return; const d = b.dataset;
        if (d.say) {
          const r = planReply(plan, d.say, tries, junior); reply = r; P.say(r.text);
          if (r.right) { if (!tries && plan.answer !== 'change') sum.first++; stage = plan.answer === 'change' ? 'fix' : 'done'; } else if (r.told) stage = plan.answer === 'change' ? 'fix' : 'done'; else tries++;
          side(); kit.focusFirst(P.side, stage === 'fix' ? '[data-fixid]' : stage === 'done' ? '[data-k]' : '[data-say]');
        } else if (d.fixid) {
          const r = fixReply(plan, d.fixid, fixTries, junior); reply = r; P.say(r.text);
          if (r.right) { if (!tries && !fixTries) sum.first++; stage = 'done'; } else if (r.told) stage = 'done'; else fixTries++;
          side(); kit.focusFirst(P.side, stage === 'done' ? '[data-k]' : '[data-fixid]');
        } else if (d.k === 'next') res();
      };
    });
  }
  P.remove();
  const flew = sum.checked - sum.grounded;
  return { sum, lines: [`You checked the drone on ${sum.checked} days. It flew on ${flew} and stayed on the ground on ${sum.grounded}${sum.fixed ? `, after you fixed ${sum.fixed} ${sum.fixed === 1 ? 'problem' : 'problems'}` : ''}.`, `You judged ${PLANS.length} flight plans: ${sum.first} right first time.`] };
}

const M = '#module[data-module="drone"]';
export const M1_CSS = `
${M} .dk-hot { cursor: pointer; }
${M} .dk-pic > svg { margin: auto 0; }
${M} .dk-pic svg { border-radius: 12px; }
${M} .dk-main > svg.dk-sideview { flex: 0 0 auto; height: auto; min-height: 0; }
${M} .dk-checks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
${M} .dk-check { display: grid; gap: 2px; text-align: left; min-height: 58px; }
${M} .dk-check span { font-size: .88em; font-weight: 700; color: #5e4936; }
${M} .dk-check.sel { box-shadow: inset 0 0 0 3px #1f6fd0, 0 3px 0 #164f96; }
${M} .dk-check.ok { background: #e6f5df; }
${M} .dk-check.problem { background: #ffe9b8; }
${M} .dk-check.fixed { background: #e3effb; }
${M} .dk-ask { font-size: 1.05em; padding: 8px 10px; border-radius: 12px; background: #f6ecd6; }
`;
