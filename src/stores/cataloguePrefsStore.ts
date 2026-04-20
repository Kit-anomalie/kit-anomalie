import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FicheSection =
  | 'illustration'
  | 'description'
  | 'defaut'
  | 'ecart'
  | 'classements'
  | 'actions'
  | 'reference'

export const SECTION_LABELS: Record<FicheSection, string> = {
  illustration: 'Illustration référencée',
  description: 'Description',
  defaut: 'Défaut',
  ecart: 'Écart / critère mesuré',
  classements: 'Classements',
  actions: 'Actions par classement',
  reference: 'Référence documentaire',
}

export const ALL_SECTIONS: FicheSection[] = [
  'illustration',
  'description',
  'defaut',
  'ecart',
  'classements',
  'actions',
  'reference',
]

export const SYNTHESE_SECTIONS: FicheSection[] = [
  'illustration',
  'description',
  'classements',
  'reference',
]

interface CataloguePrefsState {
  visibleSections: FicheSection[]
  showSelector: boolean
  setSections: (sections: FicheSection[]) => void
  toggleSection: (section: FicheSection) => void
  setPreset: (preset: 'all' | 'synthese' | 'reset') => void
  toggleSelector: () => void
}

export const useCataloguePrefsStore = create<CataloguePrefsState>()(
  persist(
    (set, get) => ({
      visibleSections: ALL_SECTIONS,
      showSelector: false,

      setSections: (visibleSections) => set({ visibleSections }),

      toggleSection: (section) => {
        const current = get().visibleSections
        if (current.includes(section)) {
          set({ visibleSections: current.filter(s => s !== section) })
        } else {
          // Préserver l'ordre canonique
          set({ visibleSections: ALL_SECTIONS.filter(s => current.includes(s) || s === section) })
        }
      },

      setPreset: (preset) => {
        if (preset === 'all' || preset === 'reset') set({ visibleSections: ALL_SECTIONS })
        else if (preset === 'synthese') set({ visibleSections: SYNTHESE_SECTIONS })
      },

      toggleSelector: () => set({ showSelector: !get().showSelector }),
    }),
    { name: 'kit-anomalie-catalogue-prefs' }
  )
)
