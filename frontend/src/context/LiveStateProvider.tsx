import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { LiveState, Settings } from '../types'

interface LiveContextValue {
  liveState: LiveState | null
  settings: Settings | null
  connected: boolean
}

const LiveContext = createContext<LiveContextValue>({
  liveState: null,
  settings: null,
  connected: false,
})

const WS_URL = import.meta.env.VITE_WS_URL
const RECONNECT_DELAY_MS = 2000

export function LiveStateProvider({ children }: { children: ReactNode }) {
  const [liveState, setLiveState] = useState<LiveState | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let cancelled = false
    let reconnectTimer: ReturnType<typeof setTimeout>

    function connect() {
      if (cancelled) return
      const ws = new WebSocket(WS_URL)
      socketRef.current = ws

      ws.onopen = () => setConnected(true)
      ws.onclose = () => {
        setConnected(false)
        if (!cancelled) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
      }
      ws.onerror = () => ws.close()
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type === 'live_state') setLiveState(message.payload)
        if (message.type === 'settings') setSettings(message.payload)
      }
    }

    connect()
    return () => {
      cancelled = true
      clearTimeout(reconnectTimer)
      socketRef.current?.close()
    }
  }, [])

  return (
    <LiveContext.Provider value={{ liveState, settings, connected }}>
      {children}
    </LiveContext.Provider>
  )
}

export function useLiveState() {
  return useContext(LiveContext)
}
