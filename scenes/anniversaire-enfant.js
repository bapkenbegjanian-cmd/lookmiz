// Anniversaire enfant : 6 scènes 3D, chacune avec son personnage ou son jouet et sa propre ouverture.
const PASTEL = ['#ffb3c7', '#ffd59e', '#fff3a6', '#b8f2c9', '#a8d8ff', '#cdb8ff'];

// 1. Licorne : la licorne saute, tourne sur elle-même, un arc-en-ciel se lève derrière elle
function licorne(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back, bounce } = c;
  c.floor(0, .22); c.look.set(0, 1.05, 0); c.camPos.set(0, 1.9, 7); c.fitW = 3.8;
  const white = mat('#fffafc', { r: .65, sh: 1, shc: '#ffe4f2' });
  const ped = G(); M(geo.cyl(1.15, 1.25, .32), mat('#f6e9ff', { r: .4, cc: .6 }), 0, .16, 0, ped); M(geo.tor(1.18, .035), gold(), 0, .32, 0, ped).rotation.x = Math.PI / 2;
  const U = G(ped, 0, .32, 0), body = G(U, 0, .62, 0);
  M(geo.cap(.36, .62), white, 0, 0, 0, body).rotation.z = Math.PI / 2;
  const legs = [[-.32, .2], [-.32, -.2], [.3, .2], [.3, -.2]].map(([x, z]) => { const l = G(body, x, -.15, z); M(geo.cap(.1, .3), white, 0, -.2, 0, l); M(geo.cyl(.11, .12, .08), mat('#d8b4ff', { r: .3, cc: 1 }), 0, -.42, 0, l); return l; });
  const neck = G(body, .42, .22, 0); neck.rotation.z = -.5; M(geo.cap(.2, .35), white, 0, .25, 0, neck);
  const head = G(neck, 0, .58, 0); head.rotation.z = .5;
  M(geo.sph(.3), white, 0, 0, 0, head); const snout = M(geo.sph(.2), white, .24, -.08, 0, head); snout.scale.set(1.2, .85, .95);
  const eye = mat('#2b1d33', { r: .1, cc: 1 }); for (const z of [-.2, .2]) { M(geo.sph(.05, 16), eye, .13, .07, z, head); const lash = M(geo.tor(.05, .008, Math.PI), eye, .14, .11, z, head); lash.rotation.y = Math.PI / 2; }
  for (const z of [-.13, .13]) { const ear = M(geo.cone(.07, .2), white, -.06, .3, z, head); ear.rotation.z = .3; }
  const horn = G(head, .05, .38, 0); horn.rotation.z = -.25; M(geo.cone(.075, .42, 32), gold({ r: .2 }), 0, .2, 0, horn);
  for (let i = 0; i < 4; i++) M(geo.tor(.06 - i * .012, .012), gold(), 0, .06 + i * .09, 0, horn).rotation.x = Math.PI / 2;
  const mane = []; for (let i = 0; i < 9; i++) { const s = M(geo.sph(.12 - i * .004), mat(PASTEL[i % 6], { r: .5, sh: .8 }), -.12 - i * .03, .25 - i * .1, 0, head); mane.push(s); }
  const tail = G(body, -.6, .1, 0); for (let i = 0; i < 6; i++) M(geo.sph(.13 - i * .012), mat(PASTEL[(i + 2) % 6], { r: .5, sh: .8 }), -i * .09, -i * .07, 0, tail);
  // arc-en-ciel
  const rain = G(c.scene, 0, .3, -1.2); const arcs = PASTEL.map((col, i) => M(geo.tor(2.2 - i * .17, .085, Math.PI), mat(col, { r: .45, cc: .4, em: col, ei: .15 }), 0, 0, 0, rain)); rain.scale.setScalar(.001);
  const clouds = [-1.9, 1.9].map(x => { const g = G(c.scene, x, .35, -1.1); for (const [dx, dy, r] of [[0, 0, .32], [.3, .05, .26], [-.3, .02, .25], [.12, .22, .25]]) M(geo.sph(r), mat('#ffffff', { r: .8, sh: 1 }), dx, dy, 0, g); g.scale.setScalar(.001); return g; });
  const sp = c.sparkles(40, '#fff1b8', [4.5, 2.6, 2], 1.4);
  return {
    dur: 3.4,
    idle(t) { sp.tick(t); body.position.y = .62 + Math.sin(t * 2.2) * .015; head.rotation.x = Math.sin(t * 1.1) * .08; tail.rotation.x = Math.sin(t * 2) * .2; ped.rotation.y = Math.sin(t * .5) * .35; },
    open(k, t) {
      sp.tick(t);
      const crouch = Math.sin(seg(k, 0, .35) * Math.PI) * .18; const j = seg(k, .35, 1.25), jy = Math.sin(j * Math.PI) * 1.1;
      U.position.y = .32 + jy - crouch * .4; body.scale.set(1 + crouch * .3, 1 - crouch, 1);
      U.rotation.y = ease(j) * Math.PI * 2 + Math.sin(t * .5) * .2; legs.forEach((l, i) => l.rotation.z = Math.sin(j * Math.PI) * (i < 2 ? .6 : -.6));
      ped.rotation.y += (0 - ped.rotation.y) * .1;
      const r = back(seg(k, .9, 1.9)); rain.scale.setScalar(Math.max(.001, r)); clouds.forEach(g => g.scale.setScalar(Math.max(.001, back(seg(k, 1.2, 2)))));
      if (k > 1.25 && !this.b) { this.b = 1; c.burst3([0, 1.6, 0], PASTEL.concat(['#ffffff', '#ffd76a']), 140, { geo: new THREE.ExtrudeGeometry(c.starShape(.06), { depth: .015, bevelEnabled: false }), speed: 4, up: .5, metal: .4 }); }
      head.rotation.x = Math.sin(t * 6) * .1 * seg(k, 1.3, 2);
    },
    zoom: k => ease(seg(k, 2, 3.4)),
  };
}

