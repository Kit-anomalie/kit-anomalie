// src/data/demoContent.ts
// Configuration des 4 actes de la démo : durées, textes, cues audio.
// Total : 90 secondes (1m30).

export type ActId = 'act1' | 'act2' | 'act3' | 'act4'

export interface ActConfig {
  id: ActId
  /** Début en secondes depuis t=0 */
  start: number
  /** Durée en secondes */
  duration: number
  /** Texte affiché à l'écran (peut contenir plusieurs lignes) */
  text: string[]
  /** Fichier audio joué pendant l'acte */
  audio: string
}

export const DEMO_TOTAL_DURATION = 90

export const ACTS: ActConfig[] = [
  {
    id: 'act1',
    start: 0,
    duration: 22,
    text: ['Sur le terrain.', 'À 6h12.', 'Sans réseau.'],
    audio: '/kit-anomalie/audio/act1-ambient.mp3',
  },
  {
    id: 'act2',
    start: 22,
    duration: 28,
    text: ['Une réponse.', 'Trois secondes.'],
    audio: '/kit-anomalie/audio/act2-swoosh.mp3',
  },
  {
    id: 'act3',
    start: 50,
    duration: 25,
    text: ['Tout le périmètre.', 'Une seule app.'],
    audio: '/kit-anomalie/audio/act3-buildup.mp3',
  },
  {
    id: 'act4',
    start: 75,
    duration: 15,
    text: ['Le compagnon.', 'Pas un nouvel outil.'],
    audio: '/kit-anomalie/audio/act4-resolve.mp3',
  },
]
