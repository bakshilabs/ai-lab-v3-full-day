// The lighting effects that every level shares. They were written for the Homes trial (owner, 23 Nov 2026: "The classrooms have fast windows computers. Remove the
// quality limits."). This file was written for the trial; it uses only three.js itself and no add-on files.
// The town is first drawn into a picture that can hold light brighter than white. Then four small steps are run over it:
//   1. soft darkening where blocks meet (ambient occlusion), worked out from how far away each point of the picture is;
//   2. glow (bloom) around everything brighter than white: lamps, lit windows, the sun and the yellow places;
//   3. a filmic curve that deepens the darks and rolls the brightest light off gently instead of cutting it short;
//   4. a slight darkening of the corners of the picture, and a fine grain so that the sky has no bands.
// TONE is the same filmic curve as text. It is also given to three.js itself, so that the picture keeps the same tones when the effects are off.
export const TONE = `
vec3 trialTone(vec3 x) {
  x = max(x, vec3(0.0));
  const float a = 0.5;
  vec3 hi = a + (1.0 - a) * (1.0 - exp(-(x - a) / (1.0 - a)));
  vec3 y = mix(x, hi, step(vec3(a), x));
  vec3 g = pow(y, vec3(1.0 / 2.2));
  g = mix(g, g * g * (3.0 - 2.0 * g), 0.34);
  float l = dot(g, vec3(0.299, 0.587, 0.114));
  g = max(mix(vec3(l), g, 1.16), 0.0);
  return pow(g, vec3(2.2));
}`;
const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const AO = `
varying vec2 vUv; uniform sampler2D tDepth; uniform mat4 proj, projInv; uniform vec2 px; uniform float radius;
vec3 vpos(vec2 uv) { float d = texture2D(tDepth, uv).x; vec4 v = projInv * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return v.xyz / v.w; }
void main() {
  float d = texture2D(tDepth, vUv).x; if (d >= 0.99999) { gl_FragColor = vec4(1.0); return; }
  vec3 p = vpos(vUv), pr = vpos(vUv + vec2(px.x, 0.0)), pl = vpos(vUv - vec2(px.x, 0.0)), pu = vpos(vUv + vec2(0.0, px.y)), pd = vpos(vUv - vec2(0.0, px.y));
  vec3 dx = abs(pr.z - p.z) < abs(p.z - pl.z) ? pr - p : p - pl, dy = abs(pu.z - p.z) < abs(p.z - pd.z) ? pu - p : p - pd;
  vec3 n = normalize(cross(dx, dy)), t = normalize(abs(n.y) < 0.9 ? cross(n, vec3(0.0, 1.0, 0.0)) : cross(n, vec3(1.0, 0.0, 0.0))), b = cross(n, t);
  float ang = 6.2832 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))), occ = 0.0;
  float rad = radius * clamp(-p.z / 14.0, 0.45, 2.2);
  for (int i = 0; i < 16; i++) {
    float f = (float(i) + 0.5) / 16.0, a = ang + float(i) * 2.39996, r = sqrt(f) * rad, h = 0.08 + 0.92 * fract(float(i) * 0.618);
    vec3 s = p + n * (0.05 + h * r * 0.9) + (t * cos(a) + b * sin(a)) * r * sqrt(1.0 - h * h * 0.6);
    vec4 c = proj * vec4(s, 1.0); vec2 uv = c.xy / c.w * 0.5 + 0.5;
    float sz = vpos(uv).z, diff = sz - s.z;
    occ += step(0.04, diff) * smoothstep(0.0, 1.0, rad / max(abs(p.z - sz), 0.0001));
  }
  float ao = 1.0 - occ / 16.0;
  gl_FragColor = vec4(mix(ao, 1.0, smoothstep(55.0, 110.0, -p.z)), -p.z / 400.0, 0.0, 1.0);
}`;
// the darkening is smoothed, but never across an edge between a near thing and a far thing
const AOBLUR = `
varying vec2 vUv; uniform sampler2D tAO; uniform vec2 px;
void main() { vec2 c = texture2D(tAO, vUv).xy; float sum = 0.0, w = 0.0;
  for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) { vec2 s = texture2D(tAO, vUv + vec2(float(i), float(j)) * px).xy; float k = 1.0 / (1.0 + abs(s.y - c.y) * 4000.0 / max(c.y * 100.0, 0.4)); sum += s.x * k; w += k; }
  gl_FragColor = vec4(sum / w, c.y, 0.0, 1.0); }`;
