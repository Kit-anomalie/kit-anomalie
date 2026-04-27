// Questions du quiz — fondamentaux anomalies SNCF
// Source : fiches mémo, classements MT00342, terminologie métier
// Note : données pédagogiques génériques, pas de référentiels confidentiels

// theme = id libre (string). Voir getThemeLabel() en bas pour le rendu.
// Themes par défaut listés dans DEFAULT_THEMES, l'admin peut en créer d'autres
// via le mode éditeur.
export interface QuizQuestion {
  id: string
  theme: string
  question: string
  options: string[]
  correct: number // index dans options
  explanation: string
}

export interface QuizTheme {
  id: string
  label: string
}

// Un quiz = groupement de questions choisies dans le pool global.
// Permet a l'admin de creer plusieurs quizzes (ex: "Fondamentaux", "Classement
// approfondi"). Une question peut appartenir a plusieurs quizzes.
export interface QuizDefinition {
  id: string
  name: string
  description?: string
  questionIds: string[]
}

export const DEFAULT_THEMES: QuizTheme[] = [
  { id: 'classement', label: 'Classement' },
  { id: 'dlf', label: 'DLF' },
  { id: 'description', label: 'Description' },
  { id: 'doublons', label: 'Doublons' },
  { id: 'terminologie', label: 'Terminologie' },
]

