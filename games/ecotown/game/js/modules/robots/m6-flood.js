// Mission 6, the flood rescue robot: design, test in a simulation, improve. Pure: no page.
// The child chooses a body, sensors, floats and a battery. The simulation drives it down a flooded street, part by part,
// to a dark house where someone is waiting. Every part has a real reason to pass or fail, and every choice adds weight.
// The numbers are the game's own (shown to ages 13–17), kept simple and consistent; they are not a real robot's.

export const BODIES = {
  wheels: { j: 'Wheels', s: 'Wheels', kg: 10, icon: '🛞', go: { road: 1, rubble: null, mud: null, shallow: 2, deep: null }, floats: true },
  tracks: { j: 'Tracks', s: 'Tracks', kg: 14, icon: '⛓️', go: { road: 2, rubble: 2, mud: 2, shallow: 2, deep: null }, floats: true },
  legs: { j: 'Legs', s: 'Legs', kg: 12, icon: '🦿', go: { road: 2, rubble: 2, mud: 3, shallow: 3, deep: null }, floats: false },
  boat: { j: 'Boat hull', s: 'Boat hull', kg: 8, icon: '🚤', go: { road: null, rubble: null, mud: null, shallow: 2, deep: 1 }, floats: false },
};
export const SENSORS6 = { camera: { j: 'Camera', s: 'Camera', kg: 1, icon: '📷' }, heat: { j: 'Heat camera', s: 'Heat camera', kg: 2, icon: '🌡️' } };
export const BATTERIES = { small: { j: 'Small battery', s: 'Small battery (300 Wh)', kg: 2, wh: 300 }, big: { j: 'Big battery', s: 'Big battery (600 Wh)', kg: 6, wh: 600 } };
export const FLOATS = { kg: 3, holds: 25 };
export const WH_PER_KG_MIN = 1.5; // energy used: 1.5 Wh for every kilogram, every minute
export const FLOAT_MIN = 4;      // minutes to paddle across deep water on floats
export const PARTS = {
  road: { j: 'Road', s: 'Road', icon: '🛣️' }, rubble: { j: 'Fallen bricks', s: 'Rubble', icon: '🧱' }, mud: { j: 'Thick mud', s: 'Mud', icon: '🟫' },
  shallow: { j: 'Shallow water', s: 'Shallow water (30 cm)', icon: '💧' }, deep: { j: 'Deep water', s: 'Deep water (1.5 m)', icon: '🌊' }, house: { j: 'Dark house', s: 'Dark house', icon: '🏚️' },
};
export const STREETS = [
  { id: 'one', parts: ['road', 'rubble', 'mud', 'shallow', 'house'], j: 'The flooded street', s: 'Street 1: after the storm' },
  { id: 'two', parts: ['road', 'rubble', 'deep', 'shallow', 'house'], j: 'The water has risen', s: 'Street 2: the river is still rising' },
];
// A design: { body, sensors: [ids], floats: bool, battery }
export const DEFAULT = { body: null, sensors: [], floats: false, battery: 'small' };
export function weightOf(d) { const b = BODIES[d.body]; if (!b) return 0; return b.kg + d.sensors.reduce((s, x) => s + (SENSORS6[x]?.kg || 0), 0) + (d.floats && b.floats ? FLOATS.kg : 0) + (BATTERIES[d.battery]?.kg || 0); }
export const ready = (d) => !!BODIES[d.body] && d.sensors.length > 0 && !!BATTERIES[d.battery];
// Run the simulation. Returns { parts: [{ part, ok, mins, why }], reached, found, used, wh, kg, mins, end }
export function simulate(street, d, junior) {
  const b = BODIES[d.body]; const kg = weightOf(d); const wh = BATTERIES[d.battery].wh; const floats = d.floats && b.floats; const out = []; let used = 0; let mins = 0;
  const say = (j, s) => (junior ? j : s);
  for (const part of street.parts) {
    if (part === 'house') {
      const found = d.sensors.includes('heat');
      out.push({ part, ok: found, mins: 0, why: found ? say('Inside it is dark. The heat camera saw someone warm upstairs. Found!', 'Dark inside: the heat camera picked up a warm body upstairs. Person found.')
        : say('It reached the house, but it is dark inside. A camera needs light, so it could not see anyone.', 'Arrived, but a normal camera sees nothing in the dark: no one found.') });
      return { parts: out, reached: true, found, used: Math.round(used), wh, kg, mins, end: found ? 'found' : 'dark' };
    }
    let m = b.go[part];
    if (part === 'deep' && m === null && floats) {
      if (kg > FLOATS.holds) { out.push({ part, ok: false, mins: 0, why: say('Too heavy for its floats. It sank. Take something off.', `It weighs ${kg} kg; the floats hold ${FLOATS.holds} kg. It sank.`) }); return { parts: out, reached: false, found: false, used: Math.round(used), wh, kg, mins, end: 'sank' }; }
      m = FLOAT_MIN;
    }
    if (m === null) { out.push({ part, ok: false, mins: 0, why: stuck(d.body, part, junior) }); return { parts: out, reached: false, found: false, used: Math.round(used), wh, kg, mins, end: 'stuck' }; }
    const need = m * kg * WH_PER_KG_MIN;
    if (used + need > wh) { out.push({ part, ok: false, mins: m, why: say('The battery ran out here. It stopped.', `Battery empty: it needed ${Math.round(used + need)} Wh by here and had ${wh} Wh.`) }); return { parts: out, reached: false, found: false, used: wh, wh, kg, mins: mins + m, end: 'battery' }; }
    used += need; mins += m;
    out.push({ part, ok: true, mins: m, why: passLine(d.body, part, m, floats, junior) });
  }
  return { parts: out, reached: true, found: false, used: Math.round(used), wh, kg, mins, end: 'dark' };
}
function stuck(body, part, junior) {
  const J = { 'wheels:rubble': 'Wheels cannot climb over fallen bricks. It got stuck.', 'wheels:mud': 'Its wheels spun in the thick mud. It got stuck.', 'wheels:deep': 'The water is too deep for wheels. It would sink. Floats could help.',
    'tracks:deep': 'The water is too deep for tracks. It would sink. Floats could help.', 'legs:deep': 'Legs cannot swim, and floats do not fit on legs.', 'boat:road': 'A boat cannot drive along a dry road.', 'boat:rubble': 'A boat cannot cross fallen bricks.', 'boat:mud': 'A boat cannot cross mud.' };
  const S = { 'wheels:rubble': 'Wheels lose grip on rubble: stuck.', 'wheels:mud': 'Wheels sink and spin in mud: stuck.', 'wheels:deep': '1.5 m of water is too deep to drive through. Floats would let it paddle across.',
    'tracks:deep': '1.5 m of water is too deep to drive through. Floats would let it paddle across.', 'legs:deep': 'Legs cannot cross 1.5 m of water, and floats do not fit legs.', 'boat:road': 'A hull cannot move on dry road.', 'boat:rubble': 'A hull cannot cross rubble.', 'boat:mud': 'A hull cannot cross mud.' };
  return (junior ? J : S)[`${body}:${part}`] || (junior ? 'It could not get across.' : 'Impassable for this body.');
}
function passLine(body, part, m, floats, junior) {
  if (part === 'deep') return junior ? (body === 'boat' ? 'The boat glided across the deep water.' : 'Its floats kept it up. It paddled slowly across.') : (body === 'boat' ? `Crossed by hull in ${m} min.` : `Paddled across on floats in ${m} min.`);
  if (junior) return m <= 1 ? 'Across, quickly.' : m === 2 ? 'Across.' : 'Across, slowly.';
  return `Across in ${m} min.`;
}
export function testLine(r, junior) {
  if (r.end === 'found') return junior ? 'It reached the house and found the person. The rescue team knows where to go.' : `Rescue found in ${r.mins} min, using ${r.used} of ${r.wh} Wh, weighing ${r.kg} kg.`;
  const last = r.parts[r.parts.length - 1]; return junior ? `Not yet. ${last.why}` : `Failed at ${PARTS[last.part].s.toLowerCase()}. ${last.why}`;
}
// the design in a few words, for the record
export function designWords(d, junior) {
  const b = BODIES[d.body]; if (!b) return '';
  const bits = [b[junior ? 'j' : 's'].toLowerCase(), ...d.sensors.map((x) => SENSORS6[x][junior ? 'j' : 's'].toLowerCase()), ...(d.floats && b.floats ? ['floats'] : []), BATTERIES[d.battery].j.toLowerCase()];
  return `${bits.slice(0, -1).join(', ')} and ${bits[bits.length - 1]}`;
}
export function cleanDesign(d) {
  const o = d && typeof d === 'object' ? d : {}; const body = BODIES[o.body] ? o.body : null;
  return { body, sensors: Array.isArray(o.sensors) ? [...new Set(o.sensors.filter((x) => SENSORS6[x]))] : [], floats: !!o.floats && !!body && BODIES[body].floats, battery: BATTERIES[o.battery] ? o.battery : 'small' };
}
