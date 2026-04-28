// src/pages/EditorGlossaire.tsx
// Éditeur admin du glossaire : CRUD form-based simple.
// Liste alphabétique éditable + bouton « + Nouveau terme ».

import { useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import type { GlossaireTerme } from '../types'

function makeId() {
  return `glossaire-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function newEmptyTerme(): GlossaireTerme {
  return {
    id: makeId(),
    terme: '',
    definition: '',
    description: '',
    synonymes: [],
  }
}

export function EditorGlossaire() {
  const glossaire = useEditorStore((s) => s.glossaire ?? [])
  const upsertTerme = useEditorStore((s) => s.upsertTerme)
  const deleteTerme = useEditorStore((s) => s.deleteTerme)

  const [editingId, setEditingId] = useState<string | null>(null)
  const editingTerme = glossaire.find((t) => t.id === editingId) ?? null

  const handleCreate = () => {
    const t = newEmptyTerme()
    upsertTerme(t)
    setEditingId(t.id)
  }

  if (editingTerme) {
    return (
      <TermeEditor
        terme={editingTerme}
        onSave={(t) => upsertTerme(t)}
        onClose={() => setEditingId(null)}
      />
    )
  }

  // Tri alphabétique pour la liste
  const sorted = [...glossaire].sort((a, b) =>
    a.terme.localeCompare(b.terme, 'fr', { sensitivity: 'base' })
  )

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleCreate}
        className="bg-sncf-blue text-white rounded-xl px-4 py-2 font-medium self-start"
      >
        + Nouveau terme
      </button>

      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          Aucun terme dans le glossaire. Crées-en un pour commencer.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-gray-200 rounded-xl p-3 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sncf-dark truncate">
                  {t.terme || <span className="text-gray-400 italic">(sans terme)</span>}
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  {t.definition || <span className="italic text-gray-400">(sans définition)</span>}
                </p>
              </div>
              <button
                onClick={() => setEditingId(t.id)}
                className="text-sncf-blue text-sm font-medium"
              >
                Éditer
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer "${t.terme}" ?`)) deleteTerme(t.id)
                }}
                className="text-red-600 text-sm"
              >
                Suppr.
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">
        {sorted.length} {sorted.length > 1 ? 'termes' : 'terme'}
      </p>
    </div>
  )
}

interface TermeEditorProps {
  terme: GlossaireTerme
  onSave: (t: GlossaireTerme) => void
  onClose: () => void
}

function TermeEditor({ terme, onSave, onClose }: TermeEditorProps) {
  const [draft, setDraft] = useState<GlossaireTerme>(terme)

  const update = (patch: Partial<GlossaireTerme>) => {
    setDraft((d) => ({ ...d, ...patch }))
  }

  const handleSave = () => {
    onSave({
      ...draft,
      terme: draft.terme.trim(),
      definition: draft.definition.trim(),
      description: draft.description?.trim() || undefined,
      synonymes: (draft.synonymes ?? [])
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    })
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-sncf-blue text-sm font-medium">
          ← Retour
        </button>
        <button
          onClick={handleSave}
          className="bg-sncf-blue text-white rounded-xl px-4 py-2 font-medium"
          disabled={!draft.terme.trim() || !draft.definition.trim()}
        >
          Enregistrer
        </button>
      </div>

      <fieldset className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-3">
        <legend className="px-2 text-xs font-semibold text-gray-700">Terme</legend>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-700">Sigle ou terme *</span>
          <input
            type="text"
            value={draft.terme}
            onChange={(e) => update({ terme: e.target.value })}
            placeholder="Ex : DLF"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-700">Définition courte *</span>
          <input
            type="text"
            value={draft.definition}
            onChange={(e) => update({ definition: e.target.value })}
            placeholder="Ex : Date Limite de Fin"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-700">
            Description (optionnelle, 1-2 phrases)
          </span>
          <textarea
            value={draft.description ?? ''}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Ex : Date avant laquelle l'anomalie doit être résolue. Dépend du classement…"
            rows={3}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-700">
            Synonymes pour la recherche (séparés par virgule)
          </span>
          <input
            type="text"
            value={(draft.synonymes ?? []).join(', ')}
            onChange={(e) =>
              update({
                synonymes: e.target.value.split(',').map((s) => s.trim()),
              })
            }
            placeholder="Ex : date limite, delai prescrit"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>
      </fieldset>
    </div>
  )
}
