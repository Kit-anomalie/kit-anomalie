import type { AppliMetier, Role, Specialite } from '../types'

// Applications métier par spécialité
export const APPLIS_METIER: AppliMetier[] = [
  {
    id: 'ef3c0',
    nom: 'EF3C0',
    description: 'Visite aux PN',
    specialites: ['voie'],
  },
  {
    id: 'adv_mobile',
    nom: 'ADV Mobile',
    description: 'Aide à la surveillance des voies',
    specialites: ['voie'],
  },
  {
    id: 'spm',
    nom: 'SPOT Mobile',
    description: 'Dématérialiser les activités réalisées par les mainteneurs',
    specialites: ['voie', 'seg', 'eale', 'cat', 'sm'],
  },
  {
    id: 'confo',
    nom: 'Conformité',
    description: 'Conformité Voie Courante et Conformité ADV',
    specialites: ['voie'],
  },
  {
    id: 'spot_coeur',
    nom: 'SPOT Coeur',
    description: 'Visite des cœurs — garanties et surveillance d\'avaries',
    specialites: ['voie'],
  },
  {
    id: 'tsp1',
    nom: 'TSP1',
    description: 'Tournée de Surveillance Périodique à pieds — voie, appareils de voie et abords',
    specialites: ['voie'],
  },
  {
    id: 'arcat',
    nom: 'ARCAT',
    description: 'Remontée des anomalies sur installations de traction électrique',
    specialites: ['cat'],
  },
]

// Descriptions des rôles pour l'onboarding
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  agent_req: 'Vous êtes sur le terrain. Vous constatez, déclarez et qualifiez les anomalies dans vos applications métier.',
  ordonnanceur: 'Vous planifiez les interventions de maintenance à partir des anomalies déclarées.',
  rp: 'Vous gérez le patrimoine, validez les classements et pilotez le traitement des anomalies.',
}

// Descriptions des spécialités
export const SPECIALITE_DESCRIPTIONS: Record<Specialite, string> = {
  voie: 'Voie ferrée — rails, traverses, ballast, appareils de voie',
  seg: 'Signalisation — aiguillages, signaux, circuits de voie, ERTMS',
  eale: 'Énergie — caténaires, sous-stations, lignes haute tension',
  cat: 'Caténaires — alimentation traction électrique',
  sm: 'Structures et Maçonnerie — ouvrages d\'art, tunnels, ponts',
}

// Filtrer les applis par spécialité et rôle
export function getApplisBySpecialite(specialite: Specialite, role?: Role | null): AppliMetier[] {
  return APPLIS_METIER.filter(app => {
    if (!app.specialites.includes(specialite)) return false
    if (role && app.roles && !app.roles.includes(role)) return false
    return true
  })
}

// Icônes des rôles (emoji pour le prototype)
export const ROLE_ICONS: Record<Role, string> = {
  agent_req: '🔧',
  ordonnanceur: '📋',
  rp: '🏗️',
}

// Icônes des spécialités
export const SPECIALITE_ICONS: Record<Specialite, string> = {
  voie: '🛤️',
  seg: '🚦',
  eale: '⚡',
  cat: '🔌',
  sm: '🏗️',
}
