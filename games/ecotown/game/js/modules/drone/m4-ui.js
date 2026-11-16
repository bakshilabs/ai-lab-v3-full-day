// Mission 4, farm survey: the pictures and the taps. Rules and words are in m4-survey.js.
import { FOOT, NEED, NEED_ALONG, SQUARE_M, FIELDS, SPACINGS, plan, result, PLOTS, SICK, health, plotAt, inSick, sickShare, tapReply, ADVICE, adviceReply } from './m4-survey.js';
import { esc } from './kit.js';

const C = 34, PAD = 16;
const CROP = { meadow: '#a5dd84', potatoes: '#c9a35a', barley: '#9ccc65', wheat: '#e0c76a', grass: '#7cc06a' };
// a smooth scale from red (struggling) through yellow to green (healthy), as health maps are drawn
const mix = (a, b, k) => '#' + [0, 2, 4].map((i) => Math.round(parseInt(a.slice(1 + i, 3 + i), 16) * (1 - k) + parseInt(b.slice(1 + i, 3 + i), 16) * k).toString(16).padStart(2, '0')).join('');
const healthColour = (v) => (v < 0.5 ? mix('#c8321f', '#e8c33a', Math.max(0, (v - 0.2) / 0.3)) : mix('#e8c33a', '#1f8a4c', Math.min(1, (v - 0.5) / 0.35)));

// The field from above, with the planned lines and their photo strips. shown: how much of the route is flown (0..1),
// or null for the plan itself.
function fieldSvg(field, p, { shown = null, junior }) {
  const W = field.w * C + PAD * 2, H = field.h * C + PAD * 2; const X = (v) => PAD + v * C, Z = (v) => PAD + v * C;
  const o = [`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(field.name)} from above, with the survey lines">`];
  o.push('<defs><pattern id="dk-gap" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#ffe0d8"/><rect width="4" height="10" fill="#d2452d"/></pattern></defs>');
  o.push(`<rect width="${W}" height="${H}" rx="12" fill="#6fb159"/>`);
  for (let x = 0; x < field.w; x++) for (let z = 0; z < field.h; z++) {
    const pl = field.id === 'farm' ? plotAt(x, z) : null; const c = pl ? CROP[pl.crop] : CROP.meadow;
    o.push(`<rect x="${X(x)}" y="${Z(z)}" width="${C}" height="${C}" fill="${c}" stroke="#ffffff" stroke-opacity=".35" stroke-width="1"/>`);
  }
  o.push(`<rect x="${X(0)}" y="${Z(0)}" width="${field.w * C}" height="${field.h * C}" fill="none" stroke="#4f7a35" stroke-width="4"/>`);
  // the photo strips: each line's width of ground, drawn see-through so overlaps show darker
  const total = p.lines.length; const upto = shown === null ? total : shown * total;
  p.lines.forEach((l, i) => {
    if (i >= upto) return; const part = shown === null ? 1 : Math.min(1, upto - i);
    const [x0, z0, x1, z1] = l; const ns = x0 === x1; const xe = x0 + (x1 - x0) * part, ze = z0 + (z1 - z0) * part;
    const rx = ns ? X(x0 - FOOT / 2) : X(Math.min(x0, xe)), ry = ns ? Z(Math.min(z0, ze)) : Z(z0 - FOOT / 2), rw = ns ? FOOT * C : Math.abs(xe - x0) * C, rh = ns ? Math.abs(ze - z0) * C : FOOT * C;
    o.push(`<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="#1f6fd0" fill-opacity="${shown === null ? 0.38 : 0.42}" stroke="#1f4f96" stroke-opacity=".9" stroke-width="2.5"/>`);
  });
  // gaps: strips of ground no photo reaches (hatched red), shown in the plan as a warning
  if (p.gaps) {
    const across = p.dir === 'ns' ? field.w : field.h; const pos = p.lines.map((l) => (p.dir === 'ns' ? l[0] : l[1]));
    for (let c = 0; c < across; c++) { const mid = c + 0.5; if (pos.some((q) => Math.abs(q - mid) <= FOOT / 2)) continue; o.push(p.dir === 'ns' ? `<rect x="${X(c)}" y="${Z(0)}" width="${C}" height="${field.h * C}" fill="url(#dk-gap)"/>` : `<rect x="${X(0)}" y="${Z(c)}" width="${field.w * C}" height="${C}" fill="url(#dk-gap)"/>`); }
  }
  // the route: lines joined by the turns
  const pts = []; p.lines.forEach((l) => { pts.push([l[0], l[1]], [l[2], l[3]]); });
  o.push(`<polyline points="${pts.map(([x, z]) => `${X(x)},${Z(z)}`).join(' ')}" fill="none" stroke="#3b2a1e" stroke-width="2.5" stroke-dasharray="7 5"/>`);
  if (shown !== null && shown < 1) { // the drone, partway along
    const seg = shown * total; const i = Math.min(total - 1, Math.floor(seg)); const k = seg - i; const [x0, z0, x1, z1] = p.lines[i];
    o.push(`<g transform="translate(${X(x0 + (x1 - x0) * k)} ${Z(z0 + (z1 - z0) * k)})"><circle r="11" fill="#fffaf0" stroke="#3b2a1e" stroke-width="2"/><path d="M-6 0 h12 M0 -6 v12" stroke="#3b2a1e" stroke-width="3"/></g>`);
  }
  if (!junior) o.push(`<text x="${W - PAD}" y="${H - 4}" text-anchor="end" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#fffaf0">1 square = ${SQUARE_M} m</text>`);
  o.push('</svg>');
  return o.join('');
}

