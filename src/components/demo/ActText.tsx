// src/components/demo/ActText.tsx
// Affiche un tableau de lignes de texte avec apparition progressive mot par mot.
// L'animation est pilotée par GSAP via une ref.

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
  /** Lignes de texte (chaque ligne est une string) */
  lines: string[]
  /** Si true, joue l'animation au mount */
  autoPlay?: boolean
  /** Délai entre chaque mot, en secondes */
  staggerWord?: number
  /** Classe CSS pour les lignes */
  className?: string
}

export function ActText({
  lines,
  autoPlay = true,
  staggerWord = 0.06,
  className = 'text-5xl md:text-7xl font-light tracking-tight',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autoPlay || !containerRef.current) return
    const words = containerRef.current.querySelectorAll<HTMLSpanElement>('[data-word]')
    gsap.fromTo(
      words,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: staggerWord }
    )
  }, [autoPlay, staggerWord])

  return (
    <div ref={containerRef} className="flex flex-col gap-2 text-center">
      {lines.map((line, lineIdx) => (
        <div key={lineIdx} className={className}>
          {line.split(' ').map((word, wordIdx) => (
            <span
              key={`${lineIdx}-${wordIdx}`}
              data-word
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
                opacity: 0,
              }}
            >
              {word}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
