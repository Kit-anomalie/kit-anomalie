import type { TabId } from '../types'

export interface NavItem {
  id: TabId
  label: string
  icon: string
  path: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'accueil', label: 'Accueil', icon: '🏠', path: '/' },
  { id: 'guides', label: 'Guides', icon: '📖', path: '/guides' },
  { id: 'fiches', label: 'Fiches', icon: '📋', path: '/fiches' },
  { id: 'catalogue', label: 'Catalogue', icon: '📚', path: '/catalogue' },
  { id: 'assistant', label: 'IA', icon: '🤖', path: '/assistant' },
]

export function getActiveTab(pathname: string): TabId {
  const match = NAV_ITEMS.find(item =>
    pathname === item.path ||
    (item.path !== '/' && pathname.startsWith(item.path))
  )
  return match?.id ?? 'accueil'
}
