// What the recording scripts share for the play break: pressing a square, and drawing a path by pressing one square and dragging through others.
// A square is given as [column, row]: column 0 is at the left of the picture, and row 0 is beside the shops.
export function drawer(r) { const N = 7;
  const at = (c, row) => r.p.evaluate(([c, row]) => { const rect = document.getElementById('c').getBoundingClientRect(); return window.trialProject(...window.trial.cur.spot('cell', c + row * 7), rect); }, [c, row]);
  const tool = (name) => r.p.evaluate((k) => [...document.querySelectorAll('.tok')].find((b) => b.textContent.startsWith(k)).click(), name);
  // presses the first square and drags through the others, then lets go
  // The recording machine can take seconds to draw one picture, and the browser then joins several movements of the mouse into one. So the script waits until the page
  // has drawn twice after every movement, which makes sure that the page has seen it
  const seen = () => r.p.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
  // presses the first square and drags through the others, then lets go
  const drag = async (cells) => { const pts = []; for (const [c, row] of cells) pts.push(await at(c, row)); await r.p.mouse.move(...pts[0]); await seen(); await r.p.mouse.down(); await seen(); for (const q of pts.slice(1)) { await r.p.mouse.move(...q, { steps: 2 }); await seen(); } await r.p.mouse.up(); await seen(); };
  const tap = async (c, row) => { const q = await at(c, row); await r.p.mouse.move(...q); await seen(); await r.p.mouse.down(); await seen(); await r.p.mouse.up(); await seen(); };
  const state = () => r.p.evaluate(() => window.trial.cur.playState());
  return { at, tool, drag, tap, state, N }; }

// What the child does on the board of the paths through the park in the recorded path. d is the drawer above; shot, say and has come from the script that records
export async function parkPlay(d, shot, say, has) {
  // one drag joins the two near homes on the left, and a second the two on the right
  await d.drag([[3, 0], [0, 0], [0, 2]]); await shot('play-first-drag', 1200); await d.drag([[3, 0], [6, 0], [6, 2]]); await shot('play-near-homes', 2500);
  // the child tries to go straight on through the old oak
  await d.tap(3, 1); await shot('play-old-tree', 500);
  // the one bridge goes on the left first
  await d.tool('Bridge'); await shot('play-bridge-places', 600); await d.tap(1, 3); await shot('play-bridge-left', 900);
  await d.drag([[1, 0], [1, 4], [0, 4]]); await d.drag([[1, 4], [1, 6], [0, 6]]); await shot('play-far-left', 2500);
  await d.drag([[1, 4], [5, 4], [5, 6], [6, 6]]); await d.drag([[5, 4], [6, 4]]); await has('Next'); await shot('play-all-joined-bridge-left', 3000); await say('bridge on the left');
  // Gran's walk is long, so the child moves the bridge to her side
  await d.tool('Bridge'); await shot('play-bridge-move', 600); await d.tap(5, 3); await shot('play-bridge-right', 900);
  await d.drag([[5, 0], [5, 2]]); await has('Next'); await shot('play-all-joined-bridge-right', 3000); await say('bridge on the right');
  // the two squares that led to the old place of the bridge are not needed any more
  await d.tool('Take back'); await d.tap(1, 2); await d.tap(1, 1); await shot('play-taken-back', 600); await d.tool('Paving');
}
