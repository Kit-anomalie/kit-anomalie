import { useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { QUIZ_QUESTIONS, QUIZ_THEMES_LABELS, type QuizQuestion } from '../data/quizQuestions'

type Theme = QuizQuestion['theme']

const THEMES: Theme[] = ['classement', 'dlf', 'description', 'doublons', 'terminologie']

interface FormState {
  theme: Theme
  question: string
  options: [string, string, string, string]
  correct: number
  explanation: string
}

const EMPTY_FORM: FormState = {
  theme: 'classement',
  question: '',
  options: ['', '', '', ''],
  correct: 0,
  explanation: '',
}

export function EditorQuiz() {
  const customQuestions = useEditorStore((s) => s.quizQuestions)
  const addQuizQuestion = useEditorStore((s) => s.addQuizQuestion)
  const updateQuizQuestion = useEditorStore((s) => s.updateQuizQuestion)
  const deleteQuizQuestion = useEditorStore((s) => s.deleteQuizQuestion)

  // editingId : null = liste, 'new' = ajout, sinon = id de la question editee
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const isFormValid =
    form.question.trim().length > 0 &&
    form.options.every((o) => o.trim().length > 0) &&
    form.explanation.trim().length > 0

  const startNew = () => {
    setForm(EMPTY_FORM)
    setEditingId('new')
  }

  const startEdit = (q: QuizQuestion) => {
    setForm({
      theme: q.theme,
      question: q.question,
      options: [q.options[0] ?? '', q.options[1] ?? '', q.options[2] ?? '', q.options[3] ?? ''],
      correct: q.correct,
      explanation: q.explanation,
    })
    setEditingId(q.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const saveForm = () => {
    if (!isFormValid) return
    const payload: Omit<QuizQuestion, 'id'> = {
      theme: form.theme,
      question: form.question.trim(),
      options: form.options.map((o) => o.trim()),
      correct: form.correct,
      explanation: form.explanation.trim(),
    }
    if (editingId === 'new') {
      addQuizQuestion(payload)
    } else if (editingId) {
      updateQuizQuestion(editingId, payload)
    }
    cancelEdit()
  }

  const setOption = (idx: number, val: string) => {
    const next: [string, string, string, string] = [...form.options]
    next[idx] = val
    setForm({ ...form, options: next })
  }

  // ── Mode édition ──
  if (editingId !== null) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-sncf-dark">
            {editingId === 'new' ? 'Nouvelle question' : 'Modifier la question'}
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            La question apparaitra dans le quiz aux cotes des questions par defaut.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          {/* Theme */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Thème <span className="text-sncf-red">*</span>
            </label>
            <select
              value={form.theme}
              onChange={(e) => setForm({ ...form, theme: e.target.value as Theme })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {QUIZ_THEMES_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Question <span className="text-sncf-red">*</span>
            </label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
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
              {form.options.map((opt, idx) => (
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
                      checked={form.correct === idx}
                      onChange={() => setForm({ ...form, correct: idx })}
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
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
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
              {editingId === 'new' ? 'Ajouter' : 'Enregistrer'}
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
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-sncf-dark">Questions de quiz</h2>
        <p className="text-xs text-gray-600 mt-1">
          {QUIZ_QUESTIONS.length} question{QUIZ_QUESTIONS.length > 1 ? 's' : ''} par défaut
          {customQuestions.length > 0 && ` + ${customQuestions.length} ajoutée${customQuestions.length > 1 ? 's' : ''}`}
        </p>
      </div>

      <button
        onClick={startNew}
        className="w-full py-3 rounded-2xl bg-sncf-blue text-white font-semibold text-sm active:scale-[0.98] transition-transform"
      >
        + Ajouter une question
      </button>

      {/* Questions custom */}
      {customQuestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-sncf-dark uppercase tracking-wide px-1">
            Vos ajouts
          </h3>
          {customQuestions.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-[10px] font-bold text-sncf-dark bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {QUIZ_THEMES_LABELS[q.theme]}
                </span>
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
              <p className="text-[11px] text-gray-600 italic mb-3 leading-relaxed">{q.explanation}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(q)}
                  className="flex-1 text-xs text-sncf-blue bg-sncf-blue/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    if (confirm('Supprimer cette question ?')) deleteQuizQuestion(q.id)
                  }}
                  className="flex-1 text-xs text-sncf-red bg-sncf-red/10 px-3 py-2 rounded-xl font-medium active:scale-[0.97] transition-transform"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Questions par défaut (lecture seule) */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-sncf-dark uppercase tracking-wide px-1">
          Questions par défaut · lecture seule
        </h3>
        {QUIZ_QUESTIONS.map((q) => (
          <div key={q.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-3 opacity-80">
            <div className="flex items-start gap-2 mb-1">
              <span className="text-[10px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                {QUIZ_THEMES_LABELS[q.theme]}
              </span>
              <span className="text-[10px] text-gray-600 mt-0.5">{q.id}</span>
            </div>
            <p className="text-xs font-medium text-sncf-dark">{q.question}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
