import { useOffline } from '../hooks/useOffline'

export function OfflineBadge() {
  const isOffline = useOffline()

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
      isOffline
        ? 'bg-red-100 text-sncf-red'
        : 'bg-green-100 text-sncf-green'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isOffline ? 'bg-sncf-red' : 'bg-sncf-green'
      }`} />
      {isOffline ? 'Hors connexion' : 'Connecte'}
    </div>
  )
}
