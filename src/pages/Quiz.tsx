import { useState } from 'react'
import { BackButton } from '../components/BackButton'
import { QUIZ_QUESTIONS, QUIZ_THEMES_LABELS } from '../data/quizQuestions'
import { useQuizStore, type QuizAttempt } from '../stores/quizStore'

type Phase = 'idle' | 'playing' | 'done'

export function Quiz() {
  const attempts = useQuizStore((s) => s.attempts)
  const currentIndex = useQuizStore((s) => s.currentIndex)
  const answers = useQuizStore((s) => s.answers)
  const startNewAttempt = useQuizStore((s) => s.startNewAttempt)
  const selectAnswer = useQuizStore((s) => s.selectAnswer)
  const goToQuestion = useQuizStore((s) => s.goToQuestion)
  const finishAttempt = useQuizStore((s) => s.finishAttempt)

  const [phase, setPhase] = useState<Phase>('idle')
  // Pour le feedback inline : a-t-on validé la réponse de la question courante ?
  const [validated, setValidated] = useState(false)

  const total = QUIZ_QUESTIONS.length
  const currentQuestion = QUIZ_QUESTIONS[currentIndex]
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined
  const hasSelected = selectedAnswer !== undefined

  // Stats historiques
  const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.pct)) : 0
  const lastAttempt: QuizAttempt | undefined = attempts[attempts.length - 1]

  const handleStart = () => {
    startNewAttempt()
    setValidated(false)
    setPhase('playing')
  }

  const handleSelect = (idx: number) => {
    if (validated) return
    selectAnswer(currentQuestion.id, idx)
  }

  const handleValidate = () => {
    if (!hasSelected) return
    setValidated(true)
  }

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      // Fin
      const correct = QUIZ_QUESTIONS.reduce(
        (acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0),
        0
      )
      finishAttempt(total, correct)
      setPhase('done')
      return
    }
    goToQuestion(currentIndex + 1)
    setValidated(false)
  }

  const handleRetry = () => {
    startNewAttempt()
    setValidated(false)
    setPhase('playing')
  }

  // ── Phase IDLE — intro ──
  if (phase === 'idle') {
    return (
      <div className="px-4 py-4 space-y-4">
        <BackButton to="/" />

        <div className="spring-enter" style={{ animationDelay: '50ms' }}>
          <span className="text-3xl block mb-2" aria-hidden="true">🧠</span>
          <h1 className="text-lg font-bold text-sncf-dark">Quiz</h1>
          <p className="text-xs text-gray-600">Testez vos connaissances sur les anomalies</p>
        </div>

        <div
          className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 spring-scale"
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sncf-blue/10 flex items-center justify-center text-xl">
              📚
            </div>
            <div>
              <div className="text-sm font-semibold text-sncf-dark">{total} questions</div>
              <div className="text-xs text-gray-600">Classement, DLF, description, doublons, terminologie</div>
            </div>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            À la fin, vous voyez votre score, les bonnes réponses et l'explication de chaque
            question.
          </p>
        </div>

        {attempts.length > 0 && (
          <div
            className="bg-sncf-blue/5 border border-sncf-blue/20 rounded-2xl p-4 spring-scale"
            style={{ animationDelay: '180ms' }}
          >
            <div className="text-[11px] font-bold text-sncf-dark uppercase tracking-wide mb-2">
              Votre progression
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-sncf-dark">{attempts.length}</div>
                <div className="text-[11px] text-gray-600">tentative{attempts.length > 1 ? 's' : ''}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-sncf-dark">{bestScore}%</div>
                <div className="text-[11px] text-gray-600">meilleur score</div>
              </div>
              <div>
                <div className="text-lg font-bold text-sncf-dark">{lastAttempt?.pct ?? 0}%</div>
                <div className="text-[11px] text-gray-600">dernière</div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl bg-sncf-blue text-white font-semibold text-sm active:scale-[0.98] transition-transform spring-scale"
          style={{ animationDelay: '240ms' }}
        >
          {attempts.length > 0 ? 'Recommencer le quiz' : 'Démarrer le quiz'}
        </button>
      </div>
    )
  }

  // ── Phase PLAYING — questions ──
  if (phase === 'playing' && currentQuestion) {
    const isLast = currentIndex + 1 === total
    const correctIdx = currentQuestion.correct

    return (
      <div className="px-4 py-4 space-y-4 pb-32">
        <div className="flex items-center justify-between gap-3">
          <BackButton to="/" />
          <span className="text-[11px] text-gray-600">
            Question {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-sncf-blue transition-all duration-300"
            style={{ width: `${((currentIndex + (validated ? 1 : 0)) / total) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentIndex + (validated ? 1 : 0)}
            aria-valuemin={0}
            aria-valuemax={total}
          />
        </div>

        <div className="spring-enter" key={currentQuestion.id}>
          <span className="inline-block text-[10px] font-bold text-sncf-dark bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide mb-2">
            {QUIZ_THEMES_LABELS[currentQuestion.theme]}
          </span>
          <h2 className="text-base font-bold text-sncf-dark leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="space-y-2" role="radiogroup" aria-label="Réponses possibles">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx
            const isCorrect = idx === correctIdx
            // Couleurs après validation
            let stateClass = 'bg-white border-gray-200 text-sncf-dark'
            if (validated) {
              if (isCorrect) {
                stateClass = 'bg-green-50 border-sncf-green text-sncf-dark'
              } else if (isSelected) {
                stateClass = 'bg-red-50 border-sncf-red text-sncf-dark'
              } else {
                stateClass = 'bg-white border-gray-200 text-gray-600'
              }
            } else if (isSelected) {
              stateClass = 'bg-sncf-blue/10 border-sncf-blue text-sncf-dark'
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={validated}
                role="radio"
                aria-checked={isSelected}
                className={`w-full text-left p-3.5 rounded-2xl border-2 text-sm font-medium transition-colors min-h-[56px] ${stateClass} ${
                  validated ? '' : 'active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      validated && isCorrect
                        ? 'border-sncf-green bg-sncf-green text-white'
                        : validated && isSelected
                        ? 'border-sncf-red bg-sncf-red text-white'
                        : isSelected
                        ? 'border-sncf-blue bg-sncf-blue text-white'
                        : 'border-gray-300 text-gray-600'
                    }`}
                    aria-hidden="true"
                  >
                    {validated && isCorrect ? '✓' : validated && isSelected ? '✕' : String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback + explication après validation */}
        {validated && (
          <div
            role="status"
            className={`rounded-2xl p-4 border spring-scale ${
              selectedAnswer === correctIdx
                ? 'bg-green-50 border-sncf-green/30'
                : 'bg-red-50 border-sncf-red/30'
            }`}
          >
            <div className="text-sm font-bold text-sncf-dark mb-1">
              {selectedAnswer === correctIdx ? '✓ Bonne réponse' : '✕ Réponse incorrecte'}
            </div>
            <p className="text-xs text-sncf-dark leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Barre d'action sticky en bas */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-[768px] lg:max-w-[1024px] bg-white border-t border-gray-200 px-4 py-3 z-40 md:static md:max-w-none md:border-0 md:bg-transparent md:px-0 md:translate-x-0 md:left-auto">
          {!validated ? (
            <button
              onClick={handleValidate}
              disabled={!hasSelected}
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-transform ${
                hasSelected
                  ? 'bg-sncf-blue text-white active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Valider
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-sncf-dark text-white font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              {isLast ? 'Voir le résultat' : 'Question suivante →'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Phase DONE — résultat ──
  if (phase === 'done') {
    const correctCount = QUIZ_QUESTIONS.reduce(
      (acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0),
      0
    )
    const pct = Math.round((correctCount / total) * 100)
    const color =
      pct >= 80 ? 'text-sncf-green' : pct >= 50 ? 'text-sncf-orange' : 'text-sncf-red'
    const message =
      pct >= 80
        ? 'Excellente maîtrise des fondamentaux 🎯'
        : pct >= 50
        ? 'Bonne base — quelques points à consolider 💪'
        : 'À retravailler — consultez les fiches mémo 📋'

    return (
      <div className="px-4 py-4 space-y-4">
        <BackButton to="/" />

        <div
          className="bg-white border border-gray-100 rounded-2xl p-6 text-center spring-scale"
          style={{ animationDelay: '50ms' }}
        >
          <div className={`text-5xl font-bold ${color}`}>{pct}%</div>
          <div className="text-sm text-gray-700 mt-1">
            {correctCount} bonne{correctCount > 1 ? 's' : ''} réponse{correctCount > 1 ? 's' : ''} sur {total}
          </div>
          <p className="text-sm text-sncf-dark mt-3 font-medium">{message}</p>
        </div>

        <div className="space-y-2 spring-enter" style={{ animationDelay: '150ms' }}>
          <h2 className="text-sm font-bold text-sncf-dark px-1">Récapitulatif</h2>
          {QUIZ_QUESTIONS.map((q, i) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correct
            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-3 ${
                  isCorrect ? 'border-sncf-green/30' : 'border-sncf-red/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCorrect ? 'bg-sncf-green text-white' : 'bg-sncf-red text-white'
                    }`}
                    aria-hidden="true"
                  >
                    {isCorrect ? '✓' : '✕'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                      {QUIZ_THEMES_LABELS[q.theme]} · Q{i + 1}
                    </div>
                    <div className="text-xs font-medium text-sncf-dark mt-0.5">{q.question}</div>
                    {!isCorrect && (
                      <div className="text-[11px] text-gray-700 mt-1.5 leading-relaxed">
                        <span className="font-semibold">Bonne réponse :</span>{' '}
                        {q.options[q.correct]}
                      </div>
                    )}
                    <div className="text-[11px] text-gray-600 mt-1 leading-relaxed italic">
                      {q.explanation}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleRetry}
          className="w-full py-3.5 rounded-2xl bg-sncf-blue text-white font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          Recommencer
        </button>
      </div>
    )
  }

  return null
}
