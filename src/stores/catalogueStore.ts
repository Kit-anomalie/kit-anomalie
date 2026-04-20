import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CatalogueCategorie, CategorieId, CatalogueAnomalie, TypeActif } from '../types'
import { CATALOGUE_SEED } from '../data/catalogueSeed'

interface CatalogueState {
  categories: CatalogueCategorie[]
  historique: string[] // ids d'anomalies consultées (max 20)

  // Getters
  getCategorie: (catId: CategorieId) => CatalogueCategorie | undefined
  getTypeActif: (catId: CategorieId, typeId: string) => TypeActif | undefined
  getAnomalie: (catId: CategorieId, typeId: string, anoId: string) => CatalogueAnomalie | undefined

  // Mutations — utilisées par l'admin (PR 3)
  setCategories: (categories: CatalogueCategorie[]) => void
  resetSeed: () => void

  // Historique
  pushHistorique: (anoId: string) => void
  clearHistorique: () => void
}

const MAX_HISTORIQUE = 20

export const useCatalogueStore = create<CatalogueState>()(
  persist(
    (set, get) => ({
      categories: CATALOGUE_SEED,
      historique: [],

      getCategorie: (catId) => get().categories.find(c => c.id === catId),

      getTypeActif: (catId, typeId) => {
        const cat = get().categories.find(c => c.id === catId)
        return cat?.types.find(t => t.id === typeId)
      },

      getAnomalie: (catId, typeId, anoId) => {
        const cat = get().categories.find(c => c.id === catId)
        const type = cat?.types.find(t => t.id === typeId)
        return type?.anomalies.find(a => a.id === anoId)
      },

      setCategories: (categories) => set({ categories }),

      resetSeed: () => set({ categories: CATALOGUE_SEED }),

      pushHistorique: (anoId) => {
        const current = get().historique.filter(id => id !== anoId)
        set({ historique: [anoId, ...current].slice(0, MAX_HISTORIQUE) })
      },

      clearHistorique: () => set({ historique: [] }),
    }),
    {
      name: 'kit-anomalie-catalogue',
      version: 1,
      // Incrémenter version et ajouter migrate quand le seed change significativement
      // pour que les utilisateurs reçoivent la nouvelle version (en PR 3 l'admin pilotera ça).
    }
  )
)
