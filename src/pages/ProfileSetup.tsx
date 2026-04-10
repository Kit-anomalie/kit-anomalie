import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'
import type { Role, Specialite } from '../types'
import { ROLE_DESCRIPTIONS, ROLE_ICONS, SPECIALITE_ICONS, getApplisBySpecialite } from '../data/roles'

type SetupStep = 'role' | 'specialite'

export function ProfileSetup() {
  const navigate = useNavigate()
  const { role, setRole, setSpecialite, completeSetup } = useProfileStore()
  const [step, setStep] = useState<SetupStep>('role')

  const handleRoleSelect = (r: Role) => {
    setRole(r)
    setStep('specialite')
  }

  const handleSpecialiteSelect = (s: Specialite) => {
    setSpecialite(s)
    completeSetup()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      {/* Logo et titre */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-sncf-dark rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-sncf-blue">KA</span>
        </div>
        <h1 className="text-2xl font-bold text-sncf-dark">Kit Anomalie</h1>
        <p className="text-sm text-gray-500 mt-1">Les bons reflexes anomalie, dans la poche</p>
      </div>

      {/* Indicateur d'etapes */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(['role', 'specialite'] as SetupStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step === s ? 'bg-sncf-blue text-white' :
              (['role', 'specialite'].indexOf(step) > i) ? 'bg-sncf-green text-white' :
              'bg-gray-200 text-gray-400'
            }`}>
              {(['role', 'specialite'].indexOf(step) > i) ? '✓' : i + 1}
            </div>
            {i < 1 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Etape 1 : Role */}
      {step === 'role' && (
        <div>
          <h2 className="text-lg font-bold text-sncf-dark mb-1">Quel est votre role ?</h2>
          <p className="text-sm text-gray-500 mb-4">Cela personnalise le contenu du kit</p>
          <div className="space-y-3">
            {(Object.keys(ROLE_LABELS) as Role[]).map(r => (
              <button
                key={r}
                onClick={() => handleRoleSelect(r)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                  role === r
                    ? 'border-sncf-blue bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ROLE_ICONS[r]}</span>
                  <div>
                    <div className="font-semibold text-sncf-dark">{ROLE_LABELS[r]}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{ROLE_DESCRIPTIONS[r]}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Etape 2 : Specialite */}
      {step === 'specialite' && (
        <div>
          <button onClick={() => setStep('role')} className="text-sncf-blue text-sm mb-4 flex items-center gap-1">
            ← Retour
          </button>
          <h2 className="text-lg font-bold text-sncf-dark mb-1">Votre specialite</h2>
          <p className="text-sm text-gray-500 mb-4">Determine les guides et fiches disponibles</p>
          <div className="space-y-3">
            {(Object.keys(SPECIALITE_LABELS) as Specialite[]).map(s => (
              <button
                key={s}
                onClick={() => handleSpecialiteSelect(s)}
                className="w-full text-left p-4 rounded-2xl border-2 border-gray-200 bg-white transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{SPECIALITE_ICONS[s]}</span>
                  <div>
                    <div className="font-semibold text-sncf-dark">{SPECIALITE_LABELS[s]}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {getApplisBySpecialite(s, role).map(a => a.nom).join(' · ')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
