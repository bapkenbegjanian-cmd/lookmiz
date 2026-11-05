// Anniversaire enfant : 6 scènes 3D, chacune avec son personnage ou son jouet et sa propre ouverture.
const PASTEL = ['#ffb3c7', '#ffd59e', '#fff3a6', '#b8f2c9', '#a8d8ff', '#cdb8ff'];

// 1. Licorne : une licorne de porcelaine cabrée sur son socle tournant ; elle s'élève, l'arc-en-ciel se lève derrière elle
function licorne(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .22); c.look.set(0, 1.2, 0); c.camPos.set(0, 1.7, 7); c.fitW = 3.6; c.fitH = 3.2;
  const ped = G(); M(geo.lathe([[0, 0], [.95, 0], [1.0, .05], [1.0, .2], [.92, .26], [0, .26]], 72), mat('#f7f0fb', { r: .25, cc: 1 }), 0, 0, 0, ped);
  M(geo.tor(.99, .025, Math.PI * 2, 96), gold(), 0, .13, 0, ped).rotation.x = Math.PI / 2;
  const U = G(ped, 0, .26, 0), horse = c.model('horse_statue_01', { h: 2.05, parent: U }); horse.rotation.y = -.5;
  const sz = horse.userData.size || new THREE.Vector3(1, 1.7, .5);
  const horn = G(horse, sz.x * .1, sz.y * .94, 0); horn.rotation.z = -.55; M(geo.cone(.035, .3, 32), gold({ r: .18 }), 0, .15, 0, horn);
  for (let i = 0; i < 4; i++) M(geo.tor(.03 - i * .006, .006), gold(), 0, .04 + i * .065, 0, horn).rotation.x = Math.PI / 2;
  const PASTEL = ['#f9c6d3', '#ffdcae', '#fff2b0', '#c8f0d4', '#bfe0fb', '#d9c8fb'];
  const rain = G(c.scene, 0, .2, -1.3); PASTEL.forEach((col, i) => M(geo.tor(2.3 - i * .16, .075, Math.PI, 96), mat(col, { r: .35, cc: .6 }), 0, 0, 0, rain)); rain.scale.setScalar(.001);
  const clouds = [-2, 2].map(x => { const g = G(c.scene, x, .35, -1.2); for (const [dx, dy, r] of [[0, 0, .32], [.3, .05, .26], [-.3, .02, .25], [.12, .22, .25]]) M(geo.sph(r, 24), mat('#ffffff', { r: .9, sh: 1 }), dx, dy, 0, g); g.scale.setScalar(.001); return g; });
  const sp = c.sparkles(40, '#fff1c8', [4.5, 2.8, 2], 1.5, .1);
  return {
    dur: 3.4,
    idle(t) { sp.tick(t); ped.rotation.y = t * .35; U.position.y = .26 + Math.sin(t * 1.6) * .03; },
    open(k, t) {
      sp.tick(t); ped.rotation.y = t * .35 + ease(seg(k, 0, 1.6)) * Math.PI * 2; U.position.y = .26 + Math.sin(seg(k, 0, 1.6) * Math.PI) * .7;
      rain.scale.setScalar(Math.max(.001, back(seg(k, .9, 1.9)))); clouds.forEach(g => g.scale.setScalar(Math.max(.001, back(seg(k, 1.2, 2)))));
      if (k > 1.2 && !this.b) { this.b = 1; c.burst3([0, 2, 0], PASTEL.concat(['#ffffff', '#ffd76a']), 130, { geo: new THREE.ExtrudeGeometry(c.star(.06), { depth: .015, bevelEnabled: false }), speed: 3.6, up: .5, metal: .5, g: 2.5 }); }
    },
    zoom: k => ease(seg(k, 2.2, 3.4)) * .6,
  };
}

