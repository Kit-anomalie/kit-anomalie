// src/three/DemoScene.tsx
// Canvas R3F qui sert de container pour les 4 actes.
// Setup global : caméra, lights, pointer-events désactivés pour laisser passer les overlays.

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
