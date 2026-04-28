# Brique 6 « Aide au choix » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire la brique 6 du Kit Anomalie : 2 arbres de décision interactifs (« Quelle appli ? » et « Comment décrire ? »), avec player wizard fullscreen mobile-first, éditeur admin form-based, et synchronisation `content.json` comme les autres briques.

**Architecture:** Étend `editorStore` avec une nouvelle entité `DecisionTree` (cohérent avec le pattern existant : guides, fiches, tips, quizzes y vivent déjà). Sync via `sharedContentStore`. Routes `/aide` (liste) et `/aide/:treeId` (player). Onglet « Aide au choix » dans l'admin. Pas de tests unitaires (le projet n'en a pas), validation par TypeScript strict + revue visuelle via `npm run dev` + build de prod.

**Tech Stack:**
- React 19 + TypeScript strict (existant)
- Zustand 5 + persist middleware (existant)
- React Router 7 (existant)
- Tailwind 4 (existant)

**Conventions du projet (à respecter) :**
- Commentaires en français
- Branche unique `main`, push direct autorisé
- Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
- Aucune référence à l'opérateur dans le code, mais les noms d'applis métier (EF3C0, SPOT Mobile, ADV Mobile, etc.) sont autorisés par cohérence avec `src/data/guides.ts` et `public/content.json`

---

## Structure des fichiers

```
src/
├── types/
│   └── index.ts                       ← MODIFIER : ajouter DecisionTree, DecisionNode, DecisionLeafResult ; étendre EditorData
├── data/
│   └── decisionTreesDefault.ts        ← CRÉER : 2 arbres démo (« Quelle appli ? » + « Comment décrire ? »)
├── stores/
│   ├── editorStore.ts                 ← MODIFIER : champ aides + CRUD (addAide / updateAide / deleteAide / upsertAide) ; étendre exportData/importData
│   └── sharedContentStore.ts          ← MODIFIER : sync aides depuis content.json
├── pages/
│   ├── Aide/
│   │   ├── AideListe.tsx              ← CRÉER : page /aide, liste filtrée par profil
│   │   └── AidePlayer.tsx             ← CRÉER : page /aide/:treeId, wizard fullscreen
│   ├── EditorAides.tsx                ← CRÉER : éditeur admin form-based
│   ├── Editor.tsx                     ← MODIFIER : ajouter onglet « Aide au choix »
│   └── Home.tsx                       ← MODIFIER : remplacer la tuile 🔔 Alertes par 🧭 Aide au choix
├── App.tsx                            ← MODIFIER : ajouter routes /aide et /aide/:treeId, remplacer /alertes par redirect
public/
└── content.json                       ← LAISSER INCHANGÉ (les arbres démo viennent du code, pas du JSON partagé pour V1)
```

**Note sur les arbres démo :** ils sont injectés depuis `src/data/decisionTreesDefault.ts` via le pattern des autres briques (guides, fiches → fusion dans editorStore au load). Pas besoin de modifier `content.json` en V1 ; l'admin pourra exporter/importer normalement.

---

## Task 1 : Types — DecisionTree, DecisionNode, DecisionLeafResult

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1 : Ajouter les types à la fin de `src/types/index.ts`**

Ajouter ce bloc à la fin du fichier (après la dernière interface existante) :

```typescript
// === Brique 6 : Aide au choix (arbres de décision) ===

/** Lien interne depuis une feuille vers une autre brique du kit */
export interface DecisionLeafLink {
  kind: 'fiche' | 'guide' | 'catalogue-categorie' | 'catalogue-anomalie'
  /** Id de la fiche/guide/catégorie/anomalie cible */
  id: string
  /** Texte affiché du bouton (ex : "Voir la fiche réflexe") */
  label: string
}

/** Résultat affiché au bout d'une feuille */
export interface DecisionLeafResult {
  /** Texte explicatif (markdown léger ou plain text) */
  description?: string
  /** Badge classement (réutilise CLASSEMENT_COLORS si label = clé Classement, sinon couleurs custom) */
  badge?: { label: string; bg: string; text: string }
  /** Liste de vérifications à cocher (côté UI uniquement, pas de persistence) */
  checklist?: string[]
  /** Lien vers une autre brique du kit */
  link?: DecisionLeafLink
}

/** Nœud de l'arbre : soit une question, soit une feuille (résultat) */
export type DecisionNode =
  | {
      id: string
      type: 'question'
      title: string
      help?: string
      answers: Array<{ label: string; nextId: string }>
    }
  | {
      id: string
      type: 'leaf'
      title: string
      result: DecisionLeafResult
    }

/** Arbre de décision complet */
export interface DecisionTree {
  id: string
  title: string
  description?: string
  /** Id du nœud racine (doit exister dans nodes) */
  rootNodeId: string
  /** Map flat des nœuds, indexée par leur id */
  nodes: Record<string, DecisionNode>
  /** Filtres : si vides ou absents, l'arbre est visible par tous */
  specialitesCibles?: Specialite[]
  rolesCibles?: Role[]
}
```

- [ ] **Step 2 : Étendre EditorData (existante)**

Trouver l'interface `EditorData` (ligne ~228) et y ajouter le champ `aides`. Avant :

```typescript
export interface EditorData {
  tips?: CustomTip[]
  fiches?: FicheMemo[]
  guides?: Guide[]
  // ... champs existants quizz
}
```

Ajouter le champ `aides` (optionnel pour rétro-compatibilité avec les anciens exports) :

```typescript
export interface EditorData {
  tips?: CustomTip[]
  fiches?: FicheMemo[]
  guides?: Guide[]
  // ... champs existants
  aides?: DecisionTree[]
}
```

- [ ] **Step 3 : Vérifier que le build passe**

```bash
cd /Users/wilfrieddieugnou/Documents/Claude/Projects/Personnel/DataShift/02_DataShift_App/Kit_Anomalie
npm run build
```

Expected : build OK. Aucune utilisation des nouveaux types ailleurs encore, donc rien ne doit casser.

- [ ] **Step 4 : Commit**

```bash
git add src/types/index.ts
git commit -m "$(cat <<'EOF'
feat(types): types DecisionTree pour la brique 6

- DecisionNode (question | leaf)
- DecisionLeafResult avec badge, checklist, link
- DecisionLeafLink vers fiche/guide/catalogue
- EditorData.aides pour export/import
EOF
)"
```

---

## Task 2 : Données démo — 2 arbres pré-livrés

**Files:**
- Create: `src/data/decisionTreesDefault.ts`

- [ ] **Step 1 : Créer le fichier des arbres démo**

