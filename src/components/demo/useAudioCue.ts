// src/components/demo/useAudioCue.ts
// Joue un fichier audio via Howler avec fade-in/out.
// Retourne stop() pour couper proprement à la fin de l'acte.

import { useEffect, useRef } from 'react'
import { Howl } from 'howler'

interface Options {
  src: string
  volume?: number
  loop?: boolean
  fadeInMs?: number
  fadeOutMs?: number
  /** Si true, joue dès le mount */
  autoPlay?: boolean
}

export function useAudioCue({
  src,
  volume = 0.7,
  loop = false,
  fadeInMs = 800,
  fadeOutMs = 800,
  autoPlay = true,
}: Options) {
  const howlRef = useRef<Howl | null>(null)

  useEffect(() => {
    const howl = new Howl({ src: [src], volume: 0, loop, html5: true })
    howlRef.current = howl

    if (autoPlay) {
      howl.play()
      howl.fade(0, volume, fadeInMs)
    }

    return () => {
      howl.fade(howl.volume(), 0, fadeOutMs)
      // Stop après le fade
      setTimeout(() => howl.stop(), fadeOutMs + 50)
    }
  }, [src, volume, loop, fadeInMs, fadeOutMs, autoPlay])

  return {
    stop: () => howlRef.current?.stop(),
    pause: () => howlRef.current?.pause(),
    play: () => howlRef.current?.play(),
  }
}
