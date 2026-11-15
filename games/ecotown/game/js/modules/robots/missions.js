// Robots at work: the six missions of the hour (docs/curriculum.md, section 3), and the progress kept between visits.
// Pure: no page. Each mission opens with the real job, then how to play, and ends with what the child can now do.
// j: ages 8–12, s: ages 13–17.

export const MISSIONS = [
  { n: 1, id: 'sense', icon: '📡', use: 'How any robot works', short: 'Sense, think, act', skill: { j: 'Sensors, and sense, think, act', s: 'Sensors and the control loop' },
    job: { j: 'Every robot does three things, over and over: it senses, it thinks, and it acts. Robot engineers choose its sensors first.',
      s: 'Every robot runs the same loop: sense, think, act. Choosing the right sensors is one of the first jobs of a robotics engineer.' },
    how: { j: ['Match each job to the sensor that can do it.', 'Then watch a robot sense, think and act, and say what it will do next.'],
      s: ['Match each job to the sensor that can do it.', 'Then predict the robot’s next move from its sensor reading and its rule, and set the rule yourself.'] },
    can: { j: 'You can now choose a sensor for a job, and follow a robot’s sense, think, act loop.', s: 'You can now choose a sensor by what it can and cannot measure, and trace a robot’s control loop.' } },
  { n: 2, id: 'arm', icon: '🦾', use: 'Factory and greenhouse arm', short: 'Robot arm', skill: { j: 'Steps, bugs and repeats', s: 'Sequences, debugging and loops' },
    job: { j: 'In factories and greenhouses, robot arms pick and pack all day. A person writes the steps they follow.',
      s: 'Robot arms in factories and greenhouses follow programs of positions and grips. Technicians write them, test them and fix them.' },
    how: { j: ['Tap the step tiles to write the arm’s program.', 'Press Run to watch it. Press Step to go one step at a time.'],
      s: ['Tap the step tiles to write the arm’s program. Positions are in centimetres.', 'Run it, or step through it to find a bug.'] },
    can: { j: 'You can now write steps in order, find a wrong step, and use a repeat.', s: 'You can now write a sequence with positions, debug it step by step, and use a loop.' } },
  { n: 3, id: 'hospital', icon: '🏥', use: 'Hospital delivery robot', short: 'Hospital rules', skill: { j: 'If … then rules, safety first', s: 'Conditional rules and priority' },
    job: { j: 'Some hospitals have robots that carry medicine along the corridors. They follow rules that keep people safe.',
      s: 'Hospital delivery robots carry medicine and samples along corridors and ride the lifts. Their rules keep people safe.' },
    how: { j: ['Choose what the robot does in each case: “If this happens, then do that.”', 'Press Test run and watch the trip.'],
      s: ['Set each “if … then” rule. Then put the rules in order: the robot uses the first one that fits.', 'Test run the trip and read what happened at each event.'] },
    can: { j: 'You can now write “if … then” rules for a robot, and put safety first.', s: 'You can now write condition and action rules, and order them so the safest one wins.' } },
  { n: 4, id: 'sorter', icon: '♻️', use: 'Recycling sorter', short: 'Recycling sorter', skill: { j: 'Teaching by example, fair tests', s: 'Training data and unseen tests' },
    job: { j: 'Recycling centres use robots with cameras to sort rubbish. People teach them by showing them examples.',
      s: 'Recycling plants use camera-guided robots to pick and sort waste. They are trained on examples that people have labelled.' },
    how: { j: ['Tap a thing, then tap its bin, to show the robot an example.', 'Test it on things it has not seen. Then show it more.'],
      s: ['Tap a thing, then its bin: each one is a labelled example.', 'Test on a set it has not seen, read the misses, add examples and test again.'] },
    can: { j: 'You can now teach a robot with examples, and test it on things it has not seen.', s: 'You can now train a classifier by example and test it fairly on unseen things.' } },
  { n: 5, id: 'farm', icon: '🌱', use: 'Farm weeding robot', short: 'Weeding robot', skill: { j: 'How sure before it acts', s: 'Confidence thresholds and costs' },
    job: { j: 'Some farm robots find weeds and pull them out, so farmers need less weedkiller. They must not pull up the crops.',
      s: 'Weeding robots tell crops from weeds with a camera and act only when they are sure enough. Less weedkiller, fewer lost crops.' },
    how: { j: ['Look at how sure the robot is about each plant.', 'Then set how sure it must be before it pulls a plant. Press Weed the row.'],
      s: ['Read the robot’s confidence for each plant.', 'Set the threshold it needs before it pulls. Weed the row and read the table.'] },
    can: { j: 'You can now set how sure a robot must be before it acts, when some mistakes are worse than others.', s: 'You can now choose a confidence threshold when mistakes have different costs.' } },
  { n: 6, id: 'flood', icon: '🌊', use: 'Flood rescue robot', short: 'Flood rescue', skill: { j: 'Design, test, improve', s: 'Design trade-offs and simulation' },
    job: { j: 'After a flood, rescue teams send robots where it is not safe for people. Engineers design them, test them and make them better.',
      s: 'Rescue robots go where it is too dangerous for people, such as a flooded street. Engineers design them, test them in simulation and improve them.' },
    how: { j: ['Choose the robot’s body, sensors and battery.', 'Press Test to try it in the flooded street. Then make it better.'],
      s: ['Choose body, sensors, floats and battery. Each adds weight.', 'Test in the simulation, read where it failed, change it and test again.'] },
    can: { j: 'You can now design a robot for a job, test it, and make it better.', s: 'You can now make design trade-offs, test a design in simulation and improve it.' } },
];
export const mission = (n) => MISSIONS.find((m) => m.n === n) || null;
export const pick = (o, junior) => (junior ? o.j : o.s);