```typescript
// src/data/decisionTreesDefault.ts
// Arbres de décision livrés par défaut avec le kit.
// Chargés au premier démarrage par editorStore (fusion sans écrasement comme les autres briques).

import type { DecisionTree } from '../types'

// Arbre 1 : « Quelle appli ouvrir pour résoudre mon anomalie ? »
// L'agent indique le type d'anomalie (catégorie du catalogue), le kit propose
// l'appli métier appropriée + un lien vers le guide associé.
const TREE_QUELLE_APPLI: DecisionTree = {
  id: 'tree-quelle-appli',
  title: 'Quelle appli ouvrir ?',
  description: "Selon le type d'anomalie, le kit te dirige vers la bonne appli métier et le guide associé.",
  rootNodeId: 'q-type-anomalie',
  nodes: {
    'q-type-anomalie': {
      id: 'q-type-anomalie',
      type: 'question',
      title: "Quel type d'anomalie veux-tu déclarer ?",
      help: 'Choisis la catégorie qui correspond à ce que tu observes sur le terrain.',
      answers: [
        { label: 'Voie courante', nextId: 'leaf-voie-courante' },
        { label: 'Appareils de voie', nextId: 'leaf-appareils-de-voie' },
        { label: 'Ouvrages & Gabarit', nextId: 'leaf-ouvrages' },
        { label: 'Abords', nextId: 'leaf-abords' },
        { label: 'Installations signalisation', nextId: 'leaf-signalisation' },
        { label: 'Platelage', nextId: 'leaf-platelage' },
      ],
    },
    'leaf-voie-courante': {
      id: 'leaf-voie-courante',
      type: 'leaf',
      title: 'EF3C0',
      result: {
        description: "Ouvre EF3C0 pour saisir ton anomalie de voie courante.",
        link: {
          kind: 'guide',
          id: 'guide-creer-anomalie-ef3c0',
          label: 'Voir le guide « Créer une anomalie dans EF3C0 »',
        },
      },
    },
    'leaf-appareils-de-voie': {
      id: 'leaf-appareils-de-voie',
      type: 'leaf',
      title: 'ADV Mobile',
      result: {
        description: "Ouvre ADV Mobile pour les appareils de voie (aiguillages, traversées).",
      },
    },
    'leaf-ouvrages': {
      id: 'leaf-ouvrages',
      type: 'leaf',
      title: 'SPOT Mobile',
      result: {
        description: "Pour les ouvrages d'art et le gabarit, utilise SPOT Mobile.",
      },
    },
    'leaf-abords': {
      id: 'leaf-abords',
      type: 'leaf',
      title: 'SPOT Mobile',
      result: {
        description: "Les abords (végétation, propreté, accès) se déclarent dans SPOT Mobile.",
      },
    },
    'leaf-signalisation': {
      id: 'leaf-signalisation',
      type: 'leaf',
      title: 'SPOT Mobile',
      result: {
        description: "Pour les installations de signalisation, utilise SPOT Mobile.",
      },
    },
    'leaf-platelage': {
      id: 'leaf-platelage',
      type: 'leaf',
      title: 'SPOT Mobile',
      result: {
        description: "Le platelage (passages à niveau, planches) se déclare dans SPOT Mobile.",
      },
    },
  },
  specialitesCibles: ['voie'],
}

// Arbre 2 : « Comment décrire mon anomalie ? »
// Selon le type d'anomalie, le kit affiche un template de description à recopier
// dans l'appli métier (V1 : pas de copier-coller automatique).
const TREE_COMMENT_DECRIRE: DecisionTree = {
  id: 'tree-comment-decrire',
  title: 'Comment décrire mon anomalie ?',
  description: "Un template de description prêt à recopier, adapté au type d'anomalie.",
  rootNodeId: 'q-type-decrire',
  nodes: {
    'q-type-decrire': {
      id: 'q-type-decrire',
      type: 'question',
      title: "Quel type d'anomalie ?",
      answers: [
        { label: 'Voie courante', nextId: 'leaf-decrire-voie' },
        { label: 'Appareils de voie', nextId: 'leaf-decrire-adv' },
        { label: 'Ouvrages & Gabarit', nextId: 'leaf-decrire-ouvrages' },
        { label: 'Abords', nextId: 'leaf-decrire-abords' },
        { label: 'Installations signalisation', nextId: 'leaf-decrire-signalisation' },
        { label: 'Platelage', nextId: 'leaf-decrire-platelage' },
      ],
    },
    'leaf-decrire-voie': {
      id: 'leaf-decrire-voie',
      type: 'leaf',
      title: 'Template — Voie courante',
      result: {
        description:
          "Localisation : PK [xxx+yyy] — Voie [n°]\n" +
          "Type de défaut : [NL / dévers / écartement / autre]\n" +
          "Mesure relevée : [valeur + unité]\n" +
          "Conditions : [météo, température si pertinent]\n" +
          "Photo jointe : [oui/non]",
        checklist: [
          "Localisation précise (PK + voie)",
          "Type de défaut clair",
          "Mesure ou observation chiffrée",
          "Photo si possible",
        ],
      },
    },
    'leaf-decrire-adv': {
      id: 'leaf-decrire-adv',
      type: 'leaf',
      title: 'Template — Appareils de voie',
      result: {
        description:
          "Localisation : PK [xxx+yyy] — Appareil [n°]\n" +
          "Élément concerné : [aiguille / cœur / contre-rail / coussinet / autre]\n" +
          "Nature du défaut : [usure / jeu / déformation / casse / autre]\n" +
          "Mesure : [valeur + unité]\n" +
          "Photo jointe : [oui/non]",
        checklist: [
          "Numéro de l'appareil",
          "Élément précis",
          "Nature du défaut",
          "Mesure si applicable",
          "Photo",
        ],
      },
    },
    'leaf-decrire-ouvrages': {
      id: 'leaf-decrire-ouvrages',
      type: 'leaf',
      title: 'Template — Ouvrages & Gabarit',
      result: {
        description:
          "Ouvrage : [identifiant + type]\n" +
          "Localisation : [PK ou repère]\n" +
          "Défaut observé : [fissure / déformation / corrosion / végétation / autre]\n" +
          "Étendue : [longueur ou surface si mesurable]\n" +
          "Photo jointe : [oui/non]",
      },
    },
    'leaf-decrire-abords': {
      id: 'leaf-decrire-abords',
      type: 'leaf',
      title: 'Template — Abords',
      result: {
        description:
          "Localisation : PK [xxx+yyy]\n" +
          "Type d'abord : [végétation / accès / propreté / clôture / autre]\n" +
          "Description : [ce qui ne va pas en 1 phrase]\n" +
          "Risque associé : [oui/non + lequel]\n" +
          "Photo jointe : [oui/non]",
      },
    },
    'leaf-decrire-signalisation': {
      id: 'leaf-decrire-signalisation',
      type: 'leaf',
      title: 'Template — Signalisation',
      result: {
        description:
          "Localisation : PK [xxx+yyy]\n" +
          "Type d'installation : [feu / panneau / balise / autre]\n" +
          "Identifiant : [n° si visible]\n" +
          "Défaut : [fonctionnel / visuel / mécanique]\n" +
          "Photo jointe : [oui/non]",
      },
    },
    'leaf-decrire-platelage': {
      id: 'leaf-decrire-platelage',
      type: 'leaf',
      title: 'Template — Platelage',
      result: {
        description:
          "Localisation : PN ou repère [xxx]\n" +
          "Type de défaut : [planche cassée / écart / fixation / usure]\n" +
          "Étendue : [combien de planches concernées]\n" +
          "Risque pour la circulation routière : [oui/non]\n" +
          "Photo jointe : [oui/non]",
      },
    },
  },
}

export const DEFAULT_DECISION_TREES: DecisionTree[] = [
  TREE_QUELLE_APPLI,
  TREE_COMMENT_DECRIRE,
]
```

