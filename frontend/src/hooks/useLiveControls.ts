import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { LiveState } from '../types'

export function useGoLive() {
  return useMutation({
    mutationFn: (input: { mass_plan_id: number; item_id: number; verse_index?: number }) =>
      api.post<LiveState>('/api/live/go-live', input),
  })
}

export function useNextVerse() {
  return useMutation({ mutationFn: () => api.post<LiveState>('/api/live/next-verse') })
}

export function usePrevVerse() {
  return useMutation({ mutationFn: () => api.post<LiveState>('/api/live/prev-verse') })
}

export function useNextItem() {
  return useMutation({ mutationFn: () => api.post<LiveState>('/api/live/next-item') })
}

export function usePrevItem() {
  return useMutation({ mutationFn: () => api.post<LiveState>('/api/live/prev-item') })
}

export function useSetBlank() {
  return useMutation({
    mutationFn: (blank: boolean) => api.post<LiveState>('/api/live/blank', { blank }),
  })
}
