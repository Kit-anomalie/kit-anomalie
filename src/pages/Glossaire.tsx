// src/pages/Glossaire.tsx
// Page glossaire : liste alphabétique de tous les sigles et termes du kit,
// avec barre de recherche fuzzy (Fuse.js) et accordéon pour le détail.

import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { useEditorStore } from '../stores/editorStore'
import type { GlossaireTerme } from '../types'

/** Compare deux termes pour le tri alphabétique (insensible à la casse + accents) */
function compareTermes(a: GlossaireTerme, b: GlossaireTerme): number {
  return a.terme.localeCompare(b.terme, 'fr', { sensitivity: 'base' })
}

export function Glossaire() {
  const glossaire = useEditorStore((s) => s.glossaire ?? [])
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  // Tri alphabétique fixe
  const sorted = useMemo(() => [...glossaire].sort(compareTermes), [glossaire])

  // Index Fuse.js — recréé seulement si la liste change
  const fuse = useMemo(
    () =>
      new Fuse(sorted, {
        keys: [
          { name: 'terme', weight: 0.5 },
          { name: 'definition', weight: 0.3 },
          { name: 'synonymes', weight: 0.2 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [sorted]
  )

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return sorted
    return fuse.search(q).map((r) => r.item)
  }, [query, fuse, sorted])

  return (
    <div className="px-4 pt-4 pb-24 max-w-md mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-sncf-dark mb-1">🔤 Glossaire</h1>
        <p className="text-sm text-gray-600">
          Sigles et termes métier utilisés dans le kit.
        </p>
      </header>

      {/* Barre de recherche */}
      <div className="sticky top-0 -mx-4 px-4 pt-2 pb-3 bg-gradient-to-b from-white to-white/95 backdrop-blur z-10">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un sigle ou un terme…"
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-sncf-blue"
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-12 text-sm">
          {query ? 'Aucun terme ne correspond à ta recherche.' : 'Le glossaire est vide.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2 mt-2">
          {filtered.map((t) => {
            const isOpen = openId === t.id
            return (
              <li
                key={t.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : t.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-3 flex items-start gap-3 active:bg-gray-50"
                >
                  <span className="font-bold text-sncf-dark text-base flex-shrink-0 min-w-[3.5rem]">
                    {t.terme}
                  </span>
                  <span className="text-sm text-gray-700 flex-1">
                    {t.definition}
                  </span>
                  {t.description && (
                    <span className="text-gray-400 text-sm flex-shrink-0" aria-hidden="true">
                      {isOpen ? '▴' : '▾'}
                    </span>
                  )}
                </button>
                {isOpen && t.description && (
                  <div className="px-3 pb-3 pt-0 border-t border-gray-100 text-sm text-gray-700 leading-relaxed">
                    {t.description}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        {filtered.length} {filtered.length > 1 ? 'termes' : 'terme'}
        {query && ` sur ${sorted.length}`}
      </p>
    </div>
  )
}
