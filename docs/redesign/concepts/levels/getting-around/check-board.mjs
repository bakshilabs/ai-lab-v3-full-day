// Checks the rules of the board with Node: node check-board.mjs
// It prints Florence's drawing of each plan, how far each family walks, how many walk for each kind of path the child can ask for, and plays the park board through by itself.
import { N, key, GATES, SHOP, florence, homes, walkers, stock, newBoard, places, lay, turn, keptTrees, LIMIT } from './board.js';
const PIC = { '1010': '│', '0101': '─', '1100': '└', '0110': '┌', '0011': '┐', '1001': '┘', '1101': '┴', '1110': '├', '0111': '┬', '1011': '┤', '1111': '┼' };
const show = (b) => { for (let r = N - 1; r >= 0; r--) { let s = ''; for (let c = 0; c < N; c++) { const p = b.cells[key(c, r)], t = b.ground[key(c, r)]; s += p ? (PIC[p.sides.map((v) => +v).join('')] || '?') : t === 'tree' ? 'T' : t === 'stream' ? '~' : t === 'bridge' ? '=' : t === 'off' ? ' ' : '.'; } console.log('   ' + s); } };
let bad = 0; const must = (ok, what) => { if (!ok) { bad++; console.log('WRONG:', what); } };
for (const parkMid of [true, false]) for (const plan of [0, 1, 2]) {
  const b = florence(plan, parkMid), h = homes(b);
  console.log(`plan ${plan}, park ${parkMid ? 'in the middle' : 'elsewhere'}: trees kept ${keptTrees(plan, parkMid).length}, pieces given ${JSON.stringify(stock(plan, parkMid))}`); show(b);
  console.log('   steps', h.map((x) => `${x.id}:${x.steps}`).join(' '), '| walkers for winding, direct, busy road:', [0, 1, 2].map((s) => walkers(b, s).filter(Boolean).length).join(', '));
  must(h.every((x) => x.joined), 'every home is joined in Florence\'s drawing');
}
must(walkers(florence(2, true), 1).every(Boolean), 'everyone walks in the park plan with direct paths');
must(walkers(florence(0, true), 1).every(Boolean), 'everyone walks in the grid with direct paths');
must(!walkers(florence(1, true), 1).every(Boolean), 'somebody drives in the loop');
// the park plan, with the bridge on the other side
for (const at of [2, 4]) { const b = florence(2, true, at); console.log(`park plan, bridge in column ${at}:`); show(b); console.log('   steps', homes(b).map((x) => `${x.id}:${x.steps}`).join(' ')); must(walkers(b, 1).every(Boolean), `everyone walks with the bridge in column ${at}`); }
// a child who always takes the first yellow square: can the board be finished with the pieces given? It tries the kinds in turn and swaps a piece when nothing else fits
for (const plan of [0, 1, 2]) { const b = newBoard(plan, true), left = stock(plan, true); let moves = 0;
  while (homes(b).some((h) => !h.joined) && moves < 200) { let done = false;
    for (const kind of ['fork', 'straight', 'bend', 'bridge']) { if (!left[kind]) continue; const empty = places(b, kind).filter((k) => !b.cells[k]); if (!empty.length) continue; const k = empty[moves % empty.length]; lay(b, k % N, Math.floor(k / N), kind); left[kind]--; done = true; break; }
    if (!done) break; moves++; }
  console.log(`a careless child on plan ${plan}: ${moves} pieces laid, homes joined ${homes(b).filter((h) => h.joined).length} of 10, left ${JSON.stringify(left)}`); show(b); }
console.log(bad ? `${bad} things are wrong` : 'All the checks passed.', 'Limits:', LIMIT.join(', '));
