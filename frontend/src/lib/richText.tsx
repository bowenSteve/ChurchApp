import type { ReactNode } from 'react'

// Lightweight inline markup for lyrics: **bold**, __underline__, _italic_.
// Order matters — double-character markers must be tried before the
// single-underscore italic marker so "__x__" isn't read as "_" + "_x_" + "_".
// The "s" (dotAll) flag lets a marked span cross a line break — without it, a
// selection spanning multiple typed lines fails to close and leaks literal
// "**" characters instead of rendering bold.
const PATTERN = /(\*\*.+?\*\*|__.+?__|_.+?_)/gs

// Line breaks the operator typed (e.g. one Creed phrase per line) are useful
// while editing, but forcing every one of them as a hard break on the display
// wastes horizontal space when there are many short lines — the auto-fit
// sizer then has to shrink the font just to fit the line *count* vertically.
// Collapsing them to spaces lets the browser reflow the whole slide to fill
// the actual screen width, same as a normal paragraph would.
export function normalizeForDisplay(text: string): string {
  return text.replace(/\s*\n+\s*/g, ' ').trim()
}

// For truncated, single-line previews (status bars, list summaries) where we
// slice the string to a fixed length — parsing markup there risks cutting a
// marker pair in half and leaving a dangling "**" visible. Stripping the
// markers to plain text first avoids that entirely.
export function stripFormattingMarkers(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/__(.+?)__/gs, '$1')
    .replace(/_(.+?)_/gs, '$1')
}

export function parseFormattedText(text: string): ReactNode[] {
  return text
    .split(PATTERN)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <u key={i}>{part.slice(2, -2)}</u>
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        return <em key={i}>{part.slice(1, -1)}</em>
      }
      // Plain-text leftover: strip any stray unmatched "**"/"__" so a marker
      // whose partner fell outside this slide (e.g. a bold selection that
      // spanned across a slide break) never leaks as a literal asterisk.
      return part.replace(/\*\*|__/g, '')
    })
}
