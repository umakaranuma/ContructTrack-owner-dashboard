/**
 * App.jsx — root routing for the Owner Dashboard.
 * BrowserRouter and QueryClientProvider are provided by main.jsx — do NOT add them here.
 * Protected routes require a valid JWT (checked via authStore).
 */
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
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

// ─── Protected Layout ──────────────────────────────────────────────────────────
// Renders sidebar + topbar around all authenticated pages.
// Redirects to /login if no valid token in store.
function DashboardLayout() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0A1628' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      {/* Alert drawer — slides in from the right, triggered by Topbar bell icon */}
      <AlertDrawer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public — accessible without login */}
      <Route path="/login" element={<Login />} />

      {/* Protected dashboard — all child routes require auth */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="sites" element={<Sites />} />
        <Route path="sites/:siteId" element={<SiteDetail />} />
        <Route path="managers" element={<Managers />} />
        <Route path="finances" element={<Finances />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Redirect root and unknown paths to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