// 2. Bulles : un canard en caoutchouc dans un bain moussant ; il se dandine et des dizaines de bulles irisées s'envolent
function bulles(c) {
  const { THREE, M, G, geo, mat, seg, ease, out } = c;
  c.floor(0, .2); c.look.set(0, .95, 0); c.camPos.set(0, 2.4, 7); c.fitW = 3.4; c.fitH = 3;
  M(geo.lathe([[0, 0], [1.2, 0], [1.38, .2], [1.46, .75], [1.52, .82], [1.46, .86], [1.34, .3], [0, .3]], 72), mat('#ffffff', { r: .12, cc: 1, ccr: .05 }), 0, 0, 0);
  for (const [x, z] of [[-.9, .9], [.9, .9], [-.9, -.9], [.9, -.9]]) M(geo.sph(.15, 24), c.gold(), x * .93, .05, z * .93);
  const water = M(geo.cyl(1.37, 1.37, .04, 72), mat('#9fdcff', { r: .04, op: .75, cc: 1 }), 0, .66, 0); water.castShadow = false;
  const foam = G(c.scene, 0, .7, 0); for (let i = 0; i < 60; i++) { const a = Math.random() * 6.28, r = .55 + Math.random() * .78; M(geo.sph(.08 + Math.random() * .13, 20), mat('#ffffff', { r: .85, sh: 1 }), Math.cos(a) * r, Math.random() * .08, Math.sin(a) * r, foam); }
  const duck = c.model('rubber_duck_toy', { h: .85, pos: [0, .6, .1] }); duck.rotation.y = .5;
  const B = []; const bubM = () => mat('#ffffff', { r: 0, ir: 1, op: .32, m: .2, cc: 1, dw: false });
  const mk = (big) => { const s = M(geo.sph(big ? .55 : .06 + Math.random() * .14, 32), bubM(), (Math.random() - .5) * 2.2, .8, (Math.random() - .5) * 1.4); s.castShadow = false; s.userData = { v: .5 + Math.random() * .8, ph: Math.random() * 6, x: s.position.x }; B.push(s); return s; };
  for (let i = 0; i < 7; i++) { const s = mk(); s.position.y = .8 + Math.random() * 2; }
  let big = null;
  return {
    dur: 3.2,
    idle(t, dt) { duck.position.y = .6 + Math.sin(t * 2) * .03; duck.rotation.z = Math.sin(t * 2) * .06; duck.rotation.y = .5 + Math.sin(t * .6) * .5;
      B.forEach(b => { b.position.y += b.userData.v * dt * .4; b.position.x = b.userData.x + Math.sin(t * 2 + b.userData.ph) * .1; if (b.position.y > 3.4) b.position.y = .8; }); },
    start() { for (let i = 0; i < 40; i++) mk(); big = mk(true); big.position.set(0, 1.1, .3); big.scale.setScalar(.01); },
    open(k, t, dt) {
      const w = Math.sin(k * 9) * .18 * (1 - seg(k, 1, 2)); duck.rotation.z = w; duck.rotation.y += (.2 - duck.rotation.y) * .08; duck.position.y = .6 + Math.abs(Math.sin(k * 9)) * .06 * (1 - seg(k, 1, 2));
      B.forEach(b => { if (b === big) return; b.position.y += b.userData.v * dt * 1.5; b.position.x = b.userData.x + Math.sin(t * 3 + b.userData.ph) * .25; });
      if (big) { const g = out(seg(k, .5, 2.1)); big.scale.setScalar(Math.max(.01, g)); big.position.y = 1.1 + g * .9;
        if (k > 2.3 && big.visible) { big.visible = false; c.burst3([0, 2, .3], ['#ffffff', '#cfeeff', '#ffe0f5'], 90, { geo: new THREE.SphereGeometry(.03, 8, 8), speed: 3, g: 2 }); } }
    },
    zoom: k => ease(seg(k, 2.2, 3.2)) * .6,
  };
}

