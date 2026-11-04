// Mariage : six scènes, six objets, six ouvertures.

// 1. Champagne : deux flûtes en cristal, les bulles montent ; elles trinquent, une gerbe d'or jaillit
function champagne(c) {
  const { THREE, M, G, geo, mat, gold, glass, seg, ease, out, back, o } = c;
  c.floor(0, .2); c.look.set(0, 1.15, 0); c.camPos.set(0, 1.6, 7); c.fitW = 2.8; c.fitH = 3;
  const flute = (x, tilt) => {
    const g = G(c.scene, x, 0, 0);
    M(geo.lathe([[0, 0], [.3, 0], [.31, .015], [.29, .035], [.06, .07], [.028, .14], [.026, 1.02], [.05, 1.08], [.14, 1.3], [.19, 1.68], [.2, 2.08], [.19, 2.08], [.18, 1.68], [.13, 1.31], [.035, 1.1], [0, 1.1]], 56), glass(), 0, 0, 0, g);
    const liq = M(geo.lathe([[0, 1.11], [.03, 1.11], [.125, 1.31], [.172, 1.66], [.176, 1.78], [0, 1.78]], 48), mat('#f1cf78', { r: .05, tr: .55, th: .3, ior: 1.33, op: .92 }), 0, 0, 0, g); liq.castShadow = false;
    const foam = M(geo.cyl(.176, .176, .02, 40), mat('#fff7e2', { r: .9, op: .8 }), 0, 1.79, 0, g); foam.castShadow = false;
    const B = []; for (let i = 0; i < 18; i++) { const b = M(geo.sph(.008 + Math.random() * .008, 8), mat('#fffbe8', { r: .1, em: '#fff3c4', ei: .25 }), (Math.random() - .5) * .1, 1.15 + Math.random() * .6, (Math.random() - .5) * .1, g); b.castShadow = false; b.userData = { v: .25 + Math.random() * .3, x: b.position.x }; B.push(b); }
    g.rotation.z = tilt; return { g, B };
  };
  const L = flute(-.42, .06), R = flute(.42, -.06);
  for (let i = 0; i < 14; i++) { const cf = M(geo.circle(.03, 6), gold({ ds: true }), (Math.random() - .5) * 2.6, .003, (Math.random() - .5) * 1.4); cf.rotation.x = -Math.PI / 2; }
  const sp = c.sparkles(26, '#fff1c2', [2.6, 2.4, 1.4], 1.6, .1);
  const bub = (F, dt) => F.B.forEach(b => { b.position.y += b.userData.v * dt; const t = (b.position.y - 1.12) / .66, r = .02 + t * .13; b.position.x = b.userData.x * (r / .07); if (b.position.y > 1.77) b.position.y = 1.13; });
  return {
    dur: 3,
    idle(t, dt) { sp.tick(t); bub(L, dt); bub(R, dt); L.g.rotation.y = Math.sin(t * .6) * .3; R.g.rotation.y = -Math.sin(t * .6) * .3; },
    open(k, t, dt) {
      sp.tick(t); bub(L, dt * 2); bub(R, dt * 2);
      const a = ease(seg(k, 0, .75)), r = seg(k, .75, 1.4), rb = Math.sin(r * Math.PI) * .25 * (1 - r);
      L.g.position.x = -.42 + a * .12 - rb * .2; R.g.position.x = .42 - a * .12 + rb * .2; L.g.position.y = a * .18; R.g.position.y = a * .18;
      L.g.rotation.z = .06 - a * .2 + rb * .3; R.g.rotation.z = -.06 + a * .2 - rb * .3;
      if (k > .75 && !this.b) { this.b = 1; c.burst3([0, 2.35, 0], [o.acc, '#fff4cc', '#ffffff', '#e8c66a'], 130, { geo: new THREE.ExtrudeGeometry(c.star(.05), { depth: .01, bevelEnabled: false }), speed: 3.6, up: .5, metal: .8, g: 2.2, drag: .97 }); }
    },
    zoom: k => ease(seg(k, 1.8, 3)),
  };
}

