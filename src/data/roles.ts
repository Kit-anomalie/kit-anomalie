import type { AppliMetier, Role, Specialite } from '../types'

// Applications métier par spécialité
export const APPLIS_METIER: AppliMetier[] = [
  {
    id: 'ef3c0',
    nom: 'EF3C0',
    description: '',
    specialites: ['voie'],
  },
  {
    id: 's6a7',
    nom: 'S6A7',
    description: '',
    specialites: ['seg'],
  },
  {
    id: 'adv_mobile',
    nom: 'ADV Mobile',
    description: '',
    specialites: ['voie'],
  },
  {
    id: 'ef4b1',
    nom: 'EF4B1',
    description: '',
    specialites: ['seg', 'eale', 'cat', 'sm'],
  },
  {
    id: 'spm',
    nom: 'SPM',
    description: '',
    specialites: ['voie', 'seg', 'eale', 'cat', 'sm'],
  },
  {
    id: 'confo',
    nom: 'CONFO',
    description: '',
    specialites: ['voie'],
  },
  {
    id: 'spot_coeur',
    nom: 'SPOT Coeur',
    description: '',
    specialites: ['voie'],
  },
  {
    id: 'ef5a_vsp',
    nom: 'EF5A VSP',
    description: '',
    specialites: ['seg', 'eale', 'cat', 'sm'],
  },
  {
    id: 'arcat',
    nom: 'ARCAT',
    description: '',
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

// Filtrer les applis par spécialité
export function getApplisBySpecialite(specialite: Specialite): AppliMetier[] {
  return APPLIS_METIER.filter(app => app.specialites.includes(specialite))
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
