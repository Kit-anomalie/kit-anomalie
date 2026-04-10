import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { useEditorStore } from '../stores/editorStore'
import { useMaintenanceStore } from '../stores/maintenanceStore'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'
import { ROLE_ICONS } from '../data/roles'
import { GUIDES } from '../data/guides'
import { FICHES_MEMO } from '../data/fiches'

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
  const customFiches = useEditorStore(s => s.fiches)
  const customGuides = useEditorStore(s => s.guides)
  const { planningEnabled, planningMessage } = useMaintenanceStore()

  if (!role || !specialite) return null

  // Tip du jour
  const allTips = [...DEFAULT_TIPS, ...customTips.map(t => t.texte)]
  const tipOfTheDay = allTips[new Date().getDate() % allTips.length]

  // Compteurs
  const totalGuides = [...GUIDES, ...customGuides].filter(g =>
    g.roles.includes(role) && g.specialites.includes(specialite)
  ).length
  const totalFiches = [...FICHES_MEMO, ...customFiches].filter(f =>
    f.roles.includes(role) && f.specialites.includes(specialite)
  ).length

  // Acces rapides
  const quickActions = [
    { icon: '📖', label: 'Guides', desc: 'Pas a pas par appli', path: '/guides', color: 'bg-blue-50 border-sncf-blue/20' },
    { icon: '📋', label: 'Fiches memo', desc: 'Reflexes en 1 tap', path: '/fiches', color: 'bg-amber-50 border-sncf-orange/20' },
    { icon: '🎓', label: 'Onboarding', desc: 'Parcours formation', path: '/onboarding', color: 'bg-green-50 border-sncf-green/20' },
    { icon: '🔍', label: 'Anomalies', desc: 'Par actif', path: '/actifs', color: 'bg-purple-50 border-purple-200' },
    { icon: '🤖', label: 'Assistant IA', desc: 'Aide redaction', path: '/assistant', color: 'bg-cyan-50 border-sncf-blue/20' },
    { icon: '🔔', label: 'Alertes', desc: 'Bon a savoir', path: '/alertes', color: 'bg-red-50 border-sncf-red/20' },
  ]

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Bienvenue */}
      <div className="animate-[fadeIn_0.3s_ease-out]">
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
        <div className="bg-sncf-orange/10 border border-sncf-orange/30 rounded-2xl p-3 animate-[fadeIn_0.3s_ease-out]">
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
      <div className="bg-sncf-blue/5 border border-sncf-blue/20 rounded-2xl p-3 animate-[fadeIn_0.4s_ease-out]">
        <div className="flex items-start gap-2">
          <span className="text-sm">💡</span>
          <div>
            <div className="text-[11px] font-bold text-sncf-blue uppercase tracking-wide">Tip du jour</div>
            <p className="text-xs text-sncf-dark mt-0.5 leading-relaxed">{tipOfTheDay}</p>
          </div>
        </div>
      </div>

      {/* Acces rapides */}
      <div>
        <h2 className="text-sm font-bold text-sncf-dark mb-3">Acces rapides</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`text-left p-4 rounded-2xl border ${action.color} transition-all active:scale-[0.97] animate-[fadeIn_0.3s_ease-out]`}
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
            >
              <span className="text-2xl">{action.icon}</span>
              <div className="font-semibold text-sncf-dark text-sm mt-2">{action.label}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Baseline */}
      <div className="text-center py-4 animate-[fadeIn_0.5s_ease-out]">
        <p className="text-xs text-gray-300 italic">Les bons reflexes anomalie, dans la poche</p>
      </div>

    </div>
  )
}
