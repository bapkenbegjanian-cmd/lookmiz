// Baptême : six scènes.

// 1. Ciel : des petits chaussons posés sur un nuage ; deux ailes d'ange se déploient et tout s'élève
function chaussons(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.look.set(0, 1.1, 0); c.camPos.set(0, 1.9, 6.6); c.fitW = 2.8; c.fitH = 2.8;
  const N = G(c.scene, 0, .6, 0), cloud = mat('#ffffff', { r: .95, sh: 1, shc: '#dfeeff' });
  for (const [x, y, z, r] of [[0, 0, 0, .55], [.5, -.05, .1, .42], [-.5, -.05, .05, .44], [.2, .2, -.2, .4], [-.25, .18, -.15, .38], [.85, -.12, 0, .3], [-.85, -.12, 0, .3]]) M(geo.sph(r, 28), cloud, x, y, z, N);
  const knit = mat('#bcdcf4', { r: .9, sh: 1, shc: '#ffffff', bump: c.grain('cloth'), bs: 2.5 });
  const shoe = x => { const g = G(N, x, .52, .15); const s = M(geo.sph(.2, 24), knit, 0, 0, 0, g); s.scale.set(.8, .55, 1.3); M(geo.cyl(.13, .14, .2, 24), knit, 0, .12, -.08, g); c.bow(g, '#ffffff', 0, .16, .15, .35); g.rotation.y = x > 0 ? -.2 : .2; return g; };
  shoe(-.2); shoe(.22);
  const wingS = new THREE.Shape(); wingS.moveTo(0, 0); wingS.bezierCurveTo(.3, .4, .9, .55, 1.15, .35); wingS.bezierCurveTo(1.0, .2, 1.05, .05, .9, -.05); wingS.bezierCurveTo(.8, -.2, .6, -.25, .45, -.2); wingS.bezierCurveTo(.3, -.3, .1, -.2, 0, 0);
  const wm = mat('#ffffff', { r: .7, sh: 1, shc: '#fff4d6', ds: true, em: '#fff4d6', ei: .1 });
  const wings = [-1, 1].map(d => { const g = G(N, d * .05, .5, -.35); const w = M(new THREE.ExtrudeGeometry(wingS, { depth: .03, bevelEnabled: true, bevelSize: .02, bevelThickness: .02, bevelSegments: 2 }), wm, 0, 0, 0, g); if (d < 0) g.scale.x = -1; g.scale.multiplyScalar(.001); return g; });
  const halo = M(geo.tor(.32, .03, Math.PI * 2, 48), gold({ em: '#ffd98a', ei: .5 }), 0, 1.5, -.1, N); halo.rotation.x = Math.PI / 2.4; halo.scale.setScalar(.001);
  const sp = c.sparkles(30, '#fff6d8', [3, 2.4, 1.6], 1.4, .09);
  return {
    dur: 3,
    idle(t) { sp.tick(t); N.position.y = .6 + Math.sin(t * 1.1) * .06; N.rotation.y = Math.sin(t * .5) * .2; },
    open(k, t) {
      sp.tick(t); const w = back(seg(k, 0, 1)); wings.forEach((g, i) => { const s = Math.max(.001, w * .9); g.scale.set((i ? 1 : -1) * s, s, s); g.rotation.z = (i ? 1 : -1) * Math.sin(t * 5) * .12 * seg(k, .8, 1.4); });
      halo.scale.setScalar(Math.max(.001, out(seg(k, .6, 1.3)))); halo.rotation.z = t; N.position.y = .6 + ease(seg(k, .8, 2.6)) * .5 + Math.sin(t * 1.1) * .04;
    },
    zoom: k => ease(seg(k, 1.9, 3)) * .5,
  };
}

