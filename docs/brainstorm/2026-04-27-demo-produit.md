# Brainstorm — Démo produit Kit Anomalie

**Date :** 27 avril 2026
**Statut :** En cours — questions ouvertes en bas
**Objectif :** Reprendre la conception de la démo depuis ce point.

---

## Contexte

Concevoir une démo produit du Kit Anomalie destinée à un public **décideurs internes** (réunion projetée, à distance ou présentiel).

Le Kit est une PWA mobile-first qui accompagne des agents terrain. La démo doit faire passer un message fort sans entrer dans le détail fonctionnel exhaustif.

---

## Décisions prises

### 1. Public cible
**Décideurs internes** — public sponsor/management qui doit valider, financer ou prioriser le déploiement.

### 2. Format de diffusion
Combo à deux livrables :

- **Vidéo cinématique 1m30 à 2 min** — registre Keynote Apple, projetable en réunion, envoyable par mail, fonctionne hors-ligne.
- **Site web interactif compagnon** — pour les équipes internes et utilisateurs qui veulent creuser après la vidéo (interaction, exploration libre).

La vidéo est le livrable principal. Le site web étend l'expérience sans la remplacer.

### 3. Message principal

**Angle dominant retenu : A — « Le terrain enfin équipé »**

Émotionnel, humain : focus sur l'agent qui dégaine son téléphone et trouve la bonne réponse en quelques secondes. Le kit n'est pas un nouvel outil métier, c'est un compagnon.

**Angles secondaires en appui :**
- **B — « La couverture totale »** — au climax, on déplie l'arborescence complète (rôles × spécialités × classements × catégories d'anomalies) pour montrer la portée.
- **D — « Le compagnon, pas un nouvel outil »** — en conclusion, désamorcer la peur du « nouvel outil de plus » : le kit s'intègre avec l'existant, ne le remplace pas.

**Angle écarté :**
- C — « Offline-first / robustesse technique » — trop technique pour ce public, à réserver à une démo DSI.

### 4. Dramaturgie de la vidéo

Quatre temps Keynote :

1. **Ouverture** — l'agent face à un problème terrain (suggéré, sans humain visible)
2. **Le kit sauve la situation** — la réponse arrive en quelques secondes
3. **Climax** — zoom out sur la couverture totale du périmètre
4. **Conclusion** — « il s'intègre, il ne remplace pas »

### 5. Ambiance visuelle

**Hybride : A en base + une séquence B au climax**

- **Ouverture et conclusion** — Apple-premium classique :
  - Fonds blancs et noirs alternés
  - Espace négatif généreux
  - Typographie large, sobre
  - Palette accent discrète
  - Transitions lentes, mouvements caméra mesurés

- **Climax (couverture totale)** — sci-fi sobre :
  - Fond sombre dominant
  - Glow bleu en accent
  - Particules discrètes
  - Lignes lumineuses qui s'assemblent
  - HUD qui se déploie autour du téléphone
  - Sound design dramatique au moment du déploiement

**Écarté :**
- Full sci-fi Tron — trop « tech-bro » pour le public décideurs
- Full brand interne — moins distinctif, manque le côté premium

### 6. Représentation humaine

**Pas de footage réel.** Décision prise pour éviter autorisations, image, RGPD, casting, droits.

**Approche retenue : silhouette stylisée + « présence sans personne »**

- **Silhouette rim-lit** sur 1 à 2 plans clés (ouverture + climax) :
  - Silhouette noire avec éclairage de bord (rim light) bleu
  - Pas de visage, pas de peau apparente
  - Suggère casque, gilet haute visibilité, sac, téléphone à la main
  - Production accessible : Mixamo (rig gratuit) + Blender ou After Effects

- **« Présence sans personne »** sur le reste de la vidéo :
  - Main gantée qui tient le téléphone (mockup 3D)
  - Casque posé au premier plan, hors-focus
  - Ombre projetée
  - Silhouette dans la brume en arrière-plan
  - Sound design (bruit ambiant, pas, voix off éventuelle)

**Écarté :**
- 3D photoréaliste type MetaHuman — uncanny valley, casting implicite (couleur peau, genre, âge), explosion budget pour effet marginal.
- Low-poly stylisé type Monument Valley — sort du registre Apple-Keynote retenu.

---

## Questions ouvertes — à trancher à la reprise

### Q1. Stratégie V1 — silhouette ou pas ?
- **Option α** (reco actuelle) — la silhouette dès la V1, intégrée à 1-2 plans clés
- **Option β** — V1 sans humain (téléphone seul + ambiances + sound design), V2 ajoute la silhouette si retours le justifient

### Q2. Durée précise
- 60 secondes (teaser percutant)
- 1m30 (cible actuelle)
- 2 min (plein format)
- À trancher selon le scénario

### Q3. Scénario détaillé / storyboard
À écrire après Q1 et Q2 tranchées. Plan par plan, durée, action, texte à l'écran, voix off (si VO).

### Q4. Stack technique de production
- **Mockup téléphone 3D** — Spline (no-code, web), Blender (libre, plus de contrôle), Cinema 4D, autre ?
- **Animation et compositing** — After Effects + Lottie, Da Vinci Resolve, motion graphics web (GSAP) ?
- **Sound design** — banque libre type Artlist/Epidemic Sound, création custom ?
- **Voix off** — oui/non, quelle langue, voix synthétique vs comédien ?

### Q5. Site web compagnon
- Structure (combien de pages, quel parcours)
- Niveau d'interaction (juste lire vs cliquer pour zoomer dans la démo)
- Hébergement (page dédiée du repo existant, sous-domaine, autre)
- Réutilisation des assets de la vidéo (ou refonte spécifique web)

### Q6. Effort de production
- Budget temps acceptable
- Faire seul vs déléguer certains assets (sound design, voix off, modélisation 3D)
- Date cible de livraison

---

## Références visuelles à compiler

À faire à la reprise — collecter 5 à 10 références visuelles par direction pour caler les attentes :
- Apple Keynote ouvertures produit (iPhone, iPad, Apple Watch)
- Spots Apple « Privacy on iPhone » (silhouettes rim-lit)
- Démos web Spline / Three.js premium
- Spots tech sobres style Linear, Notion, Arc Browser

---

## Ce qui n'est pas dans ce brainstorm

- Choix de la musique précise
- Texte définitif de la voix off
- Maquettes UI précises pour la vidéo
- Plan de communication autour de la démo (où elle est présentée, par qui, dans quel cadre)

Tous ces points viennent après avoir tranché Q1 à Q6.
