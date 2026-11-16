// Mission 4, farm survey: survey lines, photo overlap, the battery, and reading the map. Pure (tests/drone-hour.test.mjs).
// Real practice, kept simple: a mapping drone flies back and forth in straight lines ("lawnmower" lines) and takes a
// photo every second or so. Software joins the photos into one map only where they overlap; mapping teams usually
// overlap neighbouring lines by about 60 to 70 percent. Every turn costs time and battery, so lines usually run along
// the longest side of a field. Plant health maps come from cameras that see light our eyes cannot (near-infrared):
// sick plants can show up there before they look different to us.
export const FOOT = 5;             // how wide one line of photos is on the ground, in squares (a square is 10 m)
export const NEED = 60;            // the overlap the mapping software needs between neighbouring lines, in percent
export const TURN = 3;             // squares of battery each turn at the end of a line costs
export const SQUARE_M = 10;
export const FOOT_ALONG = 4;       // how long one photo is along the line, in squares
export const NEED_ALONG = 75;      // the overlap mapping teams aim for between photos along a line (about 75 to 80%)
export const frontOf = (gap) => Math.round(Math.max(0, (FOOT_ALONG - gap) / FOOT_ALONG) * 100);
export const FIELDS = [
  { id: 'meadow', name: 'The hay meadow', w: 12, h: 8, battery: null, dirs: ['ns'], start: { dir: 'ns', spacing: 6 } },
  { id: 'farm', name: 'Hilltop Farm', w: 16, h: 9, battery: 70, dirs: ['ns', 'ew'], start: { dir: 'ns', spacing: 2 } },
];
export const SPACINGS = [1, 2, 3, 4, 5, 6];
export const overlapOf = (spacing) => Math.round(Math.max(0, (FOOT - spacing) / FOOT) * 100);

// The lines for a field: dir 'ns' (lines run north to south, stepping east) or 'ew'; spacing in squares.
// Returns { lines: [[x0, z0, x1, z1]], count, overlap, gaps (squares no photo covers), length (squares of flying),
//           fits (inside the battery), joined (enough overlap and no gaps) }.
// along (ages 13-17 on the farm): how far apart the photos are along each line, in squares (1 = 75% overlap).
export function plan(field, { dir = 'ns', spacing = 2, along: gapAlong = null } = {}) {
  const across = dir === 'ns' ? field.w : field.h, along = dir === 'ns' ? field.h : field.w;
  const count = across <= FOOT ? 1 : Math.ceil((across - FOOT) / spacing) + 1;
  const pos = []; for (let i = 0; i < count; i++) pos.push(Math.min(FOOT / 2 + i * spacing, across - FOOT / 2));
  const lines = pos.map((p, i) => { const a = i % 2 ? along : 0, b = i % 2 ? 0 : along; return dir === 'ns' ? [p, a, p, b] : [a, p, b, p]; });
  // squares across the field that no line's photos reach
  let gaps = 0; for (let c = 0; c < across; c++) { const mid = c + 0.5; if (!pos.some((p) => Math.abs(p - mid) <= FOOT / 2)) gaps++; }
  const steps = pos.slice(1).reduce((n, p, i) => n + (p - pos[i]), 0);
  const length = Math.round(count * along + steps + (count - 1) * TURN);
  const overlap = count > 1 ? overlapOf(spacing) : 100; const fits = !field.battery || length <= field.battery;
  const front = gapAlong ? frontOf(gapAlong) : null;
  return { dir, spacing, lines, count, overlap, front, gaps: gaps * along, length, fits, joined: !gaps && overlap >= NEED && (front === null || front >= NEED_ALONG) };
}
// What happened when the survey was flown, in plain words. Never a mark: what the map shows and why.
export function result(field, p, junior = true) {
  if (!p.fits) return { ok: false, kind: 'battery', text: junior ? 'The battery ran out before the last line, so part of the field has no photos. Try lines that need less flying.' : `That plan needs ${p.length * SQUARE_M} m of flying, but the battery holds ${field.battery * SQUARE_M} m. Fewer turns or fewer lines would help.` };
  if (p.gaps) return { ok: false, kind: 'gaps', text: junior ? 'There are gaps between the lines of photos, so the map has holes in it. Bring the lines closer together.' : `Gaps: ${p.gaps} squares have no photo at all, so the map has holes. Bring the lines closer together.` };
  if (p.overlap < NEED) return { ok: false, kind: 'overlap', text: junior ? 'The photos only just meet. The computer needs each line to cover more than half of the next one, or it cannot join them. Bring the lines closer.' : `The lines overlap by ${p.overlap}%. The software needs about ${NEED}% to match the photos, so the map came out patchy. Bring the lines closer.` };
  if (p.front !== null && p.front < NEED_ALONG) return { ok: false, kind: 'front', text: `Along each line the photos overlap by only ${p.front}%. The software needs about ${NEED_ALONG}% along the line as well, to match each photo with the next. Take the photos closer together.` };
  return { ok: true, kind: 'joined', text: junior ? `The photos overlap well, so the computer joined them into one map. ${p.count} lines, and the battery lasted.` : `${p.overlap}% overlap between lines${p.front !== null ? `, ${p.front}% along them,` : ''} and ${p.length * SQUARE_M} m of flying${field.battery ? ` out of ${field.battery * SQUARE_M} m` : ''}: the photos joined into one map.` };
}

