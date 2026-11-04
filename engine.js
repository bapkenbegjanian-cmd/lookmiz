// Moteur 3D de Lookmiz.
// Un seul rendu WebGL par « calque » (la page, ou la fenêtre d'ouverture) : chaque vignette de la page
// est une zone transparente, et le moteur dessine sa scène exactement à cet endroit. Ainsi la galerie
// peut montrer plusieurs animations vivantes sans multiplier les contextes WebGL.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const clamp = t => Math.max(0, Math.min(1, t));
export const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const out = t => 1 - Math.pow(1 - t, 3);
export const inq = t => t * t * t;
export const back = t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const seg = (k, a, b) => clamp((k - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export const bounce = t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; };
export const spring = (t, f = 9, d = 4) => 1 - Math.exp(-d * t) * Math.cos(f * t);

export function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
let STAR = null;
const starTex = () => STAR || (STAR = canvasTex(128, 128, g => { g.translate(64, 64); const G = g.createRadialGradient(0, 0, 0, 0, 0, 64); G.addColorStop(0, 'rgba(255,255,255,1)'); G.addColorStop(.1, 'rgba(255,255,255,.9)'); G.addColorStop(.35, 'rgba(255,255,255,.12)'); G.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = G; g.fillRect(-64, -64, 128, 128); g.fillStyle = '#fff'; for (const a of [0, Math.PI / 2]) { g.save(); g.rotate(a); g.beginPath(); g.moveTo(-62, 0); g.quadraticCurveTo(0, -3.5, 62, 0); g.quadraticCurveTo(0, 3.5, -62, 0); g.fill(); g.restore(); } }));
// grain fin (papier, sable, tissu) : carte de relief en niveaux de gris
const GRAIN = {};
export const grain = (kind = 'paper') => GRAIN[kind] || (GRAIN[kind] = (() => { const t = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); const d = g.getImageData(0, 0, w, h), a = kind === 'sand' ? 60 : kind === 'cloth' ? 18 : 24;
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (Math.random() - .5) * a; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; } g.putImageData(d, 0, 0);
  if (kind === 'paper') { g.globalAlpha = .07; for (let i = 0; i < 900; i++) { g.strokeStyle = Math.random() < .5 ? '#fff' : '#000'; g.lineWidth = Math.random() * 1.2; g.beginPath(); const x = Math.random() * w, y = Math.random() * h, an = Math.random() * 6.28, l = 6 + Math.random() * 22; g.moveTo(x, y); g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke(); } }
  if (kind === 'cloth') { g.globalAlpha = .12; for (let y = 0; y < h; y += 3) { g.fillStyle = y % 6 ? '#000' : '#fff'; g.fillRect(0, y, w, 1); } for (let x = 0; x < w; x += 3) { g.fillStyle = x % 6 ? '#000' : '#fff'; g.fillRect(x, 0, 1, h); } }
}, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })());

function dispose(obj) {
  obj.traverse(o => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    ms.forEach(m => { for (const k in m) { const v = m[k]; if (v && v.isTexture && v !== STAR && !Object.values(GRAIN).includes(v)) v.dispose(); } m.dispose(); }); });
}

