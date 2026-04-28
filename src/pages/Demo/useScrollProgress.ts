// src/pages/Demo/useScrollProgress.ts
// En mode explorer, le scroll vertical pilote la progression dans la démo.
// Chaque acte occupe ~1 hauteur de viewport. Le hook observe les sections via
// IntersectionObserver et retourne l'id de l'acte le plus visible.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ActId } from '../../data/demoContent'

interface Result {
  /** Acte le plus visible dans le viewport */
  currentAct: ActId | null
  /** Index 0-3 de l'acte courant (utile pour le progress indicator) */
  currentIndex: number
  /** Callback ref à attacher sur chaque section (par index 0..3) */
  setSectionRef: (index: number) => (el: HTMLDivElement | null) => void
  /** Scroll programmatique vers une section */
  scrollToSection: (index: number) => void
}

const ACT_IDS: ActId[] = ['act1', 'act2', 'act3', 'act4']

export function useScrollProgress(): Result {
  const elementsRef = useRef<(HTMLDivElement | null)[]>([null, null, null, null])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Recalcule l'observer chaque fois que la liste d'éléments change.
  // Comme on attache via callback ref, on déclenche une mise à jour locale via un compteur.
  const [registeredCount, setRegisteredCount] = useState(0)

  useEffect(() => {
    const elements = elementsRef.current.filter(
      (el): el is HTMLDivElement => el !== null
    )
    if (elements.length === 0) return

    // Pour chaque section, on garde son ratio de visibilité courant
    const ratios = new Map<HTMLDivElement, number>()
    const allElements = elementsRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target as HTMLDivElement, entry.intersectionRatio)
        }
        let bestIndex = 0
        let bestRatio = -1
        allElements.forEach((el, i) => {
          if (!el) return
          const r = ratios.get(el) ?? 0
          if (r > bestRatio) {
            bestRatio = r
            bestIndex = i
          }
        })
        setCurrentIndex(bestIndex)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    for (const el of elements) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [registeredCount])

  const setSectionRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      elementsRef.current[index] = el
      // Notifie l'effet pour qu'il (re)setup l'observer
      setRegisteredCount((c) => c + 1)
    },
    []
  )

  const scrollToSection = useCallback((index: number) => {
    elementsRef.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return {
    currentAct: ACT_IDS[currentIndex],
    currentIndex,
    setSectionRef,
    scrollToSection,
  }
}
