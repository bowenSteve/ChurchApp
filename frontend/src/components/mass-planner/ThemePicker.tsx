import { useState } from 'react'
import type { MassPlan } from '../../types'
import { useUpdateMassPlan } from '../../hooks/useMassPlans'

export default function ThemePicker({ plan }: { plan: MassPlan }) {
  const updatePlan = useUpdateMassPlan()
  const [color, setColor] = useState(plan.theme_color ?? '#000000')
  const [bgUrl, setBgUrl] = useState(plan.theme_background_url ?? '')

  function save() {
    updatePlan.mutate({ id: plan.id, input: { theme_color: color, theme_background_url: bgUrl || null } })
  }

  return (
    <div className="panel flex items-center gap-3 p-3">
      <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-brass">Theme</span>
      <input type="color" className="h-8 w-10" value={color} onChange={(e) => setColor(e.target.value)} onBlur={save} />
      <input
        className="field flex-1 py-1 text-xs"
        placeholder="Background image URL (optional)"
        value={bgUrl}
        onChange={(e) => setBgUrl(e.target.value)}
        onBlur={save}
      />
    </div>
  )
}