// 2. Eucalyptus : la pièce montée tourne doucement ; les alliances descendent se poser au sommet
function gateau(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .22); c.look.set(0, 1.25, 0); c.camPos.set(0, 1.9, 7); c.fitW = 3; c.fitH = 3.2;
  const fondant = mat('#fbf8f2', { r: .55, sh: .6, shc: '#ffffff' }), sage = mat('#7d9a78', { r: .6, sh: .5, ds: true }), sageD = mat('#5d7b5c', { r: .6, ds: true });
  const S = G(); M(geo.lathe([[0, 0], [.6, 0], [.62, .02], [.2, .08], [.12, .3], [.12, .34], [.95, .36], [.97, .4], [0, .4]], 64), gold({ r: .3 }), 0, 0, 0, S);
  const tier = (r, h, y) => { const g = G(S, 0, y, 0); M(geo.lathe([[0, 0], [r - .03, 0], [r, .03], [r, h - .04], [r - .04, h], [0, h]], 72), fondant, 0, 0, 0, g);
    const n = Math.round(r * 46), pearls = new THREE.InstancedMesh(geo.sph(.022, 10), mat('#fffaf0', { r: .2, cc: 1, sh: .4 }), n); const o3 = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o3.position.set(Math.cos(a) * (r + .005), .025, Math.sin(a) * (r + .005)); o3.updateMatrix(); pearls.setMatrixAt(i, o3.matrix); } g.add(pearls); return g; };
  tier(.8, .55, .4); tier(.6, .5, .95); tier(.4, .45, 1.45);
  // guirlande d'eucalyptus en diagonale
  const leaf = new THREE.Shape(); leaf.moveTo(0, 0); leaf.bezierCurveTo(.06, .04, .06, .12, 0, .15); leaf.bezierCurveTo(-.06, .12, -.06, .04, 0, 0);
  const lg = new THREE.ShapeGeometry(leaf, 10);
  for (let i = 0; i < 46; i++) { const t = i / 45, y = 1.9 - t * 1.5, r = t < .3 ? .4 : t < .64 ? .6 : .8, a = -1 + t * 2.6 + (Math.random() - .5) * .3;
    const l = M(lg, i % 3 ? sage : sageD, Math.cos(a) * (r + .02), y, Math.sin(a) * (r + .02), S); l.lookAt(Math.cos(a) * 3, y, Math.sin(a) * 3); l.rotateZ(Math.random() * 6); l.scale.setScalar(.8 + Math.random() * .5); }
  // alliances
  const R = G(c.scene, 0, 3.6, 0); const r1 = M(geo.tor(.13, .022, Math.PI * 2, 64), gold({ r: .18 }), -.07, 0, 0, R), r2 = M(geo.tor(.13, .022, Math.PI * 2, 64), gold({ r: .18 }), .07, 0, 0, R); r2.rotation.y = 1.1;
  const sp = c.sparkles(24, '#fff6da', [2.4, 2.6, 1.6], 1.6, .09);
  return {
    dur: 3.2,
    idle(t) { sp.tick(t); S.rotation.y = t * .25; R.position.y = 3.6; },
    open(k, t) {
      sp.tick(t); S.rotation.y = t * .25 + ease(seg(k, 0, 2)) * 1.2;
      const d = ease(seg(k, .2, 1.6)); R.position.y = 3.6 - d * 1.55; R.rotation.y = d * 6; R.rotation.x = .3 * (1 - d);
      if (k > 1.55 && !this.b) { this.b = 1; c.burst3([0, 2.2, 0], ['#7d9a78', '#5d7b5c', '#a7bfa2', '#ffffff'], 90, { geo: lg, speed: 2.6, up: .6, g: 1.2, drag: .96, spin: 6 }); }
    },
    zoom: k => ease(seg(k, 2, 3.2)),
  };
}

