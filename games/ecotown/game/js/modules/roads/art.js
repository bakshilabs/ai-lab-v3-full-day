// 2D pictures for the roads module's missions, as inline SVG strings. Pure: no page. Drawn in the game's warm, flat
// style. Things in a street are drawn in metres and put into a driver's-eye view by a simple perspective, so the same
// thing can be drawn as a camera picture, a radar screen or a lidar point picture.
//
// A thing: { kind, x (metres right of the car's centre line), z (metres ahead), colour?, lit?, hidden? (0..1 covered) }

export const W = 800, H = 420, HOR = 168;           // picture size and the horizon line
const F = 520, CAM_H = 1.3;                          // focal length in pixels, the camera's height in metres
export const project = (x, y, z) => ({ sx: W / 2 + (x * F) / z, sy: HOR + ((CAM_H - y) * F) / z, s: F / z });
const r2 = (n) => Math.round(n * 100) / 100;

// ---- the things, in metres: origin at the feet, y up (so drawn with negative y)
const SKIN = ['#f1c9a5', '#c68e5f', '#8a5a3c', '#e0ac7e'];
export const SHAPES = {
  person: (c = '#2f6fd8', i = 0) => `<rect x="-.2" y="-.86" width=".15" height=".86" fill="#3b4a5a"/><rect x=".05" y="-.86" width=".15" height=".86" fill="#3b4a5a"/><rect x="-.27" y="-1.46" width=".54" height=".66" rx=".1" fill="${c}"/><circle cy="-1.62" r=".17" fill="${SKIN[i % 4]}"/><path d="M-.17 -1.68 a.17 .17 0 0 1 .34 0z" fill="#3b2a1e"/>`,
  child: (c = '#e0a020', i = 1) => `<g transform="scale(.7)">${SHAPES.person(c, i)}</g>`,
  cyclist: (c = '#b23a26') => `<circle cx="-.55" cy="-.34" r=".32" fill="none" stroke="#2a2f35" stroke-width=".07"/><circle cx=".55" cy="-.34" r=".32" fill="none" stroke="#2a2f35" stroke-width=".07"/><path d="M-.55 -.34 L-.1 -.85 L.4 -.85 L.55 -.34 M-.1 -.85 L0 -.34 L-.55 -.34" fill="none" stroke="#ff5a3c" stroke-width=".07"/><rect x="-.3" y="-1.45" width=".38" height=".6" rx=".1" fill="${c}" transform="rotate(12 -.1 -1.1)"/><circle cx=".05" cy="-1.62" r=".16" fill="#e0ac7e"/><path d="M-.13 -1.66 a.18 .18 0 0 1 .36 0z" fill="#ffd166"/>`,
  car: (c = '#3d6e8a') => `<rect x="-.92" y="-1.05" width="1.84" height=".78" rx=".16" fill="${c}"/><rect x="-.7" y="-1.5" width="1.4" height=".5" rx=".14" fill="${c}"/><rect x="-.6" y="-1.44" width="1.2" height=".36" rx=".08" fill="#9fd0ee"/><rect x="-.85" y="-.3" width=".32" height=".3" fill="#1f1a17"/><rect x=".53" y="-.3" width=".32" height=".3" fill="#1f1a17"/><rect x="-.86" y="-.92" width=".3" height=".16" fill="#ff3b2f"/><rect x=".56" y="-.92" width=".3" height=".16" fill="#ff3b2f"/><rect x="-.3" y="-.62" width=".6" height=".16" fill="#f6f3ea"/>`,
  van: (c = '#e8e2d2') => `<rect x="-1.05" y="-2.4" width="2.1" height="2.15" rx=".12" fill="${c}" stroke="#8a8170" stroke-width=".04"/><rect x="-.95" y="-.35" width=".4" height=".35" fill="#1f1a17"/><rect x=".55" y="-.35" width=".4" height=".35" fill="#1f1a17"/><rect x="-1" y="-1.1" width=".28" height=".18" fill="#ff3b2f"/><rect x=".72" y="-1.1" width=".28" height=".18" fill="#ff3b2f"/><line x1="0" y1="-2.35" x2="0" y2="-.3" stroke="#8a8170" stroke-width=".04"/>`,
  light: (lamp = 'red') => `<rect x="-.06" y="-3" width=".12" height="3" fill="#2a2f35"/><rect x="-.22" y="-3.7" width=".44" height="1" rx=".08" fill="#1f1a17"/>${['red', 'amber', 'green'].map((k, n) => `<circle cy="${-3.53 + n * .32}" r=".12" fill="${k === lamp ? { red: '#ff3b2f', amber: '#ffb000', green: '#2ee06a' }[k] : '#3a3a3a'}"/>`).join('')}`,
  sign: (text = '20') => `<rect x="-.05" y="-2.1" width=".1" height="2.1" fill="#8a9099"/><circle cy="-2.45" r=".38" fill="#fff" stroke="#d8261c" stroke-width=".09"/><text y="-2.33" font-size=".36" font-weight="800" text-anchor="middle" fill="#1f1a17">${text}</text>`,
  dog: (c = '#a8642a') => `<rect x="-.4" y="-.5" width=".7" height=".28" rx=".12" fill="${c}"/><rect x=".2" y="-.68" width=".26" height=".24" rx=".07" fill="${c}"/><rect x="-.36" y="-.24" width=".08" height=".24" fill="${c}"/><rect x=".16" y="-.24" width=".08" height=".24" fill="${c}"/><path d="M-.4 -.45 l-.18 -.12" stroke="${c}" stroke-width=".06"/>`,
  chair: (c = '#7a4fb0') => `<circle cx="-.1" cy="-.34" r=".34" fill="none" stroke="#2a2f35" stroke-width=".07"/><circle cx=".38" cy="-.08" r=".08" fill="#2a2f35"/><path d="M-.3 -.62 L.35 -.62 L.38 -.12 M-.3 -.62 L-.32 -1.1" fill="none" stroke="#5a6470" stroke-width=".06"/><rect x="-.28" y="-1.2" width=".46" height=".6" rx=".1" fill="${c}"/><rect x=".1" y="-.7" width=".34" height=".14" fill="#3b4a5a"/><circle cx="-.04" cy="-1.36" r=".16" fill="#c68e5f"/>`,
  post: () => `<rect x="-.12" y="-1" width=".24" height="1" rx=".05" fill="#5a6470"/><rect x="-.12" y="-.85" width=".24" height=".1" fill="#f6f3ea"/>`,
  // a shop window with a person reflected in the glass (the person is not in the street)
  mirror: () => `<rect x="-1.5" y="-2.5" width="3" height="2.5" fill="#6b4a33"/><rect x="-1.38" y="-2.38" width="2.76" height="2.2" fill="#a9d4ea"/><path d="M-1.38 -.9 L-.3 -2.38 L.2 -2.38 L-1.38 -.2z" fill="#e6f4fb" opacity=".7"/><g opacity=".55" transform="translate(.35 -.2) scale(.9)">${SHAPES.person('#c8553d', 0)}</g><text x="0" y="-2.55" font-size=".3" font-weight="800" text-anchor="middle" fill="#3b2a1e">SHOP</text>`,
  // a bus-stop poster with a person printed on it
  poster: () => `<rect x="-.08" y="-2.3" width=".08" height="2.3" fill="#5a6470"/><rect x="-.66" y="-2.3" width="1.32" height="2.05" fill="#2a2f35"/><rect x="-.58" y="-2.22" width="1.16" height="1.89" fill="#ffe9a8"/><g transform="translate(0 -.45) scale(.95)">${SHAPES.person('#1f7f49', 1)}</g><text y="-.38" font-size=".18" font-weight="800" text-anchor="middle" fill="#b23a26">JUICE!</text>`,
  bag: () => `<path d="M-.2 0 L-.24 -.36 L.22 -.4 L.2 0z" fill="#f0e6d0" stroke="#a89c86" stroke-width=".03"/>`,
};
// how big each thing is, in metres (for boxes and lidar points): [width, height]
export const SIZE = { person: [.6, 1.8], child: [.45, 1.3], cyclist: [1.8, 1.8], car: [1.9, 1.5], van: [2.2, 2.4], light: [.5, 3.7], sign: [.8, 2.9], dog: [.9, .7], chair: [1, 1.5], post: [.3, 1], bag: [.5, .4], mirror: [1.1, 2.2], poster: [1.3, 2.3] };

