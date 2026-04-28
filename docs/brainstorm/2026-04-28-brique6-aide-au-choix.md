# Design — Brique 6 : Aide au choix (arbres de décision)

**Date :** 28 avril 2026
**Statut :** Design verrouillé, prêt pour plan d'implémentation
**Objectif :** Transformer la brique 6 placeholder en une brique d'arbres de décision interactifs qui guident l'agent terrain par questions/réponses.

---

## Contexte et positionnement

Le Kit Anomalie est un **kit interactif** pour agents terrain. Les 5 briques existantes sont toutes en mode **consultation passive** (lire un guide, une fiche, un quiz, le catalogue, l'assistant). Il manque une brique **interactive** où l'agent pose une question et le kit le mène à la bonne action — ce qui est précisément ce que la littérature « job aid / performance support » identifie comme le format le plus discriminant d'un kit terrain.

**Réf recherche :**
- Decision trees & flowcharts cités comme format majeur des job aids modernes
- Mobile UX field worker 2026 : focus sur task identification, information access en quelques taps
- KPI cible : first-time fix rate (88 % chez les meilleurs vs 60 % chez les bottom performers)

---

## 1. Périmètre V1

**Brique 6 — « Aide au choix »** : arbres de décision interactifs.

L'agent ouvre la brique, choisit un arbre, répond à 2-5 questions, arrive à une feuille (résultat) qui peut être :
- du texte
- un badge classement (réutilise les couleurs du catalogue)
- une checklist
- un lien interne vers fiche / guide / catégorie ou anomalie du catalogue

**Effort estimé :** ~3 jours.

---

## 2. Player UI : fullscreen wizard

**Format retenu :** un écran par question, avec :
- Titre de l'arbre en header
- Question en grand au centre
- Réponses comme grosses cards tappables (touch targets ≥ 60 px pour gants)
- Aide contextuelle optionnelle sous la question
- Breadcrumb en bas pour voir le chemin parcouru
- Bouton « ← retour à la question précédente »

À la feuille (résultat) :
- Affichage du résultat (texte, badge, checklist, lien)
- Bouton « ↺ Recommencer »
- Bouton « 🔗 Partager le résultat » (V2)

**Pourquoi pas card stack ou chat conversationnel :** terrain avec gants + lecture rapide + focus mono-tâche. Le fullscreen wizard est le format le plus sûr.

---

## 3. Modèle de données

```typescript
type Node =
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
      result: LeafResult
    }

type LeafResult = {
  description?: string
  badge?: { label: string; color: string }
  checklist?: string[]
  link?: {
    kind: 'fiche' | 'guide' | 'catalogue-categorie' | 'catalogue-anomalie'
    id: string
    label: string
  }
  // V2 : 'template' avec copier-presse-papier
}

type DecisionTree = {
  id: string
  title: string
  description?: string
  rootNodeId: string
  nodes: Record<string, Node>
  specialitesCibles?: Specialite[]
  rolesCibles?: Role[]
}
```

**Structure :** flat map de nœuds indexés par id, plus une racine. Chaque réponse pointe vers un nextId. Permet :
- Multiples chemins arrivant au même nœud (réutilisation)
- Édition d'un nœud sans casser l'arbre entier
- Sérialisation JSON simple

---

## 4. Connexions inter-briques (V1)

Les feuilles peuvent renvoyer vers :
- **Fiche** (brique 2) — `link.kind: 'fiche'`
- **Guide** (brique 1) — `link.kind: 'guide'`
- **Catégorie du catalogue** (brique 4) — `link.kind: 'catalogue-categorie'`
- **Anomalie du catalogue** (brique 4) — `link.kind: 'catalogue-anomalie'`

Ces liens transforment les arbres en **point d'entrée du kit** : l'agent répond à 2 questions et arrive directement sur la bonne ressource des autres briques, au lieu de naviguer à la main.

Plus, autonome :
- Texte
- Checklist
- Badge classement (palette catalogue)

---

## 5. Architecture technique

### Stores
- **`aidesStore`** (nouveau) — CRUD arbres, persist, version migrée
- **`sharedContentStore`** — étendu pour synchroniser `aides` depuis `content.json`

### Pages
- **`/aide`** — liste des arbres (filtrés par profil agent)
- **`/aide/:treeId`** — player wizard du parcours
- **`/admin` → onglet « Aide au choix »** — éditeur form-based

### Routing
- Ajouter route `/aide` dans `App.tsx` sous `Layout`
- Remplacer la route placeholder `/alertes` par redirect vers `/aide`
- Bottom nav : icône `🧭` à la place de `🔔`

### Éditeur admin (form-based, pas de drag-and-drop)
- Liste des arbres avec actions (créer, dupliquer, supprimer, exporter)
- Pour chaque arbre : éditeur de métadonnées + liste des nœuds + édition d'un nœud
- Pour un nœud question : titre, aide, ajout/suppression de réponses, sélection du nœud suivant via dropdown
- Pour un nœud feuille : titre, description, badge, checklist, sélection du lien interne
- Visualisation de l'arbre via texte indenté (pas de canvas drag-and-drop en V1)

---

## 6. Contenu V1 — 2 arbres démo

### Arbre 1 — « Quelle appli ouvrir pour résoudre mon anomalie ? »

Entrée : type d'anomalie (les 6 catégories du catalogue).
Sortie : appli métier à utiliser + lien vers le guide associé (si guide existe).

Structure type :
```
Q1 : Type d'anomalie ?
├─ Voie courante → leaf : appli A + lien guide A
├─ Appareils de voie → leaf : appli B + lien guide B
├─ Ouvrages & Gabarit → leaf : appli C
├─ Abords → leaf : appli D
├─ Installations signalisation → leaf : appli E
└─ Platelage → leaf : appli F
```

### Arbre 2 — « Comment décrire mon anomalie ? »

Entrée : type d'anomalie.
Sortie : template descriptif (texte affiché, copier-coller manuel en V1).

Structure type :
```
Q1 : Type d'anomalie ?
├─ Voie courante → leaf : template "Localisation, type défaut, mesure, météo, photo"
├─ Appareils de voie → leaf : template adapté
├─ ...
```

**Note V1 :** pas de bouton « copier dans le presse-papier » — le texte est affiché, l'agent le recopie. Bouton presse-papier en V2.

---

## 7. Filtrage par profil

Chaque `DecisionTree` peut déclarer `specialitesCibles` et `rolesCibles`. Comportement :

- Si les deux champs sont vides ou absents → l'arbre est visible par tous.
- Sinon → l'arbre n'apparaît dans `/aide` que si le profil de l'agent matche au moins une spécialité ET au moins un rôle déclarés.
- Côté admin, tous les arbres sont visibles indépendamment du profil (pour pouvoir les éditer).

Réutilise exactement le pattern existant des guides (brique 1).

---

## 8. Synchronisation et persistence

Mêmes patterns que les briques existantes :
- Persistence locale via Zustand persist (`kit-anomalie-aides` dans localStorage)
- Auto-sync via `sharedContentStore` comparant `content.json.exportDate` vs `localStorage.kit-anomalie-content-exportdate`
- Import / export JSON dans l'éditeur admin
- Workflow Mathilde + Wilfried : merge automatique sans écrasement (pareil que fiches/guides/quiz)

---

## 9. Hors périmètre V1

- Éditeur visuel arborescent drag-and-drop (V2)
- Bouton « copier dans le presse-papier » sur les feuilles template (V2)
- Statistiques d'usage (combien de fois l'arbre joué, quel chemin majoritaire) (V2)
- Partage de chemin par URL (`/aide/:treeId?path=Q1-r2-Q2-r1`) (V2)
- Mode preview admin (lancer l'arbre depuis l'éditeur sans publier) (V2)
- Ajout d'autres arbres dans le contenu démo (l'admin les ajoutera via UI quand besoin terrain)

