interface ToggleProps {
  enabled: boolean
  onChange: (value: boolean) => void
  color?: string
}

export function Toggle({ enabled, onChange, color = 'bg-sncf-green' }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
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
