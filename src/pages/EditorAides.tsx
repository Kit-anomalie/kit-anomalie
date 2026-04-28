// src/pages/EditorAides.tsx
// Éditeur admin des arbres de décision (brique 6).
// Pattern form-based, pas de drag-and-drop. CRUD complet via formulaires simples.

import { useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import type { DecisionTree, DecisionNode, Specialite, Role } from '../types'

const SPECIALITES: Specialite[] = ['voie', 'seg', 'eale', 'cat', 'sm']
const ROLES: Role[] = ['agent_req', 'ordonnanceur', 'rp']

function makeNodeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function makeAideId(): string {
  return `aide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function newEmptyTree(): DecisionTree {
  const rootId = makeNodeId('q')
  return {
    id: makeAideId(),
    title: 'Nouvel arbre',
    description: '',
    rootNodeId: rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        type: 'question',
        title: 'Première question ?',
        answers: [],
      },
    },
  }
}

export function EditorAides() {
  const aides = useEditorStore((s) => s.aides ?? [])
  const upsertAide = useEditorStore((s) => s.upsertAide)
  const deleteAide = useEditorStore((s) => s.deleteAide)

  const [editingId, setEditingId] = useState<string | null>(null)
  const editingTree = aides.find((a) => a.id === editingId) ?? null

  const handleCreate = () => {
    const tree = newEmptyTree()
    upsertAide(tree)
    setEditingId(tree.id)
  }

  const handleDuplicate = (tree: DecisionTree) => {
    const clone: DecisionTree = {
      ...tree,
      id: makeAideId(),
      title: `${tree.title} (copie)`,
    }
    upsertAide(clone)
  }

  if (editingTree) {
    return (
      <TreeEditor
        tree={editingTree}
        onSave={(t) => upsertAide(t)}
        onClose={() => setEditingId(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleCreate}
        className="bg-sncf-blue text-white rounded-xl px-4 py-2 font-medium self-start"
      >
        + Nouvel arbre
      </button>

      {aides.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          Aucun arbre. Crées-en un pour commencer.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {aides.map((tree) => (
            <div
              key={tree.id}
              className="bg-white border border-gray-200 rounded-xl p-3 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sncf-dark truncate">{tree.title}</h3>
                <p className="text-xs text-gray-500">
                  {Object.keys(tree.nodes).length} nœud(s)
                  {tree.specialitesCibles?.length
                    ? ` · spé : ${tree.specialitesCibles.join(', ')}`
                    : ''}
                </p>
              </div>
              <button
                onClick={() => setEditingId(tree.id)}
                className="text-sncf-blue text-sm font-medium"
              >
                Éditer
              </button>
              <button
                onClick={() => handleDuplicate(tree)}
                className="text-gray-600 text-sm"
              >
                Dupliquer
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer "${tree.title}" ?`)) deleteAide(tree.id)
                }}
                className="text-red-600 text-sm"
              >
                Suppr.
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface TreeEditorProps {
  tree: DecisionTree
  onSave: (tree: DecisionTree) => void
  onClose: () => void
}

