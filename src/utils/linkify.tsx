import type { ReactNode } from 'react'

// URLs http/https simples. Capture jusqu'au prochain espace/balise.
const URL_REGEX = /(https?:\/\/[^\s<]+)/g

// Ponctuation souvent accolée à la fin d'une URL en français (point, virgule, parenthèse...)
const TRAILING_PUNCT = /[.,;:!?)\]]+$/

/**
 * Transforme les URLs d'un texte en liens cliquables (target="_blank").
 * Usage : `{linkify(etape.action)}` dans un JSX.
 * Zéro dépendance, un seul regex, strip de la ponctuation finale.
 */
export function linkify(text: string | undefined | null): ReactNode {
  if (!text) return text ?? ''
  const parts = text.split(URL_REGEX)
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      const match = part.match(TRAILING_PUNCT)
      const trailing = match ? match[0] : ''
      const url = trailing ? part.slice(0, -trailing.length) : part
      return (
        <span key={i}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sncf-blue underline underline-offset-2 break-all"
          >
            {url}
          </a>
          {trailing}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}
