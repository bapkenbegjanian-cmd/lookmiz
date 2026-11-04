// Enveloppe 3D réaliste (Three.js) : papier texturé, doublure, cachet de cire gravé, lumière et ombres.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const out = t => 1 - Math.pow(1 - t, 3);
const clamp = t => Math.max(0, Math.min(1, t));

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
// grain du papier (fibres) : sert de relief
function paperBump() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    const d = g.getImageData(0, 0, w, h);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 26; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; }
    g.putImageData(d, 0, 0);
    g.globalAlpha = .08;
    for (let i = 0; i < 900; i++) { g.strokeStyle = Math.random() < .5 ? '#fff' : '#000'; g.lineWidth = Math.random() * 1.2; g.beginPath();
      const x = Math.random() * w, y = Math.random() * h, a = Math.random() * 6.28, l = 6 + Math.random() * 22; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  }, false);
}
// doublure intérieure : motif fin doré sur la couleur du modèle
function linerTex(base, gold) {
  const t = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); g.strokeStyle = gold; g.globalAlpha = .55; g.lineWidth = 1.4;
    for (let y = 0; y < h + 64; y += 64) for (let x = 0; x < w + 64; x += 64) {
      const ox = (y / 64) % 2 ? 32 : 0; g.beginPath(); g.ellipse(x + ox, y, 14, 22, 0, 0, 6.283); g.stroke();
      g.beginPath(); g.arc(x + ox, y, 3, 0, 6.283); g.fillStyle = gold; g.fill(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t;
}
// gravure du cachet : initiales + couronne de perles (carte de relief)
function sealBump(ini, font) {
  return canvasTex(512, 512, (g, w, h) => {
    const G = g.createRadialGradient(256, 256, 120, 256, 256, 256); G.addColorStop(0, '#9a9a9a'); G.addColorStop(.86, '#8a8a8a'); G.addColorStop(1, '#5a5a5a');
    g.fillStyle = G; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2a2a2a'; g.lineWidth = 10; g.beginPath(); g.arc(256, 256, 214, 0, 6.283); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.arc(256, 256, 188, 0, 6.283); g.stroke();
    g.fillStyle = '#2a2a2a'; for (let i = 0; i < 48; i++) { const a = i / 48 * 6.283; g.beginPath(); g.arc(256 + Math.cos(a) * 201, 256 + Math.sin(a) * 201, 4.2, 0, 6.283); g.fill(); }
    g.fillStyle = '#ededed'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${ini.length > 1 ? 190 : 260}px ${font}`;
    g.shadowColor = '#000'; g.shadowBlur = 18; g.fillText(ini, 256, 270);
  }, false);
}
// la lettre qui sort de l'enveloppe
function letterTex(paper, ink, acc, title, pre, font) {
  return canvasTex(1024, 680, (g, w, h) => {
    g.fillStyle = paper; g.fillRect(0, 0, w, h);
    g.strokeStyle = acc; g.lineWidth = 3; g.strokeRect(34, 34, w - 68, h - 68); g.lineWidth = 1; g.strokeRect(48, 48, w - 96, h - 96);
    g.fillStyle = acc; g.textAlign = 'center'; g.font = '600 26px Inter, sans-serif'; g.fillText(pre.toUpperCase().split('').join(' '), w / 2, 210);
    g.fillStyle = ink; let s = 92; g.font = `${s}px ${font}`; while (g.measureText(title).width > w - 170 && s > 40) { s -= 4; g.font = `${s}px ${font}`; }
    g.fillText(title, w / 2, 350);
    g.strokeStyle = acc; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2 - 150, 420); g.lineTo(w / 2 - 20, 420); g.moveTo(w / 2 + 20, 420); g.lineTo(w / 2 + 150, 420); g.stroke();
    g.beginPath(); g.arc(w / 2, 420, 6, 0, 6.283); g.fillStyle = acc; g.fill();
  });
}

export async function mount(host, o) {
  const fontTitle = '"Instrument Serif", "Playfair Display", serif', fontSeal = '"Cinzel", "Playfair Display", serif';
  try { await Promise.all([document.fonts.load('92px "Instrument Serif"'), document.fonts.load('200px "Cinzel"')]); } catch (_) {}
  const W = () => host.clientWidth, H = () => host.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const cam = new THREE.PerspectiveCamera(32, W() / H(), .1, 100);
  const fit = () => { const a = W() / H(); cam.aspect = a; const need = Math.max(3.8 / (2 * Math.tan(THREE.MathUtils.degToRad(16)) * a), 3.2 / (2 * Math.tan(THREE.MathUtils.degToRad(16))));
    cam.userData.d = need; cam.updateProjectionMatrix(); renderer.setSize(W(), H()); };
  fit();

  const key = new THREE.DirectionalLight(0xfff4e6, 2.4); key.position.set(-3, 4, 6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.bias = -.0004; Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 20 });
  scene.add(key, new THREE.AmbientLight(0xffffff, .35));
  const rim = new THREE.DirectionalLight(0xffffff, .6); rim.position.set(4, -2, 3); scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .22 })); ground.position.z = -.35; ground.receiveShadow = true; scene.add(ground);

  const bump = paperBump(); bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(2, 2);
  const paperMat = (c, k = 1) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c).multiplyScalar(k), roughness: .88, metalness: 0, bumpMap: bump, bumpScale: .6, side: THREE.FrontSide });
  const gold = '#' + new THREE.Color(o.acc).lerp(new THREE.Color('#d8b36a'), .55).getHexString();
  const linerMap = linerTex('#' + new THREE.Color(o.liner || o.acc).multiplyScalar(.55).getHexString(), gold);
  const linerMat = new THREE.MeshStandardMaterial({ map: linerMap, roughness: .7, metalness: .15, side: THREE.BackSide });

  const env = new THREE.Group(); scene.add(env);
  const EW = 3.2, EH = 2.1, hw = EW / 2, hh = EH / 2;
  const shape = pts => { const s = new THREE.Shape(); s.moveTo(...pts[0]); pts.slice(1).forEach(p => s.lineTo(...p)); s.closePath(); return s; };
  const mesh = (geo, mat, z) => { const m = new THREE.Mesh(geo, mat); m.position.z = z; m.castShadow = m.receiveShadow = true; return m; };
  // dos (l'intérieur porte la doublure)
  const back = mesh(new THREE.PlaneGeometry(EW, EH), new THREE.MeshStandardMaterial({ map: linerMap, roughness: .75 }), 0); env.add(back);
  const backOut = mesh(new THREE.PlaneGeometry(EW, EH), paperMat(o.paper, .9), -.002); backOut.rotation.y = Math.PI; env.add(backOut);
  // la lettre
  const lt = letterTex(o.sheet, o.ink, o.acc, o.title, o.pre, fontTitle);
  const letter = mesh(new THREE.PlaneGeometry(EW * .9, EH * .86), new THREE.MeshStandardMaterial({ map: lt, roughness: .85, bumpMap: bump, bumpScale: .3 }), .012); letter.position.y = -.04; env.add(letter);
  // poche avant : rabats gauche, droit et bas (légers décalages pour que les plis accrochent la lumière)
  const L = mesh(new THREE.ShapeGeometry(shape([[-hw, hh], [-hw, -hh], [.02, -.02]])), paperMat(o.paper, .97), .03);
  const R = mesh(new THREE.ShapeGeometry(shape([[hw, hh], [-.02, -.02], [hw, -hh]])), paperMat(o.paper, .94), .032);
  const B = mesh(new THREE.ShapeGeometry(shape([[-hw, -hh], [hw, -hh], [0, .12]])), paperMat(o.paper, 1.02), .04);
  env.add(L, R, B);
  // rabat supérieur, pivot sur le bord du haut
  const fs = new THREE.Shape(); fs.moveTo(-hw, 0); fs.lineTo(hw, 0); fs.lineTo(.22, -1.08); fs.quadraticCurveTo(0, -1.24, -.22, -1.08); fs.closePath();
  const flapG = new THREE.ShapeGeometry(fs, 24);
  const flap = new THREE.Group(); flap.position.set(0, hh, .025); env.add(flap);
  const fOut = mesh(flapG, paperMat(o.paper, 1.04), .025), fIn = mesh(flapG, linerMat, .024); flap.add(fOut, fIn);
  // cachet de cire : galette irrégulière + médaillon gravé
  const ss = new THREE.Shape(); for (let i = 0; i <= 64; i++) { const a = i / 64 * 6.283, r = .36 * (1 + .05 * Math.sin(a * 5 + 1) + .035 * Math.sin(a * 9) + .02 * Math.sin(a * 17)); i ? ss.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ss.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const wax = new THREE.MeshPhysicalMaterial({ color: o.seal, roughness: .38, metalness: .05, clearcoat: .7, clearcoatRoughness: .28, sheen: .3 });
  const seal = new THREE.Group(); seal.position.set(0, hh - 1.12, .1); env.add(seal);
  const blob = new THREE.Mesh(new THREE.ExtrudeGeometry(ss, { depth: .035, bevelEnabled: true, bevelThickness: .035, bevelSize: .045, bevelSegments: 5, curveSegments: 48 }), wax); blob.castShadow = true; seal.add(blob);
  const medal = new THREE.Mesh(new THREE.CircleGeometry(.27, 80), new THREE.MeshPhysicalMaterial({ color: o.seal, roughness: .32, clearcoat: .8, clearcoatRoughness: .22, bumpMap: sealBump(o.ini, fontSeal), bumpScale: 4 }));
  medal.position.z = .072; seal.add(medal);
  env.rotation.set(-.16, .1, -.03);

  let t0 = performance.now(), openAt = 0, raf = 0, alive = true, done = null;
  const tick = now => {
    if (!alive) return; raf = requestAnimationFrame(tick);
    const t = (now - t0) / 1000, d = cam.userData.d;
    if (!openAt) {
      env.rotation.x = -.16 + Math.sin(t * .9) * .05; env.rotation.y = .1 + Math.sin(t * .6) * .09; env.position.y = Math.sin(t * 1.2) * .05;
      cam.position.set(0, -.25, d); cam.lookAt(0, 0, 0);
    } else {
      const k = (now - openAt) / 1000;
      // 1. le cachet se brise et tombe
      const s1 = clamp(k / .55); seal.position.z = .1 + Math.sin(s1 * Math.PI) * .35; seal.scale.setScalar(1 + Math.sin(s1 * Math.PI) * .18);
      if (k > .35) { const f = clamp((k - .35) / .7); seal.position.y = hh - 1.12 - f * f * 2.6; seal.position.z = .1 + f * 1.2; seal.rotation.z = f * 1.6; seal.rotation.x = f * 1.4; seal.scale.setScalar(Math.max(.001, 1 - f)); }
      // 2. le rabat s'ouvre
      flap.rotation.x = -Math.PI * ease(clamp((k - .45) / 1.25));
      // 3. l'enveloppe se redresse face à nous
      const f3 = ease(clamp(k / 1.4)); env.rotation.x += (0 - env.rotation.x) * .08; env.rotation.y += (0 - env.rotation.y) * .08; env.position.y += (-.55 - env.position.y) * .06 * f3;
      // 4. la lettre glisse hors de l'enveloppe et vient vers nous
      const f4 = ease(clamp((k - 1.55) / 1.3)); letter.position.y = -.04 + f4 * 1.85; letter.position.z = .012 + (f4 > .55 ? (f4 - .55) * 1.6 : 0);
      cam.position.set(0, -.25 + f4 * .9, d - f4 * 1.4); cam.lookAt(0, f4 * .9, 0);
      if (k > 2.95 && done) { const r = done; done = null; r(); }
    }
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(tick);
  const onResize = () => fit(); addEventListener('resize', onResize);
  return {
    open() { if (openAt) return Promise.resolve(); openAt = performance.now(); return new Promise(r => { done = r; }); },
    destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', onResize); renderer.dispose(); pm.dispose(); renderer.domElement.remove(); },
  };
}
