import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { GalleryItem, GalleryItemInput } from '../types'

export function useGalleryItems() {
  return useQuery({ queryKey: ['gallery'], queryFn: () => api.get<GalleryItem[]>('/api/gallery') })
}

export function useCreateGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: GalleryItemInput) => api.post<GalleryItem>('/api/gallery', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  })
}

export function useUpdateGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: GalleryItemInput }) =>
      api.put<GalleryItem>(`/api/gallery/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  })
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/api/gallery/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  })
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => api.upload<{ url: string }>('/api/uploads', file),
  })
}
