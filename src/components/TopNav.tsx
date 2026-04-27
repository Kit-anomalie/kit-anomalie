import { useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS, getActiveTab } from '../data/navItems'

// Navigation horizontale pour desktop (md+).
// Rendue dans le header par Layout, masquée en mobile (la BottomNav prend le relais).
export function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = getActiveTab(location.pathname)

  return (
    <nav
      aria-label="Navigation principale"
      className="hidden md:flex border-t border-white/10 px-2"
    >
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-white text-white'
                  : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base leading-none" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
