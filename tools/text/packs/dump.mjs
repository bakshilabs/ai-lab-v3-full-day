// Helper for writing the moment lists: prints the rows of the files that match a pattern, one per line
// (ID, line, age, key path, text), and which moment each row falls in when moments/*.mjs exist.
// Usage: node tools/text/packs/dump.mjs <rows.json> <file regex> [--unmatched]
import fs from 'node:fs';
import { assign } from './match.mjs';
const [rowsFile, fre] = process.argv.slice(2);
const rows = JSON.parse(fs.readFileSync(rowsFile, 'utf8')).filter((r) => r.status !== 'keep' && new RegExp(fre).test(r.file));
const { byRow } = await assign(rows);
const only = process.argv.includes('--unmatched');
for (const r of rows.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
  const m = byRow.get(r.id); if (only && m) continue;
  console.log(`${(m?.id || '-').padEnd(8)} ${r.file.split('/').pop()}:${r.line} ${r.version} ${r.keypath} | ${r.text.replace(/\s+/g, ' ').slice(0, 110)}`);
}