// ---------- progress kept between visits. { v: 3, j, plays, done: [six 0/1], sum: { n: summary }, cur: { n, part, d } | null, m4: sorter state }
export const VERSION = 3;
export function fresh(junior, plays = 0) { return { v: VERSION, j: !!junior, plays, done: [0, 0, 0, 0, 0, 0], sum: {}, cur: null, m4: null, r4: 0, town: null }; }
// What a save holds, checked. A save from another age route, or from the first version, starts again (keeping the play count).
export function cleanProgress(s, junior) {
  const plays = Number.isInteger(s?.plays) && s.plays >= 0 ? Math.min(s.plays, 999) : 0;
  if (!s || typeof s !== 'object' || s.v !== VERSION || !!s.j !== !!junior) return fresh(junior, plays);
  const done = MISSIONS.map((m, i) => (Array.isArray(s.done) && s.done[i] ? 1 : 0));
  // missions open in order: a tick after a gap is not believed
  for (let i = 1; i < 6; i++) if (done[i] && !done[i - 1]) done[i] = 0;
  const sum = {}; for (const m of MISSIONS) { const x = s.sum?.[m.n]; if (done[m.n - 1] && x && typeof x === 'object') sum[m.n] = x; }
  for (const m of MISSIONS) if (done[m.n - 1] && !sum[m.n]) done[m.n - 1] = 0;
  for (let i = 1; i < 6; i++) if (done[i] && !done[i - 1]) done[i] = 0;
  let cur = null; const c = s.cur;
  if (c && Number.isInteger(c.n) && c.n >= 1 && c.n <= 6 && open(done, c.n)) cur = { n: c.n, part: Number.isInteger(c.part) && c.part >= 0 && c.part < 10 ? c.part : 0, d: c.d && typeof c.d === 'object' ? c.d : {} };
  return { v: VERSION, j: !!junior, plays, done, sum, cur, m4: s.m4 && typeof s.m4 === 'object' ? s.m4 : null, r4: Number.isInteger(s.r4) && s.r4 >= 0 ? Math.min(s.r4, 999) : 0, town: s.town && typeof s.town === 'object' ? s.town : null };
}
// May mission n be played? The first is always open; each later one once the one before is done. Finished ones replay.
export const open = (done, n) => n === 1 || !!done[n - 2] || !!done[n - 1];
export const nextMission = (done) => { const i = done.findIndex((d) => !d); return i < 0 ? null : i + 1; };
export const allDone = (done) => done.every(Boolean);
export const doneCount = (done) => done.filter(Boolean).length;
// The leader's list
export function stageOf(n, what = '') { const m = mission(n); return m ? `Mission ${n} of 6, ${m.short}${what ? `: ${what}` : ''}`.slice(0, 80) : 'Choosing a mission'; }