// 3. Bordeaux royal : un écrin de velours s'ouvre, la bague s'élève en tournant et le diamant étincelle
function ecrin(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back, o } = c;
  c.floor(0, .25); c.look.set(0, .7, 0); c.camPos.set(0, 2.4, 6.4); c.fitW = 2.4; c.fitH = 2.2;
  const vel = mat('#4a0c18', { r: .9, sh: .7, shc: '#8a2a3e', shr: .5, bump: c.grain('cloth'), bs: .5 }), velIn = mat('#2a060d', { r: .95, sh: .6, shc: '#6e1a2c' });
  const B = G(c.scene, 0, 0, 0); B.rotation.y = -.45;
  M(geo.box(1.1, .5, 1.1, .12), vel, 0, .25, 0, B); M(geo.box(.96, .06, .96, .03), velIn, 0, .48, 0, B);
  const cush = M(geo.cap(.16, .62, 20), velIn, 0, .5, 0, B); cush.rotation.z = Math.PI / 2; M(geo.box(.7, .02, .02, .01), mat('#1a0408'), 0, .66, 0, B);
  const lid = G(B, 0, .5, -.55); M(geo.box(1.1, .38, 1.1, .12), vel, 0, .19, .55, lid); M(geo.box(.96, .04, .96, .02), velIn, 0, .01, .55, lid);
  M(geo.box(.5, .012, .2, .004), gold(), 0, .385, .7, lid);
  // bague : anneau d'or, sertissage, diamant taillé
  const ring = G(B, 0, .62, 0), RG = G(ring);
  M(geo.tor(.2, .028, Math.PI * 2, 80), gold({ r: .15 }), 0, 0, 0, RG);
  for (const a of [0, 1, 2, 3]) { const pr = M(geo.cyl(.008, .01, .1, 8), gold(), Math.cos(a * Math.PI / 2 + .78) * .06, .25, Math.sin(a * Math.PI / 2 + .78) * .06, RG); }
  const gem = M(geo.lathe([[0, -.12], [.13, .01], [.13, .03], [.08, .09], [0, .09]], 8), mat('#eef6ff', { r: 0, m: .3, cc: 1, ccr: 0, flat: true, ir: 1, em: '#9fc6ff', ei: .15 }), 0, .29, 0, RG); gem.castShadow = false;
  const glint = c.sparkles(6, '#ffffff', [.25, .2, .25], 0, .22); RG.add(glint.pts); glint.pts.position.y = .3;
  const sp = c.sparkles(22, '#ffd6dd', [2.4, 2, 1.6], 1.1, .08);
  return {
    dur: 3.2,
    idle(t) { sp.tick(t); B.rotation.y = -.45 + Math.sin(t * .5) * .15; ring.visible = false; },
    open(k, t) {
      sp.tick(t); glint.tick(t * 3); ring.visible = k > .4; B.rotation.y += (-.15 - B.rotation.y) * .04;
      lid.rotation.x = -back(seg(k, 0, .9)) * 1.75;
      const r = ease(seg(k, .5, 1.9)); ring.position.y = .62 + r * .75; RG.rotation.y = t * 1.2 + r * 6; RG.rotation.x = -.25 * r;
      glint.pts.material.size = .22 + Math.max(0, Math.sin(t * 5)) * .25 * r;
      if (k > 1.9 && !this.b) { this.b = 1; c.burst3([0, 1.4, 0], ['#ffffff', '#ffd6dd', o.acc], 70, { geo: new THREE.OctahedronGeometry(.025), speed: 2.4, up: .4, metal: .6, g: 1.5 }); }
    },
    zoom: k => ease(seg(k, 2, 3.2)),
  };
}

