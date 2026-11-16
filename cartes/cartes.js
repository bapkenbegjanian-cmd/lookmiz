/* Catalogue de Lookmiz : catégories, occasions et modèles de cartes.
   Chaque modèle combine une palette, une police, un motif et une animation.
   Les champs « inv » (invitation) demandent date, lieu et réponses ; les vœux non. */

const FONTS = {
  script: '"Great Vibes", cursive', serif: '"Playfair Display", Georgia, serif', royal: '"Cinzel", Georgia, serif',
  fun: '"Fredoka", "Arial Rounded MT Bold", sans-serif', brush: '"Pacifico", cursive', arab: '"Amiri", Georgia, serif'
};

// palettes : fond (dégradé), encre, accent, papier de l'enveloppe
const PAL = {
  champagne: ['#f3ebdf', '#33281a', '#a6803c', '#efe5d4'],
  nuit: ['#151a32', '#f2ead9', '#d6b46a', '#1f2645'],
  rose: ['#f5e3e5', '#4e2330', '#b4566d', '#f2d9dd'],
  sauge: ['#e5eae0', '#2a3527', '#647d58', '#dce3d4'],
  bordeaux: ['#4a1320', '#f5e6d6', '#d4a85f', '#3f101b'],
  marine: ['#14253d', '#eef2f7', '#a9c1dd', '#1a2d49'],
  pastel: ['#eeeaf6', '#38324f', '#8a74d2', '#e7e1f3'],
  soleil: ['#fae8c8', '#47290a', '#d27c2a', '#f5dcb2'],
  menthe: ['#e2f1e9', '#15382c', '#2e8f6f', '#d5eadf'],
  lavande: ['#ebe5f4', '#2e2650', '#7660c4', '#e1d9f0'],
  noel: ['#7a1a22', '#fbf0e3', '#e2b65c', '#6a161d'],
  sapin: ['#173a2a', '#f3eee0', '#d4ab58', '#13311f'],
  neige: ['#e9f0f7', '#19314f', '#4a79c0', '#e0e9f4'],
  or: ['#16130f', '#f1e3c3', '#cfa857', '#201c16'],
  emeraude: ['#0f3c32', '#f1e8d2', '#d2af63', '#0c342b'],
  corail: ['#f7e2db', '#55241a', '#cf5f3f', '#f3d6cc'],
  ciel: ['#e3eff9', '#13344f', '#3b84c6', '#d8e8f5'],
  bebe: ['#f6edf1', '#3b4560', '#d2879f', '#f1e3ea'],
  violet: ['#2a1245', '#f3ebfb', '#c2a0ec', '#220a3a'],
  terracotta: ['#f1e0d4', '#48230f', '#b25a33', '#ebd2c1']
};
// les six mises en page de carte (une par modèle d'une même occasion)
const STYLES = ['cadre', 'arche', 'monogramme', 'deco', 'botanique', 'moderne'];

// animations disponibles (dessinées sur un canvas dans la carte)
// confettis, neige, coeurs, etoiles, petales, ballons, lanternes, feux, bulles, paillettes

const CATS = [
  { id: 'inv', nom: 'Invitations', sous: 'Anniversaire, mariage, baptême, soirée…' },
  { id: 'voeux', nom: 'Vœux & souhaits', sous: 'Noël, anniversaire, Aïd, Saint-Valentin…' }
];