// 2. Bulles : un canard dans un bain moussant ; il fait « coin », et des dizaines de bulles irisées s'envolent
function bulles(c) {
  const { THREE, M, G, geo, mat, seg, ease, out } = c;
  c.floor(0, .2); c.look.set(0, .9, 0); c.camPos.set(0, 2.6, 7); c.fitW = 3.6;
  const tub = M(geo.lathe([[0, 0], [1.25, 0], [1.42, .2], [1.5, .75], [1.56, .82], [1.5, .86], [1.38, .3], [0, .3]]), mat('#ffffff', { r: .15, cc: 1, ccr: .05 }), 0, 0, 0);
  for (const [x, z] of [[-.9, .9], [.9, .9], [-.9, -.9], [.9, -.9]]) M(geo.sph(.16), c.gold(), x * .95, .05, z * .95);
  const water = M(geo.cyl(1.4, 1.4, .05), mat('#8fd3ff', { r: .05, tr: .6, th: .5, cc: 1 }), 0, .66, 0);
  const foam = G(c.scene, 0, .7, 0); for (let i = 0; i < 46; i++) { const a = Math.random() * 6.28, r = .55 + Math.random() * .8; M(geo.sph(.1 + Math.random() * .14, 20), mat('#ffffff', { r: .9, sh: 1 }), Math.cos(a) * r, Math.random() * .08, Math.sin(a) * r, foam); }
  const duck = G(c.scene, 0, .72, .1), yel = mat('#ffd23f', { r: .25, cc: 1, ccr: .1 });
  const db = M(geo.sph(.42), yel, 0, .18, 0, duck); db.scale.set(1.25, .8, 1);
  M(geo.sph(.16), yel, -.5, .32, 0, duck).scale.set(1, .6, .7);
  const dh = G(duck, .32, .62, 0); M(geo.sph(.27), yel, 0, 0, 0, dh);
  const beak = G(dh, .25, -.04, 0); const bt = M(geo.sph(.13), mat('#ff8a1e', { r: .3, cc: 1 }), .06, .02, 0, beak); bt.scale.set(1.3, .45, 1); const bb = M(geo.sph(.12), mat('#f07010', { r: .3, cc: 1 }), .05, -.05, 0, beak); bb.scale.set(1.2, .35, .9);
  for (const z of [-.15, .15]) { M(geo.sph(.05, 16), mat('#1c1c1c', { cc: 1 }), .17, .09, z, dh); M(geo.sph(.018, 8), mat('#ffffff'), .21, .11, z * 1.05, dh); }
  for (const z of [-.33, .33]) M(geo.sph(.17), yel, -.05, .2, z, duck).scale.set(1.2, .55, .4);
  const bubM = () => mat('#ffffff', { r: 0, tr: 1, th: .05, ir: 1, op: .9, ior: 1.2 });
  const B = []; const mk = (big) => { const s = M(geo.sph(big ? .6 : .08 + Math.random() * .16, 32), bubM(), (Math.random() - .5) * 2, .8, (Math.random() - .5) * 1.4); s.castShadow = false; s.userData = { v: .5 + Math.random() * .8, ph: Math.random() * 6, x: s.position.x }; B.push(s); return s; };
  for (let i = 0; i < 5; i++) { const s = mk(); s.position.y = .8 + Math.random() * 2; }
  let big = null;
  return {
    dur: 3.3,
    idle(t, dt) { duck.position.y = .72 + Math.sin(t * 2) * .03; duck.rotation.z = Math.sin(t * 2) * .05; duck.rotation.y = Math.sin(t * .6) * .5;
      B.forEach(b => { b.position.y += b.userData.v * dt * .4; b.position.x = b.userData.x + Math.sin(t * 2 + b.userData.ph) * .1; if (b.position.y > 3.4) b.position.y = .8; }); },
    start() { for (let i = 0; i < 45; i++) mk(); big = mk(true); big.position.set(0, 1, .2); big.scale.setScalar(.01); },
    open(k, t, dt) {
      const q = Math.sin(seg(k, 0, .5) * Math.PI); duck.scale.set(1 + q * .15, 1 - q * .2, 1 + q * .15); beak.rotation.z = q * .5; duck.rotation.y += (0 - duck.rotation.y) * .1;
      duck.position.y = .72 + Math.sin(t * 6) * .04 * seg(k, .3, 1);
      B.forEach(b => { if (b === big) return; b.position.y += b.userData.v * dt * 1.5; b.position.x = b.userData.x + Math.sin(t * 3 + b.userData.ph) * .25; });
      if (big) { const g = out(seg(k, .6, 2.2)); big.scale.setScalar(Math.max(.01, g)); big.position.y = 1 + g * .9;
        if (k > 2.4 && big.visible) { big.visible = false; c.burst3([0, 1.9, .2], ['#ffffff', '#bfe6ff', '#ffd6f5'], 90, { geo: new THREE.SphereGeometry(.035, 8, 8), speed: 3, g: 2 }); } }
    },
    zoom: k => ease(seg(k, 2.2, 3.3)),
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
  const ele = G(wag[1], 0, .95, 0), grey = mat('#a9b4c2', { r: .7, sh: .8 }); M(geo.sph(.3), grey, 0, 0, 0, ele); const trunk = G(ele, 0, -.05, .25); M(geo.cap(.07, .3), grey, 0, -.15, .05, trunk); trunk.rotation.x = .5;
  for (const x of [-.3, .3]) { const e = M(geo.sph(.2), mat('#c7a6b6', { r: .7 }), x, .05, -.05, ele); e.scale.set(.4, 1, 1); } for (const x of [-.1, .1]) M(geo.sph(.04, 12), mat('#1c1c1c', { cc: 1 }), x, .08, .27, ele);
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
      puffs.forEach(s => { s.userData.a += dt; s.position.y += dt * .5; s.scale.setScalar(1 + s.userData.a * 1.5); s.material.opacity = Math.max(0, .85 - s.userData.a * .45); }); lion.rotation.z = Math.sin(t * 2) * .08; trunk.rotation.x = .5 + Math.sin(t * 2.4) * .25; },
    open(k, t, dt) {
      pt += dt; if (pt > .18) { pt = 0; puff(); }
      const go = ease(seg(k, .2, 2.4)); T.position.x = .2 + go * 1.2; T.rotation.y = -.25 + go * .25; wheels.forEach(w => w.rotation.y = -go * 18);
      T.position.y = Math.abs(Math.sin(k * 14)) * .03 * seg(k, .2, 2.2);
      balloons.forEach((b, i) => { const r = seg(k, 1 + i * .12, 3); b.position.y = b.userData.y + out(r) * 3.5 + Math.sin(t * 1.5 + i) * .05; b.position.x = b.userData.x + Math.sin(t + i) * .3 * r; });
      puffs.forEach(s => { s.userData.a += dt; s.position.y += dt * .6; s.scale.setScalar(1 + s.userData.a * 1.5); s.material.opacity = Math.max(0, .85 - s.userData.a * .45); });
      lion.rotation.z = Math.sin(t * 7) * .15; trunk.rotation.x = .5 - seg(k, .4, .9) * 1.4 + Math.sin(t * 6) * .1;
      if (k > 1.2 && !this.b) { this.b = 1; c.burst3([1, 1.8, 0], ['#2f9e5b', '#7ed957', '#ffd23f', '#ff5d8f'], 120, { geo: new THREE.CircleGeometry(.06, 5), speed: 4, up: .6 }); }
    },
    zoom: k => ease(seg(k, 2.5, 3.6)),
  };
}