// the street from the driver's seat, without things: sky, houses, pavements, road
function streetBack(tone) {
  const sky = { sun: '#bfe3f2', rain: '#9fb0bb', fog: '#d7dcdc', dark: '#16233a' }[tone] || '#bfe3f2';
  const g = { sun: 1, rain: 0.82, fog: 0.9, dark: 0.35 }[tone] ?? 1;
  const sh = (hex) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(v * g).toString(16).padStart(2, '0'); return `#${f(n >> 16)}${f((n >> 8) & 255)}${f(n & 255)}`; };
  const road = (x, z) => project(x, 0, z); const out = [`<rect width="${W}" height="${H}" fill="${sky}"/>`];
  // houses each side, nearest last
  for (const side of [-1, 1]) for (let z = 70; z >= 10; z -= 12) {
    const a = project(side * 7.5, 0, z), b = project(side * 7.5, 6.5, z), c = project(side * 7.5, 0, z + 9);
    const x0 = side < 0 ? Math.min(a.sx, c.sx) - a.s * 3 : Math.min(a.sx, c.sx); const w = Math.abs(a.sx - c.sx) + a.s * 3;
    out.push(`<rect x="${r2(x0)}" y="${r2(b.sy)}" width="${r2(w)}" height="${r2(a.sy - b.sy)}" fill="${sh(['#e9c9a0', '#d98b5f', '#f2dcb0'][(z / 12 + (side > 0 ? 1 : 0)) % 3 | 0])}"/>`);
    out.push(`<rect x="${r2(x0 + w * .3)}" y="${r2(b.sy + (a.sy - b.sy) * .3)}" width="${r2(w * .25)}" height="${r2((a.sy - b.sy) * .22)}" fill="${tone === 'dark' ? '#ffd27a' : sh('#bfe6ff')}"/>`);
  }
  const P = (pts, fill) => `<polygon points="${pts.map(([x, z]) => { const p = road(x, z); return `${r2(p.sx)},${r2(p.sy)}`; }).join(' ')}" fill="${fill}"/>`;
  out.push(P([[-7.5, 2.2], [7.5, 2.2], [7.5, 200], [-7.5, 200]], sh('#e6dcc8')));      // pavements
  out.push(P([[-3.6, 2.2], [3.6, 2.2], [3.6, 200], [-3.6, 200]], sh('#6b7178')));      // road
  for (let z = 4; z < 90; z += 7) out.push(P([[-0.08, z], [0.08, z], [0.08, z + 3], [-0.08, z + 3]], sh('#f6f3ea')));
  return out.join('');
}
// one thing drawn in the camera picture
export function thingAt(t, extra = '') {
  const p = project(t.x, 0, t.z); const draw = SHAPES[t.kind]; if (!draw) return '';
  const arg = t.kind === 'light' ? t.lamp : t.kind === 'sign' ? t.text : t.colour;
  return `<g transform="translate(${r2(p.sx)} ${r2(p.sy)}) scale(${r2(p.s)})"${extra}>${draw(arg, t.i || 0)}</g>`;
}
// the box a labeller draws round a thing, in picture pixels
export function boxOf(t) {
  const [w, h] = SIZE[t.kind] || [1, 1]; const p = project(t.x, 0, t.z);
  return { x: r2(p.sx - (w / 2) * p.s - 4), y: r2(p.sy - h * p.s - 4), w: r2(w * p.s + 8), h: r2(h * p.s + 8) };
}

