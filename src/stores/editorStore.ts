import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CustomTip, FicheMemo, Guide, EditorData } from '../types'
import type { QuizQuestion, QuizTheme, QuizDefinition } from '../data/quizQuestions'

interface EditorState {
  tips: CustomTip[]
  fiches: FicheMemo[]
  guides: Guide[]
  quizQuestions: QuizQuestion[]
  customThemes: QuizTheme[]
  customQuizzes: QuizDefinition[]

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

  // Quiz questions
  // - addQuizQuestion : nouvelle question avec id auto-genere
  // - upsertQuizQuestion : ecrase ou cree avec un id donne (utilise pour
  //   override des questions par defaut : meme id que le default)
  // - updateQuizQuestion : modifie une question existante
  // - deleteQuizQuestion : supprime (= reset si override d'un default)
  addQuizQuestion: (q: Omit<QuizQuestion, 'id'>) => void
  upsertQuizQuestion: (q: QuizQuestion) => void
  updateQuizQuestion: (id: string, q: Partial<QuizQuestion>) => void
  deleteQuizQuestion: (id: string) => void

  // Custom themes (s'ajoutent aux DEFAULT_THEMES)
  addCustomTheme: (label: string) => string // renvoie l'id genere
  updateCustomTheme: (id: string, label: string) => void
  deleteCustomTheme: (id: string) => void

  // Custom quizzes (groupements de questions). Suit le meme pattern que les
  // questions : addQuiz cree un nouveau quiz, upsertQuiz override un default
  // en utilisant son id, deleteQuiz supprime / reset le default si override.
  addQuiz: (q: Omit<QuizDefinition, 'id'>) => string
  upsertQuiz: (q: QuizDefinition) => void
  updateQuiz: (id: string, q: Partial<QuizDefinition>) => void
  deleteQuiz: (id: string) => void

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
  addedQuizQuestions: number
  addedCustomThemes: number
  addedCustomQuizzes: number
  skippedTips: number
  skippedFiches: number
  skippedGuides: number
  skippedQuizQuestions: number
  skippedCustomThemes: number
  skippedCustomQuizzes: number
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
      quizQuestions: [],
      customThemes: [],
      customQuizzes: [],

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

      // Quiz questions
      addQuizQuestion: (q) => set(s => ({
        quizQuestions: [...s.quizQuestions, { ...q, id: `quiz-custom-${uid()}` }]
      })),
      upsertQuizQuestion: (q) => set(s => {
        const exists = s.quizQuestions.some(x => x.id === q.id)
        return {
          quizQuestions: exists
            ? s.quizQuestions.map(x => x.id === q.id ? q : x)
            : [...s.quizQuestions, q]
        }
      }),
      updateQuizQuestion: (id, q) => set(s => ({
        quizQuestions: s.quizQuestions.map(x => x.id === id ? { ...x, ...q } : x)
      })),
      deleteQuizQuestion: (id) => set(s => ({
        quizQuestions: s.quizQuestions.filter(x => x.id !== id)
      })),

      // Custom themes
      addCustomTheme: (label) => {
        const id = `theme-custom-${uid()}`
        set(s => ({ customThemes: [...s.customThemes, { id, label: label.trim() }] }))
        return id
      },
      updateCustomTheme: (id, label) => set(s => ({
        customThemes: s.customThemes.map(t => t.id === id ? { ...t, label: label.trim() } : t)
      })),
      deleteCustomTheme: (id) => set(s => ({
        customThemes: s.customThemes.filter(t => t.id !== id)
      })),

      // Custom quizzes
      addQuiz: (q) => {
        const id = `quiz-custom-${uid()}`
        set(s => ({ customQuizzes: [...s.customQuizzes, { ...q, id }] }))
        return id
      },
      upsertQuiz: (q) => set(s => {
        const exists = s.customQuizzes.some(x => x.id === q.id)
        return {
          customQuizzes: exists
            ? s.customQuizzes.map(x => x.id === q.id ? q : x)
            : [...s.customQuizzes, q]
        }
      }),
      updateQuiz: (id, patch) => set(s => ({
        customQuizzes: s.customQuizzes.map(q => q.id === id ? { ...q, ...patch } : q)
      })),
      deleteQuiz: (id) => set(s => ({
        customQuizzes: s.customQuizzes.filter(q => q.id !== id)
      })),

