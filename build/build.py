#!/usr/bin/env python3
"""Génère le site Lookmiz (pages HTML, données des programmes, sitemap) à partir de content.py.
Usage : python3 build/build.py  (depuis la racine du dépôt)"""
import json, os, re, time, html, sys
sys.path.insert(0, os.path.dirname(__file__))
import content as C
import acts as ACTS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://lookmiz.com'
V = str(int(time.time()))
W = lambda path, txt: (os.makedirs(os.path.dirname(os.path.join(ROOT, path)), exist_ok=True), open(os.path.join(ROOT, path), 'w', encoding='utf-8').write(txt))
e = html.escape
j = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))

# icônes : une seule source (js/common.js)
_cj = open(os.path.join(ROOT, 'js/common.js'), encoding='utf-8').read()
IC = dict(re.findall(r"^\s*(\w+): '(<svg.*?</svg>)'", _cj, re.M))
def ic(name, size=None):
    s = IC[name]
    return s.replace('<svg', f'<svg width="{size}" height="{size}"', 1) if size else s

PROGS = C.PROGS
OPEN = C.OPEN
SEM = C.SEMAINES
SEM_TXT = [
    "Tu regardes ton habitude en face, sans te juger : ce qu'elle t'apporte, ce qu'elle te coûte, ce qui la déclenche.",
    "Tu apprends à laisser passer les envies : respiration, règle des 10 minutes, gestion du stress et de l'ennui.",
    "Tu remplaces l'habitude par autre chose : activités, mouvement, soutien de ton entourage, pensées-pièges.",
    "Tu prépares l'après : dérapage, plan de rechute, moments à risque, aide professionnelle.",
]
GA = '''<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "cdd9ad7e2e6f44e39d21157ecadb644e"}'></script><!-- End Cloudflare Web Analytics -->'''

def head(title, desc, path, extra='', noindex=False, jsonld=None):
    url = BASE + path
    ld = f'<script type="application/ld+json">{j(jsonld)}</script>' if jsonld else ''
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="google-site-verification" content="tPkA79ZQCeMVM4kRewvgCNKZUg0uWoztpdDwAbVpFfc">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
{'<meta name="robots" content="noindex">' if noindex else ''}
<meta property="og:type" content="website"><meta property="og:site_name" content="Lookmiz"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{url}">
<meta name="theme-color" content="#080e0d"><meta name="theme-color" content="#09100f" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,650;12..96,700&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/site.css?v={V}">
{extra}{ld}
{GA}
</head>
<body>
<a class="skip" href="#main">Aller au contenu</a>
'''

HEADER = f'''<header class="top"><div class="wrap bar">
  <a class="logo" href="/" aria-label="Lookmiz, accueil"><i></i>Lookmiz</a>
  <nav class="nav" aria-label="Navigation"><a class="lnk hide-s" href="/#programmes">Programmes</a><a class="lnk" href="/app/">Mon espace</a><a class="btn sos sm" href="/app/#/sos">{ic('life')} SOS</a></nav>
</div></header>
'''
FOOTER = f'''<footer><div class="wrap">
  <nav aria-label="Liens"><a href="/#programmes">Programmes</a><a href="/app/">Mon espace</a><a href="/mentions-legales.html">Mentions légales</a>{'' if OPEN else '<a href="/cgv.html">Conditions de vente</a>'}<a href="/confidentialite.html">Confidentialité</a></nav>
  <p class="small">Lookmiz propose des programmes d'accompagnement. Ce ne sont pas des traitements médicaux et ils ne remplacent pas l'avis d'un professionnel de santé. En cas de détresse : 3114, 24h/24, gratuit.</p>
  <p class="small">© Lookmiz</p>