// 3. Super-héros : une boîte à surprise ; la manivelle tourne, le couvercle saute et le héros jaillit sur son ressort
function heros(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .24); c.look.set(0, 1.25, 0); c.camPos.set(0, 1.8, 7); c.fitW = 3.4;
  const red = mat('#e23b3b', { r: .3, cc: 1, ccr: .1 }), blue = mat('#2554c7', { r: .3, cc: 1, ccr: .1 }), yel = mat('#ffc82e', { r: .3, cc: 1 });
  const box = G(c.scene, 0, 0, 0); M(geo.box(1.5, 1.5, 1.5, .1), red, 0, .75, 0, box);
  for (const [rx, ry, z] of [[0, 0, .76], [0, Math.PI / 2, .76], [0, -Math.PI / 2, .76]]) { const f = G(box, 0, .75, 0); f.rotation.y = ry; const st = M(new THREE.ExtrudeGeometry(c.starShape(.42), { depth: .04, bevelEnabled: true, bevelSize: .02, bevelThickness: .02 }), yel, 0, 0, z, f); }
  for (const y of [.04, 1.46]) M(geo.box(1.56, .08, 1.56, .03), blue, 0, y, 0, box);
  const crankG = G(box, .78, .8, 0); crankG.rotation.z = -Math.PI / 2; M(geo.cyl(.06, .06, .2), gold(), 0, .1, 0, crankG);
  const arm = G(crankG, 0, .2, 0); M(geo.box(.08, .06, .45, .02), gold(), 0, 0, .2, arm); M(geo.cyl(.07, .07, .2), red, 0, .1, .4, arm);
  const lid = G(box, 0, 1.5, -.75); M(geo.box(1.56, .1, 1.56, .04), blue, 0, .05, .75, lid);
  // ressort
  const pts = []; for (let i = 0; i <= 200; i++) { const a = i / 200 * Math.PI * 14; pts.push(new THREE.Vector3(Math.cos(a) * .22, i / 200, Math.sin(a) * .22)); }
  const spring = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, .025, 8), gold({ r: .2 }), 0, .7, 0, box); spring.scale.y = .05;
  const hero = c.doll(box, { pos: [0, .7, 0], cloth: '#2554c7', hair: '#3b2416' });
  M(geo.box(.5, .1, .3, .04), red, 0, .5, 0, hero.g); // ceinture
  const mask = M(geo.tor(.33, .05, Math.PI * 2), red, 0, 1.15, 0, hero.g); mask.rotation.x = Math.PI / 2; mask.scale.set(1, 1, .6);
  const em = M(new THREE.ExtrudeGeometry(c.starShape(.11), { depth: .02, bevelEnabled: false }), yel, 0, .58, .26, hero.g);
  const capeGeo = new THREE.PlaneGeometry(.75, 1, 8, 12), cape = M(capeGeo, mat('#e23b3b', { r: .5, sh: .6, ds: true }), 0, .35, -.32, hero.g); const cp = capeGeo.attributes.position.array.slice();
  hero.g.scale.setScalar(.8); hero.g.position.y = .25; hero.g.visible = false;
  return {
    dur: 3.5,
    idle(t) { arm.rotation.y = t * 2; box.rotation.y = -.5 + Math.sin(t * .5) * .15; },
    open(k, t) {
      arm.rotation.y = t * 2 + seg(k, 0, .8) * 18; box.position.x = Math.sin(k * 60) * .02 * seg(k, .2, .8) * (1 - seg(k, .8, .9)); box.rotation.y += (-.25 - box.rotation.y) * .05;
      const l = seg(k, .85, 1.15); lid.rotation.x = -back(l) * 2.1;
      if (k > .85) { hero.g.visible = true; const e = seg(k, .85, 1.1), damp = Math.exp(-(k - 1.1) * 3) * Math.sin((k - 1.1) * 14) * .25 * (k > 1.1);
        const h = out(e) * 1.6 + damp; spring.scale.y = Math.max(.05, h + .2); hero.g.position.y = .25 + h + .2; hero.g.scale.setScalar(.8 + out(e) * .15);
        hero.armR.rotation.z = 2.6 * out(seg(k, 1.1, 1.5)); hero.armL.rotation.z = -.4 - .5 * Math.sin(k * 5) * seg(k, 1.2, 2);
        hero.headG.rotation.z = Math.sin(k * 4) * .1;
        for (let i = 0; i < cp.length; i += 3) { const y = cp[i + 1]; capeGeo.attributes.position.array[i + 2] = Math.sin(t * 9 + y * 4 + cp[i] * 3) * .08 * (.5 - y) - (.5 - y) * .25; }
        capeGeo.attributes.position.needsUpdate = true; capeGeo.computeVertexNormals(); }
      if (k > 1.05 && !this.b) { this.b = 1; c.burst3([0, 2.2, 0], ['#e23b3b', '#2554c7', '#ffc82e', '#ffffff'], 150, { speed: 5, up: .6 }); }
    },
    zoom: k => ease(seg(k, 2.4, 3.5)),
  };
}

