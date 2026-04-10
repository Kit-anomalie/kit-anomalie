import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'
import type { Role, Specialite } from '../types'
import { ROLE_DESCRIPTIONS, ROLE_ICONS, SPECIALITE_ICONS, getApplisBySpecialite } from '../data/roles'

type SetupStep = 'role' | 'specialite' | 'applis'

export function ProfileSetup() {
  const navigate = useNavigate()
  const { role, specialite, applisMetier, setRole, setSpecialite, toggleAppli, completeSetup } = useProfileStore()
  const [step, setStep] = useState<SetupStep>('role')

  const handleRoleSelect = (r: Role) => {
    setRole(r)
    setStep('specialite')
  }

  const handleSpecialiteSelect = (s: Specialite) => {
    setSpecialite(s)
    setStep('applis')
  }

  const handleFinish = () => {
    completeSetup()
    navigate('/')
  }

  const applis = specialite ? getApplisBySpecialite(specialite, role) : []

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      {/* Logo et titre */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-sncf-dark rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-sncf-blue">KA</span>
        </div>
        <h1 className="text-2xl font-bold text-sncf-dark">Kit Anomalie</h1>
        <p className="text-sm text-gray-500 mt-1">Configurez votre profil pour personnaliser votre expérience</p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(['role', 'specialite', 'applis'] as SetupStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step === s ? 'bg-sncf-blue text-white' :
              (['role', 'specialite', 'applis'].indexOf(step) > i) ? 'bg-sncf-green text-white' :
              'bg-gray-200 text-gray-400'
            }`}>
              {(['role', 'specialite', 'applis'].indexOf(step) > i) ? '✓' : i + 1}
            </div>
            {i < 2 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Étape 1 : Rôle */}
      {step === 'role' && (
        <div>
          <h2 className="text-lg font-bold text-sncf-dark mb-1">Quel est votre rôle ?</h2>
          <p className="text-sm text-gray-500 mb-4">Cela détermine le contenu qui vous sera proposé</p>
          <div className="space-y-3">
            {(Object.keys(ROLE_LABELS) as Role[]).map(r => (
              <button
                key={r}
                onClick={() => handleRoleSelect(r)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  role === r
                    ? 'border-sncf-blue bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-sncf-blue/50'
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

      {/* Étape 2 : Spécialité */}
      {step === 'specialite' && (
        <div>
          <button onClick={() => setStep('role')} className="text-sncf-blue text-sm mb-4 flex items-center gap-1">
            ← Retour
          </button>
          <h2 className="text-lg font-bold text-sncf-dark mb-1">Votre spécialité</h2>
          <p className="text-sm text-gray-500 mb-4">Détermine les applications métier disponibles</p>
          <div className="space-y-3">
            {(Object.keys(SPECIALITE_LABELS) as Specialite[]).map(s => (
              <button
                key={s}
                onClick={() => handleSpecialiteSelect(s)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  specialite === s
                    ? 'border-sncf-blue bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-sncf-blue/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{SPECIALITE_ICONS[s]}</span>
                  <div className="font-semibold text-sncf-dark">{SPECIALITE_LABELS[s]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 3 : Applications métier */}
      {step === 'applis' && (
        <div>
          <button onClick={() => setStep('specialite')} className="text-sncf-blue text-sm mb-4 flex items-center gap-1">
            ← Retour
          </button>
          <h2 className="text-lg font-bold text-sncf-dark mb-1">Vos applications métier</h2>

          {applis.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Sélectionnez les applications que vous utilisez au quotidien
              </p>
              <div className="space-y-3">
                {applis.map(app => (
                  <button
                    key={app.id}
                    onClick={() => toggleAppli(app.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      applisMetier.includes(app.id)
                        ? 'border-sncf-blue bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-sncf-blue/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sncf-dark">{app.nom}</div>
                        {app.description && <div className="text-xs text-gray-500 mt-0.5">{app.description}</div>}
                      </div>
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        applisMetier.includes(app.id)
                          ? 'bg-sncf-blue border-sncf-blue text-white'
                          : 'border-gray-300'
                      }`}>
                        {applisMetier.includes(app.id) && <span className="text-xs">✓</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Bouton valider */}
              <button
                onClick={handleFinish}
                disabled={applisMetier.length === 0}
                className={`w-full mt-6 py-4 rounded-2xl font-bold text-white transition-all ${
                  applisMetier.length > 0
                    ? 'bg-sncf-blue active:scale-[0.98]'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                C'est parti !
              </button>
            </>
          ) : (
            <>
              <div className="bg-sncf-orange/10 border border-sncf-orange/30 rounded-2xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📋</span>
                  <div>
                    <div className="font-semibold text-sncf-dark text-sm">Applications à définir</div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Les applications métier pour le rôle Ordonnanceur ne sont pas encore référencées dans le kit. Vous aurez accès aux fiches mémo, à l'onboarding et à l'assistant IA.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full mt-6 py-4 rounded-2xl font-bold text-white bg-sncf-blue active:scale-[0.98] transition-all"
              >
                C'est parti !
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
