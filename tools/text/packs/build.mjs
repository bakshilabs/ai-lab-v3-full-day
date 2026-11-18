// Builds the text packs the owner gives ChatGPT by hand: one folder per part of the day, each with the instructions,
// the game brief, the part notes, a list of moments, the text spreadsheet and the screenshots; then a zip.
// Every row is one line a child or leader reads or hears (from tools/text/extract.mjs). Each row is put in a moment
// (moments/*.mjs: when it shows, who speaks, what is on screen) and the rows are sorted in the order a child meets them.
// Nothing here writes or changes player wording: the descriptions are notes about the game, for the writer.
//
// Usage: node tools/text/packs/build.mjs --out <dir> [--rows rows.json] [--shots <dir>] [--zip <file.zip>]
//   --rows   the extractor's JSON (node tools/text/extract.mjs --out rows.json). Default: run the extractor now.
//   --shots  screenshots, one folder per part (ecotown, drone, robots, roads, film, power, leader), each file named
//            <Moment ID>-<j|s>-<what>.jpg. A moment split by age takes the j pictures for 8–12 and the s pictures
//            for 13–17 (the j pictures when there is no s one).
//   --out    where the pack folders go (emptied first).   --zip  the zip to write (default <out>.zip).
// The whole rebuild, from games/ecotown/game served on a port (e.g. python3 -m http.server 8931):
//   1. play-throughs, one browser at a time, into <play>/<run> (run names as in shots-map.mjs): tests/playwright/
//      drone.mjs, robots.mjs, roads.mjs, film.mjs, power.mjs (junior; power also senior), run.mjs junior and senior
//      (FAST=1), and node tools/text/packs/capture-pages.cjs <url> <play>/pages
//   2. node tools/text/packs/collect-shots.mjs --play <play> --pilot <pilot capture dir> --out <shots>
//   3. node tools/text/extract.mjs --out rows.json; node tools/text/packs/build.mjs --rows rows.json --shots <shots> --out <dir>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assign, loadMoments } from './match.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out'); if (!OUT) { console.error('--out <dir> is needed'); process.exit(1); }
const SHOTS = arg('--shots'); const ZIP = arg('--zip', OUT.replace(/\/$/, '') + '.zip');

let rowsFile = arg('--rows');
if (!rowsFile) { rowsFile = path.join(OUT + '.rows.json'); execFileSync('node', [path.join(HERE, '../extract.mjs'), '--out', rowsFile], { stdio: 'ignore' }); }
const all = JSON.parse(fs.readFileSync(rowsFile, 'utf8'));
const rows = all.filter((r) => r.status !== 'keep');

// the parts: folder, file slug, and which extractor area belongs to it when a row has no moment
const PARTS = [
  { key: 'ecotown', dir: '1-Eco-Town', slug: 'eco-town', areas: ['Pages', 'Game screens', 'Game words (content.js)', 'Story cartoons (voiced)'] },
  { key: 'drone', dir: '2-Drone-Delivery', slug: 'drone', areas: ['Module: Drone delivery'] },
  { key: 'robots', dir: '3-Robot-Training', slug: 'robots', areas: ['Module: Robot training'] },
  { key: 'roads', dir: '4-Roads-For-Self-Driving-Cars', slug: 'roads', areas: ['Module: Roads for self-driving cars'] },
  { key: 'film', dir: '5-Town-Film-Studio', slug: 'film', areas: ['Module: Town film studio'] },
  { key: 'power', dir: '6-Power-Control-Room', slug: 'power', areas: ['Module: Power control room'] },
  { key: 'leader', dir: '7-Leader-pages', slug: 'leader', areas: ['Leader page'] },
];
const partOfArea = (a) => PARTS.find((p) => p.areas.includes(a)) || PARTS[0];

const moments = await loadMoments();
const { byRow } = await assign(rows, moments);

