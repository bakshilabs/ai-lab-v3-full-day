// Drone delivery: the 3D things the module adds to the scene (the drone, its parcel, place markers, the route dots).
// Everything is made here and thrown away with dispose(); nothing in the game's own scene is touched.
import * as THREE from 'three';

const lam = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

// A small four-rotor drone, nose towards -z (north) when rotation.y is 0. Returns { group, rotors, parcel, rope }.
export function makeDrone(scale = 1.5, blades = '#3b2a1e') {
  const group = new THREE.Group(); const body = new THREE.Group(); group.add(body);
  const white = lam('#fffaf0'), orange = lam('#e8743b'), dark = lam('#3b2a1e'), grey = lam('#8f9aa3'), blade = lam(blades);
  const hull = box(1.5, 0.5, 1.9, white); body.add(hull);
  const nose = box(0.9, 0.3, 0.5, orange); nose.position.set(0, 0.05, -1.1); body.add(nose);
  const eye = box(0.5, 0.18, 0.1, dark); eye.position.set(0, 0.08, -1.37); body.add(eye);
  const tail = box(0.3, 0.5, 0.3, orange); tail.position.set(0, 0.35, 0.85); body.add(tail);
  const rotors = [];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const arm = box(1.5, 0.14, 0.22, grey); arm.position.set(sx * 0.95, 0.05, sz * 0.95); arm.rotation.y = sx * sz > 0 ? -Math.PI / 4 : Math.PI / 4; body.add(arm);
    const hub = box(0.26, 0.3, 0.26, dark); hub.position.set(sx * 1.5, 0.2, sz * 1.5); body.add(hub);
    const rotor = new THREE.Group(); rotor.position.set(sx * 1.5, 0.4, sz * 1.5);
    const b1 = box(1.7, 0.05, 0.2, blade); const b2 = box(0.2, 0.05, 1.7, blade); rotor.add(b1, b2); rotor.rotation.y = (sx + 2 * sz) * 0.4; body.add(rotor); rotors.push(rotor);
  }
  const skid1 = box(0.12, 0.12, 1.6, grey); skid1.position.set(-0.6, -0.45, 0); const skid2 = skid1.clone(); skid2.position.x = 0.6; body.add(skid1, skid2);
  const parcel = new THREE.Group(); const crate = box(0.9, 0.7, 0.9, lam('#b9834f')); const tape = box(0.94, 0.16, 0.94, lam('#f2c14e')); parcel.add(crate, tape); parcel.position.y = -0.85; group.add(parcel);
  const rope = box(0.06, 1, 0.06, dark); rope.visible = false; group.add(rope);
  group.scale.setScalar(scale);
  return { group, body, rotors, parcel, rope };
}
// Lower the parcel on its rope by `drop` (in the drone's own units, 0 = held under the drone).
export function setParcelDrop(drone, drop) {
  drone.parcel.position.y = -0.85 - drop; drone.rope.visible = drop > 0.05;
  if (drone.rope.visible) { drone.rope.scale.y = drop + 0.3; drone.rope.position.y = -0.4 - drop / 2; }
}
// A parcel left on the ground.
export function makeParcel(scale = 1.5) {
  const g = new THREE.Group(); const crate = box(0.9, 0.7, 0.9, lam('#b9834f')); const tape = box(0.94, 0.16, 0.94, lam('#f2c14e')); g.add(crate, tape); g.scale.setScalar(scale); return g;
}
// A tall marker over a place: a solid ring on the ground, a post and a diamond that can be seen from far away.
export function makeBeacon(color = '#d2452d', height = 20) {
  const g = new THREE.Group(); const mat = lam(color, { emissive: color, emissiveIntensity: 0.35 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.28, 6, 24), mat); ring.rotation.x = Math.PI / 2; ring.position.y = 0.4; g.add(ring);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, height, 6), mat); post.position.y = height / 2; g.add(post);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(1.5), mat); gem.position.y = height + 1.6; g.add(gem);
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.2, 6, 24), mat); hoop.rotation.x = Math.PI / 2; hoop.position.y = height - 4; g.add(hoop);
  return { group: g, gem };
}
// The drone's landing pad: a flat green deck on a post, above the roof of the place a parcel starts from.
export function makePad(height = 10) {
  const g = new THREE.Group(); const green = lam('#2e7d4f'), pale = lam('#fffaf0'), wood = lam('#7a5a33');
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, height, 6), wood); post.position.y = height / 2; g.add(post);
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.3, 16), green); deck.position.y = height; g.add(deck);
  const mark = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.32, 16), pale); mark.position.y = height; g.add(mark);
  return { group: g };
}
// A dark disc under the drone, so its place over the ground is easy to read.
export function makeShadow() {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.08, 16), new THREE.MeshBasicMaterial({ color: '#3b2a1e' })); return m;
}
// Small dots along a path of world points (Vector3-like), one about every `gap` units.
export function makeDots(points, gap = 3, color = '#e8743b', size = 0.32) {
  const g = new THREE.Group(); const geo = new THREE.OctahedronGeometry(size); const mat = lam(color, { emissive: color, emissiveIntensity: 0.3 });
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i]; const len = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z); const n = Math.max(1, Math.round(len / gap));
    for (let j = i === 1 ? 0 : 1; j <= n; j++) { const m = new THREE.Mesh(geo, mat); m.position.set(a.x + (b.x - a.x) * j / n, a.y + (b.y - a.y) * j / n, a.z + (b.z - a.z) * j / n); g.add(m); }
  }
  return g;
}
// Remove an object from its parent and free its geometry and materials.
export function dispose(obj) {
  if (!obj) return; obj.parent?.remove(obj); const seen = new Set();
  obj.traverse((o) => { for (const r of [o.geometry, ...(Array.isArray(o.material) ? o.material : [o.material])]) if (r && !seen.has(r)) { seen.add(r); r.dispose?.(); } });
}
