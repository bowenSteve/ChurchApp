import { useState } from 'react'
import type { MassPart } from '../../types'
import { useCreateMassPart, useMassParts } from '../../hooks/useMassParts'
import { useCreateMassPlanItem } from '../../hooks/useMassPlans'

interface Props {
  planId: number
  nextOrderIndex: number
}

export default function PartsPalette({ planId, nextOrderIndex }: Props) {
  const { data: parts } = useMassParts(true)
  const createPart = useCreateMassPart()
  const addItem = useCreateMassPlanItem(planId)
  const [newPartName, setNewPartName] = useState('')

  function addExisting(part: MassPart) {
    addItem.mutate({ mass_part_id: part.id, order_index: nextOrderIndex, content_type: 'blank' })
  }

  function addCustom() {
    const name = newPartName.trim()
    if (!name) return
    createPart.mutate(
      { name },
      {
        onSuccess: (part) => {
          addItem.mutate({ mass_part_id: part.id, order_index: nextOrderIndex, content_type: 'blank' })
        },
      },
    )
    setNewPartName('')
  }

  return (
    <div className="panel space-y-2 p-3">
      <div className="font-mono text-[11px] font-medium uppercase tracking-wide text-brass">Add a part</div>
      <div className="flex flex-wrap gap-2">
        {parts?.map((part) => (
          <button key={part.id} className="chip" onClick={() => addExisting(part)}>
            + {part.name}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <input
          className="field flex-1 py-1 text-xs"
          placeholder="Custom part name"
          value={newPartName}
          onChange={(e) => setNewPartName(e.target.value)}
        />
        <button className="btn btn-neutral btn-sm" onClick={addCustom}>
          Add
        </button>
      </div>
    </div>
  )
}