</div></footer>
'''
def scripts(app=False):
    s = f'<script src="/data/meta.js?v={V}"></script>\n<script src="/js/common.js?v={V}"></script>\n'
    s += f'<script src="/js/art.js?v={V}"></script>\n'
    if app: s += f'<script src="/js/acts.js?v={V}"></script>\n<script src="/js/app.js?v={V}"></script>\n'
    return s

def help_box(keys):
    rows = ''.join(f'<div class="num"><a href="{C.AIDES[k][2]}">{e(C.AIDES[k][0])}</a><span>{e(C.AIDES[k][1])}</span></div>' for k in keys)
    return f'<div class="notice help"><h3>Besoin d\'aide maintenant ?</h3>{rows}</div>'

def faq_html(items):
    return ''.join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in items)
def faq_ld(items):
    return {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in items]}

# ---------------------------------------------------------------- données
PHOTO = {'ecrans': 'ecrans', 'pornographie': 'porno', 'jeux-d-argent': 'jeux', 'vape-tabac': 'tabac', 'cannabis': 'cannabis', 'drogues-de-soiree': 'soiree'}
meta = {'open': OPEN, 'v': V, 'semaines': SEM, 'prix': C.PRIX, 'aides': C.AIDES,
        'progs': [{'slug': p['slug'], 'nom': p['nom'], 'titre': p['titre'], 'adulte': p['adulte'], 'ico': p['ico'], 'sos': p['sos'], 'aides': p['aides'], 'titres': [d[0] for d in p['jours']]} for p in PROGS]}
W('data/meta.js', 'window.LMZ_META=' + j(meta) + ';')
if OPEN:
    for p in PROGS: W(f"data/p/{p['slug']}.json", j(ACTS.package(p)))
# fonction de paiement + contenu (collée dans Supabase), et sa page de copie
code = open(os.path.join(ROOT, 'build/paiement.tpl.ts'), encoding='utf-8').read().replace('__DAYS__', j({p['slug']: ACTS.package(p) for p in PROGS}))
W('supabase/paiement.ts', code)
_pg = open(os.path.join(ROOT, 'supabase/copier-paiement.html'), encoding='utf-8').read()
_a = _pg.index('translate="no">', _pg.index('<textarea')) + len('translate="no">'); _z = _pg.index('</textarea>')
W('supabase/copier-paiement.html', _pg[:_a] + html.escape(code) + _pg[_z:])

# ---------------------------------------------------------------- accueil
FAQ_HOME = [

 ('Est-ce un traitement médical ?', "Non. Ce sont des programmes d'accompagnement, inspirés des thérapies comportementales et de l'entretien motivationnel. Ils ne remplacent ni un médecin ni un psychologue, et ne promettent aucune guérison. Si tu as besoin d'un suivi, des lignes gratuites sont indiquées sur chaque page."),
 ('Mon suivi est-il privé ?', "Oui. Ton compteur, tes notes et ta progression restent sur ton téléphone. Nous ne les recevons pas. Il n'y a pas de compte à créer."),
 ('Comment je paie ? Y a-t-il un abonnement ?', "Un seul paiement par programme, par carte via Stripe. Pas d'abonnement, pas de renouvellement."),
 ('Je change de téléphone, je perds tout ?', "Après ton paiement, tu reçois un lien personnel à garder. Il rétablit ton accès sur un autre appareil. Ton suivi, lui, reste sur l'appareil où tu l'as fait."),
 ('Et si je rechute ?', "Un dérapage n'est pas un échec. Le programme prévoit un plan de rechute et le bouton « J'ai rechuté » garde ton record et relance ton compteur, sans jugement."),
]
FAQ_HOME = [q for q in FAQ_HOME if not OPEN or not q[0].startswith(('Comment je paie', 'Je change de téléphone'))]
PR = str(C.PRIX['prog']).replace('.', ',')
ACTS_COVER = {'ecrans': 'phone', 'pornographie': 'shield', 'jeux-d-argent': 'coins', 'vape-tabac': 'lungs', 'cannabis': 'moon', 'drogues-de-soiree': 'city'}
cards = ''.join(f'''<a class="card prog rise d{i%3}" href="{'/app/#/p/' + p['slug'] if OPEN else '/programmes/' + p['slug'] + '/'}"><div class="cov" data-cover="{p['slug']}"></div><div class="pc"><h3>{e(p['nom'])}</h3><span class="go">30 jours {ic('arrow')}</span></div></a>''' for i, p in enumerate(PROGS))
mock = ''
TILE = [('wave', "Surfer sur l'envie", "Suis ton envie 40 secondes et regarde-la monter, puis retomber."), ('hourglass', 'Tenir 30 secondes', "Maintiens le bouton pendant que les tentations défilent."), ('scale', 'La balance', "Pose ce que ça t'apporte et ce que ça te coûte, et vois de quel côté ça penche."), ('coins', 'La machine à alternatives', "Tourne la machine, garde les idées qui te parlent."), ('compass', 'Mises en situation', "Choisis ta réaction dans des scènes réelles, avec un retour à chaque réponse."), ('cloud', 'Respiration guidée', "Un cercle qui respire avec toi, pour laisser l'envie retomber.")]
TILES = ''.join(f'<div class="card flat tile"><h3>{e(t)}</h3><p>{e(d)}</p></div>' for a, t, d in TILE)
TARIFS = f'''<section id="tarifs" style="background:var(--card);border-block:1px solid var(--line)"><div class="wrap">
  <div class="sec-h"><span class="kick">Tarifs</span><h2>Un paiement, pas d'abonnement.</h2></div>
  <div class="grid c2">
    <div class="card flat" style="display:grid;gap:16px;align-content:start"><h3>Un programme</h3>
      <div class="price"><b>{str(C.PRIX['prog']).replace('.', ',')}&nbsp;€</b><span>par programme</span></div>
      <ul class="list"><li>{ic('check')}<span>30 jours guidés, avec une activité animée chaque jour</span></li><li>{ic('check')}<span>Bouton SOS, suivi, notes</span></li><li>{ic('check')}<span>Un seul paiement, pas d'abonnement</span></li></ul>
      <a class="btn ghost" href="#programmes">Choisir un programme</a></div>
    <div class="card" style="display:grid;gap:16px;align-content:start;border-color:color-mix(in srgb,var(--brand) 50%,var(--line))"><span class="tag">Meilleur prix</span><h3>Les 6 programmes</h3>
      <div data-buybox="pack"></div></div>
  </div>
