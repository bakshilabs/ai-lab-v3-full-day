// Mission 2 page: program the greenhouse arm. Three tasks: one seedling, a program with a bug, the whole tray with a repeat.
import { TASKS, label, startArm, step, judge, firstBad, cleanProgram, MAX_STEPS, X_OF, BOX_X, HOME_X, SPOTS } from './m2-arm.js';
import { esc } from './shell.js';
import { stageOf } from './missions.js';

const px = (at) => 50 + 5 * (at === 'home' ? HOME_X : at === 'box' ? BOX_X : X_OF(at)); // where on the drawing
// The arm, the tray and the box, side on. arm: from m2-arm.js. senior: the ruler in centimetres.
export function armSvg(arm, senior = false) {
  const x = px(arm.at); const y = arm.down ? 150 : 92; const INK = '#3b2a1e';
  const seed = (cx, cy, k = 1) => `<g transform="translate(${cx} ${cy}) scale(${k})"><path d="M0 0v-16" stroke="#2e7d3a" stroke-width="3"/><path d="M0 -12c-10-8-16 0-12 4c4 2 8 0 12-4zM0 -15c8-10 16-2 12 2c-4 3-9 1-12-2z" fill="#5fa85a" stroke="${INK}" stroke-width="1.6"/></g>`;
  const tray = Array.from({ length: SPOTS }, (_, i) => `<rect x="${px(i) - 20}" y="190" width="40" height="22" rx="3" fill="#a9743f" stroke="${INK}" stroke-width="2.4"/><rect x="${px(i) - 16}" y="186" width="32" height="7" rx="2" fill="#6b4420"/>${arm.tray[i] ? seed(px(i), 188) : ''}${senior ? `<text x="${px(i)}" y="232" font-size="12" font-weight="700" text-anchor="middle" fill="${INK}">x=${X_OF(i)}</text>` : `<text x="${px(i)}" y="232" font-size="13" font-weight="800" text-anchor="middle" fill="${INK}">${i + 1}</text>`}`).join('');
  const inBox = Array.from({ length: arm.box }, (_, i) => seed(px('box') - 24 + i * 16, 186, 0.8)).join('');
  const box = `<path d="M${px('box') - 38} 168h76l-6 46h-64z" fill="#c99a62" stroke="${INK}" stroke-width="2.6"/>${inBox}<path d="M${px('box') - 38} 168h76" stroke="${INK}" stroke-width="2.6"/><text x="${px('box')}" y="232" font-size="12" font-weight="800" text-anchor="middle" fill="${INK}">${senior ? `x=${BOX_X}` : 'Box'}</text>`;
  const dropped = Array.from({ length: arm.dropped }, (_, i) => `<g transform="translate(${x - 10 + i * 14} 222) rotate(80)">${seed(0, 0, 0.7)}</g>`).join('');
  const grip = arm.open ? `<path d="M${x - 16} ${y}v18M${x + 16} ${y}v18" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` : `<path d="M${x - 7} ${y}v18M${x + 7} ${y}v18" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  const held = arm.hold !== null ? seed(x, y + 28) : '';
  return `<svg class="rb-armsvg" viewBox="0 0 480 240" role="img" aria-label="The robot arm is ${arm.down ? 'down' : 'up'} over ${arm.at === 'box' ? 'the box' : arm.at === 'home' ? 'its start' : `seedling ${arm.at + 1}`}, grip ${arm.open ? 'open' : 'closed'}${arm.hold !== null ? ', holding a seedling' : ''}. ${arm.box} in the box.">
    <rect x="0" y="214" width="480" height="26" fill="#d6a469"/><rect x="20" y="20" width="440" height="14" rx="5" fill="#8d98a3" stroke="${INK}" stroke-width="2.6"/>
    ${tray}${box}${dropped}
    <g class="rb-armg"><rect x="${x - 22}" y="14" width="44" height="26" rx="6" fill="#16c79a" stroke="${INK}" stroke-width="2.6"/><rect x="${x - 5}" y="40" width="10" height="${y - 40}" fill="#b9c2cb" stroke="${INK}" stroke-width="2.2"/><rect x="${x - 20}" y="${y - 6}" width="40" height="10" rx="3" fill="#f4b73b" stroke="${INK}" stroke-width="2.4"/>${grip}${held}</g></svg>`;
}

const TASK_TEXT = {
  one: { j: 'Pack seedling 1 into the box. Write the steps, then press Run.', s: 'Task 1: move the seedling at x = 10 into the box at x = 70.' },
  debug: { j: 'This program should pack seedling 2, but it goes wrong. Step through it, find the wrong step, and fix it.', s: 'Task 2: this program for the seedling at x = 20 has a bug. Step through, find it and fix it.' },
  tray: { j: 'Now pack the whole tray. Write the steps for one seedling, then set how many times to repeat them.', s: 'Task 3: write the loop body once, using “next”, and set the repeat count to pack all four.' },
};

export async function playM2(ctx, sh, cur, keep) {
  const j = sh.junior; const d = { fixed: false, steps: 0, rep: 1, runs: 0, ...(cur?.d || {}) }; let part = cur?.part || 0;
  const steps = ['One seedling', 'Fix the bug', 'The whole tray'];
  for (; part < TASKS.length; part++) {
    if (ctx.signal.aborted) return null;
    const task = TASKS[part]; let prog = cleanProgram(d.prog && d.at === part ? d.prog : task.start || []); let repeat = task.repeat ? Math.max(1, Math.min(SPOTS, d.at === part ? d.rep || 1 : 1)) : 1;
    let sel = prog.length - 1; let arm = startArm(task.tray); let cursor = 0; let running = false; let fails = 0; let verdict = null; let solved = false;
    sh.setup({ mission: { n: 2, icon: '🦾' }, steps, stage: `m2-${task.id}` }); sh.step(part); ctx.report({ stage: stageOf(2, steps[part].toLowerCase()) });
    sh.say(TASK_TEXT[task.id][j ? 'j' : 's']);
    const save = () => { d.prog = prog; d.at = part; d.rep = repeat; keep(part, d); };
    await sh.wait((done) => {
      const total = () => prog.length * repeat;
      const flat = () => { const out = []; for (let r = 0; r < repeat; r++) prog.forEach((c, i) => out.push({ c, i, r })); return out; };
      const reset = () => { arm = startArm(task.tray); cursor = 0; verdict = null; stepTexts.length = 0; };
      function draw() {
        const now = flat()[cursor - 1]; const bad = fails >= 2 && !solved ? firstBad(task, prog, repeat) : -1;
        sh.main.innerHTML = `<div class="rb-m2"><div class="rb-panel rb-armbox">${armSvg(arm, !j)}
            ${verdict ? `<p class="rb-verdict ${verdict.ok ? 'ok' : 'miss'}" aria-live="polite">${esc(verdict.text)}</p>` : now ? `<p class="rb-verdict" aria-live="polite">Step ${now.i + 1}${repeat > 1 ? ` (time ${now.r + 1} of ${repeat})` : ''}: ${esc(stepTexts[cursor - 1] || '')}</p>` : ''}</div>
          <div class="rb-progbox rb-panel"><h3>Step tiles<small>${j ? 'Tap one to add it.' : 'Tap to add.'}</small></h3>
            <div class="rb-tiles" role="group" aria-label="Step tiles">${task.tiles.map((c, k) => `<button type="button" class="rb-tile" data-k="${k}">${esc(label(c, j))}</button>`).join('')}</div>
            <h3>Program<small>${prog.length} step${prog.length === 1 ? '' : 's'}${repeat > 1 ? `, repeated ${repeat} times: ${total()} steps run` : ''}</small></h3>
            <ol class="rb-prog">${prog.map((c, i) => `<li class="${i === sel ? 'sel' : ''}${now && now.i === i ? ' run' : ''}${bad === i ? ' bad' : ''}"><button type="button" class="rb-pstep" data-i="${i}" aria-pressed="${i === sel}" aria-label="Step ${i + 1}: ${esc(label(c, j))}${i === sel ? '. New steps go after this one' : ''}"><i>${i + 1}</i>${esc(label(c, j))}</button><button type="button" class="rb-pdel" data-del="${i}" aria-label="Remove step ${i + 1}">✕</button></li>`).join('') || `<li class="rb-pempty">${j ? 'Tap a step tile below to add it.' : 'Empty: tap a tile to add a step.'}</li>`}</ol>
            ${task.repeat ? `<div class="rb-repeat"><b>Repeat</b><button type="button" class="rb-rep" data-rep="-1" aria-label="Fewer repeats" ${repeat <= 1 ? 'disabled' : ''}>−</button><span aria-live="polite">${repeat} time${repeat === 1 ? '' : 's'}</span><button type="button" class="rb-rep" data-rep="1" aria-label="More repeats" ${repeat >= SPOTS ? 'disabled' : ''}>+</button></div>` : ''}
            <p class="rb-addhint">${sel >= 0 && sel < prog.length - 1 ? `New steps go after step ${sel + 1}.` : 'New steps go at the end.'}</p>
</div></div>`;
        sh.main.querySelectorAll('.rb-pstep').forEach((b) => { b.onclick = () => { sel = +b.dataset.i; draw(); if (sh.keys()) sh.main.querySelector(`.rb-pstep[data-i="${sel}"]`)?.focus(); }; });
        sh.main.querySelectorAll('.rb-pdel').forEach((b) => { b.onclick = () => { if (running) return; const i = +b.dataset.del; prog.splice(i, 1); sel = Math.min(i - 1 < 0 ? 0 : i - 1, prog.length - 1); reset(); save(); draw(); foot(); sh.focusSoon('.rb-pstep, .rb-tile'); }; });
        sh.main.querySelectorAll('.rb-tile').forEach((b) => { b.onclick = () => { if (running) return; if (prog.length >= MAX_STEPS) { sh.say(j ? 'That is as many steps as fit. Remove one first.' : `At most ${MAX_STEPS} steps.`); return; } const c = { ...task.tiles[+b.dataset.k] }; prog.splice(sel + 1, 0, c); sel++; reset(); save(); draw(); foot(); if (sh.keys()) sh.main.querySelector(`.rb-tile[data-k="${b.dataset.k}"]`)?.focus(); }; });
        sh.main.querySelectorAll('.rb-rep').forEach((b) => { b.onclick = () => { if (running) return; repeat = Math.max(1, Math.min(SPOTS, repeat + +b.dataset.rep)); reset(); save(); draw(); foot(); if (sh.keys()) sh.main.querySelector(`.rb-rep[data-rep="${b.dataset.rep}"]`)?.focus(); }; });
      }
      function foot() {
        sh.foot.innerHTML = solved ? `<p class="rb-hint">${j ? 'It works!' : 'Done.'}</p><button type="button" class="rb-btn alt" data-again>Run it again</button><button type="button" class="rb-btn go" data-next>${part < TASKS.length - 1 ? 'Next task' : 'Carry on'} ➜</button>`
          : `<button type="button" class="rb-btn alt" data-reset ${cursor === 0 || running ? 'disabled' : ''}>↺ Start again</button><button type="button" class="rb-btn alt" data-step ${!prog.length || running ? 'disabled' : ''}>Step ➜</button><button type="button" class="rb-btn go" data-run ${!prog.length || running ? 'disabled' : ''}>▶ Run</button>`;
        const on = (sel2, fn) => { const b = sh.foot.querySelector(sel2); if (b) b.onclick = fn; };
        on('[data-reset]', () => { reset(); draw(); foot(); }); on('[data-step]', stepOnce); on('[data-run]', runAll); on('[data-next]', () => done()); on('[data-again]', () => { reset(); runAll(); });
      }
      const fresh = sh.guard();
      function finish() {
        const v = judge(task, prog, repeat, j); verdict = { ok: v.done, text: v.text }; d.runs++;
        if (v.done) { solved = true; if (task.id === 'debug') d.fixed = true; if (task.id === 'tray') { d.steps = prog.length; d.rep = repeat; } save(); ctx.say(`${v.text} ${part === 2 ? (j ? `${prog.length} steps, repeated ${repeat} times, did ${prog.length * repeat} steps of work.` : `${prog.length} steps × ${repeat} = ${prog.length * repeat} steps run.`) : ''}`); }
        else { fails++; ctx.say(fails >= 2 && firstBad(task, prog, repeat) >= 0 ? `${v.text} ${j ? `Look closely at step ${firstBad(task, prog, repeat) + 1}.` : `Check step ${firstBad(task, prog, repeat) + 1}.`}` : v.text); }
        draw(); foot(); sh.focusSoon(solved ? '[data-next]' : '[data-reset]');
      }
      function stepOnce() {
        if (running || !fresh()) return; const all = flat(); if (cursor >= all.length) { reset(); }
        const list = flat(); const f = list[cursor]; const s = step(arm, f.c, j); arm = s.arm; stepTexts[cursor] = s.text; cursor++; verdict = null;
        ctx.say(`Step ${f.i + 1}. ${s.text}`);
        if (s.stop || cursor >= list.length) { finish(); return; }
        draw(); foot(); sh.focusSoon('[data-step]');
      }
      const stepTexts = [];
      const drawStep = () => draw();
      function runAll() {
        if (running || !fresh()) return; reset(); running = true; foot();
        const list = flat();
        const one = () => { if (ctx.signal.aborted) return; const f = list[cursor]; const s = step(arm, f.c, j); arm = s.arm; stepTexts[cursor] = s.text; cursor++;
          if (s.stop || cursor >= list.length) { running = false; finish(); return; } drawStep(); sh.later(one, Math.max(220, 620 - list.length * 12)); };
        if (sh.still) { while (cursor < list.length) { const f = list[cursor]; const s = step(arm, f.c, j); arm = s.arm; stepTexts[cursor] = s.text; cursor++; if (s.stop) break; } running = false; finish(); return; }
        one();
      }
      draw(); foot(); sh.focusSoon('.rb-tile, [data-step]');
    });
    d.prog = null; d.at = part + 1; keep(part + 1, d);
  }
  return { fixed: d.fixed, steps: d.steps, rep: d.rep, runs: d.runs };
}
