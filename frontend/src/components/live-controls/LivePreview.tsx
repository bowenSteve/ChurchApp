import { useMemo, useRef } from 'react'
import { useLiveState } from '../../context/LiveStateProvider'
import { useAutoFitFontSize } from '../../hooks/useAutoFitFontSize'
import { useGoLive, useNextVerse, usePrevVerse, useSetBlank } from '../../hooks/useLiveControls'
import { useMassPlan } from '../../hooks/useMassPlans'
import { resolveImageUrl } from '../../lib/api'
import { normalizeForDisplay, parseFormattedText } from '../../lib/richText'

// Scale factor between the real display window and this inline preview box,
// so font sizes read proportionally the same as they will on the projector.
const PREVIEW_SCALE = 0.24

interface Section {
  label: string
  index: number
}

export default function LivePreview() {
  const { liveState, settings } = useLiveState()
  const nextVerse = useNextVerse()
  const prevVerse = usePrevVerse()
  const setBlank = useSetBlank()
  const goLive = useGoLive()
  const stageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const slide = liveState?.slide
  const isBlank = liveState?.is_blank ?? false
  const hasLive = liveState?.item_id != null

  // Fetch whichever plan is actually live — not necessarily the one shown in
  // the date picker above — so section jump targets always match reality.
  const { data: livePlan } = useMassPlan(liveState?.mass_plan_id ?? null)
  const liveItem = livePlan?.items.find((i) => i.id === liveState?.item_id) ?? null

  const sections = useMemo<Section[]>(() => {
    if (!liveItem) return []
    if (liveItem.content_type === 'song' && liveItem.song) {
      return [...liveItem.song.verses]
        .sort((a, b) => a.order_index - b.order_index)
        .map((v, index) => ({ label: v.label, index }))
    }
    if (liveItem.content_type === 'text' && liveItem.text_content) {
      const pages = liveItem.text_content
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean)
      return pages.map((_, index) => ({ label: `Page ${index + 1}`, index }))
    }
    if (liveItem.content_type === 'gallery' && liveItem.gallery_item) {
      return liveItem.gallery_item.images.map((_, index) => ({ label: `Image ${index + 1}`, index }))
    }
    return []
  }, [liveItem])

  function jumpTo(index: number) {
    if (liveState?.mass_plan_id == null || liveState?.item_id == null) return
    goLive.mutate({ mass_plan_id: liveState.mass_plan_id, item_id: liveState.item_id, verse_index: index })
  }

  const bgColor = settings?.background_color ?? '#000000'
  const bgImage = settings?.background_image_url

  const boxStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    backgroundImage: bgImage ? `url(${bgImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    aspectRatio: '16 / 9',
  }

  const text = normalizeForDisplay(slide?.text ?? '')
  const fontFamily = slide?.font_family ?? settings?.font_family ?? 'Georgia, serif'
  const maxFontSize = (settings?.font_size_px ?? 48) * PREVIEW_SCALE
  const fontSize = useAutoFitFontSize(stageRef, textRef, maxFontSize, text, fontFamily)

  const textStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${fontSize}px`,
    textAlign: settings?.text_align ?? 'center',
    color: settings?.text_color ?? '#FFFFFF',
  }

  return (
    <div className="panel space-y-2 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-brass">
          Live Preview
        </span>
        {slide && slide.total > 0 && (
          <span className="font-mono text-xs tabular-nums text-paper-faint">
            {slide.label} · {slide.index + 1}/{slide.total}
            {slide.autoslide_seconds ? ` · every ${slide.autoslide_seconds}s` : ''}
          </span>
        )}
      </div>

      <div ref={stageRef} className="flex w-full items-center justify-center overflow-hidden rounded-[2px] border border-hairline" style={boxStyle}>
        {hasLive && !isBlank && slide?.image_url ? (
          <img
            key={slide.image_url}
            src={resolveImageUrl(slide.image_url)}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : hasLive && !isBlank && slide?.text ? (
          <div ref={textRef} className="px-4" style={textStyle}>
            {parseFormattedText(text)}
          </div>
        ) : (
          <span className="text-xs text-paper-faint">{hasLive ? 'Blanked' : 'Nothing live'}</span>
        )}
      </div>

      {sections.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {sections.map((s) => (
            <button
              key={s.index}
              type="button"
              className={`chip ${liveState?.verse_index === s.index ? 'chip-active' : ''}`}
              onClick={() => jumpTo(s.index)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button className="btn btn-neutral flex-1" onClick={() => prevVerse.mutate()} disabled={!hasLive}>
          ◀ Prev
        </button>
        <button className="btn btn-neutral flex-1" onClick={() => nextVerse.mutate()} disabled={!hasLive}>
          Next ▶
        </button>
        <button
          className={`btn ${isBlank ? 'btn-toggle-on' : 'btn-neutral'}`}
          onClick={() => setBlank.mutate(!isBlank)}
          disabled={!hasLive}
        >
          {isBlank ? 'Unblank' : 'Blank'}
        </button>
      </div>
    </div>
  )
}
