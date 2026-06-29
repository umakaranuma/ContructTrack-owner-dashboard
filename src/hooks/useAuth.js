import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../services/api'

// ─── useAuth Hook ──────────────────────────────────────────────────────────────
// Wraps Zustand auth store with login/logout async actions.
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, error, setAuth, logout: storeLogout, setLoading, setError, clearError } = useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    clearError()
    try {
      const { data } = await api.post('/api/auth/login/', { email, password })
      // Expected response: { user: {...}, access: "...", refresh: "..." }
      localStorage.setItem('ct_refresh_token', data.refresh)
      setAuth({ user: data.user, token: data.access })
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [navigate, setAuth, setLoading, setError, clearError])

  const logout = useCallback(() => {
    storeLogout()
    navigate('/login')
  }, [storeLogout, navigate])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  }
}
