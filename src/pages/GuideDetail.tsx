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
    <div className="p-4 text-center text-gray-500 space-y-3 spring-enter">
      <p>Guide non trouve</p>
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
      <button onClick={() => navigate(-1)} className="text-sncf-blue text-sm flex items-center gap-1 spring-enter active:opacity-60 transition-opacity">
        ← Retour
      </button>

      <div className="spring-enter" style={{ animationDelay: '50ms' }}>
        <h1 className="text-lg font-bold text-sncf-dark">{guide.titre}</h1>
        {guide.referentiel && (
          <span className="inline-block mt-1 text-[11px] bg-sncf-blue/10 text-sncf-blue px-2 py-0.5 rounded-full font-medium">
            Ref. {guide.referentiel}
          </span>
        )}
      </div>

      {/* Progression — barre animee */}
      <div className="flex items-center gap-1 spring-enter" style={{ animationDelay: '100ms' }}>
        {guide.etapes.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-400 ${
              i <= currentStep ? 'bg-sncf-blue' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-gray-400 text-center">
        Etape {currentStep + 1} / {guide.etapes.length}
      </div>

      {/* Etape courante — key force le re-render avec animation */}
      <div
        key={`step-${currentStep}`}
        className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3 slide-right"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sncf-blue rounded-xl flex items-center justify-center text-white font-bold text-sm spring-pop">
            {etape.numero}
          </div>
          <h2 className="font-bold text-sncf-dark">{etape.titre}</h2>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{etape.action}</p>

        {/* Champs a remplir */}
        {etape.champsARemplir && etape.champsARemplir.length > 0 && (
          <div className="bg-sncf-blue/5 rounded-xl p-3 spring-scale" style={{ animationDelay: '150ms' }}>
            <div className="text-[11px] font-bold text-sncf-blue uppercase tracking-wide mb-1">Champs a remplir</div>
            {etape.champsARemplir.map((champ, i) => (
              <div key={i} className="text-xs text-gray-700 flex items-center gap-1.5 mt-1">
                <span className="text-sncf-blue">→</span> {champ}
              </div>
            ))}
          </div>
        )}

        {/* Erreurs frequentes */}
        {etape.erreursFrequentes && etape.erreursFrequentes.length > 0 && (
          <div className="bg-sncf-orange/5 rounded-xl p-3 spring-scale" style={{ animationDelay: '250ms' }}>
            <div className="text-[11px] font-bold text-sncf-orange uppercase tracking-wide mb-1">Attention</div>
            {etape.erreursFrequentes.map((err, i) => (
              <div key={i} className="text-xs text-gray-700 flex items-start gap-1.5 mt-1">
                <span className="text-sncf-orange mt-0.5">⚠</span> {err}
              </div>
            ))}
          </div>
        )}

        {/* Referentiel */}
        {etape.referentiel && (
          <div className="text-[11px] bg-sncf-blue/10 text-sncf-blue px-2 py-1 rounded-full inline-block font-medium">
            Ref. {etape.referentiel}
          </div>
        )}
      </div>

      {/* Navigation etapes */}
      <div className="flex gap-3 spring-enter" style={{ animationDelay: '150ms' }}>
        <button
          onClick={() => setCurrentStep(s => s - 1)}
          disabled={isFirst}
          className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
            isFirst
              ? 'bg-gray-100 text-gray-300'
              : 'bg-gray-100 text-sncf-dark active:scale-[0.97]'
          }`}
        >
          ← Precedent
        </button>
        <button
          onClick={() => isLast ? navigate(-1) : setCurrentStep(s => s + 1)}
          className="flex-1 py-3 rounded-2xl font-bold text-white bg-sncf-blue active:scale-[0.97] transition-transform duration-200 text-sm"
        >
          {isLast ? 'Terminer ✓' : 'Suivant →'}
        </button>
      </div>
    </div>
  )
}
