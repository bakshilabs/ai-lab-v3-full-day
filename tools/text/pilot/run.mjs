// Purpose-first pilot: OpenAI follows the child's journey screen by screen, says why each message exists and what the
// child must understand and do next (the intent), writes each message from that intent (never from the old line),
// and a separate OpenAI "child" reads the screen and the new message and says what it means and what they will do.
// A mismatch goes back for a rewrite with what the child misunderstood. Nothing is applied to the game.
// Usage: node tools/text/pilot/run.mjs <captureDir> <outCsv> <reviewHtml>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, csvLine, rel, tokensOf, VERSION_LABEL } from '../lib.mjs';
import { checkLine } from '../rewrite.mjs';
import { chat, pool, usage, tokenTotals, STUB, estimate, dollars, PRICE } from '../openai.mjs';
import { buildMoments } from './moments.mjs';

const [capDir, outCsv = 'docs/text/pilot-intent-junior-first15.csv', reviewHtml = path.join(capDir, '..', 'pilot-review.html')] = process.argv.slice(2);
const { steps, moments, unmatched } = buildMoments(path.join(capDir, 'steps.json'));
const SYSTEM = fs.readFileSync(path.join(ROOT, 'tools/text/pilot/prompt.md'), 'utf8').replace(/^<!--[\s\S]*?-->\s*/, '')
  .replace('{{GAME_BRIEF}}', fs.readFileSync(path.join(ROOT, 'tools/text/game-brief.md'), 'utf8').replace(/^<!--[\s\S]*?-->\s*/, '').trim());
const AGE = { j: '8–12', b: 'both age groups (8–12 and 13–17)' };

// screenshots as JPEG for the requests and the review page
const jpgDir = path.join(capDir, 'jpg'); fs.mkdirSync(jpgDir, { recursive: true });
const jpg = (file) => { const o = path.join(jpgDir, file.replace(/\.png$/, '.jpg')); if (!fs.existsSync(o)) execFileSync('python3', ['-c', 'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"JPEG",quality=72)', path.join(capDir, file), o]); return o; };
const dataUrl = (file) => `data:image/jpeg;base64,${fs.readFileSync(jpg(file)).toString('base64')}`;
const img = (file) => ({ type: 'image_url', image_url: { url: dataUrl(file), detail: 'high' } });

