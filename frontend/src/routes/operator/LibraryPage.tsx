import { useRef, useState } from 'react'
import GalleryPanel from '../../components/library/GalleryPanel'
import SongsPanel from '../../components/library/SongsPanel'
import TextsPanel from '../../components/library/TextsPanel'
import { useExportLibrary, useImportLibrary } from '../../hooks/useLibraryTransfer'

type Tab = 'songs' | 'texts' | 'gallery'
type Feedback = { kind: 'success' | 'error'; message: string }

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>('songs')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const exportLibrary = useExportLibrary()
  const importLibrary = useImportLibrary()

  const tabs: { id: Tab; label: string }[] = [
    { id: 'songs', label: 'Songs' },
    { id: 'texts', label: 'Texts' },
    { id: 'gallery', label: 'Gallery' },
  ]

  function handleExport() {
    setFeedback(null)
    exportLibrary.mutate(undefined, {
      onSuccess: () => setFeedback({ kind: 'success', message: 'Library exported to a .zip file.' }),
      onError: (err) =>
        setFeedback({ kind: 'error', message: err instanceof Error ? err.message : 'Export failed.' }),
    })
  }

  function handleImportClick() {
    setFeedback(null)
    fileInputRef.current?.click()
  }

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    importLibrary.mutate(file, {
      onSuccess: (result) => {
        const parts = [
          `${result.songs_imported} song${result.songs_imported === 1 ? '' : 's'}`,
          `${result.texts_imported} text${result.texts_imported === 1 ? '' : 's'}`,
          `${result.gallery_items_imported} gallery item${result.gallery_items_imported === 1 ? '' : 's'}`,
        ]
        setFeedback({ kind: 'success', message: `Imported ${parts.join(', ')} as new entries.` })
      },
      onError: (err) =>
        setFeedback({ kind: 'error', message: err instanceof Error ? err.message : 'Import failed.' }),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-5">
          <h2 className="font-display text-2xl">Library</h2>
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`chip ${tab === t.id ? 'chip-active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={handleFileChosen}
          />
          <button className="btn btn-neutral" disabled={importLibrary.isPending} onClick={handleImportClick}>
            {importLibrary.isPending ? 'Importing…' : 'Import'}
          </button>
          <button className="btn btn-neutral" disabled={exportLibrary.isPending} onClick={handleExport}>
            {exportLibrary.isPending ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </div>

      {feedback && (
        <div className={feedback.kind === 'error' ? 'banner-error' : 'banner-success'}>{feedback.message}</div>
      )}

      {tab === 'songs' && <SongsPanel />}
      {tab === 'texts' && <TextsPanel />}
      {tab === 'gallery' && <GalleryPanel />}
    </div>
  )
}