// Renvoie le label affichable pour un theme. Cherche dans DEFAULT_THEMES,
// puis dans les themes custom passés en parametre, sinon renvoie l'id brut.
export function getThemeLabel(themeId: string, customThemes: QuizTheme[] = []): string {
  const def = DEFAULT_THEMES.find((t) => t.id === themeId)
  if (def) return def.label
  const custom = customThemes.find((t) => t.id === themeId)
  if (custom) return custom.label
  return themeId
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q01',
    theme: 'classement',
    question: 'Que signifie le classement S/I ?',
    options: [
      'Sécurité / Important',
      'Sécurité / Immédiat',
      'Surveillance / Intervention',
      'Suivi / Information',
    ],
    correct: 1,
    explanation: 'S/I = Sécurité / Immédiat. Anomalie nécessitant une intervention immédiate pour préserver la sécurité.',
  },
  {
    id: 'q02',
    theme: 'classement',
    question: 'Le classement A/P concerne quel type d\'anomalie ?',
    options: [
      'Anomalie Prioritaire de sécurité',
      'Anomalie Permanente',
      'Autres / Prioritaire (hors sécurité)',
      'Action / Programmée',
    ],
    correct: 2,
    explanation: 'A/P = Autres / Prioritaire. L\'anomalie n\'est pas un risque sécuritaire mais doit être traitée en priorité dans la planification.',
  },
  {
    id: 'q03',
    theme: 'classement',
    question: 'Quelle est la différence entre A/SURV et A/DET ?',
    options: [
      'A/SURV est plus grave que A/DET',
      'A/SURV = surveillance régulière, A/DET = classement à déterminer',
      'A/DET concerne uniquement les voies, A/SURV tout le patrimoine',
      'Aucune différence, les deux sont équivalents',
    ],
    correct: 1,
    explanation: 'A/SURV = surveillance renforcée à programmer. A/DET = classement à Déterminer (à finaliser après expertise).',
  },
  {
    id: 'q04',
    theme: 'classement',
    question: 'Vous constatez un défaut sécuritaire qui peut attendre l\'opération de maintenance prescrite. Quel classement ?',
    options: [
      'S/I',
      'S/DP',
      'A/P',
      'A/M',
    ],
    correct: 1,
    explanation: 'S/DP = Sécurité / Délai Prescrit. Le défaut impacte la sécurité mais le délai d\'intervention est encadré par un référentiel.',
  },
  {
    id: 'q05',
    theme: 'dlf',
    question: 'Que signifie l\'acronyme DLF ?',
    options: [
      'Date Limite de Fiabilisation',
      'Date Limite de Fin',
      'Délai Limite de Fonctionnement',
      'Date Limite Fixée',
    ],
    correct: 1,
    explanation: 'DLF = Date Limite de Fin. C\'est la date butoir avant laquelle l\'anomalie doit être traitée. Attention : ne pas confondre avec "Fiabilisation".',
  },
  {
    id: 'q06',
    theme: 'dlf',
    question: 'Que se passe-t-il si vous oubliez de renseigner la DLF sur une anomalie ?',
    options: [
      'Aucun impact, l\'anomalie reste visible',
      'L\'anomalie sort du radar de suivi de l\'ordonnanceur',
      'L\'anomalie est automatiquement classée S/I',
      'Le système crée une alerte mais l\'anomalie reste traitable',
    ],
    correct: 1,
    explanation: 'Sans DLF, l\'anomalie n\'apparaît pas dans les filtres de planification. Elle devient invisible pour l\'ordonnanceur — risque de non-traitement.',
  },
  {
    id: 'q07',
    theme: 'dlf',
    question: 'Vous voulez modifier la DLF d\'une anomalie classée S/DP. Que faut-il faire ?',
    options: [
      'Modifier directement, le système accepte',
      'Demander l\'accord du chef d\'unité',
      'Faire une analyse de risque préalable',
      'C\'est interdit, la DLF est figée',
    ],
    correct: 2,
    explanation: 'Modifier une DLF nécessite une analyse de risque : on doit justifier que le report ne crée pas de risque sécuritaire. C\'est une décision tracée.',
  },
  {
    id: 'q08',
    theme: 'description',
    question: 'Une bonne description d\'anomalie doit contenir au minimum :',
    options: [
      'Le nom du déclarant et la date',
      'Le composant, la localisation exacte, l\'ancienneté du défaut',
      'La photo et le numéro d\'OT',
      'Le classement et la DLF',
    ],
    correct: 1,
    explanation: 'L\'objectif : que le RP ou l\'ordonnanceur n\'ait pas à revenir sur le terrain pour comprendre. Composant + localisation + ancienneté = description exploitable.',
  },
  {
    id: 'q09',
    theme: 'doublons',
    question: 'Avant de créer une anomalie sur un actif, vous devez :',
    options: [
      'Vérifier qu\'aucune anomalie similaire n\'existe déjà',
      'Demander confirmation au CoSPOT',
      'Attendre la fin de la tournée',
      'Créer directement, le système dédoublonne',
    ],
    correct: 0,
    explanation: 'Vérifier les anomalies existantes évite les doublons (charge administrative + risque de classement contradictoire). Le dédoublonnage automatique n\'est pas systématique.',
  },
  {
    id: 'q10',
    theme: 'terminologie',
    question: 'Quelle est la différence entre une "anomalie" et un "constat" ?',
    options: [
      'Anomalie = grave, constat = mineur',
      'Anomalie = écart à traiter (classement + DLF), constat = simple observation',
      'Anomalie = sur la voie, constat = sur les ouvrages',
      'Aucune, ce sont des synonymes',
    ],
    correct: 1,
    explanation: 'Une anomalie est un écart sur le patrimoine nécessitant intervention (avec classement et DLF). Un constat est une observation sans impact opérationnel direct.',
  },
  {
    id: 'q11',
    theme: 'terminologie',
    question: 'MPC signifie :',
    options: [
      'Maintenance Préventive Corrective',
      'Maintenance Périodique de Contrôle',
      'Maintenance Préventive Conditionnelle',
      'Mesure Périodique de Conformité',
    ],
    correct: 2,
    explanation: 'MPC = Maintenance Préventive Conditionnelle. Action programmée en fonction de l\'état observé du patrimoine (et non d\'une fréquence fixe).',
  },
  {
    id: 'q12',
    theme: 'terminologie',
    question: 'L\'embarquement d\'une anomalie consiste à :',
    options: [
      'Transférer l\'anomalie vers une autre unité',
      'Attribuer automatiquement l\'anomalie à une tournée ou appli terrain',
      'Archiver l\'anomalie une fois résolue',
      'Importer l\'anomalie depuis un autre système',
    ],
    correct: 1,
    explanation: 'L\'embarquement = attribution automatique de l\'anomalie au bon agent terrain via la planification. Cela permet à l\'agent de la voir dans son appli métier sans recherche manuelle.',
  },
]

// Compatibilité — utiliser plutôt getThemeLabel(). Ne contient que les
// thèmes par défaut, pas les customs définis par l'admin.
export const QUIZ_THEMES_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_THEMES.map((t) => [t.id, t.label])
)

// Quiz par défaut — groupe l'ensemble des 12 questions livrées avec l'app.
// L'admin peut le modifier (override) ou créer ses propres quizzes.
export const DEFAULT_QUIZZES: QuizDefinition[] = [
  {
    id: 'quiz-fondamentaux',
    name: 'Fondamentaux',
    description: 'Les 12 questions clés sur le métier — classement, DLF, doublons, terminologie',
    questionIds: [
      'q01', 'q02', 'q03', 'q04',
      'q05', 'q06', 'q07',
      'q08',
      'q09',
      'q10', 'q11', 'q12',
    ],
  },
]
