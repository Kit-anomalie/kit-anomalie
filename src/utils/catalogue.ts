import type { CatalogueAnomalie, Classement, CatalogueCategorie } from '../types'
import { CLASSEMENT_SEVERITE } from '../types'

/** Classement principal d'une anomalie = le plus sévère de ses entrées. */
export function mainClassement(anomalie: CatalogueAnomalie): Classement | null {
  if (anomalie.classements.length === 0) return null
  return anomalie.classements
    .map(e => e.classement)
    .sort((a, b) => CLASSEMENT_SEVERITE[b] - CLASSEMENT_SEVERITE[a])[0]
}

/** Groupe "famille" du classement (securite / surveillance / autres) pour les filtres liste. */
export type FamilleFiltre = 'tous' | 'securite' | 'surveillance' | 'autres'

export function familleClassement(c: Classement): FamilleFiltre {
  if (c === 'S/I' || c === 'S/DP') return 'securite'
  if (c === 'A/SURV') return 'surveillance'
  return 'autres'
}

/** Vrai si au moins un classement de l'anomalie matche le filtre. */
export function matchesFamille(anomalie: CatalogueAnomalie, filtre: FamilleFiltre): boolean {
  if (filtre === 'tous') return true
  return anomalie.classements.some(e => familleClassement(e.classement) === filtre)
}

/** Mix de classements (pour les mini-barres sur la liste des types d'actifs). */
export function mixClassements(anomalies: CatalogueAnomalie[]): { securite: number; surveillance: number; autres: number } {
  const mix = { securite: 0, surveillance: 0, autres: 0 }
  for (const a of anomalies) {
    const main = mainClassement(a)
    if (!main) continue
    const f = familleClassement(main)
    if (f === 'securite') mix.securite++
    else if (f === 'surveillance') mix.surveillance++
    else mix.autres++
  }
  return mix
}

/** Résultat de recherche groupé par catégorie. */
export interface SearchResult {
  categorie: CatalogueCategorie
  matches: { typeActifId: string; typeActifNom: string; anomalie: CatalogueAnomalie }[]
}

/** Recherche locale sur code, nom, description, défaut, type d'actif, catégorie. */
export function searchCatalogue(categories: CatalogueCategorie[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results: SearchResult[] = []

  for (const cat of categories) {
    const matches: SearchResult['matches'] = []
    for (const type of cat.types) {
      for (const ano of type.anomalies) {
        const hay = [
          ano.code, ano.name, ano.description, ano.defaut, ano.ecart,
          type.nom, cat.nom,
        ].join(' ').toLowerCase()
        if (hay.includes(q)) {
          matches.push({ typeActifId: type.id, typeActifNom: type.nom, anomalie: ano })
        }
      }
    }
    if (matches.length > 0) {
      results.push({ categorie: cat, matches })
    }
  }

  return results
}

export function totalAnomalies(cat: CatalogueCategorie): number {
  return cat.types.reduce((sum, t) => sum + t.anomalies.length, 0)
}