- [ ] **Step 2 : Build check**

```bash
npm run build
```

Expected : OK.

- [ ] **Step 3 : Commit**

```bash
git add src/data/decisionTreesDefault.ts
git commit -m "$(cat <<'EOF'
feat(aide): 2 arbres démo (« Quelle appli ? » + « Comment décrire ? »)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 : editorStore — CRUD aides

**Files:**
- Modify: `src/stores/editorStore.ts`

- [ ] **Step 1 : Lire l'éditeur store et identifier les zones à modifier**

```bash
cat src/stores/editorStore.ts
```

Repérer :
- L'interface `EditorState` (lignes ~6-60)
- L'objet retourné par `create<EditorState>()(persist(...))` (corps du store)
- La fonction `exportData`
- La fonction `importData`

- [ ] **Step 2 : Ajouter le champ `aides` dans l'état initial**

Localiser la déclaration des champs initiaux (tips, fiches, guides, etc.) et ajouter `aides: []` au même niveau.

Localiser aussi l'interface `EditorState` et ajouter :

```typescript
  aides: DecisionTree[]

  // Aides (arbres de décision)
  addAide: (aide: Omit<DecisionTree, 'id'>) => string
  upsertAide: (aide: DecisionTree) => void
  updateAide: (id: string, aide: Partial<DecisionTree>) => void
  deleteAide: (id: string) => void
