// Drone delivery: the route map as an SVG string. Pure: no page, no 3D. The same drawing is the planning map in the
// module and the picture on the take-home record (with the written steps beside it).
import { ITEMS } from '../../world/catalog.js';
import { GW, GH } from './geo.js';

const ZONE = { river: '#6cc3ee', meadow: '#a5dd84', wetland: '#86c9a0', wood: '#6fb159', slope: '#b4dc7c', coast: '#eedcab', field: '#98d470' };
const C = 30; // one tile in the drawing
const PAD = 22;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const px = (g) => PAD + g * C + C / 2;
const pts = (list) => list.map((p) => `${px(p[0]).toFixed(1)},${px(p[1]).toFixed(1)}`).join(' ');

// opts: { tiles: [{gx,gz,zone,fixed}], cells: [[k,cell]], places, hand: [[gx,gz]...], route: [{gx,gz}...], plan: [{gx,gz}...],
//         end: {gx,gz} (where a flight stopped short), steps: ['Go up', ...] (adds the written steps), title }
export function mapSvg(opts) {
  const { tiles = [], cells = [], places, hand, route, plan, end, steps, title = 'Map of the island' } = opts;
  const mapW = GW * C + PAD * 2, mapH = GH * C + PAD * 2; const side = steps?.length ? 250 : 0; const W = mapW + side;
  const cellOf = new Map(cells); const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${mapH}" role="img" aria-label="${esc(title)}" font-family="Inter, system-ui, sans-serif">`);
  o.push(`<rect width="${W}" height="${mapH}" rx="14" fill="#cfeaf7"/>`);
  for (const t of tiles) {
    const c = cellOf.get(t.gx + ',' + t.gz); const x = PAD + t.gx * C, y = PAD + t.gz * C;
    const fill = c?.mark === 'town' || (c?.item && ITEMS[c.item]?.on?.includes('town') && ITEMS[c.item]?.home) ? '#f0d9a0' : ZONE[t.zone] || '#98d470';
    o.push(`<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="${fill}" stroke="#ffffff" stroke-width="1"/>`);
    const icon = t.fixed === 'ailab' ? '🤖' : t.fixed === 'oldschool' ? '🏫' : t.fixed === 'dock' ? '⛴' : c?.item && ITEMS[c.item]?.kind === 'build' ? ITEMS[c.item].icon : '';
    if (icon) o.push(`<text x="${x + C / 2}" y="${y + C / 2 + 6}" font-size="17" text-anchor="middle">${icon}</text>`);
  }
  o.push(`<text x="${mapW - 30}" y="18" font-size="13" font-weight="800" fill="#3b2a1e" text-anchor="middle">North ↑</text>`);
  if (hand?.length > 1) o.push(`<polyline points="${pts(hand)}" fill="none" stroke="#7a5a33" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" stroke-linejoin="round"/>`);
  if (plan?.length > 1) o.push(`<polyline points="${pts(plan.map((p) => [p.gx, p.gz]))}" fill="none" stroke="#1f6fd0" stroke-width="5" stroke-dasharray="9 6" stroke-linecap="round" stroke-linejoin="round"/>`);
  if (route?.length > 1) o.push(`<polyline points="${pts(route.map((p) => [p.gx, p.gz]))}" fill="none" stroke="#d2452d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
  const tip = plan?.length ? plan[plan.length - 1] : null;
  if (tip && plan.length > 1) o.push(`<circle cx="${px(tip.gx)}" cy="${px(tip.gz)}" r="7" fill="#1f6fd0" stroke="#ffffff" stroke-width="2"/>`);
  if (end) o.push(`<g stroke="#3b2a1e" stroke-width="4" stroke-linecap="round"><path d="M${px(end.gx) - 7} ${px(end.gz) - 7}L${px(end.gx) + 7} ${px(end.gz) + 7}M${px(end.gx) + 7} ${px(end.gz) - 7}L${px(end.gx) - 7} ${px(end.gz) + 7}"/></g>`);
  if (places) {
    const pin = (p, mark, fill, name) => {
      const x = px(p.gx), y = px(p.gz); const left = p.gx > GW - 5; const tx = left ? x - 17 : x + 17; const w = name.length * 6.4 + 12;
      o.push(`<circle cx="${x}" cy="${y}" r="13" fill="${fill}" stroke="#ffffff" stroke-width="3"/><text x="${x}" y="${y + 5}" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">${mark}</text>`);
      o.push(`<rect x="${left ? tx - w : tx}" y="${y - 23}" width="${w}" height="18" rx="6" fill="#fffaf0" stroke="${fill}" stroke-width="1.5"/><text x="${left ? tx - w / 2 : tx + w / 2}" y="${y - 10}" font-size="11.5" font-weight="700" fill="#3b2a1e" text-anchor="middle">${esc(name)}</text>`);
    };
    pin(places.from, 'S', '#2e7d4f', 'Start: ' + places.from.label);
    places.drops.forEach((d, i) => pin(d, String(i + 1), '#c0392b', (places.drops.length > 1 ? `Parcel ${i + 1}: ` : 'Parcel: ') + d.label));
  }
  if (side) {
    const x = mapW + 4; o.push(`<rect x="${x - 6}" y="12" width="${side - 6}" height="${mapH - 24}" rx="10" fill="#fffaf0"/>`);
    o.push(`<text x="${x + 6}" y="36" font-size="15" font-weight="800" fill="#3b2a1e">The drone's steps</text>`);
    steps.slice(0, 12).forEach((s, i) => o.push(`<text x="${x + 6}" y="${60 + i * 21}" font-size="13" fill="#3b2a1e">${i + 1}. ${esc(s)}</text>`));
    const ly = mapH - 44;
    if (hand?.length > 1) o.push(`<line x1="${x + 6}" y1="${ly}" x2="${x + 40}" y2="${ly}" stroke="#7a5a33" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/><text x="${x + 48}" y="${ly + 4}" font-size="12" fill="#3b2a1e">flown by hand</text>`);
    o.push(`<line x1="${x + 6}" y1="${ly + 18}" x2="${x + 40}" y2="${ly + 18}" stroke="#d2452d" stroke-width="5" stroke-linecap="round"/><text x="${x + 48}" y="${ly + 22}" font-size="12" fill="#3b2a1e">flown from the steps</text>`);
  }
  o.push('</svg>');
  return o.join('');
}
