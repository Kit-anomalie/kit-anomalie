// src/three/components/Silhouette.tsx
// Silhouette humaine stylisée : tête, torse, jambes, sac, casque.
// Placeholder en formes primitives en attendant un modèle Mixamo glTF.
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
