// Steps 3–4: OpenAI rewrites the lines; every line is checked; failures go back to OpenAI with the reason (up to 3 times).
// Every final sentence comes from the OpenAI API. Nothing here writes or rewords a line.
// Usage:
//   node tools/text/rewrite.mjs --trial [--n 20] [--out docs/text/trial.csv]   a sample across areas and ages
//   node tools/text/rewrite.mjs --all [--out docs/text/openai-rewrite.csv]      everything in scope (not run yet)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SHEET_OWNER, readSheet, csvLine, COLS, VERSION_LABEL, toSource, validInJs, tokensOf, rel } from './lib.mjs';
import { extractAll } from './extract.mjs';
import { chat, pool, usage, tokenTotals } from './openai.mjs';

const AGES = { j: '8–12', s: '13–17', b: 'both' };
const BATCH = 30;

// ---- the prompt --------------------------------------------------------------------------------------------------
export function systemPrompt(rows) {
  const brief = fs.readFileSync(path.join(ROOT, 'tools/text/game-brief.md'), 'utf8').replace(/^<!--[\s\S]*?-->\s*/, '');
  const earlier = readSheet(SHEET_OWNER).filter((r) => r['New text'].trim());
  const examples = earlier.map((r) => `- (${r.Version.replace('Ages ', '').replace('Both or not marked', 'both')}) ${r['Current text']}\n  → ${r['New text']}`).join('\n');
  const names = [...new Set(rows.filter((r) => /button name|build name/.test(r.why)).map((r) => r.text))];
  return fs.readFileSync(path.join(ROOT, 'tools/text/prompt.md'), 'utf8').replace(/^<!--[\s\S]*?-->\s*/, '')
    .replace('{{GAME_BRIEF}}', brief.trim()).replace('{{FIXED_NAMES}}', names.map((n) => `“${n}”`).join(', ')).replace('{{EXAMPLES}}', examples);
}
const SCHEMA = { name: 'rewrites', schema: { type: 'object', additionalProperties: false, required: ['lines'], properties: { lines: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'text', 'meaning_changed', 'note'], properties: { id: { type: 'string' }, text: { type: 'string' }, meaning_changed: { type: 'boolean' }, note: { type: 'string' } } } } } } };