```

Ajouter aussi l'import en haut du fichier :

```typescript
import type { DecisionTree } from '../types'
import { DEFAULT_DECISION_TREES } from '../data/decisionTreesDefault'
```

- [ ] **Step 3 : Implémenter les méthodes CRUD aides**

Dans le corps du store, ajouter les implémentations (juste après les méthodes guides ou quizzes existantes) :

```typescript
      addAide: (aide) => {
        const id = `aide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        set((s) => ({ aides: [...s.aides, { ...aide, id }] }))
        return id
      },

      upsertAide: (aide) => {
        set((s) => {
          const exists = s.aides.some((a) => a.id === aide.id)
          return {
            aides: exists
              ? s.aides.map((a) => (a.id === aide.id ? aide : a))
              : [...s.aides, aide],
          }
        })
      },

      updateAide: (id, partial) => {
        set((s) => ({
          aides: s.aides.map((a) => (a.id === id ? { ...a, ...partial } : a)),
        }))
      },

      deleteAide: (id) => {
        set((s) => ({ aides: s.aides.filter((a) => a.id !== id) }))
      },
```

- [ ] **Step 4 : Étendre exportData et importData**

Trouver `exportData` (cherche `exportData:` dans le fichier). Modifier le retour pour inclure `aides` :

```typescript
      exportData: () => {
        const s = get()
        return {
          tips: s.tips,
          fiches: s.fiches,
          guides: s.guides,
          quizQuestions: s.quizQuestions,
          customThemes: s.customThemes,
          customQuizzes: s.customQuizzes,
          aides: s.aides,
        }
      },
```

(Adapter selon les champs existants ; conserver l'ordre.)

Trouver `importData`. Dans le mode `replace` et le mode `merge`, gérer les aides :

Pour `replace` (écrasement total) :

```typescript
        if (mode === 'replace') {
          set({
            tips: data.tips ?? [],
            fiches: data.fiches ?? [],
            guides: data.guides ?? [],
            quizQuestions: data.quizQuestions ?? [],
            customThemes: data.customThemes ?? [],
            customQuizzes: data.customQuizzes ?? [],
            aides: data.aides ?? [],
          })
          return { mode: 'replace', /* ... rapport existant */ } as ImportReport
        }
```

Pour `merge` (dédup par id pour les aides — choix simple : on remplace si même id, sinon on ajoute) :

Localiser la section merge et ajouter le bloc aides :

```typescript
        // Merge aides : dédup par id (replace si même id existe, sinon ajoute)
        const incomingAides = data.aides ?? []
        const localAides = get().aides
        const localIds = new Set(localAides.map((a) => a.id))
        const newAides = incomingAides.filter((a) => !localIds.has(a.id))
        if (newAides.length > 0) {
          set({ aides: [...localAides, ...newAides] })
        }
```

Et ajouter le compteur dans le rapport `ImportReport` retourné (ex : `aidesAjoutees: newAides.length`). Trouver l'interface `ImportReport` (probablement définie en haut ou dans types) et ajouter ce champ. Si c'est trop intrusif, ajouter simplement la propriété sans typage strict ; le rapport sert juste l'affichage UI.

- [ ] **Step 5 : Initialiser avec les arbres démo au premier démarrage**

Pour que les utilisateurs voient les 2 arbres dès le premier chargement, on les fusionne dans le store quand le tableau `aides` est vide.

Trouver la version actuelle du persist (`version: ...`). Augmenter la version (ex : passer de 1 à 2) pour déclencher la migration. Dans la fonction `migrate` du persist (créer si absente) ou dans un effet d'initialisation, fusionner :

Approche simple : dans le `partialize` ou ailleurs, on s'assure que `aides` est rempli au moins avec les défauts si vide. Le plus propre est d'ajouter une migration. Si la version `migrate` existe déjà, on l'étend ; sinon on en ajoute une.

Si l'éditeur store n'a pas de migration sophistiquée, plus simple : au moment de créer l'état initial, faire :

```typescript
      aides: DEFAULT_DECISION_TREES,
```

Cette valeur par défaut sera utilisée seulement la première fois (quand persist n'a rien à restaurer). Pour les utilisateurs existants qui ont déjà persisté un état sans `aides`, ils auront `undefined` ou `[]`. On gère ça dans `sharedContentStore` Task 4 : si `aides` local est vide, on fusionne `DEFAULT_DECISION_TREES`.

Choisir cette voie : **on initialise avec un tableau vide ici, et la fusion des défauts se fait dans `sharedContentStore.load()` (Task 4)** — exactement comme c'est déjà fait pour les guides/fiches/tips à partir de `content.json`.

Donc, dans editorStore, l'état initial des aides est juste :

```typescript
      aides: [],
```

- [ ] **Step 6 : Build check**

```bash
npm run build
```

Si erreurs TypeScript :
- Vérifier l'import de `DecisionTree`
- Vérifier que `EditorData.aides` est bien optionnel
- Vérifier que toutes les méthodes ont leur signature dans `EditorState`

- [ ] **Step 7 : Commit**

```bash
git add src/stores/editorStore.ts
git commit -m "$(cat <<'EOF'
feat(store): editorStore.aides — CRUD arbres de décision + export/import

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4 : sharedContentStore — sync aides + injection des défauts

**Files:**
- Modify: `src/stores/sharedContentStore.ts`

- [ ] **Step 1 : Étendre l'interface et l'état**

Modifier les imports en haut :

```typescript
import type { CustomTip, FicheMemo, Guide, DecisionTree } from '../types'
import { useEditorStore } from './editorStore'
import { DEFAULT_DECISION_TREES } from '../data/decisionTreesDefault'
```

Étendre l'interface `SharedContentState` :

```typescript
interface SharedContentState {
  tips: CustomTip[]
  fiches: FicheMemo[]
  guides: Guide[]
  aides: DecisionTree[]
  loaded: boolean
  load: () => Promise<void>
  restoreShared: () => Promise<void>
}
```

Étendre l'état initial dans `create<SharedContentState>()(...)` :

```typescript
  tips: [],
  fiches: [],
  guides: [],
  aides: [],
  loaded: false,
```

- [ ] **Step 2 : Étendre la fonction `load`**

Dans la fonction `load`, après la lecture de `data.guides`, lire aussi les aides depuis content.json (si présentes) :

```typescript
      const sharedAides: DecisionTree[] = data.aides ?? []
```

Mettre à jour le `set` initial pour inclure les aides :

```typescript
      set({ tips: sharedTips, fiches: sharedFiches, guides: sharedGuides, aides: sharedAides, loaded: true })
```

Dans le bloc auto-sync (`if (exportDate && lastSeen !== exportDate)`), étendre le setState d'editorStore pour inclure les aides — **avec fallback sur les défauts si content.json n'en contient pas** :

```typescript
      if (exportDate && lastSeen !== exportDate) {
        useEditorStore.setState({
          tips: sharedTips,
          fiches: sharedFiches,
          guides: sharedGuides,
          // Si content.json contient des aides, on prend celles-là.
          // Sinon on remet les défauts (cas où l'admin n'a pas encore exporté).
          aides: sharedAides.length > 0 ? sharedAides : DEFAULT_DECISION_TREES,
        })
        localStorage.setItem(EXPORT_DATE_KEY, exportDate)
        return
      }
```

Dans le bloc fallback additif (`Pas d'auto-sync...`), gérer aussi les aides :

```typescript
      const editorAidesIds = new Set(editor.aides.map(a => a.id))
      const sourceAides = sharedAides.length > 0 ? sharedAides : DEFAULT_DECISION_TREES
      const newAides = sourceAides.filter(a => !editorAidesIds.has(a.id))

      if (newGuides.length > 0 || newFiches.length > 0 || newTips.length > 0 || newAides.length > 0) {
        useEditorStore.setState(s => ({
          guides: [...s.guides, ...newGuides],
          fiches: [...s.fiches, ...newFiches],
          tips: [...s.tips, ...newTips],
          aides: [...s.aides, ...newAides],
        }))
      }
```

- [ ] **Step 3 : Étendre `restoreShared`**

```typescript
  restoreShared: async () => {
    useEditorStore.setState({ tips: [], fiches: [], guides: [], aides: [] })
    localStorage.removeItem(EXPORT_DATE_KEY)
    set({ loaded: false, tips: [], fiches: [], guides: [], aides: [] })
    await get().load()
  },
```

- [ ] **Step 4 : Build check**

```bash
npm run build
```

- [ ] **Step 5 : Commit**

```bash
git add src/stores/sharedContentStore.ts
git commit -m "$(cat <<'EOF'
feat(store): sharedContentStore sync aides + injection des défauts

Si content.json ne contient pas d'aides, on injecte DEFAULT_DECISION_TREES
au premier load, pour que les 2 arbres démo soient visibles dès le départ.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5 : Page AideListe — liste des arbres filtrés par profil

**Files:**
- Create: `src/pages/Aide/AideListe.tsx`

- [ ] **Step 1 : Créer la page**

```typescript
// src/pages/Aide/AideListe.tsx
// Liste des arbres de décision disponibles, filtrés selon le profil de l'agent.
// Tap sur une carte → navigation vers le player /aide/:treeId.

import { Link } from 'react-router-dom'
import { useEditorStore } from '../../stores/editorStore'
import { useProfileStore } from '../../stores/profileStore'
import type { DecisionTree, Specialite, Role } from '../../types'

function isVisibleForProfile(
  tree: DecisionTree,
  specialite: Specialite | null,
  role: Role | null
): boolean {
  // Pas de filtre sur l'arbre → visible par tous
  const hasSpecFilter = (tree.specialitesCibles?.length ?? 0) > 0
  const hasRoleFilter = (tree.rolesCibles?.length ?? 0) > 0
  if (!hasSpecFilter && !hasRoleFilter) return true

  // Filtre actif : l'agent doit matcher au moins une spé (si filtre spé) ET un rôle (si filtre rôle)
  if (hasSpecFilter && (!specialite || !tree.specialitesCibles!.includes(specialite))) return false
  if (hasRoleFilter && (!role || !tree.rolesCibles!.includes(role))) return false
  return true
}

export function AideListe() {
  const aides = useEditorStore((s) => s.aides)
  const { specialite, role } = useProfileStore((s) => ({ specialite: s.specialite, role: s.role }))

  const visibles = aides.filter((a) => isVisibleForProfile(a, specialite, role))

  return (
    <div className="px-4 pt-4 pb-24 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-sncf-dark mb-1">🧭 Aide au choix</h1>
        <p className="text-sm text-gray-600">
          Réponds à quelques questions, le kit te guide vers la bonne action.
        </p>
      </header>

      {visibles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">🧭</p>
          <p>Aucune aide disponible pour ton profil.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibles.map((tree) => (
            <Link
              key={tree.id}
              to={`/aide/${tree.id}`}
              className="block bg-white rounded-2xl border border-gray-200 p-4 active:scale-[0.98] transition"
            >
              <h2 className="font-semibold text-sncf-dark mb-1">{tree.title}</h2>
              {tree.description && (
                <p className="text-sm text-gray-600">{tree.description}</p>
              )}
              <p className="text-xs text-sncf-blue mt-2 font-medium">Démarrer →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2 : Vérifier que les imports profileStore matchent**

Lire `src/stores/profileStore.ts` pour vérifier que `specialite` et `role` sont bien les noms exacts utilisés.

```bash
grep -E "specialite|role" src/stores/profileStore.ts | head -10
```

Si les noms diffèrent (ex : `userProfile.specialite` au lieu de `specialite` direct), adapter le sélecteur Zustand.

- [ ] **Step 3 : Build check**

```bash
npm run build
```

- [ ] **Step 4 : Commit**

```bash
git add src/pages/Aide/AideListe.tsx
git commit -m "$(cat <<'EOF'
feat(aide): page AideListe — liste filtrée par profil

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6 : Page AidePlayer — wizard fullscreen

**Files:**
- Create: `src/pages/Aide/AidePlayer.tsx`

- [ ] **Step 1 : Créer le composant player**

```typescript
// src/pages/Aide/AidePlayer.tsx
// Player wizard fullscreen pour un arbre de décision.
// L'agent voit une question à la fois, choisit une réponse, navigue jusqu'à une feuille.
// Breadcrumb en bas pour le chemin parcouru. Bouton "← retour" pour revenir d'une étape.

import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useEditorStore } from '../../stores/editorStore'
import type { DecisionNode, DecisionLeafResult, DecisionLeafLink } from '../../types'

/** Récupère un nœud par id, ou null si non trouvé */
function getNode(
  nodes: Record<string, DecisionNode>,
  id: string | null
): DecisionNode | null {
  if (!id) return null
  return nodes[id] ?? null
}

/** Construit l'URL interne de destination du lien d'une feuille */
function linkToPath(link: DecisionLeafLink): string {
  switch (link.kind) {
    case 'fiche':
      return `/fiches/${link.id}`
    case 'guide':
      return `/guides/${link.id}`
    case 'catalogue-categorie':
      return `/catalogue/${link.id}`
    case 'catalogue-anomalie':
      // L'id catalogue-anomalie est attendu sous la forme "catId/typeId/anoId"
      return `/catalogue/${link.id}`
  }
}

interface PathStep {
  nodeId: string
  /** Réponse choisie pour passer au nœud suivant (vide si racine) */
  answerLabel?: string
}

export function AidePlayer() {
  const { treeId } = useParams<{ treeId: string }>()
  const navigate = useNavigate()
  const tree = useEditorStore((s) => s.aides.find((a) => a.id === treeId))

  // Historique des nœuds visités (du root au nœud courant inclus)
  const [path, setPath] = useState<PathStep[]>(() =>
    tree ? [{ nodeId: tree.rootNodeId }] : []
  )

  if (!tree) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl mb-2">🧭</p>
          <p className="text-gray-700 mb-4">Aide introuvable.</p>
          <button
            onClick={() => navigate('/aide')}
            className="px-4 py-2 bg-sncf-blue text-white rounded-full"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const currentStep = path[path.length - 1]
  const currentNode = getNode(tree.nodes, currentStep.nodeId)

  if (!currentNode) {
    return (
      <div className="fixed inset-0 bg-red-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-gray-700">Arbre incohérent : nœud manquant.</p>
        </div>
      </div>
    )
  }

  const handleAnswer = (label: string, nextId: string) => {
    setPath((p) => [
      ...p.slice(0, -1),
      { ...p[p.length - 1], answerLabel: label },
      { nodeId: nextId },
    ])
  }

  const handleBack = () => {
    if (path.length > 1) {
      setPath((p) => p.slice(0, -1).map((s, i, arr) => (i === arr.length - 1 ? { nodeId: s.nodeId } : s)))
    }
  }

  const handleRestart = () => {
    setPath([{ nodeId: tree.rootNodeId }])
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-white to-sncf-bg overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate('/aide')}
          aria-label="Quitter"
          className="text-gray-600 text-xl"
        >
          ✕
        </button>
        <h1 className="text-sm font-semibold text-sncf-dark flex-1 truncate">
          {tree.title}
        </h1>
      </header>

      {/* Contenu de l'étape courante */}
      <main className="px-4 py-8 max-w-md mx-auto">
        {currentNode.type === 'question' && (
          <>
            <h2 className="text-2xl font-bold text-sncf-dark mb-2">
              {currentNode.title}
            </h2>
            {currentNode.help && (
              <p className="text-sm text-gray-600 mb-6">{currentNode.help}</p>
            )}
            <div className="flex flex-col gap-3 mt-6">
              {currentNode.answers.map((ans, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(ans.label, ans.nextId)}
                  className="text-left bg-white border-2 border-gray-200 rounded-2xl p-4 min-h-[60px] active:scale-[0.98] active:border-sncf-blue transition"
                >
                  <span className="font-semibold text-sncf-dark">{ans.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {currentNode.type === 'leaf' && (
          <LeafView
            title={currentNode.title}
            result={currentNode.result}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Breadcrumb + bouton retour */}
      {path.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-sncf-blue font-medium text-sm"
          >
            ← Retour
          </button>
          <div className="flex-1 text-xs text-gray-500 truncate">
            {path
              .slice(0, -1)
              .map((s) => s.answerLabel)
              .filter(Boolean)
              .join(' → ')}
          </div>
        </div>
      )}
    </div>
  )
}

interface LeafViewProps {
  title: string
  result: DecisionLeafResult
  onRestart: () => void
}

function LeafView({ title, result, onRestart }: LeafViewProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-sncf-dark mb-4">{title}</h2>

      {result.badge && (
        <div className="mb-4">
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: result.badge.bg, color: result.badge.text }}
          >
            {result.badge.label}
          </span>
        </div>
      )}

      {result.description && (
        <pre className="whitespace-pre-wrap font-sans text-base text-gray-800 bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          {result.description}
        </pre>
      )}

      {result.checklist && result.checklist.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">À vérifier :</h3>
          <ul className="flex flex-col gap-2">
            {result.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                <span className="text-sncf-blue mt-0.5">☐</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.link && (
        <Link
          to={linkToPath(result.link)}
          className="block bg-sncf-blue text-white rounded-2xl p-4 text-center font-semibold mb-3"
        >
          {result.link.label} →
        </Link>
      )}

      <button
        onClick={onRestart}
        className="w-full text-sncf-blue font-medium text-sm py-3"
      >
        ↺ Recommencer
      </button>
    </div>
  )
}
```

- [ ] **Step 2 : Build check**

```bash
npm run build
```

Si erreurs sur classes Tailwind `sncf-*` : vérifier avec `grep "sncf-blue\|sncf-dark\|sncf-bg" src/index.css` qu'elles existent. Si une classe manque, remplacer par hex direct (ex : `bg-[#00A3E0]` pour sncf-blue, `text-[#0C1E5B]` pour sncf-dark).

- [ ] **Step 3 : Commit**

```bash
git add src/pages/Aide/AidePlayer.tsx
git commit -m "$(cat <<'EOF'
feat(aide): page AidePlayer — wizard fullscreen avec breadcrumb

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7 : Routing — App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1 : Ajouter les imports**

Ajouter dans le bloc des imports de pages :

```typescript
import { AideListe } from './pages/Aide/AideListe'
import { AidePlayer } from './pages/Aide/AidePlayer'
```

- [ ] **Step 2 : Ajouter les routes**

Dans la branche `if (!isConfigured)` : pas besoin (l'aide n'est utile qu'avec un profil).

Dans la branche principale (avec `<Layout>`), à l'intérieur de `<Route element={<Layout />}>`, ajouter avant la route `/alertes` :

```typescript
        <Route path="/aide" element={<AideListe />} />
        <Route path="/aide/:treeId" element={<AidePlayer />} />
```

Modifier la route existante `/alertes` pour rediriger vers `/aide` :

Avant :

```typescript
        <Route path="/alertes" element={
          <Placeholder titre="Alertes" icon="🔔" description="Informations, alertes et bonnes pratiques" brique="Brique 6" />
        } />
```

Après :

```typescript
        <Route path="/alertes" element={<Navigate to="/aide" replace />} />
```

- [ ] **Step 3 : Build check**

```bash
npm run build
```

- [ ] **Step 4 : Smoke test manuel**

```bash
npm run dev
```

Ouvrir successivement :
- `http://localhost:5173/kit-anomalie/aide` — voir la liste des 2 arbres démo
- Cliquer sur « Quelle appli ouvrir ? » → arriver sur le wizard avec la première question
- Choisir « Voie courante » → arriver sur la feuille EF3C0 avec le bouton « Voir le guide »
- Cliquer « ↺ Recommencer » → revenir à la racine
- `http://localhost:5173/kit-anomalie/alertes` — doit rediriger vers `/aide`

Si quelque chose cloche, débuguer avant de commiter. Sinon couper le serveur et passer au commit.

- [ ] **Step 5 : Commit**

```bash
git add src/App.tsx
git commit -m "$(cat <<'EOF'
feat(aide): routes /aide et /aide/:treeId, redirect /alertes

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8 : Home tile — remplacer 🔔 Alertes par 🧭 Aide au choix

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1 : Repérer la tuile actuelle**

```bash
grep -n "Alertes\|🔔\|/alertes" src/pages/Home.tsx
```

- [ ] **Step 2 : Remplacer la tuile**

Trouver la ligne qui contient :

```typescript
{ icon: '🔔', label: 'Alertes', desc: 'Bon à savoir', path: '/alertes', color: 'bg-red-50 border-sncf-red/20' },
```

La remplacer par :

```typescript
{ icon: '🧭', label: 'Aide au choix', desc: 'Quel choix faire ?', path: '/aide', color: 'bg-blue-50 border-sncf-blue/20' },
```

- [ ] **Step 3 : Build check + smoke test**

```bash
npm run build
npm run dev
```

Ouvrir la home (`/`), vérifier que la tuile « Aide au choix » apparaît avec l'icône boussole et qu'elle navigue vers `/aide`.

- [ ] **Step 4 : Commit**

```bash
git add src/pages/Home.tsx
git commit -m "$(cat <<'EOF'
feat(aide): tuile home « 🧭 Aide au choix » remplace « 🔔 Alertes »

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9 : Page EditorAides — éditeur admin form-based

**Files:**
- Create: `src/pages/EditorAides.tsx`

- [ ] **Step 1 : Créer la page éditeur**

```typescript
// src/pages/EditorAides.tsx
// Éditeur admin des arbres de décision (brique 6).
// Pattern form-based, pas de drag-and-drop. CRUD complet via formulaires simples.

import { useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import type { DecisionTree, DecisionNode, Specialite, Role } from '../types'

const SPECIALITES: Specialite[] = ['voie', 'seg', 'eale', 'cat', 'sm']
const ROLES: Role[] = ['agent_req', 'ordonnanceur', 'rp']

function makeNodeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function newEmptyTree(): DecisionTree {
  const rootId = makeNodeId('q')
  return {
    id: `aide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: 'Nouvel arbre',
    description: '',
    rootNodeId: rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        type: 'question',
        title: 'Première question ?',
        answers: [],
      },
    },
  }
}

export function EditorAides() {
  const aides = useEditorStore((s) => s.aides)
  const upsertAide = useEditorStore((s) => s.upsertAide)
  const deleteAide = useEditorStore((s) => s.deleteAide)

  const [editingId, setEditingId] = useState<string | null>(null)
  const editingTree = aides.find((a) => a.id === editingId) ?? null

  const handleCreate = () => {
    const tree = newEmptyTree()
    upsertAide(tree)
    setEditingId(tree.id)
  }

  const handleDuplicate = (tree: DecisionTree) => {
    const clone: DecisionTree = {
      ...tree,
      id: `aide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: `${tree.title} (copie)`,
    }
    upsertAide(clone)
  }

  if (editingTree) {
    return (
      <TreeEditor
        tree={editingTree}
        onSave={(t) => upsertAide(t)}
        onClose={() => setEditingId(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleCreate}
        className="bg-sncf-blue text-white rounded-xl px-4 py-2 font-medium self-start"
      >
        + Nouvel arbre
      </button>

      {aides.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          Aucun arbre. Crées-en un pour commencer.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {aides.map((tree) => (
            <div
              key={tree.id}
              className="bg-white border border-gray-200 rounded-xl p-3 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sncf-dark truncate">{tree.title}</h3>
                <p className="text-xs text-gray-500">
                  {Object.keys(tree.nodes).length} nœud(s)
                  {tree.specialitesCibles?.length
                    ? ` · spé : ${tree.specialitesCibles.join(', ')}`
                    : ''}
                </p>
              </div>
              <button
                onClick={() => setEditingId(tree.id)}
                className="text-sncf-blue text-sm font-medium"
              >
                Éditer
              </button>
              <button
                onClick={() => handleDuplicate(tree)}
                className="text-gray-600 text-sm"
              >
                Dupliquer
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer "${tree.title}" ?`)) deleteAide(tree.id)
                }}
                className="text-red-600 text-sm"
              >
                Suppr.
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface TreeEditorProps {
  tree: DecisionTree
  onSave: (tree: DecisionTree) => void
  onClose: () => void
}

function TreeEditor({ tree, onSave, onClose }: TreeEditorProps) {
  const [draft, setDraft] = useState<DecisionTree>(tree)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)

  const updateDraft = (patch: Partial<DecisionTree>) => {
    setDraft((d) => ({ ...d, ...patch }))
  }

  const updateNode = (nodeId: string, patch: Partial<DecisionNode>) => {
    setDraft((d) => ({
      ...d,
      nodes: {
        ...d.nodes,
        [nodeId]: { ...d.nodes[nodeId], ...patch } as DecisionNode,
      },
    }))
  }

  const addQuestion = () => {
    const id = makeNodeId('q')
    setDraft((d) => ({
      ...d,
      nodes: {
        ...d.nodes,
        [id]: { id, type: 'question', title: 'Nouvelle question', answers: [] },
      },
    }))
    setEditingNodeId(id)
  }

  const addLeaf = () => {
    const id = makeNodeId('leaf')
    setDraft((d) => ({
      ...d,
      nodes: {
        ...d.nodes,
        [id]: { id, type: 'leaf', title: 'Nouveau résultat', result: { description: '' } },
      },
    }))
    setEditingNodeId(id)
  }

  const deleteNode = (id: string) => {
    if (id === draft.rootNodeId) {
      alert('Impossible de supprimer le nœud racine.')
      return
    }
    if (!confirm('Supprimer ce nœud ?')) return
    setDraft((d) => {
      const { [id]: _removed, ...rest } = d.nodes
      // Nettoyer les références orphelines depuis les questions existantes
      const cleaned: Record<string, DecisionNode> = {}
      for (const [nid, node] of Object.entries(rest)) {
        if (node.type === 'question') {
          cleaned[nid] = {
            ...node,
            answers: node.answers.filter((a) => a.nextId !== id),
          }
        } else {
          cleaned[nid] = node
        }
      }
      return { ...d, nodes: cleaned }
    })
  }

  const handleSave = () => {
    onSave(draft)
    onClose()
  }

  const editingNode = editingNodeId ? draft.nodes[editingNodeId] : null

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-sncf-blue text-sm font-medium">
          ← Retour
        </button>
        <button
          onClick={handleSave}
          className="bg-sncf-blue text-white rounded-xl px-4 py-2 font-medium"
        >
          Enregistrer
        </button>
      </div>

      {/* Métadonnées de l'arbre */}
      <fieldset className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-3">
        <legend className="px-2 text-xs font-semibold text-gray-700">Arbre</legend>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => updateDraft({ title: e.target.value })}
          placeholder="Titre"
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <textarea
          value={draft.description ?? ''}
          onChange={(e) => updateDraft({ description: e.target.value })}
          placeholder="Description (optionnelle)"
          rows={2}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Spécialités ciblées (vide = toutes)
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALITES.map((sp) => {
              const checked = draft.specialitesCibles?.includes(sp) ?? false
              return (
                <label key={sp} className="text-sm flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const current = draft.specialitesCibles ?? []
                      updateDraft({
                        specialitesCibles: e.target.checked
                          ? [...current, sp]
                          : current.filter((s) => s !== sp),
                      })
                    }}
                  />
                  {sp}
                </label>
              )
            })}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Rôles ciblés (vide = tous)
          </label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => {
              const checked = draft.rolesCibles?.includes(r) ?? false
              return (
                <label key={r} className="text-sm flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const current = draft.rolesCibles ?? []
                      updateDraft({
                        rolesCibles: e.target.checked
                          ? [...current, r]
                          : current.filter((x) => x !== r),
                      })
                    }}
                  />
                  {r}
                </label>
              )
            })}
          </div>
        </div>
      </fieldset>

      {/* Liste des nœuds */}
      <fieldset className="bg-white border border-gray-200 rounded-xl p-3">
        <legend className="px-2 text-xs font-semibold text-gray-700">Nœuds</legend>
        <div className="flex gap-2 mb-3">
          <button onClick={addQuestion} className="text-sm bg-gray-100 rounded-lg px-3 py-1">
            + Question
          </button>
          <button onClick={addLeaf} className="text-sm bg-gray-100 rounded-lg px-3 py-1">
            + Feuille
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {Object.values(draft.nodes).map((node) => (
            <div
              key={node.id}
              className="border border-gray-200 rounded-lg p-2 flex items-center gap-2"
            >
              <span className="text-xs">
                {node.type === 'question' ? '❓' : '🎯'}
              </span>
              <span className="flex-1 truncate text-sm">
                {node.title}
                {node.id === draft.rootNodeId && (
                  <span className="ml-2 text-xs bg-sncf-blue text-white rounded px-1.5">racine</span>
                )}
              </span>
              <button
                onClick={() => setEditingNodeId(node.id)}
                className="text-sm text-sncf-blue"
              >
                Éditer
              </button>
              <button
                onClick={() => deleteNode(node.id)}
                className="text-sm text-red-600"
              >
                Suppr.
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Édition d'un nœud (modale simple inline) */}
      {editingNode && (
        <NodeEditor
          node={editingNode}
          allNodes={draft.nodes}
          onChange={(patch) => updateNode(editingNode.id, patch)}
          onClose={() => setEditingNodeId(null)}
        />
      )}
    </div>
  )
}

interface NodeEditorProps {
  node: DecisionNode
  allNodes: Record<string, DecisionNode>
  onChange: (patch: Partial<DecisionNode>) => void
  onClose: () => void
}

function NodeEditor({ node, allNodes, onChange, onClose }: NodeEditorProps) {
  return (
    <fieldset className="bg-blue-50 border-2 border-sncf-blue rounded-xl p-3 flex flex-col gap-3">
      <legend className="px-2 text-xs font-semibold text-sncf-dark">
        Édition : {node.type === 'question' ? 'question' : 'feuille'}
      </legend>

      <input
        type="text"
        value={node.title}
        onChange={(e) => onChange({ title: e.target.value } as Partial<DecisionNode>)}
        placeholder="Titre / question"
        className="border border-gray-300 rounded-lg px-3 py-2"
      />

      {node.type === 'question' && (
        <>
          <input
            type="text"
            value={node.help ?? ''}
            onChange={(e) => onChange({ help: e.target.value } as Partial<DecisionNode>)}
            placeholder="Aide contextuelle (optionnelle)"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Réponses</label>
            <div className="flex flex-col gap-2">
              {node.answers.map((ans, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={ans.label}
                    onChange={(e) => {
                      const newAnswers = [...node.answers]
                      newAnswers[i] = { ...newAnswers[i], label: e.target.value }
                      onChange({ answers: newAnswers } as Partial<DecisionNode>)
                    }}
                    placeholder="Libellé"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <select
                    value={ans.nextId}
                    onChange={(e) => {
                      const newAnswers = [...node.answers]
                      newAnswers[i] = { ...newAnswers[i], nextId: e.target.value }
                      onChange({ answers: newAnswers } as Partial<DecisionNode>)
                    }}
                    className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
                  >
                    <option value="">→ ?</option>
                    {Object.values(allNodes)
                      .filter((n) => n.id !== node.id)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.type === 'question' ? '❓' : '🎯'} {n.title}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      onChange({
                        answers: node.answers.filter((_, j) => j !== i),
                      } as Partial<DecisionNode>)
                    }}
                    className="text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  onChange({
                    answers: [...node.answers, { label: '', nextId: '' }],
                  } as Partial<DecisionNode>)
                }
                className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1 self-start"
              >
                + Ajouter une réponse
              </button>
            </div>
          </div>
        </>
      )}

      {node.type === 'leaf' && (
        <>
          <textarea
            value={node.result.description ?? ''}
            onChange={(e) =>
              onChange({
                result: { ...node.result, description: e.target.value },
              } as Partial<DecisionNode>)
            }
            placeholder="Description / template"
            rows={4}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <textarea
            value={(node.result.checklist ?? []).join('\n')}
            onChange={(e) =>
              onChange({
                result: {
                  ...node.result,
                  checklist: e.target.value.split('\n').filter((l) => l.trim()),
                },
              } as Partial<DecisionNode>)
            }
            placeholder="Checklist (une ligne par item)"
            rows={3}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <div className="text-xs text-gray-500">
            Lien vers fiche/guide/catalogue : édition avancée à faire en JSON pour l'instant.
            En V1 vous pouvez exporter, modifier le JSON, ré-importer.
          </div>
        </>
      )}

      <button
        onClick={onClose}
        className="bg-sncf-blue text-white rounded-lg px-4 py-2 font-medium self-end"
      >
        Fermer
      </button>
    </fieldset>
  )
}
```

**Note V1 :** l'édition du `link` d'une feuille n'est pas exposée dans l'UI (trop d'options : 4 kinds × picker des ids). Pour V1, l'admin édite ce champ via export → modif JSON → import. À ajouter en V2 avec un picker dédié.

- [ ] **Step 2 : Build check**

```bash
npm run build
```

- [ ] **Step 3 : Commit**

```bash
git add src/pages/EditorAides.tsx
git commit -m "$(cat <<'EOF'
feat(aide): éditeur admin form-based pour les arbres de décision

