// Town film studio: the film set and the shot kit. Pure: no page, no 3D.
// The set is what Florence can film: places that exist in the child's town, the island's own landmarks, and who is
// there (a family, the otters, Florence). She can only use what exists, so everything here is read from the town.
import { ITEMS } from '../../world/catalog.js';

// The island's grid, as in js/world/terrain.js (a module may not import that file; tests/film.test.mjs checks they agree).
export const T = 6, X0 = -42, Z0 = -33;
export const key = (gx, gz) => gx + ',' + gz;
export const tileXZ = (gx, gz) => [X0 + gx * T + T / 2, Z0 + gz * T + T / 2];
export const riverX = (z) => -27 + 1.4 * Math.sin(z / 7);
export const CENTRE = [0, 1, -2];           // the middle of the island
export const BRIDGE_TILE = '13,5';          // the rope bridge to the next island leaves the east edge here

// ---- the kit of camera moves. name: on the storyboard. does: what the camera does, to finish "The camera …".
export const MOVES = {
  wide:   { name: 'Wide shot',    does: 'shows everything from high up' },
  push:   { name: 'Push in',      does: 'moves slowly closer' },
  street: { name: 'Street pass',  does: 'glides past at street level' },
  orbit:  { name: 'Circle round', does: 'circles round' },
  close:  { name: 'Close-up',     does: 'stays close' },
  pull:   { name: 'Pull back',    does: 'pulls back to show the whole town' },
  glide:  { name: 'Fly over',     does: 'flies across high above' },
  rise:   { name: 'Rise up',      does: 'rises from the ground into the air' },
};
export const MOVE_IDS = Object.keys(MOVES);

// ---- moods, from calmest to liveliest. music: one of the game's four tunes. hour: the light. secs: shot length.
export const MOODS = [
  { id: 'calm',     label: 'Calm',     icon: '🌙', music: 'night',     hour: 17.7, secs: 5,   tune: 'slow evening music', light: 'golden evening light' },
  { id: 'curious',  label: 'Curious',  icon: '🔎', music: 'lab',       hour: 8.4,  secs: 4.5, tune: 'thoughtful music',   light: 'soft morning light' },
  { id: 'cheerful', label: 'Cheerful', icon: '☀️', music: 'day',       hour: 12,   secs: 4,   tune: 'bright daytime music', light: 'bright midday light' },
  { id: 'party',    label: 'Party',    icon: '🎉', music: 'celebrate', hour: 15,   secs: 3.5, tune: 'party music',        light: 'warm afternoon light' },
];
export const MOOD_IDS = MOODS.map((m) => m.id);
export const moodOf = (id) => MOODS.find((m) => m.id === id) || MOODS[2];

// ---- who can be in the film
export const WHO = {
  family:   { label: 'a family',   the: 'the family', icon: '👪', missing: 'No family lives in your town yet. Families move in when there are homes.' },
  otters:   { label: 'the otters', the: 'the otters', icon: '🦦', missing: 'There are no otters in your town. Otters come when the wetland is left wild.' },
  florence: { label: 'Florence',   the: 'me',         icon: '🤖', missing: '' },
};
export const WHO_IDS = Object.keys(WHO);

// ---- places. Builds first (the child made them), then the island's own landmarks, so an empty town still has a set.
// [build id, place id, label, icon, drawing]
const BUILDS = [
  ['market', 'market', 'the market square', '🧺', 'stalls'], ['hall', 'hall', 'the community hall', '🏛', 'hall'],
  ['school', 'school', 'the town school', '🏫', 'school'], ['park', 'park', 'the park', '🌳', 'trees'],
  ['festival', 'festival', 'the festival field', '🎪', 'tent'], ['home', 'homes', 'the homes', '🏠', 'houses'],
  ['orchard', 'orchard', 'the orchard', '🍎', 'orchard'], ['wind', 'wind', 'the wind turbine', '🌀', 'turbine'],
  ['mixed', 'farm', 'the farm', '🐑', 'farm'], ['allot', 'allot', 'the allotments', '🥕', 'plots'],
  ['tram', 'tram', 'the tram stop', '🚋', 'tram'], ['repair', 'repair', 'the repair café', '🔧', 'hall'],
  ['bigfield', 'field', 'the big field', '🌾', 'farm'],
];
const MAX_OFFER = 6, MAX_BUILDS = 3;
// builds low enough for a camera to pass over at head height
const FLAT = new Set(['road', 'carpark', 'path', 'cycle', 'bigfield', 'raingarden', 'reedbed', 'festival', 'allot', 'mixed', 'compost', 'hedge']);
export const SIDES_OUT = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // south, east, north, west: the way out of a tile
const SIDES = SIDES_OUT;

