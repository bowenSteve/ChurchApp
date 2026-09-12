import { useRef, useState } from 'react'
import { useCreateMassPart } from '../../hooks/useMassParts'
import type { TextItem, TextItemInput } from '../../types'
import FontPicker from '../shared/FontPicker'
import FormatToolbar from '../shared/FormatToolbar'
import { wrapTextareaSelection } from '../../lib/textFormatting'
import CategorySelect from './CategorySelect'

interface Props {
  initial?: TextItem
  categories: string[]
  onSubmit: (input: TextItemInput) => void
  onCancel: () => void
}

export default function TextForm({ initial, categories, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [fontFamily, setFontFamily] = useState<string | null>(initial?.font_family ?? null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const createMassPart = useCreateMassPart()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const finalCategory = category.trim() || 'Uncategorized'
    if (!categories.includes(finalCategory)) {
      createMassPart.mutate({ name: finalCategory })
    }
    onSubmit({ title: title.trim(), category: finalCategory, content, font_family: fontFamily })
  }

  function applyFormat(marker: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    wrapTextareaSelection(textarea, marker, setContent)
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-4">
      <div className="flex gap-3">
        <input
          className="field flex-1"
          placeholder="Text title (e.g. First Reading — Genesis 1)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <CategorySelect categories={categories} value={category} onChange={setCategory} />
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <FormatToolbar onFormat={applyFormat} />
          <div className="ml-2">
            <FontPicker value={fontFamily} onChange={setFontFamily} />
          </div>
        </div>
        <textarea
          ref={textareaRef}
          className="field w-full"
          style={fontFamily ? { fontFamily } : undefined}
          rows={8}
          placeholder="Type the reading/prayer text. Separate slides with a blank line."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

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
