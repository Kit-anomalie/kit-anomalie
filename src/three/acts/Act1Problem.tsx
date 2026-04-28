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
