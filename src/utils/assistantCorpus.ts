// Construit le corpus de recherche unifié pour l'assistant.
// Aplatit catalogue + fiches + guides + tips dans une liste de "chunks"
// recherchables par Fuse.js.

import type { FicheMemo, Guide, CatalogueCategorie } from '../types'
import { CLASSEMENT_LABELS } from '../types'

export type CorpusSource = 'catalogue' | 'fiche' | 'guide' | 'tip'

export interface CorpusItem {
  id: string
  source: CorpusSource
  sourceLabel: string
  title: string
  excerpt: string
  searchableText: string
  badges: string[]
  link: string
}

interface BuildArgs {
  categories: CatalogueCategorie[]
  fiches: FicheMemo[]
  guides: Guide[]
  tips: { id: string; texte: string }[]
}

export function buildAssistantCorpus({ categories, fiches, guides, tips }: BuildArgs): CorpusItem[] {
  const items: CorpusItem[] = []

  // ── Catalogue : 1 entrée par anomalie ──
  for (const cat of categories) {
    for (const type of cat.types) {
      for (const ano of type.anomalies) {
        const classements = ano.classements
          .map((c) => `${c.classement} ${CLASSEMENT_LABELS[c.classement]} ${c.condition ?? ''} ${c.action}`)
          .join(' · ')

        const excerpt = [ano.description, ano.defaut, ano.ecart].filter(Boolean).join(' — ')

        items.push({
          id: `catalogue:${ano.id}`,
          source: 'catalogue',
          sourceLabel: `Catalogue · ${cat.nom} › ${type.nom}`,
          title: ano.name,
          excerpt,
          searchableText: [
            ano.code,
            ano.name,
            ano.description,
            ano.defaut,
            ano.ecart,
            classements,
            cat.nom,
            type.nom,
            ano.reference ?? '',
          ].join(' '),
          badges: [
            ano.code,
            ...ano.classements.map((c) => c.classement),
          ],
          link: `/catalogue/${cat.id}/${type.id}/${ano.id}`,
        })
      }
    }
  }

  // ── Fiches mémo ──
  for (const fiche of fiches) {
    items.push({
      id: `fiche:${fiche.id}`,
      source: 'fiche',
      sourceLabel: 'Fiche mémo',
      title: fiche.titre,
      excerpt: fiche.quoiFaire,
      searchableText: [
        fiche.titre,
        fiche.quoiFaire,
        fiche.comment,
        ...fiche.gestesCles,
        ...fiche.erreursAEviter,
        fiche.referentiel ?? '',
      ].join(' '),
      badges: fiche.referentiel ? [fiche.referentiel] : [],
      link: `/fiches/${fiche.id}`,
    })
  }

  // ── Guides ──
  for (const guide of guides) {
    const stepsSummary = guide.etapes
      .map((s) => `${s.titre}: ${s.action}`)
      .join(' · ')

    items.push({
      id: `guide:${guide.id}`,
      source: 'guide',
      sourceLabel: `Guide · ${guide.appliMetier}`,
      title: guide.titre,
      excerpt: `${guide.gesteMetier}. ${guide.etapes.length} étapes.`,
      searchableText: [
        guide.titre,
        guide.gesteMetier,
        guide.appliMetier,
        stepsSummary,
        ...(guide.bonnesPratiques ?? []),
        guide.referentiel ?? '',
      ].join(' '),
      badges: [
        guide.appliMetier,
        `${guide.etapes.length} étapes`,
        ...(guide.referentiel ? [guide.referentiel] : []),
      ],
      link: `/guides/${guide.id}`,
    })
  }

  // ── Tips (conseils) — corpus secondaire ──
  for (const tip of tips) {
    items.push({
      id: `tip:${tip.id}`,
      source: 'tip',
      sourceLabel: 'Conseil',
      title: 'Conseil pratique',
      excerpt: tip.texte,
      searchableText: tip.texte,
      badges: [],
      link: '/',
    })
  }

  return items
}

// Suggestions de questions courantes — affichées quand l'input est vide
export const ASSISTANT_SUGGESTIONS: string[] = [
  'Que signifie S/I ?',
  'Comment éviter les doublons',
  'C\'est quoi la DLF',
  'Comment classer une anomalie',
  'Comment décrire une anomalie',
  'Différence A/SURV et A/DET',
  'C\'est quoi MPC',
]
