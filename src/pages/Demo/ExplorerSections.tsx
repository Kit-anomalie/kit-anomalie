// src/pages/Demo/ExplorerSections.tsx
// Les 4 sections scrollables du mode explorer.
// Chaque section occupe ~100vh, contient un overlay HTML interactif (texte + boutons)
// et déclenche l'affichage de l'acte 3D correspondant en arrière-plan via IntersectionObserver.

import { Link } from 'react-router-dom'
import type { ActId } from '../../data/demoContent'

interface Props {
  /** Callback ref par index : à appeler avec ref={setSectionRef(0)} sur chaque section */
  setSectionRef: (index: number) => (el: HTMLDivElement | null) => void
  /** Acte courant pour adapter les transitions */
  currentAct: ActId | null
}

export function ExplorerSections({ setSectionRef, currentAct }: Props) {
  return (
    <div>
      <Section1Terrain setRef={setSectionRef(0)} />
      <Section2Kit setRef={setSectionRef(1)} />
      <Section3Couverture setRef={setSectionRef(2)} active={currentAct === 'act3'} />
      <Section4Conclusion setRef={setSectionRef(3)} />
    </div>
  )
}

type SetRef = (el: HTMLDivElement | null) => void

// =====================================================
// Section 1 — Le terrain
// =====================================================
const Section1Terrain = ({ setRef }: { setRef: SetRef }) => (
  <section
    ref={setRef}
    className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-white"
  >
    <p className="text-xs uppercase tracking-widest opacity-60 mb-3">Acte 1 · Le terrain</p>
    <h2 className="text-4xl md:text-6xl font-light tracking-tight text-center max-w-2xl">
      Sur le terrain. À 6h12. Sans réseau.
    </h2>
    <p className="mt-6 text-base opacity-80 max-w-md text-center leading-relaxed">
      Des milliers d'agents travaillent chaque jour sur des sites sans connectivité,
      avec des gants, dans le bruit, sous pression. Les outils métier classiques
      n'arrivent pas jusqu'à eux.
    </p>
    <p className="mt-12 text-xs opacity-50 animate-pulse">↓ Scroll pour découvrir</p>
  </section>
)

// =====================================================
// Section 2 — Le kit sauve : 3 boutons vers les vraies briques
// =====================================================
const Section2Kit = ({ setRef }: { setRef: SetRef }) => (
  <section
    ref={setRef}
    className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-sncf-dark"
  >
    <p className="text-xs uppercase tracking-widest opacity-60 mb-3">Acte 2 · Le kit</p>
    <h2 className="text-4xl md:text-6xl font-light tracking-tight text-center max-w-2xl">
      Une réponse. Trois secondes.
    </h2>
    <p className="mt-6 text-base opacity-80 max-w-md text-center leading-relaxed">
      Le kit accompagne l'agent : guides pas-à-pas par appli, fiches mémo réflexes,
      catalogue des anomalies. Tout fonctionne offline.
    </p>

    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl">
      <Link
        to="/guides"
        className="bg-white border border-sncf-dark/15 rounded-2xl p-5 text-left hover:border-sncf-dark/40 transition shadow-sm"
      >
        <span className="text-3xl block mb-2">📖</span>
        <span className="font-semibold block">Voir un guide</span>
        <span className="text-xs text-gray-600">Pas à pas par appli</span>
      </Link>
      <Link
        to="/fiches"
        className="bg-white border border-sncf-dark/15 rounded-2xl p-5 text-left hover:border-sncf-dark/40 transition shadow-sm"
      >
        <span className="text-3xl block mb-2">📋</span>
        <span className="font-semibold block">Voir une fiche</span>
        <span className="text-xs text-gray-600">L'essentiel en un clin d'œil</span>
      </Link>
      <Link
        to="/catalogue"
        className="bg-white border border-sncf-dark/15 rounded-2xl p-5 text-left hover:border-sncf-dark/40 transition shadow-sm"
      >
        <span className="text-3xl block mb-2">📚</span>
        <span className="font-semibold block">Catalogue</span>
        <span className="text-xs text-gray-600">Anomalies par actif</span>
      </Link>
    </div>
  </section>
)

// =====================================================
// Section 3 — Couverture : légende des catégories
// =====================================================
const Section3Couverture = ({ setRef, active }: { setRef: SetRef; active: boolean }) => (
  <section
    ref={setRef}
    className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-white"
  >
    <p className="text-xs uppercase tracking-widest opacity-60 mb-3">Acte 3 · Couverture</p>
    <h2 className="text-4xl md:text-6xl font-light tracking-tight text-center max-w-2xl">
      Tout le périmètre. Une seule app.
    </h2>
    <p className="mt-6 text-base opacity-80 max-w-md text-center leading-relaxed">
      3 rôles · 5 spécialités · 6 catégories d'anomalies · des dizaines de fiches
      réflexes. Chaque agent voit ce qui le concerne.
    </p>

    <div
      className={`mt-12 grid grid-cols-2 md:grid-cols-3 gap-2 max-w-xl text-xs transition-opacity duration-700 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {[
        { color: '#7AB8E0', label: 'Voie courante' },
        { color: '#0C1E5B', label: 'Appareils de voie' },
        { color: '#3AAA35', label: 'Ouvrages & Gabarit' },
        { color: '#A85D3F', label: 'Abords' },
        { color: '#F7A600', label: 'Signalisation' },
        { color: '#475569', label: 'Platelage' },
      ].map((cat) => (
        <div key={cat.label} className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
          <span className="font-medium">{cat.label}</span>
        </div>
      ))}
    </div>

    <Link
      to="/glossaire"
      className="mt-10 px-5 py-2.5 bg-sncf-blue text-white rounded-full text-sm font-semibold hover:bg-sncf-blue/90 transition"
    >
      🔤 Découvrir le glossaire
    </Link>
  </section>
)

// =====================================================
// Section 4 — Conclusion : CTA fort vers le vrai kit
// =====================================================
const Section4Conclusion = ({ setRef }: { setRef: SetRef }) => (
  <section
    ref={setRef}
    className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-sncf-dark"
  >
    <p className="text-xs uppercase tracking-widest opacity-60 mb-3">Acte 4 · Conclusion</p>
    <h2 className="text-4xl md:text-6xl font-light tracking-tight text-center max-w-2xl">
      Le compagnon. Pas un nouvel outil.
    </h2>
    <p className="mt-6 text-base opacity-80 max-w-md text-center leading-relaxed">
      Le Kit Anomalie n'a pas vocation à remplacer les applis métier existantes.
      Il les rend utilisables sur le terrain.
    </p>

    <div className="mt-10 flex flex-col md:flex-row gap-3">
      <Link
        to="/"
        className="px-6 py-3 bg-sncf-dark text-white rounded-full font-semibold text-center hover:bg-sncf-dark/90 transition"
      >
        🏠 Démarrer le kit
      </Link>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="px-6 py-3 bg-white border border-sncf-dark/20 text-sncf-dark rounded-full font-semibold text-center hover:border-sncf-dark/40 transition"
      >
        ↑ Revoir la démo
      </button>
    </div>

    <p className="mt-12 text-xs opacity-50">
      Kit Anomalie · kit-anomalie.github.io
    </p>
  </section>
)
