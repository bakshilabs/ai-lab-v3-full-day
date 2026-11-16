// Mission 6, storm night: a storm brings a tree down on a line. Find and cut off the broken part, decide who gets the
// little power there is first, then mend the line safely and bring everyone back. Pure: no page, no 3D.
// The town's network: from the substation, three lines. Each line has two sections, each behind its own switch
// (1A, 1B, 2A, 2B, 3A, 3B). Power reaches a section only if its switch and every switch before it on the line are closed.
// Real practice, made simple:
//  - fault indicators on a line light up where the fault current passed, so the fault lies beyond the last lit one;
//  - engineers open the nearest switch before the fault, so as few people as possible stay off;
//  - with little power, places that keep people safe go first (in Britain, network companies keep a Priority Services
//    Register of homes where someone relies on medical equipment);
//  - a line is proved dead before anyone works on it, and switched back on only when the crew says all clear;
//  - after a long cut, everything that was switched on starts at once ("cold load pickup"), so areas are brought back
//    one at a time.
export const SECTIONS = {
  '1A': { line: 1, load: 2, who: 'health', prio: true }, '1B': { line: 1, load: 3, who: 'north', prio: false },
  '2A': { line: 2, load: 2, who: 'shelter', prio: true }, '2B': { line: 2, load: 1, who: 'medical', prio: true },
  '3A': { line: 3, load: 2, who: 'mill', prio: false }, '3B': { line: 3, load: 3, who: 'river', prio: false },
};
export const IDS = Object.keys(SECTIONS);
export const FAULT = '3B';
export const BATTERY_ONLY = 7;      // round 2: blocks the battery can give while the big grid line is down
export const GRID_BACK = 15;        // round 3: blocks once the big grid line is mended
export const SURGE = 1.5;
export const KWB = 5;               // ages 13-17: one block is 5 kW, as in the other missions           // an area switched on after a long cut briefly needs half as much again
const before = (id) => (id.endsWith('B') ? `${id[0]}A` : null);

// Which sections have power, given the switches (true = closed) and whether the fault is still connected.
export function live(sw, { source = true } = {}) {
  const out = {}; for (const id of IDS) { const b = before(id); out[id] = !!source && !!sw[id] && (!b || out[b]); } return out;
}
// A B switch closed while the A switch before it is open: no power reaches it yet.
export const waiting = (sw, id) => !!sw[id] && id.endsWith('B') && !sw[`${id[0]}A`];
export const waitSay = (id, j) => (j ? `${id} is on, but no power reaches it until ${id[0]}A is on too.` : `${id} is closed, but ${id[0]}A upstream is open: no supply reaches it.`);
export const loadOf = (sw, extra = {}) => IDS.reduce((n, id) => n + (live(sw)[id] ? SECTIONS[id].load * (extra[id] || 1) : 0), 0);
// Is the broken section connected? Then the protection trips its line at the first switch (3A).
export const faultConnected = (sw, fault = FAULT) => !!live(sw)[fault];
// Fault indicators: lit on every section the fault current passed through, from the substation to the fault.
export function indicators(fault = FAULT) { const out = {}; for (const id of IDS) out[id] = id === fault || before(fault) === id; return out; }
export const allClosed = () => Object.fromEntries(IDS.map((id) => [id, true]));
export const allOpen = () => Object.fromEntries(IDS.map((id) => [id, false]));

// Round 1: the tree falls. The protection has opened 3A, so Mill Lane and River Row are dark.
export const r1Start = () => ({ ...allClosed(), '3A': false });
// The child flips one switch. Returns the new switches and what happened ('tripped' when the fault is reconnected).
export function r1Flip(sw, id) {
  const next = { ...sw, [id]: !sw[id] };
  if (faultConnected(next)) return { sw: { ...next, '3A': false }, event: 'tripped' };
  return { sw: next, event: next[id] ? 'closed' : 'opened' };
}
// Round 1 is done when the fault is cut off at 3B and everything else has power again.
export const r1Done = (sw) => !sw[FAULT] && IDS.filter((id) => id !== FAULT).every((id) => live(sw)[id]);
// Homes off that need not be (to say so when a child opens a healthy section).
export const needlessOff = (sw) => IDS.filter((id) => id !== FAULT && !live(sw)[id] && !(id === '3A' && !sw['3A'] && sw[FAULT]));

