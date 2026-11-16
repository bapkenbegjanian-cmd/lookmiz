/* Lookmiz : état (sur l'appareil), accès aux jours, paiement. */
(function () {
  'use strict';
  const FN = 'https://ctgjnpxdaqdnrcxjwnkp.supabase.co/functions/v1/paiement-', KEY = 'sb_publishable_mz--wiLicR1GMDd2b3Fd2g_ewLTbr9h', LS = 'lmz2';
  const META = window.LMZ_META || { progs: [], semaines: [], prix: { prog: 9.99, pack: 19.99 }, aides: {}, v: '0' };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let S; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch (_) { S = {}; }
  ['start', 'done', 'streak', 'best', 'envies', 'notes', 'act'].forEach(k => { S[k] = S[k] || {}; }); S.sids = S.sids || [];
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (_) {} };
  const call = async body => {
    const r = await fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY }, body: JSON.stringify(body) });
    return r.json();
  };
  const euro = n => n.toFixed(2).replace('.', ',') + ' €';

  const IC = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    life: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M5.6 5.6l3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9"/></svg>',
    screen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.6"/><path d="M11 18.5h2"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    dice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/></svg>',
    city: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V10l5-2v13M8 21V5l7-2v18M15 21v-9l6 2v7M2 21h20M11 8h1M11 12h1M11 16h1"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h10.5a2.5 2.5 0 1 0-2.5-2.5M3 14h14a2.5 2.5 0 1 1-2.5 2.5M3 19h6"/></svg>'
  };

  /* accès : les sessions de paiement sont vérifiées auprès de Stripe */
  let ACC = null;
  function access(force) {
    if (ACC && !force) return ACC;
    ACC = (async () => {
      const got = new Set(); let net = true;
      for (const sid of S.sids.slice(0, 5)) {
        try {
          const d = await call({ action: 'prog_verify', sid });
          if (d && d.paid && d.prog) { if (d.prog === 'pack') META.progs.forEach(p => got.add(p.slug)); else got.add(d.prog); }
          else if (!d || d.error) net = false;
        } catch (_) { net = false; }
      }
      if (got.size) { S.paid = { progs: [...got], t: Date.now() }; save(); }
      else if (!net && S.paid && Date.now() - S.paid.t < 7 * 864e5) S.paid.progs.forEach(p => got.add(p));
      return got;
    })();
    return ACC;
  }

  /* contenu des jours : fourni par la fonction de paiement, seulement si le paiement est confirmé */
  async function days(slug) {
    S.cache = S.cache || {};
    if (S.cache[slug] && S.cache[slug].kit) return S.cache[slug];
    const d = await call({ action: 'prog_day', prog: slug, sids: S.sids });
    if (!d || !d.days || !d.kit) throw new Error((d && d.error) || 'acces');
    S.cache[slug] = { days: d.days, kit: d.kit }; save(); return S.cache[slug];
  }

  /* paiement */
  function buyHTML(slug) {
    const pack = slug === 'pack', p = META.progs.find(x => x.slug === slug), adult = pack || (p && p.adulte);
    const price = euro(pack ? META.prix.pack : META.prix.prog);
    return '<div class="buybox" data-box="' + slug + '">' +
      '<div class="price"><b>' + price + '</b><span>' + (pack ? 'les 6 programmes, paiement unique' : 'paiement unique, sans abonnement') + '</span></div>' +
      (adult ? '<label class="chk"><input type="checkbox" class="c-age"><span>J\'ai 18 ans ou plus.</span></label>' : '') +
      '<button class="btn pri full" type="button" data-buy="' + slug + '">' + (pack ? 'Débloquer les 6 programmes' : 'Débloquer les 30 jours') + ' · ' + price + '</button>' +
      '<p class="buymsg" role="alert"></p>' +
      '<p class="mut" style="font-size:13.5px">Paiement sécurisé par Stripe. <a href="/cgv.html">Conditions de vente</a>.</p></div>';
  }
  async function buy(slug, box) {
    const msg = box.querySelector('.buymsg'), age = box.querySelector('.c-age'), btn = box.querySelector('[data-buy]');
    msg.textContent = '';
    if (age && !age.checked) { msg.textContent = 'Ce contenu est réservé aux personnes majeures.'; return; }
    btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = 'Ouverture du paiement…';
    try {
      const d = await call({ action: 'prog_checkout', prog: slug });
      if (!d.url) throw new Error(d.error || 'erreur');
      location.href = d.url;
    } catch (_) { msg.textContent = 'Le paiement n\'a pas pu s\'ouvrir. Réessaie dans un instant.'; btn.disabled = false; btn.textContent = btn.dataset.t; }
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-buy]'); if (b) buy(b.dataset.buy, b.closest('.buybox')); });
  document.querySelectorAll('[data-buybox]').forEach(el => { el.innerHTML = buyHTML(el.dataset.buybox); });

  const streakInfo = slug => { const t = S.streak[slug]; if (!t) return null; const ms = Math.max(0, Date.now() - t); return { d: Math.floor(ms / 864e5), h: Math.floor(ms % 864e5 / 36e5), ms }; };

  const top = document.querySelector('.top');
  if (top) { const f = () => top.classList.toggle('on', scrollY > 6); addEventListener('scroll', f, { passive: true }); f(); }

  window.LMZ = { S, save, esc, call, access, days, buyHTML, euro, streakInfo, META, IC };
})();
