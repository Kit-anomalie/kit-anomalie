import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMaintenanceStore } from '../stores/maintenanceStore'
import { useCatalogueStore } from '../stores/catalogueStore'
import { useSharedContentStore } from '../stores/sharedContentStore'
import { Toggle } from '../components/Toggle'

export function Admin() {
  const navigate = useNavigate()
  const store = useMaintenanceStore()
  const resetCatalogueSeed = useCatalogueStore(s => s.resetSeed)
  const restoreShared = useSharedContentStore(s => s.restoreShared)

  const [planningEnabled, setPlanningEnabled] = useState(store.planningEnabled)
  const [planningMessage, setPlanningMessage] = useState(store.planningMessage)
  const [planningDate, setPlanningDate] = useState(store.planningDate)
  const [maintenanceMessage, setMaintenanceMessage] = useState('Mise a jour en cours, retour dans quelques instants.')
  const [saved, setSaved] = useState(false)
  const [seedResetMsg, setSeedResetMsg] = useState(false)
  const [restoreMsg, setRestoreMsg] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleResetCatalogue = () => {
    if (confirm('Réinitialiser le catalogue au contenu de démo (toutes modifications locales seront perdues) ?')) {
      resetCatalogueSeed()
      setSeedResetMsg(true)
      setTimeout(() => setSeedResetMsg(false), 2000)
    }
  }

  const handleRestoreShared = async () => {
    if (!confirm(
      'Restaurer le contenu partagé depuis content.json ?\n\n'
      + '⚠️ Vos guides, fiches et conseils locaux non exportés seront écrasés.\n\n'
      + 'Favoris, historique et catalogue anomalies ne sont pas affectés.'
    )) return
    setRestoreMsg('loading')
    try {
      await restoreShared()
      setRestoreMsg('done')
      setTimeout(() => setRestoreMsg('idle'), 2500)
    } catch {
      setRestoreMsg('idle')
    }
  }

  const hasChanges =
    planningEnabled !== store.planningEnabled ||
    planningMessage !== store.planningMessage ||
    planningDate !== store.planningDate

  const handleSave = () => {
    store.setPlanning(planningEnabled, planningMessage, planningDate)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setPlanningEnabled(store.planningEnabled)
    setPlanningMessage(store.planningMessage)
    setPlanningDate(store.planningDate)
  }

  const handleMaintenanceTotale = () => {
    const data = { enabled: true, message: maintenanceMessage }
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
    const data = { enabled: false, message: maintenanceMessage }
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
      <header className="bg-sncf-dark text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => navigate('/reglages')} className="text-sncf-blue text-sm">← Retour</button>
        <span className="text-lg font-bold">Administration</span>
      </header>

      <div className="p-4 space-y-4 pb-32">

        {/* Maintenance totale */}
        <div className="bg-white rounded-2xl border border-sncf-red/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-sncf-red/20">
            <h2 className="text-xs font-bold text-sncf-red uppercase tracking-wide">Maintenance totale</h2>
            <p className="text-xs text-gray-400 mt-0.5">Bloque l'accès pour tous les utilisateurs. Téléchargez le fichier puis déposez-le dans le dépôt du projet.</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <textarea
              value={maintenanceMessage}
              onChange={e => setMaintenanceMessage(e.target.value)}
              rows={2}
              placeholder="Message affiché aux utilisateurs..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleMaintenanceTotale}
                className="flex-1 py-2.5 rounded-xl bg-sncf-red text-white font-medium text-sm active:scale-[0.98] transition-transform"
              >
                Bloquer l'accès
              </button>
              <button
                onClick={handleDesactiverTotale}
                className="flex-1 py-2.5 rounded-xl bg-sncf-green text-white font-medium text-sm active:scale-[0.98] transition-transform"
              >
                Rétablir l'accès
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance planifiée */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Maintenance planifiée</h2>
            <p className="text-xs text-gray-400 mt-0.5">Bandeau d'information sur l'accueil.</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sncf-dark font-medium">Activer le bandeau</span>
              <Toggle enabled={planningEnabled} onChange={setPlanningEnabled} />
            </div>
            <input
              value={planningMessage}
              onChange={e => setPlanningMessage(e.target.value)}
              placeholder="Ex: Maintenance prévue le 12 avril de 14h à 15h"
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
            className="w-full px-4 py-3 flex items-center justify-between text-left border-b border-gray-100"
          >
            <span className="text-sm text-sncf-dark font-medium">Mode éditeur</span>
            <span className="text-sncf-blue text-sm">→</span>
          </button>
          <button
            onClick={handleRestoreShared}
            disabled={restoreMsg === 'loading'}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm text-sncf-dark font-medium block">
                {restoreMsg === 'loading' ? 'Restauration…' : restoreMsg === 'done' ? 'Restauré ✓' : 'Restaurer le contenu partagé'}
              </span>
              <span className="text-[11px] text-gray-400">
                Synchronise tips/fiches/guides locaux avec content.json
              </span>
            </div>
            <span className="text-sncf-blue text-sm shrink-0">↻</span>
          </button>
        </div>

        {/* Catalogue démo */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Catalogue anomalies</h2>
            <p className="text-xs text-gray-400 mt-0.5">Restaure les 6 catégories / 20 anomalies de démonstration (remet à zéro les éditions locales).</p>
          </div>
          <button
            onClick={handleResetCatalogue}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <span className="text-sm text-sncf-dark font-medium">
              {seedResetMsg ? 'Catalogue réinitialisé ✓' : 'Réinitialiser au contenu démo'}
            </span>
            <span className="text-sncf-blue text-sm">↻</span>
          </button>
        </div>

      </div>

      {/* Barre enregistrer / annuler */}
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
          {saved ? 'Enregistré !' : 'Enregistrer'}
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
