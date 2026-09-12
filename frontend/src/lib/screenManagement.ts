export interface ScreenInfo {
  id: string
  label: string
  left: number
  top: number
  width: number
  height: number
  isPrimary: boolean
}

export interface ScreenProvider {
  isSupported(): boolean
  getScreens(): Promise<ScreenInfo[]>
  openDisplayWindow(screen: ScreenInfo, url: string): Promise<void>
}

// Minimal shape of the experimental Window Management API, not yet in lib.dom.d.ts.
interface ScreenDetailed {
  label: string
  left: number
  top: number
  width: number
  height: number
  isPrimary: boolean
}
interface ScreenDetails {
  screens: ScreenDetailed[]
}
interface WindowWithScreenDetails extends Window {
  getScreenDetails?: () => Promise<ScreenDetails>
}

export const webScreenProvider: ScreenProvider = {
  isSupported() {
    return typeof (window as WindowWithScreenDetails).getScreenDetails === 'function'
  },

  async getScreens() {
    const getScreenDetails = (window as WindowWithScreenDetails).getScreenDetails
    if (!getScreenDetails) return []
    const details = await getScreenDetails()
    return details.screens.map((s, index) => ({
      id: String(index),
      label: s.label || `Screen ${index + 1}`,
      left: s.left,
      top: s.top,
      width: s.width,
      height: s.height,
      isPrimary: s.isPrimary,
    }))
  },

  async openDisplayWindow(screen, url) {
    const features = `left=${screen.left},top=${screen.top},width=${screen.width},height=${screen.height}`
    window.open(url, 'church-display', features)
  },
}

// Electron build: the renderer has no direct access to monitor info or the
// ability to place a window on one — both go through the main process via
// the narrow API exposed in electron/preload.js. Real, unconditional
// fullscreen works here (no browser gesture restriction), unlike the web
// provider's window.open, which the display page still nudges into
// fullscreen itself on first click.
interface ElectronBridge {
  getScreens: () => Promise<ScreenInfo[]>
  openDisplayWindow: (screenId: string, url: string) => Promise<void>
}
interface WindowWithElectron extends Window {
  electron?: ElectronBridge
}

export const electronScreenProvider: ScreenProvider = {
  isSupported() {
    return typeof (window as WindowWithElectron).electron !== 'undefined'
  },

  async getScreens() {
    const electron = (window as WindowWithElectron).electron
    if (!electron) return []
    return electron.getScreens()
  },

  async openDisplayWindow(screen, url) {
    const electron = (window as WindowWithElectron).electron
    if (!electron) return
    await electron.openDisplayWindow(screen.id, url)
  },
}

export function getScreenProvider(): ScreenProvider {
  return typeof (window as WindowWithElectron).electron !== 'undefined'
    ? electronScreenProvider
    : webScreenProvider
}

const STORAGE_KEY = 'church-display-screen-id'

export function getSavedScreenId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveScreenId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // localStorage unavailable — screen assignment just won't persist across reloads
  }
}
