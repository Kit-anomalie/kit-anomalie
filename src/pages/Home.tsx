import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { useEditorStore } from '../stores/editorStore'
import { useSharedContentStore } from '../stores/sharedContentStore'
import { useMaintenanceStore } from '../stores/maintenanceStore'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'

const DEFAULT_TIPS = [
  "Une bonne description d'anomalie contient : le composant, la localisation exacte et l'anciennete du defaut.",
  "Verifiez toujours les anomalies existantes sur un actif avant d'en declarer une nouvelle.",
  "Le classement S/I necessite une intervention immediate. En cas de doute, consultez le referentiel MT00342.",
  "Pensez a renseigner la DLF (Date Limite de Fin) pour les anomalies de classement A.",
]

export function Home() {
  const navigate = useNavigate()
  const { role, specialite } = useProfileStore()
  const customTips = useEditorStore(s => s.tips)
  const sharedTips = useSharedContentStore(s => s.tips)
  const { planningEnabled, planningMessage } = useMaintenanceStore()

  if (!role || !specialite) return null

  // Conseil du jour
  const allTips = [...DEFAULT_TIPS, ...sharedTips.map(t => t.texte), ...customTips.map(t => t.texte)]
  const tipOfTheDay = allTips[new Date().getDate() % allTips.length]

  // Accès rapides
  const quickActions = [
    { icon: '📖', label: 'Guides', desc: 'Pas à pas par appli', path: '/guides', color: 'bg-blue-50 border-sncf-blue/20' },
    { icon: '📋', label: 'Fiches mémo', desc: "L'essentiel en un clin d'œil", path: '/fiches', color: 'bg-amber-50 border-sncf-orange/20' },
    { icon: '🧠', label: 'Quiz', desc: 'Testez vos connaissances', path: '/quiz', color: 'bg-green-50 border-sncf-green/20' },
    { icon: '🔍', label: 'Anomalies', desc: 'Par actif', path: '/actifs', color: 'bg-purple-50 border-purple-200' },
    { icon: '🤖', label: 'Assistant IA', desc: 'Aide à la rédaction', path: '/assistant', color: 'bg-cyan-50 border-sncf-blue/20' },
    { icon: '🔔', label: 'Alertes', desc: 'Bon à savoir', path: '/alertes', color: 'bg-red-50 border-sncf-red/20' },
  ]

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Bienvenue — entre en premier */}
      <div className="spring-enter">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧑‍🔧</span>
          <div>
            <h1 className="text-lg font-bold text-sncf-dark">Bienvenue</h1>
            <p className="text-xs text-gray-500">{ROLE_LABELS[role]} · {SPECIALITE_LABELS[specialite]}</p>
          </div>
        </div>
      </div>

      {/* Bandeau maintenance planifiee */}
      {planningEnabled && planningMessage && (
        <div
          className="bg-sncf-orange/10 border border-sncf-orange/30 rounded-2xl p-3 spring-scale"
          style={{ animationDelay: '150ms' }}
        >
          <div className="flex items-start gap-2">
            <span className="text-sm">🔧</span>
            <div>
              <div className="text-[11px] font-bold text-sncf-orange uppercase tracking-wide">Maintenance prévue</div>
              <p className="text-xs text-sncf-dark mt-0.5 leading-relaxed">{planningMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Conseil du jour — apparait apres le welcome */}
      <div
        className="bg-sncf-blue/5 border border-sncf-blue/20 rounded-2xl p-3 spring-scale"
        style={{ animationDelay: '250ms' }}
      >
        <div className="flex items-start gap-2">
          <span className="text-sm">💡</span>
          <div>
            <div className="text-[11px] font-bold text-sncf-blue uppercase tracking-wide">Conseil du jour</div>
            <p className="text-xs text-sncf-dark mt-0.5 leading-relaxed">{tipOfTheDay}</p>
          </div>
        </div>
      </div>

      {/* Accès rapides — cascade de cards */}
      <div>
        <h2
          className="text-sm font-bold text-sncf-dark mb-3 spring-enter"
          style={{ animationDelay: '350ms' }}
        >
          Accès rapides
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`text-left p-4 rounded-2xl border ${action.color} active:scale-[0.96] transition-transform duration-200 spring-scale`}
              style={{ animationDelay: `${420 + i * 70}ms` }}
            >
              <span className="text-2xl block">{action.icon}</span>
              <div className="font-semibold text-sncf-dark text-sm mt-2">{action.label}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Baseline — la derniere chose qui apparait */}
      <div
        className="text-center py-4"
        style={{ animation: 'fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both', animationDelay: '900ms' }}
      >
        <p className="text-[11px] text-gray-300 italic whitespace-nowrap">Les bons réflexes anomalie, dans la poche</p>
      </div>

    </div>
  )
}
