import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { MassPart } from '../types'

export function useMassParts(activeOnly = true) {
  return useQuery({
    queryKey: ['mass-parts', activeOnly],
    queryFn: () => api.get<MassPart[]>(`/api/mass-parts?active_only=${activeOnly}`),
  })
}

export function useCreateMassPart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; default_order?: number }) =>
      api.post<MassPart>('/api/mass-parts', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-parts'] }),
  })
}

export function useUpdateMassPart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<MassPart> }) =>
      api.put<MassPart>(`/api/mass-parts/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-parts'] }),
  })
}

export function useDeleteMassPart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<MassPart>(`/api/mass-parts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-parts'] }),
  })
}
