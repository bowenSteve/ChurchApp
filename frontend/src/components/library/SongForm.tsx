import { useState } from 'react'
import { useCreateMassPart } from '../../hooks/useMassParts'
import type { Song, SongInput } from '../../types'
import CategorySelect from './CategorySelect'
import VerseEditor from './VerseEditor'

interface Props {
  initial?: Song
  categories: string[]
  onSubmit: (input: SongInput) => void
  onCancel: () => void
}

export default function SongForm({ initial, categories, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [verses, setVerses] = useState<SongInput['verses']>(
    initial?.verses.map((v) => ({
      order_index: v.order_index,
      label: v.label,
      content: v.content,
      font_family: v.font_family,
    })) ?? [{ order_index: 0, label: 'Verse 1', content: '', font_family: null }],
  )
  const createMassPart = useCreateMassPart()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const finalCategory = category.trim() || 'Uncategorized'
    if (!categories.includes(finalCategory)) {
      createMassPart.mutate({ name: finalCategory })
    }
    onSubmit({ title: title.trim(), category: finalCategory, verses })
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-4">
      <div className="flex gap-3">
        <input
          className="field flex-1"
          placeholder="Song title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <CategorySelect categories={categories} value={category} onChange={setCategory} />
      </div>
      <VerseEditor verses={verses} onChange={setVerses} />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <button type="button" className="btn btn-neutral" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