const placeholders = (m) => tokensOf(m.row.text).filter((t) => t.startsWith('{')).map((t) => ({ placeholder: t, filled_by_code: m.row.seg.ph[t.slice(1, -1)] || '(filled in later by the code: .replace)' }));
const kindOf = (m) => { const l = m.row.text.replace(/\{[^{}]*\}/g, 'x').replace(/<[^>]+>/g, ''); return l.length <= 32 && !/[.!?]$/.test(l.trim()) ? 'a short label or button' : 'a sentence or more'; };
const limitOf = (m) => { const lo = m.row.text.replace(/\{[^{}]*\}/g, '').replace(/<\/?[a-z]+(#\d+)?>/g, '').length; return kindOf(m) === 'a short label or button' ? Math.max(lo + 8, Math.round(lo * 1.35)) : Math.round(lo * 1.6) + 15; };
const seenAs = (m) => [m.onScreen ? `on screen${m.panel ? ` (in the element #${m.panel})` : ''}` : '', m.spokenBy ? `spoken aloud (voice: ${m.spokenBy})` : '', m.asLabel ? 'a screen-reader label or tooltip' : ''].filter(Boolean).join(', ');

// ---- dry run (TEXT_STUB=1): stand-ins for OpenAI's answers, to prove the chain end to end. They are not wording: an
// intent is "[dry run]"; a written message is "[dry run]" first (it fails the checks, which tests the send-back), then
// the line's current text (it passes, which tests the rest); the judge makes up a mismatch for every third message in
// round 1 (which tests the rewrite with the child's misunderstanding). Nothing from a dry run is cached.
const D = '[dry run]';
function stubIntent(ms, st) {
  return { screen: D, flow_issues: st.n % 5 === 0 ? [`${D} a made-up flow issue, to test the page`] : [], messages: ms.map((m, k) => ({ id: m.id, trigger: D, where: D, who: m.spokenBy === 'helper' ? 'Florence' : 'interface', spoken: !!m.spokenBy, child_just_did: D, screen_shows: D,
    purpose: D, understand: D, do_next: D, risk: D, needed: k % 9 === 8 ? 'drop' : k % 7 === 6 ? 'merge' : 'keep', merge_with: k % 7 === 6 ? ms[0].id : '', facts: [] })) };
}
function stubText(ms, item) { const m = ms.find((x) => x.id === item.id); return item.problems_with_it || item.a_child_read_it_as ? m.row.text : D; }

let stopped = null; // set when OpenAI refuses a request (the cache keeps everything done so far)

// ---- 1. intent, screen by screen -----------------------------------------------------------------------------------
const STR = { type: 'string' };
const INTENT_SCHEMA = { name: 'intents', schema: { type: 'object', additionalProperties: false, required: ['screen', 'flow_issues', 'messages'], properties: {
  screen: { type: 'string', description: 'What this screen shows and what the child is in the middle of, in your words' },
  flow_issues: { type: 'array', items: STR, description: 'Anything about the flow or the screen itself (not the wording) that would confuse a child here. Empty if none.' },
  messages: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'trigger', 'where', 'who', 'spoken', 'child_just_did', 'screen_shows', 'purpose', 'understand', 'do_next', 'risk', 'needed', 'merge_with', 'facts'], properties: {
    id: STR, trigger: { type: 'string', description: 'When exactly this message appears, read from the code' }, where: { type: 'string', description: 'Screen and element: next-step bar, Florence tip, card, button, label, alert…' },
    who: { type: 'string', enum: ['narrator', 'Florence', 'interface'] }, spoken: { type: 'boolean' }, child_just_did: STR, screen_shows: STR,
    purpose: { type: 'string', description: 'Why the game says anything here' }, understand: { type: 'string', description: 'What the child must understand' },
    do_next: { type: 'string', description: 'The one thing the child must do next, with the exact button or place; or "nothing: it only informs" if so' },
    risk: { type: 'string', description: 'What would confuse the child' }, needed: { type: 'string', enum: ['keep', 'merge', 'drop'] }, merge_with: { type: 'string', description: 'The id it should merge with, or empty' },
    facts: { type: 'array', items: STR, description: 'Facts the message must keep, as short items (a number, a name, an exact button name, a rule in a few words), never whole sentences of the current wording. From the current wording and the code.' } } } } } } };

async function intents() {
  const out = new Map(); const flow = []; const journey = [];
  for (const st of steps) {
    const ms = moments.filter((m) => m.step === st.n);
    const prev = steps[st.n - 2];
    if (!ms.length) { journey.push(`${st.file}: ${st.note} (no new message)`); continue; }
    const items = ms.map((m) => ({ id: m.id, age: AGE[m.row.version], seen_as: seenAs(m), also_on_later_screens: m.also.map((n) => steps[n - 1].file), placeholders: placeholders(m),
      current_wording_facts_only: m.row.text, defined_in: `${rel(m.definition.file)} line ${m.definition.line} (${m.definition.keypath})`, definition_code: m.definition.code, shown_by_code: m.usedAt.map((u) => ({ at: `${rel(u.file)} line ${u.line}`, code: u.code })), ...(m.twinCode.length ? { same_words_also_defined_at: m.twinCode } : {}), ...(m.forced ? { note: 'not found in the screen text at capture time; the capture triggered it at this moment (it may be a short caption)' } : {}) }));
    const content = [
      { type: 'text', text: `TASK: understand one moment of the child’s journey and the messages in it.\n\nThe journey so far (screens in order):\n${journey.join('\n') || '(this is the first screen)'}\n\nNow: screenshot ${st.file} (${st.note}). ${prev ? `The screenshot before it, ${prev.file}, shows the previous moment.` : ''}` },
      ...(prev ? [img(prev.file)] : []), img(st.file),
      ...(() => { const later = [...new Set(ms.flatMap((m) => m.also))].filter((n) => n > st.n).slice(-2); return later.length ? [{ type: 'text', text: `Some of these messages show again later in the journey. Their later screens, so one wording can serve every moment: ${later.map((n) => steps[n - 1].file + ' (' + steps[n - 1].note + ')').join(', ')}` }, ...later.map((n) => img(steps[n - 1].file))] : []; })(),
      { type: 'text', text: `Messages that first appear at this moment (an 8–12 child is playing):\n${JSON.stringify(items, null, 1)}\n\nFor each message, read its code and the screenshots, and work out its moment and intent in your own words. Then list any flow issues on this screen.` },
    ];
    let r;
    try { r = await chat(`pilot-intent:${st.file}`, [{ role: 'system', content: SYSTEM }, { role: 'user', content }], INTENT_SCHEMA, { effort: 'medium', estOut: 150 + 425 * ms.length, stub: () => stubIntent(ms, st) }); }
    catch (e) { stopped = `${st.file}: ${e.message}`; console.log(`STOPPED at ${stopped}`); break; } // e.g. no API credit: keep what is done (cached; a re-run continues)
    for (const x of r.messages) out.set(x.id, x);
    for (const f of r.flow_issues) flow.push({ step: st.file, issue: f });
    journey.push(`${st.file}: ${r.screen.replace(/\s+/g, ' ').slice(0, 300)} | messages: ${r.messages.map((x) => `${x.id} (${x.purpose.replace(/\s+/g, ' ').slice(0, 120)})`).join('; ')}`);
    console.log(`intent ${st.file}: ${r.messages.length} messages, ${r.flow_issues.length} flow issues`);
  }
  return { intent: out, flow };
}

// ---- 2. write from the intent (the old wording is never sent) -----------------------------------------------------
const WRITE_SCHEMA = { name: 'messages', schema: { type: 'object', additionalProperties: false, required: ['messages'], properties: { messages: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'text'], properties: { id: STR, text: STR } } } } } };
const brief = (m, it) => ({ id: m.id, age: AGE[m.row.version], kind: kindOf(m), max_characters: limitOf(m), seen_as: seenAs(m), who_says_it: it.who, spoken: it.spoken, trigger: it.trigger, where: it.where, child_just_did: it.child_just_did, screen_shows: it.screen_shows,
  purpose: it.purpose, understand: it.understand, do_next: it.do_next, risk: it.risk, ...(it.needed === 'merge' ? { note: `you said it could merge with ${it.merge_with}; for now it stays a separate message` } : {}), facts: it.facts, placeholders: placeholders(m),
  must_also: [kindOf(m) === 'a short label or button' ? 'it is a short label or button: no full stop' : null, /^[a-z]/.test(m.row.text) ? 'the game joins it into a longer sentence: start with a lower-case letter' : null].filter(Boolean) });
