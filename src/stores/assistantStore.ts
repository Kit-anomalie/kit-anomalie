import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Historique des requêtes de l'agent — persistant, max 10 dernières
export interface AssistantHistoryEntry {
  query: string
  date: string // ISO
}

interface AssistantState {
  history: AssistantHistoryEntry[]
  addQuery: (query: string) => void
  clearHistory: () => void
}

const MAX_HISTORY = 10

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      history: [],
      addQuery: (query) => {
        const trimmed = query.trim()
        if (!trimmed) return
        set((s) => {
          // Dédup : si la même requête existe déjà, on la remonte en haut
          const without = s.history.filter((h) => h.query.toLowerCase() !== trimmed.toLowerCase())
          return {
            history: [{ query: trimmed, date: new Date().toISOString() }, ...without].slice(0, MAX_HISTORY),
          }
        })
      },
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'kit-anomalie-assistant' }
  )
)
