/* =========================================================
   HERO WebGL : la vidéo de yole passe dans un shader
   - ondulation de l'eau autour de la souris (ripple)
   - léger décalage RVB selon la vitesse du curseur
   - au scroll : la vague s'amplifie et l'image se dissout vers le bleu nuit
   npm i three
   ========================================================= */
import * as THREE from 'three';

const vert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uRes, uTexRes, uMouse;
  uniform float uTime, uHover, uVel, uScroll;
  varying vec2 vUv;

  // UV en mode "cover" (comme object-fit: cover)
  vec2 coverUv(vec2 uv){
    float rs = uRes.x / uRes.y, ri = uTexRes.x / uTexRes.y;
    vec2 s = rs > ri ? vec2(1., ri / rs) : vec2(rs / ri, 1.);
    return (uv - .5) * s + .5;
  }

  void main(){
    vec2 uv = vUv;
    vec2 asp = vec2(uRes.x / uRes.y, 1.);

    // Ondulation de l'eau autour du curseur
    float d = distance(uv * asp, uMouse * asp);
    float ring = sin(d * 38. - uTime * 3.2) * smoothstep(.38, .0, d);
    uv += normalize(uv - uMouse + 1e-4) * ring * .0065 * uHover;

    // Houle au scroll (amplitude croissante)
    uv.x += sin(uv.y * 9. + uTime * .9) * .012 * uScroll;
    uv.y += cos(uv.x * 7. + uTime * .7) * .010 * uScroll;
    uv = (uv - .5) * (1. - uScroll * .08) + .5;          // léger zoom avant

    vec2 cuv = coverUv(uv);
    cuv.x = 1. - cuv.x;                                  // miroir : la yole passe à droite du titre
    float shift = .0035 * uVel + .004 * uScroll;           // décalage RVB
    vec3 col;
    col.r = texture2D(uTex, cuv + vec2(shift, 0.)).r;
    col.g = texture2D(uTex, cuv).g;
    col.b = texture2D(uTex, cuv - vec2(shift, 0.)).b;

    // Fondu vers le bleu nuit de la charte en sortie de hero
    vec3 night = vec3(.024, .102, .18);
    col = mix(col, night, smoothstep(.15, 1., uScroll) * .85);
    gl_FragColor = vec4(col, 1.);
  }
`;

export function initHeroGL({ video, container, gsap }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // plafonné pour la perf mobile
  container.insertBefore(renderer.domElement, video.nextSibling); // sous le voile dégradé
  renderer.domElement.className = 'hero__gl';

  const tex = new THREE.VideoTexture(video);
  tex.colorSpace = THREE.SRGBColorSpace;
  const uniforms = {
    uTex: { value: tex },
    uRes: { value: new THREE.Vector2(1, 1) },
    uTexRes: { value: new THREE.Vector2(1280, 720) },
    uMouse: { value: new THREE.Vector2(.5, .5) },
    uTime: { value: 0 }, uHover: { value: 0 }, uVel: { value: 0 }, uScroll: { value: 0 },
  };
  const scene = new THREE.Scene();
  const cam = new THREE.Camera();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms })));

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height, false);
    uniforms.uRes.value.set(width, height);
  };
  resize();
  window.addEventListener('resize', resize);
  video.addEventListener('loadedmetadata', () => uniforms.uTexRes.value.set(video.videoWidth, video.videoHeight));

  // Souris lissée (lerp) + vitesse
  const target = new THREE.Vector2(.5, .5);
  let last = { x: 0, y: 0, t: performance.now() };
  container.closest('section').addEventListener('pointermove', (e) => {
    const r = container.getBoundingClientRect();
    target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    const now = performance.now(), dt = Math.max(16, now - last.t);
    const v = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt;
    gsap.to(uniforms.uVel, { value: Math.min(v, 2.5), duration: .3, overwrite: true });
    gsap.to(uniforms.uVel, { value: 0, duration: 1.2, delay: .3 });
    last = { x: e.clientX, y: e.clientY, t: now };
    gsap.to(uniforms.uHover, { value: 1, duration: .6, overwrite: 'auto' });
  });
  container.closest('section').addEventListener('pointerleave', () => gsap.to(uniforms.uHover, { value: 0, duration: 1 }));

  // Boucle : en pause quand le hero n'est pas visible
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(container);
  gsap.ticker.add((t) => {
    if (!visible) return;
    uniforms.uTime.value = t;
    uniforms.uMouse.value.lerp(target, .08);
    renderer.render(scene, cam);
  });
  return uniforms;
}
