// Henné : six scènes.

// motif ajouré (étoiles et arabesques) utilisé pour les lanternes et le brûle-parfum
const ajour = (c, w = 256) => c.canvasTex(w, w, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, w); g.fillStyle = '#000';
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const cx = x * w / 4 + w / 8, cy = y * w / 4 + w / 8, r = w / 14; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? r * .5 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.fill();
    g.beginPath(); g.arc(cx + w / 8, cy + w / 8, r * .25, 0, 6.28); g.fill(); } }, false);

// 1. Émeraude & or : une lanterne marocaine ajourée ; sa porte s'ouvre, la lumière dessine des étoiles autour
function lanterne(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back, o } = c;
  c.floor(0, .3); c.look.set(0, 1.25, 0); c.camPos.set(0, 1.5, 6.8); c.fitW = 2.6; c.fitH = 3.2;
  c.key.intensity = 1.1;
  const am = ajour(c); am.wrapS = am.wrapT = THREE.RepeatWrapping; am.repeat.set(3, 2);
  const brass = gold({ r: .3 }), pierced = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#c8993f'), metalness: 1, roughness: .32, alphaMap: am, alphaTest: .5, side: THREE.DoubleSide });
  const L = G(); M(geo.lathe([[0, 0], [.42, 0], [.44, .06], [.4, .12], [0, .12]], 8), brass, 0, 0, 0, L);
  const body = M(geo.cyl(.4, .4, 1.3, 8, true), pierced, 0, .78, 0, L); body.castShadow = true;
  M(geo.lathe([[.42, 0], [.3, .25], [.12, .5], [.06, .7], [0, .72]], 8), brass, 0, 1.43, 0, L);
  M(geo.tor(.08, .018, Math.PI * 2, 24), brass, 0, 2.2, 0, L);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; M(geo.cyl(.018, .018, 1.3, 6), brass, Math.cos(a) * .41, .78, Math.sin(a) * .41, L); }
  const door = G(L, Math.cos(Math.PI / 8) * .41, .13, Math.sin(Math.PI / 8) * .41);
  const dm = M(new THREE.PlaneGeometry(.31, 1.2), new THREE.MeshPhysicalMaterial({ color: '#d9ac52', metalness: 1, roughness: .3, alphaMap: am, alphaTest: .5, side: THREE.DoubleSide }), -.155, .6, 0, door); door.rotation.y = -Math.PI / 2 - Math.PI / 8 + Math.PI;
  const cand = M(geo.cyl(.08, .08, .3, 24), mat('#f7f1e4', { r: .5 }), 0, .27, 0, L); const fl = c.flame(L, 0, .43, 0, 1, false);
  const pl = new THREE.PointLight(0xffb45a, 4, 6, 1.4); pl.position.set(0, .7, 0); L.add(pl);
  return {
    dur: 3,
    idle(t) { fl.tick(t); pl.intensity = 3.5 + Math.sin(t * 13) * .3; L.rotation.y = t * .25; },
    open(k, t) {
      fl.tick(t); L.rotation.y = t * .25; door.rotation.y = -Math.PI / 2 - Math.PI / 8 + Math.PI - back(seg(k, .1, .9)) * 1.9; pl.intensity = 3.5 + out(seg(k, .2, 1.2)) * 6;
      if (k > .8 && !this.b) { this.b = 1; c.burst3([0, 1, 0], ['#ffd27a', '#f3c35a', '#ffffff', o.acc], 90, { geo: new THREE.ExtrudeGeometry(c.star(.05, 8, .5), { depth: .01, bevelEnabled: false }), speed: 2.2, up: .4, cone: 1.4, g: .3, drag: .97, metal: .9 }); }
    },
    zoom: k => ease(seg(k, 1.9, 3)) * .6,
  };
}