// Round 2: the big grid line is down too. Everything is off; the battery can give BATTERY_ONLY blocks.
export const r2Start = () => allOpen();
export function r2Flip(sw, id, cap = BATTERY_ONLY) {
  if (id === FAULT) return { sw, event: 'locked' };
  const next = { ...sw, [id]: !sw[id] };
  if (loadOf(next) > cap) return { sw: allOpen(), event: 'overload', load: loadOf(next) };
  return { sw: next, event: next[id] ? 'closed' : 'opened' };
}
export const prioOn = (sw) => IDS.filter((id) => SECTIONS[id].prio).every((id) => live(sw)[id]);
export const r2Done = (sw) => prioOn(sw);
export const r2Best = (sw, cap = BATTERY_ONLY) => prioOn(sw) && IDS.every((id) => id === FAULT || live(sw)[id] || loadOf({ ...sw, [id]: true, ...(before(id) ? { [before(id)]: true } : {}) }) > cap);

// Round 3, part 1: the crew's safe order. Ages 8-12 have four steps, ages 13-17 six.
export const crewSteps = (j) => (j ? ['off', 'dead', 'mend', 'on'] : ['off', 'dead', 'earth', 'mend', 'unearth', 'on']);
export const crewShuffled = (j) => (j ? ['mend', 'on', 'off', 'dead'] : ['mend', 'earth', 'on', 'dead', 'unearth', 'off']);
export function crewCheck(order, j) { const want = crewSteps(j); const right = order.filter((x, i) => want[i] === x).length; return { right, of: want.length, done: right === want.length && order.length === want.length, firstWrong: order.findIndex((x, i) => want[i] !== x) }; }

// Round 3, part 2: the grid is back (GRID_BACK blocks). North homes and River Row are still off after hours without
// power. Switching on one area adds its load times SURGE for the first minutes; both at once may be too much.
export function r3Start() { return { ...allClosed(), '1B': false, '3B': false }; }
export function r3Switch(sw, ids, cap = GRID_BACK) {
  const now = loadOf(sw); const add = ids.reduce((n, id) => n + SECTIONS[id].load * SURGE, 0);
  if (now + add > cap) return { sw: { ...sw }, event: 'overload', peak: now + add, now };
  const next = { ...sw }; for (const id of ids) next[id] = true; return { sw: next, event: 'closed', peak: now + add, now };
}
export const r3Done = (sw) => IDS.every((id) => live(sw)[id]);

// Round 1: getting ready. Four choices help; four do not (unsafe, or they make the night worse).
export const PREP = ['charge', 'crewsout', 'crews', 'drain', 'call', 'health', 'shelter', 'turbines'];
export const PREP_GOOD = new Set(['charge', 'crews', 'call', 'shelter']);
export function prepCheck(picked) { const set = new Set(picked); const good = [...PREP_GOOD].filter((x) => set.has(x)).length; const bad = [...set].filter((x) => !PREP_GOOD.has(x)); return { good, bad, missing: PREP_GOOD.size - good, done: good === PREP_GOOD.size && bad.length === 0 }; }
export const PREP_WORD = {
  charge: { j: 'Fill the town battery before the storm', s: 'Charge the town battery to full ahead of the storm' },
  crewsout: { j: 'Send crews up the poles during the storm to keep watch', s: 'Send crews to work on the lines while the storm is at its height' },
  crews: { j: 'Get repair crews and tree cutters ready to go once the wind drops', s: 'Put repair crews and tree teams on standby for when it is safe' },
  drain: { j: 'Use up the battery this afternoon', s: 'Run the battery down this afternoon' },
  call: { j: 'Phone homes where someone needs a medical machine, to warn them', s: 'Call customers on the Priority Services Register to warn them and offer help' },
  health: { j: 'Switch the health centre off early to save power', s: 'Disconnect the health centre early to save capacity' },
  shelter: { j: 'Open the school as a warm storm shelter', s: 'Open the school as a storm shelter' },
  turbines: { j: 'Stop the turbines from switching off in strong wind', s: 'Override the turbines’ high-wind cut-out' },
};
export const PREP_WHY = {
  crewsout: { j: 'Nobody works on the lines in the storm: it is too dangerous. Crews wait until it is safe.', s: 'Crews do not work at height in a storm; they wait until it is safe.' },
  drain: { j: 'The battery is what keeps the lights on if a line comes down. It should be full.', s: 'The battery is the town’s backup if supply is lost; it should be full.' },
  health: { j: 'The health centre needs power most of all. It is the last place to switch off.', s: 'The health centre is a priority load; it is the last to be disconnected.' },
  turbines: { j: 'Turbines switch off in very strong wind to keep themselves safe. That must not be stopped.', s: 'The cut-out protects the turbine in extreme wind; it must not be overridden.' },
};
export function prepSay(res, tries, picked, j) {
  if (res.done) return j ? 'Good planning. The town is ready for the storm.' : 'Sound preparation: the town is ready.';
  if (tries <= 1) return j ? `Not yet. ${res.bad.length ? `${res.bad.length === 1 ? 'One choice does' : `${res.bad.length} choices do`} not help. ` : ''}${res.missing ? `${res.missing === 1 ? 'One good step is' : `${res.missing} good steps are`} missing.` : ''}` : `Not yet: ${res.bad.length} unhelpful or unsafe, ${res.missing} useful step${res.missing === 1 ? '' : 's'} missing.`;
  const bad = res.bad[0]; if (bad) return (j ? PREP_WHY[bad].j : PREP_WHY[bad].s);
  return j ? 'Think about the people who need help most, and who will mend the lines.' : 'Consider the vulnerable customers and the repair teams.';
}

