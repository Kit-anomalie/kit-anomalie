# Démo produit Kit Anomalie — Phase 1 : Auto-play

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une vidéo cinématique 1m30 (4 actes Keynote) jouée automatiquement depuis la route `/demo` du Kit Anomalie. C'est la fondation : la capture vidéo MP4 et le mode interactif sont des plans séparés (Phase 2 et Phase 3).

**Architecture:** Une route `/demo` dans l'app React existante, hors `Layout` (pas de bottom nav) et hors gate de profil. Une seule scène React Three Fiber qui contient les 4 actes en sous-composants. Une timeline GSAP unique orchestre les transitions, le fond, les textes, l'audio et les caméras de chaque acte. Pas de tests unitaires : revue visuelle via `npm run dev` après chaque étape.

**Tech Stack:**
- Existant : React 19, TypeScript strict, Vite 8, Tailwind 4, React Router 7
- Ajouts : `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `howler`, `@types/howler`

**Conventions du projet (à respecter) :**
- Commentaires en français
- Branche unique `main`, push direct autorisé
- Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
- Aucune référence à l'opérateur ou au métier dans le code, les commentaires ou le contenu visible

---

## Structure des fichiers

```
src/
├── App.tsx                            ← MODIFIER : ajouter route /demo hors Layout
├── pages/
│   └── Demo/
│       ├── Demo.tsx                   ← CRÉER : page principale, joue la timeline
│       └── useDemoTimeline.ts         ← CRÉER : hook GSAP orchestre les 4 actes
├── three/
│   ├── DemoScene.tsx                  ← CRÉER : Canvas R3F + setup global
│   ├── acts/
│   │   ├── Act1Problem.tsx            ← CRÉER : silhouette + texte ouverture
│   │   ├── Act2Solution.tsx           ← CRÉER : phone qui flotte + 3 écrans
│   │   ├── Act3Coverage.tsx           ← CRÉER : arborescence + HUD
│   │   └── Act4Conclusion.tsx         ← CRÉER : phone center + logo
│   ├── components/
│   │   ├── PhoneMockup.tsx            ← CRÉER : modèle téléphone 3D
│   │   ├── Silhouette.tsx             ← CRÉER : silhouette + rim light
│   │   ├── Particles.tsx              ← CRÉER : particules ambient
│   │   ├── HUD.tsx                    ← CRÉER : éléments sci-fi déployables
│   │   └── CoverageTree.tsx           ← CRÉER : arborescence 3D animée
│   └── shaders/
│       └── rimLightMaterial.ts        ← CRÉER : shader rim light (glsl inline)
├── components/demo/
│   ├── ActText.tsx                    ← CRÉER : texte qui apparaît mot par mot
│   ├── BackgroundFade.tsx             ← CRÉER : div fond qui bascule
│   └── useAudioCue.ts                 ← CRÉER : hook Howler wrapper
├── data/
│   └── demoContent.ts                 ← CRÉER : config 4 actes (durées, textes, audio)
public/
├── models/
│   ├── phone.glb                      ← À FOURNIR : modèle téléphone 3D (placeholder OK)
│   └── silhouette.glb                 ← À FOURNIR : modèle Mixamo glTF (placeholder OK)
└── audio/
    ├── act1-ambient.mp3               ← À FOURNIR : vent + pas (placeholder silencieux OK)
    ├── act2-swoosh.mp3                ← À FOURNIR
    ├── act3-buildup.mp3               ← À FOURNIR
    └── act4-resolve.mp3               ← À FOURNIR
```

**Stratégie d'assets :**
- Phone : modèle low-poly libre (Sketchfab CC0) ou cube stylisé en attendant
- Silhouette : Mixamo > "Walking" pose, export glTF binary, placer dans `public/models/`
- Audio : 4 fichiers MP3 placeholders silencieux générés au début, à remplacer plus tard

---

## Task 1 : Setup des dépendances

**Files:**
- Modify: `package.json`

- [ ] **Step 1 : Installer les dépendances 3D et audio**

```bash
cd /Users/wilfrieddieugnou/Documents/Claude/Projects/Personnel/DataShift/02_DataShift_App/Kit_Anomalie
npm install three @react-three/fiber @react-three/drei gsap howler
npm install -D @types/three @types/howler
```

- [ ] **Step 2 : Vérifier que le build passe encore**

Run: `npm run build`
Expected: Build OK, pas d'erreur TypeScript.

- [ ] **Step 3 : Commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore(demo): ajout dépendances 3D (three, R3F, drei, gsap, howler)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2 : Données de la démo

**Files:**
- Create: `src/data/demoContent.ts`

- [ ] **Step 1 : Créer le fichier de contenu**

```typescript
// src/data/demoContent.ts
// Configuration des 4 actes de la démo : durées, textes, cues audio.
// Total : 90 secondes (1m30).

export type ActId = 'act1' | 'act2' | 'act3' | 'act4'

export interface ActConfig {
  id: ActId
  /** Début en secondes depuis t=0 */
  start: number
  /** Durée en secondes */
  duration: number
  /** Texte affiché à l'écran (peut contenir plusieurs lignes) */
  text: string[]
  /** Fichier audio joué pendant l'acte */
  audio: string
}

export const DEMO_TOTAL_DURATION = 90

