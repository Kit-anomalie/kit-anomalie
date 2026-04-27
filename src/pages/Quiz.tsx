import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '../components/BackButton'
import { DEFAULT_QUIZZES, type QuizDefinition } from '../data/quizQuestions'
import { useEditorStore } from '../stores/editorStore'
import { useQuizStore } from '../stores/quizStore'

interface ResolvedQuiz {
  quiz: QuizDefinition
  isOverridden: boolean
  isDefault: boolean
}

// Liste des quizzes disponibles. Page d'entrée à /quiz.
export function Quiz() {
  const navigate = useNavigate()
  const customQuizzes = useEditorStore((s) => s.customQuizzes)
  const allAttempts = useQuizStore((s) => s.attempts)

  // Fusion : custom > default par id, custom-only ajoutés à la suite
  const allQuizzes = useMemo<ResolvedQuiz[]>(() => {
    const customsById = new Map(customQuizzes.map((q) => [q.id, q]))
    const defaultsMerged = DEFAULT_QUIZZES.map((q) => ({
      quiz: customsById.get(q.id) ?? q,
      isDefault: true,
      isOverridden: customsById.has(q.id),
    }))
    const newCustoms = customQuizzes
      .filter((q) => !DEFAULT_QUIZZES.some((d) => d.id === q.id))
      .map((q) => ({ quiz: q, isDefault: false, isOverridden: false }))
    return [...defaultsMerged, ...newCustoms]
  }, [customQuizzes])

  return (
    <div className="px-4 py-4 space-y-4">
      <BackButton to="/" />

      <div className="spring-enter" style={{ animationDelay: '50ms' }}>
        <span className="text-3xl block mb-2" aria-hidden="true">🧠</span>
        <h1 className="text-lg font-bold text-sncf-dark">Quizzes</h1>
        <p className="text-xs text-gray-700">Choisissez un quiz pour vous entraîner</p>
      </div>

      <div className="space-y-2">
        {allQuizzes.map(({ quiz, isDefault, isOverridden }, i) => {
          const attempts = allAttempts.filter((a) => a.quizId === quiz.id)
          const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.pct)) : null

          return (
            <button
              key={quiz.id}
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              disabled={quiz.questionIds.length === 0}
              className={`w-full text-left bg-white rounded-2xl border p-4 active:scale-[0.99] transition-transform spring-scale ${
                quiz.questionIds.length === 0
                  ? 'border-gray-200 opacity-60 cursor-not-allowed'
                  : 'border-gray-100'
              }`}
              style={{ animationDelay: `${100 + Math.min(i, 6) * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-sncf-blue/10 flex items-center justify-center text-xl shrink-0">
                  🧠
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-sncf-dark">{quiz.name}</span>
                    {isOverridden && (
                      <span className="text-[9px] font-bold text-sncf-orange bg-sncf-orange/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        modifié
                      </span>
                    )}
                    {!isDefault && (
                      <span className="text-[9px] font-bold text-sncf-blue bg-sncf-blue/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        ajout
                      </span>
                    )}
                  </div>
                  {quiz.description && (
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-700">
                    <span>{quiz.questionIds.length} question{quiz.questionIds.length > 1 ? 's' : ''}</span>
                    {attempts.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{attempts.length} tentative{attempts.length > 1 ? 's' : ''}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-sncf-dark">{bestScore}%</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-sncf-blue text-sm shrink-0" aria-hidden="true">→</span>
              </div>
            </button>
          )
        })}
      </div>

      {allQuizzes.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center spring-scale">
          <span className="text-3xl block mb-2" aria-hidden="true">📭</span>
          <p className="text-sm font-semibold text-sncf-dark">Aucun quiz disponible</p>
          <p className="text-xs text-gray-700 mt-1">
            L'admin doit créer au moins un quiz dans le mode éditeur.
          </p>
        </div>
      )}
    </div>
  )
}