// ---- moments split by age: a moment with lines for 8–12 and for 13–17 becomes one moment per age group (and one
// for the lines both see, when there are any), so the writer meets each age's lines together
const AGE = { j: '8–12', s: '13–17', b: 'both' };
const units = new Map(); // unit id -> { id, base, ver, moment, rows }
const byMoment = new Map(moments.map((m) => [m.id, []]));
for (const r of rows) { const m = byRow.get(r.id); if (m) byMoment.get(m.id).push(r); }
const unitOf = new Map();
for (const m of moments) {
  const list = byMoment.get(m.id); if (!list.length) continue;
  const has = { j: list.some((r) => r.version === 'j'), s: list.some((r) => r.version === 's'), b: list.some((r) => r.version === 'b') };
  const split = has.j && has.s && !m.nosplit;
  const make = (ver, id) => { const u = { id, base: m.id, ver, moment: m, rows: [] }; units.set(id, u); return u; };
  if (!split) { const u = make(null, m.id); for (const r of list) { u.rows.push(r); unitOf.set(r.id, u); } continue; }
  const ub = has.b ? make('b', m.id) : null, uj = make('j', `${m.id}J`), us = make('s', `${m.id}S`);
  for (const r of list) { const u = r.version === 'j' ? uj : r.version === 's' ? us : ub; u.rows.push(r); unitOf.set(r.id, u); }
}
const NOT_SEEN = /not seen in play-through/i;
const unitDesc = (u) => {
  const head = `${u.moment.t}. ${u.moment.d}${u.moment.seen === false && !NOT_SEEN.test(u.moment.d) ? ' Not seen in the play-throughs; described from the code.' : ''}`;
  if (u.ver === 'j') return `${head} [This group: the lines for ages 8–12.]`;
  if (u.ver === 's') return `${head} [This group: the lines for ages 13–17.]`;
  if (u.ver === 'b') return `${head} [This group: the lines both ages see; each age’s own lines are in ${u.base}J and ${u.base}S.]`;
  return head;
};
const unitAge = (u) => (u.ver ? AGE[u.ver] : [...new Set(u.rows.map((r) => AGE[r.version]))].sort().join(', '));

// ---- screenshots: <part>/<Moment ID>-<j|s>-<what>.jpg
const shotsFor = new Map(); // part key -> [{ file, src, moment, ver }]
if (SHOTS) for (const p of PARTS) {
  const d = path.join(SHOTS, p.key); if (!fs.existsSync(d)) continue;
  const list = fs.readdirSync(d).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort().map((f) => { const m = f.match(/^([A-Z]{2}-M\d{3}[A-Z]?)-([js])-/); return m ? { file: f, src: path.join(d, f), moment: m[1], ver: m[2] } : null; }).filter(Boolean);
  shotsFor.set(p.key, list);
}
const shotsOfUnit = (u) => {
  const list = shotsFor.get(u.moment.part) || []; const mine = list.filter((s) => s.moment === u.base || s.moment === u.id);
  if (u.ver === 's') { const s = mine.filter((x) => x.ver === 's'); return (s.length ? s : mine.filter((x) => x.ver === 'j')).map((x) => x.file); }
  if (u.ver === 'j' || u.ver === 'b') { const j = mine.filter((x) => x.ver === 'j'); return (j.length ? j : mine).map((x) => x.file); }
  return mine.map((x) => x.file);
};

