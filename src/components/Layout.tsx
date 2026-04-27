import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { OfflineBadge } from './OfflineBadge'
import { useProfileStore } from '../stores/profileStore'
import { ROLE_ICONS } from '../data/roles'

export function Layout() {
  const navigate = useNavigate()
  const { role } = useProfileStore()

  return (
    <div className="min-h-full bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-sncf-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <span className="text-lg font-bold">Kit Anomalie</span>
        <div className="flex items-center gap-3">
          <OfflineBadge />
          {role && (
            <button
              onClick={() => navigate('/reglages')}
              aria-label="Réglages et profil"
              className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-lg active:scale-95 transition-transform"
            >
              {ROLE_ICONS[role]}
            </button>
          )}
        </div>
      </header>

      {/* Contenu principal — padding bottom pour la nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Navigation basse */}
      <BottomNav />
    </div>
  )
}