// 4. Noir & or : une cage dorée, deux colombes ; la porte s'ouvre et elles s'envolent en spirale
function colombes(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .22); c.look.set(0, 1.35, 0); c.camPos.set(0, 1.7, 7.2); c.fitW = 3; c.fitH = 3.4;
  const gm = gold({ r: .22 }), Cg = G();
  M(geo.cyl(.82, .86, .14, 64), gm, 0, .07, 0, Cg); M(geo.cyl(.86, .86, .03, 64), gm, 0, 1.6, 0, Cg);
  const n = 22; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (i === 5 || i === 6) continue;
    M(geo.cyl(.012, .012, 1.46, 6), gm, Math.cos(a) * .8, .87, Math.sin(a) * .8, Cg);
    const arc = M(geo.tor(.8, .012, Math.PI, 32), gm, 0, 1.6, 0, Cg); arc.rotation.y = -a; arc.scale.y = .7; }
  M(geo.tor(.06, .014, Math.PI * 2, 24), gm, 0, 2.2, 0, Cg); M(geo.sph(.06), gm, 0, 2.15, 0, Cg);
  for (const y of [.5, 1.1]) M(geo.tor(.8, .01, Math.PI * 2, 96), gm, 0, y, 0, Cg).rotation.x = Math.PI / 2;
  const door = G(Cg, Math.cos(5 / n * Math.PI * 2) * .8, .15, Math.sin(5 / n * Math.PI * 2) * .8);
  for (let i = 0; i < 4; i++) M(geo.cyl(.012, .012, .9, 6), gm, i * .07, .45, 0, door); M(geo.box(.24, .02, .02, .005), gm, .1, .9, 0, door); M(geo.box(.24, .02, .02, .005), gm, .1, .02, 0, door);
  door.rotation.y = -(5.5 / n * Math.PI * 2) - Math.PI / 2;
  Cg.rotation.y = .2 + Math.PI / 2 - 5.5 / n * Math.PI * 2;
  const perch = M(geo.cyl(.018, .018, 1.2, 8), mat('#7a5a32', { r: .6 }), 0, .7, 0, Cg); perch.rotation.z = Math.PI / 2;
  const white = mat('#fbfbf8', { r: .7, sh: 1, shc: '#ffffff' });
  const wingS = new THREE.Shape(); wingS.moveTo(0, 0); wingS.bezierCurveTo(.15, .05, .4, .02, .5, -.08); wingS.bezierCurveTo(.38, -.06, .3, -.1, .22, -.12); wingS.bezierCurveTo(.15, -.08, .06, -.06, 0, -.05);
  const wg = new THREE.ShapeGeometry(wingS, 12);
  const dove = (x) => { const g = G(c.scene, x, .82, 0); const b = M(geo.sph(.13, 24), white, 0, 0, 0, g); b.scale.set(1.5, .9, .9);
    const h = G(g, .17, .1, 0); M(geo.sph(.075, 20), white, 0, 0, 0, h); M(geo.cone(.022, .07, 8), mat('#e2a24a', { r: .4 }), .085, -.01, 0, h).rotation.z = -Math.PI / 2;
    for (const z of [-.035, .035]) M(geo.sph(.012, 8), mat('#1a1a1a', { cc: 1 }), .05, .02, z * 1.4, h);
    const tail = M(geo.cone(.08, .22, 12), white, -.26, .02, 0, g); tail.rotation.z = Math.PI / 2; tail.scale.z = .35;
    const wl = G(g, 0, .05, .06), wr = G(g, 0, .05, -.06); const w1 = M(wg, white, -.05, 0, 0, wl); w1.rotation.x = Math.PI / 2; w1.material = mat('#fbfbf8', { r: .7, ds: true, sh: 1 }); w1.rotation.z = Math.PI;
    const w2 = M(wg, w1.material, -.05, 0, 0, wr); w2.rotation.x = -Math.PI / 2; w2.rotation.z = Math.PI;
    return { g, h, wl, wr }; };
  const D = [dove(-.22), dove(.25)]; D[1].g.rotation.y = Math.PI;
  return {
    dur: 3.4,
    idle(t) { D.forEach((d, i) => { d.h.rotation.z = Math.sin(t * 2.2 + i * 2) * .15; d.h.rotation.y = Math.sin(t * 1.3 + i) * .3; d.wl.rotation.x = d.wr.rotation.x = 0; }); Cg.rotation.y += 0; },
    open(k, t) {
      door.rotation.y = -(5.5 / n * Math.PI * 2) - Math.PI / 2 - back(seg(k, 0, .7)) * 1.6;
      D.forEach((d, i) => { const f = seg(k, .5 + i * .25, 2.8 + i * .25), e = ease(f), a = e * Math.PI * 2.2 + i * Math.PI;
        if (f > 0) { const flap = Math.sin(t * 22 + i) * .9; d.wl.rotation.x = flap; d.wr.rotation.x = -flap;
          const ex = new THREE.Vector3(Math.cos(.35) * 1.3, .9, Math.sin(.35) * 1.3);
          const p = f < .25 ? new THREE.Vector3((i ? .25 : -.22), .82, 0).lerp(ex, f / .25) : new THREE.Vector3(Math.cos(a) * (1.3 - e * .4), .9 + e * 2.2, Math.sin(a) * (1.3 - e * .4));
          const prev = d.g.position.clone(); d.g.position.copy(p); const dir = p.clone().sub(prev); if (dir.lengthSq() > 1e-6) d.g.rotation.y = Math.atan2(-dir.z, dir.x); } });
      if (k > 1 && !this.b) { this.b = 1; const fe = new THREE.ShapeGeometry(wingS, 4); fe.scale(.28, .28, .28); c.burst3([0, 1.5, .6], ['#ffffff', '#f5efe2'], 36, { geo: fe, speed: 1.4, up: .7, g: .5, drag: .96, spin: 4 }); this.b2 = c.burst3; }
    },
    zoom: k => ease(seg(k, 2.3, 3.4)),
  };
}

