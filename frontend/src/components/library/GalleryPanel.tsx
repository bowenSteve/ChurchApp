import { useMemo, useState } from 'react'
import {
  useCreateGalleryItem,
  useDeleteGalleryItem,
  useGalleryItems,
  useUpdateGalleryItem,
} from '../../hooks/useGallery'
import { useMassParts } from '../../hooks/useMassParts'
import { resolveImageUrl } from '../../lib/api'
import type { GalleryItem, GalleryItemInput } from '../../types'
import GalleryForm from './GalleryForm'

export default function GalleryPanel() {
  const { data: items, isLoading } = useGalleryItems()
  const { data: massParts } = useMassParts(true)
  const createItem = useCreateGalleryItem()
  const updateItem = useUpdateGalleryItem()
  const deleteItem = useDeleteGalleryItem()

  const [editing, setEditing] = useState<GalleryItem | 'new' | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!items) return []
    const q = search.toLowerCase().trim()
    if (!q) return items
    return items.filter((g) => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q))
  }, [items, search])

  const categories = useMemo(() => massParts?.map((p) => p.name) ?? [], [massParts])

  function handleSubmit(input: GalleryItemInput) {
    if (editing === 'new') {
      createItem.mutate(input)
    } else if (editing) {
      updateItem.mutate({ id: editing.id, input })
    }
    setEditing(null)
  }

  if (isLoading) return <p className="text-paper-dim">Loading gallery…</p>

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
          + New Gallery
        </button>
      </div>

      {editing && (
        <GalleryForm
          initial={editing === 'new' ? undefined : editing}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No image galleries yet</p>
          <p>Add photos for an announcement slide, a feast day, or a parish event.</p>
        </div>
      ) : (
        <div className="panel panel-list">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              {item.images[0] && (
                <img
                  src={resolveImageUrl(item.images[0].url)}
                  alt=""
                  className="h-12 w-16 shrink-0 rounded-[2px] border border-hairline object-cover"
                />
              )}
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-paper-faint">
                  {item.category} · {item.images.length} image{item.images.length === 1 ? '' : 's'}
                  {item.images.length > 1 && item.autoslide_seconds
                    ? ` · every ${item.autoslide_seconds}s`
                    : ''}
                </div>
              </div>
              <button className="link-btn link-edit text-sm" onClick={() => setEditing(item)}>
                Edit
              </button>
              <button
                className="link-btn link-danger text-sm"
                onClick={() => {
                  if (confirm(`Delete "${item.title}"?`)) deleteItem.mutate(item.id)
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
