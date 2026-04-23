# Kit Anomalie — PWA d'adoption digitale

## Positionnement

Le Kit Anomalie est un **compagnon mobile-first** (Samsung A52s/A54s) pour les agents terrain. Ce n'est PAS une application métier. Il accompagne les agents dans la gestion des anomalies : guides interactifs par application, fiches mémo réflexes, catalogue de référence, aide au classement.

La **déclaration des anomalies se fait dans les applications métier existantes**. Le kit fournit le lien direct vers l'appli métier de l'utilisateur.

- **En ligne :** https://kit-anomalie.github.io/kit-anomalie/
- **Repo :** https://github.com/Kit-anomalie/kit-anomalie
- **Déploiement :** push sur `main` → GitHub Actions build + deploy auto sur GitHub Pages

## Cible

- **3 rôles** : Agent terrain/REQ, Ordonnanceur, Référent Patrimoine (RP)
- **5 spécialités** : Voie, SEG, EALE, CAT, SM
- **7 classements (Voie)** : S/I (Sécurité/Immédiat), S/DP (Sécurité/Délai Prescrit), A/P (Autres/Prioritaires), A/M (Autres/Maintenance), A/SURV (Autres/Surveillance), A/DET (Autres/à Déterminer), VA/VI/VR *(définition VA/VI/VR à clarifier)*
- **Statuts anomalies** : Brouillon → Ouverte → En cours → Résolue
- **Ordonnanceur** : pas d'appli terrain à date (applications à définir)

## Applications métier par spécialité

- **Voie** : EF3C0, ADV Mobile, SPOT Mobile, Conformité, SPOT Coeur
- **SEG** : S6A7, EF4B1, SPOT Mobile, EF5A VSP
- **EALE** : EF4B1, SPOT Mobile, EF5A VSP
- **CAT** : EF4B1, SPOT Mobile, EF5A VSP, ARCAT
- **SM** : EF4B1, SPOT Mobile, EF5A VSP
- SPOT Mobile est transverse. OPTISPOT et SPOT BO = back-office, hors périmètre.

## Terminologie

- **Anomalie** : écart sur le patrimoine nécessitant intervention (classement + DLF). Définition pas encore arrêtée
- **Constat** : observation sans impact opérationnel (pas de classement, pas de DLF)
- **DLF** : Date Limite de Fin (PAS "Fiabilisation"). Dépend du classement. Modification = analyse de risque
- **REQ** : Responsable Équipe
- **MPC** : Maintenance Préventive Conditionnelle
- **MC** : Maintenance Corrective
- **Embarquement** : attribution auto des anomalies aux tournées/applis terrain

## Architecture — 8 briques

| Brique | Nom | Statut | Notes |
|--------|-----|--------|-------|
| 0 | Accueil & Profil | ✅ Fait | ProfileSetup + Home + Layout + BottomNav + OfflineBadge |
| 1 | Guides par application | ✅ Fait (prototype) | 4 guides content.json (MPC SPM, Participant ADV, Relevé MPC, Visite PN) |
| 2 | Fiches mémo réflexes | ✅ Fait (prototype) | 4 fiches démo (classer, décrire, doublons, DLF) |
| 3 | Parcours onboarding / Quiz | ⚪ Placeholder | Route `/quiz` |
| 4 | **Catalogue anomalies** | ✅ Fait (prototype) | 6 catégories × 20 anomalies démo + 8 SVG + admin CRUD. Forme inspirée DZP SE. |
| 5 | Assistant IA | ⚪ Placeholder | Route `/assistant` |
| 6 | Bon à savoir & alertes | ⚪ Placeholder | Route `/alertes` |
| 7 | Administration (BO) | ⚪ Non commencé | App séparée à terme |

### Brique 4 — Catalogue anomalies (détail)

- **Hiérarchie** : Catégorie › Type d'actif › Anomalie (lecture + édition via admin)
- **6 catégories** : Voie courante (bleu ciel), Appareils de voie (bleu marine), Ouvrages & Gabarit (vert), Abords (terracotta), Installations signalisation (orange), Platelage (slate)
- **Fiche anomalie** : 7 sections activables (illustration, description, défaut, écart, classements, actions, référence) + sélecteur persistant avec presets (Tout / Synthèse / Reset) + favoris + partage presse-papier + sticky header + autres anomalies du même type en pied
- **Recherche locale** groupée par catégorie (code, nom, défaut, type, description)
- **Deep-link** : `/catalogue/:catId/:typeId/:anoId`
- **Badge « Prototype »** discret + bandeau en accueil (DZP SE inspiration, données synthétiques)

## Stack technique

- React 19 + TypeScript strict
- Vite 8
- Tailwind CSS 4 (tokens dans `src/index.css`)
- Zustand 5 (persist middleware → localStorage)
- React Router DOM 7 (basename `/kit-anomalie`)
- PWA : manifest.json + Service Worker (`public/sw.js`) avec auto-healing
- GitHub Pages (GitHub Actions)

### Stores Zustand

- `profileStore` — profil utilisateur (role + spécialité)
- `editorStore` — tips/fiches/guides locaux éditables (persist)
- `sharedContentStore` — sync automatique depuis `public/content.json`
- `catalogueStore` — catégories/types/anomalies du catalogue (persist, version 3)
- `cataloguePrefsStore` — préférences sections fiche (persist)
- `favoritesStore` — favoris guides/fiches/catalogue + historique (persist, version 1)
- `maintenanceStore` — planning maintenance
- `themeStore` — dark mode
- `sharedContentStore` — fetch + auto-sync content.json

## Charte graphique

### Palette SNCF (tokens Tailwind `sncf-*`)

