// Mission 2 page: program the greenhouse arm. Tasks: one seedling, a program with a bug, the whole tray with a repeat,
// and (ages 13–17) an order for two seedlings where the child sets each move's x. The arm is updated in place while a
// program runs, so with motion on it glides along the rail and up and down.
import { tasksFor, maxFor, label, startArm, step, judge, firstBad, cleanProgram, X_OF, BOX_X, SPOTS } from './m2-arm.js';
import { esc } from './shell.js';
import { stageOf } from './missions.js';

const INK = '#3b2a1e';
const px = (x) => 50 + 5 * x; // where on the drawing a position on the rail (cm) is
const seed = (cx, cy, k = 1) => `<g transform="translate(${cx} ${cy}) scale(${k})"><path d="M0 0v-16" stroke="#2e7d3a" stroke-width="3"/><path d="M0 -12c-10-8-16 0-12 4c4 2 8 0 12-4zM0 -15c8-10 16-2 12 2c-4 3-9 1-12-2z" fill="#5fa85a" stroke="${INK}" stroke-width="1.6"/></g>`;
const DROP = 58; // how far the gripper goes down
function scenery(arm, senior) {
  const tray = Array.from({ length: SPOTS }, (_, i) => `<rect x="${px(X_OF(i)) - 20}" y="190" width="40" height="22" rx="3" fill="#a9743f" stroke="${INK}" stroke-width="2.4"/><rect x="${px(X_OF(i)) - 16}" y="186" width="32" height="7" rx="2" fill="#6b4420"/>${arm.tray[i] ? seed(px(X_OF(i)), 188) : ''}<text x="${px(X_OF(i))}" y="232" font-size="${senior ? 12 : 13}" font-weight="800" text-anchor="middle" fill="${INK}">${senior ? `x=${X_OF(i)}` : i + 1}</text>`).join('');
  const inBox = Array.from({ length: arm.box }, (_, i) => seed(px(BOX_X) - 24 + i * 16, 186, 0.8)).join('');
  const box = `<path d="M${px(BOX_X) - 38} 168h76l-6 46h-64z" fill="#c99a62" stroke="${INK}" stroke-width="2.6"/>${inBox}<path d="M${px(BOX_X) - 38} 168h76" stroke="${INK}" stroke-width="2.6"/><text x="${px(BOX_X)}" y="232" font-size="12" font-weight="800" text-anchor="middle" fill="${INK}">${senior ? `x=${BOX_X}` : 'Box'}</text>`;
  const dropped = Array.from({ length: arm.dropped }, (_, i) => `<g transform="translate(${px(arm.x) - 10 + i * 14} 222) rotate(80)">${seed(0, 0, 0.7)}</g>`).join('');
  return `${tray}${box}${dropped}`;
}
const fingers = (open) => (open ? `<path d="M-16 0v18M16 0v18" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` : `<path d="M-7 0v18M7 0v18" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`);
const armLabel = (arm) => `The robot arm is ${arm.down ? 'down' : 'up'} at ${arm.at === 'box' ? 'the box' : arm.at === 'home' ? 'its start' : arm.at === 'air' ? `x = ${arm.x}` : `seedling ${arm.at + 1}`}, grip ${arm.open ? 'open' : 'closed'}${arm.hold !== null ? ', holding a seedling' : ''}. ${arm.box} in the box.`;
// The arm, the tray and the box, side on. senior: the ruler in centimetres.
export function armSvg(arm, senior = false) {
  return `<svg class="rb-armsvg" viewBox="0 10 480 232" role="img" aria-label="${armLabel(arm)}">
    <rect x="0" y="214" width="480" height="26" fill="#d6a469"/><rect x="20" y="20" width="440" height="14" rx="5" fill="#8d98a3" stroke="${INK}" stroke-width="2.6"/>
    ${senior ? Array.from({ length: 9 }, (_, i) => `<path d="M${px(i * 10)} 34v6" stroke="${INK}" stroke-width="1.5"/>`).join('') : ''}
    <g class="rb-scenery">${scenery(arm, senior)}</g>
    <g class="rb-armg" style="transform: translateX(${px(arm.x)}px)">
      <g class="rb-grip" style="transform: translateY(${arm.down ? DROP : 0}px)"><g transform="translate(0 92)"><rect x="-5" y="-112" width="10" height="106" fill="#b9c2cb" stroke="${INK}" stroke-width="2.2"/><rect x="-20" y="-6" width="40" height="10" rx="3" fill="#f4b73b" stroke="${INK}" stroke-width="2.4"/><g class="rb-fing">${fingers(arm.open)}</g><g class="rb-held">${arm.hold !== null ? seed(0, 28) : ''}</g></g></g>
      <rect x="-22" y="13" width="44" height="27" rx="6" fill="#16c79a" stroke="${INK}" stroke-width="2.6"/></g></svg>`;
}
// Move the drawn arm to a new state without redrawing it (so a CSS transition can play).
export function updateArm(svg, arm, senior) {
  if (!svg) return; svg.setAttribute('aria-label', armLabel(arm));
  svg.querySelector('.rb-armg').style.transform = `translateX(${px(arm.x)}px)`; svg.querySelector('.rb-grip').style.transform = `translateY(${arm.down ? DROP : 0}px)`;
  svg.querySelector('.rb-fing').innerHTML = fingers(arm.open); svg.querySelector('.rb-held').innerHTML = arm.hold !== null ? seed(0, 28) : ''; svg.querySelector('.rb-scenery').innerHTML = scenery(arm, senior);
}