const isHome = (item) => !!ITEMS[item]?.home;

// What the film can be made of. cells: [[key, cell]]; tiles: the island's tiles; sim: the simulation's result;
// yOf(key): the height of a tile's top (from the 3D world; 1 everywhere in tests).
export function findSet(cells, tiles, sim, yOf = () => 1) {
  const cellAt = new Map(cells || []); const tileAt = new Map((tiles || []).map((t) => [t.k, t]));
  const itemAt = (k) => cellAt.get(k)?.item || null;
  const yAt = (k) => { try { const y = yOf(k); return Number.isFinite(y) ? y : 1; } catch { return 1; } };
  // a tile a low camera cannot pass through: a building, the wood's trees, a fixed landmark, or off the island
  const blocked = (k) => { const t = tileAt.get(k); if (!t) return true; if (t.fixed || t.zone === 'wood') return true; const it = itemAt(k); return !!it && ITEMS[it]?.kind === 'build' && !FLAT.has(it); };
  // the side of a tile with the most open ground beside it, for a street pass or a close-up
  const openSide = (t) => {
    let best = 0, bestScore = 99;
    SIDES.forEach(([dx, dz], i) => {
      const [tx, tz] = [-dz, dx]; let score = 0;
      for (const s of [-1, 0, 1]) if (blocked(key(t.gx + dx + tx * s, t.gz + dz + tz * s))) score += s === 0 ? 2 : 1;
      if (score < bestScore) { bestScore = score; best = i; }
    });
    return { side: best, clear: bestScore === 0 };
  };
  const place = (id, label, icon, draw, t, extra = {}) => { const [x, z] = tileXZ(t.gx, t.gz); return { id, label, icon, draw, k: t.k, gx: t.gx, gz: t.gz, x: x + (extra.dx || 0), z, y: yAt(t.k), ...openSide(t), built: !!extra.built }; };

  const places = []; const sorted = [...tileAt.values()].sort((a, b) => a.gx - b.gx || a.gz - b.gz);
  for (const [item, id, label, icon, draw] of BUILDS) {
    const on = sorted.filter((t) => (item === 'home' ? isHome(itemAt(t.k)) : itemAt(t.k) === item)); if (!on.length) continue;
    // of several, the one with the most of its own kind beside it (the middle of the homes), else the first
    const near = (t) => SIDES.filter(([dx, dz]) => on.some((o) => o.gx === t.gx + dx && o.gz === t.gz + dz)).length;
    const t = on.reduce((a, b) => (near(b) > near(a) ? b : a));
    places.push(place(id, label, icon, draw, t, { built: true }));
  }
  const built = places.length;
  const river = sorted.filter((t) => t.zone === 'river');
  const crossing = river.find((t) => ['bridge', 'greenbridge'].includes(itemAt(t.k)));
  const water = river.filter((t) => !itemAt(t.k)).sort((a, b) => Math.abs(a.gz - 5) - Math.abs(b.gz - 5))[0];
  if (water) places.push(place('river', 'the river', '🏞', 'river', water));
  const wood = sorted.filter((t) => t.zone === 'wood' && !itemAt(t.k) && !t.fixed).sort((a, b) => b.gz - a.gz || a.gx - b.gx)[0];
  if (wood) places.push(place('wood', 'the old wood', '🌲', 'pines', wood));
  if (crossing) places.push(place('crossing', 'the river bridge', '🌉', 'bridge', crossing, { built: true }));
  else if (tileAt.has(BRIDGE_TILE)) places.push(place('bridge', 'the rope bridge', '🌉', 'bridge', tileAt.get(BRIDGE_TILE), { dx: 5 }));
  const old = sorted.find((t) => t.fixed === 'oldschool'); if (old) places.push(place('oldschool', 'the old school', '🏫', 'school', old));
  const lab = sorted.find((t) => t.fixed === 'ailab'); if (lab) places.push(place('ailab', 'the AI Lab', '🔬', 'lab', lab));
  const dock = sorted.find((t) => t.fixed === 'dock'); if (dock) places.push(place('dock', 'the ferry dock', '⛴', 'dock', dock));

  // the tiles to choose from: up to three of the child's own builds, then landmarks, six in all
  const offer = [...places.slice(0, Math.min(built, MAX_BUILDS)), ...places.slice(built)].slice(0, MAX_OFFER).map((p) => p.id);

  // who is there
  const homes = sim?.homes?.length ? sim.homes.map((h) => h.k).filter((k) => tileAt.has(k)) : sorted.filter((t) => isHome(itemAt(t.k))).map((t) => t.k);
  const home = homes[0] ? tileAt.get(homes[0]) : null;
  const who = {
    family: home ? { here: true, pos: [tileXZ(home.gx, home.gz)[0], yAt(home.k) + 1, tileXZ(home.gx, home.gz)[1] + 3.4], k: home.k } : { here: false },
    otters: sim?.species?.otters ? { here: true, pos: [riverX(2) - 0.4, 0.6, 2] } : { here: false },
    florence: { here: true, pos: [14, 3, 22] },
  };
  // Florence stands on open ground beside her AI Lab while a film is made, so the camera always knows where she is
  if (lab) { const k = screenSpot(lab.k, cells, tiles); const t = k ? tileAt.get(k) : null; who.florence.pos = t ? [tileXZ(t.gx, t.gz)[0], yAt(t.k), tileXZ(t.gx, t.gz)[1]] : [tileXZ(lab.gx, lab.gz)[0] - 4, yAt(lab.k), tileXZ(lab.gx, lab.gz)[1] + 2]; }

  // the middle of the town: the middle of the town land if there is some, else the middle of the island
  const land = sorted.filter((t) => cellAt.get(t.k)?.mark === 'town' || itemAt(t.k));
  const mid = land.length >= 3 ? [land.reduce((s, t) => s + tileXZ(t.gx, t.gz)[0], 0) / land.length, 1, land.reduce((s, t) => s + tileXZ(t.gx, t.gz)[1], 0) / land.length] : CENTRE;
  const town = [(mid[0] + CENTRE[0]) / 2, 1, (mid[2] + CENTRE[2]) / 2]; // halfway: the town in the middle, the whole island in view

  const school = places.find((p) => p.id === 'school') ? 'school' : places.find((p) => p.id === 'oldschool') ? 'oldschool' : null;
  // where the finished film is shown: by the hall or the market if there is one, else by the AI Lab
  const square = ['hall', 'market', 'ailab'].find((id) => places.some((p) => p.id === id)) || null;
  return { places, offer, who, town, school, square, built, empty: built === 0 };
}

