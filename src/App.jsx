/**
 * App.jsx — root routing for the Owner Dashboard.
 * Protected routes require a valid JWT (checked via authStore).
 * The layout wraps all authenticated pages with Sidebar + Topbar.
 */
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useAuthStore from './store/authStore'

// Layout
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import AlertDrawer from './components/layout/AlertDrawer'

// Pages
import Login from './pages/Login'
import Overview from './pages/Overview'
import Sites from './pages/Sites'
import SiteDetail from './pages/SiteDetail'
import Managers from './pages/Managers'
import Finances from './pages/Finances'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30 seconds before refetch
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// ─── Protected Layout ──────────────────────────────────────────────────────────
// Renders sidebar + topbar around all authenticated pages.
// Redirects to /login if not authenticated.
function DashboardLayout() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      {/* Alert drawer — slides in from right, triggered by Topbar bell */}
      <AlertDrawer />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="sites" element={<Sites />} />
            <Route path="sites/:siteId" element={<SiteDetail />} />
            <Route path="managers" element={<Managers />} />
            <Route path="finances" element={<Finances />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