// ---------------------------------------------------------------- reading the map of Hilltop Farm (16 x 9 squares)
export const PLOTS = [
  { id: 'potatoes', name: 'the potato field', x: 0, z: 0, w: 8, h: 5, crop: 'potatoes' },
  { id: 'barley', name: 'the barley field', x: 8, z: 0, w: 8, h: 5, crop: 'barley' },
  { id: 'wheat', name: 'the wheat field', x: 0, z: 5, w: 8, h: 4, crop: 'wheat' },
  { id: 'grass', name: 'the grass for the cows', x: 8, z: 5, w: 8, h: 4, crop: 'grass' },
];
export const DRY = 'potatoes';                                      // looks brown in the photos: the field needs water
export const SICK = { x: 11, z: 1, w: 3, h: 3 };                    // in the barley: green to our eyes, red in the health view
export const plotAt = (x, z) => PLOTS.find((p) => x >= p.x && x < p.x + p.w && z >= p.z && z < p.z + p.h) || null;
export const inSick = (x, z) => x >= SICK.x && x < SICK.x + SICK.w && z >= SICK.z && z < SICK.z + SICK.h;
// Plant health from 0 to 1 for one square (what the health view shows). A few small differences, so it looks real.
export function health(x, z) {
  const n = ((x * 13 + z * 7) % 5) * 0.02;
  if (inSick(x, z)) { const c = (x === SICK.x + 1 && z === SICK.z + 1) ? 0 : 1; return 0.22 + c * 0.12 + n / 2; }
  const p = plotAt(x, z);
  if (p?.id === 'barley' && Math.max(Math.abs(x - (SICK.x + 1)), Math.abs(z - (SICK.z + 1))) === 2) return 0.62 + n; // round the patch: a little stressed
  if (p?.id === 'wheat' && x <= 1 && z >= 7) return 0.66 + n; // a trodden corner by the gate: a little stressed, not sick
  return p?.id === DRY ? 0.5 + n : 0.8 + n;
}
export const sickShare = () => Math.round(SICK.w * SICK.h / (PLOTS.find((p) => p.id === 'barley').w * PLOTS.find((p) => p.id === 'barley').h) * 100);
// A tap on the map while looking for something. what: 'dry' or 'sick'. tries: earlier misses for this question.
export function tapReply(what, x, z, view, tries) {
  const p = plotAt(x, z);
  if (what === 'dry') {
    if (p?.id === DRY) return { right: true, text: 'Yes. The potato field is brown and dry. The farmer can water it before the plants suffer.' };
    return { right: false, text: tries ? 'Look for the field that is brown instead of green. It is in the top left.' : 'That field looks healthy. Look for a field that is a different colour from the rest.' };
  }
  if (inSick(x, z)) return { right: true, text: 'Found it. These plants look green to our eyes, but the health view shows they are struggling.' };
  if (view !== 'health') return { right: false, text: 'In the normal photo the crops all look green. Switch to the plant health view first.' };
  return { right: false, text: tries ? 'Look for the red patch in the barley field, top right.' : (health(x, z) < 0.75 ? 'That part is a little stressed, but not the worst. Look for where it is reddest.' : 'That part is healthy. Look for a patch that is red or orange in the health view.') };
}
export const ADVICE = [
  { id: 'target', label: 'Water the potato field, and check the sick patch in the barley up close', right: true },
  { id: 'all', label: 'Spray the whole farm, just in case', right: false },
  { id: 'none', label: 'Nothing needs doing: the photos look green', right: false },
];
export function adviceReply(id) {
  if (id === 'target') return { right: true, text: 'Good advice. The map shows exactly where to act, so the farmer saves water and spray and the rest of the farm is left alone.' };
  if (id === 'all') return { right: false, text: 'Most of the farm is healthy. Spraying it all wastes spray and can harm insects. The map shows exactly where to act.' };
  return { right: false, text: 'The normal photos look green, but the map found a dry field and a sick patch.' };
}
