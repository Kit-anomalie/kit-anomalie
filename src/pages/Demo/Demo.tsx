// src/pages/Demo/Demo.tsx
// Page principale de la démo, deux modes :
// - auto-play : timeline 1m30 fixe (livrable décideurs en réunion)
// - explorer : scroll-driven, interactions, liens vers vraies briques (équipes internes)

import { useEffect, useRef, useState } from 'react'
import { useDemoTimeline } from './useDemoTimeline'
import { useDemoMode, type DemoMode } from './useDemoMode'
import { useScrollProgress } from './useScrollProgress'
import { ProgressIndicator } from './ProgressIndicator'
import { ExplorerSections } from './ExplorerSections'
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
  const [mode, setMode] = useDemoMode()

  return mode === 'auto' ? (
    <DemoAutoPlay onSwitchMode={() => setMode('explore')} />
  ) : (
    <DemoExplorer onSwitchMode={() => setMode('auto')} />
  )
}

// =================================================================
// Mode AUTO-PLAY (existant) — timeline 1m30 pilotée par RAF
// =================================================================

function DemoAutoPlay({ onSwitchMode }: { onSwitchMode: () => void }) {
  const { currentAct, elapsed, finished, restart } = useDemoTimeline(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const hasStartedRef = useRef(false)

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
          <ModeToggle mode="auto" onSwitch={onSwitchMode} className="mt-8" />
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

      <DemoStage currentAct={currentAct} />

      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${textColor}`}
      >
        {currentActConfig && (
          <ActText key={currentActConfig.id} lines={currentActConfig.text} />
        )}
      </div>

      {currentAct === 'act1' && <AudioPlayer src={ACTS[0].audio} />}
      {currentAct === 'act2' && <AudioPlayer src={ACTS[1].audio} />}
      {currentAct === 'act3' && <AudioPlayer src={ACTS[2].audio} />}
      {currentAct === 'act4' && <AudioPlayer src={ACTS[3].audio} />}

      {currentAct === 'act4' && (
        <div className="absolute bottom-12 left-0 right-0 text-center text-[#0C1E5B] pointer-events-none">
          <p className="text-2xl font-bold">Kit Anomalie</p>
          <p className="text-sm opacity-60">kit-anomalie.github.io</p>
        </div>
      )}

      {finished && (
        <button
          onClick={restart}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur rounded-full text-white border border-white/30 hover:bg-white/20 transition"
        >
          Rejouer
        </button>
      )}

      <ModeToggle mode="auto" onSwitch={onSwitchMode} />

      {import.meta.env.DEV && (
        <div className="absolute top-4 right-4 text-xs opacity-30 font-mono text-white mix-blend-difference pointer-events-none">
          {elapsed.toFixed(1)}s · {currentAct ?? '—'}
        </div>
      )}
    </div>
  )
}

// =================================================================
// Mode EXPLORER (nouveau) — scroll-driven + interactions
// =================================================================

function DemoExplorer({ onSwitchMode }: { onSwitchMode: () => void }) {
  const { currentAct, currentIndex, setSectionRef, scrollToSection } = useScrollProgress()
  const bgMode: BgMode = ACT_BG[currentAct ?? 'act1']

  return (
    <>
      {/* Fond fixe + scène 3D fixe : la 3D ne scroll pas, c'est l'overlay HTML
          qui scroll et le fond change selon l'acte le plus visible */}
      <BackgroundFade mode={bgMode} />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DemoStage currentAct={currentAct ?? 'act1'} />
      </div>

      {/* Couche scrollable : 4 sections, une par acte. */}
      <div className="relative z-10">
        <ExplorerSections setSectionRef={setSectionRef} currentAct={currentAct} />
      </div>

      <ProgressIndicator
        currentIndex={currentIndex}
        onJump={scrollToSection}
        activeColor={bgMode === 'white' ? '#0C1E5B' : '#FFFFFF'}
      />

      <ModeToggle mode="explore" onSwitch={onSwitchMode} />
    </>
  )
}

// =================================================================
// Composants partagés
// =================================================================

/** Scène R3F + 4 actes — partagée entre auto-play et explorer */
function DemoStage({ currentAct }: { currentAct: ActId | null }) {
  return (
    <DemoScene>
      <Act1Problem active={currentAct === 'act1'} />
      <Act2Solution active={currentAct === 'act2'} />
      <Act3Coverage active={currentAct === 'act3'} />
      <Act4Conclusion active={currentAct === 'act4'} />
    </DemoScene>
  )
}

/** Toggle compact en haut à droite, change selon le mode courant */
function ModeToggle({
  mode,
  onSwitch,
  className = '',
}: {
  mode: DemoMode
  onSwitch: () => void
  className?: string
}) {
  return (
    <button
      onClick={onSwitch}
      className={`fixed top-4 right-4 z-40 px-4 py-2 rounded-full text-xs font-medium bg-white/85 backdrop-blur text-sncf-dark border border-sncf-dark/20 hover:bg-white shadow-sm transition ${className}`}
    >
      {mode === 'auto' ? '🧭 Mode explorer' : '▶ Mode vidéo'}
    </button>
  )
}

/** Joue l'audio de l'acte courant (en auto-play uniquement) */
function AudioPlayer({ src }: { src: string }) {
  useAudioCue({ src, volume: 0.6 })
  return null
}