/* ---------- une vue = une scène dessinée dans un élément de la page ---------- */
class View {
  constructor(layer, el, build, o, opt) {
    this.layer = layer; this.el = el; this.build = build; this.o = o; this.opt = opt; this.alive = true; this.make();
  }
  make() {
    const L = this.layer, o = this.o, opt = this.opt;
    const scene = new THREE.Scene(); scene.environment = L.env;
    const cam = new THREE.PerspectiveCamera(30, 1, .1, 200);
    const key = new THREE.DirectionalLight(0xfff3e4, 2.5); key.position.set(-3, 6, 5);
    if (opt.shadows) { key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 5; key.shadow.bias = -.0005; Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 30 }); }
    const fill = new THREE.DirectionalLight(0xe4ecff, .7); fill.position.set(4, 2, 4);
    scene.add(key, fill, new THREE.AmbientLight(0xffffff, .3));
    const C = c => new THREE.Color(c);
    const mat = (color, p = {}) => new THREE.MeshPhysicalMaterial({ color: C(color), roughness: p.r ?? .5, metalness: p.m ?? 0, clearcoat: p.cc ?? 0, clearcoatRoughness: p.ccr ?? .3,
      transmission: p.tr ?? 0, thickness: p.th ?? 0, ior: p.ior ?? 1.45, iridescence: p.ir ?? 0, sheen: p.sh ?? 0, sheenRoughness: p.shr ?? .6, sheenColor: C(p.shc ?? '#ffffff'),
      transparent: p.op != null && p.op < 1, opacity: p.op ?? 1, emissive: C(p.em ?? '#000000'), emissiveIntensity: p.ei ?? 1, side: p.ds ? THREE.DoubleSide : p.bk ? THREE.BackSide : THREE.FrontSide,
      flatShading: !!p.flat, map: p.map || null, bumpMap: p.bump || null, bumpScale: p.bs ?? 1, roughnessMap: p.rmap || null, depthWrite: p.dw ?? true });
    const gold = p => mat('#d8b15c', { r: .26, m: 1, ...p });
    if (opt.bg) scene.background = C(opt.bg);
    const M = (geo, m, x = 0, y = 0, z = 0, parent = scene) => { const o3 = new THREE.Mesh(geo, m); o3.position.set(x, y, z); o3.castShadow = o3.receiveShadow = !!opt.shadows; parent.add(o3); return o3; };
    const G = (parent = scene, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
    const geo = {
      box: (w, h, d, r = .05, s = 4) => new RoundedBoxGeometry(w, h, d, s, r), sph: (r, s = 40) => new THREE.SphereGeometry(r, s, Math.max(8, s * .75 | 0)),
      cyl: (rt, rb, h, s = 48, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open), cone: (r, h, s = 40) => new THREE.ConeGeometry(r, h, s), cap: (r, l, s = 24) => new THREE.CapsuleGeometry(r, l, 10, s),
      tor: (r, t, a = Math.PI * 2, s = 80) => new THREE.TorusGeometry(r, t, 24, s, a), lathe: (pts, s = 64) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), s),
      plane: (w, h, sx = 1, sy = 1) => new THREE.PlaneGeometry(w, h, sx, sy), circle: (r, s = 48) => new THREE.CircleGeometry(r, s),
      ext: (shape, d, bev = .02, cs = 32) => new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: cs }),
      tube: (pts, r, n = 200, closed = false) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), closed), n, r, 10, closed),
    };
    const heart = s => { const h = new THREE.Shape(); h.moveTo(0, -s * .9); h.bezierCurveTo(s * 1.1, -s * .1, s * .9, s * .9, 0, s * .45); h.bezierCurveTo(-s * .9, s * .9, -s * 1.1, -s * .1, 0, -s * .9); return h; };
    const star = (r, n = 5, k = .45) => { const s = new THREE.Shape(); for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? r * k : r; i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } return s; };
    const shape = pts => { const s = new THREE.Shape(); s.moveTo(...pts[0]); pts.slice(1).forEach(p => s.lineTo(...p)); s.closePath(); return s; };
    const floor = (y = 0, op = .22) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: op })); f.rotation.x = -Math.PI / 2; f.position.y = y; f.receiveShadow = true; scene.add(f); return f; };
    const wall = (z = -.4, op = .2) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: op })); f.position.z = z; f.receiveShadow = true; scene.add(f); return f; };
    // ombre douce posée au sol, même sans ombres calculées (vignettes)
    const blob = (r = 1, y = .002, op = .28, x = 0, z = 0) => { const t = canvasTex(128, 128, g => { const R = g.createRadialGradient(64, 64, 0, 64, 64, 64); R.addColorStop(0, `rgba(0,0,0,${op})`); R.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = R; g.fillRect(0, 0, 128, 128); });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); scene.add(m); return m; };
    const sparkles = (n, color, box = [4, 3, 2], y0 = 1, size = .12) => {
      const g = new THREE.BufferGeometry(), P = new Float32Array(n * 3), S = []; for (let i = 0; i < n; i++) { P[i * 3] = (Math.random() - .5) * box[0]; P[i * 3 + 1] = y0 + (Math.random() - .5) * box[1]; P[i * 3 + 2] = (Math.random() - .5) * box[2]; S.push(Math.random() * 6.28); }
      g.setAttribute('position', new THREE.BufferAttribute(P, 3));
      const m = new THREE.PointsMaterial({ map: starTex(), color: C(color), size, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 });
      const pts = new THREE.Points(g, m); scene.add(pts);
      return { pts, tick: t => { m.opacity = .5 + .4 * Math.sin(t * 2.6); for (let i = 0; i < n; i++) P[i * 3 + 1] += Math.sin(t * 1.3 + S[i]) * .0015; g.attributes.position.needsUpdate = true; } };
    };
    const bursts = this.bursts = [];
    const burst3 = (origin, colors, n = 120, p = {}) => {
      const shapeG = p.geo || new THREE.PlaneGeometry(.09, .05), im = new THREE.InstancedMesh(shapeG, p.mat || mat('#ffffff', { r: .4, m: p.metal ?? .15, ds: true }), n);
      const col = new THREE.Color(), D = [];
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, el = (p.cone ?? .9) * Math.random() + (p.up ?? .3), v = (p.speed ?? 4.5) * (.5 + Math.random() * .7);
        D.push({ p: new THREE.Vector3(...origin), v: new THREE.Vector3(Math.cos(a) * Math.cos(el) * v * (p.spread ?? 1), Math.sin(el) * v, Math.sin(a) * Math.cos(el) * v * (p.spread ?? 1)), r: new THREE.Euler(Math.random() * 6, Math.random() * 6, 0), w: (Math.random() - .5) * (p.spin ?? 12) });
        if (!p.mat) im.setColorAt(i, col.set(colors[i % colors.length])); }
      scene.add(im); const b = { im, D, g: p.g ?? 6, drag: p.drag ?? .985, floor: p.floor ?? -50, flut: p.flutter ?? 0 }; bursts.push(b); return b;
    };
    const textTex = (txt, font, color, w = 1024, h = 256) => canvasTex(w, h, g => { g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; let s = h * .7; g.font = `${s}px ${font}`; while (g.measureText(txt).width > w * .92 && s > 20) { s -= 4; g.font = `${s}px ${font}`; } g.fillText(txt, w / 2, h / 2); });
    // poupée : tête, yeux brillants, joues, corps évasé, bras articulés
    const doll = (parent, p = {}) => {
      const g = G(parent, ...(p.pos || [0, 0, 0])), skin = mat(p.skin || '#f3cdb0', { r: .55, sh: .4 }), cloth = mat(p.cloth || '#e86a92', { r: .65, sh: .8, shc: '#ffffff', bump: grain('cloth'), bs: .4 });
      const body = M(geo.lathe([[0, 0], [.42, 0], [.38, .12], [.26, .55], [.18, .8], [0, .84]]), cloth, 0, 0, 0, g);
      const headG = G(g, 0, 1.13, 0); M(geo.sph(.34), skin, 0, 0, 0, headG);
      const eyeM = mat('#2a1d16', { r: .15, cc: 1 }), hi = mat('#ffffff', { em: '#ffffff', ei: .6 });
      for (const x of [-.12, .12]) { M(geo.sph(.048, 20), eyeM, x, .03, .3, headG); M(geo.sph(.014, 8), hi, x + .015, .05, .345, headG); }
      const cheek = mat('#ff9fb0', { r: .8, op: .55, dw: false }); for (const x of [-.2, .2]) M(geo.sph(.06, 16), cheek, x, -.08, .27, headG).scale.z = .3;
      const smile = M(geo.tor(.065, .013, Math.PI, 24), eyeM, 0, -.1, .315, headG); smile.rotation.z = Math.PI;
      if (p.hair) { const hm = mat(p.hair, { r: .5, sh: .7 }); const hair = M(new THREE.SphereGeometry(.37, 40, 30, 0, Math.PI * 2, 0, Math.PI * .56), hm, 0, .05, -.03, headG); hair.rotation.x = -.38; }
      const armL = G(g, -.22, .74, 0), armR = G(g, .22, .74, 0);
      M(geo.cap(.065, .3), skin, 0, -.2, 0, armL); M(geo.cap(.065, .3), skin, 0, -.2, 0, armR); armL.rotation.z = -.35; armR.rotation.z = .35;
      return { g, headG, armL, armR, body };
    };
    const ctx = this.ctx = { THREE, scene, cam, key, fill, o, opt, C, mat, gold, M, G, geo, heart, star, heartShape: heart, starShape: star, shape, textTex, floor, wall, blob, sparkles, burst3, doll, canvasTex, grain,
      clamp, ease, out, inq, back, seg, lerp, bounce, spring, look: new THREE.Vector3(0, .9, 0), camPos: new THREE.Vector3(0, 2.2, 7), fitW: 3.6, fitH: 3.2, fov: 30 };
    this.scene = scene; this.cam = cam;
    this.S = this.build(ctx);
    cam.fov = ctx.fov;
    this.t0 = performance.now(); this.last = this.t0; this.openAt = 0; this.done = null; this.aspect = 0;
  }
  fit(a) {
    const c = this.ctx, tn = Math.tan(THREE.MathUtils.degToRad(c.fov / 2));
    this.cam.aspect = a; this.cam.updateProjectionMatrix();
    this.dist = Math.max(c.fitW / (2 * tn * a), c.fitH / (2 * tn)); this.dir = c.camPos.clone().sub(c.look).normalize(); this.aspect = a;
  }
  frame(now, w, h) {
    if (Math.abs(w / h - this.aspect) > .001) this.fit(w / h);
    const t = (now - this.t0) / 1000, dt = Math.min(.05, (now - this.last) / 1000); this.last = now;
    const S = this.S, c = this.ctx;
    // en boucle (galerie, accueil) : attente, ouverture, pause, puis on recommence
    if (this.opt.loop && !this.openAt && t > (this.opt.wait ?? 2.2)) this.open();
    const k = this.openAt ? (now - this.openAt) / 1000 : -1;
    const z = this.openAt && S.zoom && this.opt.zoom ? S.zoom(k) : 0;
    this.cam.position.copy(this.dir).multiplyScalar(this.dist * (1 - z * .3)).add(c.look).add(new THREE.Vector3(Math.sin(t * .4) * .1, Math.sin(t * .5) * .05, 0));
    this.cam.lookAt(c.look);
    if (this.openAt) { S.open(k, t, dt); if (k > S.dur && this.done) { const r = this.done; this.done = null; r(); }
      if (this.opt.loop && k > S.dur + (this.opt.hold ?? 2.6)) { this.reset(); return; } }
    else S.idle(t, dt);
    this.stepBursts(dt);
  }
  stepBursts(dt) {
    const o3 = new THREE.Object3D();
    for (const b of this.bursts) { b.D.forEach((d, i) => { d.v.y -= b.g * dt; d.v.multiplyScalar(b.drag); if (b.flut) { d.v.x += Math.sin(d.r.x * 3) * b.flut * dt; d.v.y = Math.max(d.v.y, -b.flut * 1.2); } d.p.addScaledVector(d.v, dt);
      if (d.p.y < b.floor) { d.p.y = b.floor; d.v.y *= -.3; d.v.x *= .6; d.v.z *= .6; d.w *= .7; }
      d.r.x += d.w * dt; d.r.y += d.w * .7 * dt; o3.position.copy(d.p); o3.rotation.copy(d.r); o3.updateMatrix(); b.im.setMatrixAt(i, o3.matrix); }); b.im.instanceMatrix.needsUpdate = true; }
  }
  open() { if (this.openAt) return Promise.resolve(); this.openAt = performance.now(); this.S.start && this.S.start(); return new Promise(r => { this.done = r; }); }
  reset() { dispose(this.scene); this.make(); }
  destroy() { this.alive = false; dispose(this.scene); this.layer.views.delete(this); }
}