const TASK_TEXT = {
  one: { j: 'Pack seedling 1 into the box. Write the steps, then press Run.', s: 'Task 1: move the seedling at x = 10 into the box at x = 70.' },
  debug: { j: 'This program should pack seedling 2, but it goes wrong. Step through it, find the wrong step, and fix it.', s: 'Task 2: this program for the seedling at x = 20 has a bug. Step through, find it and fix it.' },
  tray: { j: 'Now pack the whole tray. Write the steps for one seedling, then set how many times to repeat them.', s: 'Task 3: write the loop body once, using “next”, and set the repeat count to pack all four.' },
  order: { s: 'Task 4: an order for two seedlings only. Pack the ones at x = 20 and x = 40; the ones at x = 10 and 30 stay. Set the x of each move yourself.' },
};

export async function playM2(ctx, sh, cur, keep) {
  const j = sh.junior; const d = { fixed: false, steps: 0, rep: 1, runs: 0, order: false, ...(cur?.d || {}) }; let part = cur?.part || 0;
  const TASKS = tasksFor(j); const steps = j ? ['One seedling', 'Fix the bug', 'The whole tray'] : ['One seedling', 'Fix the bug', 'The whole tray', 'An order'];
  for (; part < TASKS.length; part++) {
    if (ctx.signal.aborted) return null;
    const task = TASKS[part]; const MAX = maxFor(task); let prog = cleanProgram(d.prog && d.at === part ? d.prog : task.start || [], MAX); let repeat = task.repeat ? Math.max(1, Math.min(SPOTS, d.at === part ? d.rep || 1 : 1)) : 1;
    let sel = prog.length - 1; let arm = startArm(task.tray); let cursor = 0; let running = false; let fails = 0; let verdict = null; let solved = false; let stepX = 10; const stepTexts = [];
    sh.setup({ mission: { n: 2, icon: '🦾' }, steps, stage: `m2-${task.id}` }); sh.step(part); ctx.report({ stage: stageOf(2, steps[part].toLowerCase()) });
    sh.say(TASK_TEXT[task.id][j ? 'j' : 's']);
    const save = () => { d.prog = prog; d.at = part; if (task.repeat) d.rep = repeat; keep(part, d); };
    await sh.wait((done) => {
      const flat = () => { const out = []; for (let r = 0; r < repeat; r++) prog.forEach((c, i) => out.push({ c, i, r })); return out; };
      const reset = () => { arm = startArm(task.tray); cursor = 0; verdict = null; stepTexts.length = 0; };
      const nowText = () => { const now = flat()[cursor - 1]; return now ? `Step ${now.i + 1}${repeat > 1 ? ` (time ${now.r + 1} of ${repeat})` : ''}: ${stepTexts[cursor - 1] || ''}` : ''; };
      const tileLabel = (c) => (c.op === 'move' && c.x === null ? null : label(c, j));
      function draw() {
        const now = flat()[cursor - 1]; const bad = fails >= 2 && !solved ? firstBad(task, prog, repeat) : -1; const cols = prog.length >= 7;
        const tiles = task.tiles.map((c, k) => (tileLabel(c) === null
          ? `<div class="rb-xtile"><span>Move to x =</span><button type="button" class="rb-rep" data-x="-5" aria-label="5 less" ${stepX <= 0 ? 'disabled' : ''}>−</button><b aria-live="polite">${stepX}</b><button type="button" class="rb-rep" data-x="5" aria-label="5 more" ${stepX >= 100 ? 'disabled' : ''}>+</button><button type="button" class="rb-tile" data-k="${k}" aria-label="Add: move to x = ${stepX}">Add</button></div>`
          : `<button type="button" class="rb-tile" data-k="${k}">${esc(tileLabel(c))}</button>`)).join('');
        const rep = task.repeat ? `<span class="rb-repeat"><b>Repeat</b><button type="button" class="rb-rep" data-rep="-1" aria-label="Fewer repeats" ${repeat <= 1 ? 'disabled' : ''}>−</button><span aria-live="polite">${repeat} time${repeat === 1 ? '' : 's'}</span><button type="button" class="rb-rep" data-rep="1" aria-label="More repeats" ${repeat >= SPOTS ? 'disabled' : ''}>+</button></span>` : '';
        sh.main.innerHTML = `<div class="rb-m2"><div class="rb-panel rb-armbox">${armSvg(arm, !j)}
            ${verdict ? `<p class="rb-verdict ${verdict.ok ? 'ok' : 'miss'}" aria-live="polite">${esc(verdict.text)}</p>` : `<p class="rb-verdict rb-now" aria-live="polite"${now ? '' : ' hidden'}>${esc(nowText())}</p>`}</div>
          <div class="rb-progbox rb-panel"><h3>Step tiles<small>${j ? 'Tap one to add it.' : 'Tap to add.'}</small></h3>
            <div class="rb-tiles" role="group" aria-label="Step tiles">${tiles}</div>
            <div class="rb-proghead"><h3>Program<small>${prog.length} step${prog.length === 1 ? '' : 's'}${repeat > 1 ? `, ${prog.length * repeat} run` : ''}</small></h3>${rep}</div>
            <ol class="rb-prog${cols ? ' cols' : ''}" style="--rows:${Math.ceil(prog.length / 2)}">${prog.map((c, i) => `<li class="${i === sel ? 'sel' : ''}${now && now.i === i ? ' run' : ''}${bad === i ? ' bad' : ''}"><button type="button" class="rb-pstep" data-i="${i}" aria-pressed="${i === sel}" aria-label="Step ${i + 1}: ${esc(label(c, j))}${i === sel ? '. New steps go after this one' : ''}"><i>${i + 1}</i>${esc(label(c, j))}</button><button type="button" class="rb-pdel" data-del="${i}" aria-label="Remove step ${i + 1}">✕</button></li>`).join('') || `<li class="rb-pempty">${j ? 'Tap a step tile above to add it.' : 'Empty: tap a tile to add a step.'}</li>`}</ol>
            <p class="rb-addhint">${sel >= 0 && sel < prog.length - 1 ? `New steps go after step ${sel + 1}.` : 'New steps go at the end.'}</p></div></div>`;
        sh.main.querySelectorAll('.rb-pstep').forEach((b) => { b.onclick = () => { sel = +b.dataset.i; draw(); if (sh.keys()) sh.main.querySelector(`.rb-pstep[data-i="${sel}"]`)?.focus(); }; });
        sh.main.querySelectorAll('.rb-pdel').forEach((b) => { b.onclick = () => { if (running) return; const i = +b.dataset.del; prog.splice(i, 1); sel = Math.min(i - 1 < 0 ? 0 : i - 1, prog.length - 1); reset(); save(); draw(); foot(); sh.focusSoon('.rb-pstep, .rb-tile'); }; });
        sh.main.querySelectorAll('.rb-tile').forEach((b) => { b.onclick = () => { if (running) return; if (prog.length >= MAX) { sh.say(j ? 'That is as many steps as fit. Remove one first.' : `At most ${MAX} steps.`); return; } const t = task.tiles[+b.dataset.k]; const c = t.op === 'move' && t.x === null ? { op: 'move', x: stepX } : { ...t }; prog.splice(sel + 1, 0, c); sel++; reset(); save(); draw(); foot(); if (sh.keys()) sh.main.querySelector(`.rb-tile[data-k="${b.dataset.k}"]`)?.focus(); }; });
        sh.main.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => { stepX = Math.max(0, Math.min(100, stepX + +b.dataset.x)); draw(); if (sh.keys()) sh.main.querySelector(`[data-x="${b.dataset.x}"]`)?.focus(); }; });
        sh.main.querySelectorAll('[data-rep]').forEach((b) => { b.onclick = () => { if (running) return; repeat = Math.max(1, Math.min(SPOTS, repeat + +b.dataset.rep)); reset(); save(); draw(); foot(); if (sh.keys()) sh.main.querySelector(`[data-rep="${b.dataset.rep}"]`)?.focus(); }; });
        sh.main.querySelector('.rb-prog li.run')?.scrollIntoView({ block: 'nearest' });
      }
      // one step shown without redrawing the page: the arm moves, the running step lights up and stays in view
      function showStep() {
        updateArm(sh.main.querySelector('.rb-armsvg'), arm, !j); const now = flat()[cursor - 1];
        sh.main.querySelectorAll('.rb-prog li').forEach((li, k) => li.classList.toggle('run', !!now && k === now.i));
        const p = sh.main.querySelector('.rb-armbox .rb-verdict'); if (p) { p.hidden = false; p.className = 'rb-verdict rb-now'; p.textContent = nowText(); }
        sh.main.querySelector('.rb-prog li.run')?.scrollIntoView({ block: 'nearest' });
      }
      function foot() {
        sh.foot.innerHTML = solved ? `<p class="rb-hint">${j ? 'It works!' : 'Done.'}</p><button type="button" class="rb-btn alt" data-again>Run it again</button><button type="button" class="rb-btn go" data-next>${part < TASKS.length - 1 ? 'Next task' : 'Carry on'} ➜</button>`
          : `<button type="button" class="rb-btn alt" data-reset ${cursor === 0 || running ? 'disabled' : ''}>↺ Start again</button><button type="button" class="rb-btn alt" data-step ${!prog.length || running ? 'disabled' : ''}>Step ➜</button><button type="button" class="rb-btn go" data-run ${!prog.length || running ? 'disabled' : ''}>▶ Run</button>`;
        const on = (sel2, fn) => { const b = sh.foot.querySelector(sel2); if (b) b.onclick = fn; };
        on('[data-reset]', () => { reset(); draw(); foot(); }); on('[data-step]', stepOnce); on('[data-run]', runAll); on('[data-next]', () => done()); on('[data-again]', () => { reset(); draw(); runAll(); });
      }
      const fresh = sh.guard();
      function finish() {
        const v = judge(task, prog, repeat, j); verdict = { ok: v.done, text: v.text }; d.runs++;
        if (v.done) { solved = true; if (task.id === 'debug') d.fixed = true; if (task.id === 'tray') { d.steps = prog.length; d.rep = repeat; } if (task.id === 'order') d.order = true; save(); ctx.say(`${v.text} ${task.id === 'tray' ? (j ? `${prog.length} steps, repeated ${repeat} times, did ${prog.length * repeat} steps of work.` : `${prog.length} steps × ${repeat} = ${prog.length * repeat} steps run.`) : ''}`); }
        else { fails++; ctx.say(fails >= 2 && firstBad(task, prog, repeat) >= 0 ? `${v.text} ${j ? `Look closely at step ${firstBad(task, prog, repeat) + 1}.` : `Check step ${firstBad(task, prog, repeat) + 1}.`}` : v.text); }
        draw(); foot(); sh.main.querySelector('.rb-armbox .rb-verdict')?.scrollIntoView({ block: 'nearest' }); sh.focusSoon(solved ? '[data-next]' : '[data-reset]');
      }
      function stepOnce() {
        if (running || !fresh()) return; if (cursor >= flat().length) { reset(); draw(); }
        const list = flat(); const f = list[cursor]; const s = step(arm, f.c, j); arm = s.arm; stepTexts[cursor] = s.text; cursor++; verdict = null;
        ctx.say(`Step ${f.i + 1}. ${s.text}`); showStep(); foot();
        if (s.stop || cursor >= list.length) { sh.later(finish, sh.still ? 0 : 380); return; }
        sh.focusSoon('[data-step]');
      }
      function runAll() {
        if (running || !fresh()) return; reset(); draw(); running = true; foot();
        const list = flat(); const gap = Math.max(260, 620 - list.length * 10);
        const one = () => { if (ctx.signal.aborted) return; const f = list[cursor]; const s = step(arm, f.c, j); arm = s.arm; stepTexts[cursor] = s.text; cursor++; showStep();
          if (s.stop || cursor >= list.length) { sh.later(() => { running = false; finish(); }, sh.still ? 0 : 380); return; } sh.later(one, gap); };
        if (sh.still) { while (cursor < list.length) { const f = list[cursor]; const s = step(arm, f.c, j); arm = s.arm; stepTexts[cursor] = s.text; cursor++; if (s.stop) break; } running = false; finish(); return; }
        one();
      }
      draw(); foot(); sh.focusSoon('.rb-tile, [data-step]');
    });
    d.prog = null; d.at = part + 1; keep(part + 1, d);
  }
  return { fixed: d.fixed, steps: d.steps, rep: d.rep, runs: d.runs, order: !!d.order };
}
