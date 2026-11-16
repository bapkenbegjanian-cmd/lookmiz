// Fiançailles : six scènes.

// 1. Rose poudré : une boîte en forme de cœur ; le couvercle se soulève et libère des cœurs qui s'envolent
function boiteCoeur(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back, o } = c;
  c.floor(0, .24); c.look.set(0, .75, 0); c.camPos.set(0, 2.6, 6.6); c.fitW = 2.6; c.fitH = 2.4;
  const pink = mat('#e8a7b6', { r: .8, sh: 1, shc: '#ffd6e0', bump: c.grain('cloth'), bs: .4 }), pinkD = mat('#c97c8f', { r: .85, sh: .8 });
  const hs = c.heart(.62), base = G(c.scene, 0, 0, 0); base.rotation.y = -.3; base.scale.setScalar(1.35);
  const body = M(new THREE.ExtrudeGeometry(hs, { depth: .5, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 3, curveSegments: 48 }), pinkD, 0, 0, 0, base); body.rotation.x = -Math.PI / 2;
  const lidG = G(base, 0, .53, .55); const lid = M(new THREE.ExtrudeGeometry(hs, { depth: .16, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 5, curveSegments: 48 }), pink, 0, 0, -.55, lidG); lid.rotation.x = -Math.PI / 2;
  c.bow(lidG, '#f6eef0', 0, .24, -.5, .9);
  const H = []; for (let i = 0; i < 14; i++) { const h = M(new THREE.ExtrudeGeometry(c.heart(.09 + Math.random() * .06), { depth: .04, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 3 }), mat(['#e4577a', '#f29bb0', '#ffffff', o.acc][i % 4], { r: .25, cc: 1 }), (Math.random() - .5) * .6, .35, (Math.random() - .5) * .4, base);
    h.userData = { v: .5 + Math.random() * .7, a: Math.random() * 6, r: .3 + Math.random() * .9 }; h.visible = false; H.push(h); }
  const sp = c.sparkles(22, '#ffe0e8', [2.6, 2, 1.6], 1.2, .09);
  return {
    dur: 3.2,
    idle(t) { sp.tick(t); base.rotation.y = -.3 + Math.sin(t * .6) * .12; lidG.position.y = .53 + Math.max(0, Math.sin(t * 3)) * .015; },
    open(k, t) {
      sp.tick(t); const l = back(seg(k, .1, .9)); lidG.position.y = .53 + l * .7; lidG.rotation.x = -l * .6; lidG.position.z = .55 - l * .35;
      H.forEach((h, i) => { const f = seg(k, .4 + i * .05, 3); h.visible = f > 0; const e = out(f); h.position.y = .35 + e * h.userData.v * 3; h.position.x = Math.cos(h.userData.a + e * 3) * h.userData.r * e; h.position.z = Math.sin(h.userData.a + e * 3) * h.userData.r * e * .6; h.rotation.y = t * 2 + i; h.rotation.x = -Math.PI / 2 + .3; });
    },
    zoom: k => ease(seg(k, 2, 3.2)),
  };
}

