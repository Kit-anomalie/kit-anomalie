import { useMemo, useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import {
  QUIZ_QUESTIONS,
  DEFAULT_THEMES,
  DEFAULT_QUIZZES,
  getThemeLabel,
  type QuizQuestion,
  type QuizDefinition,
} from '../data/quizQuestions'

interface QuestionFormState {
  id: string | null // null = nouvelle question, sinon = id de la question editee/override
  theme: string
  question: string
  options: [string, string, string, string]
  correct: number
  explanation: string
  isOverridingDefault: boolean
}

const EMPTY_QUESTION_FORM: QuestionFormState = {
  id: null,
  theme: 'classement',
  question: '',
  options: ['', '', '', ''],
  correct: 0,
  explanation: '',
  isOverridingDefault: false,
}

interface QuizFormState {
  id: string | null // null = nouveau, sinon = id du quiz
  name: string
  description: string
  questionIds: Set<string>
  isOverridingDefault: boolean
}

const EMPTY_QUIZ_FORM: QuizFormState = {
  id: null,
  name: '',
  description: '',
  questionIds: new Set(),
  isOverridingDefault: false,
}

type View = 'list' | 'question-form' | 'quiz-form'

export function EditorQuiz() {
  // Stores
  const customQuestions = useEditorStore((s) => s.quizQuestions)
  const customThemes = useEditorStore((s) => s.customThemes)
  const customQuizzes = useEditorStore((s) => s.customQuizzes)
  const addQuizQuestion = useEditorStore((s) => s.addQuizQuestion)
  const upsertQuizQuestion = useEditorStore((s) => s.upsertQuizQuestion)
  const deleteQuizQuestion = useEditorStore((s) => s.deleteQuizQuestion)
  const addCustomTheme = useEditorStore((s) => s.addCustomTheme)
  const updateCustomTheme = useEditorStore((s) => s.updateCustomTheme)
  const deleteCustomTheme = useEditorStore((s) => s.deleteCustomTheme)
  const addQuiz = useEditorStore((s) => s.addQuiz)
  const upsertQuiz = useEditorStore((s) => s.upsertQuiz)
  const deleteQuiz = useEditorStore((s) => s.deleteQuiz)

  // View state
  const [view, setView] = useState<View>('list')
  const [questionForm, setQuestionForm] = useState<QuestionFormState>(EMPTY_QUESTION_FORM)
  const [quizForm, setQuizForm] = useState<QuizFormState>(EMPTY_QUIZ_FORM)
  const [newThemeLabel, setNewThemeLabel] = useState('')
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null)
  const [editingThemeLabel, setEditingThemeLabel] = useState('')

  // ── Données fusionnées ──

  const effectiveQuestions = useMemo(() => {
    const customsById = new Map(customQuestions.map((q) => [q.id, q]))
    const defaultsMerged = QUIZ_QUESTIONS.map((q) => ({
      question: customsById.get(q.id) ?? q,
      isDefault: true,
      isOverridden: customsById.has(q.id),
    }))
    const newCustoms = customQuestions
      .filter((q) => !QUIZ_QUESTIONS.some((d) => d.id === q.id))
      .map((q) => ({ question: q, isDefault: false, isOverridden: false }))
    return [...defaultsMerged, ...newCustoms]
  }, [customQuestions])

  const effectiveQuizzes = useMemo(() => {
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

  // Pool global de questions disponibles (defaults + customs, overrides appliqués)
  const allAvailableQuestions = useMemo<QuizQuestion[]>(
    () => effectiveQuestions.map((e) => e.question),
    [effectiveQuestions]
  )

  // ── Validation ──

  const isQuestionFormValid =
    questionForm.question.trim().length > 0 &&
    questionForm.options.every((o) => o.trim().length > 0) &&
    questionForm.explanation.trim().length > 0 &&
    questionForm.theme.trim().length > 0

  const isQuizFormValid = quizForm.name.trim().length > 0 && quizForm.questionIds.size > 0

  // ── Question actions ──

  const startNewQuestion = () => {
    setQuestionForm({ ...EMPTY_QUESTION_FORM })
    setView('question-form')
  }

  const startEditCustomQuestion = (q: QuizQuestion) => {
    setQuestionForm({
      id: q.id,
      theme: q.theme,
      question: q.question,
      options: [q.options[0] ?? '', q.options[1] ?? '', q.options[2] ?? '', q.options[3] ?? ''],
      correct: q.correct,
      explanation: q.explanation,
      isOverridingDefault: false,
    })
    setView('question-form')
  }

  const startOverrideQuestion = (q: QuizQuestion) => {
    setQuestionForm({
      id: q.id,
      theme: q.theme,
      question: q.question,
      options: [q.options[0] ?? '', q.options[1] ?? '', q.options[2] ?? '', q.options[3] ?? ''],
      correct: q.correct,
      explanation: q.explanation,
      isOverridingDefault: true,
    })
    setView('question-form')
  }

  const saveQuestionForm = () => {
    if (!isQuestionFormValid) return
    const payload: Omit<QuizQuestion, 'id'> = {
      theme: questionForm.theme,
      question: questionForm.question.trim(),
      options: questionForm.options.map((o) => o.trim()),
      correct: questionForm.correct,
      explanation: questionForm.explanation.trim(),
    }
    if (questionForm.id === null) {
      addQuizQuestion(payload)
    } else {
      upsertQuizQuestion({ ...payload, id: questionForm.id })
    }
    setView('list')
  }

  const resetOverrideQuestion = (id: string) => {
    if (confirm('Réinitialiser cette question à sa version par défaut ?')) {
      deleteQuizQuestion(id)
    }
  }

  const deleteCustomQuestion = (id: string) => {
    if (confirm('Supprimer cette question ?')) {
      deleteQuizQuestion(id)
    }
  }

  // ── Quiz actions ──

  const startNewQuiz = () => {
    setQuizForm({ ...EMPTY_QUIZ_FORM, questionIds: new Set() })
    setView('quiz-form')
  }

  const startEditCustomQuiz = (q: QuizDefinition) => {
    setQuizForm({
      id: q.id,
      name: q.name,
      description: q.description ?? '',
      questionIds: new Set(q.questionIds),
      isOverridingDefault: false,
    })
    setView('quiz-form')
  }

  const startOverrideQuiz = (q: QuizDefinition) => {
    setQuizForm({
      id: q.id,
      name: q.name,
      description: q.description ?? '',
      questionIds: new Set(q.questionIds),
      isOverridingDefault: true,
    })
    setView('quiz-form')
  }

  const saveQuizForm = () => {
    if (!isQuizFormValid) return
    const payload: Omit<QuizDefinition, 'id'> = {
      name: quizForm.name.trim(),
      description: quizForm.description.trim() || undefined,
      questionIds: Array.from(quizForm.questionIds),
    }
    if (quizForm.id === null) {
      addQuiz(payload)
    } else {
      upsertQuiz({ ...payload, id: quizForm.id })
    }
    setView('list')
  }

  const resetOverrideQuiz = (id: string) => {
    if (confirm('Réinitialiser ce quiz à sa version par défaut ?')) {
      deleteQuiz(id)
    }
  }

  const deleteCustomQuiz = (id: string) => {
    if (confirm('Supprimer ce quiz ?')) {
      deleteQuiz(id)
    }
  }

  const toggleQuestionInQuiz = (id: string) => {
    setQuizForm((s) => {
      const next = new Set(s.questionIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...s, questionIds: next }
    })
  }

  // ── Theme actions ──

  const handleAddTheme = () => {
    const label = newThemeLabel.trim()
    if (!label) return
    const lower = label.toLowerCase()
    const exists =
      DEFAULT_THEMES.some((t) => t.label.toLowerCase() === lower) ||
      customThemes.some((t) => t.label.toLowerCase() === lower)
    if (exists) {
      alert('Ce thème existe déjà.')
      return
    }
    addCustomTheme(label)
    setNewThemeLabel('')
  }

  const startEditTheme = (id: string, label: string) => {
    setEditingThemeId(id)
    setEditingThemeLabel(label)
  }

  const saveEditTheme = () => {
    if (!editingThemeId) return
    const label = editingThemeLabel.trim()
    if (label) updateCustomTheme(editingThemeId, label)
    setEditingThemeId(null)
    setEditingThemeLabel('')
  }

  const handleDeleteTheme = (id: string, label: string) => {
    const used = customQuestions.some((q) => q.theme === id) ||
      QUIZ_QUESTIONS.some((q) => q.theme === id)
    if (used) {
      alert(`Impossible : le thème « ${label} » est utilisé par au moins une question.`)
      return
    }
    if (confirm(`Supprimer le thème « ${label} » ?`)) {
      deleteCustomTheme(id)
    }
  }

  // ── Vue : formulaire question ──
  if (view === 'question-form') {
    const setOption = (idx: number, val: string) => {
      const next: [string, string, string, string] = [...questionForm.options]
      next[idx] = val
      setQuestionForm({ ...questionForm, options: next })
    }

    const titre =
      questionForm.id === null
        ? 'Nouvelle question'
        : questionForm.isOverridingDefault
        ? 'Modifier (question par défaut)'
        : 'Modifier la question'

    return (
      <div className="space-y-4">
        <button
          onClick={() => setView('list')}
          className="text-sncf-blue text-sm font-medium active:opacity-60"
        >
          ← Retour à la liste
        </button>

        <div>
          <h2 className="text-sm font-bold text-sncf-dark">{titre}</h2>
          {questionForm.isOverridingDefault && (
            <p className="text-[11px] text-sncf-orange mt-1">
              ⓘ La modification créera une version override que tu pourras réinitialiser à tout moment.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          {/* Theme */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Thème <span className="text-sncf-red">*</span>
            </label>
            <select
              value={questionForm.theme}
              onChange={(e) => setQuestionForm({ ...questionForm, theme: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            >
              <optgroup label="Par défaut">
                {DEFAULT_THEMES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </optgroup>
              {customThemes.length > 0 && (
                <optgroup label="Personnalisés">
                  {customThemes.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Question <span className="text-sncf-red">*</span>
            </label>
            <textarea
              value={questionForm.question}
              onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
              rows={2}
              placeholder="Ex : Que signifie le classement S/I ?"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
            />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              4 réponses possibles <span className="text-sncf-red">*</span>
            </label>
            <p className="text-[11px] text-gray-700 mb-2">Coche la bonne réponse à droite</p>
            <div className="space-y-2">
              {questionForm.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-gray-100 text-sncf-dark text-xs font-bold flex items-center justify-center">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    value={opt}
                    onChange={(e) => setOption(idx, e.target.value)}
                    placeholder={`Réponse ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
                  />
                  <label className="flex items-center gap-1 shrink-0 cursor-pointer">
                    <input
                      type="radio"
                      name="correct"
                      checked={questionForm.correct === idx}
                      onChange={() => setQuestionForm({ ...questionForm, correct: idx })}
                      className="w-4 h-4 accent-sncf-green"
                      aria-label={`Réponse ${String.fromCharCode(65 + idx)} correcte`}
                    />
                    <span className="text-[11px] text-gray-700">✓</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Explication */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Explication <span className="text-sncf-red">*</span>
            </label>
            <textarea
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              rows={3}
              placeholder="Affichée après validation, pédagogique"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={saveQuestionForm}
              disabled={!isQuestionFormValid}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-transform ${
                isQuestionFormValid
                  ? 'bg-sncf-blue text-white active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {questionForm.id === null ? 'Ajouter' : 'Enregistrer'}
            </button>
            <button
              onClick={() => setView('list')}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm active:scale-[0.98] transition-transform"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Vue : formulaire quiz ──
  if (view === 'quiz-form') {
    // Groupe les questions par thème pour la sélection
    const grouped = new Map<string, QuizQuestion[]>()
    for (const q of allAvailableQuestions) {
      const arr = grouped.get(q.theme) ?? []
      arr.push(q)
      grouped.set(q.theme, arr)
    }

    const titre =
      quizForm.id === null
        ? 'Nouveau quiz'
        : quizForm.isOverridingDefault
        ? 'Modifier (quiz par défaut)'
        : 'Modifier le quiz'

    return (
      <div className="space-y-4">
        <button
          onClick={() => setView('list')}
          className="text-sncf-blue text-sm font-medium active:opacity-60"
        >
          ← Retour à la liste
        </button>

        <div>
          <h2 className="text-sm font-bold text-sncf-dark">{titre}</h2>
          {quizForm.isOverridingDefault && (
            <p className="text-[11px] text-sncf-orange mt-1">
              ⓘ Crée une version override réinitialisable.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Nom du quiz <span className="text-sncf-red">*</span>
            </label>
            <input
              value={quizForm.name}
              onChange={(e) => setQuizForm({ ...quizForm, name: e.target.value })}
              placeholder="Ex : Classement approfondi"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Description (optionnel)
            </label>
            <textarea
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
              rows={2}
              placeholder="Une phrase pour situer le quiz"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">
                Questions <span className="text-sncf-red">*</span>
              </label>
              <span className="text-[11px] text-gray-700">
                {quizForm.questionIds.size} sélectionnée{quizForm.questionIds.size > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-[11px] text-gray-700 mb-2">
              Pioche dans les questions disponibles. Tu peux mélanger défauts et tes ajouts.
            </p>

            <div className="space-y-3">
              {[...DEFAULT_THEMES, ...customThemes].map((theme) => {
                const themeQuestions = grouped.get(theme.id) ?? []
                if (themeQuestions.length === 0) return null
                return (
                  <div key={theme.id}>
                    <div className="text-[10px] font-bold text-sncf-dark uppercase tracking-wide mb-1">
                      {theme.label}
                    </div>
                    <div className="space-y-1">
                      {themeQuestions.map((q) => {
                        const checked = quizForm.questionIds.has(q.id)
                        return (
                          <label
                            key={q.id}
                            className={`flex items-start gap-2 p-2 rounded-xl cursor-pointer transition-colors ${
                              checked ? 'bg-sncf-blue/10' : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleQuestionInQuiz(q.id)}
                              className="mt-0.5 w-4 h-4 accent-sncf-blue"
                            />
                            <span className="flex-1 text-xs text-sncf-dark leading-snug">
                              {q.question}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={saveQuizForm}
              disabled={!isQuizFormValid}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-transform ${
                isQuizFormValid
                  ? 'bg-sncf-blue text-white active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {quizForm.id === null ? 'Ajouter' : 'Enregistrer'}
            </button>
            <button
              onClick={() => setView('list')}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm active:scale-[0.98] transition-transform"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Vue : liste ──

  const overrideQuizCount = effectiveQuizzes.filter((e) => e.isOverridden).length
  const customQuizCount = effectiveQuizzes.filter((e) => !e.isDefault).length
  const overrideCount = effectiveQuestions.filter((e) => e.isOverridden).length
  const customAddedCount = effectiveQuestions.filter((e) => !e.isDefault).length

  return (
    <div className="space-y-5">
      {/* ── Section Quizzes ── */}
      <div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-sncf-dark">Mes quizzes</h2>
            <p className="text-xs text-gray-700 mt-1">
              {DEFAULT_QUIZZES.length} par défaut
              {overrideQuizCount > 0 && ` · ${overrideQuizCount} modifié${overrideQuizCount > 1 ? 's' : ''}`}
              {customQuizCount > 0 && ` · ${customQuizCount} ajouté${customQuizCount > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <button
          onClick={startNewQuiz}
          className="w-full mt-3 py-3 rounded-2xl bg-sncf-blue text-white font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          + Nouveau quiz
        </button>

        <div className="space-y-2 mt-3">
          {effectiveQuizzes.map(({ quiz, isDefault, isOverridden }) => (
            <div
              key={quiz.id}
              className={`bg-white rounded-2xl border p-3 ${
                isOverridden ? 'border-sncf-orange/40' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-sncf-dark">{quiz.name}</span>
                {isDefault && !isOverridden && (
                  <span className="text-[9px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                    défaut
                  </span>
                )}
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
                <p className="text-xs text-gray-700 mb-2 leading-relaxed">{quiz.description}</p>
              )}
              <p className="text-[11px] text-gray-700 mb-3">
                {quiz.questionIds.length} question{quiz.questionIds.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => (isDefault ? startOverrideQuiz(quiz) : startEditCustomQuiz(quiz))}
                  className="flex-1 min-w-[100px] text-xs text-sncf-blue bg-sncf-blue/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
                >
                  Modifier
                </button>
                {isOverridden && (
                  <button
                    onClick={() => resetOverrideQuiz(quiz.id)}
                    className="flex-1 min-w-[100px] text-xs text-sncf-orange bg-sncf-orange/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
                  >
                    Réinitialiser
                  </button>
                )}
                {!isDefault && (
                  <button
                    onClick={() => deleteCustomQuiz(quiz.id)}
                    className="flex-1 min-w-[100px] text-xs text-sncf-red bg-sncf-red/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section Thèmes ── */}
      <div className="border-t border-gray-200 pt-5">
        <h2 className="text-sm font-bold text-sncf-dark">Mes thèmes</h2>
        <p className="text-xs text-gray-700 mt-1">
          {DEFAULT_THEMES.length} par défaut
          {customThemes.length > 0 && ` · ${customThemes.length} ajouté${customThemes.length > 1 ? 's' : ''}`}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {DEFAULT_THEMES.map((t) => (
            <span
              key={t.id}
              className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1 font-medium"
              title="Thème par défaut (lecture seule)"
            >
              {t.label}
            </span>
          ))}
          {customThemes.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 text-xs bg-sncf-blue/10 text-sncf-dark rounded-full px-3 py-1 font-medium"
            >
              {editingThemeId === t.id ? (
                <>
                  <input
                    value={editingThemeLabel}
                    onChange={(e) => setEditingThemeLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditTheme()
                      if (e.key === 'Escape') {
                        setEditingThemeId(null)
                        setEditingThemeLabel('')
                      }
                    }}
                    autoFocus
                    className="bg-white px-2 py-0.5 rounded text-xs w-24 focus:outline-none border border-sncf-blue"
                  />
                  <button onClick={saveEditTheme} aria-label="Enregistrer" className="text-sncf-green text-xs">✓</button>
                </>
              ) : (
                <>
                  {t.label}
                  <button
                    onClick={() => startEditTheme(t.id, t.label)}
                    aria-label="Renommer"
                    className="text-sncf-blue text-[10px] active:opacity-60 transition-opacity"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteTheme(t.id, t.label)}
                    aria-label="Supprimer"
                    className="text-sncf-red text-[10px] active:opacity-60 transition-opacity"
                  >
                    ✕
                  </button>
                </>
              )}
            </span>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={newThemeLabel}
            onChange={(e) => setNewThemeLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTheme()}
            placeholder="Ex : Procédures"
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
          />
          <button
            onClick={handleAddTheme}
            disabled={!newThemeLabel.trim()}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-transform ${
              newThemeLabel.trim()
                ? 'bg-sncf-blue text-white active:scale-[0.97]'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            + Thème
          </button>
        </div>
      </div>

      {/* ── Section Questions ── */}
      <div className="border-t border-gray-200 pt-5">
        <h2 className="text-sm font-bold text-sncf-dark">Banque de questions</h2>
        <p className="text-xs text-gray-700 mt-1">
          {QUIZ_QUESTIONS.length} par défaut
          {overrideCount > 0 && ` · ${overrideCount} modifiée${overrideCount > 1 ? 's' : ''}`}
          {customAddedCount > 0 && ` · ${customAddedCount} ajoutée${customAddedCount > 1 ? 's' : ''}`}
        </p>
        <p className="text-[11px] text-gray-700 italic mt-1">
          Les questions sont la matière première — assigne-les à un quiz pour qu'elles apparaissent dans l'app.
        </p>
      </div>

      <button
        onClick={startNewQuestion}
        className="w-full py-3 rounded-2xl bg-sncf-blue/10 text-sncf-blue font-semibold text-sm active:scale-[0.98] transition-transform border border-sncf-blue/30"
      >
        + Nouvelle question
      </button>

      <div className="space-y-2">
        {effectiveQuestions.map(({ question: q, isDefault, isOverridden }) => (
          <div
            key={q.id}
            className={`bg-white rounded-2xl border p-4 ${
              isOverridden ? 'border-sncf-orange/40' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-bold text-sncf-dark bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                {getThemeLabel(q.theme, customThemes)}
              </span>
              {isDefault && !isOverridden && (
                <span className="text-[10px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                  défaut
                </span>
              )}
              {isOverridden && (
                <span className="text-[10px] font-bold text-sncf-orange bg-sncf-orange/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  modifiée
                </span>
              )}
              {!isDefault && (
                <span className="text-[10px] font-bold text-sncf-blue bg-sncf-blue/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  ajout
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-sncf-dark mb-2">{q.question}</p>
            <ul className="space-y-1 mb-2">
              {q.options.map((o, idx) => (
                <li
                  key={idx}
                  className={`text-xs flex items-start gap-2 ${
                    idx === q.correct ? 'text-sncf-green font-semibold' : 'text-gray-700'
                  }`}
                >
                  <span aria-hidden="true">{idx === q.correct ? '✓' : '·'}</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-gray-700 italic mb-3 leading-relaxed">{q.explanation}</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => (isDefault ? startOverrideQuestion(q) : startEditCustomQuestion(q))}
                className="flex-1 min-w-[100px] text-xs text-sncf-blue bg-sncf-blue/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
              >
                Modifier
              </button>
              {isOverridden && (
                <button
                  onClick={() => resetOverrideQuestion(q.id)}
                  className="flex-1 min-w-[100px] text-xs text-sncf-orange bg-sncf-orange/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
                >
                  Réinitialiser
                </button>
              )}
              {!isDefault && (
                <button
                  onClick={() => deleteCustomQuestion(q.id)}
                  className="flex-1 min-w-[100px] text-xs text-sncf-red bg-sncf-red/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
