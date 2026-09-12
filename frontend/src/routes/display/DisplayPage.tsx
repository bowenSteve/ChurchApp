import { useEffect, useRef, useState } from 'react'
import SlideRenderer from '../../components/display/SlideRenderer'
import { useLiveState } from '../../context/LiveStateProvider'

export default function DisplayPage() {
  const { liveState, settings, connected } = useLiveState()
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement))
  const hasAutoAttempted = useRef(false)
  const armedFirstInteraction = useRef(false)

  function enterFullscreen() {
    document.documentElement.requestFullscreen().catch(() => {
      // Ignore — browser blocked it, the manual button stays available.
    })
  }

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  // Browsers only grant requestFullscreen() as a direct result of a real user
  // gesture (click/keydown) inside this exact document — opening this window
  // via window.open() from the operator, or a plain navigation, doesn't count.
  // So "automatic" fullscreen means: fullscreen on the very first interaction
  // the operator makes with this window (e.g. clicking it to focus it after
  // dragging it to the projector), not truly gesture-free.
  useEffect(() => {
    if (!settings?.auto_fullscreen || armedFirstInteraction.current) return
    armedFirstInteraction.current = true

    // Try immediately in case this load did carry a usable gesture.
    if (!hasAutoAttempted.current) {
      hasAutoAttempted.current = true
      enterFullscreen()
    }

    function onFirstInteraction() {
      if (!document.fullscreenElement) enterFullscreen()
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
    window.addEventListener('pointerdown', onFirstInteraction)
    window.addEventListener('keydown', onFirstInteraction)
    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
  }, [settings])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <SlideRenderer liveState={liveState} settings={settings} />
      {!isFullscreen && (
        <button
          className="btn btn-neutral absolute bottom-4 right-4 opacity-90"
          onClick={enterFullscreen}
        >
          Enter Fullscreen
        </button>
      )}
      {!connected && (
        <div className="banner-error absolute left-4 top-4">Disconnected — reconnecting…</div>
      )}
    </div>
  )
}
