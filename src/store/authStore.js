import { create } from 'zustand'

// ─── Auth Store ────────────────────────────────────────────────────────────────
// Zustand store for authentication state. Persists token to localStorage
// so sessions survive page refreshes.
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'ct_token'
const USER_KEY  = 'ct_user'

const useAuthStore = create((set, get) => ({
  // State
  token: localStorage.getItem(TOKEN_KEY) || null,
  user:  JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  error: null,

  // Actions
  setAuth: ({ user, token }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user, token, isAuthenticated: true, error: null })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, token: null, isAuthenticated: false })
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Helpers
  getToken: () => get().token,
}))

export default useAuthStore
