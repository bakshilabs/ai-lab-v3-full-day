// Pilot: which messages the child meets, in order, from a capture (capture.cjs -> steps.json).
// Each extracted line (Eco Town, ages 8–12 or both) is matched to the first step where it is on screen, spoken or
// floated, and gets the code around its definition and around the places that use it. Facts only: nothing here
// describes what a message is for; OpenAI reads the code and the screenshots and says that itself.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, GAME, scopeFiles } from '../lib.mjs';
import { extractAll } from '../extract.mjs';

const lettersOnly = (t) => t.replace(/<\/?[a-z]+(#\d+)?>/g, '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function matcher(row) {
  const t = lettersOnly(row.text).trim();
  const parts = t.split(/\{[^{}]+\}/);
  const literal = parts.join('').replace(/[^A-Za-z]/g, '');
  if (literal.length < 4) return null;
  const words = t.replace(/\{[^{}]+\}/g, ' ').trim().split(/\s+/).length;
  const body = parts.map((x) => esc(x).replace(/\s+/g, '\\s+')).join('[^\\n]{1,80}?');
  // a short label, or a line that is mostly placeholders, must be a whole line on screen (a button, a tab, a heading)
  return words <= 3 || (parts.length > 1 && literal.length < 12) ? new RegExp(`^[^A-Za-z0-9]{0,4}${body}[^A-Za-z0-9]{0,4}$`, 'm') : new RegExp(body);
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

export function buildMoments(stepsFile) {
  const steps = JSON.parse(fs.readFileSync(stepsFile, 'utf8'));
  const rows = extractAll().filter((r) => !/js\/modules\/|leader\.html|start\.html|trailer\.html|episodes\.js/.test(r.file) && (r.version === 'j' || r.version === 'b') && r.status !== 'keep');
  const jsFiles = scopeFiles().filter((f) => f.endsWith('.js') && !/js\/modules\//.test(f));
  const seen = new Map(); // row id -> { row, step, how, panel }
  for (const st of steps) {
    const said = st.said.map((s) => s.text); const labels = st.labels.flatMap((l) => [l.aria, l.title]).filter(Boolean);
    const where = (re) => { const p = st.panels.find((x) => x.id !== 'app' && re.test(x.text)); return p ? p.id : null; };
    for (const r of rows) {
      const re = matcher(r); if (!re) continue;
      const visible = re.test(st.visible.join('\n')); // on screen when the picture was taken
      const onScreen = visible || re.test(st.appeared.join('\n'));
      const spoken = said.find((s) => re.test(s));
      const label = labels.find((s) => re.test(s));
      if (!(onScreen || spoken || label)) continue;
      let m = seen.get(r.id);
      if (!m) { m = { row: r, re, first: st.n, shown: [], onScreen: false, spoken: null, label: false, panel: null }; seen.set(r.id, m); }
      if (visible) { m.shown.push(st.n); if (!m.panel) m.panel = where(re); }
      m.onScreen ||= onScreen; m.label ||= !!label && !onScreen;
      if (spoken && !m.spoken) m.spoken = st.said.find((x) => x.text === spoken).voice;
    }
  }
  // a message belongs to the first picture where the child can see it (or, if never in a picture, where it first came up)
  for (const m of seen.values()) { m.step = m.shown[0] ?? m.first; m.also = m.shown.filter((n) => n !== m.step); }
  // one message per wording at a moment: a line found in two files (or for both ages) is listed once, with its twins
  const out = []; const byText = new Map();
  for (const m of seen.values()) {
    const k = `${m.step}\u0000${m.row.text}`;
    if (byText.has(k)) { byText.get(k).twins.push(m.row.id); continue; }
    const x = { id: m.row.id, step: m.step, also: m.also, row: m.row, onScreen: m.onScreen, spokenBy: m.spoken, asLabel: m.label, panel: m.panel, twins: [],
      definition: { file: m.row.file, line: m.row.line, keypath: m.row.keypath, code: around(m.row.file, m.row.line) }, usedAt: usages(m.row, jsFiles) };
    byText.set(k, x); out.push(x);
  }
  out.sort((a, b) => a.step - b.step || a.row.file.localeCompare(b.row.file) || a.row.line - b.row.line);
  // what was on screen and not matched to a line (built from several strings, or a fixed build name)
  const matchedRes = out.map((m) => matcher(m.row)).filter(Boolean);
  const unmatched = steps.map((st) => ({ step: st.n, lines: st.visible.filter((l) => /[A-Za-z]{3}/.test(l) && !matchedRes.some((re) => re.test(l))) }));
  return { steps, moments: out, unmatched };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { steps, moments, unmatched } = buildMoments(process.argv[2]);
  for (const st of steps) { const ms = moments.filter((m) => m.step === st.n); console.log(`\n${st.file} (${ms.length})`); for (const m of ms) console.log(`  ${m.id} ${m.row.version} ${m.panel || (m.spokenBy ? 'said:' + m.spokenBy : m.asLabel ? 'label' : '?')} ${m.row.file.split('/').pop()}:${m.row.keypath} | ${m.row.text.slice(0, 90)}`); }
  console.log('\nmessages:', moments.length);
  if (process.argv.includes('--unmatched')) for (const u of unmatched) console.log(u.step, JSON.stringify(u.lines).slice(0, 600));
}
