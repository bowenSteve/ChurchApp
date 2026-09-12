import { useEffect, useMemo, useRef, useState } from 'react'
import { useDropdownDirection } from '../../hooks/useDropdownDirection'
import type { TextItem } from '../../types'

interface Props {
  texts: TextItem[]
  textId: number | null
  onChange: (textId: number | null) => void
}

export default function TextPicker({ texts, textId, onChange }: Props) {
  const selected = useMemo(() => texts.find((t) => t.id === textId) ?? null, [texts, textId])
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
    if (!q || isShowingSelectedLabel) return texts
    return texts.filter(
      (t) => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
    )
  }, [texts, query, selected])

  function selectText(text: TextItem) {
    onChange(text.id)
    setQuery(`${text.title} (${text.category})`)
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
          placeholder="Search by text title or category…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            if (textId !== null) onChange(null)
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
            <div className="px-3 py-2 text-sm text-paper-faint">No texts match.</div>
          )}
          {results.map((text) => (
            <button
              key={text.id}
              type="button"
              className="dropdown-item"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectText(text)}
            >
              {text.title} <span className="text-paper-faint">({text.category})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