// 4. Jungle : un petit train en bois ; il siffle, fume et fait la ronde des ballons
function train(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out } = c;
  c.floor(0, .22); c.look.set(0, .75, 0); c.camPos.set(1.2, 2.4, 7); c.fitW = 4.4;
  const wood = (col) => mat(col, { r: .55, cc: .5, ccr: .4 });
  const T = G(c.scene, 0, 0, 0), wheels = [];
  const wheel = (p, x, z) => { const w = M(geo.cyl(.2, .2, .1, 32), wood('#e0483e'), x, .2, z, p); w.rotation.x = Math.PI / 2; M(geo.cyl(.06, .06, .12), gold(), 0, 0, 0, w); wheels.push(w); };
  const loco = G(T, .9, 0, 0); M(geo.box(1, .5, .8, .08), wood('#1f9d6b'), 0, .5, 0, loco); M(geo.box(.5, .7, .82, .08), wood('#ffcf4a'), -.25, 1.05, 0, loco);
  M(geo.box(.62, .08, .9, .03), wood('#e0483e'), -.25, 1.42, 0, loco); const boiler = M(geo.cyl(.28, .28, .7, 40), wood('#2c7be5'), .2, .9, 0, loco); boiler.rotation.z = Math.PI / 2;
  const chim = M(geo.cyl(.14, .09, .36), wood('#e0483e'), .38, 1.3, 0, loco); M(geo.sph(.08), gold(), .58, .9, 0, loco);
  for (const x of [-.3, .3]) for (const z of [-.42, .42]) wheel(loco, x, z);
  const wag = [-0.35, -1.55].map((x, i) => { const g = G(T, x, 0, 0); M(geo.box(1, .45, .8, .08), wood(i ? '#ff8a3d' : '#9b5de5'), 0, .52, 0, g); for (const xx of [-.3, .3]) for (const z of [-.42, .42]) wheel(g, xx, z); return g; });
  // animaux en peluche dans les wagons : un lion et un éléphant
  const lion = G(wag[0], 0, .95, 0); M(geo.sph(.3), mat('#f4a531', { r: .7, sh: .8 }), 0, 0, 0, lion); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; M(geo.sph(.12), mat('#b5651d', { r: .8, sh: .8 }), Math.cos(a) * .3, Math.sin(a) * .3, -.05, lion); }
  for (const x of [-.1, .1]) M(geo.sph(.04, 12), mat('#1c1c1c', { cc: 1 }), x, .06, .27, lion); M(geo.sph(.06, 12), mat('#5a2d0c'), 0, -.05, .29, lion);
  const ele = c.model('carved_wooden_elephant', { w: .85, pos: [0, .75, 0], parent: wag[1] }); ele.rotation.y = Math.PI / 2; const trunk = G(ele);
  // ballons attachés
  const balloons = [['#ff5d8f', -1.55, -.2], ['#ffd23f', -1.35, .2], ['#2c7be5', -.35, -.1], ['#1f9d6b', -.15, .25], ['#9b5de5', -1.75, .1]].map(([col, x, z], i) => {
    const b = G(T, x, 1.9 + (i % 2) * .25, z); const s = M(geo.sph(.26), mat(col, { r: .15, cc: 1, ccr: .05 }), 0, 0, 0, b); s.scale.y = 1.2; M(geo.cone(.05, .08), mat(col), 0, -.33, 0, b).rotation.x = Math.PI;
    const str = M(geo.cyl(.006, .006, 1.1), mat('#ffffff'), 0, -.9, 0, b); b.userData = { x, y: b.position.y, ph: i }; return b; });
  // feuilles de palmier au sol
  for (const [x, z, r] of [[-2.6, -1, .6], [2.7, -1.2, -.6], [-2.2, 1.3, 1.2]]) { const p = G(c.scene, x, 0, z); for (let i = 0; i < 6; i++) { const lf = M(geo.cone(.16, 1.1, 4), mat('#2f9e5b', { r: .6, flat: true }), 0, .1, 0, p); lf.rotation.set(Math.PI / 2 - .5, i * 1.05 + r, 0); lf.scale.z = .2; lf.position.set(Math.cos(i * 1.05) * .4, .15, Math.sin(i * 1.05) * .4); } }
  const puffs = []; const puff = () => { const s = M(geo.sph(.12, 16), mat('#ffffff', { r: 1, op: .85 }), 0, 0, 0); s.castShadow = false; const p = new THREE.Vector3(); chim.getWorldPosition(p); s.position.copy(p).add(new THREE.Vector3(0, .25, 0)); s.userData.a = 0; puffs.push(s); };
  T.position.x = .2; T.rotation.y = -.25; let pt = 0;
  return {
    dur: 3.6,
    idle(t, dt) { pt += dt; if (pt > .8) { pt = 0; puff(); } balloons.forEach(b => { b.position.y = b.userData.y + Math.sin(t * 1.5 + b.userData.ph) * .05; b.rotation.z = Math.sin(t + b.userData.ph) * .08; });
      puffs.forEach(s => { s.userData.a += dt; s.position.y += dt * .5; s.scale.setScalar(1 + s.userData.a * 1.5); s.material.opacity = Math.max(0, .85 - s.userData.a * .45); }); lion.rotation.z = Math.sin(t * 2) * .08; ele.rotation.z = Math.sin(t * 2.4) * .06; },
    open(k, t, dt) {
      pt += dt; if (pt > .18) { pt = 0; puff(); }
      const go = ease(seg(k, .2, 2.4)); T.position.x = .2 + go * 1.2; T.rotation.y = -.25 + go * .25; wheels.forEach(w => w.rotation.y = -go * 18);
      T.position.y = Math.abs(Math.sin(k * 14)) * .03 * seg(k, .2, 2.2);
      balloons.forEach((b, i) => { const r = seg(k, 1 + i * .12, 3); b.position.y = b.userData.y + out(r) * 3.5 + Math.sin(t * 1.5 + i) * .05; b.position.x = b.userData.x + Math.sin(t + i) * .3 * r; });
      puffs.forEach(s => { s.userData.a += dt; s.position.y += dt * .6; s.scale.setScalar(1 + s.userData.a * 1.5); s.material.opacity = Math.max(0, .85 - s.userData.a * .45); });
      lion.rotation.z = Math.sin(t * 7) * .15; ele.rotation.z = Math.sin(t * 7) * .12;
      if (k > 1.2 && !this.b) { this.b = 1; c.burst3([1, 1.8, 0], ['#2f9e5b', '#7ed957', '#ffd23f', '#ff5d8f'], 120, { geo: new THREE.CircleGeometry(.06, 5), speed: 4, up: .6 }); }
    },
    zoom: k => ease(seg(k, 2.5, 3.6)),
  };
}

