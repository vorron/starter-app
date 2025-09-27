import { create } from 'zustand'
import { User } from './types'

interface UserState {
  user: User | null
  updateUser: (userData: Partial<User>) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  updateUser: (userData) => set((state) => ({
    user: state.user ? { ...state.user, ...userData } : null
  })),
}))

export const useUser = () => useUserStore(state => state.user)
export const useUserActions = () => useUserStore(state => ({
  updateUser: state.updateUser
}))