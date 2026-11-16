// Drones at work: the six missions of the hour, their words, the progress kept between visits and the take-home
// record. Pure: no page, no 3D (tests/drone-hour.test.mjs). Each mission is a different real use of drones and a
// different real skill (docs/curriculum.md, section 2).

// open: one line on the real job and why it matters. how: what to tap. after: what the child can now do.
// Words are the same for both ages unless a pair { j, s } is given.
export const MISSIONS = [
  { id: 'ground', icon: '📋', title: 'Ground school', use: 'Every flight',
    open: 'Real drone pilots check the drone, the weather and the map before every flight. Many problems are easier to find on the ground than in the air.',
    how: { j: 'Tap each part of the drone to check it. Then decide: fly, or do not fly. After that, read the map of where drones may fly.', s: 'Check each drone, then decide whether to fly. Then read the airspace map and judge five flight plans against the Drone Code.' },
    after: 'You can now check a drone before it flies and say whether a flight is allowed and safe.' },
  { id: 'hand', icon: '🎮', title: 'Hand flying', use: 'Training',
    open: 'Pilots practise flying by hand, so they stay in control if the wind gets up or the drone loses its GPS signal.',
    how: { j: 'Take off, keep the drone still while the wind pushes it, fly through the hoops and land on the pad.', s: 'Take off, hold a hover against a crosswind, fly a hoop course at different heights, and land gently on the pad.' },
    after: 'You can now take off, hold a drone steady in the wind and land it gently.' },
  { id: 'delivery', icon: '📦', title: 'Delivery', use: 'Parcels and medicines',
    open: 'In some places drones already carry parcels and medicines, on routes that are planned before they fly.',
    how: { j: 'Fly a parcel by hand first. Then write the route as steps, so the drone can fly it by itself.', s: 'Fly one delivery by hand. Then write the route as steps the drone follows by itself, within its battery.' },
    after: 'You can now turn a route into steps a drone can follow by itself.' },
  { id: 'survey', icon: '🗺️', title: 'Farm survey', use: 'Mapping',
    open: 'Farmers and surveyors fly drones up and down in lines, taking hundreds of photos that a computer joins into one map.',
    how: { j: 'Choose how far apart the lines are, so the photos overlap. Then look at the map and find what the farmer needs to know.', s: 'Plan a survey pattern with enough overlap and within the battery. Then read the map, including the plant health view.' },
    after: 'You can now plan a survey so the photos overlap, and read a map made from the air.' },
  { id: 'inspect', icon: '🔧', title: 'Inspection', use: 'Turbines and bridges',
    open: 'Inspectors fly drones close to wind turbines and bridges, so fewer people have to climb up high to look for damage.',
    how: { j: 'Fly to each blue frame and hold the drone still to take a photo. Do not go too close. Then find the crack in the photos.', s: 'Photograph each inspection point while keeping the safe distance, then find the damage and decide what to report.' },
    after: 'You can now fly a careful inspection, keep a safe distance and spot damage in photos.' },
  { id: 'rescue', icon: '🔦', title: 'Search and rescue', use: 'Finding people',
    open: 'Search and rescue teams fly drones with heat cameras to find people who are lost, even at night.',
    how: { j: 'Choose a camera, choose a way to search, check each warm spot, then guide the rescue team to the walker.', s: 'Choose the sensor, choose a search pattern, identify what the heat camera finds, then guide the ground team.' },
    after: 'You can now choose the right camera for a search, search in a pattern and help a team on the ground.' },
];
export const IDS = MISSIONS.map((m) => m.id);
export const missionOf = (id) => MISSIONS.find((m) => m.id === id) || null;
export const words = (w, junior) => (w && typeof w === 'object' ? (junior ? w.j : w.s) : w);

