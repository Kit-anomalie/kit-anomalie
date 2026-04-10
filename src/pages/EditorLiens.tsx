import { useState } from 'react'
import { useEditorStore } from '../stores/editorStore'

interface LienForm {
  titre: string
  url: string
  description: string
}

const EMPTY_FORM: LienForm = { titre: '', url: '', description: '' }

export function EditorLiens() {
  const { liens, addLien, updateLien, deleteLien } = useEditorStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<LienForm>(EMPTY_FORM)

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setShowForm(false)
    setEditingId(null)
  }

  const startEdit = (id: string) => {
    const lien = liens.find(l => l.id === id)
    if (!lien) return
    setForm({
      titre: lien.titre,
      url: lien.url,
      description: lien.description ?? '',
    })
    setEditingId(id)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.titre.trim() || !form.url.trim()) return
    const lienData = {
      titre: form.titre.trim(),
      url: form.url.trim(),
      description: form.description.trim() || undefined,
    }

    if (editingId) {
      updateLien(editingId, lienData)
    } else {
      addLien(lienData)
    }
    resetForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-sncf-dark">Liens utiles</h2>
          <p className="text-xs text-gray-500 mt-1">{liens.length} lien{liens.length > 1 ? 's' : ''}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm bg-sncf-blue text-white px-4 py-2 rounded-xl font-medium active:scale-[0.98]"
          >
            + Ajouter
          </button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 border border-sncf-blue/30 space-y-3">
          <h3 className="text-sm font-bold text-sncf-dark">{editingId ? 'Modifier le lien' : 'Nouveau lien'}</h3>

          <input
            value={form.titre}
            onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
            placeholder="Titre du lien"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
          />

          <input
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            placeholder="URL (https://...)"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
          />

          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (facultatif)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
          />

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.titre.trim() || !form.url.trim()}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm ${
                form.titre.trim() && form.url.trim()
                  ? 'bg-sncf-green text-white active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des liens */}
      <div className="space-y-2">
        {liens.length === 0 && !showForm && (
          <p className="text-center text-gray-400 text-sm py-4">Aucun lien pour le moment</p>
        )}
        {liens.map(lien => (
          <div key={lien.id} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sncf-dark text-sm">{lien.titre}</div>
                <a href={lien.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sncf-blue truncate block mt-0.5">
                  {lien.url}
                </a>
                {lien.description && <p className="text-xs text-gray-500 mt-1">{lien.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(lien.id)} className="text-xs text-sncf-blue bg-sncf-blue/10 px-2 py-1 rounded-lg">Modifier</button>
                <button onClick={() => deleteLien(lien.id)} className="text-xs text-sncf-red bg-sncf-red/10 px-2 py-1 rounded-lg">Suppr.</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
