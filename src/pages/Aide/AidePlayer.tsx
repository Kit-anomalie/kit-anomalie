// src/pages/Aide/AidePlayer.tsx
// Player wizard fullscreen pour un arbre de décision.
// L'agent voit une question à la fois, choisit une réponse, navigue jusqu'à une feuille.
// Breadcrumb en bas pour le chemin parcouru. Bouton "← retour" pour revenir d'une étape.

import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useEditorStore } from '../../stores/editorStore'
import type { DecisionNode, DecisionLeafResult, DecisionLeafLink } from '../../types'

/** Récupère un nœud par id, ou null si non trouvé */
function getNode(
  nodes: Record<string, DecisionNode>,
  id: string | null
): DecisionNode | null {
  if (!id) return null
  return nodes[id] ?? null
}

/** Construit l'URL interne de destination du lien d'une feuille */
function linkToPath(link: DecisionLeafLink): string {
  switch (link.kind) {
    case 'fiche':
      return `/fiches/${link.id}`
    case 'guide':
      return `/guides/${link.id}`
    case 'catalogue-categorie':
      return `/catalogue/${link.id}`
    case 'catalogue-anomalie':
      // L'id catalogue-anomalie est attendu sous la forme "catId/typeId/anoId"
      return `/catalogue/${link.id}`
  }
}

interface PathStep {
  nodeId: string
  /** Réponse choisie pour passer au nœud suivant (vide si racine) */
  answerLabel?: string
}

export function AidePlayer() {
  const { treeId } = useParams<{ treeId: string }>()
  const navigate = useNavigate()
  const tree = useEditorStore((s) => s.aides.find((a) => a.id === treeId))

  // Historique des nœuds visités (du root au nœud courant inclus)
  const [path, setPath] = useState<PathStep[]>(() =>
    tree ? [{ nodeId: tree.rootNodeId }] : []
  )

  if (!tree) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl mb-2">🧭</p>
          <p className="text-gray-700 mb-4">Aide introuvable.</p>
          <button
            onClick={() => navigate('/aide')}
            className="px-4 py-2 bg-sncf-blue text-white rounded-full"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const currentStep = path[path.length - 1]
  const currentNode = getNode(tree.nodes, currentStep.nodeId)

  if (!currentNode) {
    return (
      <div className="fixed inset-0 bg-red-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-gray-700">Arbre incohérent : nœud manquant.</p>
        </div>
      </div>
    )
  }

  const handleAnswer = (label: string, nextId: string) => {
    setPath((p) => [
      ...p.slice(0, -1),
      { ...p[p.length - 1], answerLabel: label },
      { nodeId: nextId },
    ])
  }

  const handleBack = () => {
    if (path.length > 1) {
      setPath((p) => p.slice(0, -1).map((s, i, arr) => (i === arr.length - 1 ? { nodeId: s.nodeId } : s)))
    }
  }

  const handleRestart = () => {
    setPath([{ nodeId: tree.rootNodeId }])
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-white to-[#F4F6FA] overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate('/aide')}
          aria-label="Quitter"
          className="text-gray-600 text-xl"
        >
          ✕
        </button>
        <h1 className="text-sm font-semibold text-sncf-dark flex-1 truncate">
          {tree.title}
        </h1>
      </header>

      {/* Contenu de l'étape courante */}
      <main className="px-4 py-8 max-w-md mx-auto">
        {currentNode.type === 'question' && (
          <>
            <h2 className="text-2xl font-bold text-sncf-dark mb-2">
              {currentNode.title}
            </h2>
            {currentNode.help && (
              <p className="text-sm text-gray-600 mb-6">{currentNode.help}</p>
            )}
            <div className="flex flex-col gap-3 mt-6">
              {currentNode.answers.map((ans, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(ans.label, ans.nextId)}
                  className="text-left bg-white border-2 border-gray-200 rounded-2xl p-4 min-h-[60px] active:scale-[0.98] active:border-sncf-blue transition"
                >
                  <span className="font-semibold text-sncf-dark">{ans.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {currentNode.type === 'leaf' && (
          <LeafView
            title={currentNode.title}
            result={currentNode.result}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Breadcrumb + bouton retour */}
      {path.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-sncf-blue font-medium text-sm"
          >
            ← Retour
          </button>
          <div className="flex-1 text-xs text-gray-500 truncate">
            {path
              .slice(0, -1)
              .map((s) => s.answerLabel)
              .filter(Boolean)
              .join(' → ')}
          </div>
        </div>
      )}
    </div>
  )
}

interface LeafViewProps {
  title: string
  result: DecisionLeafResult
  onRestart: () => void
}

function LeafView({ title, result, onRestart }: LeafViewProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-sncf-dark mb-4">{title}</h2>

      {result.badge && (
        <div className="mb-4">
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: result.badge.bg, color: result.badge.text }}
          >
            {result.badge.label}
          </span>
        </div>
      )}

      {result.description && (
        <pre className="whitespace-pre-wrap font-sans text-base text-gray-800 bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          {result.description}
        </pre>
      )}

      {result.checklist && result.checklist.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">À vérifier :</h3>
          <ul className="flex flex-col gap-2">
            {result.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                <span className="text-sncf-blue mt-0.5">☐</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.link && (
        <Link
          to={linkToPath(result.link)}
          className="block bg-sncf-blue text-white rounded-2xl p-4 text-center font-semibold mb-3"
        >
          {result.link.label} →
        </Link>
      )}

      <button
        onClick={onRestart}
        className="w-full text-sncf-blue font-medium text-sm py-3"
      >
        ↺ Recommencer
      </button>
    </div>
  )
}
