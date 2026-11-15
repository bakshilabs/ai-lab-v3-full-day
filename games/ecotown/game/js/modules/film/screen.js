// Town film studio: the screen left in the town. A big outdoor screen by the hall or the market (else by the AI Lab)
// showing the film's opening frame; without reduced motion it steps through the film's frames like a slide show.
// Scenery only: it changes no tile and no number. three.js comes from the loader (townCtx.engine.THREE).
import { findSet, placeOf, screenSpot, tileXZ, MOVES, moodOf } from './kit.js';
import { frameSvg } from './picture.js';

const W = 9.6, H = 5.4, LEGS = 3.4; // the picture is 16 : 9
const tileList = (terrain) => (terrain?.tiles instanceof Map ? [...terrain.tiles.values()] : [...(terrain?.tiles || [])]);

export function showScreen(townCtx, data) {
  const { THREE, scene, world } = townCtx.engine; const cells = townCtx.town?.cells || []; const tiles = tileList(townCtx.town?.terrain);
  const set = findSet(cells, tiles, null, (k) => world.tileTop(k).y);
  const shots = (Array.isArray(data?.shots) ? data.shots : []).filter((s) => Array.isArray(s) && MOVES[s[0]]).map(([move, sub]) => ({ move, sub: String(sub) }))
    .filter((s) => s.sub === 'town' || s.sub.startsWith('who:') || (s.sub.startsWith('place:') && placeOf(set, s.sub.slice(6))));
  const by = placeOf(set, set.square); if (!shots.length || !by) return () => {}; // nothing to show it by: draw nothing
  // stand on a free tile beside the place; if every neighbour is taken, stand high above the place itself
  const spot = screenSpot(by.k, cells, tiles); const tile = tiles.find((t) => t.k === (spot || by.k)); const [x, z] = tileXZ(tile.gx, tile.gz);
  let y = 1; try { y = world.tileTop(tile.k).y; } catch { /* keep the default */ }
  const legs = spot ? LEGS : 10;

  const group = new THREE.Group(); group.name = 'film-screen'; group.position.set(x, y, z + (spot ? 0 : 2.4)); group.rotation.y = -28 * Math.PI / 180; // towards the island's usual view
  const made = []; const mat = (c) => { const m = new THREE.MeshLambertMaterial({ color: c }); made.push(m); return m; };
  const box = (w, h, d, m, px, py, pz) => { const g = new THREE.BoxGeometry(w, h, d); made.push(g); const b = new THREE.Mesh(g, m); b.position.set(px, py, pz); b.castShadow = true; group.add(b); return b; };
  const wood = mat('#7a5a33'), dark = mat('#3b2a1e'), red = mat('#c0563a'), cream = mat('#fff0d8');
  for (const sx of [-1, 1]) { box(0.5, legs + H + 0.6, 0.5, wood, sx * (W / 2 + 0.1), (legs + H + 0.6) / 2, -0.15); box(1.5, 0.35, 1.5, dark, sx * (W / 2 + 0.1), 0.18, -0.15); }
  box(W + 0.9, H + 0.7, 0.3, dark, 0, legs + H / 2, -0.12);            // the frame behind the picture
  box(W + 1.6, 0.5, 0.9, red, 0, legs + H + 0.6, 0);                   // a little roof
  for (let i = 0; i < 7; i++) box(0.5, 0.42, 0.08, i % 2 ? cream : red, -W / 2 + 0.7 + i * (W - 1.4) / 6, legs + H + 0.18, 0.5); // bunting
  for (const sx of [-1.6, 1.6]) box(2.4, 0.3, 0.7, wood, sx, 0.55, 4.2);  // two benches in front
  for (const sx of [-2.5, -0.7, 0.7, 2.5]) box(0.25, 0.5, 0.5, dark, sx, 0.25, 4.2);

  // the picture: the storyboard frame, drawn onto a canvas (an SVG read as an image from memory; nothing is fetched)
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360; const c2 = canvas.getContext('2d');
  c2.fillStyle = '#6db2ee'; c2.fillRect(0, 0, 640, 360);
  const tex = new THREE.CanvasTexture(canvas); if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace; made.push(tex);
  const pm = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); made.push(pm);
  const pg = new THREE.PlaneGeometry(W, H); made.push(pg); const pic = new THREE.Mesh(pg, pm); pic.position.set(0, legs + H / 2, 0.05); group.add(pic);
  group.userData.size = [W, H, legs]; scene.add(group);

  let dead = false; let at = 0; let timer = 0; const mood = moodOf(data?.mood).id;
  function draw(i) {
    const img = new Image();
    img.onload = () => { if (dead) return; c2.drawImage(img, 0, 0, 640, 360); tex.needsUpdate = true; group.userData.drawn = (group.userData.drawn || 0) + 1; };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(frameSvg(shots[i], set, mood));
  }
  draw(0);
  // a slide show of the film's frames: a cut every few seconds, never a sweep. With reduced motion: the opening frame only.
  if (!townCtx.reduceMotion && shots.length > 1) timer = setInterval(() => { at = (at + 1) % shots.length; draw(at); }, 4500);
  return () => { dead = true; if (timer) clearInterval(timer); scene.remove(group); for (const m of made) m.dispose?.(); };
}
