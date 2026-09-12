import { useEffect, useState } from 'react'
import UpdateChecker from '../../components/settings/UpdateChecker'
import { useSettings, useUpdateSettings } from '../../hooks/useSettings'
import type { Settings } from '../../types'

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const [form, setForm] = useState<Settings | null>(null)

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  if (isLoading || !form) return <p className="text-paper-dim">Loading…</p>

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function save() {
    if (!form) return
    updateSettings.mutate({
      font_family: form.font_family,
      font_size_px: form.font_size_px,
      text_align: form.text_align,
      text_color: form.text_color,
      background_color: form.background_color,
      background_image_url: form.background_image_url,
      auto_fullscreen: form.auto_fullscreen,
    })
  }

  return (
    <div className="max-w-md space-y-5">
      <h2 className="font-display text-2xl">Display Settings</h2>

      <label className="block text-sm text-paper-dim">
        Font family
        <input
          className="field mt-1 w-full"
          value={form.font_family}
          onChange={(e) => set('font_family', e.target.value)}
        />
      </label>

      <label className="block text-sm text-paper-dim">
        Font size (px)
        <input
          type="number"
          className="field mt-1 w-full"
          value={form.font_size_px}
          onChange={(e) => set('font_size_px', Number(e.target.value))}
        />
      </label>

      <label className="block text-sm text-paper-dim">
        Text alignment
        <select
          className="field mt-1 w-full"
          value={form.text_align}
          onChange={(e) => set('text_align', e.target.value as Settings['text_align'])}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>

      <div className="flex gap-4">
        <label className="block text-sm text-paper-dim">
          Text color
          <input
            type="color"
            className="mt-1 block h-9 w-14"
            value={form.text_color}
            onChange={(e) => set('text_color', e.target.value)}
          />
        </label>
        <label className="block text-sm text-paper-dim">
          Background color
          <input
            type="color"
            className="mt-1 block h-9 w-14"
            value={form.background_color}
            onChange={(e) => set('background_color', e.target.value)}
          />
        </label>
      </div>

      <label className="block text-sm text-paper-dim">
        Background image URL (optional)
        <input
          className="field mt-1 w-full"
          value={form.background_image_url ?? ''}
          onChange={(e) => set('background_image_url', e.target.value)}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-paper-dim">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-[2px] border-hairline bg-ink-800"
          checked={form.auto_fullscreen}
          onChange={(e) => set('auto_fullscreen', e.target.checked)}
        />
        Automatically enter fullscreen on the display monitor
      </label>

      <button className="btn btn-primary" onClick={save}>
        Save Settings
      </button>

      <UpdateChecker />
    </div>
  )
}
