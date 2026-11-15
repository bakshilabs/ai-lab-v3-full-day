// Mission 6 page: design a flood rescue robot, test it in the simulated street, improve it, then a harder street.
import { BODIES, SENSORS6, BATTERIES, FLOATS, PARTS, STREETS, WH_PER_KG_MIN, weightOf, ready, simulate, testLine, designWords, cleanDesign } from './m6-flood.js';
import { esc } from './shell.js';
import { stageOf } from './missions.js';

const INK = '#3b2a1e';
const TILE = { road: '#9aa3ad', rubble: '#b98a52', mud: '#7a5230', shallow: '#7fc3e6', deep: '#2f6fb0', house: '#d9c7a3' };
// The street, side on: one tile per part, the robot where it got to, a tick or a cross on each part tried.
export function streetSvg(street, res = null, upto = null) {
  const n = street.parts.length; const W = 110; const tried = res ? res.parts.slice(0, upto ?? res.parts.length) : [];
  const tiles = street.parts.map((p, i) => { const x = 10 + i * W; const r = tried[i]; const water = p === 'shallow' || p === 'deep';
    const base = water ? `<rect x="${x}" y="${p === 'deep' ? 70 : 96}" width="${W}" height="${p === 'deep' ? 70 : 44}" fill="${TILE[p]}" opacity=".9"/><rect x="${x}" y="140" width="${W}" height="20" fill="#6b4420"/>`
      : p === 'house' ? `<rect x="${x}" y="120" width="${W}" height="40" fill="#7fc3e6"/><rect x="${x + 18}" y="46" width="74" height="84" fill="#5a4a3a" stroke="${INK}" stroke-width="2.5"/><path d="M${x + 10} 50l45-30l45 30z" fill="#8a3a2a" stroke="${INK}" stroke-width="2.5"/><rect x="${x + 44}" y="60" width="22" height="18" fill="#1d2430"/>`
        : `<rect x="${x}" y="120" width="${W}" height="40" fill="${TILE[p]}"/>${p === 'rubble' ? `<path d="M${x + 14} 120l10-16l14 4l10-12l16 10l14-6l10 20z" fill="#c25a3c" stroke="${INK}" stroke-width="2"/>` : ''}${p === 'mud' ? `<ellipse cx="${x + 55}" cy="122" rx="40" ry="6" fill="#5a3a20"/>` : ''}${p === 'road' ? `<path d="M${x + 10} 140h30M${x + 60} 140h30" stroke="#fff" stroke-width="4"/>` : ''}`;
    const mark = r ? `<circle cx="${x + W / 2}" cy="186" r="13" fill="${r.ok ? '#1f7a44' : '#b3501f'}"/><text x="${x + W / 2}" y="191" font-size="15" font-weight="800" fill="#fff" text-anchor="middle">${r.ok ? '✓' : '✗'}</text>` : '';
    return `${base}<text x="${x + W / 2}" y="214" font-size="13" font-weight="800" text-anchor="middle" fill="${INK}">${esc(PARTS[p].j)}</text>${mark}`; }).join('');
  const at = tried.length ? tried.length - 1 : -1; const last = tried[at]; const rx = 10 + Math.max(0, at) * W + (last && !last.ok ? 30 : 60); const sank = last && !last.ok && /sank|sink/i.test(last.why);
  const bot = `<g transform="translate(${res ? rx : 30} ${sank ? 122 : 98})"><rect x="0" y="0" width="34" height="22" rx="6" fill="#16c79a" stroke="${INK}" stroke-width="2.5"/><rect x="6" y="-12" width="20" height="12" rx="3" fill="#243447" stroke="${INK}" stroke-width="2"/><circle cx="20" cy="-6" r="3" fill="#ffd866"/></g>`;
  const person = res?.found ? `<g transform="translate(${10 + (n - 1) * W + 58} 78)"><circle r="7" fill="#f2c531" stroke="${INK}" stroke-width="2"/><path d="M-8 6h16v14h-16z" fill="#d9533d" stroke="${INK}" stroke-width="2"/></g><text x="${10 + (n - 1) * W + 55}" y="40" font-size="13" font-weight="800" fill="#1f7a44" text-anchor="middle">Found!</text>` : '';
  return `<svg class="rb-street2" viewBox="0 0 ${20 + n * W} 224" role="img" aria-label="${esc(street.j)}: ${street.parts.map((p) => PARTS[p].j).join(', ')}"><rect width="${20 + n * W}" height="224" rx="12" fill="#dfeaf3"/>${tiles}${bot}${person}</svg>`;
}
// The robot as designed, small
export function designSvg(dz) {
  const b = dz.body; const fl = dz.floats && BODIES[b]?.floats;
  const base = b === 'wheels' ? `<circle cx="20" cy="50" r="9" fill="#3b4656" stroke="${INK}" stroke-width="2.5"/><circle cx="56" cy="50" r="9" fill="#3b4656" stroke="${INK}" stroke-width="2.5"/>`
    : b === 'tracks' ? `<rect x="8" y="42" width="60" height="16" rx="8" fill="#3b4656" stroke="${INK}" stroke-width="2.5"/><circle cx="18" cy="50" r="4" fill="#b9c2cb"/><circle cx="38" cy="50" r="4" fill="#b9c2cb"/><circle cx="58" cy="50" r="4" fill="#b9c2cb"/>`
      : b === 'legs' ? `<path d="M18 40l-6 18M30 40l4 18M46 40l-4 18M58 40l6 18" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
        : b === 'boat' ? `<path d="M4 40h68l-10 16H14z" fill="#f08a2c" stroke="${INK}" stroke-width="2.5"/>` : '';
  const floats = fl ? `<rect x="2" y="30" width="12" height="18" rx="6" fill="#f4b73b" stroke="${INK}" stroke-width="2"/><rect x="62" y="30" width="12" height="18" rx="6" fill="#f4b73b" stroke="${INK}" stroke-width="2"/>` : '';
  const cams = `${dz.sensors.includes('camera') ? `<rect x="20" y="8" width="14" height="10" rx="2" fill="#4a86d9" stroke="${INK}" stroke-width="2"/>` : ''}${dz.sensors.includes('heat') ? `<rect x="42" y="8" width="14" height="10" rx="2" fill="#d9533d" stroke="${INK}" stroke-width="2"/>` : ''}`;
  const batt = `<rect x="30" y="26" width="${dz.battery === 'big' ? 22 : 12}" height="10" rx="2" fill="#7be0a3" stroke="${INK}" stroke-width="2"/>`;
  return `<svg class="rb-design" viewBox="0 0 76 64" width="152" height="128" role="img" aria-label="Your robot: ${esc(designWords(dz, true) || 'not chosen yet')}">${b ? `<rect x="12" y="16" width="52" height="28" rx="6" fill="#16c79a" stroke="${INK}" stroke-width="2.5"/>${batt}${cams}${floats}${base}` : `<rect x="12" y="16" width="52" height="28" rx="6" fill="#efe3c8" stroke="#b49562" stroke-width="2.5" stroke-dasharray="5 4"/><text x="38" y="36" font-size="16" text-anchor="middle" fill="#8a7050">?</text>`}</svg>`;
}

export async function playM6(ctx, sh, cur, keep) {
  const j = sh.junior; const d = { tests: [0, 0], design: null, d1: null, ...(cur?.d || {}) }; let part = cur?.part || 0;
  const steps = ['Design', 'Test and improve', 'The water rises'];
  let dz = cleanDesign(d.design || {});
  for (; part <= 1; part++) {
    if (ctx.signal.aborted) return null;
    const street = STREETS[part]; let res = null; let shown = null; let ok = false; let running = false;
    sh.setup({ mission: { n: 6, icon: '🌊' }, steps, stage: `m6-${street.id}` }); sh.step(part === 0 ? 0 : 2); ctx.report({ stage: stageOf(6, part ? 'testing in the deeper water' : 'designing and testing') });
    sh.say(part === 0 ? (j ? 'Someone is waiting in a dark house at the end of a flooded street. Design a robot to reach them. Choose a body, at least one sensor and a battery. Then press Test.' : 'Design a robot to reach a dark house at the end of a flooded street. Every part adds weight, and weight uses battery. Test, read the failure, improve.')
      : (j ? 'The river is still rising. Now part of the street is deep water. Change your robot and test again.' : 'The river has risen: there is now 1.5 m of water mid-street. Redesign and retest.'));
    const save = () => { d.design = dz; keep(part, d); };
    await sh.wait((done) => {
      function draw(focus = null) {
        const kg = weightOf(dz); const can = ready(dz); const b = BODIES[dz.body];
        const opt = (group, id, on, label, extra = '', off = false) => `<button type="button" class="rb-opt${on ? ' on' : ''}" data-g="${group}" data-id="${id}" aria-pressed="${on}" ${off || running ? 'disabled' : ''}>${label}${extra}</button>`;
        sh.main.innerHTML = `<div class="rb-m6"><div class="rb-panel rb-dbox"><div class="rb-dtop">${designSvg(dz)}<div><h3>Your robot</h3><p>${esc(designWords(dz, j) || (j ? 'Choose its parts.' : 'No design yet.'))}</p>${j ? `<span class="rb-wt" aria-label="Weight">${'■'.repeat(Math.round(kg / 3))}<small> ${kg > 20 ? 'heavy' : kg > 14 ? 'medium' : kg ? 'light' : ''}</small></span>` : `<p class="rb-wt"><b>${kg} kg</b>${dz.floats && b?.floats ? ` · floats hold ${FLOATS.holds} kg` : ''}</p>`}</div></div>
            <h4>Body</h4><div class="rb-opts">${Object.entries(BODIES).map(([id, x]) => opt('body', id, dz.body === id, `<span aria-hidden="true">${x.icon}</span> ${esc(x[j ? 'j' : 's'])}`, j ? '' : ` <small>${x.kg} kg</small>`)).join('')}</div>
            <h4>Sensors</h4><div class="rb-opts">${Object.entries(SENSORS6).map(([id, x]) => opt('sensor', id, dz.sensors.includes(id), `<span aria-hidden="true">${x.icon}</span> ${esc(x[j ? 'j' : 's'])}`, j ? '' : ` <small>+${x.kg} kg</small>`)).join('')}</div>
            <h4>Extras and power</h4><div class="rb-opts">${opt('floats', 'floats', dz.floats && !!b?.floats, '<span aria-hidden="true">🛟</span> Floats', j ? '' : ` <small>+${FLOATS.kg} kg</small>`, !!b && !b.floats)}${Object.entries(BATTERIES).map(([id, x]) => opt('battery', id, dz.battery === id, `<span aria-hidden="true">🔋</span> ${esc(x[j ? 'j' : 's'])}`, j ? '' : ` <small>+${x.kg} kg</small>`)).join('')}</div>
            ${b && !b.floats ? `<p class="rb-addhint">${dz.body === 'legs' ? 'Floats do not fit on legs.' : 'A boat already floats.'}</p>` : ''}${can ? '' : `<p class="rb-addhint">${j ? 'Choose a body and at least one sensor.' : 'Needs a body and a sensor.'}</p>`}</div>
          <div class="rb-panel rb-simbox"><h3>${esc(street[j ? 'j' : 's'])}<small>${j ? 'The simulation' : 'Simulation'}</small></h3>${streetSvg(street, shown, shown?.upto)}
            ${shown && !j ? `<p class="rb-tunenote">Battery used: ${shown.used} of ${shown.wh} Wh · ${shown.mins} min</p>` : ''}${shown && j ? `<span class="rb-batt" aria-label="Battery left"><i style="width:${Math.max(0, 100 - Math.round((100 * shown.used) / shown.wh))}%"></i></span>` : ''}
            ${res ? `<ol class="rb-log">${res.parts.map((p) => `<li class="${p.ok ? 'ok' : 'unsafe'}"><span aria-hidden="true">${PARTS[p.part].icon}</span><div><b>${esc(PARTS[p.part][j ? 'j' : 's'])}:</b> ${esc(p.why)}</div><em class="rb-mk ${p.ok ? 'ok' : 'unsafe'}">${p.ok ? '✓' : '✗'}</em></li>`).join('')}</ol><p class="rb-verdict ${res.found ? 'ok' : 'miss'}" aria-live="polite">${esc(testLine(res, j))}</p>` : ''}</div></div>`;
        sh.main.querySelectorAll('.rb-opt').forEach((btn) => { btn.onclick = () => {
          if (running) return; const g = btn.dataset.g; const id = btn.dataset.id;
          if (g === 'body') { dz.body = id; if (!BODIES[id].floats) dz.floats = false; } else if (g === 'sensor') dz.sensors = dz.sensors.includes(id) ? dz.sensors.filter((x) => x !== id) : [...dz.sensors, id];
          else if (g === 'floats') dz.floats = !dz.floats; else dz.battery = id;
          dz = cleanDesign(dz); res = null; shown = null; ok = false; save(); draw(`.rb-opt[data-g="${g}"][data-id="${id}"]`); foot();
        }; });
        if (focus && sh.keys()) sh.main.querySelector(focus)?.focus();
      }
      function foot() {
        sh.foot.innerHTML = `<p class="rb-hint">${ok ? (j ? 'It worked!' : 'Rescue found.') : `${j ? 'Tests' : 'Tests run'}: ${d.tests[part]}`}</p><button type="button" class="rb-btn ${ok ? 'alt' : 'go'}" data-run ${!ready(dz) || running ? 'disabled' : ''}>▶ Test</button>${ok ? `<button type="button" class="rb-btn go" data-next>${part === 0 ? 'Next street' : 'Carry on'} ➜</button>` : ''}`;
        sh.foot.querySelector('[data-run]').onclick = go; const n = sh.foot.querySelector('[data-next]'); if (n) n.onclick = () => done();
      }
      const fresh = sh.guard();
      function go() {
        if (running || !ready(dz) || !fresh()) return; const r = simulate(street, dz, j); d.tests[part]++; running = true; if (part === 0) sh.step(1); res = null; let k = 0;
        const end = () => { running = false; res = r; shown = { ...r, upto: r.parts.length }; ok = r.found; if (ok) { if (part === 0) d.d1 = { ...dz }; else d.d2 = { ...dz }; } save(); draw(); foot(); ctx.say(testLine(r, j)); sh.focusSoon(ok ? '[data-next]' : '.rb-opt'); };
        if (sh.still) { end(); return; }
        const tick = () => { if (ctx.signal.aborted) return; k++; shown = { ...r, upto: k, used: Math.round(r.parts.slice(0, k).reduce((s, p) => s + (p.ok ? p.mins * r.kg * WH_PER_KG_MIN : 0), 0)), mins: r.parts.slice(0, k).reduce((s, p) => s + p.mins, 0) }; draw(); if (k < r.parts.length) sh.later(tick, 700); else sh.later(end, 500); };
        foot(); tick();
      }
      draw(); foot(); sh.focusSoon('.rb-opt');
    });
    keep(part + 1, d);
  }
  return { d1: d.d1, d2: d.d2, tests: d.tests };
}