// ---- the three sensor views. seen(thing) says whether that sensor picks the thing up in this weather (sensors.js).
const RAIN = Array.from({ length: 70 }, (_, i) => [(i * 137) % W, (i * 89) % H]);
export function cameraView(things, cond, seen = () => true) {
  const out = [streetBack(cond)];
  for (const t of [...things].sort((a, b) => b.z - a.z)) {
    const ok = seen(t);
    if (cond === 'dark' && !ok) continue;                       // beyond the headlights, unlit: nothing in the picture
    out.push(thingAt(t, cond === 'fog' && !ok ? ' opacity=".1"' : cond === 'rain' ? ' opacity=".9"' : ''));
  }
  if (cond === 'rain') out.push(`<g stroke="#e8f2f8" stroke-width="2" opacity=".7">${RAIN.map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${x - 8}" y2="${y + 22}"/>`).join('')}</g><rect width="${W}" height="${H}" fill="#7c8d99" opacity=".18"/>`);
  if (cond === 'fog') out.push(`<rect width="${W}" height="${H}" fill="#e4e8e8" opacity=".55"/>`);
  if (cond === 'dark') out.push(`<path d="M0 ${H} L${W * .38} ${HOR + 40} L${W * .62} ${HOR + 40} L${W} ${H}z" fill="#fff6c8" opacity=".14"/>`);
  return out.join('');
}
// radar: a screen seen from above. The car is at the bottom; each thing is a blob at its distance, with its speed.
export function radarView(things, cond, seen = () => true, numbers = false) {
  const cx = W / 2, cy = H - 18, k = 4.6; const out = [`<rect width="${W}" height="${H}" fill="#0f2a1e"/>`];
  for (let d = 20; d <= 80; d += 20) out.push(`<path d="M${cx - d * k} ${cy} A${d * k} ${d * k} 0 0 1 ${cx + d * k} ${cy}" fill="none" stroke="#2f6b4a" stroke-width="1.5"/><text x="${cx + d * k * .7 + 6}" y="${cy - d * k * .72}" font-size="15" fill="#5fae80">${d} m</text>`);
  out.push(`<path d="M${cx} ${cy} L${cx - 330} ${cy - 330} M${cx} ${cy} L${cx + 330} ${cy - 330}" stroke="#2f6b4a" stroke-width="1.5"/><rect x="${cx - 14}" y="${cy - 10}" width="28" height="20" rx="5" fill="#ffd166"/>`);
  for (const t of things) {
    if (!seen(t)) continue; const x = cx + t.x * k * 1.6, y = cy - t.z * k; const r = { car: 22, van: 26, cyclist: 14, chair: 11, person: 10, child: 8, dog: 8, light: 9, sign: 9, post: 9, bag: 0 }[t.kind] ?? 10;
    if (!r) continue;
    out.push(`<ellipse cx="${r2(x)}" cy="${r2(y)}" rx="${r}" ry="${r * .7}" fill="#6dff9e" opacity=".85"/><ellipse cx="${r2(x)}" cy="${r2(y)}" rx="${r * 1.8}" ry="${r * 1.2}" fill="#6dff9e" opacity=".18"/>`);
    if (numbers) out.push(`<text x="${r2(x + r * 1.9 + 4)}" y="${r2(y + 5)}" font-size="17" font-weight="700" fill="#c9ffd9">${Math.round(t.z)} m${t.mph !== undefined ? ` · ${t.mph} mph` : ''}</text>`);
    else if (t.mph) out.push(`<path d="M${r2(x)} ${r2(y - r)} l0 ${-Math.min(40, 8 + t.mph * 1.5)}" stroke="#c9ffd9" stroke-width="3" marker-end="url(#rdArrow)"/>`);
  }
  out.push(`<defs><marker id="rdArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#c9ffd9"/></marker></defs>`);
  return out.join('');
}
// lidar: points of laser light that come back. Each thing is a dotted outline; in fog only near things come back.
export function lidarView(things, cond, seen = () => true) {
  const out = [`<rect width="${W}" height="${H}" fill="#0b0f1e"/>`];
  for (let z = 4; z < 60; z += 3) { const a = project(-3.6, 0, z), b = project(3.6, 0, z); out.push(`<line x1="${r2(a.sx)}" y1="${r2(a.sy)}" x2="${r2(b.sx)}" y2="${r2(b.sy)}" stroke="#2b6cb0" stroke-width="2" stroke-dasharray="2 7" opacity="${cond === 'fog' && z > 14 ? 0 : .8}"/>`); }
  for (const t of [...things].sort((a, b) => b.z - a.z)) {
    if (!seen(t)) continue; const p = project(t.x, 0, t.z); const draw = SHAPES[t.kind]; if (!draw) continue;
    const hue = t.z < 15 ? '#ff6b6b' : t.z < 30 ? '#ffd166' : '#5fd0ff';
    out.push(`<g transform="translate(${r2(p.sx)} ${r2(p.sy)}) scale(${r2(p.s)})" fill="none" stroke="${hue}" stroke-width="${r2(2.6 / p.s)}" stroke-dasharray="${r2(1 / p.s)} ${r2(4 / p.s)}" stroke-linecap="round">${draw(t.kind === 'light' ? 'none' : t.kind === 'sign' ? '' : undefined).replace(/<text[^]*?<\/text>/g, '').replace(/ (fill|stroke|stroke-width)="[^"]*"/g, '')}</g>`);
  }
  if (cond === 'fog' || cond === 'rain') { const n = cond === 'fog' ? 160 : 60; out.push(`<g fill="#9fb8d8">${Array.from({ length: n }, (_, i) => `<circle cx="${(i * 193) % W}" cy="${HOR + 40 + ((i * 71) % (H - HOR - 40))}" r="2"/>`).join('')}</g>`); }
  return out.join('');
}
export const svg = (inner, label, extra = '') => `<svg class="rd-pic" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${label}" font-family="Inter, Arial, sans-serif"${extra}>${inner}</svg>`;