// 2. Velours rouge : le cône de henné dessine une mandala sur un plateau, trait après trait
function mandala(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out } = c;
  c.floor(0, .25); c.look.set(0, .35, 0); c.camPos.set(0, 4.2, 4.2); c.fitW = 2.8; c.fitH = 2.6;
  M(geo.lathe([[0, 0], [1.15, 0], [1.2, .06], [1.18, .1], [1.08, .08], [0, .08]], 80), gold({ r: .28 }), 0, 0, 0);
  M(geo.cyl(1.06, 1.06, .01, 80), mat('#f3e3cf', { r: .8 }), 0, .085, 0);
  const henna = mat('#6b2a14', { r: .7 });
  // tracés : pétales en rosace, couronnes de points
  const paths = [];
  for (let ring = 0; ring < 3; ring++) { const n = [8, 12, 16][ring], r0 = [.12, .38, .66][ring], r1 = [.34, .62, .94][ring];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, w = Math.PI / n * .9, pts = []; for (let j = 0; j <= 16; j++) { const u = j / 16, aa = a - w + u * 2 * w, rr = r0 + Math.sin(u * Math.PI) * (r1 - r0); pts.push([Math.cos(aa) * rr, .095, Math.sin(aa) * rr]); } paths.push(pts); } }
  const tubes = paths.map(p => { const m = M(geo.tube(p, .011, 40), henna, 0, 0, 0); m.castShadow = false; m.geometry.setDrawRange(0, 0); return m; });
  const dots = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; const d = M(geo.sph(.022, 10), henna, Math.cos(a) * 1.0, .095, Math.sin(a) * 1.0); d.scale.setScalar(.001); dots.push(d); }
  const cone = G(c.scene, 0, .1, 0); const cm = M(geo.cone(.08, .5, 24), mat('#e9d9c0', { r: .9, bump: c.grain('paper'), bs: 1 }), 0, .3, 0, cone); cm.rotation.x = Math.PI;
  M(geo.cone(.02, .06, 12), henna, 0, .03, 0, cone).rotation.x = Math.PI; cone.rotation.z = .35;
  const total = tubes.length;
  const draw = f => { const n = f * total; tubes.forEach((m, i) => { const c0 = m.geometry.index ? m.geometry.index.count : 0; const part = Math.max(0, Math.min(1, n - i)); m.geometry.setDrawRange(0, Math.floor(c0 * part)); });
    const cur = Math.min(total - 1, Math.floor(n)), part = n - Math.floor(n), p = paths[cur], j = Math.min(16, Math.floor(part * 16)); if (p) cone.position.set(p[j][0] + .05, .12, p[j][2]); };
  return {
    dur: 3.4,
    idle(t) { const f = (t * .12) % 1; draw(f * .35); dots.forEach(d => d.scale.setScalar(.001)); },
    open(k, t) { const f = ease(seg(k, 0, 2.6)); draw(.35 + f * .65); dots.forEach((d, i) => d.scale.setScalar(Math.max(.001, out(seg(k, 2.4 + i * .02, 2.7 + i * .02))))); if (k > 2.6) cone.position.y += (1.2 - cone.position.y) * .05; },
    zoom: k => ease(seg(k, 2.4, 3.4)) * .5,
  };
}

