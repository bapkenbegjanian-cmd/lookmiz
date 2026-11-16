/* Lookmiz : espace personnel (suivi, jours, bouton SOS). Tout reste sur l'appareil. */
(function () {
  'use strict';
  const L = window.LMZ, S = L.S, esc = L.esc, META = L.META, IC = L.IC, root = document.getElementById('app');
  const prog = slug => META.progs.find(p => p.slug === slug);
  const free = 3, TOTAL = 30;
  let ACCESS = new Set(), verified = !S.sids.length, banner = '';
  const has = slug => ACCESS.has(slug);
  const dnum = slug => (S.done[slug] || []).length;
  const week = n => Math.min(3, Math.floor((n - 1) / 7));
  const link = () => (S.sids.length ? location.origin + '/app/?achat=1&sid=' + S.sids[S.sids.length - 1] : '');

  function sosAide(p) { const a = (p && p.aides || []).map(k => META.aides[k]).filter(Boolean)[0]; return a ? '<p>Besoin de parler ? <a href="' + a[2] + '">' + esc(a[0]) + '</a> · ' + esc(a[1]) + '</p>' : ''; }

  /* ---------- accueil de l'espace ---------- */
  function home() {
    const cards = META.progs.map(p => {
      const n = dnum(p.slug), st = L.streakInfo(p.slug), started = !!S.start[p.slug] || n > 0;
      return '<a class="card pcard" href="#/p/' + p.slug + '"><div class="t"><span class="ico">' + IC[p.ico] + '</span><div><h3>' + esc(p.nom) + '</h3><span class="mut" style="font-size:14.5px">' +
        (started ? 'Jour ' + Math.min(TOTAL, n + 1) + ' sur ' + TOTAL : 'Pas encore commencé · 3 jours gratuits') + '</span></div></div>' +
        (started ? '<div class="bar2"><i style="width:' + Math.round(n / TOTAL * 100) + '%"></i></div><div class="row2"><span>' + n + ' jour' + (n > 1 ? 's' : '') + ' terminé' + (n > 1 ? 's' : '') + '</span>' + (st ? '<b style="color:var(--amber)">' + st.d + ' j sans</b>' : '<span></span>') + '</div>' : '') + '</a>';
    }).join('');
    const acc = S.sids.length
      ? '<div class="card flat" style="display:grid;gap:10px"><h3>Mon accès</h3><p class="mut" style="font-size:15px">Garde ce lien pour retrouver ton accès sur un autre téléphone.</p><input class="note" style="min-height:0;height:46px;padding:0 14px" readonly id="lk" value="' + esc(link()) + '"><button class="btn ghost sm" id="cp" type="button" style="width:max-content">Copier le lien</button></div>'
      : '<div class="card flat" style="display:grid;gap:10px"><h3>J\'ai déjà acheté</h3><p class="mut" style="font-size:15px">Colle le lien reçu après ton paiement pour retrouver ton accès.</p><input class="note" style="min-height:0;height:46px;padding:0 14px" id="rs" placeholder="https://lookmiz.com/app/?achat=1&sid=…"><button class="btn ghost sm" id="rb" type="button" style="width:max-content">Retrouver mon accès</button><p class="buymsg" id="rm"></p></div>';
    root.innerHTML = '<div class="app wrap">' + banner + '<div><span class="kick">Mon espace</span><h1>Un jour à la fois.</h1></div>' +
      '<a class="bigsos" href="#/sos">' + IC.life + '<div><b>SOS : j\'ai une envie</b><span>10 minutes guidées pour la laisser passer</span></div></a>' +
      '<div class="grid c2">' + cards + '</div>' + acc +
      '<div class="notice help"><h3>Besoin d\'aide maintenant ?</h3><div class="num"><a href="tel:3114">3114</a><span>Prévention du suicide, 24h/24, gratuit</span></div></div></div>';
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
    let html = '<div class="app wrap"><a class="crumb" href="#/">' + IC.back + ' Mon espace</a><div><span class="kick">' + esc(p.nom) + '</span><h1>' + esc(p.titre) + '</h1></div>';
    html += '<div class="card streak-c">' + (st
      ? '<span class="kick">Jours sans</span><div class="n">' + st.d + '<small>jour' + (st.d > 1 ? 's' : '') + (st.d < 30 ? ' · ' + st.h + ' h' : '') + '</small></div><div class="stats"><div><b>' + (S.envies[slug] || 0) + '</b><span>envies surmontées</span></div><div><b>' + n + '</b><span>jours faits</span></div><div><b>' + Math.max(st.d, S.best[slug] || 0) + '</b><span>record</span></div></div><button class="btn ghost sm" id="rech" type="button" style="width:max-content">J\'ai rechuté</button><div id="rc"></div>'
      : '<span class="kick">Compteur de jours sans</span><p class="mut">Lance ton compteur le jour où tu commences à tenir. Il reste sur ton téléphone.</p><button class="btn pri" id="go" type="button">Lancer mon compteur</button>') + '</div>';
    html += '<a class="bigsos" href="#/sos/' + slug + '">' + IC.life + '<div><b>SOS : j\'ai une envie</b><span>10 minutes guidées</span></div></a>';
    html += '<div class="actrow"><a class="btn pri" href="#/p/' + slug + '/' + nextDay + '">' + (n ? 'Continuer : jour ' + nextDay : 'Commencer le jour 1') + IC.arrow + '</a></div>';
    html += '<div class="card dlist" style="padding:6px 18px 10px">';
    p.titres.forEach((t, i) => {
      const d = i + 1, done = (S.done[slug] || []).includes(d), locked = d > free && !acc;
      if (i % 7 === 0 && i < 28) html += '<div class="wk">Semaine ' + (i / 7 + 1) + ' · ' + esc(META.semaines[i / 7]) + '</div>';
      html += '<a class="drow' + (done ? ' done' : '') + (d === nextDay && !done ? ' next' : '') + '" href="#/p/' + slug + '/' + d + '"><span class="no">' + (done ? IC.check.replace('<svg', '<svg width="16" height="16"') : d) + '</span><span>' + esc(t) + (d <= free ? '<small>Gratuit</small>' : '') + '</span>' + (locked ? IC.lock : IC.arrow) + '</a>';
    });
    html += '</div>';
    if (!acc && verified) html += '<div class="card"><h3>Débloquer les jours 4 à 30</h3><p class="mut" style="margin:8px 0 16px">Les 3 premiers jours sont gratuits. Le reste est réservé.</p><div data-x="buy"></div></div>';
    root.innerHTML = html + '</div>';
    const b = root.querySelector('[data-x="buy"]'); if (b) b.innerHTML = L.buyHTML(slug);
    const go = document.getElementById('go'); if (go) go.onclick = () => { S.streak[slug] = Date.now(); L.save(); programme(slug); };
    const r = document.getElementById('rech'); if (r) r.onclick = () => {
      document.getElementById('rc').innerHTML = '<div class="confirm"><b>Ce n\'est pas un échec, c\'est une information.</b><span class="mut">Ton record est gardé. Tu repars de zéro, avec ce que tu as appris. Qu\'est-ce qui a déclenché l\'envie ? Note-le dans ton prochain jour.</span><div class="acts"><button class="btn pri sm" id="ok" type="button">Relancer mon compteur</button><button class="btn ghost sm" id="no" type="button">Annuler</button></div></div>';
      document.getElementById('no').onclick = () => { document.getElementById('rc').innerHTML = ''; };
      document.getElementById('ok').onclick = () => { const s = L.streakInfo(slug); S.best[slug] = Math.max(S.best[slug] || 0, s ? s.d : 0); S.streak[slug] = Date.now(); L.save(); programme(slug); };
    };
  }

  /* ---------- un jour ---------- */
  async function day(slug, n) {
    const p = prog(slug); if (!p || n < 1 || n > TOTAL) return home();
    if (!S.start[slug]) { S.start[slug] = new Date().toISOString().slice(0, 10); } S.last = slug; L.save();
    const needs = n > free;
    if (needs && !verified) { root.innerHTML = '<div class="app wrap"><p class="mut">Vérification de ton accès…</p></div>'; return; }
    const head = '<a class="crumb" href="#/p/' + slug + '">' + IC.back + ' ' + esc(p.nom) + '</a>';
    if (needs && !has(slug)) {
      root.innerHTML = '<div class="app wrap">' + head + '<div class="card lock"><span class="ico">' + IC.lock + '</span><span class="kick">Semaine ' + (week(n) + 1) + ' · Jour ' + n + '</span><h2 style="font-size:30px">' + esc(p.titres[n - 1]) + '</h2><p class="mut" style="max-width:44ch">Les 3 premiers jours sont gratuits. Pour continuer, débloque les 30 jours. Un paiement, pas d\'abonnement.</p><div data-x="buy"></div></div></div>';
      root.querySelector('[data-x="buy"]').outerHTML = L.buyHTML(slug); return;
    }
    root.innerHTML = '<div class="app wrap">' + head + '<p class="mut">Chargement…</p></div>';
    let list; try { list = await L.days(slug, needs); } catch (_) { root.innerHTML = '<div class="app wrap">' + head + '<p>Impossible de charger ce jour. Vérifie ta connexion et réessaie.</p></div>'; return; }
    const d = list[n - 1], done = (S.done[slug] || []).includes(n), key = slug + ':' + n;
    root.innerHTML = '<div class="app wrap day">' + head + '<div><span class="kick">Semaine ' + (week(n) + 1) + ' · ' + esc(META.semaines[week(n)]) + ' · Jour ' + n + ' sur ' + TOTAL + '</span><h1>' + esc(d[0]) + '</h1></div>' +
      '<p class="tx">' + esc(d[1]) + '</p><div class="ex"><b>Ton exercice du jour</b><p>' + esc(d[2]) + '</p></div>' +
      '<div style="display:grid;gap:8px"><label for="nt" class="mut" style="font-size:14.5px">Tes notes. Elles restent sur ton téléphone.</label><textarea id="nt" class="note" placeholder="Écris ici…">' + esc(S.notes[key] || '') + '</textarea></div>' +
      '<div class="acts"><button class="btn ' + (done ? 'ghost' : 'pri') + '" id="dn" type="button">' + (done ? 'Fait ' : 'Marquer comme fait') + (done ? IC.check.replace('<svg', '<svg width="18" height="18"') : '') + '</button>' +
      (n < TOTAL ? '<a class="btn ghost" href="#/p/' + slug + '/' + (n + 1) + '">Jour suivant' + IC.arrow + '</a>' : '') + '</div>' +
      '<div class="nav2">' + (n > 1 ? '<a class="crumb" href="#/p/' + slug + '/' + (n - 1) + '">' + IC.back + ' Jour ' + (n - 1) + '</a>' : '<span></span>') + '<a class="crumb" href="#/sos/' + slug + '">SOS ' + IC.life.replace('<svg', '<svg width="16" height="16"') + '</a></div></div>';
    let t; document.getElementById('nt').oninput = e => { clearTimeout(t); t = setTimeout(() => { S.notes[key] = e.target.value; L.save(); }, 400); };
    document.getElementById('dn').onclick = () => {
      const a = S.done[slug] = S.done[slug] || [], i = a.indexOf(n);
      if (i < 0) { a.push(n); } else { a.splice(i, 1); } L.save();
      if (i < 0 && n < TOTAL) location.hash = '#/p/' + slug + '/' + (n + 1); else day(slug, n);
    };
    scrollTo(0, 0);
  }

  /* ---------- SOS ---------- */
  let sosT = null;
  function closeSos() { clearInterval(sosT); sosT = null; const o = document.getElementById('sosov'); if (o) o.remove(); document.body.style.overflow = ''; }
  function sos(slugIn) {
    let slug = prog(slugIn) ? slugIn : (prog(S.last) ? S.last : META.progs[0].slug);
    home(); closeSos();
    const ov = document.createElement('div'); ov.id = 'sosov'; ov.className = 'sosov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Bouton SOS'); document.body.appendChild(ov); document.body.style.overflow = 'hidden';
    const x = '<button class="sosx" type="button" aria-label="Fermer" id="sx">' + IC.x + '</button>';
    const intro = () => {
      const p = prog(slug);
      ov.innerHTML = x + '<div class="sosin"><span class="kick">Pause</span><h2>L\'envie va passer.</h2><p class="lead">Tu n\'as pas à lutter. On la laisse monter, atteindre son pic et retomber, ensemble, pendant 10 minutes.</p>' +
        '<label class="mut" style="font-size:14.5px">Pour : <select class="sel" id="ss">' + META.progs.map(q => '<option value="' + q.slug + '"' + (q.slug === slug ? ' selected' : '') + '>' + esc(q.nom) + '</option>').join('') + '</select></label>' +
        '<button class="btn pri" id="st" type="button" style="min-width:240px">Commencer</button><div class="sosfoot">' + sosAide(p) + '</div></div>';
      document.getElementById('ss').onchange = e => { slug = e.target.value; intro(); };
      document.getElementById('st').onclick = run; document.getElementById('sx').onclick = () => { closeSos(); location.hash = '#/'; };
    };
    const run = () => {
      const p = prog(slug), t0 = Date.now(), DUR = 600000, tips = p.sos; let last = -1;
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
      S.envies[slug] = (S.envies[slug] || 0) + 1; L.save(); const p = prog(slug);
      ov.innerHTML = x + '<div class="sosin"><span class="kick">Bravo</span><h2>Tu l\'as laissée passer.</h2><p class="lead">Une envie de plus surmontée. Tu en es à <b style="color:var(--ink)">' + S.envies[slug] + '</b> sur ce programme. Chaque envie qui passe rend la suivante plus facile.</p>' +
        '<div class="acts" style="justify-content:center"><button class="btn pri" id="bk" type="button">Retour à mon espace</button><button class="btn ghost" id="rp" type="button">Encore 10 minutes</button></div>' +
        '<p class="mut" style="font-size:14.5px;max-width:42ch">Et si tu as craqué, ce n\'est pas la fin : reprends demain, sans te punir.</p><div class="sosfoot">' + sosAide(p) + '</div></div>';
      document.getElementById('sx').onclick = document.getElementById('bk').onclick = () => { closeSos(); location.hash = '#/'; };
      document.getElementById('rp').onclick = run;
    };
    intro();
  }

  /* ---------- routage ---------- */
  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    if (parts[0] !== 'sos') closeSos();
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
