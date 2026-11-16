/* Lookmiz : activités interactives du jour (mini-jeux, outils animés). Les données viennent du contenu protégé. */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = n => Math.round(n).toLocaleString('fr-FR');

  /* confettis */
  function confetti(n) {
    if (reduce()) return;
    const c = document.createElement('canvas'); c.className = 'confetti'; c.width = innerWidth; c.height = innerHeight; document.body.appendChild(c);
    const g = c.getContext('2d'), cols = ['#0f8f78', '#e7b04a', '#f07a68', '#4fbfa5', '#ffffff'];
    const ps = Array.from({ length: n || 90 }, () => ({ x: innerWidth / 2, y: innerHeight * .6, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: 4 + Math.random() * 5, c: cols[rnd(cols.length)], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
    let t = 0; (function f() {
      g.clearRect(0, 0, c.width, c.height); t++;
      ps.forEach(p => { p.vy += .38; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); g.restore(); });
      if (t < 110) requestAnimationFrame(f); else c.remove();
    })();
  }

  const T = {};   // type -> function(el, x)
  /* x = { kit, p (paramètres), slug, n, d (données sauvegardées), put(obj), finish(), L, prog } */

  const doneBtn = (x, label) => '<button class="btn pri act-ok" type="button">' + (label || 'Terminer l\'activité') + '</button>';
  const chipsHTML = (items, sel, cls) => items.map((t, i) => '<button type="button" class="chip' + (sel.includes(t) ? ' on' : '') + (cls ? ' ' + cls : '') + '" data-i="' + i + '" aria-pressed="' + sel.includes(t) + '">' + esc(t) + '</button>').join('');
  function list(x, dflt) { const p = x.p || {}; return p.items || x.kit[p.src || dflt] || []; }

  /* ---------- choisir (raisons, identité, outils, récompenses) ---------- */
  function choose(el, x, o) {
    const p = x.p, src = p.src || o.src, items = list(x, src), min = p.min || o.min || 1, max = p.max || o.max || 5;
    let sel = (x.d.sel || []).slice(), custom = (x.d.custom || []).slice();
    const all = () => items.concat(custom);
    const draw = () => {
      el.innerHTML = '<p class="a-lead">' + esc(p.i || o.lead) + '</p><div class="chips">' + chipsHTML(all(), sel) + '</div>' +
        '<div class="addrow"><input class="inp" maxlength="60" placeholder="Ajouter le mien…" aria-label="Ajouter le mien"><button class="btn ghost sm" type="button" data-add>Ajouter</button></div>' +
        '<div class="a-foot"><span class="cnt"><b>' + sel.length + '</b> / ' + max + '</span>' + doneBtn(x, o.btn || 'Valider') + '</div>';
      $$('.chip', el).forEach(b => b.onclick = () => {
        const t = all()[+b.dataset.i], k = sel.indexOf(t);
        if (k >= 0) sel.splice(k, 1); else if (sel.length < max) sel.push(t); else { b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; }
        x.put({ sel, custom }); draw();
      });
      $('[data-add]', el).onclick = () => { const v = $('.inp', el).value.trim(); if (!v) return; custom.push(v); if (sel.length < max) sel.push(v); x.put({ sel, custom }); draw(); };
      const ok = $('.act-ok', el); ok.disabled = sel.length < min; ok.onclick = () => { x.put({ sel, custom, ok: 1 }); summary(); x.finish(); };
    };
    const summary = () => {
      el.innerHTML = '<div class="sumcard rise"><span class="kick">' + esc(o.sum) + '</span><ul class="sumlist">' + sel.map((s, i) => '<li style="animation-delay:' + i * 90 + 'ms">' + esc(o.pre ? o.pre + ' ' + s.charAt(0).toLowerCase() + s.slice(1) : s) + '</li>').join('') + '</ul><button class="btn ghost sm" type="button" data-edit>Modifier</button></div>';
      $('[data-edit]', el).onclick = draw;
    };
    x.d.ok ? summary() : draw();
  }
  T.choose = (el, x) => choose(el, x, { src: 'raisons', min: 1, max: 5, lead: 'Touche tes vraies raisons (jusqu\'à 5). Tu peux ajouter les tiennes.', sum: 'Ton pourquoi', btn: 'C\'est mon pourquoi' });
  T.identity = (el, x) => choose(el, x, { src: 'identite', min: 2, max: 4, lead: 'Je deviens quelqu\'un qui… Touche ce qui te ressemble.', sum: 'Qui tu deviens', pre: 'Je deviens quelqu\'un', btn: 'Voilà qui je deviens' });
  T.toolbox = (el, x) => choose(el, x, { src: 'actions', min: 3, max: 5, lead: 'Choisis les actions que tu feras à la place. Touches-en 3 à 5.', sum: 'Ma boîte à outils', btn: 'Ma boîte est prête' });
  T.rewards = (el, x) => choose(el, x, { src: 'rewards', min: 1, max: 4, lead: 'Choisis les récompenses que tu t\'offres, sans produit.', sum: 'Mes récompenses', btn: 'Je me les offre' });

  /* ---------- calculateur ---------- */
  function counter(node, to, ms) {
    const from = +node.dataset.v || 0; node.dataset.v = to; if (reduce()) { node.textContent = fmt(to); return; }
    const t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / (ms || 500)), e = 1 - Math.pow(1 - k, 3); node.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  T.calc = T.gain = (el, x) => {
    const c = x.kit.calc, prev = x.L.S.act && x.L.S.act[x.slug] && x.L.S.act[x.slug][2], gain = x.type === 'gain';
    let v = x.d.v != null ? x.d.v : (gain && prev && prev.v != null ? prev.v : c.def);
    const q = gain ? 'Ton gain sur un an, à partir de ton chiffre du jour 2. Ajuste si besoin.' : c.q;
    el.innerHTML = '<p class="a-lead">' + esc(q) + '</p><div class="calc"><div class="big"><b data-n>0</b><span>' + esc(c.unit) + '</span></div><input type="range" class="rng" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + v + '" aria-label="' + esc(c.q) + '">' +
      '<div class="calcout"><div><b data-y>0</b><span>' + esc(c.out) + '</span></div>' + (c.div ? '<div><b data-d>0</b><span>' + esc(c.divLabel) + '</span></div>' : '') + '<div><b data-e>0</b><span>' + esc(c.eq[1]) + '</span></div></div></div>' +
      (gain ? '<label class="a-lbl">Qu\'est-ce que tu veux en faire ?<input class="inp" id="plan" maxlength="90" placeholder="Un voyage, un projet, de l\'épargne…" value="' + esc(x.d.plan || '') + '"></label>' : '') +
      '<div class="a-foot"><span></span>' + doneBtn(x, gain ? 'C\'est mon objectif' : 'C\'est mon chiffre') + '</div>';
    const upd = () => { v = +$('.rng', el).value; const y = v * c.mult; counter($('[data-n]', el), v, 200); counter($('[data-y]', el), y); if (c.div) counter($('[data-d]', el), +(y / c.div).toFixed(1)); counter($('[data-e]', el), Math.floor(y / c.eq[0])); };
    $('.rng', el).oninput = upd; upd();
    $('.act-ok', el).onclick = () => { x.put({ v, plan: ($('#plan', el) || {}).value }); x.finish(); };
  };

  /* ---------- balance ---------- */
  T.balance = (el, x) => {
    const pros = x.kit.pros, cons = x.kit.cons; let a = (x.d.pros || []).slice(), b = (x.d.cons || []).slice();
    el.innerHTML = '<p class="a-lead">Pose ce que ça t\'apporte d\'un côté, ce que ça te coûte de l\'autre. Touche les étiquettes.</p><svg class="scale" viewBox="0 0 300 130" aria-hidden="true"><rect x="146" y="30" width="8" height="84" rx="3" class="b"/><rect x="104" y="112" width="92" height="10" rx="5" class="b"/><g class="beam" style="transform-origin:150px 30px"><rect x="30" y="26" width="240" height="8" rx="4" class="m"/><path d="M42 34l-22 46h44zM258 34l-22 46h44z" class="c ln"/><ellipse cx="42" cy="80" rx="32" ry="5" class="b"/><ellipse cx="258" cy="80" rx="32" ry="5" class="b"/><text x="42" y="70" text-anchor="middle" class="tx i" data-a>0</text><text x="258" y="70" text-anchor="middle" class="tx i" data-b>0</text></g></svg><p class="scalemsg" aria-live="polite"></p>' +
      '<div class="cols"><div><h4>Ce que ça m\'apporte</h4><div class="chips" data-c="a">' + chipsHTML(pros, a, 'pro') + '</div></div><div><h4>Ce que ça me coûte</h4><div class="chips" data-c="b">' + chipsHTML(cons, b, 'con') + '</div></div></div><div class="a-foot"><span></span>' + doneBtn(x, 'Voir mon équilibre') + '</div>';
    const upd = () => {
      const k = Math.max(-18, Math.min(18, (b.length - a.length) * 5)); $('.beam', el).style.transform = 'rotate(' + k + 'deg)'; $('[data-a]', el).textContent = a.length; $('[data-b]', el).textContent = b.length;
      $('.scalemsg', el).textContent = !a.length && !b.length ? '' : b.length > a.length ? 'Le côté « ce que ça coûte » pèse plus lourd.' : b.length < a.length ? 'Ce que ça t\'apporte pèse plus, c\'est ce qu\'on va remplacer autrement.' : 'Les deux côtés se valent : tu es ambivalent, c\'est normal.';
      $('.act-ok', el).disabled = a.length + b.length < 3;
    };
    $$('.chip', el).forEach(btn => btn.onclick = () => { const side = btn.parentNode.dataset.c, arr = side === 'a' ? a : b, t = (side === 'a' ? pros : cons)[+btn.dataset.i], k = arr.indexOf(t); k >= 0 ? arr.splice(k, 1) : arr.push(t); btn.classList.toggle('on'); btn.setAttribute('aria-pressed', k < 0); x.put({ pros: a, cons: b }); upd(); });
    $('.act-ok', el).onclick = () => { x.put({ pros: a, cons: b }); x.finish(); }; upd();
  };

  /* ---------- déclencheurs (intensité) ---------- */
  T.heat = (el, x) => {
    const items = x.kit.triggers; let lv = Object.assign({}, x.d.lv || {});
    const draw = () => {
      el.innerHTML = '<p class="a-lead">Touche chaque déclencheur pour régler son intensité : 1 point = parfois, 3 points = très fort.</p><div class="chips">' + items.map((t, i) => '<button type="button" class="chip heat h' + (lv[t] || 0) + '" data-i="' + i + '">' + esc(t) + '<i>' + '●'.repeat(lv[t] || 0) + '</i></button>').join('') + '</div>' +
        '<div class="a-foot"><span class="cnt"><b>' + Object.values(lv).filter(Boolean).length + '</b> choisis</span>' + doneBtn(x, 'Voir mon top') + '</div>';
      $$('.chip', el).forEach(b => b.onclick = () => { const t = items[+b.dataset.i]; lv[t] = ((lv[t] || 0) + 1) % 4; x.put({ lv }); draw(); });
      const ok = $('.act-ok', el); ok.disabled = Object.values(lv).filter(Boolean).length < 3; ok.onclick = () => { x.put({ lv, ok: 1 }); show(); x.finish(); };
    };
    const show = () => {
      const top = Object.entries(lv).filter(e => e[1]).sort((a, b) => b[1] - a[1]).slice(0, 5);
      el.innerHTML = '<div class="sumcard"><span class="kick">Ton top des déclencheurs</span>' + top.map((e, i) => '<div class="bar3"><span>' + esc(e[0]) + '</span><i style="--w:' + e[1] * 33.3 + '%;animation-delay:' + i * 120 + 'ms"></i></div>').join('') + '<p class="mut">Garde ces trois premiers en tête : tu les verras venir.</p><button class="btn ghost sm" data-edit type="button">Modifier</button></div>';
      $('[data-edit]', el).onclick = draw;
    };
    x.d.ok ? show() : draw();
  };

  /* ---------- liste à cocher ---------- */
  T.checklist = T.evening = (el, x) => {
    const key = x.p.key || (x.type === 'evening' ? 'evening' : 'env'), items = x.kit[key] || []; let on = (x.d.on || []).slice();
    const draw = () => {
      el.innerHTML = '<p class="a-lead">' + esc(x.p.i || (x.type === 'evening' ? 'Compose ta routine du soir : coche ce que tu t\'engages à faire.' : 'Coche ce que tu mets en place. Chaque case est une protection de plus.')) + '</p>' +
        '<div class="pbar"><i style="width:' + Math.round(on.length / items.length * 100) + '%"></i></div><div class="checks">' + items.map((t, i) => '<button type="button" class="chk2' + (on.includes(i) ? ' on' : '') + '" data-i="' + i + '" aria-pressed="' + on.includes(i) + '"><span class="bx"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span>' + esc(t) + '</span></button>').join('') + '</div>' +
        '<div class="a-foot"><span class="cnt"><b>' + on.length + '</b> / ' + items.length + '</span>' + doneBtn(x, 'Terminer') + '</div>';
      $$('.chk2', el).forEach(b => b.onclick = () => { const i = +b.dataset.i, k = on.indexOf(i); k >= 0 ? on.splice(k, 1) : on.push(i); x.put({ on }); draw(); if (on.length === items.length) confetti(40); });
      const ok = $('.act-ok', el); ok.disabled = !on.length; ok.onclick = () => { x.put({ on }); x.finish(); };
    }; draw();
  };

  /* ---------- associer déclencheur et action ---------- */
  T.pairs = (el, x) => {
    const pr = x.kit.pairs; let left = null, got = [], err = 0;
    const R = shuffle(pr.map((p, i) => [p[1], i]));
    const draw = () => {
      el.innerHTML = '<p class="a-lead">' + esc(x.p.i || 'Relie chaque situation à l\'action qui lui correspond. Touche une situation, puis une action.') + '</p><div class="pairs"><div>' + pr.map((p, i) => '<button type="button" class="pcell L' + (got.includes(i) ? ' ok' : '') + (left === i ? ' sel' : '') + '" data-i="' + i + '">' + esc(p[0]) + '</button>').join('') + '</div><div>' +
        R.map(r => '<button type="button" class="pcell R' + (got.includes(r[1]) ? ' ok' : '') + '" data-i="' + r[1] + '">' + esc(r[0]) + '</button>').join('') + '</div></div><p class="scalemsg" aria-live="polite"></p>' + (got.length === pr.length ? '<div class="a-foot"><span></span>' + doneBtn(x, 'Mon plan est prêt') + '</div>' : '');
      $$('.pcell.L:not(.ok)', el).forEach(b => b.onclick = () => { left = +b.dataset.i; draw(); });
      $$('.pcell.R:not(.ok)', el).forEach(b => b.onclick = () => {
        if (left == null) { $('.scalemsg', el).textContent = 'Touche d\'abord une situation.'; return; }
        if (+b.dataset.i === left) { got.push(left); left = null; err = 0; draw(); if (got.length === pr.length) { confetti(50); x.put({ done: 1 }); } }
        else { err++; b.classList.add('shake'); $('.scalemsg', el).textContent = err > 1 ? 'Indice : pense à ce qui coupe le réflexe, pas à ce qui le remplace par un autre écran.' : 'Pas tout à fait. Essaie une autre action.'; setTimeout(() => b.classList.remove('shake'), 400); }
      });
      const ok = $('.act-ok', el); if (ok) ok.onclick = () => x.finish();
    }; draw();
  };

  /* ---------- bilan ---------- */
  T.bilan = (el, x) => {
    const S = x.L.S, all = (S.act || {})[x.slug] || {}, prevN = [7, 14, 21].filter(k => k < x.n).pop(), prev = prevN && all[prevN] && all[prevN].v;
    const items = [['humeur', 'Mon humeur', 'Plutôt bas', 'Plutôt bien'], ['sommeil', 'Mon sommeil', 'Mauvais', 'Bon'], ['envies', 'Mes envies', 'Faibles', 'Très fortes']];
    const v = Object.assign({ humeur: 5, sommeil: 5, envies: 5 }, x.d.v || {}), done = Object.keys(S.done[x.slug] || []).length ? (S.done[x.slug] || []).length : 0;
    el.innerHTML = '<p class="a-lead">Prends 30 secondes pour te situer. Il n\'y a pas de bonne réponse.</p>' + items.map(i => '<label class="sl"><span>' + i[1] + '<b data-o="' + i[0] + '">' + v[i[0]] + '</b></span><input type="range" class="rng" min="0" max="10" step="1" data-k="' + i[0] + '" value="' + v[i[0]] + '"><small><i>' + i[2] + '</i><i>' + i[3] + '</i></small></label>').join('') +
      '<div class="ringrow"><div class="ringbox sm"><svg viewBox="0 0 150 150"><circle class="c bg" cx="75" cy="75" r="64"/><circle class="c fg" cx="75" cy="75" r="64" style="stroke-dashoffset:' + (402 - 402 * Math.min(1, done / 30)) + '"/></svg><div class="in"><b>' + done + '</b><small>/ 30</small></div></div><p>' + (prev ? 'Depuis ton dernier bilan (jour ' + prevN + ') : humeur ' + dl(v.humeur - prev.humeur) + ', sommeil ' + dl(v.sommeil - prev.sommeil) + ', envies ' + dl(v.envies - prev.envies) + '.' : 'Ce premier bilan te servira de repère pour les prochains.') + '</p></div><div class="a-foot"><span></span>' + doneBtn(x, 'Enregistrer mon bilan') + '</div>';
    function dl(n) { return n > 0 ? '+' + n : String(n); }
    $$('.rng', el).forEach(r => r.oninput = () => { v[r.dataset.k] = +r.value; $('[data-o="' + r.dataset.k + '"]', el).textContent = r.value; });
    $('.act-ok', el).onclick = () => { x.put({ v }); x.finish(); };
  };

  /* ---------- surfer sur l'envie ---------- */
  T.wave = (el, x) => {
    const DUR = 40;
    el.innerHTML = '<p class="a-lead">Pense à une envie, ou si tu en ressens une maintenant, suis-la. Pendant 40 secondes, déplace le curseur pour dire son intensité. Tu verras sa forme.</p><svg class="wavechart" viewBox="0 0 320 150"><path d="M10 130 C70 130 90 20 160 20 S250 130 310 130" fill="none" stroke-width="3" stroke-dasharray="5 6" class="ln3"/><polyline class="mine" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points=""/><circle class="dot r" cx="10" cy="130" r="7"/></svg>' +
      '<label class="sl"><span>Intensité de mon envie<b data-o>5</b></span><input type="range" class="rng" min="0" max="10" step="1" value="5" disabled></label><p class="scalemsg" aria-live="polite">La ligne en pointillés montre le trajet habituel : montée, pic, descente.</p><div class="a-foot"><span class="cnt"><b data-t>' + DUR + '</b> s</span><button class="btn pri" type="button" data-go>Commencer</button></div>';
    const rng = $('.rng', el), line = $('.mine', el), dot = $('.dot', el), pts = []; let t0, raf, run = false;
    rng.oninput = () => $('[data-o]', el).textContent = rng.value;
    $('[data-go]', el).onclick = e => {
      e.target.disabled = true; rng.disabled = false; t0 = performance.now(); run = true; pts.length = 0; rng.focus();
      const f = () => {
        const s = (performance.now() - t0) / 1000, k = Math.min(1, s / DUR), X = 10 + k * 300; dot.setAttribute('cx', X);
        const ideal = 130 - 110 * Math.exp(-Math.pow((k - .5) / .2, 2)); dot.setAttribute('cy', ideal);
        const Y = 130 - (+rng.value) * 11; pts.push(X.toFixed(1) + ',' + Y.toFixed(1)); line.setAttribute('points', pts.join(' '));
        $('[data-t]', el).textContent = Math.max(0, Math.ceil(DUR - s));
        if (k < 1) raf = requestAnimationFrame(f); else end();
      }; f();
    };
    function end() {
      run = false; rng.disabled = true; const vals = pts.map(p => 11 * 0 + (130 - +p.split(',')[1]) / 11), peak = Math.max.apply(null, vals), last = vals[vals.length - 1];
      $('.scalemsg', el).innerHTML = '<b>Ton pic : ' + Math.round(peak) + '/10. À la fin : ' + Math.round(last) + '/10.</b> ' + (last < peak ? 'L\'envie est retombée, même sans rien faire.' : 'Même quand elle reste, elle est plus supportable que prévu. Réessaie à un autre moment.');
      x.put({ peak: Math.round(peak), last: Math.round(last) }); $('[data-go]', el).outerHTML = doneBtn(x, 'Terminer'); $('.act-ok', el).onclick = () => x.finish();
    }
    x.cleanup = () => cancelAnimationFrame(raf);
  };

  /* ---------- tenir en appuyant ---------- */
  T.hold = (el, x) => {
    const SEC = x.p.sec || 30, dis = x.kit.distract; let t0 = 0, raf = 0, last = -1, won = false;
    el.innerHTML = '<p class="a-lead">Maintiens le bouton enfoncé pendant ' + SEC + ' secondes. Des tentations vont apparaître : ne lâche pas. Tu peux aussi tenir avec la barre d\'espace.</p><div class="holdarea"><div class="floats" aria-hidden="true"></div><button type="button" class="holdbtn" aria-label="Maintenir appuyé"><svg viewBox="0 0 120 120"><circle class="bgc" cx="60" cy="60" r="54"/><circle class="fgc" cx="60" cy="60" r="54" style="stroke-dasharray:339.3;stroke-dashoffset:339.3"/></svg><b>Maintiens</b></button></div><p class="scalemsg" aria-live="polite"></p>';
    const btn = $('.holdbtn', el), fg = $('.fgc', el), fl = $('.floats', el), msg = $('.scalemsg', el);
    const spawn = () => { const s = document.createElement('span'); s.className = 'flt'; s.textContent = dis[rnd(dis.length)]; s.style.left = 4 + rnd(56) + '%'; fl.appendChild(s); setTimeout(() => s.remove(), 2800); };
    const tick = () => { const s = (performance.now() - t0) / 1000; fg.style.strokeDashoffset = 339.3 * (1 - Math.min(1, s / SEC)); const k = Math.floor(s / 2.2); if (k !== last) { last = k; spawn(); } if (s >= SEC) return win(); raf = requestAnimationFrame(tick); };
    const start = e => { if (won) return; e && e.preventDefault && e.preventDefault(); if (raf) return; t0 = performance.now(); last = -1; msg.textContent = ''; btn.classList.add('on'); raf = requestAnimationFrame(tick); };
    const stop = () => { if (!raf || won) return; cancelAnimationFrame(raf); raf = 0; const s = (performance.now() - t0) / 1000; btn.classList.remove('on'); fg.style.strokeDashoffset = 339.3; msg.textContent = 'Lâché à ' + s.toFixed(1) + ' s. Ce n\'est pas grave : recommence, la tentation passe toujours.'; };
    const win = () => { won = true; raf = 0; btn.classList.remove('on'); btn.classList.add('win'); fl.innerHTML = ''; msg.innerHTML = '<b>Tenu ! ' + SEC + ' secondes sans céder.</b> Les tentations sont passées sans que tu fasses quoi que ce soit.'; confetti(60); x.put({ ok: 1 }); el.insertAdjacentHTML('beforeend', '<div class="a-foot"><span></span>' + doneBtn(x, 'Terminer') + '</div>'); $('.act-ok', el).onclick = () => x.finish(); };
    btn.addEventListener('pointerdown', start); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, stop)); btn.addEventListener('contextmenu', e => e.preventDefault());
    btn.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { if (!e.repeat) start(e); else e.preventDefault(); } }); btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stop(); });
    x.cleanup = () => cancelAnimationFrame(raf);
  };

  /* ---------- respiration guidée ---------- */
  T.breathe = (el, x) => {
    const CYC = 6; let n = 0, timer = 0;
    el.innerHTML = '<p class="a-lead">Inspire 4 secondes, souffle 6 secondes. Six cycles, une minute. Suis le cercle.</p><div class="orbwrap"><div class="orb" style="transition-duration:0s"></div><b class="olb">Prêt ?</b></div><div class="dots">' + Array.from({ length: CYC }, () => '<i></i>').join('') + '</div><div class="a-foot"><span></span><button class="btn pri" type="button" data-go>Commencer</button></div>';
    const orb = $('.orb', el), lab = $('.olb', el);
    const cyc = () => {
      if (n >= CYC) { lab.textContent = 'Bien joué'; confetti(40); x.put({ ok: 1 }); $('[data-go]', el).outerHTML = doneBtn(x, 'Terminer'); $('.act-ok', el).onclick = () => x.finish(); return; }
      lab.textContent = 'Inspire'; orb.style.transitionDuration = '4s'; orb.style.transform = 'scale(1)';
      timer = setTimeout(() => { lab.textContent = 'Souffle'; orb.style.transitionDuration = '6s'; orb.style.transform = 'scale(.55)'; timer = setTimeout(() => { $$('.dots i', el)[n].classList.add('on'); n++; cyc(); }, 6000); }, 4000);
    };
    orb.style.transform = 'scale(.55)';
    $('[data-go]', el).onclick = e => { e.target.disabled = true; requestAnimationFrame(cyc); };
    x.cleanup = () => clearTimeout(timer);
  };

  /* ---------- machine à alternatives ---------- */
  T.slot = (el, x) => {
    const items = x.kit.actions, H = 56; let kept = (x.d.kept || []).slice(), cur = null, spin = false;
    const reel = shuffle(items).concat(items, items);
    el.innerHTML = '<p class="a-lead">Fais tourner la machine : elle te propose une action à la place de l\'habitude. Garde 3 idées qui te parlent.</p><div class="slotbox"><div class="slotwin"><div class="strip">' + reel.map(t => '<div>' + esc(t) + '</div>').join('') + '</div></div><i class="mk"></i></div><div class="acts"><button class="btn pri" type="button" data-sp>Tourner</button><button class="btn ghost" type="button" data-keep disabled>Garder cette idée</button></div><ul class="kept"></ul><div class="a-foot"><span class="cnt"><b data-n>0</b> / 3</span><span></span></div>';
    const strip = $('.strip', el), sp = $('[data-sp]', el), kp = $('[data-keep]', el);
    const paint = () => { $('.kept', el).innerHTML = kept.map(k => '<li>' + esc(k) + '</li>').join(''); $('[data-n]', el).textContent = kept.length; if (kept.length >= 3 && !$('.act-ok', el)) { confetti(50); $('.a-foot span:last-child', el).outerHTML = doneBtn(x, 'Terminer'); $('.act-ok', el).onclick = () => { x.put({ kept }); x.finish(); }; } };
    sp.onclick = () => { if (spin) return; spin = true; kp.disabled = true; const idx = items.length + rnd(items.length); strip.style.transition = 'none'; strip.style.transform = 'translateY(0)'; strip.offsetHeight; strip.style.transition = reduce() ? 'none' : 'transform 1.5s cubic-bezier(.15,.7,.2,1)'; strip.style.transform = 'translateY(' + (-(idx + 0) * H) + 'px)'; cur = reel[idx]; setTimeout(() => { spin = false; kp.disabled = kept.includes(cur); }, reduce() ? 0 : 1550); };
    kp.onclick = () => { if (cur && !kept.includes(cur)) { kept.push(cur); kp.disabled = true; x.put({ kept }); paint(); } };
    paint();
  };

  /* ---------- pause guidée ---------- */
  T.pause = (el, x) => {
    const steps = x.kit.pause, SEC = 12; let i = -1, timer = 0;
    el.innerHTML = '<p class="a-lead">Cinq micro-pauses de 12 secondes. Fais-les une à une, sans écran.</p><div class="pausebox"><svg viewBox="0 0 120 120"><circle class="bgc" cx="60" cy="60" r="54"/><circle class="fgc" cx="60" cy="60" r="54" style="stroke-dasharray:339.3;stroke-dashoffset:339.3"/></svg><b class="pn">·</b></div><p class="pt">Prêt ?</p><div class="a-foot"><span class="cnt"><b data-n>0</b> / ' + steps.length + '</span><button class="btn pri" type="button" data-go>Commencer</button></div>';
    const fg = $('.fgc', el), pt = $('.pt', el), pn = $('.pn', el);
    const next = () => {
      i++; $('[data-n]', el).textContent = i; if (i >= steps.length) { pt.textContent = 'Bravo : ton corps a levé le pied.'; pn.textContent = '✓'; confetti(40); x.put({ ok: 1 }); $('[data-go]', el).outerHTML = doneBtn(x, 'Terminer'); $('.act-ok', el).onclick = () => x.finish(); return; }
      pn.textContent = i + 1; pt.textContent = steps[i]; fg.style.transition = 'none'; fg.style.strokeDashoffset = 339.3; fg.getBoundingClientRect(); fg.style.transition = 'stroke-dashoffset ' + SEC + 's linear'; fg.style.strokeDashoffset = 0; timer = setTimeout(next, SEC * 1000);
    };
    $('[data-go]', el).onclick = e => { e.target.disabled = true; next(); };
    x.cleanup = () => clearTimeout(timer);
  };

  /* ---------- vrai ou faux ---------- */
  T.myths = (el, x) => {
    const Q = x.kit.myths; let i = 0, score = 0;
    const draw = () => {
      if (i >= Q.length) { el.innerHTML = '<div class="sumcard"><span class="kick">Résultat</span><div class="big"><b>' + score + '/' + Q.length + '</b></div><p>' + (score >= Q.length - 1 ? 'Tu as l\'œil. Ces idées reçues ne te piègent plus.' : 'Pas grave : chaque idée démontée enlève un piège.') + '</p>' + doneBtn(x, 'Terminer') + '</div>'; if (score >= Q.length - 1) confetti(50); x.put({ score }); $('.act-ok', el).onclick = () => x.finish(); return; }
      el.innerHTML = '<div class="pbar"><i style="width:' + i / Q.length * 100 + '%"></i></div><div class="card3 rise"><p>' + esc(Q[i][0]) + '</p></div><div class="acts two"><button class="btn ghost" type="button" data-a="1">Vrai</button><button class="btn ghost" type="button" data-a="0">Faux</button></div><div class="fb" aria-live="polite"></div>';
      $$('[data-a]', el).forEach(b => b.onclick = () => { const ok = (b.dataset.a === '1') === Q[i][1]; if (ok) score++; $$('[data-a]', el).forEach(z => z.disabled = true); b.classList.add(ok ? 'good' : 'bad'); $('.fb', el).innerHTML = '<div class="fbx ' + (ok ? 'good' : 'bad') + '"><b>' + (ok ? 'Exact. ' : 'Pas tout à fait. ') + '</b>' + esc(Q[i][2]) + '</div><button class="btn pri" type="button" data-nx>Suivant</button>'; $('[data-nx]', el).onclick = () => { i++; draw(); }; });
    }; draw();
  };

  /* ---------- pensées-pièges ---------- */
  T.pieges = (el, x) => {
    const Q = shuffle(x.kit.pieges).slice(0, 6); let i = 0, score = 0;
    const draw = () => {
      if (i >= Q.length) { el.innerHTML = '<div class="sumcard"><span class="kick">Résultat</span><div class="big"><b>' + score + '/' + Q.length + '</b></div><p>' + (score >= 5 ? 'Tu repères les pièges. Garde ce réflexe quand l\'envie parle.' : 'Les pièges sont bien faits. Les connaître, c\'est déjà moins tomber dedans.') + '</p>' + doneBtn(x, 'Terminer') + '</div>'; if (score >= 5) confetti(50); x.put({ score }); $('.act-ok', el).onclick = () => x.finish(); return; }
      el.innerHTML = '<p class="a-lead">Cette pensée est-elle un piège, ou un appui ?</p><div class="pbar"><i style="width:' + i / Q.length * 100 + '%"></i></div><div class="card3 rise"><p>« ' + esc(Q[i][0]) + ' »</p></div><div class="acts two"><button class="btn ghost" type="button" data-a="1">Piège</button><button class="btn ghost" type="button" data-a="0">Appui</button></div><div class="fb" aria-live="polite"></div>';
      $$('[data-a]', el).forEach(b => b.onclick = () => { const ok = (b.dataset.a === '1') === Q[i][1]; if (ok) score++; $$('[data-a]', el).forEach(z => z.disabled = true); b.classList.add(ok ? 'good' : 'bad'); $('.fb', el).innerHTML = '<div class="fbx ' + (ok ? 'good' : 'bad') + '"><b>' + (ok ? 'Bien vu. ' : 'Attention. ') + '</b>' + esc(Q[i][2]) + '</div><button class="btn pri" type="button" data-nx>Suivant</button>'; $('[data-nx]', el).onclick = () => { i++; draw(); }; });
    }; draw();
  };

  /* ---------- scénarios ---------- */
  T.scenario = (el, x) => {
    const Q = x.kit.scenarios; let i = 0, score = 0;
    const draw = () => {
      if (i >= Q.length) { const mx = Q.length * 2; el.innerHTML = '<div class="sumcard"><span class="kick">Ton score</span><div class="big"><b>' + score + '/' + mx + '</b></div><p>' + (score >= mx - 1 ? 'Tu as de bons réflexes. Ils se construisent par la pratique.' : 'Chaque situation te prépare. Relis les réponses qui t\'ont surpris.') + '</p>' + doneBtn(x, 'Terminer') + '</div>'; if (score >= mx - 1) confetti(50); x.put({ score }); $('.act-ok', el).onclick = () => x.finish(); return; }
      el.innerHTML = '<div class="pbar"><i style="width:' + i / Q.length * 100 + '%"></i></div><div class="card3 rise"><span class="kick">Situation ' + (i + 1) + ' sur ' + Q.length + '</span><p>' + esc(Q[i].q) + '</p></div><div class="choices">' + Q[i].c.map((c, k) => '<button class="btn ghost ch" type="button" data-k="' + k + '">' + esc(c[0]) + '</button>').join('') + '</div><div class="fb" aria-live="polite"></div>';
      $$('.ch', el).forEach(b => b.onclick = () => { const c = Q[i].c[+b.dataset.k]; score += c[1]; $$('.ch', el).forEach(z => z.disabled = true); b.classList.add(c[1] === 2 ? 'good' : c[1] === 1 ? 'mid' : 'bad'); $('.fb', el).innerHTML = '<div class="fbx ' + (c[1] === 2 ? 'good' : c[1] === 1 ? 'mid' : 'bad') + '">' + esc(c[2]) + '</div><button class="btn pri" type="button" data-nx>' + (i + 1 < Q.length ? 'Situation suivante' : 'Voir mon score') + '</button>'; $('[data-nx]', el).onclick = () => { i++; draw(); }; });
    }; draw();
  };

  /* ---------- plan de rechute ---------- */
  T.relapse = (el, x) => {
    const R = x.kit.relapse, G = [['heure', 'Dans l\'heure, je…', R.heure], ['ajuster', 'Ensuite, j\'ajuste…', R.ajuster], ['prevenir', 'Je préviens…', x.kit.relapse.prevenir]]; let v = Object.assign({}, x.d.v || {});
    const draw = () => {
      el.innerHTML = '<p class="a-lead">Construis ton plan B en trois étapes. Touche une réponse pour chaque ligne.</p>' + G.map(g => '<div class="grp"><h4>' + g[1] + '</h4><div class="chips">' + g[2].map(t => '<button type="button" class="chip' + (v[g[0]] === t ? ' on' : '') + '" data-g="' + g[0] + '" data-t="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div></div>').join('') + '<div class="a-foot"><span></span>' + doneBtn(x, 'Valider mon plan') + '</div>';
      $$('.chip', el).forEach(b => b.onclick = () => { v[b.dataset.g] = b.dataset.t; x.put({ v }); draw(); });
      const ok = $('.act-ok', el); ok.disabled = G.some(g => !v[g[0]]); ok.onclick = () => { x.put({ v, ok: 1 }); card(); x.finish(); };
    };
    const card = () => { el.innerHTML = '<div class="sumcard rise"><span class="kick">Mon plan B</span><ol class="plan">' + G.map(g => '<li><b>' + g[1] + '</b> ' + esc(v[g[0]]) + '</li>').join('') + '</ol><p class="mut">Garde-le sous la main. Tu n\'auras peut-être jamais à l\'utiliser, et c\'est très bien.</p><button class="btn ghost sm" data-edit type="button">Modifier</button></div>'; $('[data-edit]', el).onclick = draw; };
    x.d.ok ? card() : draw();
  };

  /* ---------- plan pour un événement ---------- */
  T.planner = (el, x) => {
    const ev = x.kit.events, act = x.kit.actions; let plans = (x.d.plans || []).slice(), cur = { e: '', a: '', b: '', c: '' };
    const sel = (k, lab) => '<label class="a-lbl">' + lab + '<select class="sel" data-k="' + k + '"><option value="">Choisir…</option>' + act.map(t => '<option' + (cur[k] === t ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></label>';
    const draw = () => {
      el.innerHTML = '<p class="a-lead">Choisis un moment à venir et prépare-le comme un match : avant, pendant, si l\'envie monte.</p><div class="chips">' + ev.map(t => '<button type="button" class="chip' + (cur.e === t ? ' on' : '') + '" data-e="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>' +
        (cur.e ? '<div class="formg">' + sel('a', 'Avant : je prépare…') + sel('b', 'Pendant : je fais…') + sel('c', 'Si l\'envie monte : je fais…') + '<button class="btn ghost sm" type="button" data-add' + (cur.a && cur.b && cur.c ? '' : ' disabled') + '>Ajouter ce plan</button></div>' : '') +
        '<ul class="kept">' + plans.map(p => '<li><b>' + esc(p.e) + '</b> : ' + esc(p.a) + ' · ' + esc(p.b) + ' · ' + esc(p.c) + '</li>').join('') + '</ul><div class="a-foot"><span class="cnt"><b>' + plans.length + '</b> plan' + (plans.length > 1 ? 's' : '') + '</span>' + doneBtn(x, 'Terminer') + '</div>';
      $$('[data-e]', el).forEach(b => b.onclick = () => { cur.e = b.dataset.e; draw(); });
      $$('select', el).forEach(s => s.onchange = () => { cur[s.dataset.k] = s.value; draw(); });
      const ad = $('[data-add]', el); if (ad) ad.onclick = () => { plans.push(Object.assign({}, cur)); cur = { e: '', a: '', b: '', c: '' }; x.put({ plans }); draw(); };
      const ok = $('.act-ok', el); ok.disabled = !plans.length; ok.onclick = () => { x.put({ plans }); x.finish(); };
    }; draw();
  };

  /* ---------- calendrier à risque ---------- */
  T.calendar = (el, x) => {
    const act = x.kit.actions; let days = Object.assign({}, x.d.days || {});
    const base = new Date(); base.setHours(12, 0, 0, 0); const cells = Array.from({ length: 14 }, (_, i) => { const d = new Date(base); d.setDate(d.getDate() + i); return d; });
    const iso = d => d.toISOString().slice(0, 10), WD = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
    const draw = () => {
      el.innerHTML = '<p class="a-lead">Touche les jours à risque des deux prochaines semaines (soirée, paie, match, jour difficile…). Puis choisis ce que tu feras.</p><div class="cal">' + cells.map(d => '<button type="button" class="cd' + (days[iso(d)] != null ? ' on' : '') + '" data-d="' + iso(d) + '"><small>' + WD[d.getDay()] + '</small><b>' + d.getDate() + '</b></button>').join('') + '</div>' +
        Object.keys(days).sort().map(k => '<label class="a-lbl">' + new Date(k + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '<select class="sel" data-s="' + k + '"><option value="">Mon plan…</option>' + act.map(t => '<option' + (days[k] === t ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></label>').join('') +
        '<div class="a-foot"><span class="cnt"><b>' + Object.keys(days).length + '</b> jour' + (Object.keys(days).length > 1 ? 's' : '') + ' à risque</span>' + doneBtn(x, 'Terminer') + '</div>';
      $$('.cd', el).forEach(b => b.onclick = () => { const k = b.dataset.d; if (days[k] != null) delete days[k]; else days[k] = ''; x.put({ days }); draw(); });
      $$('select', el).forEach(s => s.onchange = () => { days[s.dataset.s] = s.value; x.put({ days }); });
      $('.act-ok', el).onclick = () => { x.put({ days }); x.finish(); };
    }; draw();
  };

  /* ---------- message à un proche ---------- */
  T.message = (el, x) => {
    const M = x.kit.messages, P = x.kit.people; let who = x.d.who || '', txt = x.d.txt || M[0];
    el.innerHTML = '<p class="a-lead">Demander de l\'aide est plus simple avec un message prêt. Choisis à qui, adapte le texte.</p><div class="chips">' + P.map(t => '<button type="button" class="chip' + (who === t ? ' on' : '') + '" data-w="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div><div class="chips tpl">' + M.map((t, i) => '<button type="button" class="chip' + (txt === t ? ' on' : '') + '" data-m="' + i + '">Modèle ' + (i + 1) + '</button>').join('') + '</div><textarea class="note" rows="4" aria-label="Mon message">' + esc(txt) + '</textarea><div class="acts"><button class="btn ghost sm" type="button" data-cp>Copier</button><a class="btn ghost sm" data-sms href="#">Envoyer par SMS</a></div><p class="scalemsg" aria-live="polite"></p><div class="a-foot"><span></span>' + doneBtn(x, 'Je l\'enverrai') + '</div>';
    const ta = $('textarea', el), ok = $('.act-ok', el); const sync = () => { $('[data-sms]', el).href = 'sms:?&body=' + encodeURIComponent(ta.value); x.put({ who, txt: ta.value }); ok.disabled = !who; };
    ta.oninput = sync; $$('[data-w]', el).forEach(b => b.onclick = () => { who = b.dataset.w; $$('[data-w]', el).forEach(z => z.classList.toggle('on', z === b)); sync(); });
    $$('[data-m]', el).forEach(b => b.onclick = () => { ta.value = M[+b.dataset.m]; $$('[data-m]', el).forEach(z => z.classList.toggle('on', z === b)); sync(); });
    $('[data-cp]', el).onclick = async () => { try { await navigator.clipboard.writeText(ta.value); $('.scalemsg', el).textContent = 'Message copié.'; } catch (_) { ta.select(); $('.scalemsg', el).textContent = 'Sélectionné : copie-le.'; } };
    ok.onclick = () => { sync(); x.finish(); }; sync();
  };

  /* ---------- soutien ---------- */
  T.support = (el, x) => {
    const A = (x.prog.aides || []).map(k => x.L.META.aides[k]).filter(Boolean); let sel = (x.d.sel || []).slice();
    el.innerHTML = '<p class="a-lead">Qui peut t\'aider ? Choisis jusqu\'à 3 personnes, et garde sous la main les lignes gratuites.</p><div class="chips">' + chipsHTML(x.kit.people, sel) + '</div><div class="helpcards">' + A.map(a => '<a class="hc" href="' + a[2] + '"><b>' + esc(a[0]) + '</b><span>' + esc(a[1]) + '</span></a>').join('') + '</div><div class="a-foot"><span class="cnt"><b data-n>' + sel.length + '</b> / 3</span>' + doneBtn(x, 'Mon réseau est prêt') + '</div>';
    const ok = $('.act-ok', el); ok.disabled = !sel.length;
    $$('.chip', el).forEach(b => b.onclick = () => { const t = x.kit.people[+b.dataset.i], k = sel.indexOf(t); if (k >= 0) sel.splice(k, 1); else if (sel.length < 3) sel.push(t); else return; b.classList.toggle('on'); $('[data-n]', el).textContent = sel.length; ok.disabled = !sel.length; x.put({ sel }); });
    ok.onclick = () => { x.put({ sel }); x.finish(); };
  };

  /* ---------- lettre ---------- */
  T.letter = (el, x) => {
    const starts = ['Je suis fier de moi parce que…', 'Ce que j\'ai appris, c\'est que…', 'Quand l\'envie revient, je me rappelle que…', 'Je me souhaite…'];
    const draw = () => {
      el.innerHTML = '<p class="a-lead">Écris-toi une lettre, pour dans trois mois. Touche une amorce pour démarrer.</p><div class="chips">' + starts.map((s, i) => '<button type="button" class="chip" data-s="' + i + '">' + esc(s) + '</button>').join('') + '</div><textarea class="note tall" placeholder="Cher moi du futur…" aria-label="Ma lettre">' + esc(x.d.text || '') + '</textarea><div class="a-foot"><span></span><button class="btn pri act-ok" type="button">Sceller ma lettre</button></div>';
      const ta = $('textarea', el), ok = $('.act-ok', el); const chk = () => { ok.disabled = ta.value.trim().length < 20; x.put({ text: ta.value }); }; ta.oninput = chk; chk();
      $$('[data-s]', el).forEach(b => b.onclick = () => { ta.value += (ta.value && !/\s$/.test(ta.value) ? '\n' : '') + starts[+b.dataset.s] + ' '; ta.focus(); chk(); });
      ok.onclick = () => { x.put({ text: ta.value, sealed: 1 }); seal(); x.finish(); };
    };
    const seal = () => { el.innerHTML = '<div class="envelope rise"><div class="env"><i class="fl"></i><i class="bd"></i></div><p><b>Lettre scellée.</b> Elle t\'attend au jour 30.</p><button class="btn ghost sm" data-edit type="button">La rouvrir</button></div>'; if (!reduce()) confetti(30); $('[data-edit]', el).onclick = draw; };
    x.d.sealed ? seal() : draw();
  };

  /* ---------- chronologie ---------- */
  T.timeline = (el, x) => {
    const L = x.kit.timeline; let i = x.d.i || 0;
    const draw = () => {
      el.innerHTML = '<p class="a-lead">Ce que beaucoup de personnes constatent au fil du temps. Chacun va à son rythme.</p><ol class="tl">' + L.map((t, k) => '<li class="' + (k < i ? 'on' : '') + '"><b>' + esc(t[0]) + '</b><span>' + esc(t[1]) + '</span></li>').join('') + '</ol><div class="a-foot"><span></span>' + (i < L.length ? '<button class="btn pri" type="button" data-nx>Avancer dans le temps</button>' : doneBtn(x, 'Terminer')) + '</div>';
      const nx = $('[data-nx]', el); if (nx) nx.onclick = () => { i++; x.put({ i }); draw(); }; else $('.act-ok', el).onclick = () => { confetti(40); x.finish(); };
    }; draw();
  };

  /* ---------- exercice physique ---------- */
  T.move = (el, x) => {
    const E = [['Marche sur place, genoux hauts', 25], ['Squats lents', 25], ['Pompes contre un mur', 25], ['Jumping jacks ou pas chassés', 25], ['Étirements des bras et du dos', 25]]; let i = -1, timer = 0;
    el.innerHTML = '<p class="a-lead">Deux minutes de mouvement, sans matériel. Si un exercice ne te va pas, remplace-le par de la marche.</p><div class="movebox"><svg viewBox="0 0 120 120"><circle class="bgc" cx="60" cy="60" r="54"/><circle class="fgc" cx="60" cy="60" r="54" style="stroke-dasharray:339.3;stroke-dashoffset:339.3"/></svg><b class="pn">·</b></div><p class="pt">Prêt ?</p><div class="a-foot"><span class="cnt"><b data-n>0</b> / ' + E.length + '</span><button class="btn pri" type="button" data-go>Commencer</button></div>';
    const fg = $('.fgc', el), pt = $('.pt', el), pn = $('.pn', el), box = $('.movebox', el);
    const next = () => {
      i++; $('[data-n]', el).textContent = i; if (i >= E.length) { box.classList.remove('go'); pt.textContent = 'Bravo, c\'est fait.'; pn.textContent = '✓'; confetti(50); x.put({ ok: 1 }); $('[data-go]', el).outerHTML = doneBtn(x, 'Terminer'); $('.act-ok', el).onclick = () => x.finish(); return; }
      box.classList.add('go'); pn.textContent = E[i][1]; pt.textContent = E[i][0]; fg.style.transition = 'none'; fg.style.strokeDashoffset = 339.3; fg.getBoundingClientRect(); fg.style.transition = 'stroke-dashoffset ' + E[i][1] + 's linear'; fg.style.strokeDashoffset = 0; timer = setTimeout(next, E[i][1] * 1000);
    };
    $('[data-go]', el).onclick = e => { e.target.disabled = true; next(); };
    x.cleanup = () => clearTimeout(timer);
  };

  /* ---------- « se refaire » : simulation ---------- */
  T.chase = (el, x) => {
    let bank = 100, loss = 0, hist = [100], rounds = 0, stake = 20;
    const draw = () => {
      const min = Math.min.apply(null, hist), mx = Math.max.apply(null, hist), pts = hist.map((v, i) => (10 + i * (300 / Math.max(12, hist.length - 1))).toFixed(1) + ',' + (110 - (v - 0) / Math.max(200, mx) * 100).toFixed(1)).join(' ');
      el.innerHTML = '<p class="a-lead">Tu as perdu 50 €. Tu mises pour te refaire, à pile ou face, avec une chance un peu inférieure à une sur deux (comme dans tous les jeux d\'argent). Vois ce qui se passe.</p><div class="chase"><div class="big"><b>' + fmt(bank) + ' €</b><span>ta réserve de départ : 100 €</span></div><svg viewBox="0 0 320 120" class="wavechart"><polyline fill="none" stroke-width="3" stroke-linejoin="round" points="' + pts + '" class="bst"/></svg><label class="sl"><span>Mise par tour<b>' + stake + ' €</b></span><input type="range" class="rng" min="5" max="50" step="5" value="' + stake + '"></label></div><div class="acts"><button class="btn pri" type="button" data-bet ' + (bank < stake ? 'disabled' : '') + '>Miser pour me refaire</button><button class="btn ghost" type="button" data-auto ' + (bank < stake ? 'disabled' : '') + '>10 tours d\'un coup</button></div><p class="scalemsg" aria-live="polite">' + (bank <= 0 ? 'Réserve épuisée. C\'est ce qui arrive presque toujours.' : rounds ? rounds + ' tour' + (rounds > 1 ? 's' : '') + ' joué' + (rounds > 1 ? 's' : '') + '.' : '') + '</p><div class="a-foot"><span></span>' + (rounds >= 8 || bank <= 0 ? doneBtn(x, 'J\'ai compris') : '') + '</div>';
      $('.rng', el).oninput = e => { stake = +e.target.value; $('.sl b', el).textContent = stake + ' €'; };
      const bet = () => { if (bank < stake) return; const win = Math.random() < .47; bank += win ? stake : -stake; if (bank < 0) bank = 0; hist.push(bank); rounds++; };
      $('[data-bet]', el).onclick = () => { bet(); draw(); }; $('[data-auto]', el).onclick = () => { for (let k = 0; k < 10; k++) bet(); draw(); };
      const ok = $('.act-ok', el); if (ok) ok.onclick = () => { x.put({ rounds, bank }); x.finish(); };
    }; draw();
  };

  /* ---------- finale ---------- */
  T.final = (el, x) => {
    const S = x.L.S, all = (S.act || {})[x.slug] || {}, why = all[1] && all[1].sel || [], letter = all[29] && all[29].text, st = x.L.streakInfo(x.slug), n = (S.done[x.slug] || []).length;
    let sel = (x.d.sel || []).slice(), rules = x.kit.rules;
    const draw = () => {
      el.innerHTML = '<p class="a-lead">Choisis les 3 règles que tu gardes après les 30 jours.</p><div class="chips">' + chipsHTML(rules, sel) + '</div><div class="a-foot"><span class="cnt"><b>' + sel.length + '</b> / 3</span>' + doneBtn(x, 'Voir mon bilan') + '</div>';
      $$('.chip', el).forEach(b => b.onclick = () => { const t = rules[+b.dataset.i], k = sel.indexOf(t); k >= 0 ? sel.splice(k, 1) : sel.length < 3 && sel.push(t); x.put({ sel }); draw(); });
      const ok = $('.act-ok', el); ok.disabled = sel.length < 3; ok.onclick = () => { x.put({ sel, ok: 1 }); show(); x.finish(); };
    };
    const show = () => {
      el.innerHTML = '<div class="cert rise"><svg class="medal" viewBox="0 0 100 110"><circle cx="50" cy="46" r="34" class="m"/><circle cx="50" cy="46" r="26" fill="none" stroke-width="3" class="wst o3"/><path d="M32 84l-8 22 20-8 6 10zM68 84l8 22-20-8-6 10z" class="r"/><text x="50" y="56" text-anchor="middle" class="tx i" style="font-size:30px">30</text></svg><h3>30 jours, c\'est fait.</h3><div class="stats"><div><b>' + n + '</b><span>jours faits</span></div><div><b>' + (S.envies[x.slug] || 0) + '</b><span>envies surmontées</span></div><div><b>' + (st ? st.d : 0) + '</b><span>jours sans</span></div></div>' +
        (why.length ? '<div class="blk"><span class="kick">Ton pourquoi</span><ul class="sumlist">' + why.map(w => '<li>' + esc(w) + '</li>').join('') + '</ul></div>' : '') +
        '<div class="blk"><span class="kick">Tes 3 règles</span><ul class="sumlist">' + sel.map(w => '<li>' + esc(w) + '</li>').join('') + '</ul></div>' +
        (letter ? '<details class="blk"><summary>Ouvrir ma lettre du jour 29</summary><p class="lt">' + esc(letter).replace(/\n/g, '<br>') + '</p></details>' : '') + '<p class="mut">Refais le point une fois par mois. Si ça devient dur : ' + (x.prog.aides || []).map(k => x.L.META.aides[k]).filter(Boolean).map(a => '<a href="' + a[2] + '">' + esc(a[0]) + '</a>').join(' · ') + '.</p></div>'; confetti(140);
    };
    x.d.ok ? show() : draw();
  };

  const TITLES = {
    choose: 'Ton pourquoi', calc: 'Ton chiffre réel', balance: 'La balance', heat: 'Tes déclencheurs', checklist: 'Ta mise en place', pairs: 'Le jeu des associations', bilan: 'Ton bilan de la semaine',
    wave: 'Surfer sur l\'envie', hold: 'Tenir 30 secondes', breathe: 'Respiration guidée', slot: 'La machine à alternatives', pause: 'Cinq micro-pauses', myths: 'Vrai ou faux', toolbox: 'Ta boîte à outils', move: 'Deux minutes de mouvement',
    planner: 'Prépare ton prochain moment', message: 'Ton message', pieges: 'Piège ou appui ?', rewards: 'Tes récompenses', scenario: 'Mises en situation', relapse: 'Ton plan B', identity: 'Qui tu deviens', calendar: 'Ton calendrier à risque',
    evening: 'Ta routine du soir', gain: 'Ton gain', support: 'Ton réseau', letter: 'Ta lettre', final: 'Ton bilan final', chase: 'Le piège de « se refaire »', timeline: 'Ce que ton corps récupère'
  };


  /* ---------- objectif du jour et « ce que tu retiens » ---------- */
  const GOAL = {
    choose: 'Savoir pour quoi tu le fais.', calc: 'Mettre un chiffre sur ton habitude.', balance: 'Voir ce qu\'elle t\'apporte et ce qu\'elle te coûte.', heat: 'Repérer ce qui déclenche l\'envie.',
    checklist: 'Rendre l\'habitude plus difficile.', pairs: 'Préparer ta réponse à chaque déclencheur.', bilan: 'Mesurer où tu en es.', wave: 'Voir qu\'une envie redescend toute seule.',
    hold: 'T\'entraîner à tenir sans céder.', breathe: 'Calmer une envie avec ton souffle.', slot: 'Trouver de quoi remplacer l\'habitude.', pause: 'Te donner de vraies pauses.',
    myths: 'Démonter les idées qui te retiennent.', toolbox: 'Te constituer une boîte à outils.', move: 'Utiliser le mouvement contre l\'envie.', planner: 'Préparer ton prochain moment à risque.',
    message: 'Demander de l\'aide, simplement.', pieges: 'Repérer les pensées qui te font craquer.', rewards: 'Te récompenser autrement.', scenario: 'T\'entraîner sur des situations réelles.',
    relapse: 'Avoir un plan B si tu craques.', identity: 'Nommer qui tu deviens.', calendar: 'Anticiper tes jours à risque.', evening: 'Construire ta routine du soir.',
    gain: 'Chiffrer ce que tu récupères.', support: 'Savoir qui peut t\'aider.', letter: 'T\'écrire pour plus tard.', final: 'Fixer les règles que tu gardes.',
    chase: 'Voir pourquoi « se refaire » coûte plus cher.', timeline: 'Voir ce qui s\'améliore avec le temps.'
  };
  const li = a => '<ul>' + a.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>';
  const lc = t => t ? t.charAt(0).toLowerCase() + t.slice(1) : t;
  function take(type, x) {
    const d = x.d || x.get() || {}, k = x.kit, p = x.p || {};
    const L = (a, n) => (a || []).slice(0, n || 99);
    switch (type) {
      case 'choose': return d.sel && d.sel.length ? ['Tes raisons', li(d.sel), 'Relis-les quand l\'envie monte : elles s\'affichent aussi dans le bouton SOS.'] : null;
      case 'identity': return d.sel && d.sel.length ? ['Qui tu deviens', '« Je deviens quelqu\'un ' + d.sel.map(lc).join(', ') + '. »', 'Relis cette phrase le matin.'] : null;
      case 'toolbox': return d.sel && d.sel.length ? ['Ta boîte à outils', li(d.sel), 'À chaque envie, prends-en une avant de céder.'] : null;
      case 'rewards': return d.sel && d.sel.length ? ['Tes récompenses', li(d.sel), 'Offre-t\'en une à chaque semaine tenue.'] : null;
      case 'calc': case 'gain': { const c = k.calc, y = (typeof d.v === 'number' ? d.v : c.def) * c.mult; return ['Ton chiffre', '<b>' + fmt(y) + ' ' + esc(c.out) + '</b>' + (c.div ? ', soit ' + (y / c.div).toFixed(1).replace('.', ',') + ' ' + esc(c.divLabel) : '') + '.', (d.plan ? 'Ton objectif : ' + esc(d.plan) + '.' : 'Chaque jour gagné se retrouve dans ce total.')]; }
      case 'balance': return d.pros || d.cons ? ['Ta balance', 'Ce que ça t\'apporte : ' + esc((d.pros || []).join(', ') || 'rien de noté') + '.<br>Ce que ça te coûte : ' + esc((d.cons || []).join(', ') || 'rien de noté') + '.', 'Ce que ça t\'apporte, on va l\'obtenir autrement dans les jours qui viennent.'] : null;
      case 'heat': { const t = Object.entries(d.lv || {}).filter(e => e[1]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]); return t.length ? ['Tes déclencheurs n°1', li(t), 'Dans les prochains jours, on s\'occupe de ceux-là en premier.'] : null; }
      case 'checklist': case 'evening': { const key = p.key || (type === 'evening' ? 'evening' : 'env'), all = k[key] || [], on = d.on || [], miss = all.filter((_, i) => !on.includes(i)); return ['C\'est en place', '<b>' + on.length + ' sur ' + all.length + '</b> mis en place.', miss.length ? 'Il reste : ' + esc(L(miss, 2).join(' ; ')) + '. Fais-le dans la journée.' : 'Tout est en place, bravo.']; }
      case 'pairs': return ['Ton plan « si… alors… »', li(k.pairs.map(q => 'Si ' + lc(q[0]) + ', alors ' + lc(q[1]))), 'Recopie-les dans tes notes.'];
      case 'bilan': return d.v ? ['Ton bilan', 'Humeur <b>' + d.v.humeur + '/10</b>, sommeil <b>' + d.v.sommeil + '/10</b>, envies <b>' + d.v.envies + '/10</b>.', 'Compare avec le prochain bilan pour voir ce qui change.'] : null;
      case 'wave': return d.peak != null ? ['Ce que tu as vu', 'Ton envie a atteint <b>' + d.peak + '/10</b>, puis <b>' + d.last + '/10</b> à la fin.', (d.last < d.peak ? 'Elle redescend sans que tu fasses quoi que ce soit : tu n\'as pas à céder.' : 'Elle ne baisse pas toujours en 40 secondes : refais l\'exercice plus tard, ou utilise le bouton SOS (10 minutes).')] : null;
      case 'hold': return ['Ce que tu as prouvé', 'Tu as tenu <b>' + (p.sec || 30) + ' secondes</b> pendant que les tentations défilaient.', 'Refais-le chaque fois qu\'une envie arrive : elle passe.'];
      case 'breathe': return ['Ton outil', 'Une minute de respiration lente calme une envie.', 'Le bouton SOS te guide pour la refaire n\'importe quand.'];
      case 'pause': return ['Tes micro-pauses', li(k.pause), 'Place-en une à chaque moment de stress ou de fatigue.'];
      case 'move': return ['Tu l\'as fait', 'Le mouvement coupe l\'envie et améliore l\'humeur.', 'Refais-le à l\'heure où l\'envie est la plus forte.'];
      case 'slot': return d.kept && d.kept.length ? ['Tes alternatives', li(d.kept), 'Quand l\'envie arrive, fais l\'une d\'elles pendant 10 minutes.'] : null;
      case 'myths': return ['À retenir', li(L(k.myths.filter(m => !m[1]).map(m => '« ' + m[0].replace(/\.$/, '') + ' » : ' + m[2]), 2)), d.score != null ? 'Score : ' + d.score + '/' + k.myths.length + '.' : ''];
      case 'pieges': return ['Tes réponses aux pièges', li(L(k.pieges.filter(q => q[1]).map(q => '« ' + q[0].replace(/\.$/, '') + ' » : ' + q[2]), 3)), 'Quand la pensée arrive, réponds-lui avec cette phrase.'];
      case 'scenario': return ['Les bons réflexes', li(k.scenarios.map(q => q.c.filter(c => c[1] === 2)[0][0])), d.score != null ? 'Score : ' + d.score + '/' + k.scenarios.length * 2 + '.' : ''];
      case 'relapse': { const v = d.v || {}; return ['Ton plan B', '<b>Dans l\'heure :</b> ' + esc(v.heure || '') + '.<br><b>Ensuite :</b> ' + esc(v.ajuster || '') + '.<br><b>Je préviens :</b> ' + esc(v.prevenir || '') + '.', 'Garde-le sous la main, même si tu n\'en as jamais besoin.']; }
      case 'planner': return d.plans && d.plans.length ? ['Tes plans', li(d.plans.map(q => q.e + ' : ' + q.a + ' · ' + q.b + ' · ' + q.c)), 'Relis-le la veille.'] : null;
      case 'calendar': { const ds = Object.keys(d.days || {}).sort(); return ds.length ? ['Tes jours à risque', li(ds.map(q => new Date(q + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + (d.days[q] ? ' : ' + d.days[q] : ''))), 'Ces jours-là, applique ton plan dès le matin.'] : null; }
      case 'message': return d.who ? ['Ton message', '« ' + esc(d.txt || '') + ' »', 'Envoie-le à ' + esc(lc(d.who)) + ' aujourd\'hui, avant ce soir.'] : null;
      case 'support': return d.sel && d.sel.length ? ['Ton réseau', li(d.sel), 'Prévins au moins une de ces personnes aujourd\'hui.'] : null;
      case 'letter': return ['Lettre scellée', 'Tu la retrouveras au jour 30.', ''];
      case 'timeline': return ['À retenir', 'Chaque jour compte : ton corps récupère à son rythme.', ''];
      case 'chase': return d.rounds ? ['Ce que tu as vu', 'Après <b>' + d.rounds + ' tours</b>, il te reste <b>' + fmt(d.bank) + ' €</b> sur 100.', 'Se refaire coûte presque toujours plus. Repense à ce graphique.'] : null;
      default: return null;
    }
  }
  const takeHTML = (type, x) => { try { const t = take(type, x); return t ? '<div class="take"><span class="kick">Ce que tu retiens</span><h3>' + esc(t[0]) + '</h3><div class="tk">' + (/^<ul>/.test(t[1]) || /<b>|<br>/.test(t[1]) ? t[1] : t[1]) + '</div>' + (t[2] ? '<p class="tkn">' + t[2] + '</p>' : '') + '</div>' : ''; } catch (e) { return ''; } };

  function mount(el, type, ctx) {
    const f = T[type]; if (!f) { el.innerHTML = ''; return; }
    const x = Object.assign({ type }, ctx); x.p = ctx.p || {};
    x.d = ctx.get() || {};
    x.put = obj => { x.d = Object.assign(x.d, obj); ctx.set(x.d); };
    x.finish = () => { if (!x.d.fin) { x.put({ fin: 1 }); confetti(70); } ctx.done(takeHTML(type, x)); };
    const old = el._cleanup; if (old) old();
    const inner = document.createElement('div'); inner.className = 'a-in'; el.innerHTML = ''; el.appendChild(inner);
    try { f(inner, x); } catch (e) { inner.innerHTML = '<p>Cette activité n\'a pas pu se charger.</p>'; if (window.console) console.error(e); }
    el._cleanup = () => { if (x.cleanup) x.cleanup(); };
  }
  const cleanup = () => { const b = document.getElementById('actbox'); if (b && b._cleanup) b._cleanup(); };
  window.LMZ_ACTS = { mount, TITLES, GOAL, confetti, takeHTML, take, cleanup };
})();