// 3. Mille et une nuits : un tapis volant ondule, puis s'élève en tournant dans un ciel étoilé
function tapis(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, o } = c;
  c.look.set(0, 1.25, 0); c.camPos.set(0, 3.6, 5.6); c.fitW = 2.9; c.fitH = 2.6;
  const tex = c.canvasTex(512, 320, (g, w, h) => { g.fillStyle = '#7a1424'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e0b45a'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = '#1d3d6e'; g.fillRect(34, 34, w - 68, h - 68);
    g.fillStyle = '#e0b45a'; g.save(); g.translate(w / 2, h / 2); for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.beginPath(); g.ellipse(0, -48, 18, 46, 0, 0, 6.28); g.fill(); } g.fillStyle = '#7a1424'; g.beginPath(); g.arc(0, 0, 26, 0, 6.28); g.fill(); g.restore();
    g.fillStyle = '#e0b45a'; for (let x = 50; x < w - 40; x += 24) { g.beginPath(); g.moveTo(x, 34); g.lineTo(x + 12, 52); g.lineTo(x + 24, 34); g.fill(); g.beginPath(); g.moveTo(x, h - 34); g.lineTo(x + 12, h - 52); g.lineTo(x + 24, h - 34); g.fill(); } });
  const pg = new THREE.PlaneGeometry(2.4, 1.5, 40, 24), carpet = M(pg, mat('#ffffff', { map: tex, r: .85, sh: .8, shc: '#ffd9a0', ds: true, bump: c.grain('cloth'), bs: .8 }), 0, 1, 0); carpet.rotation.x = -Math.PI / 2;
  const P0 = pg.attributes.position.array.slice();
  const tassels = []; for (const sx of [-1.2, 1.2]) for (let i = 0; i < 7; i++) { const z = -.65 + i * .216; const t = M(geo.cone(.025, .14, 8), gold(), sx + Math.sign(sx) * .07, 1, z); t.rotation.z = Math.sign(sx) * Math.PI / 2; tassels.push([t, sx, z]); }
  const sky = c.sparkles(70, '#fff1c8', [5, 3, 2], 2.2, .07); sky.pts.position.z = -1.5;
  const wave = (t, amp) => { const a = pg.attributes.position.array; for (let i = 0; i < a.length; i += 3) { const x = P0[i], y = P0[i + 1]; a[i + 2] = Math.sin(x * 2.4 - t * 3) * amp + Math.sin(y * 3 + t * 2) * amp * .4; } pg.attributes.position.needsUpdate = true; pg.computeVertexNormals();
    tassels.forEach(([m, sx, z]) => { m.position.y = carpet.position.y + Math.sin(sx * 2.4 - t * 3) * amp; }); };
  const moon = M(geo.sph(.35, 32), mat('#f6e4b0', { em: '#f0d080', ei: .6, r: .9 }), 1.3, 2.6, -1.5); moon.castShadow = false;
  return {
    dur: 3.2,
    idle(t) { sky.tick(t); carpet.position.y = 1 + Math.sin(t * 1.2) * .08; wave(t, .07); carpet.rotation.z = Math.sin(t * .6) * .05; },
    open(k, t) {
      sky.tick(t); const u = ease(seg(k, .2, 2.8)); carpet.position.y = 1 + u * .45 + Math.sin(t * 1.2) * .05; carpet.rotation.z = u * Math.PI * .6; carpet.rotation.x = -Math.PI / 2 + Math.sin(u * Math.PI) * .25; wave(t * 1.6, .07 + u * .06);
      tassels.forEach(([m]) => m.visible = k < .25);
      if (k > .5 && !this.b) { this.b = 1; c.burst3([0, 1.3, 0], ['#e0b45a', '#fff1c8', '#ffffff'], 80, { geo: new THREE.ExtrudeGeometry(c.star(.04), { depth: .01, bevelEnabled: false }), speed: 2, up: .3, cone: 1.5, g: .2, drag: .97, metal: .8 }); }
    },
    zoom: k => 0,
  };
}

// 4. Nuit violette : un cercle de photophores en verre teinté s'allume en spirale autour d'une coupe de pétales
function photophores(c) {
  const { THREE, M, G, geo, mat, gold, glass, seg, ease, out } = c;
  c.floor(0, .3); c.look.set(0, .45, 0); c.camPos.set(0, 3, 5.6); c.fitW = 3.2; c.fitH = 2.6;
  c.key.intensity = .6; c.fill.intensity = .2;
  M(geo.lathe([[0, 0], [.35, 0], [.45, .2], [.42, .22], [0, .12]], 48), gold({ r: .3 }), 0, 0, 0);
  for (let i = 0; i < 24; i++) { const a = Math.random() * 6.28, r = Math.random() * .3; const p = M(geo.sph(.06, 10), mat(['#8a2be2', '#c77dff', '#ff9ec8'][i % 3], { r: .6, sh: 1, ds: true }), Math.cos(a) * r, .2 + Math.random() * .05, Math.sin(a) * r); p.scale.set(1, .25, 1); }
  const cols = ['#7b2cbf', '#c77dff', '#e0aaff', '#9d4edd', '#ff9ec8'];
  const N = 11, F = []; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, x = Math.cos(a) * 1.15, z = Math.sin(a) * 1.15;
    M(geo.lathe([[0, 0], [.13, 0], [.15, .05], [.15, .32], [.14, .32], [.14, .06], [0, .06]], 24), mat(cols[i % 5], { r: .1, tr: 1, op: .55, ds: true }), x, 0, z);
    const f = c.flame(c.scene, x, .1, z, .6, i % 3 === 0); f.userData.on = 0; f.visible = false; F.push(f); }
  const sp = c.sparkles(40, '#e0aaff', [3.4, 1.6, 3], .9, .08);
  return {
    dur: 3,
    idle(t) { sp.tick(t); F.forEach((f, i) => { f.userData.on = i < 2 ? 1 : 0; f.visible = i < 2; f.tick(t); }); },
    open(k, t) { sp.tick(t); F.forEach((f, i) => { const on = out(seg(k, i * .17, i * .17 + .25)); f.userData.on = Math.max(i < 2 ? 1 : 0, on); f.visible = f.userData.on > 0; f.tick(t); }); c.key.intensity = .6 + seg(k, 0, 2) * .6;
      if (k > 2 && !this.b) { this.b = 1; c.burst3([0, .3, 0], ['#8a2be2', '#c77dff', '#ff9ec8'], 70, { geo: new THREE.SphereGeometry(.05, 8, 6, 0, Math.PI * .8, 0, Math.PI * .5), speed: 2.4, up: 1, cone: .5, g: 1.2, drag: .98 }); } },
    zoom: k => ease(seg(k, 2, 3)) * .5,
  };
}

