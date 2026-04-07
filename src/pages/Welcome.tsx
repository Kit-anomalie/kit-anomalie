import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'

export function Welcome() {
  const navigate = useNavigate()
  const { setRole, setSpecialite, setApplisMetier, completeSetup } = useProfileStore()

  const handleDemo = () => {
    // Pré-remplit Agent terrain / Voie / EF3C0 + ADV Mobile + SPM
    setRole('agent_req')
    setSpecialite('voie')
    setApplisMetier(['ef3c0', 'adv_mobile', 'spm'])
    completeSetup()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg px-6 py-10 flex flex-col">
      {/* Logo */}
      <div className="text-center mt-8">
        <div className="w-20 h-20 bg-sncf-dark rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold text-sncf-blue">KA</span>
        </div>
        <h1 className="text-2xl font-bold text-sncf-dark">Kit Anomalie</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-[300px] mx-auto">
          Votre compagnon terrain pour la gestion des anomalies.
          Guides, fiches réflexes, aide au classement — tout dans la poche.
        </p>
      </div>

      {/* Points clés */}
      <div className="mt-8 space-y-3">
        {[
          { icon: '📖', text: 'Guides pas à pas par application métier' },
          { icon: '📋', text: 'Fiches mémo réflexes en un tap' },
          { icon: '🤖', text: 'Assistant IA pour description et classement' },
          { icon: '📡', text: 'Fonctionne hors réseau' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100">
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm text-sncf-dark font-medium">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Boutons */}
      <div className="mt-auto space-y-3 pb-8">
        <button
          onClick={handleDemo}
          className="w-full py-4 rounded-2xl font-bold text-white bg-sncf-blue active:scale-[0.98] transition-transform shadow-md"
        >
          Explorer le kit
        </button>
        <button
          onClick={() => navigate('/setup')}
          className="w-full py-3 rounded-2xl font-medium text-sncf-blue bg-sncf-blue/10 active:scale-[0.98] transition-transform"
        >
          Configurer mon profil
        </button>
      </div>
    </div>
  )
}
