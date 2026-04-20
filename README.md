# Kit Anomalie — PWA d'adoption digitale

**Compagnon mobile-first** pour les agents terrain. Guides interactifs, fiches mémo réflexes, aide au classement par IA, consultation des anomalies par actif.

**Le kit n'est PAS une application métier.** La déclaration des anomalies se fait dans les applications métier existantes (EF3C0, S6A7, ADV Mobile, etc.). Le kit accompagne l'utilisateur.

**En ligne :** https://willykaizen.github.io/kit-anomalie/

---

## Cible

| | |
|---|---|
| **3 rôles** | Agent terrain/REQ, Ordonnanceur, Référent Patrimoine (RP) |
| **5 spécialités** | Voie, SEG, EALE, CAT, SM |
| **7 classements** | S/I, S/DP, A/P, A/M, A/SURV, A/DET, VA/VI/VR (Voie) |
| **Statuts** | Brouillon → Ouverte → En cours → Résolue |
| **Terminal cible** | Samsung A52s/A54s (400-430px) |

## Applications métier par spécialité

| Spécialité | Applications terrain |
|-----------|---------------------|
| **Voie** | EF3C0, ADV Mobile, SPM, CONFO, SPOT Coeur |
| **SEG** | S6A7, EF4B1, SPM, EF5A VSP |
| **EALE** | EF4B1, SPM, EF5A VSP |
| **CAT** | EF4B1, SPM, EF5A VSP, ARCAT |
| **SM** | EF4B1, SPM, EF5A VSP |

SPM est transverse (toutes spécialités). OPTISPOT et SPOT BO sont hors périmètre (back-office GMAO, pas terrain).

---

## Architecture — 8 briques

### État d'avancement

| Brique | Nom | Statut | Fichiers |
|--------|-----|--------|----------|
| **0** | Accueil & Profil | **Fait** | `ProfileSetup.tsx`, `Home.tsx`, `Layout.tsx`, `BottomNav.tsx` |
| **1** | Guides par application | **Fait** (1 guide démo) | `Guides.tsx`, `GuideDetail.tsx`, `data/guides.ts` |
| **2** | Fiches mémo réflexes | **Fait** (4 fiches) | `Fiches.tsx`, `FicheDetail.tsx`, `data/fiches.ts` |
| **3** | Parcours onboarding | Placeholder | — |
| **4** | Catalogue anomalies | **Fait** (prototype, 20 anomalies démo) | `Catalogue.tsx`, `CatalogueCategorie.tsx`, `CatalogueTypeActif.tsx`, `CatalogueFiche.tsx`, `EditorCatalogue.tsx`, `data/catalogueSeed.ts`, `stores/catalogueStore.ts` |
| **5** | Assistant IA | Placeholder | — |
| **6** | Bon à savoir & alertes | Placeholder | — |
| **7** | Administration (BO) | Non commencé | App séparée |

### Brique 0 — Accueil & Profil ✅

- Sélection rôle → spécialité → applications métier (3 étapes)
- Hub d'accueil : carte profil, tip du jour, 6 accès rapides, liste des applis
- Badge connecté/hors réseau en temps réel
- L'ordonnanceur peut passer le setup sans applis (message "Applications à définir")

### Brique 1 — Guides ✅

- Catalogue filtré par profil (rôle + spécialité + applis sélectionnées)
- Guide pas à pas interactif : barre de progression, navigation étape par étape
- Chaque étape : action à faire, champs à remplir, erreurs fréquentes, référentiel
- **Contenu démo :** 1 guide "Créer une anomalie dans EF3C0" (6 étapes)

### Brique 2 — Fiches mémo ✅

- Catalogue filtré par profil avec recherche par mot-clé
- Structure fixe : quoi faire, comment, erreurs à éviter, référentiel
- Lien vers le guide associé en bas de fiche
- **Contenu démo :** 4 fiches (classer, décrire, doublons, DLF)

### Brique 4 — Catalogue anomalies ✅

Référentiel **transverse** lecture seule, organisé en 3 niveaux : **Catégorie › Type d'actif › Anomalie**.

- **6 catégories** : Voie courante, Appareils de voie, Ouvrages & Gabarit, Abords, Installations de signalisation, Platelage (palette SNCF remappée)
- **7 classements** métier affichés en badges (S/I, S/DP, A/P, A/M, A/SURV, A/DET, VA/VI/VR)
- **Fiche anomalie** : 7 sections activables (illustration, description, défaut, écart, classements, actions, référence), sélecteur d'affichage persistant avec presets (Tout / Synthèse / Reset), partage presse-papier, favoris
- **Recherche locale** groupée par catégorie (code, nom, défaut, type, description)
- **Favoris + historique** (20 derniers consultés) visibles sur l'accueil de la brique
- **8 SVG inline** : usure ondulatoire, fissure transversale, écart de dressage (seuils AL/AR/ALT), affaissement de soudure, pointe d'aiguille, fissure béton, glissement talus, dalle PN
- **Deep-link** natif : `/catalogue/:catId/:typeId/:anoId`
- **Bandeau prototype** rappelant que la forme est inspirée du catalogue DZP SE et que les données sont synthétiques

