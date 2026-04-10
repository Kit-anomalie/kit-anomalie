import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MaintenanceState {
  // Maintenance planifiee (bandeau d'annonce)
  planningEnabled: boolean
  planningMessage: string
  planningDate: string
  setPlanning: (enabled: boolean, message?: string, date?: string) => void
}

export const useMaintenanceStore = create<MaintenanceState>()(
  persist(
    (set) => ({
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