// ---- words
const pick = (o, j) => (j ? o.j : o.s);
export const WHO = {
  health: { j: 'Health centre', s: 'Health centre' }, north: { j: 'North homes', s: 'North homes' }, shelter: { j: 'School: storm shelter', s: 'School (storm shelter)' },
  medical: { j: 'Homes with medical machines', s: 'Homes with medical equipment' }, mill: { j: 'Mill Lane homes', s: 'Mill Lane homes' }, river: { j: 'River Row homes', s: 'River Row homes' },
};
export const WHO_ICON = { health: '🏥', north: '🏠', shelter: '🏫', medical: '🩺', mill: '🏡', river: '🏘️' };
export const whoWord = (id, j) => pick(WHO[SECTIONS[id].who], j);
export const CREW_WORD = {
  off: { j: 'Make sure the broken line is switched off', s: 'Isolate: switch the line off, lock it off and post a warning notice' },
  dead: { j: 'Test that there is no power in it', s: 'Prove the line dead with a tester' },
  earth: { j: '', s: 'Fit safety earths at both ends; then the crew is issued a permit to work' },
  mend: { j: 'Cut away the tree and mend the line', s: 'Clear the tree and repair the conductor' },
  unearth: { j: '', s: 'The crew stands clear and hands back the permit; then remove the earths' },
  on: { j: 'Crew stands clear, then switch it back on', s: 'Re-energise from the control room' },
};
export const crewWord = (id, j) => pick(CREW_WORD[id], j);
export const STORM = {
  r0: { j: 'Round 1 of 4: a storm is coming', s: 'Round 1 of 4: storm warning' },
  r1: { j: 'Round 2 of 4: find the broken part', s: 'Round 2 of 4: locate and isolate the fault' },
  r2: { j: 'Round 3 of 4: who gets power first?', s: 'Round 3 of 4: priority restoration on battery' },
  r3: { j: 'Round 4 of 4: mend it and bring everyone back', s: 'Round 4 of 4: repair safely and restore' },
  r0how: { j: 'A big storm will reach the town tonight. Choose everything that will help. Leave out anything unsafe or unhelpful.', s: 'A storm is forecast for tonight. Select every useful preparation; leave out the unsafe or unhelpful ones.' },
  psr: { j: 'In real life, power companies keep a list of homes where someone needs a medical machine. They phone them early, keep them updated, and sometimes bring a generator.', s: 'Real networks can rarely switch single homes. Homes on the Priority Services Register get early calls, updates and sometimes a generator.' },
  r1how: { j: 'A tree fell on a line. The red flags show where the fault is: past the last red flag. Open the switch just before it, then switch the rest back on.', s: 'Fault indicators light where fault current flowed: the fault is beyond the last lit one. Open the nearest switch upstream, then restore the healthy section.' },
  r2how: { j: 'The big power line to the town is down too. The town battery can give 7 blocks. Switch places on, most important first. Too much and it all trips off.', s: 'The grid supply is lost; the battery can deliver 35 kW. Restore load in priority order without exceeding it, or the battery protection trips everything.' },
  r3how: { j: 'Put the crew’s jobs in a safe order. Then bring the last homes back.', s: 'Order the crew’s safety procedure, then restore the remaining load.' },
};
export function r1Say(event, sw, id, mistakes, j) {
  if (event === 'tripped') return j ? 'Bang! The broken part was still joined on, so the line tripped off again. The red flags show where the fault is.' : 'Reclosing onto the fault tripped the line again. The fault must be isolated first.';
  if (r1Done(sw)) return j ? 'Done. The broken part is cut off, and everyone else has power.' : 'Fault isolated at 3B; every healthy section is restored.';
  const off = needlessOff(sw);
  if (event === 'opened' && id !== FAULT) return j ? `${whoWord(id, j)} went dark, and that part was not broken. Switch ${id} back on.` : `${id} opened a healthy section: ${whoWord(id, j)} lost supply. Reclose it.`;
  if (event === 'opened' && id === FAULT) return j ? 'The broken part is cut off. Now switch 3A back on, so Mill Lane has power.' : 'Section 3B is isolated. Reclose 3A to restore Mill Lane.';
  if (off.length) return j ? `Still dark: ${off.map((x) => whoWord(x, j)).join(', ')}.` : `Still off supply: ${off.map((x) => whoWord(x, j)).join(', ')}.`;
  return '';
}
export function r1Hint(mistakes, j) {
  if (mistakes <= 1) return j ? 'Look at the red flags. The fault is past the last red flag on its line.' : 'Read the indicators: the fault lies downstream of the last lit indicator.';
  return j ? 'The flags are on line 3, at 3A and 3B. The fault is past 3B. Open 3B, then close 3A.' : 'Indicators at 3A and 3B: the fault is in section 3B. Open 3B, then reclose 3A.';
}
export function r2Say(event, sw, j, load, cap = BATTERY_ONLY) {
  if (event === 'locked') return j ? 'River Row stays off: its line is still broken.' : '3B is isolated for repair and cannot be closed.';
  if (event === 'overload') return j ? `Too much! ${load} blocks wanted, but the battery can only give ${cap}. It tripped, and everything went off. Start again: who needs power most?` : `Overload: ${load * KWB} kW demanded against ${cap * KWB} kW available. The battery tripped and dropped all load.`;
  if (r2Best(sw, cap)) { const extra = IDS.filter((id) => !SECTIONS[id].prio && live(sw)[id]).map((id) => whoWord(id, j)); return j ? `The health centre, the shelter and the medical homes have power${extra.length ? `, and ${extra.join(' and ')} too` : ''}. Nothing more fits.` : `All priority load restored${extra.length ? `, plus ${extra.join(' and ')}` : ''}; the remaining capacity is used.`; }
  if (prioOn(sw)) return j ? 'The places that keep people safe have power. Does anything else still fit?' : 'Priority load is on. Check whether more load fits within capacity.';
  return '';
}
export const r2Hint = (tries, j) => (tries <= 1
  ? (j ? 'Think: who could be hurt without power tonight? Switch them on first.' : 'Restore the sites where loss of supply puts lives at risk first.')
  : (j ? 'First the health centre (1A), the shelter (2A) and the medical homes (2B). That is 5 blocks. Then see what else fits in 7.' : 'Priority: 1A, 2A, 2B (25 kW). Then add what fits within 35 kW.'));
