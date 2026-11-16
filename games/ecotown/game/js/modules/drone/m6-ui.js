// Mission 6, search and rescue as it gets dark: the pictures and the taps. Rules and words are in m6-rescue.js.
// Ages 8-12 run one search; ages 13-17 run a second one after dark, where nobody knows where the walker went.
import { W, H, SQUARE_M, SCENES, isRiver, isBridge, isCrag, isWood, walkerOf, SENSORS, sensorReply, PATTERNS, covered, finds, compareSearch, KINDS, kindReply, STEPS, extend, shortest, walkMinutes } from './m6-rescue.js';
import { esc } from './kit.js';

const C = 40, PAD = 14;
const X = (v) => PAD + v * C + C / 2, Z = (v) => PAD + v * C + C / 2;
function ground(x, z, sc) { if (isRiver(x, z, sc)) return '#2f4f6b'; if (isBridge(x, z, sc)) return '#7a5a3a'; if (isCrag(x, z, sc)) return '#4a4038'; if (isWood(x, z, sc)) return '#2f4a2c'; return (x + z) % 2 ? '#56664a' : '#5b6b4d'; }
const SHAPES = {
  deer: '<ellipse cx="0" cy="0" rx="16" ry="8"/><rect x="-12" y="4" width="3" height="14"/><rect x="-6" y="4" width="3" height="14"/><rect x="6" y="4" width="3" height="14"/><rect x="11" y="4" width="3" height="14"/><path d="M12 -4 L20 -18 L26 -18 L22 -10 Z"/>',
  sheep: '<ellipse cx="-9" cy="0" rx="9" ry="7"/><ellipse cx="11" cy="2" rx="9" ry="7"/><rect x="-14" y="5" width="2.5" height="7"/><rect x="-6" y="5" width="2.5" height="7"/><rect x="6" y="7" width="2.5" height="7"/><rect x="14" y="7" width="2.5" height="7"/>',
  walker: '<circle cx="-2" cy="-14" r="6"/><path d="M-8 -8 h12 v12 h-12 z"/><path d="M-8 4 h22 v5 h-22 z"/><path d="M4 -6 L14 -18 L17 -15 L7 -3 Z"/>',
};
function areaSvg(sc, { heat = null, drone = null, path = null, found = [], team = null, mark = null }) {
  const o = [`<svg viewBox="0 0 ${W * C + PAD * 2} ${H * C + PAD * 2}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Map of ${esc(sc.name)} as it gets dark">`, `<rect width="${W * C + PAD * 2}" height="${H * C + PAD * 2}" rx="12" fill="#2b2a3a"/>`];
  const lit = heat ? covered(heat.path, heat.upto) : null;
  for (let x = 0; x < W; x++) for (let z = 0; z < H; z++) {
    const k = `${x},${z}`; const hot = lit?.has(k);
    o.push(`<rect data-x="${x}" data-z="${z}" x="${PAD + x * C}" y="${PAD + z * C}" width="${C}" height="${C}" fill="${hot ? (isRiver(x, z, sc) ? '#1b1830' : '#2a2140') : ground(x, z, sc)}" stroke="#000" stroke-opacity=".18"/>`);
    if (!hot && isCrag(x, z, sc)) o.push(`<path d="M${PAD + x * C + 6} ${PAD + z * C + 30} l8 -18 l8 12 l6 -8 l8 14" stroke="#8a7a6a" stroke-width="3" fill="none"/>`);
    if (!hot && isWood(x, z, sc)) o.push(`<circle cx="${X(x)}" cy="${Z(z)}" r="12" fill="#3e6a38"/>`);
  }
  if (lit) for (const s of sc.spots) if (lit.has(`${s.x},${s.z}`)) o.push(`<g transform="translate(${X(s.x)} ${Z(s.z)}) scale(.7)" fill="${s.kind === 'person' ? '#fff3b0' : '#ffb347'}">${SHAPES[s.shape]}</g>`);
  for (const id of found) { const s = sc.spots.find((x) => x.id === id); o.push(`<circle cx="${X(s.x)}" cy="${Z(s.z)}" r="17" fill="none" stroke="${s.kind === 'person' ? '#5fd36b' : '#c9bfae'}" stroke-width="3"/>`); }
  const tag = (x, z, t, dy = -24) => `<g><rect x="${X(x) - t.length * 3.6 - 6}" y="${Z(z) + dy - 12}" width="${t.length * 7.2 + 12}" height="18" rx="9" fill="#fffaf0"/><text x="${X(x)}" y="${Z(z) + dy + 1}" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#3b2a1e">${esc(t)}</text></g>`;
  o.push(`<rect x="${PAD + sc.team.x * C + 4}" y="${PAD + sc.team.z * C + 8}" width="${C - 8}" height="${C - 16}" rx="4" fill="#8f9aa3"/>`, tag(sc.team.x, sc.team.z, 'Car park', -26));
  if (sc.known) o.push(`<path d="M${X(sc.lastSeen.x) - 8} ${Z(sc.lastSeen.z) - 8} l16 16 m0 -16 l-16 16" stroke="#ffd34d" stroke-width="4"/>`, tag(sc.lastSeen.x, sc.lastSeen.z, sc.lastSeen.label, -26));
  if (path) o.push(`<polyline points="${path.map((p) => `${X(p.x)},${Z(p.z)}`).join(' ')}" fill="none" stroke="#7fb0e6" stroke-width="3" stroke-dasharray="6 5"/>`);
  if (team) { o.push(`<polyline points="${team.map((p) => `${X(p.x)},${Z(p.z)}`).join(' ')}" fill="none" stroke="#5fd36b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`); const e = team[team.length - 1]; o.push(`<g transform="translate(${X(e.x)} ${Z(e.z)})"><circle r="11" fill="#e8743b" stroke="#fffaf0" stroke-width="3"/><path d="M-5 0 h10 M0 -5 v10" stroke="#fffaf0" stroke-width="3"/></g>`); }
  if (mark) o.push(`<rect x="${PAD + mark.x * C + 2}" y="${PAD + mark.z * C + 2}" width="${C - 4}" height="${C - 4}" fill="none" stroke="#ffd34d" stroke-width="4"/>`);
  if (drone) o.push(`<g transform="translate(${X(drone.x)} ${Z(drone.z)})"><rect x="${-C * 1.5}" y="${-C * 1.5}" width="${C * 3}" height="${C * 3}" fill="none" stroke="#7fb0e6" stroke-width="3"/><circle r="9" fill="#fffaf0" stroke="#1f6fd0" stroke-width="3"/><path d="M-12 -12 l24 24 m0 -24 l-24 24" stroke="#fffaf0" stroke-width="3"/></g>`);
  o.push('</svg>');
  return o.join('');
}
// The same patch of moor through each sensor (the walker sits in the middle): dim and grey, or warm and bright.
function viewSvg(sensor) {
  const o = ['<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="What this camera shows">'];
  if (sensor === 'heat') o.push('<rect width="240" height="150" fill="#241c3a"/><g transform="translate(120 82) scale(2)" fill="#fff3b0">' + SHAPES.walker + '</g><g transform="translate(50 120)" fill="#4a3a6a"><ellipse rx="30" ry="8"/></g>');
  else { const zoom = sensor === 'zoom'; o.push(`<rect width="240" height="150" fill="#5a5f66"/><rect y="${zoom ? 70 : 90}" width="240" height="80" fill="#4b5444"/><g fill="#465040"><circle cx="40" cy="${zoom ? 70 : 90}" r="18"/><circle cx="200" cy="${zoom ? 72 : 92}" r="14"/></g>`); o.push(`<g transform="translate(120 ${zoom ? 90 : 100}) scale(${zoom ? 1.8 : 0.9})" fill="#3f463b">${SHAPES.walker}</g>`); }
  o.push('</svg>');
  return o.join('');
}