// ---- the CSV
const q = (v) => { v = v == null ? '' : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
const HEAD = ['ID', 'Part of the game', 'Age group', 'Read aloud', 'Moment ID', 'What is happening (description)', 'Screenshot', 'File', 'Line', 'Where in the code',
  'Text before it (same file)', 'Current text (facts only)', 'Text after it (same file)', 'Purpose', 'What the child should understand', 'What the child should do next', 'New text', 'Note'];
const byFile = {}; for (const r of [...rows].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) (byFile[r.file] ??= []).push(r);
const nb = new Map(); for (const list of Object.values(byFile)) list.forEach((r, i) => nb.set(r, [list[i - 1]?.text ?? '', list[i + 1]?.text ?? '']));
const voiced = (r) => /Story cartoons/.test(r.area) ? 'yes' : r.area === 'Leader page' || r.area === 'Pages' ? 'no' : (r.version === 's' ? 'if switched on' : 'usually (on by default for 8–12)');
const NO_MOMENT = 'No moment: not placed in play. Check the “Where in the code” column; say in the Note column if it is unclear when this line shows.';
const csvLine = (r) => { const u = unitOf.get(r.id); return [r.id, r.area, AGE[r.version] || r.version, voiced(r), u?.id || '', u ? unitDesc(u) : NO_MOMENT, u ? shotsOfUnit(u).join('; ') : '', r.file, r.line, r.keypath, nb.get(r)[0], r.text, nb.get(r)[1], '', '', '', '', ''].map(q).join(','); };
const writeCsv = (f, list) => fs.writeFileSync(f, '﻿' + [HEAD.join(','), ...list.map(csvLine)].join('\r\n') + '\r\n');

// order: the part, the moment's place in its list, then shared / 8–12 / 13–17, then file and line
const VER_ORDER = { null: 0, b: 0, j: 1, s: 2 };
const sortKey = (r) => { const u = unitOf.get(r.id); return u ? [0, u.moment.seq, VER_ORDER[u.ver], r.file, r.line] : [1, 0, 0, r.file, r.line]; };
const cmp = (a, b) => { const x = sortKey(a), y = sortKey(b); for (let i = 0; i < x.length; i++) { if (x[i] < y[i]) return -1; if (x[i] > y[i]) return 1; } return 0; };

// ---- write the folders
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const NOTES = path.join(HERE, 'notes');
const report = [];
for (const p of PARTS) {
  const dir = path.join(OUT, p.dir); fs.mkdirSync(dir, { recursive: true });
  const mine = rows.filter((r) => { const u = unitOf.get(r.id); return u ? u.moment.part === p.key : partOfArea(r.area) === p; }).sort(cmp);
  fs.copyFileSync(path.join(HERE, 'instructions-for-openai.md'), path.join(dir, '1-instructions-for-openai.md'));
  fs.copyFileSync(path.join(NOTES, 'game-brief.md'), path.join(dir, '2-game-brief.md'));
  fs.copyFileSync(path.join(NOTES, `part-notes-${p.slug}.md`), path.join(dir, `3-part-notes-${p.slug}.md`));
  writeCsv(path.join(dir, `4-text-${p.slug}.csv`), mine);
  // the moments, in order, with their descriptions and pictures: a quick read before the spreadsheet
  const us = [...units.values()].filter((u) => u.moment.part === p.key).sort((a, b) => a.moment.seq - b.moment.seq || VER_ORDER[a.ver] - VER_ORDER[b.ver]);
  const MH = ['Moment ID', 'Age group', 'What is happening (description)', 'Screenshot', 'Rows', 'First row ID'];
  const first = new Map(); for (const r of mine) { const u = unitOf.get(r.id); if (u && !first.has(u.id)) first.set(u.id, r.id); }
  fs.writeFileSync(path.join(dir, `5-moments-${p.slug}.csv`), '﻿' + [MH.join(','), ...us.map((u) => [u.id, unitAge(u), unitDesc(u), shotsOfUnit(u).join('; '), u.rows.length, first.get(u.id) || ''].map(q).join(','))].join('\r\n') + '\r\n');
  // screenshots: every picture of this part's moments
  const shots = (shotsFor.get(p.key) || []);
  if (shots.length) { const sd = path.join(dir, 'screenshots'); fs.mkdirSync(sd, { recursive: true }); for (const s of shots) fs.copyFileSync(s.src, path.join(sd, s.file)); }
  const noMoment = mine.filter((r) => !unitOf.get(r.id)).length;
  report.push({ part: p.dir, rows: mine.length, moments: new Set(us.map((u) => u.base)).size, units: us.length, noMoment, shots: shots.length,
    notSeen: us.filter((u) => u.moment.seen === false || NOT_SEEN.test(u.moment.d)).reduce((n, u) => n + u.rows.length, 0) });
}
// a short read-me at the top of the zip
fs.writeFileSync(path.join(OUT, 'README.txt'), [
  'AI Lab text packs: one folder per part of the day.',
  'In each folder: 1 instructions, 2 game brief, 3 part notes, 4 the text spreadsheet (sorted in the order a child meets the lines),',
  '5 the list of moments (what is happening at each point in play), and screenshots/ (pictures of the most important moments,',
  'named by Moment ID; -j- is ages 8–12, -s- is ages 13–17).',
  `Built ${new Date().toISOString().slice(0, 10)} from ${rows.length} lines.`, ''].join('\r\n'));
console.table(report);
const tot = report.reduce((a, r) => ({ rows: a.rows + r.rows, moments: a.moments + r.moments, units: a.units + r.units, noMoment: a.noMoment + r.noMoment, shots: a.shots + r.shots, notSeen: a.notSeen + r.notSeen }), { rows: 0, moments: 0, units: 0, noMoment: 0, shots: 0, notSeen: 0 });
console.log('total', tot);
fs.writeFileSync(OUT + '.report.json', JSON.stringify({ parts: report, total: tot }, null, 1));
// the zip
fs.rmSync(ZIP, { force: true });
execFileSync('zip', ['-q', '-r', '-X', path.resolve(ZIP), '.'], { cwd: OUT });
console.log('zip', ZIP, (fs.statSync(ZIP).size / 1e6).toFixed(1), 'MB');