</div></section>'''
home_body = f'''{HEADER}<main id="main">
<section class="start"><div class="wrap">
  <h1 class="rise">Reprends le contrôle, <em>un jour à la fois.</em></h1>
  <div class="grid c2 pgrid">{cards}</div>
</div></section>
</main>
{FOOTER}{scripts()}</body></html>'''
ld_home = {'@context': 'https://schema.org', '@graph': [
    {'@type': 'WebSite', 'name': 'Lookmiz', 'url': BASE + '/'}]}
W('index.html', head('Lookmiz : programmes de 30 jours pour reprendre le contrôle', "Écrans, pornographie, jeux d'argent, vape et tabac : des programmes de 30 jours, un petit pas par jour, un bouton SOS pour les envies. Sans jugement.", '/', jsonld=ld_home,
    extra="<script>if(/[?&](c|paye)=/.test(location.search))location.replace('/cartes/'+location.search+location.hash)</script>\n") + home_body)

# ---------------------------------------------------------------- pages programmes
for p in PROGS:
    s = p['slug']; d1 = p['jours'][0]
    OPEN_CARD = f'''  <div class="card rise d2" id="achat" style="display:grid;gap:16px;align-content:start;scroll-margin-top:80px">
    <span class="tag">30 jours · une activité par jour</span><h3>Commence maintenant</h3>
    <ul class="list"><li>{ic('check')}<span>Un jour à la fois, du jour 1 au jour 30</span></li><li>{ic('check')}<span>Bouton SOS, suivi des jours sans, notes</span></li><li>{ic('check')}<span>Ton suivi reste sur ton téléphone</span></li></ul>
    <a class="btn pri full" href="/app/#/p/{s}/1">Commencer le jour 1 {ic('arrow')}</a>
  </div>'''
    PAID_CARD = f'''  <div class="card rise d2" id="achat" style="display:grid;gap:16px;align-content:start;scroll-margin-top:80px">
    <span class="tag am">Paiement unique</span><h3>Débloquer les 30 jours</h3>
    <ul class="list"><li>{ic('check')}<span>Les 30 jours guidés</span></li><li>{ic('check')}<span>Bouton SOS, suivi des jours sans, notes</span></li><li>{ic('check')}<span>Un seul paiement, pas d'abonnement</span></li></ul>
    <div data-buybox="{s}"></div>
    <p class="mut" style="font-size:14px">Ou <a href="/#tarifs" style="text-decoration:underline">les 6 programmes pour {str(C.PRIX['pack']).replace('.', ',')} €</a>.</p>
  </div>'''
    weeks = ''.join(f'<div class="card flat step"><span class="kick" style="margin-top:2px">Semaine {i+1}</span><h3>{e(SEM[i])}</h3><p>{e(SEM_TXT[i])}</p></div>' for i in range(4))
    dl = ''
    for i, d in enumerate(p['jours']):
        if i % 7 == 0 and i < 28: dl += f'<div class="week">Semaine {i//7+1} · {e(SEM[i//7])}</div>'
        dl += f'<div><b>{i+1}</b><span>{e(d[0])}</span>{ic("lock", 16)}</div>'
    recog = ''.join(f'<li>{ic("check")}<span>{e(x)}</span></li>' for x in p['pour_qui'])
    faq = p['faq'] + ([] if OPEN else [('Combien ça coûte ?', f"{str(C.PRIX['prog']).replace('.', ',')} € une seule fois pour les 30 jours, ou {str(C.PRIX['pack']).replace('.', ',')} € pour les 6 programmes. Il n'y a pas d'abonnement.")])
    adult = ''
    body = f'''{HEADER}<main id="main">
