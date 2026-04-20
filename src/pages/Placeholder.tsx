import { useNavigate } from 'react-router-dom'

interface PlaceholderProps {
  titre: string
  icon: string
  description: string
  brique: string
}

export function Placeholder({ titre, icon, description, brique }: PlaceholderProps) {
  const navigate = useNavigate()

  return (
    <div className="px-4 py-4">
      <button
        onClick={() => navigate('/')}
        className="text-sncf-blue text-sm flex items-center gap-1 spring-enter active:opacity-60 transition-opacity -ml-2 px-2 py-2 min-h-[40px]"
      >
        ← Retour
      </button>

      <div className="py-10 text-center">
        <span
          className="text-5xl block"
          style={{ animation: 'breathe 2.5s ease-in-out infinite, popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' }}
        >
          {icon}
        </span>
        <h1 className="text-xl font-bold text-sncf-dark mt-4 spring-enter" style={{ animationDelay: '200ms' }}>{titre}</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-[280px] mx-auto spring-enter" style={{ animationDelay: '300ms' }}>{description}</p>
        <span
          className="inline-block mt-4 text-xs bg-sncf-blue/10 text-sncf-blue px-3 py-1.5 rounded-full font-medium spring-pop"
          style={{ animationDelay: '450ms' }}
        >
          {brique} — Bientôt disponible
        </span>
      </div>
    </div>
  )
}