| Couleur | Hex | Usage |
|---|---|---|
| Bleu SNCF foncé | `#0C1E5B` | Header, textes, appareils de voie (catalogue) |
| Bleu ciel SNCF | `#00A3E0` | Boutons, liens, accents, voie courante (catalogue) |
| Rouge SNCF | `#E3051B` | Erreurs, sécurité S/I |
| Orange | `#F7A600` | Warnings, S/DP, installations signalisation (catalogue) |
| Vert | `#3AAA35` | Succès, A/SURV, ouvrages & gabarit (catalogue) |
| Fond | `#F4F6FA` | Arrière-plan général |

### Palette étendue catalogue (hors tokens SNCF)

- **Abords** : `#A85D3F` (terracotta — distinct du sncf-green)
- **Platelage** : `#475569` (slate dark — neutre minéral)

### Conventions UI

- Bordures arrondies 16-20px (`rounded-xl` / `rounded-2xl`)
- Mobile-first, max-width 430px (désktop 768/1280)
- **Touch targets ≥ 44px** (Apple guideline, agents avec gants)
- **Badges classement uniformes** : `rounded-full` + `text-xs` + `font-bold` + `px-2 py-0.5`. Contraste AA vérifié :
  - Texte **blanc** : S/I, A/M, A/DET (rouge, marine, gris)
  - Texte **sncf-dark** : S/DP, A/P, A/SURV (orange, bleu ciel, vert) — AA échouait en blanc
- Staggers animations plafonnés (`Math.min(i, 6)`) → dernière carte visible en < 400ms
- Composant `<BackButton/>` factorisé pour tout retour (`src/components/BackButton.tsx`)
- Respect de `prefers-reduced-motion` : **à faire** (pending 🟡 audit)

## Mode éditeur & partage content.json

### Workflow collaboratif (Wilfried + Mathilde)

Modèle **séquentiel mono-exporteur** : Wilfried est le seul à pousser dans `public/content.json`. Mathilde édite mais ne pousse jamais directement.

1. Mathilde édite en local (auto-sync lui a donné la dernière version publiée)
2. Mathilde exporte son JSON → envoie à Wilfried (mail, Slack, clé USB)
3. Wilfried : Mode éditeur → **Fusionner un contenu** → import du JSON de Mathilde
4. Feedback UI : *« Fusion réussie — ajoutés : X tips, Y fiches, Z guides · N doublons ignorés »*
5. Ils vérifient à la main les arbitrages éventuels
6. Wilfried exporte l'ensemble → push dans `public/content.json` + bump `version.json`
7. Tous les devices (iPhone, desktop, responsables) auto-sync au prochain chargement

### Import modes

- **`merge`** (défaut) : dédup par titre (guides/fiches) ou texte (tips). Local gagne sur doublon. Aucune perte.
- **`replace`** : utilisé par `restoreShared()` et catalogue import (écrasement total).

### Bouton « Restaurer le contenu partagé » (Admin → Contenu)

- Efface les guides/fiches/tips locaux non exportés
- Re-fetche `content.json` + injecte dans editorStore
- Ne touche PAS aux favoris, historique, préférences, catalogue anomalies

## PWA & auto-healing

### Fichiers

- `public/manifest.json` : app installable
- `public/sw.js` : service worker avec purge systématique des anciens caches à l'install
- `public/version.json` : version courante (bump à chaque push significatif)
- `public/maintenance.json` : bascule maintenance totale

### Mécanisme auto-sync

Au chargement :
1. `main.tsx` → `checkForUpdate()` compare `version.json.v` vs `localStorage['kit-anomalie-version']`
2. Si différent → purge caches + unregister SW + `window.location.reload()`
3. Après reload, `sharedContentStore.load()` compare `content.json.exportDate` vs `localStorage['kit-anomalie-content-exportdate']`
4. Si différent → écrase editorStore avec la version partagée → stocke nouvel exportDate

**Résultat** : zéro action utilisateur pour propager un nouveau push à tous les devices.

## Règles

- **Ne JAMAIS écrire le nom de l'opérateur ferroviaire** dans le code
- Contenu orienté **agent terrain**, pas management
- Les fiches et guides doivent utiliser la **bonne terminologie métier** SNCF
- Les descriptions d'applis viennent du store public numerique.sncf.com
- **Offline-first** : tout doit fonctionner sans réseau
- Les **anomalies** (brique 4 catalogue) sont **lecture seule côté agent** (pas de création/modification terrain). La création se fait dans les applis métier. L'admin peut éditer le catalogue via Mode éditeur.

## Git & déploiement

- **Branche unique** : `main`
- **Push direct autorisé** (permission Bash(git push:*) côté settings projet)
- **Bump `version.json`** à chaque push significatif pour déclencher l'auto-healing PWA côté utilisateurs
- **Fin de chaque commit** : `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
- `.claude/` est gitignored (settings locaux, plugins clonés, mémoire privée)

## Lancer en local

```bash
npm install
npm run dev
# → http://localhost:5173/kit-anomalie/
```

```bash
npm run build   # tsc -b && vite build
npm run lint    # eslint .
```

## Prochaines étapes

- **Brique 3 Quiz** ou **Brique 5 Assistant IA** (RAG local sur catalogue+fiches) — choix ouvert
- **Brique 6 Alertes**
- **Brique 7 Admin BO** (app séparée à terme)
- **Audit UX/UI — 🟡 polish restant** : bottom sheets au lieu de `confirm()`, `prefers-reduced-motion`, `focus-visible`, indicateurs scroll rails, vide states actionnables
- **Contenu métier réel** : remplacer les 20 anomalies démo et les 4 guides prototype par les vraies données (après validation métier)
- **Migration SNCF interne** : GitLab + PostgreSQL hébergé, à faire quand le kit sera adopté (pas avant)
