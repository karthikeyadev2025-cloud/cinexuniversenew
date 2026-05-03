/* ─────────────────────────────────────────────
   roleStore.ts — User Role Management (Backend-Connected)
   user: filmmaker/crew dashboard
   casting: casting director/agency dashboard
   talent: actor/actress profile
   admin: super admin control panel
   ───────────────────────────────────────────── */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { trpcClient } from '@/providers/trpc'

export type UserRole = 'user' | 'casting' | 'talent' | 'admin' | 'guest'

export interface RoleUser {
  id: number
  name: string | null
  email: string | null
  role: UserRole
  avatar?: string | null
}

interface RoleState {
  user: RoleUser | null
  isAuthenticated: boolean
  token: string | null
  error: string | null
  setUser: (user: RoleUser | null, token?: string | null) => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  clearError: () => void
  setRole: (role: UserRole) => void
  getDashboardPath: () => string
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      error: null,

      setUser: (user, token) => {
        if (token) localStorage.setItem('cinex_token', token)
        set({ user, isAuthenticated: !!user, token: token ?? null, error: null })
      },

      login: async (email, password) => {
        set({ error: null })
        try {
          const result = await (trpcClient as any).localAuth.login.mutate({ email, password })
          const { token, user } = result
          localStorage.setItem('cinex_token', token)
          set({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role as UserRole,
            },
            isAuthenticated: true,
            token,
            error: null,
          })
          return { success: true }
        } catch (err: any) {
          const msg = err?.message || 'Login failed. Please check your email and password.'
          set({ error: msg, user: null, isAuthenticated: false, token: null })
          return { success: false, error: msg }
        }
      },

      register: async (name, email, password, role) => {
        set({ error: null })
        try {
          const result = await (trpcClient as any).localAuth.register.mutate({
            name,
            email,
            password,
            role: role as 'user' | 'admin' | 'casting' | 'talent',
          })
          const { token, user } = result
          localStorage.setItem('cinex_token', token)
          set({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role as UserRole,
            },
            isAuthenticated: true,
            token,
            error: null,
          })
          return { success: true }
        } catch (err: any) {
          const msg = err?.message || 'Registration failed. Please try again.'
          set({ error: msg, user: null, isAuthenticated: false, token: null })
          return { success: false, error: msg }
        }
      },

      logout: () => {
        localStorage.removeItem('cinex_token')
        set({ user: null, isAuthenticated: false, token: null, error: null })
        window.location.href = '/login'
      },

      clearError: () => set({ error: null }),

      setRole: (role) => {
        const user = get().user
        if (user) {
          set({ user: { ...user, role } })
        }
      },

      getDashboardPath: () => {
        const role = get().user?.role
        switch (role) {
          case 'admin': return '/admin'
          case 'casting': return '/casting-dashboard'
          case 'talent': return '/auditions?tab=calls'
          default: return '/dashboard'
        }
      },
    }),
    {
      name: 'cinex-role-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    },
  ),
)