export async function runRescue(ctx, kit, scope) {
  const junior = kit.junior; const reduce = kit.reduce; const P = kit.panel('rescue'); let timer = 0; scope.onEnd(() => { P.remove(); clearTimeout(timer); });
  const scenes = junior ? SCENES.slice(0, 1) : SCENES;
  const sum = { sensor: 'heat', pattern: 'square', mins: 0, path: 0, checked: 0, searches: scenes.length, best: 0 };
  const wait = (ms) => new Promise((r) => { timer = setTimeout(r, ms); });
  const steps = (i, si) => `<ol class="dk-steps" aria-label="The rescue">${scenes.length > 1 ? `<li class="done">Search ${si + 1} of ${scenes.length}</li>` : ''}<li class="${i > 0 ? 'done' : 'now'}">Camera</li><li class="${i > 1 ? 'done' : i === 1 ? 'now' : ''}">Search</li><li class="${i > 2 ? 'done' : i === 2 ? 'now' : ''}">Guide the team</li></ol>`;
  const S0 = scenes[0];
  // ---- 1. which camera?
  ctx.report({ stage: 'Search and rescue: choosing the camera' });
  P.say('A walker has not come home, and it is getting dark. Their phone last had signal at the footbridge. The rescue team asks for a drone. Which camera should it carry?');
  let tries = 0; let pick = null; let reply = null;
  const draw1 = () => {
    P.main.innerHTML = `${steps(0, 0)}${pick ? `<div class="dk-view">${viewSvg(pick)}<p>${esc(SENSORS.find((s) => s.id === pick).label)}: what it shows as it gets dark</p></div>` : areaSvg(S0, {})}`;
    P.side.innerHTML = `<h2>Choose the camera</h2><div class="dk-choices">${SENSORS.map((s) => `<button type="button" class="dr-btn${pick === s.id ? (s.id === 'heat' ? ' right' : ' nope') : ''}" data-sensor="${s.id}" ${reply?.right ? 'disabled' : ''}>${esc(s.label)}</button>`).join('')}</div>
      ${reply ? `<div class="dk-note ${reply.right ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(reply.text)}</div>` : ''}${reply?.right || reply?.told ? '<div class="dr-row"><button type="button" class="dr-btn go" data-k="next">Plan the search ➜</button></div>' : ''}`;
  };
  draw1(); kit.focusFirst(P.side, '[data-sensor]');
  await new Promise((res) => { P.side.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; if (b.dataset.sensor) { pick = b.dataset.sensor; reply = sensorReply(pick, tries, junior); if (!reply.right) tries++; if (reply.told) pick = 'heat'; P.say(reply.text); draw1(); kit.focusFirst(P.side, reply.right || reply.told ? '[data-k]' : '[data-sensor]'); } else if (b.dataset.k) res(); }; });

  for (const [si, sc] of scenes.entries()) {
    // ---- 2. the search pattern, then the search
    ctx.report({ stage: `Search and rescue: search ${si + 1} of ${scenes.length}` });
    P.say(si === 0 ? `The heat camera sees a square of ground ${junior ? 'three squares wide' : `${3 * SQUARE_M} m wide`} below the drone. How should the drone search?`
      : 'Later that night, a second call: another walker is missing near the forest edge. They set off early and walked all day, and their phone had no signal. Only their car at the car park is known. How should the drone search this time?');
    P.main.innerHTML = `${steps(1, si)}${areaSvg(sc, {})}`;
    P.side.innerHTML = `<h2>Choose the search pattern</h2><div class="dk-choices">${PATTERNS.map((p) => `<button type="button" class="dr-btn" data-pattern="${p.id}">${esc(p.id === 'square' && !sc.known ? 'Squares growing out from the car park' : p.label)}</button>`).join('')}</div><p>Both are real patterns that rescue teams use. Think about what you know.</p>`;
    kit.focusFirst(P.side, '[data-pattern]');
    const pat = await new Promise((res) => { P.side.onclick = (e) => { const b = e.target.closest('[data-pattern]'); if (b) res(b.dataset.pattern); }; });
    if (si === 0) sum.pattern = pat;
    const path = PATTERNS.find((p) => p.id === pat).path(sc); const events = finds(path, sc); const walkerAt = events.find((f) => f.spot.kind === 'person').at;
    const found = [];
    P.say(pat === 'square' ? `The drone starts at ${sc.known ? 'the footbridge, where the walker was last seen' : 'the car park'}, and flies in growing squares.` : 'The drone flies lines back and forth across the whole area, starting in the far corner.');
    for (let i = 0; i <= walkerAt; i++) {
      P.main.innerHTML = `${steps(1, si)}${areaSvg(sc, { heat: { path, upto: i + 1 }, drone: path[i], path: path.slice(0, i + 1), found })}`;
      P.side.innerHTML = `<h2>Searching</h2><p>${junior ? '' : `Minute ${i + 1}. `}Warm spots show up yellow.</p>`;
      await wait(reduce ? 650 : 900);
      for (const ev of events.filter((f) => f.at === i)) {
        const s = ev.spot; let t = 0; let r = null; sum.checked++;
        P.say('The heat camera has found something warm. Look closely: what is it?');
        await new Promise((res) => {
          const draw = () => { P.side.innerHTML = `<h2>Something warm</h2><div class="dk-view"><svg viewBox="-40 -30 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A close look through the heat camera"><rect x="-40" y="-30" width="80" height="60" fill="#241c3a"/><g fill="${s.kind === 'person' ? '#fff3b0' : '#ffb347'}">${SHAPES[s.shape]}</g></svg></div>
            <div class="dk-choices">${KINDS.map((k) => `<button type="button" class="dr-btn" data-kind="${k.id}" ${r?.right || r?.told ? 'disabled' : ''}>${esc(k.label)}</button>`).join('')}</div>${r ? `<div class="dk-note ${r.right ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(r.text)}</div>` : ''}${r?.right || r?.told ? `<div class="dr-row"><button type="button" class="dr-btn go" data-k="go">${s.kind === 'person' ? 'Next ➜' : 'Keep searching ➜'}</button></div>` : ''}`; };
          draw(); kit.focusFirst(P.side, '[data-kind]');
          P.side.onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; if (b.dataset.kind) { r = kindReply(s, b.dataset.kind, t); if (!r.right) t++; P.say(r.text); draw(); kit.focusFirst(P.side, r.right || r.told ? '[data-k]' : '[data-kind]'); } else if (b.dataset.k) res(); };
        });
        found.push(s.id);
      }
    }
    // both times side by side: the choice was a real one
    const cmp = compareSearch(sc, pat); if (pat === cmp.best) sum.best++; if (si === 0) sum.mins = cmp.mins[pat];
    P.say(cmp.text);
    P.side.innerHTML = `<h2>How long did it take?</h2><div class="dk-times">${PATTERNS.map((p) => `<div class="${p.id === pat ? 'yours' : ''}"><b>${p.id === 'square' ? 'Growing squares' : 'Lines'}${p.id === pat ? ' (yours)' : ''}</b><span>about ${cmp.mins[p.id]} min</span></div>`).join('')}</div><p class="dk-note">${esc(cmp.text)}</p><div class="dr-row"><button type="button" class="dr-btn go" data-k="go">Guide the team ➜</button></div>`;
    kit.focusFirst(P.side, '[data-k]');
    await new Promise((res) => { P.side.onclick = (e) => { if (e.target.closest('[data-k]')) res(); }; });

    // ---- 3. guide the team to the walker
    ctx.report({ stage: `Search and rescue: guiding the team (${si + 1} of ${scenes.length})` });
    const walker = walkerOf(sc); let team = [{ ...sc.team }]; let note = null; let done = false;
    P.say(`The drone hovers over the walker with its light on. Now guide the rescue team from the car park. Tap the squares they should walk to: a tap in a straight line from the orange dot takes them all the way along it. They can cross the river only at the bridge, and cannot climb the crags.`);
    const draw3 = () => {
      P.main.innerHTML = `${steps(2, si)}<div class="dk-team">${areaSvg(sc, { found: [walker.id], team, mark: walker, heat: { path: [{ x: walker.x, z: walker.z }], upto: 1 } })}</div>`;
      const best = shortest(sc);
      P.side.innerHTML = `<h2>Guide the team</h2><p>${junior ? 'Tap a square in a straight line from the orange dot, or use the arrows.' : `Tap a square in a straight line from the orange dot, or use the arrows. ${team.length - 1} squares so far (${(team.length - 1) * SQUARE_M} m).`}</p>
        ${done ? '' : `<div class="dk-arrows" role="group" aria-label="Move the team's way">${Object.entries({ n: '↑ North', w: '← West', e: '→ East', s: '↓ South' }).map(([d, l]) => `<button type="button" class="dr-btn" data-step="${d}">${l}</button>`).join('')}<button type="button" class="dr-btn" data-undo ${team.length < 2 ? 'disabled' : ''}>↶ Back one</button></div>`}
        ${note ? `<div class="dk-note ${note.ok ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(note.text)}</div>` : ''}
        ${done ? `<div class="dk-note good" role="status">${esc(junior ? 'The team has reached the walker. They strap the ankle and help the walker back, with the drone lighting the way.' : `The team reached the walker: ${team.length - 1} squares, about ${(team.length - 1) * SQUARE_M} m and ${walkMinutes(team.length - 1)} minutes on foot. The shortest safe way is ${best} squares.`)}</div><div class="dr-row"><button type="button" class="dr-btn go" data-k="done">${si < scenes.length - 1 ? 'Next call ➜' : 'Finish the rescue ➜'}</button></div>` : ''}`;
    };
    draw3(); kit.focusFirst(P.side, '[data-step]');
    const go = (x, z) => {
      if (done) return;
      // a tap on a square straight along from the orange dot adds the whole straight run, square by square, as far as it is safe
      const end = team[team.length - 1]; const dx = Math.sign(x - end.x), dz = Math.sign(z - end.z); const n = Math.abs(x - end.x) + Math.abs(z - end.z);
      const straight = (dx === 0 || dz === 0) && n > 1; let r = null;
      if (straight) { for (let i = 0; i < n; i++) { const e = team[team.length - 1]; r = extend(team, e.x + dx, e.z + dz, sc); if (!r.ok || r.reached) break; team = r.path; } }
      else r = extend(team, x, z, sc);
      if (!r.ok) { note = { ok: false, text: straight ? `The team went as far as it safely could. ${r.text}` : r.text }; P.say(note.text); } else { team = r.path; note = null; if (r.reached) { done = true; P.say('The team has reached the walker.'); } }
      draw3(); kit.focusFirst(P.side, done ? '[data-k]' : '[data-step]');
    };
    await new Promise((res) => {
      P.main.onclick = (e) => { const r = e.target.closest('rect[data-x]'); if (r) go(+r.dataset.x, +r.dataset.z); };
      P.side.onclick = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled) return; const d = b.dataset; const end = team[team.length - 1];
        if (d.step) { go(end.x + STEPS[d.step][0], end.z + STEPS[d.step][1]); P.side.querySelector(`[data-step="${d.step}"]:not(:disabled)`)?.focus({ preventScroll: true }); }
        else if (d.undo !== undefined) { team = team.slice(0, -1); note = null; draw3(); kit.focusFirst(P.side, '[data-undo], [data-step]'); }
        else if (d.k === 'done') res();
      };
    });
    P.main.onclick = null; sum.path += team.length - 1;
  }
  P.remove();
  const lines = [`You chose the heat camera and searched ${sum.pattern === 'square' ? 'in growing squares from the last sighting' : 'in lines across the moor'}: found in about ${sum.mins} minutes.`];
  if (scenes.length > 1) lines.push(`On the second call, with no last sighting, you chose ${sum.best === 2 ? 'the quicker pattern again' : 'a pattern and compared it with the other'}.`);
  lines.push(`You checked ${sum.checked} warm spots and guided the team ${junior ? 'safely to the walker' : `${sum.path * SQUARE_M} m in all`}.`);
  return { sum, lines };
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
${M} .dk-times { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
${M} .dk-times div { display: grid; gap: 2px; padding: 8px 10px; border-radius: 12px; background: #f6ecd6; }
${M} .dk-times div.yours { box-shadow: inset 0 0 0 3px #1f6fd0; }
${M} .dk-times span { font-size: 1.3em; font-weight: 800; }
`;
