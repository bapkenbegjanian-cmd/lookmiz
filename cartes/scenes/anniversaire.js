// Anniversaire : six scènes.

// 1. Ballons pastel : un bouquet de ballons attaché à un cadeau ; le ruban se dénoue et ils s'envolent
function bouquet(c) {
  const { THREE, M, G, geo, mat, seg, ease, out } = c;
  c.floor(0, .22); c.look.set(0, 1.35, 0); c.camPos.set(0, 1.4, 7.2); c.fitW = 3; c.fitH = 3.6;
  const box = G(); M(geo.box(.7, .55, .7, .05), mat('#f4efe9', { r: .5, sh: .4 }), 0, .275, 0, box);
  for (const r of [0, Math.PI / 2]) { const b = M(geo.box(.72, .56, .1, .02), mat('#c9b2e8', { r: .35, sh: 1 }), 0, .28, 0, box); b.rotation.y = r; }
  c.bow(box, '#c9b2e8', 0, .6, 0, .9);
  const cols = ['#f6b8c8', '#bfe0f6', '#f8e3a6', '#c9b2e8', '#b8e6cf', '#f7c9a9', '#ffffff'];
  const B = cols.map((col, i) => { const a = i / cols.length * Math.PI * 2, r = i === 6 ? 0 : .45 + (i % 2) * .15, y = 1.9 + (i % 3) * .25 + (i === 6 ? .35 : 0);
    const g = c.balloon(c.scene, col, Math.cos(a) * r, y, Math.sin(a) * r * .6, .95, 0); g.userData = { x: g.position.x, y, z: g.position.z, ph: i };
    const line = M(geo.tube([[g.position.x, y - .5, g.position.z], [g.position.x * .3, (y + .7) / 2, g.position.z * .3], [0, .72, 0]], .005, 20), mat('#f4f1ea', { r: .6 }), 0, 0, 0); g.userData.line = line; return g; });
  return {
    dur: 3.2,
    idle(t) { B.forEach(b => { b.position.y = b.userData.y + Math.sin(t * 1.3 + b.userData.ph) * .05; b.rotation.z = Math.sin(t + b.userData.ph) * .07; }); },
    open(k, t) {
      B.forEach((b, i) => { const f = ease(seg(k, .3 + i * .08, 3.2)); b.position.y = b.userData.y + f * 3; b.position.x = b.userData.x * (1 + f * 1.4) + Math.sin(t + i) * .2 * f; b.position.z = b.userData.z * (1 + f);
        b.rotation.z = Math.sin(t * 2 + i) * .15; b.userData.line.visible = k < .3; });
      if (k > .3 && !this.b) { this.b = 1; c.burst3([0, .9, 0], cols, 80, { speed: 3, up: .7, g: 3 }); }
    },
    zoom: k => 0,
  };
}

