// Bottom sheet de confirmation/alerte — remplace les confirm()/alert() natifs.
// Pourquoi : les dialogues natifs cassent le dark mode, ne respectent pas la charte,
// et sont parfois bloqués dans les WebView Android sécurisées des terminaux terrain.
//
// Usage :
//   const { confirm, alert } = useConfirm()
//   if (await confirm({ message: 'Supprimer ?', danger: true })) deleteX()
//   await alert({ message: 'Ce thème existe déjà.' })

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'

interface ConfirmOptions {
  /** Titre optionnel en gras */
  title?: string
  /** Message principal (les retours à la ligne sont conservés) */
  message: string
  /** Libellé du bouton de confirmation (défaut : « Confirmer » / « OK ») */
  confirmLabel?: string
  /** Libellé du bouton d'annulation (défaut : « Annuler ») */
  cancelLabel?: string
  /** Bouton de confirmation en rouge (suppression) */
  danger?: boolean
}

interface SheetState {
  options: ConfirmOptions
  mode: 'confirm' | 'alert'
  resolve: (value: boolean) => void
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  alert: (options: ConfirmOptions) => Promise<void>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm doit être utilisé dans <ConfirmProvider>')
  return ctx
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SheetState | null>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  // Élément focalisé avant l'ouverture, pour y rendre le focus à la fermeture
  const triggerRef = useRef<HTMLElement | null>(null)

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setState({ options, mode: 'confirm', resolve })),
    []
  )

  const alert = useCallback(
    (options: ConfirmOptions) =>
      new Promise<void>((resolve) => setState({ options, mode: 'alert', resolve: () => resolve() })),
    []
  )

  const close = useCallback((value: boolean) => {
    setState((s) => {
      if (s) s.resolve(value)
      return null
    })
  }, [])

  // Modale : Échap = annuler, focus initial sur le bouton de confirmation,
  // focus piégé dans la feuille, et focus rendu au déclencheur à la fermeture.
  useEffect(() => {
    if (!state) return
    triggerRef.current = document.activeElement as HTMLElement | null
    confirmBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close(false)
        return
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusables = sheetRef.current.querySelectorAll<HTMLElement>('button')
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      triggerRef.current?.focus?.()
    }
  }, [state, close])

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={state.options.title ?? 'Confirmation'}
        >
          {/* Voile cliquable = annuler */}
          <div className="absolute inset-0 bg-black/40 fade-in" onClick={() => close(false)} />

          {/* Feuille */}
          <div ref={sheetRef} className="relative w-full max-w-[430px] bg-white rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sheet-up">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" aria-hidden />
            {state.options.title && (
              <h2 className="text-base font-bold text-sncf-dark mb-1">{state.options.title}</h2>
            )}
            <p className="text-sm text-gray-700 mb-5 whitespace-pre-line">{state.options.message}</p>
            <div className="flex flex-col gap-2">
              <button
                ref={confirmBtnRef}
                onClick={() => close(true)}
                className={`w-full min-h-[48px] rounded-xl font-semibold text-white active:scale-[0.98] transition-transform ${
                  state.options.danger ? 'bg-sncf-red' : 'bg-sncf-blue'
                }`}
              >
                {state.options.confirmLabel ?? (state.mode === 'alert' ? 'OK' : 'Confirmer')}
              </button>
              {state.mode === 'confirm' && (
                <button
                  onClick={() => close(false)}
                  className="w-full min-h-[48px] rounded-xl font-medium text-sncf-dark bg-gray-100 active:scale-[0.98] transition-transform"
                >
                  {state.options.cancelLabel ?? 'Annuler'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