// occasion : id, catégorie, nom, emoji, titre par défaut, message par défaut, motifs, modèles [palette, police, animation, nom]
const OCC = [
  { id: 'anniversaire', cat: 'inv', nom: 'Anniversaire', emo: '🎂', titre: 'Tu es invité·e à mon anniversaire', msg: 'Viens fêter ça avec nous, on compte sur toi !', motif: ['🎈', '🎉', '✨'],
    modeles: [['pastel', 'fun', 'ballons', 'Ballons pastel'], ['nuit', 'royal', 'feux', 'Nuit étoilée'], ['soleil', 'brush', 'confettis', 'Fiesta'], ['rose', 'script', 'paillettes', 'Rose & or'], ['or', 'serif', 'paillettes', 'Noir & or'], ['menthe', 'fun', 'confettis', 'Fraîcheur']] },
  { id: 'anniversaire-enfant', cat: 'inv', nom: 'Anniversaire enfant', emo: '🧸', titre: 'Viens à ma fête !', msg: 'Gâteau, jeux et surprises : on t\'attend !', motif: ['🎈', '🧁', '🦄'],
    modeles: [['pastel', 'fun', 'ballons', 'Licorne'], ['ciel', 'fun', 'bulles', 'Bulles'], ['soleil', 'fun', 'confettis', 'Super-héros'], ['menthe', 'fun', 'ballons', 'Jungle'], ['rose', 'fun', 'coeurs', 'Princesse'], ['corail', 'fun', 'confettis', 'Pirate']] },
  { id: 'mariage', cat: 'inv', nom: 'Mariage', emo: '💍', titre: 'Nous nous marions', msg: 'Nous serions heureux de partager ce jour avec vous.', motif: ['💍', '🌿', '🤍'],
    modeles: [['champagne', 'script', 'petales', 'Champagne'], ['sauge', 'script', 'petales', 'Eucalyptus'], ['bordeaux', 'royal', 'paillettes', 'Bordeaux royal'], ['or', 'royal', 'paillettes', 'Noir & or'], ['rose', 'script', 'coeurs', 'Romance'], ['emeraude', 'serif', 'paillettes', 'Émeraude']] },
  { id: 'fiancailles', cat: 'inv', nom: 'Fiançailles', emo: '💞', titre: 'Nos fiançailles', msg: 'Venez célébrer notre promesse avec nous.', motif: ['💞', '🥂', '✨'],
    modeles: [['rose', 'script', 'coeurs', 'Rose poudré'], ['champagne', 'script', 'paillettes', 'Champagne'], ['lavande', 'serif', 'petales', 'Lavande'], ['bordeaux', 'script', 'coeurs', 'Passion'], ['nuit', 'royal', 'etoiles', 'Sous les étoiles'], ['sauge', 'serif', 'petales', 'Bohème']] },
  { id: 'henne', cat: 'inv', nom: 'Henné', emo: '🌙', titre: 'Soirée henné', msg: 'Une soirée de musique, de danse et de traditions. Vous êtes les bienvenus.', motif: ['🌙', '✨', '🌸'],
    modeles: [['emeraude', 'arab', 'lanternes', 'Émeraude & or'], ['bordeaux', 'arab', 'paillettes', 'Velours rouge'], ['or', 'arab', 'lanternes', 'Mille et une nuits'], ['violet', 'arab', 'etoiles', 'Nuit violette'], ['terracotta', 'arab', 'petales', 'Terre cuite'], ['champagne', 'arab', 'paillettes', 'Doré']] },
  { id: 'bapteme', cat: 'inv', nom: 'Baptême', emo: '🕊️', titre: 'Mon baptême', msg: 'Je serais heureux de partager ce moment avec vous.', motif: ['🕊️', '🤍', '✨'],
    modeles: [['ciel', 'script', 'bulles', 'Ciel'], ['bebe', 'script', 'petales', 'Douceur'], ['sauge', 'serif', 'petales', 'Nature'], ['champagne', 'script', 'paillettes', 'Champagne'], ['neige', 'serif', 'etoiles', 'Blanc pur'], ['lavande', 'script', 'bulles', 'Lavande']] },
  { id: 'baby-shower', cat: 'inv', nom: 'Baby shower', emo: '🍼', titre: 'Baby shower', msg: 'Bébé arrive bientôt ! Venez fêter ça avec nous.', motif: ['🍼', '🧸', '🎀'],
    modeles: [['bebe', 'fun', 'bulles', 'Nuage'], ['ciel', 'fun', 'ballons', 'Bleu tendre'], ['rose', 'fun', 'coeurs', 'Rose tendre'], ['menthe', 'fun', 'bulles', 'Menthe'], ['pastel', 'script', 'etoiles', 'Petite étoile'], ['champagne', 'fun', 'ballons', 'Neutre']] },
  { id: 'gender-reveal', cat: 'inv', nom: 'Gender reveal', emo: '🎀', titre: 'Fille ou garçon ?', msg: 'Venez découvrir la surprise avec nous !', motif: ['💙', '🩷', '🎀'],
    modeles: [['pastel', 'fun', 'confettis', 'Rose ou bleu'], ['bebe', 'fun', 'ballons', 'Ballons'], ['nuit', 'fun', 'feux', 'Feu d\'artifice'], ['rose', 'brush', 'coeurs', 'Douceur'], ['ciel', 'brush', 'bulles', 'Nuage'], ['lavande', 'fun', 'confettis', 'Surprise']] },
  { id: 'soiree', cat: 'inv', nom: 'Soirée', emo: '🥂', titre: 'Soirée', msg: 'Musique, bonne humeur et belles rencontres. On t\'attend !', motif: ['🥂', '🎶', '✨'],
    modeles: [['or', 'royal', 'paillettes', 'Gatsby'], ['violet', 'fun', 'feux', 'Néon'], ['nuit', 'serif', 'etoiles', 'Nuit'], ['marine', 'royal', 'paillettes', 'Chic'], ['soleil', 'brush', 'confettis', 'Été'], ['bordeaux', 'serif', 'paillettes', 'Velours']] },
  { id: 'cremaillere', cat: 'inv', nom: 'Crémaillère', emo: '🏡', titre: 'Pendaison de crémaillère', msg: 'On a déménagé ! Venez découvrir notre nouveau chez-nous.', motif: ['🏡', '🔑', '🎉'],
    modeles: [['terracotta', 'brush', 'confettis', 'Terre cuite'], ['sauge', 'serif', 'petales', 'Jardin'], ['soleil', 'fun', 'confettis', 'Soleil'], ['ciel', 'fun', 'ballons', 'Ciel bleu'], ['champagne', 'serif', 'paillettes', 'Élégant'], ['menthe', 'brush', 'bulles', 'Frais']] },
  { id: 'evjf', cat: 'inv', nom: 'EVJF / EVG', emo: '👰', titre: 'Enterrement de vie de jeune fille', msg: 'Dernière soirée avant le grand jour : prépare-toi !', motif: ['👑', '🥂', '💃'],
    modeles: [['rose', 'brush', 'coeurs', 'Rose fun'], ['or', 'royal', 'paillettes', 'Glamour'], ['violet', 'fun', 'feux', 'Disco'], ['corail', 'brush', 'confettis', 'Tropical'], ['nuit', 'fun', 'etoiles', 'Nuit folle'], ['soleil', 'fun', 'confettis', 'Fiesta']] },
  { id: 'diplome', cat: 'inv', nom: 'Remise de diplôme', emo: '🎓', titre: 'Je fête mon diplôme', msg: 'Après tous ces efforts, place à la fête !', motif: ['🎓', '🎉', '⭐'],
    modeles: [['marine', 'royal', 'confettis', 'Promo'], ['or', 'royal', 'paillettes', 'Prestige'], ['bordeaux', 'serif', 'confettis', 'Université'], ['ciel', 'fun', 'ballons', 'Fun'], ['emeraude', 'royal', 'paillettes', 'Émeraude'], ['soleil', 'fun', 'confettis', 'Été']] },

  { id: 'joyeux-anniversaire', cat: 'voeux', nom: 'Joyeux anniversaire', emo: '🎉', titre: 'Joyeux anniversaire !', msg: 'Je te souhaite une année pleine de bonheur, de rires et de belles surprises.', motif: ['🎂', '🎈', '🎁'],
    modeles: [['pastel', 'brush', 'ballons', 'Ballons'], ['soleil', 'fun', 'confettis', 'Confettis'], ['nuit', 'script', 'feux', 'Feu d\'artifice'], ['rose', 'script', 'paillettes', 'Paillettes'], ['menthe', 'fun', 'bulles', 'Bulles'], ['or', 'royal', 'paillettes', 'Doré']] },
  { id: 'noel', cat: 'voeux', nom: 'Noël', emo: '🎄', titre: 'Joyeux Noël', msg: 'Que la magie de Noël illumine ton foyer de joie et de douceur.', motif: ['🎄', '⭐', '🎁'],
    modeles: [['noel', 'script', 'neige', 'Rouge Noël'], ['sapin', 'script', 'neige', 'Sapin'], ['neige', 'serif', 'neige', 'Flocons'], ['or', 'royal', 'paillettes', 'Noël doré'], ['marine', 'script', 'neige', 'Nuit d\'hiver'], ['champagne', 'serif', 'etoiles', 'Étoile']] },
  { id: 'nouvel-an', cat: 'voeux', nom: 'Bonne année', emo: '🥂', titre: 'Bonne année !', msg: 'Que cette nouvelle année t\'apporte santé, réussite et beaucoup de bonheur.', motif: ['🥂', '🎆', '✨'],
    modeles: [['or', 'royal', 'feux', 'Minuit'], ['nuit', 'script', 'feux', 'Feux d\'artifice'], ['marine', 'serif', 'paillettes', 'Paillettes'], ['violet', 'fun', 'confettis', 'Fête'], ['champagne', 'script', 'paillettes', 'Champagne'], ['bordeaux', 'royal', 'feux', 'Velours']] },
  { id: 'aid', cat: 'voeux', nom: 'Aïd Moubarak', emo: '🌙', titre: 'Aïd Moubarak', msg: 'Que cette fête vous apporte paix, joie et bénédictions, à vous et à toute votre famille.', motif: ['🌙', '🕌', '✨'],
    modeles: [['emeraude', 'arab', 'lanternes', 'Émeraude'], ['nuit', 'arab', 'lanternes', 'Nuit sacrée'], ['or', 'arab', 'etoiles', 'Or'], ['violet', 'arab', 'lanternes', 'Mauve'], ['champagne', 'arab', 'etoiles', 'Lumière'], ['marine', 'arab', 'etoiles', 'Bleu nuit']] },
  { id: 'ramadan', cat: 'voeux', nom: 'Ramadan', emo: '🏮', titre: 'Ramadan Moubarak', msg: 'Je te souhaite un mois béni, plein de sérénité et de partage.', motif: ['🏮', '🌙', '⭐'],
    modeles: [['nuit', 'arab', 'lanternes', 'Lanternes'], ['emeraude', 'arab', 'etoiles', 'Émeraude'], ['or', 'arab', 'lanternes', 'Doré'], ['violet', 'arab', 'etoiles', 'Crépuscule'], ['terracotta', 'arab', 'lanternes', 'Désert'], ['marine', 'arab', 'lanternes', 'Bleu nuit']] },
  { id: 'saint-valentin', cat: 'voeux', nom: 'Saint-Valentin', emo: '💝', titre: 'Je t\'aime', msg: 'Chaque jour avec toi est un cadeau. Joyeuse Saint-Valentin.', motif: ['💝', '🌹', '💕'],
    modeles: [['rose', 'script', 'coeurs', 'Rose'], ['bordeaux', 'script', 'coeurs', 'Passion'], ['or', 'script', 'paillettes', 'Précieux'], ['corail', 'brush', 'coeurs', 'Tendresse'], ['nuit', 'script', 'coeurs', 'Nuit d\'amour'], ['lavande', 'script', 'petales', 'Douceur']] },
  { id: 'fete-des-meres', cat: 'voeux', nom: 'Fête des mères', emo: '💐', titre: 'Bonne fête maman', msg: 'Merci pour tout ton amour. Tu es la meilleure.', motif: ['💐', '🌷', '💗'],
    modeles: [['rose', 'script', 'petales', 'Bouquet'], ['lavande', 'script', 'petales', 'Lavande'], ['sauge', 'script', 'petales', 'Jardin'], ['champagne', 'script', 'coeurs', 'Tendresse'], ['corail', 'brush', 'coeurs', 'Corail'], ['pastel', 'script', 'paillettes', 'Pastel']] },
  { id: 'fete-des-peres', cat: 'voeux', nom: 'Fête des pères', emo: '👔', titre: 'Bonne fête papa', msg: 'Merci d\'être toujours là. Je t\'aime, papa.', motif: ['👔', '⭐', '💙'],
    modeles: [['marine', 'royal', 'etoiles', 'Classique'], ['sapin', 'serif', 'confettis', 'Forêt'], ['or', 'royal', 'paillettes', 'Prestige'], ['ciel', 'fun', 'ballons', 'Fun'], ['terracotta', 'serif', 'confettis', 'Cuir'], ['nuit', 'royal', 'etoiles', 'Héros']] },
  { id: 'paques', cat: 'voeux', nom: 'Joyeuses Pâques', emo: '🐣', titre: 'Joyeuses Pâques', msg: 'Plein de douceur et de chocolat pour toi !', motif: ['🐣', '🌷', '🥚'],
    modeles: [['pastel', 'fun', 'petales', 'Pastel'], ['menthe', 'brush', 'petales', 'Printemps'], ['soleil', 'fun', 'confettis', 'Poussin'], ['rose', 'fun', 'bulles', 'Rose'], ['ciel', 'brush', 'petales', 'Ciel'], ['sauge', 'serif', 'petales', 'Nature']] },
  { id: 'felicitations', cat: 'voeux', nom: 'Félicitations', emo: '🏆', titre: 'Félicitations !', msg: 'Bravo, tu l\'as bien mérité. Je suis tellement fier·e de toi !', motif: ['🏆', '🎉', '⭐'],
    modeles: [['or', 'royal', 'confettis', 'Champion'], ['soleil', 'fun', 'confettis', 'Bravo'], ['marine', 'royal', 'feux', 'Victoire'], ['violet', 'fun', 'feux', 'Wow'], ['menthe', 'brush', 'confettis', 'Fraîcheur'], ['champagne', 'serif', 'paillettes', 'Élégant']] },
  { id: 'naissance', cat: 'voeux', nom: 'Naissance', emo: '👶', titre: 'Bienvenue petit ange', msg: 'Toutes nos félicitations pour l\'arrivée de votre bébé !', motif: ['👶', '🍼', '⭐'],
    modeles: [['bebe', 'script', 'etoiles', 'Petite étoile'], ['ciel', 'script', 'bulles', 'Nuage bleu'], ['rose', 'script', 'coeurs', 'Rose tendre'], ['menthe', 'fun', 'bulles', 'Menthe'], ['champagne', 'script', 'etoiles', 'Douceur'], ['lavande', 'fun', 'etoiles', 'Lune']] },
  { id: 'merci', cat: 'voeux', nom: 'Merci', emo: '🙏', titre: 'Merci', msg: 'Un immense merci pour ta gentillesse. Ça m\'a beaucoup touché.', motif: ['🙏', '💛', '✨'],
    modeles: [['champagne', 'script', 'paillettes', 'Champagne'], ['sauge', 'script', 'petales', 'Nature'], ['soleil', 'brush', 'confettis', 'Soleil'], ['rose', 'script', 'coeurs', 'Douceur'], ['ciel', 'brush', 'bulles', 'Léger'], ['or', 'script', 'paillettes', 'Doré']] },
  { id: 'retablissement', cat: 'voeux', nom: 'Bon rétablissement', emo: '🌻', titre: 'Prompt rétablissement', msg: 'Je pense fort à toi. Prends bien soin de toi, reviens-nous vite !', motif: ['🌻', '💛', '🌈'],
    modeles: [['soleil', 'brush', 'petales', 'Tournesol'], ['menthe', 'fun', 'bulles', 'Fraîcheur'], ['ciel', 'brush', 'petales', 'Ciel'], ['pastel', 'fun', 'coeurs', 'Arc-en-ciel'], ['sauge', 'serif', 'petales', 'Jardin'], ['corail', 'brush', 'coeurs', 'Câlin']] }
];

// liste plate de tous les modèles
const MODELES = [];
for (const o of OCC) o.modeles.forEach(([pal, font, anim, nom], i) => MODELES.push({ id: o.id + '-' + (i + 1), occ: o.id, pal, font, anim, nom }));

MODELES.forEach(m => { m.lay = STYLES[+m.id.split('-').pop() - 1]; });
