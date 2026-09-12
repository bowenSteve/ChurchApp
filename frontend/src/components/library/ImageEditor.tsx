import { useRef } from 'react'
import { useUploadImage } from '../../hooks/useGallery'
import { resolveImageUrl } from '../../lib/api'
import type { GalleryItemInput } from '../../types'

type Image = GalleryItemInput['images'][number]

interface Props {
  images: Image[]
  onChange: (images: Image[]) => void
}

function reindex(images: Image[]): Image[] {
  return images.map((img, i) => ({ ...img, order_index: i }))
}

export default function ImageEditor({ images, onChange }: Props) {
  const uploadImage = useUploadImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(reindex(next))
  }

  function remove(index: number) {
    onChange(reindex(images.filter((_, i) => i !== index)))
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    const fileList = Array.from(files)
    e.target.value = ''

    // Upload all selected files, then commit them in one state update — doing
    // this per-file with parallel mutations would race, since each callback
    // would close over the same stale `images` array and the last one to
    // resolve would overwrite what the others had just added.
    const results = await Promise.allSettled(fileList.map((file) => uploadImage.mutateAsync(file)))
    const newImages = results
      .filter((r): r is PromiseFulfilledResult<{ url: string }> => r.status === 'fulfilled')
      .map((r) => ({ order_index: 0, url: r.value.url }))
    if (newImages.length > 0) {
      onChange(reindex([...images, ...newImages]))
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div key={image.url + index} className="w-32 space-y-1">
            <img
              src={resolveImageUrl(image.url)}
              alt={`Slide ${index + 1}`}
              className="h-24 w-32 rounded-[2px] border border-hairline object-cover"
            />
            <div className="flex items-center justify-center gap-3">
              <button type="button" className="icon-action text-xs" onClick={() => move(index, -1)}>
                ↑
              </button>
              <button type="button" className="icon-action text-xs" onClick={() => move(index, 1)}>
                ↓
              </button>
              <button type="button" className="link-btn link-danger text-xs" onClick={() => remove(index)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <button
        type="button"
        className="btn btn-neutral"
        disabled={uploadImage.isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploadImage.isPending ? 'Uploading…' : '+ Add Image(s)'}
      </button>
      {uploadImage.isError && (
        <p className="text-xs text-error">Upload failed — try a smaller image or a different file.</p>
      )}
    </div>
  )
}
