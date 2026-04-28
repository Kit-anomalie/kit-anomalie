// src/three/components/Particles.tsx
// Champ de particules 3D, rotation lente. Utilisé en ambient pour les actes 1 et 3.
// Les particules sont réparties dans une sphère de rayon configurable.

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  count?: number
  radius?: number
  color?: string
  size?: number
}

// Génère un tableau de positions sphériques. Sorti du composant pour rester pure
// au sens React (Math.random est interdit pendant le render mais autorisé dans
// l'initialiseur de useState, qui ne s'exécute qu'une fois).
function generateSpherePositions(count: number, radius: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = Math.cbrt(Math.random()) * radius
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    arr[i * 3 + 2] = r * Math.cos(phi)
  }
  return arr
}

export function Particles({
  count = 800,
  radius = 8,
  color = '#00A3E0',
  size = 0.02,
}: Props) {
  const pointsRef = useRef<THREE.Points>(null)

  // Génère les positions une seule fois au mount (l'initialiseur de useState
  // peut contenir des effets impurs comme Math.random).
  const [positions] = useState(() => generateSpherePositions(count, radius))

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
