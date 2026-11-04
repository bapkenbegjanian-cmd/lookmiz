// Moteur des ouvertures 3D de Lookmiz.
// Chaque modèle a sa propre scène (fichiers scenes/*.js) ; ce fichier fournit la lumière, la caméra,
// les matières, les particules et le déroulé commun (attente -> ouverture -> carte au premier plan).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const clamp = t => Math.max(0, Math.min(1, t));
export const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const out = t => 1 - Math.pow(1 - t, 3);
export const back = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const seg = (k, a, b) => clamp((k - a) / (b - a));
export const bounce = t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; };

export function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const dot = canvasTex(64, 64, (g) => { const G = g.createRadialGradient(32, 32, 0, 32, 32, 32); G.addColorStop(0, 'rgba(255,255,255,1)'); G.addColorStop(.25, 'rgba(255,255,255,.8)'); G.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = G; g.fillRect(0, 0, 64, 64); });
const starTex = canvasTex(128, 128, (g) => { g.translate(64, 64); const G = g.createRadialGradient(0, 0, 0, 0, 0, 64); G.addColorStop(0, 'rgba(255,255,255,1)'); G.addColorStop(.12, 'rgba(255,255,255,.9)'); G.addColorStop(.4, 'rgba(255,255,255,.12)'); G.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = G; g.fillRect(-64, -64, 128, 128); g.fillStyle = '#fff'; for (const a of [0, Math.PI / 2]) { g.save(); g.rotate(a); g.beginPath(); g.moveTo(-60, 0); g.quadraticCurveTo(0, -4, 60, 0); g.quadraticCurveTo(0, 4, -60, 0); g.fill(); g.restore(); } });

