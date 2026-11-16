// Power control room: the hour-by-hour model. Pure: no page, no 3D. Seeded, so the same day always plays the same.
// One "unit" is the power one home uses at its busiest hour. A day runs from 6 in the morning to 6 the next morning.
// The town's kit (wind turbines, solar roofs, battery stores) is read from the child's own town with catalog.js.
// It does not touch the game's simulation: it only reads what was built.
import { ITEMS } from '../../world/catalog.js';

export const HOURS = 24;
export const START = 6;                                   // the first hour of a day: 6 in the morning
export const clockAt = (i) => (START + i) % 24;           // step 0..23 -> clock hour
export const MODES = ['charge', 'hold', 'use'];
export const DAY_IDS = ['today', 'windy', 'still', 'winter', 'grey', 'front'];   // grey and front: forecasting practice (mission 2)
export const isWinter = (dayId) => dayId === 'winter' || dayId === 'front';
export const TEST_DAYS = ['windy', 'still', 'winter'];
export const KW = 5;                                      // ages 13-17: one unit is shown as 5 kW (5 kWh in an hour)

// ---- parts of the day, by clock hour
export const BLOCKS = ['morning', 'midday', 'afternoon', 'evening', 'night'];
export function blockOf(clock) { return clock >= 6 && clock < 10 ? 'morning' : clock >= 10 && clock < 14 ? 'midday' : clock >= 14 && clock < 18 ? 'afternoon' : clock >= 18 && clock < 22 ? 'evening' : 'night'; }
export const afterDark = (clock, winter = false) => (winter ? clock >= 16 || clock < 8 : clock >= 18 || clock < 6);

// ---- weather: what the wind and the sun do, hour by hour (0 = none, 1 = a good strong day)
const WIND = {
  today:  [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.85, 0.85, 0.9, 0.85, 0.85, 0.8, 0.7, 0.55, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.25, 0.25],
  windy:  [1.1, 1.1, 1.15, 1.1, 1.05, 1.1, 1.0, 1.05, 1.1, 1.15, 1.2, 1.2, 1.15, 1.1, 1.1, 1.15, 1.2, 1.2, 1.15, 1.1, 1.1, 1.05, 1.1, 1.1],
  still:  [0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.75, 0.75, 0.75, 0.7, 0.55, 0.4, 0.2, 0.18, 0.18, 0.18, 0.18, 0.18, 0.18, 0.18, 0.18, 0.18, 0.2, 0.2],
  winter: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.85, 0.85, 0.9, 0.9, 0.85, 0.85, 0.8, 0.75, 0.6, 0.45, 0.3, 0.28, 0.28, 0.28, 0.28, 0.28, 0.3, 0.3],
  // a grey, still morning; a breeze from late morning that drops at teatime, and a windy night
  grey:   [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.12, 0.12, 0.12, 0.15, 0.45, 0.75, 0.8, 0.8, 0.8, 0.75, 0.7, 0.45, 0.25, 0.25, 0.25, 0.3, 0.5, 0.9],
  // winter: a windy morning, a calm afternoon and evening, and the wind coming back in the small hours
  front:  [1.1, 1.1, 1.1, 1.1, 0.9, 0.5, 0.9, 0.9, 0.85, 0.8, 0.75, 0.7, 0.6, 0.45, 0.3, 0.2, 0.18, 0.18, 0.18, 0.18, 0.18, 0.18, 0.2, 0.35],
};
const SUN_PEAK = { today: 0.9, windy: 0.35, still: 1.0, winter: 0.3, grey: 0.4, front: 0.3 };
const SUN_HOURS = { today: [7, 17], windy: [8, 17], still: [7, 17], winter: [9, 15], grey: [8, 17], front: [9, 15] };   // the sun is down before the model's dusk
export const WINTER_DEMAND = 1.25;                        // a winter night is cold: every home needs a quarter more
export const WIND_STRONG = 0.6, WIND_LOW = 0.4, SUN_BRIGHT = 0.5;