// 5. Princesse : un miroir magique doré ; il s'illumine, scintille, et une couronne s'élève devant lui
function princesse(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .22); c.look.set(0, 1.2, 0); c.camPos.set(0, 1.5, 6.8); c.fitW = 2.8; c.fitH = 3;
  const mir = c.model('ornate_mirror_01', { h: 2.1, pos: [0, 0, -.2] }); const sz = mir.userData.size || new THREE.Vector3(1.2, 2.1, .1);
  const glowM = new THREE.MeshBasicMaterial({ color: 0xffd6ec, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const glow = M(new THREE.PlaneGeometry(sz.x * .72, sz.y * .78), glowM, 0, sz.y * .5, -.2 + sz.z / 2 + .02); glow.castShadow = false;
  const pl = new THREE.PointLight(0xffb8dc, 0, 4); pl.position.set(0, 1.1, .6); c.scene.add(pl);
  const crown = G(c.scene, 0, .2, .55); const cg = gold({ r: .2 });
  M(geo.cyl(.22, .2, .14, 48, true), new THREE.MeshPhysicalMaterial({ color: '#d8b15c', metalness: 1, roughness: .2, side: THREE.DoubleSide }), 0, 0, 0, crown);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; M(geo.cone(.045, .18, 12), cg, Math.cos(a) * .21, .15, Math.sin(a) * .21, crown); M(geo.sph(.028, 12), mat(['#e0115f', '#ffffff', '#5b8cff'][i % 3], { r: .05, cc: 1, m: .2 }), Math.cos(a) * .21, .26, Math.sin(a) * .21, crown); }
  crown.scale.setScalar(.001);
  const sp = c.sparkles(40, '#ffe0f0', [2.4, 2.6, 1.4], 1.3, .1);
  return {
    dur: 3.2,
    idle(t) { sp.tick(t); glowM.opacity = .08 + Math.sin(t * 1.6) * .05; mir.rotation.y = Math.sin(t * .5) * .12; },
    open(k, t) {
      sp.tick(t); const g = out(seg(k, 0, 1)); glowM.opacity = .1 + g * .55 + Math.sin(t * 6) * .05 * g; pl.intensity = g * 6; mir.rotation.y += (0 - mir.rotation.y) * .05;
      const r = back(seg(k, .7, 1.7)); crown.scale.setScalar(Math.max(.001, r * 1.2)); crown.position.y = .2 + ease(seg(k, .7, 2.2)) * 1.1; crown.rotation.y = t * 1.4;
      if (k > 1.6 && !this.b) { this.b = 1; c.burst3([0, 1.4, .6], ['#ff8fbf', '#ffd6ec', '#ffffff', '#d8b15c'], 110, { geo: new THREE.ExtrudeGeometry(c.heart(.05), { depth: .015, bevelEnabled: false }), speed: 3, up: .5, g: 1.5 }); }
    },
    zoom: k => ease(seg(k, 2.2, 3.2)) * .6,
  };
}

