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

    // HUD : scale 0.7 → 1
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
