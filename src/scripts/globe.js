/* =========================================================
   GLOBE 3D des implantations (three.js)
   - terres en nuage de points, atmosphère en dégradé de Fresnel
   - arcs animés depuis le siège (Le Lamentin, Martinique)
   - focus(id) fait tourner le globe vers le territoire choisi
   ========================================================= */
import * as THREE from 'three';

const RAD = Math.PI / 180;
// lat/lon -> position sur la sphère (lon 0 / lat 0 face caméra)
const toXYZ = (lat, lon, r = 1) => new THREE.Vector3(
  r * Math.cos(lat * RAD) * Math.sin(lon * RAD),
  r * Math.sin(lat * RAD),
  r * Math.cos(lat * RAD) * Math.cos(lon * RAD),
);

export async function initGlobe({ canvasWrap, territoires, gsap, onPick }) {
  const W = () => canvasWrap.clientWidth, H = () => canvasWrap.clientHeight;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  canvasWrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, W() / H(), .1, 100);
  camera.position.set(0, 0, 4.2);

  const globe = new THREE.Group();
  scene.add(globe);

  // Sphère pleine (océan) bleu nuit
  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(.995, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x0a2a4a, transparent: true, opacity: .92 }),
  ));

  // Terres : points chargés à la demande
  const data = await fetch('data/land.json').then((r) => r.json());
  const pos = new Float32Array(data.length * 1.5);
  for (let i = 0, j = 0; i < data.length; i += 2, j += 3) {
    const v = toXYZ(data[i], data[i + 1], 1.002);
    pos[j] = v.x; pos[j + 1] = v.y; pos[j + 2] = v.z;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  globe.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x7fd3ff, size: .012, transparent: true, opacity: .85, sizeAttenuation: true })));

  // Atmosphère (Fresnel), couleur de marque #009CE3
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 64, 64),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { c: { value: new THREE.Color(0x009ce3) } },
      vertexShader: 'varying vec3 n; void main(){ n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: 'uniform vec3 c; varying vec3 n; void main(){ float i = pow(.72 - dot(n, vec3(0,0,1.)), 3.); gl_FragColor = vec4(c, 1.) * i * .85; }',
    }),
  );
  scene.add(atmo);

  // Repères + arcs
  const POP = new THREE.Color(0xff5b1f), WHITE = new THREE.Color(0xffffff);
  const siege = territoires.find((t) => t.siege);
  const pins = {}, arcs = {};
  territoires.forEach((t) => {
    const p = toXYZ(t.lat, t.lon, 1.01);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.022, 16, 16), new THREE.MeshBasicMaterial({ color: WHITE }));
    dot.position.copy(p);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.03, .045, 40), new THREE.MeshBasicMaterial({ color: POP, transparent: true, opacity: 0, side: THREE.DoubleSide }));
    ring.position.copy(p); ring.lookAt(p.clone().multiplyScalar(2));
    dot.userData.id = t.id;
    globe.add(dot, ring);
    pins[t.id] = { dot, ring };

    if (!t.siege) {
      const a = toXYZ(siege.lat, siege.lon, 1.01), b = p;
      const mid = a.clone().add(b).multiplyScalar(.5);
      const lift = 1 + a.distanceTo(b) * .45;
      const curve = new THREE.QuadraticBezierCurve3(a, mid.normalize().multiplyScalar(lift), b);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
      geo.setDrawRange(0, 0);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: WHITE, transparent: true, opacity: .45 }));
      globe.add(line);
      arcs[t.id] = line;
    }
  });

  // Dessin des arcs (appelé quand la section entre à l'écran)
  const drawArcs = () => Object.values(arcs).forEach((l, i) => {
    const o = { n: 0 };
    gsap.to(o, { n: 81, duration: 1.4, delay: i * .12, ease: 'power2.inOut', onUpdate: () => l.geometry.setDrawRange(0, Math.round(o.n)) });
  });

  // Rotation vers un territoire (chemin le plus court)
  let current = null;
  const focus = (id) => {
    const t = territoires.find((x) => x.id === id);
    if (!t) return;
    current = id;
    const tx = t.lat * RAD * .85, cy = globe.rotation.y;
    let ty = -t.lon * RAD;
    ty = cy + ((((ty - cy) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
    gsap.to(globe.rotation, { x: tx, y: ty, duration: 1.4, ease: 'power3.inOut', overwrite: true });
    Object.entries(pins).forEach(([k, { dot, ring }]) => {
      const on = k === id;
      dot.material.color.copy(on ? POP : WHITE);
      gsap.to(dot.scale, { x: on ? 1.6 : 1, y: on ? 1.6 : 1, z: on ? 1.6 : 1, duration: .5 });
      ring.material.opacity = on ? 1 : 0;
    });
    Object.entries(arcs).forEach(([k, l]) => {
      l.material.color.copy(k === id ? POP : WHITE);
      l.material.opacity = k === id ? 1 : .35;
    });
  };

  // Glisser pour tourner + clic sur un repère
  const ray = new THREE.Raycaster(), m = new THREE.Vector2();
  let drag = null;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, rx: globe.rotation.x, ry: globe.rotation.y, moved: false }; });
  window.addEventListener('pointerup', (e) => {
    if (drag && !drag.moved) {
      const r = el.getBoundingClientRect();
      m.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(m, camera);
      ray.params.Points = { threshold: 0 };
      const hit = ray.intersectObjects(Object.values(pins).map((p) => p.dot))[0];
      if (hit) onPick(hit.object.userData.id);
    }
    drag = null;
  });
  el.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerType === 'touch') return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    gsap.killTweensOf(globe.rotation);
    globe.rotation.y = drag.ry + dx * .006;
    globe.rotation.x = Math.max(-1, Math.min(1, drag.rx + dy * .004));
  });

  const resize = () => { camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); };
  new ResizeObserver(resize).observe(canvasWrap); // couvre l'affichage tardif du conteneur

  let visible = false, t0 = 0;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvasWrap);
  gsap.ticker.add((t) => {
    if (!visible) return;
    // pulsation de l'anneau actif
    if (current) {
      const { ring } = pins[current];
      const s = 1 + ((t - t0) % 1.6) / 1.6 * 1.8;
      ring.scale.setScalar(s); ring.material.opacity = 1 - (s - 1) / 1.8;
    }
    renderer.render(scene, camera);
  });

  return { focus, drawArcs };
}
