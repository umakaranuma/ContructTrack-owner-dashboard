import axios from 'axios'

// ─── Axios Instance ────────────────────────────────────────────────────────────
// Central API client for ConstructTrack backend (Django REST Framework).
// Handles JWT auth headers, token refresh on 401, and error normalisation.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ── Request interceptor: attach JWT access token from localStorage ──────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ct_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor: handle 401 → attempt token refresh ───────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue subsequent requests while a refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('ct_refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const { data } = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const newToken = data.access
        localStorage.setItem('ct_token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Clear auth state and redirect to login
        localStorage.removeItem('ct_token')
        localStorage.removeItem('ct_refresh_token')
        localStorage.removeItem('ct_user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Normalise error message for consumers
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'

    return Promise.reject({ ...error, message })
  },
)

export default api
