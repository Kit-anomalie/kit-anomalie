// === Roadmap — Kit Anomalie ===

export type SprintStatus = 'completed' | 'active' | 'upcoming'

export interface Jalon {
  titre: string
  fait: boolean
}

export interface Sprint {
  nom: string
  codename: string
  icon: string
  status: SprintStatus
  periode: string
  objectif: string
  jalons: Jalon[]
}

export interface Brique {
  numero: number
  nom: string
  codename: string
  icon: string
  status: 'done' | 'in_progress' | 'planned' | 'not_started'
  progress: number // 0-100
  description: string
}

// === Les 8 briques ===

export const BRIQUES: Brique[] = [
  { numero: 0, nom: 'Accueil & Profil', codename: 'GENESIS', icon: '🏠', status: 'done', progress: 100, description: 'Page d\'accueil, sélection du rôle, spécialité et applications métier' },
  { numero: 1, nom: 'Guides par application', codename: 'NAVIGATOR', icon: '📖', status: 'in_progress', progress: 30, description: 'Guides pas-à-pas interactifs pour chaque application métier' },
  { numero: 2, nom: 'Fiches mémo réflexes', codename: 'REFLEX', icon: '📋', status: 'in_progress', progress: 40, description: 'Fiches courtes avec les gestes clés, erreurs à éviter, référentiels' },
  { numero: 3, nom: 'Parcours onboarding', codename: 'ACADEMY', icon: '🎓', status: 'planned', progress: 0, description: 'Formation progressive adaptée au profil avec quiz de validation' },
  { numero: 4, nom: 'Anomalies par actif', codename: 'RADAR', icon: '🔍', status: 'planned', progress: 0, description: 'Consultation des anomalies existantes, recherche par actif, anti-doublons' },
  { numero: 5, nom: 'Assistant IA', codename: 'ORACLE', icon: '🤖', status: 'planned', progress: 0, description: 'Aide à la rédaction de descriptions et suggestion de classement' },
  { numero: 6, nom: 'Bon à savoir & alertes', codename: 'SENTINEL', icon: '🔔', status: 'planned', progress: 0, description: 'Alertes réglementaires, bonnes pratiques, rappels contextuels' },
  { numero: 7, nom: 'Administration (BO)', codename: 'COMMAND', icon: '⚙️', status: 'not_started', progress: 0, description: 'Back-office : gestion des guides, fiches, imports Excel, alertes' },
]

// === Sprints ===

export const SPRINTS: Sprint[] = [
  {
    nom: 'Sprint 1', codename: 'FIRST LIGHT', icon: '🚀', status: 'completed',
    periode: 'Mars — Avril 2025',
    objectif: 'Fondations : profil, navigation, 1 guide, 4 fiches',
    jalons: [
      { titre: 'Setup technique (React, Vite, Tailwind, CI/CD)', fait: true },
      { titre: 'Profil utilisateur (rôle, spécialité, applis)', fait: true },
      { titre: 'Page d\'accueil & navigation mobile', fait: true },
      { titre: 'Guide démo EF3C0', fait: true },
      { titre: '4 fiches mémo (classement, description, doublons, DLF)', fait: true },
      { titre: 'PWA & déploiement GitHub Pages', fait: true },
    ],
  },
  {
    nom: 'Sprint 2', codename: 'DEEP DIVE', icon: '🎯', status: 'active',
    periode: 'Avril — Mai 2025',
    objectif: 'Enrichir : plus de guides et fiches, couvrir toutes les spécialités',
    jalons: [
      { titre: 'Roadmap partageable', fait: true },
      { titre: 'Système de favoris et récents', fait: true },
      { titre: 'Guides ADV Mobile & SPOT Mobile', fait: false },
      { titre: 'Guides S6A7 & EF4B1', fait: false },
      { titre: 'Fiches mémo supplémentaires (embarquement, MPC, MC)', fait: false },
      { titre: 'Recherche globale', fait: false },
    ],
  },
  {
    nom: 'Sprint 3', codename: 'ACADEMY', icon: '🎓', status: 'upcoming',
    periode: 'Mai — Juin 2025',
    objectif: 'Onboarding adaptatif avec quiz et progression',
    jalons: [
      { titre: 'Parcours de formation par rôle/spécialité', fait: false },
      { titre: 'Système de quiz avec feedback', fait: false },
      { titre: 'Contenu des modules de formation', fait: false },
    ],
  },
  {
    nom: 'Sprint 4', codename: 'RADAR', icon: '📡', status: 'upcoming',
    periode: 'Juillet — Août 2025',
    objectif: 'Anomalies par actif — consultation, recherche, anti-doublons',
    jalons: [
      { titre: 'Recherche d\'actif et fiche anomalies', fait: false },
      { titre: 'Détection de doublons', fait: false },
      { titre: 'Import données de test (Excel)', fait: false },
    ],
  },
  {
    nom: 'Sprint 5', codename: 'ORACLE', icon: '🧠', status: 'upcoming',
    periode: 'Sept — Oct 2025',
    objectif: 'Assistant IA — aide rédaction et classement',
    jalons: [
      { titre: 'Interface assistant', fait: false },
      { titre: 'Suggestions de description et classement', fait: false },
      { titre: 'Intégration LLM', fait: false },
    ],
  },
  {
    nom: 'Sprint 6', codename: 'SENTINEL', icon: '🛡️', status: 'upcoming',
    periode: 'Nov — Déc 2025',
    objectif: 'Alertes, bonnes pratiques, contenu réglementaire',
    jalons: [
      { titre: 'Système d\'alertes et notifications', fait: false },
      { titre: 'Contenu réglementaire (MT00342, DLF)', fait: false },
      { titre: 'Bonnes pratiques contextuelles', fait: false },
    ],
  },
]