// ---------------------------------------------------------------- progress
// state: { v: 3, done: [ids], sum: { <id>: a small summary of the last time that mission was finished }, m3: the delivery
// mission's own progress (route.js), town: the delivery route kept in the town }.
// A v2 state (the first version, the delivery alone) becomes the delivery mission's own progress.
const okSum = (s) => s && typeof s === 'object' && !Array.isArray(s);
export function restoreHour(saved) {
  const fresh = { v: 3, done: [], sum: {}, m3: null, town: null };
  if (!saved || typeof saved !== 'object') return fresh;
  if (saved.v === 2) return { ...fresh, m3: saved };
  if (saved.v !== 3) return fresh;
  const done = IDS.filter((id) => Array.isArray(saved.done) && saved.done.includes(id));
  const sum = {}; for (const id of done) if (okSum(saved.sum?.[id])) sum[id] = saved.sum[id];
  for (const id of done) if (!sum[id]) sum[id] = {};
  return { ...fresh, done, sum, m3: saved.m3 && typeof saved.m3 === 'object' ? saved.m3 : null, town: okSum(saved.town) ? saved.town : null };
}
// Missions open in order: the first one not done is next; every one before it (done) can be played again.
export const nextMission = (st) => IDS.find((id) => !st.done.includes(id)) || null;
export const isOpen = (st, id) => { const i = IDS.indexOf(id); return i >= 0 && IDS.slice(0, i).every((x) => st.done.includes(x)); };
export const allDone = (st) => IDS.every((id) => st.done.includes(id));
// A mission finished: its summary replaces the last one (a replay counts the newest go).
export function finishMission(st, id, sum, extra = {}) {
  if (!IDS.includes(id)) return st;
  const done = IDS.filter((x) => x === id || st.done.includes(x));
  return { ...st, ...extra, done, sum: { ...st.sum, [id]: okSum(sum) ? sum : {} } };
}

// ---------------------------------------------------------------- the take-home record
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
// One line per mission: what the child made or achieved. Built from the summary of the last go.
export function lineFor(id, s = {}, junior = true) {
  switch (id) {
    case 'ground': {
      const fixed = s.fixed ? `, fixed ${plural(s.fixed, 'problem')}` : ''; const kept = s.grounded ? ` and kept ${plural(s.grounded, 'drone')} on the ground` : '';
      return `Ground school: checked ${plural(s.checked || 3, 'drone')}${fixed}${kept}; judged ${plural(s.jobs || 6, 'flight plan')} against the Drone Code.`;
    }
    case 'hand': {
      const hover = Number.isFinite(s.hover) ? (junior ? ` held a hover in the wind` : ` held a hover in a ${s.wind || 20} km/h crosswind`) : ' held a hover in the wind';
      const land = Number.isFinite(s.landing) && !junior ? ` landed at ${s.landing} m/s` : ' landed gently on the pad';
      return `Hand flying: took off,${hover}, flew ${s.hoops ?? 4} of ${s.of ?? 4} hoops and${land}.`;
    }
    case 'delivery': return `Delivery: ${s.line || 'planned a route as steps and watched the drone fly it'}`;
    case 'survey': return junior ? `Farm survey: planned ${plural(s.lanes || 6, 'line')} of photos that overlap, then found the dry field and the sick crop.`
      : `Farm survey: ${plural(s.lanes || 6, 'line')} with ${s.overlap ?? 60}% overlap, within the battery; found the dry field and the sick crop.`;
    case 'inspect': return `Inspection: took ${plural(s.photos || 6, 'photo')} of a wind turbine and a bridge${s.close ? '' : ' from a safe distance'} and found ${plural(s.found || 2, 'crack')}.`;
    case 'rescue': return `Search and rescue: chose the ${s.sensor === 'heat' || !s.sensor ? 'heat camera' : 'camera'}, searched ${s.pattern === 'lines' ? 'in lines' : 'in growing squares'}, found the walker and guided the team${junior ? '' : ` (${s.path || 10} squares)`}.`;
    default: return '';
  }
}
// "You practised ...": two to four lines from what the child did, never what they learned.
export function practisedFor(st) {
  const d = (id) => st.done.includes(id); const out = [];
  if (d('ground') && d('hand')) out.push('checking a drone before flight, judging flights against the Drone Code and flying by hand in the wind');
  else if (d('ground')) out.push('checking a drone before flight and judging flights against the Drone Code');
  else if (d('hand')) out.push('flying a drone by hand in the wind and landing it gently');
  if (d('delivery')) out.push('turning a delivery route into steps a drone can follow by itself');
  const safe = d('inspect') && !(st.sum.inspect?.close > 0) ? ' from a safe distance' : '';
  if (d('survey') && d('inspect')) out.push(`planning an overlapping survey, reading a crop map and inspecting a turbine and a bridge${safe}`);
  else if (d('survey')) out.push('planning an overlapping survey and reading a crop map');
  else if (d('inspect')) out.push(`inspecting a turbine and a bridge${safe} and finding the damage`);
  if (d('rescue')) out.push('searching with a heat camera in a pattern and guiding a rescue team on the ground');
  return out.slice(0, 4);
}
export function hourRecord(st, junior = true, picture = '') {
  const lines = IDS.filter((id) => st.done.includes(id)).map((id) => lineFor(id, st.sum[id], junior)).filter(Boolean).map((l) => (l.length > 120 ? l.slice(0, 117) + '…' : l));
  return { made: { title: 'My hour of drones at work', lines: lines.slice(0, 6), ...(picture ? { picture } : {}) }, practised: practisedFor(st) };
}

