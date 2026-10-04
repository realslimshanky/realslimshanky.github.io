/* Hero: a living topographic map. Contour lines of a drifting noise field,
   pulled into a peak under the pointer. One full-screen shader, no assets. */

import * as THREE from 'three';

// Raw shader output: keep CSS hex colours as-is, no linear conversion.
THREE.ColorManagement.enabled = false;

const canvas = document.querySelector('.hero__canvas');
const hero = document.querySelector('.hero');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
} catch (e) {
  renderer = null; // CSS fallback in .hero:not(.has-gl)
}

if (renderer) {
  hero.classList.add('has-gl');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const palette = () => ({
    bg: new THREE.Color(css('--bg')),
    line: new THREE.Color(css('--ink')),
    accent: new THREE.Color(css('--accent')),
    light: document.documentElement.dataset.theme === 'light' ? 1 : 0
  });

  const p = palette();
  const uniforms = {
    uRes: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.35, 0.1) },
    uPull: { value: 0 },
    uBg: { value: p.bg },
    uLine: { value: p.line },
    uAccent: { value: p.accent },
    uLight: { value: p.light }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec2 uRes;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uPull;
      uniform vec3 uBg;
      uniform vec3 uLine;
      uniform vec3 uAccent;
      uniform float uLight;

      // Simplex 3D noise — Ashima Arts / Stefan Gustavson (MIT).
      vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 1.0 / 7.0;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      float fbm(vec3 p) {
        float f = 0.0, a = 0.5;
        for (int i = 0; i < 4; i++) {
          f += a * snoise(p);
          p = p * 2.02 + vec3(1.7, 9.2, 0.0);
          a *= 0.5;
        }
        return f;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
        float t = uTime * 0.045;

        // Height field: slow-drifting terrain + a peak under the pointer.
        vec2 q = uv * 1.25 + vec2(t * 0.6, -t * 0.25);
        float h = fbm(vec3(q, t));
        float d = length(uv - uMouse);
        float peak = exp(-d * d * 7.0);
        h += uPull * 0.55 * peak;

        // Contour lines, anti-aliased by screen-space derivative.
        float levels = 13.0;
        float n = h * levels;
        float f = abs(fract(n) - 0.5);
        float w = fwidth(n);
        float minor = 1.0 - smoothstep(0.0, w * 1.2, 0.5 - f);

        // Every 5th contour is an index line: bolder.
        float idx = floor(n + 0.5);
        float isMajor = 1.0 - step(0.5, abs(mod(idx, 5.0)));
        float majorLine = (1.0 - smoothstep(0.0, w * 2.2, 0.5 - f)) * isMajor;

        // Fade the field toward the lower-left so type stays readable.
        vec2 sv = gl_FragCoord.xy / uRes;
        float field = smoothstep(-0.1, 0.9, sv.x * 0.7 + sv.y * 0.6);
        field = mix(0.35, 1.0, field);

        float lineAmt = minor * 0.16 + majorLine * 0.38;
        lineAmt *= field;

        // Near the pointer the lines warm up to the accent.
        float heat = smoothstep(0.55, 0.0, d) * uPull;
        vec3 lineCol = mix(uLine, uAccent, clamp(heat * 1.4 + isMajor * 0.15, 0.0, 1.0));
        lineAmt += heat * (minor * 0.25 + majorLine * 0.5);

        // Soft accent glow off to the upper right.
        float glow = exp(-length(uv - vec2(0.55, 0.32)) * 2.6) * (0.10 - uLight * 0.05);

        vec3 col = uBg + uAccent * glow;
        col = mix(col, lineCol, clamp(lineAmt, 0.0, 1.0));

        // Vignette.
        float vig = smoothstep(1.25, 0.35, length(uv * vec2(0.8, 1.0)));
        col = mix(uBg, col, mix(0.55, 1.0, vig));

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  function resize() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    renderer.setSize(w, h, false);
    renderer.getDrawingBufferSize(uniforms.uRes.value);
  }
  resize();
  window.addEventListener('resize', resize);

  // Pointer → shader space, smoothed.
  const target = new THREE.Vector2(0.35, 0.1);
  let targetPull = 0.35;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    target.set(
      (e.clientX - r.left - r.width / 2) / r.height,
      -(e.clientY - r.top - r.height / 2) / r.height
    );
    targetPull = 1;
  });
  hero.addEventListener('pointerleave', () => { targetPull = 0.35; });

  window.addEventListener('themechange', () => {
    const c = palette();
    uniforms.uBg.value.copy(c.bg);
    uniforms.uLine.value.copy(c.line);
    uniforms.uAccent.value.copy(c.accent);
    uniforms.uLight.value = c.light;
    if (!running) renderer.render(scene, camera);
  });

  // Only animate while the hero is on screen.
  let running = false;
  let visible = true;
  const clock = new THREE.Clock();

  function frame() {
    if (!visible) { running = false; return; }
    running = true;
    uniforms.uTime.value = clock.getElapsedTime() + 40.0;
    uniforms.uMouse.value.lerp(target, 0.06);
    uniforms.uPull.value += (targetPull - uniforms.uPull.value) * 0.04;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    uniforms.uTime.value = 40.0;
    uniforms.uPull.value = 0.35;
    renderer.render(scene, camera);
  } else {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !running) { clock.getDelta(); frame(); }
    }).observe(hero);
  }
}