// 2. Champagne : une bouteille dans son seau ; le bouchon saute, la mousse jaillit, pluie d'or
function bouteille(c) {
  const { THREE, M, G, geo, mat, gold, glass, seg, ease, out, back, o } = c;
  c.floor(0, .22); c.look.set(0, 1.25, 0); c.camPos.set(0, 1.7, 7); c.fitW = 2.6; c.fitH = 3.4;
  const bucket = M(geo.lathe([[0, 0], [.5, 0], [.58, .7], [.62, .74], [.6, .76], [.56, .72], [.48, .05], [0, .05]], 64), mat('#e8eaee', { r: .22, m: .75, cc: 1 }), 0, 0, 0);
  for (let i = 0; i < 16; i++) { const ice = M(geo.box(.14, .14, .14, .03), glass({ op: .5 }), Math.cos(i) * .38, .62 + Math.random() * .1, Math.sin(i * 1.7) * .3); ice.rotation.set(Math.random(), Math.random(), Math.random()); }
  const B = G(c.scene, .05, .25, 0); B.rotation.z = -.22;
  M(geo.lathe([[0, 0], [.2, 0], [.21, .05], [.21, 1.05], [.19, 1.25], [.08, 1.55], [.07, 1.85], [.075, 1.9], [0, 1.9]], 48), mat('#1d3b24', { r: .1, cc: 1, ccr: .05, m: .2 }), 0, 0, 0, B);
  M(geo.lathe([[.211, .55], [.215, .55], [.215, 1.0], [.211, 1.0]], 48), mat('#f2e7cf', { r: .7 }), 0, 0, 0, B);
  M(geo.lathe([[.075, 1.55], [.085, 1.55], [.085, 1.9], [.08, 1.93], [0, 1.95]], 32), gold({ r: .35 }), 0, 0, 0, B);
  const cork = G(B, 0, 1.93, 0); M(geo.cyl(.07, .065, .16, 24), mat('#c49a62', { r: .9 }), 0, .08, 0, cork); M(geo.cyl(.085, .085, .03, 24), gold(), 0, .17, 0, cork);
  const foam = []; const sp = c.sparkles(20, '#fff2c8', [2.6, 2.6, 1.6], 1.6, .09);
  return {
    dur: 3,
    idle(t) { sp.tick(t); B.rotation.z = -.22 + Math.sin(t * .8) * .02; cork.position.y = 1.93 + Math.max(0, Math.sin(t * 4)) * .01; },
    open(k, t) {
      sp.tick(t); const s = Math.sin(k * 50) * .02 * (1 - seg(k, 0, .5)); B.rotation.z = -.22 + s;
      if (k > .5) { const f = k - .5; cork.position.set(-f * .4, 1.93 + f * 6 - f * f * 3, 0); cork.rotation.z = f * 12; }
      if (k > .5 && !this.b) { this.b = 1; const top = new THREE.Vector3(0, 1.95, 0); B.localToWorld(top);
        c.burst3(top.toArray(), ['#fffaf0', '#f6e7c4', '#ffffff'], 140, { geo: new THREE.SphereGeometry(.035, 8, 6), speed: 3.2, up: 1.1, cone: .35, g: 3.5, spread: .5 });
        c.burst3([top.x, top.y + .3, top.z], [o.acc, '#f3d27a', '#ffffff'], 110, { speed: 4, up: .5, metal: .8, g: 2.4 }); }
    },
    zoom: k => ease(seg(k, 1.9, 3)),
  };
}

// 3. Lavande : une montgolfière ; le brûleur s'embrase et elle s'élève dans le ciel avec ses rubans
function montgolfiere(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, o } = c;
  c.look.set(0, 1.75, 0); c.camPos.set(0, 1.6, 7.4); c.fitW = 2.8; c.fitH = 4.1;
  const A = G(c.scene, 0, 0, 0);
  const pal = ['#8f7ad6', '#f4efe6', '#c6b6f2', '#f4efe6'];
  const gores = 12; for (let i = 0; i < gores; i++) { const g = new THREE.LatheGeometry([[0.001, 0], [.18, .1], [.6, .55], [.82, 1.1], [.86, 1.5], [.78, 1.9], [.5, 2.2], [0.001, 2.32]].map(p => new THREE.Vector2(p[0], p[1])), 6, i / gores * Math.PI * 2, Math.PI * 2 / gores);
    M(g, mat(pal[i % 4], { r: .5, sh: .5 }), 0, .95, 0, A); }
  M(geo.tor(.19, .015, Math.PI * 2, 32), gold(), 0, 1.05, 0, A).rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .78; M(geo.tube([[Math.cos(a) * .18, 1.05, Math.sin(a) * .18], [Math.cos(a) * .16, .55, Math.sin(a) * .16]], .006, 6), mat('#6b4b2a'), 0, 0, 0, A); }
  const basket = M(geo.lathe([[0, 0], [.2, 0], [.22, .26], [.2, .28], [0, .28]], 24), mat('#a87a46', { r: .85, bump: c.grain('cloth'), bs: 1.2 }), 0, .3, 0, A);
  const fl = c.flame(A, 0, .65, 0, 1.4, true); fl.userData.on = .25;
  const rib = []; for (let i = 0; i < 4; i++) { const pg = new THREE.PlaneGeometry(.04, .9, 1, 10); const r = M(pg, mat(['#f2b6c6', '#ffffff', '#c6b6f2', o.acc][i], { ds: true, r: .5 }), Math.cos(i * 1.6) * .2, -.1, Math.sin(i * 1.6) * .2, A); r.userData.o = pg.attributes.position.array.slice(); rib.push(r); }
  const clouds = [[-1.6, .4, -1], [1.5, 2.9, -1.4], [-1.2, 3.6, -1.6]].map(([x, y, z]) => { const g = G(c.scene, x, y, z); for (const [dx, dy, r] of [[0, 0, .3], [.3, .05, .24], [-.3, .02, .22], [.12, .2, .22]]) M(geo.sph(r, 20), mat('#ffffff', { r: .9, sh: 1 }), dx, dy, 0, g); return g; });
  const ribTick = t => rib.forEach((r, i) => { const a = r.geometry.attributes.position.array, o0 = r.userData.o; for (let j = 0; j < a.length; j += 3) a[j + 2] = Math.sin(t * 4 + o0[j + 1] * 5 + i) * .08 * (.45 - o0[j + 1]); r.geometry.attributes.position.needsUpdate = true; });
  return {
    dur: 3.2,
    idle(t) { A.position.y = Math.sin(t * .9) * .08; A.rotation.y = t * .2; fl.tick(t); ribTick(t); clouds.forEach((g, i) => g.position.x += Math.sin(t * .3 + i) * .001); },
    open(k, t) {
      fl.userData.on = .25 + out(seg(k, 0, .4)) * .9; fl.tick(t); ribTick(t * 1.5);
      const u = ease(seg(k, .3, 3)); A.position.y = u * .7 + Math.sin(t * .9) * .05; A.rotation.y = t * .2 + u;
      clouds.forEach((g, i) => { g.position.y -= .012 * seg(k, .3, 3); });
    },
    zoom: k => 0,
  };
}

