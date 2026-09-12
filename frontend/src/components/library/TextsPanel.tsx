import { useMemo, useState } from 'react'
import { useMassParts } from '../../hooks/useMassParts'
import { useCreateText, useDeleteText, useTexts, useUpdateText } from '../../hooks/useTexts'
import { normalizeForDisplay, stripFormattingMarkers } from '../../lib/richText'
import type { TextItem, TextItemInput } from '../../types'
import TextForm from './TextForm'

export default function TextsPanel() {
  const { data: texts, isLoading } = useTexts()
  const { data: massParts } = useMassParts(true)
  const createText = useCreateText()
  const updateText = useUpdateText()
  const deleteText = useDeleteText()

  const [editing, setEditing] = useState<TextItem | 'new' | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!texts) return []
    const q = search.toLowerCase().trim()
    if (!q) return texts
    return texts.filter((t) => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
  }, [texts, search])

  const categories = useMemo(() => massParts?.map((p) => p.name) ?? [], [massParts])

  function handleSubmit(input: TextItemInput) {
    if (editing === 'new') {
      createText.mutate(input)
    } else if (editing) {
      updateText.mutate({ id: editing.id, input })
    }
    setEditing(null)
  }

  if (isLoading) return <p className="text-paper-dim">Loading texts…</p>

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
          + New Text
        </button>
      </div>

      {editing && (
        <TextForm
          initial={editing === 'new' ? undefined : editing}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No readings or prayers saved yet</p>
          <p>Add a reading, psalm, or prayer text to reuse it across Mass plans.</p>
        </div>
      ) : (
        <div className="panel panel-list">
          {filtered.map((text) => (
            <div key={text.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1">
                <div className="font-medium">{text.title}</div>
                <div className="text-xs text-paper-faint">
                  {text.category} · {stripFormattingMarkers(normalizeForDisplay(text.content)).slice(0, 60)}
                </div>
              </div>
              <button className="link-btn link-edit text-sm" onClick={() => setEditing(text)}>
                Edit
              </button>
              <button
                className="link-btn link-danger text-sm"
                onClick={() => {
                  if (confirm(`Delete "${text.title}"?`)) deleteText.mutate(text.id)
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
