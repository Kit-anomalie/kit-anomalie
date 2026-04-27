import { useMemo, useState, useDeferredValue } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { BackButton } from '../components/BackButton'
import { useCatalogueStore } from '../stores/catalogueStore'
import { useEditorStore } from '../stores/editorStore'
import { useSharedContentStore } from '../stores/sharedContentStore'
import { useAssistantStore } from '../stores/assistantStore'
import { FICHES_MEMO } from '../data/fiches'
import { GUIDES } from '../data/guides'
import { buildAssistantCorpus, ASSISTANT_SUGGESTIONS, type CorpusItem } from '../utils/assistantCorpus'

const SOURCE_ICONS: Record<CorpusItem['source'], string> = {
  catalogue: '📚',
  fiche: '📋',
  guide: '📖',
  tip: '💡',
}

const SOURCE_BG: Record<CorpusItem['source'], string> = {
  catalogue: 'bg-purple-50 border-purple-200',
  fiche: 'bg-amber-50 border-sncf-orange/20',
  guide: 'bg-blue-50 border-sncf-blue/20',
  tip: 'bg-cyan-50 border-sncf-blue/20',
}

// Mots vides FR retirés avant la recherche pour booster la pertinence
const STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du',
  'que', 'qui', 'quoi', 'comment', 'pourquoi', 'quand',
  'est', 'ce', 'cest', 'ca', 'ça', 'a', 'à',
  'signifie', 'veut', 'dire', 'definition',
])

const DEFAULT_TIPS = [
  'Une bonne description d\'anomalie contient : le composant, la localisation exacte et l\'ancienneté du défaut.',
  'Vérifiez toujours les anomalies existantes sur un actif avant d\'en déclarer une nouvelle.',
  'Le classement S/I nécessite une intervention immédiate. En cas de doute, consultez le référentiel MT00342.',
  'Pensez à renseigner la DLF (Date Limite de Fin) pour les anomalies de classement A.',
]

