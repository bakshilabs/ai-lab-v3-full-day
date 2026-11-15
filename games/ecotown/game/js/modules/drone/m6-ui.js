// Mission 6, search and rescue at dusk: the pictures and the taps. Rules and words are in m6-rescue.js.
import { W, H, SQUARE_M, LAST_SEEN, TEAM, BRIDGE, CRAG, WOOD, isRiver, SPOTS, SENSORS, sensorReply, PATTERNS, covered, finds, minutesToFind, KINDS, kindReply, STEPS, extend, shortest, walkMinutes } from './m6-rescue.js';
import { esc } from './kit.js';

const C = 40, PAD = 14;
const X = (v) => PAD + v * C + C / 2, Z = (v) => PAD + v * C + C / 2;
function ground(x, z) { if (isRiver(x, z)) return '#2f4f6b'; if (x === BRIDGE.x && z === BRIDGE.z) return '#7a5a3a'; if (CRAG.has(`${x},${z}`)) return '#4a4038'; if (WOOD.has(`${x},${z}`)) return '#2f4a2c'; return (x + z) % 2 ? '#56664a' : '#5b6b4d'; }
const SHAPES = {
  deer: '<ellipse cx="0" cy="0" rx="16" ry="8"/><rect x="-12" y="4" width="3" height="14"/><rect x="-6" y="4" width="3" height="14"/><rect x="6" y="4" width="3" height="14"/><rect x="11" y="4" width="3" height="14"/><path d="M12 -4 L20 -18 L26 -18 L22 -10 Z"/>',
  sheep: '<ellipse cx="-9" cy="0" rx="9" ry="7"/><ellipse cx="11" cy="2" rx="9" ry="7"/><rect x="-14" y="5" width="2.5" height="7"/><rect x="-6" y="5" width="2.5" height="7"/><rect x="6" y="7" width="2.5" height="7"/><rect x="14" y="7" width="2.5" height="7"/>',
  walker: '<circle cx="-2" cy="-14" r="6"/><path d="M-8 -8 h12 v12 h-12 z"/><path d="M-8 4 h22 v5 h-22 z"/><path d="M4 -6 L14 -18 L17 -15 L7 -3 Z"/>',
};
function areaSvg({ heat = null, drone = null, path = null, found = [], team = null, mark = null }) {
  const o = [`<svg viewBox="0 0 ${W * C + PAD * 2} ${H * C + PAD * 2}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Map of the moor at dusk">`, `<rect width="${W * C + PAD * 2}" height="${H * C + PAD * 2}" rx="12" fill="#2b2a3a"/>`];
  const lit = heat ? covered(heat.path, heat.upto) : null;
  for (let x = 0; x < W; x++) for (let z = 0; z < H; z++) {
    const k = `${x},${z}`; const hot = lit?.has(k);
    o.push(`<rect data-x="${x}" data-z="${z}" x="${PAD + x * C}" y="${PAD + z * C}" width="${C}" height="${C}" fill="${hot ? '#2a2140' : ground(x, z)}" stroke="#000" stroke-opacity=".18"/>`);
    if (!hot && CRAG.has(k)) o.push(`<path d="M${PAD + x * C + 6} ${PAD + z * C + 30} l8 -18 l8 12 l6 -8 l8 14" stroke="#8a7a6a" stroke-width="3" fill="none"/>`);
    if (!hot && WOOD.has(k)) o.push(`<circle cx="${X(x)}" cy="${Z(z)}" r="12" fill="#3e6a38"/>`);
    if (hot && isRiver(x, z)) o.push(`<rect x="${PAD + x * C}" y="${PAD + z * C}" width="${C}" height="${C}" fill="#1b1830"/>`);
  }
  if (lit) for (const s of SPOTS) if (lit.has(`${s.x},${s.z}`)) o.push(`<g transform="translate(${X(s.x)} ${Z(s.z)}) scale(.7)" fill="${s.id === 'walker' ? '#fff3b0' : '#ffb347'}">${SHAPES[s.id]}</g>`);
  for (const id of found) { const s = SPOTS.find((x) => x.id === id); o.push(`<circle cx="${X(s.x)}" cy="${Z(s.z)}" r="17" fill="none" stroke="${s.kind === 'person' ? '#5fd36b' : '#c9bfae'}" stroke-width="3"/>`); }
  // the places
  const tag = (x, z, t, dy = -24) => `<g><rect x="${X(x) - t.length * 3.6 - 6}" y="${Z(z) + dy - 12}" width="${t.length * 7.2 + 12}" height="18" rx="9" fill="#fffaf0"/><text x="${X(x)}" y="${Z(z) + dy + 1}" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#3b2a1e">${esc(t)}</text></g>`;
  o.push(`<rect x="${PAD + TEAM.x * C + 4}" y="${PAD + TEAM.z * C + 8}" width="${C - 8}" height="${C - 16}" rx="4" fill="#8f9aa3"/>`, tag(TEAM.x, TEAM.z, 'Car park', -26));
  o.push(`<path d="M${X(LAST_SEEN.x) - 8} ${Z(LAST_SEEN.z) - 8} l16 16 m0 -16 l-16 16" stroke="#ffd34d" stroke-width="4"/>`, tag(LAST_SEEN.x, LAST_SEEN.z, 'Last seen', -26));
  if (path) o.push(`<polyline points="${path.map((p) => `${X(p.x)},${Z(p.z)}`).join(' ')}" fill="none" stroke="#7fb0e6" stroke-width="3" stroke-dasharray="6 5"/>`);
  if (team) { o.push(`<polyline points="${team.map((p) => `${X(p.x)},${Z(p.z)}`).join(' ')}" fill="none" stroke="#5fd36b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`); const e = team[team.length - 1]; o.push(`<g transform="translate(${X(e.x)} ${Z(e.z)})"><circle r="11" fill="#e8743b" stroke="#fffaf0" stroke-width="3"/><path d="M-5 0 h10 M0 -5 v10" stroke="#fffaf0" stroke-width="3"/></g>`); }
  if (mark) o.push(`<rect x="${PAD + mark.x * C + 2}" y="${PAD + mark.z * C + 2}" width="${C - 4}" height="${C - 4}" fill="none" stroke="#ffd34d" stroke-width="4"/>`);
  if (drone) o.push(`<g transform="translate(${X(drone.x)} ${Z(drone.z)})"><rect x="${-C * 1.5}" y="${-C * 1.5}" width="${C * 3}" height="${C * 3}" fill="none" stroke="#7fb0e6" stroke-width="3"/><circle r="9" fill="#fffaf0" stroke="#1f6fd0" stroke-width="3"/><path d="M-12 -12 l24 24 m0 -24 l-24 24" stroke="#fffaf0" stroke-width="3"/></g>`);
  o.push('</svg>');
  return o.join('');
}
// The same patch of moor through each sensor (the walker sits in the middle).
function viewSvg(sensor) {
  const o = ['<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="What this camera shows">'];
  if (sensor === 'heat') o.push('<rect width="240" height="150" fill="#241c3a"/><g transform="translate(120 82) scale(2)" fill="#fff3b0">' + SHAPES.walker + '</g><g transform="translate(50 120)" fill="#4a3a6a"><ellipse rx="30" ry="8"/></g>');
  else { const zoom = sensor === 'zoom'; o.push(`<rect width="240" height="150" fill="#3a3d44"/><rect y="${zoom ? 70 : 90}" width="240" height="80" fill="#33372f"/>`); o.push(`<g transform="translate(120 ${zoom ? 90 : 100}) scale(${zoom ? 1.8 : 0.9})" fill="#3d4038">${SHAPES.walker}</g>`); }
  o.push('</svg>');
  return o.join('');
}

