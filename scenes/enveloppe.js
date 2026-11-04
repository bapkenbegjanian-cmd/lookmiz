// Enveloppe en papier épais, doublure à motif, cachet de cire gravé aux initiales.
// Le cachet se brise en deux, le rabat s'ouvre, la lettre sort entièrement puis vient vers nous.
export default function enveloppe(c) {
  const { THREE, M, G, geo, mat, seg, ease, out, back, o } = c;
  c.wall(-.45, .22); c.look.set(0, .3, 0); c.camPos.set(0, .05, 8); c.fitW = 3.9; c.fitH = 5.3;
  const paper = o.paper || '#f3ede3', acc = o.acc || '#b8893b', seal = o.seal || acc, ink = o.ink || '#2a2118';
  const P = (k = 1) => mat(new THREE.Color(paper).multiplyScalar(k), { r: .9, bump: c.grain('paper'), bs: .5 });
  const gold = '#' + new THREE.Color(acc).lerp(new THREE.Color('#d9b468'), .5).getHexString();
  const linerTex = c.canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#' + new THREE.Color(acc).multiplyScalar(.5).getHexString(); g.fillRect(0, 0, w, h); g.strokeStyle = gold; g.fillStyle = gold; g.globalAlpha = .6; g.lineWidth = 1.4;
    for (let y = 0; y < h + 64; y += 64) for (let x = 0; x < w + 64; x += 64) { const ox = (y / 64) % 2 ? 32 : 0; g.beginPath(); g.ellipse(x + ox, y, 13, 21, 0, 0, 6.283); g.stroke(); g.beginPath(); g.arc(x + ox, y, 3, 0, 6.283); g.fill(); }
  }); linerTex.wrapS = linerTex.wrapT = THREE.RepeatWrapping; linerTex.repeat.set(2, 2);
  const liner = mat('#ffffff', { map: linerTex, r: .65, m: .1 }), linerIn = mat('#ffffff', { map: linerTex, r: .65, m: .1, bk: true });
  const E = G(), EW = 3.2, EH = 2.1, hw = EW / 2, hh = EH / 2;
  M(geo.plane(EW, EH), liner, 0, 0, 0, E); const bo = M(geo.plane(EW, EH), P(.92), 0, 0, -.003, E); bo.rotation.y = Math.PI;
  // la lettre : texte du modèle
  const lt = c.canvasTex(1024, 680, (g, w, h) => {
    g.fillStyle = o.sheet || '#fbf8f2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = acc; g.lineWidth = 3; g.strokeRect(36, 36, w - 72, h - 72); g.lineWidth = 1.2; g.strokeRect(52, 52, w - 104, h - 104);
    g.fillStyle = acc; g.textAlign = 'center'; g.font = '600 24px Inter, sans-serif'; g.fillText(String(o.pre || '').toUpperCase().split('').join(' '), w / 2, 190);
    const fit = (txt, font, s, y, col) => { g.fillStyle = col; g.font = `${s}px ${font}`; while (g.measureText(txt).width > w - 190 && s > 30) { s -= 3; g.font = `${s}px ${font}`; } g.fillText(txt, w / 2, y); };
    fit(o.title || '', '"Instrument Serif", serif', 86, 320, ink);
    g.strokeStyle = acc; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2 - 140, 380); g.lineTo(w / 2 - 18, 380); g.moveTo(w / 2 + 18, 380); g.lineTo(w / 2 + 140, 380); g.stroke(); g.beginPath(); g.arc(w / 2, 380, 6, 0, 6.283); g.fillStyle = acc; g.fill();
    if (o.noms) fit(o.noms, '"Great Vibes", cursive', 78, 480, acc);
  });
  const side = mat('#f6f2ea', { r: .9 }); const letter = M(new THREE.BoxGeometry(EW * .9, EH * .86, .012), [side, side, side, side, mat('#ffffff', { map: lt, r: .85, bump: c.grain('paper'), bs: .25 }), side], 0, -.04, .014, E);
  // poche avant : trois pans, légers décalages pour que les plis accrochent la lumière
  const L = M(new THREE.ShapeGeometry(c.shape([[-hw, hh], [-hw, -hh], [.03, -.02]])), P(.97), 0, 0, .03, E);
  const R = M(new THREE.ShapeGeometry(c.shape([[hw, hh], [-.03, -.02], [hw, -hh]])), P(.94), 0, 0, .032, E);
  const B = M(new THREE.ShapeGeometry(c.shape([[-hw, -hh], [hw, -hh], [0, .14]])), P(1.02), 0, 0, .04, E);
  // rabat : pivot sur le bord du haut, doublure à l'intérieur
  const fs = new THREE.Shape(); fs.moveTo(-hw, 0); fs.lineTo(hw, 0); fs.lineTo(.24, -1.08); fs.quadraticCurveTo(0, -1.25, -.24, -1.08); fs.closePath();
  const flap = G(E, 0, hh, .026), fg = new THREE.ShapeGeometry(fs, 24);
  M(fg, P(1.04), 0, 0, .025, flap); M(fg, linerIn, 0, 0, .024, flap);
  // cachet de cire, en deux moitiés qui se séparent à l'ouverture
  const sealM = mat(seal, { r: .36, cc: .7, ccr: .25, sh: .3 });
  const rr = a => .37 * (1 + .05 * Math.sin(a * 5 + 1) + .035 * Math.sin(a * 9) + .02 * Math.sin(a * 17));
  const half = (a0, a1) => { const s = new THREE.Shape(); s.moveTo(0, .02 * Math.sin(a0 * 3)); for (let i = 0; i <= 32; i++) { const a = a0 + (a1 - a0) * i / 32; s.lineTo(Math.cos(a) * rr(a), Math.sin(a) * rr(a)); } s.lineTo(0, -.03); s.closePath(); return s; };
  const SEAL = G(E, 0, hh - 1.13, .1);
  const halves = [[Math.PI / 2, Math.PI * 1.5], [-Math.PI / 2, Math.PI / 2]].map(([a0, a1]) => { const g = G(SEAL); const m = M(new THREE.ExtrudeGeometry(half(a0, a1), { depth: .035, bevelEnabled: true, bevelThickness: .035, bevelSize: .04, bevelSegments: 5, curveSegments: 32 }), sealM, 0, 0, 0, g); return g; });
  const bump = c.canvasTex(512, 512, (g) => { const R = g.createRadialGradient(256, 256, 120, 256, 256, 256); R.addColorStop(0, '#9a9a9a'); R.addColorStop(.86, '#8a8a8a'); R.addColorStop(1, '#5a5a5a'); g.fillStyle = R; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = '#2a2a2a'; g.lineWidth = 10; g.beginPath(); g.arc(256, 256, 212, 0, 6.283); g.stroke(); g.lineWidth = 4; g.beginPath(); g.arc(256, 256, 186, 0, 6.283); g.stroke();
    g.fillStyle = '#2a2a2a'; for (let i = 0; i < 48; i++) { const a = i / 48 * 6.283; g.beginPath(); g.arc(256 + Math.cos(a) * 199, 256 + Math.sin(a) * 199, 4.2, 0, 6.283); g.fill(); }
    const ini = o.ini || 'L'; g.fillStyle = '#ededed'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${ini.length > 1 ? 180 : 250}px "Cinzel", serif`; g.shadowColor = '#000'; g.shadowBlur = 18; g.fillText(ini, 256, 268); }, false);
  const medalMat = mat(seal, { r: .3, cc: .8, ccr: .2, bump, bs: 4 });
  halves.forEach((g, i) => { const m = M(new THREE.CircleGeometry(.27, 64, i ? -Math.PI / 2 : Math.PI / 2, Math.PI), medalMat, 0, 0, .072, g); });
  const sp = c.sparkles(14, '#fff4d0', [1.2, .8, .3], hh - 1.1, .1); sp.pts.position.z = .3;
  E.rotation.set(-.12, .12, -.03);
  return {
    dur: 3.7,
    idle(t) { sp.tick(t); E.rotation.x = -.12 + Math.sin(t * .9) * .05; E.rotation.y = .12 + Math.sin(t * .6) * .1; E.position.y = Math.sin(t * 1.2) * .05; SEAL.scale.setScalar(1 + Math.sin(t * 2.4) * .015); },
    open(k, t) {
      sp.tick(t); sp.pts.visible = k < .4;
      // 1. le cachet se brise : les deux moitiés s'écartent et tombent
      const s1 = seg(k, 0, .35), s2 = seg(k, .3, 1.1);
      SEAL.position.z = .1 + Math.sin(s1 * Math.PI) * .25;
      halves.forEach((g, i) => { const d = i ? 1 : -1; g.position.x = d * (s1 * .06 + s2 * s2 * .9); g.position.y = -s2 * s2 * 2.4; g.rotation.z = d * s2 * 1.2; g.rotation.y = d * s2 * .8; g.scale.setScalar(Math.max(.001, 1 - s2 * .6)); g.visible = s2 < 1; });
      // 2. le rabat s'ouvre
      flap.rotation.x = -Math.PI * ease(seg(k, .4, 1.55));
      // 3. l'enveloppe se met face à nous et descend un peu
      const f3 = ease(seg(k, .2, 1.6)); E.rotation.x += (0 - E.rotation.x) * .07; E.rotation.y += (0 - E.rotation.y) * .07; E.rotation.z += (0 - E.rotation.z) * .07; E.position.y += (-.85 * f3 - E.position.y) * .08;
      // 4. la lettre sort entièrement, puis vient vers nous
      const f4 = ease(seg(k, 1.45, 2.75)), f5 = ease(seg(k, 2.6, 3.5));
      letter.position.y = -.04 + f4 * 2.12; letter.position.z = .014 + f5 * .9; letter.rotation.x = -f5 * .08;
    },
    zoom: k => ease(seg(k, 2.6, 3.7)) * .6,
  };
}
