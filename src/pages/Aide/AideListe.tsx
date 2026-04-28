// src/pages/Aide/AideListe.tsx
// Liste des arbres de décision disponibles, filtrés selon le profil de l'agent.
// Tap sur une carte → navigation vers le player /aide/:treeId.

import { Link } from 'react-router-dom'
import { useEditorStore } from '../../stores/editorStore'
import { useProfileStore } from '../../stores/profileStore'
import type { DecisionTree, Specialite, Role } from '../../types'

function isVisibleForProfile(
  tree: DecisionTree,
  specialite: Specialite | null,
  role: Role | null
): boolean {
  // Pas de filtre sur l'arbre → visible par tous
  const hasSpecFilter = (tree.specialitesCibles?.length ?? 0) > 0
  const hasRoleFilter = (tree.rolesCibles?.length ?? 0) > 0
  if (!hasSpecFilter && !hasRoleFilter) return true

  // Filtre actif : l'agent doit matcher au moins une spé (si filtre spé) ET un rôle (si filtre rôle)
  if (hasSpecFilter && (!specialite || !tree.specialitesCibles!.includes(specialite))) return false
  if (hasRoleFilter && (!role || !tree.rolesCibles!.includes(role))) return false
  return true
}

export function AideListe() {
  const aides = useEditorStore((s) => s.aides ?? [])
  // s.specialite et s.role sont directement sur le store (pas imbriqués dans s.profile)
  const { specialite, role } = useProfileStore((s) => ({ specialite: s.specialite, role: s.role }))

  const visibles = aides.filter((a) => isVisibleForProfile(a, specialite, role))

  return (
    <div className="px-4 pt-4 pb-24 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-sncf-dark mb-1">🧭 Aide au choix</h1>
        <p className="text-sm text-gray-600">
          Réponds à quelques questions, le kit te guide vers la bonne action.
        </p>
      </header>

      {visibles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">🧭</p>
          <p>Aucune aide disponible pour ton profil.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibles.map((tree) => (
            <Link
              key={tree.id}
              to={`/aide/${tree.id}`}
              className="block bg-white rounded-2xl border border-gray-200 p-4 active:scale-[0.98] transition"
            >
              <h2 className="font-semibold text-sncf-dark mb-1">{tree.title}</h2>
              {tree.description && (
                <p className="text-sm text-gray-600">{tree.description}</p>
              )}
              <p className="text-xs text-sncf-blue mt-2 font-medium">Démarrer →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
