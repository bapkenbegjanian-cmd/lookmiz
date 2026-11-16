/* Lookmiz : couvertures des programmes (illustrations unDraw, licence MIT). */
(function () {
  'use strict';
  const BG = { ecrans: '#d9f0ea', pornographie: '#e5e3fb', 'jeux-d-argent': '#fbecc9', 'vape-tabac': '#d8ebfb', cannabis: '#e0eed7', 'drogues-de-soiree': '#fbdcdc' };
  const cover = slug => '<span class="ill" style="background:' + (BG[slug] || '#e8f1ee') + '"><img src="/img/' + slug + '.svg" alt="" loading="lazy" decoding="async"></span>';
  window.LMZ_ART = { cover };
  const fill = () => document.querySelectorAll('[data-cover]').forEach(el => { if (!el.firstChild) el.innerHTML = cover(el.dataset.cover); });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fill) : fill();
})();