export async function mount(host, o, build) {
  const W = () => host.clientWidth || 360, H = () => host.clientHeight || 640;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08; renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const cam = new THREE.PerspectiveCamera(32, W() / H(), .1, 200);
  const key = new THREE.DirectionalLight(0xfff2e0, 2.6); key.position.set(-3, 6, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 5; key.shadow.bias = -.0005; Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 30 });
  const fill = new THREE.DirectionalLight(0xdfe8ff, .7); fill.position.set(4, 2, 4);
  scene.add(key, fill, new THREE.AmbientLight(0xffffff, .35));

  // --- outils fournis aux scènes ---
  const C = c => new THREE.Color(c);
  const mat = (color, p = {}) => new THREE.MeshPhysicalMaterial({ color: C(color), roughness: p.r ?? .5, metalness: p.m ?? 0, clearcoat: p.cc ?? 0, clearcoatRoughness: p.ccr ?? .3,
    transmission: p.tr ?? 0, thickness: p.th ?? 0, ior: p.ior ?? 1.45, iridescence: p.ir ?? 0, sheen: p.sh ?? 0, sheenColor: C(p.shc ?? '#ffffff'), transparent: !!p.op || !!p.tr, opacity: p.op ?? 1,
    emissive: C(p.em ?? '#000000'), emissiveIntensity: p.ei ?? 1, side: p.ds ? THREE.DoubleSide : THREE.FrontSide, flatShading: !!p.flat, map: p.map || null, bumpMap: p.bump || null, bumpScale: p.bs ?? 1 });
  const gold = p => mat('#d9b25f', { r: .28, m: 1, ...p });
  const M = (geo, m, x = 0, y = 0, z = 0, parent = scene) => { const o3 = new THREE.Mesh(geo, m); o3.position.set(x, y, z); o3.castShadow = o3.receiveShadow = true; parent.add(o3); return o3; };
  const G = (parent = scene, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const geo = {
    box: (w, h, d, r = .05) => new RoundedBoxGeometry(w, h, d, 4, r), sph: (r, s = 40) => new THREE.SphereGeometry(r, s, s * .75 | 0),
    cyl: (rt, rb, h, s = 48) => new THREE.CylinderGeometry(rt, rb, h, s), cone: (r, h, s = 40) => new THREE.ConeGeometry(r, h, s), cap: (r, l) => new THREE.CapsuleGeometry(r, l, 10, 24),
    tor: (r, t, a = Math.PI * 2) => new THREE.TorusGeometry(r, t, 24, 80, a), lathe: (pts, s = 64) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), s),
    plane: (w, h) => new THREE.PlaneGeometry(w, h), ext: (shape, d, bev = .02) => new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 32 }),
  };
  const heartShape = s => { const h = new THREE.Shape(); h.moveTo(0, -s * .9); h.bezierCurveTo(s * 1.1, -s * .1, s * .9, s * .9, 0, s * .45); h.bezierCurveTo(-s * .9, s * .9, -s * 1.1, -s * .1, 0, -s * .9); return h; };
  const starShape = (r, n = 5, k = .45) => { const s = new THREE.Shape(); for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? r * k : r; i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } return s; };
  const textTex = (txt, font, color, w = 1024, h = 256) => canvasTex(w, h, (g) => { g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; let s = h * .7; g.font = `${s}px ${font}`; while (g.measureText(txt).width > w * .92 && s > 20) { s -= 4; g.font = `${s}px ${font}`; } g.fillText(txt, w / 2, h / 2); });
  // sol qui ne montre que les ombres
  const floor = (y = 0, op = .25) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: op })); f.rotation.x = -Math.PI / 2; f.position.y = y; f.receiveShadow = true; scene.add(f); return f; };
  // particules lumineuses (étincelles qui flottent)
  const sparkles = (n, color, box = [4, 3, 2], y0 = 1, size = .12) => {
    const g = new THREE.BufferGeometry(), P = new Float32Array(n * 3), S = []; for (let i = 0; i < n; i++) { P[i * 3] = (Math.random() - .5) * box[0]; P[i * 3 + 1] = y0 + (Math.random() - .5) * box[1]; P[i * 3 + 2] = (Math.random() - .5) * box[2]; S.push(Math.random() * 6.28); }
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    const m = new THREE.PointsMaterial({ map: starTex, color: C(color), size, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 });
    const pts = new THREE.Points(g, m); scene.add(pts);
    return { pts, tick: t => { m.opacity = .55 + .35 * Math.sin(t * 3); for (let i = 0; i < n; i++) P[i * 3 + 1] += Math.sin(t * 1.3 + S[i]) * .0015; g.attributes.position.needsUpdate = true; } };
  };
  // explosion 3D de confettis / pièces / pétales (instancié)
  const bursts = [];
  const burst3 = (origin, colors, n = 120, p = {}) => {
    const shape = p.geo || new THREE.PlaneGeometry(.09, .05), im = new THREE.InstancedMesh(shape, mat('#ffffff', { r: .4, m: p.metal ?? .2, ds: true }), n);
    im.castShadow = !!p.shadow; const col = new THREE.Color(), D = [];
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, el = (p.cone ?? .9) * Math.random() + (p.up ?? .3), v = (p.speed ?? 4.5) * (.5 + Math.random() * .7);
      D.push({ p: new THREE.Vector3(...origin), v: new THREE.Vector3(Math.cos(a) * Math.cos(el) * v * (p.spread ?? 1), Math.sin(el) * v, Math.sin(a) * Math.cos(el) * v * (p.spread ?? 1)), r: new THREE.Euler(Math.random() * 6, Math.random() * 6, 0), w: (Math.random() - .5) * 12 });
      im.setColorAt(i, col.set(colors[i % colors.length])); }
    scene.add(im); const o3 = new THREE.Object3D(), b = { im, D, g: p.g ?? 6, drag: p.drag ?? .985, floor: p.floor ?? -50, life: 0 }; bursts.push(b); return b;
  };
  const stepBursts = dt => { for (const b of bursts) { b.life += dt; const o3 = new THREE.Object3D(); b.D.forEach((d, i) => { d.v.y -= b.g * dt; d.v.multiplyScalar(b.drag); d.p.addScaledVector(d.v, dt);
      if (d.p.y < b.floor) { d.p.y = b.floor; d.v.y *= -.35; d.v.x *= .7; d.v.z *= .7; d.w *= .8; }
      d.r.x += d.w * dt; d.r.y += d.w * .7 * dt; o3.position.copy(d.p); o3.rotation.copy(d.r); o3.updateMatrix(); b.im.setMatrixAt(i, o3.matrix); }); b.im.instanceMatrix.needsUpdate = true; } };
  // personnage « poupée » : tête, yeux, joues, corps ; renvoie les pièces pour l'animer
  const doll = (parent, p = {}) => {
    const g = G(parent, ...(p.pos || [0, 0, 0])), skin = mat(p.skin || '#f6d2b8', { r: .55, sh: .5 }), cloth = mat(p.cloth || '#e86a92', { r: .6, sh: .8, shc: '#ffffff' });
    const body = M(geo.lathe([[0, 0], [.42, 0], [.36, .25], [.22, .7], [.17, .82], [0, .84]]), cloth, 0, 0, 0, g);
    const headG = G(g, 0, 1.12, 0); const head = M(geo.sph(.34), skin, 0, 0, 0, headG);
    const eye = mat('#2a1f1a', { r: .2, cc: 1 }); M(geo.sph(.045, 16), eye, -.12, .03, .3, headG); M(geo.sph(.045, 16), eye, .12, .03, .3, headG);
    const cheek = mat('#ff9fb0', { r: .7, op: .7 }); M(geo.sph(.06, 16), cheek, -.2, -.08, .26, headG).scale.z = .3; M(geo.sph(.06, 16), cheek, .2, -.08, .26, headG).scale.z = .3;
    const smile = M(geo.tor(.07, .014, Math.PI), eye, 0, -.1, .31, headG); smile.rotation.z = Math.PI;
    if (p.hair) { const hm = mat(p.hair, { r: .55, sh: .6 }); const hair = M(geo.sph(.37, 40), hm, 0, .06, -.04, headG); hair.scale.set(1, .92, 1); hair.geometry = new THREE.SphereGeometry(.37, 40, 30, 0, Math.PI * 2, 0, Math.PI * .55); hair.rotation.x = -.35; }
    const armL = G(g, -.24, .72, 0), armR = G(g, .24, .72, 0);
    M(geo.cap(.07, .3), skin, 0, -.2, 0, armL); M(geo.cap(.07, .3), skin, 0, -.2, 0, armR); armL.rotation.z = -.4; armR.rotation.z = .4;
    return { g, headG, armL, armR, body };
  };

  const ctx = { THREE, scene, cam, key, o, C, mat, gold, M, G, geo, heartShape, starShape, textTex, floor, sparkles, burst3, doll, canvasTex,
    clamp, ease, out, back, seg, bounce, look: new THREE.Vector3(0, .9, 0), camPos: new THREE.Vector3(0, 2.2, 7), fitW: 3.6 };
  const S = await build(ctx);
  const fit = () => { const a = W() / H(); cam.aspect = a; cam.updateProjectionMatrix(); renderer.setSize(W(), H());
    const d = Math.max(ctx.fitW / (2 * Math.tan(THREE.MathUtils.degToRad(16)) * a), ctx.fitW * .8 / (2 * Math.tan(THREE.MathUtils.degToRad(16))));
    ctx.dist = d; };
  fit();
  const base = ctx.camPos.clone().sub(ctx.look).normalize();
  let t0 = performance.now(), last = t0, openAt = 0, raf = 0, alive = true, done = null;
  const tick = now => {
    if (!alive) return; raf = requestAnimationFrame(tick);
    const t = (now - t0) / 1000, dt = Math.min(.05, (now - last) / 1000); last = now;
    const k = openAt ? (now - openAt) / 1000 : -1;
    const zoom = openAt && S.zoom ? S.zoom(k) : 0;
    cam.position.copy(base).multiplyScalar(ctx.dist * (1 - zoom * .35)).add(ctx.look).add(new THREE.Vector3(Math.sin(t * .4) * .12, Math.sin(t * .5) * .06, 0));
    cam.lookAt(ctx.look);
    if (openAt) { S.open(k, t, dt); if (k > S.dur && done) { const r = done; done = null; r(); } } else S.idle(t, dt);
    stepBursts(dt);
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(tick);
  const onResize = () => fit(); addEventListener('resize', onResize);
  return {
    open() { if (openAt) return Promise.resolve(); openAt = performance.now(); S.start && S.start(); return new Promise(r => { done = r; }); },
    destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', onResize); renderer.dispose(); pm.dispose(); renderer.domElement.remove(); },
  };
}