CRUD arbres + nœuds + réponses. Édition du link de feuille via JSON
en V1 (picker dédié en V2).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10 : Editor.tsx — onglet « Aide au choix »

**Files:**
- Modify: `src/pages/Editor.tsx`

- [ ] **Step 1 : Lire le fichier pour calage**

```bash
cat src/pages/Editor.tsx
```

Repérer :
- Le type `Tab` (ligne ~10)
- Le tableau `TABS` (ligne ~12)
- Le `useState<Tab>('tips')`
- Les imports

- [ ] **Step 2 : Ajouter l'import**

```typescript
import { EditorAides } from './EditorAides'
```

- [ ] **Step 3 : Étendre le type Tab et le tableau TABS**

Avant :

```typescript
type Tab = 'tips' | 'fiches' | 'guides' | 'catalogue' | 'quiz'
```

Après :

```typescript
type Tab = 'tips' | 'fiches' | 'guides' | 'catalogue' | 'quiz' | 'aides'
```

Avant :

```typescript
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'tips', label: 'Conseils', icon: '💡' },
  { id: 'fiches', label: 'Fiches', icon: '📋' },
  { id: 'guides', label: 'Guides', icon: '📖' },
  { id: 'catalogue', label: 'Catalogue', icon: '📚' },
  { id: 'quiz', label: 'Quiz', icon: '🧠' },
]
```

