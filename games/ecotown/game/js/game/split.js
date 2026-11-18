// Florence's town in a split screen (owner, 17 Nov 2026): pure layout and state rules for js/game/twotowns.js, with no
// three.js or DOM, so tests/split.test.mjs can check them.
// The screen splits into two panes, drawn from one scene with one renderer (viewport and scissor, two cameras):
// Florence's town on the left (landscape screens) or on top (upright screens), the player's own town on the right or
// below. The line between them runs through the middle of the free area (the screen less the panels over the island),
// so both towns get the same room. The player shows or hides Florence's pane with one toggle; the game also opens it
// by itself for a moment of comparison (after a mission, in the intro), until the player builds or hides it.

export const PREF_KEY = 'ecotown.split.v1'; // sessionStorage: the player's own choice, for this browser session

const full = (i) => ({ left: 0, right: 0, top: 0, bottom: 0, ...(i || {}) });

// the two panes ({ x, y, w, h } in CSS pixels from the top left) and where the line between them is
export function splitPanes(W, H, inset) {
  const i = full(inset); const stacked = W < H;
  if (!stacked) {
    const x = Math.round((i.left + W - i.right) / 2);
    return { stacked, line: x, florence: { x: 0, y: 0, w: x, h: H }, mine: { x, y: 0, w: W - x, h: H } };
  }
  const y = Math.round((i.top + H - i.bottom) / 2);
  return { stacked, line: y, florence: { x: 0, y: 0, w: W, h: y }, mine: { x: 0, y, w: W, h: H - y } };
}

// the part of a pane a town should fill: the pane, less the panels over it (as an inset from the screen's edges)
export function paneInset(pane, W, H, inset) {
  const i = full(inset);
  return { left: Math.max(i.left, pane.x), top: Math.max(i.top, pane.y), right: Math.max(i.right, W - pane.x - pane.w), bottom: Math.max(i.bottom, H - pane.y - pane.h) };
}

// the camera view offset (setViewOffset x, y) that puts the island's centre in the middle of that part
export function centreOffset(W, H, inset) {
  const i = full(inset);
  return { x: Math.round(W / 2 - (i.left + W - i.right) / 2), y: Math.round(H / 2 - (i.top + H - i.bottom) / 2) };
}

// the shape of a free area, as the camera rig measures it (rig.freeAspect)
export function freeShape(W, H, inset) {
  const i = full(inset); const w = Math.max(200, W - i.left - i.right), h = Math.max(200, H - i.top - i.bottom);
  return { aspect: w / h, fw: w / W, fh: h / H };
}

export const inRect = (r, x, y) => !!r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

// which town a point on the screen belongs to while the screen is split ('florence' or 'mine'); null when not split.
// A tap in Florence's pane never reaches the build code: it only says that building happens in the player's own town.
export function paneAt(panes, x, y) { if (!panes) return null; return inRect(panes.florence, x, y) ? 'florence' : 'mine'; }

// is the split on now? Only while the player is building their own town in the overview camera (not in a mission,
// the AI Lab, street view or inside a house); then when the player chose it, or while the game has opened it.
export function splitOn({ pref = false, auto = false, building = false, skyView = true } = {}) {
  return !!(pref || auto) && !!building && !!skyView;
}

// the state ({ pref, auto }) after an event:
//   'toggle' (the player's button; shown is what the screen showed), 'open' (the game opens it: the compare moment, the
//   intro), 'close' (the game is done with it: the intro moves on), 'built' (the player built something in their town)
export function nextSplit(s, ev, shown = false) {
  const st = { pref: !!s?.pref, auto: !!s?.auto };
  if (ev === 'toggle') return shown ? { pref: false, auto: false } : { pref: true, auto: false };
  if (ev === 'open') return { ...st, auto: true };
  if (ev === 'close' || ev === 'built') return { ...st, auto: false };
  return st;
}

export function loadPref(store) { try { return store?.getItem(PREF_KEY) === '1'; } catch { return false; } }
export function savePref(store, on) { try { store?.setItem(PREF_KEY, on ? '1' : '0'); } catch { /* storage off: the choice lasts this page only */ } }