export async function runRescue(ctx, kit, scope) {
  const junior = kit.junior; const reduce = kit.reduce; const P = kit.panel('rescue'); let timer = 0; scope.onEnd(() => { P.remove(); clearTimeout(timer); });
  const sum = { sensor: 'heat', pattern: 'square', mins: 0, path: 0, checked: 0 };
  const wait = (ms) => new Promise((r) => { timer = setTimeout(r, ms); });
  const steps = (i) => `<ol class="dk-steps" aria-label="The rescue"><li class="${i > 0 ? 'done' : 'now'}">Camera</li><li class="${i > 1 ? 'done' : i === 1 ? 'now' : ''}">Search</li><li class="${i > 2 ? 'done' : i === 2 ? 'now' : ''}">Guide the team</li></ol>`;
  // ---- 1. which camera?
  ctx.report({ stage: 'Search and rescue: choosing the camera' });
  P.say('A walker has not come home, and the sun is setting. Their phone last had signal at the footbridge. The rescue team asks for a drone. Which camera should it carry?');
  let tries = 0; let pick = null; let reply = null;
  const draw1 = () => {
    P.main.innerHTML = `${steps(0)}${pick ? `<div class="dk-view">${viewSvg(pick)}<p>${esc(SENSORS.find((s) => s.id === pick).label)}: what it shows at dusk</p></div>` : areaSvg({})}`;
    P.side.innerHTML = `<h2>Choose the camera</h2><div class="dk-choices">${SENSORS.map((s) => `<button type="button" class="dr-btn${pick === s.id ? (s.id === 'heat' ? ' right' : ' nope') : ''}" data-sensor="${s.id}" ${reply?.right ? 'disabled' : ''}>${esc(s.label)}</button>`).join('')}</div>
      ${reply ? `<div class="dk-note ${reply.right ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(reply.text)}</div>` : ''}${reply?.right || reply?.told ? '<div class="dr-row"><button type="button" class="dr-btn go" data-k="next">Plan the search ➜</button></div>' : ''}`;
  };
  draw1(); kit.focusFirst(P.side, '[data-sensor]');
  await new Promise((res) => { P.side.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; if (b.dataset.sensor) { pick = b.dataset.sensor; reply = sensorReply(pick, tries); if (!reply.right) tries++; if (reply.told) pick = 'heat'; ctx.say(reply.text); draw1(); kit.focusFirst(P.side, reply.right || reply.told ? '[data-k]' : '[data-sensor]'); } else if (b.dataset.k) res(); }; });

  // ---- 2. the search pattern, then the search
  ctx.report({ stage: 'Search and rescue: the search' });
  P.say(`The heat camera sees a square of moor ${junior ? 'three squares wide' : `${3 * SQUARE_M} m wide`} below the drone. How should the drone search?`);
  P.main.innerHTML = `${steps(1)}${areaSvg({})}`;
  P.side.innerHTML = `<h2>Choose the search pattern</h2><div class="dk-choices">${PATTERNS.map((p) => `<button type="button" class="dr-btn" data-pattern="${p.id}">${esc(p.label)}</button>`).join('')}</div><p>Both are real patterns that rescue teams use.</p>`;
  kit.focusFirst(P.side, '[data-pattern]');
  const pat = await new Promise((res) => { P.side.onclick = (e) => { const b = e.target.closest('[data-pattern]'); if (b) res(b.dataset.pattern); }; });
  sum.pattern = pat; const path = PATTERNS.find((p) => p.id === pat).path(); const events = finds(path); const walkerAt = events.find((f) => f.spot.id === 'walker').at;
  const found = []; let i = 0;
  P.say(pat === 'square' ? 'The drone starts at the footbridge, where the walker was last seen, and flies in growing squares.' : 'The drone flies lines back and forth across the whole moor, starting in the far corner.');
  for (; i <= walkerAt; i++) {
    P.main.innerHTML = `${steps(1)}${areaSvg({ heat: { path, upto: i + 1 }, drone: path[i], path: path.slice(0, i + 1), found })}`;
    P.side.innerHTML = `<h2>Searching</h2><p>${junior ? '' : `Minute ${i + 1}. `}Warm spots are shown in yellow.</p>`;
    await wait(reduce ? 650 : 900);
    for (const ev of events.filter((f) => f.at === i)) {
      const s = ev.spot; let t = 0; let r = null; sum.checked++;
      P.say(`The heat camera has found something warm. Look closely: what is it?`);
      await new Promise((res) => {
        const draw = () => { P.side.innerHTML = `<h2>Something warm</h2><div class="dk-view">${`<svg viewBox="-40 -30 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A close look through the heat camera"><rect x="-40" y="-30" width="80" height="60" fill="#241c3a"/><g fill="${s.id === 'walker' ? '#fff3b0' : '#ffb347'}">${SHAPES[s.id]}</g></svg>`}</div>
          <div class="dk-choices">${KINDS.map((k) => `<button type="button" class="dr-btn" data-kind="${k.id}" ${r?.right || r?.told ? 'disabled' : ''}>${esc(k.label)}</button>`).join('')}</div>${r ? `<div class="dk-note ${r.right ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(r.text)}</div>` : ''}${r?.right || r?.told ? `<div class="dr-row"><button type="button" class="dr-btn go" data-k="go">${s.id === 'walker' ? 'Guide the team ➜' : 'Keep searching ➜'}</button></div>` : ''}`; };
        draw(); kit.focusFirst(P.side, '[data-kind]');
        P.side.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; if (b.dataset.kind) { r = kindReply(s, b.dataset.kind, t); if (!r.right) t++; ctx.say(r.text); draw(); kit.focusFirst(P.side, r.right || r.told ? '[data-k]' : '[data-kind]'); } else if (b.dataset.k) res(); };
      });
      found.push(s.id);
    }
  }
  sum.mins = minutesToFind(path); const other = PATTERNS.find((p) => p.id !== pat); const otherMins = minutesToFind(other.path());

  // ---- 3. guide the team to the walker
  ctx.report({ stage: 'Search and rescue: guiding the team' });
  const walker = SPOTS.find((s) => s.id === 'walker'); let team = [{ ...TEAM }]; let note = null; let done = false;
  P.say(`Found after about ${sum.mins} minutes of searching. The drone hovers over the walker with its light on. Now guide the rescue team from the car park. Tap the squares they should walk through, one at a time. They can cross the river only at the bridge, and cannot climb the crags.`);
  const draw3 = () => {
    P.main.innerHTML = `${steps(2)}<div class="dk-team">${areaSvg({ found: ['walker'], team, mark: walker, heat: { path: [{ x: walker.x, z: walker.z }], upto: 1 } })}</div>`;
    const best = shortest();
    P.side.innerHTML = `<h2>Guide the team</h2><p>${junior ? 'Tap a square next to the orange dot, or use the arrows.' : `Tap a square next to the orange dot, or use the arrows. ${team.length - 1} squares so far (${(team.length - 1) * SQUARE_M} m).`}</p>
      <div class="dk-arrows" role="group" aria-label="Move the team's way">${Object.entries({ n: '↑ North', w: '← West', e: '→ East', s: '↓ South' }).map(([d, l]) => `<button type="button" class="dr-btn" data-step="${d}" ${done ? 'disabled' : ''}>${l}</button>`).join('')}<button type="button" class="dr-btn" data-undo ${team.length < 2 || done ? 'disabled' : ''}>↶ Back one</button></div>
      ${note ? `<div class="dk-note ${note.ok ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(note.text)}</div>` : ''}
      ${done ? `<div class="dk-note good" role="status">${esc(junior ? 'The team has reached the walker. They strap the ankle and help the walker back, with the drone lighting the way.' : `The team reached the walker: ${team.length - 1} squares, about ${(team.length - 1) * SQUARE_M} m and ${walkMinutes(team.length - 1)} minutes on foot. The shortest safe way is ${best} squares.`)}</div><div class="dr-row"><button type="button" class="dr-btn go" data-k="done">Finish the rescue ➜</button></div>` : ''}`;
  };
  draw3(); kit.focusFirst(P.side, '[data-step]');
  const go = (x, z) => {
    if (done) return; const r = extend(team, x, z);
    if (!r.ok) { note = { ok: false, text: r.text }; ctx.say(r.text); } else { team = r.path; note = null; if (r.reached) { done = true; ctx.say('The team has reached the walker.'); } }
    draw3(); kit.focusFirst(P.side, done ? '[data-k]' : '[data-step]');
  };
  await new Promise((res) => {
    P.main.onclick = (e) => { const r = e.target.closest('rect[data-x]'); if (r) go(+r.dataset.x, +r.dataset.z); };
    P.side.onclick = (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return; const d = b.dataset; const end = team[team.length - 1];
      if (d.step) { go(end.x + STEPS[d.step][0], end.z + STEPS[d.step][1]); P.side.querySelector(`[data-step="${d.step}"]:not(:disabled)`)?.focus({ preventScroll: true }); }
      else if (d.undo !== undefined) { team = team.slice(0, -1); note = null; draw3(); P.side.querySelector('[data-undo]:not(:disabled), [data-step]')?.focus({ preventScroll: true }); }
      else if (d.k === 'done') res();
    };
  });
  sum.path = team.length - 1; P.remove();
  return { sum, lines: [`You chose the heat camera and searched ${pat === 'square' ? 'in growing squares from where the walker was last seen' : 'in lines across the moor'}: found in about ${sum.mins} minutes${otherMins ? ` (the other pattern would have taken about ${otherMins})` : ''}.`,
    `You checked ${sum.checked} warm ${sum.checked === 1 ? 'spot' : 'spots'} and guided the team ${junior ? 'safely to the walker' : `${sum.path} squares (${sum.path * SQUARE_M} m) to the walker`}.`] };
}

const M = '#module[data-module="drone"]';
export const M6_CSS = `
${M} .dk-view { display: grid; gap: 4px; }
${M} .dk-view svg { width: 100%; max-height: 220px; border-radius: 12px; }
${M} .dk-view p { margin: 0; font-weight: 700; text-align: center; }
${M} .dk-team svg { cursor: pointer; }
${M} .dk-arrows { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-areas: ". n ." "w s e" "u u u"; gap: 6px; }
${M} .dk-arrows [data-step="n"] { grid-area: n; } ${M} .dk-arrows [data-step="w"] { grid-area: w; } ${M} .dk-arrows [data-step="e"] { grid-area: e; } ${M} .dk-arrows [data-step="s"] { grid-area: s; }
${M} .dk-arrows [data-undo] { grid-area: u; }
`;