export function crewSay(res, tries, j) {
  if (res.done) return j ? 'That is the safe order. The crew can work, and nobody gets hurt.' : 'Correct sequence: isolate, prove dead, earth, permit, repair, clear and hand back the permit, remove earths, re-energise.';
  if (tries <= 1) return j ? `${res.right} of ${res.of} are in the right place. What must happen before anyone touches the line?` : `${res.right} of ${res.of} in position. What must be true before anyone touches the conductor?`;
  return j ? `Step ${res.firstWrong + 1} is not right yet. Nobody may touch a line until it is off and tested.` : `Step ${res.firstWrong + 1} is out of order. Nothing is touched until it is isolated and proved dead.`;
}
export function r3Say(event, peak, now, j, cap = GRID_BACK) {
  if (event === 'overload') return j ? `Too much at once! After hours without power, every fridge and heater starts together. That needs ${Math.round(peak * 10) / 10} blocks, more than the ${cap} the line can carry, so the safety switch tripped. Try one area at a time.` : `Cold load pickup: the surge reached ${Math.round(peak * KWB)} kW against a ${cap * KWB} kW limit, so the protection tripped the breaker. Restore one area at a time.`;
  return j ? 'Back on. The extra start-up power settles down after a while.' : `Surge peaked at ${Math.round(peak * KWB)} kW, inside the limit; the load settles over the next while.`;
}
