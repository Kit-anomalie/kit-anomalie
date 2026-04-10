// === Roadmap — Kit Anomalie ===
// Pour mettre à jour : modifie les jalons (fait: true/false) et push.
// Les jauges des briques se calculent automatiquement.

export type SprintStatus = 'completed' | 'active' | 'upcoming'

export interface Jalon {
  titre: string
  fait: boolean
  brique?: number // lie ce jalon à une brique → alimente sa jauge
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
  description: string
}

// === Les 8 briques ===

export const BRIQUES: Brique[] = [
  { numero: 0, nom: 'Accueil & Profil', codename: 'GENESIS', icon: '🏠', description: 'Page d\'accueil, sélection du rôle, spécialité et applications métier' },
  { numero: 1, nom: 'Guides par application', codename: 'NAVIGATOR', icon: '📖', description: 'Guides pas-à-pas interactifs pour chaque application métier' },
  { numero: 2, nom: 'Fiches mémo réflexes', codename: 'REFLEX', icon: '📋', description: 'Fiches courtes avec les gestes clés, erreurs à éviter, référentiels' },
  { numero: 3, nom: 'Parcours onboarding', codename: 'ACADEMY', icon: '🎓', description: 'Formation progressive adaptée au profil avec quiz de validation' },
  { numero: 4, nom: 'Anomalies par actif', codename: 'RADAR', icon: '🔍', description: 'Consultation des anomalies existantes, recherche par actif, anti-doublons' },
  { numero: 5, nom: 'Assistant IA', codename: 'ORACLE', icon: '🤖', description: 'Aide à la rédaction de descriptions et suggestion de classement' },
  { numero: 6, nom: 'Bon à savoir & alertes', codename: 'SENTINEL', icon: '🔔', description: 'Alertes réglementaires, bonnes pratiques, rappels contextuels' },
  { numero: 7, nom: 'Administration (BO)', codename: 'COMMAND', icon: '⚙️', description: 'Back-office : gestion des guides, fiches, imports Excel, alertes' },
]

// === Sprints — les jalons alimentent les jauges des briques ===

export const SPRINTS: Sprint[] = [
  {
    nom: 'Sprint 1', codename: 'FIRST LIGHT', icon: '🚀', status: 'completed',
    periode: 'Mars — Avril 2025',
    objectif: 'Fondations : profil, navigation, 1 guide, 4 fiches',
    jalons: [
      { titre: 'Setup technique (React, Vite, Tailwind, CI/CD)', fait: true },
      { titre: 'Profil utilisateur (rôle, spécialité, applis)', fait: true, brique: 0 },
      { titre: 'Page d\'accueil & navigation mobile', fait: true, brique: 0 },
      { titre: 'Guide démo EF3C0', fait: true, brique: 1 },
      { titre: '4 fiches mémo (classement, description, doublons, DLF)', fait: true, brique: 2 },
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
      { titre: 'Guides ADV Mobile & SPOT Mobile', fait: false, brique: 1 },
      { titre: 'Guides S6A7 & EF4B1', fait: false, brique: 1 },
      { titre: 'Fiches mémo supplémentaires (embarquement, MPC, MC)', fait: false, brique: 2 },
      { titre: 'Recherche globale', fait: false },
    ],
  },
  {
    nom: 'Sprint 3', codename: 'ACADEMY', icon: '🎓', status: 'upcoming',
    periode: 'Mai — Juin 2025',
    objectif: 'Onboarding adaptatif avec quiz et progression',
    jalons: [
      { titre: 'Parcours de formation par rôle/spécialité', fait: false, brique: 3 },
      { titre: 'Système de quiz avec feedback', fait: false, brique: 3 },
      { titre: 'Contenu des modules de formation', fait: false, brique: 3 },
    ],
  },
  {
    nom: 'Sprint 4', codename: 'RADAR', icon: '📡', status: 'upcoming',
    periode: 'Juillet — Août 2025',
    objectif: 'Anomalies par actif — consultation, recherche, anti-doublons',
    jalons: [
      { titre: 'Recherche d\'actif et fiche anomalies', fait: false, brique: 4 },
      { titre: 'Détection de doublons', fait: false, brique: 4 },
      { titre: 'Import données de test (Excel)', fait: false, brique: 4 },
    ],
  },
  {
    nom: 'Sprint 5', codename: 'ORACLE', icon: '🧠', status: 'upcoming',
    periode: 'Sept — Oct 2025',
    objectif: 'Assistant IA — aide rédaction et classement',
    jalons: [
      { titre: 'Interface assistant', fait: false, brique: 5 },
      { titre: 'Suggestions de description et classement', fait: false, brique: 5 },
      { titre: 'Intégration LLM', fait: false, brique: 5 },
    ],
  },
  {
    nom: 'Sprint 6', codename: 'SENTINEL', icon: '🛡️', status: 'upcoming',
    periode: 'Nov — Déc 2025',
    objectif: 'Alertes, bonnes pratiques, contenu réglementaire',
    jalons: [
      { titre: 'Système d\'alertes et notifications', fait: false, brique: 6 },
      { titre: 'Contenu réglementaire (MT00342, DLF)', fait: false, brique: 6 },
      { titre: 'Bonnes pratiques contextuelles', fait: false, brique: 6 },
    ],
  },
]

// === Calcul auto des jauges ===

export function getBriqueProgress(numero: number): { done: number; total: number; pct: number } {
  const jalons = SPRINTS.flatMap(s => s.jalons).filter(j => j.brique === numero)
  if (jalons.length === 0) return { done: 0, total: 0, pct: 0 }
  const done = jalons.filter(j => j.fait).length
  return { done, total: jalons.length, pct: Math.round((done / jalons.length) * 100) }
}

export function getBriqueStatus(numero: number): 'done' | 'in_progress' | 'planned' | 'not_started' {
  const { done, total, pct } = getBriqueProgress(numero)
  if (total === 0) return 'not_started'
  if (pct === 100) return 'done'
  if (done > 0) return 'in_progress'
  return 'planned'
}