// The finished map of Hilltop Farm: the normal photo, or the plant health view. mark: squares to ring (a hint).
function farmSvg(view, { mark = null, found = [], junior }) {
  const f = FIELDS[1]; const W = f.w * C + PAD * 2, H = f.h * C + PAD * 2; const X = (v) => PAD + v * C, Z = (v) => PAD + v * C;
  const o = [`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The map of Hilltop Farm, ${view === 'health' ? 'plant health view' : 'normal photo'}">`, `<rect width="${W}" height="${H}" rx="12" fill="#4f7a35"/>`];
  for (let x = 0; x < f.w; x++) for (let z = 0; z < f.h; z++) {
    const pl = plotAt(x, z); const n = ((x * 5 + z * 11) % 4) * 6;
    const c = view === 'health' ? healthColour(health(x, z)) : CROP[pl.crop];
    o.push(`<rect data-x="${x}" data-z="${z}" x="${X(x)}" y="${Z(z)}" width="${C}" height="${C}" fill="${c}"/>`);
    if (view !== 'health') o.push(`<path d="M${X(x) + 4} ${Z(z) + 8 + n / 3} h${C - 8} M${X(x) + 4} ${Z(z) + 20 + n / 3} h${C - 8}" stroke="#000" stroke-opacity=".08" stroke-width="2"/>`);
  }
  for (const pl of PLOTS) o.push(`<rect x="${X(pl.x)}" y="${Z(pl.z)}" width="${pl.w * C}" height="${pl.h * C}" fill="none" stroke="#3d5f2a" stroke-width="4"/>`);
  for (const id of found) { const r = id === 'sick' ? SICK : PLOTS.find((p) => p.id === id); o.push(`<rect x="${X(r.x) + 3}" y="${Z(r.z) + 3}" width="${r.w * C - 6}" height="${r.h * C - 6}" fill="none" stroke="#fffaf0" stroke-width="4" stroke-dasharray="9 5"/>`); }
  if (mark) o.push(`<rect x="${X(mark.x) - 3}" y="${Z(mark.z) - 3}" width="${mark.w * C + 6}" height="${mark.h * C + 6}" fill="none" stroke="#1f6fd0" stroke-width="5"/>`);
  o.push('</svg>');
  return o.join('');
}

