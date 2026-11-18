// Put OpenAI's returned wording into the game. Usage:
//   node tools/text/apply.mjs <returned.csv> [--write] [--only ID,ID] [--skip ID,ID]
// Reads columns "ID", "Current text (facts only)" and "New text". Only rows whose new text differs are considered.
// Each row is matched to its line in the code by ID (and must still read as the current text), checked by checkLine,
// and, with --write, written back. Without --write it only reports.
import fs from 'node:fs'; import path from 'node:path';
import { ROOT, parseCsv, toSource, validInJs } from './lib.mjs';
import { extractAll } from './extract.mjs';
import { checkLine } from './rewrite.mjs';
const args = process.argv.slice(2); const csvFile = args[0]; const write = args.includes('--write');
const list = (f) => (args.includes(f) ? args[args.indexOf(f) + 1].split(',') : null);
const only = list('--only'); const skip = new Set(list('--skip') || []); const force = new Set(list('--force') || []); // --force: write even though the house checks complain (owner-approved)
const [head, ...raw] = parseCsv(fs.readFileSync(csvFile, 'utf8').replace(/^﻿/, ''));
const rows = raw.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
const all = extractAll(); const byId = new Map(all.map((r) => [r.id, r]));
const fixed = [...new Set(all.filter((r) => /button name|build name/.test(r.why)).map((r) => r.text))];
const out = { applied: [], held: [], missing: [] }; const edits = {};
for (const r of rows) {
  const id = r.ID, now = r['Current text (facts only)'], neu = r['New text'];
  if (!id || neu === now || (only && !only.includes(id))) continue;
  const row = byId.get(id);
  if (!row || row.text !== now) { out.missing.push({ id, why: row ? 'the code no longer reads as the current text' : 'ID not found in the code' }); continue; }
  row.fixedNames = fixed;
  const src = fs.readFileSync(path.join(ROOT, row.file), 'utf8');
  const problems = checkLine(row, neu, src);
  let hard = null; try { toSource(row.seg, neu); validInJs(row.seg, src, neu); } catch (e) { hard = e.message; }
  if (hard || (problems.length && !force.has(id)) || skip.has(id)) { out.held.push({ id, file: row.file, line: row.line, now, neu, problems: skip.has(id) ? ['skipped by request'] : problems }); continue; }
  (edits[row.file] ??= []).push({ s: row.seg.s, e: row.seg.e, txt: toSource(row.seg, neu) });
  out.applied.push({ id, file: row.file, line: row.line, now, neu });
}
if (write) for (const [f, es] of Object.entries(edits)) {
  let src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const e of es.sort((a, b) => b.s - a.s)) src = src.slice(0, e.s) + e.txt + src.slice(e.e);
  fs.writeFileSync(path.join(ROOT, f), src);
}
console.log(JSON.stringify({ applied: out.applied.length, held: out.held.length, missing: out.missing.length, written: write }, null, 0));
fs.writeFileSync(args.includes('--report') ? args[args.indexOf('--report') + 1] : '/dev/null', JSON.stringify(out, null, 1));
for (const h of out.held) console.log('HELD', h.id, h.file + ':' + h.line, '\n  now:', h.now, '\n  new:', h.neu, '\n  why:', h.problems.join(' | '));
for (const m of out.missing) console.log('MISSING', m.id, m.why);
