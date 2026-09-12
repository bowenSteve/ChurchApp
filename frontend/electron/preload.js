const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  getScreens: () => ipcRenderer.invoke('get-screens'),
  openDisplayWindow: (screenId, url) => ipcRenderer.invoke('open-display-window', { screenId, url }),
})