export async function runSurvey(ctx, kit, scope) {
  const junior = kit.junior; const reduce = kit.reduce; const P = kit.panel('survey'); scope.onEnd(() => { P.remove(); cancelAnimationFrame(raf); });
  let raf = 0; const sum = { lanes: 0, overlap: 0, along: 'ns', flights: 0 };
  // ---- part 1: two fields to plan
  for (const [fi, field] of FIELDS.entries()) {
    ctx.report({ stage: `Farm survey: planning the lines over ${field.name.toLowerCase()}` });
    // ages 13-17 also set how far apart the photos are along each line on the farm (front overlap)
    let cfg = { ...field.start, ...(!junior && field.battery ? { along: 2 } : {}) }; let res = null; let tries = 0;
    P.say(fi === 0 ? `This is ${field.name.toLowerCase()}. The drone will fly up and down in lines, taking photos. Each line of photos is the width of the blue strip. Choose how far apart the lines are, then fly the survey.`
      : `Now ${field.name}. It is bigger, and the battery ${junior ? 'is limited' : `holds ${field.battery * SQUARE_M} m of flying`}. Every turn at the end of a line uses battery too. Choose the way the lines run and how far apart they are.${cfg.along ? ' Mapping teams also overlap the photos along each line, by about 75%.' : ''}`);
    const draw = (shown = null) => {
      const p = plan(field, cfg);
      P.main.innerHTML = `<ol class="dk-steps" aria-label="Two fields"><li class="${fi ? 'done' : 'now'}">Hay meadow</li><li class="${fi ? 'now' : ''}">Hilltop Farm</li><li>Read the map</li></ol>${fieldSvg(field, p, { shown, junior })}`;
      return p;
    };
    const side = () => {
      const p = plan(field, cfg); const bat = field.battery ? Math.min(1, p.length / field.battery) : 0;
      P.side.innerHTML = `<h2>${esc(field.name)}: the survey lines</h2>
        ${field.dirs.length > 1 ? `<div class="dr-row" role="group" aria-label="Which way the lines run"><button type="button" class="dr-btn${cfg.dir === 'ns' ? ' picked' : ''}" data-dir="ns" aria-pressed="${cfg.dir === 'ns'}">↕ Lines run north to south</button><button type="button" class="dr-btn${cfg.dir === 'ew' ? ' picked' : ''}" data-dir="ew" aria-pressed="${cfg.dir === 'ew'}">↔ Lines run east to west</button></div>` : ''}
        <div class="dr-row" role="group" aria-label="How far apart the lines are"><button type="button" class="dr-btn" data-gap="-1" ${cfg.spacing <= SPACINGS[0] ? 'disabled' : ''}>Lines closer</button><button type="button" class="dr-btn" data-gap="1" ${cfg.spacing >= SPACINGS[SPACINGS.length - 1] ? 'disabled' : ''}>Lines further apart</button></div>
        ${cfg.along ? `<div class="dr-row" role="group" aria-label="How far apart the photos are along a line"><button type="button" class="dr-btn" data-along="-1" ${cfg.along <= 1 ? 'disabled' : ''}>Photos closer along the line</button><button type="button" class="dr-btn" data-along="1" ${cfg.along >= 3 ? 'disabled' : ''}>Photos further apart</button></div>` : ''}
        <div class="dk-note" data-dk-readout>${p.count} lines. ${junior ? (p.gaps ? 'There are gaps between the strips.' : p.overlap >= NEED ? 'Each strip covers more than half of the next one.' : p.overlap > 0 ? 'The strips overlap a little.' : 'The strips only just touch.') : `Spacing ${cfg.spacing * SQUARE_M} m, so the lines overlap by ${p.overlap}%${p.gaps ? ', with gaps' : ''}.${p.front !== null ? ` Photos every ${cfg.along * SQUARE_M} m along a line: ${p.front}% overlap along it (aim for ${NEED_ALONG}%).` : ''}`}</div>
        ${field.battery ? `<div class="dr-bat${p.fits ? '' : ' over'}"><span>🔋 Battery</span><span class="dr-bar" aria-hidden="true"><i style="width:${Math.round(bat * 100)}%"></i></span><b>${junior ? (p.fits ? 'Enough' : 'Not enough') : `${p.length * SQUARE_M} of ${field.battery * SQUARE_M} m`}</b></div>` : ''}
        ${res ? `<div class="dk-note ${res.ok ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(res.text)}</div>` : ''}
        <div class="dr-row">${res?.ok ? `<button type="button" class="dr-btn go" data-k="next">${fi ? 'Look at the map ➜' : 'Next field ➜'}</button>` : '<button type="button" class="dr-btn go" data-fly>▶ Fly the survey</button>'}</div>`;
    };
    draw(); side(); kit.focusFirst(P.side, '[data-gap], [data-dir]');
    await new Promise((resolve) => {
      P.side.onclick = (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled) return; const d = b.dataset;
        if (d.gap) { cfg.spacing = Math.max(1, Math.min(6, cfg.spacing + +d.gap)); res = null; draw(); side(); P.side.querySelector(`[data-gap="${d.gap}"]:not(:disabled)`)?.focus({ preventScroll: true }); }
        else if (d.along) { cfg.along = Math.max(1, Math.min(3, cfg.along + +d.along)); res = null; draw(); side(); P.side.querySelector(`[data-along="${d.along}"]:not(:disabled)`)?.focus({ preventScroll: true }); }
        else if (d.dir) { cfg.dir = d.dir; res = null; draw(); side(); P.side.querySelector(`[data-dir="${d.dir}"]`)?.focus({ preventScroll: true }); }
        else if (d.fly !== undefined) {
          const p = plan(field, cfg); sum.flights++; ctx.report({ stage: `Farm survey: flying the survey over ${field.name.toLowerCase()}` });
          for (const x of P.side.querySelectorAll('button')) x.disabled = true;
          const finish = () => { res = result(field, p, junior); if (!res.ok) tries++; draw(res.ok ? 1 : null); side(); P.say(res.text); kit.focusFirst(P.side, res.ok ? '[data-k]' : '[data-gap], [data-dir]'); if (res.ok) { sum.lanes = p.count; sum.overlap = p.overlap; sum.along = p.dir; if (p.front !== null) sum.front = p.front; } };
          // the flight: the drone goes along the lines and the photos appear behind it (with reduced motion: all at once)
          const upto = p.fits ? 1 : Math.max(0.2, field.battery / p.length);
          if (reduce) { draw(upto); finish(); return; }
          const t0 = performance.now(); const secs = 3.2 + p.count * 0.35;
          const tick = () => { const k = Math.min(upto, (performance.now() - t0) / 1000 / secs); draw(k); if (k < upto) raf = requestAnimationFrame(tick); else finish(); };
          raf = requestAnimationFrame(tick);
        } else if (d.k === 'next') resolve();
      };
    });
    void tries;
  }

  // ---- part 2: read the map of Hilltop Farm
  let view = 'normal'; const found = []; let mark = null; let reply = null;
  const tasks = ['dry', 'sick', ...(junior ? [] : ['share']), 'advice']; let ti = 0; const misses = {};
  const ASK = { dry: 'Find the dry field. Tap it on the map.', sick: 'The farmer thinks some barley is sick, but it all looks green. Switch to the plant health view and tap the sick patch.', share: 'How much of the barley field is sick?', advice: 'What should the farmer do?' };
  ctx.report({ stage: 'Farm survey: reading the map' });
  P.say('The photos are joined into one map of Hilltop Farm. A map like this shows a farmer where to look. Find the dry field: tap it.');
  const draw = () => {
    P.main.innerHTML = `<ol class="dk-steps" aria-label="The steps"><li class="done">Hay meadow</li><li class="done">Hilltop Farm</li><li class="now">Read the map</li></ol>
      <div class="dr-row" role="group" aria-label="Map view"><button type="button" class="dr-btn${view === 'normal' ? ' picked' : ''}" data-view="normal" aria-pressed="${view === 'normal'}">📷 Normal photo</button><button type="button" class="dr-btn${view === 'health' ? ' picked' : ''}" data-view="health" aria-pressed="${view === 'health'}">🌱 Plant health view</button></div>
      <div class="dk-farm">${farmSvg(view, { mark, found, junior })}</div>
      ${view === 'health' ? `<p class="dk-legend"><span class="dk-scale"></span>${junior ? 'Red: struggling · yellow: a bit stressed · green: healthy' : 'Plant health score from 0 (red) to 1 (green), made from near-infrared light our eyes cannot see'}</p>` : ''}`;
  };
  const side = () => {
    const t = tasks[ti]; const share = sickShare();
    P.side.innerHTML = `<h2>Reading the map (${Math.min(ti + 1, tasks.length)} of ${tasks.length})</h2><p class="dk-ask">${esc(ASK[t] || '')}</p>
      ${t === 'share' ? `<p>The sick patch is ${SICK.w * SICK.h} squares. The barley field is ${PLOTS[1].w * PLOTS[1].h} squares.</p><div class="dk-choices">${[Math.round(share / 2), share, 50].map((v) => `<button type="button" class="dr-btn" data-share="${v}">About ${v}%</button>`).join('')}</div>` : ''}
      ${t === 'advice' ? `<div class="dk-choices">${ADVICE.map((a) => `<button type="button" class="dr-btn" data-advice="${a.id}">${esc(a.label)}</button>`).join('')}</div>` : ''}
      ${reply ? `<div class="dk-note ${reply.right ? 'good' : 'warn'}" role="status" data-dk-reply>${esc(reply.text)}</div>` : ''}
      ${!t ? '<div class="dr-row"><button type="button" class="dr-btn go" data-k="done">Finish the survey ➜</button></div>' : ''}
      ${t === 'dry' || t === 'sick' ? '<p class="dk-tip">Tap the map, or choose a place here:</p><div class="dk-choices dk-places" role="group" aria-label="Places on the map">' + [...PLOTS.map((p) => `<button type="button" class="dr-btn" data-at="${p.x + 1},${p.z + 1}">${esc(p.name.charAt(0).toUpperCase() + p.name.slice(1))}</button>`), ...(t === 'sick' ? [['9,2', 'west'], ['12,2', 'middle'], ['15,2', 'east']].map(([at, w]) => `<button type="button" class="dr-btn" data-at="${at}">The ${w} part of the barley</button>`) : [])].join('') + '</div>' : ''}`;
  };
  draw(); side();
  const answer = (x, z) => {
    const t = tasks[ti]; if (t !== 'dry' && t !== 'sick') return;
    const r = tapReply(t, x, z, view, misses[t] || 0); reply = r; ctx.say(r.text);
    if (r.right) { found.push(t === 'dry' ? 'potatoes' : 'sick'); mark = null; ti++; if (tasks[ti]) P.say(ASK[tasks[ti]]); }
    else { misses[t] = (misses[t] || 0) + 1; if (misses[t] >= 2) mark = t === 'dry' ? PLOTS[0] : SICK; }
    draw(); side(); kit.focusFirst(P.side, '[data-share], [data-advice], [data-k], [data-at]');
  };
  await new Promise((resolve) => {
    P.main.onclick = (e) => {
      const v = e.target.closest('[data-view]'); if (v) { view = v.dataset.view; draw(); P.main.querySelector(`[data-view="${view}"]`)?.focus({ preventScroll: true }); if (view === 'health') ctx.say('The plant health view: green is healthy, yellow is a bit stressed, red is struggling.'); return; }
      const r = e.target.closest('rect[data-x]'); if (r) answer(+r.dataset.x, +r.dataset.z);
    };
    P.side.onclick = (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return; const d = b.dataset;
      if (d.at) { const [x, z] = d.at.split(',').map(Number); answer(x, z); }
      else if (d.share) { const right = +d.share === sickShare(); reply = { right, text: right ? `Yes: ${SICK.w * SICK.h} out of ${PLOTS[1].w * PLOTS[1].h} squares is about ${sickShare()}%. Most of the barley is fine.` : `Count again: ${SICK.w * SICK.h} squares out of ${PLOTS[1].w * PLOTS[1].h}. Divide, then multiply by 100.` }; ctx.say(reply.text); if (right) { ti++; P.say(ASK[tasks[ti]]); } side(); kit.focusFirst(P.side, '[data-advice], [data-share]'); }
      else if (d.advice) { const r = adviceReply(d.advice); reply = r; ctx.say(r.text); if (r.right) ti++; side(); kit.focusFirst(P.side, r.right ? '[data-k]' : '[data-advice]'); }
      else if (d.k === 'done') resolve();
    };
  });
  P.remove();
  return { sum: { lanes: sum.lanes, overlap: sum.overlap, along: sum.along, ...(sum.front ? { front: sum.front } : {}) },
    lines: [junior ? `You planned survey lines close enough for the photos to overlap, and turned them to fit the battery.` : `You planned ${sum.lanes} lines with ${sum.overlap}% overlap, running ${sum.along === 'ew' ? 'east to west' : 'north to south'} to fit the battery.`,
      'You found the dry field in the photo and the sick patch in the plant health view.'] };
}

const M = '#module[data-module="drone"]';
export const M4_CSS = `
${M} .dk-farm svg { cursor: pointer; }
${M} .dk-legend { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; font-weight: 700; font-size: .92em; }
${M} .dk-legend span { display: inline-block; width: 16px; height: 16px; border-radius: 4px; margin-right: -6px; }
${M} .dk-legend .dk-scale { width: 90px; margin-right: 0; background: linear-gradient(90deg, #c8321f, #e8c33a, #1f8a4c); }
${M} .dk-places { grid-template-columns: repeat(2, minmax(0, 1fr)); }
${M} .dk-places .dr-btn { min-height: 40px; padding: 6px 10px; font-size: .92em; }
${M} .dk-tip { font-size: .85em; color: #5e4936; }
`;
