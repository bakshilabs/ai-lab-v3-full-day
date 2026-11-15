// Mission 4, "Testing in simulation": run the car through test days in a computer, find where it fails, change one
// setting at a time and run again. New tests are added as the car passes. Pure: no page.
//
// How it is simplified: each test day is 100 simulated drives. The number of near misses and needless stops comes
// from a small fixed model of what each setting does (below), not from physics. What is true: test engineers run
// many simulated drives per scenario, change one thing at a time so they know what made the difference, and trade
// safety against needless stops (braking for a paper bag is not free: the car behind may not expect it).

export const SETTINGS = ['speed', 'gap', 'sensors', 'brake'];
export const SET = {
  speed: { name: { j: 'Top speed in town', s: 'Town speed' }, opts: [20, 30], label: (v) => `${v} mph` },
  gap: { name: { j: 'Gap behind the car in front', s: 'Following gap' }, opts: [2, 4], label: (v) => `${v} seconds` },
  sensors: { name: { j: 'Sensors switched on', s: 'Active sensors' }, opts: ['c', 'cr', 'crl'], label: (v) => ({ c: 'Camera', cr: 'Camera + radar', crl: 'Camera + radar + lidar' }[v]) },
  brake: { name: { j: 'Brake for something unclear when…', s: 'Brake threshold for an unclear object' }, opts: ['very', 'fairly', 'maybe'], label: (v, j) => (j ? { very: 'very sure it’s a person', fairly: 'fairly sure', maybe: 'it might be anything' } : { very: 'very sure (90%)', fairly: 'fairly sure (60%)', maybe: 'any chance (20%)' })[v] },
};
export const START = { speed: 30, gap: 2, sensors: 'c', brake: 'very' };
export const DAYS = ['sunny', 'rain', 'school', 'dusk'];
export const DAY = { sunny: { icon: '☀️', name: { j: 'Sunny morning', s: 'Dry, sunny' } }, rain: { icon: '🌧', name: { j: 'Rainy morning', s: 'Rain and spray' } }, school: { icon: '🏫', name: { j: 'School rush', s: 'School run peak' } }, dusk: { icon: '🌆', name: { j: 'Dark evening', s: 'Dusk, low light' } } };
// the tests unlock in stages: the car must pass every test in a stage before the next test is added
export const STAGES = [['sunny', 'rain'], ['sunny', 'rain', 'school'], ['sunny', 'rain', 'school', 'dusk']];
export const RUNS = 100, MAX_STOPS = 5;

export function cleanCfg(c) { const out = {}; for (const k of SETTINGS) out[k] = SET[k].opts.map(String).includes(String(c?.[k])) ? SET[k].opts.find((o) => String(o) === String(c[k])) : START[k]; return out; }
// one test day: near misses and needless stops in 100 drives, the trip time, and why it failed (for the replay)
export function day(id, cfg) {
  const why = []; let near = 0;
  if (id === 'rain') { if (cfg.gap < 4) { near += 6; why.push('gap'); } if (cfg.sensors === 'c') { near += 5; why.push('spray'); } }
  if (id === 'school') { if (cfg.speed > 20) { near += 8; why.push('speed'); } if (cfg.brake === 'very') { near += 4; why.push('unsure'); } }
  if (id === 'dusk') { if (cfg.sensors !== 'crl') { near += 4; why.push('dark'); } if (cfg.brake === 'very') { near += 2; why.push('unsure'); } }
  const stops = { very: 1, fairly: 3, maybe: 9 }[cfg.brake]; if (stops > MAX_STOPS) why.push('stops');
  const mins = (cfg.speed === 20 ? 9 : 7) + (id === 'rain' && cfg.gap === 4 ? 0.5 : 0);
  return { id, near, stops, mins, pass: near === 0 && stops <= MAX_STOPS, why };
}
export const runAll = (days, cfg) => days.map((d) => day(d, cfg));
// what changed between two settings (the child may change one at a time)
export const changed = (a, b) => SETTINGS.filter((k) => String(a[k]) !== String(b[k]));

