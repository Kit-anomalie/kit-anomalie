import { useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS, getActiveTab } from '../data/navItems'

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = getActiveTab(location.pathname)

  return (
    <nav
      aria-label="Navigation principale"
      className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-white border-t border-gray-200 px-2 pb-[env(safe-area-inset-bottom)]"
    >
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
              <span className="text-xl leading-none" aria-hidden="true">{item.icon}</span>
              <span className="text-[11px] mt-0.5 font-medium truncate">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
