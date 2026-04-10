import { useState } from 'react'
import { useEditorStore } from '../stores/editorStore'

export function EditorTips() {
  const { tips, addTip, updateTip, deleteTip } = useEditorStore()
  const [newTip, setNewTip] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const handleAdd = () => {
    const texte = newTip.trim()
    if (!texte) return
    addTip(texte)
    setNewTip('')
  }

  const startEdit = (id: string, texte: string) => {
    setEditingId(id)
    setEditText(texte)
  }

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      updateTip(editingId, editText.trim())
    }
    setEditingId(null)
    setEditText('')
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-sncf-dark">Tips du jour</h2>
        <p className="text-xs text-gray-500 mt-1">Un tip s'affiche chaque jour aux utilisateurs. Plus vous en ajoutez, plus la rotation est variee.</p>
      </div>

      {/* Formulaire d'ajout */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
        <textarea
          value={newTip}
          onChange={e => setNewTip(e.target.value)}
          placeholder="Ecrivez un nouveau tip..."
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
        />
        <button
          onClick={handleAdd}
          disabled={!newTip.trim()}
          className={`w-full py-2.5 rounded-xl font-medium text-sm transition-transform ${
            newTip.trim()
              ? 'bg-sncf-blue text-white active:scale-[0.98]'
              : 'bg-gray-100 text-gray-300'
          }`}
        >
          Ajouter ce tip
        </button>
      </div>

      {/* Liste des tips */}
      <div className="space-y-2">
        {tips.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">Aucun tip pour le moment</p>
        )}
        {tips.map(tip => (
          <div key={tip.id} className="bg-white rounded-2xl p-4 border border-gray-100">
            {editingId === tip.id ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-sncf-blue text-sm focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 py-2 rounded-xl bg-sncf-green text-white text-sm font-medium">Enregistrer</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="text-sm mt-0.5">💡</span>
                <p className="flex-1 text-sm text-sncf-dark leading-relaxed">{tip.texte}</p>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(tip.id, tip.texte)}
                    className="text-xs text-sncf-blue bg-sncf-blue/10 px-2 py-1 rounded-lg"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => { if (confirm('Supprimer ce tip ?')) deleteTip(tip.id) }}
                    className="text-xs text-sncf-red bg-sncf-red/10 px-2 py-1 rounded-lg"
                  >
                    Suppr.
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
