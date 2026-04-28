# Design — Démo produit Kit Anomalie

**Date :** 27 avril 2026
**Statut :** Design verrouillé, prêt pour implémentation
**Objectif :** Vidéo cinématique 1m30 + site web interactif compagnon, livrés depuis une seule codebase React.

---

## Contexte

Concevoir une démo produit du Kit Anomalie destinée à un public **décideurs internes** (réunion projetée, à distance ou présentiel).

Le Kit est une PWA mobile-first qui accompagne des agents terrain. La démo doit faire passer un message fort sans entrer dans le détail fonctionnel exhaustif.

---

## 1. Public cible

**Décideurs internes** — public sponsor/management qui doit valider, financer ou prioriser le déploiement.

## 2. Format de diffusion

Combo à deux livrables, **une seule codebase** :

- **Vidéo cinématique 1m30** — registre Keynote Apple, projetable en réunion, envoyable par mail, fonctionne hors-ligne. Captée en 4K via Puppeteer + ffmpeg depuis l'app web.
- **Site web interactif compagnon** — mêmes scènes 3D, navigables (scroll, hover, clic) pour les équipes internes et utilisateurs qui veulent creuser après la vidéo.

La vidéo est le livrable principal. Le site web étend l'expérience sans la remplacer.

## 3. Message principal

**Angle dominant : A — « Le terrain enfin équipé »**

Émotionnel, humain : focus sur l'agent qui dégaine son téléphone et trouve la bonne réponse en quelques secondes. Le kit n'est pas un nouvel outil métier, c'est un compagnon.

**Angles secondaires en appui :**
- **B — « La couverture totale »** — au climax, on déplie l'arborescence complète (rôles × spécialités × catégories d'anomalies) pour montrer la portée.
- **D — « Le compagnon, pas un nouvel outil »** — en conclusion, désamorcer la peur du « nouvel outil de plus » : le kit s'intègre avec l'existant, ne le remplace pas.

**Angle écarté :**
- C — « Offline-first / robustesse technique » — trop technique pour ce public, à réserver à une démo DSI.

## 4. Ambiance visuelle

**Hybride : Apple-premium en base + sci-fi sobre au climax**

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

## 5. Représentation humaine

**Pas de footage réel.** Approche : silhouette stylisée + « présence sans personne ».

- **Silhouette rim-lit** sur 1 à 2 plans clés (ouverture + climax) :
  - Silhouette noire avec éclairage de bord (rim light) bleu
  - Pas de visage, pas de peau apparente
  - Suggère casque, gilet haute visibilité, sac, téléphone à la main
  - Production : modèle Mixamo glTF + shader rim light custom dans React Three Fiber

- **« Présence sans personne »** sur le reste de la vidéo :
  - Main gantée qui tient le téléphone (mockup 3D)
  - Casque posé au premier plan, hors-focus
  - Ombre projetée
  - Silhouette dans la brume en arrière-plan

**Écarté :**
- 3D photoréaliste type MetaHuman — uncanny valley, casting implicite (couleur peau, genre, âge), explosion budget pour effet marginal.
- Low-poly stylisé type Monument Valley — sort du registre Apple-Keynote retenu.

---

## 6. Storyboard — 4 actes (1m30)

### Acte 1 — Le problème (0:00 → 0:22)
- Fond noir, particules très discrètes
- Texte qui apparaît mot par mot : « Sur le terrain. À 6h12. Sans réseau. »
- Plan large : silhouette rim-lit bleue qui marche, dos voûté, casque, sac
- Sound design : pas, vent, ambiance lourde
- Transition : la silhouette s'arrête, sort le téléphone

### Acte 2 — Le kit sauve (0:22 → 0:50)
- Caméra zoome sur l'écran du téléphone (mockup 3D Samsung qui flotte)
- L'app Kit Anomalie apparaît, on traverse 3 écrans en swipe ultra-fluide
- Texte : « Une réponse. Trois secondes. »
- Bascule progressive du fond noir vers le blanc pur (passage Apple-premium)