<section class="start"><div class="wrap" style="max-width:760px;display:grid;gap:20px">
  <a class="crumb" href="/">{ic('back')} Retour</a>
  <div class="cov big" data-cover="{s}"></div>
  <h1 class="rise" style="font-size:clamp(32px,7vw,52px)">{e(p['titre'])}</h1>
  <p class="lead">{e(p['accroche'])}</p>
  {('<a class="btn pri full xl" href="/app/#/p/' + s + '/1">Commencer le jour 1 ' + ic('arrow') + '</a>') if OPEN else PAID_CARD}
  {help_box(p['aides'])}
</div></section>
</main>
{FOOTER}{scripts()}</body></html>'''
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'Course', 'name': p['titre'] + ' : programme de 30 jours', 'description': p['desc'], 'provider': {'@type': 'Organization', 'name': 'Lookmiz', 'url': BASE + '/'}, 'url': f'{BASE}/programmes/{s}/', 'inLanguage': 'fr',
         'offers': {'@type': 'Offer', 'price': str(C.PRIX['prog']), 'priceCurrency': 'EUR', 'availability': 'https://schema.org/InStock'}},
        ]}
    W(f'programmes/{s}/index.html', head(p['seo'] + ' | Lookmiz', p['desc'], f'/programmes/{s}/', jsonld=ld) + body)

# ---------------------------------------------------------------- espace
W('app/index.html', head('Mon espace | Lookmiz', 'Ton suivi, tes jours et le bouton SOS.', '/app/', noindex=True) + HEADER +
  '<main id="main"><div id="app"><noscript><div class="wrap" style="padding:40px 0"><p>Cette page a besoin de JavaScript pour fonctionner.</p></div></noscript></div></main>\n' + scripts(True) + '</body></html>')

# ---------------------------------------------------------------- pages légales (les champs à compléter sont signalés)
TD = lambda t: f'<span class="todo">[À compléter : {t}]</span>'
def doc(path, title, desc, body):
    W(path, head(title + ' | Lookmiz', desc, '/' + path, noindex=True) + HEADER + f'<main id="main"><div class="wrap doc">{body}</div></main>\n' + FOOTER + scripts() + '</body></html>')

doc('mentions-legales.html', 'Mentions légales', 'Mentions légales du site Lookmiz.', f'''<h1>Mentions légales</h1>
<h2>Éditeur du site</h2>
<p>Nom ou raison sociale : {TD("nom")}<br>Statut : {TD("auto-entrepreneur, société…")}<br>Adresse : {TD("adresse")}<br>SIRET : {TD("numéro")}<br>Adresse e-mail de contact : {TD("e-mail")}<br>Directeur de la publication : {TD("nom")}</p>
<h2>Hébergement</h2>
<p>GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (GitHub Pages).</p>
<h2>Paiement</h2>
<p>Les paiements sont traités par Stripe Payments Europe, Ltd. Lookmiz ne reçoit ni ne conserve les numéros de carte bancaire.</p>
<h2>Nature du service</h2>
<p>Lookmiz propose des programmes d'accompagnement personnel. Ce ne sont pas des traitements médicaux : ils ne remplacent pas l'avis d'un médecin ou d'un autre professionnel de santé et ne promettent aucun résultat.</p>
<h2>Propriété intellectuelle</h2>
<p>Les textes, la mise en page et les programmes sont la propriété de l'éditeur. Toute reproduction sans autorisation est interdite.</p>''')