// 2. Nuit étoilée : des fusées partent du sol et éclatent en bouquets de lumière
function feux(c) {
  const { THREE, M, G, geo, mat, seg, ease, out, o } = c;
  c.look.set(0, 1.6, 0); c.camPos.set(0, 1.2, 7.5); c.fitW = 3.4; c.fitH = 3.8;
  const sky = c.sparkles(80, '#fff6d8', [5, 4, 1], 2.2, .05); sky.pts.position.z = -2;
  // silhouette de ville
  for (let i = 0; i < 11; i++) { const h = .3 + Math.random() * .7, w = .25 + Math.random() * .2; const b = M(geo.box(w, h, .3, .01), mat('#0b0d1e', { r: .9 }), -1.7 + i * .34, h / 2, -1); for (let j = 0; j < 3; j++) if (Math.random() < .6) M(geo.box(.04, .05, .01, .002), mat('#ffd27a', { em: '#ffd27a', ei: 1.3 }), -1.7 + i * .34 + (Math.random() - .5) * w * .6, .15 + Math.random() * (h - .2), -.84); }
  const cols = [o.acc, '#ff7aa8', '#7ad7ff', '#ffffff', '#b28cff'];
  const shells = []; const mkShell = (x, delay, col, h) => {
    const n = 140, g = new THREE.BufferGeometry(), P = new Float32Array(n * 3), V = []; for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.28, r = Math.sqrt(1 - u * u); V.push(new THREE.Vector3(r * Math.cos(a), u, r * Math.sin(a)).multiplyScalar(.9 + Math.random() * .2)); }
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    const m = new THREE.PointsMaterial({ color: col, size: .17, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, map: c.sparkles(1, '#fff').pts.material.map });
    const pts = new THREE.Points(g, m); c.scene.add(pts); pts.visible = false;
    const rocket = M(geo.sph(.03, 8), mat('#fff', { em: col, ei: 2 }), x, 0, 0); rocket.visible = false;
    shells.push({ x, delay, h, pts, P, V, m, rocket }); };
  [[-.9, .1, cols[0], 2.6], [.7, .6, cols[1], 3], [0, 1.1, cols[2], 2.2], [-.3, 1.6, cols[3], 3.1], [1.1, 2, cols[4], 2.4]].forEach(a => mkShell(...a));
  const step = (k) => shells.forEach(s => { const f = k - s.delay; const up = seg(f, 0, .6);
      s.rocket.visible = f > 0 && f < .6; s.rocket.position.set(s.x + Math.sin(f * 8) * .03, out(up) * s.h, 0);
      if (f > .6) { const e = f - .6; s.pts.visible = e < 1.8; s.m.opacity = Math.max(0, 1 - e / 1.8); for (let i = 0; i < s.V.length; i++) { const v = s.V[i], r = out(Math.min(1, e / 1.2)) * .9; s.P[i * 3] = s.x + v.x * r; s.P[i * 3 + 1] = s.h + v.y * r - e * e * .25; s.P[i * 3 + 2] = v.z * r; } s.pts.geometry.attributes.position.needsUpdate = true; } });
  return {
    dur: 3.6,
    idle(t) { sky.tick(t); step((t * .9) % 4.2); },
    open(k, t) { sky.tick(t); step(k); },
    zoom: k => 0,
  };
}

// 3. Fiesta : une piñata étoile se balance ; elle éclate et les bonbons pleuvent
function pinata(c) {
  const { THREE, M, G, geo, mat, seg, ease, out, back } = c;
  c.floor(0, .2); c.look.set(0, 1.5, 0); c.camPos.set(0, 1.4, 7); c.fitW = 2.8; c.fitH = 3.6;
  const P = G(c.scene, 0, 2.9, 0); M(geo.cyl(.006, .006, 1.2, 4), mat('#d9c7a0'), 0, .1, 0, P);
  const body = G(P, 0, -.9, 0); const ruff = ['#ff5d8f', '#ffd23f', '#2ec4b6', '#7b61ff', '#ff8a3d'];
  M(geo.sph(.42, 32), mat('#ff5d8f', { r: .8, sh: 1, bump: c.grain('cloth'), bs: 2 }), 0, 0, 0, body);
  const cones = []; for (let i = 0; i < 6; i++) { const d = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]][i]; if (d[1] === 1) continue;
    const cn = G(body); cn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d)); const cm = M(geo.cone(.2, .7, 24), mat(ruff[i % 5], { r: .8, sh: 1, bump: c.grain('cloth'), bs: 2 }), 0, .55, 0, cn); for (let j = 0; j < 3; j++) M(geo.tor(.17 - j * .05, .025, Math.PI * 2, 24), mat(ruff[(i + j + 1) % 5], { r: .9, sh: 1 }), 0, .32 + j * .14, 0, cn).rotation.x = Math.PI / 2;
    M(geo.cyl(.01, .01, .25, 4), mat(ruff[(i + 2) % 5]), 0, .95, 0, cn);
    cones.push(cn); }
  const stick = G(c.scene, 1.6, 1.4, .3); M(geo.cyl(.035, .035, 1.6, 12), mat('#b5834a', { r: .6 }), 0, .6, 0, stick); stick.rotation.z = .9;
  return {
    dur: 3,
    idle(t) { P.rotation.z = Math.sin(t * 1.4) * .18; P.rotation.y = t * .4; stick.rotation.z = .9 + Math.sin(t * 1.4) * .05; },
    open(k, t) {
      const sw = seg(k, 0, .45); stick.rotation.z = .9 + Math.sin(sw * Math.PI) * 1.1; P.rotation.z = -Math.sin(seg(k, .3, .5) * Math.PI) * .3;
      if (k > .42) { body.visible = false; if (!this.b) { this.b = 1; const p = new THREE.Vector3(); body.getWorldPosition(p);
        c.burst3(p.toArray(), ruff, 24, { geo: new THREE.ConeGeometry(.07, .2, 8), speed: 3.5, up: .2, cone: 1.6, g: 6, floor: .05, shadow: true });
        c.burst3(p.toArray(), ['#ff5d8f', '#ffd23f', '#2ec4b6', '#ffffff', '#7b61ff'], 50, { geo: new THREE.CapsuleGeometry(.03, .06, 4, 8), speed: 4, up: .4, cone: 1.4, g: 7, floor: .04, metal: .1, shadow: true });
        c.burst3(p.toArray(), ruff, 90, { speed: 4.5, up: .6, g: 3 }); } }
    },
    zoom: k => 0,
  };
}