// 5. Terre cuite : un tajine ; son couvercle conique se soulève, la vapeur et les pétales de rose s'échappent
function tajine(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back } = c;
  c.floor(0, .25); c.look.set(0, .75, 0); c.camPos.set(0, 2, 6.4); c.fitW = 2.8; c.fitH = 2.8;
  const terra = mat('#b5532f', { r: .75, bump: c.grain('sand'), bs: .6 }), glaze = mat('#e8b04b', { r: .3, cc: .8 });
  const tex = c.canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#b5532f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f2d7a6'; g.lineWidth = 4; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, h * .7); g.lineTo(x + 16, h * .3); g.lineTo(x + 32, h * .7); g.stroke(); g.beginPath(); g.arc(x + 16, h * .85, 4, 0, 6.28); g.fillStyle = '#f2d7a6'; g.fill(); } }); tex.wrapS = THREE.RepeatWrapping; tex.repeat.x = 3;
  M(geo.lathe([[0, 0], [.8, 0], [1.05, .14], [1.08, .2], [1.0, .22], [0, .18]], 72), mat('#ffffff', { map: tex, r: .7 }), 0, 0, 0);
  const lid = G(c.scene, 0, .2, 0); M(geo.lathe([[.92, 0], [.86, .1], [.55, .45], [.3, .85], [.18, 1.15], [.13, 1.3], [.16, 1.35], [.1, 1.45], [0, 1.47]], 72), terra, 0, 0, 0, lid);
  M(geo.tor(.85, .03, Math.PI * 2, 72), glaze, 0, .08, 0, lid).rotation.x = Math.PI / 2; M(geo.sph(.08, 20), glaze, 0, 1.5, 0, lid);
  const food = M(geo.sph(.7, 40, 20), mat('#d98a2b', { r: .7 }), 0, .1, 0); food.scale.y = .25;
  const steam = []; let st = 0;
  return {
    dur: 3,
    idle(t, dt) { lid.position.y = .2 + Math.max(0, Math.sin(t * 2.4)) * .015; steam.forEach(s => { s.userData.a += dt; s.position.y += dt * .4; s.scale.setScalar(1 + s.userData.a); s.material.opacity = Math.max(0, .3 - s.userData.a * .12); }); },
    open(k, t, dt) {
      const l = back(seg(k, 0, .9)); lid.position.y = .2 + l * .85; lid.rotation.z = l * .3; lid.position.x = l * .65;
      st += dt; if (k > .3 && st > .08) { st = 0; const s = M(geo.sph(.12, 12), mat('#ffffff', { r: 1, op: .3, dw: false }), (Math.random() - .5) * .8, .3, (Math.random() - .5) * .5); s.castShadow = false; s.userData.a = 0; steam.push(s); }
      steam.forEach(s => { s.userData.a += dt; s.position.y += dt * .7; s.position.x += Math.sin(s.userData.a * 3) * .003; s.scale.setScalar(1 + s.userData.a * 1.6); s.material.opacity = Math.max(0, .3 - s.userData.a * .14); });
      if (k > .6 && !this.b) { this.b = 1; c.burst3([0, .5, 0], ['#c2185b', '#e57399', '#ffd6e0'], 70, { geo: new THREE.SphereGeometry(.06, 8, 6, 0, Math.PI * .8, 0, Math.PI * .5), speed: 2.6, up: 1.1, cone: .4, g: .9, drag: .98, spin: 4 }); }
    },
    zoom: k => ease(seg(k, 1.9, 3)) * .6,
  };
}

