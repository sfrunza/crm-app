import type { SessionUser } from '@/types/user'
import { create } from 'zustand'

export type AuthState = {
  user: SessionUser | null;
  setUser: (user: SessionUser) => void;
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null }),
}))
