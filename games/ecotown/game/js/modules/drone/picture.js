// Drone delivery: the route map as an SVG string. Pure: no page, no 3D. The same drawing is the planning map in the
// module and the picture on the take-home record (with the written steps beside it).
// Nothing is written on the map itself: each place is a ring round its square with a small letter beside it, and the
// names are in a key under the map, so a name can never be cut off or sit on top of another.
import { ITEMS } from '../../world/catalog.js';
import { GW, GH, segDist } from './geo.js';

const ZONE = { river: '#6cc3ee', meadow: '#a5dd84', wetland: '#86c9a0', wood: '#6fb159', slope: '#b4dc7c', coast: '#eedcab', field: '#98d470' };
export const MAP = { C: 30, PAD: 22 }; // one tile in the drawing, and the sea round the island
const { C, PAD } = MAP;
const ROUTE_COLOURS = ['#d2452d', '#7a3fb0'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const px = (g) => PAD + g * C + C / 2;
const wrapText = (text, max) => { const out = []; let cur = ''; for (const w of String(text).split(' ')) { if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
const pts = (list, shift = 0) => list.map((p) => `${(px(p[0]) + shift).toFixed(1)},${(px(p[1]) + shift).toFixed(1)}`).join(' ');

// Where each pin's letter goes: beside its ring, on the map, clear of the other pins, the other letters and the lines.
// pins: [{ gx, gz }]; lines: [[[gx, gz], ...], ...]. Returns [{ x, z }] in tile units (the centre of each letter's disc).
const OFFS = [[0.62, -0.62], [-0.62, -0.62], [0.62, 0.62], [-0.62, 0.62], [0, -0.86], [0, 0.86], [0.86, 0], [-0.86, 0]];
export const BADGE = { ring: 0.45, disc: 0.32 };
export function placeBadges(pins, lines = []) {
  const out = [];
  pins.forEach((p, i) => {
    let pick = null, top = -Infinity;
    for (const o of OFFS) {
      const x = p.gx + o[0], z = p.gz + o[1]; if (x < -0.85 || x > GW - 0.15 || z < -0.85 || z > GH - 0.15) continue;
      let clear = 9;
      pins.forEach((q, j) => { if (j !== i) clear = Math.min(clear, Math.hypot(q.gx - x, q.gz - z) - (BADGE.ring + BADGE.disc + 0.04)); });
      for (const b of out) clear = Math.min(clear, Math.hypot(b.x - x, b.z - z) - (BADGE.disc * 2 + 0.04));
      for (const line of lines) for (let k = 1; k < line.length; k++) clear = Math.min(clear, segDist(x, z, line[k - 1][0], line[k - 1][1], line[k][0], line[k][1]) - (BADGE.disc + 0.1));
      if (clear >= 0) { pick = { x, z }; break; } // the first clear spot, in a fixed order, so the letters do not jump about
      if (clear > top) { top = clear; pick = { x, z }; }
    }
    out.push(pick || { x: p.gx + OFFS[0][0], z: p.gz + OFFS[0][1] });
  });
  return out;
}

// opts: { tiles: [{gx,gz,zone,fixed}], cells: [[k,cell]],
//         places (the delivery being planned: pins S, 1, 2 and its no-fly zone), plan: [{gx,gz}...] (where the steps go),
//         end: {gx,gz} (where a flight stopped short), hand: [[gx,gz]...] (the hand-flown path),
//         runs: [{ places, route: [{gx,gz}...] }] (flights that delivered: one colour each, pins numbered on),
//         steps: [{ title, steps: ['Go up', ...] }] (adds the written steps, for the take-home picture), title }
export function mapSvg(opts) {
  const { tiles = [], cells = [], places, hand, plan, end, runs = [], steps, keySide = false, title = 'Map of the island' } = opts;
  const mapW = GW * C + PAD * 2, mapH = GH * C + PAD * 2; const cellOf = new Map(cells);
  // ---- the pins and the key under the map
  const pins = []; const keyRows = []; const from = places?.from || runs[0]?.places.from;
  const groups = places ? [places] : runs.map((r) => r.places); const total = groups.reduce((n, g) => n + g.drops.length, 0);
  if (from) { pins.push({ gx: from.gx, gz: from.gz, mark: 'S', fill: '#2e7d4f' }); keyRows.push({ mark: 'S', fill: '#2e7d4f', text: `Start: ${from.label}` }); }
  let n = 0; for (const g of groups) for (const d of g.drops) { n++; pins.push({ gx: d.gx, gz: d.gz, mark: String(n), fill: '#c0392b' }); keyRows.push({ mark: String(n), fill: '#c0392b', text: `${total > 1 ? `Parcel ${n}` : 'Parcel'}: ${d.label}` }); }
  const nofly = [...new Set(groups.flatMap((g) => g.nofly || []))];
  const lineKeys = [];
  if (hand?.length > 1) lineKeys.push({ kind: 'hand', text: 'flown by hand' });
  if (plan) lineKeys.push({ kind: 'plan', text: 'where your steps go' });
  runs.forEach((r, i) => { if (r.route?.length > 1) lineKeys.push({ kind: 'run', colour: ROUTE_COLOURS[i % 2], text: runs.length > 1 ? `flown from the steps: delivery ${i + 1}` : 'flown from the steps' }); });
  if (end) lineKeys.push({ kind: 'end', text: 'where the drone stopped' });
  if (nofly.length) lineKeys.push({ kind: 'nofly', text: 'birds nesting: no flying' });
  // the key goes under the map, or (keySide: a wide, short picture for an upright screen) in a column beside it
  const keyW = keySide ? 250 : 0; const placed = []; const keyFlow = []; let keyEnd = mapH;
  if (keySide) {
    const x = mapW + 12; let y = 28;
    for (const r of keyRows) { const ls = wrapText(r.text, 27); placed.push({ ...r, x, y, ls }); y += ls.length * 16 + 8; }
    y += 4; for (const k of lineKeys) { keyFlow.push({ ...k, x, y }); y += 22; }
    keyEnd = y;
  } else {
    let y = mapH + 16; for (const r of keyRows) { const ls = wrapText(r.text, 52); placed.push({ ...r, x: PAD, y, ls }); y += ls.length * 16 + 4; }
    y += 4; let x = PAD; for (const k of lineKeys) { const w = 40 + k.text.length * 6.4 + 14; if (x + w > mapW - 8 && x > PAD) { x = PAD; y += 20; } keyFlow.push({ ...k, x, y }); x += w; }
    keyEnd = y + (lineKeys.length ? 12 : -8);
  }
  // ---- the written steps (the take-home picture)
  const groupsOfSteps = (steps || []).filter((g) => g?.steps?.length); const side = groupsOfSteps.length ? 250 : 0;
  const stepRows = groupsOfSteps.reduce((m, g) => m + 1.6 + g.steps.length, 0); const stepGap = stepRows > 22 ? 15.5 : 19;
  const W = mapW + keyW + side; const H = Math.max(mapH, keyEnd, side ? 44 + stepRows * stepGap + 8 : 0);
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Math.ceil(H)}" role="img" aria-label="${esc(title)}" font-family="Inter, system-ui, sans-serif">`);
  if (nofly.length) o.push('<defs><pattern id="dr-nofly" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#ffd34d"/><rect width="3.5" height="8" fill="#3b2a1e"/></pattern></defs>');
  o.push(`<rect width="${W}" height="${Math.ceil(H)}" rx="14" fill="#fffaf0"/><rect width="${mapW}" height="${mapH}" rx="14" fill="#cfeaf7"/>`);
  for (const t of tiles) {
    const c = cellOf.get(t.gx + ',' + t.gz); const x = PAD + t.gx * C, y = PAD + t.gz * C;
    const fill = c?.mark === 'town' || (c?.item && ITEMS[c.item]?.on?.includes('town') && ITEMS[c.item]?.home) ? '#f0d9a0' : ZONE[t.zone] || '#98d470';
    o.push(`<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="${fill}" stroke="#ffffff" stroke-width="1"/>`);
    const icon = t.fixed === 'ailab' ? '🤖' : t.fixed === 'oldschool' ? '🏫' : t.fixed === 'dock' ? '⛴' : c?.item && ITEMS[c.item]?.kind === 'build' ? ITEMS[c.item].icon : '';
    if (icon) o.push(`<text x="${x + C / 2}" y="${y + C / 2 + 6}" font-size="17" text-anchor="middle">${icon}</text>`);
  }
  for (const k of nofly) { const [gx, gz] = k.split(',').map(Number); o.push(`<rect x="${PAD + gx * C + 1.5}" y="${PAD + gz * C + 1.5}" width="${C - 3}" height="${C - 3}" rx="4" fill="url(#dr-nofly)" stroke="#3b2a1e" stroke-width="1.5"/><circle cx="${px(gx)}" cy="${px(gz)}" r="9" fill="#fffaf0"/><text x="${px(gx)}" y="${px(gz) + 4.5}" font-size="12" text-anchor="middle">🐦</text>`); }
  o.push(`<text x="${mapW - 34}" y="17" font-size="12" font-weight="800" fill="#3b2a1e" text-anchor="middle">North ↑</text>`);
  const lines = [];
  if (hand?.length > 1) o.push(`<polyline points="${pts(hand)}" fill="none" stroke="#7a5a33" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" stroke-linejoin="round"/>`);
  runs.forEach((r, i) => { if (!(r.route?.length > 1)) return; const line = r.route.map((p) => [p.gx, p.gz]); lines.push(line); o.push(`<polyline points="${pts(line, i ? 3.5 : 0)}" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts(line, i ? 3.5 : 0)}" fill="none" stroke="${ROUTE_COLOURS[i % 2]}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`); });
  if (plan?.length > 1) { const line = plan.map((p) => [p.gx, p.gz]); lines.push(line); o.push(`<polyline points="${pts(line)}" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts(line)}" fill="none" stroke="#1f6fd0" stroke-width="5" stroke-dasharray="9 6" stroke-linecap="round" stroke-linejoin="round"/>`); }
  // the pins: a ring round the square (the building's picture stays visible) and a letter beside it
  const spots = placeBadges(pins, lines);
  pins.forEach((p, i) => {
    const x = px(p.gx), y = px(p.gz), bx = px(spots[i].x), by = px(spots[i].z);
    o.push(`<circle cx="${x}" cy="${y}" r="${BADGE.ring * C}" fill="none" stroke="#ffffff" stroke-width="6.5"/><circle cx="${x}" cy="${y}" r="${BADGE.ring * C}" fill="none" stroke="${p.fill}" stroke-width="3.5"/>`);
    o.push(`<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${BADGE.disc * C}" fill="${p.fill}" stroke="#ffffff" stroke-width="2"/><text x="${bx.toFixed(1)}" y="${(by + 4.3).toFixed(1)}" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">${p.mark}</text>`);
  });
  const tip = plan?.length ? plan[plan.length - 1] : null;
  if (tip) o.push(`<circle cx="${px(tip.gx)}" cy="${px(tip.gz)}" r="7" fill="#1f6fd0" stroke="#ffffff" stroke-width="2.5"/>`);
  const cross = (x, y, r = 7) => `<path d="M${x - r} ${y - r}L${x + r} ${y + r}M${x + r} ${y - r}L${x - r} ${y + r}" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/><path d="M${x - r} ${y - r}L${x + r} ${y + r}M${x + r} ${y - r}L${x - r} ${y + r}" stroke="#3b2a1e" stroke-width="4" stroke-linecap="round"/>`;
  if (end) o.push(cross(px(end.gx), px(end.gz)));
  // the key
  for (const r of placed) {
    const { x, y } = r;
    o.push(`<circle cx="${x + 9}" cy="${y - 4}" r="8.5" fill="${r.fill}"/><text x="${x + 9}" y="${y}" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">${r.mark}</text>`);
    r.ls.forEach((l, i) => o.push(`<text x="${x + 26}" y="${y + i * 16}" font-size="12.5" font-weight="600" fill="#3b2a1e">${esc(l)}</text>`));
  }
  for (const k of keyFlow) {
    const { x, y } = k;
    if (k.kind === 'hand') o.push(`<line x1="${x}" y1="${y - 4}" x2="${x + 32}" y2="${y - 4}" stroke="#7a5a33" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`);
    else if (k.kind === 'plan') o.push(`<line x1="${x}" y1="${y - 4}" x2="${x + 32}" y2="${y - 4}" stroke="#1f6fd0" stroke-width="5" stroke-dasharray="9 6" stroke-linecap="round"/>`);
    else if (k.kind === 'run') o.push(`<line x1="${x}" y1="${y - 4}" x2="${x + 32}" y2="${y - 4}" stroke="${k.colour}" stroke-width="5" stroke-linecap="round"/>`);
    else if (k.kind === 'end') o.push(cross(x + 16, y - 4, 5));
    else o.push(`<rect x="${x + 6}" y="${y - 13}" width="18" height="18" rx="3" fill="url(#dr-nofly)" stroke="#3b2a1e" stroke-width="1.5"/>`);
    o.push(`<text x="${x + 40}" y="${y}" font-size="12" fill="#3b2a1e">${esc(k.text)}</text>`);
  }
  if (side) {
    const x = mapW + keyW + 10; let y = 30;
    o.push(`<line x1="${mapW + keyW + 0.5}" y1="14" x2="${mapW + 0.5}" y2="${Math.ceil(H) - 14}" stroke="#e6d3b0" stroke-width="2"/>`);
    for (const g of groupsOfSteps) {
      o.push(`<text x="${x}" y="${y}" font-size="14" font-weight="800" fill="#3b2a1e">${esc(g.title)}</text>`); y += stepGap * 1.1;
      g.steps.slice(0, 12).forEach((s, i) => { o.push(`<text x="${x}" y="${y.toFixed(1)}" font-size="12.5" fill="#3b2a1e">${i + 1}. ${esc(s)}</text>`); y += stepGap; });
      y += stepGap * 0.5;
    }
  }
  o.push('</svg>');
  return o.join('');
}
