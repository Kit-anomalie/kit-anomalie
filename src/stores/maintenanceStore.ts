import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MaintenanceState {
  // Mode partiel (moi seul, localStorage)
  partielEnabled: boolean
  partielMessage: string
  setPartiel: (enabled: boolean, message?: string) => void

  // Maintenance planifiee (bandeau d'annonce)
  planningEnabled: boolean
  planningMessage: string
  planningDate: string
  setPlanning: (enabled: boolean, message?: string, date?: string) => void
}

export const useMaintenanceStore = create<MaintenanceState>()(
  persist(
    (set) => ({
      partielEnabled: false,
      partielMessage: 'Mise a jour en cours, retour dans quelques instants.',

      setPartiel: (enabled, message) => set(s => ({
        partielEnabled: enabled,
        partielMessage: message ?? s.partielMessage,
      })),

      planningEnabled: false,
      planningMessage: '',
      planningDate: '',

      setPlanning: (enabled, message, date) => set(s => ({
        planningEnabled: enabled,
        planningMessage: message ?? s.planningMessage,
        planningDate: date ?? s.planningDate,
      })),
    }),
    { name: 'kit-anomalie-maintenance' }
  )
)