// The picture for the take-home page: six small badges, one per mission, each with a drawing and a tick when done.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const DRAW = {
  ground: '<rect x="-16" y="-20" width="32" height="40" rx="4" fill="#fffaf0" stroke="#7a5a33" stroke-width="2"/><path d="M-9 -9 l3 3 l6 -7 M-9 3 l3 3 l6 -7" stroke="#2e9b5a" stroke-width="3" fill="none"/><path d="M4 -8 h7 M4 4 h7" stroke="#7a5a33" stroke-width="2"/>',
  hand: '<circle cx="0" cy="12" r="16" fill="none" stroke="#2e9b5a" stroke-width="3" stroke-dasharray="4 3"/><rect x="-9" y="-6" width="18" height="8" rx="2" fill="#fffaf0" stroke="#3b2a1e" stroke-width="2"/><path d="M-18 -8 h12 M6 -8 h12" stroke="#3b2a1e" stroke-width="3"/><path d="M-24 -18 h12 l-4 -4 M-12 -18 l-4 4" stroke="#1f6fd0" stroke-width="2.5" fill="none"/>',
  delivery: '<path d="M-18 14 V-6 H8 V-16" stroke="#d2452d" stroke-width="3" fill="none" stroke-dasharray="5 3"/><circle cx="-18" cy="14" r="5" fill="#2e7d4f"/><rect x="2" y="-24" width="13" height="11" fill="#b9834f" stroke="#7a5a33" stroke-width="1.5"/>',
  survey: '<rect x="-20" y="-18" width="40" height="36" fill="#a5dd84" stroke="#5a9b49" stroke-width="2"/><rect x="2" y="-18" width="18" height="16" fill="#d8b56a"/><path d="M-14 -18 V18 M-4 18 V-18 M6 -18 V18 M16 18 V-18" stroke="#1f6fd0" stroke-width="2"/>',
  inspect: '<path d="M0 22 V-4" stroke="#8f9aa3" stroke-width="4"/><path d="M0 -4 L0 -24 M0 -4 L17 6 M0 -4 L-17 6" stroke="#fffaf0" stroke-width="5" stroke-linecap="round"/><path d="M0 -4 L0 -24 M0 -4 L17 6 M0 -4 L-17 6" stroke="#8f9aa3" stroke-width="1"/><path d="M-2 -18 l3 3 l-2 3" stroke="#d2452d" stroke-width="2" fill="none"/>',
  rescue: '<rect x="-20" y="-18" width="40" height="36" rx="3" fill="#2a2140"/><ellipse cx="4" cy="2" rx="9" ry="4" fill="#ffb347"/><circle cx="-6" cy="1" r="4" fill="#ffe08a"/><circle cx="-12" cy="-10" r="3" fill="#c0563a"/>',
};
export function hourPicture(st) {
  const W = 420, H = 300; const o = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Six drone missions"><rect width="${W}" height="${H}" fill="#f6ecd6"/>`];
  o.push(`<text x="${W / 2}" y="26" text-anchor="middle" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#3b2a1e">Drones at work: six missions</text>`);
  MISSIONS.forEach((m, i) => {
    const cx = 74 + (i % 3) * 136, cy = 96 + Math.floor(i / 3) * 128; const done = st.done.includes(m.id);
    o.push(`<g transform="translate(${cx} ${cy})"><rect x="-58" y="-52" width="116" height="112" rx="14" fill="${done ? '#fffaf0' : '#ece3d0'}" stroke="${done ? '#b08a55' : '#c9bfae'}" stroke-width="2"/>`);
    o.push(`<g transform="translate(0 -8)">${DRAW[m.id]}</g>`);
    o.push(`<text x="0" y="44" text-anchor="middle" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#3b2a1e">${i + 1}. ${esc(m.title)}</text>`);
    if (done) o.push('<circle cx="44" cy="-38" r="11" fill="#2e9b5a"/><path d="M38 -38 l4 4 l7 -8" stroke="#fff" stroke-width="3" fill="none"/>');
    o.push('</g>');
  });
  o.push('</svg>');
  return o.join('');
}
