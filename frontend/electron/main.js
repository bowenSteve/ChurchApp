const { app, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

const isDev = !app.isPackaged
const BACKEND_PORT = process.env.CHURCH_PORT || '8001'
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`

let backendProcess = null
let operatorWindow = null
let displayWindow = null

// In dev, the backend is already running via the normal `uvicorn --reload`
// workflow (see start.txt) — only a packaged build needs Electron to manage
// its own copy, since there's no developer around to have started one.
function startBackend() {
  if (isDev) return

  const exeName = process.platform === 'win32' ? 'church_server.exe' : 'church_server'
  const exePath = path.join(process.resourcesPath, exeName)

  backendProcess = spawn(exePath, [], {
    env: {
      ...process.env,
      // Keep the database and uploaded images in the per-user data folder,
      // never inside the app's own install directory — an auto-update
      // replaces that directory wholesale and would wipe them otherwise.
      CHURCH_DATA_DIR: app.getPath('userData'),
      CHURCH_PORT: BACKEND_PORT,
    },
  })

  backendProcess.stdout?.on('data', (chunk) => console.log('[backend]', chunk.toString().trim()))
  backendProcess.stderr?.on('data', (chunk) => console.error('[backend]', chunk.toString().trim()))
  backendProcess.on('exit', (code) => console.log('[backend] exited with code', code))
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill()
  }
  backendProcess = null
}

function createOperatorWindow() {
  operatorWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  operatorWindow.loadURL(isDev ? 'http://localhost:5173' : BACKEND_URL)

  operatorWindow.on('closed', () => {
    operatorWindow = null
  })
}

app.whenReady().then(() => {
  startBackend()
  createOperatorWindow()
})

app.on('window-all-closed', () => {
  stopBackend()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', stopBackend)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createOperatorWindow()
})

// ── Screens ──────────────────────────────────────────────────────────────
// The renderer has no direct access to monitor info or window placement —
// both are main-process-only, reached through preload.js's narrow bridge.

ipcMain.handle('get-screens', () => {
  const primaryId = screen.getPrimaryDisplay().id
  return screen.getAllDisplays().map((display, index) => ({
    id: String(display.id),
    label: index === 0 ? 'Primary Display' : `Display ${index + 1}`,
    left: display.bounds.x,
    top: display.bounds.y,
    width: display.bounds.width,
    height: display.bounds.height,
    isPrimary: display.id === primaryId,
  }))
})

ipcMain.handle('open-display-window', (_event, { screenId, url }) => {
  const displays = screen.getAllDisplays()
  const target = displays.find((d) => String(d.id) === String(screenId)) || screen.getPrimaryDisplay()

  if (displayWindow && !displayWindow.isDestroyed()) {
    displayWindow.setFullScreen(false)
    displayWindow.setBounds(target.bounds)
    displayWindow.setFullScreen(true)
    displayWindow.loadURL(url)
    displayWindow.focus()
    return
  }

  displayWindow = new BrowserWindow({
    x: target.bounds.x,
    y: target.bounds.y,
    width: target.bounds.width,
    height: target.bounds.height,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  // Real, unconditional fullscreen — Electron has no browser-style gesture
  // restriction, unlike the web build's display page.
  displayWindow.setFullScreen(true)
  displayWindow.loadURL(url)
  displayWindow.on('closed', () => {
    displayWindow = null
  })
})
