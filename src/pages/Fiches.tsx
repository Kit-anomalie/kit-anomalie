import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { FICHES_MEMO } from '../data/fiches'

export function Fiches() {
  const navigate = useNavigate()
  const { role, specialite } = useProfileStore()
  const [search, setSearch] = useState('')

  // Filtrer par profil
  const fichesFiltered = FICHES_MEMO.filter(f => {
    if (role && !f.roles.includes(role)) return false
    if (specialite && !f.specialites.includes(specialite)) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        f.titre.toLowerCase().includes(q) ||
        f.gestesCles.some(g => g.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-sncf-dark">Fiches mémo</h1>
        <p className="text-xs text-gray-500">Réflexes essentiels en un tap</p>
      </div>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher une fiche..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-sncf-blue"
      />

      {/* Liste */}
      <div className="space-y-3">
        {fichesFiltered.map(fiche => (
          <button
            key={fiche.id}
            onClick={() => navigate(`/fiches/${fiche.id}`)}
            className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 active:scale-[0.98] transition-transform"
          >
            <div className="font-semibold text-sncf-dark text-sm">{fiche.titre}</div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{fiche.quoiFaire}</p>
            <div className="flex items-center gap-2 mt-2">
              {fiche.referentiel && (
                <span className="text-[10px] bg-sncf-blue/10 text-sncf-blue px-2 py-0.5 rounded-full font-medium">
                  {fiche.referentiel}
                </span>
              )}
              {fiche.gestesCles.slice(0, 2).map(g => (
                <span key={g} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
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
