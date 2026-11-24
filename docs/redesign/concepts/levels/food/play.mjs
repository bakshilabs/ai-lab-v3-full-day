// Plays the Food level through and saves a picture of every step.
//   node play.mjs <out dir> <width> <height> <plan> <second plan or -1>
// plan is the plan that the child chooses (0 the community gardens, 1 the big farm far away, 2 the indoor farm).
// If a second plan is given, the script also presses "Try another plan". RECORD_STOP=3 stops after three pictures, for a quick look.
//
// The recording machine is shared and can take several seconds to draw one picture, so the script gives the page a clock of its own: every
// picture that the page draws moves the page's time on by STEP milliseconds (300 unless STEP is set). The animations therefore play the same
// way however slow the machine is, and each picture catches the moment it is named after. The times that the helper prints at the end mean nothing here.
import { openLevel } from '../../level-kit/record.mjs';
const [out = 'pictures/run', width = 1440, height = 810, plan = 2, other = -1] = process.argv.slice(2), P = +plan, STEP = +(process.env.STEP || 300);
const r = await openLevel({ page: 'concepts/levels/food/index.html', out, width: +width, height: +height }), { shot, click, has, tap, p } = r;
p.setDefaultTimeout(600000);
await p.evaluate((step) => { let v = performance.now(), last = -1; const raf = window.requestAnimationFrame.bind(window); performance.now = () => v; window.vpause = false;
  window.requestAnimationFrame = (fn) => raf((t) => { if (t !== last) { last = t; if (!window.vpause) v += step; } fn(v); }); window.vnow = () => v; }, STEP);
// The script saves its pictures by itself and tries again if the busy machine takes too long, because the helper gives up after three minutes
let shots = 0; const save = async (name) => { const file = `${out}/${String(++shots).padStart(2, '0')}-${name}.jpg`; for (let k = 0; ; k++) { try { await p.screenshot({ path: file, type: 'jpeg', quality: 82, timeout: 600000 }); break; } catch (e) { if (k >= 3) throw e; } } console.log(name); if (shots >= +(process.env.RECORD_STOP || 999)) { await r.close(); process.exit(0); } };
const until = (fn, arg) => p.waitForFunction(fn, arg, { timeout: 900000 });
const vwait = async (sec) => { const t = await p.evaluate(() => window.vnow()); await until((t1) => window.vnow() >= t1, t + sec * 1000); };   // waits in the page's own time
// the page's time stands still while a picture is taken, so that the picture shows the moment it is named after
const snap = async (name, sec = 0.6) => { await vwait(sec); await p.evaluate(() => { window.vpause = true; }); await p.waitForTimeout(400); await save(name); await p.evaluate(() => { window.vpause = false; }); };
// waits until the test, or the play break, has reached a moment or gone past it
const PH = ['go0', 'first0', 'boxes0', 'autumn', 'winter', 'go1', 'first1', 'boxes1'], ST = ['crops', 'place', 'a', 'b', 'pick', 'off'];
const phase = (name) => until(([l, n]) => l.indexOf(window.trial.cur.phase) >= l.indexOf(n), [PH, name]), stage = (name) => until(([l, n]) => l.indexOf(window.trial.cur.stage) >= l.indexOf(n), [ST, name]);
// the words of the sample child, which are nearest to the plan it will choose, and the crops and places it uses
const WORD = [['inside the town', 'outdoors in the soil'], ['far away, where there is lots of land', 'outdoors in the soil'], ['inside the town', 'indoors under lights']][P];
const CROP = ['tomato', 'lettuce', 'strawberry'], SLOT = [[0, 2, 4, 5, 7, 6], [0, 1, 3, 4, 6, 7], [0, 2, 3, 5, 7, 8]][P];
await snap('job', 1.5); await tap('family'); await snap('job-family-hops', 0.3); await click('Start'); await snap('ask', 1.5); await click(WORD[0]); await snap('ask-word-1', 0.6); await click(WORD[1]); await snap('ask-word-2', 0.6);
await click('Ask Florence'); await snap('plans-nearest', 1.5); await has('Take the food to market'); await snap('plans', 0.6); await tap('garden'); await snap('plans-tap-gardens', 0.4);
await click('Take the food to market'); await snap('test-summer-far', 2.4); await phase('first0'); await snap('test-summer-first', 0.3); await tap('stall', 0); await snap('test-tap-crate', 0.3);
await snap('test-summer-lorry', 1.2); await phase('boxes0'); await snap('test-summer-boxes', 0.3); await phase('autumn'); await snap('test-autumn', 2.4); await phase('winter'); await snap('test-winter-snow', 3);
await phase('go1'); await snap('test-winter-far', 2.4); await phase('first1'); await snap('test-winter-first', 0.3); await phase('boxes1'); await snap('test-winter-boxes', 0.3);
await has('Ask again'); await snap('results', 1.2); await r.usePlan(P); await stage('crops'); await snap('break-crops', 0.3);
for (const c of CROP) await p.click(`[data-crop="${c}"]`); await snap('break-crops-chosen', 0.3); await click('Grow these'); await snap('break-places', 0.6);
for (const [n, i] of SLOT.entries()) { await tap('slot', i); await vwait(0.6); if (n === 1 || n === 4) await snap(`break-placed-${n + 1}`, 0); }
await stage('a'); await snap('break-a', 0.3); await tap('a'); await snap('break-a-doing', 1.5);
if (P !== 0) { await stage('b'); await snap('break-b', 0.3); await tap('b'); await snap('break-b-doing', 1.6); }
if (P !== 1) { await stage('pick'); await snap('break-ripe', 0.3); for (const [n, i] of SLOT.entries()) { await tap('slot', i); await vwait(0.3); if (n === 2) await snap('break-picking', 0); } await stage('off'); await snap('break-off', 1.2); await snap('break-delivery', 4); }
else { await stage('off'); await snap('break-lorry', 6); }
await has('Next'); await snap('break-done', 0.6); await click('Next'); await has('Try another plan'); await snap('town', 1.2);
if (+other >= 0) { await click('Try another plan'); await snap('other-plans', 1); await r.usePlan(+other); await snap('what-changed', 2.2); await click('Go back to my first plan'); await snap('first-kept', 2.2); }
await click('Next'); await snap('recap', 3.6); await tap('answer', 2); await snap('recap-answer', 0.6); await click('Next'); await snap('end', 6.5); await r.close();
