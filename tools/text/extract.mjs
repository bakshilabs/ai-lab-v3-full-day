// Step 1: pull out every line a child or leader reads or hears, in the sheet's columns
// (ID, Area, Version, File, Line, Where in code, Current text), reusing the IDs of the earlier sheet
// (docs/feedback/2026-11-17-ecotown-text-rewrites.csv) where file and text line up.
// Usage: node tools/text/extract.mjs [--out file.json]   (prints a summary; the rows go to the JSON file)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SHEET_OWNER, scopeFiles, segmentsOf, skipFileReason, skipKeyReason, isHeld, areaOf, normText, readSheet, rel } from './lib.mjs';

const MOD_PREFIX = { drone: 'DR', robots: 'RB', roads: 'RD', film: 'FM', power: 'PW' };

// -> [{ id, area, version, file, line, keypath, text, status, why, seg }]
//    status: 'send' (to be rewritten), 'held' (rewrite, apply after the two-towns merge), 'keep' (not sent: why)
export function extractAll() {
  const earlier = fs.existsSync(path.join(ROOT, SHEET_OWNER)) ? readSheet(SHEET_OWNER) : [];
  const byText = new Map(); // file + normalised text -> earlier row
  for (const r of earlier) for (const t of [r['New text'], r['Current text']]) if (t) { const k = `${r.File}\u0000${normText(t)}`; if (!byText.has(k)) byText.set(k, r); }
  const used = new Set(); let nextT = Math.max(0, ...earlier.map((r) => +r.ID.slice(1) || 0));
  const counters = {};
  const rows = [];
  for (const file of scopeFiles()) {
    const skipFile = skipFileReason(file); if (skipFile) continue;
    const segs = segmentsOf(file);
    for (const seg of segs) {
      const why = seg.skip === 'code' ? null : seg.skip || skipKeyReason(file, seg.keypath);
      if (seg.skip === 'code') continue; // code, not text (class names, keys, selectors…)
      const prev = byText.get(`${file}\u0000${normText(seg.display)}`);
      let id;
      if (prev && !used.has(prev.ID)) { id = prev.ID; used.add(id); }
      else { const m = file.match(/js\/modules\/(\w+)\//); if (m) { const p = MOD_PREFIX[m[1]] || 'MD'; counters[p] = (counters[p] || 0) + 1; id = `${p}${String(counters[p]).padStart(4, '0')}`; } else id = `T${String(++nextT).padStart(4, '0')}`; }
      rows.push({ id, area: prev?.Area && !/js\/modules\//.test(file) ? prev.Area : areaOf(file), version: seg.version, file, line: seg.line, keypath: seg.keypath, text: seg.display, earlierNew: prev?.['New text'] && normText(prev['New text']) === normText(seg.display) ? true : false,
        status: why ? 'keep' : isHeld(file) ? 'held' : 'send', why: why || (isHeld(file) ? 'apply after two-towns merge' : ''), seg });
    }
  }
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = extractAll();
  const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : null;
  const count = (f) => rows.filter(f).length;
  console.log(`lines: ${rows.length}; to rewrite now: ${count((r) => r.status === 'send')}; rewrite, apply after the two-towns merge: ${count((r) => r.status === 'held')}; kept (not sent): ${count((r) => r.status === 'keep')}; reusing earlier IDs: ${count((r) => r.id.startsWith('T') && +r.id.slice(1) <= 3054)}`);
  const by = {}; for (const r of rows) by[r.area] = (by[r.area] || 0) + 1; console.log(by);
  const v = {}; for (const r of rows) v[r.version] = (v[r.version] || 0) + 1; console.log(v);
  if (out) fs.writeFileSync(out, JSON.stringify(rows.map(({ seg, ...r }) => ({ ...r, file: rel(r.file) })), null, 1));
}
