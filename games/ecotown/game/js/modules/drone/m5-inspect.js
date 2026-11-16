// Mission 5, inspection: the shapes the drone must keep away from, the photo points, the photos and what they show.
// Pure: no page, no 3D (tests/drone-hour.test.mjs). Real practice, kept simple: a turbine is stopped and locked before
// an inspection; the pilot flies a set route of photo points, holds steady at each, keeps a safe distance from the
// structure, and an inspector then looks through the photos and reports damage, with how big it is. One unit is
// about one metre.
export const SAFE = 4;        // keep at least this far from the structure (metres)
export const STOP = 2;        // closer than this the drone's own sensors stop it and back it off
export const SPOT_R = 2.2;    // the photo is taken from within this distance of the frame's middle
export const HOLD = 1.2;      // seconds of holding still for a sharp photo
export const STILL = 1.6;     // "still": slower than this (metres a second)

// distance from point p to segment a-b, all { x, y, z }
export function segDist3(p, a, b) {
  const vx = b.x - a.x, vy = b.y - a.y, vz = b.z - a.z; const l2 = vx * vx + vy * vy + vz * vz;
  const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy + (p.z - a.z) * vz) / l2)) : 0;
  return Math.hypot(p.x - a.x - vx * t, p.y - a.y - vy * t, p.z - a.z - vz * t);
}
// How far the drone is from the structure's surface: parts are [{ a, b, r }] (capsules).
export const clearance = (p, parts) => Math.min(...parts.map((s) => segDist3(p, s.a, s.b) - s.r));

// ---------------------------------------------------------------- the turbine (base at x, g, z; the rotor faces south)
export const TOWER = 26, BLADE = 13, HUB_Z = 1.6;
export const BLADE_ANGLES = [0, 120, 240]; // degrees clockwise from straight up, seen from the south
export const bladeTip = (base, deg, k = 1) => { const a = deg * Math.PI / 180; return { x: base.x + Math.sin(a) * BLADE * k, y: base.y + TOWER + 1 + Math.cos(a) * BLADE * k, z: base.z + HUB_Z }; };
export function turbineParts(base) {
  const hub = { x: base.x, y: base.y + TOWER + 1, z: base.z + HUB_Z };
  return [{ a: { ...base }, b: { x: base.x, y: base.y + TOWER, z: base.z }, r: 1.1 }, { a: { x: base.x, y: base.y + TOWER + 1, z: base.z - 2.5 }, b: hub, r: 1.5 },
    ...BLADE_ANGLES.map((d) => ({ a: hub, b: bladeTip(base, d), r: 0.8 }))];
}
// Three photo points, each about seven metres in front of the part it looks at. photo: what the photo shows.
export function turbineSpots(base) {
  const front = (p, d = 7) => ({ x: p.x, y: p.y, z: p.z + d });
  return [
    { id: 't1', name: 'the top blade', at: front(bladeTip(base, 0, 0.55)), photo: 'blade-clean' },
    { id: 't2', name: 'the tip of the right blade', at: front(bladeTip(base, 120, 0.85)), photo: 'blade-crack' },
    { id: 't3', name: 'the hub', at: front({ x: base.x, y: base.y + TOWER + 1, z: base.z + HUB_Z }, 8.5), photo: 'hub-bird' },
  ];
}
// ---------------------------------------------------------------- the footbridge to the village (from the game's own bridge)
// land: the town end of the deck (world.bridgeLanding). The span runs east for about 11 m and dips by about 2 m.
export function bridgeShape(land) {
  const xe = land.x + 2, xf = xe + 11, y0 = land.y, z = land.z;
  const deck = (x) => { const s = Math.max(0, Math.min(1, (x - xe) / (xf - xe))); return y0 - 2 * s - 1.1 * Math.sin(Math.PI * s); };
  return { xe, xf, z, deck,
    parts: [-2.5, 2.5].flatMap((dz) => [{ a: { x: xe - 0.5, y: y0 - 1, z: z + dz }, b: { x: xe - 0.5, y: y0 + 6.5, z: z + dz }, r: 0.5 }, { a: { x: xf + 0.5, y: deck(xf) - 1, z: z + dz }, b: { x: xf + 0.5, y: deck(xf) + 6.5, z: z + dz }, r: 0.5 }])
      .concat([0, 0.25, 0.5, 0.75].map((k) => { const x0 = xe + (xf - xe) * k, x1 = xe + (xf - xe) * (k + 0.25); return { a: { x: x0, y: deck(x0), z }, b: { x: x1, y: deck(x1), z }, r: 1.5 }; })) };
}
export function bridgeSpots(b) {
  const mid = (b.xe + b.xf) / 2;
  return [
    { id: 'b1', name: 'the town tower', at: { x: b.xe - 0.5, y: b.deck(b.xe) + 5, z: b.z + 9 }, photo: 'wood-moss' },
    { id: 'b2', name: 'the middle of the deck, from below', at: { x: mid, y: b.deck(mid) - 3.5, z: b.z + 8 }, photo: 'wood-clean' },
    { id: 'b3', name: 'the village tower', at: { x: b.xf + 0.5, y: b.deck(b.xf) + 2, z: b.z + 9 }, photo: 'wood-crack' },
  ];
}

// ---------------------------------------------------------------- the photos and what they show
export const DAMAGE = { 'blade-crack': { cm: 35 }, 'wood-crack': { cm: 8 } };
export const REPAIR_CM = 20; // the made-up limit in this inspection's rules: longer cracks are repaired before use
export const isDamage = (photo) => !!DAMAGE[photo];
const ABOUT = { 'blade-clean': 'This part of the blade is clean and smooth. Nothing wrong here.', 'hub-bird': 'That white mark is a bird dropping. It washes off in the rain. It is not damage.',
  'wood-moss': 'That green patch is moss on the wood. It is worth noting, but it is not a crack.', 'wood-clean': 'The planks and beams here are sound. Nothing wrong here.' };
