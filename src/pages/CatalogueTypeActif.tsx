import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCatalogueStore } from '../stores/catalogueStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import { mainClassement, matchesFamille, type FamilleFiltre } from '../utils/catalogue'
import { CLASSEMENT_COLORS, CLASSEMENT_LABELS, type CategorieId } from '../types'
import { BackButton } from '../components/BackButton'

const FILTRES: { id: FamilleFiltre; label: string; color: string; fg: string }[] = [
  { id: 'tous', label: 'Tous', color: '#6B7280', fg: '#FFFFFF' },
  { id: 'securite', label: 'Sécurité', color: '#E3051B', fg: '#FFFFFF' },
  // Vert sur blanc échoue AA → texte foncé sur fond vert saturé (contraste 7.9:1)
  { id: 'surveillance', label: 'Surveillance', color: '#3AAA35', fg: '#0C1E5B' },
  { id: 'autres', label: 'Autres', color: '#9CA3AF', fg: '#FFFFFF' },
]

export function CatalogueTypeActif() {
  const { catId, typeId } = useParams<{ catId: string; typeId: string }>()
  const navigate = useNavigate()
  const getCategorie = useCatalogueStore(s => s.getCategorie)
  const getTypeActif = useCatalogueStore(s => s.getTypeActif)
  const favs = useFavoritesStore(s => s.favoriteCatalogue)
  const toggleFav = useFavoritesStore(s => s.toggleFavoriteCatalogue)

  const [filtre, setFiltre] = useState<FamilleFiltre>('tous')

  const categorie = catId ? getCategorie(catId as CategorieId) : undefined
  const type = catId && typeId ? getTypeActif(catId as CategorieId, typeId) : undefined

  const filteredAnomalies = useMemo(() => {
    if (!type) return []
    return type.anomalies.filter(a => matchesFamille(a, filtre))
  }, [type, filtre])

  if (!categorie || !type) {
    return (
      <div className="p-4 text-center text-gray-500 space-y-3 spring-enter">
        <p>Type d'actif introuvable</p>
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
      {/* Retour + prototype */}
      <div className="flex items-center justify-between">
        <BackButton to={`/catalogue/${categorie.id}`} />
        <span
          className="text-[10px] text-sncf-blue bg-sncf-blue/10 px-2 py-0.5 rounded-full font-medium spring-enter"
          title="Forme inspirée DZP SE · données synthétiques"
        >
          Prototype
        </span>
      </div>

      {/* Breadcrumb */}
      <div className="text-[11px] text-gray-400 spring-enter" style={{ animationDelay: '30ms' }}>
        <span style={{ color: categorie.couleur }}>{categorie.nom}</span>
        <span className="mx-1">›</span>
        <span>{type.nom}</span>
      </div>

      {/* Titre */}
      <div className="spring-enter" style={{ animationDelay: '60ms' }}>
        <h1 className="text-lg font-bold text-sncf-dark">{type.nom}</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {type.anomalies.length} anomalie{type.anomalies.length > 1 ? 's' : ''} référencée{type.anomalies.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres classement */}
      <div
        className="flex gap-2 overflow-x-auto no-scrollbar spring-scale"
        style={{ animationDelay: '120ms' }}
        role="tablist"
        aria-label="Filtrer par classement"
      >
        {FILTRES.map(f => {
          const active = filtre === f.id
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setFiltre(f.id)}
              className={`shrink-0 text-xs font-medium px-4 py-2 rounded-full transition-all min-h-[44px] ${
                active
                  ? 'shadow'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
              style={active ? { backgroundColor: f.color, color: f.fg } : {}}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Liste anomalies */}
      {filteredAnomalies.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500 spring-scale">
          Aucune anomalie dans ce filtre.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {filteredAnomalies.map((ano, i) => {
            const main = mainClassement(ano)
            const colors = main ? CLASSEMENT_COLORS[main] : null
            const isFav = favs.includes(ano.id)
            return (
              <div
                key={ano.id}
                className="flex items-stretch spring-enter"
                style={{ animationDelay: `${150 + Math.min(i, 6) * 35}ms` }}
              >
                <button
                  onClick={() => navigate(`/catalogue/${categorie.id}/${type.id}/${ano.id}`)}
                  className="flex-1 px-4 py-3 text-left active:bg-gray-50 transition-colors min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-400">{ano.code}</span>
                    {ano.classements.length > 1 && (
                      <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {ano.classements.length} conditions
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-sncf-dark mt-0.5">{ano.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ano.description}</div>
                  {/* Pile mini-badges si plusieurs classements */}
                  {ano.classements.length > 1 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ano.classements.map((entry, idx) => {
                        const c = CLASSEMENT_COLORS[entry.classement]
                        return (
                          <span
                            key={idx}
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: c.bg, color: c.text }}
                            title={CLASSEMENT_LABELS[entry.classement]}
                          >
                            {entry.classement}
                          </span>
                        )
                      })}
                    </div>
                  ) : main && colors && (
                    <span
                      className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-2"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                      title={CLASSEMENT_LABELS[main]}
                    >
                      {main}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => toggleFav(ano.id)}
                  aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  className="px-4 flex items-center justify-center text-xl active:scale-90 transition-transform"
                >
                  <span style={{ color: isFav ? '#F7A600' : '#D1D5DB' }}>{isFav ? '★' : '☆'}</span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
