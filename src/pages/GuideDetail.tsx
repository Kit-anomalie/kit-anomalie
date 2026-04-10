import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GUIDES } from '../data/guides'
import { useEditorStore } from '../stores/editorStore'

export function GuideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const customGuides = useEditorStore(s => s.guides)
  const guide = [...GUIDES, ...customGuides].find(g => g.id === id)
  const [currentStep, setCurrentStep] = useState(0)

  if (!guide) return (
    <div className="p-4 text-center text-gray-500 space-y-3">
      <p>Guide non trouvé</p>
      <button onClick={() => navigate('/guides')} className="text-sncf-blue text-sm font-medium">← Retour aux guides</button>
    </div>
  )

  const safeStep = Math.min(Math.max(0, currentStep), guide.etapes.length - 1)
  const etape = guide.etapes[safeStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === guide.etapes.length - 1

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <button onClick={() => navigate(-1)} className="text-sncf-blue text-sm flex items-center gap-1">
        ← Retour
      </button>

      <div>
        <h1 className="text-lg font-bold text-sncf-dark">{guide.titre}</h1>
        {guide.referentiel && (
          <span className="inline-block mt-1 text-[11px] bg-sncf-blue/10 text-sncf-blue px-2 py-0.5 rounded-full font-medium">
            Réf. {guide.referentiel}
          </span>
        )}
      </div>

      {/* Progression */}
      <div className="flex items-center gap-1">
        {guide.etapes.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= currentStep ? 'bg-sncf-blue' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-gray-400 text-center">
        Étape {currentStep + 1} / {guide.etapes.length}
      </div>

      {/* Étape courante */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sncf-blue rounded-xl flex items-center justify-center text-white font-bold text-sm">
            {etape.numero}
          </div>
          <h2 className="font-bold text-sncf-dark">{etape.titre}</h2>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{etape.action}</p>

        {/* Champs à remplir */}
        {etape.champsARemplir && etape.champsARemplir.length > 0 && (
          <div className="bg-sncf-blue/5 rounded-xl p-3">
            <div className="text-[11px] font-bold text-sncf-blue uppercase tracking-wide mb-1">Champs à remplir</div>
            {etape.champsARemplir.map((champ, i) => (
              <div key={i} className="text-xs text-gray-700 flex items-center gap-1.5 mt-1">
                <span className="text-sncf-blue">→</span> {champ}
              </div>
            ))}
          </div>
        )}

        {/* Erreurs fréquentes */}
        {etape.erreursFrequentes && etape.erreursFrequentes.length > 0 && (
          <div className="bg-sncf-orange/5 rounded-xl p-3">
            <div className="text-[11px] font-bold text-sncf-orange uppercase tracking-wide mb-1">Attention</div>
            {etape.erreursFrequentes.map((err, i) => (
              <div key={i} className="text-xs text-gray-700 flex items-start gap-1.5 mt-1">
                <span className="text-sncf-orange mt-0.5">⚠</span> {err}
              </div>
            ))}
          </div>
        )}

        {/* Référentiel */}
        {etape.referentiel && (
          <div className="text-[11px] bg-sncf-blue/10 text-sncf-blue px-2 py-1 rounded-full inline-block font-medium">
            Réf. {etape.referentiel}
          </div>
        )}
      </div>

      {/* Navigation étapes */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(s => s - 1)}
          disabled={isFirst}
          className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-transform ${
            isFirst
              ? 'bg-gray-100 text-gray-300'
              : 'bg-gray-100 text-sncf-dark active:scale-[0.98]'
          }`}
        >
          ← Précédent
        </button>
        <button
          onClick={() => isLast ? navigate(-1) : setCurrentStep(s => s + 1)}
          className="flex-1 py-3 rounded-2xl font-bold text-white bg-sncf-blue active:scale-[0.98] transition-transform text-sm"
        >
          {isLast ? 'Terminer ✓' : 'Suivant →'}
        </button>
      </div>
    </div>
  )
}