// 4. Rose & or : un gâteau aux bougies allumées ; on souffle, les flammes s'éteignent en fumée, les confettis tombent
function gateau(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, o } = c;
  c.floor(0, .22); c.look.set(0, .95, 0); c.camPos.set(0, 2.2, 6.6); c.fitW = 2.8; c.fitH = 2.6;
  M(geo.lathe([[0, 0], [.55, 0], [.57, .02], [.18, .08], [.1, .3], [.85, .32], [.87, .36], [0, .36]], 64), gold({ r: .3 }), 0, 0, 0);
  const cake = M(geo.lathe([[0, .36], [.76, .36], [.78, .4], [.78, 1.0], [.74, 1.04], [0, 1.04]], 72), mat('#f4c9d3', { r: .55, sh: .7 }), 0, 0, 0);
  // nappage qui coule
  const drip = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, l = .1 + Math.random() * .18; const d = M(geo.cap(.035, l, 10), mat('#fbf3ee', { r: .3, cc: .6 }), Math.cos(a) * .77, 1.0 - l / 2, Math.sin(a) * .77); }
  M(geo.cyl(.775, .775, .05, 72), mat('#fbf3ee', { r: .3, cc: .6 }), 0, 1.03, 0);
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; M(geo.sph(.04, 12), mat(i % 2 ? '#ffffff' : o.acc, { r: .3, m: i % 2 ? 0 : .8 }), Math.cos(a) * .66, 1.1, Math.sin(a) * .66); }
  const F = []; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + .3, x = Math.cos(a) * .35, z = Math.sin(a) * .35; const stripe = c.canvasTex(64, 128, g => { g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 128); g.fillStyle = '#e88aa3'; for (let y = -64; y < 128; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(64, y + 32); g.lineTo(64, y + 42); g.lineTo(0, y + 10); g.fill(); } });
    M(geo.cyl(.035, .035, .4, 16), mat('#ffffff', { map: stripe, r: .5 }), x, 1.28, z); const f = c.flame(c.scene, x, 1.5, z, .8, i < 2); F.push(f); }
  const smokes = [];
  const sp = c.sparkles(20, '#fff0d0', [2.4, 2, 1.6], 1.4, .08);
  return {
    dur: 3,
    idle(t) { sp.tick(t); F.forEach(f => f.tick(t)); },
    open(k, t, dt) {
      sp.tick(t); F.forEach((f, i) => { const off = seg(k, .3 + i * .06, .5 + i * .06); f.userData.on = 1 - off; f.rotation.z = -off * .6; f.tick(t);
        if (off >= 1 && !f.userData.sm) { f.userData.sm = 1; for (let j = 0; j < 4; j++) { const s = M(geo.sph(.022, 10), mat('#e6e2dd', { r: 1, op: .35, dw: false }), f.position.x, f.position.y + .05, f.position.z); s.castShadow = false; s.userData = { a: -j * .12 }; smokes.push(s); } } });
      smokes.forEach(s => { s.userData.a += dt; if (s.userData.a < 0) return; s.position.y += dt * .35; s.position.x += Math.sin(s.userData.a * 4) * .003; s.scale.set(1 + s.userData.a * 1.2, 1 + s.userData.a * 2.5, 1 + s.userData.a * 1.2); s.material.opacity = Math.max(0, .35 - s.userData.a * .22); });
      if (k > .9 && !this.b) { this.b = 1; c.burst3([0, 3.2, 0], [o.acc, '#f4c9d3', '#ffffff', '#e8c66a'], 160, { speed: 1.2, up: -.5, cone: 1, g: .9, drag: .97, flutter: .6 }); }
    },
    zoom: k => ease(seg(k, 1.9, 3)) * .7,
  };
}

