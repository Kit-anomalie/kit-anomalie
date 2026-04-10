import { useParams, useNavigate } from 'react-router-dom'
import { FICHES_MEMO } from '../data/fiches'
import { useEditorStore } from '../stores/editorStore'

export function FicheDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const customFiches = useEditorStore(s => s.fiches)
  const fiche = [...FICHES_MEMO, ...customFiches].find(f => f.id === id)

  if (!fiche) return (
    <div className="p-4 text-center text-gray-500 space-y-3">
      <p>Fiche non trouvée</p>
      <button onClick={() => navigate('/fiches')} className="text-sncf-blue text-sm font-medium">← Retour aux fiches</button>
    </div>
  )

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <button onClick={() => navigate(-1)} className="text-sncf-blue text-sm flex items-center gap-1">
        ← Retour
      </button>

      <div>
        <h1 className="text-lg font-bold text-sncf-dark">{fiche.titre}</h1>
        {fiche.referentiel && (
          <span className="inline-block mt-1 text-[11px] bg-sncf-blue/10 text-sncf-blue px-2 py-0.5 rounded-full font-medium">
            Réf. {fiche.referentiel}
          </span>
        )}
      </div>

      {/* Quoi faire */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h2 className="text-xs font-bold text-sncf-dark uppercase tracking-wide mb-2">Quoi faire</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{fiche.quoiFaire}</p>
      </div>

      {/* Comment */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h2 className="text-xs font-bold text-sncf-dark uppercase tracking-wide mb-2">Comment</h2>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {fiche.comment.split('\n').map((line, i) => {
            // Bold markdown
            const parts = line.split(/(\*\*.*?\*\*)/g)
            return (
              <div key={i} className={line.startsWith('•') || line.startsWith('   •') ? 'ml-2' : ''}>
                {parts.map((part, j) =>
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={j} className="text-sncf-dark">{part.slice(2, -2)}</strong>
                    : <span key={j}>{part}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Erreurs à éviter */}
      <div className="bg-red-50 rounded-2xl p-4 border border-sncf-red/20">
        <h2 className="text-xs font-bold text-sncf-red uppercase tracking-wide mb-2">Erreurs à éviter</h2>
        <div className="space-y-2">
          {fiche.erreursAEviter.map((erreur, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sncf-red text-sm mt-0.5">✕</span>
              <p className="text-sm text-gray-700">{erreur}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lien vers le guide */}
      {fiche.guideAssocie && (
        <button
          onClick={() => navigate(`/guides/${fiche.guideAssocie}`)}
          className="w-full py-3 rounded-2xl bg-sncf-blue/10 text-sncf-blue font-medium text-sm active:scale-[0.98] transition-transform"
        >
          Voir le guide pas à pas →
        </button>
      )}
    </div>
  )
}