function rng(seed) { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r2 = (x) => Math.round(x * 100) / 100;

// The forecast for one kind of day: 24 steps from 6 am, each { clock, wind, sun }. The day then goes exactly as the
// forecast said. The seed only adds a little unevenness, and never moves an hour across "strong" or "low".
export function forecast(dayId, seed = 1) {
  const id = DAY_IDS.includes(dayId) ? dayId : 'today'; const rand = rng(seed * 97 + DAY_IDS.indexOf(id) * 13 + 5);
  const [up, down] = SUN_HOURS[id]; const out = [];
  for (let i = 0; i < HOURS; i++) {
    const clock = clockAt(i); const base = WIND[id][clock]; let wind = r2(Math.max(0, base + (rand() - 0.5) * 0.06));
    if ((base >= WIND_STRONG) !== (wind >= WIND_STRONG) || (base < WIND_LOW) !== (wind < WIND_LOW)) wind = base;
    const k = clock >= up && clock <= down ? Math.sin(((clock - up + 0.5) / (down - up + 1)) * Math.PI) : 0;
    const sun = r2(Math.max(0, SUN_PEAK[id] * k));
    out.push({ i, clock, wind, sun, block: blockOf(clock), dark: afterDark(clock, isWinter(id)) });
  }
  return out;
}

// ---- demand: how much one home, and the school, need at each clock hour (a share of one unit)
const HOME_USE = [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.6, 0.8, 0.6, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.6, 0.9, 1, 1, 1, 1, 0.7, 0.5];
const SCHOOL_USE = [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.2, 0.2];
export const homeNeed = (clock, base = 1, winter = false) => r2(HOME_USE[clock] * base * (winter ? WINTER_DEMAND : 1));
export const schoolNeed = (clock, winter = false) => r2(SCHOOL_USE[clock] * (winter ? WINTER_DEMAND : 1));

// ---- the town's kit
const xy = (k) => String(k).split(',').map(Number);
const OPEN_ZONES = ['coast', 'field', 'slope'];
export const MIN_HOMES = 4, PRACTICE_TO = 6, MAX_HOMES = 24;
export const WIND_FLOOR = 1.2, SUN_FLOOR = 0.6, STORE_FLOOR = 5;       // the least kit, as a multiple of the town's busiest hour

// Read the town: its homes, school, turbines, solar roofs and batteries. A town with too little to practise on is
// lent some for the exercise (kit.lent says what), so the control room always has a real job to do.
export function kitFrom(cells, tiles) {
  const list = Array.isArray(cells) ? cells : cells instanceof Map ? [...cells] : [];
  const all = tiles instanceof Map ? [...tiles.values()] : Array.isArray(tiles) ? tiles : [];
  let school = null, turbines = 0, batteries = 0, roofs = 0; const homes = []; const used = new Set(); const gens = [];
  for (const [k, c] of list) {
    if (!c) continue; if (c.item || c.mark) used.add(k);
    const it = c.item && ITEMS[c.item]; if (!it) continue;
    if (c.item === 'school' && !school) school = { k, built: true };
    if (c.item === 'wind') { turbines++; gens.push(k); } if (c.item === 'battery') { batteries++; gens.unshift(k); }
    if (it.home) { const mods = Array.isArray(c.mods) ? c.mods : []; const solar = mods.includes('solar'); if (solar) roofs++; homes.push({ k, item: c.item, base: 1 + (mods.includes('heatpump') ? ITEMS.heatpump.demand || 0.5 : 0), solar, practice: false }); }
  }
  if (!school) { const t = all.find((x) => x && x.fixed === 'oldschool'); if (t) school = { k: t.k, built: false }; }
  const [sx, sz] = school ? xy(school.k) : [0, 0]; const far = (k) => { const [x, z] = xy(k); return Math.hypot(x - sx, z - sz); };
  homes.sort((a, b) => far(a.k) - far(b.k) || (a.k < b.k ? -1 : 1));
  const built = homes.length;                                          // every home the town has; the desk runs the nearest MAX_HOMES
  if (homes.length > MAX_HOMES) homes.length = MAX_HOMES;
  const lent = { homes: 0, turbines: 0, roofs: 0, batteries: 0 };
  if (homes.length < MIN_HOMES) {
    const open = all.filter((t) => t && !t.fixed && !t.hedge && OPEN_ZONES.includes(t.zone) && !used.has(t.k)).sort((a, b) => far(a.k) - far(b.k) || (a.k < b.k ? -1 : 1));
    const want = PRACTICE_TO - homes.length; const spots = []; // a loose cluster near the school: no two side by side while there is room
    for (const t of open) { if (spots.length >= want) break; if (far(t.k) < 1.5 || spots.some((s) => Math.abs(s.gx - t.gx) + Math.abs(s.gz - t.gz) < 2)) continue; spots.push(t); }
    for (const t of open) { if (spots.length >= want) break; if (!spots.includes(t)) spots.push(t); }
    while (homes.length < PRACTICE_TO) { const t = spots.shift(); homes.push({ k: t ? t.k : null, item: 'practice', base: 1, solar: false, practice: true }); lent.homes++; }
  }
  const peak = r2(homes.reduce((n, h) => n + h.base, 0) + 1);            // every home at its busiest, and the school
  // enough wind to carry a busy evening on a good day, and a battery worth about five busy hours
  while (4 * (turbines + lent.turbines) < WIND_FLOOR * peak) lent.turbines++;
  while (3 * (roofs + lent.roofs) < SUN_FLOOR * peak) lent.roofs++;
  while (12 * (batteries + lent.batteries) < STORE_FLOOR * peak) lent.batteries++;
  const nT = turbines + lent.turbines, nB = batteries + lent.batteries;
  const cap = 3 * (ITEMS.battery.store || 4) * nB; // the battery gives up to a third of itself in an hour, and takes in a sixth
  return { homes, built, school: school || { k: null, built: false }, turbines: nT, roofs: roofs + lent.roofs, batteries: nB, lent, gens,
    wind: (ITEMS.wind.avg || 4) * nT, solar: 1.5 * (ITEMS.solar.avg || 2) * (roofs + lent.roofs), cap, rate: r2(cap / 3), fill: r2(cap / 6), peak };
}

// ---- one hour
// state: { level } (what is in the battery). mode: 'charge' | 'hold' | 'use'. schoolFirst: after dark the school goes first in line.
// Charge: the battery fills first, from what is being made; the town gets the rest. Use: the battery covers what is
// missing, if it has it. Hold: the battery does nothing. Homes are lit in order, nearest the school first; without
// the school-first rule the school is last in line.
export function stepHour(kit, fc, level, mode, { winter = false, schoolFirst = false, turns = false } = {}) {
  const made = r2(kit.wind * fc.wind + kit.solar * fc.sun);
  const needs = kit.homes.map((h) => homeNeed(fc.clock, h.base, winter)); const sNeed = schoolNeed(fc.clock, winter);
  const need = r2(needs.reduce((a, b) => a + b, 0) + sNeed);
  let toBattery = 0, fromBattery = 0;
  if (mode === 'charge') toBattery = Math.max(0, Math.min(kit.fill, kit.cap - level, made));
  if (mode === 'use') fromBattery = Math.max(0, Math.min(kit.rate, level, need - made));
  let left = made - toBattery + fromBattery + 1e-9; const lit = needs.map(() => false); let schoolLit = false;
  const first = schoolFirst && fc.dark;
  if (first && left >= sNeed) { schoolLit = true; left -= sNeed; }
  // turns (ages 13-17): the line starts one home further along each hour, so a shortfall is shared round
  const n = needs.length; const from = turns && n ? fc.i % n : 0;
  for (let k = 0; k < n; k++) { const i = (from + k) % n; if (left >= needs[i]) { lit[i] = true; left -= needs[i]; } }
  if (!first && left >= sNeed) { schoolLit = true; left -= sNeed; }
  const next = r2(Math.max(0, Math.min(kit.cap, level + toBattery - fromBattery)));
  const litCount = lit.filter(Boolean).length;
  return { i: fc.i, clock: fc.clock, mode, wind: fc.wind, sun: fc.sun, made, need, spare: r2(made - need), toBattery: r2(toBattery), fromBattery: r2(fromBattery),
    levelBefore: level, level: next, lit, litCount, dark: needs.length - litCount, schoolLit, wasted: r2(Math.max(0, left)) };
}

export const START_LEVEL = 0.25;   // every day starts with the battery a quarter full

// Run a whole day. decide(info) -> { mode, rule } is asked once an hour; info is what the control desk can see.
export function runDay(kit, dayId, decide, { seed = 1, schoolFirst = false, turns = false, startLevel = START_LEVEL } = {}) {
  const fc = forecast(dayId, seed); const winter = isWinter(dayId); let level = r2(kit.cap * startLevel); const hours = [];
  for (const f of fc) {
    const d = decide({ i: f.i, clock: f.clock, block: f.block, wind: f.wind, sun: f.sun, dark: f.dark, battery: kit.cap ? level / kit.cap : 0 }) || {};
    const mode = MODES.includes(d.mode) ? d.mode : 'hold';
    const h = stepHour(kit, f, level, mode, { winter, schoolFirst, turns }); h.rule = Number.isInteger(d.rule) ? d.rule : -1; hours.push(h); level = h.level;
  }
  return { dayId, hours, ...tally(kit, hours) };
}
// A day run by hand: the 24 modes the child chose.
export const runModes = (kit, dayId, modes, opts) => runDay(kit, dayId, ({ i }) => ({ mode: modes[i] }), opts);

// Totals for a day: lit "home-hours" out of all of them, the school's hours, and the dark spells.
export function tally(kit, hours) {
  const n = kit.homes.length; let litHours = 0, schoolHours = 0; const spells = []; let cur = null;
  for (const h of hours) {
    litHours += h.litCount; if (h.schoolLit) schoolHours++;
    if (h.dark > 0 || !h.schoolLit) { if (cur) { cur.to = h.i; cur.most = Math.max(cur.most, h.dark); if (!h.schoolLit) cur.school = true; if (h.dark > cur.worstDark) { cur.worstDark = h.dark; cur.worst = h.i; } } else { cur = { from: h.i, to: h.i, most: h.dark, worst: h.i, worstDark: h.dark, school: !h.schoolLit }; spells.push(cur); } }
    else cur = null;
  }
  // the longest any one home went without power, in hours on end
  let longest = 0; for (let i = 0; i < n; i++) { let run = 0; for (const h of hours) { run = h.lit[i] ? 0 : run + 1; if (run > longest) longest = run; } }
  const worst = hours.reduce((a, h) => (h.dark + (h.schoolLit ? 0 : 0.5) > a.dark + (a.schoolLit ? 0 : 0.5) ? h : a), hours[0]);
  const any = worst.dark > 0 || !worst.schoolLit;
  return { homes: n, total: n * hours.length, litHours, darkHours: n * hours.length - litHours, schoolHours, share: n ? litHours / (n * hours.length) : 1, spells, longest, worst: any ? worst.i : -1, allLit: !any };
}

// An open tile for the control cabinet the module leaves in the town: the nearest free one to the town's battery or
// turbine (or to the school). null when there is none.
export function signSpot(cells, tiles, kit) {
  const list = Array.isArray(cells) ? cells : []; const all = tiles instanceof Map ? [...tiles.values()] : Array.isArray(tiles) ? tiles : [];
  const used = new Set(list.filter(([, c]) => c && (c.item || c.mark)).map(([k]) => k)); const from = kit?.gens?.[0] || kit?.school?.k; if (!from) return null;
  const [fx, fz] = xy(from); const far = (t) => Math.hypot(t.gx - fx, t.gz - fz);
  const lent = new Set((kit?.homes || []).map((h) => h.k)); // not on a practice home's plot: it has a lantern
  const open = all.filter((t) => t && !t.fixed && !t.hedge && OPEN_ZONES.includes(t.zone) && !used.has(t.k) && !lent.has(t.k) && far(t) > 0).sort((a, b) => far(a) - far(b) || (a.k < b.k ? -1 : 1));
  return open.length ? open[0].k : null;
}