// A photo chosen as the one with damage. tries: earlier wrong choices for this structure.
export function photoReply(photo, tries, damaged) {
  if (isDamage(photo)) return { right: true, text: photo === 'blade-crack' ? 'Yes. A thin dark crack runs across the blade near its tip. Cracks can grow when the blade turns, so it must be reported.' : 'Yes. There is a split in the timber of the tower post. Wood can split as it dries and gets wet again, so it must be reported.' };
  return { right: false, told: tries > 0, text: tries ? `${ABOUT[photo]} The damage is in the photo of ${damaged}: look for a thin dark line.` : `${ABOUT[photo]} Look for a thin dark line in the other photos.` };
}
// Ages 13-17: how big is it, and what goes in the report.
export const ACTIONS = [{ id: 'now', label: `Repair before it is used again (over ${REPAIR_CM} cm)` }, { id: 'watch', label: `Report it and check again soon (under ${REPAIR_CM} cm)` }];
export const actionFor = (photo) => (DAMAGE[photo].cm > REPAIR_CM ? 'now' : 'watch');
export function actionReply(photo, id) {
  const cm = DAMAGE[photo].cm; const right = id === actionFor(photo);
  return { right, text: right ? `Right: the crack is about ${cm} cm, ${cm > REPAIR_CM ? 'over' : 'under'} the ${REPAIR_CM} cm limit. A clear report with the size lets the engineers decide quickly.` : `Measure it against the scale in the photo: about ${cm} cm. Compare that with the ${REPAIR_CM} cm limit.` };
}

// A photo as a small SVG (240 x 160). scale: draw a ruler (ages 13-17). ring: circle the damage (after it is found).
export function photoSvg(photo, { scale = false, ring = false } = {}) {
  const o = ['<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="An inspection photo">'];
  const wood = photo.startsWith('wood');
  if (photo.startsWith('blade')) { o.push('<rect width="240" height="160" fill="#a9c9e4"/><path d="M-10 40 Q120 20 250 52 L250 128 Q120 112 -10 132 Z" fill="#f4f6f7"/><path d="M-10 40 Q120 20 250 52" stroke="#c5ccd2" stroke-width="5" fill="none"/>'); for (let i = 0; i < 5; i++) o.push(`<path d="M${20 + i * 46} ${60 + (i % 2) * 18} q14 4 26 2" stroke="#dfe3e6" stroke-width="3" fill="none"/>`); }
  else if (photo === 'hub-bird') { o.push('<rect width="240" height="160" fill="#a9c9e4"/><circle cx="120" cy="84" r="70" fill="#eef1f3"/><circle cx="120" cy="84" r="70" fill="none" stroke="#c5ccd2" stroke-width="5"/><path d="M150 60 q8 -6 14 2 q6 8 -2 12 q4 8 -6 10 q-10 2 -8 -8 q-8 -6 2 -16 z" fill="#ffffff" stroke="#d6dadd" stroke-width="2"/><circle cx="158" cy="78" r="3" fill="#d6dadd"/>'); }
  else { o.push('<rect width="240" height="160" fill="#8c6440"/>'); for (let i = 0; i < 9; i++) o.push(`<path d="M0 ${12 + i * 17} Q120 ${6 + i * 17 + (i % 3) * 4} 240 ${14 + i * 17}" stroke="#6e4c2e" stroke-width="2.5" fill="none"/>`); }
  if (photo === 'wood-moss') o.push('<g fill="#5f9a3a"><circle cx="70" cy="110" r="16"/><circle cx="88" cy="100" r="12"/><circle cx="58" cy="96" r="10"/><circle cx="94" cy="118" r="9"/></g><g fill="#7cbf4f"><circle cx="72" cy="104" r="5"/><circle cx="86" cy="112" r="4"/></g>');
  if (photo === 'blade-crack') o.push('<path d="M150 46 l6 12 l-5 9 l8 11 l-4 10 l7 13 l-3 11" stroke="#2b2f33" stroke-width="2.6" fill="none" stroke-linejoin="round"/>');
  if (photo === 'wood-crack') o.push('<path d="M60 74 l20 2 l14 -3 l18 4 l12 -2" stroke="#1d130b" stroke-width="3" fill="none" stroke-linejoin="round"/>');
  if (ring && isDamage(photo)) o.push(photo === 'blade-crack' ? '<ellipse cx="155" cy="86" rx="24" ry="46" fill="none" stroke="#d2452d" stroke-width="4"/>' : '<ellipse cx="92" cy="75" rx="44" ry="16" fill="none" stroke="#d2452d" stroke-width="4"/>');
  if (scale) { // a ruler: 10 cm marks. The blade photo is closer up than the wood one.
    const per = photo === 'blade-crack' ? 2 : wood ? 7.5 : 2; o.push('<rect x="8" y="140" width="224" height="14" fill="#fffaf0" opacity=".92"/>');
    for (let cm = 0; cm * per <= 216; cm += 10) o.push(`<path d="M${12 + cm * per} 140 v${cm % 50 ? 6 : 10}" stroke="#3b2a1e" stroke-width="1.5"/>${cm % (per > 4 ? 10 : 20) === 0 ? `<text x="${14 + cm * per}" y="153" font-family="Inter, sans-serif" font-size="8" fill="#3b2a1e">${cm}</text>` : ''}`);
  }
  o.push('</svg>');
  return o.join('');
}
