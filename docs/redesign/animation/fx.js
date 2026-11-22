// Flat effects drawn over the scene: tap rings, a shock wave when a test starts, sparkles and confetti.
// Each effect is drawn from its age in seconds, so a frame can be drawn again at any time.
import { clamp, ease, hash } from './vox.js';
const COLS = ['#ffd23f', '#e0503a', '#3f78b5', '#2e9b5a', '#f08ab8', '#ffffff'];
export function drawFx(g, W, H, list, t) {
  g.clearRect(0, 0, W, H);
  for (const [t0, kind, x, y, colour] of list) { const a = t - t0; if (a < 0) continue;
    if (kind === 'tap' && a < 0.5) { const k = a / 0.5; g.strokeStyle = `rgba(59,42,30,${1 - k})`; g.lineWidth = 5 * (1 - k) + 1; g.beginPath(); g.arc(x, y, 14 + k * 44, 0, 7); g.stroke(); }
    if (kind === 'shock' && a < 1) { for (let n = 0; n < 3; n++) { const k = clamp(a / 1 - n * 0.12); if (k <= 0) continue; g.strokeStyle = colour || '#ffd23f'; g.globalAlpha = (1 - k) * 0.9; g.lineWidth = 16 * (1 - k) + 2; g.beginPath(); g.arc(x, y, 30 + ease(k) * 760, 0, 7); g.stroke(); } g.globalAlpha = 1; }
    if (kind === 'spark' && a < 0.9) { const k = a / 0.9; for (let n = 0; n < 16; n++) { const ang = n / 16 * 6.283 + hash(n, 3), r = 20 + ease(k) * (70 + hash(n, 5) * 70), s = (1 - k) * (9 + hash(n, 7) * 8); g.fillStyle = COLS[n % 3]; g.save(); g.translate(x + Math.cos(ang) * r, y + Math.sin(ang) * r * 0.8); g.rotate(a * 6 + n); g.fillRect(-s / 2, -s / 2, s, s); g.restore(); } }
    if (kind === 'confetti' && a < 3) { for (let n = 0; n < 110; n++) { const d = hash(n, 11) * 0.5; if (a < d) continue; const b = a - d, px = hash(n, 1) * W + Math.sin(b * 3 + n) * 40, py = -30 + b * (260 + hash(n, 2) * 260) + b * b * 60, s = 9 + hash(n, 4) * 9; if (py > H + 20) continue;
      g.fillStyle = COLS[n % COLS.length]; g.globalAlpha = clamp(3 - a); g.save(); g.translate(px, py); g.rotate(b * (3 + hash(n, 6) * 5) + n); g.fillRect(-s / 2, -s / 4, s, s / 2); g.restore(); } g.globalAlpha = 1; }
  }
}
