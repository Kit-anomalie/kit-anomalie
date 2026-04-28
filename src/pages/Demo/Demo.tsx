// src/pages/Demo/Demo.tsx
// Page principale de la démo produit.
// Joue automatiquement les 4 actes en 1m30, plein écran, fond noir.

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
