import { useEffect, useMemo, useState } from 'react'
import LivePreview from '../../components/live-controls/LivePreview'
import PartsPalette from '../../components/mass-planner/PartsPalette'
import PlanItemList from '../../components/mass-planner/PlanItemList'
import ThemePicker from '../../components/mass-planner/ThemePicker'
import {
  useCreateMassPlan,
  useDeleteMassPlan,
  useDuplicateMassPlan,
  useMassPlans,
} from '../../hooks/useMassPlans'
import { useGalleryItems } from '../../hooks/useGallery'
import { useSongs } from '../../hooks/useSongs'
import { useTexts } from '../../hooks/useTexts'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function planLabel(p: { date: string; label: string | null }): string {
  return p.label ? `${p.date} — ${p.label}` : p.date
}

export default function MassPlannerPage() {
  const [date, setDate] = useState(today())
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const { data: allPlans, isLoading } = useMassPlans()
  const { data: songs } = useSongs()
  const { data: texts } = useTexts()
  const { data: galleryItems } = useGalleryItems()
  const createPlan = useCreateMassPlan()
  const duplicatePlan = useDuplicateMassPlan()
  const deletePlan = useDeleteMassPlan()
  const [label, setLabel] = useState('')
  const [sourcePlanId, setSourcePlanId] = useState<number | ''>('')

  const plansForDate = useMemo(
    () => (allPlans ?? []).filter((p) => p.date === date),
    [allPlans, date],
  )

  // Keep the selection in sync when the date changes or plans load: if the
  // currently selected plan no longer matches the chosen date, fall back to
  // the (only) plan for that date, or clear it if none/multiple exist.
  useEffect(() => {
    const stillValid = plansForDate.some((p) => p.id === selectedPlanId)
    if (stillValid) return
    setSelectedPlanId(plansForDate.length === 1 ? plansForDate[0].id : null)
  }, [plansForDate, selectedPlanId])

  const plan = useMemo(
    () => allPlans?.find((p) => p.id === selectedPlanId) ?? null,
    [allPlans, selectedPlanId],
  )

  function jumpToPlan(id: number) {
    const target = allPlans?.find((p) => p.id === id)
    if (!target) return
    setDate(target.date)
    setSelectedPlanId(id)
  }

  function handleDeletePlan() {
    if (!plan) return
    const itemCount = plan.items.length
    const confirmed = confirm(
      `Delete the Mass Plan for ${planLabel(plan)}? This removes all ${itemCount} part${
        itemCount === 1 ? '' : 's'
      } in it and cannot be undone.`,
    )
    if (!confirmed) return
    deletePlan.mutate(plan.id, { onSuccess: () => setSelectedPlanId(null) })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-display text-2xl">Mass Planner</h2>

        {allPlans && allPlans.length > 0 && (
          <select
            className="field"
            value={plan?.id ?? ''}
            onChange={(e) => jumpToPlan(Number(e.target.value))}
          >
            <option value="" disabled>
              Jump to a planned Mass…
            </option>
            {allPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {planLabel(p)}
              </option>
            ))}
          </select>
        )}

        <input
          type="date"
          className="field ml-auto"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {isLoading && <p className="text-paper-dim">Loading…</p>}

      {!isLoading && plansForDate.length > 1 && !plan && (
        <div className="panel space-y-2 p-4">
          <p className="text-sm text-paper-dim">Multiple Masses planned for {date} — pick one:</p>
          <div className="flex flex-wrap gap-2">
            {plansForDate.map((p) => (
              <button key={p.id} className="btn btn-neutral" onClick={() => setSelectedPlanId(p.id)}>
                {p.label ?? `Mass #${p.id}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isLoading && plansForDate.length === 0 && (
        <div className="panel space-y-3 p-4">
          <div className="flex items-center gap-2">
            <input
              className="field flex-1"
              placeholder="Label (e.g. 9:00 AM Mass)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={() =>
                createPlan.mutate(
                  { date, label: label || undefined },
                  { onSuccess: (created) => setSelectedPlanId(created.id) },
                )
              }
            >
              Create blank Mass Plan for {date}
            </button>
          </div>

          {allPlans && allPlans.length > 0 && (
            <div className="flex items-center gap-2 border-t border-hairline pt-3">
              <span className="text-sm text-paper-dim">or reuse:</span>
              <select
                className="field flex-1"
                value={sourcePlanId}
                onChange={(e) => setSourcePlanId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select a past Mass to copy…</option>
                {allPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {planLabel(p)} ({p.items.length} part{p.items.length === 1 ? '' : 's'})
                  </option>
                ))}
              </select>
              <button className="btn btn-neutral" disabled={!sourcePlanId} onClick={() => {
                  if (!sourcePlanId) return
                  duplicatePlan.mutate(
                    { sourceId: sourcePlanId, date, label: label || undefined },
                    { onSuccess: (created) => setSelectedPlanId(created.id) },
                  )
                }}
              >
                Duplicate into {date}
              </button>
            </div>
          )}
        </div>
      )}

      {plan && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-paper-dim">Viewing: {planLabel(plan)}</p>
              <button className="link-btn link-danger text-xs" onClick={handleDeletePlan}>
                Delete this Mass Plan
              </button>
            </div>
            <ThemePicker plan={plan} />
            <PartsPalette planId={plan.id} nextOrderIndex={plan.items.length} />
            <PlanItemList
              planId={plan.id}
              items={plan.items}
              songs={songs ?? []}
              texts={texts ?? []}
              galleryItems={galleryItems ?? []}
            />
          </div>
          <div className="lg:sticky lg:top-6 lg:col-span-2 lg:self-start">
            <LivePreview />
          </div>
        </div>
      )}
    </div>
  )
}