### Acte 3 — La couverture (0:50 → 1:15) — climax sci-fi
- Fond redevient sombre, glow bleu monte
- Le téléphone se décompose en arborescence 3D qui se déploie : rôles → spécialités → catégories → fiches
- Particules qui voyagent le long des branches
- Texte au climax : « Tout le périmètre. Une seule app. »
- Sound design : montée + drop musical au moment du déploiement complet

### Acte 4 — La conclusion (1:15 → 1:30)
- Retour fond blanc, le téléphone seul au centre
- Texte : « Le compagnon. Pas un nouvel outil. »
- Logo Kit Anomalie + URL du site compagnon
- Fade out

---

## 7. Stack technique

**100 % code, une seule codebase React.**

| Couche | Outil | Rôle |
|---|---|---|
| 3D | React Three Fiber + Three.js + drei | Scènes 3D temps réel (téléphone, silhouette, arborescence, particules) |
| Animation | GSAP + Timeline | Orchestration timeline 1m30, transitions, easing premium |
| UI / texte | Framer Motion | Apparitions de texte, transitions DOM |
| Modèle silhouette | Mixamo (glTF) + shader rim light custom | Personnage stylisé, sans recasting |
| Mockup téléphone | Modèle Samsung A52s libre (Sketchfab CC0) ou modélisation low-poly perso | Téléphone qui flotte, écran navigable |
| Audio | Banque libre (Pixabay, Freesound, Artlist trial) + Howler.js | Sound design, musique de fond |
| Capture vidéo | Puppeteer + ffmpeg | Export 4K 60fps de la timeline complète en MP4 |
| Hébergement | GitHub Pages (existant) | Vidéo téléchargeable + site web compagnon sur la même URL |

**Justification du choix code-only :**
- Une seule codebase pour les deux livrables
- Réutilisation à 100 % entre vidéo et site web compagnon
- Pas d'apprentissage Blender / After Effects requis
- Itération rapide (chaque ajustement est un commit, pas un re-export Blender)
- Tradeoff accepté : ~70-80 % du rendu Keynote Apple, pas le top 1 % cinéma

---

## 8. Site web compagnon

- **Route séparée** dans la même app React (par exemple `/demo`).
- **Mode auto-play** = la vidéo (timeline GSAP qui défile seule, pas d'interaction).
- **Mode interactif** = mêmes scènes 3D mais navigables :
  - Scroll pilote la progression
  - Hover sur les branches de l'arborescence pour voir les libellés
  - Clic sur une catégorie pour zoomer dessus
  - Bouton « relancer la démo » en mode auto-play
- **Lien** depuis la home du Kit Anomalie ou directement par URL pour partage interne.

---

## 9. Décisions locked

| # | Question | Décision |
|---|---|---|
| Q1 | Silhouette en V1 ? | **Oui (option α)** — coût marginal faible en code |
| Q2 | Durée ? | **1m30** — sweet spot 4 actes Keynote |
| Q3 | Storyboard ? | **4 actes définis** ci-dessus |
| Q4 | Stack ? | **100 % code React (Three Fiber + GSAP + Puppeteer/ffmpeg)** |
| Q5 | Site compagnon ? | **Même codebase, route séparée, mêmes scènes en mode interactif** |
| Q6 | Effort ? | **À cadrer dans le plan d'implémentation** |

---

## 10. Hors périmètre de ce design

- Choix musical précis (à faire après le scaffold technique)
- Texte définitif des plans (le squelette est posé, le wording final viendra à la première itération vidéo)
- Voix off — non retenue par défaut, on s'appuie sur texte à l'écran + sound design (réversible si besoin)
- Plan de diffusion (où, par qui, dans quel cadre) — relève du business, pas du design produit
- Migration future hors GitHub Pages

---

## 11. Références visuelles à compiler

À constituer en parallèle de l'implémentation :
- Apple Keynote ouvertures produit (iPhone, iPad, Apple Watch)
- Apple « Privacy on iPhone » (silhouettes rim-lit)
- Démos web Spline / Three.js premium
- Sites tech sobres : Linear, Notion, Arc Browser
- Inception / Tron Legacy pour le HUD du climax (référence d'ambiance, pas de copie)