// 6. Doré : un brûle-parfum doré ; la coupole s'ouvre, des volutes parfumées montent en spirale, pluie de paillettes
function brulee(c) {
  const { THREE, M, G, geo, mat, gold, seg, ease, out, back, o } = c;
  c.floor(0, .28); c.look.set(0, 1.05, 0); c.camPos.set(0, 1.6, 6.6); c.fitW = 2.4; c.fitH = 3;
  const gm = gold({ r: .22 }), am = ajour(c, 128);
  M(geo.lathe([[0, 0], [.42, 0], [.44, .05], [.3, .12], [.14, .3], [.12, .5], [.22, .6], [.34, .72], [.36, .8], [0, .8]], 8), gm, 0, 0, 0);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; M(geo.sph(.05, 12), gm, Math.cos(a) * .36, .02, Math.sin(a) * .36); }
  const coals = M(geo.sph(.25, 24), mat('#3a1408', { r: .8, em: '#ff5a1a', ei: .5 }), 0, .78, 0); coals.scale.y = .3;
  const dome = G(c.scene, 0, .8, 0); const dm = new THREE.MeshPhysicalMaterial({ color: '#d4a64a', metalness: 1, roughness: .28, alphaMap: am, alphaTest: .5, side: THREE.DoubleSide });
  M(geo.lathe([[.36, 0], [.36, .2], [.3, .45], [.18, .65], [.08, .8], [.04, .95], [0, 1.0]], 8), dm, 0, 0, 0, dome); M(geo.sph(.06, 16), gm, 0, 1.02, 0, dome);
  const pl = new THREE.PointLight(0xff8a3a, 2, 3); pl.position.set(0, 1, 0); c.scene.add(pl);
  const wisps = []; for (let j = 0; j < 3; j++) { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([Math.sin(u * 9 + j * 2) * .18 * u, u * 2.2, Math.cos(u * 9 + j * 2) * .18 * u]); }
    const w = M(geo.tube(pts, .025, 120), mat('#f4efe6', { r: 1, op: .35, dw: false }), 0, 1.0, 0); w.castShadow = false; w.geometry.setDrawRange(0, 0); wisps.push(w); }
  const sp = c.sparkles(24, '#ffe7a8', [2.4, 2.4, 1.4], 1.6, .08);
  return {
    dur: 3,
    idle(t) { sp.tick(t); pl.intensity = 1.6 + Math.sin(t * 9) * .3; coals.material.emissiveIntensity = .4 + Math.sin(t * 5) * .15; dome.rotation.y = t * .3; },
    open(k, t) {
      sp.tick(t); dome.rotation.y = t * .3; const l = back(seg(k, 0, .8)); dome.position.y = .8 + l * .9; dome.position.x = l * .6; dome.rotation.z = -l * .5;
      wisps.forEach((w, i) => { const n = w.geometry.index.count; w.geometry.setDrawRange(0, Math.floor(n * ease(seg(k, .3 + i * .15, 2.2 + i * .1)))); w.rotation.y = t * .6 + i * 2; });
      pl.intensity = 1.6 + out(seg(k, 0, .8)) * 2;
      if (k > 1.5 && !this.b) { this.b = 1; c.burst3([0, 3.2, 0], ['#d8b15c', '#f3d27a', '#ffffff'], 140, { speed: .9, up: -.5, cone: 1, g: .8, drag: .97, flutter: .5, metal: .9 }); }
    },
    zoom: k => ease(seg(k, 1.9, 3)) * .5,
  };
}

export default { 1: lanterne, 2: mandala, 3: tapis, 4: photophores, 5: tajine, 6: brulee };
