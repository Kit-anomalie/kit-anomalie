import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMaintenanceStore } from '../stores/maintenanceStore'

export function Admin() {
  const navigate = useNavigate()
  const store = useMaintenanceStore()

  // Etat local pour editer avant de sauvegarder
  const [partielEnabled, setPartielEnabled] = useState(store.partielEnabled)
  const [partielMessage, setPartielMessage] = useState(store.partielMessage)
  const [planningEnabled, setPlanningEnabled] = useState(store.planningEnabled)
  const [planningMessage, setPlanningMessage] = useState(store.planningMessage)
  const [planningDate, setPlanningDate] = useState(store.planningDate)
  const [saved, setSaved] = useState(false)

  const hasChanges =
    partielEnabled !== store.partielEnabled ||
    partielMessage !== store.partielMessage ||
    planningEnabled !== store.planningEnabled ||
    planningMessage !== store.planningMessage ||
    planningDate !== store.planningDate

  const handleSave = () => {
    store.setPartiel(partielEnabled, partielMessage)
    store.setPlanning(planningEnabled, planningMessage, planningDate)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setPartielEnabled(store.partielEnabled)
    setPartielMessage(store.partielMessage)
    setPlanningEnabled(store.planningEnabled)
    setPlanningMessage(store.planningMessage)
    setPlanningDate(store.planningDate)
  }

  const handleMaintenanceTotale = () => {
    const data = { enabled: true, message: partielMessage || 'Mise a jour en cours, retour dans quelques instants.' }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'maintenance.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDesactiverTotale = () => {
    const data = { enabled: false, message: 'Mise a jour en cours, retour dans quelques instants.' }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'maintenance.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-full bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-sncf-dark text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => navigate('/reglages')} className="text-sncf-blue text-sm">← Retour</button>
        <span className="text-lg font-bold">Administration</span>
      </header>

      <div className="p-4 space-y-4 pb-32">

        {/* Maintenance partielle */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Maintenance partielle (moi seul)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ecran de maintenance uniquement sur votre navigateur.</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sncf-dark font-medium">Activer</span>
              <button
                onClick={() => setPartielEnabled(!partielEnabled)}
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
              onChange={e => setPartielMessage(e.target.value)}
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
            <p className="text-xs text-gray-400 mt-0.5">Bloque l'acces pour tous. Telecharge le fichier puis demandez le deploiement.</p>
          </div>
          <div className="px-4 py-3 flex gap-2">
            <button
              onClick={handleMaintenanceTotale}
              className="flex-1 py-2.5 rounded-xl bg-sncf-red text-white font-medium text-sm active:scale-[0.98] transition-transform"
            >
              Activer pour tous
            </button>
            <button
              onClick={handleDesactiverTotale}
              className="flex-1 py-2.5 rounded-xl bg-sncf-green text-white font-medium text-sm active:scale-[0.98] transition-transform"
            >
              Desactiver pour tous
            </button>
          </div>
        </div>

        {/* Maintenance planifiee */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Maintenance planifiee</h2>
            <p className="text-xs text-gray-400 mt-0.5">Bandeau d'information sur l'accueil.</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sncf-dark font-medium">Activer le bandeau</span>
              <button
                onClick={() => setPlanningEnabled(!planningEnabled)}
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
              onChange={e => setPlanningMessage(e.target.value)}
              placeholder="Ex: Maintenance prevue le 12 avril de 14h a 15h"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            />
            <input
              type="date"
              value={planningDate}
              onChange={e => setPlanningDate(e.target.value)}
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

      {/* Barre enregistrer / annuler — fixe en bas */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-[768px] lg:max-w-[1024px] bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-transform ${
            hasChanges
              ? 'bg-sncf-blue text-white active:scale-[0.98]'
              : 'bg-gray-100 text-gray-300'
          }`}
        >
          {saved ? 'Enregistre !' : 'Enregistrer'}
        </button>
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className={`flex-1 py-3 rounded-2xl font-medium text-sm ${
            hasChanges
              ? 'bg-gray-100 text-gray-600 active:scale-[0.98]'
              : 'bg-gray-100 text-gray-300'
          }`}
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