// 5. Noir & or : un écrin noir au ruban doré ; le ruban glisse, le couvercle s'envole, une fontaine d'or jaillit
function cadeauNoir(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .28); c.look.set(0, .9, 0); c.camPos.set(0, 2.2, 6.8); c.fitW = 2.6; c.fitH = 2.8;
  const black = mat('#141210', { r: .35, cc: 1, ccr: .15 }), gm = gold({ r: .25 });
  const B = G(); B.rotation.y = -.5; M(geo.box(1.1, .85, 1.1, .03), black, 0, .425, 0, B);
  const rb1 = M(geo.box(1.12, .86, .14, .01), gm, 0, .43, 0, B), rb2 = M(geo.box(.14, .86, 1.12, .01), gm, 0, .43, 0, B);
  const lid = G(B, 0, .85, 0); M(geo.box(1.18, .2, 1.18, .03), black, 0, .1, 0, lid); M(geo.box(1.2, .21, .14, .01), gm, 0, .1, 0, lid); M(geo.box(.14, .21, 1.2, .01), gm, 0, .1, 0, lid);
  const bw = c.bow(lid, '#d8b15c', 0, .3, 0, 1.1); bw.children.forEach(m => m.material = gm);
  const glow = new THREE.PointLight(0xffd27a, 0, 5); glow.position.set(0, 1.1, 0); B.add(glow);
  const beam = M(geo.cyl(.45, .5, 3, 32, true), new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0, 2.3, 0, B); beam.castShadow = false;
  const sp = c.sparkles(26, '#ffe7a8', [2.6, 2.4, 1.6], 1.4, .09);
  return {
    dur: 3,
    idle(t) { sp.tick(t); B.rotation.y = -.5 + Math.sin(t * .5) * .2; bw.rotation.z = Math.sin(t * 2) * .03; },
    open(k, t) {
      sp.tick(t); const u = seg(k, 0, .4); bw.scale.setScalar(Math.max(.001, 1.1 * (1 - u))); bw.position.y = .3 + u * .3;
      const l = out(seg(k, .35, 1.2)); lid.position.y = .85 + l * 2.2; lid.rotation.x = l * .9; lid.rotation.z = l * .4;
      glow.intensity = out(seg(k, .4, 1.1)) * 10; beam.material.opacity = Math.sin(seg(k, .4, 2.4) * Math.PI) * .28;
      if (k > .55 && !this.b) { this.b = 1; c.burst3([0, .95, 0], ['#d8b15c', '#f3d27a', '#fff1c2', '#ffffff'], 220, { geo: new THREE.ExtrudeGeometry(c.star(.045), { depth: .01, bevelEnabled: false }), speed: 5, up: 1.15, cone: .3, spread: .6, metal: .9, g: 4.5, floor: .02 }); }
    },
    zoom: k => ease(seg(k, 1.9, 3)) * .6,
  };
}

