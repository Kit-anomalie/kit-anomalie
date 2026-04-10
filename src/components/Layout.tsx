import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { OfflineBadge } from './OfflineBadge'
import { useProfileStore } from '../stores/profileStore'
import { useEditorStore } from '../stores/editorStore'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'

const DEFAULT_TIPS = [
  "Une bonne description d'anomalie contient : le composant, la localisation exacte et l'ancienneté du défaut.",
  "Vérifiez toujours les anomalies existantes sur un actif avant d'en déclarer une nouvelle.",
  "Le classement S/I nécessite une intervention immédiate. En cas de doute, consultez le référentiel MT00342.",
  "Pensez à renseigner la DLF (Date Limite de Fin) pour les anomalies de classement A.",
]

function useTipDuJour() {
  const customTips = useEditorStore(s => s.tips)
  const allTips = [...DEFAULT_TIPS, ...customTips.map(t => t.texte)]

  const today = new Date().toISOString().slice(0, 10)
  const tipIndex = new Date().getDate() % allTips.length
  const storageKey = 'tip-du-jour-dismissed'

  const dismissed = localStorage.getItem(storageKey) === today
  const [visible, setVisible] = useState(!dismissed)

  const dismiss = () => {
    localStorage.setItem(storageKey, today)
    setVisible(false)
  }

  return { tip: allTips[tipIndex], visible, dismiss }
}

export function Layout() {
  const navigate = useNavigate()
  const { role, specialite } = useProfileStore()
  const { tip, visible: tipVisible, dismiss: dismissTip } = useTipDuJour()

  return (
    <div className="min-h-full bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-sncf-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg font-bold shrink-0">Kit Anomalie</span>
          {role && specialite && (
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full truncate">
              {ROLE_LABELS[role]} · {SPECIALITE_LABELS[specialite]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/editeur')}
            className="text-[11px] bg-sncf-blue/30 px-2 py-1 rounded-full font-medium"
          >
            Editeur
          </button>
          <OfflineBadge />
        </div>
      </header>

      {/* Contenu principal — padding bottom pour la nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Tip du jour — overlay au-dessus de la nav, une fois par jour */}
      {tipVisible && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[430px] md:max-w-[740px] lg:max-w-[996px] z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="bg-white border border-sncf-blue/30 rounded-2xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div className="flex-1">
                <div className="text-[11px] font-bold text-sncf-blue uppercase tracking-wide">Tip du jour</div>
                <p className="text-sm text-sncf-dark mt-1 leading-relaxed">{tip}</p>
              </div>
              <button onClick={dismissTip} className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation basse */}
      <BottomNav />
    </div>
  )
}