---

## 10. Questions ouvertes

Aucune. Toutes les décisions structurantes sont tranchées.

---

## 11. Cohérence avec les autres briques

| Brique | Rôle | Lien avec brique 6 |
|---|---|---|
| 0 Accueil | Profil + filtre | Filtre les arbres pertinents par spécialité/rôle |
| 1 Guides | Walkthrough par appli | Cible des liens depuis feuilles d'arbre |
| 2 Fiches | Mémo réflexes | Cible des liens depuis feuilles d'arbre |
| 3 Quiz | Formation | Pas de connexion directe |
| 4 Catalogue | Référentiel anomalies | Cible des liens, palette de couleurs réutilisée |
| 5 Assistant | Recherche IA | Complémentaire (assistant = recherche libre, brique 6 = parcours guidé) |
| 7 Admin | Éditeur | Étendu d'un onglet « Aide au choix » |

---

## 12. Critères de succès V1

- 2 arbres démo fonctionnels avec contenu cohérent métier
- Filtrage par profil opérationnel (agent ne voit que les arbres pertinents pour sa spécialité)
- Édition admin complète : créer, modifier, supprimer un arbre, ajouter/modifier nœuds
- Lien depuis une feuille vers fiche/guide/catégorie navigue correctement
- Sync `content.json` fonctionnelle (push admin → propagation auto chez les autres devices)
- Build + lint propres
- UX terrain : touch targets ≥ 60 px, lisible avec gants, pas de friction
