import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Une tentative passée — sauvegardée pour afficher la progression de l'agent
export interface QuizAttempt {
  id: string
  quizId: string
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
  finishAttempt: (quizId: string, total: number, correct: number) => void
  resetCurrent: () => void
  // Helpers
  attemptsForQuiz: (quizId: string) => QuizAttempt[]
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      attempts: [],
      currentIndex: 0,
      answers: {},

      startNewAttempt: () => set({ currentIndex: 0, answers: {} }),

      selectAnswer: (questionId, answerIndex) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: answerIndex } })),

      goToQuestion: (index) => set({ currentIndex: index }),

      finishAttempt: (quizId, total, correct) =>
        set((s) => ({
          attempts: [
            ...s.attempts,
            {
              id: `qa-${Date.now()}`,
              quizId,
              date: new Date().toISOString(),
              total,
              correct,
              pct: Math.round((correct / total) * 100),
            },
          ],
          // On garde answers + currentIndex pour permettre la revue avant reset
        })),

      resetCurrent: () => set({ currentIndex: 0, answers: {} }),

      attemptsForQuiz: (quizId) => get().attempts.filter((a) => a.quizId === quizId),
    }),
    {
      name: 'kit-anomalie-quiz',
      // On ne persiste QUE l'historique. La session courante est volatile.
      partialize: (s) => ({ attempts: s.attempts }),
    }
  )
)