export function Assistant() {
  const navigate = useNavigate()
  const categories = useCatalogueStore((s) => s.categories)
  const customFiches = useEditorStore((s) => s.fiches)
  const customGuides = useEditorStore((s) => s.guides)
  const customTips = useEditorStore((s) => s.tips)
  const sharedFiches = useSharedContentStore((s) => s.fiches)
  const sharedGuides = useSharedContentStore((s) => s.guides)
  const sharedTips = useSharedContentStore((s) => s.tips)
  const history = useAssistantStore((s) => s.history)
  const addQuery = useAssistantStore((s) => s.addQuery)
  const clearHistory = useAssistantStore((s) => s.clearHistory)

  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  // Fusion des sources, dédup par titre comme dans Guides/Fiches
  const corpus = useMemo(() => {
    const mergedFiches = [...customFiches, ...sharedFiches, ...FICHES_MEMO].filter(
      (f, i, arr) => arr.findIndex((x) => x.titre === f.titre) === i
    )
    const mergedGuides = [...customGuides, ...sharedGuides, ...GUIDES].filter(
      (g, i, arr) => arr.findIndex((x) => x.titre === g.titre) === i
    )
    const allTips = [
      ...DEFAULT_TIPS.map((t, i) => ({ id: `default-${i}`, texte: t })),
      ...sharedTips,
      ...customTips,
    ].filter((t, i, arr) => arr.findIndex((x) => x.texte === t.texte) === i)

    return buildAssistantCorpus({
      categories,
      fiches: mergedFiches,
      guides: mergedGuides,
      tips: allTips,
    })
  }, [categories, customFiches, customGuides, customTips, sharedFiches, sharedGuides, sharedTips])

  const fuse = useMemo(
    () =>
      new Fuse(corpus, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'searchableText', weight: 1 },
          { name: 'badges', weight: 0.5 },
        ],
        threshold: 0.45,
        minMatchCharLength: 2,
        ignoreLocation: true,
        ignoreFieldNorm: true,
        useExtendedSearch: true,
        includeScore: true,
      }),
    [corpus]
  )

  const results = useMemo(() => {
    const raw = deferredQuery.trim()
    if (raw.length < 2) return []

    // Nettoyage : retire ponctuation type "?" + minuscule + supprime stopwords FR.
    // On conserve "/" (ex S/I) et "-" (ex VC-RAIL-01) en remplaçant par espace.
    const cleaned = raw
      .toLowerCase()
      .replace(/[?!.,;:'"]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
      .join(' ')

    const queryToSearch = cleaned.length > 0 ? cleaned : raw
    return fuse.search(queryToSearch).slice(0, 8).map((r) => r.item)
  }, [fuse, deferredQuery])

  const handleSelect = (item: CorpusItem) => {
    addQuery(query)
    navigate(item.link)
  }

  const handleSuggestion = (s: string) => {
    setQuery(s)
  }

  const isSearching = deferredQuery.trim().length >= 2
  const noResults = isSearching && results.length === 0

  return (
    <div className="px-4 py-4 space-y-4">
      <BackButton to="/" />

      <div className="spring-enter" style={{ animationDelay: '50ms' }}>
        <span className="text-3xl block mb-2" aria-hidden="true">🤖</span>
        <h1 className="text-lg font-bold text-sncf-dark">Assistant</h1>
        <p className="text-xs text-gray-600">
          Posez une question — réponses tirées du catalogue, fiches et guides
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="relative spring-scale" style={{ animationDelay: '100ms' }}>
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none"
          aria-hidden="true"
        >
          🔎
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Comment classer une anomalie ?"
          aria-label="Posez votre question"
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-sm text-sncf-dark focus:outline-none focus:border-sncf-blue"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Effacer la recherche"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center active:scale-90 transition-transform"
          >
            ✕
          </button>
        )}
      </div>

      {/* État vide : suggestions + historique */}
      {!isSearching && (
        <div className="space-y-4 spring-enter" style={{ animationDelay: '150ms' }}>
          <div>
            <h2 className="text-[11px] font-bold text-sncf-dark uppercase tracking-wide mb-2">
              Questions fréquentes
            </h2>
            <div className="flex flex-wrap gap-2">
              {ASSISTANT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs text-sncf-dark bg-white border border-gray-200 rounded-full px-3 py-2 active:scale-[0.97] transition-transform"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[11px] font-bold text-sncf-dark uppercase tracking-wide">
                  Récentes
                </h2>
                <button
                  onClick={clearHistory}
                  className="text-[11px] text-gray-600 active:opacity-60 transition-opacity"
                >
                  Effacer
                </button>
              </div>
              <div className="space-y-1">
                {history.map((h) => (
                  <button
                    key={`${h.date}-${h.query}`}
                    onClick={() => handleSuggestion(h.query)}
                    className="w-full text-left flex items-center gap-2 text-xs text-sncf-dark bg-white rounded-xl px-3 py-2.5 active:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-600" aria-hidden="true">↑</span>
                    <span className="flex-1 truncate">{h.query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-center py-4">
            <p className="text-[11px] text-gray-600 italic">
              {corpus.length} entrées indexées · 100% local, aucun appel réseau
            </p>
          </div>
        </div>
      )}

      {/* Résultats */}
      {isSearching && results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] text-gray-600">
              {results.length} résultat{results.length > 1 ? 's' : ''} pour « {deferredQuery} »
            </p>
          </div>
          {results.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`w-full text-left rounded-2xl border p-3 active:scale-[0.99] transition-transform spring-scale ${SOURCE_BG[item.source]}`}
              style={{ animationDelay: `${Math.min(i, 5) * 30}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0" aria-hidden="true">
                  {SOURCE_ICONS[item.source]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-sncf-dark uppercase tracking-wide">
                    {item.sourceLabel}
                  </div>
                  <div className="text-sm font-semibold text-sncf-dark mt-0.5">
                    {item.title}
                  </div>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed line-clamp-2">
                    {item.excerpt}
                  </p>
                  {item.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.badges.slice(0, 4).map((b) => (
                        <span
                          key={b}
                          className="text-[10px] bg-white/70 text-sncf-dark px-2 py-0.5 rounded-full font-medium border border-gray-200"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-sncf-blue text-sm shrink-0" aria-hidden="true">→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Aucun résultat */}
      {noResults && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center spring-scale">
          <span className="text-3xl block mb-2" aria-hidden="true">🤔</span>
          <p className="text-sm font-semibold text-sncf-dark">Aucun résultat</p>
          <p className="text-xs text-gray-700 mt-1 leading-relaxed">
            Essayez avec d'autres mots-clés, ou consultez directement le catalogue.
          </p>
          <button
            onClick={() => navigate('/catalogue')}
            className="mt-3 text-xs text-sncf-blue font-semibold active:opacity-60"
          >
            Ouvrir le catalogue →
          </button>
        </div>
      )}
    </div>
  )
}