// 6. Fraîcheur : un cocktail glacé ; les glaçons tintent, une rondelle de citron vert plonge, les bulles et la menthe éclatent
function cocktail(c) {
  const { THREE, M, G, geo, mat, glass, seg, ease, out, back } = c;
  c.floor(0, .22); c.look.set(0, 1.05, 0); c.camPos.set(0, 1.9, 6.6); c.fitW = 2.4; c.fitH = 2.6;
  M(geo.lathe([[0, 0], [.42, 0], [.44, .03], [.46, 1.5], [.44, 1.5], [.42, .06], [0, .06]], 56), glass(), 0, 0, 0);
  const liq = M(geo.cyl(.41, .41, 1.05, 48), mat('#bdf0c8', { r: .05, tr: .6, op: .6 }), 0, .6, 0); liq.castShadow = false;
  const ice = []; for (let i = 0; i < 5; i++) { const q = M(geo.box(.22, .22, .22, .04), glass({ op: .55 }), (Math.random() - .5) * .4, .8 + i * .14, (Math.random() - .5) * .3); q.rotation.set(Math.random(), Math.random(), Math.random()); q.userData.y = q.position.y; ice.push(q); }
  const mintL = new THREE.Shape(); mintL.moveTo(0, 0); mintL.bezierCurveTo(.08, .04, .09, .14, 0, .2); mintL.bezierCurveTo(-.09, .14, -.08, .04, 0, 0); const mg = new THREE.ShapeGeometry(mintL, 10);
  for (let i = 0; i < 5; i++) { const l = M(mg, mat('#3aa45b', { r: .5, sh: .6, ds: true }), Math.cos(i * 1.3) * .2, 1.55, Math.sin(i * 1.3) * .15); l.rotation.set(-.6, i * 1.3, .3); }
  const straw = M(geo.cyl(.025, .025, 1.6, 12), mat('#ffffff', { map: c.canvasTex(32, 128, g => { g.fillStyle = '#fff'; g.fillRect(0, 0, 32, 128); g.fillStyle = '#2e8f6f'; for (let y = 0; y < 128; y += 16) g.fillRect(0, y, 32, 8); }), r: .4 }), .18, 1.35, 0); straw.rotation.z = -.3;
  const lime = G(c.scene, -.45, 1.5, 0); M(geo.cyl(.22, .22, .04, 40), mat('#9bd65a', { r: .4, cc: .6 }), 0, 0, 0, lime); M(geo.tor(.22, .025, Math.PI * 2, 48), mat('#4a9a2a', { r: .4 }), 0, 0, 0, lime).rotation.x = Math.PI / 2; lime.rotation.z = Math.PI / 2;
  const bub = []; for (let i = 0; i < 24; i++) { const b = M(geo.sph(.015 + Math.random() * .015, 8), mat('#ffffff', { op: .7, r: .1 }), (Math.random() - .5) * .6, .1 + Math.random() * 1, (Math.random() - .5) * .5); b.castShadow = false; b.userData = { v: .2 + Math.random() * .4 }; bub.push(b); }
  return {
    dur: 2.8,
    idle(t, dt) { ice.forEach((q, i) => { q.position.y = q.userData.y + Math.sin(t * 1.5 + i) * .015; q.rotation.y += dt * .2; }); bub.forEach(b => { b.position.y += b.userData.v * dt; if (b.position.y > 1.1) b.position.y = .1; }); },
    open(k, t, dt) {
      this.idle(t, dt * 2.5); const d = seg(k, 0, .7); lime.position.set(-.45 + ease(d) * .45, 1.5 + Math.sin(d * Math.PI) * .4 - ease(d) * .5, 0); lime.rotation.x = d * 4;
      if (k > .7 && !this.b) { this.b = 1; c.burst3([0, 1.15, 0], ['#ffffff', '#e5fff0'], 90, { geo: new THREE.SphereGeometry(.03, 8, 6), speed: 2.6, up: 1, cone: .4, g: 3 }); c.burst3([0, 1.5, 0], ['#3aa45b', '#6cc77f'], 30, { geo: mg, speed: 2.4, up: .8, g: 2 }); }
    },
    zoom: k => ease(seg(k, 1.7, 2.8)) * .6,
  };
}

export default { 1: bouquet, 2: feux, 3: pinata, 4: gateau, 5: cadeauNoir, 6: cocktail };