// 5. Romance : une rose sous cloche de verre ; la cloche se lève, la rose s'ouvre, ses pétales s'envolent
function rose(c) {
  const { THREE, M, G, geo, mat, gold, glass, seg, ease, out } = c;
  c.floor(0, .22); c.look.set(0, 1.2, 0); c.camPos.set(0, 1.7, 7); c.fitW = 2.6; c.fitH = 3.2;
  M(geo.lathe([[0, 0], [.78, 0], [.8, .03], [.8, .14], [.74, .18], [.7, .2], [0, .2]], 64), mat('#3a2216', { r: .45, cc: .8, ccr: .2 }), 0, 0, 0);
  M(geo.tor(.71, .02, Math.PI * 2, 96), gold(), 0, .2, 0).rotation.x = Math.PI / 2;
  const dome = G(c.scene, 0, .2, 0); M(geo.lathe([[0, 2.05], [.3, 2.0], [.5, 1.85], [.62, 1.6], [.66, 1.2], [.66, 0], [.64, 0], [.64, 1.2], [.6, 1.6], [.48, 1.83], [.29, 1.97], [0, 2.02]], 64), glass({ th: .05 }), 0, 0, 0, dome);
  M(geo.sph(.06), gold(), 0, 2.08, 0, dome);
  const red = mat('#a3122a', { r: .55, sh: 1, shc: '#ff4d6a', shr: .35, ds: true }), green = mat('#2f5e32', { r: .6 });
  const stem = []; for (let i = 0; i <= 10; i++) stem.push([Math.sin(i * .4) * .03, .2 + i * .1, 0]); M(geo.tube(stem, .018, 40), green, 0, 0, 0);
  const lf = new THREE.Shape(); lf.moveTo(0, 0); lf.bezierCurveTo(.08, .05, .1, .16, 0, .24); lf.bezierCurveTo(-.1, .16, -.08, .05, 0, 0);
  for (const [y, a] of [[.55, .6], [.8, -2.4]]) { const l = M(new THREE.ShapeGeometry(lf, 10), mat('#3c7240', { r: .6, ds: true }), 0, y, 0); l.rotation.set(-.9, a, 0); }
  // pétales : arcs de coupe évasés, disposés en spirale du bouton vers l'extérieur
  const head = G(c.scene, 0, 1.2, 0), P = []; head.scale.setScalar(1.3);
  for (let i = 0; i < 22; i++) { const r = .03 + i * .0105, h = .16 + i * .005, pg = G(head);
    const prof = [[r * .45, 0], [r * .85, h * .3], [r, h * .7], [r * 1.02, h * .88], [r * 1.12 + i * .002, h]].map(q => new THREE.Vector2(q[0], q[1]));
    const pm = M(new THREE.LatheGeometry(prof, 20, 0, 2.2 + Math.min(i, 6) * .14), red, 0, -i * .006, 0, pg); pm.castShadow = true;
    pg.rotation.y = i * 2.4; pg.userData = { i }; P.push(pg); }
  M(geo.sph(.08, 20), mat('#2f5e32', { r: .6 }), 0, -.02, 0, head).scale.y = .7;
  const petGeo = new THREE.SphereGeometry(.2, 20, 14, 0, Math.PI * .7, 0, Math.PI * .55);
  const fallen = []; for (let i = 0; i < 3; i++) { const p = M(petGeo, red, Math.cos(i * 2.1) * .35, .22, Math.sin(i * 2.1) * .35); p.scale.set(.5, .12, .5); p.rotation.y = i; fallen.push(p); }
  const glow = new THREE.PointLight(0xff8aa0, .6, 2.5); glow.position.set(0, 1.3, .3); c.scene.add(glow);
  const sp = c.sparkles(26, '#ffd1dc', [1.6, 2, 1.2], 1.4, .08);
  return {
    dur: 3.4,
    idle(t) { sp.tick(t); head.rotation.y = Math.sin(t * .5) * .3; glow.intensity = .5 + Math.sin(t * 2) * .15; },
    open(k, t) {
      sp.tick(t); const d = ease(seg(k, 0, 1.1)); dome.position.y = .2 + d * 3.2; dome.rotation.z = d * .15;
      const b = ease(seg(k, .7, 2)); P.forEach(p => { const f = 1 + b * (.06 + p.userData.i * .018); p.scale.set(f, 1 - b * .06 * (p.userData.i / 15), f); }); head.rotation.y += .01;
      if (k > 1.6 && !this.b) { this.b = 1; c.burst3([0, 1.4, 0], ['#a3122a', '#c21d3a', '#7d0d20'], 60, { geo: new THREE.SphereGeometry(.08, 10, 8, 0, Math.PI * .7, 0, Math.PI * .55), speed: 2.2, up: .8, g: -.25, drag: .985, spin: 3 }); }
    },
    zoom: k => ease(seg(k, 2.2, 3.4)),
  };
}