async function write(ms, intent, feedback, label) {
  const items = ms.map((m) => ({ ...brief(m, intent.get(m.id)), ...(feedback.get(m.id) || {}) }));
  const r = await chat(label, [{ role: 'system', content: SYSTEM }, { role: 'user', content: `TASK: write these messages for the game, each from its intent. You have not been given the old wording on purpose: write what this child needs at this moment, not a version of an old line. Say it in the fewest clear words. Every placeholder listed must appear exactly once as given (more than once only if needed). Stay within max_characters (not counting placeholders).\n\n${JSON.stringify(items, null, 1)}` }], WRITE_SCHEMA, { effort: 'medium', estOut: 520 + 60 * ms.length, stub: () => ({ messages: items.map((i) => ({ id: i.id, text: stubText(ms, i) })) }) });
  return new Map(r.messages.map((x) => [x.id, x.text]));
}

// ---- 3. the child test (a separate call: a child persona, no brief) -------------------------------------------------
const CHILD_SYSTEM = 'You are a child taking part in a games day at a holiday club. You are playing a computer game you have never seen before. Answer as yourself, honestly, in your own simple words. If something is confusing, say so. Do not guess what the grown-ups who made the game meant; say what you would actually think and do.';
const CHILD_SCHEMA = { name: 'child', schema: { type: 'object', additionalProperties: false, required: ['telling_me', 'i_will'], properties: { telling_me: { type: 'string', description: 'What is this message telling you?' }, i_will: { type: 'string', description: 'What will you do next? Exactly what will you tap, click or look at?' } } } };
async function childTest(m, it, text, label) {
  const age = m.row.version === 'j' || m.row.version === 'b' ? 9 : 14;
  const where = it.spoken && !m.onScreen ? 'You hear this said out loud' : `On the screen (${it.where}) it now says`;
  const r = await chat(label, [{ role: 'system', content: CHILD_SYSTEM }, { role: 'user', content: [
    { type: 'text', text: `You are ${age}. You have just: ${it.child_just_did}\n\nThis is your screen. (The words of the message below have just changed; if the picture shows different words in that spot, ignore them and read the new ones.)` }, img(steps[m.step - 1].file),
    { type: 'text', text: `${where}:\n“${text.replace(/\{[^{}]+\}/g, (t) => (/\d|n\b|count/.test(t) ? '3' : '…'))}”${it.spoken && m.onScreen ? '\n(A voice also reads it out.)' : ''}\n\nWhat is this telling you? What will you do next?` }] }], CHILD_SCHEMA, { effort: 'low', estOut: 220, stub: () => ({ telling_me: '[dry run: no child answer]', i_will: '[dry run]' }) });
  return r;
}
const JUDGE_SCHEMA = { name: 'judge', schema: { type: 'object', additionalProperties: false, required: ['results'], properties: { results: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'match', 'misunderstood'], properties: { id: STR, match: { type: 'boolean' }, misunderstood: { type: 'string', description: 'What the child got wrong or missed; empty when it matches' } } } } } } };
async function judge(list, intent, label) {
  const items = list.map(({ m, text, child }) => ({ id: m.id, message: text, intent_understand: intent.get(m.id).understand, intent_do_next: intent.get(m.id).do_next, child_says_it_tells_me: child.telling_me, child_says_i_will: child.i_will }));
  const r = await chat(label, [{ role: 'system', content: SYSTEM }, { role: 'user', content: `TASK: a child (a separate test, given only the screen and the new message) said what each message tells them and what they will do next. Compare that with the intent. It matches when the child understood the point and would do the intended next thing (or rightly does nothing, for a message that only informs). Be strict about the next action and the button or place; be relaxed about the child’s own wording.\n\n${JSON.stringify(items, null, 1)}` }], JUDGE_SCHEMA, { effort: 'low', estOut: 120 + 60 * list.length, stub: () => ({ results: list.map((x, k) => ({ id: x.m.id, match: !(/:r1$/.test(label) && k % 3 === 0), misunderstood: /:r1$/.test(label) && k % 3 === 0 ? '[dry run: a made-up mismatch, to test the rewrite loop]' : '' })) }) });
  return new Map(r.results.map((x) => [x.id, x]));
}

