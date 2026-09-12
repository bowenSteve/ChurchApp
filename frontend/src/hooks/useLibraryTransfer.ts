import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface LibraryImportResult {
  songs_imported: number
  texts_imported: number
  gallery_items_imported: number
}

export function useExportLibrary() {
  return useMutation({
    mutationFn: () =>
      api.download('/api/library/export', `mass-display-library-${new Date().toISOString().slice(0, 10)}.zip`),
  })
}

export function useImportLibrary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => api.upload<LibraryImportResult>('/api/library/import', file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['songs'] })
      qc.invalidateQueries({ queryKey: ['texts'] })
      qc.invalidateQueries({ queryKey: ['gallery'] })
      qc.invalidateQueries({ queryKey: ['mass-parts'] })
    },
  })
}
