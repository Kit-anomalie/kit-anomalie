import { create } from 'zustand'
import type { CustomTip, FicheMemo, Guide, GlossaireTerme } from '../types'
import { useEditorStore } from './editorStore'
import { DEFAULT_GLOSSAIRE } from '../data/glossaireDefault'

interface SharedContentState {
  tips: CustomTip[]
  fiches: FicheMemo[]
  guides: Guide[]
  glossaire: GlossaireTerme[]
  loaded: boolean
  load: () => Promise<void>
  // Remet l'éditeur local à l'état exact de content.json
  // (écrase tips/fiches/guides/glossaire locaux non exportés)
  restoreShared: () => Promise<void>
}

const EXPORT_DATE_KEY = 'kit-anomalie-content-exportdate'

export const useSharedContentStore = create<SharedContentState>()((set, get) => ({
  tips: [],
  fiches: [],
  guides: [],
  glossaire: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}content.json?t=${Date.now()}`, { cache: 'no-store' })
      const data = await res.json()
      const sharedTips: CustomTip[] = data.tips ?? []
      const sharedFiches: FicheMemo[] = data.fiches ?? []
      const sharedGuides: Guide[] = data.guides ?? []
      const sharedGlossaire: GlossaireTerme[] = data.glossaire ?? []
      const exportDate: string = data.exportDate ?? ''

      set({ tips: sharedTips, fiches: sharedFiches, guides: sharedGuides, glossaire: sharedGlossaire, loaded: true })

      const lastSeen = localStorage.getItem(EXPORT_DATE_KEY)

      // Auto-sync : si c'est une nouvelle version de content.json (ou 1ère visite),
      // on écrase l'editorStore avec la version partagée. Aucune action utilisateur requise.
      // Les devices de consultation voient toujours la dernière version publiée.
      if (exportDate && lastSeen !== exportDate) {
        useEditorStore.setState({
          tips: sharedTips,
          fiches: sharedFiches,
          guides: sharedGuides,
          // Si content.json contient un glossaire, on prend celui-là.
          // Sinon on remet les défauts (cas où l'admin n'a pas encore exporté).
          glossaire: sharedGlossaire.length > 0 ? sharedGlossaire : DEFAULT_GLOSSAIRE,
        })
        localStorage.setItem(EXPORT_DATE_KEY, exportDate)
        return
      }

      // Pas d'auto-sync (même version déjà vue) : fallback sur l'ancien comportement
      // additif — on ajoute les guides/fiches/tips/glossaire qui ne sont pas encore dans l'editor
      // (cas d'un ancien utilisateur sans exportDate stocké la première fois).
      const editor = useEditorStore.getState()
      const editorGuidesTitres = new Set(editor.guides.map(g => g.titre))
      const editorFichesTitres = new Set(editor.fiches.map(f => f.titre))
      const editorTipsTextes = new Set(editor.tips.map(t => t.texte))
      const editorGlossaireIds = new Set((editor.glossaire ?? []).map(t => t.id))

      const newGuides = sharedGuides.filter(g => !editorGuidesTitres.has(g.titre))
      const newFiches = sharedFiches.filter(f => !editorFichesTitres.has(f.titre))
      const newTips = sharedTips.filter(t => !editorTipsTextes.has(t.texte))
      const sourceGlossaire = sharedGlossaire.length > 0 ? sharedGlossaire : DEFAULT_GLOSSAIRE
      const newGlossaire = sourceGlossaire.filter(t => !editorGlossaireIds.has(t.id))

      if (newGuides.length > 0 || newFiches.length > 0 || newTips.length > 0 || newGlossaire.length > 0) {
        useEditorStore.setState(s => ({
          guides: [...s.guides, ...newGuides],
          fiches: [...s.fiches, ...newFiches],
          tips: [...s.tips, ...newTips],
          glossaire: [...s.glossaire, ...newGlossaire],
        }))
      }
    } catch {
      set({ loaded: true })
    }
  },

  restoreShared: async () => {
    // 1. Clear editor (local overrides) + force re-sync
    useEditorStore.setState({ tips: [], fiches: [], guides: [], glossaire: [] })
    localStorage.removeItem(EXPORT_DATE_KEY)
    // 2. Reset sharedContentStore for clean reload
    set({ loaded: false, tips: [], fiches: [], guides: [], glossaire: [] })
    // 3. Re-fetch content.json et ré-injecte dans l'éditeur
    await get().load()
  },
}))
