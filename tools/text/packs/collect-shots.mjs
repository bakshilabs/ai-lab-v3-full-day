// Puts the screenshots for the packs in one folder per part, as JPEGs about 1280 px wide, each named after the moment
// it shows: <part>/<Moment ID>-<j|s>-<what>.jpg (the name build.mjs reads).
//   - the module and Eco Town play-throughs (games/ecotown/game/tests/playwright/*.mjs, run into --play): the pictures
//     listed in shots-map.mjs, each with the moment(s) it shows;
//   - the pilot capture of Eco Town's first 15 minutes (tools/text/pilot/capture.cjs, --pilot): every picture, each
//     given the moment that most of the lines on screen in it belong to (from the pilot's own matching, moments.mjs).
// Usage: node tools/text/packs/collect-shots.mjs --play <dir> --pilot <dir with steps.json> --out <shots dir>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { assign } from './match.mjs';
import { extractAll } from '../extract.mjs';
import { buildMoments } from '../pilot/moments.mjs';
import MAP, { EXTRA } from './shots-map.mjs';
const SHOTS = [...MAP, ...EXTRA];

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PLAY = arg('--play'), PILOT = arg('--pilot'), OUT = arg('--out');
if (!OUT) { console.error('--out <dir> is needed'); process.exit(1); }
const jpeg = (src, dst) => execFileSync('convert', [src, '-resize', '1280x>', '-quality', '78', '-strip', dst]);
const made = [];

// 1. the play-throughs
if (PLAY) for (const s of SHOTS) {
  const dir = path.join(PLAY, s.run); if (!fs.existsSync(dir)) { console.warn('no run folder', s.run); continue; }
  const src = fs.readdirSync(dir).filter((f) => f.endsWith('.png') && f.includes(s.pic)).sort()[0];
  if (!src) { console.warn('missing picture', s.run, s.pic); continue; }
  fs.mkdirSync(path.join(OUT, s.part), { recursive: true });
  for (const id of s.ids) { const f = `${id}-${s.ver}-${s.name}.jpg`; jpeg(path.join(dir, src), path.join(OUT, s.part, f)); made.push(`${s.part}/${f}`); }
}

// 2. the pilot capture: the moment most of each picture's lines belong to
if (PILOT) {
  const steps = path.join(PILOT, 'steps.json');
  const { steps: list, moments } = buildMoments(steps);
  const rows = extractAll().map((r) => ({ ...r, file: r.file.replace(/^games\/ecotown\/game\//, '') })).filter((r) => r.status !== 'keep');
  const { byRow } = await assign(rows);
  // the moment(s) each pilot step shows, by the capture's own step name (checked against the pictures); a step not in
  // this list gets the moment most of its on-screen lines belong to
  const BY_NAME = [[/^welcome-card$/, ['ET-M004']], [/^welcome-scene/, ['ET-M005']], [/^welcome-guide$/, ['ET-M006']], [/^start$/, ['ET-M008']],
    [/^name$/, ['ET-M009']], [/^intro-/, ['ET-M012']], [/^mission-brief$/, ['ET-M101']], [/^mission-instruct$/, ['ET-M016']],
    [/^mission-cards$/, ['ET-M102']], [/^mission-plan$/, ['ET-M103', 'ET-M017']], [/^mission-check-flood$/, ['ET-M104', 'ET-M018', 'ET-M019']],
    [/^mission-habit$/, ['ET-M021', 'ET-M105']], [/^mission-retry$/, ['ET-M022']], [/^mission-plan-clear$/, ['ET-M103']], [/build-film/, ['ET-M107', 'ET-M025']],
    [/^mission-reward$/, ['ET-M108', 'ET-M023', 'ET-M024']], [/^compare-split$|^tap-florences-pane$|^toggle-/, ['ET-M030']], [/^your-turn$|^your-turn-done$/, ['ET-M032']],
    [/^your-turn-tool$/, ['ET-M036', 'ET-M033']], [/^your-turn-tap-/, ['ET-M035']], [/^travel-invite$/, ['ET-M014']]];
  let films = 0;
  fs.mkdirSync(path.join(OUT, 'ecotown'), { recursive: true });
  for (const st of list) {
    const ids = moments.filter((m) => m.step === st.n).flatMap((m) => [m.id, ...m.twins]);
    const count = new Map(); for (const id of ids) { const m = byRow.get(id); if (m) count.set(m.id, (count.get(m.id) || 0) + 1); }
    let best = [...count].sort((a, b) => b[1] - a[1]).slice(0, 1).map((x) => x[0]);
    if (st.name === 'story-film') best = [films++ === 0 ? 'ET-M100' : 'ET-M109'];
    else { const named = BY_NAME.find(([re]) => re.test(st.name)); if (named) best = named[1]; }
    if (!best.length) { console.warn('pilot step with no moment', st.name); continue; }
    for (const id of best) { const f = `${id}-j-pilot-${String(st.n).padStart(2, '0')}-${st.name}.jpg`; jpeg(path.join(PILOT, st.file), path.join(OUT, 'ecotown', f)); made.push(`ecotown/${f}`); }
  }
}
console.log(made.length, 'pictures'); for (const m of made) console.log(' ', m);
