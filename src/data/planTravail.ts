// === Plan de travail — Kit Anomalie ===

export type TaskStatus = 'done' | 'in_progress' | 'todo' | 'blocked' | 'icebox'
export type SprintStatus = 'completed' | 'active' | 'upcoming'
export type TaskPriority = 'P1' | 'P2' | 'P3' | 'P4'
export type TaskType = 'feature' | 'bug' | 'evolution' | 'contenu' | 'tech'

export interface TeamMember {
  id: string
  name: string
  emoji: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  assignee?: string // team member id
  brique?: number
  tags?: string[]
  priority?: TaskPriority
  type?: TaskType
}

export interface KanbanColumn {
  id: TaskStatus
  name: string
  icon: string
}

export interface Sprint {
  id: string
  name: string
  codename: string
  icon: string
  status: SprintStatus
  dateDebut: string
  dateFin: string
  objectif: string
  tasks: Task[]
}

export interface Brique {
  numero: number
  nom: string
  codename: string
  icon: string
  status: 'done' | 'in_progress' | 'planned' | 'not_started'
  progress: number
  description: string
}

// === Colonnes kanban par défaut ===

export const DEFAULT_KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'icebox', name: 'Icebox', icon: '🧊' },
  { id: 'todo', name: 'À faire', icon: '📌' },
  { id: 'in_progress', name: 'En cours', icon: '🔥' },
  { id: 'done', name: 'Terminé', icon: '✅' },
  { id: 'blocked', name: 'Bloqué', icon: '🚫' },
]

// === Équipe par défaut ===

export const DEFAULT_TEAM: TeamMember[] = [
  { id: 'willy', name: 'Willy', emoji: '👨‍💻' },
  { id: 'mathilde', name: 'Mathilde', emoji: '👩‍💼' },
]

// === Priorités ===

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; short: string }> = {
  P1: { label: 'P1 — Critique', color: 'bg-red-100 text-red-700 border-red-200', short: 'P1' },
  P2: { label: 'P2 — Important', color: 'bg-orange-100 text-orange-700 border-orange-200', short: 'P2' },
  P3: { label: 'P3 — Normal', color: 'bg-blue-100 text-blue-700 border-blue-200', short: 'P3' },
  P4: { label: 'P4 — Faible', color: 'bg-gray-100 text-gray-500 border-gray-200', short: 'P4' },
}

// === Types de tâche ===

export const TYPE_CONFIG: Record<TaskType, { label: string; color: string; icon: string }> = {
  feature: { label: 'Feature', color: 'bg-blue-100 text-sncf-blue', icon: '✨' },
  evolution: { label: 'Évolution', color: 'bg-violet-100 text-violet-700', icon: '🚀' },
  bug: { label: 'Bug', color: 'bg-red-100 text-red-700', icon: '🐛' },
  contenu: { label: 'Contenu', color: 'bg-orange-100 text-orange-700', icon: '📝' },
  tech: { label: 'Tech', color: 'bg-emerald-100 text-emerald-700', icon: '⚙️' },
}

export const TAG_COLORS: Record<string, string> = {
  tech: 'bg-violet-100 text-violet-700',
  feature: 'bg-blue-100 text-sncf-blue',
  contenu: 'bg-orange-100 text-orange-700',
}

