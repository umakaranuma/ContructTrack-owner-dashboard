import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'

// ─── useFinances Hook ──────────────────────────────────────────────────────────
// TanStack Query wrappers for financial data endpoints.
// ─────────────────────────────────────────────────────────────────────────────

export function useFinancialSummary(params = {}) {
  return useQuery({
    queryKey: ['financial-summary', params],
    queryFn: () => reportService.getFinancialSummary(params),
  })
}

export function useSpendBySite(params = {}) {
  return useQuery({
    queryKey: ['spend-by-site', params],
    queryFn: () => reportService.getSpendBySite(params),
  })
}

export function useBillLog(params = {}) {
  return useQuery({
    queryKey: ['bill-log', params],
    queryFn: () => reportService.getBillLog(params),
  })
}

export function useWageLedger(params = {}) {
  return useQuery({
    queryKey: ['wage-ledger', params],
    queryFn: () => reportService.getWageLedger(params),
  })
}
