import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'

export function useReportHistory(params = {}) {
  return useQuery({
    queryKey: ['report-history', params],
    queryFn: () => reportService.getReportHistory(params),
    staleTime: 1000 * 15,
  })
}

export function useReportStatus(reportId, enabled = false) {
  return useQuery({
    queryKey: ['report-status', reportId],
    queryFn: () => reportService.getReportStatus(reportId),
    enabled: enabled && !!reportId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'ready' || status === 'failed' ? false : 2000
    },
  })
}
