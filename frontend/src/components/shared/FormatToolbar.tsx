import { FORMAT_BUTTONS } from '../../lib/textFormatting'

interface Props {
  onFormat: (marker: string) => void
}

export default function FormatToolbar({ onFormat }: Props) {
  return (
    <div className="flex gap-1">
      {FORMAT_BUTTONS.map(({ label, marker, title, className }) => (
        <button
          key={label}
          type="button"
          title={title}
          className={`btn btn-neutral w-7 px-0 py-1 text-xs ${className}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFormat(marker)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