// 2. Douceur : une coupe de cristal remplie de dragées ; elles sautent une à une et retombent en pluie pastel
function dragees(c) {
  const { THREE, M, G, geo, mat, gold, glass, seg, ease, out } = c;
  c.floor(0, .22); c.look.set(0, .8, 0); c.camPos.set(0, 2.4, 6.2); c.fitW = 2.4; c.fitH = 2.4;
  M(geo.lathe([[0, 0], [.4, 0], [.42, .03], [.1, .1], [.06, .5], [.15, .6], [.62, .8], [.72, 1.1], [.7, 1.12], [.6, .84], [.14, .64], [0, .64]], 64), glass(), 0, 0, 0);
  const cols = ['#f8d5e0', '#d5e8f8', '#ffffff', '#e6dcf7', '#f8ecc9'], dg = new THREE.SphereGeometry(.07, 16, 12);
  const D = []; for (let i = 0; i < 46; i++) { const a = Math.random() * 6.28, r = Math.random() * .5; const d = M(dg, mat(cols[i % 5], { r: .25, cc: 1, ccr: .1 }), Math.cos(a) * r, .7 + Math.random() * .3 + (.5 - r) * .2, Math.sin(a) * r); d.scale.set(1, .72, .72); d.rotation.set(Math.random(), Math.random(), Math.random()); d.userData = { y: d.position.y, v: 2 + Math.random() * 1.8, t0: Math.random() * .8, a: Math.random() * 6.28 }; D.push(d); }
  c.bow(c.scene, '#f8d5e0', 0, .62, .48, .7);
  return {
    dur: 2.8,
    idle(t) { D.forEach((d, i) => { if (i < 3) d.position.y = d.userData.y + Math.max(0, Math.sin(t * 2.5 + i * 2)) * .2; }); },
    open(k, t) { D.forEach(d => { const f = k - d.userData.t0; if (f < 0) return; const y = d.userData.y + d.userData.v * f - 4.5 * f * f; d.position.y = Math.max(d.userData.y * (f > .3 ? 0 : 1), y); d.position.x += Math.cos(d.userData.a) * .006; d.position.z += Math.sin(d.userData.a) * .006; d.rotation.x += .1; if (d.position.y < .03) d.position.y = .04; }); },
    zoom: k => ease(seg(k, 1.8, 2.8)) * .5,
  };
}

// 3. Nature : un jeune olivier en pot ; ses branches poussent, ses feuilles et ses fleurs blanches éclosent
function arbre(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .22); c.look.set(0, 1.25, 0); c.camPos.set(0, 1.6, 6.8); c.fitW = 2.6; c.fitH = 3.2;
  M(geo.lathe([[0, 0], [.3, 0], [.42, .5], [.46, .55], [.44, .6], [0, .6]], 48), mat('#d9cfc3', { r: .8, bump: c.grain('sand'), bs: .4 }), 0, 0, 0);
  M(geo.cyl(.4, .4, .03, 40), mat('#5a3d27', { r: .95 }), 0, .56, 0);
  const bark = mat('#7a5a3e', { r: .9, bump: c.grain('sand'), bs: 1 }), leafM = mat('#8aa57a', { r: .6, sh: .4, ds: true }), flowerM = mat('#ffffff', { r: .5, sh: .6, ds: true });
  const branches = [], leaves = [], flowers = [];
  const leafS = new THREE.Shape(); leafS.moveTo(0, 0); leafS.bezierCurveTo(.03, .03, .04, .12, 0, .17); leafS.bezierCurveTo(-.04, .12, -.03, .03, 0, 0); const lg = new THREE.ShapeGeometry(leafS, 8);
  const grow = (from, dir, len, depth) => { const to = from.clone().add(dir.clone().multiplyScalar(len)), mid = from.clone().lerp(to, .5).add(new THREE.Vector3((Math.random() - .5) * .1, 0, (Math.random() - .5) * .1));
    const m = M(geo.tube([from.toArray(), mid.toArray(), to.toArray()], .05 * Math.pow(.62, 3 - depth), 20), bark, 0, 0, 0); m.geometry.setDrawRange(0, 0); branches.push([m, 3 - depth]);
    if (depth > 0) for (let i = 0; i < 2 + (depth > 1 ? 1 : 0); i++) { const d = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), i * 2.2 + Math.random()).applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - .5) * .9).normalize(); d.y = Math.abs(d.y) + .4; d.normalize(); grow(to, d, len * .7, depth - 1); }
    else for (let i = 0; i < 6; i++) { const l = M(lg, leafM, to.x + (Math.random() - .5) * .25, to.y + (Math.random() - .5) * .2, to.z + (Math.random() - .5) * .25); l.rotation.set(Math.random() * 6, Math.random() * 6, 0); l.scale.setScalar(.001); leaves.push(l);
      if (i % 2 === 0) { const f = G(c.scene, to.x + (Math.random() - .5) * .3, to.y + (Math.random() - .5) * .2, to.z + (Math.random() - .5) * .3); for (let p = 0; p < 5; p++) { const pe = M(geo.sph(.03, 8), flowerM, Math.cos(p * 1.26) * .035, 0, Math.sin(p * 1.26) * .035, f); pe.scale.y = .3; } M(geo.sph(.015, 6), mat('#f0c64a'), 0, .01, 0, f); f.scale.setScalar(.001); flowers.push(f); } } };
  grow(new THREE.Vector3(0, .56, 0), new THREE.Vector3(0, 1, 0), .8, 3);
  const setGrow = f => { branches.forEach(([m, d]) => { const g = seg(f, d * .2, d * .2 + .3); m.geometry.setDrawRange(0, Math.floor(m.geometry.index.count * g)); }); leaves.forEach((l, i) => l.scale.setScalar(Math.max(.001, out(seg(f, .75 + (i % 10) * .01, .9))))); };
  return {
    dur: 3.2,
    idle(t) { setGrow(.3 + Math.sin(t * .8) * .02); },
    open(k, t) { setGrow(.3 + ease(seg(k, 0, 2.2)) * .7); flowers.forEach((f, i) => f.scale.setScalar(Math.max(.001, back(seg(k, 2 + (i % 8) * .06, 2.5 + (i % 8) * .06))))); },
    zoom: k => ease(seg(k, 2.2, 3.2)) * .5,
  };
}

