import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { siteService } from '../services/siteService'

// ─── useSites Hook ─────────────────────────────────────────────────────────────
// TanStack Query wrappers for site-related data fetching and mutations.
// ─────────────────────────────────────────────────────────────────────────────

export function useSites(params = {}, options = {}) {
  return useQuery({
    queryKey: ['sites', params],
    queryFn: () => siteService.getSites(params),
    enabled: options.enabled !== false,
    staleTime: 1000 * 30,
  })
}

export function useSite(siteId, options = {}) {
  return useQuery({
    queryKey: ['site', siteId],
    queryFn: () => siteService.getSite(siteId),
    enabled: !!siteId && options.enabled !== false,
  })
}

export function useSiteFinancials(siteId, options = {}) {
  return useQuery({
    queryKey: ['site-financials', siteId],
    queryFn: () => siteService.getSiteFinancials(siteId),
    enabled: !!siteId && options.enabled !== false,
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

export function useDailyLogs(siteId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['daily-logs', siteId, params],
    queryFn: () => siteService.getDailyLogs(siteId, params),
    enabled: !!siteId && options.enabled !== false,
  })
}

export function useDailyLogDetail(siteId, logId) {
  return useQuery({
    queryKey: ['daily-log', siteId, logId],
    queryFn: () => siteService.getDailyLogDetail(siteId, logId),
    enabled: !!siteId && !!logId,
  })
}

export function useAttendance(siteId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['attendance', siteId, params],
    queryFn: () => siteService.getAttendance(siteId, params),
    enabled: !!siteId && options.enabled !== false,
  })
}

export function useBills(siteId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['bills', siteId, params],
    queryFn: () => siteService.getBills(siteId, params),
    enabled: !!siteId && options.enabled !== false,
  })
}

export function useProgressPhotos(siteId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['photos', siteId, params],
    queryFn: () => siteService.getProgressPhotos(siteId, params),
    enabled: !!siteId && options.enabled !== false,
  })
}

export function useSiteAlerts(siteId, options = {}) {
  return useQuery({
    queryKey: ['site-alerts', siteId],
    queryFn: () => siteService.getSiteAlerts(siteId),
    enabled: !!siteId && options.enabled !== false,
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

export function useSiteWorkers(siteId, options = {}) {
  return useQuery({
    queryKey: ['site-workers', siteId],
    queryFn: () => siteService.getWorkers(siteId),
    enabled: !!siteId && options.enabled !== false,
  })
}

export function useCreateBill(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => siteService.createBill(siteId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills', siteId] })
      qc.invalidateQueries({ queryKey: ['daily-logs', siteId] })
      qc.invalidateQueries({ queryKey: ['overview-stats'] })
    },
  })
}

export function useCreateDailyLog(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => siteService.createDailyLog(siteId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-logs', siteId] })
      qc.invalidateQueries({ queryKey: ['overview-stats'] })
    },
  })
}

export function useSubmitAttendance(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => siteService.submitAttendance(siteId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', siteId] })
      qc.invalidateQueries({ queryKey: ['daily-logs', siteId] })
      qc.invalidateQueries({ queryKey: ['daily-log', siteId] })
      qc.invalidateQueries({ queryKey: ['overview-stats'] })
    },
  })
}

export function useCreateWorker(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => siteService.createWorker(siteId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-workers', siteId] })
      qc.invalidateQueries({ queryKey: ['attendance', siteId] })
    },
  })
}