// ---- checks ------------------------------------------------------------------------------------------------------
const EMOJI = /\p{Extended_Pictographic}|[✓✗★☆→←↑↓·]/gu;
const BANNED_J = /\b(money|coins?|budget|cash|prices?|priced|costs?|costly|cheap(er|est)?|expensive|pounds?|pence|kWh?|MWh?|GW|watts?|per ?cent|percent(age)?s?)\b|[£$€]|%/gi;
const US = /\b(colou?r)\b|\b(color|colors|center|centers|centered|favorite|favorites|behavior|behaviors|neighbor|neighbors|gray|meter|meters|liter|liters|aluminum|mom|vacation|traveling|traveled|realize[ds]?|organize[ds]?|recognize[ds]?|apologize[ds]?|analyze[ds]?|defense|catalog|program(?!me)s?\b(?= (of|for the day)))\b/g;
const sortJ = (a) => JSON.stringify([...a].sort());
const lettersOnly = (t) => t.replace(/\{[^{}]*\}/g, '').replace(/<\/?[a-z]+(#\d+)?>/g, '');
const numbersIn = (t) => (lettersOnly(t).match(/\d+(?:[.,]\d+)?/g) || []);
const isLabel = (t) => { const l = lettersOnly(t).trim(); return (l.length <= 32 && !/[.!?]$/.test(l)) || l.split(/\s+/).length <= 3; };
export function checkLine(row, text, fileSrc) {
  const p = []; const o = row.text; const t = String(text ?? '');
  if (!t.trim()) return ['the line is empty'];
  if (t !== t.trim()) p.push('it starts or ends with a space');
  if (sortJ(tokensOf(o)) !== sortJ(tokensOf(t))) p.push(`the placeholders and tags must be exactly ${JSON.stringify(tokensOf(o))}, each the same number of times; you gave ${JSON.stringify(tokensOf(t))}`);
  if (sortJ(o.match(EMOJI) || []) !== sortJ(t.match(EMOJI) || [])) p.push(`keep the emoji and symbols exactly: ${JSON.stringify(o.match(EMOJI) || [])}`);
  for (const n of row.fixedNames || []) if (o.includes(n) && !t.includes(n)) p.push(`keep the button name “${n}” word for word`);
  const kids = row.version === 'j' || (row.version === 'b' && !/Leader page/.test(row.area));
  if (kids) { const pctAfterPh = /\}%/.test(o); const bad = [...new Set((lettersOnly(t).match(BANNED_J) || []).filter((w) => !(w === '%' && pctAfterPh)))]; if (bad.length) p.push(`ages 8–12 can read this line: do not use ${bad.map((w) => `“${w}”`).join(', ')} (no money, units of power or percentages; say it another way)`); }
  const lo = lettersOnly(o).length, ln = lettersOnly(t).length;
  const max = isLabel(o) ? Math.max(lo + 8, Math.round(lo * 1.35)) : Math.round(lo * 1.6) + 15;
  if (ln > max) p.push(`too long: ${ln} characters; keep it within ${max} (it is ${lo} now${isLabel(o) ? ', and it is a short label or button' : ''})`);
  const straight = (s) => (lettersOnly(s).match(/['"]/g) || []).length;
  if (straight(t) > straight(o)) p.push('use the curly apostrophe ’ and curly quotes “ ” instead of straight \' or "');
  const keepNums = row.version !== 'j' ? numbersIn(o) : numbersIn(o.replace(/\d+(?:[.,]\d+)?\s*(%|kWh?|MWh?|per ?cent)/gi, ''));
  const missing = keepNums.filter((n) => !numbersIn(t).includes(n)); if (missing.length) p.push(`keep the numbers ${missing.join(', ')} (as digits)`);
  if (/^[a-z]/.test(lettersOnly(o).trim()) && !/^[a-z]/.test(lettersOnly(t).trim())) p.push('this is a fragment the game joins into a sentence: start it with a lower-case letter, as now');
  const endO = (lettersOnly(o).trim().match(/[.!?:…]$/) || [''])[0], endT = (lettersOnly(t).trim().match(/[.!?:…]$/) || [''])[0];
  if (!endO && endT && (isLabel(o) || /^[a-z]/.test(lettersOnly(o).trim()))) p.push('do not add a full stop or other end punctuation: it is a label or a fragment');
  if (endO && !endT && !/[)”"’\]}>]$/.test(t)) p.push(`end the line with punctuation, as now (“${endO}”)`);
  if ((o.match(/\n/g) || []).length !== (t.match(/\n/g) || []).length) p.push('keep the same number of line breaks');
  const us = [...new Set((lettersOnly(t).match(US) || []).filter((w) => !lettersOnly(o).includes(w) && w.toLowerCase() !== 'colour'))]; if (us.length) p.push(`use British spelling instead of ${us.join(', ')}`);
  try { toSource(row.seg, t); validInJs(row.seg, fileSrc, t); } catch (e) { p.push(`the line cannot go back into the code: ${e.message}`); }
  return p;
}

// ---- one request -------------------------------------------------------------------------------------------------
const neighbours = (row, all, n = 2) => { const same = all.filter((r) => r.file === row.file); const i = same.indexOf(row); return { before: same.slice(Math.max(0, i - n), i).map((r) => r.text), after: same.slice(i + 1, i + 1 + n).map((r) => r.text) }; };
function itemFor(row, all) { return { id: row.id, ages: AGES[row.version], where: `${rel(row.file)} · ${row.keypath}`, kind: isLabel(row.text) ? 'short label, button or fragment' : 'line', text: row.text, ...neighbours(row, all) }; }

async function rewriteBatch(sys, area, summary, rows, all, label) {
  const user = `Area: ${area}\n\nWhat this area is for (from your brief):\n${summary}\n\nRewrite each line below. "before" and "after" are the lines next to it in the same file, for context only: do not rewrite them.\n\n${JSON.stringify(rows.map((r) => itemFor(r, all)), null, 1)}`;
  const r = await chat(label, [{ role: 'system', content: sys }, { role: 'user', content: user }], SCHEMA, { effort: 'medium' });
  return new Map(r.lines.map((l) => [l.id, l]));
}
async function retryBatch(sys, area, summary, fails, all, label) {
  const user = `Area: ${area}\n\nWhat this area is for (from your brief):\n${summary}\n\nYour rewrites of these lines did not pass the game's automatic checks. For each, the original line, your last version and the problems are given. Write a new version that fixes every problem while following all the rules.\n\n${JSON.stringify(fails.map(({ row, last, problems }) => ({ ...itemFor(row, all), your_last_version: last, problems })), null, 1)}`;
  const r = await chat(label, [{ role: 'system', content: sys }, { role: 'user', content: user }], SCHEMA, { effort: 'medium' });
  return new Map(r.lines.map((l) => [l.id, l]));
}

// rows -> results [{ row, text, problems, tries, meaning_changed, note }]
export async function rewriteRows(rows, all, { tag = 'run' } = {}) {
  const sys = systemPrompt(all);
  const summaries = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/text/area-summaries.json'), 'utf8'));
  const srcs = new Map(); const srcOf = (f) => { if (!srcs.has(f)) srcs.set(f, fs.readFileSync(path.join(ROOT, f), 'utf8')); return srcs.get(f); };
  const fixed = [...new Set(all.filter((r) => /button name|build name/.test(r.why)).map((r) => r.text))];
  for (const r of rows) r.fixedNames = fixed;
  // batches: by area, in file order, about 30 lines each
  const byArea = new Map(); for (const r of rows) { if (!byArea.has(r.area)) byArea.set(r.area, []); byArea.get(r.area).push(r); }
  const batches = []; for (const [area, rs] of byArea) for (let i = 0; i < rs.length; i += BATCH) batches.push({ area, rows: rs.slice(i, i + BATCH) });
  const results = new Map();
  await pool(batches, 6, async (b, bi) => {
    const got = await rewriteBatch(sys, b.area, summaries[b.area] || '', b.rows, all, `${tag}:${b.area}:${bi}`);
    for (const row of b.rows) { const l = got.get(row.id); const text = l?.text ?? ''; results.set(row.id, { row, text, tries: 1, meaning_changed: !!l?.meaning_changed, note: l?.note || '', problems: l ? checkLine(row, text, srcOf(row.file)) : ['OpenAI returned no line for this id'] }); }
    for (let attempt = 2; attempt <= 4; attempt++) { // the first try plus up to 3 send-backs
      const fails = b.rows.map((row) => results.get(row.id)).filter((x) => x.problems.length).map((x) => ({ row: x.row, last: x.text, problems: x.problems }));
      if (!fails.length) break;
      const again = await retryBatch(sys, b.area, summaries[b.area] || '', fails, all, `${tag}:${b.area}:${bi}:retry${attempt - 1}`);
      for (const f of fails) { const l = again.get(f.row.id); if (!l) continue; const x = results.get(f.row.id); x.text = l.text; x.tries = attempt; x.meaning_changed = !!l.meaning_changed; x.note = l.note || ''; x.problems = checkLine(f.row, l.text, srcOf(f.row.file)); }
    }
  });
  return rows.map((r) => results.get(r.id));
}

export function sheetRows(results) {
  return results.map(({ row, text, problems, meaning_changed, note, tries }) => [row.id, row.area, VERSION_LABEL[row.version], row.file, row.line, row.keypath, row.text, problems.length ? '' : text,
    [row.status === 'held' ? 'apply after two-towns merge' : '', problems.length ? `FAILED checks after ${tries} tries: ${problems.join('; ')} | last version: ${text}` : '', meaning_changed ? `OpenAI says the meaning may have changed: ${note}` : note ? `OpenAI: ${note}` : '', text === row.text && !problems.length ? 'unchanged by OpenAI' : ''].filter(Boolean).join(' · ')]);
}

// ---- trial sample: lines across areas and ages, chosen by a fixed rule (no hand picking) ---------------------------
function trialSample(all, n) {
  const pool2 = all.filter((r) => r.status !== 'keep');
  let seed = 20261117; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const cells = []; const areas = [...new Set(pool2.map((r) => r.area))];
  for (const a of areas) for (const v of ['j', 's', 'b']) { const c = pool2.filter((r) => r.area === a && r.version === v); if (c.length) cells.push(c); }
  const out = []; let i = 0;
  while (out.length < n && cells.length) { const c = cells[i % cells.length]; const pick = c[Math.floor(rnd() * c.length)]; if (!out.includes(pick)) out.push(pick); i++; if (i > n * 10) break; }
  return out;
}

async function main() {
  const args = process.argv.slice(2); const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
  const all = extractAll();
  let rows, out;
  if (args.includes('--trial')) { rows = trialSample(all, +opt('--n', 20)); out = opt('--out', 'docs/text/trial.csv'); }
  else if (args.includes('--all')) { rows = all.filter((r) => r.status !== 'keep'); out = opt('--out', 'docs/text/openai-rewrite.csv'); }
  else { console.log('usage: --trial [--n 20] | --all'); return; }
  const results = await rewriteRows(rows, all, { tag: args.includes('--trial') ? 'trial' : 'all' });
  fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), [csvLine(COLS), ...sheetRows(results).map(csvLine)].join('\n') + '\n');
  const failed = results.filter((x) => x.problems.length);
  console.log(`lines: ${results.length}; changed: ${results.filter((x) => !x.problems.length && x.text !== x.row.text).length}; unchanged: ${results.filter((x) => !x.problems.length && x.text === x.row.text).length}; failed: ${failed.length}; sent back at least once: ${results.filter((x) => x.tries > 1).length}`);
  for (const f of failed) console.log('FAILED', f.row.id, f.problems.join(' | '));
  console.log('this run:', usage, '\nall runs:', tokenTotals());
  console.log(`wrote ${out}`);
}
if (import.meta.url === `file://${process.argv[1]}`) await main();
