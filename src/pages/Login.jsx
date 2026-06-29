import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// ─── Login Page ────────────────────────────────────────────────────────────────
// Dark centered card on navy background.
// POST to /api/auth/login/ → stores JWT → redirects to /dashboard.
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Login() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  // Already logged in? Go to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data) => {
    clearError()
    login(data)
  }

  return (
    <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-navy-secondary border border-navy-light rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center mx-auto mb-4 glow-gold">
              <span className="font-syne font-bold text-gold text-2xl">CT</span>
            </div>
            <h1 className="font-syne font-bold text-offwhite text-2xl">ConstructTrack</h1>
            <p className="text-muted text-sm mt-1 uppercase tracking-widest font-medium">Owner Portal</p>
          </div>

          {/* Server error */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="input"
                placeholder="owner@company.lk"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-gold text-xs hover:text-gold-light transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold w-full py-3 flex items-center justify-center gap-2 text-base mt-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-5 border-t border-navy-light text-center">
            <p className="text-muted text-xs">
              Demo access: use any email + password (6+ chars)
            </p>
            {/* Quick demo fill — dev convenience only */}
            <button
              onClick={() => {
                clearError()
                login({ email: 'owner@constructtrack.lk', password: 'demo1234' })
              }}
              className="mt-2 text-gold/70 hover:text-gold text-xs underline underline-offset-2 transition-colors"
            >
              Enter with demo credentials →
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted/50 text-xs mt-4">
          © 2026 ConstructTrack · Built for Sri Lanka's construction industry
        </p>
      </div>
    </div>
  )
}
