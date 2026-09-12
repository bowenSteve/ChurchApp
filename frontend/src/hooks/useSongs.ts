import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Song, SongInput } from '../types'

export function useSongs() {
  return useQuery({ queryKey: ['songs'], queryFn: () => api.get<Song[]>('/api/songs') })
}

export function useCreateSong() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SongInput) => api.post<Song>('/api/songs', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['songs'] }),
  })
}

export function useUpdateSong() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SongInput }) =>
      api.put<Song>(`/api/songs/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['songs'] }),
  })
}

export function useDeleteSong() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/api/songs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['songs'] }),
  })
}
