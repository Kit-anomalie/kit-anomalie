import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCatalogueStore } from '../stores/catalogueStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useCataloguePrefsStore, SECTION_LABELS, ALL_SECTIONS, type FicheSection } from '../stores/cataloguePrefsStore'
import { mainClassement } from '../utils/catalogue'
import { getCatalogueSvg } from '../data/catalogueSvgs'
import { CLASSEMENT_COLORS, CLASSEMENT_LABELS, type CategorieId, type ClassementEntry } from '../types'

export function CatalogueFiche() {
  const { catId, typeId, anoId } = useParams<{ catId: string; typeId: string; anoId: string }>()
  const navigate = useNavigate()

  const getCategorie = useCatalogueStore(s => s.getCategorie)
  const getTypeActif = useCatalogueStore(s => s.getTypeActif)
  const pushHistorique = useCatalogueStore(s => s.pushHistorique)

  const favs = useFavoritesStore(s => s.favoriteCatalogue)
  const toggleFav = useFavoritesStore(s => s.toggleFavoriteCatalogue)

  const visibleSections = useCataloguePrefsStore(s => s.visibleSections)
  const showSelector = useCataloguePrefsStore(s => s.showSelector)
  const toggleSelector = useCataloguePrefsStore(s => s.toggleSelector)
  const toggleSection = useCataloguePrefsStore(s => s.toggleSection)
  const setPreset = useCataloguePrefsStore(s => s.setPreset)

  const [copied, setCopied] = useState(false)

  const categorie = catId ? getCategorie(catId as CategorieId) : undefined
  const type = catId && typeId ? getTypeActif(catId as CategorieId, typeId) : undefined
  const anomalie = type?.anomalies.find(a => a.id === anoId)

  useEffect(() => {
    if (anomalie) pushHistorique(anomalie.id)
  }, [anomalie, pushHistorique])

  if (!categorie || !type || !anomalie) {
    return (
      <div className="p-4 text-center text-gray-500 space-y-3 spring-enter">
        <p>Anomalie introuvable</p>
        <button
          onClick={() => navigate('/catalogue')}
          className="text-sncf-blue text-sm font-medium active:opacity-60 transition-opacity"
        >
          ← Retour au catalogue
        </button>
      </div>
    )
  }

  const main = mainClassement(anomalie)
  const mainColors = main ? CLASSEMENT_COLORS[main] : null
  const isFav = favs.includes(anomalie.id)
  const SvgComponent = getCatalogueSvg(anomalie.id)

  const autresAnomalies = type.anomalies.filter(a => a.id !== anomalie.id)

  const handleShare = async () => {
    const ref = anomalie.reference ?? 'référence non recensée'
    const text = `${anomalie.code} — ${anomalie.name}${main ? ` (${main})` : ''} · ${ref}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // noop — presse-papier non dispo
    }
  }

  const isVisible = (s: FicheSection) => visibleSections.includes(s)

  return (
    <div className="px-4 py-4 space-y-4 pb-12">
      {/* Retour + prototype */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/catalogue/${categorie.id}/${type.id}`)}
          className="text-sncf-blue text-sm flex items-center gap-1 spring-enter active:opacity-60 transition-opacity -ml-2 px-2 py-2 min-h-[40px]"
        >
          ← Retour
        </button>
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

      {/* En-tête anomalie */}
      <div className="spring-enter" style={{ animationDelay: '60ms' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-mono text-gray-400">{anomalie.code}</div>
            <h1 className="text-lg font-bold text-sncf-dark leading-tight mt-0.5">{anomalie.name}</h1>
            {main && mainColors && (
              <span
                className="inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: mainColors.bg, color: mainColors.text }}
                title={CLASSEMENT_LABELS[main]}
              >
                {main} · {CLASSEMENT_LABELS[main]}
              </span>
            )}
          </div>
          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => toggleFav(anomalie.id)}
              aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl active:scale-90 transition-transform"
            >
              <span style={{ color: isFav ? '#F7A600' : '#D1D5DB' }}>{isFav ? '★' : '☆'}</span>
            </button>
            <button
              onClick={handleShare}
              aria-label="Partager"
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm active:scale-90 transition-transform"
            >
              {copied ? '✓' : '🔗'}
            </button>
          </div>
        </div>
      </div>

      {/* Bandeau affichage dépliable */}
      <div className="bg-white rounded-2xl border border-gray-100 spring-scale" style={{ animationDelay: '100ms' }}>
        <button
          onClick={toggleSelector}
          className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-gray-50 transition-colors"
          aria-expanded={showSelector}
        >
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Affichage</span>
          <span className="text-gray-400 text-sm">{showSelector ? '▴' : '▾'} {visibleSections.length}/7</span>
        </button>
        {showSelector && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setPreset('all')}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-sncf-blue/10 text-sncf-blue border border-sncf-blue/20 active:scale-95 transition-transform"
              >
                Tout afficher
              </button>
              <button
                onClick={() => setPreset('synthese')}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 active:scale-95 transition-transform"
              >
                Vue synthèse
              </button>
              <button
                onClick={() => setPreset('reset')}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-white text-gray-500 border border-gray-200 active:scale-95 transition-transform"
              >
                Réinitialiser
              </button>
            </div>
            <div className="space-y-1">
              {ALL_SECTIONS.map(s => (
                <label
                  key={s}
                  className="flex items-center gap-2 py-1.5 min-h-[40px] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isVisible(s)}
                    onChange={() => toggleSection(s)}
                    className="w-4 h-4 accent-sncf-blue"
                  />
                  <span className="text-sm text-sncf-dark">{SECTION_LABELS[s]}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      {isVisible('illustration') && (
        <Section titre="Illustration référencée" delay={140}>
          {SvgComponent ? (
            <div className="bg-gray-50 rounded-xl p-3">
              <SvgComponent />
              {anomalie.illus?.caption && (
                <p className="text-[11px] text-gray-500 mt-2 text-center italic">{anomalie.illus.caption}</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center text-xs text-gray-400 italic">
              Illustration non disponible — à documenter
            </div>
          )}
        </Section>
      )}

      {isVisible('description') && (
        <Section titre="Description" delay={160}>
          <p className="text-sm text-sncf-dark leading-relaxed">{anomalie.description}</p>
        </Section>
      )}

      {isVisible('defaut') && (
        <Section titre="Défaut (anomalie référencée)" delay={180}>
          <p className="text-sm text-sncf-dark leading-relaxed">{anomalie.defaut}</p>
        </Section>
      )}

      {isVisible('ecart') && (
        <Section titre="Écart / critère mesuré" delay={200}>
          <p className="text-sm text-sncf-dark leading-relaxed">{anomalie.ecart}</p>
        </Section>
      )}

      {(isVisible('classements') || isVisible('actions')) && (
        <Section
          titre={
            isVisible('classements') && isVisible('actions')
              ? 'Classements & actions'
              : isVisible('classements')
              ? 'Classements'
              : 'Actions par classement'
          }
          delay={220}
        >
          <div className="space-y-2">
            {anomalie.classements.map((entry, idx) => (
              <ClassementCard
                key={idx}
                entry={entry}
                showClassement={isVisible('classements')}
                showAction={isVisible('actions')}
              />
            ))}
          </div>
        </Section>
      )}

      {isVisible('reference') && (
        <Section titre="Référence documentaire" delay={240}>
          {anomalie.reference ? (
            <p className="text-sm text-sncf-dark">
              <span className="inline-block text-[11px] bg-sncf-blue/10 text-sncf-blue px-2 py-0.5 rounded-full font-medium">
                {anomalie.reference}
              </span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">Référence non recensée — à documenter</p>
          )}
        </Section>
      )}

      {/* Autres anomalies du même type */}
      {autresAnomalies.length > 0 && (
        <div className="spring-enter pt-2" style={{ animationDelay: '280ms' }}>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 px-1">
            Autres anomalies — {type.nom}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {autresAnomalies.map(ano => {
              const m = mainClassement(ano)
              const c = m ? CLASSEMENT_COLORS[m] : null
              return (
                <button
                  key={ano.id}
                  onClick={() => navigate(`/catalogue/${categorie.id}/${type.id}/${ano.id}`)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left active:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono text-gray-400">{ano.code}</div>
                    <div className="text-sm font-medium text-sncf-dark mt-0.5 line-clamp-1">{ano.name}</div>
                  </div>
                  {m && c && (
                    <span
                      className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {m}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface SectionProps {
  titre: string
  delay: number
  children: React.ReactNode
}

function Section({ titre, delay, children }: SectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 spring-enter" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">{titre}</h3>
      {children}
    </div>
  )
}

interface ClassementCardProps {
  entry: ClassementEntry
  showClassement: boolean
  showAction: boolean
}

function ClassementCard({ entry, showClassement, showAction }: ClassementCardProps) {
  const c = CLASSEMENT_COLORS[entry.classement]
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
        {showClassement && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: c.bg, color: c.text }}
            title={CLASSEMENT_LABELS[entry.classement]}
          >
            {entry.classement}
          </span>
        )}
        <span className="text-xs text-sncf-dark flex-1">
          {entry.condition ?? <span className="italic text-gray-400">Classement par défaut</span>}
        </span>
      </div>
      {showAction && (
        <div className="px-3 py-2 text-xs text-sncf-dark leading-relaxed">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-0.5">Action</span>
          {entry.action}
        </div>
      )}
    </div>
  )
}
