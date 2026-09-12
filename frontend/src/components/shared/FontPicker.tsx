import { useEffect, useMemo, useRef, useState } from 'react'
import { useDropdownDirection } from '../../hooks/useDropdownDirection'
import { AVAILABLE_FONTS, fontLabel } from '../../lib/fonts'

interface Props {
  value: string | null
  onChange: (value: string | null) => void
}

export default function FontPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState(value ? fontLabel(value) : '')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const direction = useDropdownDirection(containerRef, isOpen)

  useEffect(() => {
    setQuery(value ? fontLabel(value) : '')
  }, [value])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const isShowingSelectedLabel = value && query === fontLabel(value)
    if (!q || isShowingSelectedLabel) return AVAILABLE_FONTS
    return AVAILABLE_FONTS.filter((f) => fontLabel(f).toLowerCase().includes(q))
  }, [query, value])

  function select(font: string) {
    onChange(font)
    setQuery(fontLabel(font))
    setIsOpen(false)
  }

  function clear() {
    onChange(null)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-1">
        <input
          className="field w-40 py-1 text-xs"
          placeholder="Default font"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            if (value !== null) onChange(null)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        />
        {value && (
          <button
            type="button"
            className="btn btn-neutral shrink-0 px-1.5 py-1 text-xs"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
            title="Use default font"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={`dropdown-panel absolute z-10 max-h-56 w-56 overflow-y-auto ${
            direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {results.length === 0 && (
            <div className="px-3 py-2 text-sm text-paper-faint">No fonts match.</div>
          )}
          {results.map((font) => (
            <button
              key={font}
              type="button"
              className="dropdown-item"
              style={{ fontFamily: font }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(font)}
            >
              {fontLabel(font)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
