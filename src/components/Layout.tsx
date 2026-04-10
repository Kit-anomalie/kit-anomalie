import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { OfflineBadge } from './OfflineBadge'
import { useProfileStore } from '../stores/profileStore'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'

export function Layout() {
  const navigate = useNavigate()
  const { role, specialite } = useProfileStore()

  return (
    <div className="min-h-full bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-sncf-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg font-bold shrink-0">Kit Anomalie</span>
          {role && specialite && (
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full truncate">
              {ROLE_LABELS[role]} · {SPECIALITE_LABELS[specialite]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/reglages')}
            className="text-white/70 text-lg leading-none"
          >
            ⚙
          </button>
          <OfflineBadge />
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