Après :

```typescript
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'tips', label: 'Conseils', icon: '💡' },
  { id: 'fiches', label: 'Fiches', icon: '📋' },
  { id: 'guides', label: 'Guides', icon: '📖' },
  { id: 'catalogue', label: 'Catalogue', icon: '📚' },
  { id: 'quiz', label: 'Quiz', icon: '🧠' },
  { id: 'aides', label: 'Aide au choix', icon: '🧭' },
]
```

- [ ] **Step 4 : Brancher le rendu de l'onglet**

Trouver la zone qui rend le contenu de l'onglet actif (cherche `activeTab === 'tips'` ou un switch/case équivalent). Ajouter le rendu pour l'onglet aides :

Si c'est un switch sur `activeTab`, ajouter :

```typescript
        {activeTab === 'aides' && <EditorAides />}
```

- [ ] **Step 5 : Build + smoke test**

```bash
npm run build
npm run dev
```

Aller sur `/admin` → cliquer sur l'onglet « 🧭 Aide au choix » → vérifier que la liste des arbres apparaît, qu'on peut créer, dupliquer, supprimer, éditer.

- [ ] **Step 6 : Commit**

```bash
git add src/pages/Editor.tsx
git commit -m "$(cat <<'EOF'
feat(aide): onglet « Aide au choix » dans l'éditeur admin

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11 : Bump version, lint, push

**Files:**
- Modify: `public/version.json`

- [ ] **Step 1 : Lire la version courante**

```bash
cat public/version.json
```

- [ ] **Step 2 : Bumper**

Augmenter le numéro mineur (ex : `0.10.0` → `0.11.0`). Format :

```json
{"v": "0.11.0"}
```

- [ ] **Step 3 : Lint check**

```bash
npm run lint 2>&1 | tail -30
```

Si des erreurs apparaissent dans les fichiers de la brique 6 (tasks 1-10), les corriger. Ignorer les erreurs pré-existantes dans `catalogueSvgs.tsx`, `CatalogueFiche.tsx`, `EditorFiches.tsx`, `EditorGuides.tsx` — elles sont hors scope.

- [ ] **Step 4 : Build final**

```bash
npm run build 2>&1 | tail -10
```

Expected : OK.

- [ ] **Step 5 : Commit + push**

```bash
git add public/version.json
git commit -m "$(cat <<'EOF'
chore(release): bump version pour la brique 6 « Aide au choix »

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

