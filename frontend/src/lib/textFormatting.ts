export const FORMAT_BUTTONS = [
  { label: 'B', marker: '**', title: 'Bold', className: 'font-bold' },
  { label: 'I', marker: '_', title: 'Italic', className: 'italic' },
  { label: 'U', marker: '__', title: 'Underline', className: 'underline' },
] as const

export function wrapTextareaSelection(
  textarea: HTMLTextAreaElement,
  marker: string,
  onChange: (newValue: string) => void,
) {
  const { selectionStart, selectionEnd, value } = textarea
  const before = value.slice(0, selectionStart)
  const selected = value.slice(selectionStart, selectionEnd)
  const after = value.slice(selectionEnd)
  const newValue = `${before}${marker}${selected}${marker}${after}`
  onChange(newValue)

  const cursorStart = selectionStart + marker.length
  const cursorEnd = cursorStart + selected.length
  requestAnimationFrame(() => {
    textarea.focus()
    textarea.setSelectionRange(cursorStart, cursorEnd)
  })
}
