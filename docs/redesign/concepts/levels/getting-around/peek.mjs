// A quick look at one step of the "Getting around" level, without playing the steps before it: node peek.mjs <out folder> <width> <height> <step> <plan> <paths word> <park word>
// step "play" jumps to the play break of the plan and lets Florence's own way be shown; "town" goes on to the town; "try" then tries another plan; "end" goes on to the last walk. It is for checks only.
import { openLevel } from '../../level-kit/record.mjs';
const [out = 'pictures/peek', width = 1440, height = 810, step = 'play', plan = 2, a = 1, b = 2] = process.argv.slice(2);
const r = await openLevel({ page: 'concepts/levels/getting-around/index.html', out, width, height, speed: 4 }), { shot, click, has } = r;
await r.p.evaluate(([plan, a, b]) => { const t = window.trial; t.S.words = [a, b]; t.cur.words([a, b]); t.cur.words([undefined, undefined]); t.cur.style = a; t.cur.park = b; t.choose(plan); }, [+plan, +a, +b]);
await r.pause(4000); await shot(`play-${plan}-${a}${b}`, 1500);
if (step !== 'play') { await click('Show me one way'); await has('Next'); await shot(`shown-${plan}-${a}${b}`, 6000); await click('Next'); await has('Try another plan'); await shot(`town-${plan}-${a}${b}`, 3000); }
if (step === 'try') { await click('Try another plan'); await shot('other-plans', 1200); await r.usePlan(plan == 2 ? 0 : 2); await shot('what-changed', 3000); }
if (step === 'end') { await click('Next'); await shot('recap', 2500); await r.tap('panel', 2); await shot('recap-answer', 900); await click('Next'); await shot('end-1', 3000); await shot('end-2', 3000); await shot('end-3', 8000); }
await r.close();
