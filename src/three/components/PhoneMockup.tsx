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
