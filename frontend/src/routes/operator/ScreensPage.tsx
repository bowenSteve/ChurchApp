import { useEffect, useState } from 'react'
import {
  getSavedScreenId,
  getScreenProvider,
  saveScreenId,
  type ScreenInfo,
} from '../../lib/screenManagement'

const screenProvider = getScreenProvider()

export default function ScreensPage() {
  const [screens, setScreens] = useState<ScreenInfo[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(getSavedScreenId())
  const [error, setError] = useState<string | null>(null)
  const supported = screenProvider.isSupported()

  async function detect() {
    setError(null)
    try {
      const found = await screenProvider.getScreens()
      setScreens(found)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect screens')
    }
  }

  useEffect(() => {
    if (supported) detect()
  }, [supported])

  function assign(screen: ScreenInfo) {
    setSelectedId(screen.id)
    saveScreenId(screen.id)
  }

  function launchDisplay() {
    const screen = screens.find((s) => s.id === selectedId)
    const url = `${window.location.origin}/display`
    if (screen) {
      screenProvider.openDisplayWindow(screen, url)
    } else {
      window.open(url, 'church-display')
    }
  }

  return (
    <div className="max-w-lg space-y-5">
      <h2 className="font-display text-2xl">Screens</h2>

      {!supported && (
        <p className="banner-warn">
          Multi-screen detection isn't supported here (Chrome/Edge, or the desktop app, is required).
          You can still open the display window and drag it to the projector manually.
        </p>
      )}

      {supported && (
        <>
          <button className="btn btn-neutral" onClick={detect}>
            Detect screens
          </button>
          {error && <p className="banner-error inline-block">{error}</p>}
          <div className="space-y-2">
            {screens.map((screen) => (
              <button
                key={screen.id}
                className={`block w-full rounded-[2px] border px-3 py-2 text-left text-sm transition-colors ${
                  selectedId === screen.id
                    ? 'stripe-selected border-hairline'
                    : 'border-hairline bg-ink-900 hover:bg-ink-800'
                }`}
                onClick={() => assign(screen)}
              >
                {screen.label} — {screen.width}×{screen.height}
                {screen.isPrimary ? ' (primary)' : ''}
              </button>
            ))}
          </div>
        </>
      )}

      <button className="btn btn-primary" onClick={launchDisplay}>
        Open Display Window
      </button>
    </div>
  )
}
