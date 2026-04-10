// === Profil utilisateur ===

export type Role = 'agent_req' | 'ordonnanceur' | 'rp'

export type Specialite = 'voie' | 'seg' | 'eale' | 'cat' | 'sm'

export interface AppliMetier {
  id: string
  nom: string
  description: string
  url?: string
  specialites: Specialite[] // spécialités qui utilisent cette appli
  roles?: Role[] // si défini, restreint l'appli à ces rôles uniquement
}

export interface UserProfile {
  role: Role | null
  specialite: Specialite | null
  isConfigured: boolean
}

// === Labels affichables ===

export const ROLE_LABELS: Record<Role, string> = {
  agent_req: 'Agent terrain / REQ',
  ordonnanceur: 'Ordonnanceur',
  rp: 'Référent Patrimoine (RP)',
}

export const SPECIALITE_LABELS: Record<Specialite, string> = {
  voie: 'Voie',
  seg: 'SEG',
  eale: 'EALE',
  cat: 'CAT',
  sm: 'SM',
}

// === Classements réglementaires ===

export type Classement = 'S/I' | 'S/DP' | 'A/P' | 'A/M' | 'A/SURV' | 'A/DET' | 'VA' | 'VI' | 'VR'

export type StatutAnomalie = 'brouillon' | 'ouverte' | 'en_cours' | 'resolue'

export const STATUT_LABELS: Record<StatutAnomalie, string> = {
  brouillon: 'Brouillon',
  ouverte: 'Ouverte',
  en_cours: 'En cours',
  resolue: 'Résolue',
}

export const STATUT_COLORS: Record<StatutAnomalie, string> = {
  brouillon: '#9CA3AF',
  ouverte: '#E3051B',
  en_cours: '#F7A600',
  resolue: '#3AAA35',
}

// === Guides ===

export interface GuideStep {
  numero: number
  titre: string
  action: string
  champsARemplir?: string[]
  erreursFrequentes?: string[]
  referentiel?: string
  captureUrl?: string // placeholder pour les captures
}

export interface Guide {
  id: string
  titre: string
  appliMetier: string // ID de l'appli
  roles: Role[]
  specialites: Specialite[]
  gesteMetier: string // ex : "Créer une anomalie"
  etapes: GuideStep[]
  referentiel?: string
  piecesJointes?: PieceJointe[]
}

// === Pieces jointes ===

export interface PieceJointe {
  id: string
  type: 'image' | 'pdf' | 'lien'
  nom: string
  data?: string // base64 pour image/pdf
  url?: string // pour les liens
}

// === Fiches mémo ===

export interface FicheMemo {
  id: string
  titre: string
  gestesCles: string[]
  roles: Role[]
  specialites: Specialite[]
  quoiFaire: string
  comment: string
  erreursAEviter: string[]
  referentiel?: string
  guideAssocie?: string // ID du guide lié
  piecesJointes?: PieceJointe[]
}

// === Anomalies ===

export interface Anomalie {
  id: string
  actifId: string
  actifNom: string
  description: string
  classement: Classement | null
  statut: StatutAnomalie
  dateCreation: string
  dateDerniereMaj: string
  dlf?: string // Date Limite de Fin
  specialite: Specialite
  pk?: string // Point Kilométrique
  localisation: string
  historique?: { date: string; action: string }[]
}

export interface Actif {
  id: string
  nom: string
  numero: string
  pk: string
  localisation: string
  specialite: Specialite
  anomalies: string[] // IDs d'anomalies
}

// === Onboarding ===

export interface QuizQuestion {
  question: string
  options: string[]
  reponseCorrecte: number
}

export interface OnboardingModule {
  id: string
  titre: string
  description: string
  dureeMinutes: number
  contenu: string // contenu markdown simplifié
  quiz?: QuizQuestion
  guideAssocie?: string
  ficheAssociee?: string
}

export interface OnboardingParcours {
  id: string
  role: Role
  specialite: Specialite | null // null = toutes spécialités
  modules: OnboardingModule[]
}

// === Alertes ===

export interface Alerte {
  id: string
  titre: string
  contenu: string
  type: 'alerte' | 'tip' | 'reglementaire'
  roles?: Role[]
  specialites?: Specialite[]
  referentiel?: string
  datePublication: string
  dateExpiration?: string
  lu: boolean
}

// === Contenu éditable ===

export interface CustomTip {
  id: string
  texte: string
  dateCreation: string
}

export interface EditorData {
  tips: CustomTip[]
  fiches: FicheMemo[]
  guides: Guide[]
  exportDate?: string
}

// === Navigation ===

export type TabId = 'accueil' | 'guides' | 'fiches' | 'actifs' | 'assistant'
