import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAllAlerts } from '../../hooks/useSites'
import AlertDrawer from './AlertDrawer'

// ─── Topbar ────────────────────────────────────────────────────────────────────
// Top navigation bar with breadcrumb, search, notifications bell, and alert drawer.
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_TITLES = {
  '/dashboard': 'Overview',
  '/dashboard/sites': 'My Sites',
  '/dashboard/managers': 'Managers',
  '/dashboard/finances': 'Finances',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
}

export default function Topbar() {
  const [alertDrawerOpen, setAlertDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

  // Fetch alert count for badge
  const { data: alertsData } = useAllAlerts()
  const alertCount = alertsData?.unread_count ?? alertsData?.results?.filter(a => !a.acknowledged)?.length ?? 0

  // Resolve page title from path
  const pathKey = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find((key) => location.pathname.startsWith(key))
  const pageTitle = PAGE_TITLES[pathKey] || 'Dashboard'

  // Current date display
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <header className="fixed top-0 left-64 right-0 h-16 bg-navy-primary/95 backdrop-blur-sm border-b border-navy-light z-20 flex items-center px-6 gap-4">
        {/* Page title */}
        <div className="flex-1 min-w-0">
          <h1 className="font-syne font-semibold text-offwhite text-lg leading-none">{pageTitle}</h1>
          <p className="text-muted text-xs mt-0.5">{dateStr}</p>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search sites, managers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-navy-secondary border border-navy-light rounded-lg pl-9 pr-4 py-2 text-sm text-offwhite placeholder-muted/60 focus:outline-none focus:border-gold/50 w-56 transition-all focus:w-64"
          />
        </div>

        {/* Alert bell */}
        <button
          onClick={() => setAlertDrawerOpen(true)}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-navy-secondary border border-navy-light hover:border-gold/40 text-muted hover:text-offwhite transition-colors"
          aria-label="Open alerts"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center font-mono">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Help */}
        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-navy-secondary border border-navy-light hover:border-gold/40 text-muted hover:text-offwhite transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </header>

      {/* Alert Drawer */}
      <AlertDrawer isOpen={alertDrawerOpen} onClose={() => setAlertDrawerOpen(false)} />
    </>
  )
}