**Édition via l'admin :**
- Mode éditeur → onglet **Catalogue** → CRUD complet aux 3 niveaux avec preview couleur catégorie et classements multi-conditions dynamiques
- Export / Import JSON (BOM UTF-8) : fichier `kit-anomalie-catalogue-YYYY-MM-DD.json`
- Bouton **Réinitialiser au contenu démo** dans Admin (pour démos propres)

**Remplacer les données de démo** par les vraies :
1. `/reglages` → Admin → Mode éditeur → onglet Catalogue
2. Ajouter/modifier/supprimer catégories et anomalies à la main, ou
3. Exporter (bouton en bas) → éditer le JSON hors-ligne → Importer

**Contenu démo :** 6 catégories × ~3 types × 1–2 anomalies = 20 anomalies, dont 6 à classements conditionnels multiples (dressage, usure rail, fissure, soudure, talus, PN).

### Briques 3, 5, 6, 7 — À construire

Voir le fichier de spécification complet : `/Projects/Anomalies/prompt-kit-anomalie.md`

---

## Stack technique

| | |
|---|---|
| **Frontend** | React 19 + TypeScript |
| **Build** | Vite 8 |
| **CSS** | Tailwind CSS 4 |
| **State** | Zustand (persist middleware → localStorage) |
| **Routing** | React Router DOM 7 |
| **PWA** | manifest.json, Service Worker (à compléter) |
| **Hébergement** | GitHub Pages (déploiement auto via GitHub Actions) |

## Arborescence

```
Kit_Anomalie/
├── .github/workflows/deploy.yml   ← CI/CD GitHub Pages
├── public/
│   ├── manifest.json              ← Config PWA
│   └── favicon.svg
├── src/
│   ├── App.tsx                    ← Router principal
│   ├── main.tsx                   ← Point d'entrée
│   ├── index.css                  ← Tailwind + charte SNCF
│   ├── components/
│   │   ├── Layout.tsx             ← Shell mobile (header + nav + offline)
│   │   ├── BottomNav.tsx          ← Navigation basse 5 onglets
│   │   └── OfflineBadge.tsx       ← Indicateur réseau
│   ├── pages/
│   │   ├── ProfileSetup.tsx       ← Brique 0 : config profil
│   │   ├── Home.tsx               ← Brique 0 : hub accueil
│   │   ├── Guides.tsx             ← Brique 1 : catalogue
│   │   ├── GuideDetail.tsx        ← Brique 1 : guide pas à pas
│   │   ├── Fiches.tsx             ← Brique 2 : catalogue
│   │   ├── FicheDetail.tsx        ← Brique 2 : détail fiche
│   │   └── Placeholder.tsx        ← Pages "À venir"
│   ├── data/
│   │   ├── roles.ts               ← Rôles, spécialités, applis métier
│   │   ├── guides.ts              ← Données guides de démo
│   │   └── fiches.ts              ← Données fiches de démo
│   ├── stores/
│   │   ├── profileStore.ts        ← Profil utilisateur (Zustand + persist)
│   │   └── favoritesStore.ts      ← Favoris, récents, recherche adaptative
│   ├── hooks/
│   │   └── useOffline.ts          ← Détection réseau
│   └── types/
│       └── index.ts               ← Tous les types TS
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Charte graphique

| Couleur | Hex | Usage |
|---------|-----|-------|
| Bleu SNCF foncé | `#0C1E5B` | Header, textes principaux |
| Bleu ciel SNCF | `#00A3E0` | Boutons, liens, accents |
| Rouge SNCF | `#E3051B` | Erreurs, alertes sécurité |
| Orange | `#F7A600` | Avertissements, statut "en cours" |
| Vert | `#3AAA35` | Succès, statut "résolu", connecté |
| Fond | `#F4F6FA` | Arrière-plan général |

Bordures arrondies 16-20px. Mobile-first (430px max).

## Terminologie

| Terme | Définition |
|-------|-----------|
| **Anomalie** | Déviation nécessitant intervention (classement + DLF) |
| **Constat** | Observation sans impact opérationnel (pas de classement, pas de DLF) |
| **DLF** | Date Limite de Fin |
| **REQ** | Responsable Équipe |
| **RP** | Référent Patrimoine |
| **MPC** | Maintenance Préventive Conditionnelle |
| **MC** | Maintenance Corrective |
| **Embarquement** | Attribution auto des anomalies aux tournées terrain |
| **NC** | Non Classé (anomalie sans classement = problème) |

## Lancer en local

```bash
cd 02_DataShift_App/Kit_Anomalie
npm install
npm run dev
# → http://localhost:5173/kit-anomalie/
```

## Déployer

Push sur `main` → GitHub Actions build + déploie automatiquement sur GitHub Pages.

```bash
git add -A && git commit -m "description" && git push
# → https://willykaizen.github.io/kit-anomalie/
```
