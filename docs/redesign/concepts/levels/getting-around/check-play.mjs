// Checks, with Node, that the pieces which play.mjs lays for the park plan really fit and join every home: node check-play.mjs
import { newBoard, lay, lift, homes, stock, key, N } from './board.js';
export const PARK = [['fork', 3, 0], ['straight', 2, 0], ['fork', 1, 0], ['bend', 0, 0], ['straight', 4, 0], ['straight', 5, 0], ['bend', 6, 0]];
const b = newBoard(2, true), left = stock(2, true), PIC = { '1010': '│', '0101': '─', '1100': '└', '0110': '┌', '0011': '┐', '1001': '┘', '1101': '┴', '1110': '├', '0111': '┬', '1011': '┤', '1111': '┼' };
const show = () => { for (let r = N - 1; r >= 0; r--) { let s = ''; for (let c = 0; c < N; c++) { const p = b.cells[key(c, r)], t = b.ground[key(c, r)]; s += p ? (PIC[p.sides.map((v) => +v).join('')] || '?') : t === 'tree' ? 'T' : t === 'stream' ? '~' : t === 'bridge' ? '=' : '.'; } console.log('   ' + s); } };
const steps = JSON.parse(process.argv[2] || 'null') || PARK;
for (const [kind, c, r] of steps) { const ok = kind === 'lift' ? lift(b, c, r) : lay(b, c, r, kind); console.log(kind, c, r, ok ? 'ok' : 'DOES NOT FIT'); if (ok && kind !== 'lift') left[kind]--; if (typeof ok === 'string') left[ok]++; }
show(); console.log(homes(b).map((h) => `${h.id}:${h.joined ? h.steps : '-'}`).join(' '), JSON.stringify(left));
