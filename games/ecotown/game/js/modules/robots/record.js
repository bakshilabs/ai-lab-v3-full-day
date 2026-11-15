// Robots at work: what each mission made, in one line, and the take-home record for the hour. Pure: no page.
// Every line is built from the mission's saved summary, so it says only what the child did.
import { SURE } from './m5-weeds.js';
import { designWords } from './m6-flood.js';
import { CONDS, ACTS } from './m3-rules.js';

const n = (k, word) => `${k} ${word}${k === 1 ? '' : 's'}`;
// One line per mission (shown on the map, on the closing card and on the take-home page). sum: the mission's summary.
export function missionLine(m, s, j) {
  if (!s) return '';
  if (m === 1) return j ? `Matched ${s.mr} of ${s.mo} jobs to a sensor first time, and said what the robot would do ${s.pr} of ${s.po} times.`
    : `Sensors: ${s.mr} of ${s.mo} jobs matched first time; ${s.pr} of ${s.po} moves predicted from the sensor reading.`;
  if (m === 2) return j ? `Programmed a robot arm, fixed a broken program, and packed all 4 seedlings with ${n(s.steps, 'step')} repeated ${s.rep} times.`
    : `Arm program: fixed a bug, then packed 4 seedlings with a ${s.steps}-step loop run ${s.rep} times.`;
  if (m === 3) { const safe = (s.rules || []).filter(([, a]) => a).length;
    return j ? `Wrote ${n(safe, 'rule')} for a hospital robot. It took the medicine safely on every trip, even upstairs.`
      : `Hospital robot: ${safe} ordered if-then rules; a safe delivery upstairs in ${s.secs} s.`; }
  if (m === 4) return j ? `Trained a recycling robot with ${n(s.ex, 'example')}: ${s.first} of ${s.of} right at first, then ${s.last} of ${s.of}. ${s.sr} of ${s.so} right in the street.`
    : `Sorter: ${s.ex} examples; unseen test ${s.first}/${s.of}, then ${s.last}/${s.of}; ${s.sr}/${s.so} new things in the street.`;
  if (m === 5) { const a = s.f1; const b = s.f2; if (!a || !b) return j ? 'Set how sure a weeding robot must be before it pulls a plant.' : 'Set a weeding robot’s confidence threshold.';
    return j ? `Weeding robot: pulled at “${SURE[a.pull].toLowerCase()}” for lettuces and “${SURE[b.pull].toLowerCase()}” for carrots. No crop lost.`
      : `Weeder: pull at ${a.pull}% (lettuce) and ${b.pull}%${b.ask ? `, flag from ${b.ask}%` : ''} (carrot); no crop lost, ${b.left} of ${b.weeds} weeds left.`; }
  if (m === 6) { const t = (s.tests || [0, 0]).reduce((x, y) => x + y, 0); const dz = s.d2 || s.d1;
    return `${j ? 'Flood robot' : 'Rescue robot'}: ${designWords(dz, j)}. Found the person after ${n(t, 'test')}.`.slice(0, 120); }
  return '';
}
// The skills, each finishing "You practised …", built from the missions done.
export function practisedLines(done) {
  const out = [];
  if (done[0] && done[1]) out.push('choosing sensors, and writing and debugging a robot arm program with a repeat');
  else if (done[0]) out.push('choosing sensors and following a robot’s sense, think, act loop');
  if (done[2]) out.push('writing “if … then” safety rules for a robot and putting them in order');
  if (done[3] && done[4]) out.push('training a robot by example, and setting how sure it must be before it acts');
  else if (done[3]) out.push('training a robot by example and testing it on things it had not seen');
  if (done[5]) out.push('designing a rescue robot, testing it in a simulation and improving it');
  return out.slice(0, 4);
}
export function hourRecord(prog, j) {
  const lines = []; for (let m = 1; m <= 6; m++) if (prog.done[m - 1]) lines.push(missionLine(m, prog.sum[m], j));
  return { title: 'My robots at work', lines: lines.slice(0, 6), practised: practisedLines(prog.done) };
}
// The picture for the take-home page: the six missions, each with a small drawing and a tick. Inline SVG, no script.
const GLYPH = [
  '<rect x="-16" y="-10" width="22" height="20" rx="4" fill="#16c79a" stroke="#3b2a1e" stroke-width="2"/><path d="M10 -8c5 4 5 12 0 16M15 -12c8 7 8 17 0 24" fill="none" stroke="#1f6fd0" stroke-width="2.5" stroke-linecap="round"/>',
  '<path d="M-18 14h36" stroke="#3b2a1e" stroke-width="3"/><path d="M-12 14v-18l14-6l8 8" fill="none" stroke="#8d98a3" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 -2v8" stroke="#3b2a1e" stroke-width="3"/><path d="M10 8c-6-4-8 2-4 4c3 1 4-1 4-4z" fill="#5fa85a"/>',
  '<rect x="-18" y="-14" width="36" height="28" rx="4" fill="#fff" stroke="#3a6fc9" stroke-width="2.5"/><path d="M-3 -8h6v5h5v6h-5v5h-6v-5h-5v-6h5z" fill="#d9533d"/>',
  '<path d="M-14 -8h28l-3 22h-22z" fill="#2e9b5a" stroke="#3b2a1e" stroke-width="2"/><rect x="-16" y="-13" width="32" height="6" rx="2" fill="#1f7a44" stroke="#3b2a1e" stroke-width="2"/><path d="M-4 0a5 5 0 1 0 6 2" fill="none" stroke="#fff" stroke-width="2.4"/>',
  '<path d="M0 14v-14" stroke="#3a8a3a" stroke-width="3"/><path d="M0 2c-12-6-14 4-6 6zM0 -2c10-10 16 0 8 4z" fill="#5fa85a" stroke="#3b2a1e" stroke-width="1.6"/><circle cx="12" cy="-10" r="5" fill="#f2c531" stroke="#3b2a1e" stroke-width="1.6"/>',
  '<path d="M-20 6c6-4 10 4 16 0s10-4 16 0s8 4 8 4v8h-40z" fill="#7fc3e6"/><rect x="-12" y="-10" width="22" height="14" rx="4" fill="#16c79a" stroke="#3b2a1e" stroke-width="2"/><rect x="-14" y="2" width="26" height="6" rx="3" fill="#3b4656"/>',
];
const SHORT = ['Sensors', 'Robot arm', 'Hospital rules', 'Recycling', 'Weeding', 'Flood rescue'];
export function hourPicture(done) {
  const tile = (i) => { const x = 14 + (i % 3) * 112; const y = 46 + Math.floor(i / 3) * 86; const ok = !!done[i];
    return `<g transform="translate(${x} ${y})"><rect width="104" height="78" rx="10" fill="${ok ? '#e3f4e9' : '#f3e9d2'}" stroke="${ok ? '#1f7a44' : '#d7bf95'}" stroke-width="2"/><g transform="translate(52 30)">${GLYPH[i]}</g><text x="52" y="66" font-size="12" font-weight="800" text-anchor="middle" fill="#3b2a1e">${SHORT[i]}</text>${ok ? '<circle cx="92" cy="12" r="9" fill="#1f7a44"/><path d="M87.5 12l3 3l5-6" stroke="#fff" stroke-width="2.4" fill="none"/>' : ''}</g>`; };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 230" font-family="Inter, system-ui, sans-serif" role="img" aria-label="Robots at work: ${done.filter(Boolean).length} of 6 missions done"><rect width="360" height="230" rx="14" fill="#fffaf0"/><text x="180" y="28" font-size="15" font-weight="800" text-anchor="middle" fill="#3b2a1e">Robots at work: six jobs</text>${[0, 1, 2, 3, 4, 5].map(tile).join('')}</svg>`;
}
export const ruleWords = (cond, act, j) => `If ${CONDS[cond][j ? 'j' : 's'].toLowerCase()}: ${ACTS[act][j ? 'j' : 's'].toLowerCase()}`;
