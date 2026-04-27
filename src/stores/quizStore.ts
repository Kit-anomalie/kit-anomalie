import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Une tentative passée — sauvegardée pour afficher la progression de l'agent
export interface QuizAttempt {
  id: string
  date: string // ISO
  total: number
  correct: number
  pct: number
}

// État runtime d'une session quiz en cours
interface QuizState {
  // Historique persistant
  attempts: QuizAttempt[]
  // Session courante (non persistée — on perd au refresh, c'est volontaire)
  currentIndex: number
  answers: Record<string, number> // questionId -> indexChoisi
  // Actions
  startNewAttempt: () => void
  selectAnswer: (questionId: string, answerIndex: number) => void
  goToQuestion: (index: number) => void
  finishAttempt: (total: number, correct: number) => void
  resetCurrent: () => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      attempts: [],
      currentIndex: 0,
      answers: {},

      startNewAttempt: () => set({ currentIndex: 0, answers: {} }),

      selectAnswer: (questionId, answerIndex) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: answerIndex } })),

      goToQuestion: (index) => set({ currentIndex: index }),

      finishAttempt: (total, correct) =>
        set((s) => ({
          attempts: [
            ...s.attempts,
            {
              id: `qa-${Date.now()}`,
              date: new Date().toISOString(),
              total,
              correct,
              pct: Math.round((correct / total) * 100),
            },
          ],
          // On garde answers + currentIndex pour permettre la revue avant reset
        })),

      resetCurrent: () => set({ currentIndex: 0, answers: {} }),
    }),
    {
      name: 'kit-anomalie-quiz',
      // On ne persiste QUE l'historique. La session courante est volatile.
      partialize: (s) => ({ attempts: s.attempts }),
    }
  )
)