// ---- run ---------------------------------------------------------------------------------------------------------
const { intent, flow } = await intents();
const results = new Map();
const todo = moments.filter((m) => intent.has(m.id) && intent.get(m.id).needed !== 'drop');
const byStep = [...new Set(todo.map((m) => m.step))].map((n) => todo.filter((m) => m.step === n));
await pool(stopped ? [] : byStep, 4, async (ms) => { try { await writeStep(ms); } catch (e) { stopped ||= `${steps[ms[0].step - 1].file}: ${e.message}`; console.log(`STOPPED writing ${stopped}`); } });
async function writeStep(ms) {
  const fb = new Map(); const st = steps[ms[0].step - 1].file;
  for (let round = 1; round <= 3; round++) {
    const pending = ms.filter((m) => !results.get(m.id)?.done);
    if (!pending.length) break;
    // write, then the automatic checks (sent back up to 3 times)
    let texts = await write(pending, intent, fb, `pilot-write:${st}:r${round}`);
    for (let k = 1; k <= 3; k++) {
      const bad = pending.filter((m) => checkLine(m.row, texts.get(m.id) ?? '', fs.readFileSync(path.join(ROOT, m.row.file), 'utf8')).length);
      if (!bad.length) break;
      for (const m of bad) fb.set(m.id, { ...(fb.get(m.id) || {}), your_last_version: texts.get(m.id) ?? '', problems_with_it: checkLine(m.row, texts.get(m.id) ?? '', fs.readFileSync(path.join(ROOT, m.row.file), 'utf8')) });
      const again = await write(bad, intent, fb, `pilot-write:${st}:r${round}:fix${k}`); for (const [id, t] of again) texts.set(id, t);
    }
    // the child test and the comparison
    const tested = await Promise.all(pending.map(async (m) => { const text = texts.get(m.id) ?? ''; const problems = checkLine(m.row, text, fs.readFileSync(path.join(ROOT, m.row.file), 'utf8')); const child = await childTest(m, intent.get(m.id), text, `pilot-child:${m.id}:r${round}`); return { m, text, problems, child }; }));
    const verdict = await judge(tested, intent, `pilot-judge:${st}:r${round}`);
    for (const t of tested) {
      const v = verdict.get(t.m.id) || { match: false, misunderstood: 'no verdict' };
      const prev = results.get(t.m.id); const history = [...(prev?.history || []), { text: t.text, child: t.child, match: v.match, misunderstood: v.misunderstood }];
      results.set(t.m.id, { text: t.text, problems: t.problems, child: t.child, match: v.match, misunderstood: v.misunderstood, rounds: round, history, done: v.match && !t.problems.length });
      if (!v.match) fb.set(t.m.id, { your_last_version: t.text, a_child_read_it_as: `${t.child.telling_me} / next: ${t.child.i_will}`, what_they_misunderstood: v.misunderstood });
    }
  }
  console.log(`written and tested: ${st}`);
}

