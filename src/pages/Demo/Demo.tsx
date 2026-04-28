// src/pages/Demo/Demo.tsx
// Page principale de la démo produit.
// Joue automatiquement les 4 actes en 1m30, plein écran, fond noir.

export function Demo() {
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-2xl">Démo — squelette</p>
      </div>
    </div>
  )
}