// 4. Passion : deux cœurs rouges tournent l'un autour de l'autre, se rejoignent et battent ensemble
function deuxCoeurs(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(-.2, .18); c.look.set(0, 1.1, 0); c.camPos.set(0, 1.2, 7); c.fitW = 2.8; c.fitH = 2.8;
  const hg = new THREE.ExtrudeGeometry(c.heart(.42), { depth: .22, bevelEnabled: true, bevelThickness: .14, bevelSize: .12, bevelSegments: 10, curveSegments: 48 }); hg.center();
  const red = mat('#b3122c', { r: .12, cc: 1, ccr: .04, sh: .2 }), goldH = mat('#f2a0b4', { r: .14, cc: 1, ccr: .04 });
  const A = M(hg, red, -.6, 1.1, 0), B = M(hg, goldH, .6, 1.1, 0); A.scale.setScalar(.8); B.scale.setScalar(.65);
  const sp = c.sparkles(30, '#ffd0da', [3, 2.2, 1.6], 1.2, .09);
  const glow = new THREE.PointLight(0xff4a6a, 0, 4); glow.position.set(0, 1.1, 1); c.scene.add(glow);
  return {
    dur: 3,
    idle(t) { sp.tick(t); const a = t * .9; A.position.set(Math.cos(a) * .6, 1.1 + Math.sin(t * 1.6) * .08, Math.sin(a) * .4); B.position.set(-Math.cos(a) * .6, 1.1 - Math.sin(t * 1.6) * .08, -Math.sin(a) * .4); A.rotation.y = t * .8; B.rotation.y = -t * .8; },
    open(k, t) {
      sp.tick(t); const j = ease(seg(k, 0, 1)), a = t * .9 + j * 3;
      A.position.set(Math.cos(a) * .6 * (1 - j) - j * .18, 1.1, Math.sin(a) * .4 * (1 - j)); B.position.set(-Math.cos(a) * .6 * (1 - j) + j * .22, 1.1 + j * .05, -Math.sin(a) * .4 * (1 - j) - j * .08);
      A.rotation.y += (0 - A.rotation.y) * .12; B.rotation.y += (0 - B.rotation.y) * .12; A.rotation.z = j * .18; B.rotation.z = -j * .18;
      const beat = k > 1 ? Math.pow(Math.max(0, Math.sin((k - 1) * 7)), 6) * .12 : 0; A.scale.setScalar(.8 + beat); B.scale.setScalar(.65 + beat * .8); glow.intensity = beat * 30;
      if (k > 1.05 && !this.b) { this.b = 1; c.burst3([0, 1.1, 0], ['#b3122c', '#e4577a', '#ffd0da', '#d8b15c'], 110, { geo: new THREE.ExtrudeGeometry(c.heart(.05), { depth: .015, bevelEnabled: false }), speed: 3.2, up: .2, cone: 1.6, g: .8, drag: .97 }); }
    },
    zoom: k => ease(seg(k, 1.9, 3)),
  };
}

