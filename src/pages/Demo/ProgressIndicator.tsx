// src/pages/Demo/ProgressIndicator.tsx
// 4 dots verticaux côté droit en mode explorer. Indique l'acte courant.
// Tap sur un dot = scroll vers la section correspondante.

interface Props {
  currentIndex: number
  onJump: (index: number) => void
  /** Couleur active : adapte selon le fond (sombre/clair) de l'acte courant */
  activeColor?: string
}

const LABELS = ['Le terrain', 'Le kit', 'Couverture', 'Conclusion']

export function ProgressIndicator({ currentIndex, onJump, activeColor = '#0C1E5B' }: Props) {
  return (
    <nav
      aria-label="Progression de la démo"
      className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3"
    >
      {LABELS.map((label, i) => {
        const isActive = i === currentIndex
        return (
          <button
            key={i}
            onClick={() => onJump(i)}
            aria-label={`Aller à ${label}`}
            aria-current={isActive ? 'step' : undefined}
            className="group flex items-center gap-2 transition"
          >
            <span
              className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white/90 text-[#0C1E5B] px-2 py-0.5 rounded-full shadow-sm"
            >
              {label}
            </span>
            <span
              className="block w-2.5 h-2.5 rounded-full border-2 transition-all"
              style={{
                backgroundColor: isActive ? activeColor : 'transparent',
                borderColor: activeColor,
                transform: isActive ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          </button>
        )
      })}
    </nav>
  )
}