const BRIGHT = `
varying vec2 vUv; uniform sampler2D tMap; uniform vec2 px; uniform float threshold, knee, base;
void main() { vec3 c = vec3(0.0); for (int i = 0; i < 4; i++) { vec2 o = vec2(i == 0 || i == 2 ? -0.5 : 0.5, i < 2 ? -0.5 : 0.5); c += min(texture2D(tMap, vUv + o * px).rgb, vec3(24.0)); } c *= 0.25;
  float l = max(c.r, max(c.g, c.b)), s = clamp(l - threshold + knee, 0.0, 2.0 * knee); s = s * s / (4.0 * knee + 0.0001);
  gl_FragColor = vec4(c * max(s, l - threshold) / max(l, 0.0001) + c * base, 1.0); }`;
const DOWN = `
varying vec2 vUv; uniform sampler2D tMap; uniform vec2 px;
void main() { vec3 c = texture2D(tMap, vUv).rgb * 4.0; c += texture2D(tMap, vUv + px * vec2(-1.0, -1.0)).rgb + texture2D(tMap, vUv + px * vec2(1.0, -1.0)).rgb + texture2D(tMap, vUv + px * vec2(-1.0, 1.0)).rgb + texture2D(tMap, vUv + px * vec2(1.0, 1.0)).rgb; gl_FragColor = vec4(c / 8.0, 1.0); }`;
const UP = `
varying vec2 vUv; uniform sampler2D tMap, tAdd; uniform vec2 px; uniform float spread;
void main() { vec3 c = vec3(0.0); c += texture2D(tMap, vUv + px * vec2(-1.0, 0.0)).rgb + texture2D(tMap, vUv + px * vec2(1.0, 0.0)).rgb + texture2D(tMap, vUv + px * vec2(0.0, -1.0)).rgb + texture2D(tMap, vUv + px * vec2(0.0, 1.0)).rgb;
  c = c * 2.0 + texture2D(tMap, vUv + px * vec2(-1.0, -1.0)).rgb + texture2D(tMap, vUv + px * vec2(1.0, -1.0)).rgb + texture2D(tMap, vUv + px * vec2(-1.0, 1.0)).rgb + texture2D(tMap, vUv + px * vec2(1.0, 1.0)).rgb + texture2D(tMap, vUv).rgb * 4.0;
  gl_FragColor = vec4(texture2D(tAdd, vUv).rgb + c / 16.0 * spread, 1.0); }`;
const FINAL = `
varying vec2 vUv; uniform sampler2D tScene, tAO, tBloom; uniform float bloom, ao, vignette, useAO; uniform vec3 shade;
${TONE}
void main() { vec3 c = texture2D(tScene, vUv).rgb; float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  if (useAO > 0.5) { float k = 1.0 - (1.0 - texture2D(tAO, vUv).x) * ao * (1.0 - smoothstep(0.9, 1.8, l)); c *= mix(shade, vec3(1.0), k); }
  c += texture2D(tBloom, vUv).rgb * bloom;
  vec2 q = vUv - 0.5; c *= 1.0 - vignette * smoothstep(0.25, 0.95, dot(q, q) * 2.0);
  c = pow(trialTone(c), vec3(1.0 / 2.2));
  float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))); c += (n - 0.5) / 255.0;
  gl_FragColor = vec4(c, 1.0); }`;