function TreeEditor({ tree, onSave, onClose }: TreeEditorProps) {
  const [draft, setDraft] = useState<DecisionTree>(tree)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)

  const updateDraft = (patch: Partial<DecisionTree>) => {
    setDraft((d) => ({ ...d, ...patch }))
  }

  const updateNode = (nodeId: string, patch: Partial<DecisionNode>) => {
    setDraft((d) => ({
      ...d,
      nodes: {
        ...d.nodes,
        [nodeId]: { ...d.nodes[nodeId], ...patch } as DecisionNode,
      },
    }))
  }

  const addQuestion = () => {
    const id = makeNodeId('q')
    setDraft((d) => ({
      ...d,
      nodes: {
        ...d.nodes,
        [id]: { id, type: 'question', title: 'Nouvelle question', answers: [] },
      },
    }))
    setEditingNodeId(id)
  }

  const addLeaf = () => {
    const id = makeNodeId('leaf')
    setDraft((d) => ({
      ...d,
      nodes: {
        ...d.nodes,
        [id]: { id, type: 'leaf', title: 'Nouveau résultat', result: { description: '' } },
      },
    }))
    setEditingNodeId(id)
  }

  const deleteNode = (id: string) => {
    if (id === draft.rootNodeId) {
      alert('Impossible de supprimer le nœud racine.')
      return
    }
    if (!confirm('Supprimer ce nœud ?')) return
    setDraft((d) => {
      const rest: Record<string, DecisionNode> = {}
      for (const [nid, node] of Object.entries(d.nodes)) {
        if (nid !== id) rest[nid] = node
      }
      // Nettoyer les références orphelines depuis les questions existantes
      const cleaned: Record<string, DecisionNode> = {}
      for (const [nid, node] of Object.entries(rest)) {
        if (node.type === 'question') {
          cleaned[nid] = {
            ...node,
            answers: node.answers.filter((a) => a.nextId !== id),
          }
        } else {
          cleaned[nid] = node
        }
      }
      return { ...d, nodes: cleaned }
    })
  }

  const handleSave = () => {
    onSave(draft)
    onClose()
  }

  const editingNode = editingNodeId ? draft.nodes[editingNodeId] : null

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
        >
          Enregistrer
        </button>
      </div>

      {/* Métadonnées de l'arbre */}
      <fieldset className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-3">
        <legend className="px-2 text-xs font-semibold text-gray-700">Arbre</legend>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => updateDraft({ title: e.target.value })}
          placeholder="Titre"
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <textarea
          value={draft.description ?? ''}
          onChange={(e) => updateDraft({ description: e.target.value })}
          placeholder="Description (optionnelle)"
          rows={2}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Spécialités ciblées (vide = toutes)
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALITES.map((sp) => {
              const checked = draft.specialitesCibles?.includes(sp) ?? false
              return (
                <label key={sp} className="text-sm flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const current = draft.specialitesCibles ?? []
                      updateDraft({
                        specialitesCibles: e.target.checked
                          ? [...current, sp]
                          : current.filter((s) => s !== sp),
                      })
                    }}
                  />
                  {sp}
                </label>
              )
            })}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Rôles ciblés (vide = tous)
          </label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => {
              const checked = draft.rolesCibles?.includes(r) ?? false
              return (
                <label key={r} className="text-sm flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const current = draft.rolesCibles ?? []
                      updateDraft({
                        rolesCibles: e.target.checked
                          ? [...current, r]
                          : current.filter((x) => x !== r),
                      })
                    }}
                  />
                  {r}
                </label>
              )
            })}
          </div>
        </div>
      </fieldset>

      {/* Liste des nœuds */}
      <fieldset className="bg-white border border-gray-200 rounded-xl p-3">
        <legend className="px-2 text-xs font-semibold text-gray-700">Nœuds</legend>
        <div className="flex gap-2 mb-3">
          <button onClick={addQuestion} className="text-sm bg-gray-100 rounded-lg px-3 py-1">
            + Question
          </button>
          <button onClick={addLeaf} className="text-sm bg-gray-100 rounded-lg px-3 py-1">
            + Feuille
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {Object.values(draft.nodes).map((node) => (
            <div
              key={node.id}
              className="border border-gray-200 rounded-lg p-2 flex items-center gap-2"
            >
              <span className="text-xs">
                {node.type === 'question' ? '❓' : '🎯'}
              </span>
              <span className="flex-1 truncate text-sm">
                {node.title}
                {node.id === draft.rootNodeId && (
                  <span className="ml-2 text-xs bg-sncf-blue text-white rounded px-1.5">racine</span>
                )}
              </span>
              <button
                onClick={() => setEditingNodeId(node.id)}
                className="text-sm text-sncf-blue"
              >
                Éditer
              </button>
              <button
                onClick={() => deleteNode(node.id)}
                className="text-sm text-red-600"
              >
                Suppr.
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Édition d'un nœud (modale simple inline) */}
      {editingNode && (
        <NodeEditor
          node={editingNode}
          allNodes={draft.nodes}
          onChange={(patch) => updateNode(editingNode.id, patch)}
          onClose={() => setEditingNodeId(null)}
        />
      )}
    </div>
  )
}

interface NodeEditorProps {
  node: DecisionNode
  allNodes: Record<string, DecisionNode>
  onChange: (patch: Partial<DecisionNode>) => void
  onClose: () => void
}

function NodeEditor({ node, allNodes, onChange, onClose }: NodeEditorProps) {
  return (
    <fieldset className="bg-blue-50 border-2 border-sncf-blue rounded-xl p-3 flex flex-col gap-3">
      <legend className="px-2 text-xs font-semibold text-sncf-dark">
        Édition : {node.type === 'question' ? 'question' : 'feuille'}
      </legend>

      <input
        type="text"
        value={node.title}
        onChange={(e) => onChange({ title: e.target.value } as Partial<DecisionNode>)}
        placeholder="Titre / question"
        className="border border-gray-300 rounded-lg px-3 py-2"
      />

      {node.type === 'question' && (
        <>
          <input
            type="text"
            value={node.help ?? ''}
            onChange={(e) => onChange({ help: e.target.value } as Partial<DecisionNode>)}
            placeholder="Aide contextuelle (optionnelle)"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Réponses</label>
            <div className="flex flex-col gap-2">
              {node.answers.map((ans, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={ans.label}
                    onChange={(e) => {
                      const newAnswers = [...node.answers]
                      newAnswers[i] = { ...newAnswers[i], label: e.target.value }
                      onChange({ answers: newAnswers } as Partial<DecisionNode>)
                    }}
                    placeholder="Libellé"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <select
                    value={ans.nextId}
                    onChange={(e) => {
                      const newAnswers = [...node.answers]
                      newAnswers[i] = { ...newAnswers[i], nextId: e.target.value }
                      onChange({ answers: newAnswers } as Partial<DecisionNode>)
                    }}
                    className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
                  >
                    <option value="">→ ?</option>
                    {Object.values(allNodes)
                      .filter((n) => n.id !== node.id)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.type === 'question' ? '❓' : '🎯'} {n.title}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      onChange({
                        answers: node.answers.filter((_, j) => j !== i),
                      } as Partial<DecisionNode>)
                    }}
                    className="text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  onChange({
                    answers: [...node.answers, { label: '', nextId: '' }],
                  } as Partial<DecisionNode>)
                }
                className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1 self-start"
              >
                + Ajouter une réponse
              </button>
            </div>
          </div>
        </>
      )}

      {node.type === 'leaf' && (
        <>
          <textarea
            value={node.result.description ?? ''}
            onChange={(e) =>
              onChange({
                result: { ...node.result, description: e.target.value },
              } as Partial<DecisionNode>)
            }
            placeholder="Description / template"
            rows={4}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <textarea
            value={(node.result.checklist ?? []).join('\n')}
            onChange={(e) =>
              onChange({
                result: {
                  ...node.result,
                  checklist: e.target.value.split('\n').filter((l) => l.trim()),
                },
              } as Partial<DecisionNode>)
            }
            placeholder="Checklist (une ligne par item)"
            rows={3}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <div className="text-xs text-gray-500">
            Lien vers fiche/guide/catalogue : édition avancée à faire en JSON pour l'instant.
            En V1 vous pouvez exporter, modifier le JSON, ré-importer.
          </div>
        </>
      )}

      <button
        onClick={onClose}
        className="bg-sncf-blue text-white rounded-lg px-4 py-2 font-medium self-end"
      >
        Fermer
      </button>
    </fieldset>
  )
}
