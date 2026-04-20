import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CatalogueCategorie, CategorieId, CatalogueAnomalie, TypeActif } from '../types'
import { CATALOGUE_SEED } from '../data/catalogueSeed'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

interface CatalogueExport {
  categories: CatalogueCategorie[]
  exportDate?: string
}

interface CatalogueState {
  categories: CatalogueCategorie[]
  historique: string[]

  // Getters
  getCategorie: (catId: CategorieId) => CatalogueCategorie | undefined
  getTypeActif: (catId: CategorieId, typeId: string) => TypeActif | undefined
  getAnomalie: (catId: CategorieId, typeId: string, anoId: string) => CatalogueAnomalie | undefined

  // CRUD Catégorie
  addCategorie: (categorie: Omit<CatalogueCategorie, 'id' | 'types'> & { id?: string }) => void
  updateCategorie: (catId: CategorieId, patch: Partial<Omit<CatalogueCategorie, 'types'>>) => void
  deleteCategorie: (catId: CategorieId) => void

  // CRUD Type d'actif
  addTypeActif: (catId: CategorieId, type: Omit<TypeActif, 'id' | 'anomalies'> & { id?: string }) => void
  updateTypeActif: (catId: CategorieId, typeId: string, patch: Partial<Omit<TypeActif, 'anomalies'>>) => void
  deleteTypeActif: (catId: CategorieId, typeId: string) => void

  // CRUD Anomalie
  addAnomalie: (catId: CategorieId, typeId: string, anomalie: Omit<CatalogueAnomalie, 'id'>) => void
  updateAnomalie: (catId: CategorieId, typeId: string, anoId: string, patch: Partial<CatalogueAnomalie>) => void
  deleteAnomalie: (catId: CategorieId, typeId: string, anoId: string) => void

  // Gestion bulk
  setCategories: (categories: CatalogueCategorie[]) => void
  resetSeed: () => void

  // Export / Import
  exportCatalogue: () => CatalogueExport
  importCatalogue: (data: CatalogueExport) => void

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

      // Catégorie
      addCategorie: (categorie) => set(s => ({
        categories: [...s.categories, {
          ...categorie,
          id: (categorie.id ?? `cat-${uid()}`) as CategorieId,
          types: [],
        }],
      })),

      updateCategorie: (catId, patch) => set(s => ({
        categories: s.categories.map(c => c.id === catId ? { ...c, ...patch } : c),
      })),

      deleteCategorie: (catId) => set(s => ({
        categories: s.categories.filter(c => c.id !== catId),
      })),

      // Type
      addTypeActif: (catId, type) => set(s => ({
        categories: s.categories.map(c => c.id === catId
          ? { ...c, types: [...c.types, { ...type, id: type.id ?? `type-${uid()}`, anomalies: [] }] }
          : c
        ),
      })),

      updateTypeActif: (catId, typeId, patch) => set(s => ({
        categories: s.categories.map(c => c.id === catId
          ? { ...c, types: c.types.map(t => t.id === typeId ? { ...t, ...patch } : t) }
          : c
        ),
      })),

      deleteTypeActif: (catId, typeId) => set(s => ({
        categories: s.categories.map(c => c.id === catId
          ? { ...c, types: c.types.filter(t => t.id !== typeId) }
          : c
        ),
      })),

      // Anomalie
      addAnomalie: (catId, typeId, anomalie) => set(s => ({
        categories: s.categories.map(c => c.id === catId
          ? {
              ...c,
              types: c.types.map(t => t.id === typeId
                ? { ...t, anomalies: [...t.anomalies, { ...anomalie, id: `ano-${uid()}` }] }
                : t
              ),
            }
          : c
        ),
      })),

      updateAnomalie: (catId, typeId, anoId, patch) => set(s => ({
        categories: s.categories.map(c => c.id === catId
          ? {
              ...c,
              types: c.types.map(t => t.id === typeId
                ? { ...t, anomalies: t.anomalies.map(a => a.id === anoId ? { ...a, ...patch } : a) }
                : t
              ),
            }
          : c
        ),
      })),

      deleteAnomalie: (catId, typeId, anoId) => set(s => ({
        categories: s.categories.map(c => c.id === catId
          ? {
              ...c,
              types: c.types.map(t => t.id === typeId
                ? { ...t, anomalies: t.anomalies.filter(a => a.id !== anoId) }
                : t
              ),
            }
          : c
        ),
      })),

      setCategories: (categories) => set({ categories }),

      resetSeed: () => set({ categories: CATALOGUE_SEED, historique: [] }),

      exportCatalogue: () => {
        const { categories } = get()
        return { categories, exportDate: new Date().toISOString() }
      },

      importCatalogue: (data) => {
        if (!data?.categories || !Array.isArray(data.categories)) return
        set({ categories: data.categories })
      },

      pushHistorique: (anoId) => {
        const current = get().historique.filter(id => id !== anoId)
        set({ historique: [anoId, ...current].slice(0, MAX_HISTORIQUE) })
      },

      clearHistorique: () => set({ historique: [] }),
    }),
    {
      name: 'kit-anomalie-catalogue',
      version: 2,
    }
  )
)
