import { useMemo, useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import {
  QUIZ_QUESTIONS,
  DEFAULT_THEMES,
  getThemeLabel,
  type QuizQuestion,
} from '../data/quizQuestions'

interface FormState {
  id: string | null // null = nouvelle question, sinon = id de la question editee/override
  theme: string
  question: string
  options: [string, string, string, string]
  correct: number
  explanation: string
  isOverridingDefault: boolean
}

const EMPTY_FORM: FormState = {
  id: null,
  theme: 'classement',
  question: '',
  options: ['', '', '', ''],
  correct: 0,
  explanation: '',
  isOverridingDefault: false,
}

export function EditorQuiz() {
  const customQuestions = useEditorStore((s) => s.quizQuestions)
  const customThemes = useEditorStore((s) => s.customThemes)
  const addQuizQuestion = useEditorStore((s) => s.addQuizQuestion)
  const upsertQuizQuestion = useEditorStore((s) => s.upsertQuizQuestion)
  const deleteQuizQuestion = useEditorStore((s) => s.deleteQuizQuestion)
  const addCustomTheme = useEditorStore((s) => s.addCustomTheme)
  const updateCustomTheme = useEditorStore((s) => s.updateCustomTheme)
  const deleteCustomTheme = useEditorStore((s) => s.deleteCustomTheme)

  // Liste effective des questions (default avec override + nouveaux ajouts)
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

  const overrideCount = effectiveQuestions.filter((e) => e.isOverridden).length
  const customAddedCount = effectiveQuestions.filter((e) => !e.isDefault).length

  // Liste des thèmes utilisables (defaults + customs)
  const allThemes = useMemo(() => [...DEFAULT_THEMES, ...customThemes], [customThemes])

  const [editing, setEditing] = useState<FormState | null>(null)
  const [newThemeLabel, setNewThemeLabel] = useState('')
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null)
  const [editingThemeLabel, setEditingThemeLabel] = useState('')

  const isFormValid = editing
    ? editing.question.trim().length > 0 &&
      editing.options.every((o) => o.trim().length > 0) &&
      editing.explanation.trim().length > 0 &&
      editing.theme.trim().length > 0
    : false

  // ── Actions question ──

  const startNew = () => {
    setEditing({ ...EMPTY_FORM })
  }

  const startEditCustom = (q: QuizQuestion) => {
    setEditing({
      id: q.id,
      theme: q.theme,
      question: q.question,
      options: [q.options[0] ?? '', q.options[1] ?? '', q.options[2] ?? '', q.options[3] ?? ''],
      correct: q.correct,
      explanation: q.explanation,
      isOverridingDefault: false,
    })
  }

  const startOverrideDefault = (q: QuizQuestion) => {
    // Pré-remplit avec la valeur effective (default ou override existant)
    setEditing({
      id: q.id,
      theme: q.theme,
      question: q.question,
      options: [q.options[0] ?? '', q.options[1] ?? '', q.options[2] ?? '', q.options[3] ?? ''],
      correct: q.correct,
      explanation: q.explanation,
      isOverridingDefault: true,
    })
  }

  const cancelEdit = () => setEditing(null)

  const saveForm = () => {
    if (!editing || !isFormValid) return
    const payload: Omit<QuizQuestion, 'id'> = {
      theme: editing.theme,
      question: editing.question.trim(),
      options: editing.options.map((o) => o.trim()),
      correct: editing.correct,
      explanation: editing.explanation.trim(),
    }
    if (editing.id === null) {
      // Nouvelle question
      addQuizQuestion(payload)
    } else {
      // Override (default) ou modification (custom)
      upsertQuizQuestion({ ...payload, id: editing.id })
    }
    setEditing(null)
  }

  const resetOverride = (id: string) => {
    if (confirm('Réinitialiser cette question à sa version par défaut ?')) {
      deleteQuizQuestion(id)
    }
  }

  const deleteCustom = (id: string) => {
    if (confirm('Supprimer cette question ?')) {
      deleteQuizQuestion(id)
    }
  }

  // ── Actions thèmes ──

  const handleAddTheme = () => {
    const label = newThemeLabel.trim()
    if (!label) return
    // Évite doublon avec defaults ou customs (case-insensitive)
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

  // ── Mode édition formulaire ──
  if (editing !== null) {
    const setOption = (idx: number, val: string) => {
      const next: [string, string, string, string] = [...editing.options]
      next[idx] = val
      setEditing({ ...editing, options: next })
    }

    const titre =
      editing.id === null
        ? 'Nouvelle question'
        : editing.isOverridingDefault
        ? 'Modifier (question par défaut)'
        : 'Modifier la question'

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-sncf-dark">{titre}</h2>
          {editing.isOverridingDefault && (
            <p className="text-[11px] text-sncf-orange mt-1">
              ⓘ Cette question fait partie des questions par défaut. La modification créera une
              version override que tu pourras réinitialiser à tout moment.
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
              value={editing.theme}
              onChange={(e) => setEditing({ ...editing, theme: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            >
              <optgroup label="Par défaut">
                {DEFAULT_THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
              {customThemes.length > 0 && (
                <optgroup label="Personnalisés">
                  {customThemes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <p className="text-[11px] text-gray-600 mt-1">
              Pour ajouter un thème, retourne à la liste et utilise la section « Mes thèmes ».
            </p>
          </div>

          {/* Question */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Question <span className="text-sncf-red">*</span>
            </label>
            <textarea
              value={editing.question}
              onChange={(e) => setEditing({ ...editing, question: e.target.value })}
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
            <p className="text-[11px] text-gray-600 mb-2">Coche la bonne réponse à droite</p>
            <div className="space-y-2">
              {editing.options.map((opt, idx) => (
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
                      checked={editing.correct === idx}
                      onChange={() => setEditing({ ...editing, correct: idx })}
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
            <p className="text-[11px] text-gray-600 mb-1">Affichée après validation, pédagogique</p>
            <textarea
              value={editing.explanation}
              onChange={(e) => setEditing({ ...editing, explanation: e.target.value })}
              rows={3}
              placeholder="Ex : S/I = Sécurité / Immédiat. Anomalie nécessitant une intervention immédiate..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={saveForm}
              disabled={!isFormValid}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-transform ${
                isFormValid
                  ? 'bg-sncf-blue text-white active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {editing.id === null ? 'Ajouter' : 'Enregistrer'}
            </button>
            <button
              onClick={cancelEdit}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm active:scale-[0.98] transition-transform"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Mode liste ──
  return (
    <div className="space-y-5">
      {/* Section thèmes */}
      <div>
        <h2 className="text-sm font-bold text-sncf-dark">Mes thèmes</h2>
        <p className="text-xs text-gray-600 mt-1">
          {DEFAULT_THEMES.length} thème{DEFAULT_THEMES.length > 1 ? 's' : ''} par défaut
          {customThemes.length > 0 && ` + ${customThemes.length} ajouté${customThemes.length > 1 ? 's' : ''}`}
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
                  <button
                    onClick={saveEditTheme}
                    aria-label="Enregistrer"
                    className="text-sncf-green text-xs"
                  >
                    ✓
                  </button>
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

        {/* Ajout thème */}
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
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            + Thème
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <h2 className="text-sm font-bold text-sncf-dark">Questions de quiz</h2>
        <p className="text-xs text-gray-600 mt-1">
          {QUIZ_QUESTIONS.length} par défaut
          {overrideCount > 0 && ` · ${overrideCount} modifiée${overrideCount > 1 ? 's' : ''}`}
          {customAddedCount > 0 && ` · ${customAddedCount} ajoutée${customAddedCount > 1 ? 's' : ''}`}
        </p>
      </div>

      <button
        onClick={startNew}
        className="w-full py-3 rounded-2xl bg-sncf-blue text-white font-semibold text-sm active:scale-[0.98] transition-transform"
      >
        + Ajouter une question
      </button>

      {/* Liste unifiée */}
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
                <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
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
                onClick={() => (isDefault ? startOverrideDefault(q) : startEditCustom(q))}
                className="flex-1 min-w-[100px] text-xs text-sncf-blue bg-sncf-blue/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
              >
                Modifier
              </button>
              {isOverridden && (
                <button
                  onClick={() => resetOverride(q.id)}
                  className="flex-1 min-w-[100px] text-xs text-sncf-orange bg-sncf-orange/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
                >
                  Réinitialiser
                </button>
              )}
              {!isDefault && (
                <button
                  onClick={() => deleteCustom(q.id)}
                  className="flex-1 min-w-[100px] text-xs text-sncf-red bg-sncf-red/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Astuce */}
      {allThemes.length > DEFAULT_THEMES.length && (
        <p className="text-[11px] text-gray-600 italic text-center">
          ⓘ Tes thèmes personnalisés et tes modifications sont exportés via le bouton « Exporter le contenu » en bas.
        </p>
      )}
    </div>
  )
}
