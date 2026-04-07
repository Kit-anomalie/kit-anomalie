import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { GUIDES } from '../data/guides'
import { APPLIS_METIER } from '../data/roles'

export function Guides() {
  const navigate = useNavigate()
  const { role, specialite, applisMetier } = useProfileStore()

  // Filtrer par profil
  const guidesFiltered = GUIDES.filter(g => {
    if (role && !g.roles.includes(role)) return false
    if (specialite && !g.specialites.includes(specialite)) return false
    if (applisMetier.length > 0 && !applisMetier.includes(g.appliMetier)) return false
    return true
  })

  // Grouper par appli métier
  const guidesByAppli = guidesFiltered.reduce((acc, guide) => {
    const appli = APPLIS_METIER.find(a => a.id === guide.appliMetier)
    const appliNom = appli?.nom ?? guide.appliMetier
    if (!acc[appliNom]) acc[appliNom] = []
    acc[appliNom].push(guide)
    return acc
  }, {} as Record<string, typeof guidesFiltered>)

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-sncf-dark">Guides</h1>
        <p className="text-xs text-gray-500">Pas à pas par application métier</p>
      </div>

      {Object.entries(guidesByAppli).map(([appliNom, guides]) => (
        <div key={appliNom}>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{appliNom}</h2>
          <div className="space-y-2">
            {guides.map(guide => (
              <button
                key={guide.id}
                onClick={() => navigate(`/guides/${guide.id}`)}
                className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 active:scale-[0.98] transition-transform"
              >
                <div className="font-semibold text-sncf-dark text-sm">{guide.titre}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-sncf-green/10 text-sncf-green px-2 py-0.5 rounded-full font-medium">
                    {guide.etapes.length} étapes
                  </span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {guide.gesteMetier}
                  </span>
                  {guide.referentiel && (
                    <span className="text-[10px] bg-sncf-blue/10 text-sncf-blue px-2 py-0.5 rounded-full font-medium">
                      {guide.referentiel}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {guidesFiltered.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Aucun guide disponible pour votre profil
        </div>
      )}
    </div>
  )
}
