import {
  useNextItem,
  useNextVerse,
  usePrevItem,
  usePrevVerse,
  useSetBlank,
} from '../../hooks/useLiveControls'
import { useLiveState } from '../../context/LiveStateProvider'
import { normalizeForDisplay, stripFormattingMarkers } from '../../lib/richText'

export default function LiveControlBar() {
  const { liveState, connected } = useLiveState()
  const nextVerse = useNextVerse()
  const prevVerse = usePrevVerse()
  const nextItem = useNextItem()
  const prevItem = usePrevItem()
  const setBlank = useSetBlank()

  const slide = liveState?.slide
  const isBlank = liveState?.is_blank ?? false

  return (
    <div className="panel flex items-center gap-4 px-4 py-3">
      <span className="pill" style={{ padding: '5px' }}>
        <span className={`dot ${connected ? 'dot-ok' : 'dot-live'}`} />
      </span>
      <div className="flex-1 truncate text-sm">
        {slide ? (
          <>
            <span className="font-medium text-paper">{slide.label}</span>
            {slide.total > 0 && (
              <span className="ml-2 font-mono text-xs tabular-nums text-paper-dim">
                {slide.index + 1}/{slide.total}
              </span>
            )}
            <span className="ml-2 text-paper-faint">
              — {stripFormattingMarkers(normalizeForDisplay(slide.text)).slice(0, 60)}
            </span>
          </>
        ) : (
          <span className="text-paper-faint">Nothing live</span>
        )}
      </div>
      <button className="btn btn-neutral btn-sm" onClick={() => prevItem.mutate()}>
        ⏮ Part
      </button>
      <button className="btn btn-neutral btn-sm" onClick={() => prevVerse.mutate()}>
        ◀ Prev
      </button>
      <button className="btn btn-neutral btn-sm" onClick={() => nextVerse.mutate()}>
        Next ▶
      </button>
      <button className="btn btn-neutral btn-sm" onClick={() => nextItem.mutate()}>
        Part ⏭
      </button>
      <button
        className={`btn btn-sm ${isBlank ? 'btn-toggle-on' : 'btn-neutral'}`}
        onClick={() => setBlank.mutate(!isBlank)}
      >
        {isBlank ? 'Unblank' : 'Blank'}
      </button>
    </div>
  )
}
