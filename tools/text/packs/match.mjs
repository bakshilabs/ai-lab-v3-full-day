// Moments: which rows show together at one point in play. The lists are in moments/*.mjs, one file per part, each
// moment in the order a child meets it. A moment's rules say which rows it holds:
//   [file (a folder when it ends in /), keyRegex, { v: 'j'|'s'|'b', x: textRegex, l: [fromLine, toLine], late: true, first: true }]
// file is matched against the end of the row's file path. Rules are tried in list order, except that rules marked
// first are tried before all others, and rules marked late (catch-alls for a whole file) after all others. The first rule that fits takes the row.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'moments');
export const PARTS = ['ecotown', 'drone', 'robots', 'roads', 'film', 'power', 'leader'];

export async function loadMoments() {
  const all = [];
  for (const p of PARTS) {
    const f = path.join(DIR, `${p}.mjs`); if (!fs.existsSync(f)) continue;
    const list = (await import(f)).default;
    list.forEach((m, i) => all.push({ ...m, part: p, seq: i }));
  }
  const ids = new Set(); for (const m of all) { if (ids.has(m.id)) throw new Error(`duplicate moment ID ${m.id}`); ids.add(m.id); }
  return all;
}

function fits(rule, r) {
  const [file, key, o = {}] = rule;
  if (file.endsWith('/') ? !r.file.includes(file) : !(r.file === file || r.file.endsWith('/' + file))) return false;
  if (key && !new RegExp(key).test(r.keypath)) return false;
  if (o.v && !o.v.includes(r.version)) return false;
  if (o.x && !new RegExp(o.x).test(r.text)) return false;
  if (o.l && (r.line < o.l[0] || r.line > o.l[1])) return false;
  return true;
}

export async function assign(rows, moments) {
  moments ??= await loadMoments();
  const rules = [];
  for (const m of moments) for (const rule of m.m) rules.push({ m, rule, late: !!rule[2]?.late, first: !!rule[2]?.first });
  const ordered = [...rules.filter((x) => x.first), ...rules.filter((x) => !x.late && !x.first), ...rules.filter((x) => x.late && !x.first)];
  const byRow = new Map(); const byMoment = new Map(moments.map((m) => [m.id, []]));
  for (const r of rows) { const hit = ordered.find((x) => fits(x.rule, r)); if (hit) { byRow.set(r.id, hit.m); byMoment.get(hit.m.id).push(r); } }
  return { moments, byRow, byMoment };
}