      // Export / Import
      exportData: () => {
        const { tips, fiches, guides, quizQuestions, customThemes, customQuizzes } = get()
        return { tips, fiches, guides, quizQuestions, customThemes, customQuizzes, exportDate: new Date().toISOString() }
      },
      importData: (data, mode = 'merge') => {
        const incomingTips = data.tips ?? []
        const incomingFiches = data.fiches ?? []
        const incomingGuides = data.guides ?? []
        const incomingQuiz = data.quizQuestions ?? []
        const incomingThemes = data.customThemes ?? []
        const incomingQuizzes = data.customQuizzes ?? []

        if (mode === 'replace') {
          set({
            tips: incomingTips,
            fiches: incomingFiches,
            guides: incomingGuides,
            quizQuestions: incomingQuiz,
            customThemes: incomingThemes,
            customQuizzes: incomingQuizzes,
          })
          return {
            addedTips: incomingTips.length,
            addedFiches: incomingFiches.length,
            addedGuides: incomingGuides.length,
            addedQuizQuestions: incomingQuiz.length,
            addedCustomThemes: incomingThemes.length,
            addedCustomQuizzes: incomingQuizzes.length,
            skippedTips: 0,
            skippedFiches: 0,
            skippedGuides: 0,
            skippedQuizQuestions: 0,
            skippedCustomThemes: 0,
            skippedCustomQuizzes: 0,
            mode: 'replace',
          }
        }

        // Mode merge (par défaut) : dédup par titre/texte/question, local gagne en cas de conflit
        const s = get()
        const existingGuideTitres = new Set(s.guides.map(g => g.titre))
        const existingFicheTitres = new Set(s.fiches.map(f => f.titre))
        const existingTipTextes = new Set(s.tips.map(t => t.texte))
        const existingQuizIds = new Set(s.quizQuestions.map(q => q.id))
        const existingThemeIds = new Set(s.customThemes.map(t => t.id))
        const existingThemeLabels = new Set(s.customThemes.map(t => t.label.toLowerCase()))
        const existingQuizDefIds = new Set(s.customQuizzes.map(q => q.id))

        const newGuides = incomingGuides.filter(g => !existingGuideTitres.has(g.titre))
        const newFiches = incomingFiches.filter(f => !existingFicheTitres.has(f.titre))
        const newTips = incomingTips.filter(t => !existingTipTextes.has(t.texte))
        const newQuiz = incomingQuiz.filter(q => !existingQuizIds.has(q.id))
        const newThemes = incomingThemes.filter(t =>
          !existingThemeIds.has(t.id) && !existingThemeLabels.has(t.label.toLowerCase())
        )
        const newQuizzes = incomingQuizzes.filter(q => !existingQuizDefIds.has(q.id))

        set({
          tips: [...s.tips, ...newTips],
          fiches: [...s.fiches, ...newFiches],
          guides: [...s.guides, ...newGuides],
          quizQuestions: [...s.quizQuestions, ...newQuiz],
          customThemes: [...s.customThemes, ...newThemes],
          customQuizzes: [...s.customQuizzes, ...newQuizzes],
        })

        return {
          addedTips: newTips.length,
          addedFiches: newFiches.length,
          addedGuides: newGuides.length,
          addedQuizQuestions: newQuiz.length,
          addedCustomThemes: newThemes.length,
          addedCustomQuizzes: newQuizzes.length,
          skippedTips: incomingTips.length - newTips.length,
          skippedFiches: incomingFiches.length - newFiches.length,
          skippedGuides: incomingGuides.length - newGuides.length,
          skippedQuizQuestions: incomingQuiz.length - newQuiz.length,
          skippedCustomThemes: incomingThemes.length - newThemes.length,
          skippedCustomQuizzes: incomingQuizzes.length - newQuizzes.length,
          mode: 'merge',
        }
      },
    }),
    { name: 'kit-anomalie-editor' }
  )
)
