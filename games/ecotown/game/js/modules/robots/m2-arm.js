// Mission 2, the greenhouse robot arm: a program of steps, run one at a time. Pure: no page.
// The arm hangs from a rail over a tray of four seedlings and a packing box. It can move along the rail (only when
// lifted), go down, close its gripper, go up and open it. Every outcome is what the arm would really do with that order.

export const SPOTS = 4;                       // seedlings in the tray
export const X_OF = (i) => 10 + i * 10;      // ages 13–17: seedling i (0–3) is at x = 10, 20, 30, 40 cm
export const BOX_X = 70; export const HOME_X = 0;
// The step tiles. move: to a seedling (0–3), 'box' or 'next' (the next seedling still in the tray).
export const OPS = {
  down: { j: 'Down', s: 'Down', icon: '⬇' }, up: { j: 'Up', s: 'Up', icon: '⬆' },
  close: { j: 'Close grip', s: 'Close grip', icon: '✊' }, open: { j: 'Open grip', s: 'Open grip', icon: '✋' },
};
export function label(c, junior) {
  if (c.op !== 'move') return OPS[c.op][junior ? 'j' : 's'];
  if (c.to === 'box') return junior ? 'Move to the box' : `Move to x = ${BOX_X}`;
  if (c.to === 'next') return junior ? 'Move to the next seedling' : 'Move to next: x + 10';
  return junior ? `Move to seedling ${c.to + 1}` : `Move to x = ${X_OF(c.to)}`;
}
export const same = (a, b) => a.op === b.op && (a.op !== 'move' || a.to === b.to);
export const isCmd = (c) => !!c && typeof c === 'object' && (OPS[c.op] || (c.op === 'move' && (c.to === 'box' || c.to === 'next' || (Number.isInteger(c.to) && c.to >= 0 && c.to < SPOTS))));

export const startArm = (tray = [1, 1, 1, 1]) => ({ at: 'home', down: false, open: true, hold: null, tray: [...tray], box: 0, dropped: 0, cursor: -1 });
const where = (a) => (a.at === 'home' ? 'home' : a.at === 'box' ? 'box' : `seedling ${a.at + 1}`);
// One step. Returns { arm, ok, stop, text }: stop means the program cannot go on (the arm would damage something).
export function step(arm, c, junior) {
  const a = { ...arm, tray: [...arm.tray] };
  if (c.op === 'move') {
    if (a.down) return { arm: a, ok: false, stop: true, text: junior ? 'The arm is down. Moving now would drag it through the tray. It stopped. Lift it first.' : 'Fault: a move while the arm is down would drag it through the tray. Add Up before a move.' };
    let to = c.to;
    if (to === 'next') { const from = Number.isInteger(a.cursor) ? a.cursor + 1 : 0; to = a.tray.findIndex((v, i) => v && i >= from); if (to < 0) to = a.tray.findIndex((v) => v); if (to < 0) return { arm: a, ok: false, stop: true, text: 'There are no seedlings left in the tray.' }; a.cursor = to; }
    a.at = to; return { arm: a, ok: true, text: `It moves to ${where(a)}.` };
  }
  if (c.op === 'down') { if (a.down) return { arm: a, ok: true, text: 'It is already down.' }; a.down = true; return { arm: a, ok: true, text: 'It goes down.' }; }
  if (c.op === 'up') { if (!a.down) return { arm: a, ok: true, text: 'It is already up.' }; a.down = false; return { arm: a, ok: true, text: a.hold !== null ? 'It lifts the seedling.' : 'It goes up.' }; }
  if (c.op === 'close') {
    if (!a.open) return { arm: a, ok: true, text: 'The grip is already closed.' };
    a.open = false;
    if (!a.down) return { arm: a, ok: true, text: 'The grip closes on thin air: the arm is up, too high to reach.' };
    if (typeof a.at === 'number' && a.tray[a.at]) { a.hold = a.at; a.tray[a.at] = 0; return { arm: a, ok: true, text: 'The grip closes round the seedling.' }; }
    return { arm: a, ok: true, text: a.at === 'box' ? 'The grip closes, but there is nothing to pick up in the box.' : 'The grip closes, but there is no seedling there.' };
  }
  // open
  if (a.open) return { arm: a, ok: true, text: a.down && typeof a.at === 'number' && a.tray[a.at] ? 'The grip is already open, so the seedling is not picked up.' : 'The grip is already open.' };
  a.open = true; if (a.hold === null) return { arm: a, ok: true, text: 'The grip opens. It was not holding anything.' };
  const was = a.hold; a.hold = null;
  if (!a.down) { a.dropped++; return { arm: a, ok: false, text: junior ? 'It let go up high. The seedling fell and broke.' : 'Released while raised: the seedling fell and was damaged.' }; }
  if (a.at === 'box') { a.box++; return { arm: a, ok: true, text: 'It puts the seedling in the box.' }; }
  if (typeof a.at === 'number') { if (!a.tray[a.at]) { a.tray[a.at] = 1; return { arm: a, ok: true, text: 'It puts the seedling back in the tray.' }; } }
  a.dropped++; return { arm: a, ok: false, text: 'It let go of the seedling in the wrong place.' };
}
// Run a whole program (repeat: how many times the body runs). Returns every step's result and the end state.
export function run(body, { repeat = 1, tray = [1, 1, 1, 1], junior = true, max = 80 } = {}) {
  let arm = startArm(tray); const steps = [];
  for (let r = 0; r < repeat; r++) for (let i = 0; i < body.length; i++) {
    if (steps.length >= max) return { steps, arm, stopped: true };
    const s = step(arm, body[i], junior); steps.push({ i, r, ...s }); arm = s.arm; if (s.stop) return { steps, arm, stopped: true };
  }
  return { steps, arm, stopped: false };
}