// 4. Champagne : un coquillage d'argent rempli d'eau ; une goutte tombe, des ondes dorées s'élargissent
function coquillage(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, o } = c;
  c.floor(0, .22); c.look.set(0, .55, 0); c.camPos.set(0, 2.8, 5.2); c.fitW = 2.6; c.fitH = 2.2;
  const silver = mat('#e6e2dc', { r: .2, m: 1 });
  const shell = new THREE.Shape(); shell.moveTo(0, -.15); for (let i = 0; i <= 40; i++) { const a = Math.PI * (.08 + .84 * i / 40), r = .95 * (1 + .04 * Math.cos(a * 18)); shell.lineTo(Math.cos(a) * r, Math.sin(a) * r - .15); } shell.closePath();
  const S = M(new THREE.ExtrudeGeometry(shell, { depth: .08, bevelEnabled: true, bevelSize: .05, bevelThickness: .08, bevelSegments: 6, curveSegments: 40 }), silver, 0, .2, .35); S.rotation.x = -Math.PI / 2 + .25;
  M(geo.lathe([[0, 0], [.3, 0], [.32, .04], [.1, .1], [.08, .2], [0, .2]], 40), silver, 0, 0, .1);
  const water = M(geo.circle(.78, 64), mat('#bfe3f2', { r: .02, op: .55, dw: false, cc: 1 }), 0, .32, .25); water.rotation.x = -Math.PI / 2 + .25; water.castShadow = false;
  const drop = M(geo.sph(.07, 20), mat('#dff2ff', { r: .02, op: .7, cc: 1 }), 0, 2.6, .3); drop.scale.y = 1.3;
  const rings = []; for (let i = 0; i < 4; i++) { const r = M(geo.tor(.1, .008, Math.PI * 2, 64), gold({ em: '#ffd98a', ei: .6 }), 0, .33, .28); r.rotation.x = Math.PI / 2 + .25; r.visible = false; rings.push(r); }
  const sp = c.sparkles(24, '#ffffff', [2.4, 1.8, 1.6], 1, .08);
  return {
    dur: 3,
    idle(t) { sp.tick(t); water.position.y = .32 + Math.sin(t * 2) * .004; drop.position.y = 2.6; },
    open(k, t) {
      sp.tick(t); const f = seg(k, 0, .7); drop.position.y = 2.6 - f * f * 2.28; drop.visible = f < 1;
      rings.forEach((r, i) => { const g = seg(k, .7 + i * .25, 2.2 + i * .25); r.visible = g > 0 && g < 1; const s = 1 + g * 6.5; r.scale.set(s, s, 1); r.material.opacity = 1 - g; r.material.transparent = true; });
      if (k > .7 && !this.b) { this.b = 1; c.burst3([0, .4, .3], ['#dff2ff', '#ffffff'], 40, { geo: new THREE.SphereGeometry(.025, 8, 6), speed: 1.8, up: 1.1, cone: .3, g: 5, floor: .3 }); }
    },
    zoom: k => ease(seg(k, 1.9, 3)) * .5,
  };
}

