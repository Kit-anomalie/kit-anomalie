import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalogueStore } from '../stores/catalogueStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import { searchCatalogue, totalAnomalies, mainClassement, findAnomalie, type AnomalieLocation } from '../utils/catalogue'
import { CLASSEMENT_COLORS, CLASSEMENT_LABELS } from '../types'

export function Catalogue() {
  const navigate = useNavigate()
  const categories = useCatalogueStore(s => s.categories)
  const historique = useCatalogueStore(s => s.historique)
  const clearHistorique = useCatalogueStore(s => s.clearHistorique)
  const favoriteIds = useFavoritesStore(s => s.favoriteCatalogue)
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchCatalogue(categories, query), [categories, query])
  const totalResults = useMemo(() => results.reduce((sum, r) => sum + r.matches.length, 0), [results])

  const favorites = useMemo<AnomalieLocation[]>(
    () => favoriteIds.map(id => findAnomalie(categories, id)).filter((x): x is AnomalieLocation => x !== null),
    [categories, favoriteIds],
  )
  const recents = useMemo<AnomalieLocation[]>(
    () => historique.map(id => findAnomalie(categories, id)).filter((x): x is AnomalieLocation => x !== null),
    [categories, historique],
  )

  const openAnomalie = (loc: AnomalieLocation) =>
    navigate(`/catalogue/${loc.categorie.id}/${loc.typeActifId}/${loc.anomalie.id}`)

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Retour accueil */}
      <button
        onClick={() => navigate('/')}
        className="text-sncf-blue text-sm flex items-center gap-1 spring-enter active:opacity-60 transition-opacity -ml-2 px-2 py-2 min-h-[40px]"
      >
        ← Retour
      </button>

      {/* En-tête brique */}
      <div className="spring-enter" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-lg font-bold text-sncf-dark">Catalogue anomalies</h1>
            <p className="text-xs text-gray-500">Par type d'actif</p>
          </div>
        </div>
      </div>

      {/* Bandeau prototype — forme inspirée DZP SE, données synthétiques */}
      <div
        className="bg-sncf-blue/5 border border-sncf-blue/20 rounded-2xl px-3 py-2 spring-scale"
        style={{ animationDelay: '100ms' }}
      >
        <div className="flex items-start gap-2">
          <span className="text-xs mt-0.5" aria-hidden>ℹ️</span>
          <p className="text-[11px] text-sncf-dark leading-relaxed">
            <span className="font-semibold">Prototype</span> — Présentation inspirée du catalogue DZP SE.
            Les données affichées sont <span className="font-semibold">synthétiques</span>, à vocation de démonstration uniquement.
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="spring-scale" style={{ animationDelay: '150ms' }}>
        <label htmlFor="catalogue-search" className="sr-only">Rechercher une anomalie</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>🔎</span>
          <input
            id="catalogue-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Code, nom, défaut, type d'actif…"
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-sncf-blue"
          />
        </div>
      </div>

      {/* Résultats de recherche ou grille catégories */}
      {query.trim() ? (
        <SearchResults
          results={results}
          totalResults={totalResults}
          onOpen={(catId, typeId, anoId) => navigate(`/catalogue/${catId}/${typeId}/${anoId}`)}
        />
      ) : (
        <>
          {favorites.length > 0 && (
            <HScrollRow titre="Favoris" icon="★" items={favorites} onOpen={openAnomalie} delay={200} />
          )}
          {recents.length > 0 && (
            <HScrollRow
              titre={`Derniers consultés · ${recents.length}`}
              icon="🕑"
              items={recents.slice(0, 10)}
              onOpen={openAnomalie}
              delay={225}
              onClear={clearHistorique}
            />
          )}
          <div>
            <h2
              className="text-sm font-bold text-sncf-dark mb-3 spring-enter"
              style={{ animationDelay: '250ms' }}
            >
              Catégories d'actifs
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat, i) => {
                const nbTypes = cat.types.length
                const nbAnos = totalAnomalies(cat)
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/catalogue/${cat.id}`)}
                    className="text-left p-4 rounded-2xl active:scale-[0.96] transition-transform duration-200 spring-scale min-h-[128px] flex flex-col justify-between"
                    style={{
                      animationDelay: `${320 + i * 70}ms`,
                      backgroundColor: cat.couleur,
                      color: cat.couleurFg,
                    }}
                  >
                    <div>
                      <span className="text-2xl block" aria-hidden>{cat.icon}</span>
                      <div className="font-semibold text-sm mt-2 leading-tight">{cat.nom}</div>
                    </div>
                    <div className="text-[11px] opacity-90 mt-2">
                      {nbTypes} type{nbTypes > 1 ? 's' : ''} · {nbAnos} anomalie{nbAnos > 1 ? 's' : ''}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface HScrollRowProps {
  titre: string
  icon: string
  items: AnomalieLocation[]
  onOpen: (loc: AnomalieLocation) => void
  onClear?: () => void
  delay: number
}

function HScrollRow({ titre, icon, items, onOpen, onClear, delay }: HScrollRowProps) {
  return (
    <div className="spring-scale" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-sm font-bold text-sncf-dark flex items-center gap-1.5">
          <span aria-hidden>{icon}</span>
          {titre}
        </h2>
        {onClear && items.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] text-gray-400 active:opacity-60"
            aria-label="Effacer l'historique"
          >
            Effacer
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {items.map(loc => {
          const main = mainClassement(loc.anomalie)
          const colors = main ? CLASSEMENT_COLORS[main] : null
          return (
            <button
              key={loc.anomalie.id}
              onClick={() => onOpen(loc)}
              className="shrink-0 w-40 bg-white rounded-xl border border-gray-100 p-3 text-left active:scale-[0.97] transition-transform"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: loc.categorie.couleur }}
                  aria-hidden
                />
                <span className="text-[10px] font-mono text-gray-400 truncate">{loc.anomalie.code}</span>
              </div>
              <div className="text-xs font-medium text-sncf-dark mt-1 line-clamp-2 leading-tight">
                {loc.anomalie.name}
              </div>
              {main && colors && (
                <span
                  className="inline-block mt-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                  title={CLASSEMENT_LABELS[main]}
                >
                  {main}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface SearchResultsProps {
  results: ReturnType<typeof searchCatalogue>
  totalResults: number
  onOpen: (catId: string, typeId: string, anoId: string) => void
}

function SearchResults({ results, totalResults, onOpen }: SearchResultsProps) {
  if (totalResults === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500 spring-scale">
        Aucune anomalie trouvée.
      </div>
    )
  }

  return (
    <div className="space-y-4 spring-scale">
      <p className="text-xs text-gray-500">{totalResults} résultat{totalResults > 1 ? 's' : ''}</p>
      {results.map(group => (
        <div key={group.categorie.id}>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: group.categorie.couleur }}
              aria-hidden
            />
            <h3 className="text-xs font-bold text-sncf-dark uppercase tracking-wide">
              {group.categorie.nom}
            </h3>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
            {group.matches.map(m => {
              const main = mainClassement(m.anomalie)
              const colors = main ? CLASSEMENT_COLORS[main] : null
              return (
                <button
                  key={m.anomalie.id}
                  onClick={() => onOpen(group.categorie.id, m.typeActifId, m.anomalie.id)}
                  className="w-full px-4 py-3 text-left flex items-start gap-3 active:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-gray-400">{m.anomalie.code}</span>
                      <span className="text-[11px] text-gray-400">· {m.typeActifNom}</span>
                    </div>
                    <div className="text-sm font-medium text-sncf-dark mt-0.5">{m.anomalie.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{m.anomalie.description}</div>
                  </div>
                  {main && colors && (
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                      title={CLASSEMENT_LABELS[main]}
                    >
                      {main}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