export const placeOf = (set, id) => set?.places.find((p) => p.id === id) || null;
export const whoHere = (set) => WHO_IDS.filter((w) => set?.who[w]?.here);

// A subject is 'town', 'place:<id>' or 'who:<id>'. In words: "the whole town", "the market square", "the otters".
export function subjectLabel(sub, set) {
  const [kind, id] = String(sub).split(':');
  if (kind === 'place') return placeOf(set, id)?.label || 'the town';
  if (kind === 'who') return WHO[id]?.label || 'someone';
  return 'the whole town';
}

// A free tile near a place, to stand the film screen on (and for Florence to stand on by her Lab). The screen is
// wider than a tile and faces the island's usual view (the south-west), so the best spot is close to the place, has
// open ground on both sides and in front, and is not behind the place. null when nothing nearby is free.
export function screenSpot(placeKey, cells, tiles) {
  const cellAt = new Map(cells || []); const tileAt = new Map((tiles || []).map((t) => [t.k, t])); const t = tileAt.get(placeKey); if (!t) return null;
  const tall = (gx, gz) => { const n = tileAt.get(key(gx, gz)); if (!n) return false; if (n.fixed || n.zone === 'wood') return true; const it = cellAt.get(n.k)?.item; return !!it && ITEMS[it]?.kind === 'build' && !FLAT.has(it); };
  let best = null, bestScore = Infinity;
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
    if (!dx && !dz) continue; const n = tileAt.get(key(t.gx + dx, t.gz + dz)); if (!n || n.fixed || n.zone === 'river' || n.zone === 'wood') continue;
    const it = cellAt.get(n.k)?.item; if (it && !['path', 'festival'].includes(it)) continue;
    const score = (Math.abs(dx) + Math.abs(dz)) * 1.5 + (tall(n.gx - 1, n.gz) ? 3 : 0) + (tall(n.gx + 1, n.gz) ? 3 : 0) + (tall(n.gx, n.gz + 1) ? 2 : 0) + (tall(n.gx - 1, n.gz + 1) ? 1 : 0) + (dz < 0 ? 2 : 0) + (dx > 0 ? 0.25 : 0);
    if (score < bestScore) { bestScore = score; best = n.k; }
  }
  return best;
}
