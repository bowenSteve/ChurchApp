import type { ScreenInfo } from './screenManagement'

export type UpdateStatus =
  | { type: 'checking' }
  | { type: 'available'; version: string }
  | { type: 'not-available' }
  | { type: 'downloading'; percent: number }
  | { type: 'downloaded'; version: string }
  | { type: 'error'; message: string }
  | { type: 'dev-mode' }

// The full shape of window.electron, exposed by electron/preload.js. Kept in
// one place so every consumer (screen management, the updates UI) agrees on
// what's actually available, instead of each declaring its own subset.
export interface ElectronBridge {
  getScreens: () => Promise<ScreenInfo[]>
  openDisplayWindow: (screenId: string, url: string) => Promise<void>

  getAppVersion: () => Promise<string>
  checkForUpdates: () => Promise<void>
  downloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => void
  removeUpdateListener: () => void
}

interface WindowWithElectron extends Window {
  electron?: ElectronBridge
}

export function getElectronBridge(): ElectronBridge | null {
  return (window as WindowWithElectron).electron ?? null
}