// 5. Sous les étoiles : une lune dorée au-dessus des nuages ; des étoiles filantes tracent un cœur dans le ciel
function etoiles(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, o } = c;
  c.look.set(0, 1.3, 0); c.camPos.set(0, 1.3, 7); c.fitW = 3; c.fitH = 3.4;
  const crater = c.canvasTex(256, 256, g => { g.fillStyle = '#888'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 40; i++) { const x = Math.random() * 256, y = Math.random() * 256, r = 4 + Math.random() * 18; const R = g.createRadialGradient(x, y, 0, x, y, r); R.addColorStop(0, '#5a5a5a'); R.addColorStop(.8, '#777'); R.addColorStop(1, '#9a9a9a'); g.fillStyle = R; g.beginPath(); g.arc(x, y, r, 0, 6.28); g.fill(); } }, false);
  const moon = M(geo.sph(.48, 48), mat('#f6e4b0', { r: .9, bump: crater, bs: 2.5, em: '#e8c77a', ei: .45 }), -.6, 2.05, -.2); moon.castShadow = false;
  const mh = new THREE.PointLight(0xffe2a0, 1.5, 4); mh.position.set(-.6, 2.05, .6); c.scene.add(mh);
  const cl = (x, y, z, s) => { const g = G(c.scene, x, y, z); for (const [dx, dy, r] of [[0, 0, .34], [.32, .04, .27], [-.34, .02, .25], [.12, .22, .26], [-.14, .18, .2]]) M(geo.sph(r, 20), mat('#e9e6f5', { r: .9, sh: 1, shc: '#c7c0ff' }), dx, dy, 0, g); g.scale.setScalar(s); return g; };
  const clouds = [cl(-1, .4, 0, 1), cl(.9, .25, .3, 1.2), cl(.2, .1, -.6, .9)];
  const bg = c.sparkles(90, '#fff6d8', [5, 4, 1], 2, .07); bg.pts.position.z = -1.5;
  // cœur d'étoiles
  const N = 26, heartPts = []; for (let i = 0; i < N; i++) { const t = i / N * Math.PI * 2, x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); heartPts.push(new THREE.Vector3(x * .045 + .35, y * .045 + 1.45, .3)); }
  const stars = heartPts.map(p => { const s = M(new THREE.ExtrudeGeometry(c.star(.05), { depth: .01, bevelEnabled: false }), mat('#fff3c4', { em: '#ffe08a', ei: 1.2 }), p.x, p.y, p.z); s.scale.setScalar(.001); s.castShadow = false; return s; });
  const trail = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); c.scene.add(trail); trail.visible = false;
  const halo = new THREE.PointLight(0xfff0c0, 0, 2); trail.add(halo);
  return {
    dur: 3.4,
    idle(t) { bg.tick(t); moon.rotation.y = t * .1; moon.position.y = 2.05 + Math.sin(t * .7) * .05; clouds.forEach((g, i) => g.position.x += Math.sin(t * .4 + i) * .0015); },
    open(k, t) {
      bg.tick(t); const f = seg(k, .2, 2.2); trail.visible = f > 0 && f < 1; halo.intensity = 2;
      const idx = Math.min(N - 1, Math.floor(f * N)), fr = f * N - Math.floor(f * N); if (f < 1) trail.position.lerpVectors(heartPts[idx], heartPts[(idx + 1) % N], fr);
      stars.forEach((s, i) => { const on = seg(k, .2 + i / N * 2, .5 + i / N * 2); s.scale.setScalar(Math.max(.001, out(on) * (1 + Math.sin(t * 6 + i) * .15))); s.rotation.z = t; });
      moon.rotation.y = t * .1;
    },
    zoom: k => ease(seg(k, 2.3, 3.4)) * .6,
  };
}

