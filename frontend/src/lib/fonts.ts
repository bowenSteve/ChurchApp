// Curated system/web-safe fonts — no external loading, so the display keeps
// working even if the venue's internet drops mid-Mass. Covers common serif
// (traditional/liturgical feel) and sans-serif (readability at a distance)
// choices available on Windows, macOS, and Linux.
export const AVAILABLE_FONTS: string[] = [
  'Georgia, serif',
  'Times New Roman, serif',
  'Garamond, serif',
  'Palatino Linotype, serif',
  'Book Antiqua, serif',
  'Cambria, serif',
  'Constantia, serif',
  'Rockwell, serif',
  'Didot, serif',
  'Copperplate, serif',
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Trebuchet MS, sans-serif',
  'Segoe UI, sans-serif',
  'Calibri, sans-serif',
  'Century Gothic, sans-serif',
  'Franklin Gothic Medium, sans-serif',
  'Gill Sans, sans-serif',
  'Lucida Sans Unicode, sans-serif',
  'Courier New, monospace',
  'Consolas, monospace',
  'Lucida Console, monospace',
  'Brush Script MT, cursive',
  'Comic Sans MS, cursive',
  'Impact, fantasy',
  'Papyrus, fantasy',
]

export const DEFAULT_FONT = AVAILABLE_FONTS[0]

export function fontLabel(fontFamily: string): string {
  return fontFamily.split(',')[0].trim()
}
