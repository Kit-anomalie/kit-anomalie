import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { useEditorStore } from '../stores/editorStore'
import { useMaintenanceStore } from '../stores/maintenanceStore'
import { APPLIS_METIER } from '../data/roles'

const DEFAULT_TIPS = [
  "Une bonne description d'anomalie contient : le composant, la localisation exacte et l'ancienneté du défaut.",
  "Vérifiez toujours les anomalies existantes sur un actif avant d'en déclarer une nouvelle.",
  "Le classement S/I nécessite une intervention immédiate. En cas de doute, consultez le référentiel MT00342.",
  "Pensez à renseigner la DLF (Date Limite de Fin) pour les anomalies de classement A.",
]

export function Home() {
  const navigate = useNavigate()
  const { role, specialite, applisMetier } = useProfileStore()
  const customTips = useEditorStore(s => s.tips)
  const { planningEnabled, planningMessage } = useMaintenanceStore()

  if (!role || !specialite) return null

  const userApplis = APPLIS_METIER.filter(app => applisMetier.includes(app.id))

  // Tip du jour — carte intégrée, change chaque jour
  const allTips = [...DEFAULT_TIPS, ...customTips.map(t => t.texte)]
  const tipOfTheDay = allTips[new Date().getDate() % allTips.length]

  // Accès rapides
  const quickActions = [
    { icon: '📖', label: 'Guides', desc: 'Pas à pas par appli', path: '/guides', color: 'bg-blue-50 border-sncf-blue/20' },
    { icon: '📋', label: 'Fiches mémo', desc: 'Réflexes en 1 tap', path: '/fiches', color: 'bg-amber-50 border-sncf-orange/20' },
    { icon: '🎓', label: 'Onboarding', desc: 'Parcours formation', path: '/onboarding', color: 'bg-green-50 border-sncf-green/20' },
    { icon: '🔍', label: 'Anomalies', desc: 'Par actif', path: '/actifs', color: 'bg-purple-50 border-purple-200' },
    { icon: '🤖', label: 'Assistant IA', desc: 'Aide rédaction', path: '/assistant', color: 'bg-cyan-50 border-sncf-blue/20' },
    { icon: '🔔', label: 'Alertes', desc: 'Bon à savoir', path: '/alertes', color: 'bg-red-50 border-sncf-red/20' },
  ]


  return (
    <div className="px-4 py-4 space-y-5">
      {/* Bandeau maintenance planifiee */}
      {planningEnabled && planningMessage && (
        <div className="bg-sncf-orange/10 border border-sncf-orange/30 rounded-2xl p-3">
          <div className="flex items-start gap-2">
            <span className="text-sm">🔧</span>
            <div>
              <div className="text-[11px] font-bold text-sncf-orange uppercase tracking-wide">Maintenance prevue</div>
              <p className="text-xs text-sncf-dark mt-0.5 leading-relaxed">{planningMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tip du jour */}
      <div className="bg-sncf-blue/5 border border-sncf-blue/20 rounded-2xl p-3">
        <div className="flex items-start gap-2">
          <span className="text-sm">💡</span>
          <div>
            <div className="text-[11px] font-bold text-sncf-blue uppercase tracking-wide">Tip du jour</div>
            <p className="text-xs text-sncf-dark mt-0.5 leading-relaxed">{tipOfTheDay}</p>
          </div>
        </div>
      </div>

      {/* Accès rapides */}
      <div>
        <h2 className="text-sm font-bold text-sncf-dark mb-3">Accès rapides</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`text-left p-4 rounded-2xl border ${action.color} transition-transform active:scale-[0.97]`}
            >
              <span className="text-2xl">{action.icon}</span>
              <div className="font-semibold text-sncf-dark text-sm mt-2">{action.label}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mes applications */}
      {userApplis.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-sncf-dark mb-3">Mes applications métier</h2>
          <div className="space-y-2">
            {userApplis.map(app => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-3 border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sncf-dark text-sm">{app.nom}</div>
                  {app.description && <div className="text-[11px] text-gray-500">{app.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
