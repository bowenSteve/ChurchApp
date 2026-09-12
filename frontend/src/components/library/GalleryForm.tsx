import { useState } from 'react'
import { useCreateMassPart } from '../../hooks/useMassParts'
import type { GalleryItem, GalleryItemInput } from '../../types'
import CategorySelect from './CategorySelect'
import ImageEditor from './ImageEditor'

interface Props {
  initial?: GalleryItem
  categories: string[]
  onSubmit: (input: GalleryItemInput) => void
  onCancel: () => void
}

export default function GalleryForm({ initial, categories, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [autoslideSeconds, setAutoslideSeconds] = useState(initial?.autoslide_seconds ?? 5)
  const [images, setImages] = useState<GalleryItemInput['images']>(
    initial?.images.map((img) => ({ order_index: img.order_index, url: img.url })) ?? [],
  )
  const createMassPart = useCreateMassPart()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || images.length === 0) return
    const finalCategory = category.trim() || 'Uncategorized'
    if (!categories.includes(finalCategory)) {
      createMassPart.mutate({ name: finalCategory })
    }
    onSubmit({
      title: title.trim(),
      category: finalCategory,
      autoslide_seconds: images.length > 1 ? autoslideSeconds : null,
      images,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-4">
      <div className="flex gap-3">
        <input
          className="field flex-1"
          placeholder="Gallery title (e.g. Parish Picnic 2026)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <CategorySelect categories={categories} value={category} onChange={setCategory} />
      </div>

      <ImageEditor images={images} onChange={setImages} />

      {images.length > 1 && (
        <label className="flex items-center gap-2 text-sm text-paper-dim">
          Auto-advance every
          <input
            type="number"
            min={1}
            className="field w-16"
            value={autoslideSeconds}
            onChange={(e) => setAutoslideSeconds(Math.max(1, Number(e.target.value)))}
          />
          seconds
        </label>
      )}

      {images.length === 0 && (
        <p className="text-xs text-paper-faint">Add at least one image before saving.</p>
      )}

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={images.length === 0}>
          Save
        </button>
        <button type="button" className="btn btn-neutral" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
