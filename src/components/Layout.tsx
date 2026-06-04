import { useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { TopNav } from './TopNav'
import { OfflineBadge } from './OfflineBadge'
import { useProfileStore } from '../stores/profileStore'
import { ROLE_ICONS } from '../data/roles'

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { role } = useProfileStore()
  const mainRef = useRef<HTMLElement>(null)

  // Le conteneur de scroll (<main>) est persistant entre les routes : sans reset,
  // une nouvelle page hérite de la position de scroll de la précédente et apparaît
  // décalée vers le haut. On remet en haut à chaque changement de route.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-full bg-bg flex flex-col">
      {/* Header — sticky, contient TopNav en desktop.
          pt safe-area : en PWA plein écran (status bar translucide), réserve la hauteur
          de la barre d'état iOS pour que le titre ne passe pas dessous. */}
      <header className="bg-sncf-dark text-white sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="px-4 py-3 flex items-center justify-between">
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
        </div>
        {/* Nav horizontale visible uniquement en desktop (md+) */}
        <TopNav />
      </header>

      {/* Contenu — padding bottom pour la nav mobile, neutralisé en desktop */}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Navigation basse — masquée en desktop par md:hidden interne */}
      <BottomNav />
    </div>
  )
}