// 6. Bohème : un attrape-rêves en bois et plumes ; il tourne, sa toile s'illumine, les plumes dansent
function attrapeReves(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, o } = c;
  c.look.set(0, 1.35, 0); c.camPos.set(0, 1.4, 7); c.fitW = 2.6; c.fitH = 3.4;
  const D = G(c.scene, 0, 1.75, 0); D.scale.setScalar(1.25);
  const wood = mat('#c9a77a', { r: .6, bump: c.grain('cloth'), bs: .8 }); M(geo.tor(.62, .035, Math.PI * 2, 96), wood, 0, 0, 0, D);
  M(geo.tor(.24, .02, Math.PI * 2, 64), wood, 0, 0, 0, D);
  const threadM = mat('#f4efe4', { r: .6, em: '#f4efe4', ei: 0 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, b = a + Math.PI / 12 * 5; M(geo.tube([[Math.cos(a) * .6, Math.sin(a) * .6, 0], [Math.cos(b) * .24, Math.sin(b) * .24, 0]], .004, 4), threadM, 0, 0, 0, D); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; M(geo.tube([[Math.cos(a) * .24, Math.sin(a) * .24, 0], [0, 0, 0]], .004, 4), threadM, 0, 0, 0, D); }
  const beads = []; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + .3; beads.push(M(geo.sph(.04, 16), mat(['#647d58', o.acc, '#c9a77a', '#e8d5b0', '#647d58'][i], { r: .3, cc: .6 }), Math.cos(a) * .42, Math.sin(a) * .42, 0, D)); }
  const fs = new THREE.Shape(); fs.moveTo(0, 0); fs.bezierCurveTo(.08, -.1, .09, -.35, 0, -.5); fs.bezierCurveTo(-.09, -.35, -.08, -.1, 0, 0); const fg = new THREE.ShapeGeometry(fs, 12);
  const F = [-.4, -.15, .15, .4].map((x, i) => { const g = G(D, x, -.6 - (i % 2) * .05, 0); M(geo.cyl(.003, .003, .32 + (i % 2) * .12, 4), threadM, 0, -.16 - (i % 2) * .06, 0, g);
    const f = M(fg, mat(['#f4efe4', '#b3a28a', '#f4efe4', '#8c9a7a'][i], { r: .8, sh: 1, ds: true }), 0, -.32 - (i % 2) * .12, 0, g); M(geo.sph(.03, 12), mat(o.acc, { r: .3, cc: 1 }), 0, -.32 - (i % 2) * .12, 0, g); return g; });
  const sp = c.sparkles(30, '#fff7e0', [2.4, 2.6, 1.4], 1.6, .09);
  return {
    dur: 3.2,
    idle(t) { sp.tick(t); D.rotation.y = Math.sin(t * .6) * .4; F.forEach((g, i) => g.rotation.z = Math.sin(t * 1.4 + i) * .12); },
    open(k, t) {
      sp.tick(t); const s = ease(seg(k, 0, 2)); D.rotation.y = Math.sin(t * .6) * .4 * (1 - s) + s * Math.PI * 2; threadM.emissiveIntensity = out(seg(k, .5, 1.6)) * .9;
      F.forEach((g, i) => g.rotation.z = Math.sin(t * 5 + i) * .35 * seg(k, 0, .8));
      beads.forEach((b, i) => b.scale.setScalar(1 + Math.max(0, Math.sin(t * 6 - i)) * .3 * seg(k, .8, 1.6)));
      if (k > 1.6 && !this.b) { this.b = 1; c.burst3([0, 1.75, 0], ['#fff7e0', '#e8d5b0', o.acc], 70, { geo: new THREE.ExtrudeGeometry(c.star(.04), { depth: .01, bevelEnabled: false }), speed: 2.4, up: .3, cone: 1.6, g: .6 }); }
    },
    zoom: k => ease(seg(k, 2, 3.2)) * .7,
  };
}

export default { 1: boiteCoeur, 2: bouteille, 3: montgolfiere, 4: deuxCoeurs, 5: etoiles, 6: attrapeReves };