// === Les 8 briques du Kit Anomalie ===

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
    id: 'sprint-1', name: 'Sprint 1', codename: 'FIRST LIGHT', icon: '🚀', status: 'completed',
    dateDebut: '2025-03-01', dateFin: '2025-04-01',
    objectif: 'Poser les fondations : profil, navigation, 1 guide démo, 4 fiches mémo',
    tasks: [
      { id: 't1-1', title: 'Setup projet React + Vite + Tailwind', description: 'Initialisation du repo, config Vite, Tailwind CSS 4, TypeScript', status: 'done', assignee: 'willy', tags: ['tech'], type: 'tech' },
      { id: 't1-2', title: 'Système de profil (rôle / spécialité / applis)', description: 'Zustand store avec persistance localStorage, wizard 3 étapes', status: 'done', assignee: 'willy', brique: 0, tags: ['feature'], type: 'feature' },
      { id: 't1-3', title: 'Page d\'accueil avec accès rapides', description: 'Dashboard, carte profil, tip du jour, grille d\'accès rapides', status: 'done', assignee: 'willy', brique: 0, tags: ['feature'], type: 'feature' },
      { id: 't1-4', title: 'Navigation mobile bottom nav', description: '5 onglets avec navigation React Router', status: 'done', assignee: 'willy', tags: ['feature'], type: 'feature' },
      { id: 't1-5', title: 'Guide démo EF3C0 — Créer une anomalie', description: 'Premier guide pas-à-pas avec étapes, champs, erreurs fréquentes', status: 'done', assignee: 'willy', brique: 1, tags: ['contenu'], type: 'contenu' },
      { id: 't1-6', title: '4 fiches mémo initiales', description: 'Classement, description, doublons, DLF', status: 'done', brique: 2, tags: ['contenu'], type: 'contenu' },
      { id: 't1-7', title: 'PWA manifest + offline badge', description: 'manifest.json, détection online/offline, icône statut', status: 'done', assignee: 'willy', tags: ['tech'], type: 'tech' },
      { id: 't1-8', title: 'Déploiement GitHub Pages + CI/CD', description: 'GitHub Actions auto-deploy sur push main, SPA redirect 404', status: 'done', assignee: 'willy', tags: ['tech'], type: 'tech' },
      { id: 't1-9', title: 'Descriptions applis métier (store numérique)', description: 'Récupération des descriptions depuis numerique.sncf.com', status: 'done', assignee: 'willy', brique: 0, tags: ['contenu'], type: 'contenu' },
    ],
  },
  {
    id: 'sprint-2', name: 'Sprint 2', codename: 'DEEP DIVE', icon: '🎯', status: 'active',
    dateDebut: '2025-04-01', dateFin: '2025-05-15',
    objectif: 'Enrichir le contenu : plus de guides, plus de fiches, couvrir toutes les spécialités',
    tasks: [
      { id: 't2-1', title: 'Page plan de travail & architecture', description: 'Vue partageable du plan, kanban, missions, avancement', status: 'in_progress', assignee: 'willy', tags: ['feature'], type: 'feature', priority: 'P1' },
      { id: 't2-2', title: 'Guides ADV Mobile (Voie)', description: 'Guides pas-à-pas pour ADV Mobile', status: 'todo', brique: 1, tags: ['contenu'], type: 'contenu', priority: 'P2' },
      { id: 't2-3', title: 'Guides SPOT Mobile (transverse)', description: 'Guides pas-à-pas pour SPOT Mobile', status: 'todo', brique: 1, tags: ['contenu'], type: 'contenu', priority: 'P2' },
      { id: 't2-4', title: 'Guides S6A7 (SEG)', description: 'Guides pour l\'application S6A7', status: 'todo', brique: 1, tags: ['contenu'], type: 'contenu', priority: 'P3' },
      { id: 't2-5', title: 'Guides EF4B1 (multi-spécialités)', description: 'Guides pour EF4B1 — SEG, EALE, CAT, SM', status: 'todo', brique: 1, tags: ['contenu'], type: 'contenu', priority: 'P3' },
      { id: 't2-6', title: 'Fiches mémo supplémentaires', description: 'Fiches par spécialité : embarquement, MPC, MC, statuts', status: 'todo', assignee: 'mathilde', brique: 2, tags: ['contenu'], type: 'contenu', priority: 'P2' },
      { id: 't2-7', title: 'Système de favoris et récents', description: 'Étoiles sur guides/fiches, historique de consultation', status: 'done', assignee: 'willy', tags: ['feature'], type: 'feature' },
      { id: 't2-8', title: 'Recherche globale', description: 'Barre de recherche transverse guides + fiches', status: 'todo', assignee: 'willy', tags: ['feature'], type: 'feature', priority: 'P3' },
    ],
  },
  {
    id: 'sprint-3', name: 'Sprint 3', codename: 'ACADEMY', icon: '🎓', status: 'upcoming',
    dateDebut: '2025-05-15', dateFin: '2025-06-30',
    objectif: 'Parcours d\'onboarding adaptatif avec quiz et progression',
    tasks: [
      { id: 't3-1', title: 'Modèle de données onboarding', description: 'Modules, parcours par rôle/spécialité, quiz', status: 'todo', assignee: 'willy', brique: 3, tags: ['tech'], type: 'tech' },
      { id: 't3-2', title: 'UI parcours de formation', description: 'Vue liste modules, progression, badges de complétion', status: 'todo', assignee: 'willy', brique: 3, tags: ['feature'], type: 'feature' },
      { id: 't3-3', title: 'Système de quiz', description: 'QCM avec feedback immédiat, score, relance', status: 'todo', assignee: 'willy', brique: 3, tags: ['feature'], type: 'feature' },
      { id: 't3-4', title: 'Contenu modules onboarding', description: 'Rédaction des modules de formation par spécialité', status: 'todo', assignee: 'mathilde', brique: 3, tags: ['contenu'], type: 'contenu' },
      { id: 't3-5', title: 'Liens guides ↔ modules', description: 'Association automatique entre modules et guides/fiches existants', status: 'todo', assignee: 'willy', brique: 3, tags: ['feature'], type: 'feature' },
    ],
  },
  {
    id: 'sprint-4', name: 'Sprint 4', codename: 'RADAR', icon: '📡', status: 'upcoming',
    dateDebut: '2025-07-01', dateFin: '2025-08-31',
    objectif: 'Consultation des anomalies par actif — lecture seule, anti-doublons',
    tasks: [
      { id: 't4-1', title: 'Modèle de données anomalies & actifs', description: 'Types, statuts, classements, historique', status: 'todo', assignee: 'willy', brique: 4, tags: ['tech'], type: 'tech' },
      { id: 't4-2', title: 'Recherche d\'actif', description: 'Barre de recherche par nom, numéro, PK', status: 'todo', assignee: 'willy', brique: 4, tags: ['feature'], type: 'feature' },
      { id: 't4-3', title: 'Fiche actif avec anomalies', description: 'Vue détail actif : liste anomalies, statuts, DLF', status: 'todo', assignee: 'willy', brique: 4, tags: ['feature'], type: 'feature' },
      { id: 't4-4', title: 'Détection doublons potentiels', description: 'Alerte si anomalie similaire déjà déclarée sur le même actif', status: 'todo', assignee: 'willy', brique: 4, tags: ['feature'], type: 'feature' },
      { id: 't4-5', title: 'Import données Excel (jeu de test)', description: 'Chargement de données d\'exemple depuis fichier Excel', status: 'todo', brique: 4, tags: ['tech'], type: 'tech' },
    ],
  },
  {
    id: 'sprint-5', name: 'Sprint 5', codename: 'ORACLE', icon: '🧠', status: 'upcoming',
    dateDebut: '2025-09-01', dateFin: '2025-10-31',
    objectif: 'Assistant IA — aide à la rédaction et au classement',
    tasks: [
      { id: 't5-1', title: 'Interface chat / assistant', description: 'UI conversationnelle pour aide à la rédaction', status: 'todo', assignee: 'willy', brique: 5, tags: ['feature'], type: 'feature' },
      { id: 't5-2', title: 'Suggestions de description', description: 'Proposition de texte à copier-coller dans l\'appli métier', status: 'todo', assignee: 'willy', brique: 5, tags: ['feature'], type: 'feature' },
      { id: 't5-3', title: 'Aide au classement', description: 'Suggestion de classement basée sur la description', status: 'todo', assignee: 'willy', brique: 5, tags: ['feature'], type: 'feature' },
      { id: 't5-4', title: 'Intégration LLM (API ou local)', description: 'Choix technique : API cloud ou modèle embarqué', status: 'todo', assignee: 'willy', brique: 5, tags: ['tech'], type: 'tech' },
    ],
  },
  {
    id: 'sprint-6', name: 'Sprint 6', codename: 'SENTINEL', icon: '🛡️', status: 'upcoming',
    dateDebut: '2025-11-01', dateFin: '2025-12-15',
    objectif: 'Alertes, bonnes pratiques, contenu réglementaire',
    tasks: [
      { id: 't6-1', title: 'Système d\'alertes', description: 'Notifications, badges, priorités', status: 'todo', assignee: 'willy', brique: 6, tags: ['feature'], type: 'feature' },
      { id: 't6-2', title: 'Contenu réglementaire', description: 'Rappels MT00342, règles de classement, DLF', status: 'todo', assignee: 'mathilde', brique: 6, tags: ['contenu'], type: 'contenu' },
      { id: 't6-3', title: 'Bonnes pratiques contextuelles', description: 'Tips liés au profil et à l\'activité de l\'utilisateur', status: 'todo', brique: 6, tags: ['contenu'], type: 'contenu' },
    ],
  },
]
