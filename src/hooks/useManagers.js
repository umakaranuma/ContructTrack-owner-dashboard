import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { managerService } from '../services/managerService'

// ─── useManagers Hook ──────────────────────────────────────────────────────────
// TanStack Query wrappers for manager data and mutations.
// ─────────────────────────────────────────────────────────────────────────────

export function useManagers(params = {}) {
  return useQuery({
    queryKey: ['managers', params],
    queryFn: () => managerService.getManagers(params),
  })
}

export function useManager(managerId) {
  return useQuery({
    queryKey: ['manager', managerId],
    queryFn: () => managerService.getManager(managerId),
    enabled: !!managerId,
  })
}

export function useManagerActivity(managerId, params = {}) {
  return useQuery({
    queryKey: ['manager-activity', managerId, params],
    queryFn: () => managerService.getManagerActivity(managerId, params),
    enabled: !!managerId,
  })
}

export function useAddManager() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ managerId, siteIds }) => managerService.addManager(managerId, siteIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['managers'] })
    },
  })
}

export function useSendInvite() {
  return useMutation({
    mutationFn: managerService.sendInvite,
  })
}

export function useAssignToSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ managerId, siteId }) => managerService.assignToSite(managerId, siteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['managers'] })
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
  })
}

export function useDeactivateManager() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: managerService.deactivateManager,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['managers'] })
    },
  })
}

export function useRemoveManager() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: managerService.removeManager,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['managers'] })
    },
  })
}
