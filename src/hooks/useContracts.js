import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractService } from '../services/contractService'

export function useSiteContract(siteId) {
  return useQuery({
    queryKey: ['site-contract', siteId],
    queryFn:  () => contractService.getSiteContract(siteId),
    enabled:  !!siteId,
  })
}

export function useContractsSummary(params = {}) {
  return useQuery({
    queryKey: ['contracts-summary', params],
    queryFn:  () => contractService.getContractsSummary(params),
  })
}

export function useCreateContract(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => contractService.createContract(siteId, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['site-contract', siteId] }),
  })
}

export function useUpdateContract(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => contractService.updateContract(siteId, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['site-contract', siteId] }),
  })
}

export function useAddPaymentCert(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => contractService.addPaymentCert(siteId, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['site-contract', siteId] }),
  })
}

export function useUpdatePaymentCert(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ certId, ...payload }) => contractService.updatePaymentCert(siteId, certId, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['site-contract', siteId] }),
  })
}

export function useDeletePaymentCert(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (certId) => contractService.deletePaymentCert(siteId, certId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['site-contract', siteId] }),
  })
}

export function useCreateSubcontract(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => contractService.createSubcontract(siteId, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['site-contract', siteId] }),
  })
}

export function useUpdateSubcontract(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ subId, ...payload }) => contractService.updateSubcontract(siteId, subId, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['site-contract', siteId] }),
  })
}

export function useDeleteSubcontract(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (subId) => contractService.deleteSubcontract(siteId, subId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['site-contract', siteId] }),
  })
}

export function useAddSubcontractPayment(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ subId, ...payload }) => contractService.addSubcontractPayment(siteId, subId, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['site-contract', siteId] }),
  })
}

export function useDeleteSubcontractPayment(siteId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ subId, paymentId }) => contractService.deleteSubcontractPayment(siteId, subId, paymentId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['site-contract', siteId] }),
  })
}