// what a replay of a failed day shows: the cause, in words. Real test teams watch the replays of failures.
export const REPLAY = {
  gap: { j: 'Replay: the car in front braked. On the wet road our car needed more room.', s: 'Replay: lead car braked; on the wet road our stopping distance exceeded the gap.' },
  spray: { j: 'Replay: spray from the car in front hid it from the camera.', s: 'Replay: road spray blinded the camera; the lead car was lost for 2 s.' },
  speed: { j: 'Replay: a child stepped out between parked cars. The car was too fast to stop.', s: 'Replay: a child stepped out 12 m ahead; at this speed the car could not stop.' },
  unsure: { j: 'Replay: the car saw a shape it was not sure about, and did not brake. It was a child.', s: 'Replay: an unclear shape stayed below the brake threshold. It was a child.' },
  dark: { j: 'Replay: in the low light, the car could not make out a person in dark clothes.', s: 'Replay: low light; neither camera nor radar resolved a pedestrian in dark clothing.' },
  stops: { j: 'Replay: the car braked hard for paper bags and shadows. The car behind nearly hit it.', s: 'Replay: frequent emergency stops for bags and shadows; a following car nearly rear-ended it.' },
};
// Florence's line after a run. prev: the last run's results (or null), ch: what was changed
export function runSay(res, prev, ch, cfg, was, j) {
  const fails = res.filter((r) => !r.pass);
  const lead = !prev ? (j ? 'Test done.' : 'Test complete.') : !ch.length ? (j ? 'Nothing changed, so the results are the same.' : 'No setting changed, so the results are identical.')
    : ch.length > 1 ? (j ? `You changed ${ch.length} things at once, so we cannot tell which one made the difference.` : `${ch.length} settings changed at once: we cannot tell which one caused the difference.`)
      : `${j ? 'You changed' : 'Changed'} ${(j ? SET[ch[0]].name.j : SET[ch[0]].name.s).toLowerCase()}: ${SET[ch[0]].label(was[ch[0]], j)} → ${SET[ch[0]].label(cfg[ch[0]], j)}. ${diffSay(res, prev, j)}`;
  if (!fails.length) return `${lead} ${j ? 'Every test passed!' : 'All tests passed.'}`;
  return `${lead} ${j ? `${fails.length === 1 ? `One test ${prev ? 'still fails' : 'fails'}` : `${fails.length} tests ${prev ? 'still fail' : 'fail'}`}. Tap ${fails.length === 1 ? 'it' : 'one'} to watch the replay.` : `${fails.length} failing. Open a failure to see its replay.`}`;
}
function diffSay(res, prev, j) {
  const parts = []; for (const r of res) { const p = prev.find((x) => x.id === r.id); if (!p) continue; if (p.near !== r.near) parts.push(`${(j ? DAY[r.id].name.j : DAY[r.id].name.s)}: ${p.near} → ${r.near} near misses`); if (p.stops !== r.stops) parts.push(`${j ? 'needless stops' : 'needless stops'} ${p.stops} → ${r.stops}`); }
  return parts.length ? `${[...new Set(parts)].join('; ')}.` : (j ? 'No result changed.' : 'No result changed.');
}
export const M4 = {
  start: { j: 'This is the car as it came from the factory. Let’s test it on two days: a sunny morning and a rainy one. Each test is 100 drives in the computer.', s: 'The car’s factory settings. Run it through two test days, 100 simulated drives each.' },
  rule: { j: 'Change one thing at a time. Then you know what made the difference.', s: 'Change one setting per run, so each difference has one cause.' },
  locked: { j: 'One change at a time. To change something else, put this one back first.', s: 'One change per run. Revert this one to change another.' },
  next: (d, j) => (j ? `Every test passed! Now a new test day: ${DAY[d].name.j.toLowerCase()}.` : `All passing. New test added: ${DAY[d].name.s.toLowerCase()}.`),
  done: { j: 'The car passes every test day! Real cars drive millions of miles in simulation like this before a real road.', s: 'All four test days pass. Real programmes run millions of simulated miles before road testing.' },
};
export function m4Line(rec, j) { return j ? `Tested the car on ${DAYS.length} kinds of day in ${rec?.runs ?? 0} test runs, changing one thing at a time` : `${rec?.runs ?? 0} simulation runs over ${DAYS.length} scenarios; final: ${rec?.cfg ? `${rec.cfg.speed} mph, ${rec.cfg.gap} s gap, ${SET.sensors.label(rec.cfg.sensors)}` : '—'}`; }