// THREE is three.js and renderer its renderer. The answer has draw(scene, camera), setSize(width, height) and the settings that a scene may change (bloom, ao, vignette).
export function makeFX(THREE, renderer) {
  const N = 6, half = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  const scene = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  scene.depthTexture = new THREE.DepthTexture(2, 2); scene.depthTexture.type = THREE.UnsignedIntType; scene.depthTexture.minFilter = scene.depthTexture.magFilter = THREE.NearestFilter;
  const near = { depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType }, aoA = new THREE.WebGLRenderTarget(2, 2, near), aoB = new THREE.WebGLRenderTarget(2, 2, { ...near, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const down = [], up = []; for (let i = 0; i < N; i++) { down.push(new THREE.WebGLRenderTarget(2, 2, half)); if (i < N - 1) up.push(new THREE.WebGLRenderTarget(2, 2, half)); }
  const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)); tri.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  const quad = new THREE.Mesh(tri), qs = new THREE.Scene(), qc = new THREE.Camera(); quad.frustumCulled = false; qs.add(quad);
  const mk = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, toneMapped: false });
  const V2 = () => ({ value: new THREE.Vector2() }), T = () => ({ value: null });
  const mAO = mk(AO, { tDepth: T(), proj: { value: new THREE.Matrix4() }, projInv: { value: new THREE.Matrix4() }, px: V2(), radius: { value: 0.75 } });
  const mBlur = mk(AOBLUR, { tAO: T(), px: V2() }), mBright = mk(BRIGHT, { tMap: T(), px: V2(), threshold: { value: 1.15 }, knee: { value: 0.45 }, base: { value: 0.018 } });
  const mDown = mk(DOWN, { tMap: T(), px: V2() }), mUp = mk(UP, { tMap: T(), tAdd: T(), px: V2(), spread: { value: 1 } });
  const mFinal = mk(FINAL, { tScene: T(), tAO: T(), tBloom: T(), bloom: { value: 0.5 }, ao: { value: 0.8 }, vignette: { value: 0.3 }, useAO: { value: 1 }, shade: { value: new THREE.Color(0.1, 0.09, 0.2) } });
  const pass = (m, target) => { quad.material = m; renderer.setRenderTarget(target); renderer.render(qs, qc); };
  const fx = { bloom: 0.5, ao: 0.8, vignette: 0.3, shade: mFinal.uniforms.shade.value, w: 2, h: 2,
    setSize(w, h) { w = Math.max(2, Math.floor(w)); h = Math.max(2, Math.floor(h)); if (w === fx.w && h === fx.h) return; fx.w = w; fx.h = h; scene.setSize(w, h); aoA.setSize(w, h); aoB.setSize(w, h); let a = w, b = h; for (let i = 0; i < N; i++) { a = Math.max(2, a >> 1); b = Math.max(2, b >> 1); down[i].setSize(a, b); if (i < N - 1) up[i].setSize(a, b); } },
    draw(sc, cam) { const old = renderer.toneMapping; renderer.toneMapping = THREE.NoToneMapping; renderer.setRenderTarget(scene); renderer.render(sc, cam); renderer.toneMapping = old;
      const sa = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false;
      if (fx.ao > 0) { mAO.uniforms.tDepth.value = scene.depthTexture; mAO.uniforms.proj.value.copy(cam.projectionMatrix); mAO.uniforms.projInv.value.copy(cam.projectionMatrixInverse); mAO.uniforms.px.value.set(1 / fx.w, 1 / fx.h); pass(mAO, aoA); mBlur.uniforms.tAO.value = aoA.texture; mBlur.uniforms.px.value.set(1 / fx.w, 1 / fx.h); pass(mBlur, aoB); }
      mBright.uniforms.tMap.value = scene.texture; mBright.uniforms.px.value.set(1 / fx.w, 1 / fx.h); pass(mBright, down[0]);
      for (let i = 1; i < N; i++) { mDown.uniforms.tMap.value = down[i - 1].texture; mDown.uniforms.px.value.set(1 / down[i - 1].width, 1 / down[i - 1].height); pass(mDown, down[i]); }
      for (let i = N - 2; i >= 0; i--) { const src = i === N - 2 ? down[N - 1] : up[i + 1]; mUp.uniforms.tMap.value = src.texture; mUp.uniforms.tAdd.value = down[i].texture; mUp.uniforms.px.value.set(1 / src.width, 1 / src.height); pass(mUp, up[i]); }
      const u = mFinal.uniforms; u.tScene.value = scene.texture; u.tAO.value = aoB.texture; u.tBloom.value = up[0].texture; u.bloom.value = fx.bloom; u.ao.value = fx.ao; u.useAO.value = fx.ao > 0 ? 1 : 0; u.vignette.value = fx.vignette; pass(mFinal, null);
      renderer.shadowMap.autoUpdate = sa; } };
  return fx; }
