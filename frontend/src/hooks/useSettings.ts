import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Settings } from '../types'

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: () => api.get<Settings>('/api/settings') })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Settings>) => api.put<Settings>('/api/settings', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}
