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
  // Fusionne les données importées dans l'editor.
  // - Par défaut (merge) : ajoute les items absents, préserve le local sur doublon (dédup par titre / texte)
  // - Mode replace : écrase entièrement (utilisé par restoreShared)
  // Retourne un rapport pour affichage UI.
  importData: (data: EditorData, mode?: 'merge' | 'replace') => ImportReport
}

export interface ImportReport {
  addedTips: number
  addedFiches: number
  addedGuides: number
  skippedTips: number
  skippedFiches: number
  skippedGuides: number
  mode: 'merge' | 'replace'
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
      importData: (data, mode = 'merge') => {
        const incomingTips = data.tips ?? []
        const incomingFiches = data.fiches ?? []
        const incomingGuides = data.guides ?? []

        if (mode === 'replace') {
          set({ tips: incomingTips, fiches: incomingFiches, guides: incomingGuides })
          return {
            addedTips: incomingTips.length,
            addedFiches: incomingFiches.length,
            addedGuides: incomingGuides.length,
            skippedTips: 0,
            skippedFiches: 0,
            skippedGuides: 0,
            mode: 'replace',
          }
        }

        // Mode merge (par défaut) : dédup par titre/texte, local gagne en cas de conflit
        const s = get()
        const existingGuideTitres = new Set(s.guides.map(g => g.titre))
        const existingFicheTitres = new Set(s.fiches.map(f => f.titre))
        const existingTipTextes = new Set(s.tips.map(t => t.texte))

        const newGuides = incomingGuides.filter(g => !existingGuideTitres.has(g.titre))
        const newFiches = incomingFiches.filter(f => !existingFicheTitres.has(f.titre))
        const newTips = incomingTips.filter(t => !existingTipTextes.has(t.texte))

        set({
          tips: [...s.tips, ...newTips],
          fiches: [...s.fiches, ...newFiches],
          guides: [...s.guides, ...newGuides],
        })

        return {
          addedTips: newTips.length,
          addedFiches: newFiches.length,
          addedGuides: newGuides.length,
          skippedTips: incomingTips.length - newTips.length,
          skippedFiches: incomingFiches.length - newFiches.length,
          skippedGuides: incomingGuides.length - newGuides.length,
          mode: 'merge',
        }
      },
    }),
    { name: 'kit-anomalie-editor' }
  )
)
