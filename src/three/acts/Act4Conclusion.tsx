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
