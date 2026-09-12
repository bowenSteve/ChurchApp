import { useRef, useState } from 'react'
import FontPicker from '../shared/FontPicker'
import FormatToolbar from '../shared/FormatToolbar'
import { wrapTextareaSelection } from '../../lib/textFormatting'
import { normalizeForDisplay, parseFormattedText } from '../../lib/richText'
import { resolveImageUrl } from '../../lib/api'
import type { ContentType, GalleryItem, MassPlanItem, Song, TextItem } from '../../types'
import type { MassPlanItemInput } from '../../hooks/useMassPlans'
import GalleryPicker from './GalleryPicker'
import SongPicker from './SongPicker'
import TextPicker from './TextPicker'

interface Props {
  item: MassPlanItem
  songs: Song[]
  texts: TextItem[]
  galleryItems: GalleryItem[]
  onSave: (input: Partial<MassPlanItemInput>) => void
  onClose: () => void
}

export default function PlanItemEditor({ item, songs, texts, galleryItems, onSave, onClose }: Props) {
  const [contentType, setContentType] = useState<ContentType>(item.content_type)
  const [songId, setSongId] = useState<number | null>(item.song_id)
  const [textItemId, setTextItemId] = useState<number | null>(item.text_item_id)
  const [galleryItemId, setGalleryItemId] = useState<number | null>(item.gallery_item_id)
  const [text, setText] = useState(item.text_content ?? '')
  const [fontFamily, setFontFamily] = useState<string | null>(item.font_family)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const selectedText = textItemId ? texts.find((t) => t.id === textItemId) ?? null : null
  const selectedGallery = galleryItemId ? galleryItems.find((g) => g.id === galleryItemId) ?? null : null

  function handleSave() {
    onSave({
      content_type: contentType,
      song_id: contentType === 'song' ? songId : null,
      text_item_id: contentType === 'text' ? textItemId : null,
      gallery_item_id: contentType === 'gallery' ? galleryItemId : null,
      text_content: contentType === 'text' && !textItemId ? text : null,
      font_family: contentType === 'text' && !textItemId ? fontFamily : null,
    })
    onClose()
  }

  function applyFormat(marker: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    wrapTextareaSelection(textarea, marker, setText)
  }

  return (
    <div className="mt-3 space-y-4 rounded-[2px] border border-hairline bg-ink-950 p-4">
      <div className="flex gap-2">
        {(['song', 'text', 'gallery', 'blank'] as ContentType[]).map((ct) => (
          <button
            key={ct}
            type="button"
            className={`chip capitalize ${contentType === ct ? 'chip-active' : ''}`}
            onClick={() => setContentType(ct)}
          >
            {ct}
          </button>
        ))}
      </div>

      {contentType === 'song' && <SongPicker songs={songs} songId={songId} onChange={setSongId} />}

      {contentType === 'text' && (
        <div className="space-y-3">
          <TextPicker texts={texts} textId={textItemId} onChange={setTextItemId} />

          {selectedText ? (
            <div className="panel p-2 text-sm text-paper-dim">
              {parseFormattedText(normalizeForDisplay(selectedText.content))}
              <p className="mt-2 text-xs text-paper-faint">
                Using saved text from the library — edit it there to change the wording, or click Clear
                above to type something custom for just this Mass.
              </p>
            </div>
          ) : (
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
                rows={5}
                placeholder="Type reading/homily text. Separate slides with a blank line."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {contentType === 'gallery' && (
        <div className="space-y-3">
          <GalleryPicker items={galleryItems} galleryId={galleryItemId} onChange={setGalleryItemId} />

          {selectedGallery && (
            <div className="panel space-y-2 p-2">
              <div className="flex flex-wrap gap-2">
                {selectedGallery.images.map((img) => (
                  <img
                    key={img.id}
                    src={resolveImageUrl(img.url)}
                    alt=""
                    className="h-16 w-24 rounded-[2px] border border-hairline object-cover"
                  />
                ))}
              </div>
              <p className="text-xs text-paper-faint">
                {selectedGallery.images.length} image{selectedGallery.images.length === 1 ? '' : 's'}
                {selectedGallery.images.length > 1 && selectedGallery.autoslide_seconds
                  ? ` · auto-advances every ${selectedGallery.autoslide_seconds}s on the display`
                  : ''}
                . Edit the gallery in the Library to change images or timing.
              </p>
            </div>
          )}
        </div>
      )}

      {contentType === 'blank' && (
        <p className="text-sm text-paper-faint">No content — this part will show a blank slide.</p>
      )}

      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={handleSave}>
          Save
        </button>
        <button className="btn btn-neutral" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}