// ---------- the three tasks, harder each time
//   one:   pack seedling 1 into the box
//   debug: a program that breaks; step through, find the wrong step and fix it
//   tray:  pack the whole tray with a repeat
export const TASKS = [
  { id: 'one', tiles: [{ op: 'move', to: 0 }, { op: 'move', to: 'box' }, { op: 'down' }, { op: 'close' }, { op: 'up' }, { op: 'open' }], goal: 1 },
  { id: 'debug', tiles: [{ op: 'move', to: 1 }, { op: 'move', to: 'box' }, { op: 'down' }, { op: 'close' }, { op: 'up' }, { op: 'open' }], goal: 1, tray: [0, 1, 1, 1],
    start: [{ op: 'move', to: 1 }, { op: 'down' }, { op: 'open' }, { op: 'up' }, { op: 'move', to: 'box' }, { op: 'down' }, { op: 'open' }, { op: 'up' }] },
  { id: 'tray', tiles: [{ op: 'move', to: 'next' }, { op: 'move', to: 'box' }, { op: 'down' }, { op: 'close' }, { op: 'up' }, { op: 'open' }], goal: 4, repeat: true },
];
export const MAX_STEPS = 12;
// Did the program do the task? { done, text } — what happened, in one line, true of the run.
export function judge(task, body, repeat = 1, junior = true) {
  const r = run(body, { repeat, tray: task.tray || [1, 1, 1, 1], junior }); const a = r.arm; const goal = task.goal;
  const left = a.tray.reduce((s, v) => s + v, 0);
  if (!body.length) return { done: false, r, text: 'The program is empty. Tap the step tiles to add steps.' };
  if (r.stopped) return { done: false, r, text: r.steps[r.steps.length - 1].text };
  if (a.dropped) return { done: false, r, text: junior ? `A seedling was dropped from up high. Find the step where the grip opens while the arm is up.` : 'A seedling was released while raised. Find the open-grip step that comes before Down.' };
  if (a.hold !== null) return { done: false, r, text: 'It is still holding a seedling at the end. Where does it let go?' };
  if (a.box >= goal) return { done: true, r, text: goal > 1 ? `All ${goal} seedlings are in the box.` : 'The seedling is in the box.' };
  if (goal > 1 && a.box > 0) return { done: false, r, text: `${a.box} of ${goal} in the box. ${left} still in the tray.${repeat < goal ? ' How many times must it repeat?' : ''}` };
  return { done: false, r, text: junior ? 'Nothing reached the box. Step through it and watch the grip.' : 'Nothing reached the box. Step through and check the grip state at each step.' };
}
// The first step that goes wrong in a run (for the debugging hint after two failed tries), or -1.
export function firstBad(task, body, repeat = 1) {
  const r = run(body, { repeat, tray: task.tray || [1, 1, 1, 1] }); const i = r.steps.findIndex((s) => !s.ok || s.stop || /thin air|nothing to pick|no seedling|not picked up/.test(s.text));
  return i < 0 ? -1 : r.steps[i].i;
}
export const cleanProgram = (p) => (Array.isArray(p) ? p.filter(isCmd).slice(0, MAX_STEPS).map((c) => (c.op === 'move' ? { op: 'move', to: c.to } : { op: c.op })) : []);
