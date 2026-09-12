const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  getScreens: () => ipcRenderer.invoke('get-screens'),
  openDisplayWindow: (screenId, url) => ipcRenderer.invoke('open-display-window', { screenId, url }),

  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_event, data) => callback(data)),
  removeUpdateListener: () => ipcRenderer.removeAllListeners('update-status'),
})
