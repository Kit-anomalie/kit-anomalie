import { useParams, useNavigate } from 'react-router-dom'
import { useCatalogueStore } from '../stores/catalogueStore'
import type { CategorieId, TypeActif } from '../types'
import { BackButton } from '../components/BackButton'

export function CatalogueCategorie() {
  const { catId } = useParams<{ catId: string }>()
  const navigate = useNavigate()
  const getCategorie = useCatalogueStore(s => s.getCategorie)

  const categorie = catId ? getCategorie(catId as CategorieId) : undefined

  if (!categorie) {
    return (
      <div className="p-4 text-center text-gray-500 space-y-3 spring-enter">
        <p>Catégorie introuvable</p>
        <button
          onClick={() => navigate('/catalogue')}
          className="text-sncf-blue text-sm font-medium active:opacity-60 transition-opacity"
        >
          ← Retour au catalogue
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Retour */}
      <div className="flex items-center justify-between">
        <BackButton to="/catalogue" />
        <span
          className="text-[10px] text-sncf-blue bg-sncf-blue/10 px-2 py-0.5 rounded-full font-medium spring-enter"
          title="Forme inspirée DZP SE · données synthétiques"
        >
          Prototype
        </span>
      </div>

      {/* En-tête catégorie */}
      <div
        className="rounded-2xl p-4 spring-scale"
        style={{ animationDelay: '50ms', backgroundColor: categorie.couleur, color: categorie.couleurFg }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{categorie.icon}</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">{categorie.nom}</h1>
            <p className="text-[11px] mt-0.5">{categorie.description}</p>
          </div>
        </div>
      </div>

      {/* Liste types d'actifs */}
      <div className="space-y-2">
        <h2
          className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1 spring-enter"
          style={{ animationDelay: '150ms' }}
        >
          Types d'actifs · {categorie.types.length}
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {categorie.types.map((type, i) => (
            <TypeActifRow
              key={type.id}
              type={type}
              delay={200 + i * 50}
              onOpen={() => navigate(`/catalogue/${categorie.id}/${type.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface TypeActifRowProps {
  type: TypeActif
  delay: number
  onOpen: () => void
}

function TypeActifRow({ type, delay, onOpen }: TypeActifRowProps) {
  const nbAnos = type.anomalies.length

  return (
    <button
      onClick={onOpen}
      className="w-full px-4 py-3 text-left active:bg-gray-50 transition-colors spring-enter"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-sncf-dark">{type.nom}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {nbAnos} anomalie{nbAnos > 1 ? 's' : ''}
          </div>
        </div>
        <span className="shrink-0 text-gray-300">→</span>
      </div>
    </button>
  )
}
