/* Lookmiz : espace personnel (suivi, jours, bouton SOS). Tout reste sur l'appareil. */
(function () {
  'use strict';
  const L = window.LMZ, S = L.S, esc = L.esc, META = L.META, IC = L.IC, root = document.getElementById('app');
  const prog = slug => META.progs.find(p => p.slug === slug);
  const TOTAL = 30;
  let ACCESS = META.open ? new Set(META.progs.map(p => p.slug)) : new Set(), verified = !S.sids.length, banner = '';
  const has = slug => ACCESS.has(slug);
  const dnum = slug => (S.done[slug] || []).length;
  const week = n => Math.min(3, Math.floor((n - 1) / 7));
  const link = () => (S.sids.length ? location.origin + '/app/?achat=1&sid=' + S.sids[S.sids.length - 1] : '');

  function why(slug) { const a = (S.act[slug || S.last] || {})[1]; return a && a.sel && a.sel.length ? '<div class="whybox"><span class="kick">Ton pourquoi</span><p>' + a.sel.map(esc).join(' · ') + '</p></div>' : ''; }
  const GEN = ['Pose ce que tu as en main et arrête ce que tu étais en train de faire.', 'Où sens-tu l\'envie dans ton corps ? Nomme-la, sans la combattre.', 'Bois un verre d\'eau, lentement.', 'Change de pièce ou sors prendre l\'air.', 'L\'envie monte, atteint un pic, puis retombe. Tu es en train de la laisser passer.', 'Qu\'est-ce que tu cherches vraiment en ce moment : te détendre, t\'occuper, ne pas être seul ?', 'Souviens-toi de ton pourquoi. Relis-le.', 'Envoie un message à quelqu\'un, même juste « salut ».'];
  function sosAide(p) { const a = (p ? p.aides || [] : ['3114']).map(k => META.aides[k]).filter(Boolean)[0]; return a ? '<p>Besoin de parler ? <a href="' + a[2] + '">' + esc(a[0]) + '</a> · ' + esc(a[1]) + '</p>' : ''; }

  /* ---------- accueil de l'espace ---------- */
  function home() {
    const cards = META.progs.map(p => {
      const n = dnum(p.slug), started = n > 0 || !!S.start[p.slug];
      return '<a class="card pcard" href="#/p/' + p.slug + '"><div class="cov">' + (window.LMZ_ART ? window.LMZ_ART.cover(p.slug, false) : '') + '</div><div class="pc"><h3>' + esc(p.nom) + '</h3>' +
        (started ? '<div class="bar2"><i style="width:' + Math.round(n / TOTAL * 100) + '%"></i></div><span class="mut" style="font-size:14px">Jour ' + Math.min(TOTAL, n + 1) + ' sur ' + TOTAL + '</span>' : '<span class="mut" style="font-size:14px">30 jours</span>') + '</div></a>';
    }).join('');
    const acc = META.open ? '' : S.sids.length
      ? '<div class="card flat" style="display:grid;gap:10px"><h3>Mon accès</h3><p class="mut" style="font-size:15px">Garde ce lien pour retrouver ton accès sur un autre téléphone.</p><input class="note" style="min-height:0;height:46px;padding:0 14px" readonly id="lk" value="' + esc(link()) + '"><button class="btn ghost sm" id="cp" type="button" style="width:max-content">Copier le lien</button></div>'
      : '<div class="card flat" style="display:grid;gap:10px"><h3>J\'ai déjà acheté</h3><p class="mut" style="font-size:15px">Colle le lien reçu après ton paiement pour retrouver ton accès.</p><input class="note" style="min-height:0;height:46px;padding:0 14px" id="rs" placeholder="https://lookmiz.com/app/?achat=1&sid=…"><button class="btn ghost sm" id="rb" type="button" style="width:max-content">Retrouver mon accès</button><p class="buymsg" id="rm"></p></div>';
    root.innerHTML = '<div class="app wrap">' + banner + '<div class="grid c2 pgrid">' + cards + '</div>' + acc + '</div>';
    const cp = document.getElementById('cp'); if (cp) cp.onclick = async () => { const i = document.getElementById('lk'); try { await navigator.clipboard.writeText(i.value); cp.textContent = 'Copié'; } catch (_) { i.select(); } };
    const rb = document.getElementById('rb'); if (rb) rb.onclick = async () => {
      const m = (document.getElementById('rs').value.match(/cs_[A-Za-z0-9_]+/) || [])[0], msg = document.getElementById('rm');
      if (!m) { msg.textContent = 'Lien non reconnu.'; return; }
      if (!S.sids.includes(m)) S.sids.push(m); L.save(); msg.textContent = 'Vérification…'; verified = false;
      ACCESS = await L.access(true); verified = true; route();
    };
  }

  /* ---------- un programme ---------- */
  function programme(slug) {
    const p = prog(slug), n = dnum(slug), st = L.streakInfo(slug), acc = has(slug), nextDay = Math.min(TOTAL, n + 1);
    let html = '<div class="app wrap"><a class="crumb" href="#/">' + IC.back + ' Retour</a><div class="banner">' + (window.LMZ_ART ? window.LMZ_ART.cover(slug, true) : '') + '</div><h1>' + esc(p.nom) + '</h1>';
    if (!acc) {
      html += (verified ? '<div class="card" style="display:grid;gap:14px"><h3>Débloquer les 30 jours</h3><div data-x="buy"></div></div>' : '<p class="mut">Vérification de ton accès…</p>') + '</div>';
      root.innerHTML = html;
      const b0 = root.querySelector('[data-x="buy"]'); if (b0) b0.outerHTML = L.buyHTML(slug);
      return;
    }
    html += '<div class="bar2"><i style="width:' + Math.round(n / TOTAL * 100) + '%"></i></div>';
    const mynotes = Object.keys(S.notes).filter(k => k.indexOf(slug + ':') === 0 && (S.notes[k] || '').trim()).map(k => +k.split(':')[1]).sort((a, b) => a - b);
    html += '<a class="btn pri full xl" href="#/p/' + slug + '/' + nextDay + '">' + (n ? 'Continuer : jour ' + nextDay : 'Commencer le jour 1') + IC.arrow + '</a>';
    html += '<div class="card streak-c">' + (st
      ? '<div class="n">' + st.d + '<small>jour' + (st.d > 1 ? 's' : '') + ' sans</small></div><button class="btn ghost sm" id="rech" type="button" style="width:max-content">J\'ai rechuté</button><div id="rc"></div>'
      : '<button class="btn ghost" id="go" type="button">Lancer mon compteur de jours sans</button>') + '</div></div>';
    if (mynotes.length) html = html.replace(/<\/div>$/, '') + '<details class="notes card"><summary>Mes notes (' + mynotes.length + ')</summary>' + mynotes.map(k => '<div class="recap"><b>Jour ' + k + '</b><p class="rn">' + esc(S.notes[slug + ':' + k]).replace(/\n/g, '<br>') + '</p></div>').join('') + '</details></div>';
    root.innerHTML = html;
    const go = document.getElementById('go'); if (go) go.onclick = () => { S.streak[slug] = Date.now(); L.save(); programme(slug); };
    const r = document.getElementById('rech'); if (r) r.onclick = () => {
      document.getElementById('rc').innerHTML = '<div class="confirm"><b>Ce n\'est pas un échec, c\'est une information.</b><span class="mut">Ton record est gardé. Tu repars de zéro.</span><div class="acts"><button class="btn pri sm" id="ok" type="button">Relancer mon compteur</button><button class="btn ghost sm" id="no" type="button">Annuler</button></div></div>';
      document.getElementById('no').onclick = () => { document.getElementById('rc').innerHTML = ''; };
      document.getElementById('ok').onclick = () => { const s2 = L.streakInfo(slug); S.best[slug] = Math.max(S.best[slug] || 0, s2 ? s2.d : 0); S.streak[slug] = Date.now(); L.save(); programme(slug); };
    };
  }

  /* ---------- un jour ---------- */
  async function day(slug, n) {
    const p = prog(slug); if (!p || n < 1 || n > TOTAL) return home();
    if (!S.start[slug]) { S.start[slug] = new Date().toISOString().slice(0, 10); } S.last = slug; L.save();
    const needs = true;
    if (needs && !verified) { root.innerHTML = '<div class="app wrap"><p class="mut">Vérification de ton accès…</p></div>'; return; }
    const head = '<a class="crumb" href="#/p/' + slug + '">' + IC.back + ' ' + esc(p.nom) + '</a>';
    if (needs && !has(slug)) {
      root.innerHTML = '<div class="app wrap">' + head + '<div class="card lock"><span class="ico">' + IC.lock + '</span><span class="kick">Semaine ' + (week(n) + 1) + ' · Jour ' + n + '</span><h2 style="font-size:30px">' + esc(p.titres[n - 1]) + '</h2><p class="mut" style="max-width:44ch">Ce programme est réservé. Débloque les 30 jours : un seul paiement, pas d\'abonnement.</p><div data-x="buy"></div></div></div>';
      root.querySelector('[data-x="buy"]').outerHTML = L.buyHTML(slug); return;
    }
    root.innerHTML = '<div class="app wrap">' + head + '<p class="mut">Chargement…</p></div>';
    let pack; try { pack = await L.days(slug); } catch (_) { root.innerHTML = '<div class="app wrap">' + head + '<p>Impossible de charger ce jour. Vérifie ta connexion et réessaie.</p></div>'; return; }
    const d = pack.days[n - 1], done = (S.done[slug] || []).includes(n), key = slug + ':' + n, type = d[3], prm = d[4] || {}, Q = d[5], F = d[6], A = window.LMZ_ACTS;
    S.act[slug] = S.act[slug] || {}; const st = S.act[slug][n] = S.act[slug][n] || {};
    const steps = ['q', 'f'].concat(type ? ['a'] : [], ['m']);
    let cur = done ? 0 : Math.min(st._s || 0, steps.length - 1);
    root.innerHTML = '<div class="app wrap day">' + head + '<div class="dots" id="dots"></div><div id="stage" class="stage"></div></div>';
    const stage = () => document.getElementById('stage');
    const next = () => { cur = Math.min(cur + 1, steps.length - 1); draw(); };
    const nextBtn = (label, id) => '<button class="btn pri full" type="button" id="' + (id || 'nx') + '">' + (label || 'Suite') + IC.arrow + '</button>';
    function dots() {
      document.getElementById('dots').innerHTML = steps.map((k, i) => '<button type="button" class="dt' + (i === cur ? ' on' : i < cur ? ' ok' : '') + '" data-i="' + i + '" aria-label="Étape ' + (i + 1) + '"' + (i > cur ? ' disabled' : '') + '></button>').join('') + '<span class="mut">Jour ' + n + ' sur ' + TOTAL + '</span>';
      [].forEach.call(document.querySelectorAll('#dots .dt'), b => b.onclick = () => { cur = +b.dataset.i; draw(); });
    }
    function draw() {
      const k = steps[cur], el = stage(); st._s = cur; L.save(); dots();
      if (A && A.cleanup) A.cleanup();
      if (k === 'q') {
        const multi = !!Q.m; let sel = [].concat(st.qa == null ? [] : st.qa), ok = !!st.qv && sel.length > 0;
        const qdraw = () => {
          const opts = Q.o.map((o, i) => {
            const on = sel.includes(i); if (ok && !on) return '';
            return '<button type="button" class="qopt' + (on ? ' sel' : '') + '" data-i="' + i + '"' + (ok ? ' disabled' : '') + ' aria-pressed="' + on + '">' + (multi && !ok ? '<span class="qb' + (on ? ' on' : '') + '"></span>' : '') + esc(o[0]) + '</button>';
          }).join('');
          const tips = ok ? sel.map(i => '<div class="tip rise"><span class="kick">' + (sel.length > 1 ? esc(Q.o[i][0]) : 'Pour t\'aider') + '</span><p>' + esc(Q.o[i][1]) + '</p></div>').join('') : '';
          el.innerHTML = '<h1>' + esc(d[0]) + '</h1><p class="tx">' + esc(d[1]) + '</p><h2 class="qq">' + esc(Q.q) + '</h2>' + (multi && !ok ? '<p class="hint">Tu peux choisir plusieurs réponses.</p>' : '') +
            '<div class="qopts">' + opts + '</div><div id="qtip">' + tips +
            (ok ? nextBtn() + '<button class="btn ghost sm" type="button" id="qedit">Changer ma réponse</button>' : (multi ? '<button class="btn pri full" type="button" id="qok"' + (sel.length ? '' : ' disabled') + '>Valider' + (sel.length ? ' (' + sel.length + ')' : '') + IC.arrow + '</button>' : '')) + '</div>';
          [].forEach.call(el.querySelectorAll('.qopt'), b => b.onclick = () => {
            if (ok) return; const i = +b.dataset.i;
            if (multi) { const k2 = sel.indexOf(i); k2 >= 0 ? sel.splice(k2, 1) : sel.push(i); st.qa = sel.slice(); L.save(); qdraw(); }
            else { sel = [i]; st.qa = [i]; st.qv = 1; ok = true; L.save(); qdraw(); }
          });
          const okb = document.getElementById('qok'); if (okb) okb.onclick = () => { if (!sel.length) return; st.qa = sel.slice(); st.qv = 1; ok = true; L.save(); qdraw(); };
          const ed = document.getElementById('qedit'); if (ed) ed.onclick = () => { ok = false; st.qv = 0; L.save(); qdraw(); };
          const nx = document.getElementById('nx'); if (nx) nx.onclick = next;
        };
        qdraw();
      } else if (k === 'f') {
        el.innerHTML = '<div class="fcard"><span class="kick">Conseil du jour</span><h2>' + esc(F[0]) + '</h2><p class="ft">' + esc(F[1]) + '</p><div class="try"><b>Essaie</b><span>' + esc(F[2]) + '</span></div></div>' + nextBtn();
        document.getElementById('nx').onclick = next;
      } else if (k === 'a') {
        el.innerHTML = (A && A.GOAL[type] ? '<p class="goal"><b>Objectif</b> ' + esc(A.GOAL[type]) + '</p>' : '') + '<section class="act"><h2>' + esc(prm.t || (A && A.TITLES[type]) || 'Activité') + '</h2><div id="actbox"></div></section><div id="take"></div><div id="anx"></div>';
        const fin = html => { const tk = document.getElementById('take'); if (tk && html != null) tk.innerHTML = html; const x = document.getElementById('anx'); if (x && !x.firstChild) { x.innerHTML = nextBtn(); document.getElementById('nx').onclick = next; setTimeout(() => { const y = document.getElementById('anx'); if (y) y.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 350); } };
        if (A && st.fin) { const tk = document.getElementById('take'); if (tk) tk.innerHTML = A.takeHTML(type, { d: st, kit: pack.kit, p: prm }); fin(); }
        if (A) A.mount(document.getElementById('actbox'), type, { kit: pack.kit, p: prm, slug, n, L, prog: p, get: () => S.act[slug][n], set: v => { S.act[slug][n] = v; L.save(); }, done: fin });
      } else {
        const recap = r2 => { const dd = pack.days[r2 - 1], nt = (S.notes[slug + ':' + r2] || '').trim(), a2 = (S.act[slug] || {})[r2], tk = a2 && a2.fin && dd[3] && A ? A.takeHTML(dd[3], { d: a2, kit: pack.kit, p: dd[4] || {} }) : '';
          return '<div class="recap"><b>Jour ' + r2 + ' · ' + esc(dd[0]) + '</b>' + (nt ? '<p class="rn">' + esc(nt).replace(/\n/g, '<br>') + '</p>' : '') + tk + (!nt && !tk ? '<p class="mut">Tu n\'as rien enregistré ce jour-là.</p>' : '') + '</div>'; };
        let refs = [...new Set((d[2].match(/jour\s+(\d+)/gi) || []).map(m => +m.replace(/\D/g, '')))].filter(r2 => r2 >= 1 && r2 < n);
        if (!refs.length && /notes?\b/i.test(d[2])) { for (let q = n - 1; q >= 1 && refs.length < 3; q--) if ((S.notes[slug + ':' + q] || '').trim()) refs.push(q); refs.reverse(); }
        const why1 = /pourquoi|raisons/i.test(d[2]) && ((S.act[slug] || {})[1] || {}).sel;
        const back = (refs.length || (why1 && why1.length)) ? '<div class="recaps"><span class="kick">Ce que tu avais noté</span>' + (why1 && why1.length ? '<div class="recap"><b>Ton pourquoi (jour 1)</b><p class="rn">' + why1.map(esc).join(' · ') + '</p></div>' : '') + refs.map(recap).join('') + '</div>' : '';
        el.innerHTML = '<div class="fcard"><span class="kick">Dans ta journée</span><p class="mt">' + esc(d[2]) + '</p>' + back + '<textarea id="nt" class="note" rows="3" placeholder="Écris ici ta réponse ou ta note… (elle reste sur ton téléphone)">' + esc(S.notes[key] || '') + '</textarea></div>' +
          nextBtn(n < TOTAL ? (done ? 'Jour suivant' : 'Terminé, jour suivant') : 'Terminer le programme', 'dn');
        let t; document.getElementById('nt').oninput = e => { clearTimeout(t); t = setTimeout(() => { S.notes[key] = e.target.value; L.save(); }, 300); };
        document.getElementById('dn').onclick = () => {
          S.notes[key] = document.getElementById('nt').value; const a2 = S.done[slug] = S.done[slug] || []; if (!a2.includes(n)) a2.push(n); L.save();
          location.hash = n < TOTAL ? '#/p/' + slug + '/' + (n + 1) : '#/p/' + slug;
        };
      }
      if (cur > 0) { const bk = document.createElement('button'); bk.type = 'button'; bk.className = 'btn ghost sm backb'; bk.textContent = 'Retour'; bk.onclick = () => { cur--; draw(); }; el.appendChild(bk); }
      el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
    }
    draw(); scrollTo(0, 0);
  }

  /* ---------- SOS ---------- */
  let sosT = null;
  function closeSos() { clearInterval(sosT); sosT = null; const o = document.getElementById('sosov'); if (o) o.remove(); document.body.style.overflow = ''; }
  function sos(slugIn) {
    let slug = prog(slugIn) ? slugIn : (prog(S.last) ? S.last : '');
    home(); closeSos();
    const ov = document.createElement('div'); ov.id = 'sosov'; ov.className = 'sosov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Bouton SOS'); document.body.appendChild(ov); document.body.style.overflow = 'hidden';
    const x = '<button class="sosx" type="button" aria-label="Fermer" id="sx">' + IC.x + '</button>';
    const intro = () => {
      const p = prog(slug);
      ov.innerHTML = x + '<div class="sosin"><span class="kick">Pause</span><h2>L\'envie va passer.</h2><p class="lead">Tu n\'as pas à lutter. On la laisse monter, atteindre son pic et retomber, ensemble, pendant 10 minutes.</p>' +
        '<button class="btn pri" id="st" type="button" style="min-width:240px">Commencer</button><div class="sosfoot">' + sosAide(p) + '</div></div>';
      document.getElementById('st').onclick = run; document.getElementById('sx').onclick = () => { closeSos(); location.hash = '#/'; };
    };
    const run = () => {
      const p = prog(slug), t0 = Date.now(), DUR = 600000, tips = p ? p.sos : GEN; let last = -1;
      ov.innerHTML = x + '<div class="sosin"><span class="kick">Envie en cours</span><div class="breath"><i></i><b id="bw">Inspire</b></div><div class="clock" id="ck">10:00</div><p class="prompt" id="pr"></p>' +
        '<button class="btn ghost" id="fn" type="button">L\'envie est passée</button><div class="sosfoot">' + sosAide(p) + '</div></div>';
      document.getElementById('sx').onclick = () => { closeSos(); location.hash = '#/'; };
      document.getElementById('fn').onclick = fin;
      const tick = () => {
        const e = Date.now() - t0; if (e >= DUR) return fin();
        const r = Math.ceil((DUR - e) / 1000); document.getElementById('ck').textContent = Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0');
        document.getElementById('bw').textContent = e % 10000 < 4000 ? 'Inspire' : 'Souffle';
        const i = Math.floor(e / 35000) % tips.length; if (i !== last) { last = i; const el = document.getElementById('pr'); el.style.opacity = 0; setTimeout(() => { el.textContent = tips[i]; el.style.opacity = 1; }, last === 0 ? 0 : 300); }
      };
      clearInterval(sosT); tick(); sosT = setInterval(tick, 250);
    };
    const fin = () => {
      clearInterval(sosT); sosT = null;
      const ek = slug || 'general'; S.envies[ek] = (S.envies[ek] || 0) + 1; L.save(); const p = prog(slug);
      ov.innerHTML = x + '<div class="sosin"><span class="kick">Bravo</span><h2>Tu l\'as laissée passer.</h2><p class="lead">Une envie de plus surmontée. Tu en es à <b style="color:var(--ink)">' + S.envies[ek] + '</b>. Chaque envie qui passe rend la suivante plus facile.</p>' +
        '<div class="acts" style="justify-content:center"><button class="btn pri" id="bk" type="button">Retour à mon espace</button><button class="btn ghost" id="rp" type="button">Encore 10 minutes</button></div>' +
        why(slug) + '<p class="mut" style="font-size:14.5px;max-width:42ch">Et si tu as craqué, ce n\'est pas la fin : reprends demain, sans te punir.</p><div class="sosfoot">' + sosAide(p) + '</div></div>';
      document.getElementById('sx').onclick = document.getElementById('bk').onclick = () => { closeSos(); location.hash = '#/'; };
      document.getElementById('rp').onclick = run;
    };
    intro();
  }

  /* ---------- routage ---------- */
  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    if (parts[0] !== 'sos') closeSos();
    const ab = document.getElementById('actbox'); if (ab && ab._cleanup) ab._cleanup();
    if (parts[0] === 'sos') return sos(parts[1]);
    if (parts[0] === 'p' && prog(parts[1])) { if (parts[2]) return day(parts[1], +parts[2]); return programme(parts[1]); }
    home(); scrollTo(0, 0);
  }
  addEventListener('hashchange', route);

  (async () => {
    const q = new URLSearchParams(location.search), sid = q.get('sid');
    if (q.get('achat') && /^cs_[A-Za-z0-9_]+$/.test(sid || '')) {
      if (!S.sids.includes(sid)) { S.sids.push(sid); L.save(); } verified = false;
      history.replaceState(null, '', '/app/' + location.hash);
      banner = '<div class="ban"><b>Merci ! Ton paiement est en cours de vérification.</b><span class="mut">Ton accès apparaît dans un instant. Garde le lien de la section « Mon accès » pour le retrouver sur un autre téléphone.</span></div>';
    }
    route();
    if (S.sids.length) { ACCESS = await L.access(); verified = true; if (banner && ACCESS.size) banner = '<div class="ban"><b>Paiement confirmé, ton accès est débloqué.</b><span class="mut">Garde le lien de la section « Mon accès » pour le retrouver sur un autre téléphone.</span></div>'; route(); }
  })();
})();
