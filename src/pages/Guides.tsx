import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { useEditorStore } from '../stores/editorStore'
import { useSharedContentStore } from '../stores/sharedContentStore'
import { GUIDES } from '../data/guides'
import { APPLIS_METIER } from '../data/roles'
import { BackButton } from '../components/BackButton'

export function Guides() {
  const navigate = useNavigate()
  const { role, specialite } = useProfileStore()
  const customGuides = useEditorStore(s => s.guides)
  const sharedGuides = useSharedContentStore(s => s.guides)
  const [appliFilter, setAppliFilter] = useState<string | null>(null)

  // Fusionner guides codés en dur + partagés + locaux (dédoublonner par titre)
  // Priorité : customGuides (edits locaux) > sharedGuides (content.json) > GUIDES (défauts)
  const merged = [...customGuides, ...sharedGuides, ...GUIDES]
  const allGuides = merged.filter((g, i) => merged.findIndex(x => x.titre === g.titre) === i)

  // Filtrer par rôle + spécialité (plus de filtre par applis sélectionnées)
  const guidesForProfile = allGuides.filter(g => {
    if (role && !g.roles.includes(role)) return false
    if (specialite && !g.specialites.includes(specialite)) return false
    return true
  })

  // Applis disponibles dans les guides filtrés
  const applisDisponibles = [...new Set(guidesForProfile.map(g => g.appliMetier))]
    .map(id => APPLIS_METIER.find(a => a.id === id) ?? { id, nom: id })

  // Filtrer par appli sélectionnée
  const guidesFiltered = appliFilter
    ? guidesForProfile.filter(g => g.appliMetier === appliFilter)
    : guidesForProfile

  return (
    <div className="px-4 py-4 space-y-4">
      <BackButton to="/" />

      <div className="spring-enter" style={{ animationDelay: '50ms' }}>
        <h1 className="text-lg font-bold text-sncf-dark">Guides</h1>
        <p className="text-xs text-gray-500">Pas à pas par application métier</p>
      </div>

      {/* Filtre horizontal par appli */}
      {applisDisponibles.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 spring-enter" style={{ animationDelay: '100ms' }}>
          <button
            onClick={() => setAppliFilter(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              appliFilter === null
                ? 'bg-sncf-blue text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Toutes
          </button>
          {applisDisponibles.map(appli => (
            <button
              key={appli.id}
              onClick={() => setAppliFilter(appli.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                appliFilter === appli.id
                  ? 'bg-sncf-blue text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {appli.nom}
            </button>
          ))}
        </div>
      )}

      {/* Liste des guides */}
      <div className="space-y-2">
        {guidesFiltered.map((guide, i) => {
          const appli = APPLIS_METIER.find(a => a.id === guide.appliMetier)
          return (
            <button
              key={guide.id}
              onClick={() => navigate(`/guides/${guide.id}`)}
              className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 active:scale-[0.97] transition-transform duration-200 spring-scale"
              style={{ animationDelay: `${180 + Math.min(i, 6) * 50}ms` }}
            >
              <div className="font-semibold text-sncf-dark text-sm">{guide.titre}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {!appliFilter && appli && (
                  <span className="text-[11px] bg-sncf-dark/10 text-sncf-dark px-2 py-0.5 rounded-full font-medium">
                    {appli.nom}
                  </span>
                )}
                <span className="text-[11px] bg-sncf-green/10 text-sncf-green px-2 py-0.5 rounded-full font-medium">
                  {guide.etapes.length} étape{guide.etapes.length > 1 ? 's' : ''}
                </span>
                <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {guide.gesteMetier}
                </span>
                {guide.referentiel && (
                  <span className="text-[11px] bg-sncf-blue/10 text-sncf-blue px-2 py-0.5 rounded-full font-medium">
                    {guide.referentiel}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {guidesFiltered.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm spring-enter">
          Aucun guide disponible pour votre profil
        </div>
      )}
    </div>
  )
}
