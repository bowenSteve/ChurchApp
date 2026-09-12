import { useEffect, useMemo, useRef, useState } from 'react'
import { useDropdownDirection } from '../../hooks/useDropdownDirection'
import type { GalleryItem } from '../../types'

interface Props {
  items: GalleryItem[]
  galleryId: number | null
  onChange: (galleryId: number | null) => void
}

export default function GalleryPicker({ items, galleryId, onChange }: Props) {
  const selected = useMemo(() => items.find((g) => g.id === galleryId) ?? null, [items, galleryId])
  const [query, setQuery] = useState(selected ? `${selected.title} (${selected.category})` : '')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const direction = useDropdownDirection(containerRef, isOpen)

  useEffect(() => {
    setQuery(selected ? `${selected.title} (${selected.category})` : '')
  }, [selected])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const isShowingSelectedLabel = selected && query === `${selected.title} (${selected.category})`
    if (!q || isShowingSelectedLabel) return items
    return items.filter(
      (g) => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q),
    )
  }, [items, query, selected])

  function select(item: GalleryItem) {
    onChange(item.id)
    setQuery(`${item.title} (${item.category})`)
    setIsOpen(false)
  }

  function clear() {
    onChange(null)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-2">
        <input
          className="field w-full"
          placeholder="Search by gallery title or category…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            if (galleryId !== null) onChange(null)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        />
        {selected && (
          <button type="button" className="btn btn-neutral btn-sm shrink-0" onMouseDown={(e) => e.preventDefault()} onClick={clear}>
            Clear
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={`dropdown-panel absolute z-10 max-h-72 w-full overflow-y-auto ${
            direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {results.length === 0 && (
            <div className="px-3 py-2 text-sm text-paper-faint">No galleries match.</div>
          )}
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              className="dropdown-item"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(item)}
            >
              {item.title}{' '}
              <span className="text-paper-faint">
                ({item.category}) · {item.images.length} image{item.images.length === 1 ? '' : 's'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
