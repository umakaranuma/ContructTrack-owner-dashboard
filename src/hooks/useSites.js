import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { siteService } from '../services/siteService'

// ─── useSites Hook ─────────────────────────────────────────────────────────────
// TanStack Query wrappers for site-related data fetching and mutations.
// ─────────────────────────────────────────────────────────────────────────────

export function useSites(params = {}) {
  return useQuery({
    queryKey: ['sites', params],
    queryFn: () => siteService.getSites(params),
  })
}

export function useSite(siteId) {
  return useQuery({
    queryKey: ['site', siteId],
    queryFn: () => siteService.getSite(siteId),
    enabled: !!siteId,
  })
}

export function useOverviewStats() {
  return useQuery({
    queryKey: ['overview-stats'],
    queryFn: () => siteService.getOverviewStats(),
    refetchInterval: 1000 * 60 * 5, // refresh every 5 minutes
  })
}

export function useActivityFeed(limit = 20) {
  return useQuery({
    queryKey: ['activity-feed', limit],
    queryFn: () => siteService.getActivityFeed(limit),
    refetchInterval: 1000 * 60 * 2,
  })
}

export function useAllAlerts() {
  return useQuery({
    queryKey: ['all-alerts'],
    queryFn: () => siteService.getAllAlerts(),
    refetchInterval: 1000 * 60 * 3,
  })
}

export function useDailyLogs(siteId, params = {}) {
  return useQuery({
    queryKey: ['daily-logs', siteId, params],
    queryFn: () => siteService.getDailyLogs(siteId, params),
    enabled: !!siteId,
  })
}

export function useAttendance(siteId, params = {}) {
  return useQuery({
    queryKey: ['attendance', siteId, params],
    queryFn: () => siteService.getAttendance(siteId, params),
    enabled: !!siteId,
  })
}

export function useBills(siteId, params = {}) {
  return useQuery({
    queryKey: ['bills', siteId, params],
    queryFn: () => siteService.getBills(siteId, params),
    enabled: !!siteId,
  })
}

export function useProgressPhotos(siteId, params = {}) {
  return useQuery({
    queryKey: ['photos', siteId, params],
    queryFn: () => siteService.getProgressPhotos(siteId, params),
    enabled: !!siteId,
  })
}

export function useSiteAlerts(siteId) {
  return useQuery({
    queryKey: ['site-alerts', siteId],
    queryFn: () => siteService.getSiteAlerts(siteId),
    enabled: !!siteId,
  })
}

export function useCreateSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: siteService.createSite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sites'] })
      qc.invalidateQueries({ queryKey: ['overview-stats'] })
    },
  })
}

export function useUpdateSite(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => siteService.updateSite(siteId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site', siteId] })
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
  })
}

export function useAcknowledgeAlert(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (alertId) => siteService.acknowledgeAlert(siteId, alertId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-alerts', siteId] })
      qc.invalidateQueries({ queryKey: ['all-alerts'] })
    },
  })
}

export function useResolveAlert(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (alertId) => siteService.resolveAlert(siteId, alertId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-alerts', siteId] })
      qc.invalidateQueries({ queryKey: ['all-alerts'] })
    },
  })
}