export const ACTS: ActConfig[] = [
  {
    id: 'act1',
    start: 0,
    duration: 22,
    text: ['Sur le terrain.', 'À 6h12.', 'Sans réseau.'],
    audio: '/kit-anomalie/audio/act1-ambient.mp3',
  },
  {
    id: 'act2',
    start: 22,
    duration: 28,
    text: ['Une réponse.', 'Trois secondes.'],
    audio: '/kit-anomalie/audio/act2-swoosh.mp3',
  },
  {
    id: 'act3',
    start: 50,
    duration: 25,
    text: ['Tout le périmètre.', 'Une seule app.'],
    audio: '/kit-anomalie/audio/act3-buildup.mp3',
  },
  {
    id: 'act4',
    start: 75,
    duration: 15,
    text: ['Le compagnon.', 'Pas un nouvel outil.'],
    audio: '/kit-anomalie/audio/act4-resolve.mp3',
  },
]
```

- [ ] **Step 2 : Vérifier la cohérence des durées**

Run mentalement : `22 + 28 + 25 + 15 = 90`. Si différent, corriger.

- [ ] **Step 3 : Vérifier que TS compile**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 4 : Commit**

```bash
git add src/data/demoContent.ts
git commit -m "$(cat <<'EOF'
feat(demo): configuration des 4 actes (durées, textes, audio)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 : Route `/demo` et page squelette

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/Demo/Demo.tsx`

- [ ] **Step 1 : Créer la page Demo squelette**

```typescript
// src/pages/Demo/Demo.tsx
// Page principale de la démo produit.
// Joue automatiquement les 4 actes en 1m30, plein écran, fond noir.

