import { useLayoutEffect, useState, type RefObject } from 'react'

/**
 * Decides whether a dropdown anchored to containerRef should open below or
 * above it, based on how much viewport space is actually available. Without
 * this, a dropdown near the bottom of a long page always opens downward and
 * gets clipped or pushed past the visible area.
 */
export function useDropdownDirection(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  estimatedHeight = 240,
): 'down' | 'up' {
  const [direction, setDirection] = useState<'down' | 'up'>('down')

  useLayoutEffect(() => {
    if (!isOpen) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    setDirection(spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? 'up' : 'down')
  }, [isOpen, containerRef, estimatedHeight])

  return direction
}
