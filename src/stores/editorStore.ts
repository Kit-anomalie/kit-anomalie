import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CustomTip, FicheMemo, Guide, EditorData } from '../types'

interface EditorState {
  tips: CustomTip[]
  fiches: FicheMemo[]
  guides: Guide[]

  // Tips
  addTip: (texte: string) => void
  updateTip: (id: string, texte: string) => void
  deleteTip: (id: string) => void

  // Fiches
  addFiche: (fiche: Omit<FicheMemo, 'id'>) => void
  updateFiche: (id: string, fiche: Partial<FicheMemo>) => void
  deleteFiche: (id: string) => void

  // Guides
  addGuide: (guide: Omit<Guide, 'id'>) => void
  updateGuide: (id: string, guide: Partial<Guide>) => void
  deleteGuide: (id: string) => void

  // Export / Import
  exportData: () => EditorData
  importData: (data: EditorData) => void
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      tips: [],
      fiches: [],
      guides: [],

      // Tips
      addTip: (texte) => set(s => ({
        tips: [...s.tips, { id: `tip-${uid()}`, texte, dateCreation: new Date().toISOString() }]
      })),
      updateTip: (id, texte) => set(s => ({
        tips: s.tips.map(t => t.id === id ? { ...t, texte } : t)
      })),
      deleteTip: (id) => set(s => ({
        tips: s.tips.filter(t => t.id !== id)
      })),

      // Fiches
      addFiche: (fiche) => set(s => ({
        fiches: [...s.fiches, { ...fiche, id: `fiche-custom-${uid()}` }]
      })),
      updateFiche: (id, fiche) => set(s => ({
        fiches: s.fiches.map(f => f.id === id ? { ...f, ...fiche } : f)
      })),
      deleteFiche: (id) => set(s => ({
        fiches: s.fiches.filter(f => f.id !== id)
      })),

      // Guides
      addGuide: (guide) => set(s => ({
        guides: [...s.guides, { ...guide, id: `guide-custom-${uid()}` }]
      })),
      updateGuide: (id, guide) => set(s => ({
        guides: s.guides.map(g => g.id === id ? { ...g, ...guide } : g)
      })),
      deleteGuide: (id) => set(s => ({
        guides: s.guides.filter(g => g.id !== id)
      })),

      // Export / Import
      exportData: () => {
        const { tips, fiches, guides } = get()
        return { tips, fiches, guides, exportDate: new Date().toISOString() }
      },
      importData: (data) => set({
        tips: data.tips ?? [],
        fiches: data.fiches ?? [],
        guides: data.guides ?? [],
      }),
    }),
    { name: 'kit-anomalie-editor' }
  )
)