- [ ] **Step 6 : Vérifier le déploiement**

Attendre 30-60s, puis ouvrir `https://kit-anomalie.github.io/kit-anomalie/aide` dans le navigateur. Expected : la liste des 2 arbres démo s'affiche.

---

## Validation finale

À la fin de l'exécution :

- [ ] Route `/aide` affiche les 2 arbres démo (filtrés selon le profil)
- [ ] Tap sur un arbre → wizard fullscreen avec la première question
- [ ] Choix d'une réponse → navigation vers le nœud suivant
- [ ] Feuille avec template + checklist + lien interne (le cas EF3C0 a un lien guide)
- [ ] Bouton « ↺ Recommencer » revient à la racine
- [ ] Bouton « ✕ » quitte vers `/aide`
- [ ] Breadcrumb en bas montre le chemin parcouru
- [ ] `/alertes` redirige vers `/aide`
- [ ] Tuile home « 🧭 Aide au choix » présente
- [ ] Onglet admin permet de créer / éditer / supprimer / dupliquer un arbre
- [ ] Build + lint passent
- [ ] Déployé en production sur GitHub Pages

## Hors scope V1 (V2 candidates)

- Picker UI pour le `link` d'une feuille (V1 : édition JSON)
- Bouton « copier dans le presse-papier » sur les feuilles template
- Statistiques d'usage (combien de fois l'arbre joué, chemin majoritaire)
- Partage de chemin par URL (`/aide/:treeId?path=Q1-r2-Q2-r1`)
- Mode preview admin (lancer l'arbre depuis l'éditeur sans publier)
- Éditeur visuel arborescent drag-and-drop
- Visualisation graphique de l'arbre (mermaid ou autre)
