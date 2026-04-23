# Kit Anomalie — PWA d'adoption digitale

## Positionnement

Le Kit Anomalie est un **compagnon mobile-first** (Samsung A52s/A54s) pour les agents terrain. Ce n'est PAS une application métier. Il accompagne les agents dans la gestion des anomalies : guides interactifs par application, fiches mémo réflexes, aide au classement.

La **déclaration des anomalies se fait dans les applications métier existantes**. Le kit fournit le lien direct vers l'appli métier de l'utilisateur.

**En ligne :** https://kit-anomalie.github.io/kit-anomalie/
**Repo :** https://github.com/Kit-anomalie/kit-anomalie

## Cible

- **3 rôles** : Agent terrain/REQ, Ordonnanceur, Référent Patrimoine (RP)
- **5 spécialités** : Voie, SEG, EALE, CAT, SM
- **7 classements (Voie)** : S/I (Sécurité/Immédiat), S/DP (Sécurité/Délai Prescrit), A/P (Autres/Prioritaires), A/M (Autres/Maintenance), A/SURV (Autres/Surveillance), A/DET (Autres/à Déterminer), VA/VI/VR
- **Statuts** : Brouillon → Ouverte → En cours → Résolue
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

| Brique | Nom | Statut |
|--------|-----|--------|
| 0 | Accueil & Profil | Fait |
| 1 | Guides par application | Fait (1 guide démo EF3C0) |
| 2 | Fiches mémo réflexes | Fait (4 fiches) |
| 3 | Parcours onboarding | Placeholder |
| 4 | Anomalies par actif | Placeholder |
| 5 | Assistant IA | Placeholder |
| 6 | Bon à savoir & alertes | Placeholder |
| 7 | Administration (BO) | Non commencé (app séparée) |

## Stack technique

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Zustand (state management, persist → localStorage)
- React Router DOM 7
- PWA (manifest.json)
- GitHub Pages (déploiement auto via GitHub Actions)

## Charte graphique

- Bleu SNCF foncé : #0C1E5B
- Bleu ciel SNCF : #00A3E0
- Rouge SNCF : #E3051B
- Orange : #F7A600
- Vert : #3AAA35
- Fond : #F4F6FA
- Bordures arrondies 16-20px, mobile-first 430px

## Règles

- Ne JAMAIS écrire le nom de l'opérateur ferroviaire dans le code
- Contenu orienté agent terrain, pas management
- Les fiches et guides doivent utiliser la bonne terminologie métier
- Les descriptions d'applis viennent du store public numerique.sncf.com
- Offline-first : tout doit fonctionner sans réseau
- Lecture seule pour les anomalies — création/modification dans les applis métier

## Lancer en local

```bash
npm install
npm run dev
# → http://localhost:5173/kit-anomalie/
```

## Déployer

Push sur main → GitHub Actions build + déploie automatiquement.
