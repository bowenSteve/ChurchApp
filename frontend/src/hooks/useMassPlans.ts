import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { ContentType, MassPlan, MassPlanItem } from '../types'

export function useMassPlans(date?: string) {
  return useQuery({
    queryKey: ['mass-plans', date],
    queryFn: () => api.get<MassPlan[]>(`/api/mass-plans${date ? `?date=${date}` : ''}`),
  })
}

export function useMassPlan(id: number | null) {
  return useQuery({
    queryKey: ['mass-plans', 'detail', id],
    queryFn: () => api.get<MassPlan>(`/api/mass-plans/${id}`),
    enabled: id !== null,
  })
}

export function useCreateMassPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { date: string; label?: string }) =>
      api.post<MassPlan>('/api/mass-plans', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-plans'] }),
  })
}

export function useUpdateMassPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<MassPlan> }) =>
      api.put<MassPlan>(`/api/mass-plans/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-plans'] }),
  })
}

export function useDuplicateMassPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sourceId, date, label }: { sourceId: number; date: string; label?: string }) =>
      api.post<MassPlan>(`/api/mass-plans/${sourceId}/duplicate`, { date, label }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-plans'] }),
  })
}

export function useDeleteMassPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/api/mass-plans/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-plans'] }),
  })
}

export interface MassPlanItemInput {
  mass_part_id: number
  order_index: number
  content_type: ContentType
  song_id?: number | null
  text_item_id?: number | null
  gallery_item_id?: number | null
  text_content?: string | null
  font_family?: string | null
  notes?: string | null
}

export function useCreateMassPlanItem(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: MassPlanItemInput) =>
      api.post<MassPlanItem>(`/api/mass-plans/${planId}/items`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-plans'] }),
  })
}

export function useUpdateMassPlanItem(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: number; input: Partial<MassPlanItemInput> }) =>
      api.put<MassPlanItem>(`/api/mass-plans/${planId}/items/${itemId}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-plans'] }),
  })
}

export function useDeleteMassPlanItem(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) => api.delete<void>(`/api/mass-plans/${planId}/items/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-plans'] }),
  })
}

export function useReorderMassPlanItems(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: number; order_index: number }[]) =>
      api.put<MassPlanItem[]>(`/api/mass-plans/${planId}/items/reorder`, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mass-plans'] }),
  })
}
