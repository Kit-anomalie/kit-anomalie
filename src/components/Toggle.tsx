interface ToggleProps {
  enabled: boolean
  onChange: (value: boolean) => void
  color?: string
  /** Libellé accessible (lecteur d'écran) — requis pour l'a11y */
  'aria-label'?: string
}

export function Toggle({ enabled, onChange, color = 'bg-sncf-green', 'aria-label': ariaLabel }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
        enabled ? color : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[27px] w-[27px] rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
          enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
        } mt-[2px]`}
      />
    </button>
  )
}
