// Power control room: the window onto the child's own town. It places the camera over the homes, sets the time of
// day, and switches each home's lights on or off. three.js comes from the engine (ctx.engine.THREE), not an import.
// Everything it changes is put back by dispose(): the time of day, the town's lights and the camera's view.
//
// Lights. The town's windows are the game's own: world.setLights(keys) lights the homes on those tiles, and they show
// once the sky is dark. The fixed old school is always lit by the game, so when the model says the school is dark its
// window blocks are shrunk for a moment (and put back by the next setLights). Practice homes, lent to a town with too
// few homes, are small houses drawn here, with windows of their own.

const LIT = '#ffd66b', UNLIT = '#353c5c';
const WALLS = ['#f2e2c4', '#e9c9a0', '#f0d9b5', '#e6b98a', '#f4ead2', '#dfc29a'], ROOFS = ['#b5523b', '#9c4a3a', '#c2674a', '#8d5a3c', '#b5523b', '#a8563e'];

export function createView(ctx, kit) {
  const { THREE, scene, camera, world, stage } = ctx.engine; const reduce = !!ctx.settings?.reduceMotion;
  const group = new THREE.Group(); group.name = 'power-view'; scene.add(group);
  const bin = []; const keep = (x) => { bin.push(x); return x; };
  const top = (k) => { try { return k ? world.tileTop(k) : null; } catch { return null; } };
  const homes = kit.homes.map((h) => ({ ...h, pos: top(h.k) }));
  const schoolPos = top(kit.school.k);

  // ---- practice homes (scenery, only while the module is open)
  const boxG = keep(new THREE.BoxGeometry(1, 1, 1)); const roofG = keep(new THREE.ConeGeometry(1, 1, 4));
  const lam = (c) => keep(new THREE.MeshLambertMaterial({ color: c }));
  homes.forEach((h, n) => {
    if (!h.practice || !h.pos) return;
    const g = new THREE.Group(); g.position.copy(h.pos); g.rotation.y = [0, 0.2, -0.15, 0.1, -0.25, 0.05][n % 6];
    const body = new THREE.Mesh(boxG, lam(WALLS[n % 6])); body.scale.set(3.6, 2.4, 3.2); body.position.y = 1.2; g.add(body);
    const roof = new THREE.Mesh(roofG, lam(ROOFS[n % 6])); roof.scale.set(3.1, 1.7, 2.8); roof.rotation.y = Math.PI / 4; roof.position.y = 3.25; g.add(roof);
    const door = new THREE.Mesh(boxG, lam('#7a5a33')); door.scale.set(0.7, 1.3, 0.12); door.position.set(0, 0.65, 1.62); g.add(door);
    const chim = new THREE.Mesh(boxG, lam('#8d5a3c')); chim.scale.set(0.5, 1.2, 0.5); chim.position.set(1, 3.4, -0.4); g.add(chim);
    h.glass = keep(new THREE.MeshBasicMaterial({ color: UNLIT }));
    for (const [x, y, z, sx, sz] of [[-1.1, 1.45, 1.62, 0.75, 0.12], [1.1, 1.45, 1.62, 0.75, 0.12], [1.82, 1.45, 0.6, 0.12, 0.75], [1.82, 1.45, -0.7, 0.12, 0.75], [-1.82, 1.45, 0, 0.12, 0.75], [0, 1.45, -1.62, 0.75, 0.12]]) { const w = new THREE.Mesh(boxG, h.glass); w.scale.set(sx, 0.75, sz); w.position.set(x, y, z); g.add(w); }
    group.add(g);
  });

  // ---- a "no power" marker over each home and the school, shown whenever it is dark (day or night)
  let tex = null;
  try {
    const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
    x.fillStyle = '#2b3358'; x.beginPath(); x.arc(48, 48, 42, 0, 7); x.fill(); x.lineWidth = 7; x.strokeStyle = '#fff'; x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(48, 40, 15, 0, 7); x.fill(); x.fillRect(40, 52, 16, 14); x.fillStyle = '#2b3358'; x.fillRect(40, 60, 16, 3);  // a bulb
    x.strokeStyle = '#ff6b4a'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(24, 72); x.lineTo(72, 24); x.stroke();                    // crossed out
    tex = keep(new THREE.CanvasTexture(c)); if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  } catch { tex = null; }
  const markMat = tex ? keep(new THREE.SpriteMaterial({ map: tex, alphaTest: 0.5, transparent: false, depthTest: false })) : null;
  const marker = (pos, y) => { if (!markMat || !pos) return null; const s = new THREE.Sprite(markMat); s.position.set(pos.x, pos.y + y, pos.z); s.scale.setScalar(2.6); s.visible = false; s.renderOrder = 5; group.add(s); return s; };
  homes.forEach((h) => { h.mark = marker(h.pos, h.practice ? 6 : 8); });
  const schoolMark = marker(schoolPos, 9.5);
  // after dark a lit home throws a warm pool on the ground round it, like the town's street lamps (solid, flat)
  const poolG = keep(new THREE.CylinderGeometry(4.1, 4.1, 0.05, 8)); const poolM = keep(new THREE.MeshBasicMaterial({ color: '#d99a4e', polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }));
  homes.forEach((h) => { if (!h.pos) return; h.pool = new THREE.Mesh(poolG, poolM); h.pool.position.set(h.pos.x, h.pos.y + 0.05, h.pos.z); h.pool.rotation.y = Math.PI / 8; h.pool.visible = false; group.add(h.pool); });

  // ---- the game's own night lights
  const cellList = Array.isArray(ctx.town?.cells) ? ctx.town.cells : []; const homeKeys = new Set(homes.filter((h) => !h.practice).map((h) => h.k));
  const always = cellList.filter(([k, c]) => c && c.item && !homeKeys.has(k) && k !== kit.school.k).map(([k]) => k); // street lamps and the rest stay on
  let lightMesh = null;
  try { scene.traverse((o) => { if (!lightMesh && o.isInstancedMesh && o.material?.isMeshBasicMaterial && o.material.color?.getHexString?.() === 'ffd66b' && o.geometry?.parameters?.width === 0.42) lightMesh = o; }); } catch { lightMesh = null; }
  const m4 = new THREE.Matrix4(), p3 = new THREE.Vector3(), q4 = new THREE.Quaternion(), s3 = new THREE.Vector3();
  const onTile = (pos) => pos && Math.abs(p3.x - pos.x) < 3.05 && Math.abs(p3.z - pos.z) < 3.05;
  const eachLight = (fn) => { if (!lightMesh) return; for (let i = 0; i < lightMesh.count; i++) { lightMesh.getMatrixAt(i, m4); m4.decompose(p3, q4, s3); fn(i); } };
  // which homes the game had lit before the module opened, so the town gets exactly that back
  let before = null;
  if (lightMesh && typeof world.setLights === 'function') { const on = new Set(); try { lightMesh.updateWorldMatrix?.(true, false); eachLight(() => { if (s3.x > 0.5) for (const [k, c] of cellList) { if (c?.item && !on.has(k) && onTile(top(k))) on.add(k); } }); before = [...on]; } catch { before = null; } }
  if (!before) { const s = ctx.town?.sim; const hk = (s?.homes || []).map((x) => x.k); before = !hk.length ? [] : s.power?.winterOK ? hk : hk.slice(0, Math.floor(hk.length * 0.4)); }
  let sig = '';
  function setLit(lit, schoolLit) {
    const next = lit.map((x) => (x ? 1 : 0)).join('') + (schoolLit ? 'S' : 's'); if (next === sig) return; sig = next;
    homes.forEach((h, i) => { h.on = !!lit[i]; if (h.glass) h.glass.color.set(lit[i] ? LIT : UNLIT); if (h.mark) h.mark.visible = !lit[i]; if (h.pool) h.pool.visible = night > 0.45 && h.on; });
    if (schoolMark) schoolMark.visible = !schoolLit;
    if (typeof world.setLights !== 'function') return;
    const keys = [...always]; homes.forEach((h, i) => { if (!h.practice && lit[i]) keys.push(h.k); }); if (schoolLit && kit.school.k) keys.push(kit.school.k);
    try {
      world.setLights(keys);
      if (!schoolLit && lightMesh && schoolPos) { let any = false; eachLight((i) => { if (onTile(schoolPos) && s3.x > 0.01) { s3.setScalar(0.0001); m4.compose(p3, q4, s3); lightMesh.setMatrixAt(i, m4); any = true; } }); if (any) lightMesh.instanceMatrix.needsUpdate = true; }
    } catch (e) { console.warn('power: lights', e); }
  }

  // ---- the time of day (and winter), put back on leave
  // The model's day is dark from 6 in the evening to 6 in the morning (4 pm to 8 am in winter); the game's sky turns
  // later than that, so the clock is mapped onto the sky: dusk comes when the model says it does. The game keeps its
  // nights bright enough to build in; here the ground is dimmed further so lit and dark windows stand out. Every
  // stage.setTime() sets those lights afresh, so putting the time back on leave puts them back too.
  const was = { hour: stage.hour, winter: stage.winter }; let shown = null; let night = 0;
  const SKY = { day: [[6, 6], [16, 16], [17, 18.5], [18, 19.9], [20, 21.3], [24, 24], [29, 28.6], [30, 30]], winter: [[6, 4.7], [7, 4.9], [8, 6.3], [9, 8], [14, 14.5], [15, 17.8], [16, 19.9], [18, 21.3], [24, 24], [30, 28.7]] };
  const skyHour = (hour, winter) => { const pts = winter ? SKY.winter : SKY.day; let t = ((hour % 24) + 24) % 24; if (t < 6) t += 24; let i = 0; while (i < pts.length - 2 && pts[i + 1][0] <= t) i++; const [a0, b0] = pts[i], [a1, b1] = pts[i + 1]; return (b0 + ((t - a0) / (a1 - a0)) * (b1 - b0)) % 24; };
  function setHour(hour, winter = false) {
    const k = `${Math.round(hour * 20)}:${winter ? 1 : 0}`; if (k === shown) return; shown = k;
    try { stage.setTime(skyHour(hour, winter), winter ? 1 : 0); night = stage.night || 0; const dim = 1 - 0.62 * night; if (stage.hemi) stage.hemi.intensity *= dim; if (stage.moon) stage.moon.intensity *= 1 - 0.45 * night; if (stage.fill) stage.fill.intensity *= dim; } catch { /* the sky stays as it was */ }
    const dark = night > 0.45; for (const h of homes) if (h.pool) h.pool.visible = dark && !!h.on;
  }

  // ---- the camera: over the homes, framed inside the control-room window (rect, in page pixels)
  const pts = [...homes.map((h) => h.pos), schoolPos].filter(Boolean); const centre = new THREE.Vector3();
  if (pts.length) { const bb = new THREE.Box3().setFromPoints(pts); bb.getCenter(centre); } else centre.set(0, 2, 0);
  const radius = Math.max(16, ...pts.map((p) => Math.hypot(p.x - centre.x, p.z - centre.z) + 7));
  const viewWas = camera.view ? { ...camera.view } : null; let rect = null; let clock = 0;
  const YAW = 0.5, PITCH = 0.62, FOV = 38; const up = new THREE.Vector3(0, 1, 0); const lookM = new THREE.Matrix4(); const eye = new THREE.Vector3();
  function frame(dt) {
    clock += dt; const el = camera.aspect || 1.6; const W = window.innerWidth || 1280, H = window.innerHeight || 800;
    const r = rect || { left: 0, top: 0, width: W, height: H }; const fy = Math.max(0.25, r.height / H), fx = Math.max(0.25, r.width / W);
    const tv = Math.tan((FOV * Math.PI) / 360); const av = Math.atan(tv * fy), ah = Math.atan(tv * el * fx);
    const d = Math.max(radius / Math.sin(av), radius / Math.sin(ah)) * 0.78;
    const yaw = YAW + (reduce ? 0 : Math.sin(clock * 0.12) * 0.07);
    eye.set(centre.x + Math.sin(yaw) * Math.cos(PITCH) * d, centre.y + Math.sin(PITCH) * d, centre.z + Math.cos(yaw) * Math.cos(PITCH) * d);
    camera.position.copy(eye); camera.quaternion.setFromRotationMatrix(lookM.lookAt(eye, centre, up));
    const ox = Math.round(W / 2 - (r.left + r.width / 2)), oy = Math.round(H / 2 - (r.top + r.height / 2)); const v = camera.view;
    if (camera.fov !== FOV || !v || !v.enabled || v.fullWidth !== W || v.fullHeight !== H || v.offsetX !== ox || v.offsetY !== oy) { camera.fov = FOV; camera.setViewOffset(W, H, ox, oy, W, H); }
  }
  const setRect = (r) => { rect = r && r.width > 40 && r.height > 40 ? r : null; };

  function dispose() {
    try { stage.setTime(was.hour, was.winter); } catch { /* nothing to put back */ }
    try { if (typeof world.setLights === 'function') world.setLights(before); } catch { /* the game sets them again itself */ }
    try { if (viewWas && viewWas.enabled) camera.setViewOffset(viewWas.fullWidth, viewWas.fullHeight, viewWas.offsetX, viewWas.offsetY, viewWas.width, viewWas.height); else camera.clearViewOffset(); } catch { /* the loader resets the camera */ }
    scene.remove(group); for (const x of bin) { try { x.dispose(); } catch { /* already gone */ } }
  }
  return { setLit, setHour, frame, setRect, dispose, hasHomes: pts.length > 0 };
}
