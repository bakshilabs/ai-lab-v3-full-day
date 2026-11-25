// Flat effects drawn over the scene: the rings of a tap, the two rings that spread from the test button, and the small
// burst when a word lands in its gap. Each effect is drawn from its age in seconds, so a frame can be drawn again at
// any time. There is no confetti, and nothing here flashes: every effect appears once and fades.
import { tapRing, outCubic, hash } from '../design/motion-curves.js';
export function drawFx(g, W, H, list, t) {
  g.clearRect(0, 0, W, H);
  for (const [t0, kind, x, y] of list) { const a = t - t0; if (a < 0) continue;
    // a tap: two rings, white with a dark edge, so that they show on grass, on paper and at night
    if (kind === 'tap') for (let n = 0; n < 2; n++) { const r = tapRing(a, n); if (!r) continue; g.globalAlpha = r.alpha; g.beginPath(); g.arc(x, y, r.r, 0, 7); g.lineWidth = r.width + 3; g.strokeStyle = '#1f2a44'; g.stroke(); g.lineWidth = r.width; g.strokeStyle = '#ffffff'; g.stroke(); }
    // the press of the test button: two thin rings cross the town in 600 milliseconds
    if (kind === 'press') for (let n = 0; n < 2; n++) { const k = (a - n * 0.12) / 0.6; if (k <= 0 || k >= 1) continue; g.globalAlpha = 0.6 * (1 - k); g.lineWidth = 10 * (1 - k) + 2; g.strokeStyle = '#ffd257'; g.beginPath(); g.arc(x, y, 40 + outCubic(k) * 1150, 0, 7); g.stroke(); }
    // a word lands in its gap: six small yellow squares, gone in 250 milliseconds
    if (kind === 'burst' && a < 0.25) for (let n = 0; n < 6; n++) { const k = a / 0.25, ang = n / 6 * 6.283 + hash(n, 3), r = 18 + outCubic(k) * 46, s = 9 * (1 - k); g.globalAlpha = 1 - k; g.fillStyle = '#ffd257'; g.strokeStyle = '#1f2a44'; g.lineWidth = 2; g.fillRect(x + Math.cos(ang) * r * 1.6 - s / 2, y + Math.sin(ang) * r * 0.6 - s / 2, s, s); g.strokeRect(x + Math.cos(ang) * r * 1.6 - s / 2, y + Math.sin(ang) * r * 0.6 - s / 2, s, s); }
  }
  g.globalAlpha = 1;
}
