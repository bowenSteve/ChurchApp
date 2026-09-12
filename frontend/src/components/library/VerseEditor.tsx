import { useRef } from 'react'
import FontPicker from '../shared/FontPicker'
import FormatToolbar from '../shared/FormatToolbar'
import { wrapTextareaSelection } from '../../lib/textFormatting'
import type { SongInput } from '../../types'

type Verse = SongInput['verses'][number]

interface Props {
  verses: Verse[]
  onChange: (verses: Verse[]) => void
}

export default function VerseEditor({ verses, onChange }: Props) {
  const textareaRefs = useRef<Array<HTMLTextAreaElement | null>>([])

  function update(index: number, patch: Partial<Verse>) {
    const next = verses.map((v, i) => (i === index ? { ...v, ...patch } : v))
    onChange(next)
  }

  function remove(index: number) {
    onChange(reindex(verses.filter((_, i) => i !== index)))
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= verses.length) return
    const next = [...verses]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(reindex(next))
  }

  function duplicate(index: number) {
    const copy = { ...verses[index] }
    const next = [...verses.slice(0, index + 1), copy, ...verses.slice(index + 1)]
    onChange(reindex(next))
  }

  function addVerse() {
    onChange([
      ...verses,
      { order_index: verses.length, label: `Verse ${verses.length + 1}`, content: '', font_family: null },
    ])
  }

  function applyFormat(index: number, marker: string) {
    const textarea = textareaRefs.current[index]
    if (!textarea) return
    wrapTextareaSelection(textarea, marker, (content) => update(index, { content }))
  }

  return (
    <div className="space-y-3">
      {verses.map((verse, index) => (
        <div key={index} className="panel p-3">
          <div className="mb-2 flex items-center gap-2">
            <input
              className="field w-40"
              value={verse.label}
              onChange={(e) => update(index, { label: e.target.value })}
              placeholder="Label (e.g. Verse 1, Chorus)"
            />
            <div className="ml-auto flex items-center gap-3">
              <button type="button" className="icon-action text-xs" onClick={() => move(index, -1)}>
                ↑
              </button>
              <button type="button" className="icon-action text-xs" onClick={() => move(index, 1)}>
                ↓
              </button>
              <button type="button" className="link-btn link-edit text-xs" onClick={() => duplicate(index)}>
                Duplicate
              </button>
              <button type="button" className="link-btn link-danger text-xs" onClick={() => remove(index)}>
                Remove
              </button>
            </div>
          </div>
          <div className="mb-1 flex items-center gap-1">
            <FormatToolbar onFormat={(marker) => applyFormat(index, marker)} />
            <div className="ml-2">
              <FontPicker
                value={verse.font_family}
                onChange={(font_family) => update(index, { font_family })}
              />
            </div>
          </div>
          <textarea
            ref={(el) => {
              textareaRefs.current[index] = el
            }}
            className="field w-full"
            style={verse.font_family ? { fontFamily: verse.font_family } : undefined}
            rows={3}
            value={verse.content}
            onChange={(e) => update(index, { content: e.target.value })}
            placeholder="Lyrics for this section"
          />
        </div>
      ))}
      <button type="button" className="btn btn-neutral" onClick={addVerse}>
        + Add section
      </button>
    </div>
  )
}

function reindex(verses: Verse[]): Verse[] {
  return verses.map((v, i) => ({ ...v, order_index: i }))
}
