// Pilot capture: the first 15 minutes of Eco Town for ages 8–12 (the welcome, the start screen, the intro, mission 1
// "Land" in Florence's town, the "your turn" step and Florence's invitation to the Travel mission), step by step.
// At each step it saves a screenshot, the text visible on screen, text that appeared (and maybe went) since the last
// step, and every line spoken or floated. Facts for the intent pass; it writes no wording.
// Usage: node tools/text/pilot/capture.cjs <baseUrl> <outDir> [width height]
const fs = require('fs');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const [base = 'http://localhost:8797/', out = 'pilot-shots', W = 1366, H = 768] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H } });
  await p.addInitScript(() => {
    window.__sayLog = []; window.__seen = [];
    try { localStorage.setItem('ecotown.prefs', JSON.stringify({ quality: 'low' })); } catch { /* */ }
    // every line of text that shows on screen, with when it first showed (catches messages that come and go)
    const known = new Set();
    setInterval(() => { const t = document.body?.innerText || ''; for (const l of t.split('\n').map((x) => x.trim()).filter(Boolean)) if (!known.has(l)) { known.add(l); window.__seen.push({ l, at: Date.now() }); } }, 200);
  });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const steps = []; let n = 0, seenAt = 0, saidAt = 0;
  const shot = async (name, note = '') => {
    await p.waitForTimeout(600);
    const file = `${String(++n).padStart(2, '0')}-${name}.png`;
    await p.screenshot({ path: `${out}/${file}` });
    const st = await p.evaluate(([s0, k0]) => {
      const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
      const labels = [...document.querySelectorAll('[aria-label],[title]')].filter(vis).map((el) => ({ tag: el.tagName.toLowerCase(), id: el.id || el.closest('[id]')?.id || '', aria: el.getAttribute('aria-label') || '', title: el.getAttribute('title') || '' }));
      // visible text by its panel (#florence, #modal, #dock, #strip, #build, #alert, #toast …)
      const panels = [...document.querySelectorAll('body [id]')].filter((el) => el.id && vis(el) && el.innerText && !el.parentElement.closest('[id]:not(body)')).map((el) => ({ id: el.id, text: el.innerText.trim() })).filter((x) => x.text);
      return { visible: (document.body.innerText || '').split('\n').map((x) => x.trim()).filter(Boolean), panels, labels,
        appeared: window.__seen.slice(s0).map((x) => x.l), said: window.__sayLog.slice(k0), seenLen: window.__seen.length, saidLen: window.__sayLog.length };
    }, [seenAt, saidAt]);
    seenAt = st.seenLen; saidAt = st.saidLen; delete st.seenLen; delete st.saidLen;
    steps.push({ n, name, file, note, url: p.url(), ...st });
    fs.writeFileSync(`${out}/steps.json`, JSON.stringify(steps, null, 1));
    console.log(file, '|', st.appeared.length, 'new lines,', st.said.length, 'said');
  };
  const click = async (sel, t = 30000) => { await p.waitForSelector(sel, { state: 'visible', timeout: t }); await p.click(sel); };
  const A = '#dock [data-actions] ';
  // story films: a picture of the film, then Skip (their script is the films' own and is not rewritten in this pilot)
  await p.addLocatorHandler(p.locator('#episode [data-skip]'), async (skip) => { await p.waitForTimeout(6000); await shot('story-film', 'a story film (episodes.js), skipped after 6 s'); await skip.click(); });

  // 1. the welcome (start page → "Start the day")
  await p.goto(base + 'index.html?welcome=1');
  await p.waitForSelector('[data-play]', { timeout: 120000 }); await shot('welcome-card', 'the welcome, before the film');
  await p.click('[data-play]');
  for (let i = 0; i < 12; i++) {
    // the scenes move on by themselves after a few seconds: read the button first, then take the picture and press Next
    const r = await p.waitForSelector('[data-next], [data-start]', { timeout: 30000 }).catch(() => null); if (!r || await p.$('[data-start]')) break;
    const last = /around/.test(await r.textContent().catch(() => ''));
    await shot(`welcome-scene-${i + 1}`, 'a scene of the welcome film');
    await p.click('[data-next]', { timeout: 3000 }).catch(() => {}); await p.waitForTimeout(700); if (last) break;
  }
  await p.waitForSelector('[data-start]', { timeout: 30000 }); await shot('welcome-guide', 'how to get around each part');
  await p.click('[data-start]');

  // 2. the game's start screen: age, then the town's name
  await p.waitForSelector('[data-band="junior"]', { timeout: 120000 }); await shot('start', 'the game’s start screen');
  await click('[data-band="junior"]'); await p.waitForSelector('[data-name]', { timeout: 30000 }); await shot('name', 'naming the town (ages 8–12)');
  await click('[data-name]'); await p.fill('[data-name]', 'Otter Bend'); await click('[data-go]');

  // 3. the intro, beat by beat; it ends at the AI Lab door and starts mission 1
  for (let i = 0; i < 8; i++) {
    const r = await p.waitForSelector('#florence:not(.hide) [data-next]', { timeout: 150000 }).catch(() => null); if (!r) break;
    await shot(`intro-${i + 1}`, 'an intro beat'); const label = await p.textContent('#florence [data-next]');
    await p.click('#florence [data-next]').catch(() => {}); await p.waitForTimeout(900);
    if (/AI Lab/.test(label)) break;
  }

  // 4. mission 1, Land, in Florence's town
  await click('#modal:not(.hide) [data-act="go"]', 150000).catch(async () => { await shot('no-brief-card'); throw new Error('no brief card'); });
  await p.waitForTimeout(800); await p.waitForSelector('#dock:not(.hide) [data-actions] h3', { timeout: 60000 });
  await shot('mission-instruct', 'the instruction tray, as it opens');
  await click(A + '[data-m="cards"]'); await shot('mission-cards', 'the instruction cards');
  await click(`${A}[data-card="0"]`); await p.waitForTimeout(2500); await shot('mission-plan', 'Florence’s plan from the vague instruction');
  await click(`${A}[data-c="flood"]`); await p.waitForSelector('#alert:not(.hide)', { timeout: 30000 }); await shot('mission-check-flood', 'the flood lens on her plan');
  await click(A + '[data-go]'); await p.waitForTimeout(1500); await shot('mission-habit', 'why did it go wrong?');
  const habit = await p.evaluate(() => window.__eco.app.__expectHabit);
  await click(`${A}[data-h="${habit}"]`); await p.waitForTimeout(2200); await shot('mission-retry', 'after naming the habit');
  await p.waitForSelector('#dock:not(.hide) [data-actions] h3', { timeout: 30000 });
  if (await p.$(A + '[data-m="cards"]')) await click(A + '[data-m="cards"]');
  await click(`${A}[data-card="1"]`); await p.waitForTimeout(2500); await shot('mission-plan-clear', 'her plan from the clearer instruction');
  await p.waitForSelector('#filmtitle', { timeout: 60000 }).then(async () => { await p.waitForTimeout(4000); await shot('mission-build-film', 'the build film in her town'); }).catch(() => {});
  for (let i = 0; i < 6; i++) {
    const m = await p.waitForSelector('#modal:not(.hide) [data-act]', { timeout: 400000 });
    const act = await m.getAttribute('data-act');
    if (act === 'go' && await p.$('#modal:not(.hide) .stars3')) { await shot('mission-reward', 'the reward card'); await click('#modal:not(.hide) [data-act="go"]'); break; }
    await shot(`mission-card-${i + 1}`, 'a card after the mission'); await m.click(); await p.waitForTimeout(600);
  }

  // 5. back in the child's town: both towns, Florence's advice, the "your turn" step
  await p.waitForSelector('#build [data-cat]', { timeout: 90000 });
  await p.waitForTimeout(1500); await shot('both-towns', 'both towns after the mission (to be a split screen)');
  await p.waitForSelector('#towns [data-tv="mine"][aria-pressed="true"]', { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(1500); await shot('your-turn', 'Land is open in the child’s town');
  const town = () => p.evaluate(() => JSON.stringify([...window.__eco.app.G.cells].filter(([, c]) => c.item || c.mark).sort()));
  const tapPoint = (k) => p.evaluate((key) => { const { app } = window.__eco; const v = app.world.tileTop(key).project(app.stage.camera); const r = app.stage.renderer.domElement.getBoundingClientRect(); const x = r.left + ((v.x + 1) / 2) * r.width, y = r.top + ((1 - v.y) / 2) * r.height; return document.elementFromPoint(x, y) === app.stage.renderer.domElement ? { x, y } : null; }, k);
  for (let i = 0, taps = 0; i < 30; i++) {
    const h = await p.evaluate(() => window.__eco.app.G.hint());
    if (h.mission === 'move' || !h.unlock) break;
    if (!h.tool || !h.spots.length) { await shot('no-hint'); break; }
    await p.evaluate((t) => window.__eco.app.G.showWhere?.(t), h.tool); await p.waitForTimeout(400);
    if (taps === 0) await shot('your-turn-tool', 'the build picked, with the good spots');
    const pt = await tapPoint(h.spots[0]); const before = await town();
    if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(500); }
    if (before === (await town())) await p.evaluate(([k, t]) => window.__eco.app.G.act(k, t), [h.spots[0], h.tool]);
    taps++; if (taps % 2 === 1) await shot(`your-turn-tap-${taps}`, `after build tap ${taps}`);
  }
  await p.waitForTimeout(1500); await shot('your-turn-done', 'the step that opens the next mission is done');
  // 6. Florence's invitation to the Travel mission
  await p.waitForSelector('#florence:not(.hide) [data-tiplab]', { timeout: 120000 }).then(() => shot('travel-invite', 'Florence’s invitation to mission 2')).catch(() => shot('travel-invite-missing'));
  fs.writeFileSync(`${out}/errors.json`, JSON.stringify(errors, null, 1));
  console.log('steps', steps.length, 'errors', errors.length);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
