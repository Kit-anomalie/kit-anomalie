// src/pages/Demo/useDemoTimeline.ts
// Orchestre les 4 actes : retourne l'ID de l'acte courant en fonction du temps écoulé.
// La timeline est pilotée par un simple compteur (pas GSAP global ici car les transitions
// internes de chaque acte ont déjà leur propre tween GSAP).

import { useEffect, useState } from 'react'
import { ACTS, type ActId, DEMO_TOTAL_DURATION } from '../../data/demoContent'

interface DemoState {
  /** Acte courant ('act1' à 'act4'), ou null avant démarrage */
  currentAct: ActId | null
  /** Temps écoulé en secondes depuis le démarrage */
  elapsed: number
  /** True quand la démo est terminée */
  finished: boolean
}

function getActAt(elapsed: number): ActId | null {
  for (const act of ACTS) {
    if (elapsed >= act.start && elapsed < act.start + act.duration) {
      return act.id
    }
  }
  return null
}

export function useDemoTimeline(autoStart = true): DemoState & { restart: () => void } {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(autoStart)

  useEffect(() => {
    if (!running) return
    const startTime = performance.now()
    let frameId = 0

    function tick() {
      const now = performance.now()
      const e = (now - startTime) / 1000
      setElapsed(Math.min(e, DEMO_TOTAL_DURATION))
      if (e < DEMO_TOTAL_DURATION) {
        frameId = requestAnimationFrame(tick)
      } else {
        setRunning(false)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [running])

  return {
    currentAct: getActAt(elapsed),
    elapsed,
    finished: elapsed >= DEMO_TOTAL_DURATION,
    restart: () => {
      setElapsed(0)
      setRunning(true)
    },
  }
}
