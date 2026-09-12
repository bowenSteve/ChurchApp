import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { TextItem, TextItemInput } from '../types'

export function useTexts() {
  return useQuery({ queryKey: ['texts'], queryFn: () => api.get<TextItem[]>('/api/texts') })
}

export function useCreateText() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: TextItemInput) => api.post<TextItem>('/api/texts', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['texts'] }),
  })
}

export function useUpdateText() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TextItemInput }) =>
      api.put<TextItem>(`/api/texts/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['texts'] }),
  })
}

export function useDeleteText() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/api/texts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['texts'] }),
  })
}
