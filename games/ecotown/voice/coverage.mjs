// How much of what the game said had a recording: reads speech logs (said.json files, from run.mjs or said-hook.mjs)
// and looks up every sentence in game/voice/pack-<band>.json, by the same key the game uses. A log whose file name
// has "senior" in it is checked against the senior pack, any other against the junior pack. Lines read aloud with
// read-aloud off (ages 13–17 start with it off) are counted too: they are what the child hears once it is on.
// Usage: node voice/coverage.mjs <said.json ...> [--missing]     (--missing lists the sentences with no recording)
import fs from 'fs';
import path from 'path';
import { sentences, keyOf } from '../game/js/ui/voice.js';
const here = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2); const list = args.includes('--missing'); const files = args.filter((a) => !a.startsWith('--'));
const packs = {};
const pack = (band) => (packs[band] ||= new Set(JSON.parse(fs.readFileSync(path.join(here, '..', 'game', 'voice', `pack-${band}.json`), 'utf8')).clips.map((c) => c[0])));
const live = (s) => /\d/.test(s); // a sentence with a live number may stay unrecorded
const all = { n: 0, have: 0, nNum: 0, haveNum: 0 };
for (const f of files) {
  const band = /senior/.test(path.basename(f)) ? 'senior' : 'junior'; const P = pack(band);
  const said = JSON.parse(fs.readFileSync(f, 'utf8')).filter((x) => x.voice === 'narrator' || x.voice === 'helper');
  const c = { n: 0, have: 0, nNum: 0, haveNum: 0 }; const miss = new Map();
  for (const x of said) for (const s of sentences(x.text)) {
    const ok = P.has(keyOf(s, x.voice)); const num = live(s);
    c.n++; if (ok) c.have++; if (!num) { c.nNum++; if (ok) c.haveNum++; }
    if (!ok) miss.set(`${x.voice === 'helper' ? 'F' : 'N'} ${s}`, (miss.get(`${x.voice === 'helper' ? 'F' : 'N'} ${s}`) || 0) + 1);
  }
  for (const k of Object.keys(all)) all[k] += c[k];
  const pc = (a, b) => (b ? ((100 * a) / b).toFixed(1) + ' %' : '–');
  console.log(`${path.basename(f).padEnd(24)} ${band.padEnd(6)} sentences ${String(c.n).padStart(5)}  recorded ${pc(c.have, c.n).padStart(7)}  without numbers ${String(c.nNum).padStart(5)}  recorded ${pc(c.haveNum, c.nNum).padStart(7)}`);
  if (list) for (const [s, k] of miss) console.log(`    ${k > 1 ? `×${k} ` : ''}${s}`);
}
if (files.length > 1) { const pc = (a, b) => (b ? ((100 * a) / b).toFixed(1) + ' %' : '–'); console.log(`${'all'.padEnd(31)} sentences ${String(all.n).padStart(5)}  recorded ${pc(all.have, all.n).padStart(7)}  without numbers ${String(all.nNum).padStart(5)}  recorded ${pc(all.haveNum, all.nNum).padStart(7)}`); }
