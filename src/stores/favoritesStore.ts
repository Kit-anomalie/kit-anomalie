import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SearchEntry {
  id: string
  type: 'guide' | 'fiche' | 'actif' | 'catalogue'
  count: number
  lastAccess: number
}

interface FavoritesState {
  favoriteGuides: string[]
  favoriteFiches: string[]
  favoriteCatalogue: string[]
  recentGuides: string[]
  recentFiches: string[]
  searchHistory: SearchEntry[]
  // Actions
  toggleFavoriteGuide: (id: string) => void
  toggleFavoriteFiche: (id: string) => void
  toggleFavoriteCatalogue: (id: string) => void
  addRecentGuide: (id: string) => void
  addRecentFiche: (id: string) => void
  trackSearch: (id: string, type: SearchEntry['type']) => void
  getTopSearches: (type: SearchEntry['type'], limit?: number) => SearchEntry[]
}

const MAX_RECENTS = 10

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteGuides: [],
      favoriteFiches: [],
      favoriteCatalogue: [],
      recentGuides: [],
      recentFiches: [],
      searchHistory: [],

      toggleFavoriteGuide: (id) => {
        const current = get().favoriteGuides
        if (current.includes(id)) {
          set({ favoriteGuides: current.filter(g => g !== id) })
        } else {
          set({ favoriteGuides: [...current, id] })
        }
      },

      toggleFavoriteFiche: (id) => {
        const current = get().favoriteFiches
        if (current.includes(id)) {
          set({ favoriteFiches: current.filter(f => f !== id) })
        } else {
          set({ favoriteFiches: [...current, id] })
        }
      },

      toggleFavoriteCatalogue: (id) => {
        const current = get().favoriteCatalogue
        if (current.includes(id)) {
          set({ favoriteCatalogue: current.filter(c => c !== id) })
        } else {
          set({ favoriteCatalogue: [...current, id] })
        }
      },

      addRecentGuide: (id) => {
        const current = get().recentGuides.filter(g => g !== id)
        set({ recentGuides: [id, ...current].slice(0, MAX_RECENTS) })
      },

      addRecentFiche: (id) => {
        const current = get().recentFiches.filter(f => f !== id)
        set({ recentFiches: [id, ...current].slice(0, MAX_RECENTS) })
      },

      trackSearch: (id, type) => {
        const history = [...get().searchHistory]
        const existing = history.find(e => e.id === id && e.type === type)
        if (existing) {
          existing.count++
          existing.lastAccess = Date.now()
        } else {
          history.push({ id, type, count: 1, lastAccess: Date.now() })
        }
        set({ searchHistory: history })
      },

      getTopSearches: (type, limit = 5) => {
        return get().searchHistory
          .filter(e => e.type === type)
          .sort((a, b) => b.count - a.count)
          .slice(0, limit)
      },
    }),
    {
      name: 'kit-anomalie-favorites',
      version: 1,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<FavoritesState>
        return {
          favoriteGuides: state.favoriteGuides ?? [],
          favoriteFiches: state.favoriteFiches ?? [],
          favoriteCatalogue: state.favoriteCatalogue ?? [],
          recentGuides: state.recentGuides ?? [],
          recentFiches: state.recentFiches ?? [],
          searchHistory: state.searchHistory ?? [],
        } as FavoritesState
      },
    }
  )
)
