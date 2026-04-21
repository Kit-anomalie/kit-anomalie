import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { useEditorStore } from '../stores/editorStore'
import { useSharedContentStore } from '../stores/sharedContentStore'
import { FICHES_MEMO } from '../data/fiches'

export function Fiches() {
  const navigate = useNavigate()
  const { role, specialite } = useProfileStore()
  const customFiches = useEditorStore(s => s.fiches)
  const sharedFiches = useSharedContentStore(s => s.fiches)
  const [search, setSearch] = useState('')

  // Fusionner fiches codées en dur + partagées + locales (dédoublonner par titre)
  // Priorité : customFiches (edits locaux) > sharedFiches (content.json) > FICHES_MEMO (défauts)
  const merged = [...customFiches, ...sharedFiches, ...FICHES_MEMO]
  const allFiches = merged.filter((f, i) => merged.findIndex(x => x.titre === f.titre) === i)

  // Filtrer par profil
  const fichesFiltered = allFiches.filter(f => {
    if (role && !f.roles.includes(role)) return false
    if (specialite && !f.specialites.includes(specialite)) return false
    if (search) {
      const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const q = normalize(search)
      return (
        normalize(f.titre).includes(q) ||
        f.gestesCles.some(g => normalize(g).includes(q))
      )
    }
    return true
  })

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => navigate('/')}
        className="text-sncf-blue text-sm flex items-center gap-1 spring-enter active:opacity-60 transition-opacity -ml-2 px-2 py-2 min-h-[40px]"
      >
        ← Retour
      </button>

      <div className="spring-enter" style={{ animationDelay: '50ms' }}>
        <h1 className="text-lg font-bold text-sncf-dark">Fiches mémo</h1>
        <p className="text-xs text-gray-500">Réflexes essentiels en un tap</p>
      </div>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher une fiche..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-sncf-blue transition-colors duration-200 spring-scale"
        style={{ animationDelay: '100ms' }}
      />

      {/* Liste */}
      <div className="space-y-3">
        {fichesFiltered.map((fiche, i) => (
          <button
            key={fiche.id}
            onClick={() => navigate(`/fiches/${fiche.id}`)}
            className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 active:scale-[0.97] transition-transform duration-200 spring-scale"
            style={{ animationDelay: `${180 + i * 70}ms` }}
          >
            <div className="font-semibold text-sncf-dark text-sm">{fiche.titre}</div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{fiche.quoiFaire}</p>
            <div className="flex items-center gap-2 mt-2">
              {fiche.referentiel && (
                <span className="text-[11px] bg-sncf-blue/10 text-sncf-blue px-2 py-0.5 rounded-full font-medium">
                  {fiche.referentiel}
                </span>
              )}
              {fiche.gestesCles.slice(0, 2).map(g => (
                <span key={g} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {g}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
