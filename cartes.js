/* Catalogue de Lookmiz : catégories, occasions et modèles de cartes.
   Chaque modèle combine une palette, une police, un motif et une animation.
   Les champs « inv » (invitation) demandent date, lieu et réponses ; les vœux non. */

const FONTS = {
  script: '"Great Vibes", cursive', serif: '"Playfair Display", Georgia, serif', royal: '"Cinzel", Georgia, serif',
  fun: '"Fredoka", "Arial Rounded MT Bold", sans-serif', brush: '"Pacifico", cursive', arab: '"Amiri", Georgia, serif'
};

// palettes : fond (dégradé), encre, accent, papier de l'enveloppe
const PAL = {
  champagne: ['linear-gradient(160deg,#fff8ec,#f3e2c4)', '#3b2a14', '#b8893b', '#efe0c4'],
  nuit: ['radial-gradient(circle at 30% 20%,#2b2f6b,#0d0f2b 70%)', '#fdf6e3', '#e7c66a', '#1c1f4a'],
  rose: ['linear-gradient(160deg,#fff0f4,#f8c9d6)', '#5a1f33', '#d4557a', '#f6d3dd'],
  sauge: ['linear-gradient(160deg,#f3f6ef,#cfdcc6)', '#2c3a2a', '#6f8f5e', '#dbe5d2'],
  bordeaux: ['linear-gradient(160deg,#5b1020,#2a0710)', '#fbe9d7', '#e2b46b', '#4a0d1a'],
  marine: ['linear-gradient(160deg,#0f2a4a,#07162a)', '#eaf2ff', '#8fc1ff', '#12304f'],
  pastel: ['linear-gradient(160deg,#fef6ff,#e3f0ff 50%,#fff1e6)', '#3b3355', '#8a6cff', '#ece6ff'],
  soleil: ['linear-gradient(160deg,#fff4c2,#ffc46b)', '#4a2b00', '#ff7a1a', '#ffe1a0'],
  menthe: ['linear-gradient(160deg,#e9fff6,#b7f0dc)', '#0f3b2e', '#13a37a', '#cdf5e6'],
  lavande: ['linear-gradient(160deg,#f4efff,#d6c8ff)', '#2e2259', '#7b5cff', '#e2d9ff'],
  noel: ['linear-gradient(160deg,#8e1b23,#4d0b12)', '#fff7ea', '#f2c14e', '#7a1820'],
  sapin: ['linear-gradient(160deg,#173d2b,#0b2318)', '#f6f1e3', '#e3b85c', '#163a29'],
  neige: ['linear-gradient(160deg,#f6fbff,#d9ebff)', '#173250', '#3c7bd9', '#e3f0ff'],
  or: ['linear-gradient(160deg,#1a1612,#0c0a08)', '#f7e7c1', '#d9b25f', '#221d17'],
  emeraude: ['linear-gradient(160deg,#0f4d3f,#062a22)', '#f4ead2', '#e0bb63', '#0d4136'],
  corail: ['linear-gradient(160deg,#fff1ec,#ffb9a3)', '#5a2118', '#f2643f', '#ffd8cc'],
  ciel: ['linear-gradient(160deg,#eef8ff,#bfe3ff)', '#103653', '#2c8fe0', '#d6eeff'],
  bebe: ['linear-gradient(160deg,#fff7fb,#e8f4ff)', '#3b4560', '#f29bbd', '#f6e9f3'],
  violet: ['linear-gradient(160deg,#3a1260,#170629)', '#f6ecff', '#c79bff', '#2c0e4a'],
  terracotta: ['linear-gradient(160deg,#fbeee6,#e9b99a)', '#4a2414', '#c2643a', '#f2d3c0']
};

// animations disponibles (dessinées sur un canvas dans la carte)
// confettis, neige, coeurs, etoiles, petales, ballons, lanternes, feux, bulles, paillettes

const CATS = [
  { id: 'inv', nom: 'Invitations', emo: '💌', sous: 'Anniversaire, mariage, baptême, soirée…' },
  { id: 'voeux', nom: 'Vœux & souhaits', emo: '🎁', sous: 'Noël, anniversaire, Aïd, Saint-Valentin…' }
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
