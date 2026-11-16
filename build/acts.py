# Parcours d'activités : quelle activité interactive correspond à chaque jour, et données associées (contenu payant).
from kits import KITS
import conseils as K

BASE = ['choose', 'calc', 'balance', 'heat', 'checklist', 'pairs', 'bilan',
        'wave', 'hold', 'breathe', 'slot', 'pause', 'myths', 'bilan',
        'toolbox', 'move', 'planner', 'message', 'pieges', 'rewards', 'bilan',
        'scenario', 'relapse', 'identity', 'calendar', 'evening', 'gain', 'support', 'letter', 'final']

# écarts par programme : jour -> (type, paramètres)
OVR = {
 'jeux-d-argent': {
   9: ('hold', {'sec': 24, 't': 'Les 24 heures, version courte'}),
   11: ('chase', {}),
   12: ('checklist', {'key': 'money', 't': 'Confier la gestion de ton argent'}),
   13: ('myths', {}),
   24: ('checklist', {'key': 'steps', 't': 'Faire face aux dettes, pas à pas'}),
 },
 'vape-tabac': {
   5: ('toolbox', {'src': 'method', 'min': 1, 'max': 3, 't': 'Choisis ta méthode', 'i': 'Touche jusqu\'à 3 aides qui te conviennent. Tu peux en parler à ton pharmacien ou au 39 89.'}),
   6: ('checklist', {'key': 'env', 't': 'Préparer le terrain'}),
   7: ('checklist', {'key': 'veille', 't': 'La veille du jour J'}),
   8: ('wave', {'t': 'Jour J : surfe sur l\'envie'}),
   9: ('myths', {'t': 'Comprendre le manque'}),
   10: ('pairs', {'t': 'Les 4 D : associe chaque envie à son réflexe'}),
   11: ('slot', {'t': 'Change ta routine'}),
   12: ('pause', {}),
   13: ('planner', {'t': 'Ta prochaine soirée, sans'}),
   15: ('toolbox', {'src': 'geste', 'min': 3, 'max': 3, 't': 'Remplacer le geste', 'i': 'Choisis 3 gestes de remplacement à garder sur toi.'}),
   17: ('toolbox', {'src': 'snacks', 'min': 3, 'max': 5, 't': 'Tes collations', 'i': 'Choisis ce que tu auras sous la main quand l\'envie de grignoter arrive.'}),
   18: ('message', {}),
   20: ('rewards', {}),
   24: ('timeline', {}),
 },
 'cannabis': {
   24: ('timeline', {}),
 },
}

EXTRA = {
 'jeux-d-argent': {
   'money': ['Mettre en place un virement d\'épargne le jour de la paie', 'Fixer un plafond de retrait hebdomadaire', 'Confier une carte à un proche', 'Demander l\'interdiction volontaire de jeux (ANJ)', 'Supprimer les moyens de paiement enregistrés'],
   'steps': ['Lister toutes mes dettes et leurs montants', 'Appeler un Point Conseil Budget (gratuit)', 'Prévenir mes créanciers avant les retards', 'Établir un budget mensuel simple', 'Ne contracter aucun nouveau crédit', 'Appeler Joueurs info service : 09 74 75 13 13'],
 },
 'vape-tabac': {
   'method': ['Patch nicotinique', 'Gommes ou pastilles', 'Rendez-vous avec mon pharmacien', 'Rendez-vous avec mon médecin', 'Appeler Tabac info service (39 89)', 'Sans substitut, avec mon plan'],
   'veille': ['Relire mon pourquoi', 'Jeter ou donner mon matériel', 'Préparer chewing-gums, eau et collations', 'Prévenir 2 personnes', 'Fixer mon heure de coucher', 'Choisir mon premier geste de remplacement'],
   'geste': ['Chewing-gum', 'Cure-dent', 'Verre d\'eau', 'Bâtonnet de cannelle', 'Balle antistress', 'Crayon dans les doigts'],
   'snacks': ['Fruits', 'Carottes', 'Noix', 'Yaourt', 'Pommes', 'Tisane'],
   'timeline': [['20 minutes', 'La fréquence cardiaque et la tension commencent à redescendre.'], ['24 heures', 'Le monoxyde de carbone quitte progressivement le sang.'], ['2 à 3 jours', 'Le goût et l\'odorat reviennent peu à peu.'], ['2 à 4 semaines', 'Beaucoup de personnes respirent plus facilement et toussent moins.'], ['1 à 3 mois', 'Le souffle et l\'énergie s\'améliorent souvent nettement.'], ['1 an', 'Le risque de maladie cardiaque diminue fortement par rapport à un fumeur.']],
 },
 'cannabis': {
   'timeline': [['1 à 3 jours', 'Les premières envies, de l\'irritabilité, une nuit plus agitée : c\'est fréquent.'], ['1 à 2 semaines', 'Rêves plus intenses, sommeil perturbé, humeur en dents de scie : ça se stabilise souvent.'], ['2 à 4 semaines', 'Beaucoup de personnes retrouvent des nuits plus profondes et plus d\'énergie.'], ['1 à 2 mois', 'La concentration et la motivation reviennent souvent peu à peu.'], ['Au fil des mois', 'Ton argent, ton temps et ton énergie sont à toi.']],
 },
}

KEEP = {1, 2, 4, 6, 8, 9, 10, 11, 13, 16, 19, 22, 23, 26, 29, 30}
KEEP_PLUS = {'vape-tabac': {5, 24}, 'cannabis': {24}}

def _fill(t, s):
    return t.replace('{h}', K.H[s]).replace('{aide}', K.AIDE[s])

def package(p):
    s = p['slug']
    kit = dict(KITS[s]); kit.update(EXTRA.get(s, {}))
    keep = KEEP | KEEP_PLUS.get(s, set())
    days = []
    for i, d in enumerate(p['jours']):
        n = i + 1
        t, prm = OVR.get(s, {}).get(n, (BASE[i], {}))
        if n not in keep:
            t, prm = None, {}
        q, opts = K.QA[i]
        days.append([d[0], d[1], d[2], t, prm,
                     {'q': _fill(q, s), 'm': 1 if n in K.MULTI else 0, 'o': [[_fill(c, s), _fill(x, s)] for c, x in opts]},
                     list(K.PHYSIO[s][i])])
    return {'kit': kit, 'days': days}
