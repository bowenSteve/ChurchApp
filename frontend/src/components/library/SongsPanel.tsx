import { useMemo, useState } from 'react'
import { useMassParts } from '../../hooks/useMassParts'
import { useCreateSong, useDeleteSong, useSongs, useUpdateSong } from '../../hooks/useSongs'
import type { Song, SongInput } from '../../types'
import SongForm from './SongForm'

export default function SongsPanel() {
  const { data: songs, isLoading } = useSongs()
  const { data: massParts } = useMassParts(true)
  const createSong = useCreateSong()
  const updateSong = useUpdateSong()
  const deleteSong = useDeleteSong()

  const [editing, setEditing] = useState<Song | 'new' | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!songs) return []
    const q = search.toLowerCase().trim()
    if (!q) return songs
    return songs.filter((s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
  }, [songs, search])

  const categories = useMemo(() => massParts?.map((p) => p.name) ?? [], [massParts])

  function handleSubmit(input: SongInput) {
    if (editing === 'new') {
      createSong.mutate(input)
    } else if (editing) {
      updateSong.mutate({ id: editing.id, input })
    }
    setEditing(null)
  }

  if (isLoading) return <p className="text-paper-dim">Loading songs…</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          className="field ml-auto w-64"
          placeholder="Search by title or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          + New Song
        </button>
      </div>

      {editing && (
        <SongForm
          initial={editing === 'new' ? undefined : editing}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No hymns in the library yet</p>
          <p>Add your first song to start building Sunday's Mass.</p>
        </div>
      ) : (
        <div className="panel panel-list">
          {filtered.map((song) => (
            <div key={song.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1">
                <div className="font-medium">{song.title}</div>
                <div className="text-xs text-paper-faint">
                  {song.category} · {song.verses.length} section(s)
                </div>
              </div>
              <button className="link-btn link-edit text-sm" onClick={() => setEditing(song)}>
                Edit
              </button>
              <button
                className="link-btn link-danger text-sm"
                onClick={() => {
                  if (confirm(`Delete "${song.title}"?`)) deleteSong.mutate(song.id)
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
