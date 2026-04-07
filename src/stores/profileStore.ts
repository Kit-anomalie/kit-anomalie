import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role, Specialite } from '../types'

interface ProfileState {
  role: Role | null
  specialite: Specialite | null
  applisMetier: string[]
  isConfigured: boolean
  // Actions
  setRole: (role: Role) => void
  setSpecialite: (specialite: Specialite) => void
  setApplisMetier: (applis: string[]) => void
  toggleAppli: (appliId: string) => void
  completeSetup: () => void
  resetProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      role: null,
      specialite: null,
      applisMetier: [],
      isConfigured: false,

      setRole: (role) => set({ role }),

      setSpecialite: (specialite) => set({ specialite, applisMetier: [] }),

      setApplisMetier: (applis) => set({ applisMetier: applis }),

      toggleAppli: (appliId) => {
        const current = get().applisMetier
        if (current.includes(appliId)) {
          set({ applisMetier: current.filter(id => id !== appliId) })
        } else {
          set({ applisMetier: [...current, appliId] })
        }
      },

      completeSetup: () => {
        const { role, specialite } = get()
        if (role && specialite) {
          set({ isConfigured: true })
        }
      },

      resetProfile: () => set({
        role: null,
        specialite: null,
        applisMetier: [],
        isConfigured: false,
      }),
    }),
    { name: 'kit-anomalie-profile' }
  )
)
