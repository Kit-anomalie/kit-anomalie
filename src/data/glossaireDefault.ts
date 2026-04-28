// src/data/glossaireDefault.ts
// Glossaire métier livré par défaut avec le kit.
// ~26 entrées couvrant les sigles et termes utilisés dans les briques 1-5.
// Chargé au premier démarrage par sharedContentStore (fusion sans écrasement).

import type { GlossaireTerme } from '../types'

export const DEFAULT_GLOSSAIRE: GlossaireTerme[] = [
  // === Classements ===
  {
    id: 'glossaire-si',
    terme: 'S/I',
    definition: 'Sécurité / Immédiat',
    description: "Classement le plus critique. Risque immédiat de déraillement, heurt ou électrocution. Sécurisation et intervention sans délai.",
    synonymes: ['SI', 'securite immediat'],
  },
  {
    id: 'glossaire-sdp',
    terme: 'S/DP',
    definition: 'Sécurité / Délai Prescrit',
    description: 'Risque sécurité mais sans urgence absolue. Doit être traité dans la DLF prescrite par le classement.',
    synonymes: ['SDP', 'securite delai prescrit'],
  },
  {
    id: 'glossaire-ap',
    terme: 'A/P',
    definition: 'Autres / Prioritaire',
    description: "Anomalie hors sécurité mais pouvant s'aggraver rapidement. À traiter en priorité.",
    synonymes: ['AP', 'autres prioritaire'],
  },
  {
    id: 'glossaire-am',
    terme: 'A/M',
    definition: 'Autres / Maintenance',
    description: 'Anomalie de maintenance courante, sans urgence.',
    synonymes: ['AM', 'autres maintenance'],
  },
  {
    id: 'glossaire-asurv',
    terme: 'A/SURV',
    definition: 'Autres / Surveillance',
    description: 'Anomalie à surveiller régulièrement sans intervention immédiate.',
    synonymes: ['ASURV', 'autres surveillance'],
  },
  {
    id: 'glossaire-adet',
    terme: 'A/DET',
    definition: 'Autres / à Déterminer',
    description: 'Classement à confirmer après analyse complémentaire.',
    synonymes: ['ADET', 'autres a determiner'],
  },

  // === Rôles ===
  {
    id: 'glossaire-req',
    terme: 'REQ',
    definition: 'Responsable Équipe',
    description: "Encadre l'équipe terrain. Valide les anomalies remontées par les agents.",
  },
  {
    id: 'glossaire-cospot',
    terme: 'CoSPOT',
    definition: 'Correspondant SPOT',
    description: "Référent de l'outil GMAO dans l'unité. Forme et accompagne les autres utilisateurs.",
    synonymes: ['correspondant spot'],
  },
  {
    id: 'glossaire-dps',
    terme: 'DPS',
    definition: 'Référent Patrimoine',
    description: 'Gère les équipements et arborescences GMAO.',
    synonymes: ['referent patrimoine'],
  },
  {
    id: 'glossaire-dop',
    terme: 'DOP',
    definition: 'Ordonnanceur',
    description: 'Planifie les interventions et tournées.',
  },
  {
    id: 'glossaire-du',
    terme: 'DU',
    definition: "Dirigeant d'Unité",
    description: "Consulte les KPI et valide les décisions de l'unité.",
    synonymes: ['dirigeant unite'],
  },

  // === Concepts métier ===
  {
    id: 'glossaire-dlf',
    terme: 'DLF',
    definition: 'Date Limite de Fin',
    description: "Date avant laquelle l'anomalie doit être résolue. Dépend du classement. Sa modification nécessite une analyse de risque.",
    synonymes: ['date limite', 'date limite fin'],
  },
  {
    id: 'glossaire-mpc',
    terme: 'MPC',
    definition: 'Maintenance Préventive Conditionnelle',
    description: "Maintenance déclenchée par un état observé sur l'équipement (mesure ou inspection), pas par un calendrier fixe.",
    synonymes: ['maintenance preventive conditionnelle'],
  },
  {
    id: 'glossaire-mc',
    terme: 'MC',
    definition: 'Maintenance Corrective',
    description: "Intervention pour corriger une anomalie existante (par opposition à la préventive).",
    synonymes: ['maintenance corrective'],
  },
  {
    id: 'glossaire-anomalie',
    terme: 'Anomalie',
    definition: 'Écart sur le patrimoine nécessitant intervention',
    description: "Défaut ou écart constaté sur un équipement, classé selon sa criticité, avec une DLF associée.",
  },
  {
    id: 'glossaire-constat',
    terme: 'Constat',
    definition: 'Observation sans impact opérationnel',
    description: "Note d'observation qui ne nécessite pas de traitement (pas de classement ni de DLF). À distinguer d'une anomalie.",
  },
  {
    id: 'glossaire-embarquement',
    terme: 'Embarquement',
    definition: 'Attribution automatique des anomalies aux tournées',
    description: "Mécanisme qui assigne les anomalies aux tournées et applis terrain selon des règles de priorité et de spécialité.",
  },
  {
    id: 'glossaire-tournee',
    terme: 'Tournée',
    definition: 'Parcours planifié sur le terrain',
    description: "Liste d'interventions à réaliser dans la journée par un agent ou une équipe.",
  },

  // === Applications métier ===
  {
    id: 'glossaire-spot',
    terme: 'SPOT Mobile',
    definition: 'Appli terrain pour saisir et consulter les anomalies',
    description: "Utilisée transversalement par toutes les spécialités terrain.",
  },
  {
    id: 'glossaire-ef3c0',
    terme: 'EF3C0',
    definition: 'Appli de saisie pour la Voie courante',
    description: "Permet de créer et qualifier les anomalies de la voie courante.",
  },
  {
    id: 'glossaire-advmobile',
    terme: 'ADV Mobile',
    definition: 'Appli pour les Appareils De Voie',
    description: "Saisie et suivi des anomalies sur les aiguillages, traversées et autres appareils de voie.",
    synonymes: ['adv'],
  },
  {
    id: 'glossaire-ef4b1',
    terme: 'EF4B1',
    definition: 'Appli de saisie pour SEG, EALE, CAT, SM',
    description: "Couvre la signalisation électrique, l'alimentation, la caténaire et la signalisation mécanique.",
  },
  {
    id: 'glossaire-ef5avsp',
    terme: 'EF5A VSP',
    definition: 'Visites de Surveillance Périodique',
    description: "Saisie des constats lors des visites périodiques (caténaire, signalisation, etc.).",
    synonymes: ['ef5a', 'vsp'],
  },
  {
    id: 'glossaire-arcat',
    terme: 'ARCAT',
    definition: 'Appli de gestion CAT (caténaire)',
    description: "Outil dédié aux interventions sur la caténaire.",
  },

  // === Spécialités ===
  {
    id: 'glossaire-voie',
    terme: 'Voie',
    definition: 'Spécialité voie ferrée',
    description: "Couvre la voie courante et les appareils de voie.",
  },
  {
    id: 'glossaire-seg',
    terme: 'SEG',
    definition: 'Signalisation Électrique au sol et au Gabarit',
    description: 'Spécialité signalisation électrique.',
  },
  {
    id: 'glossaire-eale',
    terme: 'EALE',
    definition: 'Équipements et Alimentation Électriques',
    description: "Spécialité de l'alimentation électrique des installations.",
  },
  {
    id: 'glossaire-cat',
    terme: 'CAT',
    definition: 'Caténaire',
    description: "Spécialité des installations caténaires (alimentation des trains).",
  },
  {
    id: 'glossaire-sm',
    terme: 'SM',
    definition: 'Signalisation Mécanique',
    description: "Spécialité de la signalisation mécanique au sol.",
  },
]