// ---- the intent sheet and the review page --------------------------------------------------------------------------
const COLS = ['ID', 'Step', 'Screenshot', 'Area', 'Version', 'File', 'Line', 'Where in code', 'When it appears', 'Where', 'Who', 'Spoken', 'Child has just', 'Screen shows', 'Purpose', 'Understand', 'Do next', 'Risk', 'Needed', 'Merge with', 'Facts', 'Old text (facts only)', 'New text', 'Checks', 'Child test: telling me', 'Child test: I will', 'Child test matches intent', 'Misunderstood', 'Rounds', 'Same wording also at'];
const rows = moments.filter((m) => intent.has(m.id)).map((m) => { const it = intent.get(m.id); const r = results.get(m.id);
  return [m.id, m.step, steps[m.step - 1].file, m.row.area, VERSION_LABEL[m.row.version], m.row.file, m.row.line, m.row.keypath, it.trigger, it.where, it.who, it.spoken ? 'yes' : 'no', it.child_just_did, it.screen_shows, it.purpose, it.understand, it.do_next, it.risk, it.needed, it.merge_with, it.facts.join(' · '), m.row.text,
    r?.text ?? '', r ? (r.problems.length ? `FAILED: ${r.problems.join('; ')}` : 'pass') : it.needed === 'drop' ? 'not written: OpenAI says drop it' : '', r?.child.telling_me ?? '', r?.child.i_will ?? '', r ? (r.match ? 'yes' : 'no') : '', r?.misunderstood ?? '', r?.rounds ?? '', m.twins.join(' ')]; });
fs.mkdirSync(path.dirname(path.resolve(ROOT, outCsv)), { recursive: true }); fs.mkdirSync(path.dirname(path.resolve(reviewHtml)), { recursive: true });
fs.writeFileSync(path.resolve(ROOT, outCsv), [csvLine(COLS), ...rows.map(csvLine)].join('\n') + '\n');
fs.writeFileSync(path.join(capDir, 'pilot-results.json'), JSON.stringify({ intent: Object.fromEntries(intent), results: Object.fromEntries(results), flow, unmatched }, null, 1));