// 5. Princesse : un château rose ; la porte s'ouvre et la princesse sort en tournant comme dans une boîte à musique
function princesse(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .22); c.look.set(0, 1.2, 0); c.camPos.set(0, 1.9, 7); c.fitW = 3.9;
  const pink = mat('#f7c3d6', { r: .5, sh: .6 }), roof = mat('#c55bd0', { r: .35, cc: .8 }), cream = mat('#fff3f8', { r: .6 });
  const K = G(c.scene, 0, 0, -.6);
  M(geo.box(2.2, 1.3, .7, .05), pink, 0, .65, 0, K);
  for (let i = 0; i < 6; i++) M(geo.box(.22, .2, .72, .02), pink, -.95 + i * .38, 1.4, 0, K);
  const flags = [];
  for (const [x, h, r] of [[-1.25, 2, .34], [1.25, 2, .34], [0, 2.5, .3]]) { M(geo.cyl(r, r, h, 40), pink, x, h / 2, x ? .1 : -.25, K); M(geo.cone(r * 1.3, .8, 40), roof, x, h + .4, x ? .1 : -.25, K); M(geo.sph(.06), gold(), x, h + .85, x ? .1 : -.25, K);
    const pole = M(geo.cyl(.012, .012, .4), gold(), x, h + 1, x ? .1 : -.25, K); const fg = new THREE.PlaneGeometry(.3, .18, 8, 2); const f = M(fg, mat('#ff5d8f', { ds: true, r: .6 }), x + .16, h + 1.1, x ? .1 : -.25, K); flags.push([fg, fg.attributes.position.array.slice()]);
    for (let w = 0; w < 2; w++) M(geo.box(.14, .22, .02, .05), mat('#7b3fa0', { r: .3, cc: 1 }), x, h * .55 + w * .5, (x ? .1 : -.25) + r, K); }
  // porte (deux battants)
  const doorL = G(K, -.32, 0, .36), doorR = G(K, .32, 0, .36); M(geo.box(.32, .8, .05, .02), mat('#b97ad8', { r: .4, cc: .6 }), .16, .4, 0, doorL); M(geo.box(.32, .8, .05, .02), mat('#b97ad8', { r: .4, cc: .6 }), -.16, .4, 0, doorR);
  M(geo.box(.7, .84, .04, .02), mat('#3b1a4a'), 0, .42, .34, K);
  // la princesse
  const P = c.doll(c.scene, { pos: [0, 0, -.25], cloth: '#ff8fbf', hair: '#f3c35a' }); P.g.scale.setScalar(.75);
  const skirt = M(geo.lathe([[0, .5], [.3, .5], [.55, .02], [0, 0]]), mat('#ffc6dd', { r: .6, sh: 1, shc: '#ffffff' }), 0, 0, 0, P.g);
  const crown = G(P.headG, 0, .33, 0); M(geo.cyl(.16, .16, .08, 32, 1, true), gold(), 0, 0, 0, crown); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; M(geo.cone(.035, .12, 12), gold(), Math.cos(a) * .15, .09, Math.sin(a) * .15, crown); M(geo.sph(.02, 8), mat('#ff5d8f', { cc: 1 }), Math.cos(a) * .15, .16, Math.sin(a) * .15, crown); }
  const wand = G(P.armR, 0, -.38, 0); M(geo.cyl(.012, .012, .35), gold(), 0, -.12, 0, wand); M(new THREE.ExtrudeGeometry(c.starShape(.08), { depth: .02, bevelEnabled: false }), gold({ em: '#ffd76a', ei: .4 }), 0, -.32, 0, wand);
  const stand = M(geo.cyl(.45, .5, .12), mat('#ffffff', { r: .3, cc: 1 }), 0, .06, 0, P.g); P.g.visible = false;
  const sp = c.sparkles(30, '#ffe0f0', [4, 3, 2], 1.6);
  return {
    dur: 3.6,
    idle(t) { sp.tick(t); flags.forEach(([g, o]) => { const a = g.attributes.position.array; for (let i = 0; i < a.length; i += 3) a[i + 2] = Math.sin(t * 5 + o[i] * 12) * .03 * (o[i] + .15); g.attributes.position.needsUpdate = true; }); K.rotation.y = Math.sin(t * .4) * .12; },
    open(k, t) {
      this.idle(t); const d = back(seg(k, .1, .8)); doorL.rotation.y = -d * 1.7; doorR.rotation.y = d * 1.7;
      if (k > .5) { P.g.visible = true; const w = ease(seg(k, .5, 1.6)); P.g.position.set(0, .02, -.25 + w * 1.25); P.g.rotation.y = w * Math.PI * 4 + (k > 1.6 ? (k - 1.6) * 3 : 0);
        P.armR.rotation.z = .4 + 2.2 * out(seg(k, 1.3, 1.8)); P.armL.rotation.z = -.4 - .8 * out(seg(k, 1.3, 1.8)); P.g.position.y = .02 + Math.sin(seg(k, 1.6, 2.3) * Math.PI) * .25; }
      if (k > 1.7 && !this.b) { this.b = 1; c.burst3([0, 1.8, .8], ['#ff5d8f', '#ffc6dd', '#f3c35a', '#ffffff'], 110, { geo: new THREE.ExtrudeGeometry(c.heartShape(.06), { depth: .02, bevelEnabled: false }), speed: 3.6, up: .6 }); }
    },
    zoom: k => ease(seg(k, 2.5, 3.6)),
  };
}

