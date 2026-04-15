import { create } from 'zustand'
import type { CustomTip, FicheMemo, Guide } from '../types'
import { useEditorStore } from './editorStore'

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
      const sharedTips: CustomTip[] = data.tips ?? []
      const sharedFiches: FicheMemo[] = data.fiches ?? []
      const sharedGuides: Guide[] = data.guides ?? []

      set({ tips: sharedTips, fiches: sharedFiches, guides: sharedGuides, loaded: true })

      // Injecter dans l'éditeur les contenus partagés qui n'y sont pas encore
      const editor = useEditorStore.getState()
      const editorGuidesTitres = new Set(editor.guides.map(g => g.titre))
      const editorFichesTitres = new Set(editor.fiches.map(f => f.titre))
      const editorTipsTextes = new Set(editor.tips.map(t => t.texte))

      const newGuides = sharedGuides.filter(g => !editorGuidesTitres.has(g.titre))
      const newFiches = sharedFiches.filter(f => !editorFichesTitres.has(f.titre))
      const newTips = sharedTips.filter(t => !editorTipsTextes.has(t.texte))

      if (newGuides.length > 0 || newFiches.length > 0 || newTips.length > 0) {
        useEditorStore.setState(s => ({
          guides: [...s.guides, ...newGuides],
          fiches: [...s.fiches, ...newFiches],
          tips: [...s.tips, ...newTips],
        }))
      }
    } catch {
      set({ loaded: true })
    }
  },
}))