doc('cgv.html', 'Conditions générales de vente', 'Conditions générales de vente des programmes Lookmiz.', f'''<h1>Conditions générales de vente</h1>
<p>Dernière mise à jour : {TD("date")}</p>
<h2>1. Objet</h2><p>Les présentes conditions régissent la vente en ligne des programmes numériques Lookmiz (« les programmes »), par {TD("nom de l'éditeur")} (« le vendeur »), à tout consommateur.</p>
<h2>2. Nature du service</h2><p>Les programmes sont des contenus numériques d'accompagnement : textes, exercices, outils de suivi. Ce ne sont pas des actes médicaux ni des traitements. Ils ne promettent aucun résultat et ne remplacent pas l'avis d'un professionnel de santé. Le vendeur ne peut pas être tenu responsable d'une absence de résultat.</p>
<h2>3. Prix</h2><p>Un programme : {str(C.PRIX['prog']).replace('.', ',')} € TTC. Les 6 programmes : {str(C.PRIX['pack']).replace('.', ',')} € TTC. Paiement unique, sans abonnement ni renouvellement. {TD("mention de TVA selon le statut")}</p>
<h2>4. Commande et paiement</h2><p>Le paiement s'effectue par carte bancaire via Stripe. L'accès est ouvert dès la confirmation du paiement. Un lien personnel permettant de retrouver l'accès sur un autre appareil est fourni à l'issue du paiement : le client doit le conserver.</p>
<h2>5. Droit de rétractation</h2><p>Le client dispose d'un délai de 14 jours à compter de l'achat pour se rétracter, sans avoir à se justifier, en écrivant à {TD("e-mail")}. Le vendeur le rembourse dans un délai de 14 jours à compter de sa demande, par le même moyen de paiement.</p>
<h2>6. Accompagnement</h2><p>En cas de détresse, appeler le 3114 (24h/24, gratuit).</p>
<h2>7. Données</h2><p>Voir la <a href="/confidentialite.html">politique de confidentialité</a>.</p>
<h2>8. Réclamations et médiation</h2><p>Pour toute réclamation : {TD("e-mail")}. À défaut d'accord, le client peut recourir gratuitement à un médiateur de la consommation : {TD("nom et coordonnées du médiateur")}.</p>
<h2>9. Droit applicable</h2><p>Les présentes conditions sont soumises au droit français.</p>''')

doc('confidentialite.html', 'Confidentialité', 'Politique de confidentialité de Lookmiz.', f'''<h1>Confidentialité</h1>
<h2>Ton suivi reste sur ton appareil</h2>
<p>Ton compteur de jours, tes envies surmontées, tes notes et ta progression sont enregistrés uniquement dans le navigateur de ton appareil. Lookmiz ne les reçoit pas et ne peut pas les lire. Si tu effaces les données du navigateur, ils disparaissent.</p>
<h2>Aucun compte</h2><p>Il n'y a pas de compte à créer.</p>
<h2>Paiement</h2><p>Le paiement est géré par Stripe. Lookmiz reçoit de Stripe la confirmation du paiement, le montant, le programme acheté et l'adresse e-mail saisie lors du paiement. Les numéros de carte ne sont jamais transmis à Lookmiz. L'identifiant de paiement sert à rétablir ton accès sur un autre appareil.</p>
<h2>Statistiques de visite</h2><p>Lookmiz utilise Cloudflare Web Analytics, un outil de mesure d'audience sans cookie qui ne suit pas les visiteurs d'un site à l'autre.</p>
<h2>Tes droits</h2><p>Tu peux demander l'accès, la rectification ou la suppression des données liées à ton paiement : {TD("e-mail")}.</p>
<h2>Responsable du traitement</h2><p>{TD("nom et coordonnées de l'éditeur")}</p>''')

# favicon + sitemap + robots
W('favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="10" fill="#0f5c4d"/><circle cx="16" cy="16" r="5.5" fill="#fff"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2"/></svg>')
urls = ['/', '/app/'] + [f'/programmes/{p["slug"]}/' for p in PROGS]
W('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'<url><loc>{BASE}{u}</loc></url>\n' for u in urls if u != '/app/') + '</urlset>\n')
W('robots.txt', f'User-agent: *\nAllow: /\nDisallow: /app/\nSitemap: {BASE}/sitemap.xml\n')
W('.nojekyll', '')
print('ok', V)
