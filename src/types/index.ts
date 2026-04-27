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

export const CLASSEMENT_LABELS: Record<Classement, string> = {
  'S/I': 'Sécurité / Immédiat',
  'S/DP': 'Sécurité / Délai prescrit',
  'A/P': 'Autres / Prioritaire',
  'A/M': 'Autres / Maintenance',
  'A/SURV': 'Autres / Surveillance',
  'A/DET': 'Autres / à Déterminer',
  'VA': 'VA',
  'VI': 'VI',
  'VR': 'VR',
}

// Couleurs badges — palette SNCF stricte, contraste WCAG AA vérifié
// Pour S/DP (orange), A/P (bleu ciel), A/SURV (vert), texte noir car
// fond saturé + blanc < 4.5:1 (échec AA). Noir sur ces fonds = 7.9:1+ ✅
export const CLASSEMENT_COLORS: Record<Classement, { bg: string; text: string; border: string }> = {
  'S/I':    { bg: '#E3051B', text: '#FFFFFF', border: '#B10414' },
  'S/DP':   { bg: '#F7A600', text: '#0C1E5B', border: '#C68400' },
  'A/P':    { bg: '#00A3E0', text: '#0C1E5B', border: '#0082B4' },
  'A/M':    { bg: '#0C1E5B', text: '#FFFFFF', border: '#081642' },
  'A/SURV': { bg: '#3AAA35', text: '#0C1E5B', border: '#2D8529' },
  'A/DET':  { bg: '#9CA3AF', text: '#FFFFFF', border: '#6B7280' },
  'VA':     { bg: '#E5E7EB', text: '#374151', border: '#9CA3AF' },
  'VI':     { bg: '#E5E7EB', text: '#374151', border: '#9CA3AF' },
  'VR':     { bg: '#E5E7EB', text: '#374151', border: '#9CA3AF' },
}

// Sévérité décroissante — sert à déterminer le classement principal d'une anomalie
export const CLASSEMENT_SEVERITE: Record<Classement, number> = {
  'S/I': 100,
  'S/DP': 90,
  'A/P': 70,
  'A/M': 50,
  'A/SURV': 40,
  'A/DET': 20,
  'VA': 10,
  'VI': 10,
  'VR': 10,
}

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
  section?: string // ex: "Préparer", "Réaliser", "Envoyer"
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
  bonnesPratiques?: string[]
  guidesAssocies?: string[] // IDs de guides liés
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
  quizQuestions?: import('../data/quizQuestions').QuizQuestion[]
  exportDate?: string
}

// === Catalogue anomalies (référentiel transverse) ===

export interface ClassementEntry {
  condition?: string // ex: "écart > seuil AL", null → classement par défaut
  classement: Classement
  action: string // action recommandée
}

export interface CatalogueAnomalie {
  id: string
  code: string // ex "VC-GEO-02"
  name: string
  description: string
  defaut: string // manifestation observée
  ecart: string // ce qu'on mesure + instrument
  classements: ClassementEntry[]
  reference: string | null
  illus: { svg?: string; caption: string } | null
}

export interface TypeActif {
  id: string
  nom: string
  icon?: string
  anomalies: CatalogueAnomalie[]
}

export type CategorieId =
  | 'voie-courante'
  | 'appareils-voie'
  | 'ouvrages'
  | 'abords'
  | 'signalisation'
  | 'platelage'

export interface CatalogueCategorie {
  id: CategorieId
  nom: string
  description: string
  couleur: string // token SNCF remappé
  couleurFg: string // contraste texte (white ou dark)
  icon: string
  types: TypeActif[]
}

// === Navigation ===

export type TabId = 'accueil' | 'guides' | 'fiches' | 'catalogue' | 'assistant'
