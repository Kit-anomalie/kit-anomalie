// src/components/demo/BackgroundFade.tsx
// Fond plein écran qui bascule entre noir, blanc et sombre selon l'acte.
// Utilisé en arrière-plan de la scène 3D.

export type BgMode = 'black' | 'white' | 'dark-blue'

const BG_COLORS: Record<BgMode, string> = {
  black: '#000000',
  white: '#FFFFFF',
  // Bleu très sombre pour l'ambiance sci-fi de l'acte 3
  'dark-blue': '#04061A',
}

interface Props {
  mode: BgMode
  /** Durée de la transition en secondes */
  transitionDuration?: number
}

export function BackgroundFade({ mode, transitionDuration = 1.5 }: Props) {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        backgroundColor: BG_COLORS[mode],
        transition: `background-color ${transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    />
  )
}
