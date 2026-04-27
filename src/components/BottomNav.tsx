import { useLocation, useNavigate } from 'react-router-dom'
import type { TabId } from '../types'

interface NavItem {
  id: TabId
  label: string
  icon: string
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'accueil', label: 'Accueil', icon: '🏠', path: '/' },
  { id: 'guides', label: 'Guides', icon: '📖', path: '/guides' },
  { id: 'fiches', label: 'Fiches', icon: '📋', path: '/fiches' },
  { id: 'catalogue', label: 'Catalogue', icon: '📚', path: '/catalogue' },
  { id: 'assistant', label: 'IA', icon: '🤖', path: '/assistant' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeTab = NAV_ITEMS.find(item =>
    location.pathname === item.path ||
    (item.path !== '/' && location.pathname.startsWith(item.path))
  )?.id ?? 'accueil'

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-[768px] lg:max-w-[1024px] bg-white border-t border-gray-200 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around">
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-3 px-3 min-w-0 min-h-[48px] transition-colors ${
                isActive
                  ? 'text-sncf-dark font-bold'
                  : 'text-gray-600'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[11px] mt-0.5 font-medium truncate">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