// 6. Émeraude : un chandelier doré ; les bougies s'allument une à une et la lumière envahit la scène
function chandelier(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out } = c;
  c.floor(0, .25); c.look.set(0, 1.3, 0); c.camPos.set(0, 1.5, 7); c.fitW = 3.2; c.fitH = 3.2;
  c.key.intensity = 1.2; c.fill.intensity = .3;
  const gm = gold({ r: .22 }), wax = mat('#f7f1e4', { r: .5, sh: .6, shc: '#fff3d6' });
  const K = G(); M(geo.lathe([[0, 0], [.55, 0], [.56, .04], [.4, .1], [.16, .22], [.1, .4], [.14, .5], [.08, .62], [.08, 1.3], [.12, 1.36], [0, 1.4]], 64), gm, 0, 0, 0, K);
  const tips = [[0, 1.4, 0]];
  for (const d of [-1, 1]) for (const r of [.55, 1.05]) { const pts = [[0, 1.0 - r * .12, 0], [d * r * .35, .92 - r * .1, 0], [d * r * .8, 1.0, 0], [d * r, 1.18, 0]]; M(geo.tube(pts, .028, 40), gm, 0, 0, 0, K);
    M(geo.lathe([[0, 0], [.08, 0], [.1, .05], [.06, .08], [0, .08]], 32), gm, d * r, 1.18, 0, K); tips.push([d * r, 1.26, 0]); }
  const F = tips.map(([x, y, z], i) => { const h = .55 + (i % 2) * .1; M(geo.cyl(.055, .06, h, 32), wax, x, y + h / 2, z, K); M(geo.cyl(.004, .004, .05, 6), mat('#222'), x, y + h + .02, z, K); const f = c.flame(K, x, y + h + .03, z, 1, true); f.userData.on = 0; f.visible = false; return f; });
  const order = [0, 1, 3, 2, 4];
  const sp = c.sparkles(30, '#ffe7a8', [3, 2.4, 1.6], 1.7, .08);
  return {
    dur: 3.2,
    idle(t) { sp.tick(t); K.rotation.y = Math.sin(t * .4) * .25; F.forEach(f => f.tick(t)); },
    open(k, t) {
      sp.tick(t); K.rotation.y += (0 - K.rotation.y) * .03;
      order.forEach((i, n) => { const on = out(seg(k, .2 + n * .32, .45 + n * .32)); F[i].visible = on > 0; F[i].userData.on = on; });
      F.forEach(f => f.tick(t)); c.key.intensity = 1.2 + ease(seg(k, .2, 2)) * .9;
      if (k > 1.9 && !this.b) { this.b = 1; c.burst3([0, 2.1, 0], ['#ffe7a8', '#ffd26b', '#ffffff'], 80, { geo: new THREE.ExtrudeGeometry(c.star(.04), { depth: .01, bevelEnabled: false }), speed: 2.6, up: .6, metal: .8, g: 1.4 }); }
    },
    zoom: k => ease(seg(k, 2.1, 3.2)),
  };
}

export default { 1: champagne, 2: gateau, 3: ecrin, 4: colombes, 5: rose, 6: chandelier };
