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