/* ---------- un calque = un canvas fixe derrière le contenu ---------- */
class Layer {
  constructor(host, { dpr = 2, z = 0 } = {}) {
    const cv = this.cv = document.createElement('canvas'); cv.className = 'gl3';
    cv.style.cssText = `position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:${z}`;
    host.prepend(cv);
    const r = this.r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(dpr, devicePixelRatio || 1)); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace; r.setClearColor(0x000000, 0);
    const pm = new THREE.PMREMGenerator(r); this.env = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose();
    this.views = new Set(); this.raf = 0; this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop);
  }
  add(el, build, o = {}, opt = {}) { const v = new View(this, el, build, o, { shadows: true, ...opt }); this.views.add(v); return v; }
  loop(now) {
    this.raf = requestAnimationFrame(this.loop);
    const cv = this.cv, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    if (cv.width !== Math.round(W * this.r.getPixelRatio()) || cv.height !== Math.round(H * this.r.getPixelRatio())) this.r.setSize(W, H, false);
    this.r.setScissorTest(false); this.r.setClearColor(0x000000, 0); this.r.clear();
    this.r.setScissorTest(true);
    for (const v of this.views) {
      if (!v.el.isConnected) { v.destroy(); continue; }
      const b = v.el.getBoundingClientRect(); if (b.bottom < 0 || b.top > H || b.right < 0 || b.left > W || b.width < 2) continue;
      v.frame(now, b.width, b.height);
      const y = H - b.bottom; this.r.setViewport(b.left, y, b.width, b.height);
      const sx = Math.max(0, b.left), sy = Math.max(0, y), sw = Math.min(W, b.right) - sx, sh = Math.min(H, H - b.top) - sy; if (sw <= 0 || sh <= 0) continue;
      this.r.setScissor(sx, sy, sw, sh);
      this.r.render(v.scene, v.cam);
    }
  }
  clear() { [...this.views].forEach(v => v.destroy()); }
  destroy() { cancelAnimationFrame(this.raf); this.clear(); this.r.dispose(); this.cv.remove(); }
}

export function createLayer(host, opt) { return new Layer(host, opt); }

// trouve la scène d'un modèle (fichier scenes/<occasion>.js), sinon l'enveloppe
const cache = {};
export async function builderFor(occ, idx, useEnvelope) {
  if (!useEnvelope) { try { const S = cache[occ] || (cache[occ] = await import('./scenes/' + occ + '.js')); if (S.default[idx]) return S.default[idx]; } catch (_) {} }
  const E = cache._env || (cache._env = await import('./scenes/enveloppe.js')); return E.default;
}
export async function fontsReady() { try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]); } catch (_) {} }