export function Demo() {
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-2xl">Démo — squelette</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Ajouter la route dans App.tsx**

Modifier `src/App.tsx` pour ajouter l'import et la route. La route `/demo` doit être :
- Hors du `Layout` (pas de bottom nav)
- Accessible sans setup de profil (avant le `if (!isConfigured)`)

Ajouter en haut avec les autres imports :

```typescript
import { Demo } from './pages/Demo/Demo'
```

Dans `AppRoutes()`, **avant** le `if (!isConfigured)`, ajouter une route prioritaire :

```typescript
function AppRoutes() {
  const { isConfigured } = useProfileStore()
  const loadSharedContent = useSharedContentStore(s => s.load)

  useEffect(() => { loadSharedContent() }, [loadSharedContent])

  // Route démo accessible quel que soit l'état du profil
  // Doit être lue AVANT la branche !isConfigured pour ne pas être interceptée

  if (!isConfigured) {
    return (
      <Routes>
        <Route path="/demo" element={<Demo />} />
        <Route path="/plan" element={<PlanTravail />} />
        <Route path="/setup" element={<ProfileSetup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/demo" element={<Demo />} />
      <Route element={<Layout />}>
        {/* ... routes existantes inchangées ... */}
      </Route>
      {/* ... autres routes hors Layout inchangées ... */}
    </Routes>
  )
}
```

- [ ] **Step 3 : Lancer le dev server et vérifier**

```bash
npm run dev
```

Ouvrir `http://localhost:5173/kit-anomalie/demo` dans le navigateur.
Expected : écran noir avec « Démo — squelette » au centre. Pas de bottom nav.

- [ ] **Step 4 : Vérifier en mode pas-encore-configuré**

Vider localStorage (`localStorage.clear()` dans la console DevTools), recharger, retourner sur `/demo`. Expected : la page démo s'affiche, pas de redirection vers `/setup`.

- [ ] **Step 5 : Commit**

```bash
git add src/pages/Demo/Demo.tsx src/App.tsx
git commit -m "$(cat <<'EOF'
feat(demo): route /demo accessible hors Layout et hors profil

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4 : Composant `BackgroundFade`

**Files:**
- Create: `src/components/demo/BackgroundFade.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// src/components/demo/BackgroundFade.tsx
// Fond plein écran qui bascule entre noir, blanc et sombre selon l'acte.
// Utilisé en arrière-plan de la scène 3D.

export type BgMode = 'black' | 'white' | 'dark-blue'

const BG_COLORS: Record<BgMode, string> = {
  black: '#000000',
  white: '#FFFFFF',
  // Bleu très sombre pour l'ambiance sci-fi de l'acte 3
  'dark-blue': '#04061A',
}

interface Props {
  mode: BgMode
  /** Durée de la transition en secondes */
  transitionDuration?: number
}

export function BackgroundFade({ mode, transitionDuration = 1.5 }: Props) {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        backgroundColor: BG_COLORS[mode],
        transition: `background-color ${transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    />
  )
}
```

- [ ] **Step 2 : Tester rapidement dans Demo.tsx**

Modifier temporairement `Demo.tsx` pour utiliser le composant :

```typescript
import { useState, useEffect } from 'react'
import { BackgroundFade, type BgMode } from '../../components/demo/BackgroundFade'

export function Demo() {
  const [mode, setMode] = useState<BgMode>('black')

  // Test : bascule auto toutes les 2s
  useEffect(() => {
    const cycle: BgMode[] = ['black', 'white', 'dark-blue']
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % cycle.length
      setMode(cycle[i])
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 text-white overflow-hidden">
      <BackgroundFade mode={mode} />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-2xl mix-blend-difference">Démo — fond : {mode}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3 : Vérifier visuellement**

Run: `npm run dev`
Ouvrir `/demo`. Expected : le fond bascule noir → blanc → bleu sombre toutes les 2s, transitions fluides 1.5s. Le texte « mix-blend-difference » reste lisible.

- [ ] **Step 4 : Retirer le code de test, garder Demo.tsx propre**

```typescript
// src/pages/Demo/Demo.tsx
import { BackgroundFade } from '../../components/demo/BackgroundFade'

export function Demo() {
  return (
    <div className="fixed inset-0 text-white overflow-hidden">
      <BackgroundFade mode="black" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-2xl">Démo — squelette</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5 : Commit**

```bash
git add src/components/demo/BackgroundFade.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): composant BackgroundFade (noir/blanc/sombre)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5 : Composant `ActText` (apparition mot par mot)

**Files:**
- Create: `src/components/demo/ActText.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
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
  /** Délai entre chaque ligne, en secondes */
  staggerLine?: number
  /** Classe CSS pour les lignes */
  className?: string
}

export function ActText({
  lines,
  autoPlay = true,
  staggerWord = 0.06,
  staggerLine = 0.45,
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
    <div ref={containerRef} className="flex flex-col gap-2">
      {lines.map((line, lineIdx) => (
        <div key={lineIdx} className={className} style={{ opacity: 0.999 }}>
          {line.split(' ').map((word, wordIdx) => (
            <span
              key={`${lineIdx}-${wordIdx}`}
              data-word
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
                opacity: 0,
                animationDelay: `${lineIdx * staggerLine}s`,
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
```

- [ ] **Step 2 : Tester dans Demo.tsx**

```typescript
// src/pages/Demo/Demo.tsx
import { BackgroundFade } from '../../components/demo/BackgroundFade'
import { ActText } from '../../components/demo/ActText'

export function Demo() {
  return (
    <div className="fixed inset-0 text-white overflow-hidden">
      <BackgroundFade mode="black" />
      <div className="absolute inset-0 flex items-center justify-center">
        <ActText lines={['Sur le terrain.', 'À 6h12.', 'Sans réseau.']} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3 : Vérifier visuellement**

Run: `npm run dev` puis recharger `/demo`.
Expected : les 3 lignes apparaissent mot par mot, premium, au centre de l'écran.

- [ ] **Step 4 : Commit**

```bash
git add src/components/demo/ActText.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): composant ActText (apparition mot par mot via GSAP)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6 : Hook audio `useAudioCue`

**Files:**
- Create: `src/components/demo/useAudioCue.ts`
- Create: `public/audio/.gitkeep`

- [ ] **Step 1 : Créer le hook**

```typescript
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
```

- [ ] **Step 2 : Créer le dossier audio avec un placeholder**

```bash
mkdir -p public/audio
# Placeholder : 4 fichiers MP3 silencieux 30 secondes chacun
# Génération via ffmpeg (si dispo) sinon créer 4 fichiers vides à remplacer plus tard
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 30 -q:a 9 -acodec libmp3lame public/audio/act1-ambient.mp3 2>/dev/null || touch public/audio/act1-ambient.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 30 -q:a 9 -acodec libmp3lame public/audio/act2-swoosh.mp3 2>/dev/null || touch public/audio/act2-swoosh.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 30 -q:a 9 -acodec libmp3lame public/audio/act3-buildup.mp3 2>/dev/null || touch public/audio/act3-buildup.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 30 -q:a 9 -acodec libmp3lame public/audio/act4-resolve.mp3 2>/dev/null || touch public/audio/act4-resolve.mp3
```

- [ ] **Step 3 : Vérifier que les fichiers existent**

Run: `ls public/audio/`
Expected : 4 fichiers MP3.

- [ ] **Step 4 : Commit**

```bash
git add src/components/demo/useAudioCue.ts public/audio/
git commit -m "$(cat <<'EOF'
feat(demo): hook useAudioCue (Howler) + placeholders audio

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7 : Scène R3F globale `DemoScene`

**Files:**
- Create: `src/three/DemoScene.tsx`

- [ ] **Step 1 : Créer le composant scène**

```typescript
// src/three/DemoScene.tsx
// Canvas R3F qui sert de container pour les 4 actes.
// Setup global : caméra, lights, fog, stats de dev.

import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function DemoScene({ children }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        // Pointer-events à none pour que les overlays texte restent cliquables
        pointerEvents: 'none',
      }}
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 3]} intensity={0.4} color="#00A3E0" />
      {children}
    </Canvas>
  )
}
```

- [ ] **Step 2 : Intégrer dans Demo.tsx avec un mesh test**

```typescript
// src/pages/Demo/Demo.tsx
import { BackgroundFade } from '../../components/demo/BackgroundFade'
import { ActText } from '../../components/demo/ActText'
import { DemoScene } from '../../three/DemoScene'

export function Demo() {
  return (
    <div className="fixed inset-0 text-white overflow-hidden">
      <BackgroundFade mode="black" />
      <DemoScene>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00A3E0" />
        </mesh>
      </DemoScene>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <ActText lines={['Sur le terrain.', 'À 6h12.', 'Sans réseau.']} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3 : Vérifier visuellement**

Run: `npm run dev` puis recharger `/demo`.
Expected : un cube bleu au centre + le texte par-dessus. Pas d'erreur dans la console.

- [ ] **Step 4 : Commit**

```bash
git add src/three/DemoScene.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): scène R3F globale (Canvas + lumières)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8 : Composant `Particles`

**Files:**
- Create: `src/three/components/Particles.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// src/three/components/Particles.tsx
// Champ de particules 3D, rotation lente. Utilisé en ambient pour les actes 1 et 3.
// 800 particules réparties dans une sphère de rayon configurable.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  count?: number
  radius?: number
  color?: string
  size?: number
}

export function Particles({
  count = 800,
  radius = 8,
  color = '#00A3E0',
  size = 0.02,
}: Props) {
  const pointsRef = useRef<THREE.Points>(null)

  // Génère les positions une seule fois (réparties dans une sphère)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Distribution sphérique uniforme
      const r = Math.cbrt(Math.random()) * radius
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count, radius])

  // Rotation lente continue
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  )
}
```

- [ ] **Step 2 : Tester dans Demo.tsx**

Remplacer le mesh test par le composant Particles :

```typescript
import { Particles } from '../../three/components/Particles'

// Dans <DemoScene> :
<Particles />
```

- [ ] **Step 3 : Vérifier visuellement**

Recharger `/demo`. Expected : nuage de particules bleues qui tourne lentement, le texte par-dessus.

- [ ] **Step 4 : Commit**

```bash
git add src/three/components/Particles.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): composant Particles (champ ambient avec rotation)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9 : Composant `Silhouette` (placeholder + rim light)

**Files:**
- Create: `src/three/components/Silhouette.tsx`
- Create: `src/three/shaders/rimLightMaterial.ts`

> Cette task crée d'abord une **silhouette placeholder** (capsule humaine basique en formes primitives) avec un shader rim light. Un modèle Mixamo glTF réel pourra remplacer le placeholder dans une task de polish ultérieure (hors Phase 1).

- [ ] **Step 1 : Créer le matériau rim light**

```typescript
// src/three/shaders/rimLightMaterial.ts
// Shader matériau "rim light" : éclaire les bords de l'objet avec une couleur configurable.
// Le centre reste sombre (silhouette), les bords brillent.

import * as THREE from 'three'

export function createRimLightMaterial(color = '#00A3E0', intensity = 1.5) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * worldPosition;
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        // Rim factor : 1 quand le normal est perpendiculaire à la vue (bords),
        // 0 quand le normal pointe vers la caméra (centre).
        float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
        rim = pow(rim, 2.5) * uIntensity;
        gl_FragColor = vec4(uColor * rim, rim);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
  })
}
```

- [ ] **Step 2 : Créer la silhouette placeholder**

```typescript
// src/three/components/Silhouette.tsx
// Silhouette humaine stylisée : tête, torse, jambes, sac, casque.
// Placeholder en formes primitives en attendant le modèle Mixamo glTF.
// Matériau : rim light (centre noir, bords lumineux bleus).

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createRimLightMaterial } from '../shaders/rimLightMaterial'

interface Props {
  position?: [number, number, number]
  rimColor?: string
  /** Si true, anime un balancement subtil de marche */
  walking?: boolean
}

export function Silhouette({
  position = [0, 0, 0],
  rimColor = '#00A3E0',
  walking = true,
}: Props) {
  const groupRef = useRef<THREE.Group>(null)

  // Matériau rim light partagé
  const material = useMemo(() => createRimLightMaterial(rimColor, 2.0), [rimColor])

  // Animation marche : balancement subtil du buste
  useFrame((state) => {
    if (!groupRef.current || !walking) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.z = Math.sin(t * 2) * 0.03
    groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 4)) * 0.05
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Casque */}
      <mesh position={[0, 1.85, 0]} material={material}>
        <sphereGeometry args={[0.22, 16, 16]} />
      </mesh>
      {/* Tête */}
      <mesh position={[0, 1.55, 0]} material={material}>
        <sphereGeometry args={[0.18, 16, 16]} />
      </mesh>
      {/* Torse */}
      <mesh position={[0, 1.0, 0]} material={material}>
        <capsuleGeometry args={[0.28, 0.7, 8, 16]} />
      </mesh>
      {/* Jambe gauche */}
      <mesh position={[-0.13, 0.3, 0]} material={material}>
        <capsuleGeometry args={[0.1, 0.7, 8, 16]} />
      </mesh>
      {/* Jambe droite */}
      <mesh position={[0.13, 0.3, 0]} material={material}>
        <capsuleGeometry args={[0.1, 0.7, 8, 16]} />
      </mesh>
      {/* Sac à dos */}
      <mesh position={[0, 1.0, -0.32]} material={material}>
        <boxGeometry args={[0.45, 0.5, 0.2]} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 3 : Tester dans Demo.tsx**

Remplacer Particles par la silhouette pour voir l'effet rim light :

```typescript
import { Silhouette } from '../../three/components/Silhouette'

// Dans <DemoScene> :
<Silhouette position={[0, -1, 0]} />
<Particles />
```

- [ ] **Step 4 : Vérifier visuellement**

Recharger `/demo`. Expected : silhouette humaine stylisée au centre, bords éclairés en bleu, centre quasi noir, balancement subtil de marche.

- [ ] **Step 5 : Commit**

```bash
git add src/three/shaders/rimLightMaterial.ts src/three/components/Silhouette.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): silhouette rim-lit (placeholder primitives + shader)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10 : Composant `PhoneMockup`

**Files:**
- Create: `src/three/components/PhoneMockup.tsx`

> Comme la silhouette, on commence avec un placeholder primitive (boîte avec coins arrondis simulés). Un modèle glTF réel pourra remplacer le placeholder dans une task de polish ultérieure.

- [ ] **Step 1 : Créer le composant**

```typescript
// src/three/components/PhoneMockup.tsx
// Mockup téléphone 3D : corps sombre + écran lumineux.
// Animation : flotte avec un léger mouvement vertical et rotation Y subtile.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  position?: [number, number, number]
  /** Couleur de l'écran (peut servir à signaler un état) */
  screenColor?: string
  /** Si true, flotte (sinon statique) */
  floating?: boolean
  /** Échelle globale */
  scale?: number
}

const PHONE_W = 0.7
const PHONE_H = 1.45
const PHONE_D = 0.08
const SCREEN_MARGIN = 0.04

export function PhoneMockup({
  position = [0, 0, 0],
  screenColor = '#0C1E5B',
  floating = true,
  scale = 1,
}: Props) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current || !floating) return
    const t = state.clock.elapsedTime
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.05
    groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.08
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Corps */}
      <mesh>
        <boxGeometry args={[PHONE_W, PHONE_H, PHONE_D]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Écran (légèrement en relief) */}
      <mesh position={[0, 0, PHONE_D / 2 + 0.001]}>
        <planeGeometry args={[PHONE_W - SCREEN_MARGIN * 2, PHONE_H - SCREEN_MARGIN * 2]} />
        <meshBasicMaterial color={screenColor} />
      </mesh>
      {/* Notch */}
      <mesh position={[0, PHONE_H / 2 - 0.08, PHONE_D / 2 + 0.002]}>
        <planeGeometry args={[0.2, 0.05]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2 : Tester dans Demo.tsx**

Remplacer la silhouette par le téléphone :

```typescript
import { PhoneMockup } from '../../three/components/PhoneMockup'

// Dans <DemoScene> :
<PhoneMockup />
<Particles />
```

- [ ] **Step 3 : Vérifier visuellement**

Recharger `/demo`. Expected : téléphone 3D au centre, flotte doucement, écran bleu marine, légère rotation Y.

- [ ] **Step 4 : Commit**

```bash
git add src/three/components/PhoneMockup.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): mockup téléphone 3D avec flottement

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11 : Composant `CoverageTree` (arborescence 3D)

**Files:**
- Create: `src/three/components/CoverageTree.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// src/three/components/CoverageTree.tsx
// Arborescence 3D qui se déploie depuis le centre.
// Niveaux : centre (un nœud) → 3 enfants → 5 sous-enfants par enfant.
// Les nœuds apparaissent progressivement via le scale (animé par parent en GSAP).

import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface Node {
  position: [number, number, number]
  children: Node[]
}

function buildTree(): Node {
  // Centre
  const root: Node = { position: [0, 0, 0], children: [] }
  // 3 branches niveau 1
  const radius1 = 1.4
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2
    const child: Node = {
      position: [Math.cos(angle) * radius1, Math.sin(angle) * radius1, 0],
      children: [],
    }
    // 5 feuilles niveau 2
    const radius2 = 0.7
    for (let j = 0; j < 5; j++) {
      const subAngle = angle + (j - 2) * 0.3
      child.children.push({
        position: [
          child.position[0] + Math.cos(subAngle) * radius2,
          child.position[1] + Math.sin(subAngle) * radius2,
          0,
        ],
        children: [],
      })
    }
    root.children.push(child)
  }
  return root
}

interface Props {
  color?: string
}

export function CoverageTree({ color = '#00A3E0' }: Props) {
  const root = useMemo(() => buildTree(), [])
  const groupRef = useRef<THREE.Group>(null)

  // Liste plate des nœuds + segments pour le rendu
  const nodes: { pos: [number, number, number]; level: number }[] = []
  const segments: { from: [number, number, number]; to: [number, number, number] }[] = []

  function walk(node: Node, level: number) {
    nodes.push({ pos: node.position, level })
    for (const child of node.children) {
      segments.push({ from: node.position, to: child.position })
      walk(child, level + 1)
    }
  }
  walk(root, 0)

  return (
    <group ref={groupRef}>
      {/* Segments (lignes entre nœuds) */}
      {segments.map((seg, i) => {
        const points = [
          new THREE.Vector3(...seg.from),
          new THREE.Vector3(...seg.to),
        ]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        return (
          <line key={`seg-${i}`}>
            <primitive object={geometry} />
            <lineBasicMaterial color={color} transparent opacity={0.5} />
          </line>
        )
      })}
      {/* Nœuds (sphères) */}
      {nodes.map((node, i) => (
        <mesh key={`node-${i}`} position={node.pos}>
          <sphereGeometry args={[node.level === 0 ? 0.15 : 0.08, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  )
}
```

- [ ] **Step 2 : Tester dans Demo.tsx**

Remplacer le téléphone par l'arborescence :

```typescript
import { CoverageTree } from '../../three/components/CoverageTree'

// Dans <DemoScene> :
<CoverageTree />
```

- [ ] **Step 3 : Vérifier visuellement**

Recharger `/demo`. Expected : arborescence visible : 1 nœud central, 3 branches, 5 feuilles par branche. Couleur bleue, lignes plus pâles, nœuds plus saturés.

- [ ] **Step 4 : Commit**

```bash
git add src/three/components/CoverageTree.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): arborescence 3D de couverture (1 + 3 + 15 noeuds)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12 : Composant `HUD` (sci-fi déployable)

**Files:**
- Create: `src/three/components/HUD.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// src/three/components/HUD.tsx
// HUD sci-fi : 4 arcs de cercle qui tournent à des vitesses différentes autour de l'origine.
// Utilisé en arrière-plan de l'arborescence pour l'acte 3.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  color?: string
  scale?: number
}

export function HUD({ color = '#00A3E0', scale = 1 }: Props) {
  const ringRefs = useRef<(THREE.Group | null)[]>([])

  useFrame((_, delta) => {
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return
      const speed = (i + 1) * 0.15
      ring.rotation.z += delta * speed * (i % 2 === 0 ? 1 : -1)
    })
  })

  // 4 anneaux à des rayons différents
  const rings = [2.5, 3.0, 3.4, 3.7]

  return (
    <group scale={scale}>
      {rings.map((radius, i) => (
        <group
          key={i}
          ref={(el) => { ringRefs.current[i] = el }}
        >
          {/* Arc partiel (pas un cercle complet pour le look HUD) */}
          <mesh>
            <torusGeometry args={[radius, 0.01, 8, 64, Math.PI * 1.5]} />
            <meshBasicMaterial color={color} transparent opacity={0.4 - i * 0.07} />
          </mesh>
          {/* Petit point qui marque la position */}
          <mesh position={[radius, 0, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
```

- [ ] **Step 2 : Tester dans Demo.tsx**

Ajouter le HUD autour de l'arborescence :

```typescript
import { HUD } from '../../three/components/HUD'

// Dans <DemoScene> :
<HUD />
<CoverageTree />
```

- [ ] **Step 3 : Vérifier visuellement**

Recharger `/demo`. Expected : 4 arcs concentriques qui tournent à des vitesses différentes derrière l'arborescence. Effet sci-fi sobre.

- [ ] **Step 4 : Commit**

```bash
git add src/three/components/HUD.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): HUD sci-fi (4 arcs concentriques rotatifs)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13 : Acte 1 — composant `Act1Problem`

**Files:**
- Create: `src/three/acts/Act1Problem.tsx`

- [ ] **Step 1 : Créer l'acte**

```typescript
// src/three/acts/Act1Problem.tsx
// Acte 1 (0:00 → 0:22) : la silhouette marche dans l'obscurité, particules ambient.
// La caméra est immobile, c'est la silhouette qui se déplace de droite à gauche.
// Joué quand la prop `active` est true.

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { Silhouette } from '../components/Silhouette'
import { Particles } from '../components/Particles'

interface Props {
  active: boolean
}

export function Act1Problem({ active }: Props) {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!active || !groupRef.current) return
    // La silhouette part hors-cadre à droite, traverse, s'arrête au centre
    gsap.fromTo(
      groupRef.current.position,
      { x: 5 },
      { x: 0, duration: 18, ease: 'none' }
    )
  }, [active])

  return (
    <group visible={active}>
      <Particles count={500} radius={6} color="#1A3A6B" size={0.015} />
      <group ref={groupRef}>
        <Silhouette position={[0, -1.2, 0]} walking />
      </group>
    </group>
  )
}
```

- [ ] **Step 2 : Tester dans Demo.tsx**

```typescript
import { Act1Problem } from '../../three/acts/Act1Problem'

export function Demo() {
  return (
    <div className="fixed inset-0 text-white overflow-hidden">
      <BackgroundFade mode="black" />
      <DemoScene>
        <Act1Problem active={true} />
      </DemoScene>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <ActText lines={['Sur le terrain.', 'À 6h12.', 'Sans réseau.']} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3 : Vérifier visuellement**

Recharger `/demo`. Expected : la silhouette entre par la droite, traverse l'écran lentement (18s) jusqu'à s'arrêter au centre. Particules sombres en fond. Texte par-dessus.

- [ ] **Step 4 : Commit**

```bash
git add src/three/acts/Act1Problem.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): Acte 1 — silhouette qui traverse + particules sombres

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14 : Acte 2 — composant `Act2Solution`

**Files:**
- Create: `src/three/acts/Act2Solution.tsx`

- [ ] **Step 1 : Créer l'acte**

```typescript
// src/three/acts/Act2Solution.tsx
// Acte 2 (0:22 → 0:50) : zoom sur le téléphone.
// Le phone arrive depuis l'arrière, grossit, change d'écran 3 fois.

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { PhoneMockup } from '../components/PhoneMockup'

interface Props {
  active: boolean
}

// Couleurs des 3 écrans successifs (simulent 3 captures de l'app)
const SCREENS = ['#0C1E5B', '#00A3E0', '#F4F6FA']

export function Act2Solution({ active }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const [screenIdx, setScreenIdx] = useState(0)

  useEffect(() => {
    if (!active || !groupRef.current) return

    // Animation entrée : depuis Z=-5 vers Z=0, scale 0.5 → 1
    gsap.fromTo(
      groupRef.current.position,
      { z: -5 },
      { z: 0, duration: 4, ease: 'power3.out' }
    )
    gsap.fromTo(
      groupRef.current.scale,
      { x: 0.5, y: 0.5, z: 0.5 },
      { x: 1, y: 1, z: 1, duration: 4, ease: 'power3.out' }
    )

    // Bascule des écrans : à 8s, 14s, 20s après le début de l'acte
    const t1 = window.setTimeout(() => setScreenIdx(1), 8000)
    const t2 = window.setTimeout(() => setScreenIdx(2), 14000)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [active])

  return (
    <group visible={active} ref={groupRef}>
      <PhoneMockup screenColor={SCREENS[screenIdx]} floating scale={2.0} />
    </group>
  )
}
```

- [ ] **Step 2 : Tester dans Demo.tsx**

Remplacer Act1 par Act2 :

```typescript
import { Act2Solution } from '../../three/acts/Act2Solution'

// Dans <DemoScene> :
<Act2Solution active={true} />

// Texte :
<ActText lines={['Une réponse.', 'Trois secondes.']} />

// Fond :
<BackgroundFade mode="white" />
```

- [ ] **Step 3 : Vérifier visuellement**

Recharger `/demo`. Expected : le téléphone arrive depuis l'arrière, grossit, écran bleu marine. À 8s écran bleu ciel, à 14s écran clair. Fond blanc.

- [ ] **Step 4 : Commit**

```bash
git add src/three/acts/Act2Solution.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): Acte 2 — phone qui arrive + 3 écrans successifs

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15 : Acte 3 — composant `Act3Coverage`

**Files:**
- Create: `src/three/acts/Act3Coverage.tsx`

- [ ] **Step 1 : Créer l'acte**

```typescript
// src/three/acts/Act3Coverage.tsx
// Acte 3 (0:50 → 1:15) — climax sci-fi.
// Le téléphone disparaît, l'arborescence se déploie depuis le centre.
// HUD en arrière-plan qui tourne. Particules denses.

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { CoverageTree } from '../components/CoverageTree'
import { HUD } from '../components/HUD'
import { Particles } from '../components/Particles'

interface Props {
  active: boolean
}

export function Act3Coverage({ active }: Props) {
  const treeRef = useRef<THREE.Group>(null)
  const hudRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!active || !treeRef.current || !hudRef.current) return

    // Arborescence : scale 0 → 1, durée 4s
    gsap.fromTo(
      treeRef.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 4, ease: 'back.out(1.4)' }
    )

    // HUD : opacité 0 → 1 (via scale, plus simple ici)
    gsap.fromTo(
      hudRef.current.scale,
      { x: 0.7, y: 0.7, z: 0.7 },
      { x: 1, y: 1, z: 1, duration: 6, ease: 'power2.out' }
    )
  }, [active])

  return (
    <group visible={active}>
      <Particles count={1200} radius={5} color="#00A3E0" size={0.015} />
      <group ref={hudRef}>
        <HUD />
      </group>
      <group ref={treeRef}>
        <CoverageTree />
      </group>
    </group>
  )
}
```

- [ ] **Step 2 : Tester dans Demo.tsx**

```typescript
import { Act3Coverage } from '../../three/acts/Act3Coverage'

// Dans <DemoScene> :
<Act3Coverage active={true} />

// Texte :
<ActText lines={['Tout le périmètre.', 'Une seule app.']} />

// Fond :
<BackgroundFade mode="dark-blue" />
```

- [ ] **Step 3 : Vérifier visuellement**

Recharger `/demo`. Expected : l'arborescence se déploie depuis le centre (4s), HUD qui tourne en arrière-plan, particules denses. Fond bleu très sombre.

- [ ] **Step 4 : Commit**

```bash
git add src/three/acts/Act3Coverage.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): Acte 3 — climax sci-fi (arborescence + HUD)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 16 : Acte 4 — composant `Act4Conclusion`

**Files:**
- Create: `src/three/acts/Act4Conclusion.tsx`

- [ ] **Step 1 : Créer l'acte**

```typescript
// src/three/acts/Act4Conclusion.tsx
// Acte 4 (1:15 → 1:30) — conclusion.
// Le téléphone seul au centre, écran clair, fond blanc.
// Logo + URL apparaissent dans un overlay HTML séparé (géré par Demo.tsx).

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { PhoneMockup } from '../components/PhoneMockup'

interface Props {
  active: boolean
}

export function Act4Conclusion({ active }: Props) {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!active || !groupRef.current) return

    // Apparition douce du téléphone
    gsap.fromTo(
      groupRef.current.scale,
      { x: 0.6, y: 0.6, z: 0.6 },
      { x: 1, y: 1, z: 1, duration: 2, ease: 'power2.out' }
    )
  }, [active])

  return (
    <group visible={active} ref={groupRef}>
      <PhoneMockup screenColor="#F4F6FA" floating scale={1.5} />
    </group>
  )
}
```

- [ ] **Step 2 : Tester dans Demo.tsx**

```typescript
import { Act4Conclusion } from '../../three/acts/Act4Conclusion'

// Dans <DemoScene> :
<Act4Conclusion active={true} />

// Texte :
<ActText lines={['Le compagnon.', 'Pas un nouvel outil.']} />

// Fond :
<BackgroundFade mode="white" />
```

- [ ] **Step 3 : Vérifier visuellement**

Recharger `/demo`. Expected : téléphone seul au centre, fond blanc, écran clair. Texte conclusion par-dessus.

- [ ] **Step 4 : Commit**

```bash
git add src/three/acts/Act4Conclusion.tsx src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): Acte 4 — conclusion (phone center + texte)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 17 : Hook timeline `useDemoTimeline`

**Files:**
- Create: `src/pages/Demo/useDemoTimeline.ts`

- [ ] **Step 1 : Créer le hook**

```typescript
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
```

- [ ] **Step 2 : Vérifier que TS compile**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3 : Commit**

```bash
git add src/pages/Demo/useDemoTimeline.ts
git commit -m "$(cat <<'EOF'
feat(demo): hook useDemoTimeline (orchestration 4 actes par RAF)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 18 : `Demo.tsx` final — assemblage timeline + actes + texte + audio

**Files:**
- Modify: `src/pages/Demo/Demo.tsx`

- [ ] **Step 1 : Réécrire Demo.tsx pour assembler tous les actes**

```typescript
// src/pages/Demo/Demo.tsx
// Page principale de la démo : 4 actes joués en séquence, 1m30 au total.
// La timeline est pilotée par useDemoTimeline ; chaque acte est rendu visible/invisible
// selon currentAct. Le texte et le fond changent en fonction de l'acte courant.

import { useEffect, useState } from 'react'
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
  const { currentAct, elapsed, finished, restart } = useDemoTimeline(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Audio policy : navigateur bloque l'autoplay tant que l'user n'a pas cliqué.
  // On affiche un overlay « Cliquez pour démarrer » au premier chargement.
  useEffect(() => {
    const onClick = () => setHasInteracted(true)
    if (!hasInteracted) window.addEventListener('click', onClick, { once: true })
    return () => window.removeEventListener('click', onClick)
  }, [hasInteracted])

  if (!hasInteracted) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center cursor-pointer">
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
```

- [ ] **Step 2 : Lancer le dev server**

Run: `npm run dev`

- [ ] **Step 3 : Tester le parcours complet**

Ouvrir `/demo`. Cliquer pour démarrer.
Expected :
- 0:00-0:22 : fond noir, silhouette qui traverse, texte « Sur le terrain... »
- 0:22-0:50 : fond blanc, téléphone qui arrive, texte « Une réponse... »
- 0:50-1:15 : fond bleu sombre, arborescence qui se déploie, HUD, texte « Tout le périmètre... »
- 1:15-1:30 : fond blanc, téléphone center, texte « Le compagnon... », logo + URL
- À la fin : bouton « Rejouer »

- [ ] **Step 4 : Vérifier le build de production**

Run: `npm run build`
Expected: build OK, pas d'erreur TS, pas de warning bloquant.

- [ ] **Step 5 : Commit**

```bash
git add src/pages/Demo/Demo.tsx
git commit -m "$(cat <<'EOF'
feat(demo): assemblage final de la timeline 4 actes (auto-play 1m30)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 19 : Bump `version.json` + push

**Files:**
- Modify: `public/version.json`

- [ ] **Step 1 : Lire la version actuelle**

```bash
cat public/version.json
```

- [ ] **Step 2 : Incrémenter et écrire la nouvelle version**

Modifier `public/version.json` pour bumper le numéro (ex : `0.9.0` → `0.10.0`). Format :

```json
{
  "v": "0.10.0",
  "date": "2026-04-27"
}
```

(Adapter la valeur exacte selon ce qui était dans le fichier avant.)

- [ ] **Step 3 : Commit + push**

```bash
git add public/version.json
git commit -m "$(cat <<'EOF'
chore(release): bump version pour la démo produit Phase 1

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

- [ ] **Step 4 : Attendre le déploiement GitHub Pages**

Après ~30-60s, ouvrir `https://kit-anomalie.github.io/kit-anomalie/demo` dans le navigateur.
Expected : la démo joue en production exactement comme en dev.

---

## Validation finale Phase 1

À la fin de la Phase 1, on doit avoir :

- [ ] Route `/demo` qui joue automatiquement les 4 actes en 1m30
- [ ] Apparition mot par mot du texte de chaque acte
- [ ] Bascule fluide du fond (noir → blanc → bleu sombre → blanc)
- [ ] Silhouette rim-lit qui traverse en acte 1
- [ ] Téléphone 3D qui arrive et change d'écran en acte 2
- [ ] Arborescence + HUD qui se déploient en acte 3
- [ ] Téléphone center + logo + URL en acte 4
- [ ] Bouton « Rejouer » à la fin
- [ ] Audio joué pour chaque acte (placeholders silencieux pour l'instant)
- [ ] Tout fonctionne en production sur GitHub Pages

## Hors scope (à traiter dans Phase 2 et Phase 3)

- **Phase 2 : Mode interactif** — scroll-driven, hover sur les nœuds de l'arborescence, clic pour zoomer
- **Phase 3 : Capture vidéo** — script Puppeteer + ffmpeg pour exporter en MP4 4K 60fps
- **Polish** :
  - Remplacer la silhouette placeholder par un vrai modèle Mixamo
  - Remplacer le téléphone primitif par un modèle glTF photoréaliste
  - Audio réel (sound design)
  - Voix off (si retenue plus tard)
  - Tweaks de timing par acte selon les retours du premier visionnage
