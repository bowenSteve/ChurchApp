import { useState } from 'react'

const ADD_NEW = '__add_new__'

interface Props {
  categories: string[]
  value: string
  onChange: (value: string) => void
}

export default function CategorySelect({ categories, value, onChange }: Props) {
  const [isAddingNew, setIsAddingNew] = useState(false)

  if (isAddingNew) {
    return (
      <div className="flex w-48 gap-1">
        <input
          autoFocus
          className="field w-full"
          placeholder="New category name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-neutral shrink-0 px-2"
          onClick={() => {
            setIsAddingNew(false)
            onChange('')
          }}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <select
      className="field w-48"
      value={categories.includes(value) ? value : ''}
      onChange={(e) => {
        if (e.target.value === ADD_NEW) {
          setIsAddingNew(true)
          onChange('')
        } else {
          onChange(e.target.value)
        }
      }}
    >
      <option value="" disabled>
        Select a category…
      </option>
      {categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      <option value={ADD_NEW}>+ Add new category…</option>
    </select>
  )
}
