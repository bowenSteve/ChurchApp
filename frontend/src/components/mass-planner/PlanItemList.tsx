import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import type { GalleryItem, MassPlanItem, Song, TextItem } from '../../types'
import {
  useDeleteMassPlanItem,
  useReorderMassPlanItems,
  useUpdateMassPlanItem,
} from '../../hooks/useMassPlans'
import { useGoLive } from '../../hooks/useLiveControls'
import { useLiveState } from '../../context/LiveStateProvider'
import PlanItemEditor from './PlanItemEditor'
import { normalizeForDisplay, stripFormattingMarkers } from '../../lib/richText'

interface Props {
  planId: number
  items: MassPlanItem[]
  songs: Song[]
  texts: TextItem[]
  galleryItems: GalleryItem[]
}

function summarize(item: MassPlanItem): string {
  if (item.content_type === 'song') return item.song?.title ?? '(no song selected)'
  if (item.content_type === 'text') {
    if (item.text_item) return item.text_item.title
    if (!item.text_content) return '(no text yet)'
    return stripFormattingMarkers(normalizeForDisplay(item.text_content)).slice(0, 50)
  }
  if (item.content_type === 'gallery') {
    if (!item.gallery_item) return '(no gallery selected)'
    return `${item.gallery_item.title} (${item.gallery_item.images.length} image${
      item.gallery_item.images.length === 1 ? '' : 's'
    })`
  }
  return '(blank)'
}

interface RowProps {
  item: MassPlanItem
  planId: number
  songs: Song[]
  texts: TextItem[]
  galleryItems: GalleryItem[]
  isLive: boolean
  isEditing: boolean
  onToggleEdit: () => void
  onMove: (delta: number) => void
}

function SortablePlanItemRow({
  item,
  planId,
  songs,
  texts,
  galleryItems,
  isLive,
  isEditing,
  onToggleEdit,
  onMove,
}: RowProps) {
  const updateItem = useUpdateMassPlanItem(planId)
  const deleteItem = useDeleteMassPlanItem(planId)
  const goLive = useGoLive()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-[2px] border border-hairline px-3 py-2 ${isLive ? 'stripe-live' : 'bg-ink-900'}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab touch-none text-paper-faint hover:text-paper-dim active:cursor-grabbing"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <div className="w-40 shrink-0 font-medium">{item.mass_part.name}</div>
        <div className="flex-1 truncate text-sm text-paper-faint">{summarize(item)}</div>
        <button className="icon-action text-xs" onClick={() => onMove(-1)}>
          ↑
        </button>
        <button className="icon-action text-xs" onClick={() => onMove(1)}>
          ↓
        </button>
        <button className="link-btn link-edit text-xs" onClick={onToggleEdit}>
          Edit
        </button>
        <button
          className="btn btn-go-live btn-sm"
          onClick={() => goLive.mutate({ mass_plan_id: planId, item_id: item.id })}
        >
          Go Live
        </button>
        <button
          className="link-btn link-danger text-xs"
          onClick={() => {
            if (confirm(`Remove ${item.mass_part.name}?`)) deleteItem.mutate(item.id)
          }}
        >
          Remove
        </button>
      </div>
      {isEditing && (
        <PlanItemEditor
          item={item}
          songs={songs}
          texts={texts}
          galleryItems={galleryItems}
          onSave={(input) => updateItem.mutate({ itemId: item.id, input })}
          onClose={onToggleEdit}
        />
      )}
    </div>
  )
}

export default function PlanItemList({ planId, items, songs, texts, galleryItems }: Props) {
  const reorder = useReorderMassPlanItems(planId)
  const { liveState } = useLiveState()
  const [editingId, setEditingId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function commitOrder(newItems: MassPlanItem[]) {
    reorder.mutate(newItems.map((item, index) => ({ id: item.id, order_index: index })))
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    commitOrder(arrayMove(items, index, target))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    commitOrder(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortablePlanItemRow
              key={item.id}
              item={item}
              planId={planId}
              songs={songs}
              texts={texts}
              galleryItems={galleryItems}
              isLive={liveState?.item_id === item.id}
              isEditing={editingId === item.id}
              onToggleEdit={() => setEditingId(editingId === item.id ? null : item.id)}
              onMove={(delta) => move(index, delta)}
            />
          ))}
        </SortableContext>
      </DndContext>
      {items.length === 0 && (
        <div className="empty-state">
          <p className="empty-title">This Mass has no parts yet</p>
          <p>Add a part from the palette above, or duplicate a past Mass to start faster.</p>
        </div>
      )}
    </div>
  )
}
