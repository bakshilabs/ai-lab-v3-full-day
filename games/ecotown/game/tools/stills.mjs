// Renders the start page's still pictures (img/home/<shot>-wide.webp 1600 x 1000 and <shot>-tall.webp 780 x 1400) from the island itself,
// so the picture shown while the live island loads is the same island. Run after any change to js/home/island.js:
//   cd games/ecotown/game && python3 -m http.server 8765 &   node tools/stills.mjs http://localhost:8765/ [outDir]
// The pictures are PNG first; they are turned into WebP with Pillow (python3) to keep their transparent sky.
import { createRequire } from 'module'; import { execFileSync } from 'child_process'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const [base = 'http://localhost:8765/', outArg] = process.argv.slice(2);
const out = outArg || new URL('../img/home/', import.meta.url).pathname; const tmp = fs.mkdtempSync('/tmp/stills-');
const SHOTS = ['hero', 'town', 'drone', 'robots', 'roads', 'film', 'power'];
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [kind, w, h] of [['wide', 1600, 1000], ['tall', 780, 1400]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  for (const shot of SHOTS) {
    await p.goto(`${base}tests/visual/stills.html?shot=${shot}&tall=${kind === 'tall' ? 1 : 0}`); await p.waitForFunction(() => window.stillReady, null, { timeout: 120000 }); await p.waitForTimeout(500);
    const png = path.join(tmp, `${shot}-${kind}.png`); await p.screenshot({ path: png, omitBackground: true });
    execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).save(sys.argv[2], quality=86, method=6)', png, path.join(out, `${shot}-${kind}.webp`)]);
    console.log(`${shot}-${kind}.webp`);
  }
  await p.close();
}
await b.close();