// 6. Pirate : un coffre au trésor sur le sable ; le cadenas saute, le couvercle s'ouvre, l'or jaillit
function pirate(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .22); c.look.set(0, .8, 0); c.camPos.set(0, 2.5, 7); c.fitW = 3.6;
  const sand = M(geo.cyl(2.1, 2.3, .12, 64), mat('#e9cf98', { r: .95, bump: c.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#888'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { g.fillStyle = Math.random() < .5 ? '#fff' : '#000'; g.globalAlpha = .25; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, false), bs: 2 }), 0, -.06, 0);
  const woodTex = c.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7a4a24'; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(${40 + Math.random() * 40},${20 + Math.random() * 20},10,.5)`; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.bezierCurveTo(w / 3, y + Math.random() * 8 - 4, w * 2 / 3, y + Math.random() * 8 - 4, w, y); g.stroke(); } for (let y = 0; y < h; y += 64) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y, w, 3); } });
  const wood = mat('#ffffff', { map: woodTex, r: .7 }), band = gold({ r: .35 });
  const chest = G(c.scene, 0, .55, 0); chest.rotation.y = -.35;
  M(geo.box(1.7, .9, 1.05, .06), wood, 0, .45, 0, chest); for (const x of [-.6, .6]) M(geo.box(.1, .92, 1.08, .02), band, x, .45, 0, chest);
  const lid = G(chest, 0, .9, -.52); const lidGeo = new THREE.CylinderGeometry(.52, .52, 1.7, 40, 1, false, 0, Math.PI); const lm = M(lidGeo, wood, 0, 0, .52, lid); lm.rotation.z = Math.PI / 2;
  for (const x of [-.6, .6]) { const b = M(new THREE.CylinderGeometry(.54, .54, .1, 40, 1, false, 0, Math.PI), band, x, 0, .52, lid); b.rotation.z = Math.PI / 2; }
  const lock = G(chest, 0, .85, .55); M(geo.box(.24, .28, .08, .03), band, 0, 0, 0, lock); const shack = M(geo.tor(.08, .02, Math.PI), band, 0, .15, 0, lock);
  const glow = new THREE.PointLight(0xffc35a, 0, 4); glow.position.set(0, 1.2, 0); chest.add(glow);
  const pile = G(chest, 0, .85, 0); for (let i = 0; i < 40; i++) { const cn = M(geo.cyl(.07, .07, .02, 20), gold({ r: .22 }), (Math.random() - .5) * 1.4, Math.random() * .1, (Math.random() - .5) * .8, pile); cn.rotation.set(Math.random(), Math.random(), Math.random()); }
  for (let i = 0; i < 6; i++) M(geo.sph(.06, 12), mat(['#e0115f', '#1fb36b', '#2c7be5'][i % 3], { r: .05, cc: 1, tr: .3 }), (Math.random() - .5) * 1.2, .1, (Math.random() - .5) * .6, pile);
  pile.visible = false;
  for (let i = 0; i < 9; i++) { const cn = M(geo.cyl(.07, .07, .02, 20), gold({ r: .22 }), Math.cos(i) * 1.5, .04 + Math.random() * .03, Math.sin(i * 2) * .8 + .6); cn.rotation.x = .1; }
  // drapeau pirate
  const fl = G(c.scene, -1.55, 0, -.5); M(geo.cyl(.03, .03, 2.4), mat('#5a3a1e', { r: .7 }), 0, 1.2, 0, fl);
  const flagTex = c.canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#151515'; g.fillRect(0, 0, w, h); g.fillStyle = '#f5f0e6'; g.beginPath(); g.arc(w / 2, 62, 30, 0, 6.28); g.fill(); g.fillRect(w / 2 - 20, 80, 40, 22); g.fillStyle = '#151515'; g.beginPath(); g.arc(w / 2 - 11, 60, 8, 0, 6.28); g.arc(w / 2 + 11, 60, 8, 0, 6.28); g.fill();
    g.strokeStyle = '#f5f0e6'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(w / 2 - 55, 105); g.lineTo(w / 2 + 55, 145); g.moveTo(w / 2 + 55, 105); g.lineTo(w / 2 - 55, 145); g.stroke(); });
  const fgeo = new THREE.PlaneGeometry(.9, .56, 12, 4), flag = M(fgeo, mat('#ffffff', { map: flagTex, ds: true, r: .8 }), .46, 1.9, 0, fl); const fo = fgeo.attributes.position.array.slice();
  return {
    dur: 3.4,
    idle(t) { const a = fgeo.attributes.position.array; for (let i = 0; i < a.length; i += 3) a[i + 2] = Math.sin(t * 4 + fo[i] * 6) * .06 * (fo[i] + .45); fgeo.attributes.position.needsUpdate = true; chest.rotation.y = -.35 + Math.sin(t * .5) * .08; },
    open(k, t) {
      this.idle(t); lock.position.y = .85 + Math.sin(seg(k, 0, .5) * Math.PI) * .25; lock.rotation.z = seg(k, 0, .5) * .8; if (k > .5) lock.position.y -= out(seg(k, .5, .9)) * 1.2;
      lid.rotation.x = -back(seg(k, .55, 1.4)) * 1.9; pile.visible = k > .6; glow.intensity = 6 * out(seg(k, .6, 1.4));
      if (k > 1 && !this.b) { this.b = 1; c.burst3([0, 1.5, 0], ['#ffd76a', '#f1b93a', '#fff1b0'], 110, { geo: new THREE.CylinderGeometry(.06, .06, .015, 16), speed: 5, up: .9, cone: .5, metal: 1, floor: .05, shadow: true }); }
    },
    zoom: k => ease(seg(k, 2.3, 3.4)),
  };
}

export default { 1: licorne, 2: bulles, 3: heros, 4: train, 5: princesse, 6: pirate };
