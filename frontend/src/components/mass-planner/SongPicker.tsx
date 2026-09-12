import { useEffect, useMemo, useRef, useState } from 'react'
import { useDropdownDirection } from '../../hooks/useDropdownDirection'
import type { Song } from '../../types'

interface Props {
  songs: Song[]
  songId: number | null
  onChange: (songId: number | null) => void
}

export default function SongPicker({ songs, songId, onChange }: Props) {
  const selected = useMemo(() => songs.find((s) => s.id === songId) ?? null, [songs, songId])
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
    if (!q || isShowingSelectedLabel) return songs
    return songs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
    )
  }, [songs, query, selected])

  function selectSong(song: Song) {
    onChange(song.id)
    setQuery(`${song.title} (${song.category})`)
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
          placeholder="Search by song title or category…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            if (songId !== null) onChange(null)
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
            <div className="px-3 py-2 text-sm text-paper-faint">No songs match.</div>
          )}
          {results.map((song) => (
            <button
              key={song.id}
              type="button"
              className="dropdown-item"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectSong(song)}
            >
              {song.title} <span className="text-paper-faint">({song.category})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
