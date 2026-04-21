import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  /** Route cible. Si omis → navigate(-1) (back navigation naturelle) */
  to?: string
  /** Label alternatif */
  label?: string
  /** Délai d'animation en ms (pour cascader avec le reste) */
  delay?: number
  className?: string
}

/**
 * Bouton retour standard du kit.
 * Touch target ≥ 44px (Apple guideline), padding généreux pour usage avec gants.
 */
export function BackButton({ to, label = 'Retour', delay = 0, className = '' }: BackButtonProps) {
  const navigate = useNavigate()
  const onClick = () => (to ? navigate(to) : navigate(-1))

  return (
    <button
      onClick={onClick}
      className={`text-sncf-blue text-sm flex items-center gap-1 spring-enter active:opacity-60 transition-opacity -ml-2 px-3 py-2 min-h-[44px] ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      ← {label}
    </button>
  )
}
