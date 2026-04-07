import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { OfflineBadge } from './OfflineBadge'
import { useProfileStore } from '../stores/profileStore'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'

export function Layout() {
  const { role, specialite } = useProfileStore()

  return (
    <div className="min-h-full bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-sncf-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">Kit Anomalie</span>
          {role && specialite && (
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              {ROLE_LABELS[role]} · {SPECIALITE_LABELS[specialite]}
            </span>
          )}
        </div>
        <OfflineBadge />
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
