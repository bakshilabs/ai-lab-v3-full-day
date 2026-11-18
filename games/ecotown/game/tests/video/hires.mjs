// Shared by the film recorders (episodes.mjs, record.mjs, tools/trailer.mjs): a page laid out at the films' design
// size (960 × 540 CSS pixels, so captions, labels and cards keep their size in the picture) but drawn at the output
// size times a supersampling factor. The frames are then scaled down with lanczos, which smooths the voxel edges
// (the post-processing composer has no multisampling of its own).
// The game caps the drawing-buffer ratio at 2 (stage.js, tier 'high'). For recording only, the copy of stage.js
// served to this page has that cap raised; the live game is never changed.
export const CSS_W = 960, CSS_H = 540;
export function scaleFor(w, ss = 1) { return (w / CSS_W) * ss; }
export async function hiresPage(browser, { w, ss = 1 }) {
  const dsf = scaleFor(w, ss);
  const p = await browser.newPage({ viewport: { width: CSS_W, height: CSS_H }, deviceScaleFactor: dsf });
  p.setDefaultTimeout(15 * 60000); // a large frame on a busy machine can take minutes in software 3D
  if (dsf > 2) {
    await p.route('**/js/engine/stage.js*', async (route) => {
      const r = await route.fetch(); const src = await r.text();
      const patched = src.replace(/high:\s*\{\s*ratio:\s*2,/, `high: { ratio: ${dsf},`);
      if (patched === src) throw new Error('hires: could not find the high tier ratio in stage.js');
      await route.fulfill({ response: r, body: patched, headers: { ...r.headers(), 'content-type': 'text/javascript' } });
    });
  }
  return p;
}
