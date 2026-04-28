// src/pages/Demo/Demo.tsx
// Page principale de la démo : 4 actes joués en séquence, 1m30 au total.
// La timeline est pilotée par useDemoTimeline ; chaque acte est rendu visible/invisible
// selon currentAct. Le texte et le fond changent en fonction de l'acte courant.

import { useEffect, useRef, useState } from 'react'
import { useDemoTimeline } from './useDemoTimeline'
import { ACTS, type ActId } from '../../data/demoContent'
import { BackgroundFade, type BgMode } from '../../components/demo/BackgroundFade'
import { ActText } from '../../components/demo/ActText'
import { useAudioCue } from '../../components/demo/useAudioCue'
import { DemoScene } from '../../three/DemoScene'
import { Act1Problem } from '../../three/acts/Act1Problem'
import { Act2Solution } from '../../three/acts/Act2Solution'
import { Act3Coverage } from '../../three/acts/Act3Coverage'
import { Act4Conclusion } from '../../three/acts/Act4Conclusion'

const ACT_BG: Record<ActId, BgMode> = {
  act1: 'black',
  act2: 'white',
  act3: 'dark-blue',
  act4: 'white',
}

const ACT_TEXT_COLOR: Record<ActId, string> = {
  act1: 'text-white',
  act2: 'text-[#0C1E5B]',
  act3: 'text-white',
  act4: 'text-[#0C1E5B]',
}

export function Demo() {
  // La timeline ne démarre qu'au premier clic (politique autoplay du navigateur).
  const { currentAct, elapsed, finished, restart } = useDemoTimeline(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const hasStartedRef = useRef(false)

  // Démarre la timeline une seule fois quand l'utilisateur clique
  useEffect(() => {
    if (hasInteracted && !hasStartedRef.current) {
      hasStartedRef.current = true
      restart()
    }
  }, [hasInteracted, restart])

  if (!hasInteracted) {
    return (
      <div
        className="fixed inset-0 bg-black text-white flex items-center justify-center cursor-pointer"
        onClick={() => setHasInteracted(true)}
      >
        <div className="text-center">
          <p className="text-3xl font-light mb-2">Démo Kit Anomalie</p>
          <p className="text-sm opacity-60">Cliquez pour démarrer · 1 min 30</p>
        </div>
      </div>
    )
  }

  const bgMode: BgMode = currentAct ? ACT_BG[currentAct] : 'black'
  const textColor = currentAct ? ACT_TEXT_COLOR[currentAct] : 'text-white'
  const currentActConfig = currentAct ? ACTS.find((a) => a.id === currentAct) : null

  return (
    <div className="fixed inset-0 overflow-hidden">
      <BackgroundFade mode={bgMode} />

      <DemoScene>
        <Act1Problem active={currentAct === 'act1'} />
        <Act2Solution active={currentAct === 'act2'} />
        <Act3Coverage active={currentAct === 'act3'} />
        <Act4Conclusion active={currentAct === 'act4'} />
      </DemoScene>

      {/* Texte de l'acte courant — key force le remount à chaque changement d'acte */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${textColor}`}
      >
        {currentActConfig && (
          <ActText
            key={currentActConfig.id}
            lines={currentActConfig.text}
          />
        )}
      </div>

      {/* Audio de l'acte courant */}
      {currentAct === 'act1' && <AudioPlayer src={ACTS[0].audio} />}
      {currentAct === 'act2' && <AudioPlayer src={ACTS[1].audio} />}
      {currentAct === 'act3' && <AudioPlayer src={ACTS[2].audio} />}
      {currentAct === 'act4' && <AudioPlayer src={ACTS[3].audio} />}

      {/* Logo + URL en acte 4 */}
      {currentAct === 'act4' && (
        <div className="absolute bottom-12 left-0 right-0 text-center text-[#0C1E5B] pointer-events-none">
          <p className="text-2xl font-bold">Kit Anomalie</p>
          <p className="text-sm opacity-60">kit-anomalie.github.io</p>
        </div>
      )}

      {/* Bouton replay quand fini */}
      {finished && (
        <button
          onClick={restart}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur rounded-full text-white border border-white/30 hover:bg-white/20 transition"
        >
          Rejouer
        </button>
      )}

      {/* Indicateur temps en mode dev */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 right-4 text-xs opacity-30 font-mono text-white mix-blend-difference pointer-events-none">
          {elapsed.toFixed(1)}s · {currentAct ?? '—'}
        </div>
      )}
    </div>
  )
}

// Sous-composant interne pour jouer l'audio d'un acte
// (le hook useAudioCue ne peut pas être conditionnel, donc on l'extrait dans un composant
// qui se monte/démonte avec l'acte)
function AudioPlayer({ src }: { src: string }) {
  useAudioCue({ src, volume: 0.6 })
  return null
}