// 5. Blanc pur : une chapelle blanche ; la cloche se balance et sonne, les portes s'ouvrent sur une lumière dorée
function chapelle(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .22); c.look.set(0, 1.35, 0); c.camPos.set(.8, 1.6, 7); c.fitW = 2.8; c.fitH = 3.4;
  const wall = mat('#f7f4ee', { r: .85, bump: c.grain('sand'), bs: .3 }), roof = mat('#c9d6e4', { r: .5, cc: .4 });
  const Ch = G(); Ch.rotation.y = -.35;
  M(geo.box(1.4, 1.1, 1.6, .03), wall, 0, .55, 0, Ch);
  const rs = new THREE.Shape(); rs.moveTo(-.8, 0); rs.lineTo(0, .6); rs.lineTo(.8, 0); rs.closePath(); const r = M(new THREE.ExtrudeGeometry(rs, { depth: 1.7, bevelEnabled: false }), roof, 0, 1.1, -.85, Ch);
  const tower = G(Ch, 0, 0, .55); M(geo.box(.5, 2.1, .5, .03), wall, 0, 1.05, 0, tower); M(geo.cone(.42, .7, 4), roof, 0, 2.45, 0, tower).rotation.y = Math.PI / 4;
  M(geo.box(.04, .3, .04, .01), gold(), 0, 2.95, 0, tower); M(geo.box(.18, .04, .04, .01), gold(), 0, 2.98, 0, tower);
  M(geo.box(.34, .4, .1, .02), mat('#2b3542'), 0, 1.75, .21, tower);
  const bell = G(tower, 0, 1.92, .2); M(geo.lathe([[0, 0], [.04, 0], [.06, -.05], [.08, -.18], [.13, -.27], [.13, -.29], [0, -.29]], 32), gold({ r: .3 }), 0, 0, 0, bell);
  const doorL = G(Ch, -.2, 0, .81), doorR = G(Ch, .2, 0, .81); const dm = mat('#a8866a', { r: .6 });
  M(geo.box(.2, .62, .04, .01), dm, .1, .31, 0, doorL); M(geo.box(.2, .62, .04, .01), dm, -.1, .31, 0, doorR);
  const inner = M(geo.plane(.4, .62), mat('#ffe4a8', { em: '#ffd27a', ei: 0 }), 0, .31, .79, Ch);
  const pl = new THREE.PointLight(0xffd27a, 0, 4); pl.position.set(0, .4, 1.2); Ch.add(pl);
  const sp = c.sparkles(26, '#fff6d8', [3, 3, 1.6], 1.8, .09);
  return {
    dur: 3,
    idle(t) { sp.tick(t); bell.rotation.x = Math.sin(t * 2) * .12; },
    open(k, t) {
      sp.tick(t); bell.rotation.x = Math.sin(t * 7) * .6 * (1 - seg(k, 1.4, 2.4));
      const d = back(seg(k, .5, 1.3)); doorL.rotation.y = -d * 1.6; doorR.rotation.y = d * 1.6; inner.material.emissiveIntensity = out(seg(k, .5, 1.3)) * 1.5; pl.intensity = out(seg(k, .5, 1.3)) * 6;
      if (k > 1.3 && !this.b) { this.b = 1; c.burst3([0, 2.4, 0], ['#ffffff', '#fff3d6', '#d8e6f4'], 100, { geo: new THREE.ShapeGeometry(c.heart(.05)), speed: 2, up: .4, cone: 1.4, g: .4, drag: .97, flutter: .4 }); }
    },
    zoom: k => ease(seg(k, 1.9, 3)) * .5,
  };
}

