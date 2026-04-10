import { useNavigate } from 'react-router-dom'
import { useMaintenanceStore } from '../stores/maintenanceStore'

export function Admin() {
  const navigate = useNavigate()
  const {
    partielEnabled, partielMessage, setPartiel,
    planningEnabled, planningMessage, planningDate, setPlanning,
  } = useMaintenanceStore()

  return (
    <div className="min-h-full bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-sncf-dark text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => navigate('/reglages')} className="text-sncf-blue text-sm">← Retour</button>
        <span className="text-lg font-bold">Administration</span>
      </header>

      <div className="p-4 space-y-4">

        {/* Maintenance partielle */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Maintenance partielle (moi seul)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Active un ecran de maintenance uniquement sur votre navigateur pour tester avant de deployer.</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sncf-dark font-medium">Activer</span>
              <button
                onClick={() => setPartiel(!partielEnabled)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  partielEnabled ? 'bg-sncf-green' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  partielEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <textarea
              value={partielMessage}
              onChange={e => setPartiel(partielEnabled, e.target.value)}
              rows={2}
              placeholder="Message de maintenance..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
            />
          </div>
        </div>

        {/* Maintenance totale */}
        <div className="bg-white rounded-2xl border border-sncf-red/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-sncf-red/20">
            <h2 className="text-xs font-bold text-sncf-red uppercase tracking-wide">Maintenance totale (tout le monde)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Bloque l'acces au kit pour tous les utilisateurs. Necessite un deploiement (demandez a Claude).</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-gray-600">Pour activer la maintenance totale, dites a Claude : <strong className="text-sncf-dark">"active la maintenance totale"</strong></p>
            <p className="text-xs text-gray-400 mt-2">Claude modifiera maintenance.json et pushera le deploiement.</p>
          </div>
        </div>

        {/* Maintenance planifiee */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Maintenance planifiee</h2>
            <p className="text-xs text-gray-400 mt-0.5">Affiche un bandeau d'information sur l'accueil pour prevenir les utilisateurs.</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sncf-dark font-medium">Activer le bandeau</span>
              <button
                onClick={() => setPlanning(!planningEnabled)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  planningEnabled ? 'bg-sncf-green' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  planningEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <input
              value={planningMessage}
              onChange={e => setPlanning(planningEnabled, e.target.value, planningDate)}
              placeholder="Ex: Maintenance prevue le 12 avril de 14h a 15h"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            />
            <input
              type="date"
              value={planningDate}
              onChange={e => setPlanning(planningEnabled, planningMessage, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            />
          </div>
        </div>

        {/* Acces editeur */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Contenu</h2>
          </div>
          <button
            onClick={() => navigate('/editeur')}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <span className="text-sm text-sncf-dark font-medium">Mode editeur</span>
            <span className="text-sncf-blue text-sm">→</span>
          </button>
        </div>

      </div>
    </div>
  )
}
