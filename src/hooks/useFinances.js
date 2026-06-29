import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'

// ─── useFinances Hook ──────────────────────────────────────────────────────────
// Multi-resource hook: useFinances('summary' | 'bills' | 'wages' | 'by-site', params)
// Used by Finances.jsx to fetch different slices of financial data.
// ─────────────────────────────────────────────────────────────────────────────

const RESOURCE_FN = {
  summary:  (p) => reportService.getFinancialSummary(p),
  bills:    (p) => reportService.getBillLog(p),
  wages:    (p) => reportService.getWageLedger(p),
  'by-site':(p) => reportService.getSpendBySite(p),
}

export function useFinances(resource, params = {}) {
  return useQuery({
    queryKey: ['finances', resource, params],
    queryFn:  () => (RESOURCE_FN[resource] ?? RESOURCE_FN.summary)(params),
    staleTime: 1000 * 30,
  })
}

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
