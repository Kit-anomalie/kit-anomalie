// src/pages/Demo/useDemoMode.ts
// Toggle entre mode auto-play (timeline 1m30) et mode explorer (scroll-driven).
// Persisté dans localStorage pour que l'utilisateur reprenne où il était.

import { useEffect, useState } from 'react'

export type DemoMode = 'auto' | 'explore'

const KEY = 'kit-anomalie-demo-mode'

function readStored(): DemoMode {
  if (typeof window === 'undefined') return 'auto'
  const v = window.localStorage.getItem(KEY)
  return v === 'explore' ? 'explore' : 'auto'
}

export function useDemoMode(): [DemoMode, (m: DemoMode) => void] {
  const [mode, setModeState] = useState<DemoMode>(() => readStored())

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, mode)
    } catch {
      // localStorage indisponible (mode privé) — on ignore
    }
  }, [mode])

  return [mode, setModeState]
}
