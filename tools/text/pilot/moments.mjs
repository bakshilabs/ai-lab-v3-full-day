// Pilot: which messages the child meets, in order, from a capture (capture.cjs -> steps.json).
// Each extracted line (Eco Town, ages 8–12 or both) is matched to the first screenshot where it is on screen, with the
// later screenshots where it shows again, and gets the code around its definition and the places that use it. Facts
// only: nothing here describes what a message is for; OpenAI reads the code and the screenshots and says that itself.
//
// Strict matching (the default):
//   - only text on screen when the picture was taken (visible text, and the labels of visible elements); not text that
//     came and went between pictures, and not lines that were only spoken;
//   - no lines that are mostly placeholders ({…1} {…2} check{…3}): a line with placeholders needs at least 8 letters of
//     its own and more words than placeholders;
//   - a screen line that is exactly some line without placeholders is that line, not a template that also fits it.
// --loose gives the first version's rules (anything shown, spoken or labelled between pictures), for comparison.
// Split-screen lines the owner named (towns.toggle, towns.notHere, towns.florence, towns.mine, compare, practice) are
// listed as required: if one is not found on screen, it is attached to the step where the capture triggered it.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, scopeFiles } from '../lib.mjs';
import { extractAll } from '../extract.mjs';

const lettersOnly = (t) => t.replace(/<\/?[a-z]+(#\d+)?>/g, '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const norm = (t) => lettersOnly(t).replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9.!?…]+$/g, '').replace(/\s+/g, ' ').trim();
const hasPh = (row) => /\{[^{}]+\}/.test(row.text);
function matcher(row, strict) {
  const t = lettersOnly(row.text).trim();
  const parts = t.split(/\{[^{}]+\}/);
  const literal = parts.join('').replace(/[^A-Za-z]/g, '');
  const nPh = parts.length - 1;
  const words = t.replace(/\{[^{}]+\}/g, ' ').trim().split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
  if (literal.length < 4) return null;
  if (strict && nPh && (literal.length < 8 || nPh >= words)) return null; // mostly placeholders
  const body = parts.map((x) => esc(x).replace(/\s+/g, '\\s+')).join('[^\\n]{1,80}?');
  // a short label, or a line that is mostly placeholders, must be a whole line on screen (a button, a tab, a heading)
  return words <= 3 || (nPh && literal.length < 12) ? new RegExp(`^[^A-Za-z0-9]{0,4}${body}[^A-Za-z0-9]{0,4}$`, 'm') : new RegExp(body);
}

// where in the code a line is used: the last parts of its key path, searched in the game's JS
function usages(row, files) {
  const keys = row.keypath.split('.').map((k) => k.replace(/\(\)$/, '').replace(/\[.*\]$/, '')).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k) && !['j', 's', 'junior', 'senior', 'J', 'S'].includes(k));
  const last = keys[keys.length - 1]; if (!last || last.length < 3) return [];
  const re = new RegExp(`[.\\[]['"]?${esc(last)}\\b`);
  const out = [];
  for (const f of files) {
    const lines = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
    lines.forEach((l, i) => { if (re.test(l) && !(f === row.file && Math.abs(i + 1 - row.line) < 3)) out.push({ file: f, line: i + 1, code: lines.slice(Math.max(0, i - 8), i + 9).map((x) => x.slice(0, 400)).join('\n') }); });
  }
  return out.slice(0, 3);
}
const around = (file, line, n = 14) => { const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n'); return lines.slice(Math.max(0, line - 1 - n), line + n).map((x) => x.slice(0, 400)).join('\n'); };

// the owner's split-screen lines, and the capture step that triggers each (used only if it is not found on screen)
export const REQUIRED = [
  [/^SANDBOX\.junior\.towns\.toggle$/, /^toggle-shown$|^compare-split$/], [/^SANDBOX\.junior\.towns\.notHere$/, /^tap-florences-pane$/],
  [/^SANDBOX\.junior\.towns\.florence$/, /^compare-split$/], [/^SANDBOX\.junior\.towns\.mine$/, /^compare-split$/],
  [/^SANDBOX\.junior\.compare$/, /^compare-split$/], [/^SANDBOX\.junior\.practice$/, /^mission-brief$/],
];

export function buildMoments(stepsFile, { strict = true } = {}) {
  const steps = JSON.parse(fs.readFileSync(stepsFile, 'utf8'));
  const all = extractAll();
  const rows = all.filter((r) => !/js\/modules\/|leader\.html|start\.html|trailer\.html|episodes\.js/.test(r.file) && (r.version === 'j' || r.version === 'b') && r.status !== 'keep');
  const jsFiles = scopeFiles().filter((f) => f.endsWith('.js') && !/js\/modules\//.test(f));
  const res = new Map(rows.map((r) => [r.id, matcher(r, strict)]));
  // lines with no placeholders, by their normalised text: a screen line equal to one of them is that line
  const exact = new Set(rows.filter((r) => !hasPh(r) && res.get(r.id)).map((r) => norm(r.text)));
  const seen = new Map();
  for (const st of steps) {
    const said = st.said.map((s) => s.text); const labels = st.labels.flatMap((l) => [l.aria, l.title]).filter(Boolean);
    const where = (re) => { const p = st.panels.find((x) => x.id !== 'app' && re.test(x.text)); return p ? p.id : null; };
    const screen = strict ? [...st.visible, ...labels] : st.visible;
    const free = screen.filter((l) => !exact.has(norm(l))); // screen lines not taken by an exact line
    for (const r of rows) {
      const re = res.get(r.id); if (!re) continue;
      const pool = strict && hasPh(r) ? free : screen;
      const visible = re.test(pool.join('\n')); // on screen when the picture was taken
      const spoken = said.find((s) => re.test(s));
      const label = labels.find((s) => re.test(s));
      const loose = !strict && (visible || re.test(st.appeared.join('\n')) || spoken || label);
      if (!(visible || loose)) continue;
      let m = seen.get(r.id);
      if (!m) { m = { row: r, re, first: st.n, shown: [], onScreen: false, spoken: null, label: false, panel: null, forced: false }; seen.set(r.id, m); }
      if (visible) { m.shown.push(st.n); if (!m.panel) m.panel = where(re); m.onScreen = true; }
      if (!strict) { m.onScreen ||= re.test(st.appeared.join('\n')); m.label ||= !!label && !m.onScreen; }
      if (spoken && !m.spoken) m.spoken = st.said.find((x) => x.text === spoken).voice;
    }
  }
  // the owner's split-screen lines: required wherever the capture triggered them
  const missingRequired = [];
  for (const [kre, sre] of REQUIRED) {
    const r = rows.filter((x) => kre.test(x.keypath)).sort((a, b) => b.line - a.line)[0]; // the live definition (the last one)
    if (!r) { missingRequired.push(`${kre}: no such line`); continue; }
    if (seen.has(r.id)) continue;
    const st = steps.find((x) => sre.test(x.name));
    if (!st) { missingRequired.push(`${r.keypath}: the capture has no step for it`); continue; }
    seen.set(r.id, { row: r, re: matcher(r, false), first: st.n, shown: [st.n], onScreen: true, spoken: null, label: false, panel: null, forced: true });
  }
  for (const m of seen.values()) { m.step = m.shown[0] ?? m.first; m.also = m.shown.filter((n) => n !== m.step); }
  // one message per wording at a moment: the screen shows one wording, and the screen text cannot tell which of the
  // lines with those words produced it, so they are one message, with every place in the code that holds them
  // ("twins"). The owner's split-screen lines stay separate (the toggle and a pane label share words, not a job).
  const out = []; const byText = new Map();
  const required = (r) => REQUIRED.some(([kre]) => kre.test(r.keypath));
  for (const m of [...seen.values()].sort((a, b) => Number(required(b.row)) - Number(required(a.row)))) {
    const k = required(m.row) ? `req\u0000${m.row.id}` : `${m.step}\u0000${norm(m.row.text)}\u0000${m.row.version}`;
    if (byText.has(k)) { const x = byText.get(k); x.twins.push(m.row.id); if (x.twinCode.length < 3) x.twinCode.push({ at: `${m.row.file.replace(/^games\/ecotown\/game\//, '')} line ${m.row.line} (${m.row.keypath})`, code: around(m.row.file, m.row.line, 5) }); continue; }
    const x = { id: m.row.id, step: m.step, also: m.also, row: m.row, onScreen: m.onScreen, spokenBy: m.spoken, asLabel: m.label, panel: m.panel, forced: m.forced, twins: [], twinCode: [],
      definition: { file: m.row.file, line: m.row.line, keypath: m.row.keypath, code: around(m.row.file, m.row.line) }, usedAt: usages(m.row, jsFiles) };
    byText.set(k, x); out.push(x);
  }
  out.sort((a, b) => a.step - b.step || a.row.file.localeCompare(b.row.file) || a.row.line - b.row.line);
  // what was on screen and not matched to a line (built from several strings, or a fixed build name)
  const matchedRes = out.map((m) => matcher(m.row, false)).filter(Boolean);
  const unmatched = steps.map((st) => ({ step: st.n, lines: st.visible.filter((l) => /[A-Za-z]{3}/.test(l) && !matchedRes.some((re) => re.test(l))) }));
  return { steps, moments: out, unmatched, missingRequired };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2]; const strict = !process.argv.includes('--loose');
  if (process.argv.includes('--compare')) { // messages per screen: the first version's rules against the strict ones
    const a = buildMoments(file, { strict: false }), b = buildMoments(file, { strict: true });
    console.log('screen | first rules | strict');
    for (const st of b.steps) console.log(`${st.file} | ${a.moments.filter((m) => m.step === st.n).length} | ${b.moments.filter((m) => m.step === st.n).length}`);
    console.log(`total | ${a.moments.length} | ${b.moments.length}`);
    process.exit(0);
  }
  const { steps, moments, unmatched, missingRequired } = buildMoments(file, { strict });
  for (const st of steps) { const ms = moments.filter((m) => m.step === st.n); console.log(`\n${st.file} (${ms.length})`); for (const m of ms) console.log(`  ${m.id} ${m.row.version} ${m.forced ? 'FORCED' : m.panel || (m.spokenBy ? 'said:' + m.spokenBy : m.asLabel ? 'label' : 'screen')} ${m.row.file.split('/').pop()}:${m.row.keypath} | ${m.row.text.slice(0, 90)}`); }
  console.log('\nmessages:', moments.length, missingRequired.length ? `\nREQUIRED LINES NOT IN THE CAPTURE: ${missingRequired.join('; ')}` : '\nall required split-screen lines are in');
  if (process.argv.includes('--unmatched')) for (const u of unmatched) console.log(u.step, JSON.stringify(u.lines).slice(0, 600));
}
