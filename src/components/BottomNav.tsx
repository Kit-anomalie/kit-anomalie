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
  { id: 'actifs', label: 'Actifs', icon: '🔍', path: '/actifs' },
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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center py-2 px-3 min-w-0 transition-colors ${
              activeTab === item.id
                ? 'text-sncf-blue'
                : 'text-gray-400'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] mt-0.5 font-medium truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
