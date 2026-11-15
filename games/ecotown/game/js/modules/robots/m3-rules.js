// Mission 3, the hospital delivery robot: "if … then" rules, tested on a trip. Pure: no page.
// The robot carries medicine from the pharmacy to a ward. At each event on the way it uses the FIRST rule in its list
// that fits. Each action has a real consequence: safe, safe but slower, unsafe, or the medicine never arrives.

export const CONDS = {
  person: { j: 'A person is near', s: 'A person is within 2 metres', icon: '🚶', acts: ['full', 'slow', 'stop'] },
  block: { j: 'Something is in the way', s: 'An object blocks the corridor', icon: '🛒', acts: ['push', 'wait', 'back'] },
  lift: { j: 'It reaches the lift', s: 'It reaches the lift', icon: '🛗', acts: ['stairs', 'call', 'back'] },
  step: { j: 'Someone steps right in front', s: 'Someone steps into its path', icon: '🏃', acts: ['beep', 'slow', 'stop'] },
};
export const ACTS = {
  full: { j: 'Keep going at full speed', s: 'Keep full speed (1 m/s)' }, slow: { j: 'Slow down and keep a gap', s: 'Slow to 0.5 m/s, keep a 1 m gap' }, stop: { j: 'Stop and wait', s: 'Stop until the way is clear' },
  push: { j: 'Push it out of the way', s: 'Push it aside' }, wait: { j: 'Stop, wait, then go round', s: 'Stop, wait 10 s, then plan a way round' }, back: { j: 'Turn back to the pharmacy', s: 'Return to the pharmacy' },
  stairs: { j: 'Take the stairs', s: 'Take the stairs' }, call: { j: 'Call the lift and ride it', s: 'Call the lift by radio and ride it' },
  beep: { j: 'Beep and keep going', s: 'Sound a warning, keep going' },
};
// What each action does at each kind of event: ok, late (safe but slower), unsafe, stuck (it never gets there).
const OUT = {
  person: { full: 'unsafe', slow: 'ok', stop: 'late' },
  step: { stop: 'ok', slow: 'unsafe', full: 'unsafe', beep: 'unsafe' },
  block: { push: 'unsafe', wait: 'ok', back: 'stuck' },
  lift: { call: 'ok', stairs: 'stuck', back: 'stuck' },
};
const SAYS = {
  'person:full': { j: 'It rushed past a person at full speed. That is too close to be safe.', s: 'It passed a person at 1 m/s with no gap: unsafe in a hospital corridor.' },
  'person:slow': { j: 'It slowed down and kept a gap as it passed.', s: 'It slowed to 0.5 m/s and kept a 1 m gap.' },
  'person:stop': { j: 'It stopped and waited until the person had gone. Safe, but slow.', s: 'It stopped until the person had passed: safe, but it added 10 s.' },
  'step:stop': { j: 'Someone stepped in front. It stopped at once.', s: 'Someone stepped into its path. It stopped at once.' },
  'step:slow': { j: 'Someone stepped right in front. It only slowed down, so it could not stop in time.', s: 'Someone stepped into its path. Slowing was not enough: it could not stop in time.' },
  'step:full': { j: 'Someone stepped right in front and it kept going at full speed. That is not safe.', s: 'Someone stepped into its path at full speed: unsafe.' },
  'step:beep': { j: 'It beeped but kept going. A beep does not stop a robot.', s: 'A warning sound does not stop it: unsafe.' },
  'block:push': { j: 'It pushed a trolley along the corridor. That could hurt someone or break things.', s: 'It pushed the trolley: that could injure someone or damage equipment.' },
  'block:wait': { j: 'It stopped, waited, then found a way round the trolley.', s: 'It waited 10 s, then planned a path round the trolley.' },
  'block:back': { j: 'It turned back to the pharmacy. The medicine never arrived.', s: 'It returned to the pharmacy: the delivery failed.' },
  'lift:call': { j: 'It called the lift, waited for the doors and rode up.', s: 'It called the lift by radio and rode up: 40 s.' },
  'lift:stairs': { j: 'A robot on wheels cannot climb stairs. It got stuck at the bottom.', s: 'Wheels cannot climb stairs: it was stuck at the bottom.' },
  'lift:back': { j: 'It turned back at the lift. The medicine never arrived.', s: 'It returned from the lift: the delivery failed.' },
};
// The trip: segments of corridor in metres, and the events on it. at: which segment. x, y: where on the plan (0–100).
export const ROUNDS = [
  { conds: ['person'], route: [[8, 76], [40, 76], [70, 76], [92, 76]], len: [20, 20, 15], events: [{ kind: 'person', seg: 0, x: 30, y: 76 }, { kind: 'person', seg: 1, x: 62, y: 76 }], to: { j: 'Ward 1', s: 'Ward 1' } },
  { conds: ['person', 'block', 'lift'], route: [[8, 76], [40, 76], [72, 76], [72, 24], [92, 24]], len: [20, 20, 0, 15], events: [{ kind: 'person', seg: 0, x: 24, y: 76 }, { kind: 'block', seg: 1, x: 56, y: 76 }, { kind: 'lift', seg: 2, x: 72, y: 50 }, { kind: 'person', seg: 3, x: 84, y: 24 }], to: { j: 'Ward 3, upstairs', s: 'Ward 3 (first floor)' } },
  { conds: ['person', 'block', 'lift', 'step'], route: [[8, 76], [40, 76], [72, 76], [72, 24], [40, 24], [8, 24]], len: [20, 20, 0, 20, 20], events: [{ kind: 'person', seg: 0, x: 20, y: 76 }, { kind: 'step', seg: 1, x: 52, y: 76 }, { kind: 'lift', seg: 2, x: 72, y: 50 }, { kind: 'block', seg: 3, x: 56, y: 24 }, { kind: 'person', seg: 4, x: 24, y: 24 }], to: { j: 'the children’s ward, upstairs', s: 'the children’s ward (first floor)' } },
];
// which conditions fit an event: someone stepping in front is also a person near
export const fits = (kind) => (kind === 'step' ? ['step', 'person'] : [kind]);
// rules: [{ cond, act }] in order. Returns the rule used for an event, or null.
export const ruleFor = (rules, kind) => rules.find((r) => r.act && fits(kind).includes(r.cond)) || null;
export const FULL = 1; export const SLOW = 0.5; // metres a second
// Run a round. Returns { events: [{ kind, rule, out, text, twoFit }], arrived, safe, seconds }
export function trip(round, rules, junior) {
  const evs = []; let arrived = true; let secs = 0; const slowSeg = new Set();
  for (const e of round.events) {
    const r = ruleFor(rules, e.kind); const act = r?.act || null; const out = act ? OUT[e.kind][act] || 'unsafe' : 'unsafe';
    const key = `${e.kind}:${act}`; const words = SAYS[key] ? SAYS[key][junior ? 'j' : 's'] : 'It had no rule for this, so it carried on as before.';
    const twoFit = fits(e.kind).filter((c) => rules.some((x) => x.cond === c)).length > 1;
    evs.push({ kind: e.kind, cond: r?.cond || null, act, out, text: words, twoFit, x: e.x, y: e.y });
    if (act === 'slow') slowSeg.add(e.seg); if (out === 'late') secs += 10; if (e.kind === 'block' && out === 'ok') secs += 10; if (e.kind === 'lift' && out === 'ok') secs += 40;
    if (out === 'stuck') { arrived = false; break; }
  }
  round.len.forEach((m, i) => { secs += m / (slowSeg.has(i) ? SLOW : FULL); });
  return { events: evs, arrived, safe: evs.every((x) => x.out !== 'unsafe'), seconds: Math.round(secs) };
}
// One line for the whole trip, true of it.
export function tripLine(t, round, junior) {
  const unsafe = t.events.filter((e) => e.out === 'unsafe').length; const late = t.events.filter((e) => e.out === 'late').length; const to = round.to[junior ? 'j' : 's'];
  if (!t.arrived) return junior ? `The medicine did not reach ${to}. Change the rule that stopped it.` : `Delivery failed before ${to}. Change the rule that stopped the trip.`;
  if (unsafe) return junior ? `It got to ${to}, but ${unsafe === 1 ? 'one moment was' : `${unsafe} moments were`} not safe. Arriving is not enough: change ${unsafe === 1 ? 'that rule' : 'those rules'}.` : `Arrived at ${to} in ${t.seconds} s, with ${unsafe} unsafe event${unsafe === 1 ? '' : 's'}. Safety comes first: fix ${unsafe === 1 ? 'that rule' : 'them'}.`;
  if (late) return junior ? `Safe all the way to ${to}. It stopped for everyone, so it was slow. Real hospital robots slow down near people and keep a gap.` : `Safe, ${t.seconds} s. Stopping for every passer-by cost ${late * 10} s: slowing with a gap is safe and quicker.`;
  return junior ? `Safe all the way, and the medicine reached ${to}.` : `Safe all the way: delivered to ${to} in ${t.seconds} s.`;
}
// A trip passes when it is safe and the medicine arrives.
export const passed = (t) => t.arrived && t.safe;
// The note after an event where two rules fitted and the first one in the list was not the safe one.
export function orderNote(e, rules, junior) {
  if (!e.twoFit || e.out !== 'unsafe') return null;
  const names = fits(e.kind).filter((c) => rules.some((x) => x.cond === c)).map((c) => `“${CONDS[c][junior ? 'j' : 's']}”`);
  return junior ? `Two rules fitted here: ${names.join(' and ')}. The robot used the first one in its list.` : `Two rules matched: ${names.join(' and ')}. It applies the first match in the list.`;
}
export const cleanRules = (list, conds) => conds.map((c) => { const r = Array.isArray(list) ? list.find((x) => x && x.cond === c) : null; return { cond: c, act: r && CONDS[c].acts.includes(r.act) ? r.act : null }; })
  .sort((a, b) => { const ia = Array.isArray(list) ? list.findIndex((x) => x?.cond === a.cond) : -1; const ib = Array.isArray(list) ? list.findIndex((x) => x?.cond === b.cond) : -1; return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
