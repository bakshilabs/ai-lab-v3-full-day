// Checks the rules of the board with Node: node check-board.mjs
// It prints Florence's drawing of each plan, how far each family walks, how many walk for each kind of path the child can ask for,
// and then finds the least paving that joins every home on each board, for each place the bridge can go.
import { N, key, cOf, rOf, GATES, SHOP, BRIDGES, STREAM_R, florence, homes, walkers, stock, newBoard, pave, setBridge, frontier, keptTrees, LIMIT, limitOf } from './board.js';
const PIC = { '1010': '│', '0101': '─', '1100': '└', '0110': '┌', '0011': '┐', '1001': '┘', '1101': '┴', '1110': '├', '0111': '┬', '1011': '┤', '1111': '┼', '1000': '╵', '0100': '╶', '0010': '╷', '0001': '╴' };
const show = (b) => { for (let r = N - 1; r >= 0; r--) { let s = ''; for (let c = 0; c < N; c++) { const p = b.cells[key(c, r)], t = b.ground[key(c, r)]; s += p ? (PIC[p.sides.map((v) => +v).join('')] || '?') : t === 'tree' ? 'T' : t === 'stream' ? '~' : t === 'bridge' ? '=' : t === 'off' ? ' ' : '.'; } console.log('   ' + s); } };
let bad = 0; const must = (ok, what) => { if (!ok) { bad++; console.log('WRONG:', what); } };
for (const parkMid of [true, false]) for (const plan of [0, 1, 2]) {
  const b = florence(plan, parkMid), h = homes(b);
  console.log(`plan ${plan}, park ${parkMid ? 'in the middle' : 'elsewhere'}: trees kept ${keptTrees(plan, parkMid).length}, given ${JSON.stringify(stock(plan))}`); show(b);
  console.log('   steps', h.map((x) => `${x.id}:${x.steps}`).join(' '), '| walkers for winding, direct, busy road:', [0, 1, 2].map((s) => walkers(b, s).filter(Boolean).length).join(', '));
  must(h.every((x) => x.joined), 'every home is joined in Florence\'s drawing');
}
for (const st of [0, 1, 2]) for (const mid of [true, false]) must(walkers(florence(2, mid), st).every(Boolean) && keptTrees(2, mid).length === 10, 'the third plan is good on both checks whatever the child asks for');
must(walkers(florence(0, true), 1).every(Boolean), 'everyone walks in the grid with direct paths');
must(!walkers(florence(1, true), 1).every(Boolean), 'somebody drives in the loop');
must(keptTrees(0, true).length <= 3, 'the grid loses most of the old trees');
// a child who draws greedily: always the frontier square that is nearest to a home which is not joined yet. How much paving does that take?
const dist = (a, k) => Math.abs(cOf(a) - cOf(k)) + Math.abs(rOf(a) - rOf(k));
for (const plan of [0, 1, 2]) for (const col of plan === 2 ? BRIDGES : plan === 1 ? [0, 6] : [-1]) { const b = newBoard(plan, true); let n = 0; if (col >= 0) setBridge(b, key(col, STREAM_R));
  while (homes(b).some((h) => !h.joined) && n < 60) { const open = homes(b).filter((h) => !h.joined).map((h) => key(h.c, h.r)), f = frontier(b); if (!f.length) break; f.sort((p, q) => Math.min(...open.map((o) => dist(p, o))) - Math.min(...open.map((o) => dist(q, o)))); pave(b, f[0]); n++; }
  const h = homes(b), far = Math.max(...h.map((x) => x.steps ?? 99)), gran = h.find((x) => x.gran).steps;
  console.log(`a greedy child on plan ${plan}${col >= 0 ? `, bridge in column ${col}` : ''}: ${n} squares of paving (given ${stock(plan).pave}), joined ${h.filter((x) => x.joined).length} of 10, Gran walks ${gran + 1} squares, the longest walk is ${far + 1}, limit ${limitOf(plan, 1) + 1}`); show(b);
  must(h.every((x) => x.joined), 'the greedy child joins every home'); }
console.log(bad ? `${bad} things are wrong` : 'All the checks passed.', 'Limits:', LIMIT.join(', '));