const h = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sections = steps.map((st) => {
  const ms = moments.filter((m) => m.step === st.n && intent.has(m.id)); const issues = flow.filter((f) => f.step === st.file);
  const again = moments.filter((m) => m.also.includes(st.n) && intent.has(m.id));
  if (!ms.length && !issues.length && !again.length) return '';
  return `<section class="step"><h2><span>${st.n}</span> ${h(st.note || st.name)} <small>${h(st.file)}</small></h2>
  <div class="grid"><figure><img loading="lazy" alt="Screenshot ${h(st.file)}" src="${dataUrl(st.file)}"></figure><div class="msgs">
  ${issues.length ? `<div class="flow"><b>Flow issues OpenAI flagged here</b><ul>${issues.map((f) => `<li>${h(f.issue)}</li>`).join('')}</ul></div>` : ''}
  ${ms.map((m) => { const it = intent.get(m.id); const r = results.get(m.id); return `<article class="${r ? (r.match && !r.problems.length ? 'ok' : 'bad') : 'drop'}">
    <header><code>${h(m.id)}</code> <span class="tag">${h(it.who)}${it.spoken ? ' · spoken' : ''}</span> <span class="tag">${h(VERSION_LABEL[m.row.version])}</span> <span class="tag need-${h(it.needed)}">${h(it.needed)}${it.merge_with ? ` → ${h(it.merge_with)}` : ''}</span></header>
    <dl><dt>When</dt><dd>${h(it.trigger)}</dd><dt>Where</dt><dd>${h(it.where)}</dd><dt>Child has just</dt><dd>${h(it.child_just_did)}</dd><dt>Purpose</dt><dd>${h(it.purpose)}</dd><dt>Understand</dt><dd>${h(it.understand)}</dd><dt>Do next</dt><dd>${h(it.do_next)}</dd><dt>Risk</dt><dd>${h(it.risk)}</dd><dt>Facts</dt><dd>${h(it.facts.join(' · '))}</dd></dl>
    <div class="txt"><div><b>Old</b><p class="old">${h(m.row.text)}</p></div><div><b>New</b><p class="new">${r ? h(r.text) : '<i>not written: OpenAI says drop it</i>'}</p></div></div>
    ${r ? `<div class="child"><b>Child test (age 9)${r.rounds > 1 ? `, after ${r.rounds} rounds` : ''}:</b> “${h(r.child.telling_me)}” <b>I will:</b> “${h(r.child.i_will)}” <span class="verdict">${r.match ? '✓ matches the intent' : `✗ ${h(r.misunderstood)}`}</span>${r.problems.length ? `<div class="fail">Checks: ${h(r.problems.join('; '))}</div>` : ''}
      ${r.history.length > 1 ? `<details><summary>Earlier rounds</summary>${r.history.slice(0, -1).map((x) => `<p><b>${h(x.text)}</b><br>Child: “${h(x.child.telling_me)}” / “${h(x.child.i_will)}”<br>✗ ${h(x.misunderstood)}</p>`).join('')}</details>` : ''}</div>` : ''}
  </article>`; }).join('')}
  ${again.length ? `<div class="again"><b>Shown again here</b> (first met earlier; one wording serves both moments)<ul>${again.map((m) => `<li><code>${h(m.id)}</code> ${h(results.get(m.id)?.text ?? m.row.text)} <small>(first at step ${m.step})</small></li>`).join('')}</ul></div>` : ''}</div></div></section>`;
}).join('');
const nOk = [...results.values()].filter((r) => r.match && !r.problems.length).length;
fs.writeFileSync(reviewHtml, `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pilot message review</title><style>
:root{--bg:#f6f1e7;--card:#fffdf8;--ink:#2b2118;--mut:#6b5b4b;--ok:#2f7d4a;--bad:#b3412e;--line:#e2d6c3}
@media (prefers-color-scheme:dark){:root{--bg:#1d1915;--card:#272220;--ink:#efe6d8;--mut:#b4a593;--ok:#7cc492;--bad:#ef8a76;--line:#3a332c}}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 system-ui,sans-serif}main{max-width:1500px;margin:0 auto;padding:16px}
h1{font-size:1.5rem;margin:.2em 0}.sum{color:var(--mut)}.step{margin:28px 0;border-top:2px solid var(--line);padding-top:12px}
.step h2{font-size:1.1rem}.step h2 span{display:inline-block;min-width:1.8em;text-align:center;background:var(--ink);color:var(--bg);border-radius:6px;margin-right:6px}.step h2 small{color:var(--mut);font-weight:400}
.grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:16px;align-items:start}figure{margin:0;position:sticky;top:8px}figure img{width:100%;border-radius:8px;border:1px solid var(--line)}
article{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--line);border-radius:8px;padding:10px 12px;margin-bottom:12px}article.ok{border-left-color:var(--ok)}article.bad{border-left-color:var(--bad)}
.tag{font-size:.8rem;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:0 7px;margin-left:4px}.need-drop,.need-merge{color:var(--bad)}
dl{display:grid;grid-template-columns:8.5em 1fr;gap:2px 10px;margin:8px 0;font-size:.9rem}dt{color:var(--mut)}dd{margin:0}
.txt{display:grid;grid-template-columns:1fr 1fr;gap:10px}.txt p{margin:.2em 0;padding:6px 8px;border-radius:6px;background:var(--bg)}.old{color:var(--mut)}.new{font-weight:600}
.child{margin-top:8px;font-size:.92rem}.verdict{display:block;margin-top:4px;font-weight:600}article.ok .verdict{color:var(--ok)}article.bad .verdict,.fail{color:var(--bad)}
.again{font-size:.9rem;color:var(--mut)}.again li{margin:2px 0}.flow{background:var(--card);border:2px dashed var(--bad);border-radius:8px;padding:8px 12px;margin-bottom:12px}
@media (max-width:900px){.grid,.txt{grid-template-columns:1fr}figure{position:static}dl{grid-template-columns:1fr}}
</style></head><body><main><h1>Pilot: the first 15 minutes of Eco Town, ages 8–12</h1>
<p class="sum">Every message the child meets, in order: OpenAI’s intent, the old message, the new message written from the intent, and a separate OpenAI “child” (age 9) saying what it understood and what it would do next. ${results.size} messages written, ${nOk} matched the intent; ${[...intent.values()].filter((x) => x.needed === 'drop').length} OpenAI would drop; ${flow.length} flow issues flagged. Nothing has been applied to the game. Screenshots show the old floating-islands layout and the old wording.</p>
${STUB ? `<p class="flow"><b>DRY RUN: no OpenAI call was made.</b> Intents and child answers marked “[dry run]” are stand-ins, and each “new” message is the line’s current text standing in for OpenAI’s, to test the pipeline end to end. Real intents shown here came from the cache of earlier calls.</p>` : ''}
${stopped ? `<p class="flow"><b>This run stopped early.</b> OpenAI refused a request (${h(stopped)}). Steps after that have no intent or new message yet; re-running the same command continues from the cache.</p>` : ''}
${sections}</main></body></html>`);
console.log(`messages: ${moments.length}; intents: ${intent.size}; written: ${results.size}; matched: ${nOk}; drop: ${[...intent.values()].filter((x) => x.needed === 'drop').length}; flow issues: ${flow.length}`);
console.log('this run (real calls):', usage, '\nall runs:', tokenTotals());
if (STUB) {
  const t = { prompt: estimate.prompt, cachedPrompt: estimate.cachedPrompt, completion: estimate.completion };
  console.log(`DRY RUN: ${usage.cached} requests answered from the cache (free); ${estimate.calls} stubbed. Estimated cost of the stubbed calls at $${PRICE.in}/$${PRICE.cached}/$${PRICE.out} per million (in/cached/out): $${dollars(t).toFixed(2)}`);
  for (const [k, e] of Object.entries(estimate.byKind)) console.log(`  ${k}: ${e.calls} calls, ~${e.prompt} prompt (${e.cachedPrompt} cached), ~${e.completion} out: $${dollars(e).toFixed(2)}`);
  fs.writeFileSync(path.join(capDir, 'dry-run-estimate.json'), JSON.stringify({ price: PRICE, cacheHits: usage.cached, ...estimate, dollars: dollars(t) }, null, 1));
}
console.log(`wrote ${outCsv} and ${reviewHtml}${stopped ? ` (STOPPED EARLY: ${stopped})` : ''}`);
