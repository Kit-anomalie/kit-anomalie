import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role, Specialite } from '../types'

interface ProfileState {
  role: Role | null
  specialite: Specialite | null
  isConfigured: boolean
  setRole: (role: Role) => void
  setSpecialite: (specialite: Specialite) => void
  completeSetup: () => void
  resetProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      role: null,
      specialite: null,
      isConfigured: false,

      setRole: (role) => set({ role }),

      setSpecialite: (specialite) => set({ specialite }),

      completeSetup: () => {
        const { role, specialite } = get()
        if (role && specialite) {
          set({ isConfigured: true })
        }
      },

      resetProfile: () => set({
        role: null,
        specialite: null,
        isConfigured: false,
      }),
    }),
    { name: 'kit-anomalie-profile' }
  )
)
