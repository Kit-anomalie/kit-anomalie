import type { JSX } from 'react'

/**
 * Schémas inline pour quelques anomalies parlantes.
 * Clé = id de l'anomalie. D'autres schémas peuvent être ajoutés au fil de l'eau.
 * Les anomalies sans entrée ici afficheront le placeholder « Illustration à documenter ».
 */

const SVG_STYLES = {
  rail: { fill: '#0C1E5B' },
  soil: { fill: '#9CA3AF' },
  ballast: { fill: '#D1D5DB' },
  measure: { stroke: '#E3051B', strokeWidth: 1.5, fill: 'none' },
  axis: { stroke: '#6B7280', strokeWidth: 1, fill: 'none', strokeDasharray: '3 3' },
  highlight: { fill: '#F7A600' },
  label: { fontFamily: 'system-ui', fontSize: 10, fill: '#0C1E5B' },
} as const

function Usure(): JSX.Element {
  return (
    <svg viewBox="0 0 400 160" role="img" aria-label="Usure ondulatoire du champignon du rail" className="w-full h-auto">
      <rect x="40" y="90" width="320" height="40" style={SVG_STYLES.rail} rx="2" />
      {/* champignon ondulé */}
      <path
        d="M40 90 Q50 78 60 90 Q70 78 80 90 Q90 78 100 90 Q110 78 120 90 Q130 78 140 90 Q150 78 160 90 Q170 78 180 90 Q190 78 200 90 Q210 78 220 90 Q230 78 240 90 Q250 78 260 90 Q270 78 280 90 Q290 78 300 90 Q310 78 320 90 Q330 78 340 90 Q350 78 360 90 L360 90"
        style={{ ...SVG_STYLES.rail, stroke: '#0C1E5B' }}
      />
      <text x="200" y="150" textAnchor="middle" style={SVG_STYLES.label}>Ondulations régulières sur le champignon</text>
    </svg>
  )
}

function Fissure(): JSX.Element {
  return (
    <svg viewBox="0 0 400 160" role="img" aria-label="Fissure transversale de rail" className="w-full h-auto">
      <rect x="40" y="70" width="320" height="50" style={SVG_STYLES.rail} rx="2" />
      {/* fissure */}
      <path d="M220 70 L215 95 L222 120" style={{ stroke: '#E3051B', strokeWidth: 2.5, fill: 'none' }} />
      <circle cx="218" cy="95" r="16" style={{ stroke: '#E3051B', strokeWidth: 1.5, fill: 'none' }} />
      <text x="200" y="145" textAnchor="middle" style={SVG_STYLES.label}>Fissure perpendiculaire à l'axe du rail</text>
    </svg>
  )
}

function Dressage(): JSX.Element {
  return (
    <svg viewBox="0 0 400 180" role="img" aria-label="Écart de dressage avec seuils AL / AR / ALT" className="w-full h-auto">
      {/* axe théorique */}
      <line x1="20" y1="90" x2="380" y2="90" style={SVG_STYLES.axis} />
      {/* rail réel dévié */}
      <path
        d="M20 90 Q140 90 200 110 Q260 130 380 90"
        style={{ stroke: '#0C1E5B', strokeWidth: 4, fill: 'none' }}
      />
      {/* écart marqué */}
      <line x1="200" y1="90" x2="200" y2="110" style={{ stroke: '#E3051B', strokeWidth: 2 }} />
      {/* seuils */}
      <line x1="200" y1="97" x2="240" y2="97" style={{ stroke: '#3AAA35', strokeWidth: 1 }} strokeDasharray="2 2" />
      <line x1="200" y1="104" x2="240" y2="104" style={{ stroke: '#F7A600', strokeWidth: 1 }} strokeDasharray="2 2" />
      <line x1="200" y1="111" x2="240" y2="111" style={{ stroke: '#E3051B', strokeWidth: 1 }} strokeDasharray="2 2" />
      <text x="245" y="100" style={{ ...SVG_STYLES.label, fill: '#3AAA35' }}>AL</text>
      <text x="245" y="107" style={{ ...SVG_STYLES.label, fill: '#F7A600' }}>AR</text>
      <text x="245" y="114" style={{ ...SVG_STYLES.label, fill: '#E3051B' }}>ALT</text>
      <text x="200" y="170" textAnchor="middle" style={SVG_STYLES.label}>Écart latéral mesuré au Mauzin</text>
    </svg>
  )
}

function Soudure(): JSX.Element {
  return (
    <svg viewBox="0 0 400 160" role="img" aria-label="Affaissement de soudure sous règle 1 m" className="w-full h-auto">
      {/* rail avec cuvette */}
      <path
        d="M20 90 L170 90 Q200 108 230 90 L380 90"
        style={{ stroke: '#0C1E5B', strokeWidth: 5, fill: 'none' }}
      />
      {/* règle 1m */}
      <rect x="140" y="80" width="120" height="6" style={SVG_STYLES.highlight} rx="1" />
      <text x="200" y="76" textAnchor="middle" style={SVG_STYLES.label}>Règle 1 m</text>
      {/* flèche cuvette */}
      <line x1="200" y1="92" x2="200" y2="105" style={{ stroke: '#E3051B', strokeWidth: 1.5 }} markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="#E3051B" />
        </marker>
      </defs>
      <text x="215" y="102" style={{ ...SVG_STYLES.label, fill: '#E3051B' }}>affaissement</text>
      <text x="200" y="140" textAnchor="middle" style={SVG_STYLES.label}>Mesure à la cale d'épaisseur</text>
    </svg>
  )
}

