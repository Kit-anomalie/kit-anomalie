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

    // Bascule des écrans : à 8s, 14s après le début de l'acte
    const t1 = window.setTimeout(() => setScreenIdx(1), 8000)
    const t2 = window.setTimeout(() => setScreenIdx(2), 14000)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      setScreenIdx(0)
    }
  }, [active])

  return (
    <group visible={active} ref={groupRef}>
      <PhoneMockup screenColor={SCREENS[screenIdx]} floating scale={2.0} />
    </group>
  )
}
