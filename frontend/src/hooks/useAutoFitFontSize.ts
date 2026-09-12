import { useLayoutEffect, useState, type RefObject } from 'react'

const MIN_FONT_SIZE = 12

/**
 * Binary-searches the largest font size (up to maxFontSizePx) at which
 * contentRef's content still fits inside containerRef's box. Recomputes
 * whenever the text/font/max size changes, or the container is resized.
 */
export function useAutoFitFontSize(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  maxFontSizePx: number,
  text: string,
  fontFamily: string,
): number {
  const [fontSize, setFontSize] = useState(maxFontSizePx)
  const [resizeTick, setResizeTick] = useState(0)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => setResizeTick((t) => t + 1))
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef])

  useLayoutEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    function fits(size: number) {
      content!.style.fontSize = `${size}px`
      return content!.scrollWidth <= container!.clientWidth && content!.scrollHeight <= container!.clientHeight
    }

    if (fits(maxFontSizePx)) {
      setFontSize(maxFontSizePx)
      return
    }

    let low = MIN_FONT_SIZE
    let high = maxFontSizePx
    let best = MIN_FONT_SIZE
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (fits(mid)) {
        best = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    // With many wrapped lines, sub-pixel line-height rounding can accumulate
    // enough that the size the search just verified no longer fits on a
    // re-check — re-verify right before committing and step down if needed,
    // since the whole point of this hook is to guarantee no overflow.
    while (best > MIN_FONT_SIZE && !fits(best)) {
      best -= 1
    }

    setFontSize(best)
  }, [containerRef, contentRef, maxFontSizePx, text, fontFamily, resizeTick])

  return fontSize
}
