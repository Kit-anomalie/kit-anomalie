import { create } from 'zustand'
import type { CustomTip, FicheMemo, Guide } from '../types'

interface SharedContentState {
  tips: CustomTip[]
  fiches: FicheMemo[]
  guides: Guide[]
  loaded: boolean
  load: () => Promise<void>
}

export const useSharedContentStore = create<SharedContentState>()((set, get) => ({
  tips: [],
  fiches: [],
  guides: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}content.json?t=${Date.now()}`, { cache: 'no-store' })
      const data = await res.json()
      set({
        tips: data.tips ?? [],
        fiches: data.fiches ?? [],
        guides: data.guides ?? [],
        loaded: true,
      })
    } catch {
      set({ loaded: true })
    }
  },
}))