function Pointe(): JSX.Element {
  return (
    <svg viewBox="0 0 400 160" role="img" aria-label="Pointe d'aiguille — gabarit d'usure" className="w-full h-auto">
      {/* contre-aiguille */}
      <rect x="40" y="70" width="320" height="16" style={SVG_STYLES.rail} rx="2" />
      {/* aiguille affilée */}
      <path d="M60 100 L340 88 L340 104 Z" style={{ ...SVG_STYLES.rail, fill: '#0C1E5B' }} />
      {/* zone d'usure */}
      <ellipse cx="260" cy="94" rx="45" ry="6" style={{ fill: '#E3051B', opacity: 0.5 }} />
      <text x="260" y="130" textAnchor="middle" style={{ ...SVG_STYLES.label, fill: '#E3051B' }}>zone d'usure</text>
    </svg>
  )
}

function FissureBeton(): JSX.Element {
  return (
    <svg viewBox="0 0 400 180" role="img" aria-label="Fissure béton avec fissuromètre" className="w-full h-auto">
      <rect x="40" y="40" width="320" height="110" style={{ fill: '#D1D5DB' }} rx="2" />
      {/* fissure */}
      <path d="M200 40 L192 80 L206 115 L198 150" style={{ stroke: '#0C1E5B', strokeWidth: 2, fill: 'none' }} />
      {/* fissuromètre */}
      <rect x="175" y="85" width="50" height="20" style={{ fill: '#F7A600', opacity: 0.85 }} rx="2" />
      <text x="200" y="100" textAnchor="middle" style={{ fontSize: 9, fill: '#0C1E5B', fontFamily: 'system-ui' }}>fissuromètre</text>
      <text x="200" y="170" textAnchor="middle" style={SVG_STYLES.label}>Mesure d'ouverture + suivi photo</text>
    </svg>
  )
}

function Talus(): JSX.Element {
  return (
    <svg viewBox="0 0 400 180" role="img" aria-label="Glissement de talus en coupe" className="w-full h-auto">
      {/* rail au sommet */}
      <rect x="20" y="30" width="160" height="8" style={SVG_STYLES.rail} />
      {/* talus */}
      <path d="M20 40 L180 40 L300 150 L20 150 Z" style={{ fill: '#7BA428' }} />
      {/* zone de glissement */}
      <path d="M170 42 Q210 80 240 150" style={{ stroke: '#E3051B', strokeWidth: 2, fill: 'none', strokeDasharray: '4 3' }} />
      {/* crevasses */}
      <path d="M100 42 L100 48" style={{ stroke: '#0C1E5B', strokeWidth: 1.5 }} />
      <path d="M130 42 L130 50" style={{ stroke: '#0C1E5B', strokeWidth: 1.5 }} />
      <text x="250" y="100" style={{ ...SVG_STYLES.label, fill: '#E3051B' }}>plan de rupture</text>
      <text x="60" y="30" style={{ ...SVG_STYLES.label, fontSize: 9 }}>crevasses</text>
    </svg>
  )
}

function DallePN(): JSX.Element {
  return (
    <svg viewBox="0 0 400 160" role="img" aria-label="Dalle PN désaffleurée — règle au rail" className="w-full h-auto">
      {/* dalle */}
      <rect x="40" y="90" width="160" height="20" style={{ fill: '#A8A29E' }} />
      {/* champignon rail surélevé */}
      <rect x="200" y="78" width="40" height="14" style={SVG_STYLES.rail} rx="1" />
      <rect x="210" y="92" width="20" height="20" style={SVG_STYLES.rail} />
      {/* autre côté */}
      <rect x="240" y="90" width="120" height="20" style={{ fill: '#A8A29E' }} />
      {/* règle avec gap */}
      <rect x="140" y="72" width="140" height="4" style={SVG_STYLES.highlight} rx="1" />
      <line x1="170" y1="76" x2="170" y2="90" style={{ stroke: '#E3051B', strokeWidth: 1.5 }} />
      <text x="175" y="86" style={{ ...SVG_STYLES.label, fill: '#E3051B' }}>désaffleurement</text>
      <text x="200" y="140" textAnchor="middle" style={SVG_STYLES.label}>Dénivelé dalle / champignon au PN</text>
    </svg>
  )
}

export const CATALOGUE_SVGS: Record<string, () => JSX.Element> = {
  'vc-rail-01': Usure,
  'vc-rail-02': Fissure,
  'vc-geo-01': Dressage,
  'vc-soud-01': Soudure,
  'adv-aig-01': Pointe,
  'oa-pont-01': FissureBeton,
  'ab-tal-01': Talus,
  'pla-pn-01': DallePN,
}

export function getCatalogueSvg(anoId: string): (() => JSX.Element) | null {
  return CATALOGUE_SVGS[anoId] ?? null
}