// 6. Lavande : le cierge de baptême au ruban s'allume ; des brins de lavande s'élèvent autour de la flamme
function cierge(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back, o } = c;
  c.floor(0, .25); c.look.set(0, 1.3, 0); c.camPos.set(0, 1.5, 6.6); c.fitW = 2.4; c.fitH = 3.2;
  c.key.intensity = 1.4;
  M(geo.lathe([[0, 0], [.4, 0], [.42, .04], [.2, .1], [.12, .2], [.25, .26], [.25, .3], [0, .3]], 48), gold({ r: .3 }), 0, 0, 0);
  const wax = mat('#f8f3ea', { r: .5, sh: .6, shc: '#fff3d6' }); M(geo.cyl(.13, .13, 2, 40), wax, 0, 1.3, 0);
  const motif = c.canvasTex(256, 512, g => { g.fillStyle = '#f8f3ea'; g.fillRect(0, 0, 256, 512); g.strokeStyle = '#8b6fc8'; g.lineWidth = 6; g.beginPath(); g.moveTo(128, 120); g.lineTo(128, 330); g.moveTo(70, 190); g.lineTo(186, 190); g.stroke();
    g.strokeStyle = '#d8b15c'; g.lineWidth = 3; g.strokeRect(40, 80, 176, 300); });
  M(geo.cyl(.132, .132, .9, 40, true), mat('#ffffff', { map: motif, r: .5 }), 0, 1.25, 0);
  c.bow(c.scene, '#b9a3e3', 0, .62, .14, .5);
  M(geo.cyl(.005, .005, .06, 6), mat('#222'), 0, 2.33, 0);
  const fl = c.flame(c.scene, 0, 2.34, 0, 1.1, true); fl.userData.on = 0; fl.visible = false;
  const lav = []; for (let i = 0; i < 6; i++) { const g = G(c.scene, Math.cos(i * 1.05) * .7, .3, Math.sin(i * 1.05) * .4); M(geo.cyl(.008, .008, .7, 6), mat('#6f8f5e'), 0, .35, 0, g);
    for (let j = 0; j < 10; j++) M(geo.sph(.025, 8), mat(j % 2 ? '#8b6fc8' : '#a68be0', { r: .7 }), (j % 2 ? .02 : -.02), .5 + j * .035, 0, g); g.rotation.z = (i - 2.5) * .12; g.scale.setScalar(.001); lav.push(g); }
  return {
    dur: 3,
    idle(t) { fl.tick(t); },
    open(k, t) {
      const on = out(seg(k, .1, .6)); fl.visible = on > 0; fl.userData.on = on; fl.tick(t);
      lav.forEach((g, i) => { const f = back(seg(k, .6 + i * .12, 1.3 + i * .12)); g.scale.setScalar(Math.max(.001, f)); g.position.y = .3 + ease(seg(k, 1 + i * .1, 3)) * .6; g.rotation.y = t * .4 + i; });
      if (k > 1.6 && !this.b) { this.b = 1; c.burst3([0, 2.4, 0], ['#a68be0', '#e2d9f5', '#ffffff', o.acc], 80, { geo: new THREE.SphereGeometry(.02, 6, 4), speed: 1.8, up: .5, cone: 1.4, g: .3, drag: .97 }); }
    },
    zoom: k => ease(seg(k, 1.9, 3)) * .5,
  };
}

export default { 1: chaussons, 2: dragees, 3: arbre, 4: coquillage, 5: chapelle, 6: cierge };