// 6. Pirate : un vrai coffre au trésor sur le sable ; le couvercle s'ouvre, une lumière dorée jaillit avec les pièces
function pirate(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .22); c.look.set(0, .75, 0); c.camPos.set(0, 2.3, 6.6); c.fitW = 3.2; c.fitH = 2.8;
  M(geo.cyl(2.1, 2.3, .1, 72), mat('#e7cd96', { r: .95, bump: c.grain('sand'), bs: 2 }), 0, -.05, 0);
  const chest = c.model('treasure_chest', { w: 1.7, pos: [0, 0, 0] }); chest.rotation.y = -.35;
  const lid = chest.getObjectByName('treasure_chest_lid'), lock = chest.getObjectByName('treasure_chest_lock');
  const comp = c.model('seadogs_compass', { w: .45, pos: [1.25, 0, .6] }); comp.rotation.y = .6;
  const glow = new THREE.PointLight(0xffc35a, 0, 4); glow.position.set(0, 1.1, 0); c.scene.add(glow);
  const pile = G(c.scene, 0, .55, 0); for (let i = 0; i < 40; i++) { const cn = M(geo.cyl(.06, .06, .015, 24), gold({ r: .2 }), (Math.random() - .5) * 1.1, Math.random() * .12, (Math.random() - .5) * .5, pile); cn.rotation.set(Math.random(), Math.random(), Math.random()); } pile.rotation.y = -.35; pile.visible = false;
  for (let i = 0; i < 9; i++) { const cn = M(geo.cyl(.06, .06, .015, 24), gold({ r: .22 }), Math.cos(i * 1.3) * 1.4, .02, Math.sin(i * 2) * .7 + .7); cn.rotation.x = .1; }
  const fl = G(c.scene, -1.55, 0, -.4); M(geo.cyl(.03, .03, 2.3, 12), mat('#5a3a1e', { r: .7 }), 0, 1.15, 0, fl);
  const flagTex = c.canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#151515'; g.fillRect(0, 0, w, h); g.fillStyle = '#f5f0e6'; g.beginPath(); g.arc(w / 2, 62, 30, 0, 6.28); g.fill(); g.fillRect(w / 2 - 20, 80, 40, 22); g.fillStyle = '#151515'; g.beginPath(); g.arc(w / 2 - 11, 60, 8, 0, 6.28); g.arc(w / 2 + 11, 60, 8, 0, 6.28); g.fill();
    g.strokeStyle = '#f5f0e6'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(w / 2 - 55, 105); g.lineTo(w / 2 + 55, 145); g.moveTo(w / 2 + 55, 105); g.lineTo(w / 2 - 55, 145); g.stroke(); });
  const fgeo = new THREE.PlaneGeometry(.85, .53, 12, 4), flag = M(fgeo, mat('#ffffff', { map: flagTex, ds: true, r: .85 }), .44, 1.95, 0, fl), fo = fgeo.attributes.position.array.slice();
  const wave = t => { const a = fgeo.attributes.position.array; for (let i = 0; i < a.length; i += 3) a[i + 2] = Math.sin(t * 4 + fo[i] * 6) * .06 * (fo[i] + .43); fgeo.attributes.position.needsUpdate = true; };
  return {
    dur: 3.2,
    idle(t) { wave(t); if (lid) lid.rotation.x = -Math.max(0, Math.sin(t * 2.2)) * .04; },
    open(k, t) {
      wave(t); if (lock) lock.position.y = .422 + Math.sin(seg(k, 0, .4) * Math.PI) * .05;
      if (lid) lid.rotation.x = -back(seg(k, .35, 1.2)) * 1.75; pile.visible = k > .5; glow.intensity = out(seg(k, .45, 1.2)) * 8;
      if (k > .9 && !this.b) { this.b = 1; c.burst3([0, 1.1, 0], ['#ffd76a', '#f1b93a', '#fff1b0'], 120, { geo: new THREE.CylinderGeometry(.055, .055, .014, 16), speed: 5, up: .95, cone: .45, metal: 1, floor: .03, shadow: true }); }
    },
    zoom: k => ease(seg(k, 2.1, 3.2)) * .6,
  };
}

export default { 1: licorne, 2: bulles, 3: heros, 4: train, 5: princesse, 6: pirate };
export const models = { 1: ['horse_statue_01'], 2: ['rubber_duck_toy'], 4: ['carved_wooden_elephant'], 5: ['ornate_mirror_01'], 6: ['treasure_chest', 'seadogs_compass'] };
