import { useLayoutEffect, useRef } from 'react'
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

  // Le scroll (document + <main>) est persistant entre les routes : sans reset,
  // une nouvelle page hérite de la position de scroll de la précédente et apparaît
  // décalée vers le haut. useLayoutEffect (avant paint) → pas de saut d'une frame
  // visible avant le repositionnement, contrairement à useEffect.
  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    // Shell à hauteur fixe (h-dvh) + overflow-hidden : le DOCUMENT ne scrolle jamais,
    // c'est <main> qui scrolle. Indispensable en PWA standalone iOS, sinon le document
    // pouvait glisser sous la status bar (safe-area) à chaque navigation.
    <div className="h-dvh bg-bg flex flex-col overflow-hidden">
      {/* Header — hauteur fixe (shrink-0), reste en haut car le shell ne scrolle pas.
          pt safe-area : réserve la hauteur de la barre d'état iOS en PWA plein écran. */}
      <header className="bg-sncf-dark text-white z-50 shrink-0 pt-[env(safe-area-inset-top)]">
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

      {/* Contenu — min-h-0 pour que flex-1 puisse rétrécir et activer overflow-y-auto
          (sans ça main grandit avec le contenu et c'est le document qui scrolle). */}
      <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Navigation basse — masquée en desktop par md:hidden interne */}
      <BottomNav />
    </div>
  )
}
